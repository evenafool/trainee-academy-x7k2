// 第 0 課：韓文 40 音（19 個子音＋21 個母音）——先打基礎再上課
// 四關：基本母音 10 → 基本子音 14 → 雙子音 5 → 複合母音 11；每個字母點了會念（念成音節，例如 ㄱ→가）
// 每關有小測驗（聽音選字母、看字母選讀音），80 分過關；還有「拼字積木」：子音＋母音拼成一個字
import * as store from './store.js';
import { esc, ic, shuffle, speakAsync, stopSpeaking, toast, confetti, sleep } from './util.js';
import { sfx } from './sound.js';
import { mountHost } from './npc.js';

// [字母, 拼音, 注音小撇步, 念的時候用的音節, 例字, 例字意思]
export const STAGES = [
  { id: 'v1', title: '第 1 關：基本母音', sub: '10 個，先學會「嘴型」', items: [
    ['ㅏ', 'a', 'ㄚ', '아', '아이', '小孩'], ['ㅑ', 'ya', '一ㄚ', '야', '야구', '棒球'],
    ['ㅓ', 'eo', 'ㄛ（嘴巴張開）', '어', '어머니', '母親'], ['ㅕ', 'yeo', '一ㄛ（嘴巴張開）', '여', '여우', '狐狸'],
    ['ㅗ', 'o', 'ㄛ（嘴巴嘟圓）', '오', '오이', '小黃瓜'], ['ㅛ', 'yo', '一ㄛ（嘴巴嘟圓）', '요', '요리', '料理'],
    ['ㅜ', 'u', 'ㄨ', '우', '우유', '牛奶'], ['ㅠ', 'yu', '一ㄨ', '유', '유리', '玻璃'],
    ['ㅡ', 'eu', 'ㄜ（嘴角往兩邊拉平）', '으', '음악', '音樂'], ['ㅣ', 'i', '一', '이', '이', '牙齒'],
  ] },
  { id: 'c1', title: '第 2 關：基本子音', sub: '14 個，像注音的聲母', items: [
    ['ㄱ', 'g / k', 'ㄍ', '가', '가방', '書包'], ['ㄴ', 'n', 'ㄋ', '나', '나비', '蝴蝶'],
    ['ㄷ', 'd / t', 'ㄉ', '다', '다리', '腿'], ['ㄹ', 'r / l', 'ㄌ', '라', '라면', '泡麵'],
    ['ㅁ', 'm', 'ㄇ', '마', '모자', '帽子'], ['ㅂ', 'b / p', 'ㄅ', '바', '바나나', '香蕉'],
    ['ㅅ', 's', 'ㄙ', '사', '사과', '蘋果'], ['ㅇ', '開頭不發音／收尾 ng', '開頭當空位、結尾像ㄥ', '아', '오리', '鴨子'],
    ['ㅈ', 'j', 'ㄗ／ㄐ', '자', '자', '尺'], ['ㅊ', 'ch', 'ㄘ／ㄑ（送氣）', '차', '치마', '裙子'],
    ['ㅋ', 'k', 'ㄎ（送氣）', '카', '코', '鼻子'], ['ㅌ', 't', 'ㄊ（送氣）', '타', '토끼', '兔子'],
    ['ㅍ', 'p', 'ㄆ（送氣）', '파', '포도', '葡萄'], ['ㅎ', 'h', 'ㄏ', '하', '하나', '一個'],
  ] },
  { id: 'c2', title: '第 3 關：雙子音', sub: '5 個，喉嚨用力、短短的', items: [
    ['ㄲ', 'kk', '用力的ㄍ', '까', '까치', '喜鵲'], ['ㄸ', 'tt', '用力的ㄉ', '따', '딸기', '草莓'],
    ['ㅃ', 'pp', '用力的ㄅ', '빠', '빵', '麵包'], ['ㅆ', 'ss', '用力的ㄙ', '싸', '싸요', '便宜'],
    ['ㅉ', 'jj', '用力的ㄗ', '짜', '짜요', '鹹'],
  ] },
  { id: 'v2', title: '第 4 關：複合母音', sub: '11 個，兩個母音合在一起', items: [
    ['ㅐ', 'ae', 'ㄝ', '애', '개', '狗'], ['ㅒ', 'yae', '一ㄝ', '얘', '얘기', '聊天'],
    ['ㅔ', 'e', 'ㄝ', '에', '게', '螃蟹'], ['ㅖ', 'ye', '一ㄝ', '예', '예', '是（敬語）'],
    ['ㅘ', 'wa', 'ㄨㄚ', '와', '와요', '來了'], ['ㅙ', 'wae', 'ㄨㄝ', '왜', '왜', '為什麼'],
    ['ㅚ', 'oe', 'ㄨㄝ', '외', '회사', '公司'], ['ㅝ', 'wo', 'ㄨㄛ', '워', '뭐', '什麼'],
    ['ㅞ', 'we', 'ㄨㄝ', '웨', '웨이터', '服務生'], ['ㅟ', 'wi', 'ㄨ一', '위', '귀', '耳朵'],
    ['ㅢ', 'ui', 'ㄜ一', '의', '의자', '椅子'],
  ] },
];
const ALL = STAGES.flatMap((s) => s.items.map((it) => ({ stage: s.id, ch: it[0], rom: it[1], zh: it[2], syl: it[3], word: it[4], mean: it[5] })));
export const TOTAL = ALL.length; // 40

