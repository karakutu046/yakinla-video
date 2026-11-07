'use strict';
/* Yakınla Market Andırın — videoya özel sahneler (ortak parçalar base.js'te, zamanlar timeline.js'te). */

/* ───────────── 1. DUYURU (0–3.6): Andırın'ın dağları, pin iner, kurdele kesilir ───────────── */
const TOWN = (() => { // dağ eteğinde alçak evler
  const r = mulberry32(44), a = [];
  for (let i = 0; i < 26; i++) {
    const x = -40 + i * 46 + r() * 20, w = 44 + r() * 40, h = 36 + r() * 46, y = 1440 + Math.sin(i * 0.7) * 16 + r() * 24;
    a.push({ x, w, h, y, c: ['#F3E3C8', '#EBD2B4', '#DCE6F2', '#F1D7CB'][i % 4], roof: ['#D9573A', '#C64A2F', '#B85B3E'][i % 3], lit: r() < 0.5 });
  }
  return a.sort((p, q) => p.y - q.y);
})();
const PINES = (() => { const r = mulberry32(71), a = []; for (let i = 0; i < 90; i++) a.push([r() * W, 1180 + r() * 260, 26 + r() * 40]); return a.sort((p, q) => p[1] - q[1]); })();
function landscape(g, t) {
  g.fillStyle = lg(g, 0, 0, 0, 1500, [[0, '#2F7BEA'], [0.45, '#7FB8FF'], [0.85, '#FFE2B6'], [1, '#FFD39A']]);
  g.fillRect(-200, -200, W + 400, H + 400);
  glow(g, SPR.amber, 820, 1000, 600, 0.45);
  glow(g, SPR.white, 820, 1000, 260, 0.6);
  // üç kat dağ: uzak (mavi) → orta (yeşil-mavi, çamlı) → yakın (koyu yeşil, çamlı)
  const layer = (base, amp, fr, col, sd, pines, pc) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(-50, H + 50);
    const ys = [];
    for (let x = -50; x <= W + 50; x += 10) {
      const u = x * fr + sd, y = base - amp * (0.55 + 0.3 * Math.sin(u) + 0.15 * Math.sin(u * 2.3 + 1) + 0.06 * Math.sin(u * 5.7));
      ys.push([x, y]); g.lineTo(x, y);
    }
    g.lineTo(W + 50, H + 50); g.closePath(); g.fill();
    if (pines) { const r = mulberry32(sd * 13); for (const [x, y] of ys) if (r() < 0.55) pine(g, x + r() * 8, y + 14 + r() * 50, 18 + r() * 18, pc); }
  };
  layer(1080, 300, 0.0032, '#7E9CCB', 2, false);
  layer(1200, 240, 0.0052, '#4E7A84', 5, true, '#3C6670');
  layer(1330, 150, 0.0075, '#2F5D4C', 9, true, '#24493B');
  for (const [x, y, h] of PINES) pine(g, x, y, h, '#1E4234');
  // kasaba
  for (const b of TOWN) {
    g.fillStyle = b.c; g.fillRect(b.x, b.y - b.h, b.w, b.h + 200);
    g.fillStyle = b.roof; g.beginPath(); g.moveTo(b.x - 6, b.y - b.h); g.lineTo(b.x + b.w / 2, b.y - b.h - 22); g.lineTo(b.x + b.w + 6, b.y - b.h); g.closePath(); g.fill();
    g.fillStyle = b.lit ? '#FFD27A' : '#8DA2C0'; g.fillRect(b.x + b.w * 0.25, b.y - b.h * 0.65, b.w * 0.18, b.h * 0.22); g.fillRect(b.x + b.w * 0.6, b.y - b.h * 0.65, b.w * 0.18, b.h * 0.22);
  }
  g.fillStyle = lg(g, 0, 1460, 0, H, [[0, '#3E6B4F'], [1, '#22412F']]); g.fillRect(-100, 1500, W + 200, H);
}
function scene1(g, t) {
  landscape(g, t);
  // pin iner: Andırın
  const PX = 540, PY = 1300, drop = prog(t, T.pinDrop, T.pinDrop + 0.42);
  if (drop > 0) {
    const land = t > T.pinDrop + 0.42 ? t - T.pinDrop - 0.42 : -1;
    const y = lerp(-500, PY, E.inQuad(drop)) + (land > 0 ? -Math.abs(Math.sin(land * 9)) * 40 * Math.exp(-land * 5) : 0);
    const sq = land > 0 ? 0.18 * Math.exp(-land * 8) * Math.cos(land * 30) : 0;
    if (land > 0) {
      for (let i = 0; i < 3; i++) { // zemin halkaları
        const ph = ((land * 0.9) + i / 3) % 1;
        g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - ph)})`; g.lineWidth = 6;
        g.beginPath(); g.ellipse(PX, PY + 6, 40 + ph * 330, (40 + ph * 330) * 0.28, 0, 0, TAU); g.stroke();
      }
    }
    contactShadow(g, PX, PY + 8, 120 * clamp(drop), 0.45);
    g.save(); g.translate(PX, y); g.scale(1 + sq, 1 - sq); g.translate(-PX, -y);
    drawLogo(g, PX, y - 0.393 * 420, 420, { glint: lerp(-0.3, 1.3, prog(t, T.label, T.label + 0.6)) });
    g.restore();
  }
  // Andırın etiketi
  const lp = E.outBack(prog(t, T.label, T.label + 0.4));
  if (lp > 0) {
    g.save(); g.translate(540, 1390); g.scale(lp, lp);
    const o = { w: 800, s: 46, ls: 6 }, s = 'ANDIRIN', tw = measure(g, s, o);
    pill(g, 0, 0, tw + 150, 90, '#fff', 'rgba(0,20,60,0.35)');
    g.save(); g.translate(-tw / 2 - 30, 4); g.scale(0.5, 0.5); micon(g, 'pin', C.blue, 0); g.restore();
    text(g, s, 26, 16, { ...o, c: C.ink });
    g.shadowColor = 'rgba(0,20,40,0.85)'; g.shadowBlur = 12;
    text(g, 'Kahramanmaraş', 0, 80, { f: 'Txt', w: 700, s: 27, c: '#fff' });
    g.shadowColor = 'transparent';
    g.restore();
  }
  // üst: MÜJDE ANDIRIN!
  const kp = spring(t - T.kick, 1.8, 7);
  if (kp > 0) {
    g.save(); g.translate(540, 300); g.scale(kp, kp); g.rotate((1 - clamp(kp)) * -0.1);
    const o = { w: 900, s: 60, ls: 5 }, tw = measure(g, 'MÜJDE ANDIRIN!', o);
    pill(g, 0, 0, tw + 110, 112, lg(g, 0, -56, 0, 56, [[0, '#FFD36B'], [1, '#FF9B2F']]), 'rgba(255,140,30,0.45)');
    text(g, 'MÜJDE ANDIRIN!', 3, 22, { ...o, c: '#3A1A00' });
    g.restore();
  }
  // "Yakınla Market / Andırın'da"
  const tp = prog(t, T.title, T.title + 0.55);
  if (tp > 0) {
    g.save(); g.shadowColor = 'rgba(0,20,70,0.45)'; g.shadowBlur = 26; g.shadowOffsetY = 6;
    brandTitle(g, 'Market', 560, tp);
    slotText(g, "Andırın'da", 540, 700, { w: 800, s: 96, c: '#fff' }, prog(t, T.title + 0.3, T.title + 0.8), 0, 0.04);
    g.restore();
  }
  // kurdele + makas
  const rin = E.outCubic(prog(t, T.ribbonIn, T.ribbonIn + 0.45)), cut = prog(t, T.cut, T.cut + 0.8);
  if (rin > 0 && cut < 1) {
    g.save(); g.translate((1 - rin) * -1200, 0); ribbon(g, 1600, cut, t); g.restore();
  }
  const sc = prog(t, T.snip - 0.35, T.snip), so = t < T.cut ? Math.max(0, Math.sin(prog(t, T.snip, T.cut) * Math.PI)) : 0;
  if (sc > 0 && t < T.cut + 0.5) {
    const out = E.inCubic(prog(t, T.cut + 0.1, T.cut + 0.5));
    scissors(g, lerp(1300, 700, E.outCubic(sc)) + out * 700, 1610 - out * 300, so, 1.3, Math.PI - 0.12);
  }
  if (t > T.cut) {
    glow(g, SPR.white, 540, 1600, 520, 0.8 * kick(t - T.cut, 6));
    shockwave(g, 540, 1600, t, T.cut, 800, '255,214,140', 22, 0.6);
    confetti(g, CONF_OPEN, t, T.cut, 540, 1590, 1.6);
  }
  const sl = slam(t, T.acildi, 2.6);
  if (sl) {
    g.save(); g.globalAlpha *= sl.al; g.translate(540, 1720); g.scale(sl.sc, sl.sc);
    glow(g, SPR.amber, 0, -60, 520, 0.35);
    heroWord(g, 'AÇILDI!', 0, 70, { w: 900, s: 210, ls: 4 }, 12);
    g.restore();
  }
}
const CONF_OPEN = makeConfetti(23, 60, ['#FFD36B', '#FFFFFF', '#FF4D5E', '#3B8BFF', '#22C55E', '#FF7A1A'], 900, 2100);
// Beyaz logo yazısı + renkli ikinci kelime ("Market" / "Yemek"), ortalı
function brandTitle(g, word, base, p, col = ['#FFC24D', '#FFA63D']) {
  const wm = SPR.wmWhite, o = { w: 800, s: TITLE3.fs, ls: TITLE3.fs * 0.015 };
  const yw = measure(g, word, o), gap = TITLE3.fs * 0.26, gw = wm.width + gap + yw, x0 = 540 - gw / 2;
  g.save(); g.beginPath(); g.rect(0, base - 170, W, 220); g.clip();
  const p0 = E.outExpo(clamp(p * 1.3));
  g.drawImage(wm, x0, base - LOGO.wmBase * TITLE3.k + (1 - p0) * 190);
  letters(g, word, x0 + wm.width + gap, base, { ...o, a: 'left' }, (i) => {
    const pi = E.outExpo(clamp(p * 1.5 - 0.25 - i * 0.06));
    return { dy: (1 - pi) * 190, c: i < 2 ? col[0] : col[1] };
  });
  g.restore();
}

/* ───────────── 2. UYGULAMA (3.6–7.9): indir → ana ekran → Market → sepet ───────────── */
const STORE_BTN = [SW - 110, 292];
function screenStore(g, t) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  uiIcon(g, 'chevR', 32, 100, 24, C.blue); // (geri oku yerine sade)
  text(g, 'Uygulamalar', 50, 108, { f: 'Txt', w: 600, s: 21, a: 'left', c: C.blue });
  // uygulama başlığı
  g.save(); g.shadowColor = 'rgba(11,27,51,0.18)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(28, 160, 150, 150, 36); g.fill(); g.restore();
  g.strokeStyle = '#E6ECF5'; g.lineWidth = 2; g.beginPath(); g.roundRect(28, 160, 150, 150, 36); g.stroke();
  drawLogo(g, 103, 236, 140);
  text(g, 'Yakınla', 200, 205, { f: 'Txt', w: 700, s: 34, a: 'left', c: C.ink });
  text(g, 'Market & Yemek siparişi', 200, 240, { f: 'Txt', w: 500, s: 20, a: 'left', c: C.inkSoft });
  // İndir düğmesi → ilerleme halkası → Aç
  const [bx, by] = STORE_BTN, inst = prog(t, T.tapInstall + 0.05, T.installed), done = t >= T.installed;
  const pr = kick(t - T.tapInstall, 14) * (t > T.tapInstall ? 1 : 0);
  g.save(); g.translate(bx, by); g.scale(1 - pr * 0.08, 1 - pr * 0.08);
  if (t < T.tapInstall + 0.05 || done) {
    g.fillStyle = lg(g, 0, -28, 0, 28, [[0, '#3B8BFF'], [1, '#0E5FE0']]); g.beginPath(); g.roundRect(-78, -28, 156, 56, 28); g.fill();
    text(g, done ? 'Aç' : 'İndir', 0, 9, { f: 'Txt', w: 700, s: 24, c: '#fff' });
  } else {
    g.strokeStyle = '#E3E9F2'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.stroke();
    g.strokeStyle = C.blue; g.beginPath(); g.arc(0, 0, 24, -Math.PI / 2, -Math.PI / 2 + TAU * E.inOutCubic(inst)); g.stroke();
    g.fillStyle = C.blue; g.fillRect(-7, -7, 14, 14);
  }
  g.restore();
  // bilgi şeridi
  g.fillStyle = '#E6ECF5'; g.fillRect(28, 340, SW - 56, 2);
  [['Kategori', 'Alışveriş'], ['Konum', 'Andırın'], ['Geliştirici', 'Karakutu']].forEach(([a, b], k) => {
    const x = 28 + (SW - 56) / 6 + k * (SW - 56) / 3;
    text(g, a, x, 384, { f: 'Txt', w: 600, s: 16, c: '#8A93A6' });
    text(g, b, x, 418, { f: 'Txt', w: 700, s: 21, c: C.ink });
  });
  g.fillStyle = '#E6ECF5'; g.fillRect(28, 448, SW - 56, 2);
  // ekran görüntüleri şeridi (uygulamanın kendi kart görselleri)
  text(g, 'Önizleme', 28, 500, { f: 'Txt', w: 700, s: 26, a: 'left', c: C.ink });
  const shots = [SPR.cardMarket, SPR.cardYemek], sw = 220, sh = 400;
  shots.forEach((img, k) => {
    const x = 28 + k * (sw + 18), y = 530;
    g.save(); g.shadowColor = 'rgba(11,27,51,0.15)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
    g.fillStyle = '#F4F6FB'; g.beginPath(); g.roundRect(x, y, sw, sh, 26); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, sw, sh, 26); g.clip();
    g.fillStyle = lg(g, 0, y, 0, y + sh, [[0, '#EAF2FF'], [1, '#FFFFFF']]); g.fillRect(x, y, sw, sh);
    const ih = sw * img.height / img.width; g.drawImage(img, x, y + sh - ih - 20, sw, ih);
    drawLogo(g, x + sw / 2, y + 80, 90);
    g.restore();
  });
  g.save(); g.beginPath(); g.roundRect(28 + 2 * (sw + 18), 530, sw, 400, 26); g.clip(); g.fillStyle = '#EEF3FB'; g.fillRect(0, 530, SW, 400); g.restore();
  // yükleme tamamlanınca hafif parıltı
  if (done) glow(g, SPR.blue, bx, by, 160, 0.5 * kick(t - T.installed, 5));
}

// Market ekranı: kategori çipleri + ürün ızgarası + mavi sepet çubuğu
const PRODUCTS = [['milk', 'Süt'], ['bread', 'Ekmek'], ['chips', 'Cips'], ['eggs', 'Yumurta'], ['water', 'Su'], ['drink', 'İçecek']];
const ADD_IDX = [0, 1, 2];
const TILE = { x0: 24, y0: 392, w: (SW - 48 - 16) / 2, h: 228, gap: 16 };
const tileXY = i => [TILE.x0 + (i % 2) * (TILE.w + TILE.gap), TILE.y0 + Math.floor(i / 2) * (TILE.h + TILE.gap)];
const tPlus = i => { const [x, y] = tileXY(i); return [x + TILE.w - 40, y + TILE.h - 40]; };
const MBAR = { x: 18, y: SH - 128, h: 104 };
const mCart = () => [MBAR.x + 56, MBAR.y + MBAR.h / 2];
const mOrder = () => [SW - 120, MBAR.y + MBAR.h / 2];
function mCount(t) { let n = 0; for (const a of T.adds) if (t >= a + 0.36) n++; return n; }
function screenMarket(g, t) {
  g.fillStyle = '#F4F6FB'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, 232);
  statusBar(g);
  drawLogo(g, 48, 103, 78);
  text(g, 'YAKINLA', 90, 92, { f: 'Txt', w: 700, s: 15, a: 'left', c: '#8A93A6', ls: 1.5 });
  text(g, 'Market', 90, 124, { f: 'Txt', w: 700, s: 30, a: 'left', c: C.ink });
  shadowCard(g, SW - 80, 74, 54, 54, 16, 0.1); uiIcon(g, 'search', SW - 53, 101, 26, C.ink);
  g.fillStyle = lg(g, 0, 0, SW, 0, [[0, '#1F73F0'], [1, '#3B8BFF']]); g.fillRect(0, 154, SW, 64);
  g.save(); g.translate(30, 188); g.scale(0.4, 0.4); micon(g, 'pin', '#fff', 0); g.restore();
  text(g, 'Ev', 52, 195, { f: 'Txt', w: 700, s: 21, a: 'left', c: '#fff' });
  text(g, '· Andırın, Kahramanmaraş', 80, 195, { f: 'Txt', w: 500, s: 20, a: 'left', c: 'rgba(255,255,255,0.88)' });
  // kategoriler
  let cx = 24;
  ['Tümü', 'Süt & Kahvaltılık', 'Atıştırmalık', 'İçecek'].forEach((s, k) => {
    const o = { f: 'Txt', w: 600, s: 19 }, w = measure(g, s, o) + 36;
    g.fillStyle = k === 0 ? C.blue : '#E8F0FE'; g.beginPath(); g.roundRect(cx, 248, w, 48, 24); g.fill();
    text(g, s, cx + w / 2, 279, { ...o, c: k === 0 ? '#fff' : C.blue });
    cx += w + 10;
  });
  text(g, 'Andırın deposundan', 24, 356, { f: 'Txt', w: 700, s: 25, a: 'left', c: C.ink });
  PRODUCTS.forEach(([ic, name], i) => {
    const [x, y] = tileXY(i), t0 = T.openMarket + 0.2 + i * 0.05, p = prog(t, t0, t0 + 0.4);
    if (p <= 0) return;
    const s = E.outBack(p);
    g.save(); g.translate(x + TILE.w / 2, y + TILE.h / 2); g.scale(s, s); g.translate(-(x + TILE.w / 2), -(y + TILE.h / 2));
    shadowCard(g, x, y, TILE.w, TILE.h, 24, 0.07);
    g.fillStyle = '#F1F6FD'; g.beginPath(); g.roundRect(x + 10, y + 10, TILE.w - 20, 140, 18); g.fill();
    const k = ADD_IDX.indexOf(i), tap = k >= 0 ? T.adds[k] : 99;
    const gone = t > tap ? 1 - 0.7 * prog(t, tap, tap + 0.04) * (1 - prog(t, tap + 0.36, tap + 0.56)) : 1;
    icon(g, ic, x + TILE.w / 2, y + 82, 1.05, 0, gone);
    text(g, name, x + 20, y + TILE.h - 28, { f: 'Txt', w: 700, s: 24, a: 'left', c: C.ink });
    const [bx, by] = tPlus(i), done = t > tap + 0.05;
    const pr = kick(t - tap, 14) * (t > tap ? 1 : 0);
    g.save(); g.translate(bx, by); g.scale(1 - pr * 0.25, 1 - pr * 0.25);
    g.fillStyle = done ? lg(g, 0, -24, 0, 24, [[0, '#4ADE80'], [1, '#16A34A']]) : lg(g, 0, -24, 0, 24, [[0, '#4C97FF'], [1, '#0E5FE0']]);
    g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fill();
    miconAt(g, done ? 'check' : 'plus', 0, 0, 30, '#fff', 11);
    g.restore();
    g.restore();
  });
  // sepet çubuğu
  const cb = E.outExpo(prog(t, T.adds[0] + 0.25, T.adds[0] + 0.55));
  if (cb > 0) {
    g.save(); g.translate(0, (1 - cb) * 220);
    g.save(); g.shadowColor = 'rgba(31,115,240,0.45)'; g.shadowBlur = 26; g.shadowOffsetY = 10;
    g.fillStyle = lg(g, 0, MBAR.y, 0, MBAR.y + MBAR.h, [[0, '#2F80F5'], [1, '#0E5FE0']]);
    g.beginPath(); g.roundRect(MBAR.x, MBAR.y, SW - 2 * MBAR.x, MBAR.h, 30); g.fill(); g.restore();
    const [gx, gy] = mCart(), n = mCount(t);
    let bump = 0; for (const a of T.adds) if (t > a + 0.36) bump += 0.4 * kick(t - a - 0.36, 9) * Math.cos((t - a - 0.36) * 30);
    g.save(); g.translate(gx, gy); g.scale(1 + bump * 0.5, 1 + bump * 0.5);
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.roundRect(-34, -34, 68, 68, 20); g.fill();
    uiIcon(g, 'cart', 0, 2, 34, '#fff');
    if (n > 0) { g.translate(26, -28); g.scale(1 + bump, 1 + bump); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fill(); text(g, String(n), 0, 7, { f: 'Txt', w: 700, s: 20, c: C.blue }); }
    g.restore();
    text(g, `${n} ürün`, gx + 56, gy + 10, { f: 'Txt', w: 700, s: 28, a: 'left', c: '#fff' });
    const [ox, oy] = mOrder(), pr = kick(t - T.order, 14) * (t > T.order ? 1 : 0);
    g.save(); g.translate(ox, oy); g.scale(1 - pr * 0.08, 1 - pr * 0.08);
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-96, -30, 192, 60, 20); g.fill();
    text(g, 'Siparişi ver', -10, 8, { f: 'Txt', w: 700, s: 21, c: C.blue });
    uiIcon(g, 'chevR', 74, 0, 22, C.blue);
    g.restore();
    g.restore();
  }
  T.adds.forEach((a, k) => {
    const p = prog(t, a + 0.02, a + 0.36); if (p <= 0 || p >= 1) return;
    const i = ADD_IDX[k], [x, y] = tileXY(i), e = E.inOutCubic(p), [x1, y1] = mCart();
    const x0 = x + TILE.w / 2, y0 = y + 82, cxp = (x0 + x1) / 2 + 150, cyp = Math.min(y0, y1) - 120;
    icon(g, PRODUCTS[i][0], bez2(x0, cxp, x1, e), bez2(y0, cyp, y1, e), lerp(1.05, 0.3, E.inCubic(p)), e * 1.8);
  });
  T.adds.forEach((a, k) => ripple(g, ...tPlus(ADD_IDX[k]), t, a));
  ripple(g, ...mOrder(), t, T.order, '255,255,255');
  const ok = prog(t, T.done, T.done + 0.3);
  if (ok > 0) {
    g.fillStyle = `rgba(255,255,255,${0.94 * E.outCubic(prog(t, T.done, T.done + 0.18))})`; g.fillRect(0, 0, SW, SH);
    icon(g, 'seal', SW / 2, SH / 2 - 60, 2.4 * E.outBack(ok), (1 - E.outBack(ok)) * -0.6);
    const tp = E.outExpo(prog(t, T.done + 0.12, T.done + 0.45));
    g.save(); g.globalAlpha *= tp;
    text(g, 'Siparişin alındı!', SW / 2, SH / 2 + 110 + (1 - tp) * 30, { f: 'Txt', w: 700, s: 36, c: C.ink });
    text(g, 'Andırın deposundan hazırlanıyor', SW / 2, SH / 2 + 152 + (1 - tp) * 30, { f: 'Txt', w: 500, s: 21, c: C.inkSoft });
    g.restore();
  }
}
function phoneScreen(g, t) {
  if (t < T.home) { screenStore(g, t); return; }
  if (t < T.home + 0.3) { const p = E.inOutCubic(prog(t, T.home, T.home + 0.3)); screenHome(g, t); g.save(); g.globalAlpha = 1 - p; g.translate(0, -p * 60); screenStore(g, t); g.restore(); return; }
  if (t < T.openMarket) { screenHome(g, t); return; }
  const op = E.inOutCubic(prog(t, T.openMarket, T.openMarket + 0.38));
  if (op < 1) screenHome(g, t);
  g.save(); g.beginPath();
  g.roundRect(lerp(24, 0, op), lerp(HOME.market, 0, op), lerp(SW - 48, SW, op), lerp(HOME.cardH, SH, op), lerp(28, 0, op)); g.clip();
  screenMarket(g, t);
  g.restore();
}
function fingerAt(t) {
  const keys = [
    [SW + 80, SH - 60, T.tapInstall - 0.7], [...STORE_BTN, T.tapInstall],
    [SW / 2 + 60, HOME.market + 190, T.tapMarket],
    ...T.adds.map((a, k) => [...tPlus(ADD_IDX[k]), a]),
    [...mOrder(), T.order], [SW + 100, SH + 120, T.order + 0.45],
  ];
  if (t < keys[0][2] || t > keys[keys.length - 1][2]) return null;
  let x = keys[0][0], y = keys[0][1];
  for (let k = 0; k < keys.length - 1; k++) {
    const a = keys[k], b = keys[k + 1];
    if (t <= b[2]) { const p = E.inOutCubic(prog(t, a[2] + 0.08, b[2] - 0.05)); x = lerp(a[0], b[0], p); y = lerp(a[1], b[1], p) - Math.sin(p * Math.PI) * 40; break; }
  }
  let press = 0;
  for (const tp of [T.tapInstall, T.tapMarket, ...T.adds, T.order]) press = Math.max(press, t > tp ? kick(t - tp, 12) : prog(t, tp - 0.06, tp));
  const hide = t > T.tapMarket + 0.22 && t < T.adds[0] - 0.4;
  return [x, y, press, prog(t, keys[0][2], keys[0][2] + 0.2) * (1 - prog(t, T.order + 0.25, T.order + 0.45)) * (hide ? 0 : 1)];
}
const H2 = [{ s: 'Hemen indir!', a: T.s2, b: T.h2 }, { s: 'Siparişini ver!', a: T.h2, b: T.s5 }];
function scene2(g, t) {
  bgSteps(g, t);
  H2.forEach((L, i) => {
    if (t < L.a || t > L.b + 0.3) return;
    const o = fit(g, L.s, { w: 800, s: 120, c: '#fff' }, 980);
    g.save(); g.shadowColor = 'rgba(0,10,40,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 6;
    slotText(g, L.s, 540, 380, o, prog(t, L.a + 0.05, L.a + 0.5), i === 0 ? prog(t, L.b - 0.05, L.b + 0.2) : 0, 0.035);
    g.restore();
  });
  // App Store · Google Play rozetleri (indir başlığının altında)
  const ap = E.outBack(prog(t, T.s2 + 0.15, T.s2 + 0.5)) * (1 - E.inBack(prog(t, T.h2 - 0.1, T.h2 + 0.15)));
  if (ap > 0.01) [['App Store', 360], ['Google Play', 720]].forEach(([s, x]) => {
    g.save(); g.translate(x, 500); g.scale(ap, ap);
    pill(g, 0, 0, 320, 84, lg(g, 0, -42, 0, 42, [[0, '#1B2A48'], [1, '#0B1B33']]), 'rgba(0,10,40,0.35)');
    miconAt(g, 'down', -104, -2, 34, '#fff', 9);
    text(g, s, 22, 11, { f: 'Txt', w: 700, s: 31, c: '#fff' });
    g.restore();
  });
  const xf = phoneXf(t);
  drawPhone(g, t, xf, phoneScreen);
  const fp = fingerAt(t);
  if (fp) { const [x, y] = phoneToWorld(xf, fp[0], fp[1]); finger(g, x, y, fp[2], fp[3]); }
  return xf;
}

/* ───────────── 3. HIZ (7.9–12.1): kurye + "ortalama 60 dakikada" sayacı ───────────── */
function stepper() {} // base.js'teki kurye sahnesi bu videoda adım göstergesi yerine sayacı çizer
function headlines(g, t) { hud(g, t); }
function hud(g, t) {
  const a = E.outBack(prog(t, T.s5 + 0.2, T.s5 + 0.6)); if (a <= 0) return;
  const cx = 540, cy = 410, R = 150;
  g.save(); g.translate(cx, cy); g.scale(a, a);
  g.save(); g.shadowColor = 'rgba(0,10,40,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 12;
  g.fillStyle = 'rgba(8,22,60,0.72)'; g.beginPath(); g.arc(0, 0, R + 34, 0, TAU); g.fill(); g.restore();
  const cp = E.outCubic(prog(t, T.count0, T.count1));
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  if (cp > 0) {
    g.strokeStyle = lg(g, -R, -R, R, R, [[0, '#FFE58A'], [1, '#FF8A1F']]); g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + TAU * cp); g.stroke();
    const ea = -Math.PI / 2 + TAU * cp; glow(g, SPR.amber, Math.cos(ea) * R, Math.sin(ea) * R, 90, 0.8 * (1 - prog(t, T.count1, T.count1 + 0.4)));
  }
  const n = Math.round(60 * cp), land = t > T.count1 ? wobble(t - T.count1, 0.14, 9, 34) : 0;
  g.save(); g.scale(1 + land, 1 + land);
  text(g, String(n), 0, 52, { w: 900, s: 168, c: '#fff', ls: -4 });
  text(g, 'dk', 0, 104, { f: 'Txt', w: 700, s: 30, c: 'rgba(255,255,255,0.8)' });
  g.restore();
  g.restore();
  const op = E.outBack(prog(t, T.ortalama, T.ortalama + 0.35));
  if (op > 0) {
    g.save(); g.translate(540, 210); g.scale(op, op);
    pill(g, 0, 0, 260, 72, lg(g, 0, -36, 0, 36, [[0, '#FFD36B'], [1, '#FF9B2F']]), 'rgba(255,140,30,0.45)');
    text(g, 'ortalama', 0, 13, { f: 'Txt', w: 700, s: 36, c: '#3A1A00' });
    g.restore();
  }
  g.save(); g.shadowColor = 'rgba(0,10,40,0.5)'; g.shadowBlur = 24;
  slotText(g, 'dakikada kapında!', 540, 700, { w: 800, s: 92, c: '#fff' }, prog(t, T.kapinda - 0.35, T.kapinda + 0.2), 0, 0.03);
  g.restore();
}
function scene3(g, t) { scene5(g, t); } // base.js: sokak + motorlu kurye + kapıda teslim (+ hud)

/* ───────────── 4. TEASER (12.1–16.2): Yakınla Yemek çok yakında ───────────── */
function scene4(g, t) {
  bgNight(g, t);
  // arkada bulanık yemekler
  for (const [n, x, y, sc, r] of [['burger', 160, 760, 1.6, -0.2], ['pizza', 930, 720, 1.5, 0.3], ['drink', 140, 1420, 1.5, 0.15], ['fries', 950, 1420, 1.6, -0.1], ['durum', 980, 1080, 1.4, 0.3], ['kebap', 90, 1080, 1.4, 0.4]]) {
    const a = E.outCubic(prog(t, T.cloche, T.cloche + 0.6));
    icon(g, n, x + Math.sin(t * 0.8 + x) * 14, y + Math.cos(t * 0.9 + y) * 14, sc * a, r, 0.55, 'B');
  }
  // spot ışığı
  g.save(); g.globalAlpha = E.outCubic(prog(t, T.teaser, T.teaser + 0.6));
  g.fillStyle = lg(g, 0, 0, 0, 1300, [[0, 'rgba(255,214,150,0)'], [0.3, 'rgba(255,214,150,0.12)'], [1, 'rgba(255,214,150,0)']]);
  g.beginPath(); g.moveTo(430, 0); g.lineTo(650, 0); g.lineTo(980, 1300); g.lineTo(100, 1300); g.closePath(); g.fill();
  g.restore();
  // "Size bir haber daha..."
  const hp = spring(t - T.haber, 1.8, 7);
  if (hp > 0) {
    g.save(); g.translate(540, 330); g.scale(hp, hp);
    const o = { f: 'Txt', w: 700, s: 36 }, s = 'Size bir haber daha…', tw = measure(g, s, o);
    pill(g, 0, 0, tw + 80, 80, 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0.3)');
    text(g, s, 0, 12, { ...o, c: '#fff' });
    g.restore();
  }
  const tp = prog(t, T.yemekTitle, T.yemekTitle + 0.55);
  if (tp > 0) brandTitle(g, 'Yemek', 580, tp);
  // servis kapağı: titrer, aralanır, içinden ışık sızar ama açılmaz
  const PX = 540, PY = 1150, sc = 4.6, app = spring(t - T.cloche, 1.6, 6.5);
  if (app > 0) {
    g.save(); g.globalAlpha *= clamp(app * 1.5); g.translate(0, (1 - clamp(app)) * 120);
    contactShadow(g, PX, PY + 46, 300, 0.45);
    icon(g, 'plate', PX, PY, sc * 1.1);
    const rattle = [[13.25, 13.75], [14.4, 14.9], [15.5, 15.95]].reduce((m, [a, b]) => Math.max(m, t > a && t < b ? Math.sin(prog(t, a, b) * Math.PI) : 0), 0);
    const peek = Math.sin(prog(t, T.cokYakinda, T.cokYakinda + 0.6) * Math.PI); // "çok yakında"da kapak aralanır
    const lift = peek * 60 + rattle * Math.abs(Math.sin(t * 40)) * 8;
    if (lift > 2) {
      glow(g, SPR.amber, PX, PY - 20, 260 + lift * 4, 0.55 * clamp(lift / 40));
      g.save(); g.globalAlpha *= clamp(lift / 50); rays(g, PX, PY - 10, t, 10, 'rgba(255,214,140,0.35)', 1, 700, 0.06, 0.3); g.restore();
    }
    const ly = PY - 21 * sc + 6 - lift;
    g.save(); g.translate(PX, ly + 21 * sc); g.rotate(rattle * Math.sin(t * 46) * 0.04 - peek * 0.08); g.translate(-PX, -(ly + 21 * sc));
    icon(g, 'lid', PX, ly, sc);
    g.restore();
    g.restore();
  }
  const sl = slam(t, T.cokYakinda, 2.6);
  if (sl) {
    g.save(); g.globalAlpha *= sl.al; g.translate(540, 1560); g.scale(sl.sc, sl.sc);
    glow(g, SPR.amber, 0, -60, 560, 0.35);
    heroWord(g, 'ÇOK YAKINDA', 0, 60, fit(g, 'ÇOK YAKINDA', { w: 900, s: 150, ls: 4 }, 960), 12);
    g.restore();
  }
  g.save(); g.shadowColor = 'rgba(0,10,40,0.5)'; g.shadowBlur = 20;
  slotText(g, "Andırın'da!", 540, 1730, { w: 800, s: 96, c: '#fff' }, prog(t, T.andirinda, T.andirinda + 0.5), 0, 0.04);
  g.restore();
}
