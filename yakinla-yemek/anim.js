'use strict';
/* Yakınla Yemek — 35 saniyelik motion graphics tanıtım filmi (9:16, 1080×1920, 30 fps)
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik tohumludur ve başlangıçta
 * üretilir; aynı t her zaman aynı kareyi verir. renderFrame(f) bir kareyi SAMPLES alt-örnekle
 * (180° obtüratör) çizip ortalar: gerçek hareket bulanıklığı.
 *
 * Zamanlama dış sese göre kurulur. ElevenLabs'te tek kayıt olarak üretilen dış ses, cümle
 * aralarındaki sessizliklerden 11 parçaya bölünür (VO tablosu) ve her parça kendi sahnesine
 * yerleşir. Ekrandaki her sözcük, kayıttaki kelime zamanına bağlıdır (WORDS → T).
 *
 * Akış:
 *   0–4       Kanca     akşam olur, boş tabak, zil çalar: "Karnın zil çalıyor mu?"
 *   4–8       Müjde     MÜJDE! → Yakınla Yemek, "Afşin'de" anahtarı AKTİF'e geçer
 *   8–15.5    Lezzetler tabağa sırayla pide, lahmacun, kebap, burger, dondurma düşer;
 *                       hepsi telefona uçar: "tek uygulamada!"
 *   15.5–18.5 Sipariş   seç → sepete ekle → onayla ✓
 *   18.5–23   Teslimat  kutu kapanır, kurye gece Afşin sokağından geçip kapıya gelir
 *   23–27.5   Vurgu     kapı açılır, dolu tabak: "Uygulamayı kullanan AÇ KALMIYOR!"
 *   27.5–35   Kapanış   Yakınla logosu (assets/yakinla-logo-kart.png) parça parça kurulur
 */

const W = 1080, H = 1920, FPS = 30, DUR = 35;
const FRAMES = FPS * DUR;
const SAMPLES = 5, SHUTTER = 0.5;
const TAU = Math.PI * 2;

const C = {
  blue: '#1F73F0', blueL: '#3B8BFF', blueD: '#0E5FE0', blueXL: '#9CC2FF',
  ink: '#0B1B33', inkSoft: '#5B6B85', tile: '#F1F6FD', chip: '#E8F0FE',
  amber: '#FFB547', amberL: '#FFC85C', amberD: '#F59A1B', red: '#FF5A4E', green: '#22C55E', white: '#FFFFFF',
};

/* ───────────────────────── dış ses zamanlaması ───────────────────────── */
// a–b: kayıttaki kesim aralığı (sn), off: videoya kaydırma (video zamanı = kayıt zamanı + off).
// audio.py aynı tabloyu build/cues.json üzerinden okur.
const VO = [
  { a: 0.00, b: 2.22, off: 0.50 },   // Akşam oldu, karnın zil çalıyor mu?
  { a: 2.22, b: 3.03, off: 1.55 },   // Müjde!
  { a: 3.03, b: 5.46, off: 1.67 },   // Yakınla Yemek, artık Afşin'de aktif!
  { a: 5.46, b: 8.56, off: 2.50 },   // Pide mi, lahmacun mu, kebap mı, burger mı?
  { a: 8.56, b: 9.68, off: 2.57 },   // Tatlısı da var!
  { a: 9.68, b: 12.19, off: 2.75 },  // Afşin'in lezzetleri, tek uygulamada!
  { a: 12.19, b: 14.41, off: 3.26 }, // Seç, sepete ekle, onayla!
  { a: 14.41, b: 16.66, off: 4.03 }, // Siparişin hazırlanır, kapına gelir!
  { a: 16.66, b: 19.50, off: 6.47 }, // Kısacası, uygulamayı kullanan aç kalmıyor!
  { a: 19.50, b: 21.05, off: 8.59 }, // Yakınla'yı hemen indir.
  { a: 21.05, b: 22.83, off: 8.90 }, // Ne lazımsa, Yakınla!
];
// Kelime başlangıçları, kayıt zamanı (ElevenLabs Scribe hizalaması)
const WORDS = {
  aksam: 0.206, oldu: 0.48, karnin: 0.96, zil: 1.32, caliyor: 1.52, mu: 1.92,
  mujde: 2.40, yakinla: 3.20, yemek: 3.64, artik: 4.08, afsinde: 4.48, aktif: 5.00,
  pide: 5.68, lahmacun: 6.36, kebap: 7.20, burger: 8.04, tatlisi: 8.773, var: 9.28,
  afsinin: 10.0, lezzetleri: 10.48, tek: 11.28, uygulamada: 11.44,
  sec: 12.48, sepete: 12.92, ekle: 13.28, onayla: 13.84,
  siparisin: 14.613, hazirlanir: 15.173, kapina: 15.84, gelir: 16.16,
  kisacasi: 16.84, uygulamayi: 17.6, kullanan: 18.08, ac: 18.56, kalmiyor: 18.8,
  yakinlayi: 19.747, hemen: 20.32, indir: 20.6, ne: 21.24, lazimsa: 21.36, yakinlaSon: 22.12,
};
const T = {};
for (const k in WORDS) {
  const s = WORDS[k], p = VO.find(v => s >= v.a && s < v.b);
  T[k] = +(s + p.off).toFixed(3);
}

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
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: x => { const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  inBack: x => { const s = 1.7; return (s + 1) * x * x * x - s * x * x; },
};
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
const kick = (dt, d = 10) => dt <= 0 ? 0 : Math.exp(-d * dt);
const bell01 = x => Math.sin(Math.PI * clamp(x)); // 0→1→0

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
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.035, colFn = null) {
  if (p <= 0 || q >= 1) return;
  g.save();
  g.beginPath(); g.rect(-300, y - o.s * 1.08, W + 600, o.s * 1.46); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.25, c: colFn ? colFn(i) : undefined };
  });
  g.restore();
}
// Bir başlığı t0'da içeri, t1'de dışarı kaydırır
function cap(g, s, y, o, t, t0, t1 = 1e9, colFn = null, x = 540) {
  const p = prog(t, t0, t0 + 0.5), q = prog(t, t1, t1 + 0.24);
  slotText(g, s, x, y, o, p, q, 0.035, colFn);
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
function makeShadow() {
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(4,22,64,0.55)'); gr.addColorStop(0.5, 'rgba(4,22,64,0.25)'); gr.addColorStop(1, 'rgba(4,22,64,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return c;
}
function glow(g, spr, x, y, r, a = 1, sy = 1) {
  if (a <= 0 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * Math.min(1, a);
  g.drawImage(spr, x - r, y - r * sy, 2 * r, 2 * r * sy);
  g.globalAlpha = ga;
}
const FOODPX = 440; // yemek sprite'larının çizim boyu (100 birimlik kutu → 440 px)
function iconSprite(name, size) {
  const pad = Math.ceil(size * 0.12);
  const c = canvas(size + pad * 2, size + pad * 2), x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2); x.scale(size / 100, size / 100);
  ICON[name](x);
  return c;
}
// sprite'ı boyutuna göre (px) çizer
function food(g, name, x, y, px, rot = 0, a = 1, sx = 1, sy = 1) {
  if (a <= 0 || px <= 0) return;
  const spr = SPR.food[name], k = px / FOODPX;
  g.save(); g.globalAlpha *= Math.min(1, a); g.translate(x, y); g.rotate(rot); g.scale(k * sx, k * sy);
  g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
}
function tinted(src, col) {
  const c = canvas(src.width, src.height), x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return c;
}

/* ───────────────────────── tohumlu ayrıntılar ───────────────────────── */
function blobPath(r0, k, n, seed, sx = 1, sy = 1) {
  const rr = mulberry32(seed), pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, r = r0 * (1 + (rr() * 2 - 1) * k);
    pts.push([Math.cos(a) * r * sx, Math.sin(a) * r * sy]);
  }
  const p = new Path2D();
  const mid = i => { const a = pts[i % n], b = pts[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  const m = mid(n - 1); p.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const c = pts[i], m2 = mid(i); p.quadraticCurveTo(c[0], c[1], m2[0], m2[1]); }
  p.closePath();
  return p;
}
const DET = {};
function initDetails() {
  const r = mulberry32(42);
  DET.pide = [];
  for (let i = 0; i < 40; i++) {
    const k = r();
    DET.pide.push({ x: (r() * 2 - 1) * 35, y: (r() * 2 - 1) * 11, r: 1.4 + r() * 2.1, c: k < 0.5 ? '#7E2614' : k < 0.78 ? '#E25A3B' : '#4DB04F' });
  }
  DET.lEdge = blobPath(46, 0.035, 36, 11);
  DET.lTop = blobPath(37, 0.08, 28, 12);
  DET.lDots = []; DET.lLeaves = []; DET.lBlist = [];
  for (let i = 0; i < 46; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 34;
    DET.lDots.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 1.2 + r() * 2.3, c: r() < 0.6 ? '#8A2414' : '#EC7352' });
  }
  for (let i = 0; i < 12; i++) {
    const a = r() * TAU, d = 6 + r() * 26;
    DET.lLeaves.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, a: r() * TAU, c: r() < 0.5 ? '#3FAE4E' : '#2E8F3E' });
  }
  for (let i = 0; i < 14; i++) {
    const a = r() * TAU, d = 40 + r() * 4;
    DET.lBlist.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 1.6 + r() * 2.4, a: a });
  }
  DET.patty = [];
  for (let i = 0; i < 18; i++) DET.patty.push({ x: -38 + r() * 76, y: 9 + r() * 10, r: 1 + r() * 1.6 });
  DET.seeds = [];
  for (let i = 0; i < 9; i++) DET.seeds.push({ x: -28 + r() * 56, y: -30 + r() * 16, a: r() * 3 });
  DET.pist = [];
  for (let i = 0; i < 16; i++) { const a = -Math.PI * (0.15 + r() * 0.7), d = 10 + r() * 15; DET.pist.push({ x: Math.cos(a) * d, y: -24 + Math.sin(a) * d, r: 1.4 + r() * 1.8, c: r() < 0.5 ? '#8CC152' : '#6FA33A' }); }
  DET.scoop = blobPath(27, 0.05, 22, 21);
}

