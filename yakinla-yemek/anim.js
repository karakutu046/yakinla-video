'use strict';
/* Yakınla Yemek — 16 saniyelik duyuru filmi (9:16, 1080×1920, 30 fps)
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Yardımcılar engine.js'tedir.
 * Sahneler dış sesin cümlelerine göre kurulmuştur (120 BPM, 1 vuruş = 0.5 sn):
 *   0–3.5    Duyuru    "Yakınla Yemek bölgemizde aktif!"
 *   3.5–5.5  Sipariş   "Sen de siparişini ver,"
 *   5.5–8.5  Teslimat  "kapına kadar getirelim!"
 *   8.5–11.5 Slogan    "Ne lazımsa, Yakınla!"
 *   11.5–16  Kapanış   "App Store ve Google Play'den indirin!"
 */

Object.assign(C, { green: '#22C55E', greenD: '#16A34A', cream: '#FFF3DC', orange: '#FF7A1A', kraft: '#E9B872' });

const T = { s2: 3.5, s3: 5.5, s4: 8.5, slam: 10.0, s5: 11.5, end: 15.0 };
// Dış ses (build/vo/dis_ses.mp3) cümle aralarındaki sessizliklerden bölünür ve sahnelere yerleştirilir.
// src: kayıttaki aralık (sn), at: videoda başladığı an. audio.py bu listeyi cues.json'dan okur.
const VO = [
  { src: [0.00, 2.04], at: 0.50 },  // Yakınla Yemek bölgemizde aktif!
  { src: [2.04, 4.80], at: 4.07 },  // Sen de siparişini ver, (4.22) kapına kadar getirelim! (5.50)
  { src: [4.80, 6.70], at: 8.82 },  // Ne lazımsa, (9.03) Yakınla! (10.00)
  { src: [6.70, 9.04], at: 11.81 }, // App Store ve Google Play'den indirin! (12.00)
];
const beatP = t => Math.exp(-((t % 0.5) / 0.5) * 6);

