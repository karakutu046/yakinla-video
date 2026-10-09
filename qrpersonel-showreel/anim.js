'use strict';
/* QR Personel — 15 saniyelik motion graphics showreel (16:9, 1920×1080, 60 fps)
 *
 * Görüntüdeki her şey kodla çizilir. draw(g, t) zamanın saf fonksiyonudur: rastgelelik
 * yalnızca tohumlu üretilir, aynı t her zaman aynı kareyi verir. renderFrame(f) bir kareyi
 * alt-örneklerle (180° obtüratör) çizip ortalar: gerçek hareket bulanıklığı. Hızlı geçişlerde
 * örnek sayısı otomatik artar.
 *
 * Müzik 128 BPM: 1 vuruş = 0,469 sn, 1 ölçü = 1,875 sn, 8 ölçü = tam 15 sn.
 *   0      01 ZAMAN   08:59:56, saniyeler vuruşla akar; elde zinciri 09:00:00'ı çakar
 *   1.875  02 PİKSEL  saatin pikselleri uçup gerçek, okutulabilir bir QR koda dönüşür
 *   3.75   03 OKUT    vizör kilitlenir, lazer tarar, modüller 3B döner, kimlik çözülür
 *   5.625  04 GİRİŞ   QR onay işaretine çöker; kamera geri çekilir, her şey bir telefonmuş
 *   7.5    05 VERİ    QR 3B bir şehre yükselir; küpler grafiğe dizilir, kamera ortografiğe iner
 *   11.25  06 MARKA   logo inşası, QR Personel, www.qrpersonel.com
 */

const W = 1920, H = 1080, FPS = 60, DUR = 15;
const FRAMES = FPS * DUR;
const SHUTTER = 0.5;
const TAU = Math.PI * 2;
const BPM = 128, BEAT = 60 / BPM, BAR = 4 * BEAT;
const at = (bar, beat = 0) => +(bar * BAR + beat * BEAT).toFixed(5);

const C = {
  ink: '#070B16', navy: '#101934', glass: '#141F3F',
  blue: '#2F5BFF', blueL: '#5C80FF', blueD: '#1D3BD1', blueXL: '#B7C7FF',
  cyan: '#3FD8FF', mint: '#19E3A1', mintD: '#0FB884', coral: '#FF5C6C',
  white: '#FFFFFF', paper: '#F3F6FF', slate: '#8C98BC', qink: '#0A1024', card: '#EEF2FB',
};

/* ───────────────────────── zaman çizelgesi (hepsi vuruşa oturur) ───────────────────────── */
const T = {
  tick: [0, at(0, 1), at(0, 2), at(0, 3)],
  carry: [at(0, 3.5), at(0, 3.625), at(0, 3.75), at(0, 3.875), at(1)], // 1/32'lik elde zinciri
  nine: at(1),
  fly: at(1, 1),
  eyes: [at(1, 2), at(1, 2.5), at(1, 3)],
  card0: at(1, 3) + 0.04, card1: at(2) - 0.05,
  scan: at(2),
  laser0: at(2, 1), laser1: at(2, 3),
  ok: at(2, 3),
  drop: at(3),
  okut: at(3, 1), basla: at(3, 2),
  whip: at(4),
  q: [at(4, 1), at(4, 2), at(4, 3)],
  sort: at(5),
  answer: at(5, 2),
  wipe: at(6),
  leyes: [at(6, 1), at(6, 1.5), at(6, 2)],
  person: at(6, 2.5),
  slide: at(6, 3),
  final: at(7),
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
  inQuart: x => x * x * x * x,
  outQuart: x => 1 - Math.pow(1 - x, 4),
  inOutQuart: x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  inQuint: x => x * x * x * x * x,
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outSine: x => Math.sin(x * Math.PI / 2),
  outBack: x => { const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  outBackSoft: x => 1 + 2 * Math.pow(x - 1, 3) + Math.pow(x - 1, 2),
};
// Sönümlü yay: dt saniye sonra 0→1 (aşmalı)
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
const kick = (dt, d = 10) => dt < 0 ? 0 : Math.exp(-d * dt);
const hash = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const RGB = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, hex2rgb(v)]));
const pad2 = n => String(n).padStart(2, '0');

/* ───────────────────────── yazı ───────────────────────── */
function setFont(g, o) {
  g.font = `${o.w || 900} ${o.s}px ${o.f || 'Disp'}`;
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
// Maskeli şeritten aşağıdan yukarı çıkan yazı (p: 0→1 giriş, q: 0→1 çıkış). o.cf(i) harf rengi.
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.04) {
  if (p <= 0 || q >= 1) return;
  g.save();
  g.beginPath(); g.rect(-100, y - o.s * 1.05, W + 200, o.s * 1.42); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.25, c: o.cf ? o.cf(i) : null };
  });
  g.restore();
}
// Sabit genişlikli (tabular) yazı: her karakter eşit hücrede ortalanır
function mono(g, s, x, y, o) {
  setFont(g, { f: 'Txt', w: o.w || 600, s: o.s });
  const cw = o.s * (o.cw || 0.66);
  const total = cw * s.length;
  const x0 = o.a === 'right' ? x - total : o.a === 'center' ? x - total / 2 : x;
  g.textAlign = 'center'; g.textBaseline = o.b || 'alphabetic'; g.fillStyle = o.c || '#fff';
  for (let i = 0; i < s.length; i++) if (s[i] !== ' ') g.fillText(s[i], x0 + cw * (i + 0.5), y);
  return total;
}
// Rastgele karakterlerden gerçeğine çözülen yazı
const SCR = 'ABCDEFGHJKLMNPRSTUVYZ0123456789#%&*+=<>/';
function scramble(s, p, t, seed = 0) {
  if (p >= 1) return s;
  let out = '';
  for (let i = 0, n = s.length; i < n; i++) {
    const th = i / n;
    if (s[i] === ' ' || s[i] === ':' || s[i] === '.') out += s[i];
    else if (p * 1.35 - 0.35 > th) out += s[i];
    else if (p * 1.35 > th) out += SCR[Math.floor(hash(i + seed * 13, Math.floor(t * 28)) * SCR.length)];
    else out += ' ';
  }
  return out;
}

/* ───────────────────────── sprite'lar ───────────────────────── */
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
function glow(g, spr, x, y, rx, a = 1, ry = rx) {
  if (a <= 0 || rx <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * Math.min(1, a);
  g.drawImage(spr, x - rx, y - ry, 2 * rx, 2 * ry);
  g.globalAlpha = ga;
}

/* ───────────────────────── QR: https://www.qrpersonel.com (sürüm 2-M, 25×25) ─────────────────────────
 * Matris segno ile üretildi; videodaki kod telefonla gerçekten okutulabilir. */
const QR_ROWS = [
  '1111111010101101101111111', '1000001000001010001000001', '1011101000101010101011101', '1011101011010111001011101',
  '1011101011110011101011101', '1000001010000000101000001', '1111111010101010101111111', '0000000011010011000000000',
  '1000101111101000011111001', '1010100011101011110011010', '1001111000000111100111100', '1001000001000001101100110',
  '0100101011101000111001111', '1000000110001111110010010', '0001001000011011100111100', '0011010110111010101110110',
  '1101011000111000111111100', '0000000010110011100010000', '1111111011011010101010000', '1000001001101000100011111',
  '1011101010111010111111100', '1011101001010011001100111', '1011101000011111111001010', '1000001001100000001111110',
  '1111111011001001000000111',
];
const QN = QR_ROWS.length, QM = (QN - 1) / 2;
const EYE_C = [[3, 3], [3, QN - 4], [QN - 4, 3]]; // göz merkezleri (satır, sütun)
const eyeOf = (r, c) => EYE_C.findIndex(([er, ec]) => Math.abs(r - er) <= 3 && Math.abs(c - ec) <= 3);
const DARK = [];
for (let r = 0; r < QN; r++) for (let c = 0; c < QN; c++) if (QR_ROWS[r][c] === '1') DARK.push({ r, c, eye: eyeOf(r, c) });
const DATA = DARK.filter(m => m.eye < 0);

const Q2 = { x: 960, y: 540, s: 22 };
Q2.card = (QN + 6) * Q2.s; // 3 modüllük sessiz bölge
const qx = c => Q2.x + (c - QM) * Q2.s;
const qy = r => Q2.y + (r - QM) * Q2.s;

function mod(g, x, y, s, rot = 0, sy = 1) {
  if (s <= 0.2) return;
  const h = s / 2;
  if (rot || sy !== 1) {
    g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(1, sy);
    g.beginPath(); g.roundRect(-h, -h, s, s, s * 0.24); g.fill(); g.restore();
  } else { g.beginPath(); g.roundRect(x - h, y - h, s, s, s * 0.24); g.fill(); }
}
// QR "gözü" (konum deseni): u = modül adımı
function eye(g, x, y, u, rot = 0, sc = 1, sy = 1) {
  if (sc <= 0.01) return;
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(sc, sc * sy);
  const R = 3.5 * u, r1 = 2.5 * u;
  g.beginPath(); g.roundRect(-R, -R, 2 * R, 2 * R, u * 1.5); g.roundRect(-r1, -r1, 2 * r1, 2 * r1, u * 0.85); g.fill('evenodd');
  g.beginPath(); g.roundRect(-1.5 * u, -1.5 * u, 3 * u, 3 * u, u * 0.7); g.fill();
  g.restore();
}

/* ───────────────────────── efekt yardımcıları ───────────────────────── */
function makeBurst(seed, n, o) {
  const R = mulberry32(seed), p = [];
  for (let i = 0; i < n; i++) {
    const ang = R() * TAU, sp = o.v0 + R() * (o.v1 - o.v0);
    p.push({
      ox: (R() - .5) * (o.w || 0), oy: (R() - .5) * (o.h || 0), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * (o.flat || 1),
      s: o.s0 + R() * (o.s1 - o.s0), rot: R() * TAU, vr: (R() - .5) * 14, col: o.cols[(R() * o.cols.length) | 0], life: o.life * (0.55 + 0.45 * R()),
    });
  }
  return { t0: o.t0, x: o.x, y: o.y, drag: o.drag || 3, grav: o.grav || 0, p };
}
function drawBurst(g, b, t) {
  const dt = t - b.t0; if (dt < 0) return;
  const ga = g.globalAlpha;
  for (const q of b.p) {
    if (dt > q.life) continue;
    const k = (1 - Math.exp(-b.drag * dt)) / b.drag;
    const a = 1 - E.inQuad(dt / q.life);
    g.globalAlpha = ga * a; g.fillStyle = q.col;
    mod(g, b.x + q.ox + q.vx * k, b.y + q.oy + q.vy * k + 0.5 * b.grav * dt * dt, q.s * (0.35 + 0.65 * a), q.rot + q.vr * dt);
  }
  g.globalAlpha = ga;
}
// Genişleyen yuvarlak köşeli şok dalgası
function shock(g, x, y, w0, h0, grow, t, t0, dur, col, lw, rot = 0) {
  const p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  const e = E.outCubic(p), w = w0 + grow * e, h = h0 + grow * e;
  g.save(); g.translate(x, y); if (rot) g.rotate(rot);
  g.globalAlpha *= Math.pow(1 - p, 1.6); g.strokeStyle = col; g.lineWidth = lw * (1 - p * 0.7);
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.16); g.stroke(); g.restore();
}
function checkPath(g, x, y, s, p, lw, col) {
  if (p <= 0) return;
  const pts = [[-0.44, 0.02], [-0.14, 0.32], [0.46, -0.3]];
  const L1 = Math.hypot(0.30, 0.30), L2 = Math.hypot(0.60, 0.62), L = (L1 + L2) * s;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.setLineDash([L * p, L * 2]);
  g.beginPath(); g.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  g.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); g.lineTo(x + pts[2][0] * s, y + pts[2][1] * s); g.stroke();
  g.restore();
}

