'use strict';
/* 7. RISK LAB (26–32 s): 1,000 Monte Carlo paths sweep out ten years as the
 * horizon slider runs 1Y → 10Y and the 5th/50th/95th percentiles settle. Then
 * the cloud collapses into an efficient frontier: random portfolios coloured by
 * Sharpe ratio, the frontier curve, the max-Sharpe point and the risk metrics.
 * Both are simulated at start-up from seeded random numbers. */

const MC = { n: 1000, steps: 120, x0: 220, x1: 1680, yT: 350, yB: 960, lo: 40, hi: 700 };
const FR = { x0: 220, x1: 1260, yT: 360, yB: 960, s0: 0.035, s1: 0.17, m0: 0.032, m1: 0.09, rf: 0.02 };
const S7 = { reveal0: 26.35, reveal1: 27.85, swap: 28.9, dots: 29.1, front: 29.75, star: 30.4, you: 29.6, arrow: 30.5, chips: 30.85, out: 31.8 };
const RISK_CHIPS = [['Sharpe ratio', '1.24', C.mint], ['Beta', '0.92', C.ink], ['Volatility', '14.8%', C.ink], ['Value at Risk (95%)', '−2.1%', C.red], ['Max drawdown', '−18.6%', C.red], ['Crash stress tests', '4 replayed', C.amber]];

const mcY = v => MC.yB - Math.log(clamp(v, MC.lo * 0.6, MC.hi * 1.4) / MC.lo) / Math.log(MC.hi / MC.lo) * (MC.yB - MC.yT);
const mcX = k => lerp(MC.x0, MC.x1, k / MC.steps);
const frX = s => lerp(FR.x0, FR.x1, (s - FR.s0) / (FR.s1 - FR.s0));
const frY = m => lerp(FR.yB, FR.yT, (m - FR.m0) / (FR.m1 - FR.m0));

function init7() {
  // Monte Carlo: geometric Brownian motion, 7 % drift, 17 % volatility, monthly steps
  const r = mulberry32(2024), mu = 0.07, sig = 0.17, dt = 1 / 12;
  const paths = [];
  for (let i = 0; i < MC.n; i++) {
    const p = new Float32Array(MC.steps + 1); p[0] = 100;
    for (let k = 1; k <= MC.steps; k++) p[k] = p[k - 1] * Math.exp((mu - sig * sig / 2) * dt + sig * Math.sqrt(dt) * gauss(r));
    paths.push(p);
  }
  const order = paths.map((p, i) => [p[MC.steps], i]).sort((a, b) => a[0] - b[0]);
  const rank = new Float32Array(MC.n); order.forEach(([, i], k) => { rank[i] = k / (MC.n - 1); });
  MC.pct = { p5: [], p50: [], p95: [] };
  for (let k = 0; k <= MC.steps; k++) {
    const col = paths.map(p => p[k]).sort((a, b) => a - b);
    MC.pct.p5.push([mcX(k), mcY(col[Math.floor(0.05 * MC.n)])]);
    MC.pct.p50.push([mcX(k), mcY(col[Math.floor(0.5 * MC.n)])]);
    MC.pct.p95.push([mcX(k), mcY(col[Math.floor(0.95 * MC.n)])]);
  }
  const c = canvas(W, H), x = c.getContext('2d');
  x.globalCompositeOperation = 'lighter'; x.lineWidth = 1.3; x.lineJoin = 'round';
  paths.forEach((p, i) => {
    x.strokeStyle = rgb(ramp(['#7C4DFF', '#3D7BFF', '#38C8FF', '#2EF2A6'], rank[i]), 0.075);
    x.beginPath();
    for (let k = 0; k <= MC.steps; k++) k ? x.lineTo(mcX(k), mcY(p[k])) : x.moveTo(mcX(k), mcY(p[k]));
    x.stroke();
  });
  MC.img = c;

  // Efficient frontier: five asset classes, random long-only portfolios
  const A = [[0.035, 0.05], [0.09, 0.16], [0.075, 0.17], [0.07, 0.14], [0.05, 0.15]];
  const R = [[1, 0.1, 0.1, 0.2, 0.2], [0.1, 1, 0.8, 0.6, 0.05], [0.1, 0.8, 1, 0.55, 0.1], [0.2, 0.6, 0.55, 1, 0.1], [0.2, 0.05, 0.1, 0.1, 1]];
  const r2 = mulberry32(99), pts = [];
  for (let n = 0; n < 6000; n++) {
    const w = A.map(() => Math.pow(r2(), 3.2)); const sw = w.reduce((a, b) => a + b, 0); w.forEach((_, i) => w[i] /= sw);
    let m = 0, v = 0;
    for (let i = 0; i < 5; i++) { m += w[i] * A[i][0]; for (let j = 0; j < 5; j++) v += w[i] * w[j] * A[i][1] * A[j][1] * R[i][j]; }
    pts.push({ s: Math.sqrt(v), m, sh: (m - FR.rf) / Math.sqrt(v), t: r2() });
  }
  const shs = pts.map(p => p.sh), shLo = Math.min(...shs), shHi = Math.max(...shs);
  pts.forEach(p => { p.c = rgb(ramp(['#7C4DFF', '#3D7BFF', '#38C8FF', '#2EF2A6'], (p.sh - shLo) / (shHi - shLo))); });
  FR.dots = pts.slice(0, 1600);
  // upper envelope = frontier
  const bins = 46, env = [];
  for (let b = 0; b < bins; b++) {
    const s0 = 0.035 + b * 0.0028, s1 = s0 + 0.0028;
    let best = null;
    for (const p of pts) if (p.s >= s0 && p.s < s1 && (!best || p.m > best.m)) best = p;
    if (best) env.push([best.s, best.m]);
  }
  let iMin = 0; env.forEach((e, i) => { if (e[0] < env[iMin][0]) iMin = i; });
  const mono = []; let mx = -1;
  for (const e of env.slice(iMin)) if (e[1] > mx) { mono.push(e); mx = e[1]; }
  const sm = mono.map((e, i) => { const a = mono[Math.max(0, i - 1)], b = mono[Math.min(mono.length - 1, i + 1)]; return [e[0], (a[1] + 2 * e[1] + b[1]) / 4]; });
  FR.curve = sm.map(([s, m]) => [frX(s), frY(m)]);
  let bi = 0; sm.forEach((e, i) => { if ((e[1] - FR.rf) / e[0] > (sm[bi][1] - FR.rf) / sm[bi][0]) bi = i; });
  FR.best = sm[bi]; FR.you = [0.135, 0.062];
}

