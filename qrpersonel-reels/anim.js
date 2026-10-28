'use strict';
/* QR Personel — Instagram Reels, Konsept A "Vizör" (9:16, 1080×1920, 60 fps, 30 sn)
 *
 * Logonun köşe parantezleri filmin kamerasıdır: tek bir vizör çerçevesi sahneden sahneye
 * süzülür, her şeyi o "okur". Siyah-beyaz, tek vurgu rengi sinyal yeşili.
 *
 * Müzik 120 BPM: 1 vuruş 0,5 sn, 1 ölçü 2 sn, 15 ölçü = tam 30 sn.
 *   0     Kanca        "Kim geldi?" → "geç kaldı?" → "çıktı?"   parantezler çakılır
 *   3.75  Okut         QR levhası yükselir, vizör kilitlenir, tarama, bip
 *   7     Dönüşüm      QR modülleri kişi siluetine akar
 *   8     Giriş        onay, isim, "Giriş yapıldı.", saat haneleri döner
 *   11    Ekip         tek kişi 48 kişilik ızgaraya çoğalır, sayaç 41/48
 *   16    Çıkış        09:00 → 18:04 zaman atlaması, çalışma süresi halkası
 *   20    Özellikler   GİRİŞ. ÇIKIŞ. PUANTAJ. → aylık puantaj takvimi
 *   24    Marka        beyaz sayfa, vizör ikona dönüşür, kişiler zıplar, adres
 *
 * Reels güvenli alanı: kritik yazılar y 250–1480 ve x 70–940 arasında tutulur
 * (üstte başlık çubuğu, altta açıklama, sağda beğeni düğmeleri). */

const FPS = 60, DUR = 30, FRAMES = FPS * DUR, SHUTTER = 0.5;
const BEAT = 0.5, BAR = 2;
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;
const A = { bg: '#0C0C0D', fg: '#F7F7F7', grey: '#8C8C8C', dim: '#2A2B2F', acc: '#3DDC84', red: '#FF5C5C', ink: '#111111', paper: '#F5F5F4' };
const RG = Object.fromEntries(Object.entries(A).map(([k, v]) => [k, hex2rgb(v)]));

const T = {
  kim: at(0, 1), geldi: at(0, 2), q: at(0, 3), swap1: at(1, 0), swap2: at(1, 1), back: at(1, 2), out1: at(1, 2.5),
  plaque: at(1, 3.5), lock: at(2, 0.5), okut: at(2, 2), scan0: at(2, 3), scan1: at(3, 0.8), beep: at(3, 1), morph0: at(3, 2), morph1: at(4),
  check: at(4, 1), name: at(4, 1.5), giris: at(4, 2), clock: at(4, 3), toGrid: at(5, 2), grid: at(6),
  ekibin: at(7), tek: at(7, 1), out4: at(7, 3),
  cikis: at(8), lapse0: at(8, 0.5), gun: at(8, 1), lapse1: at(8, 3), ring: at(9), ringFill0: at(9, 0.4), ringFill1: at(9, 2.4), okut2: at(9, 1), out5: at(9, 3),
  w1: at(10), w2: at(10, 1), w3: at(10, 2), cal: at(11), out6: at(11, 3.2),
  logo: at(12), p1: at(12, 1), p2: at(12, 1.5), p3: at(12, 2), word: at(12, 3), tag: at(13), url: at(13, 1), cta: at(13, 3), hold: at(14),
};

/* ───────── easing, yay, harf animasyonu ───────── */
const E = {
  inQuad: x => x * x, outQuad: x => 1 - (1 - x) * (1 - x),
  inCubic: x => x * x * x, outCubic: x => 1 - Math.pow(1 - x, 3),
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outQuart: x => 1 - Math.pow(1 - x, 4), inQuart: x => x * x * x * x,
  inOutQuart: x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2, outSine: x => Math.sin(x * Math.PI / 2),
  outBack: x => { const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  outBackSoft: x => 1 + 2 * Math.pow(x - 1, 3) + Math.pow(x - 1, 2),
};
const spring = (dt, f = 2.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
const kick = (dt, d = 10) => dt < 0 ? 0 : Math.exp(-d * dt);
function letters(g, s, x, y, o, fn) {
  setFont(g, o); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const total = g.measureText(s).width, x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  for (let i = 0, n = s.length; i < n; i++) {
    if (s[i] === ' ') continue;
    const off = g.measureText(s.slice(0, i)).width, cw = g.measureText(s[i]).width, r = fn(i, n) || {};
    const al = r.al == null ? 1 : r.al; if (al <= 0.002) continue;
    g.save(); g.globalAlpha *= al; g.translate(x0 + off + cw / 2 + (r.dx || 0), y + (r.dy || 0));
    if (r.sc != null) g.scale(r.sc, r.sc);
    if (o.stroke) { g.strokeStyle = r.c || o.c; g.lineWidth = o.stroke; g.lineJoin = 'round'; g.strokeText(s[i], -cw / 2, 0); }
    else { g.fillStyle = r.c || o.c || '#fff'; g.fillText(s[i], -cw / 2, 0); }
    g.restore();
  }
  g.letterSpacing = '0px';
  return total;
}
// Maskeli şeritten aşağıdan yukarı çıkan yazı. p: giriş, q: çıkış (0→1). o.cf(i): harf rengi.
function slotText(g, s, x, y, o, p, q = 0, stagger = 0.04) {
  if (p <= 0 || q >= 1) return;
  g.save(); g.beginPath(); g.rect(-100, y - o.s * 1.05, W + 200, o.s * 1.42); g.clip();
  letters(g, s, x, y, o, (i, n) => {
    const pi = E.outExpo(clamp(p * (1 + n * stagger) - i * stagger));
    const qi = E.inCubic(clamp(q * (1 + n * stagger * 0.5) - i * stagger * 0.5));
    return { dy: (1 - pi) * o.s * 1.15 - qi * o.s * 1.25, c: o.cf ? o.cf(i) : null };
  });
  g.restore();
}
// Çarkıfelek gibi dönen tabular rakamlar: from → to, p: 0→1
function rollStr(g, from, to, x, y, o, p) {
  const s = o.s, cw = s * (o.cw || 0.62), n = to.length, x0 = o.a === 'left' ? x : o.a === 'right' ? x - cw * n : x - cw * n / 2;
  setFont(g, { f: o.f || 'Disp', w: o.w || 700, s }); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  for (let i = 0; i < n; i++) {
    const cx = x0 + cw * (i + 0.5), ch = to[i];
    g.fillStyle = o.c;
    if (!/\d/.test(ch)) { g.fillText(ch, cx, y); continue; }
    const a = +from[i], b = +ch, spins = o.spins == null ? 1 + (n - i) % 3 : o.spins;
    const e = E.outCubic(clamp(p * 1.25 - (n - 1 - i) * 0.04)), dist = ((b - a + 10) % 10) + 10 * spins, pos = e * dist;
    const k = Math.floor(pos), fr = pos - k, d0 = (a + k) % 10, d1 = (a + k + 1) % 10;
    g.save(); g.beginPath(); g.rect(cx - cw / 2, y - s * 0.86, cw, s * 1.06); g.clip();
    g.fillText(String(d0), cx, y - fr * s * 1.05);
    if (fr > 0.001) g.fillText(String(d1), cx, y + (1 - fr) * s * 1.05);
    g.restore();
  }
}
function shock(g, x, y, w0, h0, grow, t, t0, dur, col, lw) {
  const p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  const e = E.outCubic(p), w = w0 + grow * e, h = h0 + grow * e;
  g.save(); g.globalAlpha *= Math.pow(1 - p, 1.6); g.strokeStyle = col; g.lineWidth = lw * (1 - p * 0.7);
  g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.16); g.stroke(); g.restore();
}
function ring(g, x, y, r0, grow, t, t0, dur, col, lw) {
  const p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  g.save(); g.globalAlpha *= Math.pow(1 - p, 1.6); g.strokeStyle = col; g.lineWidth = lw * (1 - p * 0.7);
  g.beginPath(); g.arc(x, y, r0 + grow * E.outCubic(p), 0, TAU); g.stroke(); g.restore();
}
function makeBurst(seed, n, o) {
  const R = mulberry32(seed), p = [];
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, sp = o.v0 + R() * (o.v1 - o.v0);
    p.push({ vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: o.s0 + R() * (o.s1 - o.s0), rot: R() * TAU, vr: (R() - .5) * 12, col: o.cols[(R() * o.cols.length) | 0], life: o.life * (0.55 + 0.45 * R()) });
  }
  return { ...o, p };
}
function drawBurst(g, b, t) {
  const dt = t - b.t0; if (dt < 0) return;
  for (const q of b.p) {
    if (dt > q.life) continue;
    const k = (1 - Math.exp(-3 * dt)) / 3, a = 1 - E.inQuad(dt / q.life);
    g.save(); g.globalAlpha *= a; g.fillStyle = q.col; g.translate(b.x + q.vx * k, b.y + q.vy * k + 60 * dt * dt); g.rotate(q.rot + q.vr * dt);
    const s = q.s * (0.4 + 0.6 * a); g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, s * 0.2); g.fill(); g.restore();
  }
}