/* ───────────────────────── arka plan ───────────────────────── */
const RIPPLES = [[T.nine, 960, 500, 1], [T.drop, 960, 540, 1], [T.final, 960, 450, 0.6]];
function bgDark(g, t, ox = 0, glowA = 0.3) {
  g.fillStyle = C.ink; g.fillRect(-80, -80, W + 160, H + 160);
  glow(g, SPR.blue, W / 2, H / 2, 1250, glowA, 900);
  // nokta ızgarası; darbelerde ızgaradan halka dalgası geçer
  const step = 48, off = ((ox % step) + step) % step;
  g.fillStyle = '#A9BCFF';
  const act = RIPPLES.filter(([t0]) => t - t0 > 0 && t - t0 < 1.6);
  for (let y = 18; y < H; y += step) {
    for (let x = off - step + 18; x < W + step; x += step) {
      let a = 0.075, s = 2.6;
      for (const [t0, rx, ry, k] of act) {
        const dt = t - t0, d = Math.hypot(x - rx, y - ry) - dt * 1500;
        const w = Math.exp(-d * d / 4000) * Math.exp(-dt * 2.2) * k;
        a += 0.55 * w; s += 2.4 * w;
      }
      g.globalAlpha = Math.min(1, a);
      g.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }
  g.globalAlpha = 1;
}

/* ───────────────────────── 1. ZAMAN: piksel saat (0–1.875) ───────────────────────── */
const GLYPH = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
};
const CK = { m: 30, cx: 960, cy: 500 };
const CK_W = [5, 5, 1, 5, 5, 1, 5, 5];
const CK_COL = []; { let col = 0; for (const w of CK_W) { CK_COL.push(col); col += w + 1; } CK.cols = col - 1; }
CK.x0 = CK.cx - CK.cols * CK.m / 2; CK.y0 = CK.cy - 7 * CK.m / 2;
const ckPos = (k, r, c) => [CK.x0 + (CK_COL[k] + c + 0.5) * CK.m, CK.y0 + (r + 0.5) * CK.m];
// Her hane için (zaman, karakter) olayları. Elde zinciri sağdan sola akar: 59→00, 59→00, 08→09.
const CK_EV = [
  [[0, '0']],
  [[0, '8'], [T.carry[4], '9']],
  [[0, ':']],
  [[0, '5'], [T.carry[3], '0']],
  [[0, '9'], [T.carry[2], '0']],
  [[0, ':']],
  [[0, '5'], [T.carry[1], '0']],
  [[0, '6'], [T.tick[1], '7'], [T.tick[2], '8'], [T.tick[3], '9'], [T.carry[0], '0']],
];
function clockCells(t, cb) {
  for (let k = 0; k < 8; k++) {
    const ev = CK_EV[k]; let i = 0;
    while (i + 1 < ev.length && ev[i + 1][0] <= t) i++;
    const cur = GLYPH[ev[i][1]], prev = i > 0 ? GLYPH[ev[i - 1][1]] : null, tc = ev[i][0];
    for (let r = 0; r < 7; r++) for (let c = 0; c < CK_W[k]; c++) {
      const on = cur[r][c] === '1', was = prev && prev[r][c] === '1';
      const [x, y] = ckPos(k, r, c);
      if (!prev) {
        if (!on) continue;
        const tr = 0.02 + hash(k * 7 + r, c) * 0.3, p = prog(t, tr, tr + 0.22);
        if (p > 0) cb(x, y, E.outBack(p), kick(t - tr, 5));
      } else if (on && was) cb(x, y, 1 + 0.12 * Math.sin(Math.PI * prog(t, tc, tc + 0.18)), 0);
      else if (on) {
        const d = tc + r * 0.007, p = prog(t, d, d + 0.17);
        if (p > 0) cb(x, y - (1 - E.outCubic(p)) * CK.m * 0.8, E.outBack(p), kick(t - d, 4));
      } else if (was) {
        const p = prog(t, tc, tc + 0.1);
        if (p < 1) cb(x, y + E.inQuad(p) * CK.m * 0.6, 1 - E.inQuad(p), 0);
      }
    }
  }
}
function clockScale(t) {
  const dt = t - T.nine;
  if (dt < 0) return 1 - 0.05 * E.inOutSine(prog(t, T.tick[3], T.nine));
  return 1 + 0.09 * Math.exp(-dt * 8) * Math.cos(dt * TAU * 2.2);
}
function drawClock(g, t) {
  const sc = clockScale(t), dt = t - T.nine, flashAll = dt >= 0 ? Math.exp(-dt * 4.5) : 0;
  g.save(); g.translate(CK.cx, CK.cy); g.scale(sc, sc); g.translate(-CK.cx, -CK.cy);
  clockCells(t, (x, y, s, fl) => {
    g.fillStyle = rgb(mix(RGB.paper, RGB.mint, clamp(Math.max(fl, flashAll))));
    mod(g, x, y, CK.m * 0.86 * s);
  });
  g.restore();
}

/* ───────────────────────── 2–4. QR: uçuş, tarama, çöküş ───────────────────────── */
const LASER = { top: Q2.y - Q2.card / 2 + 26, bot: Q2.y + Q2.card / 2 - 26 };
const laserY = t => lerp(LASER.top, LASER.bot, E.inOutSine(prog(t, T.laser0, T.laser1)));
// Lazerin verilen y'ye ulaştığı an (inOutSine'ın tersi)
const laserAt = y => T.laser0 + Math.acos(1 - 2 * clamp((y - LASER.top) / (LASER.bot - LASER.top))) / Math.PI * (T.laser1 - T.laser0);
let FLY = [];
function buildFly() {
  const fin = ['0', '9', ':', '0', '0', ':', '0', '0'], src = [];
  for (let k = 0; k < 8; k++) for (let r = 0; r < 7; r++) for (let c = 0; c < CK_W[k]; c++) if (GLYPH[fin[k]][r][c] === '1') src.push(ckPos(k, r, c));
  src.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const tgt = DATA.map(m => ({ ...m, x: qx(m.c), y: qy(m.r) })).sort((a, b) => a.x - b.x || a.y - b.y);
  const R = mulberry32(42), maxD = QM * Q2.s * Math.SQRT2;
  FLY = tgt.map((m, i) => {
    const s = src[Math.floor(i * src.length / tgt.length)];
    const dist = Math.hypot(m.x - Q2.x, m.y - Q2.y) / maxD;
    return {
      ...m, sx: s[0], sy: s[1], d: T.fly + 0.02 + 0.24 * dist + 0.08 * R(), dur: 0.44 + 0.14 * R(),
      arc: (R() < .5 ? -1 : 1) * (50 + 170 * R()), spin: (R() < .5 ? -1 : 1) * Math.PI / 2 * (1 + Math.floor(R() * 2)),
      tf: laserAt(m.y), imp: 0.1 * R(),
    };
  });
}
const qrZoom = t => 1 + 0.075 * E.inOutSine(prog(t, T.scan, T.ok + 0.15)) - 0.075 * E.inOutCubic(prog(t, T.ok + 0.15, T.drop));
function zoomAt(g, z, x = Q2.x, y = Q2.y) { g.translate(x, y); g.scale(z, z); g.translate(-x, -y); }

