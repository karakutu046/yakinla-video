'use strict';
/* TASARIM 03 · ALTIN SERİ — kripto724
 * Private banking meets a luxury magazine, now built around the real kripto724 app:
 * deep black and charcoal, real-looking gold foil (multi-stop gradients, bevel light,
 * light sweeps), brand orange #F7931A as the second metal (logo bar, folio rules, "7/24",
 * "%10", "katılın!", alarm line, CTA edge), ivory Playfair headlines with italic emphasis,
 * hairline rules, roman-numeral folios and gold dust. The app's own screens appear as
 * luxurious cards with the exact app data (crypto table, borsa list, Kapalıçarşı table as
 * an engraved gold plate, Kasam ₺1.250.430). Official logo only via logo() / logoH().
 * Playfair has no ₺ glyph: every lira sign is set in Manrope or Inter. Arrows are drawn. */

const D3 = {
  k: '#0B0A08', coal: '#1C1914', au: '#D4AF37', or: '#F7931A', champ: '#F3E5AB', iv: '#F7F2E8',
  soft: '#A79E8B', dim: '#6E6656', faint: '#3A342A', deep: '#9C7A26', bronze: '#6B5220', hi: '#FFF6D6',
  up: '#62D394', dn: '#F08378', live: '#10B981',
};
const D3_PF = 'Playfair Display', D3_MR = 'Manrope', D3_UI = 'Inter';
// gold leaf: two light/dark cycles with hot highlights
const D3_FOIL = [[0, '#7A5B17'], [0.1, '#B68F2E'], [0.22, '#EBCB72'], [0.3, '#FFF3C4'], [0.38, '#E2BF5A'], [0.52, '#A47E24'],
  [0.62, '#C79F3C'], [0.74, '#F4DD8E'], [0.82, '#FFF0BC'], [0.9, '#C9A240'], [1, '#86661C']];
// brand-orange leaf (the logo bar's colour, polished)
const D3_OFOIL = [[0, '#8A4300'], [0.12, '#C9690A'], [0.26, '#F7931A'], [0.36, '#FFA53F'], [0.44, '#FFC175'], [0.54, '#F9A23A'],
  [0.68, '#D97A0C'], [0.8, '#FFA640'], [0.9, '#F7931A'], [1, '#9A4C02']];
// a calmer leaf for large brushed plates (keeps engraved type readable)
const D3_PLATE = [[0, '#B48C2E'], [0.2, '#DDBB62'], [0.38, '#F1D891'], [0.5, '#E4C56E'], [0.66, '#CCA74A'], [0.82, '#E9CF83'], [1, '#B08A2E']];
const D3_T = { grain: null };

