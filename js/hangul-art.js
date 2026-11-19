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
  'ㅎ': ['M50 -8V2', 'M24 11H76', 'M50 22A30 30 0 1 0 50.1 22'],
  'ㄲ': ['M8 22H44V84', 'M54 22H90V84'],
  'ㄸ': ['M44 20H10V80H44', 'M90 20H56V80H90'],
  'ㅃ': ['M8 14V84', 'M44 14V84', 'M8 48H44', 'M8 84H44', 'M56 14V84', 'M92 14V84', 'M56 48H92', 'M56 84H92'],
  'ㅆ': ['M30 18L8 84', 'M25 36L46 84', 'M72 18L50 84', 'M67 36L92 84'],
  'ㅉ': ['M6 20H44', 'M25 20L6 84', 'M21 40L46 84', 'M56 20H94', 'M75 20L54 84', 'M71 40L94 84'],
};
export const VOWELS = new Set('ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ');

// 小圖零件
const head = (x = 60) => `<g><circle class="df skin" cx="${x}" cy="0" r="9"/><path class="df hair" d="M${x - 10} 1A10 10 0 0 1 ${x + 10} 1Q${x + 4} -5 ${x} -3Q${x - 5} -6 ${x - 10} 1Z"/><circle class="df eye" cx="${x - 3}" cy="1" r="1.4"/><circle class="df eye" cx="${x + 3}" cy="1" r="1.4"/><circle class="df blush" cx="${x - 6}" cy="4" r="1.8"/><circle class="df blush" cx="${x + 6}" cy="4" r="1.8"/></g>`;
// 右上角的小對話框拿掉了（小字看不清楚），讀音只寫在卡片下方
const bub = () => '';
const puff = '<g class="puff"><circle cx="98" cy="44" r="6"/><circle cx="106" cy="34" r="4"/><circle cx="108" cy="52" r="3.5"/></g>';
const burst = '<g class="burst"><path d="M50-10V-2M18-6l5 6M82-6l-5 6M-8 50h8M100 50h8"/></g>';
const spark = (x, y) => `<path class="spk" d="M${x} ${y - 7}L${x + 2} ${y - 2}L${x + 7} ${y}L${x + 2} ${y + 2}L${x} ${y + 7}L${x - 2} ${y + 2}L${x - 7} ${y}L${x - 2} ${y - 2}Z"/>`;

// 淡淡的大字疊在後面（真的長得像的符號）
const ghost = (t, cls = '') => `<text class="ghost ${cls}" x="50" y="90">${t}</text>`;

