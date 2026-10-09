'use strict';
/* Karakutu Yazılım — 10 saniyelik motion graphics tanıtım (9:16, 1080×1920, 30 fps)
 *
 * Fikir "kara kutu"dan çıkar: girdisini ve çıktısını gördüğün, içini görmediğin kutu.
 * Fikir girer, kod olur, ürün çıkar. Çıkan ürün Karakutu'nun geliştirdiği Yakınla.
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik tohumludur ve
 * başlangıçta üretilir. renderFrame(f) kareyi 6 (hızlı anlarda 16) alt-örnekle
 * (180° obtüratör) çizip ortalar, böylece gerçek hareket bulanıklığı oluşur.
 *
 * Akış (120 BPM, 1 vuruş = 0.5 sn, 1 ölçü = 2 sn):
 *   0–2   Fikir girer   turuncu çizgi açılıp kutu olur, ampul kapaktaki yarığa düşer
 *   2–4   Kod olur      kutu döner, yüzlerinde kod akar, sembol kıvılcımları saçılır
 *   4–7   Ürün çıkar    kapak patlar, ışığın içinden Yakınla açık bir telefon yükselir
 *   7–10  Kapanış       telefon fırlar, kapak çarpar, kutu logoya dönüşür
 */

const W = 1080, H = 1920, FPS = 30, DUR = 10;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5;
const TAU = Math.PI * 2;

const C = {
  orange: '#FF6A13', orangeL: '#FF9A4D', orangeXL: '#FFC59A',
  white: '#F4F5F7', grey: '#9097A2', greyD: '#5A606B',
  blue: '#1F73F0', blueL: '#3B8BFF', blueD: '#0E5FE0',
};
const ISO = Math.atan(1 / Math.SQRT2); // gerçek izometrik eğim (35.26°)

/* ───────────────────────── yardımcılar ───────────────────────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  inQuad: x => x * x,
  outQuad: x => 1 - (1 - x) * (1 - x),
  inCubic: x => x * x * x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  inQuart: x => x * x * x * x,
  outQuart: x => 1 - Math.pow(1 - x, 4),
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: x => { const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
};
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
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const ORANGE = [255, 106, 19];

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
// Harf harf animasyon. fn(i, n) → {dx, dy, sc, al, c}
function letters(g, s, x, y, o, fn) {
  setFont(g, o);
  g.textAlign = 'left'; g.textBaseline = o.b || 'alphabetic';
  const total = g.measureText(s).width;
  const x0 = o.a === 'left' ? x : x - total / 2;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === ' ') continue;
    const off = g.measureText(s.slice(0, i)).width;
    const cw = g.measureText(ch).width;
    const r = fn(i, s.length) || {};
    const al = r.al == null ? 1 : r.al;
    if (al <= 0.002) continue;
    g.save();
    g.globalAlpha *= al;
    g.translate(x0 + off + cw / 2 + (r.dx || 0), y + (r.dy || 0));
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
  g.beginPath(); g.rect(-50, y - o.s * 1.05, W + 100, o.s * 1.38); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.2 };
  });
  g.restore();
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
function glow(g, spr, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  const ga = g.globalAlpha; g.globalAlpha = ga * a;
  g.drawImage(spr, x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = ga;
}
function loadImage(src) {
  return new Promise((ok, err) => { const im = new Image(); im.onload = () => ok(im); im.onerror = err; im.src = src; });
}

/* ───────────────────────── kod şeridi (kutunun yüzlerinde akar) ───────────────────────── */
const CODE = [
  "import { sepet, kurye } from './yakinla';",
  "",
  "// fikir → kod → ürün",
  "export async function siparisVer(k) {",
  "  const urunler = await sepet.getir(k.id);",
  "  if (!urunler.length) return null;",
  "",
  "  const siparis = await api.post('/siparis', {",
  "    urunler, adres: k.adres,",
  "    odeme: '3d-secure',",
  "  });",
  "  kurye.canliTakip(siparis.id);",
  "  return siparis;",
  "}",
  "",
  "const depo = 'Afşin';",
  "function rota(adres) {",
  "  return harita.yol(depo, adres, 60);",
  "}",
  "export default { siparisVer, rota };",
];
const TS = 600;                 // yüz dokusunun kenarı (birim)
const CODE_FS = 25, CODE_LH = 40;
const CODE_H = CODE.length * CODE_LH;
const KW = /^(import|from|export|async|function|const|let|await|if|return|default|new)$/;
function makeCodeStrip() {
  const c = canvas(TS, CODE_H * 2), x = c.getContext('2d');
  x.textBaseline = 'middle';
  const tok = /(\/\/.*$)|('[^']*')|(\d+)|([A-Za-zÇĞİÖŞÜçğıöşü_$][\wÇĞİÖŞÜçğıöşü$]*)|(\s+)|(.)/g;
  for (let rep = 0; rep < 2; rep++) {
    CODE.forEach((line, i) => {
      const y = (rep * CODE.length + i + 0.5) * CODE_LH;
      x.font = `500 ${CODE_FS - 4}px Mono`; x.textAlign = 'right'; x.fillStyle = 'rgba(255,255,255,0.22)';
      x.fillText(String(i + 1), 52, y);
      x.font = `700 ${CODE_FS}px Mono`; x.textAlign = 'left';
      let px = 74, m;
      tok.lastIndex = 0;
      while ((m = tok.exec(line)) && m[0].length) {
        const s = m[0];
        x.fillStyle = m[1] ? 'rgba(255,255,255,0.32)'
          : m[2] ? '#A6E3A1'
          : m[3] ? C.orangeXL
          : m[4] ? (KW.test(s) ? C.orange : 'rgba(255,255,255,0.9)')
          : 'rgba(200,206,216,0.6)';
        x.fillText(s, px, y);
        px += x.measureText(s).width;
      }
    });
  }
  return c;
}

