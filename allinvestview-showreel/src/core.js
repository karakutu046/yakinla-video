'use strict';
/* AllInvestView — 42 s motion graphics showreel (16:9, 1920×1080, 30 fps)
 *
 * Every frame is a pure function of time: draw(g, t). Randomness is seeded and
 * generated once at start-up, so the same t always gives the same picture.
 * renderFrame(f) draws each frame several times across a 180° shutter and
 * averages them: real motion blur.
 *
 * This file: constants, easing, colour, text, sprites, UI primitives and the
 * 2D-canvas perspective warp (plane3d) used for the tilted UI shots.
 */

const W = 1920, H = 1080, FPS = 30, DUR = 42;
const CX = W / 2, CY = H / 2;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5;
const TAU = Math.PI * 2;

const C = {
  ink: '#EEF3FF', soft: '#9AABCF', dim: '#5F7099', faint: '#3A4A70',
  mint: '#2EF2A6', cyan: '#38C8FF', blue: '#3D7BFF', violet: '#8B5CF6', pink: '#F472B6',
  amber: '#FFB547', red: '#FF5A6E', gold: '#FFCB57',
  panel: '#0D1730', panel2: '#111D3A', panelHi: '#16244A', line: 'rgba(150,180,240,0.13)',
};
// allocation / brand-mark palette: blue → cyan → mint → amber → pink → violet
const SEG = [C.blue, C.cyan, C.mint, C.amber, C.pink, C.violet];

