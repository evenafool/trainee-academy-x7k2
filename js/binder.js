// 收藏室＝小卡冊書架：分成幾本卡冊，每本可以自己設計封面（顏色、花紋、標題、封面小卡、貼紙）
//   ・卡冊裡一頁 9 格透明卡套，左右滑或按箭頭翻頁；點卡片放大看說明（文字都收在放大的地方）
import * as store from './store.js';
import { LEVELS } from './course.js';
import { rewardForDay, rewardHTML, memberById } from './rewards.js';
import { EGGS, eggState, secretCard, eggBoxes } from './eggs.js';
import { esc, ic, speak } from './util.js';
import { sfx } from './sound.js';

const BOOKS = [
  { id: 'photo', title: '劇照小卡冊', icon: 'cards', cover: { color: '#ffd6e7', pattern: 'dots' }, decos: ['mascot-love'] },
  { id: 'memo', title: '回憶小物冊', icon: 'gift', cover: { color: '#fff1c4', pattern: 'check' }, decos: ['item-ribbon'] },
  { id: 'secret', title: 'SECRET 卡冊', icon: 'star', cover: { color: '#3b3561', pattern: 'stars' }, decos: ['item-moon'] },
  { id: 'word', title: '單字卡冊', icon: 'book', cover: { color: '#d9f5e5', pattern: 'stripes' }, decos: ['ui-star'] },
];
const COLORS = ['#ffd6e7', '#ffb3c7', '#e3d6ff', '#c9b8ff', '#d6f0ff', '#d9f5e5', '#fff1c4', '#ffe0cc', '#f6efe7', '#3b3561', '#2f2f3a', '#7a4a5a'];
const PATTERNS = [{ id: 'plain', name: '素面' }, { id: 'dots', name: '圓點' }, { id: 'stripes', name: '條紋' }, { id: 'check', name: '格子' }, { id: 'hearts', name: '愛心' }, { id: 'stars', name: '星星' }];
const DECOS = ['ui-heart', 'ui-star', 'ui-gift', 'ui-mic', 'mascot-happy', 'mascot-love', 'mascot-party', 'mascot-cheer', 'item-starclip', 'item-ribbon', 'item-crown', 'item-moon', 'item-lightstick', 'item-headset'];
const MAX_DECO = 4;
const PER = 9;

const isDark = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) < 140; };
const fmtDate = (t) => { const d = new Date(t); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };

function coverCfg(book) {
  const s = store.get();
  s.binders ??= {};
  const c = s.binders[book.id] || {};
  return { title: c.title || book.title, color: COLORS.includes(c.color) ? c.color : book.cover.color, pattern: PATTERNS.some((p) => p.id === c.pattern) ? c.pattern : book.cover.pattern, photo: c.photo || '', decos: Array.isArray(c.decos) ? c.decos.filter((d) => DECOS.includes(d)).slice(0, MAX_DECO) : book.decos };
}

// 每本卡冊的格子：{ key, r（收藏品）, got, html?, info }
function slotsOf(book, cardHTML) {
  const s = store.get();
  if (book.id === 'secret') {
    const got = eggState();
    return EGGS.map((e) => ({ key: `secret-${e.id}`, r: secretCard(e), got: !!got[e.id], egg: e, at: got[e.id] }));
  }
  if (book.id === 'word') {
    const list = [...(s.cards || [])].reverse().map((c, i) => ({ key: `w${i}`, html: cardHTML(c, true), got: true, c }));
    const pad = Math.max(PER, Math.ceil(list.length / PER) * PER) - list.length;
    return [...list, ...Array.from({ length: pad }, (_, i) => ({ key: `wp${i}`, got: false, blank: true }))];
  }
  const got = new Map((s.collection || []).map((r) => [r.day, r]));
  const days = LEVELS.filter((l) => !l.boss);
  const total = Math.max(days.length, ...(s.collection || []).map((r) => r.day));
  const out = [];
  for (let n = 1; n <= total; n++) {
    const r = got.get(n) || rewardForDay(n);
    const photo = r.kind === 'scene' || r.kind === 'card';
    if ((book.id === 'photo') !== photo) continue;
    out.push({ key: `d${n}`, r, got: got.has(n), day: n, title: got.get(n)?.title || days[n - 1]?.title || '', at: got.get(n)?.at });
  }
  return out;
}

