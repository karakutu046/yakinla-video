'use strict';
/* TASARIM 01 · NEON TERMİNAL (brief v2 · kripto724)
 * Gece hiç kapanmayan bir piyasa terminali: zifiri siyah, marka turuncusu #F7931A ana neon,
 * camgöbeği ikinci ışık; yeşil / kırmızı yalnızca fiyatın yönü için. Monospace okumalar,
 * tarama çizgileri, glitch başlıklar, yanıp sönen imleç, mumlar ve sahnelerin tepesinde kayan
 * fiyat bandı. Uygulamanın gerçek verileri terminal pencerelerinde ve telefon çerçevesinde
 * (uygulamanın açık teması) görünür. Logo: resmî logo() / uygulama ikonu, beyaz harf. */

const D1 = { bg: '#04060A', o: '#F7931A', c: '#00E5FF', up: '#00D27A', dn: '#FF3B5C', ink: '#F3F1EC', dim: '#7D8391', win: 'rgba(7,8,12,0.95)' };
const D1F = { sg: 'Space Grotesk', jb: 'JetBrains Mono', ui: 'Inter' };
// app UI (light theme), from the client's screenshots
const D1A = {
  page: '#EEF0F5', ink: '#14161F', soft: '#7A7F8C', line: '#EEF0F4', up: '#16A34A', upBg: '#DCF5E6', dn: '#E5484D', dnBg: '#FDE2E2',
  track: '#F1F0FA', badge: '#E5E3FF', badgeInk: '#6E5BFF', live: '#10B981', liveBg: '#E3F7EE', cream: '#FFF7E3',
};

/* ── data (exactly as in the app) ── */
const D1_TAPE = [
  ['BTC', '$80.220,05', '−1,49%'], ['BIST 100', '11.165,44', '+0,13%'], ['Gram Altın', '₺6.510,83', '+0,40%'], ['ETH', '$2.325,10', '−1,67%'],
  ['Nasdaq 100', '29.813,16', '+0,55%'], ['Ons Altın', '$4.033,60', '+0,40%'], ['MU', '$983,23', '+5,87%'], ['XRP', '$1,2913', '−2,64%'],
  ['Çeyrek Altın', '₺10.476', '+0,60%'], ['GOOGL', '$324,89', '+1,34%'], ['SOL', '$100,56', '−2,17%'], ['NVDA', '$215,38', '−1,17%'],
  ['BNB', '$740,00', '−2,66%'], ['Ata Altın', '₺42.993', '+0,32%'],
];
const D1_CRYPTO = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
const D1_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%'], ['META', 'Meta Platforms', '$612,49', '−1,24%'], ['NVDA', 'NVIDIA', '$215,38', '−1,17%'],
  ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%'], ['TSLA', 'Tesla', '$404,22', '−0,79%'], ['MSFT', 'Microsoft', '$531,01', '−0,06%'],
  ['AAPL', 'Apple', '$343,83', '−0,94%'],
];
const D1_GOLD = [
  ['Gram Altın', '24 ayar · gram', '6.422,05', '6.510,83', '+0,40%'],
  ['Has Altın', '995 · gram', '6.454,32', '6.491,36', ''],
  ['22 Ayar', 'bilezik · gram', '5.871,43', '6.081,88', ''],
  ['Çeyrek Altın', '1,75 gr · 22 ayar', '10.327', '10.476', '+0,60%'],
  ['Yarım Altın', '', '20.654', '20.815', ''],
  ['Tam Altın', '', '41.372', '41.727', ''],
  ['Ata Altın', '', '42.566', '42.993', '+0,32%'],
  ['Gremse', '', '102.946', '104.301', ''],
  ['Ata Beşli', '', '212.799', '214.914', '+0,25%'],
];
const D1_COIN = { BTC: ['#F7931A', 'B'], ETH: ['#627EEA', 'E'], XRP: ['#23292F', 'X'], BNB: ['#F3BA2F', 'B'], SOL: [['#9945FF', '#14F195'], 'S'], DOGE: ['#C2A633', 'D'], ADA: ['#2A5ADA', 'A'], AU: [['#D9A520', '#F2C14E'], 'Au'] };

/* ── terminal helpers ── */
function d1_bg(g, tint = D1.o, a = 0.07) {
  g.fillStyle = D1.bg; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(CX, CY, 100, CX, CY, 1200);
  gr.addColorStop(0, hexA(tint, a)); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = hexA(tint, 0.045); g.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
}
function d1_scan(g) {
  g.fillStyle = 'rgba(0,0,0,0.2)';
  for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1.5);
  const v = g.createRadialGradient(CX, CY, 620, CX, CY, 1150);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// monospace text; ₺ is missing from JetBrains Mono, so it is set in Space Grotesk
