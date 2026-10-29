'use strict';
/* TASARIM 05 · CAM & HOLOGRAM
 * Glassmorphism in deep violet space: large blurred iridescent light blobs, frosted
 * glass cards floating at different depths in true perspective (plane3d + a real
 * blurred backdrop), refraction rims, holographic gradient strokes, generic 3D
 * tokens and soft bokeh. Display: Unbounded · text and figures: Manrope. */

const D5 = {
  bg: '#120B2E', deep: '#120B2E', lav: '#6E5BFF', lav2: '#B2A5FF', teal: '#19D3C5', teal2: '#8EF1E7',
  pink: '#FF8BD1', pink2: '#FFC4E7', milk: '#F5F3FF', soft: '#BDB5E2', dim: '#8F86BC',
};
const D5U = 'Unbounded', D5M = 'Manrope';
const D5_HOLO = [[0, '#B6A9FF'], [0.34, '#86EFE5'], [0.67, '#FFB6E1'], [1, '#B6A9FF']];
const D5S = { small: null, blur: null, layer: null, grain: null, spr: {} };
const D5_MC = { paths: null };
const D5_COIN = {
  teal: ['#F0FFFD', '#5FE5DA', '#0A7A73'], lav: ['#F5F2FF', '#A797FF', '#3F2CC4'],
  pink: ['#FFF3FA', '#FFA2D8', '#B03F7C'], pearl: ['#FFFFFF', '#D8D0FF', '#7468B8'],
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
// a headline line made of parts [[text, colour | 'holo'], ...]
function d5_head(g, parts, x, y, size, o = {}) {
  const f = { f: D5U, w: o.w || 800, s: size, ls: o.ls == null ? -size * 0.03 : o.ls };
  const ws = parts.map(p => measure(g, p[0], f)), tot = ws.reduce((a, b) => a + b, 0);
  let px = o.a === 'center' ? x - tot / 2 : o.a === 'right' ? x - tot : x;
  parts.forEach(([s, c], i) => {
    g.save();
    if (o.glow !== 0) { g.shadowColor = hexA(o.glowC || D5.lav, o.glow == null ? 0.6 : o.glow); g.shadowBlur = size * 0.5; }
    const fill = c === 'holo' ? d5_holo(g, px, y - size * 0.9, px + ws[i], y + size * 0.1) : c;
    text(g, s, px, y, { ...f, a: 'left', c: fill });
    g.restore();
    px += ws[i];
  });
  return tot;
}
// chip inside a texture (or on screen without frost); x is the left edge for a: 'left', else the centre
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

/* ───────────── icons (line style, no glyphs needed) ───────────── */
function d5_icon(g, k, x, y, s, col, lw) {
  const h = s / 2;
  g.save(); g.translate(x, y);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw || Math.max(1.5, s * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (...p) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
  const poly = (n, r, a0 = -Math.PI / 2) => { g.beginPath(); for (let i = 0; i < n; i++) { const a = a0 + i * TAU / n; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); };
  switch (k) {
    case 'stock': L(-h * 0.95, h * 0.55, -h * 0.3, -h * 0.08, h * 0.12, h * 0.3, h * 0.9, -h * 0.55); L(h * 0.38, -h * 0.6, h * 0.9, -h * 0.58, h * 0.88, -h * 0.06); break;
    case 'etf': g.beginPath(); g.arc(0, 0, h * 0.86, 0, TAU); g.stroke(); L(0, -h * 0.86, 0, 0, h * 0.74, h * 0.43); break;
    case 'bond': g.beginPath(); g.roundRect(-h * 0.68, -h * 0.9, h * 1.36, h * 1.8, h * 0.2); g.stroke(); L(-h * 0.32, -h * 0.38, h * 0.32, -h * 0.38); L(-h * 0.32, 0, h * 0.32, 0); L(-h * 0.32, h * 0.38, h * 0.08, h * 0.38); break;
    case 'option': L(-h * 0.85, h * 0.6, h * 0.85, -h * 0.6); L(h * 0.32, -h * 0.66, h * 0.85, -h * 0.6, h * 0.76, -h * 0.08); L(-h * 0.85, -h * 0.6, h * 0.85, h * 0.6); L(h * 0.32, h * 0.66, h * 0.85, h * 0.6, h * 0.76, h * 0.08); break;
    case 'crypto': poly(6, h * 0.92); g.stroke(); poly(6, h * 0.36); g.fill(); break;
    case 'house': L(-h * 0.92, 0, 0, -h * 0.85, h * 0.92, 0); L(-h * 0.62, -h * 0.25, -h * 0.62, h * 0.85, h * 0.62, h * 0.85, h * 0.62, -h * 0.25); L(-h * 0.17, h * 0.85, -h * 0.17, h * 0.35, h * 0.17, h * 0.35, h * 0.17, h * 0.85); break;
    case 'fund': L(-h * 0.92, -h * 0.2, 0, -h * 0.66, h * 0.92, -h * 0.2, 0, h * 0.26, -h * 0.92, -h * 0.2); L(-h * 0.92, h * 0.22, 0, h * 0.68, h * 0.92, h * 0.22); break;
    case 'cash': g.beginPath(); g.roundRect(-h * 0.95, -h * 0.6, h * 1.9, h * 1.2, h * 0.2); g.stroke(); g.beginPath(); g.arc(0, 0, h * 0.28, 0, TAU); g.stroke(); break;
    case 'bank': L(-h * 0.92, -h * 0.28, 0, -h * 0.88, h * 0.92, -h * 0.28, -h * 0.92, -h * 0.28); L(-h * 0.55, -h * 0.05, -h * 0.55, h * 0.5); L(0, -h * 0.05, 0, h * 0.5); L(h * 0.55, -h * 0.05, h * 0.55, h * 0.5); L(-h * 0.92, h * 0.82, h * 0.92, h * 0.82); break;
    case 'lock': g.beginPath(); g.roundRect(-h * 0.72, -h * 0.12, h * 1.44, h * 1.02, h * 0.22); g.stroke(); g.beginPath(); g.arc(0, -h * 0.12, h * 0.46, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(0, h * 0.36, h * 0.12, 0, TAU); g.fill(); break;
    case 'moon': { const R = h * 0.88, d = R * 0.85, ph = -Math.PI / 4, al = Math.acos(d / (2 * R)); g.beginPath(); g.arc(0, 0, R, ph + al, ph - al + TAU); g.arc(d * Math.cos(ph), d * Math.sin(ph), R, ph + Math.PI + al, ph + Math.PI - al, true); g.closePath(); g.fill(); break; }
    case 'spark': sparkle(g, -h * 0.1, h * 0.1, h * 0.9, col); sparkle(g, h * 0.72, -h * 0.68, h * 0.34, col); break;
    case 'doc': g.beginPath(); g.moveTo(-h * 0.66, -h * 0.9); g.lineTo(h * 0.22, -h * 0.9); g.lineTo(h * 0.66, -h * 0.46); g.lineTo(h * 0.66, h * 0.9); g.lineTo(-h * 0.66, h * 0.9); g.closePath(); g.stroke(); L(h * 0.22, -h * 0.9, h * 0.22, -h * 0.46, h * 0.66, -h * 0.46); break;
    case 'warn': g.beginPath(); g.arc(0, 0, h * 0.9, 0, TAU); g.stroke(); L(0, -h * 0.45, 0, h * 0.1); g.beginPath(); g.arc(0, h * 0.45, h * 0.1, 0, TAU); g.fill(); break;
    case 'shield': g.beginPath(); g.moveTo(0, -h * 0.92); g.lineTo(h * 0.78, -h * 0.6); g.lineTo(h * 0.72, h * 0.08); g.quadraticCurveTo(h * 0.52, h * 0.7, 0, h * 0.94); g.quadraticCurveTo(-h * 0.52, h * 0.7, -h * 0.72, h * 0.08); g.lineTo(-h * 0.78, -h * 0.6); g.closePath(); g.stroke(); L(-h * 0.3, 0, -h * 0.05, h * 0.25, h * 0.35, -h * 0.25); break;
    case 'sync': g.beginPath(); g.arc(0, 0, h * 0.75, -Math.PI * 0.95, -Math.PI * 0.2); g.stroke(); g.beginPath(); g.arc(0, 0, h * 0.75, Math.PI * 0.05, Math.PI * 0.8); g.stroke();
      L(h * 0.42, -h * 0.82, h * 0.6, -h * 0.44, h * 0.2, -h * 0.36); L(-h * 0.42, h * 0.82, -h * 0.6, h * 0.44, -h * 0.2, h * 0.36); break;
    case 'calendar': g.beginPath(); g.roundRect(-h * 0.85, -h * 0.68, h * 1.7, h * 1.5, h * 0.2); g.stroke(); L(-h * 0.85, -h * 0.2, h * 0.85, -h * 0.2); L(-h * 0.4, -h * 0.9, -h * 0.4, -h * 0.5); L(h * 0.4, -h * 0.9, h * 0.4, -h * 0.5); break;
  }
  g.restore();
}
function d5_arrow(g, x0, y0, x1, y1, col, lw = 4, hs = 14) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1);
  g.moveTo(x1 - Math.cos(a - 0.6) * hs, y1 - Math.sin(a - 0.6) * hs); g.lineTo(x1, y1); g.lineTo(x1 - Math.cos(a + 0.6) * hs, y1 - Math.sin(a + 0.6) * hs);
  g.stroke(); g.restore();
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
  const r = mulberry32(seed), cols = [D5.lav2, D5.teal2, D5.pink2, D5.milk, D5.lav];
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
    d5_blob(g, x1, y0, rb, D5.teal, 0.13 * iri); d5_blob(g, x0, y1, rb, D5.pink, 0.11 * iri);
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
  g.translate(-3, -3); path(); g.strokeStyle = hexA(D5.pink, 0.42); g.stroke();
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

/* ───────────── light: rings, orbits ───────────── */
function d5_ring(g, cx, cy, rx, ry, rot, a0, a1, lw, al = 1) {
  const cg = d5_conic(g, cx, cy, rot + 0.5, 1);
  const pass = (w, a, style) => {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a * al;
    g.lineWidth = w; g.lineCap = 'round'; g.strokeStyle = style;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, rot, a0, a1); g.stroke(); g.restore();
  };
  pass(lw * 5, 0.07, cg); pass(lw * 2.2, 0.2, cg); pass(lw, 0.75, cg); pass(Math.max(1, lw * 0.22), 0.85, 'rgba(255,255,255,0.9)');
}

/* ───────────── tokens (generic coins; no real logos) ───────────── */
function d5_emblem(g, k, s, dark) {
  const shape = () => {
    g.beginPath();
    if (k === 'hex') { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6; i ? g.lineTo(Math.cos(a) * s, Math.sin(a) * s) : g.moveTo(Math.cos(a) * s, Math.sin(a) * s); } g.closePath(); g.moveTo(s * 0.38, 0); g.arc(0, 0, s * 0.38, 0, TAU); }
    else if (k === 'tri') { for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; i ? g.lineTo(Math.cos(a) * s, Math.sin(a) * s) : g.moveTo(Math.cos(a) * s, Math.sin(a) * s); } g.closePath(); }
    else if (k === 'ring') { g.arc(0, 0, s, 0, TAU); g.moveTo(s * 0.5, 0); g.arc(0, 0, s * 0.5, 0, TAU); }
    else { g.moveTo(0, -s); g.lineTo(s * 0.8, 0); g.lineTo(0, s); g.lineTo(-s * 0.8, 0); g.closePath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); }
  };
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (k === 'tl') {
    text(g, '₺', 0, s * 0.62 + s * 0.08, { f: D5U, w: 800, s: s * 1.7, c: hexA(dark, 0.7) });
    text(g, '₺', 0, s * 0.62, { f: D5U, w: 800, s: s * 1.7, c: 'rgba(255,255,255,0.92)' });
    return;
  }
  g.lineWidth = s * 0.2;
  g.save(); g.translate(0, s * 0.08); shape(); g.strokeStyle = hexA(dark, 0.7); g.stroke(); g.restore();
  shape(); g.strokeStyle = 'rgba(255,255,255,0.92)'; g.stroke();
}
function d5_coin(g, x, y, r, o = {}) {
  const [c0, c1, c2] = D5_COIN[o.col || 'lav'], tilt = o.tilt == null ? 0.6 : o.tilt, th = r * (o.th == null ? 0.2 : o.th), ry = r * tilt;
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
  g.save(); g.clip(); g.globalAlpha *= 0.5; g.globalCompositeOperation = 'soft-light';
  g.fillStyle = d5_conic(g, 0, 0, (o.rot || 0) + 0.7); g.fillRect(-r, -r, 2 * r, 2 * r); g.restore();
  // engraved ring
  g.lineWidth = r * 0.07; g.strokeStyle = hexA(c2, 0.5); g.beginPath(); g.ellipse(0, r * 0.025, r * 0.76, ry * 0.76, 0, 0, TAU); g.stroke();
  g.lineWidth = r * 0.035; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(0, -r * 0.012, r * 0.76, ry * 0.76, 0, Math.PI * 0.95, Math.PI * 1.95); g.stroke();
  g.save(); g.scale(1, tilt); d5_emblem(g, o.mark || 'hex', r * 0.4, c2); g.restore();
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

/* ───────────── capsule (asset pill / info chip) with frosted glass ───────────── */
function d5_pillM(g, label, s) {
  const fs = 24 * s, h = 64 * s, ic = 44 * s, tw = d5_mw(g, label, fs, D5M, 700);
  return { fs, h, ic, w: ic + tw + 50 * s };
}
function d5_pillContent(x, px, py, label, icon, M, s, o = {}) {
  const cy = py + M.h / 2, ix = px + 10 * s + M.ic / 2;
  if (o.outline) {
    x.fillStyle = 'rgba(245,243,255,0.1)'; x.beginPath(); x.arc(ix, cy, M.ic / 2, 0, TAU); x.fill();
    d5_icon(x, icon, ix, cy, M.ic * 0.5, o.ic || D5.teal2, Math.max(1.6, 2.4 * s));
  } else {
    x.fillStyle = d5_holo(x, ix - M.ic / 2, cy - M.ic / 2, ix + M.ic / 2, cy + M.ic / 2, 1); x.beginPath(); x.arc(ix, cy, M.ic / 2, 0, TAU); x.fill();
    d5_icon(x, icon, ix, cy, M.ic * 0.5, D5.deep, Math.max(1.6, 2.6 * s));
  }
  d5_t(x, label, ix + M.ic / 2 + 13 * s, cy + M.fs * 0.36, M.fs, D5.milk, { w: 700 });
}
function d5_pill(g, cx, cy, label, icon, s, o = {}) {
  const M = d5_pillM(g, label, s), x0 = cx - M.w / 2, y0 = cy - M.h / 2;
  if (o.blur) {
    const pad = Math.ceil(o.blur * 3) + 2, c = canvas(M.w + pad * 2, M.h + pad * 2), x = c.getContext('2d');
    x.translate(pad, pad);
    rr(x, 0, 0, M.w, M.h, M.h / 2); x.fillStyle = 'rgba(170,155,255,0.24)'; x.fill();
    x.lineWidth = 1.5; x.strokeStyle = d5_holo(x, 0, 0, M.w, M.h, 0.6); x.stroke();
    d5_pillContent(x, 0, 0, label, icon, M, s, o);
    const b = canvas(c.width, c.height), bx = b.getContext('2d');
    bx.filter = `blur(${o.blur}px)`; bx.drawImage(c, 0, 0);
    g.save(); g.globalAlpha *= o.a == null ? 1 : o.a; g.drawImage(b, x0 - pad, y0 - pad); g.restore();
    return M;
  }
  d5_card(g, x0, y0, M.w, M.h, M.h / 2, { dark: 0.32, sheen: 0.18, shadow: 0.45, iri: 0.6, rim: 5, ...o }, () => d5_pillContent(g, x0, y0, label, icon, M, s, o));
  return M;
}

/* ───────────── scene 1-2: the scattered apps ───────────── */
function d5_appHead(x, w, title, sub, col, icon) {
  const gr = x.createLinearGradient(22, 20, 68, 66); gr.addColorStop(0, col); gr.addColorStop(1, D5.lav);
  x.fillStyle = gr; rr(x, 22, 20, 46, 46, 14); x.fill();
  d5_icon(x, icon, 45, 43, 24, D5.milk, 2.6);
  d5_t(x, title, 82, 41, 21, D5.milk, { w: 800 });
  d5_t(x, sub, 82, 62, 15, D5.soft, { w: 600 });
  for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(245,243,255,0.28)'; x.beginPath(); x.arc(w - 28 - i * 13, 40, 3.5, 0, TAU); x.fill(); }
}
function d5_appBroker(x, w, h) {
  d5_appHead(x, w, 'Hisselerim', 'Aracı kurum uygulaması', D5.teal, 'stock');
  [['AAPL', '₺1.402.180', '+%1,24', 11], ['VOO', '₺2.058.904', '+%0,58', 12], ['MSFT', '₺684.210', '−%0,42', 13]].forEach(([t, v, c, sd], i) => {
    const y = 120 + i * 56, up = c[0] === '+', col = up ? D5.teal2 : D5.pink;
    x.fillStyle = 'rgba(245,243,255,0.1)'; x.fillRect(22, y - 32, w - 44, 1.2);
    d5_t(x, t, 24, y + 4, 19, D5.milk, { w: 800 });
    d5_spark(x, d5_map(d5_series(sd, 24, up ? 0.004 : -0.003, 0.02, up ? 1.08 : 0.95), 104, 178, y - 14, y + 6), col, 2, { glow: 4 });
    d5_t(x, v, 302, y + 4, 18, D5.milk, { w: 700, a: 'right' });
    d5_t(x, c, w - 22, y + 4, 16, col, { w: 800, a: 'right' });
  });
}
function d5_appCrypto(x, w, h) {
  d5_appHead(x, w, 'Kripto cüzdanı', 'Kripto borsası', D5.pink, 'crypto');
  d5_k(x, 'TOPLAM BAKİYE', 24, 106, 13, D5.soft);
  d5_t(x, '₺778.415,20', 22, 146, 32, D5.milk, { w: 800 });
  d5_t(x, '−%2,10', w - 22, 144, 18, D5.pink, { w: 800, a: 'right' });
  const r = mulberry32(77), n = 22, x0 = 24, x1 = w - 24, y0 = 168, y1 = h - 20, bw = (x1 - x0) / n;
  let v = 0.55;
  for (let i = 0; i < n; i++) {
    const o = v; v = clamp(v + (r() - 0.53) * 0.2, 0.1, 0.9);
    const hi = Math.max(o, v) + r() * 0.08, lo = Math.min(o, v) - r() * 0.08, up = v >= o, cx = x0 + i * bw + bw / 2, Y = q => lerp(y1, y0, q);
    x.fillStyle = up ? D5.teal2 : D5.pink;
    x.fillRect(cx - 0.8, Y(hi), 1.6, Y(lo) - Y(hi));
    rr(x, cx - bw * 0.3, Y(Math.max(o, v)), bw * 0.6, Math.max(2, Math.abs(Y(o) - Y(v))), 1.5); x.fill();
  }
}
function d5_appSheet(x, w, h) {
  x.fillStyle = 'rgba(25,211,197,0.18)'; rr(x, 0, 0, w, 52, [24, 24, 0, 0]); x.fill();
  x.fillStyle = D5.teal; rr(x, 20, 13, 26, 26, 6); x.fill();
  x.strokeStyle = D5.deep; x.lineWidth = 1.6; x.beginPath(); x.moveTo(24, 26); x.lineTo(42, 26); x.moveTo(33, 17); x.lineTo(33, 35); x.stroke();
  d5_t(x, 'portfoy_SON_v7.xlsx', 58, 33, 17, D5.milk, { w: 700 });
  rr(x, 16, 62, w - 32, 32, 8); x.fillStyle = 'rgba(245,243,255,0.07)'; x.fill();
  d5_t(x, 'fx', 28, 84, 15, D5.soft, { w: 800, ls: 0 });
  d5_t(x, '=TOPLA(B2:B9)*KUR', 56, 84, 15, D5.milk, { w: 600 });
  const cw = [34, 110, 92, 92, 78], top = 104, rh = 31, cols = ['', 'A', 'B', 'C', 'D'];
  const rows = [['AAPL', '1.402,18', '#REF!', '12,4'], ['BTC', '#N/A', '778.415', '−2,1'], ['VOO', '2.058,90', '61,9', '#DEĞER!'], ['ETH', '9.876,40', '#REF!', '3,4'], ['KUR?', '#N/A', '—', '—'], ['TOPLAM', '#REF!', '#REF!', '#REF!']];
  let cx = 16;
  x.fillStyle = 'rgba(245,243,255,0.06)'; x.fillRect(16, top, w - 32, rh);
  cw.forEach((c, j) => {
    d5_t(x, cols[j], cx + c / 2, top + 21, 13, D5.dim, { w: 800, a: 'center' });
    for (let i = 0; i < rows.length; i++) {
      const y = top + rh * (i + 1), s = j === 0 ? String(i + 2) : rows[i][j - 1], err = s[0] === '#';
      if (err) { x.fillStyle = 'rgba(255,139,209,0.18)'; x.fillRect(cx + 1, y + 1, c - 2, rh - 2); }
      d5_t(x, s, j <= 1 ? cx + 8 : cx + c - 8, y + 21, 14, err ? D5.pink : j === 0 ? D5.dim : D5.milk, { w: err || j === 1 ? 800 : 600, a: j <= 1 ? 'left' : 'right' });
    }
    cx += c;
  });
  x.strokeStyle = 'rgba(245,243,255,0.1)'; x.lineWidth = 1;
  for (let i = 0; i <= rows.length + 1; i++) { x.beginPath(); x.moveTo(16, top + i * rh); x.lineTo(w - 16, top + i * rh); x.stroke(); }
  cx = 16; cw.forEach(c => { cx += c; x.beginPath(); x.moveTo(cx, top); x.lineTo(cx, top + rh * (rows.length + 1)); x.stroke(); });
}
function d5_appBank(x, w, h) {
  d5_appHead(x, w, 'Banka', 'Vadeli ve vadesiz hesaplar', D5.lav2, 'bank');
  d5_k(x, 'VADELİ MEVDUAT', 24, 110, 13, D5.soft);
  d5_t(x, '₺250.000,00', 22, 150, 32, D5.milk, { w: 800 });
  [['Döviz hesabı', '$12.400'], ['Altın hesabı', '48 gr']].forEach(([a, b], i) => {
    const y = 192 + i * 32;
    x.fillStyle = 'rgba(245,243,255,0.1)'; x.fillRect(22, y - 22, w - 44, 1.2);
    d5_t(x, a, 24, y, 16, D5.soft, { w: 600 }); d5_t(x, b, w - 22, y, 16, D5.milk, { w: 700, a: 'right' });
  });
}
function d5_appFund(x, w, h) {
  d5_appHead(x, w, 'Emeklilik', 'Fon portföyü', D5.pink, 'fund');
  d5_t(x, '₺412.760', 22, 128, 30, D5.milk, { w: 800 });
  d5_t(x, '+%6,2', w - 22, 126, 17, D5.teal2, { w: 800, a: 'right' });
  const pts = d5_map(d5_series(31, 40, 0.002, 0.012, 1.06), 24, w - 24, 148, h - 22);
  const af = x.createLinearGradient(0, 148, 0, h - 22); af.addColorStop(0, 'rgba(178,165,255,0.35)'); af.addColorStop(1, 'rgba(178,165,255,0)');
  x.beginPath(); smoothPath(x, pts); x.lineTo(w - 24, h - 22); x.lineTo(24, h - 22); x.closePath(); x.fillStyle = af; x.fill();
  d5_spark(x, pts, D5.lav2, 2.5, { glow: 6 });
}
function d5_toast(x, w, h, title, sub) {
  x.fillStyle = hexA(D5.pink, 0.22); x.beginPath(); x.arc(46, h / 2, 24, 0, TAU); x.fill();
  d5_icon(x, 'warn', 46, h / 2, 26, D5.pink, 2.8);
  d5_t(x, title, 84, h / 2 - 5, 20, D5.milk, { w: 800 });
  d5_t(x, sub, 84, h / 2 + 21, 15, D5.soft, { w: 600 });
}
const D5_APPS = {
  broker: [d5_appBroker, 400, 290], crypto: [d5_appCrypto, 400, 290], sheet: [d5_appSheet, 440, 330],
  bank: [d5_appBank, 380, 250], fund: [d5_appFund, 360, 230],
  toastA: [(x, w, h) => d5_toast(x, w, h, 'Kur bulunamadı', 'Tablo 94 gün önce güncellendi'), 400, 100],
  toastB: [(x, w, h) => d5_toast(x, w, h, 'Oturum süresi doldu', 'Kripto borsasına tekrar giriş yapın'), 390, 100],
};
function d5_heroCard(x, w, h) {
  const ww = wordmarkWidth(x, 58, { f: D5U, w: 800 }) + 4, gx = w / 2 - (ww + 84) / 2;
  drawMark(x, gx + 32, 96, 30, { th: 0.24, disc: false, col: D5.teal, col2: D5.pink, arrow: D5.teal2 });
  wordmark(x, gx + 84, 117, 58, null, { a: 'left', f: D5U, w: 800, grad: [[0, '#8EF1E7'], [1, '#FFC4E7']] });
  x.fillStyle = d5_holo(x, w / 2 - 330, 0, w / 2 - 150, 0, 0.7); x.fillRect(w / 2 - 330, 176, 170, 2);
  x.fillStyle = d5_holo(x, w / 2 + 150, 0, w / 2 + 330, 0, 0.7); x.fillRect(w / 2 + 160, 176, 170, 2);
  d5_k(x, 'TEK NET GÖRÜNÜM', w / 2, 183, 17, D5.soft, { a: 'center' });
  d5_head(x, [['Tüm yatırımların,', D5.milk]], w / 2, 318, 78, { a: 'center', glow: 0.35 });
  d5_head(x, [['tek ekranda.', 'holo']], w / 2, 420, 78, { a: 'center', glow: 0.35 });
  const chips = ['8 varlık sınıfı', '60+ piyasa', '50+ para birimi', '25+ aracı kurum'];
  const ws = chips.map(c => d5_mw(x, c, 19, D5M, 700) + 19 * 1.5 + 17), tot = ws.reduce((a, b) => a + b, 0) + 16 * (chips.length - 1);
  let px = w / 2 - tot / 2;
  chips.forEach((c, i) => { d5_tchip(x, px, 520, c, { a: 'left', s: 19, dot: [D5.teal2, D5.lav2, D5.pink2, D5.milk][i] }); px += ws[i] + 16; });
}

/* ───────────── scene 3: the dashboard ───────────── */
function d5_dash(x, w, h) {
  const panel = (px, py, pw, ph) => { rr(x, px, py, pw, ph, 22); x.fillStyle = 'rgba(245,243,255,0.045)'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(245,243,255,0.13)'; x.stroke(); };
  // top bar
  drawMark(x, 50, 44, 19, { th: 0.26, disc: false, col: D5.teal, col2: D5.pink, arrow: D5.teal2 });
  wordmark(x, 82, 54, 27, null, { a: 'left', f: D5U, w: 800, grad: [[0, '#8EF1E7'], [1, '#FFC4E7']] });
  let nx = 452;
  ['Genel bakış', 'Varlıklar', 'Temettü', 'Risk', 'Vergi'].forEach((s, i) => {
    const o = { f: D5M, w: 700, s: 18 }, tw = measure(x, s, o);
    if (i === 0) { rr(x, nx - 18, 24, tw + 36, 40, 20); x.fillStyle = 'rgba(110,91,255,0.42)'; x.fill(); }
    text(x, s, nx, 50, { ...o, a: 'left', c: i ? D5.soft : D5.milk });
    nx += tw + 44;
  });
  const sw = 236, sx = w - 28 - sw;
  rr(x, sx, 24, sw, 40, 20); x.fillStyle = 'rgba(25,211,197,0.14)'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(25,211,197,0.45)'; x.stroke();
  check(x, sx + 26, 44, 13, D5.teal2, 2.6);
  d5_t(x, 'Son senkron · 03:00', sx + 44, 50, 16, D5.teal2, { w: 700 });
  x.fillStyle = 'rgba(245,243,255,0.1)'; x.fillRect(24, 86, w - 48, 1.2);
  // value + chart
  panel(24, 104, 990, 466);
  d5_k(x, 'TOPLAM PORTFÖY DEĞERİ', 56, 152, 15, D5.soft);
  text(x, '₺9.482.150,36', 52, 236, { f: D5M, w: 800, s: 76, a: 'left', c: D5.milk, ls: -1.5 });
  rr(x, 56, 258, 322, 40, 20); x.fillStyle = 'rgba(25,211,197,0.16)'; x.fill();
  x.fillStyle = D5.teal2; x.beginPath(); x.moveTo(74, 285); x.lineTo(82, 271); x.lineTo(90, 285); x.closePath(); x.fill();
  d5_t(x, '+₺64.218,40 · +%0,68 bugün', 100, 285, 17, D5.teal2, { w: 700 });
  let tx = 712;
  ['1A', '6A', 'YB', '1Y', 'TÜMÜ'].forEach((s, i) => {
    const o = { f: D5M, w: 800, s: 14 }, tw = measure(x, s, o) + 26;
    if (i === 3) { rr(x, tx, 128, tw, 32, 16); x.fillStyle = 'rgba(245,243,255,0.15)'; x.fill(); }
    text(x, s, tx + tw / 2, 149, { ...o, c: i === 3 ? D5.milk : D5.dim });
    tx += tw + 6;
  });
  x.fillStyle = D5.teal2; rr(x, 732, 198, 22, 4, 2); x.fill(); d5_t(x, 'Portföy', 762, 206, 15, D5.soft, { w: 700 });
  x.save(); x.strokeStyle = D5.pink; x.lineWidth = 3; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(846, 200); x.lineTo(870, 200); x.stroke(); x.restore();
  d5_t(x, 'S&P 500', 880, 206, 15, D5.soft, { w: 700 });
  const G = { x0: 56, x1: 880, y0: 336, y1: 548 };
  for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(245,243,255,0.06)'; x.fillRect(G.x0, lerp(G.y0, G.y1, k / 3), 930, 1); }
  const ys = d5_series(5101, 140, 0.0024, 0.011, 1.384), ss = d5_series(5102, 140, 0.0016, 0.009, 1.241);
  const lo = Math.min(...ys, ...ss) * 0.99, hi = Math.max(...ys, ...ss) * 1.01;
  const you = d5_map(ys, G.x0, G.x1, G.y0, G.y1, lo, hi), spy = d5_map(ss, G.x0, G.x1, G.y0, G.y1, lo, hi);
  const af = x.createLinearGradient(0, G.y0, 0, G.y1); af.addColorStop(0, 'rgba(25,211,197,0.3)'); af.addColorStop(1, 'rgba(25,211,197,0)');
  x.beginPath(); smoothPath(x, you); x.lineTo(G.x1, G.y1); x.lineTo(G.x0, G.y1); x.closePath(); x.fillStyle = af; x.fill();
  x.save(); x.setLineDash([7, 6]); d5_spark(x, spy, D5.pink, 2.4, { glow: 0 }); x.restore();
  const lg = x.createLinearGradient(G.x0, 0, G.x1, 0); lg.addColorStop(0, D5.lav2); lg.addColorStop(1, D5.teal2);
  d5_spark(x, you, D5.teal, 4, { glow: 14, stroke: lg });
  const e1 = you[you.length - 1], e2 = spy[spy.length - 1];
  [[e1, D5.teal2, '+%38,4'], [e2, D5.pink, '+%24,1']].forEach(([e, col, s]) => {
    x.fillStyle = col; x.beginPath(); x.arc(e[0], e[1], 6, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 2; x.stroke();
    d5_tchip(x, e[0] + 14, e[1], s, { a: 'left', s: 15, c: D5.deep, fill: col, stroke: false });
  });
  // allocation
  panel(1032, 104, 444, 466);
  d5_k(x, 'DAĞILIM', 1062, 152, 15, D5.soft);
  let ax = 1062;
  ['Varlık', 'Ülke', 'Sektör', 'Kurum'].forEach((s, i) => {
    const o = { f: D5M, w: 700, s: 15 }, tw = measure(x, s, o) + 26;
    if (!i) { rr(x, ax, 172, tw, 32, 16); x.fillStyle = 'rgba(110,91,255,0.42)'; x.fill(); }
    text(x, s, ax + tw / 2, 193, { ...o, c: i ? D5.dim : D5.milk }); ax += tw + 4;
  });
  const AL = [['Hisse', 44, D5.teal], ['ETF', 22, D5.lav2], ['Kripto', 12, D5.pink], ['Tahvil', 10, D5.milk], ['Gayrimenkul', 7, D5.lav], ['Nakit', 5, D5.teal2]];
  const dc = [1150, 382], dr = 86;
  let a = -Math.PI / 2;
  x.save(); x.lineWidth = 26;
  AL.forEach(([n, v, col]) => { const da = v / 100 * TAU; x.strokeStyle = col; x.shadowColor = hexA(col, 0.6); x.shadowBlur = 10; x.beginPath(); x.arc(dc[0], dc[1], dr, a + 0.035, a + da - 0.035); x.stroke(); a += da; });
  x.restore();
  text(x, '%44', dc[0], dc[1] + 6, { f: D5M, w: 800, s: 30, c: D5.milk });
  text(x, 'Hisse', dc[0], dc[1] + 30, { f: D5M, w: 700, s: 14, c: D5.soft });
  AL.forEach(([n, v, col], i) => {
    const y = 262 + i * 46;
    x.fillStyle = col; rr(x, 1270, y - 11, 12, 12, 3); x.fill();
    d5_t(x, n, 1292, y, 16, D5.milk, { w: 600 });
    d5_t(x, '%' + v, 1450, y, 16, D5.soft, { w: 800, a: 'right' });
  });
  // holdings
  panel(24, 588, 990, 248);
  [['VARLIK', 56, 'left'], ['SINIF', 520, 'left'], ['DEĞER', 830, 'right'], ['GÜNLÜK', 982, 'right']].forEach(([s, px, al]) => d5_k(x, s, px, 630, 13, D5.dim, { a: al }));
  [['AAPL', 'Apple Inc.', 'Hisse', '₺1.402.180', '+%1,24'], ['VOO', 'Vanguard S&P 500 ETF', 'ETF', '₺2.058.904', '+%0,58'], ['BTC', 'Bitcoin', 'Kripto', '₺778.415', '−%2,10']].forEach(([t, n, c, v, ch], i) => {
    const y = 684 + i * 52, up = ch[0] === '+';
    x.fillStyle = 'rgba(245,243,255,0.08)'; x.fillRect(48, y - 30, 942, 1);
    x.fillStyle = d5_holo(x, 56, y - 24, 92, y + 12, 0.95); x.beginPath(); x.arc(74, y - 6, 18, 0, TAU); x.fill();
    text(x, t[0], 74, y, { f: D5M, w: 800, s: 17, c: D5.deep });
    d5_t(x, t, 104, y - 9, 18, D5.milk, { w: 800 });
    d5_t(x, n, 104, y + 11, 13, D5.soft, { w: 600 });
    d5_tchip(x, 520, y - 6, c, { a: 'left', s: 13 });
    d5_t(x, v, 830, y - 1, 18, D5.milk, { w: 700, a: 'right' });
    d5_t(x, ch, 982, y - 1, 17, up ? D5.teal2 : D5.pink, { w: 800, a: 'right' });
  });
  // KPIs
  panel(1032, 588, 444, 248);
  d5_k(x, 'YILLIK BİLEŞİK GETİRİ (CAGR)', 1062, 634, 13, D5.soft);
  text(x, '%11,2', 1060, 684, { f: D5M, w: 800, s: 38, a: 'left', c: D5.milk });
  d5_k(x, 'GERÇEKLEŞMEMİŞ KÂR', 1062, 742, 13, D5.soft);
  text(x, '₺1.284.900', 1060, 792, { f: D5M, w: 800, s: 38, a: 'left', c: D5.teal2 });
  [0.35, 0.5, 0.45, 0.7, 0.88].forEach((v, i) => { x.fillStyle = i === 4 ? D5.lav2 : 'rgba(178,165,255,0.35)'; rr(x, 1378 + i * 16, 692 - v * 46, 10, v * 46, 3); x.fill(); });
}
function d5_fcDay(x, w, h) {
  d5_k(x, 'GÜNLÜK DEĞİŞİM', 28, 48, 14, D5.soft);
  x.fillStyle = 'rgba(25,211,197,0.2)'; x.beginPath(); x.arc(w - 46, 42, 20, 0, TAU); x.fill();
  d5_arrow(x, w - 54, 50, w - 38, 34, D5.teal2, 3, 9);
  d5_d(x, '+%0,68', 26, 124, 56, D5.teal2);
  d5_t(x, '+₺64.218,40 bugün', 28, 172, 19, D5.milk, { w: 700 });
  d5_spark(x, d5_map(d5_series(808, 30, 0.002, 0.01, 1.05), 236, w - 28, 140, 186), D5.teal2, 2.5, { glow: 8 });
}
function d5_fcTotal(x, w, h) {
  d5_k(x, 'TOPLAM GETİRİ', 28, 48, 14, D5.soft);
  [[0.9, D5.teal2], [0.58, D5.pink]].forEach(([v, col], i) => { x.fillStyle = col; rr(x, w - 70 + i * 22, 70 - v * 46, 14, v * 46, 4); x.fill(); });
  d5_head(x, [['+%38,4', 'holo']], 26, 124, 56, { glow: 0.3 });
  d5_t(x, 'S&P 500 aynı dönemde +%24,1', 28, 172, 17, D5.soft, { w: 600 });
}

/* ───────────── scene 4: holographic globe ───────────── */
function d5_globe(g, gx, gy, R, lc, pc) {
  const sp = Math.sin(pc), cp = Math.cos(pc), NB = 12;
  const front = Array.from({ length: NB }, () => new Path2D()), back = new Path2D();
  const proj = (la, lo) => { const d = lo - lc, cl = Math.cos(la); return [gx + R * cl * Math.sin(d), gy - R * (cp * Math.sin(la) - sp * cl * Math.cos(d)), sp * Math.sin(la) + cp * cl * Math.cos(d)]; };
  for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
    const [x, y, z] = proj(GLOBE_DOTS[i] * Math.PI / 180, GLOBE_DOTS[i + 1] * Math.PI / 180);
    if (z > 0) {
      const u = clamp(0.5 + (x - gx) / R * 0.4 + (y - gy) / R * 0.25), s = 1.1 + z * 1.5;
      front[Math.min(NB - 1, Math.floor(u * NB))].rect(x - s, y - s, s * 2, s * 2);
    } else back.rect(x - 1.1, y - 1.1, 2.2, 2.2);
  }
  addGlow(g, D5.lav, gx, gy, R * 2.5, 0.55);
  addGlow(g, D5.teal, gx - R * 0.55, gy - R * 0.45, R * 1.3, 0.2);
  g.save(); g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.clip();
  g.drawImage(D5S.blur, 0, 0, W, H);
  const bd = g.createRadialGradient(gx - R * 0.3, gy - R * 0.35, R * 0.05, gx, gy, R);
  bd.addColorStop(0, 'rgba(126,106,255,0.3)'); bd.addColorStop(0.62, 'rgba(22,13,64,0.58)'); bd.addColorStop(0.9, 'rgba(66,48,186,0.55)'); bd.addColorStop(1, 'rgba(178,165,255,0.75)');
  g.fillStyle = bd; g.fillRect(gx - R, gy - R, 2 * R, 2 * R);
  g.fillStyle = hexA(D5.lav2, 0.2); g.fill(back);
  g.restore();
  // graticule (front side only)
  g.save(); g.lineWidth = 1.2; g.strokeStyle = hexA(D5.teal2, 0.17);
  const curve = (fn, n) => { let on = false; g.beginPath(); for (let k = 0; k <= n; k++) { const [x, y, z] = fn(k / n); if (z > 0.03) { on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } else on = false; } g.stroke(); };
  for (let la = -60; la <= 60; la += 30) curve(t => proj(la * Math.PI / 180, t * TAU), 96);
  for (let lo = 0; lo < 360; lo += 30) curve(t => proj((t - 0.5) * Math.PI, lo * Math.PI / 180), 64);
  g.restore();
  g.save(); g.shadowBlur = 7;
  for (let b = 0; b < NB; b++) { const c = rgb(ramp([D5.teal2, D5.lav2, D5.pink2, D5.lav2], b / (NB - 1)), 0.95); g.shadowColor = c; g.fillStyle = c; g.fill(front[b]); }
  g.restore();
  const fr = g.createRadialGradient(gx, gy, R * 0.72, gx, gy, R);
  fr.addColorStop(0, 'rgba(180,165,255,0)'); fr.addColorStop(1, 'rgba(205,195,255,0.38)');
  g.fillStyle = fr; g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.fill();
  g.lineWidth = 3; g.strokeStyle = d5_conic(g, gx, gy, -0.8, 0.95); g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.stroke();
  g.save(); g.translate(gx - R * 0.42, gy - R * 0.52); g.rotate(-0.62); g.scale(1, 0.42);
  const sg = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.44); sg.addColorStop(0, 'rgba(255,255,255,0.6)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sg; g.beginPath(); g.arc(0, 0, R * 0.44, 0, TAU); g.fill(); g.restore();
  addGlow(g, D5.pink, gx + R * 0.38, gy + R * 0.62, R * 0.55, 0.28);
}
function d5_orbitLine(g, orb, a0, a1, lw, al) {
  const n = 80, pts = [];
  for (let k = 0; k <= n; k++) pts.push(orb(lerp(a0, a1, k / n)));
  const xs = pts.map(p => p[0]);
  const grad = d5_holo(g, Math.min(...xs), 0, Math.max(...xs), 0, 1);
  [[lw * 5, 0.08], [lw * 2, 0.22], [lw, 0.8]].forEach(([w, a]) => {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a * al; g.lineWidth = w; g.lineCap = 'round'; g.strokeStyle = grad;
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore();
  });
}

/* ───────────── scene 5: broker tiles + hub ───────────── */
const D5_BROKERS = ['Interactive Brokers', 'Charles Schwab', 'Fidelity', 'Robinhood', 'Trading 212', 'DEGIRO', 'eToro', 'Coinbase', 'Wealthsimple', 'Public'];
function d5_tile(x, w, h, name) {
  x.fillStyle = d5_holo(x, 18, 20, 82, 84, 0.95); rr(x, 20, (h - 60) / 2, 60, 60, 18); x.fill();
  d5_icon(x, 'bank', 50, h / 2, 30, D5.deep, 3);
  d5_t(x, name, 96, h / 2 - 4, 24, D5.milk, { w: 700 });
  check(x, 102, h / 2 + 22, 12, D5.teal2, 2.6);
  d5_t(x, 'Bağlı · salt-okunur', 116, h / 2 + 28, 15, D5.soft, { w: 600 });
}
function d5_hubTex(x, w, h) {
  addGlow(x, D5.lav, w / 2, 118, 130, 0.6);
  drawMark(x, w / 2, 118, 58, { th: 0.22, disc: false, col: D5.teal, col2: D5.pink, arrow: D5.teal2 });
  wordmark(x, w / 2, 230, 34, null, { f: D5U, w: 800, grad: [[0, '#8EF1E7'], [1, '#FFC4E7']] });
  rr(x, w / 2 - 98, 254, 196, 36, 18); x.fillStyle = 'rgba(25,211,197,0.16)'; x.fill();
  check(x, w / 2 - 74, 272, 12, D5.teal2, 2.6);
  d5_t(x, '10 hesap güncel', w / 2 - 58, 278, 15, D5.teal2, { w: 700 });
}

/* ───────────── scene 6: 3D glass bar chart ───────────── */
function d5_cam(p) { const k = p[2] / FOCAL; return [(p[0] - CX) * k, (p[1] - CY) * k, p[2]]; }
function d5_poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
function d5_prism(g, P, b, st) {
  const [u0, u1, v0, v1, w0, w1] = b;
  const defs = [
    ['f', [0, 0, -1], [[u0, v0, w0], [u1, v0, w0], [u1, v1, w0], [u0, v1, w0]]],
    ['f', [0, 0, 1], [[u0, v0, w1], [u1, v0, w1], [u1, v1, w1], [u0, v1, w1]]],
    ['s', [-1, 0, 0], [[u0, v0, w0], [u0, v0, w1], [u0, v1, w1], [u0, v1, w0]]],
    ['s', [1, 0, 0], [[u1, v0, w0], [u1, v0, w1], [u1, v1, w1], [u1, v1, w0]]],
    ['t', [0, Math.sign(v1 - v0), 0], [[u0, v1, w0], [u1, v1, w0], [u1, v1, w1], [u0, v1, w1]]],
    ['d', [0, Math.sign(v0 - v1), 0], [[u0, v0, w0], [u1, v0, w0], [u1, v0, w1], [u0, v0, w1]]],
  ];
  const faces = defs.map(([k, n, pts]) => {
    const c = [0, 1, 2].map(j => (pts[0][j] + pts[2][j]) / 2);
    const a = d5_cam(P(c[0], c[1], c[2])), e = d5_cam(P(c[0] + n[0], c[1] + n[1], c[2] + n[2]));
    const vis = (e[0] - a[0]) * a[0] + (e[1] - a[1]) * a[1] + (e[2] - a[2]) * a[2] < 0;
    return { k, vis, sp: pts.map(p => P(p[0], p[1], p[2])) };
  });
  for (const f of faces) if (!f.vis && st.back) { d5_poly(g, f.sp); g.fillStyle = st.back; g.fill(); }
  for (const f of faces) if (f.vis) {
    d5_poly(g, f.sp);
    const ys = f.sp.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const st2 = st[f.k];
    if (st2) { g.fillStyle = typeof st2 === 'function' ? st2(g, y0, y1) : st2; g.fill(); }
    if (st.edge) { g.save(); g.lineWidth = st.lw || 1.4; g.strokeStyle = st.edge; if (st.dash) g.setLineDash(st.dash); g.lineJoin = 'round'; g.stroke(); g.restore(); }
  }
  return faces;
}

/* ───────────── scene 7: Monte Carlo ───────────── */
function d5_init() {
  const r = mulberry32(5724), n = 400, steps = 120, out = [];
  for (let i = 0; i < n; i++) { const p = [1]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] * Math.exp(0.0056 + 0.045 * gauss(r))); out.push(p); }
  out.sort((a, b) => a[steps] - b[steps]);
  D5_MC.paths = out; D5_MC.steps = steps;
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const col = out.map(p => p[k]).sort((a, b) => a - b); return col[Math.floor(q * (n - 1))]; });
  D5_MC.p5 = pct(0.05); D5_MC.p50 = pct(0.5); D5_MC.p95 = pct(0.95);
}
const D5_MCG = { x0: 150, x1: 1010, y0: 150, y1: 610, lo: Math.log(0.4), hi: Math.log(7.5) };
function d5_mcPt(k, v) { const G = D5_MCG; return [lerp(G.x0, G.x1, k / D5_MC.steps), lerp(G.y1, G.y0, (Math.log(v) - G.lo) / (G.hi - G.lo))]; }
function d5_mcThreads(x, w, h) {
  const G = D5_MCG, n = D5_MC.paths.length;
  x.save(); x.beginPath(); x.rect(G.x0 - 2, G.y0 - 30, G.x1 - G.x0 + 6, G.y1 - G.y0 + 50); x.clip();
  const up = D5_MC.p95.map((v, k) => d5_mcPt(k, v)), dn = D5_MC.p5.map((v, k) => d5_mcPt(k, v));
  x.beginPath(); up.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); for (let i = dn.length - 1; i >= 0; i--) x.lineTo(dn[i][0], dn[i][1]); x.closePath();
  x.fillStyle = d5_holo(x, G.x0, G.y0, G.x1, G.y1, 0.1); x.fill();
  x.globalCompositeOperation = 'lighter'; x.lineWidth = 1.25; x.lineJoin = 'round';
  D5_MC.paths.forEach((p, i) => {
    x.strokeStyle = rgb(ramp([D5.pink, D5.lav2, D5.teal2], i / (n - 1)), 0.085);
    x.beginPath(); p.forEach((v, k) => { const q = d5_mcPt(k, v); k ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.stroke();
  });
  x.restore();
}
function d5_mcUI(x, w, h) {
  const G = D5_MCG;
  d5_t(x, 'Monte Carlo simülasyonu', 40, 72, 26, D5.milk, { w: 800 });
  let cx = w - 36;
  ['%5–%95 aralığı', '1–10 yıl', '1.000 senaryo'].forEach((s, i) => {
    const cw = d5_mw(x, s, 16, D5M, 700) + 24;
    cx -= cw; d5_tchip(x, cx, 64, s, { a: 'left', s: 16, c: i === 2 ? D5.deep : D5.milk, fill: i === 2 ? D5.teal2 : undefined, stroke: i === 2 ? false : undefined });
    cx -= 10;
  });
  [0.5, 1, 2, 4].forEach(m => {
    const y = d5_mcPt(0, m)[1];
    x.fillStyle = 'rgba(245,243,255,0.08)'; x.fillRect(G.x0, y, G.x1 - G.x0, 1.2);
  });
  ['Bugün', '2 yıl', '4 yıl', '6 yıl', '8 yıl', '10 yıl'].forEach((s, i) => d5_t(x, s, lerp(G.x0, G.x1, i / 5), G.y1 + 46, 15, D5.dim, { a: 'center', w: 700 }));
  [[D5_MC.p95, D5.teal2, '%95'], [D5_MC.p50, D5.milk, 'Medyan'], [D5_MC.p5, D5.pink, '%5']].forEach(([s, col, l]) => {
    const pts = s.map((v, k) => d5_mcPt(k, v)).filter((_, k) => k % 3 === 0 || k === s.length - 1);
    d5_spark(x, pts, col, 3.4, { glow: 14 });
    const e = pts[pts.length - 1];
    x.fillStyle = col; x.beginPath(); x.arc(e[0], e[1], 6.5, 0, TAU); x.fill();
    d5_tchip(x, e[0] + 18, e[1], l, { a: 'left', s: 15, c: col, fill: 'rgba(18,10,46,0.8)', stroke: hexA(col, 0.55) });
  });
  const s0 = d5_mcPt(0, 1);
  x.fillStyle = D5.milk; x.beginPath(); x.arc(s0[0], s0[1], 7, 0, TAU); x.fill();
  addGlow(x, D5.milk, s0[0], s0[1], 30, 0.6);
}
function d5_chipTex(x, w, h, label, val, col, frac) {
  d5_k(x, label, 26, 44, 14, D5.soft);
  d5_d(x, val, 24, 104, 44, col);
  const cx = w - 58, cy = 68, r = 30;
  x.lineCap = 'round'; x.lineWidth = 7;
  x.strokeStyle = 'rgba(245,243,255,0.12)'; x.beginPath(); x.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25); x.stroke();
  x.save(); x.shadowColor = col; x.shadowBlur = 10; x.strokeStyle = col; x.beginPath(); x.arc(cx, cy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * frac)); x.stroke(); x.restore();
}

