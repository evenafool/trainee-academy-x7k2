// 好友：不用帳號、不用伺服器（免費）——每個人把自己的「好友卡代碼」傳給朋友，朋友貼上就加好友
//   ・代碼裡只有：暱稱、學到第幾集、星星、應援值、連續天數、造型、更新日期（沒有任何個人資料）
//   ・朋友的進度是「她傳代碼那一刻」的快照；朋友再傳一次新的代碼，就會更新
import * as store from './store.js';
import { LEVELS, CHAPTERS } from './course.js';
import { RANKS } from './data.js';
import { esc, ic, confetti, dayStr } from './util.js';
import { avatarState, autoOutfit } from './avatar.js';
import { currentUser, fetchFriendCards, accountHTML, bindAccount, shortCode, normShort, lookupShortCode, onChats, publicCard } from './cloud.js';

const PREFIX = 'TA1';
const DAYS = () => LEVELS.filter((l) => !l.boss);
const OUTFIT_OK = ['fan', 'trainee', 'debut', 'award'];

// UTF-8 安全的 base64url（中文暱稱也可以）
const toB64 = (str) => {
  let bin = '';
  for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64 = (b64) => {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};
// 簡單檢查碼：貼錯、少貼一段就會發現
const check = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36).slice(-4).padStart(4, '0');
};

function myId() {
  const s = store.get();
  if (!s.uid) {
    const a = new Uint8Array(6);
    crypto.getRandomValues(a);
    s.uid = [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 10);
    store.save();
  }
  return s.uid;
}

function rankName(xp) {
  let name = RANKS[0].name;
  for (const r of RANKS) if (xp >= r.xp) name = r.name;
  return name;
}

function streakNow(s) {
  if (!s.lastDay) return 0;
  return s.lastDay === store.today() || s.lastDay === dayStr(-1) ? s.streak : 0;
}

// 我自己現在的進度（做成好友卡）
export function myCard() {
  const s = store.get();
  const cleared = s.course?.cleared || {};
  const days = DAYS();
  const done = days.filter((l) => cleared[l.id] != null);
  const last = days.filter((l) => cleared[l.id] != null).pop();
  const a = avatarState();
  return {
    v: 1,
    id: myId(),
    n: (s.profile?.name || '練習生').slice(0, 12),
    d: done.length,
    t: last ? last.title : '',
    c: last ? last.ch : 0,
    s: Object.values(cleared).reduce((x, y) => x + (+y || 0), 0),
    x: s.xp || 0,
    k: streakNow(s),
    o: OUTFIT_OK.includes(a.outfit) ? a.outfit : autoOutfit(),
    at: store.today(),
    ...(currentUser() ? { u: currentUser().uid } : {}), // 登入的話，好友可以直接讀到最新進度
  };
}

export function encodeCard(card = myCard()) {
  const body = toB64(JSON.stringify(card));
  return `${PREFIX}.${body}.${check(body)}`;
}

// 好友卡資料檢查（外面來的資料一律整理過再存）
function clean(c) {
  return {
    id: String(c.id).slice(0, 16),
    n: String(c.n).slice(0, 12),
    d: Math.max(0, Math.min(999, +c.d || 0)),
    t: String(c.t || '').slice(0, 30),
    c: +c.c || 0,
    s: Math.max(0, +c.s || 0),
    x: Math.max(0, +c.x || 0),
    k: Math.max(0, +c.k || 0),
    o: OUTFIT_OK.includes(c.o) ? c.o : 'fan',
    at: /^\d{4}-\d{2}-\d{2}$/.test(c.at) ? c.at : store.today(),
    ...(/^[A-Za-z0-9]{10,40}$/.test(c.u || '') ? { u: c.u } : {}),
  };
}

