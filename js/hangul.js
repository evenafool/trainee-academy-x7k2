// 第 0 課：韓文 40 音（19 個子音＋21 個母音）——先打基礎再上課
// 四關：基本母音 10 → 基本子音 14 → 雙子音 5 → 複合母音 11；每個字母點了會念（念成音節，例如 ㄱ→가）
// 每關有小測驗（聽音選字母、看字母選讀音），80 分過關；還有「拼字積木」：子音＋母音拼成一個字
import * as store from './store.js';
import { esc, ic, shuffle, speakAsync, stopSpeaking, toast, confetti, sleep, reducedMotion } from './util.js';
import { sfx } from './sound.js';
import { mountHost } from './npc.js';
import { PICS, SECRETS, VOWELS, letterSVG, morphSVG, spoken } from './hangul-art.js';
import { renderSing } from './hsing.js';
import { avatarState, autoOutfit } from './avatar.js';
const avatarOutfit = () => avatarState().outfit || autoOutfit();

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
const ROM_SHORT = { 'ㅇ': '開頭不出聲・收尾像ㄥ' };
const sylOf = (ch) => ALL.find((x) => x.ch === ch)?.syl || ch;
// 重播動畫：拿掉 play 再加回去
const replay = (el) => { if (!el) return; el.classList.remove('play'); void el.getBoundingClientRect(); el.classList.add('play'); };

// ───────── 總覽：四關＋拼字積木 ─────────
// 40 音專區首頁：主要任務是「唱 40 音」（4 首原唱歌）；逐字卡片和拼字積木是加練
const SONGS = { v1: '모음 노래', c1: '자음 노래', c2: '된소리 노래', v2: '이중 모음 노래' };
// 每首歌裡會唱到的單字（卡片上預告，和歌詞的中文翻譯同一批）
const WORDS = { v1: ['아이', '우유', '여우'], c1: ['가방', '나비', '바나나'], c2: ['까치', '딸기', '빵'], v2: ['의자', '회사', '귀'] };
function renderHome() {
  const h = hState();
  const p = hangulProgress();
  const sung = h.sung || {};
  const nSung = STAGES.filter((s) => sung[s.id]).length;
  const nextSong = STAGES.find((s) => !sung[s.id]);
  const nextStage = STAGES.find((s) => !h.passed[s.id]);
  const glyphs = (s, n) => s.items.slice(0, n).map((it) => esc(it[0])).join('');
  $app.innerHTML = `
    <div class="backbar"><a href="#/home" class="backlink">‹</a><b>${ic('ko')} 第 0 課：韓文 40 音</b></div>
    <section class="hg-main">
      <header class="hg-main-head">
        <span class="hg-tag">${ic('star')} 主要任務</span>
        <h2>${ic('mic')}唱 40 音</h2>
        <div class="hg-stars" aria-label="唱完 ${nSung}／${STAGES.length} 首">${STAGES.map((s) => `<i class="${sung[s.id] ? 'on' : ''}">★</i>`).join('')}</div>
      </header>
      <div class="hg-songs">
        ${STAGES.map((s, i) => `
          <a class="hg-song tone-${s.id} ${sung[s.id] ? 'done' : ''} ${nextSong?.id === s.id ? 'next' : ''}" href="#/hangul/sing-${s.id}" aria-label="${esc(s.title)}・${SONGS[s.id] || ''}">
            <span class="hg-song-pic">
              <span class="hg-cover" lang="ko" aria-hidden="true">${s.items.slice(0, 6).map((it, k) => `<i class="g${k}">${esc(it[0])}</i>`).join('')}</span>
              <span class="hg-song-no">${i + 1}</span>
            </span>
            ${sung[s.id] ? `<span class="hg-song-badge">${ic('medal')}</span>` : ''}
            <span class="hg-song-words" lang="ko">${(WORDS[s.id] || []).map((w) => `<i>${w}</i>`).join('')}</span>
            <span class="hg-song-name"><b>${esc(s.title.split('：')[1])}</b></span>
            <em class="hg-song-btn">${ic('mic')}</em>
          </a>`).join('')}
      </div>
    </section>
    <section class="hg-extra">
      <h3><img src="assets/art/icons/deck-ko-hangul.webp" alt="">加練<small>逐字聽發音・小測驗</small></h3>
      <div class="hg-stages">
        ${STAGES.map((s) => `
          <a class="hg-stage tone-${s.id} ${h.passed[s.id] ? 'done' : ''} ${nextStage?.id === s.id ? 'next' : ''}" href="#/hangul/${s.id}" aria-label="${esc(s.title)}">
            <span class="hg-stage-glyph" lang="ko">${esc(s.items[0][0])}</span>
            <b>${esc(s.title.split('：')[1])}</b>
            ${h.passed[s.id] ? `<i class="hg-stage-ok">${ic('medal')}</i>` : ''}
          </a>`).join('')}
        <a class="hg-stage hg-build-tile" href="#/hangul/build" aria-label="拼字積木">
          <span class="hg-stage-glyph"><i class="c">ㅁ</i><i class="v">ㅣ</i></span><b>拼字積木</b>
        </a>
      </div>
      <small class="hg-extra-meta">過關 ${p.passed}／${p.stages}・聽過 ${p.heard}／${TOTAL} 個字母</small>
    </section>`;
}

