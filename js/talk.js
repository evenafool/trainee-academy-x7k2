// 語音教室：按一下麥克風，敏雅老師用說的帶課；孩子用說的回答，不用打字
// 三種模式共用同一套語音引擎：
//   #/talk 或 #/talk/3     上新課（先演短劇 → 複習舊字 → 3 個新字 → 記憶挑戰 → 整句分段跟讀 → 演對話）
//   #/talk/3-replay        回放舊篇章（重看短劇＋重演對話，複習用）
//   #/talk/drill           語音特訓（舊字隨機抽考、舊句子再練一次）
import { LEVELS, WORDS, STORIES, TEASERS, BADGES, INTROS } from './course.js';
import * as store from './store.js';
import { esc, ic, wic, pick, shuffle, sleep, speakAsync, stopSpeaking, ttsOK, dayStr } from './util.js';
import { rewardForDay, rewardHTML } from './rewards.js';
import { sfx, duck } from './sound.js';
import { openDrama, closeDrama, openStage, panelSrcs } from './drama.js';
import { THEMES } from './themes.js';

const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
const NAMES = { me: '你', mina: '敏雅', leo: 'Leo', nova: '露娜', kong: '孔老師', seoyun: '徐允', coach: '姜教練' };
const PRAISE = ['好棒！', '完美！', '超標準！', '太厲害了！', '答對了！', '發音好清楚！'];
const DAYS = () => LEVELS.filter((l) => !l.boss);

let session = 0; // 換頁或按停止時加一，舊的流程就會自己結束
let rec = null;
let skipNow = null;
let againNow = null;
let wantTalk = false; // 孩子按了麥克風：老師馬上停，接下來的話只顯示不念，直接換孩子說
let resumeMic = null; // 麥克風沒開成功時，等孩子再按一次
let $root = null;
let steps = [];
let stage = null; // 上台演出時的舞台（對話框、麥克風、導演泡泡都搬到舞台上）
const langOf = (t) => (/[가-힯]/.test(t) ? 'ko-KR' : /^[A-Za-z]/.test(t) ? 'en-US' : 'zh-TW');

class Stop extends Error {}
const AGAIN = Symbol('again');

export function stopTalk() {
  session++;
  closeDrama();
  stage = null;
  stopSpeaking();
  try { rec?.abort(); } catch (e) { /* 已經停了 */ }
  rec = null;
}

// 今天要上的課：第一個還沒破關的一般關卡
export function todayLesson() {
  const cleared = store.get().course?.cleared || {};
  const days = DAYS();
  const i = Math.max(0, days.findIndex((l) => !cleared[l.id]));
  return { lv: days[i], n: i + 1 };
}

// ───────── 速度：外語預設放慢，讓孩子跟得上 ─────────
const slow = () => store.get().settings?.slow !== false;
function rateFor(lang, extraSlow) {
  if (lang === 'zh-TW') return undefined;
  const ko = lang === 'ko-KR'; // 韓文最陌生，放得最慢
  if (extraSlow) return ko ? 0.55 : 0.65;
  if (slow()) return ko ? 0.7 : 0.8;
  return ko ? 0.85 : 0.95;
}

// ───────── 比對念得像不像 ─────────
const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function lcs(a, b) {
  const dp = Array(b.length + 1).fill(0);
  for (const ca of a) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = ca === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}
function similarity(alts, target) {
  const t = norm(target);
  if (!t) return 0;
  return Math.max(0, ...alts.map((a) => {
    const n = norm(a);
    if (!n) return 0;
    if (n.includes(t)) return 1;
    return lcs(n, t) / Math.max(t.length, n.length * 0.8);
  }));
}
// 長句切成小段（每段 1～2 個詞），用來「一段一段跟讀」
function chunksOf(text) {
  const words = String(text).trim().split(/\s+/);
  if (words.length <= 2) return [text];
  const out = [];
  for (let i = 0; i < words.length; i += 2) out.push(words.slice(i, i + 2).join(' '));
  return out;
}

// ───────── 畫面 ─────────
const q = (sel) => $root.querySelector(sel);

let curStep = 0;
function setStep(i) {
  curStep = i;
  const pct = Math.round((Math.min(i, steps.length) / steps.length) * 100);
  q('#tSteps').innerHTML = `<div class="tprog"><i style="width:${pct}%"></i></div><span class="tnow">${i >= steps.length ? '★ 完成！' : `★ ${steps[i]}`}</span>`;
}
function setScene(kind, lvId, caption, word) {
  const box = q('#sceneCard');
  box.querySelector('.scene-sticker')?.remove();
  if (word) box.insertAdjacentHTML('beforeend', `<span class="scene-sticker">${wic(word)}<b>${esc(word.zh)}</b><small>${esc(word.ko)}・${esc(word.en)}</small></span>`);
  const img = box.querySelector('img');
  const bg = box.dataset.bg;
  img.onerror = () => { img.onerror = null; img.src = `assets/art/bg-${bg}.webp`; img.onerror = () => { img.src = 'assets/art/bg-practice.webp'; }; };
  img.src = lvId ? `assets/art/${kind}-${lvId}.webp` : 'assets/art/bg-practice.webp';
  box.querySelector('figcaption').textContent = caption;
  box.hidden = false;
}

function setSceneSrc(srcs, caption, word) {
  const box = q('#sceneCard');
  box.querySelector('.scene-sticker')?.remove();
  if (word) box.insertAdjacentHTML('beforeend', `<span class="scene-sticker">${wic(word)}<b>${esc(word.zh)}</b><small>${esc(word.ko)}・${esc(word.en)}</small></span>`);
  const img = box.querySelector('img');
  let k = 0;
  const next = () => { if (k < srcs.length) img.src = srcs[k++]; };
  img.onerror = next;
  next();
  box.querySelector('figcaption').textContent = caption;
  box.hidden = false;
}

