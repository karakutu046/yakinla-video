'use strict';
/* QR Personel — Instagram Reels, Konsept H "Kâğıt Kesik" (9:16, 1080×1920, 30 sn)
 *
 * Kâğıt kolaj, stop-motion. Bütün hareket saniyede 12 adımda ilerler (24 fps'te her çizim
 * 2 kare kalır) ve her kâğıt parçası adımdan adıma hafifçe "kaynar" (boil). Hareket bulanıklığı yok.
 *
 * Müzik 120 BPM: 1 vuruş 0,5 sn = 6 adım, 1 ölçü 2 sn, 15 ölçü = tam 30 sn.
 *   0    Kanca     imza föyü düşer, kesik harfler "KİM GELDİ?" tek tek yapışır, notlar
 *   4    Kesip at  makas föyü keser, parçalar uçar, kâğıt QR kare kare dizilir, "OKUT."
 *   8    Giriş     kâğıt telefon yükselir, köşeler, tarama şeridi, onay, iple sallanan etiket
 *   14   Ekip      kâğıt kişiler tek tek kalkar, sayaç kartları 08 → 45, "Ekip tamam mı?"
 *   18   Puantaj   takvim düşer, çıkartmalar yapışır, lastik damga "PUANTAJ HAZIR"
 *   24   Marka     kartondan logo katman katman kurulur, "QR Personel", adres etiketi
 *
 * Reels güvenli alanı: kritik yazılar y 250–1480 arasında. */

const FPS = 24, DUR = 30, FRAMES = FPS * DUR, STEP = 12;
const BEAT = 0.5, BAR = 2;
const HK = { kraft: '#E6D9C2', paper: '#FBF7EE', ink: '#1C1B19', terra: '#D4643B', mus: '#E7B347', sage: '#8DAA7B', blue: '#4A6FA5', grey: '#B9B2A4' };
const sq = t => Math.floor(t * STEP + 1e-6) / STEP;       // stop-motion zamanı
const stepOf = t => Math.floor(t * STEP + 1e-6);
const ks = (t, t0) => Math.floor((t - t0) * STEP + 1e-6); // t0'dan bu yana adım

const T = {
  sheet: 0, letters: [0.5, 0.667, 0.833, 1.0, 1.167, 1.333, 1.5, 1.667, 2.0], ali: 2.5, kart: 3.0, clip: 3.25,
  cut0: 4.0, cut1: 4.33, scis1: 5.17, split: 5.17, card: 5.5, mods0: 5.67, mods1: 6.5, eyes: [5.67, 5.83, 6.0], okut: [6.5, 6.67, 6.83, 7.0, 7.17],
  out2: 8.0, phone: 8.0, brk: [8.5, 8.58, 8.67, 8.75], scan0: 9.0, scan1: 9.75, check: 10.0, tag: 10.25, okuttun: 11.0, out3: 13.5,
  ppl0: 14.0, counter: 14.25, nums: [14.5, 15.0, 15.5, 16.0], ekip: 16.0, bakis: 16.5, out4: 17.5,
  cal: 18.0, stk0: 18.5, stk1: 20.0, stampUp: 20.5, stampHit: 21.0, aySonu: 22.0, out5: 23.5,
  logo: 24.0, brkL: [24.5, 24.58, 24.67, 24.75], ppl: [25.0, 25.25, 25.5], word: 26.0, tagline: 26.5, url: 27.0, cta: 28.0,
};

/* ───────── stop-motion yardımcıları ───────── */
// Her parça her adımda biraz kıpırdar
function boil(id, t, amp = 1) {
  const s = stepOf(t);
  return [(hash(id, s) - 0.5) * 3.2 * amp, (hash(id + 0.37, s) - 0.5) * 3.2 * amp, (hash(id + 0.71, s) - 0.5) * 0.009 * amp];
}
// Giriş hareketleri, adım dizileri olarak (sahici stop-motion: ara kareler el ile "pozlanmış" gibi)
const DROP = [{ dy: -420, sc: 1.02 }, { dy: -140, sc: 1.02 }, { dy: 0, sc: 1.07 }, { dy: 0, sc: 0.97 }, { dy: 0, sc: 1.01 }];
const POP = [{ sc: 1.32 }, { sc: 0.9 }, { sc: 1.05 }, { sc: 1 }];
const SLAP = [{ sc: 1.22, r: 0.06 }, { sc: 0.95, r: -0.01 }, { sc: 1.02, r: 0 }];
function enter(t, t0, kind) {
  const k = ks(t, t0); if (k < 0) return null;
  const seq = kind === 'drop' ? DROP : kind === 'pop' ? POP : SLAP;
  const e = seq[Math.min(k, seq.length - 1)];
  return { dy: e.dy || 0, sc: k >= seq.length ? 1 : e.sc, r: e.r || 0 };
}
// Çıkış: sola süpürülür (adım adım hızlanarak)
const SWEEP = [0, -60, -220, -520, -1000, -1700];
function sweep(t, t0, dir = -1) { const k = ks(t, t0); if (k < 0) return { dx: 0, r: 0, gone: false }; return { dx: dir * -SWEEP[Math.min(k, 5)], r: dir * k * 0.06, gone: k >= 5 }; }