/* ───────────────────────── yemek ikonları (100 birimlik kutu, merkez 0,0) ───────────────────────── */
const dot = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const FOOD = {
  burger(g) {
    g.fillStyle = '#D9822B'; g.beginPath(); g.roundRect(-42, 25, 84, 18, [4, 4, 15, 15]); g.fill();
    g.fillStyle = '#7A3E1D'; g.beginPath(); g.roundRect(-45, 9, 90, 17, 8); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.roundRect(-38, 12, 60, 4, 2); g.fill();
    g.fillStyle = '#FFC933'; g.beginPath(); g.moveTo(-44, 2); g.lineTo(44, 2); g.lineTo(44, 10); g.lineTo(26, 10); g.lineTo(15, 21); g.lineTo(4, 10); g.lineTo(-44, 10); g.closePath(); g.fill();
    g.fillStyle = '#EF3B2D'; g.beginPath(); g.roundRect(-41, -5, 82, 8, 4); g.fill();
    g.fillStyle = '#5CC44A'; g.beginPath(); g.moveTo(-47, -9);
    for (let i = 0; i < 8; i++) { const x = -47 + i * 11.75; g.quadraticCurveTo(x + 5.9, 5, x + 11.75, -6); }
    g.lineTo(47, -12); g.lineTo(-47, -12); g.closePath(); g.fill();
    const gr = g.createLinearGradient(0, -44, 0, -8); gr.addColorStop(0, '#F9BE62'); gr.addColorStop(1, '#E0892B');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-43, -9); g.bezierCurveTo(-43, -38, -20, -45, 0, -45); g.bezierCurveTo(20, -45, 43, -38, 43, -9); g.closePath(); g.fill();
    g.fillStyle = '#FFF1CF';
    for (const [x, y, r] of [[-20, -27, 0.5], [0, -35, 0], [19, -27, -0.5], [-8, -19, 0.2], [10, -20, -0.2]]) { g.beginPath(); g.ellipse(x, y, 4.2, 2.4, r, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.ellipse(-22, -32, 9, 4, -0.6, 0, TAU); g.fill();
  },
  pizza(g) {
    g.save(); g.rotate(-0.18);
    g.fillStyle = '#FFC94A'; g.beginPath(); g.moveTo(-40, -26); g.quadraticCurveTo(0, -40, 40, -26); g.lineTo(4, 46); g.quadraticCurveTo(0, 51, -4, 46); g.closePath(); g.fill();
    g.fillStyle = '#FFB020'; g.beginPath(); g.moveTo(-40, -26); g.quadraticCurveTo(0, -40, 40, -26); g.lineTo(35, -16); g.quadraticCurveTo(0, -30, -35, -16); g.closePath(); g.fill();
    g.fillStyle = '#E2382B'; dot(g, -15, -6, 9); dot(g, 13, -3, 8); dot(g, -1, 18, 7.5);
    g.fillStyle = '#B81F1F'; dot(g, -17, -8, 2.2); dot(g, -12, -3, 2); dot(g, 15, -5, 2); dot(g, 10, 0, 1.8); dot(g, 0, 16, 2);
    g.fillStyle = '#3E9B3A'; for (const [x, y, r] of [[1, -14, 0.4], [-9, 10, -0.5], [9, 12, 1.1]]) { g.beginPath(); g.ellipse(x, y, 5, 2.4, r, 0, TAU); g.fill(); }
    g.strokeStyle = '#D9822B'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-39, -29); g.quadraticCurveTo(0, -44, 39, -29); g.stroke();
    g.strokeStyle = '#F6BC6B'; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, -32); g.quadraticCurveTo(0, -46, 34, -32); g.stroke();
    g.restore();
  },
  fries(g) {
    [[-23, -38, -0.2, 0], [-12, -46, -0.08, 1], [0, -41, 0.02, 0], [12, -47, 0.1, 1], [23, -37, 0.22, 0], [-6, -34, -0.02, 1], [7, -36, 0.05, 0]].forEach(([x, h, r, k]) => {
      g.save(); g.translate(x, 6); g.rotate(r); g.fillStyle = k ? '#FFB020' : '#FFCF3F';
      g.beginPath(); g.roundRect(-5.5, h, 11, -h + 6, 3); g.fill(); g.restore();
    });
    const gr = g.createLinearGradient(0, -10, 0, 46); gr.addColorStop(0, '#F5483A'); gr.addColorStop(1, '#C92418');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-34, -10); g.quadraticCurveTo(0, 6, 34, -10); g.lineTo(26, 42); g.quadraticCurveTo(0, 48, -26, 42); g.closePath(); g.fill();
    g.fillStyle = '#fff'; dot(g, 0, 22, 10);
    g.fillStyle = '#FFCF3F'; dot(g, 0, 22, 5);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo(-30, -6); g.lineTo(-22, -3); g.lineTo(-18, 40); g.lineTo(-24, 40); g.closePath(); g.fill();
  },
  drink(g) {
    g.strokeStyle = '#FFB547'; g.lineWidth = 6.5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(5, -22); g.lineTo(13, -47); g.lineTo(27, -47); g.stroke();
    const cup = new Path2D('M -27 -16 L 27 -16 L 20 43 Q 0 48 -20 43 Z');
    const gr = g.createLinearGradient(-27, 0, 27, 0); gr.addColorStop(0, '#F5483A'); gr.addColorStop(1, '#D12B1F');
    g.fillStyle = gr; g.fill(cup);
    g.save(); g.clip(cup);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-30, 6); g.quadraticCurveTo(-10, -4, 0, 8); g.quadraticCurveTo(12, 20, 30, 8); g.lineTo(30, 26); g.quadraticCurveTo(12, 36, 0, 24); g.quadraticCurveTo(-10, 14, -30, 24); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-22, -16, 7, 62);
    g.restore();
    g.fillStyle = '#EAF1FB'; g.beginPath(); g.roundRect(-31, -27, 62, 12, 6); g.fill();
    g.fillStyle = '#C9D8EE'; g.beginPath(); g.roundRect(-31, -19, 62, 4, 2); g.fill();
  },
  wrap(g) {
    g.save(); g.rotate(0.5);
    const gr = g.createLinearGradient(-17, 0, 17, 0); gr.addColorStop(0, '#F7E2B4'); gr.addColorStop(1, '#E6C486');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-17, -43, 34, 84, [15, 15, 8, 8]); g.fill();
    g.fillStyle = '#8A4B22'; g.beginPath(); g.ellipse(0, -39, 13, 6.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#5CC44A'; dot(g, -7, -43, 4.5); dot(g, 7, -44, 5);
    g.fillStyle = '#EF3B2D'; dot(g, 0, -45, 4); g.fillStyle = '#FFC933'; dot(g, -1, -37, 3);
    g.strokeStyle = 'rgba(176,108,40,0.5)'; g.lineWidth = 2.6; g.lineCap = 'round';
    for (const y of [-26, -16, -6]) { g.beginPath(); g.moveTo(-9, y + 3); g.lineTo(9, y - 3); g.stroke(); }
    const paper = new Path2D('M -19 6 L 19 -4 L 19 38 Q 0 49 -19 38 Z');
    g.fillStyle = '#fff'; g.fill(paper);
    g.save(); g.clip(paper); g.fillStyle = C.blue;
    for (const y of [14, 30]) { g.beginPath(); g.moveTo(-20, y + 5); g.lineTo(20, y - 5); g.lineTo(20, y + 2); g.lineTo(-20, y + 12); g.closePath(); g.fill(); }
    g.restore(); g.restore();
  },
  pide(g) {
    g.save(); g.rotate(-0.45);
    const boat = (k, kx) => { g.beginPath(); g.moveTo(-50 * kx, 0); g.bezierCurveTo(-30 * kx, -27 * k, 30 * kx, -27 * k, 50 * kx, 0); g.bezierCurveTo(30 * kx, 27 * k, -30 * kx, 27 * k, -50 * kx, 0); g.closePath(); };
    const gr = g.createLinearGradient(0, -22, 0, 22); gr.addColorStop(0, '#F2B463'); gr.addColorStop(1, '#C97B2A');
    g.fillStyle = gr; boat(1, 1); g.fill();
    g.fillStyle = '#FFCF55'; boat(0.56, 0.78); g.fill();
    g.fillStyle = '#8A3B1E'; for (const [x, y] of [[-22, -2], [-10, 4], [2, -4], [14, 3], [25, -1], [-4, -6], [8, 6]]) dot(g, x, y, 3.6);
    g.fillStyle = '#EF3B2D'; dot(g, -15, 5, 3); dot(g, 20, -5, 3); dot(g, 5, 1, 2.6);
    g.fillStyle = '#3E9B3A'; for (const [x, y, r] of [[-28, 2, 0.5], [-3, 7, -0.4], [12, -5, 0.9]]) { g.beginPath(); g.ellipse(x, y, 4.5, 2, r, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-36, -9); g.quadraticCurveTo(-10, -22, 18, -19); g.stroke();
    g.restore();
  },
  donut(g) {
    g.fillStyle = '#E0A050'; dot(g, 0, 2, 41);
    g.fillStyle = '#FF6FA5'; g.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, r = 35 + 3.2 * Math.sin(a * 7); g.lineTo(Math.cos(a) * r, -1 + Math.sin(a) * r); }
    g.closePath(); g.fill();
    [['#fff', -22, -14, 0.5], ['#FFE14D', 4, -25, -0.3], ['#7CD4FF', 23, -8, 1], ['#fff', 22, 14, -0.7], ['#FFE14D', -6, 24, 0.2], ['#7CD4FF', -25, 8, 1.3], ['#fff', -8, -27, 1.1]].forEach(([c, x, y, r]) => {
      g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = c; g.beginPath(); g.roundRect(-5, -1.7, 10, 3.4, 1.7); g.fill(); g.restore();
    });
    g.globalCompositeOperation = 'destination-out'; dot(g, 0, 0, 12.5); g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.arc(0, -1, 27, Math.PI * 1.08, Math.PI * 1.4); g.stroke();
  },
  soup(g) {
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 4.5; g.lineCap = 'round';
    for (const x of [-14, 2, 18]) { g.beginPath(); g.moveTo(x, -18); g.bezierCurveTo(x - 8, -27, x + 8, -35, x, -45); g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-44, -2); g.lineTo(44, -2); g.bezierCurveTo(44, 26, 26, 40, 0, 40); g.bezierCurveTo(-26, 40, -44, 26, -44, -2); g.closePath(); g.fill();
    g.fillStyle = '#DCE7F8'; g.beginPath(); g.roundRect(-20, 38, 40, 8, 4); g.fill();
    g.fillStyle = '#FF9A2E'; g.beginPath(); g.ellipse(0, -2, 40, 9, 0, 0, TAU); g.fill();
    g.fillStyle = '#FFC14D'; g.beginPath(); g.ellipse(-8, -3, 16, 3.4, 0, 0, TAU); g.fill();
    g.fillStyle = '#3E9B3A'; dot(g, 12, -1, 2.4); dot(g, 19, -4, 2); dot(g, 5, -5, 1.8);
    g.strokeStyle = C.blue; g.lineWidth = 4; g.beginPath(); g.moveTo(-36, 12); g.quadraticCurveTo(0, 22, 36, 12); g.stroke();
  },
  bag(g) {
    g.strokeStyle = '#B98545'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-14, -26); g.quadraticCurveTo(-14, -46, 0, -46); g.quadraticCurveTo(14, -46, 14, -26); g.stroke();
    const gr = g.createLinearGradient(-32, 0, 32, 0); gr.addColorStop(0, '#F1C583'); gr.addColorStop(1, '#DDA75E');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-30, -28); g.lineTo(30, -28); g.lineTo(34, 40); g.quadraticCurveTo(0, 46, -34, 40); g.closePath(); g.fill();
    g.fillStyle = '#CF9750'; g.beginPath(); g.moveTo(-30, -28); g.lineTo(30, -28); g.lineTo(31, -16); g.lineTo(-31, -16); g.closePath(); g.fill();
    g.save(); g.translate(0, 26); g.scale(0.042, 0.042); g.translate(-512, -905); g.fillStyle = C.blue; g.fill(PATHS.pin);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(512, 414, 170, 0, TAU); g.fill(); g.restore();
  },
};
const ALL_ICONS = { ...FOOD, milk: g => ICON.milk(g), bread: g => ICON.bread(g), egg: g => ICON.egg(g), tea: g => ICON.tea(g), chips: g => ICON.chips(g), detergent: g => ICON.detergent(g) };
const ISZ = 240;
function mkSprite(fn, size, blur = 0, shadow = true) {
  const pad = Math.ceil(blur * 3 + size * 0.2);
  const a = canvas(size + pad * 2, size + pad * 2), ax = a.getContext('2d');
  ax.translate(a.width / 2, a.height / 2); ax.scale(size / 100, size / 100); fn(ax);
  const c = canvas(a.width, a.height), x = c.getContext('2d');
  if (blur > 0) x.filter = `blur(${blur}px)`;
  if (shadow) { x.shadowColor = 'rgba(0,20,70,0.3)'; x.shadowBlur = size * 0.08; x.shadowOffsetY = size * 0.045; }
  x.drawImage(a, 0, 0);
  return c;
}
function icon(g, name, x, y, size, rot = 0, a = 1) { if (size > 0) sprite(g, SPR['i_' + name], x, y, size / ISZ, rot, a); }
// Beyaz yuvarlak "etiket" içinde ikon
function sticker(g, name, x, y, r, rot = 0, sc = 1) {
  if (sc <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.rotate(rot);
  g.shadowColor = 'rgba(0,20,70,0.3)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.shadowColor = 'transparent';
  g.drawImage(SPR['f_' + name], -r * 0.95, -r * 0.95, r * 1.9, r * 1.9);
  g.restore();
}

/* ───────────────────────── ortak parçalar ───────────────────────── */
function bgGrad(g, c0, c1, c2) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, c0); gr.addColorStop(0.5, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
}
function rays(g, cx, cy, t, a, n = 14) {
  g.save(); g.translate(cx, cy); g.rotate(t * 0.14); g.fillStyle = `rgba(255,255,255,${a})`;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = a0 + TAU / n / 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a0) * 2600, Math.sin(a0) * 2600); g.lineTo(Math.cos(a1) * 2600, Math.sin(a1) * 2600); g.closePath(); g.fill();
  }
  g.restore();
}
function dotGrid(g, t, a) {
  g.save(); g.globalAlpha = a; g.fillStyle = SPR.dots; g.translate(0, -((t * 30) % 60)); g.fillRect(-60, -60, W + 120, H + 180); g.restore();
}
function bgBrand(g, t, cx, cy) {
  bgGrad(g, '#3B8BFF', '#1F73F0', '#0E5FE0');
  rays(g, cx, cy, t, 0.045 + 0.035 * beatP(t));
  dotGrid(g, t, 0.08 + 0.05 * beatP(t));
  glow(g, SPR.white, cx, cy, 950, 0.26);
}
function mkConfetti(seed, n, cols) {
  const r = mulberry32(seed), a = [];
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, sp = 700 + r() * 1000;
    a.push({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 350, rot: r() * TAU, vr: (r() - 0.5) * 18, s: 9 + r() * 13, c: cols[i % cols.length], sh: r() < 0.45 });
  }
  return a;
}
const CONF = [
  mkConfetti(21, 44, ['#FFFFFF', '#FFB547', '#22C55E', '#9CC2FF', '#FFD58A']),
  mkConfetti(42, 60, ['#FFFFFF', '#FFB547', '#9CC2FF', '#FFFFFF', '#FF7A1A']),
  mkConfetti(77, 54, ['#FFFFFF', '#FFB547', '#9CC2FF', '#22C55E', '#FFD58A']),
];
function confetti(g, set, x, y, a, life = 1.7) {
  if (a <= 0 || a >= life) return;
  for (const c of set) {
    const k = a * Math.exp(-a * 1.5), px = x + c.vx * k, py = y + c.vy * k + 430 * a * a, al = clamp(1 - a / life);
    g.save(); g.globalAlpha = al; g.translate(px, py); g.rotate(c.rot + c.vr * a); g.fillStyle = c.c;
    if (c.sh) { g.beginPath(); g.arc(0, 0, c.s * 0.5, 0, TAU); g.fill(); } else g.fillRect(-c.s / 2, -c.s / 5, c.s, c.s / 2.5);
    g.restore();
  }
}
function shockRing(g, x, y, a, speed = 1500, life = 0.55, col = '255,255,255', lw = 16) {
  if (a <= 0 || a >= life) return;
  const k = a / life;
  g.strokeStyle = `rgba(${col},${0.85 * (1 - k)})`; g.lineWidth = lw * (1 - k) + 2;
  g.beginPath(); g.arc(x, y, E.outCubic(k) * speed * life, 0, TAU); g.stroke();
}
// Amber "Yemek" etiketi (damga gibi çakılır)
function yemekPill(g, x, y, size, a) {
  if (a <= 0) return;
  const sc = 1 + 1.7 * Math.exp(-a * 17), rot = -0.05 + 0.12 * Math.exp(-a * 8) * Math.sin(a * 32);
  const o = { w: 900, s: size, ls: -1, c: C.ink };
  const tw = measure(g, 'Yemek', o), w = tw + size * 0.72, h = size * 1.28;
  g.save(); g.globalAlpha *= clamp(a * 14); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,20,70,0.32)'; g.shadowBlur = 36; g.shadowOffsetY = 14;
  const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, '#FFC561'); gr.addColorStop(1, '#FFA82B');
  g.fillStyle = gr; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h * 0.3); g.fill(); g.shadowColor = 'transparent';
  text(g, 'Yemek', 0, size * 0.36, o);
  g.restore();
}
function whitePin(g, x, y, k, col = C.blue) { // uç noktası (x, y)
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-512, -905);
  g.fillStyle = '#fff'; g.fill(PATHS.pin); g.fillStyle = col; g.beginPath(); g.arc(512, 414, 150, 0, TAU); g.fill(); g.restore();
}
function heart(g, x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s / 100, s / 100); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 38); g.bezierCurveTo(-60, -6, -36, -52, 0, -22); g.bezierCurveTo(36, -52, 60, -6, 0, 38); g.fill(); g.restore();
}
function downloadIcon(g, x, y, s, col, lw = 9, bounce = 0) {
  g.save(); g.translate(x, y); g.scale(s / 100, s / 100); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(0, -30 + bounce); g.lineTo(0, 10 + bounce); g.moveTo(-17, -7 + bounce); g.lineTo(0, 10 + bounce); g.lineTo(17, -7 + bounce); g.stroke();
  g.beginPath(); g.moveTo(-26, 30); g.lineTo(26, 30); g.stroke(); g.restore();
}
// Sahne geçişi: üç renkli bant ekranı süpürür, tam T anında ekran kapalıdır.
function wipe(g, t, T0, dir, cols) {
  const p = prog(t, T0 - 0.25, T0 + 0.25); if (p <= 0 || p >= 1) return;
  const R = 1350;
  g.save(); g.translate(540, 960); g.rotate(dir);
  for (let k = cols.length - 1; k >= 0; k--) {
    const lead = E.inOutCubic(clamp((p + 0.05 * k) / 0.5)), tail = E.inOutCubic(clamp((p - 0.5 - 0.05 * k) / 0.5));
    g.fillStyle = cols[cols.length - 1 - k];
    g.fillRect(-R + 2 * R * tail, -R, 2 * R * (lead - tail), 2 * R);
  }
  g.restore();
}

