'use strict';
/* 6. DIVIDENDS (22–26 s): a tilted 3D income card. Coins rain in on sixteenth
 * notes, one per month, and each landing fills that month's bar (Jan–Sep paid,
 * Oct–Dec projected). Then the forecast line draws and the next payout pops up. */

const DIV = { w: 900, h: 640, vals: [420, 236, 906, 446, 263, 945, 473, 276, 998, 512, 302, 1063], paid: 9 };
const DIV_T = { in: 21.8, coin0: 22.55, step: 0.125, fall: 0.42, fc: 24.15, next: 24.55, out: 25.62 };
const MONTHS = 'JFMAMJJASOND';
const COINS = DIV.vals.map((v, i) => ({ i, land: DIV_T.coin0 + i * DIV_T.step, spin: 7 + (i % 3) * 2, dx: (i % 2 ? 1 : -1) * (40 + (i * 37) % 60) }));

function divBarGeom(i) {
  const x0 = 60, x1 = 840, bw = (x1 - x0) / 12;
  return { x: x0 + i * bw + bw * 0.19, w: bw * 0.62, base: 586, max: 290 };
}
function barFill(i, t) { return E.outBack(prog(t, COINS[i].land, COINS[i].land + 0.32)); }

function drawDivCard(x, t) {
  const { w, h } = DIV;
  // card
  rr(x, 0, 0, w, h, 26);
  const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#13214A'); bg.addColorStop(1, '#0B1530');
  x.fillStyle = bg; x.fill();
  x.lineWidth = 2; x.strokeStyle = 'rgba(160,190,255,0.25)'; x.stroke();
  const sh = x.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)');
  x.fillStyle = sh; x.fill();
  text(x, 'Dividend income', 40, 64, { s: 32, w: 700, f: 'Txt', a: 'left', c: C.ink });
  // segmented control
  const segs = ['Month', 'Quarter', 'Year'], sx0 = w - 40 - 330;
  rr(x, sx0, 30, 330, 46, 12); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fill();
  rr(x, sx0 + 4, 34, 106, 38, 9); x.fillStyle = 'rgba(46,242,166,0.22)'; x.fill();
  segs.forEach((s, i) => text(x, s, sx0 + 55 + i * 110, 59, { s: 17, w: 700, f: 'Txt', c: i === 0 ? C.mint : C.soft }));
  // KPIs
  text(x, 'Projected annual income', 40, 128, { s: 20, w: 600, f: 'Txt', a: 'left', c: C.soft });
  odometer(x, '$6,840', 6840 * E.outQuart(prog(t, 22.3, 23.9)), 40, 198, { s: 66, w: 800, a: 'left', c: C.ink });
  text(x, 'Yield on cost', 520, 128, { s: 20, w: 600, f: 'Txt', a: 'left', c: C.soft });
  odometer(x, '4.1%', 4.1 * E.outQuart(prog(t, 22.5, 23.9)), 520, 198, { s: 66, w: 800, a: 'left', c: C.mint });
  // legend
  x.fillStyle = C.mint; rr(x, 520, 232, 16, 16, 4); x.fill();
  text(x, 'Received', 544, 246, { s: 17, w: 600, f: 'Txt', a: 'left', c: C.soft });
  x.strokeStyle = C.cyan; x.lineWidth = 2; x.setLineDash([4, 3]); rr(x, 650, 232, 16, 16, 4); x.stroke(); x.setLineDash([]);
  text(x, 'Projected', 674, 246, { s: 17, w: 600, f: 'Txt', a: 'left', c: C.soft });
  // grid
  x.strokeStyle = 'rgba(150,180,255,0.09)'; x.lineWidth = 1.5;
  for (let k = 0; k <= 3; k++) { const y = 586 - k * 96; x.beginPath(); x.moveTo(50, y); x.lineTo(850, y); x.stroke(); }
  // bars
  DIV.vals.forEach((v, i) => {
    const b = divBarGeom(i), f = barFill(i, t);
    const hh = b.max * v / 1063 * f;
    const paid = i < DIV.paid;
    if (hh > 0.5) {
      if (paid) {
        const gr = x.createLinearGradient(0, b.base - hh, 0, b.base);
        gr.addColorStop(0, '#5BFFC0'); gr.addColorStop(1, 'rgba(46,242,166,0.35)');
        x.fillStyle = gr; rr(x, b.x, b.base - hh, b.w, hh, [8, 8, 2, 2]); x.fill();
      } else {
        x.save(); rr(x, b.x, b.base - hh, b.w, hh, [8, 8, 2, 2]); x.fillStyle = 'rgba(56,200,255,0.14)'; x.fill(); x.clip();
        x.strokeStyle = 'rgba(56,200,255,0.4)'; x.lineWidth = 3;
        for (let k = -10; k < 20; k++) { x.beginPath(); x.moveTo(b.x + k * 14, b.base); x.lineTo(b.x + k * 14 + 60, b.base - 60 * 5); x.stroke(); }
        x.restore();
        x.strokeStyle = C.cyan; x.lineWidth = 2; x.setLineDash([6, 4]); rr(x, b.x, b.base - hh, b.w, hh, [8, 8, 2, 2]); x.stroke(); x.setLineDash([]);
      }
      // landing flash
      const fl = kick(t - COINS[i].land, 7);
      if (fl > 0.01) { x.fillStyle = `rgba(255,236,170,${0.7 * fl})`; rr(x, b.x - 3, b.base - hh - 3, b.w + 6, hh + 6, 9); x.fill(); }
    }
    text(x, MONTHS[i], b.x + b.w / 2, 618, { s: 17, w: 700, f: 'Txt', c: i < DIV.paid ? C.soft : C.cyan });
  });
  // forecast line through the bar tops
  const fp = E.inOutCubic(prog(t, DIV_T.fc, DIV_T.fc + 0.6));
  if (fp > 0) {
    const pts = DIV.vals.map((v, i) => { const b = divBarGeom(i); return [b.x + b.w / 2, b.base - b.max * v / 1063 - 22]; });
    const trend = pts.map((p, i) => [p[0], lerp(pts[0][1], pts[pts.length - 1][1], i / 11) - 70 * Math.sin(i / 11 * Math.PI) * 0.4]);
    const cut = cutAt(trend, fp);
    x.strokeStyle = C.amber; x.lineWidth = 3.5; x.setLineDash([10, 8]);
    x.beginPath(); smoothPath(x, cut); x.stroke(); x.setLineDash([]);
    const hd = cut[cut.length - 1];
    x.fillStyle = C.amber; x.beginPath(); x.arc(hd[0], hd[1], 7, 0, TAU); x.fill();
    if (fp >= 1) text(x, 'Forecast', hd[0] - 4, hd[1] - 18, { s: 17, w: 700, f: 'Txt', a: 'right', c: C.amber });
  }
}

