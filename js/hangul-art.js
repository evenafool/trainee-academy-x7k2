// 40 音圖像記憶（給台灣小孩）：字母一筆一筆畫出來，再「變身」成注音聯想的小圖
//   子音：圖的中文名稱第一個注音＝這個子音（門＝ㄇ、杯＝ㄅ、傘＝ㄙ…）
//   母音：站著的人ㅣ、平平的地ㅡ，多一橫＝加「一」，ㅗㅜ開頭＝先念ㄨ
// 座標都在 0～100 的方格裡，viewBox 留邊給小圖

// 每個字母的筆畫（照書寫順序）
const S = {
  'ㅣ': ['M60 12V88'],
  'ㅏ': ['M60 12V88', 'M60 50H82'],
  'ㅑ': ['M60 12V88', 'M60 37H82', 'M60 63H82'],
  'ㅓ': ['M38 50H60', 'M60 12V88'],
  'ㅕ': ['M38 37H60', 'M38 63H60', 'M60 12V88'],
  'ㅡ': ['M12 60H88'],
  'ㅗ': ['M50 46V70', 'M12 70H88'],
  'ㅛ': ['M37 46V70', 'M63 46V70', 'M12 70H88'],
  'ㅜ': ['M12 40H88', 'M50 40V66'],
  'ㅠ': ['M12 40H88', 'M37 40V66', 'M63 40V66'],
  'ㅐ': ['M42 12V88', 'M42 50H62', 'M74 12V88'],
  'ㅒ': ['M42 12V88', 'M42 37H62', 'M42 63H62', 'M74 12V88'],
  'ㅔ': ['M26 50H46', 'M46 12V88', 'M74 12V88'],
  'ㅖ': ['M26 37H46', 'M26 63H46', 'M46 12V88', 'M74 12V88'],
  'ㅘ': ['M32 54V72', 'M8 72H56', 'M68 12V88', 'M68 50H86'],
  'ㅙ': ['M28 54V72', 'M6 72H50', 'M60 12V88', 'M60 50H74', 'M84 12V88'],
  'ㅚ': ['M32 54V72', 'M8 72H56', 'M72 12V88'],
  'ㅝ': ['M8 40H48', 'M28 40V62', 'M56 58H72', 'M72 12V88'],
  'ㅞ': ['M6 40H40', 'M23 40V62', 'M46 58H60', 'M60 12V88', 'M84 12V88'],
  'ㅟ': ['M8 40H56', 'M32 40V62', 'M72 12V88'],
  'ㅢ': ['M8 64H56', 'M72 12V88'],
  'ㄱ': ['M18 22H78V84'],
  'ㄴ': ['M24 18V78H84'],
  'ㄷ': ['M80 20H22V80H80'],
  'ㄹ': ['M20 16H78V48H22V82H82'],
  'ㅁ': ['M22 20V80', 'M22 20H78V80', 'M22 80H78'],
  'ㅂ': ['M24 14V84', 'M76 14V84', 'M24 48H76', 'M24 84H76'],
  'ㅅ': ['M50 16L16 84', 'M43 34L84 84'],
  'ㅇ': ['M50 22A30 30 0 1 0 50.1 22'],
  'ㅈ': ['M20 24H80', 'M50 24L18 88', 'M44 44L84 88'],
  'ㅊ': ['M50 4V15', 'M20 24H80', 'M50 24L18 88', 'M44 44L84 88'],
  'ㅋ': ['M18 22H78V84', 'M22 52H78'],
  'ㅌ': ['M80 20H22V80H80', 'M22 50H76'],
  'ㅍ': ['M16 20H84', 'M36 20V80', 'M64 20V80', 'M16 80H84'],
  'ㅎ': ['M50 4V15', 'M24 24H76', 'M50 42A21 21 0 1 0 50.1 42'],
  'ㄲ': ['M8 22H44V84', 'M54 22H90V84'],
  'ㄸ': ['M44 20H10V80H44', 'M90 20H56V80H90'],
  'ㅃ': ['M8 14V84', 'M44 14V84', 'M8 48H44', 'M8 84H44', 'M56 14V84', 'M92 14V84', 'M56 48H92', 'M56 84H92'],
  'ㅆ': ['M30 18L8 84', 'M25 36L46 84', 'M72 18L50 84', 'M67 36L92 84'],
  'ㅉ': ['M6 20H44', 'M25 20L6 84', 'M21 40L46 84', 'M56 20H94', 'M75 20L54 84', 'M71 40L94 84'],
};
export const VOWELS = new Set('ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ');