/* ───────────────────────── ikonlar (100 birimlik kutu, merkez 0,0) ───────────────────────── */
function boat(L, h) {
  const p = new Path2D();
  p.moveTo(-L, 0); p.bezierCurveTo(-L * 0.55, -h * 1.28, L * 0.55, -h * 1.28, L, 0);
  p.bezierCurveTo(L * 0.55, h * 1.28, -L * 0.55, h * 1.28, -L, 0); p.closePath();
  return p;
}
const ICON = {
  pide(g) {
    g.save(); g.rotate(-0.2);
    const outer = boat(52, 21), inner = boat(39, 13.5);
    g.save(); g.translate(2, 6); g.fillStyle = 'rgba(0,10,40,0.22)'; g.fill(outer); g.restore();
    let gr = g.createLinearGradient(0, -24, 0, 24);
    gr.addColorStop(0, '#FCD592'); gr.addColorStop(0.5, '#EFAE5C'); gr.addColorStop(1, '#C8762E');
    g.fillStyle = gr; g.fill(outer);
    gr = g.createLinearGradient(0, -14, 0, 14); gr.addColorStop(0, '#DA633C'); gr.addColorStop(1, '#A63820');
    g.fillStyle = gr; g.fill(inner);
    g.save(); g.clip(inner);
    for (const d of DET.pide) {
      g.fillStyle = d.c; g.beginPath();
      if (d.c === '#4DB04F') g.rect(d.x - d.r, d.y - d.r * 0.6, d.r * 2, d.r * 1.2); else g.arc(d.x, d.y, d.r, 0, TAU);
      g.fill();
    }
    g.restore();
    g.strokeStyle = 'rgba(110,40,15,0.5)'; g.lineWidth = 2.2; g.lineCap = 'round';
    for (const x of [-19, 0, 19]) { g.beginPath(); g.moveTo(x - 3, -17); g.lineTo(x + 3, 17); g.stroke(); }
    g.strokeStyle = 'rgba(255,242,210,0.85)'; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(-42, -7); g.bezierCurveTo(-22, -23, 22, -23, 42, -7); g.stroke();
    g.restore();
  },
  lahmacun(g) {
    g.save(); g.translate(2, 6); g.fillStyle = 'rgba(0,10,40,0.22)'; g.fill(DET.lEdge); g.restore();
    let gr = g.createRadialGradient(-8, -10, 4, 0, 0, 48);
    gr.addColorStop(0, '#F8DAA4'); gr.addColorStop(0.75, '#EDB66E'); gr.addColorStop(1, '#D48F45');
    g.fillStyle = gr; g.fill(DET.lEdge);
    g.strokeStyle = 'rgba(160,90,30,0.55)'; g.lineWidth = 1.6; g.stroke(DET.lEdge);
    for (const b of DET.lBlist) { g.fillStyle = 'rgba(165,92,32,0.42)'; g.beginPath(); g.ellipse(b.x, b.y, b.r, b.r * 0.7, b.a, 0, TAU); g.fill(); }
    gr = g.createRadialGradient(-6, -8, 2, 0, 0, 40); gr.addColorStop(0, '#E35B3B'); gr.addColorStop(1, '#B23520');
    g.fillStyle = gr; g.fill(DET.lTop);
    g.save(); g.clip(DET.lTop);
    for (const d of DET.lDots) { g.fillStyle = d.c; g.beginPath(); g.arc(d.x, d.y, d.r, 0, TAU); g.fill(); }
    g.restore();
    for (const l of DET.lLeaves) { g.save(); g.translate(l.x, l.y); g.rotate(l.a); g.fillStyle = l.c; g.beginPath(); g.ellipse(0, 0, 4.4, 2.3, 0, 0, TAU); g.fill(); g.restore(); }
    g.save(); g.translate(25, 25); g.rotate(-0.5);
    g.fillStyle = 'rgba(0,10,40,0.2)'; g.beginPath(); g.arc(1.5, 2.5, 13, 0, TAU); g.fill();
    g.fillStyle = '#F4C300'; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill();
    g.fillStyle = '#FFE56B'; g.beginPath(); g.arc(0, 0, 10.5, 0, TAU); g.fill();
    g.strokeStyle = '#FFF8D0'; g.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); g.stroke(); }
    g.restore();
  },
  kebap(g) {
    g.save(); g.rotate(-0.62);
    g.fillStyle = 'rgba(0,10,40,0.2)'; g.beginPath(); g.roundRect(-50, -8, 104, 22, 10); g.fill();
    g.strokeStyle = '#C9D2DC'; g.lineWidth = 3.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-54, 0); g.lineTo(56, 0); g.stroke();
    g.fillStyle = '#4B5563'; g.beginPath(); g.roundRect(-64, -5.5, 14, 11, 4); g.fill();
    g.fillStyle = '#9AA5B1'; g.beginPath(); g.arc(-50, 0, 4.2, 0, TAU); g.fill();
    const meat = x => {
      const gr = g.createLinearGradient(0, -12, 0, 12); gr.addColorStop(0, '#B4552B'); gr.addColorStop(1, '#6E2A12');
      g.fillStyle = gr; g.beginPath(); g.roundRect(x - 8.5, -12, 17, 24, 6.5); g.fill();
      g.strokeStyle = 'rgba(50,15,5,0.75)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 6, -4); g.lineTo(x + 6, -8); g.moveTo(x - 6, 5); g.lineTo(x + 6, 1); g.stroke();
      g.fillStyle = 'rgba(255,180,130,0.35)'; g.beginPath(); g.ellipse(x - 3, -8, 3, 1.6, -0.3, 0, TAU); g.fill();
    };
    const tomato = x => {
      g.fillStyle = '#E53935'; g.beginPath(); g.arc(x, 0, 10, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(x - 3.5, -4, 3, 2, -0.5, 0, TAU); g.fill();
    };
    const pepper = x => {
      g.fillStyle = '#3E9B45'; g.beginPath(); g.roundRect(x - 5.5, -13, 11, 26, 5.5); g.fill();
      g.fillStyle = '#7CD27F'; g.beginPath(); g.roundRect(x - 2.6, -10, 3, 16, 1.5); g.fill();
    };
    pepper(-40); meat(-26); tomato(-8); meat(10); pepper(25); meat(39);
    g.restore();
  },
  burger(g) {
    g.fillStyle = 'rgba(0,10,40,0.2)'; g.beginPath(); g.ellipse(2, 38, 44, 8, 0, 0, TAU); g.fill();
    let gr = g.createLinearGradient(0, 18, 0, 35); gr.addColorStop(0, '#EBA552'); gr.addColorStop(1, '#C97C32');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-40, 18, 80, 17, 8); g.fill();
    g.fillStyle = '#6A3317'; g.beginPath(); g.roundRect(-43, 5, 86, 16, 7.5); g.fill();
    g.fillStyle = '#4A2210'; for (const d of DET.patty) { g.beginPath(); g.arc(d.x, d.y, d.r, 0, TAU); g.fill(); }
    g.fillStyle = '#FFC928'; g.beginPath(); g.moveTo(-42, 2); g.lineTo(42, 2); g.lineTo(42, 7); g.lineTo(26, 7);
    g.lineTo(20, 15); g.lineTo(14, 7); g.lineTo(-10, 7); g.lineTo(-17, 17); g.lineTo(-24, 7); g.lineTo(-42, 7); g.closePath(); g.fill();
    g.fillStyle = '#E8453A'; g.beginPath(); g.roundRect(-38, -4, 76, 8, 4); g.fill();
    g.fillStyle = '#6CC04A'; g.beginPath(); g.moveTo(-45, -6);
    for (let i = 0; i <= 18; i++) { const x = -45 + i * 5; g.lineTo(x, -6 + (i % 2 ? 5 : -1)); }
    g.lineTo(45, -10); g.lineTo(-45, -10); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, -42, 0, -6); gr.addColorStop(0, '#FAC66C'); gr.addColorStop(1, '#E08A35');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-43, -7); g.bezierCurveTo(-43, -44, 43, -44, 43, -7); g.closePath(); g.fill();
    g.fillStyle = '#FFF2D2';
    for (const s of DET.seeds) { g.beginPath(); g.ellipse(s.x, s.y, 2.6, 1.4, s.a, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -4, 34, Math.PI * 1.15, Math.PI * 1.42); g.stroke();
  },
  dondurma(g) {
    g.save(); g.translate(0, 4);
    const cone = new Path2D(); cone.moveTo(-23, -4); cone.lineTo(23, -4); cone.lineTo(3, 50); cone.lineTo(-3, 50); cone.closePath();
    g.save(); g.translate(2, 4); g.fillStyle = 'rgba(0,10,40,0.2)'; g.fill(cone); g.restore();
    g.fillStyle = '#E2A65E'; g.fill(cone);
    g.save(); g.clip(cone); g.strokeStyle = '#B9793A'; g.lineWidth = 2.2;
    for (let k = -60; k <= 60; k += 11) { g.beginPath(); g.moveTo(k, -6); g.lineTo(k + 40, 54); g.stroke(); g.beginPath(); g.moveTo(k, -6); g.lineTo(k - 40, 54); g.stroke(); }
    g.restore();
    g.fillStyle = 'rgba(150,90,30,0.28)'; g.beginPath(); g.ellipse(0, -2, 23, 6, 0, 0, TAU); g.fill();
    g.save(); g.translate(0, -24);
    g.fillStyle = 'rgba(0,10,40,0.12)'; g.save(); g.translate(2, 4); g.fill(DET.scoop); g.restore();
    const gr = g.createRadialGradient(-9, -10, 3, 0, 0, 30); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#F0E2C8');
    g.fillStyle = gr; g.fill(DET.scoop);
    g.beginPath(); g.moveTo(-26, 10); g.quadraticCurveTo(-20, 26, -12, 18); g.quadraticCurveTo(-4, 30, 4, 19); g.quadraticCurveTo(12, 27, 18, 17); g.quadraticCurveTo(24, 22, 27, 8); g.closePath(); g.fill();
    g.restore();
    for (const p of DET.pist) { g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -24, 20, Math.PI * 1.1, Math.PI * 1.4); g.stroke();
    g.restore();
  },
  ayran(g) {
    const cup = new Path2D(); cup.moveTo(-24, -32); cup.lineTo(24, -32); cup.lineTo(19, 38); cup.quadraticCurveTo(18, 44, 12, 44);
    cup.lineTo(-12, 44); cup.quadraticCurveTo(-18, 44, -19, 38); cup.closePath();
    g.save(); g.translate(3, 5); g.fillStyle = 'rgba(0,10,40,0.2)'; g.fill(cup); g.restore();
    g.strokeStyle = '#FF5A5F'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(6, -30); g.lineTo(13, -58); g.lineTo(24, -60); g.stroke();
    const gr = g.createLinearGradient(-24, 0, 24, 0); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#E3EAF4');
    g.fillStyle = gr; g.fill(cup);
    g.save(); g.clip(cup);
    g.fillStyle = C.blue; g.fillRect(-30, -6, 60, 24);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.6; g.beginPath();
    for (let x = -26; x <= 26; x += 2) g.lineTo(x, 6 + Math.sin(x * 0.28) * 3.2);
    g.stroke();
    g.restore();
    g.fillStyle = '#F7FAFF'; g.beginPath(); g.ellipse(0, -32, 24, 6, 0, 0, TAU); g.fill();
    g.strokeStyle = '#D7DFEB'; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-15, -22); g.lineTo(-12, 30); g.stroke();
  },
  bell(g) {
    g.fillStyle = 'rgba(0,10,40,0.22)'; g.beginPath(); g.ellipse(2, 44, 40, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#C98A12'; g.beginPath(); g.arc(0, 36, 9, 0, TAU); g.fill();
    const body = new Path2D();
    body.moveTo(-40, 30); body.quadraticCurveTo(-33, 22, -32, 2); body.bezierCurveTo(-30, -32, -15, -42, 0, -42);
    body.bezierCurveTo(15, -42, 30, -32, 32, 2); body.quadraticCurveTo(33, 22, 40, 30); body.closePath();
    const gr = g.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, '#FFE38F'); gr.addColorStop(0.45, '#FFC21A'); gr.addColorStop(1, '#DE8E00');
    g.fillStyle = gr; g.fill(body);
    g.fillStyle = '#F2A800'; g.beginPath(); g.roundRect(-44, 26, 88, 10, 5); g.fill();
    g.strokeStyle = '#DE8E00'; g.lineWidth = 5; g.beginPath(); g.arc(0, -48, 7, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-16, -14, 5, 15, 0.25, 0, TAU); g.fill();
  },
};
const FOODS = ['pide', 'lahmacun', 'kebap', 'burger', 'dondurma', 'ayran'];
const NAMES = ['Kıymalı Pide', 'Lahmacun', 'Şiş Kebap', 'Burger', 'Dondurma', 'Ayran'];

/* ───────────────────────── ortak çizimler ───────────────────────── */
function plate(g, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  g.save(); g.globalAlpha *= Math.min(1, a);
  glow(g, SPR.shadow, x + r * 0.05, y + r * 0.12, r * 1.3, 0.75);
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#D3E0F3');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(20,60,130,0.10)'; g.lineWidth = Math.max(2, r * 0.028);
  g.beginPath(); g.arc(x, y, r * 0.70, 0, TAU); g.stroke();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, r * 0.69, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = r * 0.03; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r * 0.86, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
  g.restore();
}
function fork(g, x, y, h, rot = 0, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(h / 100, h / 100);
  g.fillStyle = 'rgba(4,22,64,0.25)'; g.save(); g.translate(3, 4);
  g.beginPath(); g.roundRect(-5, -10, 10, 60, 5); g.roundRect(-14, -50, 28, 30, 6); g.fill(); g.restore();
  g.fillStyle = '#EEF3FA';
  for (const tx of [-11, -3.7, 3.7, 11]) { g.beginPath(); g.roundRect(tx - 2.3, -50, 4.6, 27, 2.3); g.fill(); }
  g.beginPath(); g.moveTo(-13.5, -27); g.lineTo(13.5, -27); g.quadraticCurveTo(13.5, -11, 4, -7); g.lineTo(-4, -7); g.quadraticCurveTo(-13.5, -11, -13.5, -27); g.fill();
  g.beginPath(); g.roundRect(-5, -10, 10, 60, 5); g.fill();
  g.restore();
}
function knife(g, x, y, h, rot = 0, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(h / 100, h / 100);
  g.fillStyle = 'rgba(4,22,64,0.25)'; g.save(); g.translate(3, 4); g.beginPath(); g.roundRect(-6, -50, 13, 100, 6); g.fill(); g.restore();
  g.fillStyle = '#EEF3FA';
  g.beginPath(); g.moveTo(-6, -50); g.quadraticCurveTo(10, -42, 8, -4); g.lineTo(-6, -4); g.closePath(); g.fill();
  g.fillStyle = '#DCE5F1'; g.beginPath(); g.roundRect(-6, -6, 12, 56, 6); g.fill();
  g.restore();
}
function steam(g, x, y, sc, t, a = 1) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.lineCap = 'round'; g.lineWidth = 6;
  for (let k = 0; k < 3; k++) {
    const ph = (t * 0.85 + k * 0.33) % 1;
    g.strokeStyle = `rgba(255,255,255,${Math.sin(ph * Math.PI) * 0.6 * a})`;
    const x0 = (k - 1) * 36, y0 = -ph * 80;
    g.beginPath();
    for (let i = 0; i <= 12; i++) { const yy = y0 - i * 6, xx = x0 + Math.sin(i * 0.6 + t * 4 + k * 2) * 7; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
  g.restore();
}
function rays(g, x, y, rot, a, col = '255,255,255', n = 16, R = 1500) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.6, `rgba(${col},${a * 0.4})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr;
  g.beginPath();
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n * 0.5; g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); }
  g.fill();
  g.restore();
}
function whiteFlash(g, a, col = '255,255,255') {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(${col},${Math.min(1, a)})`; g.fillRect(0, 0, W, H); g.restore();
}
// Konfeti / yemek patlaması
function makeParts(seed, n, o) {
  const r = mulberry32(seed), a = [];
  for (let i = 0; i < n; i++) {
    const ang = (o.ang == null ? -Math.PI / 2 : o.ang) + (r() * 2 - 1) * (o.spread == null ? Math.PI : o.spread);
    const sp = (o.v0 || 900) * (0.35 + r() * 0.85);
    a.push({
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, rot: r() * TAU, vr: (r() * 2 - 1) * 9,
      w: 12 + r() * 14, h: 7 + r() * 8, c: o.cols[(r() * o.cols.length) | 0],
      food: o.foods && r() < (o.foodP || 0.5) ? o.foods[(r() * o.foods.length) | 0] : null,
      fs: (o.fs || 90) * (0.7 + r() * 0.6), life: (o.life || 1.2) * (0.75 + r() * 0.5), fl: r() * TAU,
    });
  }
  return a;
}
function drawParts(g, P, x0, y0, dt, grav = 1700) {
  if (dt <= 0) return;
  for (const p of P) {
    if (dt > p.life + 0.35) continue;
    const dd = (1 - Math.exp(-dt * 2.2)) / 2.2;
    const x = x0 + p.vx * dd, y = y0 + p.vy * dd + 0.5 * grav * dt * dt * 0.55;
    const al = 1 - clamp((dt - p.life) / 0.35);
    if (p.food) { food(g, p.food, x, y, p.fs, p.rot + p.vr * dt * 0.4, al); continue; }
    g.save(); g.globalAlpha *= al; g.translate(x, y); g.rotate(p.rot + p.vr * dt);
    g.scale(1, Math.cos(p.fl + dt * 11));
    g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
  }
}

