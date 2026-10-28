'use strict';
/* Karakutu Muhasebe — 38 saniyelik Instagram Reels tanıtım filmi (9:16, 1080×1920, 30 fps)
 * Konsept: 02 "Defter Kapandı" + 03 "Alacağını Kovalama".
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik yalnızca tohumlu
 * (seeded) ve başlangıçta üretilir. renderFrame(f) bir kareyi SAMPLES alt-örnekle
 * (180° obtüratör) çizip ortalar: gerçek hareket bulanıklığı.
 *
 * Akış (120 BPM, 1 vuruş = 0.5 sn, 1 ölçü = 2 sn):
 *   0–4      Defter      veresiye defteri kendini yazar · "Hâlâ veresiye defteriyle mi?"
 *   4–8      Kapanış     kapak kapanır → kara kutu logosu → telefon · "Defter kapandı. Karakutu açıldı."
 *   8–19.5   WhatsApp    hatırlatma kurulur → müşterinin telefonu → cevap → tahsilat → 8 cari
 *   19.5–32  Modüller    defterdeki her not telefona uçar: cari, stok, e-Fatura, gelen/giden, teklif
 *   32–38    Kapanış     modüller kutuya girer, logo, "Defteri kapat, Karakutu'yu aç.", adres
 */

const W = 1080, H = 1920, FPS = 30, DUR = 38;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5;
const TAU = Math.PI * 2;

const C = {
  ink: '#0C0D10', ink2: '#17191E', ink3: '#24272E',
  or: '#FF6A13', or2: '#FF8F45', orD: '#E2540A', orL: '#FFE9DC',
  paper: '#F4ECD9', blueInk: '#22357A', red: '#C93434',
  wa: '#25D366', waD: '#128C4B', waL: '#DDF8E7', waHead: '#1E3A31', bubbleOut: '#D9FDD3', chatBg: '#EBE3D8',
  appBg: '#F6F5F3', field: '#F1F0ED', line: '#EEECE8', mute: '#8A8F98', mute2: '#A3A7AE', white: '#FFFFFF',
  ok: '#1FA35C', bad: '#E5484D',
};

// Ana zaman çizelgesi (saniye)
const T = {
  close0: 3.5, close: 4.0, trace: 4.45, morph0: 5.0, morph1: 5.7, open: 6.0,
  s3: 8.0, tapWa: 8.4, sheet: 8.55, toggle: 9.3, save: 9.85, sheetOut: 10.05,
  flipA: 10.5, notif: 11.0, tapNotif: 11.45, chatOpen: 11.55, bubble: 11.95, reply: 13.4, read: 13.9,
  flipB: 14.5, paid: 15.0, toast: 15.3, many: 16.0, send0: 16.45,
  s4: 19.5, mod: 2.5, s5: 32.0, cube: 34.0,
};

/* ───────────────────────── yardımcılar ───────────────────────── */
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
const ap = (t, t0, d, e = E.outCubic) => e(prog(t, t0, t0 + d));
// Sönümlü yay: dt saniye sonra 0→1 (aşmalı)
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
// Bir kez "zıplayan" darbe: 0'da 1, hızla söner
const kick = (dt, d = 10) => dt <= 0 ? 0 : Math.exp(-d * dt);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const fmt = (n, d = 2) => n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
const TL = n => fmt(n) + ' ₺';

/* ───────────────────────── yazı ───────────────────────── */
function setFont(g, o) {
  g.font = `${o.w || 900} ${o.s}px ${o.f || 'Disp'}, "Noto Color Emoji"`;
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
function wrap(g, s, o, maxW) {
  setFont(g, o);
  const out = [];
  for (const para of s.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const test = line ? line + ' ' + w : w;
      if (line && g.measureText(test).width > maxW) { out.push(line); line = w; } else line = test;
    }
    out.push(line);
  }
  g.letterSpacing = '0px';
  return out;
}
// Harf harf animasyon. fn(i, n) → {dx, dy, sc, rot, al, c}
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
// Yazıyı maskeli bir şeritten aşağıdan yukarı çıkarır (p: 0→1 giriş, q: 0→1 çıkış)
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.04) {
  if (p <= 0 || q >= 1) return;
  g.save();
  g.beginPath(); g.rect(-50, y - o.s * 1.05, W + 100, o.s * 1.4); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.2 };
  });
  g.restore();
}
// Renkli parçalardan oluşan, ortalanmış tek satır: parts = [[metin, renk], …]
function slotLine(g, parts, cx, y, o, p, q = 0) {
  const ws = parts.map(([s]) => measure(g, s, o));
  let x = cx - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach(([s, c], k) => {
    slotText(g, s, x, y, { ...o, a: 'left', c }, clamp(p * 1.15 - k * 0.15), q);
    x += ws[k];
  });
}

/* ───────────────────────── çizim yardımcıları ───────────────────────── */
const SPR = {};
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function box(g, x, y, w, h, r, fill) { rr(g, x, y, w, h, r); g.fillStyle = fill; g.fill(); }
function shadowOn(g, blur, oy, col = 'rgba(0,0,0,0.35)') { g.shadowColor = col; g.shadowBlur = blur; g.shadowOffsetX = 0; g.shadowOffsetY = oy; }
function shadowOff(g) { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetY = 0; }
function makeGlow(rgbStr) {
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${rgbStr},1)`); gr.addColorStop(0.22, `rgba(${rgbStr},0.5)`);
  gr.addColorStop(0.55, `rgba(${rgbStr},0.12)`); gr.addColorStop(1, `rgba(${rgbStr},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return c;
}
function glow(g, spr, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * a;
  g.drawImage(spr, x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = ga;
}
function pill(g, s, x, y, o) { // x: sağ kenar (a='right') ya da sol kenar; y: üst
  const tw = measure(g, s, o), h = o.h || 36, px = o.px || 14;
  const w = tw + px * 2, x0 = o.a === 'right' ? x - w : o.a === 'center' ? x - w / 2 : x;
  box(g, x0, y, w, h, h / 2, o.bg);
  text(g, s, x0 + w / 2, y + h / 2 + o.s * 0.36, { ...o, a: 'center' });
  return w;
}

/* ───────────────────────── ikonlar (24 birimlik kutu) ───────────────────────── */
const P = s => new Path2D(s);
const IC = {
  box: P('M12 2.5 3.5 7v10L12 21.5 20.5 17V7z M3.5 7 12 11.5 20.5 7 M12 11.5v10 M7.8 4.8l8.4 4.5'),
  users: P('M9 4.4a3.6 3.6 0 1 0 0 7.2a3.6 3.6 0 1 0 0-7.2z M2.5 20.5v-1.2A4.8 4.8 0 0 1 7.3 14.5h3.4a4.8 4.8 0 0 1 4.8 4.8v1.2 M16 4.6a3.6 3.6 0 0 1 0 6.8 M18.6 14.8a4.8 4.8 0 0 1 2.9 4.4v1.3'),
  inv: P('M5.5 2.5h13v19l-2.6-1.7-2.6 1.7-2.6-1.7-2.6 1.7-2.6-1.7z M9 7.5h6 M9 11h6 M9 14.5h3.5'),
  chat: P('M20.8 11.6a8.6 8.6 0 0 1-12.6 7.6L3 20.8l1.7-4.9a8.6 8.6 0 1 1 16.1-4.3z M8.6 9.2c.3 2.6 2.6 5 5.3 5.4l1.3-1.3 2 1-.4 1.6c-4.2.6-9.4-4.6-8.8-8.8l1.6-.4 1 2z'),
  quote: P('M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z M14 2.5V8h5.5 M8 13h8 M8 16.5h5'),
  io: P('M4 8h14 M14.5 4.5 18 8l-3.5 3.5 M20 16H6 M9.5 12.5 6 16l3.5 3.5'),
  ok: P('M4.5 12.5l5 5L19.5 6.5'),
  clock: P('M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7v5l3.2 2'),
  bell: P('M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z M10 21h4'),
  home: P('M3.5 11 12 4l8.5 7 M5.5 9.5V20h13V9.5'),
  search: P('M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13z M15.5 15.5 20 20'),
  down: P('M12 4v14 M6 12l6 6 6-6'),
  up: P('M12 20V6 M6 12l6-6 6 6'),
  send: P('M3.5 11.5 20.5 4l-7.5 17-2.2-7.3z M10.8 13.7 20.5 4'),
  back: P('M15 5l-7 7 7 7'),
  alert: P('M12 3.5 2.5 20h19z M12 10v4.5 M12 17.2v.2'),
  phone: P('M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5z M10.5 18.5h3'),
  lira: P('M9 3v14.5c4.5 0 9-2.5 9-8 M5.5 11l8-3.5 M5.5 15l8-3.5'),
};
function icon(g, name, x, y, size, col, lw = 2) {
  g.save(); g.translate(x - size / 2, y - size / 2); g.scale(size / 24, size / 24);
  g.lineWidth = lw; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  g.stroke(IC[name]); g.restore();
}

/* ───────────────────────── logo: izometrik kara kutu (yer tutucu) ───────────────────────── */
const CUBE = {
  top: P('M50 6 92 29 50 52 8 29Z'), left: P('M8 29 50 52 50 96 8 73Z'), right: P('M50 52 92 29 92 73 50 96Z'),
  edge: P('M8 29 50 52 92 29'), out: P('M50 6 92 29 92 73 50 96 8 73 8 29Z'),
};
// o.l / o.r / o.tp: yüzlerin görünme ölçeği (0..1), o.dy: üst yüzün düşüş kayması, o.rim: koyu zeminde kenar çizgisi
function cube(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s / 100, s / 100); g.translate(-50, -51);
  const face = (path, col, a, cx, cy, dy = 0) => {
    if (a <= 0.001) return;
    g.save(); g.translate(cx, cy + dy); g.scale(a, a); g.translate(-cx, -cy);
    g.fillStyle = col; g.fill(path);
    if (o.rim) { g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 1.2; g.stroke(path); }
    g.restore();
  };
  face(CUBE.left, '#2C2E35', o.l ?? 1, 29, 62);
  face(CUBE.right, '#15161A', o.r ?? 1, 71, 62);
  face(CUBE.top, C.or, o.tp ?? 1, 50, 29, o.dy || 0);
  if ((o.tp ?? 1) > 0.98 && Math.abs(o.dy || 0) < 0.5) { g.strokeStyle = '#FFB07A'; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke(CUBE.edge); }
  g.restore();
}

/* ───────────────────────── arka plan sprite'ları ───────────────────────── */
function grain(x, w, h, amt, seed) {
  const id = x.getImageData(0, 0, w, h), d = id.data, r = mulberry32(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(id, 0, 0);
}
const PAPER = { pad: 70, lineY0: 394, lineGap: 140, margin: 150 };
function makePaper() {
  const p = PAPER.pad, c = canvas(W + p * 2, H + p * 2), x = c.getContext('2d');
  x.fillStyle = C.paper; x.fillRect(0, 0, c.width, c.height);
  const lg = x.createRadialGradient(c.width * 0.45, c.height * 0.4, 200, c.width / 2, c.height / 2, 1400);
  lg.addColorStop(0, 'rgba(255,255,255,0.35)'); lg.addColorStop(1, 'rgba(120,90,40,0.16)');
  x.fillStyle = lg; x.fillRect(0, 0, c.width, c.height);
  x.translate(p, p);
  for (let y = PAPER.lineY0 - PAPER.lineGap; y < H + p; y += PAPER.lineGap) { x.fillStyle = 'rgba(120,155,205,0.55)'; x.fillRect(-p, y, W + p * 2, 3); }
  x.fillStyle = 'rgba(228,106,106,0.75)'; x.fillRect(PAPER.margin - 22, -p, 3, H + p * 2); x.fillRect(PAPER.margin - 14, -p, 3, H + p * 2);
  // sol kenarda delikler (defter sırtı solda)
  for (let y = 90; y < H; y += 150) {
    x.fillStyle = 'rgba(70,50,20,0.18)'; x.beginPath(); x.arc(52, y + 3, 17, 0, TAU); x.fill();
    x.fillStyle = '#E3DAC4'; x.beginPath(); x.arc(50, y, 15, 0, TAU); x.fill();
  }
  // kahve lekesi
  const r = mulberry32(11);
  x.save(); x.translate(310, 1560);
  for (let k = 0; k < 3; k++) {
    x.strokeStyle = `rgba(150,95,40,${0.10 + k * 0.04})`; x.lineWidth = 10 - k * 3;
    x.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += 0.08) { const rr_ = 118 + Math.sin(a * 3 + k) * 4 + r() * 3; x.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); }
    x.stroke();
  }
  x.restore();
  x.setTransform(1, 0, 0, 1, 0, 0);
  grain(x, c.width, c.height, 14, 3);
  return c;
}
function makeCover() {
  const c = canvas(W, H), x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, '#1A1B1F'); gr.addColorStop(1, '#0B0B0D');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  grain(x, W, H, 16, 5);
  x.setLineDash([16, 12]); x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 3;
  x.strokeRect(60, 60, W - 120, H - 120);
  x.setLineDash([]);
  // sırt
  const sp = x.createLinearGradient(0, 0, 70, 0);
  sp.addColorStop(0, 'rgba(0,0,0,0.6)'); sp.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = sp; x.fillRect(0, 0, 70, H);
  return c;
}
function makeBgGreen() {
  const c = canvas(W, H), x = c.getContext('2d');
  const gr = x.createRadialGradient(540, 700, 80, 540, 900, 1300);
  gr.addColorStop(0, '#1A5242'); gr.addColorStop(0.5, '#0E2D24'); gr.addColorStop(1, '#06120E');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,0.05)'; x.lineWidth = 4; x.lineCap = 'round';
  for (let y = -40; y < H; y += 180) for (let xx = -40; xx < W; xx += 180) {
    x.beginPath(); x.roundRect(xx + 20, y + 24, 70, 44, 16); x.stroke();
    x.beginPath(); x.arc(xx + 135, y + 120, 22, 0, TAU); x.stroke();
    x.beginPath(); x.moveTo(xx + 40, y + 140); x.lineTo(xx + 80, y + 140); x.stroke();
  }
  return c;
}
function makeBgInk() {
  const c = canvas(W, H), x = c.getContext('2d');
  const gr = x.createRadialGradient(540, 1000, 100, 540, 960, 1300);
  gr.addColorStop(0, '#22170F'); gr.addColorStop(0.55, '#101114'); gr.addColorStop(1, '#08080A');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  for (let y = 254; y < H; y += 140) { x.fillStyle = 'rgba(140,170,220,0.06)'; x.fillRect(0, y, W, 2); }
  x.fillStyle = 'rgba(228,106,106,0.10)'; x.fillRect(96, 0, 2, H); x.fillRect(104, 0, 2, H);
  grain(x, W, H, 8, 9);
  return c;
}
function makeChatBg() {
  const c = canvas(604, 1264), x = c.getContext('2d');
  x.fillStyle = C.chatBg; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = 'rgba(120,100,70,0.08)'; x.lineWidth = 3; x.lineCap = 'round';
  for (let y = 0; y < c.height; y += 120) for (let xx = (y / 120 % 2) * 60; xx < c.width; xx += 120) {
    x.beginPath(); x.arc(xx + 30, y + 30, 10, 0, TAU); x.stroke();
    x.beginPath(); x.moveTo(xx + 70, y + 80); x.lineTo(xx + 95, y + 70); x.stroke();
  }
  return c;
}