/* ───────── kâğıt çizimi ───────── */
let BG = null;
function buildBG() {
  BG = canvas(W, H); const g = BG.getContext('2d');
  g.fillStyle = HK.kraft; g.fillRect(0, 0, W, H);
  const R = mulberry32(12); g.strokeStyle = 'rgba(120,90,50,0.09)'; g.lineWidth = 2;
  for (let i = 0; i < 420; i++) { const x = R() * W, y = R() * H, a = R() * TAU, l = 20 + R() * 70; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 40; i++) glow(g, R() < 0.5 ? '#C9B89A' : '#F2E8D6', R() * W, R() * H, 120 + R() * 200, 0.12);
  grain(g, 0.1);
}
function bg(g, t) {
  g.drawImage(BG, 0, 0);
  const f = (hash(7.7, stepOf(t)) - 0.5) * 0.03; // pozlama titremesi
  g.fillStyle = f > 0 ? `rgba(255,250,240,${f})` : `rgba(40,30,10,${-f})`; g.fillRect(0, 0, W, H);
}
// Yırtık kenarlı kâğıt; seed kenar biçimini sabitler
const PATHS = {};
function paperPath(w, h, torn, seed) {
  const key = `${w}|${h}|${torn}|${seed}`;
  if (PATHS[key]) return PATHS[key];
  const R = mulberry32(seed), p = new Path2D();
  const jag = (x0, y0, x1, y1) => { const n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / 40)); for (let i = 1; i <= n; i++) { const u = i / n; p.lineTo(lerp(x0, x1, u) + (R() - 0.5) * torn * 6, lerp(y0, y1, u) + (R() - 0.5) * torn * 6); } };
  p.moveTo(-w / 2, -h / 2); jag(-w / 2, -h / 2, w / 2, -h / 2); jag(w / 2, -h / 2, w / 2, h / 2); jag(w / 2, h / 2, -w / 2, h / 2); jag(-w / 2, h / 2, -w / 2, -h / 2);
  return (PATHS[key] = p);
}
function shadowOn(g, lift = 1) { g.shadowColor = 'rgba(60,40,10,0.3)'; g.shadowBlur = 14 * lift; g.shadowOffsetX = 5 * lift; g.shadowOffsetY = 9 * lift; }
function shadowOff(g) { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
// Bir kâğıt parçasının dönüşümü altında çizim: fn(g) yerel koordinatlarda
function piece(g, t, id, cx, cy, rot, o, fn) {
  const [bx, by, br] = boil(id, t, o.amp ?? 1);
  g.save(); g.translate(cx + bx + (o.dx || 0), cy + by + (o.dy || 0)); g.rotate(rot + br + (o.r || 0)); if (o.sc && o.sc !== 1) g.scale(o.sc, o.sc);
  fn(g); g.restore();
}
function paperRect(g, w, h, col, torn = 0.6, seed = 1, lift = 1) {
  g.save(); shadowOn(g, lift); g.fillStyle = col; g.fill(paperPath(w, h, torn, seed)); g.restore();
}

/* ───────── kesik harfler, şeritler, etiketler ───────── */
const LCOL = [HK.paper, HK.terra, HK.mus, HK.sage, HK.ink, HK.blue];
function letterTiles(g, s, size, seed) {
  const R = mulberry32(seed), o = { w: 900, s: size };
  const ws = [...s].map(ch => ch === ' ' ? size * 0.35 : measure(g, ch, o) + size * 0.24), total = ws.reduce((a, b) => a + b, 0);
  let x = -total / 2;
  return [...s].map((ch, i) => {
    const bgc = LCOL[(R() * LCOL.length) | 0], fg = [HK.ink, HK.blue, HK.terra].includes(bgc) ? HK.paper : HK.ink;
    const tile = { ch, x: x + ws[i] / 2, w: ws[i] - 6, bg: bgc, fg, rot: (R() - 0.5) * 0.24, wt: [900, 800, 700][(R() * 3) | 0], sz: size * (0.86 + R() * 0.12), seed: seed * 50 + i };
    x += ws[i]; return tile;
  });
}
const TILE_CACHE = {};
function drawLetters(g, t, key, s, cx, y, size, seed, times, out = null) {
  const tiles = TILE_CACHE[key] || (TILE_CACHE[key] = letterTiles(g, s, size, seed));
  let n = 0;
  tiles.forEach((tl, i) => {
    if (tl.ch === ' ') return;
    const e = enter(t, times[n++], 'slap'); if (!e) return;
    const sw = out != null ? sweep(t, out + i * 0.02) : { dx: 0, r: 0, gone: false }; if (sw.gone) return;
    piece(g, t, tl.seed, cx + tl.x + sw.dx, y - size * 0.34, tl.rot + sw.r, { sc: e.sc, r: e.r }, gg => {
      paperRect(gg, tl.w, size * 1.08, tl.bg, 0.5, tl.seed);
      text(gg, tl.ch, 0, size * 0.36, { w: tl.wt, s: tl.sz, c: tl.fg });
    });
  });
}
function strip(g, t, id, s, cx, y, size, bgc, fg, rot, t0, out = null) {
  const e = enter(t, t0, 'slap'); if (!e) return;
  const sw = out != null ? sweep(t, out) : { dx: 0, r: 0, gone: false }; if (sw.gone) return;
  const o = { w: 900, s: size }, tw = measure(g, s, o);
  piece(g, t, id, cx + sw.dx, y - size * 0.34, rot + sw.r, { sc: e.sc, r: e.r }, gg => {
    paperRect(gg, tw + size * 0.8, size * 1.35, bgc, 0.7, s.length + id);
    text(gg, s, 0, size * 0.36, { ...o, c: fg });
  });
}
// İpe bağlı etiket: sönümlü sarkaç, adım adım
function swingAngle(t, t0) { const d = sq(t) - t0; return d < 0 ? 0 : 0.5 * Math.exp(-d * 2.2) * Math.cos(d * 7); }
function hangTag(g, t, id, ax, ay, len, w, h, col, draw, t0, rot0 = 0) {
  const k = ks(t, t0); if (k < 0) return;
  const drop = [-260, -90, 0][Math.min(k, 2)], a = swingAngle(t, t0) + rot0;
  g.save(); g.translate(ax, ay + drop);
  g.strokeStyle = HK.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0);
  const ex = Math.sin(a) * len, ey = Math.cos(a) * len; g.quadraticCurveTo(ex * 0.4 + 14, ey * 0.5, ex, ey); g.stroke();
  piece(g, t, id, ex, ey + h / 2, a * 0.8, { amp: 0.6 }, gg => {
    paperRect(gg, w, h, col, 0.5, id);
    gg.fillStyle = HK.kraft; gg.beginPath(); gg.arc(0, -h / 2 + 18, 9, 0, TAU); gg.fill();
    draw(gg);
  });
  g.restore();
}