// 小圖零件
const head = (x = 60) => `<circle class="df skin" cx="${x}" cy="0" r="9"/><circle class="df eye" cx="${x - 3}" cy="-1" r="1.3"/><circle class="df eye" cx="${x + 3}" cy="-1" r="1.3"/>`;
const bub = (t, side = 'r') => { const x = side === 'r' ? 70 : -10; const w = t.length > 2 ? 44 : t.length > 1 ? 36 : 28; return `<g class="bub"><rect x="${x}" y="-11" width="${w}" height="22" rx="11"/><text x="${x + w / 2}" y="5">${t}</text></g>`; };
const puff = '<g class="puff"><circle cx="98" cy="44" r="6"/><circle cx="106" cy="34" r="4"/><circle cx="108" cy="52" r="3.5"/></g>';
const burst = '<g class="burst"><path d="M50-10V-2M18-6l5 6M82-6l-5 6M-8 50h8M100 50h8"/></g>';
const spark = (x, y) => `<path class="spk" d="M${x} ${y - 7}L${x + 2} ${y - 2}L${x + 7} ${y}L${x + 2} ${y + 2}L${x} ${y + 7}L${x - 2} ${y + 2}L${x - 7} ${y}L${x - 2} ${y - 2}Z"/>`;

// 每個字母：短短的記法（卡片上）＋小圖
export const PICS = {
  'ㅏ': { label: '伸手喊「啊」', art: head() + bub('啊') },
  'ㅑ': { label: '多一橫＝加「一」', art: spark(90, 37) + spark(90, 63) + bub('呀') },
  'ㅓ': { label: '指自己「ㄛ」', art: head() + bub('ㄛ', 'l') },
  'ㅕ': { label: '多一橫＝加「一」', art: spark(30, 37) + spark(30, 63) + bub('一ㄛ', 'l') },
  'ㅗ': { label: '朝上嘟嘴「喔」', art: '<circle class="dl lips" cx="50" cy="34" r="7"/>' + bub('喔') },
  'ㅛ': { label: '多一橫＝加「一」', art: spark(37, 36) + spark(63, 36) + bub('唷') },
  'ㅜ': { label: '朝下嘟嘴「嗚」', art: '<circle class="dl lips" cx="50" cy="78" r="7"/>' + bub('嗚') },
  'ㅠ': { label: '多一橫＝加「一」', art: spark(37, 78) + spark(63, 78) + bub('一ㄨ') },
  'ㅡ': { label: '平平的地平線', art: '<path class="sun" d="M34 60A16 16 0 0 1 66 60Z"/><path class="ray" d="M50 34V28M30 42l-5-4M70 42l5-4"/>' },
  'ㅣ': { label: '站得直直的人', art: head() + bub('一') },
  'ㄱ': { label: '拐杖＝ㄍ', art: '<path class="dl wood" d="M18 22Q6 22 6 34"/><rect class="df dark" x="72" y="84" width="12" height="9" rx="3"/>' },
  'ㄴ': { label: '椅子：「你」坐＝ㄋ', art: '<rect class="df cushion" x="30" y="64" width="50" height="11" rx="5"/><path class="dl wood" d="M28 80V96M80 80V96"/>' },
  'ㄷ': { label: '袋子倒糖果＝ㄉ', art: '<circle class="df c1" cx="90" cy="42" r="5"/><circle class="df c2" cx="99" cy="58" r="5"/><circle class="df c3" cx="88" cy="70" r="4"/>' },
  'ㄹ': { label: '彎彎的小路＝ㄌ', art: '<path class="road" d="M20 16H78V48H22V82H82"/><circle class="df car" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M20 16H78V48H22V82H82"/></circle>' },
  'ㅁ': { label: '一扇門＝ㄇ', art: '<path class="dl roof" d="M14 20L50 4L86 20"/><circle class="df knob" cx="66" cy="52" r="4.5"/>' },
  'ㅂ': { label: '杯子＝ㄅ', art: '<rect class="df drink" x="29" y="54" width="42" height="25" rx="2"/><path class="dl cupH" d="M76 32Q96 32 96 48Q96 64 76 64"/><path class="dl steam" d="M40 6q-6-6 0-12M58 6q-6-6 0-12"/>' },
  'ㅅ': { label: '撐開的傘＝ㄙ', art: '<path class="dl canopy" d="M16 84Q33 72 50 84Q67 72 84 84"/><path class="dl wood" d="M50 16V94q0 8-8 8"/>' },
  'ㅇ': { label: '空位泡泡（開頭不出聲）', art: '<g><circle class="ring" cx="50" cy="52" r="42"/></g>' + spark(88, 18) + spark(14, 86) },
  'ㅈ': { label: '戴帽子走路＝ㄗ', art: '<circle class="df skin" cx="50" cy="8" r="8"/><path class="dl move" d="M0 52H10M-4 64H6"/>' },
  'ㅊ': { label: 'ㅈ＋一筆＝吹一口氣', art: puff },
  'ㅋ': { label: 'ㄱ＋一筆＝吹一口氣', art: puff },
  'ㅌ': { label: 'ㄷ＋一筆＝吹一口氣', art: puff },
  'ㅍ': { label: 'ㅂ的吹氣兄弟', art: puff },
  'ㅎ': { label: '戴帽子哈氣＝ㄏ', art: '<circle class="df eye" cx="43" cy="60" r="2.5"/><circle class="df eye" cx="57" cy="60" r="2.5"/><path class="dl mouth" d="M44 69Q50 75 56 69"/>' + puff },
  'ㄲ': { label: 'ㄱ寫兩次＝用力', art: burst },
  'ㄸ': { label: 'ㄷ寫兩次＝用力', art: burst },
  'ㅃ': { label: 'ㅂ寫兩次＝用力', art: burst },
  'ㅆ': { label: 'ㅅ寫兩次＝用力', art: burst },
  'ㅉ': { label: 'ㅈ寫兩次＝用力', art: burst },
  'ㅐ': { label: 'ㅏ＋ㅣ＝ㄝ', art: bub('ㄝ') },
  'ㅒ': { label: '多一橫＝「耶」', art: spark(30, 50) + bub('耶') },
  'ㅔ': { label: 'ㅓ＋ㅣ＝ㄝ', art: bub('ㄝ') },
  'ㅖ': { label: '多一橫＝「耶」', art: spark(14, 50) + bub('耶') },
  'ㅘ': { label: 'ㅗ＋ㅏ＝「哇」', art: bub('哇') },
  'ㅙ': { label: 'ㅗ＋ㅐ＝ㄨㄝ', art: bub('ㄨㄝ') },
  'ㅚ': { label: 'ㅗ＋ㅣ＝ㄨㄝ', art: bub('ㄨㄝ') },
  'ㅝ': { label: 'ㅜ＋ㅓ＝「窩」', art: bub('窩') },
  'ㅞ': { label: 'ㅜ＋ㅔ＝ㄨㄝ', art: bub('ㄨㄝ') },
  'ㅟ': { label: 'ㅜ＋ㅣ＝「威」', art: bub('威') },
  'ㅢ': { label: 'ㅡ滑到ㅣ', art: '<path class="dl slide" d="M20 52Q48 30 66 22"/>' + bub('ㄜ一') },
};

