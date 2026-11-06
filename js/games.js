// 小遊戲：翻牌配對（用學過的字）。圖＋中文 ↔ 韓文（或英文），配對成功就念出來
import { WORDS, LEVELS } from './course.js';
import * as store from './store.js';
import { esc, shuffle, wic, speakAsync, ttsOK } from './util.js';
import { sfx } from './sound.js';

function pool(n) {
  const learned = Object.keys(store.get().course.learned).filter((id) => WORDS[id]);
  let ids = shuffle(learned);
  if (ids.length < n) {
    // 學得還不夠多：用前面幾天的字補
    const more = LEVELS.filter((l) => !l.boss).flatMap((l) => l.words).filter((id) => !ids.includes(id));
    ids = [...ids, ...more].slice(0, Math.max(n, ids.length));
  }
  return ids.slice(0, n).map((id) => WORDS[id]);
}

export function renderMatch($app, lang = 'ko') {
  const words = pool(6);
  const L = lang === 'en' ? 'en-US' : 'ko-KR';
  const cards = shuffle(words.flatMap((w) => [
    { id: w.id, side: 'pic', html: `${wic(w)}<b>${esc(w.zh)}</b>` },
    { id: w.id, side: 'word', html: `<b class="${lang}">${esc(lang === 'en' ? w.en : w.ko)}</b>${lang === 'ko' ? `<small>${esc(w.kr)}</small>` : ''}` },
  ]));
  let open = [];
  let moves = 0;
  let matched = 0;
  let lock = false;
  const t0 = Date.now();
  $app.innerHTML = `
    <div class="backbar"><a href="#/practice" class="backlink">‹</a><b>翻牌配對：${lang === 'en' ? '英文' : '韓文'}</b></div>
    <div class="match-top"><span id="mMoves">翻了 0 次</span><span id="mLeft">還有 ${words.length} 組</span>
      <a class="pill-btn" href="#/game/match-${lang === 'en' ? 'ko' : 'en'}">換成${lang === 'en' ? '韓文' : '英文'}</a></div>
    <div class="match-grid">${cards.map((c, i) => `<button class="mcard" type="button" data-i="${i}"><span class="mback">★</span><span class="mface ${c.side}">${c.html}</span></button>`).join('')}</div>
    <div class="match-end" id="mEnd" hidden></div>`;
  const els = [...$app.querySelectorAll('.mcard')];
  els.forEach((el) => {
    el.onclick = async () => {
      const i = +el.dataset.i;
      if (lock || el.classList.contains('up') || el.classList.contains('done')) return;
      el.classList.add('up');
      sfx('tap');
      open.push(i);
      if (open.length < 2) return;
      moves++;
      $app.querySelector('#mMoves').textContent = `翻了 ${moves} 次`;
      const [a, b] = open;
      open = [];
      if (cards[a].id === cards[b].id) {
        matched++;
        els[a].classList.add('done');
        els[b].classList.add('done');
        sfx('right');
        const w = WORDS[cards[a].id];
        store.reviewWord(w.id, true);
        $app.querySelector('#mLeft').textContent = `還有 ${words.length - matched} 組`;
        if (ttsOK) speakAsync(lang === 'en' ? w.en : w.ko, L, 0.75);
        if (matched === words.length) finish();
      } else {
        lock = true;
        sfx('soft');
        setTimeout(() => { els[a].classList.remove('up'); els[b].classList.remove('up'); lock = false; }, 900);
      }
    };
  });
  function finish() {
    const secs = Math.round((Date.now() - t0) / 1000);
    const stars = moves <= words.length + 2 ? 3 : moves <= words.length * 2 ? 2 : 1;
    const xp = 10 + stars * 5;
    const r = store.addProgress(xp, 'game', { title: `翻牌配對（${lang === 'en' ? '英' : '韓'}）`, good: words.length, tries: moves });
    sfx(r.goalJustMet ? 'reward' : 'stamp');
    const end = $app.querySelector('#mEnd');
    end.hidden = false;
    end.innerHTML = `<div class="result"><div class="end-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2>全部配對成功！</h2><p class="muted">${secs} 秒・翻了 ${moves} 次・應援值 +${xp}${r.goalJustMet ? '・★ 今日目標達成！' : ''}</p>
      <div class="actions"><a class="btn primary big" href="#/game/match-${lang}" id="mAgain">再玩一次</a><a class="btn big" href="#/practice">回自由練習</a></div></div>`;
    end.querySelector('#mAgain').onclick = (e) => { e.preventDefault(); renderMatch($app, lang); };
    if (ttsOK) speakAsync(stars === 3 ? '太厲害了！全部配對成功！' : '全部配對成功！', 'zh-TW');
  }
}

