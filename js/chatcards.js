// 好友聊天室的「韓文字卡」：只能用這些準備好的句子＋只收韓文字母的打字，沒有自由中英文，小孩之間比較安全
// 每張卡：id（傳到雲端的只有 id）、ko 韓文、zh 中文、en 英文
export const CARD_GROUPS = [
  { id: 'hi', name: '打招呼', icon: 'chat', cards: [
    { id: 'hi1', ko: '안녕!', zh: '嗨！', en: 'Hi!' },
    { id: 'hi2', ko: '반가워!', zh: '很高興見到你！', en: 'Nice to see you!' },
    { id: 'hi3', ko: '좋은 아침!', zh: '早安！', en: 'Good morning!' },
    { id: 'hi4', ko: '잘 지냈어?', zh: '最近好嗎？', en: 'How have you been?' },
    { id: 'hi5', ko: '뭐 해?', zh: '在做什麼？', en: 'What are you doing?' },
    { id: 'hi6', ko: '잘 자!', zh: '晚安！', en: 'Good night!' },
    { id: 'hi7', ko: '내일 봐!', zh: '明天見！', en: 'See you tomorrow!' },
  ] },
  { id: 'cheer', name: '應援', icon: 'heart', cards: [
    { id: 'ch1', ko: '화이팅!', zh: '加油！', en: 'Fighting!' },
    { id: 'ch2', ko: '넌 할 수 있어!', zh: '你做得到！', en: 'You can do it!' },
    { id: 'ch3', ko: '최고야!', zh: '你最棒！', en: "You're the best!" },
    { id: 'ch4', ko: '대박!', zh: '超厲害！', en: 'Awesome!' },
    { id: 'ch5', ko: '수고했어!', zh: '辛苦了！', en: 'Good job!' },
    { id: 'ch6', ko: '멋있어!', zh: '好帥／好酷！', en: 'So cool!' },
    { id: 'ch7', ko: '항상 응원해!', zh: '我一直支持你！', en: "I'm always cheering for you!" },
  ] },
  { id: 'study', name: '一起學', icon: 'book', cards: [
    { id: 'st1', ko: '오늘 공부했어?', zh: '今天讀書了嗎？', en: 'Did you study today?' },
    { id: 'st2', ko: '같이 공부하자!', zh: '一起讀書吧！', en: "Let's study together!" },
    { id: 'st3', ko: '나 오늘 다 했어!', zh: '我今天全部做完了！', en: 'I finished everything today!' },
    { id: 'st4', ko: '이 단어 어려워…', zh: '這個單字好難…', en: 'This word is hard…' },
    { id: 'st5', ko: '내가 알려 줄게!', zh: '我教你！', en: "I'll teach you!" },
    { id: 'st6', ko: '몇 화까지 봤어?', zh: '你看到第幾集了？', en: 'Which episode are you on?' },
    { id: 'st7', ko: '내일 또 하자!', zh: '明天再一起！', en: "Let's do it again tomorrow!" },
  ] },
  { id: 'feel', name: '心情', icon: 'star', cards: [
    { id: 'fe1', ko: '행복해!', zh: '好幸福！', en: "I'm happy!" },
    { id: 'fe2', ko: '신나!', zh: '好興奮！', en: "I'm so excited!" },
    { id: 'fe3', ko: '피곤해…', zh: '好累…', en: "I'm tired…" },
    { id: 'fe4', ko: '배고파!', zh: '肚子好餓！', en: "I'm hungry!" },
    { id: 'fe5', ko: '심심해~', zh: '好無聊～', en: "I'm bored~" },
    { id: 'fe6', ko: '슬퍼…', zh: '好難過…', en: "I'm sad…" },
    { id: 'fe7', ko: '떨려!', zh: '好緊張！', en: "I'm nervous!" },
  ] },
  { id: 'kpop', name: '追星', icon: 'mic', cards: [
    { id: 'kp1', ko: '이 노래 너무 좋아!', zh: '這首歌好好聽！', en: 'I love this song!' },
    { id: 'kp2', ko: '최애가 누구야?', zh: '你的本命是誰？', en: "Who's your bias?" },
    { id: 'kp3', ko: '무대 봤어?', zh: '你看舞台了嗎？', en: 'Did you see the stage?' },
    { id: 'kp4', ko: '같이 춤 연습하자!', zh: '一起練舞吧！', en: "Let's practice dancing!" },
    { id: 'kp5', ko: '컴백 기대돼!', zh: '好期待回歸！', en: "Can't wait for the comeback!" },
    { id: 'kp6', ko: '나도 데뷔하고 싶어!', zh: '我也想出道！', en: 'I want to debut too!' },
  ] },
  { id: 'reply', name: '回覆', icon: 'meme', cards: [
    { id: 're1', ko: '응!', zh: '嗯！', en: 'Yeah!' },
    { id: 're2', ko: '아니~', zh: '不是～', en: 'Nope~' },
    { id: 're3', ko: '고마워!', zh: '謝謝！', en: 'Thanks!' },
    { id: 're4', ko: '미안해…', zh: '對不起…', en: "I'm sorry…" },
    { id: 're5', ko: '진짜?', zh: '真的嗎？', en: 'Really?' },
    { id: 're6', ko: '좋아!', zh: '好啊！', en: 'Okay!' },
    { id: 're7', ko: 'ㅋㅋㅋ', zh: '哈哈哈', en: 'LOL' },
    { id: 're8', ko: '헐!', zh: '天啊！', en: 'OMG!' },
  ] },
];
export const CARD_BY_ID = Object.fromEntries(CARD_GROUPS.flatMap((g) => g.cards.map((c) => [c.id, c])));