// 老師帶念時用中文講的記法（較完整）
export const HOOKS = {
  'ㅏ': '站著的人往外伸手，喊「啊」，嘴巴張大', 'ㅑ': 'ㅏ 多一橫，前面就加「一」', 'ㅓ': '伸手指自己，念「ㄛ」，嘴巴張開不要嘟', 'ㅕ': 'ㅓ 多一橫，前面就加「一」',
  'ㅗ': '短槓朝上，嘴巴嘟成圓圓的「喔」', 'ㅛ': 'ㅗ 多一橫，前面就加「一」', 'ㅜ': '短槓朝下，嘴巴嘟向前「嗚」', 'ㅠ': 'ㅜ 多一橫，前面就加「一」',
  'ㅡ': '平平的地平線，嘴角往兩邊拉平', 'ㅣ': '站得直直的人，念「一」',
  'ㄱ': '像拐杖的把手，拐杖的拐', 'ㄴ': '像一張椅子，請你坐下，你的你', 'ㄷ': '像開口的袋子，袋子的袋', 'ㄹ': '彎彎曲曲的小路，路的路',
  'ㅁ': '方方的一扇門，門的門', 'ㅂ': '像一個杯子，杯子的杯', 'ㅅ': '像撐開的雨傘，傘的傘', 'ㅇ': '圓圈是空位，放在開頭不出聲',
  'ㅈ': '像戴帽子邁開腿在走路，走路的走', 'ㅊ': 'ㅈ 多一筆，要多吹一口氣', 'ㅋ': 'ㄱ 多一筆，要多吹一口氣', 'ㅌ': 'ㄷ 多一筆，要多吹一口氣',
  'ㅍ': 'ㅂ 的吹氣兄弟，要多吹一口氣', 'ㅎ': 'ㅇ 戴上帽子在哈氣，哈的哈',
  'ㄲ': 'ㄱ 寫兩次，喉嚨用力', 'ㄸ': 'ㄷ 寫兩次，喉嚨用力', 'ㅃ': 'ㅂ 寫兩次，喉嚨用力', 'ㅆ': 'ㅅ 寫兩次，喉嚨用力', 'ㅉ': 'ㅈ 寫兩次，喉嚨用力',
  'ㅐ': 'ㅏ 加 ㅣ 黏在一起，念「ㄝ」', 'ㅒ': 'ㅐ 多一橫，念「耶」', 'ㅔ': 'ㅓ 加 ㅣ 黏在一起，也念「ㄝ」', 'ㅖ': 'ㅔ 多一橫，念「耶」',
  'ㅘ': 'ㅗ 在前面先嘟嘴，ㄨ 加 ㄚ，哇', 'ㅙ': 'ㅗ 加 ㅐ，念ㄨㄝ', 'ㅚ': 'ㅗ 加 ㅣ，也念ㄨㄝ', 'ㅝ': 'ㅜ 在前面先嘟嘴，ㄨ 加 ㄛ',
  'ㅞ': 'ㅜ 加 ㅔ，也念ㄨㄝ', 'ㅟ': 'ㅜ 加 ㅣ，像「威」', 'ㅢ': 'ㅡ 拉平，再滑到 ㅣ',
};

