'use strict';
/* Yakınla Andırın — yakinla-yemek-uygulama/js/scenes.js'ten alınan ortak sahne parçaları:
 * arka planlar, telefon dönüşümü, uygulama ana ekranı (harita + Market/Yemek kartları), alt menü,
 * kurye (sokak, motor, kapı) ve logolu kapanış. Zaman çizelgesi (T) js/timeline.js'tedir.
 */

/* ───────────── arka planlar ───────────── */
function bgNight(g, t) {
  g.fillStyle = rg(g, 540, 1000, 1350, [[0, '#14347A'], [0.45, '#0A1C47'], [1, '#030918']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.blue, 540, 1250, 900, 0.35);
  bokeh(g, t, 1);
}
function bgSteps(g, t) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#3B8BFF'], [0.5, '#1F73F0'], [1, '#0B4CC4']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.white, 540, 1150, 1000, 0.22);
  for (let i = 0; i < 5; i++) {
    const r = 420 + i * 190 + ((t * 50) % 190);
    g.strokeStyle = `rgba(255,255,255,${0.06 * (1 - i / 5)})`; g.lineWidth = 3;
    g.beginPath(); g.arc(540, 1230, r, 0, TAU); g.stroke();
  }
  for (const [n, x, y, sc, r, d] of [['chips', 120, 700, 1.7, -0.3, 0.6], ['milk', 975, 820, 1.5, 0.2, 0.8], ['bread', 95, 1640, 1.8, -0.15, 1.1], ['water', 990, 1560, 1.8, 0.3, 0.9], ['eggs', 70, 1180, 1.6, 0.2, 0.5], ['drink', 1010, 1190, 1.5, -0.1, 0.7]]) {
    const dx = Math.sin(t * 0.6 + x) * 16, dy = Math.cos(t * 0.7 + y) * 14 - (t - T.s2) * 8 * d;
    icon(g, n, x + dx, y + dy, sc, r + Math.sin(t * 0.5 + x) * 0.1, 0.75, 'B');
  }
}

/* ───────────── telefon ───────────── */
function phoneXf(t) {
  const a = t - T.phoneIn;
  const em = spring(a, 1.25, 6.5);
  const fy = Math.sin(a * 1.6) * 8, rot = -0.028 + 0.018 * Math.sin(a * 1.1);
  return { x: PH.x, y: PH.y + fy + (1 - clamp(em)) * 700, rot: rot + (1 - clamp(em)) * 0.25, s: PH.s * lerp(0.7, 1, clamp(em)) };
}