function coverHTML(book, cfg, slots, { mini = false } = {}) {
  const ph = cfg.photo && slots.find((x) => x.key === cfg.photo && x.got && x.r);
  const have = slots.filter((x) => x.got && !x.blank).length;
  const total = book.id === 'word' ? have : slots.length;
  return `<span class="bc pat-${cfg.pattern} ${isDark(cfg.color) ? 'dark' : ''} ${mini ? 'mini' : ''}" style="--bc:${cfg.color}">
    <span class="bc-rings" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="bc-title">${esc(cfg.title)}</span>
    <span class="bc-window">${ph ? rewardHTML(ph.r) : `<span class="bc-empty">${ic(book.icon)}</span>`}</span>
    ${cfg.decos.map((d, i) => `<img class="bc-deco d${i}" src="assets/art/icons/${d}.webp" alt="" onerror="this.remove()">`).join('')}
    ${mini ? '' : `<span class="bc-count">${have}${book.id === 'word' ? ' 張' : `／${total}`}</span>`}
  </span>`;
}

export function renderBinders($app, arg, { cardHTML }) {
  const book = BOOKS.find((b) => b.id === arg);
  if (book) return openBook($app, book, cardHTML);
  const s = store.get();
  const all = BOOKS.map((b) => ({ b, cfg: coverCfg(b), slots: slotsOf(b, cardHTML) }));
  const have = all.reduce((a, x) => a + x.slots.filter((y) => y.got && !y.blank).length, 0);
  const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
  $app.innerHTML = `
    <section class="bk-shelfpage">
      <header class="bk-top"><a class="fr-back" href="#/home" aria-label="回大廳">‹</a><b>我的小卡冊</b><span class="bk-total">${ic('cards')} ${have}</span></header>
      <div class="bk-shelf">${all.map(({ b, cfg, slots }) => `<a class="bk-book" href="#/cards/${b.id}">${coverHTML(b, cfg, slots)}</a>`).join('')}</div>
      <p class="bk-tip">${ic('star')} 點卡冊打開，翻頁看小卡；打開後按「封面」可以自己設計</p>
      ${s.collection?.length ? `<details class="me-sec">
        <summary>${ic('book')}<span><b>收藏日記</b><small>每一張是哪天拿到的</small></span><i class="chev">›</i></summary>
        <ol class="timeline">${[...s.collection].reverse().map((r) => `<li><span class="tl-date">${fmt(r.at)}</span><span class="tl-dot"></span><div><b>${esc(r.name)}</b><small>第 ${r.day} 天「${esc(r.title)}」</small></div></li>`).join('')}</ol>
      </details>` : ''}
    </section>`;
}