/* ───────────────────────── 1. DEFTER (0–4 sn) ───────────────────────── */
const NOTES = [
  { s: 'Veresiye — Ekim', y: 300, size: 132, t0: 0.05, t1: 0.42 },
  { s: 'Ahmet abi — 1.250 ₺', y: 520, size: 92, t0: 0.38, t1: 0.74 },
  { s: 'Koli: 12 / 9 / 14 ???', y: 660, size: 92, t0: 0.72, t1: 1.08 },
  { s: 'Kırtasiye → fatura kes!!', y: 800, size: 92, t0: 1.06, t1: 1.42, rot: -0.012 },
  { s: "Mehmet'i ARA (2. kez)", y: 940, size: 92, t0: 1.38, t1: 1.7, rot: -0.018 },
  { s: 'Teklif → pazartesi... galiba', y: 1080, size: 84, t0: 1.62, t1: 1.98, c: '#4F62A6' },
];
const NX = 168; // defter yazılarının sol kenarı
// Üstü çizilenler ve sonradan eklenenler: [satır, alt metin, t0, t1]
const STRIKES = [[1, '1.250 ₺', 0.78, 0.88], [2, '12', 1.1, 1.16], [2, '9', 1.16, 1.22]];
const ADD = { line: 1, s: '1.400?', t0: 0.88, t1: 1.02 };
const CIRCLE = { line: 4, s: "Mehmet'i ARA", t0: 1.72, t1: 1.92 };
const STICKY = { x: 790, y: 1335, w: 340, h: 312, rot: 0.1, t: 1.75 };
const HOOK = { y1: 930, y2: 1070, words: [['Hâlâ', 0, 2.0], ['veresiye', 0, 2.25], ['defteriyle', 1, 2.5], ['mi?', 1, 2.75]] };

function noteLayout(g) {
  for (const n of NOTES) {
    n.o = { f: 'Hand', w: 700, s: n.size, c: n.c || C.blueInk, a: 'left' };
    n.o = fit(g, n.s, n.o, W - NX - 70);
    n.w = measure(g, n.s, n.o);
  }
  for (const s of STRIKES) {
    const n = NOTES[s[0]], i = n.s.indexOf(s[1]);
    s.x0 = NX + measure(g, n.s.slice(0, i), n.o); s.x1 = s.x0 + measure(g, s[1], n.o); s.y = n.y - n.o.s * 0.28;
  }
  const n1 = NOTES[ADD.line], st = STRIKES[0];
  ADD.o = { ...n1.o, s: n1.o.s * 0.72, c: C.red }; ADD.w = measure(g, ADD.s, ADD.o);
  ADD.x = (st.x0 + st.x1) / 2 - ADD.w / 2 + 10; ADD.y = n1.y - n1.o.s * 0.82;
  const n4 = NOTES[CIRCLE.line];
  CIRCLE.w = measure(g, CIRCLE.s, n4.o); CIRCLE.cx = NX + CIRCLE.w / 2; CIRCLE.cy = n4.y - n4.o.s * 0.3;
  // kanca kelimeleri
  const o = { f: 'Disp', w: 900, s: 138, ls: -3 };
  const lines = [[], []];
  HOOK.words.forEach(w => lines[w[1]].push(w));
  HOOK.o = [0, 1].map(k => fit(g, lines[k].map(w => w[0]).join(' '), o, 960));
  HOOK.pos = HOOK.words.map(([s, li]) => {
    const oo = HOOK.o[li], full = lines[li].map(w => w[0]).join(' '), tw = measure(g, full, oo);
    const before = lines[li].slice(0, lines[li].findIndex(w => w[0] === s)).map(w => w[0] + ' ').join('');
    return { x: 540 - tw / 2 + measure(g, before, oo), w: measure(g, s, oo) };
  });
}
// Kalem ucunun yolu: her yazma olayında uç satır boyunca ilerler, aralarda bir sonrakine kayar
function penEvents() {
  const ev = NOTES.map(n => ({ t0: n.t0, t1: n.t1, x0: NX, x1: NX + n.w, y: n.y - 12 }));
  STRIKES.forEach(s => ev.push({ t0: s[2], t1: s[3], x0: s.x0 - 8, x1: s.x1 + 8, y: s.y }));
  ev.push({ t0: ADD.t0, t1: ADD.t1, x0: ADD.x, x1: ADD.x + ADD.w, y: ADD.y - 10 });
  ev.push({ t0: CIRCLE.t0, t1: CIRCLE.t1, circle: true });
  return ev.sort((a, b) => a.t0 - b.t0);
}
let PEN = null;
function penAt(t) {
  const ev = PEN;
  const at = (e, p) => e.circle
    ? [CIRCLE.cx + Math.cos(-2.6 + p * TAU * 1.08) * (CIRCLE.w / 2 + 30), CIRCLE.cy + Math.sin(-2.6 + p * TAU * 1.08) * 64]
    : [lerp(e.x0, e.x1, p), e.y + Math.sin(p * 40) * 6];
  const last = ev[ev.length - 1];
  if (t < ev[0].t0) { const p = E.outCubic(prog(t, -0.25, ev[0].t0)); const s = at(ev[0], 0); return [lerp(1300, s[0], p), lerp(1700, s[1], p), p]; }
  if (t > last.t1) { const p = E.inCubic(prog(t, last.t1, last.t1 + 0.3)); const s = at(last, 1); return [lerp(s[0], 1350, p), lerp(s[1], 1500, p), 1 - p]; }
  // en son başlamış olayın içindeysek onu izle
  let cur = null;
  for (const e of ev) if (t >= e.t0) cur = e;
  if (t <= cur.t1) return [...at(cur, prog(t, cur.t0, cur.t1)), 1];
  const nx = ev.find(e => e.t0 > t);
  if (!nx) return [...at(cur, 1), 1];
  const p = E.inOutSine(prog(t, cur.t1, nx.t0)), a = at(cur, 1), b = at(nx, 0);
  return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) - Math.sin(p * Math.PI) * 30, 1];
}
function drawPen(g, x, y, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(-0.85);
  g.fillStyle = 'rgba(70,50,20,0.16)'; g.beginPath(); g.roundRect(70, 26, 560, 40, 20); g.fill();
  g.fillStyle = '#C9CCD2'; g.beginPath(); g.moveTo(0, 0); g.lineTo(62, -15); g.lineTo(62, 15); g.closePath(); g.fill();
  g.fillStyle = C.blueInk; g.beginPath(); g.moveTo(0, 0); g.lineTo(15, -4); g.lineTo(15, 4); g.closePath(); g.fill();
  const gr = g.createLinearGradient(0, -19, 0, 19);
  gr.addColorStop(0, '#2B3F8F'); gr.addColorStop(0.45, '#4A66D6'); gr.addColorStop(1, '#1B2A63');
  g.fillStyle = gr; g.beginPath(); g.roundRect(60, -19, 540, 38, 12); g.fill();
  g.fillStyle = '#D5D8DE'; g.fillRect(440, -24, 130, 8);
  g.restore();
}
function notes(g, t) {
  for (const n of NOTES) {
    const p = prog(t, n.t0, n.t1);
    if (p <= 0) continue;
    g.save(); g.translate(NX, n.y); g.rotate(n.rot || 0);
    g.beginPath(); g.rect(-30, -n.o.s * 1.1, (n.w + 60) * p, n.o.s * 1.6); g.clip();
    text(g, n.s, 0, 0, n.o);
    g.restore();
  }
  for (const s of STRIKES) {
    const p = prog(t, s[2], s[3]); if (p <= 0) continue;
    g.strokeStyle = C.red; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s.x0 - 8, s.y + 6); g.lineTo(lerp(s.x0 - 8, s.x1 + 8, p), s.y + 6 - 12 * p); g.stroke();
  }
  const pa = prog(t, ADD.t0, ADD.t1);
  if (pa > 0) {
    g.save(); g.translate(ADD.x, ADD.y); g.rotate(-0.06);
    g.beginPath(); g.rect(-10, -120, (ADD.w + 30) * pa, 170); g.clip();
    text(g, ADD.s, 0, 0, ADD.o); g.restore();
  }
  const pc = prog(t, CIRCLE.t0, CIRCLE.t1);
  if (pc > 0) {
    g.save(); g.translate(CIRCLE.cx, CIRCLE.cy); g.rotate(-0.04);
    g.strokeStyle = C.red; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 0, CIRCLE.w / 2 + 30, 64, 0, -2.6, -2.6 + pc * TAU * 1.08); g.stroke();
    g.restore();
  }
}
function sticky(g, t) {
  const dt = t - STICKY.t; if (dt < 0) return;
  const s = lerp(1.7, 1, E.outQuart(clamp(dt / 0.16))) + 0.04 * kick(dt - 0.16, 18) * Math.sin(dt * 60);
  const lift = 1 - clamp(dt / 0.16);
  g.save(); g.translate(STICKY.x, STICKY.y); g.rotate(STICKY.rot + lift * 0.3); g.scale(s, s);
  shadowOn(g, 20 + lift * 60, 16 + lift * 60, `rgba(60,40,0,${0.35 - lift * 0.15})`);
  box(g, -STICKY.w / 2, -STICKY.h / 2, STICKY.w, STICKY.h, 4, '#FFE066');
  shadowOff(g);
  const fold = g.createLinearGradient(0, -STICKY.h / 2, 0, STICKY.h / 2);
  fold.addColorStop(0, 'rgba(255,255,255,0.25)'); fold.addColorStop(1, 'rgba(160,110,0,0.12)');
  g.fillStyle = fold; g.fillRect(-STICKY.w / 2, -STICKY.h / 2, STICKY.w, STICKY.h);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.save(); g.rotate(-0.06); g.fillRect(-70, -STICKY.h / 2 - 22, 140, 44); g.restore();
  text(g, 'Kim ödedi,', -STICKY.w / 2 + 30, -22, { f: 'Hand', w: 700, s: 66, c: '#3B2A00', a: 'left' });
  text(g, 'kim ödemedi??', -STICKY.w / 2 + 30, 58, { f: 'Hand', w: 700, s: 66, c: '#3B2A00', a: 'left' });
  g.restore();
}
function hookBand(g, t) {
  const pin = ap(t, 1.88, 0.16, E.outCubic);
  if (pin <= 0) return;
  g.save(); g.translate(540, 1000); g.rotate(-0.045);
  g.translate((1 - pin) * -1300, 0);
  shadowOn(g, 50, 24, 'rgba(0,0,0,0.35)');
  box(g, -720, -205, 1440, 400, 0, C.ink);
  shadowOff(g);
  g.fillStyle = C.or; g.fillRect(-720, 186, 1440, 14);
  g.restore();
  g.save(); g.translate(540, 1000); g.rotate(-0.045); g.translate(-540, -1000);
  HOOK.words.forEach(([s, li, tw], k) => {
    const dt = t - tw; if (dt < -0.02) return;
    const p = E.outExpo(clamp((dt + 0.02) / 0.16));
    const pos = HOOK.pos[k], o = HOOK.o[li], y = li ? HOOK.y2 : HOOK.y1;
    g.save(); g.translate(pos.x + pos.w / 2, y - o.s * 0.35); g.scale(lerp(1.8, 1, p), lerp(1.8, 1, p)); g.globalAlpha *= p;
    text(g, s, -pos.w / 2, o.s * 0.35, { ...o, a: 'left', c: li ? C.or : '#fff' });
    g.restore();
  });
  g.restore();
}
// Kapak: soldaki sırttan dönerek kapanır (basit perspektif)
function coverQuad(g, t) {
  const p = E.inQuad(prog(t, T.close0, T.close));
  const th = (Math.PI / 2) * (1 - p), D = 2400;
  const xf = W * Math.cos(th), h = W * Math.sin(th), k = D / (D - h);
  const X = 540 + (xf - 540) * k, Y0 = 960 - 960 * k, Y1 = 960 + 960 * k;
  // kapağın kağıda düşen gölgesi
  g.fillStyle = `rgba(20,14,6,${0.55 * p})`; g.fillRect(0, 0, W, H);
  if (X < 4) return;
  g.save();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(X, Y0); g.lineTo(X, Y1); g.lineTo(0, H); g.closePath(); g.clip();
  // doku: dikey şeritlerle dörtgene ger
  const N = 36;
  for (let i = 0; i < N; i++) {
    const u = i / N;
    g.drawImage(SPR.cover, W * u, 0, W / N, H, X * u, Y0 * u, X / N + 1.5, lerp(H, Y1 - Y0, u));
  }
  g.fillStyle = `rgba(0,0,0,${0.5 * (1 - p)})`; g.fillRect(0, Math.min(0, Y0), W, Math.max(H, Y1) - Math.min(0, Y0));
  g.restore();
}
function scene1(g, t) {
  const z = lerp(1.0, 1.06, E.inOutSine(prog(t, 0, 3.6)));
  g.save();
  g.translate(540, 900); g.scale(z, z); g.rotate(lerp(-0.014, 0.004, prog(t, 0, 3.6))); g.translate(-540, -900);
  g.drawImage(SPR.paper, -PAPER.pad, -PAPER.pad);
  notes(g, t);
  sticky(g, t);
  const [px, py, pa] = penAt(t);
  drawPen(g, px, py, pa);
  g.restore();
  hookBand(g, t);
  if (t > T.close0) coverQuad(g, t);
}