function d1_segs(s) { return String(s).split(/(₺)/).filter(p => p); }
function d1_mf(p, size, w, ls) { return p === '₺' ? { f: D1F.sg, w: 700, s: size } : { f: D1F.jb, w, s: size, ls }; }
function d1_mw(g, s, size, w = 400, ls = 0) { let t = 0; for (const p of d1_segs(s)) t += measure(g, p, d1_mf(p, size, w, ls)); return t; }
function d1_mono(g, s, x, y, size, col, o = {}) {
  const w = o.w || 400, ls = o.ls || 0, tw = d1_mw(g, s, size, w, ls);
  let px = o.a === 'right' ? x - tw : o.a === 'center' ? x - tw / 2 : x;
  for (const p of d1_segs(s)) { const f = d1_mf(p, size, w, ls); text(g, p, px, y, { ...f, a: 'left', c: col }); px += measure(g, p, f); }
  return tw;
}
function d1_neon(g, s, x, y, o, col, blur = 28) {
  g.save(); g.shadowColor = col; g.shadowBlur = blur; text(g, s, x, y, { ...o, c: col }); g.shadowBlur = blur * 0.4; text(g, s, x, y, { ...o, c: col }); g.restore();
}
// RGB-split glitch (cyan / orange) with a few displaced slices
function d1_glitch(g, s, x, y, o, col, amt = 8, seed = 1) {
  const o2 = col === D1.o ? '#FFFFFF' : D1.o;
  g.save(); g.globalCompositeOperation = 'lighter';
  text(g, s, x - amt, y, { ...o, c: hexA(D1.c, 0.7) });
  text(g, s, x + amt, y + 2, { ...o, c: hexA(o2, 0.55) });
  g.restore();
  d1_neon(g, s, x, y, o, col, 20);
  const tw = measure(g, s, o), x0 = o.a === 'left' ? x : o.a === 'right' ? x - tw : x - tw / 2;
  const r = mulberry32(seed);
  for (let k = 0; k < 3; k++) {
    const sy = y - o.s * 0.8 + r() * o.s * 0.85, sh = 6 + r() * 14, dx = (r() - 0.5) * amt * 6;
    g.save(); g.beginPath(); g.rect(x0 - 30, sy, tw + 60, sh); g.clip();
    g.fillStyle = D1.bg; g.fillRect(x0 - 30, sy, tw + 60, sh);
    text(g, s, x + dx, y, { ...o, c: k % 2 ? D1.c : col });
    g.restore();
  }
}
function d1_win(g, x, y, w, h, title, col = D1.o, o = {}) {
  g.save();
  g.fillStyle = o.fill || D1.win; g.fillRect(x, y, w, h);
  if (o.glow) { g.shadowColor = col; g.shadowBlur = o.glow; }
  g.strokeStyle = hexA(col, o.a || 0.6); g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.shadowBlur = 0;
  g.fillStyle = hexA(col, 0.13); g.fillRect(x, y, w, 38);
  g.fillStyle = col; g.fillRect(x + 14, y + 13, 12, 12);
  d1_mono(g, title, x + 38, y + 26, 18, col, { w: 700 });
  // window buttons: _ □ ×
  g.strokeStyle = hexA(col, 0.75); g.lineWidth = 2;
  const bx = x + w - 30;
  g.beginPath(); g.moveTo(bx, y + 13); g.lineTo(bx + 12, y + 25); g.moveTo(bx + 12, y + 13); g.lineTo(bx, y + 25); g.stroke();
  g.strokeRect(bx - 26, y + 13, 12, 12);
  g.beginPath(); g.moveTo(bx - 52, y + 25); g.lineTo(bx - 40, y + 25); g.stroke();
  g.restore();
}
function d1_cursor(g, x, y, s, col) { g.save(); g.shadowColor = col; g.shadowBlur = 12; g.fillStyle = col; g.fillRect(x, y - s * 0.8, s * 0.55, s * 0.98); g.restore(); }
function d1_tri(g, x, y, s, up, col) {
  g.fillStyle = col; g.beginPath();
  if (up) { g.moveTo(x, y - s * 0.45); g.lineTo(x + s / 2, y + s * 0.4); g.lineTo(x - s / 2, y + s * 0.4); }
  else { g.moveTo(x, y + s * 0.45); g.lineTo(x + s / 2, y - s * 0.4); g.lineTo(x - s / 2, y - s * 0.4); }
  g.closePath(); g.fill();
}
// change tag "▲ +0,13%" (terminal style), vertically centred on cy
function d1_chg(g, s, x, cy, size = 22, a = 'right') {
  const up = s[0] === '+', col = up ? D1.up : D1.dn;
  const tw = d1_mw(g, s, size, 700), ts = size * 0.5, pad = size * 0.45, w = pad + ts + size * 0.3 + tw + pad, h = size * 1.45;
  const x0 = a === 'right' ? x - w : a === 'center' ? x - w / 2 : x;
  g.fillStyle = hexA(col, 0.13); g.fillRect(x0, cy - h / 2, w, h);
  g.strokeStyle = hexA(col, 0.45); g.lineWidth = 1.5; g.strokeRect(x0 + 0.75, cy - h / 2 + 0.75, w - 1.5, h - 1.5);
  d1_tri(g, x0 + pad + ts / 2, cy, ts, up, col);
  d1_mono(g, s, x0 + pad + ts + size * 0.3, cy + size * 0.36, size, col, { w: 700 });
  return w;
}
// scrolling price tape
function d1_tape(g, y, off = 0) {
  const h = 56;
  g.fillStyle = '#08090C'; g.fillRect(0, y, W, h);
  g.fillStyle = hexA(D1.o, 0.75); g.fillRect(0, y + h - 2, W, 2);
  g.save(); g.beginPath(); g.rect(170, y, W - 170, h); g.clip();
  let x = 196 - off, i = 0;
  while (x < W) {
    const [n, p, c] = D1_TAPE[i % D1_TAPE.length], up = c[0] === '+', col = up ? D1.up : D1.dn;
    x += d1_mono(g, n, x, y + 36, 21, D1.ink, { w: 700 }) + 14;
    x += d1_mono(g, p, x, y + 36, 21, hexA(D1.ink, 0.78)) + 14;
    d1_tri(g, x + 6, y + 29, 11, up, col); x += 18;
    x += d1_mono(g, c, x, y + 36, 21, col, { w: 700 }) + 22;
    g.fillStyle = hexA(D1.o, 0.6); g.fillRect(x, y + 25, 6, 6); x += 28;
    i++;
  }
  g.restore();
  const fade = g.createLinearGradient(W - 140, 0, W, 0);
  fade.addColorStop(0, 'rgba(8,9,12,0)'); fade.addColorStop(1, 'rgba(8,9,12,1)');
  g.fillStyle = fade; g.fillRect(W - 140, y, 140, h - 2);
  g.fillStyle = D1.o; g.fillRect(0, y, 170, h);
  g.fillStyle = D1.bg; g.beginPath(); g.arc(32, y + 28, 7, 0, TAU); g.fill();
  d1_mono(g, 'CANLI', 52, y + 36, 22, D1.bg, { w: 800, ls: 2 });
}
function d1_coin(g, x, y, r, sym) {
  const [col, ch] = D1_COIN[sym] || ['#2B303C', sym];
  g.save();
  if (Array.isArray(col)) { const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); g.fillStyle = gr; } else g.fillStyle = col;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  if (sym === 'XRP') { g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = Math.max(1.5, r * 0.08); g.stroke(); }
  const dark = sym === 'BNB' || sym === 'DOGE' || sym === 'AU';
  text(g, ch, x, y + r * 0.36, { f: D1F.sg, w: 700, s: r * (ch.length > 1 ? 0.8 : 1.05), c: dark ? '#14161F' : '#FFFFFF' });
  g.restore();
}
function d1_line(g, pts, col, lw = 4, glowA = 0.9) {
  g.save(); g.shadowColor = col; g.shadowBlur = 18 * glowA; g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
}
function d1_spark(g, x, y, w, h, seed, up, col, o = {}) {
  const s = walk(seed, o.n || 40, up ? 0.005 : -0.005, o.vol || 0.011);
  const mn = Math.min(...s), mx = Math.max(...s);
  const pts = s.map((v, i) => [x + i / (s.length - 1) * w, y + h - (v - mn) / (mx - mn || 1) * h]);
  if (o.fill) {
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hexA(col, o.fill)); gr.addColorStop(1, hexA(col, 0));
    g.beginPath(); smoothPath(g, pts); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fillStyle = gr; g.fill();
  }
  if (o.glow) d1_line(g, pts, col, o.lw || 3, o.glow);
  else { g.strokeStyle = col; g.lineWidth = o.lw || 1.6; g.lineJoin = 'round'; g.beginPath(); smoothPath(g, pts); g.stroke(); }
  return pts;
}
// OHLC series from v0 to v1 (values 0..1)
function d1_ohlc(seed, n, v0, v1, vol = 0.05) {
  const r = mulberry32(seed), raw = [v0];
  for (let i = 1; i < n; i++) raw.push(raw[i - 1] + (r() - 0.5) * vol * 2);
  const fix = v1 - raw[n - 1], cl = raw.map((v, i) => v + fix * i / (n - 1));
  return cl.map((c, i) => { const op = i ? cl[i - 1] : c + vol * 0.3; return [op, c, Math.max(op, c) + r() * vol * 0.6, Math.min(op, c) - r() * vol * 0.6]; });
}
function d1_candles(g, cs, x, y, w, h, lo, hi) {
  const n = cs.length, bw = w / n, Y = v => y + h - (v - lo) / (hi - lo) * h, X = i => x + i * bw + bw / 2;
  cs.forEach(([op, c, hh, ll], i) => {
    const col = c >= op ? D1.up : D1.dn, cx = X(i);
    g.fillStyle = col; g.fillRect(cx - 1, Y(hh), 2, Y(ll) - Y(hh));
    const top = Y(Math.max(op, c)); g.fillRect(cx - bw * 0.32, top, bw * 0.64, Math.max(2, Y(Math.min(op, c)) - top));
  });
  return { X, Y };
}
function d1_star(g, cx, cy, r, col) {
  g.fillStyle = col; g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); }
  g.closePath(); g.fill();
}
function d1_arrow(g, x, y, s, col, lw = 4) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x + s * 0.35, y - s * 0.6); g.lineTo(x + s, y); g.lineTo(x + s * 0.35, y + s * 0.6); g.stroke(); g.restore();
}
function d1_corners(g, x, y, w, h, L, col, lw = 5) {
  g.save(); g.shadowColor = col; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'square';
  g.beginPath();
  g.moveTo(x, y + L); g.lineTo(x, y); g.lineTo(x + L, y);
  g.moveTo(x + w - L, y); g.lineTo(x + w, y); g.lineTo(x + w, y + L);
  g.moveTo(x + w, y + h - L); g.lineTo(x + w, y + h); g.lineTo(x + w - L, y + h);
  g.moveTo(x + L, y + h); g.lineTo(x, y + h); g.lineTo(x, y + h - L);
  g.stroke(); g.restore();
}
function d1_packet(g, x, y, col = D1.o) { g.save(); g.shadowColor = col; g.shadowBlur = 16; g.fillStyle = '#FFFFFF'; g.fillRect(x - 6, y - 6, 12, 12); g.restore(); }
// app icon: black rounded square with the white stacked logo
function d1_appIcon(g, cx, cy, s, o = {}) {
  if (o.glow) addGlow(g, D1.o, cx, cy, s * 1.35, o.glow);
  g.save();
  g.shadowColor = o.dark ? 'rgba(247,147,26,0.55)' : 'rgba(0,0,0,0.25)'; g.shadowBlur = s * 0.2;
  rr(g, cx - s / 2, cy - s / 2, s, s, s * 0.22); g.fillStyle = '#0A0A0A'; g.fill();
  g.shadowBlur = 0;
  if (o.dark) { g.lineWidth = Math.max(1.5, s * 0.012); g.strokeStyle = 'rgba(255,255,255,0.16)'; g.stroke(); }
  g.restore();
  logo(g, cx, cy, s * 0.66, { ink: '#FFFFFF' });
}

/* ── app UI helpers (native phone points, 390 wide) ── */
function d1_ui(g, s, x, y, size, col = D1A.ink, w = 600, a = 'left') { text(g, s, x, y, { f: D1F.ui, w, s: size, a, c: col }); }
function d1_uiPill(g, s, x, cy, size = 11, a = 'right') {
  const up = s[0] === '+', tw = measure(g, s, { f: D1F.ui, w: 700, s: size }), h = size * 1.7, w = tw + size * 1.2;
  const x0 = a === 'right' ? x - w : a === 'center' ? x - w / 2 : x;
  rr(g, x0, cy - h / 2, w, h, h / 2); g.fillStyle = up ? D1A.upBg : D1A.dnBg; g.fill();
  text(g, s, x0 + w / 2, cy + size * 0.36, { f: D1F.ui, w: 700, s: size, c: up ? D1A.up : D1A.dn });
  return w;
}
function d1_uiCard(g, x, y, w, h, r = 18, fill = '#FFFFFF') {
  g.save(); g.shadowColor = 'rgba(20,22,31,0.08)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
  rr(g, x, y, w, h, r); g.fillStyle = fill; g.fill(); g.restore();
}
function d1_uiLive(g, xr, cy, label) {
  const f = { f: D1F.ui, w: 700, s: 10.5 }, tw = measure(g, label, f), w = tw + 30;
  rr(g, xr - w, cy - 11, w, 22, 11); g.fillStyle = D1A.liveBg; g.fill();
  g.fillStyle = D1A.live; g.beginPath(); g.arc(xr - w + 11, cy, 3.6, 0, TAU); g.fill();
  text(g, label, xr - w + 19, cy + 3.8, { ...f, a: 'left', c: D1A.live });
}
function d1_status(g, t) {
  d1_ui(g, t, 36, 33, 15, D1A.ink, 600);
  g.fillStyle = D1A.ink;
  for (let k = 0; k < 4; k++) g.fillRect(296 + k * 5, 29 - (k + 1) * 2.6, 3.2, (k + 1) * 2.6);
  g.strokeStyle = D1A.ink; g.lineWidth = 1.2; rr(g, 324, 19.5, 25, 12, 3.5); g.stroke();
  g.fillRect(326.5, 22, 17, 7); g.fillRect(350.5, 23.5, 1.8, 4.5);
}
function d1_navIcon(g, k, x, y) {
  g.save(); g.strokeStyle = D1A.soft; g.fillStyle = D1A.soft; g.lineWidth = 1.7; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  if (k === 'feed') { for (let i = 0; i < 3; i++) { g.moveTo(x - 8, y - 6 + i * 6); g.lineTo(x + 8, y - 6 + i * 6); } }
  else if (k === 'news') { g.roundRect(x - 8, y - 9, 16, 18, 3); g.moveTo(x - 4, y - 3); g.lineTo(x + 4, y - 3); g.moveTo(x - 4, y + 2); g.lineTo(x + 4, y + 2); }
  else if (k === 'chart') { g.moveTo(x - 9, y + 6); g.lineTo(x - 3, y - 1); g.lineTo(x + 1, y + 3); g.lineTo(x + 9, y - 7); }
  else if (k === 'bell') { g.moveTo(x - 7, y + 5); g.lineTo(x - 6, y - 2); g.arc(x, y - 2, 6, Math.PI, 0); g.lineTo(x + 7, y + 5); g.closePath(); g.moveTo(x - 2, y + 8); g.lineTo(x + 2, y + 8); }
  else if (k === 'star') { g.restore(); g.save(); d1_star(g, x, y, 8.5, D1A.soft); g.restore(); return; }
  else { g.arc(x, y - 4, 4.5, 0, TAU); g.moveTo(x + 8, y + 9); g.arc(x, y + 9, 8, 0, Math.PI, true); }
  g.stroke(); g.restore();
}
function d1_nav(g, items) {
  g.save(); g.shadowColor = 'rgba(20,22,31,0.10)'; g.shadowBlur = 14; g.fillStyle = '#FFFFFF'; g.fillRect(0, 768, 390, 76); g.restore();
  const xs = [39, 117, 195, 273, 351];
  items.forEach((it, i) => {
    if (!it) { d1_appIcon(g, 195, 789, 48); return; }
    d1_navIcon(g, it[1], xs[i], 792);
    d1_ui(g, it[0], xs[i], 819, 9.5, D1A.soft, 500, 'center');
  });
  g.fillStyle = D1A.ink; rr(g, 128, 833, 134, 4.5, 2.25); g.fill();
}
// phone frame (orange neon rim); fn draws the screen in native 390 × 844 points
function d1_phone(g, x, y, sw, fn) {
  const k = sw / 390, sh = 844 * k, pad = 13, R = 52 * k;
  g.save();
  g.shadowColor = hexA(D1.o, 0.5); g.shadowBlur = 60;
  rr(g, x - pad, y - pad, sw + pad * 2, sh + pad * 2, R + pad); g.fillStyle = '#0C0D11'; g.fill();
  g.shadowBlur = 0; g.lineWidth = 2.5; g.strokeStyle = hexA(D1.o, 0.8); g.stroke();
  rr(g, x - pad + 5, y - pad + 5, sw + pad * 2 - 10, sh + pad * 2 - 10, R + pad - 5); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.08)'; g.stroke();
  rr(g, x, y, sw, sh, R); g.clip();
  g.translate(x, y); g.scale(k, k);
  g.fillStyle = D1A.page; g.fillRect(0, 0, 390, 844);
  fn(g);
  g.fillStyle = '#000'; rr(g, 138, 11, 114, 32, 16); g.fill();
  g.restore();
}

