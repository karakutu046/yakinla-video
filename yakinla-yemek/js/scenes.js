'use strict';
/* Yakınla Yemek — sahneler.
 * Zaman çizelgesi T'de toplanır; dış sesin cümleleri bu anlara yerleştirilir (vo_plan.json).
 *   0–4    Kanca     servis kapağı açılır, yemekler fırlar: "Yakınla'da artık YEMEK siparişi de var!"
 *   4–12   Adımlar   telefonda: 1) restoranını seç 2) sepetini oluştur 3) kapına gelsin
 *   12–16  Lansman   "Yakınla Yemek" anahtarı açılır: "Afşin'de aktif edildi!"
 *   16–20  Kapanış   logo + "Yemek" etiketi, "Afiyet olsun!", mağazalar
 */
const T = {
  kick: 0.3, lidShake: 0.75, lidUp: 1.2, burst: 1.5,
  l1: 1.66, l2: 2.5, l3: 2.93, implode: 3.55, s2: 4.0,
  st1: 4.1, yemekTab: 4.6, tapRest: 6.0, open: 6.18,
  st2: 6.72, adds: [7.5, 8.0, 8.5], confirm: 9.0,
  st3: 9.32, ride0: 9.6, ride1: 11.0, wipe3: 11.62,
  s3: 12.0, title3: 12.1, toggle: 13.0, afsin: 13.3, aktif: 14.0, wipe4: 15.62,
  s4: 16.0, word: 16.5, slogan: 17.0, tag: 17.2, stores: 17.8, url: 18.2,
};
// Dış ses (ElevenLabs, Dilara): kaynak kayıttaki cümle aralıkları [src0, src1] → videodaki başlangıç
// Sınırlar build/vo/dis_ses.wav'ın enerji eğrisindeki sessizliklerden ölçüldü.
const VO = [
  { at: 0.35, src: [0.02, 0.88] },   // Müjde Afşin!
  { at: 1.57, src: [1.14, 3.20] },   // Yakınla'da artık yemek siparişi de var!  ("yemek" kaynakta 2.07 → 2.50)
  { at: 4.20, src: [3.58, 5.60] },   // Telefondan bölgendeki restoranı seç,
  { at: 6.82, src: [5.80, 6.70] },   // sepetini oluştur,
  { at: 9.42, src: [6.92, 8.13] },   // yemeğin kapına gelsin!
  { at: 12.15, src: [8.44, 9.22] },  // Yakınla Yemek,
  { at: 13.27, src: [9.36, 10.64] }, // Afşin'de aktif edildi!  ("aktif" kaynakta 10.09 → 14.00)
  { at: 17.02, src: [10.88, 11.72] }, // Afiyet olsun!
];

/* ───────────── ortak katmanlar ───────────── */
const BOKEH = (() => {
  const r = mulberry32(17), a = [];
  for (let i = 0; i < 42; i++) a.push({ x: r() * W, y: r() * H, r: 8 + Math.pow(r(), 2) * 70, warm: r() < 0.55, a: 0.05 + r() * 0.22, sp: 6 + r() * 26, ph: r() * TAU });
  return a;
})();
function bokeh(g, t, alpha = 1, warmOnly = false) {
  for (const b of BOKEH) {
    if (warmOnly && !b.warm) continue;
    const y = ((b.y - t * b.sp) % (H + 200) + H + 200) % (H + 200) - 100;
    const a = alpha * b.a * (0.7 + 0.3 * Math.sin(t * 1.3 + b.ph));
    glow(g, b.warm ? SPR.softAmber : SPR.softBlue, b.x + Math.sin(t * 0.4 + b.ph) * 20, y, b.r, a);
  }
}
function rays(g, x, y, t, n, col, a, len = 1800, w = 0.09, speed = 0.12) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(t * speed); g.globalAlpha *= a;
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, len);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  for (let i = 0; i < n; i++) {
    g.rotate(TAU / n);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-w) * len, Math.sin(-w) * len); g.lineTo(Math.cos(w) * len, Math.sin(w) * len); g.closePath(); g.fill();
  }
  g.restore();
}
function shockwave(g, x, y, t, t0, rmax, col = '255,255,255', lw = 18, dur = 0.55) {
  const p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  g.strokeStyle = `rgba(${col},${0.85 * (1 - p)})`; g.lineWidth = lw * (1 - p) + 1.5;
  g.beginPath(); g.arc(x, y, 20 + E.outCubic(p) * rmax, 0, TAU); g.stroke();
}
function makeConfetti(seed, n, cols, sp0 = 700, sp1 = 1700) {
  const r = mulberry32(seed), a = [];
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, sp = sp0 + r() * (sp1 - sp0);
    a.push({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 500, rot: r() * TAU, vr: (r() - 0.5) * 20, s: 10 + r() * 14, c: cols[i % cols.length], k: r() < 0.4 ? 0 : r() < 0.7 ? 1 : 2, ph: r() * TAU });
  }
  return a;
}
function confetti(g, list, t, t0, x0, y0, life = 1.8) {
  const a = t - t0; if (a <= 0 || a > life) return;
  for (const c of list) {
    const dmp = Math.exp(-a * 1.7);
    const x = x0 + c.vx * (1 - dmp) / 1.7 + Math.sin(a * 6 + c.ph) * 14, y = y0 + c.vy * (1 - dmp) / 1.7 + 520 * a * a;
    const al = clamp((life - a) / 0.5); if (al <= 0) continue;
    g.save(); g.globalAlpha *= al; g.translate(x, y); g.rotate(c.rot + c.vr * a); g.fillStyle = c.c;
    if (c.k === 0) { g.beginPath(); g.arc(0, 0, c.s * 0.42, 0, TAU); g.fill(); }
    else if (c.k === 1) { g.scale(1, Math.cos(a * 9 + c.ph)); g.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); }
    else { g.strokeStyle = c.c; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-c.s / 2, 0); g.quadraticCurveTo(0, -c.s / 2, c.s / 2, 0); g.stroke(); }
    g.restore();
  }
}
// Sıcak gradyanlı, hacimli büyük başlık (YEMEK, aktif edildi!)
function heroWord(g, s, x, y, o, depth = 12) {
  setFont(g, o); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round';
  for (let d = depth; d >= 1; d--) { // ekstrüzyon
    g.fillStyle = d === depth ? 'rgba(0,0,0,0.25)' : (o.ext || '#B4480C');
    g.fillText(s, x + d * 0.35, y + d);
  }
  // ince açık kenar: önce kontur, sonra dolgu → değişken fontun iç kontur çakışmaları görünmez
  g.strokeStyle = 'rgba(255,240,200,0.55)'; g.lineWidth = Math.max(3, o.s * 0.022);
  g.strokeText(s, x, y);
  g.fillStyle = lg(g, 0, y - o.s * 0.75, 0, y, o.grad || [[0, '#FFE58A'], [0.5, '#FFB547'], [1, '#FF7A1A']]);
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
}
function pill(g, x, y, w, h, fill, shadow = 'rgba(0,10,40,0.35)') {
  g.save(); g.shadowColor = shadow; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = fill; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.restore();
  g.save(); g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.clip();
  g.fillStyle = lg(g, 0, y - h / 2, 0, y + h / 2, [[0, 'rgba(255,255,255,0.45)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.08)']]);
  g.fillRect(x - w / 2, y - h / 2, w, h); g.restore();
}

/* ───────────── 1. KANCA (0–4) ───────────── */
const PLATE = { x: 540, y: 1062, sc: 5.2 };
const FOODS = [ // ad, hedef x, y, ölçek, açı, gecikme
  ['pizza', 215, 640, 2.25, -0.22, 0.04],
  ['durum', 868, 630, 2.4, 0.12, 0.08],
  ['fries', 540, 520, 1.9, 0.0, 0.0],
  ['kebap', 178, 975, 2.35, 0.1, 0.12],
  ['drink', 905, 965, 2.15, 0.08, 0.06],
];
const HERO_Y = 905, HERO_SC = 3.9;
const CONF1 = makeConfetti(41, 34, ['#FFD36B', '#FFFFFF', '#FF7A1A', '#9CC2FF', '#FF4D5E']);