// 四個祕密規則（每關一個，用變身動畫呈現）
export const SECRETS = {
  v1: { no: 1, title: '多一橫，前面加「一」', op: '＋一橫', pairs: [['ㅏ', 'ㅑ'], ['ㅓ', 'ㅕ'], ['ㅗ', 'ㅛ'], ['ㅜ', 'ㅠ']],
    facts: [['ㅣ', '母音都是「站著的人 ㅣ」「平平的地 ㅡ」加短短一槓拼出來的'], ['ㅏ', '短槓朝外、朝上：嘴巴打開（ㅏ ㅗ）；朝內、朝下：聲音收回來（ㅓ ㅜ）'], ['ㅇ', '母音不能自己站：前面加不出聲的 ㅇ，寫成 아、어、오']],
    say: '第一個祕密：母音多一橫，前面就多一個「一」的音。' },
  c1: { no: 2, title: '多一筆，多吹一口氣', op: '＋一筆', pairs: [['ㄱ', 'ㅋ'], ['ㄷ', 'ㅌ'], ['ㅈ', 'ㅊ'], ['ㅇ', 'ㅎ'], ['ㅂ', 'ㅍ']],
    facts: [['ㅁ', '用注音記：圖的名字第一個音就是它——門ㄇ、杯ㄅ、傘ㄙ、路ㄌ、袋ㄉ'], ['ㅋ', '衛生紙實驗：衛生紙放嘴巴前念 카 타 파 차，衛生紙會被吹動！'], ['ㄴ', '字的形狀就是嘴巴的樣子：ㅁ 像閉起來的嘴，ㄴ 像舌尖頂住上排牙齒']],
    say: '第二個祕密：子音多一筆，就要多吹一口氣。拿一張衛生紙放在嘴巴前面試試看！' },
  c2: { no: 3, title: '寫兩次，喉嚨用力', op: '寫兩次', pairs: [['ㄱ', 'ㄲ'], ['ㄷ', 'ㄸ'], ['ㅂ', 'ㅃ'], ['ㅅ', 'ㅆ'], ['ㅈ', 'ㅉ']],
    facts: [['ㄲ', '只有 ㄱ ㄷ ㅂ ㅅ ㅈ 五個有雙胞胎'], ['ㅃ', '衛生紙實驗：念 까 따 빠 衛生紙幾乎不動，跟 카 타 파 剛好相反'], ['ㄱ', '三兄弟一起比：가 普通、카 吹氣、까 用力']],
    say: '第三個祕密：子音寫兩次，就是喉嚨用力、短短的念。' },
  v2: { no: 4, title: '兩個母音黏在一起', op: '', pairs: [['ㅏ', 'ㅐ', '＋ㅣ'], ['ㅗ', 'ㅘ', '＋ㅏ'], ['ㅜ', 'ㅝ', '＋ㅓ'], ['ㅐ', 'ㅒ', '＋一橫']],
    facts: [['ㅘ', 'ㅗ、ㅜ 放前面＝先嘟嘴念「ㄨ」：와＝ㄨㄚ、워＝ㄨㄛ'], ['ㅗ', '配對規則：ㅗ 只跟 ㅏ 家族，ㅜ 只跟 ㅓ 家族（朝上配朝外、朝下配朝內）'], ['ㅚ', '三胞胎：ㅙ ㅚ ㅞ 都念「ㄨㄝ」'], ['ㅔ', 'ㅐ 和 ㅔ 現在聽起來一樣，靠單字記：개 狗、게 螃蟹']],
    say: '第四個祕密：兩個母音可以黏在一起。ㅗ 和 ㅜ 在前面，就先嘟嘴念「ㄨ」。' },
};