/* ───────── VİZÖR: filmin tamamında süzülen tek köşe parantezi çerçevesi ───────── */
// Hedefler: [başlangıç, bitiş, {cx, cy, w, h, lw, arm, col}, easing]
const ICON = { x: 540, y: 640, s: 460 }; // kapanıştaki uygulama ikonu
const ICON_BRK = { cx: ICON.x, cy: ICON.y, w: 280 * ICON.s / 512, h: 280 * ICON.s / 512, lw: 16 * ICON.s / 512, arm: 39 * ICON.s / 512, col: A.fg };
const WORDS = []; // GİRİŞ / ÇIKIŞ / PUANTAJ dikdörtgenleri (yazı tipleri yüklenince ölçülür)
let BRK = [];
function buildBrackets() {
  const frame = { cx: 540, cy: 940, w: 900, h: 1480, lw: 26, arm: 150, col: A.fg };
  BRK = [
    [-1, 0, { cx: 540, cy: 960, w: 1900, h: 3200, lw: 26, arm: 150, col: A.fg }],
    [0, 0.32, frame, E.outExpo],
    [T.out1 + 0.4, T.plaque, { cx: 540, cy: 1000, w: 90, h: 90, lw: 10, arm: 30, col: A.acc }, E.inOutCubic],
    [T.plaque, T.lock, { cx: 540, cy: 760, w: 660, h: 820, lw: 22, arm: 110, col: A.acc }, E.outBack],
    [T.morph0, T.morph1, { cx: 540, cy: 690, w: 600, h: 600, lw: 22, arm: 100, col: A.fg }, E.inOutCubic],
    [T.toGrid, T.grid, { cx: 540, cy: 860, w: 900, h: 760, lw: 20, arm: 100, col: A.fg }, E.inOutCubic],
    [T.out4, T.cikis, { cx: 540, cy: 720, w: 860, h: 380, lw: 20, arm: 90, col: A.fg }, E.inOutCubic],
    [T.ring - 0.25, T.ring + 0.3, { cx: 540, cy: 820, w: 620, h: 620, lw: 20, arm: 100, col: A.fg }, E.inOutCubic],
    [T.w1 - 0.5, T.w1, WORDS[0], E.inOutCubic],
    [T.w2 - 0.12, T.w2, WORDS[1], E.outCubic],
    [T.w3 - 0.12, T.w3, WORDS[2], E.outCubic],
    [T.cal, T.cal + 0.5, { cx: 540, cy: 935, w: 900, h: 750, lw: 20, arm: 100, col: A.fg }, E.inOutCubic],
    [T.out6, T.logo + 0.2, ICON_BRK, E.inOutCubic],
  ];
}
function brkAt(t) {
  let cur = BRK[0][2];
  for (let i = 1; i < BRK.length; i++) {
    const [a, b, tgt, ease] = BRK[i];
    if (t <= a) break;
    const e = ease(prog(t, a, b)), prev = cur;
    cur = { cx: lerp(prev.cx, tgt.cx, e), cy: lerp(prev.cy, tgt.cy, e), w: lerp(prev.w, tgt.w, e), h: lerp(prev.h, tgt.h, e),
      lw: lerp(prev.lw, tgt.lw, e), arm: lerp(prev.arm, tgt.arm, e), col: rgb(mix(hex2rgb(toHex(prev.col)), hex2rgb(toHex(tgt.col)), e)) };
    if (t < b) break;
  }
  return cur;
}
const toHex = c => c.startsWith('#') ? c : '#' + c.match(/\d+/g).slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join('');
// Vuruşlarda nefes alan çerçeve
const pulse = t => t < 0.3 ? 0 : 12 * kick((t % BEAT), 9);

