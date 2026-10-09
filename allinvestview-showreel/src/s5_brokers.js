'use strict';
/* 5. BROKERS (18–22 s): the globe condenses into the hub. Broker accounts fly
 * into an orbit around it, each wired in with a beam; transaction packets stream
 * along the beams into the hub, which pulses as it syncs. Read-only, nightly. */

const BROKERS = ['Interactive Brokers', 'Charles Schwab', 'Fidelity', 'Robinhood', 'Trading 212', 'DEGIRO', 'eToro', 'Coinbase', 'Wealthsimple', 'Public'];
const HUB = { x: CX, y: 640, r: 95 };
const ORB = { rx: 760, ry: 250, w: 0.16 };
const S5 = { head: 18.05, sub: 18.5, fly: 18.15, pk: 18.95, synced: 21.05, out: 21.62 };
const PACKETS = (() => {
  const r = mulberry32(55), out = [];
  BROKERS.forEach((_, i) => { for (let k = 0; k < 3; k++) out.push({ i, t0: S5.pk + i * 0.11 + k * 0.78 + r() * 0.12, d: 0.5 + r() * 0.12 }); });
  return out;
})();

function brokerPos(i, t) {
  const th = -Math.PI / 2 + i / BROKERS.length * TAU + (t - 18) * ORB.w;
  const depth = Math.sin(th); // +1 front (bottom), −1 back (top)
  return { x: HUB.x + Math.cos(th) * ORB.rx, y: HUB.y + depth * ORB.ry, depth, sc: 0.8 + 0.2 * (depth + 1) / 2 };
}
function beamCtrl(p) { return [lerp(p.x, HUB.x, 0.5), lerp(p.y, HUB.y, 0.5) - 150 - 60 * (1 - (p.depth + 1) / 2)]; }
function qbez(a, c, b, s) { const u = 1 - s; return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]; }

