// 紙娃娃配飾：ChatGPT 畫的配件貼紙（assets/art/doll/acc/<id>.webp，tools/doll-acc-cut.py 切的），疊在身上對應的位置
// 座標＝底圖像素（386x1000）。x, y＝定位點；at＝定位點在圖的哪裡（c 中心、t 上緣中間、b 下緣中間）；w＝寬；r＝旋轉角度
// 不用 AI 在身上重畫：小東西 AI 會連旁邊的頭髮、衣服一起改，換別件衣服就穿幫
import { ACC_RATIO } from './doll-acc-size.js';

const PLACE = {
  // 髮夾：左邊瀏海上（頭往右上歪大約 12 度）
  starclip: { x: 116, y: 68, w: 40, r: -30 },
  heartclip: { x: 116, y: 68, w: 40, r: -30 },
  bunnyclip: { x: 116, y: 64, w: 38, r: -22 },
  flowerclip: { x: 116, y: 66, w: 40, r: -25 },
  ribbon: { x: 112, y: 54, w: 52, r: -18 },
  // 頭飾：戴在頭頂
  catband: { x: 170, y: 40, w: 150, r: -12 },
  headset: { x: 170, y: 72, w: 144, r: -12 },
  crown: { x: 170, y: 18, w: 72, r: -12 },
  beret: { x: 182, y: 22, w: 132, r: -10 },
  // 耳環：右耳垂往下掛
  moon: { x: 226, y: 121, w: 13, at: 't' },
  pearl: { x: 226, y: 121, w: 11, at: 't' },
  starear: { x: 226, y: 121, w: 14, at: 't' },
  // 項鍊：繞過脖子
  notelace: { x: 187, y: 180, w: 44, at: 't' },
  choker: { x: 187, y: 177, w: 42, at: 't', r: -4 },
  heartlace: { x: 187, y: 180, w: 44, at: 't' },
  // 臉頰貼紙：左臉頰
  cheek: { x: 137, y: 141, w: 17, r: -10 },
  cheekstar: { x: 137, y: 140, w: 20, r: -10 },
  // 手上：右手握著（下緣在手掌）
  lightstick: { x: 352, y: 528, w: 40, at: 'b', r: 10 },
  mic: { x: 350, y: 530, w: 30, at: 'b', r: 14 },
  photocard: { x: 362, y: 524, w: 42, at: 'b', r: 12 },
  trophy: { x: 352, y: 528, w: 58, at: 'b', r: 4 },
};

export const ACC_IDS = Object.keys(PLACE).filter((id) => ACC_RATIO[id]);

// 項鍊：鍊子自己畫（沿著脖子兩側往下垂到胸口，兩端藏在脖子後面），只用 GPT 畫的墜子／蝴蝶結（acc/<id>-p.webp）
const chainPath = 'M168,177 Q171,198 193,202 Q206,198 203,175';
const goldChain = `<path d="${chainPath}" fill="none" stroke="#8a5a1a" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
  <path d="${chainPath}" fill="none" stroke="#f3cf5a" stroke-width="1.3" stroke-dasharray="2.2 1" stroke-linecap="round"/>`;
const pend = (id, x, y, w, ratio) => `<image href="assets/art/doll/acc/${id}-p.webp" x="${x - w / 2}" y="${y}" width="${w}" height="${(w * ratio).toFixed(1)}"/>`;
const NECK = {
  notelace: () => `${goldChain}${pend('notelace', 193, 199, 17, 109 / 102)}`,
  heartlace: () => `${goldChain}${pend('heartlace', 193, 199, 16, 103 / 96)}`,
  // 頸鍊：緞帶繞脖子一圈（貼著脖子、兩端到脖子邊緣），正中間蝴蝶結
  choker: () => `<path d="M167,175 Q185,186 204,172" fill="none" stroke="#a8546a" stroke-width="6" stroke-linecap="round"/>
    <path d="M167,175 Q185,186 204,172" fill="none" stroke="#ffb3c8" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M168,174.5 Q185,184 203,172" fill="none" stroke="#ffd9e4" stroke-width="1" stroke-linecap="round"/>
    ${pend('choker', 186, 174, 20, 100 / 105)}`,
};

// 新素體（GPT 畫、手垂下）：頭比舊素體低、小一點。上面的座標是舊素體量的，頭上、脖子的配飾整組換算過去
// 舊兩眼中點 (171,104) → 新 (171,139)，大小 ×0.91
const HEAD_T = 'translate(171 139) scale(0.91) translate(-171 -104)';
// 手上的東西：新素體的右手垂在身體旁邊 (326,545)，東西握在手心、斜斜地往外
const HAND = {
  lightstick: { x: 334, y: 552, w: 40, r: -18 },
  mic: { x: 334, y: 552, w: 32, r: -20 },
  photocard: { x: 338, y: 556, w: 38, r: -10 },
  trophy: { x: 334, y: 560, w: 50, r: 0 },
};

export function accSVG(id) {
  if (NECK[id]) return `<g transform="${HEAD_T}">${NECK[id]()}</g>`;
  const p = HAND[id] || PLACE[id];
  const ratio0 = ACC_RATIO[id];
  if (!p || !ratio0) return '';
  if (HAND[id]) { const h = p.w * ratio0; return `<g transform="translate(${p.x} ${p.y}) rotate(${p.r})"><image href="assets/art/doll/acc/${id}.webp" x="${(-p.w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${p.w}" height="${h.toFixed(1)}"/></g>`; }
  return `<g transform="${HEAD_T}">${oldAcc(id, p)}</g>`;
}
function oldAcc(id, p) {
  const ratio = ACC_RATIO[id];
  if (!p || !ratio) return '';
  const h = p.w * ratio;
  const dy = p.at === 't' ? 0 : p.at === 'b' ? -h : -h / 2;
  return `<g transform="translate(${p.x} ${p.y}) rotate(${p.r || 0})"><image href="assets/art/doll/acc/${id}.webp" x="${(-p.w / 2).toFixed(1)}" y="${dy.toFixed(1)}" width="${p.w}" height="${h.toFixed(1)}"/></g>`;
}
