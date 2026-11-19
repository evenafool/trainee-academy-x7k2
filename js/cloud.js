// Google 帳號登入＋雲端備份＋好友進度自動更新（Firebase 免費方案）
//   ・不登入也能照常用，進度只存在這台裝置
//   ・登入後：整份進度備份到 users/<uid>（只有自己讀得到）
//            好友卡（暱稱＋學習進度）放在 public/<uid>（登入的人知道 uid 才讀得到，不能列出全部）
//   ・Firebase SDK 只有在要登入、或這台裝置登入過的時候才下載，不影響沒登入的人
import * as store from './store.js';

// Firebase 專案設定（網頁用的公開設定，本來就會出現在網頁裡；安全靠資料庫規則）
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCKYW4wsh47Ma02iiilCDd18-oNei-teGU',
  authDomain: 'trainee-academy.firebaseapp.com',
  projectId: 'trainee-academy',
  storageBucket: 'trainee-academy.firebasestorage.app',
  messagingSenderId: '809736552524',
  appId: '1:809736552524:web:aa625eabe0cb57bc80b4e9',
};

const V = '10.14.1';
const META = 'idolstudy.sync'; // 這台裝置的同步紀錄：{ uid, syncAt }
const meta = () => { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { return {}; } };
const setMeta = (m) => { try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) { /* 忽略 */ } };

export const cloudReady = () => !!FIREBASE_CONFIG;

// 6 碼好友碼（登入後才有）：避開容易看錯的 0/O、1/I/L
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
let myShort = meta().code || '';
export const shortCode = () => (user ? myShort : '');
export const normShort = (t) => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
async function ensureCode() {
  const { F, db } = fb;
  const pub = await F.getDoc(F.doc(db, 'public', user.uid));
  let code = pub.exists() ? pub.data().code || '' : '';
  for (let i = 0; !code && i < 8; i++) {
    const a = new Uint8Array(6);
    crypto.getRandomValues(a);
    const c = [...a].map((b) => ALPH[b % ALPH.length]).join('');
    // 已經被別人用走的話，規則不允許覆蓋 → 失敗就換一組
    try { await F.setDoc(F.doc(db, 'codes', c), { uid: user.uid }); code = c; } catch (e) { /* 換一組 */ }
  }
  myShort = code;
  setMeta({ ...meta(), code });
}
// 用 6 碼好友碼找到朋友的好友卡
export async function lookupShortCode(text) {
  if (!user || !fb) return { err: 'login' };
  const { F, db } = fb;
  const c = normShort(text);
  const m = await F.getDoc(F.doc(db, 'codes', c));
  if (!m.exists()) return { err: `找不到好友碼「${c}」，請再確認一次` };
  const uid = m.data().uid;
  if (uid === user.uid) return { err: '這是你自己的好友碼喔！要輸入朋友的' };
  const p = await F.getDoc(F.doc(db, 'public', uid));
  if (!p.exists()) return { err: '朋友的資料還沒準備好，請她打開一次練習生學院' };
  return { card: { ...p.data(), u: uid } };
}

let fb = null;
let user = null;
const listeners = new Set();
export const onUser = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const currentUser = () => user;
// 先複製一份再通知：通知過程中重畫畫面會掛上新的監聽，不能讓它在同一輪又被叫到（會無限重畫卡死）
const emit = () => [...listeners].forEach((fn) => { try { fn(user); } catch (e) { /* 忽略 */ } });

