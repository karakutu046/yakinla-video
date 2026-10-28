'use strict';
/* İkinci tur: dört yeni konsept (E–H) × altı anahtar kare. frames.js'teki F sözlüğüne eklenir. */

/* ═════════════════════ E · KALKIŞ PANOSU — mekanik split-flap pano, havalimanı tabelası ═════════════════════ */
const EP = { bg: '#0B0B0C', tile: '#1C1D21', tileHi: '#2A2B31', ch: '#F2EFE6', amber: '#FFB000', green: '#3DDC84', red: '#FF5A4F', grey: '#7B7F88' };
function bgE(g) {
  g.fillStyle = EP.bg; g.fillRect(0, 0, W, H);
  glow(g, '#FFB000', 540, 300, 900, 0.06, 500); grain(g, 0.06);
}
// Tek bir pul: karakter, ortadan bölen çizgi; mid > 0 ise düşen kanat
function flap(g, cx, cy, w, h, ch, col = EP.ch, mid = 0, next = null) {
  const r = w * 0.12, s = h * 0.74, base = cy + s * 0.36;
  g.fillStyle = EP.tile; g.beginPath(); g.roundRect(cx - w / 2, cy - h / 2, w, h, r); g.fill();
  const glyph = (c, a = 1) => { if (c && c !== ' ') text(g, c, cx, base, { w: 800, s, c: rgb(hex2rgb(col), a) }); };
  glyph(ch);
  if (mid > 0 && next != null) {
    const up = mid < 0.5, k = Math.max(0.03, Math.abs(Math.cos(Math.PI * mid)));
    g.save(); g.beginPath();
    if (up) g.rect(cx - w / 2, cy - h / 2 * k, w, h / 2 * k); else g.rect(cx - w / 2, cy, w, h / 2 * k);
    g.clip();
    g.fillStyle = EP.tileHi; g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.translate(cx, cy); g.scale(1, k); g.translate(-cx, -cy);
    glyph(up ? ch : next, 0.9);
    g.restore();
  }
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(cx - w / 2, cy - 1.5, w, 3);
  g.fillStyle = '#0A0A0B'; g.fillRect(cx - w / 2 - 1, cy - 5, 4, 10); g.fillRect(cx + w / 2 - 3, cy - 5, 4, 10);
}
function flapRow(g, str, x, cy, w, h, gap, col = EP.ch, mids = {}, align = 'left') {
  const n = str.length, total = n * w + (n - 1) * gap, x0 = align === 'center' ? x - total / 2 : x;
  for (let i = 0; i < n; i++) flap(g, x0 + i * (w + gap) + w / 2, cy, w, h, str[i], col, mids[i] || 0, mids[i] ? 'ABCDEFGHKLMNPRSTUVYZ'[(i * 7) % 20] : null);
  return total;
}
F.E1 = g => {
  bgE(g);
  text(g, 'PAZARTESİ  ·  MERKEZ OFİS', 540, 330, { f: 'Txt', w: 600, s: 30, ls: 6, c: EP.grey });
  flapRow(g, 'GİRİŞ PANOSU', 540, 420, 62, 92, 6, EP.amber, {}, 'center');
  flapRow(g, '08:59', 540, 680, 150, 224, 14, EP.ch, { 4: 0.3 }, 'center');
  flapRow(g, 'KİM GELDİ?', 540, 1000, 88, 132, 8, EP.ch, { 2: 0.7, 5: 0.25, 8: 0.6 }, 'center');
  g.fillStyle = EP.amber; g.fillRect(470, 1140, 140, 8);
  text(g, 'BUGÜN  ·  53 PERSONEL', 540, 1250, { f: 'Txt', w: 700, s: 32, ls: 6, c: EP.amber });
};
const BOARD_ROWS = [['AYŞE Y.', '08:57', 'GİRDİ', 'green'], ['MEHMET K.', '08:58', 'GİRDİ', 'green'], ['ELİF D.', '08:59', 'GİRDİ', 'green'],
  ['CAN T.', '09:00', 'GİRDİ', 'green'], ['ZEYNEP A.', '09:02', 'GEÇ', 'red'], ['BURAK Ş.', '--:--', 'BEKLE', 'grey'], ['SELİN K.', '09:00', 'GİRDİ', 'green']];
