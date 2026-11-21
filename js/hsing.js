// 40 音舞台：主角站上舞台，跟著節拍邊唱邊學字母
//   每個字母兩小節：①「示範唱」老師的聲音唱「아！아！아이！」 ②「換你唱」伴奏繼續、歌詞一格一格亮，孩子自己唱
//   伴奏全部用 Web Audio 即時合成（大鼓、拍手、沙鈴、貝斯、鐘琴），不用下載音樂檔；歌詞是自己編的唸謠
import * as store from './store.js';
import { esc, ic, speak, stopSpeaking, confetti, reducedMotion } from './util.js';
import { stopMusic, startMusic, sfx } from './sound.js';
import { avatarState, autoOutfit } from './avatar.js';
import { STAGES } from './hangul.js';
import { VOWELS } from './hangul-art.js';

const SPEEDS = { slow: { bpm: 76, rate: 0.6, name: '慢慢唱' }, normal: { bpm: 92, rate: 0.75, name: '正常' } };
// 每一關一組和弦（低音根音），讓四關聽起來不一樣
const KEYS = { v1: [48, 45, 41, 43], c1: [50, 47, 43, 45], c2: [52, 48, 45, 47], v2: [47, 43, 40, 45] };
// 鐘琴旋律（示範小節）：四拍＝「字・字・例・字」
const MELO = [[12, 12, 16, 19], [12, 12, 14, 16], [11, 11, 14, 19], [12, 12, 16, 12]];

let ac = null; let out = null; let noiseBuf = null;
function ensureAC() {
  if (ac) return ac;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ac = new AC();
  out = ac.createGain(); out.gain.value = 0.5; out.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ac;
}
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
function osc(type, midi, t, dur, vol, glideTo) {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(typeof midi === 'number' && midi < 200 ? hz(midi) : midi, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.02);
}
function noise(t, dur, vol, type, freq) {
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + dur + 0.02);
}
const kick = (t) => osc('sine', 150, t, 0.28, 0.9, 45);
const clap = (t) => { noise(t, 0.12, 0.5, 'bandpass', 1600); noise(t + 0.012, 0.1, 0.35, 'bandpass', 2100); };
const hat = (t, v = 0.12) => noise(t, 0.04, v, 'highpass', 7000);
const bass = (t, m, dur) => osc('triangle', m, t, dur, 0.35);
const bell = (t, m) => { osc('sine', m, t, 0.5, 0.18); osc('sine', m + 12, t, 0.25, 0.05); };
const stick = (t, hi) => osc('square', hi ? 88 : 81, t, 0.05, 0.12);

// 唱之前主角先說明：這首歌怎麼學（每關的重點不同）
const TIPS = {
  v1: { head: '母音＝韓文的嘴型', say: '每個母音唱兩次，再唱一個用它開頭的單字。唱的時候注意嘴巴：ㅏ 張大、ㅗ 嘟圓、ㅡ 往兩邊拉平。' },
  c1: { head: '子音要配 ㅏ 才會出聲', say: '子音自己不會出聲，要配上母音 ㅏ 一起唱：ㄱ 就唱成 가。唱兩次，再接一個單字。' },
  c2: { head: '雙子音＝用力的子音', say: '兩個一樣的子音疊在一起，喉嚨要用力、聲音短短的。唱兩次，再接一個單字。' },
  v2: { head: '複合母音＝兩個母音合起來', say: '像 ㅗ 加 ㅏ 就變成 ㅘ。一樣唱兩次，再接一個單字。' },
};

// 有 Suno 原唱的關卡：主玩法改成「跟原唱一起唱」（assets/audio/song-<關>.mp3＋song-<關>.json 時間軸）
// 還沒有歌的關卡維持舊的「示範唱／換你唱」合成伴奏
const SONG_STAGES = new Set(['v1', 'c1', 'c2', 'v2']);
const SONG_BPM = 90;