/* ───────────────────────── 2. KAPANIŞ → TELEFON (4–8 sn) ───────────────────────── */
const PH = { W: 640, H: 1300, r: 96, bz: 18 };
PH.SW = PH.W - PH.bz * 2; PH.SH = PH.H - PH.bz * 2; PH.sr = PH.r - PH.bz;
const PCX = 540, PCY = 1252;
const LOGO_COVER = { x: 540, y: 700, s: 260 };
const LOGO_SPLASH = { x: PH.SW / 2, y: PH.SH / 2 - 60, s: 190 };

function cubeBuild(t, t0) { // yüzler sırayla: sol, sağ, üst (düşerek)
  return {
    l: clamp(spring(t - t0, 2.4, 9)), r: clamp(spring(t - t0 - 0.08, 2.4, 9)),
    tp: t >= t0 + 0.16 ? 1 : 0, dy: -60 * (1 - E.inQuad(prog(t, t0 + 0.16, t0 + 0.32))), rim: true,
  };
}
function traceRect(g, x, y, w, h, r, p, a, lw) { // turuncu kenar: üst ortadan iki yöne
  if (p <= 0 || a <= 0) return;
  const per = 2 * (w + h) - (8 - 2 * Math.PI) * r, len = per * p / 2, top = w / 2;
  g.save(); g.globalAlpha *= a;
  rr(g, x, y, w, h, r);
  g.setLineDash([len, per - len]);
  for (const off of [-top, -(top - len)]) {
    g.lineDashOffset = off;
    g.strokeStyle = 'rgba(255,106,19,0.35)'; g.lineWidth = lw * 5; g.stroke();
    g.strokeStyle = C.or; g.lineWidth = lw; g.stroke();
  }
  g.restore();
}
function scene2(g, t) { // kapak (tam ekran) → telefon gövdesi
  const m = E.inOutCubic(prog(t, T.morph0, T.morph1));
  const pw = PH.W, ph = PH.H;
  const x = lerp(0, PCX - pw / 2, m), y = lerp(0, PCY - ph / 2, m), w = lerp(W, pw, m), h = lerp(H, ph, m), r = lerp(0, PH.r, m);
  if (m > 0) { shadowOn(g, 90 * m, 40 * m, 'rgba(0,0,0,0.55)'); box(g, x, y, w, h, r, '#0B0B0D'); shadowOff(g); }
  g.save(); rr(g, x, y, w, h, r); g.clip();
  g.drawImage(SPR.cover, x, y, w, h);
  g.fillStyle = `rgba(11,11,13,${m})`; g.fillRect(x, y, w, h);
  g.restore();
  // turuncu kenar çizgisi: kara kutu
  const tp = E.inOutCubic(prog(t, T.trace, T.trace + 0.5));
  const ins = lerp(40, PH.bz, m);
  traceRect(g, x + ins, y + ins, w - ins * 2, h - ins * 2, lerp(0, PH.sr, m), tp, 1 - m, 6);
  // logo
  const sp = { x: PCX - PH.SW / 2 + LOGO_SPLASH.x, y: PCY - PH.SH / 2 + LOGO_SPLASH.y };
  const lx = lerp(LOGO_COVER.x, sp.x, m), ly = lerp(LOGO_COVER.y, sp.y, m), ls = lerp(LOGO_COVER.s, LOGO_SPLASH.s, m);
  if (t >= T.trace + 0.1) {
    glow(g, SPR.or, lx, ly, ls * 1.6, 0.35 * ap(t, T.trace + 0.3, 0.3));
    cube(g, lx, ly, ls, cubeBuild(t, T.trace + 0.1));
  }
}

/* ───────────────────────── telefon ───────────────────────── */
function phoneState(t) {
  const st = { x: PCX, y: PCY, s: 1, fx: 1, rot: 0, a: 1 };
  st.y += Math.sin(t * 1.4) * 5;
  // müşteri telefonuna dön / geri dön
  const flip = (t0) => { const p = prog(t, t0, t0 + 0.5); return p > 0 && p < 1 ? Math.abs(Math.cos(Math.PI * E.inOutCubic(p))) : 1; };
  st.fx = Math.min(flip(T.flipA), flip(T.flipB));
  // sohbet sırasında yakınlaş
  const z = ap(t, T.chatOpen, 0.45, E.inOutCubic) * (1 - ap(t, T.flipB - 0.15, 0.45, E.inOutCubic));
  st.s = lerp(1, 1.1, z); st.y += 40 * z;
  // modüllerde not çarpınca hafif sarsıntı
  for (let k = 0; k < 5; k++) { const dt = t - (T.s4 + k * T.mod + 0.5); if (dt > 0 && dt < 0.5) st.s *= 1 - 0.025 * kick(dt, 9) * Math.cos(dt * 30); }
  // kapanış: telefon merkeze çekilir
  const out = prog(t, T.s5, T.s5 + 0.55);
  if (out > 0) {
    const e = E.inBack(out);
    st.s *= Math.max(0, 1 - e); st.y = lerp(st.y, 820, E.inOutCubic(out)); st.rot = 0.5 * E.inCubic(out);
  }
  return st;
}
const toFrame = (st, sx, sy) => [st.x + (sx - PH.SW / 2) * st.s * st.fx, st.y + (sy - PH.SH / 2) * st.s];
function drawPhone(g, st, t) {
  if (st.s <= 0.01) return;
  g.save();
  g.translate(st.x, st.y); g.rotate(st.rot); g.scale(st.s * st.fx, st.s);
  const w = PH.W, h = PH.H;
  shadowOn(g, 90, 40, 'rgba(0,0,0,0.55)'); box(g, -w / 2, -h / 2, w, h, PH.r, '#050506'); shadowOff(g);
  rr(g, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, PH.r - 2); g.strokeStyle = '#33353C'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#1C1D22'; g.fillRect(w / 2 - 1, -h / 2 + 260, 6, 120); g.fillRect(-w / 2 - 5, -h / 2 + 230, 6, 70); g.fillRect(-w / 2 - 5, -h / 2 + 320, 6, 70);
  g.save();
  rr(g, -w / 2 + PH.bz, -h / 2 + PH.bz, PH.SW, PH.SH, PH.sr); g.clip();
  g.translate(-PH.SW / 2, -PH.SH / 2);
  screen(g, t);
  g.restore();
  box(g, -85, -h / 2 + PH.bz + 16, 170, 48, 24, '#000');
  if (st.fx < 1) { rr(g, -w / 2, -h / 2, w, h, PH.r); g.fillStyle = `rgba(0,0,0,${(1 - st.fx) * 0.55})`; g.fill(); }
  g.restore();
}

/* ───────────────────────── ekran parçaları (ekran koordinatı: 604×1264) ───────────────────────── */
const SW = PH.SW, SH = PH.SH;
function statusBar(g, time, col) {
  text(g, time, 74, 58, { f: 'Txt', w: 700, s: 25, c: col });
  const x = SW - 64;
  g.fillStyle = col;
  for (let i = 0; i < 4; i++) g.fillRect(x - 92 + i * 9, 58 - 8 - i * 4, 6, 8 + i * 4);
  rr(g, x - 44, 40, 44, 21, 6); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  box(g, x - 41, 43, 32, 15, 3, col); g.fillRect(x + 2, 46, 3, 9);
}
function appTop(g, title, time, o = {}) {
  box(g, 0, 0, SW, SH, 0, C.appBg);
  statusBar(g, time, C.ink);
  const x = o.back ? 74 : 32;
  if (o.back) icon(g, 'back', 40, 150, 34, C.ink, 2.6);
  text(g, 'Yılmaz Ticaret', x, 118, { f: 'Txt', w: 600, s: 21, c: C.mute, a: 'left' });
  text(g, title, x, 172, { f: 'Disp', w: 900, s: 48, c: C.ink, a: 'left', ls: -0.5 });
  cube(g, SW - 60, 140, 62);
}
function tabBar(g, active) {
  const y = SH - 122;
  g.fillStyle = '#fff'; g.fillRect(0, y, SW, 122); g.fillStyle = C.line; g.fillRect(0, y, SW, 2);
  [['home', 'Özet'], ['users', 'Cariler'], ['box', 'Stok'], ['inv', 'Fatura'], ['quote', 'Teklif']].forEach(([ic, lb], i) => {
    const x = SW * (i + 0.5) / 5, on = i === active, c = on ? C.or : C.mute2;
    icon(g, ic, x, y + 40, 34, c, 2);
    text(g, lb, x, y + 84, { f: 'Txt', w: on ? 700 : 600, s: 18, c });
  });
  box(g, SW / 2 - 90, SH - 16, 180, 8, 4, '#111');
}
function avatar(g, x, y, r, ini, col) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  text(g, ini, x, y + r * 0.36, { f: 'Disp', w: 800, s: r * 0.72, c: '#fff' });
}
function tap(g, x, y, t, t0) { // parmak dokunuşu
  const dt = t - t0;
  if (dt < -0.25 || dt > 0.45) return;
  const a = dt < 0 ? 1 - (-dt / 0.25) : 1 - dt / 0.45;
  g.save();
  if (dt >= 0) { g.strokeStyle = `rgba(255,106,19,${0.7 * (1 - dt / 0.45)})`; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 30 + dt * 160, 0, TAU); g.stroke(); }
  const s = dt < 0 ? 1 : 1 - 0.18 * kick(dt, 12);
  shadowOn(g, 16, 6, 'rgba(0,0,0,0.3)');
  g.fillStyle = `rgba(255,255,255,${0.85 * a})`; g.beginPath(); g.arc(x, y, 34 * s, 0, TAU); g.fill();
  shadowOff(g);
  g.strokeStyle = `rgba(0,0,0,${0.15 * a})`; g.lineWidth = 2; g.stroke();
  g.restore();
}
function toggle(g, x, y, p) {
  const col = `rgb(${lerp(205, 37, p) | 0},${lerp(208, 211, p) | 0},${lerp(214, 102, p) | 0})`;
  box(g, x, y, 100, 58, 29, col);
  shadowOn(g, 8, 3, 'rgba(0,0,0,0.25)');
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 29 + 42 * E.outBack(p), y + 29, 24, 0, TAU); g.fill();
  shadowOff(g);
}
function button(g, x, y, w, h, label, bg, fg, press = 0, ic = null) {
  const s = 1 - 0.05 * press;
  g.save(); g.translate(x + w / 2, y + h / 2); g.scale(s, s);
  box(g, -w / 2, -h / 2, w, h, 28, bg);
  const o = { f: 'Disp', w: 800, s: 31, c: fg };
  const tw = measure(g, label, o) + (ic ? 50 : 0);
  if (ic) icon(g, ic, -tw / 2 + 18, 0, 34, fg, 2.6);
  text(g, label, ic ? 25 : 0, 11, o);
  g.restore();
}
function typed(s, p) { return s.slice(0, Math.round(s.length * clamp(p))); }

/* ── splash ── */
function scrSplash(g, t) {
  g.fillStyle = '#0B0B0D'; g.fillRect(0, 0, SW, SH);
  const pulse = 1 + 0.04 * Math.sin((t - T.morph1) * 9) * (1 - ap(t, T.open - 0.1, 0.1));
  glow(g, SPR.or, LOGO_SPLASH.x, LOGO_SPLASH.y, 300, 0.35 + 0.25 * ap(t, T.morph1, 0.3));
  cube(g, LOGO_SPLASH.x, LOGO_SPLASH.y, LOGO_SPLASH.s * pulse, { rim: true });
  const a = ap(t, T.morph1 - 0.05, 0.25);
  g.globalAlpha = a;
  text(g, 'karakutu', SW / 2, LOGO_SPLASH.y + 190, { f: 'Disp', w: 900, s: 58, c: '#fff', ls: -1 });
  text(g, 'MUHASEBE', SW / 2, LOGO_SPLASH.y + 230, { f: 'Txt', w: 700, s: 20, c: C.or, ls: 10 });
  g.globalAlpha = 1;
}