/* ───────── sahne yardımcıları ───────── */
function bgDark(g) {
  g.fillStyle = A.bg; g.fillRect(-60, -60, W + 120, H + 120);
  glow(g, '#FFFFFF', W / 2, H * 0.45, 900, 0.045, 1200);
}
// QR modüllerinin kişi siluetindeki hedef noktaları
let MORPH = [];
function buildMorph() {
  const c = canvas(W, H), x = c.getContext('2d');
  person(x, 540, 690, 420, '#fff');
  const img = x.getImageData(0, 0, W, H).data, pts = [];
  const sp = 13.5;
  for (let y = 470; y < 910; y += sp) for (let xx = 300; xx < 780; xx += sp) if (img[(Math.round(y) * W + Math.round(xx)) * 4 + 3] > 200) pts.push([xx, y]);
  pts.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const mods = DARK.map(m => ({ ...m })).sort((a, b) => a.r - b.r || a.c - b.c);
  const R = mulberry32(17);
  MORPH = mods.map((m, i) => ({ ...m, tx: pts[Math.floor(i * pts.length / mods.length)][0], ty: pts[Math.floor(i * pts.length / mods.length)][1], d: R() * 0.25, arc: (R() - 0.5) * 300 }));
  MORPH.sp = sp;
}
const PLQ = { x: 540, y: 760, w: 560, h: 720, q: 400 };
const plqQR = { x: PLQ.x, y: PLQ.y - 70 };

/* ═════════ 1. KANCA (0–3,75) ═════════ */
function scene1(g, t) {
  bgDark(g);
  const la = E.outCubic(prog(t, 0.2, 0.6)) * (1 - prog(t, T.out1, T.out1 + 0.25));
  if (la > 0) text(g, 'PAZARTESİ  ·  08:59', 540, 560, { f: 'Txt', w: 600, s: 32, ls: 8, c: rgb(RG.grey, la) });
  const out = prog(t, T.out1, T.out1 + 0.35);
  slotText(g, 'Kim', 540, 930, { w: 900, s: 260, c: A.fg }, prog(t, T.kim - 0.05, T.kim + 0.45), out, 0.06);
  // ikinci satır vuruşlarda değişir
  const words = [['geldi?', T.geldi, T.swap1], ['geç kaldı?', T.swap1, T.swap2], ['çıktı?', T.swap2, T.back], ['geldi?', T.back, T.out1 + 0.35]];
  for (const [w, a, b] of words) {
    const o = fit(g, w, { w: 900, s: 260 }, 860);
    const qx = b >= T.out1 ? out : prog(t, b - 0.02, b + 0.16);
    slotText(g, w, 540, 1180, { ...o, cf: i => i === w.length - 1 ? A.acc : A.fg }, prog(t, a - 0.04, a + 0.36), qx, 0.03);
  }
  // odak noktası: yazılar çekilince büyüyüp atar
  const dp = prog(t, T.out1 + 0.25, T.plaque), dk = kick(t - T.q, 6);
  const dr = 9 + 8 * dk + 22 * E.outBack(dp) * (1 - prog(t, T.plaque - 0.08, T.plaque + 0.1));
  if (t < T.plaque + 0.1) { g.fillStyle = A.acc; g.beginPath(); g.arc(540, lerp(1330, 1000, E.inOutCubic(dp)), dr, 0, TAU); g.fill(); }
}

/* ═════════ 2. OKUT (3,75–8) ═════════ */
function drawPlaque(g, t, a = 1) {
  const rp = E.outBack(prog(t, T.plaque, T.plaque + 0.55)), rise = E.outCubic(prog(t, T.plaque, T.plaque + 0.55));
  if (rp <= 0) return;
  const y = lerp(1500, PLQ.y, rise), sc = lerp(0.7, 1, rp), sy = lerp(0.55, 1, E.outCubic(prog(t, T.plaque, T.plaque + 0.5)));
  g.save(); g.globalAlpha *= a; g.translate(PLQ.x, y); g.scale(sc, sc * sy); g.translate(-PLQ.x, -PLQ.y);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 80; g.shadowOffsetY = 40;
  g.fillStyle = '#FAFAFA'; g.beginPath(); g.roundRect(PLQ.x - PLQ.w / 2, PLQ.y - PLQ.h / 2, PLQ.w, PLQ.h, 44); g.fill(); g.restore();
  // modüller köşegen dalgayla dolar
  const u = PLQ.q / QN;
  g.fillStyle = '#111111';
  for (const m of DARK) {
    if (m.eye >= 0) continue;
    const d = T.plaque + 0.3 + (m.r + m.c) / 48 * 0.55, s = E.outBack(prog(t, d, d + 0.2));
    if (s > 0) mod(g, plqQR.x + (m.c - QM) * u, plqQR.y + (m.r - QM) * u, u * 1.02 * s, 0.14);
  }
  EYE_C.forEach(([er, ec], i) => {
    const d = T.plaque + 0.3 + i * 0.12, s = E.outBack(prog(t, d, d + 0.3));
    if (s <= 0) return;
    const x = plqQR.x + (ec - QM) * u, yy = plqQR.y + (er - QM) * u;
    g.save(); g.translate(x, yy); g.rotate((1 - s) * 1.2); g.scale(s, s); qrEye(g, 0, 0, u); g.restore();
  });
  logo(g, PLQ.x - 150, PLQ.y + 262, 92, { variant: 'icon' });
  text(g, 'Giriş için okutun', PLQ.x - 92, PLQ.y + 252, { f: 'Txt', w: 700, s: 30, a: 'left', c: '#111' });
  text(g, 'QR Personel', PLQ.x - 92, PLQ.y + 292, { f: 'Txt', w: 500, s: 24, a: 'left', c: '#777' });
  // tarama çizgisi
  const sp = prog(t, T.scan0, T.scan1);
  if (sp > 0 && sp < 1) {
    const ly = lerp(plqQR.y - PLQ.q / 2, plqQR.y + PLQ.q / 2, E.inOutSine(sp));
    g.save(); g.globalAlpha *= Math.sin(Math.PI * sp) * 1.4;
    const gr = g.createLinearGradient(0, ly - 120, 0, ly); gr.addColorStop(0, 'rgba(61,220,132,0)'); gr.addColorStop(1, 'rgba(61,220,132,0.28)');
    g.fillStyle = gr; g.fillRect(PLQ.x - 250, ly - 120, 500, 120);
    glow(g, A.acc, PLQ.x, ly, 330, 0.5, 36);
    g.fillStyle = A.acc; g.fillRect(PLQ.x - 260, ly - 3, 520, 6);
    g.restore();
  }
  // onay rozeti
  const ck = E.outBack(prog(t, T.beep, T.beep + 0.3));
  if (ck > 0) {
    g.save(); g.translate(PLQ.x + PLQ.w / 2 - 20, PLQ.y - PLQ.h / 2 + 20); g.scale(ck, ck);
    g.fillStyle = A.acc; g.beginPath(); g.arc(0, 0, 52, 0, TAU); g.fill(); checkMark(g, 0, 2, 52, 11, A.bg); g.restore();
  }
  g.restore();
}
function scene2(g, t) {
  bgDark(g);
  const morph = prog(t, T.morph0, T.morph1);
  // QR → kişi: levha büyüyerek söner, modüller beyaza döner ve siluete akar
  if (morph <= 0) drawPlaque(g, t);
  else {
    const fade = E.inCubic(prog(t, T.morph0, T.morph0 + 0.35));
    g.save(); g.translate(PLQ.x, PLQ.y); g.scale(1 + 0.25 * fade, 1 + 0.25 * fade); g.translate(-PLQ.x, -PLQ.y);
    g.globalAlpha = 1 - fade;
    g.fillStyle = '#FAFAFA'; g.beginPath(); g.roundRect(PLQ.x - PLQ.w / 2, PLQ.y - PLQ.h / 2, PLQ.w, PLQ.h, 44); g.fill();
    g.restore();
    const u = PLQ.q / QN;
    for (const m of MORPH) {
      const p = prog(t, T.morph0 + m.d, T.morph0 + m.d + 0.7), e = E.inOutCubic(p);
      const sx = plqQR.x + (m.c - QM) * u, sy = plqQR.y + (m.r - QM) * u;
      const x = lerp(sx, m.tx, e) + Math.sin(Math.PI * e) * m.arc * 0.4, y = lerp(sy, m.ty, e) - Math.sin(Math.PI * e) * 80;
      g.fillStyle = rgb(mix([17, 17, 17], RG.fg, clamp(fade * 1.5)));
      mod(g, x, y, lerp(u * 1.02, MORPH.sp * 1.05, e), 0.2);
    }
    const solid = prog(t, T.morph1 - 0.12, T.morph1);
    if (solid > 0) { g.save(); g.globalAlpha = solid; person(g, 540, 690, 420, A.fg); g.restore(); }
  }
  slotText(g, 'Okut.', 540, 1400, { w: 900, s: 230, cf: i => i === 4 ? A.acc : A.fg }, prog(t, T.okut - 0.04, T.okut + 0.4), prog(t, T.morph0, T.morph0 + 0.3), 0.05);
}

