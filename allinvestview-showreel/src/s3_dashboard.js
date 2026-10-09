'use strict';
/* 3. DASHBOARD (8–14 s): the product. The dashboard flies in tilted through the
 * lens and lands face-on while it builds itself: value odometer, performance
 * chart against the S&P 500, KPI tiles, holdings, allocation ring and upcoming
 * dividends. The camera then pushes into the chart and into the allocation card,
 * whose tabs cycle through asset class → country → sector → broker.
 * All figures are illustrative sample data. */

const DW = 1600, DH = 920;
const DASH_VALUE = 284517.36;
const ALLOC = [
  { tab: 'Asset class', n: 'asset classes', items: [['Stocks', 44], ['ETFs', 22], ['Crypto', 12], ['Bonds', 10], ['Real estate', 7], ['Cash', 5]] },
  { tab: 'Country', n: 'countries', items: [['United States', 52], ['Europe', 18], ['United Kingdom', 9], ['Japan', 7], ['Emerging', 8], ['Other', 6]] },
  { tab: 'Sector', n: 'sectors', items: [['Technology', 31], ['Financials', 16], ['Consumer', 15], ['Healthcare', 13], ['Energy', 9], ['Other', 16]] },
  { tab: 'Broker', n: 'brokers', items: [['Interactive Brokers', 38], ['Charles Schwab', 21], ['Fidelity', 14], ['Coinbase', 12], ['Trading 212', 9], ['Manual', 6]] },
];
const ALLOC_T = [0, 12.45, 12.85, 13.25]; // when each tab becomes active
const HOLD = [
  ['AAPL', 'Apple Inc.', 'Stock', 42180.20, 1.24, 21],
  ['VOO', 'Vanguard S&P 500 ETF', 'ETF', 61904.55, 0.58, 22],
  ['BTC', 'Bitcoin', 'Crypto', 23415.00, -2.10, 23],
  ['UST10', 'US Treasury 10Y', 'Bond', 18250.00, 0.05, 24],
  ['ETH', 'Ethereum', 'Crypto', 9876.40, 3.42, 25],
];
const DIVS = [['Oct 16', 'O', '$42.10'], ['Nov 13', 'AAPL', '$18.40'], ['Dec 24', 'VOO', '$96.25']];
const PERF = walk(901, 150, 0.0024, 0.012, 1);
const BENCH = walk(333, 150, 0.0017, 0.009, 1);

// panel layout in dashboard space
const DP = {
  top: [0, 0, DW, 76],
  kpi: [24, 96, 1026, 430],
  tiles: [24, 542, 1026, 104],
  hold: [24, 662, 1026, 238],
  alloc: [1066, 96, 510, 560],
  div: [1066, 672, 510, 228],
};
const DONUT = { x: 1066 + 255, y: 96 + 268, r: 102, th: 30 };

function appear(t, t0) { return E.outCubic(prog(t, t0, t0 + 0.45)); }

function allocState(t) {
  // which dataset, and blend to the next one
  let i = 0;
  for (let k = 1; k < ALLOC.length; k++) if (t >= ALLOC_T[k]) i = k;
  const k = E.inOutCubic(prog(t, ALLOC_T[i], ALLOC_T[i] + 0.3));
  const prev = Math.max(0, i - 1);
  return { i, prev, k: i === 0 ? 1 : k };
}

