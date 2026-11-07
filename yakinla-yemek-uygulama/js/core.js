'use strict';
/* Yakınla Yemek — temel sabitler ve yardımcılar.
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik tohumludur (mulberry32),
 * yani aynı t her zaman aynı kareyi verir.
 */
const W = 1080, H = 1920, FPS = 30, DUR = 20;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5; // 180° obtüratör: kare başına 6 alt-örnek
const TAU = Math.PI * 2;

const C = {
  blue: '#1F73F0', blueL: '#3B8BFF', blueD: '#0E5FE0', navy: '#061633',
  ink: '#0B1B33', inkSoft: '#5B6B85', line: '#E6ECF5', tile: '#F3F6FB',
  word0: '#0A50E8', word1: '#0332A8', // logodaki yazının mavisi (üst → alt)
  amber: '#FFB547', amberD: '#F59A1B', orange: '#FF7A1A', red: '#FF4D5E',
  green: '#22C55E', greenD: '#14A44D', white: '#FFFFFF',
};

/* ───────────── sayısal yardımcılar ───────────── */
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
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: x => { const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  inBack: x => { const s = 1.7; return (s + 1) * x * x * x - s * x * x; },
};
// Sönümlü yay: dt saniye sonra 0→1 (aşmalı)
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
// Tek seferlik darbe: 0'da 1, üstel söner
const kick = (dt, d = 10) => dt <= 0 ? 0 : Math.exp(-d * dt);
// Yere oturma titreşimi
const wobble = (dt, a = 0.08, d = 10, f = 34) => dt <= 0 ? 0 : a * Math.exp(-dt * d) * Math.cos(dt * f);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const bez2 = (a, c, b, e) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * b;

/* ───────────── gradyan ve yol yardımcıları ───────────── */
const P = s => new Path2D(s);
function lg(g, x0, y0, x1, y1, stops) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  return gr;
}
function rg(g, x, y, r, stops, x0 = x, y0 = y, r0 = 0) {
  const gr = g.createRadialGradient(x0, y0, r0, x, y, r);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  return gr;
}
function rr(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function circ(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; }
function ell(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; }

/* ───────────── yazı ───────────── */
function setFont(g, o) {
  g.font = `${o.w || 800} ${o.s}px ${o.f || 'Disp'}`;
  g.letterSpacing = (o.ls || 0) + 'px';
}
function text(g, s, x, y, o) {
  setFont(g, o);
  g.textAlign = o.a || 'center'; g.textBaseline = o.b || 'alphabetic';
  g.fillStyle = o.c || '#fff';
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
}
function measure(g, s, o) { setFont(g, o); const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; }
function fit(g, s, o, maxW) { const w = measure(g, s, o); return w > maxW ? { ...o, s: o.s * maxW / w } : o; }
// Harf harf çizim. fn(i, n) → {dx, dy, sc, rot, al, c}
function letters(g, s, x, y, o, fn) {
  setFont(g, o);
  g.textAlign = 'left'; g.textBaseline = o.b || 'alphabetic';
  const total = g.measureText(s).width;
  const x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  const n = s.length;
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    if (ch === ' ') continue;
    const off = g.measureText(s.slice(0, i)).width;
    const cw = g.measureText(ch).width;
    const r = fn(i, n) || {};
    const al = r.al == null ? 1 : r.al;
    if (al <= 0.002) continue;
    g.save();
    g.globalAlpha *= al;
    g.translate(x0 + off + cw / 2 + (r.dx || 0), y + (r.dy || 0));
    if (r.rot) g.rotate(r.rot);
    if (r.sc != null) g.scale(r.sc, r.sc);
    g.fillStyle = r.c || o.c || '#fff';
    g.fillText(ch, -cw / 2, 0);
    g.restore();
  }
  g.letterSpacing = '0px';
  return total;
}
// Maskeli şeritten aşağıdan yukarı çıkan yazı (p: giriş 0→1, q: çıkış 0→1)
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.04) {
  if (p <= 0 || q >= 1) return;
  g.save();
  g.beginPath(); g.rect(-50, y - o.s * 1.1, W + 100, o.s * 1.45); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.2 - qi * o.s * 1.25 };
  });
  g.restore();
}
// Yazı "çakma": büyükten hızla iner, oturunca yay gibi titrer
function slam(t, tl, from = 2.6) {
  if (t < tl - 0.12) return null;
  if (t <= tl) { const p = prog(t, tl - 0.12, tl); return { sc: lerp(from, 1, E.inCubic(p)), al: clamp(p * 2.5) }; }
  return { sc: 1 + wobble(t - tl, 0.08, 11, 36), al: 1 };
}

/* ───────────── sprite / ışık yardımcıları ───────────── */
const SPR = {};
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function makeGlow(rgbStr) {
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${rgbStr},1)`); gr.addColorStop(0.22, `rgba(${rgbStr},0.5)`);
  gr.addColorStop(0.55, `rgba(${rgbStr},0.12)`); gr.addColorStop(1, `rgba(${rgbStr},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return c;
}
function makeSoft(rgbStr) { // yumuşak kenarlı disk (bokeh)
  const c = canvas(128, 128), x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${rgbStr},0.9)`); gr.addColorStop(0.7, `rgba(${rgbStr},0.75)`); gr.addColorStop(1, `rgba(${rgbStr},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return c;
}
function glow(g, spr, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * a;
  g.drawImage(spr, x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = ga;
}
// spr.u: 1 ikon birimi kaç piksel. sc: ekranda 1 birim kaç piksel olsun / 1 (yani 100 birimlik ikon 100*sc px)
function sprite(g, spr, x, y, sc = 1, rot = 0, a = 1) {
  if (a <= 0.002 || sc <= 0.001) return;
  const k = sc / (spr.u || 1);
  g.save(); g.globalAlpha *= a; g.translate(x, y); if (rot) g.rotate(rot); g.scale(k, k);
  g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
}
// Dört kollu parıltı
function twinkle(g, x, y, r, a = 1, rot = 0, col = '#fff') {
  if (a <= 0 || r <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.fillStyle = col;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const an = i * Math.PI / 2;
    g.lineTo(Math.cos(an) * r, Math.sin(an) * r);
    g.quadraticCurveTo(0, 0, Math.cos(an + Math.PI / 2) * r, Math.sin(an + Math.PI / 2) * r);
  }
  g.closePath(); g.fill();
  g.restore();
  glow(g, SPR.white, x, y, r * 1.6, 0.5 * a);
}