/* ───────────────────────── arka planlar ───────────────────────── */
const STARS = (() => { const r = mulberry32(7), a = []; for (let i = 0; i < 150; i++) a.push({ x: r() * W, y: r() * H * 0.72, s: 0.8 + r() * 2.2, p: r() * TAU, f: 0.6 + r() * 2 }); return a; })();
function stars(g, t, alpha, yMax = H) {
  if (alpha <= 0) return;
  g.save(); g.fillStyle = '#fff';
  for (const s of STARS) {
    if (s.y > yMax) continue;
    g.globalAlpha = alpha * (0.55 + 0.45 * Math.sin(t * s.f + s.p)) * 0.85;
    g.beginPath(); g.arc(s.x, s.y, s.s, 0, TAU); g.fill();
  }
  g.restore();
}
function bgNight(g, dusk = 0) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, rgb(mix(hex2rgb('#06132E'), hex2rgb('#28488F'), dusk)));
  gr.addColorStop(0.6, rgb(mix(hex2rgb('#0C2456'), hex2rgb('#7768A8'), dusk)));
  gr.addColorStop(1, rgb(mix(hex2rgb('#173B7A'), hex2rgb('#FF9A5A'), dusk)));
  g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
}
function bgBlue(g, t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#3B8BFF'); gr.addColorStop(0.55, '#1F73F0'); gr.addColorStop(1, '#0E5FE0');
  g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
  g.save(); g.globalAlpha = 0.07; g.translate(0, (t * 14) % 60); g.fillStyle = SPR.dots; g.fillRect(-100, -160, W + 200, H + 320); g.restore();
  glow(g, SPR.white, o.gx == null ? 540 : o.gx, o.gy == null ? 1000 : o.gy, 950, o.ga == null ? 0.16 : o.ga);
  if (o.warm) glow(g, SPR.amber, 540, o.wy || 1200, 1000, o.warm);
}
function vignette(g, a = 1) { g.save(); g.globalAlpha = a; g.fillStyle = SPR.vig; g.fillRect(-100, -100, W + 200, H + 200); g.restore(); }

/* ───────────────────────── 1. KANCA (0–4 sn) ───────────────────────── */
const GROWL = { t0: 2.78, t1: 3.55 };
function scene1(g, t) {
  const dusk = 1 - E.inOutSine(prog(t, 0.0, 1.5));
  bgNight(g, dusk);
  if (dusk > 0) {
    const sy = lerp(1380, 2060, E.inQuad(prog(t, 0, 1.5)));
    glow(g, SPR.amber, 300, sy, 560, dusk * dusk * 0.9);
    g.save(); g.globalAlpha = dusk * dusk; g.fillStyle = '#FFD08A'; g.beginPath(); g.arc(300, sy, 110, 0, TAU); g.fill(); g.restore();
  }
  stars(g, t, 1 - dusk);
  const ma = E.outCubic(prog(t, 0.3, 1.4)), my = lerp(540, 320, ma);
  glow(g, SPR.white, 845, my, 230, 0.22 * ma);
  if (ma > 0) { g.save(); g.globalAlpha = ma; g.drawImage(SPR.moon, 845 - 88, my - 88, 176, 176); g.restore(); }

  const pull = E.inCubic(prog(t, 3.45, 3.95));
  g.save(); g.translate(540, 1000); g.scale(1 - 0.08 * pull, 1 - 0.08 * pull); g.translate(-540, -1000);

  cap(g, 'Akşam oldu,', 520, { f: 'Txt', w: 600, s: 66, c: '#BFD4FF' }, t, T.aksam - 0.06);
  cap(g, 'Karnın zil', 720, { s: 156 }, t, T.karnin - 0.06, 1e9, i => i >= 7 ? C.amberL : '#fff');
  cap(g, 'çalıyor mu?', 890, { s: 156 }, t, T.caliyor - 0.08);

  // guruldama: tabak titrer, yanlarda dalga çizgileri
  const ge = bell01(prog(t, GROWL.t0, GROWL.t1));
  const jx = Math.sin(t * 95) * 7 * ge, jr = Math.sin(t * 77) * 0.012 * ge;
  const pa = E.outBack(prog(t, 0.55, 1.1));
  const py = 1385 + (1 - pa) * 520;
  g.save(); g.translate(540 + jx, py); g.rotate(jr); g.translate(-540, -py);
  plate(g, 540, py, 250, clamp(pa * 1.6));
  g.fillStyle = 'rgba(200,140,80,0.55)';
  for (const [dx, dy, rr] of [[-40, 30, 5], [22, -18, 3.5], [58, 44, 4]]) { g.beginPath(); g.arc(540 + dx, py + dy, rr * pa, 0, TAU); g.fill(); }
  g.restore();
  const fk = E.outCubic(prog(t, 0.8, 1.3));
  fork(g, 215 - (1 - fk) * 300 + jx * 0.5, 1385, 300, 0, fk);
  knife(g, 865 + (1 - fk) * 300 + jx * 0.5, 1385, 300, 0, fk);
  if (ge > 0) {
    g.save(); g.strokeStyle = `rgba(190,215,255,${0.75 * ge})`; g.lineWidth = 7; g.lineCap = 'round';
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const R = 290 + k * 34, w = Math.sin(t * 40 + k) * 0.04;
      g.beginPath();
      const a0 = (side < 0 ? Math.PI : 0) - 0.32 + w, a1 = (side < 0 ? Math.PI : 0) + 0.32 + w;
      for (let i = 0; i <= 16; i++) { const a = lerp(a0, a1, i / 16), rr = R + Math.sin(i * 1.4 + t * 50) * 6; const x = 540 + Math.cos(a) * rr, y = py + Math.sin(a) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  // zil
  const bp = E.outBack(prog(t, T.zil - 0.16, T.zil + 0.14)), bd = t - T.zil;
  if (bp > 0) {
    const ring = bd > 0 ? Math.sin(bd * TAU * 7) * 0.42 * Math.exp(-bd * 1.5) * (bd < 1.6 ? 1 : 0) : 0;
    g.save(); g.translate(885, 1040); g.scale(bp, bp);
    g.save(); g.translate(0, -60); g.rotate(ring); g.translate(0, 60);
    g.drawImage(SPR.bell, -SPR.bell.width / 2, -SPR.bell.height / 2);
    g.restore();
    const ra = clamp(Math.abs(ring) * 3) * (bd > 0 ? 1 : 0);
    if (ra > 0) {
      g.strokeStyle = `rgba(255,214,120,${ra})`; g.lineWidth = 7; g.lineCap = 'round';
      for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(0, -10, 112 + k * 30, sd < 0 ? Math.PI * 0.82 : -Math.PI * 0.18, sd < 0 ? Math.PI * 1.18 : Math.PI * 0.18); g.stroke(); }
    }
    g.restore();
  }
  g.restore();
  whiteFlash(g, E.inQuad(prog(t, 3.72, 3.95)) * 0.95);
}

/* ───────────────────────── 2. MÜJDE (4–8 sn) ───────────────────────── */
const TOG = { x: 640, y: 1240, w: 260, h: 136 };
TOG.r = TOG.h / 2; TOG.kr = 54; TOG.off = TOG.x + TOG.r; TOG.on = TOG.x + TOG.w - TOG.r;
const ZOOM2 = { t0: 7.55, t1: 8.0 };
const PLATE3 = { x: 540, y: 1060, r: 300 };
function scene2(g, t) {
  bgBlue(g, t);
  const t0 = T.mujde;
  const ra = 0.16 * E.outCubic(prog(t, t0, t0 + 0.3)) * (1 - 0.6 * prog(t, 5.0, 7.5));
  rays(g, 540, 900, t * 0.15, ra, '255,206,110');

  const k = E.inOutCubic(prog(t, ZOOM2.t0, ZOOM2.t1));
  const flip = spring(t - T.aktif, 1.6, 9);
  const kx = lerp(TOG.off, TOG.on, flip), ky = TOG.y;
  g.save();
  if (k > 0) {
    const s = lerp(1, PLATE3.r / TOG.kr, k);
    g.translate(lerp(kx, PLATE3.x, k), lerp(ky, PLATE3.y, k)); g.scale(s, s); g.translate(-kx, -ky);
  }
  // MÜJDE! — çakılır, sonra yukarı küçülür
  const mo = { s: 250, c: C.amberL };
  const mf = fit(g, 'MÜJDE!', mo, 930);
  const up = E.inOutCubic(prog(t, t0 + 0.72, t0 + 1.1));
  g.save(); g.translate(540, lerp(980, 440, up)); g.scale(lerp(1, 0.5, up), lerp(1, 0.5, up));
  const slam = (i, n) => { const p = E.outExpo(prog(t, t0 + i * 0.03, t0 + i * 0.03 + 0.28)); return { sc: lerp(2.6, 1, p), al: clamp(p * 3) }; };
  letters(g, 'MÜJDE!', 0, 12, { ...mf, c: '#0B3FA8' }, (i, n) => { const r = slam(i, n); return { ...r, al: r.al * 0.55, dy: 0 }; });
  letters(g, 'MÜJDE!', 0, 0, mf, slam);
  g.restore();
  // Yakınla / Yemek
  cap(g, 'Yakınla', 790, { s: 190 }, t, T.yakinla - 0.06);
  cap(g, 'Yemek', 1000, { s: 220, c: C.amberL }, t, T.yemek - 0.06);
  // YENİ etiketi
  const st = E.outBack(prog(t, T.yemek + 0.25, T.yemek + 0.6));
  if (st > 0) {
    g.save(); g.translate(918, 842); g.rotate(0.32 - (1 - st) * 0.8); g.scale(st, st);
    g.fillStyle = 'rgba(4,22,64,0.25)'; starburst(g, 4, 8, 78, 66, 14);
    g.fillStyle = C.red; starburst(g, 0, 0, 78, 66, 14);
    text(g, 'YENİ', 0, 16, { s: 42, c: '#fff' });
    g.restore();
  }
  // Afşin'de [anahtar]
  const rowA = E.outCubic(prog(t, T.artik - 0.08, T.artik + 0.35));
  if (rowA > 0) {
    g.save(); g.globalAlpha = rowA; g.translate(0, (1 - rowA) * 60);
    text(g, "Afşin'de", TOG.x - 34, TOG.y + 32, { s: 92, w: 800, a: 'right' });
    const on = clamp((t - T.aktif) / 0.14);
    g.fillStyle = 'rgba(4,22,64,0.22)'; g.beginPath(); g.roundRect(TOG.x + 4, TOG.y - TOG.h / 2 + 10, TOG.w, TOG.h, TOG.r); g.fill();
    if (on > 0) glow(g, SPR.green, TOG.x + TOG.w / 2, TOG.y, 300, 0.55 * on);
    g.fillStyle = rgb(mix([120, 170, 250], hex2rgb(C.green), on)); g.beginPath(); g.roundRect(TOG.x, TOG.y - TOG.h / 2, TOG.w, TOG.h, TOG.r); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 4; g.stroke();
    g.restore();
  }
  // düğme (zoom geçişinde tabağa dönüşür)
  if (rowA > 0) {
    g.save(); g.globalAlpha = rowA; g.translate(0, (1 - rowA) * 60);
    glow(g, SPR.shadow, kx + 4, ky + 10, TOG.kr * 1.5, 0.6);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(kx, ky, TOG.kr, 0, TAU); g.fill();
    g.restore();
  }
  // AKTİF rozeti
  const ak = E.outBack(prog(t, T.aktif + 0.08, T.aktif + 0.45));
  if (ak > 0) {
    g.save(); g.translate(540, 1440); g.scale(ak, ak);
    g.fillStyle = 'rgba(4,22,64,0.25)'; g.beginPath(); g.roundRect(-196, -48 + 8, 392, 96, 48); g.fill();
    g.fillStyle = C.green; g.beginPath(); g.roundRect(-196, -48, 392, 96, 48); g.fill();
    const pd = (t - T.aktif) % 1.0;
    g.strokeStyle = `rgba(255,255,255,${(1 - pd) * 0.8})`; g.lineWidth = 4; g.beginPath(); g.arc(-138, 0, 14 + pd * 22, 0, TAU); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-138, 0, 14, 0, TAU); g.fill();
    text(g, 'AKTİF', 30, 22, { s: 62, ls: 6 });
    g.restore();
  }
  drawParts(g, PARTS.toggle, TOG.on, TOG.y, t - T.aktif);
  g.restore();
  whiteFlash(g, kick(t - t0, 5.5) * 0.9);
}
function starburst(g, ox, oy, r0, r1, n) {
  g.beginPath();
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? r1 : r0; const x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath(); g.fill();
}

/* ───────────────────────── 3–4. LEZZETLER + SİPARİŞ (8–18.5 sn) ───────────────────────── */
const PH = { x: 540, y: 1090, s: 0.9, W: 560, H: 1120, bz: 16, r: 80 };
PH.SW = PH.W - 2 * PH.bz; PH.SH = PH.H - 2 * PH.bz;
const TILE = { w: (PH.SW - 56 - 16) / 2, h: 182, x0: 28, y0: 382, gap: 16 };
const CART = { x: PH.SW - 62, y: 128 };
function tileRect(i) { const c = i % 2, r = (i / 2) | 0; return [TILE.x0 + c * (TILE.w + TILE.gap), TILE.y0 + r * (TILE.h + TILE.gap)]; }
function tileIcon(i) { const [x, y] = tileRect(i); return [x + TILE.w / 2, y + 78]; }
function tilePlus(i) { const [x, y] = tileRect(i); return [x + TILE.w - 34, y + TILE.h - 34]; }
function ctaCenter() { return [PH.SW / 2, PH.SH - 74]; }