function qrItems(t) {
  const items = [];
  const flip = (tf) => { const fp = prog(t, tf - 0.07, tf + 0.1); return { sy: fp > 0 && fp < 1 ? Math.max(0.05, Math.abs(Math.cos(Math.PI * fp))) : 1, scan: fp >= 0.5, bump: 1 + 0.22 * Math.sin(Math.PI * fp) }; };
  const implode = (it, d) => {
    if (t < T.drop) return;
    const e = E.inCubic(prog(t, T.drop + d, T.drop + d + 0.22));
    it.x = lerp(it.x, Q2.x, e); it.y = lerp(it.y, Q2.y, e); it.k *= 1 - e;
  };
  for (const m of FLY) {
    let x, y, s, rot = 0;
    if (t < m.d) { x = m.sx; y = m.sy; s = CK.m * 0.86 * (1 + 0.12 * E.inOutSine(prog(t, T.fly, m.d))); }
    else {
      const p = prog(t, m.d, m.d + m.dur), e = E.inOutCubic(p);
      const dx = m.x - m.sx, dy = m.y - m.sy, L = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * e) * m.arc;
      x = lerp(m.sx, m.x, e) - dy / L * arc; y = lerp(m.sy, m.y, e) + dx / L * arc;
      s = lerp(CK.m * 0.86 * 1.12, Q2.s * 0.92, e); rot = (1 - E.outCubic(p)) * m.spin;
      const land = t - m.d - m.dur; if (land > 0) s *= 1 + 0.3 * Math.exp(-land * 13) * Math.sin(land * 38);
    }
    const f = flip(m.tf);
    const it = { x, y, k: s * f.bump, rot, sy: f.sy, scan: f.scan, eye: -1 };
    implode(it, m.imp);
    items.push(it);
  }
  for (let i = 0; i < 3; i++) {
    const te = T.eyes[i], p = prog(t, te - 0.26, te);
    if (p <= 0) continue;
    const ex = qx(EYE_C[i][1]), ey = qy(EYE_C[i][0]);
    let k, rot;
    if (t < te) { k = lerp(2.9, 1, E.inQuart(p)); rot = lerp(i === 1 ? 1 : -1, 0, E.outQuart(p)) * Math.PI * 0.75; }
    else { const dt = t - te; k = 1 - 0.1 * Math.exp(-dt * 12) * Math.cos(dt * TAU * 3); rot = 0; }
    const f = flip(laserAt(ey));
    const it = { x: ex, y: ey, k: k * f.bump, rot, sy: f.sy, scan: f.scan, eye: i, al: E.outQuad(p) };
    implode(it, 0.04 + i * 0.03);
    items.push(it);
  }
  return items;
}
function paintItems(g, items, colBase, colScan) {
  for (const it of items) {
    if (it.k <= 0.01) continue;
    g.fillStyle = it.scan ? colScan : colBase;
    if (it.eye >= 0) {
      const ga = g.globalAlpha; g.globalAlpha = ga * (it.al == null ? 1 : it.al);
      eye(g, it.x, it.y, Q2.s, it.rot, it.k, it.sy);
      g.globalAlpha = ga;
    } else mod(g, it.x, it.y, it.k, it.rot, it.sy);
  }
}
// Beyaz QR kartı; çöküşte yeşil daireye dönüşür
function drawCard(g, t) {
  const p = E.inOutCubic(prog(t, T.drop, T.drop + 0.26));
  const s = lerp(Q2.card, 220, p), r = lerp(40, 110, p);
  glow(g, SPR.blue, Q2.x, Q2.y, s * 1.05, 0.5 * (1 - p));
  g.fillStyle = rgb(mix(RGB.white, RGB.mint, p));
  g.beginPath(); g.roundRect(Q2.x - s / 2, Q2.y - s / 2, s, s, r); g.fill();
}
function drawQR2D(g, t) {
  const items = qrItems(t);
  if (t < T.card0) { paintItems(g, items, C.paper, C.paper); return; }
  if (t < T.card1) {
    // sıvı tersine dönüş: dairesel bir maske beyaz kartı ve koyu modülleri açığa çıkarır
    const p = E.inOutCubic(prog(t, T.card0, T.card1)), rr = p * 540;
    paintItems(g, items, C.paper, C.paper);
    g.save(); g.beginPath(); g.arc(Q2.x, Q2.y, rr, 0, TAU); g.clip();
    drawCard(g, t); paintItems(g, items, C.qink, C.blue);
    g.restore();
    g.save(); g.globalAlpha = (1 - p) * 0.9; g.strokeStyle = C.mint; g.lineWidth = 5;
    g.beginPath(); g.arc(Q2.x, Q2.y, rr, 0, TAU); g.stroke(); g.restore();
    return;
  }
  if (t < T.drop + 0.27) drawCard(g, t);
  paintItems(g, items, C.qink, C.blue);
}

function sceneAB(g, t) {
  const imp = t - T.nine;
  bgDark(g, t, 0, 0.26 + (imp > 0 ? 0.35 * Math.exp(-imp * 3) : 0.12 * prog(t, T.tick[3], T.nine)));
  // gün etiketi
  const la = E.outCubic(prog(t, 0.12, 0.5)) * (1 - prog(t, T.fly - 0.2, T.fly));
  if (la > 0) text(g, 'PAZARTESİ', 960, CK.y0 - 74, { f: 'Txt', w: 600, s: 24, ls: 16, c: rgb(RGB.slate, la) });
  if (t < T.fly) drawClock(g, t); else drawQR2D(g, t);
  // darbe: şok dalgası + piksel patlaması
  shock(g, CK.cx, CK.cy, CK.cols * CK.m + 30, 7 * CK.m + 30, 260, t, T.nine, 0.55, C.mint, 5);
  shock(g, CK.cx, CK.cy, CK.cols * CK.m + 30, 7 * CK.m + 30, 520, t, T.nine + 0.05, 0.75, C.blueL, 3);
  drawBurst(g, SPR.burstNine, t);
  // alt yazı
  slotText(g, 'Mesai başladı.', 960, CK.y0 + 7 * CK.m + 120, { s: 64, w: 800, cf: i => i === 13 ? C.mint : C.white },
    prog(t, T.nine + 0.04, T.nine + 0.5), prog(t, T.fly - 0.14, T.fly + 0.12), 0.035);
  // gözler yere çakılırken mini şok dalgaları
  for (let i = 0; i < 3; i++) shock(g, qx(EYE_C[i][1]), qy(EYE_C[i][0]), 7 * Q2.s, 7 * Q2.s, 120, t, T.eyes[i], 0.4, C.mint, 4);
}

/* ───────────────────────── 3. OKUT (3.75–5.625) ───────────────────────── */
function drawLaser(g, t) {
  const a = prog(t, T.laser0 - 0.06, T.laser0 + 0.04) * (1 - prog(t, T.laser1 + 0.02, T.laser1 + 0.14));
  if (a <= 0) return;
  const y = laserY(t), hw = Q2.card / 2 + 40;
  g.save(); g.globalAlpha = a;
  const tr = g.createLinearGradient(0, y - 150, 0, y);
  tr.addColorStop(0, 'rgba(25,227,161,0)'); tr.addColorStop(1, 'rgba(25,227,161,0.3)');
  g.save(); g.beginPath(); g.roundRect(Q2.x - Q2.card / 2, Q2.y - Q2.card / 2, Q2.card, Q2.card, 40); g.clip();
  g.fillStyle = tr; g.fillRect(Q2.x - hw, y - 150, hw * 2, 150);
  g.restore();
  g.globalCompositeOperation = 'lighter';
  glow(g, SPR.mint, Q2.x, y, hw * 1.1, 0.55, 46);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = C.mint; g.fillRect(Q2.x - hw, y - 3, hw * 2, 6);
  g.fillStyle = '#E9FFF6'; g.fillRect(Q2.x - hw + 30, y - 1.2, hw * 2 - 60, 2.4);
  g.restore();
}
function drawBrackets(g, t) {
  if (t < T.scan || t > T.drop + 0.32) return;
  const okP = t - T.ok;
  let m = 40 - 22 * E.outBack(prog(t, T.laser0 - 0.08, T.laser0 + 0.22));
  if (okP > 0) m -= 14 * spring(okP, 2.4, 9);
  const hw = Q2.card / 2 + m, L = 92;
  const out = E.inCubic(prog(t, T.drop, T.drop + 0.3));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 13;
  g.strokeStyle = rgb(mix(RGB.mint, RGB.white, okP > 0 ? Math.exp(-okP * 6) : 0));
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy], i) => {
    const p = prog(t, T.scan + i * 0.035, T.scan + 0.24 + i * 0.035);
    if (p <= 0) return;
    const e = E.outBack(p), far = 760 * (1 - e) + 900 * out;
    const x = Q2.x + sx * (hw + far), y = Q2.y + sy * (hw + far * 0.6);
    g.save(); g.globalAlpha = (1 - out) * Math.min(1, p * 3); g.translate(x, y); g.rotate((1 - E.outCubic(p)) * Math.PI / 2 * sx);
    g.beginPath(); g.moveTo(0, -sy * L); g.lineTo(0, 0); g.lineTo(-sx * L, 0); g.stroke(); g.restore();
  });
  g.restore();
}
const DECODE = [
  { t: T.scan + 0.22, s: 'QR · 25×25 · M', c: C.slate },
  { t: T.laser0, s: '> OKUNUYOR', c: C.white },
  { t: T.laser0 + 0.24, s: 'ID    PRS-0427' },
  { t: T.laser0 + 0.4, s: 'AD    AYŞE YILMAZ' },
  { t: T.laser0 + 0.56, s: 'ŞUBE  MERKEZ OFİS' },
  { t: T.ok, s: '  GİRİŞ 09:00:04', c: C.mint, check: true },
];
function drawScanUI(g, t) {
  const out = E.inCubic(prog(t, T.ok + 0.26, T.drop - 0.02));
  // üst hap: "QR kodu okutun" → "Doğrulandı"
  const pp = E.outBack(prog(t, T.scan + 0.08, T.scan + 0.4));
  if (pp > 0 && out < 1) {
    const ok = t >= T.ok, okk = ok ? E.outCubic(prog(t, T.ok, T.ok + 0.2)) : 0;
    const label = ok ? 'Doğrulandı' : 'QR kodu okutun';
    const o = { f: 'Txt', w: 600, s: 26 };
    const tw = lerp(measure(g, 'QR kodu okutun', o), measure(g, 'Doğrulandı', o), okk);
    const w = tw + 96, h = 58, y = 128 - (1 - pp) * 80 - out * 60;
    g.save(); g.globalAlpha = Math.min(1, pp) * (1 - out);
    g.fillStyle = rgb(mix([255, 255, 255], RGB.mint, okk), lerp(0.1, 1, okk));
    g.beginPath(); g.roundRect(960 - w / 2, y - h / 2, w, h, h / 2); g.fill();
    g.strokeStyle = `rgba(255,255,255,${0.18 * (1 - okk)})`; g.lineWidth = 1.5; g.stroke();
    // ikon: küçük vizör ya da tik
    const ix = 960 - w / 2 + 36;
    if (!ok) {
      g.strokeStyle = C.mint; g.lineWidth = 3; g.lineCap = 'round';
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        g.beginPath(); g.moveTo(ix + sx * 11, y + sy * 5); g.lineTo(ix + sx * 11, y + sy * 11); g.lineTo(ix + sx * 5, y + sy * 11); g.stroke();
      }
    } else checkPath(g, ix, y, 26, 1, 4, C.qink);
    text(g, label, ix + 24, y + 9, { ...o, a: 'left', c: ok ? C.qink : C.white });
    g.restore();
  }
  // sağ panel: kimlik çözümü
  const px = 1452 + out * 120, py = 404;
  g.save(); g.globalAlpha = 1 - out;
  const la = E.outCubic(prog(t, T.scan + 0.15, T.scan + 0.45));
  if (la > 0) { g.fillStyle = `rgba(169,188,255,${0.28 * la})`; g.fillRect(px - 26, py - 34, 2, lerp(0, 6 * 48, la)); }
  DECODE.forEach((d, i) => {
    const p = prog(t, d.t, d.t + 0.36);
    if (p <= 0) return;
    let s = d.s;
    if (i === 1) s = t >= T.ok ? '> OKUNDU' : '> OKUNUYOR' + '.'.repeat(Math.floor((t - d.t) * 8) % 4);
    else s = scramble(d.s, p, t, i);
    const y = py + i * 48;
    g.globalAlpha = (1 - out) * Math.min(1, p * 4);
    mono(g, s, px, y, { s: 21, w: 600, c: d.c || C.paper, a: 'left', cw: 0.68 });
    if (d.check) checkPath(g, px + 9, y - 8, 22, prog(t, T.ok, T.ok + 0.18), 3.5, C.mint);
  });
  g.restore();
  // sol: yakınlaştırma cetveli
  const za = E.outCubic(prog(t, T.scan + 0.2, T.scan + 0.5)) * (1 - out);
  if (za > 0) {
    const x = 452 - out * 120, y0 = 380, y1 = 700, z = qrZoom(t);
    g.save(); g.globalAlpha = za;
    g.fillStyle = 'rgba(169,188,255,0.35)';
    for (let i = 0; i <= 16; i++) { const y = lerp(y0, y1, i / 16), w = i % 4 === 0 ? 18 : 9; g.fillRect(x - w, y - 1, w, 2); }
    const ky = lerp(y1, y0, (z - 1) / 0.1);
    g.fillStyle = C.mint; g.beginPath(); g.roundRect(x + 8, ky - 4, 22, 8, 4); g.fill();
    mono(g, z.toFixed(2) + '×', x + 42, ky + 7, { s: 19, w: 600, c: C.paper, a: 'left' });
    mono(g, 'ODAK', x - 18, y0 - 26, { s: 15, w: 600, c: C.slate, a: 'left' });
    g.restore();
  }
}
function sceneC(g, t) {
  bgDark(g, t, 0, 0.3);
  g.save(); zoomAt(g, qrZoom(t));
  drawQR2D(g, t);
  drawLaser(g, t);
  drawBrackets(g, t);
  // doğrulama anı: kart çevresinde nane rengi parlama
  const k = kick(t - T.ok, 5);
  if (k > 0.01) {
    g.save(); g.globalAlpha = k; g.strokeStyle = C.mint; g.lineWidth = 6 + 10 * (1 - k);
    const s = Q2.card + 30 * (1 - k);
    g.beginPath(); g.roundRect(Q2.x - s / 2, Q2.y - s / 2, s, s, 46); g.stroke(); g.restore();
  }
  g.restore();
  drawScanUI(g, t);
}

