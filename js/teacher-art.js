// 敏雅老師（민아 쌤）立繪：原創角色，用 SVG 繪製
// teacherSVG({ expr, outfit, view })
//   expr：smile 微笑｜happy 答對｜gentle 鼓勵｜surprised 驚訝｜think 思考｜cheer 加油｜wink 眨眼
//   outfit：class 上課版｜stage 舞台版
//   view：full 全身｜bust 半身｜face 大頭

const SKIN = '#ffe2d2';
const SKIN_SH = '#f3c4ae';
// 髮色：金髮（預設）與可可棕
export const HAIRS = {
  blonde: { name: '奶茶金', base: '#ecd08f', shade: '#c9a45c', hi: '#fff4cf', brow: '#9c7440' },
  brown: { name: '可可棕', base: '#3a2420', shade: '#2a1814', hi: '#7a4a3f', brow: '#3a2420' },
};
const EYE = '#3b2233';
const LIP = '#a23a60';
const PINK = '#f06595';
const INK = '#2a2140';

export const OUTFITS = {
  class: { name: '上課版', top: '#c9b6f2', topDark: '#9f84e0', tee: '#ffffff', skirt: '#2f3a6b', pleat: '#4b578f', sock: '#ffffff', shoe: '#ffffff', shoeLine: PINK, trim: '#ffffff', tag: true },
  stage: { name: '舞台版', top: '#2a2140', topDark: '#4a3b72', tee: PINK, skirt: '#f4f1fb', pleat: '#d6cdee', sock: '#2a2140', shoe: '#2a2140', shoeLine: '#c9c6dc', trim: '#d7d9e8', sparkle: true },
};

export const PALETTE = [
  { name: '髮色・奶茶金', hex: HAIRS.blonde.base },
  { name: '應援粉', hex: PINK },
  { name: '練習室紫', hex: '#c9b6f2' },
  { name: '制服藍', hex: '#2f3a6b' },
  { name: '膚色', hex: SKIN },
];

const VIEWS = { full: '28 52 262 452', bust: '66 60 168 168', face: '78 74 144 144' };

function star(cx, cy, r, fill, extra = '') {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${extra}/>`;
}

function eye(x, kind) {
  const lash = `<path d="M${x - 13},155 Q${x},146 ${x + 13},154" stroke="${EYE}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${x + (x < 150 ? -13 : 13)},155 l${x < 150 ? -4 : 4},-3" stroke="${EYE}" stroke-width="2.4" stroke-linecap="round"/>`;
  const open = (dx = 0, sparkle = false) => `<ellipse cx="${x + dx}" cy="165" rx="10.5" ry="13.5" fill="${EYE}"/><ellipse cx="${x + dx}" cy="170" rx="7.5" ry="7" fill="#8b4a7a" opacity=".55"/>${sparkle ? star(x + dx + 3, 160, 6, '#fff') : `<circle cx="${x + dx + 4}" cy="159" r="4.2" fill="#fff"/>`}<circle cx="${x + dx - 4}" cy="172" r="1.9" fill="#fff" opacity=".9"/>${lash}`;
  const closed = `<path d="M${x - 11},167 Q${x},155 ${x + 11},167" stroke="${EYE}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  switch (kind) {
    case 'happy': return closed;
    case 'surprised': return `<circle cx="${x}" cy="164" r="12" fill="#fff" stroke="${EYE}" stroke-width="2.6"/><circle cx="${x}" cy="165" r="5.2" fill="${EYE}"/><circle cx="${x + 2}" cy="163" r="1.7" fill="#fff"/>`;
    case 'think': return open(4);
    case 'cheer': return open(0, true);
    case 'wink': return x < 150 ? open() : closed;
    default: return open();
  }
}