let SHOW, RING_T, FLY, PHONE_IN, ORD, CUR, DIVE;
function initTimeline() {
  SHOW = [['pide', T.pide], ['lahmacun', T.lahmacun], ['kebap', T.kebap], ['burger', T.burger], ['dondurma', T.tatlisi]]
    .map(([f, w]) => ({ f, ds: w - 0.08, land: w + 0.18 }));
  RING_T = T.afsinin - 0.02;
  PHONE_IN = T.tek - 0.15;
  FLY = FOODS.map((f, i) => ({ t0: T.tek + 0.18 + i * 0.07, d: 0.45 }));
  ORD = { sel: T.sec + 0.06, add1: T.ekle - 0.12, add2: T.ekle + 0.2, ctaIn: T.ekle + 0.36, cta: T.onayla + 0.12 };
  ORD.ok = ORD.cta + 0.12;
  const tp = i => tilePlus(i), tc = i => { const [x, y] = tileRect(i); return [x + TILE.w / 2, y + TILE.h / 2]; };
  CUR = [
    [ORD.sel - 0.42, PH.SW + 150, PH.SH + 260], [ORD.sel - 0.03, ...tc(1)], [ORD.sel + 0.12, ...tc(1)],
    [ORD.add1 - 0.05, ...tp(1)], [ORD.add1 + 0.08, ...tp(1)],
    [ORD.add2 - 0.05, ...tp(5)], [ORD.add2 + 0.08, ...tp(5)],
    [ORD.cta - 0.05, ...ctaCenter()], [ORD.cta + 0.12, ...ctaCenter()], [ORD.cta + 0.6, PH.SW + 160, PH.SH + 300],
  ];
  DIVE = { t0: 17.95, t1: 18.45, x: 540, y: PH.y + (-60) * PH.s };
}
function phoneState(t) {
  const p = E.outBack(prog(t, PHONE_IN, PHONE_IN + 0.6));
  return { x: PH.x, y: lerp(2750, PH.y, p), s: PH.s, rot: (1 - E.outCubic(prog(t, PHONE_IN, PHONE_IN + 0.7))) * 0.14 };
}
function s2w(st, sx, sy) { return [st.x + (sx - PH.SW / 2) * st.s, st.y + (sy - PH.SH / 2) * st.s]; }
function ringPos(i, t) {
  const p = E.outBack(prog(t, RING_T + i * 0.05, RING_T + i * 0.05 + 0.5));
  const th = -Math.PI / 2 + i * TAU / 6 + (t - RING_T) * 0.35;
  return [PLATE3.x + Math.cos(th) * 340 * p, PLATE3.y + Math.sin(th) * 340 * p, p];
}
function scene34(g, t) {
  bgBlue(g, t, { gy: 1060 });
  const dv = E.inExpo(prog(t, DIVE.t0, DIVE.t1));
  g.save();
  if (dv > 0) { const s = 1 + dv * 9; g.translate(DIVE.x, DIVE.y); g.scale(s, s); g.translate(-DIVE.x, -DIVE.y); }

  // tabak
  if (t < RING_T + 0.5) {
    let r = PLATE3.r;
    for (const it of SHOW) r *= 1 + 0.045 * Math.sin((t - it.land) * 26) * kick(t - it.land, 8);
    r *= 1 - E.inBack(prog(t, RING_T, RING_T + 0.42));
    plate(g, PLATE3.x, PLATE3.y, r);
  }
  // tabağa düşen yemekler
  for (let i = 0; i < SHOW.length; i++) {
    const it = SHOW[i], nx = i + 1 < SHOW.length ? SHOW[i + 1].ds : RING_T;
    if (t < it.ds || t >= nx + 0.24 || (i === SHOW.length - 1 && t >= RING_T)) continue;
    const pin = prog(t, it.ds, it.land);
    const y = PLATE3.y - 1000 * (1 - E.inQuad(pin));
    const dl = t - it.land;
    let sx = 1, sy = 1;
    if (dl > 0) { const q = Math.exp(-dl * 9) * Math.cos(dl * TAU * 3) * 0.13; sx = 1 + q; sy = 1 - q; }
    const out = prog(t, nx, nx + 0.24), dir = i % 2 ? -1 : 1;
    const x = PLATE3.x + dir * 1100 * E.inCubic(out);
    const rot = (1 - pin) * (i % 2 ? 0.6 : -0.6) + dir * 0.9 * out;
    const px = it.f === 'dondurma' ? 470 : 440;
    if (it.f !== 'dondurma' && dl > 0) steam(g, x, PLATE3.y - 150, 1.3, t, clamp(dl * 3) * (1 - out));
    food(g, it.f, x, y, px, rot, 1, sx, sy);
    if (it.f === 'dondurma' && dl > 0) sparkles(g, x, PLATE3.y - 40, t, dl);
  }
  // halka: altı lezzet
  const st = t >= PHONE_IN ? phoneState(t) : null;
  for (let i = 0; i < 6; i++) {
    if (t < RING_T) break;
    if (t >= FLY[i].t0) continue; // uçuştakiler telefonun önünde çizilir
    const [x, y, p] = ringPos(i, t);
    food(g, FOODS[i], x, y, i === 4 ? lerp(470, 230, clamp(p)) : 230 * p, Math.sin(t * 2 + i) * 0.08);
  }
  // telefon
  if (st) {
    drawPhone(g, st, t);
    // uçuştaki yemekleri telefonun üstünde tekrar çiz (telefon önlerinde kalsın)
    for (let i = 0; i < 6; i++) {
      const f = FLY[i]; if (t < f.t0 || t >= f.t0 + f.d) continue;
      const q = E.inOutCubic(prog(t, f.t0, f.t0 + f.d));
      const [ax, ay] = ringPos(i, f.t0), [bx, by] = s2w(st, ...tileIcon(i));
      const cx = (ax + bx) / 2, cy = Math.min(ay, by) - 260;
      const x = (1 - q) * (1 - q) * ax + 2 * (1 - q) * q * cx + q * q * bx, y = (1 - q) * (1 - q) * ay + 2 * (1 - q) * q * cy + q * q * by;
      food(g, FOODS[i], x, y, lerp(230, 118 * PH.s, q), Math.sin(t * 2 + i) * 0.08 + q * TAU * (i % 2 ? 1 : -1));
    }
    cursor(g, t, st);
  }
  g.restore();

  // başlıklar
  const ca = 1 - clamp(dv * 3);
  if (ca > 0) {
    g.save(); g.globalAlpha = ca;
    const qo = { s: 132 };
    cap(g, 'Pide mi?', 420, qo, t, T.pide - 0.05, T.lahmacun - 0.2);
    cap(g, 'Lahmacun mu?', 420, fit(g, 'Lahmacun mu?', qo, 960), t, T.lahmacun - 0.05, T.kebap - 0.2);
    cap(g, 'Kebap mı?', 420, qo, t, T.kebap - 0.05, T.burger - 0.2);
    cap(g, 'Burger mı?', 420, qo, t, T.burger - 0.05, T.tatlisi - 0.2);
    cap(g, 'Tatlısı da var!', 420, fit(g, 'Tatlısı da var!', { s: 132, c: C.amberL }, 960), t, T.tatlisi - 0.05, T.afsinin - 0.2);
    cap(g, "Afşin'in", 330, { s: 100 }, t, T.afsinin - 0.05, T.tek - 0.2);
    cap(g, 'lezzetleri', 490, { s: 150, c: C.amberL }, t, T.lezzetleri - 0.05, T.tek - 0.2);
    cap(g, 'tek uygulamada!', 330, fit(g, 'tek uygulamada!', { s: 118 }, 960), t, T.tek - 0.05, T.sec - 0.2, i => i < 3 ? C.amberL : '#fff');
    cap(g, 'Seç.', 330, { s: 132 }, t, T.sec - 0.05, T.sepete - 0.2);
    cap(g, 'Sepete ekle.', 330, { s: 124 }, t, T.sepete - 0.05, T.onayla - 0.2);
    cap(g, 'Onayla!', 330, { s: 132, c: C.amberL }, t, T.onayla - 0.05, DIVE.t0);
    g.restore();
  }
  whiteFlash(g, prog(t, DIVE.t0 + 0.25, DIVE.t1));
}
function sparkles(g, x, y, t, dt) {
  g.save();
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * TAU + 0.4, d = 170 + 40 * Math.sin(k * 3.1), ph = (dt * 1.6 + k * 0.37) % 1;
    const s = Math.sin(ph * Math.PI) * 22, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.9;
    g.fillStyle = `rgba(255,236,170,${Math.sin(ph * Math.PI)})`;
    g.beginPath(); g.moveTo(px, py - s); g.quadraticCurveTo(px, py, px + s, py); g.quadraticCurveTo(px, py, px, py + s); g.quadraticCurveTo(px, py, px - s, py); g.quadraticCurveTo(px, py, px, py - s); g.fill();
  }
  g.restore();
}
function drawPhone(g, st, t) {
  g.save(); g.translate(st.x, st.y); g.rotate(st.rot); g.scale(st.s, st.s);
  glow(g, SPR.shadow, 30, 70, 780, 0.7);
  g.fillStyle = '#0B1B33'; g.beginPath(); g.roundRect(-PH.W / 2, -PH.H / 2, PH.W, PH.H, PH.r); g.fill();
  g.strokeStyle = '#33465F'; g.lineWidth = 3; g.stroke();
  g.save(); g.translate(-PH.SW / 2, -PH.SH / 2);
  g.beginPath(); g.roundRect(0, 0, PH.SW, PH.SH, PH.r - PH.bz); g.clip();
  drawScreen(g, t);
  g.restore();
  g.fillStyle = '#0B1B33'; g.beginPath(); g.roundRect(-72, -PH.SH / 2 + 14, 144, 36, 18); g.fill();
  g.restore();
}
function cartCount(t) { return (t >= ORD.add1 + 0.46 ? 1 : 0) + (t >= ORD.add2 + 0.46 ? 1 : 0); }
function drawScreen(g, t) {
  const SW = PH.SW, SH = PH.SH;
  g.fillStyle = '#F5F8FD'; g.fillRect(0, 0, SW, SH);
  text(g, '20:41', 52, 50, { f: 'Txt', w: 600, s: 24, c: C.ink, a: 'left' });
  g.fillStyle = C.ink;
  for (let k = 0; k < 4; k++) g.fillRect(SW - 120 + k * 9, 44 - k * 4, 6, 6 + k * 4);
  g.beginPath(); g.roundRect(SW - 76, 30, 40, 20, 5); g.lineWidth = 2.5; g.strokeStyle = C.ink; g.stroke(); g.fillRect(SW - 72, 34, 26, 12);
  text(g, 'Teslimat adresi', 28, 106, { f: 'Txt', w: 500, s: 20, c: C.inkSoft, a: 'left' });
  text(g, 'Ev · Afşin', 28, 140, { f: 'Txt', w: 700, s: 28, c: C.ink, a: 'left' });
  const aw = measure(g, 'Ev · Afşin', { f: 'Txt', w: 700, s: 28 });
  g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(40 + aw, 126); g.lineTo(47 + aw, 133); g.lineTo(54 + aw, 126); g.stroke();
  // sepet
  const bump = kick(t - ORD.add1 - 0.46, 9) + kick(t - ORD.add2 - 0.46, 9);
  g.save(); g.translate(CART.x, CART.y); g.scale(1 + 0.18 * bump, 1 + 0.18 * bump);
  g.fillStyle = C.chip; g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.fill();
  g.strokeStyle = C.blue; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(-17, -12); g.lineTo(-11, -12); g.lineTo(-6, 9); g.lineTo(13, 9); g.lineTo(17, -5); g.lineTo(-9, -5); g.stroke();
  g.fillStyle = C.blue; g.beginPath(); g.arc(-3, 16, 3, 0, TAU); g.arc(11, 16, 3, 0, TAU); g.fill();
  const n = cartCount(t);
  if (n > 0) {
    g.fillStyle = C.red; g.beginPath(); g.arc(20, -20, 15, 0, TAU); g.fill();
    text(g, String(n), 20, -12, { f: 'Txt', w: 700, s: 20, c: '#fff' });
  }
  g.restore();
  // marka satırı
  const ph = 46, pw = ph * LOGO.pin[2] / LOGO.pin[3];
  g.drawImage(SPR.logo, LOGO.pin[0], LOGO.pin[1], LOGO.pin[2], LOGO.pin[3], 28, 180, pw, ph);
  text(g, 'Yakınla Yemek', 36 + pw, 218, { s: 36, w: 800, c: C.ink, a: 'left' });
  // arama
  g.fillStyle = '#E8EEF7'; g.beginPath(); g.roundRect(28, 240, SW - 56, 56, 28); g.fill();
  g.strokeStyle = '#7D8BA3'; g.lineWidth = 3; g.beginPath(); g.arc(60, 265, 10, 0, TAU); g.moveTo(67, 272); g.lineTo(75, 280); g.stroke();
  text(g, 'Ne yemek istersin?', 90, 276, { f: 'Txt', w: 500, s: 21, c: '#7D8BA3', a: 'left' });
  // çipler
  let cx = 28;
  ['Tümü', 'Pide', 'Lahmacun', 'Kebap', 'Burger', 'Tatlı'].forEach((s, i) => {
    const o = { f: 'Txt', w: 600, s: 19 }, w = measure(g, s, o) + 34;
    g.fillStyle = i === 0 ? C.blue : C.chip; g.beginPath(); g.roundRect(cx, 314, w, 44, 22); g.fill();
    text(g, s, cx + w / 2, 343, { ...o, c: i === 0 ? '#fff' : C.blue });
    cx += w + 10;
  });
  // ürün kartları
  for (let i = 0; i < 6; i++) {
    const [x, y] = tileRect(i);
    const sel = i === 1 ? E.outBack(prog(t, ORD.sel, ORD.sel + 0.3)) : 0;
    const tx = x + TILE.w / 2, ty = y + TILE.h / 2, sc = 1 + 0.045 * sel * (1 - E.inOutSine(prog(t, ORD.sel + 0.5, ORD.sel + 0.9)));
    g.save(); g.translate(tx, ty); g.scale(sc, sc); g.translate(-tx, -ty);
    g.fillStyle = 'rgba(20,50,110,0.07)'; g.beginPath(); g.roundRect(x, y + 5, TILE.w, TILE.h, 24); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x, y, TILE.w, TILE.h, 24); g.fill();
    if (sel > 0) { g.strokeStyle = rgb(hex2rgb(C.blue), clamp(sel)); g.lineWidth = 5; g.stroke(); }
    const [ix, iy] = tileIcon(i);
    g.fillStyle = C.tile; g.beginPath(); g.arc(ix, iy, 62, 0, TAU); g.fill();
    const land = FLY[i].t0 + FLY[i].d;
    if (t >= land) {
      const pp = 1 + 0.16 * Math.sin((t - land) * 22) * kick(t - land, 7);
      food(g, FOODS[i], ix, iy, 118 * pp);
    }
    text(g, NAMES[i], x + 18, y + TILE.h - 24, { f: 'Txt', w: 600, s: 21, c: C.ink, a: 'left' });
    const [bx, by] = tilePlus(i);
    const added = (i === 1 && t >= ORD.add1) || (i === 5 && t >= ORD.add2);
    const tap = (i === 1 ? kick(t - ORD.add1, 12) : 0) + (i === 5 ? kick(t - ORD.add2, 12) : 0);
    g.save(); g.translate(bx, by); g.scale(1 - 0.2 * tap, 1 - 0.2 * tap);
    g.fillStyle = added ? C.green : C.blue; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
    if (added) { g.moveTo(-9, 1); g.lineTo(-3, 7); g.lineTo(9, -6); } else { g.moveTo(-9, 0); g.lineTo(9, 0); g.moveTo(0, -9); g.lineTo(0, 9); }
    g.stroke(); g.restore();
    g.restore();
  }
  // sepete uçan ürünler
  for (const [i, ta] of [[1, ORD.add1], [5, ORD.add2]]) {
    const q = prog(t, ta + 0.04, ta + 0.46);
    if (q <= 0 || q >= 1) continue;
    const [ax, ay] = tileIcon(i), e = E.inOutCubic(q);
    const x = lerp(ax, CART.x, e), y = lerp(ay, CART.y, e) - Math.sin(q * Math.PI) * 120;
    food(g, FOODS[i], x, y, lerp(118, 40, e), q * 3);
  }
  // onay düğmesi
  const ci = E.outBack(prog(t, ORD.ctaIn, ORD.ctaIn + 0.35));
  const [ccx, ccy] = ctaCenter();
  if (ci > 0) {
    const press = 1 - 0.06 * bell01(prog(t, ORD.cta - 0.02, ORD.cta + 0.16));
    g.save(); g.translate(ccx, ccy + (1 - ci) * 170); g.scale(press, press);
    g.fillStyle = 'rgba(14,60,150,0.25)'; g.beginPath(); g.roundRect(-236, -39 + 8, 472, 78, 39); g.fill();
    const gr = g.createLinearGradient(-236, 0, 236, 0); gr.addColorStop(0, C.blueL); gr.addColorStop(1, C.blueD);
    g.fillStyle = gr; g.beginPath(); g.roundRect(-236, -39, 472, 78, 39); g.fill();
    text(g, 'Siparişi onayla', -196, 10, { f: 'Txt', w: 700, s: 28, c: '#fff', a: 'left' });
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.roundRect(96, -24, 116, 48, 24); g.fill();
    text(g, '2 ürün', 154, 8, { f: 'Txt', w: 600, s: 21, c: '#fff' });
    g.restore();
  }
  // onaylandı ekranı
  const ok = prog(t, ORD.ok, ORD.ok + 0.42);
  if (ok > 0) {
    const gr = g.createLinearGradient(0, 0, 0, SH); gr.addColorStop(0, C.blueL); gr.addColorStop(1, C.blueD);
    g.fillStyle = gr; g.beginPath(); g.arc(ccx, ccy, E.outCubic(ok) * 1300, 0, TAU); g.fill();
    const cs = E.outBack(prog(t, ORD.ok + 0.12, ORD.ok + 0.45)), cy = SH / 2 - 60;
    if (cs > 0) {
      g.fillStyle = '#fff'; g.beginPath(); g.arc(SW / 2, cy, 100 * cs, 0, TAU); g.fill();
      const d = prog(t, ORD.ok + 0.25, ORD.ok + 0.5);
      if (d > 0) {
        g.strokeStyle = C.blue; g.lineWidth = 18; g.lineCap = 'round'; g.lineJoin = 'round';
        const pts = [[-44, 2], [-12, 34], [46, -30]], L1 = Math.hypot(32, 32), L2 = Math.hypot(58, 64), L = (L1 + L2) * d;
        g.beginPath(); g.moveTo(SW / 2 + pts[0][0], cy + pts[0][1]);
        if (L <= L1) g.lineTo(SW / 2 + lerp(pts[0][0], pts[1][0], L / L1), cy + lerp(pts[0][1], pts[1][1], L / L1));
        else { g.lineTo(SW / 2 + pts[1][0], cy + pts[1][1]); const k2 = (L - L1) / L2; g.lineTo(SW / 2 + lerp(pts[1][0], pts[2][0], k2), cy + lerp(pts[1][1], pts[2][1], k2)); }
        g.stroke();
      }
    }
    const ta = prog(t, ORD.ok + 0.3, ORD.ok + 0.55);
    if (ta > 0) {
      g.save(); g.globalAlpha = ta;
      text(g, 'Siparişin alındı!', SW / 2, cy + 175 + (1 - ta) * 20, { s: 44, w: 800 });
      text(g, 'Restoran hazırlıyor…', SW / 2, cy + 222 + (1 - ta) * 20, { f: 'Txt', w: 500, s: 24, c: 'rgba(255,255,255,0.85)' });
      g.restore();
    }
  }
}
function cursor(g, t, st) {
  const K = CUR;
  if (t < K[0][0] || t > K[K.length - 1][0]) return;
  let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
  const a = K[i], b = K[i + 1], e = E.inOutCubic(prog(t, a[0], b[0]));
  const [x, y] = s2w(st, lerp(a[1], b[1], e), lerp(a[2], b[2], e));
  const taps = [ORD.sel, ORD.add1, ORD.add2, ORD.cta];
  let press = 0;
  for (const tt of taps) press = Math.max(press, bell01(prog(t, tt - 0.07, tt + 0.13)));
  for (const tt of taps) {
    const d = prog(t, tt, tt + 0.45);
    if (d <= 0 || d >= 1) continue;
    const [px, py] = [x, y];
    g.strokeStyle = `rgba(31,115,240,${(1 - d) * 0.55})`; g.lineWidth = 6;
    g.beginPath(); g.arc(px, py, 28 + 80 * E.outCubic(d), 0, TAU); g.stroke();
  }
  glow(g, SPR.shadow, x + 6, y + 10, 60, 0.7);
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(x, y, 34 * (1 - 0.2 * press), 0, TAU); g.fill();
  g.strokeStyle = 'rgba(11,27,51,0.18)'; g.lineWidth = 3; g.stroke();
}

