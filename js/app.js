import { STAGES, SUBJECTS, DECKS, RANKS, ACCENTS, CHEERS_RIGHT, CHEERS_WRONG } from './data.js';
import { LEVELS, WORDS, STORIES, TEASERS, CHAPTERS, KEEPSAKES } from './course.js';
import { applyNames, DEFAULT_NAMES } from './names.js';
import { dayStr, ttsOK, voiceFor, speak as speakTTS, ic, wic, listenOnce, speechMatches, confetti, initFx, sparkleAt, flyText, reducedMotion } from './util.js';
import { sfx, armAudio, setMusic, setSfx } from './sound.js';
import { openDrama } from './drama.js';
import { renderMatch, renderSpeed } from './games.js';
import { renderTalk, stopTalk, todayLesson } from './talk.js';
import { rewardForDay, rewardHTML, MEMBERS, MERCH } from './rewards.js';
import { renderExam, examNext, examStats } from './exam.js';
import { mountHost } from './npc.js';
import { renderHangul, hangulProgress, TOTAL as HANGUL_TOTAL } from './hangul.js';
import { avatarHTML, avatarState, autoOutfit, OUTFITS, newUnlocks, renderCloset } from './avatar.js';
import { renderFriends, friendCount } from './friends.js';
import { initCloud, accountHTML, bindAccount, currentUser, onChats } from './cloud.js';
import { renderChat, stopChat } from './chat.js';
import { renderBinders } from './binder.js';

// 啟動時把課程、獎勵裡的暫定名換成孩子取的名字（改名後重新整理頁面就會重新套用）
if (Object.keys(store.get().names || {}).length) {
  const IDOL_NAMES = { ...DEFAULT_NAMES, ...store.get().names };
  for (const o of [WORDS, LEVELS, STORIES, TEASERS, CHAPTERS, KEEPSAKES, MEMBERS, MERCH, DECKS]) applyNames(o, IDOL_NAMES);
}
import * as store from './store.js';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');

// ───────── 小工具 ─────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// 題庫圖示：有 assets/art/icons/deck-<id>.webp 就用圖，沒有就退回 emoji
const dic = (d, cls = '') => `<img class="ic deck-ic ${cls}" src="assets/art/icons/deck-${d.id}.webp" alt="" onerror="this.replaceWith(document.createTextNode('${d.emoji}'))">`;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sample = (a, n) => shuffle(a).slice(0, n);
const uniq = (a) => [...new Set(a)];
const deckById = (id) => DECKS.find((d) => d.id === id);
const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
const stageById = (id) => STAGES.find((s) => s.id === id) || STAGES[0];

function itemByKey(key) {
  const [deckId, i] = key.split(':');
  const deck = deckById(deckId);
  const item = deck?.items[+i];
  return item ? { deck, item, i: +i } : null;
}

function rankOf(xp) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (xp >= r.xp) idx = i; });
  return { ...RANKS[idx], idx, next: RANKS[idx + 1] };
}

function currentStreak() {
  const s = store.get();
  if (!s.lastDay) return 0;
  return s.lastDay === store.today() || s.lastDay === dayStr(-1) ? s.streak : 0;
}

// 依學程篩選：題目有 st 欄位時以題目為準
const itemFits = (item, stage) => !item.st || item.st.includes(stage);
const deckIndices = (deck, stage) => deck.items.map((it, i) => (itemFits(it, stage) ? i : -1)).filter((i) => i >= 0);

// ───────── 語音（Web Speech API）：用 util.js 共用的念法（Chrome／Edge／Safari 都處理好了）─────────
// 外語放慢，韓文最慢；中文裡夾的韓文會換韓文聲音念
function speak(text, lang) {
  if (!ttsOK || !text) return;
  speakTTS(String(text).replace(/[💀☕✨]/g, ''), lang, lang === 'ko-KR' ? 0.7 : lang === 'en-US' ? 0.8 : 1.05);
}