/* ── cariler ── */
const CARI = [
  { ini: 'AK', name: 'Ahmet Kaya', sub: 'Vade: 25 Eki', amt: 12450, col: '#4E7CF4', due: true },
  { ini: 'MD', name: 'Mehmet Demir', sub: 'Vade: 30 Eki', amt: 2150, col: '#E5484D' },
  { ini: 'AY', name: 'Ayşe Yıldız', sub: 'Vade: 2 Kas', amt: 5780, col: '#9A5CF0' },
  { ini: 'KL', name: 'Kırtasiye Ltd.', sub: 'Bakiye kapalı', amt: 0, col: '#12A594', paid: true },
  { ini: 'EG', name: 'Ece Gıda', sub: 'Tedarikçi', amt: 3900, col: '#F5A524' },
];
const CROW = { y0: 452, h: 118 };
function scrCariler(g, t, time) {
  appTop(g, 'Cariler', time);
  const paidP = ap(t, T.paid, 0.6, E.inOutCubic), paid = t >= T.paid + 0.6;
  // özet kartı
  const sy = 206;
  box(g, 24, sy, SW - 48, 128, 30, C.or);
  text(g, 'Toplam alacak', 54, sy + 46, { f: 'Txt', w: 600, s: 22, c: 'rgba(255,255,255,0.85)', a: 'left' });
  text(g, TL(48320 - 12450 * paidP), 54, sy + 102, { f: 'Disp', w: 900, s: 50, c: '#fff', a: 'left', ls: -1 });
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.arc(SW - 84, sy + 64, 38, 0, TAU); g.fill();
  text(g, '₺', SW - 84, sy + 80, { f: 'Disp', w: 900, s: 44, c: '#fff' });
  // arama
  box(g, 24, 352, SW - 48, 70, 22, '#ECEAE6');
  icon(g, 'search', 62, 387, 28, C.mute, 2.4);
  text(g, 'Cari ara…', 90, 396, { f: 'Txt', w: 500, s: 23, c: C.mute, a: 'left' });
  // liste
  box(g, 16, CROW.y0 - 6, SW - 32, CARI.length * CROW.h + 12, 30, '#fff');
  CARI.forEach((c, i) => {
    const ia = ap(t, T.open + 0.1 + i * 0.07, 0.4);
    const y = CROW.y0 + i * CROW.h + (1 - ia) * 40;
    g.save(); g.globalAlpha *= ia;
    if (c.due && paidP > 0) { // ödendi parlaması
      const fl = kick(t - T.paid - 0.6, 3) * (paid ? 1 : 0);
      if (fl > 0) { box(g, 20, y, SW - 40, CROW.h, 24, `rgba(37,211,102,${0.18 * fl})`); }
    }
    if (i) { g.fillStyle = C.line; g.fillRect(124, y, SW - 160, 2); }
    avatar(g, 74, y + 59, 34, c.ini, c.col);
    text(g, c.name, 124, y + 52, { f: 'Txt', w: 700, s: 26, c: C.ink, a: 'left' });
    text(g, c.sub, 124, y + 84, { f: 'Txt', w: 500, s: 20, c: C.mute, a: 'left' });
    const amt = c.due ? c.amt * (1 - paidP) : c.amt;
    text(g, TL(amt), SW - 110, y + 52, { f: 'Disp', w: 800, s: 26, c: C.ink, a: 'right' });
    if (c.due) {
      if (paid) pill(g, 'Tahsil edildi ✓', SW - 110, y + 66, { f: 'Txt', w: 700, s: 17, c: C.waD, bg: C.waL, a: 'right', h: 32, px: 12 });
      else pill(g, 'Vadesi geldi', SW - 110, y + 66, { f: 'Txt', w: 700, s: 17, c: C.orD, bg: C.orL, a: 'right', h: 32, px: 12 });
    }
    if (c.paid) pill(g, 'Ödendi', SW - 110, y + 66, { f: 'Txt', w: 700, s: 17, c: C.waD, bg: C.waL, a: 'right', h: 32, px: 12 });
    g.fillStyle = '#E7F8EE'; g.beginPath(); g.arc(SW - 60, y + 59, 28, 0, TAU); g.fill();
    icon(g, 'chat', SW - 60, y + 59, 32, C.waD, 1.9);
    g.restore();
  });
  tabBar(g, 1);
}
/* ── WhatsApp hatırlatma paneli ── */
const SHEET_H = 790;
function sheet(g, t) {
  const p = ap(t, T.sheet, 0.4, E.outQuart) * (1 - ap(t, T.sheetOut, 0.3, E.inCubic));
  if (p <= 0) return;
  g.fillStyle = `rgba(10,12,16,${0.45 * p})`; g.fillRect(0, 0, SW, SH);
  const y = SH - SHEET_H * p;
  shadowOn(g, 40, -10, 'rgba(0,0,0,0.3)');
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(0, y, SW, SHEET_H + 40, [40, 40, 0, 0]); g.fill();
  shadowOff(g);
  box(g, SW / 2 - 40, y + 16, 80, 8, 4, '#DADDE2');
  g.fillStyle = C.wa; g.beginPath(); g.arc(68, y + 86, 38, 0, TAU); g.fill();
  icon(g, 'chat', 68, y + 86, 42, '#fff', 2);
  text(g, 'WhatsApp hatırlatma', 124, y + 82, { f: 'Disp', w: 800, s: 33, c: C.ink, a: 'left' });
  text(g, 'Ahmet Kaya · ' + TL(12450), 124, y + 116, { f: 'Txt', w: 500, s: 22, c: C.mute, a: 'left' });
  // seçenek
  box(g, 24, y + 160, SW - 48, 112, 24, C.appBg);
  text(g, 'Vadesi gelince', 50, y + 207, { f: 'Txt', w: 700, s: 26, c: C.ink, a: 'left' });
  text(g, 'otomatik gönder', 50, y + 241, { f: 'Txt', w: 500, s: 22, c: C.mute, a: 'left' });
  toggle(g, SW - 150, y + 187, ap(t, T.toggle, 0.22, E.inOutCubic));
  // mesaj önizleme
  text(g, 'MESAJ ÖNİZLEME', 30, y + 318, { f: 'Txt', w: 700, s: 17, c: C.mute, a: 'left', ls: 2 });
  box(g, 24, y + 336, SW - 48, 238, 24, C.chatBg);
  const lines = wrap(g, 'Merhaba Ahmet Bey 👋 Cari hesabınızda 12.450,00 ₺ vadesi gelmiş bakiye bulunmaktadır.', { f: 'Txt', w: 500, s: 23 }, SW - 140);
  const bh = 34 + lines.length * 33;
  box(g, 46, y + 362, SW - 100, bh, 20, '#fff');
  lines.forEach((l, i) => text(g, l, 68, y + 400 + i * 33, { f: 'Txt', w: 500, s: 23, c: '#111B21', a: 'left' }));
  button(g, 24, y + 606, SW - 48, 96, 'Kaydet', C.or, '#fff', kick(t - T.save, 12));
  tap(g, SW - 100, y + 216, t, T.toggle);
  tap(g, SW / 2 + 60, y + 654, t, T.save);
}
/* ── müşterinin telefonu: kilit ekranı + bildirim ── */
const NOTIF = { x: 22, y: 470, w: SW - 44, h: 200 };
function scrLock(g, t) {
  const gr = g.createLinearGradient(0, 0, SW, SH);
  gr.addColorStop(0, '#24365E'); gr.addColorStop(0.6, '#141C33'); gr.addColorStop(1, '#0B0F1C');
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
  glow(g, SPR.blue, 120, 1000, 420, 0.5); glow(g, SPR.or, 520, 1180, 360, 0.25);
  statusBar(g, '09:00', '#fff');
  text(g, 'Çarşamba, 28 Ekim', SW / 2, 196, { f: 'Txt', w: 600, s: 27, c: 'rgba(255,255,255,0.85)' });
  text(g, '09:00', SW / 2, 360, { f: 'Disp', w: 700, s: 168, c: '#fff', ls: -4 });
  const p = spring(t - T.notif, 1.8, 8);
  if (p <= 0) return;
  const y = lerp(-260, NOTIF.y, p);
  notifCard(g, NOTIF.x, y, 1);
  tap(g, SW / 2 + 40, NOTIF.y + 110, t, T.tapNotif);
}
function notifCard(g, x, y, a) {
  g.save(); g.globalAlpha *= a;
  shadowOn(g, 30, 10, 'rgba(0,0,0,0.35)');
  box(g, x, y, NOTIF.w, NOTIF.h, 36, 'rgba(246,246,248,0.96)');
  shadowOff(g);
  box(g, x + 26, y + 26, 64, 64, 16, C.wa);
  icon(g, 'chat', x + 58, y + 58, 40, '#fff', 2);
  text(g, 'Yılmaz Ticaret', x + 108, y + 52, { f: 'Txt', w: 700, s: 25, c: '#111', a: 'left' });
  text(g, 'şimdi', x + NOTIF.w - 28, y + 52, { f: 'Txt', w: 500, s: 20, c: C.mute, a: 'right' });
  text(g, 'Merhaba Ahmet Bey 👋 Cari hesabınızda', x + 108, y + 92, { f: 'Txt', w: 500, s: 22, c: '#333', a: 'left' });
  text(g, '12.450,00 ₺ vadesi gelmiş bakiye…', x + 108, y + 124, { f: 'Txt', w: 500, s: 22, c: '#333', a: 'left' });
  g.restore();
}
/* ── sohbet ── */
const BUB = { x: 22, y: 262, w: 488, pad: 24, lh: 37 };
function scrChat(g, t) {
  g.drawImage(SPR.chatBg, 0, 0);
  g.fillStyle = C.waHead; g.fillRect(0, 0, SW, 180);
  statusBar(g, t < T.reply ? '09:00' : '09:04', '#fff');
  icon(g, 'back', 34, 132, 34, '#fff', 2.6);
  g.fillStyle = C.ink; g.beginPath(); g.arc(98, 132, 36, 0, TAU); g.fill();
  cube(g, 98, 133, 48);
  text(g, 'Yılmaz Ticaret', 150, 124, { f: 'Txt', w: 700, s: 28, c: '#fff', a: 'left' });
  text(g, 'işletme hesabı', 150, 156, { f: 'Txt', w: 500, s: 20, c: '#A9D8C3', a: 'left' });
  pill(g, 'BUGÜN', SW / 2, 206, { f: 'Txt', w: 700, s: 17, c: '#4D6470', bg: '#DCEFF7', a: 'center', h: 34, px: 16, ls: 1.5 });
  // gelen: otomatik hatırlatma
  const o = { f: 'Txt', w: 500, s: 26 };
  const lines = wrap(g, 'Merhaba Ahmet Bey 👋\nCari hesabınızda 12.450,00 ₺ vadesi gelmiş bakiye bulunmaktadır. İyi çalışmalar dileriz.', o, BUB.w - BUB.pad * 2);
  const bh = 58 + lines.length * BUB.lh + 34;
  const bp = clamp(spring(t - T.bubble, 2, 9), 0, 1.2);
  if (bp > 0) {
    g.save(); g.translate(BUB.x, BUB.y); g.scale(bp, bp); g.globalAlpha *= clamp(bp * 2);
    shadowOn(g, 4, 2, 'rgba(0,0,0,0.12)');
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(0, 0, BUB.w, bh, [6, 26, 26, 26]); g.fill();
    shadowOff(g);
    icon(g, 'clock', BUB.pad + 11, 32, 22, C.orD, 2.4);
    text(g, 'OTOMATİK HATIRLATMA', BUB.pad + 30, 39, { f: 'Txt', w: 700, s: 17, c: C.orD, a: 'left', ls: 1.2 });
    lines.forEach((l, i) => text(g, l, BUB.pad, 82 + i * BUB.lh, { ...o, c: '#111B21', a: 'left' }));
    text(g, '09:00', BUB.w - 20, bh - 16, { f: 'Txt', w: 500, s: 18, c: '#667781', a: 'right' });
    g.restore();
  }
  // giden: cevap
  const rp = clamp(spring(t - T.reply, 2, 9), 0, 1.2);
  if (rp > 0) {
    const s = 'Tamam, bugün havale ediyorum 👍', ro = { f: 'Txt', w: 500, s: 26 };
    const rw = Math.min(measure(g, s, ro), 480), rl = wrap(g, s, ro, 480);
    const w = Math.max(rw, 170) + BUB.pad * 2, h = 30 + rl.length * BUB.lh + 34;
    const x = SW - 22 - w, y = BUB.y + bh + 22;
    g.save(); g.translate(x + w, y); g.scale(rp, rp); g.translate(-w, 0); g.globalAlpha *= clamp(rp * 2);
    shadowOn(g, 4, 2, 'rgba(0,0,0,0.12)');
    g.fillStyle = C.bubbleOut; g.beginPath(); g.roundRect(0, 0, w, h, [26, 6, 26, 26]); g.fill();
    shadowOff(g);
    rl.forEach((l, i) => text(g, l, BUB.pad, 50 + i * BUB.lh, { ...ro, c: '#111B21', a: 'left' }));
    const read = t >= T.read;
    text(g, '09:04', w - 62, h - 14, { f: 'Txt', w: 500, s: 18, c: '#667781', a: 'right' });
    text(g, '✓✓', w - 20, h - 14, { f: 'Txt', w: 700, s: 19, c: read ? '#53BDEB' : '#8C9AA2', a: 'right', ls: -5 });
    g.restore();
  }
  // yazı alanı
  box(g, 16, SH - 104, SW - 120, 76, 38, '#fff');
  text(g, 'Mesaj', 50, SH - 56, { f: 'Txt', w: 500, s: 24, c: C.mute2, a: 'left' });
  g.fillStyle = C.waD; g.beginPath(); g.arc(SW - 56, SH - 66, 38, 0, TAU); g.fill();
  icon(g, 'send', SW - 58, SH - 64, 34, '#fff', 2.2);
}
function scrCustomer(g, t) {
  scrLock(g, t);
  const p = ap(t, T.chatOpen, 0.32, E.inOutCubic);
  if (p <= 0) return;
  const x = lerp(NOTIF.x, 0, p), y = lerp(NOTIF.y, 0, p), w = lerp(NOTIF.w, SW, p), h = lerp(NOTIF.h, SH, p);
  g.save(); rr(g, x, y, w, h, lerp(36, 0, p)); g.clip();
  g.translate(x, y); g.scale(w / SW, h / SH);
  scrChat(g, t);
  g.restore();
}
/* ── bugünkü hatırlatmalar ── */
const REM = [
  ['AK', 'Ahmet Kaya', 12450, '#4E7CF4'], ['MD', 'Mehmet Demir', 2150, '#E5484D'], ['AY', 'Ayşe Yıldız', 5780, '#9A5CF0'],
  ['BŞ', 'Burak Şahin', 3200, '#12A594'], ['SA', 'Selin Aydın', 1875, '#F5A524'], ['Kİ', 'Kaya İnşaat', 9400, '#2F80ED'],
  ['DK', 'Deniz Koç', 760, '#D6409F'], ['YM', 'Yıldız Market', 4320, '#46A758'],
];
const remSent = i => T.send0 + (i - 1) * 0.3;
function scrReminders(g, t) {
  appTop(g, 'Hatırlatmalar', '09:06');
  let n = 1; for (let i = 1; i < REM.length; i++) if (t >= remSent(i)) n++;
  const gr = g.createLinearGradient(24, 206, SW - 24, 334);
  gr.addColorStop(0, '#1FB866'); gr.addColorStop(1, '#0F8A4A');
  rr(g, 24, 206, SW - 48, 128, 30); g.fillStyle = gr; g.fill();
  text(g, 'Bugün WhatsApp ile gönderilen', 54, 252, { f: 'Txt', w: 600, s: 22, c: 'rgba(255,255,255,0.88)', a: 'left' });
  const bump = 1 + 0.12 * kick(t - remSent(n - 1), 12) * (n > 1 ? 1 : 0);
  g.save(); g.translate(54, 310); g.scale(bump, bump);
  text(g, `${n} / ${REM.length}`, 0, 0, { f: 'Disp', w: 900, s: 54, c: '#fff', a: 'left' });
  g.restore();
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.arc(SW - 84, 270, 38, 0, TAU); g.fill();
  icon(g, 'chat', SW - 84, 270, 40, '#fff', 2);
  const y0 = 356, rh = 94;
  box(g, 16, y0 - 6, SW - 32, REM.length * rh + 12, 30, '#fff');
  REM.forEach(([ini, name, amt, col], i) => {
    const y = y0 + i * rh;
    if (i) { g.fillStyle = C.line; g.fillRect(110, y, SW - 146, 2); }
    avatar(g, 66, y + 47, 28, ini, col);
    text(g, name, 110, y + 42, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'left' });
    text(g, TL(amt), 110, y + 72, { f: 'Txt', w: 500, s: 19, c: C.mute, a: 'left' });
    if (i === 0) { pill(g, 'Tahsil edildi ✓', SW - 36, y + 30, { f: 'Txt', w: 700, s: 17, c: '#fff', bg: C.ok, a: 'right', h: 34, px: 13 }); return; }
    const dt = t - remSent(i);
    if (dt < 0) { pill(g, 'Sırada', SW - 36, y + 30, { f: 'Txt', w: 600, s: 17, c: C.mute, bg: '#F1F0ED', a: 'right', h: 34, px: 13 }); return; }
    const s = clamp(spring(dt, 2.4, 9), 0, 1.3);
    g.save(); g.translate(SW - 36, y + 47); g.scale(s, s);
    pill(g, 'Gönderildi ✓✓', 0, -17, { f: 'Txt', w: 700, s: 17, c: C.waD, bg: C.waL, a: 'right', h: 34, px: 13 });
    g.restore();
  });
  tabBar(g, 1);
}