/* ───────────────────────── 5. TESLİMAT (18.5–23 sn) ───────────────────────── */
const BOX = { x: 540, y: 1270, S: 400, c0: 18.95, c1: 19.28, st: 19.38 };
const WHIP = { t0: 19.70, t1: 20.05 };
const RIDE = { t0: 19.55, stop: 22.3, vmax: 1450 };
const STREET = { ground: 1420, road1: 1700, axle: 1532, cx: 360 };
const DOORZ = { t0: 22.85, t1: 23.45, open0: 22.95, open1: 23.3 };
const BELL_T = 22.55;
let XT, DOOR_WX, BLD, MOUNT, LAMPS;
function rideV(t) {
  if (t < RIDE.t0) return 0;
  return RIDE.vmax * (0.6 + 0.4 * E.outCubic(prog(t, RIDE.t0, RIDE.t0 + 0.4))) * (1 - E.inOutSine(prog(t, 21.45, RIDE.stop)));
}
function rideX(t) {
  if (t <= RIDE.t0) return 0;
  const i = Math.min(XT.length - 1, (t - RIDE.t0) / 0.002);
  const i0 = Math.floor(i), f = i - i0;
  return i0 + 1 < XT.length ? lerp(XT[i0], XT[i0 + 1], f) : XT[XT.length - 1];
}
function initStreet() {
  XT = [0];
  for (let t = RIDE.t0; t < 24; t += 0.002) XT.push(XT[XT.length - 1] + (rideV(t) + rideV(t + 0.002)) / 2 * 0.002);
  DOOR_WX = rideX(RIDE.stop) + 800;
  const r = mulberry32(99);
  const cols = ['#1D4287', '#1A3C7C', '#22498F', '#1B3F82'];
  BLD = { front: [], back: [] };
  let x = -400;
  while (x < DOOR_WX + 1500) {
    const w = 170 + r() * 110, fl = 2 + Math.floor(r() * 2);
    if (x + w > DOOR_WX - 260 && x < DOOR_WX + 260) {
      BLD.front.push({ house: true, x: DOOR_WX - 230, w: 460, fl: 2 });
      x = DOOR_WX + 270; continue;
    }
    BLD.front.push({ x, w, fl, roof: r() < 0.45, col: cols[(r() * cols.length) | 0], win: Array.from({ length: 12 }, () => r() < 0.55) });
    x += w + 26 + r() * 50;
  }
  x = -400;
  const backEnd = DOOR_WX * 0.45 + 1600;
  while (x < backEnd) {
    const w = 140 + r() * 120, fl = 2 + Math.floor(r() * 3);
    BLD.back.push({ x, w, fl, roof: r() < 0.3, win: Array.from({ length: 15 }, () => r() < 0.4) });
    x += w + 14 + r() * 40;
  }
  LAMPS = [];
  for (let lx = 200; lx < DOOR_WX + 1200; lx += 560) if (Math.abs(lx - DOOR_WX) > 300) LAMPS.push(lx);
  MOUNT = [0, 1].map(k => { const rr = mulberry32(300 + k); return Array.from({ length: 40 }, () => 0.25 + rr() * 0.75 * (rr() < 0.3 ? 1 : 0.65)); });
}
function mountains(g, X, par, base, amp, col, arr) {
  const step = 150;
  g.fillStyle = col; g.beginPath(); g.moveTo(-100, H + 100);
  for (let sx = -100; sx <= W + 100; sx += 20) {
    const wx = sx + X * par + 3000, i = Math.floor(wx / step), f = wx / step - i;
    const a = arr[i % arr.length], b = arr[(i + 1) % arr.length];
    g.lineTo(sx, base - lerp(a, b, (1 - Math.cos(f * Math.PI)) / 2) * amp);
  }
  g.lineTo(W + 100, H + 100); g.closePath(); g.fill();
}
function building(g, b, sx, base, fh, back) {
  const h = b.fl * fh + 40;
  if (sx > W + 50 || sx + b.w < -50) return;
  g.fillStyle = back ? '#163470' : b.col;
  g.fillRect(sx, base - h, b.w, h);
  if (b.roof) { g.fillStyle = back ? '#132C60' : '#16336E'; g.beginPath(); g.moveTo(sx - 12, base - h); g.lineTo(sx + b.w / 2, base - h - 60 * (back ? 0.7 : 1)); g.lineTo(sx + b.w + 12, base - h); g.closePath(); g.fill(); }
  else { g.fillStyle = back ? '#132C60' : '#173775'; g.fillRect(sx - 6, base - h - 12, b.w + 12, 14); }
  const cols = b.w > 220 ? 3 : 2, ww = back ? 30 : 42, wh = back ? 40 : 54;
  let k = 0;
  for (let f = 0; f < b.fl; f++) for (let c = 0; c < cols; c++) {
    const lit = b.win[k++ % b.win.length];
    const wx = sx + (c + 0.5) * b.w / cols - ww / 2, wy = base - h + 40 + f * fh + (fh - wh) / 2 - 10;
    g.fillStyle = lit ? (back ? 'rgba(255,200,110,0.55)' : '#FFC66E') : (back ? '#122A5C' : '#11285A');
    g.fillRect(wx, wy, ww, wh);
    if (lit && !back) glow(g, SPR.amber, wx + ww / 2, wy + wh / 2, 70, 0.25);
  }
}
function house(g, sx, base, t) {
  const w = 460, h = 2 * 150 + 40;
  if (sx > W + 50 || sx + w < -50) return;
  g.fillStyle = '#2A5098'; g.fillRect(sx, base - h, w, h);
  g.fillStyle = '#B5523A'; g.beginPath(); g.moveTo(sx - 26, base - h + 4); g.lineTo(sx + w / 2, base - h - 110); g.lineTo(sx + w + 26, base - h + 4); g.closePath(); g.fill();
  g.fillStyle = '#9A4430'; g.fillRect(sx - 26, base - h, w + 52, 10);
  for (const [wx, wy] of [[sx + 50, base - h + 60], [sx + w - 140, base - h + 60], [sx + 50, base - 200], [sx + w - 140, base - 200]]) {
    g.fillStyle = '#FFC66E'; g.fillRect(wx, wy, 90, 80); glow(g, SPR.amber, wx + 45, wy + 40, 110, 0.3);
    g.strokeStyle = '#1D3C78'; g.lineWidth = 6; g.strokeRect(wx, wy, 90, 80); g.beginPath(); g.moveTo(wx + 45, wy); g.lineTo(wx + 45, wy + 80); g.stroke();
  }
  // kapı
  const dx = sx + w / 2, dw = 124, dh = 214, dy = base - dh;
  const op = E.inOutCubic(prog(t, DOORZ.open0, DOORZ.open1));
  g.fillStyle = '#5B3A28'; g.fillRect(dx - dw / 2 - 12, dy - 12, dw + 24, dh + 12);
  const ig = g.createLinearGradient(0, dy, 0, base); ig.addColorStop(0, '#FFE6B0'); ig.addColorStop(1, '#FFC46A');
  g.fillStyle = ig; g.fillRect(dx - dw / 2, dy, dw, dh);
  const pw = dw * (1 - 0.86 * op);
  const dg = g.createLinearGradient(dx - dw / 2, 0, dx - dw / 2 + pw, 0); dg.addColorStop(0, '#9A6236'); dg.addColorStop(1, '#7D4C2A');
  g.fillStyle = dg; g.fillRect(dx - dw / 2, dy, pw, dh);
  if (pw > 40) {
    g.strokeStyle = 'rgba(60,30,10,0.5)'; g.lineWidth = 4;
    g.strokeRect(dx - dw / 2 + pw * 0.15, dy + 22, pw * 0.7, 74); g.strokeRect(dx - dw / 2 + pw * 0.15, dy + 116, pw * 0.7, 74);
    g.fillStyle = '#F4C95D'; g.beginPath(); g.arc(dx - dw / 2 + pw * 0.85, dy + 112, 6, 0, TAU); g.fill();
  }
  if (op > 0) {
    g.fillStyle = `rgba(255,214,140,${0.45 * op})`; g.beginPath(); g.moveTo(dx - dw / 2, base); g.lineTo(dx + dw / 2, base); g.lineTo(dx + dw * 1.3, base + 150); g.lineTo(dx - dw * 1.3, base + 150); g.closePath(); g.fill();
  }
  // kapı lambası ve zil
  g.fillStyle = '#FFE2A0'; g.beginPath(); g.arc(dx + dw / 2 + 34, dy - 6, 10, 0, TAU); g.fill();
  glow(g, SPR.amber, dx + dw / 2 + 34, dy, 150, 0.55);
  g.fillStyle = '#E8EEF7'; g.beginPath(); g.roundRect(dx + dw / 2 + 22, dy + 92, 18, 26, 5); g.fill();
  const bd = t - BELL_T;
  if (bd > 0 && bd < 1.1) {
    g.strokeStyle = `rgba(255,230,160,${1 - bd / 1.1})`; g.lineWidth = 5; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const rr = 22 + k * 22 + bd * 40; g.beginPath(); g.arc(dx + dw / 2 + 31, dy + 105, rr, -0.7, 0.7); g.stroke(); }
  }
}
function courier(g, x, y, t, v) {
  const sp = clamp(v / RIDE.vmax), bob = Math.sin(t * 19) * 2.2 * sp;
  const ang = rideX(t) / 40;
  g.save(); g.translate(x, y);
  // far ışığı
  const bm = g.createLinearGradient(120, 0, 620, 0); bm.addColorStop(0, 'rgba(255,238,195,0.5)'); bm.addColorStop(1, 'rgba(255,238,195,0)');
  g.fillStyle = bm; g.beginPath(); g.moveTo(124, -142); g.lineTo(640, -60); g.lineTo(640, 70); g.lineTo(124, -122); g.closePath(); g.fill();
  glow(g, SPR.shadow, 0, 40, 220, 0.8, 0.14);
  const wheel = wx => {
    g.save(); g.translate(wx, 0);
    g.fillStyle = '#0A0F1E'; g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill();
    g.fillStyle = '#9AA5B1'; g.beginPath(); g.arc(0, 0, 21, 0, TAU); g.fill();
    g.strokeStyle = '#5B6B85'; g.lineWidth = 4; g.rotate(ang);
    for (let k = 0; k < 5; k++) { g.rotate(TAU / 5); g.beginPath(); g.moveTo(0, 0); g.lineTo(18, 0); g.stroke(); }
    g.restore();
  };
  wheel(-96); wheel(100);
  g.translate(0, bob);
  // scooter gövdesi (beyaz) + arka bagaj kutusu
  g.fillStyle = '#E9F0FA';
  g.beginPath(); g.moveTo(-150, -18); g.bezierCurveTo(-152, -76, -96, -90, -36, -84); g.lineTo(-6, -46); g.lineTo(-36, -24); g.lineTo(-140, -10); g.closePath(); g.fill();
  g.fillStyle = '#C9D6E8'; g.beginPath(); g.roundRect(-46, -34, 132, 18, 8); g.fill();
  g.fillStyle = '#E9F0FA'; g.beginPath(); g.moveTo(66, -30); g.lineTo(90, -30); g.lineTo(122, -152); g.lineTo(98, -158); g.closePath(); g.fill();
  g.beginPath(); g.arc(100, -4, 48, Math.PI * 1.1, Math.PI * 1.75); g.lineWidth = 12; g.strokeStyle = '#E9F0FA'; g.stroke();
  g.fillStyle = '#0B1B33'; g.beginPath(); g.roundRect(-126, -104, 104, 22, 11); g.fill();
  g.fillStyle = '#FF4D5E'; g.beginPath(); g.roundRect(-158, -50, 12, 16, 4); g.fill(); glow(g, SPR.red, -156, -42, 50, 0.6);
  g.fillStyle = '#FFF4D6'; g.beginPath(); g.arc(124, -138, 12, 0, TAU); g.fill(); glow(g, SPR.amber, 128, -138, 70, 0.7);
  // bagaj kutusu
  g.fillStyle = 'rgba(4,22,64,0.3)'; g.beginPath(); g.roundRect(-176, -206, 124, 108, 16); g.fill();
  g.fillStyle = C.blue; g.beginPath(); g.roundRect(-180, -212, 124, 108, 16); g.fill();
  g.fillStyle = C.blueD; g.fillRect(-180, -178, 124, 6);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(-118, -146, 30, 0, TAU); g.fill();
  const pk = LOGO.pin, ph = 42, pw = ph * pk[2] / pk[3];
  g.drawImage(SPR.logo, pk[0], pk[1], pk[2], pk[3], -118 - pw / 2, -146 - ph / 2, pw, ph);
  // sürücü
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#14213D'; g.lineWidth = 30;
  g.beginPath(); g.moveTo(-62, -112); g.lineTo(6, -104); g.lineTo(26, -40); g.stroke();
  g.fillStyle = '#0B1B33'; g.beginPath(); g.roundRect(16, -46, 40, 16, 7); g.fill();
  g.strokeStyle = '#2F80F5'; g.lineWidth = 56;
  g.beginPath(); g.moveTo(-60, -118); g.lineTo(-22, -196); g.stroke();
  g.strokeStyle = '#2470E0'; g.lineWidth = 22;
  g.beginPath(); g.moveTo(-18, -190); g.lineTo(30, -160); g.lineTo(84, -160); g.stroke();
  g.fillStyle = '#0B1B33'; g.beginPath(); g.arc(88, -160, 11, 0, TAU); g.fill();
  g.strokeStyle = '#0B1B33'; g.lineWidth = 8; g.beginPath(); g.moveTo(100, -156); g.lineTo(80, -170); g.stroke();
  // kask
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-8, -244, 36, 0, TAU); g.fill();
  g.fillStyle = C.blue; g.beginPath(); g.arc(-8, -244, 36, Math.PI * 1.05, Math.PI * 1.35); g.lineTo(-8, -244); g.closePath(); g.fill();
  g.fillStyle = '#0B1B33'; g.beginPath(); g.moveTo(8, -258); g.quadraticCurveTo(34, -256, 30, -232); g.lineTo(10, -232); g.closePath(); g.fill();
  g.restore();
}
function kitchen(g, t) {
  bgBlue(g, t, { warm: 0.2, wy: 1250 });
  const pop = E.outBack(prog(t, 18.5, 18.85)), S = BOX.S;
  g.save(); g.translate(BOX.x, BOX.y); g.scale(pop, pop);
  glow(g, SPR.shadow, 10, 30, S * 0.85, 0.8);
  g.fillStyle = '#D29A5C'; g.beginPath(); g.roundRect(-S / 2, -S / 2, S, S, 22); g.fill();
  g.fillStyle = '#BD8448'; g.beginPath(); g.roundRect(-S / 2 + 18, -S / 2 + 18, S - 36, S - 36, 14); g.fill();
  const cl = E.inCubic(prog(t, BOX.c0, BOX.c1)), sc = lerp(-0.82, 1, cl);
  if (cl < 1) {
    food(g, 'lahmacun', 0, 0, 330);
    steam(g, 0, -120, 1.2, t, 1 - cl);
  }
  g.save(); g.translate(0, -S / 2); g.scale(1, sc);
  g.fillStyle = sc < 0 ? '#E7BA84' : '#DCA463'; g.beginPath(); g.roundRect(-S / 2, 0, S, S, 22); g.fill();
  g.strokeStyle = 'rgba(120,70,25,0.35)'; g.lineWidth = 4; g.stroke();
  if (sc > 0) { g.strokeStyle = 'rgba(120,70,25,0.25)'; g.setLineDash([16, 12]); g.beginPath(); g.moveTo(-S / 2 + 30, 36); g.lineTo(S / 2 - 30, 36); g.stroke(); g.setLineDash([]); }
  g.restore();
  const sp = prog(t, BOX.st, BOX.st + 0.28);
  if (sp > 0) {
    const s2 = lerp(1.9, 1, E.outBack(sp));
    g.save(); g.scale(s2, s2); g.globalAlpha *= clamp(sp * 4);
    glow(g, SPR.shadow, 4, 10, 110, 0.6);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 84, 0, TAU); g.fill();
    const pk = LOGO.pin, ph = 116, pw = ph * pk[2] / pk[3];
    g.drawImage(SPR.logo, pk[0], pk[1], pk[2], pk[3], -pw / 2, -ph / 2 - 2, pw, ph);
    g.restore();
  }
  if (cl >= 1) steam(g, 0, -S / 2 - 10, 1.0, t, 1 - prog(t, BOX.c1 + 0.3, BOX.c1 + 0.8));
  g.restore();
}
function street(g, t) {
  const X = rideX(t), v = rideV(t);
  const dz = E.inQuad(prog(t, DOORZ.t0, DOORZ.t1));
  const dsx = DOOR_WX - X, dsy = STREET.ground - 107;
  g.save();
  if (dz > 0) { const s = 1 + dz * 7.5; g.translate(dsx, dsy); g.scale(s, s); g.translate(-dsx, -dsy); }
  const gr = g.createLinearGradient(0, 0, 0, STREET.ground);
  gr.addColorStop(0, '#06132E'); gr.addColorStop(0.65, '#0F2B62'); gr.addColorStop(1, '#1E4A92');
  g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
  stars(g, t, 0.9, 1000);
  g.drawImage(SPR.moon, 945 - 50, 690 - 50, 100, 100); glow(g, SPR.white, 945, 690, 150, 0.2);
  mountains(g, X, 0.05, 1190, 330, '#17397A', MOUNT[0]);
  const af = E.outCubic(prog(t, 20.35, 21.0));
  if (af > 0) {
    const ay = lerp(1200, 860, af);
    glow(g, SPR.blue, 540, ay - 70, 520, 0.45 * af);
    g.save(); g.globalAlpha = af; text(g, 'AFŞİN', 540 - X * 0.02, ay, { s: 172, ls: 26 }); g.restore();
  }
  mountains(g, X, 0.13, 1260, 230, '#0E275B', MOUNT[1]);
  for (const b of BLD.back) building(g, b, b.x - X * 0.45, 1395, 92, true);
  for (const b of BLD.front) {
    if (b.house) house(g, b.x - X, STREET.ground, t);
    else building(g, b, b.x - X, STREET.ground, 118, false);
  }
  // sokak lambaları
  for (const lx of LAMPS) {
    const sx = lx - X; if (sx < -120 || sx > W + 120) continue;
    g.fillStyle = '#0D1F45'; g.fillRect(sx - 5, STREET.ground - 330, 10, 330);
    g.fillRect(sx - 5, STREET.ground - 330, 60, 8);
    g.fillStyle = '#FFE3A6'; g.beginPath(); g.roundRect(sx + 34, STREET.ground - 326, 34, 12, 6); g.fill();
    glow(g, SPR.amber, sx + 51, STREET.ground - 316, 160, 0.65);
    g.fillStyle = 'rgba(255,200,120,0.12)'; g.beginPath(); g.moveTo(sx + 40, STREET.ground - 314); g.lineTo(sx + 62, STREET.ground - 314); g.lineTo(sx + 150, STREET.ground + 60); g.lineTo(sx - 50, STREET.ground + 60); g.closePath(); g.fill();
  }
  // kaldırım ve yol
  g.fillStyle = '#28498A'; g.fillRect(-100, STREET.ground, W + 200, 26);
  g.fillStyle = '#0A1636'; g.fillRect(-100, STREET.ground + 26, W + 200, STREET.road1 - STREET.ground - 26);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  const off = ((X % 150) + 150) % 150;
  for (let x = -off - 150; x < W + 150; x += 150) g.fillRect(x, 1612, 80, 8);
  g.fillStyle = '#071029'; g.fillRect(-100, STREET.road1, W + 200, H - STREET.road1 + 100);
  // hız çizgileri
  const sp = clamp(v / RIDE.vmax);
  if (sp > 0.05) {
    g.strokeStyle = `rgba(255,255,255,${0.16 * sp})`; g.lineWidth = 4;
    for (let k = 0; k < 9; k++) {
      const yy = 1060 + k * 70 + (k % 3) * 11, len = 120 + (k * 53) % 140;
      const xx = W - (((X * (1.2 + (k % 4) * 0.2)) + k * 337) % (W + 400));
      g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + len, yy); g.stroke();
    }
  }
  courier(g, STREET.cx, STREET.axle, t, v);
  g.restore();
}
function stepper(g, t) {
  const a = E.outCubic(prog(t, 18.62, 19.0)) * (1 - prog(t, DOORZ.t0 - 0.1, DOORZ.t0 + 0.15));
  if (a <= 0) return;
  const y0 = 500, x0 = 100, w = 880, h = 150;
  g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * -50);
  g.fillStyle = 'rgba(4,22,64,0.25)'; g.beginPath(); g.roundRect(x0, y0 + 8, w, h, 40); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x0, y0, w, h, 40); g.fill();
  const xs = [x0 + 140, 540, x0 + w - 140], cy = y0 + 56;
  const act = [18.75, WHIP.t0 + 0.2, RIDE.stop + 0.05];
  const segs = [prog(t, 19.45, WHIP.t0 + 0.2), prog(t, WHIP.t0 + 0.2, RIDE.stop + 0.05)];
  for (let k = 0; k < 2; k++) {
    g.fillStyle = '#E3EAF5'; g.fillRect(xs[k] + 46, cy - 4, xs[k + 1] - xs[k] - 92, 8);
    g.fillStyle = C.blue; g.fillRect(xs[k] + 46, cy - 4, (xs[k + 1] - xs[k] - 92) * segs[k], 8);
  }
  const labels = ['Hazırlanıyor', 'Yolda', 'Kapında'];
  for (let k = 0; k < 3; k++) {
    const on = E.outBack(prog(t, act[k], act[k] + 0.3));
    g.save(); g.translate(xs[k], cy); g.scale(1 + 0.12 * on * kick(t - act[k] - 0.3, 5), 1 + 0.12 * on * kick(t - act[k] - 0.3, 5));
    g.fillStyle = on > 0.5 ? C.blue : '#E8F0FE'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill();
    miniIcon(g, k, on > 0.5 ? '#fff' : C.blue);
    g.restore();
    text(g, labels[k], xs[k], y0 + 128, { f: 'Txt', w: 600, s: 25, c: on > 0.5 ? C.ink : C.inkSoft });
  }
  g.restore();
}
function miniIcon(g, k, col) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  if (k === 0) { // aşçı şapkası
    g.moveTo(-12, 8); g.lineTo(-12, 0); g.arc(-10, -6, 8, Math.PI * 0.6, Math.PI * 1.6); g.arc(0, -11, 9, Math.PI * 1.1, Math.PI * 1.9); g.arc(10, -6, 8, Math.PI * 1.4, Math.PI * 0.4); g.lineTo(12, 8); g.closePath();
    g.moveTo(-12, 14); g.lineTo(12, 14);
  } else if (k === 1) { // scooter
    g.moveTo(-8, 10); g.arc(-13, 10, 5, 0, TAU); g.moveTo(18, 10); g.arc(13, 10, 5, 0, TAU);
    g.moveTo(-18, 3); g.lineTo(-2, 3); g.lineTo(4, 10); g.lineTo(8, 10); g.moveTo(13, 10); g.lineTo(8, -12); g.lineTo(2, -12);
    g.moveTo(-17, -1); g.lineTo(-17, -12); g.lineTo(-5, -12); g.lineTo(-5, -1);
  } else { // ev
    g.moveTo(-15, -1); g.lineTo(0, -15); g.lineTo(15, -1); g.moveTo(-11, -4); g.lineTo(-11, 14); g.lineTo(11, 14); g.lineTo(11, -4); g.moveTo(-3, 14); g.lineTo(-3, 4); g.lineTo(3, 4); g.lineTo(3, 14);
  }
  g.stroke();
}
function scene5(g, t) {
  const wp = E.inOutCubic(prog(t, WHIP.t0, WHIP.t1));
  if (wp < 1) { g.save(); g.translate(-W * wp, 0); kitchen(g, t); g.restore(); }
  if (wp > 0) { g.save(); g.translate(W * (1 - wp), 0); street(g, t); g.restore(); }
  stepper(g, t);
  const ca = 1 - prog(t, DOORZ.t0 - 0.1, DOORZ.t0 + 0.15);
  if (ca > 0) {
    g.save(); g.globalAlpha = ca;
    cap(g, 'Siparişin', 300, { s: 100 }, t, T.siparisin - 0.05, T.kapina - 0.34);
    cap(g, 'hazırlanır,', 430, { s: 124, c: C.amberL }, t, T.hazirlanir - 0.05, T.kapina - 0.3);
    cap(g, 'kapına gelir!', 360, fit(g, 'kapına gelir!', { s: 136, c: C.amberL }, 960), t, T.kapina - 0.05);
    g.restore();
  }
  whiteFlash(g, 1 - prog(t, DIVE.t1, DIVE.t1 + 0.25));
  whiteFlash(g, prog(t, 23.18, 23.42), '255,227,176');
}

