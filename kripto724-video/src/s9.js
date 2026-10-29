'use strict';
/* Scene 9 · Kapanış — "Kripto yedi yirmi dört… Ücretsiz ailemize katılın! kripto yedi yirmi dört nokta com."
 * Light gathers into the glowing app icon, the orange arrow and coins rise; the invitation,
 * the orange button and the address land with the voice; the disclaimer stays to the end. */

const S9_RISE = [[1300, 1030], [1520, 840], [1610, 900], [1850, 640]];
const S9_JOIN = 1.55, S9_URL = 3.35;

SCENES[9] = {
  title: 'Kapanış', key: 6.0,
  fast: [[0, 0.35]],
  draw(g, u, D) {
    d5_bg(g, [[CX, 300, 820, D5.lav, 0.62, 0.8], [CX, 320, 420, D5.or, 0.34], [380, 920, 700, D5.teal, 0.28], [1560, 900, 700, D5.or, 0.2]], { key: 's9', seed: 91, bokeh: 44, t: u, cam: [0, 0, u * 0.004] });
    const lx = CX, ly = 282, ia = spring(u + 0.05, 1.1, 6);
    // rotating rays of soft colour
    const ra = ease(u, -0.2, 0.8);
    g.save(); g.globalAlpha *= ra;
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU + 0.15 + u * 0.07, col = [D5.lav, D5.or, D5.teal][i % 3];
      const gr = g.createRadialGradient(lx, ly, 100, lx, ly, 640); gr.addColorStop(0, hexA(col, 0.12)); gr.addColorStop(1, hexA(col, 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly); g.arc(lx, ly, 720, a - 0.035, a + 0.035); g.closePath(); g.fill();
    }
    g.restore();
    const ap = ease(u, 0.4, 1.0, E.inOutCubic);
    if (ap > 0.03) d5_rise(g, d5_cut(S9_RISE, ap), 34, { a: 0.9 });
    d5_coinSoft(g, 1500 + flo(u, 1, 8), 520 + flo(u, 2, 10), 30, { col: 'lav', tilt: 0.6, rot: -0.4, icon: 'stock' }, 3, 0.65 * ra);
    d5_coinSoft(g, 400 + flo(u, 3, 8), 250 + flo(u, 4, 10), 34, { col: 'teal', tilt: 0.55, rot: 0.5, label: '$' }, 4, 0.6 * ra);
    const rp = ease(u, 0.15, 0.9, E.inOutCubic);
    if (rp > 0) d5_ring(g, lx, ly + 34, 336, 98, -0.1, Math.PI, Math.PI + Math.PI * rp, 3.5, 0.9);
    if (ia > 0) {
      g.save(); g.translate(lx, ly); const sc = clamp(ia, 0, 1.2) * (1 + 0.012 * Math.sin(u * 2.4)); g.scale(sc, sc); g.translate(-lx, -ly);
      d5_snap(g);
      const path = () => { g.beginPath(); g.arc(lx, ly, 160, 0, TAU); }, bx = [lx - 160, ly - 160, lx + 160, ly + 160];
      d5_body(g, path, bx, { dark: 0.35, rim: 12, sheen: 0.22 });
      d5_appIcon(g, lx, ly, 200, { glow: 0.75 });
      // a glint across the tile
      const gl = ease(u, 0.75, 0.6, E.inOutCubic);
      if (gl > 0 && gl < 1) {
        g.save(); rr(g, lx - 100, ly - 100, 200, 200, 44); g.clip();
        const sx = lerp(lx - 260, lx + 260, gl), sg = g.createLinearGradient(sx - 60, ly - 100, sx + 60, ly + 100);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sg; g.fillRect(lx - 100, ly - 100, 200, 200); g.restore();
      }
      d5_edge(g, path, bx, { lw: 2.4 });
      g.restore();
    }
    if (rp > 0) d5_ring(g, lx, ly + 34, 336, 98, -0.1, 0, Math.PI * rp, 3.5, 0.9);
    const c1 = spring(u - 0.6, 1.2, 6), c2 = spring(u - 0.8, 1.2, 6);
    if (c1 > 0) d5_coin(g, 1400 + flo(u, 5, 8), 214 + (1 - c1) * 200 + flo(u, 6, 10), 56 * clamp(c1, 0, 1.2), { col: 'gold', tilt: 0.5, rot: -0.4 + u * 0.12, label: 'Au' });
    if (c2 > 0) d5_coin(g, 520 + flo(u, 7, 8), 420 + (1 - c2) * 200 + flo(u, 8, 10), 50 * clamp(c2, 0, 1.2), { col: 'btc', tilt: 0.6, rot: 0.3 - u * 0.12, label: 'BTC' });
    d5_headA(g, [['Ücretsiz ailemize ', D5.milk], ['katılın!', 'org']], CX, 600, 74, { a: 'center', glow: 0.55 }, ease(u, S9_JOIN, 1.0, E.lin));
    const bp = ease(u, S9_JOIN + 0.75, 0.45);
    if (bp > 0) {
      const bw = 520, bh = 100, bxx = CX - bw / 2, byy = 664, s = 0.8 + 0.2 * E.outBack(bp);
      g.save(); g.translate(CX, byy + bh / 2); g.scale(s, s); g.translate(-CX, -byy - bh / 2);
      d5_orBtn(g, bxx, byy, bw, bh, 'Hemen katıl', 36, { disc: true, a: bp, glow: 0.35, shine: ((u - S9_JOIN - 1.2) / 1.6) % 1.5 });
      g.restore();
    }
    const ua = ease(u, S9_URL, 0.7, E.lin);
    if (ua > 0) {
      g.save(); g.globalAlpha *= E.outCubic(ua);
      g.filter = `blur(${((1 - E.outCubic(ua)) * 10).toFixed(2)}px)`;
      d5_head(g, [['kripto724.com', D5.milk]], CX, 880 + (1 - E.outCubic(ua)) * 18, 56, { a: 'center', w: 600, glow: 0.5 });
      g.filter = 'none';
      g.restore();
    }
    d5_tA(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1032, 22, D5.soft, { a: 'center', w: 600 }, ease(u, S9_URL + 0.4, 0.7, E.lin));
    // the very end: a soft fade to the page colour
    d5_finish(g, 0.5);
    const fo = ease(u, D - 0.6, 0.6, E.inQuad);
    if (fo > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(250,249,255,${fo})`; g.fillRect(0, 0, W, H); g.restore(); }
  },
  cues(cue, t0, D) {
    cue(t0 + 0.0, 'impact', { gain: 0.45 });
    cue(t0 + 0.05, 'shimmer', { gain: 0.4 });
    cue(t0 + 0.4, 'riser', { gain: 0.2, dur: 1.0 });
    cue(t0 + 0.6, 'pop', { gain: 0.25 }); cue(t0 + 0.8, 'pop', { gain: 0.25 });
    cue(t0 + S9_JOIN + 0.75, 'pop', { gain: 0.35 });
    cue(t0 + S9_JOIN + 1.2, 'shine', { gain: 0.3 });
    cue(t0 + S9_URL, 'sparkle', { gain: 0.35 });
  },
};
