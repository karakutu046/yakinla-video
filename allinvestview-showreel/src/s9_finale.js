'use strict';
/* 9. FINALE (36–42 s): light converges, the six segments of the mark snap in on
 * the sonic logo, the wordmark rises, then the tagline, the call to action and
 * the link. Holds to the end for a clean last frame. */

const F9 = { x: CX, y: 318, r: 128, seg0: 36.3, segStep: 0.12, chart: 37.0, wm: 37.05, tag: 37.6, cta: 38.25, url: 38.7, note: 39.5 };
const URL9 = 'www.kripto724.com/app';
const FINALE_PARTS = (() => {
  const r = mulberry32(36), out = [];
  for (let i = 0; i < 140; i++) {
    const seg = i % 6, a = -Math.PI / 2 + seg * TAU / 6 + 0.06 + r() * (TAU / 6 - 0.12);
    const from = r() * TAU, dist = 900 + r() * 700;
    out.push({ seg, a, fx: CX + Math.cos(from) * dist, fy: F9.y + Math.sin(from) * dist * 0.7, d: r() * 0.25, s: 1.5 + r() * 2.5 });
  }
  return out;
})();

function scene9(g, t) {
  const push = 1 + 0.035 * E.inOutSine(prog(t, 37, 42));
  g.save();
  g.translate(CX, CY); g.scale(push, push); g.translate(-CX, -CY);
  // converging light
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const p of FINALE_PARTS) {
    const ts = F9.seg0 + p.seg * F9.segStep - 0.45 + p.d * 0.3;
    const u = prog(t, ts, ts + 0.45);
    if (u <= 0 || u >= 1) continue;
    const e = E.inCubic(u);
    const tx = F9.x + Math.cos(p.a) * F9.r, ty = F9.y + Math.sin(p.a) * F9.r;
    const x = lerp(p.fx, tx, e), y = lerp(p.fy, ty, e);
    const px = lerp(p.fx, tx, Math.max(0, e - 0.08)), py = lerp(p.fy, ty, Math.max(0, e - 0.08));
    g.strokeStyle = hexA(SEG[p.seg], 0.8 * Math.min(1, u * 3)); g.lineWidth = p.s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke();
  }
  g.restore();

  // mark: one segment per sixteenth, on the sonic logo
  let segs = 0;
  for (let i = 0; i < 6; i++) segs += E.outCubic(prog(t, F9.seg0 + i * F9.segStep, F9.seg0 + i * F9.segStep + 0.18));
  const thMul = (i) => 1 + 0.5 * kick(t - (F9.seg0 + i * F9.segStep + 0.1), 9);
  const ring = kick(t - F9.chart, 2.2);
  if (t > F9.chart) {
    for (let k = 0; k < 3; k++) {
      const d = t - F9.chart - k * 0.12; if (d <= 0) continue;
      g.strokeStyle = hexA(SEG[k * 2], 0.5 * Math.exp(-d * 2.4)); g.lineWidth = 3;
      g.beginPath(); g.arc(F9.x, F9.y, F9.r * (1.15 + d * 1.4), 0, TAU); g.stroke();
    }
  }
  drawMark(g, F9.x, F9.y, F9.r, {
    segs, thMul, rot: 0.25 * (1 - E.outCubic(prog(t, 36.2, 37.2))) + (t - 37) * 0.04 * prog(t, 37, 38),
    chart: E.outCubic(prog(t, F9.chart, F9.chart + 0.35)), glow: 0.7 + ring + 0.25 * Math.sin(t * 2) ** 2, discA: E.outCubic(prog(t, 36.2, 36.6)),
  });

  // wordmark
  if (t > F9.wm) {
    const p = prog(t, F9.wm, F9.wm + 0.7);
    const sw1 = prog(t, 37.75, 38.35), sw2 = prog(t, 40.3, 40.9);
    const sw = sw1 > 0 && sw1 < 1 ? sw1 : sw2 > 0 && sw2 < 1 ? sw2 : null;
    g.save(); g.beginPath(); g.rect(0, 610 - 170, W, 215); g.clip();
    wordmark(g, CX, 610, 164, (i, n) => {
      const pi = E.outExpo(clamp(p * (1 + n * 0.035) - i * 0.035));
      return { dy: (1 - pi) * 190 };
    }, { sweep: sw, sweepA: 0.75 });
    g.restore();
  }
  // tagline
  slotText(g, 'All your investments, one clear view.', CX, 700, { s: 50, w: 700, ls: -0.5, colors: (i) => i >= 22 ? null : C.ink, grad: BRAND_GRAD, gradFrom: 22 }, prog(t, F9.tag, F9.tag + 0.55), 0, 0.01);

  // call to action
  const cp = t - F9.cta;
  if (cp > 0) {
    const s = spring(cp, 1.9, 7);
    const bw = 640, bh = 96, by = 832;
    g.save(); g.translate(CX, by); g.scale(s, s);
    addGlow(g, C.mint, 0, 10, 380, 0.25);
    g.save(); g.shadowColor = 'rgba(46,242,166,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 10;
    rr(g, -bw / 2, -bh / 2, bw, bh, bh / 2);
    const gr = g.createLinearGradient(-bw / 2, 0, bw / 2, 0); gr.addColorStop(0, '#2EF2A6'); gr.addColorStop(1, '#38C8FF');
    g.fillStyle = gr; g.fill(); g.restore();
    // shimmer
    for (const s0 of [38.95, 40.6]) {
      const sp = prog(t, s0, s0 + 0.55);
      if (sp <= 0 || sp >= 1) continue;
      g.save(); rr(g, -bw / 2, -bh / 2, bw, bh, bh / 2); g.clip();
      const sx = lerp(-bw / 2 - 150, bw / 2 + 150, E.inOutSine(sp));
      const sg = g.createLinearGradient(sx - 90, 0, sx + 90, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.65)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg; g.fillRect(-bw / 2, -bh / 2, bw, bh); g.restore();
    }
    text(g, 'Start free  —  no credit card', -18, 12, { s: 36, w: 800, c: '#04142E' });
    // arrow
    const ax = bw / 2 - 64 + Math.sin(Math.max(0, t - 39) * 5) * 3 * prog(t, 39, 39.3);
    g.strokeStyle = '#04142E'; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(ax - 14, 0); g.lineTo(ax + 12, 0); g.moveTo(ax + 2, -10); g.lineTo(ax + 12, 0); g.lineTo(ax + 2, 10); g.stroke();
    g.restore();
  }
  // link, typed
  if (t > F9.url) {
    const n = Math.min(URL9.length, Math.floor((t - F9.url) / 0.032));
    const s = URL9.slice(0, n);
    const o = { s: 42, w: 600, f: 'Txt', c: C.ink };
    const full = measure(g, URL9, o);
    const x0 = CX - full / 2 + 22;
    // link glyph
    g.save(); g.globalAlpha *= clamp((t - F9.url) * 5);
    g.strokeStyle = C.cyan; g.lineWidth = 3.5;
    g.save(); g.translate(x0 - 40, 946); g.rotate(-0.6);
    rr(g, -16, -7, 18, 14, 7); g.stroke(); rr(g, -2, -7, 18, 14, 7); g.stroke();
    g.restore(); g.restore();
    text(g, s, x0, 960, { ...o, a: 'left' });
    if (n < URL9.length || Math.floor(t * 2.2) % 2 === 0) {
      const cw = measure(g, s, o);
      g.fillStyle = C.cyan; g.fillRect(x0 + cw + 4, 924, 3, 46);
    }
  }
  g.restore();
  // footnote (outside the push so it stays put)
  const na = prog(t, F9.note, F9.note + 0.6);
  if (na > 0) {
    g.save(); g.globalAlpha = na * 0.85;
    text(g, 'Sample data shown for illustration only. Not investment advice.', CX, 1046, { s: 19, w: 500, f: 'Txt', c: C.dim });
    g.restore();
  }
}