/* ───────────────────────── 3B kutu ───────────────────────── */
// Birim küp [-1,1]³, y yukarı. Kamera +z'de, -z'ye bakar.
function makeCam(o) {
  const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
  const D = 7;
  const rot = p => {
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  };
  const P = p => {
    const r = rot(p), k = D / (D - r[2]);
    return [o.x + r[0] * o.s * k, o.y - r[1] * o.s * k * o.sy];
  };
  // Dış normali kameraya bakıyor mu? (perspektifle doğru test)
  const facing = (pts, n) => {
    const nr = rot(n);
    let cx = 0, cyy = 0, cz = 0;
    for (const p of pts) { const r = rot(p); cx += r[0] / 4; cyy += r[1] / 4; cz += r[2] / 4; }
    return nr[0] * -cx + nr[1] * -cyy + nr[2] * (D - cz) > 0;
  };
  return { rot, P, facing };
}
// Yüzler: doku çerçevesi [sol-üst, sağ-üst, sol-alt], dışarıdan bakınca düz okunur
const WALLS = [
  { n: [0, 0, 1], tex: [[-1, 1, 1], [1, 1, 1], [-1, -1, 1]] },
  { n: [1, 0, 0], tex: [[1, 1, 1], [1, 1, -1], [1, -1, 1]] },
  { n: [0, 0, -1], tex: [[1, 1, -1], [-1, 1, -1], [1, -1, -1]] },
  { n: [-1, 0, 0], tex: [[-1, 1, -1], [-1, 1, 1], [-1, -1, -1]] },
];
const LID_TEX = [[-1, 1, -1], [1, 1, -1], [-1, 1, 1]]; // menteşe arka kenarda (z = -1)
const BOTTOM_TEX = [[-1, -1, -1], [1, -1, -1], [-1, -1, 1]];
const RIM = [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]];
const quad = t => [t[0], t[1], [t[1][0] + t[2][0] - t[0][0], t[1][1] + t[2][1] - t[0][1], t[1][2] + t[2][2] - t[0][2]], t[2]];
const LIGHT = (() => { const v = [-0.42, 0.78, 0.46], l = Math.hypot(...v); return v.map(x => x / l); })();
const DARK = [15, 16, 20], LITE = [66, 70, 80];

function poly(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); }
// Doku alanını (TS×TS) ekrandaki yüze afin olarak eşler
function faceXf(g, P) {
  g.transform((P[1][0] - P[0][0]) / TS, (P[1][1] - P[0][1]) / TS, (P[3][0] - P[0][0]) / TS, (P[3][1] - P[0][1]) / TS, P[0][0], P[0][1]);
}

/* o: x, y, s, yaw, pitch, sy (dikey ölçek), lid (açı), code (alfa), scroll, seam, slot,
 *    light (iç ışık), inside(g, cam, rimP) (açık kutunun içine çizilenler) */
