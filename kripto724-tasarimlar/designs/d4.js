'use strict';
/* TASARIM 04 · CESUR TİPOGRAFİ
 * Loud, scroll-stopping kinetic typography on a Swiss grid: giant condensed
 * uppercase (Anton) that fills the frame, flat colour blocks that alternate per
 * scene (yellow / black / white, one blue beat), thin rules and small labels,
 * numbers as heroes, sticker labels with hard offset shadows, text masks and
 * half-wiped colour blocks as transition traces. One strong product element per frame. */

const D4 = { Y: '#FFE600', K: '#0A0A0A', W: '#FFFFFF', R: '#FF3B30', B: '#2B59FF' };
const D4_AN = 'Anton', D4_SG = 'Space Grotesk';
const D4_CHAP = ['SORUN', 'ÇÖZÜM', 'PANEL', 'VARLIKLAR', 'SENKRON', 'TEMETTÜ', 'RİSK', 'ARAÇLAR', 'BAŞLA'];

/* ── type helpers ── */
const d4_up = s => s.toLocaleUpperCase('tr');
// Anton display line (only weight 400 exists, so w must stay 400)
function d4_big(g, s, x, y, S, col, o = {}) {
  text(g, s, x, y, { f: D4_AN, w: 400, s: S, a: o.a || 'left', c: col, ls: o.ls != null ? o.ls : -S * 0.004 });
}
// Anton size that makes s exactly `width` wide
function d4_fitS(g, s, width) { return 100 * width / measure(g, s, { f: D4_AN, w: 400, s: 100, ls: -0.4 }); }
/* Anton numbers with a drawn "%": Anton's own % has a small lowercase-o that reads
 * as "o38" when it precedes digits (Turkish puts % first), so the sign is drawn as
 * two condensed zeros and a slash at full cap height. */
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
function d4_num(g, s, x, y, S, col, o = {}) {
  const font = { f: D4_AN, w: 400, s: S, ls: -S * 0.004 };
  const parts = s.split('%'), pw = S * 0.5;
  const total = parts.reduce((a, p) => a + measure(g, p, font), 0) + (parts.length - 1) * pw;
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

/* Justified stack: every line is scaled to the same width (classic kinetic type).
 * lines: [[string, colour], ...]. Stacks by real glyph bounds so İ/Ü/Ş never collide.
 * o: { gap, maxH (shrinks the width until it fits), bottom (bottom-align), a } */
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
    d4_big(g, l.s, x, y, l.S, l.col, { a: o.a });
    l.y = y;
    y += l.desc;
  });
  return L;
}

/* ── graphic helpers ── */
// story-style chapter bar + chapter label (the film's running Swiss "chrome")
function d4_chrome(g, n, ink, p = 0.55) {
  const x0 = 60, x1 = 1860, gap = 8, sw = (x1 - x0 - gap * 8) / 9, y = 34, h = 6;
  for (let i = 0; i < 9; i++) {
    const x = x0 + i * (sw + gap);
    g.fillStyle = hexA(ink, 0.22); g.fillRect(x, y, sw, h);
    const f = i < n - 1 ? 1 : i === n - 1 ? p : 0;
    if (f) { g.fillStyle = ink; g.fillRect(x, y, sw * f, h); }
  }
  d4_lab(g, `${String(n).padStart(2, '0')} / 09 — ${D4_CHAP[n - 1]}`, 1860, 80, ink, { a: 'right', s: 20, ls: 4 });
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
  g.fillStyle = o.fill || D4.R; g.fillRect(-w / 2, -h / 2, w, h);
  if (o.border) { g.lineWidth = o.border; g.strokeStyle = o.borderCol || D4.K; g.strokeRect(-w / 2 + o.border / 2, -h / 2 + o.border / 2, w - o.border, h - o.border); }
  let tx = -w / 2 + padX;
  if (o.icon) { o.icon(g, tx + h * 0.18, 0, h); tx += h * 0.78; }
  text(g, s, tx, by, { ...font, a: 'left', c: o.ink || D4.W });
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
// rotated mini "app card" with a hard shadow; inner(g, w, h) draws in local coords
function d4_card(g, cx, cy, w, h, rot, o, inner) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.translate(-w / 2, -h / 2);
  const off = o.off == null ? 14 : o.off;
  g.fillStyle = o.shadow || D4.K; g.fillRect(off, off, w, h);
  g.fillStyle = o.fill || D4.W; g.fillRect(0, 0, w, h);
  g.lineWidth = 5; g.strokeStyle = D4.K; g.strokeRect(2.5, 2.5, w - 5, h - 5);
  if (o.head) {
    g.fillStyle = D4.K; g.fillRect(0, 0, w, 42);
    d4_lab(g, o.head, 18, 29, o.headInk || D4.W, { s: 17, ls: 2 });
    [0, 1, 2].forEach(i => { g.fillStyle = i === 0 ? D4.R : hexA(D4.W, 0.5); g.fillRect(w - 26 - i * 20, 16, 11, 11); });
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

/* ── shared data ── */
const D4_MC = {};
function d4_init() {
  const r = mulberry32(4724), n = 360, steps = 100, out = [];
  for (let i = 0; i < n; i++) { const p = [1]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] * Math.exp(0.005 + 0.045 * gauss(r))); out.push(p); }
  D4_MC.paths = out;
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const col = out.map(p => p[k]).sort((a, b) => a - b); return col[Math.floor(q * (n - 1))]; });
  D4_MC.p5 = pct(0.05); D4_MC.p50 = pct(0.5); D4_MC.p95 = pct(0.95);
}