function applyAccent() {
  const p = store.get().profile;
  const a = ACCENTS.find((x) => x.id === p?.accent) || ACCENTS[0];
  document.documentElement.style.setProperty('--accent', a.color);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', a.color);
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ───────── 出題 ─────────
function makeQuestion(deck, i) {
  const it = deck.items[i];
  const key = `${deck.id}:${i}`;
  const others = deck.items.filter((_, j) => j !== i);

  if (deck.type === 'mc') {
    const opts = shuffle(it.o.map((t, j) => ({ t, ok: j === it.a })));
    return { key, deck, prompt: it.q, tag: '選出正確答案', options: opts.map((o) => o.t), answer: opts.findIndex((o) => o.ok), explain: it.ex };
  }

  if (deck.type === 'meme') {
    const toKo = Math.random() < 0.5;
    const field = toKo ? 'ko' : 'en';
    const opts = shuffle([it[field], ...sample(uniq(others.map((x) => x[field])), 3)]);
    return {
      key, deck, prompt: `「${it.f}」`, tag: toKo ? '用韓文怎麼說？' : '用英文怎麼說？',
      options: opts, answer: opts.indexOf(it[field]),
      explain: `英　${it.en}\n韓　${it.ko}（${it.kr}）\n小撇步：${it.note}`,
      speakAfter: toKo ? { text: it.ko, lang: 'ko-KR' } : { text: it.en, lang: 'en-US' },
    };
  }

  // 閃卡題庫：正向（看字選意思）、反向（看意思選字）、聽力
  const modes = ['forward', 'reverse'];
  if (!deck.noListen && voiceFor(deck.lang)) modes.push('listen', 'listen');
  const mode = pick(modes);
  const isHangul = deck.id === 'ko-hangul';
  const explainParts = [`${it.f}${it.r ? `（${it.r}）` : ''}＝${it.b}`];
  if (it.ex) explainParts.push(`例句：${it.ex}${it.exZh ? `\n　 ${it.exZh}` : ''}`);
  if (it.note) explainParts.push(`小撇步：${it.note}`);
  const speakSelf = deck.lang !== 'zh-TW' && !isHangul ? { text: it.f, lang: deck.lang } : null;

  if (mode === 'reverse') {
    const opts = shuffle([it.f, ...sample(uniq(others.map((x) => x.f)), 3)]);
    return {
      key, deck, prompt: it.b, tag: isHangul ? '是哪一個字母？' : deck.subject === 'zh' ? '是哪一個？' : '要怎麼說？',
      options: opts, answer: opts.indexOf(it.f), explain: explainParts.join('\n'), speakAfter: speakSelf, bigOptions: isHangul,
    };
  }
  const opts = shuffle([it.b, ...sample(uniq(others.map((x) => x.b)), 3)]);
  if (mode === 'listen') {
    return {
      key, deck, prompt: '🔊', tag: '聽聽看，是什麼意思？', listen: { text: it.f, lang: deck.lang },
      options: opts, answer: opts.indexOf(it.b), explain: explainParts.join('\n'),
    };
  }
  return {
    key, deck, prompt: it.f, tag: isHangul ? '怎麼發音？' : '是什麼意思？', bigPrompt: isHangul,
    options: opts, answer: opts.indexOf(it.b), explain: explainParts.join('\n'), speakAfter: speakSelf,
  };
}

function visibleDecks(stage) { return DECKS.filter((d) => d.stages.includes(stage)); }

function buildQuiz(kind) {
  const s = store.get();
  const stage = s.profile.stage;
  if (kind === 'daily') {
    const wrongKeys = sample(Object.keys(s.wrong).filter((k) => itemByKey(k)), 4);
    const pool = visibleDecks(stage).flatMap((d) => deckIndices(d, stage).map((i) => `${d.id}:${i}`)).filter((k) => !wrongKeys.includes(k));
    const keys = shuffle([...wrongKeys, ...sample(pool, 10 - wrongKeys.length)]);
    return { title: '每日 10 題挑戰', daily: true, qs: keys.map((k) => { const x = itemByKey(k); return makeQuestion(x.deck, x.i); }) };
  }
  if (kind === 'review') {
    const keys = sample(Object.keys(s.wrong).filter((k) => itemByKey(k)), 10);
    return { title: '錯題本複習', qs: keys.map((k) => { const x = itemByKey(k); return makeQuestion(x.deck, x.i); }) };
  }
  const deck = deckById(kind);
  let idx = deckIndices(deck, stage);
  if (idx.length < 4) idx = deck.items.map((_, i) => i);
  return { title: deck.title, deckId: deck.id, qs: sample(idx, 10).map((i) => makeQuestion(deck, i)) };
}

// ───────── 畫面 ─────────
const views = {};
let quiz = null;
let quizHost = null;
let flash = null;

views.talk = (arg) => renderTalk($app, arg);
views.exam = (arg) => renderExam($app, arg);
views.hangul = (arg) => renderHangul($app, arg);
views.game = (arg = 'match-ko') => (arg.startsWith('speed') ? renderSpeed : renderMatch)($app, arg.endsWith('en') ? 'en' : 'ko');

// 版權標示（我的、歡迎頁、首頁底部）
const COPYRIGHT = `<p class="copyright">© ${new Date().getFullYear()} 蟻葷婦人 版權所有<br>IG：<a href="https://www.instagram.com/evenafool/" target="_blank" rel="noopener">@evenafool</a>・Threads：<a href="https://www.threads.net/@even.a.fool" target="_blank" rel="noopener">@even.a.fool</a><br>Email：<a href="mailto:evenafool@gmail.com">evenafool@gmail.com</a></p>`;

views.onboard = () => {
  const p = store.get().profile || {};
  const draft = { name: p.name || '', stage: p.stage || 'jh', accent: p.accent || 'pink' };
  $app.innerHTML = `
    <form class="onboard" id="obForm">
      <h1 class="welcome-logo"><small>歡迎來到</small><img src="assets/art/logo.webp" alt="練習生學院"></h1>
      <p class="muted">國文・英文・韓文，用追星的熱情來讀書</p>
      <label class="field"><span>你的藝名</span>
        <input id="ob-name" maxlength="12" placeholder="例如：小熊、Mina" value="${esc(draft.name)}"></label>
      <div class="field"><span>你的學程</span>
        <div class="pills" id="ob-stage">${STAGES.map((st) => `<button type="button" class="pill ${st.id === draft.stage ? 'on' : ''}" data-v="${st.id}" aria-pressed="${st.id === draft.stage}">${st.name}<small>${st.exam}</small></button>`).join('')}</div></div>
      <div class="field"><span>選你的應援色　<b class="accent-name" id="accentName">${esc(ACCENTS.find((a) => a.id === draft.accent)?.name || '')}</b></span>
        <div class="swatches" id="ob-accent">${ACCENTS.map((a) => `<button type="button" class="swatch ${a.id === draft.accent ? 'on' : ''}" data-v="${a.id}" style="--c:${a.color}" title="${a.name}" aria-label="${a.name}" aria-pressed="${a.id === draft.accent}"></button>`).join('')}</div></div>
      <button type="submit" class="btn primary big" id="ob-go">${p.name ? '儲存設定' : '開始我的出道之路 ' + ic('star')}</button>
      ${COPYRIGHT}
    </form>`;
  const bindPills = (id, k) => $app.querySelectorAll(`#${id} button`).forEach((b) => b.onclick = () => {
    draft[k] = b.dataset.v;
    $app.querySelectorAll(`#${id} button`).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    if (k === 'accent') {
      const a = ACCENTS.find((x) => x.id === b.dataset.v);
      document.documentElement.style.setProperty('--accent', a.color);
      $app.querySelector('#accentName').textContent = a.name;
    }
  });
  bindPills('ob-stage', 'stage');
  bindPills('ob-accent', 'accent');
  // 用表單送出：在藝名欄按 Enter 也可以直接開始
  $app.querySelector('#obForm').onsubmit = (e) => {
    e.preventDefault();
    draft.name = $app.querySelector('#ob-name').value.trim() || '新人';
    store.get().profile = draft;
    store.save();
    applyAccent();
    location.hash = '#/home';
  };
};

// ───────── 主畫面：練習室大廳 ─────────
const AI_TEACHER_URL = 'https://claude.ai/artifact/4xmudADx2B7SvP23hLhcpE';



function teacherLines(name, lesson) {
  const h = new Date().getHours();
  const hello = h < 11 ? `早安，${name}！` : h < 18 ? `午安，${name}！` : `晚安，${name}！今天也辛苦了～`;
  const st = STORIES[lesson.lv.id];
  const w = lesson.lv.words.map((id) => WORDS[id]);
  return [
    `${hello}今天第 ${lesson.n} 天，我們來上「${lesson.lv.title}」吧！`,
    `今天的短劇是「${st.title}」，我好想快點講給你聽！`,
    `今天只要學 3 個字：${w.map((x) => x.zh).join('、')}。很簡單的啦～`,
    '練習生都是一點一點變強的。오늘도 화이팅！',
    `${w[0].zh}的韓文是「${w[0].ko}」，跟我念一次？`,
  ];
}

// 收藏總數（每日獎勵＋單字卡），用來判斷「有新小卡」紅點
function cardsTotal(s) { return (s.collection?.length || 0) + (s.cards?.length || 0); }
// 下方導覽列的更新紅點（目前：收藏有新小卡）
function refreshNavDots() {
  const s = store.get();
  const tab = document.querySelector('#nav a[href="#/cards"]');
  if (tab) tab.classList.toggle('has-red', cardsTotal(s) > (s.notes?.cards ?? 0));
}
views.home = () => {
  const s = store.get();
  const r = rankOf(s.xp);
  const pct = r.next ? Math.round(((s.xp - r.xp) / (r.next.xp - r.xp)) * 100) : 100;
  const wrongN = Object.keys(s.wrong).length;
  const stage = stageById(s.profile.stage);
  const lesson = todayLesson();
  const st = STORIES[lesson.lv.id];
  const words = lesson.lv.words.map((id) => WORDS[id]);
  const lines = teacherLines(s.profile.name, lesson);
  let lineIdx = 0;
  const prize = rewardForDay(lesson.n);
  const days = Math.max(0, 365 - Object.keys(s.course?.cleared || {}).length);
  const doneToday = store.daily().stamps.includes('lesson') || !!lesson.doneToday;
  const ex = examStats();
  const nx = examNext();
  // 練習區依語言分組：同一個語言的東西放在一起
  const groups = langGroups(ex, lesson.n);
  // 今日學習路線：一步一步、每步可以領小獎勵（收在「任務」面板裡）
  const dd = store.daily();
  const hp = hangulProgress();
  // 主線＝看短劇、上今天的課；40 音是加分的基礎練習（不擋主線、不算進寶箱）
  const mark = (r) => ({ ...r, done: (dd.tasks || []).includes(r.id), claimed: (dd.claimed || []).includes(r.id) });
  const route = [
    { id: 'lesson', icon: 'mic', name: '看短劇・上今天的課', sub: `第 ${lesson.n} 集・學新字`, href: '#/talk', main: true },
    { id: 'bank', icon: 'book', name: '單字庫', sub: '再學 8 個新字', href: '#/exam/bank' },
    { id: 'play', icon: 'cards', name: '玩一個練習', sub: '練習區挑一個', href: '#/practice' },
  ].map(mark);
  const extra = hp.done ? [] : [mark({ id: 'hangul', icon: 'ko', name: '加分：韓文 40 音', sub: `基礎練習・已過 ${hp.passed}／${hp.stages} 關`, href: '#/hangul', extra: true })];
  const nextStep = route.find((r) => !r.done);
  const allDone = route.every((r) => r.done);
  const chestReady = allDone && !(dd.claimed || []).includes('chest');
  const pending = [...route, ...extra].filter((r) => r.done && !r.claimed).length + (chestReady ? 1 : 0);
  const doneN = route.filter((r) => r.done).length;
  if (doneToday) lines.unshift('今天的課上完了，好棒！點左邊的「任務」領獎勵，或去練習區再玩一個吧！');

  // 下面那顆大按鈕：永遠是「現在最該做的那一件事」
  const BIG = {
    lesson: { t: '開始今天的課', s: `第 ${lesson.n} 天・${st.title}`, href: '#/talk', icon: 'mic' },
    bank: { t: '去單字庫', s: '再學 8 個新字', href: '#/exam/bank', icon: 'book' },
    play: { t: '玩一個練習', s: '挑一個你喜歡的', href: '#/practice', icon: 'cards' },
  };
  const big = pending ? { t: `領 ${pending} 個獎勵`, s: chestReady ? '今日寶箱也可以開了！' : '完成的任務還沒領', sheet: true, icon: 'gift' }
    : nextStep ? BIG[nextStep.id]
    : { t: '再上一次今天的課', s: '今天全部完成了！', href: '#/talk', icon: 'trophy' };

  const outfitId = avatarState().outfit || autoOutfit();
  const fresh = newUnlocks().length;
  const xpNum = new Intl.NumberFormat('zh-TW').format(s.xp || 0);
  // 每日紅點：今天該點的入口掛一顆紅點，點過就消掉（隔天重來）
  if (s.dots?.day !== store.today()) s.dots = { day: store.today(), seen: [] };
  const today = store.today();
  const did10 = (s.history || []).some((h) => h.day === today && /每日 10 題|打歌任務/.test(h.title || ''));
  const dot = (id, cond) => (cond && !s.dots.seen.includes(id) ? id : '');
  const red = (id) => (id ? `<i class="gl-red" data-red="${id}" aria-hidden="true"></i>` : '');
  // 更新紅點：有新東西（新造型、新小卡、新錯題）才亮，點進去看過就消掉
  s.notes ??= {};
  const cardsN = cardsTotal(s);
  const upd = (key, n, cond = n > (s.notes[key] ?? 0)) => (cond ? { key, n } : null);
  const newCards = upd('cards', cardsN);
  const newWrong = upd('wrong', wrongN);
  const newCloset = upd('closet', 0, fresh > 0);
  const side = (o) => `<${o.href ? `a href="${o.href}"${o.ext ? ' target="_blank" rel="noopener"' : ''}` : `button type="button"`} class="gl-ic ${o.cls || ''}" ${o.id ? `id="${o.id}"` : ''} ${o.dot ? `data-dot="${o.dot}"` : ''} ${o.upd ? `data-upd="${o.upd.key}" data-n="${o.upd.n}"` : ''} aria-label="${o.name}">
      <span class="gl-ic-b">${red(o.dot || o.upd?.key)}${o.html || ic(o.icon)}${o.badge ? `<i class="gl-dot">${o.badge}</i>` : ''}${o.tag ? `<em class="gl-tag">${o.tag}</em>` : ''}</span><small>${o.name}</small></${o.href ? 'a' : 'button'}>`;
  // 左邊：每天都會用到的通用入口（各語言的練習都收在「練習區」）
  const LEFT = [
    { id: 'glTasks', icon: 'gift', name: '任務', badge: pending || '', cls: pending ? 'hot' : '', dot: dot('tasks', !pending && !allDone) },
    // 40 音＝唱歌專區：黑膠唱片按鈕（中間是韓文字、旁邊飄音符），一看就知道裡面有歌
    ...(hp.done && hp.sung === hp.stages ? [] : [{ href: '#/hangul', cls: 'gl-song', name: '唱 40 音', badge: `${hp.sung}/${hp.stages}`, dot: dot('hangul', !(dd.tasks || []).includes('hangul')),
      html: `<i class="gl-disc"><b lang="ko">가</b></i><svg class="gl-note n1" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V5l10-2v12"/><circle cx="6.5" cy="17.5" r="2.8"/><circle cx="16.5" cy="15" r="2.8"/></svg><svg class="gl-note n2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17V4l6 3"/><circle cx="9.5" cy="17" r="2.8"/></svg>` }]),
    { href: '#/quiz/daily', icon: 'star', name: '每日10題', dot: dot('daily10', !did10) },
    wrongN ? { href: '#/quiz/review', icon: 'wrong', name: '錯題本', badge: wrongN > 99 ? '99+' : wrongN, upd: newWrong } : { href: '#/exam/bank', icon: 'book', name: '單字庫' },
    { href: '#/practice', icon: 'cards', name: '練習區' },
  ];
  const LEFT2 = [
    { href: `${AI_TEACHER_URL}#day-${lesson.n}`, icon: 'chat', name: 'AI 老師', ext: true },
  ];
  // 右邊：直排的活動橫幅（圖片卡＋緞帶標題）
  const BANNERS = [
    { href: '#/closet', img: 'assets/art/bn-closet.webp', name: '衣帽間', sub: fresh ? `新獲得 ${fresh} 樣` : '換造型', upd: newCloset },
    { href: '#/cards', img: 'assets/art/bn-cards.webp', name: '小卡冊', sub: '收藏小卡', upd: newCards },
    { href: '#/friends', img: 'assets/art/bn-friends.webp', name: '好友', sub: '聊天・彩蛋' },
    { href: '#/map', img: 'assets/art/bn-map.webp', name: '章節地圖', sub: '回放舊集數' },
  ];
  const banner = (b) => `<${b.href ? `a href="${b.href}"` : `button type="button" id="${b.id}"`} class="gl-bn ${b.cls || ''}" ${b.upd ? `data-upd="${b.upd.key}" data-n="${b.upd.n}"` : ''} aria-label="${b.name}">${red(b.upd?.key)}
      ${b.face ? `<span class="gl-bn-pic" style="background-image:url('${b.img}')"></span>` : `<img src="${b.img}" alt="" ${b.alt ? `onerror="this.onerror=null;this.src='${b.alt}'"` : ''}>`}
      ${b.play ? '<span class="gl-ep-play">▶</span>' : ''}${b.tag ? `<em class="gl-bn-tag">${b.tag}</em>` : ''}
      <span class="gl-bn-t"><b>${b.name}</b><small>${esc(b.sub)}</small></span></${b.href ? 'a' : 'button'}>`;

  // 少女養成遊戲式大廳：主角站中間、兩側圓形功能鈕、上方資源列、下方「今日短劇」海報卡＋大按鈕
  $app.innerHTML = `
    <section class="gl">
      <div class="gl-bg" aria-hidden="true" style="background-image:url('assets/art/bg-${lesson.lv.bg || 'practice'}.webp')"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <header class="gl-top">
        <a class="gl-prof" href="#/me" aria-label="我的">
          <span class="gl-face" style="background-image:url('assets/art/me-${outfitId}.webp')"></span>
          <span class="gl-prof-t"><b>${esc(s.profile.name)}</b><small>${esc(r.name)}</small><span class="gl-xp"><i style="width:${pct}%"></i></span></span>
        </a>
        <span class="gl-res" title="連續打卡天數">${ic('fire')}<b>${currentStreak()}</b></span>
        <span class="gl-res" title="應援值">${ic('heart')}<b>${xpNum}</b></span>
        <span class="gl-res" title="出道倒數">${ic('trophy')}<b>${days}</b></span>
      </header>

      <nav class="gl-side gl-left" aria-label="功能">
        ${[...LEFT, ...LEFT2].map(side).join('')}
      </nav>
      <nav class="gl-banners" aria-label="活動">${BANNERS.map(banner).join('')}</nav>

      <button class="gl-me me-stage" id="teacherBtn" type="button" aria-label="我的角色（點一下聊天）">${avatarHTML()}</button>

      <div class="gl-say" id="sayBox">
        <span class="gl-say-name">${esc(s.profile.name)}</span>
        <p id="speech" aria-live="polite">${esc(lines[0])}</p>
        <span class="gl-say-next" aria-hidden="true">▼</span>
      </div>

      <article class="gl-ep ${lesson.doneToday ? 'done' : ''}" aria-label="今日短劇">
        <button type="button" class="gl-ep-art" id="watchDrama" ${dot('drama', !lesson.doneToday) ? 'data-dot="drama"' : ''} aria-label="看今天的短劇：${esc(st.title)}">
          <img src="assets/art/story-${lesson.lv.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/bg-${lesson.lv.bg}.webp'">
          <span class="gl-ep-play">▶</span>${red(dot('drama', !lesson.doneToday))}
          <em class="gl-ep-no">第 ${lesson.n} 集</em>
          ${lesson.doneToday ? `<span class="gl-ep-ok">${ic('star')}看完了</span>` : '<span class="gl-ep-new">今日短劇</span>'}
        </button>
        <div class="gl-ep-body">
          <small class="gl-ep-kind">${esc(st.kind)}</small>
          <b class="gl-ep-title">${esc(st.title)}</b>
          <ul class="gl-words" aria-label="今天的 3 個字">${words.map((w) => `<li>${wic(w)}<span>${esc(w.zh)}</span></li>`).join('')}</ul>
          ${big.sheet ? `<button type="button" class="gl-go claim" id="glGo">` : `<a class="gl-go" id="glGo" href="${big.href}">`}
            ${ic(big.icon)}<b>${esc(big.t)}</b>
            <img class="gl-go-hand" src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()">
          ${big.sheet ? '</button>' : '</a>'}
        </div>
      </article>

      <div class="gl-sheet" id="glSheet" hidden>
        <div class="gl-sheet-card" role="dialog" aria-label="今日任務">
          <div class="gl-sheet-h"><b>${ic('gift')} 今日任務</b><span>${doneN}／${route.length}</span><button type="button" class="gl-x" id="glSheetX" aria-label="關閉">✕</button></div>
          <ol class="gl-steps">
            ${[...route, ...extra].map((x, i) => `<li class="${x.done ? 'done' : ''} ${x === nextStep ? 'now' : ''} ${x.extra ? 'extra' : ''}">
              <span class="gl-st-ic">${ic(x.icon)}<i>${x.done ? '✓' : x.extra ? '+' : i + 1}</i></span>
              <span class="gl-st-t"><b>${x.name}</b><small>${x.sub}</small></span>
              ${x.done ? (x.claimed ? `<span class="gl-st-got">已領</span>` : `<button type="button" class="gl-st-claim" data-claim="${x.id}">${ic('gift')} +10</button>`)
                : `<a class="gl-st-go" href="${x.href}">${x === nextStep ? '去做' : '前往'}</a>`}
            </li>`).join('')}
          </ol>
          <button type="button" class="gl-chest ${chestReady ? 'ready' : ''} ${allDone && !chestReady ? 'open' : ''}" ${chestReady ? 'data-claim="chest"' : 'disabled'}>
            ${ic(allDone && !chestReady ? 'trophy' : 'gift')}<span><b>${chestReady ? '打開今日寶箱 +30' : allDone ? '寶箱已打開，明天見！' : '今日寶箱'}</b><small>${allDone ? '' : `再完成 ${route.length - doneN} 個就能打開`}</small></span>
          </button>
          <a class="gl-stamps" href="#/map" aria-label="今日集章">
            ${Object.keys(store.STAMPS).map((k) => `<span class="stamp ${dd.stamps.includes(k) ? 'on' : ''}" title="${store.STAMPS[k].name}">${ic(store.STAMPS[k].icon)}<small>${store.STAMPS[k].name}</small></span>`).join('')}
          </a>
          ${COPYRIGHT}
        </div>
      </div>
    </section>`;

  document.querySelectorAll('body > .next-pill, body > .gl-sheet').forEach((x) => x.remove());
  const sheet = $app.querySelector('#glSheet');
  document.body.append(sheet); // 放到最上層，才不會被下方導覽列蓋住
  const openSheet = (on) => { sheet.hidden = !on; homeSheetOpen = on; if (on) sfx('tap'); };
  // 剛上完課回到首頁、或剛領完獎勵重畫：直接打開任務面板
  let arrived = false;
  try { arrived = sessionStorage.getItem('ta.arrive') === '1'; sessionStorage.removeItem('ta.arrive'); } catch (e) { /* 略過 */ }
  if (arrived || homeSheetOpen) sheet.hidden = false;
  $app.querySelector('#glTasks').onclick = () => openSheet(true);
  if (big.sheet) $app.querySelector('#glGo').onclick = () => openSheet(true);
  sheet.querySelector('#glSheetX').onclick = () => openSheet(false);
  sheet.onclick = (e) => { if (e.target === sheet || e.target.closest('a')) openSheet(false); };
  window.addEventListener('hashchange', () => { homeSheetOpen = false; sheet.remove(); }, { once: true });
  sheet.querySelectorAll('[data-claim]').forEach((b) => b.onclick = () => {
    const rc = b.getBoundingClientRect();
    const x = rc.left + rc.width / 2, y = rc.top + rc.height / 2;
    const chest = b.dataset.claim === 'chest';
    const xp = store.claimTask(b.dataset.claim);
    if (!xp) return;
    sfx('reward');
    homeSheetOpen = true;
    views.home(); // 重畫（面板保持打開）
    sparkleAt(x, y, chest ? 14 : 9);
    flyText(x, y, `+${xp} 應援值`);
    if (chest) { confetti(); toast('今日寶箱打開了！明天再來挑戰！'); }
  });
  // 點有紅點的入口：紅點「啵」一下消掉、冒小星星，今天就不再出現
  $app.querySelectorAll('[data-dot], [data-upd]').forEach((el) => el.addEventListener('click', () => {
    const id = el.dataset.dot;
    if (id && !s.dots.seen.includes(id)) s.dots.seen.push(id);
    if (el.dataset.upd) s.notes[el.dataset.upd] = Number(el.dataset.n) || 0;
    store.save();
    const d = el.querySelector('.gl-red');
    if (!d) return;
    const rc = d.getBoundingClientRect();
    sparkleAt(rc.left + rc.width / 2, rc.top + rc.height / 2, 6);
    sfx('tap');
    d.classList.add('pop');
    el.removeAttribute('data-dot'); el.removeAttribute('data-upd');
    setTimeout(() => d.remove(), 450);
  }, { capture: true }));
  $app.querySelector('#watchDrama').onclick = async () => {
    await openDrama(lesson.lv, lesson.n, { endLabel: '去上今天的課' });
    if (location.hash === '#/home' || location.hash === '') location.hash = '#/talk';
  };
  const say = () => {
    lineIdx = (lineIdx + 1) % lines.length;
    const line = lines[lineIdx];
    const sp = $app.querySelector('#speech');
    sp.textContent = line;
    const box = $app.querySelector('#sayBox');
    box.classList.remove('pop');
    void box.offsetWidth;
    box.classList.add('pop');
    speak(line, 'zh-TW'); // 韓文部分會自動換韓文聲音念
  };
  $app.querySelector('#teacherBtn').onclick = say;
  $app.querySelector('#sayBox').onclick = say;
};
let homeSheetOpen = false;

views.closet = () => renderCloset($app, backBar);
views.friends = (arg) => renderFriends($app, backBar, toast, true, arg || '');
views.chat = (arg) => renderChat($app, arg, toast);

// 依語言分組的練習入口（首頁練習區、練習頁共用）
function langGroups(ex, dayN) {
  const sub = (id) => `#/subject/${id}`;
  return [
    { id: 'ko', name: '韓文', cls: 'pink', tiles: [
      { href: '#/hangul', icon: 'ko', name: '40 音', sub: `${hangulProgress().passed}／4 關`, badge: '' },
      { href: '#/game/match-ko', icon: 'cards', name: '翻牌配對', sub: '圖＋韓文' },
      { href: '#/game/speed-ko', icon: 'fire', name: '快問快答', sub: '60 秒用說的' },
      { href: sub('ko'), icon: 'book', name: '韓文題庫', sub: '追星韓語・TOPIK' },
    ] },
    { id: 'en', name: '英文', cls: 'sky', tiles: [
      { href: '#/exam/bank', icon: 'book', name: '單字庫', sub: '國中 1,200 字' },
      { href: '#/exam/quiz', icon: 'star', name: '模擬小考', sub: '聽力・拼字' },
      { href: '#/game/match-en', icon: 'cards', name: '翻牌配對', sub: '圖＋英文' },
      { href: sub('en'), icon: 'book', name: '英文題庫', sub: '會考字彙・文法' },
    ] },
    { id: 'mix', name: '國文・綜合', cls: 'peach', tiles: [
      { href: sub('zh'), icon: 'zh', name: '國文題庫', sub: '成語・錯字・文言' },
      { href: sub('meme'), icon: 'meme', name: '梗翻譯所', sub: '梗用英韓怎麼說' },
      { href: '#/talk/drill', icon: 'mic', name: '語音特訓', sub: '英韓用說的' },
      { href: `${AI_TEACHER_URL}#day-${dayN}`, icon: 'chat', name: '打字聊天', sub: 'AI 老師', ext: true },
    ] },
  ];
}
function langRowHTML(g, tapHref = '', big = false) {
  return `<div class="lang-row lang-${g.id}">
    <span class="lang-tag ${g.cls}">${ic(g.id === 'mix' ? 'zh' : g.id)}<b>${g.name}</b></span>
    <div class="lang-tiles ${big ? 'big' : ''}">${g.tiles.map((t) => `<a class="pz-tile ${g.cls}${t.href === tapHref ? ' tap-hint' : ''}" href="${t.href}"${t.ext ? ' target="_blank" rel="noopener"' : ''}>
      ${t.badge ? `<span class="pz-new must">${t.badge}</span>` : ''}<span class="pz-ic">${ic(t.icon)}</span><b>${t.name}</b><small>${esc(t.sub)}</small>
      ${t.href === tapHref ? '<span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>點我！</b></span>' : ''}</a>`).join('')}</div>
  </div>`;
}

// 自由練習：從大廳收起來的科目入口
views.practice = () => {
  mountHost('practice');
  const wrongN = Object.keys(store.get().wrong).length;
  const ex = examStats();
  $app.innerHTML = `
    ${backBar('#/home', '練習區')}
    <p class="pz-lead">依語言分好了，點一個你想玩的！每完成一種都能蓋一個章 ${ic('star')}</p>
    ${langGroups(ex, store.get().course?.day || 1).map((g) => langRowHTML(g, '', true)).join('')}
    <h2 class="sec">${ic('map')} 複習</h2>
    <a class="deck" href="#/map"><div class="emoji">${ic('map')}</div><div class="grow"><b>章節地圖・回放</b><small>重看以前的短劇、重演對話（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/quiz/daily"><div class="emoji">${ic('star')}</div><div class="grow"><b>每日 10 題</b><small>錯題＋學過的字混在一起考，題目會念給你聽（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/wrong"><div class="emoji">${ic('wrong')}</div><div class="grow"><b>錯題本</b><small>${wrongN ? `${wrongN} 題等你複習` : '目前沒有錯題'}</small></div><div class="chev">›</div></a>`;
};

views.subject = (id) => {
  const sub = subjectById(id);
  const stage = store.get().profile.stage;
  const decks = DECKS.filter((d) => d.subject === id);
  const mine = decks.filter((d) => d.stages.includes(stage));
  const other = decks.filter((d) => !d.stages.includes(stage));
  const row = (d) => `
    <a class="deck" href="#/deck/${d.id}">
      <div class="emoji">${dic(d)}</div>
      <div class="grow"><b>${d.title}</b><small>${d.desc}</small>
        <div class="tags"><span class="tag">${d.exam}</span><span class="tag ghost">${d.items.length} 題</span></div></div>
      <div class="chev">›</div>
    </a>`;
  $app.innerHTML = `
    ${backBar('#/home', sub.name, ic(sub.id))}
    <h2 class="sec">推薦給${stageById(stage).short}的你</h2>
    ${mine.map(row).join('') || '<p class="muted">這個學程還沒有推薦題庫，看看下面的挑戰吧！</p>'}
    ${other.length ? `<h2 class="sec">挑戰其他程度</h2>${other.map(row).join('')}` : ''}`;
};

views.deck = (id) => {
  const d = deckById(id);
  const wrongN = Object.keys(store.get().wrong).filter((k) => k.startsWith(d.id + ':')).length;
  $app.innerHTML = `
    ${backBar(`#/subject/${d.subject}`, d.title)}
    <div class="deck-hero"><div class="emoji big">${dic(d)}</div><p>${d.desc}</p>
      <div class="tags center"><span class="tag">${d.exam}</span><span class="tag ghost">${d.items.length} 題</span>${wrongN ? `<span class="tag warn">錯題 ${wrongN}</span>` : ''}</div></div>
    <div class="actions">
      ${d.type !== 'mc' ? `<a class="btn big" href="#/flash/${d.id}">${ic('cards')} 閃卡背誦</a>` : ''}
      <a class="btn primary big" href="#/quiz/${d.id}">${ic('star')} 開始測驗（10 題）</a>
    </div>
    <h2 class="sec">內容預覽</h2>
    <div class="preview">${d.items.slice(0, 8).map((it) => `<div class="pv"><b>${esc(it.f || it.q)}</b><span>${esc(it.b || it.en || it.o?.[it.a] || '')}</span></div>`).join('')}
    ${d.items.length > 8 ? `<div class="muted small center">…還有 ${d.items.length - 8} 題</div>` : ''}</div>`;
};

views.flash = (id) => {
  const d = deckById(id);
  if (!flash || flash.deckId !== id) flash = { deckId: id, order: shuffle(d.items.map((_, i) => i)), pos: 0, flipped: false };
  const i = flash.order[flash.pos];
  const it = d.items[i];
  const key = `${d.id}:${i}`;
  const isWrong = store.get().wrong[key] != null;
  let back;
  if (d.type === 'meme') {
    back = `<div class="fb-main"><span class="lang-tag">英</span>${esc(it.en)}</div><div class="fb-main"><span class="lang-tag">韓</span>${esc(it.ko)}</div><div class="fb-r">${esc(it.kr)}</div><div class="fb-note">小撇步：${esc(it.note)}</div>
      <div class="row"><button class="btn sm" data-say="en">${ic('speaker')} 英文</button><button class="btn sm" data-say="ko">${ic('speaker')} 韓文</button></div>`;
  } else {
    back = `<div class="fb-main">${esc(it.b)}</div>${it.r ? `<div class="fb-r">${esc(it.r)}</div>` : ''}${it.pos ? `<div class="fb-r">${esc(it.pos)}</div>` : ''}
      ${it.ex ? `<div class="fb-ex">${esc(it.ex)}${it.exZh ? `<br><span class="muted">${esc(it.exZh)}</span>` : ''}</div>` : ''}
      ${it.note ? `<div class="fb-note">小撇步：${esc(it.note)}</div>` : ''}
      ${d.lang && d.lang !== 'zh-TW' && d.id !== 'ko-hangul' ? `<div class="row"><button class="btn sm" data-say="f">${ic('speaker')} 念單字</button>${it.ex && d.lang === 'en-US' ? '<button class="btn sm" data-say="ex">' + ic('speaker') + ' 念例句</button>' : ''}</div>` : ''}`;
  }
  $app.innerHTML = `
    ${backBar(`#/deck/${d.id}`, `${d.title}　${flash.pos + 1} / ${d.items.length}`)}
    <div class="flashcard ${flash.flipped ? 'flipped' : ''}" id="fc">
      <div class="face front"><div class="ff ${d.id === 'ko-hangul' ? 'huge' : ''}">${esc(it.f)}</div><div class="muted small">點一下翻面</div>${isWrong ? '<div class="tag warn">錯題本</div>' : ''}</div>
      <div class="face back">${back}</div>
    </div>
    ${d.lang && d.lang !== 'zh-TW' ? `<div class="row center"><button class="btn" id="fc-hear">${ic('speaker')} 聽</button><button class="btn" id="fc-mic">${ic('mic')} 跟我念</button><span class="muted small" id="fc-said"></span></div>` : ''}
    <div class="row spread">
      <button class="btn" id="fc-bad">${ic('wrong')} 還不熟</button>
      <button class="btn primary" id="fc-good">${ic('medal')} 記住了</button>
    </div>
    <div class="row spread">
      <button class="btn ghost" id="fc-prev" ${flash.pos === 0 ? 'disabled' : ''}>‹ 上一張</button>
      <button class="btn ghost" id="fc-next">${flash.pos === d.items.length - 1 ? '完成 ✓' : '下一張 ›'}</button>
    </div>`;
  const fc = $app.querySelector('#fc');
  fc.onclick = (e) => {
    const say = e.target.closest('[data-say]');
    if (say) {
      e.stopPropagation();
      const k = say.dataset.say;
      if (k === 'en') speak(it.en, 'en-US');
      else if (k === 'ko') speak(it.ko, 'ko-KR');
      else if (k === 'ex') speak(it.ex, d.lang);
      else speak(it.f, d.lang);
      return;
    }
    flash.flipped = !flash.flipped;
    fc.classList.toggle('flipped', flash.flipped);
  };
  const word = d.type === 'meme' ? it.ko : it.f;
  const wlang = d.type === 'meme' ? 'ko-KR' : d.lang;
  if (d.lang && d.lang !== 'zh-TW' && !flash.flipped) setTimeout(() => speak(word, wlang), 300);
  $app.querySelector('#fc-hear')?.addEventListener('click', () => speak(word, wlang));
  $app.querySelector('#fc-mic')?.addEventListener('click', async () => {
    const out = $app.querySelector('#fc-said');
    sfx('ding');
    out.textContent = '請說…';
    try {
      const alts = await listenOnce(wlang, { onInterim: (s) => { out.textContent = `聽到：${s}`; } });
      const ok = speechMatches(alts, word);
      sfx(ok ? 'right' : 'soft');
      out.textContent = ok ? `很棒！（${alts[0]}）` : `聽到：${alts[0] || '（沒聽清楚）'}，再試一次`;
      speak(ok ? '很棒！' : '再試一次', 'zh-TW');
      store.markAnswer(key, ok); store.logSay(word, wlang, alts[0], ok, `閃卡・${d.title}`);
    } catch (e) { out.textContent = /not-allowed/.test(e.message) ? '麥克風被擋住了：請按網址列的鎖頭，把麥克風改成允許' : '麥克風沒開成功，請再按一次（電腦請用 Edge、手機請用 Chrome 或 Safari）'; }
  });
  const go = (delta) => {
    const n = flash.pos + delta;
    if (n >= d.items.length) { flash = null; const r = store.addProgress(10, 'flash', { title: `閃卡・${d.title}`, tries: d.items.length }); sfx('stamp'); toast(r.goalJustMet ? '今日目標達成！閃卡蓋章 ✓' : '閃卡蓋章 ✓ 來測驗看看吧'); location.hash = `#/deck/${d.id}`; return; }
    flash.pos = Math.max(0, n);
    flash.flipped = false;
    views.flash(id);
  };
  $app.querySelector('#fc-prev').onclick = () => go(-1);
  $app.querySelector('#fc-next').onclick = () => go(1);
  $app.querySelector('#fc-bad').onclick = () => { store.get().wrong[key] = 2; store.save(); toast('已加入錯題本'); go(1); };
  $app.querySelector('#fc-good').onclick = () => { go(1); };
};

