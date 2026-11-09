// 本機進度存取（localStorage）
import { dayStr } from './util.js';

const KEY = 'idolstudy.v1';

const DEFAULT = {
  profile: null, // { name, stage, accent }
  xp: 0,
  streak: 0,
  lastDay: null,
  dailyDone: null,
  wrong: {}, // itemKey -> 還需要答對幾次才移出錯題本
  cards: [], // 小卡收藏 { key, rarity, at }
  stats: { answered: 0, correct: 0 },
  course: {
    cleared: {}, // levelId -> 星星數
    lastNewDay: null, // 最後一次「破新關」的日期，一天解鎖一關
    learned: {}, // wordId -> { lvl, due }
    spoken: 0, dialogues: 0, reviewed: 0, games: 0,
    unlockAll: false, // 家長模式：允許一天破多關
  },
  badges: [],
  names: {}, // 孩子取的名字：agency、group、groupKo、myGroup
  collection: [], // 每日獎勵收藏歷程 { id, kind, ..., day, title, at }
  best: {}, // 遊戲最高分
  daily: { date: null, xp: 0, stamps: [] }, // 今日集章（上課、語音特訓、測驗、閃卡、回放）
  settings: { slow: true }, // slow：外語放慢念
  history: [], // 學習歷程：{ t:'session'|'say', at, ... }
  exam: { certs: {}, spelled: {} }, // 考試準備度：自家認證、拼對過的字
  avatar: { outfit: 'fan', acc: '', pet: '', seen: [] }, // 主角造型（衣帽間）
};

let state = load();

function load() {
  const base = structuredClone(DEFAULT);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...base, ...saved, course: { ...base.course, ...saved.course }, settings: { ...base.settings, ...saved.settings }, daily: { ...base.daily, ...saved.daily }, exam: { ...base.exam, ...saved.exam } };
    }
  } catch (e) { /* 無痕模式或資料損毀時用預設值 */ }
  return base;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 忽略 */ }
}

export function get() { return state; }

export function reset() {
  state = structuredClone(DEFAULT);
  save();
}

export const today = () => dayStr(0);

// 完成一次練習時更新連續打卡天數
export function touchStreak() {
  const t = today();
  if (state.lastDay === t) return;
  state.streak = state.lastDay === dayStr(-1) ? state.streak + 1 : 1;
  state.lastDay = t;
}

export function markAnswer(key, correct) {
  state.stats.answered++;
  if (correct) {
    state.stats.correct++;
    if (state.wrong[key] != null) {
      state.wrong[key]--;
      if (state.wrong[key] <= 0) delete state.wrong[key];
    }
  } else {
    state.wrong[key] = 2;
  }
}

// ───────── 多鄰國式每日目標：每個區域都能集章，集滿 3 章＝今天達標 ─────────
export const STAMPS = {
  lesson: { name: '上新課', icon: 'mic' },
  drill: { name: '語音特訓', icon: 'speaker' },
  replay: { name: '回放複習', icon: 'book' },
  quiz: { name: '測驗', icon: 'star' },
  flash: { name: '閃卡', icon: 'cards' },
  game: { name: '小遊戲', icon: 'trophy' },
};
export const DAILY_GOAL = 3;
export function daily() {
  if (state.daily?.date !== today()) state.daily = { date: today(), xp: 0, stamps: [] };
  return state.daily;
}
// 任何練習完成都走這裡：加應援值、蓋章、更新連續天數；回傳這次是不是剛好達標
export function addProgress(xp, stamp, meta = {}) {
  const d = daily();
  const before = d.stamps.length >= DAILY_GOAL;
  state.xp += xp;
  d.xp += xp;
  if (stamp && !d.stamps.includes(stamp)) d.stamps.push(stamp);
  log({ t: 'session', stamp, xp, ...meta });
  touchStreak();
  save();
  return { goalJustMet: !before && d.stamps.length >= DAILY_GOAL, daily: d };
}
// 間隔複習：答對升一級、答錯回到 0
const SRS = [1, 2, 4, 7, 15, 30];
export function reviewWord(id, ok) {
  const L = state.course.learned;
  const cur = L[id] || { lvl: 0 };
  const lvl = ok ? Math.min(cur.lvl + 1, SRS.length - 1) : 0;
  L[id] = { lvl, due: dayStr(ok ? SRS[lvl] : 0) };
}

// ───────── 學習歷程：每一次練習、每一句說過的話都記下來 ─────────
const HISTORY_MAX = 4000;
export function log(entry) {
  state.history ??= [];
  state.history.push({ at: Date.now(), day: today(), ...entry });
  if (state.history.length > HISTORY_MAX) state.history.splice(0, state.history.length - HISTORY_MAX);
}
export function logSay(target, lang, said, ok, where = '') {
  log({ t: 'say', target, lang, said: said || '', ok: !!ok, where });
  save();
}