function openBook($app, book, cardHTML) {
  const slots = slotsOf(book, cardHTML);
  const pages = Math.max(1, Math.ceil(slots.length / PER));
  const have = slots.filter((x) => x.got && !x.blank).length;
  // 打開時翻到「最新拿到的那一頁」
  const lastGot = slots.reduce((a, x, i) => (x.got && !x.blank ? i : a), 0);
  let page = book.id === 'word' ? 0 : Math.floor(lastGot / PER);
  const draw = () => {
    const cfg = coverCfg(book);
    $app.innerHTML = `
    <section class="bk-open" style="--bc:${cfg.color}">
      <div class="bk-head">
        <a class="fr-back" href="#/cards" aria-label="回書架">‹</a>
        <span class="bk-mini">${coverHTML(book, cfg, slots, { mini: true })}</span>
        <span class="bk-ht"><b>${esc(cfg.title)}</b><small>${have}${book.id === 'word' ? ' 張' : `／${slots.length} 張`}</small></span>
        <button type="button" class="bk-edit" id="bkEdit">${ic('star')}<small>封面</small></button>
      </div>
      ${book.id === 'secret' ? `<p class="bk-hint">${ic('chat')}<span>在聊天室<b>自己打出</b>韓文送出就能解鎖！點空格看提示</span></p>` : ''}
      <div class="bk-binder">
        <div class="bk-holes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="bk-page" id="bkPage"></div>
      </div>
      <div class="bk-nav">
        <button type="button" class="bk-arrow" id="bkPrev" aria-label="上一頁">‹</button>
        <span class="bk-dots">${Array.from({ length: pages }, (_, i) => `<i data-pg="${i}"></i>`).join('')}</span>
        <button type="button" class="bk-arrow" id="bkNext" aria-label="下一頁">›</button>
      </div>
    </section>`;
    const $page = $app.querySelector('#bkPage');
    const show = (dir = 0) => {
      const list = slots.slice(page * PER, page * PER + PER);
      while (list.length < PER) list.push({ key: `pad${list.length}`, blank: true });
      $page.innerHTML = list.map((x, i) => sleeveHTML(book, x, page * PER + i)).join('');
      $page.classList.remove('turn-l', 'turn-r'); void $page.offsetWidth;
      if (dir) $page.classList.add(dir > 0 ? 'turn-r' : 'turn-l');
      $app.querySelectorAll('.bk-dots i').forEach((d, i) => d.classList.toggle('on', i === page));
      $app.querySelector('#bkPrev').disabled = page === 0;
      $app.querySelector('#bkNext').disabled = page >= pages - 1;
      $page.querySelectorAll('[data-slot]').forEach((b) => b.onclick = () => zoom(book, slots[+b.dataset.slot]));
    };
    const go = (d) => { const p = Math.min(pages - 1, Math.max(0, page + d)); if (p === page) return; page = p; sfx('tap'); show(d); };
    $app.querySelector('#bkPrev').onclick = () => go(-1);
    $app.querySelector('#bkNext').onclick = () => go(1);
    $app.querySelectorAll('.bk-dots i').forEach((d) => d.onclick = () => { const p = +d.dataset.pg; if (p !== page) { const dir = p > page ? 1 : -1; page = p; show(dir); } });
    // 左右滑翻頁
    let x0 = null;
    $page.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    $page.addEventListener('pointerup', (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1); });
    $app.querySelector('#bkEdit').onclick = () => editCover(book, slots, draw);
    show();
  };
  draw();
}

function sleeveHTML(book, x, idx) {
  if (x.blank) return '<span class="bk-sl blank"></span>';
  const tag = x.day ? `<i class="bk-tag">${x.day}</i>` : '';
  if (x.got) return `<button type="button" class="bk-sl got" data-slot="${idx}">${x.html || rewardHTML(x.r)}${tag}</button>`;
  const ghost = book.id === 'secret'
    ? `<span class="bk-ghost secret"><b>?</b><small>${esc(x.egg.zh)}</small></span>`
    : `<span class="bk-ghost"><b>${x.day}</b><small>第 ${x.day} 天</small></span>`;
  return `<button type="button" class="bk-sl empty" data-slot="${idx}" aria-label="還沒拿到">${ghost}</button>`;
}

// 點卡片放大：說明文字都放在這裡
function zoom(book, x) {
  if (!x || x.blank) return;
  let card = '';
  let info = '';
  if (x.got && x.html) { card = x.html; info = ''; }
  else if (book.id === 'secret') {
    const m = memberById(x.egg.id);
    if (x.got) {
      card = rewardHTML(x.r, { big: true });
      info = `<button type="button" class="bk-say" data-say="${esc(x.egg.say)}">${ic('speaker')}<b lang="ko">${esc(x.egg.say)}</b></button><small>${esc(m.name)}：${esc(x.egg.sayZh)}</small><small>你拼出了「<span lang="ko">${esc(x.egg.ko)}</span>」${esc(x.egg.zh)}・${fmtDate(x.at)}</small>`;
    } else {
      card = `<div class="bk-sback"><span>SECRET</span></div>`;
      info = `<b>${esc(x.egg.hint)}</b><span class="bk-boxes">${esc(eggBoxes(x.egg))}</span><small>在聊天室用韓文鍵盤打出來、送出，就會解鎖！</small>`;
    }
  } else {
    card = rewardHTML(x.r, { big: true, locked: !x.got });
    info = x.got ? `<b>${esc(x.r.name)}</b><small>第 ${x.day} 天「${esc(x.title)}」上完拿到・${fmtDate(x.at)}</small>` : `<b>還沒拿到</b><small>上完第 ${x.day} 天的課就會拿到</small>`;
  }
  const box = document.createElement('div');
  box.className = 'bk-zoom';
  box.innerHTML = `<div class="bk-zin">${card}<div class="bk-zinfo">${info}</div><button type="button" class="btn" data-close="1">收回卡冊</button></div>`;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('show'));
  sfx('tap');
  const close = () => { box.classList.remove('show'); setTimeout(() => box.remove(), 220); };
  box.onclick = (e) => { if (e.target === box || e.target.closest('[data-close]')) close(); };
  box.querySelector('[data-say]')?.addEventListener('click', (e) => { e.stopPropagation(); try { speak(e.currentTarget.dataset.say, 'ko-KR', 0.8); } catch (err) { /* 沒有語音 */ } });
}