function drawDashboard(g, t) {
  // frame
  g.save();
  shadow(g, 0, 0, DW, DH, 28, 0.6, 60);
  rr(g, 0, 0, DW, DH, 28);
  const bg = g.createLinearGradient(0, 0, 0, DH);
  bg.addColorStop(0, '#0C1631'); bg.addColorStop(1, '#081025');
  g.fillStyle = bg; g.fill();
  g.lineWidth = 2; g.strokeStyle = 'rgba(150,180,255,0.2)'; g.stroke();
  g.save(); rr(g, 0, 0, DW, DH, 28); g.clip();

  // top bar
  const ta = appear(t, 7.5);
  g.globalAlpha = ta;
  g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(0, 0, DW, 76);
  g.fillStyle = 'rgba(150,180,255,0.1)'; g.fillRect(0, 75, DW, 1.5);
  drawMark(g, 50, 38, 19, { th: 0.28, gap: 0.16 });
  wordmark(g, 82, 47, 27, null, { a: 'left' });
  const nav = ['Overview', 'Holdings', 'Dividends', 'Analytics', 'Tax'];
  let nx = 520;
  nav.forEach((s, i) => {
    const o = { s: 19, w: 600, f: 'Txt', a: 'left', c: i === 0 ? C.ink : C.soft };
    const w = measure(g, s, o);
    if (i === 0) { rr(g, nx - 18, 20, w + 36, 38, 19); g.fillStyle = 'rgba(61,123,255,0.22)'; g.fill(); }
    text(g, s, nx, 46, o);
    nx += w + 52;
  });
  // search, bell, avatar
  g.strokeStyle = C.soft; g.lineWidth = 2.5;
  g.beginPath(); g.arc(1430, 36, 9, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(1437, 43); g.lineTo(1444, 50); g.stroke();
  g.beginPath(); g.moveTo(1478, 46); g.lineTo(1498, 46); g.moveTo(1481, 46); g.quadraticCurveTo(1481, 26, 1488, 26); g.quadraticCurveTo(1495, 26, 1495, 46); g.stroke();
  const av = g.createLinearGradient(1530, 20, 1566, 56); av.addColorStop(0, C.cyan); av.addColorStop(1, C.violet);
  g.fillStyle = av; g.beginPath(); g.arc(1548, 38, 19, 0, TAU); g.fill();
  text(g, 'JD', 1548, 45, { s: 16, w: 700, f: 'Txt', c: '#fff' });
  g.globalAlpha = 1;

  drawKpi(g, t);
  drawTiles(g, t);
  drawHoldings(g, t);
  drawAlloc(g, t);
  drawDivs(g, t);

  g.restore();
  g.restore();
}

function panelIn(g, rect, t0, t, r = 20) {
  const a = appear(t, t0);
  if (a <= 0) return 0;
  const [x, y, w, h] = rect;
  g.globalAlpha = a;
  g.translate(0, (1 - a) * 40);
  glass(g, x, y, w, h, r, { fill: 'rgba(18,30,62,0.9)' });
  return a;
}

function chartGeom() {
  const [x, y, w] = DP.kpi;
  return { x0: x + 30, x1: x + w - 30, y0: y + 230, y1: y + 405 };
}
function perfPts(series, geo, lo = 0.85, hi = 2.25) {
  return series.map((v, i) => [lerp(geo.x0, geo.x1, i / (series.length - 1)), lerp(geo.y1, geo.y0, (v - lo) / (hi - lo))]);
}

function drawKpi(g, t) {
  g.save();
  if (!panelIn(g, DP.kpi, 7.6, t)) { g.restore(); return; }
  const [x, y, w] = DP.kpi;
  text(g, 'Total portfolio value', x + 30, y + 52, { s: 21, w: 600, f: 'Txt', a: 'left', c: C.soft });
  const v = DASH_VALUE * E.outQuart(prog(t, 8.25, 9.75));
  odometer(g, '$284,517.36', v, x + 30, y + 132, { s: 74, w: 800, f: 'Disp', a: 'left', c: C.ink });
  // change line
  const cp = prog(t, 9.6, 9.95);
  if (cp > 0) {
    g.save(); g.globalAlpha *= E.outCubic(cp);
    const s = lerp(0.6, 1, E.outBack(cp));
    g.translate(x + 30, y + 178); g.scale(s, s);
    pill(g, 0, 0, '▲ $1,942.18 (+0.69%) today', { s: 20, fill: 'rgba(46,242,166,0.14)', stroke: 'rgba(46,242,166,0.35)', c: C.mint, w: 700 });
    g.restore();
  }
  // range tabs
  const tabs = ['1D', '1W', '1M', 'YTD', '1Y', 'ALL'];
  const tx0 = x + w - 30 - tabs.length * 70;
  const sel = lerp(4, 5, E.inOutCubic(prog(t, 9.0, 9.3)));
  rr(g, tx0 + sel * 70, y + 28, 64, 38, 10); g.fillStyle = 'rgba(61,123,255,0.3)'; g.fill();
  tabs.forEach((s, i) => text(g, s, tx0 + i * 70 + 32, y + 54, { s: 17, w: 700, f: 'Txt', c: Math.abs(sel - i) < 0.5 ? C.ink : C.dim }));
  // legend
  const ly = y + 108;
  g.fillStyle = C.mint; g.fillRect(x + w - 380, ly - 6, 26, 4);
  text(g, 'Portfolio', x + w - 344, ly, { s: 17, w: 600, f: 'Txt', a: 'left', c: C.soft });
  g.setLineDash([6, 6]); g.strokeStyle = C.soft; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + w - 230, ly - 4); g.lineTo(x + w - 204, ly - 4); g.stroke(); g.setLineDash([]);
  text(g, 'S&P 500 (SPY)', x + w - 194, ly, { s: 17, w: 600, f: 'Txt', a: 'left', c: C.soft });

  // chart
  const geo = chartGeom();
  g.strokeStyle = 'rgba(150,180,255,0.08)'; g.lineWidth = 1.5;
  for (let k = 0; k < 4; k++) { const yy = lerp(geo.y0 - 20, geo.y1, k / 3); g.beginPath(); g.moveTo(geo.x0, yy); g.lineTo(geo.x1, yy); g.stroke(); }
  const p = E.inOutCubic(prog(t, 8.45, 9.9));
  if (p > 0) {
    const pts = cutAt(perfPts(PERF, geo), p);
    const bpts = cutAt(perfPts(BENCH, geo), clamp(p * 1.04));
    // area
    const gr = g.createLinearGradient(0, geo.y0 - 40, 0, geo.y1);
    gr.addColorStop(0, 'rgba(46,242,166,0.35)'); gr.addColorStop(1, 'rgba(46,242,166,0)');
    g.beginPath(); smoothPath(g, pts); g.lineTo(pts[pts.length - 1][0], geo.y1); g.lineTo(pts[0][0], geo.y1); g.closePath();
    g.fillStyle = gr; g.fill();
    g.setLineDash([7, 7]); g.strokeStyle = 'rgba(190,205,240,0.6)'; g.lineWidth = 2.5;
    g.beginPath(); smoothPath(g, bpts); g.stroke(); g.setLineDash([]);
    g.strokeStyle = C.mint; g.lineWidth = 4; g.lineJoin = 'round';
    g.beginPath(); smoothPath(g, pts); g.stroke();
    const head = pts[pts.length - 1];
    if (p < 1) addGlow(g, C.mint, head[0], head[1], 50, 0.9);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(head[0], head[1], 6, 0, TAU); g.fill();
    // hover crosshair
    const hp = prog(t, 10.15, 11.9);
    if (hp > 0 && hp < 1) {
      const ha = window01(t, 10.15, 11.9, 0.2, 0.25);
      const all = perfPts(PERF, geo);
      const fi = lerp(0.35, 0.93, E.inOutSine(hp)) * (all.length - 1);
      const i0 = Math.floor(fi), fr = fi - i0;
      const hx = lerp(all[i0][0], all[i0 + 1][0], fr), hy = lerp(all[i0][1], all[i0 + 1][1], fr);
      g.save(); g.globalAlpha *= ha;
      g.strokeStyle = 'rgba(220,230,255,0.4)'; g.lineWidth = 1.5; g.setLineDash([4, 5]);
      g.beginPath(); g.moveTo(hx, geo.y0 - 30); g.lineTo(hx, geo.y1); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.mint; g.beginPath(); g.arc(hx, hy, 9, 0, TAU); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      const val = DASH_VALUE * lerp(PERF[i0], PERF[i0 + 1], fr) / PERF[PERF.length - 1];
      const bw = 210, bx = Math.min(hx + 18, geo.x1 - bw), by = hy - 96;
      glass(g, bx, by, bw, 74, 12, { fill: 'rgba(10,18,40,0.96)', stroke: 'rgba(46,242,166,0.4)' });
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mi = Math.floor(fi / (PERF.length - 1) * 59);
      text(g, `${months[(mi + 9) % 12]} ${2021 + Math.floor((mi + 9) / 12)}`, bx + 16, by + 28, { s: 16, w: 600, f: 'Txt', a: 'left', c: C.soft });
      text(g, money(val, 0), bx + 16, by + 58, { s: 24, w: 700, f: 'Txt', a: 'left', c: C.ink });
      g.restore();
    }
  }
  g.restore();
}