/* ── phone screens ── */
function d1_scrBorsa(g) {
  const A = D1A;
  d1_status(g, '14:23');
  d1_ui(g, 'Borsa', 20, 94, 28, A.ink, 700);
  d1_ui(g, 'BIST ve Nasdaq hisseleri', 20, 116, 13, A.soft, 500);
  d1_uiLive(g, 370, 86, 'CANLI · 14:23');
  [['BIST 100', '11.165,44', '+0,13%', 11], ['Nasdaq 100', '29.813,16', '+0,55%', 12]].forEach(([n, v, c, sd], i) => {
    const x = 20 + i * 180, y = 134;
    d1_uiCard(g, x, y, 170, 92, 16);
    d1_ui(g, n, x + 12, y + 22, 11.5, A.soft, 600);
    d1_ui(g, v, x + 12, y + 50, 19, A.ink, 700);
    d1_uiPill(g, c, x + 12, y + 72, 10, 'left');
    d1_spark(g, x + 92, y + 56, 66, 26, sd, true, A.up, { n: 26, lw: 1.8 });
  });
  rr(g, 20, 240, 350, 40, 20); g.fillStyle = A.track; g.fill();
  const segW = 350 / 3;
  [['Tümü', '210'], ['BIST', '108'], ['Nasdaq', '102']].forEach(([l, n], i) => {
    const sx = 20 + i * segW;
    if (i === 0) { g.save(); g.shadowColor = 'rgba(20,22,31,0.14)'; g.shadowBlur = 6; g.shadowOffsetY = 1; rr(g, sx + 3, 243, segW - 6, 34, 17); g.fillStyle = '#FFFFFF'; g.fill(); g.restore(); }
    const lw = measure(g, l, { f: D1F.ui, w: 600, s: 12.5 }), nw = measure(g, n, { f: D1F.ui, w: 700, s: 10 }) + 12, x0 = sx + (segW - lw - 5 - nw) / 2;
    d1_ui(g, l, x0, 264.5, 12.5, i === 0 ? A.ink : A.soft, 600);
    rr(g, x0 + lw + 5, 251.5, nw, 17, 8.5); g.fillStyle = A.badge; g.fill();
    d1_ui(g, n, x0 + lw + 5 + nw / 2, 263.5, 10, A.badgeInk, 700, 'center');
  });
  let fx = 20;
  [['Favoriler', 'star'], ['Popüler', 'on'], ['Yükselenler'], ['Düşenler']].forEach(([l, k]) => {
    const tw = measure(g, l, { f: D1F.ui, w: 600, s: 11.5 }), ex = k === 'star' ? 15 : 0, w = tw + ex + 20;
    rr(g, fx, 294, w, 28, 14);
    if (k === 'on') { g.fillStyle = A.ink; g.fill(); } else { g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = '#E2E4EA'; g.lineWidth = 1; g.stroke(); }
    if (ex) d1_star(g, fx + 16, 307.5, 6, D1.o);
    d1_ui(g, l, fx + 10 + ex, 312, 11.5, k === 'on' ? '#FFFFFF' : A.ink, 600);
    fx += w + 6;
  });
  rr(g, 20, 334, 350, 38, 12); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = '#E2E4EA'; g.lineWidth = 1; g.stroke();
  g.strokeStyle = A.soft; g.lineWidth = 1.6; g.beginPath(); g.arc(39, 351, 5.5, 0, TAU); g.moveTo(43, 355); g.lineTo(47, 359); g.stroke();
  d1_ui(g, 'Hisse adı ya da kodu ara…', 56, 357.5, 12.5, A.soft, 500);
  d1_ui(g, '210 hisse', 24, 395, 12, A.soft, 600);
  d1_ui(g, 'Fiyat · Günlük', 366, 395, 12, A.soft, 600, 'right');
  d1_uiCard(g, 20, 406, 350, 7 * 56 + 8, 18);
  D1_STOCKS.forEach(([tk, nm, p, c], i) => {
    const cy = 410 + i * 56 + 28, up = c[0] === '+';
    if (i) { g.fillStyle = A.line; g.fillRect(70, cy - 28, 286, 1); }
    g.fillStyle = A.page; g.beginPath(); g.arc(46, cy, 15.5, 0, TAU); g.fill();
    d1_ui(g, tk, 46, cy + 3, tk.length > 3 ? 7.4 : 9, A.ink, 700, 'center');
    d1_ui(g, tk, 70, cy - 3, 13.5, A.ink, 700);
    d1_ui(g, nm, 70, cy + 13, 10.5, A.soft, 500);
    d1_spark(g, 200, cy - 10, 54, 20, 60 + i, up, up ? A.up : A.dn, { n: 22, lw: 1.5 });
    d1_ui(g, p, 356, cy - 3, 13.5, A.ink, 700, 'right');
    d1_uiPill(g, c, 356, cy + 13, 9.5, 'right');
  });
  d1_nav(g, [['Akış', 'feed'], ['Haberler', 'news'], null, ['Alarmlarım', 'bell'], ['Hesabım', 'user']]);
}
function d1_scrKasam(g) {
  const A = D1A, f13 = { f: D1F.ui, w: 500, s: 13 };
  d1_status(g, '14:24');
  d1_ui(g, 'Kasam', 20, 94, 28, A.ink, 700);
  d1_ui(g, 'Altın, döviz ve kişisel varlıklarını', 20, 118, 13, A.soft, 500);
  const w1 = measure(g, 'tek ekranda ', f13), w2 = measure(g, 'güvenle', { ...f13, w: 700 });
  d1_ui(g, 'tek ekranda ', 20, 136, 13, A.soft, 500);
  d1_ui(g, 'güvenle', 20 + w1, 136, 13, D1.o, 700);
  d1_ui(g, ' takip et.', 20 + w1 + w2, 136, 13, A.soft, 500);
  d1_uiCard(g, 20, 154, 350, 172, 22, A.cream);
  d1_ui(g, 'Toplam varlık', 38, 186, 12, A.soft, 600);
  d1_ui(g, '₺1.250.430', 38, 230, 36, A.ink, 700);
  const gb = g.createLinearGradient(38, 0, 198, 0); gb.addColorStop(0, '#D9A520'); gb.addColorStop(1, '#F2C14E');
  rr(g, 38, 260, 160, 44, 22); g.fillStyle = gb; g.fill();
  d1_ui(g, 'Kasamı Gör', 118, 287, 14, A.ink, 700, 'center');
  // mini vault
  g.save(); g.strokeStyle = '#D9A520'; g.lineWidth = 3; g.beginPath(); g.arc(318, 270, 30, 0, TAU); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(318, 270, 11, 0, TAU);
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.3; g.moveTo(318 + Math.cos(a) * 11, 270 + Math.sin(a) * 11); g.lineTo(318 + Math.cos(a) * 24, 270 + Math.sin(a) * 24); }
  g.stroke(); g.restore();
  d1_uiCard(g, 20, 342, 350, 180, 18);
  [['Altın', '₺742.180', '#D9A520', 'Au'], ['Döviz', '₺318.250', '#6E5BFF', '$'], ['Kişisel varlıklar', '₺190.000', '#7A7F8C', 'K']].forEach(([l, v, col, ch], i) => {
    const cy = 372 + i * 60;
    if (i) { g.fillStyle = A.line; g.fillRect(72, cy - 30, 284, 1); }
    g.fillStyle = hexA(col, 0.16); g.beginPath(); g.arc(46, cy, 15, 0, TAU); g.fill();
    d1_ui(g, ch, 46, cy + 4, 11, col, 700, 'center');
    d1_ui(g, l, 72, cy + 5, 14, A.ink, 600);
    d1_ui(g, v, 356, cy + 5, 14, A.ink, 700, 'right');
  });
  d1_uiCard(g, 20, 538, 350, 76, 18);
  d1_coin(g, 46, 576, 15, 'AU');
  d1_ui(g, 'Gram Altın', 72, 572, 14, A.ink, 700);
  d1_ui(g, 'Kapalıçarşı · canlı', 72, 590, 10.5, A.soft, 500);
  d1_ui(g, '₺6.510,83', 356, 572, 14, A.ink, 700, 'right');
  d1_uiPill(g, '+0,40%', 356, 590, 9.5, 'right');
  d1_uiCard(g, 20, 626, 350, 76, 18);
  d1_coin(g, 46, 664, 15, 'AU');
  d1_ui(g, 'Ons Altın', 72, 660, 14, A.ink, 700);
  d1_ui(g, 'Kapalıçarşı · canlı', 72, 678, 10.5, A.soft, 500);
  d1_ui(g, '$4.033,60', 356, 660, 14, A.ink, 700, 'right');
  d1_uiPill(g, '+0,40%', 356, 678, 9.5, 'right');
  d1_nav(g, [['Akış', 'feed'], ['Haberler', 'news'], null, ['Alarmlarım', 'bell'], ['Hesabım', 'user']]);
}

