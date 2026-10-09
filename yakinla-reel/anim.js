'use strict';
/* Yakınla — 15 saniyelik "özellikler" reel'i (9:16, 1080×1920, 30 fps, 128 BPM)
 *
 * Görsel dil: düz renk blokları, dev dar yazı (Anton), monospace veri etiketleri
 * (JetBrains Mono), geometrik hareket. Degrade, parıltı, illüstrasyon yok.
 *
 * Her kare zamanın saf bir fonksiyonudur: draw(g, t). Rastgelelik yalnızca
 * tohumlu (seeded) ve başlangıçta üretilir, yani aynı t her zaman aynı kareyi verir.
 * renderFrame(f) bir kareyi SAMPLES alt-örnekle (180° obtüratör) çizip ortalar:
 * gerçek hareket bulanıklığı.
 *
 * 128 BPM'de 1 vuruş 0.46875 sn, 1 ölçü 1.875 sn; 8 ölçü tam 15 sn eder.
 * Her kesme bir vuruşa, her sahne bir ölçü başına oturur:
 *   ölçü 1      0.00  Kanca         MARKETE Mİ ÇIKIYORSUN? → DUR. → YAKINLA GETİRSİN.
 *   ölçü 2      1.88  01 Sipariş    DOKUN. EKLE. ONAYLA. + fiş ve "ONAYLANDI" damgası
 *   ölçü 3      3.75  02 Teslimat   ORTALAMA 60 DAKİKADA KAPINDA. + 0–60 dk cetveli
 *   ölçü 4      5.63  03 Yerel depo AFŞİN'in İ noktası konum olur, artı işareti
 *   ölçü 5      7.50  04 Canlı takip KURYENİ CANLI TAKİP ET. + DEPO → YOLDA → KAPINDA
 *   ölçü 6      9.38  05 3D Secure  /  10.31  06 09:00–23:00 (bölünmüş ekran)
 *   ölçü 7–8   11.25  Kapanış       ekran logoya çöker, Yakınla, mağazalar, @yakinla_com
 */

const W = 1080, H = 1920, FPS = 30, DUR = 15;
const FRAMES = FPS * DUR;
const SAMPLES = 6, SHUTTER = 0.5;
const TAU = Math.PI * 2;
const BPM = 128, B = 60 / BPM, BAR = 4 * B;
const T = { s1: BAR, s2: 2 * BAR, s3: 3 * BAR, s4: 4 * BAR, s5: 5 * BAR, s6: 5 * BAR + 2 * B, end: 6 * BAR };

const C = {
  blue: '#1F73F0', blueD: '#0E5FE0', blueXL: '#9CC2FF',
  ink: '#0A1426', paper: '#F4F6FA', amber: '#FFB547', red: '#FF4D5E', white: '#FFFFFF', mute: '#7C8AA3',
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
  inOutQuart: x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
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

const SPR = {};
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const PATHS = {
  pin: new Path2D('M 512 104 C 340 104, 202 242, 202 414 C 202 540, 270 638, 360 712 C 430 770, 480 830, 504 900 C 508 914, 516 914, 520 900 C 544 830, 594 770, 664 712 C 754 638, 822 540, 822 414 C 822 242, 684 104, 512 104 Z'),
};

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

/* ───────────────────────── tipografi ───────────────────────── */
const AN = { f: 'Anton', w: 400 };          // dev başlıklar
const MO = { f: 'Mono', w: 800 };           // etiketler ve veri
const ML = { f: 'Mono', w: 500 };
const CAP = { Anton: 0.73, Mono: 0.73 };    // başlangıçta ölçülür (fontMetrics)
const X0 = 72, X1 = 1008, TW = X1 - X0;     // kenar boşlukları
const capOf = o => (CAP[o.f] || 0.73) * o.s;
// Yazıyı genişliğe oturt (en fazla max punto)
function fitW(g, s, base, width = TW, max = 1e9) {
  const w = measure(g, s, { ...base, s: 100 });
  return { ...base, s: Math.min(max, 100 * width / w) };
}
// Maskeli şeritten harf harf yükselen yazı. p: 0→1 giriş, q: 0→1 yukarı çıkış
function slot(g, s, x, y, o, p, q = 0, st = 0.03) {
  if (p <= 0 || q >= 1) return;
  const up = capOf(o), d = up + 0.32 * o.s;
  g.save(); g.beginPath(); g.rect(-300, y - up - 0.24 * o.s, W + 600, up + 0.5 * o.s); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * st) - i * st));
    const qi = E.inCubic(clamp(q * (1 + n * st * 0.5) - i * st * 0.5));
    return { dy: (1 - pi) * d - qi * d, c: o.col ? o.col(i) : undefined };
  });
  g.restore();
}
// Daktilo: harfler tek tek, arkasında yanıp sönen blok imleç
function typeOn(g, s, x, y, o, lt, dur = 0.22, cursorFor = 0.45) {
  if (lt < 0) return;
  const k = Math.ceil(s.length * clamp(lt / dur));
  const part = s.slice(0, k);
  text(g, part, x, y, { ...o, a: 'left' });
  if (lt < dur + cursorFor && Math.floor(lt / 0.11) % 2 === 0) {
    const cw = measure(g, part, o);
    g.fillStyle = o.c; g.fillRect(x + cw + 4, y - capOf(o) * 1.05, o.s * 0.55, capOf(o) * 1.25);
  }
}
function label(g, x, y, n, name, lt, col) {
  typeOn(g, `${n} / ${name}`, x, y, { ...MO, s: 30, ls: 3, c: col }, lt, 0.24);
}
// Kesmeyle gelen yazı: büyükten iner, sonra yay gibi titrer
function pop(lt, d = 0.09, from = 1.6) {
  if (lt < 0) return null;
  const p = prog(lt, 0, d);
  const sc = lerp(from, 1, E.outCubic(p)) + (lt > d ? 0.06 * Math.exp(-(lt - d) * 12) * Math.cos((lt - d) * 40) : 0);
  return { sc, al: clamp(p * 3) };
}
// Düz zemin + güvenli alan köşelerinde ince artı işaretleri
function bg(g, col, mark) {
  g.fillStyle = col; g.fillRect(-300, -300, W + 600, H + 600);
  if (!mark) return;
  g.strokeStyle = mark; g.lineWidth = 3;
  for (const [x, y] of [[X0, 150], [X1, 150], [X0, 1650], [X1, 1650]]) {
    g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.moveTo(x, y - 16); g.lineTo(x, y + 16); g.stroke();
  }
}
const MARK_D = 'rgba(255,255,255,0.32)', MARK_L = 'rgba(10,20,38,0.25)';
function ring(g, x, y, dt, r0, col, dur = 0.5, grow = 320, lw = 5) {
  if (dt < 0 || dt > dur) return;
  g.strokeStyle = `rgba(${col},${0.7 * (1 - dt / dur)})`; g.lineWidth = lw;
  g.beginPath(); g.arc(x, y, r0 + E.outCubic(dt / dur) * grow, 0, TAU); g.stroke();
}
function checkMark(g, x, y, s, p, col, lw = 11) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.setLineDash([75 * p, 200]);
  g.beginPath(); g.moveTo(-24, 2); g.lineTo(-7, 19); g.lineTo(25, -15); g.stroke();
  g.setLineDash([]);
  g.restore();
}
function arrow(g, x, y, s, col, lw) {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.moveTo(s * 0.35, -s * 0.62); g.lineTo(s, 0); g.lineTo(s * 0.35, s * 0.62); g.stroke();
  g.restore();
}
// Her satırı genişliğe oturan blok; maxH'yi aşarsa hepsi orantılı küçülür. cy: dikey merkez
function stack(g, lines, cy, gap, maxH = 1e9, width = TW) {
  let os = lines.map(s => fitW(g, s, AN, width));
  const caps = os.reduce((a, o) => a + capOf(o), 0), room = maxH - gap * (lines.length - 1);
  if (caps > room) os = os.map(o => ({ ...o, s: o.s * room / caps }));
  const total = os.reduce((a, o) => a + capOf(o), 0) + gap * (lines.length - 1);
  let y = cy - total / 2;
  return os.map(o => { y += capOf(o); const r = { o, y }; y += gap; return r; });
}