/* ═════════ 1. KANCA (0–4) ═════════ */
const SHEET = { x: 520, y: 1010, w: 720, h: 860, rot: -0.06 };
function sheetContent(g) {
  paperRect(g, SHEET.w, SHEET.h, HK.paper, 0.8, 4, 1.2);
  g.strokeStyle = 'rgba(28,27,25,0.25)'; g.lineWidth = 2;
  for (let r = 0; r < 11; r++) { g.beginPath(); g.moveTo(-300, -300 + r * 64); g.lineTo(300, -300 + r * 64); g.stroke(); }
  const R = mulberry32(5); g.strokeStyle = '#2B3A8C'; g.lineCap = 'round';
  for (let r = 0; r < 10; r++) { if (r === 6) continue; g.lineWidth = 3; g.beginPath(); g.moveTo(-280, -270 + r * 64); for (let x = -280; x < -40 - R() * 80; x += 14) g.lineTo(x + 7, -270 + r * 64 + (R() - 0.5) * 24); g.stroke(); }
  text(g, 'İMZA FÖYÜ', 0, -340, { f: 'Txt', w: 700, s: 32, ls: 6, c: HK.ink });
}
const CUT_Y = 120; // föy yerel koordinatlarında kesik çizgi
function scene1and2(g, t) {
  const shakeAmp = t > 3.5 && t < T.cut0 ? 2.5 : 1;
  // föy: düşer; 5.17'de ikiye ayrılır
  const e = enter(t, T.sheet, 'drop');
  if (e && t < T.split + 0.6) {
    const kk = ks(t, T.split), parts = t >= T.split ? [[-1, kk], [1, kk]] : [[0, 0]];
    for (const [half, k] of parts) {
      const dy = half === 0 ? 0 : half < 0 ? [-30, -140, -380, -800, -1400][Math.min(k, 4)] : [40, 200, 520, 1000, 1600][Math.min(k, 4)];
      const dx = half === 0 ? 0 : half < 0 ? [-20, -90, -260, -600, -1100][Math.min(k, 4)] : [10, 60, 160, 320, 600][Math.min(k, 4)];
      const rr = half === 0 ? 0 : half * k * 0.07;
      piece(g, t, 100 + half, SHEET.x + dx, SHEET.y + e.dy + dy, SHEET.rot + rr, { sc: e.sc, amp: shakeAmp }, gg => {
        gg.save();
        if (half !== 0) { gg.beginPath(); if (half < 0) gg.rect(-500, -600, 1000, 600 + CUT_Y); else gg.rect(-500, CUT_Y, 1000, 600); gg.clip(); }
        sheetContent(gg);
        // kesik çizgi
        const cp = prog(sq(t), T.cut0, T.cut1);
        if (cp > 0 && t < T.split) { gg.save(); gg.setLineDash([18, 14]); gg.strokeStyle = HK.ink; gg.lineWidth = 4; gg.beginPath(); gg.moveTo(-380, CUT_Y); gg.lineTo(-380 + 760 * cp, CUT_Y); gg.stroke(); gg.restore(); }
        gg.restore();
      });
    }
  }
  // yapışkan notlar + ataş
  const sw = sweep(t, T.split + 0.08);
  const ali = enter(t, T.ali, 'slap');
  if (ali && !sw.gone) piece(g, t, 201, 820 + sw.dx, 700, 0.12 + sw.r, { sc: ali.sc, r: ali.r, amp: shakeAmp }, gg => {
    paperRect(gg, 250, 230, HK.mus, 0.3, 8); text(gg, 'Ali?', 0, 10, { w: 900, s: 66, c: HK.ink }); text(gg, '9:15 ??', 0, 70, { f: 'Txt', w: 700, s: 34, c: HK.ink }); });
  const kart = enter(t, T.kart, 'slap'), sw2 = sweep(t, T.split + 0.16);
  if (kart && !sw2.gone) piece(g, t, 202, 250 + sw2.dx, 1330, -0.1 + sw2.r, { sc: kart.sc, r: kart.r, amp: shakeAmp }, gg => {
    paperRect(gg, 250, 210, HK.terra, 0.3, 9); text(gg, 'Kart', 0, -6, { w: 900, s: 54, c: HK.paper }); text(gg, 'kayıp!', 0, 52, { w: 900, s: 54, c: HK.paper }); });
  const clip = enter(t, T.clip, 'pop'), sw3 = sweep(t, T.split);
  if (clip && !sw3.gone) piece(g, t, 203, 300 + sw3.dx, 600, -0.4 + sw3.r, { sc: clip.sc, amp: shakeAmp }, gg => {
    gg.strokeStyle = '#8A8F96'; gg.lineWidth = 7; gg.lineCap = 'round';
    gg.beginPath(); gg.moveTo(0, -60); gg.lineTo(0, 60); gg.arc(18, 60, 18, Math.PI, 0, true); gg.lineTo(36, -40); gg.arc(52, -40, 16, Math.PI, 0); gg.lineTo(68, 40); gg.stroke(); });
  drawLetters(g, t, 'kim', 'KİM GELDİ?', 540, 470, 112, 3, T.letters, T.split + 0.04);
  // makas kesik çizgi boyunca ilerler
  if (t >= T.cut1 - 0.08 && t < T.split + 0.25) {
    const p = prog(sq(t), T.cut1, T.scis1), lx = -380 + 760 * p;
    const c = Math.cos(SHEET.rot), s = Math.sin(SHEET.rot);
    const x = SHEET.x + lx * c - CUT_Y * s, y = SHEET.y + lx * s + CUT_Y * c, open = stepOf(t) % 2 ? 0.28 : 0.06;
    piece(g, t, 210, x + 60, y, SHEET.rot, {}, gg => {
      gg.save(); shadowOn(gg, 0.8);
      for (const sgn of [-1, 1]) {
        gg.save(); gg.rotate(sgn * open);
        gg.fillStyle = '#9AA0A6'; gg.beginPath(); gg.moveTo(-10, -6 * sgn); gg.lineTo(110, 0); gg.lineTo(-10, 6 * sgn); gg.closePath(); gg.fill();
        gg.fillStyle = HK.terra; gg.beginPath(); gg.ellipse(-50, 26 * sgn, 34, 22, 0.3 * sgn, 0, TAU); gg.fill();
        gg.fillStyle = HK.kraft; gg.beginPath(); gg.ellipse(-50, 26 * sgn, 16, 9, 0.3 * sgn, 0, TAU); gg.fill();
        gg.restore();
      }
      gg.restore();
    });
  }
}
// Kâğıt QR: kart düşer, modüller satır satır yerleştirilir
const QRP = { x: 540, y: 760, s: 420 };
function paperQR(g, t, x, y, size, a = 1) {
  const e = enter(t, T.card, 'drop'); if (!e) return;
  const u = size / QN;
  piece(g, t, 300, x, y + e.dy, 0.03, { sc: e.sc }, gg => {
    paperRect(gg, size * 1.32, size * 1.32, HK.paper, 0.4, 7, size / 420);
    gg.save(); gg.shadowColor = 'rgba(40,30,10,0.35)'; gg.shadowBlur = 3 * size / 420; gg.shadowOffsetX = 2 * size / 420; gg.shadowOffsetY = 3 * size / 420;
    gg.fillStyle = HK.ink;
    for (const m of DARK) {
      if (m.eye >= 0) continue;
      const ta = T.mods0 + (m.r / QN) * (T.mods1 - T.mods0);
      if (sq(t) < ta) continue;
      const pop = ks(t, ta) === 0 ? 1.25 : 1;
      mod(gg, (m.c - QM) * u, (m.r - QM) * u, u * 1.0 * pop, 0.14);
    }
    EYE_C.forEach(([er, ec], i) => { const ee = enter(t, T.eyes[i], 'pop'); if (!ee) return; gg.save(); gg.translate((ec - QM) * u, (er - QM) * u); gg.scale(ee.sc, ee.sc); qrEye(gg, 0, 0, u); gg.restore(); });
    gg.restore();
  });
}
function scene2b(g, t) {
  // QR + "OKUT."; 8'de QR telefona girerken küçülür
  if (t < T.out3 + 0.4) {
    const k = ks(t, T.phone + 0.17), shrink = k < 0 ? 0 : Math.min(1, (k + 1) / 3);
    const sw = sweep(t, T.out3, 1);
    if (!sw.gone || t < T.out3) {
      const yOut = t >= T.out3 ? [0, 80, 260, 600, 1100, 1700][Math.min(ks(t, T.out3), 5)] : 0;
      paperQR(g, t, QRP.x, lerp(QRP.y, 780, shrink) + yOut, lerp(QRP.s, 230, shrink));
    }
  }
  drawLetters(g, t, 'okut', 'OKUT.', 540, 1400, 150, 6, T.okut, T.out2);
}