/* ───────────── scene 8: feature cards ───────────── */
function d5_fanHead(x, w, n, icon, title, sub) {
  x.fillStyle = d5_holo(x, 28, 30, 84, 86, 1); x.beginPath(); x.arc(56, 60, 26, 0, TAU); x.fill();
  d5_t(x, n, 56, 67, 18, D5.deep, { w: 800, a: 'center' });
  x.fillStyle = 'rgba(245,243,255,0.08)'; x.beginPath(); x.arc(w - 56, 60, 26, 0, TAU); x.fill();
  d5_icon(x, icon, w - 56, 60, 26, D5.teal2, 2.6);
  title.forEach((s, i) => d5_d(x, s, 28, 148 + i * 40, 32, D5.milk));
  const ty = 148 + (title.length - 1) * 40;
  sub.forEach((s, i) => d5_t(x, s, 28, ty + 40 + i * 25, 18, D5.soft, { w: 500 }));
  return ty + 40 + (sub.length - 1) * 25;
}
function d5_fan1(x, w, h) {
  d5_fanHead(x, w, '01', 'stock', ['Kıyasla'], ['S&P 500, VOO ya da', 'seçtiğin bir endekse karşı.']);
  const G = { x0: 30, x1: w - 30, y0: 280, y1: 470 };
  for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(245,243,255,0.06)'; x.fillRect(G.x0, lerp(G.y0, G.y1, k / 3), G.x1 - G.x0, 1); }
  const a = d5_series(71, 60, 0.006, 0.016, 1.426), b = d5_series(72, 60, 0.004, 0.012, 1.319);
  const lo = Math.min(...a, ...b), hi = Math.max(...a, ...b);
  x.save(); x.setLineDash([6, 5]); d5_spark(x, d5_map(b, G.x0, G.x1, G.y0, G.y1, lo, hi), D5.pink, 2.4, { glow: 0 }); x.restore();
  d5_spark(x, d5_map(a, G.x0, G.x1, G.y0, G.y1, lo, hi), D5.teal2, 4, { glow: 12 });
  d5_d(x, '+%42,6', 28, 548, 34, D5.teal2); d5_t(x, 'Portföy', 30, 576, 16, D5.soft, { w: 700 });
  d5_d(x, '+%31,9', 236, 548, 34, D5.pink); d5_t(x, 'S&P 500', 238, 576, 16, D5.soft, { w: 700 });
}
function d5_fan2(x, w, h) {
  d5_fanHead(x, w, '02', 'doc', ['Vergi raporu'], ['FIFO, LIFO ve ortalama', 'maliyet; her planda.']);
  rr(x, 28, 264, w - 56, 52, 26); x.fillStyle = 'rgba(245,243,255,0.07)'; x.fill();
  const sw = (w - 64) / 3;
  ['FIFO', 'LIFO', 'Ort. maliyet'].forEach((s, i) => {
    if (i === 0) { rr(x, 32, 268, sw, 44, 22); x.fillStyle = d5_holo(x, 32, 268, 32 + sw, 312, 1); x.fill(); }
    d5_t(x, s, 32 + sw * i + sw / 2, 296, 16, i === 0 ? D5.deep : D5.soft, { w: 800, a: 'center' });
  });
  d5_k(x, 'GERÇEKLEŞEN KÂR', 30, 372, 14, D5.soft);
  d5_d(x, '₺127.340', 28, 428, 44, D5.milk);
  rr(x, 28, 470, w - 56, 92, 20); x.fillStyle = 'rgba(245,243,255,0.06)'; x.fill(); x.strokeStyle = 'rgba(245,243,255,0.14)'; x.lineWidth = 1.2; x.stroke();
  x.fillStyle = 'rgba(255,139,209,0.18)'; rr(x, 44, 488, 56, 56, 14); x.fill();
  d5_icon(x, 'doc', 72, 516, 28, D5.pink2, 2.6);
  d5_t(x, 'vergi_raporu_2025.pdf', 116, 510, 17, D5.milk, { w: 700 });
  d5_t(x, 'Hazır · indirilebilir', 116, 534, 14, D5.soft, { w: 600 });
  check(x, w - 58, 516, 14, D5.teal2, 3);
}
function d5_fan3(x, w, h) {
  d5_fanHead(x, w, '03', 'spark', ['Yapay zekâ ile', 'içe aktar'], ['CSV dosyanı bırak,', 'işlemler hazır gelsin.']);
  rr(x, 28, 318, 74, 92, 10); x.fillStyle = 'rgba(25,211,197,0.14)'; x.fill(); x.strokeStyle = D5.teal2; x.lineWidth = 2; x.stroke();
  d5_t(x, 'CSV', 65, 372, 18, D5.teal2, { w: 800, a: 'center' });
  d5_arrow(x, 116, 364, 172, 364, D5.lav2, 3.5, 11);
  sparkle(x, 200, 340, 14, D5.pink2); sparkle(x, 222, 382, 8, D5.teal2);
  d5_tchip(x, 240, 364, '3 işlem bulundu', { a: 'left', s: 15, c: D5.deep, fill: D5.teal2, stroke: false });
  [['İşlem', 'AAPL', '10 adet', D5.teal2], ['Temettü', 'VOO', '+₺3.124', D5.lav2], ['Transfer', 'ETH', '1,5 adet', D5.pink2]].forEach(([t, s, v, col], i) => {
    const y = 446 + i * 50;
    rr(x, 28, y - 20, w - 56, 42, 12); x.fillStyle = 'rgba(245,243,255,0.06)'; x.fill();
    x.fillStyle = col; rr(x, 28, y - 20, 5, 42, 2); x.fill();
    d5_t(x, t, 46, y + 6, 15, col, { w: 800 }); d5_t(x, s, 150, y + 6, 16, D5.milk, { w: 800 });
    d5_t(x, v, w - 44, y + 6, 16, D5.milk, { w: 700, a: 'right' });
  });
}
function d5_fan4(x, w, h) {
  d5_fanHead(x, w, '04', 'shield', ['Kriz testi'], ['4 gerçek kriz senaryosu', 'portföyünde denenir.']);
  const pts = [];
  for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([30 + u * (w - 60), 300 + 150 * Math.exp(-Math.pow((u - 0.4) / 0.12, 2)) - 40 * u]); }
  x.save(); x.beginPath(); x.moveTo(pts[12][0], 300 - 4.8 * 1); for (let k = 12; k <= 36; k++) x.lineTo(pts[k][0], pts[k][1]); x.lineTo(pts[36][0], 296); x.closePath();
  const gr = x.createLinearGradient(0, 300, 0, 450); gr.addColorStop(0, 'rgba(255,139,209,0.05)'); gr.addColorStop(1, 'rgba(255,139,209,0.4)');
  x.fillStyle = gr; x.fill(); x.restore();
  x.save(); x.setLineDash([5, 5]); x.strokeStyle = 'rgba(245,243,255,0.35)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(30, 296); x.lineTo(w - 30, 296); x.stroke(); x.restore();
  d5_spark(x, pts, D5.milk, 3.2, { glow: 8 });
  const lowI = pts.reduce((m, p, i) => p[1] > pts[m][1] ? i : m, 0), low = pts[lowI];
  x.fillStyle = D5.pink; x.beginPath(); x.arc(low[0], low[1], 6.5, 0, TAU); x.fill();
  d5_k(x, 'MAKS. DÜŞÜŞ', w - 30, 520, 14, D5.soft, { a: 'right' });
  d5_d(x, '−%18,6', w - 28, 574, 44, D5.pink, { a: 'right' });
}

