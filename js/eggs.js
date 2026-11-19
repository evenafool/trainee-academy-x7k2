// 聊天彩蛋：在聊天室「自己打出」正確的韓文並送出，就會解鎖偶像的 SECRET 小卡
//   ・只算打字（要自己拼出來），點字卡、語音不算
//   ・卡冊裡沒解鎖的格子會給中文提示＋字數格子，讓孩子自己想韓文怎麼拼
import * as store from './store.js';
import { koKey } from './chatcards.js';
import { memberById } from './rewards.js';

export const EGGS = [
  { id: 'hana', ko: '화이팅', zh: '加油', hint: '幫朋友加油', say: '너도 화이팅!', sayZh: '你也加油！' },
  { id: 'riri', ko: '고마워', zh: '謝謝', hint: '跟朋友說謝謝', say: '천만에!', sayZh: '不客氣！' },
  { id: 'jun', ko: '친구', zh: '朋友', hint: '打出「朋友」', say: '우리는 친구야!', sayZh: '我們是朋友！' },
  { id: 'taeo', ko: '최고', zh: '最棒', hint: '稱讚朋友「最棒」', say: '네가 최고야!', sayZh: '你才是最棒的！' },
  { id: 'luna', ko: '사랑해', zh: '我愛你', hint: '跟好朋友說「我愛你」', say: '나도 사랑해!', sayZh: '我也愛你！' },
  { id: 'sena', ko: '보고 싶어', zh: '好想你', hint: '跟朋友說「好想你」', say: '나도 보고 싶어!', sayZh: '我也好想你！' },
  { id: 'ray', ko: '같이 공부하자', zh: '一起讀書吧', hint: '約朋友一起讀書', say: '좋아, 같이 하자!', sayZh: '好啊，一起吧！' },
  { id: 'yuri', ko: '생일 축하해', zh: '生日快樂', hint: '祝朋友生日快樂', say: '고마워! 케이크 먹자!', sayZh: '謝謝！一起吃蛋糕吧！' },
];

export function eggState() {
  const s = store.get();
  s.eggs ??= {};
  return s.eggs;
}
export const eggCount = () => Object.keys(store.get().eggs || {}).length;

// 卡冊用：SECRET 小卡
export function secretCard(e) {
  const m = memberById(e.id);
  return { id: `secret-${e.id}`, kind: 'secret', member: e.id, rarity: 'SECRET', name: `${m.name}・SECRET 小卡`, egg: e.id };
}

// 提示用的字數格子：보고 싶어 → □□ □□
export const eggBoxes = (e) => e.ko.split(' ').map((w) => '□'.repeat(koKey(w).length)).join(' ');

// 送出的韓文裡有彩蛋字 → 解鎖（已經有的就不再給）
export function claimEgg(text) {
  const k = koKey(text);
  if (!k) return null;
  const got = eggState();
  const e = EGGS.find((x) => !got[x.id] && k.includes(koKey(x.ko)));
  if (!e) return null;
  got[e.id] = Date.now();
  store.save();
  return e;
}