function drawBox(g, o) {
  const cam = makeCam(o);
  const shade = (n, inner) => {
    const r = cam.rot(inner ? n.map(v => -v) : n);
    const lam = Math.max(0, r[0] * LIGHT[0] + r[1] * LIGHT[1] + r[2] * LIGHT[2]);
    return inner ? mix([7, 7, 9], [26, 27, 32], lam) : mix(DARK, LITE, 0.12 + 0.88 * lam);
  };
  const walls = WALLS.map((f, i) => {
    const pts = quad(f.tex);
    return { i, n: f.n, P: pts.map(cam.P), front: cam.facing(pts, f.n) };
  });
  const a = o.lid || 0, sa = Math.sin(a), ca = Math.cos(a);
  const lidPts = quad(LID_TEX).map(p => [p[0], 1 + (p[2] + 1) * sa, -1 + (p[2] + 1) * ca]);
  const lidN = [0, ca, -sa];
  const lid = { P: lidPts.map(cam.P), out: cam.facing(lidPts, lidN) };
  const rimP = RIM.map(cam.P);
  const open = a > 1.0;
  const RIM_WALL = [2, 1, 0, 3];   // kenar e, hangi duvarın üst kenarı

  const fill = (P, col) => {
    poly(g, P); g.fillStyle = rgb(col); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
  };
  const drawLid = () => {
    if (lid.out) {
      fill(lid.P, shade(lidN));
      if (o.slot > 0) {               // fikir yarığı
        g.save(); poly(g, lid.P); g.clip(); faceXf(g, lid.P);
        g.fillStyle = '#030303'; g.beginPath(); g.roundRect(170, 274, 260, 52, 26); g.fill();
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = o.slot;
        g.fillStyle = C.orange; g.beginPath(); g.roundRect(186, 288, 228, 24, 12); g.fill();
        g.globalAlpha = o.slot * 0.6; glow(g, SPR.orange, 300, 300, 230);
        g.restore();
      }
    } else {
      // kapağın alt yüzü: içeriden gelen ışıkla turuncuya boyanır
      fill(lid.P, mix(shade(lidN, true), [140, 60, 18], 0.55 * (o.light || 0)));
    }
  };

  // 1. arka duvarların iç yüzleri ve taban
  for (const w of walls) if (!w.front) fill(w.P, shade(w.n, true));
  fill(quad(BOTTOM_TEX).map(cam.P), shade([0, -1, 0], true));
  if (o.light > 0) {                 // kutunun içindeki ışık
    g.save(); poly(g, rimP); g.clip();
    g.globalCompositeOperation = 'lighter';
    const c0 = cam.P([0, -0.2, 0]);
    glow(g, SPR.orange, c0[0], c0[1], o.s * 2.6, o.light * 0.9);
    glow(g, SPR.white, c0[0], c0[1], o.s * 1.2, o.light * 0.5);
    g.restore();
  }
  // ek yeri: kutudan sızan turuncu ışık. Açık kutuda arka kenarlar içeriğin arkasında kalır.
  const drawSeam = which => {
    if (!(o.seam > 0)) return;
    const sel = [0, 1, 2, 3].filter(e => which === 'all' || walls[RIM_WALL[e]].front === (which === 'near'));
    if (!sel.length) return;
    const start = which === 'all' ? 0 : sel.find(e => !sel.includes((e + 3) % 4));
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineJoin = 'round'; g.lineCap = 'round';
    for (const [lw, al, col] of [[16, 0.12, C.orange], [7, 0.35, C.orange], [2.4, 0.9, C.orangeXL]]) {
      g.beginPath(); g.moveTo(rimP[start][0], rimP[start][1]);
      for (let k = 1; k <= sel.length; k++) { const q = rimP[(start + k) % 4]; g.lineTo(q[0], q[1]); }
      if (which === 'all') g.closePath();
      g.lineWidth = lw; g.strokeStyle = col; g.globalAlpha = al * o.seam; g.stroke();
    }
    g.restore();
  };
  // 2. açık kapak arkada kalır; içerik (ışık hüzmesi, telefon) ön duvarların arkasına çizilir.
  //    İçerik, ön kenar çizgisinin (sol köşe → ön köşe → sağ köşe) üstüne kırpılır:
  //    altındaki her şey ya ön duvarın arkasında ya da kutunun altında kalır.
  if (open) { drawSeam('far'); drawLid(); }
  if (o.inside) {
    const by = (f, k) => rimP.reduce((m, q) => f(q[k], m[k]) ? q : m);
    const L = by((a, b) => a < b, 0), R = by((a, b) => a > b, 0), F = by((a, b) => a > b, 1);
    g.save(); g.beginPath();
    g.moveTo(L[0] - 3000, L[1]); g.lineTo(L[0], L[1]); g.lineTo(F[0], F[1]); g.lineTo(R[0], R[1]);
    g.lineTo(R[0] + 3000, R[1]); g.lineTo(R[0] + 3000, -3000); g.lineTo(L[0] - 3000, -3000); g.closePath(); g.clip();
    o.inside(g, cam, rimP);
    g.restore();
  }
  // 3. ön duvarların dış yüzleri, üzerlerinde kod
  for (const w of walls) {
    if (!w.front) continue;
    fill(w.P, shade(w.n));
    if (o.code > 0) {
      g.save(); poly(g, w.P); g.clip(); faceXf(g, w.P);
      g.globalAlpha = o.code;
      const off = ((o.scroll || 0) + w.i * 330) % CODE_H;
      g.drawImage(SPR.code, 0, -off);
      // üst ve alt kenarda koda hafif kararma
      const col = shade(w.n), fg = g.createLinearGradient(0, 0, 0, TS);
      fg.addColorStop(0, rgb(col)); fg.addColorStop(0.16, rgb(col, 0)); fg.addColorStop(0.84, rgb(col, 0)); fg.addColorStop(1, rgb(col));
      g.globalAlpha = 1; g.fillStyle = fg; g.fillRect(0, 0, TS, TS);
      g.restore();
    }
  }
  if (!open) drawLid();
  drawSeam(open ? 'near' : 'all');
  return { cam, rimP, lid };
}