/* ───────────────────────── KANCA (0 – 1.875) ───────────────────────── */
function sceneHook(g, t) {
  if (t < 2 * B) { // MARKETE Mİ ÇIKIYORSUN?
    bg(g, C.ink, MARK_D);
    const z = 1 + t * 0.06;
    g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
    const [a, b] = stack(g, ['MARKETE', 'Mİ ÇIKIYORSUN?'], 940, 34);
    slot(g, 'MARKETE', X0, a.y, { ...a.o, a: 'left', c: '#fff' }, prog(t, -0.12, 0.2), 0, 0.03);
    slot(g, 'Mİ ÇIKIYORSUN?', X0, b.y, { ...b.o, a: 'left', c: C.amber }, prog(t, B - 0.04, B + 0.26), 0, 0.02);
    g.restore();
    return;
  }
  if (t < 3 * B) { // DUR.
    const lt = t - 2 * B;
    bg(g, C.amber, MARK_L);
    const o = fitW(g, 'DUR.', AN, 960), s = pop(lt, 0.07, 1.8), sy = 1.7;
    const j = 9 * Math.exp(-lt * 5) * Math.sin(lt * 95);
    g.save(); g.translate(540 + j, 960); g.scale(s.sc, s.sc * sy); g.globalAlpha = s.al;
    text(g, 'DUR.', 0, capOf(o) / 2, { ...o, c: C.ink });
    g.restore();
    return;
  }
  // YAKINLA GETİRSİN.
  const lt = t - 3 * B;
  bg(g, C.blue, MARK_D);
  const z = 1 + lt * 0.08;
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  const [a, b] = stack(g, ['YAKINLA', 'GETİRSİN.'], 950, 30);
  slot(g, 'YAKINLA', X0, a.y, { ...a.o, a: 'left', c: '#fff' }, prog(lt, -0.02, 0.24), 0, 0.03);
  slot(g, 'GETİRSİN.', X0, b.y, { ...b.o, a: 'left', c: C.ink }, prog(lt, B / 2 - 0.02, B / 2 + 0.24), 0, 0.03);
  g.restore();
}

/* ───────────────────────── 01 SİPARİŞ (1.875 – 3.75) ───────────────────────── */
const S1 = {
  taps: [0.5 * B, B, 1.5 * B], rows: ['SÜT', 'EKMEK', 'ÇAY'],
  words: [['DOKUN.', 0], ['EKLE.', B], ['ONAYLA.', 2 * B]],
  total: 2 * B, stamp: 2.5 * B, ry: 880, rh: 112,
};
const rowY = i => S1.ry + 150 + i * S1.rh;
function scene1(g, t) {
  const lt = t - T.s1;
  bg(g, C.paper, MARK_L);
  label(g, X0, 300, '01', 'SİPARİŞ', lt, C.ink);
  // dev kelime: her vuruşta bir sonrakine geçer
  S1.words.forEach(([s, tw], i) => {
    const next = S1.words[i + 1];
    const o = fitW(g, s, AN, TW, 330);
    slot(g, s, X0, 770, { ...o, a: 'left', c: i === 2 ? C.blue : C.ink }, prog(lt, tw - 0.02, tw + 0.2),
      next ? prog(lt, next[1] - 0.1, next[1] + 0.02) : 0, 0.025);
  });
  // fiş
  const rl = E.outExpo(prog(lt, 0.04, 0.4));
  g.fillStyle = C.ink; g.fillRect(X0, S1.ry, TW * rl, 5);
  if (lt > 0.1) {
    const a = clamp((lt - 0.1) / 0.15);
    text(g, 'SEPET', X0, S1.ry + 60, { ...ML, s: 30, ls: 4, a: 'left', c: `rgba(124,138,163,${a})` });
    text(g, 'ADET', X1, S1.ry + 60, { ...ML, s: 30, ls: 4, a: 'right', c: `rgba(124,138,163,${a})` });
  }
  S1.taps.forEach((tp, i) => {
    const p = prog(lt, tp - 0.02, tp + 0.16); if (p <= 0) return;
    const y = rowY(i), e = E.outExpo(p);
    const fl = lt >= tp ? Math.exp(-(lt - tp) * 6) : 0;
    if (fl > 0.02) { g.fillStyle = `rgba(31,115,240,${fl})`; g.fillRect(X0 - 14, y - 68, (TW + 28) * e, 94); }
    const col = fl > 0.4 ? '#fff' : C.ink;
    g.save(); g.globalAlpha = clamp(p * 3); g.translate(-(1 - e) * 60, 0);
    text(g, `0${i + 1}`, X0, y, { ...ML, s: 34, a: 'left', c: fl > 0.4 ? '#fff' : C.mute });
    const no = { ...MO, s: 56 }, nw = measure(g, S1.rows[i], no);
    text(g, S1.rows[i], X0 + 84, y, { ...no, a: 'left', c: col });
    g.fillStyle = fl > 0.4 ? 'rgba(255,255,255,0.7)' : 'rgba(10,20,38,0.3)';
    for (let x = X0 + 112 + nw; x < X1 - 120; x += 24) { g.beginPath(); g.arc(x, y - 16, 4, 0, TAU); g.fill(); }
    text(g, '+1', X1, y, { ...no, a: 'right', c: fl > 0.4 ? '#fff' : C.blue });
    g.restore();
  });
  // toplam
  const tp = prog(lt, S1.total - 0.02, S1.total + 0.2);
  if (tp > 0) {
    const y = rowY(3) + 6;
    g.fillStyle = C.ink;
    for (let x = X0; x < X0 + TW * E.outExpo(tp); x += 26) g.fillRect(x, y - 78, 14, 4);
    g.save(); g.globalAlpha = clamp(tp * 3);
    text(g, 'TOPLAM', X0, y, { ...MO, s: 56, a: 'left', c: C.ink });
    text(g, '3 ÜRÜN', X1, y, { ...MO, s: 56, a: 'right', c: C.ink });
    g.restore();
  }
  // ONAYLANDI damgası
  const sp = prog(lt, S1.stamp - 0.07, S1.stamp);
  if (sp > 0) {
    const d = lt - S1.stamp;
    const sc = lerp(2.6, 1, E.inQuad(sp)) + (d > 0 ? 0.05 * Math.exp(-d * 14) * Math.cos(d * 45) : 0);
    const o = { ...AN, s: 128, ls: 3 }, tw = measure(g, 'ONAYLANDI', o), w = tw + 230;
    g.save(); g.translate(600, 1170); g.rotate(-0.13); g.scale(sc, sc); g.globalAlpha = clamp(sp * 2.5);
    g.fillStyle = 'rgba(244,246,250,0.92)'; g.beginPath(); g.roundRect(-w / 2, -100, w, 200, 26); g.fill();
    g.strokeStyle = C.blue; g.lineWidth = 12; g.stroke();
    g.lineWidth = 4; g.beginPath(); g.roundRect(-w / 2 + 16, -84, w - 32, 168, 16); g.stroke();
    text(g, 'ONAYLANDI', -w / 2 + 50, capOf(o) / 2, { ...o, a: 'left', c: C.blue });
    checkMark(g, w / 2 - 92, 0, 1.9, E.outCubic(prog(lt, S1.stamp + 0.04, S1.stamp + 0.2)), C.blue, 13);
    g.restore();
  }
}

