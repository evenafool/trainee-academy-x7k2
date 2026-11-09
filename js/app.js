import { STAGES, SUBJECTS, DECKS, RANKS, ACCENTS, CHEERS_RIGHT, CHEERS_WRONG } from './data.js';
import { LEVELS, WORDS, STORIES, TEASERS, CHAPTERS, KEEPSAKES } from './course.js';
import { applyNames, DEFAULT_NAMES } from './names.js';
import { dayStr, VOICE_PICKS, ic, wic, listenOnce, speechMatches, splitKo, confetti } from './util.js';
import { sfx, armAudio, setMusic, setSfx } from './sound.js';
import { openDrama } from './drama.js';
import { renderMatch, renderSpeed } from './games.js';
import { renderTalk, stopTalk } from './talk.js';
import { rewardForDay, rewardHTML, MEMBERS, MERCH } from './rewards.js';
import { renderExam, examNext, examStats } from './exam.js';
import { mountHost } from './npc.js';
import { renderHangul, hangulProgress, TOTAL as HANGUL_TOTAL } from './hangul.js';
import { avatarHTML, avatarState, autoOutfit, OUTFITS, newUnlocks, renderCloset } from './avatar.js';

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
const stageById = (id) => STAGES.find((s) => s.id === id);

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

// ───────── 語音（Web Speech API） ─────────
const ttsOK = 'speechSynthesis' in window;
function voiceFor(lang) {
  if (!ttsOK) return null;
  // 優先用自然語音（Edge 的 Natural／Online、Chrome 的 Google 語音）
  const vs = speechSynthesis.getVoices();
  const nat = (v) => /Natural|Online|Neural|Google/i.test(v.name);
  const same = vs.filter((v) => v.lang.replace('_', '-') === lang);
  const near = vs.filter((v) => v.lang.startsWith(lang.slice(0, 2)));
  const fav = VOICE_PICKS[lang];
  return (fav && vs.find((v) => fav.test(v.name))) || same.find(nat) || near.find(nat) || same[0] || near[0] || null;
}
function speak(text, lang) {
  if (!ttsOK || !text) return;
  speechSynthesis.cancel();
  // 中文裡夾的韓文換韓文聲音念（splitKo）
  for (const [p, l] of splitKo(text.replace(/[💀☕✨]/g, ''), lang)) {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = l;
    u.rate = l === 'ko-KR' ? 0.7 : l === 'en-US' ? 0.8 : 1.05; // 外語放慢，韓文最慢
    const v = voiceFor(l);
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
}
if (ttsOK) speechSynthesis.getVoices();

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
    return { title: '今日打歌任務', daily: true, qs: keys.map((k) => { const x = itemByKey(k); return makeQuestion(x.deck, x.i); }) };
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

views.onboard = () => {
  const p = store.get().profile || {};
  const draft = { name: p.name || '', stage: p.stage || 'jh', accent: p.accent || 'pink' };
  $app.innerHTML = `
    <section class="onboard">
      <div class="logo-big">✨</div>
      <h1>歡迎來到<br><span class="accent">練習生學院</span></h1>
      <p class="muted">國文・英文・韓文，用追星的熱情來讀書</p>
      <label class="field"><span>你的藝名</span>
        <input id="ob-name" maxlength="12" placeholder="例如：小熊、Mina" value="${esc(draft.name)}"></label>
      <div class="field"><span>你的學程</span>
        <div class="pills" id="ob-stage">${STAGES.map((st) => `<button class="pill ${st.id === draft.stage ? 'on' : ''}" data-v="${st.id}">${st.name}<small>${st.exam}</small></button>`).join('')}</div></div>
      <div class="field"><span>選你的應援色</span>
        <div class="swatches" id="ob-accent">${ACCENTS.map((a) => `<button class="swatch ${a.id === draft.accent ? 'on' : ''}" data-v="${a.id}" style="--c:${a.color}" title="${a.name}"></button>`).join('')}</div></div>
      <button class="btn primary big" id="ob-go">${p.name ? '儲存設定' : '開始我的出道之路 ' + ic('star')}</button>
    </section>`;
  const bindPills = (id, k) => $app.querySelectorAll(`#${id} button`).forEach((b) => b.onclick = () => {
    draft[k] = b.dataset.v;
    $app.querySelectorAll(`#${id} button`).forEach((x) => x.classList.toggle('on', x === b));
    if (k === 'accent') document.documentElement.style.setProperty('--accent', ACCENTS.find((a) => a.id === b.dataset.v).color);
  });
  bindPills('ob-stage', 'stage');
  bindPills('ob-accent', 'accent');
  $app.querySelector('#ob-go').onclick = () => {
    draft.name = $app.querySelector('#ob-name').value.trim() || '新人';
    store.get().profile = draft;
    store.save();
    applyAccent();
    location.hash = '#/home';
  };
};

// ───────── 主畫面：練習室大廳 ─────────
const AI_TEACHER_URL = 'https://claude.ai/artifact/4xmudADx2B7SvP23hLhcpE';

// 今天要上的課：第一個還沒破關的一般關卡
function todayLesson() {
  const cleared = store.get().course?.cleared || {};
  const days = LEVELS.filter((l) => !l.boss);
  const i = Math.max(0, days.findIndex((l) => !cleared[l.id]));
  return { lv: days[i], n: i + 1 };
}

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
  const doneToday = store.daily().stamps.includes('lesson');
  const ex = examStats();
  const nx = examNext();
  const tiles = [
    { href: '#/exam', icon: 'medal', name: '考試準備度', sub: `英文 ${ex.enB}／1,200`, cls: 'gold', isNew: true },
    { href: '#/exam/bank', icon: 'book', name: '單字庫', sub: '國中 1,200 字', cls: 'mint', isNew: true },
    { href: '#/talk/drill', icon: 'mic', name: '語音特訓', sub: '用說的複習', cls: 'pink' },
    { href: '#/game/match-ko', icon: 'cards', name: '翻牌配對', sub: '小遊戲', cls: 'sky' },
    { href: '#/practice', icon: 'star', name: '自由練習', sub: '題庫・閃卡・遊戲', cls: 'lilac' },
    { href: `${AI_TEACHER_URL}#day-${lesson.n}`, icon: 'chat', name: '打字聊天', sub: 'AI 老師', cls: 'peach', ext: true },
  ];
  // 今天的課上完了 → 手指移到練習區（有認證可以考就指考試，不然指單字庫）
  const tapIdx = doneToday ? (nx.href.startsWith('#/exam/test') ? 0 : 1) : -1;
  // 今日學習路線：一步一步、每步可以領小獎勵
  const dd = store.daily();
  const hpDone = hangulProgress().done;
  const route = [
    ...(hpDone ? [] : [{ id: 'hangul', icon: 'ko', name: '韓文 40 音', sub: '過一關，打好基礎', href: '#/hangul' }]),
    { id: 'lesson', icon: 'mic', name: '今天的課', sub: '看短劇、學 6 個字', href: '#/talk' },
    { id: 'bank', icon: 'book', name: '單字庫', sub: '再學 8 個新字', href: '#/exam/bank' },
    { id: 'play', icon: 'cards', name: '玩一個練習', sub: '小遊戲、小考或特訓', href: '#/practice' },
  ].map((r) => ({ ...r, done: (dd.tasks || []).includes(r.id), claimed: (dd.claimed || []).includes(r.id) }));
  const nextStep = route.find((r) => !r.done);
  const allDone = route.every((r) => r.done);
  if (doneToday) lines.unshift(`今天的課上完了，好棒！下面的「練習區」有單字庫和模擬考，點發光的那個去玩吧！`);

  // 簡化版大廳：一張「今天的課」卡（劇照＋標題＋3 個字＋一個大按鈕），其他功能縮成一排小連結
  $app.innerHTML = `
    <section class="lobby">
      <div class="lobby-bg" aria-hidden="true"></div>
      <header class="lobby-top">
        <div class="brand">練習生學院<small>TRAINEE ACADEMY</small></div>
        <span class="stat-pill streak-chip" title="連續打卡">${ic('fire')} <b>${currentStreak()}</b> 天</span>
        <a class="me-chip" href="#/me"><span class="me-av">${esc(s.profile.name.slice(0, 1))}</span><span><b>${esc(s.profile.name)}</b><small>${esc(r.name)}</small></span></a>
      </header>

      <div class="lobby-main">
        <div class="lobby-left">
          ${(() => { const hp = hangulProgress(); return hp.done ? '' : `<a class="glass hg-lobby ${doneToday ? '' : 'tap-hint'}" href="#/hangul">
            <span class="hg-lobby-ch">가</span>
            <span class="hg-lobby-text"><b>第 0 課：韓文 40 音</b><small>先打好基礎！學會 40 個字母，所有韓文都念得出來</small>
              <span class="hg-prog"><i style="width:${(hp.passed / hp.stages) * 100}%"></i></span><em>已過關 ${hp.passed}／${hp.stages} 關</em></span>
            <span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>${hp.passed ? '繼續！' : '先從這裡開始！'}</b></span></a>`; })()}
          <article class="glass today">
            <figure class="today-art watch-drama" id="watchDrama" title="看今天的短劇">
              <span class="play-badge">▶ 看短劇</span>
              <img src="assets/art/story-${lesson.lv.id}.webp" alt="今天的短劇：${esc(st.title)}" onerror="this.onerror=null;this.src='assets/art/bg-${lesson.lv.bg}.webp'">
              <figcaption>第 ${lesson.n} 天</figcaption>
            </figure>
            <p class="drama-kind">${esc(st.kind)}</p>
            <h1>${esc(st.title)}</h1>
            <ul class="today-words">
              ${words.map((w) => `<li><span class="w-emoji">${wic(w)}</span><b>${esc(w.zh)}</b></li>`).join('')}
            </ul>
            <a class="cta ${doneToday || !hangulProgress().done ? '' : 'tap-hint'}" href="#/talk">${ic('mic')} ${doneToday ? '再上一次今天的課' : '開始今天的課'}${doneToday || !hangulProgress().done ? '' : '<span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>點我！</b></span>'}</a>
            <div class="prize-mini">上完拿到 ${rewardHTML(prize)} <b>${esc(prize.name)}</b></div>
          </article>

          <section class="glass route" aria-label="今日學習路線">
            <div class="route-head"><b>${ic('map')} 今日學習路線</b><small>照順序做，每完成一步都能領獎勵！</small></div>
            <ol class="route-steps">
              ${route.map((r, i) => `<li class="${r.done ? 'done' : ''} ${r === nextStep ? 'now' : ''}">
                <span class="route-n">${r.done ? '✓' : i + 1}</span>${ic(r.icon)}<span class="route-t"><b>${r.name}</b><small>${r.sub}</small></span>
                ${r.done ? (r.claimed ? `<span class="route-got">${ic('gift')} 已領</span>` : `<button type="button" class="route-claim" data-claim="${r.id}">${ic('gift')} 領獎勵 +10</button>`)
                  : `<a class="route-go ${r === nextStep ? 'tap-hint' : ''}" href="${r.href}">${r === nextStep ? '下一步 ›' : '前往 ›'}</a>`}</li>`).join('')}
            </ol>
            ${allDone ? ((dd.claimed || []).includes('chest') ? `<p class="route-chest done">${ic('trophy')} 今日寶箱已打開，明天見！</p>` : `<button type="button" class="route-chest tap-hint" data-claim="chest">${ic('gift')} 全部完成！打開今日寶箱 +30</button>`) : ''}
          </section>

          <section class="glass play-zone ${doneToday ? 'hot' : ''}" aria-label="練習區">
            <div class="pz-head"><b>${ic('star')} 練習區</b><small>${doneToday ? '今天的課上完了！再玩一個，把章集滿！' : '上完課還想玩？點下面的大按鈕！'}</small><a class="pz-map" href="#/map">${ic('map')} 章節地圖</a></div>
            <div class="pz-grid">
              ${tiles.map((t, i) => `<a class="pz-tile ${t.cls}${i === tapIdx ? ' tap-hint' : ''}" href="${t.href}"${t.ext ? ' target="_blank" rel="noopener"' : ''}>
                ${t.isNew ? '<span class="pz-new">NEW</span>' : ''}
                <span class="pz-ic">${ic(t.icon)}</span><b>${t.name}</b><small>${esc(t.sub)}</small>
                ${i === tapIdx ? '<span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>點我！</b></span>' : ''}</a>`).join('')}
            </div>
            <div class="pz-subjects"><span>${ic('book')} 科目題庫</span>${SUBJECTS.map((sub) => `<a href="#/subject/${sub.id}">${ic(sub.id)}<b>${sub.name}</b></a>`).join('')}</div>
          </section>



          <a class="glass daily-goal" href="#/map" aria-label="今日集章">
            <span class="dg-title">今日集章</span>
            ${Object.keys(store.STAMPS).map((k) => `<span class="stamp ${store.daily().stamps.includes(k) ? 'on' : ''}" title="${store.STAMPS[k].name}">${ic(store.STAMPS[k].icon)}<small>${store.STAMPS[k].name}</small></span>`).join('')}
            <b class="dg-count">${Math.min(store.daily().stamps.length, store.DAILY_GOAL)}/${store.DAILY_GOAL}</b>
          </a>

          <div class="glass debut-strip">
            <span>出道倒數</span><b>${days}</b><span>天</span>
            <div class="xpbar"><i style="width:${pct}%"></i></div>
          </div>

          ${s.names?.group ? '' : '<a class="glass name-prompt" href="#/me">' + ic('me') + ' <b>幫你的偶像世界取名字！</b></a>'}

        </div>

        <div class="lobby-right">
          <p class="speech" id="speech" aria-live="polite">${esc(lines[0])}</p>
          <button class="teacher me-stage" id="teacherBtn" type="button" aria-label="我的角色（點兩下打開衣帽間）">${avatarHTML()}</button>
          <span class="teacher-name">${esc(s.profile.name)}・${esc(OUTFITS.find((o) => o.id === (avatarState().outfit || autoOutfit()))?.name || '')}</span>
          <a class="closet-link ${newUnlocks().length ? 'tap-hint fresh' : ''}" href="#/closet">${newUnlocks().length ? `${ic('gift')} 新獲得 ${newUnlocks().length} 樣！去衣帽間` : `${ic('closet')} 衣帽間`}</a>
        </div>
      </div>
    </section>`;

  $app.querySelectorAll('[data-claim]').forEach((b) => b.onclick = () => {
    const xp = store.claimTask(b.dataset.claim);
    if (xp) { sfx('reward'); confetti(); toast(`領到 ${xp} 應援值！`); views.home(); }
  });
  $app.querySelector('#watchDrama').onclick = async () => {
    await openDrama(lesson.lv, lesson.n, { endLabel: '去上今天的課' });
    if (location.hash === '#/home' || location.hash === '') location.hash = '#/talk';
  };
  $app.querySelector('#teacherBtn').onclick = () => {
    lineIdx = (lineIdx + 1) % lines.length;
    const line = lines[lineIdx];
    const sp = $app.querySelector('#speech');
    sp.textContent = line;
    sp.classList.remove('pop');
    void sp.offsetWidth;
    sp.classList.add('pop');
    speak(line, 'zh-TW'); // 韓文部分會自動換韓文聲音念
  };
};