function divPose(t) {
  const enter = E.outCubic(prog(t, DIV_T.in, DIV_T.in + 0.6));
  const out = E.inCubic(prog(t, DIV_T.out, 26.0));
  return {
    x: 1300 + out * 500, y: 560 + (1 - enter) * 1100 + Math.sin(t * 1.4) * 6, z: out * 300,
    rx: 0.07 + (1 - enter) * 0.5, ry: -0.36 + Math.sin(t * 0.9) * 0.03 - out * 1.2, rz: -0.01 + (1 - enter) * 0.1, s: 1,
  };
}

const DTEX6 = { T: null };
function coinDraw(g, x, y, r, spin, a = 1) {
  const c = Math.cos(spin), w = Math.max(0.12, Math.abs(c));
  g.save(); g.globalAlpha *= a; g.translate(x, y);
  addGlow(g, C.gold, 0, 0, r * 2.2, 0.35);
  g.scale(w, 1);
  g.fillStyle = '#B9821E'; g.beginPath(); g.arc(0, r * 0.12, r, 0, TAU); g.fill();
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, '#FFE7A0'); gr.addColorStop(0.5, '#FFC94A'); gr.addColorStop(1, '#E39A1E');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(160,100,10,0.6)'; g.lineWidth = r * 0.1; g.beginPath(); g.arc(0, 0, r * 0.74, 0, TAU); g.stroke();
  if (c > 0) text(g, '$', 0, r * 0.38, { s: r * 1.05, w: 900, c: '#9A6510' });
  g.restore();
}

