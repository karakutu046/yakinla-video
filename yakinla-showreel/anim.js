'use strict';
/* Yakınla — 20 saniyelik motion graphics tanıtım filmi (9:16, 1080×1920, 30 fps)
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik yalnızca
 * tohumlu (seeded) ve başlangıçta üretilir, yani aynı t her zaman aynı kareyi verir.
 * renderFrame(f) bir kareyi SAMPLES alt-örnekle (180° obtüratör) çizip ortalar:
 * gerçek hareket bulanıklığı.
 *
 * Akış (120 BPM, 1 vuruş = 0.5 sn, 1 ölçü = 2 sn):
 *   0–4   Kanca     21:47, atıştırmalıklar bitti, "Eksik bir şey mi var?"
 *   4–8   Sipariş   soru işaretinin noktası telefona dönüşür, sepet dolar
 *   8–12  Teslimat  3B gece haritası: depodan eve canlı kurye rotası, AFŞİN ve köyleri
 *   12–16 Vaat      ortalama 60 dakikada kapında + 3 özellik kartı
 *   16–20 Kapanış   logo inşası, "Ne Lazımsa, Yakınla!" (heceler jingle'a oturur), mağazalar
 */

const W = 1080, H = 1920, FPS = 30, DUR = 20;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5;
const TAU = Math.PI * 2;

const C = {
  blue: '#1F73F0', blueL: '#3B8BFF', blueD: '#0E5FE0', blueXL: '#9CC2FF',
  ink: '#0B1B33', inkSoft: '#5B6B85', tile: '#F1F6FD', chip: '#E8F0FE',
  amber: '#FFB547', amberD: '#F59A1B', red: '#FF4D5E', white: '#FFFFFF',
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
// Bir kez "zıplayan" darbe: 0'da 0, hızla 1'e çıkıp söner
const kick = (dt, d = 10) => dt <= 0 ? 0 : Math.exp(-d * dt);

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
// Yazıyı maskeli bir şeritten aşağıdan yukarı çıkarır (p: 0→1 giriş, q: 0→1 çıkış)
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.04) {
  g.save();
  g.beginPath(); g.rect(-50, y - o.s * 1.05, W + 100, o.s * 1.38); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.2 };
  });
  g.restore();
}

/* ───────────────────────── sprite önbelleği ───────────────────────── */
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
function glow(g, spr, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * a;
  g.drawImage(spr, x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = ga;
}
function iconSprite(name, size, blur) {
  const pad = Math.ceil(blur * 3 + 12);
  const c = canvas(size + pad * 2, size + pad * 2), x = c.getContext('2d');
  if (blur > 0) x.filter = `blur(${blur}px)`;
  x.translate(c.width / 2, c.height / 2); x.scale(size / 100, size / 100);
  ICON[name](x);
  return c;
}
function sprite(g, spr, x, y, sc = 1, rot = 0, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
}

/* ───────────────────────── ikonlar (100 birimlik kutu, merkez 0,0) ───────────────────────── */
const P = s => new Path2D(s);
const PATHS = {
  bottle: P('M -14 -34 L 14 -34 L 14 -24 Q 31 -16 31 2 L 31 38 Q 31 48 21 48 L -21 48 Q -31 48 -31 38 L -31 2 Q -31 -16 -14 -24 Z'),
  bread: P('M -45 14 C -49 -20 -24 -31 0 -31 C 24 -31 49 -20 45 14 C 44 25 37 30 28 30 L -28 30 C -37 30 -44 25 -45 14 Z'),
  tulip: P('M -22 -34 L 22 -34 C 21 -16 9 -8 11 2 C 13 12 22 20 19 32 L -19 32 C -22 20 -13 12 -11 2 C -9 -8 -21 -16 -22 -34 Z'),
  chips: P('M -33 -40 Q -39 0 -33 40 L 33 40 Q 39 0 33 -40 Z'),
  jug: P('M -30 -16 Q -30 -24 -22 -24 L 22 -24 Q 30 -24 30 -16 L 30 38 Q 30 46 22 46 L -22 46 Q -30 46 -30 38 Z'),
  pin: P('M 512 104 C 340 104, 202 242, 202 414 C 202 540, 270 638, 360 712 C 430 770, 480 830, 504 900 C 508 914, 516 914, 520 900 C 544 830, 594 770, 664 712 C 754 638, 822 540, 822 414 C 822 242, 684 104, 512 104 Z'),
};
const ICON = {
  milk(g, lvl = 1, wave = 0) {
    const body = PATHS.bottle;
    g.fillStyle = 'rgba(214,230,255,0.22)'; g.fill(body);
    g.save(); g.clip(body);
    if (lvl > 0.001) {
      const top = lerp(48, -26, lvl);
      g.beginPath(); g.moveTo(-40, 60); g.lineTo(-40, top);
      const amp = 2.6 * (1 - Math.abs(lvl - 0.5) * 1.2);
      for (let x = -40; x <= 40; x += 4) g.lineTo(x, top + Math.sin(x * 0.16 + wave) * amp);
      g.lineTo(40, 60); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill();
    }
    g.fillStyle = C.blue; g.fillRect(-32, 8, 64, 22);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 11); g.bezierCurveTo(6, 18, 6, 26, 0, 26); g.bezierCurveTo(-6, 26, -6, 18, 0, 11); g.fill();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; g.stroke(body);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-22, -2); g.lineTo(-22, 2); g.stroke();
    g.beginPath(); g.moveTo(-22, 34); g.lineTo(-22, 40); g.stroke();
    g.fillStyle = C.blue; g.beginPath(); g.roundRect(-16, -47, 32, 15, 4); g.fill();
    g.fillStyle = C.blueD; g.fillRect(-16, -38, 32, 3);
  },
  bread(g) {
    const gr = g.createLinearGradient(0, -31, 0, 30);
    gr.addColorStop(0, '#F5B86A'); gr.addColorStop(1, '#C5742C');
    g.fillStyle = gr; g.fill(PATHS.bread);
    g.strokeStyle = '#FDE3B4'; g.lineWidth = 5; g.lineCap = 'round';
    for (const x of [-22, 0, 22]) { g.beginPath(); g.moveTo(x - 8, -6); g.lineTo(x + 8, -20); g.stroke(); }
    g.fillStyle = 'rgba(120,50,10,0.18)'; g.beginPath(); g.roundRect(-44, 20, 88, 10, 5); g.fill();
  },
  egg(g) {
    const one = (x, y, r, col) => {
      g.save(); g.translate(x, y); g.rotate(r);
      g.fillStyle = col; g.beginPath();
      g.moveTo(0, -30); g.bezierCurveTo(16, -30, 24, -2, 24, 8); g.bezierCurveTo(24, 22, 13, 30, 0, 30);
      g.bezierCurveTo(-13, 30, -24, 22, -24, 8); g.bezierCurveTo(-24, -2, -16, -30, 0, -30); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(-8, -10, 5, 9, 0.3, 0, TAU); g.fill();
      g.restore();
    };
    one(16, 2, 0.22, '#F1CB98');
    one(-14, 8, -0.15, '#FFF5E6');
  },
  tea(g) {
    g.fillStyle = '#EAF1FB'; g.beginPath(); g.ellipse(0, 36, 44, 9, 0, 0, TAU); g.fill();
    g.strokeStyle = C.blue; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 35, 34, 5.5, 0, 0, TAU); g.stroke();
    const gl = PATHS.tulip;
    g.fillStyle = 'rgba(230,240,255,0.25)'; g.fill(gl);
    g.save(); g.clip(gl);
    const gr = g.createLinearGradient(0, -26, 0, 32); gr.addColorStop(0, '#E8702E'); gr.addColorStop(1, '#8A260B');
    g.fillStyle = gr; g.fillRect(-30, -25, 60, 60); g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2.5; g.stroke(gl);
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-15, -26); g.quadraticCurveTo(-12, -14, -6, -6); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 3.5;
    for (const x of [-8, 8]) { g.beginPath(); g.moveTo(x, -40); g.bezierCurveTo(x - 7, -48, x + 7, -54, x, -62); g.stroke(); }
  },
  chips(g) {
    const body = PATHS.chips;
    const gr = g.createLinearGradient(-36, 0, 36, 0);
    gr.addColorStop(0, '#F2801A'); gr.addColorStop(0.45, '#FFB547'); gr.addColorStop(1, '#EE7410');
    g.fillStyle = gr; g.fill(body);
    g.save(); g.clip(body);
    g.fillStyle = '#E2382B'; g.fillRect(-40, -31, 80, 9);
    g.fillStyle = 'rgba(255,255,255,0.32)'; g.beginPath(); g.roundRect(-25, -36, 7, 70, 3.5); g.fill();
    g.restore();
    const seal = y => { // tırtıklı kapak
      g.fillStyle = '#D9620B'; g.beginPath(); g.moveTo(-35, y - 4);
      for (let x = -35; x <= 35; x += 5) g.lineTo(x, y + ((x / 5) % 2 ? 5 : 1) * Math.sign(y));
      g.lineTo(35, y - 4 * Math.sign(y)); g.lineTo(-35, y - 4 * Math.sign(y)); g.closePath(); g.fill();
      g.fillRect(-35, y - (y < 0 ? 0 : 4), 70, 4);
    };
    seal(-41); seal(41);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 6, 22, 17, 0, 0, TAU); g.fill();
    g.fillStyle = '#FFD45C'; g.beginPath(); g.ellipse(-2, 6, 14, 9.5, -0.35, 0, TAU); g.fill();
    g.strokeStyle = '#E8A22A'; g.lineWidth = 2; g.beginPath(); g.ellipse(-2, 6, 14, 9.5, -0.35, 0, TAU); g.stroke();
    g.fillStyle = '#F2B33A'; g.beginPath(); g.ellipse(8, 9, 9, 6, 0.4, 0, TAU); g.fill();
  },
  detergent(g) {
    const gr = g.createLinearGradient(-30, -24, 30, 46);
    gr.addColorStop(0, '#A78BFA'); gr.addColorStop(1, '#6D28D9');
    g.strokeStyle = '#7C3AED'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(6, -22); g.quadraticCurveTo(6, -40, 18, -40); g.quadraticCurveTo(28, -40, 28, -22); g.stroke();
    g.fillStyle = '#8B5CF6'; g.beginPath(); g.roundRect(-24, -36, 20, 14, 3); g.fill();
    g.fillStyle = C.amber; g.beginPath(); g.roundRect(-26, -45, 24, 11, 3); g.fill();
    g.fillStyle = gr; g.fill(PATHS.jug);
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-21, 2, 42, 32, 6); g.fill();
    g.fillStyle = '#9CC2FF';
    for (const [x, y, r] of [[-8, 14, 6], [5, 22, 4.5], [9, 11, 3.5], [-4, 26, 3]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.roundRect(-25, -18, 6, 54, 3); g.fill();
  },
};
const TALL = new Set(['milk', 'chips', 'detergent']); // ürün kutusunda biraz küçültülür

