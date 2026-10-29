'use strict';
/* TASARIM 05 · CAM & HOLOGRAM — kripto724
 * Deep violet space with frosted glass cards and glass phones floating at different depths in
 * true perspective (d5_plane: our own seamless mesh warp), iridescent light, bokeh, and glossy
 * brand-orange coins and a rising arrow — the cinematic version of the app's own 3D banner
 * illustrations. The real app screens (light theme, exact data from the client's screenshots)
 * sit on the glass. Display: Unbounded · text: Manrope · app UI: Inter · official logo()/logoH(). */

const D5 = {
  bg: '#120B2E', deep: '#120B2E', lav: '#6E5BFF', lav2: '#B2A5FF', teal: '#19D3C5', teal2: '#8EF1E7',
  or: '#F7931A', or2: '#FFB45C', peach: '#FFD3A3', milk: '#F5F3FF', soft: '#BDB5E2', dim: '#8F86BC',
  up: '#8EF1E7', dn: '#FF8F94',
};
// the app's light theme
const D5A = {
  page: '#EEF0F5', card: '#FFFFFF', ink: '#14161F', sec: '#7A7F8C', hair: '#EEF0F4', line: '#E3E5EC',
  up: '#16A34A', upBg: '#DCF5E6', dn: '#E5484D', dnBg: '#FDE2E2', track: '#ECEBFF', track2: '#F1F0FA',
  badge: '#E5E3FF', lav: '#6E5BFF', live: '#10B981', liveTx: '#0E9F6E', liveBg: '#E3F7EE',
  cream: '#FFF7E3', creamTrack: '#F5E9C6', gold0: '#D9A520', gold1: '#F2C14E', or: '#F7931A',
};
const D5U = 'Unbounded', D5M = 'Manrope', D5I = 'Inter';
const D5_HOLO = [[0, '#B6A9FF'], [0.34, '#86EFE5'], [0.67, '#FFCB94'], [1, '#B6A9FF']];
const D5S = { small: null, blur: null, layer: null, grain: null, spr: {} };
const D5_COIN = {
  btc: ['#FFE7C7', '#F7931A', '#9A4C00'], gold: ['#FFF6D8', '#F2C14E', '#8E640A'],
  eth: ['#E7E7FF', '#7477F2', '#2A2B8A'], lav: ['#F5F2FF', '#A797FF', '#3F2CC4'],
  teal: ['#F0FFFD', '#5FE5DA', '#0A7A73'], silver: ['#FFFFFF', '#C9CBD8', '#5E6074'],
};

/* ───────────── type ───────────── */
function d5_t(g, s, x, y, size, c = D5.milk, o = {}) {
  text(g, s, x, y, { f: D5M, w: o.w || 600, s: size, a: o.a || 'left', c, ls: o.ls || 0, b: o.b });
}
function d5_d(g, s, x, y, size, c = D5.milk, o = {}) {
  text(g, s, x, y, { f: D5U, w: o.w || 800, s: size, a: o.a || 'left', c, ls: o.ls == null ? -size * 0.03 : o.ls, b: o.b });
}
function d5_k(g, s, x, y, size = 16, c = D5.soft, o = {}) {
  text(g, s, x, y, { f: D5M, w: 800, s: size, a: o.a || 'left', c, ls: o.ls == null ? size * 0.14 : o.ls });
}
function d5_mw(g, s, size, f = D5M, w = 600, ls = 0) { return measure(g, s, { f, w, s: size, ls }); }
function d5_holo(g, x0, y0, x1, y1, a = 1, stops = D5_HOLO) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) gr.addColorStop(p, hexA(c, a));
  return gr;
}
function d5_conic(g, x, y, a0 = 0, al = 1, stops = D5_HOLO) {
  const gr = g.createConicGradient(a0, x, y);
  for (const [p, c] of stops) gr.addColorStop(p, hexA(c, al));
  return gr;
}
// brand orange, a touch lighter at the top (glossy)
function d5_orFill(g, x0, y0, x1, y1) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, '#FFC27A'); gr.addColorStop(0.55, '#F7931A'); gr.addColorStop(1, '#EF8410');
  return gr;
}
// a headline line made of parts [[text, colour | 'holo' | 'org'], ...]
function d5_head(g, parts, x, y, size, o = {}) {
  const f = { f: D5U, w: o.w || 800, s: size, ls: o.ls == null ? -size * 0.03 : o.ls };
  const ws = parts.map(p => measure(g, p[0], f)), tot = ws.reduce((a, b) => a + b, 0);
  let px = o.a === 'center' ? x - tot / 2 : o.a === 'right' ? x - tot : x;
  parts.forEach(([s, c], i) => {
    g.save();
    if (o.glow !== 0) {
      g.shadowColor = c === 'org' ? hexA(D5.or, (o.glow == null ? 0.6 : o.glow) * 0.75) : hexA(o.glowC || D5.lav, o.glow == null ? 0.6 : o.glow);
      g.shadowBlur = size * 0.5;
    }
    const fill = c === 'holo' ? d5_holo(g, px, y - size * 0.9, px + ws[i], y + size * 0.1)
      : c === 'org' ? d5_orFill(g, 0, y - size * 0.85, 0, y) : c;
    text(g, s, px, y, { ...f, a: 'left', c: fill });
    g.restore();
    px += ws[i];
  });
  return tot;
}
// small chip (texture or screen, no frost); x is the left edge for a: 'left', else the centre
function d5_tchip(x, px, cy, label, o = {}) {
  const fs = o.s || 18, tw = d5_mw(x, label, fs, D5M, 700), dot = o.dot ? fs * 0.9 : 0;
  const w = tw + fs * 1.5 + dot, h = fs * 2;
  const x0 = o.a === 'left' ? px : px - w / 2;
  rr(x, x0, cy - h / 2, w, h, h / 2);
  x.fillStyle = o.fill || 'rgba(245,243,255,0.08)'; x.fill();
  if (o.stroke !== false) { x.lineWidth = 1.3; x.strokeStyle = o.stroke || 'rgba(245,243,255,0.22)'; x.stroke(); }
  if (o.dot) { x.fillStyle = o.dot; x.beginPath(); x.arc(x0 + fs * 0.75 + fs * 0.22, cy, fs * 0.24, 0, TAU); x.fill(); }
  d5_t(x, label, x0 + fs * 0.75 + dot, cy + fs * 0.36, fs, o.c || D5.milk, { w: 700 });
  return w;
}

/* ───────────── icons (line style; no glyphs needed) ───────────── */
function d5_icon(g, k, x, y, s, col, lw) {
  const h = s / 2;
  g.save(); g.translate(x, y);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw || Math.max(1.5, s * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (...p) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
  const poly = (n, r, a0 = -Math.PI / 2) => { g.beginPath(); for (let i = 0; i < n; i++) { const a = a0 + i * TAU / n; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); };
  const circ = (cx, cy, r) => { g.beginPath(); g.arc(cx, cy, r, 0, TAU); };
  switch (k) {
    case 'stock': L(-h * 0.95, h * 0.55, -h * 0.3, -h * 0.08, h * 0.12, h * 0.3, h * 0.9, -h * 0.55); L(h * 0.38, -h * 0.6, h * 0.9, -h * 0.58, h * 0.88, -h * 0.06); break;
    case 'hex': poly(6, h * 0.92); g.stroke(); poly(6, h * 0.36); g.fill(); break;
    case 'candle': L(-h * 0.5, -h * 0.9, -h * 0.5, h * 0.8); g.fillRect(-h * 0.78, -h * 0.5, h * 0.56, h * 0.85); L(h * 0.45, -h * 0.75, h * 0.45, h * 0.95); g.fillRect(h * 0.17, -h * 0.35, h * 0.56, h * 0.95); break;
    case 'target': circ(0, 0, h * 0.72); g.stroke(); circ(0, 0, h * 0.26); g.fill(); L(0, -h, 0, -h * 0.5); L(0, h * 0.5, 0, h); L(-h, 0, -h * 0.5, 0); L(h * 0.5, 0, h, 0); break;
    case 'bell':
      g.beginPath(); g.moveTo(-h * 0.8, h * 0.52); g.quadraticCurveTo(-h * 0.58, h * 0.25, -h * 0.58, -h * 0.12);
      g.arc(0, -h * 0.12, h * 0.58, Math.PI, 0); g.quadraticCurveTo(h * 0.58, h * 0.25, h * 0.8, h * 0.52); g.closePath(); g.stroke();
      g.beginPath(); g.arc(0, h * 0.62, h * 0.2, 0.1, Math.PI - 0.1); g.stroke(); L(0, -h * 0.72, 0, -h * 0.9); break;
    case 'user': circ(0, -h * 0.36, h * 0.38); g.stroke(); g.beginPath(); g.arc(0, h * 1.0, h * 0.78, -Math.PI * 0.88, -Math.PI * 0.12); g.stroke(); break;
    case 'feed': L(-h * 0.85, -h * 0.55, h * 0.85, -h * 0.55); L(-h * 0.85, 0, h * 0.85, 0); L(-h * 0.85, h * 0.55, h * 0.3, h * 0.55); break;
    case 'news': g.beginPath(); g.roundRect(-h * 0.88, -h * 0.72, h * 1.76, h * 1.44, h * 0.2); g.stroke(); g.fillRect(-h * 0.58, -h * 0.4, h * 0.5, h * 0.42); L(h * 0.12, -h * 0.34, h * 0.58, -h * 0.34); L(h * 0.12, -h * 0.04, h * 0.58, -h * 0.04); L(-h * 0.58, h * 0.36, h * 0.58, h * 0.36); break;
    case 'search': circ(-h * 0.14, -h * 0.14, h * 0.6); g.stroke(); L(h * 0.32, h * 0.32, h * 0.88, h * 0.88); break;
    case 'star': g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? h * 0.42 : h * 0.98; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); break;
    case 'clock': circ(0, 0, h * 0.86); g.stroke(); L(0, -h * 0.5, 0, 0, h * 0.4, h * 0.24); break;
    case 'tabs': g.beginPath(); g.roundRect(-h * 0.88, -h * 0.42, h * 1.36, h * 1.26, h * 0.16); g.stroke(); L(-h * 0.5, -h * 0.82, h * 0.86, -h * 0.82, h * 0.86, h * 0.45); break;
    case 'note': g.beginPath(); g.roundRect(-h * 0.72, -h * 0.9, h * 1.44, h * 1.8, h * 0.2); g.stroke(); L(-h * 0.36, -h * 0.4, h * 0.36, -h * 0.4); L(-h * 0.36, 0, h * 0.36, 0); L(-h * 0.36, h * 0.4, h * 0.1, h * 0.4); break;
    case 'lock': g.beginPath(); g.roundRect(-h * 0.72, -h * 0.12, h * 1.44, h * 1.02, h * 0.22); g.stroke(); g.beginPath(); g.arc(0, -h * 0.12, h * 0.46, Math.PI, 0); g.stroke(); circ(0, h * 0.36, h * 0.12); g.fill(); break;
    case 'shield': g.beginPath(); g.moveTo(0, -h * 0.92); g.lineTo(h * 0.78, -h * 0.6); g.lineTo(h * 0.72, h * 0.08); g.quadraticCurveTo(h * 0.52, h * 0.7, 0, h * 0.94); g.quadraticCurveTo(-h * 0.52, h * 0.7, -h * 0.72, h * 0.08); g.lineTo(-h * 0.78, -h * 0.6); g.closePath(); g.stroke(); L(-h * 0.3, 0, -h * 0.05, h * 0.25, h * 0.35, -h * 0.25); break;
    case 'link': g.rotate(-Math.PI / 4); g.beginPath(); g.roundRect(-h * 1.0, -h * 0.34, h * 1.12, h * 0.68, h * 0.34); g.stroke(); g.beginPath(); g.roundRect(-h * 0.12, -h * 0.34, h * 1.12, h * 0.68, h * 0.34); g.stroke(); break;
    case 'swap': L(-h * 0.82, -h * 0.36, h * 0.82, -h * 0.36); L(h * 0.42, -h * 0.74, h * 0.82, -h * 0.36, h * 0.42, h * 0.02); L(h * 0.82, h * 0.38, -h * 0.82, h * 0.38); L(-h * 0.42, 0, -h * 0.82, h * 0.38, -h * 0.42, h * 0.76); break;
    case 'play': g.beginPath(); g.moveTo(-h * 0.38, -h * 0.6); g.lineTo(h * 0.62, 0); g.lineTo(-h * 0.38, h * 0.6); g.closePath(); g.fill(); break;
    case 'chev': L(-h * 0.22, -h * 0.5, h * 0.28, 0, -h * 0.22, h * 0.5); break;
    case 'arrow': L(-h * 0.8, 0, h * 0.8, 0); L(h * 0.3, -h * 0.5, h * 0.8, 0, h * 0.3, h * 0.5); break;
    case 'up': L(0, h * 0.75, 0, -h * 0.7); L(-h * 0.5, -h * 0.2, 0, -h * 0.72, h * 0.5, -h * 0.2); break;
    case 'down': L(0, -h * 0.75, 0, h * 0.7); L(-h * 0.5, h * 0.2, 0, h * 0.72, h * 0.5, h * 0.2); break;
    case 'drop': g.beginPath(); g.moveTo(0, -h * 0.95); g.bezierCurveTo(h * 0.35, -h * 0.45, h * 0.72, -h * 0.05, h * 0.72, h * 0.3); g.arc(0, h * 0.3, h * 0.72, 0, Math.PI); g.bezierCurveTo(-h * 0.72, -h * 0.05, -h * 0.35, -h * 0.45, 0, -h * 0.95); g.closePath(); g.fill(); break;
    case 'spark': sparkle(g, -h * 0.1, h * 0.1, h * 0.9, col); sparkle(g, h * 0.72, -h * 0.68, h * 0.34, col); break;
    case 'check': g.restore(); check(g, x, y, s * 0.8, col, lw || Math.max(1.5, s * 0.12)); return;
  }
  g.restore();
}

/* ───────────── data helpers ───────────── */
function d5_series(seed, n, drift, vol, target) {
  const s = walk(seed, n, drift, vol, 1), last = s[n - 1];
  return s.map((v, i) => v * Math.pow(target / last, i / (n - 1)));
}
function d5_map(s, x0, x1, y0, y1, lo, hi) {
  if (lo == null) { lo = Math.min(...s); hi = Math.max(...s); }
  return s.map((v, i) => [lerp(x0, x1, i / (s.length - 1)), lerp(y1, y0, (v - lo) / ((hi - lo) || 1))]);
}
function d5_spark(x, pts, col, lw, o = {}) {
  x.save();
  if (o.glow !== 0) { x.shadowColor = hexA(col, 0.9); x.shadowBlur = o.glow == null ? 10 : o.glow; }
  x.strokeStyle = o.stroke || col; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round';
  x.beginPath(); smoothPath(x, pts); x.stroke(); x.restore();
}

