'use strict';
/* Scene 6 · Kasam — "Altınını, dövizini, tüm varlıklarını Kasam'da güvenle takip et."
 * A glass vault door spins open in orange light; gold, dollar and lira coins fly out as the
 * voice names them; the Kasam phone slides in, the total rolls up and the ring draws. */

function s6_kasam(x, w, h, u) {
  d5_status(x, w, '14:24');
  d5_u(x, 'Kasam', 20, 100, 30, D5A.ink, { w: 700 });
  d5_icon(x, 'lock', w - 38, 90, 22, D5A.lav, 2.2);
  d5_u(x, 'Altın, döviz ve kişisel varlıkların', 20, 124, 14, D5A.sec, { w: 500 });
  const gr = x.createLinearGradient(20, 146, w - 20, 340); gr.addColorStop(0, '#5A47F0'); gr.addColorStop(1, '#8F7FFF');
  rr(x, 20, 146, w - 40, 196, 24); x.fillStyle = gr; x.fill();
  x.save(); rr(x, 20, 146, w - 40, 196, 24); x.clip();
  x.globalAlpha = 0.16; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(w - 50, 170, 120, 0, TAU); x.fill(); x.beginPath(); x.arc(w - 10, 330, 80, 0, TAU); x.fill();
  x.restore();
  d5_u(x, 'Toplam', 44, 194, 15, 'rgba(255,255,255,0.82)', { w: 600 });
  const T = trVal('₺1.250.430'), tp = E.outCubic(ease(u, 0.85, 1.5, E.lin));
  d5_odo(x, '₺1.250.430', T * tp, 42, 254, { f: D5I, w: 700, s: 44, a: 'left', c: '#FFFFFF', ls: -0.5 });
  rr(x, 44, 280, 178, 34, 17); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fill();
  d5_icon(x, 'shield', 64, 297, 16, '#FFFFFF', 1.8);
  d5_u(x, 'Güvenle takip et', 80, 302, 13, '#FFFFFF', { w: 600 });
  rr(x, 20, 360, w - 40, 222, 22); x.fillStyle = '#FFFFFF'; x.fill();
  const segs = [[0.5, D5A.gold1, 1.0], [0.28, '#19D3C5', 1.35], [0.22, D5A.lav, 1.7]], dc = [112, 471];
  let a = -Math.PI / 2; x.lineWidth = 22; x.lineCap = 'butt';
  x.strokeStyle = '#F1F0FA'; x.beginPath(); x.arc(dc[0], dc[1], 64, 0, TAU); x.stroke();
  segs.forEach(([v, c, t0]) => {
    const sp = ease(u, t0, 0.45, E.inOutCubic);
    if (sp > 0) { x.strokeStyle = c; x.beginPath(); x.arc(dc[0], dc[1], 64, a + 0.04, a + 0.04 + (v * TAU - 0.08) * sp); x.stroke(); }
    a += v * TAU;
  });
  d5_icon(x, 'lock', dc[0], dc[1], 26, D5A.ink, 2.2);
  [['Altın', D5A.gold1, 1.0], ['Döviz', '#19D3C5', 1.35], ['Kişisel varlıklar', D5A.lav, 1.7]].forEach(([l, c, t0], i) => {
    const la = ease(u, t0, 0.35), y = 432 + i * 40;
    x.save(); x.globalAlpha = la; x.translate((1 - la) * 20, 0);
    x.fillStyle = c; rr(x, 212, y - 11, 14, 14, 4); x.fill();
    d5_u(x, l, 236, y + 1, 15, D5A.ink, { w: 600 });
    x.restore();
  });
  [['Altın', 'Gram, çeyrek, ata…', 'gold'], ['Döviz', 'Dolar ve diğerleri', 'fx'], ['Kişisel varlıklar', 'Kendi eklediklerin', 'me']].forEach(([l, s2, k], i) => {
    const y = 630 + i * 62;
    if (i) { x.fillStyle = D5A.hair; x.fillRect(32, y - 31, w - 64, 1.2); }
    if (k === 'gold') d5_goldIcon(x, 46, y, 18);
    else { x.fillStyle = k === 'fx' ? '#DDF8F5' : D5A.badge; x.beginPath(); x.arc(46, y, 18, 0, TAU); x.fill(); d5_u(x, k === 'fx' ? '$' : '★', 46, y + 6, 16, k === 'fx' ? '#0A8A80' : D5A.lav, { w: 700, a: 'center' }); }
    d5_u(x, l, 76, y - 3, 15, D5A.ink, { w: 700 });
    d5_u(x, s2, 76, y + 15, 12, D5A.sec, { w: 500 });
    d5_icon(x, 'chev', w - 38, y, 14, D5A.sec, 1.8);
  });
  rr(x, 20, 790, w - 40, 50, 25); x.fillStyle = D5A.or; x.fill();
  d5_u(x, 'Kasamı Gör', w / 2 - 8, 821, 16, '#FFFFFF', { w: 700, a: 'center' });
  d5_icon(x, 'arrow', w / 2 + 62, 815, 16, '#FFFFFF', 2.2);
  d5_nav(x, w, h, ['Akış', 'Haberler', '', 'Alarmlarım', 'Hesabım']);
}
// coins leaving the vault: [x, y, r, colour, label, time]
const S6_COINS = [[1820, 830, 58, 'gold', 'Au', 0.35], [1810, 190, 44, 'teal', '$', 0.95], [1090, 170, 40, 'btc', '₺', 1.55]];