function scene6(g, t) {
  const enterY = (1 - E.outCubic(prog(t, DIV_T.in, DIV_T.in + 0.55))) * 1100;
  const outX = -E.inCubic(prog(t, DIV_T.out, 26.0)) * 900;
  // card
  if (!DTEX6.T) DTEX6.T = makeTex(DIV.w, DIV.h, 1.6);
  const T = DTEX6.T, x = texBegin(T);
  drawDivCard(x, t);
  const pose = divPose(t);
  const P = projector(pose);
  quadShadow(g, P, DIV.w, DIV.h, 0.6, 60, 40);
  plane3d(g, T.c, DIV.w, DIV.h, pose, 12, 8);
  // coins (screen space, land on the projected bar bases)
  for (const c of COINS) {
    const u = t - (c.land - DIV_T.fall);
    if (u <= 0 || t > c.land + 0.05) continue;
    const b = divBarGeom(c.i);
    const [lx, ly] = P(b.x + b.w / 2 - DIV.w / 2, b.base - DIV.h / 2 - 14);
    const k = clamp(u / DIV_T.fall);
    const y = lerp(-80, ly, k * k), xx = lx + c.dx * (1 - k);
    coinDraw(g, xx, y, 26, u * c.spin, clamp(u * 8));
  }
  // impact sparkles
  for (const c of COINS) {
    const d = t - c.land;
    if (d < 0 || d > 0.5) continue;
    const b = divBarGeom(c.i);
    const [lx, ly] = P(b.x + b.w / 2 - DIV.w / 2, b.base - DIV.h / 2 - 14);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.42, r = 20 + d * 160;
      g.fillStyle = hexA(C.gold, 1 - d / 0.5);
      g.beginPath(); g.arc(lx + Math.cos(a) * r, ly + Math.sin(a) * r * 0.8, 3.5 * (1 - d / 0.5) + 1, 0, TAU); g.fill();
    }
    g.restore();
  }
  // next payout chip
  const np = t - DIV_T.next;
  if (np > 0) {
    const s = spring(np, 2.2, 8) * (1 - E.inCubic(prog(t, DIV_T.out, DIV_T.out + 0.25)));
    g.save(); g.translate(1110, 905); g.scale(s, s);
    glass(g, -10, -46, 420, 92, 20, { fill: 'rgba(14,24,52,0.97)', stroke: 'rgba(255,181,71,0.55)' });
    g.fillStyle = 'rgba(255,181,71,0.16)'; rr(g, 8, -30, 60, 60, 14); g.fill();
    text(g, 'DEC', 38, -6, { s: 14, w: 700, f: 'Txt', c: C.amber, ls: 1 });
    text(g, '24', 38, 20, { s: 26, w: 800, c: C.ink });
    text(g, 'Next payout · VOO', 86, -6, { s: 20, w: 600, f: 'Txt', a: 'left', c: C.soft });
    text(g, '$96.25', 86, 26, { s: 30, w: 800, a: 'left', c: C.mint });
    g.restore();
  }
  // left copy
  g.save(); g.translate(outX, enterY * 0.25);
  kicker(g, 'DIVIDENDS', 130, 330, C.amber, prog(t, 21.95, 22.4));
  const H1 = { s: 118, w: 900, ls: -3, a: 'left' };
  slotText(g, 'Never miss', 130, 455, H1, prog(t, 22.0, 22.55), 0, 0.03);
  slotText(g, 'a dividend.', 130, 578, { ...H1, colors: (i) => i >= 2 ? C.gold : C.ink }, prog(t, 22.12, 22.7), 0, 0.03);
  slotText(g, 'Payout calendar, income received and', 130, 668, { s: 32, w: 500, f: 'Txt', a: 'left', c: C.soft }, prog(t, 22.5, 23.0), 0, 0.006);
  slotText(g, 'forecasts, all tracked automatically.', 130, 712, { s: 32, w: 500, f: 'Txt', a: 'left', c: C.soft }, prog(t, 22.6, 23.1), 0, 0.006);
  g.restore();
}

function cues6(cue) {
  cue(22.0, 'impact', { gain: 0.45 });
  cue(21.85, 'whoosh', { dur: 0.4, f0: 6000, f1: 400, gain: 0.35 });
  COINS.forEach(c => {
    const pan = ((1300 - 300 + c.i * 60) - CX) / CX * 0.6;
    cue(c.land, 'coin', { pitch: 1 + c.i * 0.06, gain: 0.32, pan });
  });
  cue(22.3, 'counter', { dur: 1.5, gain: 0.22 });
  cue(DIV_T.fc, 'sweep', { dur: 0.6, gain: 0.25 });
  cue(DIV_T.next, 'pop', { pitch: 1.1, gain: 0.45, pan: 0.2 });
  cue(DIV_T.next + 0.05, 'shine', { dur: 0.4, gain: 0.25 });
  cue(DIV_T.out, 'whoosh', { dur: 0.38, f0: 500, f1: 5000, gain: 0.45, pan: 0.5 });
}