/* ───────────────────────── maths & easing ───────────────────────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  inQuad: x => x * x,
  outQuad: x => 1 - (1 - x) * (1 - x),
  inCubic: x => x * x * x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outQuart: x => 1 - Math.pow(1 - x, 4),
  inQuart: x => x * x * x * x,
  inOutQuart: x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: x => { const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  inBack: x => { const s = 1.7; return (s + 1) * x * x * x - s * x * x; },
};
// damped spring: 0 → 1 with overshoot, dt seconds after start
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
// one-off decaying kick: 0 before, jumps to 1 and fades
const kick = (dt, d = 10) => dt <= 0 ? 0 : Math.exp(-d * dt);
// fade in over [a, a+fi], hold, fade out over [b-fo, b]
const window01 = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b));

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }

/* ───────────────────────── colour ───────────────────────── */
const RGB = {};
const hex2rgb = h => RGB[h] || (RGB[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hexA = (h, a) => rgb(hex2rgb(h), a);
const mixHex = (a, b, t) => rgb(mix(hex2rgb(a), hex2rgb(b), t));
// colour ramp through a list of hex stops, x in 0..1
function ramp(stops, x) {
  x = clamp(x) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mix(hex2rgb(stops[i]), hex2rgb(stops[i + 1]), x - i);
}

/* ───────────────────────── text ───────────────────────── */
function setFont(g, o) {
  g.font = `${o.w || 900} ${o.s}px ${o.f || 'Disp'}`;
  g.letterSpacing = (o.ls || 0) + 'px';
}
function text(g, s, x, y, o) {
  setFont(g, o);
  g.textAlign = o.a || 'center'; g.textBaseline = o.b || 'alphabetic';
  g.fillStyle = o.c || C.ink;
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
}
function measure(g, s, o) { setFont(g, o); const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; }
function fit(g, s, o, maxW) { const w = measure(g, s, o); return w > maxW ? { ...o, s: o.s * maxW / w } : o; }

/* Letter-by-letter text. fn(i, n, ch) → {dx, dy, sc, rot, al, c}.
 * o.grad = [[pos, hex], ...] paints a gradient continuous across the whole string,
 * o.colors = per-character colours (array or function), o.sweep = 0..1 light band position. */
function letters(g, s, x, y, o, fn) {
  setFont(g, o);
  g.textAlign = 'left'; g.textBaseline = o.b || 'alphabetic';
  const total = g.measureText(s).width;
  const x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  const n = s.length;
  let off = 0;
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    const cw = g.measureText(ch).width;
    const adv = g.measureText(s.slice(0, i + 1)).width;
    if (ch !== ' ') {
      const r = fn ? fn(i, n, ch) || {} : {};
      const al = r.al == null ? 1 : r.al;
      if (al > 0.002) {
        const px = x0 + off + cw / 2 + (r.dx || 0), py = y + (r.dy || 0);
        const sc = r.sc == null ? 1 : r.sc;
        g.save();
        g.globalAlpha *= al;
        g.translate(px, py);
        if (r.rot) g.rotate(r.rot);
        if (sc !== 1) g.scale(sc, sc);
        let fill = r.c || (o.colors ? (typeof o.colors === 'function' ? o.colors(i, ch) : o.colors[i]) : null) || o.c || C.ink;
        if (!r.c && o.grad && (!o.gradFrom || i >= o.gradFrom)) {
          const gx0 = (o.gradX0 != null ? o.gradX0 : x0) - px, gx1 = (o.gradX1 != null ? o.gradX1 : x0 + total) - px;
          const gr = g.createLinearGradient(gx0 / sc, 0, gx1 / sc, 0);
          for (const [p, c] of o.grad) gr.addColorStop(p, c);
          fill = gr;
        }
        g.fillStyle = fill;
        g.fillText(ch, -cw / 2, 0);
        if (o.sweep != null && o.sweep > -0.5 && o.sweep < 1.5) {
          const bx = lerp((o.sweepX0 != null ? o.sweepX0 : x0) - 300, (o.sweepX1 != null ? o.sweepX1 : x0 + total) + 300, o.sweep) - px;
          const gr = g.createLinearGradient((bx - 160) / sc, -o.s * 0.3, (bx + 160) / sc, o.s * 0.3);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${o.sweepA || 0.85})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillText(ch, -cw / 2, 0);
        }
        g.restore();
      }
    }
    off = adv;
  }
  g.letterSpacing = '0px';
  return total;
}
// Text rising out of a masked slot (p: 0→1 in, q: 0→1 out)
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.035) {
  if (p <= 0 || q >= 1) return 0;
  g.save();
  g.beginPath(); g.rect(-200, y - o.s * 1.08, W + 400, o.s * 1.42); g.clip();
  const w = letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.25 };
  });
  g.restore();
  return w;
}
// Small upper-case label with a coloured tick, e.g. "RISK LAB"
function kicker(g, s, x, y, col, p, q = 0) {
  if (p <= 0 || q >= 1) return;
  const a = E.outCubic(p) * (1 - q);
  g.save(); g.globalAlpha *= a;
  const w = 46 * E.outExpo(p);
  g.fillStyle = col; g.fillRect(x, y - 13, w, 4);
  text(g, s, x + 62 + (1 - E.outCubic(p)) * 30, y, { s: 24, w: 700, f: 'Txt', ls: 5, a: 'left', c: col });
  g.restore();
}