// ───────── 畫面 ─────────
export function renderSing($app, stageId) {
  const st = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const s = store.get();
  let speed = s.settings?.singSpeed === 'normal' ? 'normal' : 'slow';
  const outfit = avatarState().outfit || autoOutfit();
  const items = st.items.map((it) => ({ ch: it[0], syl: it[3], word: it[4], mean: it[5] }));
  const lyric = (x) => [x.syl, x.syl, x.word];
  const tip = TIPS[st.id] || TIPS.v1;
  const withSong = SONG_STAGES.has(st.id);
  const x0 = st.items[0];
  // 唱前解說：每首歌只有第一次進來會自動打開＋念出來，之後收起來，要看再按右上角「?」
  const firstTime = !s.singIntroSeen?.[st.id];
  if (firstTime) { s.singIntroSeen = { ...(s.singIntroSeen || {}), [st.id]: 1 }; store.save(); }
  const introVoice = withSong
    ? `這首歌這樣學！${tip.head}。${tip.say}像這樣：${x0[3]}、${x0[3]}、${x0[4]}。按開始，跟著原唱一起唱，字卡亮到哪一句就唱哪一句，唱完整首就能拿應援值！`
    : `這首歌這樣學！${tip.head}。${tip.say}像這樣：${x0[3]}、${x0[3]}、${x0[4]}。粉紅色亮的時候先聽我唱，金色亮的時候換你唱！`;
  $app.innerHTML = `
    <section class="hs${withSong ? ' with-song' : ''}" style="--beat:${60 / (withSong ? SONG_BPM : SPEEDS[speed].bpm)}s">
      <div class="hs-bg" aria-hidden="true"><img src="assets/art/bg-stage.webp" alt=""><i class="hs-spot l"></i><i class="hs-spot r"></i></div>
      <header class="hs-top">
        <a class="hs-back" href="#/hangul" aria-label="回 40 音">‹</a>
        <b>${ic('mic')} 40 音舞台</b>
        <button type="button" class="hs-help" id="hsHelp" aria-label="這首歌怎麼學">?</button>
        ${withSong ? '' : `<button type="button" class="hs-speed" id="hsSpeed">${ic('speaker')}<span>${SPEEDS[speed].name}</span></button>`}
      </header>
      <nav class="hs-tabs" aria-label="選一首">
        ${STAGES.map((x, i) => `<a class="${x.id === st.id ? 'on' : ''}" href="#/hangul/sing-${x.id}"><b>${i + 1}</b><span>${esc(x.title.split('：')[1])}</span></a>`).join('')}
      </nav>
      <div class="hs-floor">
        <div class="hs-me" aria-hidden="true"><img class="hs-base" src="assets/art/me-${esc(outfit)}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'"><span class="hs-dance"><i class="hs-spr"></i></span><span class="hs-mic">${ic('mic')}</span></div>
        <div class="hs-notes" id="hsNotes" aria-hidden="true"></div>
        <div class="hs-intro" id="hsIntro" role="dialog" aria-label="這首歌怎麼學"${firstTime ? '' : ' hidden'}>
          <button type="button" class="hs-in-x" id="hsInX" aria-label="收起來">✕</button>
          <small class="hs-in-k">${ic('mic')} 唱之前先聽我說</small>
          <b class="hs-in-h">${esc(tip.head)}</b>
          <div class="hs-in-ex" lang="ko">
            <span class="pk"><b>${esc(items[0].syl)}</b><small>字母的音</small></span>
            <span class="pk"><b>${esc(items[0].syl)}</b><small>再一次</small></span>
            <span class="pk w"><b>${esc(items[0].word)}</b><small>單字・${esc(items[0].mean)}</small></span>
          </div>
          <p>${esc(tip.say)}</p>
          <ol class="hs-in-steps">
            ${withSong ? `<li><i class="pk">${ic('speaker')}</i><span><b>前奏</b>準備好</span></li>
            <li><i class="gd">${ic('mic')}</i><span><b>亮哪句</b>唱哪句</span></li>` : `<li><i class="pk">${ic('speaker')}</i><span><b>粉紅</b>先聽我唱</span></li>
            <li><i class="gd">${ic('mic')}</i><span><b>金色</b>換你唱</span></li>`}
            <li><i class="st">${ic('star')}</i><span><b>唱完</b>拿應援值</span></li>
          </ol>
          <button type="button" class="hs-in-say" id="hsInSay">${ic('speaker')} 再聽一次</button>
        </div>
      </div>
      <div class="hs-card" id="hsCard">
        <span class="hs-who" id="hsWho">準備上台</span>
        <span class="hs-big" id="hsBig" lang="ko">${esc(items[0].ch)}</span>
        <div class="hs-lyric" id="hsLyric" lang="ko"></div>
        <small class="hs-mean" id="hsMean">${withSong ? '按下開始，跟著原唱一起唱！' : '按下開始，跟著節拍一起唱！'}</small>
      </div>
      <ol class="hs-dots" id="hsDots" aria-label="進度">${items.map((x) => `<li class="${VOWELS.has(x.ch) ? 'v' : 'c'}">${esc(x.ch)}</li>`).join('')}</ol>
      <div class="hs-fans" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
      <div class="hs-acts">
        <button type="button" class="hs-go" id="hsGo">${ic('mic')}<b>${withSong ? '跟原唱一起唱' : '開始唱'}</b></button>
      </div>
    </section>`;

  const $ = (q) => $app.querySelector(q);
  const root = $('.hs');
  // 舞步精靈圖：每套裝扮×每關一張橫向 8 格 Q 版連續動作（dance/<裝扮>-<關>.webp），CSS steps() 跟著拍子逐格播放
  // 圖載入成功才切成跳舞模式；還沒畫好的組合維持立繪＋晃動
  const SPR_N = 8;
  const spr = new Image();
  spr.onload = () => {
    if (!document.body.contains(root)) return;
    const el = $('.hs-spr');
    el.style.backgroundImage = `url("${spr.src}")`;
    el.style.aspectRatio = `${spr.naturalWidth / SPR_N} / ${spr.naturalHeight}`;
    el.style.setProperty('--n', SPR_N);
    el.style.setProperty('--spr-h', `${Math.round(spr.naturalHeight / 1.5)}px`); // 最多放大 1.5 倍，保持清楚
    root.classList.add('has-dance');
  };
  spr.src = `assets/art/dance/${outfit}-${st.id}.webp`;
  let playing = false; let timer = 0; let idx = 0; let from = 0; let beat = 0; let nextT = 0; let visT = [];
  const BEATS_PER_ITEM = 8; // 示範 4 拍＋換你 4 拍
  const INTRO = 4;

  const setCard = (i, who) => {
    const x = items[i];
    $('#hsBig').textContent = x.ch;
    $('#hsBig').className = `hs-big ${VOWELS.has(x.ch) ? 'v' : 'c'}`;
    $('#hsLyric').innerHTML = lyric(x).map((w, k) => `<span class="${k === 2 ? 'w' : ''}">${esc(w)}</span>`).join('<i>・</i>');
    $('#hsMean').textContent = `${x.word}＝${x.mean}`;
    $('#hsWho').textContent = who;
    $('#hsWho').className = `hs-who ${who === '換你唱！' ? 'you' : ''}`;
    root.classList.toggle('your-turn', who === '換你唱！');
    $app.querySelectorAll('#hsDots li').forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    const card = $('#hsCard'); card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  };
  const lightChunk = (k) => {
    $app.querySelectorAll('#hsLyric span').forEach((el, j) => el.classList.toggle('hit', j === k || (k === 3 && j === 2)));
  };
  const note = () => {
    if (reducedMotion()) return;
    const n = document.createElement('i');
    n.textContent = Math.random() < 0.5 ? '♪' : '♫';
    n.style.left = `${30 + Math.random() * 40}%`;
    $('#hsNotes').append(n);
    n.addEventListener('animationend', () => n.remove());
  };
  const later = (t, fn) => { const id = setTimeout(fn, Math.max(0, (t - ac.currentTime) * 1000)); visT.push(id); };

  function schedule() {
    const sp = SPEEDS[speed];
    const B = 60 / sp.bpm;
    const key = KEYS[st.id] || KEYS.v1;
    while (nextT < ac.currentTime + 0.15) {
      const t = nextT;
      if (beat < INTRO) {
        // 前奏：敲棒子數拍「1、2、3、4」
        stick(t, beat === 0); hat(t);
        const n = beat;
        later(t, () => { $('#hsWho').textContent = ['3', '2', '1', '唱！'][n]; $('#hsWho').className = 'hs-who count'; });
      } else {
        const b = beat - INTRO;
        const i = from + Math.floor(b / BEATS_PER_ITEM);
        if (i >= items.length) { finish(t); return; }
        const inItem = b % BEATS_PER_ITEM;
        const call = inItem < 4;
        const k = inItem % 4;
        const root4 = key[i % 4];
        // 伴奏
        if (k === 0 || k === 2) kick(t); else clap(t);
        hat(t); hat(t + B / 2, 0.07);
        bass(t, root4 - 12 + (k === 3 ? 7 : 0), B * 0.9);
        if (call) bell(t, root4 + 12 + MELO[i % 4][k]);
        // 畫面＋示範的聲音
        if (inItem === 0) {
          later(t - 0.12, () => speak(lyric(items[i]).join('! ') + '!', 'ko-KR', sp.rate));
          later(t, () => setCard(i, '示範唱'));
        }
        if (inItem === 4) later(t, () => { setCard(i, '換你唱！'); sfx('ding'); });
        later(t, () => { lightChunk(k); if (k === 0) note(); });
      }
      beat++;
      nextT += B;
    }
  }
  function start() {
    if (!ensureAC()) return;
    ac.resume?.();
    stopMusic();
    playing = true;
    root.classList.add('playing');
    $('#hsGo').innerHTML = `${ic('star')}<b>暫停</b>`;
    // 從目前這個字母重新開始（暫停後繼續也一樣）
    from = idx;
    beat = 0; // 每次開始（含暫停後繼續）都先數 3、2、1
    nextT = ac.currentTime + 0.12;
    schedule();
    timer = setInterval(() => {
      schedule();
      const b = beat - INTRO;
      if (b > 0) idx = Math.min(items.length - 1, from + Math.floor((b - 1) / BEATS_PER_ITEM));
    }, 30);
  }
  function stop() {
    playing = false;
    clearInterval(timer);
    visT.forEach(clearTimeout); visT = [];
    stopSpeaking();
    root?.classList.remove('playing', 'your-turn');
    if ($('#hsGo')) $('#hsGo').innerHTML = `${ic('mic')}<b>繼續唱</b>`;
  }
  function finish(t) {
    clearInterval(timer);
    playing = false;
    later(t, reward);
  }
  // 唱完整首：記下聽過的字母、+10 應援值、放彩帶
  function reward() {
    {
      root.classList.remove('playing', 'your-turn', 'song');
      const h = store.get().hangul ??= { heard: {}, passed: {} };
      h.heard ??= {};
      items.forEach((x) => { h.heard[x.ch] = true; });
      h.sung = { ...(h.sung || {}), [st.id]: 1 }; // 40 音首頁「主要任務」的唱完記號
      store.addProgress(10, 'game', { title: `40 音舞台・${st.title}` });
      sfx('reward'); confetti(90);
      $app.querySelectorAll('#hsDots li').forEach((li) => { li.classList.remove('on'); li.classList.add('done'); });
      $('#hsWho').textContent = '安可！'; $('#hsWho').className = 'hs-who count';
      $('#hsBig').textContent = '♪'; $('#hsBig').className = 'hs-big';
      $('#hsLyric').innerHTML = `<span class="hit">${items.length} 個字母唱完了！</span>`;
      $('#hsMean').textContent = '+10 應援值・再唱一次會更熟喔';
      idx = 0;
      $('#hsGo').innerHTML = `${ic('mic')}<b>再唱一次</b>`;
    }
  }
  // 說明框：一進來就打開並念出來；開始唱就收起來，按「?」可以再打開
  const showIntro = (on, talk = on) => {
    $('#hsIntro').hidden = !on;
    if (on && talk) speak(introVoice, 'zh-TW');
    else if (!on && !playing) stopSpeaking();
  };
  $('#hsInX').onclick = () => showIntro(false);
  $('#hsInSay').onclick = () => speak(introVoice, 'zh-TW');
  $('#hsHelp').onclick = () => { if (playing) stop(); songStop(); showIntro($('#hsIntro').hidden); };
  if (firstTime) setTimeout(() => { if (!playing && !$('#hsIntro').hidden && document.body.contains(root)) speak(introVoice, 'zh-TW'); }, 400);
  $('#hsGo').onclick = () => { $('#hsIntro').hidden = true; if (withSong) return songToggle(); return playing ? stop() : start(); };

  // 跟原唱一起唱：Suno 做的整首歌＋時間軸（tools/song-timing.py 產生），主角跟著跳舞，字卡一句一句亮歌詞
  // 下面的字母小圓點：唱到哪個字母就亮哪個；整首唱完才給應援值
  let song = null; let lines = []; let dotLine = [];
  if (withSong) {
    fetch(`assets/audio/song-${st.id}.json`).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j?.length) return;
      lines = j;
      dotLine = items.map((x) => lines.findIndex((l) => l.line.includes(`${x.syl} ${x.syl}`)));
    }).catch(() => {});
  }
  const showLine = () => {
    if (song.ended) return;
    const t = song.currentTime;
    let i = -1;
    for (let k = 0; k < lines.length; k++) if (lines[k].t <= t + 0.15) i = k;
    if (i === showLine.last) return;
    showLine.last = i;
    const cur = lines[i]; const nxt = lines[i + 1];
    $('#hsBig').textContent = cur ? (cur.line.match(/[가-힣]/) || ['♪'])[0] : '♪';
    $('#hsBig').className = 'hs-big';
    $('#hsLyric').innerHTML = cur ? lyricHTML(cur) : '';
    karaoke.n = null;
    $('#hsMean').textContent = nxt ? `▸ ${nxt.line}` : '';
    $('#hsWho').textContent = cur ? '一起唱！' : '前奏'; $('#hsWho').className = `hs-who ${cur ? 'you' : ''}`;
    $app.querySelectorAll('#hsDots li').forEach((li, k) => {
      const at = dotLine[k];
      li.classList.toggle('on', at >= 0 && at === i);
      li.classList.toggle('done', at >= 0 && at < i);
    });
    if (cur) { note(); const card = $('#hsCard'); card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
  };
  // 卡拉 OK 歌詞：每個韓文字一格（唱到就變亮＋上面跳跳球），單字換顏色、中文意思對齊在字正下方
  // song-*.json：ks＝每個字開始唱的秒數；zh 寫成「가방＝書包・나비＝蝴蝶」
  function lyricHTML({ line, zh }) {
    const pairs = (zh || '').split('・').map((x) => x.split('＝')).filter((x) => x.length === 2);
    const open = {}; const close = {};
    pairs.forEach(([ko, mean], k) => {
      const at = line.lastIndexOf(ko);
      if (at >= 0) { open[at] = k; close[at + ko.length - 1] = [k, mean]; }
    });
    let html = ''; let n = 0;
    [...line].forEach((ch, i) => {
      if (open[i] !== undefined) html += `<b class="w w${open[i]}"><span>`;
      html += /[가-힣]/.test(ch) ? `<i class="k" data-k="${n++}">${ch}</i>` : esc(ch);
      if (close[i]) html += `</span><small>${esc(close[i][1])}</small></b>`;
    });
    const plain = !pairs.length && zh;
    return `<span class="hit ${pairs.length ? 'has-w' : ''}"><i class="hs-ball" hidden></i>${html}</span>${plain ? `<small class="hs-zh">${esc(zh)}</small>` : ''}`;
  }
  // 依播放秒數把唱過的字點亮、跳跳球移到正在唱的字上；大字卡也跟著換成那個字
  function karaoke() {
    const cur = lines[showLine.last];
    if (!song || !cur?.ks) return;
    const t = song.currentTime + 0.05;
    const n = cur.ks.filter((x) => x <= t).length;
    if (n === karaoke.n) return;
    karaoke.n = n;
    const ks = $app.querySelectorAll('#hsLyric .k');
    ks.forEach((el, i) => { el.classList.toggle('sung', i < n); el.classList.toggle('now', i === n - 1); });
    const el = ks[Math.max(n - 1, 0)]; const ball = $('#hsLyric .hs-ball');
    if (!el || !ball) return;
    ball.hidden = false;
    ball.style.left = `${el.offsetLeft + el.offsetWidth / 2}px`;
    ball.style.top = `${el.offsetTop - 4}px`;
    ball.classList.toggle('wait', n === 0);
    if (n > 0) {
      ball.classList.remove('hop'); void ball.offsetWidth; ball.classList.add('hop');
      $('#hsBig').textContent = el.textContent;
    }
  }
  const tick = () => { if (song && !song.paused) { karaoke(); requestAnimationFrame(tick); } };
  function songStop() {
    if (!song || song.paused) return;
    song.pause();
    if (!document.body.contains(root)) return; // 已經離開舞台頁：只要把歌停掉
    root.classList.remove('playing', 'song');
    $('#hsGo').innerHTML = `${ic('mic')}<b>繼續唱</b>`;
  }
  function songToggle() {
    stopSpeaking();
    if (song && !song.paused) return songStop();
    song ??= Object.assign(new Audio(`assets/audio/song-${st.id}.mp3`), {
      ontimeupdate: () => {
        if (!document.body.contains(root)) { song.pause(); return; }
        showLine(); karaoke();
        // 下一句平常藏起來，快唱到前 1.5 秒才淡淡浮出來預告，不干擾閱讀
        const nxt = lines[(showLine.last ?? -1) + 1];
        $('#hsMean').classList.toggle('soon', !!nxt && nxt.t - song.currentTime < 1.5);
      },
      onended: () => reward(),
    });
    stopMusic();
    if (song.ended) song.currentTime = 0;
    showLine.last = null;
    song.play().then(() => {
      root.classList.add('playing', 'song');
      $('#hsGo').innerHTML = `${ic('star')}<b>暫停</b>`;
      showLine(); karaoke(); requestAnimationFrame(tick);
    }).catch(() => {});
  }
  if ($('#hsSpeed')) $('#hsSpeed').onclick = () => {
    const was = playing;
    if (was) stop();
    speed = speed === 'slow' ? 'normal' : 'slow';
    store.get().settings.singSpeed = speed; store.save();
    $('#hsSpeed span').textContent = SPEEDS[speed].name;
    root.style.setProperty('--beat', `${60 / SPEEDS[speed].bpm}s`);
    if (was) start();
  };
  // 離開這頁：音樂停掉、背景配樂恢復
  const leave = () => { stop(); songStop(); startMusic(); window.removeEventListener('hashchange', leave); };
  window.addEventListener('hashchange', leave);
  setCard(0, '準備上台');
  $('#hsMean').textContent = '先聽示範，再換你唱！';
}