function setOrb(state, label) {
  const orb = q('#orb');
  orb.dataset.state = state;
  orb.innerHTML = ic(state === 'speaking' ? 'speaker' : 'mic', 'orb-ic');
  orb.setAttribute('aria-label', state === 'speaking' ? '打斷老師，換我說' : state === 'listening' ? '正在聽你說' : '開始用說的上課');
  q('#orbLabel').textContent = label;
  q('#orbHint').textContent = state === 'listening' ? '聽到「叮」就可以說，說完停一下' : state === 'speaking' ? '想說話隨時按麥克風' : '';
  q('#skipBtn').hidden = state !== 'listening';
  q('#againBtn').hidden = state !== 'listening' || !againNow;
  q('#stopTalkBtn').hidden = state === 'idle';
  stage?.mic(state, label, { again: !!againNow });
}
function addCard(who, text, cls = '') {
  if (stage && who === 't') stage.coach(text);
  if (stage && who === 's') stage.heard(text, cls.includes('live'));
  const log = q('#tLog');
  const m = document.createElement('div');
  m.className = `tmsg ${who} ${cls}`;
  const lines = esc(text).split('\n').map((l) => `<div class="tline${/[가-힯]/.test(l) ? ' ko' : /^[A-Za-z]/.test(l) ? ' en' : ''}">${l}</div>`).join('');
  const tag = who === 't' ? '민아 쌤' : who === 's' ? store.get().profile.name : who;
  m.innerHTML = who === 't'
    ? `<div class="tav"><img src="assets/art/teacher-face.webp" alt=""></div><div class="tcard"><span class="ttag">${tag}</span><div class="tbubble">${lines}</div></div>`
    : `<div class="tcard"><span class="ttag">${esc(tag)}</span><div class="tbubble">${lines}</div></div>`;
  log.append(m);
  log.scrollTop = log.scrollHeight;
  return m;
}

// ───────── 說與聽 ─────────
// segments：[文字, 語言, 是否特慢]；外語自動放慢
async function say(my, segments, show, who = 't') {
  if (my !== session) throw new Stop();
  addCard(who, show ?? segments.map((s) => s[0]).join(''));
  if (wantTalk) return;
  setOrb('speaking', '老師說話中…');
  duck(true);
  for (const [text, lang, extraSlow] of segments) {
    if (my !== session) throw new Stop();
    if (wantTalk) break;
    if (ttsOK) await speakAsync(text, lang, rateFor(lang, extraSlow));
    await sleep(lang === 'zh-TW' ? 120 : 350); // 外語念完停一下，留時間在腦中重複
  }
  duck(false);
  if (my !== session) throw new Stop();
}

async function sayQuiet(my, segments) {
  if (my !== session) throw new Stop();
  if (wantTalk) return;
  setOrb('speaking', '演出中…');
  duck(true);
  for (const [text, lang, extraSlow] of segments) {
    if (my !== session) throw new Stop();
    if (wantTalk) break;
    if (ttsOK) await speakAsync(text, lang, rateFor(lang, extraSlow));
    await sleep(lang === 'zh-TW' ? 120 : 300);
  }
  duck(false);
  if (my !== session) throw new Stop();
}

// 聽孩子說；麥克風開不成功就顯示原因，等孩子再按麥克風重試（不會讓整堂課重來）
async function hearSafe(my, lang, model) {
  for (;;) {
    try {
      return await hear(my, lang, model);
    } catch (err) {
      if (err instanceof Stop || my !== session) throw new Stop();
      const note = q('#talkNote');
      note.hidden = false;
      note.textContent = /not-allowed|service-not-allowed/.test(err.message)
        ? '麥克風被擋住了：請點網址列左邊的鎖頭圖示，把「麥克風」改成「允許」，再按一次麥克風。'
        : /audio-capture/.test(err.message) ? '找不到麥克風：請確認麥克風有插好、Windows 的麥克風權限有打開，再按一次麥克風。'
          : /network/.test(err.message) ? '語音辨識需要網路：請確認網路正常，再按一次麥克風。'
            : `麥克風出了點問題（${err.message}），再按一次麥克風試試看。`;
      stage?.coach(note.textContent);
      setOrb('retry', '按麥克風再試一次');
      await new Promise((res) => { resumeMic = res; });
      resumeMic = null;
      note.hidden = true;
    }
  }
}

// 收音改良：老師念完先等一下再開麥克風（避免切掉第一個字）、叮一聲提示、
// 連續收音直到孩子說完停頓 1.2 秒；完全沒聲音時自動重開，最多聽 15 秒。
function hear(my, lang, model) {
  if (my !== session) return Promise.reject(new Stop());
  wantTalk = false;
  stopSpeaking();
  return new Promise((resolve, reject) => {
    let done = false;
    let alts = [];
    let interim = '';
    let quietTimer = null;
    let note = null;
    const started = Date.now();
    const finish = (val) => {
      if (done) return;
      done = true;
      clearTimeout(quietTimer);
      skipNow = againNow = null;
      try { rec?.abort(); } catch (e) { /* */ }
      rec = null;
      if (note) {
        note.classList.remove('live');
        const said = alts[0] || interim;
        if (val === AGAIN) note.remove();
        else { note.querySelector('.tbubble').textContent = said || '（沒聽到聲音）'; stage?.heard(said || '（沒聽到聲音）', false); }
      }
      resolve(val ?? (alts.length ? alts : interim ? [interim] : []));
    };
    skipNow = () => finish(null);
    againNow = model ? () => finish(AGAIN) : null;
    const startRec = () => {
      if (done || my !== session) return;
      const r = new Rec();
      rec = r;
      r.lang = lang;
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 5;
      r.onresult = (e) => {
        interim = '';
        for (const res of e.results) {
          if (res.isFinal) alts = [...res].map((a) => a.transcript);
          else interim += res[0].transcript;
        }
        note.querySelector('.tbubble').textContent = alts[0] || interim || '我在聽，請說…';
        stage?.heard(alts[0] || interim || '我在聽，請說…', true);
        clearTimeout(quietTimer);
        quietTimer = setTimeout(() => finish(), alts.length ? 1200 : 2200); // 說完停一下就結束
      };
      r.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        done = true;
        clearTimeout(quietTimer);
        note?.remove();
        reject(new Error(e.error));
      };
      r.onend = () => {
        if (done) return;
        if (!alts.length && !interim && Date.now() - started < 15000) { startRec(); return; } // 沒聽到就再聽
        finish();
      };
      try { r.start(); } catch (err) { done = true; reject(err); }
    };
    setTimeout(() => {
      if (my !== session) { finish(null); return; }
      note = addCard('s', '我在聽，請說…', 'live');
      setOrb('listening', lang === 'ko-KR' ? '用韓文說說看' : lang === 'en-US' ? '用英文說說看' : '用說的回答我');
      sfx('ding');
      duck(true);
      setTimeout(startRec, 180);
    }, 300);
  });
}