function hState() {
  const s = store.get();
  s.hangul ??= {};
  s.hangul.heard ??= {};
  s.hangul.passed ??= {};
  return s.hangul;
}
export function hangulProgress() {
  const h = hState();
  const heard = ALL.filter((x) => h.heard[x.ch]).length;
  const passed = STAGES.filter((s) => h.passed[s.id]).length;
  return { heard, passed, stages: STAGES.length, done: passed === STAGES.length };
}

let $app = null;
let host = null;
const say = async (t, rate = 0.7) => { await speakAsync(t, 'ko-KR', rate); };

// ───────── 總覽：四關＋拼字積木 ─────────
function renderHome() {
  const h = hState();
  const p = hangulProgress();
  const nextStage = STAGES.find((s) => !h.passed[s.id]);
  $app.innerHTML = `
    <div class="backbar"><a href="#/home" class="backlink">‹</a><b>${ic('ko')} 第 0 課：韓文 40 音</b></div>
    <section class="hg-hero">
      <div class="hg-block"><span class="c">ㅁ</span><span class="plus">＋</span><span class="v">ㅣ</span><span class="eq">＝</span><b>미</b></div>
      <p>韓文字像<b>積木</b>：<b class="c">子音</b>＋<b class="v">母音</b>拼成一個字。學會這 40 個字母，所有韓文都念得出來！</p>
      <div class="hg-prog"><i style="width:${(p.passed / p.stages) * 100}%"></i></div>
      <small>已過關 ${p.passed}／${p.stages} 關・聽過 ${p.heard}／${TOTAL} 個字母</small>
    </section>
    <div class="hg-stages">
      ${STAGES.map((s, i) => `
        <a class="hg-stage ${h.passed[s.id] ? 'done' : ''} ${nextStage?.id === s.id ? 'tap-hint' : ''}" href="#/hangul/${s.id}">
          <span class="hg-num">${i + 1}</span>
          <span class="hg-chars">${s.items.slice(0, 5).map((it) => esc(it[0])).join(' ')}${s.items.length > 5 ? ' …' : ''}</span>
          <b>${esc(s.title.split('：')[1])}</b><small>${esc(s.sub)}</small>
          <em>${h.passed[s.id] ? `${ic('medal')} 過關` : nextStage?.id === s.id ? '從這裡開始！' : `${s.items.length} 個`}</em>
          ${nextStage?.id === s.id ? '<span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>點我！</b></span>' : ''}
        </a>`).join('')}
    </div>
    <a class="hg-builder-link" href="#/hangul/build">${ic('cards')}<b>拼字積木</b><small>選一個子音＋一個母音，拼出韓文字聽聽看</small></a>`;
}

