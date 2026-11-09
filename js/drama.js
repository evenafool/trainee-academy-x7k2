// 短劇劇場（遊戲式 AVG）：大畫面分鏡＋左右角色立繪＋底部對話框
//  看劇模式 openDrama()：一句一句演出、配音；台詞裡出現新單字會發光，點一下就「收集」進單字口袋
//  上台模式 openStage()：對話練習搬到同一個舞台上，輪到孩子時對話框出現麥克風，敏雅老師在角落當導演
// 圖片：分鏡 drama/<day>-<格> → 劇照 story-<day> → 場景 bg-<場景> → 練習室（一路往下找，缺圖也不會破）
import { STORIES, WORDS } from './course.js';
import * as store from './store.js';
import { esc, speakAsync, stopSpeaking, ttsOK, sleep, wic } from './util.js';
import { sfx, duck } from './sound.js';

export const NAMES = { me: '你', mina: '敏雅', leo: 'Leo', nova: '露娜', kong: '孔老師', seoyun: '徐允', coach: '姜教練' };
const langOf = (t) => (/[가-힯]/.test(t) ? 'ko-KR' : /^[A-Za-z]/.test(t) ? 'en-US' : 'zh-TW');
function rate(lang) {
  if (lang === 'zh-TW') return undefined;
  const slow = store.get().settings?.slow !== false;
  return lang === 'ko-KR' ? (slow ? 0.7 : 0.85) : (slow ? 0.8 : 0.95);
}
// 一般集數沒有分鏡圖：同一張劇照每格換一點點鏡頭
const SHOTS = [{ pos: '35% 40%', zoom: 1.18 }, { pos: '65% 40%', zoom: 1.18 }, { pos: '50% 40%', zoom: 1.02 }];

let token = 0;
// 主角立繪跟著章節換裝：粉絲（1～4 章）→ 練習生（5～10）→ 出道（11～15）→ 頒獎典禮（16～）
let meCh = 1;
const spriteOf = (c) => (c !== 'me' ? `sprite-${c}` : meCh <= 4 ? 'sprite-me' : meCh <= 10 ? 'me-trainee' : meCh <= 15 ? 'me-debut' : 'me-award');
export function closeDrama() {
  token++;
  stopSpeaking();
  document.querySelector('.drama')?.remove();
}

// 依序嘗試多張圖，第一張載得到的就用；用到「代替圖」時加鏡頭推移
function loadChain(img, srcs, onReal, shot) {
  let k = 0;
  const tryNext = () => {
    if (k >= srcs.length) return;
    const isFirst = k === 0;
    img.src = srcs[k++];
    img.onload = () => { if (isFirst) onReal?.(); else if (shot) { img.classList.add('shot'); img.style.setProperty('--pos', shot.pos); img.style.setProperty('--zoom', shot.zoom); } };
    img.onerror = tryNext;
  };
  tryNext();
}
export const panelSrcs = (lv, i, bg) => [`assets/art/drama/${lv.id}-${i + 1}.webp`, `assets/art/story-${lv.id}.webp`, `assets/art/bg-${bg === 'burst' ? lv.bg : bg}.webp`, 'assets/art/bg-practice.webp'];

// 台詞裡的新單字加上發光標記
function lineHTML(text, hl, w, ext = []) {
  const marks = [];
  if (hl && text.includes(hl)) marks.push({ i: text.indexOf(hl), t: hl, main: true });
  for (const e of ext) {
    const i = e ? text.indexOf(e) : -1;
    if (i >= 0 && !marks.some((m) => i < m.i + m.t.length && m.i < i + e.length)) marks.push({ i, t: e });
  }
  if (!marks.length) return esc(text);
  marks.sort((a, b) => a.i - b.i);
  let out = '';
  let at = 0;
  for (const m of marks) {
    out += esc(text.slice(at, m.i));
    const attrs = m.main && w ? ` data-w="${esc(w)}" role="button" tabindex="0" title="點我收集"` : '';
    out += m.main ? `<span class="hlw"${attrs}>${esc(m.t)}</span>` : `<span class="hlx" title="延伸字">${esc(m.t)}</span>`;
    at = m.i + m.t.length;
  }
  return out + esc(text.slice(at));
}