// 跟念：最多 3 次。第 2 次老師用「特慢」再示範，第 3 次一段一段帶；都不行就鼓勵後繼續
async function practice(my, tally, target, lang, intro, show, threshold = 0.6) {
  await say(my, [[intro, 'zh-TW'], [target, lang]], show);
  for (let attempt = 0; attempt < 3;) {
    const alts = await hearSafe(my, lang, true);
    if (alts === AGAIN) { await say(my, [[target, lang, true]], `再聽一次：${target}`); continue; }
    if (alts === null) { tally.tries++; return false; } // 跳過
    tally.tries++;
    const sim = similarity(alts, target);
    store.logSay(target, lang, alts[0], sim >= threshold || (attempt === 2 && sim >= threshold * 0.6), steps[curStep] || '');
    if (sim >= threshold || (attempt === 2 && sim >= threshold * 0.6)) {
      tally.good++;
      sfx('right');
      await say(my, [[pick(PRAISE), 'zh-TW']]);
      return true;
    }
    attempt++;
    sfx('soft');
    if (attempt === 1) await say(my, [[alts.length ? '差一點點！聽我念慢一點：' : '我沒聽清楚，再說一次：', 'zh-TW'], [target, lang, true]]);
    else if (attempt === 2) {
      const parts = chunksOf(target);
      if (parts.length > 1) {
        await say(my, [['我們拆開來，一段一段念：', 'zh-TW']]);
        for (const p of parts) await say(my, [[p, lang, true]], `　${p}`);
      }
      await say(my, [['最後一次，整句：', 'zh-TW'], [target, lang, true]]);
    }
  }
  await say(my, [['沒關係，多聽幾次就會了，我們繼續！', 'zh-TW']]);
  return false;
}

// 整句分段跟讀（往後疊加）：A → A B → A B C …，每一步都先聽再說
async function shadow(my, tally, text, lang, label) {
  const parts = chunksOf(text);
  if (parts.length === 1) return practice(my, tally, text, lang, label, `${label}${text}`, 0.6);
  await say(my, [[`${label}這句比較長，我們一段一段來。`, 'zh-TW']], `${label}${text}\n（分 ${parts.length} 段，跟著我念）`);
  let built = '';
  for (const p of parts) {
    built = built ? `${built} ${p}` : p;
    await practice(my, tally, built, lang, '跟我念：', `跟我念：${built}`, 0.5);
  }
  return true;
}

// 開卡動畫：卡片翻面亮相，按「收下」放進收藏室
async function revealReward(my, r) {
  if (my !== session) throw new Stop();
  const box = document.createElement('div');
  box.className = 'reveal';
  box.innerHTML = `<div class="reveal-box"><p class="reveal-title">${ic('gift')} 今天的獎勵</p><div class="reveal-card">${rewardHTML(r, { big: true })}</div><p class="reveal-name">${esc(r.name)}</p><button type="button" class="pill-btn strong">收下，放進收藏室</button></div>`;
  $root.querySelector('.talk').append(box);
  sfx('reward');
  if (ttsOK) speakAsync(`今天的獎勵是：${r.name}！`, 'zh-TW');
  await new Promise((res) => { box.querySelector('button').onclick = res; });
  box.remove();
  addCard('t', `${r.name} 已經放進收藏室囉！`);
}

async function goalCheck(my, res) {
  const d = res.daily;
  sfx(res.goalJustMet ? 'reward' : 'stamp');
  await say(my, [[`今天集到 ${Math.min(d.stamps.length, store.DAILY_GOAL)} 個章。`, 'zh-TW']],
    `今日集章 ${Math.min(d.stamps.length, store.DAILY_GOAL)}／${store.DAILY_GOAL}：${d.stamps.map((k) => store.STAMPS[k]?.name).join('、')}`);
  if (res.goalJustMet) await say(my, [['恭喜！今天的目標達成了！', 'zh-TW']], '★ 今日目標達成！連續打卡 +1');
}

// ───────── 短劇：先把今天的故事「演」一次 ─────────
async function playDrama(my, lv, n) {
  const st = STORIES[lv.id];
  setScene('story', lv.id, `短劇：${st.title}`);
  await say(my, [[`先來看今天的短劇：「${st.title}」！看到發光的新單字，記得點一下收集喔！`, 'zh-TW']], `【短劇劇場】${st.title}\n看到發光的新單字，點一下收集！`);
  setOrb('speaking', '短劇播放中…');
  const res = await openDrama(lv, n, { endLabel: '回到教室，學這些新字' });
  if (my !== session) throw new Stop();
  const tapped = res?.tapped || 0;
  addCard('t', `看完短劇「${st.title}」了！${tapped ? `你親手抓到 ${tapped} 個新字，眼睛好利！` : '三個新字已經收進口袋，我們來一個一個學！'}`);
}

