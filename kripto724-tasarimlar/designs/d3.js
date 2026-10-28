'use strict';
/* TASARIM 03 · ALTIN SERİ
 * Private banking meets a luxury magazine: deep black and charcoal, real-looking gold
 * foil (multi-stop gradients, bevel light, diagonal light sweeps), ivory Playfair
 * headlines with italic emphasis, hairline gold rules and frames, roman-numeral
 * chapters, gold dust and a slow cinematic camera (3D desk, tilted dashboard card).
 * Playfair has no ₺ glyph: every lira sign is set in Manrope. Arrows are drawn. */

const D3 = {
  k: '#0B0A08', coal: '#1C1914', au: '#D4AF37', champ: '#F3E5AB', iv: '#F7F2E8',
  soft: '#A79E8B', dim: '#6E6656', faint: '#3A342A', deep: '#9C7A26', bronze: '#6B5220', hi: '#FFF6D6',
};
const D3_PF = 'Playfair Display', D3_MR = 'Manrope';
// gold leaf: two light/dark cycles with hot highlights
const D3_FOIL = [[0, '#7A5B17'], [0.1, '#B68F2E'], [0.22, '#EBCB72'], [0.3, '#FFF3C4'], [0.38, '#E2BF5A'], [0.52, '#A47E24'],
  [0.62, '#C79F3C'], [0.74, '#F4DD8E'], [0.82, '#FFF0BC'], [0.9, '#C9A240'], [1, '#86661C']];