SCENES[6] = {
  title: 'Kasam', key: 4.0,
  fast: [[0, 0.4]],
  draw(g, u, D) {
    d5_bg(g, [[1420, 520, 950, D5.lav, 0.52, 0.75], [1500, 560, 520, D5.or, 0.3], [220, 960, 650, D5.teal, 0.3]], { key: 's6', seed: 61, bokeh: 34, t: u, cam: [u * 8, 0, u * 0.006] });
    // the vault: rim, frosted door spinning open, glow
    const vp0 = spring(u + 0.1, 0.9, 6), va = ease(u, -0.2, 0.35);
    const vp = fly({ x: 1530, y: 500 + flo(u, 1, 5), z: 260, rx: 0.06, ry: -0.42 + flo(u, 2, 0.015), rz: -1.6 * (1 - E.outCubic(ease(u, -0.1, 1.5, E.lin))) }, vp0, { x: 300, z: 700, ry: -0.5 });
    const VR = 330, P = projector(vp);
    g.save(); g.globalAlpha *= va;
    addGlow(g, D5.or, vp.x, vp.y, 640, 0.35 + 0.15 * kick(u - 0.35, 2));
    d5_pcirc(g, P, VR * 1.02, 70);
    const rim = g.createLinearGradient(vp.x - VR, vp.y - VR, vp.x + VR, vp.y + VR); rim.addColorStop(0, '#E6E1FF'); rim.addColorStop(1, '#B8ADFF');
    g.fillStyle = rim; g.fill();
    g.save(); d5_pcirc(g, P, VR * 1.02, 70); g.lineWidth = 3; g.strokeStyle = hexA(D5.lav, 0.45); g.stroke(); g.restore();
    g.restore();
    d5_snap(g);
    const path = () => d5_pcirc(g, P, VR), bb = d5_pbox(P, VR * 2, VR * 2);
    d5_body(g, path, bb, { dark: 0.35, sheen: 0.24, shadow: 0.6, rim: 12, a: va });
    d5_plane(g, d5_tex(VR * 2, VR * 2, d5_vaultTex, 1.3, 0, 'vault').c, VR * 2, VR * 2, vp, { a: va });
    d5_edge(g, path, bb, { lw: 2.6, a: va });
    // coins fly out of the vault centre
    S6_COINS.forEach(([x, y, r, col, l, t0], i) => {
      const dt = u - t0;
      if (dt <= 0) return;
      const k = spring(dt, 1.0, 6), cx = lerp(vp.x, x, k) + flo(u, i, 8), cy = lerp(vp.y, y, k) - Math.sin(clamp(k) * Math.PI) * 120 + flo(u, i + 3, 10);
      d5_coin(g, cx, cy, r * lerp(0.3, 1, clamp(k, 0, 1.1)), { col, tilt: 0.55, rot: (i ? -0.4 : 0.3) + dt * 1.5 * Math.exp(-dt), label: l });
    });
    const pp = spring(u - 0.3, 1.0, 6.5), pa = ease(u, 0.3, 0.3);
    if (pa > 0) {
      d5_snap(g);
      const pose = fly({ x: 1150 + flo(u, 7, 5), y: 572 + flo(u, 8, 6), z: -40, rx: 0.03, ry: -0.16 + flo(u, 9, 0.02), rz: -0.012, s: 0.86 }, pp, { y: 600, rx: 0.45, rz: 0.06 });
      d5_phone(g, (x, w, h) => s6_kasam(x, w, h, u), pose, { a: pa, key: 'kasam', dyn: true });
    }
    // copy
    d5_kA(g, 'KASAM', 116, 274, 20, D5.tealD, ease(u, 0.1, 0.6));
    d5_headA(g, [['Altının, dövizin,', D5.milk]], 110, 360, 56, {}, ease(u, 0.25, 0.9, E.lin));
    d5_headA(g, [['tüm varlıkların', D5.milk]], 110, 438, 56, {}, ease(u, 1.3, 0.8, E.lin));
    d5_headA(g, [['Kasam’da.', 'org']], 110, 516, 56, {}, ease(u, 2.1, 0.7, E.lin));
    d5_tA(g, 'Güvenle takip et.', 114, 580, 30, D5.soft, { w: 700 }, ease(u, 2.9, 0.6, E.lin));
    const ba = ease(u, 3.2, 0.4);
    if (ba > 0) {
      g.save(); g.translate(275, 682); const s = 0.85 + 0.15 * E.outBack(ba); g.scale(s, s); g.translate(-275, -682);
      d5_orBtn(g, 110, 640, 330, 84, 'Kasamı Gör', 30, { a: ba, shine: ease(u, 3.55, 0.7, E.inOutCubic) });
      g.restore();
    }
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'whoosh', { gain: 0.4 });
    cue(t0 + 0.2, 'zip', { gain: 0.3 });
    S6_COINS.forEach(([, , , , , t]) => cue(t0 + t, 'coin', { gain: 0.32 }));
    cue(t0 + 0.85, 'counter', { gain: 0.22, dur: 1.4 });
    cue(t0 + 3.2, 'pop', { gain: 0.35 });
    cue(t0 + 3.55, 'shine', { gain: 0.3 });
  },
};