/* ───────────────────────── 02 TESLİMAT (3.75 – 5.625) ───────────────────────── */
// Kayan haneli sayaç. v sürekli (0..60): birler hanesi gerçekten döner
function counter(g, x0, base, o, v) {
  setFont(g, o); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = o.c;
  const cell = g.measureText('0').width, cap = capOf(o), lh = cap * 1.3;
  g.save(); g.beginPath(); g.rect(x0 - 40, base - cap - 0.1 * o.s, cell * 2 + 80, cap + 0.2 * o.s); g.clip();
  [v / 10, v].forEach((dv, k) => {
    const base0 = Math.floor(dv + 1e-6);
    for (let j = 0; j <= 1; j++) {
      const n = base0 + j;
      g.fillText(String(((n % 10) + 10) % 10), x0 + cell * (k + 0.5), base + (n - dv) * lh);
    }
  });
  g.restore();
  g.letterSpacing = '0px';
  return cell * 2;
}
function scene2(g, t) {
  const lt = t - T.s2;
  bg(g, C.blue, MARK_D);
  label(g, X0, 300, '02', 'TESLİMAT', lt, '#fff');
  typeOn(g, 'ORTALAMA', X0, 440, { ...MO, s: 52, ls: 10, c: C.amber }, lt - 0.02, 0.18, 0.25);
  // 60
  const cnt = 1.5 * B, v = 60 * E.outQuart(prog(lt, 0, cnt));
  if (lt >= 0) {
    const o = fitW(g, '60', AN, TW, 1000);
    const big = { ...o, s: Math.min(o.s, 640 / CAP.Anton), c: '#fff' };
    const s = pop(lt, 0.1, 1.25), d = lt - cnt;
    const land = d > 0 ? 0.07 * Math.exp(-d * 10) * Math.cos(d * 36) : 0;
    const base = 1150;
    g.save(); g.globalAlpha = s.al; g.translate(X0, base); g.scale(s.sc + land, s.sc + land); g.translate(-X0, -base);
    const w = counter(g, X0, base, big, v);
    g.restore();
    // DK etiketi: sayının sağına dik
    const dp = E.outExpo(prog(lt, cnt, cnt + 0.25));
    if (dp > 0 && X0 + w + 40 < X1) {
      g.save(); g.globalAlpha = dp; g.translate(X1, base - (1 - dp) * 40);
      text(g, 'DK', 0, 0, { ...AN, s: 150, a: 'right', c: C.amber });
      g.restore();
    }
  }
  // 0–60 dk cetveli
  const ry = 1250, rp = E.outExpo(prog(lt, 0.04, 0.4));
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(X0, ry - 3, TW * rp, 6);
  for (let k = 0; k <= 12; k++) {
    const x = X0 + TW * k / 12; if (x > X0 + TW * rp + 1) break;
    const big = k % 3 === 0;
    g.fillStyle = big ? '#fff' : 'rgba(255,255,255,0.5)'; g.fillRect(x - 2, ry - (big ? 22 : 12), 4, big ? 44 : 24);
    if (big) text(g, String(k * 5), x, ry + 66, { ...ML, s: 28, a: k === 0 ? 'left' : k === 12 ? 'right' : 'center', c: 'rgba(255,255,255,0.75)' });
  }
  if (lt > 0) {
    const x = X0 + TW * v / 60;
    g.fillStyle = '#fff'; g.fillRect(X0, ry - 6, x - X0, 12);
    g.fillStyle = C.amber; g.beginPath(); g.arc(x, ry, 17, 0, TAU); g.fill();
  }
  // DAKİKADA KAPINDA.
  const o2 = fitW(g, 'DAKİKADA KAPINDA.', AN, TW);
  slot(g, 'DAKİKADA KAPINDA.', X0, 1500, { ...o2, a: 'left', col: i => (i < 9 ? '#fff' : C.ink) }, prog(lt, 2 * B - 0.03, 2 * B + 0.3), 0, 0.02);
}

