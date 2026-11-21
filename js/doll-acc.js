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

export function accSVG(id) {
  const p = PLACE[id];
  const ratio = ACC_RATIO[id];
  if (!p || !ratio) return '';
  const h = p.w * ratio;
  const dy = p.at === 't' ? 0 : p.at === 'b' ? -h : -h / 2;
  return `<g transform="translate(${p.x} ${p.y}) rotate(${p.r || 0})"><image href="assets/art/doll/acc/${id}.webp" x="${(-p.w / 2).toFixed(1)}" y="${dy.toFixed(1)}" width="${p.w}" height="${h.toFixed(1)}"/></g>`;
}