// ───────── 一關：認識字母（點了會念）→ 小測驗 ─────────
function renderStage(id) {
  const st = STAGES.find((s) => s.id === id);
  if (!st) { location.hash = '#/hangul'; return; }
  const h = hState();
  const items = ALL.filter((x) => x.stage === id);
  $app.innerHTML = `
    <div class="backbar"><a href="#/hangul" class="backlink">‹</a><b>${esc(st.title)}</b></div>
    ${secretHTML(st)}
    <p class="hg-tip">點卡片聽發音，卡片會翻面告訴你怎麼記！全部聽過就挑戰小測驗。</p>
    <div class="hg-grid">
      ${items.map((x) => `
        <button type="button" class="hg-card ${h.heard[x.ch] ? 'heard' : ''} ${VOWELS.has(x.ch) ? 'is-v' : 'is-c'}" data-ch="${esc(x.ch)}" aria-label="${esc(x.ch)}，點一下翻面">
          <span class="hg-flip">
            <span class="hg-face front">
              <span class="hg-big" lang="ko">${esc(x.ch)}</span>
              <span class="hg-rom">${esc(x.rom.length > 8 ? '不出聲／ng' : x.rom)}</span>
              <span class="hg-turn">${ic('cards')}點我翻面</span>
            </span>
            <span class="hg-face back">
              <span class="hg-art">${letterSVG(x.ch)}</span>
              <span class="hg-rom">${esc(ROM_SHORT[x.ch] || `${x.rom}・像 ${x.zh.replace(/（.*）/, '')}`)}</span>
              ${PICS[x.ch] ? `<span class="hg-pic">${esc(PICS[x.ch].label)}</span>` : ''}
              <span class="hg-ex"><i>例字</i><b lang="ko">${esc(x.word)}</b><small>${esc(x.mean)}</small></span>
            </span>
          </span>
        </button>`).join('')}
    </div>
    <div class="hg-actions">
      <button type="button" class="btn primary big" id="hgGuide">${ic('speaker')} 全部念一遍</button>
      <a class="btn big hg-sing-btn" href="#/hangul/sing-${st.id}">${ic('mic')} 上台唱這關</a>
      <button type="button" class="btn big" id="hgQuiz">${ic('star')} 小測驗（8 題，80 分過關）</button>
    </div>
    <div class="hg-guide" id="hgGuideBox" hidden><b id="hgNow"></b><p id="hgSaid">老師念的時候可以小聲跟著念</p><button type="button" class="pill-btn" id="hgStop">停止</button></div>`;
  // 進來時：祕密卡變身（字母卡翻到背面才畫）
  requestAnimationFrame(() => { $app.querySelectorAll('.hg-secret .hgm').forEach((el) => el.classList.add('play')); });
  bindSecret(st);
  $app.querySelectorAll('.hg-card').forEach((b) => b.onclick = async () => {
    const x = ALL.find((y) => y.ch === b.dataset.ch);
    h.heard[x.ch] = true;
    store.save();
    b.classList.add('heard');
    stopSpeaking();
    // 正面 → 翻到背面：等翻完再一筆一筆畫、跳出小圖；念發音＋例字
    if (!b.classList.contains('flipped')) {
      flipTo(b, true);
      await say(x.syl, 0.55);
      await sleep(350);
      await say(x.word, 0.65);
      return;
    }
    // 背面 → 翻回正面，只念發音
    flipTo(b, false);
    await say(x.syl, 0.55);
  });
  $app.querySelector('#hgQuiz').onclick = () => startQuiz(st, items);
  $app.querySelector('#hgGuide').onclick = () => guide(st, items);
}