/* — ana ekran (uygulama girişi) — */
const HOME = { map: [24, 150, SW - 48, 272], market: 440, yemek: 776, cardH: 318 };
const MAP_LABELS = [['Malatya', 0.9, 0.15], ['Niğde', 0.05, 0.19], ['Afşin', 0.55, 0.3], ['Kahramanmaraş', 0.62, 0.56], ['Adıyaman', 0.88, 0.48], ['Osmaniye', 0.33, 0.9], ['Gaziantep', 0.7, 0.93], ['Adana', 0.1, 0.93]];
const LOC = { name: 'Andırın', full: 'Andırın, Kahramanmaraş', u: 0.42, v: 0.6 };
function drawMap(g, x, y, w, h, t) {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 28); g.clip();
  g.fillStyle = '#EEF0E8'; g.fillRect(x, y, w, h);
  const r = mulberry32(31);
  for (let i = 0; i < 9; i++) { // yeşil rölyef lekeleri
    const cx = x + r() * w, cy = y + r() * h, rx = 40 + r() * 110, ry = 20 + r() * 50;
    g.fillStyle = i % 3 ? 'rgba(170,205,150,0.55)' : 'rgba(140,190,125,0.5)';
    g.beginPath(); g.ellipse(cx, cy, rx, ry, r() * 3, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(150,190,235,0.7)'; g.beginPath(); g.ellipse(x + w * 0.83, y + h * 0.3, 26, 9, 0.5, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(150,120,190,0.45)'; g.lineWidth = 1.6; g.setLineDash([6, 5]); // il sınırları
  for (const pts of [[[0.0, 0.42], [0.3, 0.38], [0.55, 0.3], [0.7, 0.05]], [[0.3, 1], [0.38, 0.7], [0.62, 0.68], [0.75, 0.75], [1, 0.6]], [[0.62, 0.68], [0.7, 0.4], [1, 0.32]]]) {
    g.beginPath(); pts.forEach(([u, v], k) => k ? g.lineTo(x + u * w, y + v * h) : g.moveTo(x + u * w, y + v * h)); g.stroke();
  }
  g.setLineDash([]);
  g.strokeStyle = '#F2C66D'; g.lineWidth = 3; // yollar
  for (const pts of [[[0.0, 0.8], [0.25, 0.75], [0.48, 0.6], [0.52, 0.45], [0.6, 0.2], [0.95, 0.1]], [[0.48, 0.6], [0.7, 0.88], [1, 0.95]]]) {
    g.beginPath(); pts.forEach(([u, v], k) => k ? g.lineTo(x + u * w, y + v * h) : g.moveTo(x + u * w, y + v * h)); g.stroke();
  }
  for (const [s, u, v] of MAP_LABELS) text(g, s, x + u * w, y + v * h, { f: 'Txt', w: 500, s: 15, c: 'rgba(90,100,120,0.8)', a: u < 0.2 ? 'left' : u > 0.8 ? 'right' : 'center' });
  // Afşin pini
  const ax = x + w * LOC.u, ay = y + h * LOC.v, pulse = (t * 1.2) % 1;
  g.strokeStyle = `rgba(31,115,240,${0.5 * (1 - pulse)})`; g.lineWidth = 3; g.beginPath(); g.arc(ax, ay + 26, 12 + pulse * 40, 0, TAU); g.stroke();
  shadowCard(g, ax - 54, ay - 4, 108, 40, 20, 0.18);
  text(g, LOC.name, ax, ay + 23, { f: 'Txt', w: 700, s: 19, c: C.ink });
  // sol üst hap
  shadowCard(g, x + 14, y + 14, 266, 44, 22, 0.12);
  g.fillStyle = C.green; g.beginPath(); g.arc(x + 38, y + 36, 7, 0, TAU); g.fill();
  text(g, LOC.full, x + 52, y + 43, { f: 'Txt', w: 700, s: 18, a: 'left', c: C.ink });
  g.fillStyle = 'rgba(30,38,56,0.85)'; g.beginPath(); g.roundRect(x + w - 132, y + h - 54, 118, 40, 12); g.fill();
  text(g, 'Tam Ekran', x + w - 73, y + h - 27, { f: 'Txt', w: 700, s: 17, c: '#fff' });
  g.restore();
}
function imgCard(g, img, x, y, w, h, press = 0, hl = 0) {
  g.save(); g.translate(x + w / 2, y + h / 2); g.scale(1 - press * 0.03, 1 - press * 0.03); g.translate(-(x + w / 2), -(y + h / 2));
  shadowCard(g, x, y, w, h, 28, 0.1);
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 28); g.clip();
  g.drawImage(img, x, y, w, h);
  g.restore();
  if (hl > 0.01) { g.strokeStyle = `rgba(31,115,240,${hl})`; g.lineWidth = 6; g.beginPath(); g.roundRect(x, y, w, h, 28); g.stroke(); }
  g.restore();
}
function screenHome(g, t) {
  g.fillStyle = '#F4F6FB'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  text(g, 'Konumun', 28, 94, { f: 'Txt', w: 500, s: 19, a: 'left', c: '#8A93A6' });
  g.save(); g.translate(40, 122); g.scale(0.62, 0.62); micon(g, 'pin', '#7C5CFF', 0); g.restore();
  text(g, LOC.full, 62, 132, { f: 'Txt', w: 700, s: 28, a: 'left', c: C.ink });
  miconAt(g, 'chev', 62 + measure(g, LOC.full, { f: 'Txt', w: 700, s: 28 }) + 20, 121, 26, '#7C5CFF', 8);
  for (const [x, ic] of [[SW - 150, 'globe'], [SW - 80, 'user']]) {
    shadowCard(g, x, 72, 58, 58, 18, 0.1);
    uiIcon(g, ic, x + 29, 101, 28, C.ink);
  }
  const [mx, my, mw, mh] = HOME.map;
  shadowCard(g, mx, my, mw, mh, 28, 0.1);
  drawMap(g, mx, my, mw, mh, t);
  const press = kick(t - T.tapMarket, 12) * (t > T.tapMarket ? 1 : 0);
  imgCard(g, SPR.cardMarket, 24, HOME.market, SW - 48, HOME.cardH, press, kick(t - T.tapMarket, 5) * (t > T.tapMarket ? 0.9 : 0));
  imgCard(g, SPR.cardYemek, 24, HOME.yemek, SW - 48, HOME.cardH);
  // Yemek henüz Andırın'da yok: kartta "Çok yakında" rozeti
  g.fillStyle = 'rgba(11,27,51,0.28)'; g.beginPath(); g.roundRect(24, HOME.yemek, SW - 48, HOME.cardH, 28); g.fill();
  g.save(); g.translate(SW - 140, HOME.yemek + 52); g.rotate(-0.06);
  g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
  g.fillStyle = lg(g, 0, -24, 0, 24, [[0, '#FFB24A'], [1, '#FF6A1A']]); g.beginPath(); g.roundRect(-100, -24, 200, 48, 24); g.fill();
  g.shadowColor = 'transparent'; text(g, 'Çok yakında', 0, 8, { f: 'Txt', w: 700, s: 22, c: '#fff' });
  g.restore();
}


