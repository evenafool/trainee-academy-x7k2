// 共用小工具：文字處理、語音朗讀、語音辨識（跟讀）、提示訊息
// 介面小圖示（GPT Image 圖示表裁切，取代 emoji）
export const ic = (name, cls = '') => `<img class="ic ${cls}" src="assets/art/icons/ui-${name}.webp" alt="" aria-hidden="true">`;
export const wic = (w, cls = '') => `<img class="wic ${cls}" src="assets/art/icons/w-${w.id}.webp" alt="" aria-hidden="true" onerror="this.outerHTML='<span class=&quot;wic wic-fb ${cls}&quot;>${w.emoji || '⭐'}</span>'">`;
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
export function listenOnce(lang) {
  return new Promise((resolve, reject) => {
    if (!Rec) return reject(new Error('unsupported'));
    const r = new Rec();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.onresult = (e) => resolve([...e.results[0]].map((a) => a.transcript));
    r.onerror = (e) => reject(new Error(e.error));
    r.onnomatch = () => resolve([]);
    r.start();
  });
}
// 跟讀判定：任一辨識結果包含目標（忽略空白標點），或目標包含辨識結果且夠長
export function speechMatches(alts, target) {
  const t = norm(target);
  return alts.some((a) => { const n = norm(a); return n && (n.includes(t) || (t.includes(n) && n.length >= Math.ceil(t.length * 0.6))); });
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
