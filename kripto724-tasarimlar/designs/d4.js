'use strict';
/* TASARIM 04 · CESUR TİPOGRAFİ (brief v2 · kripto724)
 * Loud, scroll-stopping kinetic typography on a Swiss grid: giant condensed
 * uppercase (Anton) that fills the frame, flat brand-orange / black / white colour
 * blocks that alternate per scene, thin rules and small labels, the app's own
 * numbers as heroes, sticker labels with hard offset shadows, text masks and
 * half-wiped colour blocks as transition traces. Green and red appear only for
 * price moves. Each scene pairs the giant type with one recognisable app screen. */

const D4 = { O: '#F7931A', K: '#0A0A0A', W: '#FFFFFF', G: '#16A34A', R: '#E5484D' };
// app UI colours (light theme, from the client's screenshots)
const D4_UI = {
  page: '#EEF0F5', ink: '#14161F', sub: '#7A7F8C', line: '#EEF0F4', gBg: '#DCF5E6', rBg: '#FDE2E2',
  lav: '#ECEBFF', badge: '#E5E3FF', badgeInk: '#6E5BFF', live: '#10B981', liveInk: '#0E9F6E', liveBg: '#E3F7EE',
  cream: '#FFF7E3', creamTrack: '#F4E8C9', gold1: '#D9A520', gold2: '#F2C14E',
};
const D4_AN = 'Anton', D4_SG = 'Space Grotesk', D4_IN = 'Inter';
const D4_CHAP = ['SORUN', 'VAAT', 'KRİPTO', 'BORSA', 'EMTİA', 'KASAM', 'ALARM', 'BAĞLA', 'KATIL'];

/* ── type helpers ── */
// Anton display line (only weight 400 exists, so w must stay 400)
function d4_big(g, s, x, y, S, col, o = {}) {
  text(g, s, x, y, { f: D4_AN, w: 400, s: S, a: o.a || 'left', c: col, ls: o.ls != null ? o.ls : -S * 0.004 });
}
// Anton size that makes s exactly `width` wide
function d4_fitS(g, s, width) { return 100 * width / measure(g, s, { f: D4_AN, w: 400, s: 100, ls: -0.4 }); }
/* Anton numbers with a drawn "%": Anton's own % has a small lowercase-o that reads
 * poorly at display sizes, so the sign is drawn as two condensed zeros and a slash
 * at full cap height. Works for both "+0,40%" (app format) and "%10" (Turkish prefix). */
function d4_pct(g, x, y, S, col) {
  const c = S * 0.86, pw = S * 0.5, sb = S * 0.045, iw = pw - sb * 2;
  const zw = iw * 0.44, zh = c * 0.43, t = zw * 0.36;
  const zero = (zx, zy) => {
    g.beginPath(); g.roundRect(zx, zy, zw, zh, zw / 2);
    g.roundRect(zx + t, zy + t * 0.9, zw - 2 * t, zh - 1.8 * t, (zw - 2 * t) / 2);
    g.fill('evenodd');
  };
  g.fillStyle = col;
  zero(x + sb, y - c); zero(x + sb + iw - zw, y - zh);
  const st = t * 1.05;
  g.beginPath(); g.moveTo(x + sb, y); g.lineTo(x + sb + st, y); g.lineTo(x + sb + iw, y - c); g.lineTo(x + sb + iw - st, y - c); g.closePath(); g.fill();
  return pw;
}
function d4_numW(g, s, S) {
  const font = { f: D4_AN, w: 400, s: S, ls: -S * 0.004 };
  const parts = s.split('%');
  return parts.reduce((a, p) => a + measure(g, p, font), 0) + (parts.length - 1) * S * 0.5;
}
function d4_num(g, s, x, y, S, col, o = {}) {
  const font = { f: D4_AN, w: 400, s: S, ls: -S * 0.004 };
  const parts = s.split('%'), total = d4_numW(g, s, S);
  let px = o.a === 'right' ? x - total : o.a === 'center' ? x - total / 2 : x;
  parts.forEach((p, i) => {
    if (i) px += d4_pct(g, px, y, S, col);
    if (p) { text(g, p, px, y, { ...font, a: 'left', c: col }); px += measure(g, p, font); }
  });
  return total;
}
// small Swiss label
function d4_lab(g, s, x, y, col, o = {}) {
  text(g, s, x, y, { f: D4_SG, w: o.w || 700, s: o.s || 22, a: o.a || 'left', c: col, ls: o.ls != null ? o.ls : 3 });
}
// app-UI text (Inter, as in the app)
function d4_t(g, s, x, y, S, col, o = {}) {
  text(g, s, x, y, { f: D4_IN, w: o.w || 600, s: S, a: o.a || 'left', c: col, ls: o.ls || 0 });
}
function d4_tw(g, s, S, w = 600) { return measure(g, s, { f: D4_IN, w, s: S }); }

/* Justified stack: every line is scaled to the same width (classic kinetic type).
 * lines: [[string, colour], ...]. Stacks by real glyph bounds so İ/Ü/Ş never collide.
 * o: { gap, maxH (shrinks the width until it fits), bottom (bottom-align), a,
 *      blocks: { lineIndex: { fill, ink, pad, x0 } } flat colour block behind a line } */
function d4_stackLayout(g, lines, width, gap) {
  let h = 0;
  const out = lines.map(([s, col], i) => {
    setFont(g, { f: D4_AN, w: 400, s: 100, ls: -0.4 });
    const m = g.measureText(s); g.letterSpacing = '0px';
    const k = width / m.width;
    const L = { s, col, S: 100 * k, asc: m.actualBoundingBoxAscent * k, desc: m.actualBoundingBoxDescent * k };
    h += L.asc + L.desc + (i ? gap : 0);
    return L;
  });
  return { lines: out, h, width };
}
function d4_stack(g, lines, x, top, width, o = {}) {
  const gap = o.gap == null ? 16 : o.gap;
  let L = d4_stackLayout(g, lines, width, gap);
  if (o.maxH && L.h > o.maxH) L = d4_stackLayout(g, lines, width * (o.maxH - gap * (lines.length - 1)) / (L.h - gap * (lines.length - 1)), gap);
  let y = o.bottom != null ? o.bottom - L.h : top;
  L.lines.forEach((l, i) => {
    if (i) y += gap;
    y += l.asc;
    const b = o.blocks && o.blocks[i];
    if (b) {
      const p = b.pad == null ? 16 : b.pad, bx = b.x0 != null ? b.x0 : x - p;
      g.fillStyle = b.fill; g.fillRect(bx, y - l.asc - p, x + L.width + p - bx, l.asc + l.desc + 2 * p);
    }
    d4_big(g, l.s, x, y, l.S, b && b.ink ? b.ink : l.col, { a: o.a });
    l.y = y;
    y += l.desc;
  });
  return L;
}

/* ── graphic helpers ── */
function d4_logoHW(g, size) {
  const f = { f: 'Poppins', w: 700, s: size, ls: -size * 0.01 };
  return measure(g, 'kripto', f) + measure(g, '724', f) + size * 0.32 + Math.max(2, size * 0.075);
}
/* Running Swiss "chrome": a story-style chapter bar, the app's horizontal
 * kripto | 724 lockup at the top right and the chapter label under it. On orange
 * the lockup sits on a black tag so its orange bar stays visible. */