/* ───────────────────────── ikonlar ───────────────────────── */
function bulb(g, x, y, sc, rot, a) {
  if (a <= 0 || sc <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= a;
  g.globalCompositeOperation = 'lighter';
  glow(g, SPR.orange, 0, -20, 190, 0.55);
  glow(g, SPR.white, 0, -20, 90, 0.35);
  g.globalCompositeOperation = 'source-over';
  const gr = g.createRadialGradient(-14, -38, 4, 0, -20, 52);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.5, '#FFE2C2'); gr.addColorStop(1, '#FFA45C');
  g.fillStyle = gr;
  g.beginPath(); g.arc(0, -22, 46, Math.PI * 0.78, Math.PI * 2.22); g.lineTo(18, 30); g.lineTo(-18, 30); g.closePath(); g.fill();
  g.strokeStyle = C.orange; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-12, 22); g.lineTo(-10, -14); g.lineTo(-3, -4); g.lineTo(3, -14); g.lineTo(10, -4); g.lineTo(12, 22); g.stroke();
  g.fillStyle = '#B9BEC7';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.roundRect(-20 + i * 1.5, 32 + i * 10, 40 - i * 3, 8, 4); g.fill(); }
  g.fillStyle = '#6C727D'; g.beginPath(); g.roundRect(-9, 62, 18, 7, 3.5); g.fill();
  g.restore();
}

/* ───────────────────────── telefon (Yakınla açılış ekranı) ───────────────────────── */
const PW = 330, PH = 680;
function drawPhone(g, x, y, sc, rot, t, glint) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
  g.fillStyle = '#0A0B0E'; g.beginPath(); g.roundRect(-PW / 2, -PH / 2, PW, PH, 56); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = '#3A3F49'; g.lineWidth = 3; g.stroke();
  const ix = -PW / 2 + 13, iy = -PH / 2 + 13, iw = PW - 26, ih = PH - 26;
  g.save(); g.beginPath(); g.roundRect(ix, iy, iw, ih, 44); g.clip();
  const bg = g.createLinearGradient(0, iy, 0, iy + ih);
  bg.addColorStop(0, C.blueL); bg.addColorStop(0.5, C.blue); bg.addColorStop(1, C.blueD);
  g.fillStyle = bg; g.fillRect(ix, iy, iw, ih);
  g.globalAlpha = 0.1; g.fillStyle = SPR.dots; g.save(); g.translate(0, -((t * 20) % 32)); g.fillRect(ix, iy, iw, ih + 40); g.restore();
  g.globalAlpha = 1;
  glow(g, SPR.white, 0, -70, 260, 0.22);
  // durum çubuğu ve kamera adası
  text(g, '09:41', ix + 34, iy + 40, { f: 'Txt', w: 600, s: 19, a: 'left', c: 'rgba(255,255,255,0.95)' });
  g.fillStyle = 'rgba(255,255,255,0.95)';
  for (let i = 0; i < 4; i++) g.fillRect(ix + iw - 74 + i * 7, iy + 40 - 5 - i * 3, 4.5, 5 + i * 3);
  g.beginPath(); g.roundRect(ix + iw - 40, iy + 27, 24, 12, 3); g.fill();
  g.fillStyle = '#05060A'; g.beginPath(); g.roundRect(-52, iy + 16, 104, 30, 15); g.fill();
  // logo, ad, slogan
  if (SPR.yakinla) g.drawImage(SPR.yakinla, -92, -205, 184, 184);
  text(g, 'Yakınla', 0, 50, { s: 70, w: 900, c: '#fff', ls: -1 });
  text(g, "Afşin'in marketi, cebinde.", 0, 98, { f: 'Txt', w: 600, s: 23, c: 'rgba(255,255,255,0.88)' });
  g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.roundRect(-110, 190, 220, 58, 29); g.fill();
  text(g, 'yakinla.com', 0, 228, { f: 'Txt', w: 700, s: 22, c: '#fff' });
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.roundRect(-56, iy + ih - 22, 112, 6, 3); g.fill();
  // cam parlaması
  if (glint > -0.3 && glint < 1.3) {
    const gx = lerp(-PW, PW, glint);
    g.setTransform(g.getTransform().multiply(new DOMMatrix().skewX(-24)));
    const gg = g.createLinearGradient(gx - 90, 0, gx + 90, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gg; g.fillRect(gx - 90, -PH, 180, PH * 2);
  }
  g.restore();
  g.restore();
}

function chip(g, x, y, label, p, q, t, ph) {
  const s = spring(p, 2.0, 7) * (1 - E.inCubic(q));
  if (s <= 0.001) return;
  const o = { f: 'Txt', w: 700, s: 34 };
  const w = measure(g, label, o) + 84, h = 72;
  g.save(); g.translate(x, y + Math.sin(t * 2.2 + ph) * 6); g.scale(s, s);
  g.globalAlpha *= clamp(p * 4) * (1 - q);
  g.fillStyle = 'rgba(22,24,30,0.92)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = C.orange; g.beginPath(); g.arc(-w / 2 + 34, 0, 8, 0, TAU); g.fill();
  text(g, label, -w / 2 + 56, 12, { ...o, a: 'left', c: C.white });
  g.restore();
}

