// 好友聊天室 #/chat/<好友 uid>
//   ・沒有自由中英文：只能傳韓文字卡、只收韓文的打字、露露貼圖、應援、分享（劇情卡／單字卡／收藏）、單字對決
//   ・動畫：泡泡彈出、貼圖跳動、應援滿畫面、禮物翻牌、答對撒彩帶
import * as store from './store.js';
import { LEVELS, WORDS } from './course.js';
import { rewardForDay, rewardHTML, memberById } from './rewards.js';
import { claimEgg, secretCard } from './eggs.js';
import { sfx } from './sound.js';
import { esc, ic, wic, confetti, speak, speakAsync, shuffle, sttOK, listenOnce, flyText, ttsOK, voiceFor } from './util.js';
import { CARD_GROUPS, CARD_BY_ID, STICKERS, CHEERS, KO_ONLY, PATTERNS, PATTERN_BY_ID, isNounish, koSim, koKey, cleanHeard } from './chatcards.js';
import { currentUser, sendMsg, watchMsgs, markSeen, chatId, publicCard, myUid } from './cloud.js';
import { friendByUid, saveFriendCard } from './friends.js';
import { lookSVG, BUST_BOX } from './avatar.js';

const DAYS = () => LEVELS.filter((l) => !l.boss);
const LV = (id) => LEVELS.find((l) => l.id === id);
const sayKo = (t) => { try { speak(t, 'ko-KR', 0.8); } catch (e) { /* 沒有語音就算了 */ } };
const avatar = (o) => `<span class="ct-av">${lookSVG(o, { box: BUST_BOX, cls: 'face-svg' })}</span>`; // 朋友現在穿的樣子
// 用訊息 id 當種子，兩邊看到的選項順序一樣
const seeded = (seed) => { let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0; return () => ((h = (h * 1103515245 + 12345) | 0) >>> 0) / 4294967296; };
function quizChoices(wordId, seed) {
  const w = WORDS[wordId];
  const rnd = seeded(seed);
  const pool = Object.values(WORDS).filter((x) => x.zh && x.zh !== w.zh);
  const picks = new Set();
  while (picks.size < 2 && pool.length) picks.add(pool[Math.floor(rnd() * pool.length)].zh);
  const all = [w.zh, ...picks];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}

// 教室學過的句子：k = 單字id_第幾句
const lessonLine = (k) => { const i = k.lastIndexOf('_'); const w = WORDS[k.slice(0, i)]; return w?.scenes?.[+k.slice(i + 1)] || null; };

// 造句：k = 句型id_單字id
const patLine = (k) => { const i = k.indexOf('_'); const p = PATTERN_BY_ID[k.slice(0, i)]; const w = WORDS[k.slice(i + 1)]; if (!p || !w || !isNounish(w)) return null; return { ko: p.ko.replace('___', w.ko), zh: p.zh.replace('___', w.zh), w }; };

// 麥克風提示泡泡：還沒用過按住說話就一直顯示
const MICTIP_KEY = 'idolstudy.micTip';
const micTipOn = () => { try { return !localStorage.getItem(MICTIP_KEY); } catch (e) { return true; } };

// 自動念出新訊息（預設開），記在這台裝置
const AUTO_KEY = 'idolstudy.chatAutoSay';
const autoSayOn = () => { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch (e) { return true; } };

// 語音輸入能對到的「正確韓文」：聊天字卡、教室學的字、課文句子、造句
function voiceTargets() {
  const st = myStuff();
  const list = Object.values(CARD_BY_ID).map((c) => ({ ko: c.ko, zh: c.zh, msg: { t: 'card', k: c.id } }));
  for (const id of st.words) {
    const w = WORDS[id];
    list.push({ ko: w.ko, zh: w.zh, msg: { t: 'lw', k: id } });
    (w.scenes || []).forEach((sc, i) => { if (sc.ko && sc.ko.length <= 40) list.push({ ko: sc.ko, zh: sc.zh, msg: { t: 'ls', k: `${id}_${i}` } }); });
    if (isNounish(w)) for (const p of PATTERNS) list.push({ ko: p.ko.replace('___', w.ko), zh: p.zh.replace('___', w.zh), msg: { t: 'pat', k: `${p.id}_${id}` } });
  }
  return list;
}
// 聽到的幾個候選 → 對到準備好的句子（最準），或是乾淨的韓文句子
function judgeHeard(alts) {
  const heard = alts.map(cleanHeard).filter(Boolean);
  if (!heard.length) return { state: 'bad', said: alts[0] || '' };
  let best = null;
  for (const t of voiceTargets()) {
    for (const h of heard) {
      const sc = koSim(h, t.ko);
      if (!best || sc > best.score) best = { ...t, said: h, score: sc };
    }
  }
  if (best && best.score >= 0.8) return { state: 'ok', snap: true, ...best };
  // 沒對到準備好的句子：辨識器信心太低就請她再說一次
  //（說中文被硬轉成韓文拼音時，信心通常偏低）
  if (alts.conf > 0 && alts.conf < 0.65) return { state: 'bad', said: heard[0], unsure: true };
  return { state: 'ok', snap: false, ko: heard[0], said: heard[0], msg: { t: 'ko', k: '', x: heard[0] } };
}

// 我能分享／出題的東西
function myStuff() {
  const s = store.get();
  const cleared = s.course?.cleared || {};
  const eps = DAYS().filter((l) => cleared[l.id] != null);
  const words = [...new Set(eps.flatMap((l) => l.words || []))].filter((id) => WORDS[id]);
  const gifts = [...(s.collection || [])].reverse();
  return { eps, words, gifts };
}