function d4_chrome(g, n, ink, p = 0.55, o = {}) {
  const ls = 30, lw = d4_logoHW(g, ls), lx = 1860 - lw;
  if (o.plate) { g.fillStyle = D4.K; g.fillRect(lx - 16, 18, lw + 32, 48); logoH(g, lx, 52, ls, { ink: D4.W }); }
  else logoH(g, lx, 52, ls, { ink });
  const x0 = 60, x1 = lx - 44, gap = 8, sw = (x1 - x0 - gap * 8) / 9, y = 34, h = 6;
  for (let i = 0; i < 9; i++) {
    const x = x0 + i * (sw + gap);
    g.fillStyle = hexA(ink, 0.22); g.fillRect(x, y, sw, h);
    const f = i < n - 1 ? 1 : i === n - 1 ? p : 0;
    if (f) { g.fillStyle = ink; g.fillRect(x, y, sw * f, h); }
  }
  d4_lab(g, `${String(n).padStart(2, '0')} / 09 — ${D4_CHAP[n - 1]}`, 1860, 92, ink, { a: 'right', s: 20, ls: 4 });
}
// sticker: flat block, hard offset shadow, optional rotation (cx, cy = centre)
function d4_sticker(g, s, cx, cy, o = {}) {
  const S = o.s || 80, sg = !!o.sg;
  const font = sg ? { f: D4_SG, w: 700, s: S, ls: o.ls || 0 } : { f: D4_AN, w: 400, s: S, ls: o.ls != null ? o.ls : S * 0.01 };
  setFont(g, font);
  const m = g.measureText(s), tw = m.width;
  g.letterSpacing = '0px';
  // centre on the real glyph box so accents (Ğ, İ, Ü) stay inside the sticker
  const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  const padX = o.padX != null ? o.padX : S * 0.38;
  const h = Math.max(o.h || S * (sg ? 1.55 : 1.32), asc + desc + S * 0.34);
  const by = (asc - desc) / 2;
  const w = tw + padX * 2 + (o.icon ? h * 0.7 : 0);
  g.save(); g.translate(cx, cy); g.rotate(o.rot || 0);
  const off = o.off == null ? Math.max(8, S * 0.11) : o.off;
  if (off) { g.fillStyle = o.shadow || D4.K; g.fillRect(-w / 2 + off, -h / 2 + off, w, h); }
  g.fillStyle = o.fill || D4.O; g.fillRect(-w / 2, -h / 2, w, h);
  if (o.border) { g.lineWidth = o.border; g.strokeStyle = o.borderCol || D4.K; g.strokeRect(-w / 2 + o.border / 2, -h / 2 + o.border / 2, w - o.border, h - o.border); }
  let tx = -w / 2 + padX;
  if (o.icon) { o.icon(g, tx + h * 0.18, 0, h); tx += h * 0.78; }
  text(g, s, tx, by, { ...font, a: 'left', c: o.ink || D4.K });
  g.restore();
  return w;
}
// thick graphic arrow (no glyph): tail at (x, y), pointing along angle `ang`
function d4_arrow(g, x, y, len, t, col, ang = 0) {
  const hw = t * 1.45, hl = t * 1.7;
  g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, -t / 2); g.lineTo(len - hl, -t / 2); g.lineTo(len - hl, -hw); g.lineTo(len, 0);
  g.lineTo(len - hl, hw); g.lineTo(len - hl, t / 2); g.lineTo(0, t / 2); g.closePath(); g.fill();
  g.restore();
}
// diagonal hatching inside a rect
function d4_hatch(g, x, y, w, h, col, gap = 16, lw = 4) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  for (let k = -h; k < w + h; k += gap) { g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); }
  g.stroke(); g.restore();
}
// rotated generic "somewhere else" card (scene 1) with a hard shadow; inner(g, w, h) in local coords
function d4_card(g, cx, cy, w, h, rot, o, inner) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.translate(-w / 2, -h / 2);
  const off = o.off == null ? 14 : o.off;
  g.fillStyle = o.shadow || D4.K; g.fillRect(off, off, w, h);
  g.fillStyle = o.fill || D4.W; g.fillRect(0, 0, w, h);
  g.lineWidth = 5; g.strokeStyle = D4.K; g.strokeRect(2.5, 2.5, w - 5, h - 5);
  if (o.head) {
    g.fillStyle = D4.K; g.fillRect(0, 0, w, 42);
    d4_lab(g, o.head, 18, 29, o.headInk || D4.W, { s: 17, ls: 2 });
    [0, 1, 2].forEach(i => { g.fillStyle = i === 0 ? D4.O : hexA(D4.W, 0.5); g.fillRect(w - 26 - i * 20, 16, 11, 11); });
  }
  if (inner) inner(g, w, h);
  g.restore();
}
// seeded series that starts at 1 and ends exactly at `end`
function d4_series(seed, n, vol, end) {
  const s = walk(seed, n, 0, vol), last = s[n - 1];
  return s.map((v, i) => v * Math.pow(end / last, i / (n - 1)));
}
function d4_poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); }
// marquee band rotated across the frame
function d4_band(g, cy, h, rot, fill, items, o) {
  g.save(); g.translate(CX, cy); g.rotate(rot);
  g.fillStyle = fill; g.fillRect(-1250, -h / 2, 2500, h);
  const font = { f: o.f || D4_SG, w: o.w || 700, s: o.s, ls: o.ls || 0 };
  const by = (o.f === D4_AN ? 0.43 : 0.35) * o.s;
  let x = -1250 + (o.off || 0), i = 0;
  while (x < 1250) {
    const s = items[i % items.length];
    text(g, s, x, by, { ...font, a: 'left', c: o.ink });
    x += measure(g, s, font) + o.sep;
    g.fillStyle = o.dot; g.fillRect(x - o.sep / 2 - 9, -9, 18, 18);
    i++;
  }
  g.restore();
}
// flat app card in this design's language: rounded, hard offset shadow, optional border
function d4_panel(g, x, y, w, h, o = {}) {
  const r = o.r == null ? 26 : o.r, off = o.off == null ? 16 : o.off;
  if (off) { rr(g, x + off, y + off, w, h, r); g.fillStyle = o.shadow || D4.K; g.fill(); }
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || D4.W; g.fill();
  if (o.border) { g.lineWidth = o.border; g.strokeStyle = o.borderCol || D4.K; rr(g, x + o.border / 2, y + o.border / 2, w - o.border, h - o.border, r - o.border / 2); g.stroke(); }
}
// official app icon: black rounded square, white stacked logo (bar stays orange)
function d4_appIcon(g, cx, cy, S, o = {}) {
  if (o.off) { rr(g, cx - S / 2 + o.off, cy - S / 2 + o.off, S, S, S * 0.22); g.fillStyle = o.shadow || D4.O; g.fill(); }
  if (o.ring) { rr(g, cx - S / 2 - o.ring, cy - S / 2 - o.ring, S + o.ring * 2, S + o.ring * 2, S * 0.22 + o.ring); g.fillStyle = o.ringCol || D4.W; g.fill(); }
  rr(g, cx - S / 2, cy - S / 2, S, S, S * 0.22); g.fillStyle = D4.K; g.fill();
  logo(g, cx, cy, S * 0.66, { ink: D4.W });
}
// coins as coloured circles with ticker initials (no real logos)
const D4_COINS = { BTC: ['#F7931A', 'B'], ETH: ['#627EEA', 'E'], XRP: ['#23292F', 'X'], BNB: ['#F3BA2F', 'BN', '#14161F'], SOL: [null, 'S'], DOGE: ['#C2A633', 'D'], ADA: ['#0033AD', 'A'] };
function d4_coin(g, cx, cy, r, key) {
  const [col, ini, ink] = D4_COINS[key];
  g.beginPath(); g.arc(cx, cy, r, 0, TAU);
  if (col) g.fillStyle = col;
  else { const gr = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gr.addColorStop(0, '#9945FF'); gr.addColorStop(1, '#14F195'); g.fillStyle = gr; }
  g.fill();
  const S = r * (ini.length > 1 ? 0.74 : 0.98);
  d4_t(g, ini, cx, cy + S * 0.36, S, ink || D4.W, { w: 700, a: 'center' });
}
// stocks: neutral circle with the ticker
function d4_tick(g, cx, cy, r, tk) {
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = '#E4E7EE'; g.fill();
  const S = Math.min(r * 0.62, r * 1.62 / (d4_tw(g, tk, 100, 700) / 100));
  d4_t(g, tk, cx, cy + S * 0.36, S, D4_UI.ink, { w: 700, a: 'center' });
}
// app change pill: "+0,13%" green on pale green, "−1,49%" red on pale red
function d4_chg(g, s, x, y, S = 20, o = {}) {
  const up = s[0] === '+';
  const tw = d4_tw(g, s, S, 600), h = S * 1.65, w = o.w || tw + S * 1.2;
  const ax = o.a === 'right' ? x - w : o.a === 'center' ? x - w / 2 : x;
  rr(g, ax, y - h / 2, w, h, h / 2); g.fillStyle = up ? D4_UI.gBg : D4_UI.rBg; g.fill();
  d4_t(g, s, ax + w / 2, y + S * 0.36, S, up ? D4.G : D4.R, { w: 600, a: 'center' });
  return w;
}
// app "● CANLI" badge
function d4_live(g, x, y, S = 20, label = 'CANLI', a = 'right') {
  const tw = d4_tw(g, label, S, 700), h = S * 1.7, w = tw + S * 2.1;
  const ax = a === 'right' ? x - w : x;
  rr(g, ax, y - h / 2, w, h, h / 2); g.fillStyle = D4_UI.liveBg; g.fill();
  g.fillStyle = D4_UI.live; g.beginPath(); g.arc(ax + S * 0.85, y, S * 0.3, 0, TAU); g.fill();
  d4_t(g, label, ax + S * 1.4, y + S * 0.36, S, D4_UI.liveInk, { w: 700 });
  return w;
}
// app segmented tabs: items [[label, count?], ...]; o.a 'right' aligns to x
function d4_seg(g, x, y, items, sel, S = 22, o = {}) {
  const padX = S * 0.9, h = S * 2.1, inset = 5;
  const ws = items.map(([l, n]) => d4_tw(g, l, S) + (n != null ? d4_tw(g, String(n), S * 0.8, 700) + S * 1.3 : 0) + padX * 2);
  const total = ws.reduce((a, b) => a + b, 0) + inset * 2;
  const x0 = o.a === 'right' ? x - total : x;
  rr(g, x0, y - h / 2, total, h, h / 2); g.fillStyle = o.track || D4_UI.lav; g.fill();
  let px = x0 + inset;
  items.forEach(([l, n], i) => {
    if (i === sel) {
      rr(g, px, y - h / 2 + inset, ws[i], h - inset * 2, (h - inset * 2) / 2);
      if (o.selGold) { const gr = g.createLinearGradient(px, 0, px + ws[i], 0); gr.addColorStop(0, D4_UI.gold1); gr.addColorStop(1, D4_UI.gold2); g.fillStyle = gr; }
      else g.fillStyle = o.selFill || D4.W;
      g.fill();
    }
    d4_t(g, l, px + padX, y + S * 0.36, S, i === sel ? (o.selInk || D4_UI.ink) : D4_UI.sub);
    if (n != null) {
      const lx = px + padX + d4_tw(g, l, S) + S * 0.45, nw = d4_tw(g, String(n), S * 0.8, 700) + S * 0.8;
      rr(g, lx, y - S * 0.62, nw, S * 1.24, S * 0.62); g.fillStyle = D4_UI.badge; g.fill();
      d4_t(g, String(n), lx + nw / 2, y + S * 0.29, S * 0.8, D4_UI.badgeInk, { w: 700, a: 'center' });
    }
    px += ws[i];
  });
  return total;
}
// small sparkline
function d4_spark(g, x, y, w, h, seed, up, lw = 3) {
  const s = d4_series(seed, 40, 0.03, up ? 1.07 : 0.94);
  const mn = Math.min(...s), mx = Math.max(...s);
  const pts = s.map((v, i) => [x + i / 39 * w, y + h - (v - mn) / ((mx - mn) || 1) * h]);
  g.save(); g.strokeStyle = up ? D4.G : D4.R; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; d4_poly(g, pts); g.stroke(); g.restore();
}
/* icons (drawn, no glyphs) */
function d4_bell(g, cx, cy, s, col) {
  g.save(); g.fillStyle = col; g.beginPath();
  g.moveTo(cx - s * 0.5, cy + s * 0.3);
  g.quadraticCurveTo(cx - s * 0.36, cy + s * 0.14, cx - s * 0.36, cy - s * 0.08);
  g.bezierCurveTo(cx - s * 0.36, cy - s * 0.52, cx + s * 0.36, cy - s * 0.52, cx + s * 0.36, cy - s * 0.08);
  g.quadraticCurveTo(cx + s * 0.36, cy + s * 0.14, cx + s * 0.5, cy + s * 0.3);
  g.closePath(); g.fill();
  g.beginPath(); g.arc(cx, cy + s * 0.38, s * 0.12, 0, TAU); g.fill();
  g.beginPath(); g.arc(cx, cy - s * 0.47, s * 0.08, 0, TAU); g.fill();
  g.restore();
}
function d4_star(g, cx, cy, r, col) {
  g.fillStyle = col; g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); }
  g.closePath(); g.fill();
}
function d4_search(g, cx, cy, r, col, lw = 3) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath(); g.arc(cx - r * 0.15, cy - r * 0.15, r * 0.62, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(cx + r * 0.3, cy + r * 0.3); g.lineTo(cx + r * 0.8, cy + r * 0.8); g.stroke(); g.restore();
}
function d4_play(g, cx, cy, r, col) {
  g.fillStyle = col; g.beginPath(); g.moveTo(cx - r * 0.42, cy - r * 0.6); g.lineTo(cx + r * 0.62, cy); g.lineTo(cx - r * 0.42, cy + r * 0.6); g.closePath(); g.fill();
}
// flat vault door (Kasam)
function d4_vault(g, cx, cy, R, o = {}) {
  const body = o.body || D4.O, ink = o.ink || D4.K, m = o.lw || 1;
  g.save();
  if (body) { g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill(); }
  g.strokeStyle = ink; g.fillStyle = ink;
  g.lineWidth = R * 0.07 * m; g.beginPath(); g.arc(cx, cy, R * 0.96, 0, TAU); g.stroke();
  g.lineWidth = R * 0.04 * m; g.beginPath(); g.arc(cx, cy, R * 0.7, 0, TAU); g.stroke();
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.arc(cx + Math.cos(a) * R * 0.83, cy + Math.sin(a) * R * 0.83, R * 0.045 * m, 0, TAU); g.fill(); }
  g.lineCap = 'round'; g.lineWidth = R * 0.075 * m;
  const rot = o.rot == null ? 0.5 : o.rot;
  for (let k = 0; k < 3; k++) {
    const a = rot + k / 3 * TAU;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5); g.stroke();
    g.beginPath(); g.arc(cx + Math.cos(a) * R * 0.53, cy + Math.sin(a) * R * 0.53, R * 0.085 * m, 0, TAU); g.fill();
  }
  g.beginPath(); g.arc(cx, cy, R * 0.17 * m, 0, TAU); g.fill();
  if (o.hub) { g.fillStyle = o.hub; g.beginPath(); g.arc(cx, cy, R * 0.07, 0, TAU); g.fill(); }
  g.restore();
}