/* ═════════ 3. GİRİŞ (8–12) ═════════ */
function scene3(g, t) {
  bgDark(g);
  const gp = E.inOutCubic(prog(t, T.toGrid, T.grid)); // ızgaradaki ilk hücreye küçülür
  const g0 = gridCell(0);
  const px = lerp(540, g0[0], gp), py = lerp(690, g0[1], gp), ph = lerp(420, GRID.ph, gp);
  person(g, px, py, ph, A.fg);
  const ui = 1 - prog(t, T.toGrid - 0.1, T.toGrid + 0.25);
  if (ui <= 0) return;
  g.save(); g.globalAlpha = ui;
  const ck = E.outBack(prog(t, T.check, T.check + 0.32));
  if (ck > 0) {
    g.save(); g.translate(720, 500); g.scale(ck, ck); g.fillStyle = A.acc; g.beginPath(); g.arc(0, 0, 74, 0, TAU); g.fill();
    checkMark(g, 0, 2, 70, 15, A.bg, E.outCubic(prog(t, T.check + 0.08, T.check + 0.3))); g.restore();
  }
  ring(g, 720, 500, 74, 90, t, T.check, 0.5, A.acc, 6);
  const name = 'AYŞE YILMAZ  ·  MERKEZ OFİS', nn = Math.floor(clamp((t - T.name) / 0.45) * name.length);
  if (nn > 0) text(g, name.slice(0, nn), 540, 1080, { f: 'Txt', w: 600, s: 30, ls: 6, c: A.grey });
  slotText(g, 'Giriş yapıldı.', 540, 1250, { w: 900, s: 124, cf: i => i === 13 ? A.acc : A.fg }, prog(t, T.giris - 0.04, T.giris + 0.42), 0, 0.035);
  const ca = prog(t, T.clock - 0.05, T.clock + 0.1);
  if (ca > 0) {
    g.save(); g.globalAlpha *= ca;
    const sec = t < T.clock + 1.2 ? '08:57:12' : '08:57:1' + Math.min(9, 2 + Math.floor(t - T.clock - 1.2 + 1));
    rollStr(g, '00:00:00', sec, 540, 1380, { s: 92, w: 700, c: A.grey, cw: 0.62 }, prog(t, T.clock, T.clock + 0.9));
    g.restore();
  }
  g.restore();
}

/* ═════════ 4. EKİP (11–16) ═════════ */
const GRID = { cols: 6, rows: 8, cw: 128, ch: 84, y0: 540, ph: 64 };
const gridCell = i => [540 - (GRID.cols - 1) * GRID.cw / 2 + (i % GRID.cols) * GRID.cw, GRID.y0 + Math.floor(i / GRID.cols) * GRID.ch];
const ABSENT = new Set([5, 22, 29, 40, 41, 46, 47]), LATE = new Set([13, 34]);
const ARRIVE = (() => { const R = mulberry32(31), ids = [...Array(48).keys()].filter(i => i > 0 && !ABSENT.has(i));
  ids.sort(() => R() - 0.5); const m = new Map(); m.set(0, T.grid);
  ids.forEach((id, k) => m.set(id, T.grid + 0.35 + k / ids.length * 2.0 + (LATE.has(id) ? 0.6 : 0))); return m; })();