// 彩蛋解鎖：卡片背面翻過來亮相，偶像用韓文回你一句
function eggPop(e) {
  const m = memberById(e.id);
  const box = document.createElement('div');
  box.className = 'egg-pop';
  box.innerHTML = `<div class="egg-in">
    <p class="egg-t">${ic('gift')} 發現隱藏彩蛋！</p>
    <div class="egg-flip"><div class="egg-back"><span>SECRET</span></div><div class="egg-front">${rewardHTML(secretCard(e), { big: true })}</div></div>
    <p class="egg-say"><b lang="ko">${esc(e.say)}</b><small>${esc(m.name)}：${esc(e.sayZh)}</small></p>
    <p class="egg-why">你拼出了「<b lang="ko">${esc(e.ko)}</b>」（${esc(e.zh)}）</p>
    <a class="btn primary" href="#/cards/secret">${ic('cards')} 去 SECRET 卡冊看看</a>
    <button type="button" class="btn ghost" data-close="1">繼續聊天</button>
  </div>`;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('show'));
  sfx('reward');
  setTimeout(() => { box.classList.add('flipped'); confetti(70); }, 700);
  setTimeout(() => { try { speak(e.say, 'ko-KR', 0.8); } catch (err) { /* 沒有語音 */ } }, 1500);
  const close = () => { box.classList.remove('show'); setTimeout(() => box.remove(), 250); };
  box.querySelector('[data-close]').onclick = close;
  box.querySelector('a').onclick = close;
  box.onclick = (ev) => { if (ev.target === box) close(); };
}

let unsub = null;
let session = 0;

