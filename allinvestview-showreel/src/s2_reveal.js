'use strict';
/* 2. REVEAL (4–8 s): the implosion bursts into a six-colour ring (every asset
 * class), the promise lands word by word, the ring condenses into the mark, the
 * wordmark rises, and the camera dives through the ring into the dashboard. */

const SPARKS = (() => {
  const r = mulberry32(77), out = [];
  for (let i = 0; i < 90; i++) out.push({ a: r() * TAU, v: 500 + r() * 1500, s: 1.5 + r() * 3, c: SEG[i % 6], d: r() * 0.08 });
  return out;
})();
const MARK = { x: CX, y: 365, r: 140 };
const REVEAL = { w1: [['All', 4.05], ['your', 4.3], ['investments,', 4.55]], l2: 5.0, out: 5.72, wm: 6.15, sub: 6.6, dive: 7.35 };

function markState(t) {
  // big lens ring → compact mark
  const k = E.inOutCubic(prog(t, 5.75, 6.3));
  const r = lerp(470, MARK.r, k), y = lerp(CY, MARK.y, k);
  return { r, y, k };
}

function scene2(g, t) {
  const dt = t - 4.0;
  // shockwave + sparks
  if (dt < 0.9) {
    const p = E.outCubic(prog(dt, 0, 0.7));
    g.save(); g.strokeStyle = `rgba(200,230,255,${0.7 * (1 - p)})`; g.lineWidth = 30 * (1 - p) + 2;
    g.beginPath(); g.arc(CX, CY, 40 + p * 1300, 0, TAU); g.stroke(); g.restore();
  }
  if (dt < 1.6) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const s of SPARKS) {
      const u = dt - s.d; if (u <= 0) continue;
      const dist = s.v * (1 - Math.exp(-u * 3.2)) / 3.2 * 2.2;
      const a = 1 - prog(u, 0.3, 1.4);
      const x = CX + Math.cos(s.a) * dist, y = CY + Math.sin(s.a) * dist;
      const tail = Math.min(dist, s.v * Math.exp(-u * 3.2) * 0.06);
      g.strokeStyle = hexA(s.c, a); g.lineWidth = s.s; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(s.a) * tail, y - Math.sin(s.a) * tail); g.stroke();
    }
    g.restore();
  }

  const ms = markState(t);
  const diveP = prog(t, REVEAL.dive, 8.0);
  const dive = E.inCubic(diveP);
  const mr = ms.r * Math.exp(2.95 * dive), my = lerp(ms.y, CY, E.inOutCubic(diveP));

  // the dashboard, seen through the lens during the dive
  if (diveP > 0) {
    g.save();
    g.beginPath(); g.arc(CX, my, mr * 0.88, 0, TAU); g.clip();
    scene3(g, t);
    g.restore();
  }

  // lens dial (thin tick ring) while large
  const dialA = window01(t, 4.05, 6.0, 0.4, 0.3);
  if (dialA > 0) {
    g.save(); g.translate(CX, ms.y); g.rotate(-(t - 4) * 0.12);
    g.strokeStyle = `rgba(170,200,255,${0.22 * dialA})`; g.lineWidth = 2;
    const rr0 = ms.r * 0.9;
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * TAU, l = i % 10 === 0 ? 22 : 9;
      g.beginPath(); g.moveTo(Math.cos(a) * rr0, Math.sin(a) * rr0); g.lineTo(Math.cos(a) * (rr0 - l), Math.sin(a) * (rr0 - l)); g.stroke();
    }
    g.restore();
  }

  // ring / mark
  const segs = 6 * E.outCubic(prog(t, 4.0, 4.75));
  const thick = lerp(0.028, 0.24, E.inOutCubic(prog(t, 5.8, 6.3)));
  const chart = E.outCubic(prog(t, 6.05, 6.5));
  const markRot = -0.5 + (t - 4) * 0.22 * (1 - ms.k) + ms.k * (0.5 * (1 - E.outCubic(prog(t, 5.75, 6.5))));
  drawMark(g, CX, my, mr, {
    segs, th: thick, rot: markRot, chart: diveP > 0 ? chart * (1 - prog(diveP, 0, 0.3)) : chart,
    disc: ms.k > 0.01 && diveP === 0, discA: ms.k, glow: 0.6 + 0.6 * kick(t - 4.0, 2) + 0.5 * kick(t - 6.3, 3), gap: lerp(0.05, 0.12, ms.k),
  });

  // line 1: word slams
  const outQ = prog(t, REVEAL.out, REVEAL.out + 0.24);
  if (t < REVEAL.out + 0.3) {
    const o = { s: 118, w: 900, ls: -2 };
    const full = REVEAL.w1.map(w => w[0]).join(' ');
    setFont(g, o); const total = g.measureText(full).width; g.letterSpacing = '0px';
    let x = CX - total / 2;
    REVEAL.w1.forEach(([word, t0]) => {
      const ww = measure(g, word, o), sp = measure(g, ' ', o);
      const p = prog(t, t0, t0 + 0.18);
      if (p > 0) {
        g.save();
        g.globalAlpha = E.outQuad(p) * (1 - E.inCubic(outQ));
        const sc = lerp(1.7, 1, E.outCubic(p));
        g.translate(x + ww / 2, 490 - E.inCubic(outQ) * 80); g.scale(sc, sc);
        text(g, word, 0, 0, { ...o, c: C.ink });
        g.restore();
      }
      x += ww + sp;
    });
  }
  // line 2: "one clear view."
  if (t >= REVEAL.l2 && t < REVEAL.out + 0.4) {
    const o = { s: 132, w: 900, ls: -3, grad: [[0, '#38C8FF'], [0.5, '#5B8CFF'], [1, '#B07BFF']], gradFrom: 4 };
    const p = prog(t, REVEAL.l2, REVEAL.l2 + 0.6);
    const sw = prog(t, REVEAL.l2 + 0.25, REVEAL.l2 + 0.85);
    slotText(g, 'one clear view.', CX, 655, { ...o, sweep: sw > 0 && sw < 1 ? sw : null }, p, outQ);
  }

  // wordmark + line
  if (t >= REVEAL.wm && diveP < 1) {
    const p = prog(t, REVEAL.wm, REVEAL.wm + 0.7);
    const sw = prog(t, 6.95, 7.5);
    const fade = 1 - E.inCubic(prog(t, REVEAL.dive, REVEAL.dive + 0.3));
    g.save(); g.globalAlpha = fade;
    const zs = 1 + dive * 0.6; g.translate(CX, 690); g.scale(zs, zs); g.translate(-CX, -690);
    g.save(); g.beginPath(); g.rect(0, 690 - 160, W, 205); g.clip();
    wordmark(g, CX, 690, 156, (i, n) => {
      const pi = E.outExpo(clamp(p * (1 + n * 0.04) - i * 0.04));
      return { dy: (1 - pi) * 180 };
    }, { sweep: sw > 0 && sw < 1 ? sw : null, sweepA: 0.7 });
    g.restore();
    slotText(g, 'One dashboard for every asset you own.', CX, 785, { s: 42, w: 600, f: 'Txt', c: C.soft }, prog(t, REVEAL.sub, REVEAL.sub + 0.5), 0, 0.012);
    g.restore();
  }
}

function cues2(cue) {
  cue(4.0, 'impact', { gain: 1.0, big: true });
  cue(4.02, 'shimmer', { dur: 0.7, gain: 0.45 });
  REVEAL.w1.forEach(([, t0], i) => cue(t0, 'thump', { gain: 0.7 + i * 0.1 }));
  cue(REVEAL.l2, 'whoosh', { dur: 0.35, f0: 600, f1: 5000, gain: 0.35 });
  cue(REVEAL.l2 + 0.3, 'shine', { dur: 0.45, gain: 0.35 });
  cue(5.72, 'whoosh', { dur: 0.3, f0: 4000, f1: 500, gain: 0.35 });
  cue(5.85, 'zip', { dur: 0.42, gain: 0.35 });
  cue(6.15, 'whoosh', { dur: 0.32, f0: 400, f1: 3000, gain: 0.35 });
  cue(6.3, 'click', { gain: 0.5 });
  cue(6.95, 'shine', { dur: 0.5, gain: 0.3 });
  cue(7.3, 'reverse', { dur: 0.7, gain: 0.55 });
  cue(7.45, 'whoosh', { dur: 0.55, f0: 200, f1: 9000, gain: 0.7 });
}