// 這個字在短劇裡是哪一句說的（短劇台詞有標記 w）
function dramaLineFor(lv, w) {
  const st = STORIES[lv.id];
  for (const [i, p] of (st?.panels || []).entries()) {
    const s = p.say.find((x) => x.w === w.id);
    if (s) return { ...s, panel: i, bg: p.bg };
  }
  return null;
}

// 找出對話裡用到這個字的那一句（用英文比對，再用韓文字根比對）
function lineFor(lv, w) {
  const key = w.en.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter((x) => x.length > 2)[0] || w.en.toLowerCase();
  const root = w.ko.replace(/[!?.~ ]/g, '').slice(0, 2);
  const re = new RegExp(`\\b${key}`, 'i');
  return lv.dialogue.find((l) => re.test(l.en)) || lv.dialogue.find((l) => l.ko.replace(/ /g, '').includes(root)) || null;
}

// 複習：從以前學過的字裡抽（先抽到期的），不給答案先讓孩子想
function oldWords(exclude, n) {
  const L = store.get().course.learned;
  const ids = Object.keys(L).filter((id) => WORDS[id] && !exclude.includes(id));
  const due = shuffle(ids.filter((id) => (L[id].due || '') <= store.today()));
  const rest = shuffle(ids.filter((id) => !due.includes(id)));
  return [...due, ...rest].slice(0, n).map((id) => WORDS[id]);
}
async function recall(my, tally, w, lang) {
  q('#sceneCard .scene-sticker')?.remove();
  const target = lang === 'ko-KR' ? w.ko : w.en;
  const langName = lang === 'ko-KR' ? '韓文' : '英文';
  await say(my, [[`「${w.zh}」的${langName}怎麼說？`, 'zh-TW']], `回想看看：「${w.zh}」的${langName}？`);
  const alts = await hearSafe(my, lang, false);
  const ok = alts && alts !== AGAIN && similarity(alts, target) >= 0.6;
  tally.tries++;
  store.logSay(target, lang, Array.isArray(alts) ? alts[0] : '', ok, `回想：${w.zh}`);
  if (ok) {
    tally.good++;
    sfx('right');
    await say(my, [[pick(PRAISE), 'zh-TW'], [target, lang]], `${pick(PRAISE)}　${target}`);
  } else {
    sfx('soft');
    await say(my, [['答案是：', 'zh-TW'], [target, lang, true]], `答案是：${target}${lang === 'ko-KR' ? `（${w.kr}）` : ''}${w.note ? `\n小撇步：${w.note}` : ''}`);
    await practice(my, tally, target, lang, '跟我念一次：', `跟我念：${target}`, 0.55);
  }
  store.reviewWord(w.id, !!ok);
  return ok;
}
function oldLines(excludeId, n) {
  const cleared = store.get().course.cleared;
  const lines = DAYS().filter((l) => cleared[l.id] && l.id !== excludeId).flatMap((l) => l.dialogue.filter((d) => d.c === 'me').map((d) => ({ ...d, from: l.title })));
  return shuffle(lines).slice(0, n);
}