/* ───────────────────────── sprites ───────────────────────── */
const SPR = {};
function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function makeGlow(c3) {
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, rgb(c3, 1)); gr.addColorStop(0.2, rgb(c3, 0.5));
  gr.addColorStop(0.5, rgb(c3, 0.13)); gr.addColorStop(1, rgb(c3, 0));
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return c;
}
function glowSpr(hex) { return SPR['g' + hex] || (SPR['g' + hex] = makeGlow(hex2rgb(hex))); }
function glow(g, hex, x, y, r, a = 1) {
  if (a <= 0.003 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * Math.min(1, a);
  g.drawImage(glowSpr(hex), x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = ga;
}
function addGlow(g, hex, x, y, r, a = 1) {
  const op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter';
  glow(g, hex, x, y, r, a); g.globalCompositeOperation = op;
}

/* ───────────────────────── UI primitives ───────────────────────── */
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// glass panel
function glass(g, x, y, w, h, r = 22, o = {}) {
  g.save();
  rr(g, x, y, w, h, r);
  g.fillStyle = o.fill || 'rgba(14,24,50,0.86)'; g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, `rgba(255,255,255,${o.sheen == null ? 0.055 : o.sheen})`); gr.addColorStop(0.45, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fill();
  g.lineWidth = o.lw || 1.5; g.strokeStyle = o.stroke || 'rgba(160,190,255,0.17)'; g.stroke();
  g.restore();
}
// pill / chip, (x, y) = left middle. Returns width.
function pill(g, x, y, label, o = {}) {
  const s = o.s || 26, h = o.h || s * 2.1, padX = o.padX || s * 0.95;
  const font = { s, w: o.w || 600, f: 'Txt', a: 'left', b: 'middle', c: o.c || C.ink };
  const dot = o.dot ? s * 0.9 : 0;
  const tw = measure(g, label, font);
  const w = o.width || (padX * 2 + tw + dot);
  const ax = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  rr(g, ax, y - h / 2, w, h, h / 2);
  g.fillStyle = o.fill || 'rgba(20,32,64,0.92)'; g.fill();
  if (o.stroke !== false) { g.lineWidth = o.lw || 1.5; g.strokeStyle = o.stroke || 'rgba(160,190,255,0.22)'; g.stroke(); }
  if (o.dot) { g.fillStyle = o.dot; g.beginPath(); g.arc(ax + padX + s * 0.22, y, s * 0.24, 0, TAU); g.fill(); }
  text(g, label, ax + (o.width && o.a === 'center' ? (w - tw - dot) / 2 : padX) + dot, y + 1, font);
  return w;
}
function shadow(g, x, y, w, h, r, a = 0.5, blur = 40) {
  g.save(); g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = blur * 0.4;
  rr(g, x, y, w, h, r); g.fillStyle = 'rgba(8,14,30,1)'; g.fill(); g.restore();
}
function check(g, x, y, s, col, lw, p = 1) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  const a = [x - s * 0.5, y], b = [x - s * 0.12, y + s * 0.38], c = [x + s * 0.55, y - s * 0.42];
  const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
  const d = p * (l1 + l2);
  g.beginPath(); g.moveTo(...a);
  if (d <= l1) g.lineTo(lerp(a[0], b[0], d / l1), lerp(a[1], b[1], d / l1));
  else { g.lineTo(...b); g.lineTo(lerp(b[0], c[0], (d - l1) / l2), lerp(b[1], c[1], (d - l1) / l2)); }
  g.stroke(); g.restore();
}
// four-point sparkle
function sparkle(g, x, y, r, col) {
  const q = r * 0.3;
  g.fillStyle = col; g.beginPath();
  g.moveTo(x, y - r); g.lineTo(x + q, y - q); g.lineTo(x + r, y); g.lineTo(x + q, y + q);
  g.lineTo(x, y + r); g.lineTo(x - q, y + q); g.lineTo(x - r, y); g.lineTo(x - q, y - q); g.closePath(); g.fill();
}
// smooth path through points (Catmull-Rom → Bézier)
function smoothPath(g, pts, move = true) {
  if (pts.length < 2) return;
  if (move) g.moveTo(pts[0][0], pts[0][1]); else g.lineTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}
// cut a polyline at fraction p of its x-extent (for draw-on charts); returns the visible points
function cutAt(pts, p) {
  if (p >= 1) return pts.slice();
  const x = lerp(pts[0][0], pts[pts.length - 1][0], p);
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    if (pts[i][0] <= x) out.push(pts[i]);
    else { const a = pts[i - 1] || pts[0], b = pts[i]; const k = (x - a[0]) / ((b[0] - a[0]) || 1); out.push([x, lerp(a[1], b[1], k)]); break; }
  }
  return out;
}
// random walk series (seeded)
function walk(seed, n, drift, vol, start = 1) {
  const r = mulberry32(seed), out = [start];
  for (let i = 1; i < n; i++) out.push(out[i - 1] * Math.exp(drift + vol * gauss(r)));
  return out;
}
function money(v, dec = 2) {
  const s = Math.abs(v).toFixed(dec).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '−' : '') + '$' + s.join('.');
}

/* Mechanical odometer. fmt: target string, e.g. "$284,517.36". Each digit column
 * rolls with v (the current value): the lowest digit turns continuously, higher
 * digits turn only while the digit below them carries from 9 to 0. Leading digits
 * roll in from nothing and the number grows to the right as they arrive. */
