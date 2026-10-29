'use strict';
/* Scene 3 · Canlı kripto — "Bitcoin'den Cardano'ya, canlı fiyatlar yedi gün yirmi dört saat."
 * The app's live market card swings in; rows cascade from BTC to ADA as the voice names them,
 * then prices tick live (green / red flashes) and settle on the screenshot's values. */

// [row, time, value before the tick] — after the tick the row shows its real value
const S3_TICKS = [[0, 2.0, '$80.218,40'], [1, 2.45, '$2.325,62'], [4, 2.85, '$100,51'], [5, 3.25, '$0,07865'], [0, 3.7, '$80.219,12']];

function s3_screen(x, w, h, u) {
  logoH(x, 28, 52, 26);
  d5_icon(x, 'bell', w - 44, 42, 24, D5A.ink, 2.2);
  x.fillStyle = D5A.hair; x.fillRect(0, 80, w, 1.5);
  d5_seg(x, 28, 104, 390, 56, ['Kripto', 'Borsa', 'Emtia'], 0, 20);
  const lw = d5_live(x, w - 28, 132, 17, 'CANLI', 'right');
  d5_ping(x, w - 28 - lw + 17 * 0.78, 132, 14, (u * 1.2) % 1, D5A.live, 2);
  const cP = 478, cD = 650, cW = w - 28, hy = 206;
  d5_u(x, 'Varlık', 28, hy, 16, D5A.sec);
  d5_u(x, 'Fiyat', cP, hy, 16, D5A.sec, { a: 'right' });
  d5_u(x, 'Günlük', cD, hy, 16, D5A.sec, { a: 'right' });
  d5_u(x, 'Haftalık', cW, hy, 16, D5A.sec, { a: 'right' });
  D5_CRYPTO.forEach(([k, n, p, v, d, wk], i) => {
    const rp = ease(u, 0.3 + i * 0.16, 0.45);
    if (rp <= 0) return;
    const y = 268 + i * 84;
    x.save(); x.globalAlpha = rp; x.translate((1 - rp) * 60, 0);
    x.fillStyle = D5A.hair; x.fillRect(28, y - 44, w - 56, 1.5);
    // live tick: flash behind the price, the value switches
    let val = v;
    for (const [r, tt, before] of S3_TICKS) {
      if (r !== i) continue;
      if (u < tt) { val = before; break; }
      const f = 1 - clamp((u - tt) / 0.7);
      if (f > 0) {
        const up = trUnits(v) >= trUnits(before);
        rr(x, cP - 168, y - 22, 178, 44, 12); x.fillStyle = hexA(up ? D5A.up : D5A.dn, 0.18 * f); x.fill();
      }
    }
    d5_cIcon(x, 56, y, 26, k);
    d5_u(x, n, 96, y - 4, 22, D5A.ink, { w: 700 });
    d5_u(x, p, 96, y + 21, 15, D5A.sec, { w: 500 });
    d5_u(x, val, cP, y + 8, 22, D5A.ink, { w: 700, a: 'right' });
    d5_chg(x, cD, y, d, 17);
    d5_chg(x, cW, y, wk, 17);
    x.restore();
  });
  x.fillStyle = D5A.hair; x.fillRect(28, h - 62, w - 56, 1.5);
  d5_u(x, 'Güncellendi 14:24', w / 2, h - 26, 15, D5A.sec, { w: 500, a: 'center' });
}