/* ───────────────────────── 4. GİRİŞ: telefon açılışı (5.625–7.5) ───────────────────────── */
const PH = { x: 1290, y: 540, w: 380, h: 810, r: 60 };
const KFULL = 110 / 64, CYF = 540 + 190 * KFULL; // tam ekranda onay dairesi tam merkezde
const CHIPS = [
  { ini: 'MK', name: 'Mehmet Kaya', time: '08:58', col: '#7B61FF' },
  { ini: 'ED', name: 'Elif Demir', time: '08:59', col: '#FF8A3D' },
  { ini: 'CT', name: 'Can Tekin', time: '09:00', col: '#00B8D9' },
  { ini: 'ZA', name: 'Zeynep Arslan', time: '09:02', col: '#E5487D', late: true },
];
const CHIP_T = [at(3, 1.5), at(3, 1.75), at(3, 2.0), at(3, 2.25)];
function drawPhoneUI(g, t, pe) {
  const ui = t0 => E.outCubic(prog(t, t0, t0 + 0.34));
  const cy = -190, R = 64;
  // sonar halkaları
  for (let i = 0; i < 3; i++) {
    const t0 = T.drop + 0.4 + i * 0.32, p = prog(t, t0, t0 + 1.0);
    if (p > 0 && p < 1) { g.save(); g.globalAlpha = (1 - p) * 0.55; g.strokeStyle = C.mint; g.lineWidth = 4; g.beginPath(); g.arc(0, cy, R + 56 * E.outCubic(p), 0, TAU); g.stroke(); g.restore(); }
  }
  g.fillStyle = C.mint; g.beginPath(); g.arc(0, cy, R, 0, TAU); g.fill();
  checkPath(g, 0, cy + 2, 64, E.inOutCubic(prog(t, T.drop + 0.26, T.drop + 0.46)), 12, C.white);
  // durum çubuğu + dinamik ada (sadece telefon belirince)
  if (pe > 0.4) {
    const a = prog(pe, 0.4, 0.9);
    g.save(); g.globalAlpha = a;
    text(g, '09:00', -132, -362, { f: 'Txt', w: 600, s: 20, c: C.qink });
    g.fillStyle = C.qink;
    for (let i = 0; i < 4; i++) g.fillRect(96 + i * 7, -368 - i * 3, 5, 6 + i * 3);
    g.beginPath(); g.roundRect(130, -376, 30, 15, 4); g.fill();
    g.fillStyle = '#05070D'; g.beginPath(); g.roundRect(-56, -390, 112, 32, 16); g.fill();
    g.restore();
  }
  let a = ui(6.06);
  if (a > 0) { g.save(); g.globalAlpha = a; text(g, 'QR Personel', 0, -298 + (1 - a) * 20, { f: 'Txt', w: 700, s: 19, ls: 1, c: C.blue }); g.restore(); }
  a = ui(6.1);
  if (a > 0) { g.save(); g.globalAlpha = a; text(g, 'Giriş yapıldı', 0, -62 + (1 - a) * 24, { w: 800, s: 38, c: C.qink }); g.restore(); }
  a = ui(6.18);
  if (a > 0) { g.save(); g.globalAlpha = a; mono(g, scramble('09:00:04', prog(t, 6.18, 6.48), t, 5), 0, 8 + (1 - a) * 24, { s: 52, w: 700, c: C.blue, a: 'center', cw: 0.64 }); g.restore(); }
  a = ui(6.26);
  if (a > 0) {
    g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 30);
    g.fillStyle = C.card; g.beginPath(); g.roundRect(-160, 58, 320, 96, 24); g.fill();
    g.fillStyle = C.blue; g.beginPath(); g.arc(-110, 106, 30, 0, TAU); g.fill();
    text(g, 'AY', -110, 114, { f: 'Txt', w: 700, s: 22, c: C.white });
    text(g, 'Ayşe Yılmaz', -66, 100, { f: 'Txt', w: 700, s: 24, a: 'left', c: C.qink });
    text(g, 'Merkez Ofis', -66, 128, { f: 'Txt', w: 500, s: 18, a: 'left', c: '#6B7799' });
    g.fillStyle = C.mint; g.beginPath(); g.arc(128, 106, 7, 0, TAU); g.fill();
    g.restore();
  }
  a = ui(6.34);
  if (a > 0) {
    g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 30);
    text(g, 'Mesai süresi', 0, 206, { f: 'Txt', w: 500, s: 18, c: '#6B7799' });
    const s = Math.max(0, Math.floor(t - 6.34));
    mono(g, `00:00:${pad2(s)}`, 0, 246, { s: 30, w: 700, c: C.qink, a: 'center', cw: 0.62 });
    g.restore();
  }
  a = ui(6.42);
  if (a > 0) {
    g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 30);
    g.fillStyle = C.qink; g.beginPath(); g.roundRect(-150, 296, 300, 66, 33); g.fill();
    text(g, 'Çıkış yap', 0, 337, { f: 'Txt', w: 700, s: 22, c: C.white });
    g.restore();
  }
  if (pe > 0.6) { g.globalAlpha = prog(pe, 0.6, 1); g.fillStyle = C.qink; g.beginPath(); g.roundRect(-64, 384, 128, 6, 3); g.fill(); g.globalAlpha = 1; }
}
function drawChip(g, ch, x, y, a) {
  const w = 336, h = 86;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.fillStyle = 'rgba(20,31,63,0.94)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.09)'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = ch.col; g.beginPath(); g.arc(-w / 2 + 44, 0, 25, 0, TAU); g.fill();
  text(g, ch.ini, -w / 2 + 44, 7, { f: 'Txt', w: 700, s: 18, c: C.white });
  text(g, ch.name, -w / 2 + 82, -4, { f: 'Txt', w: 600, s: 21, a: 'left', c: C.white });
  text(g, ch.late ? 'Geç giriş' : 'Giriş', -w / 2 + 82, 22, { f: 'Txt', w: 500, s: 16, a: 'left', c: ch.late ? C.coral : C.slate });
  mono(g, ch.time, w / 2 - 22, 9, { s: 24, w: 700, c: ch.late ? C.coral : C.mint, a: 'right', cw: 0.62 });
  g.restore();
}
function sceneD(g, t) {
  const wp = E.inQuint(prog(t, T.whip - 0.38, T.whip)), dx = -2600 * wp;
  bgDark(g, t, dx * 0.5, 0.3);
  g.save(); g.translate(dx, 0);
  const pe = E.inOutQuart(prog(t, T.drop + 0.3, T.drop + 0.8));
  const ex = E.inOutQuart(prog(t, T.drop + 0.29, T.drop + 0.76)), ey = E.inOutQuart(prog(t, T.drop + 0.33, T.drop + 0.82));
  const mx0 = lerp(-80, PH.x - PH.w / 2, ex), mx1 = lerp(W + 80, PH.x + PH.w / 2, ex);
  const my0 = lerp(-80, PH.y - PH.h / 2, ey), my1 = lerp(H + 80, PH.y + PH.h / 2, ey);
  const mr = lerp(0, PH.r, Math.min(ex, ey));
  const k = lerp(KFULL, 1, pe), cxp = lerp(960, PH.x, pe), cyp = lerp(CYF, PH.y, pe);
  // sol başlık
  slotText(g, 'Okut.', 170, 520, { s: 200, w: 900, a: 'left', cf: i => i === 4 ? C.mint : C.white }, prog(t, T.okut, T.okut + 0.5), 0, 0.05);
  slotText(g, 'Mesaine başla.', 176, 640, { s: 84, w: 800, a: 'left', c: C.blueXL, cf: i => i === 13 ? C.mint : C.blueXL }, prog(t, T.basla, T.basla + 0.5), 0, 0.03);
  // telefonun arkasından kayan giriş bildirimleri
  CHIPS.forEach((ch, i) => {
    const p = prog(t, CHIP_T[i], CHIP_T[i] + 0.42);
    if (p > 0) drawChip(g, ch, lerp(PH.x, 1688, E.outBackSoft(p)), 330 + i * 102, Math.min(1, p * 3));
  });
  // telefon grubu: hafif salınım
  const sw = prog(t, 6.4, 6.9), rotP = 0.028 * Math.sin((t - 6.4) * 2.4) * sw, fy = 7 * Math.sin((t - 6.4) * 1.9) * sw;
  g.save(); g.translate(PH.x, PH.y + fy); g.rotate(rotP); g.translate(-PH.x, -PH.y);
  if (ex > 0.3) {
    const a = prog(ex, 0.3, 0.8);
    g.save(); g.globalAlpha = a;
    glow(g, SPR.blue, (mx0 + mx1) / 2, (my0 + my1) / 2 + 40, (mx1 - mx0) * 1.3, 0.55, (my1 - my0) * 0.8);
    g.fillStyle = '#0A1022'; g.beginPath(); g.roundRect(mx0 - 15, my0 - 15, mx1 - mx0 + 30, my1 - my0 + 30, mr + 15); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#1B2547';
    g.beginPath(); g.roundRect(mx1 + 13, my0 + 190, 5, 90, 2); g.fill();
    g.beginPath(); g.roundRect(mx0 - 18, my0 + 150, 5, 60, 2); g.fill();
    g.beginPath(); g.roundRect(mx0 - 18, my0 + 230, 5, 60, 2); g.fill();
    g.restore();
  }
  // beyaz taşma (önce daire, sonra telefon ekranı maskesi)
  g.fillStyle = C.white;
  if (t < T.drop + 0.29) {
    const R = 1200 * E.inQuad(prog(t, T.drop + 0.04, T.drop + 0.29));
    if (R > 0) { g.beginPath(); g.arc(960, 540, R, 0, TAU); g.fill(); }
  } else { g.beginPath(); g.roundRect(mx0, my0, mx1 - mx0, my1 - my0, mr); g.fill(); }
  if (t < T.drop + 0.27) {
    g.save(); zoomAt(g, qrZoom(t)); drawQR2D(g, t); drawBrackets(g, t); g.restore();
  } else {
    g.save(); g.beginPath(); g.roundRect(mx0, my0, mx1 - mx0, my1 - my0, mr); g.clip();
    g.translate(cxp, cyp); g.scale(k, k); drawPhoneUI(g, t, pe);
    g.restore();
    g.save(); zoomAt(g, qrZoom(t)); drawBrackets(g, t); g.restore();
  }
  g.restore();
  shock(g, 960, 540, 220, 220, 900, t, T.drop, 0.6, C.mint, 8, Math.PI / 4);
  shock(g, 960, 540, 220, 220, 1500, t, T.drop + 0.06, 0.8, C.blueL, 4);
  g.restore();
}