/* ───────────── background: violet space, iridescent blobs, bokeh, grain ───────────── */
function d5_blob(g, x, y, r, col, a, sy = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, sy);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, hexA(col, a)); gr.addColorStop(0.35, hexA(col, a * 0.62)); gr.addColorStop(0.7, hexA(col, a * 0.18)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r);
  g.restore();
}
function d5_bokSpr(hex) {
  const k = 'b' + hex;
  if (D5S.spr[k]) return D5S.spr[k];
  const c = canvas(128, 128), x = c.getContext('2d'), [r, gg, b] = hex2rgb(hex);
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 62);
  gr.addColorStop(0, `rgba(${r},${gg},${b},0.32)`); gr.addColorStop(0.72, `rgba(${r},${gg},${b},0.42)`);
  gr.addColorStop(0.88, `rgba(${r},${gg},${b},0.85)`); gr.addColorStop(0.96, `rgba(${r},${gg},${b},0.25)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return (D5S.spr[k] = c);
}
function d5_bokeh(g, seed, n, a = 1) {
  const r = mulberry32(seed), cols = [D5.lav2, D5.teal2, D5.peach, D5.milk, D5.lav, D5.or2];
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, big = r() < 0.3, s = big ? 36 + r() * 70 : 5 + r() * 18;
    const col = cols[Math.floor(r() * cols.length)];
    g.globalAlpha = (big ? 0.05 + r() * 0.09 : 0.12 + r() * 0.3) * a;
    g.drawImage(d5_bokSpr(col), x - s, y - s, 2 * s, 2 * s);
  }
  g.fillStyle = D5.milk;
  for (let i = 0; i < n * 1.6; i++) {
    const x = r() * W, y = r() * H, s = 0.6 + r() * 1.4;
    g.globalAlpha = (0.15 + r() * 0.5) * a; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  g.restore();
}
// downscaled + blurred copy of everything drawn so far: the backdrop seen through frosted glass
function d5_snap(g) {
  if (!D5S.small) { D5S.small = canvas(240, 135); D5S.blur = canvas(240, 135); }
  const s = D5S.small.getContext('2d'), b = D5S.blur.getContext('2d');
  s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high';
  s.clearRect(0, 0, 240, 135); s.drawImage(g.canvas, 0, 0, 240, 135);
  b.clearRect(0, 0, 240, 135); b.drawImage(D5S.small, 0, 0);
  b.filter = 'blur(3px)'; b.drawImage(D5S.small, 0, 0); b.filter = 'none';
}
function d5_bg(g, blobs, o = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, W * 0.35, H);
  gr.addColorStop(0, '#1C1249'); gr.addColorStop(0.5, '#120B2E'); gr.addColorStop(1, '#09051A');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen';
  for (const b of blobs) d5_blob(g, ...b);
  g.globalCompositeOperation = 'source-over';
  if (o.bokeh !== 0) d5_bokeh(g, o.seed || 5, o.bokeh || 40, o.bokA || 1);
  g.restore();
  d5_snap(g);
}
function d5_finish(g, vig = 0.55) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const v = g.createRadialGradient(CX, CY * 0.92, 520, CX, CY, 1220);
  v.addColorStop(0, 'rgba(6,3,20,0)'); v.addColorStop(1, `rgba(6,3,20,${vig})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (!D5S.grain) {
    const c = canvas(256, 256), x = c.getContext('2d'), id = x.createImageData(256, 256), r = mulberry32(99);
    for (let i = 0; i < 256 * 256; i++) { const v2 = 128 + (r() - 0.5) * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v2; id.data[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0); D5S.grain = c;
  }
  g.globalAlpha = 0.07; g.globalCompositeOperation = 'overlay';
  g.fillStyle = g.createPattern(D5S.grain, 'repeat'); g.fillRect(0, 0, W, H);
  g.restore();
}
// light streaks converging on (cx, cy)
function d5_streaks(g, cx, cy, seed, n, d0, d1, sy = 0.62) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, a0 = d0 + r() * 520, a1 = d1 + r() * 160, col = [D5.teal2, D5.or2, D5.lav2][i % 3], pk = 0.2 + r() * 0.35;
    const x0 = cx + Math.cos(a) * a0, y0 = cy + Math.sin(a) * a0 * sy, x1 = cx + Math.cos(a) * a1, y1 = cy + Math.sin(a) * a1 * sy;
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, hexA(col, 0)); gr.addColorStop(0.75, hexA(col, pk)); gr.addColorStop(1, hexA(col, 0));
    g.strokeStyle = gr; g.lineWidth = 1 + r() * 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    addGlow(g, col, lerp(x0, x1, 0.75), lerp(y0, y1, 0.75), 10 + r() * 14, pk * 1.4);
  }
  g.restore();
}

/* ───────────── frosted glass ───────────── */
// glass body: soft shadow, blurred backdrop, violet tint, milky sheen, iridescent corners, inner rim light
function d5_body(g, path, bx, o = {}) {
  const [x0, y0, x1, y1] = bx, bw = x1 - x0, bh = y1 - y0;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.a != null) g.globalAlpha *= o.a;
  const sa = o.shadow == null ? 0.5 : o.shadow;
  if (sa > 0) {
    g.save();
    g.shadowColor = `rgba(5,2,18,${sa})`; g.shadowBlur = o.sblur || clamp(bh * 0.2, 18, 80);
    g.shadowOffsetX = 6000; g.shadowOffsetY = o.sdy == null ? clamp(bh * 0.07, 6, 40) : o.sdy;
    g.translate(-6000, 0); path(); g.fillStyle = '#000'; g.fill(); g.restore();
  }
  g.save(); path(); g.clip();
  if (o.frost !== false && D5S.blur) { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(D5S.blur, 0, 0, W, H); }
  const R = [x0 - 8, y0 - 8, bw + 16, bh + 16];
  g.fillStyle = o.tint || `rgba(28,17,72,${o.dark == null ? 0.3 : o.dark})`; g.fillRect(...R);
  const sv = o.sheen == null ? 0.16 : o.sheen;
  const sh = g.createLinearGradient(x0, y0, x0 + bw * 0.5, y1);
  sh.addColorStop(0, `rgba(245,243,255,${sv})`); sh.addColorStop(0.5, `rgba(245,243,255,${sv * 0.2})`); sh.addColorStop(1, `rgba(245,243,255,${sv * 0.42})`);
  g.fillStyle = sh; g.fillRect(...R);
  const iri = o.iri == null ? 1 : o.iri;
  if (iri > 0) {
    g.globalCompositeOperation = 'screen';
    const rb = Math.max(bw, bh) * 0.75;
    d5_blob(g, x1, y0, rb, D5.teal, 0.13 * iri); d5_blob(g, x0, y1, rb, D5.or, 0.1 * iri);
    g.globalCompositeOperation = 'source-over';
  }
  const rim = g.createLinearGradient(0, y0, 0, y0 + Math.min(bh * 0.5, 110));
  rim.addColorStop(0, 'rgba(255,255,255,0.3)'); rim.addColorStop(1, 'rgba(255,255,255,0)');
  g.lineWidth = o.rim || 8; g.strokeStyle = rim; path(); g.stroke();
  g.restore();
  g.restore();
}
// glass edge: chromatic bevel lines just inside the rim, holographic hairline, white specular corner
function d5_edge(g, path, bx, o = {}) {
  const [x0, y0, x1, y1] = bx, bw = x1 - x0, bh = y1 - y0, ea = o.edge == null ? 1 : o.edge;
  if (ea <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.a != null) g.globalAlpha *= o.a;
  g.globalAlpha *= ea;
  g.save(); path(); g.clip();
  g.lineWidth = 1.5;
  g.translate(-3, -3); path(); g.strokeStyle = hexA(D5.or2, 0.4); g.stroke();
  g.translate(6, 6); path(); g.strokeStyle = hexA(D5.teal2, 0.38); g.stroke();
  g.restore();
  const lw = o.lw || 1.6;
  g.lineWidth = lw; path(); g.strokeStyle = d5_holo(g, x0, y0, x1, y1, 0.62); g.stroke();
  const sp = g.createLinearGradient(x0, y0, x0 + bw * 0.5, y0 + bh * 0.5);
  sp.addColorStop(0, 'rgba(255,255,255,0.95)'); sp.addColorStop(0.45, 'rgba(255,255,255,0.16)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
  g.lineWidth = lw + 0.6; path(); g.strokeStyle = sp; g.stroke();
  g.restore();
}
// flat glass card in screen space; content(g) is drawn between body and edge
function d5_card(g, x, y, w, h, r, o = {}, content) {
  const path = () => rr(g, x, y, w, h, r), bx = [x, y, x + w, y + h];
  d5_body(g, path, bx, o);
  if (content) { g.save(); content(g); g.restore(); }
  d5_edge(g, path, bx, o);
}
// rounded rectangle projected through a pose
function d5_ppath(g, P, w, h, r, seg = 6) {
  const hw = w / 2, hh = h / 2;
  const cs = [[hw - r, -hh + r, -Math.PI / 2], [hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2], [-hw + r, -hh + r, Math.PI]];
  g.beginPath(); let first = true;
  for (const [cx, cy, a0] of cs) for (let k = 0; k <= seg; k++) {
    const a = a0 + k / seg * Math.PI / 2, p = P(cx + r * Math.cos(a), cy + r * Math.sin(a));
    if (first) { g.moveTo(p[0], p[1]); first = false; } else g.lineTo(p[0], p[1]);
  }
  g.closePath();
}
function d5_pcirc(g, P, r, w = 0, n = 72) {
  g.beginPath();
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, p = P(Math.cos(a) * r, Math.sin(a) * r, w); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
  g.closePath();
}
function d5_pbox(P, w, h) {
  const pts = [P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
function d5_tex(w, h, fn, k = 1.5, pad = 0) {
  const T = makeTex(w + pad * 2, h + pad * 2, k), x = texBegin(T);
  x.save(); x.translate(pad, pad); fn(x, w, h); x.restore();
  return T;
}
/* Seamless perspective warp for translucent textures. core's plane3d widens every
 * triangle by 0.75 px, so on a see-through texture the overlaps double up into a
 * visible grid. Here the triangles are NOT widened and are summed with 'lighter' on
 * a cleared layer: the anti-aliased coverages of two neighbours add up to 1, so the
 * shared edges vanish. The layer is then composited onto g. */
function d5_tri(g, img, s0, s1, s2, d0, d1, d2) {
  const [x0, y0] = s0, [x1, y1] = s1, [x2, y2] = s2;
  const D = x0 * (y1 - y2) - y0 * (x1 - x2) + (x1 * y2 - x2 * y1);
  if (Math.abs(D) < 1e-9) return;
  const solve = (q0, q1, q2) => [
    (q0 * (y1 - y2) - y0 * (q1 - q2) + (q1 * y2 - q2 * y1)) / D,
    (x0 * (q1 - q2) - q0 * (x1 - x2) + (x1 * q2 - x2 * q1)) / D,
    (x0 * (y1 * q2 - y2 * q1) - y0 * (x1 * q2 - x2 * q1) + q0 * (x1 * y2 - x2 * y1)) / D,
  ];
  const [a, c, e] = solve(d0[0], d1[0], d2[0]), [b, d, f] = solve(d0[1], d1[1], d2[1]);
  g.save();
  g.beginPath(); g.moveTo(d0[0], d0[1]); g.lineTo(d1[0], d1[1]); g.lineTo(d2[0], d2[1]); g.closePath(); g.clip();
  g.transform(a, b, c, d, e, f); g.drawImage(img, 0, 0);
  g.restore();
}
function d5_mesh(g, img, w, h, P, nx, ny) {
  const grid = [];
  for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(P((i / nx - 0.5) * w, (j / ny - 0.5) * h)); grid.push(row); }
  const tw = img.width, th = img.height;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i], d = grid[j + 1][i + 1];
    if (a[2] < 60 || b[2] < 60 || c[2] < 60 || d[2] < 60) continue;
    const sa = [i / nx * tw, j / ny * th], sb = [(i + 1) / nx * tw, j / ny * th], sc = [i / nx * tw, (j + 1) / ny * th], sd = [(i + 1) / nx * tw, (j + 1) / ny * th];
    d5_tri(g, img, sa, sb, sc, a, b, c);
    d5_tri(g, img, sb, sd, sc, b, d, c);
  }
}
function d5_plane(g, img, w, h, pose, o = {}) {
  if (!D5S.layer) D5S.layer = canvas(W, H);
  const L = D5S.layer, lx = L.getContext('2d');
  const P = projector(pose), bb = d5_pbox(P, w, h);
  const bx = Math.max(0, Math.floor(bb[0]) - 4), by = Math.max(0, Math.floor(bb[1]) - 4);
  const bw = Math.min(W, Math.ceil(bb[2]) + 4) - bx, bh = Math.min(H, Math.ceil(bb[3]) + 4) - by;
  if (bw <= 0 || bh <= 0) return P;
  lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(bx, by, bw, bh);
  lx.save(); lx.beginPath(); lx.rect(bx, by, bw, bh); lx.clip();
  lx.globalCompositeOperation = 'lighter'; lx.imageSmoothingEnabled = true; lx.imageSmoothingQuality = 'high';
  d5_mesh(lx, img, w, h, P, o.nx || 12, o.ny || 8);
  lx.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha *= (o.a == null ? 1 : o.a);
  if (o.op) g.globalCompositeOperation = o.op;
  g.drawImage(L, bx, by, bw, bh, bx, by, bw, bh);
  g.restore();
  return P;
}
// textured glass card in true perspective
function d5_card3(g, T, pose, o = {}) {
  const P = projector(pose), r = o.r == null ? 26 : o.r;
  const path = () => d5_ppath(g, P, T.w, T.h, r), bx = d5_pbox(P, T.w, T.h);
  d5_body(g, path, bx, o);
  d5_plane(g, T.c, T.w, T.h, pose, o);
  d5_edge(g, path, bx, o);
  return P;
}
// glass baked into a texture (for defocused / ghost cards)
function d5_texGlass(x, w, h, r, k = 1) {
  rr(x, 0, 0, w, h, r);
  const gr = x.createLinearGradient(0, 0, w * 0.6, h);
  gr.addColorStop(0, `rgba(196,182,255,${0.3 * k})`); gr.addColorStop(1, `rgba(92,72,205,${0.2 * k})`);
  x.fillStyle = gr; x.fill();
  x.lineWidth = 2; x.strokeStyle = d5_holo(x, 0, 0, w, h, Math.min(1, 0.65 * k)); x.stroke();
}
function d5_soft(T, px) {
  const c = canvas(T.c.width, T.c.height), x = c.getContext('2d');
  x.filter = `blur(${px}px)`; x.drawImage(T.c, 0, 0); x.filter = 'none';
  return { c, w: T.w, h: T.h, k: T.k };
}
function d5_softTex(fn, w, h, blur, r = 24, k = 1) {
  const pad = Math.ceil(blur * 2.5) + 4;
  const T = d5_tex(w, h, (x) => { d5_texGlass(x, w, h, r, k); fn(x, w, h); }, 1, pad);
  return blur > 0 ? d5_soft(T, blur) : T;
}
function d5_softCard(g, fn, w, h, pose, blur, a = 0.6, r = 24, k = 1) {
  const S = d5_softTex(fn, w, h, blur, r, k);
  d5_plane(g, S.c, S.w, S.h, pose, { a, nx: 6, ny: 4 });
}

/* ───────────── light: rings ───────────── */
function d5_ring(g, cx, cy, rx, ry, rot, a0, a1, lw, al = 1) {
  const cg = d5_conic(g, cx, cy, rot + 0.5, 1);
  const pass = (w, a, style) => {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a * al;
    g.lineWidth = w; g.lineCap = 'round'; g.strokeStyle = style;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, rot, a0, a1); g.stroke(); g.restore();
  };
  pass(lw * 5, 0.07, cg); pass(lw * 2.2, 0.2, cg); pass(lw, 0.75, cg); pass(Math.max(1, lw * 0.22), 0.85, 'rgba(255,255,255,0.9)');
}