/* ───────────────────────── 03 YEREL DEPO (5.625 – 7.5) ───────────────────────── */
const AFS = {};
function afLayout(g) {
  const o = fitW(g, 'AFŞIN', AN, TW);
  AFS.o = { ...o, a: 'left' };
  AFS.y = 1100;
  setFont(g, o);
  AFS.ix = X0 + g.measureText('AFŞ').width + g.measureText('I').width / 2;
  g.letterSpacing = '0px';
  AFS.r = o.s * 0.072;
  AFS.dotY = AFS.y - capOf(o) - AFS.r - o.s * 0.05;
}
function scene3(g, t) {
  const lt = t - T.s3, land = B;
  bg(g, C.ink, MARK_D);
  label(g, X0, 300, '03', 'YEREL DEPO', lt, '#fff');
  // artı işareti (nişangâh) noktadan yayılır
  const cp = E.outExpo(prog(lt, land, land + 0.45));
  if (cp > 0) {
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.fillRect(AFS.ix - 1200 * cp, AFS.dotY - 1.5, 2400 * cp, 3);
    g.fillRect(AFS.ix - 1.5, AFS.dotY - 900 * cp, 3, 900 * cp);
    g.strokeStyle = 'rgba(255,181,71,0.8)'; g.lineWidth = 3;
    g.beginPath(); g.arc(AFS.ix, AFS.dotY, AFS.r + 26 + 8 * Math.sin(lt * 9), 0, TAU * cp); g.stroke();
  }
  // AFŞIN harf harf çakılır
  letters(g, 'AFŞIN', X0, AFS.y, { ...AFS.o, c: '#fff' }, i => {
    const t0 = i * 0.045, p = prog(lt, t0, t0 + 0.09);
    if (p <= 0) return { al: 0 };
    const d = lt - t0 - 0.09;
    return { sc: lerp(1.7, 1, E.outCubic(p)) + (d > 0 ? 0.06 * Math.exp(-d * 12) * Math.cos(d * 40) : 0), al: clamp(p * 3) };
  });
  // İ'nin noktası düşer: konum
  const pd = prog(lt, land - 0.26, land);
  if (pd > 0) {
    const d = lt - land;
    for (let k = 0; k < 3; k++) ring(g, AFS.ix, AFS.dotY, d - k * 0.14, AFS.r, '255,181,71', 0.6, 300, 4);
    const y = lerp(-120, AFS.dotY, E.inQuad(pd));
    const sq = d > 0 ? 0.3 * Math.exp(-d * 10) * Math.cos(d * 34) : 0;
    g.fillStyle = C.amber; g.beginPath(); g.ellipse(AFS.ix, y + AFS.r * sq, AFS.r * (1 + sq), AFS.r * (1 - sq), 0, 0, TAU); g.fill();
  }
  // koordinat
  if (lt > land + 0.08) {
    const co = { ...MO, s: 28, ls: 2, c: C.amber }, s = '38.2°K  36.9°D', w = measure(g, s, co);
    const x = AFS.ix + AFS.r + 60 + w < X1 ? AFS.ix + AFS.r + 60 : AFS.ix - AFS.r - 60 - w;
    typeOn(g, s, x, AFS.dotY - 44, co, lt - land - 0.08, 0.2, 0.3);
  }
  const o2 = fitW(g, "'DEKİ DEPOMUZDAN.", AN, TW);
  slot(g, "'DEKİ DEPOMUZDAN.", X0, AFS.y + 40 + capOf(o2), { ...o2, a: 'left', c: C.amber }, prog(lt, 1.5 * B - 0.03, 1.5 * B + 0.28), 0, 0.02);
  const so = fitW(g, 'ÜRÜNLER BAŞKA ŞEHİRDEN KARGOYLA GELMEZ.', ML, TW, 32);
  typeOn(g, 'ÜRÜNLER BAŞKA ŞEHİRDEN KARGOYLA GELMEZ.', X0, AFS.y + 120 + capOf(o2), { ...so, c: C.blueXL }, lt - 2 * B, 0.3, 0.4);
}

/* ───────────────────────── 04 CANLI TAKİP (7.5 – 9.375) ───────────────────────── */
const TR = { y: 1330, x0: X0 + 24, x1: X1 - 24, t0: 0.3, t1: 1.78, nodes: [[0, 'DEPO', 'left'], [0.5, 'YOLDA', 'center'], [1, 'KAPINDA', 'right']] };
function scene4(g, t) {
  const lt = t - T.s4;
  bg(g, C.paper, MARK_L);
  label(g, X0, 300, '04', 'CANLI TAKİP', lt, C.ink);
  // ● CANLI
  const bp = E.outBack(prog(lt, 0.05, 0.25));
  if (bp > 0) {
    const bo = { ...MO, s: 30, ls: 3 }, bw = measure(g, 'CANLI', bo) + 76;
    g.save(); g.translate(X1 - bw / 2, 290); g.scale(bp, bp);
    g.fillStyle = C.red; g.beginPath(); g.roundRect(-bw / 2, -30, bw, 60, 30); g.fill();
    const bl = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos((lt / B) * TAU));
    g.fillStyle = `rgba(255,255,255,${bl})`; g.beginPath(); g.arc(-bw / 2 + 32, 0, 9, 0, TAU); g.fill();
    text(g, 'CANLI', -bw / 2 + 54, 11, { ...bo, a: 'left', c: '#fff' });
    g.restore();
  }
  // KURYENİ / CANLI / TAKİP ET.
  const L = stack(g, ['KURYENİ', 'CANLI', 'TAKİP ET.'], 800, 30, 720);
  [[C.ink, 0], [C.blue, 0.5 * B], [C.ink, B]].forEach(([c, tw], i) => {
    const s = ['KURYENİ', 'CANLI', 'TAKİP ET.'][i];
    slot(g, s, X0, L[i].y, { ...L[i].o, a: 'left', c }, prog(lt, tw - 0.03, tw + 0.24), 0, 0.03);
  });
  // DEPO → YOLDA → KAPINDA
  const dp = E.outExpo(prog(lt, 0.05, 0.45)), v = E.inOutCubic(prog(lt, TR.t0, TR.t1));
  const X = f => lerp(TR.x0, TR.x1, f), cx = X(v);
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(10,20,38,0.14)'; g.lineWidth = 14;
  g.beginPath(); g.moveTo(TR.x0, TR.y); g.lineTo(X(dp), TR.y); g.stroke();
  if (lt > TR.t0) { g.strokeStyle = C.blue; g.beginPath(); g.moveTo(TR.x0, TR.y); g.lineTo(cx, TR.y); g.stroke(); }
  TR.nodes.forEach(([f, s, al], i) => {
    if (dp < f - 0.001) return;
    const hit = v >= f - 1e-4 && lt > TR.t0, last = i === 2;
    const at = TR.t0 + (TR.t1 - TR.t0) * (f === 0 ? 0 : f === 1 ? 1 : 0.5);
    const b = hit && lt > at ? 0.35 * Math.exp(-(lt - at) * 9) * Math.cos((lt - at) * 30) : 0;
    g.save(); g.translate(X(f), TR.y); g.scale(1 + b, 1 + b);
    g.fillStyle = hit ? (last ? C.amber : C.blue) : C.paper; g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fill();
    g.strokeStyle = hit ? (last ? C.amber : C.blue) : 'rgba(10,20,38,0.3)'; g.lineWidth = 6; g.stroke();
    g.restore();
    if (hit && last) ring(g, X(f), TR.y, lt - TR.t1, 24, '255,181,71', 0.5, 120, 5);
    text(g, s, X(f) + (al === 'left' ? -10 : al === 'right' ? 10 : 0), TR.y + 82, { ...MO, s: 30, ls: 2, a: al, c: hit ? C.ink : C.mute });
  });
  // kurye noktası
  if (lt > TR.t0 - 0.1) {
    const ap = E.outBack(prog(lt, TR.t0 - 0.1, TR.t0 + 0.1));
    for (let k = 0; k < 2; k++) {
      const ph = (((lt - TR.t0) / B + k * 0.5) % 1 + 1) % 1;
      g.strokeStyle = `rgba(31,115,240,${0.4 * (1 - ph) * ap})`; g.lineWidth = 4;
      g.beginPath(); g.arc(cx, TR.y, 34 + ph * 70, 0, TAU); g.stroke();
    }
    g.save(); g.translate(cx, TR.y); g.scale(ap, ap);
    g.fillStyle = C.blue; g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill();
    const ko = { ...MO, s: 24, ls: 2 }, kw = measure(g, 'KURYE', ko) + 32;
    g.fillStyle = C.ink; g.beginPath(); g.roundRect(-kw / 2, -98, kw, 44, 8); g.fill();
    g.beginPath(); g.moveTo(-10, -55); g.lineTo(10, -55); g.lineTo(0, -44); g.closePath(); g.fill();
    text(g, 'KURYE', 0, -67, { ...ko, c: '#fff' });
    g.restore();
  }
}