function odometer(g, fmt, v, x, y, o) {
  setFont(g, o);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const dot = fmt.indexOf('.');
  const intEnd = dot < 0 ? fmt.length : dot;
  const lh = o.s * 1.05;
  const isD = c => c >= '0' && c <= '9';
  // per character: place value, cell width, how much of it is present (0..1)
  const cells = [];
  let lastDigit = -1;
  for (let i = 0; i < fmt.length; i++) if (isD(fmt[i])) lastDigit = i;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i], cell = g.measureText(ch).width;
    let k = 0;
    if (i < intEnd) { for (let j = i + 1; j < intEnd; j++) if (isD(fmt[j])) k++; }
    else k = -(i - intEnd);
    if (isD(ch)) {
      const pos = Math.max(0, v) / Math.pow(10, k);
      const d = Math.floor(pos) % 10, fr = pos - Math.floor(pos);
      const roll = i === lastDigit ? fr : clamp((fr - 0.9) / 0.1);
      // a leading zero is not drawn; the digit rolls in as the value reaches it
      const leading = i < intEnd && k > 0 && pos < 1;
      cells.push({ ch, cell, d, roll, leading, have: leading ? roll : 1 });
    } else if (ch === ',') {
      const pos = Math.max(0, v) / Math.pow(10, k);
      cells.push({ ch, cell, have: pos >= 1 ? 1 : clamp((pos - 0.9) / 0.1) });
    } else cells.push({ ch, cell, have: 1 });
  }
  const total = cells.reduce((a, c) => a + c.cell * c.have, 0);
  let px = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  g.save();
  g.beginPath(); g.rect(px - 30, y - o.s * 0.95, total + 60, o.s * 1.2); g.clip();
  g.fillStyle = o.c || C.ink;
  const at = (s, cell, yy) => g.fillText(s, px + (cell - g.measureText(s).width) / 2, yy);
  for (const c of cells) {
    if (c.have <= 0) continue;
    const cw = c.cell * c.have;
    if (c.d != null) {
      g.globalAlpha = c.leading ? E.outCubic(c.have) : 1;
      if (!c.leading) at(String(c.d), cw, y - c.roll * lh);
      at(String((c.d + 1) % 10), cw, y + (1 - c.roll) * lh);
    } else {
      g.globalAlpha = c.have;
      at(c.ch, cw, y);
    }
    px += cw;
  }
  g.restore();
  return total;
}

/* ───────────────────────── perspective warp ─────────────────────────
 * A flat texture placed in 3D and drawn through a pinhole camera, using a mesh of
 * affine-mapped triangles. Pose: centre (x, y, z) in screen pixels (z = depth,
 * 0 = screen plane), rotations rx (top toward viewer > 0), ry (right edge away < 0),
 * rz (roll), uniform scale s. Camera at z = −FOCAL. */