/* ───────────── glossy coins (ticker initials, never real logos) ───────────── */
function d5_emblem(g, o, s, dark) {
  if (o.icon) {
    g.save(); g.translate(0, s * 0.08); d5_icon(g, o.icon, 0, 0, s * 1.5, 'rgba(255,255,255,0.6)', s * 0.2); g.restore();
    d5_icon(g, o.icon, 0, 0, s * 1.5, hexA(dark, 0.88), s * 0.2);
    return;
  }
  const l = o.label || '', n = l.length;
  if (!n) return;
  const fs = s * (n === 1 ? 1.7 : n === 2 ? 1.25 : n === 3 ? 0.95 : 0.78);
  const f = { f: 'Poppins', w: 800, s: fs, a: 'center' };
  text(g, l, 0, fs * 0.36 + s * 0.07, { ...f, c: 'rgba(255,255,255,0.6)' });
  text(g, l, 0, fs * 0.36, { ...f, c: hexA(dark, 0.9) });
}
function d5_coin(g, x, y, r, o = {}) {
  const [c0, c1, c2] = D5_COIN[o.col || 'btc'], tilt = o.tilt == null ? 0.6 : o.tilt, th = r * (o.th == null ? 0.2 : o.th), ry = r * tilt;
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  if (o.a != null) g.globalAlpha *= o.a;
  if (o.glow !== 0) addGlow(g, c1, 0, th * 0.5, r * 2.6, o.glow == null ? 0.3 : o.glow);
  // edge band (thickness)
  const eg = g.createLinearGradient(-r, 0, r, 0);
  eg.addColorStop(0, c2); eg.addColorStop(0.28, c1); eg.addColorStop(0.5, c0); eg.addColorStop(0.75, c1); eg.addColorStop(1, c2);
  g.fillStyle = eg;
  g.beginPath(); g.ellipse(0, th, r, ry, 0, 0, Math.PI); g.lineTo(-r, 0); g.lineTo(r, 0); g.closePath(); g.fill();
  g.strokeStyle = hexA(c2, 0.5); g.lineWidth = 1; g.beginPath(); g.ellipse(0, th, r, ry, 0, 0.1, Math.PI - 0.1); g.stroke();
  // face
  const fg = g.createRadialGradient(-r * 0.32, -ry * 0.6, r * 0.04, 0, 0, r * 1.1);
  fg.addColorStop(0, c0); fg.addColorStop(0.5, c1); fg.addColorStop(1, c2);
  g.fillStyle = fg; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, TAU); g.fill();
  g.save(); g.clip(); g.globalAlpha *= 0.32; g.globalCompositeOperation = 'soft-light';
  g.fillStyle = d5_conic(g, 0, 0, (o.rot || 0) + 0.7); g.fillRect(-r, -r, 2 * r, 2 * r); g.restore();
  // engraved ring
  g.lineWidth = r * 0.07; g.strokeStyle = hexA(c2, 0.5); g.beginPath(); g.ellipse(0, r * 0.025, r * 0.76, ry * 0.76, 0, 0, TAU); g.stroke();
  g.lineWidth = r * 0.035; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(0, -r * 0.012, r * 0.76, ry * 0.76, 0, Math.PI * 0.95, Math.PI * 1.95); g.stroke();
  g.save(); g.scale(1, tilt); d5_emblem(g, o, r * 0.4, c2); g.restore();
  // rim light + specular
  const rl = g.createLinearGradient(-r, -ry, r * 0.5, ry);
  rl.addColorStop(0, 'rgba(255,255,255,0.95)'); rl.addColorStop(0.5, 'rgba(255,255,255,0.12)'); rl.addColorStop(1, 'rgba(255,255,255,0)');
  g.lineWidth = r * 0.055; g.strokeStyle = rl; g.beginPath(); g.ellipse(0, 0, r * 0.975, ry * 0.975, 0, 0, TAU); g.stroke();
  addGlow(g, '#FFFFFF', -r * 0.42, -ry * 0.55, r * 0.5, 0.55);
  g.restore();
}
function d5_coinSoft(g, x, y, r, o, blur, a = 0.7) {
  const pad = Math.ceil(r * 1.5 + blur * 3), c = canvas(pad * 2, pad * 2);
  d5_coin(c.getContext('2d'), pad, pad, r, { ...o, glow: 0 });
  const b = canvas(pad * 2, pad * 2), bx = b.getContext('2d');
  bx.filter = `blur(${blur}px)`; bx.drawImage(c, 0, 0);
  g.save(); g.globalAlpha *= a; g.drawImage(b, x - pad, y - pad); g.restore();
}

/* ───────────── glossy rising arrow (as in the app's banner art) ───────────── */
function d5_rise(g, pts, w, o = {}) {
  const d = o.depth == null ? w * 0.45 : o.depth, n = pts.length;
  const [ax, ay] = pts[n - 2], [bx, by] = pts[n - 1];
  const ang = Math.atan2(by - ay, bx - ax), hl = w * 1.75, hw = w * 1.2;
  const base = [bx - Math.cos(ang) * hl, by - Math.sin(ang) * hl], nx = -Math.sin(ang), ny = Math.cos(ang);
  const head = [[bx + Math.cos(ang) * w * 0.1, by + Math.sin(ang) * w * 0.1], [base[0] + nx * hw, base[1] + ny * hw], [base[0] - nx * hw, base[1] - ny * hw]];
  const body = pts.slice(0, n - 1).concat([[base[0] + Math.cos(ang) * 2, base[1] + Math.sin(ang) * 2]]);
  const line = (dy, lw, style, cap = 'butt') => {
    g.save(); g.translate(0, dy); g.lineJoin = 'round'; g.lineCap = cap; g.lineWidth = lw; g.strokeStyle = style;
    g.beginPath(); body.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore();
  };
  const tri = (dy, style) => { g.save(); g.translate(0, dy); g.fillStyle = style; g.beginPath(); head.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.restore(); };
  g.save();
  if (o.a != null) g.globalAlpha *= o.a;
  if (o.glow !== 0) { for (let i = 0; i < n; i++) addGlow(g, D5.or, pts[i][0], pts[i][1], w * 3.2, 0.22); addGlow(g, D5.or2, bx, by, w * 4, 0.35); }
  g.save(); g.shadowColor = 'rgba(20,6,0,0.5)'; g.shadowBlur = w * 0.8; g.shadowOffsetY = w * 0.5; line(d, w, '#7A3A00'); tri(d, '#7A3A00'); g.restore();
  for (let k = d; k > 0; k -= 1.5) { const c = mixHex('#8E4300', '#C9690B', 1 - k / d); line(k, w, c); tri(k, c); }
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys) - w * 2, y1 = Math.max(...ys) + w;
  const top = g.createLinearGradient(0, y0, 0, y1);
  top.addColorStop(0, '#FFB24A'); top.addColorStop(0.5, '#F7931A'); top.addColorStop(1, '#F08A12');
  line(0, w, top); tri(0, top);
  // gloss: soft band and a sharp specular line along the upper edge
  g.save(); g.globalCompositeOperation = 'screen';
  line(-w * 0.18, w * 0.42, 'rgba(255,214,160,0.55)', 'butt');
  line(-w * 0.32, w * 0.09, 'rgba(255,255,255,0.75)', 'round');
  const hg = g.createLinearGradient(base[0] + nx * hw, base[1] + ny * hw, bx, by);
  hg.addColorStop(0, 'rgba(255,220,170,0)'); hg.addColorStop(1, 'rgba(255,230,190,0.6)');
  tri(0, hg);
  g.restore();
  g.restore();
}

/* ───────────── the app icon: black tile, white stacked logo ───────────── */
function d5_appIcon(g, cx, cy, s, o = {}) {
  const x0 = cx - s / 2, y0 = cy - s / 2, r = s * 0.22;
  g.save();
  if (o.glow) { addGlow(g, D5.or, cx, cy, s * 1.7, o.glow); addGlow(g, D5.or2, cx, cy, s * 0.95, o.glow * 0.6); }
  g.save(); g.shadowColor = `rgba(0,0,0,${o.shadow == null ? 0.45 : o.shadow})`; g.shadowBlur = s * 0.2; g.shadowOffsetY = s * 0.07;
  rr(g, x0, y0, s, s, r); g.fillStyle = '#0A0A0A'; g.fill(); g.restore();
  if (o.gloss !== false) {
    g.save(); rr(g, x0, y0, s, s, r); g.clip();
    const gr = g.createLinearGradient(0, y0, 0, y0 + s);
    gr.addColorStop(0, 'rgba(255,255,255,0.13)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.03)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x0, y0, s, s); g.restore();
    if (o.rim !== false) { rr(g, x0 + 0.75, y0 + 0.75, s - 1.5, s - 1.5, r); g.lineWidth = Math.max(1, s * 0.008); g.strokeStyle = 'rgba(255,255,255,0.16)'; g.stroke(); }
  }
  logo(g, cx, cy, s * 0.66, { ink: '#FFFFFF' });
  g.restore();
}

/* ───────────── frosted capsule (chip) with an icon disc ───────────── */
function d5_pillM(g, label, s) {
  const fs = 24 * s, h = 64 * s, ic = 44 * s, tw = d5_mw(g, label, fs, D5M, 700);
  return { fs, h, ic, w: ic + tw + 50 * s };
}
function d5_pillContent(x, px, py, label, icon, M, s, o = {}) {
  const cy = py + M.h / 2, ix = px + 10 * s + M.ic / 2;
  if (o.sel) { rr(x, px, py, M.w, M.h, M.h / 2); x.fillStyle = 'rgba(245,243,255,0.92)'; x.fill(); }
  const disc = o.disc || 'or';
  x.fillStyle = disc === 'or' ? d5_orFill(x, ix, cy - M.ic / 2, ix, cy + M.ic / 2) : disc === 'holo' ? d5_holo(x, ix - M.ic / 2, cy - M.ic / 2, ix + M.ic / 2, cy + M.ic / 2, 1) : disc;
  x.beginPath(); x.arc(ix, cy, M.ic / 2, 0, TAU); x.fill();
  if (typeof icon === 'function') icon(x, ix, cy, M.ic);
  else if (icon) d5_icon(x, icon, ix, cy, M.ic * 0.5, o.ic || (disc === 'or' || disc === 'holo' ? D5.deep : '#FFFFFF'), Math.max(1.6, 2.6 * s));
  d5_t(x, label, ix + M.ic / 2 + 13 * s, cy + M.fs * 0.36, M.fs, o.sel ? D5.deep : D5.milk, { w: 700 });
}
function d5_pill(g, cx, cy, label, icon, s, o = {}) {
  const M = d5_pillM(g, label, s), x0 = o.left ? cx : cx - M.w / 2, y0 = cy - M.h / 2;
  d5_card(g, x0, y0, M.w, M.h, M.h / 2, { dark: 0.36, sheen: 0.18, shadow: 0.45, iri: 0.6, rim: 5, ...o }, () => d5_pillContent(g, x0, y0, label, icon, M, s, o));
  return M;
}

/* ───────────── app UI (light theme, Inter) ───────────── */
function d5_u(x, s, px, py, size, col = D5A.ink, o = {}) {
  text(x, s, px, py, { f: D5I, w: o.w || 600, s: size, a: o.a || 'left', c: col, ls: o.ls || 0 });
}
function d5_uw(x, s, size, w = 600) { return measure(x, s, { f: D5I, w, s: size }); }
// green "● CANLI" badge; (px, cy) = left (or right) middle; returns the width
function d5_live(x, px, cy, fs, label = 'CANLI', a = 'left') {
  const tw = d5_uw(x, label, fs, 700), w = tw + fs * 2.1, h = fs * 1.9, x0 = a === 'right' ? px - w : px;
  rr(x, x0, cy - h / 2, w, h, h / 2); x.fillStyle = D5A.liveBg; x.fill();
  x.fillStyle = D5A.live; x.beginPath(); x.arc(x0 + fs * 0.78, cy, fs * 0.27, 0, TAU); x.fill();
  d5_u(x, label, x0 + fs * 1.3, cy + fs * 0.37, fs, D5A.liveTx, { w: 700 });
  return w;
}
// change pill "+0,13%" / "−1,49%", right edge at rx
function d5_chg(x, rx, cy, v, fs) {
  const up = v[0] === '+', tw = d5_uw(x, v, fs, 700), w = tw + fs * 1.1, h = fs * 1.8;
  rr(x, rx - w, cy - h / 2, w, h, h / 2); x.fillStyle = up ? D5A.upBg : D5A.dnBg; x.fill();
  d5_u(x, v, rx - w / 2, cy + fs * 0.37, fs, up ? D5A.up : D5A.dn, { w: 700, a: 'center' });
  return w;
}
const D5_CK = {
  BTC: ['#F7931A', '#FFFFFF', 'B'], ETH: ['#5B5BD6', '#FFFFFF', 'E'], XRP: ['#14161F', '#FFFFFF', 'X'], BNB: ['#F3BA2F', '#14161F', 'BN'],
  SOL: [['#8B5CF6', '#19D3C5'], '#FFFFFF', 'S'], DOGE: ['#C9A43A', '#FFFFFF', 'D'], ADA: ['#2563EB', '#FFFFFF', 'A'],
};
function d5_cIcon(x, cx, cy, r, k) {
  const [bg, fg, l] = D5_CK[k];
  if (Array.isArray(bg)) { const gr = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); x.fillStyle = gr; } else x.fillStyle = bg;
  x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  const fs = r * (l.length > 1 ? 0.78 : 0.98);
  d5_u(x, l, cx, cy + fs * 0.36, fs, fg, { w: 700, a: 'center' });
}
function d5_sIcon(x, cx, cy, r, t) {
  x.fillStyle = '#F1F2F6'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  x.strokeStyle = D5A.line; x.lineWidth = 1; x.stroke();
  const fs = Math.min(r * 0.78, r * 1.62 / (t.length * 0.66));
  d5_u(x, t, cx, cy + fs * 0.36, fs, D5A.ink, { w: 700, a: 'center' });
}
function d5_goldIcon(x, cx, cy, r) {
  const gr = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gr.addColorStop(0, D5A.gold1); gr.addColorStop(1, D5A.gold0);
  x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  d5_u(x, 'Au', cx, cy + r * 0.3, r * 0.82, '#FFFFFF', { w: 700, a: 'center' });
}
// segmented control; items: labels or [label, count]
function d5_seg(x, px, py, w, h, items, sel, fs, o = {}) {
  rr(x, px, py, w, h, h / 2); x.fillStyle = o.track || D5A.track; x.fill();
  const pad = 4, sw = (w - pad * 2) / items.length;
  items.forEach((it, i) => {
    const sx = px + pad + i * sw, on = i === sel;
    if (on) {
      x.save(); x.shadowColor = 'rgba(20,22,31,0.14)'; x.shadowBlur = 8; x.shadowOffsetY = 2;
      rr(x, sx, py + pad, sw, h - pad * 2, (h - pad * 2) / 2); x.fillStyle = o.selFill || '#FFFFFF'; x.fill(); x.restore();
    }
    const [lab, cnt] = Array.isArray(it) ? it : [it];
    const tc = on ? (o.selC || D5A.ink) : D5A.sec;
    if (cnt != null) {
      const lw = d5_uw(x, lab, fs, 700), cw = d5_uw(x, cnt, fs * 0.84, 700) + fs * 0.9, tot = lw + fs * 0.4 + cw, lx = sx + sw / 2 - tot / 2;
      d5_u(x, lab, lx, py + h / 2 + fs * 0.36, fs, tc, { w: 700 });
      rr(x, lx + lw + fs * 0.4, py + h / 2 - fs * 0.72, cw, fs * 1.44, fs * 0.72); x.fillStyle = D5A.badge; x.fill();
      d5_u(x, cnt, lx + lw + fs * 0.4 + cw / 2, py + h / 2 + fs * 0.31, fs * 0.84, D5A.lav, { w: 700, a: 'center' });
    } else d5_u(x, lab, sx + sw / 2, py + h / 2 + fs * 0.36, fs, tc, { w: on ? 700 : 600, a: 'center' });
  });
}
function d5_status(x, w, t) {
  d5_u(x, t, 36, 41, 15, D5A.ink, { w: 700 });
  x.fillStyle = D5A.ink;
  for (let i = 0; i < 4; i++) { rr(x, w - 96 + i * 6, 38 - (i + 1) * 3.2, 4, (i + 1) * 3.2, 1); x.fill(); }
  rr(x, w - 62, 27, 26, 13, 4); x.lineWidth = 1.4; x.strokeStyle = D5A.ink; x.stroke();
  rr(x, w - 60, 29, 18, 9, 2); x.fill(); rr(x, w - 35, 31, 2.4, 5, 1); x.fill();
}
// bottom navigation; the centre item is the app icon
function d5_nav(x, w, h, items) {
  const nh = 86, y0 = h - nh, ic = { 'Akış': 'feed', 'Haberler': 'news', 'Alarmlarım': 'bell', 'Hesabım': 'user', 'Grafik': 'stock', 'Favorilerim': 'star' };
  x.fillStyle = '#FFFFFF'; x.fillRect(0, y0, w, nh);
  x.fillStyle = D5A.line; x.fillRect(0, y0, w, 1.2);
  items.forEach((l, i) => {
    const cx = w * (i + 0.5) / items.length;
    if (i === 2) { d5_appIcon(x, cx, y0 + 34, 48, { shadow: 0.2, rim: false }); return; }
    d5_icon(x, ic[l], cx, y0 + 27, 20, D5A.sec, 1.9);
    d5_u(x, l, cx, y0 + 57, 11, D5A.sec, { w: 600, a: 'center' });
  });
}
// light app card sitting on a frosted glass slab (texture)
function d5_slab(fn, iw, ih, o = {}) {
  const m = o.m == null ? 16 : o.m, r = o.ir || 22, w = iw + m * 2, h = ih + m * 2;
  return d5_tex(w, h, (x) => {
    rr(x, 0, 0, w, h, r + m); x.fillStyle = 'rgba(245,243,255,0.07)'; x.fill();
    x.save(); x.shadowColor = 'rgba(10,6,30,0.35)'; x.shadowBlur = 18; x.shadowOffsetY = 6;
    rr(x, m, m, iw, ih, r); x.fillStyle = o.fill || D5A.card; x.fill(); x.restore();
    x.save(); rr(x, m, m, iw, ih, r); x.clip(); x.translate(m, m); fn(x, iw, ih); x.restore();
  }, o.k || 1.6);
}
function d5_card3L(g, fn, iw, ih, pose, o = {}) {
  const T = d5_slab(fn, iw, ih, o);
  return d5_card3(g, T, pose, { dark: 0.3, ...o, r: (o.ir || 22) + (o.m == null ? 16 : o.m) });
}
// glass phone with a light app screen
function d5_phone(g, scr, pose, o = {}) {
  const sw = 430, sh = 932, bz = 14, w = sw + bz * 2, h = sh + bz * 2;
  const T = d5_tex(w, h, (x) => {
    rr(x, 0, 0, w, h, 66); x.fillStyle = 'rgba(245,243,255,0.08)'; x.fill();
    x.save(); rr(x, bz, bz, sw, sh, 52); x.clip();
    x.fillStyle = D5A.page; x.fillRect(bz, bz, sw, sh);
    x.translate(bz, bz); scr(x, sw, sh);
    x.restore();
    rr(x, w / 2 - 60, bz + 12, 120, 34, 17); x.fillStyle = '#0A0A0A'; x.fill();
  }, o.k || 1.7);
  return d5_card3(g, T, pose, { r: 66, dark: 0.32, sheen: 0.24, shadow: 0.6, rim: 10, ...o });
}

