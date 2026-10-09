'use strict';
/* 8. MONTAGE (32–36 s): four features, two beats each, whip-panned in on the
 * downbeat: benchmarks, tax lots, AI-assisted import and crash stress tests. */

const SLIDES = [
  { k: '01 · BENCHMARKS', a: 'Benchmark', b: 'anything.', sub: 'Compare against SPY, VOO or any index you pick.', col: C.mint },
  { k: '02 · TAX', a: 'Tax-ready', b: 'reports.', sub: 'FIFO, LIFO or average cost, on every plan.', col: C.amber },
  { k: '03 · IMPORT', a: 'AI-assisted', b: 'import.', sub: 'Drop in a statement. Get clean transactions.', col: C.violet },
  { k: '04 · STRESS TESTS', a: 'Replay real', b: 'crashes.', sub: 'Historical crashes, replayed against your positions.', col: C.red },
];
const M0 = 32.0;
const CARD8 = { x: 960, y: 270, w: 820, h: 540 };
const BM_YOU = walk(71, 70, 0.0052, 0.016), BM_SPY = walk(72, 70, 0.004, 0.012);
const TAXV = [4218, 3602, 3947], TAXT = [33.0, 33.3, 33.6];
const TXNS = [['BUY', C.mint, 'AAPL', '10 @ $189.20', '−$1,892.00'], ['DIV', C.amber, 'VOO', 'Dividend', '+$96.25'], ['SELL', C.red, 'ETH', '1.5 @ $3,410.00', '+$5,115.00'], ['BUY', C.mint, 'BND', '25 @ $72.10', '−$1,802.50']];
const CRASH = (() => {
  const r = mulberry32(8), pts = [];
  for (let i = 0; i <= 80; i++) {
    const x = i / 80;
    let v = 1 + 0.12 * x;
    v -= 0.2 * Math.exp(-Math.pow((x - 0.36) / 0.09, 2)) * (x < 0.36 ? 1 : 1);
    if (x > 0.36) v -= 0.2 * (Math.exp(-Math.pow((x - 0.36) / 0.09, 2)) - Math.exp(-Math.pow((x - 0.36) / 0.2, 2))) * 0.6;
    pts.push([x, v + (r() - 0.5) * 0.012]);
  }
  return pts;
})();

// push-pan between slides: transition k lands slide k on its downbeat
const PUSH_T = [32.0, 33.0, 34.0, 35.0];
const pushP = (k, t) => k < PUSH_T.length ? E.inOutCubic(prog(t, PUSH_T[k] - 0.2, PUSH_T[k] + 0.14)) : 0;
function slideOffset(i, t) { return (1 - pushP(i, t)) * W - pushP(i + 1, t) * W; }

