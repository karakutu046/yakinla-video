'use strict';
/* TASARIM 02 · 7/24 SAAT  (brief v2: kripto724)
 * "Piyasa hiç durmuyor." One 24-hour dial carries the film (İstanbul time, 00 at the bottom,
 * 12 at the top, clockwise). The orange hand moves from 03:00 at night to sunrise at 07:00 while
 * the sky warms from night navy to dawn; in between, the dial maps the market rhythms:
 * crypto 7/24 (the outer ring that never goes dark), BIST 10:00–18:00, Nasdaq 16:30–23:00 and
 * Kapalıçarşı by day. Two layers: the film's own frosted-glass layer (Sora + Manrope) and the
 * app's light cards and phone screens (Inter), drawn with the app's exact data. */

const D2 = {
  night: '#0B1026', navy: '#24346E', orange: '#F7931A', coral: '#FF7A59', teal: '#3DD9C1',
  ink: '#F6F2FB', soft: '#ABA8CF', dim: '#6F7099', peri: '#8C9BFF', lilac: '#C9B8FF', deep: '#060A1C',
  glow: '#FFB866',              // light orange for the sun core and the horizon
};
// the app's light UI
const D2A = {
  page: '#EEF0F5', card: '#FFFFFF', ink: '#14161F', sub: '#7A7F8C', line: '#EEF0F4',
  up: '#16A34A', upBg: '#DCF5E6', dn: '#E5484D', dnBg: '#FDE2E2', track: '#F1F0FA', lav: '#ECEBFF',
  cntBg: '#E5E3FF', cnt: '#6E5BFF', live: '#10B981', liveInk: '#0C8F63', liveBg: '#E3F7EE',
  cream: '#FFF7E3', creamTrack: '#F4E7C2', gold1: '#D9A520', gold2: '#F2C14E',
};
const D2F = 'Sora', D2T = 'Manrope', D2U = 'Inter';
const D2_DAWN = [[0, D2.orange], [1, D2.coral]];
const D2_ST = { stars: null };

/* ── the app's data (from the client's screenshots) ── */
const D2_COINS = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
const D2_COINC = { BTC: ['#F7931A', 'B'], ETH: ['#5B63E8', 'E'], XRP: ['#14161F', 'X'], BNB: ['#F3BA2F', 'B'], SOL: [['#8B5CF6', '#3DD9C1'], 'S'], DOGE: ['#C9A23A', 'D'], ADA: ['#2A6FDB', 'A'] };
const D2_IDX = [['BIST 100', '11.165,44', '+0,13%', 31], ['Nasdaq 100', '29.813,16', '+0,55%', 47]];
const D2_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%'],
  ['META', 'Meta Platforms', '$612,49', '−1,24%'],
  ['NVDA', 'NVIDIA', '$215,38', '−1,17%'],
  ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%'],
  ['TSLA', 'Tesla', '$404,22', '−0,79%'],
  ['MSFT', 'Microsoft', '$531,01', '−0,06%'],
  ['AAPL', 'Apple', '$343,83', '−0,94%'],
];
// Ürün, alt satır, Alış, Satış, Değişim (changes not in the brief are filled in plausibly)
const D2_GOLD = [
  ['Gram Altın', '24 ayar · gram', '6.422,05', '6.510,83', '+0,40%'],
  ['Has Altın', '995 · gram', '6.454,32', '6.491,36', '+0,40%'],
  ['22 Ayar', 'bilezik · gram', '5.871,43', '6.081,88', '+0,40%'],
  ['Çeyrek Altın', '1,75 gr · 22 ayar', '10.327', '10.476', '+0,60%'],
  ['Yarım Altın', '3,5 gr · 22 ayar', '20.654', '20.815', '+0,58%'],
  ['Tam Altın', '7 gr · 22 ayar', '41.372', '41.727', '+0,55%'],
  ['Ata Altın', '7,2 gr · 22 ayar', '42.566', '42.993', '+0,32%'],
  ['Gremse', '17,5 gr · 22 ayar', '102.946', '104.301', '+0,41%'],
  ['Ata Beşli', '36 gr · 22 ayar', '212.799', '214.914', '+0,25%'],
];

/* ── type ── */
function d2_up(s) { return s.toLocaleUpperCase('tr'); }
// display line (Sora); o.max shrinks it to fit
function d2_h(g, s, x, y, size, col, o = {}) {
  let f = { f: D2F, w: o.w || 700, s: size, ls: o.ls == null ? -size * 0.025 : o.ls };
  if (o.max) f = fit(g, s, f, o.max);
  text(g, s, x, y, { ...f, a: o.a || 'left', b: o.b, c: col });
}
// text line (Manrope: also carries every ₺ amount in the film layer, Sora has no ₺)
function d2_t(g, s, x, y, size, col, o = {}) {
  let f = { f: D2T, w: o.w || 600, s: size, ls: o.ls || 0 };
  if (o.max) f = fit(g, s, f, o.max);
  text(g, s, x, y, { ...f, a: o.a || 'left', b: o.b, c: col });
}
function d2_tw(g, s, size, o = {}) { return measure(g, s, { f: o.f || D2T, w: o.w || 600, s: size, ls: o.ls || 0 }); }
// app UI text (Inter)
function d2_u(g, s, x, y, size, col, o = {}) {
  let f = { f: D2U, w: o.w || 600, s: size, ls: o.ls || 0 };
  if (o.max) f = fit(g, s, f, o.max);
  text(g, s, x, y, { ...f, a: o.a || 'left', b: o.b, c: col });
}
function d2_uw(g, s, size, w = 600) { return measure(g, s, { f: D2U, w, s: size }); }
// display line painted in the dawn gradient
function d2_grad(g, s, x, y, size, o = {}) {
  let f = { f: o.f || D2F, w: o.w || 800, s: size, ls: o.ls == null ? -size * 0.025 : o.ls };
  if (o.max) f = fit(g, s, f, o.max);
  const w = measure(g, s, f), x0 = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  const gr = g.createLinearGradient(x0, y - f.s, x0 + w, y);
  (o.stops || D2_DAWN).forEach(([p, c]) => gr.addColorStop(p, c));
  if (o.shadow) { g.save(); g.shadowColor = o.shadow; g.shadowBlur = 30; }
  text(g, s, x, y, { ...f, a: o.a || 'left', c: gr });
  if (o.shadow) g.restore();
  return w;
}
// "a" in ink and "b" in the dawn gradient on one centred line
function d2_two(g, a, b, x, y, size, o = {}) {
  const ls = -size * 0.02, fa = { f: D2F, w: o.w || 700, s: size, ls }, fb = { ...fa, w: o.wb || 800 };
  const wa = measure(g, a, fa), wb = measure(g, b, fb), x0 = x - (wa + wb) / 2;
  if (o.shadow) { g.save(); g.shadowColor = o.shadow; g.shadowBlur = 34; }
  text(g, a, x0, y, { ...fa, a: 'left', c: o.c || D2.ink });
  d2_grad(g, b, x0 + wa, y, size, { w: fb.w, ls });
  if (o.shadow) g.restore();
}
// small spaced capitals with a glowing dot
function d2_kick(g, s, x, y, col, o = {}) {
  const S = o.s || 21, label = d2_up(s), f = { f: D2T, w: 800, s: S, ls: S * 0.2 };
  const w = measure(g, label, f) + 26 - S * 0.2;
  const x0 = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  addGlow(g, col, x0 + 6, y - S * 0.36, 26, 0.45);
  g.fillStyle = col; g.beginPath(); g.arc(x0 + 6, y - S * 0.36, 5.5, 0, TAU); g.fill();
  text(g, label, x0 + 26, y, { ...f, a: 'left', c: col });
}
// frosted pill of the film layer
function d2_pill(g, x, y, label, o = {}) {
  const s = o.s || 22, h = o.h || s * 2.1, padX = o.padX || s * 0.95;
  const font = { f: o.f || D2T, s, w: o.w || 700, a: 'left', b: 'middle', c: o.c || D2.ink, ls: o.ls || 0 };
  const dot = o.dot ? s * 0.9 : 0;
  const tw = measure(g, label, font), w = o.width || padX * 2 + tw + dot;
  const ax = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  rr(g, ax, y - h / 2, w, h, h / 2); g.fillStyle = o.fill || 'rgba(255,255,255,0.07)'; g.fill();
  if (o.stroke !== false) { g.lineWidth = 1.5; g.strokeStyle = o.stroke || 'rgba(255,255,255,0.2)'; g.stroke(); }
  if (o.dot) { addGlow(g, o.dot, ax + padX + s * 0.2, y, s * 0.9, 0.5); g.fillStyle = o.dot; g.beginPath(); g.arc(ax + padX + s * 0.2, y, s * 0.24, 0, TAU); g.fill(); }
  text(g, label, ax + (o.width ? (w - tw - dot) / 2 : padX) + dot, y + 1, font);
  return w;
}
function d2_legend(g, items, x, y, size = 20) {
  let cx = x;
  items.forEach(([c, l]) => {
    addGlow(g, c, cx + 7, y - size * 0.36, 22, 0.5);
    g.fillStyle = c; g.beginPath(); g.arc(cx + 7, y - size * 0.36, 6.5, 0, TAU); g.fill();
    d2_t(g, l, cx + 22, y, size, D2.ink, { w: 600 });
    cx += 22 + d2_tw(g, l, size) + 30;
  });
}

/* ── icons ── */
function d2_moon(g, x, y, r, glowA = 1) {
  g.save();
  addGlow(g, '#B9C2FF', x, y, r * 4.2, 0.4 * glowA);
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  g.beginPath(); g.rect(x - r * 2, y - r * 2, r * 4, r * 4); g.arc(x + r * 0.52, y - r * 0.34, r * 0.86, 0, TAU);
  const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, '#FFF6E6'); gr.addColorStop(1, '#DCD3FF');
  g.fillStyle = gr; g.fill('evenodd');
  g.restore();
}
function d2_sunIcon(g, x, y, r, col = D2.orange) {
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = r * 0.24; g.lineCap = 'round';
  addGlow(g, col, x, y, r * 3.5, 0.4);
  g.beginPath(); g.arc(x, y, r * 0.52, 0, TAU); g.fill();
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); g.lineTo(x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18); g.stroke();
  }
  g.restore();
}
function d2_arrow(g, x, y, s, col, lw = 4) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x + s * 0.35, y - s * 0.62); g.lineTo(x + s, y); g.lineTo(x + s * 0.35, y + s * 0.62); g.stroke();
  g.restore();
}
function d2_star(g, x, y, r, col) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.46 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  g.closePath(); g.fillStyle = col; g.fill();
}
function d2_mag(g, x, y, s, col) {
  g.save(); g.strokeStyle = col; g.lineWidth = s * 0.13; g.lineCap = 'round';
  g.beginPath(); g.arc(x - s * 0.08, y - s * 0.08, s * 0.3, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x + s * 0.15, y + s * 0.15); g.lineTo(x + s * 0.4, y + s * 0.4); g.stroke();
  g.restore();
}
function d2_bell(g, x, y, s, col, fill = true) {
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(1.5, s * 0.1); g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x - s * 0.44, y + s * 0.26);
  g.quadraticCurveTo(x - s * 0.3, y + s * 0.12, x - s * 0.3, y - s * 0.06);
  g.bezierCurveTo(x - s * 0.3, y - s * 0.48, x + s * 0.3, y - s * 0.48, x + s * 0.3, y - s * 0.06);
  g.quadraticCurveTo(x + s * 0.3, y + s * 0.12, x + s * 0.44, y + s * 0.26);
  g.closePath();
  if (fill) g.fill(); else g.stroke();
  g.beginPath(); g.arc(x, y + s * 0.38, s * 0.1, 0, TAU); g.fill();
  g.restore();
}
function d2_lock(g, x, y, s, col, hole = D2.night) {
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * 0.12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - s * 0.25, y); g.lineTo(x - s * 0.25, y - s * 0.2); g.arc(x, y - s * 0.2, s * 0.25, Math.PI, 0); g.lineTo(x + s * 0.25, y); g.stroke();
  rr(g, x - s * 0.42, y - s * 0.04, s * 0.84, s * 0.62, s * 0.13); g.fill();
  g.fillStyle = hole; g.beginPath(); g.arc(x, y + s * 0.22, s * 0.075, 0, TAU); g.fill(); g.fillRect(x - s * 0.03, y + s * 0.22, s * 0.06, s * 0.15);
  g.restore();
}
function d2_play(g, x, y, r) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 10;
  g.fillStyle = 'rgba(255,255,255,0.94)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
  g.fillStyle = D2A.ink; g.beginPath(); g.moveTo(x - r * 0.28, y - r * 0.4); g.lineTo(x + r * 0.46, y); g.lineTo(x - r * 0.28, y + r * 0.4); g.closePath(); g.fill();
}
// the app icon: black rounded square with the white stacked logo (logo ≈ 0.66 × the square)
function d2_appIcon(g, x, y, s, o = {}) {
  g.save();
  if (o.shadow !== false) { g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = s * 0.3; g.shadowOffsetY = s * 0.08; }
  rr(g, x - s / 2, y - s / 2, s, s, s * 0.22); g.fillStyle = '#0A0A0A'; g.fill();
  g.restore();
  if (o.rim) { rr(g, x - s / 2, y - s / 2, s, s, s * 0.22); g.strokeStyle = o.rim; g.lineWidth = 2; g.stroke(); }
  logo(g, x, y, s * 0.66, { ink: '#FFFFFF' });
}

