'use strict';
/* Scene 2 · Tek uygulama — "Artık hepsi tek uygulamada: Kripto yedi yirmi dört!"
 * The scattered cards stream into the centre and merge into one glass card; the ring draws,
 * the orange arrow rises, and the official logo lands on the brand name. */

// where scene 1 left each card, relative to the merge point (CX, 440)
const S2_GHOST = [['stocks', -580, -178, 0.14], ['exch', 600, -178, -0.12], ['web', -550, 405, -0.1], ['notes', 580, 422, 0.1], ['toastA', -60, -290, 0.06], ['toastB', 100, 505, -0.05]];
const S2_RISE = [[70, 1010], [520, 690], [700, 780], [1240, 380], [1420, 470], [1790, 150]];
const S2_LOGO = 2.05;   // the voice says the brand name: the logo, already on the card, flares

SCENES[2] = {
  title: 'Tek uygulama', key: 3.5,
  fast: [[0, 1.0]],
  draw(g, u, D) {
    d5_bg(g, [[CX, 470, 1000, D5.lav, 0.62, 0.65], [260, 980, 750, D5.teal, 0.3, 0.7], [1700, 160, 750, D5.or, 0.28, 0.7], [CX, 460, 430, '#B8A8FF', 0.3, 0.6]],
      { key: 's2', seed: 21, bokeh: 40, t: u, cam: [0, 0, u * 0.008] });
    // light streaks rushing to the centre
    const sa = ease(u, -0.2, 0.4) * (1 - ease(u, 0.9, 0.9));
    if (sa > 0) { g.save(); g.globalAlpha *= sa; d5_streaks(g, CX, 440, 22, 26, 760 - u * 320, 430 - u * 220); g.restore(); }
    // the other apps fly in and dissolve into one card
    S2_GHOST.forEach(([k, dx, dy, rot], i) => {
      const q = ease(u, -0.25 + i * 0.06, 1.05, E.inCubic);
      if (q >= 1) return;
      const [fn, w, h] = D5_APPS[k], S = d5_softTex(fn, w, h, 1.2, 24, 1, 'ghost:' + k), r = 1 - q;
      d5_plane(g, S.c, S.w, S.h, { x: CX + dx * r, y: 440 + dy * r, z: 200 + q * 420, rz: rot * r, ry: -dx / 700 * 0.6 * r, rx: dy / 400 * 0.3 * r, s: 0.95 },
        { a: Math.min(1, r * 2.5) * 0.9, nx: 4, ny: 3 });
    });
    // rising arrow behind the card
    const ap = ease(u, 1.1, 1.2, E.inOutCubic);
    if (ap > 0.03) d5_rise(g, d5_cut(S2_RISE, ap), 50, { a: 0.95 });
    const lc0 = spring(u - 1.9, 1.3, 6);
    if (lc0 > 0) d5_coinSoft(g, 1240 + flo(u, 2, 6), 196 + (1 - lc0) * 60 + flo(u, 3, 8), 34 * clamp(lc0, 0, 1.2), { col: 'lav', tilt: 0.55, rot: 0.3, icon: 'stock' }, 3, 0.75);
    const rp = ease(u, 0.9, 1.1, E.inOutCubic);
    if (rp > 0) d5_ring(g, CX, 460, 830, 290, -0.08, Math.PI, Math.PI + Math.PI * rp, 6);
    // the one card
    const cp = spring(u - 0.78, 1.15, 6), ca = ease(u, 0.78, 0.3);
    if (ca > 0) {
      d5_snap(g);
      const pose = fly({ x: CX, y: 440 + flo(u, 1, 6), z: 0, rx: 0.07 + flo(u, 2, 0.012), ry: flo(u, 3, 0.03) }, cp, { z: 800, rx: 0.35, s: -0.25 });
      const LP = d5_card3(g, d5_tex(1000, 540, d5_logoCard, 1.5, 0, 'logoCard'), pose, { r: 44, dark: 0.5, sheen: 0.2, shadow: 0.6, a: ca });
      const lp = spring(u - 0.9, 1.3, 6.5) + 0.06 * Math.sin(clamp((u - S2_LOGO) / 0.45) * Math.PI), la = ease(u, 0.9, 0.25);
      if (la > 0) {
        const lc = LP(0, 236 - 270);
        g.save(); g.globalAlpha *= la;
        logo(g, lc[0], lc[1], 290 * FOCAL / lc[2] * (0.6 + 0.4 * lp), { ink: '#0A0A0A' });
        g.restore();
        const sk = kick(u - S2_LOGO - 0.1, 3.5);
        if (sk > 0.01) { addGlow(g, D5.or2, lc[0] + 170, lc[1] - 120, 90 * sk, 0.8 * sk); sparkle(g, lc[0] + 170, lc[1] - 120, 26 * sk, '#FFFFFF'); }
      }
    }
    // merge bloom
    const bl = kick(u - 0.82, 4.5);
    if (bl > 0.01) {
      g.save(); const rg = g.createRadialGradient(CX, 440, 0, CX, 440, 760);
      rg.addColorStop(0, `rgba(255,255,255,${0.85 * bl})`); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore();
    }
    if (rp > 0) d5_ring(g, CX, 460, 830, 290, -0.08, 0, Math.PI * rp, 6);
    const b1 = spring(u - 1.45, 1.3, 6), b2 = spring(u - 1.7, 1.3, 6);
    if (b1 > 0) d5_coin(g, 300 + flo(u, 4, 8), 640 + (1 - b1) * 220 + flo(u, 5, 10), 66 * clamp(b1, 0, 1.2), { col: 'btc', tilt: 0.52, rot: -0.35 + u * 0.15, label: 'BTC' });
    if (b2 > 0) d5_coin(g, 1650 + flo(u, 6, 8), 600 + (1 - b2) * 220 + flo(u, 7, 10), 54 * clamp(b2, 0, 1.2), { col: 'gold', tilt: 0.58, rot: 0.3 - u * 0.15, label: 'Au' });
    const tw = 0.5 + 0.5 * Math.sin(u * 5);
    if (b2 > 0) { addGlow(g, D5.or2, 1560, 776, 60, 0.5 * tw); sparkle(g, 1560, 776, 14 * (0.6 + 0.4 * tw) * clamp(b2), D5.or); }
    d5_headA(g, [['Kripto, borsa ve emtia', D5.milk]], CX, 878, 64, { a: 'center', glow: 0.5 }, ease(u, 0.3, 0.9, E.lin));
    d5_headA(g, [['tek uygulamada.', 'org']], CX, 966, 64, { a: 'center', glow: 0.5 }, ease(u, 1.05, 0.9, E.lin));
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'suck', { gain: 0.35 });
    cue(t0 + 0.8, 'impact', { gain: 0.45 });
    cue(t0 + 1.1, 'riser', { gain: 0.25, dur: 0.9 });
    cue(t0 + 1.45, 'pop', { gain: 0.3 }); cue(t0 + 1.7, 'pop', { gain: 0.3 });
    cue(t0 + S2_LOGO, 'shimmer', { gain: 0.45 });
  },
};