function drawTiles(g, t) {
  const [x, y, w, h] = DP.tiles;
  const tiles = [
    ['Total return', '+38.4%', 38.4, C.mint],
    ['CAGR', '11.2%', 11.2, C.ink],
    ['Unrealised gains', '$61,208', 61208, C.ink],
    ['Day change', '+0.69%', 0.69, C.mint],
  ];
  const tw = (w - 3 * 16) / 4;
  tiles.forEach(([label, fmt, val, col], i) => {
    g.save();
    const tx = x + i * (tw + 16);
    if (!panelIn(g, [tx, y, tw, h], 7.8 + i * 0.07, t, 18)) { g.restore(); return; }
    text(g, label, tx + 22, y + 38, { s: 18, w: 600, f: 'Txt', a: 'left', c: C.soft });
    const v = val * E.outQuart(prog(t, 8.6 + i * 0.1, 9.7 + i * 0.1));
    odometer(g, fmt, v, tx + 22, y + 82, { s: 36, w: 800, f: 'Disp', a: 'left', c: col });
    g.restore();
  });
}

function spark(g, seed, x, y, w, h, up, p) {
  const s = walk(seed, 30, up ? 0.006 : -0.006, 0.03);
  const lo = Math.min(...s), hi = Math.max(...s);
  const pts = cutAt(s.map((v, i) => [x + i / 29 * w, y + h - (v - lo) / (hi - lo || 1) * h]), p);
  g.strokeStyle = up ? C.mint : C.red; g.lineWidth = 2.5; g.lineJoin = 'round';
  g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
}