// Tek renk arayüz ikonları
function micon(g, name, col, lw = 7) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  const st = () => g.stroke();
  switch (name) {
    case 'cart':
      g.beginPath(); g.moveTo(-42, -30); g.lineTo(-30, -30); g.lineTo(-20, 14); g.lineTo(30, 14); g.lineTo(40, -16); g.lineTo(-26, -16); st();
      g.beginPath(); g.arc(-12, 30, 7, 0, TAU); g.fill(); g.beginPath(); g.arc(24, 30, 7, 0, TAU); g.fill(); break;
    case 'search':
      g.beginPath(); g.arc(-6, -6, 22, 0, TAU); st(); g.beginPath(); g.moveTo(11, 11); g.lineTo(30, 30); st(); break;
    case 'box':
      g.beginPath(); g.roundRect(-36, -26, 72, 58, 8); st();
      g.beginPath(); g.moveTo(-36, -6); g.lineTo(36, -6); st();
      g.beginPath(); g.moveTo(-10, -26); g.lineTo(-10, 6); g.lineTo(10, 6); g.lineTo(10, -26); st(); break;
    case 'house':
      g.beginPath(); g.moveTo(-40, 0); g.lineTo(0, -34); g.lineTo(40, 0); st();
      g.beginPath(); g.moveTo(-28, -8); g.lineTo(-28, 34); g.lineTo(28, 34); g.lineTo(28, -8); st();
      g.beginPath(); g.roundRect(-9, 12, 18, 22, 3); g.fill(); break;
    case 'scooter':
      g.beginPath(); g.arc(-26, 22, 11, 0, TAU); st(); g.beginPath(); g.arc(28, 22, 11, 0, TAU); st();
      g.beginPath(); g.moveTo(-40, 8); g.quadraticCurveTo(-38, -6, -20, -6); g.lineTo(0, -6); g.lineTo(10, 22); g.lineTo(-14, 22); st();
      g.beginPath(); g.moveTo(10, 22); g.lineTo(22, -24); g.lineTo(34, -24); st();
      g.beginPath(); g.roundRect(-42, -36, 30, 24, 4); g.fill(); break;
    case 'shield':
      g.beginPath(); g.moveTo(0, -40); g.lineTo(34, -26); g.lineTo(34, 2); g.quadraticCurveTo(34, 30, 0, 42); g.quadraticCurveTo(-34, 30, -34, 2); g.lineTo(-34, -26); g.closePath(); st();
      g.beginPath(); g.moveTo(-14, 2); g.lineTo(-3, 13); g.lineTo(17, -9); st(); break;
    case 'clock':
      g.beginPath(); g.arc(0, 0, 36, 0, TAU); st();
      g.beginPath(); g.moveTo(0, -20); g.lineTo(0, 0); g.lineTo(15, 9); st(); break;
    case 'check':
      g.beginPath(); g.moveTo(-24, 2); g.lineTo(-7, 19); g.lineTo(25, -15); st(); break;
    case 'plus':
      g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.moveTo(0, -18); g.lineTo(0, 18); st(); break;
    case 'mappin':
      g.beginPath(); g.moveTo(0, 42); g.bezierCurveTo(-10, 26, -32, 8, -32, -10); g.arc(0, -10, 32, Math.PI, 0); g.bezierCurveTo(32, 8, 10, 26, 0, 42); g.closePath(); st();
      g.beginPath(); g.arc(0, -10, 11, 0, TAU); st(); break;
    case 'download':
      g.beginPath(); g.moveTo(0, -36); g.lineTo(0, 12); st();
      g.beginPath(); g.moveTo(-18, -6); g.lineTo(0, 12); g.lineTo(18, -6); st();
      g.beginPath(); g.moveTo(-34, 18); g.lineTo(-34, 34); g.lineTo(34, 34); g.lineTo(34, 18); st(); break;
    case 'bag':
      g.beginPath(); g.roundRect(-32, -16, 64, 52, 8); st();
      g.beginPath(); g.moveTo(-14, -16); g.lineTo(-14, -24); g.quadraticCurveTo(-14, -38, 0, -38); g.quadraticCurveTo(14, -38, 14, -24); g.lineTo(14, -16); st(); break;
  }
}
function miconAt(g, name, x, y, size, col, lw = 7, rot = 0) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(size / 100, size / 100); micon(g, name, col, lw); g.restore();
}

// Elle çizilmiş soru işareti: kanca vuruşla, nokta ayrı (sahne geçişinde nokta kopar)
function qmark(g, x, y, size, col, hookAlpha = 1, dot = true, lw = null) {
  const u = size / 100;
  g.save(); g.translate(x, y);
  if (hookAlpha > 0) {
    g.globalAlpha *= hookAlpha;
    g.strokeStyle = col; g.lineWidth = lw || 15 * u; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.arc(0, -50 * u, 20 * u, Math.PI * 0.98, Math.PI * 2.32, false);
    g.quadraticCurveTo(0, -27 * u, 0, -22 * u);
    g.stroke();
    g.globalAlpha /= hookAlpha;
  }
  if (dot) { g.fillStyle = col; g.beginPath(); g.arc(0, -5 * u, 8.5 * u, 0, TAU); g.fill(); }
  g.restore();
}

/* ───────────────────────── logo ───────────────────────── */
// o: grow (pin, uçtan büyür), ring, face, hands (görünürlük), am/ah (ibre açıları), glint (-0.3..1.3)
function drawLogo(g, x, y, size, o) {
  const k = size / 1024;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-512, -512);
  const grow = o.grow == null ? 1 : o.grow;
  if (grow > 0.001) {
    g.save();
    g.translate(512, 905); g.scale(grow, grow); g.translate(-512, -905);
    const pg = g.createLinearGradient(0, 104, 0, 914);
    pg.addColorStop(0, '#3B8BFF'); pg.addColorStop(0.5, '#1F73F0'); pg.addColorStop(1, '#0E5FE0');
    g.shadowColor = 'rgba(0,30,90,0.28)'; g.shadowBlur = 40 * k * grow; g.shadowOffsetY = 18 * k * grow;
    g.fillStyle = pg; g.fill(PATHS.pin);
    g.shadowColor = 'transparent';
    const hl = g.createRadialGradient(358, 256, 0, 358, 256, 614);
    hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(0.6, 'rgba(255,255,255,0.05)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fill(PATHS.pin);
    // halka
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
      g.save(); g.clip(PATHS.pin);
      const gx = lerp(100, 924, o.glint);
      const gg = g.createLinearGradient(gx - 140, 0, gx + 140, 0);
      gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gg; g.setTransform(g.getTransform().multiply(new DOMMatrix().translate(gx, 500).skewX(-22).translate(-gx, -500)));
      g.fillRect(gx - 140, 0, 280, 1024);
      g.restore();
    }
    g.restore();
  }
  g.restore();
}
// Haritadaki konum pini (logo değil: içi ev ikonu)
function mapPin(g, x, y, size, icon = 'house', col = C.blue) {
  const k = size / 1024;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-512, -905);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30 * k; g.shadowOffsetY = 14 * k;
  g.fillStyle = col; g.fill(PATHS.pin); g.shadowColor = 'transparent';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(512, 414, 196, 0, TAU); g.fill();
  g.translate(512, 420); g.scale(3.6, 3.6); micon(g, icon, col, 8);
  g.restore();
}