function brows(kind, H) {
  const b = (x, y1, y2, y3) => `<path d="M${x - 11},${y1} Q${x},${y2} ${x + 11},${y3}" stroke="${H.brow}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  switch (kind) {
    case 'surprised': return b(122, 134, 128, 133) + b(178, 133, 128, 134);
    case 'gentle': return b(122, 141, 137, 136) + b(178, 136, 137, 141);
    case 'think': return b(122, 140, 136, 140) + b(178, 134, 130, 136);
    default: return b(122, 141, 136, 140) + b(178, 140, 136, 141);
  }
}

function mouth(kind) {
  const grin = `<path d="M139,189 Q150,206 161,189 Z" fill="${LIP}"/><ellipse cx="150" cy="199" rx="5" ry="2.6" fill="#f48aa8"/>`;
  switch (kind) {
    case 'happy': case 'cheer': return grin;
    case 'wink': return `<path d="M142,190 Q150,201 158,190 Z" fill="${LIP}"/>`;
    case 'surprised': return `<ellipse cx="150" cy="196" rx="6" ry="8" fill="${LIP}"/>`;
    case 'think': return `<path d="M144,195 Q152,192 158,196" stroke="${LIP}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    case 'gentle': return `<path d="M142,192 Q150,198 158,192" stroke="${LIP}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M141,191 Q150,200 159,191" stroke="${LIP}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  }
}

function extras(kind) {
  switch (kind) {
    case 'think': return `<text x="232" y="112" font-size="34" font-weight="700" fill="#9f84e0" font-family="sans-serif">?</text>`;
    case 'surprised': return `<path d="M224,120 q8,12 0,18 q-8,-6 0,-18Z" fill="#8fd3f4"/><text x="72" y="104" font-size="26" font-weight="700" fill="${PINK}" font-family="sans-serif">!</text>`;
    case 'cheer': return star(76, 112, 9, '#ffd43b') + star(232, 96, 7, '#ffd43b') + star(222, 132, 5, PINK);
    case 'happy': return star(78, 116, 7, '#ffd43b') + star(226, 110, 6, PINK);
    case 'wink': return `<path d="M222,150 l10,-6 m-10,6 l12,2 m-12,-2 l8,8" stroke="${PINK}" stroke-width="2.6" stroke-linecap="round"/>`;
    default: return '';
  }
}