/* ═════════ 3. GİRİŞ (8–14) ═════════ */
const PH = { x: 540, y: 830, w: 460, h: 940 };
function scene3(g, t) {
  if (t < T.phone || t > T.out3 + 0.5) return;
  const k = ks(t, T.phone), rise = [1300, 700, 260, 40, -10, 0][Math.min(k, 5)];
  const out = t >= T.out3 ? [0, 80, 260, 600, 1100, 1700][Math.min(ks(t, T.out3), 5)] : 0;
  piece(g, t, 400, PH.x, PH.y + rise + out, -0.03, {}, gg => {
    paperRect(gg, PH.w, PH.h, HK.ink, 0.4, 13, 1.3);
    gg.fillStyle = HK.paper; gg.beginPath(); gg.roundRect(-200, -430, 400, 860, 40); gg.fill();
    gg.fillStyle = HK.ink; gg.beginPath(); gg.roundRect(-60, -410, 120, 30, 15); gg.fill();
  });
}
function scene3Over(g, t) {
  if (t < T.brk[0] || t > T.out3 + 0.5) return;
  const out = t >= T.out3 ? [0, 80, 260, 600, 1100, 1700][Math.min(ks(t, T.out3), 5)] : 0;
  // adaçayı kâğıt köşeler
  const hw = 172, L = 60;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy], i) => {
    const e = enter(t, T.brk[i], 'pop'); if (!e) return;
    piece(g, t, 410 + i, 540 + sx * hw, 780 + sy * hw + out, 0, { sc: e.sc }, gg => {
      gg.save(); shadowOn(gg, 0.6); gg.fillStyle = HK.sage;
      gg.fillRect(sx < 0 ? -8 : -L + 8, sy < 0 ? -8 : -8, L, 18); gg.fillRect(-8, sy < 0 ? -8 : -L + 8, 18, L);
      gg.restore();
    });
  });
  // tarama şeridi
  const sp = prog(sq(t), T.scan0, T.scan1);
  if (sp > 0 && sp < 1) piece(g, t, 420, 540, lerp(630, 930, sp) + out, 0.02, {}, gg => {
    gg.save(); gg.globalAlpha = 0.85; paperRect(gg, 360, 30, HK.sage, 0.6, 21, 0.6); gg.restore(); });
  // onay rozeti
  const ck = enter(t, T.check, 'pop');
  if (ck) piece(g, t, 430, 720, 560 + out, 0.08, { sc: ck.sc }, gg => {
    gg.save(); shadowOn(gg, 0.8); gg.fillStyle = HK.sage; gg.beginPath(); gg.arc(0, 0, 70, 0, TAU); gg.fill(); gg.restore();
    checkMark(gg, 0, 2, 66, 14, HK.paper); });
  // ekranda karşılama (açılıştaki "Ali? 9:15 ??" notunun cevabı)
  const hi = enter(t, T.check + 0.5, 'slap');
  if (hi) piece(g, t, 435, 540, 1070 + out, -0.02, { sc: hi.sc, r: hi.r }, gg => {
    paperRect(gg, 330, 110, HK.mus, 0.5, 36, 0.7);
    text(gg, 'Günaydın, Ali!', 0, -2, { w: 900, s: 40, c: HK.ink }); text(gg, 'Tam vaktinde.', 0, 38, { f: 'Txt', w: 700, s: 26, c: HK.ink }); });
  // iple sallanan giriş etiketi
  if (t < T.out3) hangTag(g, t, 440, 870, 1130, 120, 300, 130, HK.sage, gg => {
    text(gg, 'GİRİŞ', 0, 4, { w: 900, s: 50, c: HK.paper }); text(gg, '08:57', 0, 50, { f: 'Txt', w: 700, s: 38, c: HK.paper }); }, T.tag, -0.18);
  strip(g, t, 450, 'Okuttun, girdin.', 330, 1475, 62, HK.paper, HK.ink, -0.03, T.okuttun, T.out3);
}

