'use strict';
/* Scene 5 · Kapalıçarşı altını — "Kapalıçarşı altın fiyatları, canlı ve cebinde."
 * The gold price table slides in row by row; the cream gold card rises in front and its
 * prices roll up on odometers; gold coins drop in with a bounce. */

function s5_table(x, w, h, u) {
  d5_u(x, 'ALTIN FİYATLARI', 28, 58, 17, D5A.ink, { w: 700, ls: 1.5 });
  d5_seg(x, w - 296, 30, 268, 44, ['Yeni basım', 'Eski basım'], 1, 15, { track: D5A.creamTrack });
  const cA = 418, cS = 548, cD = w - 28, hy = 118;
  x.fillStyle = '#F7F7FA'; x.fillRect(0, hy - 26, w, 40);
  d5_u(x, 'Ürün', 28, hy, 14, D5A.sec); d5_u(x, 'Alış', cA, hy, 14, D5A.sec, { a: 'right' });
  d5_u(x, 'Satış', cS, hy, 14, D5A.sec, { a: 'right' }); d5_u(x, 'Değişim', cD, hy, 14, D5A.sec, { a: 'right' });
  D5_GOLD.forEach(([n, s2, al, sa, c], i) => {
    const rp = ease(u, 0.25 + i * 0.09, 0.4);
    if (rp <= 0) return;
    const y = 168 + i * 62;
    x.save(); x.globalAlpha = rp; x.translate((1 - rp) * 50, 0);
    if (i) { x.fillStyle = D5A.hair; x.fillRect(28, y - 31, w - 56, 1.4); }
    if (s2) { d5_u(x, n, 28, y - 3, 18, D5A.ink, { w: 700 }); d5_u(x, s2, 28, y + 17, 13, D5A.sec, { w: 500 }); }
    else d5_u(x, n, 28, y + 6, 18, D5A.ink, { w: 700 });
    d5_u(x, al, cA, y + 6, 17, D5A.ink, { w: 600, a: 'right' });
    d5_u(x, sa, cS, y + 6, 17, D5A.ink, { w: 700, a: 'right' });
    if (c) d5_chg(x, cD, y, c, 14);
    x.restore();
  });
}
function s5_gold(x, w, h, u) {
  x.fillStyle = D5A.cream; x.fillRect(0, 0, w, h);
  d5_goldIcon(x, 52, 56, 28);
  d5_u(x, 'Altın', 94, 52, 26, D5A.ink, { w: 700 });
  d5_ping(x, 100, 75, 12, (u * 1.1) % 1, D5A.live, 2);
  x.fillStyle = D5A.live; x.beginPath(); x.arc(100, 75, 5, 0, TAU); x.fill();
  d5_u(x, 'Kapalıçarşı · canlı', 112, 80, 15, D5A.sec, { w: 600 });
  const tx = w - 250, ty = 32, tw = 222, th = 48;
  rr(x, tx, ty, tw, th, th / 2); x.fillStyle = D5A.creamTrack; x.fill();
  const gg = x.createLinearGradient(tx, 0, tx + tw / 2, 0); gg.addColorStop(0, D5A.gold0); gg.addColorStop(1, D5A.gold1);
  rr(x, tx + 4, ty + 4, tw / 2 - 4, th - 8, (th - 8) / 2); x.fillStyle = gg; x.fill();
  d5_u(x, '₺ TL', tx + tw / 4 + 2, ty + 30, 17, '#FFFFFF', { w: 700, a: 'center' });
  d5_u(x, '$ USD', tx + tw * 3 / 4, ty + 30, 17, D5A.sec, { w: 700, a: 'center' });
  const pw = (w - 60) / 2, rp = E.outCubic(ease(u, 0.75, 1.3, E.lin));
  [['Gram Altın', '₺6.510,83', '+0,40%', 'Alış 6.422 · Satış 6.511'], ['Ons Altın', '$4.033,60', '+0,40%', 'Ons · USD']].forEach(([n, v, c, s2], i) => {
    const px = 24 + i * (pw + 12), py = 112, ph = h - 136;
    x.save(); x.shadowColor = 'rgba(120,90,10,0.12)'; x.shadowBlur = 12; x.shadowOffsetY = 3;
    rr(x, px, py, pw, ph, 18); x.fillStyle = '#FFFFFF'; x.fill(); x.restore();
    d5_u(x, n, px + 22, py + 38, 17, D5A.sec, { w: 600 });
    d5_chg(x, px + pw - 18, py + 32, c, 15);
    const T = trVal(v);
    d5_odo(x, v, lerp(T * 0.92, T, rp), px + 20, py + 98, { f: D5I, w: 700, s: 40, a: 'left', c: D5A.ink, ls: -0.5 });
    d5_u(x, s2, px + 22, py + 138, 15, D5A.sec, { w: 600 });
  });
}