function riskOut(t) { return -pushP(0, t) * W; }

function drawMC(g, t, a) {
  if (a <= 0) return;
  const p = E.inOutCubic(prog(t, S7.reveal0, S7.reveal1));
  const ex = lerp(MC.x0, MC.x1, p);
  g.save(); g.globalAlpha *= a;
  // grid + axis
  g.strokeStyle = 'rgba(150,180,255,0.08)'; g.lineWidth = 1.5;
  for (let k = 0; k <= 5; k++) { const y = lerp(MC.yT, MC.yB, k / 5); g.beginPath(); g.moveTo(MC.x0, y); g.lineTo(MC.x1, y); g.stroke(); }
  ['Today', '2Y', '4Y', '6Y', '8Y', '10Y'].forEach((s, k) => text(g, s, lerp(MC.x0, MC.x1, k / 5), 1000, { s: 19, w: 600, f: 'Txt', c: C.dim }));
  // band
  const bp = prog(t, S7.reveal1 - 0.2, S7.reveal1 + 0.4);
  if (bp > 0) {
    g.save(); g.globalAlpha *= 0.12 * bp;
    g.beginPath(); MC.pct.p95.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    for (let i = MC.pct.p5.length - 1; i >= 0; i--) g.lineTo(MC.pct.p5[i][0], MC.pct.p5[i][1]);
    g.closePath(); g.fillStyle = C.cyan; g.fill(); g.restore();
  }
  if (p > 0) {
    g.save();
    g.beginPath(); g.rect(MC.x0 - 4, 0, ex - MC.x0 + 4, H); g.clip();
    g.globalCompositeOperation = 'lighter';
    g.drawImage(MC.img, 0, 0);
    g.globalCompositeOperation = 'source-over';
    // percentile lines
    [['p95', C.mint, 3], ['p50', '#FFFFFF', 4], ['p5', C.violet, 3]].forEach(([k, col, lw]) => {
      g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round';
      g.beginPath(); smoothPath(g, MC.pct[k]); g.stroke();
    });
    g.restore();
    // leading edge
    if (p < 1) {
      const gr = g.createLinearGradient(0, MC.yT, 0, MC.yB);
      gr.addColorStop(0, 'rgba(56,200,255,0)'); gr.addColorStop(0.5, 'rgba(56,200,255,0.55)'); gr.addColorStop(1, 'rgba(56,200,255,0)');
      g.fillStyle = gr; g.fillRect(ex - 1.5, MC.yT - 40, 3, MC.yB - MC.yT + 80);
      const k = Math.min(MC.steps, Math.round(p * MC.steps));
      [['p95', C.mint], ['p50', '#FFFFFF'], ['p5', C.violet]].forEach(([key, col]) => {
        const [px, py] = MC.pct[key][k]; addGlow(g, col, px, py, 40, 1);
      });
    }
    // start dot
    addGlow(g, '#FFFFFF', MC.x0, mcY(100), 50, 0.8);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(MC.x0, mcY(100), 7, 0, TAU); g.fill();
  }
  // labels
  [['95th percentile', 'p95', C.mint], ['Median', 'p50', '#FFFFFF'], ['5th percentile', 'p5', C.violet]].forEach(([s, k, col], i) => {
    const lp = prog(t, S7.reveal1 - 0.1 + i * 0.08, S7.reveal1 + 0.25 + i * 0.08);
    if (lp <= 0) return;
    const [x, y] = MC.pct[k][MC.steps];
    g.save(); g.globalAlpha *= E.outCubic(lp);
    g.fillStyle = col; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
    pill(g, x + 18 + (1 - E.outCubic(lp)) * 30, y, s, { s: 18, fill: 'rgba(10,18,40,0.92)', stroke: hexA(col, 0.6), c: col, w: 700 });
    g.restore();
  });
  // horizon slider
  const sa = prog(t, 26.2, 26.6);
  if (sa > 0) {
    const yrs = 1 + 9 * p;
    const x0 = 1330, x1 = 1730, y = 252;
    g.save(); g.globalAlpha *= E.outCubic(sa);
    text(g, 'Horizon', x0, y - 30, { s: 20, w: 600, f: 'Txt', a: 'left', c: C.soft });
    text(g, Math.max(1, Math.round(yrs)) + (Math.round(yrs) === 1 ? ' year' : ' years'), x1, y - 30, { s: 22, w: 700, f: 'Txt', a: 'right', c: C.ink });
    g.fillStyle = 'rgba(255,255,255,0.1)'; rr(g, x0, y - 3, x1 - x0, 6, 3); g.fill();
    const kx = lerp(x0, x1, (yrs - 1) / 9);
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, C.violet); gr.addColorStop(1, C.cyan);
    g.fillStyle = gr; rr(g, x0, y - 3, kx - x0, 6, 3); g.fill();
    for (let k = 0; k < 10; k++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(lerp(x0, x1, k / 9) - 1, y + 12, 2, 7); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(kx, y, 12, 0, TAU); g.fill();
    addGlow(g, C.cyan, kx, y, 36, 0.7);
    g.restore();
  }
  g.restore();
}