// ───────── 上新課 ─────────
async function runLesson(my, lv, n) {
  steps = ['看短劇', '複習', '第 1 個字', '第 2 個字', '第 3 個字', '記憶挑戰', '整句跟讀', '演對話（韓）', '演對話（英）', '延伸字', '收尾'];
  const name = store.get().profile.name;
  const words = lv.words.map((id) => WORDS[id]);
  const tally = { good: 0, tries: 0 };

  setStep(0);
  await say(my, [[`嗨，${name}！今天是第 ${n} 天。`, 'zh-TW']], `嗨，${name}！今天是第 ${n} 天「${lv.title}」`);
  await playDrama(my, lv, n);
  await say(my, [[`這一集會用到三個新字：${words.map((w) => w.zh).join('、')}。準備好就說「好」！`, 'zh-TW']],
    `這集的三個新字：${words.map((w) => w.zh).join('、')}\n準備好就說「好」！`);
  await hearSafe(my, 'zh-TW', false);

  setStep(1);
  const olds = oldWords(lv.words, 2);
  if (olds.length) {
    await say(my, [['先熱身，複習以前學過的字！', 'zh-TW']]);
    for (const [i, w] of olds.entries()) await recall(my, tally, w, i % 2 ? 'en-US' : 'ko-KR');
  }

  for (const [i, w] of words.entries()) {
    setStep(2 + i);
    const sc = w.scenes[0];
    const line = lineFor(lv, w);
    const dl = dramaLineFor(lv, w);
    if (dl) {
      const who = NAMES[dl.c] || dl.c;
      setSceneSrc(panelSrcs(lv, dl.panel, dl.bg), `短劇裡${who}說：「${dl.sub || dl.t}」`, w);
      await say(my, [[`還記得短劇裡${who}說的這句嗎？`, 'zh-TW'], [dl.t, langOf(dl.t)], [`裡面的「${dl.hl}」，就是今天的字：${w.zh}！`, 'zh-TW']],
        `還記得短劇裡${who}說的這句嗎？\n${dl.t}\n${dl.sub || ''}\n→「${dl.hl}」就是「${w.zh}」`);
    } else if (line) {
      setScene('talk', lv.id, `圖裡的${NAMES[line.c]}說：「${line.zh}」`, w);
      await say(my, [[`看這張圖！${NAMES[line.c]}說：`, 'zh-TW'], [line.ko, 'ko-KR'], [`意思是：${line.zh}。裡面就有今天的字：${w.zh}！`, 'zh-TW']],
        `看圖！${NAMES[line.c]}說：\n${line.ko}\n${line.en}\n${line.zh}　← 裡面有「${w.zh}」`);
    } else {
      setScene('story', lv.id, `短劇：${STORIES[lv.id].title}`, w);
    }
    await say(my, [[`第 ${i + 1} 個字：${w.zh}！`, 'zh-TW'], [w.ko, 'ko-KR'], [w.ko, 'ko-KR', true]],
      `第 ${i + 1} 個字：${w.zh}\n韓　${w.ko}（${w.kr}）\n英　${w.en}`);
    await say(my, [[`小撇步：${w.note}`, 'zh-TW']], `小撇步：${w.note}`);
    await practice(my, tally, w.ko, 'ko-KR', '跟我念韓文：', `跟我念韓文：${w.ko}（${w.kr}）`, 0.65);
    await say(my, [['英文是：', 'zh-TW'], [w.en, 'en-US'], [w.en, 'en-US', true]], `英文：${w.en}`);
    await practice(my, tally, w.en, 'en-US', '換你說英文：', `換你說英文：${w.en}`, 0.65);
    await say(my, [['放進句子裡：', 'zh-TW'], [sc.ko, 'ko-KR'], [sc.en, 'en-US']], `放進句子裡：\n韓　${sc.ko}（${sc.kr}）\n英　${sc.en}\n${sc.zh}`);
    await shadow(my, tally, sc.en, 'en-US', '英文句子：');
  }

  setStep(5);
  await say(my, [['記憶挑戰！不看答案，用想的。', 'zh-TW']], '記憶挑戰：老師說中文，你說外語');
  for (const [i, w] of shuffle(words).entries()) await recall(my, tally, w, i % 2 ? 'en-US' : 'ko-KR');

  setStep(6);
  const big = words[n % 3].scenes[1];
  await say(my, [['挑戰整句！意思是：', 'zh-TW'], [big.zh, 'zh-TW'], [big.ko, 'ko-KR', true]], `挑戰整句：${big.zh}\n韓　${big.ko}（${big.kr}）\n英　${big.en}`);
  await shadow(my, tally, big.ko, 'ko-KR', '韓文整句：');
  await shadow(my, tally, big.en, 'en-US', '英文整句：');

  await playDialogue(my, tally, lv, 7, n);

  const old = oldLines(lv.id, 1)[0];
  if (old) {
    await say(my, [['最後，還記得這句嗎？', 'zh-TW']], `還記得「${old.from}」這句嗎？\n${old.zh}`);
    await shadow(my, tally, old.ko, 'ko-KR', '');
  }

  await runExtras(my, tally, lv, 9);

  setStep(10);
  const res = complete(lv, tally, [...lv.words, ...(lv.extra || [])], n);
  await say(my, [[`太厲害了！今天拿到 ${res.stars} 顆星，應援值加 ${res.xp}！`, 'zh-TW']],
    `今天的課完成了！\n${'★'.repeat(res.stars)}${'☆'.repeat(3 - res.stars)}　應援值 +${res.xp}${res.earned.length ? `\n新勳章：${res.earned.map((b) => b.name).join('、')}` : ''}`);
  await goalCheck(my, res);
  if (res.reward) await revealReward(my, res.reward);
  if (TEASERS[lv.id]) await say(my, [[TEASERS[lv.id], 'zh-TW']], `下集預告\n${TEASERS[lv.id]}`);
  await say(my, [['明天見！', 'zh-TW'], ['오늘도 수고했어요!', 'ko-KR'], ['Great job today!', 'en-US']], '今天就練到這裡，明天記得回來喔！\n韓　오늘도 수고했어요!（辛苦了！）\n英　Great job today!');
}

// ───────── 延伸字快閃：剛剛劇情裡出現的考試常考字，聽一次、看例句、跟念英文 ─────────
function markExtra(id) {
  q('#drillWords')?.querySelectorAll('.tword.ext').forEach((el) => el.classList.toggle('on', el.dataset.x === id));
}
async function runExtras(my, tally, lv, stepIdx) {
  const extras = (lv.extra || []).map((id) => WORDS[id]).filter(Boolean);
  if (!extras.length) return;
  setStep(stepIdx);
  await say(my, [[`加碼時間！剛剛的劇情裡還藏著 ${extras.length} 個考試常考的延伸字，就是舞台上金色的那幾個字。`, 'zh-TW']],
    `【延伸字】劇情裡還藏著 ${extras.length} 個考試常考字\n（舞台台詞裡金色的字）`);
  for (const [i, w] of extras.entries()) {
    const sc = w.scenes[0];
    markExtra(w.id);
    setSceneSrc([`assets/art/story-${lv.id}.webp`, `assets/art/bg-${lv.bg}.webp`], `延伸字 ${i + 1}／${extras.length}：${w.zh}`, w);
    await say(my, [[`延伸字：${w.zh}！`, 'zh-TW'], [w.en, 'en-US'], [w.ko, 'ko-KR']],
      `延伸字 ${i + 1}：${w.zh}\n英　${w.en}\n韓　${w.ko}（${w.kr}）${w.note ? `\n小撇步：${w.note}` : ''}`);
    await say(my, [[sc.en, 'en-US']], `劇情裡的句子：\n${sc.en}\n${sc.ko}\n${sc.zh}`);
    await practice(my, tally, w.en, 'en-US', '跟我念英文：', `跟我念英文：${w.en}`, 0.6);
  }
  markExtra('');
}

