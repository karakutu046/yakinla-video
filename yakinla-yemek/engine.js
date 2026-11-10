'use strict';
/* Yakınla motion graphics çekirdeği: yardımcılar, yazı, sprite, market ikonları, logo, arka planlar.
 * yakinla-showreel/anim.js'in ilk bölümüyle aynıdır; sahneler anim.js'tedir. */

const W = 1080, H = 1920, FPS = 30, DUR = 16;
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