export async function renderChat($app, arg, toast) {
  unsub?.(); unsub = null;
  const my = ++session;
  const uid = String(arg || '');
  // 本機開發用示範（假資料、不連雲端）：http://localhost:5173/#/chat/__demo
  const demo = uid === '__demo' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (!currentUser() && !demo) {
    $app.innerHTML = `<div class="ct-wrap"><div class="ct-head"><a href="#/friends" class="backlink">‹</a><b>聊天室</b></div>
      <div class="ct-empty">要先用 Google 登入，才能和好友聊天喔！<br><a class="btn primary" href="#/friends">去登入</a></div></div>`;
    return;
  }
  let friend = demo ? { n: '小美', d: 12, o: 'trainee' } : friendByUid(uid);
  const card = friend || (await publicCard(uid));
  if (my !== session) return;
  if (!card) { $app.innerHTML = `<div class="ct-wrap"><div class="ct-head"><a href="#/friends" class="backlink">‹</a><b>聊天室</b></div><div class="ct-empty">找不到這位朋友</div></div>`; return; }
  const name = card.nick || card.n;
  const me = demo ? 'me-demo' : myUid();
  const cid = chatId(me, uid);

  $app.innerHTML = `<div class="ct-wrap">
    <div class="ct-head">
      <a href="#/friends" class="backlink" aria-label="回好友">‹</a>
      ${avatar(card.o)}
      <div class="grow"><b>${esc(name)}</b><small>第 ${card.d || 0} 集・點訊息聽發音，再點一下變慢速</small></div>
      ${friend ? '' : '<button class="btn small primary" id="ctAddBack">加好友</button>'}
      <button class="ct-auto ${autoSayOn() ? 'on' : ''}" id="ctAuto" aria-pressed="${autoSayOn()}" title="收到訊息自動念出來">${ic('speaker')}<small>自動念</small></button>
    </div>
    <div class="ct-list" id="ctList" aria-live="polite"><div class="ct-loading">連線中…</div></div>
    <div class="ct-bar" id="ctBar">
      <div class="ct-heard" id="ctHeard" hidden></div>
      <form class="ct-input" id="ctKo" autocomplete="off">
        <button type="button" class="ct-plus on" id="ctPlus" aria-label="字卡、貼圖、分享" aria-expanded="true"></button>
        <label class="ct-field" id="ctField">
          <input id="ctKoIn" lang="ko" maxlength="40" placeholder="打韓文…" enterkeyhint="send">
          <button type="button" class="ct-fld-stk" data-open="stk" aria-label="貼圖">${ic('heart')}</button>
        </label>
        <button type="button" class="ct-micbtn" id="ctMic" aria-label="按住說韓文">${ic('mic')}${micTipOn() ? '<span class="ct-mictip" id="ctMicTip">按住說韓文</span>' : ''}</button>
        <button type="submit" class="ct-sendbtn" id="ctSend" aria-label="傳送" hidden></button>
      </form>
      <p class="ct-kohint" id="ctKoHint" hidden>只能打韓文喔！先切換成韓文鍵盤（手機：地球鍵；電腦：Win＋空白）</p>
      <div class="ct-drawer" id="ctDrawer">
        <div class="ct-tabs" role="tablist">
          <button data-tab="cards" class="on">${ic('chat')}字卡</button>
          <button data-tab="stk">${ic('heart')}貼圖</button>
          <button data-tab="cheer">${ic('star')}應援</button>
          <button data-tab="share">${ic('gift')}分享</button>
          <button data-tab="quiz">${ic('trophy')}對決</button>
        </div>
        <div class="ct-panel" id="ctPanel"></div>
      </div>
    </div>
    <div class="ct-rec" id="ctRec" hidden aria-live="polite">
      <div class="ct-rec-in">
        <span class="ct-rec-mic">${ic('mic')}</span>
        <span class="ct-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <p class="ct-rec-text" lang="ko" id="ctRecText">請說韓文…</p>
        <small id="ctRecHint">說完放開手指・往上滑取消</small>
      </div>
    </div>
  </div>`;
  const $list = $app.querySelector('#ctList');
  const $panel = $app.querySelector('#ctPanel');
  const $bar = $app.querySelector('#ctBar');
  const $in = $app.querySelector('#ctKoIn');
  const $field = $app.querySelector('#ctField');
  const $mic = $app.querySelector('#ctMic');
  const $sendBtn = $app.querySelector('#ctSend');
  const $drawer = $app.querySelector('#ctDrawer');
  const $plus = $app.querySelector('#ctPlus');
  const $heard = $app.querySelector('#ctHeard');
  const $rec = $app.querySelector('#ctRec');
  const $recText = $app.querySelector('#ctRecText');
  const $recHint = $app.querySelector('#ctRecHint');

  let autoSay = autoSayOn();
  const $auto = $app.querySelector('#ctAuto');
  $auto.onclick = () => {
    autoSay = !autoSay;
    try { localStorage.setItem(AUTO_KEY, autoSay ? '1' : '0'); } catch (e) { /* 存不了就只有這次 */ }
    $auto.classList.toggle('on', autoSay);
    $auto.setAttribute('aria-pressed', String(autoSay));
    toast(autoSay ? '收到訊息會自動念出來' : '關掉自動念了（點訊息還是可以聽）');
  };

  const addBack = $app.querySelector('#ctAddBack');
  if (addBack) addBack.onclick = () => {
    saveFriendCard(card);
    friend = card;
    addBack.remove();
    toast(`和 ${card.n} 成為好友了！`);
    confetti(36);
  };

  // ───── 傳訊息 ─────
  const send = async (msg) => {
    try {
      if (demo) demoSend({ ...msg, f: me }); else await sendMsg(uid, msg);
      // 每天第一次用韓文和朋友聊天：+5 應援值
      if (['card', 'ko', 'lw', 'ls', 'pat'].includes(msg.t)) {
        const s = store.get();
        if (s.chatBonus !== store.today()) { s.chatBonus = store.today(); s.xp += 5; store.save(); toast('今天第一次用韓文聊天！應援值 +5'); }
      }
    } catch (e) {
      toast(e.message === 'slow' ? '慢一點點～' : '傳送失敗，檢查一下網路');
    }
  };

  // ───── 面板（字卡、貼圖、應援、分享、對決）─────
  let group = 'class';
  let pat = 'p1';
  let shareKind = 'ep';
  const panels = {
    cards: () => {
      const chips = `<div class="ct-chips"><button data-g="class" class="${group === 'class' ? 'on' : ''}">教室學的</button><button data-g="pat" class="${group === 'pat' ? 'on' : ''}">造句</button><button data-g="lines" class="${group === 'lines' ? 'on' : ''}">課文句子</button>${CARD_GROUPS.map((g) => `<button data-g="${g.id}" class="${g.id === group ? 'on' : ''}">${esc(g.name)}</button>`).join('')}</div>`;
      const st = myStuff();
      if (group === 'class') return chips + (st.words.length ? `<div class="ct-words">${[...st.words].reverse().map((id) => `<button class="ct-wd" data-lw="${id}">${wic(WORDS[id])}<b lang="ko">${esc(WORDS[id].ko)}</b><small>${esc(WORDS[id].zh)}</small></button>`).join('')}</div>` : '<p class="ct-hint">上完課學到的單字，會變成可以聊天用的字卡！</p>');
      if (group === 'pat') {
        const nouns = [...st.words].reverse().filter((id) => isNounish(WORDS[id]));
        if (!nouns.length) return chips + '<p class="ct-hint">學到名詞（像是「學校」「蛋糕」）之後，就能用句型造句！</p>';
        const p = PATTERN_BY_ID[pat] || PATTERNS[0];
        return chips + `<div class="ct-pats">${PATTERNS.map((x) => `<button class="ct-pat ${x.id === p.id ? 'on' : ''}" data-pat="${x.id}"><b lang="ko">${esc(x.ko)}</b><small>${esc(x.zh)}</small></button>`).join('')}</div>
          <p class="ct-hint">選一個學過的字填進「${esc(p.ko)}」</p>
          <div class="ct-words">${nouns.map((id) => `<button class="ct-wd" data-fill="${id}">${wic(WORDS[id])}<b lang="ko">${esc(p.ko.replace('___', WORDS[id].ko))}</b><small>${esc(p.zh.replace('___', WORDS[id].zh))}</small></button>`).join('')}</div>`;
      }
      if (group === 'lines') {
        const lines = [...st.words].reverse().flatMap((id) => (WORDS[id].scenes || []).map((sc, i) => ({ k: `${id}_${i}`, sc }))).filter((x) => x.sc.ko && x.sc.ko.length <= 40);
        return chips + (lines.length ? `<div class="ct-cards">${lines.slice(0, 60).map((x) => `<button class="ct-card" data-ls="${esc(x.k)}"><b lang="ko">${esc(x.sc.ko)}</b><small>${esc(x.sc.zh)}</small></button>`).join('')}</div>` : '<p class="ct-hint">上課學到的句子會出現在這裡</p>');
      }
      return chips + `<div class="ct-cards">${CARD_GROUPS.find((g) => g.id === group).cards.map((c) => `<button class="ct-card" data-card="${c.id}"><b lang="ko">${esc(c.ko)}</b><small>${esc(c.zh)}</small></button>`).join('')}</div>`;
    },
    stk: () => `<div class="ct-stks">${STICKERS.map((x) => `<button class="ct-stk" data-stk="${x.id}" aria-label="${esc(x.name)}"><img src="assets/art/icons/mascot-${x.id}.webp" alt=""><small>${esc(x.name)}</small></button>`).join('')}</div>`,
    cheer: () => `<div class="ct-cheers">${CHEERS.map((x) => `<button class="ct-cheer" data-cheer="${x.id}"><img src="assets/art/icons/${x.icon}.webp" alt=""><b>${esc(x.name)}</b><small lang="ko">${esc(x.ko)}</small></button>`).join('')}</div>`,
    share: () => {
      const st = myStuff();
      const tabs = `<div class="ct-chips"><button data-sk="ep" class="${shareKind === 'ep' ? 'on' : ''}">劇情卡</button><button data-sk="word" class="${shareKind === 'word' ? 'on' : ''}">單字卡</button><button data-sk="gift" class="${shareKind === 'gift' ? 'on' : ''}">收藏</button></div>`;
      let body = '';
      if (shareKind === 'ep') body = st.eps.length ? `<div class="ct-shares">${[...st.eps].reverse().map((l) => `<button class="ct-ep" data-ep="${l.id}"><img src="assets/art/story-${l.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/bg-stage.webp'"><small>第 ${DAYS().indexOf(l) + 1} 集</small></button>`).join('')}</div>` : '<p class="ct-hint">上完第一集就能分享劇情卡囉！</p>';
      if (shareKind === 'word') body = st.words.length ? `<div class="ct-words">${[...st.words].reverse().slice(0, 60).map((id) => `<button class="ct-wd" data-word="${id}">${wic(WORDS[id])}<b lang="ko">${esc(WORDS[id].ko)}</b><small>${esc(WORDS[id].zh)}</small></button>`).join('')}</div>` : '<p class="ct-hint">學過的單字會出現在這裡</p>';
      if (shareKind === 'gift') body = st.gifts.length ? `<div class="ct-gifts">${st.gifts.map((r) => `<button class="ct-gf" data-gift="${r.day}">${rewardHTML(rewardForDay(r.day))}</button>`).join('')}</div>` : '<p class="ct-hint">每天上完課拿到的收藏可以在這裡分享</p>';
      return tabs + body;
    },
    quiz: () => {
      const st = myStuff();
      if (st.words.length < 3) return '<p class="ct-hint">學會 3 個單字以上，就能出題考朋友！</p>';
      const pick = shuffle(st.words).slice(0, 6);
      return `<p class="ct-hint">選一個字考 ${esc(name)}：看韓文猜中文意思，答對有彩帶！</p><div class="ct-words">${pick.map((id) => `<button class="ct-wd" data-quiz="${id}">${wic(WORDS[id])}<b lang="ko">${esc(WORDS[id].ko)}</b><small>${esc(WORDS[id].zh)}</small></button>`).join('')}</div>
        <div class="row center"><button class="btn small" id="ctReroll">換一批</button></div>`;
    },
  };
  let tab = 'cards';
  const showPanel = () => {
    $panel.innerHTML = panels[tab]();
    $panel.scrollTop = 0;
  };
  const setTab = (name) => {
    tab = name;
    $app.querySelectorAll('.ct-tabs button').forEach((x) => x.classList.toggle('on', x.dataset.tab === name));
    showPanel();
  };
  // ＋：打開／收起抽屜（像 LINE：打字時收起來，按＋再打開）
  const setDrawer = (open) => {
    $drawer.classList.toggle('closed', !open);
    $plus.classList.toggle('on', open);
    $plus.setAttribute('aria-expanded', String(open));
    if (open) $in.blur();
  };
  $plus.onclick = () => setDrawer($drawer.classList.contains('closed'));
  $in.addEventListener('focus', () => setDrawer(false));

  // ───── 打韓文：有字時麥克風變成傳送鍵 ─────
  const KO_CHARS = /^[가-힣ㄱ-ㅎㅏ-ㅣ ?!.,~^♡]*$/;
  const syncInput = () => {
    const v = $in.value;
    const has = v.trim().length > 0;
    $mic.hidden = has;
    $sendBtn.hidden = !has;
    const bad = has && !KO_CHARS.test(v);
    $field.classList.toggle('bad', bad);
    $app.querySelector('#ctKoHint').hidden = !bad;
  };
  $in.addEventListener('input', syncInput);
  $app.querySelector('#ctKo').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $in.value.trim().replace(/\s+/g, ' ');
    if (!v) return;
    if (!KO_ONLY.test(v)) { toast('只能打韓文喔！請切換成韓文鍵盤'); $field.classList.remove('bad'); void $field.offsetWidth; $field.classList.add('bad'); return; }
    sayKo(v);
    send({ t: 'ko', k: '', x: v });
    $in.value = '';
    syncInput();
    // 自己拼出彩蛋字 → 解鎖 SECRET 小卡
    const egg = claimEgg(v);
    if (egg) setTimeout(() => eggPop(egg), 900);
  });

  // ───── 說韓文：按住麥克風說，放開完成，往上滑取消 ─────
  let heard = null; // null／{state:'ok'…}／{state:'bad'…}
  const heardHTML = () => {
    if (!heard) return '';
    if (heard.state === 'bad') return `<div class="ct-heard-card bad"><button type="button" class="ct-x" data-hclose="1" aria-label="關閉">×</button><b>${heard.unsure ? '聽不太清楚，再說一次好嗎？' : heard.why ? esc(heard.why) : '沒聽到韓文喔，再說一次！'}</b>${heard.said ? `<small>聽到：${esc(heard.said)}</small>` : ''}<small>${esc(heard.tip || '要用韓文說喔，靠近麥克風、說慢一點')}</small>${heard.dev ? `<small class="ct-dev">使用的麥克風：${esc(heard.dev)}</small>` : ''}</div>`;
    const nice = heard.snap ? (heard.score >= 0.95 ? '發音超標準！' : '很接近了！幫你對到正確的句子') : '轉成韓文了，確認是你想說的再傳';
    return `<div class="ct-heard-card ${heard.snap ? 'snap' : ''}">
      <span class="ct-heard-tag">${esc(nice)}</span>
      <div class="ct-heard-row">
        <button type="button" class="ct-say" data-hsay="1"><b lang="ko">${esc(heard.ko)}</b>${heard.zh ? `<small>${esc(heard.zh)}</small>` : ''}<span class="ct-spk">${ic('speaker')}</span></button>
        <div class="ct-heard-btns"><button type="button" class="btn small" data-hclose="1">取消</button><button type="button" class="btn small primary" data-hsend="1">傳送</button></div>
      </div>
      ${heard.snap && koKey(heard.said) !== koKey(heard.ko) ? `<small class="ct-heard-said">你說的像是：<span lang="ko">${esc(heard.said)}</span></small>` : ''}
    </div>`;
  };
  const showHeard = () => { $heard.innerHTML = heardHTML(); $heard.hidden = !heard; };
  // 音量計：邊聽邊讓音波跟著聲音跳；順便知道麥克風有沒有收到聲音
  const startMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const an = ac.createAnalyser();
      an.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const m = { peak: 0, dev: stream.getAudioTracks()[0]?.label || '', raf: 0 };
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let v = 0;
        for (const x of buf) v = Math.max(v, Math.abs(x - 128));
        const lv = Math.min(1, v / 48);
        m.peak = Math.max(m.peak, lv);
        const bars = $rec.querySelectorAll('.ct-wave i');
        bars.forEach((el, i) => { el.style.height = `${6 + lv * 22 * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + Date.now() / 110)))}px`; });
        $rec.querySelector('.ct-wave')?.classList.add('live');
        m.raf = requestAnimationFrame(tick);
      };
      tick();
      m.stop = () => { cancelAnimationFrame(m.raf); stream.getTracks().forEach((t) => t.stop()); ac.close().catch(() => {}); };
      return m;
    } catch (e) {
      return { peak: -1, err: e.name, stop() {} };
    }
  };
  // 沒聽到東西時，告訴她是哪裡的問題
  const whyNothing = (meter, err) => {
    if (meter.err === 'NotAllowedError' || err === 'not-allowed' || err === 'service-not-allowed') return { why: '麥克風被封鎖了', tip: '點網址列左邊的圖示 → 麥克風 → 允許，再重新整理頁面' };
    if (meter.err === 'NotFoundError' || err === 'audio-capture') return { why: '找不到麥克風', tip: '請接上麥克風或耳機麥克風，再試一次' };
    if (err === 'network') return { why: '語音辨識連不上網路', tip: 'Chrome 的語音辨識要連到 Google 才能用，檢查一下網路' };
    if (meter.peak >= 0 && meter.peak < 0.04) return { why: '麥克風沒有收到聲音', tip: '可能選錯麥克風或音量是 0：Windows 設定 → 系統 → 音效 → 輸入，選對裝置、把音量調高', dev: meter.dev };
    return { why: '有聽到聲音，但沒聽出韓文', tip: '靠近麥克風、大聲一點、慢慢說', dev: meter.dev };
  };
  // 手機上不開音量計（Android 同時開兩個收音會互搶麥克風）
  const coarse = matchMedia('(pointer: coarse)').matches;
  let hold = null;
  $mic.addEventListener('contextmenu', (e) => e.preventDefault());
  $mic.addEventListener('pointerdown', async (e) => {
    if (e.button > 0 || hold) return;
    e.preventDefault();
    if (!sttOK) { toast('這個瀏覽器不能語音輸入，請用 Chrome 開啟，或用打字'); return; }
    try { $mic.setPointerCapture(e.pointerId); } catch (err) { /* 沒關係 */ }
    $app.querySelector('#ctMicTip')?.remove();
    try { localStorage.setItem(MICTIP_KEY, '1'); } catch (err) { /* 沒關係 */ }
    heard = null;
    showHeard();
    const ctl = {};
    const h = { ctl, y0: e.clientY, cancel: false, t0: Date.now() };
    hold = h;
    $rec.classList.remove('cancel');
    $rec.querySelector('.ct-wave')?.classList.remove('live');
    $recText.textContent = '請說韓文…';
    $recHint.textContent = '說完放開手指・往上滑取消';
    $rec.hidden = false;
    $mic.classList.add('on');
    navigator.vibrate?.(15);
    const meterP = coarse ? Promise.resolve(null) : startMeter();
    let alts = [];
    let err = '';
    try {
      alts = await listenOnce('ko-KR', { maxMs: 15000, ctl, onInterim: (t) => { if (hold === h) $recText.textContent = t || '請說韓文…'; } });
    } catch (e2) { err = e2.message; }
    const meter = (await meterP) || { peak: -1, stop() {} };
    meter.stop();
    if (hold === h) hold = null;
    $rec.hidden = true;
    $mic.classList.remove('on');
    if (my !== session) return;
    if (alts.cancel || h.cancel) { toast('取消了'); return; }
    if (!alts.length && !err && Date.now() - h.t0 < 700) { toast('要「按住」麥克風說話，說完再放開喔'); return; }
    heard = alts.length ? judgeHeard(alts) : { state: 'bad', ...whyNothing(meter, err || alts.err) };
    showHeard();
    if (heard.state === 'ok') sayKo(heard.ko); // 念一次正確的發音給她聽
  });
  $mic.addEventListener('pointermove', (e) => {
    if (!hold) return;
    const c = hold.y0 - e.clientY > 70;
    if (c === hold.cancel) return;
    hold.cancel = c;
    $rec.classList.toggle('cancel', c);
    $recHint.textContent = c ? '放開手指就取消' : '說完放開手指・往上滑取消';
  });
  const release = () => { if (!hold) return; if (hold.cancel) hold.ctl.cancel?.(); else hold.ctl.stop?.(); };
  $mic.addEventListener('pointerup', release);
  $mic.addEventListener('pointercancel', () => { if (hold) { hold.cancel = true; hold.ctl.cancel?.(); } });
  // 鍵盤：在麥克風上按住空白鍵
  $mic.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !hold && !e.repeat) { e.preventDefault(); const r = $mic.getBoundingClientRect(); $mic.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.x, clientY: r.y, bubbles: true })); } });
  $mic.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') release(); });

  // ───── 抽屜、預覽卡的按鈕 ─────
  $bar.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || t === $mic || t === $plus || t === $sendBtn) return;
    const d = t.dataset;
    if (d.tab) { setTab(d.tab); return; }
    if (d.open) { setDrawer(true); setTab(d.open); return; }
    if (d.hsay) { if (heard?.ko) sayKo(heard.ko); pop(t); return; }
    if (d.hclose) { heard = null; showHeard(); return; }
    if (d.hsend) { if (heard?.state === 'ok') { send(heard.msg); heard = null; showHeard(); } return; }
    if (d.g) { group = d.g; showPanel(); return; }
    if (d.pat) { pat = d.pat; const y = $panel.scrollTop; showPanel(); $panel.scrollTop = y; return; }
    if (d.fill) { const k = `${pat}_${d.fill}`; const l = patLine(k); if (l) { sayKo(l.ko); send({ t: 'pat', k }); pop(t); } return; }
    if (d.sk) { shareKind = d.sk; showPanel(); return; }
    if (t.id === 'ctReroll') { showPanel(); return; }
    if (d.card) { sayKo(CARD_BY_ID[d.card].ko); send({ t: 'card', k: d.card }); pop(t); }
    else if (d.lw) { sayKo(WORDS[d.lw].ko); send({ t: 'lw', k: d.lw }); pop(t); }
    else if (d.ls) { const l = lessonLine(d.ls); if (l) sayKo(l.ko); send({ t: 'ls', k: d.ls }); pop(t); }
    else if (d.stk) { send({ t: 'stk', k: d.stk }); pop(t); }
    else if (d.cheer) { send({ t: 'cheer', k: d.cheer }); rain(d.cheer); }
    else if (d.ep) { send({ t: 'ep', k: d.ep }); pop(t); }
    else if (d.word) { send({ t: 'word', k: d.word }); pop(t); }
    else if (d.gift) { send({ t: 'gift', k: String(d.gift) }); pop(t); }
    else if (d.quiz) { send({ t: 'quiz', k: d.quiz }); pop(t); toast(`出題了！等 ${name} 回答`); }
  });
  showPanel();

  // ───── 訊息列表 ─────
  let seenIds = null; // 第一次載入的訊息不播特效，之後新收到的才播
  const answers = new Map(); // quiz 訊息 id → 對方的答案
  const bubble = (m) => {
    const mine = m.f === me;
    const side = mine ? 'me' : 'them';
    let inner = '';
    let cls = '';
    if (m.t === 'card' && CARD_BY_ID[m.k]) { const c = CARD_BY_ID[m.k]; inner = `<button class="ct-say" data-say="${esc(c.ko)}"><b lang="ko">${esc(c.ko)}</b><small>${esc(c.zh)}</small><span class="ct-spk">${ic('speaker')}</span></button>`; }
    else if (m.t === 'lw' && WORDS[m.k]) { const w = WORDS[m.k]; inner = `<button class="ct-say" data-say="${esc(w.ko)}"><b lang="ko">${esc(w.ko)}</b><small>${esc(w.zh)}</small><span class="ct-spk">${ic('speaker')}</span></button>`; cls = 'learned'; }
    else if (m.t === 'pat' && patLine(m.k)) { const l = patLine(m.k); inner = `<button class="ct-say" data-say="${esc(l.ko)}"><b lang="ko">${esc(l.ko)}</b><small>${esc(l.zh)}</small><span class="ct-spk">${ic('speaker')}</span></button>`; cls = 'learned pat'; }
    else if (m.t === 'ls' && lessonLine(m.k)) { const l = lessonLine(m.k); inner = `<button class="ct-say" data-say="${esc(l.ko)}"><b lang="ko">${esc(l.ko)}</b><small>${esc(l.zh)}</small><span class="ct-spk">${ic('speaker')}</span></button>`; cls = 'learned'; }
    else if (m.t === 'ko' && m.x && KO_ONLY.test(m.x)) { inner = `<button class="ct-say" data-say="${esc(m.x)}"><b lang="ko">${esc(m.x)}</b><span class="ct-spk">${ic('speaker')}</span></button>`; cls = 'typed'; }
    else if (m.t === 'stk' && STICKERS.some((x) => x.id === m.k)) { inner = `<img class="ct-big-stk" src="assets/art/icons/mascot-${m.k}.webp" alt="露露貼圖">`; cls = 'stk'; }
    else if (m.t === 'cheer') { const c = CHEERS.find((x) => x.id === m.k) || CHEERS[0]; inner = `<div class="ct-cheer-b" data-say="${esc(c.ko)}"><img src="assets/art/icons/${c.icon}.webp" alt=""><b lang="ko">${esc(c.ko)}</b><small>${esc(c.zh)}</small></div>`; cls = 'cheer'; }
    else if (m.t === 'ep' && LV(m.k)) { const l = LV(m.k); const n = DAYS().indexOf(l) + 1; const watched = store.get().course?.cleared?.[l.id] != null;
      inner = `<div class="ct-share-ep"><img src="assets/art/story-${l.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/bg-stage.webp'"><div><small>${mine ? '我分享了' : '分享了'}劇情卡</small><b>第 ${n} 集・${esc(l.title)}</b>${mine ? '' : `<em>${watched ? '你也看過這集！' : '你還沒看到這集，快追上！'}</em>`}</div></div>`; cls = 'share'; }
    else if (m.t === 'word' && WORDS[m.k]) { const w = WORDS[m.k];
      inner = `<div class="ct-share-wd">${wic(w)}<div><b lang="ko">${esc(w.ko)}</b><span>${esc(w.en)}</span><small>${esc(w.zh)}</small></div><button class="ct-spk2" data-say="${esc(w.ko)}" aria-label="聽發音">${ic('speaker')}</button></div>${mine ? '' : `<button class="btn small ct-keep" data-keep="${esc(m.k)}">收進我的複習</button>`}`; cls = 'share'; }
    else if (m.t === 'gift' && +m.k > 0) { inner = `<div class="ct-gift-b">${rewardHTML(rewardForDay(+m.k))}<small>${mine ? '我' : esc(name)}的收藏・第 ${+m.k} 天</small></div>`; cls = 'gift'; }
    else if (m.t === 'quiz' && WORDS[m.k]) { const w = WORDS[m.k]; const a = answers.get(m.id);
      const head = `<div class="ct-quiz-h">${ic('trophy')}<b>單字對決！</b></div><div class="ct-quiz-q" data-say="${esc(w.ko)}">${wic(w)}<b lang="ko">${esc(w.ko)}</b><small>是什麼意思？</small><span class="ct-spk">${ic('speaker')}</span></div>`;
      if (mine) inner = head + (a ? `<div class="ct-quiz-r ${a.ok ? 'ok' : 'ng'}">${esc(name)} ${a.ok ? '答對了！' : `答錯了，答案是「${esc(w.zh)}」`}</div>` : `<div class="ct-quiz-r">等 ${esc(name)} 回答…</div>`);
      else inner = head + (a ? `<div class="ct-quiz-r ${a.ok ? 'ok' : 'ng'}">${a.ok ? '你答對了！' : `答案是「${esc(w.zh)}」`}</div>` : `<div class="ct-quiz-opts">${quizChoices(m.k, m.id).map((z) => `<button class="ct-opt" data-ans="${esc(m.id)}" data-word="${esc(m.k)}" data-zh="${esc(z)}">${esc(z)}</button>`).join('')}</div>`);
      cls = 'quiz'; }
    else return '';
    return `<div class="ct-msg ${side} ${cls}" data-id="${esc(m.id)}">${mine ? '' : avatar(card.o)}<div class="ct-b">${inner}</div></div>`;
  };
  const time = (at) => new Date(at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  let demoMsgs = [];
  let demoCb = null;
  const demoSend = (m) => { demoMsgs = [...demoMsgs, { id: `m${demoMsgs.length + 1}x`, at: Date.now(), k: '', ...m }]; demoCb?.(demoMsgs); };
  const watch = demo ? (u, cb) => {
    demoCb = cb;
    const w = Object.keys(WORDS);
    demoMsgs = [
      { id: 'a1', f: 'her', t: 'card', k: 'hi1', at: Date.now() - 3600000 },
      { id: 'a2', f: me, t: 'stk', k: 'happy', at: Date.now() - 3500000 },
      { id: 'a3', f: 'her', t: 'ep', k: 'd3', at: Date.now() - 3400000 },
      { id: 'a4', f: me, t: 'lw', k: w[1], at: Date.now() - 3300000 },
      { id: 'a5', f: 'her', t: 'pat', k: `p1_${w.find((id) => isNounish(WORDS[id]))}`, at: Date.now() - 3200000 },
      { id: 'a6', f: 'her', t: 'quiz', k: w[0], at: Date.now() - 3100000 },
      { id: 'a7', f: me, t: 'gift', k: '1', at: Date.now() - 3000000 },
      { id: 'a8', f: 'her', t: 'word', k: w[2], at: Date.now() - 2900000 },
      { id: 'a9', f: 'her', t: 'ko', x: '안녕 ㅋㅋㅋ', k: '', at: Date.now() - 2800000 },
    ];
    setTimeout(() => cb(demoMsgs), 50);
    // 過 2 秒「對方」傳應援，看特效
    setTimeout(() => demoSend({ f: 'her', t: 'cheer', k: 'heart' }), 2000);
    setTimeout(() => demoSend({ f: 'her', t: 'ko', k: '', x: '오늘 공부 같이 하자!' }), 4500);
    return () => { demoCb = null; };
  } : watchMsgs;
  unsub = watch(uid, (msgs) => {
    if (my !== session || !$list.isConnected) return;
    if (!msgs) { $list.innerHTML = '<div class="ct-empty">讀不到訊息，檢查一下網路</div>'; return; }
    answers.clear();
    // 對決答案：k 是「quiz 訊息 id」，答案放在 ok
    for (const m of msgs) if (m.t === 'ans') answers.set(m.k, m);
    const fresh = seenIds ? msgs.filter((m) => !seenIds.has(m.id) && m.f !== me) : [];
    seenIds = new Set(msgs.map((m) => m.id));
    let lastAt = 0;
    const html = msgs.filter((m) => m.t !== 'ans').map((m) => {
      const gap = m.at - lastAt > 30 * 60000 ? `<div class="ct-time">${time(m.at)}</div>` : '';
      lastAt = m.at;
      return gap + bubble(m);
    }).join('');
    const nearBottom = $list.scrollHeight - $list.scrollTop - $list.clientHeight < 160;
    $list.innerHTML = html || `<div class="ct-empty">${avatar(card.o)}<p>跟 ${esc(name)} 打聲招呼吧！</p><button class="btn primary" id="ctHello"><span lang="ko">안녕!</span> 嗨！</button></div>`;
    $list.querySelector('#ctHello')?.addEventListener('click', () => { sayKo('안녕!'); send({ t: 'card', k: 'hi1' }); });
    // 新進來的訊息加上彈出動畫
    for (const m of fresh) $list.querySelector(`.ct-msg[data-id="${CSS.escape(m.id)}"]`)?.classList.add('pop');
    const mineNew = msgs.length && msgs[msgs.length - 1].f === me;
    if (nearBottom || mineNew || !fresh.length) $list.scrollTop = $list.scrollHeight;
    // 收到的特效
    const toSay = [];
    for (const m of fresh) {
      const ko = koOf(m);
      if (ko) toSay.push(ko);
      if (m.t === 'cheer') rain(m.k);
      else if (m.t === 'gift') confetti(40);
      else if (m.t === 'ans' && m.ok) { confetti(50); toast(`${name} 答對了你的單字對決！`); }
      else if (m.t === 'ans') toast(`${name} 答錯了，再考她一次？`);
    }
    if (fresh.length) navigator.vibrate?.(30);
    if (autoSay && toSay.length) (async () => { for (const t of toSay.slice(-3)) { if (my !== session) return; try { await speakAsync(t, 'ko-KR', 0.8); } catch (e) { return; } } })();
    if (!demo) markSeen(cid);
  });

  let lastSay = { key: '', at: 0, slow: false };
  let noKoTold = false;
  $list.onclick = (e) => {
    const say = e.target.closest('[data-say]');
    if (say) {
      const key = `${say.closest('.ct-msg')?.dataset.id}|${say.dataset.say}`;
      const slow = key === lastSay.key && Date.now() - lastSay.at < 6000 && !lastSay.slow;
      lastSay = { key, at: Date.now(), slow };
      try { speak(say.dataset.say, 'ko-KR', slow ? 0.5 : 0.8); } catch (err) { /* 沒有語音 */ }
      // 裝置沒有韓文語音（例如電腦沒裝韓文語言包）：告訴孩子為什麼沒聲音，只提醒一次
      if (!noKoTold && (!ttsOK || (speechSynthesis.getVoices().length && !voiceFor('ko-KR')))) {
        noKoTold = true;
        toast(ttsOK ? '這台裝置沒有韓文語音，請在系統設定加入「韓文」語音後再點一次' : '這個瀏覽器不能念出聲音，換 Chrome、Edge 或 Safari 試試');
      }
      if (slow) flyText(e.clientX, e.clientY - 10, '慢速');
      say.classList.remove('ct-boing'); void say.offsetWidth; say.classList.add('ct-boing');
      return;
    }
    const keep = e.target.closest('[data-keep]');
    if (keep) {
      const s = store.get();
      const L = (s.course.learned ??= {});
      if (L[keep.dataset.keep]) toast('這個字已經在你的複習裡了');
      else { L[keep.dataset.keep] = { lvl: 0, due: store.today() }; store.save(); toast('收進複習了！上課複習時會出現'); }
      keep.disabled = true; keep.textContent = '已收進複習';
      return;
    }
    const opt = e.target.closest('[data-ans]');
    if (opt) {
      const ok = WORDS[opt.dataset.word]?.zh === opt.dataset.zh;
      opt.classList.add(ok ? 'ok' : 'ng');
      opt.parentElement.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      if (ok) { confetti(50); sayKo(WORDS[opt.dataset.word].ko); }
      send({ t: 'ans', k: opt.dataset.ans, ok });
    }
  };
}