// 對話：先用韓文演一次，再用英文演一次；輪到你時老師先示範
// 麥克風按鈕的共用動作：老師說話中→打斷換我說；麥克風壞掉→重試
function orbAction() {
  const state = q('#orb').dataset.state;
  if (state === 'speaking') { wantTalk = true; stopSpeaking(); return true; }
  if (state === 'retry') { resumeMic?.(); return true; }
  return false;
}

// 對話練習搬到舞台上：大畫面是對話情境圖，左邊是對手角色、右邊是你；輪到你時對話框出現麥克風
async function playDialogue(my, tally, lv, stepIdx, n) {
  setStep(stepIdx);
  setScene('talk', lv.id, `情境對話：${lv.title}`);
  const before = { good: tally.good, tries: tally.tries };
  const xs = (lv.extra || []).map((id) => WORDS[id]).filter((w) => w?.inDialogue);
  const extOf = (l, lang) => xs.filter((w) => w.scenes[0].en === l.en).map((w) => (lang === 'ko-KR' ? w.hl.ko : w.hl.en));
  stage = openStage(lv, n, { title: '上台演出' });
  stage.onMic(orbAction);
  stage.onAgain(() => againNow?.());
  stage.onSkip(() => skipNow?.());
  stage.onClose(() => { stopTalk(); setOrb('idle', '按一下大麥克風，重新開始'); });
  try {
    if (INTROS[lv.id]) {
      stage.show({ name: '旁白', text: INTROS[lv.id], narr: true });
      stage.focus(null);
      await sayQuiet(my, [[INTROS[lv.id], 'zh-TW']]);
    }
    for (const [round, lang] of [[0, 'ko-KR'], [1, 'en-US']]) {
      setStep(stepIdx + round);
      await say(my, [[round ? '再用英文演一次！' : `換你上台！我演${NAMES[lv.with]}，你演你自己。`, 'zh-TW']]);
      for (const l of lv.dialogue) {
        const text = lang === 'ko-KR' ? l.ko : l.en;
        if (l.c === 'me') {
          stage.show({ name: `${NAMES.me}（換你說）`, text, sub: `${l.zh}${lang === 'ko-KR' ? `\n${l.kr}` : ''}`, mine: true, ext: extOf(l, lang) });
          stage.focus('me');
          await say(my, [[`換你說：${l.zh}`, 'zh-TW'], [text, lang, true]]);
          await shadow(my, tally, text, lang, '');
        } else {
          stage.show({ name: NAMES[l.c] || l.c, text, sub: l.zh, ext: extOf(l, lang) });
          stage.focus(l.c);
          await sayQuiet(my, [[text, lang]]);
        }
      }
    }
    const got = tally.good - before.good;
    const tries = tally.tries - before.tries;
    const r = tries ? got / tries : 1;
    const stars = r >= 0.85 ? 3 : r >= 0.55 ? 2 : 1;
    if (my !== session) throw new Stop();
    await stage.applause(stars, stars === 3 ? '台下掌聲如雷！完美演出！' : stars === 2 ? '很棒的演出！再練幾次會更順！' : '勇敢上台就很棒了！多聽幾次會越來越好！');
  } finally {
    if (stage) { stage.close(); stage = null; }
  }
}

// ───────── 上完課：記錄進度、星星、勳章 ─────────
function complete(lv, tally, words, n) {
  const s = store.get();
  const c = s.course;
  const rate = tally.tries ? tally.good / tally.tries : 0;
  const stars = rate >= 0.85 ? 3 : rate >= 0.55 ? 2 : 1;
  const first = !c.cleared[lv.id];
  c.cleared[lv.id] = Math.max(c.cleared[lv.id] || 0, stars);
  if (first) c.lastNewDay = store.today();
  for (const w of words) if (!c.learned[w]) c.learned[w] = { lvl: 0, due: dayStr(1) };
  c.spoken += tally.good;
  c.dialogues++;
  const xp = 30 + tally.good * 5;
  const reward = first ? { ...rewardForDay(n), day: n, title: lv.title, at: Date.now() } : null;
  if (reward) s.collection.push(reward);
  const earned = BADGES.filter((b) => !s.badges.includes(b.id) && b.check(s));
  s.badges.push(...earned.map((b) => b.id));
  const p = store.addProgress(xp, first ? 'lesson' : 'replay', { title: `第 ${n} 天・${lv.title}`, good: tally.good, tries: tally.tries, stars });
  return { stars, xp, earned, reward, ...p };
}

// ───────── 回放舊篇章 ─────────
async function runReplay(my, lv, n) {
  steps = ['看短劇', '演對話（韓）', '演對話（英）', '延伸字', '收尾'];
  const tally = { good: 0, tries: 0 };
  setStep(0);
  await say(my, [[`回放第 ${n} 天：「${lv.title}」！`, 'zh-TW']]);
  await playDrama(my, lv, n);
  await playDialogue(my, tally, lv, 1, n);
  await runExtras(my, tally, lv, 3);
  for (const w of lv.words) store.reviewWord(w, true);
  const L = store.get().course.learned;
  for (const id of lv.extra || []) if (!L[id]) L[id] = { lvl: 0, due: dayStr(1) };
  setStep(4);
  const res = store.addProgress(10 + tally.good * 3, 'replay', { title: `回放第 ${n} 天・${lv.title}`, good: tally.good, tries: tally.tries });
  await say(my, [[`回放完成！應援值加 ${10 + tally.good * 3}。`, 'zh-TW']]);
  await goalCheck(my, res);
}

