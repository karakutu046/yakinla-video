'use strict';
/* Scene 7 · Alarm ve analiz — "Alarmını kur, analizleri incele, fırsatları yakala!"
 * The gram-gold chart draws on candle by candle; the orange alarm line is set; when the last
 * candle crosses ₺6.500 a glass notification drops in and the glossy bell rings. */

const S7_HIT = 1.75;    // the price crosses the alarm line

function s7_chart(x, w, h, u) {
  d5_goldIcon(x, 50, 54, 24);
  d5_u(x, 'Gram Altın', 86, 50, 24, D5A.ink, { w: 700 });
  d5_u(x, 'Kapalıçarşı · canlı', 86, 74, 14, D5A.sec, { w: 500 });
  text(x, '₺6.510,83', w - 28, 58, { f: D5I, w: 700, s: 34, a: 'right', c: D5A.ink, ls: -0.5 });
  d5_chg(x, w - 28, 88, '+0,40%', 15);
  let cx = 28;
  [['Teknik analiz', true], ['Hisse analizi'], ['Fiyat tahmini']].forEach(([l, on]) => {
    const tw = d5_uw(x, l, 14, 700) + 28;
    rr(x, cx, 112, tw, 34, 17); x.fillStyle = on ? D5A.badge : D5A.track2; x.fill();
    d5_u(x, l, cx + tw / 2, 134, 14, on ? D5A.lav : D5A.sec, { w: 700, a: 'center' });
    cx += tw + 8;
  });
  const G = { x0: 28, x1: w - 92, y0: 172, y1: h - 34 }, lo = 6400, hi = 6550;
  const Y = v => lerp(G.y1, G.y0, (v - lo) / (hi - lo));
  [6420, 6460, 6540].forEach(v => { x.fillStyle = D5A.hair; x.fillRect(G.x0, Y(v), G.x1 - G.x0, 1.2); d5_u(x, v.toLocaleString('tr-TR'), w - 28, Y(v) + 5, 13, D5A.sec, { w: 500, a: 'right' }); });
  const C = d5_candles(36, 7714), bw = (G.x1 - G.x0) / C.length;
  // candles appear left to right; the last one lands as the alarm fires
  const shown = C.length * ease(u, 0.15, S7_HIT - 0.15, E.lin);
  const ma = C.map((_, i) => { const s = C.slice(Math.max(0, i - 6), i + 1); return s.reduce((a, b) => a + b.c, 0) / s.length; });
  const mpts = ma.map((v, i) => [G.x0 + (i + 0.5) * bw, Y(v)]).slice(0, Math.max(0, Math.ceil(shown)));
  if (mpts.length > 1) d5_spark(x, mpts, D5A.lav, 2.4, { glow: 0 });
  C.forEach((k, i) => {
    const a = clamp(shown - i);
    if (a <= 0) return;
    const up = k.c >= k.o, col = up ? D5A.up : D5A.dn, cxx = G.x0 + (i + 0.5) * bw;
    x.save(); x.globalAlpha = a;
    const c = lerp(k.o, k.c, E.outCubic(a));
    x.fillStyle = col; x.fillRect(cxx - 0.9, Y(k.h), 1.8, Y(k.l) - Y(k.h));
    rr(x, cxx - bw * 0.32, Y(Math.max(k.o, c)), bw * 0.64, Math.max(2, Math.abs(Y(k.o) - Y(c))), 1.5); x.fill();
    x.restore();
  });
  // alarm line at 6.500, drawn in early
  const lp = ease(u, 0.55, 0.6, E.inOutCubic), ay = Y(6500), hit = u >= S7_HIT;
  if (lp > 0) {
    x.save(); x.setLineDash([8, 6]); x.strokeStyle = D5A.or; x.lineWidth = 2.2 + (hit ? 1.5 * kick(u - S7_HIT, 4) : 0);
    x.beginPath(); x.moveTo(G.x0, ay); x.lineTo(lerp(G.x0, w - 20, lp), ay); x.stroke(); x.restore();
    const lab = 'Alarm ₺6.500', lw = d5_uw(x, lab, 14, 700) + 46, la = ease(u, 0.85, 0.3);
    x.save(); x.globalAlpha = la;
    rr(x, G.x0 + 8, ay + 10, lw, 32, 16); x.fillStyle = D5A.or; x.fill();
    d5_icon(x, 'bell', G.x0 + 26, ay + 26, 15, '#FFFFFF', 1.8);
    d5_u(x, lab, G.x0 + 40, ay + 31, 14, '#FFFFFF', { w: 700 });
    x.restore();
  }
  if (shown >= C.length - 0.01) {
    const last = C[C.length - 1], ly = Y(last.c);
    d5_ping(x, G.x0 + (C.length - 0.5) * bw, ly, 30, clamp((u - S7_HIT) / 0.8), D5A.or, 3);
    rr(x, w - 88, ly - 14, 80, 28, 8); x.fillStyle = D5A.up; x.fill();
    d5_u(x, '6.510,83', w - 48, ly + 5, 13, '#FFFFFF', { w: 700, a: 'center' });
  }
}