// 一則訊息要念的韓文
function koOf(m) {
  if (m.t === 'card') return CARD_BY_ID[m.k]?.ko;
  if (m.t === 'lw') return WORDS[m.k]?.ko;
  if (m.t === 'pat') return patLine(m.k)?.ko;
  if (m.t === 'ls') return lessonLine(m.k)?.ko;
  if (m.t === 'ko') return m.x && KO_ONLY.test(m.x) ? m.x : '';
  if (m.t === 'cheer') return CHEERS.find((x) => x.id === m.k)?.ko;
  if (m.t === 'word' || m.t === 'quiz') return WORDS[m.k]?.ko;
  return '';
}

// 點下去的小彈跳
function pop(el) { el.classList.remove('ct-boing'); void el.offsetWidth; el.classList.add('ct-boing'); }

// 應援：滿畫面掉下圖示
function rain(kind) {
  const c = CHEERS.find((x) => x.id === kind) || CHEERS[0];
  const host = document.createElement('div');
  host.className = 'ct-rain';
  host.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 26; i++) {
    const img = document.createElement('img');
    img.src = `assets/art/icons/${c.icon}.webp`;
    img.style.left = `${Math.random() * 96}%`;
    img.style.animationDelay = `${Math.random() * 1.2}s`;
    img.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
    img.style.setProperty('--r', `${Math.round(Math.random() * 80 - 40)}deg`);
    host.appendChild(img);
  }
  const word = document.createElement('div');
  word.className = 'ct-rain-word';
  word.lang = 'ko';
  word.textContent = c.ko;
  host.appendChild(word);
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 3400);
}

export const stopChat = () => { unsub?.(); unsub = null; session++; };
