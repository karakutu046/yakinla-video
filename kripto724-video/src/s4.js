'use strict';
/* Scene 4 · BIST ve Nasdaq — "BIST'ten Nasdaq'a, 210 hisse tek listede."
 * The glass phone rises with the Borsa screen; BIST 100 and Nasdaq 100 cards spring out of it
 * on light trails; 210 counts up, the two market badges pop, filters and search follow. */

function s4_idx(n, v, c, sd) {
  return (x, w, h) => {
    d5_u(x, n, 26, 46, 22, D5A.sec, { w: 600 });
    d5_chg(x, w - 24, 38, c, 18);
    text(x, v, 24, 104, { f: D5I, w: 700, s: 46, a: 'left', c: D5A.ink, ls: -0.8 });
    d5_idxSpark(x, sd, true, 26, w - 26, 122, h - 22, 3.2);
  };
}
const S4_IDX = [
  ['BIST 100', '11.165,44', '+0,13%', 611, { x: 1612, y: 300, z: -160, rx: 0.06, ry: -0.34, rz: 0.035 }, [-110, -280], 0.55],
  ['Nasdaq 100', '29.813,16', '+0,55%', 612, { x: 1640, y: 700, z: -120, rx: -0.04, ry: -0.3, rz: -0.03 }, [95, -280], 0.95],
];