/* ───────────────────────── 05 3D SECURE + 06 SAATLER (9.375 – 11.25) ───────────────────────── */
function lockDraw(g, x, y, s, lt) {
  const p = E.outBack(prog(lt, 0, 0.2)); if (p <= 0) return;
  const shut = E.inQuad(prog(lt, 0.18, 0.3)), d = lt - 0.3;
  const bump = d > 0 ? 0.08 * Math.exp(-d * 14) * Math.cos(d * 40) : 0;
  g.save(); g.translate(x, y); g.scale(s * p * (1 + bump), s * p * (1 - bump));
  g.strokeStyle = '#fff'; g.lineWidth = 22; g.lineCap = 'butt';
  const lift = (1 - shut) * 46;
  g.beginPath(); g.moveTo(-46, -10 - lift); g.lineTo(-46, -62 - lift); g.arc(0, -62 - lift, 46, Math.PI, 0); g.lineTo(46, -10 - lift * 0.4); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-82, -24, 164, 128, 20); g.fill();
  g.fillStyle = C.blue; g.beginPath(); g.arc(0, 30, 17, 0, TAU); g.fill(); g.fillRect(-7, 34, 14, 40);
  g.restore();
}
function hoursBar(g, y, l6) {
  const gap = 6, cw = (TW - gap * 23) / 24, h = 76;
  for (let i = 0; i < 24; i++) {
    const x = X0 + i * (cw + gap), ap = prog(l6, i * 0.006, 0.08 + i * 0.006);
    if (ap <= 0) continue;
    const on = i >= 9 && i <= 22, lp = on ? E.outBack(prog(l6, 0.12 + (i - 9) * 0.022, 0.22 + (i - 9) * 0.022)) : 0;
    g.fillStyle = `rgba(255,255,255,${0.12 * ap})`; g.fillRect(x, y, cw, h);
    if (lp > 0) { g.fillStyle = C.amber; g.fillRect(x, y + h * (1 - Math.min(1, lp)), cw, h * Math.min(1.08, lp)); }
  }
  const lo = { ...ML, s: 26, c: 'rgba(255,255,255,0.7)' };
  if (l6 > 0.1) for (const [hh, s] of [[0, '00'], [9, '09'], [23, '23']]) text(g, s, X0 + hh * (cw + gap), y + h + 44, { ...lo, a: 'left' });
}
function scene56(g, t) {
  const lt = t - T.s5, l6 = t - T.s6;
  const split = E.outExpo(prog(t, T.s6 - 0.05, T.s6 + 0.22));
  const topH = lerp(H, 960, split);
  // 05: üst panel (mavi)
  g.save(); g.beginPath(); g.rect(-300, -300, W + 600, topH + 300); g.clip();
  bg(g, C.blue, split < 0.5 ? MARK_D : null);
  label(g, X0, 300, '05', 'GÜVENLİ ÖDEME', lt, '#fff');
  g.translate(0, lerp(250, 0, split));
  lockDraw(g, X0 + 82, 520, 0.95, lt);
  const o = fitW(g, '3D SECURE', AN, TW);
  slot(g, '3D SECURE', X0, 640 + capOf(o), { ...o, a: 'left', c: '#fff' }, prog(lt, 0.5 * B - 0.03, 0.5 * B + 0.26), 0, 0.03);
  typeOn(g, 'İLE GÜVENLİ ÖDEME', X0, 640 + capOf(o) + 80, { ...MO, s: 40, ls: 4, c: C.amber }, lt - B, 0.2, 0.3);
  g.restore();
  // 06: alt panel (lacivert) — ölçünün 3. vuruşunda aşağıdan gelir
  if (split > 0) {
    g.save(); g.beginPath(); g.rect(-300, topH, W + 600, H - topH + 300); g.clip();
    g.translate(0, topH - 960);
    bg(g, C.ink);
    label(g, X0, 1056, '06', 'ÇALIŞMA SAATLERİ', l6, '#fff');
    hoursBar(g, 1110, l6);
    const ho = fitW(g, '09:00–23:00', AN, TW);
    slot(g, '09:00–23:00', X0, 1290 + capOf(ho), { ...ho, a: 'left', c: '#fff' }, prog(l6, 0.1, 0.4), 0, 0.025);
    typeOn(g, 'ARASI AÇIĞIZ', X0, 1290 + capOf(ho) + 80, { ...MO, s: 40, ls: 4, c: C.blueXL }, l6 - 0.3, 0.2, 0.3);
    g.restore();
  }
}