/* ───────────── scenes ───────────── */
const D5_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık camlar',
    desc: 'Farklı derinliklerde süzülen cam uygulama kartları; uzaktakiler flu. Başlık camların arasından netleşir: hisse bir yerde, kripto başka yerde.',
    draw(g) {
      d5_bg(g, [[300, 180, 950, D5.lav, 0.6, 0.7], [1750, 260, 800, D5.pink, 0.36, 0.8], [420, 1050, 850, D5.teal, 0.28, 0.6], [1100, 620, 700, '#3B1FA8', 0.55, 0.8]], { seed: 11, bokeh: 46 });
      const far = [
        ['fund', { x: 860, y: 230, z: 1900, rx: 0.15, ry: -0.3, rz: 0.12 }, 4, 0.62],
        ['sheet', { x: 1330, y: 640, z: 1700, rx: -0.1, ry: -0.5, rz: -0.05 }, 4, 0.6],
        ['bank', { x: 640, y: 700, z: 1600, rx: 0.1, ry: 0.5, rz: 0.08 }, 3.5, 0.6],
        ['crypto', { x: 1180, y: 960, z: 1800, rx: -0.3, ry: 0.2, rz: -0.1 }, 4, 0.55],
        ['broker', { x: 150, y: 560, z: 1500, ry: 0.6, rz: -0.12 }, 3.5, 0.55],
        ['toastB', { x: 1760, y: 560, z: 1400, ry: -0.6, rz: 0.1 }, 3.5, 0.55],
      ];
      far.sort((a, b) => b[1].z - a[1].z).forEach(([k, pose, blur, a]) => { const [fn, w, h] = D5_APPS[k]; d5_softCard(g, fn, w, h, pose, blur, a, 24, 1.4); });
      d5_coinSoft(g, 1040, 860, 26, { col: 'teal', tilt: 0.55, rot: 0.5, mark: 'ring' }, 3, 0.6);
      const mid = [
        ['broker', { x: 380, y: 250, z: 200, rx: 0.1, ry: 0.42, rz: -0.07 }],
        ['crypto', { x: 1560, y: 255, z: 240, rx: 0.08, ry: -0.45, rz: 0.06 }],
        ['sheet', { x: 410, y: 840, z: 160, rx: -0.14, ry: 0.36, rz: 0.05 }],
        ['bank', { x: 1540, y: 860, z: 220, rx: -0.12, ry: -0.4, rz: -0.05 }],
        ['toastA', { x: 900, y: 160, z: -60, rx: 0.05, ry: 0.1, rz: -0.035 }],
        ['toastB', { x: 1050, y: 935, z: -40, ry: -0.12, rz: 0.03 }],
      ];
      mid.sort((a, b) => b[1].z - a[1].z).forEach(([k, pose]) => {
        d5_snap(g);
        const [fn, w, h] = D5_APPS[k];
        d5_card3(g, d5_tex(w, h, fn), pose, { r: k.startsWith('toast') ? 24 : 26, dark: 0.36 });
      });
      d5_coin(g, 790, 830, 30, { col: 'lav', tilt: 0.5, rot: -0.5, mark: 'hex' });
      d5_coin(g, 1255, 330, 24, { col: 'pink', tilt: 0.7, rot: 0.35, mark: 'tri' });
      // foreground, heavily defocused
      d5_softCard(g, D5_APPS.fund[0], 360, 230, { x: 420, y: 600, z: -780, ry: 0.3, rz: 0.12 }, 9, 0.85, 24, 2.4);
      d5_softCard(g, D5_APPS.crypto[0], 400, 290, { x: 1540, y: 470, z: -820, ry: -0.35, rz: -0.1 }, 10, 0.8, 24, 2.4);
      d5_coinSoft(g, 1720, 990, 70, { col: 'pearl', tilt: 0.45, rot: -0.3, mark: 'dia' }, 9, 0.75);
      // headline
      g.save(); g.translate(CX, 560); g.scale(1, 0.34);
      const vg = g.createRadialGradient(0, 0, 0, 0, 0, 1000);
      vg.addColorStop(0, 'rgba(12,6,34,0.8)'); vg.addColorStop(0.55, 'rgba(12,6,34,0.5)'); vg.addColorStop(1, 'rgba(12,6,34,0)');
      g.fillStyle = vg; g.fillRect(-1000, -1000, 2000, 2000); g.restore();
      d5_head(g, [['Hisse bir uygulamada.', D5.milk]], CX, 520, 72, { a: 'center' });
      d5_head(g, [['Kripto ', D5.milk], ['başka bir borsada.', 'holo']], CX, 616, 72, { a: 'center' });
      const s1 = 'Hesaplar ise bir tabloda:', w1 = d5_mw(g, s1, 30, D5M, 600), w2 = d5_mw(g, '#REF!', 24, D5M, 800) + 30;
      const x0 = CX - (w1 + 14 + w2) / 2;
      d5_t(g, s1, x0, 690, 30, D5.soft, { w: 600 });
      d5_tchip(g, x0 + w1 + 14, 680, '#REF!', { a: 'left', s: 20, c: D5.pink, fill: 'rgba(255,139,209,0.16)', stroke: hexA(D5.pink, 0.6) });
      d5_finish(g);
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek cam',
    desc: 'Kartlar ışık izleriyle merkeze akar ve tek bir büyük cam karta birleşir; yanardöner halka döner, Kripto724 belirir.',
    draw(g) {
      d5_bg(g, [[CX, 520, 1000, D5.lav, 0.62, 0.65], [260, 980, 750, D5.teal, 0.32, 0.7], [1700, 160, 750, D5.pink, 0.36, 0.7], [CX, 560, 430, '#B8A8FF', 0.32, 0.6]], { seed: 21, bokeh: 40 });
      // converging light streaks
      g.save(); g.globalCompositeOperation = 'lighter';
      const r = mulberry32(22);
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU, d0 = 760 + r() * 520, d1 = 430 + r() * 160, col = [D5.teal2, D5.pink2, D5.lav2][i % 3], pk = 0.22 + r() * 0.35;
        const x0 = CX + Math.cos(a) * d0, y0 = 545 + Math.sin(a) * d0 * 0.62, x1 = CX + Math.cos(a) * d1, y1 = 545 + Math.sin(a) * d1 * 0.62;
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, hexA(col, 0)); gr.addColorStop(0.75, hexA(col, pk)); gr.addColorStop(1, hexA(col, 0));
        g.strokeStyle = gr; g.lineWidth = 1 + r() * 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        addGlow(g, col, lerp(x0, x1, 0.75), lerp(y0, y1, 0.75), 10 + r() * 14, pk * 1.4);
      }
      g.restore();
      // ghost cards flying in (motion-blurred samples)
      [['broker', -640, -330, 0.14], ['crypto', 650, -320, -0.12], ['sheet', -700, 300, -0.1], ['bank', 700, 320, 0.1], ['fund', -60, -480, 0.06], ['toastA', 60, 500, -0.05]].forEach(([k, dx, dy, rot]) => {
        const [fn, w, h] = D5_APPS[k], S = d5_softTex(fn, w, h, 1.2);
        for (let j = 0; j < 5; j++) {
          const t = 0.36 + j * 0.065, q = 1 - t;
          d5_plane(g, S.c, S.w, S.h, { x: CX + dx * q * 1.5, y: 545 + dy * q * 1.45, z: 260 + t * 420, rz: rot * q * 2, ry: -dx / 700 * 0.6 * q, rx: dy / 400 * 0.35 * q, s: 0.9 }, { a: 0.07 + j * 0.09, nx: 4, ny: 3 });
        }
      });
      d5_ring(g, CX, 560, 860, 300, -0.08, Math.PI, TAU, 6);
      d5_snap(g);
      const T = d5_tex(1200, 620, d5_heroCard, 1.4);
      d5_card3(g, T, { x: CX, y: 545, z: 0, rx: 0.07, ry: 0, rz: 0 }, { r: 40, dark: 0.36, sheen: 0.2, shadow: 0.6 });
      d5_ring(g, CX, 560, 860, 300, -0.08, 0, Math.PI, 6);
      sparkle(g, 1560, 836, 16, D5.milk); addGlow(g, D5.teal2, 1560, 836, 60, 0.5);
      sparkle(g, 396, 300, 11, D5.milk); addGlow(g, D5.pink2, 396, 300, 50, 0.45);
      d5_finish(g);
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Cam pano',
    desc: 'Eğik cam pano derinlikten yaklaşır, değer sayacı döner; önde süzülen küçük cam kartlar günlük değişimi ve toplam getiriyi gösterir.',
    draw(g) {
      d5_bg(g, [[1150, 420, 1000, D5.lav, 0.55, 0.7], [250, 900, 700, D5.teal, 0.3], [1750, 120, 650, D5.pink, 0.32]], { seed: 31, bokeh: 34 });
      d5_coinSoft(g, 230, 250, 46, { col: 'lav', tilt: 0.5, rot: 0.4, mark: 'hex' }, 4, 0.6);
      const T = d5_tex(1500, 860, d5_dash, 1.4);
      d5_card3(g, T, { x: 1090, y: 470, z: 150, rx: 0.07, ry: -0.3, rz: 0.005 }, { r: 30, dark: 0.45, shadow: 0.65 });
      d5_snap(g);
      d5_card3(g, d5_tex(380, 210, d5_fcDay), { x: 400, y: 845, z: -300, rx: 0.06, ry: 0.32, rz: -0.035, s: 0.94 }, { r: 26, dark: 0.34 });
      d5_snap(g);
      d5_card3(g, d5_tex(380, 210, d5_fcTotal), { x: 1560, y: 250, z: -300, rx: 0.08, ry: -0.36, rz: 0.04 }, { r: 26, dark: 0.34 });
      d5_coin(g, 140, 560, 38, { col: 'teal', tilt: 0.55, rot: -0.3, mark: 'ring' });
      d5_snap(g);
      const cap = 'Portföyünün tamamı, bir bakışta.', fs = 32, tw = d5_mw(g, cap, fs, D5U, 600, -0.6);
      d5_card(g, CX - tw / 2 - 44, 960, tw + 88, 80, 40, { dark: 0.45 }, () => d5_d(g, cap, CX, 1012, fs, D5.milk, { a: 'center', w: 600, ls: -0.6 }));
      d5_finish(g);
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her piyasa',
    desc: 'Holografik küre cam bir projektörün üstünde döner; çevresinde 8 cam kapsül yörüngede süzülür, öndekiler parlar. Sayaçlar 60+ ve 50+ olur.',
    draw(g) {
      d5_bg(g, [[1290, 540, 900, D5.lav, 0.5, 0.8], [1700, 950, 600, D5.teal, 0.3], [180, 120, 700, D5.pink, 0.22]], { seed: 41, bokeh: 40 });
      const gx = 1260, gy = 520, R = 285, rot = -0.16, ORX = 560, ORY = 165, oy = gy + 34;
      const orb = th => [gx + ORX * Math.cos(th) * Math.cos(rot) - ORY * Math.sin(th) * Math.sin(rot), oy + ORX * Math.cos(th) * Math.sin(rot) + ORY * Math.sin(th) * Math.cos(rot)];
      // eight capsules; the back ones sit left and right of the globe so every label stays readable
      const items = [['ETF', 'etf', 25], ['Hisse senedi', 'stock', 66], ['Kripto', 'crypto', 114], ['Nakit', 'cash', 158], ['Tahvil', 'bond', 198], ['Gayrimenkul', 'house', 226], ['Opsiyon', 'option', 313], ['Yatırım fonu', 'fund', 341]]
        .map(([l, ic, deg]) => { const th = deg * Math.PI / 180, p = orb(th); return { l, ic, th, x: p[0], y: p[1], d: Math.sin(th) }; });
      d5_orbitLine(g, orb, Math.PI, TAU, 3, 0.8);
      items.filter(o => o.d < 0).sort((a, b) => a.d - b.d).forEach(o => { d5_snap(g); g.save(); g.globalAlpha = 0.8; d5_pill(g, o.x, o.y, o.l, o.ic, 0.8 + 0.1 * o.d, { dark: 0.5, sheen: 0.12, shadow: 0.3 }); g.restore(); });
      // hologram projector: glass puck under the globe and its light cone
      const by = gy + R + 100;
      g.save(); g.globalCompositeOperation = 'lighter';
      const cg = g.createLinearGradient(0, by, 0, gy - R * 0.2);
      cg.addColorStop(0, hexA(D5.teal2, 0.26)); cg.addColorStop(0.5, hexA(D5.lav2, 0.08)); cg.addColorStop(1, hexA(D5.lav2, 0));
      g.fillStyle = cg; g.beginPath(); g.moveTo(gx - 170, by); g.lineTo(gx - R * 1.05, gy - R * 0.2); g.lineTo(gx + R * 1.05, gy - R * 0.2); g.lineTo(gx + 170, by); g.closePath(); g.fill();
      g.restore();
      const side = g.createLinearGradient(gx - 230, 0, gx + 230, 0);
      side.addColorStop(0, 'rgba(70,52,180,0.7)'); side.addColorStop(0.45, 'rgba(178,165,255,0.75)'); side.addColorStop(1, 'rgba(60,44,160,0.7)');
      g.fillStyle = side; g.beginPath(); g.ellipse(gx, by + 22, 230, 50, 0, 0, Math.PI); g.lineTo(gx - 230, by); g.ellipse(gx, by, 230, 50, 0, Math.PI, 0, true); g.closePath(); g.fill();
      d5_snap(g);
      const tp = () => { g.beginPath(); g.ellipse(gx, by, 230, 50, 0, 0, TAU); };
      d5_body(g, tp, [gx - 230, by - 50, gx + 230, by + 50], { dark: 0.35, sheen: 0.25, shadow: 0, rim: 5 });
      d5_edge(g, tp, [gx - 230, by - 50, gx + 230, by + 50], { lw: 2 });
      d5_ring(g, gx, by, 150, 32, 0, 0, TAU, 2.5, 0.9);
      addGlow(g, D5.teal2, gx, by, 160, 0.5);
      d5_snap(g);
      d5_globe(g, gx, gy, R, -0.35, 0.38);
      d5_orbitLine(g, orb, 0, Math.PI, 3.5, 1);
      const front = items.filter(o => o.d >= 0).sort((a, b) => a.d - b.d);
      front.forEach(o => {
        // light trail along the orbit, behind the pill
        const n = 30, pts = [];
        for (let k = 0; k <= n; k++) pts.push(orb(o.th - 0.55 * (1 - k / n)));
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
        for (let k = 1; k <= n; k++) { g.strokeStyle = hexA(D5.milk, 0.5 * k / n); g.lineWidth = 2 + 10 * k / n; g.beginPath(); g.moveTo(pts[k - 1][0], pts[k - 1][1]); g.lineTo(pts[k][0], pts[k][1]); g.stroke(); }
        g.restore();
      });
      front.forEach(o => { d5_snap(g); d5_pill(g, o.x, o.y, o.l, o.ic, 0.9 + 0.16 * o.d); });
      // copy
      d5_k(g, '8 VARLIK SINIFI', 116, 236, 20, D5.teal2);
      d5_head(g, [['Her varlık.', D5.milk]], 110, 336, 82);
      d5_head(g, [['Her piyasa.', 'holo']], 110, 434, 82);
      d5_snap(g);
      [[110, '60+', 'PİYASA'], [390, '50+', 'PARA BİRİMİ']].forEach(([x, n, l]) => {
        d5_card(g, x, 506, 262, 172, 30, { dark: 0.34 }, () => {
          d5_head(g, [[n, 'holo']], x + 26, 608, 74, { glow: 0.3 });
          d5_k(g, l, x + 30, 652, 16, D5.soft);
        });
      });
      d5_t(g, 'Her işlem, kendi tarihindeki', 114, 742, 23, D5.soft, { w: 600 });
      d5_t(g, 'kurla çevrilir.', 114, 774, 23, D5.soft, { w: 600 });
      d5_finish(g);
    },
  },
  {
    time: '17–21 sn', title: 'Otomatik senkron',
    desc: 'Aracı kurum camları 3B bir halkada döner; her birinden merkezdeki cam çekirdeğe ışık hüzmeleri akar. Salt-okunur, her gece güncel.',
    draw(g) {
      d5_bg(g, [[CX, 600, 950, D5.lav, 0.52, 0.6], [260, 300, 600, D5.teal, 0.26], [1650, 870, 650, D5.pink, 0.28]], { seed: 51, bokeh: 34 });
      const hub = [CX, 560], N = D5_BROKERS.length, R = 760, TW = 350, TH = 104;
      // floor rings
      for (let k = 0; k < 4; k++) d5_ring(g, CX, 690, 330 + k * 190, (330 + k * 190) * 0.24, 0, 0, TAU, 2.2 - k * 0.35, 0.5 - k * 0.09);
      const tiles = D5_BROKERS.map((name, i) => {
        // ten tiles over 300° of the ring, leaving the arc straight behind the hub empty
        const th = (210 + i * 300 / (N - 1)) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
        const pose = { x: CX + R * s, y: 610 + 215 * c, z: 260 - 560 * c, rx: 0.06, ry: -s * 0.55, rz: 0 };
        const P = projector(pose);
        const cand = [P(0, -TH / 2), P(0, TH / 2), P(-TW / 2, 0), P(TW / 2, 0)];
        const st = cand.reduce((m, p) => Math.hypot(p[0] - hub[0], p[1] - hub[1]) < Math.hypot(m[0] - hub[0], m[1] - hub[1]) ? p : m);
        return { name, c, s, pose, st, z: pose.z };
      });
      tiles.filter(t => t.c < 0).sort((a, b) => b.z - a.z).forEach(t => d5_softCard(g, (x, w, h) => d5_tile(x, w, h, t.name), TW, TH, t.pose, 1.6, 0.7, 22));
      // beams
      tiles.forEach((t, i) => {
        const [x0, y0] = t.st, [x1, y1] = hub, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 90;
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, hexA(D5.teal2, 0.9)); gr.addColorStop(1, hexA(D5.lav2, 0.25));
        const depth = t.c < 0 ? 0.55 : 1;
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = gr; g.lineCap = 'round';
        [[9, 0.12], [3.5, 0.35], [1.6, 0.9]].forEach(([w, a]) => { g.globalAlpha = a * depth; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); });
        g.restore();
        [0.32 + (i % 3) * 0.12, 0.72].forEach(u => {
          const qx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, qy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
          addGlow(g, D5.teal2, qx, qy, 26, 0.8 * depth); g.fillStyle = D5.milk; g.beginPath(); g.arc(qx, qy, 2.6, 0, TAU); g.fill();
        });
      });
      d5_snap(g);
      addGlow(g, D5.lav, hub[0], hub[1], 420, 0.5);
      d5_card3(g, d5_tex(320, 310, d5_hubTex), { x: hub[0], y: hub[1], z: 40, rx: 0.1 }, { r: 40, dark: 0.4, sheen: 0.22 });
      d5_ring(g, hub[0], hub[1] + 6, 230, 230, 0, -0.2, TAU - 0.2, 2.2, 0.55);
      tiles.filter(t => t.c >= 0).sort((a, b) => b.z - a.z).forEach(t => { d5_snap(g); d5_card3(g, d5_tex(TW, TH, (x, w, h) => d5_tile(x, w, h, t.name)), t.pose, { r: 24, dark: 0.36 }); });
      d5_head(g, [['25+ aracı kurumla', D5.milk]], 110, 150, 60);
      d5_head(g, [['otomatik senkron.', 'holo']], 110, 228, 60);
      d5_snap(g);
      d5_card(g, 1470, 88, 340, 136, 28, { dark: 0.38 }, () => {
        g.fillStyle = 'rgba(178,165,255,0.2)'; g.beginPath(); g.arc(1522, 156, 28, 0, TAU); g.fill();
        d5_icon(g, 'moon', 1522, 156, 28, D5.lav2);
        d5_k(g, 'SON SENKRON', 1568, 134, 14, D5.soft);
        d5_d(g, 'Bu gece 03:00', 1566, 172, 26, D5.milk, { w: 600 });
        d5_t(g, 'Her gece otomatik', 1568, 202, 16, D5.teal2, { w: 700 });
      });
      const chips = [['Salt-okunur bağlantı', 'lock'], ['Her gece güncellenir', 'moon'], ['CSV ve yapay zekâ ile içe aktarma', 'spark']];
      const s = 0.8, ms = chips.map(([l]) => d5_pillM(g, l, s)), tot = ms.reduce((a, m) => a + m.w, 0) + 22 * (chips.length - 1);
      let px = CX - tot / 2;
      chips.forEach(([l, ic], i) => { d5_snap(g); d5_pill(g, px + ms[i].w / 2, 1010, l, ic, s, { outline: true }); px += ms[i].w + 22; });
      d5_finish(g);
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takibi',
    desc: 'Saydam prizma çubuklar sırayla yükselir; jetonlar ışık iziyle düşüp çubuklara oturur. Tahmini gelir ve maliyete göre getiri sayılır.',
    draw(g) {
      d5_bg(g, [[1250, 560, 920, D5.lav, 0.5, 0.7], [1650, 980, 650, D5.teal, 0.32], [220, 160, 700, D5.pink, 0.26]], { seed: 61, bokeh: 34 });
      const pose = { x: 1250, y: 640, z: 260, rx: 0.4, ry: -0.5, rz: 0 }, P = projector(pose);
      const vals = [420, 236, 906, 446, 263, 945, 473, 276, 998, 512, 302, 1063], paid = 9, base = 150, sp = 92, bw = 50;
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const bars = vals.map((v, i) => { const u0 = -sp * 5.5 + i * sp - bw / 2; return { i, b: [u0, u0 + bw, base, base - v / 1063 * 360, -bw / 2, bw / 2], z: P(u0 + bw / 2, base, 0)[2] }; });
      // floor slab
      const slab = [-sp * 6.2, sp * 6.2, base, base + 18, -100, 100];
      d5_prism(g, P, slab, { back: 'rgba(178,165,255,0.05)', f: 'rgba(178,165,255,0.16)', s: 'rgba(110,91,255,0.2)', t: (gg, y0, y1) => { const gr = gg.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(245,243,255,0.06)'); gr.addColorStop(1, 'rgba(245,243,255,0.16)'); return gr; }, edge: 'rgba(220,212,255,0.45)', lw: 1.2 });
      // reflections on the slab
      const top = [P(slab[0], base, -100), P(slab[1], base, -100), P(slab[1], base, 100), P(slab[0], base, 100)];
      g.save(); d5_poly(g, top); g.clip(); g.globalAlpha = 0.22;
      bars.forEach(({ i, b }) => d5_prism(g, P, [b[0], b[1], base, base + (base - b[3]) * 0.5, b[4], b[5]], { f: i < paid ? 'rgba(142,241,231,0.5)' : 'rgba(255,196,231,0.35)', s: 'rgba(178,165,255,0.3)' }));
      g.restore();
      // bars, far to near
      bars.sort((a, b) => b.z - a.z).forEach(({ i, b }) => {
        const pd = i < paid;
        const st = pd ? {
          back: 'rgba(25,211,197,0.1)', edge: 'rgba(230,255,252,0.7)', lw: 1.4,
          f: (gg, y0, y1) => { const gr = gg.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(142,241,231,0.62)'); gr.addColorStop(1, 'rgba(25,211,197,0.14)'); return gr; },
          s: (gg, y0, y1) => { const gr = gg.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(178,165,255,0.5)'); gr.addColorStop(1, 'rgba(110,91,255,0.12)'); return gr; },
          t: 'rgba(214,255,251,0.85)',
        } : {
          back: 'rgba(255,139,209,0.05)', edge: 'rgba(255,196,231,0.85)', lw: 1.4, dash: [5, 4],
          f: (gg, y0, y1) => { const gr = gg.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,196,231,0.26)'); gr.addColorStop(1, 'rgba(255,139,209,0.04)'); return gr; },
          s: 'rgba(255,139,209,0.1)', t: 'rgba(255,196,231,0.32)',
        };
        d5_prism(g, P, b, st);
        const tp = P((b[0] + b[1]) / 2, b[3], 0);
        addGlow(g, pd ? D5.teal2 : D5.pink2, tp[0], tp[1], pd ? 46 : 30, pd ? 0.45 : 0.25);
      });
      // month labels
      bars.forEach(({ i, b }) => {
        const p = P((b[0] + b[1]) / 2, base + 18, -132), k = FOCAL / p[2];
        d5_t(g, months[i], p[0], p[1] + 6, 17 * k, i < paid ? D5.soft : D5.pink2, { w: 700, a: 'center' });
      });
      // forecast bracket floating over the three projected months
      const bk = [9, 10, 11].map(i => bars.find(o => o.i === i).b), vtop = Math.min(...bk.map(b => b[3])) - 40;
      const fa = P(bk[0][0] - 6, vtop, 0), fb = P(bk[2][1] + 6, vtop, 0), fa2 = P(bk[0][0] - 6, vtop + 22, 0), fb2 = P(bk[2][1] + 6, vtop + 22, 0);
      g.save(); g.setLineDash([8, 6]); g.strokeStyle = D5.pink2; g.lineWidth = 2.6; g.lineCap = 'round'; g.shadowColor = D5.pink; g.shadowBlur = 10;
      g.beginPath(); g.moveTo(fa2[0], fa2[1]); g.lineTo(fa[0], fa[1]); g.lineTo(fb[0], fb[1]); g.lineTo(fb2[0], fb2[1]); g.stroke(); g.restore();
      d5_tchip(g, (fa[0] + fb[0]) / 2, (fa[1] + fb[1]) / 2 - 28, 'Tahmin', { s: 17, c: D5.deep, fill: D5.pink2, stroke: false });
      // coins dropping into September
      const b8 = bars.find(o => o.i === 8).b, land = P((b8[0] + b8[1]) / 2, b8[3], 0);
      [[land[0] - 4, land[1] - 44, 0.6, 1], [land[0] + 26, land[1] - 220, 0.5, 0.95], [land[0] - 34, land[1] - 380, 0.42, 0.85]].forEach(([x, y, tilt, a], j) => {
        if (j > 0) {
          const gr = g.createLinearGradient(x, y - 190, x, y);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, `rgba(214,255,251,${0.42 * a})`);
          g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - 95, 19, 100, 0, 0, TAU); g.fill(); g.restore();
          d5_coin(g, x, y - 40, 34, { col: 'teal', tilt, rot: 0.25 * j, mark: 'tl', a: 0.22, glow: 0 });
        }
        d5_coin(g, x, y, 40, { col: 'teal', tilt, rot: -0.2 + 0.3 * j, mark: 'tl', a });
      });
      d5_ring(g, land[0], land[1] + 4, 52, 15, 0, 0, TAU, 2.4, 0.9);
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.36, rr2 = 46 + (k % 3) * 12; g.fillStyle = hexA(D5.teal2, 0.85); g.beginPath(); g.arc(land[0] + Math.cos(a) * rr2, land[1] + 6 + Math.sin(a) * rr2 * 0.55, 2.6, 0, TAU); g.fill(); }
      g.restore();
      // tooltip
      d5_snap(g);
      const tx = land[0] - 380, ty = land[1] - 196;
      d5_card(g, tx, ty, 300, 112, 24, { dark: 0.38 }, () => {
        d5_k(g, 'EYLÜL · ALINDI', tx + 24, ty + 40, 14, D5.soft);
        d5_d(g, '+₺24.850', tx + 22, ty + 88, 36, D5.teal2, { w: 800 });
      });
      g.save(); g.strokeStyle = 'rgba(245,243,255,0.4)'; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(tx + 300, ty + 56); g.lineTo(land[0] - 30, land[1] - 40); g.stroke(); g.restore();
      // copy
      d5_k(g, 'TEMETTÜ', 116, 170, 20, D5.teal2);
      d5_head(g, [['Hiçbir', D5.milk]], 110, 262, 78);
      d5_head(g, [['temettüyü', D5.milk]], 110, 352, 78);
      d5_head(g, [['kaçırma.', 'holo']], 110, 442, 78);
      d5_snap(g);
      [[530, 'YILLIK TAHMİNİ GELİR', '₺218.400', D5.milk, 'calendar'], [706, 'MALİYETE GÖRE GETİRİ', '%4,1', D5.teal2, 'stock']].forEach(([y, l, v, col, ic]) => {
        d5_card(g, 110, y, 500, 150, 30, { dark: 0.36 }, () => {
          d5_k(g, l, 140, y + 48, 15, D5.soft);
          d5_d(g, v, 136, y + 118, 56, col);
          g.fillStyle = 'rgba(245,243,255,0.08)'; g.beginPath(); g.arc(548, y + 75, 32, 0, TAU); g.fill();
          d5_icon(g, ic, 548, y + 75, 30, D5.lav2, 2.8);
        });
      });
      d5_t(g, 'Takvim · alınan ödemeler · tahmin', 114, 920, 24, D5.soft, { w: 600 });
      d5_finish(g);
    },
  },
  {
    time: '25–31 sn', title: 'Risk laboratuvarı',
    desc: '1.000 senaryo yanardöner ışık iplikleri olarak cam panelde açılır; %5–%95 bandı kilitlenir, risk çipleri farklı derinliklerden süzülür.',
    draw(g) {
      d5_bg(g, [[780, 600, 950, D5.lav, 0.5, 0.7], [1700, 320, 650, D5.teal, 0.28], [1500, 1000, 650, D5.pink, 0.3]], { seed: 71, bokeh: 34 });
      const TW = 1240, THh = 720, pose = { x: 770, y: 620, z: 90, rx: 0.06, ry: 0.2, rz: -0.01 };
      const P = projector(pose), path = () => d5_ppath(g, P, TW, THh, 34), bx = d5_pbox(P, TW, THh);
      d5_body(g, path, bx, { dark: 0.46, shadow: 0.6 });
      d5_plane(g, d5_tex(TW, THh, d5_mcThreads, 1.25).c, TW, THh, pose, { op: 'lighter' });
      d5_plane(g, d5_tex(TW, THh, d5_mcUI, 1.4).c, TW, THh, pose);
      d5_edge(g, path, bx);
      [['SHARPE ORANI', '1,24', D5.teal2, 0.62], ['BETA', '0,92', D5.milk, 0.46], ['VaR (%95)', '−%2,1', D5.pink, 0.24], ['MAKS. DÜŞÜŞ', '−%18,6', D5.pink, 0.4]].forEach(([l, v, col, f], i) => {
        d5_snap(g);
        d5_card3(g, d5_tex(330, 132, (x, w, h) => d5_chipTex(x, w, h, l, v, col, f)), { x: 1630 + [0, 30, -10, 20][i], y: 330 + i * 168, z: [-90, 30, -150, -20][i], rx: 0.05, ry: -0.3, rz: [0.03, -0.02, 0.025, -0.03][i] }, { r: 26, dark: 0.36 });
      });
      d5_head(g, [['1.000 ', 'holo'], ['olası gelecek.', D5.milk]], 110, 165, 70);
      d5_t(g, 'Portföyünün 10 yıllık olasılık bandı, tek panelde.', 114, 222, 26, D5.soft, { w: 600 });
      d5_finish(g);
    },
  },
  {
    time: '31–35 sn', title: 'Hızlı özellikler',
    desc: 'Dört cam kart iskambil eli gibi yelpazelenir; her vuruşta biri öne çıkar: kıyasla, vergi raporu, yapay zekâ ile içe aktar, kriz testi.',
    draw(g) {
      d5_bg(g, [[CX, 620, 1000, D5.lav, 0.55, 0.6], [200, 900, 600, D5.teal, 0.28], [1750, 850, 600, D5.pink, 0.3]], { seed: 81, bokeh: 36 });
      d5_k(g, 'HIZLI ÖZELLİKLER', CX, 104, 20, D5.teal2, { a: 'center' });
      d5_head(g, [['Daha fazlası, ', D5.milk], ['aynı yerde.', 'holo']], CX, 182, 58, { a: 'center' });
      const fns = [d5_fan1, d5_fan2, d5_fan3, d5_fan4], ang = [-0.262, -0.088, 0.088, 0.262], L = 2560, py = 3140;
      const cards = fns.map((fn, i) => {
        const a = ang[i], hi = i === 2;
        return { fn, i, pose: { x: CX + Math.sin(a) * L, y: py - Math.cos(a) * L + (hi ? -24 : 0), z: (Math.abs(a) > 0.1 ? 50 : -20) + (hi ? -90 : 0), rx: 0.05, ry: -a * 0.7, rz: a }, hi };
      });
      cards.sort((a, b) => b.pose.z - a.pose.z).forEach(c => {
        d5_snap(g);
        if (c.hi) { const p = projector(c.pose)(0, 0); addGlow(g, D5.teal, p[0], p[1], 480, 0.35); }
        d5_card3(g, d5_tex(420, 620, c.fn, 1.5), c.pose, { r: 34, dark: 0.4, shadow: 0.6, lw: c.hi ? 2.4 : 1.6 });
      });
      [0, 1, 2, 3].forEach(i => { g.fillStyle = i === 2 ? D5.teal2 : 'rgba(245,243,255,0.3)'; rr(g, CX - 78 + i * 40 + (i === 2 ? -6 : 0), 1032, i === 2 ? 36 : 24, 8, 4); g.fill(); });
      d5_finish(g);
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış',
    desc: 'Tüm ışık cam merceğe toplanır; logo ve wordmark parlar, yanardöner düğme belirir ve adres yumuşakça netleşir.',
    draw(g) {
      d5_bg(g, [[CX, 330, 820, D5.lav, 0.62, 0.8], [380, 920, 700, D5.teal, 0.26], [1560, 900, 700, D5.pink, 0.3]], { seed: 91, bokeh: 44 });
      const lx = CX, ly = 286, LR = 120;
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + 0.15, col = [D5.lav2, D5.teal2, D5.pink2][i % 3];
        const gr = g.createRadialGradient(lx, ly, LR * 0.8, lx, ly, 640); gr.addColorStop(0, hexA(col, 0.12)); gr.addColorStop(1, hexA(col, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly); g.arc(lx, ly, 720, a - 0.035, a + 0.035); g.closePath(); g.fill();
      }
      g.restore();
      d5_coinSoft(g, 560, 230, 40, { col: 'teal', tilt: 0.55, rot: 0.5, mark: 'ring' }, 4, 0.7);
      d5_coinSoft(g, 1560, 470, 24, { col: 'pink', tilt: 0.6, rot: -0.4, mark: 'tri' }, 3, 0.6);
      d5_ring(g, lx, ly + 10, 330, 92, -0.12, Math.PI, TAU, 3.5, 0.9);
      d5_snap(g);
      const path = () => { g.beginPath(); g.arc(lx, ly, LR, 0, TAU); }, bx = [lx - LR, ly - LR, lx + LR, ly + LR];
      d5_body(g, path, bx, { dark: 0.3, rim: 12, sheen: 0.22 });
      drawMark(g, lx, ly, 64, { glow: 0.8, disc: false, col: D5.teal, col2: D5.pink, arrow: D5.teal2 });
      d5_edge(g, path, bx, { lw: 2.4 });
      d5_ring(g, lx, ly + 10, 330, 92, -0.12, 0, Math.PI, 3.5, 0.9);
      d5_coin(g, 1400, 214, 50, { col: 'lav', tilt: 0.5, rot: -0.4, mark: 'hex' });
      d5_coin(g, 470, 470, 30, { col: 'pink', tilt: 0.62, rot: 0.3, mark: 'dia' });
      g.save(); g.shadowColor = hexA(D5.lav, 0.8); g.shadowBlur = 40;
      wordmark(g, CX, 560, 112, null, { sweep: 0.66, sweepA: 0.55, f: D5U, w: 800, grad: [[0, '#8EF1E7'], [1, '#FFC4E7']] });
      g.restore();
      d5_t(g, 'Tüm yatırımların, tek ekranda.', CX, 628, 36, D5.soft, { a: 'center', w: 600 });
      // holographic pill button
      const bw = 900, bh = 100, bxx = CX - bw / 2, byy = 690;
      addGlow(g, D5.lav, CX, byy + bh / 2, 560, 0.4);
      g.save(); g.shadowColor = hexA(D5.lav, 0.7); g.shadowBlur = 50; g.shadowOffsetY = 14;
      rr(g, bxx, byy, bw, bh, bh / 2); g.fillStyle = d5_holo(g, bxx, byy, bxx + bw, byy + bh, 1, [[0, '#C9BEFF'], [0.45, '#9FF3EA'], [1, '#FFC4E7']]); g.fill(); g.restore();
      g.save(); rr(g, bxx, byy, bw, bh, bh / 2); g.clip();
      const sh = g.createLinearGradient(0, byy, 0, byy + bh); sh.addColorStop(0, 'rgba(255,255,255,0.55)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.05)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(bxx, byy, bw, bh * 0.55);
      g.restore();
      rr(g, bxx, byy, bw, bh, bh / 2); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.stroke();
      d5_t(g, 'Ücretsiz başla — kredi kartı gerekmez', bxx + 56, byy + 63, 34, D5.deep, { w: 800 });
      g.fillStyle = D5.deep; g.beginPath(); g.arc(bxx + bw - 52, byy + bh / 2, 34, 0, TAU); g.fill();
      d5_arrow(g, bxx + bw - 66, byy + bh / 2, bxx + bw - 38, byy + bh / 2, D5.milk, 4, 11);
      d5_head(g, [['kripto724.com', 'holo']], CX, 900, 52, { a: 'center', w: 600, glow: 0.45 });
      d5_t(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', CX, 1034, 22, D5.dim, { a: 'center', w: 500 });
      d5_finish(g, 0.5);
    },
  },
];

function d5_paper(g, bw, bh) {
  g.save(); g.globalCompositeOperation = 'screen';
  d5_blob(g, 200, 120, 1500, D5.lav, 0.3, 0.5);
  d5_blob(g, 3100, 260, 1200, D5.teal, 0.12, 0.55);
  d5_blob(g, 1700, 2900, 1900, D5.pink, 0.1, 0.4);
  d5_blob(g, 500, 2300, 1200, D5.lav, 0.12, 0.6);
  g.restore();
}

window.DESIGN = {
  id: 5, name: 'Cam & Hologram',
  concept: 'Derin mor bir boşlukta, farklı derinliklerde süzülen buzlu cam kartlar: yanardöner ışık kırılmaları, bokeh ve gerçek perspektif. Premium bir fintech uygulamasının sakin, güven veren ve fütüristik dili; her kare bir uygulama mağazası vitrini gibi.',
  board: { bg: '#130C30', ink: '#F5F3FF', soft: '#B3AAD8', accent: '#19D3C5', line: 'rgba(245,243,255,0.16)', display: { f: D5U, w: 800, ls: -3 }, text: { f: D5M, w: 500 }, badge: '#19D3C5', badgeInk: '#120B2E', paper: d5_paper },
  palette: [['#120B2E', 'Derin mor'], ['#6E5BFF', 'Lavanta'], ['#19D3C5', 'Turkuaz'], ['#FF8BD1', 'Pembe'], ['#F5F3FF', 'Süt beyazı']],
  fonts: ['Unbounded 800', 'Manrope'],
  motion: ['Derinlikte süzülen cam kartlar', 'Yanardöner ışık kırılması', 'Yumuşak parallax ve bokeh'],
  music: 'chill elektronik / future garage, 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d5_init,
  scenes: D5_SCENES,
};