/* ── scenes ── */
const D1_SG = (s, o = {}) => ({ f: D1F.sg, w: 700, s, ls: -2, ...o });
const D1_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık ekranlar',
    desc: 'Kripto bir uygulamada, hisse başka sitede, altın başka sekmede: pencereler üst üste açılır, uyarılar yanıp söner; "PİYASA HİÇ DURMUYOR." glitch ile çakılır.',
    draw(g) {
      d1_bg(g, D1.o, 0.05);
      const wins = [
        { x: 180, y: 60, w: 530, h: 300, t: 'kripto_uygulamasi', col: D1.o, rows: [['BTC/USDT', '$80.220,05', '−1,49%'], ['ETH/USDT', '$2.325,10', '−1,67%'], ['XRP/USDT', '$1,2913', '−2,64%']], warn: '[!] oturum süresi doldu' },
        { x: 760, y: 40, w: 440, h: 262, t: 'notlar.txt', col: D1.dim, notes: ['- btc alarmı kur!!', '- çeyrek altın kaç oldu?', '- bist kapanışına bak', '- nasdaq açıldı mı?'] },
        { x: 1260, y: 70, w: 600, h: 290, t: 'borsa_sitesi.html', col: D1.c, rows: [['BIST 100', '11.165,44', '+0,13%'], ['Nasdaq 100', '29.813,16', '+0,55%'], ['NVDA', '$215,38', '−1,17%']], warn: '[!] veriler gecikmeli' },
        { x: 60, y: 772, w: 640, h: 268, t: 'altin_fiyatlari.html', col: D1.o, rows: [['Gram Altın', '₺6.510,83', '+0,40%'], ['Çeyrek Altın', '₺10.476', '+0,60%']], warn: '[!] sayfa yanıt vermiyor' },
        { x: 760, y: 800, w: 440, h: 240, t: 'sekme 17 / 17', col: D1.dim, load: true },
        { x: 1250, y: 772, w: 610, h: 268, t: 'kripto_borsasi_2', col: D1.c, rows: [['SOL/USDT', '$100,56', '−2,17%'], ['DOGE/USDT', '$0,07862', '−1,87%']], warn: '[!] bağlantı koptu · yeniden dene' },
      ];
      wins.forEach(wd => {
        d1_win(g, wd.x, wd.y, wd.w, wd.h, wd.t, wd.col, { a: 0.5 });
        if (wd.rows) wd.rows.forEach(([n, p, c], k) => {
          const yy = wd.y + 90 + k * 50;
          d1_mono(g, n, wd.x + 24, yy, 21, D1.ink, { w: 700 });
          d1_mono(g, p, wd.x + wd.w - 160, yy, 21, hexA(D1.ink, 0.75), { a: 'right' });
          d1_chg(g, c, wd.x + wd.w - 24, yy - 7, 17);
        });
        if (wd.warn) {
          g.fillStyle = hexA(D1.o, 0.12); g.fillRect(wd.x + 2, wd.y + wd.h - 52, wd.w - 4, 40);
          d1_mono(g, wd.warn, wd.x + 24, wd.y + wd.h - 25, 19, D1.o, { w: 700 });
        }
        if (wd.notes) wd.notes.forEach((s, k) => d1_mono(g, s, wd.x + 24, wd.y + 86 + k * 44, 21, hexA(D1.ink, 0.7)));
        if (wd.load) {
          d1_mono(g, 'yeniden bağlanıyor…', wd.x + 24, wd.y + 92, 21, hexA(D1.ink, 0.7));
          for (let b = 0; b < 16; b++) { g.fillStyle = b < 6 ? D1.o : hexA(D1.o, 0.14); g.fillRect(wd.x + 24 + b * 24, wd.y + 116, 19, 22); }
          d1_mono(g, '37%', wd.x + wd.w - 24, wd.y + 134, 19, D1.o, { w: 700, a: 'right' });
          d1_mono(g, 'tekrar denensin mi? [E/h]', wd.x + 24, wd.y + 190, 19, D1.dim);
        }
      });
      // headline band
      g.fillStyle = 'rgba(4,6,10,0.88)'; g.fillRect(0, 386, W, 368);
      g.fillStyle = hexA(D1.o, 0.5); g.fillRect(0, 386, W, 2); g.fillRect(0, 752, W, 2);
      d1_mono(g, '[03:14:07]', 60, 432, 22, D1.o, { w: 700 });
      d1_mono(g, '17 sekme açık', W - 60, 432, 22, D1.dim, { w: 700, a: 'right' });
      d1_glitch(g, 'PİYASA', CX, 532, D1_SG(140, { ls: -3 }), D1.ink, 9, 3);
      d1_glitch(g, 'HİÇ DURMUYOR.', CX, 668, D1_SG(140, { ls: -3 }), D1.o, 9, 5);
      const m = '> kripto bir uygulamada · hisse başka sitede · altın başka sekmede';
      const mw = d1_mono(g, m, CX - 12, 728, 26, hexA(D1.ink, 0.6), { a: 'center' });
      d1_cursor(g, CX - 12 + mw / 2 + 8, 728, 26, D1.o);
      d1_scan(g);
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek uygulama',
    desc: 'Komut yazılır; kripto, borsa ve emtia hatları merkeze akar. Köşeli çerçevede resmî logo turuncu parıltıyla belirir, "tek uygulamada." neonla yanar.',
    draw(g) {
      d1_bg(g, D1.o, 0.09);
      d1_tape(g, 0, 140);
      const pw = d1_mono(g, 'sen@kripto724:~$ ', 100, 140, 30, D1.c, { w: 700 });
      const cw = d1_mono(g, 'birleştir --kripto --borsa --emtia', 100 + pw, 140, 30, D1.ink);
      d1_cursor(g, 100 + pw + cw + 8, 140, 30, D1.o);
      d1_mono(g, '[OK] 3 piyasa · 1 uygulama', 100, 184, 22, D1.dim, { w: 700 });
      const bx0 = CX - 300, bx1 = CX + 300, by0 = 212, by1 = 728, cy = 470;
      const tags = [['KRİPTO', D1.o], ['BORSA', D1.c], ['EMTİA', D1.o]];
      const reads = [['BTC', '$80.220,05', '−1,49%'], ['BIST 100', '11.165,44', '+0,13%'], ['Gram Altın', '₺6.510,83', '+0,40%']];
      [370, 470, 570].forEach((y, i) => {
        const [t, col] = tags[i], ty = cy + (y - cy) * 0.35;
        g.save(); g.shadowColor = col; g.shadowBlur = 14; g.strokeStyle = hexA(col, 0.85); g.lineWidth = 3;
        g.beginPath(); g.moveTo(430, y); g.lineTo(510, y); g.lineTo(590, ty); g.lineTo(bx0 - 14, ty); g.stroke();
        g.beginPath(); g.moveTo(bx1 + 14, ty); g.lineTo(1330, ty); g.lineTo(1410, y); g.lineTo(1490, y); g.stroke();
        g.restore();
        d1_packet(g, lerp(590, bx0 - 14, 0.35 + i * 0.22), ty, col);
        d1_packet(g, lerp(bx1 + 14, 1330, 0.7 - i * 0.2), ty, col);
        g.fillStyle = D1.win; g.fillRect(110, y - 34, 320, 68);
        g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(110, y - 34, 320, 68);
        d1_mono(g, `[ ${t} ]`, 270, y + 10, 28, col, { w: 800, a: 'center' });
        const [n, p, c] = reads[i];
        g.fillStyle = D1.win; g.fillRect(1490, y - 42, 360, 84);
        g.strokeStyle = hexA(col, 0.7); g.strokeRect(1490, y - 42, 360, 84);
        d1_mono(g, n, 1510, y - 10, 18, D1.dim, { w: 700 });
        d1_mono(g, p, 1510, y + 26, 26, D1.ink, { w: 700 });
        d1_chg(g, c, 1834, y + 17, 17);
      });
      addGlow(g, D1.o, CX, cy, 430, 0.22);
      g.fillStyle = 'rgba(4,6,10,0.55)'; g.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
      g.setLineDash([8, 10]); g.strokeStyle = hexA(D1.o, 0.35); g.lineWidth = 2; g.strokeRect(bx0, by0, bx1 - bx0, by1 - by0); g.setLineDash([]);
      d1_corners(g, bx0, by0, bx1 - bx0, by1 - by0, 56, D1.o);
      logo(g, CX, cy, 330, { ink: '#FFFFFF' });
      text(g, 'Kripto, borsa ve emtia', CX, 836, D1_SG(80, { c: D1.ink }));
      d1_neon(g, 'tek uygulamada.', CX, 962, D1_SG(116, { ls: -3 }), D1.o, 34);
      d1_scan(g);
    },
  },
  {
    time: '8–12 sn', title: 'Kripto: Canlı fiyatlar',
    desc: 'Kripto sekmesi açılır, tablo satır satır basılır: BTC’den ADA’ya fiyat, günlük ve haftalık değişim. CANLI noktası yanıp söner, BTC mumları akar.',
    draw(g) {
      d1_bg(g, D1.o, 0.06);
      d1_tape(g, 0, 620);
      const hw = measure(g, 'Canlı fiyatlar, ', D1_SG(82));
      text(g, 'Canlı fiyatlar, ', 60, 174, D1_SG(82, { a: 'left', c: D1.ink }));
      d1_neon(g, '7/24.', 60 + hw, 174, D1_SG(82, { a: 'left' }), D1.o, 26);
      d1_mono(g, '$ izle --kripto --canlı', 1830, 168, 24, D1.dim, { a: 'right' });
      d1_cursor(g, 1838, 168, 24, D1.o);
      // table window (the app's home card)
      const T = { x: 60, y: 212, w: 1130, h: 828 };
      d1_win(g, T.x, T.y, T.w, T.h, 'piyasalar --kripto --canlı', D1.o, { glow: 16 });
      g.strokeStyle = hexA(D1.o, 0.5); g.lineWidth = 2; g.strokeRect(100, 270, 480, 54);
      ['Kripto', 'Borsa', 'Emtia'].forEach((t, i) => {
        if (!i) { g.save(); g.shadowColor = D1.o; g.shadowBlur = 16; g.fillStyle = D1.o; g.fillRect(105, 275, 150, 44); g.restore(); }
        d1_mono(g, t, 180 + i * 160, 306, 24, i ? D1.dim : D1.bg, { w: 800, a: 'center' });
      });
      // CANLI badge
      g.fillStyle = hexA(D1.up, 0.12); g.fillRect(990, 276, 160, 42); g.strokeStyle = hexA(D1.up, 0.5); g.lineWidth = 1.5; g.strokeRect(990, 276, 160, 42);
      addGlow(g, D1.up, 1018, 297, 26, 0.7); g.fillStyle = D1.up; g.beginPath(); g.arc(1018, 297, 7, 0, TAU); g.fill();
      d1_mono(g, 'CANLI', 1038, 305, 22, D1.up, { w: 800, ls: 1 });
      [['VARLIK', 100, 'left'], ['FİYAT', 700, 'right'], ['GÜNLÜK', 910, 'right'], ['HAFTALIK', 1150, 'right']].forEach(([l, x, a]) => d1_mono(g, l, x, 374, 18, D1.dim, { w: 700, ls: 2, a }));
      g.fillStyle = hexA(D1.o, 0.3); g.fillRect(100, 391, 1050, 2);
      D1_CRYPTO.forEach(([sym, nm, pair, p, d, wk], i) => {
        const cy = 440 + i * 78;
        if (!i) { g.fillStyle = hexA(D1.o, 0.09); g.fillRect(T.x + 2, cy - 37, T.w - 4, 74); g.fillStyle = D1.o; g.fillRect(T.x + 2, cy - 37, 6, 74); }
        else { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(100, cy - 39, 1050, 1); }
        d1_coin(g, 130, cy, 24, sym);
        text(g, nm, 172, cy - 3, D1_SG(28, { a: 'left', ls: -0.5, c: D1.ink }));
        d1_mono(g, pair, 173, cy + 24, 16, D1.dim);
        d1_mono(g, p, 700, cy + 10, 29, i ? D1.ink : D1.o, { w: 700, a: 'right' });
        d1_chg(g, d, 910, cy, 20);
        d1_chg(g, wk, 1150, cy, 20);
      });
      g.fillStyle = hexA(D1.o, 0.3); g.fillRect(100, 966, 1050, 2);
      const uw = d1_mono(g, 'Güncellendi 14:24', 100, 1008, 20, D1.dim, { w: 700 });
      d1_cursor(g, 108 + uw, 1008, 20, D1.o);
      d1_mono(g, 'Kripto · Borsa · Emtia', 1150, 1008, 20, D1.dim, { a: 'right' });
      // BTC chart window
      const C = { x: 1230, y: 212, w: 630, h: 828 };
      d1_win(g, C.x, C.y, C.w, C.h, 'grafik --btc', D1.o);
      d1_coin(g, 1286, 300, 26, 'BTC');
      text(g, 'Bitcoin', 1326, 311, D1_SG(32, { a: 'left', ls: -0.5, c: D1.ink }));
      d1_mono(g, 'BTC/USDT', 1830, 309, 18, D1.dim, { w: 700, a: 'right' });
      d1_neon(g, '$80.220,05', 1266, 420, D1_SG(86, { a: 'left' }), D1.o, 26);
      d1_mono(g, 'GÜNLÜK', 1270, 486, 17, D1.dim, { w: 700, ls: 1 });
      d1_chg(g, '−1,49%', 1360, 480, 19, 'left');
      d1_mono(g, 'HAFTALIK', 1560, 486, 17, D1.dim, { w: 700, ls: 1 });
      d1_chg(g, '−2,05%', 1830, 480, 19);
      const cs = d1_ohlc(31, 34, 0.74, 0.36, 0.055);
      const area = { x: 1266, y: 550, w: 440, h: 380 };
      const clo = Math.min(...cs.map(c => c[3])) - 0.02, chi = Math.max(...cs.map(c => c[2])) + 0.02;
      g.strokeStyle = hexA(D1.o, 0.08); g.lineWidth = 1;
      for (let k = 0; k <= 4; k++) { const y = area.y + k * area.h / 4; g.beginPath(); g.moveTo(area.x, y); g.lineTo(1830, y); g.stroke(); }
      const M = d1_candles(g, cs, area.x, area.y, area.w, area.h, clo, chi);
      const ly = M.Y(cs[cs.length - 1][1]);
      g.setLineDash([7, 7]); g.strokeStyle = hexA(D1.o, 0.85); g.lineWidth = 2; g.beginPath(); g.moveTo(area.x, ly); g.lineTo(1716, ly); g.stroke(); g.setLineDash([]);
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 16; g.fillStyle = D1.o; g.fillRect(1716, ly - 20, 116, 40); g.restore();
      d1_mono(g, '80.220,05', 1774, ly + 7, 18, D1.bg, { w: 800, a: 'center' });
      addGlow(g, D1.up, 1286, 1000, 22, 0.6); g.fillStyle = D1.up; g.beginPath(); g.arc(1286, 1000, 6, 0, TAU); g.fill();
      d1_mono(g, 'canlı akış · 7/24', 1304, 1007, 19, D1.dim, { w: 700 });
      d1_scan(g);
    },
  },
  {
    time: '12–16 sn', title: 'Borsa: BIST ve Nasdaq',
    desc: 'Endeks değerleri sayaçla dolar, sparkline’lar çizilir; 210 hücre BIST 108 · Nasdaq 102 diye renklenir. Telefonda Borsa ekranı kayar, Popüler seçilir.',
    draw(g) {
      d1_bg(g, D1.c, 0.05);
      d1_tape(g, 0, 1180);
      text(g, 'BIST’ten Nasdaq’a,', 60, 174, D1_SG(82, { a: 'left', c: D1.ink }));
      d1_neon(g, '210 hisse.', 60, 296, D1_SG(116, { a: 'left', ls: -3 }), D1.o, 30);
      d1_win(g, 60, 330, 1140, 360, 'borsa --endeks', D1.c);
      [['BIST 100', '11.165,44', '+0,13%', 7], ['Nasdaq 100', '29.813,16', '+0,55%', 21]].forEach(([n, v, c, sd], j) => {
        const bx = 100 + j * 560;
        d1_mono(g, n, bx, 410, 22, D1.c, { w: 700, ls: 1 });
        text(g, v, bx, 492, D1_SG(72, { a: 'left', c: D1.ink }));
        d1_chg(g, c, bx + 480, 404, 20);
        d1_spark(g, bx, 540, 480, 120, sd, true, D1.up, { n: 48, fill: 0.22, glow: 0.8, lw: 3.5 });
      });
      g.fillStyle = hexA(D1.c, 0.22); g.fillRect(630, 380, 2, 280);
      d1_win(g, 60, 715, 1140, 325, 'hisse --liste --popüler', D1.o);
      [['210', 'Tümü', D1.o], ['108', 'BIST', D1.ink], ['102', 'Nasdaq', D1.ink]].forEach(([n, l, col], i) => {
        const x = 100 + i * 230;
        if (!i) d1_neon(g, n, x, 822, D1_SG(70, { a: 'left' }), col, 20); else text(g, n, x, 822, D1_SG(70, { a: 'left', c: col }));
        d1_mono(g, l, x + 2, 856, 19, i === 2 ? D1.c : i === 1 ? D1.o : D1.dim, { w: 700 });
      });
      // 210 cells: 108 BIST (orange) + 102 Nasdaq (cyan)
      for (let k = 0; k < 210; k++) {
        const col = Math.floor(k / 7), row = k % 7;
        g.fillStyle = k < 108 ? D1.o : D1.c;
        g.globalAlpha = 0.9; g.fillRect(820 + col * 11, 766 + row * 11, 9, 9);
      }
      g.globalAlpha = 1;
      let fx = 100;
      [['Favoriler', 'star'], ['Popüler', 'on'], ['Yükselenler'], ['Düşenler']].forEach(([l, k]) => {
        const tw = d1_mw(g, l, 22, 700), ex = k === 'star' ? 30 : 0, w = tw + ex + 40;
        if (k === 'on') { g.save(); g.shadowColor = D1.o; g.shadowBlur = 14; g.fillStyle = D1.o; g.fillRect(fx, 896, w, 50); g.restore(); }
        else { g.strokeStyle = hexA(D1.o, 0.55); g.lineWidth = 2; g.strokeRect(fx, 896, w, 50); }
        if (ex) d1_star(g, fx + 30, 920, 11, D1.o);
        d1_mono(g, l, fx + 20 + ex, 929, 22, k === 'on' ? D1.bg : D1.ink, { w: 700 });
        fx += w + 14;
      });
      g.strokeStyle = hexA(D1.ink, 0.2); g.lineWidth = 1.5; g.strokeRect(100, 966, 1060, 50);
      g.strokeStyle = D1.dim; g.lineWidth = 2.5; g.beginPath(); g.arc(128, 989, 9, 0, TAU); g.moveTo(135, 996); g.lineTo(142, 1003); g.stroke();
      const sw = d1_mono(g, 'Hisse adı ya da kodu ara…', 160, 999, 22, D1.dim);
      d1_cursor(g, 168 + sw, 999, 22, D1.o);
      d1_scan(g);
      d1_phone(g, 1316, 92, 440, d1_scrBorsa);
    },
  },
  {
    time: '16–20 sn', title: 'Emtia: Kapalıçarşı altını',
    desc: 'Altın tablosu daktiloyla yazılır: gram, çeyrek, yarım, tam, ata… alış ve satış; TL / USD anahtarı tıklanır, gümüş ve petrol etiketleri sırayla yanar.',
    draw(g) {
      d1_bg(g, D1.o, 0.07);
      d1_tape(g, 0, 380);
      const hw = measure(g, 'Kapalıçarşı, ', D1_SG(82));
      text(g, 'Kapalıçarşı, ', 60, 174, D1_SG(82, { a: 'left', c: D1.ink }));
      d1_neon(g, 'canlı.', 60 + hw, 174, D1_SG(82, { a: 'left' }), D1.o, 26);
      // ₺ TL | $ USD
      g.strokeStyle = hexA(D1.o, 0.6); g.lineWidth = 2; g.strokeRect(1540, 120, 320, 60);
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 14; g.fillStyle = D1.o; g.fillRect(1545, 125, 152, 50); g.restore();
      d1_mono(g, '₺ TL', 1621, 159, 26, D1.bg, { w: 800, a: 'center' });
      d1_mono(g, '$ USD', 1779, 159, 26, D1.dim, { w: 700, a: 'center' });
      // gold table
      d1_win(g, 60, 212, 1140, 828, 'altın --kapalıçarşı --canlı', D1.o, { glow: 14 });
      d1_mono(g, 'ALTIN FİYATLARI', 100, 286, 22, D1.o, { w: 800, ls: 3 });
      g.strokeStyle = hexA(D1.o, 0.5); g.lineWidth = 2; g.strokeRect(800, 256, 360, 48);
      g.fillStyle = D1.o; g.fillRect(984, 260, 172, 40);
      d1_mono(g, 'Yeni basım', 892, 287, 19, D1.dim, { w: 700, a: 'center' });
      d1_mono(g, 'Eski basım', 1070, 287, 19, D1.bg, { w: 800, a: 'center' });
      [['ÜRÜN', 100, 'left'], ['ALIŞ', 720, 'right'], ['SATIŞ', 920, 'right'], ['DEĞİŞİM', 1160, 'right']].forEach(([l, x, a]) => d1_mono(g, l, x, 354, 18, D1.dim, { w: 700, ls: 2, a }));
      g.fillStyle = hexA(D1.o, 0.3); g.fillRect(100, 369, 1060, 2);
      D1_GOLD.forEach(([n, sub, al, sa, ch], i) => {
        const cy = 412 + i * 69;
        if (i === 3) { g.fillStyle = hexA(D1.o, 0.1); g.fillRect(62, cy - 34, 1136, 68); g.fillStyle = D1.o; g.fillRect(62, cy - 34, 6, 68); }
        else if (i) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(100, cy - 35, 1060, 1); }
        text(g, n, 100, sub ? cy - 2 : cy + 9, D1_SG(26, { a: 'left', ls: -0.3, c: D1.ink }));
        if (sub) d1_mono(g, sub, 101, cy + 23, 15, D1.dim);
        d1_mono(g, al, 720, cy + 8, 24, hexA(D1.ink, 0.72), { a: 'right' });
        d1_mono(g, sa, 920, cy + 8, 24, i === 3 ? D1.o : D1.ink, { w: 700, a: 'right' });
        if (ch) d1_chg(g, ch, 1160, cy, 19); else d1_mono(g, '—', 1150, cy + 8, 22, hexA(D1.dim, 0.6), { a: 'right' });
      });
      // gram & ons
      d1_win(g, 1240, 212, 620, 288, 'gram-altın', D1.o);
      d1_coin(g, 1292, 290, 28, 'AU');
      text(g, 'Gram Altın', 1334, 301, D1_SG(30, { a: 'left', ls: -0.5, c: D1.ink }));
      d1_mono(g, 'Kapalıçarşı · canlı', 1830, 299, 17, D1.dim, { a: 'right' });
      d1_neon(g, '₺6.510,83', 1272, 404, D1_SG(84, { a: 'left' }), D1.o, 26);
      d1_chg(g, '+0,40%', 1276, 456, 19, 'left');
      d1_mono(g, 'Alış 6.422 · Satış 6.511', 1830, 463, 18, D1.dim, { a: 'right' });
      d1_win(g, 1240, 525, 620, 200, 'ons-altın', D1.o);
      text(g, 'Ons Altın', 1280, 603, D1_SG(30, { a: 'left', ls: -0.5, c: D1.ink }));
      text(g, '$4.033,60', 1278, 688, D1_SG(64, { a: 'left', c: D1.ink }));
      d1_chg(g, '+0,40%', 1830, 668, 19);
      d1_win(g, 1240, 750, 620, 290, 'emtia --hepsi', D1.c);
      ['ALTIN', 'GÜMÜŞ', 'PETROL', 'VE FAZLASI'].forEach((s, i) => {
        const x = 1280 + (i % 2) * 280, y = 806 + Math.floor(i / 2) * 76, on = !i;
        if (on) { g.save(); g.shadowColor = D1.o; g.shadowBlur = 14; g.fillStyle = D1.o; g.fillRect(x, y, 260, 56); g.restore(); }
        else { g.strokeStyle = hexA(D1.c, 0.6); g.lineWidth = 2; g.strokeRect(x, y, 260, 56); g.fillStyle = hexA(D1.c, 0.08); g.fillRect(x, y, 260, 56); }
        d1_mono(g, `[ ${s} ]`, x + 130, y + 37, 22, on ? D1.bg : D1.c, { w: 800, a: 'center' });
      });
      const ew = d1_mono(g, '> gümüş, petrol ve fazlası', 1280, 1004, 22, D1.ink);
      d1_cursor(g, 1288 + ew, 1004, 22, D1.o);
      d1_scan(g);
    },
  },
  {
    time: '20–24 sn', title: 'Kasam',
    desc: 'Neon kasa kapısının kolu döner; altın, döviz ve kişisel varlık satırları bloklarla dolar, toplam sayaçla yükselir, telefonda Kasam ekranı belirir.',
    draw(g) {
      d1_bg(g, D1.o, 0.08);
      d1_tape(g, 0, 860);
      d1_glitch(g, 'Kasam.', 96, 250, D1_SG(158, { a: 'left', ls: -4 }), D1.o, 8, 11);
      const so = { f: D1F.sg, w: 500, s: 38, a: 'left' };
      text(g, 'Altın, döviz ve kişisel varlıklarını', 102, 332, { ...so, c: D1.ink });
      const s1 = measure(g, 'tek ekranda ', so), s2 = measure(g, 'güvenle', { ...so, w: 700 });
      text(g, 'tek ekranda ', 102, 384, { ...so, c: D1.ink });
      d1_neon(g, 'güvenle', 102 + s1, 384, { ...so, w: 700 }, D1.o, 16);
      text(g, ' takip et.', 102 + s1 + s2, 384, { ...so, c: D1.ink });
      // kasa window
      d1_win(g, 100, 450, 780, 570, 'kasa --özet', D1.o, { glow: 14 });
      const rows = [['ALTIN', '₺742.180', 14, D1.o], ['DÖVİZ', '₺318.250', 6, D1.c], ['KİŞİSEL VARLIKLAR', '₺190.000', 4, D1.ink]];
      rows.forEach(([l, v, n, col], i) => {
        const y = 540 + i * 100;
        d1_mono(g, l, 140, y, 24, D1.ink, { w: 700 });
        text(g, v, 840, y + 2, D1_SG(36, { a: 'right', ls: -0.5, c: D1.ink }));
        for (let b = 0; b < 24; b++) { g.fillStyle = b < n ? col : hexA(col, 0.12); g.fillRect(140 + b * 29, y + 20, 24, 22); }
      });
      g.setLineDash([8, 8]); g.strokeStyle = hexA(D1.o, 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(140, 834); g.lineTo(840, 834); g.stroke(); g.setLineDash([]);
      d1_mono(g, 'TOPLAM', 140, 900, 24, D1.dim, { w: 700, ls: 2 });
      d1_neon(g, '₺1.250.430', 840, 912, D1_SG(80, { a: 'right' }), D1.o, 26);
      const kw = d1_mono(g, '> kasamı gör', 140, 984, 22, D1.o, { w: 700 });
      d1_cursor(g, 148 + kw, 984, 22, D1.o);
      // neon vault door
      const vx = 1212, vy = 620, R = 290;
      addGlow(g, D1.o, vx, vy, R * 1.5, 0.2);
      g.save();
      g.fillStyle = 'rgba(10,8,6,0.92)'; g.beginPath(); g.arc(vx, vy, R, 0, TAU); g.fill();
      g.shadowColor = D1.o; g.shadowBlur = 24; g.strokeStyle = D1.o; g.lineWidth = 6; g.beginPath(); g.arc(vx, vy, R, 0, TAU); g.stroke();
      g.shadowBlur = 0; g.lineWidth = 2; g.strokeStyle = hexA(D1.o, 0.5); g.beginPath(); g.arc(vx, vy, R - 34, 0, TAU); g.stroke();
      for (let k = 0; k < 16; k++) { const a = k * TAU / 16; g.fillStyle = hexA(D1.o, 0.85); g.fillRect(vx + Math.cos(a) * (R - 17) - 5, vy + Math.sin(a) * (R - 17) - 5, 10, 10); }
      for (let k = 0; k < 72; k++) {
        const a = k * TAU / 72, r0 = R * 0.56, r1 = r0 + (k % 6 ? 10 : 22);
        g.strokeStyle = hexA(k % 6 ? D1.ink : D1.o, k % 6 ? 0.3 : 0.9); g.lineWidth = k % 6 ? 1.5 : 3;
        g.beginPath(); g.moveTo(vx + Math.cos(a) * r0, vy + Math.sin(a) * r0); g.lineTo(vx + Math.cos(a) * r1, vy + Math.sin(a) * r1); g.stroke();
      }
      // motion trace of the turning handle
      g.strokeStyle = hexA(D1.c, 0.35); g.lineWidth = 3;
      for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(vx, vy, R * 0.44 - k * 14, -1.9 + k * 0.2, -0.9); g.stroke(); }
      g.shadowColor = D1.o; g.shadowBlur = 18; g.strokeStyle = D1.o; g.lineWidth = 12; g.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const a = -0.5 + k * TAU / 3;
        g.beginPath(); g.moveTo(vx + Math.cos(a) * 46, vy + Math.sin(a) * 46); g.lineTo(vx + Math.cos(a) * R * 0.44, vy + Math.sin(a) * R * 0.44); g.stroke();
        g.fillStyle = D1.o; g.beginPath(); g.arc(vx + Math.cos(a) * R * 0.44, vy + Math.sin(a) * R * 0.44, 15, 0, TAU); g.fill();
      }
      g.lineWidth = 6; g.beginPath(); g.arc(vx, vy, 46, 0, TAU); g.stroke();
      g.shadowBlur = 0; g.fillStyle = D1.o; g.beginPath(); g.arc(vx, vy - 6, 10, 0, TAU); g.fill(); g.fillRect(vx - 5, vy - 2, 10, 20);
      g.restore();
      d1_scan(g);
      d1_phone(g, 1508, 236, 352, d1_scrKasam);
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz',
    desc: 'BTC mumları alarm çizgisini keser, halka patlar ve bildirim düşer; günlüğe [ALARM] satırı yazılır, analiz etiketleri ve haber akışı ritimle yanar.',
    draw(g) {
      d1_bg(g, D1.c, 0.05);
      d1_tape(g, 0, 1500);
      const hw = measure(g, 'Alarm kur, ', D1_SG(82));
      text(g, 'Alarm kur, ', 60, 174, D1_SG(82, { a: 'left', c: D1.ink }));
      d1_neon(g, 'haberin olsun.', 60 + hw, 174, D1_SG(82, { a: 'left' }), D1.o, 26);
      // technical analysis window
      d1_win(g, 60, 212, 1110, 598, 'teknik-analiz --btc/usdt', D1.o);
      const area = { x: 100, y: 282, w: 800, h: 490 }, lo = 0.14, hi = 0.93;
      const cs = d1_ohlc(77, 34, 0.8, 0.3, 0.05);
      g.strokeStyle = hexA(D1.o, 0.07); g.lineWidth = 1;
      for (let k = 0; k <= 5; k++) { const y = area.y + k * area.h / 5; g.beginPath(); g.moveTo(area.x, y); g.lineTo(1130, y); g.stroke(); }
      const M = d1_candles(g, cs, area.x, area.y, area.w, area.h, lo, hi);
      const ma = cs.map((c, i) => { const a = cs.slice(Math.max(0, i - 5), i + 1); return [M.X(i), M.Y(a.reduce((s, q) => s + q[1], 0) / a.length)]; });
      d1_line(g, ma, D1.o, 3, 0.6);
      // direnç
      const yr = M.Y(0.86);
      g.setLineDash([4, 8]); g.strokeStyle = hexA(D1.ink, 0.35); g.lineWidth = 1.5; g.beginPath(); g.moveTo(area.x, yr); g.lineTo(1130, yr); g.stroke(); g.setLineDash([]);
      d1_mono(g, 'direnç', 1130, yr - 10, 16, D1.dim, { a: 'right' });
      // forecast cone
      const lx = M.X(cs.length - 1), lc = cs[cs.length - 1][1], ex = 1120;
      const up = [], dn = [], mid = [];
      for (let k = 0; k <= 20; k++) { const t = k / 20, x = lerp(lx, ex, t); up.push([x, M.Y(lc + 0.02 * t + 0.2 * Math.sqrt(t))]); dn.push([x, M.Y(lc + 0.02 * t - 0.2 * Math.sqrt(t))]); mid.push([x, M.Y(lc + 0.02 * t)]); }
      g.beginPath(); up.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); dn.slice().reverse().forEach(p => g.lineTo(p[0], p[1])); g.closePath();
      g.fillStyle = hexA(D1.c, 0.12); g.fill(); g.strokeStyle = hexA(D1.c, 0.45); g.lineWidth = 1.5; g.stroke();
      g.setLineDash([3, 7]); g.strokeStyle = D1.c; g.lineWidth = 2.5; g.beginPath(); mid.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.setLineDash([]);
      d1_mono(g, 'FİYAT TAHMİNİ', 1124, up[20][1] - 14, 16, D1.c, { w: 700, a: 'right' });
      // alarm line + crossing
      const L = 0.42, ya = M.Y(L);
      let ci = cs.findIndex((c, i) => i > 4 && c[1] < L && cs[i - 1][1] >= L); if (ci < 0) ci = cs.length - 6;
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 12; g.setLineDash([12, 8]); g.strokeStyle = D1.o; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(area.x, ya); g.lineTo(1130, ya); g.stroke(); g.restore();
      g.fillStyle = D1.o; g.fillRect(104, ya - 44, 196, 34);
      d1_mono(g, 'ALARM 80.000$', 202, ya - 20, 18, D1.bg, { w: 800, a: 'center' });
      const px = M.X(ci);
      [16, 34, 56].forEach((r, k) => { g.strokeStyle = hexA(D1.c, 0.9 - k * 0.28); g.lineWidth = 3 - k * 0.6; g.beginPath(); g.arc(px, ya, r, 0, TAU); g.stroke(); });
      addGlow(g, D1.c, px, ya, 70, 0.5);
      // analysis tools
      d1_win(g, 60, 835, 1110, 205, 'analiz --araçlar', D1.c);
      let fx = 100;
      ['Hisse Analizi', 'Teknik Analiz', 'Fiyat Tahmini', 'Sinyal Alarmları'].forEach((s, i) => {
        const tw = d1_mw(g, s, 22, 700), w = tw + 40, on = i === 1;
        if (on) { g.save(); g.shadowColor = D1.o; g.shadowBlur = 14; g.fillStyle = D1.o; g.fillRect(fx, 892, w, 54); g.restore(); }
        else { g.strokeStyle = hexA(D1.c, 0.6); g.lineWidth = 2; g.strokeRect(fx, 892, w, 54); }
        d1_mono(g, s, fx + 20, 927, 22, on ? D1.bg : D1.ink, { w: 700 });
        fx += w + 16;
      });
      const vw = d1_mono(g, '> ve daha fazlası…', 100, 1004, 22, D1.dim);
      d1_cursor(g, 108 + vw, 1004, 22, D1.o);
      // push notification (app UI)
      g.save(); g.shadowColor = hexA(D1.o, 0.55); g.shadowBlur = 40;
      rr(g, 1210, 212, 650, 166, 30); g.fillStyle = 'rgba(244,245,249,0.97)'; g.fill(); g.restore();
      d1_appIcon(g, 1290, 295, 92);
      d1_ui(g, 'kripto724', 1360, 254, 19, D1A.soft, 600);
      d1_ui(g, 'şimdi', 1830, 254, 18, D1A.soft, 500, 'right');
      d1_ui(g, 'Fiyat alarmı', 1360, 298, 25, D1A.ink, 700);
      d1_ui(g, 'BTC 80.000$ altına indi.', 1360, 337, 23, D1A.ink, 500);
      // alarm log
      d1_win(g, 1210, 404, 650, 382, 'alarm.log', D1.o);
      const L7 = [
        ['[14:20:03] ', 'alarm kuruldu · BTC < 80.000$', D1.ink, 400],
        ['[14:20:05] ', 'sinyal alarmı · NVDA · aktif', D1.ink, 400],
        ['[14:24:00] ', 'BTC $80.220,05', D1.ink, 400],
        ['[14:31:12] ', '[ALARM] BTC 80.000$ altına indi', D1.o, 800],
        ['[14:31:12] ', 'bildirim gönderildi', D1.c, 400],
      ];
      L7.forEach(([t, s, col, w], i) => {
        const y = 480 + i * 52;
        if (i === 3) { g.fillStyle = hexA(D1.o, 0.12); g.fillRect(1212, y - 32, 646, 48); }
        const tw = d1_mono(g, t, 1234, y, 19, D1.dim);
        const sw = d1_mono(g, s, 1234 + tw, y, 19, col, { w });
        if (i === 2) d1_chg(g, '−1,49%', 1234 + tw + sw + 14, y - 7, 16, 'left');
      });
      d1_cursor(g, 1234, 740, 19, D1.o);
      // news
      d1_win(g, 1210, 810, 650, 230, 'haberler | akış', D1.c);
      d1_mono(g, 'Haberler', 1234, 882, 22, D1.ink, { w: 800 });
      g.fillStyle = D1.o; g.fillRect(1234, 892, d1_mw(g, 'Haberler', 22, 800), 4);
      d1_mono(g, 'Akış', 1384, 882, 22, D1.dim, { w: 700 });
      [['14:30', 'Piyasalarda günün özeti'], ['14:12', 'Altında haftalık görünüm'], ['13:55', 'Kripto piyasasında son durum']].forEach(([t, s], i) => {
        const y = 940 + i * 36;
        d1_mono(g, t, 1234, y, 19, D1.c, { w: 700 });
        d1_mono(g, s, 1316, y, 19, i ? hexA(D1.ink, 0.7) : D1.ink);
      });
      d1_scan(g);
    },
  },
  {
    time: '29–34 sn', title: 'Bağla ve avantajlar',
    desc: 'Binance, Bitget ve MEXC kutularından veri paketleri uygulama ikonuna akar, Bağla düğmesi parlar; %10 indirim kuponu kopar, eğitim videoları kayar.',
    draw(g) {
      d1_bg(g, D1.o, 0.07);
      d1_tape(g, 0, 300);
      const hw = measure(g, 'Kripto hesabını ', D1_SG(82));
      text(g, 'Kripto hesabını ', 60, 174, D1_SG(82, { a: 'left', c: D1.ink }));
      d1_neon(g, 'bağla.', 60 + hw, 174, D1_SG(82, { a: 'left' }), D1.o, 26);
      d1_mono(g, 'Binance, Bitget ve MEXC hesaplarını Kripto724’e kolayca bağla', 62, 230, 22, D1.dim);
      // network
      const hub = [870, 512];
      [['Binance', 'BAĞLI', D1.c], ['Bitget', 'BAĞLI', D1.c], ['MEXC', 'BAĞLANIYOR…', D1.o]].forEach(([n, st, col], i) => {
        const y = 352 + i * 160, ty = hub[1] + (y - hub[1]) * 0.22;
        g.save(); g.shadowColor = D1.o; g.shadowBlur = 12; g.strokeStyle = hexA(D1.o, 0.8); g.lineWidth = 3;
        g.beginPath(); g.moveTo(430, y); g.lineTo(560, y); g.lineTo(640, ty); g.lineTo(hub[0] - 112, ty); g.stroke(); g.restore();
        d1_packet(g, lerp(430, 560, 0.55), y);
        d1_packet(g, lerp(640, hub[0] - 112, 0.25 + i * 0.25), ty);
        g.fillStyle = D1.win; g.fillRect(100, y - 52, 330, 104);
        g.strokeStyle = hexA(D1.o, 0.7); g.lineWidth = 2; g.strokeRect(100, y - 52, 330, 104);
        text(g, n, 130, y + 2, D1_SG(40, { a: 'left', ls: -1, c: D1.ink }));
        d1_mono(g, `[${st}]`, 132, y + 34, 17, col, { w: 700 });
        g.fillStyle = D1.o; g.fillRect(424, y - 6, 12, 12);
      });
      [196, 160, 128].forEach((r, k) => { g.strokeStyle = hexA(D1.o, 0.12 + k * 0.12); g.lineWidth = 2; g.beginPath(); g.arc(hub[0], hub[1], r, 0, TAU); g.stroke(); });
      d1_appIcon(g, hub[0], hub[1], 200, { glow: 0.45, dark: true });
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 20; g.fillStyle = D1.o; rr(g, hub[0] - 104, 676, 208, 62, 31); g.fill(); g.restore();
      text(g, 'Bağla', hub[0] - 22, 717, D1_SG(30, { ls: -0.5, c: D1.bg }));
      d1_arrow(g, hub[0] + 52, 707, 15, D1.bg, 4);
      d1_win(g, 100, 790, 1060, 250, 'bağla.log', D1.o);
      [['$ bağla binance', '[OK] hesap bağlandı', D1.c], ['$ bağla bitget ', '[OK] hesap bağlandı', D1.c], ['$ bağla mexc   ', '[..] bağlanıyor', D1.o]].forEach(([a, b, col], i) => {
        const y = 862 + i * 46, aw = d1_mono(g, a, 130, y, 22, D1.ink);
        d1_mono(g, b, 130 + aw + 40, y, 22, col, { w: 700 });
      });
      d1_cursor(g, 130, 1002, 22, D1.o);
      // commission coupon
      g.save();
      g.translate(1545, 400); g.rotate(-0.035);
      const tx = -310, ty = -128, tw = 620, th = 256, nx = 220, nr = 22, cr = 16;
      g.beginPath();
      g.moveTo(tx + cr, ty); g.lineTo(tx + nx - nr, ty); g.arc(tx + nx, ty, nr, Math.PI, 0, true);
      g.arcTo(tx + tw, ty, tx + tw, ty + cr, cr); g.arcTo(tx + tw, ty + th, tx + tw - cr, ty + th, cr);
      g.lineTo(tx + nx + nr, ty + th); g.arc(tx + nx, ty + th, nr, 0, Math.PI, true);
      g.arcTo(tx, ty + th, tx, ty + th - cr, cr); g.arcTo(tx, ty, tx + cr, ty, cr); g.closePath();
      g.shadowColor = D1.o; g.shadowBlur = 40; g.fillStyle = D1.o; g.fill(); g.shadowBlur = 0;
      g.setLineDash([8, 8]); g.strokeStyle = 'rgba(4,6,10,0.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx + nx, ty + nr + 8); g.lineTo(tx + nx, ty + th - nr - 8); g.stroke(); g.setLineDash([]);
      text(g, '%10', tx + nx / 2, ty + 150, D1_SG(80, { ls: -3, c: D1.bg }));
      d1_mono(g, 'İNDİRİM', tx + nx / 2, ty + 196, 20, D1.bg, { w: 800, ls: 3, a: 'center' });
      d1_mono(g, 'KOMİSYON İNDİRİMİ', tx + nx + 36, ty + 66, 20, D1.bg, { w: 800, ls: 2 });
      text(g, 'Binance', tx + nx + 34, ty + 150, D1_SG(70, { a: 'left', ls: -2, c: D1.bg }));
      d1_mono(g, 'Komisyon İndirimi Seç', tx + nx + 36, ty + 202, 19, 'rgba(4,6,10,0.75)', { w: 700 });
      g.restore();
      // education videos
      d1_win(g, 1230, 568, 630, 472, 'kripto-hakkında-her-şey', D1.c);
      text(g, 'Kripto Hakkında Her Şey', 1266, 650, D1_SG(40, { a: 'left', ls: -1, c: D1.ink }));
      for (let i = 0; i < 3; i++) {
        const x = 1266 + i * 192, y = 684, w = 176, h = 112;
        const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#141922'); gr.addColorStop(1, i === 1 ? '#2A1A08' : '#0A1E24');
        g.fillStyle = gr; g.fillRect(x, y, w, h); g.strokeStyle = hexA(D1.c, 0.4); g.lineWidth = 1.5; g.strokeRect(x, y, w, h);
        g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.globalAlpha = 0.5;
        if (i === 0) d1_candles(g, d1_ohlc(5, 12, 0.3, 0.7, 0.07), x + 10, y + 12, w - 20, h - 24, 0, 1);
        else if (i === 1) d1_coin(g, x + w / 2, y + h / 2, 34, 'BTC');
        else d1_spark(g, x + 10, y + 20, w - 20, h - 40, 9, true, D1.c, { n: 20, lw: 3 });
        g.restore();
        g.fillStyle = 'rgba(4,6,10,0.75)'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 24, 0, TAU); g.fill();
        g.strokeStyle = D1.o; g.lineWidth = 2; g.stroke();
        g.fillStyle = D1.o; g.beginPath(); g.moveTo(x + w / 2 - 7, y + h / 2 - 11); g.lineTo(x + w / 2 + 12, y + h / 2); g.lineTo(x + w / 2 - 7, y + h / 2 + 11); g.closePath(); g.fill();
        g.fillStyle = hexA(D1.ink, 0.15); g.fillRect(x, y + h + 10, w, 4);
        g.fillStyle = D1.o; g.fillRect(x, y + h + 10, w * [0.7, 0.35, 0.1][i], 4);
      }
      g.strokeStyle = D1.o; g.lineWidth = 2.5; g.strokeRect(1266, 868, 270, 62);
      d1_mono(g, 'Şimdi Keşfet', 1290, 908, 23, D1.o, { w: 800 });
      d1_arrow(g, 1504, 899, 13, D1.o, 3.5);
      d1_mono(g, 'eğitim videoları', 1266, 1000, 20, D1.dim, { w: 700 });
      d1_scan(g);
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış',
    desc: 'Pencereler logoya doğru çöker; resmî logo beyaz harflerle yanar, "Ücretsiz ailemize katılın!" yazılır, kripto724.com imleçle tamamlanır, yasal not belirir.',
    draw(g) {
      d1_bg(g, D1.o, 0.1);
      d1_tape(g, 0, 760);
      // collapse traces: the earlier windows fly into the logo, leaving streaks
      const lc = [CX, 318];
      [[180, 170, 300, 170, D1.o], [50, 500, 250, 150, D1.c], [250, 840, 280, 150, D1.o], [1490, 160, 300, 170, D1.c], [1620, 500, 250, 150, D1.o], [1420, 840, 280, 150, D1.c]].forEach(([x, y, w, h, col], i) => {
        const mx = x + w / 2, my = y + h / 2, dx = lc[0] - mx, dy = lc[1] - my, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 7; k++) {
          const off = (k - 3) * h * 0.13, px = -uy * off, py = ux * off, len = 140 + ((k * 37 + i * 53) % 90);
          g.strokeStyle = hexA(col, 0.10 + (k % 3) * 0.05); g.lineWidth = 2;
          g.beginPath(); g.moveTo(mx + px + ux * w * 0.55, my + py + uy * w * 0.55); g.lineTo(mx + px + ux * (w * 0.55 + len), my + py + uy * (w * 0.55 + len)); g.stroke();
        }
        g.restore();
        g.save(); g.globalAlpha = 0.5;
        d1_win(g, x, y, w, h, ['kripto', 'borsa', 'altın', 'alarm.log', 'kasa', 'bağla'][i], col, { a: 0.5 });
        for (let k = 0; k < 3; k++) { g.fillStyle = hexA(D1.ink, 0.25); g.fillRect(x + 20, y + 62 + k * 30, w * (0.35 + ((k + i) % 3) * 0.15), 10); }
        g.restore();
      });
      g.fillStyle = 'rgba(4,6,10,0.9)'; g.fillRect(lc[0] - 300, lc[1] - 230, 600, 460);
      addGlow(g, D1.o, lc[0], lc[1], 420, 0.3);
      d1_corners(g, lc[0] - 300, lc[1] - 230, 600, 460, 50, D1.o, 4);
      logo(g, lc[0], lc[1], 300, { ink: '#FFFFFF' });
      const o9 = D1_SG(104, { a: 'left', ls: -3 });
      const t1 = 'Ücretsiz ailemize ', t2 = 'katılın!', w1 = measure(g, t1, o9), w2 = measure(g, t2, o9), x0 = CX - (w1 + w2) / 2;
      text(g, t1, x0, 680, { ...o9, c: D1.ink });
      d1_neon(g, t2, x0 + w1, 680, o9, D1.o, 34);
      const cmd = '> kripto724.com', cw = d1_mw(g, cmd, 60, 800), bw = cw + 150, bx = CX - bw / 2;
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 24; g.fillStyle = '#07080B'; g.fillRect(bx, 752, bw, 112);
      g.strokeStyle = D1.o; g.lineWidth = 2.5; g.strokeRect(bx, 752, bw, 112); g.restore();
      g.save(); g.shadowColor = D1.o; g.shadowBlur = 22; d1_mono(g, cmd, bx + 50, 830, 60, D1.o, { w: 800 }); g.restore();
      d1_cursor(g, bx + 58 + cw, 830, 60, D1.o);
      let fx = CX - 330;
      ['kripto', 'borsa', 'emtia'].forEach(s => { d1_mono(g, `[ ${s} ]`, fx + 110, 950, 26, D1.c, { w: 700, a: 'center' }); fx += 220; });
      d1_mono(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1032, 22, D1.dim, { a: 'center' });
      d1_scan(g);
    },
  },
];