function slideCard(g, i, t) {
  const st = M0 + i, u = t - st;
  const { x: X, y: Y, w, h } = CARD8;
  glass(g, X, Y, w, h, 26, { fill: 'rgba(15,26,56,0.95)', stroke: hexA(SLIDES[i].col, 0.35) });
  g.save(); g.translate(X, Y);
  const T = { f: 'Txt', a: 'left' };
  if (i === 0) {
    text(g, 'Performance vs benchmark', 36, 60, { ...T, s: 26, w: 700, c: C.ink });
    pill(g, w - 36, 50, 'SPY      ', { s: 18, a: 'right', fill: 'rgba(255,255,255,0.06)', c: C.ink, w: 700 });
    g.strokeStyle = C.soft; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(w - 70, 46); g.lineTo(w - 64, 53); g.lineTo(w - 58, 46); g.stroke();
    const map = (s, f) => s.map((v, k) => [60 + k / (s.length - 1) * 640, 470 - (v / s[s.length - 1] * f - 0.9) / 0.6 * 330]);
    const you = map(BM_YOU, 1.426), spy = map(BM_SPY, 1.319);
    g.strokeStyle = 'rgba(150,180,255,0.08)'; g.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) { const y = 150 + k * 100; g.beginPath(); g.moveTo(50, y); g.lineTo(w - 40, y); g.stroke(); }
    const p = E.inOutCubic(prog(u, 0.05, 0.6));
    if (p > 0) {
      const a = cutAt(spy, p), b = cutAt(you, p);
      g.setLineDash([8, 7]); g.strokeStyle = 'rgba(220,230,255,0.75)'; g.lineWidth = 3; g.beginPath(); smoothPath(g, a); g.stroke(); g.setLineDash([]);
      const gr = g.createLinearGradient(0, 120, 0, 480); gr.addColorStop(0, 'rgba(46,242,166,0.3)'); gr.addColorStop(1, 'rgba(46,242,166,0)');
      g.beginPath(); smoothPath(g, b); g.lineTo(b[b.length - 1][0], 480); g.lineTo(b[0][0], 480); g.closePath(); g.fillStyle = gr; g.fill();
      g.strokeStyle = C.mint; g.lineWidth = 5; g.beginPath(); smoothPath(g, b); g.stroke();
      const hb = b[b.length - 1], ha = a[a.length - 1];
      addGlow(g, C.mint, hb[0], hb[1], 40, 0.9);
      if (p >= 1) {
        const lp = E.outCubic(prog(u, 0.6, 0.8));
        g.globalAlpha = lp;
        pill(g, hb[0] - 16, hb[1] - 36, 'You  +42.6%', { s: 18, a: 'right', fill: 'rgba(46,242,166,0.18)', stroke: 'rgba(46,242,166,0.6)', c: C.mint, w: 700 });
        pill(g, ha[0] - 16, ha[1] + 36, 'SPY  +31.9%', { s: 18, a: 'right', fill: 'rgba(255,255,255,0.08)', c: C.ink, w: 700 });
        g.globalAlpha = 1;
      }
    }
  } else if (i === 1) {
    text(g, 'Tax report · 2025', 36, 60, { ...T, s: 26, w: 700, c: C.ink });
    const labels = ['FIFO', 'LIFO', 'Average cost'], sw = (w - 72) / 3;
    rr(g, 36, 96, w - 72, 60, 14); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill();
    let sel = 0, val = TAXV[0];
    for (let k = 1; k < 3; k++) { const e = E.inOutCubic(prog(t, TAXT[k], TAXT[k] + 0.22)); sel = lerp(sel, k, e); val = lerp(val, TAXV[k], e); }
    rr(g, 42 + sel * sw, 102, sw - 12, 48, 11); g.fillStyle = 'rgba(255,181,71,0.25)'; g.fill();
    labels.forEach((s, k) => text(g, s, 36 + k * sw + sw / 2, 134, { s: 20, w: 700, f: 'Txt', c: Math.abs(sel - k) < 0.5 ? C.amber : C.soft }));
    text(g, 'Realised gains', 36, 222, { ...T, s: 20, w: 600, c: C.soft });
    odometer(g, '$' + Math.round(val).toLocaleString('en-US'), val, 36, 300, { s: 72, w: 800, a: 'left', c: C.ink });
    [['Short-term', 0.38], ['Long-term', 0.62]].forEach(([s, f], k) => {
      const y = 360 + k * 46;
      text(g, s, 36, y, { ...T, s: 19, w: 600, c: C.soft });
      g.fillStyle = 'rgba(255,255,255,0.07)'; rr(g, 200, y - 14, 360, 14, 7); g.fill();
      g.fillStyle = k ? C.amber : '#FFD27A'; rr(g, 200, y - 14, 360 * f * (val / 4218), 14, 7); g.fill();
      text(g, money(val * f, 0), w - 36, y, { ...T, a: 'right', s: 20, w: 700, c: C.ink });
    });
    const dp = u - 0.78;
    if (dp > 0) {
      const s = spring(dp, 2.4, 9);
      g.save(); g.translate(w / 2, 488); g.scale(s, s);
      const bw = pill(g, 0, 0, '      Export tax report (PDF)', { s: 20, a: 'center', fill: 'rgba(255,181,71,0.2)', stroke: 'rgba(255,181,71,0.7)', c: C.amber, w: 700 });
      check(g, -bw / 2 + 32, 0, 16, C.amber, 3.5, E.outCubic(clamp(dp / 0.25)));
      g.restore();
    }
  } else if (i === 2) {
    text(g, 'Import transactions', 36, 60, { ...T, s: 26, w: 700, c: C.ink });
    const aw = pill(g, w - 36, 50, '     AI assistant', { s: 18, a: 'right', fill: 'rgba(139,92,246,0.2)', stroke: 'rgba(139,92,246,0.6)', c: '#C4B0FF', w: 700 });
    sparkle(g, w - 36 - aw + 30, 50, 10, '#C4B0FF');
    // file drops in, then dissolves into rows
    const fp = prog(u, 0.02, 0.3), fo = prog(u, 0.3, 0.45);
    if (fp > 0 && fo < 1) {
      const y = lerp(-140, 230, E.outBack(fp));
      g.save(); g.globalAlpha *= 1 - fo; g.translate(w / 2, y); g.scale(1 + fo * 0.3, 1 + fo * 0.3);
      g.fillStyle = '#1C2D5C'; g.beginPath(); g.moveTo(-60, -76); g.lineTo(30, -76); g.lineTo(60, -46); g.lineTo(60, 76); g.lineTo(-60, 76); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(180,200,255,0.5)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = C.mint; rr(g, -44, 4, 70, 30, 6); g.fill();
      text(g, 'CSV', -9, 26, { s: 18, w: 800, f: 'Txt', c: '#06122A' });
      text(g, 'statement_Q3.csv', 0, 110, { s: 18, w: 600, f: 'Txt', c: C.soft });
      g.restore();
    }
    const sp = u - 0.28;
    if (sp > 0 && sp < 0.6) {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 14; k++) {
        const an = k / 14 * TAU, r = 20 + sp * 380, a = 1 - sp / 0.6;
        const x = w / 2 + Math.cos(an) * r, y = 230 + Math.sin(an) * r * 0.6;
        sparkle(g, x, y, 8, hexA(k % 2 ? C.violet : C.cyan, a));
      }
      g.restore();
    }
    TXNS.forEach(([ty, col, sym, det, amt], k) => {
      const p = E.outCubic(prog(u, 0.36 + k * 0.09, 0.56 + k * 0.09));
      if (p <= 0) return;
      const y = 140 + k * 74;
      g.save(); g.globalAlpha *= p; g.translate((1 - p) * 40, 0);
      g.fillStyle = 'rgba(255,255,255,0.035)'; rr(g, 30, y - 30, w - 60, 60, 12); g.fill();
      pill(g, 50, y, ty, { s: 16, h: 32, padX: 12, width: 72, a: 'left', fill: hexA(col, 0.18), stroke: false, c: col, w: 800 });
      text(g, sym, 150, y + 7, { ...T, s: 21, w: 700, c: C.ink });
      text(g, det, 250, y + 7, { ...T, s: 19, w: 500, c: C.soft });
      text(g, amt, w - 54, y + 7, { ...T, a: 'right', s: 21, w: 700, c: amt[0] === '+' ? C.mint : C.ink });
      g.restore();
    });
    const dp = u - 0.8;
    if (dp > 0) {
      g.save(); g.globalAlpha *= clamp(dp * 6);
      check(g, 48, 494, 16, C.mint, 3.5, clamp(dp * 4));
      text(g, '4 transactions imported', 70, 500, { ...T, s: 20, w: 700, c: C.mint });
      g.restore();
    }
  } else {
    text(g, 'Crash replay', 36, 60, { ...T, s: 26, w: 700, c: C.ink });
    let cx = w - 36;
    ['4', '3', '2', '1'].forEach((s, k) => { cx -= pill(g, cx, 50, 'Crash ' + s, { s: 16, a: 'right', fill: s === '2' ? 'rgba(255,90,110,0.22)' : 'rgba(255,255,255,0.05)', stroke: s === '2' ? 'rgba(255,90,110,0.7)' : false, c: s === '2' ? '#FF9AA8' : C.soft, w: 700 }) + 10; });
    const map = ([x, v]) => [60 + x * 700, 470 - (v - 0.75) / 0.42 * 330];
    const pts = CRASH.map(map);
    const p = E.inOutCubic(prog(u, 0.05, 0.55));
    const cut = cutAt(pts, p);
    // peak line and drawdown fill
    const peakI = Math.round(0.27 * 80), troughI = Math.round(0.37 * 80);
    const peakY = pts[peakI][1];
    if (p > 0.27) {
      g.save(); g.beginPath(); g.rect(pts[peakI][0], 0, cut[cut.length - 1][0] - pts[peakI][0], h); g.clip();
      g.beginPath(); g.moveTo(pts[peakI][0], peakY);
      cut.slice(peakI).forEach(q => g.lineTo(q[0], Math.max(q[1], peakY)));
      g.lineTo(cut[cut.length - 1][0], peakY); g.closePath();
      g.fillStyle = 'rgba(255,90,110,0.22)'; g.fill(); g.restore();
      g.setLineDash([6, 6]); g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(pts[peakI][0], peakY); g.lineTo(cut[cut.length - 1][0], peakY); g.stroke(); g.setLineDash([]);
    }
    g.strokeStyle = C.ink; g.lineWidth = 4.5; g.lineJoin = 'round';
    g.beginPath(); smoothPath(g, cut); g.stroke();
    const hd = cut[cut.length - 1];
    addGlow(g, C.red, hd[0], hd[1], 36, p < 1 ? 0.9 : 0);
    const lp = prog(u, 0.4, 0.6);
    if (lp > 0) {
      const [tx, ty] = pts[troughI];
      g.save(); g.globalAlpha *= E.outCubic(lp);
      g.strokeStyle = C.red; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(tx, peakY); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = C.red; g.beginPath(); g.arc(tx, ty, 7, 0, TAU); g.fill();
      pill(g, tx + 22, ty + 6, 'Max drawdown  −18.6%', { s: 18, fill: 'rgba(255,90,110,0.18)', stroke: 'rgba(255,90,110,0.6)', c: '#FF9AA8', w: 700 });
      g.restore();
    }
    const rp = prog(u, 0.6, 0.78);
    if (rp > 0) {
      g.save(); g.globalAlpha *= E.outCubic(rp);
      pill(g, w - 50, peakY - 36, 'Recovered', { s: 17, a: 'right', fill: 'rgba(46,242,166,0.16)', stroke: 'rgba(46,242,166,0.5)', c: C.mint, w: 700 });
      g.restore();
    }
  }
  g.restore();
}

