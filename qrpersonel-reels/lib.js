'use strict';
/* QR Personel Reels — ortak çizim kütüphanesi (storyboard ve video aynı kodu kullanır).
 * Tuval 1080×1920 (9:16). Logo, markanın PNG'sinden piksel ölçümüyle vektöre çevrildi. */

const W = 1080, H = 1920, TAU = Math.PI * 2;

/* ───────── yardımcılar ───────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hash = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ───────── yazı ───────── */
function setFont(g, o) { g.font = `${o.w || 900} ${o.s}px ${o.f || 'Disp'}`; g.letterSpacing = (o.ls || 0) + 'px'; }
function text(g, s, x, y, o) {
  setFont(g, o);
  g.textAlign = o.a || 'center'; g.textBaseline = o.b || 'alphabetic';
  g.fillStyle = o.c || '#fff';
  if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.c; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  else g.fillText(s, x, y);
  g.letterSpacing = '0px';
}
function measure(g, s, o) { setFont(g, o); const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; }
function fit(g, s, o, maxW) { const w = measure(g, s, o); return w > maxW ? { ...o, s: o.s * maxW / w } : o; }
// Çok renkli satır: parts = [[metin, renk], ...]
function rich(g, parts, x, y, o) {
  const total = parts.reduce((a, [s]) => a + measure(g, s, o), 0);
  let cx = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  for (const [s, c] of parts) { text(g, s, cx, y, { ...o, a: 'left', c }); cx += measure(g, s, o); }
  return total;
}
function mono(g, s, x, y, o) {
  setFont(g, { f: 'Txt', w: o.w || 600, s: o.s });
  const cw = o.s * (o.cw || 0.64), total = cw * s.length;
  const x0 = o.a === 'right' ? x - total : o.a === 'center' ? x - total / 2 : x;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = o.c || '#fff';
  for (let i = 0; i < s.length; i++) if (s[i] !== ' ') g.fillText(s[i], x0 + cw * (i + 0.5), y);
  return total;
}