// ───────── 一關：認識字母（點了會念）→ 小測驗 ─────────
function renderStage(id) {
  const st = STAGES.find((s) => s.id === id);
  if (!st) { location.hash = '#/hangul'; return; }
  const h = hState();
  const items = ALL.filter((x) => x.stage === id);
  $app.innerHTML = `
    <div class="backbar"><a href="#/hangul" class="backlink">‹</a><b>${esc(st.title)}</b></div>
    <p class="hg-tip">點卡片聽發音和單字，全部聽過就挑戰小測驗。</p>
    <div class="hg-grid">
      ${items.map((x) => `
        <button type="button" class="hg-card ${h.heard[x.ch] ? 'heard' : ''}" data-ch="${esc(x.ch)}">
          <span class="hg-ch">${esc(x.ch)}</span>
          <span class="hg-rom">${esc(x.rom)}</span>
          <span class="hg-zh">像 ${esc(x.zh)}</span>
          <span class="hg-ex">${esc(x.word)}<small>${esc(x.mean)}</small></span>
        </button>`).join('')}
    </div>
    <div class="hg-actions">
      <button type="button" class="btn primary big" id="hgGuide">${ic('speaker')} 全部念一遍</button>
      <button type="button" class="btn big" id="hgQuiz">${ic('star')} 小測驗（8 題，80 分過關）</button>
    </div>
    <div class="hg-guide" id="hgGuideBox" hidden><b id="hgNow"></b><p id="hgSaid">老師念的時候可以小聲跟著念</p><button type="button" class="pill-btn" id="hgStop">停止</button></div>`;
  $app.querySelectorAll('.hg-card').forEach((b) => b.onclick = async () => {
    const x = ALL.find((y) => y.ch === b.dataset.ch);
    h.heard[x.ch] = true;
    store.save();
    b.classList.add('heard', 'pop');
    setTimeout(() => b.classList.remove('pop'), 400);
    stopSpeaking();
    // 只念：發音（音節）→ 單字，不講解
    await say(x.syl, 0.55);
    await sleep(350);
    await say(x.word, 0.65);
  });
  $app.querySelector('#hgQuiz').onclick = () => startQuiz(st, items);
  $app.querySelector('#hgGuide').onclick = () => guide(st, items);
}