const FOCAL = 1700;
function projector(p) {
  const cx = Math.cos(p.rx || 0), sx = Math.sin(p.rx || 0);
  const cy = Math.cos(p.ry || 0), sy = Math.sin(p.ry || 0);
  const cz = Math.cos(p.rz || 0), sz = Math.sin(p.rz || 0);
  const s = p.s == null ? 1 : p.s, z0 = p.z || 0;
  return (u, v, w = 0) => {
    let X = u * s, Y = v * s, Z = w * s;
    const y1 = Y * cx - Z * sx, z1 = Y * sx + Z * cx; Y = y1; Z = z1;
    const x2 = X * cy + Z * sy, z2 = -X * sy + Z * cy; X = x2; Z = z2;
    const x3 = X * cz - Y * sz, y3 = X * sz + Y * cz; X = x3; Y = y3;
    const zz = Z + z0 + FOCAL;
    const k = FOCAL / Math.max(zz, 1);
    return [CX + (X + p.x - CX) * k, CY + (Y + p.y - CY) * k, zz];
  };
}
function texTri(g, img, s0, s1, s2, d0, d1, d2) {
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
  const ex = p => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * 0.75, p[1] + dy / l * 0.75]; };
  const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
  // affine map source (texture) → destination (screen), solved with Cramer's rule:
  // dx = a·sx + c·sy + e,  dy = b·sx + d·sy + f
  const [x0, y0] = s0, [x1, y1] = s1, [x2, y2] = s2;
  const D = x0 * (y1 - y2) - y0 * (x1 - x2) + (x1 * y2 - x2 * y1);
  if (Math.abs(D) < 1e-9) return;
  const solve = (q0, q1, q2) => [
    (q0 * (y1 - y2) - y0 * (q1 - q2) + (q1 * y2 - q2 * y1)) / D,
    (x0 * (q1 - q2) - q0 * (x1 - x2) + (x1 * q2 - x2 * q1)) / D,
    (x0 * (y1 * q2 - y2 * q1) - y0 * (x1 * q2 - x2 * q1) + q0 * (x1 * y2 - x2 * y1)) / D,
  ];
  const [a, c, e] = solve(d0[0], d1[0], d2[0]);
  const [b, d, f] = solve(d0[1], d1[1], d2[1]);
  g.save();
  g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.lineTo(e2[0], e2[1]); g.closePath(); g.clip();
  g.transform(a, b, c, d, e, f);
  g.drawImage(img, 0, 0);
  g.restore();
}
// Draw texture `img` (covering local rect w×h, centred on the pose) in 3D.
function plane3d(g, img, w, h, pose, nx = 10, ny = 6) {
  const P = projector(pose);
  const grid = [];
  for (let j = 0; j <= ny; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) row.push(P((i / nx - 0.5) * w, (j / ny - 0.5) * h));
    grid.push(row);
  }
  const tw = img.width, th = img.height;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i], d = grid[j + 1][i + 1];
    if (a[2] < 60 || b[2] < 60 || c[2] < 60 || d[2] < 60) continue;
    const sa = [i / nx * tw, j / ny * th], sb = [(i + 1) / nx * tw, j / ny * th], sc = [i / nx * tw, (j + 1) / ny * th], sd = [(i + 1) / nx * tw, (j + 1) / ny * th];
    texTri(g, img, sa, sb, sc, a, b, c);
    texTri(g, img, sb, sd, sc, b, d, c);
  }
  return P;
}
// offscreen texture with a local coordinate system of w×h at resolution k
function makeTex(w, h, k = 1.5) {
  const c = canvas(w * k, h * k), x = c.getContext('2d');
  return { c, x, w, h, k };
}
function texBegin(T) { const x = T.x; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, T.c.width, T.c.height); x.setTransform(T.k, 0, 0, T.k, 0, 0); x.globalAlpha = 1; return x; }
// soft drop shadow under a projected quad
function quadShadow(g, P, w, h, a = 0.55, blur = 50, dy = 30, inset = 40) {
  const iw = w / 2 - inset, ih = h / 2 - inset;
  const pts = [P(-iw, -ih), P(iw, -ih), P(iw, ih), P(-iw, ih)];
  g.save(); g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = dy;
  g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
  g.fillStyle = 'rgba(6,10,24,1)'; g.fill(); g.restore();
}

/* ───────────────────────── brand mark ─────────────────────────
 * Motion motif: an allocation ring of six colours (every asset) around a rising
 * line (the view). o.segs: 0..6 segments drawn, o.chart: 0..1, o.rot: rotation. */