window.DESIGN = {
  id: 1, name: 'Neon Terminal',
  concept: 'Gece hiç kapanmayan bir piyasa terminali: zifiri siyah, marka turuncusu neon, monospace fiyatlar, kayan fiyat bandı, tarama çizgileri ve glitch kesmeler. Kripto, borsa ve emtia aynı ekranda; Kripto724’ün gerçek ekranları terminal pencerelerinde akar.',
  board: { bg: '#05070A', ink: '#F3F1EC', soft: '#8A8F9A', accent: '#F7931A', line: 'rgba(247,147,26,0.22)', display: { f: 'Space Grotesk', w: 700, ls: -3 }, text: { f: 'JetBrains Mono', w: 400 }, badgeInk: '#04060A' },
  palette: [['#04060A', 'Gece'], ['#F7931A', 'Turuncu'], ['#00E5FF', 'Camgöbeği'], ['#00D27A', 'Yükseliş'], ['#FF3B5C', 'Düşüş']],
  fonts: ['Space Grotesk 700', 'JetBrains Mono · Inter'],
  motion: ['Glitch / RGB kayması (camgöbeği–turuncu)', 'Daktilo imleci, kayan fiyat bandı', 'Tarama çizgisi, her 2 sn’de sert kesme'],
  music: 'karanlık synthwave, 120 BPM, 8-bit tikler ve bildirim sesi',
  format: '16:9 · 1920×1080 · 40 sn',
  scenes: D1_SCENES,
};