function bgHook(g, t) {
  g.fillStyle = rg(g, 540, 940, 1350, [[0, '#14347A'], [0.45, '#0A1C47'], [1, '#030918']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  const sp = E.outCubic(prog(t, 0, 0.7));
  g.save(); g.globalAlpha = sp;
  g.fillStyle = lg(g, 0, -100, 0, 1180, [[0, 'rgba(255,214,150,0)'], [0.2, 'rgba(255,214,150,0.10)'], [1, 'rgba(255,214,150,0)']]);
  g.beginPath(); g.moveTo(420, -100); g.lineTo(660, -100); g.lineTo(1010, 1180); g.lineTo(70, 1180); g.closePath(); g.fill();
  g.restore();
  glow(g, SPR.amber, PLATE.x, PLATE.y - 60, 760, 0.3 * sp);
  bokeh(g, t, sp);
}

function scene1(g, t) {
  bgHook(g, t);
  const imp = E.inCubic(prog(t, T.implode, T.implode + 0.32)); // merkeze çekilme
  const IC = [540, 1235];
  // ışık patlaması
  const bp = prog(t, T.burst - 0.1, T.burst + 1.6);
  if (bp > 0) {
    const ba = E.outCubic(prog(t, T.burst - 0.1, T.burst + 0.15)) * (1 - 0.6 * E.inCubic(bp)) * (1 - imp);
    rays(g, 540, HERO_Y + 40, t, 14, 'rgba(255,214,140,0.22)', ba, 1500, 0.07, 0.18);
    glow(g, SPR.amber, 540, HERO_Y, 900 * lerp(0.5, 1, E.outCubic(prog(t, T.burst - 0.1, T.burst + 0.3))), 0.5 * ba);
    glow(g, SPR.white, 540, HERO_Y, 520, 0.6 * kick(t - T.burst + 0.05, 5) * (t > T.burst - 0.05 ? 1 : 0));
  }
  shockwave(g, 540, HERO_Y + 40, t, T.burst - 0.05, 900, '255,220,160', 24, 0.6);

  // tabak
  const app = spring(t - 0.05, 1.6, 6.5);
  const plateA = clamp(app * 1.5) * (1 - imp);
  if (plateA > 0) {
    g.save(); g.globalAlpha *= plateA;
    g.translate(0, (1 - app) * 140 + imp * 60);
    contactShadow(g, PLATE.x, PLATE.y + 50, 330, 0.45);
    icon(g, 'plate', PLATE.x, PLATE.y, PLATE.sc * lerp(0.85, 1, app));
    g.restore();
  }
  // yemekler: kahraman burger tabağın üstünde, diğerleri yörüngeye fırlar
  if (t >= T.burst - 0.12) {
    const hp = spring(t - (T.burst - 0.12), 1.4, 6.5);
    const bob = Math.sin((t - T.burst) * 2.2) * 8;
    let x = 540, y = lerp(PLATE.y - 30, HERO_Y, clamp(hp)) + bob, s = HERO_SC * hp;
    x = lerp(x, IC[0], imp); y = lerp(y, IC[1], imp); s *= 1 - 0.85 * imp;
    // buhar
    for (let k = 0; k < 4; k++) steam(g, t, x - 80 + k * 52, y - 150, k, (1 - imp) * clamp((t - T.burst) * 2));
    icon(g, 'burger', x, y, s, Math.sin((t - T.burst) * 1.7) * 0.03 + imp * 1.5);
    if (t > T.burst + 0.4) twinkle(g, x - 95 * s / HERO_SC, y - 120 * s / HERO_SC, 30 * (1 - imp), Math.max(0, Math.sin((t - T.burst - 0.4) * 2.4)), t);
  }
  FOODS.forEach(([n, tx, ty, sc, r0, d], i) => {
    const t0 = T.burst - 0.06 + d;
    if (t < t0) return;
    const p = prog(t, t0, t0 + 0.5), e = E.outBack(p);
    const sx = 540, sy = HERO_Y + 40;
    const cx = (sx + tx) / 2 + (tx < 540 ? -120 : 120), cy = Math.min(sy, ty) - 260;
    const ee = E.outCubic(p);
    let x = bez2(sx, cx, tx, ee), y = bez2(sy, cy, ty, ee);
    const fl = Math.sin((t - t0) * 1.9 + i * 1.3) * 12;
    let s = sc * lerp(0.2, 1, e), rot = r0 + (1 - E.outCubic(p)) * (i % 2 ? 2.2 : -2.2) + Math.sin(t * 1.3 + i) * 0.05;
    y += fl;
    const ip = clamp(imp * 1.15 - i * 0.03);
    x = lerp(x, IC[0], E.inCubic(ip)); y = lerp(y, IC[1], E.inCubic(ip)); s *= 1 - 0.9 * ip; rot += ip * 3;
    icon(g, n, x, y, s, rot);
    if (p > 0.6 && i % 2 === 0) twinkle(g, x + 60 * sc / 2.2, y - 70 * sc / 2.2, 22 * (1 - ip), Math.max(0, Math.sin((t - t0) * 2.6 - 1)), -t);
  });
  confetti(g, CONF1, t, T.burst, 540, HERO_Y - 40, 1.7);

  // servis kapağı: titrer, sonra kalkıp uçar
  if (t < T.lidUp + 0.6) {
    const shake = t > T.lidShake && t < T.lidUp ? Math.sin((t - T.lidShake) * 48) * 0.045 * Math.sin(prog(t, T.lidShake, T.lidUp) * Math.PI) : 0;
    const hop = t > T.lidShake && t < T.lidUp ? Math.abs(Math.sin((t - T.lidShake) * 24)) * 10 : 0;
    const up = E.inCubic(prog(t, T.lidUp, T.lidUp + 0.5));
    const ant = t > T.lidUp - 0.12 && t < T.lidUp ? Math.sin(prog(t, T.lidUp - 0.12, T.lidUp) * Math.PI) : 0;
    const ly = PLATE.y - 21 * PLATE.sc + 6 + (1 - app) * 140 - hop - up * 1500 + ant * 14;
    g.save(); g.globalAlpha *= clamp(app * 1.5);
    // kapak altından kaçan buhar/ışık
    if (t > T.lidShake) glow(g, SPR.amber, PLATE.x, PLATE.y - 10, 300 + 200 * prog(t, T.lidShake, T.lidUp), 0.35 * (1 - up));
    g.translate(PLATE.x, ly + 21 * PLATE.sc); g.rotate(shake - up * 0.6); g.scale(1 + ant * 0.05, 1 - ant * 0.06); g.translate(-PLATE.x, -(ly + 21 * PLATE.sc));
    icon(g, 'lid', PLATE.x, ly, PLATE.sc * lerp(0.85, 1, app));
    const gl = prog(t, 0.55, 1.0); // kapakta parıltı
    if (gl > 0 && gl < 1) twinkle(g, PLATE.x - 120, ly - 70, 44 * Math.sin(gl * Math.PI), 1, gl * 2);
    g.restore();
  }

  // üst hap: MÜJDE AFŞİN!
  const kp = spring(t - T.kick, 1.8, 7);
  const kq = E.inBack(prog(t, T.implode - 0.08, T.implode + 0.2));
  if (kp > 0 && kq < 1) {
    g.save(); g.translate(540, 330 - kq * 500); g.scale(kp, kp); g.rotate((1 - clamp(kp)) * -0.1);
    const o = { w: 900, s: 62, ls: 5 };
    const tw = measure(g, 'MÜJDE AFŞİN!', o);
    pill(g, 0, 0, tw + 110, 112, lg(g, 0, -56, 0, 56, [[0, '#FFD36B'], [1, '#FF9B2F']]), 'rgba(255,140,30,0.45)');
    text(g, 'MÜJDE AFŞİN!', 3, 22, { ...o, c: '#3A1A00' });
    g.restore();
    for (const [dx, dy, tt] of [[-300, -40, 0.15], [310, 30, 0.3], [-250, 70, 0.5], [270, -60, 0.65]]) {
      const a = Math.sin(prog(t, T.kick + tt, T.kick + tt + 0.7) * Math.PI);
      twinkle(g, 540 + dx, 330 + dy - kq * 500, 26, a, t);
    }
  }

  // alt yazı bloğu
  const out = E.inBack(prog(t, T.implode - 0.06, T.implode + 0.26));
  g.save(); g.translate(0, out * 700); g.globalAlpha *= 1 - clamp(out * 1.4 - 0.4);
  slotText(g, "Yakınla'da artık", 540, 1300, { w: 700, s: 82, c: 'rgba(255,255,255,0.92)' }, prog(t, T.l1, T.l1 + 0.5), 0, 0.03);
  const sl = slam(t, T.l2, 2.8);
  if (sl) {
    g.save(); g.globalAlpha *= sl.al;
    g.translate(540, 1480); g.scale(sl.sc, sl.sc); g.translate(-540, -1480);
    glow(g, SPR.amber, 540, 1460, 560, 0.35 * sl.al);
    heroWord(g, 'YEMEK', 540, 1575, fit(g, 'YEMEK', { w: 900, s: 290, ls: 4 }, 940), 14);
    g.restore();
  }
  slotText(g, 'siparişi de var!', 540, 1725, { w: 800, s: 104, c: '#fff' }, prog(t, T.l3, T.l3 + 0.5), 0, 0.03);
  g.restore();

  // birleşme parlaması → telefon
  const fl = kick(t - (T.s2 - 0.06), 9) * (t > T.s2 - 0.06 ? 1 : 0) + E.inCubic(prog(t, T.implode + 0.12, T.s2 - 0.04));
  if (fl > 0.01) { glow(g, SPR.white, IC[0], IC[1], 260 + 300 * fl, clamp(fl)); }
}
function steam(g, t, x, y, k, a) { // buhar: kıvrımlı yol boyunca yumuşak ışık lekeleri (filtre yok, hızlı)
  if (a <= 0) return;
  for (let j = 0; j < 2; j++) {
    const ph = ((t * 0.8 + k * 0.37 + j * 0.5) % 1);
    const yy = y - ph * 120, al = Math.sin(ph * Math.PI) * a * 0.16;
    const sx = Math.sin(t * 2 + k) * 8;
    for (let i = 0; i <= 8; i++) {
      const u = i / 8, v = 1 - u;
      const px = v * v * v * x + 3 * v * v * u * (x - 18) + 3 * v * u * u * (x + 18) + u * u * u * (x + sx);
      const py = v * v * v * (yy + 30) + 3 * v * v * u * (yy + 10) + 3 * v * u * u * (yy - 10) + u * u * u * (yy - 30);
      glow(g, SPR.white, px, py, 16 * (1 - ph * 0.4), al);
    }
  }
}

/* ───────────── 2. ADIMLAR: telefon (4–12) ───────────── */
const PH = { x: 540, y: 1235, s: 0.86, W: 560, H: 1140, bz: 15, r: 86 };
PH.SW = PH.W - 2 * PH.bz; PH.SH = PH.H - 2 * PH.bz;
const SW = PH.SW, SH = PH.SH;

function phoneXf(t) {
  const a = t - T.s2;
  const em = spring(a, 1.35, 6.5);
  const fy = Math.sin(a * 1.6) * 8, rot = -0.028 + 0.018 * Math.sin(a * 1.1);
  return { x: PH.x, y: PH.y + fy, rot: rot + (1 - clamp(em)) * 0.35, s: PH.s * lerp(0.1, 1, em) };
}
function phoneToWorld(xf, sx, sy) {
  const lx = (sx - SW / 2) * xf.s, ly = (sy - SH / 2) * xf.s, c = Math.cos(xf.rot), s = Math.sin(xf.rot);
  return [xf.x + lx * c - ly * s, xf.y + lx * s + ly * c];
}
function drawPhone(g, t, xf, screenFn) {
  const w = PH.W, h = PH.H;
  g.save(); g.translate(xf.x, xf.y); g.rotate(xf.rot); g.scale(xf.s, xf.s);
  g.save(); g.shadowColor = 'rgba(0,12,50,0.55)'; g.shadowBlur = 80; g.shadowOffsetY = 46;
  g.fillStyle = '#000'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, PH.r); g.fill(); g.restore();
  g.fillStyle = '#5D6B85'; // yan tuşlar
  g.beginPath(); g.roundRect(-w / 2 - 5, -h / 2 + 230, 8, 64, 3); g.roundRect(-w / 2 - 5, -h / 2 + 320, 8, 110, 3); g.roundRect(w / 2 - 3, -h / 2 + 290, 8, 150, 3); g.fill();
  g.fillStyle = lg(g, -w / 2, 0, w / 2, 0, [[0, '#1C2438'], [0.03, '#A9B6CE'], [0.08, '#46536E'], [0.5, '#2B354B'], [0.92, '#46536E'], [0.97, '#A9B6CE'], [1, '#1C2438']]);
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, PH.r); g.fill();
  g.fillStyle = '#04060B'; g.beginPath(); g.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, PH.r - 5); g.fill();
  const sr = PH.r - PH.bz;
  g.save(); g.beginPath(); g.roundRect(-SW / 2, -SH / 2, SW, SH, sr); g.clip();
  g.translate(-SW / 2, -SH / 2);
  screenFn(g, t);
  g.restore();
  g.fillStyle = '#000'; g.beginPath(); g.roundRect(-74, -SH / 2 + 16, 148, 42, 21); g.fill();
  g.fillStyle = '#1A2234'; g.beginPath(); g.arc(46, -SH / 2 + 37, 9, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.roundRect(-SW / 2, -SH / 2, SW, SH, sr); g.clip();
  g.fillStyle = lg(g, -w / 2, -h / 2, w / 2, h / 2, [[0, 'rgba(255,255,255,0.13)'], [0.32, 'rgba(255,255,255,0.03)'], [0.33, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']]);
  g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  g.restore();
}
function shadowCard(g, x, y, w, h, r, a = 0.1, fill = '#fff') {
  g.save(); g.shadowColor = `rgba(11,27,51,${a})`; g.shadowBlur = 26; g.shadowOffsetY = 10;
  g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore();
}
function finger(g, x, y, press, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = `rgba(11,27,51,${0.2 + 0.14 * press})`; g.beginPath(); g.arc(x, y, 42 - press * 9, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 5; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
  g.restore();
}
function ripple(g, x, y, t, t0, col = '31,115,240') {
  const dt = t - t0; if (dt < 0 || dt > 0.45) return;
  g.strokeStyle = `rgba(${col},${0.55 * (1 - dt / 0.45)})`; g.lineWidth = 6;
  g.beginPath(); g.arc(x, y, 26 + dt * 260, 0, TAU); g.stroke();
}
function statusBar(g, dark = true) {
  const c = dark ? C.ink : '#fff';
  text(g, '19:42', 48, 46, { f: 'Txt', w: 600, s: 23, a: 'left', c });
  g.fillStyle = c;
  for (let i = 0; i < 4; i++) g.fillRect(SW - 150 + i * 8, 40 - i * 4, 5.5, 6 + i * 4);
  g.globalAlpha *= 0.4; g.beginPath(); g.roundRect(SW - 92, 28, 40, 19, 6); g.fill(); g.globalAlpha /= 0.4;
  g.beginPath(); g.roundRect(SW - 89, 31, 30, 13, 4); g.fill(); g.fillRect(SW - 50, 34, 3, 8);
}

const RESTS = [
  ['burger', 'Burgerci', 'Burger · Patates · İçecek', ['#FFE7BF', '#FFB866']],
  ['kebap', 'Kebapçı', 'Kebap · Dürüm · Lahmacun', ['#FFD7CC', '#FF9C7E']],
  ['pizza', 'Pizzacı', 'Pizza · Makarna', ['#FFF2BF', '#FFCC55']],
  ['durum', 'Dürümcü', 'Dürüm · Döner', ['#DCEBFF', '#9CC2FF']],
];
const CARD = { x: 24, y0: 362, h: 164, gap: 14 };
const cardY = i => CARD.y0 + i * (CARD.h + CARD.gap);

function screen1(g, t) {
  g.fillStyle = '#F6F8FC'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, 300);
  statusBar(g);
  const hd = E.outExpo(prog(t, T.st1, T.st1 + 0.5));
  g.save(); g.globalAlpha *= hd; g.translate(0, (1 - hd) * -30);
  miconAt(g, 'pin', 44, 104, 30, C.blue, 0);
  text(g, 'Teslimat adresi', 70, 92, { f: 'Txt', w: 500, s: 19, a: 'left', c: C.inkSoft });
  text(g, 'Ev · Afşin', 70, 124, { f: 'Txt', w: 700, s: 27, a: 'left', c: C.ink });
  miconAt(g, 'chev', 70 + measure(g, 'Ev · Afşin', { f: 'Txt', w: 700, s: 27 }) + 18, 113, 30, C.ink, 8);
  g.fillStyle = C.tile; g.beginPath(); g.arc(SW - 56, 104, 30, 0, TAU); g.fill();
  miconAt(g, 'bag', SW - 56, 106, 34, C.ink, 7);
  g.restore();
  // Market | Yemek seçici
  const sg = E.outExpo(prog(t, T.st1 + 0.1, T.st1 + 0.6));
  g.save(); g.globalAlpha *= sg; g.translate(0, (1 - sg) * 30);
  const sx = 24, sy = 152, sw = SW - 48, sh = 64, half = sw / 2;
  g.fillStyle = '#EEF2F8'; g.beginPath(); g.roundRect(sx, sy, sw, sh, 32); g.fill();
  const mv = E.inOutCubic(prog(t, T.yemekTab, T.yemekTab + 0.35));
  const px = sx + 5 + mv * half, pw = half - 10;
  g.save(); g.shadowColor = 'rgba(11,27,51,0.15)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
  g.fillStyle = mv > 0.5 ? lg(g, 0, sy, 0, sy + sh, [[0, '#FFA445'], [1, '#FF6A1A']]) : '#fff';
  g.beginPath(); g.roundRect(px, sy + 5, pw, sh - 10, 27); g.fill(); g.restore();
  text(g, 'Market', sx + half / 2, sy + 42, { f: 'Txt', w: 700, s: 24, c: mv < 0.5 ? C.ink : C.inkSoft });
  text(g, 'Yemek', sx + half * 1.5, sy + 42, { f: 'Txt', w: 700, s: 24, c: mv > 0.5 ? '#fff' : C.inkSoft });
  const nb = E.outBack(prog(t, T.yemekTab + 0.25, T.yemekTab + 0.55));
  if (nb > 0) {
    g.save(); g.translate(sx + sw - 34, sy + 2); g.scale(nb, nb); g.rotate(0.12);
    g.fillStyle = C.red; g.beginPath(); g.roundRect(-38, -17, 76, 34, 17); g.fill();
    text(g, 'YENİ', 0, 8, { f: 'Txt', w: 700, s: 18, c: '#fff', ls: 1 });
    g.restore();
  }
  // arama
  g.fillStyle = C.tile; g.beginPath(); g.roundRect(24, 232, SW - 48, 56, 28); g.fill();
  miconAt(g, 'search', 58, 259, 26, '#8A97AD', 8);
  text(g, 'Restoran veya yemek ara', 84, 268, { f: 'Txt', w: 500, s: 22, a: 'left', c: '#8A97AD' });
  g.restore();
  // liste
  const lt = E.outExpo(prog(t, T.yemekTab + 0.2, T.yemekTab + 0.6));
  if (lt > 0) {
    g.save(); g.globalAlpha *= lt;
    text(g, 'Bölgendeki restoranlar', 24, 338, { f: 'Txt', w: 700, s: 27, a: 'left', c: C.ink });
    g.fillStyle = '#E8F0FE'; g.beginPath(); g.roundRect(SW - 116, 312, 92, 36, 18); g.fill();
    miconAt(g, 'pin', SW - 96, 330, 18, C.blue, 0);
    text(g, 'Afşin', SW - 64, 337, { f: 'Txt', w: 600, s: 19, c: C.blue });
    g.restore();
  }
  RESTS.forEach(([ic, name, tags, bg], i) => {
    const t0 = T.yemekTab + 0.3 + i * 0.08, p = prog(t, t0, t0 + 0.45);
    if (p <= 0) return;
    const e = E.outExpo(p), y = cardY(i) + (1 - e) * 120;
    const press = i === 0 ? kick(t - T.tapRest, 12) * (t > T.tapRest ? 1 : 0) : 0;
    g.save(); g.globalAlpha *= clamp(p * 2.5);
    g.translate(SW / 2, y + CARD.h / 2); g.scale(1 - press * 0.035, 1 - press * 0.035); g.translate(-SW / 2, -(y + CARD.h / 2));
    shadowCard(g, CARD.x, y, SW - 48, CARD.h, 28, 0.09);
    g.fillStyle = lg(g, 0, y + 14, 0, y + 150, [[0, bg[0]], [1, bg[1]]]);
    g.beginPath(); g.roundRect(CARD.x + 14, y + 14, 136, 136, 22); g.fill();
    glow(g, SPR.white, CARD.x + 82, y + 70, 70, 0.5);
    icon(g, ic, CARD.x + 82, y + 84, ic === 'kebap' ? 1.15 : 1.0, ic === 'kebap' ? 0.25 : 0);
    text(g, name, CARD.x + 172, y + 58, { f: 'Txt', w: 700, s: 29, a: 'left', c: C.ink });
    text(g, tags, CARD.x + 172, y + 92, { f: 'Txt', w: 500, s: 19.5, a: 'left', c: C.inkSoft });
    g.fillStyle = '#FFF1DE'; g.beginPath(); g.roundRect(CARD.x + 172, y + 110, 84, 32, 16); g.fill();
    miconAt(g, 'star', CARD.x + 192, y + 126, 22, C.amberD, 0);
    text(g, 'Yeni', CARD.x + 226, y + 133, { f: 'Txt', w: 700, s: 18, c: '#B86A00' });
    miconAt(g, 'heart', SW - 62, y + 40, 26, '#B5C0D3', 7);
    g.restore();
    if (i === 0) {
      const hl = kick(t - T.tapRest, 5) * (t > T.tapRest ? 1 : 0);
      if (hl > 0.01) { g.strokeStyle = `rgba(31,115,240,${hl * 0.8})`; g.lineWidth = 5; g.beginPath(); g.roundRect(CARD.x, y, SW - 48, CARD.h, 28); g.stroke(); }
    }
  });
}

const MENU = [
  ['burger', 'Klasik Burger', 'Cheddar, marul, domates'],
  ['fries', 'Patates Kızartması', 'Çıtır çıtır, altın sarısı'],
  ['drink', 'Soğuk İçecek', 'Buz gibi serinlik'],
];
const ITEM = { y0: 556, h: 150 };
const itemY = i => ITEM.y0 + i * ITEM.h;
const plusXY = i => [SW - 62, itemY(i) + 70];
const BTN = { y: SH - 120, h: 94 };
const bagXY = () => [24 + 56, BTN.y + BTN.h / 2];
function cartN(t) { let n = 0; for (const a of T.adds) if (t >= a + 0.42) n++; return n; }

function screen2(g, t) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH);
  // kahraman bant
  g.fillStyle = lg(g, 0, 0, 0, 410, [[0, '#FFC062'], [1, '#FF7A1A']]); g.fillRect(0, 0, SW, 410);
  rays(g, SW / 2, 240, t, 12, 'rgba(255,255,255,0.22)', 1, 600, 0.08, 0.25);
  glow(g, SPR.white, SW / 2, 240, 260, 0.45);
  statusBar(g, false);
  const hp = E.outBack(prog(t, T.open + 0.1, T.open + 0.55));
  for (let k = 0; k < 3; k++) steam(g, t, SW / 2 - 60 + k * 60, 120, k, hp);
  icon(g, 'burger', SW / 2, 245 + Math.sin(t * 2.4) * 5, 2.6 * hp, Math.sin(t * 1.7) * 0.03);
  for (const [x, ic] of [[52, 'back'], [SW - 52, 'heart']]) {
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(x, 96, 28, 0, TAU); g.fill();
    miconAt(g, ic, x, ic === 'heart' ? 98 : 96, ic === 'heart' ? 26 : 30, C.ink, 7);
  }
  // bilgi kartı
  shadowCard(g, 24, 352, SW - 48, 132, 28, 0.12);
  text(g, 'Burgerci', 52, 410, { f: 'Txt', w: 700, s: 36, a: 'left', c: C.ink });
  text(g, 'Burger · Patates · İçecek', 52, 448, { f: 'Txt', w: 500, s: 20, a: 'left', c: C.inkSoft });
  g.fillStyle = '#FFF1DE'; g.beginPath(); g.roundRect(SW - 136, 386, 88, 34, 17); g.fill();
  miconAt(g, 'star', SW - 114, 403, 22, C.amberD, 0);
  text(g, 'Yeni', SW - 80, 410, { f: 'Txt', w: 700, s: 18, c: '#B86A00' });
  text(g, 'Menü', 24, 532, { f: 'Txt', w: 700, s: 28, a: 'left', c: C.ink });
  MENU.forEach(([ic, name, desc], i) => {
    const t0 = T.open + 0.25 + i * 0.07, p = E.outExpo(prog(t, t0, t0 + 0.45));
    if (p <= 0) return;
    const y = itemY(i) + (1 - p) * 80;
    g.save(); g.globalAlpha *= p;
    g.fillStyle = '#FFF4E3'; g.beginPath(); g.roundRect(24, y + 14, 112, 112, 22); g.fill();
    const tap = T.adds[i], gone = t > tap ? 1 - 0.7 * prog(t, tap, tap + 0.04) * (1 - prog(t, tap + 0.42, tap + 0.62)) : 1;
    icon(g, ic, 80, y + 72, 0.92, 0, gone);
    text(g, name, 156, y + 62, { f: 'Txt', w: 700, s: 26, a: 'left', c: C.ink });
    text(g, desc, 156, y + 96, { f: 'Txt', w: 500, s: 19.5, a: 'left', c: C.inkSoft });
    const [bx, by] = plusXY(i), done = t > tap + 0.05;
    const pr = kick(t - tap, 14) * (t > tap ? 1 : 0), pop = done ? 1 + 0.25 * kick(t - tap - 0.05, 8) : 1;
    g.save(); g.translate(bx, by - itemY(i) + y); g.scale((1 - pr * 0.25) * pop, (1 - pr * 0.25) * pop);
    g.shadowColor = 'rgba(31,115,240,0.35)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
    g.fillStyle = done ? lg(g, 0, -28, 0, 28, [[0, '#4ADE80'], [1, '#16A34A']]) : lg(g, 0, -28, 0, 28, [[0, '#4C97FF'], [1, '#0E5FE0']]);
    g.beginPath(); g.arc(0, 0, 28, 0, TAU); g.fill(); g.shadowColor = 'transparent';
    miconAt(g, done ? 'check' : 'plus', 0, 0, 34, '#fff', 11);
    g.restore();
    if (i < 2) { g.fillStyle = C.line; g.fillRect(156, y + ITEM.h - 2, SW - 180, 2); }
    g.restore();
  });
  // alt sepet çubuğu
  const cb = E.outExpo(prog(t, T.adds[0] + 0.3, T.adds[0] + 0.62));
  if (cb > 0) {
    g.save(); g.translate(0, (1 - cb) * 200);
    g.save(); g.shadowColor = 'rgba(11,27,51,0.14)'; g.shadowBlur = 30; g.shadowOffsetY = -8;
    g.fillStyle = '#fff'; g.fillRect(0, BTN.y - 26, SW, SH - BTN.y + 26); g.restore();
    const pr = kick(t - T.confirm, 14) * (t > T.confirm ? 1 : 0);
    g.translate(SW / 2, BTN.y + BTN.h / 2); g.scale(1 - pr * 0.05, 1 - pr * 0.05); g.translate(-SW / 2, -(BTN.y + BTN.h / 2));
    g.save(); g.shadowColor = 'rgba(31,115,240,0.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
    g.fillStyle = lg(g, 0, BTN.y, 0, BTN.y + BTN.h, [[0, '#4C97FF'], [1, '#0E5FE0']]);
    g.beginPath(); g.roundRect(24, BTN.y, SW - 48, BTN.h, BTN.h / 2); g.fill(); g.restore();
    const [gx, gy] = bagXY(), n = cartN(t);
    let bump = 0; for (const a of T.adds) if (t > a + 0.42) bump += 0.4 * kick(t - a - 0.42, 9) * Math.cos((t - a - 0.42) * 30);
    g.save(); g.translate(gx, gy); g.scale(1 + bump * 0.5, 1 + bump * 0.5);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.fill();
    miconAt(g, 'bag', 0, 2, 38, '#fff', 8);
    if (n > 0) {
      g.translate(24, -24); g.scale(1 + bump, 1 + bump);
      g.fillStyle = C.amber; g.beginPath(); g.arc(0, 0, 17, 0, TAU); g.fill();
      text(g, String(n), 0, 7, { f: 'Txt', w: 700, s: 21, c: C.ink });
    }
    g.restore();
    text(g, 'Sepeti onayla', gx + 58, gy + 10, { f: 'Txt', w: 700, s: 29, a: 'left', c: '#fff' });
    miconAt(g, 'arrow', SW - 74, gy, 34, '#fff', 9);
    g.restore();
  }
  // sepete uçan ürünler
  T.adds.forEach((a, i) => {
    const p = prog(t, a + 0.02, a + 0.42); if (p <= 0 || p >= 1) return;
    const e = E.inOutCubic(p), [x0, y0] = [80, itemY(i) + 72], [x1, y1] = bagXY();
    const cx = (x0 + x1) / 2 + 160, cy = Math.min(y0, y1) - 120;
    icon(g, MENU[i][0], bez2(x0, cx, x1, e), bez2(y0, cy, y1, e), lerp(0.95, 0.3, E.inCubic(p)), e * 1.8);
  });
  T.adds.forEach((a, i) => ripple(g, ...plusXY(i), t, a));
  ripple(g, SW / 2, BTN.y + BTN.h / 2, t, T.confirm, '255,255,255');
}

// Takip haritası (açık tema, ekran koordinatı)
const MAPV = { roadsX: [118, 298, 470], roadsY: [160, 470, 650, 880], top: 0 };
const ROUTE = [[118, 214], [118, 470], [298, 470], [298, 650], [404, 650]];
const ROUTE_L = (() => { let L = 0; for (let k = 0; k < ROUTE.length - 1; k++) L += Math.hypot(ROUTE[k + 1][0] - ROUTE[k][0], ROUTE[k + 1][1] - ROUTE[k][1]); return L; })();
function routePt(s) {
  let acc = 0;
  for (let k = 0; k < ROUTE.length - 1; k++) {
    const d = Math.hypot(ROUTE[k + 1][0] - ROUTE[k][0], ROUTE[k + 1][1] - ROUTE[k][1]);
    if (s <= acc + d || k === ROUTE.length - 2) { const p = clamp((s - acc) / d); return [lerp(ROUTE[k][0], ROUTE[k + 1][0], p), lerp(ROUTE[k][1], ROUTE[k + 1][1], p)]; }
    acc += d;
  }
  return ROUTE[ROUTE.length - 1];
}
function rideS(t) { return E.inOutSine(prog(t, T.ride0, T.ride1)) * ROUTE_L; }
const CONF2 = makeConfetti(77, 22, ['#22C55E', '#FFB547', '#1F73F0', '#FF4D5E'], 300, 700);

function screen3(g, t) {
  g.fillStyle = '#E7EEF7'; g.fillRect(0, 0, SW, SH);
  // bloklar
  const xs = [-40, ...MAPV.roadsX, SW + 40], ys = [-40, ...MAPV.roadsY, SH + 40];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const x0 = xs[i] + 16, x1 = xs[i + 1] - 16, y0 = ys[j] + 16, y1 = ys[j + 1] - 16;
    if (x1 <= x0 || y1 <= y0) continue;
    const park = (i === 1 && j === 1);
    g.fillStyle = park ? '#CFEFD3' : '#FFFFFF'; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, 16); g.fill();
    if (park) { for (const [px, py] of [[x0 + 40, y0 + 50], [x0 + 110, y0 + 120], [x0 + 60, y0 + 200]]) { g.fillStyle = '#9AD9A3'; g.beginPath(); g.arc(px, py, 18, 0, TAU); g.fill(); } }
    else if ((i + j) % 2 === 0) { g.fillStyle = '#F1F4F9'; g.beginPath(); g.roundRect(x0 + 14, y0 + 14, Math.min(70, x1 - x0 - 28), Math.min(60, y1 - y0 - 28), 10); g.fill(); }
  }
  // rota: planlanan (noktalı) + kat edilen (parlak)
  const s = rideS(t), rp = E.inOutCubic(prog(t, T.st3, T.st3 + 0.5));
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(31,115,240,0.35)'; g.lineWidth = 10; g.setLineDash([2, 20]);
  g.beginPath(); for (let k = 0; k <= 40; k++) { const [x, y] = routePt(s + (ROUTE_L - s) * k / 40 * rp); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.setLineDash([]);
  if (s > 1) {
    for (const [lw, col] of [[22, '#fff'], [12, C.blue]]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
      for (let k = 0; k <= 40; k++) { const [x, y] = routePt(s * k / 40); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
  }
  // restoran ve ev işaretçileri
  const marker = (x, y, ic, col, sc, a) => {
    if (a <= 0) return;
    g.save(); g.translate(x, y); g.scale(a, a);
    g.save(); g.shadowColor = 'rgba(11,27,51,0.25)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -48, 44, 0, TAU); g.moveTo(-14, -10); g.lineTo(0, 6); g.lineTo(14, -10); g.fill(); g.restore();
    g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(0, -48, 40, 0, TAU); g.stroke();
    icon(g, ic, 0, -48, sc);
    g.restore();
  };
  const arrived = t > T.ride1;
  const homeBounce = arrived ? 1 + 0.3 * kick(t - T.ride1, 5) * Math.cos((t - T.ride1) * 22) : 1;
  marker(ROUTE[0][0], ROUTE[0][1], 'store', C.orange, 0.62, E.outBack(prog(t, T.st3 + 0.05, T.st3 + 0.4)));
  marker(ROUTE[4][0] + 6, ROUTE[4][1] - 10, 'house', C.blue, 0.62, E.outBack(prog(t, T.st3 + 0.15, T.st3 + 0.5)) * homeBounce);
  for (let i = 0; i < 2; i++) { // evin etrafında halkalar
    const ph = ((t - T.st3) * 1.1 + i / 2) % 1;
    g.strokeStyle = `rgba(31,115,240,${0.4 * (1 - ph)})`; g.lineWidth = 4;
    g.beginPath(); g.ellipse(ROUTE[4][0] + 6, ROUTE[4][1] - 4, 30 + ph * 70, (30 + ph * 70) * 0.5, 0, 0, TAU); g.stroke();
  }
  // kurye
  const ca = E.outBack(prog(t, T.ride0 - 0.25, T.ride0)) * (1 - E.inCubic(prog(t, T.ride1, T.ride1 + 0.25)));
  if (ca > 0) {
    const [x, y] = routePt(s), pulse = (t * 1.6) % 1;
    g.strokeStyle = `rgba(31,115,240,${0.6 * (1 - pulse)})`; g.lineWidth = 5;
    g.beginPath(); g.arc(x, y, (38 + pulse * 50) * ca, 0, TAU); g.stroke();
    g.save(); g.translate(x, y); g.scale(ca, ca);
    g.shadowColor = 'rgba(11,27,51,0.3)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = C.blue; g.lineWidth = 5; g.stroke();
    const dir = ROUTE.findIndex((p, k) => k > 0 && false);
    void dir;
    icon(g, 'scooter', 0, 2, 0.6, Math.sin(t * 18) * 0.03);
    g.restore();
  }
  // varış: onay rozeti + konfeti
  if (arrived) {
    const sp = E.outBack(prog(t, T.ride1 + 0.05, T.ride1 + 0.35));
    const [hx, hy] = [ROUTE[4][0] + 6, ROUTE[4][1] - 170];
    confetti(g, CONF2, t, T.ride1 + 0.05, hx, hy + 40, 1.2);
    icon(g, 'seal', hx, hy, 0.95 * sp, (1 - sp) * -0.5);
  }
  // üst hap
  g.save(); g.shadowColor = 'rgba(11,27,51,0.15)'; g.shadowBlur = 20; g.shadowOffsetY = 6;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(SW / 2 - 140, 76, 280, 54, 27); g.fill(); g.restore();
  g.fillStyle = arrived ? C.green : C.red; g.beginPath(); g.arc(SW / 2 - 106, 103, 7 + (arrived ? 0 : Math.sin(t * 8)), 0, TAU); g.fill();
  text(g, 'Sipariş takibi', SW / 2 + 14, 111, { f: 'Txt', w: 700, s: 22, c: C.ink });
  statusBar(g);
  // alt panel
  const sy = SH - 322;
  g.save(); g.shadowColor = 'rgba(11,27,51,0.16)'; g.shadowBlur = 34; g.shadowOffsetY = -8;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(0, sy, SW, SH - sy + 40, [34, 34, 0, 0]); g.fill(); g.restore();
  g.fillStyle = '#D5DCE7'; g.beginPath(); g.roundRect(SW / 2 - 30, sy + 14, 60, 7, 3.5); g.fill();
  const sw = prog(t, T.ride1, T.ride1 + 0.3);
  slotText(g, 'Siparişin yolda', 32, sy + 76, { f: 'Txt', w: 700, s: 33, a: 'left', c: C.ink }, 1, sw, 0.02);
  if (arrived) slotText(g, 'Siparişin kapında!', 32, sy + 76, { f: 'Txt', w: 700, s: 33, a: 'left', c: C.greenD }, prog(t, T.ride1 + 0.08, T.ride1 + 0.45), 0, 0.02);
  text(g, 'Burgerci · 3 ürün', 32, sy + 112, { f: 'Txt', w: 500, s: 21, a: 'left', c: C.inkSoft });
  const steps = ['Hazırlandı', 'Yolda', 'Kapında'], st = arrived ? 3 : 1;
  const xs3 = [70, SW / 2, SW - 70], yy = sy + 172;
  g.fillStyle = '#E3E9F2'; g.fillRect(xs3[0], yy - 3, xs3[2] - xs3[0], 6);
  const fillTo = lerp(xs3[0], xs3[1], 1) + (xs3[2] - xs3[1]) * E.inOutCubic(prog(t, T.ride0, T.ride1));
  g.fillStyle = C.green; g.fillRect(xs3[0], yy - 3, fillTo - xs3[0], 6);
  steps.forEach((lb, k) => {
    const done = k < st || (k === 1 && arrived), cur = k === st;
    const r = cur ? 16 + 2 * Math.sin(t * 6) : 16;
    g.fillStyle = done || k === 0 ? C.green : cur ? C.blue : '#C9D3E2';
    g.beginPath(); g.arc(xs3[k], yy, r, 0, TAU); g.fill();
    if (done || k === 0 || (k === 2 && arrived)) miconAt(g, 'check', xs3[k], yy, 20, '#fff', 13);
    text(g, lb, xs3[k], yy + 48, { f: 'Txt', w: 600, s: 19, c: done || cur ? C.ink : C.inkSoft });
  });
  g.fillStyle = '#F3F6FB'; g.beginPath(); g.roundRect(24, sy + 246, SW - 48, 64, 22); g.fill();
  g.fillStyle = '#E8F0FE'; g.beginPath(); g.arc(64, sy + 278, 24, 0, TAU); g.fill();
  icon(g, 'scooter', 64, sy + 279, 0.34);
  text(g, arrived ? 'Afiyet olsun!' : 'Kuryen yola çıktı', 100, sy + 286, { f: 'Txt', w: 600, s: 21, a: 'left', c: C.ink });
}

function phoneScreen(g, t) {
  if (t < T.open) { screen1(g, t); return; }
  if (t < T.st3 + 0.25) {
    const op = E.inOutCubic(prog(t, T.open, T.open + 0.4));
    if (op < 1) screen1(g, t);
    // kart → tam ekran açılışı
    const y0 = cardY(0), x = lerp(CARD.x, 0, op), y = lerp(y0, 0, op), w = lerp(SW - 48, SW, op), h = lerp(CARD.h, SH, op);
    const sl = E.inOutCubic(prog(t, T.st3 - 0.15, T.st3 + 0.2));
    g.save();
    g.beginPath(); g.roundRect(x, y, w, h, lerp(28, 0, op)); g.clip();
    g.translate(0, -sl * SH * 0.3);
    screen2(g, t);
    if (sl > 0) { g.fillStyle = `rgba(11,27,51,${0.3 * sl})`; g.fillRect(0, 0, SW, SH * 1.5); }
    g.restore();
    if (sl > 0) { g.save(); g.translate(0, SH * (1 - sl)); screen3(g, t); g.restore(); }
    return;
  }
  screen3(g, t);
}

function bgSteps(g, t) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#3B8BFF'], [0.5, '#1F73F0'], [1, '#0B4CC4']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.white, 540, 1150, 1000, 0.22);
  for (let i = 0; i < 5; i++) { // yavaş genişleyen halkalar
    const r = 420 + i * 190 + ((t * 50) % 190);
    g.strokeStyle = `rgba(255,255,255,${0.06 * (1 - i / 5)})`; g.lineWidth = 3;
    g.beginPath(); g.arc(540, 1230, r, 0, TAU); g.stroke();
  }
  const a = E.outCubic(prog(t, T.s2, T.s2 + 0.6));
  for (const [n, x, y, sc, r, d] of [['pizza', 120, 700, 1.7, -0.3, 0.6], ['drink', 975, 820, 1.5, 0.2, 0.8], ['fries', 95, 1640, 1.8, -0.15, 1.1], ['durum', 990, 1560, 1.9, 0.3, 0.9], ['kebap', 70, 1180, 1.6, 0.4, 0.5], ['burger', 1010, 1190, 1.5, -0.1, 0.7]]) {
    const dx = Math.sin(t * 0.6 + x) * 16, dy = Math.cos(t * 0.7 + y) * 14 - (t - T.s2) * 10 * d;
    icon(g, n, x + dx, y + dy, sc * a, r + Math.sin(t * 0.5 + x) * 0.1, 0.75, 'B');
  }
}
const STEPS = [
  { s: 'Restoranını seç', a: T.st1, b: T.st2 },
  { s: 'Sepetini oluştur', a: T.st2, b: T.st3 },
  { s: 'Kapına gelsin!', a: T.st3, b: T.wipe3 + 0.4 },
];
function stepper(g, t) {
  const ap = E.outBack(prog(t, T.st1, T.st1 + 0.4)); if (ap <= 0) return;
  const xs = [380, 540, 700], y = 222;
  const cur = t < T.st2 ? 0 : t < T.st3 ? 1 : 2;
  g.save(); g.globalAlpha *= clamp(ap);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(xs[0], y - 3, xs[2] - xs[0], 6);
  const fp = cur + E.inOutCubic(prog(t, cur === 0 ? T.st2 - 0.25 : T.st3 - 0.25, cur === 0 ? T.st2 : T.st3)) * (cur < 2 ? 1 : 0);
  g.fillStyle = '#fff'; g.fillRect(xs[0], y - 3, (xs[2] - xs[0]) * clamp(fp / 2), 6);
  xs.forEach((x, k) => {
    const done = k < cur || (k === 2 && t > T.ride1), act = k === cur && !done;
    const ta = k === 0 ? T.st1 : k === 1 ? T.st2 : T.st3;
    const pop = 1 + 0.3 * kick(t - ta, 7) * (t > ta ? 1 : 0);
    g.save(); g.translate(x, y); g.scale(ap * pop, ap * pop);
    if (act) glow(g, SPR.white, 0, 0, 90, 0.5 + 0.2 * Math.sin(t * 6));
    if (done) icon(g, 'seal', 0, 0, 0.72);
    else {
      g.fillStyle = act ? '#fff' : 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
      if (!act) { g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3; g.stroke(); }
      text(g, String(k + 1), 0, 12, { w: 800, s: 34, c: act ? C.blue : 'rgba(255,255,255,0.85)' });
    }
    g.restore();
  });
  g.restore();
}
function scene2(g, t) {
  bgSteps(g, t);
  stepper(g, t);
  STEPS.forEach((L, i) => {
    if (t < L.a || t > L.b + 0.35) return;
    const o = fit(g, L.s, { w: 800, s: 118, c: '#fff' }, 960);
    slotText(g, L.s, 540, 420, o, prog(t, L.a, L.a + 0.5), i < 2 ? prog(t, L.b - 0.05, L.b + 0.25) : 0, 0.035);
  });
  const xf = phoneXf(t);
  drawPhone(g, t, xf, phoneScreen);
  // ekrandaki parmak
  const fp = fingerAt(t);
  if (fp) { const [x, y] = phoneToWorld(xf, fp[0], fp[1]); finger(g, x, y, fp[2], fp[3]); }
  // birleşme parlaması (sahne başı)
  const fl = kick(t - T.s2, 7);
  if (fl > 0.01) glow(g, SPR.white, 540, 1235, 500, fl);
  // geçiş: evden genişleyen daire
  return xf;
}
function fingerAt(t) {
  const keys = [
    [SW + 80, SH - 60, T.tapRest - 0.85], [SW / 2 + 70, cardY(0) + 84, T.tapRest],
    [...plusXY(0), T.adds[0]], [...plusXY(1), T.adds[1]], [...plusXY(2), T.adds[2]],
    [SW / 2 + 40, BTN.y + BTN.h / 2, T.confirm], [SW + 100, SH + 120, T.confirm + 0.55],
  ];
  if (t < keys[0][2] || t > keys[keys.length - 1][2]) return null;
  let x = keys[0][0], y = keys[0][1];
  for (let k = 0; k < keys.length - 1; k++) {
    const a = keys[k], b = keys[k + 1];
    if (t <= b[2]) {
      const p = E.inOutCubic(prog(t, a[2] + 0.1, b[2] - 0.06));
      x = lerp(a[0], b[0], p); y = lerp(a[1], b[1], p) - Math.sin(p * Math.PI) * 40;
      break;
    }
  }
  let press = 0;
  for (const tp of [T.tapRest, ...T.adds, T.confirm]) press = Math.max(press, t > tp ? kick(t - tp, 12) : prog(t, tp - 0.06, tp));
  const a = prog(t, keys[0][2], keys[0][2] + 0.2) * (1 - prog(t, T.confirm + 0.3, T.confirm + 0.5)) * (t > T.tapRest + 0.25 && t < T.adds[0] - 0.55 ? 0.0 : 1);
  return [x, y, press, a];
}

/* ───────────── 3. LANSMAN (12–16) ───────────── */
const TG = { x: 540, y: 880, w: 620, h: 270 };
TG.r = TG.h / 2; TG.k = 112; TG.x0 = TG.x - TG.w / 2 + TG.r; TG.x1 = TG.x + TG.w / 2 - TG.r;
const CONF3 = makeConfetti(5, 60, ['#FFD36B', '#FFFFFF', '#4ADE80', '#9CC2FF', '#FF7A1A', '#FF4D5E'], 900, 2100);
function bgLaunch(g, t, on) {
  g.fillStyle = rg(g, 540, 900, 1400, [[0, '#123A8C'], [0.5, '#0A1F52'], [1, '#030A1C']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  rays(g, TG.x, TG.y, t, 16, `rgba(140,255,180,${0.10 + 0.12 * on})`, 0.4 + 0.6 * on, 1700, 0.06, 0.1);
  glow(g, SPR.green, TG.x1, TG.y, 900, 0.35 * on);
  bokeh(g, t, 0.9);
  for (const [n, x, y, sc, r] of [['burger', 140, 360, 1.5, -0.2], ['pizza', 950, 330, 1.4, 0.3], ['drink', 110, 1650, 1.5, 0.15], ['fries', 965, 1640, 1.6, -0.1]]) {
    const a = E.outBack(prog(t, T.s3 + 0.1, T.s3 + 0.6));
    icon(g, n, x + Math.sin(t * 0.8 + x) * 14, y + Math.cos(t * 0.9 + y) * 14, sc * a, r + Math.sin(t * 0.6 + y) * 0.1, 0.7, 'B');
  }
}
function scene3(g, t) {
  const on = E.outCubic(prog(t, T.toggle, T.toggle + 0.3));
  bgLaunch(g, t, on);
  // kicker + başlık
  const kp = E.outBack(prog(t, T.s3 + 0.05, T.s3 + 0.4));
  if (kp > 0) {
    g.save(); g.translate(540, 400); g.scale(kp, kp);
    pill(g, 0, 0, 290, 70, lg(g, 0, -35, 0, 35, [[0, '#FF6B7A'], [1, '#E5263C']]), 'rgba(229,38,60,0.45)');
    text(g, 'YENİ HİZMET', 0, 13, { w: 800, s: 34, ls: 3, c: '#fff' });
    g.restore();
  }
  const tp = prog(t, T.title3, T.title3 + 0.55);
  if (tp > 0) {
    const wm = SPR.wmWhite, base = 592, o = { w: 800, s: TITLE3.fs, ls: TITLE3.fs * 0.015 };
    const yw = measure(g, 'Yemek', o), gap = TITLE3.fs * 0.26, gw = wm.width + gap + yw, x0 = 540 - gw / 2;
    g.save(); g.beginPath(); g.rect(0, 430, W, 210); g.clip();
    const p0 = E.outExpo(clamp(tp * 1.3));
    g.drawImage(wm, x0, base - LOGO.wmBase * TITLE3.k + (1 - p0) * 190);
    letters(g, 'Yemek', x0 + wm.width + gap, base, { ...o, a: 'left' }, (i, n) => {
      const pi = E.outExpo(clamp(tp * 1.5 - 0.25 - i * 0.06));
      return { dy: (1 - pi) * 190, c: i < 2 ? '#FFC24D' : '#FFA63D' };
    });
    g.restore();
  }
  // anahtar (toggle)
  const ap = spring(t - (T.s3 + 0.15), 1.5, 7);
  if (ap > 0) {
    g.save(); g.translate(TG.x, TG.y); g.scale(ap, ap); g.translate(-TG.x, -TG.y);
    const tx = TG.x - TG.w / 2, ty = TG.y - TG.h / 2;
    const track = rr(tx, ty, TG.w, TG.h, TG.r);
    g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fill(track); g.restore();
    g.save(); g.clip(track);
    g.fillStyle = 'rgba(8,20,50,0.6)'; g.fill(track);
    const kx = lerp(TG.x0, TG.x1, E.outBack(prog(t, T.toggle, T.toggle + 0.38)));
    // yeşil dolgu (düğmeyle birlikte genişler)
    g.fillStyle = lg(g, 0, ty, 0, ty + TG.h, [[0, '#5EEB8E'], [0.55, '#22C55E'], [1, '#12923F']]);
    g.globalAlpha = on; g.beginPath(); g.roundRect(tx, ty, (kx - tx) + TG.r, TG.h, TG.r); g.fill(); g.globalAlpha = 1;
    g.fillStyle = lg(g, 0, ty, 0, ty + TG.h, [[0, 'rgba(255,255,255,0.35)'], [0.45, 'rgba(255,255,255,0.04)'], [1, 'rgba(0,0,0,0.12)']]); g.fill(track);
    // AKTİF yazısı
    const ta = E.outExpo(prog(t, T.toggle + 0.15, T.toggle + 0.5));
    if (ta > 0) { g.globalAlpha = ta; text(g, 'AKTİF', tx + 205 - (1 - ta) * 40, TG.y + 28, { w: 900, s: 84, ls: 4, c: '#fff' }); g.globalAlpha = 1; }
    g.restore();
    g.strokeStyle = `rgba(255,255,255,${0.35 + 0.3 * on})`; g.lineWidth = 4; g.stroke(track);
    // düğme
    const sq = t > T.toggle - 0.1 && t < T.toggle + 0.2 ? Math.sin(prog(t, T.toggle - 0.1, T.toggle + 0.2) * Math.PI) : 0;
    g.save(); g.translate(kx, TG.y); g.scale(1 + sq * 0.16, 1 - sq * 0.1);
    g.save(); g.shadowColor = 'rgba(0,10,30,0.5)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
    g.fillStyle = rg(g, 0, 0, TG.k, [[0, '#FFFFFF'], [0.75, '#F1F5FB'], [1, '#C9D4E5']], -30, -40, 10);
    g.beginPath(); g.arc(0, 0, TG.k, 0, TAU); g.fill(); g.restore();
    g.save(); g.scale(2.2, 2.2); forkKnife(g, on > 0.5 ? C.orange : '#8A97AD'); g.restore();
    g.restore();
    g.restore();
    shockwave(g, TG.x1, TG.y, t, T.toggle + 0.05, 700, '140,255,180', 26, 0.7);
    if (t > T.toggle) glow(g, SPR.white, TG.x1, TG.y, 500, 0.6 * kick(t - T.toggle - 0.05, 6));
  }
  confetti(g, CONF3, t, T.toggle + 0.08, TG.x1, TG.y, 2.2);
  // Afşin'de / aktif edildi!
  const s1 = slam(t, T.afsin, 2.4);
  if (s1) {
    g.save(); g.globalAlpha *= s1.al; g.translate(540, 1230); g.scale(s1.sc, s1.sc); g.translate(-540, -1230);
    const o = { w: 800, s: 140 }, tw = measure(g, "Afşin'de", o), gx = 540 - (tw + 130) / 2;
    icon(g, 'foodPin', gx + 50, 1225, 1.25, Math.sin(t * 2) * 0.05);
    text(g, "Afşin'de", gx + 130, 1280, { ...o, a: 'left', c: '#fff' });
    g.restore();
  }
  const s2 = slam(t, T.aktif, 2.6);
  if (s2) {
    g.save(); g.globalAlpha *= s2.al; g.translate(540, 1420); g.scale(s2.sc, s2.sc); g.translate(-540, -1420);
    glow(g, SPR.amber, 540, 1400, 560, 0.3);
    heroWord(g, 'aktif edildi!', 540, 1470, fit(g, 'aktif edildi!', { w: 900, s: 168 }, 980), 12);
    g.restore();
    for (const [dx, dy, d] of [[-420, -140, 0.1], [400, -110, 0.25], [-360, 60, 0.45], [430, 40, 0.6]]) {
      twinkle(g, 540 + dx, 1400 + dy, 30, Math.max(0, Math.sin((t - T.aktif - d) * 3)), t);
    }
  }
}

/* ───────────── 4. KAPANIŞ (16–20) ───────────── */
// Orijinal logo görselinin (2000×667) geometrisi, görsel pikseli cinsinden: pin kutusu [88,90]–[484,612],
// yazı kutusu [487,182]–[1933,516], assets/yakinla-wordmark.png kırpımı [479,174]–[1941,524], taban çizgisi y≈510.
const LOGO = { k: 0.47, pinW: 396, pinH: 522, groupW: 1845, wmDx: 391, wmDy: 84, textR: 1845, textB: 426, wmBase: 336 };
const TITLE3 = { k: 0.3, fs: 0 }; // fs açılışta, Outfit 'Y' yüksekliği logodaki 'Y' ile eşleşecek şekilde hesaplanır
function drawShined(g, img, x, y, gl) { // yazıya parıltı bandı (yalnız yazının üstünde)
  if (gl == null) { g.drawImage(img, x, y); return; }
  const c = SPR.shineBuf, cx = c.getContext('2d');
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'source-over'; cx.clearRect(0, 0, c.width, c.height);
  cx.drawImage(img, 0, 0);
  cx.globalCompositeOperation = 'source-atop';
  const gx = lerp(-200, img.width + 200, gl);
  const gr = cx.createLinearGradient(gx - 120, 0, gx + 120, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  cx.setTransform(1, 0, -0.4, 1, img.height * 0.2, 0); cx.fillStyle = gr; cx.fillRect(gx - 200, 0, 400, img.height);
  g.drawImage(c, 0, 0, img.width, img.height, x, y, img.width, img.height);
}
const CONF4 = makeConfetti(99, 50, ['#1F73F0', '#FFB547', '#3B8BFF', '#22C55E', '#FF7A1A'], 800, 1900);
function scene4(g, t) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#FFFFFF'], [1, '#E6F0FF']]); g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.blue, 180 + Math.sin(t * 0.5) * 60, 320, 700, 0.18);
  glow(g, SPR.blue, 920 + Math.cos(t * 0.4) * 60, 1650, 800, 0.2);
  glow(g, SPR.amber, 900, 300, 500, 0.12);
  for (let i = 0; i < 5; i++) { // logodan yayılan halkalar
    const ts = T.s4 + 0.05 + i * 0.6; if (t < ts) continue;
    const age = t - ts, a = 0.16 * clamp(1 - age / 2.4); if (a <= 0) continue;
    g.strokeStyle = `rgba(31,115,240,${a})`; g.lineWidth = 4;
    g.beginPath(); g.arc(540, 800, 200 + age * 360, 0, TAU); g.stroke();
  }
  // yemekler köşelerde
  for (const [n, x, y, sc, r, d] of [['burger', 175, 395, 1.35, -0.15, 0], ['pizza', 915, 380, 1.25, 0.25, 0.06], ['drink', 160, 1690, 1.2, 0.12, 0.12], ['fries', 925, 1700, 1.2, -0.1, 0.18]]) {
    const p = E.outBack(prog(t, T.tag + d, T.tag + d + 0.45)); if (p <= 0) continue;
    const fy = Math.sin(t * 2 + x) * 10;
    contactShadow(g, x, y + 80 * sc / 1.3, 70 * sc * p, 0.18);
    icon(g, n, x, y + fy, sc * p, r + Math.sin(t * 1.2 + y) * 0.05);
  }
  // logo: pin önce ortada kurulur, sonra sola kayar; 'Yakınla' yazısı (orijinal logodan) pinin arkasından açılır
  const k = LOGO.k, pinW = LOGO.pinW * k, PIN_H = LOGO.pinH * k, groupW = LOGO.groupW * k, cy = 800;
  const py0 = cy - PIN_H / 2, pxFinal = 540 - groupW / 2;
  const sl = E.inOutCubic(prog(t, T.word, T.word + 0.55));
  const pinL = lerp(540 - pinW / 2, pxFinal, sl), ps = lerp(1.3, 1, sl);
  const size = PIN_H / 0.791 * ps;
  const grow = spring(t - (T.s4 + 0.08), 1.6, 6);
  const ring = E.inOutCubic(prog(t, T.s4 + 0.22, T.s4 + 0.55));
  const face = E.outBack(prog(t, T.s4 + 0.38, T.s4 + 0.6));
  const hands = E.outBack(prog(t, T.s4 + 0.45, T.s4 + 0.66));
  const sp = E.outCubic(prog(t, T.s4 + 0.45, T.s4 + 0.95));
  const wob = t > T.s4 + 0.95 ? 0.16 * Math.exp(-(t - T.s4 - 0.95) * 10) * Math.sin((t - T.s4 - 0.95) * 42) : 0;
  const glint = lerp(-0.3, 1.3, prog(t, T.tag, T.tag + 0.5));
  const wmX = pxFinal + LOGO.wmDx * k, wmY = py0 + LOGO.wmDy * k;
  const rv = E.outCubic(prog(t, T.word + 0.12, T.word + 0.75));
  if (rv > 0) {
    const edge = pinL + pinW * 0.8; // yazı pinin arkasından çıkar
    g.save(); g.beginPath(); g.rect(edge, wmY - 40, (W - edge) * rv + 40, SPR.wmS.height + 80); g.clip();
    const gx = lerp(-0.3, 1.3, prog(t, T.tag + 0.15, T.tag + 0.75));
    drawShined(g, SPR.wmS, wmX - (1 - rv) * 160, wmY, t > T.tag + 0.15 && gx < 1.3 ? gx : null);
    g.restore();
  }
  drawLogo(g, pinL + pinW / 2, cy + 3 / 1024 * size, size, { grow, ring, face, hands, am: -(1 - sp) * 5 * TAU + wob, ah: -(1 - sp) * 1.25 * TAU + wob * 0.6, glint: t > T.tag ? glint : null });
  // YEMEK etiketi (yazının sağ altında)
  const tg = spring(t - T.tag, 1.7, 6.5);
  if (tg > 0) {
    const o = { w: 800, s: 46, ls: 10 }, tw = measure(g, 'YEMEK', o);
    const pw = tw + 124, ph = 82, right = pxFinal + LOGO.textR * k, tx = right - pw / 2, ty = py0 + LOGO.textB * k + 74;
    g.save(); g.translate(tx, ty); g.scale(tg, tg); g.rotate((1 - clamp(tg)) * 0.3);
    pill(g, 0, 0, pw, ph, lg(g, 0, -ph / 2, 0, ph / 2, [[0, '#FFB24A'], [1, '#FF6A1A']]), 'rgba(255,106,26,0.4)');
    g.save(); g.translate(-pw / 2 + 50, 0); g.scale(1.2, 1.2); forkKnife(g, '#fff'); g.restore();
    text(g, 'YEMEK', 30, 17, { ...o, c: '#fff' });
    g.restore();
  }
  confetti(g, CONF4, t, T.tag, 540, cy, 2.0);
  // slogan ve mağazalar
  slotText(g, 'Afiyet olsun!', 540, 1215, { w: 800, s: 118, c: C.ink }, prog(t, T.slogan, T.slogan + 0.55), 0, 0.03);
  const hp = E.outExpo(prog(t, T.stores - 0.15, T.stores + 0.3));
  if (hp > 0) { g.save(); g.globalAlpha *= hp; text(g, "Yakınla'yı indir, siparişini ver", 540, 1335 + (1 - hp) * 20, { f: 'Txt', w: 600, s: 34, c: C.inkSoft }); g.restore(); }
  [['App Store', 345], ['Google Play', 735]].forEach(([s, x], i) => {
    const p = E.outBack(prog(t, T.stores + i * 0.1, T.stores + 0.35 + i * 0.1)); if (p <= 0) return;
    g.save(); g.translate(x, 1450); g.scale(p, p);
    pill(g, 0, 0, 352, 100, lg(g, 0, -50, 0, 50, [[0, '#1B2A48'], [1, '#0B1B33']]), 'rgba(11,27,51,0.3)');
    g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.arc(-118, 0, 30, 0, TAU); g.fill();
    miconAt(g, 'down', -118, -2, 40, '#fff', 9);
    text(g, s, 26, 13, { f: 'Txt', w: 700, s: 35, c: '#fff' });
    g.restore();
  });
  const up = E.outExpo(prog(t, T.url, T.url + 0.5));
  if (up > 0) { g.save(); g.globalAlpha *= up; text(g, 'yakinla.com', 540, 1590 + (1 - up) * 20, { f: 'Txt', w: 600, s: 40, c: C.blue, ls: 1 }); g.restore(); }
}
