// 好友：不用帳號、不用伺服器（免費）——每個人把自己的「好友卡代碼」傳給朋友，朋友貼上就加好友
//   ・代碼裡只有：暱稱、學到第幾集、星星、應援值、連續天數、造型、更新日期（沒有任何個人資料）
//   ・朋友的進度是「她傳代碼那一刻」的快照；朋友再傳一次新的代碼，就會更新
import * as store from './store.js';
import { LEVELS, CHAPTERS } from './course.js';
import { RANKS } from './data.js';
import { esc, ic, confetti, dayStr } from './util.js';
import { avatarState, autoOutfit } from './avatar.js';

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
  };
}

export function encodeCard(card = myCard()) {
  const body = toB64(JSON.stringify(card));
  return `${PREFIX}.${body}.${check(body)}`;
}

// 從貼上的文字（可以是整段分享訊息）找出好友卡代碼
export function decodeCard(text) {
  const m = String(text || '').match(/TA1\.([A-Za-z0-9_-]{20,})\.([0-9a-z]{4})/);
  if (!m) return { err: '找不到好友卡代碼，請把朋友傳來的整段文字貼上來喔' };
  if (check(m[1]) !== m[2]) return { err: '代碼好像少了一段，請朋友重新傳一次' };
  try {
    const c = JSON.parse(fromB64(m[1]));
    if (c.v !== 1 || !c.id || !c.n) throw new Error('bad');
    return {
      card: {
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
      },
    };
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

// 加好友（已經是好友就更新進度）
export function addFriend(text) {
  const r = decodeCard(text);
  if (r.err) return r;
  if (r.card.id === myId()) return { err: '這是你自己的好友卡喔！要貼朋友傳來的代碼' };
  const f = friends();
  const old = f[r.card.id];
  if (old && old.at > r.card.at) return { err: `這張是比較舊的好友卡（${r.card.at}），${old.n} 的進度已經是 ${old.at} 的了` };
  f[r.card.id] = { ...r.card, added: old?.added || store.today(), nick: old?.nick };
  store.save();
  return { card: r.card, updated: !!old };
}

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
      ${me ? '' : `<div class="fr-foot"><small>${ago(c.at)}</small><button class="fr-del" data-del="${esc(c.id)}" aria-label="刪除好友">刪除</button></div>`}
    </div>
  </div>`;
}

// 好友頁 #/friends
export function renderFriends($app, backBar, toast) {
  const mine = myCard();
  const code = encodeCard(mine);
  const list = Object.values(friends()).sort((a, b) => b.d - a.d || b.x - a.x);
  $app.innerHTML = `
    ${backBar('#/me', '好友', ic('heart'))}
    <h2 class="sec">我的好友卡</h2>
    ${cardHTML(mine, { me: true })}
    <div class="fr-code">
      <p class="muted small">把下面的代碼傳給朋友（LINE、訊息都可以），朋友貼到她的練習生學院，就會看到你的進度。</p>
      <code id="frCode">${esc(code)}</code>
      <div class="row center">
        <button class="btn primary" id="frCopy">複製代碼</button>
        ${navigator.share ? '<button class="btn" id="frShare">傳給朋友</button>' : ''}
      </div>
    </div>
    <h2 class="sec">加好友</h2>
    <form class="fr-add" id="frAdd">
      <textarea id="frInput" rows="3" placeholder="把朋友傳來的好友卡代碼貼在這裡（整段訊息一起貼也可以）"></textarea>
      <button class="btn primary" type="submit">加好友</button>
    </form>
    <h2 class="sec">好友的進度 <small class="muted">${list.length ? `${list.length} 位` : ''}</small></h2>
    ${list.length ? list.map((c) => cardHTML(c)).join('') : '<div class="fr-empty muted">還沒有好友，先把你的代碼傳給朋友吧！</div>'}
    <p class="muted small center fr-note">好友的進度是她傳代碼那天的樣子。想看最新進度，請朋友再傳一次新的代碼，貼上就會更新。<br>好友卡只有暱稱和學習進度，不會傳出任何個人資料。</p>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(code));
      toast('已複製！貼到 LINE 傳給朋友吧');
    } catch (e) {
      const r = document.createRange();
      r.selectNodeContents($app.querySelector('#frCode'));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      toast('請長按反白的代碼，選「複製」');
    }
  };
  $app.querySelector('#frCopy').onclick = copy;
  const sh = $app.querySelector('#frShare');
  if (sh) sh.onclick = () => navigator.share({ title: '練習生學院好友卡', text: shareText(code) }).catch(() => {});
  $app.querySelector('#frAdd').onsubmit = (e) => {
    e.preventDefault();
    const r = addFriend($app.querySelector('#frInput').value);
    if (r.err) { toast(r.err); return; }
    toast(r.updated ? `已更新 ${r.card.n} 的進度！` : `和 ${r.card.n} 成為好友了！`);
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