/* ═════════ 4. EKİP (14–18) ═════════ */
const PCOLS = [HK.terra, HK.mus, HK.sage, HK.blue, HK.paper, HK.ink];
const PEOPLE = (() => { const R = mulberry32(21), a = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) a.push({ x: 160 + i * 190 + (row % 2) * 60, y: 730 + row * 190, c: PCOLS[(i + row * 2) % 6], r: (R() - 0.5) * 0.15, id: 500 + row * 5 + i });
  const order = a.map((_, i) => i).sort(() => R() - 0.5);
  order.forEach((idx, k) => { a[idx].t = T.ppl0 + Math.round(k * 1.2) / STEP; a[idx].fall = T.out4 + (a[idx].x / 1080) * 0.35; });
  return a; })();
function scene4(g, t) {
  if (t < T.ppl0 || t > T.cal + 0.3) return;
  for (const p of PEOPLE) {
    const k = ks(t, p.t); if (k < 0) continue;
    // ayağa kalkar: dikey ölçek adım adım
    let sy = [0.25, 0.7, 1.08, 0.96, 1][Math.min(k, 4)];
    const kf = ks(t, p.fall); if (kf >= 0) sy *= [0.8, 0.45, 0.15, 0][Math.min(kf, 3)];
    if (sy <= 0.01) continue;
    piece(g, t, p.id, p.x, p.y + 85, p.r, {}, gg => {
      gg.scale(1, sy); gg.save(); shadowOn(gg, 0.7); person(gg, 0, -85, 170, p.c); gg.restore();
    });
  }
  // sayaç etiketi
  const ce = enter(t, T.counter, 'drop'), cs = sweep(t, T.out4);
  if (ce && !cs.gone) piece(g, t, 520, 540 + cs.dx, 420 + ce.dy, -0.03 + cs.r, { sc: ce.sc }, gg => {
    paperRect(gg, 560, 210, HK.paper, 0.6, 30);
    let ni = -1; T.nums.forEach((tn, i) => { if (sq(t) >= tn) ni = i; });
    const num = ['08', '21', '37', '45'][Math.max(0, ni)], pop = ni >= 0 && ks(t, T.nums[ni]) < 2 ? 1.12 : 1;
    gg.save(); gg.translate(-60, 0); gg.scale(pop, pop);
    paperRect(gg, 190, 150, ni >= 3 ? HK.sage : HK.mus, 0.4, 31 + Math.max(0, ni), 0.6);
    text(gg, num, 0, 46, { w: 900, s: 130, c: HK.ink }); gg.restore();
    text(gg, '/ 53', 130, 46, { w: 900, s: 96, c: HK.terra });
    text(gg, 'İÇERİDE', 0, 96, { f: 'Txt', w: 700, s: 26, ls: 8, c: HK.ink });
  });
  strip(g, t, 530, 'Ekip tamam mı?', 540, 1320, 70, HK.mus, HK.ink, 0.02, T.ekip, T.out4 + 0.1);
  strip(g, t, 531, 'Bir bakışta.', 560, 1450, 70, HK.paper, HK.ink, -0.03, T.bakis, T.out4 + 0.15);
}