/* ───────────────────────── arka planlar ───────────────────────── */
const STARS = (() => {
  const r = mulberry32(11), a = [];
  for (let i = 0; i < 170; i++) a.push({ x: r() * W, y: r() * 1700, r: 0.7 + r() * 2.3, a: 0.25 + r() * 0.65, sp: 1 + r() * 3, ph: r() * TAU });
  return a;
})();
function stars(g, t, yMax = 1e9, alpha = 1, drift = 6) {
  g.fillStyle = '#fff';
  for (const s of STARS) {
    const y = s.y - t * drift;
    if (y > yMax) continue;
    g.globalAlpha = alpha * s.a * (0.6 + 0.4 * Math.sin(t * s.sp + s.ph));
    g.beginPath(); g.arc(s.x, y, s.r, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
}
function bgNight(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#020816'); gr.addColorStop(0.6, '#071B40'); gr.addColorStop(1, '#0C2E66');
  g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
  glow(g, SPR.blue, 540, 1500, 1100, 0.45);
  stars(g, t);
}
function bgBlue(g, t, opts = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#3B8BFF'); gr.addColorStop(0.5, '#1F73F0'); gr.addColorStop(1, '#0E5FE0');
  g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
  // nokta ızgarası (yavaş kayar) — ritimle hafifçe parlar
  const beat = (t % 0.5) / 0.5, pulse = t > 4 && t < 15.5 ? Math.exp(-beat * 6) : 0;
  g.save();
  g.globalAlpha = 0.09 + 0.05 * pulse;
  g.fillStyle = SPR.dots; g.translate(0, -((t * 30) % 60)); g.fillRect(-60, -60, W + 120, H + 180);
  g.restore();
  glow(g, SPR.white, opts.gx || 540, opts.gy || 900, opts.gr || 900, opts.ga == null ? 0.22 : opts.ga);
}
function vignette(g) {
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
}

/* ───────────────────────── 1. KANCA (0–4 sn) ───────────────────────── */
function odometer(g, str, cx, cy, size, t, t0) {
  const cell = size * 0.63, colonW = size * 0.32;
  let total = 0; for (const ch of str) total += ch === ':' ? colonW : cell;
  let x = cx - total / 2, di = 0;
  setFont(g, { w: 900, s: size }); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  for (const ch of str) {
    if (ch === ':') {
      const on = t < t0 + 0.8 || Math.floor((t - t0) * 2) % 2 === 0;
      g.globalAlpha = on ? 1 : 0.25; g.fillText(':', x + colonW / 2, cy - size * 0.06); g.globalAlpha = 1;
      x += colonW; continue;
    }
    const d = +ch, p = E.outQuart(prog(t, t0 + di * 0.07, t0 + 0.62 + di * 0.07));
    const v = d + 10 * (2 + di) * (1 - p), base = Math.floor(v), lh = size * 1.12;
    g.save(); g.beginPath(); g.rect(x - 6, cy - size * 0.47, cell + 12, size * 0.86); g.clip();
    for (let k = -1; k <= 1; k++) {
      const n = base + k, yy = cy - (n - v) * lh;
      g.fillText(String(((n % 10) + 10) % 10), x + cell / 2, yy);
    }
    g.restore();
    x += cell; di++;
  }
}
// Yazı "çakma": büyükten hızla iner, yere oturunca yay gibi titrer
function slam(t, tl) {
  if (t < tl - 0.1) return null;
  if (t <= tl) { const p = prog(t, tl - 0.1, tl); return { sc: lerp(2.7, 1, E.inCubic(p)), al: clamp(p * 2.5) }; }
  const dt = t - tl; return { sc: 1 + 0.075 * Math.exp(-dt * 11) * Math.cos(dt * 36), al: 1 };
}
const HOOK = { lines: [
  { s: 'Eksik', y: 850, size: 250, tl: 2.5 },
  { s: 'bir şey', y: 1085, size: 212, tl: 2.75 },
  { s: 'mi var', y: 1315, size: 212, tl: 3.0, q: true },
] };
function hookLayout(g) {
  const L = HOOK.lines[2], u = L.size / 100;
  const tw = measure(g, L.s, { w: 900, s: L.size });
  const total = tw + 16 * u + 40 * u;
  const x0 = 540 - total / 2;
  HOOK.l3x = x0; HOOK.qx = x0 + tw + 16 * u + 20 * u;
  HOOK.dot = [HOOK.qx, L.y - 5 * u, 8.5 * u];
}

function scene1(g, t) {
  // gece
  bgNight(g, t);
  // ay
  const ma = E.outCubic(prog(t, 0.05, 0.6));
  glow(g, SPR.amber, 850, 300, 230, 0.35 * ma);
  sprite(g, SPR.moon, 850, 300, lerp(0.7, 1, ma), -0.3, ma);

  // saat: 21:47 (çalışma saatleri 09:00–23:00; sipariş ve teslimat kapanıştan önce biter)
  const mv = E.inOutCubic(prog(t, 0.85, 1.25));
  const cy = lerp(840, 470, mv), cs = lerp(1, 0.58, mv);
  g.save(); g.translate(540, cy); g.scale(cs, cs);
  glow(g, SPR.blue, 0, 0, 560, 0.5);
  odometer(g, '21:47', 0, 0, 300, t, 0.0);
  g.restore();

  // cips paketi düşer, ters döner: içinden üç kırıntı dökülür, o kadar
  const S = 4.2, BY = 1000;
  if (t > 0.7) {
    const fall = prog(t, 0.72, 1.0), dt = t - 1.0;
    const by = lerp(-300, BY, E.inQuad(fall));
    let sx = 1, sy = 1;
    if (dt < 0) { sx = lerp(1, 0.9, fall); sy = lerp(1, 1.12, fall); }
    else { const k = 0.24 * Math.exp(-dt * 10) * Math.cos(dt * 30); sx = 1 + k; sy = 1 - k; }
    const flip = E.outBack(prog(t, 1.12, 1.45));
    const sh = t > 1.45 ? 0.09 * Math.sin((t - 1.45) * 42) * Math.exp(-(t - 1.45) * 3.5) : 0;
    const rot = -2.75 * flip + sh;
    glow(g, SPR.amber, 540, by, 380, 0.22);
    // kırıntılar
    for (const [tc, dx, sz] of [[1.34, -16, 24], [1.44, 12, 18], [1.55, -2, 15], [1.68, 8, 11]]) {
      const a = t - tc; if (a < 0 || a > 0.9) continue;
      const ox = Math.sin(-2.75) * 40 * S, oy = Math.cos(-2.75) * -40 * S;
      const x = 540 + ox + dx * 1.5 + dx * a * 3, y = BY + oy + 40 + 620 * a * a;
      g.save(); g.globalAlpha = clamp(1 - (a - 0.6) / 0.3); g.translate(x, y); g.rotate(a * 9 + dx);
      g.fillStyle = '#FFD45C'; g.beginPath(); g.ellipse(0, 0, sz, sz * 0.62, 0, 0, TAU); g.fill();
      g.strokeStyle = '#E8A22A'; g.lineWidth = 3; g.stroke();
      g.restore();
    }
    g.save(); g.translate(540, by); g.rotate(rot);
    g.translate(0, 46 * S); g.scale(sx * S, sy * S); g.translate(0, -46);
    ICON.chips(g);
    g.restore();
  }
  // "Atıştırmalıklar mı bitti?"
  if (t > 1.15) {
    const o = fit(g, 'Atıştırmalıklar', { w: 900, s: 132, c: '#fff' }, 960);
    slotText(g, 'Atıştırmalıklar', 540, 1385, o, prog(t, 1.18, 1.72), 0, 0.03);
    slotText(g, 'mı bitti?', 540, 1385 + o.s * 1.1, o, prog(t, 1.32, 1.86), 0, 0.05);
  }
  // diğer eksikler: ekmek, yumurta, çay, domates
  const pops = [['bread', 195, 820, 2.0, -0.4], ['egg', 885, 820, 2.125, 0.4], ['tea', 190, 1130, 2.25, -0.3], ['milk', 890, 1130, 2.375, 0.35]];
  for (const [nm, x, y, tp, r0] of pops) {
    if (t < tp) continue;
    const p = prog(t, tp, tp + 0.3), s = E.outBack(p), fl = Math.sin((t - tp) * 3) * 6;
    g.save(); g.translate(x, y + fl); g.rotate(r0 * (1 - E.outCubic(p))); g.scale(s * 2.5, s * 2.5);
    if (TALL.has(nm)) g.scale(0.85, 0.85);
    ICON[nm](g);
    g.restore();
    // küçük "?" rozeti
    const bp = E.outBack(prog(t, tp + 0.08, tp + 0.35));
    if (bp > 0) {
      g.save(); g.translate(x + 88, y - 88 + fl); g.scale(bp, bp);
      g.fillStyle = C.amber; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
      qmark(g, 0, 19, 46, C.ink, 1, true, 7);
      g.restore();
    }
  }

  // mavi daire silme → soru
  const wp = E.inOutCubic(prog(t, 2.4, 2.72));
  if (wp > 0) {
    g.save(); g.beginPath(); g.arc(540, 1070, wp * 2300, 0, TAU); g.clip();
    bgBlue(g, t, { ga: 0.18 });
    // arkada dev hayalet soru işareti
    g.save(); g.translate(560, 1180); g.rotate(-0.12 + 0.05 * Math.sin(t * 1.3)); g.scale(1 + (t - 2.4) * 0.05, 1 + (t - 2.4) * 0.05);
    qmark(g, 0, 520, 1350, 'rgba(255,255,255,0.08)', 1, true);
    g.restore();
    g.restore();
    if (wp < 1) { // dalga kenarı
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 14 * (1 - wp);
      g.beginPath(); g.arc(540, 1070, wp * 2300, 0, TAU); g.stroke();
    }
  }
  // "Eksik / bir şey / mi var?"
  HOOK.lines.forEach((L, k) => {
    const s = slam(t, L.tl); if (!s) return;
    const pe = prog(t, 3.42 + k * 0.05, 3.74 + k * 0.05);
    const dy = -1700 * E.inBack(pe), al = s.al * (1 - clamp((pe - 0.75) / 0.25));
    if (al <= 0) return;
    const o = { w: 900, s: L.size, c: '#fff' };
    g.save(); g.globalAlpha = al;
    g.translate(540, L.y - L.size * 0.36 + dy); g.scale(s.sc, s.sc); g.translate(-540, -(L.y - L.size * 0.36));
    if (!L.q) text(g, L.s, 540, L.y, o);
    else {
      text(g, L.s, HOOK.l3x, L.y, { ...o, a: 'left' });
      qmark(g, HOOK.qx, L.y, L.size, C.amber, 1, t < 3.42);
    }
    g.restore();
  });
  // soru işaretinin noktası kopup zıplar → telefonun tohumu
  if (t >= 3.42) {
    const [x0, y0, r0] = HOOK.dot;
    const ant = prog(t, 3.42, 3.56), p = prog(t, 3.56, 4.0);
    const x = lerp(x0, 540, p), y = lerp(y0, 1080, p) - 560 * 4 * p * (1 - p);
    const r = lerp(r0, 34, E.outCubic(p));
    const vy = lerp(y0 - 1080, 0, 0) ;
    let sx = 1, sy = 1, rot = 0;
    if (p <= 0) { const a = Math.sin(ant * Math.PI); sx = 1 + 0.35 * a; sy = 1 - 0.3 * a; }
    else { const dx = 540 - x0, dyv = (1080 - y0) - 560 * 4 * (1 - 2 * p); rot = Math.atan2(dyv, dx); const sp = clamp(Math.hypot(dx, dyv) / 2500); sx = 1 + 0.5 * sp; sy = 1 - 0.3 * sp; }
    void vy;
    glow(g, SPR.amber, x, y, r * 5, 0.5);
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy);
    g.fillStyle = C.amber; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.restore();
  }
}

/* ───────────────────────── 2. SİPARİŞ (4–8 sn) ───────────────────────── */
const PH = { x: 540, y: 1080, s: 0.9, W: 560, H: 1120, bz: 16, r: 78 };
PH.SW = PH.W - 2 * PH.bz; PH.SH = PH.H - 2 * PH.bz;
const TILE = { w: (PH.SW - 56 - 16) / 2, h: 232, x0: 28, y0: 366, gap: 16 };
const PRODUCTS = [['chips', 'Cips'], ['milk', 'Süt'], ['bread', 'Ekmek'], ['egg', 'Yumurta'], ['tea', 'Çay'], ['detergent', 'Deterjan']];
const CHIPS = ['Atıştırmalık', 'Süt & Kahvaltılık', 'Temel Gıda', 'İçecek', 'Temizlik', 'Kişisel Bakım'];
const TAPS = [{ t: 5.5, i: 0 }, { t: 6.0, i: 1 }, { t: 6.5, i: 3 }, { t: 7.0, i: 4 }];
const CTA_TAP = 7.5;
const CART = { x: PH.SW - 70, y: 116 };
function tileRect(i) { const c = i % 2, r = (i / 2) | 0; return [TILE.x0 + c * (TILE.w + TILE.gap), TILE.y0 + r * (TILE.h + TILE.gap)]; }
function tileIcon(i) { const [x, y] = tileRect(i); return [x + TILE.w / 2, y + 100]; }
function tilePlus(i) { const [x, y] = tileRect(i); return [x + TILE.w - 40, y + TILE.h - 40]; }
function ctaCenter() { return [PH.SW / 2, PH.SH - 82]; }

function phoneTransform(t) {
  const fy = Math.sin((t - 4) * 1.7) * 9, rot = -0.025 + 0.018 * Math.sin((t - 4) * 1.25);
  return { x: PH.x, y: PH.y + fy, rot, s: PH.s };
}
function cursorPos(t) {
  const pts = [[PH.SW + 120, PH.SH + 160, 5.05]];
  for (const tp of TAPS) pts.push([...tilePlus(tp.i), tp.t]);
  pts.push([...ctaCenter(), CTA_TAP]);
  pts.push([PH.SW + 160, PH.SH + 220, 8.1]);
  if (t <= pts[0][2]) return pts[0];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1];
    if (t <= b[2]) {
      const p = E.inOutCubic(prog(t, a[2] + 0.08, b[2] - 0.04));
      return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) - Math.sin(p * Math.PI) * 40];
    }
  }
  return pts[pts.length - 1];
}
function cartCount(t) { let n = 0; for (const tp of TAPS) if (t >= tp.t + 0.4) n++; return n; }

function drawPhoneScreen(g, t) {
  const SW = PH.SW, SH = PH.SH;
  const ca = prog(t, 4.28, 4.5);
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, SW, SH);
  if (ca <= 0) return;
  g.save(); g.globalAlpha = ca;
  // üst bar (mavi)
  const hd = E.outExpo(prog(t, 4.25, 4.75));
  g.save(); g.translate(0, -(1 - hd) * 270);
  const hg = g.createLinearGradient(0, 0, 0, 262); hg.addColorStop(0, '#3B8BFF'); hg.addColorStop(1, '#1F73F0');
  g.fillStyle = hg; g.fillRect(0, 0, SW, 262);
  text(g, '21:49', 44, 50, { f: 'Txt', w: 600, s: 24, a: 'left' });
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(SW - 84, 34, 38, 18, 5); g.fill(); g.fillRect(SW - 44, 39, 4, 8);
  for (let i = 0; i < 4; i++) { g.fillRect(SW - 140 + i * 9, 50 - 5 - i * 4, 6, 6 + i * 4); }
  text(g, 'Teslimat adresi', 40, 104, { f: 'Txt', w: 500, s: 22, a: 'left', c: 'rgba(255,255,255,0.78)' });
  const ad = text(g, 'Ev · Afşin', 40, 144, { f: 'Txt', w: 700, s: 32, a: 'left' }); void ad;
  const aw = measure(g, 'Ev · Afşin', { f: 'Txt', w: 700, s: 32 });
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(52 + aw, 128); g.lineTo(60 + aw, 136); g.lineTo(68 + aw, 128); g.stroke();
  // sepet düğmesi + rozet
  const n = cartCount(t);
  let bump = 0; for (const tp of TAPS) bump += 0.35 * kick(t - (tp.t + 0.4), 9) * Math.cos((t - tp.t - 0.4) * 30) * (t > tp.t + 0.4 ? 1 : 0);
  g.save(); g.translate(CART.x, CART.y); g.scale(1 + bump * 0.4, 1 + bump * 0.4);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill();
  miconAt(g, 'cart', 0, 2, 46, C.blue, 8);
  if (n > 0) {
    g.translate(26, -26); g.scale(1 + bump, 1 + bump);
    g.fillStyle = C.amber; g.beginPath(); g.arc(0, 0, 19, 0, TAU); g.fill();
    text(g, String(n), 0, 8, { f: 'Txt', w: 700, s: 23, c: C.ink });
  }
  g.restore();
  // arama
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(28, 184, SW - 56, 58, 29); g.fill();
  miconAt(g, 'search', 64, 213, 30, '#8A97AD', 8);
  text(g, 'Ne lazım?', 92, 222, { f: 'Txt', w: 500, s: 24, a: 'left', c: '#8A97AD' });
  g.restore();
  // kategori çipleri (yatay kayar)
  const cp = E.outExpo(prog(t, 4.4, 4.9));
  let cx = 28 + (1 - cp) * 300 - E.inOutCubic(prog(t, 5.0, 7.4)) * 330;
  for (let i = 0; i < CHIPS.length; i++) {
    const o = { f: 'Txt', w: 600, s: 21 };
    const w = measure(g, CHIPS[i], o) + 40;
    g.fillStyle = i === 0 ? C.blue : C.chip; g.beginPath(); g.roundRect(cx, 288, w, 50, 25); g.fill();
    text(g, CHIPS[i], cx + w / 2, 321, { ...o, c: i === 0 ? '#fff' : C.blue });
    cx += w + 12;
  }
  // ürün kutuları
  for (let i = 0; i < PRODUCTS.length; i++) {
    const [x, y] = tileRect(i), tp = 4.42 + i * 0.065;
    const p = prog(t, tp, tp + 0.38); if (p <= 0) continue;
    const s = E.outBack(p);
    g.save(); g.translate(x + TILE.w / 2, y + TILE.h / 2); g.scale(s, s); g.translate(-TILE.w / 2, -TILE.h / 2);
    g.globalAlpha *= clamp(p * 3);
    g.fillStyle = C.tile; g.beginPath(); g.roundRect(0, 0, TILE.w, TILE.h, 30); g.fill();
    const tap = TAPS.find(q => q.i === i);
    const gone = tap && t > tap.t ? 1 - 0.6 * prog(t, tap.t, tap.t + 0.05) * (1 - prog(t, tap.t + 0.45, tap.t + 0.7)) : 1;
    g.save(); g.translate(TILE.w / 2, 100); g.scale(1.25, 1.25); g.globalAlpha *= gone;
    if (TALL.has(PRODUCTS[i][0])) g.scale(0.8, 0.8);
    ICON[PRODUCTS[i][0]](g);
    g.restore();
    text(g, PRODUCTS[i][1], 20, TILE.h - 26, { f: 'Txt', w: 700, s: 26, a: 'left', c: C.ink });
    // + düğmesi (basılınca küçülür, sonra ✓ olur)
    const pr = tap ? kick(t - tap.t, 14) * (t > tap.t ? 1 : 0) : 0;
    const done = tap && t > tap.t + 0.05;
    g.save(); g.translate(TILE.w - 40, TILE.h - 40); g.scale(1 - pr * 0.25, 1 - pr * 0.25);
    g.fillStyle = done ? '#16A34A' : C.blue; g.beginPath(); g.arc(0, 0, 25, 0, TAU); g.fill();
    miconAt(g, done ? 'check' : 'plus', 0, 0, 34, '#fff', 11);
    g.restore();
    g.restore();
  }
  // uçan ürünler → sepet
  for (const tp of TAPS) {
    const p = prog(t, tp.t + 0.02, tp.t + 0.4); if (p <= 0 || p >= 1) continue;
    const [x0, y0] = tileIcon(tp.i), [x1, y1] = [CART.x, CART.y];
    const e = E.inOutCubic(p), cxp = (x0 + x1) / 2 - 40, cyp = Math.min(y0, y1) - 170;
    const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cxp + e * e * x1;
    const y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cyp + e * e * y1;
    const s = lerp(1.25, 0.35, E.inCubic(p));
    g.save(); g.translate(x, y); g.rotate(e * 1.6); g.scale(s, s);
    if (TALL.has(PRODUCTS[tp.i][0])) g.scale(0.8, 0.8);
    ICON[PRODUCTS[tp.i][0]](g);
    g.restore();
  }
  // alt "Siparişi onayla" çubuğu
  const cb = E.outExpo(prog(t, 7.1, 7.4));
  if (cb > 0) {
    g.save(); g.translate(0, (1 - cb) * 190);
    g.shadowColor = 'rgba(11,27,51,0.18)'; g.shadowBlur = 30; g.shadowOffsetY = -6;
    g.fillStyle = '#fff'; g.fillRect(0, SH - 158, SW, 158); g.shadowColor = 'transparent';
    const [bx, by] = ctaCenter();
    const pr = kick(t - CTA_TAP, 14) * (t > CTA_TAP ? 1 : 0);
    g.translate(bx, by); g.scale(1 - pr * 0.06, 1 - pr * 0.06);
    g.fillStyle = C.blue; g.beginPath(); g.roundRect(-(SW - 56) / 2, -46, SW - 56, 92, 46); g.fill();
    text(g, 'Siparişi onayla', -(SW - 56) / 2 + 40, 11, { f: 'Txt', w: 700, s: 30, a: 'left' });
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.roundRect((SW - 56) / 2 - 136, -24, 112, 48, 24); g.fill();
    text(g, `${cartCount(t)} ürün`, (SW - 56) / 2 - 80, 9, { f: 'Txt', w: 700, s: 22 });
    g.restore();
  }
  // dokunma dalgaları
  for (const tp of [...TAPS.map(q => [q.t, ...tilePlus(q.i)]), [CTA_TAP, ...ctaCenter()]]) {
    const dt = t - tp[0]; if (dt < 0 || dt > 0.45) continue;
    g.strokeStyle = `rgba(31,115,240,${0.55 * (1 - dt / 0.45)})`; g.lineWidth = 6;
    g.beginPath(); g.arc(tp[1], tp[2], 24 + dt * 260, 0, TAU); g.stroke();
  }
  // başarı: ✓
  const ok = prog(t, 7.56, 7.82);
  if (ok > 0) {
    g.fillStyle = `rgba(255,255,255,${0.93 * E.outCubic(prog(t, 7.55, 7.7))})`; g.fillRect(0, 0, SW, SH);
    const r = 112 * E.outBack(ok);
    g.fillStyle = C.blue; g.beginPath(); g.arc(SW / 2, SH / 2 - 40, r, 0, TAU); g.fill();
    const cp2 = E.outCubic(prog(t, 7.62, 7.82));
    g.save(); g.translate(SW / 2, SH / 2 - 40); g.scale(2.4, 2.4);
    g.strokeStyle = '#fff'; g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round';
    g.setLineDash([90 * cp2, 200]);
    g.beginPath(); g.moveTo(-24, 2); g.lineTo(-7, 19); g.lineTo(25, -15); g.stroke();
    g.setLineDash([]);
    g.restore();
    const tp2 = E.outExpo(prog(t, 7.66, 7.86)) * (1 - prog(t, 7.74, 7.84));
    g.globalAlpha *= tp2;
    text(g, 'Siparişin alındı!', SW / 2, SH / 2 + 140 + (1 - tp2) * 30, { f: 'Txt', w: 700, s: 36, c: C.ink });
  }
  g.restore();
}

