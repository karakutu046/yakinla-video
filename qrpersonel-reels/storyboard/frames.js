'use strict';
/* Dört konsept × altı anahtar kare. Her kare, videonun o anındaki gerçek kompozisyondur. */
const F = {};

/* ═════════════════════ A · VİZÖR — minimal, monokrom, kinetik tipografi ═════════════════════ */
const A = { bg: '#0C0C0D', fg: '#F7F7F7', grey: '#8C8C8C', dim: '#26272A', acc: '#3DDC84' };
function bgA(g, light = false) {
  g.fillStyle = light ? '#F5F5F4' : A.bg; g.fillRect(0, 0, W, H);
  if (!light) { glow(g, '#FFFFFF', W / 2, H * 0.45, 900, 0.05, 1200); grain(g, 0.06); }
}
F.A1 = g => {
  bgA(g);
  brackets(g, 540, 940, 900, 1480, 26, 150, A.fg);
  text(g, 'PAZARTESİ  ·  08:59', 540, 610, { f: 'Txt', w: 600, s: 32, ls: 8, c: A.grey });
  text(g, 'Kim', 540, 930, { w: 900, s: 260, c: A.fg });
  rich(g, [['geldi', A.fg], ['?', A.acc]], 540, 1180, { w: 900, s: 260 });
  g.fillStyle = A.acc; g.beginPath(); g.arc(540, 1330, 9, 0, TAU); g.fill();
};
F.A2 = g => {
  bgA(g);
  // duvardaki QR levhası
  const cx = 540, cy = 830, pw = 560, ph = 720;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 80; g.shadowOffsetY = 40;
  g.fillStyle = '#FAFAFA'; g.beginPath(); g.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 44); g.fill(); g.restore();
  qr(g, cx, cy - 70, 400, '#111111');
  logo(g, cx - 150, cy + 262, 92, { variant: 'icon' });
  text(g, 'Giriş için okutun', cx - 92, cy + 252, { f: 'Txt', w: 700, s: 30, a: 'left', c: '#111' });
  text(g, 'QR Personel', cx - 92, cy + 292, { f: 'Txt', w: 500, s: 24, a: 'left', c: '#777' });
  // kilitlenen vizör + tarama çizgisi
  brackets(g, cx, cy, pw + 90, ph + 90, 22, 110, A.acc);
  const ly = cy - 70 + 40;
  glow(g, A.acc, cx, ly, 330, 0.45, 40);
  g.fillStyle = A.acc; g.fillRect(cx - 250, ly - 3, 500, 6);
  rich(g, [['Okut', A.fg], ['.', A.acc]], 540, 1570, { w: 900, s: 230 });
};
F.A3 = g => {
  bgA(g);
  brackets(g, 540, 800, 620, 620, 22, 100, A.fg);
  person(g, 540, 800, 420, A.fg);
  g.fillStyle = A.acc; g.beginPath(); g.arc(720, 610, 74, 0, TAU); g.fill();
  checkMark(g, 720, 612, 70, 15, A.bg);
  text(g, 'AYŞE YILMAZ  ·  MERKEZ OFİS', 540, 1215, { f: 'Txt', w: 600, s: 30, ls: 6, c: A.grey });
  rich(g, [['Giriş yapıldı', A.fg], ['.', A.acc]], 540, 1400, { w: 900, s: 128 });
  mono(g, '08:57:12', 540, 1530, { s: 92, w: 600, c: A.grey, a: 'center', cw: 0.62 });
};
F.A4 = g => {
  bgA(g);
  // ekip ızgarası: içerideki beyaz, gelmeyen koyu, geç kalan noktalı
  const cols = 6, rows = 8, cw = 132, ch = 100, x0 = 540 - (cols - 1) * cw / 2, y0 = 640;
  const late = new Set([13, 34]), absent = new Set([5, 22, 29, 41, 46, 47, 40]);
  for (let i = 0; i < cols * rows; i++) {
    const x = x0 + (i % cols) * cw, y = y0 + Math.floor(i / cols) * ch;
    person(g, x, y, 74, absent.has(i) ? A.dim : A.fg);
    if (late.has(i)) { g.fillStyle = '#FF5C5C'; g.beginPath(); g.arc(x + 26, y - 28, 9, 0, TAU); g.fill(); }
  }
  rich(g, [['41', A.fg], [' / 48', A.grey]], 540, 470, { w: 900, s: 190 });
  text(g, 'İÇERİDE', 540, 545, { f: 'Txt', w: 600, s: 30, ls: 10, c: A.acc });
  text(g, 'Ekibin,', 540, 1530, { w: 900, s: 118, c: A.fg });
  rich(g, [['tek bakışta', A.fg], ['.', A.acc]], 540, 1660, { w: 900, s: 118 });
};
F.A5 = g => {
  bgA(g);
  text(g, 'Tek uygulama.', 90, 520, { w: 700, s: 56, a: 'left', c: A.grey });
  const o = { w: 900, s: 230, a: 'left' };
  text(g, 'GİRİŞ.', 80, 790, { ...o, c: A.fg });
  text(g, 'ÇIKIŞ.', 80, 1030, { ...o, c: A.fg, stroke: 5 });
  const o3 = fit(g, 'PUANTAJ.', o, 900);
  text(g, 'PUANTAJ.', 80, 1270, { ...o3, c: A.fg });
  const pw = measure(g, 'PUANTAJ.', o3);
  brackets(g, 80 + pw / 2, 1270 - o3.s * 0.36, pw + 70, o3.s * 0.95, 14, 50, A.acc);
  g.fillStyle = A.acc; g.fillRect(90, 1420, 120, 8);
};
F.A6 = g => {
  bgA(g, true);
  logo(g, 540, 760, 460, { variant: 'icon', shadow: 'rgba(0,0,0,0.28)' });
  text(g, 'QR Personel', 540, 1180, { w: 800, s: 128, c: '#111' });
  text(g, 'QR kodla personel takibi', 540, 1262, { f: 'Txt', w: 500, s: 44, c: '#6F6F6F' });
  const w = 520, h = 104, y = 1430;
  g.fillStyle = '#111'; g.beginPath(); g.roundRect(540 - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.fillStyle = A.acc; g.beginPath(); g.arc(540 - w / 2 + 50, y, 11, 0, TAU); g.fill();
  text(g, 'qrpersonel.com', 540 + 22, y + 16, { w: 700, s: 46, c: '#FFFFFF' });
};

/* ═════════════════════ B · 08:59 — hikâye: sabah telaşından akşam çıkışına ═════════════════════ */
const B = { ink: '#070B16', navy: '#101934', blue: '#2F5BFF', blueXL: '#B7C7FF', mint: '#19E3A1', amber: '#FFB547', coral: '#FF5C6C', paper: '#F3F6FF', slate: '#8C98BC' };
function bgB(g, glowCol = B.blue, ga = 0.35) {
  g.fillStyle = B.ink; g.fillRect(0, 0, W, H);
  glow(g, glowCol, W / 2, H * 0.45, 900, ga, 1300);
  dotGrid(g, '#A9BCFF', 0.08);
  vignette(g, 0.45);
}
F.B1 = g => {
  bgB(g);
  text(g, 'PAZARTESİ', 540, 330, { f: 'Txt', w: 600, s: 30, ls: 16, c: B.slate });
  pixelStr(g, '08', 540, 600, 54, B.paper);
  pixelStr(g, '59', 540, 1040, 54, B.paper);
  g.fillStyle = B.mint; for (const y of [808, 840]) { g.beginPath(); g.roundRect(527, y - 13, 26, 26, 6); g.fill(); }
  TEAM.forEach((p, i) => {
    const x = 540 + (i - 3.5) * 112, y = 1390;
    if (i < 6) avatar(g, x, y, 42, p.ini, p.col, 'rgba(255,255,255,0.9)');
    else { g.save(); g.setLineDash([8, 8]); g.strokeStyle = B.slate; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 40, 0, TAU); g.stroke(); g.restore();
      text(g, '?', x, y + 12, { f: 'Txt', w: 700, s: 34, c: B.slate }); }
  });
  text(g, 'Ekip geliyor…', 540, 1560, { w: 800, s: 76, c: B.blueXL });
};
F.B2 = g => {
  bgB(g, B.coral, 0.22);
  rich(g, [['Hâlâ kâğıt föy mü', '#FFFFFF'], ['?', B.coral]], 540, 380, { w: 900, s: 92 });
  // imza föyü
  g.save(); g.translate(540, 980); g.rotate(-0.07);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 70; g.shadowOffsetY = 30;
  g.fillStyle = '#F2EDE3'; g.fillRect(-380, -500, 760, 1000); g.restore();
  text(g, 'PERSONEL İMZA FÖYÜ', 0, -420, { f: 'Txt', w: 700, s: 34, ls: 4, c: '#3B3a36' });
  g.strokeStyle = 'rgba(60,60,60,0.35)'; g.lineWidth = 2;
  for (let r = 0; r <= 12; r++) { g.beginPath(); g.moveTo(-330, -360 + r * 66); g.lineTo(330, -360 + r * 66); g.stroke(); }
  for (const x of [-330, -60, 120, 330]) { g.beginPath(); g.moveTo(x, -360); g.lineTo(x, 432); g.stroke(); }
  const R = mulberry32(9);
  g.strokeStyle = '#2B3A8C'; g.lineCap = 'round';
  for (let r = 0; r < 12; r++) {
    if (r === 7 || r === 10) continue;
    const y = -327 + r * 66;
    for (const [x0, x1] of [[-310, -90], [140, 310]]) {
      g.lineWidth = 3 + R() * 2; g.beginPath(); g.moveTo(x0, y + 6);
      for (let x = x0; x < x1 - R() * 60; x += 14) g.lineTo(x + 7, y + 6 + (R() - 0.5) * 26);
      g.stroke();
    }
    g.fillStyle = '#2B3A8C'; setFont(g, { f: 'Txt', w: 500, s: 26 });
    const mins = r < 9 ? 41 + r * 2 + (R() * 2 | 0) : 2 + (r - 9) * 3; // 08:41 … 08:58, sonra 09:02 …
    g.textAlign = 'left'; g.fillText(`${r < 9 ? '08' : '09'}:${String(mins).padStart(2, '0')}`, -40, y + 14);
  }
  // kahve lekesi + soru işaretleri
  g.strokeStyle = 'rgba(120,80,40,0.28)'; g.lineWidth = 14; g.beginPath(); g.arc(230, 300, 70, 0.3, TAU - 0.2); g.stroke();
  g.strokeStyle = B.coral; g.lineWidth = 6;
  for (const y of [-327 + 7 * 66, -327 + 10 * 66]) { g.beginPath(); g.ellipse(-200, y + 4, 140, 30, -0.05, 0, TAU); g.stroke(); text(g, '?', 40, y + 18, { f: 'Txt', w: 700, s: 44, c: B.coral }); }
  g.restore();
  // üstünü çizen mercan çizgi
  g.strokeStyle = B.coral; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(150, 1520); g.lineTo(930, 470); g.stroke();
};
F.B3 = g => {
  bgB(g, B.mint, 0.22);
  pixelStr(g, '09:00', 540, 330, 26, B.mint);
  const R = mulberry32(4);
  // kâğıt piksellere ayrılıp QR'a dönüşüyor
  g.save(); g.fillStyle = '#FFFFFF';
  g.beginPath(); g.roundRect(540 - 330, 900 - 330, 660, 660, 40); g.fill(); g.restore();
  qr(g, 540, 900, 500, '#0A1024', m => clamp(1.4 - (m.r + m.c) / 30 + (R() - 0.5) * 0.3));
  for (let i = 0; i < 80; i++) {
    const a = R() * TAU, d = 380 + R() * 360, s = 8 + R() * 24;
    g.fillStyle = i % 5 ? '#F2EDE3' : B.mint; g.globalAlpha = 0.35 + R() * 0.6;
    g.save(); g.translate(540 + Math.cos(a) * d, 900 + Math.sin(a) * d * 1.1); g.rotate(R() * 3); g.fillRect(-s / 2, -s / 2, s, s); g.restore();
  }
  g.globalAlpha = 1;
  brackets(g, 540, 900, 760, 760, 20, 100, B.mint);
  rich(g, [['Okut', '#FFFFFF'], ['.', B.mint]], 540, 1560, { w: 900, s: 230 });
};
function phoneCheckIn(g, sw, sh) {
  statusBar(g, sw, sh, '#0A1024');
  const k = sw / 380;
  g.save(); g.scale(k, k);
  text(g, 'QR Personel', 0, -298, { f: 'Txt', w: 700, s: 19, c: B.blue });
  g.fillStyle = B.mint; g.beginPath(); g.arc(0, -190, 64, 0, TAU); g.fill(); checkMark(g, 0, -188, 64, 12, '#FFFFFF');
  g.strokeStyle = 'rgba(25,227,161,0.35)'; g.lineWidth = 4; g.beginPath(); g.arc(0, -190, 96, 0, TAU); g.stroke();
  text(g, 'Giriş yapıldı', 0, -62, { w: 800, s: 38, c: '#0A1024' });
  mono(g, '09:00:04', 0, 8, { s: 52, w: 700, c: B.blue, a: 'center', cw: 0.64 });
  g.fillStyle = '#EEF2FB'; g.beginPath(); g.roundRect(-160, 58, 320, 96, 24); g.fill();
  avatar(g, -110, 106, 30, 'AY', B.blue);
  text(g, 'Ayşe Yılmaz', -66, 100, { f: 'Txt', w: 700, s: 24, a: 'left', c: '#0A1024' });
  text(g, 'Merkez Ofis', -66, 128, { f: 'Txt', w: 500, s: 18, a: 'left', c: '#6B7799' });
  text(g, 'Mesai süresi', 0, 206, { f: 'Txt', w: 500, s: 18, c: '#6B7799' });
  mono(g, '00:00:02', 0, 246, { s: 30, w: 700, c: '#0A1024', a: 'center', cw: 0.62 });
  g.fillStyle = '#0A1024'; g.beginPath(); g.roundRect(-150, 296, 300, 66, 33); g.fill();
  text(g, 'Çıkış yap', 0, 337, { f: 'Txt', w: 700, s: 22, c: '#FFFFFF' });
  g.restore();
}
function chip(g, x, y, p, time, late = false, w = 420) {
  const h = 104;
  g.save(); g.translate(x, y);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  g.fillStyle = 'rgba(20,31,63,0.96)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 28); g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 2; g.stroke();
  avatar(g, -w / 2 + 54, 0, 32, p.ini, p.col);
  text(g, p.name, -w / 2 + 102, -6, { f: 'Txt', w: 600, s: 27, a: 'left', c: '#FFFFFF' });
  text(g, late ? 'Geç giriş' : 'Giriş', -w / 2 + 102, 28, { f: 'Txt', w: 500, s: 21, a: 'left', c: late ? B.coral : B.slate });
  mono(g, time, w / 2 - 26, 12, { s: 30, w: 700, c: late ? B.coral : B.mint, a: 'right', cw: 0.62 });
  g.restore();
}
F.B4 = g => {
  bgB(g);
  const pill = (x, y) => {
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(25,227,161,0.14)'; g.beginPath(); g.roundRect(-210, -46, 420, 92, 46); g.fill();
    g.strokeStyle = 'rgba(25,227,161,0.55)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = B.mint; g.beginPath(); g.arc(-168, 0, 10, 0, TAU); g.fill();
    text(g, 'İçeride', -140, 11, { f: 'Txt', w: 600, s: 30, a: 'left', c: B.paper });
    mono(g, '45', 80, 16, { s: 50, w: 700, c: B.mint, a: 'right', cw: 0.62 });
    text(g, '/ 53', 92, 12, { f: 'Txt', w: 600, s: 30, a: 'left', c: B.slate });
    g.restore();
  };
  pill(540, 270);
  phone(g, 540, 760, 330, phoneCheckIn, { rot: -0.03 });
  chip(g, 300, 1205, TEAM[1], '08:58');
  chip(g, 780, 1270, TEAM[3], '09:00');
  chip(g, 360, 1385, TEAM[6], '09:02', true);
  rich(g, [['Mesaine başla', '#FFFFFF'], ['.', B.mint]], 540, 1580, { w: 900, s: 104 });
};
F.B5 = g => {
  g.fillStyle = B.ink; g.fillRect(0, 0, W, H);
  glow(g, B.coral, 540, 1850, 1400, 0.65, 700); glow(g, B.amber, 540, 1820, 900, 0.45, 380);
  dotGrid(g, '#A9BCFF', 0.07); vignette(g, 0.35);
  glow(g, B.amber, 880, 1460, 160, 0.9); g.fillStyle = '#FF8A5C'; g.beginPath(); g.arc(880, 1460, 40, 0, TAU); g.fill();
  pixelStr(g, '18:04', 540, 300, 30, B.paper);
  phone(g, 540, 880, 380, (g2, sw, sh) => {
    statusBar(g2, sw, sh, '#0A1024', '18:04');
    const k = sw / 380; g2.save(); g2.scale(k, k);
    text(g2, 'Çıkış yapıldı', 0, -238, { w: 800, s: 38, c: '#0A1024' });
    g2.lineCap = 'round'; g2.strokeStyle = '#EEF2FB'; g2.lineWidth = 22; g2.beginPath(); g2.arc(0, -62, 104, 0, TAU); g2.stroke();
    g2.strokeStyle = B.amber; g2.beginPath(); g2.arc(0, -62, 104, -Math.PI / 2, -Math.PI / 2 + TAU * 0.999); g2.stroke();
    text(g2, '9 sa 04 dk', 0, -54, { w: 800, s: 36, c: '#0A1024' });
    text(g2, 'Bugün', 0, -22, { f: 'Txt', w: 500, s: 18, c: '#6B7799' });
    g2.fillStyle = '#EEF2FB'; g2.beginPath(); g2.roundRect(-160, 92, 320, 112, 22); g2.fill();
    [['Giriş', '09:00', B.mint, 130], ['Çıkış', '18:04', B.amber, 176]].forEach(([l, v, c, y]) => {
      g2.fillStyle = c; g2.beginPath(); g2.arc(-130, y - 7, 7, 0, TAU); g2.fill();
      text(g2, l, -112, y, { f: 'Txt', w: 600, s: 20, a: 'left', c: '#0A1024' }); mono(g2, v, 134, y + 1, { s: 22, w: 700, c: '#0A1024', a: 'right' });
    });
    text(g2, 'İyi akşamlar, Ayşe!', 0, 268, { f: 'Txt', w: 600, s: 22, c: '#0A1024' });
    g2.restore();
  });
  rich(g, [['Çıkışta da okut', '#FFFFFF'], ['.', B.amber]], 540, 1600, { w: 900, s: 96 });
};
F.B6 = g => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3D66FF'); gr.addColorStop(1, '#1530B8');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 960); g.rotate(-0.2); g.fillStyle = 'rgba(255,255,255,0.05)';
  for (const m of DARK) mod(g, (m.c - QM) * 74, (m.r - QM) * 74, 64); g.restore();
  logo(g, 540, 720, 440, { variant: 'icon', shadow: 'rgba(5,15,80,0.5)' });
  text(g, 'QR Personel', 540, 1130, { w: 800, s: 124, c: '#FFFFFF' });
  text(g, 'QR kodla personel takibi', 540, 1210, { f: 'Txt', w: 600, s: 44, c: 'rgba(255,255,255,0.86)' });
  const w = 540, h = 104, y = 1390;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(540 - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.fillStyle = B.mint; g.beginPath(); g.arc(540 - w / 2 + 50, y, 11, 0, TAU); g.fill();
  text(g, 'www.qrpersonel.com', 540 + 22, y + 15, { w: 700, s: 42, c: '#1D3BD1' });
};