// allocation tones, all inside the gold family
const D3_TONES = ['#D4AF37', '#F3E5AB', '#A8832A', '#F7F2E8', '#7A5E1E', '#C8B98F'];
const D3_T = { grain: null, mc: null };

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
// ivory text with a soft cast shadow
function d3_ivory(g, s, x, y, o) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = o.s * 0.2; g.shadowOffsetY = o.s * 0.04;
  text(g, s, x, y, { c: D3.iv, ...o }); g.restore();
}
// gold-foil text: warm halo + dark under-edge, foil fill, bevel light, optional light sweep (0..1)
function d3_gold(g, s, x, y, o, f = {}) {
  const { w, xl } = d3_box(g, s, x, o);
  const top = y - o.s * 0.8, bot = y + o.s * 0.15;
  g.save();
  g.shadowColor = hexA(D3.au, f.glow == null ? 0.3 : f.glow); g.shadowBlur = o.s * 0.45;
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
// ── • ◆ • ── ornament
function d3_orn(g, x, y, w, a = 0.8) {
  d3_hair(g, x - w / 2, y, x - 30, y, a); d3_hair(g, x + 30, y, x + w / 2, y, a);
  d3_lozenge(g, x, y, 10);
  g.fillStyle = hexA(D3.au, a);
  for (const d of [-20, 20]) { g.beginPath(); g.arc(x + d, y, 2.4, 0, TAU); g.fill(); }
}
// thin four-point star with anamorphic streak: a glint on gold
function d3_glint(g, x, y, r, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a;
  glow(g, D3.au, x, y, r * 3.4, 0.5);
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
// magazine folio: roman numeral, rule, chapter label (+ quiet brand on the right)
function d3_folio(g, num, label, brand = true) {
  const no = { f: D3_PF, w: 400, it: true, s: 36, a: 'left' }, fx = 190;
  text(g, num, fx, 92, { ...no, c: D3.au });
  const nw = measure(g, num, no);
  d3_hair(g, fx + nw + 20, 80, fx + nw + 76, 80, 0.8, 1.2, false);
  d3_kick(g, label, fx + nw + 94, 88, { s: 17, c: D3.soft, ls: 6 });
  if (brand) text(g, 'AllInvestView', W - 110, 90, { f: D3_PF, w: 400, it: true, s: 28, a: 'right', c: hexA(D3.iv, 0.5) });
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
// "₺" in Manrope + Playfair figures + smaller decimals; returns total width
function d3_money(g, int, dec, x, y, o) {
  const s = o.s;
  const cur = { f: D3_MR, w: 600, s: s * 0.44, a: 'left' }, num = { f: D3_PF, w: o.w || 700, s, a: 'left', ls: o.ls || 0 }, dd = { ...num, s: s * 0.48 };
  const cw = measure(g, '₺', cur), gap = s * 0.07, nw = measure(g, int, num), dw = dec ? measure(g, dec, dd) : 0;
  const total = cw + gap + nw + dw;
  const x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  text(g, '₺', x0, y - s * (o.curUp == null ? 0.24 : o.curUp), { ...cur, c: o.cc || D3.au });
  if (o.gold) d3_gold(g, int, x0 + cw + gap, y, num, o.gf || {});
  else d3_ivory(g, int, x0 + cw + gap, y, { ...num, c: o.c || D3.iv });
  if (dec) text(g, dec, x0 + cw + gap + nw, y, { ...dd, c: o.dc || D3.soft });
  return total;
}
// smooth series from 1 to exactly `end` (seeded)
function d3_series(seed, n, end, vol) {
  const w = walk(seed, n, 0, vol), k = Math.pow(end / (w[n - 1] / w[0]), 1 / (n - 1));
  return w.map((v, i) => v / w[0] * Math.pow(k, i));
}
// the AllInvestView mark re-cut in gold: engraved disc, guilloché rosette, segmented ring, rising line
function d3_mark(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y);
  if (o.disc !== false) {
    const dg = g.createRadialGradient(-r * 0.3, -r * 0.4, 0, 0, 0, r);
    dg.addColorStop(0, '#2E271C'); dg.addColorStop(1, '#0C0B08');
    g.fillStyle = dg; g.beginPath(); g.arc(0, 0, r * 0.93, 0, TAU); g.fill();
  }
  g.save(); g.beginPath(); g.arc(0, 0, r * 0.86, 0, TAU); g.clip();
  g.strokeStyle = hexA(D3.au, 0.17); g.lineWidth = Math.max(0.6, r * 0.008);
  for (let k = 0; k < 36; k++) { g.beginPath(); g.ellipse(0, 0, r * 0.84, r * 0.3, k * Math.PI / 36, 0, TAU); g.stroke(); }
  g.restore();
  const th = r * 0.13, gap = 0.12;
  g.strokeStyle = d3_foil(g, -r, -r, r, r); g.lineWidth = th; g.lineCap = 'butt';
  for (let i = 0; i < 6; i++) { const a0 = -Math.PI / 2 + i * TAU / 6 + gap / 2; g.beginPath(); g.arc(0, 0, r, a0, a0 + TAU / 6 - gap); g.stroke(); }
  if (o.bezel !== false) { g.strokeStyle = hexA(D3.au, 0.5); g.lineWidth = Math.max(1, r * 0.014); g.beginPath(); g.arc(0, 0, r * 1.17, 0, TAU); g.stroke(); }
  const pts = [[-0.46, 0.2], [-0.16, -0.06], [0.06, 0.12], [0.44, -0.3]].map(([a, b]) => [a * r, b * r]);
  g.strokeStyle = D3.iv; g.lineWidth = r * 0.075; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  g.fillStyle = d3_foil(g, pts[3][0] - r * 0.1, pts[3][1] - r * 0.1, pts[3][0] + r * 0.1, pts[3][1] + r * 0.1);
  g.beginPath(); g.arc(pts[3][0], pts[3][1], r * 0.1, 0, TAU); g.fill();
  g.restore();
  if (o.glint) d3_glint(g, x + pts[3][0], y + pts[3][1], r * 0.35, o.glint);
}
// serif wordmark: "AllInvest" ivory roman (Playfair's capital I keeps its serifs) + "View" gold italic
function d3_wordmark(g, x, y, s, o = {}) {
  const A = { f: D3_PF, w: 700, s, a: 'left', ls: -s * 0.005 }, B = { ...A, it: true };
  const wa = measure(g, 'AllInvest', A), wb = measure(g, 'View', B), sp = s * 0.03, total = wa + sp + wb;
  const x0 = o.a === 'left' ? x : o.a === 'right' ? x - total : x - total / 2;
  d3_ivory(g, 'AllInvest', x0, y, A);
  d3_gold(g, 'View', x0 + wa + sp, y, B, { sweep: o.sweep, glow: 0.35 });
  return total;
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

/* ── coins (scene 6) ── */
function d3_coinSide(g, cx, cy, rx, ry, th) {
  const gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
  gr.addColorStop(0, '#3E2F0C'); gr.addColorStop(0.16, '#A8832A'); gr.addColorStop(0.34, '#F4DC92'); gr.addColorStop(0.42, '#FFF2C6');
  gr.addColorStop(0.56, '#C9A23F'); gr.addColorStop(0.84, '#7A5D1A'); gr.addColorStop(1, '#33270A');
  g.beginPath(); g.moveTo(cx - rx, cy); g.lineTo(cx - rx, cy + th); g.ellipse(cx, cy + th, rx, ry, 0, Math.PI, 0, true);
  g.lineTo(cx + rx, cy); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, false); g.closePath();
  g.fillStyle = gr; g.fill();
  // reeded edge
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
function d3_ghostStack(g, cx, base, n, rx, ry, th) {
  const top = base - n * th;
  g.save();
  g.fillStyle = hexA(D3.au, 0.05); g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx, base); g.ellipse(cx, base, rx, ry, 0, Math.PI, 0, true); g.lineTo(cx + rx, top); g.closePath(); g.fill();
  g.strokeStyle = hexA(D3.au, 0.16); g.lineWidth = 1;
  for (let i = 1; i < n; i++) { g.beginPath(); g.ellipse(cx, base - i * th, rx, ry, 0, 0, Math.PI); g.stroke(); }
  g.strokeStyle = hexA(D3.champ, 0.75); g.lineWidth = 1.5; g.setLineDash([6, 5]);
  g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx, base); g.ellipse(cx, base, rx, ry, 0, Math.PI, 0, true); g.lineTo(cx + rx, top); g.stroke();
  g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, TAU); g.stroke();
  g.setLineDash([]);
  g.restore();
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
function d3_rows(x, rows, x0, x1, y0, dy, o = {}) {
  rows.forEach(([l, v], i) => {
    const y = y0 + i * dy;
    text(x, l, x0, y, { f: D3_MR, w: 500, s: o.s || 21, a: 'left', c: o.lc || hexA(D3.iv, 0.72) });
    text(x, v, x1, y, { f: D3_MR, w: 600, s: o.s || 21, a: 'right', c: o.vc || D3.iv });
    if (o.rule !== false) { x.fillStyle = hexA(D3.au, o.ra || 0.18); x.fillRect(x0, y + dy * 0.38, x1 - x0, 1); }
  });
}
function d3_desk(x, TW, TH) {
  // dark leather writing surface
  x.fillStyle = '#15120E'; x.fillRect(0, 0, TW, TH);
  let gr = x.createRadialGradient(TW / 2, TH * 0.75, 0, TW / 2, TH * 0.75, TW * 0.55);
  gr.addColorStop(0, 'rgba(92,74,44,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, TW, TH);
  if (D3_T.grain) { x.save(); x.globalAlpha = 1.6; x.fillStyle = x.createPattern(D3_T.grain, 'repeat'); x.fillRect(0, 0, TW, TH); x.restore(); }
  x.save(); x.translate(350, 0);
  // 1 · broker statement
  d3_sheet(x, 420, 470, 520, 720, -0.12, (x, w, h) => {
    d3_kick(x, 'Hesap ekstresi', 40, 70, { s: 22 });
    text(x, 'Aracı kurum · Eylül', 40, 108, { f: D3_PF, w: 400, it: true, s: 24, a: 'left', c: D3.soft });
    x.fillStyle = hexA(D3.au, 0.6); x.fillRect(40, 132, w - 80, 1.5);
    d3_rows(x, [['Hisse senedi', '₺1.402.180'], ['ETF', '₺2.058.904'], ['Yatırım fonu', '₺412.300'], ['Opsiyon', '₺38.920'], ['Nakit', '₺96.120'], ['Komisyon', '−₺1.284'], ['Temettü', '₺8.940']], 40, w - 40, 190, 58);
    text(x, 'Sayfa 1 / 4', w - 40, h - 36, { f: D3_MR, w: 500, s: 17, a: 'right', c: D3.dim });
  });
  // 2 · second statement (partly under the spreadsheet)
  d3_sheet(x, 900, 210, 470, 330, 0.08, (x, w) => {
    d3_kick(x, 'Tahvil · vade cetveli', 36, 58, { s: 19 });
    x.fillStyle = hexA(D3.au, 0.5); x.fillRect(36, 78, w - 72, 1.2);
    d3_rows(x, [['2026 / 03', '%38,50'], ['2027 / 09', '%31,20'], ['2029 / 01', '%27,75']], 36, w - 36, 130, 54, { s: 20 });
  }, { fill: '#1A1712' });
  // 3 · spreadsheet print-out on ivory paper
  d3_sheet(x, 1080, 560, 700, 520, 0.05, (x, w, h) => {
    text(x, 'portföy_SON_v7', 30, 46, { f: D3_MR, w: 700, s: 22, a: 'left', c: '#3A3122' });
    const cols = [30, 170, 290, 420, 560, w - 20], rws = 10, y0 = 70, rh = 42;
    x.fillStyle = 'rgba(176,140,50,0.32)'; x.fillRect(cols[0], y0, cols[5] - cols[0], rh);
    x.strokeStyle = 'rgba(70,56,30,0.35)'; x.lineWidth = 1;
    for (let j = 0; j <= rws; j++) { x.beginPath(); x.moveTo(cols[0], y0 + j * rh); x.lineTo(cols[5], y0 + j * rh); x.stroke(); }
    for (const c of cols) { x.beginPath(); x.moveTo(c, y0); x.lineTo(c, y0 + rws * rh); x.stroke(); }
    const data = [['Varlık', 'Adet', 'Maliyet', 'Kur', 'Değer'], ['AAPL', '120', '142,10', '32,4?', '#REF!'], ['BTC', '0,85', '?', '—', '₺778.415'], ['VOO', '64', '381,02', '34,1', '#N/A'],
      ['ETH', '4,2', '2.140', '?', '#REF!'], ['Fon', '—', '—', '—', '₺412.300'], ['BND', '25', '72,40', '33,9', '#DEĞER!'], ['Altın', '?', '—', '—', '—'], ['KO', '90', '58,10', '#REF!', '—']];
    data.forEach((row, j) => row.forEach((v, i) => {
      const err = v[0] === '#' || v === '?';
      if (err && j > 0) { x.fillStyle = 'rgba(150,60,40,0.16)'; x.fillRect(cols[i] + 1, y0 + j * rh + 1, cols[i + 1] - cols[i] - 2, rh - 2); }
      text(x, v, cols[i] + 12, y0 + j * rh + 28, { f: D3_MR, w: j === 0 ? 700 : 500, s: 19, a: 'left', c: err && j > 0 ? '#8A3A28' : '#2E271B' });
    }));
    // a handwritten-looking circle around an error
    x.strokeStyle = 'rgba(140,50,30,0.6)'; x.lineWidth = 2.5;
    x.beginPath(); x.ellipse(cols[4] + 62, y0 + 1.5 * rh, 78, 26, -0.08, 0.2, TAU + 0.5); x.stroke();
  }, { fill: '#E3DAC6', edge: false });
  // 4 · fund report with a wax-seal stamp
  d3_sheet(x, 1560, 290, 520, 380, -0.07, (x, w, h) => {
    d3_kick(x, 'Yatırım fonu raporu', 40, 64, { s: 20 });
    text(x, '3. çeyrek', 40, 100, { f: D3_PF, w: 400, it: true, s: 24, a: 'left', c: D3.soft });
    for (let k = 0; k < 6; k++) { x.fillStyle = hexA(D3.iv, 0.14); x.fillRect(40, 140 + k * 34, (w - 80) * [0.92, 0.8, 0.88, 0.6, 0.85, 0.4][k], 9); }
    const sx = w - 90, sy = h - 80;
    x.fillStyle = d3_foil(x, sx - 46, sy - 46, sx + 46, sy + 46); x.beginPath(); x.arc(sx, sy, 46, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(70,50,8,0.6)'; x.lineWidth = 2; x.beginPath(); x.arc(sx, sy, 36, 0, TAU); x.stroke();
    d3_lozenge(x, sx, sy, 16, 'rgba(90,64,10,0.7)');
  });
  // 5 · phone with a crypto exchange app
  d3_sheet(x, 1890, 560, 300, 620, 0.16, (x, w, h) => {
    rr(x, 3, 3, w - 6, h - 6, 40); x.lineWidth = 5; x.strokeStyle = d3_foil(x, 0, 0, w, h); x.stroke();
    rr(x, 16, 16, w - 32, h - 32, 30); x.fillStyle = '#0E0D0B'; x.fill();
    x.fillStyle = '#000'; rr(x, w / 2 - 50, 26, 100, 22, 11); x.fill();
    text(x, 'Kripto borsası', 40, 104, { f: D3_MR, w: 600, s: 19, a: 'left', c: D3.soft });
    text(x, '₺778.415', 40, 152, { f: D3_MR, w: 700, s: 40, a: 'left', c: D3.iv });
    text(x, '−%2,10 bugün', 40, 186, { f: D3_MR, w: 600, s: 18, a: 'left', c: '#C98E6E' });
    const s = d3_series(41, 40, 0.93, 0.012).map((v, i) => [40 + i * 5.6, 300 - (v - 0.85) * 520]);
    x.strokeStyle = D3.au; x.lineWidth = 3; x.beginPath(); smoothPath(x, s); x.stroke();
    [['BTC', '₺512.300'], ['ETH', '₺184.900'], ['SOL', '₺81.215']].forEach(([a, b], i) => {
      const y = 380 + i * 64;
      x.fillStyle = hexA(D3.au, 0.25); x.beginPath(); x.arc(56, y - 7, 16, 0, TAU); x.fill();
      text(x, a, 86, y, { f: D3_MR, w: 700, s: 19, a: 'left', c: D3.iv });
      text(x, b, w - 40, y, { f: D3_MR, w: 600, s: 18, a: 'right', c: D3.soft });
    });
  }, { fill: '#050504', edge: false, r: 42 });
  // 6 · fountain pen across the papers
  x.save(); x.translate(760, 860); x.rotate(-0.36);
  x.save(); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 22; x.shadowOffsetY = 16;
  const L = 600, T = 30;
  let bg = x.createLinearGradient(0, -T / 2, 0, T / 2);
  bg.addColorStop(0, '#050403'); bg.addColorStop(0.3, '#4A4234'); bg.addColorStop(0.5, '#15120D'); bg.addColorStop(1, '#030302');
  rr(x, 0, -T / 2, L, T, T / 2); x.fillStyle = bg; x.fill(); x.restore();
  for (const [p, wd] of [[0.06, 10], [0.58, 22], [0.64, 6]]) { x.fillStyle = d3_foil(x, L * p, -T / 2, L * p + wd, T / 2); x.fillRect(L * p, -T / 2, wd, T); }
  x.fillStyle = d3_foil(x, 40, -T / 2 - 6, 330, -T / 2 + 2); rr(x, 40, -T / 2 - 5, 300, 7, 3); x.fill();
  x.fillStyle = d3_foil(x, L, -12, L + 90, 12); x.beginPath(); x.moveTo(L - 4, -12); x.lineTo(L + 92, 0); x.lineTo(L - 4, 12); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(40,28,4,0.7)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(L + 10, 0); x.lineTo(L + 88, 0); x.stroke();
  x.restore();
  x.restore();
}

/* ── init: grain tile + 1.000-path Monte Carlo (400 drawn) ── */
function d3_init() {
  const c = canvas(256, 256), x = c.getContext('2d'), id = x.createImageData(256, 256), r = mulberry32(303);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = r() < 0.5 ? 255 : 0;
    id.data[i] = v; id.data[i + 1] = v * 0.93; id.data[i + 2] = v * 0.8; id.data[i + 3] = r() * 16;
  }
  x.putImageData(id, 0, 0);
  D3_T.grain = c;
  const rm = mulberry32(1903), n = 400, steps = 90, paths = [];
  for (let i = 0; i < n; i++) { const p = [1]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] * Math.exp(0.0045 + 0.042 * gauss(rm))); paths.push(p); }
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const col = paths.map(p => p[k]).sort((a, b) => a - b); return col[Math.floor(q * (n - 1))]; });
  D3_T.mc = { paths, p5: pct(0.05), p50: pct(0.5), p95: pct(0.95) };
}