/* ───────────────────────── 5. VERİ: 3B QR şehri → grafik (7.5–11.25) ───────────────────────── */
function hField(m) {
  if (m.eye >= 0) {
    const [er, ec] = EYE_C[m.eye];
    return Math.max(Math.abs(m.r - er), Math.abs(m.c - ec)) <= 1 ? 4.6 : 1.5;
  }
  const n = 0.5 + 0.5 * Math.sin(m.c * 0.47 + 0.6) * Math.cos(m.r * 0.39 - 1.1);
  return 0.45 + 6.4 * Math.pow(0.55 * n + 0.45 * hash(m.r * 31 + 7, m.c), 2.3);
}
const BAR_H = [3, 6, 10, 15, 11, 5, 3]; // giriş saatine göre kişi sayısı (toplam 53)
const BAR_LBL = ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30'];
const BAR_X = k => (k - 3) * 4;
let COLS = [];
function buildCols() {
  const slots = [];
  BAR_H.forEach((h, k) => { for (let sx = 0; sx < 3; sx++) for (let l = 0; l < h; l++) for (let sz = 0; sz < 2; sz++) slots.push({ k, x: BAR_X(k) + sx - 1, y: l, z: sz - 0.5 }); });
  slots.sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
  const cols = DARK.map(m => ({ ...m, x: m.c - QM, z: m.r - QM, h: hField(m) })).sort((a, b) => a.x - b.x || a.z - b.z);
  const R = mulberry32(7);
  COLS = cols.map((m, i) => {
    const s = slots[i] || null;
    const hc = clamp(m.h / 6.5);
    return {
      ...m, ts: T.whip + 0.14 + 0.62 * (m.r + m.c) / (2 * (QN - 1)), slot: s,
      d: T.sort + 0.03 + (s ? 0.3 * s.y / 15 : 0) + 0.14 * R(), dur: 0.56 + 0.1 * R(),
      col: hc < 0.5 ? mix(RGB.blue, RGB.cyan, hc * 2) : mix(RGB.cyan, RGB.mint, (hc - 0.5) * 2),
      tcol: s ? (s.k >= 5 ? RGB.coral : RGB.blue) : RGB.blue,
    };
  });
}
function makeCam(tx, ty, tz, D, pitch, yaw, f, cx, cy) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cw = Math.cos(yaw), sw = Math.sin(yaw);
  const back = [cp * sw, sp, cp * cw], right = [cw, 0, -sw];
  const up = [back[1] * right[2] - back[2] * right[1], back[2] * right[0] - back[0] * right[2], back[0] * right[1] - back[1] * right[0]];
  return { px: tx + D * back[0], py: ty + D * back[1], pz: tz + D * back[2], back, right, up, f, cx, cy };
}
function proj(c, x, y, z) {
  const dx = x - c.px, dy = y - c.py, dz = z - c.pz;
  const xc = dx * c.right[0] + dz * c.right[2];
  const yc = dx * c.up[0] + dy * c.up[1] + dz * c.up[2];
  const zc = -(dx * c.back[0] + dy * c.back[1] + dz * c.back[2]);
  return [c.cx + c.f * xc / zc, c.cy - c.f * yc / zc, zc];
}
function camState(t) {
  const a = E.inOutCubic(prog(t, T.whip, T.whip + 1.1));
  const b = E.inOutSine(prog(t, T.whip + 0.6, T.sort + 0.3));
  const c = E.inOutCubic(prog(t, T.sort + 0.08, T.answer + 0.02));
  return { a, b, c };
}
function camAt(t) {
  const { a, b, c } = camState(t), deg = Math.PI / 180;
  const pitch = lerp(lerp(89.4, 33, a) + 6 * b, 0, c) * deg;
  const yaw = lerp(lerp(0, -36, a) - 12 * b, 0, c) * deg;
  const D = 64 * (1 + 8 * E.inQuad(c)); // dolly-zoom: uzaklaşırken odak büyür → perspektif düzleşir
  const ppu = lerp(lerp(30, 25, a) + 1.5 * b, 34, c);
  return makeCam(0, lerp(lerp(0, 1.4, a), 7.5, c), 0, D, pitch, yaw, ppu * D, lerp(1240, 1290, c), lerp(lerp(540, 610, a), 585, c));
}
const SHADE = { top: 1, px: 0.56, nx: 0.8, pz: 0.68, nz: 0.5 };
function drawBox(g, cam, x, z, y0, h, hw, hd, col, flat, al) {
  const x0 = x - hw, x1 = x + hw, z0 = z - hd, z1 = z + hd, y1 = y0 + h;
  const P = (X, Y, Z) => proj(cam, X, Y, Z);
  const fill = (pts, sh, edge) => {
    const s = lerp(sh, 1, flat), lift = sh === 1 ? 0.14 * (1 - flat) : 0;
    g.fillStyle = rgb(mix(col.map(v => v * s), [255, 255, 255], lift), al);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < 4; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath(); g.fill();
    if (edge) { g.strokeStyle = `rgba(255,255,255,${0.22 * al * (1 - flat)})`; g.lineWidth = 1; g.stroke(); }
  };
  if (cam.pz < z0) fill([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)], SHADE.nz);
  if (cam.px < x0) fill([P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)], SHADE.nx);
  if (cam.px > x1) fill([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], SHADE.px);
  if (cam.pz > z1) fill([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], SHADE.pz);
  if (cam.py > y1) fill([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], SHADE.top, true);
}
const DUST = (() => { const R = mulberry32(99); return Array.from({ length: 70 }, () => [R() * 40 - 20, R() * 14, R() * 40 - 20, R()]); })();
function drawCity(g, t) {
  const cam = camAt(t), { c } = camState(t);
  // zemin ızgarası + şehrin altındaki ışık
  const ga = 0.09 * (1 - c);
  const gc = proj(cam, 0, 0, 0);
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = cam.f / gc[2] * 26;
  glow(g, SPR.blue, gc[0], gc[1], gr, 0.5 * (1 - c), gr * Math.max(0.3, cam.back[1]));
  g.restore();
  if (ga > 0.003) {
    g.strokeStyle = `rgba(169,188,255,${ga})`; g.lineWidth = 1;
    g.beginPath();
    for (let i = -18; i <= 18; i += 1) {
      const a1 = proj(cam, i - 0.5, 0, -18.5), a2 = proj(cam, i - 0.5, 0, 18.5), b1 = proj(cam, -18.5, 0, i - 0.5), b2 = proj(cam, 18.5, 0, i - 0.5);
      g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]);
    }
    g.stroke();
  }
  // sütunlar / küpler
  const list = [];
  for (const m of COLS) {
    let x = m.x, z = m.z, y0 = 0, h, hw = 0.43, hd = 0.43, col = m.col, al = 1;
    const rise = E.outBack(prog(t, m.ts, m.ts + 0.5));
    h = Math.max(0.035, m.h * rise);
    if (t > m.d) {
      const p = prog(t, m.d, m.d + m.dur), e = E.inOutCubic(p);
      if (m.slot) {
        x = lerp(m.x, m.slot.x, e); z = lerp(m.z, m.slot.z, e);
        y0 = lerp(0, m.slot.y + 0.05, e) + 3.2 * Math.sin(Math.PI * e);
        h = lerp(h, 0.9, e); hw = lerp(0.43, 0.45, e); hd = lerp(0.43, 0.45, e);
        col = mix(m.col, m.tcol, E.inOutCubic(prog(t, m.d + m.dur * 0.3, m.d + m.dur)));
      } else { h *= 1 - e; al = 1 - e; }
      // yerine oturma sıçraması
      const land = t - m.d - m.dur; if (land > 0 && m.slot) y0 += 0.25 * Math.exp(-land * 12) * Math.sin(land * 30);
    }
    if (al <= 0.01 || h <= 0.002) continue;
    const dx = x - cam.px, dy = y0 + h / 2 - cam.py, dz = z - cam.pz;
    list.push({ x, z, y0, h, hw, hd, col, al, d: dx * dx + dy * dy + dz * dz });
  }
  list.sort((a, b) => b.d - a.d);
  for (const b of list) drawBox(g, cam, b.x, b.z, b.y0, b.h, b.hw, b.hd, b.col, c, b.al);
  // yükselen toz
  g.fillStyle = C.blueXL;
  for (const [x, y0, z, ph] of DUST) {
    const y = (y0 + t * 0.9 + ph * 3) % 14, p = proj(cam, x, y, z);
    if (p[2] < 1) continue;
    const s = cam.f / p[2] * 0.09;
    g.globalAlpha = 0.35 * (1 - c) * Math.sin(Math.PI * y / 14);
    g.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
  }
  g.globalAlpha = 1;
  return cam;
}
function drawChartUI(g, t, cam) {
  const p0 = T.answer - 0.02;
  if (t < p0) return;
  const base = proj(cam, 0, 0, 0)[1], X = x => proj(cam, x, 0, 0)[0], Y = y => proj(cam, 0, y, 0)[1];
  const L = X(-13.5) - 10, R = X(13.5) + 10;
  // taban çizgisi ve yatay ızgara
  const lp = E.outCubic(prog(t, p0, p0 + 0.4));
  g.fillStyle = 'rgba(169,188,255,0.5)'; g.fillRect(L, base + 3, (R - L) * lp, 2);
  [5, 10, 15].forEach((v, i) => {
    const q = E.outCubic(prog(t, p0 + 0.05 + i * 0.05, p0 + 0.45 + i * 0.05));
    if (q <= 0) return;
    g.fillStyle = 'rgba(169,188,255,0.12)';
    const y = Y(v) - 2;
    for (let x = L; x < L + (R - L) * q; x += 14) g.fillRect(x, y, 7, 1.5);
    mono(g, String(v), L - 16, y + 6, { s: 16, w: 600, c: rgb(RGB.slate, q), a: 'right' });
  });
  // saat etiketleri
  BAR_LBL.forEach((s, k) => {
    const q = E.outBack(prog(t, p0 + 0.06 + k * 0.035, p0 + 0.36 + k * 0.035));
    if (q <= 0) return;
    g.save(); g.globalAlpha = Math.min(1, q);
    mono(g, s, X(BAR_X(k)), base + 44 + (1 - q) * 16, { s: 19, w: 600, c: k >= 5 ? C.coral : C.slate, a: 'center', cw: 0.64 });
    g.restore();
  });
  // 09:00 mesai çizgisi
  const mp = E.inOutCubic(prog(t, p0 + 0.12, p0 + 0.5)), mx = X((BAR_X(4) + BAR_X(5)) / 2);
  if (mp > 0) {
    const yTop = Y(17.2);
    g.fillStyle = C.mint;
    for (let y = base; y > lerp(base, yTop, mp); y -= 16) g.fillRect(mx - 1.5, y - 9, 3, 9);
    const q = E.outBack(prog(t, p0 + 0.4, p0 + 0.7));
    if (q > 0) {
      g.save(); g.translate(mx, yTop - 22); g.scale(q, q);
      g.fillStyle = C.mint; g.beginPath(); g.roundRect(-74, -20, 148, 40, 20); g.fill();
      text(g, '09:00 mesai', 0, 7, { f: 'Txt', w: 700, s: 18, c: C.qink });
      g.restore();
    }
  }
  // başlık + rozetler
  const ta = prog(t, p0 + 0.1, p0 + 0.6);
  slotText(g, 'Giriş saatleri', L, Y(17.2) - 20, { s: 40, w: 800, a: 'left', c: C.white }, ta, 0, 0.03);
  const sub = E.outCubic(prog(t, p0 + 0.3, p0 + 0.6));
  if (sub > 0) text(g, 'Bugün · 53 personel', L, Y(17.2) + 18, { f: 'Txt', w: 500, s: 20, a: 'left', c: rgb(RGB.slate, sub) });
  const bq = E.outBack(prog(t, p0 + 0.5, p0 + 0.78));
  if (bq > 0) {
    g.save(); g.translate(R - 70, Y(17.2) - 32); g.scale(bq, bq);
    g.fillStyle = 'rgba(255,92,108,0.16)'; g.beginPath(); g.roundRect(-70, -22, 140, 44, 22); g.fill();
    g.fillStyle = C.coral; g.beginPath(); g.arc(-44, 0, 6, 0, TAU); g.fill();
    text(g, '8 geç', 8, 8, { f: 'Txt', w: 700, s: 21, c: C.coral });
    g.restore();
  }
}
function sceneE(g, t) {
  const wp = 1 - E.outQuint(prog(t, T.whip, T.whip + 0.38)), dx = 2600 * wp;
  bgDark(g, t, dx * 0.5, 0.22);
  g.save(); g.translate(dx, 0);
  const cam = drawCity(g, t);
  drawChartUI(g, t, cam);
  g.restore();
  // sol: sorular → cevap
  const o = { s: 92, w: 900, a: 'left' };
  const qs = ['Kim geldi?', 'Kim çıktı?', 'Kim geç kaldı?'];
  qs.forEach((s, i) => {
    const oo = fit(g, s, o, 590);
    slotText(g, s, 120, 404 + i * 112, { ...oo, cf: j => (i === 2 && j >= 4 && j < 13) ? C.coral : C.white },
      prog(t, T.q[i], T.q[i] + 0.5), prog(t, T.answer - 0.26 + i * 0.04, T.answer + 0.02 + i * 0.04), 0.035);
  });
  const o2 = fit(g, 'tek ekranda.', { s: 112, w: 900, a: 'left' }, 640);
  slotText(g, 'Hepsi', 120, 470, { ...o2, c: C.white }, prog(t, T.answer, T.answer + 0.5), 0, 0.04);
  slotText(g, 'tek ekranda.', 120, 470 + o2.s * 1.08, { ...o2, cf: () => C.mint }, prog(t, T.answer + 0.08, T.answer + 0.58), 0, 0.03);
  // marka geçişi: dönen iki kare (nane, sonra mavi) ekranı kaplar
  [[C.mint, T.wipe - 0.34, T.wipe - 0.06], [C.blue, T.wipe - 0.27, T.wipe]].forEach(([col, a, b], i) => {
    const p = prog(t, a, b);
    if (p <= 0) return;
    const e = E.inExpo(p), s = lerp(0, 3200, e);
    g.save(); g.translate(960, 540); g.rotate((1 - E.outCubic(p)) * Math.PI * (i ? 0.5 : -0.5) + Math.PI / 4 * (1 - e));
    g.fillStyle = col; g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, s * 0.14); g.fill(); g.restore();
  });
}