/* ── app UI primitives (light theme, Inter) ── */
function d2_acard(g, x, y, w, h, r = 22, fill = D2A.card, sh = 0.4) {
  g.save();
  if (sh > 0) { g.shadowColor = `rgba(4,8,30,${sh})`; g.shadowBlur = sh > 0.2 ? 60 : 14; g.shadowOffsetY = sh > 0.2 ? 24 : 4; }
  rr(g, x, y, w, h, r); g.fillStyle = fill; g.fill();
  g.restore();
}
// change pill: (x, y) = right end (o.a 'left' | 'center'), vertical middle
function d2_chg(g, s, x, y, size = 18, o = {}) {
  const up = s[0] !== '−', tw = d2_uw(g, s, size, 700), h = size * 1.75;
  const w = Math.max(o.minW || 0, tw + size * 1.2), ax = o.a === 'left' ? x : o.a === 'center' ? x - w / 2 : x - w;
  rr(g, ax, y - h / 2, w, h, h * 0.34); g.fillStyle = up ? D2A.upBg : D2A.dnBg; g.fill();
  d2_u(g, s, ax + w / 2, y + size * 0.36, size, up ? D2A.up : D2A.dn, { w: 700, a: 'center' });
  return w;
}
// "● CANLI" badge, (x, y) = right end, vertical middle
function d2_live(g, x, y, size = 16, label = 'CANLI') {
  const tw = d2_uw(g, label, size, 700), h = size * 1.9, w = tw + size * 2.5, ax = x - w;
  rr(g, ax, y - h / 2, w, h, h / 2); g.fillStyle = D2A.liveBg; g.fill();
  g.fillStyle = D2A.live; g.beginPath(); g.arc(ax + size * 0.98, y, size * 0.3, 0, TAU); g.fill();
  d2_u(g, label, ax + size * 1.62, y + size * 0.36, size, D2A.liveInk, { w: 700 });
  return w;
}
// segmented tabs: items [[label, count?]], (x, y) top-left
function d2_seg(g, x, y, w, h, items, sel, o = {}) {
  rr(g, x, y, w, h, h / 2); g.fillStyle = o.track || D2A.track; g.fill();
  const n = items.length, p = o.pad || 5, iw = (w - 2 * p) / n, size = o.s || h * 0.34;
  items.forEach(([lab, cnt], i) => {
    const ix = x + p + i * iw;
    if (i === sel) {
      g.save(); g.shadowColor = 'rgba(20,22,60,0.14)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
      rr(g, ix, y + p, iw, h - 2 * p, (h - 2 * p) / 2);
      if (o.selGrad) { const gr = g.createLinearGradient(ix, 0, ix + iw, 0); gr.addColorStop(0, o.selGrad[0]); gr.addColorStop(1, o.selGrad[1]); g.fillStyle = gr; } else g.fillStyle = '#FFFFFF';
      g.fill(); g.restore();
    }
    const lw = d2_uw(g, lab, size, 700), cw = cnt ? d2_uw(g, cnt, size * 0.8, 700) + size * 0.9 : 0, gap = cnt ? size * 0.4 : 0;
    const tx = ix + iw / 2 - (lw + gap + cw) / 2;
    d2_u(g, lab, tx, y + h / 2 + size * 0.36, size, i === sel ? (o.selInk || D2A.ink) : (o.ink || D2A.sub), { w: 700 });
    if (cnt) {
      const bx = tx + lw + gap, bh = size * 1.32;
      rr(g, bx, y + h / 2 - bh / 2, cw, bh, bh / 2); g.fillStyle = D2A.cntBg; g.fill();
      d2_u(g, cnt, bx + cw / 2, y + h / 2 + size * 0.29, size * 0.8, D2A.cnt, { w: 700, a: 'center' });
    }
  });
}
function d2_coinI(g, x, y, r, sym) {
  const [c, l] = D2_COINC[sym];
  if (Array.isArray(c)) { const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; } else g.fillStyle = c;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  d2_u(g, l, x, y + r * 0.37, r * 1.02, sym === 'BNB' ? '#3B2A00' : '#FFFFFF', { w: 700, a: 'center' });
}
function d2_tickI(g, x, y, r, t) {
  g.fillStyle = '#E8EAF1'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  const f = fit(g, t, { f: D2U, w: 700, s: r * 0.62 }, r * 1.55);
  text(g, t, x, y + f.s * 0.36, { ...f, a: 'center', c: D2A.ink });
}
// bend a random walk so it ends exactly at `target`
function d2_shape(s, target) { const n = s.length, e = s[n - 1]; return s.map((v, i) => v * Math.pow(target / e, i / (n - 1))); }
function d2_spark(g, x, y, w, h, seed, up, o = {}) {
  const s = d2_shape(walk(seed, o.n || 30, 0, o.vol || 0.018), up ? 1.05 : 0.95), lo = Math.min(...s), hi = Math.max(...s);
  const pts = s.map((v, i) => [x + i / (s.length - 1) * w, y + h - (v - lo) / (hi - lo || 1) * h]);
  const col = o.col || (up ? D2A.up : D2A.dn);
  if (o.fill) {
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hexA(col, 0.22)); gr.addColorStop(1, hexA(col, 0));
    g.beginPath(); smoothPath(g, pts); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fillStyle = gr; g.fill();
  }
  g.beginPath(); smoothPath(g, pts); g.strokeStyle = col; g.lineWidth = o.lw || 2; g.lineJoin = 'round'; g.stroke();
  return pts;
}
function d2_status(g, sw, t, col = D2A.ink) {
  d2_u(g, t, sw * 0.14, 41, 16, col, { w: 600, a: 'center' });
  const bx = sw * 0.86;
  g.fillStyle = col;
  for (let i = 0; i < 4; i++) { rr(g, bx - 46 + i * 6, 41 - 4 - i * 3, 4, 4 + i * 3, 1); g.fill(); }
  rr(g, bx - 14, 30, 26, 12, 3.5); g.strokeStyle = col; g.lineWidth = 1.4; g.stroke();
  rr(g, bx - 12, 32, 19, 8, 2); g.fill();
}
function d2_navIcon(g, kind, x, y, s, col) {
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = Math.max(1.6, s * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'akis') {
    for (let i = 0; i < 3; i++) { const yy = y - s * 0.3 + i * s * 0.3; g.beginPath(); g.moveTo(x - s * 0.4, yy); g.lineTo(x + s * (i === 2 ? 0.1 : 0.4), yy); g.stroke(); }
  } else if (kind === 'haber') {
    rr(g, x - s * 0.38, y - s * 0.42, s * 0.76, s * 0.84, s * 0.12); g.stroke();
    g.beginPath(); g.moveTo(x - s * 0.18, y - s * 0.14); g.lineTo(x + s * 0.18, y - s * 0.14); g.moveTo(x - s * 0.18, y + s * 0.12); g.lineTo(x + s * 0.1, y + s * 0.12); g.stroke();
  } else if (kind === 'alarm') d2_bell(g, x, y, s, col, false);
  else if (kind === 'hesap') {
    g.beginPath(); g.arc(x, y - s * 0.16, s * 0.2, 0, TAU); g.stroke();
    g.beginPath(); g.arc(x, y + s * 0.48, s * 0.38, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  }
  g.restore();
}
// the app's bottom nav: Akış · Haberler · [icon] · Alarmlarım · Hesabım
function d2_nav(g, x, y, w, h, active = -1, o = {}) {
  const items = [['Akış', 'akis'], ['Haberler', 'haber'], ['Alarmlarım', 'alarm'], ['Hesabım', 'hesap']];
  if (o.card) d2_acard(g, x, y, w, h, o.r || 30, '#FFFFFF', o.sh == null ? 0.4 : o.sh);
  else { g.fillStyle = '#FFFFFF'; g.fillRect(x, y, w, h); g.fillStyle = D2A.line; g.fillRect(x, y, w, 1.5); }
  const sw = w / 5, s = o.s || 11;
  items.forEach(([lab, ic], i) => {
    const slot = i < 2 ? i : i + 1, cx = x + sw * (slot + 0.5), on = i === active, col = on ? D2A.ink : D2A.sub;
    d2_navIcon(g, ic, cx, y + h * 0.4, s * 1.75, col);
    d2_u(g, lab, cx, y + h * 0.4 + s * 2.3, s, col, { w: on ? 700 : 600, a: 'center' });
    if (on && o.badge) {
      g.fillStyle = D2.orange; g.beginPath(); g.arc(cx + s * 0.95, y + h * 0.4 - s * 0.85, s * 0.42, 0, TAU); g.fill();
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.stroke();
    }
  });
  d2_appIcon(g, x + w / 2, y + h * 0.44, o.icon || h * 0.6, { shadow: false });
}
// phone: (x, y) top-left; paint(g, sw, sh) draws the screen in local coordinates
function d2_phone(g, x, y, w, h, paint, o = {}) {
  const r = w * 0.14, b = w * 0.026;
  g.save(); g.shadowColor = 'rgba(2,4,18,0.62)'; g.shadowBlur = 90; g.shadowOffsetY = 34;
  rr(g, x, y, w, h, r); g.fillStyle = '#0C0E16'; g.fill(); g.restore();
  rr(g, x, y, w, h, r); g.strokeStyle = 'rgba(255,255,255,0.26)'; g.lineWidth = 2; g.stroke();
  rr(g, x + 3, y + 3, w - 6, h - 6, r - 3); g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1.5; g.stroke();
  const sx = x + b, sy = y + b, sw = w - 2 * b, sh = h - 2 * b;
  g.save(); rr(g, sx, sy, sw, sh, r - b); g.clip(); g.translate(sx, sy);
  g.fillStyle = o.page || D2A.page; g.fillRect(0, 0, sw, sh);
  paint(g, sw, sh);
  rr(g, sw / 2 - sw * 0.15, sw * 0.03, sw * 0.3, sw * 0.08, sw * 0.04); g.fillStyle = '#05060A'; g.fill();
  rr(g, sw / 2 - sw * 0.17, sh - 12, sw * 0.34, 5, 3); g.fillStyle = 'rgba(20,22,31,0.55)'; g.fill();
  g.restore();
}

/* ── sky ── */
// keyframes: k → colours from the top of the frame down to the horizon
const D2_SKY = [
  [0.00, ['#03061A', '#070B22', '#0B1026', '#141B44']],
  [0.30, ['#050920', '#0A1130', '#17205A', '#2A3878']],
  [0.55, ['#070C26', '#141D4E', '#3A3A7E', '#A35C7E']],
  [0.75, ['#0B1230', '#22306C', '#7E5088', '#FF7A59']],
  [1.00, ['#18245A', '#3B3F84', '#C9667A', '#FFA64D']],
];
function d2_skyStops(k) {
  let i = 0; while (i < D2_SKY.length - 2 && k > D2_SKY[i + 1][0]) i++;
  const [k0, c0] = D2_SKY[i], [k1, c1] = D2_SKY[i + 1], t = clamp((k - k0) / (k1 - k0));
  return c0.map((c, j) => mix(hex2rgb(c), hex2rgb(c1[j]), t));
}
function d2_stars(g, a, px = 0, maxY = H) {
  if (a <= 0.01) return;
  g.save();
  for (const s of D2_ST.stars) {
    const x = ((s.x + px * (s.l + 1) * 0.6) % W + W) % W, y = s.y;
    const fade = clamp((maxY - 40 - y) / 260);
    const al = a * s.a * fade;
    if (al < 0.02) continue;
    g.globalAlpha = al;
    if (s.sp) { addGlow(g, '#C9D0FF', x, y, s.r * 9, 0.5); sparkle(g, x, y, s.r * 3.4, '#F4F1FF'); }
    else { g.fillStyle = '#ECEAFF'; g.beginPath(); g.arc(x, y, s.r, 0, TAU); g.fill(); }
  }
  g.restore();
}
// o.hz: horizon y (sky gradient ends there), o.px: star parallax, o.gx: glow centre
function d2_sky(g, k, o = {}) {
  const hz = o.hz || H, cs = d2_skyStops(k);
  const gr = g.createLinearGradient(0, 0, 0, hz);
  [0, 0.42, 0.78, 1].forEach((p, j) => gr.addColorStop(p, rgb(cs[j])));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // horizon glow: lavender at night, coral → orange at dawn
  const warm = clamp((k - 0.3) / 0.7), gx = o.gx == null ? CX : o.gx;
  g.save(); g.translate(gx, hz); g.scale(1, 0.4);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1400);
  rg.addColorStop(0, rgb(mix(hex2rgb('#4A55A8'), hex2rgb(D2.glow), warm), 0.35 + 0.4 * warm));
  rg.addColorStop(0.45, rgb(mix(hex2rgb('#2A3478'), hex2rgb(D2.coral), warm), 0.12 + 0.18 * warm));
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(-1600, -1400, 3200, 2800);
  g.restore();
  d2_stars(g, (1 - clamp((k - 0.45) / 0.5)) * (o.starA == null ? 1 : o.starA), o.px || 0, hz);
  const v = g.createLinearGradient(0, 0, 0, 260); v.addColorStop(0, 'rgba(2,4,16,0.35)'); v.addColorStop(1, 'rgba(2,4,16,0)');
  g.fillStyle = v; g.fillRect(0, 0, W, 260);
}
function d2_sea(g, hz, k, sx) {
  const gr = g.createLinearGradient(0, hz, 0, H);
  gr.addColorStop(0, mixHex('#1C2150', '#3A2C55', k)); gr.addColorStop(0.35, '#121638'); gr.addColorStop(1, '#070A1C');
  g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
  const r = mulberry32(77), n = 30;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const u = i / n, y = hz + 5 + Math.pow(u, 1.35) * (H - hz - 8);
    const w = (260 - u * 170) * (0.55 + r() * 0.9);
    g.fillStyle = hexA(i % 3 ? D2.orange : D2.coral, 0.42 * (1 - u) * k);
    rr(g, sx - w / 2 + (r() - 0.5) * 60, y, w, 2.2 + u * 2, 2); g.fill();
  }
  g.restore();
  const hl = g.createLinearGradient(0, 0, W, 0);
  hl.addColorStop(0, hexA(D2.orange, 0)); hl.addColorStop(clamp(sx / W, 0.01, 0.99), hexA('#FFE2B0', 0.85 * k)); hl.addColorStop(1, hexA(D2.orange, 0));
  g.fillStyle = hl; g.fillRect(0, hz - 1, W, 2);
}
function d2_sun(g, x, y, r, hz) {
  addGlow(g, D2.orange, x, y, r * 7, 0.55);
  addGlow(g, D2.coral, x, y, r * 12, 0.25);
  g.save();
  if (hz != null) { g.beginPath(); g.rect(0, 0, W, hz); g.clip(); }
  const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
  gr.addColorStop(0, '#FFFBEE'); gr.addColorStop(0.55, '#FFDDA6'); gr.addColorStop(1, D2.orange);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.restore();
}