function cues9(cue) {
  cue(35.0, 'riser', { dur: 1.0, gain: 0.5 });
  cue(35.62, 'reverse', { dur: 0.38, gain: 0.55 });
  cue(36.0, 'impact', { gain: 1.0, big: true });
  cue(36.02, 'shimmer', { dur: 0.8, gain: 0.45 });
  for (let i = 0; i < 6; i++) cue(F9.seg0 + i * F9.segStep + 0.1, 'click', { gain: 0.32, pan: Math.sin(-Math.PI / 2 + i * TAU / 6 + Math.PI / 6) * 0.5 });
  cue(F9.chart, 'sparkle', { dur: 1.2, gain: 0.45 });
  cue(F9.chart + 0.05, 'shine', { dur: 0.45, gain: 0.35 });
  cue(F9.wm, 'whoosh', { dur: 0.42, f0: 300, f1: 3500, gain: 0.35 });
  cue(37.75, 'shine', { dur: 0.5, gain: 0.25 });
  cue(F9.tag, 'whoosh', { dur: 0.3, f0: 800, f1: 4000, gain: 0.2 });
  cue(F9.cta, 'pop', { pitch: 0.9, gain: 0.55 });
  cue(F9.cta + 0.04, 'thump', { gain: 0.45 });
  cue(38.95, 'shine', { dur: 0.45, gain: 0.25 });
  for (let i = 0; i < URL9.length; i++) cue(F9.url + i * 0.032, 'type', { pitch: 0.9 + ((i * 7) % 5) * 0.06, gain: 0.2 });
  cue(40.6, 'shine', { dur: 0.45, gain: 0.2 });
}