function departures(g, y0, rows, mids = {}) {
  g.fillStyle = EP.amber; g.beginPath(); g.roundRect(70, y0, 940, 64, 12); g.fill();
  [['PERSONEL', 92], ['SAAT', 520], ['DURUM', 772]].forEach(([s, x]) => text(g, s, x, y0 + 44, { f: 'Txt', w: 700, s: 26, ls: 3, a: 'left', c: '#111' }));
  rows.forEach(([n, t, st, c], i) => {
    const y = y0 + 120 + i * 96;
    flapRow(g, n.padEnd(9).slice(0, 9), 82, y, 42, 72, 4, EP.ch, mids[i] || {});
    flapRow(g, t, 512, y, 42, 72, 4, EP.ch);
    flapRow(g, st.padEnd(5), 764, y, 42, 72, 4, EP[c]);
  });
}
F.E2 = g => {
  bgE(g);
  text(g, 'GİRİŞLER  ·  08:59', 540, 330, { f: 'Txt', w: 700, s: 34, ls: 6, c: EP.amber });
  departures(g, 380, BOARD_ROWS, { 5: { 3: 0.4 }, 4: { 1: 0.7 } });
  text(g, 'Kim geldi, kim geç kaldı:', 540, 1290, { w: 900, s: 66, c: EP.ch });
  rich(g, [['tek panoda', EP.ch], ['.', EP.amber]], 540, 1380, { w: 900, s: 66 });
};
F.E3 = g => {
  bgE(g);
  // havalimanı yön tabelası
  g.fillStyle = EP.amber; g.beginPath(); g.roundRect(70, 300, 940, 300, 24); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.roundRect(110, 340, 220, 220, 30); g.fill();
  logo(g, 220, 450, 220, { variant: 'light' });
  text(g, 'QR OKUT', 370, 438, { w: 900, s: 96, a: 'left', c: '#111' });
  text(g, 'GİRİŞ  ·  KAPI 1', 372, 510, { f: 'Txt', w: 700, s: 36, ls: 4, a: 'left', c: '#111' });
  g.save(); g.translate(930, 450); g.fillStyle = '#111';
  g.beginPath(); g.moveTo(-40, -20); g.lineTo(0, -20); g.lineTo(0, -50); g.lineTo(46, 0); g.lineTo(0, 50); g.lineTo(0, 20); g.lineTo(-40, 20); g.closePath(); g.fill(); g.restore();
  phone(g, 540, 1020, 330, (g2, sw, sh) => {
    g2.fillStyle = '#0B0C10'; g2.fillRect(-sw / 2, -sh / 2, sw, sh);
    statusBar(g2, sw, sh, '#FFFFFF', '08:57');
    qrCard(g2, 0, -30, 220);
    brackets(g2, 0, -30, 270, 270, 8, 40, EP.green);
    g2.fillStyle = EP.green; g2.fillRect(-120, -40, 240, 4);
    g2.fillStyle = 'rgba(61,220,132,0.18)'; g2.beginPath(); g2.roundRect(-130, 180, 260, 56, 28); g2.fill();
    text(g2, 'Giriş 08:57', 0, 216, { f: 'Txt', w: 700, s: 22, c: EP.green });
  }, { rot: -0.04 });
  flapRow(g, 'OKUT', 540, 1440, 70, 104, 8, EP.amber, { 2: 0.4 }, 'center');
};
F.E4 = g => {
  bgE(g);
  text(g, 'İÇERİDE', 540, 340, { f: 'Txt', w: 700, s: 34, ls: 10, c: EP.amber });
  flapRow(g, '45', 410, 600, 210, 320, 16, EP.ch, { 1: 0.65 }, 'center');
  flapRow(g, '/53', 810, 660, 96, 150, 8, EP.grey, {}, 'center');
  departures(g, 860, BOARD_ROWS.slice(3, 6));
  rich(g, [['Canlı', EP.ch], ['. ', EP.amber], ['Her okutmada döner', EP.ch], ['.', EP.amber]], 540, 1420, { w: 900, s: 54 });
};
F.E5 = g => {
  bgE(g);
  text(g, 'ÇIKIŞLAR  ·  18:04', 540, 330, { f: 'Txt', w: 700, s: 34, ls: 6, c: EP.amber });
  g.fillStyle = EP.amber; g.beginPath(); g.roundRect(70, 380, 940, 64, 12); g.fill();
  [['PERSONEL', 92], ['ÇIKIŞ', 520], ['SÜRE', 772]].forEach(([s, x]) => text(g, s, x, 424, { f: 'Txt', w: 700, s: 26, ls: 3, a: 'left', c: '#111' }));
  [['AYŞE Y.', '18:04', '9S04D'], ['MEHMET K.', '18:01', '9S03D'], ['ELİF D.', '18:10', '9S11D']].forEach(([n, t, d], i) => {
    const y = 500 + i * 96;
    flapRow(g, n.padEnd(9).slice(0, 9), 82, y, 42, 72, 4); flapRow(g, t, 512, y, 42, 72, 4); flapRow(g, d, 764, y, 42, 72, 4, EP.amber);
  });
  flapRow(g, 'PUANTAJ', 540, 960, 104, 156, 8, EP.amber, { 3: 0.35 }, 'center');
  flapRow(g, 'HAZIR', 540, 1150, 104, 156, 8, EP.green, {}, 'center');
  text(g, 'Akşam da okut, ay sonu hazır.', 540, 1400, { w: 900, s: 58, c: EP.ch });
};
F.E6 = g => {
  g.fillStyle = EP.amber; g.fillRect(0, 0, W, H); grain(g, 0.05);
  g.fillStyle = '#111'; g.beginPath(); g.roundRect(310, 410, 460, 460, 86); g.fill();
  logo(g, 540, 640, 460, { variant: 'light', brackets: 1 });
  text(g, 'QR Personel', 540, 1040, { w: 900, s: 132, c: '#111' });
  text(g, 'QR kodla personel takibi', 540, 1118, { f: 'Txt', w: 600, s: 44, c: '#3A2C00' });
  g.fillStyle = '#111'; g.beginPath(); g.roundRect(150, 1200, 780, 120, 18); g.fill();
  text(g, 'qrpersonel.com', 220, 1281, { w: 800, s: 58, a: 'left', c: EP.amber });
  g.save(); g.translate(860, 1260); g.fillStyle = EP.amber;
  g.beginPath(); g.moveTo(-34, -16); g.lineTo(0, -16); g.lineTo(0, -40); g.lineTo(38, 0); g.lineTo(0, 40); g.lineTo(0, 16); g.lineTo(-34, 16); g.closePath(); g.fill(); g.restore();
};

