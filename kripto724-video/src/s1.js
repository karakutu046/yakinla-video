'use strict';
/* Scene 1 · Dağınık camlar — "Kripto bir uygulamada, hisse başka yerde, altın bambaşka bir sitede…"
 * Glass cards of other apps arrive one by one as the voice names them; notifications pop;
 * the line is typed out in three slots, the last one holographic. */

const S1_FAR = [
  ['notes', { x: 860, y: 230, z: 1900, rx: 0.15, ry: -0.3, rz: 0.12 }, 4, 0.6],
  ['web', { x: 1330, y: 640, z: 1700, rx: -0.1, ry: -0.5, rz: -0.05 }, 4, 0.58],
  ['stocks', { x: 640, y: 700, z: 1600, rx: 0.1, ry: 0.5, rz: 0.08 }, 3.5, 0.58],
  ['exch', { x: 1180, y: 960, z: 1800, rx: -0.3, ry: 0.2, rz: -0.1 }, 4, 0.55],
  ['exch', { x: 150, y: 560, z: 1500, ry: 0.6, rz: -0.12 }, 3.5, 0.55],
  ['toastB', { x: 1760, y: 560, z: 1400, ry: -0.6, rz: 0.1 }, 3.5, 0.55],
].sort((a, b) => b[1].z - a[1].z);
// [app, pose, arrival (s), entry offsets]
const S1_MID = [
  ['exch', { x: 1560, y: 262, z: 240, rx: 0.08, ry: -0.45, rz: 0.06 }, 0.12, { x: 260, y: -120, z: 900, ry: -0.6, rz: 0.2 }],
  ['toastA', { x: 900, y: 150, z: -60, rx: 0.05, ry: 0.1, rz: -0.035 }, 0.95, { y: -60, z: 500, s: -0.3 }],
  ['stocks', { x: 380, y: 262, z: 200, rx: 0.1, ry: 0.42, rz: -0.07 }, 1.4, { x: -280, y: -100, z: 900, ry: 0.6, rz: -0.2 }],
  ['notes', { x: 1540, y: 862, z: 220, rx: -0.12, ry: -0.4, rz: -0.05 }, 1.95, { x: 260, y: 120, z: 900, ry: -0.5, rz: -0.2 }],
  ['web', { x: 410, y: 845, z: 160, rx: -0.14, ry: 0.36, rz: 0.05 }, 2.5, { x: -260, y: 140, z: 900, ry: 0.6, rz: 0.2 }],
  ['toastB', { x: 1060, y: 945, z: -40, ry: -0.12, rz: 0.03 }, 3.15, { y: 60, z: 500, s: -0.3 }],
];
const S1_LINES = [
  [[['Kripto bir uygulamada,', D5.milk]], 0.3],
  [[['hisse başka yerde,', D5.milk]], 1.45],
  [[['altın bambaşka bir sitede.', 'holo']], 2.55],
];