// 中文講解裡的字母換成念得出來的音節（ㄱ→가、ㅏ→아、ㅇ→이응）
const INIT = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const MED = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
export const spoken = (t) => String(t).replace(/[ㄱ-ㅣ]/g, (ch) => {
  if (ch === 'ㅇ') return '이응';
  const c = INIT.indexOf(ch); if (c >= 0) return String.fromCharCode(0xac00 + c * 588);
  const v = MED.indexOf(ch); if (v >= 0) return String.fromCharCode(0xac00 + 11 * 588 + v * 28);
  return ch;
});

const kind = (ch) => (VOWELS.has(ch) ? 'v' : 'c');
const strokes = (ch) => S[ch] || [];
const paths = (list, cls, start = 0) => list.map((d, i) => `<path class="${cls}" pathLength="1" style="--i:${start + i}" d="${d}"/>`).join('');

// 字母＋小圖（加 play class 時：一筆一筆畫出來，再跳出小圖）
export function letterSVG(ch, { decor = true, delay = 0 } = {}) {
  const st = strokes(ch);
  const p = PICS[ch];
  return `<svg class="hga ${kind(ch)}" viewBox="-14 -14 128 128" style="--n:${st.length};--d:${delay}s" aria-hidden="true">${paths(st, 'lt')}${decor && p ? `<g class="dc">${p.art}</g>` : ''}</svg>`;
}

// 變身：from 的筆畫留著的留著、不要的淡出，新的筆畫用亮色畫上去
export function morphSVG(from, to, delay = 0) {
  const a = strokes(from);
  const b = strokes(to);
  const keep = b.filter((d) => a.includes(d));
  const out = a.filter((d) => !b.includes(d));
  const add = b.filter((d) => !a.includes(d));
  return `<svg class="hgm ${kind(to)}" viewBox="-14 -14 128 128" style="--d:${delay}s" aria-hidden="true">${paths(keep, 'keep')}${paths(out, 'out')}${paths(add, 'in')}</svg>`;
}