function drawFrontier(g, t, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  // axes
  g.strokeStyle = 'rgba(150,180,255,0.18)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(FR.x0, FR.yT - 20); g.lineTo(FR.x0, FR.yB); g.lineTo(FR.x1 + 20, FR.yB); g.stroke();
  text(g, 'Volatility (risk) →', FR.x1 + 20, FR.yB + 40, { s: 19, w: 600, f: 'Txt', a: 'right', c: C.dim });
  text(g, '↑ Expected return', FR.x0 + 14, FR.yT - 6, { s: 19, w: 600, f: 'Txt', a: 'left', c: C.dim });
  // dots
  for (const d of FR.dots) {
    const p = prog(t, S7.dots + d.t * 0.75, S7.dots + d.t * 0.75 + 0.25);
    if (p <= 0) continue;
    const r = 3.4 * E.outBack(p);
    g.fillStyle = d.c; g.globalAlpha = a * 0.75 * clamp(p * 2);
    g.fillRect(frX(d.s) - r, frY(d.m) - r, 2 * r, 2 * r);
  }
  g.globalAlpha = a;
  // capital market line
  const cl = E.inOutCubic(prog(t, S7.star - 0.1, S7.star + 0.35));
  if (cl > 0) {
    const [bs, bm] = FR.best, slope = (bm - FR.rf) / bs;
    const s1 = lerp(0.0, 0.17, cl);
    const x0 = frX(Math.max(FR.s0, 0.03)), y0 = frY(FR.rf + slope * Math.max(FR.s0, 0.03));
    g.setLineDash([8, 8]); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(frX(Math.max(0.03, s1)), frY(FR.rf + slope * Math.max(0.03, s1))); g.stroke(); g.setLineDash([]);
  }
  // frontier curve
  const fp = E.inOutCubic(prog(t, S7.front, S7.front + 0.65));
  if (fp > 0) {
    const cut = cutAt(FR.curve, fp);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(46,242,166,0.35)'; g.lineWidth = 14; g.lineCap = 'round';
    g.beginPath(); smoothPath(g, cut); g.stroke();
    g.restore();
    g.strokeStyle = C.mint; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); smoothPath(g, cut); g.stroke();
    const hd = cut[cut.length - 1];
    if (fp < 1) addGlow(g, C.mint, hd[0], hd[1], 60, 1);
    if (fp >= 1) {
      const la = prog(t, S7.front + 0.65, S7.front + 0.95);
      g.globalAlpha = a * la;
      const e = FR.curve[FR.curve.length - 1];
      text(g, 'Efficient frontier', e[0] - 10, e[1] - 26, { s: 20, w: 700, f: 'Txt', a: 'right', c: C.mint });
      g.globalAlpha = a;
    }
  }
  // you
  const yp = t - S7.you;
  const [ux, uy] = [frX(FR.you[0]), frY(FR.you[1])];
  if (yp > 0) {
    const s = spring(yp, 2.4, 8);
    const pr = (t * 1.2) % 1;
    g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - pr)})`; g.lineWidth = 2; g.beginPath(); g.arc(ux, uy, 10 + pr * 26, 0, TAU); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ux, uy, 10 * s, 0, TAU); g.fill();
    g.fillStyle = C.blue; g.beginPath(); g.arc(ux, uy, 5 * s, 0, TAU); g.fill();
    g.globalAlpha = a * clamp(yp * 4);
    pill(g, ux + 22, uy + 34, 'Your portfolio', { s: 18, fill: 'rgba(10,18,40,0.92)', c: C.ink, w: 700 });
    g.globalAlpha = a;
  }
  // max Sharpe star + arrow
  const sp = t - S7.star;
  const [bx, by] = [frX(FR.best[0]), frY(FR.best[1])];
  if (sp > 0) {
    const s = spring(sp, 2.2, 7);
    addGlow(g, C.amber, bx, by, 90 * s, 0.8);
    g.save(); g.translate(bx, by); g.rotate(sp * 0.8); g.scale(s, s);
    g.fillStyle = C.gold; g.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    g.closePath(); g.fill(); g.restore();
    g.globalAlpha = a * clamp(sp * 4);
    pill(g, bx - 30, by - 48, 'Max Sharpe', { s: 19, a: 'right', fill: 'rgba(10,18,40,0.95)', stroke: 'rgba(255,203,87,0.7)', c: C.gold, w: 700 });
    g.globalAlpha = a;
  }
  const ap = E.inOutCubic(prog(t, S7.arrow, S7.arrow + 0.45));
  if (ap > 0) {
    const c1 = [lerp(ux, bx, 0.15) - 60, lerp(uy, by, 0.5)];
    const n = 30, m = Math.round(n * ap);
    g.strokeStyle = C.gold; g.lineWidth = 3.5; g.setLineDash([10, 8]); g.lineCap = 'round';
    g.beginPath();
    let last = [ux, uy], prev = last;
    for (let j = 0; j <= m; j++) {
      const s = j / n * 0.88 + 0.06, u = 1 - s;
      const q = [u * u * ux + 2 * u * s * c1[0] + s * s * bx, u * u * uy + 2 * u * s * c1[1] + s * s * by];
      j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); prev = last; last = q;
    }
    g.stroke(); g.setLineDash([]);
    const an = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
    g.fillStyle = C.gold; g.beginPath(); g.moveTo(last[0] + Math.cos(an) * 14, last[1] + Math.sin(an) * 14);
    g.lineTo(last[0] + Math.cos(an + 2.5) * 13, last[1] + Math.sin(an + 2.5) * 13); g.lineTo(last[0] + Math.cos(an - 2.5) * 13, last[1] + Math.sin(an - 2.5) * 13); g.closePath(); g.fill();
  }
  // metric chips
  RISK_CHIPS.forEach(([label, val, col], i) => {
    const p = t - (S7.chips + i * 0.11);
    if (p <= 0) return;
    const s = spring(p, 2.2, 8), x = 1360, y = 360 + i * 98;
    g.save(); g.globalAlpha = a * clamp(p * 5); g.translate(x + (1 - E.outCubic(clamp(p / 0.35))) * 220, y);
    g.scale(lerp(0.85, 1, clamp(s)), lerp(0.85, 1, clamp(s)));
    glass(g, 0, 0, 440, 80, 18, { fill: 'rgba(16,28,60,0.94)', stroke: hexA(col === C.ink ? C.blue : col, 0.4) });
    text(g, label, 26, 50, { s: 22, w: 600, f: 'Txt', a: 'left', c: C.soft });
    text(g, val, 414, 52, { s: 32, w: 800, a: 'right', c: col });
    g.restore();
  });
  g.restore();
}

function scene7(g, t) {
  const ox = riskOut(t);
  const inP = E.outCubic(prog(t, 25.75, 26.25));
  g.save();
  g.translate(ox + (1 - inP) * 300, 0);
  g.globalAlpha = inP;
  const mcA = 1 - prog(t, S7.swap - 0.05, S7.swap + 0.25);
  const frA = prog(t, S7.swap + 0.05, S7.swap + 0.35);
  drawMC(g, t, mcA);
  drawFrontier(g, t, frA);
  // headline
  kicker(g, 'RISK LAB', 130, 140, C.violet, prog(t, 25.9, 26.3));
  const H1 = { s: 74, w: 900, ls: -1.5, a: 'left', c: C.ink };
  // "See 1,000 possible futures." with a live counter
  const ha = prog(t, 26.0, 26.4) * (1 - prog(t, S7.swap - 0.1, S7.swap + 0.1));
  if (ha > 0) {
    g.save(); g.globalAlpha *= E.outCubic(ha); g.translate(0, (1 - E.outCubic(ha)) * 30);
    const w1 = measure(g, 'See ', H1);
    text(g, 'See ', 130, 228, H1);
    const gr = g.createLinearGradient(130 + w1, 0, 130 + w1 + 220, 0); gr.addColorStop(0, C.cyan); gr.addColorStop(1, C.violet);
    const wN = odometer(g, '1,000', 1000 * E.outQuart(prog(t, 26.1, 27.4)), 130 + w1, 228, { ...H1, c: gr });
    text(g, ' possible futures.', 130 + w1 + wN, 228, H1);
    g.restore();
  }
  slotText(g, 'Monte Carlo simulation  ·  1 to 10 year horizon  ·  5th to 95th percentile', 130, 284, { s: 27, w: 500, f: 'Txt', a: 'left', c: C.soft }, prog(t, 26.25, 26.7), prog(t, S7.swap - 0.1, S7.swap + 0.1), 0.004);
  slotText(g, 'Find your efficient frontier.', 130, 228, { ...H1, colors: (i) => i >= 10 ? C.mint : C.ink }, prog(t, S7.swap + 0.05, S7.swap + 0.55), 0, 0.02);
  slotText(g, 'Markowitz optimisation  ·  Sharpe, beta, volatility, VaR & drawdown', 130, 284, { s: 27, w: 500, f: 'Txt', a: 'left', c: C.soft }, prog(t, S7.swap + 0.2, S7.swap + 0.65), 0, 0.004);
  g.restore();
}

function cues7(cue) {
  cue(25.62, 'whoosh', { dur: 0.4, f0: 5000, f1: 500, gain: 0.35, pan: -0.4 });
  cue(26.0, 'impact', { gain: 0.6 });
  cue(26.1, 'counter', { dur: 1.2, gain: 0.25 });
  cue(S7.reveal0, 'scan', { dur: S7.reveal1 - S7.reveal0, gain: 0.35, pan0: -0.7, pan1: 0.7 });
  for (let y = 2; y <= 10; y++) {
    // slider ticks when the integer year changes
    const target = (y - 1.5) / 9;
    let lo = 0, hi = 1;
    for (let it = 0; it < 30; it++) { const mid = (lo + hi) / 2; if (E.inOutCubic(mid) < target) lo = mid; else hi = mid; }
    cue(lerp(S7.reveal0, S7.reveal1, lo), 'tick', { pitch: 1 + y * 0.06, gain: 0.3, pan: 0.6 });
  }
  cue(S7.reveal1, 'shine', { dur: 0.5, gain: 0.3 });
  [0, 1, 2].forEach(i => cue(S7.reveal1 - 0.1 + i * 0.08, 'pop', { pitch: 1.2 + i * 0.1, gain: 0.3, pan: 0.7 }));
  cue(S7.swap, 'reverse', { dur: 0.3, gain: 0.3 });
  cue(29.0, 'impact', { gain: 0.45 });
  cue(S7.dots, 'fizz', { dur: 0.9, gain: 0.3 });
  cue(S7.you, 'pop', { pitch: 0.9, gain: 0.35, pan: -0.2 });
  cue(S7.front, 'sweep', { dur: 0.65, gain: 0.3 });
  cue(S7.star, 'shine', { dur: 0.5, gain: 0.4 });
  cue(S7.star, 'pop', { pitch: 1.5, gain: 0.4, pan: -0.1 });
  cue(S7.arrow, 'zip', { dur: 0.45, gain: 0.25 });
  RISK_CHIPS.forEach((_, i) => cue(S7.chips + i * 0.11, 'pop', { pitch: 1 + i * 0.08, gain: 0.3, pan: 0.5 }));
}