/* ── the 24-hour dial ── */
const d2_ang = h => Math.PI / 2 + h / 24 * TAU;           // 00 at the bottom, 12 at the top
const d2_pt = (x, y, r, h) => [x + Math.cos(d2_ang(h)) * r, y + Math.sin(d2_ang(h)) * r];
// o.p: draw-on progress of ticks (0..1 from 00), o.bw: bezel width, o.nums: true | 'card'
function d2_dial(g, x, y, R, o = {}) {
  const bw = o.bw || Math.max(22, R * 0.075), p = o.p == null ? 1 : o.p, fa = o.faceA == null ? 1 : o.faceA;
  g.save();
  if (o.face !== false) {
    g.save(); g.shadowColor = 'rgba(2,4,16,0.65)'; g.shadowBlur = 90; g.shadowOffsetY = 30;
    const fg = g.createRadialGradient(x - R * 0.25, y - R * 0.5, R * 0.05, x, y, R);
    fg.addColorStop(0, hexA('#2C3C80', 0.5 * fa)); fg.addColorStop(0.6, hexA('#121A46', 0.62 * fa)); fg.addColorStop(1, hexA('#080C24', 0.82 * fa));
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); g.restore();
  }
  if (o.bezel !== false) {
    const rb = R - bw / 2;
    g.lineWidth = bw;
    g.strokeStyle = 'rgba(5,8,26,0.72)'; g.beginPath(); g.arc(x, y, rb, 0, Math.PI); g.stroke();        // night half 18 → 00 → 06
    g.strokeStyle = hexA(D2.orange, 0.1); g.beginPath(); g.arc(x, y, rb, Math.PI, TAU); g.stroke();    // day half 06 → 12 → 18
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.24)'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(x, y, R - bw, 0, TAU); g.stroke();
  }
  g.lineCap = 'round';
  const n = o.minor === false ? 24 : 96;
  for (let i = 0; i < n; i++) {
    const hh = i * 24 / n, f = clamp((p * 24 - hh) / 1.2 + 1);
    if (f <= 0) continue;
    const major = Math.abs(hh - Math.round(hh)) < 1e-6, card = major && Math.round(hh) % 6 === 0;
    const l = card ? 0.74 : major ? 0.52 : 0.24;
    const [ax, ay] = d2_pt(x, y, R - bw * 0.18, hh), [bx, by] = d2_pt(x, y, R - bw * (0.18 + l), hh);
    g.strokeStyle = card ? hexA(o.cardCol || D2.orange, 0.95 * f) : `rgba(246,242,251,${(major ? 0.72 : 0.3) * f})`;
    g.lineWidth = (card ? 3.4 : major ? 2.3 : 1.3) * (o.tickW || 1);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  }
  if (o.nums) {
    for (let hh = 0; hh < 24; hh++) {
      const f = clamp((p * 24 - hh) / 1.2 + 1); if (f <= 0) continue;
      const card = hh % 6 === 0;
      if (o.nums === 'card' && !card) continue;
      const [nx, ny] = d2_pt(x, y, R + (o.numR || 30) + (card ? 4 : 0), hh);
      const S = o.numS || 24;
      g.save(); g.globalAlpha *= f;
      text(g, String(hh).padStart(2, '0'), nx, ny + S * 0.36 * (card ? 1 : 0.74), { f: card ? D2F : D2T, w: card ? 700 : 600, s: card ? S : S * 0.74, a: 'center', c: card ? D2.ink : D2.soft });
      g.restore();
    }
  }
  g.restore();
  return bw;
}
// the hour hand: a bezel pointer with a glowing orb and a conic sweep trail from o.from
function d2_hand(g, x, y, R, h, o = {}) {
  const col = o.col || D2.orange, bw = o.bw || Math.max(22, R * 0.075), rb = R - bw / 2, a = d2_ang(h);
  g.save();
  if (o.from != null && o.from < h) {
    const a0 = d2_ang(o.from), f = (h - o.from) / 24, ta = o.trailA || 0.6;
    const cg = g.createConicGradient(a0, x, y);
    cg.addColorStop(0, hexA(col, 0)); cg.addColorStop(f * 0.97, hexA(col, ta)); cg.addColorStop(f, hexA(col, ta)); cg.addColorStop(Math.min(1, f + 0.001), hexA(col, 0));
    g.strokeStyle = cg; g.lineWidth = bw * (o.trailW || 1); g.lineCap = 'butt';
    g.beginPath(); g.arc(x, y, rb, a0, a); g.stroke();
  }
  const [ax, ay] = d2_pt(x, y, R - bw - (o.len == null ? R * 0.1 : o.len), h), [bx, by] = d2_pt(x, y, R + (o.over == null ? 14 : o.over), h);
  g.shadowColor = col; g.shadowBlur = 22; g.strokeStyle = col; g.lineWidth = o.lw || 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  g.shadowBlur = 0;
  const [ox, oy] = d2_pt(x, y, rb, h), orb = o.orb || bw * 0.42;
  addGlow(g, col, ox, oy, orb * 6, 0.6);
  g.fillStyle = '#FFF9EE'; g.beginPath(); g.arc(ox, oy, orb, 0, TAU); g.fill();
  g.lineWidth = Math.max(2, orb * 0.22); g.strokeStyle = col; g.stroke();
  g.restore();
}
// a market session on the dial, from h0 to h1 (clockwise)
function d2_arc(g, x, y, r, h0, h1, col, lw, o = {}) {
  g.save(); g.lineCap = o.cap || 'round';
  if (o.glow) { g.shadowColor = typeof col === 'string' ? col : D2.orange; g.shadowBlur = o.glow; }
  g.strokeStyle = col; g.lineWidth = lw;
  g.beginPath(); g.arc(x, y, r, d2_ang(h0), d2_ang(h1)); g.stroke();
  g.restore();
}
// crypto never closes: a full thin ring with a comet running on it
function d2_cryptoRing(g, x, y, r, hc, o = {}) {
  g.save();
  g.strokeStyle = hexA(D2.orange, o.base || 0.42); g.lineWidth = o.lw || 3; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  const a = d2_ang(hc), span = o.span || 1.6, cg = g.createConicGradient(a - span, x, y);
  cg.addColorStop(0, hexA(D2.orange, 0)); cg.addColorStop(span / TAU, hexA(D2.glow, 1)); cg.addColorStop(span / TAU + 0.001, hexA(D2.orange, 0));
  g.strokeStyle = cg; g.lineWidth = (o.lw || 3) + 3; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r, a - span, a); g.stroke();
  const ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
  addGlow(g, D2.orange, ex, ey, 54, 0.9);
  g.fillStyle = '#FFF4E2'; g.beginPath(); g.arc(ex, ey, 6, 0, TAU); g.fill();
  g.restore();
}

/* ── glass ── */
function d2_card(g, x, y, w, h, r = 26, o = {}) {
  g.save();
  g.shadowColor = 'rgba(2,4,18,0.5)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || 'rgba(13,19,50,0.66)'; g.fill();
  g.shadowColor = 'transparent';
  const gr = g.createLinearGradient(x, y, x, y + h);
  gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.012)'); gr.addColorStop(1, 'rgba(255,255,255,0.03)');
  g.fillStyle = gr; g.fill();
  const sg = g.createLinearGradient(x, y, x + w * 0.7, y + h);
  sg.addColorStop(0, 'rgba(255,255,255,0.34)'); sg.addColorStop(1, 'rgba(255,255,255,0.07)');
  g.lineWidth = 1.5; g.strokeStyle = o.stroke || sg; g.stroke();
  g.restore();
}
function d2_disc(g, x, y, r, o = {}) {
  g.save();
  g.shadowColor = 'rgba(2,4,18,0.6)'; g.shadowBlur = o.blur || 50; g.shadowOffsetY = 18;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = o.fill || 'rgba(11,16,44,0.8)'; g.fill();
  g.shadowColor = 'transparent';
  const gr = g.createLinearGradient(x, y - r, x, y + r);
  gr.addColorStop(0, 'rgba(255,255,255,0.1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.025)');
  g.fillStyle = gr; g.fill();
  const sg = g.createLinearGradient(x - r, y - r, x + r, y + r);
  sg.addColorStop(0, 'rgba(255,255,255,0.4)'); sg.addColorStop(1, 'rgba(255,255,255,0.06)');
  g.lineWidth = o.lw || 1.6; g.strokeStyle = o.stroke || sg; g.stroke();
  g.restore();
}
// the film's clock in the top-right corner
function d2_stamp(g, hhmm, k, label = 'İstanbul') {
  const f = { f: D2F, w: 700, s: 30, ls: 0 }, tw = measure(g, hhmm, f), lw = d2_tw(g, label, 20);
  const w = 26 + 28 + 16 + tw + 16 + lw + 28, h = 60, x = W - 64 - w, y = 46;
  rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(8,12,34,0.5)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; g.stroke();
  const ix = x + 26 + 14, iy = y + h / 2;
  if (k < 0.7) d2_moon(g, ix, iy, 13, 0.5); else d2_sunIcon(g, ix, iy, 13);
  text(g, hhmm, ix + 30, iy + 11, { ...f, a: 'left', c: D2.ink });
  d2_t(g, label, ix + 30 + tw + 16, iy + 7, 20, D2.soft);
}