/* ───────── ışık sprite'ı ───────── */
const GLOW = {};
function glowSprite(hex) {
  if (GLOW[hex]) return GLOW[hex];
  const [r, gg, b] = hex2rgb(hex), c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.25, `rgba(${r},${gg},${b},0.45)`);
  gr.addColorStop(0.6, `rgba(${r},${gg},${b},0.1)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return (GLOW[hex] = c);
}
function glow(g, hex, x, y, rx, a = 1, ry = rx) {
  if (a <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * Math.min(1, a);
  g.drawImage(glowSprite(hex), x - rx, y - ry, 2 * rx, 2 * ry); g.globalAlpha = ga;
}

/* ───────── LOGO ─────────
 * 512 birimlik orijinal tuvalde ölçüldü: köşe parantezleri 16 kalınlık, 108–163 arası;
 * orta kişi başı (256,218) r36, gövdesi y 254–330; yan kişiler baş r24, gövde %58 ölçek, eğik taban. */
const LOGO_BODY = [[1, 16], [2, 20], [5, 24.5], [8, 28.5], [11, 31.5], [14, 33.5], [17, 35.5], [20, 37.5], [23, 39.5], [26, 41.5],
  [29, 42.5], [32, 43.5], [35, 44.5], [38, 45.5], [41, 46.5], [44, 47.5], [47, 48.5], [50, 49.5], [53, 50.5], [62, 51], [76, 51]];
const LOGO_COL = {
  icon: { bg: '#1A1A1A', fg: '#F8F8F8', side: '#858585' },   // koyu uygulama ikonu
  dark: { bg: null, fg: '#191919', side: '#8C8C8C' },         // açık zemin üstü
  light: { bg: null, fg: '#F8F8F8', side: '#858585' },        // koyu zemin üstü
};
function smoothPoly(p, pts) {
  p.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  p.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
}
// Gövde yolu: üst (top) noktasından, sx yatay, sy dikey ölçekle
function bodyPath(p, cx, top, sx = 1, sy = 1) {
  const L = LOGO_BODY.map(([d, hw]) => [cx - hw * sx, top + d * sy]).reverse();
  const R = LOGO_BODY.map(([d, hw]) => [cx + hw * sx, top + d * sy]);
  p.moveTo(L[0][0], L[0][1]);
  smoothPoly(p, L);
  p.quadraticCurveTo(cx, top - 4 * sy, R[0][0], R[0][1]);
  smoothPoly(p, R);
  p.closePath();
}
// Tek kişi silueti (orta figür). (cx, cy) baş+gövde bütününün merkezi, h toplam yükseklik.
function person(g, cx, cy, h, col) {
  const k = h / 148; // 182 → 330
  g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-256, -256);
  g.fillStyle = col;
  g.beginPath(); g.arc(256, 218, 36, 0, TAU); g.fill();
  g.beginPath(); bodyPath(g, 256, 256); g.fill();
  g.restore();
}
// Köşe parantezleri (512 birimde): open > 0 dışa açar
function bracketsPath(g, open = 0) {
  const a = 116 - open, b = 396 + open, l = 39;
  for (const [x, y, sx, sy] of [[a, a, 1, 1], [b, a, -1, 1], [a, b, 1, -1], [b, b, -1, -1]]) {
    g.moveTo(x, y + sy * l); g.lineTo(x, y); g.lineTo(x + sx * l, y);
  }
}
/* Logo çizimi. (cx, cy) merkez, size: 512 birimin ekrandaki boyu.
 * o: { variant: 'icon'|'dark'|'light', open, people: [sol, orta, sağ] ölçekleri, brackets: 0..1 opaklık, iconScale } */
function logo(g, cx, cy, size, o = {}) {
  const col = LOGO_COL[o.variant || 'icon'], k = size / 512;
  const ppl = o.people || [1, 1, 1];
  g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-256, -256);
  if (col.bg && (o.iconScale ?? 1) > 0) {
    const s = o.iconScale ?? 1, R = 256 * s;
    g.save();
    if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = 90; g.shadowOffsetY = 40; }
    g.fillStyle = o.bgCol || col.bg; g.beginPath(); g.roundRect(256 - R, 256 - R, 2 * R, 2 * R, 96 * s); g.fill();
    g.restore();
  }
  // yan kişiler (arkada)
  for (const [i, dir] of [[0, -1], [2, 1]]) {
    const s = ppl[i]; if (s <= 0.01) continue;
    const hx = 256 + dir * 68.5;
    g.save(); g.translate(hx, 300); g.scale(s, s); g.translate(-hx, -300);
    g.fillStyle = o.sideCol || col.side;
    g.beginPath(); g.arc(hx, 233, 24, 0, TAU); g.fill();
    g.save(); g.beginPath();
    // eğik taban: dış alt köşe (158,330) → içe doğru yükselir
    const x0 = dir < 0 ? 140 : 372, x1 = dir < 0 ? 230 : 282, yAt = x => 330.2 - Math.abs(x - (dir < 0 ? 158 : 354)) * 0.2727;
    g.moveTo(x0, 200); g.lineTo(x1, 200); g.lineTo(x1, yAt(x1)); g.lineTo(x0, yAt(x0)); g.closePath(); g.clip();
    g.beginPath(); bodyPath(g, hx, 281, 0.58, 0.62); g.fill();
    g.restore(); g.restore();
  }
  // orta kişi
  if (ppl[1] > 0.01) {
    g.save(); g.translate(256, 300); g.scale(ppl[1], ppl[1]); g.translate(-256, -300);
    g.fillStyle = o.mainCol || col.fg;
    g.beginPath(); g.arc(256, 218, 36, 0, TAU); g.fill();
    g.beginPath(); bodyPath(g, 256, 256); g.fill();
    g.restore();
  }
  // köşe parantezleri
  if ((o.brackets ?? 1) > 0) {
    g.save(); g.globalAlpha *= o.brackets ?? 1;
    g.strokeStyle = o.bracketCol || col.fg; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); bracketsPath(g, o.open || 0); g.stroke(); g.restore();
  }
  g.restore();
}
// Ekran ölçeğinde serbest köşe parantezleri (vizör)
function brackets(g, cx, cy, w, h, lw, arm, col, a = 1) {
  g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  g.beginPath();
  for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    g.moveTo(x, y + sy * arm); g.lineTo(x, y); g.lineTo(x + sx * arm, y);
  }
  g.stroke(); g.restore();
}

/* ───────── QR: https://www.qrpersonel.com (sürüm 2-M, 25×25) ───────── */
const QR_ROWS = [
  '1111111010101101101111111', '1000001000001010001000001', '1011101000101010101011101', '1011101011010111001011101',
  '1011101011110011101011101', '1000001010000000101000001', '1111111010101010101111111', '0000000011010011000000000',
  '1000101111101000011111001', '1010100011101011110011010', '1001111000000111100111100', '1001000001000001101100110',
  '0100101011101000111001111', '1000000110001111110010010', '0001001000011011100111100', '0011010110111010101110110',
  '1101011000111000111111100', '0000000010110011100010000', '1111111011011010101010000', '1000001001101000100011111',
  '1011101010111010111111100', '1011101001010011001100111', '1011101000011111111001010', '1000001001100000001111110',
  '1111111011001001000000111',
];
const QN = 25, QM = 12;
const EYE_C = [[3, 3], [3, 21], [21, 3]];
const eyeOf = (r, c) => EYE_C.findIndex(([er, ec]) => Math.abs(r - er) <= 3 && Math.abs(c - ec) <= 3);
const DARK = [];
for (let r = 0; r < QN; r++) for (let c = 0; c < QN; c++) if (QR_ROWS[r][c] === '1') DARK.push({ r, c, eye: eyeOf(r, c) });
function mod(g, x, y, s, rr = 0.2) { if (s <= 0.2) return; g.beginPath(); g.roundRect(x - s / 2, y - s / 2, s, s, s * rr); g.fill(); }
function qrEye(g, x, y, u) {
  const R = 3.5 * u, r1 = 2.5 * u;
  g.beginPath(); g.roundRect(x - R, y - R, 2 * R, 2 * R, u * 0.8); g.roundRect(x - r1, y - r1, 2 * r1, 2 * r1, u * 0.45); g.fill('evenodd');
  g.beginPath(); g.roundRect(x - 1.5 * u, y - 1.5 * u, 3 * u, 3 * u, u * 0.4); g.fill();
}
// QR çizer (kart dahil değil). size = 25 modül genişliği. reveal(m) → 0..1 ölçek
function qr(g, cx, cy, size, col, reveal = null) {
  const u = size / QN; g.fillStyle = col;
  for (const m of DARK) {
    if (m.eye >= 0) continue;
    const s = reveal ? reveal(m) : 1;
    if (s > 0) mod(g, cx + (m.c - QM) * u, cy + (m.r - QM) * u, u * 1.02 * s, 0.14);
  }
  EYE_C.forEach(([er, ec]) => qrEye(g, cx + (ec - QM) * u, cy + (er - QM) * u, u));
}
function qrCard(g, cx, cy, size, o = {}) {
  const u = size / (QN + 8);
  g.save();
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = 60; g.shadowOffsetY = 24; }
  g.fillStyle = o.bg || '#FFFFFF'; g.beginPath(); g.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.09); g.fill();
  g.restore();
  qr(g, cx, cy, u * QN, o.fg || '#111111', o.reveal);
}

/* ───────── telefon ───────── */
// (cx, cy) merkez, w genişlik (oran 19.5:9). screen(g, sw, sh): ekran içeriği, orijin ekran merkezinde.
function phone(g, cx, cy, w, screen, o = {}) {
  const h = w * 2.16, r = w * 0.155, b = w * 0.035;
  g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot);
  if (o.shadow !== false) { g.save(); g.shadowColor = o.shadow || 'rgba(0,0,0,0.45)'; g.shadowBlur = w * 0.25; g.shadowOffsetY = w * 0.1;
    g.fillStyle = '#0B0C0F'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.restore(); }
  g.fillStyle = o.frame || '#0B0C0F'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = Math.max(1.5, w * 0.004); g.stroke();
  const sw = w - 2 * b, sh = h - 2 * b;
  g.save(); g.beginPath(); g.roundRect(-sw / 2, -sh / 2, sw, sh, r - b); g.clip();
  g.fillStyle = o.screenBg || '#FFFFFF'; g.fillRect(-sw / 2, -sh / 2, sw, sh);
  screen(g, sw, sh);
  g.restore();
  g.fillStyle = '#05060A'; g.beginPath(); g.roundRect(-w * 0.15, -sh / 2 + w * 0.03, w * 0.3, w * 0.085, w * 0.0425); g.fill();
  g.restore();
}
function statusBar(g, sw, sh, col, time = '09:00') {
  const y = -sh / 2 + sw * 0.085, s = sw * 0.045;
  text(g, time, -sw / 2 + sw * 0.13, y, { f: 'Txt', w: 600, s, a: 'left', c: col });
  g.fillStyle = col;
  for (let i = 0; i < 4; i++) g.fillRect(sw * 0.27 + i * s * 0.36, y - s * 0.3 - i * s * 0.16, s * 0.24, s * 0.3 + i * s * 0.16);
  g.beginPath(); g.roundRect(sw * 0.36, y - s * 0.72, s * 1.4, s * 0.7, s * 0.18); g.fill();
}
function checkMark(g, x, y, s, lw, col, p = 1) {
  const pts = [[-0.44, 0.02], [-0.14, 0.32], [0.46, -0.3]], L = (Math.hypot(0.3, 0.3) + Math.hypot(0.6, 0.62)) * s;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.setLineDash([L * p, L * 2]);
  g.beginPath(); g.moveTo(x + pts[0][0] * s, y + pts[0][1] * s); g.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); g.lineTo(x + pts[2][0] * s, y + pts[2][1] * s); g.stroke();
  g.restore();
}
function avatar(g, x, y, r, ini, col, ring = null) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  if (ring) { g.strokeStyle = ring; g.lineWidth = r * 0.12; g.stroke(); }
  text(g, ini, x, y + r * 0.22, { f: 'Txt', w: 700, s: r * 0.62, c: '#FFFFFF' });
}
const TEAM = [
  { ini: 'DA', name: 'Deniz Aydın', col: '#F5A524' }, { ini: 'MK', name: 'Mehmet Kaya', col: '#7B61FF' },
  { ini: 'ED', name: 'Elif Demir', col: '#FF8A3D' }, { ini: 'CT', name: 'Can Tekin', col: '#00B8D9' },
  { ini: 'AY', name: 'Ayşe Yılmaz', col: '#2F5BFF' }, { ini: 'SK', name: 'Selin Koç', col: '#22C55E' },
  { ini: 'ZA', name: 'Zeynep Arslan', col: '#E5487D' }, { ini: 'BŞ', name: 'Burak Şahin', col: '#A855F7' },
];
// Piksel rakamlar (5×7)
const GLYPH = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
};
function pixelStr(g, str, cx, cy, m, col, rr = 0.22) {
  const ws = [...str].map(ch => ch === ':' ? 1 : 5), cols = ws.reduce((a, b) => a + b, 0) + ws.length - 1;
  const x0 = cx - cols * m / 2, y0 = cy - 3.5 * m;
  g.fillStyle = col; let cc = 0;
  [...str].forEach((ch, k) => {
    const gl = GLYPH[ch];
    for (let r = 0; r < 7; r++) for (let c = 0; c < ws[k]; c++) if (gl[r][c] === '1') mod(g, x0 + (cc + c + 0.5) * m, y0 + (r + 0.5) * m, m * 0.86, rr);
    cc += ws[k] + 1;
  });
}
function dotGrid(g, col, a = 0.08, step = 48) {
  g.save(); g.fillStyle = col; g.globalAlpha = a;
  for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) g.fillRect(x - 1.5, y - 1.5, 3, 3);
  g.restore();
}
function grain(g, a = 0.05) {
  if (!GLOW.__grain) {
    const n = canvas(256, 256), x = n.getContext('2d'), id = x.createImageData(256, 256), R = mulberry32(3);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (R() - 0.5) * 180; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); GLOW.__grain = n;
  }
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(GLOW.__grain, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
function vignette(g, a = 0.5) {
  const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