async function load() {
  if (fb) return fb;
  if (!FIREBASE_CONFIG) throw new Error('not-configured');
  const base = `https://www.gstatic.com/firebasejs/${V}`;
  const [A, U, F] = await Promise.all([import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`), import(`${base}/firebase-firestore.js`)]);
  const app = A.initializeApp(FIREBASE_CONFIG);
  const auth = U.getAuth(app);
  auth.languageCode = 'zh-TW';
  const db = F.getFirestore(app);
  fb = { A, U, F, app, auth, db };
  U.onAuthStateChanged(auth, async (u) => {
    user = u;
    if (u) { await syncOnLogin(u).catch(() => {}); }
    emit();
  });
  return fb;
}

// 開 App 時：這台登入過才載入 Firebase，恢復登入並同步
export function initCloud() {
  if (!FIREBASE_CONFIG || !meta().uid) return;
  load().catch(() => {});
}

export async function signIn() {
  // 程式庫要先載好：按下按鈕到開登入視窗中間不能等太久，不然會被瀏覽器當成廣告視窗擋掉
  if (!fb) {
    load().catch(() => {});
    return { err: '正在準備登入，請再按一次「用 Google 帳號登入」' };
  }
  const { U, auth } = fb;
  const provider = new U.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await U.signInWithPopup(auth, provider);
    return { ok: true };
  } catch (e) {
    const code = e?.code || '';
    if (code.includes('popup-closed') || code.includes('cancelled')) return { err: '登入取消了' };
    if (code.includes('popup-blocked')) return { err: '瀏覽器擋住了登入視窗，請允許彈出視窗後再試一次' };
    if (code.includes('unauthorized-domain')) return { err: '這個網址還沒加入 Firebase 允許的網域' };
    if (code.includes('operation-not-supported') || code.includes('web-storage')) return { err: '這個瀏覽器不能登入，請用 Safari 或 Chrome 打開網站再登入' };
    if (code.includes('network')) return { err: '網路好像斷了，等一下再試試' };
    return { err: `登入失敗（${code || e?.message || '未知'}）` };
  }
}

export async function signOutCloud() {
  if (!fb) return;
  await pushNow().catch(() => {});
  await fb.U.signOut(fb.auth);
  setMeta({});
  myShort = '';
  user = null;
  emit();
}

// ───────── 同步 ─────────
const summary = (s) => {
  const days = Object.keys(s?.course?.cleared || {}).filter((k) => k.startsWith('d')).length;
  return `第 ${days} 集、應援值 ${s?.xp || 0}`;
};
const hasProgress = (s) => !!s?.profile && ((s.xp || 0) > 0 || Object.keys(s.course?.cleared || {}).length > 0);

// 雲端備份那份：學習歷程太長就只留最近的，避免超過 Firestore 單筆 1MB 上限
function packState(s) {
  let copy = { ...s };
  let json = JSON.stringify(copy);
  if (json.length > 700000 && Array.isArray(copy.history)) {
    copy = { ...copy, history: copy.history.slice(-1200) };
    json = JSON.stringify(copy);
  }
  return json;
}

async function syncOnLogin(u) {
  const { F, db } = fb;
  const m = meta();
  const local = store.get();
  const snap = await F.getDoc(F.doc(db, 'users', u.uid));
  const cloud = snap.exists() ? JSON.parse(snap.data().state || 'null') : null;
  const cloudAt = snap.exists() ? snap.data().savedAt || 0 : 0;
  const localAt = local.savedAt || 0;

  let useCloud = false;
  if (!cloud) useCloud = false;
  else if (m.uid !== u.uid) {
    // 這台第一次用這個帳號
    if (!hasProgress(local)) useCloud = true;
    else if (cloudAt !== localAt) useCloud = confirm(`這個 Google 帳號在雲端已經有進度了：\n\n☁️ 雲端：${summary(cloud)}\n📱 這台：${summary(local)}\n\n要用「雲端」的進度嗎？\n（按取消＝用這台的進度覆蓋雲端）`);
  } else if (cloudAt > (m.syncAt || 0)) {
    // 別台裝置有新進度
    if (localAt <= (m.syncAt || 0)) useCloud = true; // 這台沒動過 → 直接用雲端
    else useCloud = confirm(`手機和其他裝置都有新的進度：\n\n☁️ 雲端：${summary(cloud)}\n📱 這台：${summary(local)}\n\n要用「雲端」的進度嗎？\n（按取消＝用這台的進度覆蓋雲端）`);
  }

  if (useCloud) {
    store.replaceAll(cloud);
    setMeta({ ...meta(), uid: u.uid, syncAt: cloudAt });
    location.reload();
    return;
  }
  setMeta({ ...meta(), uid: u.uid, syncAt: m.uid === u.uid ? m.syncAt || 0 : 0 });
  await ensureCode().catch(() => {});
  await pushNow();
}

let timer = 0;
let retry = 0;
let pending = false;
async function pushNow() {
  clearTimeout(timer);
  if (!fb || !user) return;
  const { F, db } = fb;
  const s = store.get();
  const savedAt = s.savedAt || Date.now();
  const { myCard } = await import('./friends.js');
  const card = myCard();
  try {
    await Promise.all([
      F.setDoc(F.doc(db, 'users', user.uid), { state: packState(s), savedAt }),
      F.setDoc(F.doc(db, 'public', user.uid), { n: card.n, d: card.d, t: card.t, c: card.c, s: card.s, x: card.x, k: card.k, o: card.o, at: card.at, id: card.id, ...(myShort ? { code: myShort } : {}) }),
    ]);
  } catch (e) {
    // 沒網路或暫時失敗：不用使用者處理，一分鐘後、或網路恢復時自動再試
    pending = true;
    clearTimeout(retry);
    retry = setTimeout(() => pushNow().catch(() => {}), 60000);
    showStatus();
    throw e;
  }
  pending = false;
  clearTimeout(retry);
  setMeta({ ...meta(), uid: user.uid, syncAt: savedAt, pushedAt: Date.now() });
  showStatus();
}

// 進度一有變動，過幾秒自動備份（連續作答時合併成一次，省免費額度）
store.onSave(() => {
  if (!user) return;
  pending = true;
  clearTimeout(timer);
  timer = setTimeout(() => pushNow().catch(() => {}), 6000);
});
// 關掉 App、切到別的 App、網路恢復時，有還沒上傳的就馬上備份
const flush = () => { if (user && pending) pushNow().catch(() => {}); };
addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
addEventListener('online', flush);

// 備份狀態（顯示在帳號區塊，每分鐘更新一次文字）
function statusText() {
  if (!navigator.onLine && pending) return '沒有網路，連上網路後會自動備份';
  if (pending) return '自動備份中…';
  const at = meta().pushedAt;
  if (!at) return '進度會自動備份';
  const min = Math.floor((Date.now() - at) / 60000);
  return `已自動備份・${min < 1 ? '剛剛' : min < 60 ? `${min} 分鐘前` : min < 1440 ? `${Math.floor(min / 60)} 小時前` : `${Math.floor(min / 1440)} 天前`}`;
}
function showStatus() {
  const el = document.getElementById('cloudStatus');
  if (el) el.textContent = statusText();
}
setInterval(showStatus, 60000);

// 讀好友最新的進度卡（好友也登入過才有）
export async function fetchFriendCards(uids) {
  if (!fb || !user || !uids.length) return {};
  const { F, db } = fb;
  const out = {};
  await Promise.all(uids.map(async (id) => {
    try {
      const d = await F.getDoc(F.doc(db, 'public', id));
      if (d.exists()) out[id] = d.data();
    } catch (e) { /* 讀不到就用舊的 */ }
  }));
  return out;
}

// ───────── 「我的」頁的帳號區塊 ─────────
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function accountHTML() {
  if (!FIREBASE_CONFIG) return '';
  const u = user;
  const busy = !u && meta().uid && !fb?.auth?.currentUser; // 登入過、正在恢復
  return `<div class="cloud-box" id="cloudBox">
    ${u ? `<div class="cloud-row"><span class="cloud-dot on"></span><div class="grow"><b>已用 Google 帳號登入</b><small>${escH(u.displayName || '')}・好友進度自動更新</small><small class="cloud-status" id="cloudStatus">${statusText()}</small></div><button class="btn ghost small cloud-out" id="cloudOut">登出</button></div>`
    : busy ? `<div class="cloud-row"><span class="cloud-dot"></span><div class="grow"><b>正在連線雲端…</b></div></div>`
    : `<div class="cloud-row"><span class="cloud-dot"></span><div class="grow"><b>雲端備份</b><small>用 Google 帳號登入：換手機也不怕進度不見，好友的進度也會自動更新</small></div></div>
      <button class="btn primary cloud-google" id="cloudIn"><span class="g-logo">G</span> 用 Google 帳號登入</button>`}
  </div>`;
}
export function bindAccount(root, toast, rerender) {
  const $ = (q) => root.querySelector(q);
  // 看到登入按鈕就先在背景載入 Firebase，按下去才能馬上開登入視窗
  if ($('#cloudIn') && !fb) load().catch(() => {});
  if ($('#cloudIn')) $('#cloudIn').onclick = async () => {
    $('#cloudIn').disabled = true;
    const r = await signIn().catch(() => ({ err: '登入失敗，等一下再試試' }));
    if (r.err) { toast(r.err); $('#cloudIn') && ($('#cloudIn').disabled = false); return; }
    toast('登入成功！進度已經備份到雲端');
  };
  if ($('#cloudOut')) $('#cloudOut').onclick = async () => {
    if (!confirm('要登出嗎？這台的進度會留著，只是不會再自動備份。')) return;
    await signOutCloud();
    toast('已登出');
  };
  // 登入狀態改變時重畫頁面：同一個畫面只留一個監聽（重畫時先拿掉舊的）
  root._cloudOff?.();
  const off = onUser(() => {
    off();
    if (!root.isConnected || !root.querySelector('#cloudBox')) return;
    rerender();
  });
  root._cloudOff = off;
}

// ───────── 好友聊天（只傳準備好的字卡 id、韓文字，規則在 tools/firestore.rules） ─────────
export const chatId = (a, b) => [a, b].sort().join('_');
const SEEN = 'idolstudy.chatSeen';
const seenMap = () => { try { return JSON.parse(localStorage.getItem(SEEN)) || {}; } catch (e) { return {}; } };
export function markSeen(cid) {
  const m = seenMap();
  m[cid] = Date.now();
  try { localStorage.setItem(SEEN, JSON.stringify(m)); } catch (e) { /* 忽略 */ }
  emitChats();
}
const tsOf = (v) => (v?.toMillis ? v.toMillis() : +v || 0);

let lastSend = 0;
export async function sendMsg(friendUid, msg) {
  if (!fb || !user) throw new Error('login');
  const now = Date.now();
  if (now - lastSend < 900) throw new Error('slow');
  lastSend = now;
  const { F, db } = fb;
  const m = [user.uid, friendUid].sort();
  const cid = m.join('_');
  const body = { f: user.uid, t: msg.t, k: msg.k || '', ...(msg.x != null ? { x: msg.x } : {}), ...(msg.ok != null ? { ok: !!msg.ok } : {}) };
  await F.setDoc(F.doc(db, 'chats', cid), { m, at: F.serverTimestamp(), last: { f: user.uid, t: msg.t, k: msg.k || '' } });
  await F.addDoc(F.collection(db, 'chats', cid, 'msgs'), { ...body, at: F.serverTimestamp() });
  markSeen(cid);
}
// 聊天室：即時收訊息（最近 80 則）
export function watchMsgs(friendUid, cb) {
  if (!fb || !user) return () => {};
  const { F, db } = fb;
  const cid = chatId(user.uid, friendUid);
  const q = F.query(F.collection(db, 'chats', cid, 'msgs'), F.orderBy('at'), F.limitToLast(80));
  return F.onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => { const v = d.data({ serverTimestamps: 'estimate' }); return { id: d.id, ...v, at: tsOf(v.at) }; }));
  }, () => cb(null));
}
// 所有聊天的最新狀態（未讀數、別人主動加我）
let chats = [];
let chatOff = null;
const chatListeners = new Set();
export const onChats = (fn) => { chatListeners.add(fn); fn(chatSummary()); return () => chatListeners.delete(fn); };
function chatSummary() {
  if (!user) return { list: [], unread: 0 };
  const seen = seenMap();
  const list = chats.map((c) => {
    const other = c.m.find((x) => x !== user.uid) || '';
    const at = tsOf(c.at);
    return { cid: c.id, other, at, last: c.last || {}, unread: !!(c.last && c.last.f !== user.uid && at > (seen[c.id] || 0)) };
  }).sort((a, b) => b.at - a.at);
  return { list, unread: list.filter((c) => c.unread).length };
}
function emitChats() { const s = chatSummary(); [...chatListeners].forEach((fn) => { try { fn(s); } catch (e) { /* 忽略 */ } }); }
function startChats() {
  chatOff?.();
  chats = [];
  if (!fb || !user) { emitChats(); return; }
  const { F, db } = fb;
  chatOff = F.onSnapshot(F.query(F.collection(db, 'chats'), F.where('m', 'array-contains', user.uid)), (snap) => {
    chats = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    emitChats();
  }, () => {});
}
onUser(() => startChats());
// 讀某個人的公開好友卡（聊天室抬頭、別人主動加我時用）
export async function publicCard(uid) {
  if (!fb || !user) return null;
  const { F, db } = fb;
  try { const d = await F.getDoc(F.doc(db, 'public', uid)); return d.exists() ? { ...d.data(), u: uid } : null; } catch (e) { return null; }
}
export const myUid = () => user?.uid || '';