function drawHoldings(g, t) {
  g.save();
  if (!panelIn(g, DP.hold, 7.95, t)) { g.restore(); return; }
  const [x, y, w] = DP.hold;
  const cols = [x + 30, x + 150, x + 460, x + 620, x + 820, x + 900];
  ['Symbol', 'Name', 'Type', 'Value', 'Day', 'Trend'].forEach((s, i) => {
    const right = i === 3 || i === 4;
    text(g, s, right ? cols[i] + (i === 3 ? 140 : 60) : cols[i], y + 36, { s: 15, w: 700, f: 'Txt', a: right ? 'right' : 'left', c: C.dim, ls: 1 });
  });
  HOLD.forEach(([sym, name, type, val, day, seed], i) => {
    const p = E.outCubic(prog(t, 8.45 + i * 0.09, 8.85 + i * 0.09));
    if (p <= 0) return;
    const ry = y + 76 + i * 36;
    g.save(); g.globalAlpha *= p; g.translate((1 - p) * 60, 0);
    if (i % 2 === 0) { g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(x + 14, ry - 24, w - 28, 34); }
    const tc = { Stock: C.blue, ETF: C.cyan, Crypto: C.amber, Bond: C.violet }[type];
    text(g, sym, cols[0], ry, { s: 18, w: 700, f: 'Txt', a: 'left', c: C.ink });
    text(g, name, cols[1], ry, { s: 17, w: 500, f: 'Txt', a: 'left', c: C.soft });
    pill(g, cols[2], ry - 6, type, { s: 14, h: 26, padX: 12, fill: hexA(tc, 0.16), stroke: false, c: tc, w: 700 });
    text(g, money(val), cols[3] + 140, ry, { s: 18, w: 600, f: 'Txt', a: 'right', c: C.ink });
    text(g, (day > 0 ? '+' : '−') + Math.abs(day).toFixed(2) + '%', cols[4] + 60, ry, { s: 17, w: 700, f: 'Txt', a: 'right', c: day >= 0 ? C.mint : C.red });
    spark(g, seed, cols[5], ry - 22, 96, 24, day >= 0, E.outCubic(prog(t, 8.8 + i * 0.09, 9.6 + i * 0.09)));
    g.restore();
  });
  g.restore();
}

