'use strict';
/* Yakınla — "Tek kapı, sekiz dünya" · 15 sn motion graphics (9:16, 1080×1920, 30 fps)
 *
 * Kamera sabit; ekranın ortasında tek bir kapı var. Kapı her ölçüde açılır ve
 * arkasındaki market başka bir tasarım diliyle görünür. 128 BPM'de 8 ölçü = tam 15,0 sn.
 *
 *   Ölçü 1  0.000– 1.875  Kapı       tık tık tık · "Kim o?"
 *   Ölçü 2  1.875– 3.750  Kâğıt      süt & kahvaltılık, pop-up kitap
 *   Ölçü 3  3.750– 5.625  Koridor    temel gıda, sonsuz market reyonu
 *   Ölçü 4  5.625– 7.500  Sıvı       içecek, kapıdan taşan dalga
 *   Ölçü 5  7.500– 9.375  Fizik      atıştırmalık, kapıdan yağan paketler
 *   Ölçü 6  9.375–11.250  Tek çizgi  temizlik & kişisel bakım
 *   Ölçü 7 11.250–13.125  Tipografi  MARKET ALIŞVERİŞİNİZ KAPINIZDA.
 *   Ölçü 8 13.125–15.000  Logo       kapı pine dönüşür
 *
 * Her kare zamanın saf fonksiyonudur: draw(g, t). Rastgelelik tohumludur.
 * renderFrame(f) bir kareyi SAMPLES alt-örnekle (180° obtüratör) çizer: gerçek hareket bulanıklığı.
 */

const W = 1080, H = 1920, FPS = 30, DUR = 15;
const FRAMES = FPS * DUR;
const SAMPLES = 8, SHUTTER = 0.5;
const TAU = Math.PI * 2;
const BPM = 128, BEAT = 60 / BPM, BAR = BEAT * 4; // 0.46875 sn, 1.875 sn
const bt = n => n * BEAT;                       // n. vuruşun zamanı
const T = { knock: 0, paper: BAR, aisle: 2 * BAR, liquid: 3 * BAR, physics: 4 * BAR, line: 5 * BAR, type: 6 * BAR, logo: 7 * BAR };