/* ═════════════════════ F · BENTO — İsviçre ızgarası, cesur renk blokları ═════════════════════ */
const FB = { bg: '#EFECE6', ink: '#121212', cob: '#2D4BFF', tan: '#FF6B2C', lime: '#C6F45E', lil: '#C9B8FF', white: '#FFFFFF', grey: '#6E6A63' };
function bgF(g) { g.fillStyle = FB.bg; g.fillRect(0, 0, W, H); grain(g, 0.035); }
function tile(g, x, y, w, h, col, r = 44) { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }
function miniBars(g, x, y, w, h, col, vals = [3, 6, 10, 15, 11, 5, 3], hi = 3) {
  const bw = w / vals.length * 0.62, mx = Math.max(...vals);
  vals.forEach((v, k) => { const bh = v / mx * h; g.fillStyle = k === hi ? FB.ink : col; g.beginPath(); g.roundRect(x + k * w / vals.length, y + h - bh, bw, bh, bw * 0.3); g.fill(); });
}
function avatarStack(g, x, y, r, n = 5) { for (let i = n - 1; i >= 0; i--) avatar(g, x + i * r * 1.25, y, r, TEAM[i].ini, TEAM[i].col, '#FFFFFF'); }
F.F1 = g => {
  bgF(g);
  tile(g, 60, 250, 600, 420, FB.ink);
  text(g, 'Ekibin,', 110, 470, { w: 900, s: 96, a: 'left', c: FB.white });
  rich(g, [['tek bakışta', FB.white], ['.', FB.lime]], 110, 580, { w: 900, s: 96, a: 'left' });
  tile(g, 684, 250, 336, 420, FB.lime);
  text(g, '45', 852, 520, { w: 900, s: 220, c: FB.ink });
  text(g, '/53 içeride', 852, 590, { f: 'Txt', w: 700, s: 32, c: FB.ink });
  tile(g, 60, 694, 336, 336, FB.white);
  qr(g, 228, 862, 230, FB.ink);
  tile(g, 420, 694, 600, 336, FB.cob);
  mono(g, '08:57', 460, 880, { s: 140, w: 700, c: FB.white, a: 'left', cw: 0.6 });
  text(g, 'Giriş  ·  Ayşe Y.', 466, 960, { f: 'Txt', w: 600, s: 34, a: 'left', c: 'rgba(255,255,255,0.8)' });
  tile(g, 60, 1054, 480, 420, FB.tan);
  text(g, '2', 110, 1300, { w: 900, s: 220, a: 'left', c: FB.ink });
  text(g, 'geç kaldı', 110, 1370, { f: 'Txt', w: 700, s: 38, a: 'left', c: FB.ink });
  avatarStack(g, 330, 1150, 34, 3);
  tile(g, 564, 1054, 456, 420, FB.lil);
  text(g, 'Giriş saatleri', 604, 1120, { f: 'Txt', w: 700, s: 30, a: 'left', c: FB.ink });
  miniBars(g, 604, 1180, 376, 240, 'rgba(18,18,18,0.35)');
};
F.F2 = g => {
  bgF(g);
  tile(g, 60, 250, 960, 1000, FB.cob);
  g.save(); g.shadowColor = 'rgba(0,0,40,0.35)'; g.shadowBlur = 60; g.shadowOffsetY = 24; tile(g, 330, 330, 420, 420, FB.white, 40); g.restore();
  qr(g, 540, 540, 320, FB.ink);
  brackets(g, 540, 540, 500, 500, 14, 64, FB.lime);
  rich(g, [['Okut', FB.white], ['.', FB.lime]], 110, 1150, { w: 900, s: 240, a: 'left' });
  tile(g, 60, 1274, 468, 200, FB.lime);
  g.fillStyle = FB.ink; g.beginPath(); g.arc(140, 1374, 40, 0, TAU); g.fill(); checkMark(g, 140, 1376, 40, 9, FB.lime);
  text(g, 'Giriş', 200, 1390, { w: 900, s: 60, a: 'left', c: FB.ink });
  tile(g, 552, 1274, 468, 200, FB.white);
  text(g, 'Çıkış', 600, 1390, { w: 900, s: 60, a: 'left', c: FB.ink });
  g.save(); g.translate(930, 1372); g.fillStyle = FB.tan; g.beginPath(); g.moveTo(-30, -14); g.lineTo(0, -14); g.lineTo(0, -34); g.lineTo(34, 0); g.lineTo(0, 34); g.lineTo(0, 14); g.lineTo(-30, 14); g.closePath(); g.fill(); g.restore();
};
F.F3 = g => {
  bgF(g);
  tile(g, 60, 250, 960, 520, FB.lime);
  g.fillStyle = FB.ink; g.beginPath(); g.arc(190, 400, 80, 0, TAU); g.fill(); checkMark(g, 190, 402, 80, 16, FB.lime);
  text(g, 'Giriş yapıldı', 110, 600, { w: 900, s: 104, a: 'left', c: FB.ink });
  mono(g, '08:57:12', 116, 700, { s: 70, w: 700, c: FB.ink, a: 'left', cw: 0.6 });
  person(g, 880, 420, 230, 'rgba(18,18,18,0.85)');
  tile(g, 60, 794, 468, 480, FB.white);
  text(g, 'Şimdi geldi', 100, 862, { f: 'Txt', w: 700, s: 30, a: 'left', c: FB.grey });
  [[0, '08:57'], [1, '08:58'], [3, '09:00'], [5, '09:00']].forEach(([k, tm], i) => {
    const y = 940 + i * 86; avatar(g, 130, y, 32, TEAM[k].ini, TEAM[k].col);
    text(g, TEAM[k].name.split(' ')[0], 180, y + 11, { f: 'Txt', w: 700, s: 32, a: 'left', c: FB.ink });
    mono(g, tm, 490, y + 11, { s: 30, w: 700, c: FB.ink, a: 'right' });
  });
  tile(g, 552, 794, 468, 480, FB.tan);
  text(g, 'Geç', 600, 880, { f: 'Txt', w: 700, s: 36, a: 'left', c: FB.ink });
  text(g, '2', 600, 1180, { w: 900, s: 300, a: 'left', c: FB.ink });
  avatarStack(g, 830, 1200, 34, 2);
  tile(g, 60, 1298, 960, 180, FB.ink);
  rich(g, [['Liste kendiliğinden dolar', FB.white], ['.', FB.lime]], 110, 1410, { w: 900, s: 64, a: 'left' });
};
F.F4 = g => {
  bgF(g);
  tile(g, 60, 250, 960, 560, FB.white);
  text(g, 'Giriş saatleri', 110, 330, { f: 'Txt', w: 700, s: 36, a: 'left', c: FB.ink });
  miniBars(g, 110, 380, 860, 360, FB.cob);
  tile(g, 60, 834, 600, 640, FB.lil);
  text(g, 'Eylül', 100, 910, { w: 900, s: 54, a: 'left', c: FB.ink });
  const late = new Set([3, 9, 15, 22, 28]);
  for (let i = 0; i < 35; i++) {
    const d = i, x = 112 + (i % 7) * 76, y = 980 + Math.floor(i / 7) * 92, ok = d >= 1 && d <= 30, we = i % 7 >= 5;
    g.fillStyle = !ok ? 'rgba(18,18,18,0.06)' : we ? 'rgba(18,18,18,0.18)' : late.has(d) ? FB.tan : FB.ink;
    g.beginPath(); g.roundRect(x - 30, y - 34, 60, 68, 14); g.fill();
  }
  tile(g, 684, 834, 336, 640, FB.ink);
  text(g, 'Pun-', 720, 1010, { w: 900, s: 96, a: 'left', c: FB.white });
  text(g, 'taj', 720, 1110, { w: 900, s: 96, a: 'left', c: FB.white });
  text(g, 'hazır.', 720, 1210, { w: 900, s: 96, a: 'left', c: FB.lime });
  g.fillStyle = FB.lime; g.beginPath(); g.arc(852, 1360, 54, 0, TAU); g.fill(); checkMark(g, 852, 1362, 54, 11, FB.ink);
};
F.F5 = g => {
  bgF(g);
  const T4 = [['Giriş', FB.cob, FB.white, 'qr'], ['Çıkış', FB.tan, FB.ink, 'arrow'], ['Geç kalanlar', FB.lime, FB.ink, 'person'], ['Puantaj', FB.lil, FB.ink, 'bars']];
  T4.forEach(([s, bg, fg, ic], i) => {
    const x = 60 + (i % 2) * 492, y = 280 + Math.floor(i / 2) * 492;
    tile(g, x, y, 468, 468, bg);
    if (ic === 'qr') qr(g, x + 120, y + 130, 150, fg);
    if (ic === 'arrow') { g.save(); g.translate(x + 120, y + 130); g.fillStyle = fg; g.beginPath(); g.moveTo(-60, -24); g.lineTo(0, -24); g.lineTo(0, -60); g.lineTo(62, 0); g.lineTo(0, 60); g.lineTo(0, 24); g.lineTo(-60, 24); g.closePath(); g.fill(); g.restore(); }
    if (ic === 'person') logo(g, x + 120, y + 130, 230, { variant: 'dark', brackets: 0 });
    if (ic === 'bars') miniBars(g, x + 50, y + 60, 160, 140, FB.ink, [4, 7, 5, 9], -1);
    const o = fit(g, s, { w: 900, s: 92, a: 'left' }, 400);
    text(g, s, x + 40, y + 420, { ...o, c: fg });
  });
  rich(g, [['Hepsi tek uygulamada', FB.ink], ['.', FB.tan]], 540, 1380, { w: 900, s: 70 });
};
F.F6 = g => {
  bgF(g);
  tile(g, 60, 250, 960, 1230, FB.ink, 56);
  logo(g, 540, 640, 520, { variant: 'light' });
  text(g, 'QR Personel', 540, 1030, { w: 900, s: 128, c: FB.white });
  text(g, 'QR kodla personel takibi', 540, 1108, { f: 'Txt', w: 600, s: 42, c: 'rgba(255,255,255,0.65)' });
  tile(g, 230, 1200, 620, 116, FB.lime, 58);
  text(g, 'qrpersonel.com  →', 540, 1276, { w: 800, s: 50, c: FB.ink });
  [[FB.cob, 60, 1504], [FB.tan, 300, 1504], [FB.lil, 540, 1504], [FB.lime, 780, 1504]].forEach(([c, x, y]) => tile(g, x, y, 216, 40, c, 20));
};