function bottomNav(g) {
  const y = SH - 104;
  g.save(); g.shadowColor = 'rgba(11,27,51,0.12)'; g.shadowBlur = 24; g.shadowOffsetY = -4;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(14, y, SW - 28, 90, 30); g.fill(); g.restore();
  const items = [['Anasayfa', 'home', 62], ['Mutfaklar', 'grid', 156], ['Siparişlerim', 'list', SW - 156], ['Hesabım', 'user', SW - 62]];
  for (const [s, ic, x] of items) {
    const act = s === 'Anasayfa';
    uiIcon(g, ic, x, y + 36, 26, act ? C.blue : '#7B879C');
    text(g, s, x, y + 72, { f: 'Txt', w: 600, s: 15, c: act ? C.blue : '#7B879C' });
  }
  g.fillStyle = C.blue; g.fillRect(40, y, 44, 4);
  g.save(); g.shadowColor = 'rgba(31,115,240,0.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(SW / 2, y + 22, 46, 0, TAU); g.fill(); g.restore();
  drawLogo(g, SW / 2, y + 22, 74);
}


/* ───────────── kurye: sokak, motor, kapı ───────────── */
// Afşin: alçak katlı binalar, çatılarda güneş enerjili su ısıtıcıları, arkada dağlar, akşam ışığı
const BLDG = (() => {
  const r = mulberry32(12), a = [];
  let x = -200;
  while (x < 4200) {
    const w = 210 + r() * 170, fl = 2 + Math.floor(r() * 3);
    a.push({ x, w, fl, c: ['#F3E3C8', '#EBD2B4', '#DCE6F2', '#F1D7CB', '#E7E1D3'][Math.floor(r() * 5)], roof: r() < 0.6, bal: r() < 0.7, seed: Math.floor(r() * 1e6) });
    x += w + 26 + r() * 40;
  }
  return a;
})();
function sky(g, t, warm = 1) {
  g.fillStyle = lg(g, 0, 0, 0, 1300, [[0, '#1A2F6E'], [0.45, '#4D5AA6'], [0.78, '#E88E6A'], [1, '#FFC27A']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.amber, 780, 1120, 700, 0.45 * warm);
  stars(g, t);
}
const STARS = (() => { const r = mulberry32(3), a = []; for (let i = 0; i < 60; i++) a.push([r() * W, r() * 600, 0.6 + r() * 1.6, r() * TAU]); return a; })();
function stars(g, t) {
  g.fillStyle = '#fff';
  for (const [x, y, s, ph] of STARS) { g.globalAlpha = 0.35 + 0.3 * Math.sin(t * 2 + ph); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}
function mountains(g, off) {
  for (const [base, amp, fr, col, par, sd] of [[1060, 210, 0.0035, '#5A5E9E', 0.08, 1], [1160, 160, 0.006, '#454A86', 0.15, 4]]) {
    g.fillStyle = col; g.beginPath(); g.moveTo(-50, base + 300);
    for (let x = -50; x <= W + 50; x += 10) {
      const u = (x + off * par) * fr + sd;
      g.lineTo(x, base - amp * (0.55 + 0.3 * Math.sin(u) + 0.15 * Math.sin(u * 2.3 + 1) + 0.06 * Math.sin(u * 5.7)));
    }
    g.lineTo(W + 50, base + 300); g.closePath(); g.fill();
    // ön sırtta çam ormanı
    if (sd === 4) {
      const r = mulberry32(19);
      for (let i = 0; i < 70; i++) {
        const px = ((i * 37 + r() * 30 - off * par) % (W + 100) + W + 100) % (W + 100) - 50;
        const u = (px + off * par) * fr + sd, ridge = base - amp * (0.55 + 0.3 * Math.sin(u) + 0.15 * Math.sin(u * 2.3 + 1) + 0.06 * Math.sin(u * 5.7));
        pine(g, px, ridge + 20 + r() * 120, 22 + r() * 22, '#2C3E5E');
      }
    }
  }
}
function pine(g, x, y, h, col) { // basit çam silueti
  g.fillStyle = col; g.beginPath();
  for (let k = 0; k < 3; k++) { const yy = y - h * k * 0.32, w = h * (0.42 - k * 0.1); g.moveTo(x - w, yy); g.lineTo(x, yy - h * 0.5); g.lineTo(x + w, yy); }
  g.fill(); g.fillRect(x - h * 0.05, y, h * 0.1, h * 0.15);
}
function building(g, b, x, base, t, near = true) {
  const fh = 118, h = b.fl * fh + 30, r = mulberry32(b.seed);
  g.fillStyle = b.c; g.fillRect(x, base - h, b.w, h);
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x + b.w - 18, base - h, 18, h);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, base - h, b.w, 8);
  for (let f = 0; f < b.fl; f++) {
    const y = base - h + 40 + f * fh;
    const nw = Math.max(2, Math.floor(b.w / 90));
    for (let k = 0; k < nw; k++) {
      const wx = x + 22 + k * ((b.w - 44) / nw), ww = (b.w - 44) / nw - 22, lit = r() < 0.72;
      g.fillStyle = lit ? lg(g, 0, y, 0, y + 62, [[0, '#FFE2A3'], [1, '#FFB65C']]) : '#6E7AA0';
      g.fillRect(wx, y, ww, 62);
      g.fillStyle = 'rgba(80,60,40,0.35)'; g.fillRect(wx, y + 62, ww, 5);
      if (lit && near) glow(g, SPR.amber, wx + ww / 2, y + 30, 50, 0.18);
    }
    if (b.bal && f > 0) { g.fillStyle = 'rgba(70,80,110,0.55)'; g.fillRect(x + 12, y + 70, b.w - 24, 6); for (let k = x + 16; k < x + b.w - 16; k += 14) g.fillRect(k, y + 76, 3, 18); }
  }
  if (b.roof) { // çatıda güneş enerjili su ısıtıcısı
    const rx = x + b.w * 0.25;
    g.fillStyle = '#2F3E6B'; g.save(); g.translate(rx, base - h); g.transform(1, 0, -0.5, 1, 0, 0); g.fillRect(0, -44, 90, 40); g.restore();
    g.fillStyle = '#DDE3EC'; g.beginPath(); g.roundRect(rx + 30, base - h - 70, 72, 24, 12); g.fill();
    g.fillStyle = '#8A96AE'; g.fillRect(rx + 40, base - h - 46, 4, 46); g.fillRect(rx + 88, base - h - 46, 4, 46);
  }
}
function street(g, t, off) {
  // yol ve kaldırım
  g.fillStyle = '#C9C2B6'; g.fillRect(-100, 1500, W + 200, 46);
  g.fillStyle = '#A59E93'; g.fillRect(-100, 1546, W + 200, 10);
  g.fillStyle = lg(g, 0, 1556, 0, H, [[0, '#3B4256'], [1, '#232838']]); g.fillRect(-100, 1556, W + 200, H);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  for (let x = -((off * 1.0) % 220) - 220; x < W + 220; x += 220) g.fillRect(x, 1740, 120, 12);
  // sokak lambaları
  for (let x = -((off * 1.0) % 520) - 520; x < W + 520; x += 520) {
    g.fillStyle = '#2B3247'; g.fillRect(x + 300, 1150, 12, 360); g.fillRect(x + 300, 1150, 80, 10);
    g.fillStyle = '#FFE4A8'; g.beginPath(); g.ellipse(x + 372, 1168, 20, 9, 0, 0, TAU); g.fill();
    glow(g, SPR.amber, x + 372, 1175, 200, 0.5);
  }
}
// Kurye: yandan, sağa bakar. Kask yüzü kapatır (yapay yüz yok). Birim: 1 = 1 px × s
function courierBody(g, t, riding, armPose = 0, pack = true, walk = 0) {
  const blue = lg(g, -40, -150, 40, 0, [[0, '#4C97FF'], [0.5, '#1F73F0'], [1, '#0B47B5']]);
  const pants = '#1D2740', shoe = '#121826';
  if (!riding) { // ayakta: bacaklar
    const sw = Math.sin(walk) * 0.32 * (walk ? 1 : 0);
    for (const [lx, a] of [[-10, -sw], [14, sw]]) {
      g.save(); g.translate(lx, -6); g.rotate(a);
      g.fillStyle = pants; g.beginPath(); g.roundRect(-10, 0, 20, 128, 9); g.fill();
      g.fillStyle = shoe; g.beginPath(); g.roundRect(-14, 120, 36, 16, 7); g.fill();
      g.restore();
    }
  }
  // gövde (mont) + yansıtıcı şerit
  g.fillStyle = blue; g.beginPath(); g.roundRect(-30, -128, 62, 132, 24); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(-30, -54, 62, 8);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.roundRect(-24, -122, 14, 110, 7); g.fill();
  // sırt çantası (termal kutu) — Yakınla pini
  if (pack) {
    g.save(); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 10;
    g.fillStyle = lg(g, -78, -150, -26, -40, [[0, '#2F80F5'], [1, '#0B4CC4']]); g.beginPath(); g.roundRect(-82, -150, 60, 96, 12); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(-82, -128, 60, 4);
    drawLogo(g, -52, -96, 44);
  }
  // kol
  g.strokeStyle = blue; g.lineCap = 'round'; g.lineWidth = 22;
  const sh = [12, -112];
  const hand = riding ? [139, -93] : [lerp(30, 76, armPose), lerp(-40, -84, armPose)];
  const elbow = riding ? [75, -96] : [lerp(20, 50, armPose), lerp(-70, -96, armPose)];
  g.beginPath(); g.moveTo(...sh); g.lineTo(...elbow); g.lineTo(...hand); g.stroke();
  g.fillStyle = '#1D2740'; g.beginPath(); g.arc(hand[0], hand[1], 11, 0, TAU); g.fill(); // eldiven
  // kask
  g.fillStyle = lg(g, -30, -200, 30, -130, [[0, '#5AA0FF'], [1, '#0E5FE0']]);
  g.beginPath(); g.ellipse(4, -160, 34, 36, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-4, -160, 34, 6, 0, Math.PI, TAU); g.fill();
  g.fillStyle = lg(g, 10, -175, 38, -140, [[0, '#2A3550'], [1, '#0B1020']]);
  g.beginPath(); g.ellipse(22, -156, 18, 20, 0.15, -Math.PI / 2, Math.PI / 2); g.fill(); // vizör
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(28, -164, 4, 9, 0.3, 0, TAU); g.fill();
  return hand;
}
function courierRiding(g, x, y, s, t) {
  g.save(); g.translate(x, y + Math.abs(Math.sin(t * 14)) * 2.5); g.scale(s, s);
  const k = 3.4; // motor: scooter ikonu (100 birim → 340 px)
  icon(g, 'scooter', 0, 0, k);
  g.save(); g.translate(-23 * k, -4 * k); g.scale(0.9, 0.9);
  g.strokeStyle = '#1D2740'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 30; // bacak: kalça → diz → ayak (paspasta)
  g.beginPath(); g.moveTo(0, -8); g.lineTo(82, 4); g.lineTo(94, 84); g.stroke();
  g.fillStyle = '#121826'; g.beginPath(); g.roundRect(84, 80, 44, 18, 8); g.fill();
  g.rotate(0.15); // öne eğilir, eller gidonda
  courierBody(g, t, true, 0, false);
  g.restore();
  glow(g, SPR.amber, 34 * k, -10 * k, 170, 0.55); // far
  g.restore();
}
function door(g, cx, base, open, t) {
  const dw = 230, dh = 430, x = cx - dw / 2, y = base - dh;
  // kasa + içerideki sıcak ışık
  g.fillStyle = '#6B4E37'; g.fillRect(x - 22, y - 22, dw + 44, dh + 22);
  g.fillStyle = lg(g, 0, y, 0, base, [[0, '#FFE8B8'], [1, '#FFB65C']]); g.fillRect(x, y, dw, dh);
  if (open > 0) glow(g, SPR.amber, cx, base - 200, 380, 0.6 * open);
  // kapı kanadı (menteşe solda, içe açılır)
  const k = 1 - 0.78 * open;
  g.save(); g.translate(x, y);
  g.fillStyle = lg(g, 0, 0, dw * k, 0, [[0, '#2457A8'], [1, '#1B4486']]); g.fillRect(0, 0, dw * k, dh);
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.fillRect(22 * k, 26, (dw - 44) * k, 150); g.fillRect(22 * k, 200, (dw - 44) * k, 200);
  g.fillStyle = '#FFD27A'; g.beginPath(); g.arc((dw - 30) * k, 230, 9, 0, TAU); g.fill();
  g.restore();
  // basamak, numara, zil
  g.fillStyle = '#B9B2A6'; g.fillRect(x - 60, base, dw + 120, 24);
  g.fillStyle = '#1B2A48'; g.beginPath(); g.roundRect(x + dw + 46, y + 40, 70, 54, 10); g.fill();
  text(g, '12', x + dw + 81, y + 80, { w: 800, s: 34, c: '#fff' });
  g.fillStyle = '#E7EBF2'; g.beginPath(); g.roundRect(x + dw + 58, y + 150, 46, 70, 10); g.fill();
  const ring = t > T.bell ? kick(t - T.bell, 3) : 0;
  g.fillStyle = ring > 0.05 ? '#FFB547' : '#9AA6BC'; g.beginPath(); g.arc(x + dw + 81, y + 185, 12, 0, TAU); g.fill();
  if (ring > 0.05) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.bell) * 2 + i / 3) % 1;
      g.strokeStyle = `rgba(255,181,71,${0.8 * (1 - ph) * ring})`; g.lineWidth = 4;
      g.beginPath(); g.arc(x + dw + 81, y + 185, 20 + ph * 60, -0.9, 0.9); g.stroke();
    }
  }
}
function scene5(g, t) {
  const cut = E.inOutCubic(prog(t, T.doorCut - 0.25, T.doorCut + 0.25));
  const ride = t - T.s5, off = ride * 900 + cut * 1400;
  sky(g, t, 1);
  mountains(g, off);
  // uzak binalar (siluet)
  g.fillStyle = '#3B3F75';
  for (const b of BLDG) { const x = b.x * 0.6 - off * 0.3; if (x > W + 50 || x + b.w * 0.6 < -50) continue; g.fillRect(x, 1260 - b.fl * 70, b.w * 0.6, b.fl * 70 + 300); }
  // yakın binalar
  for (const b of BLDG) { const x = b.x - off * 0.75; if (x > W + 50 || x + b.w < -50) continue; building(g, b, x, 1500, t); }
  street(g, t, off);
  // sürüş: kurye ortada, hız çizgileri
  if (t < T.doorCut + 0.1) {
    const ent = E.outCubic(prog(t, T.s5, T.s5 + 0.5)), ex = E.inCubic(prog(t, T.doorCut - 0.3, T.doorCut));
    const cx = lerp(-300, 520, ent) + ex * 900;
    for (let i = 0; i < 6; i++) {
      const yy = 1520 + i * 34, ln = 120 + (i % 3) * 60, xx = cx - 240 - ((t * 1400 + i * 97) % 300);
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - ln, yy); g.stroke();
    }
    courierRiding(g, cx, 1610, 1.3, t);
  }
  // kapı sahnesi
  const da = E.inOutCubic(prog(t, T.doorCut - 0.05, T.doorCut + 0.35));
  if (da > 0) {
    g.save(); g.translate((1 - da) * W, 0);
    g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#F4E6CF'], [1, '#E8D3B3']]); g.fillRect(-100, -100, W + 200, H + 200);
    g.fillStyle = 'rgba(0,0,0,0.05)'; for (let y = 120; y < 1660; y += 90) g.fillRect(0, y, W, 3);
    g.fillStyle = '#B9B2A6'; g.fillRect(-100, 1660, W + 200, 40);
    g.fillStyle = '#9C958A'; g.fillRect(-100, 1700, W + 200, 300);
    // saksı
    g.fillStyle = '#C8643B'; g.beginPath(); g.moveTo(130, 1560); g.lineTo(210, 1560); g.lineTo(196, 1660); g.lineTo(144, 1660); g.closePath(); g.fill();
    for (const [dx, a] of [[-26, -0.5], [0, 0], [26, 0.5], [-12, -0.2], [12, 0.25]]) { g.save(); g.translate(170 + dx, 1560); g.rotate(a); g.fillStyle = '#4CAF50'; g.beginPath(); g.ellipse(0, -40, 12, 44, 0, 0, TAU); g.fill(); g.restore(); }
    const op = E.outCubic(prog(t, T.open, T.open + 0.5));
    door(g, 700, 1660, op, t);
    // kurye ayakta, poşeti uzatır
    const arm = E.inOutCubic(prog(t, T.hand - 0.2, T.hand + 0.3));
    const walk = E.outCubic(prog(t, T.doorCut, T.doorCut + 0.5));
    const wph = walk < 1 ? (t - T.doorCut) * 13 : 0;
    g.save(); g.translate(lerp(-120, 330, walk), 1556 - Math.abs(Math.sin(wph)) * 8); g.scale(2.3, 2.3);
    const hnd = courierBody(g, t, false, arm, true, wph);
    const bx = hnd[0] + 4, by = hnd[1] + 32;
    g.restore();
    // kapıdan uzanan el (müşteri) poşeti alır
    const reach = E.inOutCubic(prog(t, T.hand + 0.1, T.hand + 0.55));
    const [px, py] = [lerp(-120, 330, walk) + bx * 2.3, 1556 + by * 2.3];
    if (reach > 0) {
      const hx = lerp(700, px + 70, reach), hy = lerp(1330, py - 70, reach);
      g.strokeStyle = '#9B3B4A'; g.lineCap = 'round'; g.lineWidth = 46;
      g.beginPath(); g.moveTo(760, 1360); g.quadraticCurveTo((760 + hx) / 2, hy - 20, hx, hy); g.stroke();
      g.fillStyle = '#E9B48C'; g.beginPath(); g.ellipse(hx - 14, hy, 26, 20, 0.2, 0, TAU); g.fill();
    }
    icon(g, 'bag', px, py, 0.95 * 2.3);
    if (t > T.hand + 0.2) for (const [dx, dy, d] of [[620, 1060, 0], [800, 990, 0.15], [520, 1180, 0.3]]) twinkle(g, dx, dy, 26, Math.max(0, Math.sin((t - T.hand - 0.2 - d) * 3)), t);
    g.restore();
  }
  // başlık + ilerleme
  g.save(); g.fillStyle = lg(g, 0, 0, 0, 620, [[0, `rgba(10,20,60,${0.55 + 0.3 * da})`], [0.6, `rgba(10,20,60,${0.3 + 0.3 * da})`], [1, 'rgba(10,20,60,0)']]); g.fillRect(0, 0, W, 620); g.restore();
  stepper(g, t); headlines(g, t);
}