/* ───────────────────────── sahne ───────────────────────── */
// Kutu yerleşimi zamanın fonksiyonu
const POSE_A = { x: 540, y: 1110, s: 200, pitch: 0.5 };  // 0–4 sn: sahne ortası
const POSE_B = { x: 540, y: 1420, s: 165, pitch: 0.5 };  // 4–7 sn: aşağıda, telefon için yer açar
const POSE_C = { x: 540, y: 600, s: 118, pitch: ISO };   // 7+ sn: logo
const YAW0 = Math.PI / 4;
function yawAt(t) {
  if (t < 2) return YAW0 - 0.6 + 0.3 * t;
  if (t < 3.9) return YAW0 + 0.3 * (t - 2) + (TAU - 0.57) * E.inOutCubic(prog(t, 2, 3.9));
  return YAW0 + TAU + (Math.PI / 2) * E.inOutCubic(prog(t, 7.05, 7.7));
}
function boxPose(t) {
  const m1 = E.inOutCubic(prog(t, 3.8, 4.25)), m2 = E.outExpo(prog(t, 7.05, 7.75));
  const P = k => lerp(lerp(POSE_A[k], POSE_B[k], m1), POSE_C[k], m2);
  return { x: P('x'), y: P('y'), s: P('s'), pitch: P('pitch'), yaw: yawAt(t) };
}
const IMPACTS = [[1.5, 6], [4.0, 18], [7.0, 12]]; // [zaman, kamera sarsıntısı (px)]

// Sembol kıvılcımları (2–3.9 sn): kutunun yarığından fışkırır
const GLYPHS = ['{ }', '</>', '=>', '01', '( )', '[ ]', ';', '&&', 'fn', '#', '++', '{}'];
const SPARKS = (() => {
  const r = mulberry32(46), a = [];
  for (let i = 0; i < 46; i++) {
    const ang = -Math.PI / 2 + (r() - 0.5) * 2.4;
    const v = 520 + r() * 640;
    a.push({ t0: 2.05 + (i / 46) * 1.8 + r() * 0.05, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 0.75 + r() * 0.5,
      g: GLYPHS[(r() * GLYPHS.length) | 0], s: 30 + r() * 30, rot: (r() - 0.5) * 0.8, col: r() < 0.55 ? C.orange : C.white });
  }
  return a;
})();
// Kodlama sırasında "tuş" ipuçları (ses için)
const KEYS = (() => { const r = mulberry32(7), a = []; for (let t = 2.02; t < 3.72; t += 0.035 + r() * 0.05) a.push({ t, p: 0.75 + r() * 0.6, pan: (r() - 0.5) * 0.8 }); return a; })();

function background(g, t, glowA, glowY) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#0C0E12'); gr.addColorStop(1, '#040506');
  g.fillStyle = gr; g.fillRect(-200, -200, W + 400, H + 400);
  const beat = (t % 0.5) / 0.5, pulse = t > 2 && t < 6.9 ? Math.exp(-beat * 5) : 0;
  g.save(); g.globalAlpha = 0.05 + 0.035 * pulse;
  g.fillStyle = SPR.dots; g.translate(0, (t * 14) % 48); g.fillRect(-48, -96, W + 96, H + 192);
  g.restore();
  glow(g, SPR.orange, 540, glowY, 900, glowA);
}