export function teacherSVG({ expr = 'smile', outfit = 'class', view = 'full', hair = 'blonde', label } = {}) {
  const o = OUTFITS[outfit] || OUTFITS.class;
  const H = HAIRS[hair] || HAIRS.blonde;
  const blushLines = expr === 'happy' || expr === 'cheer' ? '<path d="M110,182 l4,-5 m4,5 l4,-5 m60,5 l4,-5 m4,5 l4,-5" stroke="#ff7aa0" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>' : '';
  const sparkles = o.sparkle ? [[112, 262], [126, 300], [188, 252], [176, 296], [104, 318], [194, 316]].map(([x, y]) => star(x, y, 3.2, '#e8e6f5')).join('') : '';
  return `<svg viewBox="${VIEWS[view] || VIEWS.full}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || '敏雅老師'}">
  <path d="M80,138 C68,222 70,318 80,364 L220,364 C230,318 232,222 220,138 Z" fill="${H.base}" stroke="${H.shade}" stroke-width="2"/>
  <path d="M84,364 L216,364 L214,356 L86,356 Z" fill="${H.shade}"/>
  <path d="M128,402 L126,478 L145,478 L147,402 Z M153,402 L155,478 L174,478 L172,402 Z" fill="${SKIN}"/>
  <path d="M126,450 L126,480 L145,480 L146,450 Z M154,450 L155,480 L174,480 L174,450 Z" fill="${o.sock}"/>
  <path d="M120,476 Q119,494 138,494 L150,494 Q152,482 146,476 Z M154,476 Q148,482 150,494 L162,494 Q181,494 180,476 Z" fill="${o.shoe}" stroke="${o.shoeLine}" stroke-width="2"/>
  <path d="M122,486 L146,486 M154,486 L178,486" stroke="${o.shoeLine}" stroke-width="3"/>
  <path d="M110,326 L190,326 L212,408 L88,408 Z" fill="${o.skirt}"/>
  <path d="M130,328 L119,406 M150,328 L150,406 M170,328 L181,406" stroke="${o.pleat}" stroke-width="3"/>
  <path d="M116,230 Q150,222 184,230 L190,330 L110,330 Z" fill="${o.tee}"/>
  <path d="M141,232 L150,246 L159,232" fill="none" stroke="${o.topDark}" stroke-width="2.4"/>
  <path d="M114,232 Q98,240 98,272 L102,334 L136,334 L140,236 Z M186,232 Q202,240 202,272 L198,334 L164,334 L160,236 Z" fill="${o.top}"/>
  <path d="M140,236 L136,334 M160,236 L164,334" stroke="${o.trim}" stroke-width="3"/>
  <circle cx="167" cy="276" r="3" fill="${o.topDark}"/><circle cx="167" cy="296" r="3" fill="${o.topDark}"/><circle cx="167" cy="316" r="3" fill="${o.topDark}"/>
  ${sparkles}
  ${o.tag ? `<rect x="171" y="250" width="27" height="15" rx="3" fill="#fff" stroke="${o.topDark}" stroke-width="1.5"/><text x="184.5" y="261" text-anchor="middle" font-size="9" font-weight="700" fill="${INK}" font-family="sans-serif">민아</text>` : ''}
  <path d="M114,234 Q94,244 92,284 L94,320 L112,320 L116,280 Z" fill="${o.top}"/>
  <rect x="93" y="313" width="19" height="8" rx="2" fill="${o.topDark}"/>
  <g transform="rotate(-8 96 334)"><rect x="82" y="316" width="26" height="34" rx="3" fill="${PINK}"/><rect x="82" y="316" width="5" height="34" fill="#c2255c"/><text x="97" y="337" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">가</text></g>
  <circle cx="103" cy="326" r="8.5" fill="${SKIN}"/>
  <path d="M186,234 Q210,232 222,212 L232,192 L248,200 L236,226 Q224,254 198,264 Z" fill="${o.top}"/>
  <path d="M230,196 L246,204 L249,197 L233,189 Z" fill="${o.topDark}"/>
  <circle cx="259" cy="108" r="30" fill="${PINK}" opacity=".16"/>
  <path d="M243,190 L256,126" stroke="#e9e6f2" stroke-width="8" stroke-linecap="round"/>
  <path d="M246,176 L249,162" stroke="#bcb6d0" stroke-width="8" stroke-linecap="round"/>
  <circle cx="259" cy="108" r="17" fill="${PINK}"/>
  ${star(259, 108, 9, '#fff')}
  <circle cx="242" cy="188" r="9.5" fill="${SKIN}"/>
  <rect x="139" y="204" width="22" height="30" fill="${SKIN}"/>
  <ellipse cx="150" cy="214" rx="15" ry="5" fill="${SKIN_SH}"/>
  <ellipse cx="83" cy="162" rx="8" ry="11" fill="${SKIN}"/><ellipse cx="217" cy="162" rx="8" ry="11" fill="${SKIN}"/>
  ${star(83, 178, 4.5, '#ffd43b')}${star(217, 178, 4.5, '#ffd43b')}
  <ellipse cx="150" cy="150" rx="68" ry="70" fill="${SKIN}"/>
  <ellipse cx="116" cy="184" rx="11" ry="6" fill="#ff8fab" opacity=".45"/><ellipse cx="184" cy="184" rx="11" ry="6" fill="#ff8fab" opacity=".45"/>
  ${blushLines}
  ${brows(expr, H)}${eye(122, expr)}${eye(178, expr)}${mouth(expr)}
  <path d="M82,150 C78,94 116,70 150,70 C186,70 224,94 218,150 C214,126 206,114 196,108 L194,134 L184,110 L176,138 L166,112 L156,140 L146,112 L136,138 L126,110 L116,134 L106,108 C96,116 86,128 82,150 Z" fill="${H.base}" stroke="${H.shade}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M82,140 C76,196 78,260 84,300 L100,300 C100,250 100,196 102,152 Z M218,140 C224,196 222,260 216,300 L200,300 C200,250 200,196 198,152 Z" fill="${H.base}" stroke="${H.shade}" stroke-width="1.8"/>
  <path d="M88,180 L90,290 M212,180 L210,290" stroke="${H.shade}" stroke-width="2.4" opacity=".7"/>
  <path d="M104,96 Q128,80 158,80" stroke="${H.hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
  ${star(197, 100, 11, PINK, 'stroke="#fff" stroke-width="2"')}
  <circle cx="219" cy="160" r="8" fill="${INK}"/>
  <path d="M218,168 Q214,193 187,198" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="185" cy="198" r="4.5" fill="${INK}"/>
  ${extras(expr)}
</svg>`;
}