views.closet = () => renderCloset($app, backBar);

// 自由練習：從大廳收起來的科目入口
views.practice = () => {
  mountHost('practice');
  const wrongN = Object.keys(store.get().wrong).length;
  const ex = examStats();
  $app.innerHTML = `
    ${backBar('#/home', '練習區')}
    <p class="pz-lead">點一個你想玩的！每完成一種都能蓋一個章 ${ic('star')}</p>
    <div class="pz-grid big">
      <a class="pz-tile gold tap-hint" href="#/exam"><span class="pz-new">NEW</span><span class="pz-ic">${ic('medal')}</span><b>考試準備度</b><small>英文 ${ex.enB}／1,200・韓文 ${ex.koA}／982</small><span class="pz-tap"><img src="assets/art/icons/w-this.webp" alt="" onerror="this.remove()"><b>點我！</b></span></a>
      <a class="pz-tile pink" href="#/hangul"><span class="pz-ic">${ic('ko')}</span><b>韓文 40 音</b><small>${hangulProgress().passed}／4 關・打基礎</small></a>
      <a class="pz-tile mint" href="#/exam/bank"><span class="pz-new">NEW</span><span class="pz-ic">${ic('book')}</span><b>單字庫</b><small>國中 1,200 字，看卡＋小測驗</small></a>
      <a class="pz-tile lilac" href="#/exam/quiz"><span class="pz-ic">${ic('star')}</span><b>模擬小考</b><small>選擇・聽力・拼字</small></a>
      <a class="pz-tile pink" href="#/talk/drill"><span class="pz-ic">${ic('mic')}</span><b>語音特訓</b><small>用說的抽考</small></a>
      <a class="pz-tile sky" href="#/game/match-ko"><span class="pz-ic">${ic('cards')}</span><b>翻牌配對</b><small>小遊戲</small></a>
      <a class="pz-tile peach" href="#/game/speed-ko"><span class="pz-ic">${ic('fire')}</span><b>60 秒快問快答</b><small>挑戰最佳紀錄</small></a>
    </div>
    <h2 class="sec">${ic('book')} 科目題庫：國文・英文・韓文・梗翻譯</h2>
    <div class="pz-grid subj-row">
      ${SUBJECTS.map((sub, i) => `<a class="pz-tile ${['peach', 'sky', 'pink', 'lilac'][i % 4]}" href="#/subject/${sub.id}"><span class="pz-ic">${ic(sub.id)}</span><b>${sub.name}</b><small>${sub.desc}</small></a>`).join('')}
    </div>
    <h2 class="sec">更多練習</h2>
    <a class="deck voice-drill" href="#/talk/drill"><div class="emoji">${ic('mic')}</div><div class="grow"><b>語音特訓</b><small>用說的！隨機抽考學過的字和句子（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/map"><div class="emoji">${ic('book')}</div><div class="grow"><b>章節地圖・回放</b><small>重看以前的短劇、重演對話（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/game/speed-ko"><div class="emoji">${ic('mic')}</div><div class="grow"><b>60 秒快問快答</b><small>看圖用說的回答，挑戰自己的最佳紀錄（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/game/match-ko"><div class="emoji">${ic('trophy')}</div><div class="grow"><b>翻牌配對</b><small>找出圖片和韓文（或英文）的配對，配對成功會念給你聽（集章）</small></div><div class="chev">›</div></a>
    <a class="deck" href="#/quiz/daily"><div class="emoji">${ic('star')}</div><div class="grow"><b>打歌任務</b><small>每日 10 題測驗，題目會念給你聽（集章）</small></div><div class="chev">›</div></a>

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

views.cards = () => {
  const s = store.get();
  const got = new Map(s.collection.map((r) => [r.day, r]));
  const days = LEVELS.filter((l) => !l.boss);
  const total = Math.max(days.length, ...s.collection.map((r) => r.day));
  const slots = Array.from({ length: total }, (_, i) => i + 1);
  const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const old = [...s.cards].reverse();
  $app.innerHTML = `
    <section class="lobby collection">
      <div class="lobby-bg" aria-hidden="true"></div>
      <header class="lobby-top">
        <a class="back-btn" href="#/home">‹ 回大廳</a>
        <div class="brand">我的收藏室<small>MY COLLECTION</small></div>
        <div class="pills"><span class="stat-pill">${ic('cards')} 小卡 <b>${s.collection.filter((r) => r.kind === 'card').length}</b></span><span class="stat-pill">${ic('gift')} 周邊 <b>${s.collection.filter((r) => r.kind === 'merch').length}</b></span></div>
      </header>
      <div class="col-main">
        <section class="glass col-binder">
          <h2>卡冊</h2>
          <p class="muted small">每上完一天的課，就會拿到那一天的收藏品。灰色的是還沒解鎖的。</p>
          <div class="binder">${slots.map((n) => {
            const r = got.get(n) || rewardForDay(n);
            return `<div class="slot"><span class="slot-day">第 ${n} 天</span>${rewardHTML(r, { locked: !got.has(n) })}</div>`;
          }).join('')}</div>
        </section>
        <section class="glass col-history">
          <h2>收藏歷程</h2>
          ${s.collection.length ? `<ol class="timeline">${[...s.collection].reverse().map((r) => `<li><span class="tl-date">${fmt(r.at)}</span><span class="tl-dot"></span><div><b>${esc(r.name)}</b><small>第 ${r.day} 天「${esc(r.title)}」上完拿到</small></div></li>`).join('')}</ol>`
            : '<p class="muted">還沒有收藏品。上完第一天的課，就會拿到第一張小卡！</p><a class="cta" href="#/talk">' + ic('mic') + ' 去上今天的課</a>'}
        </section>
      </div>
      ${old.length ? `<section class="glass col-old"><h2>測驗抽到的單字卡</h2><div class="card-grid">${old.map((c) => cardHTML(c, true)).join('')}</div></section>` : ''}
    </section>`;
};

views.me = () => {
  const s = store.get();
  const r = rankOf(s.xp);
  const acc = s.stats.answered ? Math.round((s.stats.correct / s.stats.answered) * 100) : 0;
  $app.innerHTML = `
    <h1 class="page-title">${ic('me')} 我的</h1>
    <div class="profile-card">
      <div class="avatar">${esc(s.profile.name.slice(0, 1))}</div>
      <div><b>${esc(s.profile.name)}</b><div class="muted small">${esc(r.name)}・${esc(stageById(s.profile.stage).name)}</div></div>
    </div>
    <div class="grid3">
      <div class="stat"><b>${s.xp}</b><small>應援值</small></div>
      <div class="stat"><b>${s.stats.answered}</b><small>作答題數</small></div>
      <div class="stat"><b>${acc}%</b><small>正確率</small></div>
    </div>
    <h2 class="sec">我的偶像世界</h2>
    <form class="names-form" id="namesForm">
      <label>經紀公司名稱<input id="nAgency" maxlength="12" placeholder="${esc(DEFAULT_NAMES.agency)}" value="${esc(s.names?.agency || '')}"></label>
      <label>前輩女團名稱<input id="nGroup" maxlength="12" placeholder="${esc(DEFAULT_NAMES.group)}" value="${esc(s.names?.group || '')}"></label>
      <label>前輩女團的韓文名字<small>選填，例如 노바；韓文對話會用這個名字</small><input id="nGroupKo" maxlength="12" placeholder="${esc(DEFAULT_NAMES.groupKo)}" value="${esc(s.names?.groupKo || '')}"></label>
      <label>我未來的團名<small>出道那天會用到，可以之後再想</small><input id="nMyGroup" maxlength="12" value="${esc(s.names?.myGroup || '')}"></label>
      <button class="btn primary" type="submit">儲存名字</button>
    </form>
    <a class="deck" href="#/history"><div class="emoji">${ic('book')}</div><div class="grow"><b>學習歷程</b><small>每天練了什麼、說了哪些句子、哪些還要加強</small></div><div class="chev">›</div></a>
    <div class="row center"><button class="btn" id="exportBtn">匯出進度</button><label class="btn">匯入進度<input type="file" id="importFile" accept=".json" hidden></label></div>
    <h2 class="sec">聲音</h2>
    <div class="sound-set">
      <label><input type="checkbox" id="setMusic" ${s.settings?.music !== false ? 'checked' : ''}> 輕柔配樂</label>
      <label><input type="checkbox" id="setSfx" ${s.settings?.sfx !== false ? 'checked' : ''}> 音效</label>
      <label><input type="checkbox" id="setSlow" ${s.settings?.slow !== false ? 'checked' : ''}> 外語慢速念</label>
    </div>
    <h2 class="sec">升級之路</h2>
    <div class="ranks">${RANKS.map((x, i) => `<div class="rk ${i <= r.idx ? 'on' : ''}"><b>${esc(x.name)}</b><small>${esc(x.ko)}・${x.xp}</small></div>`).join('')}</div>
    <div class="actions">
      <a class="btn big" href="#/onboard">${ic('me')} 修改藝名／學程／應援色</a>
      <button class="btn ghost danger" id="me-reset">清除所有進度</button>
    </div>
    <p class="muted small center">${ttsOK ? '' : '這個瀏覽器不支援語音朗讀，聽力題會自動略過。'}進度只存在這台裝置上。</p>`;
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
  document.body.classList.toggle('is-lobby', view === views.home || view === views.talk || view === views.cards);
  const hideNav = ['onboard', 'quiz', 'flash', 'talk'].includes(name) && !(name === 'onboard' && s.profile);
  $nav.hidden = hideNav;
  $nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#/${name}`));
  view(arg);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
applyAccent();
armAudio();
route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