/* ── scenes ── */
const D4_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Hepsi dağınık',
    desc: 'Üç renk bandı vuruşta çakılır: "HİSSE BURADA. KRİPTO ORADA. TABLO NEREDE?" Uygulama kartları savrulur, kırmızı "DAĞINIK!" etiketi yapışır.',
    draw(g) {
      const S = 250;
      g.fillStyle = D4.Y; g.fillRect(0, 0, W, 380);
      g.fillStyle = D4.K; g.fillRect(0, 380, W, 340);
      g.fillStyle = D4.W; g.fillRect(0, 720, W, 360);
      d4_chrome(g, 1, D4.K, 0.7);
      // band 1 — broker app card
      d4_card(g, 1660, 222, 330, 216, 0.06, { head: 'ARACI KURUM' }, (x, w, h) => {
        d4_lab(x, 'HİSSE PORTFÖYÜ', 20, 76, D4.K, { s: 14, ls: 2 });
        text(x, '₺4.120.380', 20, 122, { f: D4_SG, w: 700, s: 38, a: 'left', c: D4.K });
        const pts = d4_series(11, 30, 0.03, 1.2).map((v, i) => [20 + i * 10, 196 - (v - 0.85) * 120]);
        x.strokeStyle = D4.K; x.lineWidth = 5; x.lineJoin = 'round'; d4_poly(x, pts); x.stroke();
      });
      d4_big(g, 'HİSSE BURADA.', 52, 345, S, D4.K);
      // band 2 — crypto exchange card
      d4_card(g, 262, 556, 330, 220, -0.07, { head: 'KRİPTO BORSASI', fill: D4.Y, shadow: D4.R }, (x, w, h) => {
        d4_lab(x, 'CÜZDAN', 20, 76, D4.K, { s: 14, ls: 2 });
        text(x, '₺1.316.900', 20, 122, { f: D4_SG, w: 700, s: 38, a: 'left', c: D4.K });
        const r = mulberry32(5); let v = 0.45;
        for (let i = 0; i < 13; i++) {
          const o = v; v = clamp(v + (r() - 0.47) * 0.42, 0.05, 0.95);
          const up = v >= o, cx = 30 + i * 22.5, y0 = 206 - Math.max(o, v) * 66, hh = Math.max(12, Math.abs(v - o) * 66);
          x.fillStyle = up ? D4.K : D4.R; x.fillRect(cx - 2, y0 - 9, 4, hh + 18); x.fillRect(cx - 8, y0, 16, hh);
        }
      });
      d4_big(g, 'KRİPTO ORADA.', 1868, 657, S, D4.Y, { a: 'right' });
      // band 3 — spreadsheet card
      d4_card(g, 1700, 900, 320, 230, 0.05, { head: 'portföy_SON_v7.xlsx', fill: D4.W }, (x, w, h) => {
        x.strokeStyle = hexA(D4.K, 0.35); x.lineWidth = 2;
        for (let c = 0; c <= 4; c++) { x.beginPath(); x.moveTo(c * 80, 42); x.lineTo(c * 80, h); x.stroke(); }
        for (let rI = 0; rI <= 5; rI++) { x.beginPath(); x.moveTo(0, 42 + rI * 37.6); x.lineTo(w, 42 + rI * 37.6); x.stroke(); }
        const cells = [['A', '1.204', '#REF!', '0,82'], ['B', '#N/A', '312', '?'], ['C', '88,1', '1.075', '#REF!'], ['D', '—', '#N/A', '41']];
        cells.forEach((row, ri) => row.forEach((s, ci) => {
          const err = s[0] === '#' || s === '?';
          text(x, s, ci * 80 + 10, 42 + (ri + 1) * 37.6 + 24, { f: D4_SG, w: 700, s: 17, a: 'left', c: err ? D4.R : D4.K });
        }));
      });
      const qx = 52 + measure(g, 'TABLO NEREDE', { f: D4_AN, w: 400, s: S, ls: -1 });
      d4_big(g, 'TABLO NEREDE', 52, 1007, S, D4.K);
      d4_big(g, '?', qx, 1007, S, D4.R);
      // the punchline sticker
      d4_sticker(g, 'DAĞINIK!', 318, 706, { s: 92, fill: D4.R, ink: D4.W, rot: -0.08, off: 12, shadow: D4.W });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek ekran',
    desc: 'Siyah blok soldan silerek gelir, "TEK EKRANDA." sarı harflerle dolar. AllInvestView etiketi köşeye yapışır, kalın ok onu gösterir.',
    draw(g) {
      g.fillStyle = D4.Y; g.fillRect(0, 0, W, H);
      d4_chrome(g, 2, D4.K, 0.6);
      d4_big(g, 'TÜM YATIRIMLARIN', 56, 296, 160, D4.K);
      // right column paragraph, Swiss style: rule + small text
      g.fillStyle = D4.K; g.fillRect(1280, 132, 580, 4);
      ['Hisse, ETF, tahvil, opsiyon,', 'kripto, gayrimenkul, fon, nakit —', 'hepsi bir arada.'].forEach((s, i) =>
        text(g, s, 1280, 182 + i * 38, { f: D4_SG, w: 700, s: 30, a: 'left', c: D4.K }));
      // black block arriving from the left: its slanted leading edge is the wipe
      g.fillStyle = D4.K;
      g.beginPath(); g.moveTo(0, 336); g.lineTo(1884, 336); g.lineTo(1824, 806); g.lineTo(0, 806); g.closePath(); g.fill();
      const S = d4_fitS(g, 'TEK EKRANDA.', 1690);
      d4_big(g, 'TEK EKRANDA.', 60, 336 + (470 + S * 0.86) / 2, S, D4.Y);
      // tagline + arrow + wordmark sticker
      d4_big(g, 'TEK NET GÖRÜNÜM', 56, 990, 104, D4.K);
      d4_arrow(g, 790, 942, 320, 30, D4.K);
      g.save(); g.translate(1530, 902); g.rotate(-0.05);
      const wm = measure(g, 'AllInvestView', { f: D4_AN, w: 400, s: 112 }) + 112 * 0.3;
      g.fillStyle = D4.K; g.fillRect(-wm / 2 - 44 + 14, -88 + 14, wm + 88, 176);
      g.fillStyle = D4.W; g.fillRect(-wm / 2 - 44, -88, wm + 88, 176);
      wordmark(g, 0, 48, 112, i => i >= 9 ? { c: D4.B } : null, { f: D4_AN, w: 400, ls: 0, c: D4.K });
      g.restore();
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Bir bakışta',
    desc: 'Beyaz kart sert kesmeyle oturur; değer sayacı döner, sarı çizgi S&P 500\'ü geçer. Sağda kelimeler vuruşta tek tek basılır.',
    draw(g) {
      g.fillStyle = D4.K; g.fillRect(0, 0, W, H);
      d4_chrome(g, 3, D4.W, 0.5);
      // card with a hard yellow shadow
      const cx = 60, cy = 118, cw = 1190, ch = 892;
      g.fillStyle = D4.Y; g.fillRect(cx + 16, cy + 16, cw, ch);
      g.fillStyle = D4.W; g.fillRect(cx, cy, cw, ch);
      d4_lab(g, 'TOPLAM PORTFÖY DEĞERİ', 110, 180, D4.K, { s: 20 });
      d4_lab(g, 'BAZ PARA BİRİMİ · TRY', 1200, 180, hexA(D4.K, 0.55), { s: 20, a: 'right' });
      g.fillStyle = D4.K; g.fillRect(110, 198, 1090, 3);
      d4_big(g, '₺9.482.150,36', 104, 352, 150, D4.K);
      // daily change block
      g.fillStyle = D4.K; g.fillRect(960, 228, 240, 124);
      d4_lab(g, 'BUGÜN', 980, 262, hexA(D4.W, 0.7), { s: 16 });
      d4_num(g, '+%0,68', 980, 318, 54, D4.Y);
      text(g, '+₺64.218,40', 980, 342, { f: D4_SG, w: 700, s: 18, a: 'left', c: D4.W });
      // chart block
      const bx = 110, by = 384, bw = 1090, bh = 384;
      g.fillStyle = D4.K; g.fillRect(bx, by, bw, bh);
      const x0 = 140, x1 = 1168, yT = 420, yB = 740;
      const my = v => yB - (v - 0.94) / (1.44 - 0.94) * (yB - yT);
      g.strokeStyle = hexA(D4.W, 0.12); g.lineWidth = 1.5;
      for (let k = 0; k <= 4; k++) { const y = lerp(yT, yB, k / 4); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
      const you = d4_series(902, 110, 0.011, 1.384).map((v, i) => [lerp(x0, x1, i / 109), my(v)]);
      const spy = d4_series(334, 110, 0.008, 1.241).map((v, i) => [lerp(x0, x1, i / 109), my(v)]);
      g.save(); g.lineJoin = 'round';
      g.setLineDash([14, 10]); g.strokeStyle = D4.W; g.lineWidth = 4; d4_poly(g, spy); g.stroke(); g.setLineDash([]);
      g.strokeStyle = D4.Y; g.lineWidth = 10; d4_poly(g, you); g.stroke(); g.restore();
      const e = you[you.length - 1];
      g.fillStyle = D4.Y; g.fillRect(e[0] - 14, e[1] - 14, 28, 28);
      d4_lab(g, 'TOPLAM GETİRİ', 142, 444, D4.W, { s: 18 });
      d4_num(g, '+%38,4', 138, 556, 112, D4.Y);
      g.fillStyle = D4.Y; g.fillRect(844, 744, 40, 8); d4_lab(g, 'PORTFÖY', 894, 754, D4.W, { s: 16, ls: 2 });
      g.fillStyle = D4.W; g.fillRect(1004, 746, 14, 4); g.fillRect(1024, 746, 14, 4); d4_lab(g, 'S&P 500', 1048, 754, D4.W, { s: 16, ls: 2 });
      // allocation bar
      d4_lab(g, 'VARLIK DAĞILIMI', 110, 818, D4.K, { s: 18 });
      const alloc = [['HİSSE', 44, D4.K], ['ETF', 22, D4.B], ['KRİPTO', 12, D4.Y], ['TAHVİL', 10, D4.R], ['DİĞER', 12, null]];
      let ax = 110;
      alloc.forEach(([l, v, col]) => {
        const w = 1090 * v / 100 - 6;
        if (col) { g.fillStyle = col; g.fillRect(ax, 836, w, 54); } else d4_hatch(g, ax, 836, w, 54, D4.K, 12, 3);
        g.strokeStyle = D4.K; g.lineWidth = 3; g.strokeRect(ax + 1.5, 837.5, w - 3, 51);
        d4_lab(g, l, ax + 2, 928, D4.K, { s: 15, ls: 1.5 });
        d4_num(g, '%' + v, ax, 976, 42, D4.K);
        ax += w + 6;
      });
      // right column: justified stack
      d4_stack(g, [['PORTFÖYÜN', D4.W], ['BİR', D4.Y], ['BAKIŞTA.', D4.W]], 1310, 0, 552, { gap: 22, bottom: 1010, maxH: 880 });
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her piyasa',
    desc: 'Sekiz varlık etiketi ritimle ızgaraya dizilir, KRİPTO yerinden fırlar. Siyah sütunda 60+ ve 50+ sayaçla çakılır.',
    draw(g) {
      g.fillStyle = D4.W; g.fillRect(0, 0, W, H);
      // black column (bleeds right and bottom)
      g.fillStyle = D4.K; g.fillRect(1240, 104, 680, 976);
      d4_chrome(g, 4, D4.K, 0.45);
      const S0 = d4_fitS(g, 'HER VARLIK.', 1120);
      d4_big(g, 'HER VARLIK.', 56, 120 + S0 * 0.86 + 12, S0, D4.K);
      g.fillStyle = D4.K; g.fillRect(60, 404, 1120, 3);
      d4_lab(g, '8 VARLIK SINIFI', 60, 442, D4.K, { s: 20 });
      d4_lab(g, 'TEK PORTFÖYDE', 1180, 442, D4.K, { s: 20, a: 'right' });
      // sticker mosaic, each row justified to the column
      const rows = [
        [['HİSSE', D4.K, D4.W], ['ETF', D4.Y, D4.K], ['TAHVİL', D4.B, D4.W]],
        [['OPSİYON', D4.W, D4.K, 'line'], ['KRİPTO', D4.R, D4.W, 'pop'], ['FON', D4.Y, D4.K]],
        [['GAYRİMENKUL', D4.K, D4.Y], ['NAKİT', D4.B, D4.W]],
      ];
      const X0 = 60, X1 = 1180, RH = 160, GAP = 14, S = 108;
      let pop = null;
      rows.forEach((row, ri) => {
        const y = 470 + ri * (RH + GAP);
        const tws = row.map(([s]) => measure(g, s, { f: D4_AN, w: 400, s: S }));
        const pad = (X1 - X0 - tws.reduce((a, b) => a + b, 0) - GAP * (row.length - 1)) / (row.length * 2);
        let x = X0;
        row.forEach(([s, fill, ink, fx], i) => {
          const w = tws[i] + pad * 2;
          if (fx === 'pop') {
            // empty slot left behind: hatched outline (motion trace)
            d4_hatch(g, x, y, w, RH, hexA(D4.K, 0.35), 14, 3);
            g.strokeStyle = D4.K; g.lineWidth = 3; g.setLineDash([12, 8]); g.strokeRect(x + 1.5, y + 1.5, w - 3, RH - 3); g.setLineDash([]);
            pop = [s, x + w / 2, y + RH / 2, w, fill, ink];
          } else {
            g.fillStyle = fill; g.fillRect(x, y, w, RH);
            if (fx === 'line') { g.strokeStyle = D4.K; g.lineWidth = 6; g.strokeRect(x + 3, y + 3, w - 6, RH - 6); }
            d4_big(g, s, x + w / 2, y + RH / 2 + S * 0.43, S, ink, { a: 'center' });
          }
          x += w + GAP;
        });
      });
      if (pop) {
        const [s, cx, cy, w, fill, ink] = pop;
        g.save(); g.translate(cx + 14, cy - 26); g.rotate(-0.055);
        g.fillStyle = D4.K; g.fillRect(-w / 2 + 14, -RH / 2 + 14, w, RH);
        g.fillStyle = fill; g.fillRect(-w / 2, -RH / 2, w, RH);
        d4_big(g, s, 0, S * 0.43, S * 1.05, ink, { a: 'center' });
        g.restore();
      }
      // right column: hero numbers
      d4_big(g, '60+', 1296, 412, 280, D4.Y);
      d4_big(g, 'PİYASA', 1300, 530, 92, D4.W);
      g.fillStyle = hexA(D4.W, 0.5); g.fillRect(1300, 578, 560, 2);
      d4_big(g, '50+', 1296, 866, 280, D4.Y);
      d4_big(g, 'PARA BİRİMİ', 1300, 984, 92, D4.W);
      text(g, 'Her işlem, kendi tarihindeki kurla çevrilir.', 1302, 1038, { f: D4_SG, w: 500, s: 22, a: 'left', c: hexA(D4.W, 0.7) });
    },
  },
  {
    time: '17–21 sn', title: 'Otomatik senkron',
    desc: 'Dev "25+" çarpar; aracı kurum adları iki çapraz bantta zıt yönlere kayar. "SALT-OKUNUR" ve "HER GECE" etiketleri yapışır.',
    draw(g) {
      g.fillStyle = D4.B; g.fillRect(0, 0, W, H);
      d4_chrome(g, 5, D4.W, 0.5);
      d4_big(g, '25+', 44, 690, 620, D4.Y);
      d4_stack(g, [['ARACI KURUM', D4.W], ['OTOMATİK', D4.K], ['SENKRON', D4.K]], 968, 150, 880, { gap: 18, maxH: 540 });
      // two marquee bands, crossing and running in opposite directions
      d4_band(g, 984, 96, 0.04, D4.Y, ['DEGIRO', 'eToro', 'Coinbase', 'Wealthsimple', 'Public', 'Interactive Brokers'], { s: 44, ink: D4.K, dot: D4.K, sep: 70, off: 600 });
      d4_band(g, 846, 112, -0.06, D4.K, ['Interactive Brokers', 'Charles Schwab', 'Fidelity', 'Robinhood', 'Trading 212', 'DEGIRO'], { s: 52, ink: D4.W, dot: D4.Y, sep: 80, off: -60 });
      d4_sticker(g, 'SALT-OKUNUR', 790, 722, { s: 68, fill: D4.W, ink: D4.K, rot: 0.07, off: 12 });
      d4_sticker(g, 'HER GECE GÜNCELLENİR', 1560, 742, { s: 60, fill: D4.R, ink: D4.W, rot: -0.07, off: 10 });
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takvimi',
    desc: 'Aylık çubuklar vuruşta yükselir, tahmin ayları taralı çizilir. Yıllık tahmin rakamı tam ekran çakılır, "ALINDI" etiketi yapışır.',
    draw(g) {
      g.fillStyle = D4.K; g.fillRect(0, 0, W, H);
      d4_chrome(g, 6, D4.W, 0.5);
      d4_stack(g, [['TEMETTÜ', D4.W], ['KAÇMAZ.', D4.Y]], 56, 118, 640, { gap: 14, maxH: 470 });
      d4_lab(g, 'YILLIK TAHMİNİ TEMETTÜ GELİRİ', 1860, 168, hexA(D4.W, 0.75), { a: 'right', s: 20 });
      d4_big(g, '₺218.400', 1866, 412, 252, D4.Y, { a: 'right' });
      // chips
      let cx = 1860;
      [['MALİYETE GÖRE GETİRİ %4,1', D4.Y, D4.K], ['TAKVİM · ÖDEMELER · TAHMİN', null, D4.W]].forEach(([s, fill, ink]) => {
        const o = { f: D4_SG, w: 700, s: 22, ls: 2 };
        const w = measure(g, s, o) + 44;
        if (fill) { g.fillStyle = fill; g.fillRect(cx - w, 448, w, 52); }
        else { g.strokeStyle = D4.W; g.lineWidth = 3; g.strokeRect(cx - w + 1.5, 449.5, w - 3, 49); }
        text(g, s, cx - w + 22, 482, { ...o, a: 'left', c: ink });
        cx -= w + 16;
      });
      // bars
      const vals = [42, 24, 91, 45, 26, 95, 47, 28, 100, 51, 30, 106];
      const bx0 = 60, bw = (1800 - 11 * 22) / 12, base = 952;
      vals.forEach((v, i) => {
        const x = bx0 + i * (bw + 22), h = v / 106 * 318, paid = i < 9;
        if (paid) { g.fillStyle = D4.Y; g.fillRect(x, base - h, bw, h); }
        else { d4_hatch(g, x, base - h, bw, h, D4.W, 16, 4); g.strokeStyle = D4.W; g.lineWidth = 4; g.strokeRect(x + 2, base - h + 2, bw - 4, h - 2); }
        text(g, 'OŞMNMHTAEEKA'[i], x + bw / 2, 1010, { f: D4_AN, w: 400, s: 40, a: 'center', c: paid ? D4.W : hexA(D4.W, 0.55) });
      });
      g.fillStyle = D4.W; g.fillRect(40, base, 1840, 5);
      // forecast bracket
      const fx0 = bx0 + 9 * (bw + 22), fx1 = bx0 + 12 * (bw + 22) - 22;
      g.fillStyle = D4.W; g.fillRect(fx0, 600, fx1 - fx0, 3); g.fillRect(fx0, 600, 3, 16); g.fillRect(fx1 - 3, 600, 3, 16);
      d4_lab(g, 'TAHMİN', fx0, 586, D4.W, { s: 18 });
      // "received" sticker on June
      const jx = bx0 + 5 * (bw + 22) + bw / 2;
      d4_sticker(g, 'ALINDI  +₺3.124,10', jx + 60, 590, {
        s: 50, fill: D4.W, ink: D4.K, rot: -0.06, off: 10, shadow: D4.R,
        icon: (x, ix, iy, h) => { x.fillStyle = D4.B; x.fillRect(ix - h * 0.18, iy - h * 0.3, h * 0.6, h * 0.6); check(x, ix + h * 0.12, iy, h * 0.36, D4.W, 7); },
      });
    },
  },
  {
    time: '25–31 sn', title: 'Risk laboratuvarı',
    desc: '1.000 Monte Carlo yolu dev rakamların içinden akar (metin maskesi). Sağdaki tabloda risk ölçüleri satır satır sert kesmeyle gelir.',
    draw(g) {
      g.fillStyle = D4.W; g.fillRect(0, 0, W, H);
      d4_chrome(g, 7, D4.K, 0.4);
      // "1.000" as a window onto the simulation
      const S = 566, tx = 44, ty = 640, tw = measure(g, '1.000', { f: D4_AN, w: 400, s: S, ls: -2.2 });
      const yT = ty - S * 0.87, yB = ty;
      const c = canvas(W, H), x = c.getContext('2d');
      x.fillStyle = D4.K; x.fillRect(0, 0, W, H);
      const lo = Math.log(0.5), hi = Math.log(4.4);
      const map = (v, k) => [lerp(tx, tx + tw, k / 100), yB - (Math.log(v) - lo) / (hi - lo) * (yB - yT)];
      x.strokeStyle = hexA(D4.W, 0.16); x.lineWidth = 2;
      for (let k = 1; k < 10; k++) { const gx = lerp(tx, tx + tw, k / 10); x.beginPath(); x.moveTo(gx, yT); x.lineTo(gx, yB); x.stroke(); }
      x.lineWidth = 2;
      D4_MC.paths.forEach((p, i) => {
        x.strokeStyle = i % 9 === 0 ? hexA(D4.B, 0.55) : hexA(D4.Y, 0.2);
        d4_poly(x, p.map((v, k) => map(v, k))); x.stroke();
      });
      x.lineJoin = 'round';
      [[D4_MC.p95, D4.W, 7], [D4_MC.p5, D4.R, 7], [D4_MC.p50, D4.Y, 12]].forEach(([s, col, lw]) => {
        x.strokeStyle = col; x.lineWidth = lw; d4_poly(x, s.map((v, k) => map(v, k))); x.stroke();
      });
      x.globalCompositeOperation = 'destination-in';
      text(x, '1.000', tx, ty, { f: D4_AN, w: 400, s: S, a: 'left', c: '#000', ls: -2.2 });
      g.drawImage(c, 0, 0);
      // "OLASI GELECEK" on a highlighter block
      const S2 = 150, w2 = measure(g, 'OLASI GELECEK', { f: D4_AN, w: 400, s: S2 });
      g.fillStyle = D4.Y; g.fillRect(44, 684, w2 + 44, 168);
      d4_big(g, 'OLASI GELECEK', 66, 832, S2, D4.K);
      d4_lab(g, 'MONTE CARLO · 1–10 YIL · %5–%95 ARALIĞI', 48, 908, D4.K, { s: 22 });
      [['%95', D4.W, 0], ['MEDYAN', D4.Y, 1], ['%5', D4.R, 0]].forEach(([l, col, med], i) => {
        const lx = 48 + i * 190;
        g.fillStyle = D4.K; g.fillRect(lx, 944, 52, 26);
        g.fillStyle = col; g.fillRect(lx + 6, 957 - (med ? 6 : 4), 40, med ? 12 : 8);
        d4_lab(g, l, lx + 66, 965, D4.K, { s: 18, ls: 2 });
      });
      // metrics table
      const tx0 = 1290, tx1 = 1860;
      d4_lab(g, 'RİSK ÖLÇÜLERİ', tx0, 170, D4.K, { s: 22 });
      d4_lab(g, 'ÖRNEK PORTFÖY', tx1, 170, hexA(D4.K, 0.5), { s: 18, a: 'right' });
      g.fillStyle = D4.K; g.fillRect(tx0, 186, tx1 - tx0, 12);
      [['SHARPE ORANI', '1,24', D4.K], ['BETA', '0,92', D4.K], ['VaR (%95)', '−%2,1', D4.R], ['MAKS. DÜŞÜŞ', '−%18,6', D4.R]].forEach(([l, v, col], i) => {
        const y = 198 + i * 192;
        d4_lab(g, l, tx0, y + 52, D4.K, { s: 22 });
        d4_num(g, v, tx1 + 4, y + 168, 120, col, { a: 'right' });
        g.fillStyle = D4.K; g.fillRect(tx0, y + 190, tx1 - tx0, i === 3 ? 12 : 2);
      });
    },
  },
  {
    time: '31–35 sn', title: 'Hızlı özellikler',
    desc: 'Ekran dört renk bloğuna bölünür; her vuruşta bir blok çevrilir: kıyasla, vergi, YZ ile içe aktar, kriz testi.',
    draw(g) {
      const QW = 954, QH = 534;
      // four flat blocks on a black cross gutter (the Swiss grid made visible)
      g.fillStyle = D4.K; g.fillRect(0, 0, W, H);
      [[0, 0, D4.Y], [966, 0, D4.K], [0, 546, D4.W], [966, 546, D4.B]].forEach(([qx, qy, bg]) => { g.fillStyle = bg; g.fillRect(qx, qy, QW, QH); });
      g.save(); g.beginPath(); g.rect(0, 0, 960, 100); g.clip(); d4_chrome(g, 8, D4.K, 0.5); g.restore();
      g.save(); g.beginPath(); g.rect(960, 0, 960, 100); g.clip(); d4_chrome(g, 8, D4.W, 0.5); g.restore();
      const S = 176, BL = 476, LB = 262;
      // Q1 · KIYASLA
      {
        const x0 = 60, x1 = 600, yT = 112, yB = 232;
        const my = v => yB - (v - 0.95) / (1.45 - 0.95) * (yB - yT);
        const you = d4_series(71, 70, 0.016, 1.426).map((v, i) => [lerp(x0, x1, i / 69), my(v)]);
        const spy = d4_series(72, 70, 0.012, 1.319).map((v, i) => [lerp(x0, x1, i / 69), my(v)]);
        g.save(); g.lineJoin = 'round';
        g.setLineDash([12, 9]); g.strokeStyle = D4.K; g.lineWidth = 4; d4_poly(g, spy); g.stroke(); g.setLineDash([]);
        g.lineWidth = 9; d4_poly(g, you); g.stroke(); g.restore();
        g.fillStyle = D4.K; g.fillRect(you[69][0] - 9, you[69][1] - 9, 18, 18);
        d4_lab(g, 'PORTFÖY', 646, 126, D4.K, { s: 15, ls: 2 });
        d4_num(g, '+%42,6', 642, 184, 58, D4.K);
        d4_lab(g, 'S&P 500', 646, 214, hexA(D4.K, 0.6), { s: 15, ls: 2 });
        d4_num(g, '+%31,9', 642, 262, 46, hexA(D4.K, 0.5));
        d4_lab(g, 'S&P 500, VOO VEYA SEÇTİĞİN ENDEKS', 62, LB, D4.K, { s: 19 });
        d4_big(g, 'KIYASLA', 54, BL, S, D4.K);
      }
      // Q2 · VERGİ
      {
        const ox = 966, cx = 1454, cw = 406;
        // cost-basis methods as a stacked selector in the right column
        [['FIFO', 0], ['LIFO', 0], ['ORT. MALİYET', 1]].forEach(([s, on], k) => {
          const y = 120 + k * 118;
          if (on) { g.fillStyle = D4.Y; g.fillRect(cx, y, cw, 100); }
          else { g.strokeStyle = D4.W; g.lineWidth = 4; g.strokeRect(cx + 2, y + 2, cw - 4, 96); }
          d4_big(g, s, cx + 28, y + 76, 60, on ? D4.K : D4.W);
          const bx = cx + cw - 64;
          if (on) { g.fillStyle = D4.K; g.fillRect(bx, y + 30, 40, 40); check(g, bx + 20, y + 50, 22, D4.Y, 6); }
          else { g.strokeStyle = hexA(D4.W, 0.6); g.lineWidth = 3; g.strokeRect(bx + 1.5, y + 31.5, 37, 37); }
        });
        // tiny report sheet
        g.fillStyle = D4.W; g.fillRect(1028, 120, 150, 98);
        g.fillStyle = D4.K; g.fillRect(1028, 120, 150, 24);
        d4_lab(g, 'RAPOR', 1040, 138, D4.Y, { s: 13, ls: 2 });
        [0, 1, 2].forEach(k => { g.fillStyle = hexA(D4.K, 0.75); g.fillRect(1042, 160 + k * 18, k === 2 ? 70 : 122, 7); });
        d4_lab(g, 'HER PLANDA VERGİ RAPORU', ox + 62, LB, D4.W, { s: 19 });
        d4_big(g, 'VERGİ', ox + 54, BL, S, D4.Y);
      }
      // Q3 · YZ İLE İÇE AKTAR
      {
        const oy = 546;
        g.fillStyle = D4.W; g.strokeStyle = D4.K; g.lineWidth = 6; g.lineJoin = 'miter';
        g.beginPath(); g.moveTo(66, oy + 40); g.lineTo(146, oy + 40); g.lineTo(182, oy + 76); g.lineTo(182, oy + 196); g.lineTo(66, oy + 196); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(146, oy + 40); g.lineTo(146, oy + 76); g.lineTo(182, oy + 76); g.stroke();
        d4_big(g, 'CSV', 124, oy + 168, 44, D4.K, { a: 'center' });
        d4_arrow(g, 210, oy + 118, 172, 26, D4.K);
        sparkle(g, 296, oy + 62, 24, D4.B); sparkle(g, 338, oy + 84, 12, D4.B);
        [['AAPL', '10 adet'], ['VOO', 'temettü'], ['ETH', '1,5 adet']].forEach(([a, b], k) => {
          const ry = oy + 38 + k * 54;
          g.fillStyle = D4.W; g.fillRect(420, ry, 470, 44);
          g.strokeStyle = D4.K; g.lineWidth = 3; g.strokeRect(421.5, ry + 1.5, 467, 41);
          g.fillStyle = D4.B; g.fillRect(420, ry, 44, 44); check(g, 442, ry + 22, 21, D4.W, 5);
          text(g, a, 482, ry + 31, { f: D4_SG, w: 700, s: 22, a: 'left', c: D4.K });
          text(g, b, 872, ry + 31, { f: D4_SG, w: 500, s: 22, a: 'right', c: D4.K });
        });
        d4_sticker(g, 'YZ İLE', 316, oy + 240, { s: 58, fill: D4.B, ink: D4.W, rot: -0.06, off: 9 });
        d4_lab(g, 'CSV · YAPAY ZEKÂ DESTEKLİ', 470, oy + LB, D4.K, { s: 19 });
        d4_big(g, 'İÇE AKTAR', 54, oy + BL, S, D4.K);
      }
      // Q4 · KRİZ TESTİ
      {
        const ox = 966, oy = 546, x0 = ox + 60, x1 = ox + 900, yT = oy + 44;
        const pts = [];
        for (let k = 0; k <= 80; k++) {
          const u = k / 80, dip = Math.exp(-Math.pow((u - 0.42) / 0.11, 2)) * (u < 0.42 ? 1 : 0.92);
          pts.push([lerp(x0, x1, u), yT + 22 + dip * 136 - u * 26 + Math.sin(u * 40) * 4]);
        }
        const lvl = pts[22][1];
        g.fillStyle = D4.R; g.beginPath(); g.moveTo(pts[22][0], lvl);
        for (let k = 22; k <= 62; k++) g.lineTo(pts[k][0], Math.max(lvl, pts[k][1]));
        g.lineTo(pts[62][0], lvl); g.closePath(); g.fill();
        g.setLineDash([10, 8]); g.strokeStyle = hexA(D4.W, 0.7); g.lineWidth = 3; g.beginPath(); g.moveTo(x0, lvl); g.lineTo(x1, lvl); g.stroke(); g.setLineDash([]);
        g.strokeStyle = D4.W; g.lineWidth = 8; g.lineJoin = 'round'; d4_poly(g, pts); g.stroke();
        const lowK = pts.reduce((m, p, k) => p[1] > pts[m][1] ? k : m, 0);
        d4_num(g, '−%18,6', pts[lowK][0] + 44, pts[lowK][1] + 44, 46, D4.W);
        d4_lab(g, '4 GERÇEK KRİZ SENARYOSU', ox + 62, oy + LB, D4.W, { s: 19 });
        d4_big(g, 'KRİZ TESTİ', ox + 54, oy + BL, S, D4.W);
      }
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış: Ücretsiz başla',
    desc: '"ÜCRETSİZ BAŞLA" ekranı doldurur, kırmızı etiket yapışır, adres siyah bantta soldan silinerek yazılır. Son vuruşta sert kesme.',
    draw(g) {
      g.fillStyle = D4.Y; g.fillRect(0, 0, W, H);
      d4_chrome(g, 9, D4.K, 1);
      wordmark(g, 60, 232, 118, i => i >= 9 ? { c: D4.B } : null, { f: D4_AN, w: 400, ls: 0, c: D4.K, a: 'left' });
      d4_sticker(g, 'KREDİ KARTI GEREKMEZ', 1500, 200, { s: 66, fill: D4.R, ink: D4.W, rot: -0.06, off: 11 });
      const S = d4_fitS(g, 'ÜCRETSİZ BAŞLA', 1806);
      d4_big(g, 'ÜCRETSİZ BAŞLA', 54, 640, S, D4.K);
      // URL bar (full bleed) with a graphic arrow
      g.fillStyle = D4.K; g.fillRect(0, 752, W, 176);
      d4_arrow(g, 60, 840, 250, 40, D4.Y);
      text(g, 'www.kripto724.com/app', 1864, 896, { f: D4_AN, w: 400, s: 136, a: 'right', c: D4.Y, ls: 1 });
      text(g, 'Tüm yatırımların, tek ekranda.', 60, 1000, { f: D4_SG, w: 700, s: 36, a: 'left', c: D4.K });
      text(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', 60, 1046, { f: D4_SG, w: 500, s: 22, a: 'left', c: hexA(D4.K, 0.75) });
      // print colour bar
      [D4.Y, D4.K, D4.W, D4.R, D4.B].forEach((col, i) => {
        g.fillStyle = col; g.fillRect(1690 + i * 34, 1012, 34, 34);
      });
      g.strokeStyle = D4.K; g.lineWidth = 2; g.strokeRect(1690, 1012, 170, 34);
    },
  },
];

window.DESIGN = {
  id: 4, name: 'Cesur Tipografi',
  concept: 'Kaydırmayı durduran yüksek sesli bir afiş dili: ekranı dolduran dev, dar büyük harfler, sarı–siyah–beyaz düz renk blokları ve İsviçre ızgarası. Rakamlar kahraman; her vuruşta sert kesme, harf maskeleri ve yapışan etiketler.',
  board: {
    bg: D4.Y, ink: D4.K, soft: 'rgba(10,10,10,0.74)', accent: D4.K, line: D4.K,
    display: { f: D4_AN, w: 400, ls: 0 }, text: { f: D4_SG, w: 500 },
    badge: D4.R, badgeInk: D4.W, frameShadow: false,
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
  palette: [['#FFE600', 'Sarı'], ['#0A0A0A', 'Siyah'], ['#FFFFFF', 'Beyaz'], ['#FF3B30', 'Kırmızı'], ['#2B59FF', 'Mavi']],
  fonts: ['Anton', 'Space Grotesk 500 / 700'],
  motion: ['Vuruşta sert kesmeler', 'Dev tipografi, maske geçişleri', 'Renk bloğu silmeleri'],
  music: 'sert davul ve bas, el çırpma, 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d4_init,
  scenes: D4_SCENES,
};
