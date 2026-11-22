// 小遊戲：翻牌配對（用學過的字）。圖＋中文 ↔ 韓文（或英文），配對成功就念出來
import { WORDS, LEVELS } from './course.js';
import * as store from './store.js';
import { esc, shuffle, wic, speakAsync, ttsOK } from './util.js';
import { sfx } from './sound.js';
import { mountHost } from './npc.js';

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

// lang：'all'＝三語一起（圖＋中文 ↔ 英文＋韓文同一張卡）；'en'／'ko'＝只練一種
const LNAME = { en: '英文', ko: '韓文', all: '三語' };
export function renderMatch($app, lang = 'all') {
  const host = mountHost(lang === 'en' ? 'match-en' : 'match-ko');
  const words = pool(6);
  const L = lang === 'en' ? 'en-US' : 'ko-KR';
  const wordFace = (w) => (lang === 'all'
    ? `<b class="en">${esc(w.en)}</b><b class="ko">${esc(w.ko)}</b><small>${esc(w.kr)}</small>`
    : `<b class="${lang}">${esc(lang === 'en' ? w.en : w.ko)}</b>${lang === 'ko' ? `<small>${esc(w.kr)}</small>` : ''}`);
  const cards = shuffle(words.flatMap((w) => [
    { id: w.id, side: 'pic', html: `${wic(w)}<b>${esc(w.zh)}</b>` },
    { id: w.id, side: `word${lang === 'all' ? ' tri' : ''}`, html: wordFace(w) },
  ]));
  let open = [];
  let moves = 0;
  let matched = 0;
  let lock = false;
  const t0 = Date.now();
  $app.innerHTML = `
    <div class="backbar"><a href="#/practice" class="backlink">‹</a><b>翻牌配對：${LNAME[lang]}</b></div>
    <div class="match-top"><span id="mMoves">翻了 0 次</span><span id="mLeft">還有 ${words.length} 組</span>
      </div>
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
        sfx('right'); host.right();
        const w = WORDS[cards[a].id];
        store.reviewWord(w.id, true);
        $app.querySelector('#mLeft').textContent = `還有 ${words.length - matched} 組`;
        if (ttsOK) {
          if (lang === 'all') speakAsync(w.en, 'en-US', 0.8).then(() => speakAsync(w.ko, 'ko-KR', 0.75)); // 配對成功：英文、韓文各念一次
          else speakAsync(lang === 'en' ? w.en : w.ko, L, 0.75);
        }
        if (matched === words.length) finish();
      } else {
        lock = true;
        sfx('soft'); host.wrong();
        setTimeout(() => { els[a].classList.remove('up'); els[b].classList.remove('up'); lock = false; }, 900);
      }
    };
  });
  function finish() {
    host.end();
    const secs = Math.round((Date.now() - t0) / 1000);
    const stars = moves <= words.length + 2 ? 3 : moves <= words.length * 2 ? 2 : 1;
    const xp = 10 + stars * 5;
    const r = store.addProgress(xp, 'game', { title: `翻牌配對（${LNAME[lang]}）`, good: words.length, tries: moves });
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
export function renderSpeed($app, lang = 'all') {
  const host = mountHost('speed');
  const words = pool(40);
  const best = store.get().best?.[`speed-${lang}`] || 0;
  $app.innerHTML = `
    <div class="backbar"><a href="#/practice" class="backlink">‹</a><b>60 秒快問快答：${LNAME[lang]}</b></div>
    <div class="speed-box">
      <div class="speed-top"><span id="sTime">60</span><span id="sScore">答對 0</span><span>最佳 ${best}</span></div>
      <div class="speed-card" id="sCard"><p>看到圖片和中文，<br>${lang === 'all' ? '照提示用英文或韓文' : `用${LNAME[lang]}`}說出來！</p></div>
      <p class="speed-said" id="sSaid"></p>
      <div class="actions"><button class="btn primary big" id="sStart" type="button">開始！</button><button class="pill-btn" id="sSkip" type="button" hidden>跳過這題</button>
      </div>
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
      const one = lang === 'all' ? (i % 2 ? 'en' : 'ko') : lang; // 三語：一題英文、一題韓文輪流
      const L = one === 'en' ? 'en-US' : 'ko-KR';
      const target = one === 'en' ? w.en : w.ko;
      const all3 = `${esc(w.zh)}・${esc(w.en)}・${esc(w.ko)}（${esc(w.kr)}）`;
      $('#sCard').innerHTML = `${wic(w)}<b>${esc(w.zh)}</b>${lang === 'all' ? `<span class="speed-ask ${one}">用${LNAME[one]}說</span>` : ''}`;
      $('#sSaid').textContent = '叮！請說…（麥克風在聽）';
      sfx('ding');
      let alts = [];
      let skip = null;
      const skipBtn = $('#sSkip');
      skipBtn.hidden = false;
      try {
        alts = await Promise.race([
          listenOnce(L, { maxMs: 7000, onInterim: (s) => { $('#sSaid').textContent = `聽到：${s}`; } }),
          new Promise((res) => { skip = res; skipBtn.onclick = () => res([]); }),
        ]);
      } catch (e) {
        // 麥克風被擋住或找不到：講清楚怎麼修，然後結束這一輪（不要每題都默默失敗）
        $('#sSaid').textContent = /not-allowed|service-not-allowed/.test(e.message)
          ? '麥克風被擋住了：請按網址列的鎖頭，把「麥克風」改成允許，再重新開始。'
          : /audio-capture/.test(e.message) ? '找不到麥克風：請確認麥克風有開，再重新開始。' : `麥克風出了點問題（${e.message}），請再按一次開始。`;
        skipBtn.hidden = true;
        clearInterval(tick);
        $('#sStart').hidden = false;
        $('#sStart').textContent = '重新開始';
        return;
      }
      skipBtn.hidden = true;
      if (!alive) break;
      const ok = speechMatches(alts, target);
      store.reviewWord(w.id, ok);
      store.logSay(target, L, alts[0], ok, '60 秒快問快答');
      if (ok) {
        score++;
        sfx('right'); host.right();
        $('#sScore').textContent = `答對 ${score}`;
        $('#sSaid').innerHTML = lang === 'all' ? `✓ ${esc(alts[0])}<br><small>${all3}</small>` : `✓ ${esc(alts[0])}`;
        if (ttsOK) await speakAsync(target, L, 0.85);
      } else {
        sfx('soft'); host.wrong();
        $('#sSaid').innerHTML = lang === 'all' ? `答案：<small>${all3}</small>` : esc(`答案是：${target}${one === 'ko' ? `（${w.kr}）` : ''}`);
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
    const r = store.addProgress(10 + score * 3, 'game', { title: `60 秒快問快答（${LNAME[lang]}）`, good: score, tries: i });
    sfx(newBest || r.goalJustMet ? 'reward' : 'stamp');
    $('#sCard').innerHTML = `<b class="end-stars">${score}</b><p>${newBest ? '★ 新紀錄！' : '時間到！'}答對 ${score} 題</p>`;
    $('#sSaid').textContent = `應援值 +${10 + score * 3}${r.goalJustMet ? '・★ 今日目標達成！' : ''}`;
    $('#sStart').hidden = false;
    $('#sStart').textContent = '再挑戰一次';
    if (ttsOK) speakAsync(newBest ? `新紀錄！答對 ${score} 題！` : `時間到！答對 ${score} 題！`, 'zh-TW');
  };
}