// 語音教學：老師一個一個帶念（中文講解 → 韓文示範兩次＋例字 → 孩子跟念 → 稱讚或再示範）
let guideRun = 0;
async function guide(st, items) {
  const my = ++guideRun;
  const h = hState();
  const box = $app.querySelector('#hgGuideBox');
  const $now = $app.querySelector('#hgNow');
  const $said = $app.querySelector('#hgSaid');
  box.hidden = false;
  $app.querySelector('#hgStop').onclick = () => { guideRun++; stopSpeaking(); box.hidden = true; };
  window.addEventListener('hashchange', () => { guideRun++; }, { once: true });
  const alive = () => my === guideRun;
  const zh = (s) => speakAsync(s, 'zh-TW');
  for (const x of items) {
    if (!alive()) return;
    $app.querySelectorAll('.hg-card').forEach((b) => b.classList.toggle('now', b.dataset.ch === x.ch));
    $app.querySelector(`.hg-card[data-ch="${x.ch}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $now.textContent = `${x.ch}　${x.rom}　像 ${x.zh}`;
    await say(x.syl, 0.55); await sleep(400);
    if (!alive()) return;
    await say(x.word, 0.65);
    h.heard[x.ch] = true; store.save();
    $app.querySelector(`.hg-card[data-ch="${x.ch}"]`)?.classList.add('heard');
    await sleep(300);
  }
  if (!alive()) return;
  $app.querySelectorAll('.hg-card').forEach((b) => b.classList.remove('now'));
  $now.textContent = '這一關念完了！';
  $said.textContent = '想再聽哪一個，就點那張卡片';
  $app.querySelector('#hgQuiz')?.classList.add('tap-hint');
}

// 測驗：聽音節選字母、看字母選讀音
function startQuiz(st, items) {
  const pool = items.length >= 4 ? items : ALL.filter((x) => x.stage.startsWith(st.id[0]));
  const qs = shuffle([...items, ...items]).slice(0, 8).map((x, i) => {
    const opts = shuffle([x, ...shuffle(pool.filter((y) => y.ch !== x.ch)).slice(0, 3)]);
    return i % 2 ? { x, type: 'rom', opts, prompt: x.ch } : { x, type: 'listen', opts };
  });
  let i = 0;
  let good = 0;
  const draw = () => {
    if (i >= qs.length) return finish();
    const q = qs[i];
    $app.innerHTML = `
      <div class="quiz-top"><a class="x" href="#/hangul/${st.id}">✕</a><div class="qbar"><i style="width:${(i / qs.length) * 100}%"></i></div><div class="combo">${i + 1}/${qs.length}</div></div>
      <div class="q-card">
        <div class="q-tag">${q.type === 'listen' ? '聽聽看，是哪一個字母？' : '這個字母念什麼？'}</div>
        ${q.type === 'listen' ? `<button type="button" class="listen" id="hgHear" aria-label="再聽一次">${ic('speaker')}</button>` : `<div class="q-prompt huge">${esc(q.prompt)}</div>`}
      </div>
      <div class="options hg-opts">${q.opts.map((o, j) => `<button type="button" class="opt ${q.type === 'listen' ? 'huge' : ''}" data-j="${j}">${esc(q.type === 'listen' ? o.ch : `${o.rom}（${o.zh}）`)}</button>`).join('')}</div>`;
    const play = () => say(q.x.syl, 0.6);
    if (q.type === 'listen') { $app.querySelector('#hgHear').onclick = play; setTimeout(play, 250); }
    $app.querySelectorAll('.opt').forEach((b) => b.onclick = async () => {
      const ok = q.opts[+b.dataset.j].ch === q.x.ch;
      $app.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; x.classList.add(q.opts[j].ch === q.x.ch ? 'right' : j === +b.dataset.j ? 'wrong' : 'dim'); });
      if (ok) { good++; sfx('right'); host?.right(); } else { sfx('soft'); host?.say(`是「${q.x.ch}」${q.x.rom}`, 'think', 3000); }
      await say(q.x.syl, 0.6);
      setTimeout(() => { i++; draw(); }, ok ? 500 : 1200);
    });
  };
  const finish = () => {
    const score = Math.round((good / qs.length) * 100);
    const h = hState();
    const pass = score >= 80;
    if (pass && !h.passed[st.id]) { h.passed[st.id] = { at: Date.now(), score }; confetti(); }
    const r = store.addProgress(10 + good * 2, 'quiz', { title: `韓文 40 音・${st.title}`, good, tries: qs.length });
    sfx(pass ? 'reward' : 'stamp');
    host?.end();
    const next = STAGES[STAGES.indexOf(st) + 1];
    $app.innerHTML = `
      <section class="result">
        <div class="score-ring" style="--p:${score}"><b>${score}</b><small>分</small></div>
        <h1>${pass ? `${esc(st.title.split('：')[1])} 過關！` : '再練一下就過關了！'}</h1>
        <div class="muted">測驗蓋章 ✓ 今日集章 ${Math.min(r.daily.stamps.length, store.DAILY_GOAL)}/${store.DAILY_GOAL}</div>
        <div class="actions">
          ${pass && next ? `<a class="btn primary big" href="#/hangul/${next.id}">下一關：${esc(next.title.split('：')[1])}</a>` : ''}
          ${pass && !next ? `<a class="btn primary big" href="#/talk">${ic('mic')} 40 音全部過關！去上今天的課</a>` : ''}
          ${!pass ? `<a class="btn primary big" href="#/hangul/${st.id}">回去再聽一次</a>` : ''}
          <a class="btn big" href="#/hangul">回 40 音總覽</a>
        </div>
      </section>`;
    if (pass && !next) toast('韓文 40 音全部過關！基礎打好了！');
  };
  draw();
}

// ───────── 拼字積木：子音＋母音＝一個字（用 Unicode 算出音節） ─────────
const INIT = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MED = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const syllable = (c, v) => String.fromCharCode(0xac00 + (INIT.indexOf(c) * 21 + MED.indexOf(v)) * 28);
function renderBuilder() {
  let c = 'ㅁ';
  let v = 'ㅣ';
  const draw = () => {
    const s = syllable(c, v);
    $app.innerHTML = `
      <div class="backbar"><a href="#/hangul" class="backlink">‹</a><b>拼字積木</b></div>
      <div class="hg-build">
        <div class="hg-block big"><span class="c">${c}</span><span class="plus">＋</span><span class="v">${v}</span><span class="eq">＝</span><b>${s}</b>
          <button type="button" class="say" id="hgSay" aria-label="念出來">${ic('speaker')}</button></div>
        <h3>子音（藍色）</h3><div class="hg-pick c">${INIT.map((x) => `<button type="button" class="${x === c ? 'on' : ''}" data-c="${x}">${x}</button>`).join('')}</div>
        <h3>母音（粉紅色）</h3><div class="hg-pick v">${MED.map((x) => `<button type="button" class="${x === v ? 'on' : ''}" data-v="${x}">${x}</button>`).join('')}</div>
      </div>`;
    $app.querySelector('#hgSay').onclick = () => say(s, 0.6);
    $app.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { c = b.dataset.c; draw(); say(syllable(c, v), 0.6); });
    $app.querySelectorAll('[data-v]').forEach((b) => b.onclick = () => { v = b.dataset.v; draw(); say(syllable(c, v), 0.6); });
  };
  draw();
}

export function renderHangul($root, arg = '') {
  $app = $root;
  stopSpeaking();
  host = mountHost('hangul');
  if (arg === 'build') return renderBuilder();
  if (arg) return renderStage(arg);
  return renderHome();
}
