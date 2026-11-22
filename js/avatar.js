// 主角（玩家自己）的造型：紙娃娃換裝＋配件＋寵物，跟著上課、完成任務慢慢解鎖；首頁站的是主角
// 紙娃娃：底圖 me-fan.webp（386x1000），每件衣服／配飾都是「同尺寸、只有那一塊有圖」的透明圖層
//   assets/art/doll/<id>.webp（tools/doll-inpaint.py 在底圖上只重畫那一塊 → 位置自動對齊身體）
//   還沒畫好的配飾，先用 icons/item-<id>.webp 小圖貼在身上對應的位置（anchor）
// 整套造型（練習生、出道服、禮服）是另外畫的全身圖，姿勢不同，穿整套時不疊紙娃娃圖層
import * as store from './store.js';
import { esc, ic } from './util.js';
import { DOLL_LAYERS } from './doll-index.js';
import { ACC_IDS, accSVG } from './doll-acc.js';

const cleared = (id) => (s) => !!s.course?.cleared?.[id];
const cert = (id) => (s) => !!s.exam?.certs?.[id];
const tally = (k, n) => (s) => (s.tally?.[k] || 0) >= n; // 小任務累積次數
const sung = (n) => (s) => Object.keys(s.hangul?.sung || {}).length >= n;
const passedH = (n) => (s) => Object.keys(s.hangul?.passed || {}).filter((k) => s.hangul.passed[k]).length >= n;
const streak = (n) => (s) => (s.streak || 0) >= n || (s.best?.streak || 0) >= n;
const learned = (n) => (s) => Object.keys(s.course?.learned || {}).length >= n;

export const DOLL_W = 386;
export const DOLL_H = 1000;
// 部位：疊的順序（z）、衣帽間縮圖要看的範圍（box）、配飾小圖的位置（x, y 中心點與寬 w，單位＝底圖像素）
// 新素體（GPT 畫的，手自然垂下）：頭在 y 40–200、肩膀 y 210、腳底 y 990、右手（畫面右邊）在 (326, 545)
export const SLOTS = {
  shoes: { name: '鞋子', z: 1, box: [0, 800, 386, 1000] },
  bottom: { name: '下身', z: 2, box: [0, 420, 386, 780] },
  top: { name: '上衣', z: 3, box: [6, 170, 380, 580] },
  hairdo: { name: '髮型', z: 3.5, box: [20, 20, 366, 640] },
  neck: { name: '項鍊', z: 4, box: [110, 150, 280, 300], x: 171, y: 225, w: 42 },
  ear: { name: '耳環', z: 5, box: [170, 110, 290, 220], x: 221, y: 155, w: 16 },
  face: { name: '臉頰', z: 5, box: [110, 90, 280, 230], x: 155, y: 181, w: 20 },
  hair: { name: '髮飾', z: 6, box: [50, 30, 260, 190], x: 122, y: 99, w: 42 },
  head: { name: '頭飾', z: 7, box: [50, 0, 320, 210], x: 188, y: 63, w: 128 },
  hand: { name: '手上', z: 8, box: [236, 440, 386, 640], x: 330, y: 550, w: 70 },
};