// 設計封面
function editCover(book, slots, redraw) {
  const s = store.get();
  const draft = { ...coverCfg(book), decos: [...coverCfg(book).decos] };
  const photos = slots.filter((x) => x.got && x.r);
  const box = document.createElement('div');
  box.className = 'bk-sheet';
  const body = () => `<div class="bk-sin">
    <div class="bk-prev">${coverHTML(book, draft, slots)}</div>
    <label class="bk-row"><span>${ic('book')}</span><input id="bkTitle" maxlength="12" value="${esc(draft.title)}" aria-label="卡冊名字"></label>
    <div class="bk-opt"><div class="bk-sw">${COLORS.map((c) => `<button type="button" class="${c === draft.color ? 'on' : ''}" data-color="${c}" style="--c:${c}" aria-label="顏色"></button>`).join('')}</div></div>
    <div class="bk-opt"><div class="bk-pats">${PATTERNS.map((p) => `<button type="button" class="bc pat-${p.id} ${isDark(draft.color) ? 'dark' : ''} ${p.id === draft.pattern ? 'on' : ''}" style="--bc:${draft.color}" data-pat="${p.id}"><small>${p.name}</small></button>`).join('')}</div></div>
    ${photos.length ? `<div class="bk-opt"><small class="bk-lab">${ic('cards')} 封面小卡</small><div class="bk-photos"><button type="button" class="bk-none ${draft.photo ? '' : 'on'}" data-photo="">無</button>${photos.map((x) => `<button type="button" class="${x.key === draft.photo ? 'on' : ''}" data-photo="${x.key}">${rewardHTML(x.r)}</button>`).join('')}</div></div>` : ''}
    <div class="bk-opt"><small class="bk-lab">${ic('heart')} 貼紙（最多 ${MAX_DECO} 個）</small><div class="bk-decos">${DECOS.map((d) => `<button type="button" class="${draft.decos.includes(d) ? 'on' : ''}" data-deco="${d}"><img src="assets/art/icons/${d}.webp" alt="" onerror="this.parentNode.remove()"></button>`).join('')}</div></div>
    <div class="bk-sbtn"><button type="button" class="btn" data-cancel="1">取消</button><button type="button" class="btn primary" data-save="1">完成</button></div>
  </div>`;
  const paint = () => {
    const y = box.querySelector('.bk-sin')?.scrollTop || 0;
    box.innerHTML = body();
    box.querySelector('.bk-sin').scrollTop = y;
  };
  paint();
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('show'));
  const close = () => { box.classList.remove('show'); setTimeout(() => box.remove(), 220); };
  box.addEventListener('input', (e) => { if (e.target.id === 'bkTitle') { draft.title = e.target.value; box.querySelector('.bk-prev .bc-title').textContent = draft.title || book.title; } });
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (e.target === box || b?.dataset.cancel) { close(); return; }
    if (!b) return;
    if (b.dataset.save) {
      s.binders ??= {};
      s.binders[book.id] = { ...draft, title: draft.title.trim() || book.title };
      store.save();
      sfx('stamp');
      close();
      redraw();
      return;
    }
    if (b.dataset.color) draft.color = b.dataset.color;
    else if (b.dataset.pat) draft.pattern = b.dataset.pat;
    else if (b.dataset.photo != null) draft.photo = b.dataset.photo;
    else if (b.dataset.deco) {
      const d = b.dataset.deco;
      if (draft.decos.includes(d)) draft.decos = draft.decos.filter((z) => z !== d);
      else if (draft.decos.length < MAX_DECO) draft.decos.push(d);
      else draft.decos = [...draft.decos.slice(1), d];
    } else return;
    sfx('tap');
    paint();
  });
}