function scene8(g, t) {
  const fin = E.inCubic(prog(t, 35.72, 36.0));
  SLIDES.forEach((s, i) => {
    const st = M0 + i;
    if (t < st - 0.22 || t > st + 1.0) return;
    const ox = slideOffset(i, t);
    g.save();
    if (i === 3 && fin > 0) { g.translate(CX, CY); g.scale(1 - 0.5 * fin, 1 - 0.5 * fin); g.translate(-CX, -CY); g.globalAlpha = 1 - fin; }
    g.translate(ox, 0);
    const u = t - st;
    kicker(g, s.k, 140, 360, s.col, prog(u, -0.05, 0.2));
    const H1 = { s: 112, w: 900, ls: -3, a: 'left' };
    text(g, s.a, 140, 480, { ...H1, c: C.ink });
    text(g, s.b, 140, 600, { ...H1, c: s.col });
    text(g, s.sub, 144, 680, { s: 30, w: 500, f: 'Txt', a: 'left', c: C.soft });
    slideCard(g, i, t);
    // big index number, ghosted behind
    g.globalAlpha *= 0.05;
    text(g, String(i + 1).padStart(2, '0'), 120, 1010, { s: 300, w: 900, a: 'left', c: '#FFFFFF' });
    g.restore();
  });
}