// 貼圖：吉祥物露露
export const STICKERS = [
  { id: 'happy', name: '揮手' },
  { id: 'cheer', name: '加油' },
  { id: 'love', name: '比愛心' },
  { id: 'think', name: '想一想' },
  { id: 'sleepy', name: '想睡' },
  { id: 'party', name: '慶祝' },
];

// 應援：滿畫面的特效
export const CHEERS = [
  { id: 'light', name: '應援棒', icon: 'item-lightstick', fx: '🪄', ko: '응원봉 흔들기!', zh: '揮應援棒！' },
  { id: 'heart', name: '愛心雨', icon: 'ui-heart', fx: '💗', ko: '사랑해!', zh: '愛你喔！' },
  { id: 'star', name: '星星雨', icon: 'ui-star', fx: '⭐', ko: '반짝반짝!', zh: '閃閃發光！' },
  { id: 'fire', name: '火力全開', icon: 'ui-fire', fx: '🔥', ko: '불타오르네!', zh: '燃起來了！' },
];

// 自己打字：只收韓文（完整字、子音、母音）和少數符號，最多 40 字
export const KO_ONLY = /^[가-힣ㄱ-ㅎㅏ-ㅣ ?!.,~^♡]{1,40}$/;

// 造句卡：句型＋自己學過的名詞（傳到雲端的只有「句型id_單字id」）
export const PATTERNS = [
  { id: 'p1', ko: '나 ___ 좋아해!', zh: '我喜歡___！' },
  { id: 'p2', ko: '___ 알아?', zh: '你知道___嗎？' },
  { id: 'p3', ko: '오늘 ___ 배웠어!', zh: '我今天學了___！' },
  { id: 'p4', ko: '___ 주세요!', zh: '請給我___！' },
  { id: 'p5', ko: '___ 어디 있어?', zh: '___在哪裡？' },
  { id: 'p6', ko: '___ 진짜 좋아!', zh: '___真的很棒！' },
];
export const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((x) => [x.id, x]));
// 看起來像名詞的字（韓文不是「…다／…요」結尾、沒有空白、不太長）才能填進句型
const NOT_NOUN = new Set(['네', '응', '아니', '같이', '잘', '또', '더', '다', '왜', '어디', '언제', '누구', '뭐', '많이', '조금', '정말', '진짜', '너무', '아주', '빨리', '천천히', '지금', '여기', '거기', '저기', '안', '못', '그리고', '그런데', '하지만', '그래서']);
export const isNounish = (w) => !!w?.ko && !NOT_NOUN.has(w.ko) && !/[다요!?.]$/.test(w.ko) && !/\s/.test(w.ko) && w.ko.length <= 6;

// ───── 語音輸入：把聽到的韓文拆成字母，和準備好的句子比對 ─────
// 只留韓文字母（去掉空白、標點）
export const koKey = (s) => String(s ?? '').replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
// 한 → ㅎ ㅏ ㄴ（用字母比對，發音差一點點也能對到）
export function jamo(s) {
  let out = '';
  for (const ch of koKey(s)) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) { out += ch; continue; }
    out += String.fromCharCode(0x1100 + Math.floor(c / 588), 0x1161 + Math.floor((c % 588) / 28));
    if (c % 28) out += String.fromCharCode(0x11a7 + (c % 28));
  }
  return out;
}
// 相似度 0～1（編輯距離）
export function koSim(a, b) {
  const x = jamo(a); const y = jamo(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[y.length] / Math.max(x.length, y.length);
}
// 辨識結果整理成「只有韓文」：夾了英文、數字、中日文就不算
export function cleanHeard(t) {
  const s = String(t ?? '').trim();
  if (!s || /[A-Za-z0-9\u3040-\u30ff\u3400-\u9fff]/.test(s)) return '';
  const v = s.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ ?!.,~^♡]/g, '').replace(/\s+/g, ' ').trim();
  return /[가-힣]/.test(v) && KO_ONLY.test(v) ? v : '';
}