/* ── scene 1 props: three separate screens floating in the dark ── */
function d2_float(g, T, sx, sy, z, rot, o = {}) {
  const k = FOCAL / (FOCAL + z);
  const pose = { x: CX + (sx - CX) / k, y: CY + (sy - CY) / k, z, rx: rot[0], ry: rot[1], rz: rot[2], s: 1 };
  const L = canvas(W, H), lx = L.getContext('2d');
  quadShadow(lx, projector(pose), T.w, T.h, 0.65, 70, 34, 30);
  plane3d(lx, T.c, T.w, T.h, pose, 12, 10);
  g.save(); g.globalAlpha *= o.a == null ? 1 : o.a;
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  g.drawImage(L, 0, 0); g.restore();
}
// a crypto exchange window (generic, no names)
function d2_texCrypto() {
  const w = 640, h = 420, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 20); x.fillStyle = '#0F1536'; x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.16)'; x.lineWidth = 1.5; x.stroke();
  x.save(); rr(x, 0, 0, w, h, 20); x.clip(); x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(0, 0, w, 44); x.restore();
  [D2.coral, D2.orange, D2.teal].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(24 + i * 20, 22, 6, 0, TAU); x.fill(); });
  d2_t(x, 'Kripto uygulaması', w / 2, 28, 16, D2.soft, { w: 700, a: 'center' });
  d2_h(x, 'BTC / USDT', 28, 92, 22, D2.ink);
  d2_t(x, '$80.220,05', 28, 142, 40, D2.ink, { w: 800 });
  d2_t(x, '−1,49% · 24 sa', 30, 168, 16, D2.coral, { w: 700 });
  d2_t(x, 'ETH / USDT', w - 28, 86, 15, D2.soft, { w: 600, a: 'right' });
  d2_t(x, '$2.325,10', w - 28, 112, 20, D2.ink, { w: 700, a: 'right' });
  const r = mulberry32(19); let v = 0.72;
  x.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(28, 200 + k * 60); x.lineTo(w - 28, 200 + k * 60); x.stroke(); }
  const n = 36, bw = (w - 56) / n;
  for (let i = 0; i < n; i++) {
    const o = v; v = clamp(v - 0.01 + (r() - 0.5) * 0.12, 0.1, 0.92);
    const hi = Math.max(o, v) + r() * 0.05, lo = Math.min(o, v) - r() * 0.05, up = v >= o, cx = 28 + i * bw + bw / 2;
    const Y = q => 392 - q * 190;
    x.fillStyle = up ? D2.teal : D2.coral;
    x.fillRect(cx - 1, Y(hi), 2, Y(lo) - Y(hi));
    x.fillRect(cx - bw * 0.32, Y(Math.max(o, v)), bw * 0.64, Math.max(2, Math.abs(Y(o) - Y(v))));
  }
  x.setLineDash([5, 5]); x.strokeStyle = hexA(D2.coral, 0.6); x.beginPath(); x.moveTo(28, 392 - v * 190); x.lineTo(w - 28, 392 - v * 190); x.stroke(); x.setLineDash([]);
  return T;
}
// a stock market web page (light, generic)
function d2_texStock() {
  const w = 600, h = 380, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 14); x.fillStyle = '#F4F3FA'; x.fill();
  x.save(); rr(x, 0, 0, w, h, 14); x.clip();
  x.fillStyle = '#DCD9EC'; x.fillRect(0, 0, w, 46);
  ['#FF7A59', '#F7B500', '#3DBE6E'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(22 + i * 18, 23, 5.5, 0, TAU); x.fill(); });
  rr(x, 92, 9, 196, 37, [10, 10, 0, 0]); x.fillStyle = '#F4F3FA'; x.fill();
  d2_t(x, 'Borsa · Endeksler', 108, 33, 14, '#3A3F66', { w: 700 });
  d2_t(x, 'Hisse ekranı', 310, 33, 14, '#7B7FA2', { w: 600 });
  d2_h(x, 'BIST 100', 28, 92, 22, D2.navy);
  d2_t(x, '11.165,44', 28, 140, 40, '#1C2140', { w: 800 });
  d2_t(x, '+0,13%', 30, 166, 16, '#16A34A', { w: 800 });
  d2_t(x, 'Nasdaq 100', w - 28, 86, 15, '#6A6E96', { w: 600, a: 'right' });
  d2_t(x, '29.813,16', w - 28, 112, 20, '#1C2140', { w: 800, a: 'right' });
  d2_t(x, '+0,55%', w - 28, 134, 14, '#16A34A', { w: 800, a: 'right' });
  const s = d2_shape(walk(63, 50, 0, 0.012), 1.03), lo = Math.min(...s), hi = Math.max(...s);
  const pts = s.map((v, i) => [28 + i / 49 * (w - 56), 296 - (v - lo) / (hi - lo) * 100]);
  const ag = x.createLinearGradient(0, 190, 0, 300); ag.addColorStop(0, 'rgba(22,163,74,0.22)'); ag.addColorStop(1, 'rgba(22,163,74,0)');
  x.beginPath(); smoothPath(x, pts); x.lineTo(w - 28, 300); x.lineTo(28, 300); x.closePath(); x.fillStyle = ag; x.fill();
  x.beginPath(); smoothPath(x, pts); x.strokeStyle = '#16A34A'; x.lineWidth = 2.5; x.stroke();
  rr(x, 28, 316, w - 56, 46, 8); x.fillStyle = '#E3E1EE'; x.fill();
  d2_t(x, 'REKLAM', w / 2, 345, 13, '#9A98B8', { w: 800, a: 'center', ls: 3 });
  x.restore();
  return T;
}
// a gold price page on a dark phone
function d2_texGold() {
  const w = 330, h = 660, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 52); x.fillStyle = '#20284F'; x.fill();
  rr(x, 7, 7, w - 14, h - 14, 46);
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#131A3E'); gr.addColorStop(1, '#0A0F27'); x.fillStyle = gr; x.fill();
  rr(x, w / 2 - 46, 20, 92, 28, 14); x.fillStyle = '#04060F'; x.fill();
  d2_t(x, '03:00', 38, 42, 16, D2.ink, { w: 700 });
  d2_h(x, 'Altın fiyatları', 28, 104, 25, D2.ink);
  d2_t(x, 'Gram altın · satış', 28, 130, 15, D2.soft, { w: 500 });
  const cg = x.createLinearGradient(w - 64, 78, w - 28, 114); cg.addColorStop(0, D2A.gold2); cg.addColorStop(1, D2A.gold1);
  x.fillStyle = cg; x.beginPath(); x.arc(w - 46, 96, 18, 0, TAU); x.fill();
  d2_t(x, 'Au', w - 46, 101, 13, '#5A3F00', { w: 800, a: 'center' });
  d2_t(x, '₺6.510,83', 28, 182, 34, D2.ink, { w: 800 });
  d2_t(x, '+0,40% bugün', 28, 208, 15, D2.teal, { w: 700 });
  const s = d2_shape(walk(41, 40, 0, 0.014), 1.04), lo = Math.min(...s), hi = Math.max(...s);
  const pts = s.map((v, i) => [26 + i / 39 * (w - 52), 310 - (v - lo) / (hi - lo) * 80]);
  const ag = x.createLinearGradient(0, 230, 0, 312); ag.addColorStop(0, hexA(D2A.gold2, 0.3)); ag.addColorStop(1, hexA(D2A.gold2, 0));
  x.beginPath(); smoothPath(x, pts); x.lineTo(w - 26, 312); x.lineTo(26, 312); x.closePath(); x.fillStyle = ag; x.fill();
  x.beginPath(); smoothPath(x, pts); x.strokeStyle = D2A.gold2; x.lineWidth = 2.5; x.stroke();
  [['Çeyrek Altın', '₺10.476'], ['Yarım Altın', '₺20.815'], ['Tam Altın', '₺41.727'], ['Ata Altın', '₺42.993']].forEach(([n, v], i) => {
    const y = 370 + i * 62;
    x.fillStyle = 'rgba(255,255,255,0.07)'; x.fillRect(26, y - 34, w - 52, 1);
    d2_t(x, n, 28, y, 18, D2.ink, { w: 700 });
    d2_t(x, 'satış', 28, y + 20, 13, D2.soft, { w: 500 });
    d2_t(x, v, w - 28, y + 4, 17, D2.ink, { w: 800, a: 'right' });
  });
  rr(x, w / 2 - 60, h - 26, 120, 5, 3); x.fillStyle = 'rgba(255,255,255,0.4)'; x.fill();
  const sh = x.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)');
  rr(x, 0, 0, w, h, 52); x.fillStyle = sh; x.fill();
  return T;
}

/* ── app screens ── */
// Anasayfa · Kripto tab: the live crypto table
function d2_cryptoCard(g, x, y, w, h, time) {
  d2_acard(g, x, y, w, h, 30);
  const P = 44;
  d2_seg(g, x + P, y + 38, 420, 62, [['Kripto'], ['Borsa'], ['Emtia']], 0, { s: 21 });
  d2_live(g, x + w - P, y + 69, 18);
  const cP = x + 572, cD = x + 694, cWk = x + w - P - 60, hy = y + 160;
  d2_u(g, 'Varlık', x + P, hy, 18, D2A.sub, { w: 600 });
  d2_u(g, 'Fiyat', cP, hy, 18, D2A.sub, { w: 600, a: 'right' });
  d2_u(g, 'Günlük', cD, hy, 18, D2A.sub, { w: 600, a: 'center' });
  d2_u(g, 'Haftalık', cWk, hy, 18, D2A.sub, { w: 600, a: 'center' });
  const ry0 = y + 182, rh = 90;
  D2_COINS.forEach(([sym, name, pair, price, d, wk], i) => {
    const top = ry0 + rh * i, my = top + rh / 2;
    if (i === 0) { rr(g, x + 16, top + 6, w - 32, rh - 12, 20); g.fillStyle = '#FFF3E2'; g.fill(); }
    else { g.fillStyle = D2A.line; g.fillRect(x + P, top, w - 2 * P, 1.5); }
    d2_coinI(g, x + P + 28, my, 28, sym);
    d2_u(g, name, x + P + 74, my - 4, 25, D2A.ink, { w: 700 });
    d2_u(g, pair, x + P + 74, my + 24, 17, D2A.sub, { w: 500 });
    d2_u(g, price, cP, my + 9, 25, D2A.ink, { w: 700, a: 'right' });
    d2_chg(g, d, cD, my, 19, { a: 'center', minW: 116 });
    d2_chg(g, wk, cWk, my, 19, { a: 'center', minW: 116 });
  });
  d2_u(g, 'Güncellendi ' + time, x + w / 2, y + h - 30, 18, D2A.sub, { w: 600, a: 'center' });
}
// Borsa screen inside a phone
function d2_borsaScreen(g, sw, sh) {
  const P = 22;
  d2_status(g, sw, '14:23');
  d2_u(g, 'Borsa', P, 106, 32, D2A.ink, { w: 700 });
  d2_u(g, 'BIST ve Nasdaq hisseleri', P, 132, 15, D2A.sub, { w: 500 });
  d2_live(g, sw - P, 98, 12.5, 'CANLI · 14:23');
  const cw = (sw - 2 * P - 12) / 2;
  D2_IDX.forEach(([n, v, c, seed], i) => {
    const cx = P + i * (cw + 12), cy = 154;
    d2_acard(g, cx, cy, cw, 112, 16, '#FFFFFF', 0.06);
    d2_u(g, n, cx + 14, cy + 28, 14, D2A.sub, { w: 600 });
    d2_chg(g, c, cx + cw - 12, cy + 23, 11);
    d2_u(g, v, cx + 14, cy + 58, 22, D2A.ink, { w: 700 });
    d2_spark(g, cx + 14, cy + 70, cw - 28, 30, seed, true, { lw: 1.6, fill: true });
  });
  d2_seg(g, P, 282, sw - 2 * P, 46, [['Tümü', '210'], ['BIST', '108'], ['Nasdaq', '102']], 0, { s: 13 });
  let fx = P; const fy = 360;
  [['Favoriler', 'star'], ['Popüler', 'sel'], ['Yükselenler'], ['Düşenler']].forEach(([l, k]) => {
    const st = k === 'star' ? 17 : 0, w = d2_uw(g, l, 13, 600) + st + 26;
    rr(g, fx, fy - 16, w, 32, 16); g.fillStyle = k === 'sel' ? D2A.ink : '#FFFFFF'; g.fill();
    if (st) d2_star(g, fx + 20, fy - 1, 7, D2.orange);
    d2_u(g, l, fx + 13 + st, fy + 5, 13, k === 'sel' ? '#FFFFFF' : D2A.ink, { w: 600 });
    fx += w + 8;
  });
  rr(g, P, 392, sw - 2 * P, 44, 14); g.fillStyle = '#FFFFFF'; g.fill();
  d2_mag(g, P + 22, 413, 17, D2A.sub);
  d2_u(g, 'Hisse adı ya da kodu ara…', P + 42, 419, 14, D2A.sub, { w: 500 });
  d2_u(g, '210 hisse', P, 466, 13, D2A.sub, { w: 600 });
  d2_u(g, 'Fiyat · Günlük', sw - P, 466, 13, D2A.sub, { w: 600, a: 'right' });
  d2_acard(g, P - 8, 480, sw - 2 * P + 16, sh - 480 + 30, 18, '#FFFFFF', 0.05);
  D2_STOCKS.slice(0, 6).forEach(([t, n, p, c], i) => {
    const y = 480 + 33 + i * 62;
    if (i) { g.fillStyle = D2A.line; g.fillRect(P + 4, y - 31, sw - 2 * P - 8, 1); }
    d2_tickI(g, P + 20, y, 19, t);
    d2_u(g, t, P + 48, y - 3, 15, D2A.ink, { w: 700 });
    const tx = P + 48 + d2_uw(g, t, 15, 700) + 6;
    rr(g, tx, y - 15, d2_uw(g, 'NASDAQ', 8.5, 700) + 10, 14, 4); g.fillStyle = D2A.lav; g.fill();
    d2_u(g, 'NASDAQ', tx + 5, y - 5, 8.5, D2A.cnt, { w: 700 });
    d2_u(g, n, P + 48, y + 15, 12, D2A.sub, { w: 500, max: 128 });
    d2_spark(g, 200, y - 12, 58, 22, 50 + i * 7, c[0] !== '−', { lw: 1.5, n: 22, vol: 0.012 });
    d2_u(g, p, 340, y + 5, 15, D2A.ink, { w: 700, a: 'right' });
    d2_chg(g, c, sw - P, y, 12, { minW: 70 });
  });
  d2_nav(g, 0, sh - 88, sw, 88);
}
// Altın screen: the cream gold card
function d2_goldCard(g, x, y, w, h) {
  d2_acard(g, x, y, w, h, 30, D2A.cream);
  const P = 44;
  const cg = g.createLinearGradient(x + P, y + 34, x + P + 56, y + 90); cg.addColorStop(0, D2A.gold2); cg.addColorStop(1, D2A.gold1);
  g.fillStyle = cg; g.beginPath(); g.arc(x + P + 28, y + 62, 28, 0, TAU); g.fill();
  d2_u(g, 'Au', x + P + 28, y + 70, 21, '#FFFFFF', { w: 700, a: 'center' });
  d2_u(g, 'Altın', x + P + 72, y + 58, 30, D2A.ink, { w: 700 });
  g.fillStyle = D2A.live; g.beginPath(); g.arc(x + P + 78, y + 81, 5, 0, TAU); g.fill();
  d2_u(g, 'Kapalıçarşı · canlı', x + P + 92, y + 87, 17, D2A.sub, { w: 600 });
  d2_seg(g, x + w - P - 230, y + 37, 230, 52, [['₺ TL'], ['$ USD']], 0, { s: 18, track: D2A.creamTrack, selGrad: [D2A.gold2, D2A.gold1], selInk: '#FFFFFF', ink: '#8A7440' });
  const tw = (w - 2 * P - 20) / 2, ty = y + 120, th = 178;
  [['Gram Altın', '₺6.510,83', '+0,40%'], ['Ons Altın', '$4.033,60', '+0,40%']].forEach(([n, v, c], i) => {
    const tx = x + P + i * (tw + 20);
    d2_acard(g, tx, ty, tw, th, 20, '#FFFFFF', 0.06);
    d2_u(g, n, tx + 24, ty + 40, 18, D2A.sub, { w: 600 });
    d2_chg(g, c, tx + tw - 22, ty + 34, 16);
    d2_u(g, v, tx + 24, ty + 98, 42, D2A.ink, { w: 700 });
    if (i === 0) {
      d2_u(g, 'Alış', tx + 24, ty + 146, 16, D2A.sub, { w: 500 });
      d2_u(g, '6.422', tx + 24 + d2_uw(g, 'Alış ', 16, 500), ty + 146, 16, D2A.ink, { w: 700 });
      d2_u(g, 'Satış', tx + 170, ty + 146, 16, D2A.sub, { w: 500 });
      d2_u(g, '6.511', tx + 170 + d2_uw(g, 'Satış ', 16, 500), ty + 146, 16, D2A.ink, { w: 700 });
    } else d2_spark(g, tx + 24, ty + 116, tw - 48, 40, 88, true, { col: D2A.gold1, lw: 2.2, fill: true });
  });
  d2_u(g, 'ALTIN FİYATLARI', x + P, y + 352, 16, D2A.sub, { w: 700, ls: 2 });
  d2_seg(g, x + w - P - 300, y + 324, 300, 46, [['Yeni basım'], ['Eski basım']], 1, { s: 15, track: D2A.creamTrack, ink: '#8A7440' });
  const px = x + P, py = y + 392, pw = w - 2 * P, ph = h - 392 - P;
  rr(g, px, py, pw, ph, 20); g.fillStyle = '#FFFFFF'; g.fill();
  const cA = px + pw * 0.56, cS = px + pw * 0.77, hy = py + 36;
  d2_u(g, 'Ürün', px + 24, hy, 15, D2A.sub, { w: 600 });
  d2_u(g, 'Alış', cA, hy, 15, D2A.sub, { w: 600, a: 'right' });
  d2_u(g, 'Satış', cS, hy, 15, D2A.sub, { w: 600, a: 'right' });
  d2_u(g, 'Değişim', px + pw - 24, hy, 15, D2A.sub, { w: 600, a: 'right' });
  const rh = (ph - 56) / D2_GOLD.length;
  D2_GOLD.forEach(([n, sub, a, s, c], i) => {
    const top = py + 52 + i * rh, my = top + rh / 2;
    g.fillStyle = D2A.line; g.fillRect(px + 20, top, pw - 40, 1.5);
    d2_u(g, n, px + 24, my - 2, 18, D2A.ink, { w: 700 });
    d2_u(g, sub, px + 24, my + 16, 13, D2A.sub, { w: 500 });
    d2_u(g, a, cA, my + 6, 18, D2A.ink, { w: 600, a: 'right' });
    d2_u(g, s, cS, my + 6, 18, D2A.ink, { w: 700, a: 'right' });
    d2_chg(g, c, px + pw - 24, my, 14, { minW: 86 });
  });
}