SCENES[4] = {
  title: 'BIST ve Nasdaq', key: 3.3,
  fast: [[0, 0.4]],
  draw(g, u, D) {
    d5_bg(g, [[1200, 520, 950, D5.lav, 0.55, 0.75], [1750, 980, 600, D5.teal, 0.3], [200, 120, 700, D5.or, 0.22]], { key: 's4', seed: 41, bokeh: 36, t: u, cam: [u * 8, 0, u * 0.006] });
    d5_coinSoft(g, 1700 + flo(u, 1, 8), 130 + flo(u, 2, 8), 30, { col: 'lav', tilt: 0.55, rot: 0.3 + u * 0.2, label: 'MU' }, 3, 0.6);
    addGlow(g, D5.lav, 1180, 560, 520, 0.3);
    const pp = spring(u + 0.08, 1.0, 6.5), pa = ease(u, -0.15, 0.3);
    const pose = fly({ x: 1170 + flo(u, 3, 5), y: 556 + flo(u, 4, 6), z: 220, rx: 0.04, ry: -0.24 + flo(u, 5, 0.02), rz: 0.01, s: 0.96 }, pp, { y: 700, rx: 0.5, rz: -0.08 });
    d5_phone(g, d5_scrBorsa, pose, { a: pa, key: 'borsa' });
    const P = projector(pose);
    // index cards spring out of the phone's mini cards
    S4_IDX.forEach(([n, v, c, sd, ps, src, t0]) => {
      const dt = u - t0;
      if (dt <= 0) return;
      const k = spring(dt, 1.1, 6), a = ease(u, t0, 0.2), s0 = P(src[0], src[1]);
      const cur = { ...ps, x: lerp(s0[0], ps.x, k) + flo(u, sd, 6), y: lerp(s0[1], ps.y, k) + flo(u, sd + 1, 6), z: lerp(220, ps.z, k), s: lerp(0.35, 1, clamp(k, 0, 1.1)) };
      // light trail from the phone
      const ta = a * (1 - ease(u, t0 + 0.9, 0.8) * 0.6);
      const gr = g.createLinearGradient(s0[0], s0[1], cur.x, cur.y); gr.addColorStop(0, hexA(D5.or, 0)); gr.addColorStop(1, hexA(D5.or, 0.55));
      g.save(); g.strokeStyle = gr; g.lineCap = 'round';
      [[22, 0.08], [7, 0.22], [2, 0.75]].forEach(([w, al]) => { g.globalAlpha = al * ta; g.lineWidth = w; g.beginPath(); g.moveTo(s0[0], s0[1]); g.quadraticCurveTo((s0[0] + cur.x) / 2, Math.min(s0[1], cur.y) - 60, cur.x, cur.y); g.stroke(); });
      g.restore();
      d5_snap(g);
      d5_card3L(g, s4_idx(n, v, c, sd), 380, 200, cur, { dark: 0.36, a, key: 'idx' + sd });
    });
    // copy
    d5_kA(g, 'BORSA', 116, 190, 20, D5.tealD, ease(u, 0.1, 0.6));
    d5_headA(g, [['BIST’ten Nasdaq’a,', D5.milk]], 110, 278, 60, {}, ease(u, 0.2, 0.9, E.lin));
    d5_headA(g, [['tek listede.', 'org']], 110, 360, 60, {}, ease(u, 2.3, 0.7, E.lin));
    const ka = ease(u, 1.2, 0.4);
    if (ka > 0) {
      d5_snap(g);
      g.save(); g.globalAlpha *= ka; g.translate(110, 503); g.scale(0.92 + 0.08 * E.outBack(ka), 0.92 + 0.08 * E.outBack(ka)); g.translate(-110, -503);
      d5_card(g, 110, 410, 620, 186, 32, { dark: 0.45 }, () => {
        const n = Math.round(210 * E.outCubic(ease(u, 1.35, 0.9, E.lin)));
        d5_head(g, [[String(n), 'holo']], 140, 528, 92, { glow: 0.3 });
        d5_t(g, 'hisse', 146, 570, 24, D5.soft, { w: 700 });
        [['BIST', '108', 452, 1.6], ['Nasdaq', '102', 530, 1.85]].forEach(([l, nn, y, t0]) => {
          const b = spring(u - t0, 1.4, 7);
          if (b <= 0) return;
          g.save(); g.globalAlpha *= clamp(b * 2);
          d5_t(g, l, 360, y - 2, 28, D5.milk, { w: 800 });
          const lw = d5_mw(g, l, 28, D5M, 800), bx = 360 + lw + 14;
          g.translate(bx + 42, y - 11); g.scale(b, b); g.translate(-bx - 42, -y + 11);
          rr(g, bx, y - 32, 84, 42, 21); g.fillStyle = D5A.badge; g.fill();
          d5_t(g, nn, bx + 42, y - 3, 22, D5.lav, { w: 800, a: 'center' });
          g.restore();
        });
      });
      g.restore();
    }
    const s = 0.74;
    let px = 110;
    [['Favoriler', 'star'], ['Popüler', 'stock', true], ['Yükselenler', 'up'], ['Düşenler', 'down']].forEach(([l, ic, sel], i) => {
      const M = d5_pillM(g, l, s), a = ease(u, 2.35 + i * 0.09, 0.35);
      if (a > 0) {
        d5_snap(g);
        g.save(); g.globalAlpha *= a; g.translate(0, (1 - E.outBack(a)) * 26);
        d5_pill(g, px, 668, l, ic, s, { left: true, sel, disc: ic === 'down' ? '#E5484D' : ic === 'up' ? '#16A34A' : 'or', ic: ic === 'up' || ic === 'down' ? '#FFFFFF' : D5.deep });
        g.restore();
      }
      px += M.w + 12;
    });
    const sa = ease(u, 2.7, 0.4);
    if (sa > 0) {
      d5_snap(g);
      g.save(); g.globalAlpha *= sa; g.translate(0, (1 - E.outCubic(sa)) * 24);
      d5_card(g, 110, 728, 620, 72, 36, { dark: 0.5 }, () => {
        d5_icon(g, 'search', 152, 764, 24, D5.soft, 2.6);
        d5_t(g, 'Hisse adı ya da kodu ara…', 184, 773, 24, D5.soft, { w: 600 });
      });
      g.restore();
    }
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'whoosh', { gain: 0.4 });
    S4_IDX.forEach(([, , , , , , t]) => cue(t0 + t, 'swish', { gain: 0.35 }));
    cue(t0 + 1.35, 'counter', { gain: 0.25, dur: 0.8 });
    cue(t0 + 1.6, 'pop', { gain: 0.3 }); cue(t0 + 1.85, 'pop', { gain: 0.3 });
    for (let i = 0; i < 4; i++) cue(t0 + 2.35 + i * 0.09, 'tick', { gain: 0.2 });
  },
};