function scene4(g, t) {
  bgDark(g);
  const ex = E.inCubic(prog(t, T.out4, T.cikis)); // çıkış: ızgara yukarı kayar ve söner
  g.save(); g.translate(0, -160 * ex); g.globalAlpha = 1 - ex;
  let n = 0;
  for (let i = 0; i < 48; i++) {
    const [x, y] = gridCell(i), d = Math.hypot(i % GRID.cols, Math.floor(i / GRID.cols)) * 0.06;
    const s = i === 0 ? 1 : E.outBack(prog(t, T.grid + d, T.grid + d + 0.3));
    if (s <= 0) continue;
    const ta = ARRIVE.get(i), on = ta != null && t >= ta;
    if (on) n++;
    const flash = on ? kick(t - ta, 8) : 0;
    g.save(); g.translate(x, y); g.scale(s * (1 + 0.25 * flash), s * (1 + 0.25 * flash));
    person(g, 0, 0, GRID.ph, on ? rgb(mix(RG.fg, RG.acc, flash)) : A.dim);
    g.restore();
    if (on && LATE.has(i)) { const r = 9 * E.outBack(prog(t, ta, ta + 0.25)); g.fillStyle = A.red; g.beginPath(); g.arc(x + 24, y - 24, r, 0, TAU); g.fill(); }
  }
  // sayaç
  const ca = E.outCubic(prog(t, T.grid, T.grid + 0.3));
  if (ca > 0) {
    g.save(); g.globalAlpha *= ca;
    const s = String(n).padStart(2, '0'), o = { w: 900, s: 170 };
    const wN = measure(g, s, o), wD = measure(g, ' / 48', o);
    text(g, s, 540 - (wN + wD) / 2, 400, { ...o, a: 'left', c: A.fg });
    text(g, ' / 48', 540 - (wN + wD) / 2 + wN, 400, { ...o, a: 'left', c: A.grey });
    text(g, 'İÇERİDE', 540, 462, { f: 'Txt', w: 600, s: 30, ls: 10, c: A.acc });
    g.restore();
  }
  slotText(g, 'Ekibin,', 540, 1300, { w: 900, s: 118, c: A.fg }, prog(t, T.ekibin, T.ekibin + 0.42), 0, 0.04);
  slotText(g, 'tek bakışta.', 540, 1426, { w: 900, s: 118, cf: i => i === 11 ? A.acc : A.fg }, prog(t, T.tek, T.tek + 0.42), 0, 0.03);
  g.restore();
}

/* ═════════ 5. ÇIKIŞ (16–20) ═════════ */
const lapseMin = t => Math.round(lerp(540, 1084, E.inOutSine(prog(t, T.lapse0, T.lapse1))));
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
function scene5(g, t) {
  bgDark(g);
  const inA = E.outCubic(prog(t, T.cikis - 0.1, T.cikis + 0.3)), ex = E.inCubic(prog(t, T.out5, T.w1 - 0.1));
  g.save(); g.globalAlpha = inA * (1 - ex); g.translate(0, -120 * ex);
  // zaman atlaması saati: büyükten başlığa
  const mv = E.inOutCubic(prog(t, T.ring - 0.25, T.ring + 0.3));
  const land = t - T.lapse1, sc = lerp(1, 0.42, mv) * (land >= 0 && land < 1 ? 1 + 0.07 * Math.exp(-land * 8) * Math.cos(land * TAU * 2.2) : 1);
  const col = rgb(mix(RG.fg, RG.acc, land >= 0 ? Math.exp(-land * 3.5) : 0));
  const s = hhmm(lapseMin(t)), o = { s: 230 * sc, w: 700, c: col, cw: 0.6 };
  g.save(); g.translate(0, 0);
  mono(g, s, 540, lerp(800, 380, mv), { ...o, a: 'center', f: 'Disp' });
  g.restore();
  // ileri sar işareti
  const ff = prog(t, T.lapse0, T.lapse0 + 0.15) * (1 - prog(t, T.lapse1 - 0.05, T.lapse1 + 0.1));
  if (ff > 0) { g.save(); g.globalAlpha *= ff * (0.55 + 0.45 * Math.sin(t * 24)); g.fillStyle = A.acc; g.translate(540, 520);
    for (const k of [-14, 14]) { g.beginPath(); g.moveTo(k - 16, -16); g.lineTo(k + 12, 0); g.lineTo(k - 16, 16); g.closePath(); g.fill(); } g.restore(); }
  slotText(g, 'Gün bitti mi?', 540, 1330, { w: 900, s: 118, cf: i => i === 12 ? A.acc : A.fg }, prog(t, T.gun, T.gun + 0.42), prog(t, T.ring - 0.2, T.ring + 0.1), 0.035);
  // çalışma süresi halkası
  const ra = E.outBack(prog(t, T.ring, T.ring + 0.4));
  if (ra > 0) {
    const fp = E.inOutCubic(prog(t, T.ringFill0, T.ringFill1)), cx = 540, cy = 820, R = 230;
    g.save(); g.translate(cx, cy); g.scale(ra, ra); g.lineCap = 'round';
    g.strokeStyle = A.dim; g.lineWidth = 30; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    if (fp > 0.002) { g.strokeStyle = rgb(mix(RG.fg, RG.acc, prog(fp, 0.85, 1))); g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + TAU * fp * 0.999); g.stroke(); }
    const mins = Math.round(544 * fp);
    text(g, `${Math.floor(mins / 60)} sa ${String(mins % 60).padStart(2, '0')} dk`, 0, 22, { w: 800, s: 84, c: A.fg });
    text(g, 'BUGÜN', 0, 86, { f: 'Txt', w: 600, s: 26, ls: 8, c: A.grey });
    g.restore();
    const ra2 = prog(t, T.ring + 0.3, T.ring + 0.6);
    if (ra2 > 0) mono(g, 'GİRİŞ 09:00  ·  ÇIKIŞ 18:04', 540, 1205, { s: 32, w: 600, c: rgb(RG.grey, ra2), a: 'center', cw: 0.62 });
  }
  slotText(g, 'Çıkışta da okut.', 540, 1340, fit(g, 'Çıkışta da okut.', { w: 900, s: 118, cf: i => i === 15 ? A.acc : A.fg }, 860), prog(t, T.okut2, T.okut2 + 0.42), 0, 0.03);
  g.restore();
}