/* ═════════ 5. PUANTAJ (18–24) ═════════ */
const LATE = new Set([3, 9, 15, 22, 28]);
const CAL = (() => { const off = (new Date(2026, 8, 1).getDay() + 6) % 7, c = [];
  for (let i = 0; i < 35; i++) { const d = i - off + 1; c.push({ i, d: d >= 1 && d <= 30 ? d : 0, we: i % 7 >= 5 }); }
  const work = c.filter(x => x.d && !x.we);
  work.forEach((x, k) => { x.t = T.stk0 + Math.round(k / work.length * (T.stk1 - T.stk0) * STEP) / STEP; });
  return c; })();
let IMPRINT = null;
function imprint() {
  if (IMPRINT) return IMPRINT;
  const c = canvas(720, 240), q = c.getContext('2d'); q.translate(360, 120);
  q.strokeStyle = HK.terra; q.lineWidth = 12; q.beginPath(); q.roundRect(-330, -90, 660, 180, 20); q.stroke();
  text(q, 'PUANTAJ HAZIR', 0, 34, { w: 900, s: 86, c: HK.terra });
  q.globalCompositeOperation = 'destination-out'; const R2 = mulberry32(5);
  for (let i = 0; i < 700; i++) { q.globalAlpha = 0.35 + R2() * 0.5; q.fillRect((R2() - 0.5) * 690, (R2() - 0.5) * 210, 2 + R2() * 5, 2 + R2() * 5); }
  return (IMPRINT = c);
}
function scene5(g, t) {
  if (t < T.cal || t > T.logo + 0.3) return;
  const e = enter(t, T.cal, 'drop'), sw = sweep(t, T.out5);
  if (sw.gone) return;
  const hit = ks(t, T.stampHit), jolt = hit >= 0 && hit < 2 ? [8, -4][hit] : 0;
  piece(g, t, 600, 540 + sw.dx, 860 + e.dy + jolt, 0.03 + sw.r, { sc: e.sc }, gg => {
    paperRect(gg, 860, 860, HK.paper, 0.7, 40, 1.2);
    text(gg, 'EYLÜL', -360, -330, { w: 900, s: 64, a: 'left', c: HK.ink });
    ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach((d, i) => text(gg, d, -330 + i * 110, -250, { f: 'Txt', w: 700, s: 24, c: 'rgba(28,27,25,0.6)' }));
    for (const c of CAL) {
      const x = -330 + (c.i % 7) * 110, y = -170 + Math.floor(c.i / 7) * 110;
      gg.strokeStyle = 'rgba(28,27,25,0.2)'; gg.lineWidth = 2; gg.strokeRect(x - 50, y - 46, 100, 92);
      if (!c.d) continue;
      text(gg, String(c.d), x - 40, y - 18, { f: 'Txt', w: 700, s: 20, a: 'left', c: HK.ink });
      if (c.t != null && sq(t) >= c.t) {
        const pk = ks(t, c.t), s = pk === 0 ? 1.3 : 1;
        gg.save(); gg.translate(x + 12 + (hash(c.d) - 0.5) * 6, y + 12); gg.scale(s, s); shadowOn(gg, 0.3);
        gg.fillStyle = LATE.has(c.d) ? HK.terra : HK.sage; gg.beginPath(); gg.arc(0, 0, 22, 0, TAU); gg.fill(); gg.restore();
      }
    }
    // lastik damga izi
    if (hit >= 0) { gg.save(); gg.translate(20, 100); gg.rotate(-0.25); gg.globalAlpha = 0.88; gg.drawImage(imprint(), -360, -120); gg.restore(); }
  });
  // damga: yukarıdan iner, vurur, kalkar
  const sk = ks(t, T.stampUp);
  if (sk >= 0 && sk < 16) {
    const ys = [-900, -620, -380, -220, -120, -60, 0, 0, -40, -160, -380, -700, -1100, -1500, -1900, -2300][sk];
    piece(g, t, 610, 560, 960 + ys, -0.25, {}, gg => {
      gg.save(); shadowOn(gg, 1.6);
      gg.fillStyle = '#A0522D'; gg.beginPath(); gg.roundRect(-60, -300, 120, 220, 30); gg.fill();
      gg.fillStyle = HK.mus; gg.beginPath(); gg.roundRect(-340, -100, 680, 70, 14); gg.fill();
      gg.fillStyle = HK.terra; gg.beginPath(); gg.roundRect(-330, -30, 660, 40, 8); gg.fill();
      gg.restore();
    });
  }
  strip(g, t, 620, 'Ay sonu? Hazır.', 540, 1460, 72, HK.mus, HK.ink, 0.02, T.aySonu, T.out5);
}