/* ── modül ekranları (lt: notun çarptığı andan beri geçen süre) ── */
function field(g, y, label, val, active, caret) {
  text(g, label, 34, y, { f: 'Txt', w: 600, s: 20, c: C.mute, a: 'left' });
  box(g, 24, y + 14, SW - 48, 80, 20, C.field);
  if (active) { rr(g, 24, y + 14, SW - 48, 80, 20); g.strokeStyle = C.or; g.lineWidth = 3; g.stroke(); }
  const o = { f: 'Txt', w: 600, s: 28, c: C.ink, a: 'left' };
  text(g, val, 48, y + 64, o);
  if (caret) { const x = 50 + measure(g, val, o); g.fillStyle = C.or; g.fillRect(x, y + 36, 3, 36); }
}
function scrCariForm(g, lt) {
  appTop(g, 'Yeni cari', '09:12', { back: true });
  const F = [['Ad Soyad / Unvan', 'Ahmet Kaya', 0.15, 0.45], ['Telefon', '0532 418 •• ••', 0.45, 0.72], ['Açılış bakiyesi', '1.400,00 ₺', 0.95, 1.12]];
  const ys = [226, 352, 604];
  F.forEach(([lb, v, a, b], i) => field(g, ys[i], lb, typed(v, prog(lt, a, b)), lt >= a - 0.05 && lt < b + 0.15, lt >= a && lt < b + 0.15 && (lt * 3 % 1) < 0.6));
  // cari tipi
  text(g, 'Cari tipi', 34, 478, { f: 'Txt', w: 600, s: 20, c: C.mute, a: 'left' });
  box(g, 24, 492, SW - 48, 80, 20, C.field);
  const k = ap(lt, 0.75, 0.2, E.outBack);
  box(g, 30, 498, (SW - 60) / 2, 68, 16, `rgba(255,106,19,${k})`);
  text(g, 'Müşteri', 30 + (SW - 60) / 4, 543, { f: 'Txt', w: 700, s: 25, c: k > 0.5 ? '#fff' : C.ink });
  text(g, 'Tedarikçi', 30 + (SW - 60) * 3 / 4, 543, { f: 'Txt', w: 600, s: 25, c: C.mute });
  button(g, 24, 740, SW - 48, 96, 'Kaydet', C.ink, '#fff', kick(lt - 1.3, 12));
  tap(g, SW / 2 + 50, 788, lt, 1.3);
  const sp = ap(lt, 1.42, 0.3, E.outBack) * (lt < 2.6 ? 1 : 0);
  if (sp > 0) {
    g.save(); g.translate(SW / 2, 910); g.scale(sp, sp);
    shadowOn(g, 24, 10, 'rgba(0,0,0,0.3)');
    box(g, -250, -48, 500, 96, 28, C.ink); shadowOff(g);
    g.fillStyle = C.wa; g.beginPath(); g.arc(-200, 0, 24, 0, TAU); g.fill();
    icon(g, 'ok', -200, 0, 28, '#fff', 3.4);
    text(g, 'Cari kaydedildi', -160, -4, { f: 'Txt', w: 700, s: 25, c: '#fff', a: 'left' });
    text(g, 'Ahmet Kaya · 1.400,00 ₺', -160, 26, { f: 'Txt', w: 500, s: 20, c: '#A9AEB7', a: 'left' });
    g.restore();
  }
  tabBar(g, 1);
}
const STOK = [
  ['Koli (büyük boy)', 14, 'adet', 0.55], ['A4 fotokopi kağıdı', 3, 'koli', 0.08, 1], ['Toner (siyah)', 2, 'adet', 0.1, 1],
  ['Klasör', 120, 'adet', 0.82], ['Koli bandı', 4, 'adet', 0.12, 1], ['Zımba teli', 48, 'kutu', 0.62],
];
function scrStok(g, lt) {
  appTop(g, 'Stok', '09:14');
  const ba = ap(lt, 0.95, 0.35, E.outBack);
  const y0 = 214;
  if (ba > 0) {
    g.save(); g.translate(SW / 2, y0 + 44); g.scale(1, ba); g.globalAlpha *= clamp(ba);
    box(g, -SW / 2 + 24, -44, SW - 48, 88, 22, C.orL);
    icon(g, 'alert', -SW / 2 + 70, 0, 34, C.orD, 2.4);
    text(g, 'Kritik stok: 3 ürün', -SW / 2 + 104, 9, { f: 'Txt', w: 700, s: 25, c: C.orD, a: 'left' });
    text(g, 'Gör ›', SW / 2 - 48, 9, { f: 'Txt', w: 700, s: 23, c: C.orD, a: 'right' });
    g.restore();
  }
  const ly = y0 + 104 * ba, rh = 112;
  box(g, 16, ly, SW - 32, STOK.length * rh + 8, 28, '#fff');
  STOK.forEach(([name, q, unit, lvl, crit], i) => {
    const y = ly + 4 + i * rh;
    if (i) { g.fillStyle = C.line; g.fillRect(118, y, SW - 154, 2); }
    if (i === 0) { const hl = 1 - ap(lt, 1.6, 0.6); if (hl > 0) { rr(g, 22, y + 6, SW - 44, rh - 12, 22); g.strokeStyle = `rgba(255,106,19,${hl})`; g.lineWidth = 4; g.stroke(); } }
    box(g, 36, y + 24, 64, 64, 18, crit ? '#FFE8E8' : '#FFF1E8');
    icon(g, 'box', 68, y + 56, 36, crit ? C.bad : C.orD, 2);
    text(g, name, 118, y + 46, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'left' });
    const bw = SW - 118 - 170, bl = lvl * ap(lt, 0.15 + i * 0.06, 0.5);
    box(g, 118, y + 66, bw, 10, 5, '#EEECE8');
    box(g, 118, y + 66, Math.max(10, bw * bl), 10, 5, crit ? C.bad : lvl > 0.5 ? C.ok : C.or);
    let qs = String(q);
    if (i === 0) qs = lt < 0.2 ? '?' : String(Math.round(14 * ap(lt, 0.2, 0.45)));
    text(g, qs, SW - 44, y + 54, { f: 'Disp', w: 900, s: 36, c: crit ? C.bad : C.ink, a: 'right' });
    text(g, unit, SW - 44, y + 84, { f: 'Txt', w: 500, s: 19, c: C.mute, a: 'right' });
    if (i === 0 && lt > 0.7) {
      const s = clamp(spring(lt - 0.7, 2.4, 9), 0, 1.3);
      g.save(); g.translate(118 + measure(g, name, { f: 'Txt', w: 700, s: 24 }) + 14, y + 30); g.scale(s, s);
      pill(g, 'Sayım güncel ✓', 0, -2, { f: 'Txt', w: 700, s: 15, c: C.waD, bg: C.waL, h: 28, px: 10 });
      g.restore();
    }
  });
  tabBar(g, 2);
}
function scrFatura(g, lt) {
  appTop(g, 'e-Fatura', '09:20', { back: true });
  const y0 = 212;
  shadowOn(g, 20, 6, 'rgba(0,0,0,0.06)'); box(g, 20, y0, SW - 40, 580, 28, '#fff'); shadowOff(g);
  text(g, 'ALICI', 50, y0 + 46, { f: 'Txt', w: 700, s: 17, c: C.mute, a: 'left', ls: 2 });
  text(g, 'Kırtasiye Ltd. Şti.', 50, y0 + 86, { f: 'Txt', w: 700, s: 28, c: C.ink, a: 'left' });
  text(g, 'VKN 482•••••17 · 28.10.2026', 50, y0 + 118, { f: 'Txt', w: 500, s: 20, c: C.mute, a: 'left' });
  g.fillStyle = C.line; g.fillRect(50, y0 + 144, SW - 140, 2);
  const items = [['A4 fotokopi kağıdı', '40 koli × 350,00', 14000], ['Toner (siyah)', '6 adet × 1.100,00', 6600]];
  items.forEach(([n, d, v], i) => {
    const a = ap(lt, 0.1 + i * 0.15, 0.3); if (a <= 0) return;
    const y = y0 + 190 + i * 86 + (1 - a) * 20;
    g.save(); g.globalAlpha *= a;
    text(g, n, 50, y, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'left' });
    text(g, d, 50, y + 30, { f: 'Txt', w: 500, s: 19, c: C.mute, a: 'left' });
    text(g, fmt(v), SW - 50, y + 4, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'right' });
    g.restore();
  });
  g.fillStyle = C.line; g.fillRect(50, y0 + 368, SW - 140, 2);
  const k = ap(lt, 0.45, 0.45, E.outCubic);
  const rows = [['Ara toplam', 20600], ['KDV %20', 4120]];
  rows.forEach(([l, v], i) => {
    text(g, l, 50, y0 + 412 + i * 38, { f: 'Txt', w: 500, s: 22, c: C.mute, a: 'left' });
    text(g, TL(v * k), SW - 50, y0 + 412 + i * 38, { f: 'Txt', w: 600, s: 22, c: C.ink, a: 'right' });
  });
  text(g, 'Toplam', 50, y0 + 530, { f: 'Disp', w: 800, s: 30, c: C.ink, a: 'left' });
  text(g, TL(24720 * k), SW - 50, y0 + 532, { f: 'Disp', w: 900, s: 44, c: C.ink, a: 'right', ls: -1 });
  // gönder
  const sent = lt >= 1.3;
  if (!sent) button(g, 20, 820, SW - 40, 100, lt > 1.02 ? 'Gönderiliyor…' : 'e-Fatura gönder', C.or, '#fff', kick(lt - 0.95, 12), lt > 1.02 ? null : 'send');
  else button(g, 20, 820, SW - 40, 100, 'Gönderildi', C.ok, '#fff', 0, 'ok');
  tap(g, SW / 2 + 70, 870, lt, 0.95);
  // damga
  const ds = lt - 1.32;
  if (ds > 0) {
    const s = lerp(2.2, 1, E.outQuart(clamp(ds / 0.14)));
    g.save(); g.translate(SW - 160, y0 + 64); g.rotate(-0.16); g.scale(s * 0.82, s * 0.82); g.globalAlpha *= clamp(ds / 0.08);
    rr(g, -150, -46, 300, 92, 16); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill();
    g.strokeStyle = C.or; g.lineWidth = 7; g.stroke();
    text(g, 'e-FATURA ✓', 0, 16, { f: 'Disp', w: 900, s: 42, c: C.or, ls: 1 });
    g.restore();
  }
  tabBar(g, 3);
}
const GELEN = [['Ece Gıda', 'Tedarikçi · 27 Eki', 3900], ['Ofis Toptan A.Ş.', 'Tedarikçi · 24 Eki', 11250], ['Kargo Lojistik', 'Tedarikçi · 22 Eki', 640], ['Elektrik', 'Gider · 20 Eki', 400]];
const GIDEN = [['Kırtasiye Ltd. Şti.', 'e-Fatura · 28 Eki', 24720], ['Ahmet Kaya', 'Müşteri · 25 Eki', 12450], ['Ayşe Yıldız', 'Müşteri · 23 Eki', 5780], ['Mehmet Demir', 'Müşteri · 21 Eki', 2150]];
function invList(g, list, y0, dir, lt, x) {
  const rh = 108, inn = dir === 'in';
  g.save(); g.translate(x, 0);
  text(g, inn ? 'Bu ay · 4 gelen fatura · 16.190,00 ₺' : 'Bu ay · 4 giden fatura · 45.100,00 ₺', 32, y0, { f: 'Txt', w: 600, s: 21, c: C.mute, a: 'left' });
  box(g, 16, y0 + 22, SW - 32, list.length * rh + 8, 28, '#fff');
  list.forEach(([n, s, v], i) => {
    const a = inn ? ap(lt, 0.1 + i * 0.07, 0.35) : 1;
    const y = y0 + 26 + i * rh + (1 - a) * 30;
    g.save(); g.globalAlpha *= a;
    if (i) { g.fillStyle = C.line; g.fillRect(118, y, SW - 154, 2); }
    g.fillStyle = inn ? C.waL : C.orL; g.beginPath(); g.arc(70, y + 54, 32, 0, TAU); g.fill();
    icon(g, inn ? 'down' : 'up', 70, y + 54, 32, inn ? C.waD : C.orD, 2.6);
    text(g, n, 118, y + 48, { f: 'Txt', w: 700, s: 25, c: C.ink, a: 'left' });
    text(g, s, 118, y + 80, { f: 'Txt', w: 500, s: 19, c: C.mute, a: 'left' });
    text(g, (inn ? '' : '') + TL(v), SW - 40, y + 62, { f: 'Disp', w: 800, s: 25, c: C.ink, a: 'right' });
    g.restore();
  });
  g.restore();
}
function scrFaturalar(g, lt) {
  appTop(g, 'Faturalar', '09:25');
  const sw = ap(lt, 1.1, 0.35, E.inOutCubic);
  box(g, 24, 212, SW - 48, 76, 38, '#E8E6E2');
  const hw = (SW - 60) / 2;
  shadowOn(g, 8, 2, 'rgba(0,0,0,0.12)'); box(g, 30 + hw * sw, 218, hw, 64, 32, '#fff'); shadowOff(g);
  icon(g, 'down', 30 + hw / 2 - 52, 250, 26, sw < 0.5 ? C.waD : C.mute, 2.6);
  text(g, 'Gelen', 30 + hw / 2 + 14, 259, { f: 'Txt', w: 700, s: 25, c: sw < 0.5 ? C.ink : C.mute });
  icon(g, 'up', 30 + hw * 1.5 - 52, 250, 26, sw >= 0.5 ? C.orD : C.mute, 2.6);
  text(g, 'Giden', 30 + hw * 1.5 + 14, 259, { f: 'Txt', w: 700, s: 25, c: sw >= 0.5 ? C.ink : C.mute });
  invList(g, GELEN, 334, 'in', lt, -SW * sw);
  invList(g, GIDEN, 334, 'out', lt, SW * (1 - sw));
  tabBar(g, 3);
}
function scrTeklif(g, lt) {
  appTop(g, 'Teklif', '09:31', { back: true });
  const y0 = 212;
  shadowOn(g, 24, 8, 'rgba(0,0,0,0.08)'); box(g, 20, y0, SW - 40, 600, 26, '#fff'); shadowOff(g);
  box(g, 20, y0, SW - 40, 14, [26, 26, 0, 0], C.or);
  text(g, 'TEKLİF', 50, y0 + 70, { f: 'Disp', w: 900, s: 36, c: C.ink, a: 'left', ls: 1 });
  text(g, '#T-0127', SW - 50, y0 + 70, { f: 'Txt', w: 600, s: 21, c: C.mute, a: 'right' });
  text(g, 'Ayşe Yıldız', 50, y0 + 114, { f: 'Txt', w: 700, s: 26, c: C.ink, a: 'left' });
  text(g, 'Geçerlilik: 7 gün', 50, y0 + 146, { f: 'Txt', w: 500, s: 20, c: C.mute, a: 'left' });
  g.fillStyle = C.line; g.fillRect(50, y0 + 172, SW - 140, 2);
  const L = [['A4 fotokopi kağıdı', '30 koli', 10500], ['Toner (siyah)', '3 adet', 3300], ['Kargo', '1 gönderi', 500]];
  let sum = 0;
  L.forEach(([n, q, v], i) => {
    const a = ap(lt, 0.12 + i * 0.2, 0.25); if (a <= 0) return;
    sum += v * a;
    const y = y0 + 216 + i * 74;
    g.save(); g.globalAlpha *= a;
    g.save(); g.beginPath(); g.rect(40, y - 40, (SW - 80) * E.outCubic(a), 70); g.clip();
    text(g, n, 50, y, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'left' });
    text(g, q, 50, y + 28, { f: 'Txt', w: 500, s: 19, c: C.mute, a: 'left' });
    text(g, fmt(v), SW - 50, y + 4, { f: 'Txt', w: 700, s: 24, c: C.ink, a: 'right' });
    g.restore(); g.restore();
  });
  g.fillStyle = C.line; g.fillRect(50, y0 + 440, SW - 140, 2);
  text(g, 'KDV %20 dahil toplam', 50, y0 + 486, { f: 'Txt', w: 500, s: 21, c: C.mute, a: 'left' });
  text(g, TL(sum * 1.2), SW - 50, y0 + 552, { f: 'Disp', w: 900, s: 46, c: C.ink, a: 'right', ls: -1 });
  const sent = lt >= 1.3;
  if (!sent) button(g, 20, 840, SW - 40, 100, 'Teklifi gönder', C.or, '#fff', kick(lt - 1.15, 12), 'send');
  else button(g, 20, 840, SW - 40, 100, 'Teklif gönderildi', C.ok, '#fff', 0, 'ok');
  tap(g, SW / 2 + 60, 890, lt, 1.15);
  tabBar(g, 4);
}
const MODS = [
  { title: 'Cari kayıt', sub: 'Borç, alacak, bakiye: hepsi kayıtlı.', note: 'Ahmet abi — 1.400?', scr: scrCariForm },
  { title: 'Stok takibi', sub: 'Ne var, ne bitiyor; anında gör.', note: 'Koli: 12 / 9 / 14 ???', scr: scrStok },
  { title: 'e-Fatura', sub: 'Programın içinden kes, gönder.', note: 'Kırtasiye → fatura kes!!', scr: scrFatura },
  { title: 'Gelen / Giden', sub: 'Bütün faturaların tek ekranda.', note: 'Faturalar nerede??', scr: scrFaturalar },
  { title: 'Teklif hazırlama', sub: 'Hazırla, müşterine ilet.', note: 'Teklif → pazartesi...', scr: scrTeklif },
];
const modHit = k => T.s4 + k * T.mod + 0.5;
const IMPACT_S = { x: SW / 2, y: 300 }; // notun ekrana çarptığı nokta