// 從貼上的文字（可以是整段分享訊息）找出好友卡代碼
export function decodeCard(text) {
  const m = String(text || '').match(/TA1\.([A-Za-z0-9_-]{20,})\.([0-9a-z]{4})/);
  if (!m) return { err: '找不到好友卡代碼，請把朋友傳來的整段文字貼上來喔' };
  if (check(m[1]) !== m[2]) return { err: '代碼好像少了一段，請朋友重新傳一次' };
  try {
    const c = JSON.parse(fromB64(m[1]));
    if (c.v !== 1 || !c.id || !c.n) throw new Error('bad');
    return { card: clean(c) };
  } catch (e) {
    return { err: '這個代碼讀不出來，請朋友重新傳一次' };
  }
}

function friends() {
  const s = store.get();
  s.friends ??= {};
  return s.friends;
}

export const friendCount = () => Object.keys(store.get().friends || {}).length;
export const friendByUid = (u) => Object.values(store.get().friends || {}).find((c) => c.u === u) || null;
// 從雲端好友卡直接加好友（聊天室「加回好友」用）
export function saveFriendCard(card) {
  const c = clean(card);
  const f = friends();
  const old = f[c.id];
  f[c.id] = { ...c, added: old?.added || store.today(), nick: old?.nick, live: true };
  store.save();
}

const isShort = (text) => !/TA1\./.test(text) && /^[A-Z2-9]{6}$/.test(normShort(text));

// 加好友（已經是好友就更新進度）：可以輸入 6 碼好友碼，或貼上長代碼
export async function addFriend(text) {
  let r;
  if (isShort(text)) {
    if (!currentUser()) return { err: '6 碼好友碼要先用 Google 登入才能加喔（按上面的登入按鈕）' };
    r = await lookupShortCode(text).catch(() => ({ err: '網路好像斷了，等一下再試試' }));
    if (r.err) return r;
    if (!r.card?.id || !r.card?.n) return { err: '朋友的資料還沒準備好，請她打開一次練習生學院' };
    r = { card: { ...clean(r.card), live: true } };
  } else {
    r = decodeCard(text);
  }
  if (r.err) return r;
  if (r.card.id === myId()) return { err: '這是你自己的好友卡喔！要貼朋友傳來的代碼' };
  const f = friends();
  const old = f[r.card.id];
  if (old && old.at > r.card.at) return { err: `這張是比較舊的好友卡（${r.card.at}），${old.n} 的進度已經是 ${old.at} 的了` };
  f[r.card.id] = { ...r.card, added: old?.added || store.today(), nick: old?.nick };
  store.save();
  return { card: r.card, updated: !!old };
}

const shortShare = (sc) => `來當我在「練習生學院」的好友吧！✨\n我的好友碼：${sc}\n（打開練習生學院 →「我的」→「好友」輸入）`;
const shareText = (code) => `來當我在「練習生學院」的好友吧！✨\n打開練習生學院 →「我的」→「好友」→ 把這段貼上：\n${code}`;

const ago = (at) => {
  const diff = Math.round((new Date(store.today()) - new Date(at)) / 86400000);
  return diff <= 0 ? '今天更新' : diff === 1 ? '昨天更新' : `${diff} 天前更新`;
};
const chapterName = (c) => CHAPTERS.find((x) => x.id === c)?.title || '';

function cardHTML(c, { me = false } = {}) {
  const total = DAYS().length;
  const pct = Math.round((c.d / total) * 100);
  return `<div class="fr-card ${me ? 'me' : ''}" data-id="${esc(c.id)}">
    <img class="fr-av" src="assets/art/me-${esc(c.o)}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'">
    <div class="fr-info">
      <div class="fr-top"><b>${esc(c.nick || c.n)}</b>${me ? '<span class="fr-tag">我</span>' : ''}<small>${esc(rankName(c.x))}</small></div>
      <div class="fr-ep">${c.d ? `第 ${c.d} 集・${esc(c.t)}` : '還沒開始上課'}${c.c ? `<small>第 ${c.c} 章 ${esc(chapterName(c.c))}</small>` : ''}</div>
      <div class="fr-bar"><i style="width:${pct}%"></i></div>
      <div class="fr-stats">
        <span>${ic('star')} ${c.s}</span>
        <span>${ic('heart')} ${c.x}</span>
        <span>${ic('fire')} 連續 ${c.k} 天</span>
      </div>
      ${me ? '' : `<div class="fr-foot"><small>${ago(c.at)}</small><button class="fr-del" data-del="${esc(c.id)}" aria-label="刪除好友">刪除</button></div>
      ${c.u ? `<a class="btn small primary fr-chat" href="#/chat/${encodeURIComponent(c.u)}">${ic('chat')} 聊天<span class="fr-badge" data-unread="${esc(c.u)}" hidden></span></a>` : '<small class="fr-nochat">朋友用 Google 登入、再加一次好友碼後，就能聊天</small>'}`}
    </div>
  </div>`;
}