// 每個字母的記法：真的像什麼才用圖；不像的就用「家族邏輯」（基本款 → 加筆畫 → 寫兩次 → 組合）
export const PICS = {
  // 基本母音：看短槓在哪一邊
  'ㅏ': { label: '短槓在右邊 → a', art: spark(92, 50) },
  'ㅑ': { label: 'ㅏ 多一槓 → 加 y：ya', art: spark(92, 37) + spark(92, 63) },
  'ㅓ': { label: '短槓在左邊 → eo', art: spark(28, 50) },
  'ㅕ': { label: 'ㅓ 多一槓 → 加 y：yeo', art: spark(28, 37) + spark(28, 63) },
  'ㅗ': { label: '短槓在上面 → o', art: spark(50, 30) },
  'ㅛ': { label: 'ㅗ 多一槓 → 加 y：yo', art: spark(37, 34) + spark(63, 34) },
  'ㅜ': { label: '短槓在下面 → u', art: spark(50, 80) },
  'ㅠ': { label: 'ㅜ 多一槓 → 加 y：yu', art: spark(37, 78) + spark(63, 78) },
  'ㅡ': { label: '一條橫線＝嘴巴拉平：eu', art: '<circle class="face" cx="50" cy="50" r="46"/><circle class="df eye" cx="34" cy="34" r="4"/><circle class="df eye" cx="66" cy="34" r="4"/><circle class="df blush" cx="16" cy="48" r="6"/><circle class="df blush" cx="84" cy="48" r="6"/><path class="dl pull" d="M2 60h-8M98 60h8"/>' },
  'ㅣ': { label: '一條直線，像英文 I：i', under: ghost('I', 'serif') },
  // 五個基本子音：照發音時嘴巴、舌頭的樣子畫出來
  'ㄱ': { label: '基本款：舌根往上擋 → g／k', art: '' },
  'ㄴ': { label: '基本款：舌尖頂上排牙齒 → n', art: '' },
  'ㅁ': { label: '基本款：就是「口」，閉嘴念 m', under: '<rect class="df lipsF" x="22" y="20" width="56" height="60"/>' },
  'ㅅ': { label: '基本款：像牙齒／雨傘，傘＝s', under: '<path class="df umbF" d="M50 16L16 84Q33 72 50 84Q67 72 84 84Z"/><circle class="df dot" cx="40" cy="62" r="3"/><circle class="df dot" cx="58" cy="50" r="3"/><circle class="df dot" cx="64" cy="70" r="3"/>' },
  'ㅇ': { label: '基本款：圓圈＝喉嚨，開頭不出聲', under: '<circle class="df bubF" cx="50" cy="52" r="30"/><path class="df shine" d="M36 40a16 16 0 0 1 10-8a3 3 0 0 1 1 5a11 11 0 0 0-7 6a3 3 0 0 1-4-3z"/>' },
  // 從基本款加筆畫變出來的
  'ㄷ': { label: 'ㄴ 加蓋子 → d／t', art: spark(50, 10) },
  'ㄹ': { label: '像彎彎的路 → r／l', art: '<path class="road" d="M20 16H78V48H22V82H82"/><circle class="df car" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M20 16H78V48H22V82H82"/></circle>' },
  'ㅂ': { label: 'ㅁ 長出兩根 → b／p', art: spark(24, 8) + spark(76, 8) },
  'ㅈ': { label: 'ㅅ 加一橫 → j', art: spark(50, 14) },
  // 再加一筆＝多吹一口氣
  'ㅋ': { label: 'ㄱ 多一筆＝吹氣：k', art: puff },
  'ㅌ': { label: 'ㄷ 多一筆＝吹氣：t', art: puff },
  'ㅍ': { label: 'ㅂ 的吹氣兄弟：p，長得像 π', under: ghost('π', 'serif'), art: puff },
  'ㅊ': { label: 'ㅈ 戴帽子＝吹氣：ch', art: puff },
  'ㅎ': { label: 'ㅇ 戴帽子＝哈氣：h', art: puff },
  // 雙子音：寫兩次＝喉嚨用力
  'ㄲ': { label: 'ㄱ 寫兩次＝用力：kk', art: burst },
  'ㄸ': { label: 'ㄷ 寫兩次＝用力：tt', art: burst },
  'ㅃ': { label: 'ㅂ 寫兩次＝用力：pp', art: burst },
  'ㅆ': { label: 'ㅅ 寫兩次＝用力：ss', art: burst },
  'ㅉ': { label: 'ㅈ 寫兩次＝用力：jj', art: burst },
  // 複合母音：兩個母音黏起來，快快連著念
  'ㅐ': { label: 'ㅏ＋ㅣ → ae', art: '' },
  'ㅒ': { label: 'ㅐ 多一槓 → 加 y：yae', art: spark(30, 50) },
  'ㅔ': { label: 'ㅓ＋ㅣ → e，跟 ㅐ 一樣', art: '' },
  'ㅖ': { label: 'ㅔ 多一槓 → 加 y：ye', art: spark(14, 50) },
  'ㅘ': { label: 'ㅗ＋ㅏ 快念 → wa', art: '' },
  'ㅙ': { label: 'ㅗ＋ㅐ 快念 → wae', art: '' },
  'ㅚ': { label: 'ㅗ＋ㅣ → 念 we，要特別記', art: '' },
  'ㅝ': { label: 'ㅜ＋ㅓ 快念 → wo', art: '' },
  'ㅞ': { label: 'ㅜ＋ㅔ 快念 → we', art: '' },
  'ㅟ': { label: 'ㅜ＋ㅣ 快念 → wi', art: '' },
  'ㅢ': { label: 'ㅡ＋ㅣ 快念 → ui', art: '<path class="dl slide" d="M20 52Q48 30 66 22"/>' },
};

// 四個祕密規則（每關一個，用變身動畫呈現）
export const SECRETS = {
  v1: { no: 1, title: '多一橫，前面加「一」', op: '＋一橫', pairs: [['ㅏ', 'ㅑ'], ['ㅓ', 'ㅕ'], ['ㅗ', 'ㅛ'], ['ㅜ', 'ㅠ']],
    facts: [['ㅣ', '母音都是「直線 ㅣ」或「橫線 ㅡ」加短槓拼出來的：短槓在哪邊就念什麼'], ['ㅏ', '短槓朝外、朝上：嘴巴打開（ㅏ ㅗ）；朝內、朝下：聲音收回來（ㅓ ㅜ）'], ['ㅇ', '母音不能自己站：前面加不出聲的 ㅇ，寫成 아、어、오']],
    say: '第一個祕密：母音多一橫，前面就多一個「一」的音。' },
  c1: { no: 2, title: '多一筆，多吹一口氣', op: '＋一筆', pairs: [['ㄱ', 'ㅋ'], ['ㄷ', 'ㅌ'], ['ㅈ', 'ㅊ'], ['ㅇ', 'ㅎ']],
    facts: [['ㅁ', '子音只有五個基本款：ㄱ ㄴ ㅁ ㅅ ㅇ，其他都是從它們加筆畫變出來的'], ['ㅍ', 'ㅍ 是 ㅂ 的吹氣兄弟（ㄅ→ㄆ），長得不像，要特別記'], ['ㅋ', '衛生紙實驗：衛生紙放嘴巴前念 카 타 파 차，衛生紙會被吹動！'], ['ㅋ', 'ㅋㅋㅋ 是韓國人打字的「哈哈哈」，ㅎㅎ 是「呵呵」']],
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
  return `<svg class="hga ${kind(ch)}" viewBox="-14 -14 128 128" style="--n:${st.length};--d:${delay}s" aria-hidden="true">${decor && p?.under ? `<g class="dc">${p.under}</g>` : ''}${paths(st, 'lt')}${decor && p?.art ? `<g class="dc">${p.art}</g>` : ''}</svg>`;
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