/* ═════════════════════ C · ÜRÜN DEMOSU — açık tema, telefon + panel, özellik kartları ═════════════════════ */
const Cc = { bg: '#F3F4F6', card: '#FFFFFF', ink: '#0F1115', grey: '#6B7280', line: '#E5E7EB', acc: '#2563EB', ok: '#16A34A', warn: '#F59E0B', bad: '#EF4444' };
function bgC(g) {
  g.fillStyle = Cc.bg; g.fillRect(0, 0, W, H);
  glow(g, '#C7D6FF', 860, 380, 700, 0.55, 600); glow(g, '#E2E8F0', 200, 1500, 700, 0.6, 600);
}
function cardC(g, x, y, w, h, r = 36) {
  g.save(); g.shadowColor = 'rgba(15,17,21,0.10)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
  g.fillStyle = Cc.card; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore();
}
function stepTag(g, n, label, y = 250) {
  g.fillStyle = Cc.ink; g.beginPath(); g.arc(120, y - 18, 34, 0, TAU); g.fill();
  text(g, String(n), 120, y - 4, { w: 800, s: 40, c: '#FFFFFF' });
  text(g, label, 176, y, { w: 900, s: 76, a: 'left', c: Cc.ink });
}
function appHome(g, sw, sh) {
  statusBar(g, sw, sh, Cc.ink, '08:56');
  const k = sw / 380; g.save(); g.scale(k, k);
  logo(g, -128, -300, 64, { variant: 'icon' });
  text(g, 'Günaydın,', -86, -306, { f: 'Txt', w: 500, s: 18, a: 'left', c: Cc.grey });
  text(g, 'Ayşe', -86, -280, { f: 'Txt', w: 700, s: 24, a: 'left', c: Cc.ink });
  g.fillStyle = Cc.ink; g.beginPath(); g.roundRect(-160, -220, 320, 250, 30); g.fill();
  logo(g, 0, -122, 160, { variant: 'light', people: [1, 1, 1] });
  text(g, 'QR ile giriş yap', 0, 6, { f: 'Txt', w: 700, s: 22, c: '#FFFFFF' });
  [['Mesai', '09:00 – 18:00'], ['Bu ay', '18 gün · 0 geç']].forEach(([a, b], i) => {
    g.fillStyle = '#F3F4F6'; g.beginPath(); g.roundRect(-160, 56 + i * 88, 320, 74, 20); g.fill();
    text(g, a, -136, 88 + i * 88, { f: 'Txt', w: 500, s: 18, a: 'left', c: Cc.grey });
    text(g, b, -136, 114 + i * 88, { f: 'Txt', w: 700, s: 21, a: 'left', c: Cc.ink });
  });
  g.restore();
}
F.C1 = g => {
  bgC(g);
  text(g, 'Personel takibi', 540, 330, { w: 900, s: 108, c: Cc.ink });
  rich(g, [['artık ', Cc.ink], ['cebinde.', Cc.acc]], 540, 450, { w: 900, s: 108 });
  phone(g, 540, 1320, 470, appHome, { shadow: 'rgba(15,17,21,0.3)' });
  // yüzen kartlar
  cardC(g, 60, 760, 330, 120, 28);
  g.fillStyle = '#DCFCE7'; g.beginPath(); g.arc(120, 820, 30, 0, TAU); g.fill(); checkMark(g, 120, 822, 30, 6, Cc.ok);
  text(g, 'Giriş 08:57', 166, 812, { f: 'Txt', w: 700, s: 28, a: 'left', c: Cc.ink }); text(g, 'Merkez Ofis', 166, 846, { f: 'Txt', w: 500, s: 22, a: 'left', c: Cc.grey });
  cardC(g, 700, 900, 320, 120, 28);
  text(g, 'İçeride', 730, 950, { f: 'Txt', w: 500, s: 24, a: 'left', c: Cc.grey });
  rich(g, [['45', Cc.ink], [' / 53', Cc.grey]], 730, 994, { w: 800, s: 44, a: 'left' });
};
F.C2 = g => {
  bgC(g);
  stepTag(g, 1, 'Okut');
  text(g, 'Kapıdaki QR’ı telefonla okut.', 90, 330, { f: 'Txt', w: 500, s: 40, a: 'left', c: Cc.grey });
  phone(g, 540, 1010, 480, (g2, sw, sh) => {
    g2.fillStyle = '#0B0C10'; g2.fillRect(-sw / 2, -sh / 2, sw, sh);
    statusBar(g2, sw, sh, '#FFFFFF', '08:57');
    qrCard(g2, 0, -20, 300);
    brackets(g2, 0, -20, 370, 370, 9, 50, '#FFFFFF');
    g2.fillStyle = Cc.acc; g2.fillRect(-160, -40, 320, 5);
    glow(g2, Cc.acc, 0, -38, 200, 0.5, 30);
    g2.fillStyle = 'rgba(255,255,255,0.14)'; g2.beginPath(); g2.roundRect(-150, 230, 300, 64, 32); g2.fill();
    text(g2, 'QR kodu çerçeveye al', 0, 271, { f: 'Txt', w: 600, s: 22, c: '#FFFFFF' });
  });
  cardC(g, 600, 1500, 420, 140, 32);
  g.fillStyle = '#DCFCE7'; g.beginPath(); g.arc(670, 1570, 38, 0, TAU); g.fill(); checkMark(g, 670, 1572, 38, 7, Cc.ok);
  text(g, 'Giriş yapıldı', 728, 1560, { f: 'Txt', w: 700, s: 32, a: 'left', c: Cc.ink }); text(g, '08:57 · Ayşe Y.', 728, 1600, { f: 'Txt', w: 500, s: 26, a: 'left', c: Cc.grey });
};
F.C3 = g => {
  bgC(g);
  stepTag(g, 2, 'Canlı takip');
  text(g, 'Kim geldi, kim gelmedi: anında.', 90, 330, { f: 'Txt', w: 500, s: 40, a: 'left', c: Cc.grey });
  cardC(g, 70, 420, 940, 1100, 44);
  text(g, 'Bugün', 120, 510, { w: 800, s: 54, a: 'left', c: Cc.ink });
  rich(g, [['45', Cc.ok], [' / 53 içeride', Cc.grey]], 960, 508, { f: 'Txt', w: 700, s: 36, a: 'right' });
  g.fillStyle = Cc.line; g.fillRect(120, 560, 840, 2);
  const rows = [[0, '08:57', 'Giriş', Cc.ok], [1, '08:58', 'Giriş', Cc.ok], [4, '08:59', 'Giriş', Cc.ok], [3, '09:00', 'Giriş', Cc.ok],
    [6, '09:02', 'Geç', Cc.warn], [7, '—', 'Bekleniyor', Cc.grey], [5, '09:00', 'Giriş', Cc.ok]];
  rows.forEach(([ti, t, s, c], i) => {
    const y = 640 + i * 124, p = TEAM[ti];
    avatar(g, 160, y, 40, p.ini, p.col);
    text(g, p.name, 222, y - 4, { f: 'Txt', w: 700, s: 32, a: 'left', c: Cc.ink });
    text(g, 'Merkez Ofis', 222, y + 32, { f: 'Txt', w: 500, s: 24, a: 'left', c: Cc.grey });
    mono(g, t, 760, y + 12, { s: 32, w: 700, c: Cc.ink, a: 'right', cw: 0.62 });
    const pw = measure(g, s, { f: 'Txt', w: 700, s: 22 }) + 40;
    g.fillStyle = rgb(hex2rgb(c), 0.14); g.beginPath(); g.roundRect(960 - pw, y - 22, pw, 44, 22); g.fill();
    text(g, s, 960 - pw / 2, y + 8, { f: 'Txt', w: 700, s: 22, c });
    if (i < rows.length - 1) { g.fillStyle = Cc.line; g.fillRect(222, y + 62, 738, 2); }
  });
  phone(g, 860, 1560, 260, appHome, { rot: 0.12, shadow: 'rgba(15,17,21,0.35)' });
};
F.C4 = g => {
  bgC(g);
  stepTag(g, 3, 'Raporla');
  text(g, 'Giriş saatleri ve puantaj hazır.', 90, 330, { f: 'Txt', w: 500, s: 40, a: 'left', c: Cc.grey });
  cardC(g, 70, 420, 940, 560, 44);
  text(g, 'Giriş saatleri', 120, 500, { w: 800, s: 44, a: 'left', c: Cc.ink });
  const bars = [3, 6, 10, 15, 11, 5, 3], lbl = ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30'];
  bars.forEach((v, k) => {
    const x = 150 + k * 122, h = v * 24, y = 900;
    g.fillStyle = k >= 5 ? Cc.warn : Cc.acc; g.beginPath(); g.roundRect(x, y - h, 84, h, 14); g.fill();
    text(g, lbl[k], x + 42, 950, { f: 'Txt', w: 600, s: 22, c: Cc.grey });
  });
  g.setLineDash([10, 10]); g.strokeStyle = Cc.ok; g.lineWidth = 3; g.beginPath(); g.moveTo(150 + 4.5 * 122 + 20, 560); g.lineTo(150 + 4.5 * 122 + 20, 900); g.stroke(); g.setLineDash([]);
  cardC(g, 70, 1020, 940, 640, 44);
  text(g, 'Eylül · Puantaj', 120, 1100, { w: 800, s: 44, a: 'left', c: Cc.ink });
  const off = 1, late = new Set([3, 9, 15, 22, 28]);
  ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach((d, i) => text(g, d, 168 + i * 124, 1160, { f: 'Txt', w: 600, s: 22, c: Cc.grey }));
  for (let i = 0; i < 35; i++) {
    const d = i - off + 1, cx = 168 + (i % 7) * 124, cy = 1220 + Math.floor(i / 7) * 82;
    const ok = d >= 1 && d <= 30, we = i % 7 >= 5;
    g.fillStyle = !ok ? '#F3F4F6' : we ? '#E5E7EB' : late.has(d) ? '#FDE68A' : '#DBEAFE';
    g.beginPath(); g.roundRect(cx - 52, cy - 32, 104, 64, 14); g.fill();
    if (ok) text(g, String(d), cx, cy + 9, { f: 'Txt', w: 700, s: 24, c: we ? Cc.grey : late.has(d) ? '#B45309' : '#1D4ED8' });
  }
};
F.C5 = g => {
  bgC(g);
  text(g, 'Hepsi', 540, 470, { w: 900, s: 130, c: Cc.ink });
  rich(g, [['tek uygulamada', Cc.acc], ['.', Cc.ink]], 540, 610, { w: 900, s: 104 });
  [['QR ile giriş ve çıkış', 'Telefonla okut, kaydol'], ['Geç kalanlar tek bakışta', 'Canlı katılım listesi'], ['Aylık puantaj', 'Giriş-çıkış saatlerinden']].forEach(([a, b], i) => {
    const y = 780 + i * 250;
    cardC(g, 80, y, 920, 200, 40);
    g.fillStyle = Cc.ink; g.beginPath(); g.roundRect(120, y + 40, 120, 120, 30); g.fill();
    if (i === 0) qr(g, 180, y + 100, 72, '#FFFFFF'); else if (i === 1) person(g, 180, y + 100, 74, '#FFFFFF');
    else { g.fillStyle = '#FFFFFF'; for (let k = 0; k < 4; k++) { const h = [28, 46, 36, 58][k]; g.fillRect(146 + k * 18, y + 130 - h, 12, h); } }
    text(g, a, 280, y + 92, { f: 'Txt', w: 700, s: 42, a: 'left', c: Cc.ink });
    text(g, b, 280, y + 140, { f: 'Txt', w: 500, s: 30, a: 'left', c: Cc.grey });
  });
};
F.C6 = g => {
  bgC(g);
  logo(g, 540, 760, 440, { variant: 'icon', shadow: 'rgba(15,17,21,0.3)' });
  text(g, 'QR Personel', 540, 1160, { w: 800, s: 124, c: Cc.ink });
  text(g, 'QR kodla personel takibi', 540, 1240, { f: 'Txt', w: 500, s: 44, c: Cc.grey });
  const w = 600, h = 112, y = 1420;
  g.fillStyle = Cc.ink; g.beginPath(); g.roundRect(540 - w / 2, y - h / 2, w, h, h / 2); g.fill();
  text(g, 'qrpersonel.com  →', 540, y + 16, { w: 700, s: 46, c: '#FFFFFF' });
  text(g, 'Hemen başlayın', 540, 1540, { f: 'Txt', w: 600, s: 36, c: Cc.acc });
};