/* ── app data (from the client's screenshots) ── */
const D4_CRYPTO = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
const D4_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%'],
  ['META', 'Meta Platforms', '$612,49', '−1,24%'],
  ['NVDA', 'NVIDIA', '$215,38', '−1,17%'],
  ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%'],
];
const D4_GOLD = [
  ['Gram Altın', '24 ayar · gram', '6.422,05', '6.510,83'],
  ['Has Altın', '995 · gram', '6.454,32', '6.491,36'],
  ['22 Ayar', 'bilezik · gram', '5.871,43', '6.081,88'],
  ['Çeyrek Altın', '1,75 gr · 22 ayar', '10.327', '10.476'],
  ['Yarım Altın', '', '20.654', '20.815'],
  ['Tam Altın', '', '41.372', '41.727'],
  ['Ata Altın', '', '42.566', '42.993'],
];

/* ── scenes ── */
const D4_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Her şey dağınık',
    desc: 'Üç renk bandı vuruşta çakılır: "KRİPTO BURADA. HİSSE ORADA. ALTIN NEREDE?" Ayrı uygulama kartları savrulur, "PİYASA HİÇ DURMUYOR." etiketi yapışır.',
    draw(g) {
      g.fillStyle = D4.O; g.fillRect(0, 0, W, 380);
      g.fillStyle = D4.K; g.fillRect(0, 380, W, 340);
      g.fillStyle = D4.W; g.fillRect(0, 720, W, 360);
      d4_chrome(g, 1, D4.K, 0.7, { plate: true });
      const S = Math.min(250, d4_fitS(g, 'KRİPTO BURADA.', 1400), d4_fitS(g, 'HİSSE ORADA.', 1380), d4_fitS(g, 'ALTIN NEREDE?', 1440));
      // band 1 — a crypto app
      d4_card(g, 1680, 228, 330, 216, 0.06, { head: 'KRİPTO UYGULAMASI' }, (x, w, h) => {
        d4_lab(x, 'BTC/USDT', 20, 76, D4.K, { s: 15, ls: 2 });
        text(x, '−1,49%', w - 20, 76, { f: D4_SG, w: 700, s: 18, a: 'right', c: D4.R });
        text(x, '$80.220,05', 20, 122, { f: D4_SG, w: 700, s: 38, a: 'left', c: D4.K });
        const r = mulberry32(5); let v = 0.55;
        for (let i = 0; i < 13; i++) {
          const o = v; v = clamp(v + (r() - 0.55) * 0.42, 0.05, 0.95);
          const up = v >= o, cx = 30 + i * 22.5, y0 = 204 - Math.max(o, v) * 62, hh = Math.max(12, Math.abs(v - o) * 62);
          x.fillStyle = up ? D4.G : D4.R; x.fillRect(cx - 2, y0 - 9, 4, hh + 18); x.fillRect(cx - 8, y0, 16, hh);
        }
      });
      d4_big(g, 'KRİPTO BURADA.', 52, 345, S, D4.K);
      // band 2 — a stock site
      d4_card(g, 262, 556, 330, 220, -0.07, { head: 'BORSA SİTESİ', fill: D4.W, shadow: D4.O }, (x, w, h) => {
        d4_lab(x, 'BIST 100', 20, 76, D4.K, { s: 15, ls: 2 });
        text(x, '+0,13%', w - 20, 76, { f: D4_SG, w: 700, s: 18, a: 'right', c: D4.G });
        text(x, '11.165,44', 20, 122, { f: D4_SG, w: 700, s: 38, a: 'left', c: D4.K });
        const pts = d4_series(11, 30, 0.03, 1.12).map((v, i) => [20 + i * 10, 200 - (v - 0.86) * 150]);
        x.strokeStyle = D4.K; x.lineWidth = 5; x.lineJoin = 'round'; d4_poly(x, pts); x.stroke();
      });
      d4_big(g, 'HİSSE ORADA.', 1868, 657, S, D4.O, { a: 'right' });
      // band 3 — a gold site
      d4_card(g, 1700, 902, 320, 230, 0.05, { head: 'ALTIN SİTESİ', fill: D4.W }, (x, w, h) => {
        [['GRAM', '6.510,83'], ['ÇEYREK', '10.476'], ['TAM', '41.727'], ['ATA', '42.993']].forEach(([a, b], k) => {
          const y = 42 + k * 47;
          if (k) { x.fillStyle = hexA(D4.K, 0.3); x.fillRect(0, y, w, 2); }
          text(x, a, 20, y + 32, { f: D4_SG, w: 700, s: 19, a: 'left', c: D4.K });
          text(x, '₺' + b, w - 20, y + 32, { f: D4_SG, w: 700, s: 19, a: 'right', c: D4.K });
        });
      });
      const qx = 52 + measure(g, 'ALTIN NEREDE', { f: D4_AN, w: 400, s: S, ls: -S * 0.004 });
      d4_big(g, 'ALTIN NEREDE', 52, 1007, S, D4.K);
      d4_big(g, '?', qx, 1007, S, D4.O);
      // the punchline sticker across the black/white cut
      d4_sticker(g, 'PİYASA HİÇ DURMUYOR.', 1170, 724, { s: 60, fill: D4.O, ink: D4.K, rot: -0.04, off: 11, shadow: D4.K, border: 4 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek uygulama',
    desc: 'Kelimeler vuruşta istiflenir: "KRİPTO, BORSA VE EMTİA". Resmî logo beyaz plakada çakılır; siyah bant "TEK UYGULAMADA." yazısıyla soldan silerek gelir.',
    draw(g) {
      g.fillStyle = D4.O; g.fillRect(0, 0, W, H);
      d4_chrome(g, 2, D4.K, 0.6, { plate: true });
      // official logo, big, on a white plate (keeps the orange bar visible)
      const lh = 360, lw = logoW(lh), pad = lh * 0.32, pw = lw + pad * 2, ph = lh + pad * 2;
      const px = 1860 - pw, py = 132;
      g.fillStyle = D4.K; g.fillRect(px + 18, py + 18, pw, ph);
      g.fillStyle = D4.W; g.fillRect(px, py, pw, ph);
      logo(g, px + pw / 2, py + ph / 2, lh);
      // left stack, the middle line on a black block bleeding off the left edge
      d4_stack(g, [['KRİPTO, BORSA', D4.K], ['VE EMTİA', D4.K]], 60, 150, px - 120, {
        gap: 40, maxH: 580, blocks: { 1: { fill: D4.K, ink: D4.O, pad: 18, x0: 0 } },
      });
      // black band wiping in from the left (slanted leading edge)
      g.fillStyle = D4.K;
      g.beginPath(); g.moveTo(0, 780); g.lineTo(1904, 780); g.lineTo(1862, 1046); g.lineTo(0, 1046); g.closePath(); g.fill();
      const tS = Math.min(d4_fitS(g, 'TEK UYGULAMADA.', 1480), 236);
      d4_big(g, 'TEK UYGULAMADA.', 60, 913 + tS * 0.43, tS, D4.O);
      d4_sticker(g, '7/24', 1712, 912, { s: 112, fill: D4.O, ink: D4.K, rot: -0.07, off: 12, shadow: D4.W });
    },
  },
  {
    time: '8–12 sn', title: 'Kripto: Canlı fiyatlar',
    desc: '"$80.220,05" sayaçla döner, ok BTC satırına saplanır. Uygulamanın Kripto tablosu satır satır sert kesmeyle dolar; "CANLI" etiketi yapışır.',
    draw(g) {
      g.fillStyle = D4.K; g.fillRect(0, 0, W, H);
      d4_chrome(g, 3, D4.W, 0.5);
      // app card: home screen, Kripto tab
      const ox = 1130, oy = 116, cw = 730, chh = 900;
      d4_panel(g, ox, oy, cw, chh, { shadow: D4.O, off: 18 });
      d4_seg(g, ox + 28, oy + 62, [['Kripto'], ['Borsa'], ['Emtia']], 0, 23);
      d4_live(g, ox + cw - 28, oy + 62, 20);
      const colN = ox + 98, colP = ox + 432, colD = ox + 530, colW = ox + cw - 80;
      [['Varlık', ox + 28, 'left'], ['Fiyat', colP, 'right'], ['Günlük', colD, 'center'], ['Haftalık', colW, 'center']].forEach(([s, x, a]) =>
        d4_t(g, s, x, oy + 138, 19, D4_UI.sub, { a }));
      g.fillStyle = D4_UI.line; g.fillRect(ox + 24, oy + 156, cw - 48, 2);
      const r0 = oy + 160, rh = 98;
      let btcY = 0;
      D4_CRYPTO.forEach(([k, name, pair, price, d, wk], i) => {
        const yc = r0 + i * rh + rh / 2;
        if (!i) btcY = yc;
        d4_coin(g, ox + 56, yc, 27, k);
        d4_t(g, name, colN, yc - 3, 25, D4_UI.ink, { w: 700 });
        d4_t(g, pair, colN, yc + 26, 18, D4_UI.sub, { w: 500 });
        d4_t(g, price, colP, yc + 9, 24, D4_UI.ink, { w: 700, a: 'right' });
        d4_chg(g, d, colD, yc, 19, { a: 'center', w: 104 });
        d4_chg(g, wk, colW, yc, 19, { a: 'center', w: 104 });
        if (i < 6) { g.fillStyle = D4_UI.line; g.fillRect(ox + 24, r0 + (i + 1) * rh, cw - 48, 2); }
      });
      d4_t(g, 'Güncellendi 14:24', ox + cw / 2, oy + chh - 22, 18, D4_UI.sub, { w: 500, a: 'center' });
      // the hero row, framed like a sticker
      g.strokeStyle = D4.O; g.lineWidth = 7; g.strokeRect(ox - 12, btcY - rh / 2 + 2, cw + 24, rh - 4);
      // left column: hero number pointing at its row
      d4_coin(g, 86, 192, 26, 'BTC');
      d4_t(g, 'Bitcoin · BTC/USDT', 126, 203, 30, D4.W, { w: 600 });
      const hS = d4_fitS(g, '$80.220,05', 930);
      d4_big(g, '$80.220,05', 54, btcY + hS * 0.43, hS, D4.O);
      d4_arrow(g, 1000, btcY, 112, 26, D4.O);
      // daily / weekly change blocks (red = price move)
      [['GÜNLÜK', '−1,49%'], ['HAFTALIK', '−2,05%']].forEach(([l, v], i) => {
        const bx = 60 + i * 290, by = 452, bw = 270;
        g.fillStyle = D4.R; g.fillRect(bx, by, bw, 100);
        d4_lab(g, l, bx + 20, by + 30, hexA(D4.W, 0.85), { s: 16 });
        d4_num(g, v, bx + 20, by + 88, 52, D4.W);
      });
      d4_stack(g, [['CANLI FİYATLAR,', D4.W]], 60, 584, 900);
      const sS = 262;
      d4_big(g, '7/24.', 52, 1012, sS, D4.O);
      d4_sticker(g, 'CANLI', 836, 900, {
        s: 76, fill: D4.W, ink: D4.K, rot: -0.07, off: 11, shadow: D4.O,
        icon: (x, ix, iy, h) => { x.fillStyle = D4_UI.live; x.beginPath(); x.arc(ix + h * 0.14, iy, h * 0.17, 0, TAU); x.fill(); },
      });
    },
  },
  {
    time: '12–16 sn', title: 'Borsa: 210 hisse',
    desc: 'Dev "210" çakılır, BIST 108 ve Nasdaq 102 blokları ikiye ayrılır. Borsa ekranında BIST 100 ve Nasdaq 100 kartları, Popüler listesi ve arama vuruşta gelir.',
    draw(g) {
      g.fillStyle = D4.W; g.fillRect(0, 0, W, H);
      d4_chrome(g, 4, D4.K, 0.45);
      // left: hero number
      d4_lab(g, 'BIST VE NASDAQ HİSSELERİ', 60, 146, D4.K, { s: 22 });
      g.fillStyle = D4.K; g.fillRect(60, 162, 940, 4);
      const nS = 456;
      d4_big(g, '210', 48, 188 + nS * 0.86, nS, D4.K);
      const nW = measure(g, '210', { f: D4_AN, w: 400, s: nS, ls: -nS * 0.004 });
      d4_sticker(g, 'HİSSE', 48 + nW + 170, 470, { s: 124, fill: D4.O, ink: D4.K, rot: -0.07, off: 14 });
      // split blocks
      [['BIST', '108', D4.K, D4.O, D4.W], ['NASDAQ', '102', D4.O, D4.K, D4.K]].forEach(([l, v, fill, num, lab], i) => {
        const bx = 60 + i * 480, by = 612, bw = 460, bh = 250;
        g.fillStyle = fill; g.fillRect(bx, by, bw, bh);
        d4_lab(g, l, bx + 26, by + 44, lab, { s: 24 });
        d4_lab(g, 'HİSSE', bx + bw - 26, by + 44, hexA(lab === D4.W ? D4.W : D4.K, 0.7), { s: 18, a: 'right' });
        d4_big(g, v, bx + 22, by + 232, 196, num);
      });
      // filters as a justified Swiss chip row
      const chips = [['FAVORİLER', 0, 1], ['POPÜLER', 1, 0], ['YÜKSELENLER', 0, 0], ['DÜŞENLER', 0, 0]];
      const cS = 40, cy0 = 900, ch = 80, gapc = 12;
      const tws = chips.map(([s, , star]) => measure(g, s, { f: D4_AN, w: 400, s: cS }) + (star ? 44 : 0));
      const padc = (940 - tws.reduce((a, b) => a + b, 0) - gapc * 3) / 8;
      let cx = 60;
      chips.forEach(([s, on, star], i) => {
        const w = tws[i] + padc * 2;
        if (on) { g.fillStyle = D4.K; g.fillRect(cx, cy0, w, ch); }
        else { g.strokeStyle = D4.K; g.lineWidth = 4; g.strokeRect(cx + 2, cy0 + 2, w - 4, ch - 4); }
        let tx = cx + padc;
        if (star) { d4_star(g, tx + 17, cy0 + ch / 2, 19, D4.O); tx += 44; }
        d4_big(g, s, tx, cy0 + ch / 2 + cS * 0.43, cS, on ? D4.W : D4.K);
        cx += w + gapc;
      });
      // right: the Borsa screen
      const ox = 1100, oy = 112, cw = 760, chh = 896;
      d4_panel(g, ox, oy, cw, chh, { fill: D4_UI.page, border: 4, off: 18, r: 30 });
      d4_t(g, 'Borsa', ox + 32, oy + 70, 44, D4_UI.ink, { w: 700 });
      d4_t(g, 'BIST ve Nasdaq hisseleri', ox + 32, oy + 104, 21, D4_UI.sub, { w: 500 });
      d4_live(g, ox + cw - 32, oy + 58, 19, 'CANLI · 14:23');
      [['BIST 100', '11.165,44', '+0,13%', 21], ['Nasdaq 100', '29.813,16', '+0,55%', 22]].forEach(([n, v, c, seed], i) => {
        const x = ox + 32 + i * 356, y = oy + 128, w = 340, h = 156;
        rr(g, x, y, w, h, 20); g.fillStyle = D4.W; g.fill();
        d4_t(g, n, x + 22, y + 38, 20, D4_UI.sub);
        d4_t(g, v, x + 22, y + 84, 32, D4_UI.ink, { w: 700 });
        d4_chg(g, c, x + 22, y + 122, 18);
        d4_spark(g, x + 168, y + 98, 150, 40, seed, true, 3.5);
      });
      d4_seg(g, ox + 32, oy + 330, [['Tümü', 210], ['BIST', 108], ['Nasdaq', 102]], 0, 21);
      // filter chips
      let fx = ox + 32;
      [['Favoriler', 0, 1], ['Popüler', 1, 0], ['Yükselenler', 0, 0], ['Düşenler', 0, 0]].forEach(([s, on, star]) => {
        const S = 19, w = d4_tw(g, s, S) + 30 + (star ? 26 : 0), y = oy + 394, h = 40;
        rr(g, fx, y - h / 2, w, h, h / 2); g.fillStyle = on ? D4.K : D4.W; g.fill();
        let tx = fx + 15;
        if (star) { d4_star(g, tx + 9, y, 10, D4.O); tx += 26; }
        d4_t(g, s, tx, y + S * 0.36, S, on ? D4.W : D4_UI.ink);
        fx += w + 10;
      });
      rr(g, ox + 32, oy + 434, cw - 64, 58, 16); g.fillStyle = D4.W; g.fill();
      d4_search(g, ox + 62, oy + 463, 15, D4_UI.sub, 3);
      d4_t(g, 'Hisse adı ya da kodu ara…', ox + 92, oy + 470, 20, D4_UI.sub, { w: 500 });
      d4_t(g, '210 hisse', ox + 36, oy + 528, 18, D4_UI.sub);
      d4_t(g, 'Fiyat · Günlük', ox + cw - 36, oy + 528, 18, D4_UI.sub, { a: 'right' });
      const ry = oy + 544, rh = 82;
      rr(g, ox + 32, ry, cw - 64, rh * 4 + 12, 20); g.fillStyle = D4.W; g.fill();
      D4_STOCKS.forEach(([tk, name, price, chg], i) => {
        const yc = ry + 6 + i * rh + rh / 2, up = chg[0] === '+';
        d4_tick(g, ox + 76, yc, 26, tk);
        d4_t(g, tk, ox + 114, yc - 4, 22, D4_UI.ink, { w: 700 });
        d4_t(g, name, ox + 114, yc + 23, 17, D4_UI.sub, { w: 500 });
        d4_spark(g, ox + 380, yc - 16, 110, 32, 300 + i * 7, up, 3);
        d4_t(g, price, ox + cw - 52, yc - 4, 22, D4_UI.ink, { w: 700, a: 'right' });
        d4_chg(g, chg, ox + cw - 52, yc + 22, 16, { a: 'right' });
        if (i < 3) { g.fillStyle = D4_UI.line; g.fillRect(ox + 52, ry + 6 + (i + 1) * rh, cw - 104, 2); }
      });
      d4_t(g, 'NASDAQ', ox + 114 + d4_tw(g, 'Micron Technology', 17, 500) + 12, ry + 6 + rh / 2 + 23, 14, D4_UI.badgeInk, { w: 700 });
    },
  },
  {
    time: '16–20 sn', title: 'Emtia: Kapalıçarşı altın',
    desc: '"₺6.510,83" gram altın rakamı ekranı doldurur; çeyrek, yarım, tam, ata kelime kelime basılır. Altın ekranında alış/satış, ₺ TL / $ USD ve eski basım.',
    draw(g) {
      g.fillStyle = D4.O; g.fillRect(0, 0, W, H);
      d4_chrome(g, 5, D4.K, 0.5, { plate: true });
      // left: hero
      d4_lab(g, 'KAPALIÇARŞI · CANLI ALTIN FİYATLARI', 60, 150, D4.K, { s: 22 });
      const hS = d4_fitS(g, '₺6.510,83', 960);
      d4_big(g, '₺6.510,83', 54, 176 + hS * 0.86, hS, D4.K);
      const by = 432;
      g.fillStyle = D4.K; g.fillRect(60, by, 520, 104);
      d4_big(g, 'GRAM ALTIN', 84, by + 52 + 76 * 0.43, 76, D4.O);
      g.fillStyle = D4.W; g.fillRect(596, by, 320, 104);
      d4_num(g, '+0,40%', 756, by + 52 + 76 * 0.43, 76, D4.G, { a: 'center' });
      text(g, 'ALIŞ 6.422  ·  SATIŞ 6.511', 60, 594, { f: D4_SG, w: 700, s: 30, a: 'left', c: D4.K, ls: 1 });
      g.fillStyle = D4.K; g.fillRect(60, 618, 940, 4);
      d4_stack(g, [['ÇEYREK. YARIM.', D4.K], ['TAM. ATA.', D4.K]], 60, 646, 540, { gap: 16, maxH: 248 });
      [['₺ TL', 1], ['$ USD', 0], ['YENİ BASIM', 0], ['ESKİ BASIM', 1]].forEach(([t, on], i) => {
        const cx = 620 + (i % 2) * 194, cy = 646 + Math.floor(i / 2) * 134, w = 182, h = 114;
        if (on) { g.fillStyle = D4.K; g.fillRect(cx, cy, w, h); }
        else { g.strokeStyle = D4.K; g.lineWidth = 4; g.strokeRect(cx + 2, cy + 2, w - 4, h - 4); }
        const S = Math.min(58, d4_fitS(g, t, w - 34));
        d4_big(g, t, cx + w / 2, cy + h / 2 + S * 0.43, S, on ? D4.O : D4.K, { a: 'center' });
      });
      g.fillStyle = D4.W; g.fillRect(60, 922, 760, 92);
      d4_big(g, 'GÜMÜŞ, PETROL VE FAZLASI', 84, 968 + 58 * 0.43, 58, D4.K);
      // right: the gold screen (warm cream card, gold buttons)
      const ox = 1100, oy = 112, cw = 760, chh = 896;
      d4_panel(g, ox, oy, cw, chh, { fill: D4_UI.cream, off: 18, r: 30 });
      const gr = g.createLinearGradient(ox + 32, 0, ox + 92, 0); gr.addColorStop(0, D4_UI.gold1); gr.addColorStop(1, D4_UI.gold2);
      g.fillStyle = gr; g.beginPath(); g.arc(ox + 64, oy + 66, 32, 0, TAU); g.fill();
      d4_t(g, 'Au', ox + 64, oy + 75, 24, D4_UI.ink, { w: 700, a: 'center' });
      d4_t(g, 'Altın', ox + 110, oy + 62, 34, D4_UI.ink, { w: 700 });
      d4_t(g, 'Kapalıçarşı · canlı', ox + 110, oy + 94, 19, D4_UI.sub, { w: 500 });
      g.fillStyle = D4_UI.live; g.beginPath(); g.arc(ox + 110 + d4_tw(g, 'Kapalıçarşı · canlı', 19, 500) + 14, oy + 87, 6, 0, TAU); g.fill();
      d4_seg(g, ox + cw - 32, oy + 66, [['₺ TL'], ['$ USD']], 0, 20, { a: 'right', track: D4_UI.creamTrack, selGold: true });
      [['Gram Altın', '₺6.510,83', '+0,40%', 'Alış 6.422 · Satış 6.511'], ['Ons Altın', '$4.033,60', '+0,40%', '']].forEach(([n, v, c, sub], i) => {
        const x = ox + 32 + i * 356, y = oy + 120, w = 340, h = 164;
        rr(g, x, y, w, h, 20); g.fillStyle = D4.W; g.fill();
        d4_t(g, n, x + 22, y + 38, 20, D4_UI.sub);
        d4_t(g, v, x + 22, y + 86, 36, D4_UI.ink, { w: 700 });
        const pw = d4_chg(g, c, x + 22, y + 126, 18);
        if (sub) d4_t(g, sub, x + 22 + pw + 12, y + 132, 16, D4_UI.sub, { w: 500 });
      });
      d4_t(g, 'ALTIN FİYATLARI', ox + 34, oy + 334, 20, D4_UI.ink, { w: 700, ls: 2 });
      d4_seg(g, ox + cw - 32, oy + 327, [['Yeni basım'], ['Eski basım']], 1, 18, { a: 'right', track: D4_UI.creamTrack });
      const ty = oy + 366, th = 508;
      rr(g, ox + 32, ty, cw - 64, th, 20); g.fillStyle = D4.W; g.fill();
      const cA = ox + 520, cS = ox + cw - 56;
      d4_t(g, 'Ürün', ox + 56, ty + 38, 18, D4_UI.sub);
      d4_t(g, 'Alış', cA, ty + 38, 18, D4_UI.sub, { a: 'right' });
      d4_t(g, 'Satış', cS, ty + 38, 18, D4_UI.sub, { a: 'right' });
      D4_GOLD.forEach(([n, sub, a, s], i) => {
        const y = ty + 54 + i * 64, yc = y + 32;
        g.fillStyle = D4_UI.line; g.fillRect(ox + 52, y, cw - 104, 2);
        if (sub) { d4_t(g, n, ox + 56, yc - 2, 21, D4_UI.ink, { w: 700 }); d4_t(g, sub, ox + 56, yc + 21, 15, D4_UI.sub, { w: 500 }); }
        else d4_t(g, n, ox + 56, yc + 8, 21, D4_UI.ink, { w: 700 });
        d4_t(g, a, cA, yc + 8, 21, D4_UI.ink, { w: 600, a: 'right' });
        d4_t(g, s, cS, yc + 8, 21, D4_UI.ink, { w: 700, a: 'right' });
      });
      // the hero row, framed
      g.strokeStyle = D4.K; g.lineWidth = 6; g.strokeRect(ox + 20, ty + 52, cw - 40, 66);
    },
  },
  {
    time: '20–24 sn', title: 'Kasam: Tek ekranda, güvenle',
    desc: 'Kasa kapısı dev "KASAM" harflerinin içinde döner (metin maskesi). ₺1.250.430 sayaçla çakılır, uygulamanın Kasam kartı "Kasamı Gör" ile oturur.',
    draw(g) {
      g.fillStyle = D4.K; g.fillRect(0, 0, W, H);
      d4_chrome(g, 6, D4.W, 0.5);
      d4_lab(g, 'KASAM · TEK EKRANDA, GÜVENLE', 60, 150, hexA(D4.W, 0.8), { s: 22 });
      // "KASAM" as a window onto a vault door (text mask)
      const kS = d4_fitS(g, 'KASAM', 1060), base = 182 + kS * 0.86;
      const kW = measure(g, 'KASAM', { f: D4_AN, w: 400, s: kS, ls: -kS * 0.004 });
      const c = canvas(W, H), x = c.getContext('2d');
      x.fillStyle = D4.O; x.fillRect(0, 0, W, H);
      d4_vault(x, 60 + kW * 0.6, base - kS * 0.43, kS * 0.78, { body: null, ink: '#B9650B', rot: 0.35, lw: 0.55 });
      x.globalCompositeOperation = 'destination-in';
      text(x, 'KASAM', 54, base, { f: D4_AN, w: 400, s: kS, a: 'left', c: '#000', ls: -kS * 0.004 });
      g.drawImage(c, 0, 0);
      g.fillStyle = D4.W; g.fillRect(60, base + 30, 1060, 4);
      const vS = d4_fitS(g, '₺1.250.430', 1060);
      d4_big(g, '₺1.250.430', 54, base + 58 + vS * 0.86, vS, D4.W);
      // what goes in: three flat chips
      const cy0 = base + 58 + vS * 0.86 + 40;
      let chx = 60;
      [['ALTIN', D4.O], ['DÖVİZ', D4.W], ['KİŞİSEL VARLIKLAR', D4.W]].forEach(([t, fill]) => {
        const S = 56, w = measure(g, t, { f: D4_AN, w: 400, s: S }) + 48;
        g.fillStyle = fill; g.fillRect(chx, cy0, w, 92);
        d4_big(g, t, chx + 24, cy0 + 46 + S * 0.43, S, D4.K);
        chx += w + 14;
      });
      // right: the app's Kasam banner
      const ox = 1220, oy = 120, cw = 640, chh = 880;
      d4_panel(g, ox, oy, cw, chh, { shadow: D4.O, off: 18 });
      d4_t(g, 'Kasam', ox + 40, oy + 82, 48, D4_UI.ink, { w: 700 });
      const bf = 25;
      d4_t(g, 'Altın, döviz ve kişisel varlıklarını', ox + 40, oy + 132, bf, D4_UI.sub, { w: 500 });
      d4_t(g, 'tek ekranda ', ox + 40, oy + 168, bf, D4_UI.sub, { w: 500 });
      const gw = d4_tw(g, 'tek ekranda ', bf, 500);
      d4_t(g, 'güvenle', ox + 40 + gw, oy + 168, bf, D4.O, { w: 700 });
      d4_t(g, ' takip et.', ox + 40 + gw + d4_tw(g, 'güvenle', bf, 700), oy + 168, bf, D4_UI.sub, { w: 500 });
      // illustration: vault + phone
      rr(g, ox + 40, oy + 214, cw - 80, 470, 22); g.fillStyle = '#F6F2EA'; g.fill();
      d4_vault(g, ox + 196, oy + 470, 136, { body: D4.O, ink: D4.K, hub: D4.W });
      const px = ox + 360, py = oy + 250, pw = 210, ph = 400;
      rr(g, px, py, pw, ph, 34); g.fillStyle = D4.K; g.fill();
      rr(g, px + 10, py + 12, pw - 20, ph - 24, 26); g.fillStyle = D4.W; g.fill();
      g.fillStyle = D4.K; rr(g, px + pw / 2 - 30, py + 20, 60, 12, 6); g.fill();
      d4_t(g, 'Kasam', px + 26, py + 74, 17, D4_UI.sub);
      d4_t(g, '₺1.250.430', px + 26, py + 110, 27, D4_UI.ink, { w: 700 });
      [['Altın', D4_UI.gold2], ['Döviz', '#9AA3B5'], ['Kişisel', '#D5D9E2']].forEach(([s, col], i) => {
        const yy = py + 160 + i * 64;
        g.fillStyle = D4_UI.page; rr(g, px + 22, yy, pw - 44, 50, 12); g.fill();
        g.fillStyle = col; g.beginPath(); g.arc(px + 46, yy + 25, 12, 0, TAU); g.fill();
        d4_t(g, s, px + 66, yy + 31, 16, D4_UI.ink, { w: 600 });
      });
      // button
      const bw2 = 300, bx = ox + 40, byy = oy + 724;
      rr(g, bx, byy, bw2, 76, 38); g.fillStyle = D4.K; g.fill();
      d4_t(g, 'Kasamı Gör', bx + 36, byy + 47, 26, D4.W, { w: 700 });
      d4_arrow(g, bx + 220, byy + 38, 50, 8, D4.O);
      d4_sticker(g, 'GÜVENLE.', ox + cw - 130, oy + chh - 80, { s: 70, fill: D4.O, ink: D4.K, rot: -0.07, off: 11, shadow: D4.K });
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz',
    desc: 'Bildirim kartı düşer, "ALARM!" etiketi yapışır. Sağda dört blok vuruşta çevrilir: hisse analizi, teknik analiz, fiyat tahmini, sinyal alarmları.',
    draw(g) {
      g.fillStyle = D4.W; g.fillRect(0, 0, W, H);
      d4_chrome(g, 7, D4.K, 0.45);
      d4_stack(g, [['ALARM KUR,', D4.K], ['HABERİN OLSUN.', D4.K]], 60, 122, 1000, {
        gap: 34, maxH: 372, blocks: { 1: { fill: D4.O, pad: 15, x0: 0 } },
      });
      // push notification
      const nx = 60, ny = 556, nw = 1000, nh = 200;
      d4_panel(g, nx, ny, nw, nh, { border: 4, off: 14, r: 28 });
      d4_appIcon(g, nx + 98, ny + nh / 2, 128);
      d4_t(g, 'kripto724', nx + 190, ny + 56, 24, D4_UI.ink, { w: 700 });
      d4_t(g, '· şimdi', nx + 190 + d4_tw(g, 'kripto724', 24, 700) + 10, ny + 56, 22, D4_UI.sub, { w: 500 });
      d4_t(g, 'Fiyat alarmı · BTC/USDT', nx + 190, ny + 110, 34, D4_UI.ink, { w: 700 });
      d4_t(g, 'Bitcoin $80.220,05 seviyesine ulaştı.', nx + 190, ny + 156, 27, D4_UI.sub, { w: 500 });
      d4_sticker(g, 'ALARM!', nx + nw - 120, ny - 4, {
        s: 72, fill: D4.K, ink: D4.O, rot: 0.07, off: 11, shadow: D4.O,
        icon: (x, ix, iy, h) => d4_bell(x, ix + h * 0.14, iy, h * 0.5, D4.O),
      });
      // bottom nav (as in the app)
      const by = 832, bh = 176;
      d4_panel(g, nx, by, nw, bh, { border: 4, off: 14, r: 28, shadow: D4.O });
      const items = ['Akış', 'Haberler', null, 'Alarmlarım', 'Hesabım'];
      items.forEach((s, i) => {
        const cx = nx + nw * (i + 0.5) / 5, iy = by + 70;
        if (!s) { d4_appIcon(g, cx, by + 56, 136, { ring: 8 }); return; }
        const on = s === 'Alarmlarım', col = on ? D4.O : D4_UI.ink;
        g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 4.5; g.lineCap = 'round';
        if (i === 0) { [0, 1, 2].forEach(k => { g.beginPath(); g.moveTo(cx - 20, iy - 14 + k * 14); g.lineTo(cx + 20 - (k === 2 ? 12 : 0), iy - 14 + k * 14); g.stroke(); }); }
        if (i === 1) { g.strokeRect(cx - 20, iy - 18, 40, 36); g.fillRect(cx - 12, iy - 9, 24, 5); g.fillRect(cx - 12, iy + 2, 16, 4); }
        if (i === 3) d4_bell(g, cx, iy, 44, col);
        if (i === 4) { g.beginPath(); g.arc(cx, iy - 9, 10, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, iy + 22, 20, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
        g.restore();
        d4_t(g, s, cx, by + 136, 22, col, { w: on ? 700 : 600, a: 'center' });
        if (on) { g.fillStyle = D4.O; g.fillRect(cx - 34, by + 152, 68, 6); }
      });
      // right: four feature blocks
      const fx = 1124, fw = 736, fy0 = 116, fh = 208, fg = 14;
      const feats = [
        ['01', 'HİSSE ANALİZİ', D4.O, D4.K, (x0, y0) => { [0.45, 0.7, 0.55, 0.95].forEach((v, k) => { g.fillStyle = D4.K; g.fillRect(x0 + k * 46, y0 + 84 - v * 84, 30, v * 84); }); }],
        ['02', 'TEKNİK ANALİZ', D4.K, D4.W, (x0, y0) => {
          const r = mulberry32(9); let v = 0.5;
          for (let k = 0; k < 9; k++) {
            const o = v; v = clamp(v + (r() - 0.45) * 0.45, 0.08, 0.92);
            const up = v >= o, cx = x0 + 10 + k * 22, top = y0 + 88 - Math.max(o, v) * 80, hh = Math.max(10, Math.abs(v - o) * 80);
            g.fillStyle = up ? D4.G : D4.R; g.fillRect(cx - 2, top - 8, 4, hh + 16); g.fillRect(cx - 7, top, 14, hh);
          }
        }],
        ['03', 'FİYAT TAHMİNİ', D4.W, D4.K, (x0, y0) => {
          const pts = d4_series(41, 24, 0.04, 1.1).map((v, k) => [x0 + k * 6, y0 + 96 - (v - 0.85) * 220]);
          g.save(); g.strokeStyle = D4.K; g.lineWidth = 5; g.lineJoin = 'round'; d4_poly(g, pts); g.stroke();
          const e = pts[pts.length - 1];
          g.setLineDash([10, 8]); g.strokeStyle = D4.O; g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(e[0] + 66, e[1] - 34); g.stroke(); g.setLineDash([]);
          g.fillStyle = D4.O; g.fillRect(e[0] + 58, e[1] - 42, 16, 16); g.restore();
        }],
        ['04', 'SİNYAL ALARMLARI', D4.K, D4.O, (x0, y0) => {
          d4_bell(g, x0 + 110, y0 + 52, 70, D4.W);
          g.save(); g.strokeStyle = D4.O; g.lineWidth = 5; g.lineCap = 'round';
          [1, 2].forEach(k => { g.beginPath(); g.arc(x0 + 110, y0 + 46, 34 + k * 18, -0.75, 0.15); g.stroke(); g.beginPath(); g.arc(x0 + 110, y0 + 46, 34 + k * 18, Math.PI - 0.15, Math.PI + 0.75); g.stroke(); });
          g.restore();
        }],
      ];
      feats.forEach(([n, s, fill, ink, icon], i) => {
        const y = fy0 + i * (fh + fg);
        g.fillStyle = fill; g.fillRect(fx, y, fw, fh);
        if (fill === D4.W) { g.strokeStyle = D4.K; g.lineWidth = 5; g.strokeRect(fx + 2.5, y + 2.5, fw - 5, fh - 5); }
        d4_lab(g, n, fx + 28, y + 42, ink, { s: 20 });
        d4_big(g, s, fx + 26, y + fh - 26, 84, ink);
        icon(fx + fw - 240, y + 20);
      });
    },
  },
  {
    time: '29–34 sn', title: 'Bağla, indirimi seç',
    desc: 'Binance, Bitget, MEXC satır satır basılır, "BAĞLA" blokları yanar. Turuncu blokta dev "%10 İNDİRİM"; altta "Kripto hakkında her şey" videoları kayar.',
    draw(g) {
      const SX = 1100, SY = 712;
      g.fillStyle = D4.K; g.fillRect(0, 0, SX, SY + 20);
      g.fillStyle = D4.O; g.fillRect(SX, 0, W - SX, SY + 20);
      g.fillStyle = D4.W; g.fillRect(0, SY + 20, W, H - SY - 20);
      g.save(); g.beginPath(); g.rect(0, 0, SX, 100); g.clip(); d4_chrome(g, 8, D4.W, 0.5); g.restore();
      g.save(); g.beginPath(); g.rect(SX, 0, W - SX, 100); g.clip(); d4_chrome(g, 8, D4.K, 0.5, { plate: true }); g.restore();
      // left: connect accounts (exchange names as plain text)
      d4_lab(g, 'KRİPTO HESABINI BAĞLA', 60, 150, D4.O, { s: 22 });
      ['BINANCE', 'BITGET', 'MEXC'].forEach((s, i) => {
        const y = 310 + i * 150;
        d4_big(g, s, 56, y, 132, D4.W);
        const bx = 790, bw = 250, bh = 92, byc = y - 57;
        g.fillStyle = D4.O; g.fillRect(bx, byc - bh / 2, bw, bh);
        d4_big(g, 'BAĞLA', bx + 26, byc + 54 * 0.43, 54, D4.K);
        d4_arrow(g, bx + 162, byc, 66, 14, D4.K);
        if (i < 2) { g.fillStyle = hexA(D4.W, 0.3); g.fillRect(60, y + 34, 980, 2); }
      });
      text(g, "Hesaplarını Kripto724'e kolayca bağla.", 60, 668, { f: D4_SG, w: 700, s: 28, a: 'left', c: hexA(D4.W, 0.8) });
      // right: commission discount
      d4_lab(g, 'KOMİSYON İNDİRİMİ SEÇ', SX + 60, 150, D4.K, { s: 22 });
      const pS = 318;
      d4_num(g, '%10', SX + 50, 196 + pS * 0.86, pS, D4.K);
      d4_sticker(g, 'BINANCE', SX + 640, 300, { s: 74, fill: D4.W, ink: D4.K, rot: -0.07, off: 11 });
      g.fillStyle = D4.K; g.fillRect(SX, 538, W - SX, 116);
      d4_big(g, 'İNDİRİM', SX + 60, 596 + 86 * 0.43, 86, D4.O);
      d4_lab(g, 'BINANCE KOMİSYONUNDA', 1860, 604, D4.W, { s: 20, a: 'right' });
      // marquee band across the cut (transition trace)
      d4_band(g, SY + 20, 66, -0.018, D4.K, ['Komisyon İndirimi Seç', 'BINANCE %10 indirim', 'Kripto Hesabını Bağla', 'Kripto Hakkında Her Şey'], { s: 30, ink: D4.W, dot: D4.O, sep: 64, off: -140 });
      // bottom: "Kripto Hakkında Her Şey" videos
      d4_stack(g, [['KRİPTO HAKKINDA', D4.K], ['HER ŞEY', D4.K]], 60, 778, 600, { gap: 14, maxH: 262, blocks: { 1: { fill: D4.O, pad: 10, x0: 0 } } });
      const thumbs = [[D4.O, 'c'], [D4.K, 'b'], [D4.K, 'l']];
      thumbs.forEach(([fill, kind], i) => {
        const tx = 730 + i * 268, ty = 790, tw = 248, th = 200;
        g.fillStyle = D4.K; g.fillRect(tx + 10, ty + 10, tw, th);
        g.fillStyle = fill; g.fillRect(tx, ty, tw, th);
        if (fill !== D4.K) { g.strokeStyle = D4.K; g.lineWidth = 4; g.strokeRect(tx + 2, ty + 2, tw - 4, th - 4); }
        if (kind === 'c') { [0.4, 0.62, 0.5, 0.82, 0.7].forEach((v, k) => { g.fillStyle = hexA(D4.K, 0.85); g.fillRect(tx + 24 + k * 22, ty + th - 22 - v * 110, 14, v * 110); }); }
        if (kind === 'b') { d4_coin(g, tx + 70, ty + 80, 34, 'BTC'); d4_coin(g, tx + 112, ty + 118, 28, 'ETH'); }
        if (kind === 'l') { const pts = d4_series(77, 20, 0.05, 1.3).map((v, k) => [tx + 20 + k * 11, ty + 160 - (v - 0.8) * 160]); g.strokeStyle = D4.O; g.lineWidth = 5; d4_poly(g, pts); g.stroke(); }
        g.fillStyle = D4.W; g.beginPath(); g.arc(tx + tw - 62, ty + th / 2, 36, 0, TAU); g.fill();
        d4_play(g, tx + tw - 58, ty + th / 2, 22, D4.K);
      });
      const bx = 1544, byy = 840, bw = 330, bh = 104;
      g.fillStyle = D4.O; g.fillRect(bx + 10, byy + 10, bw, bh);
      g.fillStyle = D4.K; g.fillRect(bx, byy, bw, bh);
      d4_big(g, 'ŞİMDİ KEŞFET', bx + 24, byy + 52 + 44 * 0.43, 44, D4.W);
      d4_arrow(g, bx + bw - 66, byy + 52, 44, 12, D4.O);
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış: Ailemize katılın',
    desc: '"ÜCRETSİZ" etiketi yapışır, "AİLEMİZE KATILIN!" ekranı doldurur. Resmî logo beyaz plakada; adres siyah bantta soldan silinerek yazılır.',
    draw(g) {
      g.fillStyle = D4.O; g.fillRect(0, 0, W, H);
      d4_chrome(g, 9, D4.K, 1, { plate: true });
      // official logo on a white plate
      const lh = 300, lw = logoW(lh), pad = lh * 0.3, pw = lw + pad * 2, ph = lh + pad * 2;
      const px = 1860 - pw, py = 270;
      g.fillStyle = D4.K; g.fillRect(px + 18, py + 18, pw, ph);
      g.fillStyle = D4.W; g.fillRect(px, py, pw, ph);
      logo(g, px + pw / 2, py + ph / 2, lh);
      d4_sticker(g, 'ÜCRETSİZ', px + pw / 2 - 10, 190, { s: 100, fill: D4.K, ink: D4.W, rot: -0.06, off: 13, shadow: D4.W });
      d4_stack(g, [['AİLEMİZE', D4.K], ['KATILIN!', D4.K]], 60, 116, px - 110, { gap: 24, maxH: 664 });
      // URL bar (full bleed) with a graphic arrow
      g.fillStyle = D4.K; g.fillRect(0, 818, W, 156);
      d4_arrow(g, 60, 896, 250, 40, D4.O);
      text(g, 'kripto724.com', 1864, 945, { f: D4_AN, w: 400, s: 124, a: 'right', c: D4.O, ls: 1 });
      text(g, 'Kripto, borsa ve emtia tek uygulamada.', 60, 1020, { f: D4_SG, w: 700, s: 30, a: 'left', c: D4.K });
      text(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', 60, 1058, { f: D4_SG, w: 500, s: 22, a: 'left', c: hexA(D4.K, 0.8) });
      // print colour bar
      [D4.O, D4.K, D4.W, D4.G, D4.R].forEach((col, i) => { g.fillStyle = col; g.fillRect(1690 + i * 34, 1012, 34, 34); });
      g.strokeStyle = D4.K; g.lineWidth = 2; g.strokeRect(1690, 1012, 170, 34);
    },
  },
];

window.DESIGN = {
  id: 4, name: 'Cesur Tipografi',
  concept: 'Kaydırmayı durduran yüksek sesli bir afiş dili: ekranı dolduran dev, dar büyük harfler; turuncu–siyah–beyaz düz renk blokları ve İsviçre ızgarası. Uygulamanın gerçek rakamları kahraman, ekranları yanında; her vuruşta sert kesme, harf maskesi ve yapışan etiketler.',
  board: {
    bg: D4.O, ink: D4.K, soft: 'rgba(10,10,10,0.78)', accent: D4.K, line: D4.K,
    display: { f: D4_AN, w: 400, ls: 0 }, text: { f: D4_SG, w: 500 },
    badge: D4.K, badgeInk: D4.O, frameShadow: false,
    // hard offset shadows under the scene frames (print / sticker look)
    paper(g) {
      g.fillStyle = D4.K;
      for (let k = 0; k < 9; k++) {
        const col = k % 3, row = Math.floor(k / 3);
        const x = CELL.x0 + col * (CELL.w + CELL.gapX), y = CELL.y0 + row * (CELL.h + CELL.cap + CELL.gapY);
        rr(g, x + 12, y + 12, CELL.w, CELL.h, 16); g.fill();
      }
    },
  },
  palette: [['#F7931A', 'Turuncu'], ['#0A0A0A', 'Siyah'], ['#FFFFFF', 'Beyaz'], ['#16A34A', 'Yükseliş'], ['#E5484D', 'Düşüş']],
  fonts: ['Anton', 'Space Grotesk · Inter (arayüz)'],
  extraFonts: ['Inter', 'Poppins'],
  motion: ['Vuruşta sert kesmeler, 2 sn\'lik ölçüler', 'Dev tipografi, harf maskeleri, sayaçlar', 'Turuncu–siyah blok silmeleri, yapışan etiketler'],
  music: 'sert davul ve bas, el çırpma, kayıt cızırtısı; 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  scenes: D4_SCENES,
};