// ───────── 語音特訓：舊字隨機抽考＋舊句子 ─────────
async function runDrill(my) {
  steps = ['抽考單字', '舊句子', '收尾'];
  const tally = { good: 0, tries: 0 };
  const ws = oldWords([], 6);
  setStep(0);
  if (!ws.length) {
    await say(my, [['你還沒有學過的字喔！先去上第一天的課吧。', 'zh-TW']]);
    return;
  }
  await say(my, [[`語音特訓開始！我會隨機抽 ${ws.length} 個以前學過的字。`, 'zh-TW']]);
  for (const [i, w] of ws.entries()) {
    q('#drillWords').innerHTML = ws.map((x, j) => `<div class="tword${j === i ? ' on' : ''}"><span class="tw-emoji">${wic(x)}</span><div><b>${esc(x.zh)}</b>${j < i ? '<small>✓</small>' : ''}</div></div>`).join('');
    await recall(my, tally, w, i % 2 ? 'en-US' : 'ko-KR');
  }
  setStep(1);
  for (const l of oldLines(null, 2)) {
    await say(my, [[`「${l.from}」裡的句子：${l.zh}`, 'zh-TW']], `「${l.from}」：${l.zh}`);
    await shadow(my, tally, l.ko, 'ko-KR', '');
    await shadow(my, tally, l.en, 'en-US', '');
  }
  setStep(2);
  store.get().course.reviewed += tally.good;
  const xp = 10 + tally.good * 4;
  const res = store.addProgress(xp, 'drill', { title: '語音特訓', good: tally.good, tries: tally.tries });
  await say(my, [[`特訓完成！答對 ${tally.good} 次，應援值加 ${xp}！`, 'zh-TW']]);
  await goalCheck(my, res);
}

// ───────── 章末 BOSS 關：主題單字特訓（看卡 → 聽 → 跟念 → 隨機回想） ─────────
async function runBoss(my, lv) {
  const th = THEMES[lv.id];
  const words = lv.words.map((id) => WORDS[id]);
  steps = ['主題介紹', ...words.map((_, i) => `第 ${i + 1} 個字`), '隨機挑戰', '過關'];
  const tally = { good: 0, tries: 0 };
  setStep(0);
  setSceneSrc(['assets/art/bg-stage.webp'], `章末挑戰：${th.title}`);
  await say(my, [[`章末挑戰！今天的主題是「${th.title}」，一共 ${words.length} 個字。`, 'zh-TW'], [th.intro, 'zh-TW']], `【章末挑戰】${th.title}\n${th.intro}`);
  for (const [i, w] of words.entries()) {
    setStep(1 + i);
    setSceneSrc(['assets/art/bg-stage.webp'], `${th.title}：第 ${i + 1}／${words.length} 個字`, w);
    q('#drillWords').querySelectorAll('.tword').forEach((el, k) => el.classList.toggle('on', k === i));
    await say(my, [[w.zh, 'zh-TW'], [w.ko, 'ko-KR'], [w.en, 'en-US']], `${w.zh}\n韓　${w.ko}（${w.kr}）\n英　${w.en}${w.note ? `\n小撇步：${w.note}` : ''}`);
    await practice(my, tally, w.ko, 'ko-KR', '跟我念：', `跟我念：${w.ko}（${w.kr}）`, 0.6);
  }
  setStep(words.length + 1);
  await say(my, [['隨機挑戰！我說中文，你說韓文或英文。', 'zh-TW']], '隨機挑戰：老師說中文，你說韓文或英文');
  for (const [i, w] of shuffle(words).slice(0, 5).entries()) {
    setSceneSrc(['assets/art/bg-stage.webp'], `隨機挑戰 ${i + 1}／5`);
    await recall(my, tally, w, i % 2 ? 'en-US' : 'ko-KR');
  }
  setStep(words.length + 2);
  const res = completeBoss(lv, tally, words);
  await say(my, [[`過關了！拿到 ${res.stars} 顆星，應援值加 ${res.xp}！`, 'zh-TW']],
    `章末挑戰「${th.title}」過關！\n${'★'.repeat(res.stars)}${'☆'.repeat(3 - res.stars)}　應援值 +${res.xp}${res.earned.length ? `\n新勳章：${res.earned.map((b) => b.name).join('、')}` : ''}`);
  await goalCheck(my, res);
}
function completeBoss(lv, tally, words) {
  const s = store.get();
  const c = s.course;
  const rate = tally.tries ? tally.good / tally.tries : 0;
  const stars = rate >= 0.85 ? 3 : rate >= 0.55 ? 2 : 1;
  c.cleared[lv.id] = Math.max(c.cleared[lv.id] || 0, stars);
  for (const w of words) if (!c.learned[w.id]) c.learned[w.id] = { lvl: 0, due: dayStr(1) };
  c.spoken += tally.good;
  const xp = 40 + tally.good * 4;
  const earned = BADGES.filter((b) => !s.badges.includes(b.id) && b.check(s));
  s.badges.push(...earned.map((b) => b.id));
  const p = store.addProgress(xp, 'lesson', { title: `章末挑戰・${THEMES[lv.id].title}`, good: tally.good, tries: tally.tries, stars });
  return { stars, xp, earned, ...p };
}