/* ── init: the stars ── */
function d2_init() {
  const r = mulberry32(2724), st = [];
  for (let i = 0; i < 320; i++) {
    const l = r() < 0.62 ? 0 : r() < 0.72 ? 1 : 2;
    st.push({ x: r() * W, y: Math.pow(r(), 1.3) * H, r: [0.9, 1.45, 2.1][l] * (0.75 + r() * 0.5), a: 0.3 + r() * 0.7, l, sp: l === 2 && r() < 0.45 });
  }
  D2_ST.stars = st;
}

/* ── scenes ── */
const D2_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Gece 03:00',
    desc: 'Gece 03:00. Kripto uygulaması, borsa sitesi ve altın ekranı farklı derinliklerde süzülür; yıldızlar kayar, başlık iki satırda yerleşir: "Piyasa hiç durmuyor."',
    draw(g) {
      d2_sky(g, 0, { px: -30 });
      g.save(); g.filter = 'blur(10px)';
      [[1560, 92, 150, 96, D2.lilac], [60, 640, 120, 80, D2.coral], [960, 96, 120, 74, D2.teal], [1270, 1010, 160, 90, D2.peri]].forEach(([x, y, w, h, c]) => {
        rr(g, x - w / 2, y - h / 2, w, h, 12); g.fillStyle = hexA(c, 0.18); g.fill();
      });
      g.restore();
      d2_moon(g, 1800, 118, 40, 1);
      // a gold quote, slightly out of focus
      g.save(); g.filter = 'blur(1.2px)'; g.translate(250, 405); g.rotate(-0.07);
      d2_card(g, -150, -46, 300, 92, 22, { fill: 'rgba(16,22,56,0.85)' });
      const cg = g.createLinearGradient(-132, -26, -80, 26); cg.addColorStop(0, D2A.gold2); cg.addColorStop(1, D2A.gold1);
      g.fillStyle = cg; rr(g, -132, -26, 52, 52, 14); g.fill();
      d2_t(g, 'Au', -106, 8, 20, '#5A3F00', { w: 800, a: 'center' });
      d2_t(g, 'Ons altın · başka sekme', -64, -6, 16, D2.soft, { w: 600 });
      d2_t(g, '$4.033,60', -64, 24, 24, D2.ink, { w: 800 });
      g.restore();
      addGlow(g, '#B9B4FF', 690, 330, 440, 0.1);
      addGlow(g, D2.orange, 1150, 330, 540, 0.08);
      addGlow(g, D2.teal, 1600, 600, 600, 0.1);
      d2_float(g, d2_texStock(), 690, 330, 560, [0.1, 0.34, -0.05], { blur: 1.6, a: 0.9 });
      d2_float(g, d2_texCrypto(), 1150, 338, 200, [0.08, -0.26, 0.035], { blur: 0.7 });
      d2_float(g, d2_texGold(), 1604, 560, -130, [0.05, -0.42, 0.07]);
      d2_pill(g, 470, 548, 'Hangisi güncel?', { s: 20, dot: D2.coral, fill: 'rgba(10,14,38,0.85)' });
      const sh = g.createLinearGradient(0, 600, 0, H); sh.addColorStop(0, 'rgba(3,5,18,0)'); sh.addColorStop(1, 'rgba(3,5,18,0.8)');
      g.fillStyle = sh; g.fillRect(0, 600, W, H - 600);
      d2_dial(g, 160, 128, 60, { bw: 13, minor: false, tickW: 0.8 });
      d2_hand(g, 160, 128, 60, 3, { bw: 13, len: 18, lw: 3, orb: 5.5, over: 7 });
      text(g, '03:00', 246, 150, { f: D2F, w: 800, s: 66, a: 'left', c: D2.ink, ls: -1 });
      d2_t(g, 'İstanbul · gece', 250, 188, 22, D2.soft);
      d2_kick(g, 'Kripto · borsa · altın', 114, 712, D2.orange);
      d2_h(g, 'Piyasa hiç durmuyor.', 106, 822, 100, D2.ink, { w: 800 });
      d2_grad(g, 'Fiyatlar her yerde dağınık.', 106, 940, 88, { max: 1220 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Kadran ve logo',
    desc: 'Üç ekran ışık izine dönüşüp merkeze çekilir; turuncu ibre 24 saati tek turda süpürür, kadran tamamlanır ve ortasına resmî kripto724 logosu oturur.',
    draw(g) {
      d2_sky(g, 0.08, { px: -70 });
      d2_stamp(g, '03:15', 0.08);
      const x = CX, y = 470, R = 362;
      const r = mulberry32(42);
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (let i = 0; i < 54; i++) {
        const a = r() * TAU, d0 = R + 80 + r() * 560, len = 60 + r() * 220, c = [D2.teal, D2.coral, D2.lilac, D2.orange][i % 4];
        const x0 = x + Math.cos(a) * d0, y0 = y + Math.sin(a) * d0, x1 = x + Math.cos(a) * (d0 - len), y1 = y + Math.sin(a) * (d0 - len);
        const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, hexA(c, 0)); gr.addColorStop(1, hexA(c, 0.55));
        g.strokeStyle = gr; g.lineWidth = 1.2 + r() * 2.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
      g.restore();
      // the three screens of scene 1, pulled into the dial as light
      [[250, 250, 300, 190, D2.teal, -0.05, 'Borsa'], [1690, 520, 170, 320, D2A.gold2, 0.1, 'Altın'], [270, 700, 300, 196, D2.orange, 0.05, 'Kripto']].forEach(([gx, gy, w, h, c, rot, lab]) => {
        const dx = x - gx, dy = y - gy, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let k = -3; k <= 3; k++) {
          const ox = gx - uy * k * h * 0.12, oy = gy + ux * k * h * 0.12;
          const sg = g.createLinearGradient(ox, oy, ox + ux * 260, oy + uy * 260); sg.addColorStop(0, hexA(c, 0.28)); sg.addColorStop(1, hexA(c, 0));
          g.strokeStyle = sg; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + ux * 260, oy + uy * 260); g.stroke();
        }
        g.restore();
        g.save(); g.translate(gx, gy); g.rotate(rot);
        rr(g, -w / 2, -h / 2, w, h, 18); g.fillStyle = hexA(c, 0.07); g.fill(); g.strokeStyle = hexA(c, 0.42); g.lineWidth = 1.5; g.stroke();
        d2_t(g, lab, -w / 2 + 20, -h / 2 + 38, 20, hexA(c, 0.9), { w: 800 });
        g.fillStyle = hexA(c, 0.25); g.fillRect(-w / 2 + 20, -h / 2 + 56, w * 0.42, 6); g.fillRect(-w / 2 + 20, -h / 2 + 74, w * 0.26, 6);
        g.restore();
      });
      d2_dial(g, x, y, R, { nums: true, numS: 24, numR: 32 });
      d2_hand(g, x, y, R, 3.25, { from: 3.25 - 21, trailA: 0.55 });
      addGlow(g, D2.orange, x, y, 300, 0.16);
      logo(g, x, y, 250, { ink: '#FFFFFF' });
      d2_two(g, 'Kripto, borsa ve emtia ', 'tek uygulamada.', x, 1002, 58);
    },
  },
  {
    time: '8–12 sn', title: 'Kripto: Canlı, 7/24',
    desc: 'Uygulamanın kripto tablosu camın arkasından yükselir; satırlar sırayla dolar, fiyatlar sayaçla döner. Kadranın dış halkasında kripto hiç sönmeyen bir ışık gibi akar.',
    draw(g) {
      d2_sky(g, 0.18, { px: -110 });
      d2_stamp(g, '03:30', 0.18);
      d2_kick(g, 'Kripto · canlı', 114, 176, D2.orange);
      d2_h(g, 'Canlı fiyatlar,', 106, 276, 78, D2.ink, { w: 800 });
      d2_grad(g, '7/24.', 98, 440, 176);
      const x = 405, y = 762, R = 178;
      d2_dial(g, x, y, R, { nums: 'card', numR: 54, numS: 22, bw: 20 });
      d2_cryptoRing(g, x, y, R + 20, 20.4, { lw: 3.5 });
      d2_hand(g, x, y, R, 3.5, { bw: 20, from: 3.0, len: 10, lw: 4, orb: 8 });
      d2_h(g, '03:30', x, y + 4, 60, D2.ink, { w: 800, a: 'center', ls: -1 });
      d2_pill(g, x, y + 58, 'Kripto canlı', { a: 'center', s: 19, c: D2.ink, dot: D2A.live, fill: 'rgba(10,16,44,0.85)', stroke: 'rgba(255,255,255,0.22)' });
      const [lx, ly] = d2_pt(x, y, R + 20, 21.2);
      d2_pill(g, lx + 18, ly + 18, 'Kripto · 7/24', { a: 'left', s: 18, c: D2.orange, fill: 'rgba(14,12,34,0.88)', stroke: hexA(D2.orange, 0.5) });
      addGlow(g, D2.orange, 1360, 520, 560, 0.14);
      d2_cryptoCard(g, 880, 128, 950, 878, '03:30');
    },
  },
  {
    time: '12–16 sn', title: 'Borsa: BIST ve Nasdaq',
    desc: 'Kadranda BIST (10:00–18:00) ve Nasdaq (16:30–23:00) seansları çizilir. Telefondaki BIST 100 ve Nasdaq 100 kartları dışarı süzülür, filtreler sırayla yanar.',
    draw(g) {
      d2_sky(g, 0.3, { px: -150 });
      d2_kick(g, 'Borsa · BIST ve Nasdaq', 114, 164, D2.orange);
      d2_h(g, '210 hisse,', 106, 258, 84, D2.ink, { w: 800 });
      d2_grad(g, 'tek listede.', 106, 350, 84);
      // the market day on the dial
      const x = 405, y = 682, R = 186, bw = 20;
      d2_dial(g, x, y, R, { nums: 'card', numR: 60, numS: 22, bw });
      d2_cryptoRing(g, x, y, R + 36, 5.2, { lw: 3, base: 0.32, span: 1.2 });
      d2_arc(g, x, y, R - bw / 2, 10, 18, D2.teal, 14, { glow: 16 });
      d2_arc(g, x, y, R + 15, 16.5, 23, D2.coral, 9, { glow: 14 });
      const [ox, oy] = d2_pt(x, y, R - bw / 2, 14.38);
      addGlow(g, D2.teal, ox, oy, 46, 0.9); g.fillStyle = '#EFFFFC'; g.beginPath(); g.arc(ox, oy, 7, 0, TAU); g.fill();
      d2_t(g, 'BIST', x, y - 72, 19, D2.teal, { w: 800, a: 'center', ls: 2 });
      d2_h(g, '108', x, y - 18, 50, D2.ink, { w: 800, a: 'center' });
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x - 54, y + 6, 108, 1.5);
      d2_t(g, 'NASDAQ', x, y + 40, 19, D2.coral, { w: 800, a: 'center', ls: 2 });
      d2_h(g, '102', x, y + 94, 50, D2.ink, { w: 800, a: 'center' });
      d2_legend(g, [[D2.teal, 'BIST 10:00–18:00'], [D2.coral, 'Nasdaq 16:30–23:00'], [D2.orange, 'Kripto 7/24']], 110, 1010, 19);
      // phone with the Borsa screen
      const PX = 880, PY = 46, PW = 470, PH = 990;
      addGlow(g, D2.teal, PX + PW / 2, 520, 520, 0.12);
      d2_phone(g, PX, PY, PW, PH, d2_borsaScreen);
      // index cards lifted out of the phone
      const CX0 = 1418, CW0 = 440;
      D2_IDX.forEach(([n, v, c, seed], i) => {
        const cy = 128 + i * 222, fy = PY + 12 + 154 + 56;
        g.save(); g.setLineDash([4, 7]); g.strokeStyle = hexA(D2.orange, 0.6); g.lineWidth = 1.8;
        g.beginPath(); g.moveTo(PX + PW + 4, fy); g.bezierCurveTo(PX + PW + 40, fy, CX0 - 36, cy + 95, CX0, cy + 95); g.stroke(); g.restore();
        if (!i) { addGlow(g, D2.orange, PX + PW + 4, fy, 30, 0.9); g.fillStyle = '#FFF4E2'; g.beginPath(); g.arc(PX + PW + 4, fy, 5, 0, TAU); g.fill(); }
        d2_acard(g, CX0, cy, CW0, 190, 24);
        d2_u(g, n, CX0 + 30, cy + 52, 24, D2A.ink, { w: 700 });
        d2_chg(g, c, CX0 + CW0 - 28, cy + 44, 19);
        d2_u(g, v, CX0 + 30, cy + 116, 50, D2A.ink, { w: 700 });
        d2_spark(g, CX0 + 30, cy + 132, CW0 - 60, 40, seed, true, { lw: 2.4, fill: true });
      });
      // filters and search
      const chips = [['Favoriler', 'star'], ['Popüler', 'sel'], ['Yükselenler'], ['Düşenler']];
      chips.forEach(([l, k], i) => {
        const cx = CX0 + (i % 2) * 226, cy = 628 + Math.floor(i / 2) * 76, w = 214, h = 58;
        rr(g, cx, cy - h / 2, w, h, h / 2);
        g.fillStyle = k === 'sel' ? '#FFFFFF' : 'rgba(12,18,48,0.82)'; g.fill();
        if (k !== 'sel') { g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1.5; g.stroke(); }
        const tw = d2_uw(g, l, 21, 700) + (k === 'star' ? 30 : 0), tx = cx + w / 2 - tw / 2;
        if (k === 'star') d2_star(g, tx + 11, cy - 1, 12, D2.orange);
        d2_u(g, l, tx + (k === 'star' ? 30 : 0), cy + 8, 21, k === 'sel' ? D2A.ink : D2.ink, { w: 700 });
      });
      d2_card(g, CX0, 760, CW0, 64, 32, { fill: 'rgba(12,18,48,0.82)' });
      d2_mag(g, CX0 + 36, 790, 24, D2.soft);
      d2_u(g, 'Hisse adı ya da kodu ara…', CX0 + 66, 799, 20, D2.soft, { w: 500 });
    },
  },
  {
    time: '16–20 sn', title: 'Altın: Kapalıçarşı',
    desc: 'Kadranın gündüz yayı altın rengine döner: Kapalıçarşı. Krem kartta gram, çeyrek, ata… alış ve satış satırları akar; ₺ TL / $ USD düğmesi geçiş yapar.',
    draw(g) {
      d2_sky(g, 0.44, { px: -190 });
      d2_kick(g, 'Emtia · Kapalıçarşı canlı', 114, 164, D2.orange);
      d2_h(g, 'Kapalıçarşı', 106, 258, 84, D2.ink, { w: 800 });
      d2_grad(g, 'cebinde.', 106, 350, 84);
      // commodities chips
      let cx = 110;
      [['Au', 'Altın', [D2A.gold2, D2A.gold1]], ['Ag', 'Gümüş', ['#E9ECF5', '#A9B0C4']], ['', 'Petrol', ['#3A3F55', '#14161F']], ['+', 've fazlası', [D2.navy, '#3A4A92']]].forEach(([sym, l, gc]) => {
        const tw = d2_tw(g, l, 21, { w: 700 }), w = tw + 92, cy = 436;
        rr(g, cx, cy - 29, w, 58, 29); g.fillStyle = 'rgba(12,18,48,0.86)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1.5; g.stroke();
        const ig = g.createLinearGradient(cx + 10, cy - 20, cx + 50, cy + 20); ig.addColorStop(0, gc[0]); ig.addColorStop(1, gc[1]);
        g.fillStyle = ig; g.beginPath(); g.arc(cx + 31, cy, 20, 0, TAU); g.fill();
        if (sym) d2_u(g, sym, cx + 31, cy + 6, sym === '+' ? 22 : 15, sym === 'Au' ? '#5A3F00' : sym === 'Ag' ? '#3A3F55' : '#FFFFFF', { w: 700, a: 'center' });
        else { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(cx + 31, cy - 11); g.quadraticCurveTo(cx + 41, cy + 2, cx + 38, cy + 6); g.arc(cx + 31, cy + 5, 7, 0.1, Math.PI - 0.1); g.quadraticCurveTo(cx + 21, cy + 2, cx + 31, cy - 11); g.fill(); }
        d2_t(g, l, cx + 62, cy + 8, 21, D2.ink, { w: 700 });
        cx += w + 14;
      });
      // the dial: Kapalıçarşı by day, crypto all around
      const x = 405, y = 718, R = 162, bw = 20;
      d2_dial(g, x, y, R, { nums: 'card', numR: 54, numS: 22, bw, cardCol: D2A.gold2 });
      d2_cryptoRing(g, x, y, R + 32, 2.2, { lw: 3, base: 0.3, span: 1.0 });
      const ag = g.createConicGradient(d2_ang(9), x, y); ag.addColorStop(0, D2A.gold1); ag.addColorStop(10 / 24, D2A.gold2); ag.addColorStop(10 / 24 + 0.01, D2A.gold1);
      d2_arc(g, x, y, R - bw / 2, 9, 19, ag, 14, { glow: 18 });
      d2_t(g, 'Gram Altın', x, y - 54, 19, D2.soft, { w: 700, a: 'center' });
      d2_t(g, '₺6.510,83', x, y + 6, 44, D2.ink, { w: 800, a: 'center' });
      d2_t(g, '+0,40%', x, y + 50, 22, D2.teal, { w: 800, a: 'center' });
      d2_legend(g, [[D2A.gold2, 'Kapalıçarşı · gündüz'], [D2.orange, 'Kripto · 7/24']], 110, 1022, 19);
      addGlow(g, D2A.gold2, 1350, 520, 600, 0.12);
      d2_goldCard(g, 870, 64, 970, 952);
    },
  },
  {
    time: '20–24 sn', title: 'Kasam: Kadran kasaya döner',
    desc: 'Kadranın çevresine kilit cıvataları dizilir, ibre bir şifre çarkı gibi döner ve kasa açılır: ortada ₺1.250.430. Uygulamanın Kasam kartı sağdan yükselir.',
    draw(g) {
      d2_sky(g, 0.58, { px: -230, gx: 600 });
      d2_stamp(g, '05:30', 0.58);
      const x = 600, y = 566, R = 318, bw = 26;
      // vault door ring with bolts
      g.save(); g.shadowColor = 'rgba(2,4,18,0.6)'; g.shadowBlur = 80; g.shadowOffsetY = 30;
      g.beginPath(); g.arc(x, y, R + 46, 0, TAU); g.fillStyle = 'rgba(10,14,40,0.82)'; g.fill(); g.restore();
      const rg = g.createLinearGradient(x - R, y - R, x + R, y + R); rg.addColorStop(0, 'rgba(255,255,255,0.45)'); rg.addColorStop(1, 'rgba(255,255,255,0.08)');
      g.strokeStyle = rg; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, R + 46, 0, TAU); g.stroke();
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU + TAU / 48, bx = x + Math.cos(a) * (R + 24), by = y + Math.sin(a) * (R + 24);
        const bg = g.createRadialGradient(bx - 3, by - 3, 1, bx, by, 9); bg.addColorStop(0, 'rgba(255,255,255,0.7)'); bg.addColorStop(1, 'rgba(160,170,220,0.18)');
        g.fillStyle = bg; g.beginPath(); g.arc(bx, by, 7.5, 0, TAU); g.fill();
      }
      d2_dial(g, x, y, R, { bw, nums: false });
      d2_hand(g, x, y, R, 5.5, { bw, from: 3.4, len: 10, trailA: 0.7 });
      d2_lock(g, x, y - 120, 56, D2.orange, '#121A46');
      d2_t(g, '₺1.250.430', x, y + 22, 78, D2.ink, { w: 800, a: 'center' });
      g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(x - 70, y + 62, 140, 1.5);
      d2_t(g, 'tek ekranda, güvenle', x, y + 104, 23, D2.orange, { w: 700, a: 'center' });
      // right column
      const X = 1086;
      d2_kick(g, 'Kasam', X + 4, 190, D2.orange);
      d2_h(g, 'Tüm varlıkların,', X - 4, 282, 74, D2.ink, { w: 800, max: 760 });
      d2_grad(g, 'tek kasada.', X - 4, 366, 74);
      // the app's Kasam banner
      const bx = X, by = 450, bwid = 756, bh = 340;
      d2_acard(g, bx, by, bwid, bh, 30);
      d2_u(g, 'Kasam', bx + 40, by + 70, 38, D2A.ink, { w: 700 });
      const L1 = 'Altın, döviz ve kişisel', L2 = 'varlıklarını tek ekranda', L3a = 'güvenle', L3b = ' takip et.';
      d2_u(g, L1, bx + 40, by + 118, 23, '#3A3E4C', { w: 500 });
      d2_u(g, L2, bx + 40, by + 150, 23, '#3A3E4C', { w: 500 });
      d2_u(g, L3a, bx + 40, by + 182, 23, '#B07A0C', { w: 700 });
      d2_u(g, L3b, bx + 40 + d2_uw(g, L3a, 23, 700), by + 182, 23, '#3A3E4C', { w: 500 });
      const btw = d2_uw(g, 'Kasamı Gör', 21, 700) + 64, btg = g.createLinearGradient(bx + 40, 0, bx + 40 + btw, 0);
      btg.addColorStop(0, D2A.gold2); btg.addColorStop(1, D2A.gold1);
      rr(g, bx + 40, by + 232, btw, 60, 30); g.fillStyle = btg; g.fill();
      d2_u(g, 'Kasamı Gör', bx + 40 + btw / 2, by + 270, 21, '#FFFFFF', { w: 700, a: 'center' });
      // banner art: a small vault and a phone with the total
      const vx = bx + 486, vy = by + 206, vr = 88;
      const vg = g.createLinearGradient(vx - vr, vy - vr, vx + vr, vy + vr); vg.addColorStop(0, '#F8E3A6'); vg.addColorStop(1, D2A.gold1);
      g.fillStyle = vg; g.beginPath(); g.arc(vx, vy, vr, 0, TAU); g.fill();
      g.fillStyle = '#FFF4D6'; g.beginPath(); g.arc(vx, vy, vr * 0.7, 0, TAU); g.fill();
      g.strokeStyle = D2A.gold1; g.lineWidth = 6; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; g.beginPath(); g.moveTo(vx, vy); g.lineTo(vx + Math.cos(a) * vr * 0.5, vy + Math.sin(a) * vr * 0.5); g.stroke(); }
      g.fillStyle = D2A.gold1; g.beginPath(); g.arc(vx, vy, 12, 0, TAU); g.fill();
      d2_phone(g, bx + 596, by - 40, 150, 300, (p, sw, sh) => {
        d2_u(p, 'Kasam', 14, 52, 13, D2A.sub, { w: 600 });
        d2_u(p, '₺1.250.430', 14, 80, 20, D2A.ink, { w: 700 });
        [[D2A.gold2, 'Altın'], [D2.teal, 'Döviz'], [D2.coral, 'Kişisel']].forEach(([c, l], i) => {
          const yy = 112 + i * 40;
          rr(p, 10, yy - 16, sw - 20, 32, 9); p.fillStyle = '#FFFFFF'; p.fill();
          p.fillStyle = c; p.beginPath(); p.arc(26, yy, 7, 0, TAU); p.fill();
          d2_u(p, l, 40, yy + 4, 11, D2A.ink, { w: 600 });
          rr(p, sw - 52, yy - 3, 32, 6, 3); p.fillStyle = '#E3E5EC'; p.fill();
        });
      }, { page: '#F6F7FB' });
      // what goes in
      let cx = X;
      [['Altın', D2A.gold2], ['Döviz', D2.teal], ['Kişisel varlıklar', D2.coral]].forEach(([l, c]) => { cx += d2_pill(g, cx, 862, l, { s: 21, dot: c, fill: 'rgba(12,18,48,0.7)' }) + 14; });
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz',
    desc: 'İbre 06:00\'ya varınca alarm çalar, bildirim yukarıdan düşer. Dört alt kadran sırayla açılır: hisse analizi, teknik analiz, fiyat tahmini, sinyal alarmları.',
    draw(g) {
      const HZ = 968, mx = 1330, my = 512, R = 410, bw = 30;
      d2_sky(g, 0.76, { px: -260, gx: mx, hz: HZ });
      d2_sun(g, mx, HZ + 52, 92, HZ);
      d2_sea(g, HZ, 0.6, mx);
      d2_stamp(g, '06:00', 0.76);
      d2_dial(g, mx, my, R, { bw, faceA: 1.15 });
      d2_hand(g, mx, my, R, 6, { bw, from: 4.6, len: 8, trailA: 0.7 });
      // the alarm rings at 06:00
      const [ax, ay] = d2_pt(mx, my, R - bw / 2, 6);
      [64, 48, 34].forEach((rad, i) => { g.strokeStyle = hexA(D2.orange, [0.22, 0.4, 0.7][i]); g.lineWidth = 2.5; g.beginPath(); g.arc(ax, ay, rad, -1.1, 1.1); g.stroke(); g.beginPath(); g.arc(ax, ay, rad, Math.PI - 1.1, Math.PI + 1.1); g.stroke(); });
      d2_bell(g, ax, ay - 44, 30, D2.orange);
      const sr = 128, subs = [[mx, my - 236], [mx + 236, my], [mx, my + 236], [mx - 236, my]];
      subs.forEach(([cx, cy]) => {
        d2_disc(g, cx, cy, sr, { fill: 'rgba(7,10,32,0.88)' });
        for (let t = 0; t < 60; t++) {
          const a = t / 60 * TAU, l = t % 5 ? 4 : 8;
          g.strokeStyle = t % 5 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.4)'; g.lineWidth = 1.3;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * (sr - 6), cy + Math.sin(a) * (sr - 6)); g.lineTo(cx + Math.cos(a) * (sr - 6 - l), cy + Math.sin(a) * (sr - 6 - l)); g.stroke();
        }
      });
      const title = (s, cx, cy) => d2_t(g, d2_up(s), cx, cy, 15, D2.orange, { w: 800, a: 'center', ls: 2, max: 196 });
      { // hisse analizi: bars
        const [cx, cy] = subs[0];
        title('Hisse analizi', cx, cy - 66);
        [0.45, 0.62, 0.5, 0.74, 0.68, 0.9].forEach((v, k) => {
          const bx = cx - 78 + k * 28, bh = v * 84;
          rr(g, bx, cy + 52 - bh, 18, bh, 5); g.fillStyle = k === 5 ? D2.teal : hexA(D2.teal, 0.45); g.fill();
        });
        g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(cx - 84, cy + 54, 168, 1.5);
      }
      { // teknik analiz: candles with an average line
        const [cx, cy] = subs[1];
        title('Teknik analiz', cx, cy - 66);
        const q = [0.3, 0.46, 0.38, 0.58, 0.5, 0.68, 0.6, 0.78, 0.72, 0.86]; const mids = [];
        for (let k = 0; k < 9; k++) {
          const o = q[k], v = q[k + 1];
          const px = cx - 84 + k * 21, Y = q => cy + 56 - q * 100, up = v >= o;
          g.fillStyle = up ? D2.teal : D2.coral;
          g.fillRect(px - 1, Y(Math.max(o, v) + 0.06), 2, Y(Math.min(o, v) - 0.06) - Y(Math.max(o, v) + 0.06));
          g.fillRect(px - 6, Y(Math.max(o, v)), 12, Math.max(3, Math.abs(Y(o) - Y(v))));
          mids.push([px, Y((o + v) / 2)]);
        }
        g.save(); g.shadowColor = D2.orange; g.shadowBlur = 8; g.strokeStyle = D2.orange; g.lineWidth = 2.5; g.beginPath(); smoothPath(g, mids); g.stroke(); g.restore();
      }
      { // fiyat tahmini: line, then a dashed projection in a soft cone
        const [cx, cy] = subs[2];
        title('Fiyat tahmini', cx, cy - 66);
        const s = [0.2, 0.34, 0.28, 0.46, 0.4, 0.58, 0.52, 0.66];
        const pts = s.map((v, k) => [cx - 96 + k * 16, cy + 44 - v * 90]);
        const e = pts[pts.length - 1];
        g.fillStyle = hexA(D2.peri, 0.18); g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(cx + 92, e[1] - 46); g.lineTo(cx + 92, e[1] + 30); g.closePath(); g.fill();
        g.strokeStyle = D2.ink; g.lineWidth = 2.6; g.lineJoin = 'round'; g.beginPath(); smoothPath(g, pts); g.stroke();
        g.setLineDash([6, 6]); g.strokeStyle = D2.peri; g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(cx + 92, e[1] - 8); g.stroke(); g.setLineDash([]);
        addGlow(g, D2.peri, e[0], e[1], 26, 0.8); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(e[0], e[1], 4.5, 0, TAU); g.fill();
      }
      { // sinyal alarmları: a bell with signal waves
        const [cx, cy] = subs[3];
        title('Sinyal alarmları', cx, cy - 66);
        d2_bell(g, cx, cy + 6, 70, D2.ink);
        g.strokeStyle = D2.orange; g.lineWidth = 3; g.lineCap = 'round';
        [40, 56].forEach(rad => { g.beginPath(); g.arc(cx, cy + 2, rad, -0.6, 0.6); g.stroke(); g.beginPath(); g.arc(cx, cy + 2, rad, Math.PI - 0.6, Math.PI + 0.6); g.stroke(); });
      }
      d2_appIcon(g, mx, my, 96, { rim: 'rgba(255,255,255,0.25)' });
      // left column: the notification, the headline, news and the app's nav
      const nx = 100, ny = 92, nw = 740, nh = 136;
      g.save(); g.shadowColor = 'rgba(2,4,18,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
      rr(g, nx, ny, nw, nh, 30); g.fillStyle = 'rgba(248,247,252,0.94)'; g.fill(); g.restore();
      d2_appIcon(g, nx + 64, ny + nh / 2, 72, { shadow: false });
      d2_u(g, 'Kripto724', nx + 122, ny + 40, 19, D2A.sub, { w: 600 });
      d2_u(g, 'şimdi', nx + nw - 30, ny + 40, 17, D2A.sub, { w: 500, a: 'right' });
      d2_u(g, 'Fiyat alarmı', nx + 122, ny + 76, 23, D2A.ink, { w: 700 });
      d2_u(g, 'BTC/USDT $80.000 seviyesine ulaştı.', nx + 122, ny + 108, 21, '#3A3E4C', { w: 500 });
      d2_kick(g, 'Alarm · analiz · haber', 114, 330, D2.orange);
      d2_h(g, 'Sen uyurken,', 106, 420, 78, D2.ink, { w: 800 });
      d2_grad(g, 'alarmın nöbette.', 106, 508, 78, { max: 760 });
      // a news card from Haberler
      const kx = 100, ky = 586, kw = 740, kh = 150;
      d2_acard(g, kx, ky, kw, kh, 26);
      const tg = g.createLinearGradient(kx + 20, ky + 20, kx + 190, ky + kh - 20); tg.addColorStop(0, D2.navy); tg.addColorStop(1, '#3B3F84');
      rr(g, kx + 20, ky + 20, 170, kh - 40, 16); g.fillStyle = tg; g.fill();
      g.save(); rr(g, kx + 20, ky + 20, 170, kh - 40, 16); g.clip();
      const np = d2_shape(walk(9, 16, 0, 0.04), 1.06), nlo = Math.min(...np), nhi = Math.max(...np);
      g.strokeStyle = D2.orange; g.lineWidth = 3; g.beginPath(); smoothPath(g, np.map((v, k) => [kx + 34 + k * 9.5, ky + kh - 40 - (v - nlo) / (nhi - nlo) * 60])); g.stroke();
      g.restore();
      rr(g, kx + 214, ky + 26, d2_uw(g, 'Haberler', 15, 700) + 22, 28, 14); g.fillStyle = D2A.cntBg; g.fill();
      d2_u(g, 'Haberler', kx + 225, ky + 45, 15, D2A.cnt, { w: 700 });
      d2_u(g, 'Günün piyasa özeti', kx + 214, ky + 92, 25, D2A.ink, { w: 700 });
      rr(g, kx + 214, ky + 108, 380, 10, 5); g.fillStyle = '#E6E8EF'; g.fill();
      rr(g, kx + 214, ky + 126, 250, 10, 5); g.fill();
      d2_nav(g, 100, 776, 740, 104, 2, { card: true, r: 30, s: 14, icon: 64, badge: true });
    },
  },
  {
    time: '29–34 sn', title: 'Bağla, indirimini seç',
    desc: 'Binance, Bitget ve MEXC\'den ışık hatları kadrana bağlanır, "%10 indirim" etiketi parlar. Uygulamanın "Hesabını Bağla" ve "Kripto Hakkında Her Şey" kartları kayar.',
    draw(g) {
      const HZ = 968;
      d2_sky(g, 0.88, { px: -300, gx: 360, hz: HZ });
      d2_sun(g, 360, HZ, 96, HZ);
      d2_sea(g, HZ, 0.88, 360);
      d2_stamp(g, '06:30', 0.88);
      d2_kick(g, 'Bağla · indirim · öğren', 114, 156, D2.orange);
      d2_h(g, 'Hesabını bağla,', 106, 244, 74, D2.ink, { w: 800 });
      d2_grad(g, 'indirimini seç.', 106, 328, 74);
      // hub: the dial with the app icon, three exchanges wired in
      const x = 680, y = 640, R = 190, bw = 20;
      const ex = [['Binance', 210, 480], ['Bitget', 168, 640], ['MEXC', 210, 800]];
      d2_dial(g, x, y, R, { bw, nums: false });
      d2_hand(g, x, y, R, 6.5, { bw, from: 5.2, len: 6, lw: 4, orb: 8 });
      g.save(); g.globalCompositeOperation = 'lighter';
      ex.forEach(([n, sx, sy], i) => {
        const tx = x - 72, ty = y + (i - 1) * 36, mx = (sx + 80 + tx) / 2, myy = (sy + ty) / 2 + (1 - i) * 30;
        const gr = g.createLinearGradient(sx, sy, tx, ty); gr.addColorStop(0, hexA(D2.teal, 0.25)); gr.addColorStop(1, hexA(D2.orange, 0.95));
        g.strokeStyle = gr; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 80, sy); g.quadraticCurveTo(mx, myy, tx, ty); g.stroke();
        const t = 0.42, u = 1 - t, px = u * u * (sx + 80) + 2 * u * t * mx + t * t * tx, py = u * u * sy + 2 * u * t * myy + t * t * ty;
        addGlow(g, D2.orange, px, py, 28, 0.9);
      });
      g.restore();
      ex.forEach(([n, sx, sy]) => {
        d2_pill(g, sx, sy, n, { a: 'center', s: 26, f: D2F, w: 700, h: 66, padX: 30, fill: 'rgba(12,18,48,0.88)', stroke: 'rgba(255,255,255,0.3)' });
      });
      // %10 tag on Binance
      d2_pill(g, 290, 418, '%10 indirim', { a: 'center', s: 20, w: 800, c: '#0A0A0A', fill: D2.orange, stroke: false, h: 42 });
      addGlow(g, D2.orange, 290, 418, 90, 0.35);
      d2_appIcon(g, x, y, 132, { rim: 'rgba(255,255,255,0.28)' });
      // right column: the app's banners
      const bx = 1010, bwid = 830;
      d2_acard(g, bx, 130, bwid, 250, 30);
      d2_u(g, 'Kripto Hesabını Bağla', bx + 40, 194, 34, D2A.ink, { w: 700 });
      d2_u(g, 'Binance, Bitget ve MEXC hesaplarını', bx + 40, 238, 22, '#3A3E4C', { w: 500 });
      d2_u(g, 'Kripto724\'e kolayca bağla', bx + 40, 268, 22, '#3A3E4C', { w: 500 });
      const b1 = d2_uw(g, 'Bağla', 21, 700) + 92;
      rr(g, bx + 40, 296, b1, 58, 29); g.fillStyle = D2A.ink; g.fill();
      d2_u(g, 'Bağla', bx + 72, 332, 21, '#FFFFFF', { w: 700 });
      d2_arrow(g, bx + 40 + b1 - 34, 325, 10, '#FFFFFF', 3.4);
      { // link icon
        const lx = bx + bwid - 130, ly = 255;
        addGlow(g, D2.orange, lx, ly, 120, 0.16);
        g.save(); g.translate(lx, ly); g.rotate(-Math.PI / 4); g.lineWidth = 14; g.strokeStyle = D2.orange;
        rr(g, -78, -26, 92, 52, 26); g.stroke(); g.strokeStyle = D2A.ink; rr(g, -14, -26, 92, 52, 26); g.stroke(); g.restore();
      }
      // marquee strip
      g.save(); rr(g, bx, 402, bwid, 70, 35); g.fillStyle = '#FFFFFF'; g.fill(); g.clip();
      let mxq = bx + 30;
      for (let rep = 0; rep < 2; rep++) {
        mxq += logoH(g, mxq, 447, 26) + 20;
        d2_u(g, 'Komisyon İndirimi Seç', mxq, 446, 21, D2A.ink, { w: 700 }); mxq += d2_uw(g, 'Komisyon İndirimi Seç', 21, 700) + 18;
        g.fillStyle = D2A.sub; g.beginPath(); g.arc(mxq, 438, 3.5, 0, TAU); g.fill(); mxq += 18;
        const cw2 = d2_uw(g, 'BINANCE %10 indirim', 19, 700) + 30;
        rr(g, mxq, 419, cw2, 36, 18); g.fillStyle = D2.orange; g.fill();
        d2_u(g, 'BINANCE %10 indirim', mxq + 15, 444, 19, '#0A0A0A', { w: 700 }); mxq += cw2 + 18;
        g.fillStyle = D2A.sub; g.beginPath(); g.arc(mxq, 438, 3.5, 0, TAU); g.fill(); mxq += 18;
        d2_u(g, 'Bitget…', mxq, 446, 21, D2A.ink, { w: 700 }); mxq += d2_uw(g, 'Bitget…', 21, 700) + 40;
      }
      const fg = g.createLinearGradient(bx + bwid - 110, 0, bx + bwid, 0); fg.addColorStop(0, 'rgba(255,255,255,0)'); fg.addColorStop(1, '#FFFFFF');
      g.fillStyle = fg; g.fillRect(bx + bwid - 110, 402, 110, 70);
      g.restore();
      // Kripto Hakkında Her Şey
      d2_acard(g, bx, 496, bwid, 380, 30);
      d2_u(g, 'Kripto Hakkında Her Şey', bx + 40, 558, 34, D2A.ink, { w: 700 });
      [[['#24346E', '#3B3F84'], 'coin'], [['#1B2D55', '#2B6F78'], 'chart'], [['#3A2450', '#B4566A'], 'shield']].forEach(([gc, kind], i) => {
        const tx = bx + 40 + i * 258, ty = 586, tw = 238, th = 160;
        const tg = g.createLinearGradient(tx, ty, tx + tw, ty + th); tg.addColorStop(0, gc[0]); tg.addColorStop(1, gc[1]);
        rr(g, tx, ty, tw, th, 18); g.fillStyle = tg; g.fill();
        g.save(); rr(g, tx, ty, tw, th, 18); g.clip();
        if (kind === 'coin') { d2_coinI(g, tx + 70, ty + 80, 40, 'BTC'); d2_coinI(g, tx + 130, ty + 104, 30, 'ETH'); }
        else if (kind === 'chart') { g.strokeStyle = D2.teal; g.lineWidth = 4; g.beginPath(); smoothPath(g, d2_shape(walk(4, 12, 0, 0.05), 1.15).map((v, k) => [tx + 24 + k * 17, ty + 130 - (v - 0.85) * 220])); g.stroke(); }
        else { g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(tx + 96, ty + 44); g.lineTo(tx + 140, ty + 60); g.lineTo(tx + 136, ty + 104); g.quadraticCurveTo(tx + 124, ty + 132, tx + 96, ty + 144); g.quadraticCurveTo(tx + 68, ty + 132, tx + 56, ty + 104); g.lineTo(tx + 52, ty + 60); g.closePath(); g.fill(); check(g, tx + 96, ty + 94, 24, D2.night, 5); }
        g.restore();
        d2_play(g, tx + tw - 40, ty + th - 38, 20);
      });
      const b2 = d2_uw(g, 'Şimdi Keşfet', 21, 700) + 92;
      rr(g, bx + 40, 776, b2, 58, 29); g.fillStyle = D2A.ink; g.fill();
      d2_u(g, 'Şimdi Keşfet', bx + 72, 812, 21, '#FFFFFF', { w: 700 });
      d2_arrow(g, bx + 40 + b2 - 34, 805, 10, '#FFFFFF', 3.4);
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış: Günaydın',
    desc: 'Güneş doğar, kadranın çizgileri ışınlara dönüşür. Resmî logo, "Ücretsiz ailemize katılın!" ve kripto724.com belirir; denizin üstünde küçük yasal not.',
    draw(g) {
      const HZ = 900, sx = CX;
      d2_sky(g, 1, { hz: HZ, px: -330 });
      d2_stamp(g, '07:00', 1, 'Günaydın');
      g.save(); g.beginPath(); g.rect(0, 0, W, HZ); g.clip();
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI + 0.2 + i * (Math.PI - 0.4) / 8, w = 0.05;
        const gr = g.createRadialGradient(sx, HZ, 120, sx, HZ, 1000); gr.addColorStop(0, hexA('#FFE2B8', 0.16)); gr.addColorStop(1, hexA('#FFE2B8', 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(sx, HZ); g.arc(sx, HZ, 1000, a - w, a + w); g.closePath(); g.fill();
      }
      g.restore();
      for (let i = 0; i < 48; i++) {
        const a = Math.PI + i / 48 * Math.PI, big = i % 4 === 0;
        if (a <= Math.PI + 0.01 || a >= TAU - 0.01) continue;
        g.strokeStyle = big ? 'rgba(255,248,232,0.85)' : 'rgba(255,248,232,0.4)'; g.lineWidth = big ? 3 : 1.6; g.lineCap = 'round';
        const r0 = 160, r1 = big ? 196 : 180;
        g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, HZ + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, HZ + Math.sin(a) * r1); g.stroke();
      }
      d2_sun(g, sx, HZ, 122, HZ);
      d2_sea(g, HZ, 1, sx);
      // the official logo, white on the night-blue top of the sky
      addGlow(g, '#0B1026', CX, 236, 360, 0.5);
      logo(g, CX, 236, 262, { ink: '#FFFFFF' });
      d2_two(g, 'Ücretsiz ailemize ', 'katılın!', CX, 500, 74, { shadow: 'rgba(20,10,40,0.45)', w: 800 });
      // address button
      const lab = 'kripto724.com', bf = { f: D2F, w: 700, s: 44, ls: -0.5 };
      const tw = measure(g, lab, bf), bwid = tw + 52 + 24 + 64 + 14, bx = CX - bwid / 2, by = 560, bh = 92;
      addGlow(g, D2.orange, CX, by + bh / 2, 520, 0.3);
      g.save(); g.shadowColor = 'rgba(40,10,40,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
      rr(g, bx, by, bwid, bh, bh / 2); g.fillStyle = '#FFF8F0'; g.fill(); g.restore();
      text(g, lab, bx + 52, by + bh / 2 + 15, { ...bf, a: 'left', c: D2.night });
      g.fillStyle = D2.orange; g.beginPath(); g.arc(bx + bwid - 14 - 32, by + bh / 2, 32, 0, TAU); g.fill();
      d2_arrow(g, bx + bwid - 46, by + bh / 2, 13, '#0A0A0A', 4);
      d2_t(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1040, 20, 'rgba(246,242,251,0.74)', { w: 500, a: 'center' });
    },
  },
];