SCENES[5] = {
  title: 'Kapalıçarşı altını', key: 3.2,
  fast: [[0, 0.4]],
  draw(g, u, D) {
    d5_bg(g, [[1300, 520, 950, D5.lav, 0.5, 0.75], [600, 820, 650, '#F2C14E', 0.32], [1750, 120, 600, D5.teal, 0.26], [150, 150, 600, D5.or, 0.2]], { key: 's5', seed: 51, bokeh: 34, t: u, cam: [-u * 8, 0, u * 0.006] });
    d5_coinSoft(g, 1830 + flo(u, 1, 8), 960 + flo(u, 2, 8), 52, { col: 'gold', tilt: 0.5, rot: 0.4 + u * 0.2, label: 'Au' }, 6, 0.6);
    d5_coinSoft(g, 980 + flo(u, 3, 8), 140 + flo(u, 4, 8), 28, { col: 'silver', tilt: 0.55, rot: -0.3, label: 'Ag' }, 3, 0.6);
    addGlow(g, '#F2C14E', 1400, 520, 480, 0.2);
    const tp = spring(u + 0.05, 1.1, 6.5), ta = ease(u, -0.12, 0.3);
    const tpose = fly({ x: 1420 + flo(u, 5, 5), y: 530 + flo(u, 6, 6), z: 200, rx: 0.05, ry: -0.3 + flo(u, 7, 0.02), rz: 0.008, s: 1.02 }, tp, { x: 520, z: 500, ry: -0.5 });
    d5_card3L(g, (x, w, h) => s5_table(x, w, h, u), 720, 724, tpose, { dark: 0.4, shadow: 0.6, a: ta, key: 's5table', dyn: true });
    const gp = spring(u - 0.4, 1.1, 6), ga = ease(u, 0.4, 0.3);
    if (ga > 0) {
      d5_snap(g);
      addGlow(g, '#F2C14E', 640, 720, 420, 0.24 * ga);
      const gpose = fly({ x: 650 + flo(u, 8, 5), y: 730 + flo(u, 9, 6), z: -110, rx: 0.06, ry: 0.2, rz: -0.012 }, gp, { y: 420, rx: -0.4, z: 300 });
      d5_card3L(g, (x, w, h) => s5_gold(x, w, h, u), 820, 300, gpose, { dark: 0.34, shadow: 0.65, fill: D5A.cream, a: ga, key: 's5gold', dyn: true });
    }
    [[1100, 900, 70, 0.3, 0.95, 'Au'], [1210, 972, 40, -0.4, 1.15, 'Au']].forEach(([x, y, r, rot, t0, l], i) => {
      const dt = u - t0;
      if (dt <= 0) return;
      const fall = Math.min(1, dt / 0.35), yy = dt < 0.35 ? lerp(y - 520, y, E.inQuad(fall)) : y - Math.abs(Math.sin((dt - 0.35) * 9)) * 40 * Math.exp(-(dt - 0.35) * 5);
      d5_coin(g, x + flo(u, i + 10, 4), yy, r, { col: 'gold', tilt: 0.5, rot: rot + dt * 2.2 * Math.exp(-dt * 1.5), label: l, glow: i ? 0.2 : 0.3 });
    });
    // copy
    d5_kA(g, 'EMTİA', 116, 150, 20, D5.tealD, ease(u, 0.1, 0.6));
    d5_headA(g, [['Kapalıçarşı altını,', D5.milk]], 110, 236, 60, {}, ease(u, 0.2, 0.9, E.lin));
    d5_headA(g, [['canlı ve cebinde.', 'org']], 110, 318, 60, {}, ease(u, 1.65, 0.8, E.lin));
    d5_tA(g, 'Alış, satış; yeni ve eski basım.', 114, 378, 27, D5.soft, { w: 600 }, ease(u, 2.1, 0.6, E.lin));
    const s = 0.72;
    let px = 110;
    [['Altın', 'Au', '#E0B03A'], ['Gümüş', 'Ag', '#A9ABBC'], ['Petrol', 'drop', '#2A2A38'], ['ve fazlası', 'spark', 'or']].forEach(([l, ic, disc], i) => {
      const M = d5_pillM(g, l, s), a = ease(u, 2.3 + i * 0.09, 0.35);
      if (a > 0) {
        d5_snap(g);
        const icon = ic === 'Au' || ic === 'Ag' ? (x, cx, cy, sz) => d5_t(x, ic, cx, cy + sz * 0.16, sz * 0.44, '#FFFFFF', { w: 800, a: 'center' }) : ic;
        g.save(); g.globalAlpha *= a; g.translate(0, (1 - E.outBack(a)) * 26);
        d5_pill(g, px, 448, l, icon, s, { left: true, disc, ic: ic === 'spark' ? D5.deep : '#FFFFFF' });
        g.restore();
      }
      px += M.w + 12;
    });
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'whoosh', { gain: 0.4 });
    cue(t0 + 0.4, 'swish', { gain: 0.35 });
    cue(t0 + 0.75, 'counter', { gain: 0.22, dur: 1.2 });
    cue(t0 + 1.3, 'coin', { gain: 0.4 }); cue(t0 + 1.5, 'coin', { gain: 0.3 });
    for (let i = 0; i < 4; i++) cue(t0 + 2.3 + i * 0.09, 'tick', { gain: 0.2 });
  },
};