/* ───────────────────────── 1. DUYURU (0–3.5 sn) ───────────────────────── */
const S1_ICONS = [['burger', 170, 345, -0.22, 200], ['pizza', 410, 225, 0.18, 175], ['fries', 675, 235, -0.12, 170], ['drink', 915, 350, 0.2, 185],
  ['wrap', 150, 1545, 0.25, 190], ['pide', 405, 1665, -0.15, 200], ['donut', 680, 1660, 0.2, 170], ['soup', 925, 1540, -0.15, 190]];
const AKTIF = { t: 2.0, x: 540, y: 1300 };
function scene1(g, t) {
  bgBrand(g, t, 540, 800);
  S1_ICONS.forEach(([n, x, y, r, s], i) => {
    const dt = t + 0.14 - i * 0.045; if (dt <= 0) return;
    const p = spring(dt, 1.7, 6), k = clamp(dt * 9);
    const bump = t > 0.45 ? 1 + 0.08 * beatP(t) : 1;
    icon(g, n, lerp(540, x, p) + Math.cos(t * 1.1 + i) * 7, lerp(800, y, p) + Math.sin(t * 1.6 + i * 1.3) * 11, s * k * bump,
      r + Math.sin(t * 1.3 + i * 2) * 0.1 + (1 - clamp(dt * 1.8)) * 2.4 * (i % 2 ? 1 : -1), k);
  });
  shockRing(g, 540, 800, t + 0.02, 1700, 0.6);
  // logo rozeti: ortada açılır, yazıya yer açmak için yukarı çekilir
  const m = E.inOutCubic(prog(t, 0.36, 0.72));
  const br = lerp(190, 112, m) * spring(t + 0.1, 1.7, 6.5), by = lerp(800, 500, m);
  g.save(); g.shadowColor = 'rgba(0,30,90,0.3)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(540, by, br, 0, TAU); g.fill(); g.restore();
  drawLogo(g, 540, by + br * 0.06, br * 1.72, { glint: t > 0.75 ? lerp(-0.3, 1.3, prog(t, 0.75, 1.2)) : null });
  // Yakınla + Yemek
  slotText(g, 'Yakınla', 540, 830, { w: 900, s: 196, ls: -3 }, prog(t, 0.5, 0.95), 0, 0.05);
  yemekPill(g, 540, 975, 134, t - 1.0);
  // bölgemizde
  const bo = { w: 800, s: 92 }, bw = measure(g, 'bölgemizde', bo);
  const pp = spring(t - 1.38, 2.2, 8);
  if (pp > 0) whitePin(g, 540 - bw / 2 - 18, 1176 - (1 - pp) * 60, 0.105 * Math.min(pp, 1.15));
  slotText(g, 'bölgemizde', 540 + 40, 1170, bo, prog(t, 1.4, 1.82), 0, 0.03);
  // AKTİF!
  const a = t - AKTIF.t;
  if (a > 0) {
    shockRing(g, AKTIF.x, AKTIF.y, a, 1900, 0.6, '255,255,255', 20);
    shockRing(g, AKTIF.x, AKTIF.y, a - 0.08, 1500, 0.6, '34,197,94', 14);
    const sc = 1 + 1.9 * Math.exp(-a * 18) + (a > 0.4 ? 0.045 * beatP(t) : 0);
    g.save(); g.globalAlpha = clamp(a * 16); g.translate(AKTIF.x, AKTIF.y); g.rotate(0.1 * Math.exp(-a * 9) * Math.sin(a * 34)); g.scale(sc, sc);
    g.shadowColor = 'rgba(0,40,30,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
    const gr = g.createLinearGradient(0, -82, 0, 82); gr.addColorStop(0, '#34D873'); gr.addColorStop(1, '#16A34A');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-300, -82, 600, 164, 82); g.fill(); g.shadowColor = 'transparent';
    for (let i = 0; i < 2; i++) { // "canlı" noktası
      const age = ((a * 2 + i * 0.5) % 1);
      g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - age)})`; g.lineWidth = 5; g.beginPath(); g.arc(-208, 0, 22 + age * 44, 0, TAU); g.stroke();
    }
    g.fillStyle = '#fff'; dot(g, -208, 0, 22);
    text(g, 'AKTİF!', 46, 38, { w: 900, s: 108, ls: 1 });
    g.restore();
    confetti(g, CONF[0], AKTIF.x, AKTIF.y, a);
  }
}

/* ───────────────────────── 2. SİPARİŞ (3.5–5.5 sn) ───────────────────────── */
const PHN = { x: 540, y: 1150, sc: 0.86 };
const CARDS = [['burger', 'Burger'], ['pizza', 'Pizza'], ['wrap', 'Dürüm']];
const CARD = { y0: 312, h: 200, gap: 20 };
const TAPS = [{ t: 4.2, i: 0 }, { t: 4.6, i: 1 }], CTA_T = 5.0, CTA_Y = 1044;
const cardY = i => CARD.y0 + i * (CARD.h + CARD.gap);
const plusPos = i => [500, cardY(i) + 138];
function cursorPos(t) {
  const K = [[3.85, 430, 980], [TAPS[0].t, ...plusPos(0)], [TAPS[0].t + 0.12, ...plusPos(0)], [TAPS[1].t, ...plusPos(1)], [TAPS[1].t + 0.12, ...plusPos(1)], [CTA_T, 470, CTA_Y + 14]];
  if (t <= K[0][0]) return [K[0][1], K[0][2] + (K[0][0] - t) * 900];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const p = E.inOutCubic(prog(t, K[i - 1][0], K[i][0])); return [lerp(K[i - 1][1], K[i][1], p), lerp(K[i - 1][2], K[i][2], p)]; }
  return [K[K.length - 1][1], K[K.length - 1][2]];
}
function drawPhone(g, t) {
  const e = t - T.s2 + 0.05;
  const off = (1 - spring(e, 1.25, 6)) * 1500, rot = 0.14 * (1 - spring(e, 1.1, 5)) + Math.sin(t * 1.4) * 0.008;
  let press = 0; for (const tt of [TAPS[0].t, TAPS[1].t, CTA_T]) press += kick(t - tt, 14);
  g.save(); g.translate(PHN.x, PHN.y + off); g.rotate(rot); g.scale(PHN.sc * (1 - 0.018 * press), PHN.sc * (1 - 0.018 * press));
  g.shadowColor = 'rgba(11,27,51,0.35)'; g.shadowBlur = 80; g.shadowOffsetY = 40;
  g.fillStyle = C.ink; g.beginPath(); g.roundRect(-310, -650, 620, 1300, 92); g.fill(); g.shadowColor = 'transparent';
  g.translate(-290, -630);
  g.save(); g.beginPath(); g.roundRect(0, 0, 580, 1260, 74); g.clip();
  g.fillStyle = '#F4F8FE'; g.fillRect(0, 0, 580, 1260);
  // başlık
  const hg = g.createLinearGradient(0, 0, 0, 200); hg.addColorStop(0, '#3B8BFF'); hg.addColorStop(1, '#1F73F0');
  g.fillStyle = hg; g.beginPath(); g.roundRect(0, -40, 580, 240, 36); g.fill();
  g.fillStyle = C.ink; g.beginPath(); g.roundRect(215, 18, 150, 36, 18); g.fill();
  text(g, 'Yakınla Yemek', 36, 132, { w: 800, s: 50, a: 'left' });
  text(g, 'Bugün ne yesek?', 36, 172, { f: 'Txt', w: 500, s: 26, a: 'left', c: 'rgba(255,255,255,0.85)' });
  g.fillStyle = 'rgba(255,255,255,0.2)'; dot(g, 512, 128, 38); miconAt(g, 'search', 512, 128, 40, '#fff', 9);
  // kategori çipleri
  let cx = 28;
  ['Burger', 'Pizza', 'Dürüm', 'Tatlı'].forEach((s, i) => {
    const o = { f: 'Txt', w: 700, s: 26, a: 'left', c: i ? C.inkSoft : '#fff' }, w = measure(g, s, o) + 48;
    g.fillStyle = i ? '#E6EEFB' : C.blue; g.beginPath(); g.roundRect(cx, 226, w, 56, 28); g.fill();
    text(g, s, cx + 24, 263, o); cx += w + 12;
  });
  // yemek kartları
  let count = 0;
  CARDS.forEach(([n, label], i) => {
    const p = E.outBack(prog(t, 3.68 + i * 0.09, 4.0 + i * 0.09)); if (p <= 0) return;
    const y = cardY(i), tap = TAPS.find(tp => tp.i === i), added = tap && t >= tap.t;
    if (added) count++;
    g.save(); g.globalAlpha = clamp(p * 2); g.translate((1 - p) * 320, 0);
    g.shadowColor = 'rgba(31,115,240,0.14)'; g.shadowBlur = 26; g.shadowOffsetY = 8;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(24, y, 532, CARD.h, 30); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = C.cream; g.beginPath(); g.roundRect(42, y + 18, 164, 164, 24); g.fill();
    const fly = tap ? prog(t, tap.t + 0.02, tap.t + 0.32) : 0;
    g.drawImage(SPR['f_' + n], 124 - 95, y + 100 - 95, 190, 190);
    text(g, label, 232, y + 78, { w: 800, s: 46, a: 'left', c: C.ink });
    g.fillStyle = '#DCE6F5'; g.beginPath(); g.roundRect(232, y + 102, 200, 15, 7.5); g.fill();
    g.beginPath(); g.roundRect(232, y + 132, 132, 15, 7.5); g.fill();
    const [bx, by] = plusPos(i), bs = 1 + (tap ? 0.35 * kick(t - tap.t, 9) * Math.cos((t - tap.t) * 30) : 0);
    g.save(); g.translate(bx, by); g.scale(bs, bs); g.fillStyle = added ? C.green : C.blue; dot(g, 0, 0, 36);
    g.scale(0.62, 0.62); micon(g, added ? 'check' : 'plus', '#fff', 11); g.restore();
    if (tap) shockRing(g, bx, by, t - tap.t, 260, 0.4, '34,197,94', 8);
    g.restore();
    if (fly > 0 && fly < 1) { // ürün sepete uçar
      const q = E.inOutCubic(fly), fx = lerp(124, 92, q), fy = lerp(y + 100, CTA_Y, q) - Math.sin(fly * Math.PI) * 150, fs = lerp(190, 60, q);
      g.drawImage(SPR['f_' + n], fx - fs / 2, fy - fs / 2, fs, fs);
    }
  });
  // sipariş düğmesi
  const done = t >= CTA_T, cp = E.outBack(prog(t, 3.95, 4.25)), ck = kick(t - CTA_T, 9);
  g.save(); g.translate(290, CTA_Y); g.scale(cp * (1 + 0.05 * ck * Math.cos((t - CTA_T) * 30)), cp);
  g.shadowColor = done ? 'rgba(22,163,74,0.4)' : 'rgba(31,115,240,0.4)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = done ? C.green : C.blue; g.beginPath(); g.roundRect(-266, -54, 532, 108, 54); g.fill(); g.shadowColor = 'transparent';
  let bump = 1; for (const tp of TAPS) bump += 0.4 * kick(t - tp.t - 0.32, 10);
  g.save(); g.translate(-198, 0); g.scale(bump, bump); g.fillStyle = '#fff'; dot(g, 0, 0, 34);
  let shown = 0; for (const tp of TAPS) if (t >= tp.t + 0.32) shown++;
  if (done) { g.scale(0.55, 0.55); micon(g, 'check', C.green, 12); } else text(g, String(shown), 0, 15, { w: 900, s: 42, c: C.blue });
  g.restore();
  text(g, done ? 'Sipariş Alındı' : 'Siparişi Ver', 36, 15, { w: 800, s: 44 });
  g.restore();
  shockRing(g, 290, CTA_Y, t - CTA_T, 900, 0.5, '34,197,94', 12);
  g.fillStyle = '#C9D5E8'; g.beginPath(); g.roundRect(215, 1226, 150, 8, 4); g.fill();
  // imleç
  const [ux, uy] = cursorPos(t);
  let dip = 0; for (const tt of [TAPS[0].t, TAPS[1].t, CTA_T]) dip += kick(t - tt, 16);
  g.save(); g.translate(ux, uy); g.scale(1 - 0.22 * dip, 1 - 0.22 * dip);
  g.shadowColor = 'rgba(11,27,51,0.35)'; g.shadowBlur = 20; g.shadowOffsetY = 8;
  g.fillStyle = 'rgba(11,27,51,0.28)'; dot(g, 0, 0, 34); g.shadowColor = 'transparent';
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.stroke(); g.restore();
  g.restore();
  g.restore();
}
function scene2(g, t) {
  bgGrad(g, '#FFFFFF', '#EEF4FF', '#D6E5FF');
  g.save(); g.globalAlpha = 0.5; g.fillStyle = '#C9DCFB'; dot(g, 940, 420, 300 + 12 * beatP(t)); g.globalAlpha = 0.35; dot(g, 80, 1500, 380); g.restore();
  [['fries', 95, 640, 0.9], ['drink', 985, 820, 0.85], ['donut', 100, 1250, 0.8], ['pide', 990, 1380, 0.95]].forEach(([n, x, y, s], i) => {
    const p = E.outBack(prog(t, 3.55 + i * 0.06, 3.9 + i * 0.06)); if (p <= 0) return;
    sprite(g, SPR['b_' + n], x + Math.sin(t * 1.2 + i) * 14, y + Math.cos(t * 1.4 + i * 2) * 18, s * p, Math.sin(t * 0.9 + i) * 0.25, 0.75);
  });
  slotText(g, 'Sen de', 540, 300, { w: 900, s: 124, c: C.ink, ls: -2 }, prog(t, 4.16, 4.48), 0, 0.05);
  slotText(g, 'siparişini ver!', 540, 452, { w: 900, s: 132, c: C.blue, ls: -2 }, prog(t, 4.42, 4.86), 0, 0.025);
  drawPhone(g, t);
}

/* ───────────────────────── 3. TESLİMAT (5.5–8.5 sn) ───────────────────────── */
const GY = 1480, CX = 390, D3 = 6200, ARRIVE = 7.0, LAND = 7.5;
const camX = t => D3 * E.outCubic(prog(t, 5.1, ARRIVE));
const vel = t => { const p = prog(t, 5.1, ARRIVE); return (1 - p) * (1 - p); };
const TOWN = (() => {
  const r = mulberry32(5), a = []; let x = -300;
  while (x < D3 * 0.45 + 1700) {
    const w = 150 + r() * 150, h = 120 + r() * 210, cols = Math.max(1, Math.floor((w - 30) / 58)), rows = Math.max(1, Math.floor((h - 36) / 74)), wins = [];
    for (let i = 0; i < cols * rows; i++) wins.push(r() < 0.55);
    a.push({ x, w, h, cols, rows, wins, roof: r() < 0.45 }); x += w + (r() < 0.3 ? 40 + r() * 90 : 8);
  }
  return a;
})();
const HOUSE = { x: D3 + 600, w: 460, h: 420, base: 1404 };
function ridge(g, off, base, col, amps) {
  g.fillStyle = col; g.beginPath(); g.moveTo(-10, H);
  for (let x = -10; x <= W + 30; x += 30) { let y = 0; for (const [a, k, ph] of amps) y += a * Math.sin((x + off) * k + ph); g.lineTo(x, base - Math.abs(y)); }
  g.lineTo(W + 30, H); g.closePath(); g.fill();
}
function courier(g, x, y, sc, wrot, lean, bob) {
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.fillStyle = 'rgba(0,0,20,0.35)'; g.beginPath(); g.ellipse(-10, 99, 160, 11, 0, 0, TAU); g.fill();
  for (const wx of [-95, 105]) {
    g.save(); g.translate(wx, 60); g.fillStyle = '#0A1030'; dot(g, 0, 0, 38); g.fillStyle = '#DDE6F7'; dot(g, 0, 0, 21);
    g.rotate(wrot); g.strokeStyle = '#0A1030'; g.lineWidth = 5;
    for (let i = 0; i < 3; i++) { g.rotate(TAU / 6); g.beginPath(); g.moveTo(-21, 0); g.lineTo(21, 0); g.stroke(); }
    g.fillStyle = C.blue; dot(g, 0, 0, 7); g.restore();
  }
  g.translate(0, 60 + bob); g.rotate(lean); g.translate(0, -60);
  g.lineCap = 'round'; g.lineJoin = 'round';
  // teslimat kutusu
  const bg_ = g.createLinearGradient(0, -134, 0, -34); bg_.addColorStop(0, '#3B8BFF'); bg_.addColorStop(1, '#0E5FE0');
  g.fillStyle = bg_; g.beginPath(); g.roundRect(-172, -134, 104, 104, 16); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.roundRect(-172, -134, 104, 20, [16, 16, 0, 0]); g.fill();
  whitePin(g, -120, -50, 0.062);
  // gövde
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-146, -14, 158, 66, [34, 16, 10, 34]); g.fill();
  g.beginPath(); g.roundRect(-10, 36, 100, 18, 9); g.fill();
  g.fillStyle = C.amber; g.beginPath(); g.roundRect(-136, 12, 126, 12, 6); g.fill();
  g.fillStyle = '#FF4D5E'; g.beginPath(); g.roundRect(-150, -2, 10, 22, 5); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 24; g.beginPath(); g.moveTo(80, 44); g.lineTo(98, -58); g.stroke();
  g.lineWidth = 11; g.beginPath(); g.arc(105, 60, 47, Math.PI * 1.08, Math.PI * 1.78); g.stroke();
  g.fillStyle = C.ink; g.beginPath(); g.roundRect(-116, -30, 112, 22, 11); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 9; g.beginPath(); g.moveTo(98, -60); g.lineTo(78, -84); g.stroke();
  g.fillStyle = '#FFE3A6'; dot(g, 113, -30, 11);
  // sürücü
  g.strokeStyle = '#12244A'; g.lineWidth = 28; g.beginPath(); g.moveTo(-56, -40); g.lineTo(8, -32); g.lineTo(26, 26); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(8, 22, 50, 18, 9); g.fill();
  g.strokeStyle = C.blue; g.lineWidth = 48; g.beginPath(); g.moveTo(-56, -48); g.lineTo(-24, -120); g.stroke();
  g.strokeStyle = C.blueL; g.lineWidth = 21; g.beginPath(); g.moveTo(-18, -112); g.lineTo(34, -76); g.lineTo(76, -84); g.stroke();
  g.fillStyle = C.ink; dot(g, 78, -84, 12);
  g.fillStyle = '#fff'; dot(g, -8, -164, 32);
  g.strokeStyle = C.blue; g.lineWidth = 8; g.beginPath(); g.arc(-8, -164, 32, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  g.save(); g.beginPath(); g.arc(-8, -164, 32, 0, TAU); g.clip(); g.fillStyle = C.ink; g.beginPath(); g.roundRect(-4, -172, 40, 24, 8); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(2, -168, 30, 5); g.restore();
  g.restore();
}
function drawHouse(g, t, hx) {
  const { w, h, base } = HOUSE, top = base - h, open = E.outBack(prog(t, ARRIVE + 0.08, ARRIVE + 0.36));
  const wg = g.createLinearGradient(0, top, 0, base); wg.addColorStop(0, '#F7E2BF'); wg.addColorStop(1, '#E3C290');
  g.fillStyle = wg; g.fillRect(hx, top, w, h);
  g.fillStyle = '#B9472F'; g.beginPath(); g.moveTo(hx - 36, top + 6); g.lineTo(hx + 50, top - 112); g.lineTo(hx + w - 50, top - 112); g.lineTo(hx + w + 36, top + 6); g.closePath(); g.fill();
  g.fillStyle = '#9A3824'; g.fillRect(hx - 36, top - 6, w + 72, 16);
  g.fillStyle = '#D9B98A'; g.fillRect(hx - 14, base - 16, w + 28, 16);
  // pencere
  const wx = hx + 262, wy = top + 96;
  glow(g, SPR.amber, wx + 70, wy + 70, 190, 0.5);
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(wx - 10, wy - 10, 160, 160, 12); g.fill();
  g.fillStyle = '#FFD27A'; g.fillRect(wx, wy, 140, 140);
  g.fillStyle = '#fff'; g.fillRect(wx + 65, wy, 10, 140); g.fillRect(wx, wy + 65, 140, 10);
  // kapı
  const dx = hx + 62, dw = 144, dh = 256, dy = base - 16 - dh;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(dx - 12, dy - 12, dw + 24, dh + 12, [14, 14, 0, 0]); g.fill();
  g.fillStyle = '#FFD27A'; g.fillRect(dx, dy, dw, dh);
  if (open > 0) glow(g, SPR.amber, dx + dw / 2, dy + dh / 2, 330 * open, 0.75);
  const pw = dw * (1 - 0.8 * clamp(open, 0, 1.08));
  const dg = g.createLinearGradient(dx, 0, dx + pw, 0); dg.addColorStop(0, '#0E5FE0'); dg.addColorStop(1, '#1F73F0');
  g.fillStyle = dg; g.fillRect(dx, dy, pw, dh);
  if (pw > 60) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.roundRect(dx + 18, dy + 22, pw - 36, 86, 8); g.fill(); g.fillStyle = C.amber; dot(g, dx + pw - 20, dy + 140, 8); }
  // kapı lambası
  const lit = clamp((t - ARRIVE + 0.1) * 6);
  glow(g, SPR.amber, dx + dw / 2, dy - 46, 120 + 40 * lit, 0.5 + 0.4 * lit);
  g.fillStyle = '#FFE3A6'; dot(g, dx + dw / 2, dy - 46, 13);
  return [dx + dw / 2, base - 16];
}
function scene3(g, t) {
  const X = camX(t), v = vel(t);
  // gökyüzü: gün batımı
  const sky = g.createLinearGradient(0, 0, 0, 1420);
  sky.addColorStop(0, '#121A52'); sky.addColorStop(0.36, '#2E3488'); sky.addColorStop(0.62, '#8A4E9C'); sky.addColorStop(0.8, '#F4846A'); sky.addColorStop(0.93, '#FFBE74');
  g.fillStyle = sky; g.fillRect(-300, -300, W + 600, 1900);
  stars(g, t, 720, 0.7, 2);
  glow(g, SPR.amber, 800 - X * 0.01, 1190, 620, 0.75);
  g.fillStyle = '#FFE9B8'; dot(g, 800 - X * 0.01, 1190, 118);
  ridge(g, X * 0.05, 1330, '#5A4795', [[150, 0.0042, 0.3], [70, 0.011, 1.7]]);
  ridge(g, X * 0.1 + 400, 1400, '#3A3180', [[95, 0.006, 2.1], [45, 0.017, 0.4]]);
  // ilçe silueti (alçak binalar, ışıklı pencereler)
  const tx = X * 0.45;
  for (const b of TOWN) {
    const x = b.x - tx; if (x > W + 20 || x + b.w < -20) continue;
    const top = 1406 - b.h;
    g.fillStyle = '#1B1E58'; g.fillRect(x, top, b.w, b.h);
    if (b.roof) { g.beginPath(); g.moveTo(x - 10, top); g.lineTo(x + b.w / 2, top - 46); g.lineTo(x + b.w + 10, top); g.closePath(); g.fill(); }
    const gw = (b.w - 30) / b.cols, gh = (b.h - 36) / b.rows;
    for (let c = 0; c < b.cols; c++) for (let r = 0; r < b.rows; r++) {
      g.fillStyle = b.wins[c * b.rows + r] ? '#FFC960' : '#2A2F74';
      g.fillRect(x + 15 + c * gw + gw * 0.2, top + 22 + r * gh, gw * 0.6, gh * 0.5);
    }
  }
  // kaldırım ve yol
  g.fillStyle = '#4B4A92'; g.fillRect(-300, 1404, W + 600, 26);
  g.fillStyle = '#1A1C4A'; g.fillRect(-300, 1430, W + 600, 230);
  g.fillStyle = '#111236'; g.fillRect(-300, 1660, W + 600, 500);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = -1; i < 8; i++) { const x = i * 200 - (X % 200); g.beginPath(); g.roundRect(x, 1572, 110, 12, 6); g.fill(); }
  // sokak lambaları
  for (let wx = 300; wx < D3 + 500; wx += 950) {
    const x = wx - X; if (x < -200 || x > W + 200) continue;
    g.strokeStyle = '#0F1238'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1406); g.lineTo(x, 1010); g.quadraticCurveTo(x, 968, x + 52, 968); g.stroke();
    glow(g, SPR.amber, x + 58, 986, 210, 0.75); g.fillStyle = '#FFE3A6'; dot(g, x + 58, 982, 15);
  }
  // ev
  const hx = HOUSE.x - X; let door = [hx + 134, HOUSE.base - 16];
  if (hx < W + 80) door = drawHouse(g, t, hx);
  // hız çizgileri
  if (v > 0.03) {
    g.strokeStyle = `rgba(255,255,255,${0.42 * v})`; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const y = 880 + i * 82 + (i % 3) * 14, len = 150 + (i * 53) % 190, x = W + 300 - ((t * (2300 + i * 260) + i * 377) % (W + 700)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * (0.4 + v), y); g.stroke(); }
    for (let i = 0; i < 7; i++) { // toz bulutu
      const age = (t * 3.2 + i / 7) % 1;
      g.fillStyle = `rgba(255,255,255,${0.4 * (1 - age) * v})`; dot(g, CX - 150 - age * 230 * (0.3 + v), GY - 12 - age * 46, 10 + age * 30);
    }
  }
  // kurye
  const a = t - ARRIVE, lean = -0.05 * v + (a > 0 ? 0.07 * Math.exp(-a * 6) * Math.cos(a * 15) : 0);
  courier(g, CX, GY - 99 * 1.36, 1.36, X / 38 / 1.36, lean, Math.sin(t * 34) * 2.4 * v);
  glow(g, SPR.amber, CX + 180, GY - 172, 150, 0.55);
  // poşet kapıya uçar
  const f = prog(t, 7.2, LAND);
  if (f > 0) {
    const q = E.inOutSine(f), l = t - LAND, sq = l > 0 ? 0.22 * Math.exp(-l * 9) * Math.cos(l * 26) : 0;
    const bx = lerp(CX - 160, door[0], q), by = lerp(GY - 330, door[1] - 62, q) - Math.sin(f * Math.PI) * 250;
    g.save(); g.translate(bx, by + 62); g.scale(1 + sq, 1 - sq); g.rotate((1 - q) * -1.4);
    sprite(g, SPR.i_bag, 0, -62, 150 / ISZ * clamp(f * 5)); g.restore();
    if (l > 0) {
      shockRing(g, door[0], door[1] - 60, l, 520, 0.5, '255,227,166', 10);
      [[-90, -0.2, 62, '#FF4D5E'], [70, 0.12, 48, '#FFFFFF'], [0, 0.28, 54, '#FF4D5E']].forEach(([ox, d, s, c], i) => {
        const hl = l - d; if (hl <= 0) return;
        heart(g, door[0] + ox + Math.sin(hl * 4 + i) * 18, door[1] - 150 - hl * 210, s * spring(hl, 2, 7), c, clamp(1.6 - hl * 0.9));
      });
    }
  }
  // "Afiyet olsun!" rozeti
  const bp_ = t - LAND - 0.05;
  if (bp_ > 0) {
    const sc = spring(bp_, 2.1, 7.5), o = { w: 800, s: 62, c: C.ink, a: 'left' }, tw = measure(g, 'Afiyet olsun!', o), w = tw + 170;
    g.save(); g.translate(600, 800 + Math.sin(t * 3) * 6); g.scale(sc, sc); g.rotate(-0.03);
    g.shadowColor = 'rgba(0,0,40,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-w / 2, -62, w, 124, 62); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = C.green; dot(g, -w / 2 + 62, 0, 40); miconAt(g, 'check', -w / 2 + 62, 0, 58, '#fff', 12);
    text(g, 'Afiyet olsun!', -w / 2 + 122, 22, o);
    g.restore();
  }
  slotText(g, 'Kapına kadar', 540, 330, { w: 900, s: 128, ls: -2 }, prog(t, 5.48, 5.9), 0, 0.03);
  slotText(g, 'getirelim!', 540, 500, { w: 900, s: 168, ls: -3, c: C.amber }, prog(t, 5.98, 6.4), 0, 0.04);
}

/* ───────────────────────── 4–5. SLOGAN ve KAPANIŞ (8.5–16 sn) ───────────────────────── */
const RING_ICONS = ['burger', 'detergent', 'pizza', 'bread', 'wrap', 'tea', 'fries', 'donut', 'drink', 'chips'];
const RING_T0 = 8.56, RING_DT = 0.11, COLLAPSE = [9.7, 10.0];
const STORES = [['App Store', 322, 12.08], ['Google Play', 758, 12.62]];
const CTA5 = 13.2;
function sceneEnd(g, t) {
  const m = E.inOutCubic(prog(t, T.s5, T.s5 + 0.5));
  const cy = lerp(860, 480, m), R = lerp(210, 158, m);
  bgBrand(g, t, 540, cy);
  // kapanışta arkada süzülen ikonlar
  if (t > T.s5) [['burger', 130, 300, 1.0], ['pizza', 950, 330, 0.9], ['chips', 110, 1120, 0.8], ['drink', 975, 1090, 0.85], ['wrap', 130, 1690, 1.05], ['fries', 950, 1700, 1.0]].forEach(([n, x, y, s], i) => {
    const p = E.outBack(prog(t, T.s5 + 0.15 + i * 0.06, T.s5 + 0.55 + i * 0.06)); if (p <= 0) return;
    sprite(g, SPR['b_' + n], x + Math.sin(t * 0.8 + i) * 12, y + Math.cos(t * 0.9 + i) * 14, s * p * (1 + 0.05 * beatP(t)), Math.sin(t * 0.5 + i) * 0.22, 0.6);
  });
  // "Ne lazımsa,"
  if (t < T.s5 + 0.35) {
    const q = E.inCubic(prog(t, T.s5, T.s5 + 0.3));
    g.save(); g.globalAlpha = 1 - q;
    letters(g, 'Ne lazımsa,', 540, 350 - q * 160, { w: 900, s: 156, ls: -2 }, i => {
      const dt = t - 9.0 - i * 0.045; if (dt <= 0) return { al: 0 };
      return { sc: spring(dt, 2.3, 8), dy: (1 - clamp(dt * 6)) * 60, al: clamp(dt * 14) };
    });
    g.restore();
  }
  // ikon halkası: her şey Yakınla'da toplanır
  const c = E.inCubic(prog(t, COLLAPSE[0], COLLAPSE[1]));
  if (t < T.slam) {
    glow(g, SPR.white, 540, 860, 300 + 500 * c, 0.25 + 0.6 * c);
    g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - c)})`; g.lineWidth = 5; g.setLineDash([4, 26]); g.lineCap = 'round';
    g.beginPath(); g.arc(540, 860, 372, 0, TAU); g.stroke(); g.setLineDash([]);
    RING_ICONS.forEach((n, i) => {
      const dt = t - RING_T0 - i * RING_DT; if (dt <= 0) return;
      const ang = i / RING_ICONS.length * TAU - Math.PI / 2 + (t - T.s4) * 0.55 + c * c * 4.2, rad = 372 * (1 - c);
      sticker(g, n, 540 + Math.cos(ang) * rad, 860 + Math.sin(ang) * rad, 92, Math.sin(t * 2.2 + i) * 0.12, spring(dt, 2.2, 8) * (1 - 0.8 * c) * (1 + 0.06 * beatP(t)));
    });
  }
  const a = t - T.slam;
  if (a > 0) {
    // dalga halkaları
    for (let i = 0; i < 9; i++) {
      const age = a - 0.05 - i * 0.7; if (age <= 0) continue;
      const al = 0.2 * clamp(1 - age / 2.6); if (al <= 0) continue;
      g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = 4; g.beginPath(); g.arc(540, cy, R + age * 380, 0, TAU); g.stroke();
    }
    shockRing(g, 540, cy, a, 2000, 0.6, '255,255,255', 22);
    // rozet + logo inşası
    const fy = a > 1.4 ? Math.sin((a - 1.4) * 2.2) * 7 : 0, fin = t - T.end;
    const br = R * spring(a, 1.7, 6.5) * (1 + (fin > 0 ? 0.1 * Math.exp(-fin * 7) * Math.cos(fin * 20) : 0));
    g.save(); g.translate(0, fy);
    g.shadowColor = 'rgba(0,30,90,0.3)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(540, cy, br, 0, TAU); g.fill(); g.shadowColor = 'transparent';
    const sp = E.outCubic(prog(a, 0.3, 0.95)), wob = a > 0.95 ? 0.16 * Math.exp(-(a - 0.95) * 10) * Math.sin((a - 0.95) * 42) : 0;
    const gl = t > T.end ? lerp(-0.3, 1.3, prog(t, T.end, T.end + 0.45)) : a > 1.0 ? lerp(-0.3, 1.3, prog(a, 1.0, 1.45)) : null;
    drawLogo(g, 540, cy + br * 0.06, br * 1.72, {
      grow: spring(a - 0.06, 1.6, 6), ring: E.inOutCubic(prog(a, 0.16, 0.45)), face: E.outBack(prog(a, 0.28, 0.5)), hands: E.outBack(prog(a, 0.32, 0.52)),
      am: -(1 - sp) * 4 * TAU + wob, ah: -(1 - sp) * TAU + wob * 0.6, glint: gl,
    });
    g.restore();
    confetti(g, CONF[1], 540, 860, a, 1.8);
    // "Yakınla!"
    if (t < T.s5 + 0.3) {
      const q = E.inCubic(prog(t, T.s5, T.s5 + 0.26)), sc = 1 + 1.6 * Math.exp(-a * 16) + 0.03 * beatP(t);
      g.save(); g.globalAlpha = clamp(a * 14) * (1 - q); g.translate(540, 1300 - q * 220); g.scale(sc, sc); g.rotate(0.06 * Math.exp(-a * 8) * Math.sin(a * 30));
      text(g, 'Yakınla!', 0, 78, { w: 900, s: 232, ls: -4 }); g.restore();
    }
    const fl = Math.exp(-a * 9) * 0.75; if (fl > 0.01) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(-300, -300, W + 600, H + 600); }
  }
  if (t < T.s5) return;
  // kapanış kartı
  slotText(g, 'Yakınla', 540, 820, { w: 900, s: 184, ls: -3 }, prog(t, T.s5 + 0.12, T.s5 + 0.55), 0, 0.05);
  yemekPill(g, 540, 955, 118, t - (T.s5 + 0.38));
  const so = fit(g, 'Ne lazımsa, Yakınla!', { w: 700, s: 68 }, 960);
  slotText(g, 'Ne lazımsa, Yakınla!', 540, 1128, so, prog(t, T.s5 + 0.5, T.s5 + 0.95), 0, 0.014);
  STORES.forEach(([s, x, ts]) => {
    const dt = t - ts; if (dt <= 0) return;
    const p = spring(dt, 2.0, 7.5);
    g.save(); g.translate(x, 1260); g.scale(p, p);
    g.shadowColor = 'rgba(0,30,90,0.25)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-200, -56, 400, 112, 56); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = C.chip; dot(g, -142, 0, 38); downloadIcon(g, -142, -1, 46, C.blue, 10);
    text(g, s, 36, 15, { f: 'Txt', w: 700, s: 42, c: C.blue });
    g.restore();
    shockRing(g, x, 1260, dt, 520, 0.4, '255,255,255', 8);
  });
  const d = t - CTA5;
  if (d > 0) {
    const p = spring(d, 2.0, 7) * (1 + 0.045 * beatP(t)), fin = t - T.end;
    g.save(); g.translate(540, 1425); g.scale(p, p);
    g.shadowColor = 'rgba(120,60,0,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
    const gr = g.createLinearGradient(0, -68, 0, 68); gr.addColorStop(0, '#FFC561'); gr.addColorStop(1, '#FFA82B');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-300, -68, 600, 136, 68); g.fill(); g.shadowColor = 'transparent';
    text(g, 'Hemen İndir', -34, 22, { w: 900, s: 66, c: C.ink });
    g.fillStyle = C.ink; dot(g, 214, 0, 44); downloadIcon(g, 214, -1, 50, '#fff', 10, Math.abs(Math.sin(t * TAU)) * -9 + 4);
    g.restore();
    shockRing(g, 540, 1425, d, 900, 0.5, '255,197,97', 12);
    if (fin > 0) shockRing(g, 540, cy, fin, 1900, 0.7, '255,255,255', 18);
  }
  const up = E.outExpo(prog(t, 13.7, 14.25));
  if (up > 0) { g.save(); g.globalAlpha = up; text(g, 'yakinla.com', 540, 1568 + (1 - up) * 20, { f: 'Txt', w: 600, s: 40, c: 'rgba(255,255,255,0.9)', ls: 1 }); g.restore(); }
  confetti(g, CONF[2], 540, cy, t - T.end, 1.6);
}