/* ═════════════════════ G · MESAJLAŞMA — sohbet ekranında anlatılan, Reels'e özgü hikâye ═════════════════════ */
const GM = { bg: '#E9EBEE', head: '#FFFFFF', inB: '#FFFFFF', outB: '#111111', ink: '#111111', grey: '#7A808A', acc: '#2BBE6E', line: '#D9DCE1' };
function bgG(g) {
  g.fillStyle = GM.bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.05; g.fillStyle = '#000';
  for (let y = 40; y < H; y += 120) for (let x = (y / 120 % 2) * 60 + 30; x < W; x += 120) { g.beginPath(); g.roundRect(x - 14, y - 14, 28, 28, 7); g.fill(); }
  g.restore();
}
function chatHeader(g, title, sub, y = 230) {
  g.fillStyle = GM.head; g.fillRect(0, y, W, 130);
  g.fillStyle = GM.line; g.fillRect(0, y + 129, W, 2);
  text(g, '‹', 60, y + 86, { f: 'Txt', w: 500, s: 70, a: 'left', c: GM.ink });
  [5, 3, 0].forEach((k, i) => avatar(g, 150 + i * 30, y + 64, 34, TEAM[k].ini, TEAM[k].col, '#FFFFFF'));
  text(g, title, 260, y + 58, { f: 'Txt', w: 700, s: 36, a: 'left', c: GM.ink });
  text(g, sub, 260, y + 98, { f: 'Txt', w: 500, s: 26, a: 'left', c: GM.grey });
}
function wrapLines(g, s, o, maxW) {
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (measure(g, t, o) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// Baloncuk: side 'in' (solda, beyaz) / 'out' (sağda, siyah). Yüksekliğini döndürür.
function bubble(g, y, s, side, o = {}) {
  const f = { f: 'Txt', w: 500, s: 38 }, lines = wrapLines(g, s, f, 620), lh = 50;
  const tw = Math.max(...lines.map(l => measure(g, l, f)), o.name ? measure(g, o.name, { f: 'Txt', w: 700, s: 26 }) : 0);
  const bw = tw + 64, bh = lines.length * lh + 50 + (o.name ? 38 : 0) + 24;
  const x = side === 'out' ? W - 60 - bw : (o.avatar ? 140 : 60);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.08)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  g.fillStyle = side === 'out' ? GM.outB : GM.inB; g.beginPath(); g.roundRect(x, y, bw, bh, 30); g.fill(); g.restore();
  if (o.avatar) avatar(g, 92, y + bh - 34, 30, o.avatar.ini, o.avatar.col);
  let ty = y + 50;
  if (o.name) { text(g, o.name, x + 32, y + 46, { f: 'Txt', w: 700, s: 26, a: 'left', c: o.nameCol || GM.acc }); ty += 38; }
  lines.forEach((l, i) => text(g, l, x + 32, ty + i * lh + 6, { ...f, a: 'left', c: side === 'out' ? '#FFFFFF' : GM.ink }));
  text(g, o.time || '08:59', x + bw - 22, y + bh - 16, { f: 'Txt', w: 500, s: 22, a: 'right', c: side === 'out' ? 'rgba(255,255,255,0.55)' : GM.grey });
  return bh;
}
// Reels tarzı alt yazı: siyah kutulu beyaz yazı
function caption(g, lines, y, o = {}) {
  const f = { w: 900, s: o.s || 72 };
  lines.forEach((l, i) => {
    const tw = measure(g, l, f), yy = y + i * (f.s * 1.2);
    g.fillStyle = o.bg || '#111111'; g.beginPath(); g.roundRect(540 - tw / 2 - 28, yy - f.s * 0.92, tw + 56, f.s * 1.22, 16); g.fill();
    text(g, l, 540, yy, { ...f, c: o.fg || '#FFFFFF' });
  });
}
F.G1 = g => {
  bgG(g); chatHeader(g, 'Merkez Ofis Ekibi', '53 kişi');
  text(g, 'Bugün', 540, 470, { f: 'Txt', w: 600, s: 24, c: GM.grey });
  bubble(g, 520, 'Günaydın! Bugün kim geldi?', 'out', { time: '08:59' });
  g.save(); g.fillStyle = GM.inB; g.beginPath(); g.roundRect(140, 700, 150, 84, 42); g.fill(); g.restore();
  avatar(g, 92, 750, 30, 'ED', '#FF8A3D');
  [0, 1, 2].forEach(i => { g.fillStyle = rgb([122, 128, 138], 0.4 + i * 0.25); g.beginPath(); g.arc(184 + i * 32, 742, 10, 0, TAU); g.fill(); });
  caption(g, ['Her sabah', 'aynı soru…'], 1240);
};
F.G2 = g => {
  bgG(g); chatHeader(g, 'Merkez Ofis Ekibi', 'Mehmet, Elif, Can yazıyor…');
  let y = 400;
  [['Yoldayım, 10 dk', 1], ['Trafik var…', 3], ['Ben geldim', 2], ['Kartımı evde unuttum', 6], ['Önce şubeye uğruyorum', 7]].forEach(([s, k], i) => {
    y += bubble(g, y, s, 'in', { name: TEAM[k].name, nameCol: TEAM[k].col, avatar: TEAM[k], time: `09:0${i}` }) + 18;
  });
  caption(g, ['Mesaj trafiği mi?'], 1440, { bg: '#FF5A4F' });
};
function botCard(g, y, h, title) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.1)'; g.shadowBlur = 16; g.shadowOffsetY = 4;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(140, y, 820, h, 32); g.fill(); g.restore();
  g.fillStyle = GM.acc; g.beginPath(); g.roundRect(140, y, 10, h, 5); g.fill();
  logo(g, 92, y + h - 34, 62, { variant: 'icon' });
  text(g, title, 182, y + 52, { f: 'Txt', w: 700, s: 26, a: 'left', c: GM.acc });
}
F.G3 = g => {
  bgG(g); chatHeader(g, 'Merkez Ofis Ekibi', '53 kişi');
  bubble(g, 420, 'Günaydın! Bugün kim geldi?', 'out', { time: '08:59' });
  botCard(g, 620, 500, 'QR Personel');
  text(g, 'Bugün  ·  09:05', 182, 720, { f: 'Txt', w: 600, s: 30, a: 'left', c: GM.grey });
  rich(g, [['45', GM.ink], [' / 53 içeride', GM.grey]], 182, 840, { w: 900, s: 96, a: 'left' });
  [['2 geç', '#FF5A4F'], ['6 bekleniyor', GM.grey]].forEach(([s, c], i) => {
    const x = 182 + i * 200, w = measure(g, s, { f: 'Txt', w: 700, s: 28 }) + 44;
    g.fillStyle = rgb(hex2rgb(c), 0.14); g.beginPath(); g.roundRect(x, 880, w, 52, 26); g.fill();
    text(g, s, x + w / 2, 916, { f: 'Txt', w: 700, s: 28, c });
  });
  avatarStack(g, 210, 1010, 34, 6);
  g.fillStyle = GM.ink; g.beginPath(); g.roundRect(182, 1056, 280, 48, 24); g.fill();
  text(g, 'Listeyi aç', 322, 1089, { f: 'Txt', w: 700, s: 24, c: '#FFFFFF' });
  caption(g, ['Sormana gerek yok.'], 1400);
};
F.G4 = g => {
  bgG(g); chatHeader(g, 'QR Personel', 'çevrimiçi');
  botCard(g, 420, 520, 'QR Personel');
  text(g, 'Kapıdaki QR’ı okut:', 182, 520, { f: 'Txt', w: 500, s: 36, a: 'left', c: GM.ink });
  qrCard(g, 360, 740, 300, { shadow: 'rgba(0,0,0,0.12)' });
  bubble(g, 990, 'Okuttum', 'out', { time: '08:57' });
  const y = 1130, s = 'Ayşe Yılmaz giriş yaptı · 08:57', w = measure(g, s, { f: 'Txt', w: 700, s: 28 }) + 110;
  g.fillStyle = 'rgba(43,190,110,0.16)'; g.beginPath(); g.roundRect(540 - w / 2, y, w, 64, 32); g.fill();
  g.fillStyle = GM.acc; g.beginPath(); g.arc(540 - w / 2 + 38, y + 32, 16, 0, TAU); g.fill(); checkMark(g, 540 - w / 2 + 38, y + 33, 16, 4, '#FFFFFF');
  text(g, s, 540 + 22, y + 42, { f: 'Txt', w: 700, s: 28, c: '#1D8A50' });
  caption(g, ['Okut, kayda geçsin.'], 1410);
};
F.G5 = g => {
  bgG(g); chatHeader(g, 'QR Personel', 'çevrimiçi');
  const pill = (y, s, c) => { const w = measure(g, s, { f: 'Txt', w: 700, s: 28 }) + 70; g.fillStyle = rgb(hex2rgb(c), 0.15); g.beginPath(); g.roundRect(540 - w / 2, y, w, 64, 32); g.fill(); text(g, s, 540, y + 42, { f: 'Txt', w: 700, s: 28, c }); };
  pill(420, '18:04 · Ayşe Yılmaz çıkış yaptı · 9 sa 04 dk', '#B7791F');
  botCard(g, 540, 640, 'QR Personel');
  text(g, 'Eylül puantajı hazır', 182, 640, { w: 800, s: 54, a: 'left', c: GM.ink });
  text(g, '22 iş günü · 53 personel', 182, 690, { f: 'Txt', w: 500, s: 30, a: 'left', c: GM.grey });
  const late = new Set([3, 9, 15, 22, 28]);
  for (let i = 0; i < 35; i++) {
    const d = i, x = 220 + (i % 7) * 100, y = 760 + Math.floor(i / 7) * 74, ok = d >= 1 && d <= 30, we = i % 7 >= 5;
    g.fillStyle = !ok ? '#F3F4F6' : we ? '#E5E7EB' : late.has(d) ? '#FECACA' : '#D1FAE5';
    g.beginPath(); g.roundRect(x - 40, y - 28, 80, 56, 12); g.fill();
    if (ok) text(g, String(d), x, y + 9, { f: 'Txt', w: 700, s: 22, c: we ? GM.grey : late.has(d) ? '#B91C1C' : '#065F46' });
  }
  caption(g, ['Ay sonu? Hazır.'], 1420);
};
F.G6 = g => {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
  logo(g, 540, 640, 440, { variant: 'icon', shadow: 'rgba(0,0,0,0.25)' });
  g.fillStyle = GM.acc; g.beginPath(); g.arc(540 + 190, 640 + 190, 40, 0, TAU); g.fill();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 10; g.stroke();
  text(g, 'QR Personel', 540, 1020, { w: 800, s: 124, c: GM.ink });
  text(g, 'QR kodla personel takibi', 540, 1098, { f: 'Txt', w: 500, s: 44, c: GM.grey });
  g.fillStyle = GM.ink; g.beginPath(); g.roundRect(240, 1190, 600, 110, 55); g.fill();
  text(g, 'qrpersonel.com', 540, 1262, { w: 700, s: 48, c: '#FFFFFF' });
  caption(g, ['Hemen başlayın'], 1440, { bg: GM.acc });
};