/* ───────────────────────── 6. MARKA (11.25–15) ───────────────────────── */
const LK = {};
function lockupLayout(g) {
  LK.ms = 272; LK.gap = 58; LK.ww = measure(g, 'QR Personel', { w: 800, s: 132 });
  const total = LK.ms + LK.gap + LK.ww;
  LK.left = 960 - total / 2; LK.total = total;
  LK.mx = LK.left + LK.ms / 2; LK.my = 452;
  LK.wx = LK.left + LK.ms + LK.gap; LK.wy = LK.my + 132 * 0.36;
}
// Logo işareti: beyaz kare içinde üç QR gözü + dördüncü köşede "personel" (kişi) karosu
function drawMark(g, x, y, S, st) {
  g.save(); g.translate(x, y);
  g.save(); g.scale(st.cs, st.cs); g.rotate(st.cr);
  g.save(); g.shadowColor = 'rgba(8,20,90,0.45)'; g.shadowBlur = 50; g.shadowOffsetY = 22;
  g.fillStyle = C.white; g.beginPath(); g.roundRect(-S / 2, -S / 2, S, S, S * 0.26); g.fill(); g.restore();
  g.restore();
  const o = S * 0.215, es = S * 0.34;
  st.eyes.forEach((e, i) => {
    if (e.a <= 0) return;
    const [sx, sy] = [[-1, -1], [1, -1], [-1, 1]][i];
    g.save(); g.globalAlpha *= e.a; g.translate(sx * o + e.dx, sy * o + e.dy); g.rotate(e.rot); g.scale(e.k, e.k);
    g.fillStyle = C.blue;
    const R = es / 2, th = S * 0.068, rin = es * 0.19;
    g.beginPath(); g.roundRect(-R, -R, 2 * R, 2 * R, R * 0.56); g.roundRect(-R + th, -R + th, 2 * (R - th), 2 * (R - th), (R - th) * 0.5); g.fill('evenodd');
    g.beginPath(); g.roundRect(-rin, -rin, 2 * rin, 2 * rin, rin * 0.5); g.fill();
    g.restore();
  });
  if (st.tile > 0) {
    g.save(); g.translate(o, o);
    g.save(); g.scale(st.tile, st.tile);
    const R = es / 2;
    g.fillStyle = C.mint; g.beginPath(); g.roundRect(-R, -R, 2 * R, 2 * R, R * 0.56); g.fill();
    g.beginPath(); g.roundRect(-R, -R, 2 * R, 2 * R, R * 0.56); g.clip();
    g.fillStyle = C.white;
    g.save(); g.scale(st.body, st.body); g.beginPath(); g.arc(0, R * 0.98, R * 0.62, Math.PI, 0); g.fill(); g.restore();
    g.beginPath(); g.arc(0, -R * 0.2 + st.head, R * 0.3, 0, TAU); g.fill();
    g.restore(); g.restore();
  }
  g.restore();
}
function markState(t) {
  const dt = t - T.wipe;
  const st = { cs: spring(dt, 1.5, 6.5), cr: (1 - spring(dt, 1.2, 6)) * -Math.PI / 2, eyes: [], tile: 0, head: 0, body: 0 };
  T.leyes.forEach((te, i) => {
    const p = prog(t, te - 0.3, te), [sx, sy] = [[-1, -1], [1, -1], [-1, 1]][i];
    if (p <= 0) { st.eyes.push({ a: 0 }); return; }
    if (t < te) {
      const e = E.inQuart(p);
      st.eyes.push({ a: Math.min(1, p * 2.5), dx: sx * 1150 * (1 - e), dy: sy * 760 * (1 - e), rot: (1 - E.outCubic(p)) * Math.PI * (i === 1 ? -1 : 1), k: lerp(1.9, 1, E.inQuad(p)) });
    } else {
      const d = t - te;
      st.eyes.push({ a: 1, dx: 0, dy: 0, rot: 0, k: 1 - 0.14 * Math.exp(-d * 11) * Math.cos(d * TAU * 3.2) });
      st.cs *= 1 - 0.04 * kick(d, 9);
    }
  });
  st.tile = E.outBack(prog(t, T.person, T.person + 0.26));
  st.head = -(1 - spring(t - T.person - 0.05, 2, 8)) * 70;
  st.body = E.outBack(prog(t, T.person + 0.03, T.person + 0.3));
  if (t < T.person + 0.05) st.head = -999;
  return st;
}
const QR_BG = DARK.map(m => [m.c - QM, m.r - QM, m.eye]);
function bgBlue(g, t) {
  const gr = g.createRadialGradient(960, 420, 60, 960, 540, 1250);
  gr.addColorStop(0, '#4A74FF'); gr.addColorStop(0.55, C.blue); gr.addColorStop(1, '#1530B8');
  g.fillStyle = gr; g.fillRect(-80, -80, W + 160, H + 160);
  // dev, soluk QR dokusu
  g.save(); g.translate(960 + (t - T.wipe) * 14, 540); g.rotate(-0.2 + (t - T.wipe) * 0.01);
  g.fillStyle = 'rgba(255,255,255,0.045)';
  const u = 64;
  for (const [x, y] of QR_BG) { g.beginPath(); g.roundRect(x * u - u * 0.43, y * u - u * 0.43, u * 0.86, u * 0.86, u * 0.2); g.fill(); }
  g.restore();
}
function sceneF(g, t) {
  bgBlue(g, t);
  const push = 1 + 0.03 * E.outSine(prog(t, T.final, DUR));
  g.save(); zoomAt(g, push, 960, 520);
  const st = markState(t);
  const slide = E.inOutCubic(prog(t, T.slide, T.slide + 0.42));
  const mxp = lerp(960, LK.mx, slide), myp = lerp(510, LK.my, slide), MS = LK.ms * lerp(1.45, 1, slide);
  // logo + yazı: parlama için ayrı katmanda çizilir
  const L = SPR.layer, lg = SPR.layerCtx;
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H);
  lg.setTransform(g.getTransform());
  // kelime işareti işaretin arkasından kayarak çıkar
  const edge = mxp + MS / 2 * st.cs + 4;
  lg.save(); lg.beginPath(); lg.rect(edge, 0, W * 2, H); lg.clip();
  const word = 'QR Personel';
  letters(lg, word, LK.wx, LK.wy, { w: 800, s: 132, a: 'left', c: C.white }, (i) => {
    const d = T.slide + 0.08 + i * 0.028, p = prog(t, d, d + 0.42);
    return { dx: -(1 - E.outExpo(p)) * 220, al: Math.min(1, p * 2.2), c: C.white };
  });
  lg.restore();
  drawMark(lg, mxp, myp, MS, st);
  // finalde parlama
  const sp = prog(t, T.final + 0.02, T.final + 0.6);
  if (sp > 0 && sp < 1) {
    lg.save(); lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-atop';
    const sx = lerp(LK.left - 300, LK.left + LK.total + 300, E.inOutCubic(sp));
    const gr = lg.createLinearGradient(sx - 110, 0, sx + 110, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(210,255,240,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    lg.translate(sx, 0); lg.transform(1, 0, -0.35, 1, 0, 0); lg.translate(-sx, 0);
    lg.fillStyle = gr; lg.fillRect(sx - 140, 0, 280, H);
    lg.restore();
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(L, 0, 0); g.restore();
  // final darbesi
  shock(g, mxp, LK.my, LK.ms, LK.ms, 520, t, T.final, 0.7, 'rgba(255,255,255,0.9)', 6);
  shock(g, mxp, LK.my, LK.ms, LK.ms, 900, t, T.final + 0.06, 0.9, C.mint, 3);
  for (let i = 0; i < 3; i++) shock(g, mxp + [-1, 1, -1][i] * MS * 0.215, myp + [-1, -1, 1][i] * MS * 0.215, MS * 0.34, MS * 0.34, 130, t, T.leyes[i], 0.4, 'rgba(255,255,255,0.8)', 4);
  drawBurst(g, SPR.burstFinal, t);
  // slogan
  slotText(g, 'QR kodla personel takibi', LK.wx + 4, LK.wy + 88, { f: 'Txt', w: 600, s: 40, a: 'left', c: 'rgba(255,255,255,0.86)' },
    prog(t, T.final + 0.08, T.final + 0.6), 0, 0.02);
  // adres hapı: harf harf yazılır
  const url = 'www.qrpersonel.com';
  const up = E.outBack(prog(t, T.final + 0.22, T.final + 0.5));
  if (up > 0) {
    const n = Math.floor(clamp((t - T.final - 0.3) / 0.034, 0, url.length));
    const o = { w: 700, s: 38 };
    const tw = Math.max(measure(g, url.slice(0, n), o), 6), w = tw + 108, h = 76, y = 744;
    g.save(); g.translate(960, y); g.scale(up, up);
    g.fillStyle = C.white; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
    g.fillStyle = C.mint; g.beginPath(); g.arc(-w / 2 + 34, 0, 9, 0, TAU); g.fill();
    text(g, url.slice(0, n), -w / 2 + 58, 13, { ...o, a: 'left', c: C.blueD });
    if (Math.floor((t - T.final) * 2.2) % 2 === 0 || n < url.length) { g.fillStyle = C.blue; g.fillRect(-w / 2 + 62 + tw, -20, 3.5, 40); }
    g.restore();
  }
  g.restore();
  // final flaşı
  const fl = kick(t - T.final, 7) * 0.45 + kick(t - T.wipe, 9) * 0.25;
  if (fl > 0.003) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(-80, -80, W + 160, H + 160); }
}

/* ───────────────────────── kamera sarsıntısı, kromatik sapma, HUD ───────────────────────── */
const IMPACTS = [[T.nine, 18], [T.eyes[0], 5], [T.eyes[1], 5], [T.eyes[2], 7], [T.ok, 6], [T.drop, 24], [T.okut, 8], [T.whip, 10],
  [T.sort, 6], [T.answer, 6], [T.wipe, 10], [T.leyes[0], 7], [T.leyes[1], 7], [T.leyes[2], 9], [T.final, 18]];
function shake(t) {
  let x = 0, y = 0;
  IMPACTS.forEach(([t0, a], i) => {
    const dt = t - t0; if (dt < 0 || dt > 0.6) return;
    const k = a * Math.exp(-dt * 11);
    x += k * Math.sin(dt * 83 + i * 1.7); y += k * Math.cos(dt * 71 + i * 2.3);
  });
  return [x, y];
}
const CA_HITS = [[T.nine, 1], [T.drop, 1], [T.whip, 0.9], [T.wipe, 0.6], [T.final, 0.9]];
function caAmount(t) {
  let a = 0;
  for (const [t0, s] of CA_HITS) a += s * kick(t - t0, 8);
  a += 0.8 * E.inQuad(prog(t, T.whip - 0.3, T.whip)) * (t < T.whip ? 1 : 0);
  return a * 16;
}
const CHAPTERS = [[0, '01  ZAMAN'], [T.nine, '02  PİKSEL'], [T.scan, '03  OKUT'], [T.drop, '04  GİRİŞ'], [T.whip, '05  VERİ']];
function hud(g, t, f) {
  const a = E.outCubic(prog(t, 0.15, 0.55)) * (1 - E.inCubic(prog(t, T.wipe - 0.4, T.wipe - 0.1)));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2;
  const m = 36, L = 26;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();
  }
  const o = { s: 15, w: 600, c: 'rgba(255,255,255,0.66)' };
  mono(g, 'QRPERSONEL.COM', 74, 61, { ...o, a: 'left' });
  mono(g, `00:00:${pad2(Math.floor(f / FPS))}:${pad2(f % FPS)}`, W - 74, 61, { ...o, a: 'right' });
  g.fillStyle = C.coral; g.globalAlpha = a * (Math.floor(t * 2) % 2 ? 0.35 : 1);
  g.beginPath(); g.arc(W - 74 - 11 * 0.66 * 15 - 16, 56, 5, 0, TAU); g.fill();
  g.globalAlpha = a;
  let ci = 0; while (ci + 1 < CHAPTERS.length && CHAPTERS[ci + 1][0] <= t) ci++;
  const [ct, cs] = CHAPTERS[ci];
  mono(g, scramble(cs, prog(t, ct, ct + 0.3), t, ci), 74, H - 50, { ...o, a: 'left' });
  mono(g, '1920×1080 · 60 FPS · 128 BPM', W - 74, H - 50, { ...o, a: 'right' });
  // ilerleme çubuğu
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(74, H - 34, W - 148, 2);
  g.fillStyle = C.mint; g.fillRect(74, H - 34, (W - 148) * t / DUR, 2);
  g.restore();
}