const FLOATERS = [
  { n: 'chips', x: 130, y: 660, s: 0.95, b: 'b2', d: 0.6, r: 0.35 },
  { n: 'tea', x: 965, y: 820, s: 0.85, b: 'b2', d: 0.5, r: -0.2 },
  { n: 'bread', x: 960, y: 1560, s: 1.5, b: 'b8', d: 1.4, r: 0.2 },
  { n: 'egg', x: 95, y: 1430, s: 1.6, b: 'b8', d: 1.5, r: -0.25 },
];
function floaters(g, t, t0, fg) {
  for (const f of FLOATERS) {
    if ((f.b === 'b8') !== fg) continue;
    const p = E.outBack(prog(t, t0 + f.d * 0.1, t0 + 0.45 + f.d * 0.1));
    if (p <= 0) continue;
    const dx = Math.sin(t * 0.9 + f.x) * 14 * f.d, dy = -(t - t0) * 22 * f.d + Math.cos(t * 1.1 + f.y) * 10;
    sprite(g, SPR[f.n + f.b], f.x + dx, f.y + dy, f.s * p, f.r + Math.sin(t * 0.7 + f.x) * 0.15, f.b === 'b8' ? 0.85 : 0.6);
  }
}

const S2TEXT = [
  { s: "Yakınla'yı aç.", a: 4.32, b: 5.32 },
  { s: 'Sepetini doldur.', a: 5.38, b: 7.3 },
  { s: 'Onayla, gelsin!', a: 7.36, b: 7.95 },
];
function scene2(g, t) {
  const ph = phoneTransform(t);
  // ✓ dairesine doğru kamera dalışı
  const zp = E.inCubic(prog(t, 7.7, 7.96));
  const Z = Math.exp(Math.log(18) * zp);
  const ck = [ph.x + Math.sin(ph.rot) * 40 * ph.s, ph.y - Math.cos(ph.rot) * 40 * ph.s];
  g.save();
  if (Z > 1.0001) { g.translate(ck[0], ck[1]); g.scale(Z, Z); g.translate(-ck[0], -ck[1]); }
  bgBlue(g, t, { gy: 1050, gr: 1000, ga: 0.25 });
  // ritimli halkalar
  for (let i = 0; i < 4; i++) {
    const r = 380 + i * 170 + ((t * 60) % 170);
    g.strokeStyle = `rgba(255,255,255,${0.07 * (1 - i / 4)})`; g.lineWidth = 3;
    g.beginPath(); g.arc(540, 1080, r, 0, TAU); g.stroke();
  }
  // vurulma şok dalgası
  const sw = prog(t, 4.0, 4.6);
  if (sw > 0 && sw < 1) {
    g.strokeStyle = `rgba(255,214,140,${0.8 * (1 - sw)})`; g.lineWidth = 16 * (1 - sw) + 2;
    g.beginPath(); g.arc(540, 1080, 40 + E.outCubic(sw) * 700, 0, TAU); g.stroke();
  }
  floaters(g, t, 4.25, false);

  // nokta → telefon morfu
  const m1 = prog(t, 4.04, 4.46), m2 = prog(t, 4.09, 4.56);
  const sq = t < 4.06 ? Math.sin(prog(t, 4.0, 4.06) * Math.PI) : 0;
  const pw = lerp(68, PH.W, E.outBack(m1)) * (1 + 0.4 * sq), phh = lerp(68, PH.H, E.outBack(m2)) * (1 - 0.35 * sq);
  const pr = Math.min(lerp(34, PH.r, E.outCubic(m1)), pw / 2, phh / 2);
  const morph = E.outCubic(prog(t, 4.0, 4.3));
  g.save(); g.translate(ph.x, ph.y + (1 - morph) * 0); g.rotate(ph.rot * morph); g.scale(lerp(1, ph.s, morph), lerp(1, ph.s, morph));
  // gölge
  g.shadowColor = 'rgba(2,20,60,0.45)'; g.shadowBlur = 80 * morph; g.shadowOffsetY = 40 * morph;
  const fa = E.outCubic(prog(t, 4.04, 4.2)), da = 1 - prog(t, 4.04, 4.16);
  g.fillStyle = `rgba(11,27,51,${fa})`;
  g.beginPath(); g.roundRect(-pw / 2, -phh / 2, pw, phh, pr); g.fill();
  g.shadowColor = 'transparent';
  const inset = PH.bz * fa;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-pw / 2 + inset, -phh / 2 + inset, pw - 2 * inset, phh - 2 * inset, Math.max(0, pr - inset)); g.fill();
  if (da > 0) { g.fillStyle = `rgba(255,181,71,${da})`; g.beginPath(); g.roundRect(-pw / 2, -phh / 2, pw, phh, pr); g.fill(); }
  const scr = prog(t, 4.15, 4.4);
  if (scr > 0) {
    const sw2 = Math.max(0, pw - 2 * PH.bz), sh2 = Math.max(0, phh - 2 * PH.bz);
    g.save();
    g.beginPath(); g.roundRect(-sw2 / 2, -sh2 / 2, sw2, sh2, Math.max(0, pr - PH.bz)); g.clip();
    g.translate(-PH.SW / 2, -PH.SH / 2);
    drawPhoneScreen(g, t);
    // imleç (parmak)
    if (t > 5.05 && t < 8.1) {
      const [cx, cy] = cursorPos(t);
      let press = 0; for (const tp of [...TAPS.map(q => q.t), CTA_TAP]) press = Math.max(press, kick(t - tp, 12) * (t > tp ? 1 : 0) * (t > tp - 0.06 ? 1 : 0), t < tp && t > tp - 0.06 ? prog(t, tp - 0.06, tp) : 0);
      g.fillStyle = `rgba(11,27,51,${0.22 + 0.15 * press})`; g.beginPath(); g.arc(cx, cy, 44 - press * 10, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 5; g.stroke();
    }
    g.restore();
    // çentik + yansıma
    g.fillStyle = '#0B1B33'; g.beginPath(); g.roundRect(-70, -phh / 2 + PH.bz + 12, 140, 34, 17); g.fill();
    g.save(); g.beginPath(); g.roundRect(-pw / 2, -phh / 2, pw, phh, pr); g.clip();
    const rg = g.createLinearGradient(-pw / 2, -phh / 2, pw / 2, phh / 2);
    rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.42, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); rg.addColorStop(0.62, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(-pw / 2, -phh / 2, pw, phh);
    g.restore();
  }
  g.restore();
  floaters(g, t, 4.25, true);

  // üstteki başlık
  for (const L of S2TEXT) {
    if (t < L.a || t > L.b + 0.3) continue;
    const o = fit(g, L.s, { w: 900, s: 96, c: '#fff' }, 960);
    slotText(g, L.s, 540, 425, o, prog(t, L.a, L.a + 0.45), prog(t, L.b, L.b + 0.25), 0.035);
  }
  g.restore();
}