/* ───────────── app screens (data from the client's screenshots) ───────────── */
const D5_CRYPTO = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
// Home screen: the live market card (Kripto tab)
function d5_scrCrypto(x, w, h) {
  logoH(x, 28, 52, 26);
  d5_icon(x, 'bell', w - 44, 42, 24, D5A.ink, 2.2);
  x.fillStyle = D5A.hair; x.fillRect(0, 80, w, 1.5);
  d5_seg(x, 28, 104, 390, 56, ['Kripto', 'Borsa', 'Emtia'], 0, 20);
  d5_live(x, w - 28, 132, 17, 'CANLI', 'right');
  const cP = 478, cD = 650, cW = w - 28, hy = 206;
  d5_u(x, 'Varlık', 28, hy, 16, D5A.sec);
  d5_u(x, 'Fiyat', cP, hy, 16, D5A.sec, { a: 'right' });
  d5_u(x, 'Günlük', cD, hy, 16, D5A.sec, { a: 'right' });
  d5_u(x, 'Haftalık', cW, hy, 16, D5A.sec, { a: 'right' });
  D5_CRYPTO.forEach(([k, n, p, v, d, wk], i) => {
    const y = 268 + i * 84;
    x.fillStyle = D5A.hair; x.fillRect(28, y - 44, w - 56, 1.5);
    d5_cIcon(x, 56, y, 26, k);
    d5_u(x, n, 96, y - 4, 22, D5A.ink, { w: 700 });
    d5_u(x, p, 96, y + 21, 15, D5A.sec, { w: 500 });
    d5_u(x, v, cP, y + 8, 22, D5A.ink, { w: 700, a: 'right' });
    d5_chg(x, cD, y, d, 17);
    d5_chg(x, cW, y, wk, 17);
  });
  x.fillStyle = D5A.hair; x.fillRect(28, h - 62, w - 56, 1.5);
  d5_u(x, 'Güncellendi 14:24', w / 2, h - 26, 15, D5A.sec, { w: 500, a: 'center' });
}
const D5_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%', 501],
  ['META', 'Meta Platforms', '$612,49', '−1,24%', 502],
  ['NVDA', 'NVIDIA', '$215,38', '−1,17%', 503],
  ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%', 504],
  ['TSLA', 'Tesla', '$404,22', '−0,79%', 505],
  ['MSFT', 'Microsoft', '$531,01', '−0,06%', 506],
  ['AAPL', 'Apple', '$343,83', '−0,94%', 507],
];
function d5_idxSpark(x, seed, up, x0, x1, y0, y1, lw) {
  const pts = d5_map(d5_series(seed, 36, up ? 0.0012 : -0.001, 0.011, up ? 1.035 : 0.97), x0, x1, y0, y1);
  const col = up ? D5A.up : D5A.dn;
  const af = x.createLinearGradient(0, y0, 0, y1); af.addColorStop(0, hexA(col, 0.22)); af.addColorStop(1, hexA(col, 0));
  x.beginPath(); smoothPath(x, pts); x.lineTo(x1, y1); x.lineTo(x0, y1); x.closePath(); x.fillStyle = af; x.fill();
  d5_spark(x, pts, col, lw, { glow: 0 });
}
function d5_idxMini(x, px, py, w, h, n, v, c, seed) {
  x.save(); x.shadowColor = 'rgba(20,22,31,0.07)'; x.shadowBlur = 10; x.shadowOffsetY = 3;
  rr(x, px, py, w, h, 16); x.fillStyle = '#FFFFFF'; x.fill(); x.restore();
  d5_u(x, n, px + 14, py + 26, 12.5, D5A.sec);
  d5_u(x, v, px + 14, py + 54, 19, D5A.ink, { w: 700 });
  d5_chg(x, px + w - 12, py + 21, c, 11);
  d5_idxSpark(x, seed, c[0] === '+', px + 14, px + w - 14, py + 66, py + h - 12, 2);
}
// Borsa screen
function d5_scrBorsa(x, w, h) {
  d5_status(x, w, '14:23');
  d5_u(x, 'Borsa', 20, 100, 30, D5A.ink, { w: 700 });
  d5_u(x, 'BIST ve Nasdaq hisseleri', 20, 124, 14, D5A.sec, { w: 500 });
  d5_live(x, w - 20, 91, 12, 'CANLI · 14:23', 'right');
  const cw = (w - 52) / 2;
  d5_idxMini(x, 20, 146, cw, 112, 'BIST 100', '11.165,44', '+0,13%', 611);
  d5_idxMini(x, 32 + cw, 146, cw, 112, 'Nasdaq 100', '29.813,16', '+0,55%', 612);
  d5_seg(x, 20, 274, w - 40, 44, [['Tümü', '210'], ['BIST', '108'], ['Nasdaq', '102']], 0, 13.5);
  // filters
  let fx = 20; const fy = 350, fs = 12.5;
  [['Favoriler', 'star'], ['Popüler'], ['Yükselenler'], ['Düşenler']].forEach(([l, ic], i) => {
    const tw = d5_uw(x, l, fs, 700), iw = ic ? 16 : 0, cw2 = tw + iw + 24, on = i === 1;
    rr(x, fx, fy - 16, cw2, 32, 16); x.fillStyle = on ? D5A.ink : '#FFFFFF'; x.fill();
    if (!on) { x.lineWidth = 1.2; x.strokeStyle = D5A.line; x.stroke(); }
    if (ic) d5_icon(x, 'star', fx + 18, fy, 13, D5A.or);
    d5_u(x, l, fx + 12 + iw, fy + fs * 0.36, fs, on ? '#FFFFFF' : D5A.ink, { w: 700 });
    fx += cw2 + 8;
  });
  rr(x, 20, 384, w - 40, 44, 22); x.fillStyle = '#FFFFFF'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = D5A.line; x.stroke();
  d5_icon(x, 'search', 44, 406, 16, D5A.sec, 1.8);
  d5_u(x, 'Hisse adı ya da kodu ara…', 64, 411, 13.5, D5A.sec, { w: 500 });
  d5_u(x, '210 hisse', 20, 458, 13, D5A.ink, { w: 700 });
  d5_u(x, 'Fiyat · Günlük', w - 20, 458, 12, D5A.sec, { w: 500, a: 'right' });
  rr(x, 12, 470, w - 24, 400, 18); x.fillStyle = '#FFFFFF'; x.fill();
  D5_STOCKS.forEach(([t, n, v, c, sd], i) => {
    const y = 502 + i * 58;
    if (i) { x.fillStyle = D5A.hair; x.fillRect(24, y - 29, w - 48, 1.2); }
    d5_sIcon(x, 42, y, 18, t);
    d5_u(x, t, 70, y - 3, 14.5, D5A.ink, { w: 700 });
    const tw = d5_uw(x, t, 14.5, 700);
    rr(x, 76 + tw, y - 15, 50, 16, 5); x.fillStyle = '#F1F2F6'; x.fill();
    d5_u(x, 'NASDAQ', 101 + tw, y - 3.5, 8.5, D5A.sec, { w: 700, a: 'center' });
    d5_u(x, n, 70, y + 15, 11.5, D5A.sec, { w: 500 });
    const up = c[0] === '+';
    d5_spark(x, d5_map(d5_series(sd, 22, up ? 0.003 : -0.002, 0.012, up ? 1.05 : 0.985), 262, 316, y - 10, y + 10), up ? D5A.up : D5A.dn, 1.6, { glow: 0 });
    d5_u(x, v, w - 24, y - 3, 14.5, D5A.ink, { w: 700, a: 'right' });
    d5_chg(x, w - 24, y + 14, c, 10);
  });
  d5_nav(x, w, h, ['Akış', 'Haberler', '', 'Alarmlarım', 'Hesabım']);
}
// Kasam screen
function d5_scrKasam(x, w, h) {
  d5_status(x, w, '14:24');
  d5_u(x, 'Kasam', 20, 100, 30, D5A.ink, { w: 700 });
  d5_icon(x, 'lock', w - 38, 90, 22, D5A.lav, 2.2);
  d5_u(x, 'Altın, döviz ve kişisel varlıkların', 20, 124, 14, D5A.sec, { w: 500 });
  const gr = x.createLinearGradient(20, 146, w - 20, 340); gr.addColorStop(0, '#5A47F0'); gr.addColorStop(1, '#8F7FFF');
  rr(x, 20, 146, w - 40, 196, 24); x.fillStyle = gr; x.fill();
  x.save(); rr(x, 20, 146, w - 40, 196, 24); x.clip();
  x.globalAlpha = 0.16; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(w - 50, 170, 120, 0, TAU); x.fill(); x.beginPath(); x.arc(w - 10, 330, 80, 0, TAU); x.fill();
  x.restore();
  d5_u(x, 'Toplam', 44, 194, 15, 'rgba(255,255,255,0.82)', { w: 600 });
  text(x, '₺1.250.430', 42, 254, { f: D5I, w: 700, s: 44, a: 'left', c: '#FFFFFF', ls: -0.5 });
  rr(x, 44, 280, 178, 34, 17); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fill();
  d5_icon(x, 'shield', 64, 297, 16, '#FFFFFF', 1.8);
  d5_u(x, 'Güvenle takip et', 80, 302, 13, '#FFFFFF', { w: 600 });
  // composition ring (no amounts: example only)
  rr(x, 20, 360, w - 40, 222, 22); x.fillStyle = '#FFFFFF'; x.fill();
  const segs = [[0.5, D5A.gold1], [0.28, '#19D3C5'], [0.22, D5A.lav]], dc = [112, 471];
  let a = -Math.PI / 2; x.lineWidth = 22; x.lineCap = 'butt';
  segs.forEach(([v, c]) => { x.strokeStyle = c; x.beginPath(); x.arc(dc[0], dc[1], 64, a + 0.04, a + v * TAU - 0.04); x.stroke(); a += v * TAU; });
  d5_icon(x, 'lock', dc[0], dc[1], 26, D5A.ink, 2.2);
  [['Altın', D5A.gold1], ['Döviz', '#19D3C5'], ['Kişisel varlıklar', D5A.lav]].forEach(([l, c], i) => {
    const y = 432 + i * 40;
    x.fillStyle = c; rr(x, 212, y - 11, 14, 14, 4); x.fill();
    d5_u(x, l, 236, y + 1, 15, D5A.ink, { w: 600 });
  });
  // rows
  [['Altın', 'Gram, çeyrek, ata…', 'gold'], ['Döviz', 'Dolar ve diğerleri', 'fx'], ['Kişisel varlıklar', 'Kendi eklediklerin', 'me']].forEach(([l, s2, k], i) => {
    const y = 630 + i * 62;
    if (i) { x.fillStyle = D5A.hair; x.fillRect(32, y - 31, w - 64, 1.2); }
    if (k === 'gold') d5_goldIcon(x, 46, y, 18);
    else { x.fillStyle = k === 'fx' ? '#DDF8F5' : D5A.badge; x.beginPath(); x.arc(46, y, 18, 0, TAU); x.fill(); d5_u(x, k === 'fx' ? '$' : '★', 46, y + 6, 16, k === 'fx' ? '#0A8A80' : D5A.lav, { w: 700, a: 'center' }); }
    d5_u(x, l, 76, y - 3, 15, D5A.ink, { w: 700 });
    d5_u(x, s2, 76, y + 15, 12, D5A.sec, { w: 500 });
    d5_icon(x, 'chev', w - 38, y, 14, D5A.sec, 1.8);
  });
  rr(x, 20, 790, w - 40, 50, 25); x.fillStyle = D5A.or; x.fill();
  d5_u(x, 'Kasamı Gör', w / 2 - 8, 821, 16, '#FFFFFF', { w: 700, a: 'center' });
  d5_icon(x, 'arrow', w / 2 + 62, 815, 16, '#FFFFFF', 2.2);
  d5_nav(x, w, h, ['Akış', 'Haberler', '', 'Alarmlarım', 'Hesabım']);
}
// gold card: "Au Altın · Kapalıçarşı · canlı"
function d5_scrGold(x, w, h) {
  x.fillStyle = D5A.cream; x.fillRect(0, 0, w, h);
  d5_goldIcon(x, 52, 56, 28);
  d5_u(x, 'Altın', 94, 52, 26, D5A.ink, { w: 700 });
  x.fillStyle = D5A.live; x.beginPath(); x.arc(100, 75, 5, 0, TAU); x.fill();
  d5_u(x, 'Kapalıçarşı · canlı', 112, 80, 15, D5A.sec, { w: 600 });
  // ₺ TL | $ USD toggle
  const tx = w - 250, ty = 32, tw = 222, th = 48;
  rr(x, tx, ty, tw, th, th / 2); x.fillStyle = D5A.creamTrack; x.fill();
  const gg = x.createLinearGradient(tx, 0, tx + tw / 2, 0); gg.addColorStop(0, D5A.gold0); gg.addColorStop(1, D5A.gold1);
  rr(x, tx + 4, ty + 4, tw / 2 - 4, th - 8, (th - 8) / 2); x.fillStyle = gg; x.fill();
  d5_u(x, '₺ TL', tx + tw / 4 + 2, ty + 30, 17, '#FFFFFF', { w: 700, a: 'center' });
  d5_u(x, '$ USD', tx + tw * 3 / 4, ty + 30, 17, D5A.sec, { w: 700, a: 'center' });
  const pw = (w - 60) / 2;
  [['Gram Altın', '₺6.510,83', '+0,40%', 'Alış 6.422 · Satış 6.511'], ['Ons Altın', '$4.033,60', '+0,40%', null]].forEach(([n, v, c, s2], i) => {
    const px = 24 + i * (pw + 12), py = 112, ph = h - 136;
    x.save(); x.shadowColor = 'rgba(120,90,10,0.12)'; x.shadowBlur = 12; x.shadowOffsetY = 3;
    rr(x, px, py, pw, ph, 18); x.fillStyle = '#FFFFFF'; x.fill(); x.restore();
    d5_u(x, n, px + 22, py + 38, 17, D5A.sec, { w: 600 });
    d5_chg(x, px + pw - 18, py + 32, c, 15);
    text(x, v, px + 20, py + 98, { f: D5I, w: 700, s: 40, a: 'left', c: D5A.ink, ls: -0.5 });
    if (s2) d5_u(x, s2, px + 22, py + 138, 15, D5A.sec, { w: 600 });
    else d5_u(x, 'Ons · USD', px + 22, py + 138, 15, D5A.sec, { w: 600 });
  });
}
const D5_GOLD = [
  ['Gram Altın', '24 ayar · gram', '6.422,05', '6.510,83', '+0,40%'],
  ['Has Altın', '995 · gram', '6.454,32', '6.491,36', null],
  ['22 Ayar', 'bilezik · gram', '5.871,43', '6.081,88', null],
  ['Çeyrek Altın', '1,75 gr · 22 ayar', '10.327', '10.476', '+0,60%'],
  ['Yarım Altın', null, '20.654', '20.815', null],
  ['Tam Altın', null, '41.372', '41.727', null],
  ['Ata Altın', null, '42.566', '42.993', '+0,32%'],
  ['Gremse', null, '102.946', '104.301', null],
  ['Ata Beşli', null, '212.799', '214.914', '+0,25%'],
];
function d5_scrGoldTable(x, w, h) {
  d5_u(x, 'ALTIN FİYATLARI', 28, 58, 17, D5A.ink, { w: 700, ls: 1.5 });
  d5_seg(x, w - 296, 30, 268, 44, ['Yeni basım', 'Eski basım'], 1, 15, { track: D5A.creamTrack });
  const cA = 418, cS = 548, cD = w - 28, hy = 118;
  x.fillStyle = '#F7F7FA'; x.fillRect(0, hy - 26, w, 40);
  d5_u(x, 'Ürün', 28, hy, 14, D5A.sec); d5_u(x, 'Alış', cA, hy, 14, D5A.sec, { a: 'right' });
  d5_u(x, 'Satış', cS, hy, 14, D5A.sec, { a: 'right' }); d5_u(x, 'Değişim', cD, hy, 14, D5A.sec, { a: 'right' });
  D5_GOLD.forEach(([n, s2, al, sa, c], i) => {
    const y = 168 + i * 62;
    if (i) { x.fillStyle = D5A.hair; x.fillRect(28, y - 31, w - 56, 1.4); }
    if (s2) { d5_u(x, n, 28, y - 3, 18, D5A.ink, { w: 700 }); d5_u(x, s2, 28, y + 17, 13, D5A.sec, { w: 500 }); }
    else d5_u(x, n, 28, y + 6, 18, D5A.ink, { w: 700 });
    d5_u(x, al, cA, y + 6, 17, D5A.ink, { w: 600, a: 'right' });
    d5_u(x, sa, cS, y + 6, 17, D5A.ink, { w: 700, a: 'right' });
    if (c) d5_chg(x, cD, y, c, 14);
  });
}
// candles for the technical-analysis card (gram gold, ending at 6.510,83)
function d5_candles(n, seed) {
  const r = mulberry32(seed), wk = [0];
  for (let i = 1; i < n; i++) wk.push(wk[i - 1] + (r() - 0.5) * 18);
  const cl = wk.map((v, i) => 6445 + (6510.83 - 6445) * Math.pow(i / (n - 1), 1.7) + (v - wk[n - 1] * i / (n - 1)) * 0.55);
  return cl.map((c, i) => {
    const o = i ? cl[i - 1] : c - 5;
    return { o, c, h: Math.max(o, c) + 3 + r() * 8, l: Math.min(o, c) - 3 - r() * 8 };
  });
}
function d5_scrChart(x, w, h) {
  d5_goldIcon(x, 50, 54, 24);
  d5_u(x, 'Gram Altın', 86, 50, 24, D5A.ink, { w: 700 });
  d5_u(x, 'Kapalıçarşı · canlı', 86, 74, 14, D5A.sec, { w: 500 });
  text(x, '₺6.510,83', w - 28, 58, { f: D5I, w: 700, s: 34, a: 'right', c: D5A.ink, ls: -0.5 });
  d5_chg(x, w - 28, 88, '+0,40%', 15);
  // tool chips
  let cx = 28;
  [['Teknik analiz', true], ['Hisse analizi'], ['Fiyat tahmini']].forEach(([l, on]) => {
    const tw = d5_uw(x, l, 14, 700) + 28;
    rr(x, cx, 112, tw, 34, 17); x.fillStyle = on ? D5A.badge : D5A.track2; x.fill();
    d5_u(x, l, cx + tw / 2, 134, 14, on ? D5A.lav : D5A.sec, { w: 700, a: 'center' });
    cx += tw + 8;
  });
  const G = { x0: 28, x1: w - 92, y0: 172, y1: h - 34 }, lo = 6400, hi = 6550;
  const Y = v => lerp(G.y1, G.y0, (v - lo) / (hi - lo));
  [6420, 6460, 6540].forEach(v => { x.fillStyle = D5A.hair; x.fillRect(G.x0, Y(v), G.x1 - G.x0, 1.2); d5_u(x, v.toLocaleString('tr-TR'), w - 28, Y(v) + 5, 13, D5A.sec, { w: 500, a: 'right' }); });
  const C = d5_candles(36, 7714), bw = (G.x1 - G.x0) / C.length;
  // moving average
  const ma = C.map((_, i) => { const s = C.slice(Math.max(0, i - 6), i + 1); return s.reduce((a, b) => a + b.c, 0) / s.length; });
  d5_spark(x, ma.map((v, i) => [G.x0 + (i + 0.5) * bw, Y(v)]), D5A.lav, 2.4, { glow: 0 });
  C.forEach((k, i) => {
    const up = k.c >= k.o, col = up ? D5A.up : D5A.dn, cxx = G.x0 + (i + 0.5) * bw;
    x.fillStyle = col; x.fillRect(cxx - 0.9, Y(k.h), 1.8, Y(k.l) - Y(k.h));
    rr(x, cxx - bw * 0.32, Y(Math.max(k.o, k.c)), bw * 0.64, Math.max(2, Math.abs(Y(k.o) - Y(k.c))), 1.5); x.fill();
  });
  // alarm line at 6.500
  const ay = Y(6500);
  x.save(); x.setLineDash([8, 6]); x.strokeStyle = D5A.or; x.lineWidth = 2.2; x.beginPath(); x.moveTo(G.x0, ay); x.lineTo(w - 20, ay); x.stroke(); x.restore();
  const lab = 'Alarm ₺6.500', lw = d5_uw(x, lab, 14, 700) + 46;
  rr(x, G.x0 + 8, ay + 10, lw, 32, 16); x.fillStyle = D5A.or; x.fill();
  d5_icon(x, 'bell', G.x0 + 26, ay + 26, 15, '#FFFFFF', 1.8);
  d5_u(x, lab, G.x0 + 40, ay + 31, 14, '#FFFFFF', { w: 700 });
  // last price
  const last = C[C.length - 1], ly = Y(last.c);
  rr(x, w - 88, ly - 14, 80, 28, 8); x.fillStyle = D5A.up; x.fill();
  d5_u(x, '6.510,83', w - 48, ly + 5, 13, '#FFFFFF', { w: 700, a: 'center' });
}