/* ═════════════════════ D · İZOMETRİK OFİS — 3B illüstrasyon, kömür + limon ═════════════════════ */
const D = { bg0: '#1A1D24', bg1: '#0D0E12', acc: '#B6F35C', wallT: '#EEF1F5', wallL: '#C9CFD9', wallR: '#A9B0BD', floor: '#262A33', glass: '#20252F', txt: '#F4F6F8', grey: '#8A92A3' };
const ISO = { cx: 540, cy: 1000, s: 52 };
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
function iso(x, y, z = 0, o = ISO) { return [o.cx + (x - y) * C30 * o.s, o.cy + (x + y) * S30 * o.s - z * o.s]; }
function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.closePath(); g.fill(); }
function isoBox(g, x, y, z, w, d, h, cols, o = ISO) {
  const P = (a, b, c) => iso(a, b, c, o);
  poly(g, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], cols[1]);      // sol ön
  poly(g, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], cols[2]);      // sağ ön
  poly(g, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], cols[0]);      // üst
}
function bgD(g) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, D.bg0); gr.addColorStop(1, D.bg1);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  glow(g, D.acc, 540, 1000, 800, 0.08, 600);
}
function isoFloor(g, n = 7, o = ISO) {
  for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) {
    const P = (a, b) => iso(a, b, 0, o);
    poly(g, [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], (i + j) & 1 ? '#232730' : '#272B35');
  }
}
// Ofis binası: 3 kat, cam pencereler; lit: yanan pencere oranı; cut: kesit görünümü
function building(g, o = ISO, lit = 0.6, floors = 3, cut = false) {
  const x = -3, y = -3, w = 6, d = 6, fh = 2.2;
  for (let f = 0; f < floors; f++) {
    const z = f * fh;
    isoBox(g, x, y, z, w, d, fh - 0.15, [D.wallT, D.wallL, D.wallR], o);
    for (let k = 0; k < 4; k++) {
      const on = hash(f * 7 + k) < lit;
      const wx = x + 0.55 + k * 1.35, P = (a, b, c) => iso(a, b, c, o);
      poly(g, [P(wx, y + d, z + 0.45), P(wx + 0.95, y + d, z + 0.45), P(wx + 0.95, y + d, z + 1.6), P(wx, y + d, z + 1.6)], on ? D.acc : D.glass);
      const on2 = hash(f * 11 + k + 3) < lit, wy = y + 0.55 + k * 1.35;
      poly(g, [P(x + w, wy, z + 0.45), P(x + w, wy + 0.95, z + 0.45), P(x + w, wy + 0.95, z + 1.6), P(x + w, wy, z + 1.6)], on2 ? '#9BD64C' : '#1B2029');
    }
  }
  isoBox(g, x - 0.2, y - 0.2, floors * fh - 0.15, w + 0.4, d + 0.4, 0.3, ['#FFFFFF', '#D5DAE2', '#B7BEC9'], o);
  if (cut) return;
  // kapı
  const P = (a, b, c) => iso(a, b, c, o);
  poly(g, [P(x + 2.3, y + d, 0), P(x + 3.7, y + d, 0), P(x + 3.7, y + d, 1.6), P(x + 2.3, y + d, 1.6)], '#14171D');
}
// İzometrik kişi (logo silüeti, yüzü kameraya dönük)
function isoPerson(g, x, y, h, col, o = ISO) {
  const [sx, sy] = iso(x, y, 0, o);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(sx, sy, h * 0.28, h * 0.12, 0, 0, TAU); g.fill();
  person(g, sx, sy - h * 0.5, h, col);
}
function totem(g, x, y, glowOn, o = ISO) {
  isoBox(g, x - 0.25, y - 0.25, 0, 0.5, 0.5, 2.0, ['#3A404C', '#2C313B', '#232730'], o);
  const P = (a, b, c) => iso(a, b, c, o);
  poly(g, [P(x - 0.22, y + 0.25, 1.15), P(x + 0.22, y + 0.25, 1.15), P(x + 0.22, y + 0.25, 1.8), P(x - 0.22, y + 0.25, 1.8)], '#FFFFFF');
  const [qx, qy] = iso(x, y + 0.25, 1.48, o);
  g.save(); g.translate(qx, qy); g.transform(1, -0.577 * 0, 0, 1, 0, 0);
  qr(g, 0, 0, o.s * 0.36, '#111'); g.restore();
  if (glowOn) glow(g, D.acc, qx, qy, o.s * 1.6, 0.9);
}
F.D1 = g => {
  bgD(g);
  text(g, '08:45', 540, 270, { f: 'Txt', w: 600, s: 36, ls: 8, c: D.grey });
  text(g, 'Ofis', 540, 400, { w: 900, s: 130, c: D.txt });
  rich(g, [['uyanıyor', D.txt], ['.', D.acc]], 540, 530, { w: 900, s: 130 });
  const o = { cx: 540, cy: 1290, s: 56 };
  isoFloor(g, 7, o);
  building(g, o, 0.35, 2);
  // üst kat küpleri gökten düşüyor (hız izleriyle)
  const R = mulberry32(2);
  for (let i = 0; i < 9; i++) {
    const cx = -3 + (i % 3) * 2, cy = -3 + Math.floor(i / 3) * 2, z = 4.6 + R() * 2.4;
    const [x1, y1] = iso(cx + 1, cy + 1, z + 2.05, o);
    g.strokeStyle = 'rgba(182,243,92,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x1, y1 - 130); g.lineTo(x1, y1 - 30); g.stroke();
    isoBox(g, cx, cy, z, 2, 2, 2.05, [D.wallT, D.wallL, D.wallR], o);
  }
};
F.D2 = g => {
  bgD(g);
  const o = { cx: 470, cy: 900, s: 64 };
  isoFloor(g, 7, o);
  building(g, o, 0.7, 3);
  totem(g, 1.4, 4.1, true, o);
  // kapıya yürüyen ekip
  const q = [[0.4, 5.2], [0.2, 6.3], [-0.2, 7.4], [1.6, 7.2]];
  q.forEach(([x, y], i) => isoPerson(g, x + 2.3, y, 120, i === 0 ? D.acc : '#F4F6F8', o));
  text(g, 'Girişte', 540, 1560, { w: 900, s: 120, c: D.txt });
  rich(g, [['okut', D.txt], ['.', D.acc]], 540, 1690, { w: 900, s: 120 });
};
F.D3 = g => {
  bgD(g);
  const o = { cx: 540, cy: 1130, s: 150 };
  isoFloor(g, 5, o);
  // totem: önden görünen büyük QR panosu
  isoBox(g, -1.4, -0.6, 0, 0.6, 0.6, 3.2, ['#3A404C', '#2C313B', '#232730'], o);
  const [tx, ty] = iso(-1.1, 0, 2.3, o);
  g.save(); g.shadowColor = 'rgba(182,243,92,0.6)'; g.shadowBlur = 60;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(tx - 150, ty - 150, 300, 300, 26); g.fill(); g.restore();
  qr(g, tx, ty, 236, '#111');
  isoPerson(g, 1.1, 1.3, 330, D.acc, o);
  // tarama ışını
  const [px, py] = iso(1.1, 1.3, 1.6, o);
  g.strokeStyle = 'rgba(182,243,92,0.75)'; g.lineWidth = 6; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(tx + 150, ty); g.lineTo(px - 60, py); g.stroke(); g.setLineDash([]);
  g.fillStyle = D.acc; g.beginPath(); g.roundRect(700, 560, 220, 120, 60); g.fill();
  text(g, '+1', 810, 642, { w: 900, s: 72, c: '#111' });
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.roundRect(120, 300, 840, 150, 40); g.fill();
  text(g, 'İçeride', 180, 395, { f: 'Txt', w: 600, s: 40, a: 'left', c: D.grey });
  rich(g, [['12', D.acc], [' / 53', D.grey]], 900, 405, { w: 900, s: 90, a: 'right' });
  text(g, 'Her giriş kayıtta.', 540, 1640, { w: 900, s: 100, c: D.txt });
};
F.D4 = g => {
  bgD(g);
  const o = { cx: 430, cy: 1050, s: 70 };
  isoFloor(g, 7, o);
  building(g, o, 0.95, 3, true);
  [['Depo', '18/20'], ['Satış', '12/12'], ['Ofis', '15/21']].forEach(([n, v], f) => {
    const [x, y] = iso(3.2, 0, f * 2.2 + 1.1, o);
    g.strokeStyle = 'rgba(182,243,92,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 50, y); g.stroke();
    g.fillStyle = 'rgba(20,23,29,0.92)'; g.beginPath(); g.roundRect(x + 50, y - 50, 280, 100, 26); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; g.stroke();
    text(g, n, x + 80, y + 12, { f: 'Txt', w: 700, s: 34, a: 'left', c: D.txt });
    text(g, v, x + 306, y + 14, { w: 800, s: 40, a: 'right', c: D.acc });
  });
  text(g, 'Her ekip,', 540, 1560, { w: 900, s: 110, c: D.txt });
  rich(g, [['tek ekranda', D.txt], ['.', D.acc]], 540, 1690, { w: 900, s: 110 });
};
F.D5 = g => {
  bgD(g);
  const o = { cx: 540, cy: 1150, s: 58 };
  isoFloor(g, 7, o);
  const vals = [3, 6, 10, 15, 11, 5, 3];
  vals.forEach((v, k) => isoBox(g, -5 + k * 1.5, -0.6, 0, 1.1, 1.2, v * 0.55, k >= 5 ? ['#FFB4A8', '#E8826F', '#C9634F'] : k === 3 ? ['#DFFFB0', D.acc, '#8CC43A'] : [D.wallT, D.wallL, D.wallR], o));
  g.fillStyle = 'rgba(20,23,29,0.94)'; g.beginPath(); g.roundRect(150, 300, 780, 230, 40); g.fill();
  g.strokeStyle = 'rgba(182,243,92,0.5)'; g.lineWidth = 2; g.stroke();
  text(g, 'Eylül puantajı', 210, 395, { w: 800, s: 56, a: 'left', c: D.txt });
  text(g, '22 iş günü · 53 personel', 210, 460, { f: 'Txt', w: 500, s: 34, a: 'left', c: D.grey });
  g.fillStyle = D.acc; g.beginPath(); g.arc(860, 415, 44, 0, TAU); g.fill(); checkMark(g, 860, 417, 44, 9, '#111');
  text(g, 'Ay sonu?', 540, 1560, { w: 900, s: 110, c: D.txt });
  rich(g, [['Puantaj hazır', D.acc], ['.', D.txt]], 540, 1690, { w: 900, s: 110 });
};
F.D6 = g => {
  bgD(g);
  const o = { cx: 540, cy: 1020, s: 60 };
  // limon zemin platformu + ekstrüde logo
  glow(g, D.acc, 540, 1020, 520, 0.35, 260);
  isoBox(g, -3.4, -3.4, 0, 6.8, 6.8, 0.35, ['#2E333E', '#252A33', '#1E222A'], o);
  // ikon platformun üstünde dik durur; arkada üst üste kayan katmanlar derinlik verir
  const sz = 380, cx = 540, cy = 760;
  for (let i = 14; i >= 1; i--) {
    g.fillStyle = i > 1 ? '#0B0B0C' : '#000';
    g.beginPath(); g.roundRect(cx - sz / 2 + i * 2.2, cy - sz / 2 + i * 1.6, sz, sz, sz * 0.1875); g.fill();
  }
  logo(g, cx, cy, sz, { variant: 'icon' });
  g.strokeStyle = 'rgba(182,243,92,0.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.1875); g.stroke();
  text(g, 'QR Personel', 540, 1430, { w: 800, s: 124, c: D.txt });
  text(g, 'QR kodla personel takibi', 540, 1510, { f: 'Txt', w: 500, s: 44, c: D.grey });
  const w = 540, h = 100, y = 1660;
  g.fillStyle = D.acc; g.beginPath(); g.roundRect(540 - w / 2, y - h / 2, w, h, h / 2); g.fill();
  text(g, 'qrpersonel.com', 540, y + 15, { w: 800, s: 46, c: '#111' });
};

F.LOGO_TEST = g => {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
  logo(g, 256, 256, 512, { variant: 'dark' });
  logo(g, 540 + 96, 96, 192, { variant: 'icon' });
};

const ctx = document.getElementById('c').getContext('2d');
window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  window.drawFrame = id => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); F[id](ctx); };
  window.FRAME_IDS = Object.keys(F);
  return true;
})();
