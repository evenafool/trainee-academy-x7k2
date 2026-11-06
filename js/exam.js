// 考試準備度：對照教育部國中小英語字表（國小 300 → 國中 1,200 → 會考 2,000）和韓國國立國語院初級字表
// 路由：#/exam 總覽｜#/exam/bank 單字庫｜#/exam/bank/<主題> 學新字｜#/exam/test/<等級> 認證模擬考
//       #/exam/quiz 練習小考（不拿認證）｜#/exam/cert/<等級> 證書
// 注意：這裡的認證是練習生學院的「自家認證」，不是官方證書（畫面和證書上都會寫清楚）
import { WORDS, LEVELS } from './course.js';
import { BANK } from './bank.js';
import { TAGS, EXAM_TOTAL } from './examdata.js';
import * as store from './store.js';
import { esc, ic, wic, shuffle, speak, stopSpeaking, dayStr, toast, confetti } from './util.js';
import { sfx } from './sound.js';

const MOE_URL = encodeURI('https://www.naer.edu.tw/upload/1/16/doc/812/(發布版)國民中小學暨普通型高級中等學校-語文領域-英語文課程綱要.pdf');
const NIKL_URL = 'https://www.korean.go.kr/front_eng/down/down_02V.do?etc_seq=70';
const PASS = 0.8; // 模擬考 80 分過關
const fmt = (n) => Number(n).toLocaleString('en-US');
const BATCH = 8; // 單字庫一次學幾個新字

// ───────── 認證等級（自家認證） ─────────
export const CERTS = [
  { id: 'en300', track: 'en', key: 'enB', n: 300, name: '英文 Lv1・國小畢業級', desc: '學會 300 個教育部基本字（課綱的國小目標：聽、讀、說 300 字）' },
  { id: 'en600', track: 'en', key: 'enB', n: 600, name: '英文 Lv2・600 字', desc: '國中基本 1,200 字完成一半' },
  { id: 'en900', track: 'en', key: 'enB', n: 900, name: '英文 Lv3・900 字', desc: '國中基本 1,200 字完成四分之三' },
  { id: 'en1200', track: 'en', key: 'enB', n: 1200, name: '英文 Lv4・國中基本字制霸', desc: '學完教育部基本 1,200 字（課綱的國中畢業目標）' },
  { id: 'en2000', track: 'en', key: 'enAll', n: 2000, name: '英文 Lv5・會考 2,000 字', desc: '教育部參考字彙表 2,000 字（基本 1,200＋常用 800）' },
  { id: 'sp180', track: 'sp', key: 'spelled', n: 180, name: '拼字 180', desc: '在拼字題拼對 180 個字（課綱的國小拼寫目標）', auto: true },
  { id: 'ko100', track: 'ko', key: 'koA', n: 100, name: '韓文 Lv1・100 字', desc: '韓國國立國語院初級 A 級字 100 個' },
  { id: 'ko300', track: 'ko', key: 'koA', n: 300, name: '韓文 Lv2・300 字', desc: 'A 級字 300 個，日常生活的話大多聽得懂' },
  { id: 'ko500', track: 'ko', key: 'koA', n: 500, name: '韓文 Lv3・500 字', desc: 'A 級字一半以上，往 TOPIK I 前進' },
  { id: 'ko982', track: 'ko', key: 'koA', n: 982, name: '韓文 Lv4・初級核心制霸', desc: 'A 級 982 字全部學會' },
];

function examState() {
  const s = store.get();
  s.exam ??= {};
  s.exam.certs ??= {};
  s.exam.spelled ??= {};
  return s.exam;
}

// 從一組字算出：英文基本字幾個、2,000 字表幾個、韓文 A 級幾個（同一個字表主字只算一次）
function countOf(ids) {
  const enB = new Set();
  const enAll = new Set();
  const koA = new Set();
  for (const id of ids) {
    const t = TAGS[id];
    if (!t) continue;
    const heads = t[0] ? t[0].split('|') : [];
    if (t[1] === 'b') heads.forEach((h) => enB.add(h));
    if (t[1]) heads.forEach((h) => enAll.add(h));
    if (t[3] === 'A') koA.add(t[2]);
  }
  // 字表裡 can／could 這類分開列的詞條會讓數字超過 1,200，顯示時封頂
  return { enB: Math.min(enB.size, EXAM_TOTAL.enBasic), enAll: Math.min(enAll.size, EXAM_TOTAL.enAll), koA: Math.min(koA.size, EXAM_TOTAL.koA) };
}
const learnedIds = () => Object.keys(store.get().course.learned).filter((id) => WORDS[id]);
export function examStats() {
  const c = countOf(learnedIds());
  c.spelled = Object.keys(examState().spelled).filter((id) => WORDS[id]).length;
  return c;
}
let appMax = null; // 整個 App 的內容最多能到哪裡（判斷「內容製作中」）
function maxStats() {
  appMax ??= { ...countOf(Object.keys(WORDS)), spelled: Object.values(WORDS).filter(spellable).length };
  return appMax;
}
function certStatus(c, st = examStats()) {
  const done = examState().certs[c.id];
  if (done) return { state: 'done', done };
  if (maxStats()[c.key] < c.n) return { state: 'soon', left: c.n - st[c.key] };
  if (st[c.key] >= c.n) return { state: c.auto ? 'done' : 'ready' };
  return { state: 'locked', left: c.n - st[c.key] };
}
// 自動發的認證（拼字 180）
function autoCerts() {
  const st = examStats();
  const ex = examState();
  for (const c of CERTS.filter((x) => x.auto)) {
    if (!ex.certs[c.id] && st[c.key] >= c.n) {
      ex.certs[c.id] = { at: Date.now(), auto: true };
      toast(`拿到自家認證：${c.name}！`);
      confetti();
    }
  }
}