/* ───────────── uygulamadaki ince çizgi arayüz ikonları ───────────── */
function uiIcon(g, name, x, y, size, col) {
  g.save(); g.translate(x, y); g.scale(size / 24, size / 24);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round';
  const st = () => g.stroke(), b = () => g.beginPath();
  switch (name) {
    case 'globe': b(); g.arc(0, 0, 9, 0, TAU); st(); b(); g.ellipse(0, 0, 4, 9, 0, 0, TAU); st(); b(); g.moveTo(-9, 0); g.lineTo(9, 0); st(); break;
    case 'user': b(); g.arc(0, -4, 4.5, 0, TAU); st(); b(); g.moveTo(-7.5, 9); g.quadraticCurveTo(-7, 2, 0, 2); g.quadraticCurveTo(7, 2, 7.5, 9); st(); break;
    case 'history': b(); g.arc(0, 0, 8.5, -2.6, 2.4); st(); b(); g.moveTo(-9.5, -6); g.lineTo(-7, -2.5); g.lineTo(-3.5, -4.5); st(); b(); g.moveTo(0, -4); g.lineTo(0, 0); g.lineTo(3, 2); st(); break;
    case 'cart': b(); g.moveTo(-10, -8); g.lineTo(-7, -8); g.lineTo(-4.5, 5); g.lineTo(7, 5); g.lineTo(9, -4); g.lineTo(-6, -4); st(); b(); g.arc(-3, 9, 1.6, 0, TAU); g.arc(6, 9, 1.6, 0, TAU); g.fill(); break;
    case 'locate': b(); g.arc(0, 0, 6, 0, TAU); st(); b(); g.arc(0, 0, 2, 0, TAU); g.fill(); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { b(); g.moveTo(dx * 7, dy * 7); g.lineTo(dx * 10, dy * 10); st(); } break;
    case 'spark': b(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); g.quadraticCurveTo(0, 0, Math.cos(a + Math.PI / 2) * 9, Math.sin(a + Math.PI / 2) * 9); } st(); break;
    case 'nav': b(); g.moveTo(8, -8); g.lineTo(-8, -1); g.lineTo(-1, 1); g.lineTo(1, 8); g.closePath(); st(); break;
    case 'star': b(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); st(); break;
    case 'bolt': b(); g.moveTo(2, -10); g.lineTo(-6, 2); g.lineTo(0, 2); g.lineTo(-2, 10); g.lineTo(6, -2); g.lineTo(0, -2); g.closePath(); st(); break;
    case 'search': b(); g.arc(-2, -2, 6.5, 0, TAU); st(); b(); g.moveTo(3, 3); g.lineTo(8, 8); st(); break;
    case 'home': b(); g.moveTo(-9, -1); g.lineTo(0, -9); g.lineTo(9, -1); g.lineTo(9, 9); g.lineTo(-9, 9); g.closePath(); st(); break;
    case 'grid': for (const [dx, dy] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { b(); g.roundRect(dx - 3.5, dy - 3.5, 7, 7, 2); st(); } break;
    case 'list': b(); g.roundRect(-8, -10, 16, 20, 3); st(); b(); g.moveTo(-4, -4); g.lineTo(4, -4); g.moveTo(-4, 0); g.lineTo(4, 0); g.moveTo(-4, 4); g.lineTo(1, 4); st(); break;
    case 'chevR': b(); g.moveTo(-3, -7); g.lineTo(4, 0); g.lineTo(-3, 7); st(); break;
  }
  g.restore();
}

