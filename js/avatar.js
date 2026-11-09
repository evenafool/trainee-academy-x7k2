// 主角（玩家自己）的造型、配件、寵物：跟著劇情破關慢慢解鎖；首頁站的是主角，進教室才是敏雅老師
// 美術：assets/art/me-<造型>.webp（全身）、assets/art/icons/item-<配件或寵物>.webp；還沒畫好的先用 emoji 代替
import * as store from './store.js';
import { esc, ic } from './util.js';

const cleared = (id) => (s) => !!s.course?.cleared?.[id];
const cert = (id) => (s) => !!s.exam?.certs?.[id];

export const OUTFITS = [
  { id: 'fan', name: '粉絲時期', desc: '粉色帽T＋百褶裙，追星少女的日常', how: '一開始就有', unlock: () => true },
  { id: 'trainee', name: '練習生', desc: '宿舍和練習室的練習服', how: '通過第四章 BOSS（首爾之旅）', unlock: cleared('b4') },
  { id: 'debut', name: '出道舞台裝', desc: '奶茶色＋白色的出道服', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
  { id: 'award', name: '頒獎典禮禮服', desc: '年末頒獎典禮的閃亮禮服', how: '通過第三季最終 BOSS（年末舞台）', unlock: cleared('b16') },
];
export const ITEMS = [
  { id: 'starclip', kind: 'acc', emoji: '⭐', name: '星星髮夾', how: '通過第一章 BOSS', unlock: cleared('b1') },
  { id: 'lightstick', kind: 'acc', emoji: '🪄', name: 'NOVA 應援棒', how: '看完第 4 天「NOVA 上台了」', unlock: cleared('d4') },
  { id: 'photocard', kind: 'acc', emoji: '🃏', name: '露娜小卡', how: '看完第 6 天「你的本命是誰」', unlock: cleared('d6') },
  { id: 'headset', kind: 'acc', emoji: '🎧', name: '練習耳麥', how: '看完第 14 天「再跳一次」', unlock: cleared('d14') },
  { id: 'ribbon', kind: 'acc', emoji: '🎀', name: '出道緞帶', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
  { id: 'trophy', kind: 'acc', emoji: '🏆', name: '一位獎盃', how: '看完第 36 天「第一個一位」', unlock: cleared('d36') },
  { id: 'crown', kind: 'acc', emoji: '👑', name: '認證皇冠', how: '拿到「英文 Lv1・國小畢業級」認證', unlock: cert('en300') },
  { id: 'moon', kind: 'acc', emoji: '🌙', name: '露娜同款月亮耳環', how: '拿到「韓文 Lv1」認證', unlock: cert('ko100') },
];
// 寵物＝吉祥物露露（露娜的小貓化身）：跟著劇情解鎖不同姿勢，在衣帽間挑一個陪在身邊
export const MASCOT_POSES = [
  { id: 'happy', name: '開心揮手', how: '一開始就有', unlock: () => true },
  { id: 'cheer', name: '應援加油', how: '看完第 4 天「NOVA 上台了」', unlock: cleared('d4') },
  { id: 'love', name: '尾巴比愛心', how: '看完第 6 天「你的本命是誰」', unlock: cleared('d6') },
  { id: 'think', name: '歪頭思考', how: '通過第一章 BOSS', unlock: cleared('b1') },
  { id: 'sleepy', name: '想睡覺', how: '看完第 16 天「早上六點」', unlock: cleared('d16') },
  { id: 'party', name: '撒彩帶慶祝', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
];

export function avatarState() {
  const s = store.get();
  s.avatar ??= { outfit: 'fan', acc: '', mascot: 'happy', seen: [] };
  s.avatar.mascot ??= 'happy';
  s.avatar.seen ??= [];
  return s.avatar;
}
export const isUnlocked = (x) => { try { return !!x.unlock(store.get()); } catch (e) { return false; } };
// 劇情進度到哪，預設就穿哪一套（沒自己換過的話）
export function autoOutfit() {
  const got = OUTFITS.filter(isUnlocked);
  return got[got.length - 1].id;
}
// 新解鎖、還沒看過的東西
export function newUnlocks() {
  const a = avatarState();
  // 劇情解鎖新造型（還沒看過）時，自動換上最新的那一套，讓首頁的角色跟著劇情變身
  const freshOutfit = [...OUTFITS].reverse().find((o) => o.id !== 'fan' && isUnlocked(o) && !a.seen.includes(o.id));
  if (freshOutfit && a.autoDressed !== freshOutfit.id) { a.outfit = freshOutfit.id; a.autoDressed = freshOutfit.id; store.save(); }
  return [...OUTFITS, ...ITEMS, ...MASCOT_POSES.map((m) => ({ ...m, id: `m-${m.id}` }))].filter((x) => isUnlocked(x) && x.id !== 'fan' && x.id !== 'm-happy' && !a.seen.includes(x.id));
}
export function markSeen() {
  const a = avatarState();
  for (const x of [...OUTFITS, ...ITEMS, ...MASCOT_POSES.map((m) => ({ ...m, id: `m-${m.id}` }))]) if (isUnlocked(x) && !a.seen.includes(x.id)) a.seen.push(x.id);
  store.save();
}

export const itemIcon = (it, cls = '') => `<img class="item-ic ${cls}" src="assets/art/icons/item-${it.id}.webp" alt="" onerror="this.outerHTML='<span class=&quot;item-ic item-fb ${cls}&quot;>${it.emoji}</span>'">`;
export const mascotImg = (mood = 'happy', cls = '') => `<img class="mascot ${cls}" src="assets/art/icons/mascot-${mood}.webp" alt="吉祥物露露" onerror="this.remove()">`;

// 主角立繪（含配件、寵物、吉祥物）；首頁和衣帽間共用
export function avatarHTML() {
  const a = avatarState();
  const o = OUTFITS.find((x) => x.id === a.outfit && isUnlocked(x)) ? a.outfit : autoOutfit();
  const ac = ITEMS.find((x) => x.id === a.acc && isUnlocked(x));
  const mood = MASCOT_POSES.find((m) => m.id === a.mascot && isUnlocked(m)) ? a.mascot : 'happy';
  return `
    <img class="me-outfit" src="assets/art/me-${o}.webp" alt="我的角色" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'">
    ${ac ? `<span class="me-acc">${itemIcon(ac)}</span>` : ''}
    <span class="me-mascot">${mascotImg(mood)}</span>`;
}

// ───────── 衣帽間 ─────────
export function renderCloset($app, backBar) {
  const a = avatarState();
  if (!OUTFITS.find((x) => x.id === a.outfit && isUnlocked(x))) a.outfit = autoOutfit();
  const fresh = new Set(newUnlocks().map((x) => x.id));
  markSeen();
  const tile = (x, kind) => {
    const on = isUnlocked(x);
    const eq = kind === 'outfit' ? a.outfit === x.id : kind === 'mascot' ? a.mascot === x.id : a[x.kind] === x.id;
    const pic = kind === 'outfit'
      ? `<img class="cl-outfit" src="assets/art/me-${x.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'">`
      : kind === 'mascot' ? mascotImg(x.id, 'big') : itemIcon(x, 'big');
    return `<button type="button" class="cl-tile ${on ? '' : 'locked'} ${eq ? 'on' : ''}" data-kind="${kind}" data-id="${x.id}" ${on ? '' : 'disabled'}>
      ${fresh.has(kind === 'mascot' ? `m-${x.id}` : x.id) ? '<span class="pz-new">NEW</span>' : ''}
      <span class="cl-pic">${pic}</span><b>${esc(x.name)}</b><small>${on ? (eq ? '穿戴中 ✓' : '點一下換上') : `${ic('lock')} ${esc(x.how)}`}</small></button>`;
  };
  $app.innerHTML = `
    ${backBar('#/home', '衣帽間')}
    <div class="closet">
      <div class="cl-preview"><div class="me-stage">${avatarHTML()}</div><p class="muted small">露露是露娜的小貓化身，是你的專屬寵物，一直陪著你！</p></div>
      <div class="cl-lists">
        <h2 class="sec">造型（跟著劇情變身）</h2><div class="cl-grid">${OUTFITS.map((x) => tile(x, 'outfit')).join('')}</div>
        <h2 class="sec">配件</h2><div class="cl-grid">${ITEMS.filter((x) => x.kind === 'acc').map((x) => tile(x, 'acc')).join('')}</div>
        <h2 class="sec">寵物：吉祥物露露的姿勢</h2><div class="cl-grid">${MASCOT_POSES.map((x) => tile(x, 'mascot')).join('')}</div>
      </div>
    </div>`;
  $app.querySelectorAll('.cl-tile:not(.locked)').forEach((b) => b.onclick = () => {
    const { kind, id } = b.dataset;
    if (kind === 'outfit') a.outfit = id;
    else if (kind === 'mascot') a.mascot = id;
    else a.acc = a.acc === id ? '' : id; // 再點一次就拿下來
    store.save();
    renderCloset($app, backBar);
  });
}