/* ───────────────────────── 3. TESLİMAT: 3B gece haritası (8–12 sn) ───────────────────────── */
const FOV = 50 * Math.PI / 180;
const FOCAL = (H / 2) / Math.tan(FOV / 2);
const MAP = (() => {
  const r = mulberry32(7);
  const N = 12, STEP = 300;
  const xs = [], ys = [];
  for (let i = -N; i <= N; i++) { xs.push(i * STEP + (i ? (r() - 0.5) * 70 : 0)); ys.push(i * STEP + (i ? (r() - 0.5) * 70 : 0)); }
  const rw = i => (i === N ? 76 : ((i - N) % 4 === 0 ? 56 : 40));
  const I = k => k + N - 8; // eski 8'lik ızgaraya göre indeks
  const route = [[xs[I(5)], ys[I(4)]], [xs[I(5)], ys[I(8)]], [xs[I(10)], ys[I(8)]], [xs[I(10)], ys[I(11)]], [xs[I(10)] + 160, ys[I(11)]]];
  const depo = { x0: xs[I(5)] - rw(I(5)) / 2 - 16 - 190, x1: xs[I(5)] - rw(I(5)) / 2 - 16, y0: ys[I(4)] - 120, y1: ys[I(4)] + 120, h: 70 };
  const hx = xs[I(10)] + 160, hy = ys[I(11)] + rw(I(11)) / 2 + 14;
  const home = { x0: hx - 62, x1: hx + 62, y0: hy, y1: hy + 112, h: 62 };
  const overlap = (a, b) => a.x0 < b.x1 + 8 && a.x1 > b.x0 - 8 && a.y0 < b.y1 + 8 && a.y1 > b.y0 - 8;
  const blds = [], blocks = [], parks = [];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const bx0 = xs[i] + rw(i) / 2, bx1 = xs[i + 1] - rw(i + 1) / 2, by0 = ys[j] + rw(j) / 2, by1 = ys[j + 1] - rw(j + 1) / 2;
    blocks.push([bx0, by0, bx1, by1]);
    if (r() < 0.07) { parks.push([bx0 + 10, by0 + 10, bx1 - 10, by1 - 10]); continue; }
    const nx = r() < 0.5 ? 2 : 3, ny = 2;
    for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) {
      if (r() < 0.12) continue;
      const lx0 = lerp(bx0, bx1, a / nx), lx1 = lerp(bx0, bx1, (a + 1) / nx), ly0 = lerp(by0, by1, b / ny), ly1 = lerp(by0, by1, (b + 1) / ny);
      const ins = 8 + r() * 10;
      const bd = { x0: lx0 + ins, x1: lx1 - ins, y0: ly0 + ins, y1: ly1 - ins, h: 26 + Math.pow(r(), 2.2) * 120 + (r() < 0.04 ? 90 : 0) };
      if (overlap(bd, depo) || overlap(bd, home)) continue;
      blds.push(bd);
    }
  }
  depo.depo = true; home.home = true;
  blds.push(depo, home);
  // pencereler (cephe uv koordinatları)
  for (const b of blds) {
    b.win = [[], [], [], []];
    const faces = [b.x1 - b.x0, b.y1 - b.y0, b.x1 - b.x0, b.y1 - b.y0];
    for (let f = 0; f < 4; f++) {
      const cols = Math.max(1, Math.floor(faces[f] / 34)), rows = Math.max(1, Math.floor(b.h / 30));
      for (let c = 0; c < cols; c++) for (let q = 0; q < rows; q++) {
        if (r() < (b.home ? 0.9 : b.depo ? 0 : 0.33)) {
          const u0 = (c + 0.3) / cols, u1 = (c + 0.7) / cols, v0 = (q + 0.3) / rows, v1 = (q + 0.65) / rows;
          b.win[f].push([u0, u1, v0, v1, 0.55 + r() * 0.45]);
        }
      }
    }
    b.cx = (b.x0 + b.x1) / 2; b.cy = (b.y0 + b.y1) / 2;
  }
  // sokak lambaları
  const lamps = [];
  const EXT = xs[xs.length - 1];
  for (let i = 0; i < xs.length; i++) for (let y = -EXT; y < EXT; y += 110) lamps.push([xs[i] + rw(i) / 2 - 6, y + (i % 2) * 55]);
  for (let j = 0; j < ys.length; j++) for (let x = -EXT; x < EXT; x += 110) lamps.push([x + (j % 2) * 55, ys[j] + rw(j) / 2 - 6]);
  // rota uzunlukları
  const seg = []; let L = 0;
  for (let k = 0; k < route.length - 1; k++) { const d = Math.hypot(route[k + 1][0] - route[k][0], route[k + 1][1] - route[k][1]); seg.push(d); L += d; }
  return { xs, ys, rw, route, seg, L, blds, blocks, parks, lamps, depo, home, EXT, N };
})();
function routeAt(s) { // s: 0..L yay uzunluğu
  let acc = 0; const R = MAP.route;
  for (let k = 0; k < MAP.seg.length; k++) {
    if (s <= acc + MAP.seg[k] || k === MAP.seg.length - 1) {
      const p = clamp((s - acc) / MAP.seg[k]);
      return [lerp(R[k][0], R[k + 1][0], p), lerp(R[k][1], R[k + 1][1], p)];
    }
    acc += MAP.seg[k];
  }
  return R[R.length - 1];
}
const COURIER = { t0: 8.8, t1: 11.42 };
function courierS(t) {
  // hızlanır, yolda akar, kapıda yumuşakça durur
  const p = prog(t, COURIER.t0, COURIER.t1);
  const e = p < 0.18 ? 0.5 * Math.pow(p / 0.18, 2) * 0.18 : p > 0.8 ? 1 - 0.5 * Math.pow((1 - p) / 0.2, 2) * 0.2 - 0 : 0.09 + (p - 0.18) * ((1 - 0.1 - 0.09) / 0.62);
  return clamp(e) * MAP.L;
}
function camAt(t) {
  const a = E.inOutCubic(prog(t, 8.3, 9.9));
  const b = E.inOutCubic(prog(t, 9.7, 10.9));
  const c = E.inOutCubic(prog(t, 11.2, 12.05));
  const tilt = lerp(0.3, 0.95, a) + (1.3 - 0.95) * b;
  const yaw = lerp(0.1 + (t - 8) * 0.05, 0.5, a) + (0.8 - 0.5) * b;
  const dist = lerp(3300, 2100, a) + (1600 - 2100) * b + (900 - 1600) * c;
  // hedef: kuryenin yumuşatılmış konumu
  let tx = 0, ty = 0, n = 0;
  for (let k = 0; k < 9; k++) { const [x, y] = routeAt(courierS(t - k * 0.07)); tx += x; ty += y; n++; }
  tx /= n; ty /= n;
  const hm = MAP.home, hp = E.inOutCubic(prog(t, 11.0, 11.9));
  tx = lerp(tx, hm.cx, hp); ty = lerp(ty, hm.cy, hp);
  ty += 160 * (1 - a); // açılışta depo kadrajın biraz altında, sonra yumuşakça ortalanır
  return makeCam(tx, ty, dist, tilt, yaw, lerp(0.5, 0.6, a) * H);
}
function makeCam(tx, ty, dist, tilt, yaw, cy0) {
  const sy = Math.sin(yaw), cyw = Math.cos(yaw), st = Math.sin(tilt), ct = Math.cos(tilt);
  return {
    pos: [tx - sy * dist * st, ty - cyw * dist * st, dist * ct],
    f: [sy * st, cyw * st, -ct], r: [cyw, -sy, 0], u: [sy * ct, cyw * ct, st],
    cx: W / 2, cy: cy0, tilt, yaw,
  };
}
function toCam(c, x, y, z) {
  const dx = x - c.pos[0], dy = y - c.pos[1], dz = z - c.pos[2];
  return [dx * c.r[0] + dy * c.r[1] + dz * c.r[2], dx * c.u[0] + dy * c.u[1] + dz * c.u[2], dx * c.f[0] + dy * c.f[1] + dz * c.f[2]];
}
const projC = (c, p) => [c.cx + FOCAL * p[0] / p[2], c.cy - FOCAL * p[1] / p[2], p[2]];
function proj(c, x, y, z) { const p = toCam(c, x, y, z); return p[2] > 1 ? projC(c, p) : null; }
const NEAR = 40;
function clipNear(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ai = a[2] >= NEAR, bi = b[2] >= NEAR;
    if (ai) out.push(a);
    if (ai !== bi) { const k = (NEAR - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, NEAR]); }
  }
  return out;
}
function polyPath(g, c, world) {
  const cp = clipNear(world.map(p => toCam(c, p[0], p[1], p[2])));
  if (cp.length < 3) return false;
  for (let i = 0; i < cp.length; i++) { const s = projC(c, cp[i]); i ? g.lineTo(s[0], s[1]) : g.moveTo(s[0], s[1]); }
  g.closePath();
  return true;
}
const FOG = hex2rgb('#173B78');
const fogK = z => clamp((z - 2200) / 5200, 0, 0.9);
const COL = {
  ground: hex2rgb('#07183A'), block: hex2rgb('#0B2350'), road: hex2rgb('#1A3C7A'), park: hex2rgb('#0B3A47'),
  top: hex2rgb('#2B5296'), n: hex2rgb('#183A72'), e: hex2rgb('#12305F'), s: hex2rgb('#0E2853'), w: hex2rgb('#153567'),
  win: hex2rgb('#FFC56B'), depo: hex2rgb('#1F73F0'), homeTop: hex2rgb('#FFB547'),
};
const MTN = [[180, 0.0042, 1100, '#163C7C', 17], [120, 0.0068, 1700, '#0F2D62', 29]]; // [genlik, frekans, paralaks, renk, tohum]: 0 arka, 1 ön
function ridge(L, x, yaw) {
  const [amp, fr, par, , seed] = MTN[L], u = x * fr + yaw * par * fr + seed;
  return amp * (0.55 + 0.3 * Math.sin(u) + 0.18 * Math.sin(u * 2.7 + 1.3) + 0.08 * Math.sin(u * 6.1 + 2));
}
function mountains(g, c, hy, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  MTN.forEach(([, , , col], L) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(-50, hy + 60);
    for (let x = -50; x <= W + 50; x += 12) g.lineTo(x, hy - ridge(L, x, c.yaw));
    g.lineTo(W + 50, hy + 60); g.closePath(); g.fill();
  });
  g.restore();
}
// Afşin'in köyleri: dağ yamaçlarında ışık kümeleri, sırayla yanar, üstlerinde teslimat pini belirir.
// x: yaw = 0.8'deki (kamera oturduktan sonraki) ekran konumu; k: sırt yüksekliğinin ne kadarında durduğu
const VILLAGES = [
  { x: 64, L: 0, k: 0.74, t: 10.62 }, { x: 212, L: 1, k: 0.7, t: 10.76 },
  { x: 892, L: 1, k: 0.7, t: 10.9 }, { x: 1028, L: 1, k: 0.66, t: 11.04 },
].map((v, i) => {
  const r = mulberry32(300 + i), dots = [];
  for (let j = 0; j < 9; j++) dots.push([(r() - 0.5) * 74, (r() - 0.5) * 18, 1.6 + r() * 2.2, 0.55 + r() * 0.45, r() * TAU]);
  return { ...v, dots };
});
const SPECKS = (() => { // uzak, küçük köy ışıkları
  const r = mulberry32(41), a = [];
  for (let i = 0; i < 26; i++) a.push({ x: r() * W, L: r() < 0.5 ? 0 : 1, k: 0.25 + r() * 0.45, s: 1 + r() * 1.6, t: 10.5 + r() * 0.8, ph: r() * TAU });
  return a;
})();
function mtnPoint(c, hy, v) {
  const x = v.x + (0.8 - c.yaw) * MTN[v.L][2];
  let y = hy - ridge(v.L, x, c.yaw) * v.k;
  if (v.L === 0) y = Math.min(y, hy - ridge(1, x, c.yaw) - 8); // arka dağdaysa ön sırtın üstünde kalsın
  return [x, y];
}
function villages(g, c, hy, t, a) {
  if (a <= 0 || t < 10.4) return;
  g.save(); g.globalAlpha = a;
  for (const v of SPECKS) {
    const p = prog(t, v.t, v.t + 0.4); if (p <= 0) continue;
    const [x, y] = mtnPoint(c, hy, v); if (y > hy - 34) continue;
    g.globalAlpha = a * p * (0.55 + 0.35 * Math.sin(t * 5 + v.ph));
    g.fillStyle = '#FFC56B'; g.beginPath(); g.arc(x, y, v.s, 0, TAU); g.fill();
  }
  g.globalAlpha = a;
  for (const v of VILLAGES) {
    const p = prog(t, v.t, v.t + 0.35); if (p <= 0) continue;
    const [x, y] = mtnPoint(c, hy, v);
    glow(g, SPR.amber, x, y, 90 * E.outCubic(p) + 40 * kick(t - v.t, 6), 0.55);
    g.fillStyle = '#FFD58A';
    v.dots.forEach(([dx, dy, r, al, ph], j) => {
      const q = E.outBack(prog(t, v.t + j * 0.025, v.t + 0.2 + j * 0.025)); if (q <= 0) return;
      g.globalAlpha = a * al * (0.8 + 0.2 * Math.sin(t * 6 + ph));
      g.beginPath(); g.arc(x + dx, y + dy, r * q, 0, TAU); g.fill();
    });
    g.globalAlpha = a;
    const pp = E.outBack(prog(t, v.t + 0.08, v.t + 0.42));
    if (pp > 0) mapPin(g, x, y - 16 - Math.sin((t - v.t) * 3) * 4, 92 * pp, 'house', C.amberD);
  }
  g.restore();
}
function drawMap(g, t) {
  const c = camAt(t);
  // gökyüzü / zemin
  const hy = c.tilt > 0.05 ? c.cy - FOCAL / Math.tan(c.tilt) : -1e5;
  g.fillStyle = rgb(COL.ground); g.fillRect(-200, -200, W + 400, H + 400);
  if (hy > -400) {
    const sg = g.createLinearGradient(0, hy - 900, 0, hy);
    sg.addColorStop(0, '#030B22'); sg.addColorStop(0.7, '#0D2A5E'); sg.addColorStop(1, '#1D4A92');
    g.fillStyle = sg; g.fillRect(-200, -200, W + 400, hy + 200);
    stars(g, t, hy - 60, clamp((hy + 100) / 400), 2);
    // AFŞİN ve köyleri, dağların arkasından yükselir
    const ap = E.outExpo(prog(t, 10.3, 11.0)), kp = E.outExpo(prog(t, 10.55, 11.15));
    if (ap > 0) {
      g.save(); g.beginPath(); g.rect(0, -200, W, hy - 40 + 200); g.clip();
      text(g, 'AFŞİN', 540 + 17, hy - 212 + (1 - ap) * 340, { w: 900, s: 168, ls: 34, c: 'rgba(255,255,255,0.92)' });
      if (kp > 0) text(g, 'VE KÖYLERİ', 540 + 9, hy - 118 + (1 - kp) * 200, { w: 800, s: 60, ls: 18, c: C.amber });
      g.restore();
    }
    mountains(g, c, hy, clamp((hy + 50) / 300));
    villages(g, c, hy, t, clamp((hy + 50) / 300));
  }
  // bloklar, parklar, yollar
  const E2 = MAP.EXT + 600;
  g.fillStyle = rgb(COL.ground); g.beginPath(); if (polyPath(g, c, [[-E2, -E2, 0], [E2, -E2, 0], [E2, E2, 0], [-E2, E2, 0]])) g.fill();
  g.fillStyle = rgb(COL.road); g.beginPath(); polyPath(g, c, [[-MAP.EXT, -MAP.EXT, 0], [MAP.EXT, -MAP.EXT, 0], [MAP.EXT, MAP.EXT, 0], [-MAP.EXT, MAP.EXT, 0]]); g.fill();
  g.fillStyle = rgb(COL.block); g.beginPath();
  for (const b of MAP.blocks) polyPath(g, c, [[b[0], b[1], 0], [b[2], b[1], 0], [b[2], b[3], 0], [b[0], b[3], 0]]);
  g.fill();
  g.fillStyle = rgb(COL.park); g.beginPath();
  for (const b of MAP.parks) polyPath(g, c, [[b[0], b[1], 0], [b[2], b[1], 0], [b[2], b[3], 0], [b[0], b[3], 0]]);
  g.fill();
  // ana yol şeritleri
  g.fillStyle = 'rgba(120,170,255,0.18)'; g.beginPath();
  const m = MAP.N, EX = MAP.EXT;
  polyPath(g, c, [[MAP.xs[m] - 3, -EX, 0.2], [MAP.xs[m] + 3, -EX, 0.2], [MAP.xs[m] + 3, EX, 0.2], [MAP.xs[m] - 3, EX, 0.2]]);
  polyPath(g, c, [[-EX, MAP.ys[m] - 3, 0.2], [EX, MAP.ys[m] - 3, 0.2], [EX, MAP.ys[m] + 3, 0.2], [-EX, MAP.ys[m] + 3, 0.2]]);
  g.fill();
  // sokak lambaları
  for (const [x, y] of MAP.lamps) {
    const p = toCam(c, x, y, 6); if (p[2] < NEAR) continue;
    const s = projC(c, p); if (s[0] < -40 || s[0] > W + 40 || s[1] < -40 || s[1] > H + 40) continue;
    const k = FOCAL / p[2], f = 1 - fogK(p[2]);
    glow(g, SPR.amber, s[0], s[1], clamp(k * 60, 2, 40), 0.5 * f);
  }
  // binalar (uzaktan yakına)
  const list = [];
  for (const b of MAP.blds) {
    const p = toCam(c, b.cx, b.cy, b.h / 2);
    if (p[2] < -300) continue;
    if (p[2] > 60) {
      const s = projC(c, p), rr = FOCAL * 200 / p[2];
      if (s[0] < -rr || s[0] > W + rr || s[1] < -rr - 400 || s[1] > H + rr) continue;
    }
    const dx = b.cx - c.pos[0], dy = b.cy - c.pos[1], dz = b.h / 2 - c.pos[2];
    list.push([dx * dx + dy * dy + dz * dz, b, p[2]]);
  }
  list.sort((a, b) => b[0] - a[0]);
  for (const [, b, z] of list) drawBuilding(g, c, b, z, t);
  // rota binaların üstünde, navigasyon katmanı gibi: planlanan (noktalı) + kat edilen (parlak)
  const rp = E.inOutCubic(prog(t, 8.3, 8.95));
  const sNow = courierS(t);
  if (rp > 0) drawRoute(g, c, courierS(t), MAP.L * rp, 'plan');
  if (t > COURIER.t0) drawRoute(g, c, 0, sNow, 'done');
  // ev için halkalar
  const hm = MAP.home;
  for (let i = 0; i < 3; i++) {
    const ph = ((t - 8.4) * 0.9 + i / 3) % 1; if (t < 8.4) break;
    const arr = t > COURIER.t1 ? 1 + 1.5 * kick(t - COURIER.t1, 3) : 1;
    groundRing(g, c, hm.cx, hm.y0 - 40, 40 + ph * 260 * arr, `rgba(255,181,71,${0.5 * (1 - ph)})`, 5);
  }
  // ev pini
  const hpin = proj(c, hm.cx, hm.cy, hm.h + 6);
  if (hpin) {
    const pa = E.outBack(prog(t, 8.5, 8.9));
    const arrive = t > COURIER.t1 ? 0.35 * Math.exp(-(t - COURIER.t1) * 6) * Math.sin((t - COURIER.t1) * 26) : 0;
    const sz = clamp(FOCAL * 260 / hpin[2], 120, 260) * pa * (1 + arrive);
    if (pa > 0) mapPin(g, hpin[0], hpin[1] - Math.abs(arrive) * 60, sz, 'house', C.amberD);
  }
  // kurye
  if (t > COURIER.t0 - 0.3) {
    const [x, y] = routeAt(sNow), cp = proj(c, x, y, 0);
    const ca = E.outBack(prog(t, COURIER.t0 - 0.3, COURIER.t0)) * (1 - E.inCubic(prog(t, COURIER.t1 + 0.05, COURIER.t1 + 0.3)));
    if (cp && ca > 0) {
      const pulse = ((t * 1.6) % 1);
      g.strokeStyle = `rgba(59,139,255,${0.7 * (1 - pulse)})`; g.lineWidth = 6;
      g.beginPath(); g.arc(cp[0], cp[1], (52 + pulse * 70) * ca, 0, TAU); g.stroke();
      glow(g, SPR.blue, cp[0], cp[1], 160 * ca, 0.8);
      g.save(); g.translate(cp[0], cp[1]); g.scale(ca, ca);
      g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = C.blue; g.lineWidth = 8; g.stroke();
      miconAt(g, 'scooter', 0, 2, 60, C.blue, 9);
      g.restore();
    }
  }
  // depo etiketi
  const dp = MAP.depo;
  const dl = proj(c, (dp.x0 + dp.x1) / 2, (dp.y0 + dp.y1) / 2, dp.h + 10);
  const da = E.outBack(prog(t, 8.35, 8.75)) * (1 - E.inBack(prog(t, 9.75, 10.05)));
  if (dl && da > 0) {
    g.save(); g.translate(dl[0] - 150, dl[1] - 40); g.scale(da, da);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(134, -34); g.lineTo(150, -10); g.lineTo(166, -34); g.fill();
    const o = { f: 'Txt', w: 700, s: 40 }, tw = measure(g, "Afşin'deki depomuzdan", o);
    const cw = tw + 130;
    g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
    g.beginPath(); g.roundRect(-cw / 2, -128, cw, 96, 48); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = C.blue; g.beginPath(); g.arc(-cw / 2 + 50, -80, 32, 0, TAU); g.fill();
    miconAt(g, 'box', -cw / 2 + 50, -80, 36, '#fff', 10);
    text(g, "Afşin'deki depomuzdan", -cw / 2 + 96, -66, { ...o, a: 'left', c: C.ink });
    g.restore();
  }
  // sis bandı
  if (hy > -400) {
    const fg = g.createLinearGradient(0, hy - 30, 0, hy + 340);
    fg.addColorStop(0, rgb(FOG, 0.95)); fg.addColorStop(0.35, rgb(FOG, 0.45)); fg.addColorStop(1, rgb(FOG, 0));
    g.fillStyle = fg; g.fillRect(-100, hy - 30, W + 200, 370);
  }
  return c;
}
function groundRing(g, c, x, y, r, col, lw) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  let first = true;
  for (let a = 0; a <= TAU + 0.01; a += TAU / 48) {
    const p = proj(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 0.5);
    if (!p) { first = true; continue; }
    first ? g.moveTo(p[0], p[1]) : g.lineTo(p[0], p[1]); first = false;
  }
  g.stroke();
}
function drawRoute(g, c, s0, s1, kind) {
  if (s1 <= s0) return;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'plan') { // dünyaya sabitlenmiş noktalar (kurye ilerledikçe kaymazlar)
    g.fillStyle = 'rgba(255,255,255,0.7)';
    for (let s = Math.ceil(s0 / 60) * 60; s <= s1; s += 60) {
      const [x, y] = routeAt(s), p = toCam(c, x, y, 3); if (p[2] < NEAR) continue;
      const q = projC(c, p); g.beginPath(); g.arc(q[0], q[1], clamp(FOCAL * 7 / p[2], 1.5, 9), 0, TAU); g.fill();
    }
    return;
  }
  const pts = [];
  for (let s = s0; s < s1; s += 30) pts.push(routeAt(s));
  pts.push(routeAt(s1));
  const sp = pts.map(([x, y]) => toCam(c, x, y, 3));
  for (const [wd, col] of [[70, 'rgba(59,139,255,0.18)'], [38, 'rgba(59,139,255,0.55)'], [16, 'rgba(255,255,255,0.95)']]) {
    g.strokeStyle = col;
    for (let i = 0; i < sp.length - 1; i++) {
      const a = sp[i], b = sp[i + 1]; if (a[2] < NEAR || b[2] < NEAR) continue;
      const pa = projC(c, a), pb = projC(c, b);
      g.lineWidth = wd * FOCAL / ((a[2] + b[2]) / 2) * 0.55;
      g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.stroke();
    }
  }
}
function drawBuilding(g, c, b, z, t) {
  const f = fogK(z), cp = c.pos;
  const shade = col => rgb(mix(col, FOG, f));
  const faces = [];
  if (cp[1] < b.y0) faces.push([0, [[b.x0, b.y0], [b.x1, b.y0]], COL.s]);
  if (cp[0] > b.x1) faces.push([1, [[b.x1, b.y0], [b.x1, b.y1]], COL.e]);
  if (cp[1] > b.y1) faces.push([2, [[b.x1, b.y1], [b.x0, b.y1]], COL.n]);
  if (cp[0] < b.x0) faces.push([3, [[b.x0, b.y1], [b.x0, b.y0]], COL.w]);
  for (const [fi, [A, B], col] of faces) {
    g.fillStyle = shade(b.depo ? mix(col, COL.depo, 0.5) : col);
    g.beginPath();
    if (!polyPath(g, c, [[A[0], A[1], 0], [B[0], B[1], 0], [B[0], B[1], b.h], [A[0], A[1], b.h]])) continue;
    g.fill();
    const wins = b.win[fi]; if (!wins.length) continue;
    g.fillStyle = rgb(mix(COL.win, FOG, f * 0.9), b.home ? 1 : 0.85);
    g.beginPath();
    for (const [u0, u1, v0, v1] of wins) {
      const P = (u, v) => [lerp(A[0], B[0], u), lerp(A[1], B[1], u), v * b.h];
      polyPath(g, c, [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
    }
    g.fill();
  }
  const top = b.depo ? COL.depo : b.home ? COL.homeTop : COL.top;
  g.fillStyle = shade(top);
  g.beginPath();
  if (polyPath(g, c, [[b.x0, b.y0, b.h], [b.x1, b.y0, b.h], [b.x1, b.y1, b.h], [b.x0, b.y1, b.h]])) g.fill();
  if (b.depo) { // çatı logosu yerine kutu ikonu
    const p = proj(c, b.cx, b.cy, b.h + 1);
    if (p) { const k = FOCAL / p[2]; glow(g, SPR.blue, p[0], p[1], 260 * k, 0.6); }
  }
}
function trackingCard(g, t) {
  const a = E.outExpo(prog(t, 9.0, 9.45)), q = E.inCubic(prog(t, 11.55, 11.8));
  if (a <= 0 || q >= 1) return;
  const y = 1395 + (1 - a) * 260 + q * 300;
  g.save(); g.globalAlpha = clamp(a * 2) * (1 - q);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(60, y, 960, 190, 44); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = C.blue; g.beginPath(); g.arc(150, y + 95, 54, 0, TAU); g.fill();
  miconAt(g, 'scooter', 150, y + 97, 62, '#fff', 9);
  text(g, 'Kuryeni canlı takip et', 230, y + 84, { f: 'Txt', w: 700, s: 44, a: 'left', c: C.ink });
  // canlı rozeti
  const blink = 0.5 + 0.5 * Math.cos(t * 7);
  g.fillStyle = 'rgba(255,77,94,0.12)'; g.beginPath(); g.roundRect(838, y + 26, 150, 44, 22); g.fill();
  g.fillStyle = `rgba(255,77,94,${0.4 + 0.6 * blink})`; g.beginPath(); g.arc(864, y + 48, 9, 0, TAU); g.fill();
  text(g, 'CANLI', 884, y + 57, { f: 'Txt', w: 700, s: 24, a: 'left', c: C.red, ls: 2 });
  // ilerleme çubuğu
  const pr = courierS(t) / MAP.L;
  g.fillStyle = '#E6EEFB'; g.beginPath(); g.roundRect(230, y + 120, 740, 16, 8); g.fill();
  g.fillStyle = C.blue; g.beginPath(); g.roundRect(230, y + 120, Math.max(16, 740 * pr), 16, 8); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(230 + Math.max(8, 740 * pr - 8), y + 128, 13, 0, TAU); g.fill();
  g.strokeStyle = C.blue; g.lineWidth = 5; g.stroke();
  miconAt(g, 'house', 990, y + 128, 0, C.blue, 0);
  g.restore();
}
function scene3(g, t) {
  const c = drawMap(g, t);
  trackingCard(g, t);
  // eve varınca mavi iris
  const ir = E.inOutCubic(prog(t, 11.68, 12.02));
  if (ir > 0) {
    const hm = MAP.home, hp = proj(c, hm.cx, hm.cy, hm.h + 140) || [540, 900];
    g.save(); g.beginPath(); g.arc(hp[0], hp[1], ir * 2300, 0, TAU); g.clip();
    bgBlue(g, t);
    g.restore();
  }
}

/* ───────────────────────── 4. VAAT (12–16 sn) ───────────────────────── */
const RING = { x: 540, y: 930, r: 330 };
const LOGO_Y = 700;
function scene4(g, t) {
  bgBlue(g, t, { gy: RING.y, gr: 1000, ga: 0.28 });
  // yavaş dönen ışık huzmeleri
  g.save(); g.translate(RING.x, RING.y); g.rotate(t * 0.15);
  g.fillStyle = 'rgba(255,255,255,0.035)';
  for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1600); g.lineTo(90, -1600); g.closePath(); g.fill(); }
  g.restore();

  // A) 60 sayacı ve halka (12.0 – 14.1)
  const wp = E.inExpo(prog(t, 13.9, 14.12));
  if (wp < 1) {
    g.save(); g.translate(-1300 * wp, 0);
    const tk = prog(t, 12.0, 12.5);
    // dakika çentikleri
    for (let i = 0; i < 60; i++) {
      const p = E.outBack(clamp(tk * 1.6 - i / 60 * 0.6)); if (p <= 0) continue;
      const a = -Math.PI / 2 + i / 60 * TAU, long = i % 5 === 0;
      const r0 = RING.r + 44, r1 = r0 + (long ? 34 : 16) * p;
      g.strokeStyle = `rgba(255,255,255,${long ? 0.9 : 0.45})`; g.lineWidth = long ? 7 : 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(RING.x + Math.cos(a) * r0, RING.y + Math.sin(a) * r0); g.lineTo(RING.x + Math.cos(a) * r1, RING.y + Math.sin(a) * r1); g.stroke();
    }
    const ap = E.inOutCubic(prog(t, 12.0, 12.8));
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 28;
    g.beginPath(); g.arc(RING.x, RING.y, RING.r, 0, TAU); g.stroke();
    if (ap > 0) {
      g.strokeStyle = '#fff'; g.lineCap = 'round';
      g.beginPath(); g.arc(RING.x, RING.y, RING.r, -Math.PI / 2, -Math.PI / 2 + TAU * ap); g.stroke();
      const ea = -Math.PI / 2 + TAU * ap, ex = RING.x + Math.cos(ea) * RING.r, ey = RING.y + Math.sin(ea) * RING.r;
      glow(g, SPR.amber, ex, ey, 140, 0.9 * (1 - prog(t, 12.8, 13.2)));
      g.fillStyle = C.amber; g.beginPath(); g.arc(ex, ey, 22, 0, TAU); g.fill();
    }
    // sayı
    const n = Math.round(60 * E.outCubic(prog(t, 12.02, 12.8)));
    const land = t > 12.8 ? 0.13 * Math.exp(-(t - 12.8) * 9) * Math.cos((t - 12.8) * 34) : 0;
    const ns = E.outBack(prog(t, 12.0, 12.25));
    if (ns > 0) {
      g.save(); g.translate(RING.x, RING.y); g.scale(ns * (1 + land), ns * (1 + land));
      text(g, String(n), 0, 128, { w: 900, s: 360, c: '#fff', ls: -8 });
      g.restore();
    }
    // flaş
    const fl = kick(t - 12.8, 8) * (t > 12.8 ? 1 : 0);
    if (fl > 0.01) glow(g, SPR.white, RING.x, RING.y, 700, fl * 0.5);
    // "ortalama" hapı
    const op = E.outBack(prog(t, 12.22, 12.55));
    if (op > 0) {
      g.save(); g.translate(540, 500); g.scale(op, op); g.rotate(-0.04 * (1 - op));
      g.fillStyle = C.amber; g.beginPath(); g.roundRect(-150, -42, 300, 84, 42); g.fill();
      text(g, 'ortalama', 0, 15, { f: 'Txt', w: 700, s: 44, c: C.ink });
      g.restore();
    }
    slotText(g, 'dakikada', 540, 1390, { w: 900, s: 128 }, prog(t, 12.82, 13.25));
    slotText(g, 'kapında.', 540, 1530, { w: 900, s: 128, c: C.amber }, prog(t, 13.05, 13.5));
    g.restore();
  }

  // B) özellik kartları (14.0 – 16.0)
  const cards = [
    { t: 14.0, y: 700, ic: 'clock', a: '09:00 – 23:00', b: 'arası açığız' },
    { t: 14.5, y: 960, ic: 'mappin', a: 'Afşin ve köylerine', b: 'sanal market hizmeti' },
    { t: 15.0, y: 1220, ic: 'shield', a: '3D Secure', b: 'ile güvenli ödeme' },
  ];
  const col = E.inBack(prog(t, 15.55, 15.92));
  if (t > 13.95) {
    const ho = fit(g, 'Komşun kadar yakın.', { w: 900, s: 92 }, 960);
    g.save(); g.translate(540, 470); g.scale(1 - col, 1 - col); g.translate(-540, -470);
    slotText(g, 'Komşun kadar yakın.', 540, 470, ho, prog(t, 14.02, 14.5), prog(t, 15.45, 15.7), 0.03);
    g.restore();
  }
  cards.forEach((cd, i) => {
    const p = prog(t, cd.t - 0.04, cd.t + 0.34); if (p <= 0) return;
    const e = E.outExpo(p), rot = (1 - spring(t - cd.t, 1.6, 6)) * 0.12 * (i % 2 ? -1 : 1);
    const x = lerp(1400, 540, e), y = lerp(cd.y, LOGO_Y, col);
    const s = 1 - col;
    if (s <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot * (1 - col)); g.scale(s, s);
    g.shadowColor = 'rgba(2,24,80,0.3)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-450, -105, 900, 210, 46); g.fill(); g.shadowColor = 'transparent';
    const ip = E.outBack(prog(t, cd.t + 0.1, cd.t + 0.4));
    g.save(); g.translate(-450 + 112, 0); g.scale(ip, ip);
    g.fillStyle = C.blue; g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.fill();
    miconAt(g, cd.ic, 0, 0, 70, '#fff', 9);
    g.restore();
    text(g, cd.a, -450 + 210, -4, fit(g, cd.a, { w: 800, s: 64, a: 'left', c: C.ink }, 650));
    text(g, cd.b, -450 + 212, 52, { f: 'Txt', w: 500, s: 38, a: 'left', c: C.inkSoft });
    g.restore();
  });
  // çöküş noktası
  const dp = prog(t, 15.8, 16.0);
  if (dp > 0) {
    const r = lerp(10, 30, E.outBack(prog(t, 15.8, 15.92))) * (1 - 0.25 * E.inCubic(prog(t, 15.92, 16.0)));
    glow(g, SPR.white, 540, LOGO_Y, r * 6, 0.7);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(540, LOGO_Y, r, 0, TAU); g.fill();
  }
}

