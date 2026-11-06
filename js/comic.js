// 情境漫畫引擎：用 SVG 畫角色、場景、對話框（全部原創角色，不使用真實偶像肖像）
const W = 360;
const H = 270;
const BASE = 292; // 角色腳底的 y，身體下半部會被畫框裁掉
const S = 0.92; // 角色縮放
const HEAD_TOP = BASE - 156 * S;

export const CAST = {
  me: { name: '你', hair: '#3b2a20', style: 'bob', skin: '#ffe0c7', outfit: 'var(--accent)' },
  mina: { name: '敏雅（韓國交換生）', hair: '#2a1a12', style: 'long', skin: '#ffe3cf', outfit: '#c4b5fd', acc: 'clip' },
  leo: { name: 'Leo（美國朋友）', hair: '#e2b65a', style: 'spiky', skin: '#f6cfae', outfit: '#60a5fa' },
  kong: { name: '孔老師（國文老師）', hair: '#9a9a9a', style: 'bun', skin: '#fbd9bd', outfit: '#4d7c5a', acc: 'glasses' },
  nova: { name: '露娜（NOVA 隊長）', hair: '#f9a8d4', style: 'idol', skin: '#ffe6d5', outfit: '#1f1b3a', acc: 'star' },
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function detectLang(t) {
  if (/[가-힯㄰-㆏]/.test(t)) return 'ko-KR';
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const cjk = (t.match(/[一-鿿]/g) || []).length;
  return latin > cjk ? 'en-US' : 'zh-TW';
}

// ───────── 文字換行 ─────────
const WIDE = /[ᄀ-ᇿ⺀-鿿가-힯＀-￯㄰-㆏]/;
function charW(ch, fs) {
  if (WIDE.test(ch)) return fs;
  if (/[A-Z@#%&mwMW]/.test(ch)) return fs * 0.68;
  if (/[\s.,'!|:;il]/.test(ch)) return fs * 0.32;
  if (/\p{Extended_Pictographic}/u.test(ch)) return fs * 1.1;
  return fs * 0.56;
}
const measure = (s, fs) => [...s].reduce((w, ch) => w + charW(ch, fs), 0);
function wrap(text, maxW, fs) {
  const toks = text.match(/[ᄀ-ᇿ⺀-鿿＀-￯㄰-㆏]|[^\sᄀ-ᇿ⺀-鿿＀-￯㄰-㆏]+\s*|\s+/gu) || [];
  const lines = [];
  let cur = '';
  for (const tok of toks) {
    if (cur && measure(cur + tok, fs) > maxW) { lines.push(cur.trimEnd()); cur = tok.trimStart(); }
    else cur += tok;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
}

// ───────── 角色 ─────────
const EXPR = {
  happy: ['happy', 'grin'], smile: ['normal', 'smile'], shock: ['shock', 'open'], sad: ['sad', 'frown'],
  love: ['love', 'grin'], cry: ['cry', 'frown'], cool: ['cool', 'smile'], wink: ['wink', 'grin'], think: ['normal', 'flat'],
};

function eyes(kind) {
  const dot = (x) => `<ellipse cx="${x}" cy="-104" rx="4.6" ry="6.2" fill="#2b1d2e"/><circle cx="${x + 1.6}" cy="-106.5" r="1.7" fill="#fff"/>`;
  const arc = (x) => `<path d="M${x - 6},-102 Q${x},-110 ${x + 6},-102" fill="none" stroke="#2b1d2e" stroke-width="3" stroke-linecap="round"/>`;
  switch (kind) {
    case 'happy': return arc(-14) + arc(14);
    case 'shock': return [-14, 14].map((x) => `<circle cx="${x}" cy="-104" r="7.5" fill="#fff" stroke="#2b1d2e" stroke-width="2"/><circle cx="${x}" cy="-104" r="2.6" fill="#2b1d2e"/>`).join('');
    case 'sad': return dot(-14) + dot(14) + '<path d="M-21,-117 L-8,-114 M21,-117 L8,-114" stroke="#2b1d2e" stroke-width="2.5" stroke-linecap="round"/>';
    case 'love': return [-14, 14].map((x) => `<path d="M${x},-99 C${x - 9},-106 ${x - 6},-114 ${x},-109 C${x + 6},-114 ${x + 9},-106 ${x},-99Z" fill="#f43f5e"/>`).join('');
    case 'cry': return dot(-14) + dot(14) + '<path d="M-17,-97 Q-20,-88 -17,-84 Q-13,-88 -17,-97Z M17,-97 Q14,-88 17,-84 Q20,-88 17,-97Z" fill="#7dd3fc"/>';
    case 'cool': return '<path d="M-26,-109 H26 V-104 Q24,-95 14,-95 Q5,-95 3,-104 H-3 Q-5,-95 -14,-95 Q-24,-95 -26,-104Z" fill="#111827"/><path d="M-20,-106 L-14,-106" stroke="#fff" stroke-width="2"/>';
    case 'wink': return dot(-14) + arc(14);
    default: return dot(-14) + dot(14);
  }
}

function mouth(kind) {
  switch (kind) {
    case 'grin': return '<path d="M-8,-90 Q0,-77 8,-90Z" fill="#b4385a"/>';
    case 'open': return '<ellipse cx="0" cy="-85" rx="5" ry="6.5" fill="#6b1d33"/>';
    case 'frown': return '<path d="M-6,-83 Q0,-89 6,-83" fill="none" stroke="#6b1d33" stroke-width="2.5" stroke-linecap="round"/>';
    case 'flat': return '<path d="M-5,-86 H5" stroke="#6b1d33" stroke-width="2.5" stroke-linecap="round"/>';
    default: return '<path d="M-7,-89 Q0,-82 7,-89" fill="none" stroke="#6b1d33" stroke-width="2.5" stroke-linecap="round"/>';
  }
}

function hairBack(c) {
  if (c.style === 'long') return `<path d="M-41,-112 Q-48,-50 -34,-46 L34,-46 Q48,-50 41,-112Z" fill="${c.hair}"/>`;
  if (c.style === 'idol') return `<path d="M-41,-112 Q-46,-76 -36,-70 L36,-70 Q46,-76 41,-112Z" fill="${c.hair}"/>`;
  if (c.style === 'bun') return `<circle cx="0" cy="-152" r="15" fill="${c.hair}"/>`;
  if (c.style === 'twin') return `<ellipse cx="-46" cy="-96" rx="13" ry="30" fill="${c.hair}"/><ellipse cx="46" cy="-96" rx="13" ry="30" fill="${c.hair}"/>`;
  if (c.style === 'wavy') return `<path d="M-42,-112 Q-56,-80 -44,-60 Q-50,-44 -34,-40 L34,-40 Q50,-44 44,-60 Q56,-80 42,-112Z" fill="${c.hair}"/>`;
  return '';
}

function hairFront(c) {
  const h = c.hair;
  switch (c.style) {
    case 'spiky':
      return `<path d="M-41,-104 L-46,-130 L-32,-127 L-30,-151 L-13,-138 L0,-158 L11,-139 L29,-151 L29,-127 L44,-131 L40,-104 Q22,-124 0,-121 Q-22,-124 -41,-104Z" fill="${h}"/>`;
    case 'short':
      return `<path d="M-40,-104 Q-44,-150 0,-152 Q44,-150 40,-104 Q36,-126 18,-128 Q4,-120 -10,-130 Q-26,-120 -40,-104Z" fill="${h}"/>`;
    case 'bun':
      return `<path d="M-39,-102 Q-41,-147 0,-148 Q41,-147 39,-102 Q31,-130 0,-131 Q-31,-130 -39,-102Z" fill="${h}"/>`;
    case 'idol':
      return `<path d="M-41,-100 Q-44,-150 0,-151 Q44,-150 41,-100 Q36,-124 16,-128 Q-4,-112 -26,-122 Q-36,-112 -41,-100Z" fill="${h}"/><path d="M-20,-140 Q-6,-146 8,-142" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    default: // bob、long
      return `<path d="M-41,-100 Q-44,-151 0,-151 Q44,-151 41,-100 Q37,-122 22,-127 Q11,-114 -5,-125 Q-20,-114 -37,-113Z" fill="${h}"/>
        <path d="M-41,-110 Q-45,-86 -36,-80 L-33,-108Z M41,-110 Q45,-86 36,-80 L33,-108Z" fill="${h}"/>`;
  }
}

function accessory(c) {
  if (c.acc === 'glasses') return '<g fill="none" stroke="#374151" stroke-width="2.2"><circle cx="-14" cy="-104" r="9.5"/><circle cx="14" cy="-104" r="9.5"/><path d="M-4.5,-104 H4.5"/></g>';
  if (c.acc === 'clip') return '<rect x="-34" y="-136" width="14" height="6" rx="3" fill="#f472b6" transform="rotate(-20 -27 -133)"/>';
  if (c.acc === 'ribbon') return '<path d="M-30,-140 l-12,-8 0,16Z M-30,-140 l12,-8 0,16Z" fill="#f43f5e"/><circle cx="-30" cy="-140" r="4" fill="#be123c"/>';
  if (c.acc === 'earring') return '<circle cx="-37" cy="-94" r="3" fill="#e5e7eb"/><circle cx="37" cy="-94" r="3" fill="#e5e7eb"/>';
  if (c.acc === 'band') return '<path d="M-38,-128 Q0,-146 38,-128" stroke="#fff" stroke-width="5" fill="none"/>';
  if (c.acc === 'star') return '<path d="M30,-128 l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="#fde047"/>';
  return '';
}

function arms(c, pose) {
  const fill = c.outfit;
  const arm = (d) => `<path d="${d}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round"/>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${c.skin}"/>`;
  switch (pose) {
    case 'wave': return arm('M-28,-56 Q-38,-30 -34,-10') + arm('M28,-58 Q46,-76 44,-100') + hand(44, -104);
    case 'point': return arm('M-28,-56 Q-38,-30 -34,-10') + arm('M28,-58 Q50,-62 62,-74') + hand(65, -76);
    case 'think': return arm('M-28,-56 Q-38,-30 -34,-10') + arm('M26,-58 Q30,-74 14,-80') + hand(10, -80);
    case 'cheer':
      return arm('M-28,-58 Q-46,-80 -44,-104') + hand(-44, -106) + arm('M28,-58 Q46,-80 44,-104') + hand(44, -106) +
        '<rect x="40" y="-150" width="8" height="40" rx="3" fill="#e5e7eb"/><circle cx="44" cy="-156" r="11" fill="var(--accent)" opacity=".9"/><circle cx="44" cy="-156" r="16" fill="var(--accent)" opacity=".25"/>';
    default: return arm('M-28,-56 Q-38,-30 -34,-10') + arm('M28,-56 Q38,-30 34,-10');
  }
}

// id 可以是 CAST 的角色代號，也可以直接傳角色外觀物件（小卡偶像用）
export function charInner(id, expr = 'smile', pose) {
  const c = typeof id === 'string' ? CAST[id] : id;
  if (!c) return '';
  const [e, m] = EXPR[expr] || EXPR.smile;
  return `
    ${hairBack(c)}
    <path d="M-34,0 L-30,-52 Q-28,-66 -14,-68 L14,-68 Q28,-66 30,-52 L34,0Z" fill="${c.outfit}"/>
    <path d="M-10,-68 L0,-56 L10,-68" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
    <rect x="-7" y="-76" width="14" height="10" fill="${c.skin}"/>
    <circle cx="-37" cy="-104" r="6" fill="${c.skin}"/><circle cx="37" cy="-104" r="6" fill="${c.skin}"/>
    <circle cx="0" cy="-108" r="38" fill="${c.skin}"/>
    <ellipse cx="-23" cy="-93" rx="6.5" ry="3.6" fill="#fb7185" opacity=".45"/><ellipse cx="23" cy="-93" rx="6.5" ry="3.6" fill="#fb7185" opacity=".45"/>
    ${eyes(e)}${mouth(m)}${hairFront(c)}${accessory(c)}${arms(c, pose)}`;
}

function drawChar(id, expr, pose, x, flip) {
  return `<g transform="translate(${x},${BASE}) scale(${flip ? -S : S},${S})">${charInner(id, expr, pose)}</g>`;
}

// 頭像（首頁、聊天室用）
export function avatar(id, expr = 'smile', cls = '') {
  return `<svg class="avatar-svg ${cls}" viewBox="-48 -162 96 96" aria-hidden="true">${charInner(id, expr)}</svg>`;
}

// ───────── 場景 ─────────
function background(bg, p) {
  const board = esc(p.board || '');
  switch (bg) {
    case 'classroom':
      return `<rect width="${W}" height="${H}" fill="#fdf6e3"/><rect x="34" y="16" width="292" height="118" rx="6" fill="#2f5d50" stroke="#8b5a2b" stroke-width="6"/>
        ${board ? board.split('\\n').map((l, i, a) => `<text x="180" y="${80 - (a.length - 1) * 13 + i * 26}" text-anchor="middle" font-size="20" fill="#f8fafc" font-weight="700" opacity=".92">${l}</text>`).join('') : '<path d="M60,50 h80 M60,70 h120 M200,95 h70" stroke="#f8fafc" stroke-opacity=".4" stroke-width="3"/>'}
        <rect y="232" width="${W}" height="38" fill="#e7d3b0"/>`;
    case 'stage':
      return `<rect width="${W}" height="${H}" fill="#1e1035"/>
        <path d="M60,0 L0,230 L130,230Z M300,0 L230,230 L360,230Z M180,0 L120,230 L240,230Z" fill="#fff" opacity=".09"/>
        ${Array.from({ length: 18 }, (_, i) => `<circle cx="${10 + i * 20}" cy="${250 + (i % 2) * 8}" r="4" fill="var(--accent)" opacity=".9"/>`).join('')}
        ${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 53) % 360}" cy="${(i * 37) % 120 + 8}" r="1.6" fill="#fde68a"/>`).join('')}`;
    case 'airport':
      return `<rect width="${W}" height="${H}" fill="#cfe9ff"/>${[0, 1, 2, 3].map((i) => `<rect x="${i * 90 + 6}" y="10" width="78" height="150" fill="#e8f5ff" stroke="#94a3b8" stroke-width="4"/>`).join('')}
        <path d="M230,60 l40,-6 18,-14 6,2 -10,16 30,-4 6,-8 4,1 -3,11 -90,14Z" fill="#64748b"/>
        <rect x="16" y="168" width="110" height="24" rx="4" fill="#facc15"/><text x="71" y="185" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2937">ARRIVALS ✈</text>
        <rect y="232" width="${W}" height="38" fill="#cbd5e1"/>`;
    case 'street':
      return `<rect width="${W}" height="${H}" fill="#bfe3ff"/>${[[0, 70, 60], [64, 40, 70], [138, 90, 54], [196, 50, 80], [280, 76, 80]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${232 - y}" fill="#94a3b8" opacity=".75"/>`).join('')}
        <rect y="232" width="${W}" height="38" fill="#a8a29e"/>`;
    case 'room':
      return `<rect width="${W}" height="${H}" fill="#ffe4ef"/><rect x="30" y="26" width="110" height="90" rx="6" fill="#bae6fd" stroke="#fff" stroke-width="6"/>
        <rect x="236" y="22" width="80" height="108" rx="4" fill="#ddd6fe" transform="rotate(4 276 76)"/><path d="M276,58 l7,15 16,2 -12,11 3,16 -14,-8 -14,8 3,-16 -12,-11 16,-2z" fill="var(--accent)"/>
        <rect y="232" width="${W}" height="38" fill="#f5d0dd"/>`;
    case 'night':
      return `<rect width="${W}" height="${H}" fill="#1e293b"/><rect x="30" y="26" width="110" height="90" rx="6" fill="#0f172a" stroke="#475569" stroke-width="6"/>
        <circle cx="110" cy="52" r="14" fill="#fde68a"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${40 + (i * 37) % 300}" cy="${12 + (i * 29) % 90}" r="1.5" fill="#fff"/>`).join('')}
        <path d="M250,232 v-60 h70 v60" fill="#fbbf24" opacity=".2"/><rect y="232" width="${W}" height="38" fill="#334155"/>`;
    case 'ancient':
      return `<rect width="${W}" height="${H}" fill="#f5ecd7"/><circle cx="290" cy="56" r="26" fill="#dc2626" opacity=".75"/>
        <path d="M0,190 L50,120 L95,170 L150,90 L215,180 L265,130 L360,200 V270 H0Z" fill="#57534e" opacity=".35"/>
        <path d="M0,215 L70,165 L130,205 L200,150 L280,210 L360,175 V270 H0Z" fill="#44403c" opacity=".45"/>`;
    case 'cafe':
      return `<rect width="${W}" height="${H}" fill="#f3e1cc"/><rect x="200" y="20" width="130" height="90" rx="6" fill="#3f3f46"/>
        <text x="265" y="56" text-anchor="middle" font-size="15" fill="#fef3c7" font-weight="700">MENU</text><path d="M220,74 h90 M220,90 h70" stroke="#fef3c7" stroke-opacity=".5" stroke-width="3"/>
        <rect y="232" width="${W}" height="38" fill="#b45309" opacity=".6"/>`;
    case 'burst':
      return `<rect width="${W}" height="${H}" fill="${p.color || '#fef08a'}"/>${Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return `<path d="M180,135 L${180 + Math.cos(a) * 400},${135 + Math.sin(a) * 400} L${180 + Math.cos(a + 0.12) * 400},${135 + Math.sin(a + 0.12) * 400}Z" fill="#fff" opacity=".55"/>`; }).join('')}`;
    default:
      return `<rect width="${W}" height="${H}" fill="#f1f5f9"/>`;
  }
}

// 手機聊天畫面
function chatScene(p) {
  let y = 64;
  const msgs = p.chat.map((m) => {
    const fs = 14;
    const lines = wrap(m.t, 190, fs);
    const w = Math.max(...lines.map((l) => measure(l, fs))) + 22;
    const h = lines.length * 19 + 14;
    const mine = m.from === 'me';
    const x = mine ? 330 - w : 30;
    const out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${mine ? 'var(--accent)' : '#fff'}"/>
      ${lines.map((l, i) => `<text x="${x + 11}" y="${y + 21 + i * 19}" font-size="${fs}" fill="${mine ? '#fff' : '#111827'}">${esc(l)}</text>`).join('')}
      ${mine && m.read ? `<text x="${x - 6}" y="${y + h - 4}" font-size="10" text-anchor="end" fill="#64748b">已讀</text>` : ''}`;
    y += h + 10;
    return out;
  }).join('');
  return `<rect width="${W}" height="${H}" fill="#e2e8f0"/><rect x="18" y="8" width="324" height="254" rx="22" fill="#f8fafc" stroke="#1f2937" stroke-width="5"/>
    <rect x="23" y="13" width="314" height="40" rx="17" fill="#e5e7eb"/><circle cx="48" cy="33" r="12" fill="${CAST[p.with]?.outfit || '#94a3b8'}"/>
    <text x="68" y="38" font-size="14" font-weight="700" fill="#111827">${esc(CAST[p.with]?.name.split('（')[0] || p.with || '')}</text>${msgs}`;
}

// ───────── 對話框 ─────────
function bubble(line, x, topMin, idx) {
  const fs = 14;
  const sfs = 11;
  const maxW = 148;
  const lines = wrap(line.t, maxW, fs);
  const subs = line.sub ? wrap(line.sub, maxW, sfs) : [];
  const w = Math.max(...lines.map((l) => measure(l, fs)), ...subs.map((l) => measure(l, sfs)), 30) + 22;
  const h = lines.length * 18 + subs.length * 14 + (subs.length ? 6 : 0) + 14;
  const bx = Math.min(Math.max(x - w / 2, 6), W - w - 6);
  let by = HEAD_TOP - 14 - h;
  if (by < topMin) by = topMin;
  const think = line.think;
  const shout = line.shout;
  const stroke = shout ? '#e11d48' : '#1f2937';
  const tail = think
    ? `<circle cx="${x}" cy="${by + h + 8}" r="4" fill="#fff" stroke="${stroke}" stroke-width="2"/><circle cx="${x + 4}" cy="${by + h + 17}" r="2.5" fill="#fff" stroke="${stroke}" stroke-width="2"/>`
    : `<path d="M${Math.min(Math.max(x - 8, bx + 10), bx + w - 22)},${by + h - 2} L${x},${Math.min(by + h + 14, HEAD_TOP - 2)} L${Math.min(Math.max(x + 6, bx + 18), bx + w - 10)},${by + h - 2}Z" fill="#fff" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  const body = `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="${think ? h / 2.2 : 14}" fill="#fff" stroke="${stroke}" stroke-width="${shout ? 3 : 2}" ${think ? 'stroke-dasharray="5 4"' : ''}/>`;
  const cover = think ? '' : `<rect x="${Math.min(Math.max(x - 7, bx + 11), bx + w - 21)}" y="${by + h - 4}" width="12" height="4" fill="#fff"/>`;
  const txt = lines.map((l, i) => `<text x="${bx + w / 2}" y="${by + 21 + i * 18}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#111827">${esc(l)}</text>`).join('') +
    subs.map((l, i) => `<text x="${bx + w / 2}" y="${by + 21 + lines.length * 18 + 4 + i * 14}" text-anchor="middle" font-size="${sfs}" fill="#64748b">${esc(l)}</text>`).join('');
  return `<g class="bubble" data-line="${idx}">${tail}${body}${cover}${txt}</g>`;
}

export function renderPanel(p, opts = {}) {
  const cast = p.cast || [];
  const xs = cast.length === 1 ? [cast[0].x ?? 180] : cast.length === 2 ? [cast[0].x ?? 92, cast[1].x ?? 268] : cast.map((c, i) => c.x ?? 70 + i * 110);
  let inner = p.chat ? chatScene(p) : background(p.bg, p);
  cast.forEach((c, i) => { inner += drawChar(c.c, c.e, c.pose, xs[i], c.flip ?? (xs[i] > 180 && cast.length > 1)); });
  if (p.fx) inner += `<text x="${p.fxX ?? 300}" y="${p.fxY ?? 150}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" stroke="#e11d48" stroke-width="5" paint-order="stroke" transform="rotate(-10 ${p.fxX ?? 300} ${p.fxY ?? 150})">${esc(p.fx)}</text>`;
  const topMin = p.cap ? 36 : 8;
  (p.say || []).forEach((line, i) => {
    const ci = cast.findIndex((c) => c.c === line.c);
    inner += bubble(line, ci >= 0 ? xs[ci] : 180, topMin, i);
  });
  if (p.cap) {
    const w = Math.min(measure(p.cap, 12) + 20, W - 12);
    inner += `<rect x="6" y="6" width="${w}" height="24" fill="#fef9c3" stroke="#1f2937" stroke-width="2"/><text x="16" y="23" font-size="12" font-weight="700" fill="#1f2937">${esc(p.cap)}</text>`;
  }
  return `<svg class="panel ${opts.cls || ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc((p.say || []).map((l) => l.t).join(' '))}">
    <rect width="${W}" height="${H}" fill="none"/>${inner}<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" fill="none" stroke="#1f2937" stroke-width="3"/></svg>`;
}

// 依例句自動產生一格情境圖，讓每張閃卡、每道題都有圖像引導
function hash(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; }
function sceneFor(text, fallback) {
  if (/concert|stage|演唱會|舞台|應援|直播|表演|回歸|perform|award|audience|cheer|一位/i.test(text)) return 'stage';
  if (/airport|機場|travel|首爾|Seoul/i.test(text)) return 'airport';
  if (/exam|test|段考|學測|考|老師|學校|class|homework|school|讀書|study/i.test(text)) return 'classroom';
  if (/coffee|food|吃|restaurant|炸雞|eat|好吃|cafe/i.test(text)) return 'cafe';
  if (/night|熬夜|半夜|midnight|睡/i.test(text)) return 'night';
  return fallback;
}

export function autoComic(deck, it) {
  const h = hash(deck.id + (it.f || ''));
  const react = ['happy', 'smile', 'love', 'wink'][h % 4];
  if (deck.type === 'meme') {
    return [
      { bg: sceneFor(it.note + it.f, 'room'), cap: '台灣說法', cast: [{ c: 'me', e: ['shock', 'happy', 'cry'][h % 3], pose: 'wave' }], say: [{ c: 'me', t: `${it.f}！`, shout: true }] },
      { bg: 'street', cap: '換成外語', cast: [{ c: 'leo', e: 'happy' }, { c: 'mina', e: react }], say: [{ c: 'leo', t: it.en.replace(/[💀☕]/g, '').trim() }, { c: 'mina', t: it.ko, sub: it.kr }] },
    ];
  }
  if (deck.type !== 'card') return null;
  if (deck.subject === 'en') {
    return [{ bg: sceneFor(it.ex || '', 'room'), cast: [{ c: 'me', e: react }, { c: 'leo', e: 'smile', pose: 'wave' }],
      say: [{ c: 'leo', t: it.ex || it.f, sub: it.exZh }, { c: 'me', t: `${it.f}＝${it.b}！`, think: true }] }];
  }
  if (deck.id === 'ko-hangul') {
    return [{ bg: 'classroom', board: `${it.f} = ${it.b}`, cast: [{ c: 'mina', e: 'smile', pose: 'point' }, { c: 'me', e: react }],
      say: [{ c: 'mina', t: `「${it.f}」念 ${it.b}` }, { c: 'me', t: it.note, think: true }] }];
  }
  if (deck.subject === 'ko') {
    return [{ bg: sceneFor(`${it.b} ${it.note || ''}`, deck.id === 'ko-fan' ? 'stage' : 'cafe'), cast: [{ c: 'mina', e: 'happy', pose: 'wave' }, { c: 'me', e: react }],
      say: [{ c: 'mina', t: it.f, sub: it.r }, { c: 'me', t: `是「${it.b}」的意思！`, think: true }] }];
  }
  if (deck.id === 'zh-classical') {
    return [{ bg: 'ancient', cast: [{ c: 'kong', e: 'smile', pose: 'point' }, { c: 'me', e: react }],
      say: [{ c: 'kong', t: it.ex }, { c: 'me', t: `「${it.f.replace(/（.*）/, '')}」＝${it.b}`, think: true }] }];
  }
  // 國文成語
  return [{ bg: sceneFor(it.ex || '', 'classroom'), cast: [{ c: 'me', e: react }, { c: 'kong', e: 'smile', pose: 'point' }],
    say: [{ c: 'me', t: it.ex }, { c: 'kong', t: `這就叫「${it.f}」！` }] }];
}