SCENES[7] = {
  title: 'Alarm ve analiz', key: 3.7,
  fast: [[0, 0.4], [S7_HIT, S7_HIT + 0.35]],
  draw(g, u, D) {
    d5_bg(g, [[1250, 600, 950, D5.lav, 0.52, 0.7], [1700, 160, 600, D5.or, 0.3], [200, 980, 650, D5.teal, 0.3]], { key: 's7', seed: 71, bokeh: 34, t: u, cam: [-u * 8, 0, u * 0.006] });
    d5_coinSoft(g, 880 + flo(u, 1, 8), 960 + flo(u, 2, 8), 40, { col: 'gold', tilt: 0.5, rot: 0.3 + u * 0.2, label: 'Au' }, 5, 0.55);
    const cp = spring(u + 0.05, 1.1, 6.5), ca = ease(u, -0.12, 0.3);
    const pose = fly({ x: 1290 + flo(u, 3, 5), y: 640 + flo(u, 4, 6), z: 120, rx: 0.06, ry: -0.26 + flo(u, 5, 0.02), rz: 0.006 }, cp, { x: 480, z: 500, ry: -0.5 });
    d5_card3L(g, (x, w, h) => s7_chart(x, w, h, u), 860, 560, pose, { dark: 0.4, shadow: 0.6, a: ca, key: 's7chart', dyn: true });
    // the notification drops in when the alarm fires
    const dt = u - S7_HIT, np = spring(dt, 1.2, 6);
    if (dt > 0) {
      d5_snap(g);
      const nx = 1130, ny = 98 - (1 - np) * 260, nw = 690, nh = 150;
      addGlow(g, D5.or, nx + 70, ny + 75, 200, 0.35 * clamp(dt * 4));
      g.save(); g.globalAlpha *= clamp(dt * 5);
      d5_card(g, nx, ny, nw, nh, 36, { dark: 0.6, sheen: 0.2 }, () => {
        d5_appIcon(g, nx + 76, ny + 75, 84, { shadow: 0.25 });
        d5_t(g, 'KRİPTO724', nx + 140, ny + 46, 16, D5.soft, { w: 800, ls: 1.6 });
        d5_t(g, 'şimdi', nx + nw - 32, ny + 46, 16, D5.soft, { w: 700, a: 'right' });
        d5_t(g, 'Fiyat alarmı', nx + 140, ny + 84, 26, D5.milk, { w: 800 });
        d5_t(g, 'Gram Altın ₺6.500’ü geçti: ₺6.510,83', nx + 140, ny + 120, 22, D5.milk, { w: 600 });
      });
      g.restore();
    }
    const bp = spring(u - 0.3, 1.3, 6);
    if (bp > 0) {
      const sw = dt > 0 ? Math.sin(dt * 22) * 0.4 * Math.exp(-dt * 2.6) : 0;
      d5_bell(g, 1060 + flo(u, 6, 6), 210 + flo(u, 7, 8), clamp(bp, 0, 1.15), sw);
      if (dt > 0) {
        const wa = clamp(1 - dt / 1.6);
        g.save(); g.globalAlpha *= wa; g.strokeStyle = hexA(D5.or, 0.75); g.lineWidth = 3; g.lineCap = 'round';
        [[70, -0.9, -0.2], [92, -0.85, -0.25]].forEach(([r, a0, a1], i) => {
          const rr2 = r + ((dt * 60 + i * 12) % 30);
          g.beginPath(); g.arc(1060, 200, rr2, a0, a1); g.stroke(); g.beginPath(); g.arc(1060, 200, rr2, Math.PI - a1, Math.PI - a0); g.stroke();
        });
        g.restore();
      }
    }
    // copy
    d5_kA(g, 'ALARM · ANALİZ', 116, 186, 20, D5.tealD, ease(u, 0.1, 0.6));
    d5_headA(g, [['Alarmını kur,', D5.milk]], 110, 266, 58, {}, ease(u, 0.2, 0.8, E.lin));
    d5_headA(g, [['analizleri incele,', D5.milk]], 110, 344, 58, {}, ease(u, 1.15, 0.8, E.lin));
    d5_headA(g, [['fırsatları yakala!', 'org']], 110, 422, 58, {}, ease(u, 2.2, 0.7, E.lin));
    const s = 0.72;
    [['Hisse analizi', 'stock', 110, 508], ['Teknik analiz', 'candle', 110, 584], ['Fiyat tahmini', 'target', 420, 508], ['Sinyal alarmları', 'bell', 420, 584]].forEach(([l, ic, x, y], i) => {
      const a = ease(u, 1.4 + i * 0.1, 0.35);
      if (a <= 0) return;
      d5_snap(g);
      g.save(); g.globalAlpha *= a; g.translate(0, (1 - E.outBack(a)) * 24);
      d5_pill(g, x, y, l, ic, s, { left: true });
      g.restore();
    });
    const na = spring(u - 2.6, 1.1, 6.5);
    if (na > 0) {
      d5_snap(g);
      d5_card3(g, d5_tex(560, 260, d5_newsTex, 1.5, 0, 'news'), fly({ x: 400 + flo(u, 8, 5), y: 810 + flo(u, 9, 6), z: -40, rx: 0.05, ry: 0.16, rz: -0.01 }, na, { y: 300, z: 300, rx: -0.3 }), { r: 30, dark: 0.45, a: ease(u, 2.6, 0.3) });
    }
    d5_finish(g);
  },
  cues(cue, t0) {
    cue(t0 + 0.0, 'whoosh', { gain: 0.4 });
    cue(t0 + 0.3, 'pop', { gain: 0.25 });
    cue(t0 + 0.55, 'zip', { gain: 0.25 });
    cue(t0 + S7_HIT, 'ding', { gain: 0.55 });
    cue(t0 + S7_HIT + 0.05, 'success', { gain: 0.3 });
    for (let i = 0; i < 4; i++) cue(t0 + 1.4 + i * 0.1, 'tick', { gain: 0.2 });
    cue(t0 + 2.6, 'swish', { gain: 0.3 });
  },
};
