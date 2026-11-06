// 輕柔配樂＋音效：全部用 Web Audio 即時合成，不用下載音樂檔
// 配樂：慢速和弦襯底＋音樂盒琶音，老師說話時自動變小聲
// 音效：ding（換你說）、right（答對）、soft（再試一次，不刺耳）、stamp（蓋章）、reward（拿獎勵）、tap（按鈕）
import * as store from './store.js';

let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let musicTimer = null;
let step = 0;
const MUSIC_VOL = 0.055;

const cfg = () => store.get().settings || {};
const musicOn = () => cfg().music !== false;
const sfxOn = () => cfg().sfx !== false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(master);
  musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(lp);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.22; sfxBus.connect(master);
  return ctx;
}

const hz = (m) => 440 * 2 ** ((m - 69) / 12);
function tone(bus, midi, t, dur, { type = 'sine', vol = 0.3, attack = 0.01, release = 0.25 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + release + 0.05);
}

// ───────── 配樂 ─────────
// Cmaj7 → Am7 → Fmaj7 → G6，每個和弦 4 拍，BPM 72
const CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
const BEAT = 60 / 72;
function tick() {
  if (!ctx || !musicOn()) return;
  const t = ctx.currentTime + 0.05;
  const bar = Math.floor(step / 8) % CHORDS.length;
  const ch = CHORDS[bar];
  if (step % 8 === 0) for (const m of ch) tone(musicBus, m, t, BEAT * 3.6, { type: 'triangle', vol: 0.09, attack: 0.8, release: 1.2 }); // 和弦襯底
  if (step % 2 === 0 || Math.random() < 0.35) tone(musicBus, ch[ARP[step % 8]] + 12, t, BEAT * 0.4, { vol: 0.12, attack: 0.005, release: 0.9 }); // 音樂盒
  step++;
}
export function startMusic() {
  if (!musicOn() || !ensure()) return;
  ctx.resume?.();
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, 1.2);
  if (!musicTimer) musicTimer = setInterval(tick, (BEAT / 2) * 1000);
}
export function stopMusic() {
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  clearInterval(musicTimer);
  musicTimer = null;
}
// 老師說話、孩子說話時，配樂降到很小聲
export function duck(on) {
  if (!ctx || !musicTimer) return;
  musicBus.gain.setTargetAtTime(on ? MUSIC_VOL * 0.25 : MUSIC_VOL, ctx.currentTime, 0.25);
}
export function setMusic(on) {
  store.get().settings.music = on;
  store.save();
  on ? startMusic() : stopMusic();
}
export function setSfx(on) { store.get().settings.sfx = on; store.save(); }

// ───────── 音效 ─────────
export function sfx(name) {
  if (!sfxOn() || !ensure()) return;
  ctx.resume?.();
  const t = ctx.currentTime + 0.01;
  const play = (notes, gap, opts) => notes.forEach((m, i) => tone(sfxBus, m, t + i * gap, 0.12, opts));
  switch (name) {
    case 'ding': play([81, 88], 0.09, { vol: 0.35, release: 0.35 }); break;
    case 'right': play([72, 76, 79, 84], 0.07, { vol: 0.3, release: 0.3 }); break;
    case 'soft': play([67, 64], 0.12, { type: 'triangle', vol: 0.22, release: 0.3 }); break;
    case 'stamp': play([60, 67], 0.05, { type: 'triangle', vol: 0.35, release: 0.2 }); play([84], 0, { vol: 0.2, release: 0.6 }); break;
    case 'reward': play([72, 76, 79, 84, 88, 91], 0.08, { vol: 0.28, release: 0.6 }); break;
    case 'tap': play([84], 0, { vol: 0.12, release: 0.08 }); break;
    default: break;
  }
}

// 瀏覽器規定要先有使用者操作才能出聲：第一次點擊時啟動配樂
let armed = false;
export function armAudio() {
  if (armed) return;
  armed = true;
  const go = () => { startMusic(); window.removeEventListener('pointerdown', go); };
  window.addEventListener('pointerdown', go);
  document.addEventListener('click', (e) => { if (e.target.closest('a,button')) sfx('tap'); }, true);
}
