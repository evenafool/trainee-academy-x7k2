// 共用小工具：文字處理、語音朗讀、語音辨識（跟讀）、提示訊息
// 介面小圖示（GPT Image 圖示表裁切，取代 emoji）
export const ic = (name, cls = '') => `<img class="ic ${cls}" src="assets/art/icons/ui-${name}.webp" alt="" aria-hidden="true">`;
export const wic = (w, cls = '') => `<img class="wic ${cls}" src="assets/art/icons/w-${w.id}.webp" alt="" aria-hidden="true" onerror="this.onerror=null;this.src='assets/art/icons/ui-star.webp'">`;
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const sample = (a, n) => shuffle(a).slice(0, n);
export const uniq = (a) => [...new Set(a)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function dayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ───────── 語音朗讀（Web Speech API） ─────────
export const ttsOK = 'speechSynthesis' in window;
export const VOICE_PICKS = { 'zh-TW': /HsiaoChen/i, 'ko-KR': /SunHi/i, 'en-US': /Michelle/i };
export function voiceFor(lang) {
  if (!ttsOK) return null;
  // 優先用自然語音（Edge 的 Natural／Online、Chrome 的 Google 語音），比 Windows 舊式語音像真人
  const vs = speechSynthesis.getVoices();
  const nat = (v) => /Natural|Online|Neural|Google/i.test(v.name);
  const same = vs.filter((v) => v.lang.replace('_', '-') === lang);
  const near = vs.filter((v) => v.lang.startsWith(lang.slice(0, 2)));
  // 指定的老師聲音組合：中文曉臻、韓文선희、英文 Michelle（Edge 的自然語音）
  const fav = VOICE_PICKS[lang];
  return (fav && vs.find((v) => fav.test(v.name))) || same.find(nat) || near.find(nat) || same[0] || near[0] || null;
}
function utter(text, lang, rate) {
  const u = new SpeechSynthesisUtterance(String(text).replace(/\p{Extended_Pictographic}/gu, ''));
  u.lang = lang;
  const v = voiceFor(lang);
  if (v) u.voice = v;
  // 自然語音本身有表情，用原本速度；Windows 舊式語音才加快、調高音調
  const nat = v && /Natural|Online|Neural|Google/i.test(v.name);
  u.rate = rate ?? (nat ? 1.05 : lang === 'ko-KR' ? 1 : lang === 'en-US' ? 1.05 : 1.15);
  u.pitch = nat ? 1.05 : 1.25;
  return u;
}
// 中文句子裡夾的韓文（例如小撇步「몰라요」）要換成韓文聲音念，不然中文聲音會直接跳過
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;
const KO_RUN = /([ᄀ-ᇿ㄰-㆏가-힯][ᄀ-ᇿ㄰-㆏가-힯\s!?.~,…]*)/;
export function splitKo(text, lang) {
  const s = String(text ?? '');
  if (lang === 'ko-KR' && /[一-鿿]/.test(s)) lang = 'zh-TW'; // 標成韓文但夾中文：中文部分用中文聲音
  if (lang === 'ko-KR' || !HANGUL.test(s)) return [[s, lang]];
  return s.split(KO_RUN).filter((p) => /[\p{L}\p{N}]/u.test(p)).map((p) => (HANGUL.test(p) ? [p, 'ko-KR'] : [p, lang]));
}
const koRate = (lang, rate) => (lang === 'ko-KR' && rate == null ? 0.8 : rate);
export function speak(text, lang, rate) {
  if (!ttsOK || !text) return;
  speechSynthesis.cancel();
  for (const [p, l] of splitKo(text, lang)) speechSynthesis.speak(utter(p, l, l === lang ? rate : koRate(l)));
}
// 念完才 resolve；沒有語音時依字數估算時間
export async function speakAsync(text, lang, rate) {
  const parts = splitKo(text, lang);
  if (parts.length > 1) {
    for (const [p, l] of parts) await speakOne(p, l, l === lang ? rate : koRate(l));
    return;
  }
  return speakOne(text, lang, rate);
}
function speakOne(text, lang, rate) {
  return new Promise((resolve) => {
    const fallback = setTimeout(resolve, (900 + String(text).length * 160) / Math.min(rate || 1, 1));
    if (!ttsOK || !voiceFor(lang)) return;
    speechSynthesis.cancel();
    const u = utter(text, lang, rate);
    u.onend = u.onerror = () => { clearTimeout(fallback); resolve(); };
    speechSynthesis.speak(u);
  });
}
// 「換你說」的提示音：叮一聲，提醒孩子現在可以開口
let actx = null;
export function chime() {
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(880, actx.currentTime); o.frequency.setValueAtTime(1320, actx.currentTime + 0.09);
    g.gain.setValueAtTime(0.0001, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.28);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.3);
  } catch (e) { /* 沒有音效也沒關係 */ }
}
export const stopSpeaking = () => ttsOK && speechSynthesis.cancel();
if (ttsOK) speechSynthesis.getVoices();

// ───────── 跟讀（語音辨識） ─────────
const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
export const sttOK = !!Rec;
const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
// 小遊戲、閃卡用的收音（跟上課的收音一樣穩）：
// 先停掉老師的聲音、等一下再開麥克風；連續收音直到說完停頓 1 秒；
// 沒聽到聲音會自動重開，最多聽 maxMs；不管怎樣一定會結束（不會卡住）
export function listenOnce(lang, { maxMs = 9000, onInterim } = {}) {
  return new Promise((resolve, reject) => {
    if (!Rec) return reject(new Error('unsupported'));
    stopSpeaking();
    let done = false;
    let alts = [];
    let interim = '';
    let quiet = null;
    let r = null;
    const started = Date.now();
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(quiet);
      clearTimeout(hard);
      try { r?.abort(); } catch (e) { /* 已經停了 */ }
      resolve(alts.length ? alts : interim ? [interim] : []);
    };
    const hard = setTimeout(finish, maxMs + 1500); // 保險：時間到一定結束
    const start = () => {
      if (done) return;
      r = new Rec();
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
        onInterim?.(alts[0] || interim);
        clearTimeout(quiet);
        quiet = setTimeout(finish, alts.length ? 1000 : 1800);
      };
      r.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted' || e.error === 'network') return;
        done = true;
        clearTimeout(hard);
        reject(new Error(e.error));
      };
      r.onend = () => {
        if (done) return;
        if (!alts.length && !interim && Date.now() - started < maxMs) { setTimeout(start, 150); return; } // 沒聽到就再聽
        finish();
      };
      try { r.start(); } catch (err) { setTimeout(start, 300); }
    };
    setTimeout(start, 250);
  });
}
// 相似度（最長共同子序列），容許發音有一點點不準
function simRatio(a, b) {
  if (!a || !b) return 0;
  const m = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = a[i - 1] === b[j - 1] ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1]);
  return (2 * m[a.length][b.length]) / (a.length + b.length);
}
// 跟讀判定：任一辨識結果包含目標（忽略空白標點），或目標包含辨識結果且夠長
export function speechMatches(alts, target) {
  const t = norm(target);
  return alts.some((a) => { const n = norm(a); return n && (n.includes(t) || (t.includes(n) && n.length >= Math.ceil(t.length * 0.6)) || simRatio(n, t) >= 0.7); });
}

export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

export function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  box.innerHTML = Array.from({ length: 40 }, (_, i) => `<i style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 0.6}s;background:hsl(${(i * 47) % 360} 90% 60%)"></i>`).join('');
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}