function drawAlloc(g, t) {
  g.save();
  if (!panelIn(g, DP.alloc, 7.7, t)) { g.restore(); return; }
  const [x, y, w] = DP.alloc;
  text(g, 'Allocation', x + 28, y + 50, { s: 24, w: 700, f: 'Txt', a: 'left', c: C.ink });
  // segmented tabs
  const st = allocState(t);
  const tabs = ALLOC.map(a => a.tab);
  const tw = (w - 56) / 4;
  rr(g, x + 28, y + 74, w - 56, 44, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
  const selX = lerp(st.prev, st.i, st.k);
  rr(g, x + 32 + selX * tw, y + 78, tw - 8, 36, 9); g.fillStyle = 'rgba(61,123,255,0.45)'; g.fill();
  tabs.forEach((s, i) => text(g, s, x + 28 + i * tw + tw / 2, y + 102, { s: 15, w: 700, f: 'Txt', c: Math.abs(selX - i) < 0.5 ? C.ink : C.soft }));
  // donut: blended angles between previous and current dataset
  const A = ALLOC[st.prev].items, B = ALLOC[st.i].items;
  const vals = A.map((a, j) => lerp(a[1], B[j][1], st.k));
  const sum = vals.reduce((a, b) => a + b, 0);
  const sweep = E.outCubic(prog(t, 8.5, 9.5));
  let a0 = -Math.PI / 2 + (1 - sweep) * -1.2;
  g.lineCap = 'butt';
  vals.forEach((v, j) => {
    const span = v / sum * TAU * sweep;
    const pop = j === 0 ? kick(t - ALLOC_T[st.i], 5) * 8 : 0;
    g.strokeStyle = SEG[j]; g.lineWidth = DONUT.th + pop;
    g.beginPath(); g.arc(DONUT.x, DONUT.y, DONUT.r, a0 + 0.025, a0 + span - 0.025); g.stroke();
    a0 += span;
  });
  text(g, '$284.5K', DONUT.x, DONUT.y + 6, { s: 30, w: 800, c: C.ink });
  text(g, 'total', DONUT.x, DONUT.y + 34, { s: 16, w: 600, f: 'Txt', c: C.soft });
  // legend (two columns): labels roll when the dataset changes
  A.forEach((_, j) => {
    const rp = E.outCubic(prog(t, 8.7 + j * 0.06, 9.1 + j * 0.06));
    if (rp <= 0) return;
    const lx = x + 28 + (j < 3 ? 0 : 236), ry = y + 438 + (j % 3) * 42;
    g.save(); g.globalAlpha *= rp;
    g.fillStyle = SEG[j]; rr(g, lx, ry - 12, 12, 12, 3); g.fill();
    const k = st.k, la = A[j][0], lb = B[j][0];
    g.save(); g.beginPath(); g.rect(lx + 18, ry - 24, 170, 32); g.clip();
    if (la !== lb && k < 1) text(g, fitLabel(g, la), lx + 22, ry - k * 30, { s: 16, w: 600, f: 'Txt', a: 'left', c: C.soft });
    text(g, fitLabel(g, lb), lx + 22, ry + (la !== lb ? (1 - k) * 30 : 0), { s: 16, w: 600, f: 'Txt', a: 'left', c: C.soft });
    g.restore();
    text(g, Math.round(vals[j]) + '%', lx + 222, ry, { s: 16, w: 700, f: 'Txt', a: 'right', c: C.ink });
    g.restore();
  });
  g.restore();
}
function fitLabel(g, s) {
  const o = { s: 16, w: 600, f: 'Txt' };
  if (measure(g, s, o) <= 160) return s;
  while (s.length > 3 && measure(g, s + '…', o) > 160) s = s.slice(0, -1);
  return s + '…';
}

function drawDivs(g, t) {
  g.save();
  if (!panelIn(g, DP.div, 8.05, t)) { g.restore(); return; }
  const [x, y, w] = DP.div;
  text(g, 'Upcoming dividends', x + 28, y + 46, { s: 21, w: 700, f: 'Txt', a: 'left', c: C.ink });
  DIVS.forEach(([d, s, v], i) => {
    const p = E.outBack(prog(t, 9.0 + i * 0.12, 9.4 + i * 0.12));
    if (p <= 0) return;
    const ry = y + 96 + i * 46;
    g.save(); g.globalAlpha *= clamp(p); g.translate(x + 28, ry); g.scale(p, p);
    pill(g, 0, 0, d, { s: 15, h: 30, padX: 12, fill: 'rgba(255,181,71,0.14)', stroke: false, c: C.amber, w: 700 });
    text(g, s, 110, 6, { s: 18, w: 700, f: 'Txt', a: 'left', c: C.ink });
    text(g, v, w - 56, 6, { s: 18, w: 700, f: 'Txt', a: 'right', c: C.mint });
    g.restore();
  });
  g.restore();
}

/* camera: focus point (fx, fy) in dashboard space mapped to screen centre at zoom s,
 * plus a 3D pose while the dashboard is still flying in. */
const DTEX = { T: null };
function dashCam(t) {
  // fly-in (7.35 → 9.2)
  const fp = E.outQuart(prog(t, 7.35, 9.2));
  let c = { fx: 800, fy: 460, s: lerp(0.55, 1.0, fp), z: lerp(1500, 0, fp), rx: lerp(-0.85, 0, fp), ry: lerp(0.25, 0, fp), rz: lerp(0.22, 0, fp) };
  c.s *= 1 + 0.025 * prog(t, 9.2, 10.5);
  // push into KPI/chart
  const k1 = E.inOutCubic(prog(t, 10.45, 11.0));
  c.fx = lerp(c.fx, 560 + 30 * prog(t, 11, 12), k1); c.fy = lerp(c.fy, 330, k1); c.s = lerp(c.s, 1.52, k1);
  // pan to allocation
  const k2 = E.inOutCubic(prog(t, 11.95, 12.4));
  c.fx = lerp(c.fx, 1290 + 20 * prog(t, 12.4, 13.7), k2); c.fy = lerp(c.fy, 395, k2); c.s = lerp(c.s, 1.62, k2);
  // dive into the donut
  const k3 = E.inExpo(prog(t, 13.68, 14.02));
  c.fx = lerp(c.fx, DONUT.x, Math.min(1, k3 * 3)); c.fy = lerp(c.fy, DONUT.y, Math.min(1, k3 * 3)); c.s = c.s * Math.pow(9, k3);
  c.flat = fp >= 1;
  return c;
}

const DCAP = [
  { s: 'Your whole portfolio, at a glance.', t0: 10.55, t1: 11.92 },
  { s: 'By asset class, country, sector & broker.', t0: 12.05, t1: 13.62 },
];

function scene3(g, t) {
  const c = dashCam(t);
  if (c.flat) {
    g.save();
    g.translate(CX, CY); g.scale(c.s, c.s); g.translate(-c.fx, -c.fy);
    drawDashboard(g, t);
    g.restore();
  } else {
    if (!DTEX.T) DTEX.T = makeTex(DW + 120, DH + 120, 1.0);
    const T = DTEX.T, x = texBegin(T);
    x.translate(60, 60);
    drawDashboard(x, t);
    plane3d(g, T.c, T.w, T.h, { x: CX + (800 - c.fx) * c.s, y: CY + (460 - c.fy) * c.s, z: c.z, rx: c.rx, ry: c.ry, rz: c.rz, s: c.s }, 12, 8);
  }
  // captions
  for (const cap of DCAP) {
    if (t < cap.t0 - 0.05 || t > cap.t1 + 0.05) continue;
    const a = window01(t, cap.t0 - 0.05, cap.t1, 0.2, 0.2);
    g.save(); g.globalAlpha = a;
    const gr = g.createLinearGradient(0, 700, 0, H);
    gr.addColorStop(0, 'rgba(3,6,16,0)'); gr.addColorStop(0.6, 'rgba(3,6,16,0.85)'); gr.addColorStop(1, 'rgba(3,6,16,0.95)');
    g.fillStyle = gr; g.fillRect(0, 700, W, H - 700);
    g.restore();
    slotText(g, cap.s, CX, 985, { s: 72, w: 800, ls: -1.5, c: C.ink }, prog(t, cap.t0, cap.t0 + 0.5), prog(t, cap.t1 - 0.2, cap.t1), 0.012);
  }
  // fade to the globe at the end of the dive
  const fo = prog(t, 13.85, 14.02);
  if (fo > 0) { g.fillStyle = `rgba(3,6,16,${fo})`; g.fillRect(0, 0, W, H); }
}

function cues3(cue) {
  cue(8.0, 'impact', { gain: 0.6 });
  [7.5, 7.6, 7.7, 7.8, 7.95, 8.05].forEach((t, i) => cue(t, 'blip', { pitch: 0.9 + i * 0.1, gain: 0.25, pan: (i % 2 ? 0.4 : -0.4) }));
  cue(8.25, 'counter', { dur: 1.45, gain: 0.38 });
  cue(8.45, 'sweep', { dur: 1.3, gain: 0.25 });
  cue(9.0, 'click', { gain: 0.4, pan: 0.3 });
  HOLD.forEach((_, i) => cue(8.45 + i * 0.09, 'tick', { pitch: 1.2 + i * 0.1, gain: 0.25, pan: -0.3 }));
  DIVS.forEach((_, i) => cue(9.0 + i * 0.12, 'pop', { pitch: 1.3 + i * 0.1, gain: 0.3, pan: 0.5 }));
  cue(9.6, 'success', { gain: 0.45 });
  cue(10.45, 'whoosh', { dur: 0.5, f0: 300, f1: 2500, gain: 0.4 });
  cue(10.55, 'whoosh', { dur: 0.3, f0: 800, f1: 4000, gain: 0.2 });
  cue(11.95, 'whoosh', { dur: 0.45, f0: 2000, f1: 600, gain: 0.4, pan: 0.4 });
  ALLOC_T.slice(1).forEach((t, i) => { cue(t, 'click', { gain: 0.5, pan: 0.3 }); cue(t + 0.02, 'blip', { pitch: 1.1 + i * 0.15, gain: 0.25, pan: 0.3 }); });
  cue(13.6, 'reverse', { dur: 0.42, gain: 0.5 });
  cue(13.7, 'whoosh', { dur: 0.35, f0: 200, f1: 8000, gain: 0.6 });
}