function d2_paper(g, bw, bh) {
  const gr = g.createLinearGradient(0, 0, 0, bh); gr.addColorStop(0, '#0A0F24'); gr.addColorStop(1, '#0D1230');
  g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
  const rg = g.createRadialGradient(bw * 0.8, bh + 200, 0, bw * 0.8, bh + 200, 1600);
  rg.addColorStop(0, hexA(D2.orange, 0.1)); rg.addColorStop(1, hexA(D2.orange, 0));
  g.fillStyle = rg; g.fillRect(0, 0, bw, bh);
  const r = mulberry32(99);
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(230,228,255,${0.04 + r() * 0.16})`;
    g.beginPath(); g.arc(r() * bw, r() * bh, 0.6 + r() * 1.3, 0, TAU); g.fill();
  }
}

window.DESIGN = {
  id: 2, name: '7/24 Saat',
  concept: 'Piyasa hiç durmuyor, kripto724 de. Film tek bir 24 saatlik kadranın etrafında akar: turuncu ibre gece 03:00\'ten gün doğumuna ilerler, kadran sırayla kripto, BIST, Nasdaq ve Kapalıçarşı saatlerini gösterir; gökyüzü lacivertten şafağa döner.',
  board: { bg: '#0A0F24', ink: '#F6F2FB', soft: '#A9A6CC', accent: '#F7931A', line: 'rgba(169,166,204,0.22)', display: { f: D2F, w: 800, ls: -3 }, text: { f: D2T, w: 500 }, badgeInk: '#0A0F24', paper: d2_paper },
  extraFonts: ['Inter', 'Poppins'],
  palette: [['#0B1026', 'Gece'], ['#24346E', 'Lacivert'], ['#F7931A', 'Turuncu'], ['#FF7A59', 'Şafak'], ['#3DD9C1', 'Turkuaz']],
  fonts: ['Sora 700 / 800', 'Manrope · Inter (uygulama)'],
  motion: ['İbre süpürmesi her 2 sn\'lik vuruşta kesme', 'Geceden şafağa gökyüzü, yıldız parallax', 'Uygulama kartları camın arkasından yükselir'],
  music: 'ambient pop, 120 BPM, saat tıkırtısı ritmi; kapanışta sıcak synth akoru',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d2_init,
  scenes: D2_SCENES,
};