/* ── ekran yönlendirici ── */
function screen(g, t) {
  if (t < T.open) return scrSplash(g, t);
  if (t < T.flipA + 0.25) {
    scrCariler(g, t, '08:57');
    if (t < T.open + 0.45) { // logodan dairesel açılış
      const r = ap(t, T.open, 0.42, E.inCubic) * 1500;
      g.save(); g.beginPath(); g.rect(0, 0, SW, SH); g.arc(LOGO_SPLASH.x, LOGO_SPLASH.y, r, 0, TAU, true); g.clip('evenodd');
      scrSplash(g, t); g.restore();
      g.strokeStyle = C.or; g.lineWidth = 14 * (1 - r / 1500); g.beginPath(); g.arc(LOGO_SPLASH.x, LOGO_SPLASH.y, r, 0, TAU); g.stroke();
    }
    tap(g, SW - 60, CROW.y0 + 59, t, T.tapWa);
    sheet(g, t);
    return;
  }
  if (t < T.flipB + 0.25) return scrCustomer(g, t);
  if (t < T.many) { scrCariler(g, t, '09:06'); return; }
  if (t < modHit(0)) {
    const p = ap(t, T.many, 0.4, E.inOutCubic);
    if (p < 1) { g.save(); g.translate(-SW * p, 0); scrCariler(g, t, '09:06'); g.restore(); }
    g.save(); g.translate(SW * (1 - p), 0); scrReminders(g, t); g.restore();
    return;
  }
  // modüller: önceki ekran + yeni ekranın çarpma noktasından dairesel açılışı
  let k = 0; for (let i = 0; i < MODS.length; i++) if (t >= modHit(i)) k = i;
  const lt = t - modHit(k), wp = ap(lt, 0, 0.38, E.inOutCubic);
  if (wp < 1) {
    if (k === 0) scrReminders(g, t); else MODS[k - 1].scr(g, t - modHit(k - 1));
    g.save(); g.beginPath(); g.arc(IMPACT_S.x, IMPACT_S.y, wp * 1450, 0, TAU); g.clip();
    MODS[k].scr(g, lt); g.restore();
    g.strokeStyle = `rgba(34,53,122,${0.5 * (1 - wp)})`; g.lineWidth = 20 * (1 - wp); g.beginPath(); g.arc(IMPACT_S.x, IMPACT_S.y, wp * 1450, 0, TAU); g.stroke();
  } else MODS[k].scr(g, lt);
}