/* ───────────── scene 1: the scattered places (other apps, a website) ───────────── */
function d5_oHead(x, w, title, sub, col, icon) {
  x.fillStyle = col; rr(x, 22, 20, 46, 46, 14); x.fill();
  d5_icon(x, icon, 45, 43, 24, D5.deep, 2.6);
  d5_t(x, title, 82, 41, 21, D5.milk, { w: 800 });
  d5_t(x, sub, 82, 62, 15, D5.soft, { w: 600 });
  for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(245,243,255,0.28)'; x.beginPath(); x.arc(w - 28 - i * 13, 40, 3.5, 0, TAU); x.fill(); }
}
function d5_oExch(x, w, h) {
  d5_oHead(x, w, 'Kripto borsası', 'Bir uygulama', D5.or2, 'hex');
  d5_k(x, 'BTC/USDT', 24, 108, 13, D5.soft);
  d5_t(x, '$80.220,05', 22, 146, 32, D5.milk, { w: 800 });
  d5_t(x, '−1,49%', w - 22, 144, 18, D5.dn, { w: 800, a: 'right' });
  const r = mulberry32(77), n = 22, x0 = 24, x1 = w - 24, y0 = 168, y1 = h - 20, bw = (x1 - x0) / n;
  let v = 0.7;
  for (let i = 0; i < n; i++) {
    const o = v; v = clamp(v + (r() - 0.56) * 0.2, 0.1, 0.9);
    const hi = Math.max(o, v) + r() * 0.08, lo = Math.min(o, v) - r() * 0.08, up = v >= o, cx = x0 + i * bw + bw / 2, Y = q => lerp(y1, y0, q);
    x.fillStyle = up ? D5.up : D5.dn;
    x.fillRect(cx - 0.8, Y(hi), 1.6, Y(lo) - Y(hi));
    rr(x, cx - bw * 0.3, Y(Math.max(o, v)), bw * 0.6, Math.max(2, Math.abs(Y(o) - Y(v))), 1.5); x.fill();
  }
}
function d5_oStocks(x, w, h) {
  d5_oHead(x, w, 'Hisse uygulaması', 'Başka bir uygulama', D5.teal, 'stock');
  [['BIST 100', '11.165,44', '+0,13%', 11], ['Nasdaq 100', '29.813,16', '+0,55%', 12], ['NVDA', '$215,38', '−1,17%', 13]].forEach(([t, v, c, sd], i) => {
    const y = 120 + i * 56, up = c[0] === '+', col = up ? D5.up : D5.dn;
    x.fillStyle = 'rgba(245,243,255,0.1)'; x.fillRect(22, y - 32, w - 44, 1.2);
    d5_t(x, t, 24, y + 4, 18, D5.milk, { w: 800 });
    d5_spark(x, d5_map(d5_series(sd, 24, up ? 0.004 : -0.003, 0.02, up ? 1.08 : 0.95), 138, 196, y - 14, y + 6), col, 2, { glow: 4 });
    d5_t(x, v, 306, y + 4, 17, D5.milk, { w: 700, a: 'right' });
    d5_t(x, c, w - 22, y + 4, 15, col, { w: 800, a: 'right' });
  });
}
function d5_oWeb(x, w, h) {
  x.fillStyle = 'rgba(245,243,255,0.07)'; rr(x, 0, 0, w, 50, [24, 24, 0, 0]); x.fill();
  [[0, 'Altın fiyatları', true], [1, 'Döviz kurları', false]].forEach(([i, l, on]) => {
    const tx = 18 + i * 158;
    if (on) { rr(x, tx, 12, 150, 38, [12, 12, 0, 0]); x.fillStyle = 'rgba(245,243,255,0.14)'; x.fill(); }
    d5_t(x, l, tx + 16, 37, 15, on ? D5.milk : D5.dim, { w: 700 });
  });
  d5_t(x, '+', 352, 38, 22, D5.dim, { w: 700 });
  rr(x, 16, 62, w - 32, 36, 18); x.fillStyle = 'rgba(245,243,255,0.08)'; x.fill();
  d5_icon(x, 'search', 38, 80, 14, D5.soft, 1.8);
  d5_t(x, 'altın fiyatları canlı', 56, 86, 15, D5.soft, { w: 600 });
  [['Gram altın', '₺6.510,83'], ['Çeyrek altın', '₺10.476'], ['Ons altın', '$4.033,60']].forEach(([l, v], i) => {
    const y = 146 + i * 50;
    x.fillStyle = 'rgba(245,243,255,0.1)'; x.fillRect(22, y - 30, w - 44, 1.2);
    x.fillStyle = hexA('#F2C14E', 0.85); x.beginPath(); x.arc(36, y - 6, 9, 0, TAU); x.fill();
    d5_t(x, l, 56, y, 18, D5.milk, { w: 700 });
    d5_t(x, v, w - 24, y, 18, D5.milk, { w: 800, a: 'right' });
  });
}
function d5_oNotes(x, w, h) {
  d5_oHead(x, w, 'Notlar', 'Fiyat notlarım', D5.lav2, 'note');
  [['BTC', '80.220 mi?'], ['Gram altın', '6.510 ?'], ['BIST 100', 'bakılacak'], ['MU', 'hangi uygulamadaydı?']].forEach(([a, b], i) => {
    const y = 116 + i * 34;
    d5_t(x, '–', 24, y, 17, D5.dim, { w: 700 });
    d5_t(x, a, 42, y, 17, D5.milk, { w: 700 });
    d5_t(x, b, 42 + d5_mw(x, a, 17, D5M, 700) + 10, y, 17, D5.soft, { w: 500 });
  });
}
function d5_toast(x, w, h, icon, title, sub, col) {
  x.fillStyle = hexA(col, 0.22); x.beginPath(); x.arc(46, h / 2, 24, 0, TAU); x.fill();
  d5_icon(x, icon, 46, h / 2, 24, col, 2.6);
  d5_t(x, title, 84, h / 2 - 5, 20, D5.milk, { w: 800 });
  d5_t(x, sub, 84, h / 2 + 21, 15, D5.soft, { w: 600 });
}
const D5_APPS = {
  exch: [d5_oExch, 400, 290], stocks: [d5_oStocks, 400, 290], web: [d5_oWeb, 440, 300], notes: [d5_oNotes, 380, 260],
  toastA: [(x, w, h) => d5_toast(x, w, h, 'clock', 'Gece 03:12 · BTC −1,49%', 'Sen uyurken fiyat değişti', D5.or2), 420, 100],
  toastB: [(x, w, h) => d5_toast(x, w, h, 'tabs', '12 sekme açık', 'Hangisi güncel?', D5.teal2), 360, 100],
};