// 小遊戲：60 秒快問快答（用說的）。看到圖和中文，說出韓文（或英文）
import { listenOnce, speechMatches, sttOK, sleep } from './util.js';
export function renderSpeed($app, lang = 'ko') {
  const L = lang === 'en' ? 'en-US' : 'ko-KR';
  const words = pool(40);
  const best = store.get().best?.[`speed-${lang}`] || 0;
  $app.innerHTML = `
    <div class="backbar"><a href="#/practice" class="backlink">‹</a><b>60 秒快問快答：${lang === 'en' ? '英文' : '韓文'}</b></div>
    <div class="speed-box">
      <div class="speed-top"><span id="sTime">60</span><span id="sScore">答對 0</span><span>最佳 ${best}</span></div>
      <div class="speed-card" id="sCard"><p>看到圖片和中文，<br>用${lang === 'en' ? '英文' : '韓文'}說出來！</p></div>
      <p class="speed-said" id="sSaid"></p>
      <div class="actions"><button class="btn primary big" id="sStart" type="button">開始！</button>
        <a class="pill-btn" href="#/game/speed-${lang === 'en' ? 'ko' : 'en'}">換成${lang === 'en' ? '韓文' : '英文'}</a></div>
      ${sttOK ? '' : '<p class="muted center">這個瀏覽器不能用麥克風，請用 Microsoft Edge 開。</p>'}
    </div>`;
  const $ = (s) => $app.querySelector(s);
  let alive = true;
  window.addEventListener('hashchange', () => { alive = false; }, { once: true });
  $('#sStart').onclick = async () => {
    if (!sttOK) return;
    $('#sStart').hidden = true;
    let score = 0;
    let i = 0;
    const end = Date.now() + 60000;
    const tick = setInterval(() => { $('#sTime').textContent = Math.max(0, Math.ceil((end - Date.now()) / 1000)); }, 250);
    while (alive && Date.now() < end && i < words.length) {
      const w = words[i++];
      const target = lang === 'en' ? w.en : w.ko;
      $('#sCard').innerHTML = `${wic(w)}<b>${esc(w.zh)}</b>`;
      $('#sSaid').textContent = '叮！請說…';
      sfx('ding');
      let alts = [];
      try { alts = await listenOnce(L); } catch (e) { alts = []; }
      if (!alive) break;
      const ok = speechMatches(alts, target);
      store.reviewWord(w.id, ok);
      store.logSay(target, L, alts[0], ok, '60 秒快問快答');
      if (ok) {
        score++;
        sfx('right');
        $('#sScore').textContent = `答對 ${score}`;
        $('#sSaid').textContent = `✓ ${alts[0]}`;
        if (ttsOK) await speakAsync(target, L, 0.85);
      } else {
        sfx('soft');
        $('#sSaid').textContent = `答案是：${target}${lang === 'ko' ? `（${w.kr}）` : ''}`;
        if (ttsOK) await speakAsync(target, L, 0.7);
        await sleep(400);
      }
    }
    clearInterval(tick);
    if (!alive) return;
    const s = store.get();
    s.best ??= {};
    const newBest = score > (s.best[`speed-${lang}`] || 0);
    if (newBest) s.best[`speed-${lang}`] = score;
    const r = store.addProgress(10 + score * 3, 'game', { title: `60 秒快問快答（${lang === 'en' ? '英' : '韓'}）`, good: score, tries: i });
    sfx(newBest || r.goalJustMet ? 'reward' : 'stamp');
    $('#sCard').innerHTML = `<b class="end-stars">${score}</b><p>${newBest ? '★ 新紀錄！' : '時間到！'}答對 ${score} 題</p>`;
    $('#sSaid').textContent = `應援值 +${10 + score * 3}${r.goalJustMet ? '・★ 今日目標達成！' : ''}`;
    $('#sStart').hidden = false;
    $('#sStart').textContent = '再挑戰一次';
    if (ttsOK) speakAsync(newBest ? `新紀錄！答對 ${score} 題！` : `時間到！答對 ${score} 題！`, 'zh-TW');
  };
}