/* ───────────────────────── telefon dışı katmanlar ───────────────────────── */
function chipAbove(g, t) { // "Ahmet Bey'in telefonu"
  const a = ap(t, T.flipA + 0.25, 0.3) * (1 - ap(t, T.flipB, 0.25));
  if (a <= 0) return;
  const st = phoneState(t), [, top] = toFrame(st, 0, -PH.bz);
  g.save(); g.globalAlpha *= a; g.translate(540, top - 46 + (1 - a) * 20);
  const o = { f: 'Txt', w: 700, s: 25, c: '#fff' }, tw = measure(g, "Ahmet Bey'in telefonu", o) + 70;
  box(g, -tw / 2, -28, tw, 56, 28, 'rgba(255,255,255,0.14)');
  icon(g, 'phone', -tw / 2 + 32, 0, 28, '#fff', 2);
  text(g, "Ahmet Bey'in telefonu", -tw / 2 + 54, 9, { ...o, a: 'left' });
  g.restore();
}
function toast(g, t) {
  const dt = t - T.toast;
  if (dt < 0 || t > T.many + 0.4) return;
  const s = clamp(spring(dt, 1.8, 8), 0, 1.3), out = ap(t, T.many - 0.1, 0.35, E.inBack);
  g.save(); g.translate(770 + out * 500, 760 - out * 200); g.rotate(-0.06 + out * 0.4); g.scale(s, s);
  shadowOn(g, 50, 20, 'rgba(0,0,0,0.5)');
  box(g, -210, -66, 420, 132, 34, '#fff'); shadowOff(g);
  g.fillStyle = C.wa; g.beginPath(); g.arc(-142, 0, 42, 0, TAU); g.fill();
  icon(g, 'ok', -142, 0, 44, '#fff', 3.4);
  text(g, 'TAHSİLAT ALINDI', -84, -16, { f: 'Txt', w: 700, s: 19, c: C.mute, a: 'left', ls: 2 });
  text(g, '+' + TL(12450), -84, 34, { f: 'Disp', w: 900, s: 46, c: C.ink, a: 'left', ls: -1 });
  g.restore();
  // jeton parıltısı
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * TAU + 0.3, d = 140 + 260 * E.outCubic(clamp(dt / 0.7)), al = 1 - clamp(dt / 0.8);
    if (al <= 0) break;
    g.fillStyle = `rgba(255,214,120,${al})`; g.beginPath(); g.arc(770 + Math.cos(a) * d, 760 + Math.sin(a) * d * 0.7, 7 * al + 2, 0, TAU); g.fill();
  }
}
function flyingBubbles(g, t) { // her gönderimde telefondan dışarı uçan yeşil balon
  if (t < T.send0 - 0.1 || t > T.s4 + 0.5) return;
  const st = phoneState(t);
  for (let i = 1; i < REM.length; i++) {
    const dt = t - remSent(i); if (dt < 0 || dt > 1.1) continue;
    const p = E.outCubic(dt / 1.1), side = i % 2 ? 1 : -1;
    const [sx, sy] = toFrame(st, side > 0 ? SW - 40 : 40, 356 + i * 94 + 47);
    const x = sx + side * 300 * p, y = sy - 420 * p - 60 * Math.sin(p * Math.PI);
    const a = 1 - clamp((dt - 0.6) / 0.5), s = 0.6 + 0.6 * E.outBack(clamp(dt / 0.3));
    g.save(); g.translate(x, y); g.rotate(side * 0.2 * p); g.scale(s, s); g.globalAlpha *= a;
    g.fillStyle = C.wa; g.beginPath(); g.roundRect(-46, -30, 92, 60, 22); g.fill();
    g.beginPath(); g.moveTo(-side * 30, 26); g.lineTo(-side * 46, 44); g.lineTo(-side * 8, 28); g.fill();
    text(g, '✓✓', 2, 10, { f: 'Txt', w: 800, s: 28, c: '#fff', ls: -6 });
    g.restore();
  }
}
// Kâğıt not parçası (yırtık kenarlı şerit)
const TORN = (() => { const r = mulberry32(21), a = []; for (let i = 0; i < 64; i++) a.push(r()); return a; })();
function scrap(g, s, x, y, rot, sc, a) {
  if (a <= 0 || sc <= 0) return;
  const o = { f: 'Hand', w: 700, s: 72, c: C.blueInk, a: 'left' };
  const tw = measure(g, s, o), w = tw + 100, h = 150;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= a;
  shadowOn(g, 30, 18, 'rgba(0,0,0,0.45)');
  g.beginPath();
  const n = 24;
  for (let i = 0; i <= n; i++) g.lineTo(-w / 2 + w * i / n, -h / 2 + TORN[i] * 10);
  for (let i = n; i >= 0; i--) g.lineTo(-w / 2 + w * i / n, h / 2 - TORN[i + 30] * 10);
  g.closePath(); g.fillStyle = C.paper; g.fill();
  shadowOff(g);
  g.save(); g.clip();
  g.fillStyle = 'rgba(120,155,205,0.55)'; g.fillRect(-w / 2, 42, w, 3);
  g.fillStyle = 'rgba(228,106,106,0.7)'; g.fillRect(-w / 2 + 34, -h, 3, h * 2);
  g.restore();
  text(g, s, -w / 2 + 56, 30, o);
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.save(); g.rotate(-0.08); g.fillRect(-60, -h / 2 - 16, 120, 34); g.restore();
  g.restore();
}
const INK = (() => { const r = mulberry32(33), a = []; for (let i = 0; i < 22; i++) a.push([r() * TAU, 120 + r() * 260, 5 + r() * 9, r()]); return a; })();
function scraps(g, t) {
  if (t < T.s4 - 0.05 || t > T.s5) return;
  const st = phoneState(t);
  MODS.forEach((m, k) => {
    const hit = modHit(k), dt = t - hit;
    if (dt < -0.5 || dt > 0.6) return;
    const [ix, iy] = toFrame(st, IMPACT_S.x, IMPACT_S.y);
    const side = k % 2 ? 1 : -1;
    if (dt < 0) { // uçuş
      const p = E.inCubic(1 + dt / 0.5);
      scrap(g, m.note, lerp(540 + side * 380, ix, p), lerp(-220, iy, p), lerp(side * 0.5, side * 0.06, p), lerp(0.9, 1, p), 1);
    } else { // çarpma: ezil, ekrana karış
      const sq = 1 + 0.08 * Math.sin(clamp(dt / 0.12) * Math.PI);
      const sh = 1 - E.inCubic(clamp((dt - 0.05) / 0.22));
      scrap(g, m.note, ix, iy, side * 0.06, sq * lerp(0.2, 1, sh), sh);
      for (const [a, d, r, v] of INK) {
        const q = E.outCubic(clamp(dt / 0.5)), al = 1 - clamp(dt / 0.55);
        g.fillStyle = `rgba(34,53,122,${al * (0.5 + v * 0.5)})`;
        g.beginPath(); g.arc(ix + Math.cos(a) * d * q, iy + Math.sin(a) * d * q * 0.8, r * (1 - q * 0.5), 0, TAU); g.fill();
      }
    }
  });
}

/* ───────────────────────── başlıklar ───────────────────────── */
const HL = { o: { f: 'Disp', w: 900, s: 104, ls: -2.5 }, y1: 360, y2: 470 };
function kicker(g, s, y, col, bg, p, q = 0) {
  if (p <= 0 || q >= 1) return;
  const a = E.outCubic(p) * (1 - q);
  const o = { f: 'Txt', w: 700, s: 24, c: col, ls: 3 }, tw = measure(g, s, o) + 56;
  g.save(); g.globalAlpha *= a; g.translate(540, y + (1 - E.outCubic(p)) * 20);
  if (bg) box(g, -tw / 2, -30, tw, 60, 30, bg);
  text(g, s, 0, 9, o);
  g.restore();
}
function headlines(g, t) {
  const o = HL.o;
  // "Defter kapandı." kapakta doğar, sonra yukarı kayar
  if (t >= T.close && t < T.s3) {
    const m = E.inOutCubic(prog(t, T.morph0, T.morph1));
    const y = lerp(1060, HL.y1, m), s = lerp(124, o.s, m), q = ap(t, T.s3 - 0.25, 0.25);
    const oo = fit(g, 'Defter kapandı.', { ...o, s }, 960);
    if (q < 1) letters(g, 'Defter kapandı.', 540, y - q * 40, { ...oo, c: '#fff' }, (i, n) => {
      const p = E.outExpo(clamp((t - T.close - i * 0.018) / 0.25));
      return { sc: lerp(1.6, 1, p), al: p * (1 - q) };
    });
    slotLine(g, [['Karakutu ', C.or], ['açıldı.', C.or]], 540, HL.y2, o, ap(t, T.open, 0.4, E.lin), ap(t, T.s3 - 0.25, 0.25, E.lin));
  }
  // WhatsApp bölümü
  if (t >= T.s3 - 0.1 && t < T.s4 + 0.2) {
    const pin = ap(t, T.s3, 0.45, E.lin), pout = ap(t, T.s4 - 0.3, 0.3, E.lin);
    kicker(g, 'WHATSAPP İLE OTOMATİK BORÇ HATIRLATMA', 214, '#06281A', C.wa, ap(t, T.s3 + 0.1, 0.35), pout);
    const sw = T.many, q1 = ap(t, sw - 0.3, 0.3, E.lin);
    slotLine(g, [['Alacağını', '#fff']], 540, HL.y1, o, pin, q1);
    slotLine(g, [['sen ', '#fff'], ['kovalama.', C.wa]], 540, HL.y2, o, clamp(pin * 1.2 - 0.15), q1);
    const p2 = ap(t, sw, 0.45, E.lin);
    slotLine(g, [['Karakutu', '#fff']], 540, HL.y1, o, p2, pout);
    slotLine(g, [['hatırlatsın.', C.wa]], 540, HL.y2, o, clamp(p2 * 1.2 - 0.15), pout);
  }
  // Modüller
  if (t >= T.s4 && t < T.s5 + 0.3) {
    const q = ap(t, T.s5 - 0.1, 0.3, E.lin);
    kicker(g, 'DEFTERDEKİ HER NOT, YERLİ YERİNDE', 214, C.or, null, ap(t, T.s4 + 0.1, 0.35), q);
    MODS.forEach((m, k) => {
      const h = modHit(k), nx = k < MODS.length - 1 ? modHit(k + 1) : T.s5 + 0.05;
      const p = ap(t, h - 0.04, 0.45, E.lin), qq = ap(t, nx - 0.3, 0.26, E.lin);
      if (p <= 0 || qq >= 1) return;
      const oo = fit(g, m.title, o, 960);
      slotText(g, m.title, 540, HL.y1 + 6, { ...oo, c: '#fff' }, p, qq);
      slotText(g, m.sub, 540, HL.y2 - 6, { f: 'Txt', w: 600, s: 36, c: '#C3C7CE' }, clamp(p * 1.3 - 0.2), qq);
    });
  }
}

/* ───────────────────────── 5. KAPANIŞ (32–38 sn) ───────────────────────── */
const ORB = [['box', 'Stok'], ['users', 'Cari'], ['inv', 'e-Fatura'], ['io', 'Gelen / Giden'], ['quote', 'Teklif'], ['chat', 'WhatsApp']];
const END = { x: 540, y: 800, s: 300 };
const SPARK = (() => { const r = mulberry32(44), a = []; for (let i = 0; i < 70; i++) a.push([r() * TAU, 0.3 + r() * 0.7, r(), r()]); return a; })();
function bgEnd(g, t, a) {
  g.save(); g.globalAlpha *= a;
  g.fillStyle = '#07070A'; g.fillRect(0, 0, W, H);
  glow(g, SPR.or, END.x, END.y, 900, 0.4 + 0.3 * ap(t, T.cube, 0.4));
  if (t > T.cube) { // dönen ışık hüzmeleri
    const ra = ap(t, T.cube, 0.6);
    g.save(); g.translate(END.x, END.y); g.rotate((t - T.cube) * 0.12); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      g.rotate(TAU / 12);
      const gr = g.createLinearGradient(0, 0, 0, -1300);
      gr.addColorStop(0, `rgba(255,120,40,${0.16 * ra})`); gr.addColorStop(1, 'rgba(255,120,40,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(-70, -1300); g.lineTo(70, -1300); g.closePath(); g.fill();
    }
    g.restore();
  }
  g.restore();
}
function scene5(g, t) {
  const burst = T.s5 + 0.55;
  // modül ikonları: patlar, döner, kutuya çekilir
  const out = E.outBack(prog(t, burst, burst + 0.5)), suck = E.inBack(prog(t, T.cube - 0.42, T.cube - 0.08));
  if (t >= burst && t < T.cube) {
    ORB.forEach(([ic, lb], i) => {
      const a = i / ORB.length * TAU - Math.PI / 2 + (t - burst) * 1.1;
      const r = 340 * out * (1 - suck);
      const x = END.x + Math.cos(a) * r, y = END.y + Math.sin(a) * r * 0.92, s = lerp(1, 0.3, suck);
      g.save(); g.translate(x, y); g.scale(s, s);
      shadowOn(g, 30, 10, 'rgba(0,0,0,0.5)');
      g.fillStyle = C.or; g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.fill(); shadowOff(g);
      icon(g, ic, 0, 0, 58, '#fff', 2);
      g.globalAlpha *= 1 - suck;
      text(g, lb, 0, 100, { f: 'Txt', w: 700, s: 26, c: '#fff' });
      g.restore();
    });
  }
  // patlama parlaması
  const fl = kick(t - burst, 6);
  if (t >= burst) glow(g, SPR.white, END.x, END.y, 500 * fl + 50, fl);
  // kutu
  if (t >= T.cube - 0.32) {
    const o = cubeBuild(t, T.cube - 0.32);
    const sq = 1 + 0.06 * kick(t - T.cube, 8) * Math.cos((t - T.cube) * 40);
    glow(g, SPR.or, END.x, END.y, 520, 0.6 * ap(t, T.cube, 0.3));
    cube(g, END.x, END.y, END.s * sq, o);
    const ring = ap(t, T.cube, 0.7, E.outCubic);
    if (ring > 0 && ring < 1) { g.strokeStyle = `rgba(255,140,60,${1 - ring})`; g.lineWidth = 10 * (1 - ring); g.beginPath(); g.arc(END.x, END.y, 160 + 600 * ring, 0, TAU); g.stroke(); }
    for (const [a, sp, v, w] of SPARK) {
      const dt = t - T.cube; if (dt <= 0) break;
      const d = (180 + 900 * sp) * E.outCubic(clamp(dt / 1.4)), al = 1 - clamp(dt / (1.0 + w));
      if (al <= 0) continue;
      g.fillStyle = `rgba(255,${180 + v * 60 | 0},${110 + v * 80 | 0},${al})`;
      g.beginPath(); g.arc(END.x + Math.cos(a) * d, END.y + Math.sin(a) * d + dt * dt * 120, 3 + v * 5, 0, TAU); g.fill();
    }
  }
  // yazılar
  const wm = { f: 'Disp', w: 900, s: 168, ls: -4 };
  if (t >= T.cube + 0.15) {
    letters(g, 'karakutu', 540, 1150, { ...wm, c: '#fff' }, (i, n) => {
      const p = E.outBack(clamp((t - T.cube - 0.2 - i * 0.06) / 0.35));
      return { dy: (1 - p) * 80, al: clamp(p * 1.5), sc: lerp(0.6, 1, clamp(p)) };
    });
    const m = ap(t, T.cube + 0.7, 0.5);
    g.save(); g.globalAlpha *= m;
    text(g, 'MUHASEBE', 540 + 13, 1220, { f: 'Txt', w: 700, s: 40, c: C.or, ls: lerp(60, 26, m) });
    g.restore();
  }
  slotText(g, "Defteri kapat, Karakutu'yu aç.", 540, 1365, fit(g, "Defteri kapat, Karakutu'yu aç.", { f: 'Disp', w: 800, s: 66, c: '#fff', ls: -1 }, 940), ap(t, T.cube + 1.15, 0.5, E.lin));
  const up = t - (T.cube + 1.65);
  if (up > 0) {
    const s = clamp(spring(up, 1.6, 7), 0, 1.3);
    const o = { f: 'Txt', w: 800, s: 46, c: C.ink }, tw = measure(g, 'karakutuveri.com/muhasebe', o) + 90;
    g.save(); g.translate(540, 1490); g.scale(s, s);
    shadowOn(g, 40, 14, 'rgba(255,106,19,0.45)');
    box(g, -tw / 2, -56, tw, 112, 56, C.or); shadowOff(g);
    text(g, 'karakutuveri.com/muhasebe', 0, 16, o);
    g.restore();
  }
  const fa = ap(t, T.cube + 2.15, 0.5);
  if (fa > 0) {
    g.save(); g.globalAlpha *= fa;
    const s = 'Stok · Cari · e-Fatura · Gelen/Giden · Teklif · WhatsApp';
    text(g, s, 540, 1612 + (1 - fa) * 16, fit(g, s, { f: 'Txt', w: 600, s: 30, c: '#9CA0A8' }, 940));
    g.restore();
  }
}