/* ───────────── scene 2: logo card ───────────── */
function d5_logoCard(x, w, h) {
  addGlow(x, D5.or, w / 2, 236, 300, 0.32);
  addGlow(x, D5.lav, w / 2, 236, 420, 0.25);
  x.fillStyle = d5_holo(x, w / 2 - 330, 0, w / 2 - 170, 0, 0.7); x.fillRect(w / 2 - 330, 484, 160, 2);
  x.fillStyle = d5_holo(x, w / 2 + 170, 0, w / 2 + 330, 0, 0.7); x.fillRect(w / 2 + 170, 484, 160, 2);
  d5_k(x, 'KRİPTO · BORSA · EMTİA', w / 2, 492, 18, D5.soft, { a: 'center', ls: 4 });
}

/* ───────────── scene 6: the glass vault ───────────── */
function d5_vaultTex(x, w, h) {
  const c = w / 2, R = w / 2;
  // bolts
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU, bx = c + Math.cos(a) * R * 0.88, by = c + Math.sin(a) * R * 0.88;
    const gr = x.createRadialGradient(bx - 4, by - 5, 1, bx, by, 13); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.5, '#CFC6FF'); gr.addColorStop(1, '#6A5BD0');
    x.fillStyle = gr; x.beginPath(); x.arc(bx, by, 12, 0, TAU); x.fill();
  }
  x.lineWidth = 3; x.strokeStyle = d5_holo(x, 0, 0, w, h, 0.75); x.beginPath(); x.arc(c, c, R * 0.78, 0, TAU); x.stroke();
  x.lineWidth = 1.5; x.strokeStyle = 'rgba(245,243,255,0.3)'; x.beginPath(); x.arc(c, c, R * 0.72, 0, TAU); x.stroke();
  x.lineWidth = 2; x.strokeStyle = 'rgba(245,243,255,0.35)'; x.beginPath(); x.arc(c, c, R * 0.6, 0, TAU); x.stroke();
  // dial ticks
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, r0 = R * (i % 5 ? 0.215 : 0.2), r1 = R * 0.245;
    x.strokeStyle = i % 5 ? 'rgba(245,243,255,0.35)' : 'rgba(245,243,255,0.8)'; x.lineWidth = i % 5 ? 1.5 : 2.5;
    x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); x.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.stroke();
  }
  // handle: three glossy spokes
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI + 0.3;
    x.save(); x.translate(c, c); x.rotate(a);
    const gr = x.createLinearGradient(0, -12, 0, 12); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.5, '#D9D2FF'); gr.addColorStop(1, '#7C6CE0');
    [-1, 1].forEach(sd => { rr(x, sd > 0 ? R * 0.25 : -R * 0.48, -9, R * 0.23, 18, 9); x.fillStyle = gr; x.fill(); x.beginPath(); x.arc(sd * R * 0.5, 0, 17, 0, TAU); x.fill(); });
    x.restore();
  }
  // hub: orange core
  const hg = x.createRadialGradient(c - 10, c - 14, 4, c, c, R * 0.2);
  hg.addColorStop(0, '#FFE2B8'); hg.addColorStop(0.5, '#F7931A'); hg.addColorStop(1, '#A65200');
  x.fillStyle = hg; x.beginPath(); x.arc(c, c, R * 0.16, 0, TAU); x.fill();
  addGlow(x, D5.or, c, c, R * 0.5, 0.45);
  x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.arc(c - R * 0.06, c - R * 0.07, R * 0.05, 0, TAU); x.fill();
}

/* ───────────── scene 7 / 8 cards ───────────── */
function d5_newsTex(x, w, h) {
  let tx = 26;
  [['Akış', false], ['Haberler', true]].forEach(([l, on]) => {
    const tw = d5_mw(x, l, 17, D5M, 800) + 34;
    rr(x, tx, 22, tw, 40, 20); x.fillStyle = on ? 'rgba(245,243,255,0.92)' : 'rgba(245,243,255,0.08)'; x.fill();
    d5_t(x, l, tx + tw / 2, 48, 17, on ? D5.deep : D5.soft, { w: 800, a: 'center' });
    tx += tw + 10;
  });
  [['Günün piyasa özeti', 'Kripto, borsa ve emtia', [D5.lav, D5.or]], ['Haftanın kripto gündemi', 'Haberler · 14:20', [D5.teal, D5.lav]]].forEach(([t, s, cs], i) => {
    const y = 96 + i * 78;
    const gr = x.createLinearGradient(26, y, 90, y + 60); gr.addColorStop(0, cs[0]); gr.addColorStop(1, cs[1]);
    rr(x, 26, y, 64, 60, 14); x.fillStyle = gr; x.fill();
    d5_icon(x, i ? 'hex' : 'news', 58, y + 30, 26, 'rgba(255,255,255,0.92)', 2.4);
    d5_t(x, t, 106, y + 26, 19, D5.milk, { w: 700 });
    d5_t(x, s, 106, y + 50, 15, D5.soft, { w: 600 });
  });
}
function d5_couponTex(x, w, h) {
  logoH(x, 28, 50, 24);
  const lw = logoH(x, -9999, 0, 24);
  x.fillStyle = D5A.line; x.fillRect(28 + lw + 18, 28, 1.5, 28);
  d5_u(x, 'Komisyon İndirimi', 28 + lw + 36, 50, 19, D5A.ink, { w: 700 });
  // dashed tear line + notches
  x.save(); x.setLineDash([7, 6]); x.strokeStyle = D5A.line; x.lineWidth = 2; x.beginPath(); x.moveTo(30, 82); x.lineTo(w - 30, 82); x.stroke(); x.restore();
  x.save(); x.globalCompositeOperation = 'destination-out';
  x.beginPath(); x.arc(0, 82, 16, 0, TAU); x.arc(w, 82, 16, 0, TAU); x.fill(); x.restore();
  text(x, '%10', 26, 196, { f: 'Poppins', w: 800, s: 96, a: 'left', c: D5A.or, ls: -2 });
  const px = 26 + measure(x, '%10', { f: 'Poppins', w: 800, s: 96, ls: -2 }) + 28;
  d5_u(x, 'Binance', px, 148, 30, D5A.ink, { w: 700 });
  d5_u(x, 'komisyon indirimi', px, 180, 18, D5A.sec, { w: 500 });
  rr(x, w - 140, 132, 112, 48, 24); x.fillStyle = D5A.ink; x.fill();
  d5_u(x, 'Seç', w - 98, 162, 17, '#FFFFFF', { w: 700, a: 'center' });
  d5_icon(x, 'chev', w - 62, 156, 14, '#FFFFFF', 2.2);
}
function d5_videoTex(x, w, h) {
  d5_u(x, 'Kripto Hakkında Her Şey', 28, 52, 27, D5A.ink, { w: 700 });
  d5_u(x, 'Eğitim videoları', 28, 80, 15, D5A.sec, { w: 500 });
  const tw = (w - 56 - 24) / 3;
  [['#5A47F0', '#F7931A'], ['#19D3C5', '#6E5BFF'], ['#F7931A', '#FFC983']].forEach(([a, b], i) => {
    const tx = 28 + i * (tw + 12), ty = 102, th = 124;
    const gr = x.createLinearGradient(tx, ty, tx + tw, ty + th); gr.addColorStop(0, a); gr.addColorStop(1, b);
    rr(x, tx, ty, tw, th, 16); x.fillStyle = gr; x.fill();
    x.save(); rr(x, tx, ty, tw, th, 16); x.clip(); x.globalAlpha = 0.18; x.fillStyle = '#FFFFFF';
    x.beginPath(); x.arc(tx + tw * 0.85, ty + th * 0.15, 60, 0, TAU); x.fill(); x.restore();
    x.fillStyle = 'rgba(255,255,255,0.95)'; x.beginPath(); x.arc(tx + tw / 2, ty + th / 2, 24, 0, TAU); x.fill();
    d5_icon(x, 'play', tx + tw / 2 + 2, ty + th / 2, 22, D5A.ink);
  });
  rr(x, 28, h - 70, 200, 48, 24); x.fillStyle = D5A.or; x.fill();
  d5_u(x, 'Şimdi Keşfet', 118, h - 40, 17, '#FFFFFF', { w: 700, a: 'center' });
  d5_icon(x, 'arrow', 204, h - 46, 14, '#FFFFFF', 2.2);
}
function d5_exTile(x, w, h, name) {
  x.fillStyle = 'rgba(245,243,255,0.12)'; x.beginPath(); x.arc(56, h / 2, 30, 0, TAU); x.fill();
  x.lineWidth = 1.5; x.strokeStyle = 'rgba(245,243,255,0.3)'; x.stroke();
  d5_icon(x, 'swap', 56, h / 2, 28, D5.milk, 2.6);
  d5_t(x, name, 104, h / 2 - 2, 28, D5.milk, { w: 800 });
  check(x, 110, h / 2 + 26, 12, D5.teal2, 2.6);
  d5_t(x, 'Bağlandı', 124, h / 2 + 32, 16, D5.teal2, { w: 700 });
}