function scene5(g, t) {
  const outP = E.inCubic(prog(t, S5.out, 22.0));
  const inP = prog(t, 17.85, 18.1);
  g.save();
  g.translate(0, -outP * 1150);

  // beams + packets + pills, sorted back to front around the hub
  const items = BROKERS.map((name, i) => {
    const p = brokerPos(i, t);
    const fp = t - (S5.fly + i * 0.06);
    return { name, i, p, fp };
  }).filter(o => o.fp > 0);
  const drawBeam = (o) => {
    const k = E.outCubic(clamp(o.fp / 0.5));
    const a = [o.p.x, o.p.y], c = beamCtrl(o.p), b = [HUB.x, HUB.y];
    const n = 26, m = Math.round(n * k);
    g.save();
    g.strokeStyle = hexA(SEG[o.i % 6], 0.16 + 0.16 * (o.p.depth + 1) / 2); g.lineWidth = 2.5;
    g.beginPath();
    for (let j = 0; j <= m; j++) { const q = qbez(b, c, a, j / n); j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
    g.stroke();
    g.restore();
  };
  const drawPackets = (o) => {
    for (const pk of PACKETS) {
      if (pk.i !== o.i) continue;
      const s = (t - pk.t0) / pk.d;
      if (s <= 0 || s >= 1) continue;
      const e = E.inQuad(s);
      const q = qbez([o.p.x, o.p.y], beamCtrl(o.p), [HUB.x, HUB.y], e);
      const q2 = qbez([o.p.x, o.p.y], beamCtrl(o.p), [HUB.x, HUB.y], Math.max(0, e - 0.12));
      const col = SEG[o.i % 6];
      g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createLinearGradient(q2[0], q2[1], q[0], q[1]);
      gr.addColorStop(0, hexA(col, 0)); gr.addColorStop(1, hexA(col, 0.95));
      g.strokeStyle = gr; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(q2[0], q2[1]); g.lineTo(q[0], q[1]); g.stroke();
      glow(g, col, q[0], q[1], 26, 0.9);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(q[0], q[1], 4, 0, TAU); g.fill();
      g.restore();
    }
  };
  const drawPill = (o) => {
    const s = spring(o.fp, 2.0, 7) * o.p.sc;
    const fly = 1 - E.outCubic(clamp(o.fp / 0.45));
    const x = lerp(o.p.x, HUB.x + (o.p.x - HUB.x) * 2.2, fly), y = lerp(o.p.y, HUB.y + (o.p.y - HUB.y) * 2.2, fly);
    const recv = PACKETS.filter(pk => pk.i === o.i && t > pk.t0 && t < pk.t0 + 0.25).length > 0;
    g.save(); g.globalAlpha *= clamp(o.fp * 5) * (0.6 + 0.4 * (o.p.depth + 1) / 2);
    g.translate(x, y); g.scale(s, s);
    const w = pill(g, 0, 0, o.name, { s: 27, a: 'center', dot: SEG[o.i % 6], fill: 'rgba(15,26,56,0.95)', stroke: hexA(SEG[o.i % 6], recv ? 0.9 : 0.4), lw: recv ? 2.5 : 1.5 });
    g.restore();
    return w;
  };
  const back = items.filter(o => o.p.depth < 0).sort((a, b) => a.p.depth - b.p.depth);
  const front = items.filter(o => o.p.depth >= 0).sort((a, b) => a.p.depth - b.p.depth);
  back.forEach(drawBeam); back.forEach(drawPackets); back.forEach(drawPill);

  // hub
  let pulse = 0;
  for (const pk of PACKETS) { const d = t - (pk.t0 + pk.d); if (d > 0 && d < 0.6) pulse = Math.max(pulse, Math.exp(-d * 6)); }
  for (const pk of PACKETS) {
    const d = t - (pk.t0 + pk.d);
    if (d > 0 && d < 0.7) { g.strokeStyle = hexA(SEG[pk.i % 6], 0.45 * (1 - d / 0.7)); g.lineWidth = 3; g.beginPath(); g.arc(HUB.x, HUB.y, HUB.r * (1.05 + d * 1.6), 0, TAU); g.stroke(); }
  }
  g.save(); g.globalAlpha *= inP;
  drawMark(g, HUB.x, HUB.y, HUB.r * (1 + pulse * 0.06), { rot: (t - 18) * 0.6, glow: 0.8 + pulse, chart: 1 });
  // read-only lock badge
  const lp = t - 18.6;
  if (lp > 0) {
    const s = spring(lp, 2.4, 8);
    g.save(); g.translate(HUB.x + HUB.r * 0.72, HUB.y - HUB.r * 0.72); g.scale(s, s);
    g.fillStyle = '#0D1730'; g.beginPath(); g.arc(0, 0, 25, 0, TAU); g.fill();
    g.strokeStyle = C.mint; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = C.mint; rr(g, -9, -3, 18, 14, 3); g.fill();
    g.beginPath(); g.arc(0, -4, 6, Math.PI, 0); g.stroke();
    g.restore();
  }
  g.restore();

  front.forEach(drawBeam); front.forEach(drawPackets); front.forEach(drawPill);

  // synced badge
  const sp = t - S5.synced;
  if (sp > 0) {
    const s = spring(sp, 2.2, 8);
    g.save(); g.translate(HUB.x, HUB.y + HUB.r + 64); g.scale(s, s);
    const w = pill(g, 0, 0, '      All accounts synced', { s: 25, a: 'center', fill: 'rgba(46,242,166,0.16)', stroke: 'rgba(46,242,166,0.6)', c: C.mint, w: 700 });
    g.fillStyle = C.mint; g.beginPath(); g.arc(-w / 2 + 36, 0, 15, 0, TAU); g.fill();
    check(g, -w / 2 + 36, 1, 14, '#06122A', 3.5, E.outCubic(clamp(sp / 0.35)));
    g.restore();
  }

  // headline
  const H1 = { s: 96, w: 900, ls: -2, colors: (i) => i >= 15 && i <= 17 ? C.mint : C.ink };
  slotText(g, 'Auto-sync with 25+ brokers.', CX, 175, H1, prog(t, S5.head, S5.head + 0.55), 0, 0.02);
  slotText(g, 'Read-only connections  ·  Nightly sync  ·  CSV & AI-assisted import', CX, 248, { s: 32, w: 500, f: 'Txt', c: C.soft }, prog(t, S5.sub, S5.sub + 0.5), 0, 0.005);
  g.restore();
}

function cues5(cue) {
  cue(18.0, 'impact', { gain: 0.45 });
  cue(S5.head, 'whoosh', { dur: 0.3, f0: 500, f1: 3500, gain: 0.3 });
  BROKERS.forEach((_, i) => {
    const p = brokerPos(i, S5.fly + i * 0.06);
    cue(S5.fly + i * 0.06, 'swish', { dur: 0.2, gain: 0.18, pan: (p.x - CX) / CX * 0.8 });
    cue(S5.fly + i * 0.06 + 0.12, 'pop', { pitch: 0.9 + i * 0.07, gain: 0.3, pan: (p.x - CX) / CX * 0.8 });
  });
  cue(18.6, 'click', { gain: 0.45 });
  PACKETS.forEach(pk => {
    const p = brokerPos(pk.i, pk.t0);
    cue(pk.t0 + pk.d, 'data', { pitch: 1 + (pk.i % 5) * 0.12, gain: 0.16, pan: (p.x - CX) / CX * 0.35 });
  });
  cue(S5.synced, 'success', { gain: 0.55 });
  cue(S5.out, 'whoosh', { dur: 0.42, f0: 300, f1: 6000, gain: 0.5 });
}