/* ───────────────────────── ana çizim ───────────────────────── */
function draw(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const [sx, sy] = shake(t);
  g.translate(sx, sy);
  if (t < T.scan) sceneAB(g, t);
  else if (t < T.drop) sceneC(g, t);
  else if (t < T.whip) sceneD(g, t);
  else if (t < T.wipe) sceneE(g, t);
  else sceneF(g, t);
}
// Hızlı hareketlerde daha çok alt-örnek: kamçı geçişinde 24'e kadar
function samplesAt(t) {
  if (t > T.whip - 0.3 && t < T.whip + 0.4) return 24;
  if (t > T.wipe - 0.35 && t < T.wipe + 0.05) return 14;
  if ((t > T.fly && t < T.card0) || (t > T.wipe + 0.2 && t < T.leyes[2] + 0.05) || (t > T.drop - 0.02 && t < T.drop + 0.85)) return 10;
  return 6;
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  const pan = x => +clamp((x - 960) / 960, -1, 1).toFixed(3);
  // 01 saat: piksel açılışı, saniye tıkları, elde zinciri, darbe
  for (let i = 0; i < 7; i++) cue(0.03 + i * 0.045, 'blip', { pitch: 1 + i * 0.09, gain: 0.12, pan: (i % 2 ? 0.4 : -0.4) });
  T.tick.forEach((t, i) => cue(t, 'tick', { pitch: i % 2 ? 1.0 : 1.35, gain: 0.55 }));
  T.carry.slice(0, 4).forEach((t, i) => cue(t, 'click', { pitch: 1 + i * 0.18, gain: 0.5, pan: pan(ckPos([7, 6, 4, 3][i], 3, 2)[0]) }));
  cue(T.tick[3] + 0.05, 'riser', { dur: T.nine - T.tick[3] - 0.05, gain: 0.5 });
  cue(T.nine, 'impact', { gain: 1.0 }); cue(T.nine, 'glitch', { dur: 0.16, gain: 0.45 });
  cue(T.nine + 0.03, 'shimmer', { dur: 0.5, gain: 0.3 });
  cue(T.nine + 0.05, 'whoosh', { dur: 0.3, f0: 600, f1: 3000, gain: 0.22 });
  // 02 pikseller uçar: kalkış süpürmesi, iniş tıkları, gözler
  cue(T.fly - 0.02, 'whoosh', { dur: 0.75, f0: 400, f1: 7000, gain: 0.5 });
  cue(T.fly, 'sparkle', { dur: 0.9, gain: 0.3 });
  const lands = FLY.map(m => [m.d + m.dur, m.x]).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < lands.length; i += 12) cue(lands[i][0], 'tick', { pitch: 1.6 + (i / lands.length) * 0.8, gain: 0.16, pan: pan(lands[i][1]) * 0.6 });
  T.eyes.forEach((t, i) => { cue(t, 'thud', { gain: 0.8, pan: pan(qx(EYE_C[i][1])) * 0.5 }); cue(t, 'pop', { pitch: 0.8 + i * 0.25, gain: 0.45, pan: pan(qx(EYE_C[i][1])) * 0.5 }); });
  cue(T.card0, 'sweep', { dur: T.card1 - T.card0, gain: 0.3 });
  cue(T.scan - 0.42, 'reverse', { dur: 0.42, gain: 0.45 });
  // 03 okut: vizör, lazer, kod çözümü, onay bip'i
  cue(T.scan, 'impact', { gain: 0.55 });
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx], i) => cue(T.scan + 0.17 + i * 0.035, 'click', { pitch: 1.2 + i * 0.1, gain: 0.45, pan: sx * 0.45 }));
  cue(T.scan + 0.1, 'pop', { pitch: 1.3, gain: 0.3 });
  cue(T.laser0 - 0.04, 'laser', { dur: T.laser1 - T.laser0 + 0.12, gain: 0.32 });
  DECODE.slice(2, 5).forEach(d => { for (let k = 0; k < 8; k++) cue(d.t + k * 0.04, 'blip', { pitch: 1.6 + hash(k, d.t) * 0.8, gain: 0.07, pan: 0.6 }); });
  cue(T.ok, 'beep', { gain: 0.55 }); cue(T.ok + 0.02, 'success', { gain: 0.35 });
  cue(T.drop - 0.36, 'reverse', { dur: 0.36, gain: 0.5 });
  // 04 giriş: çöküş, taşma, geri çekilme, başlık, bildirimler
  cue(T.drop, 'impact', { gain: 1.0, big: true }); cue(T.drop, 'glitch', { dur: 0.12, gain: 0.35 });
  cue(T.drop + 0.05, 'sweep', { dur: 0.3, gain: 0.25 });
  cue(T.drop + 0.27, 'zip', { dur: 0.2, gain: 0.35 });
  cue(T.drop + 0.3, 'whoosh', { dur: 0.5, f0: 5000, f1: 400, gain: 0.45 });
  cue(T.okut, 'slam', { gain: 0.8 });
  cue(T.basla, 'thump', { gain: 0.6 }); cue(T.basla + 0.02, 'whoosh', { dur: 0.25, f0: 1500, f1: 5000, gain: 0.18 });
  [6.1, 6.18, 6.26, 6.34, 6.42].forEach((t, i) => cue(t, 'blip', { pitch: 1.2 + i * 0.1, gain: 0.14, pan: pan(PH.x) }));
  CHIP_T.forEach((t, i) => cue(t + 0.05, 'coin', { pitch: CHIPS[i].late ? 0.7 : 1 + i * 0.122, gain: 0.32, pan: 0.7 }));
  // kamçı geçişi
  cue(T.whip - 0.4, 'whoosh', { dur: 0.62, f0: 300, f1: 9000, gain: 0.85 });
  cue(T.whip, 'impact', { gain: 0.6 });
  // 05 veri: sütunlar yükselir, sorular, küpler dizilir, cevap
  const rises = COLS.map(m => [m.ts, proj(camAt(m.ts), m.x, 0, m.z)[0]]).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < rises.length; i += 14) cue(rises[i][0] + 0.05, 'blip', { pitch: 0.7 + 1.3 * i / rises.length, gain: 0.12, pan: pan(rises[i][1]) * 0.7 });
  cue(T.whip + 0.12, 'sweep', { dur: 0.9, gain: 0.22 });
  T.q.forEach((t, i) => { cue(t, 'thump', { gain: 0.55 }); cue(t, 'whoosh', { dur: 0.22, f0: 1200, f1: 4500, gain: 0.16, pan: -0.5 }); });
  cue(T.sort - 0.05, 'whoosh', { dur: 0.7, f0: 300, f1: 6000, gain: 0.45 });
  const stacks = COLS.filter(m => m.slot).map(m => [m.d + m.dur, m.slot.x]).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < stacks.length; i += 16) cue(stacks[i][0], 'tick', { pitch: 0.9 + 0.8 * i / stacks.length, gain: 0.2, pan: +(stacks[i][1] / 18).toFixed(3) });
  cue(T.answer, 'slam', { gain: 0.75 }); cue(T.answer + 0.02, 'shimmer', { dur: 0.5, gain: 0.22 });
  BAR_LBL.forEach((_, k) => cue(T.answer + 0.06 + k * 0.035, 'blip', { pitch: 1.4 + k * 0.06, gain: 0.07, pan: +(BAR_X(k) / 18).toFixed(3) }));
  cue(T.answer + 0.4, 'pop', { pitch: 1.4, gain: 0.3, pan: 0.3 });
  // marka geçişi + logo inşası
  cue(T.wipe - 0.36, 'whoosh', { dur: 0.38, f0: 500, f1: 8000, gain: 0.6 });
  cue(T.wipe, 'impact', { gain: 0.7 }); cue(T.wipe + 0.04, 'pop', { pitch: 0.9, gain: 0.5 });
  T.leyes.forEach((t, i) => {
    const p = [-0.55, 0.55, -0.55][i];
    cue(t - 0.3, 'whoosh', { dur: 0.3, f0: 800, f1: 4000, gain: 0.25, pan: p });
    cue(t, 'thud', { gain: 0.85, pan: p * 0.5 }); cue(t, 'pop', { pitch: 1 + i * 0.26, gain: 0.45, pan: p * 0.5 });
  });
  cue(T.person, 'pop', { pitch: 0.7, gain: 0.5, pan: 0.3 }); cue(T.person + 0.06, 'coin', { pitch: 1.2, gain: 0.3, pan: 0.3 });
  cue(T.slide, 'sweep', { dur: 0.45, gain: 0.25 });
  'QR Personel'.split('').forEach((ch, i) => { if (ch !== ' ') cue(T.slide + 0.12 + i * 0.028, 'tick', { pitch: 1.8 + i * 0.03, gain: 0.08, pan: 0.2 + i * 0.04 }); });
  cue(T.final - 0.5, 'reverse', { dur: 0.5, gain: 0.5 });
  cue(T.final, 'impact', { gain: 1.0, big: true });
  cue(T.final + 0.02, 'sparkle', { dur: 1.2, gain: 0.4 });
  cue(T.final + 0.05, 'shine', { dur: 0.5, gain: 0.32 });
  cue(T.final + 0.22, 'pop', { pitch: 1.3, gain: 0.35 });
  for (let i = 0; i < 18; i++) cue(T.final + 0.3 + i * 0.034, 'type', { gain: 0.16, pan: -0.2 + i * 0.025 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');
const chR = canvas(W, H), chB = canvas(W, H), xR = chR.getContext('2d'), xB = chB.getContext('2d');

function initSprites() {
  SPR.blue = makeGlow('47,91,255');
  SPR.mint = makeGlow('25,227,161');
  SPR.layer = canvas(W, H); SPR.layerCtx = SPR.layer.getContext('2d');
  // vinyet
  SPR.vig = canvas(W, H);
  { const x = SPR.vig.getContext('2d'), gr = x.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, W * 0.66);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.42)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); }
  // film greni
  const n = canvas(256, 256), nx = n.getContext('2d'), id = nx.createImageData(256, 256), R = mulberry32(3);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (R() - 0.5) * 190; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  nx.putImageData(id, 0, 0); SPR.grain = ctx.createPattern(n, 'repeat');
  SPR.burstNine = makeBurst(11, 46, { t0: T.nine, x: CK.cx, y: CK.cy, w: CK.cols * CK.m, h: 7 * CK.m, v0: 300, v1: 1300, s0: 8, s1: 22, life: 1.0, drag: 3.5, cols: [C.white, C.mint, C.blueL, C.paper] });
  SPR.burstFinal = makeBurst(23, 70, { t0: T.final, x: LK.mx, y: LK.my, v0: 400, v1: 1600, s0: 7, s1: 24, life: 1.5, drag: 3, grav: 120, cols: [C.white, C.mint, C.blueXL, C.white] });
}
function chroma(a) {
  // kırmızı kanal biraz büyür, mavi biraz küçülür: lens benzeri saçak
  for (const [x, col] of [[xR, '#ff0000'], [xB, '#0000ff']]) {
    x.globalCompositeOperation = 'copy'; x.drawImage(main, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#00ff00'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const sR = 1 + a / 700, sB = 1 + a / 2400;
  ctx.drawImage(chR, W / 2 * (1 - sR), H / 2 * (1 - sR), W * sR, H * sR);
  ctx.drawImage(chB, W / 2 * (1 - sB), H / 2 * (1 - sB), W * sB, H * sB);
  ctx.globalCompositeOperation = 'source-over';
}
function post(t, f) {
  const ca = caAmount(t);
  if (ca > 0.4) chroma(ca);
  ctx.globalAlpha = t < T.wipe ? 1 : 0.45; ctx.drawImage(SPR.vig, 0, 0);
  ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = 'overlay';
  ctx.save(); ctx.translate(-(f * 73 % 256), -(f * 151 % 256)); ctx.fillStyle = SPR.grain; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  hud(ctx, t, f);
}
function renderFrame(f) {
  const t = f / FPS, n = samplesAt(t);
  for (let s = 0; s < n; s++) {
    const ts = clamp(t + ((s + 0.5) / n - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    draw(g, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
  post(t, f);
}
function renderAt(t) { draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); post(t, Math.round(t * FPS)); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123×·')));
  lockupLayout(g);
  buildFly();
  buildCols();
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