const C = {
  blue: '#1F73F0', blueL: '#3B8BFF', blueD: '#0E5FE0', blueXL: '#9CC2FF', blueXXL: '#DCEAFF', blueDeep: '#0A3F9E',
  ink: '#0B1B33', inkD: '#060F1E', inkSoft: '#5B6B85',
  amber: '#FFB547', amberD: '#F59A1B', amberL: '#FFD48A', amberXL: '#FFE9C2',
  cream: '#F8EEDF', creamD: '#EEDCC3', coral: '#F2795A', red: '#E8473B', green: '#2FAE6B', purple: '#7C5CE6',
  white: '#FFFFFF',
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
  inQuart: x => x * x * x * x,
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
// Bir kez vuran darbe: 0'da 1, üstel söner
const kick = (dt, d = 10) => dt < 0 ? 0 : Math.exp(-d * dt);
// Sönümlü titreşim (dt<0 → 0)
const wobble = (dt, f = 6, d = 8) => dt < 0 ? 0 : Math.exp(-d * dt) * Math.sin(f * TAU * dt);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${lerp(A[0], B[0], t) | 0},${lerp(A[1], B[1], t) | 0},${lerp(A[2], B[2], t) | 0})`; };
const rgba = (h, a) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function poly(g, pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
// Kısmi çoklu çizgi: uzunluğun a..b kesrini çizer (çizgi "çizilir" animasyonu)
function polyLen(pts, closed) {
  const L = [0];
  const n = closed ? pts.length + 1 : pts.length;
  for (let i = 1; i < n; i++) { const p = pts[(i - 1) % pts.length], q = pts[i % pts.length]; L.push(L[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1])); }
  return L;
}
function strokeTrim(g, pts, a, b, closed = false) {
  if (b <= a) return;
  const L = polyLen(pts, closed), tot = L[L.length - 1], s0 = a * tot, s1 = b * tot;
  const n = L.length;
  const at = (s) => {
    let i = 1; while (i < n - 1 && L[i] < s) i++;
    const p = pts[(i - 1) % pts.length], q = pts[i % pts.length], k = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    return [lerp(p[0], q[0], clamp(k)), lerp(p[1], q[1], clamp(k)), i];
  };
  const A = at(s0), B = at(s1);
  g.beginPath(); g.moveTo(A[0], A[1]);
  for (let i = A[2]; i < B[2]; i++) { const p = pts[i % pts.length]; g.lineTo(p[0], p[1]); }
  g.lineTo(B[0], B[1]);
  g.stroke();
}
function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

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
function fitSize(g, s, o, maxW) { const w = measure(g, s, o); return o.s * maxW / w; }
// Harf harf animasyon. fn(i, n, cw) → {dx, dy, sx, sy, sc, rot, al, c, ax}
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
    const r = fn(i, n, cw, x0 + off + cw / 2) || {};
    const al = r.al == null ? 1 : r.al;
    if (al <= 0.002) continue;
    const ax = r.ax == null ? 0 : r.ax; // dönüş/ölçek ekseni: -1 sol kenar, 0 orta
    g.save();
    g.globalAlpha *= al;
    g.translate(x0 + off + cw / 2 + ax * cw / 2 + (r.dx || 0), y + (r.dy || 0));
    if (r.rot) g.rotate(r.rot);
    const sc = r.sc == null ? 1 : r.sc;
    g.scale(sc * (r.sx == null ? 1 : r.sx), sc * (r.sy == null ? 1 : r.sy));
    if (r.skx) g.transform(1, r.skx, 0, 1, 0, 0);
    g.fillStyle = r.c || o.c || '#fff';
    g.fillText(ch, -cw / 2 - ax * cw / 2, 0);
    g.restore();
  }
  g.letterSpacing = '0px';
  return total;
}
// Maskeli şeritten aşağıdan yukarı çıkan yazı (p: 0→1 giriş, q: 0→1 çıkış)
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.05) {
  if (p <= 0 || q >= 1) return;
  g.save();
  g.beginPath(); g.rect(-50, y - o.s * 1.3, W + 100, o.s * 1.72); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.25 - qi * o.s * 1.65 };
  });
  g.restore();
}

/* ───────────────────────── sprite'lar ───────────────────────── */
const SPR = {};
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
// 100 birimlik kutuda çizen fonksiyondan sprite (merkez 0,0)
function bake(fn, size, pad = 16) {
  const c = canvas(size + pad * 2, size + pad * 2), x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2); x.scale(size / 100, size / 100);
  fn(x);
  return c;
}
function sprite(g, spr, x, y, sc = 1, rot = 0, a = 1) {
  if (a <= 0 || sc <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
}

/* ───────────────────────── logo ───────────────────────── */
const PIN_D = 'M 512 104 C 340 104, 202 242, 202 414 C 202 540, 270 638, 360 712 C 430 770, 480 830, 504 900 C 508 914, 516 914, 520 900 C 544 830, 594 770, 664 712 C 754 638, 822 540, 822 414 C 822 242, 684 104, 512 104 Z';
const PIN = new Path2D(PIN_D);
// o: ring, face, hands (0..1), am/ah (ibre açıları), glint (-0.3..1.3), shadow
function drawLogo(g, x, y, size, o = {}) {
  const k = size / 1024;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-512, -512);
  const pg = g.createLinearGradient(0, 104, 0, 914);
  pg.addColorStop(0, '#3B8BFF'); pg.addColorStop(0.5, '#1F73F0'); pg.addColorStop(1, '#0E5FE0');
  if (o.shadow !== false) { g.shadowColor = 'rgba(0,30,90,0.30)'; g.shadowBlur = 60 * k; g.shadowOffsetY = 26 * k; }
  g.fillStyle = pg; g.fill(PIN);
  g.shadowColor = 'transparent';
  const hl = g.createRadialGradient(358, 256, 0, 358, 256, 614);
  hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(0.6, 'rgba(255,255,255,0.05)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; g.fill(PIN);
  const ring = o.ring == null ? 1 : o.ring;
  if (ring > 0) {
    g.strokeStyle = '#0E5FE0'; g.lineWidth = 22; g.lineCap = 'round';
    g.beginPath(); g.arc(512, 414, 197, -Math.PI / 2, -Math.PI / 2 + TAU * ring); g.stroke();
  }
  const face = o.face == null ? 1 : o.face;
  if (face > 0) {
    const fg = g.createLinearGradient(0, 228, 0, 600);
    fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(1, '#EFF4FA');
    g.fillStyle = fg; g.beginPath(); g.arc(512, 414, 186 * face, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(14,95,224,0.12)'; g.lineWidth = 6; g.beginPath(); g.arc(512, 418, 180 * face, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  }
  const hands = o.hands == null ? 1 : o.hands;
  if (hands > 0) {
    const hg = g.createLinearGradient(0, 246, 0, 430);
    hg.addColorStop(0, '#2A7CF0'); hg.addColorStop(1, '#0E5FE0');
    g.fillStyle = hg;
    g.save(); g.translate(512, 414); g.rotate(o.am || 0); g.scale(hands, hands);
    g.beginPath(); g.roundRect(-14, -168, 28, 180, 14); g.fill(); g.restore();
    g.save(); g.translate(512, 414); g.rotate(o.ah || 0); g.scale(hands, hands);
    g.beginPath(); g.roundRect(-4, -14, 160, 28, 14); g.fill(); g.restore();
    g.fillStyle = '#0E5FE0'; g.beginPath(); g.arc(512, 414, 20 * hands, 0, TAU); g.fill();
    g.fillStyle = '#3B8BFF'; g.beginPath(); g.arc(512, 414, 10 * hands, 0, TAU); g.fill();
  }
  if (o.glint != null && o.glint > -0.3 && o.glint < 1.3) {
    g.save(); g.clip(PIN);
    const gx = lerp(100, 924, o.glint);
    g.translate(gx, 500); g.transform(1, 0, -0.4, 1, 0, 0); g.translate(-gx, -500);
    const gg = g.createLinearGradient(gx - 140, 0, gx + 140, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gg; g.fillRect(gx - 140, -200, 280, 1424);
    g.restore();
  }
  g.restore();
}
// Bir SVG yolunu n noktaya örnekler (biçim dönüşümleri ve tek çizgi animasyonu için)
function samplePath(d, n) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  const L = p.getTotalLength(), out = [];
  for (let i = 0; i < n; i++) { const q = p.getPointAtLength(L * i / n); out.push([q.x, q.y]); }
  return { pts: out, len: L };
}

/* ───────────────────────── kapı ───────────────────────── */
// Kapı boşluğu (pervazın iç kenarı). Menteşe solda; kapı izleyiciye doğru (eve içeri) açılır.
const DOOR = { x0: 290, x1: 790, y0: 560, y1: 1480, w: 500, h: 920, trim: 36, thick: 30 };
DOOR.cx = (DOOR.x0 + DOOR.x1) / 2; DOOR.cy = (DOOR.y0 + DOOR.y1) / 2;
const CAM = { f: 1900, cx: 540, cy: 1020 };
const PEEP = { u: 250, v: 330, r: 17 };   // kapı dürbünü (logoya dönüşür)
const KNOB = { u: 440, v: 500 };          // kapı kolu
const FLOOR_Y = DOOR.y1;

function projP(x, y, z) {
  const s = CAM.f / (CAM.f + z);
  return [CAM.cx + (x - CAM.cx) * s, CAM.cy + (y - CAM.cy) * s];
}
// Kapı yüzeyindeki (u, v) noktası; th: açılma açısı (rad), z0: kapının tümden itilmesi, n: yüzey normali yönünde kalınlık
function doorPt(u, v, th, z0 = 0, n = 0) {
  const x = DOOR.x0 + u * Math.cos(th) + n * Math.sin(th);
  const z = -u * Math.sin(th) + n * Math.cos(th) + z0;
  return projP(x, DOOR.y0 + v, z);
}
function doorPoly(pts, th, z0, n = 0) { return pts.map(([u, v]) => doorPt(u, v, th, z0, n)); }
function doorCircle(cu, cv, r, th, z0, seg = 28) {
  const a = []; for (let i = 0; i < seg; i++) { const q = i / seg * TAU; a.push(doorPt(cu + Math.cos(q) * r, cv + Math.sin(q) * r, th, z0)); }
  return a;
}

/* Oda stilleri: duvar, pervaz, zemin, paspas, kapı renkleri.
 * line: true → her şey çizgi (doldurma yok) */
const STY = {
  knock:   { wall: ['#0F2446', '#081429'], trim: '#163463', trimL: '#21477F', floor: ['#0A1A33', '#050D1C'], mat: '#1C3D72', matL: '#2A5394', door: '#1B4A9E', doorD: '#123A80', doorL: '#2559B4', knob: '#FFD48A', ink: '#FFFFFF', sub: '#9CC2FF' },
  paper:   { wall: ['#FBF2E6', '#F3E2CB'], trim: '#FFFFFF', trimL: '#FFFFFF', floor: ['#EBD3B2', '#DDBF97'], mat: '#F2795A', matL: '#F79C82', door: '#3B8BFF', doorD: '#2C78EE', doorL: '#6AA7FF', knob: '#FFB547', ink: '#0B1B33', sub: '#C0662D', paper: true },
  aisle:   { wall: ['#1F73F0', '#0E5FE0'], trim: '#FFFFFF', trimL: '#FFFFFF', floor: ['#0B4FC2', '#083D99'], mat: '#FFB547', matL: '#FFD48A', door: '#FFFFFF', doorD: '#E3EDFC', doorL: '#FFFFFF', knob: '#1F73F0', ink: '#FFFFFF', sub: '#DCEAFF', grid: true },
  physics: { wall: ['#FFC764', '#FFB547'], trim: '#FFFFFF', trimL: '#FFFFFF', floor: ['#F59A1B', '#E5860C'], mat: '#1F73F0', matL: '#3B8BFF', door: '#1F73F0', doorD: '#1660D6', doorL: '#3B8BFF', knob: '#FFFFFF', ink: '#0B1B33', sub: '#8A4B00', dots: true },
  line:    { wall: ['#FFFFFF', '#F3F8FF'], line: '#1F73F0', ink: '#0B1B33', sub: '#1F73F0', lineMode: true },
  type:    { wall: ['#0B1B33', '#060F1E'], line: '#FFFFFF', ink: '#FFFFFF', sub: '#9CC2FF', lineMode: true },
  type2:   { wall: ['#1F73F0', '#0E5FE0'], line: '#FFFFFF', ink: '#FFFFFF', sub: '#DCEAFF', lineMode: true },
  logo:    { wall: ['#F7FAFF', '#E6EFFD'], trim: '#FFFFFF', trimL: '#FFFFFF', floor: ['#E1EAF8', '#D3DFF2'], mat: '#DCEAFF', matL: '#EAF2FE', door: '#1F73F0', doorD: '#1660D6', doorL: '#3B8BFF', knob: '#FFFFFF', ink: '#0B1B33', sub: '#5B6B85' },
};

function fillWall(g, S) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, S.wall[0]); gr.addColorStop(1, S.wall[1]);
  g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
}
function floorPts() { return [[-300, FLOOR_Y], [W + 300, FLOOR_Y], [W + 300, H + 300], [-300, H + 300]]; }
// Paspas: zemin perspektifinde yamuk
const MAT = (() => {
  const a = projP(DOOR.x0 + 40, FLOOR_Y, -60), b = projP(DOOR.x1 - 40, FLOOR_Y, -60), c = projP(DOOR.x1 - 40, FLOOR_Y, -330), d = projP(DOOR.x0 + 40, FLOOR_Y, -330);
  return [a, b, c, d];
})();
const TRIM = { L: [DOOR.x0 - DOOR.trim, DOOR.y0 - DOOR.trim, DOOR.trim, DOOR.h + DOOR.trim], R: [DOOR.x1, DOOR.y0 - DOOR.trim, DOOR.trim, DOOR.h + DOOR.trim], T: [DOOR.x0 - DOOR.trim, DOOR.y0 - DOOR.trim, DOOR.w + DOOR.trim * 2, DOOR.trim] };

// Kapı boşluğuna kırpılmış çizim
function inDoorway(g, fn) {
  g.save(); g.beginPath(); g.rect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h); g.clip(); fn(); g.restore();
}

// Oda (duvar + pervaz + zemin + paspas). draw: 0..1 çizgi modunda çizilme oranı
function drawRoom(g, S, t, o = {}) {
  if (S.lineMode) return drawRoomLine(g, S, t, o);
  fillWall(g, S);
  if (S.grid) wallGrid(g, t, o.gridP == null ? 1 : o.gridP);
  if (S.dots) wallDots(g, t);
  if (S.paper) wallPaper(g, t, o.paperP == null ? 1 : o.paperP);
}
// Kapı boşluğundan sonra çizilen ön katman: pervaz, zemin, paspas
function drawRoomFront(g, S, t, o = {}) {
  if (S.lineMode) return;
  // zemin
  const fg = g.createLinearGradient(0, FLOOR_Y, 0, H);
  fg.addColorStop(0, S.floor[0]); fg.addColorStop(1, S.floor[1]);
  g.fillStyle = fg; g.fillRect(-300, FLOOR_Y, W + 600, H - FLOOR_Y + 300);
  // süpürgelik çizgisi
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(-300, FLOOR_Y, W + 600, 6);
  // içeriden gelen ışık zemine düşer
  if (o.spill > 0) {
    g.save();
    const a = projP(DOOR.x0, FLOOR_Y, 0), b = projP(DOOR.x1, FLOOR_Y, 0), c = projP(DOOR.x1 + 90, FLOOR_Y, -900), d = projP(DOOR.x0 - 90, FLOOR_Y, -900);
    const lg = g.createLinearGradient(0, FLOOR_Y, 0, c[1]);
    lg.addColorStop(0, rgba(o.spillCol || '#FFE9C2', 0.55 * o.spill)); lg.addColorStop(1, rgba(o.spillCol || '#FFE9C2', 0));
    g.fillStyle = lg; poly(g, [a, b, c, d]); g.fill();
    g.restore();
  }
  // paspas
  if (o.mat !== false) {
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.18)'; poly(g, MAT.map(([x, y]) => [x + 6, y + 10])); g.fill();
    g.fillStyle = S.mat; poly(g, MAT); g.fill();
    g.strokeStyle = S.matL; g.lineWidth = 6;
    const inset = MAT.map(([x, y], i) => [lerp(x, (MAT[0][0] + MAT[1][0] + MAT[2][0] + MAT[3][0]) / 4, 0.12), lerp(y, (MAT[0][1] + MAT[1][1] + MAT[2][1] + MAT[3][1]) / 4, 0.18)]);
    poly(g, inset); g.stroke();
    g.restore();
  }
  // pervaz
  drawTrim(g, S);
}
function drawTrim(g, S) {
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.22)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = S.trim;
  for (const k of ['L', 'R', 'T']) { const r = TRIM[k]; g.fillRect(r[0], r[1], r[2], r[3]); }
  g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(0,0,0,0.10)';
  g.fillRect(DOOR.x0 - 8, DOOR.y0, 8, DOOR.h); g.fillRect(DOOR.x1, DOOR.y0, 8, DOOR.h); g.fillRect(DOOR.x0 - 8, DOOR.y0 - 8, DOOR.w + 16, 8);
  g.restore();
}

// Kapı kanadı. th: açı, z0: itme, lever: kol dönüşü (rad), S: stil
function drawDoor(g, S, th, z0 = 0, lever = 0, o = {}) {
  if (S.lineMode) return drawDoorLine(g, S, th, z0, lever, o);
  const w = DOOR.w, h = DOOR.h, T_ = DOOR.thick;
  const face = doorPoly(rectPts(0, 0, w, h), th, z0);
  // serbest kenar kalınlığı (açılınca görünür)
  if (th > 0.01) {
    const e = [doorPt(w, 0, th, z0), doorPt(w, h, th, z0), doorPt(w, h, th, z0, T_), doorPt(w, 0, th, z0, T_)];
    g.fillStyle = S.doorD; poly(g, e); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.18)'; poly(g, e); g.fill();
  }
  // gölge (açıkken zemine ve duvara)
  if (th > 0.02 && !o.noShadow) {
    g.save();
    g.globalAlpha = clamp(th / 0.6) * 0.22;
    g.fillStyle = '#000';
    g.filter = 'blur(16px)';
    const sh = [doorPt(0, h, 0, 0), doorPt(w, h, th * 0.9, z0), [doorPt(w, h, th * 0.9, z0)[0] + 40, doorPt(w, h, th * 0.9, z0)[1] + 30], [DOOR.x0 + 30, FLOOR_Y + 20]];
    poly(g, sh); g.fill();
    g.filter = 'none';
    g.restore();
  }
  // yüz
  const shade = clamp(th / 1.6);
  const gr = g.createLinearGradient(face[0][0], 0, face[1][0] + 0.5, 0);
  gr.addColorStop(0, S.doorL); gr.addColorStop(1, S.door);
  if (S.paper) { g.save(); g.shadowColor = 'rgba(90,50,10,0.28)'; g.shadowBlur = 20; g.shadowOffsetX = 10; g.shadowOffsetY = 12; }
  g.fillStyle = gr; poly(g, face); g.fill();
  if (S.paper) g.restore();
  // aydınlık/karanlık: açılırken yüz döner
  if (shade > 0) { g.fillStyle = `rgba(0,10,40,${0.18 * shade})`; poly(g, face); g.fill(); }
  // gömme paneller
  for (const [u0, v0, u1, v1] of [[60, 70, 440, 470], [60, 560, 440, 850]]) {
    const p = doorPoly(rectPts(u0, v0, u1 - u0, v1 - v0), th, z0);
    g.fillStyle = 'rgba(0,20,70,0.14)'; poly(g, p); g.fill();
    const q = doorPoly(rectPts(u0 + 14, v0 + 14, u1 - u0 - 28, v1 - v0 - 28), th, z0);
    g.fillStyle = S.door; poly(g, q); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(...doorPt(u0, v1, th, z0)); g.lineTo(...doorPt(u0, v0, th, z0)); g.lineTo(...doorPt(u1, v0, th, z0)); g.stroke();
    g.strokeStyle = 'rgba(0,20,70,0.22)';
    g.beginPath(); g.moveTo(...doorPt(u0 + 14, v1 - 14, th, z0)); g.lineTo(...doorPt(u1 - 14, v1 - 14, th, z0)); g.lineTo(...doorPt(u1 - 14, v0 + 14, th, z0)); g.stroke();
  }
  // dürbün
  if (o.peep !== false) {
    g.fillStyle = 'rgba(0,20,70,0.25)'; poly(g, doorCircle(PEEP.u, PEEP.v + 3, PEEP.r + 4, th, z0)); g.fill();
    g.fillStyle = S.knob; poly(g, doorCircle(PEEP.u, PEEP.v, PEEP.r, th, z0)); g.fill();
    g.fillStyle = o.peepGlow ? `rgba(255,233,194,${o.peepGlow})` : 'rgba(0,20,60,0.55)'; poly(g, doorCircle(PEEP.u, PEEP.v, PEEP.r * 0.5, th, z0)); g.fill();
  }
  // kol (rozet + kol)
  g.fillStyle = 'rgba(0,20,70,0.25)'; poly(g, doorCircle(KNOB.u, KNOB.v + 4, 28, th, z0)); g.fill();
  g.fillStyle = S.knob; poly(g, doorCircle(KNOB.u, KNOB.v, 26, th, z0)); g.fill();
  const lv = [];
  const ca = Math.cos(lever), sa = Math.sin(lever);
  for (const [a, b] of [[8, -10], [-78, -10], [-78, 10], [8, 10]]) lv.push([KNOB.u + a * ca - b * sa, KNOB.v + a * sa + b * ca]);
  g.fillStyle = 'rgba(0,20,70,0.25)'; poly(g, doorPoly(lv.map(([u, v]) => [u + 2, v + 6]), th, z0)); g.fill();
  g.fillStyle = S.knob; poly(g, doorPoly(lv, th, z0)); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)'; poly(g, doorCircle(KNOB.u - 7, KNOB.v - 7, 8, th, z0)); g.fill();
}

/* ───────── çizgi modu (ölçü 6 ve 7): her şey kontur ───────── */
// p: 0..1 çizilme (her çizgi kendi uzunluğunda trim)
function drawRoomLine(g, S, t, o) {
  fillWall(g, S);
  const p = o.draw == null ? 1 : o.draw;
  g.save();
  g.strokeStyle = S.line; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  const seg = (pts, a0, closed = false) => strokeTrim(g, pts, 0, E.outCubic(prog(p, a0, a0 + 0.55)), closed);
  // zemin çizgisi ve süpürgelik
  seg([[-20, FLOOR_Y], [DOOR.x0 - DOOR.trim, FLOOR_Y]], 0.0);
  seg([[W + 20, FLOOR_Y], [DOOR.x1 + DOOR.trim, FLOOR_Y]], 0.0);
  // pervaz (dış hat)
  seg([[DOOR.x0 - DOOR.trim, FLOOR_Y], [DOOR.x0 - DOOR.trim, DOOR.y0 - DOOR.trim], [DOOR.x1 + DOOR.trim, DOOR.y0 - DOOR.trim], [DOOR.x1 + DOOR.trim, FLOOR_Y]], 0.1);
  seg([[DOOR.x0, FLOOR_Y], [DOOR.x0, DOOR.y0], [DOOR.x1, DOOR.y0], [DOOR.x1, FLOOR_Y]], 0.2);
  // paspas
  if (o.mat !== false) seg(MAT, 0.35, true);
  // perspektif zemin çizgileri (hafif)
  g.globalAlpha = 0.25; g.lineWidth = 4;
  for (const k of [-1, 1]) {
    const a = projP(k < 0 ? DOOR.x0 - DOOR.trim : DOOR.x1 + DOOR.trim, FLOOR_Y, 0), b = projP(k < 0 ? DOOR.x0 - 260 : DOOR.x1 + 260, FLOOR_Y, -1400);
    seg([a, b], 0.3);
  }
  g.restore();
}
function drawDoorLine(g, S, th, z0, lever, o) {
  const p = o.draw == null ? 1 : o.draw;
  const w = DOOR.w, h = DOOR.h;
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  const face = doorPoly(rectPts(0, 0, w, h), th, z0);
  // kanadın içi duvar rengiyle dolu (arkasındakini örter)
  g.fillStyle = o.fill || S.wall[0]; poly(g, face); g.fill();
  g.strokeStyle = S.line; g.lineWidth = 7;
  const seg = (pts, a0, closed = true) => strokeTrim(g, pts, 0, E.outCubic(prog(p, a0, a0 + 0.55)), closed);
  seg(face, 0.25);
  if (th > 0.01) seg([doorPt(w, 0, th, z0, DOOR.thick), doorPt(w, h, th, z0, DOOR.thick)], 0.3, false);
  g.lineWidth = 5;
  for (const [u0, v0, u1, v1] of [[60, 70, 440, 470], [60, 560, 440, 850]]) seg(doorPoly(rectPts(u0, v0, u1 - u0, v1 - v0), th, z0), 0.35);
  seg(doorCircle(PEEP.u, PEEP.v, PEEP.r, th, z0), 0.45);
  seg(doorCircle(KNOB.u, KNOB.v, 24, th, z0), 0.45);
  const ca = Math.cos(lever), sa = Math.sin(lever);
  const lv = [[8, -9], [-76, -9], [-76, 9], [8, 9]].map(([a, b]) => [KNOB.u + a * ca - b * sa, KNOB.v + a * sa + b * ca]);
  seg(doorPoly(lv, th, z0), 0.45);
  g.restore();
}

/* ───────── duvar süsleri ───────── */
function wallGrid(g, t, p) {
  // kapıdan dışa doğru büyüyen ince ızgara (mavi "blueprint")
  g.save();
  g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 2;
  const step = 60;
  for (let x = DOOR.cx % step; x < W; x += step) {
    const d = Math.abs(x - DOOR.cx) / 600, q = E.outCubic(clamp(p * 1.6 - d * 0.6));
    if (q <= 0) continue;
    g.beginPath(); g.moveTo(x, DOOR.cy - q * 1100); g.lineTo(x, DOOR.cy + q * 1100); g.stroke();
  }
  for (let y = DOOR.cy % step; y < H; y += step) {
    const d = Math.abs(y - DOOR.cy) / 1000, q = E.outCubic(clamp(p * 1.6 - d * 0.6));
    if (q <= 0) continue;
    g.beginPath(); g.moveTo(DOOR.cx - q * 700, y); g.lineTo(DOOR.cx + q * 700, y); g.stroke();
  }
  // köşe ölçü işaretleri
  g.strokeStyle = `rgba(255,255,255,${0.5 * p})`; g.lineWidth = 3;
  for (const [x, y, sx, sy] of [[120, 240, 1, 1], [960, 240, -1, 1], [120, 1700, 1, -1], [960, 1700, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * 40); g.lineTo(x, y); g.lineTo(x + sx * 40, y); g.stroke();
  }
  g.restore();
}
function wallDots(g, t) {
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.22)';
  for (let y = 30; y < FLOOR_Y; y += 54) for (let x = ((y / 54) % 2) * 27 + 14; x < W; x += 54) {
    const d = Math.hypot(x - DOOR.cx, y - DOOR.cy) / 900;
    const r = 3 + 3 * Math.max(0, 1 - d);
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
}
// Kâğıt kesme: kapının çevresinde katman katman kemerler
const ARCHES = [
  { pad: 230, col: '#FFE3B8', d: 0.00 }, { pad: 175, col: '#FFC97A', d: 0.06 }, { pad: 120, col: '#FFB547', d: 0.12 },
  { pad: 72, col: '#F2795A', d: 0.18 },
];
function archPath(g, pad) {
  const x0 = DOOR.x0 - pad, x1 = DOOR.x1 + pad, y1 = FLOOR_Y, r = (x1 - x0) / 2, top = DOOR.y0 - pad * 0.45 + 30;
  g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, top + r); g.arc((x0 + x1) / 2, top + r, r, Math.PI, 0); g.lineTo(x1, y1); g.closePath();
}
function wallPaper(g, t, p) {
  for (const a of ARCHES) {
    const q = spring(p * 1.0 - a.d, 1.5, 6);
    if (q <= 0) continue;
    g.save();
    g.translate(DOOR.cx, FLOOR_Y); g.scale(1, q); g.translate(-DOOR.cx, -FLOOR_Y);
    g.shadowColor = 'rgba(120,60,10,0.30)'; g.shadowBlur = 26; g.shadowOffsetY = 10;
    g.fillStyle = a.col; archPath(g, a.pad); g.fill();
    g.restore();
  }
}

/* ───────── son işlem: film greni ───────── */
function grain(g, t, a = 0.06) {
  if (!SPR.grain) return;
  const f = Math.floor(t * FPS * 2), r = mulberry32(f + 99);
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay';
  g.translate(-r() * 256, -r() * 256);
  g.fillStyle = SPR.grainPat; g.fillRect(0, 0, W + 256, H + 256);
  g.restore();
}