// 大廳用：現在最推薦做什麼
export function examNext() {
  const st = examStats();
  const ready = CERTS.find((c) => certStatus(c, st).state === 'ready');
  if (ready) return { href: `#/exam/test/${ready.id}`, label: `可以考「${ready.name}」認證了！` };
  const th = BANK.find((t) => t.words.some((w) => !store.get().course.learned[w.id]));
  if (th) return { href: `#/exam/bank/${th.id}`, label: `單字庫：${th.zh}` };
  return { href: '#/exam/quiz', label: '模擬小考' };
}

// ───────── 出題 ─────────
const spellable = (w) => /^[a-z]{2,12}$/i.test(w.en);
const norm = (s) => String(s || '').trim().toLowerCase();
function clozeOf(w) {
  const s = w.scenes?.[0];
  if (!s?.en || !/^[a-z' -]+$/i.test(w.en)) return null;
  const re = new RegExp(`\\b${w.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (!re.test(s.en)) return null;
  return { text: s.en.replace(re, '＿＿＿'), zh: s.zh, full: s.en };
}
const ALL = () => Object.values(WORDS);
function options(w, field, n = 3) {
  const seen = new Set([norm(w[field])]);
  const out = [w[field]];
  const near = ALL().filter((x) => x !== w && ((w.bank && x.bank === w.bank) || (w.theme && x.theme === w.theme)));
  for (const x of [...shuffle(near), ...shuffle(ALL())]) {
    if (out.length > n) break;
    const v = norm(x[field]);
    if (!v || v === '-' || seen.has(v)) continue;
    seen.add(v);
    out.push(x[field]);
  }
  const opts = shuffle(out);
  return { options: opts, answer: opts.indexOf(w[field]) };
}
function makeQ(type, w) {
  if (type === 'spell' && spellable(w)) {
    const letters = w.en.toLowerCase().split('');
    const extra = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter((ch) => !letters.includes(ch))).slice(0, letters.length <= 4 ? 2 : 3);
    return { type, w, tiles: shuffle([...letters, ...extra]), filled: [] };
  }
  if (type === 'cloze') {
    const cz = clozeOf(w);
    if (cz) return { type, w, prompt: cz.text, sub: cz.zh, full: cz.full, ...options(w, 'en') };
    type = 'zh2en';
  }
  if (type === 'listen') return { type, w, audio: [w.en, 'en-US'], ...options(w, 'zh') };
  if (type === 'zh2ko') return { type, w, prompt: w.zh, ...options(w, 'ko') };
  if (type === 'kolisten') return { type, w, audio: [w.ko, 'ko-KR'], ...options(w, 'zh') };
  if (type === 'ko2zh') return { type, w, prompt: w.ko, ...options(w, 'zh') };
  return { type: 'zh2en', w, prompt: w.zh, ...options(w, 'en') };
}
const TAG_TEXT = {
  zh2en: '英文是哪一個？', listen: '聽聽看，是什麼意思？', spell: '拼出英文單字', cloze: '句子裡空格要填哪個字？',
  zh2ko: '韓文是哪一個？', kolisten: '聽韓文，是什麼意思？', ko2zh: '這個韓文是什麼意思？',
};
// 依題型比例從字裡挑題（每個字只出一次；拼字、克漏字找不到合適的字就改成選擇題）
function buildQs(words, plan) {
  const pool = shuffle(words);
  const used = new Set();
  const qs = [];
  for (const type of plan) {
    const fit = (w) => !used.has(w.id) && (type !== 'spell' || spellable(w)) && (type !== 'cloze' || clozeOf(w))
      && (!type.startsWith('ko') && type !== 'zh2ko' ? true : w.ko && w.ko !== '-');
    const w = pool.find(fit) || pool.find((x) => !used.has(x.id));
    if (!w) break;
    used.add(w.id);
    qs.push(makeQ(type, w));
  }
  return qs;
}
const rep = (type, n) => Array(n).fill(type);
const EN_PLAN = (n) => shuffle([...rep('zh2en', Math.round(n * 0.3)), ...rep('listen', Math.round(n * 0.25)), ...rep('spell', Math.round(n * 0.25)), ...rep('cloze', n - Math.round(n * 0.3) - Math.round(n * 0.25) * 2)]);
const KO_PLAN = (n) => shuffle([...rep('zh2ko', Math.round(n * 0.4)), ...rep('kolisten', Math.round(n * 0.4)), ...rep('ko2zh', n - Math.round(n * 0.4) * 2)]);

// ───────── 進行中的測驗／學習 ─────────
let run = null;
let $app = null;

function learn(id) {
  const L = store.get().course.learned;
  if (!L[id]) { L[id] = { lvl: 0, due: dayStr(1) }; return true; }
  return false;
}
function sayWord(w, lang = 'en-US') { speak(lang === 'ko-KR' ? w.ko : w.en, lang); }

function drawRun() {
  if (run.phase === 'intro') return drawIntro();
  if (run.i >= run.qs.length) return finishRun();
  const q = run.qs[run.i];
  const done = q.done;
  const top = `
    <div class="quiz-top">
      <a class="x" href="${run.back}" id="exExit" aria-label="離開">✕</a>
      <div class="qbar"><i style="width:${(run.i / run.qs.length) * 100}%"></i></div>
      <div class="combo ${run.combo >= 2 ? 'hot' : ''}">${run.combo >= 2 ? `COMBO ×${run.combo} ${ic('fire')}` : `${run.i + 1}/${run.qs.length}`}</div>
    </div>
    <div class="q-deck muted small">${esc(run.title)}</div>`;
  let body = '';
  if (q.type === 'spell') {
    const ans = q.w.en.toLowerCase();
    const slots = ans.split('').map((ch, k) => {
      const t = q.filled[k];
      const v = t != null ? q.tiles[t] : '';
      const cls = done ? (q.ok || v === ch ? 'ok' : 'ng') : v ? 'fill' : '';
      return `<button type="button" class="sp-slot ${cls}" data-k="${k}">${esc(done && !q.ok ? ch : v)}</button>`;
    }).join('');
    const tiles = q.tiles.map((ch, k) => `<button type="button" class="sp-tile" data-t="${k}" ${q.filled.includes(k) || done ? 'disabled' : ''}>${esc(ch)}</button>`).join('');
    body = `
      <div class="q-card ex-q">
        <div class="q-tag">${TAG_TEXT.spell}</div>
        <div class="q-emoji">${wic(q.w)}</div>
        <div class="q-prompt">${esc(q.w.zh)}</div>
        <button type="button" class="btn sm" id="exHear">${ic('speaker')} 聽發音</button>
      </div>
      <div class="sp-slots ${done ? (q.ok ? 'win' : 'lose') : ''}">${slots}</div>
      ${done ? '' : `<div class="sp-tiles">${tiles}</div>
      <div class="row center"><button type="button" class="btn sm ghost" id="spBack">⌫ 退一格</button><button type="button" class="btn sm ghost" id="spClear">全部清掉</button></div>`}`;
  } else {
    const opts = q.options.map((o, j) => {
      let cls = '';
      if (done) cls = j === q.answer ? 'right' : j === q.picked ? 'wrong' : 'dim';
      return `<button type="button" class="opt ${cls}" data-j="${j}" ${done ? 'disabled' : ''}>${esc(o)}</button>`;
    }).join('');
    const showPic = !q.audio && q.type !== 'ko2zh';
    body = `
      <div class="q-card ex-q">
        <div class="q-tag">${TAG_TEXT[q.type]}</div>
        ${q.audio ? `<button type="button" class="listen" id="exListen" aria-label="再聽一次">${ic('speaker')}</button><div class="muted small">點喇叭再聽一次</div>`
          : `${showPic && q.type !== 'cloze' ? `<div class="q-emoji">${wic(q.w)}</div>` : ''}<div class="q-prompt ${q.type === 'cloze' ? 'sentence' : ''}">${esc(q.prompt)}</div>${q.sub ? `<div class="muted">${esc(q.sub)}</div>` : ''}`}
      </div>
      <div class="options">${opts}</div>`;
  }
  const fb = done ? `
    <div class="feedback ${q.ok ? 'ok' : 'ng'}">
      <b>${q.ok ? (q.retry ? '這次答對了！' : '答對了！') : '再記一次：'}</b>
      <div class="explain">${esc(q.w.zh)}　英 ${esc(q.w.en)}${q.w.ko && q.w.ko !== '-' ? `　韓 ${esc(q.w.ko)}（${esc(q.w.kr)}）` : ''}${q.full ? `<br>${esc(q.full)}` : ''}</div>
      <div class="row"><button type="button" class="btn sm" data-say="en">${ic('speaker')} 英文</button>${q.w.ko && q.w.ko !== '-' ? `<button type="button" class="btn sm" data-say="ko">${ic('speaker')} 韓文</button>` : ''}</div>
    </div>
    <button type="button" class="btn primary big" id="exNext">${run.i === run.qs.length - 1 ? `看結果 ${ic('star')}` : '下一題 ›'}</button>` : '';
  $app.innerHTML = `<section class="exam-run">${top}${body}${fb}</section>`;
  wireRun(q);
}

function wireRun(q) {
  const $ = (s) => $app.querySelector(s);
  $('#exExit').onclick = () => { run = null; stopSpeaking(); };
  if (q.audio) {
    const play = () => speak(q.audio[0], q.audio[1]);
    $('#exListen').onclick = play;
    if (!q.done) setTimeout(play, 250);
  } else if (!q.done && q.type === 'zh2en') {
    setTimeout(() => speak(q.w.zh.split(/[；、（]/)[0], 'zh-TW'), 250);
  }
  $app.querySelectorAll('[data-say]').forEach((b) => b.onclick = () => sayWord(q.w, b.dataset.say === 'ko' ? 'ko-KR' : 'en-US'));
  $('#exNext')?.addEventListener('click', () => { run.i++; drawRun(); window.scrollTo(0, 0); });
  if (q.type === 'spell') {
    $('#exHear').onclick = () => sayWord(q.w);
    if (!q.done) setTimeout(() => sayWord(q.w), 300);
    const ans = q.w.en.toLowerCase();
    const check = () => {
      if (q.filled.length < ans.length) return;
      const got = q.filled.map((t) => q.tiles[t]).join('');
      answer(q, got === ans, null);
    };
    $app.querySelectorAll('.sp-tile').forEach((b) => b.onclick = () => {
      if (q.done || q.filled.length >= ans.length) return;
      q.filled.push(+b.dataset.t);
      sfx('tap');
      drawRun();
      check();
    });
    $('#spBack')?.addEventListener('click', () => { q.filled.pop(); drawRun(); });
    $('#spClear')?.addEventListener('click', () => { q.filled = []; drawRun(); });
    $app.querySelectorAll('.sp-slot').forEach((b) => b.onclick = () => {
      const k = +b.dataset.k;
      if (q.done || k >= q.filled.length) return;
      q.filled.splice(k);
      drawRun();
    });
  } else {
    $app.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
      const j = +b.dataset.j;
      answer(q, j === q.answer, j);
    });
  }
}

// 用鍵盤也可以拼字（電腦上）
window.addEventListener('keydown', (e) => {
  if (!run || run.phase !== 'quiz' || !location.hash.startsWith('#/exam')) return;
  const q = run.qs[run.i];
  if (!q) return;
  if (q.done && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $app.querySelector('#exNext')?.click(); return; }
  if (q.type !== 'spell' || q.done) return;
  if (e.key === 'Backspace') { q.filled.pop(); drawRun(); return; }
  if (/^[a-z]$/i.test(e.key)) {
    const k = q.tiles.findIndex((ch, idx) => ch === e.key.toLowerCase() && !q.filled.includes(idx));
    if (k >= 0) $app.querySelector(`.sp-tile[data-t="${k}"]`)?.click();
  }
});

function answer(q, ok, picked) {
  if (q.done) return;
  q.done = true;
  q.ok = ok;
  q.picked = picked;
  const ex = examState();
  if (ok) { run.correct++; run.combo++; run.maxCombo = Math.max(run.maxCombo, run.combo); sfx('right'); }
  else { run.combo = 0; sfx('soft'); }
  navigator.vibrate?.(ok ? 15 : [30, 40, 30]);
  if (q.type === 'spell' && ok) ex.spelled[q.w.id] = (ex.spelled[q.w.id] || 0) + 1;
  if (run.mode === 'bank') {
    if (ok) { if (learn(q.w.id)) run.newly.push(q.w.id); }
    else if (!q.retry) run.qs.push({ ...makeQ(q.type, q.w), retry: true }); // 答錯的字最後再考一次
  } else if (store.get().course.learned[q.w.id]) {
    store.reviewWord(q.w.id, ok);
  }
  store.log({ t: 'answer', target: q.w.en, said: q.type === 'spell' ? q.filled.map((t) => q.tiles[t]).join('') : q.options?.[picked] || '', ok, where: run.title });
  store.save();
  if (q.type === 'zh2ko' || q.type === 'kolisten' || q.type === 'ko2zh') sayWord(q.w, 'ko-KR');
  else if (q.type === 'cloze' && ok) speak(q.full, 'en-US');
  else sayWord(q.w);
  autoCerts();
  drawRun();
}

function finishRun() {
  const r = run;
  const total = r.qs.length;
  const firstTry = r.qs.filter((q) => !q.retry);
  const score = firstTry.length ? firstTry.filter((q) => q.ok).length / firstTry.length : 0;
  let xp = 0;
  let cert = null;
  if (r.mode === 'bank') xp = 10 + r.newly.length * 3;
  else if (r.mode === 'test') {
    xp = 30 + r.correct * 2;
    if (score >= PASS) {
      cert = CERTS.find((c) => c.id === r.cert);
      examState().certs[cert.id] = { at: Date.now(), score: r.correct, total };
    }
  } else xp = 10 + r.correct * 3;
  const prog = store.addProgress(xp, 'quiz', { title: r.title, good: r.correct, tries: total });
  sfx(cert ? 'reward' : 'stamp');
  if (cert || (r.mode === 'bank' && r.newly.length)) confetti();
  const st = examStats();
  const pct = Math.round(score * 100);
  const head = r.mode === 'bank' ? `學會 ${r.newly.length} 個新字！`
    : r.mode === 'test' ? (cert ? '通過認證考試！' : `還差一點！（要 ${Math.round(PASS * 100)} 分）`)
      : pct >= 80 ? '超強！' : pct >= 60 ? '不錯喔！' : '多練幾次會更好！';
  $app.innerHTML = `
    <section class="result exam-result">
      <div class="score-ring" style="--p:${pct}"><b>${pct}</b><small>分</small></div>
      <h1>${esc(head)}</h1>
      <div class="xp-gain">+${xp} 應援值</div>
      <div class="muted">測驗蓋章 ✓ 今日集章 ${Math.min(prog.daily.stamps.length, store.DAILY_GOAL)}/${store.DAILY_GOAL}${prog.goalJustMet ? '　★ 今日目標達成！' : ''}</div>
      ${r.mode === 'bank' && r.newly.length ? `<div class="ex-newly">${r.newly.map((id) => `<span>${wic(WORDS[id])}<b>${esc(WORDS[id].en)}</b></span>`).join('')}</div>` : ''}
      ${cert ? certHTML(cert, examState().certs[cert.id]) : ''}
      <p class="muted">英文基本字 ${st.enB}／${fmt(EXAM_TOTAL.enBasic)}　韓文 A 級 ${st.koA}／${EXAM_TOTAL.koA}　會拼 ${st.spelled} 字</p>
      <div class="actions">
        ${r.mode === 'bank' ? `<a class="btn primary big" href="#/exam/bank/${r.theme}" id="exAgain">${ic('book')} 再學 ${BATCH} 個</a>` : `<button type="button" class="btn primary big" id="exAgain">再考一次</button>`}
        <a class="btn big" href="#/exam">${ic('medal')} 考試準備度</a>
        <a class="btn ghost" href="#/home">回大廳</a>
      </div>
    </section>`;
  // 同一個網址按連結不會觸發換頁，所以直接重開
  $app.querySelector('#exAgain').onclick = (e) => { e.preventDefault(); run = null; renderExam($app, r.route); window.scrollTo(0, 0); };
  run = null;
}

// ───────── 證書 ─────────
// 獎章圖：assets/art/icons/cert-<等級>.webp（GPT 畫的），沒有圖就用通用獎牌圖示
const medal = (c, cls = '') => `<img class="cert-medal ${cls}" src="assets/art/icons/cert-${c.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/icons/ui-medal.webp'">`;
function certHTML(c, done) {
  const name = store.get().profile?.name || '練習生';
  const d = new Date(done.at);
  const date = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  const no = `TA-${c.id.toUpperCase()}-${String(done.at).slice(-5)}`;
  return `
    <div class="cert track-${c.track}">
      <div class="cert-paper">
        <img class="cert-bg" src="assets/art/cert-frame.webp" alt="" onerror="this.closest('.cert-paper').classList.add('no-art');this.remove()">
        <div class="cert-ribbon"><span>自家認證證書</span></div>
        <div class="cert-in">
          <small class="cert-org">練習生學院・TRAINEE ACADEMY</small>
          <p class="cert-label">茲證明</p>
          <p class="cert-name">${esc(name)}</p>
          ${medal(c)}
          <p class="cert-title">${esc(c.name)}</p>
          <p class="cert-desc">${esc(c.desc)}${done.total ? `，認證模擬考 ${done.score}／${done.total} 題答對` : ''}。</p>
          <div class="cert-foot">
            <div class="cert-sign"><img src="assets/art/teacher-face.webp" alt=""><span>민아 쌤<small>敏雅老師</small></span></div>
            <div class="cert-seal"><span>練習生<br>學院<br>認證</span></div>
            <div class="cert-date"><small>認證日期</small>${date}<small class="cert-no">No. ${no}</small></div>
          </div>
          <p class="cert-note">※ 這是練習生學院 App 的自家認證，不是官方證書。字表出處：教育部十二年國教英語文課綱「參考字彙表」、韓國國立國語院「韓語學習用語彙」。</p>
        </div>
      </div>
    </div>`;
}

// ───────── 畫面 ─────────
function bar(n, total, marks) {
  const pct = Math.min(100, (n / total) * 100);
  return `<div class="ex-bar"><i style="width:${pct}%"></i>${marks.map((m) => `<span class="mk ${n >= m ? 'on' : ''}" style="left:${(m / total) * 100}%"><em>${m}</em></span>`).join('')}</div>`;
}
function certTile(c, st) {
  const s = certStatus(c, st);
  const href = s.state === 'done' ? `#/exam/cert/${c.id}` : s.state === 'ready' ? `#/exam/test/${c.id}` : c.track === 'sp' ? '#/exam/quiz' : '#/exam/bank';
  const label = s.state === 'done' ? '已認證 ✓' : s.state === 'ready' ? '可以考了！點我' : s.state === 'soon' ? `內容製作中（還差 ${s.left}）` : `還差 ${s.left} 字`;
  return `<a class="ex-cert ${s.state}" href="${href}">${medal(c, 'mini')}<b>${esc(c.name)}</b><small>${esc(label)}</small></a>`;
}
function renderHub() {
  const st = examStats();
  const mx = maxStats();
  const bankLeft = BANK.reduce((a, t) => a + t.words.filter((w) => !store.get().course.learned[w.id]).length, 0);
  const next = examNext();
  $app.innerHTML = `
    <div class="backbar"><a href="#/home" class="backlink">‹</a><b>${ic('medal')} 考試準備度</b></div>
    <p class="ex-intro">對照<b>教育部課綱的英文字表</b>和<b>韓國國立國語院的初級字表</b>，看看你離考試目標還有多遠。</p>
    <a class="ex-next" href="${next.href}"><span class="ex-hand"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"></span><b>下一步：${esc(next.label)}</b><small>點我開始</small></a>

    <article class="glass ex-track">
      <h2>${ic('en')} 英文單字</h2>
      <div class="ex-big"><b>${st.enB}</b><small>／${fmt(EXAM_TOTAL.enBasic)} 個國中基本字</small></div>
      ${bar(st.enB, EXAM_TOTAL.enBasic, [300, 600, 900, 1200])}
      <ul class="ex-goals">
        <li class="${st.enB >= 300 ? 'on' : ''}">國小畢業目標：會聽讀說 300 字 ${st.enB >= 300 ? '✓' : `（還差 ${300 - st.enB}）`}</li>
        <li class="${st.spelled >= 180 ? 'on' : ''}">國小拼寫目標：會拼 180 字　目前 ${st.spelled} 字 ${st.spelled >= 180 ? '✓' : ''}</li>
        <li class="${st.enB >= 1200 ? 'on' : ''}">國中畢業目標：1,200 個基本字 ${st.enB >= 1200 ? '✓' : `（還差 ${fmt(1200 - st.enB)}）`}</li>
        <li>會考字表 2,000 字：目前 ${st.enAll} 字（App 現有內容最多到 ${fmt(mx.enAll)} 字，其餘約 ${fmt(EXAM_TOTAL.enAll - mx.enAll)} 字製作中）</li>
      </ul>
    </article>

    <article class="glass ex-track ko">
      <h2>${ic('ko')} 韓文單字</h2>
      <div class="ex-big"><b>${st.koA}</b><small>／${EXAM_TOTAL.koA} 個初級 A 級字</small></div>
      ${bar(st.koA, EXAM_TOTAL.koA, [100, 300, 500, 982])}
      <ul class="ex-goals">
        <li>A 級是韓國國立國語院「韓語學習用語彙」最基礎的一級，TOPIK I（初級）的核心字</li>
        <li>App 現有內容最多到 ${mx.koA} 個 A 級字，其餘製作中</li>
      </ul>
    </article>

    <div class="ex-actions">
      <a class="ex-btn big glow" href="#/exam/bank">${ic('book')}<b>單字庫</b><small>國中 1,200 字，還有 ${bankLeft} 個新字</small></a>
      <a class="ex-btn big" href="#/exam/quiz">${ic('star')}<b>模擬小考</b><small>選擇＋拼字＋克漏字，10 題</small></a>
    </div>

    <h2 class="sec">我的自家認證</h2>
    <p class="muted small">學到門檻字數後，模擬考 20 題拿到 ${Math.round(PASS * 100)} 分以上就發證書。</p>
    <div class="ex-certs">${CERTS.map((c) => certTile(c, st)).join('')}</div>

    <details class="glass ex-honest">
      <summary>老實說：學完這套 App 能應付考試嗎？</summary>
      <p>學完全部內容，英文單字大約等於教育部「國中畢業至少 1,200 字」的量，也超過國小 300 字的目標；韓文大約是初級 A 級字的一半。</p>
      <p>但學校考試不只考單字，還有文法、句型、閱讀測驗和聽力。這個 App 的模擬考只考單字（選擇、聽力、拼字、克漏字），可以當成考前的單字複習，不能代替學校的課本和考卷練習。</p>
      <p>這裡的證書是練習生學院的<b>自家認證</b>，不是官方證書。</p>
      <p class="small">字表出處：<a href="${MOE_URL}" target="_blank" rel="noopener">教育部《十二年國民基本教育課程綱要 語文領域─英語文》附錄五「參考字彙表」</a>；<a href="${NIKL_URL}" target="_blank" rel="noopener">韓國國立國語院（2003）「한국어 학습용 어휘 목록」</a>（公共누리第 1 類，標示出處使用）。</p>
    </details>`;
}

// 單字庫：主題清單
function catchupWords() {
  const L = store.get().course.learned;
  const cleared = store.get().course.cleared;
  return LEVELS.filter((l) => !l.boss && cleared[l.id]).flatMap((l) => l.extra || []).filter((id) => !L[id]).map((id) => WORDS[id]);
}
function renderBankList() {
  const L = store.get().course.learned;
  const cu = catchupWords();
  const total = BANK.reduce((a, t) => a + t.words.length, 0);
  const got = BANK.reduce((a, t) => a + t.words.filter((w) => L[w.id]).length, 0);
  let firstOpen = BANK.find((t) => t.words.some((w) => !L[w.id]))?.id;
  if (cu.length) firstOpen = 'catchup';
  const card = (id, emoji, zh, en, have, all) => {
    const pct = all ? Math.round((have / all) * 100) : 0;
    const full = have >= all;
    return `<a class="bk-theme ${full ? 'full' : ''} ${id === firstOpen ? 'hint' : ''}" href="#/exam/bank/${id}">
      ${id === firstOpen ? '<span class="tap-me">點我！</span>' : ''}
      <span class="bk-emoji">${emoji}</span><b>${esc(zh)}</b><small>${esc(en)}</small>
      <span class="bk-prog"><i style="width:${pct}%"></i></span><em>${full ? '✓ 學完' : `${have}／${all}`}</em></a>`;
  };
  $app.innerHTML = `
    <div class="backbar"><a href="#/exam" class="backlink">‹</a><b>${ic('book')} 國中 1,200 單字庫</b></div>
    <p class="ex-intro">照教育部字表的主題分好了。每次學 ${BATCH} 個新字：<b>先看卡片 → 小測驗答對</b>，就收進你的單字本。已學 ${got}／${total} 字（主線課程教過的字不會重複）。</p>
    <div class="bk-grid">
      ${cu.length ? card('catchup', '⭐', '延伸字補課', `${cu.length} 個以前的延伸字`, 0, cu.length) : ''}
      ${BANK.map((t) => card(t.id, t.emoji, t.zh, t.en, t.words.filter((w) => L[w.id]).length, t.words.length)).join('')}
    </div>`;
}

// 單字庫：一個主題（先看卡，再小測驗）
function startBank(themeId) {
  const L = store.get().course.learned;
  const th = themeId === 'catchup' ? { id: 'catchup', zh: '延伸字補課', words: catchupWords() } : BANK.find((t) => t.id === themeId);
  if (!th) { location.hash = '#/exam/bank'; return; }
  const fresh = th.words.filter((w) => !L[w.id]).slice(0, BATCH);
  if (!fresh.length) {
    const learned = th.words.filter((w) => L[w.id]);
    $app.innerHTML = `
      <div class="backbar"><a href="#/exam/bank" class="backlink">‹</a><b>${esc(th.zh)}</b></div>
      <div class="empty">${ic('trophy', 'empty-ic')}<p>「${esc(th.zh)}」的字全部學會了！</p>
        ${learned.length >= 4 ? `<button type="button" class="btn primary big" id="bkReview">${ic('star')} 複習這個主題（${Math.min(10, learned.length)} 題）</button>` : ''}
        <a class="btn big" href="#/exam/bank">看其他主題</a></div>`;
    $app.querySelector('#bkReview')?.addEventListener('click', () => {
      run = { mode: 'quiz', route: `bank/${th.id}`, title: `複習・${th.zh}`, back: '#/exam/bank', phase: 'quiz', qs: buildQs(learned, EN_PLAN(Math.min(10, learned.length))), i: 0, correct: 0, combo: 0, maxCombo: 0, newly: [] };
      drawRun();
    });
    return;
  }
  const plan = fresh.map((w, k) => (spellable(w) && k % 3 === 1 ? 'spell' : k % 3 === 2 ? 'listen' : 'zh2en'));
  run = {
    mode: 'bank', theme: th.id, route: `bank/${th.id}`, title: `單字庫・${th.zh}`, back: '#/exam/bank', phase: 'intro', k: 0,
    words: fresh, qs: fresh.map((w, k) => makeQ(plan[k], w)), i: 0, correct: 0, combo: 0, maxCombo: 0, newly: [],
  };
  drawRun();
}
function drawIntro() {
  const w = run.words[run.k];
  const sc = w.scenes?.[0];
  $app.innerHTML = `
    <section class="exam-run">
      <div class="quiz-top">
        <a class="x" href="${run.back}" id="exExit" aria-label="離開">✕</a>
        <div class="qbar"><i style="width:${(run.k / run.words.length) * 100}%"></i></div>
        <div class="combo">${run.k + 1}/${run.words.length}</div>
      </div>
      <div class="q-deck muted small">${esc(run.title)}・先認識新字</div>
      <div class="bk-card">
        <div class="bk-ic">${wic(w)}</div>
        <div class="bk-en">${esc(w.en)}<button type="button" class="say" data-say="en" aria-label="念英文">${ic('speaker')}</button></div>
        <div class="bk-zh">${esc(w.zh)}</div>
        ${w.ko && w.ko !== '-' ? `<div class="bk-ko">${esc(w.ko)}<small>${esc(w.kr)}</small><button type="button" class="say" data-say="ko" aria-label="念韓文">${ic('speaker')}</button></div>` : ''}
        ${sc?.en ? `<div class="bk-ex">${esc(sc.en)}<br><span class="muted">${esc(sc.zh)}</span></div>` : ''}
      </div>
      <button type="button" class="btn primary big" id="bkNext">${run.k < run.words.length - 1 ? '下一個 ›' : `記住了，開始小測驗 ${ic('star')}`}</button>
    </section>`;
  $app.querySelector('#exExit').onclick = () => { run = null; stopSpeaking(); };
  $app.querySelectorAll('[data-say]').forEach((b) => b.onclick = () => sayWord(w, b.dataset.say === 'ko' ? 'ko-KR' : 'en-US'));
  setTimeout(() => sayWord(w), 250);
  $app.querySelector('#bkNext').onclick = () => {
    if (run.k < run.words.length - 1) run.k++;
    else { run.phase = 'quiz'; run.qs = shuffle(run.qs); }
    drawRun();
  };
}

// 認證模擬考
function startTest(certId) {
  const c = CERTS.find((x) => x.id === certId);
  if (!c) { location.hash = '#/exam'; return; }
  const s = certStatus(c);
  const L = store.get().course.learned;
  const pool = Object.keys(L).map((id) => WORDS[id]).filter((w) => w && TAGS[w.id] && (c.track === 'ko' ? TAGS[w.id][3] === 'A' && w.ko : TAGS[w.id][1]));
  if (s.state === 'locked' || s.state === 'soon' || pool.length < 20) {
    $app.innerHTML = `
      <div class="backbar"><a href="#/exam" class="backlink">‹</a><b>${esc(c.name)}</b></div>
      <div class="empty">${ic('trophy', 'empty-ic')}<p>${s.state === 'soon' ? '這一級的內容還在製作中，先把其他級拿下吧！' : `再學 ${s.left || 20 - pool.length} 個字，就可以考「${esc(c.name)}」了！`}</p>
      <a class="btn primary big" href="#/exam/bank">${ic('book')} 去單字庫學新字</a></div>`;
    return;
  }
  $app.innerHTML = `
    <div class="backbar"><a href="#/exam" class="backlink">‹</a><b>${esc(c.name)}</b></div>
    <div class="ex-start glass">
      ${ic('medal', 'empty-ic')}
      <h2>${esc(c.name)} 認證考試</h2>
      <p>${esc(c.desc)}</p>
      <ul><li>一共 20 題：${c.track === 'ko' ? '看中文選韓文、聽韓文選意思' : '選擇、聽力、拼字、句子克漏字'}</li><li>答對 ${Math.round(PASS * 20)} 題以上就拿到證書</li><li>題目都從你學過的字出</li></ul>
      <button type="button" class="btn primary big" id="exGo">${ic('star')} 開始考試</button>
      <p class="muted small">※ 練習生學院自家認證，不是官方證書</p>
    </div>`;
  $app.querySelector('#exGo').onclick = () => {
    run = { mode: 'test', cert: c.id, route: `test/${c.id}`, title: `認證考試・${c.name}`, back: '#/exam', phase: 'quiz', qs: buildQs(pool, c.track === 'ko' ? KO_PLAN(20) : EN_PLAN(20)), i: 0, correct: 0, combo: 0, maxCombo: 0, newly: [] };
    drawRun();
  };
}

// 練習小考：從學過的字出 10 題（8 題英文、2 題韓文）
function startQuiz() {
  const L = store.get().course.learned;
  const pool = Object.keys(L).map((id) => WORDS[id]).filter(Boolean);
  if (pool.length < 6) {
    $app.innerHTML = `
      <div class="backbar"><a href="#/exam" class="backlink">‹</a><b>模擬小考</b></div>
      <div class="empty">${ic('trophy', 'empty-ic')}<p>先學幾個字再來考吧！</p><a class="btn primary big" href="#/talk">${ic('mic')} 去上今天的課</a><a class="btn big" href="#/exam/bank">${ic('book')} 單字庫</a></div>`;
    return;
  }
  const n = Math.min(10, pool.length);
  const plan = [...EN_PLAN(n - 2), 'zh2ko', 'kolisten'];
  run = { mode: 'quiz', route: 'quiz', title: '模擬小考', back: '#/exam', phase: 'quiz', qs: buildQs(pool, plan), i: 0, correct: 0, combo: 0, maxCombo: 0, newly: [] };
  drawRun();
}

function renderCert(id) {
  const c = CERTS.find((x) => x.id === id);
  const done = c && examState().certs[id];
  if (!done) { location.hash = '#/exam'; return; }
  $app.innerHTML = `
    <div class="backbar no-print"><a href="#/exam" class="backlink">‹</a><b>${esc(c.name)}</b></div>
    ${certHTML(c, done)}
    <div class="row center no-print"><button type="button" class="btn" id="certPrint">列印證書</button><a class="btn primary" href="#/exam">回考試準備度</a></div>`;
  $app.querySelector('#certPrint').onclick = () => window.print();
}

export function renderExam($root, arg = '') {
  $app = $root;
  stopSpeaking();
  const [page, sub] = String(arg || '').split('/');
  if (page !== 'bank' || sub) run = null;
  autoCerts();
  if (page === 'bank') return sub ? startBank(sub) : renderBankList();
  if (page === 'test') return startTest(sub);
  if (page === 'quiz') return startQuiz();
  if (page === 'cert') return renderCert(sub);
  return renderHub();
}