/* ───────────────────────── kamera sarsıntısı ve ana çizim ───────────────────────── */
const IMPACTS = [[0.0, 18], [1.0, 14], [2.0, 28], [4.2, 6], [4.6, 6], [5.0, 12], [7.0, 10], [7.5, 8], [10.0, 32], [11.88, 10], [13.2, 8], [15.0, 20]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 95 + i * 1.7); y += k * Math.cos(dt * 78 + i * 2.3); z += a * 0.0016 * Math.exp(-dt * 9);
  });
  return [x, y, z];
}
function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(540 + sx, 960 + sy); g.scale(1 + sz, 1 + sz); g.translate(-540, -960);
  g.fillStyle = '#000'; g.fillRect(-200, -200, W + 400, H + 400);
  if (t < T.s2) scene1(g, t);
  else if (t < T.s3) scene2(g, t);
  else if (t < T.s4) scene3(g, t);
  else sceneEnd(g, t);
  wipe(g, t, T.s2, -0.32, ['#FFB547', '#1F73F0', '#FFFFFF']);
  wipe(g, t, T.s3, Math.PI + 0.32, ['#FFB547', '#22C55E', '#121A52']);
  wipe(g, t, T.s4, -Math.PI / 2 - 0.2, ['#FFB547', '#FFFFFF', '#1F73F0']);
  g.restore();
  vignette(g);
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +Math.max(0, t).toFixed(4), type, ...o });
  const pan = x => +clamp((x - 540) / 540 * 0.7, -1, 1).toFixed(2);
  cue(0, 'impact', { gain: 0.8 }); cue(0.02, 'shimmer', { dur: 0.5, gain: 0.3 });
  S1_ICONS.forEach(([, x], i) => cue(0.02 + i * 0.045, 'pop', { pitch: 0.9 + i * 0.09, pan: pan(x), gain: 0.4 }));
  cue(0.42, 'whoosh', { dur: 0.3, f0: 700, f1: 3500, gain: 0.3 });
  cue(1.0, 'slam', { gain: 0.75 });
  cue(1.38, 'pop', { pitch: 1.4, gain: 0.35, pan: -0.3 });
  cue(1.72, 'reverse', { dur: 0.28, gain: 0.35 });
  cue(2.0, 'slam', { gain: 1 }); cue(2.0, 'success', { gain: 0.4 }); cue(2.04, 'sparkle', { dur: 0.8, gain: 0.3 });
  [2.5, 3.0].forEach(t => cue(t, 'blip', { pitch: 1.2, gain: 0.2, pan: -0.3 }));
  [[T.s2, 600, 6000], [T.s3, 5000, 500], [T.s4, 500, 7000]].forEach(([t, f0, f1]) => cue(t - 0.26, 'whoosh', { dur: 0.5, f0, f1, gain: 0.6 }));
  cue(T.s2, 'thump', { gain: 0.5 });
  CARDS.forEach((c, i) => cue(3.7 + i * 0.09, 'blip', { pitch: 1 + i * 0.12, gain: 0.2, pan: 0.2 }));
  TAPS.forEach((tp, k) => { cue(tp.t, 'tap', { gain: 0.7 }); cue(tp.t + 0.03, 'whoosh', { dur: 0.36, f0: 1500, f1: 5000, gain: 0.18 }); cue(tp.t + 0.32, 'coin', { pitch: 1 + k * 0.122, gain: 0.4, pan: -0.25 }); });
  cue(CTA_T, 'tap', { gain: 0.8 }); cue(CTA_T + 0.03, 'success', { gain: 0.5 });
  cue(T.s3, 'thump', { gain: 0.5 });
  const track = [];
  for (let t = T.s3 - 0.1; t <= ARRIVE + 0.25; t += 0.05) track.push([+t.toFixed(3), -0.25, +clamp(0.25 + vel(t) * 1.6, 0, 1.5).toFixed(3)]);
  cue(T.s3 - 0.1, 'motor', { gain: 0.2, track });
  cue(ARRIVE, 'doorbell', { gain: 0.5, pan: 0.3 });
  cue(ARRIVE + 0.1, 'click', { gain: 0.4, pan: 0.3 });
  cue(7.2, 'whoosh', { dur: 0.3, f0: 800, f1: 3200, gain: 0.3 });
  cue(LAND, 'pop', { pitch: 0.8, gain: 0.5, pan: 0.3 }); cue(LAND + 0.05, 'shine', { dur: 0.4, gain: 0.3 });
  cue(LAND + 0.06, 'pop', { pitch: 1.5, gain: 0.35 });
  cue(T.s4, 'thump', { gain: 0.5 });
  RING_ICONS.forEach((n, i) => cue(RING_T0 + i * RING_DT, 'pop', { pitch: 0.8 + i * 0.1, gain: 0.32, pan: +(Math.cos(i / 10 * TAU - Math.PI / 2) * 0.6).toFixed(2) }));
  cue(COLLAPSE[0], 'sweep', { dur: 0.3, gain: 0.35 }); cue(COLLAPSE[0] - 0.2, 'reverse', { dur: 0.5, gain: 0.5 });
  cue(T.slam, 'impact', { gain: 1.0, big: true }); cue(T.slam + 0.08, 'shimmer', { dur: 0.6, gain: 0.3 });
  cue(T.slam + 0.95, 'click', { gain: 0.4 });
  cue(T.s5 - 0.02, 'whoosh', { dur: 0.4, f0: 900, f1: 4000, gain: 0.3 });
  cue(T.s5 + 0.38, 'thump', { gain: 0.5 });
  STORES.forEach(([, x, ts], i) => cue(ts, 'pop', { pitch: 1.2 + i * 0.2, gain: 0.3, pan: pan(x) }));
  cue(CTA5, 'pop', { pitch: 1.0, gain: 0.35 }); cue(CTA5 + 0.04, 'coin', { pitch: 1.12, gain: 0.3 });
  cue(T.end, 'impact', { gain: 0.7 }); cue(T.end, 'sparkle', { dur: 1.0, gain: 0.4 }); cue(T.end + 0.04, 'shine', { dur: 0.45, gain: 0.3 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.blue = makeGlow('59,139,255'); SPR.amber = makeGlow('255,181,71');
  const d = canvas(60, 60), dx = d.getContext('2d'); dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(30, 30, 3, 0, TAU); dx.fill();
  SPR.dots = g.createPattern(d, 'repeat');
  const v = g.createRadialGradient(540, 900, 500, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,0.34)');
  SPR.vig = v;
  for (const n in ALL_ICONS) {
    SPR['i_' + n] = mkSprite(ALL_ICONS[n], ISZ);            // gölgeli, serbest ikon
    SPR['f_' + n] = mkSprite(ALL_ICONS[n], 200, 0, false);  // düz (kart ve etiket içi)
    SPR['b_' + n] = mkSprite(ALL_ICONS[n], 190, 5);         // arka plan için bulanık
  }
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
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  initSprites();
  window.CUES = buildCues(); window.VO = VO;
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