views.quiz = (kind) => {
  if (!quiz || quiz.kind !== kind) {
    const q = buildQuiz(kind);
    if (!q.qs.length) {
      $app.innerHTML = `${backBar('#/home', q.title)}<div class="empty">${ic('trophy', 'empty-ic')}<p>錯題本是空的，太強了！</p><a class="btn primary" href="#/quiz/daily">去做今日任務</a></div>`;
      return;
    }
    quiz = { ...q, kind, i: 0, correct: 0, combo: 0, maxCombo: 0, picked: null, done: false };
  }
  if (!document.querySelector('.npc-host')) quizHost = mountHost(quiz.deck?.subject === 'en' || quiz.qs?.[0]?.deck?.subject === 'en' ? 'quiz' : 'deck');
  if (quiz.done) return renderResult();
  const q = quiz.qs[quiz.i];
  const answered = quiz.picked != null;
  const exitTo = quiz.deckId ? `#/deck/${quiz.deckId}` : quiz.kind === 'review' ? '#/wrong' : '#/home';
  $app.innerHTML = `
    <div class="quiz-top">
      <a class="x" href="${exitTo}" id="qz-exit">✕</a>
      <div class="qbar"><i style="width:${(quiz.i / quiz.qs.length) * 100}%"></i></div>
      <div class="combo ${quiz.combo >= 2 ? 'hot' : ''}">${quiz.combo >= 2 ? `COMBO ×${quiz.combo} ${ic('fire')}` : `${quiz.i + 1}/${quiz.qs.length}`}</div>
    </div>
    <div class="q-deck muted small">${dic(q.deck)} ${esc(q.deck.title)}</div>
    <div class="q-card">
      ${q.listen ? `<button class="listen" id="qz-listen">${ic('speaker')}</button><div class="muted small">點喇叭再聽一次</div>` : `<div class="q-prompt ${q.bigPrompt ? 'huge' : ''}">${esc(q.prompt)}</div>`}
      <div class="q-tag">${esc(q.tag)}</div>
    </div>
    <div class="options">
      ${q.options.map((o, j) => {
        let cls = '';
        if (answered) cls = j === q.answer ? 'right' : j === quiz.picked ? 'wrong' : 'dim';
        return `<button class="opt ${cls} ${q.bigOptions ? 'huge' : ''}" data-j="${j}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
      }).join('')}
    </div>
    ${answered ? `
      <div class="feedback ${quiz.picked === q.answer ? 'ok' : 'ng'}">
        <b>${esc(quiz.cheer)}</b>
        <div class="explain">${esc(q.explain).replace(/\n/g, '<br>')}</div>
        ${q.speakAfter ? `<button class="btn sm" id="qz-say">${ic('speaker')} 聽發音</button>` : ''}
      </div>
      <button class="btn primary big" id="qz-next">${quiz.i === quiz.qs.length - 1 ? '看結果 ' + ic('star') : '下一題 ›'}</button>` : ''}`;

  $app.querySelector('#qz-exit').onclick = () => { quiz = null; };
  const qLang = (s) => /[가-힯]/.test(s) ? 'ko-KR' : /^[\x00-\x7F]+$/.test(s) ? 'en-US' : 'zh-TW';
  if (!q.listen && !answered) setTimeout(() => speak(q.prompt, qLang(q.prompt)), 250);
  if (q.listen) {
    const play = () => speak(q.listen.text, q.listen.lang);
    $app.querySelector('#qz-listen').onclick = play;
    if (!answered) setTimeout(play, 250);
  }
  $app.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
    const j = +b.dataset.j;
    const ok = j === q.answer;
    quiz.picked = j;
    if (ok) { quiz.correct++; quiz.combo++; quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo); quiz.cheer = pick(CHEERS_RIGHT); quizHost?.right(); }
    else { quiz.combo = 0; quiz.cheer = pick(CHEERS_WRONG); quizHost?.wrong(); }
    navigator.vibrate?.(ok ? 15 : [30, 40, 30]);
    store.markAnswer(q.key, ok);
    store.log({ t: 'answer', target: q.options[q.answer], said: q.options[j], ok, where: q.deck.title });
    store.save();
    sfx(ok ? 'right' : 'soft');
    if (q.speakAfter) speak(q.speakAfter.text, q.speakAfter.lang);
    else speak(ok ? '答對了！' : `答案是：${q.options[q.answer]}`, ok ? 'zh-TW' : qLang(q.options[q.answer]));
    views.quiz(kind);
  });
  $app.querySelector('#qz-say')?.addEventListener('click', () => speak(q.speakAfter.text, q.speakAfter.lang));
  $app.querySelector('#qz-next')?.addEventListener('click', () => {
    quiz.picked = null;
    if (quiz.i === quiz.qs.length - 1) finishQuiz(); else quiz.i++;
    views.quiz(kind);
    window.scrollTo(0, 0);
  });
};

function drawCard(score) {
  // 分數越高，抽到稀有卡機率越高
  const roll = Math.random() + (score === 1 ? 0.15 : 0);
  const rarity = roll > 0.95 ? 'SSR' : roll > 0.8 ? 'SR' : roll > 0.5 ? 'R' : 'N';
  const pool = quiz.qs.map((q) => q.key);
  return { key: pick(pool), rarity, at: Date.now() };
}

function finishQuiz() {
  const s = store.get();
  const total = quiz.qs.length;
  const score = quiz.correct / total;
  const before = rankOf(s.xp);
  let xp = quiz.correct * 10 + (quiz.maxCombo >= 3 ? quiz.maxCombo * 2 : 0);
  let bonus = 0;
  if (quiz.daily && s.dailyDone !== store.today()) { bonus = 30; s.dailyDone = store.today(); }
  xp += bonus;
  const prog = store.addProgress(xp, 'quiz', { title: quiz.title || '測驗', good: quiz.correct, tries: total });
  sfx('stamp');
  const card = score >= 0.6 ? drawCard(score) : null;
  if (card) s.cards.push(card);
  store.save();
  const after = rankOf(s.xp);
  Object.assign(quiz, { done: true, xpGain: xp, bonus, card, goal: prog.goalJustMet, rankUp: after.idx > before.idx ? after : null });
}

function cardHTML(c, small) {
  const x = itemByKey(c.key);
  if (!x) return '';
  const sub = x.item.b || x.item.en || x.item.o?.[x.item.a] || '';
  const main = x.item.f || x.item.o?.[x.item.a] || '';
  return `<div class="pcard r-${c.rarity} s-${x.deck.subject} ${small ? 'small' : ''}">
    <div class="pc-rar">${c.rarity}</div><div class="pc-emoji">${dic(x.deck)}</div>
    <div class="pc-main">${esc(main)}</div><div class="pc-sub">${esc(sub)}</div>
    <div class="pc-foot">${esc(x.deck.title)}</div></div>`;
}

function renderResult() {
  const total = quiz.qs.length;
  const score = quiz.correct / total;
  const title = score === 1 ? '全對！音樂節目一位 ' + ic('star') : score >= 0.8 ? '舞台炸裂！찢었다 ' + ic('fire') : score >= 0.6 ? '表現不錯！繼續衝 ' + ic('heart') : '練習生不怕失敗 ' + ic('heart');
  const again = quiz.kind;
  $app.innerHTML = `
    <section class="result">
      <div class="score-ring" style="--p:${score * 100}"><b>${quiz.correct}</b><small>/ ${total}</small></div>
      <h1>${title}</h1>
      <div class="xp-gain">+${quiz.xpGain} 應援值${quiz.bonus ? `<small>（含每日任務 +${quiz.bonus}）</small>` : ''}</div>
      <div class="muted">測驗蓋章 ✓ 今日集章 ${Math.min(store.daily().stamps.length, store.DAILY_GOAL)}/${store.DAILY_GOAL}${quiz.goal ? '　★ 今日目標達成！' : ''}</div>
      ${quiz.maxCombo >= 3 ? `<div class="muted">最高 COMBO ×${quiz.maxCombo}</div>` : ''}
      ${quiz.rankUp ? `<div class="rankup">${ic('trophy')} 升級為「${esc(quiz.rankUp.name)}」${esc(quiz.rankUp.ko)}！</div>` : ''}
      ${quiz.card ? `<div class="draw"><div class="muted small">獲得一張小卡！點擊翻開</div><div class="pc-wrap" id="pc">${cardHTML(quiz.card)}</div></div>`
        : '<p class="muted">答對 6 題以上就能抽小卡喔！</p>'}
      <div class="actions">
        <button class="btn primary big" id="rs-again">再挑戰一次</button>
        <a class="btn big" href="#/home">回首頁</a>
        ${Object.keys(store.get().wrong).length ? '<a class="btn ghost" href="#/wrong">' + ic('wrong') + ' 看錯題本</a>' : ''}
      </div>
    </section>`;
  $app.querySelector('#pc')?.addEventListener('click', (e) => e.currentTarget.classList.add('open'));
  $app.querySelector('#rs-again').onclick = () => { quiz = null; views.quiz(again); };
}

views.wrong = () => {
  const keys = Object.keys(store.get().wrong).filter((k) => itemByKey(k));
  const groups = {};
  keys.forEach((k) => { const x = itemByKey(k); (groups[x.deck.id] ||= []).push(x); });
  $app.innerHTML = `
    <h1 class="page-title">${ic('wrong')} 錯題本</h1>
    <p class="muted">答錯的題目會存在這裡，複習時答對 2 次就會畢業。</p>
    ${keys.length ? `<a class="btn primary big" href="#/quiz/review">開始複習（${Math.min(10, keys.length)} 題）</a>` : '<div class="empty">' + ic('trophy', 'empty-ic') + '<p>目前沒有錯題，超強！</p></div>'}
    ${Object.entries(groups).map(([id, xs]) => `
      <h2 class="sec">${dic(deckById(id))} ${esc(deckById(id).title)}</h2>
      <div class="preview">${xs.map(({ item: it }) => `<div class="pv"><b>${esc(it.f || it.q)}</b><span>${esc(it.b || it.en || it.o?.[it.a] || '')}</span></div>`).join('')}</div>`).join('')}`;
};

// 收藏室：卡冊（已收集亮起、未收集剪影）＋收藏歷程時間軸
// 章節地圖（多鄰國式路線）：每一天一個節點，破過的可以回放、今天的發光、之後的鎖住
views.map = () => {
  const s = store.get();
  const cleared = s.course.cleared;
  const today = todayLesson();
  let n = 0;
  const nodes = LEVELS.map((lv) => {
    if (lv.boss) {
      const open = cleared[lv.id] || LEVELS.filter((l) => l.ch === lv.ch && !l.boss).every((l) => cleared[l.id]);
      const bs = cleared[lv.id] ? '　' + '★'.repeat(cleared[lv.id]) + '☆'.repeat(3 - cleared[lv.id]) : '';
      return `<div class="map-boss ${cleared[lv.id] ? 'done' : ''} ${open ? '' : 'lock'}"><img class="boss-art" src="assets/art/story-${lv.id}.webp" alt="" onerror="this.remove()">${ic('trophy')}<b>${esc(lv.title)}</b>
        <small>主題單字特訓：${esc(lv.theme || '')}（${lv.words?.length || 0} 個字）${bs}</small>
        ${open ? `<a class="pill-btn strong" href="#/talk/${lv.id}">${ic('mic')} ${cleared[lv.id] ? '再挑戰一次' : '開始挑戰'}</a>` : '<small class="muted">完成這一章的每一天就會解鎖</small>'}</div>`;
    }
    n++;
    const st = STORIES[lv.id];
    const state = cleared[lv.id] ? 'done' : n === today.n ? 'now' : 'lock';
    const side = ['l', 'c', 'r', 'c'][n % 4];
    const stars = cleared[lv.id] ? '★'.repeat(cleared[lv.id]) + '☆'.repeat(3 - cleared[lv.id]) : '';
    const links = state === 'done'
      ? `<button class="pill-btn" type="button" data-drama="${n}">▶ 短劇</button><a class="pill-btn" href="#/talk/${n}-replay">${ic('book')} 回放</a><a class="pill-btn" href="#/talk/${n}">重上一次</a>`
      : state === 'now' ? `<a class="pill-btn strong" href="#/talk/${n}">${ic('mic')} 開始上課</a>` : '<span class="muted small">完成前一天就會解鎖</span>';
    return `<article class="map-node ${state} side-${side}">
      <div class="mn-art"><img src="assets/art/story-${lv.id}.webp" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/art/bg-${lv.bg}.webp'"><span class="mn-day">第 ${n} 天</span></div>
      <div class="mn-body"><small>${esc(st?.kind || '')}</small><b>${esc(st?.title || lv.title)}</b><span class="mn-stars">${stars}</span>
        <div class="mn-words">${lv.words.map((w) => wic(WORDS[w])).join('')}</div><div class="mn-links">${links}</div></div>
    </article>`;
  }).join('');
  $app.innerHTML = `${backBar('#/home', '章節地圖')}
    <p class="muted center">破過的篇章可以「回放」：重看短劇、重演對話。舊的字會在上課和語音特訓裡隨機出現，越聽越熟！</p>
    <div class="map-path">${nodes}</div>`;
  $app.querySelector('.map-node.now')?.scrollIntoView({ block: 'center' });
  const days = LEVELS.filter((l) => !l.boss);
  $app.querySelectorAll('[data-drama]').forEach((b) => { b.onclick = () => { const k = +b.dataset.drama; openDrama(days[k - 1], k, { endLabel: '關閉' }); }; });
};

views.cards = (arg) => { const s = store.get(); s.notes ??= {}; s.notes.cards = cardsTotal(s); store.save(); refreshNavDots(); renderBinders($app, arg, { cardHTML }); };

views.me = () => {
  const s = store.get();
  const r = rankOf(s.xp);
  const acc = s.stats.answered ? Math.round((s.stats.correct / s.stats.answered) * 100) : 0;
  // 練習生證上的資料
  s.profile.joined ??= (s.history?.[0]?.day || store.today());
  const outfit = OUTFITS.find((o) => o.id === avatarState().outfit) ? avatarState().outfit : autoOutfit();
  const days = LEVELS.filter((l) => !l.boss && s.course?.cleared?.[l.id] != null).length;
  s.uid ??= Math.random().toString(36).slice(2, 12);
  const no = (s.uid || '').replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase().padEnd(6, '0');
  const agency = s.names?.agency || DEFAULT_NAMES.agency;
  const nextPct = r.next ? Math.min(100, Math.round(((s.xp - r.xp) / (r.next.xp - r.xp)) * 100)) : 100;
  // 能力值（像偶像養成遊戲的六角圖）：從真實學習紀錄算出來，前期成長快、後面慢慢變難
  const ex = examStats();
  const hp = hangulProgress();
  const sc = (v, max) => Math.round(100 * Math.sqrt(Math.max(0, Math.min(1, v / max))));
  const SK = [
    { name: '韓文', icon: 'ko', v: sc(ex.koA + hp.passed * 12, 300), how: '40 音、韓文單字' },
    { name: '英文', icon: 'en', v: sc(ex.enB, 600), how: '單字庫、模擬小考' },
    { name: '口說', icon: 'mic', v: sc(s.course?.spoken || 0, 200), how: '跟讀、語音特訓' },
    { name: '拼字', icon: 'book', v: sc(ex.spelled, 180), how: '拼字題拼對' },
    { name: '答題', icon: 'star', v: Math.round(acc * Math.min(1, s.stats.answered / 20)), how: '答對率（答滿 20 題才算滿）' },
    { name: '毅力', icon: 'fire', v: sc(days * 2 + (s.streak || 0) * 3, 120), how: '每天上課、連續打卡' },
  ];
  const grade = (v) => (v >= 90 ? 'S' : v >= 70 ? 'A' : v >= 50 ? 'B' : v >= 30 ? 'C' : v >= 10 ? 'D' : 'E');
  const total = Math.round(SK.reduce((a, k) => a + k.v, 0) / SK.length);
  const C = 110, R = 78;
  const pt = (i, f) => { const a = -Math.PI / 2 + (i * Math.PI * 2) / SK.length; return [C + Math.cos(a) * R * f, C + Math.sin(a) * R * f]; };
  const poly = (f) => SK.map((_, i) => pt(i, typeof f === 'function' ? f(i) : f).map((n) => n.toFixed(1)).join(',')).join(' ');
  const radar = `<svg class="me-radar" viewBox="0 0 220 220" role="img" aria-label="能力值六角圖">
    ${[1, 0.75, 0.5, 0.25].map((f) => `<polygon points="${poly(f)}" class="rg"/>`).join('')}
    ${SK.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="rl"/>`; }).join('')}
    <polygon points="${poly((i) => Math.max(0.06, SK[i].v / 100))}" class="rv"/>
    ${SK.map((k, i) => { const [x, y] = pt(i, Math.max(0.06, k.v / 100)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" class="rd"/>`; }).join('')}
    ${SK.map((k, i) => { const [x, y] = pt(i, 1.24); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" class="rt">${k.name}</text><text x="${x.toFixed(1)}" y="${(y + 17).toFixed(1)}" class="rn">${k.v}</text>`; }).join('')}
  </svg>`;
  const cardsN = (s.cards?.length || 0) + (s.collection?.length || 0);

  $app.innerHTML = `
    <h1 class="page-title">${ic('me')} 我的</h1>
    <div class="idc-wrap">
      <div class="idc-strap" aria-hidden="true"><i></i></div>
      <div class="idc" aria-label="練習生證">
        <span class="idc-flip">
          <span class="idc-face front">
            <span class="idc-head"><span class="idc-logo">${ic('star')}</span><span class="idc-org"><b>${esc(agency)}</b><small>TRAINEE ID・練習生證</small></span><span class="idc-hole"></span></span>
            <span class="idc-body">
              <span class="idc-photo"><img src="assets/art/me-${outfit}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'"><i class="idc-tape"></i></span>
              <span class="idc-info">
                <span class="idc-name"><small>藝名 NAME</small><b>${esc(s.profile.name)}</b></span>
                <span class="idc-row"><small>等級</small><em class="idc-rank">${esc(r.name)}</em><i lang="ko">${esc(r.ko)}</i></span>
                <span class="idc-row"><small>學程</small><b>${esc(stageById(s.profile.stage).name)}</b></span>
                <span class="idc-row"><small>編號</small><b class="mono">No.${esc(no)}</b></span>
                <span class="idc-row"><small>入學</small><b>${esc(s.profile.joined)}</b></span>
              </span>
            </span>
            <span class="idc-foot"><span class="idc-bar"></span><span class="idc-holo">${ic('medal')}</span></span>
          </span>
        </span>
      </div>
    </div>

    <section class="me-panel me-lv" aria-label="等級與經驗值">
      <div class="me-lv-top">
        <span class="me-lv-badge"><small>Lv.</small>${r.idx + 1}</span>
        <span class="me-lv-t"><b>${esc(r.name)}</b><i lang="ko">${esc(r.ko)}</i></span>
        <span class="me-lv-xp">${ic('heart')}<b>${s.xp}</b><small>應援值</small></span>
      </div>
      <div class="me-xpbar"><i style="width:${nextPct}%"></i><span>${r.next ? `${s.xp - r.xp} / ${r.next.xp - r.xp}` : 'MAX'}</span></div>
      <p class="me-lv-next">${r.next ? `再 <b>${r.next.xp - s.xp}</b> 應援值升上「${esc(r.next.name)}」` : '已經是最高等級！'}</p>
      <div class="me-road">${RANKS.map((x, i) => `<span class="mr-step ${i < r.idx ? 'done' : ''} ${i === r.idx ? 'now' : ''}"><i>${i <= r.idx ? ic('star') : ''}</i><b>${esc(x.name)}</b><small>${x.xp}</small></span>`).join('')}</div>
    </section>

    <section class="me-panel me-skill" aria-label="能力值">
      <div class="me-ph"><b>${ic('trophy')} 能力值</b><span class="me-total">綜合 <em class="g-${grade(total)}">${grade(total)}</em></span></div>
      ${radar}
      <ul class="me-sk">${SK.map((k) => `<li><span class="sk-ic">${ic(k.icon)}</span><span class="sk-t"><b>${k.name}</b><small>${k.how}</small></span><span class="sk-bar"><i style="width:${Math.max(3, k.v)}%"></i></span><em class="g-${grade(k.v)}">${grade(k.v)}</em></li>`).join('')}</ul>
    </section>

    <section class="me-panel me-nums" aria-label="成績">
      <span>${ic('mic')}<b>${days}</b><small>上完集數</small></span>
      <span>${ic('fire')}<b>${s.streak || 0}</b><small>連續天數</small></span>
      <span>${ic('star')}<b>${s.stats.answered}</b><small>作答題數</small></span>
      <span>${ic('medal')}<b>${acc}%</b><small>正確率</small></span>
      <span>${ic('cards')}<b>${cardsN}</b><small>收藏</small></span>
      <span>${ic('chat')}<b>${friendCount()}</b><small>好友</small></span>
      <a class="me-hist" href="#/history">${ic('book')}<span><b>學習歷程</b><small>每天練了什麼</small></span><i>›</i></a>
    </section>

    ${currentUser() ? accountHTML() : `<button type="button" class="fr-login" id="cloudIn"><span class="g-logo">G</span><span><b>用 Google 登入</b><small>自動備份進度、換手機也不怕</small></span><i>›</i></button>`}
    <h2 class="sec me-set-h">設定</h2>
    <a class="me-sec me-link" href="#/onboard">${ic('me')}<span><b>改藝名・學程・應援色</b><small>${esc(s.profile.name)}・${esc(stageById(s.profile.stage).name)}</small></span><i class="chev">›</i></a>
    <details class="me-sec">
      <summary>${ic('star')}<span><b>我的偶像世界</b><small>經紀公司、前輩女團、未來團名</small></span><i class="chev">›</i></summary>
    <form class="names-form" id="namesForm">
      <label>經紀公司名稱<input id="nAgency" maxlength="12" placeholder="${esc(DEFAULT_NAMES.agency)}" value="${esc(s.names?.agency || '')}"></label>
      <label>前輩女團名稱<input id="nGroup" maxlength="12" placeholder="${esc(DEFAULT_NAMES.group)}" value="${esc(s.names?.group || '')}"></label>
      <label>前輩女團的韓文名字<small>選填，例如 노바；韓文對話會用這個名字</small><input id="nGroupKo" maxlength="12" placeholder="${esc(DEFAULT_NAMES.groupKo)}" value="${esc(s.names?.groupKo || '')}"></label>
      <label>我未來的團名<small>出道那天會用到，可以之後再想</small><input id="nMyGroup" maxlength="12" value="${esc(s.names?.myGroup || '')}"></label>
      <button class="btn primary" type="submit">儲存名字</button>
    </form>
    </details>
    <details class="me-sec">
      <summary>${ic('speaker')}<span><b>聲音設定</b><small>配樂、音效、外語慢速念</small></span><i class="chev">›</i></summary>
      <div class="me-switches">
        <label class="sw"><span>輕柔配樂</span><input type="checkbox" id="setMusic" ${s.settings?.music !== false ? 'checked' : ''}><i></i></label>
        <label class="sw"><span>音效</span><input type="checkbox" id="setSfx" ${s.settings?.sfx !== false ? 'checked' : ''}><i></i></label>
        <label class="sw"><span>外語慢速念</span><input type="checkbox" id="setSlow" ${s.settings?.slow !== false ? 'checked' : ''}><i></i></label>
      </div>
    </details>
    <details class="me-sec">
      <summary>${ic('book')}<span><b>進度備份</b><small>${currentUser() ? '已自動備份到 Google 帳號' : '匯出、匯入、清除進度'}</small></span><i class="chev">›</i></summary>
      <div class="row center" ${currentUser() ? 'hidden' : ''}><button class="btn" id="exportBtn">匯出進度</button><label class="btn">匯入進度<input type="file" id="importFile" accept=".json" hidden></label></div>
      <div class="actions">
        <button class="btn ghost danger" id="me-reset">清除所有進度</button>
      </div>
      <p class="muted small center">${ttsOK ? '' : '這個瀏覽器不支援語音朗讀，聽力題會自動略過。'}${currentUser() ? '進度會自動備份到你的 Google 帳號。' : '進度只存在這台裝置上，用 Google 登入就會自動備份。'}</p>
    </details>
    ${COPYRIGHT}`;
  bindAccount($app, toast, () => views.me());
  store.save();
  $app.querySelector('#namesForm').onsubmit = (e) => {
    e.preventDefault();
    const v = (id) => $app.querySelector(id).value.trim();
    s.names = { agency: v('#nAgency'), group: v('#nGroup'), groupKo: v('#nGroupKo'), myGroup: v('#nMyGroup') };
    for (const k of Object.keys(s.names)) if (!s.names[k]) delete s.names[k];
    store.save();
    toast('名字已儲存！故事會換成你取的名字');
    setTimeout(() => location.reload(), 900);
  };
  $app.querySelector('#exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify(store.get())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `練習生學院進度-${s.profile.name}-${store.today()}.json`;
    a.click();
    toast('已匯出進度檔，帶到另一台電腦匯入就能接著學');
  };
  $app.querySelector('#importFile').onchange = async (e) => {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (!data.profile) throw new Error('bad');
      if (!confirm(`要用「${data.profile.name}」的進度取代這台電腦的進度嗎？`)) return;
      localStorage.setItem('idolstudy.v1', JSON.stringify(data));
      location.reload();
    } catch (err) { toast('這不是練習生學院的進度檔'); }
  };
  $app.querySelector('#setMusic').onchange = (e) => setMusic(e.target.checked);
  $app.querySelector('#setSfx').onchange = (e) => setSfx(e.target.checked);
  $app.querySelector('#setSlow').onchange = (e) => { s.settings.slow = e.target.checked; store.save(); };
  $app.querySelector('#me-reset').onclick = () => {
    if (confirm('確定要清除所有進度嗎？應援值、錯題本、小卡都會不見喔！')) { store.reset(); location.hash = '#/onboard'; }
  };
};

// 學習歷程：依日期列出每次練習＋說過的每一句（對／再加強）
views.history = () => {
  const h = store.get().history || [];
  const days = [...new Set(h.map((e) => e.day))].reverse();
  const time = (at) => new Date(at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  const NAME = { 'ko-KR': '韓', 'en-US': '英', 'zh-TW': '中' };
  const dayBlock = (d) => {
    const es = h.filter((e) => e.day === d);
    const says = es.filter((e) => e.t === 'say' || e.t === 'answer');
    const ok = says.filter((e) => e.ok).length;
    const weak = [...new Set(says.filter((e) => !e.ok).map((e) => e.target))].slice(0, 12);
    return `<section class="hist-day">
      <h2 class="sec">${esc(d)}</h2>
      <div class="hist-sum"><span>${es.filter((e) => e.t === 'session').length} 次練習</span><span>說／答 ${says.length} 次</span><span>正確 ${says.length ? Math.round((ok / says.length) * 100) : 0}%</span><span>應援值 +${es.reduce((a, e) => a + (e.xp || 0), 0)}</span></div>
      ${weak.length ? `<div class="hist-weak"><b>要再加強：</b>${weak.map((x) => `<span class="tag warn">${esc(x)}</span>`).join('')}</div>` : ''}
      <details><summary>看詳細紀錄</summary><ul class="hist-list">${es.map((e) => e.t === 'session'
        ? `<li class="hs"><time>${time(e.at)}</time><b>${esc(e.title || store.STAMPS[e.stamp]?.name || '練習')}</b>${e.tries ? `<span>${e.good ?? '-'}／${e.tries}</span>` : ''}${e.stars ? `<span>${'★'.repeat(e.stars)}</span>` : ''}<span>+${e.xp}</span></li>`
        : `<li class="${e.ok ? 'ok' : 'ng'}"><time>${time(e.at)}</time><span class="hl">${NAME[e.lang] || ''}</span><b>${esc(e.target)}</b><span class="said">${e.t === 'answer' ? '選了' : '說了'}：${esc(e.said || '（沒聽到）')}</span><span>${e.ok ? '✓' : '再練'}</span></li>`).join('')}</ul></details>
    </section>`;
  };
  $app.innerHTML = `${backBar('#/me', '學習歷程')}
    ${days.length ? days.map(dayBlock).join('') : '<div class="empty"><p>還沒有紀錄，上完第一堂課就會出現！</p><a class="btn primary" href="#/talk">去上課</a></div>'}`;
};

function backBar(href, title, icon = '') {
  return `<div class="backbar"><a href="${href}" class="backlink">‹</a><b>${icon ? icon + ' ' : ''}${esc(title)}</b></div>`;
}

// ───────── 路由 ─────────
function route() {
  const [name = 'home', ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const arg = rest.length ? rest.join('/') : undefined;
  const s = store.get();
  if (!s.profile && name !== 'onboard') { location.hash = '#/onboard'; return; }
  if (name !== 'quiz') quiz = null;
  if (name !== 'flash') flash = null;
  const view = views[name] || views.home;
  if (view !== views.talk) stopTalk();
  if (view !== views.chat) stopChat();
  document.body.classList.toggle('is-lobby', view === views.home || view === views.talk);
  const hideNav = (['onboard', 'quiz', 'flash', 'talk', 'chat', 'closet'].includes(name) && !(name === 'onboard' && s.profile)) || (name === 'hangul' && /^sing/.test(arg || ''));
  $nav.hidden = hideNav;
  // 子頁面也讓所屬的分頁亮著（例如 40 音、小遊戲 → 練習；衣帽間 → 我的）
  const PARENT_TAB = { hangul: 'practice', game: 'practice', subject: 'practice', deck: 'practice', wrong: 'practice', map: 'practice', quiz: 'practice', flash: 'practice', closet: 'me', history: 'me', chat: 'friends', onboard: 'me' };
  const tab = PARENT_TAB[name] || name;
  document.body.dataset.view = views[name] ? name : 'home';
  $nav.querySelectorAll('a').forEach((a) => {
    const on = a.getAttribute('href') === `#/${tab}`;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  view(arg);
  refreshNavDots();
  window.scrollTo(0, 0);
  // 換頁動畫：只在剛換頁的短時間內掛著，之後頁面自己重畫（例如領獎）不會再播一次
  $app.classList.remove('view-in'); void $app.offsetWidth; $app.classList.add('view-in');
  clearTimeout(route.t); route.t = setTimeout(() => $app.classList.remove('view-in'), 900);
}

// 記住從哪一頁來的：返回箭頭如果回的是上一頁，就用瀏覽器的上一頁（不堆疊紀錄，跟手機滑回去一致）
window.addEventListener('hashchange', (e) => {
  const o = new URL(e.oldURL).hash;
  if (!(o.startsWith('#/hangul/sing') && location.hash.startsWith('#/hangul/sing'))) window.__fromHash = o; // 舞台裡換歌不算
});
window.addEventListener('hashchange', route);
applyAccent();
armAudio();
initFx();
route();
initCloud();
// 有朋友傳新訊息：「我的」分頁和好友入口亮紅點
onChats((sum) => {
  const tab = $nav.querySelector('a[href="#/friends"]');
  if (tab) tab.dataset.badge = sum.unread ? String(sum.unread) : '';
  const entry = document.querySelector('.fr-entry');
  if (entry) entry.dataset.badge = sum.unread ? String(sum.unread) : '';
  // 首頁「好友」橫幅：有未讀訊息就掛紅點
  const bn = document.querySelector('.gl-bn[href="#/friends"]');
  if (bn) { bn.querySelector('.gl-red')?.remove(); if (sum.unread) bn.insertAdjacentHTML('afterbegin', '<i class="gl-red" aria-hidden="true"></i>'); }
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  // 有新版就自動換上：新的 sw 接手後重新整理一次；App 從背景切回來時也檢查一下有沒有新版
  const hadSW = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}