// 字母卡翻面：翻到背面時重播畫字動畫
function flipTo(card, back) {
  card.classList.toggle('flipped', back);
  if (!back) return;
  const art = card.querySelector('.hga');
  art?.style.setProperty('--d', '.35s');
  replay(art);
}

// 這一關的祕密規則：字母變身動畫，點了念「前 → 後」
function secretHTML(st) {
  const sec = SECRETS[st.id];
  if (!sec) return '';
  return `<section class="hg-secret">
    <div class="hg-sec-h"><span class="hg-sec-no">祕密 ${sec.no}</span><b>${esc(sec.title)}</b><button type="button" class="hg-sec-say" id="hgSecSay" aria-label="聽老師說">${ic('speaker')}</button></div>
    <div class="hg-morphs">${sec.pairs.map(([a, b, op], k) => `<button type="button" class="hg-morph" data-a="${a}" data-b="${b}">
      <span class="hg-mfrom">${letterSVG(a, { decor: false })}</span><span class="hg-mop">${esc(op || sec.op)}</span><span class="hg-mto">${morphSVG(a, b, 0.3 + k * 0.5)}</span>
      <small lang="ko">${sylOf(a)} → ${sylOf(b)}</small></button>`).join('')}</div>
    <details class="hg-more"><summary>${ic('star')} 還有 ${sec.facts.length} 個小知識</summary>
      <ul class="hg-facts">${sec.facts.map(([ch, t]) => `<li><span class="hg-fic">${letterSVG(ch, { decor: false })}</span><span>${esc(t)}</span></li>`).join('')}</ul>
    </details>
  </section>`;
}
function bindSecret(st) {
  const sec = SECRETS[st.id];
  if (!sec) return;
  $app.querySelector('#hgSecSay').onclick = async () => {
    stopSpeaking();
    $app.querySelectorAll('.hg-morph .hgm').forEach(replay);
    await speakAsync(spoken(sec.say), 'zh-TW');
  };
  $app.querySelectorAll('.hg-morph').forEach((b) => b.onclick = async () => {
    const m = b.querySelector('.hgm');
    m.style.setProperty('--d', '0s');
    replay(m);
    stopSpeaking();
    await say(sylOf(b.dataset.a), 0.6);
    await sleep(250);
    await say(sylOf(b.dataset.b), 0.6);
  });
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
  // 只念發音＋例字，不講解
  for (const x of items) {
    if (!alive()) return;
    $app.querySelectorAll('.hg-card').forEach((b) => b.classList.toggle('now', b.dataset.ch === x.ch));
    $app.querySelector(`.hg-card[data-ch="${x.ch}"]`)?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    $now.textContent = `${x.ch}　${x.rom}　${PICS[x.ch]?.label || `像 ${x.zh}`}`;
    const card = $app.querySelector(`.hg-card[data-ch="${x.ch}"]`);
    if (card) flipTo(card, true);
    await sleep(250);
    if (!alive()) return;
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
  // 變身題：ㄱ＋一筆會變成誰？（用這關的祕密規則出題）
  const sec = SECRETS[st.id];
  const morphs = sec ? shuffle(sec.pairs.filter(([, b]) => items.some((y) => y.ch === b))).slice(0, 2) : [];
  morphs.forEach(([a, b, op], k) => {
    const x = items.find((y) => y.ch === b);
    const opts = shuffle([x, ...shuffle(pool.filter((y) => y.ch !== b)).slice(0, 3)]);
    qs[k ? 5 : 2] = { x, type: 'morph', opts, from: a, op: op || sec.op };
  });
  let i = 0;
  let good = 0;
  const draw = () => {
    if (i >= qs.length) return finish();
    const q = qs[i];
    $app.innerHTML = `
      <div class="quiz-top"><a class="x" href="#/hangul/${st.id}">✕</a><div class="qbar"><i style="width:${(i / qs.length) * 100}%"></i></div><div class="combo">${i + 1}/${qs.length}</div></div>
      <div class="q-card">
        <div class="q-tag">${q.type === 'listen' ? '聽聽看，是哪一個字母？' : q.type === 'morph' ? '變身題：會變成誰？' : '這個字母念什麼？'}</div>
        ${q.type === 'listen' ? `<button type="button" class="listen" id="hgHear" aria-label="再聽一次">${ic('speaker')}</button>`
          : q.type === 'morph' ? `<div class="hg-qmorph" id="hgQm"><span class="hg-qa">${letterSVG(q.from, { decor: false })}</span><span class="hg-qop">${esc(q.op)}</span><b>？</b></div>`
          : `<div class="q-prompt huge">${esc(q.prompt)}</div>`}
      </div>
      <div class="options hg-opts">${q.opts.map((o, j) => `<button type="button" class="opt ${q.type !== 'rom' ? 'huge' : ''}" data-j="${j}">${esc(q.type !== 'rom' ? o.ch : `${o.rom}（${o.zh}）`)}</button>`).join('')}</div>`;
    const play = () => say(q.x.syl, 0.6);
    if (q.type === 'listen') { $app.querySelector('#hgHear').onclick = play; setTimeout(play, 250); }
    $app.querySelectorAll('.opt').forEach((b) => b.onclick = async () => {
      const ok = q.opts[+b.dataset.j].ch === q.x.ch;
      $app.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; x.classList.add(q.opts[j].ch === q.x.ch ? 'right' : j === +b.dataset.j ? 'wrong' : 'dim'); });
      if (q.type === 'morph') {
        // 答完播變身動畫給她看
        const $qm = $app.querySelector('#hgQm');
        if ($qm) { $qm.innerHTML = `<span class="hg-qa">${letterSVG(q.from, { decor: false })}</span><span class="hg-qop">${esc(q.op)}</span><span class="hg-qa big">${morphSVG(q.from, q.x.ch)}</span>`; requestAnimationFrame(() => $qm.querySelector('.hgm')?.classList.add('play')); }
      }
      if (ok) { good++; sfx('right'); host?.right(); } else { sfx('soft'); host?.say(q.type === 'morph' ? `${q.from}${q.op}＝${q.x.ch}` : `是「${q.x.ch}」${q.x.rom}`, 'think', 3000); }
      await say(q.x.syl, 0.6);
      setTimeout(() => { i++; draw(); }, q.type === 'morph' ? 1600 : ok ? 500 : 1200);
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
  // 舞台模式全螢幕：不要 NPC 小幫手擋住
  if (arg.startsWith('sing')) { document.querySelector('.npc-host')?.remove(); return renderSing($root, arg.slice(5) || (STAGES.find((x) => !hState().passed[x.id]) || STAGES[0]).id); }
  host = mountHost('hangul');
  if (arg === 'build') return renderBuilder();
  if (arg) return renderStage(arg);
  return renderHome();
}