/* ───────────────────────── scenes ───────────────────────── */
const D3_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık servet',
    desc: 'Kamera loş bir masanın üzerinde yavaşça kayar: ekstreler, tablo çıktısı ve kripto uygulaması dağınık durur. Başlık fildişi ve altın italikle belirir.',
    draw(g) {
      d3_bg(g, { ly: 820, lr: 1300 });
      const T = makeTex(2800, 1000, 1.1), x = texBegin(T);
      d3_desk(x, T.w, T.h);
      plane3d(g, T.c, T.w, T.h, { x: CX, y: 830, z: 60, rx: -0.64, s: 1 }, 16, 8);
      // the far edge melts into darkness, a warm lamp pool on the near papers
      let gr = g.createLinearGradient(0, 300, 0, 640);
      gr.addColorStop(0, 'rgba(11,10,8,1)'); gr.addColorStop(1, 'rgba(11,10,8,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, 640);
      addGlow(g, D3.au, CX, 250, 700, 0.1);
      d3_sweep(g, 0.62, 0.05);
      d3_folio(g, 'I', 'Dağınıklık', false);
      d3_ivory(g, 'Hisse bir yerde.', CX, 230, { f: D3_PF, w: 700, s: 118, ls: -1 });
      d3_gold(g, 'Kripto başka yerde.', CX, 368, { f: D3_PF, w: 700, it: true, s: 118, ls: -1 }, { sweep: 0.34 });
      d3_kick(g, 'Hesaplar ise ayrı bir tabloda', CX, 446, { a: 'center', s: 24, ls: 7, c: D3.champ, w: 600 });
      d3_dust(g, 11, 90, { streak: 12, bokeh: 8 });
      d3_finish(g, { va: 0.7 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek görünüm',
    desc: 'Siyah sahnede altın bir çizgi çerçeveyi iki yönden çizer; "tek bir görünümde." altın varak ışığıyla parlar ve AllInvestView imzası belirir.',
    draw(g) {
      d3_bg(g, { ly: 500, lr: 1000 });
      d3_sweep(g, 0.6, 0.06);
      d3_frame(g, 290, 140, 1340, 800, { p: 0.86, c: 28 });
      d3_orn(g, CX, 268, 300);
      d3_ivory(g, 'Tüm yatırımlarınız,', CX, 430, { f: D3_PF, w: 700, s: 108, ls: -1 });
      d3_gold(g, 'tek bir görünümde.', CX, 580, { f: D3_PF, w: 700, it: true, s: 132, ls: -1 }, { sweep: 0.64, glow: 0.4 });
      d3_hair(g, CX - 260, 650, CX + 260, 650, 0.6, 1.2);
      const wm = measure(g, 'AllInvest', { f: D3_PF, w: 700, s: 80 }) + measure(g, 'View', { f: D3_PF, w: 700, it: true, s: 80 });
      const total = 96 + 34 + wm, x0 = CX - total / 2;
      d3_mark(g, x0 + 48, 768, 46, { glint: 0.9 });
      d3_wordmark(g, x0 + 96 + 34, 796, 80, { a: 'left', sweep: 0.2 });
      d3_kick(g, '8 varlık sınıfı · 60+ piyasa · 25+ aracı kurum', CX, 880, { a: 'center', s: 19, ls: 6, c: D3.soft, w: 600 });
      d3_dust(g, 22, 150);
      d3_finish(g);
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Portföy kartı',
    desc: 'Pano kartı hafif eğimle süzülür: toplam değer sayacı döner, altın getiri çizgisi S&P 500’ü geride bırakır, ince halka dağılımı tamamlar.',
    draw(g) {
      d3_bg(g, { ly: 480, lr: 1200 });
      const CW = 1560, CH = 800, T = makeTex(CW, CH, 1.4), x = texBegin(T);
      // ── card texture ──
      d3_card(x, 0, 0, CW, CH, { shadow: false, a: 0.55, r: 8 });
      d3_kick(x, 'Portföy', 50, 58, { s: 17, c: D3.soft, ls: 6 });
      text(x, 'Baz para birimi TRY  ·  Son güncelleme 03:00', CW - 50, 58, { f: D3_MR, w: 500, s: 17, a: 'right', c: D3.dim });
      x.fillStyle = hexA(D3.au, 0.25); x.fillRect(50, 78, CW - 100, 1);
      // value
      d3_kick(x, 'Toplam portföy değeri', 50, 138, { s: 18, c: D3.au });
      d3_money(x, '9.482.150', ',36', 46, 250, { s: 112, a: 'left' });
      // daily change with a drawn triangle
      x.fillStyle = D3.au; x.beginPath(); x.moveTo(52, 296); x.lineTo(62, 280); x.lineTo(72, 296); x.closePath(); x.fill();
      text(x, '+₺64.218,40  ·  +%0,68 bugün', 84, 297, { f: D3_MR, w: 600, s: 25, a: 'left', c: D3.champ });
      // chart
      const gx0 = 50, gx1 = 960, gy0 = 350, gy1 = 560;
      const you = d3_series(907, 100, 1.384, 0.014), spy = d3_series(331, 100, 1.25, 0.01);
      const lo = 0.86, hi = 1.45, mp = s => s.map((v, i) => [lerp(gx0, gx1, i / (s.length - 1)), gy1 - (v - lo) / (hi - lo) * (gy1 - gy0)]);
      const P = mp(you), S = mp(spy);
      x.strokeStyle = hexA(D3.au, 0.1); x.lineWidth = 1;
      for (let k = 0; k <= 3; k++) { const yy = lerp(gy0, gy1, k / 3); x.beginPath(); x.moveTo(gx0, yy); x.lineTo(gx1, yy); x.stroke(); }
      ['2022', '2023', '2024', '2025', '2026'].forEach((s, k) => text(x, s, lerp(gx0 + 40, gx1 - 40, k / 4), gy1 + 30, { f: D3_MR, w: 500, s: 16, c: D3.dim }));
      let ag = x.createLinearGradient(0, gy0, 0, gy1); ag.addColorStop(0, hexA(D3.au, 0.32)); ag.addColorStop(1, hexA(D3.au, 0));
      x.beginPath(); smoothPath(x, P); x.lineTo(gx1, gy1); x.lineTo(gx0, gy1); x.closePath(); x.fillStyle = ag; x.fill();
      x.setLineDash([7, 7]); x.strokeStyle = hexA(D3.iv, 0.6); x.lineWidth = 2; x.beginPath(); smoothPath(x, S); x.stroke(); x.setLineDash([]);
      x.save(); x.shadowColor = hexA(D3.au, 0.7); x.shadowBlur = 14;
      x.strokeStyle = d3_foil(x, gx0, gy0, gx1, gy1); x.lineWidth = 4; x.lineJoin = 'round'; x.beginPath(); smoothPath(x, P); x.stroke(); x.restore();
      const e = P[P.length - 1];
      x.fillStyle = D3.hi; x.beginPath(); x.arc(e[0], e[1], 7, 0, TAU); x.fill();
      x.strokeStyle = hexA(D3.au, 0.6); x.lineWidth = 1.5; x.beginPath(); x.arc(e[0], e[1], 15, 0, TAU); x.stroke();
      text(x, '+%38,4', e[0] - 24, e[1] - 30, { f: D3_PF, w: 700, s: 30, a: 'right', c: D3.champ });
      // legend
      x.fillStyle = D3.au; x.fillRect(560, 136, 30, 3);
      text(x, 'Portföyünüz', 600, 144, { f: D3_MR, w: 600, s: 18, a: 'left', c: D3.iv });
      x.setLineDash([6, 5]); x.strokeStyle = hexA(D3.iv, 0.7); x.lineWidth = 2; x.beginPath(); x.moveTo(740, 138); x.lineTo(770, 138); x.stroke(); x.setLineDash([]);
      text(x, 'S&P 500 (SPY)', 780, 144, { f: D3_MR, w: 600, s: 18, a: 'left', c: D3.soft });
      // holdings
      const hy = 640;
      ['Varlık', 'Sınıf', 'Değer', 'Günlük'].forEach((s, i) => d3_kick(x, s, [50, 420, 760, 960][i], hy - 14, { s: 14, c: D3.dim, ls: 4, a: i > 1 ? 'right' : 'left' }));
      [['AAPL', 'Apple Inc.', 'Hisse', '₺1.402.180', '+%1,24'], ['VOO', 'Vanguard S&P 500', 'ETF', '₺2.058.904', '+%0,58'], ['BTC', 'Bitcoin', 'Kripto', '₺778.415', '−%2,10']].forEach((r, i) => {
        const y = hy + 34 + i * 44;
        x.fillStyle = hexA(D3.au, 0.14); x.fillRect(50, y - 32, 910, 1);
        text(x, r[0], 50, y, { f: D3_MR, w: 700, s: 20, a: 'left', c: D3.iv });
        text(x, r[1], 130, y, { f: D3_PF, w: 400, it: true, s: 21, a: 'left', c: D3.soft });
        text(x, r[2], 420, y, { f: D3_MR, w: 500, s: 18, a: 'left', c: D3.soft });
        text(x, r[3], 760, y, { f: D3_MR, w: 600, s: 20, a: 'right', c: D3.iv });
        text(x, r[4], 960, y, { f: D3_MR, w: 700, s: 19, a: 'right', c: r[4][0] === '−' ? '#C98E6E' : D3.champ });
      });
      // allocation: thin gold donut
      x.fillStyle = hexA(D3.au, 0.25); x.fillRect(1030, 110, 1, 640);
      d3_kick(x, 'Varlık dağılımı', 1090, 138, { s: 18 });
      const dcx = 1290, dcy = 330, R = 140, alloc = [['Hisse', 44], ['ETF', 22], ['Kripto', 12], ['Tahvil', 10], ['Gayrimenkul', 7], ['Nakit', 5]];
      let a0 = -Math.PI / 2;
      x.lineCap = 'butt';
      alloc.forEach(([, v], i) => {
        const a1 = a0 + v / 100 * TAU;
        x.strokeStyle = D3_TONES[i]; x.lineWidth = i === 0 ? 18 : 12; x.beginPath(); x.arc(dcx, dcy, R, a0 + 0.025, a1 - 0.025); x.stroke();
        a0 = a1;
      });
      x.strokeStyle = hexA(D3.au, 0.25); x.lineWidth = 1; x.beginPath(); x.arc(dcx, dcy, R - 26, 0, TAU); x.stroke();
      text(x, '%44', dcx, dcy + 18, { f: D3_PF, w: 700, s: 64, c: D3.iv });
      text(x, 'hisse senedi', dcx, dcy + 54, { f: D3_PF, w: 400, it: true, s: 22, c: D3.soft });
      alloc.forEach(([l, v], i) => {
        const col = i < 3 ? 0 : 1, y = 540 + (i % 3) * 44, lx = 1090 + col * 210;
        d3_lozenge(x, lx + 6, y - 7, 8, D3_TONES[i]);
        text(x, l, lx + 24, y, { f: D3_MR, w: 600, s: 18, a: 'left', c: D3.iv });
        text(x, '%' + v, lx + 196, y, { f: D3_MR, w: 600, s: 18, a: 'right', c: D3.soft });
      });
      text(x, '+ ülke · sektör · aracı kurum', 1090, 690, { f: D3_PF, w: 400, it: true, s: 20, a: 'left', c: D3.dim });
      // diagonal sheen across the card
      x.save(); rr(x, 0, 0, CW, CH, 8); x.clip(); x.globalCompositeOperation = 'lighter';
      const sh = x.createLinearGradient(980, 0, 1240, 260); sh.addColorStop(0, 'rgba(255,230,170,0)'); sh.addColorStop(0.5, 'rgba(255,230,170,0.05)'); sh.addColorStop(1, 'rgba(255,230,170,0)');
      x.fillStyle = sh; x.fillRect(0, 0, CW, CH); x.restore();
      // ── place it in 3D ──
      const pose = { x: CX + 36, y: 530, z: 40, rx: 0.06, ry: -0.15, s: 0.93 };
      quadShadow(g, projector(pose), CW, CH, 0.8, 70, 40, 30);
      const Pj = plane3d(g, T.c, CW, CH, pose, 12, 8);
      const tl = Pj(-CW / 2, -CH / 2);
      d3_glint(g, tl[0] + 2, tl[1] + 2, 22, 0.8);
      d3_folio(g, 'III', 'Panel');
      text(g, 'Portföyünüzün tamamı, tek bakışta.', CX, 1020, { f: D3_PF, w: 400, it: true, s: 44, c: D3.champ });
      d3_dust(g, 33, 90, { bokeh: 8 });
      d3_finish(g, { va: 0.55 });
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her piyasa',
    desc: 'Roma rakamlı dizin satır satır yazılır; gravür küre yavaşça döner, piyasalar altın halkalarla yanar ve 60+ / 50+ rakamları yerine oturur.',
    draw(g) {
      d3_bg(g, { lx: 1380, ly: 540, lr: 900 });
      d3_folio(g, 'IV', 'Her varlık');
      d3_ivory(g, 'Her varlık,', 110, 250, { f: D3_PF, w: 700, s: 96, a: 'left', ls: -1 });
      d3_gold(g, 'her piyasa.', 110, 360, { f: D3_PF, w: 700, it: true, s: 96, a: 'left', ls: -1 }, { sweep: 0.5 });
      // index of asset classes
      d3_kick(g, 'Sekiz varlık sınıfı', 110, 455, { s: 18, c: D3.soft, ls: 6 });
      const names = ['Hisse senedi', 'ETF', 'Tahvil', 'Opsiyon', 'Kripto', 'Gayrimenkul', 'Yatırım fonu', 'Nakit'];
      const rom = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
      names.forEach((n, i) => {
        const cx = 110 + Math.floor(i / 4) * 390, y = 528 + (i % 4) * 68;
        text(g, rom[i] + '.', cx + 62, y, { f: D3_PF, w: 400, it: true, s: 30, a: 'right', c: D3.au });
        text(g, n, cx + 82, y, { f: D3_PF, w: 700, s: 36, a: 'left', c: D3.iv });
        d3_hair(g, cx, y + 24, cx + 350, y + 24, 0.3, 1, false);
      });
      // big figures
      d3_gold(g, '60+', 110, 930, { f: D3_PF, w: 900, s: 150, a: 'left' }, { sweep: 0.3 });
      text(g, 'piyasa', 400, 930, { f: D3_PF, w: 400, it: true, s: 44, a: 'left', c: D3.iv });
      g.fillStyle = hexA(D3.au, 0.4); g.fillRect(560, 815, 1, 130);
      d3_gold(g, '50+', 600, 930, { f: D3_PF, w: 900, s: 150, a: 'left' });
      text(g, 'para birimi', 890, 930, { f: D3_PF, w: 400, it: true, s: 44, a: 'left', c: D3.iv });
      // engraved globe
      const gx = 1400, gy = 520, R = 360, lc = 8 * Math.PI / 180, pc = 0.42, sp = Math.sin(pc), cp = Math.cos(pc);
      const proj = (la, lo) => { la *= Math.PI / 180; lo *= Math.PI / 180; const d = lo - lc, cl = Math.cos(la); return [gx + R * cl * Math.sin(d), gy - R * (cp * Math.sin(la) - sp * cl * Math.cos(d)), sp * Math.sin(la) + cp * cl * Math.cos(d)]; };
      addGlow(g, D3.au, gx, gy, R * 1.6, 0.12);
      const sg = g.createRadialGradient(gx - R * 0.35, gy - R * 0.4, R * 0.05, gx, gy, R);
      sg.addColorStop(0, '#2C2519'); sg.addColorStop(0.6, '#15120D'); sg.addColorStop(1, '#090806');
      g.fillStyle = sg; g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.fill();
      // bezel ring with ticks
      g.strokeStyle = hexA(D3.au, 0.35); g.lineWidth = 1; g.beginPath(); g.arc(gx, gy, R + 34, 0, TAU); g.stroke();
      for (let k = 0; k < 120; k++) {
        const a = k / 120 * TAU, l = k % 10 === 0 ? 16 : k % 5 === 0 ? 10 : 5;
        g.strokeStyle = hexA(D3.au, k % 10 === 0 ? 0.8 : 0.4); g.lineWidth = k % 10 === 0 ? 2 : 1;
        g.beginPath(); g.moveTo(gx + Math.cos(a) * (R + 34), gy + Math.sin(a) * (R + 34)); g.lineTo(gx + Math.cos(a) * (R + 34 - l), gy + Math.sin(a) * (R + 34 - l)); g.stroke();
      }
      // graticule (front half)
      const line = pts => { g.beginPath(); let on = false; for (const p of pts) { if (p[2] > 0) { on ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); on = true; } else on = false; } g.stroke(); };
      g.lineWidth = 1;
      for (let lo = -180; lo < 180; lo += 20) { g.strokeStyle = hexA(D3.au, 0.2); const pts = []; for (let la = -90; la <= 90; la += 3) pts.push(proj(la, lo)); line(pts); }
      for (let la = -60; la <= 60; la += 20) { g.strokeStyle = hexA(D3.au, la === 0 ? 0.45 : 0.2); const pts = []; for (let lo = -180; lo <= 180; lo += 3) pts.push(proj(la, lo)); line(pts); }
      // land dots, shaded towards the limb
      const bands = [new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
        const p = proj(GLOBE_DOTS[i], GLOBE_DOTS[i + 1]);
        if (p[2] <= 0.02) continue;
        bands[p[2] > 0.6 ? 2 : p[2] > 0.3 ? 1 : 0].rect(p[0] - 1.7, p[1] - 1.7, 3.4, 3.4);
      }
      [0.35, 0.6, 0.92].forEach((a, i) => { g.fillStyle = hexA(i === 2 ? D3.champ : D3.au, a); g.fill(bands[i]); });
      // rim light + specular
      g.strokeStyle = d3_foil(g, gx - R, gy - R, gx + R, gy + R); g.lineWidth = 2.5; g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.stroke();
      const spec = g.createRadialGradient(gx - R * 0.4, gy - R * 0.45, 0, gx - R * 0.4, gy - R * 0.45, R * 0.8);
      spec.addColorStop(0, 'rgba(255,240,200,0.10)'); spec.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = spec; g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.fill();
      // markets
      const cities = [['New York', 40.7, -74, -1, 0], ['Londra', 51.5, -0.1, -1, -1], ['Frankfurt', 50.1, 8.7, 1, -1], ['İstanbul', 41.0, 29.0, 1, 0], ['Dubai', 25.2, 55.3, 1, 1], ['Johannesburg', -26.2, 28.0, 1, 0], ['São Paulo', -23.5, -46.6, -1, 0]];
      const CP = cities.map(c => proj(c[1], c[2]));
      g.save(); g.globalCompositeOperation = 'lighter';
      [[0, 1], [1, 3], [3, 4], [2, 5], [0, 6], [6, 1]].forEach(([a, b]) => {
        const [x0, y0] = CP[a], [x1, y1] = CP[b], d = Math.hypot(x1 - x0, y1 - y0);
        let nx = -(y1 - y0) / d, ny = (x1 - x0) / d;
        if (nx * ((x0 + x1) / 2 - gx) + ny * ((y0 + y1) / 2 - gy) < 0) { nx = -nx; ny = -ny; }
        const mx = (x0 + x1) / 2 + nx * d * 0.32, my = (y0 + y1) / 2 + ny * d * 0.32;
        g.strokeStyle = hexA(D3.champ, 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
      });
      g.restore();
      CP.forEach(([x, y], i) => {
        g.strokeStyle = D3.au; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 11, 0, TAU); g.stroke();
        g.fillStyle = D3.hi; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill();
        const [, , , dx, dy] = cities[i];
        text(g, cities[i][0], x + dx * 20, y + dy * 18 + (dy === 0 ? 8 : dy > 0 ? 14 : -4), { f: D3_PF, w: 400, it: true, s: 24, a: dx > 0 ? 'left' : 'right', c: D3.iv });
      });
      d3_glint(g, CP[3][0], CP[3][1], 24, 0.9);
      text(g, 'Her işlem, kendi tarihindeki kurla çevrilir.', gx, 1000, { f: D3_PF, w: 400, it: true, s: 28, c: D3.soft });
      d3_dust(g, 44, 120, { bokeh: 8 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '17–21 sn', title: 'Otomatik senkron',
    desc: 'Gravürlü pirinç plakalardan altın iplikler merkezdeki mühre uzanır; ışık boncukları hatlar boyunca akar, mühür yavaşça döner.',
    draw(g) {
      d3_bg(g, { ly: 620, lr: 1000 });
      d3_folio(g, 'V', 'Senkron');
      d3_ivory(g, '25+ aracı kurumla', CX, 200, { f: D3_PF, w: 700, s: 84, ls: -1 });
      d3_gold(g, 'otomatik senkron.', CX, 300, { f: D3_PF, w: 700, it: true, s: 92, ls: -1 }, { sweep: 0.58 });
      const sx = CX, sy = 640, R = 172;
      const L = ['Interactive Brokers', 'Charles Schwab', 'Fidelity', 'Robinhood'], Rt = ['Trading 212', 'DEGIRO', 'eToro', 'Coinbase'];
      const ys = [440, 565, 690, 815], pw = 400, ph = 80;
      // threads first, under the plates and the seal
      [...L, ...Rt].forEach((b, i) => {
        const left = i < 4, y = ys[i % 4], x0 = left ? 130 + pw : W - 130 - pw;
        const ang = Math.atan2(y - sy, x0 - sx), ex = sx + Math.cos(ang) * (R + 16), ey = sy + Math.sin(ang) * (R + 16);
        const c1 = [x0 + (left ? 170 : -170), y], c2 = [ex + (left ? -120 : 120), ey];
        const tg = g.createLinearGradient(x0, y, ex, ey); tg.addColorStop(0, hexA(D3.au, 0.75)); tg.addColorStop(1, hexA(D3.champ, 0.35));
        g.strokeStyle = tg; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], ex, ey); g.stroke();
        const t = [0.42, 0.68, 0.3, 0.55, 0.6, 0.36, 0.74, 0.48][i], u = 1 - t;
        const bx = u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * ex;
        const by = u * u * u * y + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * ey;
        d3_glint(g, bx, by, 13, 0.85);
      });
      // engraved plates
      [...L, ...Rt].forEach((b, i) => {
        const left = i < 4, y = ys[i % 4], x = left ? 130 : W - 130 - pw;
        g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
        rr(g, x, y - ph / 2, pw, ph, 4);
        const pg = g.createLinearGradient(0, y - ph / 2, 0, y + ph / 2); pg.addColorStop(0, '#2A251C'); pg.addColorStop(1, '#14110D');
        g.fillStyle = pg; g.fill(); g.restore();
        rr(g, x, y - ph / 2, pw, ph, 4); g.strokeStyle = d3_foil(g, x, y - ph / 2, x + pw, y + ph / 2); g.lineWidth = 1.8; g.stroke();
        rr(g, x + 7, y - ph / 2 + 7, pw - 14, ph - 14, 2); g.strokeStyle = hexA(D3.au, 0.22); g.lineWidth = 1; g.stroke();
        for (const [rx, ry] of [[x + 16, y - ph / 2 + 16], [x + pw - 16, y - ph / 2 + 16], [x + 16, y + ph / 2 - 16], [x + pw - 16, y + ph / 2 - 16]]) {
          g.fillStyle = d3_foil(g, rx - 3, ry - 3, rx + 3, ry + 3); g.beginPath(); g.arc(rx, ry, 3, 0, TAU); g.fill();
        }
        // engraved name: dark cut + light lip below
        const o = { f: D3_PF, w: 700, s: 29, a: 'left' }, tx = x + 40;
        text(g, b, tx, y + 10 - 1, { ...o, c: 'rgba(0,0,0,0.9)' });
        text(g, b, tx, y + 10 + 1, { ...o, c: 'rgba(255,236,190,0.18)' });
        text(g, b, tx, y + 10, { ...o, c: D3.champ });
        check(g, x + pw - 46, y + 1, 18, D3.au, 2.5);
      });
      // the seal
      addGlow(g, D3.au, sx, sy, R * 2.2, 0.22);
      g.save(); g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
      g.fillStyle = d3_foil(g, sx - R, sy - R, sx + R, sy + R); g.beginPath(); g.arc(sx, sy, R, 0, TAU); g.fill(); g.restore();
      g.save(); g.beginPath(); g.arc(sx, sy, R, 0, TAU); g.arc(sx, sy, R * 0.9, 0, TAU, true); g.clip();
      g.strokeStyle = 'rgba(50,34,4,0.45)'; g.lineWidth = 1.2;
      for (let k = 0; k < 220; k++) { const a = k / 220 * TAU; g.beginPath(); g.moveTo(sx + Math.cos(a) * R * 0.9, sy + Math.sin(a) * R * 0.9); g.lineTo(sx + Math.cos(a) * R, sy + Math.sin(a) * R); g.stroke(); }
      g.restore();
      const ig = g.createRadialGradient(sx - R * 0.3, sy - R * 0.4, 0, sx, sy, R * 0.9);
      ig.addColorStop(0, '#2A2419'); ig.addColorStop(1, '#0D0B08');
      g.fillStyle = ig; g.beginPath(); g.arc(sx, sy, R * 0.88, 0, TAU); g.fill();
      g.strokeStyle = hexA(D3.au, 0.6); g.lineWidth = 1; g.beginPath(); g.arc(sx, sy, R * 0.66, 0, TAU); g.stroke();
      d3_arcText(g, d3_up('Otomatik senkron · salt-okunur · her gece · '), sx, sy, R * 0.77, -Math.PI / 2 + 0.2, { f: D3_MR, w: 700, s: 17, c: D3.au, fill: true });
      d3_mark(g, sx, sy, R * 0.44, { disc: false, bezel: false, glint: 0.9 });
      d3_glint(g, sx - R * 0.62, sy - R * 0.72, 30, 0.9);
      d3_kick(g, 'Salt-okunur bağlantı  ·  her gece güncellenir  ·  CSV ve yapay zekâ ile içe aktarma', CX, 1000, { a: 'center', s: 19, ls: 4, c: D3.soft, w: 600 });
      d3_dust(g, 55, 120);
      d3_finish(g, { va: 0.55 });
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takvimi',
    desc: 'Altın sikkeler ay ay istiflenir, son sikke düşerken parlar; tahmin ayları kontur olarak belirir ve yıllık gelir sayacı yükselir.',
    draw(g) {
      d3_bg(g, { lx: 1300, ly: 760, lr: 1100 });
      d3_folio(g, 'VI', 'Temettü');
      d3_ivory(g, 'Hiçbir temettüyü', 110, 240, { f: D3_PF, w: 700, s: 84, a: 'left', ls: -1 });
      d3_gold(g, 'kaçırmayın.', 110, 340, { f: D3_PF, w: 700, it: true, s: 92, a: 'left', ls: -1 }, { sweep: 0.42 });
      // figures
      d3_kick(g, 'Yıllık tahmini gelir', 110, 450, { s: 17, c: D3.soft, ls: 5 });
      d3_money(g, '218.400', '', 106, 560, { s: 108, a: 'left', gold: true, w: 900, gf: { sweep: 0.7 } });
      d3_hair(g, 110, 610, 640, 610, 0.4, 1, false);
      d3_kick(g, 'Maliyete göre getiri', 110, 664, { s: 17, c: D3.soft, ls: 5 });
      d3_ivory(g, '%4,1', 106, 770, { f: D3_PF, w: 900, s: 108, a: 'left' });
      // upcoming payments
      d3_kick(g, 'Yaklaşan ödemeler', 110, 850, { s: 16, c: D3.au, ls: 5 });
      [['14 Kas', 'VOO', '₺3.124,10'], ['28 Kas', 'KO', '₺1.240,80'], ['02 Ara', 'O', '₺1.368,25']].forEach(([d, t, v], i) => {
        const y = 895 + i * 44;
        text(g, d, 110, y, { f: D3_PF, w: 400, it: true, s: 24, a: 'left', c: D3.champ });
        text(g, t, 230, y, { f: D3_MR, w: 700, s: 21, a: 'left', c: D3.iv });
        text(g, v, 640, y, { f: D3_MR, w: 600, s: 21, a: 'right', c: D3.iv });
        d3_hair(g, 110, y + 15, 640, y + 15, 0.22, 1, false);
      });
      // coin chart on a polished surface
      const base = 860, x0 = 820, step = 86, rx = 31, ry = 10, th = 13;
      const vals = [42, 24, 91, 45, 26, 95, 47, 28, 100, 51, 30, 106];
      const ns = vals.map(v => Math.round(v / 3.8));
      // surface
      const sf = g.createLinearGradient(0, base - 20, 0, H);
      sf.addColorStop(0, 'rgba(40,34,24,0.9)'); sf.addColorStop(0.08, 'rgba(22,19,14,0.95)'); sf.addColorStop(1, 'rgba(11,10,8,1)');
      g.fillStyle = sf; g.fillRect(760, base - 4, W - 760, H - base + 4);
      d3_hair(g, 760, base - 4, W - 40, base - 4, 0.5, 1.2);
      // reflections
      g.save(); g.beginPath(); g.rect(760, base, W - 760, 180); g.clip();
      g.translate(0, 2 * base); g.scale(1, -1); g.globalAlpha = 0.2;
      vals.forEach((v, i) => { if (i < 9) d3_stack(g, x0 + i * step + rx, base, ns[i], rx, ry, th, 60 + i); });
      g.restore();
      const rf = g.createLinearGradient(0, base, 0, base + 170); rf.addColorStop(0, 'rgba(14,12,9,0.2)'); rf.addColorStop(1, 'rgba(11,10,8,1)');
      g.fillStyle = rf; g.fillRect(760, base, W - 760, 180);
      // stacks
      vals.forEach((v, i) => {
        const cx = x0 + i * step + rx, paid = i < 9;
        g.save(); g.fillStyle = 'rgba(0,0,0,0.6)'; g.filter = 'blur(6px)'; g.beginPath(); g.ellipse(cx + 6, base + 4, rx + 6, ry + 3, 0, 0, TAU); g.fill(); g.restore();
        if (paid) d3_stack(g, cx, base, ns[i], rx, ry, th, 60 + i); else d3_ghostStack(g, cx, base, ns[i], rx, ry, th);
        text(g, 'OŞMNMHTAEEKA'[i], cx, base + 64, { f: D3_PF, w: 400, it: true, s: 28, c: paid ? D3.soft : D3.champ });
      });
      // a coin falling onto September, with a motion trail
      const fx = x0 + 8 * step + rx, ftop = base - ns[8] * th, fy = ftop - 120;
      g.save(); g.filter = 'blur(5px)';
      const tr = g.createLinearGradient(0, fy - 190, 0, fy); tr.addColorStop(0, 'rgba(212,175,55,0)'); tr.addColorStop(1, 'rgba(240,210,120,0.3)');
      g.fillStyle = tr; g.beginPath(); g.ellipse(fx, fy - 80, rx * 0.8, 110, 0, 0, TAU); g.fill(); g.restore();
      [0.12, 0.22, 0.36].forEach((a, k) => { g.save(); g.globalAlpha = a; d3_coinTop(g, fx, fy - 30 * (3 - k), rx, ry); g.restore(); });
      d3_coinSide(g, fx, fy, rx, ry, th); d3_coinTop(g, fx, fy, rx, ry);
      d3_glint(g, fx + 12, fy - 2, 26, 1);
      // legend
      d3_kick(g, 'Temettü takvimi · bu yıl', 822, 212, { s: 16, c: D3.soft, ls: 5 });
      d3_coinTop(g, 1452, 205, 14, 5);
      text(g, 'Alınan ödemeler', 1476, 212, { f: D3_MR, w: 600, s: 19, a: 'left', c: D3.iv });
      g.setLineDash([4, 4]); g.strokeStyle = hexA(D3.champ, 0.8); g.lineWidth = 1.5; g.beginPath(); g.ellipse(1700, 205, 14, 5, 0, 0, TAU); g.stroke(); g.setLineDash([]);
      text(g, 'Tahmin', 1724, 212, { f: D3_MR, w: 600, s: 19, a: 'left', c: D3.iv });
      d3_dust(g, 66, 110, { bokeh: 10 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '25–31 sn', title: 'Risk laboratuvarı',
    desc: '1.000 altın iplik soldan sağa yelpaze gibi açılır, %5–%95 bandı ve medyan kilitlenir; sağdaki tablonun satırları ince altın çizgilerle dolar.',
    draw(g) {
      d3_bg(g, { lx: 700, ly: 620, lr: 1100 });
      d3_folio(g, 'VII', 'Risk laboratuvarı');
      d3_gold(g, '1.000', 106, 275, { f: D3_PF, w: 900, s: 168, a: 'left' }, { sweep: 0.55 });
      const nw = measure(g, '1.000', { f: D3_PF, w: 900, s: 168 });
      d3_ivory(g, 'olası gelecek.', 106 + nw + 30, 275, { f: D3_PF, w: 400, it: true, s: 84, a: 'left' });
      text(g, 'Monte Carlo simülasyonu · 1.000 senaryo · 1–10 yıl', 110, 335, { f: D3_MR, w: 500, s: 24, a: 'left', c: D3.soft });
      const x0 = 130, x1 = 1250, yT = 400, yB = 940;
      const my = v => yB - Math.log(v / 0.42) / Math.log(4.4 / 0.42) * (yB - yT);
      const M = D3_T.mc;
      g.strokeStyle = hexA(D3.au, 0.1); g.lineWidth = 1;
      for (let k = 0; k <= 5; k++) { const x = lerp(x0, x1, k / 5); g.beginPath(); g.moveTo(x, yT); g.lineTo(x, yB); g.stroke(); }
      if (M) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 1;
        M.paths.forEach(p => {
          const end = p[p.length - 1];
          g.strokeStyle = rgb(ramp(['#7A5E1E', '#D4AF37', '#F3E5AB'], (Math.log(end) + 0.4) / 1.7), 0.09);
          g.beginPath(); p.forEach((v, k) => { const x = lerp(x0, x1, k / (p.length - 1)); k ? g.lineTo(x, my(v)) : g.moveTo(x, my(v)); }); g.stroke();
        });
        g.restore();
        const pts = s => s.map((v, k) => [lerp(x0, x1, k / (s.length - 1)), my(v)]);
        const P95 = pts(M.p95), P5 = pts(M.p5), P50 = pts(M.p50);
        g.beginPath(); P95.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = P5.length - 1; i >= 0; i--) g.lineTo(P5[i][0], P5[i][1]); g.closePath();
        g.fillStyle = hexA(D3.au, 0.05); g.fill();
        [[P95, D3.champ, '%95', 2], [P50, D3.iv, 'medyan', 3.5], [P5, '#C29A3E', '%5', 2]].forEach(([s, col, l, lw]) => {
          g.save(); g.shadowColor = hexA(col, 0.6); g.shadowBlur = 10; g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round';
          if (lw < 3) g.setLineDash([2, 6]);
          g.beginPath(); smoothPath(g, s); g.stroke(); g.restore();
          const e = s[s.length - 1];
          g.fillStyle = col; g.beginPath(); g.arc(e[0], e[1], 5, 0, TAU); g.fill();
          text(g, l, e[0] + 18, e[1] + 9, { f: D3_PF, w: 400, it: true, s: 28, a: 'left', c: col });
        });
        d3_glint(g, P50[P50.length - 1][0], P50[P50.length - 1][1], 22, 0.9);
      }
      ['Bugün', '2 yıl', '4 yıl', '6 yıl', '8 yıl', '10 yıl'].forEach((s, k) => text(g, s, lerp(x0, x1, k / 5), 985, { f: D3_MR, w: 500, s: 19, c: D3.dim }));
      // metrics table
      const tx0 = 1420, tx1 = 1810;
      g.fillStyle = hexA(D3.au, 0.22); g.fillRect(1384, 180, 1, 820);
      d3_kick(g, 'Risk ölçüleri', tx0, 200, { s: 17, ls: 6 });
      d3_hair(g, tx0, 224, tx1, 224, 0.8, 1.5, false);
      [['Sharpe oranı', '1,24'], ['Beta', '0,92'], ['Oynaklık', '%14,8'], ['VaR (%95)', '−%2,1'], ['Maks. düşüş', '−%18,6'], ['Kriz senaryosu', '4']].forEach(([l, v], i) => {
        const y = 290 + i * 78;
        text(g, l, tx0, y, { f: D3_MR, w: 600, s: 21, a: 'left', c: D3.soft });
        text(g, v, tx1, y + 4, { f: D3_PF, w: 700, s: 42, a: 'right', c: i === 0 ? D3.champ : D3.iv });
        d3_hair(g, tx0, y + 28, tx1, y + 28, 0.28, 1, false);
      });
      // Markowitz efficient frontier inset
      text(g, 'Markowitz etkin sınır', tx0, 802, { f: D3_PF, w: 400, it: true, s: 28, a: 'left', c: D3.au });
      const fx0 = tx0 + 10, fx1 = tx1, fy0 = 830, fy1 = 980;
      g.strokeStyle = hexA(D3.au, 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx0, fy1); g.lineTo(fx1, fy1); g.stroke();
      const fr = u => [lerp(fx0 + 30, fx1 - 10, u), fy1 - 12 - Math.sqrt(u) * (fy1 - fy0 - 24)];
      const rnd = mulberry32(17);
      g.fillStyle = hexA(D3.champ, 0.28);
      for (let k = 0; k < 140; k++) { const u = rnd(), p = fr(u), d = rnd() * rnd() * 90; g.fillRect(p[0] + d * 0.5, p[1] + d, 2.2, 2.2); }
      g.strokeStyle = d3_foil(g, fx0, fy0, fx1, fy1); g.lineWidth = 2.5; g.beginPath();
      for (let k = 0; k <= 40; k++) { const p = fr(k / 40); k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
      const ms = fr(0.42);
      g.fillStyle = D3.hi; g.beginPath(); g.arc(ms[0], ms[1], 5, 0, TAU); g.fill();
      d3_glint(g, ms[0], ms[1], 16, 0.9);
      text(g, 'en yüksek Sharpe', ms[0] + 18, ms[1] + 34, { f: D3_PF, w: 400, it: true, s: 21, a: 'left', c: D3.champ });
      text(g, 'risk', fx1, fy1 + 24, { f: D3_PF, w: 400, it: true, s: 17, a: 'right', c: D3.dim });
      d3_dust(g, 77, 80, { bokeh: 6 });
      d3_finish(g, { va: 0.5 });
    },
  },
  {
    time: '31–35 sn', title: 'Hızlı özellikler',
    desc: 'Altın çizgiler ekranı dört bölüme ayırır; her vuruşta bir bölüm varak ışığıyla parlar: kıyaslama, vergi raporu, yapay zekâ ile içe aktarma, kriz testi.',
    draw(g) {
      d3_bg(g, { lr: 1200 });
      d3_folio(g, 'VIII', 'Kısaca');
      const X0 = 90, X1 = W - 90, Y0 = 130, Y1 = 1010, MX = CX, MY = 570;
      d3_frame(g, X0, Y0, X1 - X0, Y1 - Y0, { c: 18, inner: 0, heads: false, lw: 1.5, a: 0.8 });
      d3_hair(g, MX, Y0 + 30, MX, Y1 - 30, 0.65, 1.2); d3_hair(g, X0 + 30, MY, X1 - 30, MY, 0.65, 1.2);
      d3_lozenge(g, MX, MY, 13);
      const Q = [[X0, Y0], [MX, Y0], [X0, MY], [MX, MY]], QW = MX - X0, QH = MY - Y0;
      const heads = [['I', ['Kıyaslama'], 'S&P 500, VOO ya da seçtiğiniz endeks'], ['II', ['Vergi raporu'], 'FIFO, LIFO veya ortalama maliyet'],
        ['III', ['Yapay zekâ ile', 'içe aktarma'], 'Ekstrenizi bırakın, işlemler kendiliğinden dizilsin'], ['IV', ['Kriz testi'], '4 gerçek kriz senaryosu']];
      Q.forEach(([qx, qy], i) => {
        const act = i === 2;
        if (act) {
          const hg = g.createRadialGradient(qx + QW * 0.3, qy + QH * 0.4, 0, qx + QW * 0.3, qy + QH * 0.4, QW * 0.8);
          hg.addColorStop(0, 'rgba(212,175,55,0.12)'); hg.addColorStop(1, 'rgba(212,175,55,0)');
          g.fillStyle = hg; g.fillRect(qx + 2, qy + 2, QW - 4, QH - 4);
        }
        const [num, tl, desc] = heads[i], lx = qx + 70;
        const dy = tl.length > 1 ? 0 : 22;
        if (act) d3_gold(g, num + '.', lx, qy + 140 + dy, { f: D3_PF, w: 400, it: true, s: 88, a: 'left' }, { sweep: 0.5 });
        else text(g, num + '.', lx, qy + 140 + dy, { f: D3_PF, w: 400, it: true, s: 88, a: 'left', c: D3.au });
        tl.forEach((s, k) => d3_ivory(g, s, lx, qy + 232 + dy + k * 58, { f: D3_PF, w: 700, s: 52, a: 'left' }));
        text(g, desc, lx, qy + 252 + dy + tl.length * 58, { f: D3_MR, w: 500, s: 22, a: 'left', c: D3.soft });
        const ix = qx + (i === 0 ? 510 : 480), iy = qy + 80, iw = i === 0 ? 300 : 330, ih = 300;
        if (i === 0) {
          const you = d3_series(71, 60, 1.426, 0.016), spy = d3_series(72, 60, 1.319, 0.012);
          const mp = s => s.map((v, k) => [ix + k / 59 * iw, iy + ih - 40 - (v - 0.9) / 0.6 * (ih - 90)]);
          const SP = mp(spy), se = SP[SP.length - 1];
          g.setLineDash([6, 6]); g.strokeStyle = hexA(D3.iv, 0.6); g.lineWidth = 2; g.beginPath(); smoothPath(g, SP); g.stroke(); g.setLineDash([]);
          text(g, '+%31,9 · S&P 500', se[0], se[1] + 42, { f: D3_MR, w: 600, s: 18, a: 'right', c: D3.soft });
          g.save(); g.shadowColor = hexA(D3.au, 0.6); g.shadowBlur = 10; g.strokeStyle = d3_foil(g, ix, iy, ix + iw, iy + ih); g.lineWidth = 3.5; g.beginPath(); smoothPath(g, mp(you)); g.stroke(); g.restore();
          text(g, '+%42,6', ix + iw, iy + 20, { f: D3_PF, w: 700, s: 40, a: 'right', c: D3.champ });
          text(g, 'portföy', ix + iw, iy + 50, { f: D3_PF, w: 400, it: true, s: 20, a: 'right', c: D3.soft });
        } else if (i === 1) {
          ['FIFO', 'LIFO', 'Ort. maliyet'].forEach((s, k) => {
            const by = iy + 20 + k * 70, on = k === 0;
            rr(g, ix + 20, by, iw - 20, 54, 4);
            if (on) { g.fillStyle = d3_foil(g, ix + 20, by, ix + iw, by + 54); g.fill(); }
            g.strokeStyle = hexA(D3.au, on ? 1 : 0.5); g.lineWidth = 1.5; g.stroke();
            text(g, s, ix + 20 + (iw - 20) / 2, by + 36, { f: D3_MR, w: 700, s: 22, c: on ? '#1A1408' : D3.champ });
          });
          text(g, 'Her planda vergi raporu', ix + iw, iy + 262, { f: D3_PF, w: 400, it: true, s: 22, a: 'right', c: D3.soft });
        } else if (i === 2) {
          // document → AI → rows
          const dx = ix - 10, dy = iy + 40;
          d3_card(g, dx, dy, 110, 140, { r: 3, blur: 20, a: 0.7, inner: false });
          for (let k = 0; k < 5; k++) { g.fillStyle = hexA(D3.iv, 0.2); g.fillRect(dx + 16, dy + 28 + k * 20, [70, 60, 74, 50, 66][k], 6); }
          text(g, '.CSV', dx + 55, dy + 172, { f: D3_MR, w: 700, s: 18, c: D3.champ, ls: 2 });
          d3_arrow(g, dx + 124, dy + 70, 62, D3.au, 2.5);
          d3_glint(g, dx + 156, dy + 30, 18, 1);
          [['Alış', 'AAPL'], ['Temettü', 'VOO'], ['Satış', 'ETH'], ['Alış', 'BND']].forEach(([a, s], k) => {
            const ry = iy + 20 + k * 62, rx0 = ix + 206;
            rr(g, rx0, ry, 150, 48, 4); g.fillStyle = 'rgba(28,25,20,0.9)'; g.fill(); g.strokeStyle = hexA(D3.au, 0.45); g.lineWidth = 1; g.stroke();
            text(g, a, rx0 + 14, ry + 31, { f: D3_PF, w: 400, it: true, s: 19, a: 'left', c: D3.soft });
            text(g, s, rx0 + 136, ry + 31, { f: D3_MR, w: 700, s: 18, a: 'right', c: D3.iv });
          });
        } else {
          const pts = [];
          for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([ix + u * iw, iy + 90 + 170 * Math.exp(-Math.pow((u - 0.4) / 0.11, 2)) * (u < 0.4 ? 1 : 0.85) - 50 * u]); }
          g.fillStyle = hexA(D3.au, 0.12); g.beginPath(); g.moveTo(pts[15][0], pts[15][1]); for (let k = 15; k <= 40; k++) g.lineTo(pts[k][0], pts[k][1]); g.lineTo(pts[40][0], pts[15][1]); g.closePath(); g.fill();
          g.strokeStyle = D3.iv; g.lineWidth = 2.5; g.beginPath(); smoothPath(g, pts); g.stroke();
          g.setLineDash([4, 5]); g.strokeStyle = hexA(D3.au, 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(pts[15][0], pts[15][1]); g.lineTo(ix + iw, pts[15][1]); g.stroke(); g.setLineDash([]);
          const lowP = pts[24];
          g.fillStyle = D3.au; g.beginPath(); g.arc(lowP[0], lowP[1], 6, 0, TAU); g.fill();
          text(g, '−%18,6', ix + iw, iy + 300, { f: D3_PF, w: 700, s: 40, a: 'right', c: D3.champ });
          text(g, 'maks. düşüş', ix + iw, iy + 330, { f: D3_PF, w: 400, it: true, s: 20, a: 'right', c: D3.soft });
        }
      });
      d3_sweep(g, 0.3, 0.06);
      d3_dust(g, 88, 80, { bokeh: 6 });
      d3_finish(g, { va: 0.45 });
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış: Davetiye',
    desc: 'Davetiye kartı yavaşça öne gelir, varak çerçeve parlar; altın düğme ve adres belirir, son karede altın tozu süzülür.',
    draw(g) {
      d3_bg(g, { ly: 520, lr: 1100 });
      const cx0 = 440, cy0 = 90, cw = 1040, ch = 860;
      d3_card(g, cx0, cy0, cw, ch, { r: 4, blur: 90, a: 0, inner: false, top: '#1E1A14', bot: '#0E0C09' });
      d3_frame(g, cx0 + 22, cy0 + 22, cw - 44, ch - 44, { c: 30, inset: 14, lw: 2.5 });
      d3_mark(g, CX, 250, 62, { glint: 1 });
      d3_wordmark(g, CX, 460, 104, { sweep: 0.75 });
      d3_orn(g, CX, 512, 440);
      text(g, 'Tüm yatırımlarınız, tek bir görünümde.', CX, 584, { f: D3_PF, w: 400, it: true, s: 40, c: D3.champ });
      // gold-foil button
      const bw = 740, bh = 96, bx = CX - bw / 2, by = 640;
      g.save(); g.shadowColor = hexA(D3.au, 0.4); g.shadowBlur = 40; rr(g, bx, by, bw, bh, 6); g.fillStyle = d3_foil(g, bx, by - 60, bx + bw, by + bh + 60); g.fill(); g.restore();
      const bv = g.createLinearGradient(0, by, 0, by + bh); bv.addColorStop(0, 'rgba(255,250,225,0.35)'); bv.addColorStop(0.5, 'rgba(255,250,225,0)'); bv.addColorStop(1, 'rgba(60,40,0,0.3)');
      rr(g, bx, by, bw, bh, 6); g.fillStyle = bv; g.fill();
      g.save(); rr(g, bx, by, bw, bh, 6); g.clip();
      const sw = g.createLinearGradient(bx + bw * 0.55, by, bx + bw * 0.72, by + bh); sw.addColorStop(0, 'rgba(255,255,240,0)'); sw.addColorStop(0.5, 'rgba(255,255,240,0.55)'); sw.addColorStop(1, 'rgba(255,255,240,0)');
      g.fillStyle = sw; g.fillRect(bx, by, bw, bh); g.restore();
      rr(g, bx + 5, by + 5, bw - 10, bh - 10, 3); g.strokeStyle = 'rgba(70,50,8,0.45)'; g.lineWidth = 1; g.stroke();
      const lbl = 'Ücretsiz başlayın — kredi kartı gerekmez', lo = { f: D3_MR, w: 700, s: 30 };
      const lw = measure(g, lbl, lo), lx = CX - (lw + 70) / 2;
      text(g, lbl, lx, by + 59, { ...lo, a: 'left', c: '#1A1408' });
      d3_arrow(g, lx + lw + 22, by + 48, 46, '#1A1408', 3);
      text(g, 'www.kripto724.com/app', CX, 845, { f: D3_MR, w: 600, s: 44, ls: 1, c: D3.iv });
      d3_hair(g, CX - 230, 876, CX + 230, 876, 0.5, 1);
      text(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', CX, 1030, { f: D3_MR, w: 500, s: 22, c: '#948B78' });
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
  concept: 'Özel bankacılık ile lüks dergi zarafeti: derin siyah ve kömür tonları üzerinde gerçek altın varak geçişleri, fildişi serif başlıklar, italik vurgular ve ince altın çizgiler. Yavaş kamera, bol boşluk ve altın tozu; yıllık rapor ile saat reklamı arası bir prestij.',
  board: {
    bg: '#0E0C09', ink: '#F7F2E8', soft: '#A79E8B', accent: '#D4AF37', line: 'rgba(212,175,55,0.3)',
    display: { f: D3_PF, w: 700, ls: -1 }, text: { f: D3_MR, w: 500 }, badgeInk: '#0B0A08',
    paper(g, w, h) {
      const gr = g.createRadialGradient(w * 0.25, 0, 0, w * 0.25, 0, 2000);
      gr.addColorStop(0, 'rgba(212,175,55,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = mulberry32(3);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(243,229,171,${0.05 + r() * 0.18})`; g.beginPath(); g.arc(r() * w, r() * 470, 0.6 + r() * 1.6, 0, TAU); g.fill(); }
    },
  },
  palette: [['#0B0A08', 'Siyah'], ['#1C1914', 'Kömür'], ['#D4AF37', 'Altın'], ['#F3E5AB', 'Şampanya'], ['#F7F2E8', 'Fildişi']],
  fonts: ['Playfair Display 700 · İtalik', 'Manrope 500/600/700'],
  motion: ['Yavaş kamera kaydırma', 'Altın varak ışık süpürmesi', 'Altın toz parçacıkları'],
  music: 'sinematik piyano ve yaylılar, 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d3_init,
  scenes: D3_SCENES,
};