SCENES[3] = {
  title: 'Canlı kripto', key: 4.0,
  fast: [[0, 0.45]],
  draw(g, u, D) {
    d5_bg(g, [[1250, 470, 1000, D5.lav, 0.55, 0.7], [250, 900, 700, D5.teal, 0.32], [1750, 120, 650, D5.or, 0.28]], { key: 's3', seed: 31, bokeh: 34, t: u, cam: [-u * 8, 0, u * 0.006] });
    d5_coinSoft(g, 820 + flo(u, 1, 10), 170 + flo(u, 2, 8), 30, { col: 'eth', tilt: 0.5, rot: 0.4 + u * 0.2, label: 'ETH' }, 3.5, 0.6);
    d5_coinSoft(g, 160 + flo(u, 3, 10), 960 + flo(u, 4, 10), 46, { col: 'btc', tilt: 0.5, rot: -0.4 + u * 0.15, label: 'BTC' }, 6, 0.55);
    addGlow(g, D5.or, 1250, 520, 520, 0.18);
    const cp = spring(u + 0.05, 1.1, 6.5), ca = ease(u, -0.1, 0.35);
    const pose = fly({ x: 1250 + flo(u, 5, 6), y: 548 + flo(u, 6, 6), z: 150, rx: 0.06, ry: -0.3 + flo(u, 7, 0.02), rz: 0.008, s: 0.96 }, cp, { x: 520, z: 600, ry: -0.6, rz: 0.05 });
    d5_card3L(g, (x, w, h) => s3_screen(x, w, h, u), 840, 870, pose, { dark: 0.4, shadow: 0.65, a: ca, key: 's3crypto', dyn: true });
    const b1 = spring(u - 0.55, 1.2, 6), b2 = spring(u - 0.8, 1.2, 6);
    if (b1 > 0) d5_coin(g, 1730 + flo(u, 8, 8), 840 + (1 - b1) * 260 + flo(u, 9, 10), 96 * clamp(b1, 0, 1.2), { col: 'btc', tilt: 0.5, rot: -0.28 + u * 0.12, label: 'BTC' });
    if (b2 > 0) d5_coin(g, 1790 + flo(u, 10, 8), 330 - (1 - b2) * 200 + flo(u, 11, 10), 54 * clamp(b2, 0, 1.2), { col: 'eth', tilt: 0.6, rot: 0.32 - u * 0.12, label: 'ETH' });
    // copy
    d5_kA(g, 'KRİPTO · CANLI', 116, 236, 20, D5.tealD, ease(u, 0.1, 0.6));
    d5_headA(g, [['Bitcoin’den Cardano’ya,', D5.soft]], 110, 314, 40, { glow: 0 }, ease(u, 0.25, 1.0, E.lin));
    d5_headA(g, [['Canlı fiyatlar,', D5.milk]], 110, 404, 70, {}, ease(u, 1.55, 0.8, E.lin));
    d5_headA(g, [['7/24.', 'org']], 110, 520, 112, {}, ease(u, 2.45, 0.6, E.lin));
    d5_tA(g, 'BTC, ETH, XRP ve fazlası;', 114, 600, 27, D5.soft, { w: 600 }, ease(u, 2.85, 0.6, E.lin));
    d5_tA(g, 'günlük ve haftalık değişimiyle.', 114, 638, 27, D5.soft, { w: 600 }, ease(u, 3.0, 0.6, E.lin));
    const pa = ease(u, 3.3, 0.45);
    if (pa > 0) {
      d5_snap(g);
      const lab = 'CANLI · Güncellendi 14:24', tw = d5_mw(g, lab, 22, D5M, 800);
      g.save(); g.globalAlpha *= pa; g.translate(0, (1 - E.outBack(pa)) * 20);
      d5_card(g, 110, 690, tw + 82, 60, 30, { dark: 0.55 }, () => {
        d5_ping(g, 142, 720, 22, (u * 1.1) % 1, '#10B981', 2.5);
        addGlow(g, '#10B981', 142, 720, 30, 0.8);
        g.fillStyle = '#10B981'; g.beginPath(); g.arc(142, 720, 7, 0, TAU); g.fill();
        d5_t(g, lab, 164, 728, 22, D5.milk, { w: 800 });
      });
      g.restore();
    }
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'whoosh', { gain: 0.4 });
    for (let i = 0; i < 7; i++) cue(t0 + 0.3 + i * 0.16, 'tick', { gain: 0.22 });
    cue(t0 + 0.55, 'pop', { gain: 0.25 }); cue(t0 + 0.8, 'pop', { gain: 0.25 });
    S3_TICKS.forEach(([, tt]) => cue(t0 + tt, 'blip', { gain: 0.2 }));
    cue(t0 + 2.45, 'hit', { gain: 0.35 });
  },
};