/* ───────────────────────── 6. VURGU (23–27.5 sn) ───────────────────────── */
const EXP = { t0: 27.0, t1: 27.55 };
const P6 = { x: 540, y: 1280, r: 260 };
function scene6(g, t) {
  bgBlue(g, t, { warm: 0.3, wy: 1250 });
  const fo = 1 - prog(t, 26.95, 27.2);
  const ta = T.ac - 0.03;
  rays(g, 540, 700, t * 0.18, 0.15 * E.outCubic(prog(t, ta, ta + 0.25)) * fo, '255,206,110');
  const ex = E.inCubic(prog(t, EXP.t0, EXP.t1));
  const pd = E.outBack(prog(t, 23.55, 23.95));
  const py = lerp(-500, P6.y, pd) + Math.sin(t * 3) * 6 * prog(t, 24.2, 25);
  plate(g, P6.x, py, lerp(P6.r, 2700, ex));
  if (fo > 0) {
    const fk = E.outCubic(prog(t, 23.75, 24.15));
    fork(g, 200 - (1 - fk) * 300, P6.y + 20, 290, 0, fk * fo);
    knife(g, 880 + (1 - fk) * 300, P6.y + 20, 290, 0, fk * fo);
    steam(g, P6.x, py - 170, 1.4, t, prog(t, 24.0, 24.4) * fo);
    food(g, 'lahmacun', P6.x, py, 390, 0.2, fo);
    const ay = E.outBack(prog(t, 23.85, 24.2));
    food(g, 'ayran', 830, P6.y - 175, 215 * ay, 0.1, fo);
    g.save(); g.globalAlpha = fo;
    cap(g, 'Kısacası,', 380, { f: 'Txt', w: 600, s: 64, c: '#D6E6FF' }, t, Math.max(23.55, T.kisacasi - 0.05));
    cap(g, 'Uygulamayı kullanan', 540, fit(g, 'Uygulamayı kullanan', { s: 104, w: 800 }, 960), t, T.uygulamayi - 0.05);
    const so = fit(g, 'AÇ KALMIYOR!', { s: 200, c: C.amberL }, 990);
    const sl = (i, n) => { const p = E.outExpo(prog(t, ta + i * 0.025, ta + i * 0.025 + 0.26)); return { sc: lerp(2.4, 1, p), al: clamp(p * 3) }; };
    drawParts(g, PARTS.ac, 540, 700, t - ta, 1300);
    letters(g, 'AÇ KALMIYOR!', 540, 752 + 10, { ...so, c: '#0B3FA8' }, (i, n) => { const r = sl(i, n); return { ...r, al: r.al * 0.5 }; });
    letters(g, 'AÇ KALMIYOR!', 540, 752, so, sl);
    g.restore();
  }
  whiteFlash(g, 1 - prog(t, 23.42, 23.8), '255,227,176');
}