/* ═════════ 6. ÖZELLİKLER + PUANTAJ (20–24) ═════════ */
const WDEF = [['GİRİŞ.', 700, false], ['ÇIKIŞ.', 920, true], ['PUANTAJ.', 1140, false]];
function measureWords(g) {
  WDEF.forEach(([w, y], i) => {
    const o = fit(g, w, { w: 900, s: 230 }, 880), tw = measure(g, w, o);
    WDEF[i].o = o;
    WORDS[i] = { cx: 80 + tw / 2, cy: y - o.s * 0.36, w: tw + 70, h: o.s * 0.98, lw: 14, arm: 50, col: i === 2 ? A.acc : A.fg };
  });
}
const CAL = (() => { const off = (new Date(2026, 8, 1).getDay() + 6) % 7, cells = [];
  for (let i = 0; i < 35; i++) { const d = i - off + 1; cells.push({ i, d: d >= 1 && d <= 30 ? d : 0, we: i % 7 >= 5 }); }
  return { cells, work: cells.filter(c => c.d && !c.we).length }; })();
const CAL_LATE = new Set([3, 9, 15, 22, 28]);
function scene6(g, t) {
  bgDark(g);
  const ex = E.inCubic(prog(t, T.out6, T.logo));
  g.save(); g.globalAlpha = 1 - ex;
  const la = prog(t, T.w1 - 0.1, T.w1 + 0.2) * (1 - prog(t, T.cal - 0.1, T.cal + 0.15));
  if (la > 0) text(g, 'Tek uygulama.', 90, 470, { w: 700, s: 56, a: 'left', c: rgb(RG.grey, la) });
  const toHead = E.inOutCubic(prog(t, T.cal, T.cal + 0.5));
  WDEF.forEach(([w, y, outline], i) => {
    const o = WDEF[i].o, ti = [T.w1, T.w2, T.w3][i];
    const p = prog(t, ti - 0.04, ti + 0.3);
    if (p <= 0) return;
    if (i < 2) {
      const q = prog(t, T.cal - 0.05 + i * 0.05, T.cal + 0.3 + i * 0.05);
      slotText(g, w, 80, y, { ...o, a: 'left', c: A.fg, stroke: outline ? 5 : 0 }, p, q, 0.04);
    } else {
      // PUANTAJ. başlığa küçülür
      const sc = lerp(1, 0.42, toHead), yy = lerp(y, 440, toHead), xx = lerp(80, 540 - measure(g, w, o) * 0.42 / 2, toHead);
      g.save(); g.translate(xx, yy); g.scale(sc, sc);
      slotText(g, w, 0, 0, { ...o, a: 'left', c: A.fg }, p, 0, 0.04);
      g.restore();
    }
  });
  // aylık takvim: hücreler dalgayla dolar
  const cp = prog(t, T.cal + 0.15, T.cal + 1.1);
  if (cp > 0) {
    const cw = 118, chh = 104, x0 = 540 - 3 * cw, y0 = 690;
    ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach((d, i) => text(g, d, x0 + i * cw, y0 - 62, { f: 'Txt', w: 600, s: 24, c: rgb(i >= 5 ? RG.dim : RG.grey, prog(t, T.cal + 0.1, T.cal + 0.4)) }));
    for (const c of CAL.cells) {
      const col = c.i % 7, row = Math.floor(c.i / 7), x = x0 + col * cw, y = y0 + row * chh;
      const d = T.cal + 0.2 + (col + row) * 0.06, s = E.outBack(prog(t, d, d + 0.25));
      if (s <= 0) continue;
      g.save(); g.translate(x, y); g.scale(s, s);
      const fill = !c.d ? 'rgba(255,255,255,0.05)' : c.we ? '#3A3C42' : A.fg;
      g.fillStyle = fill; g.beginPath(); g.roundRect(-50, -42, 100, 84, 16); g.fill();
      if (c.d && CAL_LATE.has(c.d)) { g.fillStyle = A.red; g.beginPath(); g.arc(34, -26, 8, 0, TAU); g.fill(); }
      if (c.d) text(g, String(c.d), -36, -10, { f: 'Txt', w: 700, s: 22, a: 'left', c: c.we ? A.grey : A.ink });
      g.restore();
    }
    const lq = prog(t, T.cal + 0.8, T.cal + 1.1);
    if (lq > 0) mono(g, `EYLÜL  ·  ${CAL.work} İŞ GÜNÜ  ·  53 PERSONEL`, 540, y0 + 5 * chh + 40, { s: 28, w: 600, c: rgb(RG.grey, lq), a: 'center', cw: 0.64 });
  }
  g.restore();
}