/* ───────────────────────── KAPANIŞ (11.25 – 15) ───────────────────────── */
// Mavi ekran logonun pinine çöker, logo köşeye geçer, editoryal künye dizilir
const END = { cx: 540, cy: 860, cs: 520, fx: 196, fy: 520, fs: 300 };
function sceneEnd(g, t) {
  const lt = t - T.end, fin = lt - 6 * B;
  bg(g, C.paper, MARK_L);
  // logo
  const cp = E.inOutQuart(prog(lt, 0.0, 0.42));
  const S = lerp(15, 1, cp);
  const mv = E.inOutCubic(prog(lt, 2 * B - 0.12, 2 * B + 0.24));
  const x = lerp(END.cx, END.fx, mv), y = lerp(END.cy, END.fy, mv), size = lerp(END.cs, END.fs, mv);
  const hx = x, hy = y - 98 * size / 1024;
  const fb = fin > 0 ? 0.08 * Math.exp(-fin * 9) * Math.cos(fin * 32) : 0;
  const hs = E.outBack(prog(lt, 0.28, B + 0.04));
  g.save(); g.translate(hx, hy); g.scale(S * (1 + fb), S * (1 + fb)); g.translate(-hx, -hy);
  drawLogo(g, x, y, size, {
    grow: 1, ring: E.inOutCubic(prog(lt, 0.26, 0.5)), face: E.outBack(prog(lt, 0.3, 0.5)), hands: hs,
    am: -(1 - hs) * Math.PI, ah: -(1 - hs) * Math.PI * 0.5,
    glint: lt > 2 * B && lt < 2 * B + 0.5 ? lerp(-0.3, 1.3, prog(lt, 2 * B, 2 * B + 0.45)) : fin > 0 && fin < 0.5 ? lerp(-0.3, 1.3, prog(fin, 0, 0.45)) : null,
  });
  g.restore();
  // slogan: logonun sağında
  const so = fitW(g, "AFŞİN'İN MARKETİ,", AN, X1 - 360);
  slot(g, "AFŞİN'İN MARKETİ,", 360, 500, { ...so, a: 'left', c: C.ink }, prog(lt, 2.5 * B - 0.03, 2.5 * B + 0.26), 0, 0.02);
  slot(g, 'CEBİNDE.', 360, 500 + capOf(so) + 24, { ...so, a: 'left', c: C.blue }, prog(lt, 2.75 * B - 0.03, 2.75 * B + 0.26), 0, 0.03);
  // Yakınla
  const wo = fitW(g, 'Yakınla', AN, TW);
  slot(g, 'Yakınla', X0 - wo.s * 0.02, 1020, { ...wo, a: 'left', c: C.ink }, prog(lt, 2 * B - 0.02, 2 * B + 0.34), 0, 0.04);
  // künye satırları
  const rp = E.outExpo(prog(lt, 3 * B, 3 * B + 0.4));
  g.fillStyle = C.ink; g.fillRect(X0, 1070, TW * rp, 5);
  [['İNDİR', 'APP STORE · GOOGLE PLAY', C.ink], ['TAKİP ET', '@yakinla_com', C.blue], ['WEB', 'yakinla.com', C.ink]].forEach(([k, v, c], i) => {
    const t0 = 3.25 * B + i * 0.5 * B, y = 1150 + i * 78;
    if (lt < t0) return;
    if (i > 0) { g.fillStyle = 'rgba(10,20,38,0.12)'; g.fillRect(X0, y - 54, TW * E.outExpo(prog(lt, t0, t0 + 0.3)), 2); }
    typeOn(g, k, X0, y, { ...ML, s: 28, ls: 3, c: C.mute }, lt - t0, 0.12, 0);
    const vo = { ...MO, s: 38, ls: 1 }, vw = measure(g, v, vo);
    typeOn(g, v, X1 - vw, y, { ...vo, c }, lt - t0 - 0.04, 0.22, 0.2);
  });
  // UYGULAMAYI İNDİR
  const bp = E.inOutQuart(prog(lt, 4 * B - 0.12, 4 * B + 0.08));
  if (bp > 0) {
    const by = 1420, bh = 150, fl = fin > 0 ? Math.exp(-fin * 6) : 0;
    g.save(); g.beginPath(); g.rect(X0, by - bh / 2, TW * bp, bh); g.clip();
    g.fillStyle = fl > 0.02 ? `rgb(${lerp(255, 255, fl) | 0},${lerp(181, 230, fl) | 0},${lerp(71, 190, fl) | 0})` : C.amber;
    g.fillRect(X0, by - bh / 2, TW, bh);
    const co = fitW(g, 'UYGULAMAYI İNDİR', AN, TW - 220, 96);
    text(g, 'UYGULAMAYI İNDİR', X0 + 44, by + capOf(co) / 2, { ...co, a: 'left', c: C.ink });
    const ax = X1 - 90 + 10 * Math.sin(Math.max(0, lt - 4 * B) * 12) * Math.exp(-Math.max(0, lt - 4 * B) * 2);
    arrow(g, ax, by, 34, C.ink, 12);
    g.restore();
  }
}

/* ───────────────────────── HUD: hikâye tarzı ilerleme çizgisi ───────────────────────── */
const SEGS = [T.s1, T.s2, T.s3, T.s4, T.s5, T.s6, T.end];
function hud(g, t) {
  const a = prog(t, T.s1 + 0.04, T.s1 + 0.2) * (1 - prog(t, T.end - 0.02, T.end + 0.1));
  if (a <= 0) return;
  const light = (t >= T.s1 && t < T.s2) || (t >= T.s4 && t < T.s5);
  const col = light ? '10,20,38' : '255,255,255';
  const n = 6, gap = 10, sw = (TW - gap * (n - 1)) / n, y = 214;
  for (let i = 0; i < n; i++) {
    const x = X0 + i * (sw + gap), f = prog(t, SEGS[i], SEGS[i + 1]);
    g.fillStyle = `rgba(${col},${0.22 * a})`; g.fillRect(x, y - 3, sw, 6);
    if (f > 0) { g.fillStyle = `rgba(${col},${a})`; g.fillRect(x, y - 3, sw * f, 6); }
  }
}