export const OUTFITS = [
  { id: 'fan', name: '自己搭配', desc: '紙娃娃：上衣、下身、鞋子、配飾自由換', how: '一開始就有', unlock: () => true },
  { id: 'trainee', name: '練習生', desc: '宿舍和練習室的練習服', how: '通過第四章 BOSS（首爾之旅）', unlock: cleared('b4') },
  { id: 'debut', name: '出道舞台裝', desc: '奶茶色＋白色的出道服', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
  { id: 'award', name: '頒獎典禮禮服', desc: '年末頒獎典禮的閃亮禮服', how: '通過第三季最終 BOSS（年末舞台）', unlock: cleared('b16') },
];

// 衣服：每上完一課拿一件（上衣→下身→鞋子輪流），跟著劇情階段換風格：粉絲時期（學生、追星）→ 練習生時期（練習服、宿舍）→ 新人偶像時期（舞台、年末）
// 圖在 assets/art/doll/<id>.webp（tools/art-jobs/doll-clothes.json 畫的）
export const STARTER = { top: 'top-startee', bottom: 'skirt-shorts', shoes: 'shoes-slipon' }; // 入學禮物：一開始就有的第二套
export const PIECES = [
  { id: 'top-startee', slot: 'top', stage: '入學禮物', name: '蜜桃星星T恤', how: '一開始就有', unlock: () => true },
  { id: 'skirt-shorts', slot: 'bottom', stage: '入學禮物', name: '牛仔短褲', how: '一開始就有', unlock: () => true },
  { id: 'shoes-slipon', slot: 'shoes', stage: '入學禮物', name: '紫丁香懶人鞋', how: '一開始就有', unlock: () => true },
  { id: 'top-sailor', slot: 'top', stage: '粉絲時期', name: '水手服上衣', how: '上完第 1 課', unlock: cleared('d1') },
  { id: 'skirt-plaid', slot: 'bottom', stage: '粉絲時期', name: '紅格子百褶裙', how: '上完第 2 課', unlock: cleared('d2') },
  { id: 'shoes-loafer', slot: 'shoes', stage: '粉絲時期', name: '黑色樂福鞋', how: '上完第 3 課', unlock: cleared('d3') },
  { id: 'top-fantee', slot: 'top', stage: '粉絲時期', name: '應援愛心T恤', how: '上完第 4 課', unlock: cleared('d4') },
  { id: 'skirt-denim', slot: 'bottom', stage: '粉絲時期', name: '蕾絲邊短裙', how: '上完第 5 課', unlock: cleared('d5') },
  { id: 'shoes-canvas', slot: 'shoes', stage: '粉絲時期', name: '粉紅鞋帶帆布鞋', how: '上完第 6 課', unlock: cleared('d6') },
  { id: 'top-cardigan', slot: 'top', stage: '粉絲時期', name: '薄荷開襟衫', how: '上完第 7 課', unlock: cleared('d7') },
  { id: 'skirt-flower', slot: 'bottom', stage: '粉絲時期', name: '碎花裙', how: '上完第 8 課', unlock: cleared('d8') },
  { id: 'shoes-mary', slot: 'shoes', stage: '粉絲時期', name: '瑪莉珍鞋', how: '上完第 9 課', unlock: cleared('d9') },
  { id: 'top-stripe', slot: 'top', stage: '粉絲時期', name: '粉紅條紋襯衫', how: '上完第 10 課', unlock: cleared('d10') },
  { id: 'pants-jeans', slot: 'bottom', stage: '粉絲時期', name: '牛仔褲', how: '上完第 11 課', unlock: cleared('d11') },
  { id: 'shoes-rain', slot: 'shoes', stage: '粉絲時期', name: '黃色雨鞋', how: '上完第 12 課', unlock: cleared('d12') },
  { id: 'top-practice', slot: 'top', stage: '練習生時期', name: '練習用大T恤', how: '上完第 13 課', unlock: cleared('d13') },
  { id: 'pants-jogger', slot: 'bottom', stage: '練習生時期', name: '練習用運動褲', how: '上完第 14 課', unlock: cleared('d14') },
  { id: 'shoes-dance', slot: 'shoes', stage: '練習生時期', name: '練舞鞋', how: '上完第 15 課', unlock: cleared('d15') },
  { id: 'top-track', slot: 'top', stage: '練習生時期', name: '粉紅運動外套', how: '上完第 16 課', unlock: cleared('d16') },
  { id: 'pants-black', slot: 'bottom', stage: '練習生時期', name: '黑色練習長褲', how: '上完第 17 課', unlock: cleared('d17') },
  { id: 'shoes-high', slot: 'shoes', stage: '練習生時期', name: '高筒球鞋', how: '上完第 18 課', unlock: cleared('d18') },
  { id: 'top-bear', slot: 'top', stage: '練習生時期', name: '小熊連帽衫', how: '上完第 19 課', unlock: cleared('d19') },
  { id: 'pants-overall', slot: 'bottom', stage: '練習生時期', name: '灰色工裝褲', how: '上完第 20 課', unlock: cleared('d20') },
  { id: 'shoes-slipper', slot: 'shoes', stage: '練習生時期', name: '兔兔室內鞋', how: '上完第 21 課', unlock: cleared('d21') },
  { id: 'top-blazer', slot: 'top', stage: '練習生時期', name: '月末評價外套', how: '上完第 22 課', unlock: cleared('d22') },
  { id: 'skirt-navy', slot: 'bottom', stage: '練習生時期', name: '海軍藍百褶裙', how: '上完第 23 課', unlock: cleared('d23') },
  { id: 'shoes-ballet', slot: 'shoes', stage: '練習生時期', name: '芭蕾平底鞋', how: '上完第 24 課', unlock: cleared('d24') },
  { id: 'top-sweater', slot: 'top', stage: '練習生時期', name: '薰衣草毛衣', how: '上完第 25 課', unlock: cleared('d25') },
  { id: 'pants-wide', slot: 'bottom', stage: '練習生時期', name: '卡其寬褲', how: '上完第 26 課', unlock: cleared('d26') },
  { id: 'shoes-boots', slot: 'shoes', stage: '練習生時期', name: '咖啡長靴', how: '上完第 27 課', unlock: cleared('d27') },
  { id: 'top-denimjk', slot: 'top', stage: '練習生時期', name: '短版牛仔外套', how: '上完第 28 課', unlock: cleared('d28') },
  { id: 'pants-check', slot: 'bottom', stage: '練習生時期', name: '灰色細條紋寬褲', how: '上完第 29 課', unlock: cleared('d29') },
  { id: 'shoes-blue', slot: 'shoes', stage: '練習生時期', name: '水藍復古球鞋', how: '上完第 30 課', unlock: cleared('d30') },
  { id: 'top-sequin', slot: 'top', stage: '新人偶像時期', name: '打歌亮片外套', how: '上完第 31 課', unlock: cleared('d31') },
  { id: 'skirt-silver', slot: 'bottom', stage: '新人偶像時期', name: '打歌亮片裙', how: '上完第 32 課', unlock: cleared('d32') },
  { id: 'shoes-glitter', slot: 'shoes', stage: '新人偶像時期', name: '亮片舞台鞋', how: '上完第 33 課', unlock: cleared('d33') },
  { id: 'top-dotblouse', slot: 'top', stage: '新人偶像時期', name: '海軍藍蕾絲開襟衫', how: '上完第 34 課', unlock: cleared('d34') },
  { id: 'skirt-tulle', slot: 'bottom', stage: '新人偶像時期', name: '粉紅紗裙', how: '上完第 35 課', unlock: cleared('d35') },
  { id: 'shoes-lace', slot: 'shoes', stage: '新人偶像時期', name: '蕾絲白鞋', how: '上完第 36 課', unlock: cleared('d36') },
  { id: 'top-varsity', slot: 'top', stage: '新人偶像時期', name: '簽名會棒球外套', how: '上完第 37 課', unlock: cleared('d37') },
  { id: 'skirt-knit', slot: 'bottom', stage: '新人偶像時期', name: '奶茶色針織裙', how: '上完第 38 課', unlock: cleared('d38') },
  { id: 'shoes-knee', slot: 'shoes', stage: '新人偶像時期', name: '白色長靴', how: '上完第 39 課', unlock: cleared('d39') },
  { id: 'top-hanbok', slot: 'top', stage: '新人偶像時期', name: '韓服上衣', how: '上完第 40 課', unlock: cleared('d40') },
  { id: 'skirt-hanbok', slot: 'bottom', stage: '新人偶像時期', name: '韓服長裙', how: '上完第 41 課', unlock: cleared('d41') },
  { id: 'shoes-flower', slot: 'shoes', stage: '新人偶像時期', name: '韓服繡花鞋', how: '上完第 42 課', unlock: cleared('d42') },
  { id: 'top-puffer', slot: 'top', stage: '新人偶像時期', name: '初雪羽絨外套', how: '上完第 43 課', unlock: cleared('d43') },
  { id: 'pants-white', slot: 'bottom', stage: '新人偶像時期', name: '奶油白寬褲', how: '上完第 44 課', unlock: cleared('d44') },
  { id: 'shoes-snow', slot: 'shoes', stage: '新人偶像時期', name: '毛毛雪靴', how: '上完第 45 課', unlock: cleared('d45') },
  { id: 'top-gown', slot: 'top', stage: '新人偶像時期', name: '頒獎典禮上衣', how: '上完第 46 課', unlock: cleared('d46') },
  { id: 'skirt-lavender', slot: 'bottom', stage: '新人偶像時期', name: '薰衣草長裙', how: '上完第 47 課', unlock: cleared('d47') },
  { id: 'shoes-gold', slot: 'shoes', stage: '新人偶像時期', name: '金色禮服鞋', how: '上完第 48 課', unlock: cleared('d48') },
  // 白色・米色系：學會越多單字拿越多
  { id: 'top-whiteblouse', slot: 'top', stage: '白色系', name: '白色泡泡袖蕾絲領上衣', how: '學會 20 個單字', unlock: learned(20) },
  { id: 'shoes-whitemary', slot: 'shoes', stage: '白色系', name: '白色瑪莉珍鞋', how: '學會 40 個單字', unlock: learned(40) },
  { id: 'skirt-tennis', slot: 'bottom', stage: '白色系', name: '白色百褶網球裙', how: '學會 60 個單字', unlock: learned(60) },
  { id: 'top-whitecable', slot: 'top', stage: '白色系', name: '白色麻花針織外套', how: '學會 80 個單字', unlock: learned(80) },
  { id: 'shoes-whiteloafer', slot: 'shoes', stage: '白色系', name: '白色厚底樂福鞋', how: '學會 100 個單字', unlock: learned(100) },
  { id: 'pants-whitejeans', slot: 'bottom', stage: '白色系', name: '白色直筒牛仔褲', how: '學會 120 個單字', unlock: learned(120) },
  { id: 'top-boa', slot: 'top', stage: '白色系', name: '白色刷毛外套', how: '學會 160 個單字', unlock: learned(160) },
  { id: 'shoes-whiteboots', slot: 'shoes', stage: '白色系', name: '白色短靴', how: '學會 200 個單字', unlock: learned(200) },
  { id: 'skirt-eyelet', slot: 'bottom', stage: '白色系', name: '白色洞洞蕾絲長裙', how: '學會 250 個單字', unlock: learned(250) },
  { id: 'top-whitestage', slot: 'top', stage: '白色系', name: '全白舞台外套', how: '學會 300 個單字', unlock: learned(300) },
  { id: 'shoes-pearl', slot: 'shoes', stage: '白色系', name: '珍珠帶鞋', how: '學會 350 個單字', unlock: learned(350) },
  { id: 'top-trench', slot: 'top', stage: '白色系', name: '米色短版風衣', how: '學會 400 個單字', unlock: learned(400) },
  { id: 'shoes-beigeflat', slot: 'shoes', stage: '白色系', name: '米色麂皮平底鞋', how: '學會 450 個單字', unlock: learned(450) },
  { id: 'skirt-cord', slot: 'bottom', stage: '白色系', name: '米色燈芯絨短裙', how: '學會 500 個單字', unlock: learned(500) },
  // 街舞系：領任務獎勵、開寶箱、連續打卡
  { id: 'top-hiphoodie', slot: 'top', stage: '街舞系', name: '街舞大帽T', how: '領 3 次任務獎勵', unlock: tally('claim', 3) },
  { id: 'shoes-court', slot: 'shoes', stage: '街舞系', name: '街舞厚底高筒鞋', how: '領 5 次任務獎勵', unlock: tally('claim', 5) },
  { id: 'pants-barrel', slot: 'bottom', stage: '街舞系', name: '彎刀褲', how: '領 8 次任務獎勵', unlock: tally('claim', 8) },
  { id: 'top-graphic', slot: 'top', stage: '街舞系', name: '街舞大T', how: '領 12 次任務獎勵', unlock: tally('claim', 12) },
  { id: 'shoes-silver', slot: 'shoes', stage: '街舞系', name: '銀色老爹鞋', how: '領 16 次任務獎勵', unlock: tally('claim', 16) },
  { id: 'pants-baggy', slot: 'bottom', stage: '街舞系', name: '街舞降落傘褲', how: '領 20 次任務獎勵', unlock: tally('claim', 20) },
  { id: 'top-vest', slot: 'top', stage: '街舞系', name: '工裝背心疊穿', how: '領 25 次任務獎勵', unlock: tally('claim', 25) },
  { id: 'shoes-blackhigh', slot: 'shoes', stage: '街舞系', name: '黑色厚底高筒鞋', how: '領 30 次任務獎勵', unlock: tally('claim', 30) },
  { id: 'top-offshoulder', slot: 'top', stage: '街舞系', name: '露肩大學T', how: '連續打卡 5 天', unlock: streak(5) },
  { id: 'pants-widejeans', slot: 'bottom', stage: '街舞系', name: '寬版牛仔褲', how: '開 5 次每日寶箱', unlock: tally('chest', 5) },
  { id: 'top-crop', slot: 'top', stage: '街舞系', name: '短版街舞T', how: '開 7 次每日寶箱', unlock: tally('chest', 7) },
  { id: 'shoes-pinkchunky', slot: 'shoes', stage: '街舞系', name: '粉紅老爹鞋', how: '連續打卡 10 天', unlock: streak(10) },
  { id: 'shoes-platform', slot: 'shoes', stage: '街舞系', name: '白色厚底鞋', how: '開 12 次每日寶箱', unlock: tally('chest', 12) },
  { id: 'top-cropzip', slot: 'top', stage: '街舞系', name: '短版拉鍊帽T', how: '連續打卡 14 天', unlock: streak(14) },
  { id: 'pants-camo', slot: 'bottom', stage: '街舞系', name: '迷彩工裝寬褲', how: '開 15 次每日寶箱', unlock: tally('chest', 15) },
  { id: 'shoes-checker', slot: 'shoes', stage: '街舞系', name: '棋盤格懶人鞋', how: '開 20 次每日寶箱', unlock: tally('chest', 20) },
  // 白色街舞：再厲害一點才拿得到
  { id: 'top-whitecrop', slot: 'top', stage: '白色街舞', name: '白色短版T', how: '領 40 次任務獎勵', unlock: tally('claim', 40) },
  { id: 'pants-whitepara', slot: 'bottom', stage: '白色街舞', name: '白色降落傘褲', how: '連續打卡 21 天', unlock: streak(21) },
  { id: 'shoes-silverchunky', slot: 'shoes', stage: '白色街舞', name: '白銀厚底鞋', how: '領 50 次任務獎勵', unlock: tally('claim', 50) },
  { id: 'top-whitehood', slot: 'top', stage: '白色街舞', name: '白色寬版帽T', how: '開 25 次每日寶箱', unlock: tally('chest', 25) },
  { id: 'pants-whitecargo', slot: 'bottom', stage: '白色街舞', name: '米白工裝寬褲', how: '連續打卡 30 天', unlock: streak(30) },
  { id: 'shoes-whitehigh', slot: 'shoes', stage: '白色街舞', name: '白色高筒鞋', how: '領 60 次任務獎勵', unlock: tally('claim', 60) },
];

// 髮型庫：預設長直髮；玩家自己在衣帽間「髮型」挑，App 不會自動幫她換
// 每款兩層：hair-x.webp（蓋在肩膀、胸前，畫在衣服上面）＋ hair-x-back.webp（身體外面、背後，畫在身體下面）
export const DEFAULT_HAIR = 'hair-long';
export const HAIRS = [
  { id: 'hair-long', slot: 'hairdo', name: '長直髮', how: '一開始就有', unlock: () => true },
  { id: 'hair-layer', slot: 'hairdo', name: '修臉層次長髮', how: '一開始就有', unlock: () => true },
  { id: 'hair-pony', slot: 'hairdo', name: '高馬尾', how: '一開始就有', unlock: () => true },
  { id: 'hair-twin', slot: 'hairdo', name: '雙馬尾', how: '一開始就有', unlock: () => true },
  { id: 'hair-braid', slot: 'hairdo', name: '麻花辮', how: '連續打卡 3 天', unlock: streak(3) },
  { id: 'hair-buns', slot: 'hairdo', name: '丸子頭', how: '開 3 次每日寶箱', unlock: tally('chest', 3) },
  { id: 'hair-halfup', slot: 'hairdo', name: '公主頭', how: '上完第 10 課', unlock: cleared('d10') },
  { id: 'hair-ccurl', slot: 'hairdo', name: 'C字內彎鮑伯', how: '學會 30 個單字', unlock: learned(30) },
  { id: 'hair-wave', slot: 'hairdo', name: '慵懶水波紋', how: '學會 100 個單字', unlock: learned(100) },
  { id: 'hair-hush', slot: 'hairdo', name: 'Hush 層次中長髮', how: '連續打卡 7 天', unlock: streak(7) },
];

// 配飾：小任務的獎勵（領任務獎勵、開寶箱、唱 40 音、連續打卡…），和劇情裡的紀念配件
export const ITEMS = [
  // 劇情配件（原本就有）
  { id: 'starclip', slot: 'hair', emoji: '⭐', name: '星星髮夾', how: '通過第一章 BOSS', unlock: cleared('b1') },
  { id: 'ribbon', slot: 'hair', emoji: '🎀', name: '出道緞帶', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
  { id: 'headset', slot: 'head', emoji: '🎧', name: '練習耳麥', how: '看完第 14 天「再跳一次」', unlock: cleared('d14') },
  { id: 'crown', slot: 'head', emoji: '👑', name: '認證皇冠', how: '拿到「英文 Lv1・國小畢業級」認證', unlock: cert('en300') },
  { id: 'moon', slot: 'ear', emoji: '🌙', name: '露娜同款月亮耳環', how: '拿到「韓文 Lv1」認證', unlock: cert('ko100') },
  { id: 'lightstick', slot: 'hand', emoji: '🪄', name: 'NOVA 應援棒', how: '看完第 4 天「NOVA 上台了」', unlock: cleared('d4') },
  { id: 'photocard', slot: 'hand', emoji: '🃏', name: '露娜小卡', how: '看完第 6 天「你的本命是誰」', unlock: cleared('d6') },
  { id: 'trophy', slot: 'hand', emoji: '🏆', name: '一位獎盃', how: '看完第 36 天「第一個一位」', unlock: cleared('d36') },
  // 小任務獎勵
  { id: 'heartclip', slot: 'hair', emoji: '💗', name: '愛心髮夾', how: '領 1 次任務獎勵', unlock: tally('claim', 1) },
  { id: 'bunnyclip', slot: 'hair', emoji: '🐰', name: '兔兔髮夾', how: '領 10 次任務獎勵', unlock: tally('claim', 10) },
  { id: 'flowerclip', slot: 'hair', emoji: '🌸', name: '櫻花髮夾', how: '領 30 次任務獎勵', unlock: tally('claim', 30) },
  { id: 'catband', slot: 'head', emoji: '🐱', name: '貓耳髮箍', how: '連續打卡 3 天', unlock: streak(3) },
  { id: 'beret', slot: 'head', emoji: '🧢', name: '奶茶色貝雷帽', how: '連續打卡 7 天', unlock: streak(7) },
  { id: 'pearl', slot: 'ear', emoji: '⚪', name: '珍珠耳環', how: '唱完第 1 首 40 音歌', unlock: sung(1) },
  { id: 'starear', slot: 'ear', emoji: '✨', name: '星星耳環', how: '40 音過 2 關', unlock: passedH(2) },
  { id: 'notelace', slot: 'neck', emoji: '🎵', name: '音符項鍊', how: '唱完全部 4 首 40 音歌', unlock: sung(4) },
  { id: 'choker', slot: 'neck', emoji: '🎀', name: '緞帶頸鍊', how: '開 3 次每日寶箱', unlock: tally('chest', 3) },
  { id: 'heartlace', slot: 'neck', emoji: '💝', name: '愛心項鍊', how: '開 10 次每日寶箱', unlock: tally('chest', 10) },
  { id: 'mic', slot: 'hand', emoji: '🎤', name: '粉紅麥克風', how: '唱完 2 首 40 音歌', unlock: sung(2) },
  { id: 'cheek', slot: 'face', emoji: '💕', name: '臉頰愛心貼紙', how: '學會 50 個單字', unlock: learned(50) },
  { id: 'cheekstar', slot: 'face', emoji: '⭐', name: '臉頰星星貼紙', how: '學會 150 個單字', unlock: learned(150) },
];

// 寵物＝吉祥物露露（露娜的小貓化身）：跟著劇情解鎖不同姿勢，在衣帽間挑一個陪在身邊
export const MASCOT_POSES = [
  { id: 'happy', name: '開心揮手', how: '一開始就有', unlock: () => true },
  { id: 'cheer', name: '應援加油', how: '看完第 4 天「NOVA 上台了」', unlock: cleared('d4') },
  { id: 'love', name: '尾巴比愛心', how: '看完第 6 天「你的本命是誰」', unlock: cleared('d6') },
  { id: 'think', name: '歪頭思考', how: '通過第一章 BOSS', unlock: cleared('b1') },
  { id: 'sleepy', name: '想睡覺', how: '看完第 16 天「早上六點」', unlock: cleared('d16') },
  { id: 'party', name: '撒彩帶慶祝', how: '看完第 30 天「出道舞台」', unlock: cleared('d30') },
];

const ALL = () => [...OUTFITS, ...PIECES.filter(hasArt), ...ITEMS.filter(hasArt), ...HAIRS.filter(hasArt), ...MASCOT_POSES.map((m) => ({ ...m, id: `m-${m.id}` }))];
const byId = (id) => PIECES.find((x) => x.id === id) || ITEMS.find((x) => x.id === id) || HAIRS.find((x) => x.id === id);

export function avatarState() {
  const s = store.get();
  s.avatar ??= { outfit: 'fan', mascot: 'happy', seen: [] };
  const a = s.avatar;
  a.mascot ??= 'happy';
  a.seen ??= [];
  a.wear ??= {};
  // 舊版只有一個配件欄位 acc → 搬到對應部位
  if (a.acc) { const it = ITEMS.find((x) => x.id === a.acc); if (it) a.wear[it.slot] = it.id; delete a.acc; }
  // 一開始就給兩套可以替換：搭配 1＝原本那套、搭配 2＝入學禮物（不算「新獲得」、不自動換上）
  if (!a.starter) {
    a.looks ??= [];
    if (!a.looks[0]) a.looks[0] = {};
    if (!a.looks[1]) a.looks[1] = { ...STARTER };
    a.seen.push(...Object.values(STARTER));
    a.autoWorn = [...(a.autoWorn || []), ...Object.values(STARTER)];
    a.starter = 1;
  }
  // 換成新素體（白背心＋白短褲）那一版：舊素體會自動穿粉紅連帽衣、白裙，新的沒有 → 空著的部位一次補上入學禮物那套
  if (!a.dollV2) {
    for (const [slot, id] of Object.entries(STARTER)) a.wear[slot] ??= id;
    a.dollV2 = 1;
  }
  return a;
}
// 試穿模式（#/closet/try）：給家長驗證用，全部衣服都能穿、不會保存、不影響「新獲得」
let tryMode = false;
let trySt = null;
const syncTry = () => { tryMode = location.hash === '#/closet/try'; if (!tryMode) trySt = null; };
syncTry();
window.addEventListener('hashchange', syncTry);
export const isUnlocked = (x) => { if (tryMode) return true; try { return !!x.unlock(store.get()); } catch (e) { return false; } };
// 劇情進度到哪，預設就穿哪一套（沒自己換過的話）
export function autoOutfit() {
  const got = OUTFITS.filter(isUnlocked);
  return got[got.length - 1].id;
}
// 新解鎖、還沒看過的東西
export function newUnlocks() {
  const a = avatarState();
  // 劇情解鎖新的整套造型（還沒看過）時，自動換上，讓首頁的角色跟著劇情變身
  const freshOutfit = [...OUTFITS].reverse().find((o) => o.id !== 'fan' && isUnlocked(o) && !a.seen.includes(o.id));
  if (freshOutfit && a.autoDressed !== freshOutfit.id) { a.outfit = freshOutfit.id; a.autoDressed = freshOutfit.id; store.save(); }
  // 新拿到的衣服、配飾：自動穿上（換回紙娃娃），一回首頁就看得到獎勵穿在身上（髮型不會自動換，只在「髮型」分類亮 NEW）
  const freshPiece = [...PIECES, ...ITEMS].find((x) => hasArt(x) && isUnlocked(x) && !a.seen.includes(x.id) && !(a.autoWorn || []).includes(x.id));
  if (freshPiece) {
    a.autoWorn = [...(a.autoWorn || []), freshPiece.id];
    a.wear[freshPiece.slot] = freshPiece.id;
    a.outfit = 'fan';
    store.save();
  }
  return ALL().filter((x) => isUnlocked(x) && x.id !== 'fan' && x.id !== 'm-happy' && !a.seen.includes(x.id));
}
export function markSeen() {
  const a = avatarState();
  for (const x of ALL()) if (isUnlocked(x) && !a.seen.includes(x.id)) a.seen.push(x.id);
  store.save();
}

export const itemIcon = (it, cls = '') => `<img class="item-ic ${cls}" src="assets/art/doll/acc/${it.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/icons/item-${it.id}.webp'">`;
export const mascotImg = (mood = 'happy', cls = '') => `<img class="mascot ${cls}" src="assets/art/icons/mascot-${mood}.webp" alt="吉祥物露露" onerror="this.remove()">`;

// 已經畫好紙娃娃圖層的 id（tools/doll-layer.py 產生 doll-index.js；沒有的配飾用小圖貼在 anchor 上）
const LAYERS = new Set(DOLL_LAYERS);

// 一件東西在紙娃娃上的樣子（SVG 座標＝底圖像素）
function layerSVG(it) {
  const sl = SLOTS[it.slot];
  if (LAYERS.has(it.id)) return `<image href="assets/art/doll/${it.id}.webp" x="0" y="0" width="${DOLL_W}" height="${DOLL_H}"/>`;
  if (ACCS.has(it.id)) return accSVG(it.id);
  if (sl.x == null) return '';
  const w = sl.w;
  return `<image href="assets/art/icons/item-${it.id}.webp" x="${sl.x - w / 2}" y="${sl.y - w / 2}" width="${w}" height="${w}" class="doll-ic"/>`;
}
// 紙娃娃 SVG：box＝只看某一塊（衣帽間縮圖用）；wear＝要穿的東西（預設＝目前穿的）
// trust＝別人的造型（好友）：不用看「我」有沒有解鎖
export function dollSVG({ wear = avatarState().wear, box = null, cls = 'me-outfit me-doll', alt = '我的角色', trust = false } = {}) {
  const vb = box ? `${box[0]} ${box[1]} ${box[2] - box[0]} ${box[3] - box[1]}` : `0 0 ${DOLL_W} ${DOLL_H}`;
  const items = Object.values(wear || {}).map(byId).filter((x) => x && hasArt(x) && (trust || isUnlocked(x)));
  // 素體＝白背心、白短褲、白襪子：沒穿的部位就是這樣。頭髮一定有：沒選就是長直髮
  if (!items.some((x) => x.slot === 'hairdo')) items.push(HAIRS[0]);
  items.sort((p, q) => SLOTS[p.slot].z - SLOTS[q.slot].z);
  const hair = items.find((x) => x.slot === 'hairdo');
  const full = (src) => `<image href="assets/art/doll/${src}.webp" x="0" y="0" width="${DOLL_W}" height="${DOLL_H}"/>`;
  return `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${esc(alt)}">
    ${full(`${hair.id}-back`)}${full('body')}${items.map(layerSVG).join('')}</svg>`;
}

// ───────── 造型代碼：頭像、好友卡、聊天室都用「現在穿的樣子」 ─────────
// 代碼＝整套造型 id（trainee…），或 'fan:' ＋ 紙娃娃身上每一件的 id（逗號隔開）
// 好友卡、雲端好友卡都放在原本的 o 欄位（舊版 App 讀到看不懂的代碼就當「自己搭配」，不會壞）
export const HEAD_BOX = [80, 28, 266, 214]; // 頭像（圓形大頭）
export const BUST_BOX = [64, 22, 278, 282]; // 半身（聊天室、加好友）
export const CARD_BOX = [26, 14, 346, 404]; // 練習生證照片
const SET_W = { fan: 386, trainee: 310, debut: 384, award: 470 }; // 整套造型圖的寬（高都是 1000）
export function lookCode() {
  const a = avatarState();
  const o = OUTFITS.find((x) => x.id === a.outfit && isUnlocked(x)) ? a.outfit : autoOutfit();
  const pet = MASCOT_POSES.find((m) => m.id === a.mascot && isUnlocked(m)) ? a.mascot : 'happy';
  const ids = o === 'fan' ? Object.values(a.wear || {}).filter((id) => { const x = byId(id); return x && hasArt(x) && isUnlocked(x); }) : [];
  return `${o !== 'fan' ? o : ids.length ? `fan:${ids.join(',')}` : 'fan'}|m:${pet}`;
}
// 代碼 → { o: 整套 id 或 fan, wear: 身上的東西, mascot: 寵物姿勢 }
export function parseLook(code) {
  const [main, ...rest] = String(code || '').slice(0, 400).split('|');
  const pet = rest.find((r) => r.startsWith('m:'))?.slice(2);
  const mascot = MASCOT_POSES.some((m) => m.id === pet) ? pet : 'happy';
  if (OUTFITS.some((o) => o.id === main)) return { o: main, wear: {}, mascot };
  const wear = {};
  if (main.startsWith('fan:')) for (const id of main.slice(4).split(',').slice(0, 12)) { const x = byId(id); if (x) wear[x.slot] = x.id; }
  return { o: 'fan', wear, mascot };
}
// 外面來的代碼整理過再存（只留認得的 id）
export const normLook = (code) => {
  const { o, wear, mascot } = parseLook(code);
  const ids = Object.values(wear);
  return `${o !== 'fan' ? o : ids.length ? `fan:${ids.join(',')}` : 'fan'}|m:${mascot}`;
};
// 照造型代碼畫出角色（box＝只看某一塊：頭像、半身）
export function lookSVG(code, { box = null, cls = 'look-svg', alt = '' } = {}) {
  const { o, wear } = parseLook(code);
  if (o === 'fan') return dollSVG({ wear, box, cls, alt, trust: true });
  const vb = box ? `${box[0]} ${box[1]} ${box[2] - box[0]} ${box[3] - box[1]}` : `0 0 ${DOLL_W} ${DOLL_H}`;
  const w = SET_W[o] || DOLL_W;
  return `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMin slice" role="img" aria-label="${esc(alt)}"><image href="assets/art/me-${o}.webp" x="${(DOLL_W - w) / 2}" y="0" width="${w}" height="${DOLL_H}"/></svg>`;
}
export const myLookSVG = (opt) => lookSVG(lookCode(), opt);

// 主角立繪（含紙娃娃圖層、寵物）；首頁和衣帽間共用
export function avatarHTML() {
  const a = avatarState();
  const o = OUTFITS.find((x) => x.id === a.outfit && isUnlocked(x)) ? a.outfit : autoOutfit();
  const mood = MASCOT_POSES.find((m) => m.id === a.mascot && isUnlocked(m)) ? a.mascot : 'happy';
  const body = o === 'fan' ? dollSVG() : `<img class="me-outfit" src="assets/art/me-${o}.webp" alt="我的角色" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'">`;
  return `${body}<span class="me-mascot">${mascotImg(mood)}</span>`;
}

// ───────── 衣帽間（換裝遊戲版面）：房間背景＋角色站中間、右邊直排分類鈕、點分類滑出衣服抽屜 ─────────
// 分類：上衣／下著／鞋子／髮飾（髮夾＋頭飾）／飾品（耳環、項鍊、臉頰）／手持／整套／寵物
const CATS = [
  { id: 'top', name: '上衣', slots: ['top'] },
  { id: 'bottom', name: '下著', slots: ['bottom'] },
  { id: 'shoes', name: '鞋子', slots: ['shoes'] },
  { id: 'hairdo', name: '髮型', slots: ['hairdo'] },
  { id: 'hair', name: '髮飾', slots: ['hair', 'head'] },
  { id: 'jewel', name: '飾品', slots: ['ear', 'neck', 'face'] },
  { id: 'hand', name: '手持', slots: ['hand'] },
  { id: 'set', name: '整套' },
  { id: 'pet', name: '寵物' },
];
// 還沒畫好圖的衣服／配飾先不顯示（有紙娃娃圖層，或有舊的小圖示才列出來）
const ICONED = new Set(['starclip', 'ribbon', 'headset', 'crown', 'moon', 'lightstick', 'photocard', 'trophy']);
const ACCS = new Set(ACC_IDS);
const hasArt = (x) => LAYERS.has(x.id) || ACCS.has(x.id) || ICONED.has(x.id);
const itemsOf = (cat) => [...PIECES, ...ITEMS, ...HAIRS].filter((x) => cat.slots.includes(x.slot) && hasArt(x));
let cat = 'top';
let drawer = true;
export function renderCloset($app, backBar) {
  syncTry();
  const TRY = tryMode;
  const a = TRY ? (trySt ??= JSON.parse(JSON.stringify(avatarState()))) : avatarState();
  if (!OUTFITS.find((x) => x.id === a.outfit && isUnlocked(x))) a.outfit = autoOutfit();
  a.looks ??= [];
  const fresh = new Set(TRY ? [] : newUnlocks().map((x) => x.id));
  if (!TRY) markSeen();
  const C = CATS.find((c) => c.id === cat) || CATS[0];
  const tile = (x, kind) => {
    const on = isUnlocked(x);
    const eq = kind === 'set' ? a.outfit === x.id : kind === 'pet' ? a.mascot === x.id : a.outfit === 'fan' && (a.wear[x.slot] || (x.slot === 'hairdo' ? DEFAULT_HAIR : '')) === x.id;
    const pic = kind === 'set'
      ? (x.id === 'fan' ? dollSVG({ cls: 'cl-outfit' }) : `<img class="cl-outfit" src="assets/art/me-${x.id}.webp" alt="" onerror="this.onerror=null;this.src='assets/art/sprite-me.webp'">`)
      : kind === 'pet' ? mascotImg(x.id, 'big')
        : dollSVG({ wear: { [x.slot]: x.id }, box: SLOTS[x.slot].box, cls: 'cl-doll', alt: x.name });
    const key = kind === 'pet' ? `m-${x.id}` : x.id;
    return `<button type="button" class="dr-item ${on ? '' : 'locked'} ${eq ? 'on' : ''}" data-kind="${kind}" data-id="${x.id}" ${on ? '' : 'disabled'} aria-label="${esc(x.name)}${on ? '' : `（${esc(x.how)}）`}">
      ${fresh.has(key) ? '<span class="pz-new">NEW</span>' : ''}${eq ? '<span class="cl-on">✓</span>' : ''}
      <span class="dr-pic">${on ? pic : `${ic('lock')}`}</span><b>${esc(x.name)}</b>${on ? '' : `<small>${esc(x.how)}</small>`}</button>`;
  };
  // 衣服依劇情階段分組（粉絲時期 → 練習生時期 → 新人偶像時期），每組前面一張階段標籤
  let lastStage = '';
  const list = C.id === 'set' ? OUTFITS.map((x) => tile(x, 'set')) : C.id === 'pet' ? MASCOT_POSES.map((x) => tile(x, 'pet'))
    : itemsOf(C).map((x) => {
      const head = x.stage && x.stage !== lastStage ? `<span class="dr-stage">${esc(x.stage)}</span>` : '';
      lastStage = x.stage || lastStage;
      return head + tile(x, 'item');
    });
  const catIcon = (c) => `<img class="dr-cat-pic" src="assets/art/icons/dr-${c.id}.webp" alt="">`;
  const catNew = (c) => (c.id === 'set' ? OUTFITS : c.id === 'pet' ? MASCOT_POSES.map((m) => ({ ...m, id: `m-${m.id}` })) : itemsOf(c)).some((x) => fresh.has(x.id));
  const got = (c) => { const arr = c.id === 'set' ? OUTFITS : c.id === 'pet' ? MASCOT_POSES : itemsOf(c); return `${arr.filter(isUnlocked).length}/${arr.length}`; };
  $app.innerHTML = `
    <section class="dress">
      <div class="dress-bg" aria-hidden="true"></div>
      <header class="dress-top">
        <a class="dress-back" href="#/home" aria-label="回首頁">‹</a>
        <b class="dress-title"><img class="ic" src="assets/art/icons/dr-set.webp" alt="">衣帽間</b>
        ${TRY ? '<span class="dress-try">試穿模式・不會保存</span>' : ''}
      </header>
      <div class="dress-stage me-stage">${TRY ? (a.outfit === 'fan' ? dollSVG({ wear: a.wear }) : `<img class="me-outfit" src="assets/art/me-${a.outfit}.webp" alt="">`) : avatarHTML()}</div>
      <div class="dress-left">
        ${a.outfit === 'fan' ? `<button type="button" class="dress-tool" id="clReset"><img class="ic" src="assets/art/icons/dr-undress.webp" alt=""><small>全部脫掉</small></button>` : ''}
        ${[0, 1, 2].map((k) => `<button type="button" class="dress-tool look ${a.looks[k] ? 'has' : ''}" data-look="${k}" aria-label="我的搭配 ${k + 1}">${a.looks[k] ? dollSVG({ wear: a.looks[k], box: [40, 0, 346, 1000], cls: 'look-pic', alt: '' }) : ic('heart')}<small>搭配 ${k + 1}</small></button>`).join('')}
      </div>
      <nav class="dress-cats" aria-label="分類">
        ${CATS.map((c) => `<button type="button" class="dr-cat ${c.id === cat ? 'on' : ''}" data-cat="${c.id}" aria-pressed="${c.id === cat}">
          <span class="dr-cat-ic">${catIcon(c)}${catNew(c) ? '<i class="dr-dot"></i>' : ''}</span><b>${c.name}</b><small>${got(c)}</small></button>`).join('')}
      </nav>
      <div class="dress-drawer ${drawer ? 'open' : ''}">
        <div class="dr-head"><b>${C.name}</b><button type="button" class="dr-close" id="drClose" aria-label="收起來">›</button></div>
        <div class="dr-grid">${list.join('') || '<p class="dr-empty">上完課就會拿到新衣服！</p>'}</div>
      </div>
      ${a.outfit === 'fan' ? `<button type="button" class="dress-save" id="lookSave">${ic('heart')}保存搭配</button>` : '<p class="dress-tip">穿整套造型時不能疊配飾，點「整套 → 自己搭配」回到紙娃娃</p>'}
    </section>`;
  const again = () => renderCloset($app, backBar);
  $app.querySelectorAll('.dr-cat').forEach((b) => b.onclick = () => { drawer = !(b.dataset.cat === cat && drawer); cat = b.dataset.cat; again(); });
  $app.querySelector('#drClose').onclick = () => { drawer = false; again(); };
  $app.querySelector('#clReset')?.addEventListener('click', () => { a.wear = a.wear.hairdo ? { hairdo: a.wear.hairdo } : {}; store.save(); again(); }); // 頭髮不算衣服：脫衣服不會換髮型
  // 我的搭配：保存目前的穿搭到空格（三格都滿就蓋掉第一格），點一下就換上
  $app.querySelector('#lookSave')?.addEventListener('click', () => {
    let k = a.looks.findIndex((x) => !x); if (k < 0) k = a.looks.length < 3 ? a.looks.length : 0;
    a.looks[k] = { ...a.wear }; store.save(); again();
  });
  $app.querySelectorAll('[data-look]').forEach((b) => b.onclick = () => {
    const l = a.looks[+b.dataset.look]; if (!l) return;
    a.outfit = 'fan'; a.wear = { ...l }; store.save(); again();
  });
  $app.querySelectorAll('.dr-item:not(.locked)').forEach((b) => b.onclick = () => {
    const { kind, id } = b.dataset;
    if (kind === 'set') a.outfit = id;
    else if (kind === 'pet') a.mascot = id;
    else {
      const it = byId(id);
      a.outfit = 'fan';
      if (b.classList.contains('on')) delete a.wear[it.slot]; // 穿著的再點一次就脫下來
      else a.wear[it.slot] = id;
    }
    store.save();
    again();
  });
}
