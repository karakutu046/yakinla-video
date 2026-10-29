'use strict';
/* Scene 8 · Bağla ve keşfet — "Binance, Bitget ve MEXC hesabını bağla, komisyon indiriminden yararlan."
 * Exchange tiles slide in as they are named; light beams run to the app icon and each tile
 * turns "Bağlandı"; then the %10 commission coupon and the education videos slide in. */

const S8_TILES = [
  ['Binance', { x: 340, y: 486, z: -20, rx: 0.04, ry: 0.32, rz: -0.02 }, 0.1],
  ['Bitget', { x: 330, y: 646, z: 30, rx: 0, ry: 0.34, rz: 0 }, 0.6],
  ['MEXC', { x: 340, y: 806, z: -10, rx: -0.04, ry: 0.32, rz: 0.02 }, 1.1],
];
const S8_HUB = [870, 640], S8_LINK = 0.75;   // a beam takes S8_LINK s from tile to hub

function s8_tile(x, w, h, name, ok) {
  x.fillStyle = 'rgba(110,91,255,0.1)'; x.beginPath(); x.arc(56, h / 2, 30, 0, TAU); x.fill();
  x.lineWidth = 1.5; x.strokeStyle = 'rgba(110,91,255,0.3)'; x.stroke();
  d5_icon(x, 'swap', 56, h / 2, 28, D5.milk, 2.6);
  d5_t(x, name, 104, h / 2 - 2 + (1 - E.outCubic(ok)) * 14, 28, D5.milk, { w: 800 });
  if (ok > 0) {
    x.save(); x.globalAlpha = clamp(ok * 2);
    check(x, 110, h / 2 + 26, 12, D5.up, 2.6, clamp(ok * 1.5));
    d5_t(x, 'Bağlandı', 124, h / 2 + 32, 16, D5.up, { w: 700 });
    x.restore();
  }
}