/* ═════════ 6. MARKA (24–30) ═════════ */
const LG = { x: 540, y: 570, s: 470 };
function scene6(g, t) {
  if (t < T.logo) return;
  const e = enter(t, T.logo, 'drop');
  piece(g, t, 700, LG.x, LG.y + e.dy, -0.02, { sc: e.sc }, gg => {
    paperRect(gg, LG.s, LG.s, HK.ink, 0.5, 50, 1.3);
    const k = LG.s / 512;
    gg.save(); gg.scale(k, k); gg.translate(-256, -256);
    gg.shadowColor = 'rgba(0,0,0,0.55)'; gg.shadowBlur = 8; gg.shadowOffsetX = 4; gg.shadowOffsetY = 7;
    // köşe parantezleri: dört ayrı kâğıt parça
    const L = 39, a = 116, b = 396;
    [[a, a, 1, 1], [b, a, -1, 1], [b, b, -1, -1], [a, b, 1, -1]].forEach(([x, y, sx, sy], i) => {
      const ee = enter(t, T.brkL[i], 'pop'); if (!ee) return;
      gg.save(); gg.translate(x, y); gg.scale(ee.sc, ee.sc);
      gg.strokeStyle = HK.paper; gg.lineWidth = 16; gg.lineCap = 'round'; gg.lineJoin = 'round';
      gg.beginPath(); gg.moveTo(0, sy * L); gg.lineTo(0, 0); gg.lineTo(sx * L, 0); gg.stroke(); gg.restore();
    });
    gg.restore();
    const pp = T.ppl.map((tp, i) => { const ee = enter(t, tp, 'pop'); return ee ? ee.sc : 0; });
    gg.save(); gg.shadowColor = 'rgba(0,0,0,0.55)'; gg.shadowBlur = 8; gg.shadowOffsetX = 4; gg.shadowOffsetY = 7;
    logo(gg, 0, 0, LG.s, { variant: 'light', brackets: 0, iconScale: 0, people: [pp[0], pp[2], pp[1]], sideCol: HK.grey, mainCol: HK.paper });
    gg.restore();
  });
  strip(g, t, 710, 'QR Personel', 540, 1010, 110, HK.paper, HK.ink, -0.02, T.word);
  const te = enter(t, T.tagline, 'slap');
  if (te) piece(g, t, 720, 540, 1102, 0, { sc: te.sc, amp: 0.5 }, gg => text(gg, 'QR kodla personel takibi', 0, 0, { f: 'Txt', w: 700, s: 46, c: HK.ink }));
  hangTag(g, t, 730, 540, 1135, 66, 600, 116, HK.terra, gg => text(gg, 'qrpersonel.com', 0, 20, { w: 900, s: 54, c: HK.paper }), T.url, -0.1);
  strip(g, t, 740, 'Hemen başlayın →', 540, 1478, 52, HK.mus, HK.ink, 0.03, T.cta);
}

/* ═════════ ana çizim ═════════ */
const HITS = [[0.17, 8], [T.split, 10], [T.card + 0.17, 8], [T.check, 5], [T.stampHit, 22], [T.logo + 0.17, 10]];
function camShake(t) {
  let x = 0, y = 0;
  for (const [t0, a] of HITS) { const k = ks(t, t0); if (k >= 0 && k < 3) { const m = a * [1, -0.6, 0.25][k]; x += m * (hash(t0) - 0.5) * 2; y += m; } }
  return [x, y];
}
function draw(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const [sx, sy] = camShake(t);
  bg(g, t);
  g.translate(sx, sy);
  if (t < T.phone + 0.5) scene1and2(g, t);
  if (t >= T.card - 0.01 && t < T.out3 + 0.6) { if (t >= T.phone) scene3(g, t); scene2b(g, t); scene3Over(g, t); }
  scene4(g, t); scene5(g, t); scene6(g, t);
}