/* ───────────── kapanış ───────────── */
const CONF4 = makeConfetti(99, 50, ['#1F73F0', '#FFB547', '#3B8BFF', '#22C55E', '#FF7A1A'], 800, 1900);
function scene6(g, t) {
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
  for (const [n, x, y, sc, r, d] of [['milk', 175, 395, 1.3, -0.15, 0], ['bread', 915, 380, 1.3, 0.2, 0.06], ['water', 160, 1690, 1.2, 0.12, 0.12], ['chips', 925, 1700, 1.2, -0.1, 0.18]]) {
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
    const o = { w: 800, s: 46, ls: 8 }, tw = measure(g, 'ANDIRIN', o);
    const pw = tw + 124, ph = 82, right = pxFinal + LOGO.textR * k, tx = right - pw / 2, ty = py0 + LOGO.textB * k + 74;
    g.save(); g.translate(tx, ty); g.scale(tg, tg); g.rotate((1 - clamp(tg)) * 0.3);
    pill(g, 0, 0, pw, ph, lg(g, 0, -ph / 2, 0, ph / 2, [[0, '#FFB24A'], [1, '#FF6A1A']]), 'rgba(255,106,26,0.4)');
    g.save(); g.translate(-pw / 2 + 48, 4); g.scale(0.42, 0.42); micon(g, 'pin', '#fff', 0); g.restore();
    text(g, 'ANDIRIN', 30, 17, { ...o, c: '#fff' });
    g.restore();
  }
  confetti(g, CONF4, t, T.tag, 540, cy, 2.0);
  // slogan ve mağazalar
  const so = fit(g, "Andırın'ın marketi, cebinde!", { w: 800, s: 92, c: C.ink }, 980);
  slotText(g, "Andırın'ın marketi, cebinde!", 540, 1215, so, prog(t, T.slogan, T.slogan + 0.55), 0, 0.02);
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