function drawMark(g, x, y, r, o = {}) {
  const segs = o.segs == null ? 6 : o.segs, rot = o.rot || 0, th = r * (o.th || 0.24);
  const gap = o.gap == null ? 0.12 : o.gap;
  g.save();
  g.translate(x, y);
  if (o.glow) addGlow(g, C.cyan, 0, 0, r * 2.4, 0.35 * o.glow);
  // inner disc
  if (o.disc !== false) {
    const gr = g.createRadialGradient(0, -r * 0.4, 0, 0, 0, r * 0.9);
    gr.addColorStop(0, '#1B2C58'); gr.addColorStop(1, '#0A1430');
    g.save(); g.fillStyle = gr; g.globalAlpha *= o.discA == null ? 1 : o.discA;
    g.beginPath(); g.arc(0, 0, r - th * 0.5, 0, TAU); g.fill(); g.restore();
  }
  g.lineCap = 'butt';
  for (let i = 0; i < 6; i++) {
    const p = clamp(segs - i);
    if (p <= 0) continue;
    const a0 = -Math.PI / 2 + rot + i * TAU / 6 + gap / 2;
    const a1 = a0 + (TAU / 6 - gap) * E.outCubic(p);
    g.strokeStyle = SEG[i]; g.lineWidth = th * (o.thMul ? o.thMul(i) : 1);
    g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke();
  }
  // rising line
  const cp = o.chart == null ? 1 : o.chart;
  if (cp > 0) {
    const pts = [[-0.46, 0.2], [-0.16, -0.06], [0.06, 0.12], [0.44, -0.3]].map(([a, b]) => [a * r, b * r]);
    const cut = cutAt(pts, cp);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = r * 0.1; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); cut.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    const end = cut[cut.length - 1];
    g.fillStyle = C.mint; g.beginPath(); g.arc(end[0], end[1], r * 0.11 * (0.6 + 0.4 * cp), 0, TAU); g.fill();
  }
  g.restore();
}
// "AllInvestView" wordmark: "View" in the brand gradient. In a sans-serif the
// "llI" run reads as three identical bars, so the capital I gets serifs.
const BRAND_GRAD = [[0, '#38C8FF'], [0.5, '#5B8CFF'], [1, '#A77BFF']];
function wordmark(g, x, y, size, fn, extra = {}) {
  const o = { s: size, w: 900, ls: -size * 0.02, c: C.ink, ...extra, a: 'left' };
  setFont(g, o);
  const mI = g.measureText('I');
  const stem = mI.actualBoundingBoxLeft + mI.actualBoundingBoxRight, cap = mI.actualBoundingBoxAscent;
  const half = stem * 1.32, bar = stem * 0.66, sb = size * 0.045;
  const wA = g.measureText('All').width, wN = g.measureText('nvest').width, wR = g.measureText('nvestView').width;
  g.letterSpacing = '0px';
  const wI = half * 2 + sb * 2, total = wA + wI + wR;
  const al = extra.a || 'center';
  const x0 = al === 'left' ? x : al === 'right' ? x - total : x - total / 2;
  const sw = { sweepX0: x0, sweepX1: x0 + total };
  const sub = off => fn ? (i, n, ch) => fn(i + off, 13, ch) : null;
  letters(g, 'All', x0, y, { ...o, ...sw }, sub(0));
  const r = fn ? fn(3, 13, 'I') || {} : {};
  const a = r.al == null ? 1 : r.al, sc = r.sc == null ? 1 : r.sc;
  if (a > 0.002) {
    const ix = x0 + wA + wI / 2 + (r.dx || 0), iy = y + (r.dy || 0);
    g.save(); g.globalAlpha *= a; g.translate(ix, iy); if (r.rot) g.rotate(r.rot); g.scale(sc, sc);
    const glyph = () => { g.beginPath(); g.rect(-stem / 2, -cap, stem, cap); g.rect(-half, -cap, half * 2, bar); g.rect(-half, -bar, half * 2, bar); };
    g.fillStyle = r.c || o.c; glyph(); g.fill();
    if (o.sweep != null && o.sweep > -0.5 && o.sweep < 1.5) {
      const bx = lerp(x0 - 300, x0 + total + 300, o.sweep) - ix;
      const gr = g.createLinearGradient((bx - 160) / sc, -size * 0.3, (bx + 160) / sc, size * 0.3);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${o.sweepA || 0.85})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; glyph(); g.fill();
    }
    g.restore();
  }
  const xr = x0 + wA + wI;
  letters(g, 'nvestView', xr, y, { ...o, ...sw, grad: BRAND_GRAD, gradFrom: 5, gradX0: xr + wN, gradX1: xr + wR }, sub(4));
  return total;
}