/* ───────────────────────── 7. KAPANIŞ: Yakınla logosu (27.5–35 sn) ───────────────────────── */
// Kaynak görsel: assets/yakinla-logo-kart.png (2000×1600, şeffaf). [x, y, w, h] kırpma kutuları.
const LOGO = {
  pin: [832, 122, 359, 469], face: [180, 175.5], faceR: 101, hub: 14,
  word: [313, 690, 1367, 209], wordCuts: [313, 751.5, 966.5, 1049, 1284.5, 1446.5, 1680],
  slogan: [455, 967, 1144, 103], sloganCuts: [455, 623, 1150, 1599],
  badges: [643, 1198, 709, 112], badgeCut: 997.5,
  web: [354, 1425, 292, 53], dev: [730, 1425, 916, 53],
};
const LAY = {
  pin: { s: 0.8, y: 330 }, word: { s: 0.68, y: 775 }, slogan: { s: 0.74, y: 972 },
  badges: { s: 1.0, y: 1150 }, web: { s: 1.05, y: 1360 }, dev: { s: 0.85, y: 1438 },
};
const PIN = { t0: 27.95, land: 28.25 };
function piece(g, src, x, y, s, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= Math.min(1, a);
  g.drawImage(SPR.logo, src[0], src[1], src[2], src[3], x, y, src[2] * s, src[3] * s);
  g.restore();
}
function scene7(g, t) {
  g.fillStyle = '#FFFFFF'; g.fillRect(-100, -100, W + 200, H + 200);
  // soluk yemek siluetleri
  const fa = prog(t, 28.2, 29.2);
  if (fa > 0) {
    const spots = [[120, 250, 150, 0], [960, 300, 140, 3], [95, 1120, 150, 1], [985, 1020, 150, 2], [150, 1680, 160, 5], [930, 1720, 150, 4]];
    for (const [x, y, s, i] of spots) {
      const spr = SPR.ghost[FOODS[i]], k = s / FOODPX;
      g.save(); g.globalAlpha = 0.045 * fa; g.translate(x + Math.sin(t * 0.6 + i) * 10, y + Math.cos(t * 0.5 + i) * 12); g.rotate(Math.sin(t * 0.4 + i) * 0.15); g.scale(k, k);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
  }
  // pin: düşer, ezilir, sıçrar; ibreler dönerek yerine oturur
  const L = LAY.pin, pk = LOGO.pin, pw = pk[2] * L.s, ph = pk[3] * L.s;
  const tipY = L.y + ph;
  if (t >= PIN.t0) {
    const fall = prog(t, PIN.t0, PIN.land);
    let dy = -1300 * (1 - fall * fall), sx = 1, sy = 1;
    const dl = t - PIN.land;
    if (dl > 0) {
      dy = -70 * Math.max(0, Math.sin(dl * TAU * 1.5)) * Math.exp(-dl * 6);
      const q = 0.15 * Math.exp(-dl * 11) * Math.cos(dl * TAU * 2.4);
      sy = 1 - q; sx = 1 + q;
    } else { sy = 1 + 0.12 * fall; sx = 1 - 0.06 * fall; }
    // gölge ve halka
    const sh = dl > 0 ? 1 : fall;
    glow(g, SPR.shadow, 540, tipY + 6, 170 * (0.4 + 0.6 * sh), 0.45 * sh, 0.16);
    if (dl > 0 && dl < 0.9) {
      const rp = E.outCubic(dl / 0.9);
      g.strokeStyle = `rgba(31,115,240,${0.35 * (1 - rp)})`; g.lineWidth = 6;
      g.beginPath(); g.ellipse(540, tipY, 60 + 260 * rp, (60 + 260 * rp) * 0.2, 0, 0, TAU); g.stroke();
    }
    g.save(); g.translate(540, tipY + dy); g.scale(sx, sy); g.translate(-540, -tipY);
    glow(g, SPR.blue, 540, L.y + ph * 0.38, 330, 0.18 * prog(t, PIN.land, PIN.land + 0.6));
    piece(g, pk, 540 - pw / 2, L.y, L.s);
    // ibreler
    const fx = 540 - pw / 2 + LOGO.face[0] * L.s, fy = L.y + LOGO.face[1] * L.s;
    g.fillStyle = 'rgb(244,245,247)'; g.beginPath(); g.arc(fx, fy, LOGO.faceR * L.s, 0, TAU); g.fill();
    const hp = E.outCubic(prog(t, PIN.land - 0.05, PIN.land + 0.75));
    const a1 = -Math.PI / 2 - (1 - hp) * TAU * 1.0, a2 = -(1 - hp) * TAU * 2.25;
    g.strokeStyle = '#0256E4'; g.lineCap = 'round';
    g.lineWidth = 18 * L.s; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a1) * 84 * L.s, fy + Math.sin(a1) * 84 * L.s); g.stroke();
    g.lineWidth = 17 * L.s; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a2) * 82 * L.s, fy + Math.sin(a2) * 82 * L.s); g.stroke();
    g.fillStyle = '#0256E4'; g.beginPath(); g.arc(fx, fy, LOGO.hub * L.s, 0, TAU); g.fill();
    g.restore();
  }
  // YAKINLA: harf grupları sırayla yükselir; sonra üzerinden parlama geçer
  const Wd = LAY.word, wx0 = 540 - LOGO.word[2] * Wd.s / 2;
  const cuts = LOGO.wordCuts;
  for (let i = 0; i < cuts.length - 1; i++) {
    const p = prog(t, T.yakinlayi - 0.06 + i * 0.055, T.yakinlayi - 0.06 + i * 0.055 + 0.42);
    if (p <= 0) continue;
    const e = E.outBack(p), src = [cuts[i], LOGO.word[1], cuts[i + 1] - cuts[i], LOGO.word[3]];
    const x = wx0 + (cuts[i] - cuts[0]) * Wd.s, w = src[2] * Wd.s, h = src[3] * Wd.s;
    g.save(); g.translate(x + w / 2, Wd.y + h); g.scale(lerp(0.6, 1, e), lerp(0.6, 1, e)); g.translate(-(x + w / 2), -(Wd.y + h));
    piece(g, src, x, Wd.y + (1 - e) * 70, Wd.s, clamp(p * 3));
    g.restore();
  }
  const sh = prog(t, 32.2, 32.85);
  if (sh > 0 && sh < 1) {
    const w = LOGO.word[2] * Wd.s, h = LOGO.word[3] * Wd.s;
    const c = SPR.shineC, x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, c.width, c.height);
    x.drawImage(SPR.logo, LOGO.word[0], LOGO.word[1], LOGO.word[2], LOGO.word[3], 0, 0, w, h);
    x.globalCompositeOperation = 'source-atop';
    const bx = lerp(-200, w + 200, E.inOutSine(sh));
    const gr = x.createLinearGradient(bx - 120, 0, bx + 120, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    g.drawImage(c, 0, 0, w, h, wx0, Wd.y, w, h);
  }
  // mağaza rozetleri
  const B = LAY.badges, bk = LOGO.badges, bx0 = 540 - bk[2] * B.s / 2;
  [[bk[0], LOGO.badgeCut], [LOGO.badgeCut, bk[0] + bk[2]]].forEach(([a, b], i) => {
    const p = prog(t, T.indir - 0.04 + i * 0.12, T.indir - 0.04 + i * 0.12 + 0.42);
    if (p <= 0) return;
    const e = E.outBack(p), x = bx0 + (a - bk[0]) * B.s, w = (b - a) * B.s, h = bk[3] * B.s;
    g.save(); g.translate(x + w / 2, B.y + h / 2); g.scale(lerp(0.5, 1, e), lerp(0.5, 1, e)); g.translate(-(x + w / 2), -(B.y + h / 2));
    piece(g, [a, bk[1], b - a, bk[3]], x, B.y, B.s, clamp(p * 3));
    g.restore();
  });
  // slogan: "Ne Lazımsa, Yakınla." sözle birlikte
  const S = LAY.slogan, sk = LOGO.slogan, sx0 = 540 - sk[2] * S.s / 2, sc = LOGO.sloganCuts;
  [T.ne, T.lazimsa, T.yakinlaSon].forEach((wt, i) => {
    const p = prog(t, wt - 0.06, wt + 0.32);
    if (p <= 0) return;
    const e = E.outCubic(p), x = sx0 + (sc[i] - sc[0]) * S.s;
    g.save(); g.beginPath(); g.rect(x - 10, S.y - 20, (sc[i + 1] - sc[i]) * S.s + 20, sk[3] * S.s + 30); g.clip();
    piece(g, [sc[i], sk[1], sc[i + 1] - sc[i], sk[3]], x, S.y + (1 - e) * sk[3] * S.s * 1.1, S.s, 1);
    g.restore();
  });
  // alt satır: yakinla.com · Afşinli yazılımcılar tarafından geliştirildi.
  for (const [key, t0] of [['web', 31.65], ['dev', 31.85]]) {
    const p = E.outCubic(prog(t, t0, t0 + 0.5)), src = LOGO[key], l = LAY[key];
    piece(g, src, 540 - src[2] * l.s / 2, l.y + (1 - p) * 24, l.s, p);
  }
}