function cues8(cue) {
  SLIDES.forEach((_, i) => {
    const st = M0 + i;
    cue(st - 0.2, 'swish', { dur: 0.3, gain: 0.55, pan: 0.6 });
    cue(st, 'hit', { gain: 0.55 });
  });
  cue(32.08, 'sweep', { dur: 0.5, gain: 0.22 });
  cue(32.62, 'pop', { pitch: 1.2, gain: 0.3, pan: 0.4 });
  TAXT.slice(1).forEach((t, i) => { cue(t, 'click', { gain: 0.45, pan: 0.3 + i * 0.1 }); cue(t + 0.02, 'counter', { dur: 0.22, gain: 0.15 }); });
  cue(33.78, 'success', { gain: 0.35 });
  cue(34.05, 'thump', { gain: 0.4 });
  cue(34.28, 'sparkle', { dur: 0.5, gain: 0.35 });
  TXNS.forEach((_, i) => cue(34.36 + i * 0.09, 'blip', { pitch: 1.1 + i * 0.12, gain: 0.25, pan: 0.4 }));
  cue(35.05, 'down', { dur: 0.35, gain: 0.35 });
  cue(35.4, 'pop', { pitch: 0.8, gain: 0.3, pan: 0.2 });
  cue(35.6, 'pop', { pitch: 1.3, gain: 0.3, pan: 0.5 });
}