// ───────── QR Code：顯示自己的、用鏡頭掃朋友的 ─────────
const loadScript = (src) => new Promise((ok, ng) => {
  if (document.querySelector(`script[data-src="${src}"]`)) return ok();
  const el = document.createElement('script');
  el.src = src; el.dataset.src = src; el.onload = () => ok(); el.onerror = ng;
  document.head.appendChild(el);
});
const addUrl = (c) => `${location.origin}${location.pathname}#/friends/add/${encodeURIComponent(c)}`;
async function drawQR(host, text) {
  try {
    await loadScript('js/vendor/qrcode.js');
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    host.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  } catch (e) { host.remove(); }
}
// 從掃到的內容找出好友碼（網址、6 碼、長代碼都可以）
function codeFromScan(t) {
  const m = String(t).match(/#\/friends\/add\/([^\s?#]+)/);
  if (m) return decodeURIComponent(m[1]);
  return String(t).trim();
}
async function scanQR(toast) {
  if (!navigator.mediaDevices?.getUserMedia) { toast('這個瀏覽器不能開相機，請用手機的相機 App 掃'); return null; }
  const box = document.createElement('div');
  box.className = 'qr-scan';
  box.innerHTML = `<div class="qr-scan-in"><video playsinline muted></video><div class="qr-frame"></div><p>把朋友的 QR Code 放進框框裡</p><button class="btn" type="button">取消</button></div>`;
  document.body.appendChild(box);
  const video = box.querySelector('video');
  let stream = null;
  let done = false;
  const close = () => { done = true; stream?.getTracks().forEach((t) => t.stop()); box.remove(); };
  return new Promise(async (resolve) => {
    box.querySelector('button').onclick = () => { close(); resolve(null); };
    try {
      await loadScript('js/vendor/jsQR.js');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (done) { stream.getTracks().forEach((t) => t.stop()); return; }
      video.srcObject = stream;
      await video.play();
    } catch (e) {
      close();
      toast(e?.name === 'NotAllowedError' ? '沒有相機權限，可以在瀏覽器設定裡允許，或用手機的相機 App 掃' : '相機打不開，請用手機的相機 App 掃');
      resolve(null);
      return;
    }
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let last = 0;
    const tick = (t) => {
      if (done) return;
      if (t - last > 180 && video.videoWidth) {
        last = t;
        const w = 480, h = Math.round((video.videoHeight / video.videoWidth) * w);
        cv.width = w; cv.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const r = window.jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
        if (r?.data) { navigator.vibrate?.(60); close(); resolve(codeFromScan(r.data)); return; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// 好友頁 #/friends
export function renderFriends($app, backBar, toast, live = true, arg = '') {
  const mine = myCard();
  const code = encodeCard(mine);
  const sc = shortCode();
  const list = Object.values(friends()).sort((a, b) => b.d - a.d || b.x - a.x);
  $app.innerHTML = `
    ${backBar('#/me', '好友', ic('heart'))}
    ${accountHTML()}
    <h2 class="sec">我的好友卡</h2>
    ${cardHTML(mine, { me: true })}
    <div class="fr-code">
      ${sc ? `<p class="muted small">把你的好友碼告訴朋友，朋友用 Google 登入後輸入，就能互相看到進度。</p>
      <div class="fr-short" id="frShort" aria-label="我的好友碼">${esc(sc)}</div>
      <div class="fr-qr" id="frQR" aria-label="我的好友 QR Code"></div>
      <p class="muted small center">朋友用手機相機或 App 裡的「掃描 QR」掃這個，就能加你好友</p>
      <div class="row center">
        <button class="btn primary" id="frCopy">複製好友碼</button>
        ${navigator.share ? '<button class="btn" id="frShare">傳給朋友</button>' : ''}
      </div>
      <details class="fr-long"><summary>朋友沒有登入？用長代碼</summary>
        <code id="frCode">${esc(code)}</code>
        <div class="row center"><button class="btn" id="frCopyLong">複製長代碼</button></div>
      </details>`
      : `<p class="muted small">把下面的代碼傳給朋友（LINE、訊息都可以），朋友貼到她的練習生學院，就會看到你的進度。${currentUser() ? '' : '<br><b>用 Google 登入後，會變成好記的 6 碼好友碼。</b>'}</p>
      <div class="fr-qr" id="frQR" aria-label="我的好友 QR Code"></div>
      <p class="muted small center">朋友掃這個 QR Code 也可以加你好友</p>
      <code id="frCode">${esc(code)}</code>
      <div class="row center">
        <button class="btn primary" id="frCopy">複製代碼</button>
        ${navigator.share ? '<button class="btn" id="frShare">傳給朋友</button>' : ''}
      </div>`}
    </div>
    <h2 class="sec">加好友</h2>
    <form class="fr-add" id="frAdd">
      <textarea id="frInput" rows="2" placeholder="輸入朋友的 6 碼好友碼（例如 K7M2QX），或貼上長代碼" autocapitalize="characters" autocomplete="off" spellcheck="false"></textarea>
      <div class="row center fr-add-btns">
        <button class="btn" type="button" id="frScan">📷 掃描 QR</button>
        <button class="btn primary" type="submit">加好友</button>
      </div>
    </form>
    <div id="frIncoming"></div>
    <h2 class="sec">好友的進度 <small class="muted">${list.length ? `${list.length} 位` : ''}</small></h2>
    ${list.length ? list.map((c) => cardHTML(c)).join('') : '<div class="fr-empty muted">還沒有好友，先把你的好友碼傳給朋友吧！</div>'}
    <p class="muted small center fr-note">${currentUser() ? '你和好友都用 Google 登入的話，好友進度會自動更新（☁️）。好友還沒登入的，請她登入後再傳一次代碼。' : '好友的進度是她傳代碼那天的樣子。想看最新進度，請朋友再傳一次新的代碼，貼上就會更新；兩個人都用 Google 登入，就會自動更新。'}<br>好友卡只有暱稱和學習進度，不會傳出任何個人資料。</p>`;

  const copyText = async (text, sel) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('已複製！貼到 LINE 傳給朋友吧');
    } catch (e) {
      const r = document.createRange();
      r.selectNodeContents($app.querySelector(sel));
      const g = getSelection(); g.removeAllRanges(); g.addRange(r);
      toast('請長按反白的代碼，選「複製」');
    }
  };
  const copy = () => (sc ? copyText(shortShare(sc), '#frShort') : copyText(shareText(code), '#frCode'));
  const cl = $app.querySelector('#frCopyLong');
  if (cl) cl.onclick = () => copyText(shareText(code), '#frCode');
  bindAccount($app, toast, () => renderFriends($app, backBar, toast));
  // 未讀數、還不是好友卻傳訊息來的人
  $app._chatOff?.();
  $app._chatOff = onChats(async (sum) => {
    if (!$app.querySelector('#frIncoming')) { $app._chatOff?.(); return; }
    for (const b of $app.querySelectorAll('[data-unread]')) {
      const c = sum.list.find((x) => x.other === b.dataset.unread);
      b.hidden = !c?.unread;
    }
    const known = new Set(Object.values(friends()).map((c) => c.u).filter(Boolean));
    const strangers = sum.list.filter((c) => !known.has(c.other) && c.last?.f === c.other);
    const box = $app.querySelector('#frIncoming');
    if (!strangers.length) { box.innerHTML = ''; return; }
    const cards = (await Promise.all(strangers.slice(0, 5).map((c) => publicCard(c.other)))).filter(Boolean);
    if (!box.isConnected) return;
    box.innerHTML = cards.length ? `<h2 class="sec">有人想跟你當好友！</h2>${cards.map((c) => `<div class="fr-in"><img class="fr-in-av" src="assets/art/me-${esc(OUTFIT_OK.includes(c.o) ? c.o : 'fan')}.webp" alt=""><div class="grow"><b>${esc(String(c.n || '').slice(0, 12))}</b><small>第 ${+c.d || 0} 集・傳了訊息給你</small></div><a class="btn small" href="#/chat/${encodeURIComponent(c.u)}">看看</a><button class="btn small primary" data-addback="${esc(c.u)}">加好友</button></div>`).join('')}` : '';
    box.querySelectorAll('[data-addback]').forEach((btn) => {
      btn.onclick = () => {
        const c = cards.find((x) => x.u === btn.dataset.addback);
        if (!c) return;
        saveFriendCard(c);
        toast(`和 ${c.n} 成為好友了！`);
        confetti(40);
        renderFriends($app, backBar, toast);
      };
    });
  });
  // 登入的話：好友也登入過的，直接讀她最新的進度
  if (live && currentUser()) {
    const f = friends();
    const ids = Object.values(f).filter((c) => c.u).map((c) => c.u);
    fetchFriendCards(ids).then((got) => {
      let changed = false;
      for (const c of Object.values(f)) {
        const n = c.u && got[c.u];
        if (!n || n.id !== c.id) continue;
        const next = { ...c, n: String(n.n || c.n).slice(0, 12), d: +n.d || 0, t: String(n.t || ''), c: +n.c || 0, s: +n.s || 0, x: +n.x || 0, k: +n.k || 0, o: OUTFIT_OK.includes(n.o) ? n.o : c.o, at: n.at || c.at, live: true };
        if (JSON.stringify(next) !== JSON.stringify(c)) { f[c.id] = next; changed = true; }
      }
      if (changed) { store.save(); if (location.hash.startsWith('#/friends')) renderFriends($app, backBar, toast, false); }
    }).catch(() => {});
  }
  const qrHost = $app.querySelector('#frQR');
  if (qrHost) drawQR(qrHost, addUrl(sc || code));
  const $in = $app.querySelector('#frInput');
  const $form = $app.querySelector('#frAdd');
  $app.querySelector('#frScan').onclick = async () => {
    const got = await scanQR(toast);
    if (!got) return;
    $in.value = got;
    $form.requestSubmit();
  };
  // 用手機相機掃到 QR → 打開 #/friends/add/<代碼> → 自動帶入並加好友
  if (arg && arg.startsWith('add/')) {
    const got = decodeURIComponent(arg.slice(4));
    history.replaceState(null, '', '#/friends');
    $in.value = got;
    setTimeout(() => $form.requestSubmit(), 300);
  }
  $app.querySelector('#frCopy').onclick = copy;
  const sh = $app.querySelector('#frShare');
  if (sh) sh.onclick = () => navigator.share({ title: '練習生學院好友卡', text: sc ? shortShare(sc) : shareText(code) }).catch(() => {});
  $app.querySelector('#frAdd').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    const r = await addFriend($app.querySelector('#frInput').value);
    btn.disabled = false;
    if (r.err) { toast(r.err); return; }
    toast(r.updated ? `已更新 ${r.card.n} 的進度！` : `和 ${r.card.n} 成為好友了！`);
    if (!r.updated && r.card.u && currentUser()) import('./cloud.js').then((m) => m.sendMsg(r.card.u, { t: 'card', k: 'hi2' })).catch(() => {});
    if (!r.updated) confetti(40);
    renderFriends($app, backBar, toast);
    $app.querySelector(`.fr-card[data-id="${CSS.escape(r.card.id)}"]`)?.classList.add('fr-new');
  };
  $app.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = () => {
      const f = friends();
      const c = f[b.dataset.del];
      if (!c || !confirm(`要把 ${c.n} 從好友裡刪掉嗎？`)) return;
      delete f[b.dataset.del];
      store.save();
      renderFriends($app, backBar, toast);
    };
  });
}