/* ═════════ 7. MARKA (24–30) ═════════ */
function scene7(g, t) {
  // siyah zeminden beyaz sayfaya dairesel taşma
  g.fillStyle = A.bg; g.fillRect(-60, -60, W + 120, H + 120);
  const fp = E.inCubic(prog(t, T.logo - 0.05, T.logo + 0.3));
  g.fillStyle = A.paper; g.beginPath(); g.arc(ICON.x, ICON.y, 2300 * fp, 0, TAU); g.fill();
  const push = 1 + 0.025 * E.outSine(prog(t, T.word, DUR));
  g.save(); g.translate(540, 900); g.scale(push, push); g.translate(-540, -900);
  // ikon: koyu kare büyür, parantezler gelir (vizör buraya iner), kişiler sırayla zıplar
  const is = E.outBack(prog(t, T.logo - 0.15, T.logo + 0.3));
  const ppl = [E.outBack(prog(t, T.p2, T.p2 + 0.3)), E.outBack(prog(t, T.p1, T.p1 + 0.3)), E.outBack(prog(t, T.p3, T.p3 + 0.3))];
  const breathe = t > T.hold ? 4 * Math.max(0, Math.sin((t - T.hold) * Math.PI * 2)) : 0;
  const shine = prog(t, T.hold, T.hold + 0.7);
  if (is > 0) {
    logo(g, ICON.x, ICON.y, ICON.s, { variant: 'icon', iconScale: is, people: ppl, brackets: t >= T.logo + 0.2 ? 1 : 0, open: breathe, shadow: 'rgba(0,0,0,0.28)' });
    if (shine > 0 && shine < 1) {
      g.save(); g.beginPath(); g.roundRect(ICON.x - ICON.s / 2, ICON.y - ICON.s / 2, ICON.s, ICON.s, ICON.s * 0.1875); g.clip();
      const sx = lerp(ICON.x - 500, ICON.x + 500, E.inOutCubic(shine));
      const gr = g.createLinearGradient(sx - 120, 0, sx + 120, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.translate(sx, ICON.y); g.rotate(0.35); g.fillStyle = gr; g.fillRect(-140, -600, 280, 1200); g.restore();
    }
  }
  [[T.p1, 0], [T.p2, -1], [T.p3, 1]].forEach(([tp, k]) => ring(g, ICON.x + k * 68 * ICON.s / 512, ICON.y + 20 * ICON.s / 512, 40, 70, t, tp, 0.4, A.acc, 5));
  letters(g, 'QR Personel', 540, 1010, { w: 800, s: 128, c: A.ink }, (i, n) => {
    const d = T.word + i * 0.03, p = prog(t, d, d + 0.4);
    return { dy: (1 - E.outExpo(p)) * 80, al: E.outCubic(p) };
  });
  slotText(g, 'QR kodla personel takibi', 540, 1092, { f: 'Txt', w: 500, s: 44, c: '#6F6F6F' }, prog(t, T.tag, T.tag + 0.45), 0, 0.02);
  const up = E.outBack(prog(t, T.url, T.url + 0.35));
  if (up > 0) {
    const url = 'qrpersonel.com', n = Math.floor(clamp((t - T.url - 0.1) / 0.04, 0, url.length)), o = { w: 700, s: 46 };
    const tw = Math.max(measure(g, url.slice(0, n), o), 8), w = tw + 130, h = 104, y = 1250;
    g.save(); g.translate(540, y); g.scale(up, up);
    g.fillStyle = A.ink; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
    g.fillStyle = A.acc; g.beginPath(); g.arc(-w / 2 + 48, 0, 11, 0, TAU); g.fill();
    text(g, url.slice(0, n), -w / 2 + 76, 16, { ...o, a: 'left', c: '#FFFFFF' });
    if (n < url.length || Math.floor((t - T.url) * 2) % 2 === 0) { g.fillStyle = A.acc; g.fillRect(-w / 2 + 80 + tw, -22, 4, 44); }
    g.restore();
  }
  const ca = prog(t, T.cta, T.cta + 0.4);
  if (ca > 0) {
    const bob = 6 * Math.sin((t - T.cta) * Math.PI * 2);
    rich(g, [['Hemen başlayın ', A.ink], ['→', A.ink]], 540, 1380 + (1 - E.outCubic(ca)) * 30, { f: 'Txt', w: 700, s: 42 });
    g.save(); g.globalAlpha = ca; g.fillStyle = A.acc; g.fillRect(540 - 60 + bob, 1404, 120, 6); g.restore();
  }
  g.restore();
  drawBurst(g, SPRB.final, t);
}

/* ═════════ ana çizim ═════════ */
const IMPACTS = [[0, 16], [T.kim, 6], [T.geldi, 6], [T.swap1, 5], [T.swap2, 5], [T.lock, 8], [T.okut, 10], [T.beep, 6], [T.morph1, 8], [T.check, 8],
  [T.giris, 6], [T.grid, 6], [T.ekibin, 5], [T.lapse1, 12], [T.ring, 6], [T.w1, 12], [T.w2, 12], [T.w3, 14], [T.cal, 6], [T.logo, 12], [T.p1, 5], [T.p2, 5], [T.p3, 7], [T.word, 4]];
function shake(t) {
  let x = 0, y = 0;
  IMPACTS.forEach(([t0, a], i) => { const dt = t - t0; if (dt < 0 || dt > 0.5) return; const k = a * Math.exp(-dt * 13); x += k * Math.sin(dt * 83 + i); y += k * Math.cos(dt * 71 + 2 * i); });
  return [x, y];
}
function draw(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const [sx, sy] = shake(t); g.translate(sx, sy);
  if (t < T.plaque) scene1(g, t);
  else if (t < T.morph1) scene2(g, t);
  else if (t < T.grid) scene3(g, t);
  else if (t < T.cikis) scene4(g, t);
  else if (t < T.w1 - 0.1) scene5(g, t);
  else if (t < T.logo - 0.15) scene6(g, t);
  else scene7(g, t);
  // vizör çerçevesi (markada ikonun kendi parantezleri devralır)
  if (t < T.logo + 0.2) {
    const b = brkAt(t), p = t > 0.3 && t < T.out6 ? pulse(t) : 0;
    brackets(g, b.cx, b.cy, b.w + p, b.h + p, b.lw, b.arm, b.col);
  }
}

/* ───────── ses ipuçları ───────── */
function buildCues() {
  const q = [], cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  cue(0, 'impact', { gain: 0.9 }); cue(0.02, 'shutter', { gain: 0.6 });
  [T.kim, T.geldi].forEach(t => cue(t, 'slam', { gain: 0.7 })); cue(T.q, 'pop', { pitch: 1.4, gain: 0.4 });
  [T.swap1, T.swap2, T.back].forEach((t, i) => { cue(t, 'thump', { gain: 0.5 }); cue(t, 'whoosh', { dur: 0.18, f0: 1500, f1: 6000, gain: 0.15 }); });
  cue(T.out1, 'whoosh', { dur: 0.4, f0: 5000, f1: 500, gain: 0.3 });
  cue(T.plaque - 0.1, 'whoosh', { dur: 0.5, f0: 300, f1: 4000, gain: 0.4 });
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx], i) => cue(T.lock - 0.05 + i * 0.03, 'click', { pitch: 1.1 + i * 0.1, gain: 0.45, pan: sx * 0.4 }));
  for (let k = 0; k < 10; k++) cue(T.plaque + 0.3 + k * 0.055, 'blip', { pitch: 1.2 + k * 0.08, gain: 0.08, pan: -0.3 + k * 0.06 });
  cue(T.okut, 'slam', { gain: 0.9 });
  cue(T.scan0 - 0.04, 'laser', { dur: T.scan1 - T.scan0 + 0.08, gain: 0.28 });
  cue(T.beep, 'beep', { gain: 0.55 }); cue(T.beep + 0.02, 'success', { gain: 0.3 });
  cue(T.morph0, 'sweep', { dur: 0.9, gain: 0.3 }); cue(T.morph0 + 0.1, 'sparkle', { dur: 0.8, gain: 0.25 });
  cue(T.morph1 - 0.4, 'reverse', { dur: 0.4, gain: 0.4 });
  cue(T.morph1, 'impact', { gain: 0.8 });
  cue(T.check, 'pop', { pitch: 1.2, gain: 0.5 }); cue(T.check + 0.05, 'success', { gain: 0.25 });
  for (let i = 0; i < 14; i++) cue(T.name + i * 0.032, 'type', { gain: 0.12 });
  cue(T.giris, 'slam', { gain: 0.6 });
  for (let i = 0; i < 12; i++) cue(T.clock + i * 0.06, 'tick', { pitch: 1.2 + i * 0.05, gain: 0.14 });
  cue(T.toGrid, 'whoosh', { dur: 0.6, f0: 4000, f1: 400, gain: 0.3 });
  for (let i = 0; i < 12; i++) cue(T.grid + i * 0.045, 'blip', { pitch: 0.8 + i * 0.06, gain: 0.09, pan: -0.5 + i * 0.09 });
  [...ARRIVE.entries()].filter(([i]) => i > 0).sort((a, b) => a[1] - b[1]).forEach(([i, ta], k) => {
    if (k % 2 === 0 || LATE.has(i)) cue(ta, LATE.has(i) ? 'blip' : 'tick', { pitch: LATE.has(i) ? 0.5 : 1.3 + (k / 40) * 0.8, gain: LATE.has(i) ? 0.2 : 0.12, pan: ((i % 6) - 2.5) / 3 });
  });
  cue(T.ekibin, 'thump', { gain: 0.5 }); cue(T.tek, 'slam', { gain: 0.55 });
  cue(T.out4, 'whoosh', { dur: 0.5, f0: 600, f1: 5000, gain: 0.3 });
  let ph = 9; for (let k = 0; k <= 200; k++) { const t = T.lapse0 + k * 0.006, h = Math.floor(lapseMin(t) / 60); if (h !== ph) { cue(t, 'tick', { pitch: 0.9 + (h - 9) * 0.12, gain: 0.4 }); ph = h; } }
  cue(T.lapse0, 'riser', { dur: T.lapse1 - T.lapse0, gain: 0.35 });
  cue(T.gun, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.18 });
  cue(T.lapse1, 'slam', { gain: 0.8 }); cue(T.lapse1 + 0.02, 'shimmer', { dur: 0.5, gain: 0.2 });
  cue(T.ring, 'pop', { pitch: 0.9, gain: 0.4 }); cue(T.ringFill0, 'sweep', { dur: T.ringFill1 - T.ringFill0, gain: 0.22 });
  for (let h = 1; h <= 9; h++) cue(T.ringFill0 + (T.ringFill1 - T.ringFill0) * E.inOutCubic(h / 9.07) , 'blip', { pitch: 1 + h * 0.06, gain: 0.08 });
  cue(T.ringFill1, 'success', { gain: 0.25 }); cue(T.okut2, 'thump', { gain: 0.5 });
  cue(T.w1 - 0.5, 'whoosh', { dur: 0.5, f0: 300, f1: 6000, gain: 0.4 });
  [T.w1, T.w2, T.w3].forEach((t, i) => { cue(t, 'slam', { gain: 0.85 + i * 0.05 }); cue(t + 0.02, 'shutter', { gain: 0.3 }); });
  cue(T.cal, 'whoosh', { dur: 0.5, f0: 500, f1: 5000, gain: 0.35 });
  for (let k = 0; k < 11; k++) cue(T.cal + 0.2 + k * 0.06, 'blip', { pitch: 1.1 + k * 0.07, gain: 0.08, pan: -0.5 + k * 0.1 });
  cue(T.out6 - 0.1, 'reverse', { dur: 0.6, gain: 0.45 });
  cue(T.logo, 'impact', { gain: 1.0, big: true });
  [T.p1, T.p2, T.p3].forEach((t, i) => cue(t, 'pop', { pitch: [1.0, 0.85, 1.2][i], gain: 0.5, pan: [0, -0.4, 0.4][i] }));
  'QR Personel'.split('').forEach((ch, i) => { if (ch !== ' ') cue(T.word + i * 0.03, 'tick', { pitch: 1.8 + i * 0.03, gain: 0.07 }); });
  cue(T.word, 'sweep', { dur: 0.45, gain: 0.2 });
  cue(T.url, 'pop', { pitch: 1.3, gain: 0.3 });
  for (let i = 0; i < 14; i++) cue(T.url + 0.1 + i * 0.04, 'type', { gain: 0.14 });
  cue(T.cta, 'whoosh', { dur: 0.3, f0: 1200, f1: 4000, gain: 0.15 });
  cue(T.hold, 'shine', { dur: 0.6, gain: 0.25 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────── kare üretimi ───────── */
const main = document.getElementById('c'), ctx = main.getContext('2d');
const off = canvas(W, H), g = off.getContext('2d');
const SPRB = {};
function samplesAt(t) {
  const near = (a, b) => t > a && t < b;
  if (near(0, 0.35) || near(T.morph0, T.morph1) || near(T.w1 - 0.5, T.w3 + 0.15) || near(T.out6, T.logo + 0.35) || near(T.lapse0, T.lapse1 + 0.1)) return 10;
  return 6;
}
function post(t, f) {
  // film greni + karanlık sahnelerde hafif vinyet
  if (t < T.logo) { const gr = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  ctx.save(); ctx.globalAlpha = t < T.logo ? 0.07 : 0.04; ctx.globalCompositeOperation = 'overlay';
  ctx.translate(-(f * 73 % 256), -(f * 151 % 256)); ctx.fillStyle = SPRB.grain; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}
function renderFrame(f) {
  const t = f / FPS, n = samplesAt(t);
  for (let s = 0; s < n; s++) {
    const ts = clamp(t + ((s + 0.5) / n - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    draw(g, ts); ctx.globalAlpha = 1 / (s + 1); ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1; post(t, f);
}
function renderAt(t) { draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); post(t, Math.round(t * FPS)); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  measureWords(g); buildBrackets(); buildMorph();
  const n = canvas(256, 256), nx = n.getContext('2d'), id = nx.createImageData(256, 256), R = mulberry32(3);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (R() - 0.5) * 180; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  nx.putImageData(id, 0, 0); SPRB.grain = ctx.createPattern(n, 'repeat');
  SPRB.final = makeBurst(23, 50, { t0: T.p3, x: ICON.x, y: ICON.y, v0: 500, v1: 1500, s0: 8, s1: 24, life: 1.3, cols: [A.acc, A.ink, '#BDBDBD'] });
  window.CUES = buildCues(); window.FRAMES = FRAMES; window.FPS = FPS; window.DUR = DUR;
  window.renderFrame = renderFrame; window.renderAt = renderAt;
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  return true;
})();