/* ───────── ses ipuçları ───────── */
function buildCues() {
  const q = [], cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  cue(0.08, 'rustle', { dur: 0.3, gain: 0.5 }); cue(0.17, 'flop', { gain: 0.8 });
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  T.letters.forEach((t, i) => { cue(t, 'slap', { gain: 0.55, pan: -0.5 + i * 0.12 }); cue(t, 'glock', { semi: scale[i], gain: 0.22 }); });
  [T.ali, T.kart].forEach((t, i) => { cue(t, 'slap', { gain: 0.6, pan: i ? -0.5 : 0.5 }); cue(t, 'rustle', { dur: 0.15, gain: 0.3 }); });
  cue(T.clip, 'tink', { gain: 0.5, pan: -0.4 });
  for (let k = 0; k < 4; k++) cue(T.cut0 + k * 0.083, 'tick', { pitch: 0.8, gain: 0.12 });
  for (let k = 0; k < 6; k++) cue(T.cut1 + k * (T.scis1 - T.cut1) / 6, 'snip', { gain: 0.6, pan: -0.6 + k * 0.24 });
  cue(T.split, 'tear', { dur: 0.45, gain: 0.6 }); cue(T.split + 0.08, 'whoosh', { dur: 0.35, f0: 3000, f1: 400, gain: 0.3 });
  cue(T.card, 'rustle', { dur: 0.2, gain: 0.4 }); cue(T.card + 0.17, 'flop', { gain: 0.7 });
  for (let k = 0; k <= 10; k++) cue(T.mods0 + k * (T.mods1 - T.mods0) / 10, 'tap', { pitch: 1 + k * 0.05, gain: 0.25 });
  T.eyes.forEach((t, i) => cue(t, 'pop', { pitch: 0.8 + i * 0.2, gain: 0.45 }));
  T.okut.forEach((t, i) => { cue(t, 'slap', { gain: 0.6 }); cue(t, 'glock', { semi: [12, 14, 16, 19, 24][i], gain: 0.22 }); });
  cue(T.out2, 'whoosh', { dur: 0.3, f0: 800, f1: 3000, gain: 0.25 });
  cue(T.phone, 'whoosh', { dur: 0.35, f0: 300, f1: 2500, gain: 0.35 }); cue(T.phone + 0.25, 'flop', { gain: 0.6 });
  T.brk.forEach((t, i) => cue(t, 'tap', { pitch: 1.2 + i * 0.1, gain: 0.35, pan: [-0.3, 0.3, 0.3, -0.3][i] }));
  cue(T.scan0, 'sweep', { dur: T.scan1 - T.scan0, gain: 0.2 });
  cue(T.check, 'pop', { pitch: 1.2, gain: 0.5 }); cue(T.check + 0.02, 'success', { gain: 0.3 });
  cue(T.tag, 'swing', { gain: 0.3, pan: 0.4 }); cue(T.check + 0.5, 'slap', { gain: 0.4 }); cue(T.okuttun, 'slap', { gain: 0.55 });
  cue(T.out3, 'whoosh', { dur: 0.4, f0: 2500, f1: 300, gain: 0.3 });
  [...PEOPLE].sort((a, b) => a.t - b.t).forEach((p, k) => { cue(p.t, 'pop', { pitch: 0.8 + k * 0.04, gain: 0.3, pan: (p.x - 540) / 600 }); cue(p.t, 'glock', { semi: scale[k % 9], gain: 0.1 }); });
  cue(T.counter + 0.17, 'flop', { gain: 0.5 });
  T.nums.forEach((t, i) => cue(t, 'slap', { gain: 0.4 + i * 0.05 }));
  cue(T.ekip, 'slap', { gain: 0.55 }); cue(T.bakis, 'slap', { gain: 0.55 });
  cue(T.out4, 'whoosh', { dur: 0.45, f0: 2000, f1: 300, gain: 0.3 });
  cue(T.cal + 0.17, 'flop', { gain: 0.8 }); cue(T.cal, 'rustle', { dur: 0.25, gain: 0.4 });
  CAL.filter(c => c.t != null).forEach((c, k) => cue(c.t, 'tap', { pitch: LATE.has(c.d) ? 0.7 : 1.1 + (k % 5) * 0.08, gain: 0.18, pan: ((c.i % 7) - 3) / 4 }));
  cue(T.stampUp, 'whoosh', { dur: 0.45, f0: 400, f1: 1500, gain: 0.25 }); cue(T.stampHit, 'stamp', { gain: 1.0 });
  cue(T.aySonu, 'slap', { gain: 0.6 }); cue(T.out5, 'whoosh', { dur: 0.45, f0: 2000, f1: 300, gain: 0.3 });
  cue(T.logo + 0.17, 'flop', { gain: 0.9 });
  T.brkL.forEach((t, i) => cue(t, 'tap', { pitch: 1.3 + i * 0.1, gain: 0.35, pan: [-0.3, 0.3, 0.3, -0.3][i] }));
  T.ppl.forEach((t, i) => cue(t, 'pop', { pitch: [0.85, 1.0, 1.2][i], gain: 0.5, pan: [-0.4, 0.4, 0][i] }));
  cue(T.word, 'slap', { gain: 0.7 }); cue(T.tagline, 'rustle', { dur: 0.2, gain: 0.25 });
  cue(T.url, 'swing', { gain: 0.35, pan: -0.3 }); cue(T.cta, 'slap', { gain: 0.45 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────── kare üretimi ───────── */
const main = document.getElementById('c'), ctx = main.getContext('2d');
function renderFrame(f) { draw(ctx, f / FPS); }
function renderAt(t) { draw(ctx, t); }
window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  buildBG();
  window.CUES = buildCues(); window.FRAMES = FRAMES; window.FPS = FPS; window.DUR = DUR;
  window.renderFrame = renderFrame; window.renderAt = renderAt;
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  return true;
})();