export function renderTalk($app, arg = '') {
  stopTalk();
  const bossLv = /^b\d+$/.test(arg) ? LEVELS.find((l) => l.id === arg && l.boss && l.theme) : null;
  const mode = bossLv ? 'boss' : arg === 'drill' ? 'drill' : /-replay$/.test(arg) ? 'replay' : 'lesson';
  const pickDay = parseInt(arg, 10);
  const days = DAYS();
  const { lv, n } = bossLv ? { lv: { ...bossLv, bg: 'stage' }, n: bossLv.ch } : pickDay >= 1 && pickDay <= days.length ? { lv: days[pickDay - 1], n: pickDay } : todayLesson();
  const st = STORIES[lv.id] || { kind: '章末挑戰', title: lv.theme || lv.title };
  const words = lv.words.map((id) => WORDS[id]);
  const title = mode === 'drill' ? '語音特訓' : mode === 'boss' ? `章末挑戰：${lv.theme}` : lv.title;
  const sub = mode === 'drill' ? '舊字隨機抽考' : mode === 'boss' ? `第 ${n} 章・主題單字特訓（${words.length} 個字）` : `第 ${n} 天・${mode === 'replay' ? '回放' : st.kind}`;
  $app.innerHTML = `
    <section class="talk">
      <div class="talk-bg" aria-hidden="true" style="background-image:url(assets/art/bg-${mode === 'drill' ? 'practice' : lv.bg}.webp),url(assets/art/bg-practice.webp)"></div>
      <header class="talk-top">
        <a class="back-btn" href="#/home">‹ 回大廳</a>
        <div class="talk-title"><small>${esc(sub)}</small><b>${esc(title)}</b></div>
        <button class="pill-btn speed-btn" id="speedBtn" type="button"></button>
        <div class="steps" id="tSteps"></div>
      </header>
      <div class="talk-main">
        <aside class="talk-hero"><img src="assets/art/teacher-cut.webp" alt="敏雅老師" width="616" height="1505"><div class="plate">민아 쌤<small>敏雅老師</small></div></aside>
        <section class="talk-board" aria-label="敏雅老師的留言板">
          <figure class="scene-card" id="sceneCard" data-bg="${lv.bg}"><img alt="情境畫面" src="${mode === 'drill' ? 'assets/art/bg-practice.webp' : mode === 'boss' ? 'assets/art/bg-stage.webp' : `assets/art/story-${lv.id}.webp`}" onerror="this.onerror=null;this.src='assets/art/bg-practice.webp'"><figcaption>${mode === 'drill' ? '語音特訓' : mode === 'boss' ? `章末挑戰：${esc(lv.theme)}` : `短劇：${esc(st.title)}`}</figcaption></figure>
          <div class="ribbon">敏雅老師的留言板</div>
          <div class="tlog" id="tLog" aria-live="polite"></div>
          <p class="talk-note" id="talkNote" hidden></p>
          <div class="talk-controls">
            <button class="orb" id="orb" type="button" data-state="idle" aria-label="開始用說的上課">${ic('mic', 'orb-ic')}</button>
            <div class="orb-text"><b id="orbLabel">按麥克風，開始${mode === 'drill' ? '特訓' : mode === 'replay' ? '回放' : mode === 'boss' ? '挑戰' : '上課'}</b><small id="orbHint"></small></div>
            <button class="pill-btn" id="againBtn" type="button" hidden>${ic('speaker')} 再聽一次</button>
            <button class="pill-btn" id="skipBtn" type="button" hidden>跳過</button>
            <button class="pill-btn" id="stopTalkBtn" type="button" hidden>停止</button>
          </div>
          <div class="done-bar" id="doneBar" hidden><a class="pill-btn strong" href="#/home">回大廳</a><a class="pill-btn" href="#/map">章節地圖</a><a class="pill-btn" href="#/talk/drill">語音特訓</a></div>
        </section>
        <aside class="talk-words" id="drillWords">
          ${mode === 'lesson' ? `<div class="tprize"><small>${ic('gift')} 今天上完可以拿到</small>${rewardHTML(rewardForDay(n))}</div>` : ''}
          ${mode === 'drill' ? '' : words.map((w) => `<div class="tword${mode === 'boss' ? ' mini' : ''}"><span class="tw-emoji">${wic(w)}</span><div><b>${esc(w.zh)}</b><div class="tw-ko">${esc(w.ko)}</div><small>${esc(w.en)}</small></div></div>`).join('')}
          ${(mode === 'lesson' || mode === 'replay') && lv.extra?.length ? `<div class="tx-head">${ic('star')} 延伸字</div>${lv.extra.map((id) => WORDS[id]).map((w) => `<div class="tword mini ext" data-x="${w.id}"><span class="tw-emoji">${wic(w)}</span><div><b>${esc(w.zh)}</b><small>${esc(w.en)}・${esc(w.ko)}</small></div></div>`).join('')}` : ''}
        </aside>
      </div>
    </section>`;
  $root = $app;
  q('#tSteps').innerHTML = '<div class="tprog"><i style="width:0%"></i></div><span class="tnow">準備開始</span>';
  const paintSpeed = () => { q('#speedBtn').textContent = slow() ? '慢速 ✓' : '正常速度'; };
  paintSpeed();
  q('#speedBtn').onclick = () => { store.get().settings.slow = !slow(); store.save(); paintSpeed(); };
  if (!Rec) {
    const note = q('#talkNote');
    note.hidden = false;
    note.textContent = '這個瀏覽器不能用麥克風聽你說話。請用 Microsoft Edge 打開這個 App（網址 http://localhost:5173），就能用說的上課。';
  }
  q('#orb').onclick = async () => {
    const state = q('#orb').dataset.state;
    if (orbAction()) return; // 老師說話中→打斷換你說；麥克風沒開成功→只重開麥克風
    if (state !== 'idle' || !Rec) return;
    stopTalk();
    const my = session;
    q('#tLog').replaceChildren();
    q('#doneBar').hidden = true;
    try {
      if (mode === 'drill') await runDrill(my);
      else if (mode === 'boss') await runBoss(my, lv);
      else if (mode === 'replay') await runReplay(my, lv, n);
      else await runLesson(my, lv, n);
      setStep(steps.length);
      setOrb('idle', '完成了！');
      q('#doneBar').hidden = false;
    } catch (err) {
      if (err instanceof Stop) return;
      setOrb('idle', '按一下大麥克風，重新開始');
      console.error(err);
    }
  };
  q('#skipBtn').onclick = () => skipNow?.();
  q('#againBtn').onclick = () => againNow?.();
  q('#stopTalkBtn').onclick = () => { stopTalk(); setOrb('idle', '按一下大麥克風，重新開始'); };
}