function draw(g, t) {
  // kamera sarsıntısı
  let shx = 0, shy = 0;
  for (const [ti, amp] of IMPACTS) {
    const k = kick(t - ti, 9) * amp;
    shx += Math.sin(t * 91 + ti) * k; shy += Math.cos(t * 77 + ti * 3) * k;
  }
  if (t > 3.55 && t < 4.0) { const k = prog(t, 3.55, 3.98) * 7; shx += Math.sin(t * 140) * k; shy += Math.cos(t * 113) * k * 0.6; }

  const pose = boxPose(t);
  const flash = kick(t - 4.0, 5) * (t >= 4 ? 1 : 0);
  background(g, t, 0.10 + 0.12 * Math.exp(-((t % 0.5) / 0.5) * 4) * (t > 2 && t < 7 ? 1 : 0) + 0.25 * flash + (t > 7 ? 0.08 : 0), pose.y);

  g.save(); g.translate(shx, shy);

  /* ── kutu durumu ── */
  // açılış: ek yeri çizgisi ortadan açılır, sonra kutu yayla yükselir
  const born = clamp(spring(t - 0.28, 1.5, 6.5), 0.002, 1.3);
  // inişte ve çarpmada ezilme
  const squash = 1 - 0.07 * Math.sin(Math.min(1, (t - 1.5) / 0.22) * Math.PI) * (t > 1.5 && t < 1.72 ? 1 : 0)
                   - 0.09 * kick(t - 7.0, 9) * Math.cos((t - 7.0) * 30) * (t >= 7 ? 1 : 0);
  const breathe = t > 2 && t < 3.9 ? 1 + 0.025 * kick((t - 2) % 0.5, 9) : 1;
  const lidA = t < 4 ? 0
    : t < 6.8 ? 1.95 * spring(t - 4.0, 1.3, 6)
    : 1.95 * (1 - E.inQuad(prog(t, 6.8, 7.0)));
  const codeA = clamp(prog(t, 2.0, 2.35) - prog(t, 3.9, 4.3));
  const seam = t < 1 ? 1 - 0.45 * prog(t, 0.4, 1.0)
    : t < 2 ? 0.55 + 0.45 * kick(t - 1.5, 4)
    : t < 4 ? 0.6 + 0.4 * kick((t - 2) % 0.5, 6) + 0.6 * prog(t, 3.5, 4.0)
    : t < 7 ? 1.2 : 0.75 + 0.6 * kick(t - 7.0, 3) + 0.12 * Math.sin(t * 3);
  const light = t < 4 ? 0 : t < 7 ? 0.6 + 0.6 * kick(t - 4, 3) : 0;
  const slot = 0.35 + 0.65 * kick(t - 1.5, 3) * (t >= 1.5 ? 1 : 0) + (t > 2 && t < 4 ? 0.3 : 0) + (t > 7.6 ? 0.25 : 0);
  // logo pozunda hafif süzülme
  const floatY = t > 7.75 ? Math.sin((t - 7.75) * 2.4) * 5 : 0;

  // telefon
  const rise = E.outBack(prog(t, 4.12, 4.9));
  const launch = E.inQuart(prog(t, 6.62, 6.98));
  const phoneY = lerp(POSE_B.y + 420, 1080, rise) - launch * 1900;
  const phoneOn = t > 4.1 && t < 7.0;

  const inside = (g, cam, rimP) => {
    if (light > 0) {                       // ışık hüzmesi
      const top = Math.min(...rimP.map(p => p[1]));
      const xs = rimP.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
      const midY = (Math.min(...rimP.map(p => p[1])) + Math.max(...rimP.map(p => p[1]))) / 2;
      g.save(); g.globalCompositeOperation = 'lighter';
      const bg = g.createLinearGradient(0, midY, 0, -200);
      bg.addColorStop(0, `rgba(255,150,70,${0.45 * light})`); bg.addColorStop(0.5, `rgba(255,110,30,${0.12 * light})`); bg.addColorStop(1, 'rgba(255,106,19,0)');
      g.fillStyle = bg;
      g.beginPath(); g.moveTo(x0 + 30, midY); g.lineTo(x1 - 30, midY); g.lineTo(x1 + 260, -200); g.lineTo(x0 - 260, -200); g.closePath(); g.fill();
      glow(g, SPR.white, (x0 + x1) / 2, top, 320, 0.25 * light);
      g.restore();
    }
    if (phoneOn) {
      const tilt = (1 - rise) * -0.08 + Math.sin(t * 1.6) * 0.012;
      drawPhone(g, 540, phoneY + (t > 4.9 ? Math.sin((t - 4.9) * 2.2) * 6 : 0), 1, tilt, t, prog(t, 5.9, 6.5) * 1.6 - 0.3);
    }
  };

  // logo pozunda ışıltı halesi
  if (t > 7) glow(g, SPR.orange, pose.x, pose.y + floatY, 420, 0.18 * prog(t, 7.2, 7.8));

  drawBox(g, {
    x: pose.x, y: pose.y + floatY, s: pose.s * breathe, yaw: pose.yaw, pitch: pose.pitch,
    sy: born * squash, lid: lidA, code: codeA, scroll: (t - 2) * 150 + 260 * E.inQuad(prog(t, 3.3, 4.0)),
    seam: seam * clamp(t / 0.05), slot: t < 0.6 ? prog(t, 0.3, 0.6) * 0.35 : slot, light,
    inside,
  });

  // açılış: ek yeri çizgisi (kutu henüz yassıyken onun dış hattı gibi görünür)
  if (t < 0.6) {
    const w = 640 * E.outExpo(prog(t, 0, 0.32)), y = pose.y;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 1 - prog(t, 0.3, 0.6);
    g.fillStyle = C.orangeXL; g.fillRect(540 - w / 2, y - 1.5, w, 3);
    g.fillStyle = C.orange; g.globalAlpha *= 0.4; g.fillRect(540 - w / 2, y - 6, w, 12);
    glow(g, SPR.orange, 540, y, 260 * (w / 640), 0.8);
    g.restore();
  }

  // ampul (0.8–1.5): belirir, süzülür, yarığa düşer
  if (t > 0.8 && t < 1.52) {
    const slotP = makeCam({ ...pose, sy: 1 }).P([0, 1, 0]);
    const fall = E.inCubic(prog(t, 1.18, 1.5));
    const y = lerp(640 + Math.sin(t * 6) * 6, slotP[1] - 10, fall);
    const sc = spring(t - 0.8, 1.8, 7) * lerp(1, 0.35, E.inQuad(fall));
    bulb(g, 540, y, sc, Math.sin(t * 5) * 0.08 * (1 - fall), 1 - prog(t, 1.44, 1.5));
  }
  // yarık parlaması
  if (t > 1.48 && t < 2.2) {
    const sp = makeCam({ ...pose, sy: 1 }).P([0, 1, 0]);
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, SPR.orange, sp[0], sp[1], 380, kick(t - 1.5, 4));
    glow(g, SPR.white, sp[0], sp[1], 140, kick(t - 1.5, 6));
    g.restore();
  }

  // sembol kıvılcımları
  if (t > 2 && t < 4.6) {
    const sp = makeCam({ ...pose, sy: 1 }).P([0, 1, 0]);
    g.save();
    for (const s of SPARKS) {
      const dt = t - s.t0;
      if (dt <= 0 || dt > s.life) continue;
      const x = sp[0] + s.vx * dt, y = sp[1] + s.vy * dt + 900 * dt * dt;
      const al = clamp(dt / 0.06) * (1 - E.inQuad(dt / s.life));
      g.save(); g.translate(x, y); g.rotate(s.rot * dt * 2); g.globalAlpha = al;
      text(g, s.g, 0, 0, { f: 'Mono', w: 700, s: s.s * (0.6 + 0.4 * clamp(dt / 0.15)), b: 'middle', c: s.col });
      g.restore();
    }
    g.restore();
  }

  // patlama parlaması
  if (flash > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, SPR.white, 540, POSE_B.y - 120, 900, flash * 0.55);
    glow(g, SPR.orange, 540, POSE_B.y - 120, 1300, flash * 0.6);
    g.restore();
  }

  /* ── yazılar ── */
  const HEAD = { s: 132, w: 900, c: C.white, ls: -2 };
  const HY = 400;
  slotText(g, 'Fikir girer,', 540, HY, HEAD, prog(t, 0.45, 1.0), prog(t, 1.9, 2.15));
  slotText(g, 'kod olur,', 540, HY, { ...HEAD, c: C.orange }, prog(t, 2.05, 2.55), prog(t, 3.85, 4.05));
  slotText(g, 'ürün çıkar.', 540, HY, HEAD, prog(t, 4.0, 4.5), prog(t, 6.6, 6.85));

  // Yakınla künyesi ve platform rozetleri
  {
    const p = E.outCubic(prog(t, 4.55, 4.95)), q = prog(t, 6.55, 6.8);
    if (p > 0 && q < 1) {
      g.save(); g.globalAlpha = p * (1 - q);
      const o = { f: 'Txt', w: 600, s: 36 };
      const lab = "Yakınla · Afşin'in online marketi";
      const w = measure(g, lab, o) + 60;
      g.translate(0, (1 - p) * 20 - q * 20);
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.roundRect(540 - w / 2, 478, w, 64, 32); g.fill();
      text(g, lab, 540, 522, { ...o, c: 'rgba(244,245,247,0.86)' });
      g.restore();
    }
    const cq = prog(t, 6.5, 6.75);
    chip(g, 205, 870, 'iOS', t - 4.95, cq, t, 0);
    chip(g, 875, 1000, 'Android', t - 5.12, cq, t, 2);
    chip(g, 215, 1170, 'Web', t - 5.29, cq, t, 4);
  }

  // kapanış: logo yazısı
  if (t > 7.3) {
    const WM = { s: 172, w: 900, c: C.white, ls: -4 }, WY = 990;
    const p = prog(t, 7.38, 7.95);
    g.save();
    g.beginPath(); g.rect(0, WY - WM.s, W, WM.s * 1.32); g.clip();
    letters(g, 'karakutu', 540, WY, WM, (i, n) => {
      const pi = E.outExpo(clamp(p * 1.6 - i * 0.075));
      return { dy: (1 - pi) * WM.s * 1.1 };
    });
    // parlama
    const gl = prog(t, 8.85, 9.45);
    if (gl > 0 && gl < 1) {
      g.globalCompositeOperation = 'source-atop';
      const gx = lerp(150, 930, gl);
      const gg = g.createLinearGradient(gx - 110, 0, gx + 110, 0);
      gg.addColorStop(0, 'rgba(255,190,140,0)'); gg.addColorStop(0.5, 'rgba(255,190,140,0.9)'); gg.addColorStop(1, 'rgba(255,190,140,0)');
      g.fillStyle = gg; g.fillRect(gx - 110, WY - 200, 220, 260);
    }
    g.restore();
    slotText(g, 'YAZILIM', 540, 1072, { f: 'Txt', w: 700, s: 46, ls: 30, c: C.orange }, prog(t, 7.62, 8.1), 0, 0.06);
    // slogan
    const tp = E.outCubic(prog(t, 8.0, 8.45));
    if (tp > 0) {
      g.save(); g.globalAlpha = tp; g.translate(0, (1 - tp) * 24);
      text(g, 'Fikir girer, ürün çıkar.', 540, 1250, { f: 'Txt', w: 600, s: 54, c: 'rgba(244,245,247,0.92)' });
      g.restore();
    }
    // adres ve konum
    const up = spring(t - 8.35, 1.8, 7);
    if (up > 0.001) {
      const o = { f: 'Mono', w: 700, s: 40 };
      const lab = 'karakutuyazilim.com';
      const w = measure(g, lab, o) + 120, h = 92;
      g.save(); g.translate(540, 1460); g.scale(up, up); g.globalAlpha = clamp((t - 8.35) * 6);
      g.fillStyle = 'rgba(255,106,19,0.10)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
      g.strokeStyle = 'rgba(255,106,19,0.75)'; g.lineWidth = 2.5; g.stroke();
      text(g, '>', -w / 2 + 44, 14, { ...o, c: C.orange });
      text(g, lab, 22, 14, { ...o, c: C.white });
      g.restore();
    }
    const lp = E.outCubic(prog(t, 8.6, 9.0));
    if (lp > 0) {
      g.save(); g.globalAlpha = lp * 0.9;
      text(g, 'AFŞİN · KAHRAMANMARAŞ', 540, 1590 + (1 - lp) * 16, { f: 'Txt', w: 600, s: 28, ls: 9, c: C.grey });
      g.restore();
    }
  }

  g.restore();

  // vinyet
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
}