/* ───────────────────────── geçişler ve arka plan ───────────────────────── */
function diagWipe(g, p, drawA, drawB, col) {
  drawA(g);
  if (p <= 0) return;
  const ang = 0.3, x = lerp(-1350, 1350, p), bw = 230;
  g.save(); g.translate(540, 960); g.rotate(ang); g.beginPath(); g.rect(-2400, -2400, 2400 + x - bw / 2, 4800); g.rotate(-ang); g.translate(-540, -960); g.clip();
  drawB(g); g.restore();
  g.save(); g.translate(540, 960); g.rotate(ang); g.fillStyle = col; g.fillRect(x - bw / 2, -2400, bw, 4800);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x - bw / 2, -2400, 10, 4800);
  g.restore();
}
function background(g, t) {
  if (t < T.s3 + 0.5) {
    g.fillStyle = '#08080A'; g.fillRect(0, 0, W, H);
    glow(g, SPR.or, PCX, PCY - 100, 900, 0.28 * ap(t, T.morph1, 0.5) * (1 - ap(t, T.s3, 0.5)));
    const a = ap(t, T.s3 - 0.1, 0.55, E.inOutCubic);
    if (a > 0) { g.globalAlpha = a; g.drawImage(SPR.bgGreen, 0, 0); g.globalAlpha = 1; }
    return;
  }
  const bInk = g2 => { g2.drawImage(SPR.bgInk, 0, 0); glow(g2, SPR.or, 540, 1150, 820, 0.18); };
  if (t < T.s5) return diagWipe(g, ap(t, T.s4 - 0.15, 0.5, E.inOutCubic), g2 => g2.drawImage(SPR.bgGreen, 0, 0), bInk, C.or);
  bInk(g);
  bgEnd(g, t, ap(t, T.s5, 0.5));
}

/* ───────────────────────── kamera sarsıntısı ve ana çizim ───────────────────────── */
const IMPACTS = [[2.0, 9], [2.25, 9], [2.5, 11], [2.75, 18], [T.close, 30], [T.open, 14],
  ...[0, 1, 2, 3, 4].map(k => [modHit(k), 9]), [T.cube, 28]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 95 + i * 1.7); y += k * Math.cos(dt * 78 + i * 2.3); z += a * 0.0016 * Math.exp(-dt * 9);
  });
  return [x, y, z];
}
function vignette(g) { g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H); }
function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(540 + sx, 960 + sy); g.scale(1 + sz, 1 + sz); g.translate(-540, -960);
  g.fillStyle = '#000'; g.fillRect(-200, -200, W + 400, H + 400);
  if (t < T.close) scene1(g, t);
  else {
    background(g, t);
    if (t < T.morph1) scene2(g, t);
    else if (t < T.s5 + 0.6) {
      const st = phoneState(t);
      drawPhone(g, st, t);
    }
    if (t >= T.s5) scene5(g, t);
    chipAbove(g, t);
    toast(g, t);
    flyingBubbles(g, t);
    scraps(g, t);
    headlines(g, t);
  }
  g.restore();
  vignette(g);
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // defter: kalem sesleri
  NOTES.forEach((n, i) => cue(n.t0, 'scribble', { dur: n.t1 - n.t0, gain: 0.5, pan: -0.15 + i * 0.06 }));
  STRIKES.forEach(s => cue(s[2], 'scribble', { dur: s[3] - s[2], gain: 0.6, fast: true }));
  cue(ADD.t0, 'scribble', { dur: ADD.t1 - ADD.t0, gain: 0.45, pan: 0.3 });
  cue(CIRCLE.t0, 'scribble', { dur: CIRCLE.t1 - CIRCLE.t0, gain: 0.5, loop: true });
  cue(STICKY.t, 'slap', { gain: 0.8, pan: 0.35 });
  cue(1.86, 'whoosh', { dur: 0.22, f0: 400, f1: 3500, gain: 0.45, pan: -0.5 });
  HOOK.words.forEach(([, , tw], i) => cue(tw, 'slam', { gain: i === 3 ? 1 : 0.7 }));
  // kapanış
  cue(T.close0, 'whoosh', { dur: 0.5, f0: 200, f1: 1800, gain: 0.7, pan: -0.4 });
  cue(T.close, 'bookclose', { gain: 1 });
  cue(T.trace, 'zip', { dur: 0.5, gain: 0.35 });
  cue(T.trace + 0.1, 'pop', { pitch: 0.8, gain: 0.45 }); cue(T.trace + 0.18, 'pop', { pitch: 0.95, gain: 0.45 }); cue(T.trace + 0.42, 'thump', { gain: 0.6 });
  cue(T.trace + 0.5, 'shimmer', { dur: 0.5, gain: 0.3 });
  cue(T.morph0, 'whoosh', { dur: 0.7, f0: 3000, f1: 300, gain: 0.5 });
  cue(T.open, 'impact', { gain: 0.9 }); cue(T.open + 0.05, 'shine', { dur: 0.45, gain: 0.35 });
  for (let i = 0; i < CARI.length; i++) cue(T.open + 0.12 + i * 0.07, 'blip', { pitch: 1 + i * 0.1, gain: 0.2, pan: 0.2 });
  // WhatsApp
  cue(T.s3, 'whoosh', { dur: 0.3, f0: 800, f1: 4000, gain: 0.3 });
  cue(T.tapWa, 'tap', { gain: 0.6, pan: 0.25 });
  cue(T.sheet, 'whoosh', { dur: 0.35, f0: 300, f1: 2500, gain: 0.35 });
  cue(T.toggle, 'tap', { gain: 0.6, pan: 0.2 }); cue(T.toggle + 0.08, 'click', { gain: 0.5 }); cue(T.toggle + 0.12, 'pop', { pitch: 1.4, gain: 0.4 });
  cue(T.save, 'tap', { gain: 0.6 }); cue(T.save + 0.05, 'success', { gain: 0.35 });
  cue(T.sheetOut, 'whoosh', { dur: 0.3, f0: 2500, f1: 300, gain: 0.3 });
  cue(T.flipA, 'swish', { gain: 0.6 });
  cue(T.notif, 'ding', { gain: 0.7 });
  cue(T.tapNotif, 'tap', { gain: 0.6 });
  cue(T.chatOpen, 'whoosh', { dur: 0.3, f0: 600, f1: 3000, gain: 0.3 });
  cue(T.bubble, 'msg', { gain: 0.6, pan: -0.2 });
  cue(T.reply, 'send', { gain: 0.6, pan: 0.25 });
  cue(T.read, 'tick', { pitch: 1.3, gain: 0.3, pan: 0.3 }); cue(T.read + 0.06, 'tick', { pitch: 1.5, gain: 0.3, pan: 0.3 });
  cue(T.flipB, 'swish', { gain: 0.6 });
  let prev = -1;
  for (let f = 0; f <= 60; f++) {
    const t = T.paid + f * 0.01, n = Math.round(12 * ap(t, T.paid, 0.6, E.inOutCubic));
    if (n !== prev) { cue(t, 'tick', { pitch: 0.9 + n / 12, gain: 0.25 }); prev = n; }
  }
  cue(T.toast, 'kaching', { gain: 0.75, pan: 0.35 });
  cue(T.many, 'whoosh', { dur: 0.35, f0: 1500, f1: 5000, gain: 0.35 });
  for (let i = 1; i < REM.length; i++) cue(remSent(i), 'msgout', { pitch: 1 + i * 0.06, gain: 0.45, pan: i % 2 ? 0.45 : -0.45 });
  // modüller
  cue(T.s4 - 0.15, 'whoosh', { dur: 0.5, f0: 300, f1: 6000, gain: 0.6 });
  MODS.forEach((m, k) => {
    const h = modHit(k);
    cue(h - 0.45, 'flutter', { dur: 0.45, gain: 0.5, pan: k % 2 ? 0.4 : -0.4 });
    cue(h, 'thud', { gain: 0.7 }); cue(h, 'crinkle', { dur: 0.25, gain: 0.45 });
    cue(h + 0.02, 'whoosh', { dur: 0.3, f0: 600, f1: 4000, gain: 0.25 });
  });
  const [h0, h1, h2, h3, h4] = MODS.map((m, k) => modHit(k));
  for (const [a, b, s] of [[0.15, 0.45, 'Ahmet Kaya'], [0.45, 0.72, '0532 418 •• ••'], [0.95, 1.12, '1.400,00 ₺']])
    for (let i = 0; i < s.length; i += 2) cue(h0 + a + (b - a) * i / s.length, 'key', { gain: 0.25, pan: 0.1 });
  cue(h0 + 0.75, 'pop', { pitch: 1.2, gain: 0.35 });
  cue(h0 + 1.3, 'tap', { gain: 0.5 }); cue(h0 + 1.42, 'success', { gain: 0.4 });
  for (let i = 0; i < 14; i += 2) cue(h1 + 0.2 + 0.45 * i / 14, 'tick', { pitch: 1 + i / 20, gain: 0.2 });
  cue(h1 + 0.7, 'pop', { pitch: 1.3, gain: 0.35 }); cue(h1 + 0.95, 'alert', { gain: 0.45 });
  cue(h2 + 0.1, 'blip', { gain: 0.2 }); cue(h2 + 0.25, 'blip', { pitch: 1.2, gain: 0.2 });
  cue(h2 + 0.95, 'tap', { gain: 0.55 }); cue(h2 + 1.32, 'stamp', { gain: 0.8 }); cue(h2 + 1.36, 'success', { gain: 0.4 });
  for (let i = 0; i < 4; i++) cue(h3 + 0.1 + i * 0.07, 'blip', { pitch: 1 + i * 0.1, gain: 0.18 });
  cue(h3 + 1.08, 'tap', { gain: 0.45 }); cue(h3 + 1.12, 'whoosh', { dur: 0.3, f0: 800, f1: 3000, gain: 0.3, pan: 0.3 });
  for (let i = 0; i < 3; i++) cue(h4 + 0.12 + i * 0.2, 'blip', { pitch: 1.1 + i * 0.1, gain: 0.2 });
  cue(h4 + 1.15, 'tap', { gain: 0.55 }); cue(h4 + 1.3, 'send', { gain: 0.45 }); cue(h4 + 1.32, 'success', { gain: 0.4 });
  // kapanış
  cue(T.s5, 'reverse', { dur: 0.55, gain: 0.5 });
  cue(T.s5 + 0.55, 'impact', { gain: 0.6 });
  ORB.forEach((o, i) => cue(T.s5 + 0.55 + i * 0.04, 'pop', { pitch: 1 + i * 0.12, gain: 0.3, pan: Math.cos(i / 6 * TAU) * 0.6 }));
  cue(T.s5 + 0.9, 'shimmer', { dur: 1.0, gain: 0.25 });
  cue(T.cube - 0.45, 'whoosh', { dur: 0.42, f0: 6000, f1: 400, gain: 0.55 });
  cue(T.cube - 0.32, 'pop', { pitch: 0.7, gain: 0.5 }); cue(T.cube - 0.24, 'pop', { pitch: 0.85, gain: 0.5 });
  cue(T.cube, 'impact', { gain: 1, big: true });
  cue(T.cube + 0.05, 'sparkle', { dur: 1.2, gain: 0.4 });
  cue(T.cube + 1.15, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.25 });
  cue(T.cube + 1.65, 'pop', { pitch: 1.1, gain: 0.5 }); cue(T.cube + 1.7, 'shine', { dur: 0.45, gain: 0.3 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.or = makeGlow('255,106,19'); SPR.blue = makeGlow('80,130,255');
  SPR.paper = makePaper(); SPR.cover = makeCover(); SPR.bgGreen = makeBgGreen(); SPR.bgInk = makeBgInk(); SPR.chatBg = makeChatBg();
  const v = g.createRadialGradient(540, 900, 520, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
  SPR.vig = v;
}

function renderFrame(f) {
  const t = f / FPS;
  for (let s = 0; s < SAMPLES; s++) {
    const ts = clamp(t + ((s + 0.5) / SAMPLES - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    draw(g, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt', '700 60px Hand', '40px "Noto Color Emoji"']
    .map(f => document.fonts.load(f, 'AaŞİığüçö0123₺👋👍')));
  noteLayout(g);
  PEN = penEvents();
  initSprites();
  window.CUES = buildCues();
  window.FRAMES = FRAMES; window.FPS = FPS; window.DUR = DUR;
  window.renderFrame = renderFrame; window.renderAt = renderAt;
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  if (qs.has('play')) {
    document.body.classList.add('preview');
    const t0 = performance.now();
    const loop = () => { renderAt(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    loop();
  }
  return true;
})();