SCENES[1] = {
  title: 'Dağınık camlar', key: 3.9,
  fast: [[0, 0.5]],
  draw(g, u, D) {
    const cam = [flo(u, 1, 14, 0.5) - u * 6, flo(u, 2, 8, 0.5), u * 0.006];
    d5_bg(g, [[300, 180, 950, D5.lav, 0.6, 0.7], [1750, 260, 800, D5.or, 0.26, 0.8], [420, 1050, 850, D5.teal, 0.3, 0.6], [1100, 620, 700, D5.lav2, 0.5, 0.8]],
      { key: 's1', seed: 11, bokeh: 46, t: u, cam });
    // far: soft, fading in
    const fa = ease(u, -0.9, 0.9);
    S1_FAR.forEach(([k, pose, blur, a], i) => {
      const [fn, w, h] = D5_APPS[k];
      const ps = { ...pose, x: pose.x + cam[0] * 0.3 + flo(u, i, 10), y: pose.y + flo(u, i + 4, 8), z: pose.z + (1 - fa) * 600 };
      d5_softCard(g, fn, w, h, ps, blur, a * fa, 24, 1.4, 's1far' + i);
    });
    d5_coinSoft(g, 1040 + flo(u, 3, 8), 860 + flo(u, 7, 10), 26, { col: 'gold', tilt: 0.55, rot: 0.5 + u * 0.2, label: 'Au' }, 3, 0.6 * fa);
    // headline haze
    const ha = ease(u, 0.2, 0.8);
    if (ha > 0) {
      g.save(); g.globalAlpha = ha; g.translate(CX, 560); g.scale(1, 0.4);
      const vg = g.createRadialGradient(0, 0, 0, 0, 0, 1000);
      vg.addColorStop(0, 'rgba(255,255,255,0.92)'); vg.addColorStop(0.55, 'rgba(255,255,255,0.6)'); vg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = vg; g.fillRect(-1000, -1000, 2000, 2000); g.restore();
    }
    // mid: each card arrives as it is named
    S1_MID.map((m, i) => [...m, i]).sort((a, b) => b[1].z - a[1].z).forEach(([k, pose, t0, from, i]) => {
      const dt = u - t0;
      if (dt <= 0) return;
      const p = spring(dt, 1.3, 6.5), a = ease(u, t0, 0.3);
      const ps = fly({ ...pose, x: pose.x + cam[0] * 0.6 + flo(u, i, 9), y: pose.y + flo(u, i + 2, 7), rz: pose.rz + flo(u, i + 5, 0.012) }, p, from);
      d5_snap(g);
      const [fn, w, h] = D5_APPS[k];
      d5_card3(g, d5_tex(w, h, fn, 1.5, 0, 'app:' + k), ps, { r: k.startsWith('toast') ? 24 : 26, dark: 0.4, a });
      if (k.startsWith('toast')) { const P = projector(ps), c = P(-w / 2 + 46, 0); d5_ping(g, c[0], c[1], 40, clamp(dt / 0.7), k === 'toastA' ? D5.or : D5.teal, 3); }
    });
    const c1 = spring(u - 0.55, 1.4, 6), c2 = spring(u - 2.7, 1.4, 6);
    if (c1 > 0) d5_coin(g, 790 + flo(u, 1, 6), 830 + (1 - c1) * 160 + flo(u, 2, 8), 34 * clamp(c1, 0, 1.2), { col: 'btc', tilt: 0.5, rot: -0.5 + u * 0.25, label: 'BTC' });
    if (c2 > 0) d5_coin(g, 1255 + flo(u, 4, 6), 330 - (1 - c2) * 140 + flo(u, 5, 8), 26 * clamp(c2, 0, 1.2), { col: 'gold', tilt: 0.7, rot: 0.35 - u * 0.2, label: 'Au' });
    // foreground, heavily defocused, drifting past
    d5_softCard(g, D5_APPS.stocks[0], 400, 290, { x: 420 + cam[0] * 1.6 - u * 22, y: 600 + flo(u, 1, 16), z: -780, ry: 0.3, rz: 0.12 }, 9, 0.8 * fa, 24, 2.4, 's1fgA');
    d5_softCard(g, D5_APPS.exch[0], 400, 290, { x: 1540 + cam[0] * 1.6 + u * 18, y: 470 + flo(u, 2, 16), z: -820, ry: -0.35, rz: -0.1 }, 10, 0.8 * fa, 24, 2.4, 's1fgB');
    d5_coinSoft(g, 1720 + u * 14, 990 + flo(u, 3, 12), 70, { col: 'btc', tilt: 0.45, rot: -0.3 + u * 0.15, label: 'BTC' }, 9, 0.75 * fa);
    // the line, phrase by phrase
    S1_LINES.forEach(([parts, t0], i) => d5_headA(g, parts, CX, 488 + i * 84, 58, { a: 'center' }, ease(u, t0, 0.9, E.lin)));
    const pa = ease(u, 3.45, 0.45);
    if (pa > 0) {
      d5_snap(g);
      const s1 = 'Piyasa hiç durmuyor.', fs = 28, tw = d5_mw(g, s1, fs, D5M, 800), bw = tw + 96, bx = CX - bw / 2, by = 700;
      g.save(); g.globalAlpha *= pa; g.translate(CX, by + 30); g.scale(0.85 + 0.15 * E.outBack(pa), 0.85 + 0.15 * E.outBack(pa)); g.translate(-CX, -by - 30);
      d5_card(g, bx, by, bw, 60, 30, { dark: 0.55 }, () => {
        const pulse = 0.5 + 0.5 * Math.sin(u * 9);
        addGlow(g, D5.or, bx + 34, by + 30, 30 + pulse * 10, 0.8);
        g.fillStyle = D5.or; g.beginPath(); g.arc(bx + 34, by + 30, 7.5, 0, TAU); g.fill();
        d5_t(g, s1, bx + 58, by + 40, fs, D5.milk, { w: 800 });
      });
      g.restore();
    }
    d5_finish(g);
  },
  cues(cue, t0) {
    S1_MID.forEach(([k, , t]) => cue(t0 + t, k.startsWith('toast') ? 'ding' : 'whoosh', { gain: k.startsWith('toast') ? 0.4 : 0.32 }));
    cue(t0 + 0.55, 'pop', { gain: 0.3 }); cue(t0 + 2.7, 'pop', { gain: 0.3 });
    cue(t0 + 3.45, 'blip', { gain: 0.35 });
  },
};
