'use strict';
/* Yakınla Yemek (uygulama akışı) — sahnelerden bağımsız ortak katmanlar:
 * bokeh, ışık huzmeleri, konfeti, büyük başlık, hap, buhar, telefon çerçevesi, parmak, logo parıltısı.
 * (yakinla-yemek/js/scenes.js'ten alındı.)
 */
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

/* ───────────── telefon ───────────── */
const PH = { x: 540, y: 1235, s: 0.86, W: 560, H: 1140, bz: 15, r: 86 };
PH.SW = PH.W - 2 * PH.bz; PH.SH = PH.H - 2 * PH.bz;
const SW = PH.SW, SH = PH.SH;
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

/* ───────────── logo ───────────── */
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