/* ───────────────────────── 5. KAPANIŞ (16–20 sn) ───────────────────────── */
const CONFETTI = (() => {
  const r = mulberry32(99), a = [];
  const cols = ['#FFFFFF', '#FFB547', '#9CC2FF', '#FFFFFF', '#FFD58A'];
  for (let i = 0; i < 46; i++) {
    const ang = r() * TAU, sp = 700 + r() * 900;
    a.push({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 300, rot: r() * TAU, vr: (r() - 0.5) * 18, s: 8 + r() * 12, c: cols[i % cols.length], sh: r() < 0.5 });
  }
  return a;
})();
function scene5(g, t) {
  bgBlue(g, t, { gy: LOGO_Y, gr: 1000, ga: 0.32 });
  // dalga halkaları ("yakınlaşma")
  for (let i = 0; i < 6; i++) {
    const ts = 16.05 + i * 0.7; if (t < ts) continue;
    const age = t - ts, r = 215 + age * 380, a = 0.2 * clamp(1 - age / 2.6);
    if (a <= 0) continue;
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 4;
    g.beginPath(); g.arc(540, LOGO_Y, r, 0, TAU); g.stroke();
  }
  // arkadaki bulanık ürünler
  const fl = [['chips', 150, 330, 0.85], ['detergent', 940, 300, 0.75], ['bread', 120, 1690, 1.2], ['tea', 965, 1700, 1.1], ['egg', 945, 880, 0.7], ['milk', 135, 860, 0.8]];
  fl.forEach(([n, x, y, s], i) => {
    const p = E.outBack(prog(t, 16.6 + i * 0.05, 17.1 + i * 0.05)); if (p <= 0) return;
    sprite(g, SPR[n + 'b2'], x + Math.sin(t * 0.8 + i) * 10, y + Math.cos(t * 0.9 + i) * 12 - (t - 16) * 8, s * p, Math.sin(t * 0.5 + i) * 0.2, 0.45);
  });
  // rozet
  const dt = t - 16.0;
  const br = 30 + 180 * spring(dt, 1.7, 6.5);
  const fy = t > 17.4 ? Math.sin((t - 17.4) * 2.2) * 7 : 0;
  g.save(); g.translate(0, fy);
  g.shadowColor = 'rgba(0,30,90,0.3)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(540, LOGO_Y, br, 0, TAU); g.fill(); g.shadowColor = 'transparent';
  // logo inşası
  const grow = spring(t - 16.12, 1.6, 6);
  const ring = E.inOutCubic(prog(t, 16.28, 16.62));
  const face = E.outBack(prog(t, 16.45, 16.68));
  const hands = E.outBack(prog(t, 16.52, 16.72));
  const sp = E.outCubic(prog(t, 16.52, 17.0));
  const wob = t > 17.0 ? 0.16 * Math.exp(-(t - 17.0) * 10) * Math.sin((t - 17.0) * 42) : 0;
  const am = -(1 - sp) * 5 * TAU + wob, ah = -(1 - sp) * 1.25 * TAU + wob * 0.6;
  const glint = lerp(-0.3, 1.3, prog(t, 17.05, 17.5));
  drawLogo(g, 540, LOGO_Y + 12, 360, { grow, ring, face, hands, am, ah, glint: t > 17.05 ? glint : null });
  g.restore();
  // konfeti: "Yakınla!" oturduğunda
  if (t > SLOGAN.land) {
    const a = t - SLOGAN.land;
    for (const c of CONFETTI) {
      const x = 540 + c.vx * a * Math.exp(-a * 1.6), y = LOGO_Y + c.vy * a * Math.exp(-a * 1.6) + 420 * a * a;
      const al = clamp(1 - a / 1.6); if (al <= 0) continue;
      g.save(); g.globalAlpha = al; g.translate(x, y); g.rotate(c.rot + c.vr * a); g.fillStyle = c.c;
      if (c.sh) { g.beginPath(); g.arc(0, 0, c.s * 0.5, 0, TAU); g.fill(); } else { g.fillRect(-c.s / 2, -c.s / 5, c.s, c.s / 2.5); }
      g.restore();
    }
  }
  // slogan: her hece jingle'ın notasıyla gelir. "Ne La-zım-sa," zıplar, "Ya-kın-la!" çakılır
  sylText(g, SLOGAN.a, 540, 1082, { w: 800, s: 104 }, (k, ts) => {
    const p = prog(t, ts - 0.03, ts + 0.24); if (p <= 0) return null;
    return { sc: lerp(0.35, 1, E.outBack(p)), dy: (1 - E.outExpo(p)) * 70, al: clamp(p * 4) };
  });
  sylText(g, SLOGAN.b, 540, 1268, { w: 900, s: 200, ls: -3 }, (k, ts) => { // komşu heceyi örtmesin diye kancadakinden küçük çakma
    if (t < ts - 0.09) return null;
    if (t <= ts) { const p = prog(t, ts - 0.09, ts); return { sc: lerp(1.8, 1, E.inCubic(p)), al: clamp(p * 2.5) }; }
    const dt = t - ts; return { sc: 1 + 0.08 * Math.exp(-dt * 11) * Math.cos(dt * 36) };
  });
  // Afşin ve köylerine sanal market
  const dp = E.outExpo(prog(t, 18.1, 18.5));
  if (dp > 0) {
    const o = fit(g, 'Afşin ve köylerine sanal market', { f: 'Txt', w: 600, s: 42 }, 900);
    g.save(); g.globalAlpha = dp;
    text(g, 'Afşin ve köylerine sanal market', 540, 1352 + (1 - dp) * 24, { ...o, c: 'rgba(255,255,255,0.9)' });
    g.restore();
  }
  // mağaza hapları
  const pills = [['App Store', 345], ['Google Play', 735]];
  pills.forEach(([s, x], i) => {
    const p = E.outBack(prog(t, 18.2 + i * 0.1, 18.55 + i * 0.1)); if (p <= 0) return;
    g.save(); g.translate(x, 1458); g.scale(p, p);
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-175, -46, 350, 92, 46); g.fill();
    const tw = measure(g, s, { f: 'Txt', w: 700, s: 36 }), x0 = -(tw + 52) / 2;
    miconAt(g, 'download', x0 + 18, -1, 40, C.blue, 10);
    text(g, s, x0 + 52, 13, { f: 'Txt', w: 700, s: 36, a: 'left', c: C.blue });
    g.restore();
  });
  const up = E.outExpo(prog(t, 18.45, 19.0));
  if (up > 0) { g.save(); g.globalAlpha = up; text(g, 'www.yakinla.com', 540, 1574 + (1 - up) * 20, { f: 'Txt', w: 600, s: 40, c: 'rgba(255,255,255,0.88)', ls: 1 }); g.restore(); }
}
// Kapanış sloganı, hece hece (zamanlar audio.py'deki jingle notalarıyla aynı)
const SLOGAN = {
  a: [['Ne ', 16.5], ['La', 16.75], ['zım', 17.0], ['sa,', 17.25]],
  b: [['Ya', 17.5], ['kın', 17.75], ['la', 18.0], ['!', 18.0, C.amber]],
  land: 18.0,
};
// Heceleri tek satır olarak dizer; her hece kendi merkezinde fn(k, ts) → {sc, dy, al} ile canlanır
function sylText(g, segs, x, y, o, fn) {
  const full = segs.map(q => q[0]).join('');
  setFont(g, o); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const x0 = x - g.measureText(full).width / 2;
  let pre = '';
  segs.forEach(([str, ts, col], k) => {
    setFont(g, o);
    const off = g.measureText(pre).width, sw = g.measureText(str.trimEnd()).width;
    pre += str;
    const r = fn(k, ts); if (!r) return;
    const al = r.al == null ? 1 : r.al; if (al <= 0.002) return;
    const cx = x0 + off + sw / 2, cy = y - o.s * 0.36;
    g.save(); g.globalAlpha *= al;
    g.translate(cx, cy + (r.dy || 0)); g.scale(r.sc, r.sc); g.translate(-cx, -cy);
    g.fillStyle = col || o.c || '#fff'; g.fillText(str.trimEnd(), x0 + off, y);
    g.restore();
  });
  g.letterSpacing = '0px';
}