/* ───────────── scenes ───────────── */
const D5_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık camlar',
    desc: 'Kripto bir uygulamada, hisse başka yerde, altın bir sitede: cam kartlar farklı derinliklerde süzülür, uzaktakiler flu. Bildirim çalar: piyasa hiç durmuyor.',
    draw(g) {
      d5_bg(g, [[300, 180, 950, D5.lav, 0.6, 0.7], [1750, 260, 800, D5.or, 0.26, 0.8], [420, 1050, 850, D5.teal, 0.26, 0.6], [1100, 620, 700, '#3B1FA8', 0.55, 0.8]], { seed: 11, bokeh: 46 });
      const far = [
        ['notes', { x: 860, y: 230, z: 1900, rx: 0.15, ry: -0.3, rz: 0.12 }, 4, 0.6],
        ['web', { x: 1330, y: 640, z: 1700, rx: -0.1, ry: -0.5, rz: -0.05 }, 4, 0.58],
        ['stocks', { x: 640, y: 700, z: 1600, rx: 0.1, ry: 0.5, rz: 0.08 }, 3.5, 0.58],
        ['exch', { x: 1180, y: 960, z: 1800, rx: -0.3, ry: 0.2, rz: -0.1 }, 4, 0.55],
        ['exch', { x: 150, y: 560, z: 1500, ry: 0.6, rz: -0.12 }, 3.5, 0.55],
        ['toastB', { x: 1760, y: 560, z: 1400, ry: -0.6, rz: 0.1 }, 3.5, 0.55],
      ];
      far.sort((a, b) => b[1].z - a[1].z).forEach(([k, pose, blur, a]) => { const [fn, w, h] = D5_APPS[k]; d5_softCard(g, fn, w, h, pose, blur, a, 24, 1.4); });
      d5_coinSoft(g, 1040, 860, 26, { col: 'gold', tilt: 0.55, rot: 0.5, label: 'Au' }, 3, 0.6);
      const mid = [
        ['stocks', { x: 380, y: 250, z: 200, rx: 0.1, ry: 0.42, rz: -0.07 }],
        ['exch', { x: 1560, y: 255, z: 240, rx: 0.08, ry: -0.45, rz: 0.06 }],
        ['web', { x: 410, y: 840, z: 160, rx: -0.14, ry: 0.36, rz: 0.05 }],
        ['notes', { x: 1540, y: 860, z: 220, rx: -0.12, ry: -0.4, rz: -0.05 }],
        ['toastA', { x: 900, y: 160, z: -60, rx: 0.05, ry: 0.1, rz: -0.035 }],
        ['toastB', { x: 1060, y: 935, z: -40, ry: -0.12, rz: 0.03 }],
      ];
      mid.sort((a, b) => b[1].z - a[1].z).forEach(([k, pose]) => {
        d5_snap(g);
        const [fn, w, h] = D5_APPS[k];
        d5_card3(g, d5_tex(w, h, fn), pose, { r: k.startsWith('toast') ? 24 : 26, dark: 0.4 });
      });
      d5_coin(g, 790, 830, 34, { col: 'btc', tilt: 0.5, rot: -0.5, label: 'BTC' });
      d5_coin(g, 1255, 330, 26, { col: 'gold', tilt: 0.7, rot: 0.35, label: 'Au' });
      // foreground, heavily defocused
      d5_softCard(g, D5_APPS.stocks[0], 400, 290, { x: 420, y: 600, z: -780, ry: 0.3, rz: 0.12 }, 9, 0.8, 24, 2.4);
      d5_softCard(g, D5_APPS.exch[0], 400, 290, { x: 1540, y: 470, z: -820, ry: -0.35, rz: -0.1 }, 10, 0.8, 24, 2.4);
      d5_coinSoft(g, 1720, 990, 70, { col: 'btc', tilt: 0.45, rot: -0.3, label: 'BTC' }, 9, 0.75);
      // headline
      g.save(); g.translate(CX, 560); g.scale(1, 0.34);
      const vg = g.createRadialGradient(0, 0, 0, 0, 0, 1000);
      vg.addColorStop(0, 'rgba(12,6,34,0.85)'); vg.addColorStop(0.55, 'rgba(12,6,34,0.55)'); vg.addColorStop(1, 'rgba(12,6,34,0)');
      g.fillStyle = vg; g.fillRect(-1000, -1000, 2000, 2000); g.restore();
      d5_head(g, [['Kripto burada, hisse orada,', D5.milk]], CX, 520, 62, { a: 'center' });
      d5_head(g, [['altın bambaşka bir yerde.', 'holo']], CX, 610, 62, { a: 'center' });
      d5_snap(g);
      const s1 = 'Piyasa hiç durmuyor.', fs = 30, tw = d5_mw(g, s1, fs, D5M, 800);
      d5_card(g, CX - tw / 2 - 58, 652, tw + 100, 64, 32, { dark: 0.45 }, () => {
        addGlow(g, D5.or, CX - tw / 2 - 26, 684, 34, 0.7);
        g.fillStyle = D5.or; g.beginPath(); g.arc(CX - tw / 2 - 26, 684, 8, 0, TAU); g.fill();
        d5_t(g, s1, CX - tw / 2 - 2, 695, fs, D5.milk, { w: 800 });
      });
      d5_finish(g);
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek uygulama',
    desc: 'Dağınık kartlar ışık izleriyle merkeze akar, tek bir cam karta birleşir; resmî logo beyaz harflerle belirir, turuncu ok yükselir: kripto, borsa ve emtia tek uygulamada.',
    draw(g) {
      d5_bg(g, [[CX, 470, 1000, D5.lav, 0.62, 0.65], [260, 980, 750, D5.teal, 0.3, 0.7], [1700, 160, 750, D5.or, 0.28, 0.7], [CX, 460, 430, '#B8A8FF', 0.3, 0.6]], { seed: 21, bokeh: 40 });
      d5_streaks(g, CX, 440, 22, 26, 760, 430);
      // ghost cards flying in (motion-blurred samples)
      [['stocks', -640, -330, 0.14], ['exch', 650, -320, -0.12], ['web', -700, 300, -0.1], ['notes', 700, 320, 0.1], ['toastA', -60, -480, 0.06]].forEach(([k, dx, dy, rot]) => {
        const [fn, w, h] = D5_APPS[k], S = d5_softTex(fn, w, h, 1.2);
        for (let j = 0; j < 5; j++) {
          const t = 0.36 + j * 0.065, q = 1 - t;
          d5_plane(g, S.c, S.w, S.h, { x: CX + dx * q * 1.5, y: 440 + dy * q * 1.45, z: 260 + t * 420, rz: rot * q * 2, ry: -dx / 700 * 0.6 * q, rx: dy / 400 * 0.35 * q, s: 0.9 }, { a: 0.06 + j * 0.08, nx: 4, ny: 3 });
        }
      });
      d5_rise(g, [[70, 1010], [520, 690], [700, 780], [1240, 380], [1420, 470], [1790, 150]], 50, { a: 0.95 });
      d5_coinSoft(g, 1240, 196, 34, { col: 'lav', tilt: 0.55, rot: 0.3, icon: 'stock' }, 3, 0.75);
      d5_ring(g, CX, 460, 830, 290, -0.08, Math.PI, TAU, 6);
      d5_snap(g);
      const LP = d5_card3(g, d5_tex(1000, 540, d5_logoCard, 1.5), { x: CX, y: 440, z: 0, rx: 0.07 }, { r: 44, dark: 0.5, sheen: 0.2, shadow: 0.6 });
      const lc = LP(0, 236 - 270);
      logo(g, lc[0], lc[1], 290 * FOCAL / lc[2], { ink: '#FFFFFF' });
      d5_ring(g, CX, 460, 830, 290, -0.08, 0, Math.PI, 6);
      d5_coin(g, 300, 640, 66, { col: 'btc', tilt: 0.52, rot: -0.35, label: 'BTC' });
      d5_coin(g, 1650, 600, 54, { col: 'gold', tilt: 0.58, rot: 0.3, label: 'Au' });
      sparkle(g, 1560, 776, 14, D5.milk); addGlow(g, D5.or2, 1560, 776, 60, 0.5);
      d5_head(g, [['Kripto, borsa ve emtia', D5.milk]], CX, 878, 64, { a: 'center', glow: 0.5 });
      d5_head(g, [['tek uygulamada.', 'org']], CX, 966, 64, { a: 'center', glow: 0.5 });
      d5_finish(g);
    },
  },
  {
    time: '8–12 sn', title: 'Canlı kripto',
    desc: 'Uygulamanın canlı piyasa kartı cam levhada derinlikten yaklaşır: Kripto sekmesi, CANLI rozeti, BTC’den ADA’ya fiyat, günlük ve haftalık değişim. Jetonlar süzülür.',
    draw(g) {
      d5_bg(g, [[1250, 470, 1000, D5.lav, 0.55, 0.7], [250, 900, 700, D5.teal, 0.28], [1750, 120, 650, D5.or, 0.26]], { seed: 31, bokeh: 34 });
      d5_coinSoft(g, 820, 170, 30, { col: 'eth', tilt: 0.5, rot: 0.4, label: 'ETH' }, 3.5, 0.6);
      d5_coinSoft(g, 160, 960, 46, { col: 'btc', tilt: 0.5, rot: -0.4, label: 'BTC' }, 6, 0.55);
      addGlow(g, D5.or, 1250, 520, 520, 0.18);
      d5_card3L(g, d5_scrCrypto, 840, 870, { x: 1250, y: 548, z: 150, rx: 0.06, ry: -0.3, rz: 0.008, s: 0.96 }, { dark: 0.4, shadow: 0.65 });
      d5_coin(g, 1730, 840, 96, { col: 'btc', tilt: 0.5, rot: -0.28, label: 'BTC' });
      d5_coin(g, 1790, 330, 54, { col: 'eth', tilt: 0.6, rot: 0.32, label: 'ETH' });
      // copy
      d5_k(g, 'KRİPTO · CANLI', 116, 300, 20, D5.teal2);
      d5_head(g, [['Canlı fiyatlar,', D5.milk]], 110, 400, 70);
      d5_head(g, [['7/24.', 'org']], 110, 520, 112);
      d5_t(g, 'BTC, ETH, XRP ve fazlası;', 114, 600, 27, D5.soft, { w: 600 });
      d5_t(g, 'günlük ve haftalık değişimiyle.', 114, 638, 27, D5.soft, { w: 600 });
      d5_snap(g);
      const lab = 'CANLI · Güncellendi 14:24', tw = d5_mw(g, lab, 22, D5M, 800);
      d5_card(g, 110, 690, tw + 82, 60, 30, { dark: 0.42 }, () => {
        addGlow(g, '#10B981', 142, 720, 30, 0.8);
        g.fillStyle = '#34E3A4'; g.beginPath(); g.arc(142, 720, 7, 0, TAU); g.fill();
        d5_t(g, lab, 164, 728, 22, D5.milk, { w: 800 });
      });
      d5_finish(g);
    },
  },
  {
    time: '12–16 sn', title: 'BIST ve Nasdaq',
    desc: 'Cam telefonda Borsa ekranı; BIST 100 ve Nasdaq 100 kartları ekrandan dışarı süzülür. 210 hisse: BIST 108 · Nasdaq 102; Popüler, Yükselenler, Düşenler, Favoriler, arama.',
    draw(g) {
      d5_bg(g, [[1200, 520, 950, D5.lav, 0.55, 0.75], [1750, 980, 600, D5.teal, 0.28], [200, 120, 700, D5.or, 0.2]], { seed: 41, bokeh: 36 });
      d5_coinSoft(g, 1700, 130, 30, { col: 'lav', tilt: 0.55, rot: 0.3, label: 'MU' }, 3, 0.6);
      addGlow(g, D5.lav, 1180, 560, 520, 0.3);
      const pose = { x: 1170, y: 556, z: 220, rx: 0.04, ry: -0.24, rz: 0.01, s: 0.96 };
      d5_phone(g, d5_scrBorsa, pose);
      // the index cards slide out of the phone: light trails
      const P = projector(pose);
      [[-215 + 105, -480 + 200, 1590, 310], [-215 + 105 + 205, -480 + 200, 1630, 712]].forEach(([u, v, tx, ty]) => {
        const p = P(u, v);
        const gr = g.createLinearGradient(p[0], p[1], tx, ty); gr.addColorStop(0, hexA(D5.or2, 0)); gr.addColorStop(1, hexA(D5.or2, 0.5));
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = gr; g.lineCap = 'round';
        [[26, 0.08], [8, 0.25], [2, 0.8]].forEach(([w, a]) => { g.globalAlpha = a; g.lineWidth = w; g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo((p[0] + tx) / 2, Math.min(p[1], ty) - 60, tx, ty); g.stroke(); });
        g.restore();
      });
      [['BIST 100', '11.165,44', '+0,13%', 611, { x: 1612, y: 300, z: -160, rx: 0.06, ry: -0.34, rz: 0.035 }],
        ['Nasdaq 100', '29.813,16', '+0,55%', 612, { x: 1640, y: 700, z: -120, rx: -0.04, ry: -0.3, rz: -0.03 }]].forEach(([n, v, c, sd, ps]) => {
        d5_snap(g);
        d5_card3L(g, (x, w, h) => {
          d5_u(x, n, 26, 46, 22, D5A.sec, { w: 600 });
          d5_chg(x, w - 24, 38, c, 18);
          text(x, v, 24, 104, { f: D5I, w: 700, s: 46, a: 'left', c: D5A.ink, ls: -0.8 });
          d5_idxSpark(x, sd, true, 26, w - 26, 122, h - 22, 3.2);
        }, 380, 200, ps, { dark: 0.36 });
      });
      // copy
      d5_k(g, 'BORSA', 116, 190, 20, D5.teal2);
      d5_head(g, [['Nasdaq ve BIST', D5.milk]], 110, 278, 64);
      d5_head(g, [['hisselerini gör.', 'org']], 110, 360, 64);
      d5_snap(g);
      d5_card(g, 110, 410, 620, 186, 32, { dark: 0.4 }, () => {
        d5_head(g, [['210', 'holo']], 140, 528, 92, { glow: 0.3 });
        d5_t(g, 'hisse', 146, 570, 24, D5.soft, { w: 700 });
        [['BIST', '108', 452], ['Nasdaq', '102', 530]].forEach(([l, n, y]) => {
          d5_t(g, l, 360, y - 2, 28, D5.milk, { w: 800 });
          const lw = d5_mw(g, l, 28, D5M, 800);
          rr(g, 360 + lw + 14, y - 32, 84, 42, 21); g.fillStyle = 'rgba(178,165,255,0.3)'; g.fill();
          d5_t(g, n, 360 + lw + 56, y - 3, 22, '#E2DCFF', { w: 800, a: 'center' });
        });
      });
      const s = 0.74;
      let px = 110;
      [['Favoriler', 'star'], ['Popüler', 'stock', true], ['Yükselenler', 'up'], ['Düşenler', 'down']].forEach(([l, ic, sel]) => {
        d5_snap(g);
        const M = d5_pill(g, px, 668, l, ic, s, { left: true, sel, disc: ic === 'down' ? '#E5484D' : ic === 'up' ? '#16A34A' : 'or', ic: ic === 'up' || ic === 'down' ? '#FFFFFF' : D5.deep });
        px += M.w + 12;
      });
      d5_snap(g);
      d5_card(g, 110, 728, 620, 72, 36, { dark: 0.42 }, () => {
        d5_icon(g, 'search', 152, 764, 24, D5.soft, 2.6);
        d5_t(g, 'Hisse adı ya da kodu ara…', 184, 773, 24, D5.soft, { w: 600 });
      });
      d5_finish(g);
    },
  },
  {
    time: '16–20 sn', title: 'Kapalıçarşı altını',
    desc: 'Krem renkli altın kartı öne süzülür: gram ₺6.510,83, ons $4.033,60, ₺ TL / $ USD. Arkada alış-satış tablosu: gram, çeyrek, yarım, tam, ata… Gümüş, petrol ve fazlası.',
    draw(g) {
      d5_bg(g, [[1300, 520, 950, D5.lav, 0.5, 0.75], [600, 820, 650, '#F2C14E', 0.2], [1750, 120, 600, D5.teal, 0.24], [150, 150, 600, D5.or, 0.18]], { seed: 51, bokeh: 34 });
      d5_coinSoft(g, 1830, 960, 52, { col: 'gold', tilt: 0.5, rot: 0.4, label: 'Au' }, 6, 0.6);
      d5_coinSoft(g, 980, 140, 28, { col: 'silver', tilt: 0.55, rot: -0.3, label: 'Ag' }, 3, 0.6);
      addGlow(g, '#F2C14E', 1400, 520, 480, 0.16);
      d5_card3L(g, d5_scrGoldTable, 720, 724, { x: 1420, y: 530, z: 200, rx: 0.05, ry: -0.3, rz: 0.008, s: 1.02 }, { dark: 0.4, shadow: 0.6 });
      d5_snap(g);
      addGlow(g, '#F2C14E', 640, 720, 420, 0.2);
      d5_card3L(g, d5_scrGold, 820, 300, { x: 650, y: 730, z: -110, rx: 0.06, ry: 0.2, rz: -0.012 }, { dark: 0.34, shadow: 0.65, fill: D5A.cream });
      d5_coin(g, 1100, 900, 70, { col: 'gold', tilt: 0.5, rot: 0.3, label: 'Au' });
      d5_coin(g, 1210, 972, 40, { col: 'gold', tilt: 0.62, rot: -0.4, label: 'Au', glow: 0.2 });
      // copy
      d5_k(g, 'EMTİA', 116, 150, 20, D5.teal2);
      d5_head(g, [['Kapalıçarşı altını,', D5.milk]], 110, 236, 62);
      d5_head(g, [['canlı.', 'org']], 110, 318, 62);
      d5_t(g, 'Alış, satış; yeni ve eski basım.', 114, 378, 27, D5.soft, { w: 600 });
      const s = 0.72;
      let px = 110;
      [['Altın', 'Au', '#E0B03A'], ['Gümüş', 'Ag', '#A9ABBC'], ['Petrol', 'drop', '#2A2A38'], ['ve fazlası', 'spark', 'or']].forEach(([l, ic, disc]) => {
        d5_snap(g);
        const icon = ic === 'Au' || ic === 'Ag' ? (x, cx, cy, sz) => d5_t(x, ic, cx, cy + sz * 0.16, sz * 0.44, '#FFFFFF', { w: 800, a: 'center' }) : ic;
        const M = d5_pill(g, px, 448, l, icon, s, { left: true, disc, ic: ic === 'spark' ? D5.deep : '#FFFFFF' });
        px += M.w + 12;
      });
      d5_finish(g);
    },
  },
  {
    time: '20–24 sn', title: 'Kasam',
    desc: 'Cam bir kasa kapağı turuncu ışıkla parlar, önünde Kasam ekranlı telefon: ₺1.250.430. Altın, döviz ve kişisel varlıklar tek ekranda; jetonlar kasadan süzülür.',
    draw(g) {
      d5_bg(g, [[1420, 520, 950, D5.lav, 0.52, 0.75], [1500, 560, 520, D5.or, 0.24], [220, 960, 650, D5.teal, 0.26]], { seed: 61, bokeh: 34 });
      // vault: back rim, glass door, details
      const vp = { x: 1530, y: 500, z: 260, rx: 0.06, ry: -0.42, rz: 0 }, VR = 330, P = projector(vp);
      addGlow(g, D5.or, 1530, 500, 640, 0.35);
      d5_pcirc(g, P, VR * 1.02, 70); g.fillStyle = 'rgba(40,24,110,0.9)'; g.fill();
      g.save(); d5_pcirc(g, P, VR * 1.02, 70); g.lineWidth = 3; g.strokeStyle = hexA(D5.lav2, 0.5); g.stroke(); g.restore();
      d5_snap(g);
      const path = () => d5_pcirc(g, P, VR), bb = d5_pbox(P, VR * 2, VR * 2);
      d5_body(g, path, bb, { dark: 0.35, sheen: 0.24, shadow: 0.6, rim: 12 });
      d5_plane(g, d5_tex(VR * 2, VR * 2, d5_vaultTex, 1.3).c, VR * 2, VR * 2, vp);
      d5_edge(g, path, bb, { lw: 2.6 });
      // coins leaving the vault
      d5_coin(g, 1820, 830, 58, { col: 'gold', tilt: 0.5, rot: 0.3, label: 'Au' });
      d5_coin(g, 1810, 190, 44, { col: 'teal', tilt: 0.6, rot: -0.4, label: '$' });
      d5_coin(g, 1090, 170, 40, { col: 'btc', tilt: 0.55, rot: 0.35, label: '₺' });
      d5_snap(g);
      d5_phone(g, d5_scrKasam, { x: 1150, y: 572, z: -40, rx: 0.03, ry: -0.16, rz: -0.012, s: 0.86 });
      // copy
      d5_k(g, 'KASAM', 116, 274, 20, D5.teal2);
      d5_head(g, [['Altın, döviz ve', D5.milk]], 110, 360, 58);
      d5_head(g, [['kişisel varlıkların', D5.milk]], 110, 438, 58);
      d5_head(g, [['tek ekranda.', 'org']], 110, 516, 58);
      d5_t(g, 'Güvenle takip et.', 114, 580, 30, D5.soft, { w: 700 });
      // CTA as in the app's banner
      const bx = 110, by = 640, bw = 330, bh = 84;
      addGlow(g, D5.or, bx + bw / 2, by + bh / 2, 260, 0.3);
      g.save(); g.shadowColor = hexA(D5.or, 0.55); g.shadowBlur = 36; g.shadowOffsetY = 10;
      rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = d5_orFill(g, 0, by, 0, by + bh); g.fill(); g.restore();
      g.save(); rr(g, bx, by, bw, bh, bh / 2); g.clip();
      const sh = g.createLinearGradient(0, by, 0, by + bh); sh.addColorStop(0, 'rgba(255,255,255,0.45)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(bx, by, bw, bh * 0.55); g.restore();
      d5_t(g, 'Kasamı Gör', bx + 44, by + 53, 30, D5.deep, { w: 800 });
      d5_icon(g, 'arrow', bx + bw - 56, by + bh / 2, 30, D5.deep, 4);
      d5_finish(g);
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz',
    desc: 'Grafik kartında turuncu alarm çizgisi; fiyat ₺6.500’ü geçince cam bildirim düşer. Hisse analizi, teknik analiz, fiyat tahmini, sinyal alarmları; haberler ve akış.',
    draw(g) {
      d5_bg(g, [[1250, 600, 950, D5.lav, 0.52, 0.7], [1700, 160, 600, D5.or, 0.26], [200, 980, 650, D5.teal, 0.26]], { seed: 71, bokeh: 34 });
      d5_coinSoft(g, 880, 960, 40, { col: 'gold', tilt: 0.5, rot: 0.3, label: 'Au' }, 5, 0.55);
      d5_card3L(g, d5_scrChart, 860, 560, { x: 1290, y: 640, z: 120, rx: 0.06, ry: -0.26, rz: 0.006 }, { dark: 0.4, shadow: 0.6 });
      // notification
      d5_snap(g);
      const nx = 1130, ny = 98, nw = 690, nh = 150;
      addGlow(g, D5.or, nx + 70, ny + 75, 200, 0.35);
      d5_card(g, nx, ny, nw, nh, 36, { dark: 0.5, sheen: 0.2 }, () => {
        d5_appIcon(g, nx + 76, ny + 75, 84, { shadow: 0.35 });
        d5_t(g, 'KRİPTO724', nx + 140, ny + 46, 16, D5.soft, { w: 800, ls: 1.6 });
        d5_t(g, 'şimdi', nx + nw - 32, ny + 46, 16, D5.soft, { w: 700, a: 'right' });
        d5_t(g, 'Fiyat alarmı', nx + 140, ny + 84, 26, D5.milk, { w: 800 });
        d5_t(g, 'Gram Altın ₺6.500’ü geçti: ₺6.510,83', nx + 140, ny + 120, 22, D5.milk, { w: 600 });
      });
      // a glossy orange bell
      g.save(); g.translate(1060, 210); g.rotate(-0.25);
      addGlow(g, D5.or, 0, 0, 120, 0.45);
      const bg = g.createRadialGradient(-14, -22, 4, 0, 0, 62); bg.addColorStop(0, '#FFE3BC'); bg.addColorStop(0.45, '#F7931A'); bg.addColorStop(1, '#A85400');
      g.fillStyle = bg; g.beginPath(); g.moveTo(-50, 28); g.quadraticCurveTo(-36, 14, -36, -10); g.arc(0, -10, 36, Math.PI, 0); g.quadraticCurveTo(36, 14, 50, 28); g.closePath(); g.fill();
      g.fillStyle = '#C96A05'; g.beginPath(); g.ellipse(0, 28, 50, 9, 0, 0, TAU); g.fill();
      g.fillStyle = '#FFB24A'; g.beginPath(); g.arc(0, 42, 11, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.65)'; g.beginPath(); g.ellipse(-16, -24, 8, 14, -0.5, 0, TAU); g.fill();
      g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = hexA(D5.or2, 0.7); g.lineWidth = 3; g.lineCap = 'round';
      [[70, -0.9, -0.2], [92, -0.85, -0.25]].forEach(([r, a0, a1]) => { g.beginPath(); g.arc(1060, 200, r, a0, a1); g.stroke(); g.beginPath(); g.arc(1060, 200, r, Math.PI - a1, Math.PI - a0); g.stroke(); });
      g.restore();
      // copy
      d5_k(g, 'ALARM · ANALİZ', 116, 214, 20, D5.teal2);
      d5_head(g, [['Alarmını kur,', D5.milk]], 110, 300, 62);
      d5_head(g, [['analizi incele.', 'org']], 110, 382, 62);
      const s = 0.72;
      [['Hisse analizi', 'stock', 110, 470], ['Teknik analiz', 'candle', 110, 548], ['Fiyat tahmini', 'target', 420, 470], ['Sinyal alarmları', 'bell', 420, 548]].forEach(([l, ic, x, y]) => { d5_snap(g); d5_pill(g, x, y, l, ic, s, { left: true }); });
      d5_snap(g);
      d5_card3(g, d5_tex(560, 260, d5_newsTex, 1.5), { x: 400, y: 790, z: -40, rx: 0.05, ry: 0.16, rz: -0.01 }, { r: 30, dark: 0.42 });
      d5_finish(g);
    },
  },
  {
    time: '29–34 sn', title: 'Bağla ve keşfet',
    desc: 'Binance, Bitget ve MEXC cam kutucuklarından uygulama simgesine ışık akar: hesabını bağla. Yanda Binance %10 komisyon indirimi ve “Kripto Hakkında Her Şey” videoları.',
    draw(g) {
      d5_bg(g, [[760, 620, 900, D5.lav, 0.52, 0.7], [1500, 560, 700, D5.lav, 0.3], [1750, 200, 600, D5.or, 0.24], [200, 1000, 600, D5.teal, 0.26]], { seed: 81, bokeh: 34 });
      const hub = [870, 640];
      for (let k = 0; k < 3; k++) d5_ring(g, hub[0], hub[1] + 60, 200 + k * 120, (200 + k * 120) * 0.26, 0, 0, TAU, 2 - k * 0.4, 0.5 - k * 0.12);
      const tiles = [['Binance', { x: 340, y: 486, z: -20, rx: 0.04, ry: 0.32, rz: -0.02 }], ['Bitget', { x: 330, y: 646, z: 30, rx: 0, ry: 0.34, rz: 0 }], ['MEXC', { x: 340, y: 806, z: -10, rx: -0.04, ry: 0.32, rz: 0.02 }]];
      const TW = 360, TH = 118;
      // beams
      tiles.forEach(([n, ps], i) => {
        const P = projector(ps), st = P(TW / 2, 0), [x1, y1] = hub, mx = (st[0] + x1) / 2, my = (st[1] + y1) / 2 - 50;
        const gr = g.createLinearGradient(st[0], st[1], x1, y1); gr.addColorStop(0, hexA(D5.or2, 0.9)); gr.addColorStop(1, hexA(D5.lav2, 0.3));
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = gr; g.lineCap = 'round';
        [[10, 0.12], [3.5, 0.35], [1.6, 0.9]].forEach(([w, a]) => { g.globalAlpha = a; g.lineWidth = w; g.beginPath(); g.moveTo(st[0], st[1]); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); });
        g.restore();
        [0.35 + i * 0.12, 0.75].forEach(u => {
          const qx = (1 - u) * (1 - u) * st[0] + 2 * (1 - u) * u * mx + u * u * x1, qy = (1 - u) * (1 - u) * st[1] + 2 * (1 - u) * u * my + u * u * y1;
          addGlow(g, D5.or2, qx, qy, 26, 0.8); g.fillStyle = D5.milk; g.beginPath(); g.arc(qx, qy, 2.6, 0, TAU); g.fill();
        });
      });
      tiles.forEach(([n, ps]) => { d5_snap(g); d5_card3(g, d5_tex(TW, TH, (x, w, h) => d5_exTile(x, w, h, n)), ps, { r: 26, dark: 0.4 }); });
      // hub: the app icon in a glass lens
      d5_snap(g);
      const lens = () => { g.beginPath(); g.arc(hub[0], hub[1], 150, 0, TAU); };
      d5_body(g, lens, [hub[0] - 150, hub[1] - 150, hub[0] + 150, hub[1] + 150], { dark: 0.3, rim: 10, sheen: 0.2 });
      d5_appIcon(g, hub[0], hub[1], 176, { glow: 0.55 });
      d5_edge(g, lens, [hub[0] - 150, hub[1] - 150, hub[0] + 150, hub[1] + 150], { lw: 2.2 });
      d5_ring(g, hub[0], hub[1] + 62, 236, 72, -0.06, 0.05, Math.PI - 0.05, 2.6, 0.9);
      // perks
      d5_snap(g);
      d5_card3L(g, d5_couponTex, 680, 224, { x: 1470, y: 420, z: -40, rx: 0.06, ry: -0.24, rz: 0.012 }, { dark: 0.38 });
      d5_snap(g);
      d5_card3L(g, d5_videoTex, 680, 320, { x: 1480, y: 800, z: 20, rx: -0.03, ry: -0.24, rz: -0.01 }, { dark: 0.38 });
      d5_coin(g, 1812, 236, 44, { col: 'btc', tilt: 0.55, rot: 0.4, label: '%' });
      // copy
      d5_head(g, [['Kripto hesabını ', D5.milk], ['bağla.', 'org']], 110, 170, 60);
      d5_t(g, 'Binance, Bitget ve MEXC hesaplarını Kripto724’e kolayca bağla.', 114, 236, 27, D5.soft, { w: 600 });
      d5_finish(g);
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış',
    desc: 'Tüm ışık parlayan uygulama simgesine toplanır; turuncu ok ve jetonlar yükselir. “Ücretsiz ailemize katılın!”, turuncu düğme ve kripto724.com yumuşakça netleşir.',
    draw(g) {
      d5_bg(g, [[CX, 300, 820, D5.lav, 0.62, 0.8], [CX, 320, 420, D5.or, 0.3], [380, 920, 700, D5.teal, 0.24], [1560, 900, 700, D5.or, 0.16]], { seed: 91, bokeh: 44 });
      const lx = CX, ly = 282;
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + 0.15, col = [D5.lav2, D5.or2, D5.teal2][i % 3];
        const gr = g.createRadialGradient(lx, ly, 100, lx, ly, 640); gr.addColorStop(0, hexA(col, 0.12)); gr.addColorStop(1, hexA(col, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly); g.arc(lx, ly, 720, a - 0.035, a + 0.035); g.closePath(); g.fill();
      }
      g.restore();
      d5_rise(g, [[1300, 1030], [1520, 840], [1610, 900], [1850, 640]], 34, { a: 0.9 });
      d5_coinSoft(g, 1500, 520, 30, { col: 'lav', tilt: 0.6, rot: -0.4, icon: 'stock' }, 3, 0.65);
      d5_coinSoft(g, 400, 250, 34, { col: 'teal', tilt: 0.55, rot: 0.5, label: '$' }, 4, 0.6);
      d5_ring(g, lx, ly + 34, 336, 98, -0.1, Math.PI, TAU, 3.5, 0.9);
      d5_snap(g);
      const path = () => { g.beginPath(); g.arc(lx, ly, 160, 0, TAU); }, bx = [lx - 160, ly - 160, lx + 160, ly + 160];
      d5_body(g, path, bx, { dark: 0.3, rim: 12, sheen: 0.22 });
      d5_appIcon(g, lx, ly, 200, { glow: 0.75 });
      d5_edge(g, path, bx, { lw: 2.4 });
      d5_ring(g, lx, ly + 34, 336, 98, -0.1, 0, Math.PI, 3.5, 0.9);
      d5_coin(g, 1400, 214, 56, { col: 'gold', tilt: 0.5, rot: -0.4, label: 'Au' });
      d5_coin(g, 520, 420, 50, { col: 'btc', tilt: 0.6, rot: 0.3, label: 'BTC' });
      d5_head(g, [['Ücretsiz ailemize ', D5.milk], ['katılın!', 'org']], CX, 600, 74, { a: 'center', glow: 0.55 });
      // orange glossy button
      const bw = 520, bh = 100, bxx = CX - bw / 2, byy = 664;
      addGlow(g, D5.or, CX, byy + bh / 2, 460, 0.35);
      g.save(); g.shadowColor = hexA(D5.or, 0.6); g.shadowBlur = 50; g.shadowOffsetY = 14;
      rr(g, bxx, byy, bw, bh, bh / 2); g.fillStyle = d5_orFill(g, 0, byy, 0, byy + bh); g.fill(); g.restore();
      g.save(); rr(g, bxx, byy, bw, bh, bh / 2); g.clip();
      const sh = g.createLinearGradient(0, byy, 0, byy + bh); sh.addColorStop(0, 'rgba(255,255,255,0.5)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.04)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(bxx, byy, bw, bh * 0.55); g.restore();
      rr(g, bxx, byy, bw, bh, bh / 2); g.lineWidth = 2; g.strokeStyle = 'rgba(255,230,200,0.8)'; g.stroke();
      d5_t(g, 'Hemen katıl', bxx + 64, byy + 63, 36, D5.deep, { w: 800 });
      g.fillStyle = D5.deep; g.beginPath(); g.arc(bxx + bw - 54, byy + bh / 2, 34, 0, TAU); g.fill();
      d5_icon(g, 'arrow', bxx + bw - 54, byy + bh / 2, 30, D5.or, 4);
      d5_head(g, [['kripto724.com', D5.milk]], CX, 880, 56, { a: 'center', w: 600, glow: 0.5 });
      d5_t(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1032, 22, D5.soft, { a: 'center', w: 600 });
      d5_finish(g, 0.5);
    },
  },
];

function d5_paper(g, bw, bh) {
  g.save(); g.globalCompositeOperation = 'screen';
  d5_blob(g, 200, 120, 1500, D5.lav, 0.3, 0.5);
  d5_blob(g, 3100, 260, 1200, D5.or, 0.1, 0.55);
  d5_blob(g, 1700, 2900, 1900, D5.teal, 0.08, 0.4);
  d5_blob(g, 500, 2300, 1200, D5.lav, 0.12, 0.6);
  g.restore();
}

window.DESIGN = {
  id: 5, name: 'Cam & Hologram',
  concept: 'Derin mor bir boşlukta süzülen buzlu cam kartlar, cam telefonlar ve parlak turuncu jetonlar: uygulamanın kendi 3B banner çizimlerinin sinematik hâli. Kripto724’ün gerçek ekranları camların üstünde, gerçek perspektifle; turuncu ışık her karede yolu gösterir.',
  board: { bg: '#130C30', ink: '#F5F3FF', soft: '#B3AAD8', accent: '#F7931A', line: 'rgba(245,243,255,0.16)', display: { f: D5U, w: 800, ls: -3 }, text: { f: D5M, w: 500 }, badge: '#F7931A', badgeInk: '#120B2E', paper: d5_paper },
  palette: [['#120B2E', 'Derin mor'], ['#6E5BFF', 'Lavanta'], ['#F7931A', 'Turuncu'], ['#19D3C5', 'Turkuaz'], ['#F5F3FF', 'Süt beyazı']],
  fonts: ['Unbounded 800', 'Manrope · Inter (uygulama)'],
  extraFonts: ['Inter', 'Poppins'],
  motion: ['Derinlikte süzülen cam kartlar ve telefonlar', 'Turuncu jetonlar, yükselen ok, ışık izleri', 'Yumuşak parallax, bokeh, yanardöner ışık'],
  music: 'chill elektronik / future garage, 120 BPM; kesmelerde kristal cam tınıları',
  format: '16:9 · 1920×1080 · 40 sn',
  scenes: D5_SCENES,
};