/* ───────────────────────── kamera ve ana çizim ───────────────────────── */
const IMPACTS = [[2 * B, 30], [T.s1, 14], [T.s1 + S1.stamp, 16], [T.s2, 10], [T.s3, 14], [T.s3 + B, 12], [T.s4, 8], [T.s5, 10], [T.s6, 8], [T.end, 18], [T.end + 6 * B, 10]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 95 + i * 1.7); y += k * Math.cos(dt * 78 + i * 2.3); z += a * 0.0014 * Math.exp(-dt * 9);
  });
  // groove boyunca her vuruşta hafif yakınlaşma
  if (t >= T.s1 && t < T.end + 6 * B + 0.3) { const lb = Math.floor(t / B + 1e-6) * B; z += 0.006 * Math.exp(-(t - lb) * 10); }
  return [x, y, z];
}
const whip = (t, t0, a = 0.13, b = 0.08) => E.inOutQuart(prog(t, t0 - a, t0 + b));
function layer(g, dx, dy, fn, t) { g.save(); g.translate(dx, dy); fn(g, t); g.restore(); }
function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(540 + sx, 960 + sy); g.scale(1 + sz, 1 + sz); g.translate(-540, -960);
  g.fillStyle = '#000'; g.fillRect(-300, -300, W + 600, H + 600);
  if (t < T.s1 + 0.08) { // kanca → 01: dikey itme
    const p = whip(t, T.s1);
    if (p < 1) layer(g, 0, -H * p, sceneHook, t);
    if (p > 0) layer(g, 0, H * (1 - p), scene1, t);
  } else if (t < T.s2) { // 01 → 02: mavi panjur şeritleri sağdan kapanır
    scene1(g, t);
    const i0 = T.s2 - 0.25;
    if (t > i0) {
      g.save(); g.beginPath();
      for (let k = 0; k < 8; k++) {
        const p = E.inOutCubic(prog(t, i0 + k * 0.018, i0 + 0.12 + k * 0.018));
        if (p > 0) g.rect(lerp(W, -300, p), k * H / 8 - 1, W + 600, H / 8 + 2);
      }
      g.clip(); scene2(g, t); g.restore();
    }
  } else if (t < T.s3 + 0.08) { // 02 → 03: yatay savurma
    const p = whip(t, T.s3);
    if (p < 1) layer(g, -W * p, 0, scene2, t);
    if (p > 0) layer(g, W * (1 - p), 0, scene3, t);
  } else if (t < T.s4) { // 03 → 04: amber nokta açılır
    scene3(g, t);
    const ip = prog(t, T.s4 - 0.24, T.s4);
    if (ip > 0) {
      const r = lerp(AFS.r, 2400, E.inCubic(ip));
      g.save(); g.beginPath(); g.arc(AFS.ix, AFS.dotY, r, 0, TAU); g.clip(); scene4(g, t); g.restore();
      g.strokeStyle = C.amber; g.lineWidth = 34 * (1 - ip) + 8; g.beginPath(); g.arc(AFS.ix, AFS.dotY, r, 0, TAU); g.stroke();
    }
  } else if (t < T.s5 + 0.08) { // 04 → 05: eğik mavi panel soldan süpürür
    scene4(g, t);
    const p = whip(t, T.s5, 0.14, 0.08);
    if (p > 0) {
      const xe = lerp(-420, W + 420, p);
      g.save(); g.beginPath(); g.moveTo(-400, -300); g.lineTo(xe + 240, -300); g.lineTo(xe - 240, H + 300); g.lineTo(-400, H + 300); g.closePath(); g.clip();
      layer(g, -(1 - p) * 260, 0, scene56, t);
      g.restore();
    }
  } else if (t < T.end - 0.03) {
    scene56(g, t);
  } else { // 05/06 → kapanış: paneller ikiye ayrılır
    sceneEnd(g, t);
    const p = E.inOutQuart(prog(t, T.end - 0.03, T.end + 0.2));
    if (p < 1) {
      g.save(); g.translate(0, -1040 * p); g.beginPath(); g.rect(-300, -300, W + 600, 1260); g.clip(); scene56(g, t); g.restore();
      g.save(); g.translate(0, 1040 * p); g.beginPath(); g.rect(-300, 960, W + 600, 1260); g.clip(); scene56(g, t); g.restore();
    }
  }
  hud(g, t);
  g.restore();
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  const px = x => +((x - 540) / 540 * 0.7).toFixed(3);
  const keys = (t0, n, dur, gain = 0.16) => { for (let i = 0; i < n; i++) cue(t0 + dur * i / n, 'key', { gain, pitch: 0.9 + ((i * 7) % 5) * 0.06 }); };
  // kanca
  cue(0.0, 'thump', { gain: 0.5 });
  cue(B - 0.04, 'whoosh', { dur: 0.22, f0: 900, f1: 4500, gain: 0.3 });
  cue(2 * B, 'slam', { gain: 1.0 });
  cue(3 * B - 0.03, 'whoosh', { dur: 0.25, f0: 500, f1: 5000, gain: 0.35 });
  cue(3.5 * B - 0.03, 'whoosh', { dur: 0.22, f0: 800, f1: 6000, gain: 0.25 });
  // 01
  cue(T.s1 - 0.14, 'whoosh', { dur: 0.24, f0: 300, f1: 7000, gain: 0.55 });
  cue(T.s1, 'impact', { gain: 0.55 });
  keys(T.s1, 7, 0.24);
  cue(T.s1 + B - 0.08, 'swish', { gain: 0.2 }); cue(T.s1 + 2 * B - 0.08, 'swish', { gain: 0.2 });
  S1.taps.forEach((tp, i) => {
    cue(T.s1 + tp, 'tap', { gain: 0.7 });
    cue(T.s1 + tp + 0.015, 'coin', { pitch: 1 + i * 0.122, gain: 0.4, pan: 0.35 });
  });
  cue(T.s1 + S1.total, 'blip', { pitch: 0.9, gain: 0.3 });
  cue(T.s1 + S1.stamp - 0.07, 'whoosh', { dur: 0.08, f0: 3000, f1: 800, gain: 0.3 });
  cue(T.s1 + S1.stamp, 'stamp', { gain: 0.95 });
  cue(T.s1 + S1.stamp + 0.06, 'success', { gain: 0.35 });
  for (let k = 0; k < 8; k++) cue(T.s2 - 0.25 + 0.12 + k * 0.018, 'tick', { pitch: 0.8 + k * 0.05, gain: 0.14, pan: 0.5 });
  cue(T.s2 - 0.26, 'whoosh', { dur: 0.26, f0: 600, f1: 7000, gain: 0.45 });
  // 02
  cue(T.s2, 'impact', { gain: 0.5 });
  keys(T.s2, 7, 0.24); keys(T.s2 + 0.02, 8, 0.18, 0.2);
  let prev = 0;
  for (let f = 0; f <= 1.5 * B * 240; f++) {
    const lt = f / 240, n = Math.floor(60 * E.outQuart(prog(lt, 0, 1.5 * B)));
    if (n !== prev && n % 2 === 0) cue(T.s2 + lt, 'tick', { pitch: 0.9 + n / 60 * 1.1, gain: 0.2 });
    prev = n;
  }
  cue(T.s2 + 0.04, 'zip', { dur: 0.36, gain: 0.22 });
  cue(T.s2 + 1.5 * B, 'thump', { gain: 0.6 }); cue(T.s2 + 1.5 * B, 'shine', { dur: 0.4, gain: 0.28 });
  cue(T.s2 + 2 * B - 0.03, 'whoosh', { dur: 0.22, f0: 1200, f1: 4500, gain: 0.22 });
  // 03
  cue(T.s3 - 0.15, 'whoosh', { dur: 0.26, f0: 6000, f1: 400, gain: 0.55 });
  cue(T.s3, 'impact', { gain: 0.5 });
  keys(T.s3, 7, 0.24);
  for (let i = 0; i < 5; i++) cue(T.s3 + i * 0.045 + 0.06, 'thump', { gain: 0.42, pan: (i - 2) * 0.16 });
  cue(T.s3 + B - 0.26, 'whoosh', { dur: 0.26, f0: 4000, f1: 500, gain: 0.35, pan: px(AFS.ix || 700) });
  cue(T.s3 + B, 'thud', { gain: 0.9 }); cue(T.s3 + B + 0.01, 'sonar', { gain: 0.45 });
  cue(T.s3 + B + 0.03, 'sweep', { dur: 0.4, gain: 0.18 });
  keys(T.s3 + B + 0.08, 9, 0.2, 0.13);
  cue(T.s3 + 1.5 * B - 0.03, 'whoosh', { dur: 0.22, f0: 1200, f1: 4500, gain: 0.2 });
  keys(T.s3 + 2 * B, 14, 0.3, 0.12);
  cue(T.s4 - 0.24, 'whoosh', { dur: 0.28, f0: 400, f1: 8000, gain: 0.5 });
  // 04
  cue(T.s4, 'impact', { gain: 0.4 });
  keys(T.s4, 7, 0.24);
  cue(T.s4 + 0.05, 'pop', { pitch: 1.3, gain: 0.35, pan: 0.6 });
  cue(T.s4 + 0.05, 'zip', { dur: 0.4, gain: 0.22 });
  const track = [];
  for (let lt = TR.t0 - 0.1; lt <= TR.t1 + 0.05; lt += 0.02) {
    const v0 = E.inOutCubic(prog(lt, TR.t0, TR.t1)), v1 = E.inOutCubic(prog(lt + 0.02, TR.t0, TR.t1));
    track.push([+(T.s4 + lt).toFixed(3), px(lerp(TR.x0, TR.x1, v0)), +clamp((v1 - v0) / 0.02 * 0.9).toFixed(3)]);
  }
  cue(T.s4 + TR.t0 - 0.1, 'motor', { gain: 0.24, track });
  cue(T.s4 + TR.t0, 'blip', { pitch: 1.2, gain: 0.3, pan: px(TR.x0) });
  cue(T.s4 + (TR.t0 + TR.t1) / 2, 'blip', { pitch: 1.5, gain: 0.3 });
  cue(T.s4 + TR.t1, 'ding', { gain: 0.4, pan: px(TR.x1) });
  // 05 / 06
  cue(T.s5 - 0.14, 'whoosh', { dur: 0.24, f0: 500, f1: 7000, gain: 0.5 });
  cue(T.s5, 'impact', { gain: 0.45 });
  keys(T.s5, 7, 0.24);
  cue(T.s5 + 0.02, 'pop', { pitch: 0.9, gain: 0.4, pan: -0.5 });
  cue(T.s5 + 0.3, 'lock', { gain: 0.7, pan: -0.5 }); cue(T.s5 + 0.32, 'shine', { dur: 0.4, gain: 0.25 });
  keys(T.s5 + B, 9, 0.2, 0.13);
  cue(T.s6 - 0.08, 'whoosh', { dur: 0.22, f0: 5000, f1: 600, gain: 0.45 });
  cue(T.s6, 'thump', { gain: 0.55 });
  keys(T.s6, 7, 0.24);
  for (let i = 9; i <= 22; i++) cue(T.s6 + 0.12 + (i - 9) * 0.022, 'tick', { pitch: 1 + (i - 9) * 0.06, gain: 0.15, pan: px(X0 + i * TW / 24) });
  cue(T.s6 + 0.44, 'ding', { gain: 0.25 });
  keys(T.s6 + 0.3, 7, 0.2, 0.13);
  // kapanış
  cue(T.end - 0.2, 'reverse', { dur: 0.22, gain: 0.45 });
  cue(T.end, 'impact', { gain: 1.0, big: true });
  cue(T.end + 0.02, 'whoosh', { dur: 0.4, f0: 4000, f1: 250, gain: 0.5 });
  cue(T.end + 0.32, 'pop', { pitch: 1.0, gain: 0.35 });
  cue(T.end + B + 0.04, 'click', { gain: 0.55 });
  cue(T.end + 2 * B - 0.12, 'whoosh', { dur: 0.34, f0: 900, f1: 3500, gain: 0.25 });
  cue(T.end + 2 * B + 0.02, 'shine', { dur: 0.45, gain: 0.28 });
  cue(T.end + 3 * B, 'zip', { dur: 0.3, gain: 0.18 });
  [0, 1, 2].forEach(i => keys(T.end + 3.25 * B + i * 0.5 * B, 8, 0.24, 0.11));
  cue(T.end + 4 * B - 0.12, 'whoosh', { dur: 0.2, f0: 600, f1: 5000, gain: 0.35 });
  cue(T.end + 4 * B + 0.08, 'thump', { gain: 0.5 });
  cue(T.end + 6 * B, 'sparkle', { dur: 0.9, gain: 0.32 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

function fontMetrics(g) {
  for (const f of ['Anton', 'Mono']) {
    g.font = `${f === 'Anton' ? 400 : 800} 100px ${f}`;
    CAP[f] = g.measureText('H').actualBoundingBoxAscent / 100;
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
function renderAt(t) { g.setTransform(1, 0, 0, 1, 0, 0); draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); }

window.READY = (async () => {
  await Promise.all(['400 100px Anton', '800 100px Mono', '700 100px Mono', '500 100px Mono'].map(f => document.fonts.load(f, 'AaŞİığüçö0123@_·–°')));
  fontMetrics(g);
  afLayout(g);
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