/* ───────────────────────── kamera sarsıntısı ve ana çizim ───────────────────────── */
const IMPACTS = [[1.0, 12], [2.5, 20], [2.75, 20], [3.0, 26], [4.0, 30], [8.0, 14], [12.0, 16], [12.8, 22], [14.0, 10], [14.5, 10], [15.0, 10], [16.0, 26], [17.0, 8], [17.5, 10], [17.75, 12], [18.0, 20]];
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
  if (t < 4.0) scene1(g, t);
  else if (t < 8.4) scene2(g, t);
  if (t >= 7.98 && t < 12.03) {
    const ir = E.outCubic(prog(t, 7.98, 8.36));
    g.save();
    if (ir < 1) { g.beginPath(); g.arc(540, 960, ir * 1200, 0, TAU); g.clip(); }
    scene3(g, t);
    g.restore();
    if (ir < 1 && ir > 0) { g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - ir)})`; g.lineWidth = 18 * (1 - ir) + 2; g.beginPath(); g.arc(540, 960, ir * 1200, 0, TAU); g.stroke(); }
  }
  if (t >= 12.0 && t < 16.0) scene4(g, t);
  if (t >= 16.0) scene5(g, t);
  g.restore();
  vignette(g);
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  for (let i = 0; i < 18; i++) cue(0.04 + i * 0.033 * (1 + i * 0.06), 'tick', { pitch: 1.4 - i * 0.02, gain: 0.35 });
  cue(0.72, 'whoosh', { dur: 0.3, f0: 2500, f1: 500, gain: 0.5 });
  cue(1.0, 'thud', { gain: 0.9 }); cue(1.0, 'crinkle', { dur: 0.25, gain: 0.5 });
  cue(1.12, 'whoosh', { dur: 0.3, f0: 900, f1: 3000, gain: 0.3 }); cue(1.42, 'crinkle', { dur: 0.45, gain: 0.55 });
  [1.42, 1.53, 1.66].forEach((t, i) => cue(t, 'tick', { pitch: 1.7 - i * 0.15, gain: 0.3 }));
  [[2.0, 200], [2.125, 880], [2.25, 195], [2.375, 885]].forEach(([t, x], i) => cue(t, 'pop', { pitch: 1 + i * 0.12, pan: (x - 540) / 540 * 0.7, gain: 0.7 }));
  cue(2.38, 'whoosh', { dur: 0.36, f0: 400, f1: 6000, gain: 0.55 });
  [2.5, 2.75, 3.0].forEach(t => cue(t, 'slam', { gain: 1 }));
  cue(3.4, 'whoosh', { dur: 0.32, f0: 800, f1: 7000, gain: 0.45 });
  cue(3.56, 'zip', { dur: 0.44, gain: 0.5 });
  cue(4.0, 'impact', { gain: 0.9 }); cue(4.04, 'shimmer', { dur: 0.5, gain: 0.4 });
  for (let i = 0; i < 6; i++) cue(4.42 + i * 0.065, 'blip', { pitch: 1 + i * 0.08, gain: 0.22, pan: i % 2 ? 0.25 : -0.25 });
  TAPS.forEach((tp, k) => {
    cue(tp.t, 'tap', { gain: 0.7 });
    cue(tp.t + 0.03, 'whoosh', { dur: 0.36, f0: 1500, f1: 5000, gain: 0.22, pan: 0.3 });
    cue(tp.t + 0.4, 'coin', { pitch: 1 + k * 0.122, gain: 0.5, pan: 0.35 });
  });
  cue(7.1, 'whoosh', { dur: 0.25, f0: 600, f1: 2500, gain: 0.3 });
  cue(CTA_TAP, 'tap', { gain: 0.8 });
  cue(7.58, 'success', { gain: 0.6 });
  cue(7.7, 'whoosh', { dur: 0.32, f0: 300, f1: 9000, gain: 0.7 });
  cue(8.0, 'impact', { gain: 0.7 });
  cue(8.3, 'sweep', { dur: 0.65, gain: 0.35 });
  cue(8.45, 'pop', { pitch: 0.8, gain: 0.45, pan: 0 });
  // kurye motoru: ekrandaki konuma göre pan
  const pans = [];
  for (let t = COURIER.t0 - 0.2; t <= COURIER.t1 + 0.2; t += 0.05) {
    const c = camAt(t), [x, y] = routeAt(courierS(t)), p = proj(c, x, y, 0);
    const sp = (courierS(t + 0.05) - courierS(t)) / 0.05 / 1600;
    pans.push([+t.toFixed(3), p ? clamp((p[0] - 540) / 540, -1, 1) : 0, +clamp(sp, 0, 1.5).toFixed(3)]);
  }
  cue(COURIER.t0 - 0.2, 'motor', { gain: 0.3, track: pans });
  cue(9.0, 'whoosh', { dur: 0.3, f0: 700, f1: 3000, gain: 0.3 });
  cue(10.5, 'shimmer', { dur: 0.9, gain: 0.35 });
  VILLAGES.forEach((v, i) => cue(v.t + 0.08, 'coin', { pitch: 1.5 + i * 0.122, gain: 0.3, pan: (v.x - 540) / 540 * 0.8 }));
  cue(11.4, 'doorbell', { gain: 0.65 });
  cue(11.66, 'whoosh', { dur: 0.36, f0: 300, f1: 8000, gain: 0.6 });
  cue(12.0, 'impact', { gain: 0.85 });
  let prev = 0;
  for (let f = 0; f <= 80; f++) {
    const t = 12.02 + f * 0.01, n = Math.round(60 * E.outCubic(prog(t, 12.02, 12.8)));
    if (n !== prev) { cue(t, 'tick', { pitch: 0.9 + n / 60 * 1.2, gain: 0.28 }); prev = n; }
  }
  cue(12.22, 'pop', { pitch: 1.1, gain: 0.5 });
  cue(12.8, 'slam', { gain: 0.9 });
  cue(12.82, 'whoosh', { dur: 0.25, f0: 1200, f1: 4000, gain: 0.25 });
  cue(13.05, 'whoosh', { dur: 0.25, f0: 1200, f1: 4000, gain: 0.25 });
  cue(13.86, 'whoosh', { dur: 0.3, f0: 6000, f1: 300, gain: 0.7 });
  [14.0, 14.5, 15.0].forEach((t, i) => { cue(t, 'thump', { gain: 0.6 }); cue(t + 0.12, 'pop', { pitch: 1.2 + i * 0.15, gain: 0.4, pan: -0.4 }); });
  cue(15.5, 'reverse', { dur: 0.5, gain: 0.5 });
  cue(16.0, 'impact', { gain: 1.0, big: true });
  cue(16.12, 'shimmer', { dur: 0.6, gain: 0.35 });
  cue(16.3, 'sweep', { dur: 0.35, gain: 0.25 });
  cue(17.0, 'click', { gain: 0.5 });
  cue(17.05, 'shine', { dur: 0.45, gain: 0.3 });
  SLOGAN.a.forEach(([, ts], i) => cue(ts, 'pop', { pitch: 1.0 + i * 0.1, gain: 0.3 }));
  [[17.5, 0.5], [17.75, 0.6]].forEach(([ts, gn]) => cue(ts, 'slam', { gain: gn }));
  cue(SLOGAN.land, 'slam', { gain: 0.85 });
  cue(SLOGAN.land, 'sparkle', { dur: 1.2, gain: 0.45 });
  cue(18.1, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.2 });
  cue(18.2, 'pop', { pitch: 1.3, gain: 0.35, pan: -0.35 }); cue(18.3, 'pop', { pitch: 1.5, gain: 0.35, pan: 0.35 });
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
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,0.38)');
  SPR.vig = v;
  const m = canvas(160, 160), mx = m.getContext('2d');
  mx.fillStyle = '#FFE3A6'; mx.beginPath(); mx.arc(80, 80, 56, 0, TAU); mx.fill();
  mx.globalCompositeOperation = 'destination-out'; mx.beginPath(); mx.arc(104, 62, 50, 0, TAU); mx.fill();
  SPR.moon = m;
  for (const n of ['chips', 'detergent', 'bread', 'egg', 'tea', 'milk']) { SPR[n + 'b2'] = iconSprite(n, 150, 2.5); SPR[n + 'b8'] = iconSprite(n, 170, 9); }
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
function renderAt(t) { g.setTransform(1, 0, 0, 1, 0, 0); draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  hookLayout(g);
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