/* ───────────────────────── kamera sarsıntısı ve ana çizim ───────────────────────── */
let IMPACTS = [];
function shake(t) {
  let x = 0, y = 0, r = 0;
  for (const [t0, amp] of IMPACTS) {
    const dt = t - t0; if (dt < 0 || dt > 0.7) continue;
    const e = Math.exp(-dt * 9) * amp;
    x += Math.sin(dt * 71 + t0) * e; y += Math.cos(dt * 63 + t0 * 2) * e; r += Math.sin(dt * 53) * e * 0.0009;
  }
  return [x, y, r];
}
function draw(g, t) {
  g.save();
  const [sx, sy, sr] = shake(t);
  g.translate(540 + sx, 960 + sy); g.rotate(sr); g.translate(-540, -960);
  if (t < T.mujde) scene1(g, t);
  else if (t < ZOOM2.t1) scene2(g, t);
  else if (t < DIVE.t1) scene34(g, t);
  else if (t < 23.42) scene5(g, t);
  else if (t < EXP.t1) scene6(g, t);
  else scene7(g, t);
  g.restore();
  if (t < EXP.t1) vignette(g, 0.9 * (1 - prog(t, EXP.t0, EXP.t1)));
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(3), type, ...o });
  // 1. kanca
  cue(0.0, 'night', { dur: 3.9, gain: 0.5 });
  cue(0.62, 'pop', { pitch: 0.7, gain: 0.35 });
  cue(0.85, 'whoosh', { dur: 0.3, f0: 600, f1: 2400, gain: 0.18, pan: -0.5 });
  cue(0.85, 'whoosh', { dur: 0.3, f0: 600, f1: 2400, gain: 0.18, pan: 0.5 });
  cue(T.zil - 0.12, 'pop', { pitch: 1.1, gain: 0.35, pan: 0.6 });
  cue(T.zil, 'ring', { dur: 1.3, gain: 0.5, pan: 0.55 });
  cue(GROWL.t0, 'growl', { dur: GROWL.t1 - GROWL.t0 + 0.15, gain: 0.95 });
  cue(3.35, 'reverse', { dur: 0.6, gain: 0.5 });
  // 2. müjde
  cue(T.mujde, 'impact', { gain: 1.0, big: true });
  cue(T.mujde, 'slam', { gain: 0.8 });
  cue(T.mujde + 0.72, 'whoosh', { dur: 0.35, f0: 3000, f1: 600, gain: 0.35 });
  cue(T.yakinla - 0.04, 'whoosh', { dur: 0.25, f0: 900, f1: 4000, gain: 0.25 });
  cue(T.yemek - 0.04, 'whoosh', { dur: 0.25, f0: 900, f1: 4000, gain: 0.25 });
  cue(T.yemek + 0.3, 'pop', { pitch: 1.3, gain: 0.45, pan: 0.5 });
  cue(T.artik - 0.05, 'whoosh', { dur: 0.3, f0: 500, f1: 2500, gain: 0.2 });
  cue(T.aktif, 'toggle', { gain: 0.8, pan: 0.3 });
  cue(T.aktif + 0.06, 'success', { gain: 0.55 });
  cue(T.aktif + 0.1, 'sparkle', { dur: 0.8, gain: 0.35 });
  cue(ZOOM2.t0, 'whoosh', { dur: 0.45, f0: 300, f1: 7000, gain: 0.55 });
  // 3. lezzetler
  SHOW.forEach((it, i) => {
    cue(it.ds, 'whoosh', { dur: 0.24, f0: 2500, f1: 500, gain: 0.25, pan: (i % 2 ? -0.2 : 0.2) });
    cue(it.land, 'thump', { gain: 0.55 });
    cue(it.land + 0.01, 'pop', { pitch: 0.9 + i * 0.12, gain: 0.4 });
    if (i > 0) cue(it.ds, 'whoosh', { dur: 0.22, f0: 900, f1: 5000, gain: 0.25, pan: i % 2 ? 0.6 : -0.6 });
  });
  cue(SHOW[4].land + 0.05, 'sparkle', { dur: 0.9, gain: 0.4 });
  cue(RING_T, 'sweep', { dur: 0.5, gain: 0.3 });
  FOODS.forEach((f, i) => cue(RING_T + i * 0.05 + 0.12, 'pop', { pitch: 1.0 + i * 0.1, gain: 0.28, pan: Math.cos(-Math.PI / 2 + i * TAU / 6) * 0.6 }));
  cue(PHONE_IN, 'whoosh', { dur: 0.45, f0: 300, f1: 3500, gain: 0.45 });
  FLY.forEach((f, i) => cue(f.t0 + f.d, 'blip', { pitch: 1.0 + i * 0.12, gain: 0.3 }));
  // 4. sipariş
  cue(ORD.sel, 'tap', { gain: 0.8 });
  cue(ORD.add1, 'tap', { gain: 0.8 }); cue(ORD.add1 + 0.46, 'coin', { gain: 0.45 });
  cue(ORD.add2, 'tap', { gain: 0.8 }); cue(ORD.add2 + 0.46, 'coin', { pitch: 1.12, gain: 0.45 });
  cue(ORD.ctaIn, 'whoosh', { dur: 0.25, f0: 600, f1: 2500, gain: 0.25 });
  cue(ORD.cta, 'tap', { gain: 0.85 });
  cue(ORD.ok + 0.05, 'success', { gain: 0.65 });
  cue(DIVE.t0 + 0.05, 'whoosh', { dur: 0.42, f0: 300, f1: 9000, gain: 0.6 });
  // 5. teslimat
  cue(DIVE.t1, 'impact', { gain: 0.6 });
  cue(18.55, 'pop', { pitch: 0.75, gain: 0.4 });
  cue(18.6, 'sizzle', { dur: 0.75, gain: 0.35 });
  cue(BOX.c0, 'whoosh', { dur: 0.3, f0: 2000, f1: 400, gain: 0.25 });
  cue(BOX.c1, 'thud', { gain: 0.75 });
  cue(BOX.st + 0.05, 'slap', { gain: 0.6 });
  cue(BOX.st + 0.1, 'shine', { dur: 0.4, gain: 0.25 });
  cue(WHIP.t0 - 0.05, 'whoosh', { dur: 0.42, f0: 400, f1: 8000, gain: 0.6 });
  const track = [];
  for (let t = RIDE.t0; t <= RIDE.stop + 0.2; t += 0.05) track.push([+t.toFixed(3), -0.25, +clamp(rideV(t) / RIDE.vmax, 0, 1.2).toFixed(3)]);
  cue(RIDE.t0, 'motor', { gain: 0.32, track });
  cue(20.35, 'shimmer', { dur: 0.9, gain: 0.3 });
  cue(21.7, 'brake', { dur: 0.6, gain: 0.25 });
  cue(RIDE.stop + 0.05, 'pop', { pitch: 1.4, gain: 0.35, pan: 0.2 });
  cue(BELL_T, 'doorbell', { gain: 0.75, pan: 0.35 });
  cue(DOORZ.open0, 'door', { dur: 0.5, gain: 0.4, pan: 0.3 });
  cue(DOORZ.t0 + 0.15, 'whoosh', { dur: 0.5, f0: 300, f1: 6000, gain: 0.5 });
  // 6. vurgu
  cue(23.42, 'shimmer', { dur: 0.7, gain: 0.3 });
  cue(23.6, 'whoosh', { dur: 0.3, f0: 2500, f1: 500, gain: 0.3 });
  cue(23.95, 'thump', { gain: 0.6 });
  cue(24.1, 'pop', { pitch: 1.2, gain: 0.35, pan: 0.5 });
  cue(T.ac - 0.03, 'impact', { gain: 1.0, big: true });
  cue(T.ac - 0.03, 'slam', { gain: 0.85 });
  cue(T.ac + 0.02, 'sparkle', { dur: 1.2, gain: 0.4 });
  cue(EXP.t0, 'whoosh', { dur: 0.55, f0: 300, f1: 9000, gain: 0.55 });
  // 7. kapanış
  cue(PIN.t0, 'fall', { dur: PIN.land - PIN.t0, gain: 0.35 });
  cue(PIN.land, 'thump', { gain: 0.7 });
  cue(PIN.land + 0.05, 'click', { gain: 0.5 });
  cue(PIN.land + 0.7, 'click', { gain: 0.45 });
  for (let i = 0; i < 6; i++) cue(T.yakinlayi - 0.06 + i * 0.055 + 0.05, 'pop', { pitch: 1.0 + i * 0.09, gain: 0.22, pan: (i - 2.5) / 4 });
  cue(T.indir + 0.05, 'pop', { pitch: 1.35, gain: 0.32, pan: -0.3 }); cue(T.indir + 0.17, 'pop', { pitch: 1.55, gain: 0.32, pan: 0.3 });
  cue(T.yakinlaSon, 'sparkle', { dur: 1.2, gain: 0.3 });
  cue(32.2, 'shine', { dur: 0.5, gain: 0.3 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');
const PARTS = {};

function initSprites(logoImg) {
  SPR.white = makeGlow('255,255,255'); SPR.blue = makeGlow('59,139,255'); SPR.amber = makeGlow('255,181,71');
  SPR.green = makeGlow('34,197,94'); SPR.red = makeGlow('255,77,94'); SPR.shadow = makeShadow();
  const d = canvas(60, 60), dx = d.getContext('2d'); dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(30, 30, 3, 0, TAU); dx.fill();
  SPR.dots = g.createPattern(d, 'repeat');
  const v = g.createRadialGradient(540, 900, 520, 540, 960, 1260);
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,0.34)');
  SPR.vig = v;
  const m = canvas(176, 176), mx = m.getContext('2d');
  mx.fillStyle = '#FFE3A6'; mx.beginPath(); mx.arc(88, 88, 62, 0, TAU); mx.fill();
  mx.globalCompositeOperation = 'destination-out'; mx.beginPath(); mx.arc(114, 68, 56, 0, TAU); mx.fill();
  SPR.moon = m;
  SPR.food = {}; SPR.ghost = {};
  for (const n of FOODS) { SPR.food[n] = iconSprite(n, FOODPX); SPR.ghost[n] = tinted(SPR.food[n], C.blue); }
  SPR.bell = iconSprite('bell', 180);
  SPR.logo = logoImg;
  SPR.shineC = canvas(1000, 160);
  PARTS.toggle = makeParts(5, 40, { cols: ['#FFFFFF', C.amberL, C.green, '#9CC2FF'], v0: 1100, spread: Math.PI * 0.9, life: 1.0 });
  PARTS.ac = makeParts(9, 44, { cols: ['#FFFFFF', C.amberL, C.red, '#9CC2FF'], v0: 1500, spread: Math.PI, life: 1.5, foods: FOODS, foodP: 0.22, fs: 105 });
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
  const img = new Image(); img.src = 'assets/yakinla-logo-kart.png'; await img.decode();
  initDetails();
  initSprites(img);
  initTimeline();
  initStreet();
  IMPACTS = [[T.mujde, 30], [T.aktif, 10], ...SHOW.map(s => [s.land, 7]), [BOX.c1, 12], [T.ac - 0.03, 32], [PIN.land, 14]];
  window.CUES = buildCues();
  window.VO = VO;
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