// ───────── 收集特效：星星愛心爆開、單字飛進口袋、口袋彈跳＋1 ─────────
const FX_CHARS = ['★', '♥', '✦', '♪', '★', '♥'];
const FX_COLORS = ['#f0b429', '#e0a3a9', '#c97b84', '#fff3c4', '#b08968', '#ffd1dc'];
function burst(x, y, n = 16, big = false) {
  for (let k = 0; k < n; k++) {
    const p = document.createElement('span');
    p.className = 'fx-particle';
    p.textContent = FX_CHARS[k % FX_CHARS.length];
    const ang = (Math.PI * 2 * k) / n + Math.random() * 0.4;
    const dist = (big ? 120 : 70) + Math.random() * (big ? 90 : 50);
    p.style.cssText = `left:${x}px;top:${y}px;color:${FX_COLORS[k % FX_COLORS.length]};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist}px;--s:${0.8 + Math.random() * (big ? 1.2 : 0.8)}`;
    document.body.append(p);
    setTimeout(() => p.remove(), 900);
  }
}
function flyTo(srcEl, dstEl, html) {
  const a = srcEl.getBoundingClientRect();
  const b = dstEl.getBoundingClientRect();
  const f = document.createElement('span');
  f.className = 'fx-fly';
  f.innerHTML = html;
  f.style.cssText = `left:${a.left + a.width / 2 - 40}px;top:${a.top + a.height / 2 - 40}px`;
  document.body.append(f);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.45) rotate(360deg)`;
    f.style.opacity = '.9';
  }));
  return new Promise((res) => setTimeout(() => { f.remove(); res(); }, 680));
}

// ───────── 共用舞台骨架 ─────────
function buildStage({ title, sub, dots = 0, pouch = [] }) {
  closeDrama();
  const box = document.createElement('section');
  box.className = 'drama';
  box.setAttribute('aria-label', '短劇劇場');
  box.innerHTML = `
    <div class="vn-stage">
      <div class="vn-cg" id="vnCg"></div>
      <div class="vn-sprites"><div class="vn-sp left" id="spL"></div><div class="vn-sp right" id="spR"></div></div>
      <div class="vn-top">
        <div class="dt-title"><small>${esc(sub)}</small><b>${esc(title)}</b></div>
        ${pouch.length ? `<div class="vn-pouch" id="vnPouch" title="單字口袋"><span class="pouch-label" id="pouchLabel">收集 0/${pouch.length}</span>${pouch.map((w) => `<span class="pw" data-w="${w.id}">${wic(w)}</span>`).join('')}</div>` : ''}
        ${dots ? `<div class="vn-dots">${Array.from({ length: dots }, (_, i) => `<i data-i="${i}"></i>`).join('')}</div>` : ''}
        <span class="vn-tools" id="vnTools"></span>
        <button class="vn-btn" id="dClose" type="button" aria-label="關閉">✕</button>
      </div>
      <div class="vn-coach" id="vnCoach" hidden><img src="assets/art/teacher-face.webp" alt=""><p></p></div>
      <div class="vn-catch" id="vnCatch" hidden></div>
      <div class="vn-box" id="vnBox">
        <span class="vn-name" id="vnName"></span>
        <p class="vn-line" id="vnLine"></p>
        <p class="vn-sub" id="vnSub"></p>
        <p class="vn-heard" id="vnHeard" hidden></p>
        <div class="vn-ctrl" id="vnCtrl"></div>
      </div>
      <div class="vn-end" id="vnEnd" hidden><div class="vn-endcard" id="vnEndCard"></div></div>
    </div>`;
  document.body.append(box);
  const $ = (s) => box.querySelector(s);
  let shownKey = '';

  const api = {
    box, $,
    // 換大畫面（key 一樣就不換）
    setImage(key, srcs, { burst = false, shot = null } = {}) {
      if (key === shownKey) return;
      shownKey = key;
      const img = document.createElement('img');
      img.alt = '';
      const cg = $('#vnCg');
      cg.classList.toggle('burst', burst);
      box.classList.remove('cg');
      loadChain(img, srcs, () => box.classList.add('cg'), shot);
      cg.append(img);
      requestAnimationFrame(() => img.classList.add('in'));
      [...cg.querySelectorAll('img')].slice(0, -1).forEach((old) => { old.classList.remove('in'); setTimeout(() => old.remove(), 700); });
      sfx('tap');
    },
    setSprites(left, right) {
      for (const [el, c] of [[$('#spL'), left], [$('#spR'), right]]) {
        if (!c || !NAMES[c]) { el.innerHTML = ''; el.dataset.who = ''; continue; }
        if (el.dataset.who === c) continue;
        el.dataset.who = c;
        el.innerHTML = `<img src="assets/art/${spriteOf(c)}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-${c}.webp'"><span class="vn-tag">${esc(NAMES[c])}</span>`;
      }
    },
    focus(who) {
      // 直立手機的鏡頭：往講話角色那一側移（左邊的角色→畫面左側，右邊→右側，旁白→中間）
      const side = !who ? 'mid' : $('#spL').dataset.who === who ? 'left' : $('#spR').dataset.who === who ? 'right' : 'mid';
      $('#vnCg').style.setProperty('--px', side === 'left' ? '22%' : side === 'right' ? '78%' : '50%');
      for (const el of [$('#spL'), $('#spR')]) {
        el.classList.toggle('speaking', !!who && el.dataset.who === who);
        el.classList.toggle('dim', !!who && !!el.dataset.who && el.dataset.who !== who);
      }
    },
    // 對話框顯示一句
    show({ name, text, sub = '', hl = '', w = '', ext = [], narr = false, shout = false, think = false, mine = false }) {
      const b = $('#vnBox');
      b.classList.remove('pop');
      void b.offsetWidth;
      b.classList.add('pop');
      b.classList.toggle('narr', narr);
      b.classList.toggle('shout', shout);
      b.classList.toggle('think', think);
      b.classList.toggle('mine', mine);
      $('#vnName').textContent = name;
      const lang = langOf(text);
      $('#vnLine').innerHTML = lineHTML(text, hl, w, ext);
      $('#vnLine').className = `vn-line ${lang === 'ko-KR' ? 'ko' : lang === 'en-US' ? 'en' : ''}`;
      $('#vnSub').innerHTML = esc(sub).replace(/\n/g, '<br>');
      $('#vnHeard').hidden = true;
    },
    coach(text) {
      const c = $('#vnCoach');
      c.querySelector('p').textContent = text;
      c.hidden = false;
      c.classList.remove('pop');
      void c.offsetWidth;
      c.classList.add('pop');
    },
    heard(text, live = true) {
      const h = $('#vnHeard');
      h.hidden = false;
      h.classList.toggle('live', live);
      h.textContent = text;
    },
    end(html) {
      $('#vnEndCard').innerHTML = html;
      $('#vnEnd').hidden = false;
    },
    close() { closeDrama(); },
  };
  return api;
}

// ───────── 看劇模式：一句一句演出＋收集新單字 ─────────
function stepsOf(st) {
  const out = [];
  st.panels.forEach((p, i) => {
    if (p.cap) out.push({ panel: i, kind: 'cap', text: p.cap });
    p.say.forEach((s) => out.push({ panel: i, kind: 'say', ...s }));
  });
  return out;
}

export function openDrama(lv, n, { endLabel = '開始上課' } = {}) {
  meCh = lv?.ch || 1;
  const my = ++token + 1; // buildStage 會再 +1
  const st = STORIES[lv.id];
  const steps = stepsOf(st);
  const words = (lv.words || []).map((id) => WORDS[id]).filter(Boolean);
  const stage = buildStage({ title: st.title, sub: `第 ${n} 天・短劇`, dots: st.panels.length, pouch: words });
  const { $, box } = stage;
  const mine = token;
  $('#vnTools').innerHTML = '<button class="vn-btn" id="dAuto" type="button">自動 ✓</button>';
  $('#vnCtrl').innerHTML = `<button class="vn-btn" id="dPrev" type="button">‹ 上一句</button>
    <button class="vn-btn" id="dReplay" type="button">再聽一次</button>
    <button class="vn-btn strong" id="dNext" type="button">下一句 ›</button>`;
  const caught = new Set();
  let cur = -1;
  let auto = true;
  let run = 0;
  void my;

  function setPanel(i) {
    const p = st.panels[i];
    stage.setImage(`p${i}`, panelSrcs(lv, i, p.bg), { burst: p.bg === 'burst', shot: SHOTS[i % SHOTS.length] });
    box.querySelectorAll('.vn-dots i').forEach((d, k) => d.classList.toggle('on', k <= i));
    const cast = p.cast.map((c) => c.c).filter((c) => NAMES[c]);
    stage.setSprites(cast[0], cast[1]);
  }

  // 新單字出現：台詞裡的字發光＋旁邊跳出大大的「點我收集」
  let pendingSay = null; // 點到的字：等這句台詞念完再念一次發音
  function offerCatch(id) {
    const w = WORDS[id];
    if (!w || caught.has(id)) return;
    const c = $('#vnCatch');
    c.innerHTML = `<button type="button" class="catch-btn"><span class="catch-ring"></span>${wic(w)}<span><small>✨ 新單字！點我收集</small><b>${esc(w.zh)}</b><em>${esc(w.ko)}・${esc(w.en)}</em></span><img class="catch-hand" src="assets/art/icons/w-this.webp" alt=""></button>`;
    c.hidden = false;
    sfx('ding');
    c.querySelector('button').onclick = (e) => { e.stopPropagation(); catchWord(id, e.currentTarget); };
    const hw = box.querySelector(`.hlw[data-w="${id}"]`);
    if (hw) hw.onclick = (e) => { e.stopPropagation(); catchWord(id, e.currentTarget); };
  }
  // 孩子親手點到：爆出星星愛心 → 單字飛進口袋 → 口袋彈跳＋1 → 念發音
  async function catchWord(id, el) {
    if (caught.has(id)) return;
    const w = WORDS[id];
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
    sfx('right');
    navigator.vibrate?.(30);
    const c = $('#vnCatch');
    const slot = box.querySelector(`.pw[data-w="${id}"]`);
    const src = c.hidden ? el : c.querySelector('.catch-btn') || el;
    c.hidden = true;
    box.querySelectorAll(`.hlw[data-w="${id}"]`).forEach((h) => h.classList.add('caught'));
    caught.add(id);
    if (slot) await flyTo(src, slot, wic(w));
    collect(id, true);
    if (ttsOK) {
      if (speechSynthesis.speaking) pendingSay = w;
      else { await speakAsync(w.ko, 'ko-KR', rate('ko-KR')); await speakAsync(w.en, 'en-US', rate('en-US')); }
    }
  }
  function collect(id, tapped) {
    caught.add(id);
    const slot = box.querySelector(`.pw[data-w="${id}"]`);
    if (!slot || slot.classList.contains('got')) return;
    slot.classList.add('got');
    if (tapped) {
      slot.classList.add('tapped', 'bounce');
      const plus = document.createElement('b');
      plus.className = 'pw-plus';
      plus.textContent = '+1';
      slot.append(plus);
      setTimeout(() => { plus.remove(); slot.classList.remove('bounce'); }, 900);
      const sr = slot.getBoundingClientRect();
      burst(sr.left + sr.width / 2, sr.top + sr.height / 2, 8);
    } else sfx('tap');
    const got = box.querySelectorAll('.pw.got').length;
    const all = box.querySelectorAll('.pw').length;
    const label = $('#pouchLabel');
    if (label) label.textContent = got >= all ? '全部收集！' : `收集 ${got}/${all}`;
    if (tapped && got >= all && box.querySelectorAll('.pw.tapped').length === all) {
      // 三個字都親手抓到：大大的慶祝
      const pr = $('#vnPouch').getBoundingClientRect();
      setTimeout(() => { burst(pr.left + pr.width / 2, pr.top + pr.height, 28, true); sfx('reward'); $('#vnPouch').classList.add('complete'); }, 250);
    }
  }

  async function play(k) {
    const r = ++run;
    stopSpeaking();
    cur = k;
    const s = steps[k];
    setPanel(s.panel);
    $('#dPrev').disabled = k <= 0;
    $('#vnCatch').hidden = true;
    duck(true);
    if (s.kind === 'cap') {
      stage.show({ name: '旁白', text: s.text, narr: true });
      stage.focus(null);
      if (ttsOK && s.text) await speakAsync(s.text, 'zh-TW'); else await sleep(1200);
    } else {
      stage.show({ name: NAMES[s.c] || s.c, text: s.t, sub: s.sub && s.sub !== s.t ? s.sub : '', hl: s.hl, w: s.w && !caught.has(s.w) ? s.w : '', shout: s.shout, think: s.think });
      stage.focus(s.c);
      if (s.w) offerCatch(s.w);
      if (s.shout) sfx('stamp');
      const lang = langOf(s.t);
      if (ttsOK) {
        await speakAsync(s.t, lang, rate(lang));
        if (r !== run || mine !== token) return;
        if (lang !== 'zh-TW' && s.sub) { await sleep(300); await speakAsync(s.sub, 'zh-TW'); }
      } else await sleep(2000);
      if (pendingSay && r === run) { const pw = pendingSay; pendingSay = null; await sleep(200); await speakAsync(pw.ko, 'ko-KR', rate('ko-KR')); await speakAsync(pw.en, 'en-US', rate('en-US')); }
      if (s.w && !caught.has(s.w)) await sleep(2200); // 還沒點到：多等一下，給孩子時間點單字
    }
    duck(false);
    if (r !== run || mine !== token) return;
    if (auto) { await sleep(800); if (r === run && mine === token) next(); }
  }
  function next() {
    const s = steps[cur];
    if (s?.w && !caught.has(s.w)) collect(s.w, false); // 沒點到也幫忙收進口袋
    if (cur < steps.length - 1) play(cur + 1);
    else finish();
  }
  async function finish() {
    run++;
    stopSpeaking();
    for (const w of words) collect(w.id, false);
    const tapped = box.querySelectorAll('.pw.tapped').length;
    stage.end(`<span>短劇完</span><b>${esc(st.title)}</b>
      <div class="end-words">${words.map((w) => `<span class="${box.querySelector(`.pw.tapped[data-w="${w.id}"]`) ? 'tapped' : ''}">${wic(w)}<b>${esc(w.zh)}</b><small>${esc(w.ko)}</small></span>`).join('')}</div>
      <p class="end-tip">${tapped === words.length ? '★ 三個新字全部親手抓到了！' : `親手抓到 ${tapped}／${words.length} 個新字，其他的幫你收進口袋了`}</p>
      ${st.fact ? `<p><b>小知識</b>${esc(st.fact)}</p>` : ''}
      <div class="vn-ctrl"><button class="vn-btn" id="dAgain" type="button">從頭再看</button><button class="vn-btn strong" id="dEnd" type="button">${esc(endLabel)}</button></div>`);
    sfx('reward');
    $('#dAgain').onclick = () => { $('#vnEnd').hidden = true; play(0); };
    $('#dEnd').onclick = () => resolver?.({ caught: [...caught], tapped });
    if (st.fact && ttsOK) await speakAsync(`小知識：${st.fact}`, 'zh-TW');
  }

  let resolver = null;
  return new Promise((resolve) => {
    resolver = (v) => { closeDrama(); resolve(v); };
    $('#dClose').onclick = () => resolver({ caught: [...caught], tapped: box.querySelectorAll('.pw.tapped').length, closed: true });
    $('#dNext').onclick = next;
    $('#dPrev').onclick = () => { if (cur > 0) play(cur - 1); };
    $('#dReplay').onclick = () => play(Math.max(cur, 0));
    $('#dAuto').onclick = (e) => { auto = !auto; e.target.textContent = auto ? '自動 ✓' : '自動'; if (auto) next(); };
    $('#vnCg').onclick = next; // 點畫面也能前進
    box.querySelectorAll('.vn-dots i').forEach((d) => { d.onclick = () => play(steps.findIndex((s) => s.panel === +d.dataset.i)); });
    setTimeout(() => play(0), 500);
  });
}

// ───────── 上台模式：對話練習在舞台上演出（由語音教室驅動） ─────────
export function openStage(lv, n, { title = '上台演出', partner } = {}) {
  meCh = lv?.ch || 1;
  const stage = buildStage({ title: `${title}：${lv.title}`, sub: `第 ${n} 天・情境對話` });
  const { $ } = stage;
  stage.setImage('talk', [`assets/art/talk-${lv.id}.webp`, `assets/art/bg-${lv.bg}.webp`, `assets/art/story-${lv.id}.webp`, 'assets/art/bg-practice.webp']);
  stage.setSprites(partner || lv.with, 'me');
  $('#vnCtrl').innerHTML = `<button class="vn-mic" id="vnMic" type="button" aria-label="麥克風"></button><span class="vn-miclabel" id="vnMicLabel"></span>
    <button class="vn-btn" id="vnAgain" type="button" hidden>再聽一次</button><button class="vn-btn" id="vnSkip" type="button" hidden>跳過</button>`;
  stage.mic = (state, label, { again = false } = {}) => {
    const m = $('#vnMic');
    m.dataset.state = state;
    m.innerHTML = `<img class="ic" src="assets/art/icons/ui-${state === 'speaking' ? 'speaker' : 'mic'}.webp" alt="">`;
    $('#vnMicLabel').textContent = label || '';
    $('#vnAgain').hidden = !(state === 'listening' && again);
    $('#vnSkip').hidden = state !== 'listening';
  };
  stage.onMic = (fn) => { $('#vnMic').onclick = fn; };
  stage.onAgain = (fn) => { $('#vnAgain').onclick = fn; };
  stage.onSkip = (fn) => { $('#vnSkip').onclick = fn; };
  stage.onClose = (fn) => { $('#dClose').onclick = fn; };
  // 演出結束：掌聲＋星星
  stage.applause = (stars, msg) => new Promise((resolve) => {
    sfx('reward');
    stage.end(`<span>演出完成</span><b class="end-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b><p class="end-tip">${esc(msg)}</p>
      <div class="vn-ctrl"><button class="vn-btn strong" id="dEnd" type="button">回到教室</button></div>`);
    $('#vnCg').classList.add('applause');
    $('#dEnd').onclick = () => { stage.close(); resolve(); };
  });
  return stage;
}
