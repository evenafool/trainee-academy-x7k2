// 每日獎勵：每上完一天課發一個收藏品（虛構偶像小卡或應援周邊），事先公開、不抽卡
// 有 assets/art/card-<成員>.webp 就用插圖，沒有就用設計好的卡面
import { LEVELS, KEEPSAKES } from './course.js';

export const MEMBERS = [
  { id: 'luna', name: '露娜', ko: '루나', group: 'NOVA', role: '隊長・主唱', color: '#6c4bd8', emoji: '🌙', hello: '오늘도 화이팅!', zh: '今天也加油！' },
  { id: 'hana', name: '哈娜', ko: '하나', group: 'NOVA', role: '主舞', color: '#f06595', emoji: '🌸', hello: '같이 춤춰요!', zh: '一起跳舞吧！' },
  { id: 'riri', name: '莉莉', ko: '리리', group: 'NOVA', role: '忙內・Rapper', color: '#f59f00', emoji: '🍊', hello: '공부도 열심히!', zh: '讀書也要認真！' },
  { id: 'sena', name: '瑟娜', ko: '세나', group: 'NOVA', role: '主唱', color: '#4dabf7', emoji: '✨', hello: '꿈을 믿어요!', zh: '相信夢想！' },
  { id: 'yuri', name: '柚莉', ko: '유리', group: 'NOVA', role: '門面', color: '#20c997', emoji: '🍀', hello: '내일 또 만나요!', zh: '明天見！' },
  { id: 'jun', name: '準', ko: '준', group: 'BLUEWAVE', role: '隊長', color: '#364fc7', emoji: '🐺', hello: '포기하지 마!', zh: '不要放棄！' },
  { id: 'taeo', name: '泰奧', ko: '태오', group: 'BLUEWAVE', role: '主唱', color: '#e8590c', emoji: '🦊', hello: '고마워요!', zh: '謝謝你！' },
  { id: 'ray', name: '瑞', ko: '레이', group: 'BLUEWAVE', role: '主舞', color: '#1098ad', emoji: '🌊', hello: '같이 연습해요!', zh: '一起練習吧！' },
];

const CONCEPTS = ['出道', '校服', '舞台', '夏日', '練習室', '冬日', '生日'];

export const MERCH = [
  { id: 'lightstick', name: 'NOVA 星星應援棒', emoji: '🪄', desc: '演唱會必備！按下會發出粉紫色的光' },
  { id: 'slogan', name: '應援手幅', emoji: '🎏', desc: '寫著「露娜 화이팅」的應援手幅' },
  { id: 'towel', name: '應援毛巾', emoji: '🧣', desc: '跳舞流汗也不怕的應援毛巾' },
  { id: 'keyring', name: '壓克力鑰匙圈', emoji: '🔑', desc: '掛在書包上，每天都能看到本命' },
  { id: 'poster', name: '回歸海報', emoji: '🖼️', desc: '新專輯的限定海報' },
  { id: 'pin', name: '團徽別針', emoji: '📍', desc: '別在外套上的閃亮團徽' },
  { id: 'sticker', name: '貼紙組', emoji: '💟', desc: '貼在課本上的可愛貼紙' },
  { id: 'album', name: '出道專輯', emoji: '💿', desc: 'NOVA 的出道專輯（實體版）' },
  { id: 'polaroid', name: '簽名拍立得', emoji: '📸', desc: '有成員簽名的拍立得照片' },
  { id: 'bracelet', name: '應援手環', emoji: '📿', desc: '演唱會入場送的發光手環' },
  { id: 'fanletter', name: '偶像回信', emoji: '💌', desc: '收到一封偶像寫給你的回信' },
  { id: 'ticket', name: '見面會門票', emoji: '🎫', desc: '粉絲見面會的入場券' },
];

// 第 n 天（從 1 開始）的獎勵：單數天小卡、雙數天周邊；每 7 天 SR，每 30 天 SSR
export function rewardForDay(n) {
  // 有寫劇情的日子：發跟那一集呼應的劇照或回憶小物
  const lv = LEVELS.filter((l) => !l.boss)[n - 1];
  const k = lv && KEEPSAKES[lv.id];
  if (k) return { id: `keep-${lv.id}`, kind: k.kind === 'scene' ? 'scene' : 'keep', level: lv.id, name: k.name, emoji: k.emoji, desc: k.desc, rarity: k.rarity };
  const rarity = n % 30 === 0 ? 'SSR' : n % 7 === 0 ? 'SR' : 'R';
  if (n % 2 === 1) {
    const k = (n - 1) / 2;
    const m = MEMBERS[k % MEMBERS.length];
    const concept = rarity === 'SSR' ? '生日' : CONCEPTS[Math.floor(k / MEMBERS.length) % (CONCEPTS.length - 1)];
    return { id: `card-${m.id}-${concept}`, kind: 'card', member: m.id, concept, rarity, name: `${m.name}・${concept}小卡` };
  }
  const it = MERCH[(n / 2 - 1) % MERCH.length];
  return { id: `merch-${it.id}-${n}`, kind: 'merch', merch: it.id, rarity, name: it.name };
}

export const memberById = (id) => MEMBERS.find((m) => m.id === id);
export const merchById = (id) => MERCH.find((m) => m.id === id);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 收藏品卡面
export function rewardHTML(r, { locked = false, big = false } = {}) {
  if (r.kind === 'scene') {
    return `<div class="rcard scene ${r.rarity} ${locked ? 'locked' : ''} ${big ? 'big' : ''}">
      <div class="rc-art"><img src="assets/art/story-${r.level}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/bg-stage.webp'"></div>
      <span class="rc-rar">${r.rarity}</span>
      <div class="rc-info"><b>${esc(r.name.replace(/^劇照・/, ''))}</b><small>劇照小卡</small></div>
    </div>`;
  }
  if (r.kind === 'keep') {
    return `<div class="rcard keep ${r.rarity} ${locked ? 'locked' : ''} ${big ? 'big' : ''}">
      <div class="rc-art"><img src="assets/art/icons/item-${r.level}.webp" alt="" onerror="this.remove()"><span class="rc-emoji">${r.emoji || '🎁'}</span></div>
      <span class="rc-rar">${r.rarity}</span>
      <div class="rc-info"><b>${esc(r.name)}</b><small>回憶小物</small></div>
    </div>`;
  }
  if (r.kind === 'card') {
    const m = memberById(r.member);
    return `<div class="rcard ${r.rarity} ${locked ? 'locked' : ''} ${big ? 'big' : ''}" style="--mc:${m.color}">
      <div class="rc-art"><img src="assets/art/card-${m.id}.webp" alt="" onerror="this.remove()"><span class="rc-emoji">${m.emoji}</span></div>
      <span class="rc-rar">${r.rarity}</span>
      <div class="rc-info"><b>${esc(m.name)}</b><small>${esc(m.group)}・${esc(r.concept)}</small></div>
    </div>`;
  }
  const it = merchById(r.merch);
  return `<div class="rcard merch ${r.rarity} ${locked ? 'locked' : ''} ${big ? 'big' : ''}">
    <div class="rc-art"><img class="rc-icon" src="assets/art/icons/merch-${it.id}.webp" alt="" onerror="this.remove()"><span class="rc-emoji">${it.emoji}</span></div>
    <span class="rc-rar">${r.rarity}</span>
    <div class="rc-info"><b>${esc(it.name)}</b><small>應援周邊</small></div>
  </div>`;
}