/* ───────────────────────── ses ipuçları ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // açılış
  cue(0.0, 'zip', { dur: 0.32, gain: 0.35 });
  cue(0.02, 'blip', { pitch: 0.55, gain: 0.35 });
  cue(0.3, 'thump', { gain: 0.7 });
  cue(0.3, 'whoosh', { dur: 0.45, f0: 250, f1: 2600, gain: 0.35 });
  cue(0.48, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.22 });
  // ampul
  cue(0.8, 'pop', { pitch: 1.4, gain: 0.45 });
  cue(0.82, 'shine', { dur: 0.35, gain: 0.3 });
  cue(1.18, 'whoosh', { dur: 0.32, f0: 4200, f1: 500, gain: 0.35 });
  cue(1.5, 'thud', { gain: 0.8 });
  cue(1.5, 'click', { gain: 0.5 });
  cue(1.52, 'shimmer', { dur: 0.5, gain: 0.3 });
  // kodlama
  cue(1.92, 'whoosh', { dur: 0.3, f0: 600, f1: 4000, gain: 0.3 });
  for (const k of KEYS) cue(k.t, 'key', { pitch: k.p, pan: k.pan, gain: 0.32 });
  SPARKS.filter((_, i) => i % 4 === 0).forEach((s, i) => cue(s.t0, 'blip', { pitch: 0.9 + (i % 5) * 0.18, gain: 0.08, pan: Math.sign(s.vx) * 0.5 }));
  cue(3.5, 'reverse', { dur: 0.5, gain: 0.55 });
  // patlama ve telefon
  cue(4.0, 'impact', { gain: 1.0, big: true });
  cue(4.02, 'shimmer', { dur: 0.8, gain: 0.4 });
  cue(4.12, 'whoosh', { dur: 0.5, f0: 300, f1: 6000, gain: 0.5 });
  cue(4.6, 'tick', { pitch: 1.1, gain: 0.25 });
  cue(4.95, 'pop', { pitch: 1.2, gain: 0.45, pan: -0.5 });
  cue(5.12, 'pop', { pitch: 1.35, gain: 0.45, pan: 0.5 });
  cue(5.29, 'pop', { pitch: 1.5, gain: 0.45, pan: -0.5 });
  cue(5.95, 'shine', { dur: 0.45, gain: 0.25 });
  // fırlatma, kapak, logo
  cue(6.55, 'whoosh', { dur: 0.45, f0: 400, f1: 8000, gain: 0.6 });
  cue(7.0, 'slam', { gain: 0.95 });
  cue(7.0, 'impact', { gain: 0.6 });
  cue(7.08, 'whoosh', { dur: 0.4, f0: 2500, f1: 300, gain: 0.3 });
  cue(7.4, 'sparkle', { dur: 0.9, gain: 0.35 });
  cue(8.0, 'whoosh', { dur: 0.3, f0: 1000, f1: 3500, gain: 0.18 });
  cue(8.35, 'pop', { pitch: 1.1, gain: 0.35 });
  cue(8.85, 'shine', { dur: 0.5, gain: 0.28 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.orange = makeGlow('255,106,19');
  const d = canvas(48, 48), dx = d.getContext('2d'); dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(24, 24, 2.2, 0, TAU); dx.fill();
  SPR.dots = g.createPattern(d, 'repeat');
  const v = g.createRadialGradient(540, 940, 520, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
  SPR.vig = v;
  SPR.code = makeCodeStrip();
}

// Hızlı anlarda (kutunun dönüşü, telefonun fırlaması, kutunun logoya uçuşu) alt-örnek sayısı artar,
// yoksa bulanıklık üst üste binen kopyalar gibi görünür.
const samplesAt = t => (t > 2.3 && t < 3.7) || (t > 6.6 && t < 7.5) ? 16 : SAMPLES;
function renderFrame(f) {
  const t = f / FPS, n = samplesAt(t);
  for (let s = 0; s < n; s++) {
    const ts = clamp(t + ((s + 0.5) / n - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    draw(g, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0);
}

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt', '700 40px Mono', '500 40px Mono']
    .map(f => document.fonts.load(f, 'AaŞİığüçö0123→{}')));
  SPR.yakinla = await loadImage('../yakinla-showreel/assets/yakinla-logo-mark.svg');
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