// app data (BRIEF v2 — exact)
const D3_CRYPTO = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
const D3_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%'], ['META', 'Meta Platforms', '$612,49', '−1,24%'],
  ['NVDA', 'NVIDIA', '$215,38', '−1,17%'], ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%'],
  ['TSLA', 'Tesla', '$404,22', '−0,79%'], ['MSFT', 'Microsoft', '$531,01', '−0,06%'], ['AAPL', 'Apple', '$343,83', '−0,94%'],
];
const D3_GOLD = [
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
// coin discs: colour, initial, letter colour (no real logos)
const D3_COIN = {
  BTC: ['#F7931A', 'B', '#FFFFFF'], ETH: ['#6264D9', 'E', '#FFFFFF'], XRP: ['#0A0A0A', 'X', '#FFFFFF'], BNB: ['#F3BA2F', 'B', '#1A1408'],
  SOL: ['SOL', 'S', '#FFFFFF'], DOGE: ['#C9A63A', 'D', '#1A1408'], ADA: ['#2F6BE0', 'A', '#FFFFFF'],
};

/* ───────────────────────── helpers ───────────────────────── */
const d3_up = s => s.toLocaleUpperCase('tr');
function d3_foil(g, x0, y0, x1, y1, stops = D3_FOIL) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) gr.addColorStop(p, c);
  return gr;
}
function d3_box(g, s, x, o) {
  const w = measure(g, s, o), a = o.a || 'center';
  return { w, xl: a === 'left' ? x : a === 'right' ? x - w : x - w / 2 };
}
// plain text shorthand (app-UI font by default)
function d3_t(g, s, x, y, sz, o = {}) {
  text(g, s, x, y, { f: o.f || D3_UI, w: o.w || 600, s: sz, a: o.a || 'left', c: o.c || D3.iv, ls: o.ls || 0, it: o.it });
}
// ivory text with a soft cast shadow
function d3_ivory(g, s, x, y, o) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = o.s * 0.2; g.shadowOffsetY = o.s * 0.04;
  text(g, s, x, y, { c: D3.iv, ...o }); g.restore();
}
// foil text: warm halo + dark under-edge, foil fill, bevel light, optional light sweep (0..1)
function d3_gold(g, s, x, y, o, f = {}) {
  const { w, xl } = d3_box(g, s, x, o);
  const top = y - o.s * 0.8, bot = y + o.s * 0.15;
  g.save();
  g.shadowColor = hexA(f.gc || D3.au, f.glow == null ? 0.3 : f.glow); g.shadowBlur = o.s * 0.45;
  text(g, s, x, y + Math.max(1.5, o.s * 0.02), { ...o, c: 'rgba(0,0,0,0.9)' });
  g.restore();
  const span = Math.max(w, o.s * 2.6);
  text(g, s, x, y, { ...o, c: d3_foil(g, xl, top, xl + span, bot + o.s * 0.35, f.stops) });
  const v = g.createLinearGradient(0, top, 0, bot);
  v.addColorStop(0, 'rgba(255,250,225,0.32)'); v.addColorStop(0.45, 'rgba(255,250,225,0)');
  v.addColorStop(0.62, 'rgba(50,30,0,0)'); v.addColorStop(1, 'rgba(50,30,0,0.4)');
  text(g, s, x, y, { ...o, c: v });
  if (f.sweep != null) {
    const bx = lerp(xl - o.s, xl + w + o.s, f.sweep);
    const sg = g.createLinearGradient(bx - o.s * 0.6, top, bx + o.s * 0.3, bot);
    sg.addColorStop(0, 'rgba(255,252,236,0)'); sg.addColorStop(0.5, `rgba(255,252,236,${f.sweepA || 0.9})`); sg.addColorStop(1, 'rgba(255,252,236,0)');
    text(g, s, x, y, { ...o, c: sg });
  }
  return w;
}
const d3_orange = (g, s, x, y, o, f = {}) => d3_gold(g, s, x, y, o, { stops: D3_OFOIL, gc: D3.or, glow: 0.35, sweepA: 0.5, ...f });
// hairline gold rule, fading at both ends (fade=false: solid)
function d3_hair(g, x0, y0, x1, y1, a = 0.7, lw = 1.5, fade = true) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, hexA(D3.au, fade ? 0 : a)); gr.addColorStop(0.15, hexA(D3.au, a));
  gr.addColorStop(0.5, hexA(D3.champ, a)); gr.addColorStop(0.85, hexA(D3.au, a)); gr.addColorStop(1, hexA(D3.au, fade ? 0 : a));
  g.strokeStyle = gr; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
}
function d3_lozenge(g, x, y, r, fill) {
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.68, y); g.lineTo(x, y + r); g.lineTo(x - r * 0.68, y); g.closePath();
  g.fillStyle = fill || d3_foil(g, x - r, y - r, x + r, y + r); g.fill();
}
// ── • ◆ • ── ornament (the centre lozenge in brand orange)
function d3_orn(g, x, y, w, a = 0.8) {
  d3_hair(g, x - w / 2, y, x - 30, y, a); d3_hair(g, x + 30, y, x + w / 2, y, a);
  d3_lozenge(g, x, y, 10, d3_foil(g, x - 10, y - 10, x + 10, y + 10, D3_OFOIL));
  g.fillStyle = hexA(D3.au, a);
  for (const d of [-20, 20]) { g.beginPath(); g.arc(x + d, y, 2.4, 0, TAU); g.fill(); }
}
// thin four-point star with anamorphic streak: a glint on gold
function d3_glint(g, x, y, r, a = 1, col) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a;
  glow(g, col || D3.au, x, y, r * 3.4, 0.5);
  glow(g, D3.hi, x, y, r * 1.2, 0.9);
  const gr = g.createLinearGradient(x - r * 6, 0, x + r * 6, 0);
  gr.addColorStop(0, 'rgba(255,236,190,0)'); gr.addColorStop(0.5, 'rgba(255,246,220,0.85)'); gr.addColorStop(1, 'rgba(255,236,190,0)');
  g.fillStyle = gr; g.fillRect(x - r * 6, y - 1, r * 12, 2);
  const q = r * 0.1;
  g.fillStyle = 'rgba(255,252,238,0.95)'; g.beginPath();
  g.moveTo(x, y - r); g.lineTo(x + q, y - q); g.lineTo(x + r * 0.75, y); g.lineTo(x + q, y + q);
  g.lineTo(x, y + r); g.lineTo(x - q, y + q); g.lineTo(x - r * 0.75, y); g.lineTo(x - q, y - q); g.closePath(); g.fill();
  g.restore();
}
// partial polyline (p: 0..1 of its length); returns the head point
function d3_poly(g, pts, p) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let d = L * clamp(p), head = pts[0];
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && d > 0; i++) {
    const t = Math.min(1, d / seg[i - 1]);
    head = [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
    g.lineTo(head[0], head[1]); d -= seg[i - 1];
  }
  g.stroke();
  return head;
}
// double gold frame with cut corners; p draws the outer line on from top centre (both ways)
function d3_frame(g, x, y, w, h, o = {}) {
  const c = o.c == null ? 22 : o.c, a = o.a == null ? 1 : o.a, p = o.p == null ? 1 : o.p, mx = x + w / 2;
  const half = [[mx, y], [x + w - c, y], [x + w, y + c], [x + w, y + h - c], [x + w - c, y + h], [mx, y + h]];
  const mirror = half.map(([px, py]) => [2 * mx - px, py]);
  g.save(); g.globalAlpha *= a;
  g.strokeStyle = d3_foil(g, x, y, x + w, y + h); g.lineWidth = o.lw || 2.5; g.lineJoin = 'miter';
  const h1 = d3_poly(g, half, p), h2 = d3_poly(g, mirror, p);
  const ia = o.inner == null ? clamp((p - 0.6) / 0.4) : o.inner;
  if (ia > 0) {
    const k = o.inset || 12, ci = Math.max(0, c - k * 0.4);
    g.globalAlpha *= ia; g.strokeStyle = hexA(D3.au, 0.45); g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x + k + ci, y + k); g.lineTo(x + w - k - ci, y + k); g.lineTo(x + w - k, y + k + ci); g.lineTo(x + w - k, y + h - k - ci);
    g.lineTo(x + w - k - ci, y + h - k); g.lineTo(x + k + ci, y + h - k); g.lineTo(x + k, y + h - k - ci); g.lineTo(x + k, y + k + ci); g.closePath(); g.stroke();
    if (o.orn !== false) for (const [px, py] of [[x + c * 0.5 + 2, y + c * 0.5 + 2], [x + w - c * 0.5 - 2, y + c * 0.5 + 2], [x + c * 0.5 + 2, y + h - c * 0.5 - 2], [x + w - c * 0.5 - 2, y + h - c * 0.5 - 2]]) d3_lozenge(g, px, py, 6);
  }
  g.restore();
  if (p < 1 && o.heads !== false) { d3_glint(g, h1[0], h1[1], 26); d3_glint(g, h2[0], h2[1], 26); }
}
// dark charcoal card with hairline gold border
function d3_card(g, x, y, w, h, o = {}) {
  const r = o.r == null ? 6 : o.r, a = o.a == null ? 0.45 : o.a;
  if (o.shadow !== false) {
    g.save(); g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = o.blur || 50; g.shadowOffsetY = (o.blur || 50) * 0.45;
    rr(g, x, y, w, h, r); g.fillStyle = D3.k; g.fill(); g.restore();
  }
  g.save(); rr(g, x, y, w, h, r);
  const gr = g.createLinearGradient(x, y, x + w * 0.35, y + h);
  gr.addColorStop(0, o.top || '#231F18'); gr.addColorStop(1, o.bot || '#100E0B');
  g.fillStyle = gr; g.fill();
  g.lineWidth = o.lw || 1.5; g.strokeStyle = hexA(D3.au, a); g.stroke();
  if (o.inner !== false) { rr(g, x + 8, y + 8, w - 16, h - 16, Math.max(0, r - 3)); g.lineWidth = 1; g.strokeStyle = hexA(D3.au, a * 0.38); g.stroke(); }
  g.restore();
}
// small letter-spaced capitals (Turkish upper case)
function d3_kick(g, s, x, y, o = {}) {
  text(g, d3_up(s), x, y, { f: D3_MR, w: o.w || 700, s: o.s || 20, ls: o.ls == null ? 5 : o.ls, a: o.a || 'left', c: o.c || D3.au });
}
// magazine folio: roman numeral, orange rule, chapter label (+ the horizontal kripto | 724 lockup on the right)
function d3_folio(g, num, label, brand = true) {
  const no = { f: D3_PF, w: 400, it: true, s: 36, a: 'left' }, fx = 190;
  text(g, num, fx, 92, { ...no, c: D3.au });
  const nw = measure(g, num, no);
  g.fillStyle = D3.or; g.fillRect(fx + nw + 20, 79, 56, 2);
  d3_kick(g, label, fx + nw + 94, 88, { s: 17, c: D3.soft, ls: 6 });
  if (brand) logoH(g, W - 110, 92, 30, { ink: hexA(D3.iv, 0.78), a: 'right' });
}
// deep black with a warm key-light pool
function d3_bg(g, o = {}) {
  g.fillStyle = D3.k; g.fillRect(0, 0, W, H);
  const lx = o.lx == null ? CX : o.lx, ly = o.ly == null ? CY : o.ly, lr = o.lr || 1050, a = o.a == null ? 1 : o.a;
  const gr = g.createRadialGradient(lx, ly, 0, lx, ly, lr);
  gr.addColorStop(0, `rgba(66,54,32,${0.62 * a})`); gr.addColorStop(0.45, `rgba(36,30,20,${0.45 * a})`); gr.addColorStop(1, 'rgba(11,10,8,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
// diagonal band of warm light crossing the frame (pos 0..1 left → right)
function d3_sweep(g, pos, a = 0.07, wd = 360, ang = 0.42) {
  g.save(); g.globalCompositeOperation = 'lighter';
  g.translate(lerp(-400, W + 400, pos), CY); g.rotate(ang);
  const gr = g.createLinearGradient(-wd, 0, wd, 0);
  gr.addColorStop(0, 'rgba(255,214,140,0)'); gr.addColorStop(0.5, `rgba(255,222,156,${a})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
  g.fillStyle = gr; g.fillRect(-wd, -H * 1.2, wd * 2, H * 2.4);
  g.restore();
}
// gold dust: bokeh discs + fine glittering specks (o.streak: slow-pan motion trails)
function d3_dust(g, seed, n = 160, o = {}) {
  const r = mulberry32(seed);
  const x0 = o.x0 || 0, x1 = o.x1 || W, y0 = o.y0 || 0, y1 = o.y1 || H;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < (o.bokeh == null ? 12 : o.bokeh); i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), rad = 16 + r() * 54;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, hexA(D3.au, 0.06)); gr.addColorStop(0.75, hexA(D3.au, 0.045)); gr.addColorStop(1, hexA(D3.au, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
  }
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), z = r();
    const rad = 0.6 + z * z * 2.4, a = (0.25 + r() * 0.6) * (o.a || 1);
    const col = r() < 0.3 ? D3.hi : r() < 0.6 ? D3.champ : D3.au;
    if (o.streak) {
      const len = o.streak * (0.3 + z);
      const sg = g.createLinearGradient(x - len, y, x, y);
      sg.addColorStop(0, hexA(col, 0)); sg.addColorStop(1, hexA(col, a * 0.6));
      g.strokeStyle = sg; g.lineWidth = rad * 1.4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - len, y + len * 0.08); g.lineTo(x, y); g.stroke();
    }
    g.fillStyle = hexA(col, a); g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
    if (rad > 2) glow(g, D3.au, x, y, rad * 7, 0.22 * a);
  }
  g.restore();
}
// film grain + vignette: the finishing pass of every frame
function d3_finish(g, o = {}) {
  if (D3_T.grain) { g.save(); g.globalAlpha = o.grain == null ? 1 : o.grain; g.fillStyle = g.createPattern(D3_T.grain, 'repeat'); g.fillRect(0, 0, W, H); g.restore(); }
  const v = g.createRadialGradient(CX, CY, o.vin || 520, CX, CY, 1180);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${o.va == null ? 0.6 : o.va})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// thin drawn arrow (no font has →): tail at (x, y)
function d3_arrow(g, x, y, len, col, lw = 2.5) {
  const k = 6 + lw * 2.4;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.moveTo(x + len - k, y - k * 0.75); g.lineTo(x + len, y); g.lineTo(x + len - k, y + k * 0.75); g.stroke();
  g.restore();
}
// currency sign in Manrope (Playfair has no ₺) + Playfair figures + smaller decimals; returns total width
function d3_money(g, cur, int, dec, x, y, o) {
  const s = o.s;
  const cr = { f: D3_MR, w: 600, s: s * 0.46, a: 'left' }, num = { f: D3_PF, w: o.w || 700, s, a: 'left', ls: o.ls || 0 }, dd = { ...num, s: s * 0.5 };
  const cw = measure(g, cur, cr), gap = s * 0.07, nw = measure(g, int, num), dw = dec ? measure(g, dec, dd) : 0;
  const total = cw + gap + nw + dw;
  const x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  text(g, cur, x0, y - s * (o.curUp == null ? 0.26 : o.curUp), { ...cr, c: o.cc || D3.au });
  if (o.gold) d3_gold(g, int, x0 + cw + gap, y, num, o.gf || {});
  else d3_ivory(g, int, x0 + cw + gap, y, { ...num, c: o.c || D3.iv });
  if (dec) text(g, dec, x0 + cw + gap + nw, y, { ...dd, c: o.dc || D3.champ });
  return total;
}
// smooth series from 1 to exactly `end` (seeded)
function d3_series(seed, n, end, vol) {
  const w = walk(seed, n, 0, vol), k = Math.pow(end / (w[n - 1] / w[0]), 1 / (n - 1));
  return w.map((v, i) => v / w[0] * Math.pow(k, i));
}
// text set along a circle, centred on angle a0 (−π/2 = top); fills the circle when o.fill
function d3_arcText(g, s, cx, cy, r, a0, o) {
  setFont(g, { ...o, ls: 0 });
  const chars = [...s], ws = chars.map(ch => g.measureText(ch).width);
  let total = ws.reduce((a, b) => a + b, 0) + (o.ls || 0) * chars.length;
  const extra = o.fill ? Math.max(0, (TAU * r - total) / chars.length) : 0;
  total += extra * chars.length;
  let a = a0 - total / r / 2;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.c || D3.au;
  chars.forEach((ch, i) => {
    const adv = ws[i] + (o.ls || 0) + extra, aa = a + adv / 2 / r;
    g.save(); g.translate(cx + Math.cos(aa) * r, cy + Math.sin(aa) * r); g.rotate(aa + Math.PI / 2); g.fillText(ch, 0, 0); g.restore();
    a += adv / r;
  });
  g.restore();
}

/* ── app-UI pieces, dressed for black & gold ── */
// change pill (+ green / − red, muted for the dark card); right-aligned at xr, centred on y. Returns width.
function d3_chg(g, s, xr, y, o = {}) {
  const sz = o.s || 20, up = s[0] === '+', f = { f: D3_UI, w: 700, s: sz };
  const tw = measure(g, s, f), px = sz * 0.6, h = sz * 1.6, w = tw + px * 2;
  const x = o.a === 'left' ? xr : xr - w;
  rr(g, x, y - h / 2, w, h, h / 2);
  g.fillStyle = up ? 'rgba(74,222,128,0.13)' : 'rgba(240,110,100,0.13)'; g.fill();
  g.lineWidth = 1; g.strokeStyle = up ? 'rgba(98,211,148,0.35)' : 'rgba(240,131,120,0.3)'; g.stroke();
  text(g, s, x + w / 2, y + sz * 0.36, { ...f, c: up ? D3.up : D3.dn });
  return w;
}
// "● CANLI" badge (green as in the app); right-aligned at xr unless o.a = 'left'. Returns width.
function d3_live(g, xr, y, label = 'CANLI', o = {}) {
  const sz = o.s || 17, f = { f: D3_UI, w: 700, s: sz, ls: 1.2 };
  const tw = measure(g, label, f), h = sz * 1.9, w = tw + sz * 2.5;
  const x = o.a === 'left' ? xr : xr - w;
  rr(g, x, y - h / 2, w, h, h / 2); g.fillStyle = 'rgba(16,185,129,0.13)'; g.fill();
  g.strokeStyle = 'rgba(16,185,129,0.4)'; g.lineWidth = 1; g.stroke();
  glow(g, D3.live, x + sz * 1.05, y, sz * 1.2, 0.55);
  g.fillStyle = D3.live; g.beginPath(); g.arc(x + sz * 1.05, y, sz * 0.3, 0, TAU); g.fill();
  text(g, label, x + sz * 1.7, y + sz * 0.36, { ...f, a: 'left', c: '#34D399' });
  return w;
}
// coin disc with the ticker's initial
function d3_coinIcon(g, x, y, r, sym) {
  const [c, l, ink] = D3_COIN[sym];
  let fill = c;
  if (c === 'SOL') { fill = g.createLinearGradient(x - r, y + r, x + r, y - r); fill.addColorStop(0, '#9945FF'); fill.addColorStop(1, '#19D3B5'); }
  g.beginPath(); g.arc(x, y, r, 0, TAU);
  g.fillStyle = fill; g.fill();
  const sh = g.createLinearGradient(0, y - r, 0, y + r); sh.addColorStop(0, 'rgba(255,255,255,0.24)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)');
  g.fillStyle = sh; g.fill();
  g.lineWidth = 1.5; g.strokeStyle = sym === 'XRP' ? hexA(D3.iv, 0.5) : 'rgba(255,255,255,0.2)'; g.stroke();
  text(g, l, x, y + r * 0.36, { f: D3_UI, w: 700, s: r * 1.02, c: ink });
}
// stock disc: neutral, ticker inside
function d3_tickIcon(g, x, y, r, t) {
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#26211A'; g.fill();
  g.lineWidth = 1.2; g.strokeStyle = hexA(D3.au, 0.45); g.stroke();
  const o = fit(g, t, { f: D3_UI, w: 700, s: r * 0.62 }, r * 1.5);
  text(g, t, x, y + o.s * 0.36, { ...o, c: D3.champ });
}
// sparkline inside (x, y, w, h); o.area: fill alpha
function d3_spark(g, x, y, w, h, seed, end, col, o = {}) {
  const s = d3_series(seed, o.n || 26, end, o.vol || 0.02);
  const lo = Math.min(...s), hi = Math.max(...s);
  const pts = s.map((v, i) => [x + i / (s.length - 1) * w, y + h - (v - lo) / (hi - lo || 1) * h]);
  if (o.area) {
    const yb = y + h + (o.drop || 0), ag = g.createLinearGradient(0, y, 0, yb); ag.addColorStop(0, hexA(col, o.area)); ag.addColorStop(1, hexA(col, 0));
    g.beginPath(); smoothPath(g, pts); g.lineTo(x + w, yb); g.lineTo(x, yb); g.closePath(); g.fillStyle = ag; g.fill();
  }
  g.save(); g.strokeStyle = col; g.lineWidth = o.lw || 2; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
  return pts;
}
function d3_star(g, x, y, r, col) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  g.closePath(); g.fillStyle = col; g.fill();
}
// the app icon: black rounded square, white stacked official logo (h = 0.66 × size)
function d3_appIcon(g, x, y, s) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = s * 0.3; g.shadowOffsetY = s * 0.08;
  rr(g, x - s / 2, y - s / 2, s, s, s * 0.22); g.fillStyle = '#0A0A0A'; g.fill(); g.restore();
  rr(g, x - s / 2, y - s / 2, s, s, s * 0.22); g.lineWidth = Math.max(1, s * 0.018); g.strokeStyle = hexA(D3.au, 0.55); g.stroke();
  logo(g, x, y, s * 0.66, { ink: '#FFFFFF' });
}
function d3_bell(g, x, y, s, col) {
  g.fillStyle = col; g.beginPath();
  g.moveTo(x - s * 0.5, y + s * 0.3); g.quadraticCurveTo(x - s * 0.36, y + s * 0.2, x - s * 0.36, y - s * 0.04);
  g.bezierCurveTo(x - s * 0.36, y - s * 0.4, x - s * 0.2, y - s * 0.5, x, y - s * 0.5);
  g.bezierCurveTo(x + s * 0.2, y - s * 0.5, x + s * 0.36, y - s * 0.4, x + s * 0.36, y - s * 0.04);
  g.quadraticCurveTo(x + s * 0.36, y + s * 0.2, x + s * 0.5, y + s * 0.3); g.closePath(); g.fill();
  g.beginPath(); g.arc(x, y + s * 0.4, s * 0.11, 0, TAU); g.fill();
  g.beginPath(); g.arc(x, y - s * 0.56, s * 0.07, 0, TAU); g.fill();
}
function d3_search(g, x, y, r, col) {
  g.save(); g.strokeStyle = col; g.lineWidth = r * 0.28; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x + r * 0.72, y + r * 0.72); g.lineTo(x + r * 1.45, y + r * 1.45); g.stroke(); g.restore();
}
// segmented tabs: gold-foil pill on the selected tab, optional count badges. Returns total width.
function d3_tabs(g, x, y, items, sel, o = {}) {
  const sz = o.s || 21, h = o.h || 52, pad = 4, f = { f: D3_UI, w: 600, s: sz };
  const ws = items.map(([l, n]) => (o.tw || (measure(g, l, f) + (n ? measure(g, n, { ...f, s: sz * 0.8 }) + sz * 1.4 : 0) + sz * 2.2)));
  const total = ws.reduce((a, b) => a + b, 0) + pad * 2;
  rr(g, x, y - h / 2, total, h, h / 2); g.fillStyle = 'rgba(212,175,55,0.07)'; g.fill();
  g.strokeStyle = hexA(D3.au, 0.3); g.lineWidth = 1; g.stroke();
  let cx = x + pad;
  items.forEach(([l, n], i) => {
    const w = ws[i], on = i === sel;
    if (on) {
      rr(g, cx, y - h / 2 + pad, w, h - pad * 2, (h - pad * 2) / 2);
      g.fillStyle = d3_foil(g, cx, y - h, cx + w * 1.6, y + h); g.fill();
    }
    const lw = measure(g, l, f), nw = n ? measure(g, n, { ...f, s: sz * 0.8 }) + sz * 1.0 : 0, tx = cx + (w - lw - (n ? nw + sz * 0.4 : 0)) / 2;
    text(g, l, tx, y + sz * 0.36, { ...f, w: on ? 700 : 600, a: 'left', c: on ? '#1A1408' : D3.soft });
    if (n) {
      const bx = tx + lw + sz * 0.4, bh = sz * 1.2;
      rr(g, bx, y - bh / 2, nw, bh, bh / 2); g.fillStyle = on ? 'rgba(26,20,8,0.16)' : 'rgba(212,175,55,0.14)'; g.fill();
      text(g, n, bx + nw / 2, y + sz * 0.29, { ...f, s: sz * 0.8, w: 700, c: on ? '#3A2A08' : D3.champ });
    }
    cx += w;
  });
  return total;
}
// gold-foil button with drawn arrow; o.edge: brand-orange rim
function d3_button(g, x, y, w, h, label, o = {}) {
  const r = o.r == null ? h / 2 : o.r;
  g.save(); g.shadowColor = hexA(o.edge ? D3.or : D3.au, 0.42); g.shadowBlur = h * 0.5;
  rr(g, x, y, w, h, r); g.fillStyle = d3_foil(g, x, y - h * 0.7, x + w, y + h * 1.7); g.fill(); g.restore();
  const bv = g.createLinearGradient(0, y, 0, y + h); bv.addColorStop(0, 'rgba(255,250,225,0.35)'); bv.addColorStop(0.5, 'rgba(255,250,225,0)'); bv.addColorStop(1, 'rgba(60,40,0,0.3)');
  rr(g, x, y, w, h, r); g.fillStyle = bv; g.fill();
  if (o.sweep != null) {
    g.save(); rr(g, x, y, w, h, r); g.clip();
    const sx = x + w * o.sweep, sw = g.createLinearGradient(sx - h, y, sx + h * 0.4, y + h); sw.addColorStop(0, 'rgba(255,255,240,0)'); sw.addColorStop(0.5, 'rgba(255,255,240,0.55)'); sw.addColorStop(1, 'rgba(255,255,240,0)');
    g.fillStyle = sw; g.fillRect(x, y, w, h); g.restore();
  }
  if (o.edge) { rr(g, x - 3, y - 3, w + 6, h + 6, r + 3); g.lineWidth = 3; g.strokeStyle = D3.or; g.stroke(); }
  rr(g, x + 5, y + 5, w - 10, h - 10, Math.max(0, r - 5)); g.strokeStyle = 'rgba(70,50,8,0.45)'; g.lineWidth = 1; g.stroke();
  const f = { f: o.f || D3_MR, w: 800, s: o.s || h * 0.36 };
  const lw = measure(g, label, f), aw = o.arrow === false ? 0 : f.s * 1.5 + f.s * 0.6, lx = x + (w - lw - aw) / 2;
  text(g, label, lx, y + h / 2 + f.s * 0.36, { ...f, a: 'left', c: '#1A1408' });
  if (o.arrow !== false) d3_arrow(g, lx + lw + f.s * 0.6, y + h / 2, f.s * 1.5, '#1A1408', Math.max(2, f.s * 0.09));
}

/* ── metal objects ── */
// gold ingot seen from the front and slightly above; (cx, by) = centre of the bottom front edge
function d3_ingot(g, cx, by, w, h, d, o = {}) {
  const tw = w * 0.82;
  const fl = [cx - w / 2, by], fr = [cx + w / 2, by], tr = [cx + tw / 2, by - h], tl = [cx - tw / 2, by - h];
  const tlb = [tl[0], tl[1] - d], trb = [tr[0], tr[1] - d], flb = [fl[0], fl[1] - d], frb = [fr[0], fr[1] - d];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); };
  if (o.shadow !== false) {
    g.save(); g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = h * 0.6; g.shadowOffsetY = h * 0.18;
    poly([fl, fr, frb, trb, tlb, flb], '#2A1E08'); g.restore();
  }
  // sloped sides
  poly([fl, tl, tlb, flb], d3_foil(g, fl[0], flb[1], tl[0], fl[1], [[0, '#5E4410'], [0.6, '#9C7623'], [1, '#C79F3C']]));
  poly([fr, tr, trb, frb], d3_foil(g, tr[0], frb[1], fr[0], fr[1], [[0, '#B48C2E'], [0.5, '#7A5B17'], [1, '#4C370C']]));
  // front face
  poly([fl, fr, tr, tl], d3_foil(g, fl[0], tl[1] - h, fr[0], fl[1] + h));
  const sh = g.createLinearGradient(0, tl[1], 0, fl[1]); sh.addColorStop(0, 'rgba(255,250,220,0.18)'); sh.addColorStop(0.4, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,24,0,0.45)');
  poly([fl, fr, tr, tl], sh);
  // top face (brightest)
  poly([tl, tr, trb, tlb], d3_foil(g, tlb[0], tlb[1] - d * 2, trb[0], tr[1] + d * 2));
  g.strokeStyle = 'rgba(255,248,214,0.75)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(tl[0], tl[1]); g.lineTo(tr[0], tr[1]); g.stroke();
  // stamp on the top face
  if (o.stamp !== false && d > 14) {
    const sx = cx, sy = by - h - d / 2, fs = Math.min(d * 0.55, tw * 0.14);
    g.save(); g.translate(sx, sy); g.scale(1, 0.62);
    text(g, '999,9', 0, fs * 0.36 + 1.2, { f: D3_PF, w: 700, s: fs, c: 'rgba(255,248,214,0.6)' });
    text(g, '999,9', 0, fs * 0.36, { f: D3_PF, w: 700, s: fs, c: 'rgba(70,48,6,0.85)' });
    g.restore();
  }
  if (o.glint) d3_glint(g, tr[0] - tw * 0.18, tr[1] - d * 0.4, h * 0.6, o.glint);
}
// coins (side band with reeded edge + face)
function d3_coinSide(g, cx, cy, rx, ry, th) {
  const gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
  gr.addColorStop(0, '#3E2F0C'); gr.addColorStop(0.16, '#A8832A'); gr.addColorStop(0.34, '#F4DC92'); gr.addColorStop(0.42, '#FFF2C6');
  gr.addColorStop(0.56, '#C9A23F'); gr.addColorStop(0.84, '#7A5D1A'); gr.addColorStop(1, '#33270A');
  g.beginPath(); g.moveTo(cx - rx, cy); g.lineTo(cx - rx, cy + th); g.ellipse(cx, cy + th, rx, ry, 0, Math.PI, 0, true);
  g.lineTo(cx + rx, cy); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, false); g.closePath();
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.strokeStyle = 'rgba(40,28,4,0.35)'; g.lineWidth = 1;
  for (let k = -rx + 2; k < rx; k += 3.4) { const e = ry * Math.sqrt(Math.max(0, 1 - (k / rx) ** 2)); g.beginPath(); g.moveTo(cx + k, cy + e); g.lineTo(cx + k, cy + th + e); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(20,14,2,0.7)'; g.lineWidth = 1.2;
  g.beginPath(); g.ellipse(cx, cy + th, rx, ry, 0, 0, Math.PI); g.stroke();
}
function d3_coinTop(g, cx, cy, rx, ry) {
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  g.fillStyle = d3_foil(g, cx - rx, cy - ry * 2, cx + rx, cy + ry * 2); g.fill();
  g.lineWidth = 1.2; g.strokeStyle = 'rgba(80,58,10,0.65)';
  g.beginPath(); g.ellipse(cx, cy, rx * 0.8, ry * 0.8, 0, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,246,214,0.55)';
  g.beginPath(); g.ellipse(cx, cy + 1.2, rx * 0.8, ry * 0.8, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
  d3_lozenge(g, cx, cy, ry * 0.42, 'rgba(110,80,14,0.55)');
}
function d3_stack(g, cx, base, n, rx, ry, th, seed) {
  const r = mulberry32(seed);
  let jx = 0;
  for (let i = 0; i < n; i++) { jx = (r() - 0.5) * 3.2; d3_coinSide(g, cx + jx, base - (i + 1) * th, rx, ry, th); }
  d3_coinTop(g, cx + jx, base - n * th, rx, ry);
}
// a coin standing up, seen face-on (gold rim, engraved rings)
function d3_coinFace(g, x, y, r) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = r * 0.5; g.shadowOffsetY = r * 0.15;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = d3_foil(g, x - r, y - r, x + r, y + r); g.fill(); g.restore();
  g.strokeStyle = 'rgba(70,48,6,0.6)'; g.lineWidth = Math.max(1, r * 0.04);
  g.beginPath(); g.arc(x, y, r * 0.84, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,246,214,0.5)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y + 1, r * 0.84, 0.2, Math.PI - 0.2); g.stroke();
  g.save(); g.beginPath(); g.arc(x, y, r * 0.8, 0, TAU); g.clip();
  g.strokeStyle = 'rgba(90,64,10,0.28)'; g.lineWidth = 0.8;
  for (let k = 0; k < 18; k++) { g.beginPath(); g.ellipse(x, y, r * 0.78, r * 0.28, k * Math.PI / 18, 0, TAU); g.stroke(); }
  g.restore();
  d3_lozenge(g, x, y, r * 0.22, 'rgba(110,80,14,0.6)');
}

/* ── scene 1: the desk ── */
// a sheet lying on the desk: shadow, paper, then paint(x, w, h) in its own coordinates
function d3_sheet(x, cx, cy, w, h, rot, paint, o = {}) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.translate(-w / 2, -h / 2);
  x.save(); x.shadowColor = 'rgba(0,0,0,0.85)'; x.shadowBlur = 36; x.shadowOffsetX = 10; x.shadowOffsetY = 18;
  rr(x, 0, 0, w, h, o.r || 4); x.fillStyle = o.fill || '#1E1A14'; x.fill(); x.restore();
  if (o.edge !== false) { rr(x, 0, 0, w, h, o.r || 4); x.lineWidth = 1.5; x.strokeStyle = hexA(D3.au, 0.5); x.stroke(); }
  paint(x, w, h);
  x.restore();
}
function d3_desk(x, TW, TH) {
  // dark leather writing surface
  x.fillStyle = '#15120E'; x.fillRect(0, 0, TW, TH);
  const gr = x.createRadialGradient(TW / 2, TH * 0.75, 0, TW / 2, TH * 0.75, TW * 0.55);
  gr.addColorStop(0, 'rgba(92,74,44,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, TW, TH);
  if (D3_T.grain) { x.save(); x.globalAlpha = 1.6; x.fillStyle = x.createPattern(D3_T.grain, 'repeat'); x.fillRect(0, 0, TW, TH); x.restore(); }
  x.save(); x.translate(350, 0);
  const ink = '#2A2216';
  // 1 · a folded newspaper, the stock page
  d3_sheet(x, 1000, 400, 640, 560, 0.05, (x, w, h) => {
    text(x, 'Borsa Gündemi', 30, 74, { f: D3_PF, w: 900, s: 56, a: 'left', c: ink });
    x.fillStyle = ink; x.fillRect(30, 94, w - 60, 3); x.fillRect(30, 102, w - 60, 1);
    text(x, 'EKONOMİ  ·  HİSSE SENETLERİ', 30, 128, { f: D3_MR, w: 700, s: 15, a: 'left', ls: 3, c: '#6A5B40' });
    text(x, 'BIST 100', 30, 182, { f: D3_MR, w: 800, s: 22, a: 'left', c: ink });
    text(x, '11.165,44', 30, 248, { f: D3_PF, w: 700, s: 64, a: 'left', c: ink });
    text(x, '+0,13%', 330, 248, { f: D3_MR, w: 800, s: 26, a: 'left', c: '#2F7A45' });
    text(x, 'Nasdaq 100', 30, 302, { f: D3_MR, w: 800, s: 22, a: 'left', c: ink });
    text(x, '29.813,16', 30, 356, { f: D3_PF, w: 700, s: 48, a: 'left', c: ink });
    text(x, '+0,55%', 270, 356, { f: D3_MR, w: 800, s: 22, a: 'left', c: '#2F7A45' });
    x.strokeStyle = ink; x.lineWidth = 2.5; x.beginPath();
    smoothPath(x, d3_series(12, 30, 1.08, 0.02).map((v, i) => [30 + i * 10, 500 - (v - 0.9) * 420])); x.stroke();
    x.fillStyle = 'rgba(42,34,22,0.25)'; x.fillRect(420, 150, 1, h - 190);
    for (let k = 0; k < 14; k++) { x.fillStyle = 'rgba(42,34,22,0.28)'; x.fillRect(440, 160 + k * 26, (w - 470) * [0.95, 0.8, 0.9, 0.7, 0.92, 0.6, 0.85, 0.9, 0.75, 0.88, 0.5, 0.9, 0.8, 0.65][k], 8); }
  }, { fill: '#E3DAC6', edge: false });
  // 2 · phone with a crypto app
  d3_sheet(x, 400, 520, 300, 620, -0.14, (x, w, h) => {
    rr(x, 3, 3, w - 6, h - 6, 40); x.lineWidth = 5; x.strokeStyle = d3_foil(x, 0, 0, w, h); x.stroke();
    rr(x, 16, 16, w - 32, h - 32, 30); x.fillStyle = '#0E0D0B'; x.fill();
    x.fillStyle = '#000'; rr(x, w / 2 - 50, 26, 100, 22, 11); x.fill();
    text(x, 'Kripto uygulaması', 40, 100, { f: D3_UI, w: 600, s: 18, a: 'left', c: D3.soft });
    d3_coinIcon(x, 58, 140, 17, 'BTC');
    text(x, 'BTC/USDT', 86, 147, { f: D3_UI, w: 700, s: 19, a: 'left', c: D3.iv });
    text(x, '$80.220,05', 40, 204, { f: D3_UI, w: 700, s: 36, a: 'left', c: D3.iv });
    text(x, '−1,49%', 40, 236, { f: D3_UI, w: 700, s: 19, a: 'left', c: D3.dn });
    d3_spark(x, 40, 270, 220, 80, 41, 0.96, D3.dn, { lw: 3, area: 0.25, drop: 20 });
    [['ETH', '$2.325,10'], ['XRP', '$1,2913'], ['SOL', '$100,56']].forEach(([a, b], i) => {
      const y = 420 + i * 60;
      d3_coinIcon(x, 56, y - 7, 16, a);
      text(x, a, 84, y, { f: D3_UI, w: 700, s: 18, a: 'left', c: D3.iv });
      text(x, b, w - 40, y, { f: D3_UI, w: 600, s: 17, a: 'right', c: D3.soft });
    });
  }, { fill: '#050504', edge: false, r: 42 });
  // 3 · tablet open on a gold-price website
  d3_sheet(x, 1660, 470, 660, 470, -0.06, (x, w, h) => {
    rr(x, 16, 16, w - 32, h - 32, 12); x.fillStyle = '#F2ECDD'; x.fill();
    x.fillStyle = '#D9D0BC'; x.fillRect(16, 16, w - 32, 50);
    rr(x, 30, 26, 210, 40, 8); x.fillStyle = '#F2ECDD'; x.fill();
    text(x, 'Altın fiyatları', 48, 53, { f: D3_UI, w: 600, s: 17, a: 'left', c: ink });
    text(x, 'Döviz kurları', 262, 53, { f: D3_UI, w: 500, s: 17, a: 'left', c: '#6A5B40' });
    text(x, 'Canlı altın fiyatları', 44, 118, { f: D3_UI, w: 700, s: 26, a: 'left', c: ink });
    [['Gram Altın', '₺6.510,83'], ['Çeyrek Altın', '₺10.476'], ['Ons Altın', '$4.033,60'], ['Tam Altın', '₺41.727']].forEach(([a, b], i) => {
      const y = 180 + i * 62;
      x.fillStyle = 'rgba(42,34,22,0.12)'; x.fillRect(44, y + 22, w - 88, 1);
      x.fillStyle = '#C9A240'; x.beginPath(); x.arc(58, y - 7, 9, 0, TAU); x.fill();
      text(x, a, 80, y, { f: D3_UI, w: 600, s: 22, a: 'left', c: ink });
      text(x, b, w - 44, y, { f: D3_UI, w: 700, s: 22, a: 'right', c: ink });
    });
  }, { fill: '#0A0908', edge: false, r: 26 });
  // 4 · a gold pocket watch showing 14:24
  {
    const wx = 1335, wy = 640, R = 96;
    x.save(); x.shadowColor = 'rgba(0,0,0,0.85)'; x.shadowBlur = 30; x.shadowOffsetX = 8; x.shadowOffsetY = 16;
    x.beginPath(); x.arc(wx, wy, R, 0, TAU); x.fillStyle = '#3A2C0E'; x.fill(); x.restore();
    // chain
    const P0 = [wx, wy - R - 40], P1 = [wx - 30, wy - R - 150], P2 = [wx - 190, wy - 120], P3 = [wx - 250, wy - 40];
    for (let k = 0; k <= 26; k++) {
      const t = k / 26, u = 1 - t, bz = i => u * u * u * P0[i] + 3 * u * u * t * P1[i] + 3 * u * t * t * P2[i] + t * t * t * P3[i];
      const dz = i => 3 * u * u * (P1[i] - P0[i]) + 6 * u * t * (P2[i] - P1[i]) + 3 * t * t * (P3[i] - P2[i]);
      x.save(); x.translate(bz(0), bz(1)); x.rotate(Math.atan2(dz(1), dz(0)));
      x.strokeStyle = d3_foil(x, -8, -5, 8, 5); x.lineWidth = 2.6; x.beginPath(); x.ellipse(0, 0, 7, k % 2 ? 2.2 : 4.4, 0, 0, TAU); x.stroke();
      x.restore();
    }
    x.fillStyle = d3_foil(x, wx - 16, wy - R - 40, wx + 16, wy - R); rr(x, wx - 13, wy - R - 22, 26, 26, 5); x.fill();
    x.strokeStyle = d3_foil(x, wx - 20, wy - R - 50, wx + 20, wy - R - 20); x.lineWidth = 5; x.beginPath(); x.arc(wx, wy - R - 34, 13, 0, TAU); x.stroke();
    x.beginPath(); x.arc(wx, wy, R, 0, TAU); x.fillStyle = d3_foil(x, wx - R, wy - R, wx + R, wy + R); x.fill();
    const dg = x.createRadialGradient(wx - 20, wy - 25, 0, wx, wy, R * 0.86);
    dg.addColorStop(0, '#FBF6EA'); dg.addColorStop(1, '#D9CDB2');
    x.beginPath(); x.arc(wx, wy, R * 0.84, 0, TAU); x.fillStyle = dg; x.fill();
    for (let k = 0; k < 60; k++) {
      const a = k / 60 * TAU, l = k % 5 === 0 ? 12 : 5;
      x.strokeStyle = k % 5 === 0 ? ink : 'rgba(42,34,22,0.5)'; x.lineWidth = k % 5 === 0 ? 2.5 : 1;
      x.beginPath(); x.moveTo(wx + Math.cos(a) * R * 0.8, wy + Math.sin(a) * R * 0.8); x.lineTo(wx + Math.cos(a) * (R * 0.8 - l), wy + Math.sin(a) * (R * 0.8 - l)); x.stroke();
    }
    const hand = (a, l, lw) => { x.strokeStyle = ink; x.lineWidth = lw; x.lineCap = 'round'; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + Math.cos(a) * l, wy + Math.sin(a) * l); x.stroke(); };
    hand((2 + 24 / 60) / 12 * TAU - Math.PI / 2, R * 0.42, 5);
    hand(24 / 60 * TAU - Math.PI / 2, R * 0.66, 3.5);
    x.strokeStyle = D3.or; x.lineWidth = 1.6; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + Math.cos(0.9) * R * 0.7, wy + Math.sin(0.9) * R * 0.7); x.stroke();
    x.fillStyle = ink; x.beginPath(); x.arc(wx, wy, 6, 0, TAU); x.fill();
  }
  // 5 · fountain pen across the papers
  x.save(); x.translate(620, 850); x.rotate(-0.48);
  x.save(); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 22; x.shadowOffsetY = 16;
  const L = 600, T = 30;
  const bg = x.createLinearGradient(0, -T / 2, 0, T / 2);
  bg.addColorStop(0, '#050403'); bg.addColorStop(0.3, '#4A4234'); bg.addColorStop(0.5, '#15120D'); bg.addColorStop(1, '#030302');
  rr(x, 0, -T / 2, L, T, T / 2); x.fillStyle = bg; x.fill(); x.restore();
  for (const [p, wd] of [[0.06, 10], [0.58, 22], [0.64, 6]]) { x.fillStyle = d3_foil(x, L * p, -T / 2, L * p + wd, T / 2); x.fillRect(L * p, -T / 2, wd, T); }
  x.fillStyle = d3_foil(x, 40, -T / 2 - 6, 330, -T / 2 + 2); rr(x, 40, -T / 2 - 5, 300, 7, 3); x.fill();
  x.fillStyle = d3_foil(x, L, -12, L + 90, 12); x.beginPath(); x.moveTo(L - 4, -12); x.lineTo(L + 92, 0); x.lineTo(L - 4, 12); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(40,28,4,0.7)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(L + 10, 0); x.lineTo(L + 88, 0); x.stroke();
  x.restore();
  x.restore();
}

/* ── scene 5: the engraved gold price plate ── */
function d3_engrave(g, s, x, y, o) {
  text(g, s, x, y + 1.6, { ...o, c: 'rgba(255,248,215,0.62)' });
  text(g, s, x, y - 0.8, { ...o, c: 'rgba(60,38,0,0.3)' });
  text(g, s, x, y, { ...o, c: o.c || '#2A1A03' });
}
function d3_plate(g, x, y, w, h) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 70; g.shadowOffsetY = 34;
  rr(g, x, y, w, h, 10); g.fillStyle = '#5A4413'; g.fill(); g.restore();
  // bevelled edge, then the brushed face
  rr(g, x, y, w, h, 10); g.fillStyle = d3_foil(g, x, y, x + w, y + h); g.fill();
  rr(g, x + 10, y + 10, w - 20, h - 20, 6); g.fillStyle = d3_foil(g, x, y, x + w * 0.9, y + h, D3_PLATE); g.fill();
  g.save(); rr(g, x + 10, y + 10, w - 20, h - 20, 6); g.clip();
  const r = mulberry32(505);
  for (let yy = y + 10; yy < y + h - 10; yy += 2) {
    g.fillStyle = r() < 0.5 ? `rgba(255,248,220,${r() * 0.12})` : `rgba(90,62,10,${r() * 0.1})`;
    g.fillRect(x + 10, yy, w - 20, 1);
  }
  const sh = g.createLinearGradient(x, y, x + w, y + h);
  sh.addColorStop(0, 'rgba(255,255,240,0)'); sh.addColorStop(0.42, 'rgba(255,255,240,0)'); sh.addColorStop(0.5, 'rgba(255,255,240,0.22)'); sh.addColorStop(0.58, 'rgba(255,255,240,0)');
  g.fillStyle = sh; g.fillRect(x, y, w, h);
  g.restore();
  rr(g, x + 10, y + 10, w - 20, h - 20, 6); g.lineWidth = 2; g.strokeStyle = 'rgba(70,48,6,0.55)'; g.stroke();
  rr(g, x + 24, y + 24, w - 48, h - 48, 3); g.lineWidth = 1.2; g.strokeStyle = 'rgba(70,48,6,0.45)'; g.stroke();
  rr(g, x + 25.5, y + 25.5, w - 48, h - 48, 3); g.lineWidth = 1; g.strokeStyle = 'rgba(255,248,215,0.4)'; g.stroke();
  // screws
  for (const [sx, sy] of [[x + 44, y + 44], [x + w - 44, y + 44], [x + 44, y + h - 44], [x + w - 44, y + h - 44]]) {
    const sg = g.createRadialGradient(sx - 3, sy - 3, 0, sx, sy, 9); sg.addColorStop(0, '#FFF3C4'); sg.addColorStop(1, '#7A5B17');
    g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, 8, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(60,40,4,0.8)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx - 5, sy + 2); g.lineTo(sx + 5, sy - 2); g.stroke();
  }
}

/* ── scene 6: the vault ── */
function d3_vault(g, cx, cy, R, th) {
  const RO = R * 1.15;
  // recess in the wall
  g.save(); g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 80; g.shadowOffsetY = 20;
  g.fillStyle = '#17140F'; g.beginPath(); g.arc(cx, cy, RO + 34, 0, TAU); g.fill(); g.restore();
  g.strokeStyle = hexA(D3.au, 0.25); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, RO + 34, 0, TAU); g.stroke();
  // interior
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
  g.fillStyle = '#120D06'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  // safe-deposit boxes on the back wall
  const bw = R * 0.22, bh = R * 0.15;
  for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) {
    const bx = cx - R + 6 + i * (bw + 6), by = cy - R + 6 + j * (bh + 6);
    g.fillStyle = '#2A2012'; g.fillRect(bx, by, bw, bh);
    g.strokeStyle = hexA(D3.au, 0.35); g.lineWidth = 1; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    g.fillStyle = hexA(D3.au, 0.6); g.beginPath(); g.arc(bx + bw / 2, by + bh / 2, 3, 0, TAU); g.fill();
  }
  // warm light pouring from inside
  const lg = g.createRadialGradient(cx - R * 0.2, cy + R * 0.25, 0, cx - R * 0.2, cy + R * 0.25, R * 1.15);
  lg.addColorStop(0, 'rgba(255,214,130,0.55)'); lg.addColorStop(0.45, 'rgba(200,140,40,0.28)'); lg.addColorStop(1, 'rgba(20,12,4,0.2)');
  g.fillStyle = lg; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  // shelf with a pyramid of ingots and coin stacks
  const sy = cy + R * 0.42;
  g.fillStyle = '#3A2A10'; g.fillRect(cx - R, sy, 2 * R, R);
  g.fillStyle = d3_foil(g, cx - R, sy - 6, cx + R, sy + 6); g.fillRect(cx - R, sy - 3, 2 * R, 6);
  const iw = R * 0.3, ih = R * 0.085, id = R * 0.07, icx = cx - R * 0.26;
  [[4, 0], [3, 1], [2, 2], [1, 3]].forEach(([n, row]) => {
    for (let k = 0; k < n; k++) d3_ingot(g, icx + (k - (n - 1) / 2) * iw * 1.02, sy - row * (ih + id) + 2, iw, ih, id, { shadow: row === 0, stamp: false, glint: row === 3 ? 0.9 : 0 });
  });
  d3_stack(g, cx + R * 0.32, sy + 2, 9, R * 0.08, R * 0.026, R * 0.034, 61);
  d3_stack(g, cx + R * 0.52, sy + 2, 6, R * 0.08, R * 0.026, R * 0.034, 62);
  d3_stack(g, cx - R * 0.78, sy + 2, 7, R * 0.08, R * 0.026, R * 0.034, 63);
  // lower shelf
  const sy2 = cy + R * 0.84;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(cx - R, sy + 6, 2 * R, R * 0.05);
  g.fillStyle = d3_foil(g, cx - R, sy2 - 6, cx + R, sy2 + 6); g.fillRect(cx - R, sy2 - 3, 2 * R, 6);
  [-0.36, -0.06].forEach(k => d3_ingot(g, cx + k * R, sy2 + 2, iw, ih, id, { stamp: false }));
  d3_ingot(g, cx - R * 0.21, sy2 + 2 - ih - id + 2, iw, ih, id, { stamp: false, shadow: false });
  d3_stack(g, cx + R * 0.22, sy2 + 2, 6, R * 0.08, R * 0.026, R * 0.034, 64);
  d3_stack(g, cx + R * 0.4, sy2 + 2, 4, R * 0.08, R * 0.026, R * 0.034, 65);
  g.restore();
  // frame ring (steel-gold) with bolts
  g.beginPath(); g.arc(cx, cy, RO, 0, TAU); g.moveTo(cx + R, cy); g.arc(cx, cy, R, 0, TAU, true);
  g.fillStyle = d3_foil(g, cx - RO, cy - RO, cx + RO, cy + RO); g.fill();
  g.strokeStyle = 'rgba(60,40,4,0.6)'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(cx, cy, R * 1.03, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, RO * 0.985, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
  for (let k = 0; k < 32; k++) {
    const a = k / 32 * TAU, rx = cx + Math.cos(a) * R * 1.09, ry = cy + Math.sin(a) * R * 1.09;
    const bg = g.createRadialGradient(rx - 2, ry - 2, 0, rx, ry, 6); bg.addColorStop(0, '#FFF3C4'); bg.addColorStop(1, '#6B5220');
    g.fillStyle = bg; g.beginPath(); g.arc(rx, ry, 5, 0, TAU); g.fill();
  }
  // light spilling out of the opening
  g.save(); g.globalCompositeOperation = 'lighter';
  glow(g, '#FFC864', cx - R * 0.2, cy + R * 0.2, R * 1.5, 0.22);
  g.restore();
  // the door, swung open toward the viewer on a hinge right of the frame
  const hx = cx + RO + 26, c = Math.cos(th), s = Math.sin(th), Rd = R * 1.05, T = R * 0.26;
  const dcx = hx - Rd * c, bcx = dcx - T * s;
  // hinge arms
  for (const hy of [cy - R * 0.55, cy + R * 0.55]) {
    g.fillStyle = d3_foil(g, hx - 40, hy - 30, hx + 30, hy + 30); rr(g, hx - Rd * c * 0.35, hy - 22, Rd * c * 0.35 + 34, 44, 8); g.fill();
    g.strokeStyle = 'rgba(40,28,4,0.6)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = d3_foil(g, hx + 14, hy - 50, hx + 40, hy + 50); rr(g, hx + 10, hy - 52, 28, 104, 10); g.fill();
  }
  // rim (door thickness) with locking bolts
  g.save(); g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 60; g.shadowOffsetX = 20; g.shadowOffsetY = 20;
  g.beginPath(); g.ellipse(bcx, cy, Rd * c, Rd, 0, Math.PI / 2, Math.PI * 1.5); g.lineTo(dcx, cy - Rd); g.ellipse(dcx, cy, Rd * c, Rd, 0, -Math.PI / 2, Math.PI / 2); g.closePath();
  const rg = g.createLinearGradient(bcx - Rd * c, 0, dcx + Rd * c, 0);
  rg.addColorStop(0, '#4A380F'); rg.addColorStop(0.25, '#A8832A'); rg.addColorStop(0.45, '#E9CC79'); rg.addColorStop(0.7, '#8E6B1E'); rg.addColorStop(1, '#3E2F0C');
  g.fillStyle = rg; g.fill(); g.restore();
  g.save(); g.beginPath(); g.ellipse(bcx, cy, Rd * c, Rd, 0, Math.PI / 2, Math.PI * 1.5); g.lineTo(dcx, cy - Rd); g.ellipse(dcx, cy, Rd * c, Rd, 0, -Math.PI / 2, Math.PI / 2); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(40,28,4,0.4)'; g.lineWidth = 1;
  for (let k = 1; k < 6; k++) { const ox = bcx + (dcx - bcx) * k / 6; g.beginPath(); g.ellipse(ox, cy, Rd * c, Rd, 0, Math.PI / 2, Math.PI * 1.5); g.stroke(); }
  g.restore();
  for (let k = 0; k < 9; k++) {
    const a = Math.PI / 2 + (k + 0.5) / 9 * Math.PI, bx = (dcx + bcx) / 2 + Math.cos(a) * Rd * c, by = cy + Math.sin(a) * Rd * 0.94;
    const bl = T * s * 0.9, bh = Rd * 0.07;
    const bgr = g.createLinearGradient(0, by - bh / 2, 0, by + bh / 2); bgr.addColorStop(0, '#FFF0BC'); bgr.addColorStop(0.5, '#C9A240'); bgr.addColorStop(1, '#5E4410');
    g.fillStyle = bgr; rr(g, bx - bl * 0.9, by - bh / 2, bl, bh, bh / 2); g.fill();
  }
  // front face (squashed by the swing)
  g.save(); g.translate(dcx, cy); g.scale(c, 1);
  g.beginPath(); g.arc(0, 0, Rd, 0, TAU); g.fillStyle = d3_foil(g, -Rd, -Rd, Rd, Rd); g.fill();
  const fs = g.createRadialGradient(-Rd * 0.3, -Rd * 0.3, 0, 0, 0, Rd); fs.addColorStop(0, 'rgba(255,250,225,0.18)'); fs.addColorStop(1, 'rgba(40,24,0,0.35)');
  g.fillStyle = fs; g.fill();
  g.strokeStyle = 'rgba(60,40,4,0.65)';
  for (const [k, lw] of [[0.94, 3 / c * 0.4], [0.8, 2 / c * 0.4], [0.5, 2 / c * 0.4], [0.2, 2 / c * 0.4]]) { g.lineWidth = lw; g.beginPath(); g.arc(0, 0, Rd * k, 0, TAU); g.stroke(); }
  g.save(); g.beginPath(); g.arc(0, 0, Rd * 0.78, 0, TAU); g.arc(0, 0, Rd * 0.52, 0, TAU, true); g.clip();
  g.strokeStyle = 'rgba(80,56,8,0.35)'; g.lineWidth = 1;
  for (let k = 0; k < 40; k++) { g.beginPath(); g.ellipse(0, 0, Rd * 0.77, Rd * 0.36, k * Math.PI / 40, 0, TAU); g.stroke(); }
  g.restore();
  for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; g.fillStyle = 'rgba(60,40,4,0.6)'; g.beginPath(); g.arc(Math.cos(a) * Rd * 0.87, Math.sin(a) * Rd * 0.87, Rd * 0.018, 0, TAU); g.fill(); }
  // handle wheel
  g.strokeStyle = d3_foil(g, -Rd * 0.4, -Rd * 0.4, Rd * 0.4, Rd * 0.4); g.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * TAU + 0.3; g.lineWidth = Rd * 0.06;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * Rd * 0.42, Math.sin(a) * Rd * 0.42); g.stroke();
    g.fillStyle = d3_foil(g, -Rd, -Rd, Rd, Rd); g.beginPath(); g.arc(Math.cos(a) * Rd * 0.45, Math.sin(a) * Rd * 0.45, Rd * 0.06, 0, TAU); g.fill();
  }
  g.fillStyle = '#3E2F0C'; g.beginPath(); g.arc(0, 0, Rd * 0.13, 0, TAU); g.fill();
  g.fillStyle = d3_foil(g, -Rd * 0.1, -Rd * 0.1, Rd * 0.1, Rd * 0.1); g.beginPath(); g.arc(0, 0, Rd * 0.1, 0, TAU); g.fill();
  d3_arcText(g, 'KASAM  ·  GÜVENLE  ·  KASAM  ·  GÜVENLE  ·  ', 0, 0, Rd * 0.66, -Math.PI / 2, { f: D3_PF, w: 700, s: Rd * 0.07, c: 'rgba(60,40,4,0.75)', fill: true });
  g.restore();
}

/* ── init: grain tile ── */
function d3_init() {
  const c = canvas(256, 256), x = c.getContext('2d'), id = x.createImageData(256, 256), r = mulberry32(303);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = r() < 0.5 ? 255 : 0;
    id.data[i] = v; id.data[i + 1] = v * 0.93; id.data[i + 2] = v * 0.8; id.data[i + 3] = r() * 16;
  }
  x.putImageData(id, 0, 0);
  D3_T.grain = c;
}

/* ───────────────────────── scenes ───────────────────────── */
const D3_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık fiyatlar',
    desc: 'Kamera loş masada kayar: kripto uygulaması, borsa gazetesi, altın sitesi ve 14:24’ü gösteren cep saati. Başlık belirir: “Piyasa hiç durmuyor.”',
    draw(g) {
      d3_bg(g, { ly: 820, lr: 1300 });
      const T = makeTex(2800, 1000, 1.1), x = texBegin(T);
      d3_desk(x, T.w, T.h);
      plane3d(g, T.c, T.w, T.h, { x: CX, y: 830, z: 60, rx: -0.64, s: 1 }, 16, 8);
      // the far edge melts into darkness, a warm lamp pool on the near papers
      const gr = g.createLinearGradient(0, 300, 0, 640);
      gr.addColorStop(0, 'rgba(11,10,8,1)'); gr.addColorStop(1, 'rgba(11,10,8,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, 640);
      addGlow(g, D3.au, CX, 250, 700, 0.1);
      d3_sweep(g, 0.62, 0.05);
      d3_folio(g, 'I', 'Dağınıklık', false);
      d3_ivory(g, 'Kripto bir yerde, hisse başka yerde,', CX, 220, { f: D3_PF, w: 700, s: 80, ls: -1 });
      d3_gold(g, 'altın bambaşka bir sitede.', CX, 350, { f: D3_PF, w: 700, it: true, s: 106, ls: -1 }, { sweep: 0.34 });
      const ko = { f: D3_MR, w: 700, s: 26, ls: 8 }, kt = d3_up('Piyasa hiç durmuyor.'), kw = measure(g, kt, ko);
      g.fillStyle = D3.or; g.fillRect(CX - kw / 2 - 80, 422, 50, 2); g.fillRect(CX + kw / 2 + 30, 422, 50, 2);
      text(g, kt, CX, 432, { ...ko, c: D3.or });
      d3_dust(g, 11, 90, { streak: 12, bokeh: 8 });
      d3_finish(g, { va: 0.7 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek uygulama',
    desc: 'Altın çizgi çerçeveyi iki yönden çizer; resmî Kripto724 logosu turuncu çubuğuyla belirir, “tek uygulamada.” altın varak ışığıyla parlar.',
    draw(g) {
      d3_bg(g, { ly: 420, lr: 1000 });
      d3_sweep(g, 0.6, 0.06);
      d3_frame(g, 330, 60, 1260, 960, { p: 0.86, c: 28 });
      // the official logo, ivory letters, orange bar, on a soft gold-and-orange halo
      addGlow(g, D3.au, CX, 330, 460, 0.16);
      addGlow(g, D3.or, CX, 330, 300, 0.1);
      logo(g, CX, 330, 300, { ink: D3.iv });
      d3_ivory(g, 'Kripto, borsa ve emtia', CX, 646, { f: D3_PF, w: 700, s: 84, ls: -1 });
      d3_gold(g, 'tek uygulamada.', CX, 784, { f: D3_PF, w: 700, it: true, s: 124, ls: -1 }, { sweep: 0.64, glow: 0.4 });
      d3_orn(g, CX, 850, 460);
      d3_kick(g, 'Canlı fiyatlar  ·  alarmlar  ·  analizler  ·  Kasam', CX, 920, { a: 'center', s: 20, ls: 6, c: D3.soft, w: 600 });
      d3_dust(g, 22, 150);
      d3_finish(g);
    },
  },
  {
    time: '8–12 sn', title: 'Kripto: Canlı tablo',
    desc: 'Kripto sekmesi ve CANLI rozetiyle tablo süzülür; BTC’den ADA’ya fiyat, günlük ve haftalık değişim satır satır dolar. “7/24” turuncu varakla parlar.',
    draw(g) {
      d3_bg(g, { lx: 1250, ly: 520, lr: 1100 });
      // ── the app's crypto card, dressed in black & gold ──
      const CW = 1000, CH = 870, T = makeTex(CW, CH, 1.4), x = texBegin(T);
      d3_card(x, 0, 0, CW, CH, { shadow: false, a: 0.6, r: 22 });
      d3_tabs(x, 40, 62, [['Kripto'], ['Borsa'], ['Emtia']], 0, { s: 22, h: 56, tw: 150 });
      d3_live(x, CW - 40, 62, 'CANLI', { s: 18 });
      const cP = 600, cD = 790, cW = 960, y0 = 176, rh = 86;
      d3_kick(x, 'Varlık', 40, 148, { s: 15, c: D3.dim, ls: 4 });
      d3_kick(x, 'Fiyat', cP, 148, { s: 15, c: D3.dim, ls: 4, a: 'right' });
      d3_kick(x, 'Günlük', cD, 148, { s: 15, c: D3.dim, ls: 4, a: 'right' });
      d3_kick(x, 'Haftalık', cW, 148, { s: 15, c: D3.dim, ls: 4, a: 'right' });
      x.fillStyle = hexA(D3.au, 0.35); x.fillRect(40, 168, CW - 80, 1);
      D3_CRYPTO.forEach((r, i) => {
        const cy = y0 + i * rh + rh / 2;
        if (i === 0) {
          const hg = x.createLinearGradient(10, 0, CW - 10, 0); hg.addColorStop(0, 'rgba(247,147,26,0.13)'); hg.addColorStop(1, 'rgba(247,147,26,0)');
          x.fillStyle = hg; x.fillRect(10, cy - rh / 2 + 3, CW - 20, rh - 6);
          x.fillStyle = D3.or; x.fillRect(10, cy - rh / 2 + 12, 3, rh - 24);
        }
        d3_coinIcon(x, 74, cy, 25, r[0]);
        d3_t(x, r[1], 116, cy - 2, 26, { w: 600 });
        d3_t(x, r[2], 116, cy + 25, 17, { w: 500, c: D3.soft });
        d3_t(x, r[3], cP, cy + 9, 26, { w: 600, a: 'right' });
        d3_chg(x, r[4], cD, cy, { s: 19 }); d3_chg(x, r[5], cW, cy, { s: 19 });
        if (i < 6) { x.fillStyle = hexA(D3.au, 0.12); x.fillRect(40, cy + rh / 2, CW - 80, 1); }
      });
      x.fillStyle = hexA(D3.au, 0.35); x.fillRect(40, y0 + 7 * rh + 6, CW - 80, 1);
      d3_t(x, 'Güncellendi 14:24', 40, y0 + 7 * rh + 52, 18, { w: 500, c: D3.soft });
      d3_t(x, 'Günlük · Haftalık değişim', CW - 40, y0 + 7 * rh + 52, 18, { w: 500, c: D3.dim, a: 'right' });
      x.save(); rr(x, 0, 0, CW, CH, 22); x.clip(); x.globalCompositeOperation = 'lighter';
      const sh = x.createLinearGradient(560, 0, 820, 300); sh.addColorStop(0, 'rgba(255,230,170,0)'); sh.addColorStop(0.5, 'rgba(255,230,170,0.05)'); sh.addColorStop(1, 'rgba(255,230,170,0)');
      x.fillStyle = sh; x.fillRect(0, 0, CW, CH); x.restore();
      const pose = { x: 1285, y: 560, z: 40, rx: 0.05, ry: -0.2, s: 0.97 };
      quadShadow(g, projector(pose), CW, CH, 0.8, 70, 40, 30);
      const Pj = plane3d(g, T.c, CW, CH, pose, 12, 8);
      const tl = Pj(-CW / 2, -CH / 2);
      d3_glint(g, tl[0] + 4, tl[1] + 4, 22, 0.8);
      // ── left column ──
      d3_folio(g, 'III', 'Kripto');
      d3_ivory(g, 'Canlı fiyatlar,', 110, 270, { f: D3_PF, w: 700, s: 78, a: 'left', ls: -1 });
      d3_orange(g, '7/24.', 104, 480, { f: D3_PF, w: 900, it: true, s: 210, a: 'left', ls: -2 }, { sweep: 0.55 });
      text(g, 'BTC, ETH, XRP ve fazlası;', 110, 572, { f: D3_PF, w: 400, it: true, s: 34, a: 'left', c: D3.champ });
      text(g, 'günlük ve haftalık değişimiyle.', 110, 618, { f: D3_PF, w: 400, it: true, s: 34, a: 'left', c: D3.champ });
      d3_hair(g, 110, 690, 640, 690, 0.5, 1, false);
      D3_CRYPTO.forEach((r, i) => d3_coinIcon(g, 136 + i * 72, 752, 24, r[0]));
      d3_kick(g, 'Kripto  ·  Borsa  ·  Emtia', 110, 840, { s: 17, c: D3.soft, ls: 6 });
      d3_dust(g, 33, 90, { bokeh: 8 });
      d3_finish(g, { va: 0.55 });
    },
  },
  {
    time: '12–16 sn', title: 'Borsa: BIST ve Nasdaq',
    desc: 'BIST 100 ve Nasdaq 100 kartlarında çizgiler çizilir; 210 hisse sayacı döner, Popüler listesi açılır, arama kutusunda imleç yanıp söner.',
    draw(g) {
      d3_bg(g, { lx: 1400, ly: 560, lr: 1100 });
      d3_folio(g, 'IV', 'Borsa');
      d3_ivory(g, 'BIST ve Nasdaq', 110, 250, { f: D3_PF, w: 700, s: 88, a: 'left', ls: -1 });
      d3_gold(g, 'hisseleri, tek listede.', 110, 350, { f: D3_PF, w: 700, it: true, s: 76, a: 'left', ls: -1 }, { sweep: 0.5 });
      // index cards
      [['BIST 100', '11.165,44', '+0,13%', 405, 1.012], ['Nasdaq 100', '29.813,16', '+0,55%', 406, 1.03]].forEach(([n, v, c, seed, end], i) => {
        const x = 110 + i * 410, y = 420, w = 390, h = 230;
        d3_card(g, x, y, w, h, { r: 18, a: 0.55, blur: 40 });
        d3_kick(g, n, x + 28, y + 50, { s: 18, c: D3.au, ls: 4 });
        d3_t(g, 'CANLI', x + w - 28, y + 50, 14, { w: 700, c: '#34D399', a: 'right', ls: 1 });
        g.fillStyle = D3.live; g.beginPath(); g.arc(x + w - 86, y + 44, 4, 0, TAU); g.fill();
        d3_ivory(g, v, x + 26, y + 124, { f: D3_PF, w: 700, s: 56, a: 'left' });
        d3_chg(g, c, x + 28, y + 172, { s: 18, a: 'left' });
        d3_spark(g, x + 150, y + 150, w - 178, 50, seed, end, D3.au, { lw: 2.5, area: 0.28, drop: 14, n: 30 });
      });
      // 210 hisse
      d3_gold(g, '210', 104, 900, { f: D3_PF, w: 900, s: 200, a: 'left' }, { sweep: 0.3 });
      const nw = measure(g, '210', { f: D3_PF, w: 900, s: 200 });
      text(g, 'hisse', 104 + nw + 30, 818, { f: D3_PF, w: 400, it: true, s: 56, a: 'left', c: D3.iv });
      d3_kick(g, 'BIST 108  ·  Nasdaq 102', 110 + nw + 30, 892, { s: 20, c: D3.champ, ls: 5 });
      text(g, 'Popüler, yükselenler, düşenler ve favoriler.', 110, 985, { f: D3_PF, w: 400, it: true, s: 28, a: 'left', c: D3.soft });
      // ── the Borsa screen as a luxurious card ──
      const X = 1000, Y = 116, CW = 810, CH = 904;
      d3_card(g, X, Y, CW, CH, { r: 22, a: 0.6, blur: 70 });
      g.save(); g.translate(X, Y);
      text(g, 'Borsa', 40, 78, { f: D3_PF, w: 700, s: 48, a: 'left', c: D3.iv });
      d3_t(g, 'BIST ve Nasdaq hisseleri', 40, 112, 19, { w: 500, c: D3.soft });
      d3_live(g, CW - 40, 66, 'CANLI · 14:23', { s: 16 });
      d3_tabs(g, 40, 168, [['Tümü', '210'], ['BIST', '108'], ['Nasdaq', '102']], 0, { s: 20, h: 54, tw: 241 });
      // filter chips
      let fx = 40;
      [['Favoriler', 0], ['Popüler', 1], ['Yükselenler', 0], ['Düşenler', 0]].forEach(([l, on], i) => {
        const f = { f: D3_UI, w: 600, s: 18 }, star = i === 0 ? 24 : 0, w = measure(g, l, f) + 36 + star, h = 42, y = 236;
        rr(g, fx, y - h / 2, w, h, h / 2);
        if (on) { g.fillStyle = D3.iv; g.fill(); } else { g.fillStyle = 'rgba(212,175,55,0.06)'; g.fill(); g.strokeStyle = hexA(D3.au, 0.35); g.lineWidth = 1; g.stroke(); }
        if (star) d3_star(g, fx + 26, y, 9, D3.or);
        d3_t(g, l, fx + 18 + star, y + 6.5, 18, { w: on ? 700 : 600, c: on ? '#14110C' : D3.champ });
        fx += w + 12;
      });
      // search
      rr(g, 40, 278, CW - 80, 54, 27); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill(); g.strokeStyle = hexA(D3.au, 0.3); g.lineWidth = 1; g.stroke();
      d3_search(g, 72, 302, 8, D3.soft);
      d3_t(g, 'Hisse adı ya da kodu ara…', 100, 312, 18, { w: 500, c: D3.dim });
      g.fillStyle = D3.or; g.fillRect(100 + measure(g, 'Hisse adı ya da kodu ara…', { f: D3_UI, w: 500, s: 18 }) + 8, 292, 2, 26);
      d3_t(g, '210 hisse', 40, 372, 17, { w: 600, c: D3.soft });
      d3_t(g, 'Fiyat · Günlük', CW - 40, 372, 17, { w: 600, c: D3.soft, a: 'right' });
      g.fillStyle = hexA(D3.au, 0.3); g.fillRect(40, 388, CW - 80, 1);
      D3_STOCKS.forEach(([t, n, p, c], i) => {
        const cy = 428 + i * 70;
        d3_tickIcon(g, 66, cy, 24, t);
        d3_t(g, t, 104, cy - 3, 21, { w: 700 });
        d3_t(g, n, 104, cy + 21, 15, { w: 500, c: D3.soft });
        const nwid = measure(g, n, { f: D3_UI, w: 500, s: 15 });
        d3_t(g, 'NASDAQ', 104 + nwid + 10, cy + 21, 11, { w: 700, c: D3.dim, ls: 1 });
        d3_spark(g, 380, cy - 16, 130, 32, 900 + i * 7, c[0] === '+' ? 1.05 : 0.97, c[0] === '+' ? D3.up : D3.dn, { lw: 2, n: 22, vol: 0.018 });
        d3_t(g, p, 660, cy + 8, 21, { w: 600, a: 'right' });
        d3_chg(g, c, CW - 40, cy, { s: 17 });
        if (i < 6) { g.fillStyle = hexA(D3.au, 0.1); g.fillRect(40, cy + 35, CW - 80, 1); }
      });
      g.restore();
      d3_glint(g, X + 6, Y + 6, 22, 0.7);
      d3_dust(g, 44, 100, { bokeh: 8 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '16–20 sn', title: 'Altın: Kapalıçarşı',
    desc: 'Gravürlü altın levhada Kapalıçarşı fiyatları satır satır kazınır; külçeler parlar, gram altın ₺6.510,83’e döner, ₺ TL / $ USD geçişi yapılır.',
    draw(g) {
      d3_bg(g, { lx: 520, ly: 900, lr: 1000 });
      addGlow(g, D3.au, 1360, 560, 760, 0.1);
      d3_folio(g, 'V', 'Altın ve emtia');
      d3_kick(g, 'Altın  ·  Kapalıçarşı  ·  canlı', 110, 172, { s: 18, c: D3.or, ls: 5 });
      d3_ivory(g, 'Kapalıçarşı', 110, 268, { f: D3_PF, w: 700, s: 92, a: 'left', ls: -1 });
      d3_gold(g, 'altını, canlı.', 110, 370, { f: D3_PF, w: 700, it: true, s: 92, a: 'left', ls: -1 }, { sweep: 0.45 });
      // TL / USD toggle
      d3_tabs(g, 110, 440, [['₺ TL'], ['$ USD']], 0, { s: 19, h: 46, tw: 110 });
      // hero quotes
      text(g, 'Gram Altın', 110, 528, { f: D3_PF, w: 400, it: true, s: 32, a: 'left', c: D3.champ });
      const mw = d3_money(g, '₺', '6.510', ',83', 106, 628, { s: 104, a: 'left', gold: true, w: 700, gf: { sweep: 0.62 }, curUp: 0.3 });
      d3_chg(g, '+0,40%', 106 + mw + 24, 596, { s: 22, a: 'left' });
      d3_t(g, 'Alış 6.422  ·  Satış 6.511', 110, 674, 22, { f: D3_MR, w: 600, c: D3.soft });
      d3_hair(g, 110, 702, 760, 702, 0.4, 1, false);
      text(g, 'Ons Altın', 110, 748, { f: D3_PF, w: 400, it: true, s: 28, a: 'left', c: D3.champ });
      const ow = d3_money(g, '$', '4.033', ',60', 260, 750, { s: 44, a: 'left', w: 700 });
      d3_chg(g, '+0,40%', 260 + ow + 18, 735, { s: 18, a: 'left' });
      // ingots and coins on the counter
      const base = 1030;
      const sf = g.createLinearGradient(0, base - 30, 0, H); sf.addColorStop(0, 'rgba(46,38,24,0.9)'); sf.addColorStop(1, 'rgba(11,10,8,1)');
      g.fillStyle = sf; g.fillRect(0, base - 22, 860, H - base + 22);
      d3_hair(g, 0, base - 22, 860, base - 22, 0.5, 1.2);
      [[250, 0, 1], [470, 0, 1], [360, 1, 1]].forEach(([cx, row]) => d3_ingot(g, cx, base - row * 92, 210, 62, 30, { glint: row === 1 ? 1 : 0 }));
      d3_stack(g, 640, base - 6, 8, 46, 15, 13, 71);
      d3_stack(g, 740, base + 4, 5, 46, 15, 13, 72);
      d3_coinFace(g, 120, base - 54, 48);
      // ── the engraved price plate ──
      const PX = 900, PY = 112, PW = 920, PH = 900;
      d3_plate(g, PX, PY, PW, PH);
      g.save(); g.translate(PX, PY);
      d3_engrave(g, 'ALTIN FİYATLARI', 64, 112, { f: D3_PF, w: 900, s: 44, a: 'left', ls: 4 });
      d3_engrave(g, 'Kapalıçarşı · canlı', 66, 152, { f: D3_PF, w: 400, it: true, s: 24, a: 'left', c: '#4A3208' });
      // new / old mint toggle, engraved
      const tx = PW - 64 - 340, ty = 104;
      rr(g, tx, ty - 25, 340, 50, 25); g.fillStyle = 'rgba(70,48,6,0.12)'; g.fill(); g.strokeStyle = 'rgba(60,40,4,0.55)'; g.lineWidth = 1.2; g.stroke();
      rr(g, tx + 170, ty - 21, 166, 42, 21); g.fillStyle = '#2A1A03'; g.fill();
      d3_engrave(g, 'Yeni basım', tx + 85, ty + 7, { f: D3_MR, w: 700, s: 19 });
      text(g, 'Eski basım', tx + 253, ty + 7, { f: D3_MR, w: 700, s: 19, c: '#F3E5AB' });
      // columns
      const cA = 560, cS = 720, cC = PW - 62;
      d3_engrave(g, 'ÜRÜN', 66, 214, { f: D3_MR, w: 800, s: 15, a: 'left', ls: 4, c: '#4A3208' });
      d3_engrave(g, 'ALIŞ', cA, 214, { f: D3_MR, w: 800, s: 15, a: 'right', ls: 4, c: '#4A3208' });
      d3_engrave(g, 'SATIŞ', cS, 214, { f: D3_MR, w: 800, s: 15, a: 'right', ls: 4, c: '#4A3208' });
      d3_engrave(g, 'DEĞİŞİM', cC, 214, { f: D3_MR, w: 800, s: 15, a: 'right', ls: 4, c: '#4A3208' });
      const rule = (y, a = 0.5) => { g.fillStyle = `rgba(60,40,4,${a})`; g.fillRect(64, y, PW - 128, 1.2); g.fillStyle = 'rgba(255,248,215,0.45)'; g.fillRect(64, y + 1.2, PW - 128, 1); };
      rule(232, 0.7);
      D3_GOLD.forEach(([n, sub, a, s, c], i) => {
        const y = 246 + i * 68, by = y + (sub ? 36 : 44);
        d3_engrave(g, n, 66, by, { f: D3_PF, w: 700, s: 30, a: 'left' });
        if (sub) d3_engrave(g, sub, 66, by + 24, { f: D3_PF, w: 400, it: true, s: 17, a: 'left', c: '#5A400E' });
        d3_engrave(g, a, cA, y + 44, { f: D3_PF, w: 700, s: 29, a: 'right', c: '#4A3208' });
        d3_engrave(g, s, cS, y + 44, { f: D3_PF, w: 700, s: 29, a: 'right' });
        if (c) {
          const f = { f: D3_MR, w: 800, s: 21 }, cw = measure(g, c, f);
          d3_engrave(g, c, cC, y + 43, { ...f, a: 'right', c: '#17572E' });
          g.fillStyle = '#17572E'; g.beginPath(); g.moveTo(cC - cw - 22, y + 37); g.lineTo(cC - cw - 14, y + 25); g.lineTo(cC - cw - 6, y + 37); g.closePath(); g.fill();
        } else { g.fillStyle = 'rgba(60,40,4,0.35)'; g.fillRect(cC - 22, y + 36, 22, 2); }
        if (i < 8) rule(y + 68, 0.28);
      });
      g.restore();
      d3_glint(g, PX + PW * 0.52, PY + 12, 30, 0.9);
      d3_glint(g, PX + 12, PY + PH * 0.7, 20, 0.6);
      text(g, 'Gümüş, petrol ve fazlası da tek ekranda.', PX + PW / 2, 1056, { f: D3_PF, w: 400, it: true, s: 26, c: D3.soft });
      d3_dust(g, 55, 110, { bokeh: 10 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '20–24 sn', title: 'Kasam: Kasa kapısı',
    desc: 'Ağır kasa kapısı yavaşça açılır, içeriden altın ışık taşar; külçeler parlar, Kasam kartında ₺1.250.430 sayacı döner ve “Kasamı Gör” düğmesi belirir.',
    draw(g) {
      d3_bg(g, { lx: 1300, ly: 560, lr: 1100 });
      // wall panelling behind the vault
      g.strokeStyle = hexA(D3.au, 0.06); g.lineWidth = 1;
      for (let k = 0; k < 12; k++) { const xx = 880 + k * 90; g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, H); g.stroke(); }
      d3_vault(g, 1300, 560, 360, 1.3);
      // light spilling onto the floor
      g.save(); g.globalCompositeOperation = 'lighter';
      const fl = g.createLinearGradient(0, 960, 0, H); fl.addColorStop(0, 'rgba(255,200,110,0.16)'); fl.addColorStop(1, 'rgba(255,200,110,0)');
      g.fillStyle = fl; g.beginPath(); g.moveTo(1000, 960); g.lineTo(1500, 960); g.lineTo(1700, H); g.lineTo(820, H); g.closePath(); g.fill();
      g.restore();
      d3_folio(g, 'VI', 'Kasam');
      d3_kick(g, 'Kişisel varlıklarınız', 110, 172, { s: 18, c: D3.or, ls: 5 });
      d3_gold(g, 'Kasam', 100, 352, { f: D3_PF, w: 900, s: 196, a: 'left', ls: -2 }, { sweep: 0.42, glow: 0.45 });
      text(g, 'Altın, döviz ve kişisel varlıklarınızı', 110, 442, { f: D3_PF, w: 400, it: true, s: 40, a: 'left', c: D3.iv });
      text(g, 'tek ekranda güvenle takip edin.', 110, 494, { f: D3_PF, w: 400, it: true, s: 40, a: 'left', c: D3.iv });
      // Kasam card
      const kx = 110, ky = 570, kw = 640, kh = 380;
      d3_card(g, kx, ky, kw, kh, { r: 22, a: 0.6, blur: 60 });
      g.fillStyle = D3.or; g.fillRect(kx + 1.5, ky + 40, 3, 70);
      d3_kick(g, 'Kasam', kx + 40, ky + 62, { s: 18, c: D3.au, ls: 6 });
      d3_t(g, 'Tek ekranda · güvenle', kx + kw - 40, ky + 62, 17, { f: D3_MR, w: 600, c: D3.soft, a: 'right' });
      d3_money(g, '₺', '1.250.430', '', kx + 34, ky + 190, { s: 112, a: 'left', gold: true, w: 900, gf: { sweep: 0.7 } });
      d3_hair(g, kx + 40, ky + 236, kx + kw - 40, ky + 236, 0.35, 1, false);
      [['Altın', 0.6], ['Döviz', 0.24], ['Kişisel', 0.16]].forEach(([l, v], i, arr) => {
        const x0 = kx + 40 + arr.slice(0, i).reduce((a, b) => a + b[1], 0) * (kw - 80), w = v * (kw - 80);
        g.fillStyle = [d3_foil(g, x0, 0, x0 + w, 0), hexA(D3.champ, 0.7), hexA(D3.or, 0.85)][i];
        rr(g, x0 + (i ? 3 : 0), ky + 258, w - 3, 8, 4); g.fill();
        d3_t(g, l, x0 + (i ? 3 : 0), ky + 292, 16, { f: D3_MR, w: 600, c: D3.soft });
      });
      d3_button(g, kx + 40, ky + 310, 290, 52, 'Kasamı Gör', { s: 20, sweep: 0.6 });
      d3_t(g, 'Fiyatlar örnektir', kx + kw - 40, ky + 344, 15, { f: D3_MR, w: 500, c: D3.dim, a: 'right' });
      d3_glint(g, kx + 8, ky + 8, 20, 0.6);
      d3_dust(g, 66, 150, { bokeh: 14, x0: 820 });
      d3_dust(g, 67, 40, { bokeh: 4, x1: 820 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz',
    desc: 'Mum grafiğinde fiyat turuncu alarm çizgisini keser, bildirim kartı düşer; hisse analizi, teknik analiz, fiyat tahmini ve sinyal alarmları dizine yazılır.',
    draw(g) {
      d3_bg(g, { lx: 1380, ly: 560, lr: 1100 });
      d3_folio(g, 'VII', 'Alarm ve analiz');
      d3_ivory(g, 'Alarm kurun,', 110, 250, { f: D3_PF, w: 700, s: 90, a: 'left', ls: -1 });
      d3_gold(g, 'analizleri inceleyin.', 110, 350, { f: D3_PF, w: 700, it: true, s: 74, a: 'left', ls: -1 }, { sweep: 0.5 });
      // feature index
      const rom = ['I', 'II', 'III', 'IV'], feats = ['Hisse analizi', 'Teknik analiz', 'Fiyat tahmini', 'Sinyal alarmları'];
      feats.forEach((n, i) => {
        const cx = 110 + (i % 2) * 380, y = 460 + Math.floor(i / 2) * 82;
        text(g, rom[i] + '.', cx + 50, y, { f: D3_PF, w: 400, it: true, s: 32, a: 'right', c: i === 3 ? D3.or : D3.au });
        text(g, n, cx + 66, y, { f: D3_PF, w: 700, s: 34, a: 'left', c: D3.iv });
        d3_hair(g, cx, y + 26, cx + 340, y + 26, 0.3, 1, false);
      });
      // news & feed
      const ny = 700;
      text(g, 'Haberler', 110, ny, { f: D3_PF, w: 700, s: 34, a: 'left', c: D3.iv });
      const hw = measure(g, 'Haberler', { f: D3_PF, w: 700, s: 34 });
      g.fillStyle = D3.or; g.fillRect(110, ny + 14, hw, 2.5);
      text(g, 'Akış', 110 + hw + 40, ny, { f: D3_PF, w: 400, it: true, s: 34, a: 'left', c: D3.soft });
      [['14:20', 'BIST 100 güne yükselişle devam ediyor'], ['13:55', 'Gram altın Kapalıçarşı’da yükselişte'], ['13:40', 'Bitcoin 80 bin dolar seviyesini koruyor']].forEach(([t, h], i) => {
        const y = ny + 76 + i * 72;
        d3_t(g, t, 110, y, 19, { f: D3_MR, w: 700, c: D3.au });
        text(g, h, 196, y, { f: D3_PF, w: 700, s: 27, a: 'left', c: D3.iv });
        d3_hair(g, 110, y + 26, 820, y + 26, 0.22, 1, false);
      });
      // ── technical chart card ──
      const X = 930, Y = 330, CW = 880, CH = 660;
      d3_card(g, X, Y, CW, CH, { r: 22, a: 0.55, blur: 60 });
      g.save(); g.translate(X, Y);
      text(g, 'Gram Altın', 40, 76, { f: D3_PF, w: 700, s: 40, a: 'left', c: D3.iv });
      const gw = measure(g, 'Gram Altın', { f: D3_PF, w: 700, s: 40 });
      rr(g, 40 + gw + 20, 50, 150, 34, 17); g.fillStyle = 'rgba(212,175,55,0.1)'; g.fill(); g.strokeStyle = hexA(D3.au, 0.4); g.lineWidth = 1; g.stroke();
      d3_t(g, 'Teknik analiz', 40 + gw + 95, 73, 15, { w: 600, c: D3.champ, a: 'center' });
      d3_t(g, '₺6.510,83', CW - 150, 78, 32, { w: 700, a: 'right' });
      d3_chg(g, '+0,40%', CW - 40, 67, { s: 18 });
      // candles
      const N = 34, rnd = mulberry32(707), C = [];
      let prev = 6452;
      for (let i = 0; i < N; i++) {
        let cl = 6452 + 40 * (i / (N - 2)) + 9 * Math.sin(i * 1.3) + (rnd() - 0.5) * 9;
        if (i < N - 1) cl = Math.min(cl, 6496); else cl = 6510.83;
        const op = prev + (rnd() - 0.5) * 3;
        C.push([op, Math.max(op, cl) + rnd() * 6 + 1, Math.min(op, cl) - rnd() * 6 - 1, cl]); prev = cl;
      }
      const gx0 = 40, gx1 = CW - 150, gy0 = 130, gy1 = CH - 110, lo = 6440, hi = 6540;
      const my = v => gy1 - (v - lo) / (hi - lo) * (gy1 - gy0), cw = (gx1 - gx0) / N;
      g.strokeStyle = hexA(D3.au, 0.08); g.lineWidth = 1;
      for (let k = 0; k <= 5; k++) { const yy = lerp(gy0, gy1, k / 5), v = lo + (hi - lo) * (1 - k / 5); g.beginPath(); g.moveTo(gx0, yy); g.lineTo(gx1, yy); g.stroke(); if (v !== 6500) d3_t(g, v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), gx1 + 16, yy + 5, 14, { w: 500, c: D3.dim }); }
      C.forEach(([o, h, l, c], i) => {
        const cx = gx0 + (i + 0.5) * cw, up = c >= o;
        g.strokeStyle = up ? D3.au : hexA(D3.soft, 0.8); g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(cx, my(h)); g.lineTo(cx, my(l)); g.stroke();
        const yt = my(Math.max(o, c)), hb = Math.max(2, Math.abs(my(o) - my(c)));
        if (up) { g.fillStyle = d3_foil(g, cx - 8, yt, cx + 8, yt + hb + 10); g.fillRect(cx - cw * 0.3, yt, cw * 0.6, hb); }
        else { g.fillStyle = '#16130F'; g.fillRect(cx - cw * 0.3, yt, cw * 0.6, hb); g.strokeRect(cx - cw * 0.3, yt, cw * 0.6, hb); }
        const vh = 14 + rnd() * 36; g.fillStyle = hexA(D3.au, 0.12); g.fillRect(cx - cw * 0.3, CH - 50 - vh, cw * 0.6, vh);
      });
      // moving average
      const ma = C.map((_, i) => { const s = C.slice(Math.max(0, i - 4), i + 1); return [gx0 + (i + 0.5) * cw, my(s.reduce((a, b) => a + b[3], 0) / s.length)]; });
      g.strokeStyle = hexA(D3.iv, 0.55); g.lineWidth = 1.5; g.beginPath(); smoothPath(g, ma); g.stroke();
      // alarm line at ₺6.500
      const ay = my(6500);
      g.setLineDash([10, 7]); g.strokeStyle = D3.or; g.lineWidth = 2; g.beginPath(); g.moveTo(gx0, ay); g.lineTo(gx1, ay); g.stroke(); g.setLineDash([]);
      rr(g, gx1 + 6, ay - 17, 128, 34, 6); g.fillStyle = D3.or; g.fill();
      d3_t(g, '₺6.500,00', gx1 + 70, ay + 6, 16, { w: 700, c: '#1A1005', a: 'center' });
      d3_bell(g, gx0 + 16, ay - 20, 18, D3.or);
      d3_t(g, 'Alarm', gx0 + 34, ay - 12, 15, { w: 700, c: D3.or });
      const lc = C[N - 1], lx = gx0 + (N - 0.5) * cw;
      d3_glint(g, lx, my(lc[3]), 22, 1, D3.or);
      d3_t(g, '1G · Gram Altın / TL', 40, CH - 22, 15, { w: 500, c: D3.dim });
      g.restore();
      // ── the alarm notification drops in ──
      const nx = 980, nyy = 132, nw = 790, nh = 164;
      g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
      rr(g, nx, nyy, nw, nh, 26); g.fillStyle = '#1E1A14'; g.fill(); g.restore();
      rr(g, nx, nyy, nw, nh, 26); const ng = g.createLinearGradient(nx, nyy, nx, nyy + nh); ng.addColorStop(0, '#2A251C'); ng.addColorStop(1, '#15120E'); g.fillStyle = ng; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = hexA(D3.au, 0.6); g.stroke();
      d3_appIcon(g, nx + 72, nyy + nh / 2, 92);
      logoH(g, nx + 140, nyy + 50, 22, { ink: hexA(D3.iv, 0.85) });
      d3_t(g, 'şimdi', nx + nw - 36, nyy + 48, 17, { w: 500, c: D3.soft, a: 'right' });
      d3_bell(g, nx + 152, nyy + 88, 20, D3.or);
      d3_t(g, 'Fiyat alarmı', nx + 172, nyy + 96, 26, { w: 700 });
      d3_t(g, 'Gram Altın ₺6.500,00 seviyesini geçti: ₺6.510,83', nx + 140, nyy + 134, 21, { w: 500, c: D3.champ });
      d3_glint(g, nx + nw - 20, nyy + 6, 18, 0.7);
      d3_dust(g, 77, 90, { bokeh: 8 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '29–34 sn', title: 'Bağlantı ve ayrıcalıklar',
    desc: 'Binance, Bitget ve MEXC plakalarından altın iplikler uygulama simgesine uzanır; Binance %10 komisyon kuponu parlar, “Kripto Hakkında Her Şey” videoları dizilir.',
    draw(g) {
      d3_bg(g, { lx: 900, ly: 560, lr: 1200 });
      d3_folio(g, 'VIII', 'Bağlantı ve ayrıcalıklar');
      d3_ivory(g, 'Kripto hesabınızı', 110, 240, { f: D3_PF, w: 700, s: 80, a: 'left', ls: -1 });
      d3_gold(g, 'kolayca bağlayın.', 110, 334, { f: D3_PF, w: 700, it: true, s: 80, a: 'left', ls: -1 }, { sweep: 0.55 });
      // medallion with the app icon
      const sx = 735, sy = 620, R = 128;
      const ys = [470, 620, 770], pw = 330, ph = 84;
      ['Binance', 'Bitget', 'MEXC'].forEach((b, i) => {
        const y = ys[i], x0 = 110 + pw, ang = Math.atan2(y - sy, x0 - sx), ex = sx + Math.cos(ang) * (R + 14), ey = sy + Math.sin(ang) * (R + 14);
        const c1 = [x0 + 90, y], c2 = [ex - 70, ey];
        const tg = g.createLinearGradient(x0, y, ex, ey); tg.addColorStop(0, hexA(D3.au, 0.8)); tg.addColorStop(1, hexA(D3.or, 0.6));
        g.strokeStyle = tg; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], ex, ey); g.stroke();
        const t = [0.55, 0.4, 0.65][i], u = 1 - t;
        d3_glint(g, u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * ex, u * u * u * y + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * ey, 12, 0.85);
        // engraved plate
        const x = 110;
        g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
        rr(g, x, y - ph / 2, pw, ph, 4);
        const pg = g.createLinearGradient(0, y - ph / 2, 0, y + ph / 2); pg.addColorStop(0, '#2A251C'); pg.addColorStop(1, '#14110D');
        g.fillStyle = pg; g.fill(); g.restore();
        rr(g, x, y - ph / 2, pw, ph, 4); g.strokeStyle = d3_foil(g, x, y - ph / 2, x + pw, y + ph / 2); g.lineWidth = 1.8; g.stroke();
        rr(g, x + 7, y - ph / 2 + 7, pw - 14, ph - 14, 2); g.strokeStyle = hexA(D3.au, 0.22); g.lineWidth = 1; g.stroke();
        for (const [rx, ry] of [[x + 16, y - ph / 2 + 16], [x + pw - 16, y - ph / 2 + 16], [x + 16, y + ph / 2 - 16], [x + pw - 16, y + ph / 2 - 16]]) {
          g.fillStyle = d3_foil(g, rx - 3, ry - 3, rx + 3, ry + 3); g.beginPath(); g.arc(rx, ry, 3, 0, TAU); g.fill();
        }
        const o = { f: D3_PF, w: 700, s: 32, a: 'left' }, tx = x + 40;
        text(g, b, tx, y + 11 - 1, { ...o, c: 'rgba(0,0,0,0.9)' });
        text(g, b, tx, y + 11 + 1, { ...o, c: 'rgba(255,236,190,0.18)' });
        text(g, b, tx, y + 11, { ...o, c: D3.champ });
        check(g, x + pw - 46, y + 1, 18, D3.au, 2.5);
      });
      addGlow(g, D3.au, sx, sy, R * 2.1, 0.2);
      g.save(); g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
      g.fillStyle = d3_foil(g, sx - R, sy - R, sx + R, sy + R); g.beginPath(); g.arc(sx, sy, R, 0, TAU); g.fill(); g.restore();
      const ig = g.createRadialGradient(sx - R * 0.3, sy - R * 0.4, 0, sx, sy, R * 0.9); ig.addColorStop(0, '#2A2419'); ig.addColorStop(1, '#0D0B08');
      g.fillStyle = ig; g.beginPath(); g.arc(sx, sy, R * 0.88, 0, TAU); g.fill();
      g.strokeStyle = hexA(D3.au, 0.5); g.lineWidth = 1; g.beginPath(); g.arc(sx, sy, R * 0.62, 0, TAU); g.stroke();
      d3_arcText(g, 'KOLAYCA BAĞLAYIN  ·  BINANCE  ·  BITGET  ·  MEXC  ·  ', sx, sy, R * 0.75, -Math.PI / 2 + 0.2, { f: D3_MR, w: 700, s: 14, c: D3.au, fill: true });
      d3_appIcon(g, sx, sy, R * 0.92);
      d3_button(g, sx - 110, sy + R + 50, 220, 60, 'Bağla', { s: 22, edge: true });
      d3_t(g, 'Binance, Bitget ve MEXC hesaplarınızı Kripto724’e kolayca bağlayın.', 110, 972, 23, { f: D3_MR, w: 500, c: D3.soft });
      // divider
      d3_hair(g, 985, 150, 985, 1010, 0.45, 1.2);
      // ── commission coupon ──
      const KX = 1050, KY = 140, KW = 760, KH = 360, stub = 200;
      g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 50; g.shadowOffsetY = 22;
      const ticket = () => {
        g.beginPath(); g.moveTo(KX + 8, KY); g.lineTo(KX + stub - 18, KY); g.arc(KX + stub, KY, 18, Math.PI, 0, true); g.lineTo(KX + KW - 8, KY); g.quadraticCurveTo(KX + KW, KY, KX + KW, KY + 8);
        g.lineTo(KX + KW, KY + KH - 8); g.quadraticCurveTo(KX + KW, KY + KH, KX + KW - 8, KY + KH); g.lineTo(KX + stub + 18, KY + KH); g.arc(KX + stub, KY + KH, 18, 0, Math.PI, true);
        g.lineTo(KX + 8, KY + KH); g.quadraticCurveTo(KX, KY + KH, KX, KY + KH - 8); g.lineTo(KX, KY + 8); g.quadraticCurveTo(KX, KY, KX + 8, KY); g.closePath();
      };
      ticket(); const tg = g.createLinearGradient(KX, KY, KX + KW * 0.4, KY + KH); tg.addColorStop(0, '#26211A'); tg.addColorStop(1, '#100E0B'); g.fillStyle = tg; g.fill(); g.restore();
      ticket(); g.strokeStyle = d3_foil(g, KX, KY, KX + KW, KY + KH); g.lineWidth = 2; g.stroke();
      g.save(); ticket(); g.clip();
      g.fillStyle = d3_foil(g, KX, KY, KX + stub, KY + KH, D3_OFOIL); g.globalAlpha = 0.16; g.fillRect(KX, KY, stub, KH); g.globalAlpha = 1;
      g.fillStyle = D3.or; g.fillRect(KX, KY, 6, KH);
      g.restore();
      g.setLineDash([6, 7]); g.strokeStyle = hexA(D3.au, 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(KX + stub, KY + 22); g.lineTo(KX + stub, KY + KH - 22); g.stroke(); g.setLineDash([]);
      logo(g, KX + stub / 2 + 2, KY + KH / 2, 104, { ink: D3.iv });
      const cx0 = KX + stub + 48;
      d3_kick(g, 'Komisyon indirimi', cx0, KY + 64, { s: 18, c: D3.or, ls: 6 });
      text(g, 'Binance', cx0, KY + 134, { f: D3_PF, w: 700, s: 54, a: 'left', c: D3.iv });
      const pw10 = d3_orange(g, '%10', cx0 - 6, KY + 300, { f: D3_PF, w: 900, s: 168, a: 'left', ls: -2 }, { sweep: 0.5 });
      text(g, 'indirim', cx0 + pw10 + 16, KY + 296, { f: D3_PF, w: 400, it: true, s: 54, a: 'left', c: D3.iv });
      d3_glint(g, KX + KW - 30, KY + 8, 22, 0.8);
      // marquee strip, as in the app
      const MY = 560;
      g.fillStyle = 'rgba(247,147,26,0.08)'; g.fillRect(KX, MY - 26, KW, 52);
      g.fillStyle = hexA(D3.or, 0.6); g.fillRect(KX, MY - 26, KW, 1); g.fillRect(KX, MY + 25, KW, 1);
      const lw0 = logoH(g, KX + 20, MY + 9, 22, { ink: D3.iv });
      d3_t(g, 'Komisyon İndirimi Seç  ·  BINANCE %10 indirim  ·  Bitget…', KX + 20 + lw0 + 22, MY + 8, 20, { f: D3_MR, w: 700, c: D3.champ });
      // ── "Kripto Hakkında Her Şey" videos ──
      const VY = 690;
      text(g, 'Kripto Hakkında Her Şey', KX, VY, { f: D3_PF, w: 700, s: 42, a: 'left', c: D3.iv });
      const bx = KX + KW - 220;
      rr(g, bx, VY - 38, 220, 50, 25); g.fillStyle = 'rgba(247,147,26,0.1)'; g.fill(); g.strokeStyle = D3.or; g.lineWidth = 1.5; g.stroke();
      d3_t(g, 'Şimdi Keşfet', bx + 26, VY - 6, 18, { f: D3_MR, w: 800, c: D3.or });
      d3_arrow(g, bx + 160, VY - 13, 34, D3.or, 2);
      [['Kripto nedir?', '04:12', 81], ['Blokzincir nasıl çalışır?', '06:30', 82], ['Teknik analize giriş', '05:45', 83]].forEach(([t, d, seed], i) => {
        const tx = KX + i * 262, ty = VY + 40, tw = 236, th = 150;
        g.save(); g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 24; g.shadowOffsetY = 10; rr(g, tx, ty, tw, th, 12); g.fillStyle = '#16130F'; g.fill(); g.restore();
        g.save(); rr(g, tx, ty, tw, th, 12); g.clip();
        const vg = g.createLinearGradient(tx, ty, tx + tw, ty + th); vg.addColorStop(0, '#2C2519'); vg.addColorStop(1, '#0F0D0A'); g.fillStyle = vg; g.fillRect(tx, ty, tw, th);
        d3_spark(g, tx + 10, ty + 40, tw - 20, 80, seed, 1.12, D3.au, { lw: 2, area: 0.22, drop: 40, vol: 0.03 });
        g.restore();
        rr(g, tx, ty, tw, th, 12); g.strokeStyle = hexA(D3.au, 0.45); g.lineWidth = 1.2; g.stroke();
        g.fillStyle = 'rgba(11,10,8,0.6)'; g.beginPath(); g.arc(tx + tw / 2, ty + th / 2, 30, 0, TAU); g.fill();
        g.strokeStyle = d3_foil(g, tx + tw / 2 - 30, ty + th / 2 - 30, tx + tw / 2 + 30, ty + th / 2 + 30); g.lineWidth = 2; g.stroke();
        g.fillStyle = D3.or; g.beginPath(); g.moveTo(tx + tw / 2 - 9, ty + th / 2 - 13); g.lineTo(tx + tw / 2 + 14, ty + th / 2); g.lineTo(tx + tw / 2 - 9, ty + th / 2 + 13); g.closePath(); g.fill();
        rr(g, tx + tw - 66, ty + th - 34, 56, 24, 6); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fill();
        d3_t(g, d, tx + tw - 38, ty + th - 16, 14, { w: 600, c: D3.iv, a: 'center' });
        const tf = fit(g, t, { f: D3_MR, w: 700, s: 19 }, tw);
        d3_t(g, t, tx, ty + th + 36, tf.s, { f: D3_MR, w: 700 });
      });
      d3_dust(g, 88, 90, { bokeh: 8 });
      d3_finish(g, { va: 0.45 });
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış: Davetiye',
    desc: 'Davetiye kartı öne gelir; resmî logo ve “Ücretsiz ailemize katılın!” belirir, turuncu kenarlı altın düğmede kripto724.com parlar, altın tozu süzülür.',
    draw(g) {
      d3_bg(g, { ly: 500, lr: 1100 });
      const cx0 = 440, cy0 = 56, cw = 1040, ch = 900;
      d3_card(g, cx0, cy0, cw, ch, { r: 4, blur: 90, a: 0, inner: false, top: '#1E1A14', bot: '#0E0C09' });
      d3_frame(g, cx0 + 22, cy0 + 22, cw - 44, ch - 44, { c: 30, inset: 14, lw: 2.5 });
      addGlow(g, D3.au, CX, 290, 380, 0.14);
      addGlow(g, D3.or, CX, 290, 220, 0.08);
      logo(g, CX, 290, 250, { ink: D3.iv });
      d3_orn(g, CX, 488, 440);
      d3_ivory(g, 'Ücretsiz ailemize', CX, 602, { f: D3_PF, w: 700, s: 84, ls: -1 });
      d3_orange(g, 'katılın!', CX, 730, { f: D3_PF, w: 900, it: true, s: 124, ls: -1 }, { sweep: 0.62 });
      d3_button(g, CX - 330, 782, 660, 96, 'kripto724.com', { s: 40, edge: true, sweep: 0.7, r: 8 });
      text(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1030, { f: D3_MR, w: 500, s: 22, c: '#948B78' });
      d3_glint(g, cx0 + 22, cy0 + 22 + 30, 34, 0.9);
      d3_glint(g, cx0 + cw - 22 - 30, cy0 + ch - 22, 24, 0.7);
      d3_sweep(g, 0.66, 0.05);
      d3_dust(g, 99, 200, { bokeh: 14 });
      d3_finish(g, { va: 0.55 });
    },
  },
];

window.DESIGN = {
  id: 3, name: 'Altın Seri',
  concept: 'Özel bankacılık zarafeti Kripto724’ün kendi ekranlarıyla buluşuyor: derin siyah ve kömür üzerinde altın varak, marka turuncusu vurgular, fildişi serif başlıklar ve ince çizgiler. Kapalıçarşı tablosu gravürlü bir altın levha, Kasam gerçek bir kasa kapısı; kapanış bir davetiye.',
  board: {
    bg: '#0E0C09', ink: '#F7F2E8', soft: '#A79E8B', accent: '#D4AF37', line: 'rgba(212,175,55,0.3)',
    display: { f: D3_PF, w: 700, ls: -1 }, text: { f: D3_MR, w: 500 }, badge: '#F7931A', badgeInk: '#0B0A08',
    paper(g, w, h) {
      const gr = g.createRadialGradient(w * 0.25, 0, 0, w * 0.25, 0, 2000);
      gr.addColorStop(0, 'rgba(212,175,55,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = mulberry32(3);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(243,229,171,${0.05 + r() * 0.18})`; g.beginPath(); g.arc(r() * w, r() * 470, 0.6 + r() * 1.6, 0, TAU); g.fill(); }
    },
  },
  extraFonts: [D3_UI],
  palette: [['#0B0A08', 'Siyah'], ['#1C1914', 'Kömür'], ['#D4AF37', 'Altın'], ['#F7931A', 'Turuncu'], ['#F7F2E8', 'Fildişi']],
  fonts: ['Playfair Display 700 · İtalik', 'Manrope · Inter (uygulama)'],
  motion: ['Yavaş kamera kaydırma, hafif 3B eğim', 'Altın ve turuncu varak ışık süpürmesi', 'Altın toz, açılan kasa kapısı'],
  music: 'sinematik piyano, yaylılar ve hafif saat tıkırtısı, 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d3_init,
  scenes: D3_SCENES,
};