SCENES[8] = {
  title: 'Bağla ve keşfet', key: 4.6,
  fast: [[0, 0.3]],
  draw(g, u, D) {
    d5_bg(g, [[760, 620, 900, D5.lav, 0.52, 0.7], [1500, 560, 700, D5.lav, 0.32], [1750, 200, 600, D5.or, 0.26], [200, 1000, 600, D5.teal, 0.3]], { key: 's8', seed: 81, bokeh: 34, t: u, cam: [u * 6, 0, u * 0.005] });
    const hub = S8_HUB, ha = spring(u + 0.1, 1.2, 6);
    for (let k = 0; k < 3; k++) {
      const rp = ease(u, 0.1 + k * 0.15, 0.8, E.inOutCubic);
      if (rp > 0) d5_ring(g, hub[0], hub[1] + 60, 200 + k * 120, (200 + k * 120) * 0.26, 0, -Math.PI / 2, -Math.PI / 2 + TAU * rp, 2 - k * 0.4, 0.5 - k * 0.12);
    }
    const TW = 360, TH = 118;
    // beams (behind the tiles): drawn from the tile to the hub, then particles keep flowing
    S8_TILES.forEach(([n, ps, t0], i) => {
      const bp = ease(u, t0 + 0.3, S8_LINK, E.inOutCubic);
      if (bp <= 0) return;
      const P = projector(ps), st = P(TW / 2, 0), [x1, y1] = hub, mx = (st[0] + x1) / 2, my = (st[1] + y1) / 2 - 50;
      const qp = v => [(1 - v) * (1 - v) * st[0] + 2 * (1 - v) * v * mx + v * v * x1, (1 - v) * (1 - v) * st[1] + 2 * (1 - v) * v * my + v * v * y1];
      const pts = []; for (let j = 0; j <= 30; j++) pts.push(qp(j / 30 * bp));
      const gr = g.createLinearGradient(st[0], st[1], x1, y1); gr.addColorStop(0, hexA(D5.or, 0.95)); gr.addColorStop(1, hexA(D5.lav, 0.55));
      g.save(); g.strokeStyle = gr; g.lineCap = 'round'; g.lineJoin = 'round';
      [[10, 0.1], [3.5, 0.3], [1.8, 0.95]].forEach(([w, a]) => { g.globalAlpha = a; g.lineWidth = w; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); });
      g.restore();
      const head = qp(bp);
      if (bp < 1) { addGlow(g, D5.or, head[0], head[1], 34, 0.9); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(head[0], head[1], 3.2, 0, TAU); g.fill(); }
      else for (let j = 0; j < 3; j++) {
        const v = ((u - t0 - 0.3 - S8_LINK) * 0.9 + j / 3 + i * 0.13) % 1, q = qp(v);
        addGlow(g, D5.or, q[0], q[1], 24, 0.7); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0], q[1], 2.6, 0, TAU); g.fill();
      }
    });
    S8_TILES.forEach(([n, ps, t0], i) => {
      const tp = spring(u - t0, 1.2, 6.5), ta = ease(u, t0, 0.25);
      if (ta <= 0) return;
      const ok = ease(u, t0 + 0.3 + S8_LINK, 0.4);
      d5_snap(g);
      d5_card3(g, d5_tex(TW, TH, (x, w, h) => s8_tile(x, w, h, n, ok), 1.5, 0, 'tile' + i, true), fly({ ...ps, y: ps.y + flo(u, i, 5) }, tp, { x: -420, ry: 0.5 }), { r: 26, dark: 0.45, a: ta });
    });
    // hub: the app icon in a glass lens; it pulses as each account links
    const pulse = S8_TILES.reduce((a, [, , t0]) => a + kick(u - t0 - 0.3 - S8_LINK, 6), 0);
    if (ha > 0) {
      g.save(); g.translate(hub[0], hub[1]); const sc = clamp(ha, 0, 1.2) * (1 + 0.06 * pulse); g.scale(sc, sc); g.translate(-hub[0], -hub[1]);
      d5_snap(g);
      const lens = () => { g.beginPath(); g.arc(hub[0], hub[1], 150, 0, TAU); };
      d5_body(g, lens, [hub[0] - 150, hub[1] - 150, hub[0] + 150, hub[1] + 150], { dark: 0.35, rim: 10, sheen: 0.2 });
      d5_appIcon(g, hub[0], hub[1], 176, { glow: 0.5 + 0.3 * pulse });
      d5_edge(g, lens, [hub[0] - 150, hub[1] - 150, hub[0] + 150, hub[1] + 150], { lw: 2.2 });
      g.restore();
      S8_TILES.forEach(([, , t0]) => d5_ping(g, hub[0], hub[1], 180, clamp((u - t0 - 0.3 - S8_LINK) / 0.9), D5.or, 3));
    }
    d5_ring(g, hub[0], hub[1] + 62, 236, 72, -0.06, 0.05, 0.05 + (Math.PI - 0.1) * ease(u, 0.3, 0.9, E.inOutCubic), 2.6, 0.9);
    // perks
    const cpn = spring(u - 2.55, 1.1, 6.5);
    if (cpn > 0) {
      d5_snap(g);
      d5_card3L(g, d5_couponTex, 680, 224, fly({ x: 1470 + flo(u, 5, 5), y: 420 + flo(u, 6, 6), z: -40, rx: 0.06, ry: -0.24, rz: 0.012 }, cpn, { x: 520, ry: -0.5 }), { dark: 0.42, a: ease(u, 2.55, 0.25), key: 'coupon' });
      const cc = spring(u - 2.95, 1.4, 6);
      if (cc > 0) d5_coin(g, 1812 + flo(u, 7, 6), 236 + flo(u, 8, 8), 44 * clamp(cc, 0, 1.2), { col: 'btc', tilt: 0.55, rot: 0.4 + u * 0.3, label: '%' });
    }
    const vid = spring(u - 3.25, 1.1, 6.5);
    if (vid > 0) {
      d5_snap(g);
      d5_card3L(g, d5_videoTex, 680, 320, fly({ x: 1480 + flo(u, 9, 5), y: 800 + flo(u, 10, 6), z: 20, rx: -0.03, ry: -0.24, rz: -0.01 }, vid, { x: 520, ry: -0.5 }), { dark: 0.42, a: ease(u, 3.25, 0.25), key: 'video' });
    }
    // copy
    d5_headA(g, [['Kripto hesabını ', D5.milk], ['bağla.', 'org']], 110, 170, 58, {}, ease(u, 0.15, 1.0, E.lin));
    d5_tA(g, 'Binance, Bitget ve MEXC hesaplarını Kripto724’e kolayca bağla.', 114, 236, 27, D5.soft, { w: 600 }, ease(u, 1.2, 0.6, E.lin));
    d5_finish(g);
  },
  cues(cue, t0) {
    S8_TILES.forEach(([, , t]) => { cue(t0 + t, 'swish', { gain: 0.32 }); cue(t0 + t + 0.3, 'zap', { gain: 0.18 }); cue(t0 + t + 0.3 + S8_LINK, 'success', { gain: 0.3 }); });
    cue(t0 + 2.55, 'whoosh', { gain: 0.35 });
    cue(t0 + 2.95, 'coin', { gain: 0.3 });
    cue(t0 + 3.25, 'whoosh', { gain: 0.3 });
  },
};