/* ═════════════════════ H · KÂĞIT KESİK — kolaj, stop-motion, sıcak el işi ═════════════════════ */
const HK = { kraft: '#E6D9C2', paper: '#FBF7EE', ink: '#1C1B19', terra: '#D4643B', mus: '#E7B347', sage: '#8DAA7B', blue: '#4A6FA5' };
function bgH(g) {
  g.fillStyle = HK.kraft; g.fillRect(0, 0, W, H);
  const R = mulberry32(12); g.save(); g.strokeStyle = 'rgba(120,90,50,0.08)'; g.lineWidth = 2;
  for (let i = 0; i < 260; i++) { const x = R() * W, y = R() * H, a = R() * TAU, l = 20 + R() * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.restore(); grain(g, 0.09);
}
// Kâğıt parça: hafif yırtık kenar + yumuşak gölge
function paper(g, cx, cy, w, h, col, rot = 0, torn = 0.6, seed = 1) {
  const R = mulberry32(seed);
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.shadowColor = 'rgba(60,40,10,0.28)'; g.shadowBlur = 16; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
  g.fillStyle = col; g.beginPath();
  const jag = (x0, y0, x1, y1) => { const n = 18; for (let i = 1; i <= n; i++) { const t = i / n; g.lineTo(lerp(x0, x1, t) + (R() - 0.5) * torn * 6, lerp(y0, y1, t) + (R() - 0.5) * torn * 6); } };
  g.moveTo(-w / 2, -h / 2); jag(-w / 2, -h / 2, w / 2, -h / 2); jag(w / 2, -h / 2, w / 2, h / 2); jag(w / 2, h / 2, -w / 2, h / 2); jag(-w / 2, h / 2, -w / 2, -h / 2);
  g.fill(); g.restore();
}
// Fidye notu gibi kesik harfler
function cutLetters(g, s, cx, y, size, seed = 3) {
  const R = mulberry32(seed), cols = [HK.paper, HK.terra, HK.mus, HK.sage, HK.ink, HK.blue], o = { w: 900, s: size };
  const ws = [...s].map(ch => ch === ' ' ? size * 0.35 : measure(g, ch, o) + size * 0.22), total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  [...s].forEach((ch, i) => {
    if (ch !== ' ') {
      const bg = cols[(R() * cols.length) | 0], fg = bg === HK.ink || bg === HK.blue || bg === HK.terra ? HK.paper : HK.ink, rot = (R() - 0.5) * 0.24;
      paper(g, x + ws[i] / 2, y - size * 0.34, ws[i] - 6, size * 1.08, bg, rot, 0.5, i + seed * 10);
      g.save(); g.translate(x + ws[i] / 2, y - size * 0.34); g.rotate(rot);
      text(g, ch, 0, size * 0.36, { w: [900, 800, 700][(R() * 3) | 0], s: size * (0.86 + R() * 0.12), c: fg }); g.restore();
    }
    x += ws[i];
  });
}
function strip(g, s, cx, y, size, bg = HK.paper, fg = HK.ink, rot = -0.02) {
  const o = { w: 900, s: size }, tw = measure(g, s, o);
  paper(g, cx, y - size * 0.34, tw + size * 0.8, size * 1.35, bg, rot, 0.7, s.length);
  g.save(); g.translate(cx, y - size * 0.34); g.rotate(rot); text(g, s, 0, size * 0.36, { ...o, c: fg }); g.restore();
}
function paperQR(g, cx, cy, size, rot = 0) {
  paper(g, cx, cy, size * 1.32, size * 1.32, HK.paper, rot, 0.4, 7);
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.shadowColor = 'rgba(40,30,10,0.35)'; g.shadowBlur = 3; g.shadowOffsetX = 2; g.shadowOffsetY = 3;
  qr(g, 0, 0, size, HK.ink); g.restore();
}
F.H1 = g => {
  bgH(g);
  // imza föyü + yapışkan notlar + ataş
  paper(g, 520, 1030, 720, 860, HK.paper, -0.06, 0.8, 4);
  g.save(); g.translate(520, 1030); g.rotate(-0.06);
  g.strokeStyle = 'rgba(28,27,25,0.25)'; g.lineWidth = 2;
  for (let r = 0; r < 11; r++) { g.beginPath(); g.moveTo(-300, -300 + r * 64); g.lineTo(300, -300 + r * 64); g.stroke(); }
  const R = mulberry32(5); g.strokeStyle = '#2B3A8C'; g.lineCap = 'round';
  for (let r = 0; r < 10; r++) { if (r === 6) continue; g.lineWidth = 3; g.beginPath(); g.moveTo(-280, -270 + r * 64); for (let x = -280; x < -40 - R() * 80; x += 14) g.lineTo(x + 7, -270 + r * 64 + (R() - 0.5) * 24); g.stroke(); }
  text(g, 'İMZA FÖYÜ', 0, -340, { f: 'Txt', w: 700, s: 32, ls: 6, c: HK.ink });
  g.restore();
  paper(g, 820, 760, 250, 230, HK.mus, 0.12, 0.3, 8);
  g.save(); g.translate(820, 760); g.rotate(0.12); text(g, 'Ali?', 0, 10, { w: 900, s: 66, c: HK.ink }); text(g, '9:15 ??', 0, 70, { f: 'Txt', w: 700, s: 34, c: HK.ink }); g.restore();
  paper(g, 260, 1440, 240, 210, HK.terra, -0.1, 0.3, 9);
  g.save(); g.translate(260, 1440); g.rotate(-0.1); text(g, 'Kart', 0, -6, { w: 900, s: 54, c: HK.paper }); text(g, 'kayıp!', 0, 52, { w: 900, s: 54, c: HK.paper }); g.restore();
  g.save(); g.strokeStyle = '#8A8F96'; g.lineWidth = 7; g.translate(300, 620); g.rotate(-0.4);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 120); g.arc(18, 120, 18, Math.PI, 0, true); g.lineTo(36, 20); g.arc(52, 20, 16, Math.PI, 0); g.lineTo(68, 100); g.stroke(); g.restore();
  cutLetters(g, 'KİM GELDİ?', 540, 470, 112, 3);
};
F.H2 = g => {
  bgH(g);
  // makasla kesilen kâğıt QR'a dönüşür
  paperQR(g, 540, 780, 420, 0.04);
  g.save(); g.setLineDash([18, 14]); g.strokeStyle = HK.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(120, 1110); g.lineTo(960, 1060); g.stroke(); g.restore();
  // makas
  g.save(); g.translate(860, 1066); g.rotate(-0.06);
  g.fillStyle = HK.terra; g.beginPath(); g.ellipse(-60, -26, 34, 22, 0.3, 0, TAU); g.ellipse(-60, 26, 34, 22, -0.3, 0, TAU); g.fill('evenodd');
  g.fillStyle = HK.kraft; g.beginPath(); g.ellipse(-60, -26, 18, 10, 0.3, 0, TAU); g.ellipse(-60, 26, 18, 10, -0.3, 0, TAU); g.fill();
  g.fillStyle = '#9AA0A6'; g.beginPath(); g.moveTo(-30, -14); g.lineTo(90, -4); g.lineTo(-30, 6); g.fill(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(90, 4); g.lineTo(-30, -6); g.fill();
  g.restore();
  // kesilen şeritler
  [[200, 1220, 0.2, HK.mus], [420, 1250, -0.15, HK.sage], [690, 1230, 0.3, HK.paper]].forEach(([x, y, r, c], i) => paper(g, x, y, 200, 60, c, r, 0.6, 20 + i));
  cutLetters(g, 'OKUT.', 540, 1430, 150, 6);
};
F.H3 = g => {
  bgH(g);
  paper(g, 540, 900, 460, 940, HK.ink, -0.03, 0.4, 13);
  g.save(); g.translate(540, 900); g.rotate(-0.03);
  g.fillStyle = HK.paper; g.beginPath(); g.roundRect(-200, -420, 400, 840, 40); g.fill();
  g.fillStyle = HK.ink; g.beginPath(); g.roundRect(-60, -400, 120, 30, 15); g.fill();
  g.restore();
  paperQR(g, 540, 820, 260, -0.03);
  brackets(g, 540, 820, 420, 420, 12, 60, HK.sage);
  // ip ile bağlı etiket
  g.strokeStyle = HK.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(700, 1180); g.quadraticCurveTo(820, 1210, 850, 1290); g.stroke();
  paper(g, 820, 1360, 360, 150, HK.sage, 0.08, 0.5, 14);
  g.save(); g.translate(820, 1360); g.rotate(0.08); text(g, 'GİRİŞ', 0, -10, { w: 900, s: 54, c: HK.paper }); text(g, '08:57', 0, 50, { f: 'Txt', w: 700, s: 44, c: HK.paper }); g.restore();
  strip(g, 'Okuttun, girdin.', 400, 1520, 64, HK.paper, HK.ink, -0.03);
};
F.H4 = g => {
  bgH(g);
  // kâğıttan ekip: logodaki kişiler, katman katman
  const cols = [HK.terra, HK.mus, HK.sage, HK.blue, HK.paper, HK.ink];
  const R = mulberry32(21);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) {
    const x = 160 + i * 190 + (row % 2) * 60, y = 720 + row * 200, c = cols[(i + row * 2) % cols.length];
    g.save(); g.shadowColor = 'rgba(60,40,10,0.3)'; g.shadowBlur = 10; g.shadowOffsetX = 5; g.shadowOffsetY = 8;
    g.translate(x, y); g.rotate((R() - 0.5) * 0.15); person(g, 0, 0, 170, c); g.restore();
  }
  paper(g, 540, 400, 560, 200, HK.paper, -0.03, 0.6, 30);
  g.save(); g.translate(540, 400); g.rotate(-0.03);
  rich(g, [['45', HK.ink], [' / 53', HK.terra]], 0, 40, { w: 900, s: 130 }); text(g, 'İÇERİDE', 0, 88, { f: 'Txt', w: 700, s: 28, ls: 8, c: HK.ink }); g.restore();
  strip(g, 'Ekip tamam mı?', 540, 1400, 70, HK.mus, HK.ink, 0.02);
  strip(g, 'Bir bakışta.', 560, 1520, 70, HK.paper, HK.ink, -0.03);
};
F.H5 = g => {
  bgH(g);
  paper(g, 540, 900, 860, 860, HK.paper, 0.03, 0.7, 40);
  g.save(); g.translate(540, 900); g.rotate(0.03);
  text(g, 'EYLÜL', -360, -330, { w: 900, s: 64, a: 'left', c: HK.ink });
  const late = new Set([3, 9, 15, 22, 28]), R = mulberry32(41);
  ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach((d, i) => text(g, d, -330 + i * 110, -250, { f: 'Txt', w: 700, s: 24, c: 'rgba(28,27,25,0.6)' }));
  for (let i = 0; i < 35; i++) {
    const d = i, x = -330 + (i % 7) * 110, y = -170 + Math.floor(i / 7) * 110, ok = d >= 1 && d <= 30, we = i % 7 >= 5;
    g.strokeStyle = 'rgba(28,27,25,0.2)'; g.lineWidth = 2; g.strokeRect(x - 50, y - 46, 100, 92);
    if (!ok) continue;
    text(g, String(d), x - 40, y - 18, { f: 'Txt', w: 700, s: 20, a: 'left', c: HK.ink });
    if (!we) { g.fillStyle = late.has(d) ? HK.terra : HK.sage; g.beginPath(); g.arc(x + 12 + (R() - 0.5) * 6, y + 12, 22, 0, TAU); g.fill(); }
  }
  g.restore();
  // lastik damga
  g.save(); g.translate(560, 1000); g.rotate(-0.22); g.globalAlpha = 0.85;
  g.strokeStyle = HK.terra; g.lineWidth = 12; g.beginPath(); g.roundRect(-330, -90, 660, 180, 20); g.stroke();
  text(g, 'PUANTAJ HAZIR', 0, 34, { w: 900, s: 86, c: HK.terra });
  g.globalCompositeOperation = 'destination-out'; const R2 = mulberry32(5);
  for (let i = 0; i < 500; i++) { g.globalAlpha = 0.5; g.fillRect((R2() - 0.5) * 680, (R2() - 0.5) * 200, 2 + R2() * 5, 2 + R2() * 5); }
  g.restore();
  strip(g, 'Ay sonu? Hazır.', 540, 1480, 72, HK.mus, HK.ink, 0.02);
};
F.H6 = g => {
  bgH(g);
  // kâğıttan logo: koyu karton, üstünde beyaz parantezler ve kişiler, her katman gölgeli
  paper(g, 540, 640, 470, 470, HK.ink, -0.02, 0.5, 50);
  g.save(); g.translate(540, 640); g.rotate(-0.02);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 6; g.shadowOffsetX = 3; g.shadowOffsetY = 5;
  logo(g, 0, 0, 470, { variant: 'light', sideCol: '#B9B2A4', mainCol: HK.paper, bracketCol: HK.paper });
  g.restore();
  strip(g, 'QR Personel', 540, 1060, 110, HK.paper, HK.ink, -0.02);
  text(g, 'QR kodla personel takibi', 540, 1180, { f: 'Txt', w: 600, s: 42, c: HK.ink });
  g.strokeStyle = HK.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(360, 1250); g.quadraticCurveTo(330, 1300, 380, 1330); g.stroke();
  paper(g, 560, 1360, 560, 120, HK.terra, 0.03, 0.5, 51);
  g.save(); g.translate(560, 1360); g.rotate(0.03); text(g, 'qrpersonel.com', 0, 18, { w: 900, s: 54, c: HK.paper }); g.restore();
  g.fillStyle = HK.kraft; g.beginPath(); g.arc(310, 1360, 16, 0, TAU); g.fill();
};
