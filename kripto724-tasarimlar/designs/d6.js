'use strict';
/* TASARIM 06 · İSTANBUL GECESİ (brief v2: kripto724)
 * Boğaz'da bir gece, katmanlı düz vektör illüstrasyon. Her katman ayrı bir fonksiyon:
 * gökyüzü (d6_sky), arka tepeler (d6_hills), köprü (d6_bridge), orta silüet (d6_apts, d6_galata),
 * su + yansıma (d6_water, d6_float), ön plan (d6_ferry, d6_gull, d6_iskele). Canlandırmada her katman
 * kendi hızında kayar (parallax). Şehrin turuncu ışıkları kripto724'ün verisine dönüşür: kripto hiç
 * sönmeyen ışıklar, BIST şehrin kendisi, Nasdaq okyanusu aşan bir ışık yayı, altın Kapalıçarşı'da.
 * Uygulama ekranları (d6_cryptoCard, d6_borsa, d6_goldCard, d6_kasam …) uygulamanın açık temasıyla,
 * Inter ile ve ekran görüntülerindeki verilerle çizilir. Logo her zaman resmî logo() / logoH(). */

const D6 = {
  bg: '#0B1030', navy: '#0D1333', deep: '#060A1F', teal: '#1FB5A8', or: '#F7931A', orL: '#FFB45C', orW: '#FFE4BE',
  red: '#E30A17', paper: '#F4F1EA',
  soft: '#A2AACB', dim: '#5E6797', far: '#28306E', mid: '#1B2256', near: '#131A46', fore: '#0A0F2D', lav: '#7D87C9',
};
const D6_SERIF = 'DM Serif Display', D6_SANS = 'Manrope';
const D6_STONE = k => mixHex('#1A2052', '#E8AE6E', k);

/* ───────────── type ───────────── */
function d6_sans(g, s, x, y, size, col, o = {}) {
  text(g, s, x, y, { f: D6_SANS, w: o.w || 600, s: size, a: o.a || 'left', b: o.b, c: col, ls: o.ls || 0 });
}
function d6_serif(g, s, x, y, size, col, o = {}) {
  const f = { f: D6_SERIF, w: 400, it: !!o.it, s: size, a: o.a || 'left', c: col, ls: o.ls == null ? -0.5 : o.ls };
  if (o.sh) { g.save(); g.shadowColor = `rgba(8,10,34,${o.sh})`; g.shadowBlur = size * 0.35; g.shadowOffsetY = size * 0.05; text(g, s, x, y, f); g.restore(); }
  if (o.glow) { g.save(); g.shadowColor = hexA(o.gc || D6.or, o.glow); g.shadowBlur = size * 0.5; text(g, s, x, y, f); g.restore(); }
  text(g, s, x, y, f);
}
// one serif line made of runs: [[string, italic, colour, glow], ...]
function d6_runs(g, runs, x, y, size, a = 'left', o = {}) {
  const fo = r => ({ f: D6_SERIF, w: 400, it: !!r[1], s: size, ls: -0.5 });
  const ws = runs.map(r => measure(g, r[0], fo(r)));
  const tot = ws.reduce((p, q) => p + q, 0);
  let px = a === 'center' ? x - tot / 2 : a === 'right' ? x - tot : x;
  runs.forEach((r, i) => { d6_serif(g, r[0], px, y, size, r[2] || D6.paper, { it: r[1], glow: r[3], sh: o.sh }); px += ws[i]; });
  return tot;
}
function d6_kicker(g, s, x, y, col = D6.or, o = {}) {
  const S = s.toLocaleUpperCase('tr'), size = o.s || 22;
  const tw = measure(g, S, { f: D6_SANS, w: 800, s: size, ls: 4 }) + 26;
  const x0 = o.a === 'center' ? x - tw / 2 : x;
  addGlow(g, col, x0 + 6, y - size * 0.36, 22, 0.6);
  g.fillStyle = col; g.beginPath(); g.arc(x0 + 6, y - size * 0.36, 5, 0, TAU); g.fill();
  d6_sans(g, S, x0 + 26, y, size, col, { w: 800, ls: 4 });
}
function d6_arrow(g, x, y, s, col, lw = 3, both = false) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y);
  g.moveTo(x + s * 0.55, y - s * 0.45); g.lineTo(x + s, y); g.lineTo(x + s * 0.55, y + s * 0.45);
  if (both) { g.moveTo(x - s * 0.55, y - s * 0.45); g.lineTo(x - s, y); g.lineTo(x - s * 0.55, y + s * 0.45); }
  g.stroke(); g.restore();
}
function d6_star(g, x, y, r, col) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  g.closePath(); g.fill();
}
// rounded tag with a pointer (ferry names, callouts); (x, y) = pointer tip. o.check: teal tick in front.
function d6_tag(g, s, x, y, size, o = {}) {
  const col = o.col || D6.or, ck = o.check ? size * 1.35 : 0;
  const tw = measure(g, s, { f: D6_SANS, w: 800, s: size }), pw = tw + size * 1.4 + ck, ph = size * 1.9, py = y - ph - size * 0.45;
  g.save();
  g.shadowColor = hexA(col, 0.45); g.shadowBlur = 18;
  rr(g, x - pw / 2, py, pw, ph, ph / 2); g.fillStyle = o.fill || 'rgba(10,15,45,0.94)'; g.fill();
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = hexA(col, 0.85); rr(g, x - pw / 2, py, pw, ph, ph / 2); g.stroke();
  g.fillStyle = hexA(col, 0.85);
  g.beginPath(); g.moveTo(x - size * 0.35, py + ph); g.lineTo(x, y); g.lineTo(x + size * 0.35, py + ph); g.closePath(); g.fill();
  if (ck) {
    const cx = x - pw / 2 + size * 0.7 + size * 0.45, cy = py + ph / 2;
    g.fillStyle = D6.teal; g.beginPath(); g.arc(cx, cy, size * 0.5, 0, TAU); g.fill();
    check(g, cx, cy, size * 0.5, D6.navy, Math.max(2, size * 0.14));
  }
  d6_sans(g, s, x + ck / 2, py + ph / 2 + size * 0.36, size, o.c || D6.paper, { w: 800, a: 'center' });
  return { x0: x - pw / 2, y0: py, w: pw, h: ph };
}

/* ───────────── sky, moon ───────────── */
function d6_sky(g, hz, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, hz);
  (o.stops || [[0, '#050818'], [0.5, '#0B1131'], [0.82, '#19215A'], [1, '#2D2B63']]).forEach(([p, c]) => gr.addColorStop(p, c));
  g.fillStyle = gr; g.fillRect(0, 0, W, hz + 4);
  if (o.haze !== 0) {
    const hg = g.createLinearGradient(0, hz - 260, 0, hz);
    hg.addColorStop(0, 'rgba(247,147,26,0)'); hg.addColorStop(1, `rgba(247,147,26,${o.haze || 0.13})`);
    g.fillStyle = hg; g.fillRect(0, hz - 260, W, 264);
  }
  const r = mulberry32(o.seed || 11), n = o.stars == null ? 170 : o.stars;
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = Math.pow(r(), 1.3) * hz * 0.82, big = r() < 0.06, rad = 0.6 + r() * 0.9;
    const a = (0.25 + r() * 0.7) * (1 - y / hz) * (o.starA == null ? 1 : o.starA);
    if (big) { sparkle(g, x, y, 5 + rad * 2, hexA(D6.paper, a)); addGlow(g, D6.paper, x, y, 12, a * 0.5); }
    else { g.fillStyle = hexA(D6.paper, a); g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); }
  }
}
function d6_moon(g, x, y, r) {
  addGlow(g, D6.paper, x, y, r * 6, 0.18);
  addGlow(g, D6.orL, x, y, r * 2.6, 0.26);
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, '#FFFCF2'); gr.addColorStop(1, '#EADFC6');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = 'rgba(150,140,130,0.16)';
  [[-0.32, -0.18, 0.28], [0.28, 0.12, 0.22], [-0.05, 0.42, 0.15], [0.36, -0.38, 0.12], [-0.45, 0.3, 0.1]].forEach(([a, b, c]) => {
    g.beginPath(); g.arc(x + a * r, y + b * r, c * r, 0, TAU); g.fill();
  });
}

/* ───────────── hills (back layers) ───────────── */
function d6_ridge(o) {
  const s = o.seed || 1, f = o.f || 1;
  return x => {
    let e = 1;
    if (o.env) {
      const [a, b, c, d] = o.env;
      e = Math.min(E.inOutSine(clamp((x - a) / ((b - a) || 1))), 1 - E.inOutSine(clamp((x - c) / ((d - c) || 1))));
    }
    const n = 0.62 + 0.2 * Math.sin(x * 0.0024 * f + s) + 0.12 * Math.sin(x * 0.0067 * f + s * 2.1) + 0.06 * Math.sin(x * 0.021 * f + s * 4.7);
    return o.base - o.h * n * e;
  };
}
// window light colour: mostly brand orange and its light tint, a few white and teal ones
function d6_lightCol(k) { return k < 0.42 ? D6.or : k < 0.76 ? D6.orL : k < 0.9 ? D6.paper : D6.teal; }
// hill silhouette with a city of little blocks on it and window lights
function d6_hills(g, o) {
  const R = d6_ridge(o), x0 = o.x0 == null ? -20 : o.x0, x1 = o.x1 == null ? W + 20 : o.x1, base = o.base;
  const r = mulberry32((o.seed || 1) * 131 + 7), sc = o.sc || 1;
  g.fillStyle = o.col;
  g.beginPath(); g.moveTo(x0, base + 2);
  for (let x = x0; x <= x1 + 6; x += 6) g.lineTo(Math.min(x, x1), R(Math.min(x, x1)));
  g.lineTo(x1, base + 2); g.closePath(); g.fill();
  const blocks = [];
  if (o.blocks) {
    let x = x0;
    const lite = mixHex(o.col, D6.paper, 0.05), dark = mixHex(o.col, '#000000', 0.14);
    while (x < x1) {
      const bw = (9 + r() * 16) * sc, ry = Math.min(R(x), R(Math.min(x + bw, x1))), bh = (3 + r() * o.blocks * 0.8) * sc, k = r(), gap = r() < 0.35 ? 1.2 * sc : 0;
      if (base - ry > 5) {
        g.fillStyle = o.col; g.fillRect(x, ry - bh, bw + 0.6, base - ry + bh + 2);
        if (k < 0.3 || k > 0.62) { g.fillStyle = k < 0.3 ? lite : dark; g.fillRect(x, ry - bh, bw - gap, bh + 6 * sc); }
        if (r() < 0.3) { g.beginPath(); g.moveTo(x - 0.5, ry - bh); g.lineTo(x + bw / 2, ry - bh - bw * 0.3); g.lineTo(x + bw - gap + 0.5, ry - bh); g.fill(); }
        blocks.push([x, ry - bh, bw]);
      }
      x += bw;
    }
    g.fillStyle = o.col;
  }
  if (o.mosque) d6_mosque(g, o.mosque[0], R(o.mosque[0]) + 3, o.mosque[1], o.col);
  const n = o.lights || 0, la = o.lightA == null ? 0.9 : o.lightA;
  const light = (x, y) => {
    const col = d6_lightCol(r());
    const a = la * (0.3 + r() * 0.7), s = (0.9 + r() * 1.5) * sc;
    g.fillStyle = hexA(col, a); g.fillRect(x, y, s * 1.4, s);
    if (r() < 0.1) addGlow(g, col, x, y, 10 * sc, a * 0.35);
  };
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), top = R(x) + 3 * sc;
    if (base - top < 5) continue;
    light(x, lerp(top, base - 3, Math.pow(r(), 0.75)));
  }
  if (n) for (const [bx, by, bw] of blocks) if (r() < 0.6) light(bx + r() * bw * 0.8, by + 2 * sc + r() * 6 * sc);
  return R;
}
// small, distant mosque silhouette (only ever as part of the skyline)
function d6_mosque(g, x, by, s, col) {
  g.fillStyle = col;
  g.fillRect(x - s * 0.55, by - s * 0.2, s * 1.1, s * 0.2 + 3);
  g.beginPath(); g.ellipse(x - s * 0.33, by - s * 0.2, s * 0.17, s * 0.11, 0, Math.PI, TAU); g.fill();
  g.beginPath(); g.ellipse(x + s * 0.33, by - s * 0.2, s * 0.17, s * 0.11, 0, Math.PI, TAU); g.fill();
  g.fillRect(x - s * 0.3, by - s * 0.32, s * 0.6, s * 0.13);
  g.beginPath(); g.ellipse(x, by - s * 0.32, s * 0.3, s * 0.26, 0, Math.PI, TAU); g.fill();
  g.fillRect(x - 0.6, by - s * 0.66, 1.2, s * 0.1);
  for (const m of [-0.78, 0.78]) {
    const mx = x + m * s, mw = Math.max(1.6, s * 0.045);
    g.fillRect(mx - mw / 2, by - s * 0.92, mw, s * 0.92);
    g.fillRect(mx - mw, by - s * 0.7, mw * 2, Math.max(1, s * 0.025));
    g.beginPath(); g.moveTo(mx - mw / 2, by - s * 0.92); g.lineTo(mx, by - s * 1.08); g.lineTo(mx + mw / 2, by - s * 0.92); g.fill();
  }
}

/* ───────────── landmarks ───────────── */
// Galata Tower: x = centre, by = base, s = height. Returns the gallery centre.
function d6_galata(g, x, by, s, o = {}) {
  const bw = s * 0.25, t1 = by - s * 0.56, t2 = t1 - s * 0.13, t3 = t2 - s * 0.03, apex = by - s * 0.95;
  const sil = o.sil;
  const body = () => { g.beginPath(); g.moveTo(x - bw * 0.56, by); g.lineTo(x - bw / 2, t1); g.lineTo(x + bw / 2, t1); g.lineTo(x + bw * 0.56, by); g.closePath(); };
  if (sil) g.fillStyle = sil;
  else {
    const gb = g.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
    gb.addColorStop(0, D6_STONE(0.14)); gb.addColorStop(0.3, D6_STONE(0.58)); gb.addColorStop(0.62, D6_STONE(0.36)); gb.addColorStop(1, D6_STONE(0.07));
    g.fillStyle = gb;
  }
  body(); g.fill();
  if (!sil) {
    const gv = g.createLinearGradient(0, by, 0, t1); gv.addColorStop(0, 'rgba(247,147,26,0.3)'); gv.addColorStop(1, 'rgba(247,147,26,0)');
    g.fillStyle = gv; body(); g.fill();
    g.save(); body(); g.clip();
    g.strokeStyle = 'rgba(10,14,40,0.16)'; g.lineWidth = 1;
    for (let y = by - s * 0.05; y > t1; y -= s * 0.04) { g.beginPath(); g.moveTo(x - bw, y); g.lineTo(x + bw, y); g.stroke(); }
    g.restore();
    [[0.18, -0.1], [0.3, 0.16], [0.42, -0.06], [0.08, 0.2]].forEach(([f, dx]) => {
      const wy = by - (by - t1) * f - s * 0.05, wx = x + dx * bw;
      g.fillStyle = 'rgba(20,16,40,0.7)'; rr(g, wx - s * 0.012, wy, s * 0.024, s * 0.05, s * 0.012); g.fill();
      g.fillStyle = hexA(D6.orL, 0.8); rr(g, wx - s * 0.008, wy + s * 0.006, s * 0.016, s * 0.04, s * 0.008); g.fill();
    });
  }
  // gallery with arched windows
  g.fillStyle = sil || D6_STONE(0.26); g.fillRect(x - bw * 0.54, t2, bw * 1.08, t1 - t2);
  if (!sil) {
    addGlow(g, D6.or, x, (t1 + t2) / 2, bw * 1.7, 0.55);
    for (let i = 0; i < 4; i++) {
      const wx = x - bw * 0.39 + i * bw * 0.26, ww = bw * 0.13, wh = (t1 - t2) * 0.64, wy = t1 - (t1 - t2) * 0.16;
      g.fillStyle = i === 1 ? D6.orW : D6.orL;
      g.beginPath(); g.moveTo(wx - ww / 2, wy); g.lineTo(wx - ww / 2, wy - wh + ww / 2); g.arc(wx, wy - wh + ww / 2, ww / 2, Math.PI, TAU); g.lineTo(wx + ww / 2, wy); g.fill();
    }
  }
  g.fillStyle = sil || D6_STONE(0.62); g.fillRect(x - bw * 0.64, t1 - 2, bw * 1.28, Math.max(2, s * 0.012));
  g.fillStyle = sil || D6_STONE(0.42); g.fillRect(x - bw * 0.6, t3, bw * 1.2, t2 - t3);
  // conical cap
  if (sil) g.fillStyle = sil;
  else { const gc = g.createLinearGradient(x - bw * 0.6, 0, x + bw * 0.6, 0); gc.addColorStop(0, '#2C336C'); gc.addColorStop(0.32, '#4B4F86'); gc.addColorStop(1, '#141A45'); g.fillStyle = gc; }
  g.beginPath(); g.moveTo(x - bw * 0.6, t3);
  g.quadraticCurveTo(x - bw * 0.16, t3 - (t3 - apex) * 0.45, x, apex);
  g.quadraticCurveTo(x + bw * 0.16, t3 - (t3 - apex) * 0.45, x + bw * 0.6, t3); g.closePath(); g.fill();
  g.strokeStyle = sil || D6_STONE(0.7); g.lineWidth = Math.max(1.5, s * 0.008);
  g.beginPath(); g.moveTo(x, apex); g.lineTo(x, by - s); g.stroke();
  g.fillStyle = sil || D6_STONE(0.8); g.beginPath(); g.arc(x, apex - s * 0.012, Math.max(1.5, s * 0.01), 0, TAU); g.fill();
  return [x, (t1 + t2) / 2];
}
// Maiden's Tower on its rock; o.sil = silhouette colour (dawn). Returns the lantern position.
function d6_kiz(g, x, wy, s, o = {}) {
  const sil = o.sil;
  g.fillStyle = sil || '#0A0E28';
  g.beginPath(); g.moveTo(x - s * 0.78, wy + 2); g.quadraticCurveTo(x - s * 0.66, wy - s * 0.07, x - s * 0.34, wy - s * 0.055);
  g.lineTo(x + s * 0.34, wy - s * 0.055); g.quadraticCurveTo(x + s * 0.5, wy - s * 0.05, x + s * 0.6, wy + 2); g.closePath(); g.fill();
  g.fillStyle = sil || D6_STONE(0.28); g.fillRect(x - s * 0.62, wy - s * 0.2, s * 0.5, s * 0.15);
  g.fillStyle = sil || '#1E2456';
  g.beginPath(); g.moveTo(x - s * 0.65, wy - s * 0.2); g.lineTo(x - s * 0.58, wy - s * 0.25); g.lineTo(x - s * 0.15, wy - s * 0.25); g.lineTo(x - s * 0.1, wy - s * 0.2); g.fill();
  g.fillStyle = sil || D6_STONE(0.2); g.fillRect(x + s * 0.08, wy - s * 0.12, s * 0.38, s * 0.07);
  // flag pole with a tiny red pennant
  g.fillStyle = sil || D6.paper; g.fillRect(x - s * 0.5, wy - s * 0.42, Math.max(1, s * 0.006), s * 0.17);
  g.fillStyle = sil ? sil : D6.red; g.fillRect(x - s * 0.5, wy - s * 0.42, s * 0.07, s * 0.045);
  const tw = s * 0.2, tb = wy - s * 0.05, tt = wy - s * 0.56;
  if (sil) g.fillStyle = sil;
  else {
    const gb = g.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0);
    gb.addColorStop(0, D6_STONE(0.18)); gb.addColorStop(0.32, D6_STONE(0.62)); gb.addColorStop(1, D6_STONE(0.1)); g.fillStyle = gb;
  }
  g.fillRect(x - tw / 2, tt, tw, tb - tt);
  if (!sil) {
    const gv = g.createLinearGradient(0, tb, 0, tt); gv.addColorStop(0, 'rgba(247,147,26,0.32)'); gv.addColorStop(1, 'rgba(247,147,26,0.02)');
    g.fillStyle = gv; g.fillRect(x - tw / 2, tt, tw, tb - tt);
    for (let i = 0; i < 4; i++) { g.fillStyle = hexA(D6.orL, i === 2 ? 0.5 : 0.9); rr(g, x - s * 0.57 + i * s * 0.11, wy - s * 0.17, s * 0.045, s * 0.07, s * 0.02); g.fill(); }
    [[0.22, -0.2], [0.22, 0.2], [0.4, 0]].forEach(([f, dx]) => {
      g.fillStyle = hexA(D6.orL, 0.85); rr(g, x + dx * tw - s * 0.016, tb - (tb - tt) * f - s * 0.06, s * 0.032, s * 0.06, s * 0.016); g.fill();
    });
  }
  g.fillStyle = sil || D6_STONE(0.55); g.fillRect(x - tw * 0.62, tt - s * 0.012, tw * 1.24, s * 0.018);
  const lw = s * 0.13, lt = tt - s * 0.11;
  g.fillStyle = sil || D6_STONE(0.45); g.fillRect(x - lw / 2, lt, lw, tt - lt);
  if (!sil) {
    addGlow(g, D6.or, x, (lt + tt) / 2, s * 0.32, 0.85);
    for (const dx of [-0.26, 0.26]) { g.fillStyle = D6.orW; rr(g, x + dx * lw - s * 0.016, lt + s * 0.025, s * 0.032, s * 0.065, s * 0.016); g.fill(); }
  }
  g.fillStyle = sil || D6_STONE(0.55); g.fillRect(x - lw * 0.62, lt - s * 0.01, lw * 1.24, s * 0.014);
  g.fillStyle = sil || '#2A3069';
  g.beginPath(); g.moveTo(x - lw * 0.55, lt - s * 0.01);
  g.quadraticCurveTo(x - lw * 0.55, lt - s * 0.09, x, lt - s * 0.13);
  g.quadraticCurveTo(x + lw * 0.55, lt - s * 0.09, x + lw * 0.55, lt - s * 0.01); g.fill();
  g.fillRect(x - 0.8, lt - s * 0.2, 1.6, s * 0.08);
  return [x, (lt + tt) / 2];
}

/* ───────────── the Bosphorus Bridge ─────────────
 * Two portal towers, a parabolic main cable, side spans and the inclined (zigzag) hangers.
 * o.lit 0..1: cable lights on from left to right (bright wave front). Returns the cable y(x). */
function d6_bridge(g, o) {
  const { xa, xb, top, deck } = o;
  const hgt = deck - top, span = xb - xa, xm = (xa + xb) / 2, sc = hgt / 300;
  const base = o.base == null ? deck + hgt * 0.3 : o.base;
  const ancL = o.ancL == null ? xa - span * 0.3 : o.ancL, ancR = o.ancR == null ? xb + span * 0.3 : o.ancR;
  const lit = o.lit == null ? 1 : o.lit, lc = o.lc || D6.or, sil = o.sil, la = o.la == null ? 1 : o.la;
  const steel = sil || o.col || '#2E3878';
  const cy = x => {
    if (x >= xa && x <= xb) { const u = (x - xm) / (span / 2); return deck - hgt * 0.05 - hgt * 0.95 * u * u; }
    const u = x < xa ? clamp((xa - x) / (xa - ancL)) : clamp((x - xb) / (ancR - xb));
    return lerp(top, deck - 2, u) + hgt * 0.06 * Math.sin(Math.PI * u);
  };
  const dh = Math.max(3, hgt * 0.045);
  const d0 = o.d0 == null ? ancL - span * 0.2 : o.d0, d1 = o.d1 == null ? ancR + span * 0.2 : o.d1;
  for (const tx of [xa, xb]) {
    const wb = hgt * 0.12, wt = hgt * 0.075, lw = Math.max(2, hgt * 0.024), t0 = top - hgt * 0.025;
    const half = y => lerp(wt / 2, wb / 2, (y - t0) / (base - t0));
    if (sil) g.fillStyle = sil;
    else { const tg = g.createLinearGradient(0, t0, 0, base); tg.addColorStop(0, mixHex(steel, D6.paper, 0.38)); tg.addColorStop(0.7, steel); g.fillStyle = tg; }
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(tx + s * wt / 2 - lw / 2, t0); g.lineTo(tx + s * wt / 2 + lw / 2, t0);
      g.lineTo(tx + s * wb / 2 + lw / 2, base); g.lineTo(tx + s * wb / 2 - lw / 2, base); g.fill();
    }
    for (const y of [t0 + lw * 0.5, lerp(t0, deck, 0.36), lerp(t0, deck, 0.7), deck + dh + lw]) {
      const hw = half(y); g.fillRect(tx - hw, y - lw * 0.45, hw * 2, lw * 0.9);
    }
    if (!sil && o.beacon !== false) { g.fillStyle = D6.red; g.beginPath(); g.arc(tx, t0 - 3, Math.max(1.6, 2.4 * sc), 0, TAU); g.fill(); addGlow(g, D6.red, tx, t0 - 3, 16 * sc + 6, 0.8 * la); }
  }
  g.fillStyle = steel; g.fillRect(d0, deck, d1 - d0, dh);
  g.fillStyle = sil || 'rgba(0,0,0,0.25)'; g.fillRect(d0, deck + dh * 0.6, d1 - d0, dh * 0.4);
  g.strokeStyle = sil ? hexA('#000000', 0.25) : hexA(D6.paper, 0.2 * la); g.lineWidth = Math.max(0.6, 0.9 * sc);
  g.beginPath();
  const zig = (a, b, n) => {
    const st = (b - a) / n;
    for (let i = 0; i < n; i++) {
      const xi = a + i * st, xj = xi + st, xh = xi + st / 2;
      g.moveTo(xi, cy(xi)); g.lineTo(xh, deck); g.lineTo(xj, cy(xj));
    }
  };
  zig(xa, xb, o.hangers || 30); zig(ancL, xa, Math.round((o.hangers || 30) * 0.28)); zig(xb, ancR, Math.round((o.hangers || 30) * 0.28));
  g.stroke();
  const cablePath = () => { g.beginPath(); for (let x = ancL; x <= ancR + 1; x += 4) { const xx = Math.min(x, ancR); x === ancL ? g.moveTo(xx, cy(xx)) : g.lineTo(xx, cy(xx)); } };
  g.lineWidth = Math.max(1.2, 2.4 * sc); g.strokeStyle = sil || hexA(D6.paper, 0.45 * la); cablePath(); g.stroke();
  if (!sil && lit > 0) {
    const xl = lerp(ancL, ancR, lit);
    g.save(); g.beginPath(); g.rect(0, 0, xl, H); g.clip();
    g.shadowColor = lc; g.shadowBlur = 14 * sc + 4; g.strokeStyle = hexA(lc, 0.85 * la); cablePath(); g.stroke();
    g.restore();
  }
  const litPts = [];
  if (!sil && o.lights !== false) {
    const nl = o.nl || 44, pts = [];
    for (let i = 0; i <= nl; i++) pts.push(lerp(xa, xb, i / nl));
    const ns = Math.round(nl * 0.3);
    for (let i = 1; i < ns; i++) { pts.push(lerp(xa, ancL, i / ns)); pts.push(lerp(xb, ancR, i / ns)); }
    for (const x of pts) {
      const u = (x - ancL) / (ancR - ancL), y = cy(x);
      if (u <= lit) {
        const front = clamp(1 - (lit - u) / 0.07), r0 = Math.max(1.3, 2 * sc);
        litPts.push([x, y]);
        addGlow(g, lc, x, y, (12 + 26 * front) * sc + 4, (0.55 + 0.45 * front) * la);
        g.fillStyle = front > 0.2 ? '#FFFFFF' : mixHex(lc, D6.paper, 0.45); g.beginPath(); g.arc(x, y, r0 * (1 + front * 0.6), 0, TAU); g.fill();
      } else { g.fillStyle = hexA(D6.paper, 0.18 * la); g.beginPath(); g.arc(x, y, Math.max(1, 1.4 * sc), 0, TAU); g.fill(); }
    }
    const r = mulberry32(77);
    for (let x = d0; x < d1; x += Math.max(8, 14 * sc)) { g.fillStyle = hexA(D6.orL, 0.7 * la); g.fillRect(x, deck - 1.5, Math.max(1.2, 2 * sc), Math.max(1.2, 2 * sc)); }
    for (let i = 0; i < 26; i++) {
      const x = lerp(d0, d1, r()), red = r() < 0.5, len = (10 + r() * 30) * sc;
      g.fillStyle = hexA(red ? D6.red : D6.paper, (red ? 0.85 : 0.7) * la); g.fillRect(x, deck + dh * 0.15, len, Math.max(1, 1.6 * sc));
    }
  }
  return { cy, ancL, ancR, base, deck, top, xa, xb, lights: litPts, lc };
}
// orange streaks on the water under the bridge's cable lights (call after d6_water)
function d6_bridgeStreaks(g, B, hz, a = 0.3, k = 1) {
  if (!B) return;
  B.lights.forEach(([x, y], i) => { if (i % 3 === 0 && x > -20 && x < W + 20) d6_streak(g, x, hz, Math.min(H - hz, 40 + (hz - y) * k), B.lc, 10, a, 300 + i); });
}

/* ───────────── water, reflections ───────────── */
function d6_mirror(g, src, wy, o = {}) {
  const k = o.k || 1.3, amp = o.amp == null ? 8 : o.amp, a0 = o.a == null ? 0.5 : o.a;
  const depth = o.depth || (H - wy), r = mulberry32(o.seed || 3);
  g.save();
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  let y = wy;
  while (y < Math.min(H, wy + depth)) {
    const d = (y - wy) / depth;
    const h = (o.h0 || 1.8) + d * (o.h1 || 8) * (0.35 + r() * 1.0);
    const s1 = wy - (y - wy) / k, s0 = Math.max(0, wy - (y + h - wy) / k);
    if (s1 <= 0.5) break;
    const dx = ((r() - 0.5) * 2 + Math.sin(y * 0.045 + (o.seed || 3)) * 0.35) * amp * (0.2 + d * 1.3);
    g.globalAlpha = a0 * Math.pow(Math.max(0, 1 - d), o.fall || 0.8);
    g.save(); g.translate(0, y + h); g.scale(1, -1);
    g.drawImage(src, 0, s0, W, s1 - s0, dx, 0, W, h);
    g.restore();
    y += h;
  }
  g.restore();
}
function d6_water(g, hz, o = {}) {
  const snap = canvas(W, hz); snap.getContext('2d').drawImage(g.canvas, 0, 0, W, hz, 0, 0, W, hz);
  const gr = g.createLinearGradient(0, hz, 0, H);
  gr.addColorStop(0, o.top || '#1B235A'); gr.addColorStop(0.4, o.mid || '#0F1641'); gr.addColorStop(1, o.bot || '#060A1F');
  g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
  d6_mirror(g, snap, hz, { k: o.k || 1.3, a: o.a == null ? 0.6 : o.a, amp: o.amp == null ? 10 : o.amp, seed: o.seed || 3, blur: 1.2 });
  const tg = g.createLinearGradient(0, hz, 0, H); tg.addColorStop(0, 'rgba(6,10,31,0)'); tg.addColorStop(1, `rgba(6,10,31,${o.dark == null ? 0.5 : o.dark})`);
  g.fillStyle = tg; g.fillRect(0, hz, W, H - hz);
  d6_shimmer(g, hz, o.shimmer == null ? 240 : o.shimmer, o.seed || 3);
  g.fillStyle = hexA(D6.paper, 0.1); g.fillRect(0, hz, W, 1.2);
}
function d6_shimmer(g, hz, n = 240, seed = 9, a = 0.14) {
  const r = mulberry32(seed * 7 + 1);
  for (let i = 0; i < n; i++) {
    const d = Math.pow(r(), 1.5), y = hz + 4 + d * (H - hz - 4), len = 4 + r() * (8 + d * 70), x = r() * W;
    g.fillStyle = hexA(r() < 0.3 ? D6.teal : D6.paper, a * (0.3 + r()) * (0.4 + d)); g.fillRect(x, y, len, 1 + d * 1.5);
  }
}
// vertical light streak on rippled water (yakamoz)
function d6_streak(g, x, y0, len, col, wid, a = 0.6, seed = 1) {
  const r = mulberry32(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  let y = y0 + 2;
  while (y < y0 + len) {
    const u = (y - y0) / len, w = wid * (0.35 + r() * 0.9) * (1 + u * 0.7), dx = (r() - 0.5) * wid * 0.9 * (0.3 + u);
    g.fillStyle = hexA(col, a * (1 - u) * (0.35 + r() * 0.65));
    g.fillRect(x - w / 2 + dx, y, w, 1.4 + u * 3.5);
    y += 3 + u * 8 + r() * 3;
  }
  g.restore();
}
// draw something that floats on the water (and its reflection below wy)
function d6_float(g, wy, fn, o = {}) {
  const c = canvas(W, H), x = c.getContext('2d');
  fn(x);
  d6_mirror(g, c, wy, { k: 1, a: 0.3, amp: 5, blur: 1, depth: 240, h1: 6, ...o });
  g.drawImage(c, 0, 0);
}

/* ───────────── city: apartments ───────────── */
function d6_apt(g, x, by, w, h, o = {}) {
  const r = mulberry32(o.seed || 1), top = by - h, ground = o.ground == null ? by : o.ground;
  g.fillStyle = o.col || mixHex(D6.near, D6.paper, 0.015 + r() * 0.05);
  g.fillRect(x, top, w, ground - top + 1);
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + w * 0.8, top, w * 0.2, ground - top + 1);
  const k = r(), rc = o.col || D6.near;
  g.fillStyle = rc; g.strokeStyle = rc; g.lineWidth = 1.5;
  if (k < 0.3) { g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + w * 0.5, top - Math.min(26, w * 0.22)); g.lineTo(x + w + 2, top); g.fill(); }
  else if (k < 0.55) { g.fillRect(x + w * 0.62, top - 12, w * 0.2, 12); g.fillRect(x + w * 0.68, top - 18, 2, 6); }
  else if (k < 0.8) d6_antenna(g, x + w * 0.3, top, 22, rc);
  else { g.beginPath(); g.arc(x + w * 0.7, top - 6, 7, Math.PI * 0.9, Math.PI * 1.9); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x, top, w, 2);
  const ws = o.win || 10, wh = ws * 1.35, gx = ws * 1.9, gy = wh * 1.75;
  const cols = Math.max(1, Math.floor((w - ws * 0.8) / gx)), ox = x + (w - (cols - 1) * gx - ws) / 2;
  const wins = [], litP = o.litP == null ? 0.45 : o.litP;
  for (let yy = top + ws * 1.1; yy + wh < ground - ws * 0.6; yy += gy) {
    for (let c = 0; c < cols; c++) {
      const wx = ox + c * gx, on = r() < litP, q = r(), a = 0.55 + r() * 0.45;
      if (on) {
        const col = d6_lightCol(q);
        g.fillStyle = hexA(col, a); g.fillRect(wx, yy, ws, wh);
        if (q < 0.76 && r() < 0.25) addGlow(g, D6.or, wx + ws / 2, yy + wh / 2, ws * 2.2, 0.25);
      } else { g.fillStyle = 'rgba(255,255,255,0.045)'; g.fillRect(wx, yy, ws, wh); }
      wins.push([wx, yy, ws, wh, on]);
    }
  }
  return { x, y: top, w, h, wins };
}
// rooftop TV antenna: a mast with a fishbone of bars to one side (never a cross)
function d6_antenna(g, x, top, h, col) {
  g.save(); g.strokeStyle = col; g.lineWidth = 1.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, top); g.lineTo(x, top - h);
  for (let k = 0; k < 3; k++) { const yy = top - h + 3 + k * h * 0.2, l = h * (0.55 - k * 0.12); g.moveTo(x, yy); g.lineTo(x + l, yy + l * 0.25); }
  g.stroke(); g.restore();
}
function d6_apts(g, o) {
  const r = mulberry32(o.seed || 1), out = [];
  let x = o.x0;
  while (x < o.x1) {
    const w = lerp(o.wmin || 60, o.wmax || 130, r()), h = lerp(o.hmin, o.hmax, r());
    const by = typeof o.base === 'function' ? o.base(x + w / 2) : o.base;
    out.push(d6_apt(g, x, by, w, h, { seed: (o.seed || 1) * 31 + out.length, col: o.col, litP: o.litP, win: o.win, ground: o.ground }));
    x += w + (r() < 0.3 ? 5 : -3);
  }
  return out;
}

/* ───────────── foreground: gulls, ferries, pier ───────────── */
function d6_gull(g, x, y, s, o = {}) {
  const f = o.flap == null ? 0.4 : o.flap, wy = lerp(-0.42, 0.06, f) * s, ty = lerp(-0.04, 0.32, f) * s;
  g.save(); g.globalAlpha *= o.a == null ? 1 : o.a; g.fillStyle = o.col || D6.paper;
  g.beginPath(); g.moveTo(x, y);
  g.quadraticCurveTo(x - s * 0.2, y + wy * 0.9, x - s * 0.45, y + wy);
  g.quadraticCurveTo(x - s * 0.75, y + wy * 0.8, x - s, y + ty);
  g.quadraticCurveTo(x - s * 0.72, y + wy * 0.55 + s * 0.07, x - s * 0.45, y + wy + s * 0.13);
  g.quadraticCurveTo(x - s * 0.18, y + wy * 0.6 + s * 0.15, x, y + s * 0.11);
  g.quadraticCurveTo(x + s * 0.18, y + wy * 0.6 + s * 0.15, x + s * 0.45, y + wy + s * 0.13);
  g.quadraticCurveTo(x + s * 0.72, y + wy * 0.55 + s * 0.07, x + s, y + ty);
  g.quadraticCurveTo(x + s * 0.75, y + wy * 0.8, x + s * 0.45, y + wy);
  g.quadraticCurveTo(x + s * 0.2, y + wy * 0.9, x, y);
  g.fill();
  g.beginPath(); g.ellipse(x, y + s * 0.07, s * 0.1, s * 0.065, 0, 0, TAU); g.fill();
  g.restore();
}
// İstanbul city-line ferry (vapur): x = centre, wy = waterline, L = length, o.dir = ±1
function d6_ferry(g, x, wy, L, o = {}) {
  const dir = o.dir || 1, white = o.white || '#D6D1D6', r = mulberry32(o.seed || 5);
  const h = L * 0.1, deckY = -h * 1.05;
  if (!o.noGlow) for (let k = 0; k < 6; k++) d6_streak(g, x - L * 0.36 + k * L * 0.145, wy + 1, L * 0.32, D6.or, L * 0.07, 0.32, (o.seed || 5) * 10 + k);
  g.save(); g.translate(x, wy); g.scale(dir, 1);
  const hull = () => {
    g.beginPath();
    g.moveTo(-L * 0.45, 0); g.lineTo(L * 0.4, 0);
    g.quadraticCurveTo(L * 0.48, -h * 0.4, L * 0.53, -h * 1.32);
    g.quadraticCurveTo(L * 0.1, deckY, -L * 0.5, deckY - h * 0.08);
    g.quadraticCurveTo(-L * 0.52, -h * 0.4, -L * 0.45, 0); g.closePath();
  };
  hull(); g.fillStyle = '#070A20'; g.fill();
  g.save(); hull(); g.clip();
  g.fillStyle = white; g.beginPath(); g.moveTo(-L * 0.6, -h * 1.6); g.lineTo(L * 0.6, -h * 1.6); g.lineTo(L * 0.6, -h * 0.72); g.quadraticCurveTo(0, -h * 0.6, -L * 0.6, -h * 0.7); g.closePath(); g.fill();
  g.fillStyle = D6.red; g.fillRect(-L * 0.6, -h * 0.66, L * 1.2, Math.max(1, h * 0.07));
  g.restore();
  g.fillStyle = hexA(D6.orL, 0.9);
  for (let i = 0; i < 11; i++) { g.beginPath(); g.arc(-L * 0.4 + i * L * 0.075, -h * 0.9, Math.max(1, L * 0.0075), 0, TAU); g.fill(); }
  const ch = L * 0.085, sx0 = -L * 0.43, sw = L * 0.8;
  g.fillStyle = white; rr(g, sx0, deckY - ch, sw, ch, Math.max(2, L * 0.012)); g.fill();
  const nw = Math.max(6, Math.round(L / 24)), cw = sw * 0.92 / nw;
  for (let i = 0; i < nw; i++) {
    const dim = r() < 0.15;
    g.fillStyle = dim ? 'rgba(13,19,51,0.65)' : hexA(D6.orL, 0.9 + r() * 0.1);
    g.fillRect(sx0 + sw * 0.04 + i * cw, deckY - ch * 0.76, cw * 0.66, ch * 0.46);
  }
  g.fillStyle = 'rgba(13,19,51,0.22)'; g.fillRect(sx0, deckY - ch * 0.2, sw, ch * 0.2);
  const d2 = deckY - ch, uh = L * 0.06, ux0 = -L * 0.34, uw = L * 0.56;
  g.fillStyle = mixHex(white, D6.navy, 0.15); g.fillRect(ux0, d2 - uh * 0.45, uw, uh * 0.45);
  g.fillStyle = white;
  for (let i = 0; i <= 8; i++) g.fillRect(ux0 + i * uw / 8 - Math.max(0.6, L * 0.003), d2 - uh, Math.max(1.2, L * 0.006), uh);
  rr(g, ux0 - L * 0.02, d2 - uh - L * 0.012, uw + L * 0.04, L * 0.014, L * 0.007); g.fill();
  for (let i = 0; i < 6; i++) { g.fillStyle = hexA(D6.orL, r() < 0.3 ? 0.4 : 0.85); g.fillRect(ux0 + L * 0.02 + i * uw / 6, d2 - uh * 0.42, uw / 6 * 0.55, uh * 0.25); }
  g.fillStyle = white; rr(g, L * 0.14, d2 - L * 0.055, L * 0.12, L * 0.055, 2); g.fill();
  g.fillStyle = 'rgba(13,19,51,0.85)'; g.fillRect(L * 0.15, d2 - L * 0.045, L * 0.1, L * 0.018);
  const fx = -L * 0.06, fy = d2 - uh - L * 0.012;
  g.beginPath(); g.moveTo(fx - L * 0.038, fy); g.lineTo(fx - L * 0.062, fy - L * 0.13); g.lineTo(fx + L * 0.03, fy - L * 0.13); g.lineTo(fx + L * 0.045, fy); g.closePath();
  g.fillStyle = white; g.fill();
  g.fillStyle = '#0B0F2A'; g.fillRect(fx - L * 0.063, fy - L * 0.13, L * 0.094, L * 0.028);
  g.fillStyle = D6.red; g.fillRect(fx - L * 0.058, fy - L * 0.088, L * 0.09, L * 0.012);
  g.strokeStyle = white; g.lineWidth = Math.max(1, L * 0.006);
  g.beginPath(); g.moveTo(L * 0.2, d2 - L * 0.055); g.lineTo(L * 0.2, d2 - L * 0.17); g.moveTo(-L * 0.41, deckY - ch); g.lineTo(-L * 0.41, deckY - ch - L * 0.07); g.stroke();
  g.restore();
  const mx = x + dir * L * 0.2, my = wy + d2 - L * 0.17;
  addGlow(g, D6.paper, mx, my, L * 0.06 + 6, 0.8);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(mx, my, Math.max(1.4, L * 0.007), 0, TAU); g.fill();
  return { mx, my, top: Math.min(my, wy + d2 - uh - L * 0.15) };
}
// a real, lit clock face (hands at 7:24, a quiet nod to the name)
function d6_clock(g, x, y, r) {
  addGlow(g, D6.orL, x, y, r * 3.2, 0.55);
  g.fillStyle = '#FFF3DF'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.lineWidth = Math.max(1.5, r * 0.12); g.strokeStyle = '#2B2F63'; g.stroke();
  g.strokeStyle = '#2B2F63'; g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, l = i % 3 ? 0.12 : 0.22;
    g.lineWidth = Math.max(1, r * (i % 3 ? 0.05 : 0.08));
    g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); g.lineTo(x + Math.cos(a) * r * (0.78 - l), y + Math.sin(a) * r * (0.78 - l)); g.stroke();
  }
  const hand = (a, l, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); };
  g.strokeStyle = '#141A45';
  hand((7 + 24 / 60) / 12 * TAU - Math.PI / 2, r * 0.45, Math.max(2, r * 0.11));
  hand(24 / 60 * TAU - Math.PI / 2, r * 0.66, Math.max(1.5, r * 0.07));
  g.fillStyle = D6.or; g.beginPath(); g.arc(x, y, Math.max(2, r * 0.1), 0, TAU); g.fill();
}
// classic İstanbul pier (iskele) with a clock tower; the sign band carries the kripto | 724 lockup
// the pier's sign band with the horizontal lockup (kept out of the water reflection)
function d6_iskeleSign(g, x, wy, s) {
  const top = wy - s * 0.04 - s * 0.25;
  g.fillStyle = '#0B1030'; g.fillRect(x - s * 0.5, top + 2, s, s * 0.075);
  logoH(g, x, top + 2 + s * 0.056, s * 0.05, { ink: D6.paper, a: 'center' });
}
function d6_iskele(g, x, wy, s, o) {
  const deck = wy - s * 0.04, bh = s * 0.25, top = deck - bh;
  g.fillStyle = '#070A20';
  for (let i = 0; i <= 12; i++) g.fillRect(x - s * 0.56 + i * s * 0.093, deck, s * 0.012, wy - deck + 4);
  g.fillStyle = '#20275C'; g.fillRect(x - s * 0.6, deck - s * 0.018, s * 1.2, s * 0.03);
  const bg = g.createLinearGradient(0, top, 0, deck);
  bg.addColorStop(0, mixHex(D6.navy, D6.paper, 0.3)); bg.addColorStop(1, mixHex(D6.navy, D6.paper, 0.16));
  g.fillStyle = bg; g.fillRect(x - s * 0.5, top, s, bh);
  for (let i = 0; i < 8; i++) {
    const wx = x - s * 0.42 + i * s * 0.12, door = i === 3 || i === 4, ww = s * 0.06, wh = door ? bh * 0.7 : bh * 0.5, wb = door ? deck - s * 0.02 : top + bh * 0.72;
    if (door) addGlow(g, D6.or, wx + ww / 2, wb - wh / 2, s * 0.14, 0.5);
    g.fillStyle = door ? D6.orW : hexA(D6.orL, 0.92);
    g.beginPath(); g.moveTo(wx, wb); g.lineTo(wx, wb - wh + ww / 2); g.arc(wx + ww / 2, wb - wh + ww / 2, ww / 2, Math.PI, TAU); g.lineTo(wx + ww, wb); g.fill();
  }
  const rg = g.createLinearGradient(0, top - s * 0.08, 0, top); rg.addColorStop(0, '#1E2558'); rg.addColorStop(1, '#10163F');
  g.fillStyle = rg;
  g.beginPath(); g.moveTo(x - s * 0.58, top + 2); g.lineTo(x - s * 0.47, top - s * 0.08); g.lineTo(x + s * 0.47, top - s * 0.08); g.lineTo(x + s * 0.58, top + 2); g.closePath(); g.fill();
  g.fillStyle = hexA(D6.paper, 0.35); g.fillRect(x - s * 0.47, top - s * 0.08, s * 0.94, 1.5);
  g.fillStyle = hexA(D6.or, 0.6); g.fillRect(x - s * 0.58, top, s * 1.16, 2);
  for (let i = 0; i <= 10; i++) { const lx = x - s * 0.56 + i * s * 0.112; addGlow(g, D6.or, lx, deck - s * 0.03, 12, 0.6); g.fillStyle = D6.orW; g.beginPath(); g.arc(lx, deck - s * 0.03, 1.8, 0, TAU); g.fill(); }
  if (!o || o.sign !== false) d6_iskeleSign(g, x, wy, s);
  // clock tower with a real clock face
  const tw = s * 0.15, tTop = top - s * 0.3;
  g.fillStyle = mixHex(D6.navy, D6.paper, 0.26); g.fillRect(x - tw / 2, tTop, tw, top - s * 0.08 - tTop + 2);
  g.fillStyle = '#121845';
  g.beginPath(); g.moveTo(x - tw * 0.66, tTop + 2); g.lineTo(x, tTop - s * 0.12); g.lineTo(x + tw * 0.66, tTop + 2); g.closePath(); g.fill();
  g.fillRect(x - 1, tTop - s * 0.17, 2, s * 0.06);
  g.fillStyle = D6.or; g.beginPath(); g.arc(x, tTop - s * 0.17, 3, 0, TAU); g.fill();
  const mr = tw * 0.36, my = tTop + tw * 0.62;
  d6_clock(g, x, my, mr);
  return { x, y: top, tTop, my, deck };
}

/* ───────────── night glass, phones ───────────── */
function d6_card(g, x, y, w, h, o = {}) {
  const r = o.r || 26;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 70; g.shadowOffsetY = 28;
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || 'rgba(11,16,46,0.9)'; g.fill(); g.restore();
  g.save(); rr(g, x, y, w, h, r); g.clip();
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hexA(D6.or, o.warm == null ? 0.1 : o.warm)); gr.addColorStop(0.4, hexA(D6.or, 0));
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = hexA(D6.or, 0.34); rr(g, x, y, w, h, r); g.stroke();
}
function d6_phone(g, x, y, w, h, rot, fn, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (o.glow !== false) addGlow(g, o.glow || D6.or, 0, 0, w * 1.5, o.glowA == null ? 0.22 : o.glowA);
  const R = o.r == null ? w * 0.13 : o.r;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  rr(g, -w / 2, -h / 2, w, h, R); g.fillStyle = '#04061A'; g.fill(); g.restore();
  rr(g, -w / 2, -h / 2, w, h, R); g.lineWidth = 2; g.strokeStyle = hexA(D6.paper, 0.28); g.stroke();
  const p = o.pad == null ? 9 : o.pad;
  g.save(); rr(g, -w / 2 + p, -h / 2 + p, w - 2 * p, h - 2 * p, o.r == null ? w * 0.1 : o.r * 0.6); g.clip();
  fn(g, -w / 2 + p, -h / 2 + p, w - 2 * p, h - 2 * p);
  g.restore();
  if (o.notch !== false) { g.fillStyle = '#04061A'; rr(g, -w * 0.15, -h / 2 + p + 6, w * 0.3, Math.max(8, w * 0.034), Math.max(4, w * 0.017)); g.fill(); }
  g.restore();
}
function d6_spark(g, pts, col, lw = 2.5) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
}

/* ───────────── app UI kit (kripto724's light theme, Inter) ───────────── */
const D6_APP = {
  page: '#EEF0F5', ink: '#14161F', sec: '#7A7F8C', hair: '#EEF0F4', up: '#16A34A', upBg: '#DCF5E6', dn: '#E5484D', dnBg: '#FDE2E2',
  track: '#ECEBFF', track2: '#F1F0FA', cntBg: '#E5E3FF', cnt: '#6E5BFF', live: '#10B981', liveInk: '#0C9A6A', liveBg: '#E3F7EE',
  cream: '#FFF7E3', au1: '#D9A520', au2: '#F2C14E', creamTrack: '#F3E5C2',
};
const D6_COIN = { BTC: ['#F7931A', 'B'], ETH: ['#5B5FD6', 'E'], XRP: ['#16181D', 'X'], BNB: ['#F0B90B', 'BN'], SOL: [['#9945FF', '#14C8B0'], 'S'], DOGE: ['#C9A236', 'D'], ADA: ['#2A5ADA', 'A'] };
const D6_CRYPTO = [
  ['BTC', 'Bitcoin', 'BTC/USDT', '$80.220,05', '−1,49%', '−2,05%'],
  ['ETH', 'Ethereum', 'ETH/USDT', '$2.325,10', '−1,67%', '−3,24%'],
  ['XRP', 'XRP', 'XRP/USDT', '$1,2913', '−2,64%', '−2,80%'],
  ['BNB', 'BNB', 'BNB/USDT', '$740,00', '−2,66%', '+0,89%'],
  ['SOL', 'Solana', 'SOL/USDT', '$100,56', '−2,17%', '−3,83%'],
  ['DOGE', 'Dogecoin', 'DOGE/USDT', '$0,07862', '−1,87%', '−0,87%'],
  ['ADA', 'Cardano', 'ADA/USDT', '$0,201', '−2,85%', '−7,42%'],
];
const D6_STOCKS = [
  ['MU', 'Micron Technology', '$983,23', '+5,87%'],
  ['META', 'Meta Platforms', '$612,49', '−1,24%'],
  ['NVDA', 'NVIDIA', '$215,38', '−1,17%'],
  ['GOOGL', 'Alphabet (Google)', '$324,89', '+1,34%'],
  ['TSLA', 'Tesla', '$404,22', '−0,79%'],
  ['MSFT', 'Microsoft', '$531,01', '−0,06%'],
  ['AAPL', 'Apple', '$343,83', '−0,94%'],
];
// gold rows with complete data (name, detail, alış, satış, değişim)
const D6_GOLD = [
  ['Gram Altın', '24 ayar · gram', '6.422,05', '6.510,83', '+0,40%'],
  ['Çeyrek Altın', '1,75 gr · 22 ayar', '10.327', '10.476', '+0,60%'],
  ['Ata Altın', '', '42.566', '42.993', '+0,32%'],
  ['Ata Beşli', '', '212.799', '214.914', '+0,25%'],
];

function d6_ui(g, s, x, y, size, col, o = {}) { text(g, s, x, y, { f: 'Inter', w: o.w || 600, s: size, a: o.a || 'left', b: o.b, c: col, ls: o.ls || 0 }); }
function d6_uiw(g, s, size, w = 600) { return measure(g, s, { f: 'Inter', w, s: size }); }
// white app card with the app's soft shadow
function d6_sheet(g, x, y, w, h, o = {}) {
  const r = o.r == null ? 22 : o.r, b = o.blur || 60;
  g.save(); g.shadowColor = `rgba(0,0,0,${o.sh == null ? 0.45 : o.sh})`; g.shadowBlur = b; g.shadowOffsetY = b * 0.35;
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || '#FFFFFF'; g.fill(); g.restore();
}
// gain / loss pill; (x, y) = right end (o.a 'left' | 'center' changes that), vertical middle
function d6_pct(g, x, y, s, size = 16, o = {}) {
  const up = s[0] === '+', tw = d6_uiw(g, s, size, 700), pw = tw + size * 1.05, ph = size * 1.72;
  const x0 = o.a === 'left' ? x : o.a === 'center' ? x - pw / 2 : x - pw;
  rr(g, x0, y - ph / 2, pw, ph, ph / 2); g.fillStyle = up ? D6_APP.upBg : D6_APP.dnBg; g.fill();
  d6_ui(g, s, x0 + pw / 2, y + size * 0.36, size, up ? D6_APP.up : D6_APP.dn, { w: 700, a: 'center' });
  return pw;
}
// "● CANLI" badge; (x, y) = left middle (o.a 'right': right end). Returns width.
function d6_live(g, x, y, size = 15, label = 'CANLI', o = {}) {
  const tw = d6_uiw(g, label, size, 700), pw = tw + size * 2.25, ph = size * 1.9;
  const x0 = o.a === 'right' ? x - pw : x;
  rr(g, x0, y - ph / 2, pw, ph, ph / 2); g.fillStyle = D6_APP.liveBg; g.fill();
  g.fillStyle = D6_APP.live; g.beginPath(); g.arc(x0 + size * 0.85, y, size * 0.27, 0, TAU); g.fill();
  d6_ui(g, label, x0 + size * 1.4, y + size * 0.36, size, D6_APP.liveInk, { w: 700 });
  return pw;
}
function d6_coin(g, x, y, r, sym) {
  const [c, l] = D6_COIN[sym];
  if (Array.isArray(c)) { const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; } else g.fillStyle = c;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  const f = fit(g, l, { f: 'Inter', w: 700, s: r * (l.length > 1 ? 0.78 : 0.98) }, r * 1.45);
  text(g, l, x, y + f.s * 0.36, { ...f, a: 'center', c: sym === 'BNB' || sym === 'DOGE' ? '#1A1405' : '#FFFFFF' });
}
// stock: neutral circle with the ticker
function d6_tick(g, x, y, r, tk) {
  g.fillStyle = '#E9EBF1'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  const f = fit(g, tk, { f: 'Inter', w: 700, s: r * 0.62 }, r * 1.55);
  text(g, tk, x, y + f.s * 0.36, { ...f, a: 'center', c: D6_APP.ink });
}
// segmented tabs on the lavender track; items: [[label, count?], ...]
function d6_seg(g, x, y, w, h, items, sel, o = {}) {
  rr(g, x, y, w, h, h / 2); g.fillStyle = o.track || D6_APP.track; g.fill();
  const pad = o.pad == null ? 4 : o.pad, iw = (w - pad * 2) / items.length, size = o.s || h * 0.36;
  items.forEach(([l, n], i) => {
    const ix = x + pad + i * iw;
    if (i === sel) {
      g.save(); g.shadowColor = 'rgba(20,22,31,0.14)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
      rr(g, ix, y + pad, iw, h - pad * 2, (h - pad * 2) / 2);
      if (o.selGrad) { const gr = g.createLinearGradient(ix, 0, ix + iw, 0); gr.addColorStop(0, o.selGrad[0]); gr.addColorStop(1, o.selGrad[1]); g.fillStyle = gr; } else g.fillStyle = o.selFill || '#FFFFFF';
      g.fill(); g.restore();
    }
    const lw = d6_uiw(g, l, size, 700), nw = n ? d6_uiw(g, n, size * 0.8, 700) + size * 0.9 : 0, gap = n ? size * 0.4 : 0;
    const tx = ix + (iw - lw - gap - nw) / 2;
    d6_ui(g, l, tx, y + h / 2 + size * 0.36, size, i === sel ? (o.selInk || D6_APP.ink) : (o.ink || D6_APP.sec), { w: 700 });
    if (n) {
      const bx = tx + lw + gap;
      rr(g, bx, y + h / 2 - size * 0.62, nw, size * 1.24, size * 0.62); g.fillStyle = D6_APP.cntBg; g.fill();
      d6_ui(g, n, bx + nw / 2, y + h / 2 + size * 0.29, size * 0.8, D6_APP.cnt, { w: 700, a: 'center' });
    }
  });
}
// app icon: black rounded square with the white stacked logo
function d6_appIcon(g, cx, cy, s, o = {}) {
  g.save();
  if (o.shadow) { g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = s * 0.3; g.shadowOffsetY = s * 0.08; }
  rr(g, cx - s / 2, cy - s / 2, s, s, s * 0.22); g.fillStyle = '#0A0A0A'; g.fill();
  g.restore();
  logo(g, cx, cy, s * 0.66, { ink: '#FFFFFF' });
}
// small line icons
function d6_icon(g, kind, x, y, s, col, lw) {
  const h = s / 2;
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw || Math.max(1.4, s * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  if (kind === 'bell' || kind === 'signal') {
    g.moveTo(x - h * 0.62, y + h * 0.38); g.lineTo(x - h * 0.62, y - h * 0.08); g.arc(x, y - h * 0.08, h * 0.62, Math.PI, TAU); g.lineTo(x + h * 0.62, y + h * 0.38);
    g.lineTo(x + h * 0.82, y + h * 0.55); g.lineTo(x - h * 0.82, y + h * 0.55); g.closePath(); g.stroke();
    g.beginPath(); g.arc(x, y + h * 0.78, h * 0.16, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x, y - h * 0.7); g.lineTo(x, y - h * 0.86); g.stroke();
    if (kind === 'signal') { g.beginPath(); g.arc(x, y - h * 0.05, h * 1.05, -Math.PI * 0.32, -Math.PI * 0.08); g.moveTo(x - h * 1.05 * Math.cos(Math.PI * 0.32), y - h * 0.05 - h * 1.05 * Math.sin(Math.PI * 0.32)); g.arc(x, y - h * 0.05, h * 1.05, -Math.PI * 0.68, -Math.PI * 0.92, true); g.stroke(); }
  } else if (kind === 'user') {
    g.arc(x, y - h * 0.32, h * 0.34, 0, TAU); g.stroke();
    g.beginPath(); g.arc(x, y + h * 0.82, h * 0.66, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  } else if (kind === 'news') {
    rr(g, x - h * 0.72, y - h * 0.78, h * 1.44, h * 1.56, h * 0.18); g.stroke();
    g.beginPath(); for (const k of [-0.35, 0.05, 0.42]) { g.moveTo(x - h * 0.4, y + k * h); g.lineTo(x + h * 0.4, y + k * h); } g.stroke();
  } else if (kind === 'feed') {
    for (const k of [-0.55, 0, 0.55]) { g.moveTo(x - h * 0.35, y + k * h); g.lineTo(x + h * 0.75, y + k * h); }
    g.stroke(); for (const k of [-0.55, 0, 0.55]) { g.beginPath(); g.arc(x - h * 0.7, y + k * h, h * 0.12, 0, TAU); g.fill(); }
  } else if (kind === 'search') {
    g.arc(x - h * 0.15, y - h * 0.15, h * 0.52, 0, TAU); g.moveTo(x + h * 0.24, y + h * 0.24); g.lineTo(x + h * 0.75, y + h * 0.75); g.stroke();
  } else if (kind === 'chart') {
    [[-0.6, 0.2], [-0.15, -0.25], [0.3, -0.7]].forEach(([dx, t]) => { g.moveTo(x + dx * h + h * 0.15, y + h * 0.75); g.lineTo(x + dx * h + h * 0.15, y + t * h); });
    g.stroke(); g.beginPath(); g.moveTo(x - h * 0.85, y + h * 0.75); g.lineTo(x + h * 0.85, y + h * 0.75); g.stroke();
  } else if (kind === 'candles') {
    [[-0.55, -0.6, 0.5, 0.2, -0.2], [0, -0.85, 0.2, -0.55, -0.05], [0.55, -0.4, 0.7, -0.15, 0.45]].forEach(([dx, t, b, bt, bb]) => {
      g.moveTo(x + dx * h, y + t * h); g.lineTo(x + dx * h, y + b * h);
    });
    g.stroke();
    [[-0.55, -0.35, 0.25], [0, -0.6, -0.1], [0.55, -0.15, 0.45]].forEach(([dx, t, b]) => { g.fillRect(x + dx * h - h * 0.17, y + t * h, h * 0.34, (b - t) * h); });
  } else if (kind === 'forecast') {
    g.moveTo(x - h * 0.85, y + h * 0.5); g.lineTo(x - h * 0.35, y + h * 0.05); g.lineTo(x, y + h * 0.25); g.stroke();
    g.setLineDash([h * 0.18, h * 0.2]); g.beginPath(); g.moveTo(x, y + h * 0.25); g.lineTo(x + h * 0.8, y - h * 0.55); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(x + h * 0.8, y - h * 0.55, h * 0.14, 0, TAU); g.fill();
  } else if (kind === 'play') {
    g.moveTo(x - h * 0.35, y - h * 0.5); g.lineTo(x + h * 0.55, y); g.lineTo(x - h * 0.35, y + h * 0.5); g.closePath(); g.fill();
  }
  g.restore();
}
// app sparkline in a box, trending up or down
function d6_uiSpark(g, x, y, w, h, seed, up, o = {}) {
  const n = o.n || 26, v = walk(seed, n, 0, 0.02);
  const d = (up ? 1 : -1) * 0.05 - (v[n - 1] - v[0]);
  for (let i = 0; i < n; i++) v[i] += d * i / (n - 1);
  const lo = Math.min(...v), hi = Math.max(...v), col = up ? D6_APP.up : D6_APP.dn;
  const pts = v.map((q, i) => [x + i / (n - 1) * w, y + h - (q - lo) / ((hi - lo) || 1) * h]);
  if (o.area) {
    const ag = g.createLinearGradient(0, y, 0, y + h); ag.addColorStop(0, hexA(col, 0.22)); ag.addColorStop(1, hexA(col, 0));
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fillStyle = ag; g.fill();
  }
  g.save(); g.strokeStyle = col; g.lineWidth = o.lw || 2; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore();
}
// bottom navigation of the app: items [label, icon] with null in the middle for the app icon
function d6_nav(g, x0, y, w, h, items) {
  g.fillStyle = '#FFFFFF'; g.fillRect(x0, y, w, h); g.fillStyle = '#E6E8EE'; g.fillRect(x0, y, w, 1.5);
  const iw = w / items.length;
  items.forEach((it, i) => {
    const cx = x0 + iw * (i + 0.5);
    if (!it) { d6_appIcon(g, cx, y + h * 0.44, h * 0.62, { shadow: true }); return; }
    d6_icon(g, it[1], cx, y + h * 0.35, h * 0.3, D6_APP.sec);
    d6_ui(g, it[0], cx, y + h * 0.8, h * 0.15, D6_APP.sec, { w: 600, a: 'center' });
  });
}
// orange-to-arrow shape (no font has →)
function d6_arrowR(g, x, y, s, col, lw) { d6_arrow(g, x, y, s, col, lw || Math.max(2, s * 0.28)); }

/* Home screen card: Kripto | Borsa | Emtia tabs, ● CANLI, Varlık · Fiyat · Günlük · Haftalık. Returns its height. */
function d6_cryptoCard(g, x, y, w) {
  const A = D6_APP, k = w / 960, P = 34 * k, rowH = 78 * k;
  const h = 170 * k + D6_CRYPTO.length * rowH + 64 * k;
  d6_sheet(g, x, y, w, h, { r: 26 * k, sh: 0.55 });
  d6_seg(g, x + P, y + P, 440 * k, 60 * k, [['Kripto'], ['Borsa'], ['Emtia']], 0, { s: 21 * k });
  d6_live(g, x + w - P, y + P + 30 * k, 17 * k, 'CANLI', { a: 'right' });
  const cP = x + w * 0.585, cD = x + w * 0.78, cW = x + w - P, hy = y + 140 * k;
  d6_ui(g, 'Varlık', x + P, hy, 17 * k, A.sec, { w: 600 });
  d6_ui(g, 'Fiyat', cP, hy, 17 * k, A.sec, { w: 600, a: 'right' });
  d6_ui(g, 'Günlük', cD, hy, 17 * k, A.sec, { w: 600, a: 'right' });
  d6_ui(g, 'Haftalık', cW, hy, 17 * k, A.sec, { w: 600, a: 'right' });
  g.fillStyle = A.hair; g.fillRect(x + P, hy + 16 * k, w - 2 * P, 2 * k);
  D6_CRYPTO.forEach(([sym, name, pair, price, d1, d7], i) => {
    const cy = y + 170 * k + i * rowH + rowH / 2;
    d6_coin(g, x + P + 24 * k, cy, 24 * k, sym);
    d6_ui(g, name, x + P + 62 * k, cy - 3 * k, 22 * k, A.ink, { w: 700 });
    d6_ui(g, pair, x + P + 62 * k, cy + 21 * k, 15.5 * k, A.sec, { w: 500 });
    d6_ui(g, price, cP, cy + 8 * k, 22 * k, A.ink, { w: 700, a: 'right' });
    d6_pct(g, cD, cy, d1, 16 * k);
    d6_pct(g, cW, cy, d7, 16 * k);
    if (i < D6_CRYPTO.length - 1) { g.fillStyle = A.hair; g.fillRect(x + P, cy + rowH / 2, w - 2 * P, 1.5 * k); }
  });
  d6_ui(g, 'Güncellendi 14:24', x + P, y + h - 26 * k, 16 * k, A.sec, { w: 500 });
  return h;
}
/* Borsa screen (inside a phone) */
function d6_borsa(c, x0, y0, w, h) {
  const A = D6_APP, k = w / 420, L = x0 + 18 * k, R = x0 + w - 18 * k;
  c.fillStyle = A.page; c.fillRect(x0, y0, w, h);
  d6_ui(c, '14:23', x0 + 36 * k, y0 + 30 * k, 15 * k, A.ink, { w: 700 });
  c.strokeStyle = A.ink; c.lineWidth = 1.5 * k; rr(c, R - 30 * k, y0 + 19 * k, 25 * k, 12 * k, 3.5 * k); c.stroke();
  c.fillStyle = A.ink; rr(c, R - 28 * k, y0 + 21 * k, 17 * k, 8 * k, 2 * k); c.fill();
  d6_ui(c, 'Borsa', L, y0 + 88 * k, 32 * k, A.ink, { w: 700, ls: -0.5 });
  d6_ui(c, 'BIST ve Nasdaq hisseleri', L, y0 + 112 * k, 15 * k, A.sec, { w: 500 });
  d6_live(c, R, y0 + 78 * k, 12.5 * k, 'CANLI · 14:23', { a: 'right' });
  d6_seg(c, L - 4 * k, y0 + 134 * k, w - 28 * k, 50 * k, [['Tümü', '210'], ['BIST', '108'], ['Nasdaq', '102']], 0, { s: 15 * k });
  // filter chips (the row scrolls past the right edge, as in the app)
  let cx = L - 4 * k; const cy = y0 + 214 * k;
  [['Favoriler', 'star'], ['Popüler', 'sel'], ['Yükselenler'], ['Düşenler']].forEach(([l, t]) => {
    const s = 14 * k, tw = d6_uiw(c, l, s, 600) + (t === 'star' ? 19 * k : 0), pw = tw + 26 * k, ph = 34 * k;
    rr(c, cx, cy - ph / 2, pw, ph, ph / 2); c.fillStyle = t === 'sel' ? '#14161F' : '#FFFFFF'; c.fill();
    if (t !== 'sel') { c.strokeStyle = '#E2E4EA'; c.lineWidth = 1; c.stroke(); }
    let tx = cx + 13 * k;
    if (t === 'star') { d6_star(c, tx + 7 * k, cy, 7.5 * k, D6.or); tx += 19 * k; }
    d6_ui(c, l, tx, cy + s * 0.36, s, t === 'sel' ? '#FFFFFF' : A.ink, { w: 600 });
    cx += pw + 8 * k;
  });
  const sy = y0 + 248 * k;
  rr(c, L - 4 * k, sy, w - 28 * k, 44 * k, 14 * k); c.fillStyle = '#FFFFFF'; c.fill();
  d6_icon(c, 'search', L + 16 * k, sy + 22 * k, 16 * k, A.sec);
  d6_ui(c, 'Hisse adı ya da kodu ara…', L + 36 * k, sy + 27.5 * k, 14.5 * k, A.sec, { w: 500 });
  d6_ui(c, '210 hisse', L, y0 + 322 * k, 14 * k, A.sec, { w: 700 });
  d6_ui(c, 'Fiyat · Günlük', R, y0 + 322 * k, 14 * k, A.sec, { w: 600, a: 'right' });
  const ly = y0 + 336 * k, rh = 62 * k;
  rr(c, x0 + 10 * k, ly, w - 20 * k, rh * D6_STOCKS.length + 8 * k, 18 * k); c.fillStyle = '#FFFFFF'; c.fill();
  D6_STOCKS.forEach(([tk, name, price, pct], i) => {
    const ry = ly + 4 * k + i * rh + rh / 2;
    d6_tick(c, L + 16 * k, ry, 19 * k, tk);
    d6_ui(c, tk, L + 44 * k, ry - 3 * k, 16 * k, A.ink, { w: 700 });
    const tw = d6_uiw(c, tk, 16 * k, 700), bx = L + 44 * k + tw + 6 * k, bw = d6_uiw(c, 'NASDAQ', 8.5 * k, 700) + 9 * k;
    rr(c, bx, ry - 15 * k, bw, 14 * k, 4 * k); c.fillStyle = '#F0F1F5'; c.fill();
    d6_ui(c, 'NASDAQ', bx + bw / 2, ry - 5 * k, 8.5 * k, A.sec, { w: 700, a: 'center' });
    d6_ui(c, name, L + 44 * k, ry + 15 * k, 12.5 * k, A.sec, { w: 500 });
    d6_uiSpark(c, x0 + 222 * k, ry - 12 * k, 68 * k, 22 * k, 900 + i * 13, pct[0] === '+', { lw: 1.6 * k, n: 18 });
    d6_ui(c, price, R - 4 * k, ry - 3 * k, 15.5 * k, A.ink, { w: 700, a: 'right' });
    d6_pct(c, R - 4 * k, ry + 15 * k, pct, 11.5 * k);
    if (i < D6_STOCKS.length - 1) { c.fillStyle = A.hair; c.fillRect(L + 44 * k, ry + rh / 2, w - 90 * k, 1.2 * k); }
  });
  d6_nav(c, x0, y0 + h - 78 * k, w, 78 * k, [['Akış', 'feed'], ['Haberler', 'news'], null, ['Alarmlarım', 'bell'], ['Hesabım', 'user']]);
}
// index card: BIST 100 / Nasdaq 100
function d6_indexCard(g, x, y, w, h, name, val, pct, seed) {
  const A = D6_APP;
  d6_sheet(g, x, y, w, h, { r: 24, sh: 0.5 });
  d6_ui(g, name, x + 26, y + 44, 21, A.sec, { w: 700 });
  d6_pct(g, x + w - 24, y + 37, pct, 17);
  d6_ui(g, val, x + 24, y + 104, 50, A.ink, { w: 700, ls: -1.5 });
  d6_uiSpark(g, x + 26, y + 124, w - 52, h - 144, seed, true, { area: true, lw: 2.6, n: 34 });
}
/* Kapalıçarşı gold card (cream), returns its height */
function d6_goldCard(g, x, y, w) {
  const A = D6_APP, k = w / 800, P = 30 * k, R = x + w - P, h = 902 * k;
  d6_sheet(g, x, y, w, h, { r: 28 * k, fill: A.cream, sh: 0.6, blur: 80 });
  const goldGrad = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, A.au1); gr.addColorStop(1, A.au2); return gr; };
  const hy = y + P + 34 * k;
  g.fillStyle = goldGrad(x + P, x + P + 68 * k); g.beginPath(); g.arc(x + P + 34 * k, hy, 34 * k, 0, TAU); g.fill();
  d6_ui(g, 'Au', x + P + 34 * k, hy + 8.5 * k, 24 * k, '#FFFFFF', { w: 700, a: 'center' });
  d6_ui(g, 'Altın', x + P + 84 * k, hy - 4 * k, 30 * k, A.ink, { w: 700 });
  g.fillStyle = A.live; g.beginPath(); g.arc(x + P + 91 * k, hy + 21 * k, 5 * k, 0, TAU); g.fill();
  d6_ui(g, 'Kapalıçarşı · canlı', x + P + 103 * k, hy + 27 * k, 17 * k, A.sec, { w: 600 });
  d6_seg(g, R - 236 * k, hy - 26 * k, 236 * k, 52 * k, [['₺ TL'], ['$ USD']], 0, { s: 19 * k, track: A.creamTrack, selGrad: [A.au1, A.au2], selInk: '#FFFFFF', ink: '#8C7A4E' });
  const by = y + P + 96 * k, bw = (w - 2 * P - 20 * k) / 2, bh = 188 * k;
  [['Gram Altın', '₺6.510,83', '+0,40%', 'Alış 6.422 · Satış 6.511'], ['Ons Altın', '$4.033,60', '+0,40%', '']].forEach(([l, v, p, s], i) => {
    const bx = x + P + i * (bw + 20 * k);
    rr(g, bx, by, bw, bh, 20 * k); g.fillStyle = '#FFFFFF'; g.fill();
    d6_ui(g, l, bx + 24 * k, by + 42 * k, 18 * k, A.sec, { w: 700 });
    d6_ui(g, v, bx + 22 * k, by + 102 * k, 44 * k, A.ink, { w: 700, ls: -1 });
    d6_pct(g, bx + 24 * k, by + 140 * k, p, 15 * k, { a: 'left' });
    if (s) d6_ui(g, s, bx + 24 * k, by + 176 * k, 15 * k, A.sec, { w: 600 });
  });
  const sy = by + bh + 62 * k;
  d6_ui(g, 'ALTIN FİYATLARI', x + P + 4 * k, sy, 17 * k, A.ink, { w: 700, ls: 2 * k });
  d6_seg(g, R - 300 * k, sy - 33 * k, 300 * k, 46 * k, [['Yeni basım'], ['Eski basım']], 1, { s: 16 * k, track: A.creamTrack });
  const ty0 = sy + 30 * k, th = y + h - P - ty0;
  rr(g, x + P, ty0, w - 2 * P, th, 20 * k); g.fillStyle = '#FFFFFF'; g.fill();
  const cAl = x + P + 420 * k, cSa = x + P + 570 * k, cCh = R - 20 * k, hy2 = ty0 + 40 * k;
  d6_ui(g, 'Ürün', x + P + 22 * k, hy2, 15 * k, A.sec, { w: 700 });
  d6_ui(g, 'Alış', cAl, hy2, 15 * k, A.sec, { w: 700, a: 'right' });
  d6_ui(g, 'Satış', cSa, hy2, 15 * k, A.sec, { w: 700, a: 'right' });
  d6_ui(g, 'Değişim', cCh, hy2, 15 * k, A.sec, { w: 700, a: 'right' });
  g.fillStyle = A.hair; g.fillRect(x + P + 18 * k, hy2 + 16 * k, w - 2 * P - 36 * k, 1.5 * k);
  const rh = (th - 62 * k) / D6_GOLD.length;
  D6_GOLD.forEach(([n, d, al, sa, ch], i) => {
    const cy = hy2 + 16 * k + rh * (i + 0.5);
    d6_ui(g, n, x + P + 22 * k, cy + (d ? -4 : 7) * k, 21 * k, A.ink, { w: 700 });
    if (d) d6_ui(g, d, x + P + 22 * k, cy + 20 * k, 14 * k, A.sec, { w: 500 });
    d6_ui(g, al, cAl, cy + 7 * k, 20 * k, '#4A4F5C', { w: 600, a: 'right' });
    d6_ui(g, sa, cSa, cy + 7 * k, 20 * k, A.ink, { w: 700, a: 'right' });
    d6_pct(g, cCh, cy, ch, 15 * k);
    if (i < D6_GOLD.length - 1) { g.fillStyle = A.hair; g.fillRect(x + P + 18 * k, cy + rh / 2, w - 2 * P - 36 * k, 1.5 * k); }
  });
  return h;
}
/* Kasam banner from the home screen: text, button, a vault and a phone with ₺1.250.430 */
function d6_kasam(g, x, y, w, h) {
  const A = D6_APP, k = w / 960, P = 46 * k;
  d6_sheet(g, x, y, w, h, { r: 30 * k, sh: 0.55, blur: 80 });
  g.save(); rr(g, x, y, w, h, 30 * k); g.clip();
  const bg = g.createLinearGradient(x, 0, x + w, 0); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(0.55, '#FFFFFF'); bg.addColorStop(1, '#FFF1D9');
  g.fillStyle = bg; g.fillRect(x, y, w, h);
  glow(g, D6.or, x + w * 0.74, y + h * 0.55, h * 0.75, 0.16);
  g.restore();
  logoH(g, x + P, y + P + 22 * k, 24 * k, { ink: '#0A0A0A' });
  text(g, 'Kasam', x + P - 3 * k, y + 178 * k, { f: 'Poppins', w: 700, s: 76 * k, a: 'left', c: A.ink, ls: -1.5 * k });
  const bs = 25 * k, l1 = 'Altın, döviz ve kişisel varlıklarını', l2a = 'tek ekranda ', l2b = 'güvenle', l2c = ' takip et.';
  d6_ui(g, l1, x + P, y + 240 * k, bs, '#4A4F5C', { w: 600 });
  d6_ui(g, l2a, x + P, y + 278 * k, bs, '#4A4F5C', { w: 600 });
  const w2a = d6_uiw(g, l2a, bs, 600);
  d6_ui(g, l2b, x + P + w2a, y + 278 * k, bs, D6.or, { w: 700 });
  d6_ui(g, l2c, x + P + w2a + d6_uiw(g, l2b, bs, 700), y + 278 * k, bs, '#4A4F5C', { w: 600 });
  const bw = 262 * k, bh = 64 * k, bx = x + P, byy = y + h - P - bh;
  rr(g, bx, byy, bw, bh, bh / 2); g.fillStyle = '#0A0A0A'; g.fill();
  d6_ui(g, 'Kasamı Gör', bx + 32 * k, byy + bh / 2 + 8 * k, 22 * k, '#FFFFFF', { w: 700 });
  d6_arrowR(g, bx + bw - 44 * k, byy + bh / 2, 12 * k, D6.or, 3.2 * k);
  // the vault
  const vx = x + w * 0.665, vy = y + h * 0.53, vs = h * 0.58;
  g.save(); g.shadowColor = 'rgba(13,19,51,0.35)'; g.shadowBlur = 30 * k; g.shadowOffsetY = 12 * k;
  const vg = g.createLinearGradient(vx - vs / 2, vy - vs / 2, vx + vs / 2, vy + vs / 2); vg.addColorStop(0, '#323A82'); vg.addColorStop(1, '#141A45');
  rr(g, vx - vs / 2, vy - vs / 2, vs, vs, vs * 0.1); g.fillStyle = vg; g.fill(); g.restore();
  g.fillStyle = '#0D1333'; g.fillRect(vx - vs * 0.38, vy + vs / 2, vs * 0.12, vs * 0.06); g.fillRect(vx + vs * 0.26, vy + vs / 2, vs * 0.12, vs * 0.06);
  rr(g, vx - vs * 0.42, vy - vs * 0.42, vs * 0.84, vs * 0.84, vs * 0.07); g.lineWidth = 2 * k; g.strokeStyle = 'rgba(244,241,234,0.18)'; g.stroke();
  g.fillStyle = '#1E2558'; g.beginPath(); g.arc(vx, vy, vs * 0.3, 0, TAU); g.fill();
  g.lineWidth = 3 * k; g.strokeStyle = '#4A5299'; g.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; g.strokeStyle = i % 6 ? 'rgba(244,241,234,0.35)' : D6.or; g.lineWidth = (i % 6 ? 1.5 : 3) * k; g.beginPath(); g.moveTo(vx + Math.cos(a) * vs * 0.24, vy + Math.sin(a) * vs * 0.24); g.lineTo(vx + Math.cos(a) * vs * 0.28, vy + Math.sin(a) * vs * 0.28); g.stroke(); }
  g.strokeStyle = D6.or; g.lineWidth = 6 * k; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; g.beginPath(); g.moveTo(vx, vy); g.lineTo(vx + Math.cos(a) * vs * 0.17, vy + Math.sin(a) * vs * 0.17); g.stroke(); }
  const dg = g.createRadialGradient(vx - 4 * k, vy - 4 * k, 2, vx, vy, vs * 0.08); dg.addColorStop(0, '#FFD08A'); dg.addColorStop(1, D6.or);
  g.fillStyle = dg; g.beginPath(); g.arc(vx, vy, vs * 0.075, 0, TAU); g.fill();
  // the phone
  d6_phone(g, x + w * 0.865, y + h * 0.56, 196 * k, 372 * k, 0.06, (c, x0, y0, pw, ph) => {
    c.fillStyle = A.page; c.fillRect(x0, y0, pw, ph);
    d6_ui(c, 'Kasam', x0 + 16 * k, y0 + 52 * k, 19 * k, A.ink, { w: 700 });
    rr(c, x0 + 10 * k, y0 + 66 * k, pw - 20 * k, 92 * k, 16 * k); c.fillStyle = '#FFFFFF'; c.fill();
    const f = fit(c, '₺1.250.430', { f: 'Inter', w: 700, s: 29 * k }, pw - 44 * k);
    text(c, '₺1.250.430', x0 + 22 * k, y0 + 124 * k, { ...f, a: 'left', c: A.ink, ls: -0.5 });
    const rcx = x0 + pw / 2, rcy = y0 + 222 * k, rr0 = 44 * k;
    [[D6_APP.au2, 0.42], [D6.teal, 0.26], [D6.lav, 0.32]].reduce((a0, [col, f2]) => {
      const a1 = a0 + f2 * TAU; c.strokeStyle = col; c.lineWidth = 14 * k; c.lineCap = 'butt';
      c.beginPath(); c.arc(rcx, rcy, rr0, a0 + 0.05, a1 - 0.05); c.stroke(); return a1;
    }, -Math.PI / 2);
    [['Altın', D6_APP.au2], ['Döviz', D6.teal], ['Kişisel varlıklar', D6.lav]].forEach(([l, col], i) => {
      const ly = y0 + 300 * k + i * 22 * k;
      c.fillStyle = col; c.beginPath(); c.arc(x0 + 22 * k, ly - 4 * k, 5 * k, 0, TAU); c.fill();
      d6_ui(c, l, x0 + 34 * k, ly, 13 * k, A.ink, { w: 600 });
    });
  }, { glow: false, pad: 7 * k });
}
// iOS-style notification from the app
function d6_notif(g, x, y, w, h, title, body) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
  rr(g, x, y, w, h, 30); g.fillStyle = 'rgba(248,248,251,0.97)'; g.fill(); g.restore();
  d6_appIcon(g, x + 60, y + h / 2, 64);
  d6_ui(g, 'kripto724', x + 112, y + 46, 18, D6_APP.sec, { w: 600 });
  d6_ui(g, 'şimdi', x + w - 28, y + 46, 16, D6_APP.sec, { w: 500, a: 'right' });
  d6_ui(g, title, x + 112, y + 82, 23, D6_APP.ink, { w: 700 });
  d6_ui(g, body, x + 112, y + 114, 19, '#3B3F4C', { w: 500 });
}

/* A standard night panorama (sky → far shore → bridge → near shores), reused by several scenes. */
function d6_panorama(g, hz, o = {}) {
  d6_sky(g, hz, { seed: o.seed || 2, stars: o.stars });
  if (o.moon) d6_moon(g, ...o.moon);
  d6_hills(g, { base: hz, h: o.farH || 90, seed: (o.seed || 2) + 3, col: D6.far, blocks: 7, lights: 520, sc: 0.75, lightA: 0.75, mosque: o.mosque });
  const B = o.bridge ? d6_bridge(g, { base: hz, ...o.bridge }) : null;
  const L = o.left ? d6_hills(g, { base: hz, col: D6.mid, blocks: 9, lights: 320, seed: (o.seed || 2) + 8, ...o.left }) : null;
  const R = o.right ? d6_hills(g, { base: hz, col: D6.mid, blocks: 9, lights: 320, seed: (o.seed || 2) + 9, ...o.right }) : null;
  return { B, L, R };
}

/* ───────────── Kapalıçarşı ───────────── */
// mosaic lamp (Turkish mosaic glass): (x, y) globe centre, r radius, hanging from yTop
function d6_lantern(g, x, y, r, seed, yTop) {
  const brass = '#6B4416', brassL = '#C98A3A';
  if (yTop != null) { g.strokeStyle = hexA(brassL, 0.55); g.lineWidth = Math.max(1, r * 0.06); g.beginPath(); g.moveTo(x, yTop); g.lineTo(x, y - r * 1.25); g.stroke(); }
  addGlow(g, D6.or, x, y, r * 7, 0.42); addGlow(g, D6.orW, x, y, r * 2.4, 0.55);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#FFF3DC'); gr.addColorStop(0.55, D6.or); gr.addColorStop(1, '#7A300A');
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  const rnd = mulberry32(seed * 17 + 3), cs = r / 2.6;
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
    const cx = x + i * cs + (j % 2 ? cs / 2 : 0), cy = y + j * cs * 0.82, q = rnd();
    const col = q < 0.38 ? D6.or : q < 0.58 ? D6.red : q < 0.76 ? D6.teal : q < 0.9 ? D6.orW : '#F2C14E';
    g.fillStyle = hexA(col, 0.5 + rnd() * 0.4);
    g.beginPath(); g.moveTo(cx, cy - cs * 0.4); g.lineTo(cx + cs * 0.4, cy); g.lineTo(cx, cy + cs * 0.4); g.lineTo(cx - cs * 0.4, cy); g.fill();
  }
  const sh = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y, r * 1.05);
  sh.addColorStop(0, 'rgba(255,244,220,0.5)'); sh.addColorStop(0.55, 'rgba(255,200,140,0)'); sh.addColorStop(1, 'rgba(20,8,10,0.5)');
  g.fillStyle = sh; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
  // brass cap and finial
  g.fillStyle = brass;
  g.beginPath(); g.ellipse(x, y - r * 0.92, r * 0.42, r * 0.16, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x - r * 0.3, y - r * 0.95); g.quadraticCurveTo(x, y - r * 1.45, x + r * 0.3, y - r * 0.95); g.fill();
  g.beginPath(); g.ellipse(x, y + r * 0.95, r * 0.3, r * 0.12, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x - r * 0.18, y + r * 1.0); g.lineTo(x, y + r * 1.45); g.lineTo(x + r * 0.18, y + r * 1.0); g.fill();
  g.fillStyle = hexA(brassL, 0.8); g.fillRect(x - r * 0.42, y - r * 0.95, r * 0.84, Math.max(1, r * 0.05));
}
// one-point corridor of vaulted arches with jewellers' windows and hanging lamps. Returns the projector.
function d6_bazaar(g, o) {
  const { vx, vy } = o, HW = 560, FL = 610, SP = -150, TH = 62, LX = 200;
  const Pt = (X, Y, Z) => [vx + X / Z, vy + Y / Z];
  const zs = [16, 10.5, 7, 4.8, 3.3, 2.3, 1.62, 1.16];
  const fogC = '#141844';
  const fog = (col, Z) => mixHex(col, fogC, clamp((Z - 1.1) / 18) * 0.85);
  // vault (background) with a warm glow toward the far end
  const bg = g.createRadialGradient(vx, vy - 30, 20, vx, vy, 1250);
  bg.addColorStop(0, '#5B3A3E'); bg.addColorStop(0.18, '#2A2350'); bg.addColorStop(0.55, '#141A45'); bg.addColorStop(1, '#090C26');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // painted ceiling: rows of small rosettes along the barrel between arches
  const zf = zs[0];
  // far opening, lit
  const [fx0, fy0] = Pt(-HW, FL, zf), [fx1] = Pt(HW, FL, zf), fsp = Pt(0, SP, zf)[1], fr = HW / zf;
  const og = g.createLinearGradient(0, fsp - fr, 0, fy0); og.addColorStop(0, '#FFE9C4'); og.addColorStop(1, D6.orL);
  g.fillStyle = og; g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx0, fsp); g.arc(vx, fsp, fr, Math.PI, TAU); g.lineTo(fx1, fy0); g.closePath(); g.fill();
  addGlow(g, D6.orW, vx, fsp, 240, 0.75); addGlow(g, D6.or, vx, vy, 720, 0.32);
  // floor
  const zn = 0.55, [nl, nyy] = Pt(-HW, FL, zn), [nr] = Pt(HW, FL, zn);
  const fg = g.createLinearGradient(0, fy0, 0, H); fg.addColorStop(0, '#6B4A4A'); fg.addColorStop(0.12, '#2E2747'); fg.addColorStop(1, '#0A0C26');
  g.fillStyle = fg; g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx1, fy0); g.lineTo(nr, nyy); g.lineTo(nl, nyy); g.closePath(); g.fill();
  // floor slabs
  g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1.2;
  for (let Z = zf; Z > 0.6; Z /= 1.28) { const [a, yy] = Pt(-HW, FL, Z), [b] = Pt(HW, FL, Z); g.beginPath(); g.moveTo(a, yy); g.lineTo(b, yy); g.stroke(); }
  for (let X = -HW; X <= HW; X += HW / 3) { const a = Pt(X, FL, zf), b = Pt(X, FL, zn); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  // side walls
  for (const sd of [-1, 1]) {
    const a = Pt(sd * HW, SP, zf), b = Pt(sd * HW, FL, zf), c2 = Pt(sd * HW, FL, zn), d = Pt(sd * HW, SP, zn);
    const wg = g.createLinearGradient(a[0], 0, d[0], 0); wg.addColorStop(0, '#3A3058'); wg.addColorStop(1, '#141A45');
    g.fillStyle = wg; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c2); g.lineTo(...d); g.closePath(); g.fill();
  }
  const quad = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
  const lamps = [];
  for (let i = 0; i < zs.length - 1; i++) {
    const za = zs[i], zb = zs[i + 1], zm = 2 / (1 / za + 1 / zb);
    // jewellers' windows on both walls
    for (const sd of [-1, 1]) {
      const z0 = 1 / lerp(1 / za, 1 / zb, 0.1), z1 = 1 / lerp(1 / za, 1 / zb, 0.9), X = sd * HW;
      // sign board above, counter below
      quad([Pt(X, -150, z0), Pt(X, -150, z1), Pt(X, -82, z1), Pt(X, -82, z0)], fog('#0E1236', zm));
      quad([Pt(X, -146, z0), Pt(X, -146, z1), Pt(X, -140, z1), Pt(X, -140, z0)], fog(D6.or, zm));
      quad([Pt(X, 470, z0), Pt(X, 470, z1), Pt(X, FL, z1), Pt(X, FL, z0)], fog('#2A1E34', zm));
      const p0 = Pt(X, -60, z0), p1 = Pt(X, -60, z1);
      const wgr = g.createLinearGradient(p0[0], 0, p1[0], 0);
      wgr.addColorStop(0, fog('#FFD8A0', zm)); wgr.addColorStop(0.5, fog('#F7A23A', zm)); wgr.addColorStop(1, fog('#9C4A12', zm));
      quad([p0, p1, Pt(X, 450, z1), Pt(X, 450, z0)], wgr);
      // glass shelves with bangles and coins
      const rnd = mulberry32(i * 7 + (sd > 0 ? 3 : 1));
      for (const Y of [40, 150, 260, 370]) {
        const s0 = Pt(X, Y + 30, z0), s1 = Pt(X, Y + 30, z1);
        g.strokeStyle = hexA(D6.orW, 0.5); g.lineWidth = Math.max(0.8, 3 / zm); g.beginPath(); g.moveTo(...s0); g.lineTo(...s1); g.stroke();
        for (let t = 0.06; t < 0.95; t += 0.11) {
          const Z = 1 / lerp(1 / z0, 1 / z1, t), [bx, byy] = Pt(X, Y, Z), rr2 = (16 + rnd() * 10) / Z;
          g.strokeStyle = hexA(rnd() < 0.7 ? '#FFE08A' : D6.orW, 0.9); g.lineWidth = Math.max(0.8, 4.5 / Z);
          g.beginPath(); g.ellipse(bx, byy, rr2 * 0.42, rr2, 0, 0, TAU); g.stroke();
        }
      }
      if (zm < 3.5) addGlow(g, D6.or, (p0[0] + p1[0]) / 2, Pt(X, 200, zm)[1], 260 / zm, 0.4);
    }
    // painted vault: rosettes on the barrel between the arches
    for (let f = 1; f < 12; f++) {
      const ph = f / 12 * Math.PI, [ox, oy] = Pt(Math.cos(ph) * HW, SP - Math.sin(ph) * HW, zm), rs = 13 / zm;
      g.fillStyle = hexA(fog(f % 2 ? D6.orL : D6.teal, zm), 0.45);
      g.beginPath(); g.moveTo(ox, oy - rs); g.lineTo(ox + rs, oy); g.lineTo(ox, oy + rs); g.lineTo(ox - rs, oy); g.closePath(); g.fill();
    }
    const [lx, ly] = Pt(LX, -320, zm), ltop = Pt(LX, SP - Math.sqrt(HW * HW - LX * LX), zm)[1];
    lamps.push([lx, ly, 52 / zm, ltop, i, zm]);
    // soft pool of light on the floor under the lamp
    const fy = Pt(LX, FL, zm)[1];
    g.save(); g.translate(lx, fy); g.scale(1, 0.2); addGlow(g, D6.or, 0, 0, 320 / zm, 0.4); g.restore();
    d6_streak(g, lx, fy, 220 / zm, D6.orL, 36 / zm, 0.25, 70 + i);
    d6_lantern(g, lx, ly, 52 / zm, i, ltop);
    // the arch at zb: striped voussoirs and two piers
    const cy = Pt(0, SP, zb)[1], ri = HW / zb, ro = (HW + TH) / zb, fl = Pt(0, FL, zb)[1];
    for (const sd of [-1, 1]) {
      const xi = vx + sd * ri, xo = vx + sd * ro;
      // inner side of the pier (depth)
      const xd = vx + sd * HW / (zb * 1.06);
      quad([[xi, cy], [xd, Pt(0, SP, zb * 1.06)[1]], [xd, Pt(0, FL, zb * 1.06)[1]], [xi, fl]], fog('#241D44', zb));
      const pg = g.createLinearGradient(xo, 0, xi, 0); pg.addColorStop(0, fog('#3A3060', zb)); pg.addColorStop(1, fog('#5A4870', zb));
      g.fillStyle = pg; g.fillRect(Math.min(xi, xo), cy, Math.abs(xo - xi), fl - cy);
      g.fillStyle = fog('#C9A272', zb); g.fillRect(Math.min(xi, xo) - 3 / zb, cy - 14 / zb, Math.abs(xo - xi) + 6 / zb, 14 / zb);
    }
    const N = 17;
    for (let s = 0; s < N; s++) {
      const a0 = Math.PI + s / N * Math.PI, a1 = Math.PI + (s + 1) / N * Math.PI;
      g.beginPath(); g.arc(vx, cy, ro, a0, a1); g.arc(vx, cy, ri, a1, a0, true); g.closePath();
      g.fillStyle = fog(s % 2 ? '#94303A' : '#D6C2A0', zb); g.fill();
    }
    g.strokeStyle = fog('#0D1333', zb); g.lineWidth = Math.max(1, 3 / zb);
    g.beginPath(); g.arc(vx, cy, ro, Math.PI, TAU); g.stroke(); g.beginPath(); g.arc(vx, cy, ri, Math.PI, TAU); g.stroke();
  }
  return { Pt, HW, FL, SP, zs };
}

/* ───────────── scenes ───────────── */
const D6_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık ışıklar',
    desc: 'Gece silüetinde üç pencere yanar, her birinden ayrı bir ekran fırlar: kripto borsası, hisse uygulaması, reklamlı altın sitesi. Piyasa hiç durmuyor.',
    draw(g) {
      const hz = 770;
      d6_sky(g, hz, { seed: 1 });
      d6_hills(g, { base: hz, h: 80, seed: 4, col: D6.far, blocks: 7, lights: 520, sc: 0.75, lightA: 0.8, mosque: [1730, 32] });
      d6_bridge(g, { xa: 150, xb: 640, top: 590, deck: 690, base: hz, lit: 1, hangers: 22, nl: 26, ancL: 20, ancR: 760 });
      const hill = x => hz - 26 - 300 * E.inOutSine(clamp((x - 640) / 1100)) - 10 * Math.sin(x * 0.013);
      g.fillStyle = D6.mid; g.beginPath(); g.moveTo(610, hz + 2);
      for (let x = 610; x <= W + 10; x += 8) g.lineTo(x, hill(x));
      g.lineTo(W + 10, hz + 2); g.closePath(); g.fill();
      d6_apts(g, { x0: 780, x1: W + 40, base: x => hill(x) + 24, hmin: 26, hmax: 74, wmin: 34, wmax: 76, seed: 3, col: mixHex(D6.mid, D6.paper, 0.05), win: 6, litP: 0.3, ground: hz });
      d6_galata(g, 1250, hill(1250) + 80, 450);
      d6_apts(g, { x0: 700, x1: W + 40, base: x => lerp(hill(x), hz, 0.45) + 12, hmin: 40, hmax: 105, wmin: 46, wmax: 96, seed: 7, col: mixHex(D6.near, D6.paper, 0.045), win: 7, litP: 0.3, ground: hz });
      const front = d6_apts(g, { x0: 660, x1: W + 40, base: hz + 2, hmin: 46, hmax: 118, wmin: 56, wmax: 112, seed: 11, win: 8, litP: 0.32, ground: hz });
      const lit = front.flatMap(b => b.wins.filter(w => w[4]));
      const near = (tx, ty) => lit.reduce((a, w) => (Math.hypot(w[0] - tx, w[1] - ty) < Math.hypot(a[0] - tx, a[1] - ty) ? w : a), lit[0]);
      const srcs = [near(720, 700), near(1010, 690), near(1660, 690)];
      d6_water(g, hz, { seed: 4, k: 1.0 });
      const fade = g.createLinearGradient(0, 820, 0, H); fade.addColorStop(0, 'rgba(6,10,31,0)'); fade.addColorStop(0.5, 'rgba(6,10,31,0.6)'); fade.addColorStop(1, 'rgba(6,10,31,0.8)');
      g.fillStyle = fade; g.fillRect(0, 820, W, H - 820);
      d6_serif(g, 'Kripto bir yerde, hisse başka yerde,', 110, 922, 76, D6.paper);
      d6_serif(g, 'altın bambaşka bir sitede…', 110, 1010, 76, D6.or, { it: true, glow: 0.6 });
      addGlow(g, D6.red, 1500, 950, 26, 0.7); g.fillStyle = D6.red; g.beginPath(); g.arc(1500, 950, 6, 0, TAU); g.fill();
      d6_sans(g, '03:47', 1518, 958, 24, D6.soft, { w: 700 });
      d6_sans(g, 'Piyasa hiç durmuyor.', 1810, 1006, 36, D6.paper, { a: 'right', w: 800 });
      const screens = [
        { x: 380, y: 300, w: 480, h: 320, rot: -0.05, win: srcs[0] },
        { x: 905, y: 290, w: 236, h: 450, rot: 0.04, win: srcs[1] },
        { x: 1600, y: 300, w: 236, h: 450, rot: 0.07, win: srcs[2] },
      ];
      screens.forEach(s => {
        const [wx, wy, ww, wh] = s.win, cx = wx + ww / 2, cyy = wy + wh / 2;
        addGlow(g, D6.or, cx, cyy, 46, 0.9);
        g.fillStyle = D6.orW; g.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
        g.save(); g.setLineDash([3, 7]); g.lineCap = 'round'; g.strokeStyle = hexA(D6.or, 0.8); g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(cx, cyy); g.quadraticCurveTo(cx, (cyy + s.y + s.h / 2) / 2, s.x, s.y + s.h / 2 - 12); g.stroke(); g.restore();
        g.strokeStyle = hexA(D6.or, 0.8); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cyy, 16, 0, TAU); g.stroke();
      });
      // a cluttered gold-price website
      const S0 = screens[0];
      d6_phone(g, S0.x, S0.y, S0.w, S0.h, S0.rot, (c, x0, y0, w, h) => {
        c.fillStyle = '#F4F1EA'; c.fillRect(x0, y0, w, h);
        c.fillStyle = '#DCD8CF'; c.fillRect(x0, y0, w, 40);
        for (let i = 0; i < 3; i++) { c.fillStyle = '#B9B4A8'; c.beginPath(); c.arc(x0 + 18 + i * 16, y0 + 20, 5, 0, TAU); c.fill(); }
        rr(c, x0 + 72, y0 + 8, 170, 32, 8); c.fillStyle = '#F4F1EA'; c.fill();
        d6_ui(c, 'Altın Fiyatları', x0 + 86, y0 + 29, 13, '#333', { w: 600 });
        d6_ui(c, '×', x0 + 228, y0 + 29, 14, '#777', { w: 600, a: 'center' });
        rr(c, x0 + 10, y0 + 48, w - 20, 28, 14); c.fillStyle = '#FFFFFF'; c.fill();
        d6_icon(c, 'search', x0 + 28, y0 + 62, 13, '#888');
        d6_ui(c, 'gram altın fiyatı ne kadar', x0 + 42, y0 + 67, 13, '#666', { w: 500 });
        d6_ui(c, 'ALTIN FİYATLARI', x0 + 16, y0 + 104, 13, '#222', { w: 700, ls: 1 });
        [['Gram Altın', '6.510,83'], ['Çeyrek Altın', '10.476'], ['Ons Altın', '$4.033,60'], ['Tam Altın', '41.727']].forEach(([n, v], i) => {
          const ry = y0 + 116 + i * 30;
          c.fillStyle = i % 2 ? '#EBE7DE' : '#F9F7F2'; c.fillRect(x0 + 12, ry, 248, 30);
          d6_ui(c, n, x0 + 20, ry + 20, 13, '#333', { w: 600 });
          d6_ui(c, v, x0 + 252, ry + 20, 13, '#222', { w: 700, a: 'right' });
        });
        c.fillStyle = '#D8D3C7'; c.fillRect(x0 + 276, y0 + 92, 180, 150);
        c.strokeStyle = '#BDB7AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + 276, y0 + 92); c.lineTo(x0 + 456, y0 + 242); c.moveTo(x0 + 456, y0 + 92); c.lineTo(x0 + 276, y0 + 242); c.stroke();
        rr(c, x0 + 330, y0 + 154, 72, 26, 4); c.fillStyle = '#D8D3C7'; c.fill();
        d6_ui(c, 'REKLAM', x0 + 366, y0 + 172, 12, '#8A8476', { w: 700, a: 'center' });
        c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x0 + 444, y0 + 104, 10, 0, TAU); c.fill();
        d6_ui(c, '×', x0 + 444, y0 + 109, 14, '#666', { w: 700, a: 'center' });
        c.fillStyle = '#2D2B33'; c.fillRect(x0, y0 + h - 44, w, 44);
        d6_ui(c, 'Bu site çerez kullanır.', x0 + 16, y0 + h - 17, 13, '#DDD', { w: 500 });
        rr(c, x0 + w - 120, y0 + h - 36, 104, 28, 6); c.fillStyle = '#6A6A72'; c.fill();
        d6_ui(c, 'Kabul et', x0 + w - 68, y0 + h - 17, 13, '#FFF', { w: 700, a: 'center' });
      }, { glow: D6.paper, r: 18, pad: 10, notch: false });
      // a separate stocks app
      const S1 = screens[1];
      d6_phone(g, S1.x, S1.y, S1.w, S1.h, S1.rot, (c, x0, y0, w, h) => {
        const gr = c.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#13204A'); gr.addColorStop(1, '#0B1230');
        c.fillStyle = gr; c.fillRect(x0, y0, w, h);
        d6_ui(c, '03:47', x0 + 16, y0 + 22, 12, D6.paper, { w: 700 });
        d6_ui(c, 'Hisse', x0 + 16, y0 + 62, 20, D6.paper, { w: 700 });
        d6_ui(c, 'başka bir uygulama', x0 + 16, y0 + 82, 12, D6.soft, { w: 500 });
        d6_ui(c, 'BIST 100', x0 + 16, y0 + 112, 13, D6.or, { w: 700 });
        d6_ui(c, '11.165,44', x0 + 16, y0 + 144, 27, D6.paper, { w: 700 });
        d6_ui(c, '+0,13%', x0 + 16, y0 + 166, 13, D6.teal, { w: 700 });
        const pts = walk(41, 30, 0.004, 0.02).map((v, i, a) => [x0 + 16 + i * (w - 32) / 29, y0 + 238 - (v - Math.min(...a)) / (Math.max(...a) - Math.min(...a)) * 52]);
        d6_spark(c, pts, D6.teal, 2.5);
        [['AAPL', '$343,83', '−0,94%'], ['MSFT', '$531,01', '−0,06%'], ['NVDA', '$215,38', '−1,17%']].forEach((row, i) => {
          const ry = y0 + 290 + i * 40;
          c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(x0 + 10, ry - 22, w - 20, 34);
          d6_ui(c, row[0], x0 + 18, ry, 14, D6.paper, { w: 700 });
          d6_ui(c, row[1], x0 + w - 18, ry - 4, 12, D6.paper, { w: 600, a: 'right' });
          d6_ui(c, row[2], x0 + w - 18, ry + 9, 11, '#FF6B70', { w: 700, a: 'right' });
        });
        c.fillStyle = D6.red; c.beginPath(); c.arc(x0 + w - 24, y0 + 56, 11, 0, TAU); c.fill();
        d6_ui(c, '3', x0 + w - 24, y0 + 61, 13, '#FFFFFF', { w: 700, a: 'center' });
      }, { glow: D6.teal });
      // a crypto exchange
      const S2 = screens[2];
      d6_phone(g, S2.x, S2.y, S2.w, S2.h, S2.rot, (c, x0, y0, w, h) => {
        const gr = c.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#1D1640'); gr.addColorStop(1, '#0E0B26');
        c.fillStyle = gr; c.fillRect(x0, y0, w, h);
        d6_ui(c, '03:47', x0 + 16, y0 + 22, 12, D6.paper, { w: 700 });
        d6_ui(c, 'Kripto borsası', x0 + 16, y0 + 62, 20, D6.paper, { w: 700 });
        d6_ui(c, 'BTC/USDT', x0 + 16, y0 + 92, 13, D6.or, { w: 700 });
        d6_ui(c, '$80.220,05', x0 + 16, y0 + 124, 25, D6.paper, { w: 700 });
        d6_ui(c, '−1,49%', x0 + 16, y0 + 146, 13, '#FF6B70', { w: 700 });
        const r = mulberry32(8); let v = 0.7;
        for (let i = 0; i < 14; i++) {
          const o2 = v; v = clamp(v + (r() - 0.55) * 0.26, 0.08, 0.95);
          const up = v >= o2, cx = x0 + 20 + i * 14.4, col = up ? D6.teal : '#FF6B70', hi = Math.max(o2, v), lo = Math.min(o2, v);
          c.fillStyle = col; c.fillRect(cx - 1, y0 + 272 - hi * 100 - 8 - r() * 6, 2, (hi - lo) * 100 + 18 + r() * 6);
          c.fillRect(cx - 5, y0 + 272 - hi * 100, 10, Math.max(4, (hi - lo) * 100));
        }
        [['ETH', '−1,67%'], ['SOL', '−2,17%'], ['XRP', '−2,64%']].forEach((row, i) => {
          const ry = y0 + 310 + i * 40;
          c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(x0 + 10, ry - 22, w - 20, 34);
          d6_ui(c, row[0], x0 + 18, ry, 14, D6.paper, { w: 700 });
          d6_ui(c, row[1], x0 + w - 18, ry, 13, '#FF6B70', { w: 700, a: 'right' });
        });
      }, { glow: D6.lav });
      d6_gull(g, 1370, 110, 32, { flap: 0.2, a: 0.9 });
      d6_gull(g, 1445, 150, 21, { flap: 0.7, a: 0.7 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Köprü yanar',
    desc: 'Köprünün kablo ışıkları uçtan uca turuncu yanar; resmî kripto724 logosu Boğaz\'ın üstünde doğar. "Kripto, borsa ve emtia tek uygulamada." suda belirir.',
    draw(g) {
      const hz = 730;
      const P = d6_panorama(g, hz, {
        seed: 2, mosque: [1790, 30],
        bridge: { xa: 360, xb: 1560, top: 480, deck: 650, lit: 0.9, ancL: 70, ancR: 1850, hangers: 36, nl: 54 },
        left: { h: 210, x0: -20, x1: 380, env: [-999, -998, 180, 380] },
        right: { h: 220, x0: 1540, x1: W + 20, env: [1540, 1820, 3000, 3100] },
      });
      d6_galata(g, 150, P.L(150) + 46, 215);
      d6_water(g, hz, { seed: 2, k: 0.95 });
      d6_bridgeStreaks(g, P.B, hz, 0.3, 0.5);
      d6_ferry(g, 1660, 820, 220, { dir: -1, seed: 3 });
      d6_gull(g, 1500, 430, 30, { flap: 0.3 }); d6_gull(g, 1580, 470, 20, { flap: 0.8, a: 0.8 });
      // the logo rises over the strait
      const vg = g.createRadialGradient(CX, 300, 40, CX, 300, 560); vg.addColorStop(0, 'rgba(5,8,24,0.6)'); vg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = vg; g.fillRect(0, 0, W, 700);
      addGlow(g, D6.or, CX, 300, 520, 0.2);
      g.save(); g.shadowColor = hexA(D6.or, 0.45); g.shadowBlur = 50; logo(g, CX, 298, 270, { ink: '#FFFFFF' }); g.restore();
      const bg = g.createLinearGradient(0, 800, 0, H); bg.addColorStop(0, 'rgba(5,8,24,0)'); bg.addColorStop(0.45, 'rgba(5,8,24,0.62)'); bg.addColorStop(1, 'rgba(5,8,24,0.8)');
      g.fillStyle = bg; g.fillRect(0, 800, W, H - 800);
      d6_serif(g, 'Kripto, borsa ve emtia', CX, 912, 84, D6.paper, { a: 'center' });
      d6_serif(g, 'tek uygulamada.', CX, 1022, 102, D6.or, { a: 'center', it: true, glow: 0.7 });
    },
  },
  {
    time: '8–12 sn', title: 'Kripto: Sönmeyen ışıklar',
    desc: 'Pencerelerden yükselen ışıklar coin\'e dönüşür ve uygulamanın canlı kripto tablosuna dizilir: BTC\'den ADA\'ya fiyat, günlük ve haftalık değişim, ● CANLI.',
    draw(g) {
      const hz = 700;
      const P = d6_panorama(g, hz, {
        seed: 3, stars: 130,
        bridge: { xa: -90, xb: 1120, top: 500, deck: 632, lit: 1, ancL: -400, ancR: 1500, hangers: 36, nl: 50 },
        left: { h: 120, x0: -20, x1: 300, env: [-999, -998, 80, 300], blocks: 10 },
        right: { h: 150, x0: 640, x1: W + 20, env: [640, 860, 3000, 3100], blocks: 10 },
      });
      d6_water(g, hz, { seed: 3, k: 0.9 });
      d6_bridgeStreaks(g, P.B, hz, 0.28, 0.6);
      // lights rising from the city, each a coin
      const coins = [['BTC', 250, 600, 30], ['ETH', 470, 560, 24], ['XRP', 640, 640, 20], ['SOL', 360, 668, 17], ['DOGE', 720, 548, 15], ['BNB', 110, 640, 20], ['ADA', 560, 676, 13]];
      coins.forEach(([sym, x, y, r], i) => {
        const tl = 90 + r * 5, tg = g.createLinearGradient(0, y, 0, y + tl); tg.addColorStop(0, hexA(D6.or, 0.22)); tg.addColorStop(1, hexA(D6.or, 0));
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = tg;
        g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.6); g.quadraticCurveTo(x - r * 0.1, y + tl * 0.5, x, y + tl); g.quadraticCurveTo(x + r * 0.1, y + tl * 0.5, x + r * 0.45, y + r * 0.6); g.closePath(); g.fill();
        for (let k = 0; k < 4; k++) { const sy2 = y + r + 14 + k * (tl - r) / 4, sx2 = x + Math.sin(i * 3 + k * 2.1) * r * 0.5; g.fillStyle = hexA(D6.orW, 0.5 - k * 0.1); g.beginPath(); g.arc(sx2, sy2, 1.6, 0, TAU); g.fill(); }
        g.restore();
        addGlow(g, D6.or, x, y, r * 4, 0.55);
        g.save(); g.shadowColor = hexA(D6.or, 0.9); g.shadowBlur = r; d6_coin(g, x, y, r, sym); g.restore();
        g.strokeStyle = hexA(D6.orW, 0.6); g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 4, 0, TAU); g.stroke();
      });
      const lg = g.createLinearGradient(0, 0, 820, 0); lg.addColorStop(0, 'rgba(5,8,24,0.6)'); lg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = lg; g.fillRect(0, 0, 820, 520);
      d6_kicker(g, 'Gece gündüz', 104, 168);
      d6_serif(g, 'Canlı fiyatlar,', 100, 282, 96, D6.paper);
      d6_serif(g, '7/24.', 96, 422, 150, D6.or, { it: true, glow: 0.7 });
      d6_sans(g, 'BTC, ETH, XRP ve fazlası; günlük ve haftalık değişimiyle.', 104, 486, 25, D6.soft, { w: 600 });
      d6_float(g, 918, c => {
        addGlow(c, D6.or, 1340, 500, 700, 0.14);
        d6_cryptoCard(c, 860, 112, 960);
      }, { a: 0.11, depth: 150 });
    },
  },
  {
    time: '12–16 sn', title: 'Borsa: BIST’ten Nasdaq’a',
    desc: 'İstanbul\'dan New York\'a okyanusu aşan bir ışık yayı: uçlarında BIST 100 ve Nasdaq 100 kartları. Telefonda Borsa ekranı: 210 hisse, BIST 108 · Nasdaq 102.',
    draw(g) {
      const hz = 905;
      d6_sky(g, hz, { seed: 4, stars: 110, haze: 0.1 });
      const kx = 12.2, ny = [330, 300];
      const Pm = (la, lo) => [ny[0] + (lo + 74) * kx, ny[1] + (40.7 - la) * kx];
      for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
        const [x, y] = Pm(GLOBE_DOTS[i], GLOBE_DOTS[i + 1]);
        if (x < -6 || x > W + 6 || y < 20 || y > 780) continue;
        const hsh = Math.abs(Math.sin(GLOBE_DOTS[i] * 12.9898 + GLOBE_DOTS[i + 1] * 78.233) * 43758.5453) % 1;
        g.fillStyle = hexA(hsh > 0.93 ? D6.paper : D6.or, (0.12 + 0.5 * hsh * hsh) * (y > 700 ? clamp((780 - y) / 80) : 1));
        g.beginPath(); g.arc(x, y, 1.6 + hsh * 1.4, 0, TAU); g.fill();
      }
      [[51.5, -0.1], [48.9, 2.35], [50.1, 8.7], [40.4, -3.7], [41.9, 12.5], [52.5, 13.4], [43.7, -79.4], [41.9, -87.6], [38.9, -77], [25.8, -80.2], [30, 31.2], [37.9, 23.7]].forEach(([la, lo]) => { const [x, y] = Pm(la, lo); addGlow(g, D6.or, x, y, 24, 0.45); });
      const ist = Pm(41.0, 29.0), nyc = Pm(40.7, -74), ctl = [(ist[0] + nyc[0]) / 2, -150];
      const Q = t => [(1 - t) * (1 - t) * nyc[0] + 2 * t * (1 - t) * ctl[0] + t * t * ist[0], (1 - t) * (1 - t) * nyc[1] + 2 * t * (1 - t) * ctl[1] + t * t * ist[1]];
      g.save(); g.globalCompositeOperation = 'lighter';
      g.strokeStyle = hexA(D6.or, 0.4); g.lineWidth = 3; g.beginPath(); g.moveTo(...nyc); g.quadraticCurveTo(...ctl, ...ist); g.stroke();
      for (let k = 0; k <= 60; k++) { const [x, y] = Q(k / 60); addGlow(g, D6.or, x, y, 12, 0.5); g.fillStyle = D6.orW; g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); }
      for (const t of [0.22, 0.71]) { const [x, y] = Q(t); addGlow(g, D6.orW, x, y, 60, 0.8); addGlow(g, D6.or, x, y, 110, 0.5); }
      g.restore();
      // pins
      [[nyc, D6.or, 'New York', 'right'], [ist, D6.red, 'İstanbul', 'left']].forEach(([[x, y], col, name, al]) => {
        for (const [rad, a] of [[40, 0.25], [24, 0.5]]) { g.strokeStyle = hexA(col, a); g.lineWidth = 2; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.stroke(); }
        addGlow(g, col, x, y, 56, 0.8); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill();
        g.save(); g.shadowColor = 'rgba(5,8,24,0.95)'; g.shadowBlur = 10;
        d6_serif(g, name, al === 'right' ? x - 50 : x + 50, y - 22, 36, col === D6.red ? D6.paper : D6.or, { it: true, a: al }); g.restore();
        g.save(); g.setLineDash([2, 6]); g.lineCap = 'round'; g.strokeStyle = hexA(D6.paper, 0.6); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 12); g.lineTo(x, 372); g.stroke(); g.restore();
      });
      // İstanbul shore at the bottom right, open ocean on the left
      d6_hills(g, { base: hz, h: 70, x0: 1120, seed: 44, col: D6.far, blocks: 6, lights: 260, sc: 0.75, lightA: 0.7, env: [1120, 1300, 3000, 3100], mosque: [1820, 26] });
      const B = d6_bridge(g, { xa: 1330, xb: 1720, top: 790, deck: 858, base: hz, lit: 1, hangers: 22, nl: 28, ancL: 1200, ancR: 1850 });
      const RL = d6_hills(g, { base: hz, h: 120, x0: 1180, x1: 1340, env: [1180, 1260, 1290, 1340], seed: 46, col: D6.mid, blocks: 10, lights: 90 });
      d6_galata(g, 1262, RL(1262) + 30, 150);
      d6_hills(g, { base: hz, h: 110, x0: 1730, x1: W + 20, env: [1730, 1820, 3000, 3100], seed: 47, col: D6.mid, blocks: 10, lights: 90 });
      d6_water(g, hz, { seed: 6, shimmer: 120, k: 0.8 });
      d6_bridgeStreaks(g, B, hz, 0.3, 0.6);
      d6_indexCard(g, 110, 372, 450, 196, 'Nasdaq 100', '29.813,16', '+0,55%', 503);
      d6_indexCard(g, 1362, 372, 450, 196, 'BIST 100', '11.165,44', '+0,13%', 517);
      // headline, bottom left
      const lg = g.createRadialGradient(330, 860, 40, 330, 860, 620); lg.addColorStop(0, 'rgba(5,8,24,0.75)'); lg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = lg; g.fillRect(0, 560, 900, H - 560);
      d6_kicker(g, '210 hisse · canlı', 104, 652);
      const f1 = fit(g, 'BIST’ten Nasdaq’a,', { f: D6_SERIF, w: 400, s: 70 }, 600);
      d6_serif(g, 'BIST’ten Nasdaq’a,', 100, 740, f1.s, D6.paper);
      d6_serif(g, '210 hisse.', 98, 850, 112, D6.or, { it: true, glow: 0.6 });
      d6_sans(g, 'BIST 108 · Nasdaq 102', 104, 910, 28, D6.paper, { w: 800 });
      let cx = 104;
      [['Popüler'], ['Yükselenler'], ['Düşenler'], ['Favoriler', true]].forEach(([l, st]) => {
        const tw = measure(g, l, { f: D6_SANS, w: 700, s: 20 }) + (st ? 24 : 0), pw = tw + 32;
        rr(g, cx, 950, pw, 42, 21); g.fillStyle = 'rgba(13,19,51,0.92)'; g.fill(); g.strokeStyle = hexA(D6.or, 0.6); g.lineWidth = 1.5; g.stroke();
        if (st) d6_star(g, cx + 26, 971, 9, D6.or);
        d6_sans(g, l, cx + 16 + (st ? 24 : 0), 978, 20, D6.paper, { w: 700 });
        cx += pw + 12;
      });
      // the Borsa screen
      d6_phone(g, 960, 612, 440, 870, 0, d6_borsa, { glow: D6.or, glowA: 0.25, pad: 11 });
    },
  },
  {
    time: '16–20 sn', title: 'Emtia: Kapalıçarşı',
    desc: 'Kapalıçarşı\'nın kemerli sokağında mozaik lambalar yanar, kuyumcu camlarında fiyatlar parlar. Uygulamanın canlı altın kartı: gram, çeyrek, ata; alış/satış, ₺ TL / $ USD.',
    draw(g) {
      const BZ = d6_bazaar(g, { vx: 610, vy: 440 });
      const { Pt, HW } = BZ;
      // price boards in the jewellers' windows (satış)
      [[-1, 1.35, 'Yarım Altın', '₺20.815'], [-1, 2.71, 'Tam Altın', '₺41.727'], [1, 1.9, 'Has Altın', '₺6.491,36'], [1, 3.9, '22 Ayar', '₺6.081,88']].forEach(([sd, Z, n, v]) => {
        const [bx, by] = Pt(sd * (HW - 30), 150, Z), bw = 250 / Z, bh = 112 / Z;
        g.save(); g.shadowColor = hexA(D6.or, 0.6); g.shadowBlur = 24 / Z;
        rr(g, bx - bw / 2, by - bh / 2, bw, bh, 12 / Z); g.fillStyle = 'rgba(10,12,38,0.94)'; g.fill(); g.restore();
        g.strokeStyle = hexA(D6.or, 0.8); g.lineWidth = Math.max(1, 2.5 / Z); rr(g, bx - bw / 2, by - bh / 2, bw, bh, 12 / Z); g.stroke();
        d6_ui(g, n, bx, by - bh * 0.12, 26 / Z, D6.orL, { w: 700, a: 'center' });
        d6_ui(g, v, bx, by + bh * 0.32, 36 / Z, D6.paper, { w: 700, a: 'center' });
      });
      // hanging sign with the headline
      const sx = 56, sy = 74, sw = 560, sh = 262;
      g.strokeStyle = hexA('#C98A3A', 0.8); g.lineWidth = 3;
      g.beginPath(); g.moveTo(sx + 90, 0); g.lineTo(sx + 90, sy); g.moveTo(sx + sw - 90, 0); g.lineTo(sx + sw - 90, sy); g.stroke();
      g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
      rr(g, sx, sy, sw, sh, 18); g.fillStyle = '#0D1333'; g.fill(); g.restore();
      g.lineWidth = 2; g.strokeStyle = hexA(D6.or, 0.8); rr(g, sx + 8, sy + 8, sw - 16, sh - 16, 12); g.stroke();
      d6_kicker(g, 'Gram · çeyrek · tam · ata', sx + 40, sy + 62, D6.or, { s: 19 });
      d6_serif(g, 'Kapalıçarşı’dan', sx + 38, sy + 146, 66, D6.paper);
      d6_serif(g, 'canlı altın.', sx + 36, sy + 226, 82, D6.or, { it: true, glow: 0.5 });
      // commodities, bottom left
      const bg = g.createLinearGradient(0, 860, 0, H); bg.addColorStop(0, 'rgba(6,8,26,0)'); bg.addColorStop(1, 'rgba(6,8,26,0.85)');
      g.fillStyle = bg; g.fillRect(0, 860, 1060, H - 860);
      d6_kicker(g, 'Emtia', 64, 968, D6.or, { s: 20 });
      let cx = 64;
      ['Altın', 'Gümüş', 'Petrol', 've fazlası'].forEach((l, i) => {
        const pw = measure(g, l, { f: D6_SANS, w: 700, s: 22 }) + 36;
        rr(g, cx, 990, pw, 46, 23); g.fillStyle = i === 0 ? D6.or : 'rgba(13,19,51,0.92)'; g.fill();
        if (i) { g.strokeStyle = hexA(D6.or, 0.6); g.lineWidth = 1.5; g.stroke(); }
        d6_sans(g, l, cx + 18, 1021, 22, i === 0 ? D6.navy : D6.paper, { w: 700 });
        cx += pw + 12;
      });
      // the app's gold card
      addGlow(g, D6.or, 1450, 520, 560, 0.18);
      d6_goldCard(g, 1066, 74, 800);
    },
  },
  {
    time: '20–24 sn', title: 'Kasam: Kız Kulesi nöbette',
    desc: 'Kız Kulesi\'nin feneri Kasam kartını aydınlatır; ayın çevresinde 24 çentikli bir kasa kadranı döner. Altın, döviz ve kişisel varlıklar tek ekranda: ₺1.250.430.',
    draw(g) {
      const hz = 790;
      d6_sky(g, hz, { seed: 8, stars: 150 });
      const mx = 1590, my = 132;
      d6_moon(g, mx, my, 50);
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU - Math.PI / 2, big = i % 6 === 0;
        g.strokeStyle = big ? D6.or : hexA(D6.paper, 0.45); g.lineWidth = big ? 3 : 1.6; g.lineCap = 'round';
        g.beginPath(); g.moveTo(mx + Math.cos(a) * 74, my + Math.sin(a) * 74); g.lineTo(mx + Math.cos(a) * (big ? 92 : 84), my + Math.sin(a) * (big ? 92 : 84)); g.stroke();
      }
      g.strokeStyle = hexA(D6.or, 0.35); g.lineWidth = 1.5; g.beginPath(); g.arc(mx, my, 68, 0, TAU); g.stroke();
      d6_hills(g, { base: hz, h: 90, seed: 61, col: D6.far, blocks: 7, lights: 560, sc: 0.75, lightA: 0.75, mosque: [1210, 30] });
      d6_hills(g, { base: hz, h: 150, x0: -20, x1: 300, env: [-999, -998, 120, 300], seed: 62, col: D6.mid, blocks: 9, lights: 140 });
      d6_hills(g, { base: hz, h: 130, x0: 1640, x1: W + 20, env: [1640, 1800, 3000, 3100], seed: 63, col: D6.mid, blocks: 9, lights: 140 });
      d6_water(g, hz, { seed: 8, k: 0.95 });
      d6_streak(g, mx, hz, 290, '#FFF3D6', 90, 0.4, 19);
      const kx = 430, kwy = 862, ks = 440;
      let lan = null;
      d6_float(g, kwy, c => { lan = d6_kiz(c, kx, kwy, ks); }, { a: 0.35, depth: 220 });
      // lantern beam reaching the card
      g.save(); g.globalCompositeOperation = 'lighter';
      const bm = g.createLinearGradient(lan[0], 0, 900, 0); bm.addColorStop(0, hexA(D6.or, 0.4)); bm.addColorStop(1, hexA(D6.or, 0));
      g.fillStyle = bm; g.beginPath(); g.moveTo(lan[0], lan[1] - 6); g.lineTo(900, 300); g.lineTo(900, 700); g.lineTo(lan[0], lan[1] + 6); g.closePath(); g.fill();
      g.restore();
      addGlow(g, D6.orW, lan[0], lan[1], 60, 0.9);
      d6_streak(g, kx, kwy + 2, 200, D6.or, 40, 0.5, 23);
      d6_gull(g, 760, 520, 28, { flap: 0.3, a: 0.9 }); d6_gull(g, 820, 560, 18, { flap: 0.75, a: 0.7 });
      d6_kicker(g, 'Kasam', 104, 132);
      d6_serif(g, 'Altının, dövizin,', 100, 232, 88, D6.paper);
      d6_serif(g, 'hepsi Kasam’da.', 98, 334, 96, D6.or, { it: true, glow: 0.6 });
      d6_float(g, hz, c => d6_kasam(c, 880, 268, 960, 470), { a: 0.2, depth: 200 });
    },
  },
  {
    time: '24–29 sn', title: 'Alarm ve analiz: Galata',
    desc: 'Gözcü kulesi Galata\'dan sinyal halkaları yayılır, bildirim düşer: BTC alarmı. Hisse analizi, teknik analiz, fiyat tahmini, sinyal alarmları; altta Akış ve Haberler.',
    draw(g) {
      const base = 985;
      d6_sky(g, 800, { seed: 12, stars: 160, haze: 0.16 });
      g.fillStyle = '#2D2B63'; g.fillRect(0, 800, W, H - 800);
      d6_hills(g, { base: 800, h: 70, seed: 71, col: D6.far, blocks: 7, lights: 420, sc: 0.75, lightA: 0.7, mosque: [1650, 30] });
      d6_hills(g, { base: 1000, h: 300, seed: 72, col: D6.mid, blocks: 9, lights: 520, sc: 0.95, lightA: 0.8 });
      const gx = 1000, gs = 790, gb = 905;
      // signal rings from the gallery
      const gal = [gx, gb - gs * 0.625];
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      [[150, 0.75], [250, 0.55], [360, 0.38], [480, 0.22]].forEach(([rad, a]) => {
        g.strokeStyle = hexA(D6.or, a); g.lineWidth = 4;
        g.beginPath(); g.arc(gal[0], gal[1], rad, -0.95, 0.35); g.stroke();
        if (rad < 260) { g.beginPath(); g.arc(gal[0], gal[1], rad, Math.PI - 0.35, Math.PI + 0.95); g.stroke(); }
      });
      g.restore();
      d6_galata(g, gx, gb, gs);
      addGlow(g, D6.or, gal[0], gal[1], 200, 0.4);
      d6_apts(g, { x0: 600, x1: 1420, base: base, hmin: 90, hmax: 210, wmin: 60, wmax: 120, seed: 74, win: 9, litP: 0.38, ground: base });
      d6_apts(g, { x0: -30, x1: 640, base: base, hmin: 60, hmax: 150, wmin: 60, wmax: 120, seed: 75, win: 9, litP: 0.35, ground: base, col: mixHex(D6.near, D6.paper, 0.03) });
      d6_apts(g, { x0: 1400, x1: W + 40, base: base, hmin: 70, hmax: 170, wmin: 60, wmax: 120, seed: 76, win: 9, litP: 0.35, ground: base, col: mixHex(D6.near, D6.paper, 0.03) });
      // headline + features
      const lg = g.createLinearGradient(0, 0, 820, 0); lg.addColorStop(0, 'rgba(5,8,24,0.65)'); lg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = lg; g.fillRect(0, 0, 820, 700);
      d6_kicker(g, 'Alarm · analiz · haber', 104, 132);
      d6_serif(g, 'Alarmını kur,', 100, 232, 90, D6.paper);
      d6_serif(g, 'analizleri incele.', 98, 332, 90, D6.or, { it: true, glow: 0.6 });
      [['Hisse analizi', 'chart'], ['Teknik analiz', 'candles'], ['Fiyat tahmini', 'forecast'], ['Sinyal alarmları', 'signal']].forEach(([l, ic], i) => {
        const tx = 100 + (i % 2) * 340, ty = 404 + Math.floor(i / 2) * 128, tw = 322, th = 110;
        g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30; rr(g, tx, ty, tw, th, 20); g.fillStyle = 'rgba(13,19,51,0.94)'; g.fill(); g.restore();
        g.lineWidth = 1.5; g.strokeStyle = hexA(D6.or, 0.5); rr(g, tx, ty, tw, th, 20); g.stroke();
        addGlow(g, D6.or, tx + 56, ty + th / 2, 50, 0.4);
        g.fillStyle = hexA(D6.or, 0.16); g.beginPath(); g.arc(tx + 56, ty + th / 2, 31, 0, TAU); g.fill();
        g.strokeStyle = hexA(D6.or, 0.8); g.lineWidth = 1.5; g.stroke();
        d6_icon(g, ic, tx + 56, ty + th / 2, 30, D6.or, 2.6);
        d6_sans(g, l, tx + 102, ty + th / 2 + 9, 24, D6.paper, { w: 700 });
      });
      // notification and the chart with the alarm line
      d6_notif(g, 1240, 104, 620, 150, 'Fiyat alarmı · BTC/USDT', 'Bitcoin $80.220,05 · alarm seviyene yaklaştı');
      const cx0 = 1240, cy0 = 290, cw = 620, chh = 360, A = D6_APP;
      d6_sheet(g, cx0, cy0, cw, chh, { r: 24, sh: 0.55 });
      d6_coin(g, cx0 + 46, cy0 + 50, 21, 'BTC');
      d6_ui(g, 'BTC/USDT', cx0 + 80, cy0 + 46, 21, A.ink, { w: 700 });
      d6_ui(g, 'Teknik analiz', cx0 + 80, cy0 + 70, 15, A.sec, { w: 600 });
      d6_ui(g, '$80.220,05', cx0 + cw - 26, cy0 + 47, 22, A.ink, { w: 700, a: 'right' });
      d6_pct(g, cx0 + cw - 26, cy0 + 74, '−1,49%', 13);
      const px0 = cx0 + 26, px1 = cx0 + cw - 160, py0 = cy0 + 104, py1 = cy0 + chh - 26;
      const N = 26, rnd = mulberry32(731), cl = [];
      let v = 82300;
      for (let i = 0; i < N; i++) { v += (rnd() - 0.6) * 260 - 25; cl.push(v); }
      const dd = 80220.05 - cl[N - 1]; cl.forEach((q, i) => { cl[i] = q + dd * i / (N - 1); });
      const lo = 79650, hi = 83000, yv = q => py1 - (q - lo) / (hi - lo) * (py1 - py0);
      g.strokeStyle = A.hair; g.lineWidth = 1.5;
      for (let k = 0; k <= 3; k++) { const yy = lerp(py0, py1, k / 3); g.beginPath(); g.moveTo(px0, yy); g.lineTo(cx0 + cw - 26, yy); g.stroke(); }
      const stp = (px1 - px0) / N;
      cl.forEach((c2, i) => {
        const o2 = i ? cl[i - 1] : c2 + 120, up = c2 >= o2, xx = px0 + stp * (i + 0.5), wick = 60 + rnd() * 120;
        g.fillStyle = up ? A.up : A.dn;
        g.fillRect(xx - 1, yv(Math.max(o2, c2) + wick), 2, yv(Math.min(o2, c2) - wick) - yv(Math.max(o2, c2) + wick));
        g.fillRect(xx - stp * 0.3, yv(Math.max(o2, c2)), stp * 0.6, Math.max(2, yv(Math.min(o2, c2)) - yv(Math.max(o2, c2))));
      });
      const ay = yv(80000);
      g.save(); g.setLineDash([8, 6]); g.strokeStyle = D6.or; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px0, ay); g.lineTo(cx0 + cw - 150, ay); g.stroke(); g.restore();
      rr(g, cx0 + cw - 150, ay - 19, 128, 38, 19); g.fillStyle = D6.or; g.fill();
      d6_icon(g, 'bell', cx0 + cw - 128, ay, 18, '#FFFFFF', 2.2);
      d6_ui(g, '$80.000', cx0 + cw - 112, ay + 6.5, 17, '#FFFFFF', { w: 700 });
      const lx = px0 + stp * (N - 0.5), lyy = yv(cl[N - 1]);
      addGlow(g, D6.or, lx, lyy, 40, 0.6); g.fillStyle = D6.or; g.beginPath(); g.arc(lx, lyy, 5, 0, TAU); g.fill();
      // feed / news ticker on the quay
      const ty = 990, th = 90;
      g.fillStyle = '#060A1F'; g.fillRect(0, ty, W, th);
      g.fillStyle = D6.or; g.fillRect(0, ty, W, 3);
      rr(g, 40, ty + 22, 254, 46, 23); g.fillStyle = D6.or; g.fill();
      d6_sans(g, 'AKIŞ · HABERLER', 167, ty + 53, 19, D6.navy, { w: 800, a: 'center', ls: 2 });
      let tx = 330;
      [['BTC', '$80.220,05', '−1,49%'], ['BIST 100', '11.165,44', '+0,13%'], ['Nasdaq 100', '29.813,16', '+0,55%'], ['Gram Altın', '₺6.510,83', '+0,40%'], ['ETH', '$2.325,10', '−1,67%']].forEach(([n, v2, p]) => {
        if (tx > W) return;
        d6_ui(g, n, tx, ty + 54, 22, D6.paper, { w: 700 }); tx += d6_uiw(g, n, 22, 700) + 12;
        d6_ui(g, v2, tx, ty + 54, 22, D6.soft, { w: 600 }); tx += d6_uiw(g, v2, 22, 600) + 10;
        d6_ui(g, p, tx, ty + 54, 22, p[0] === '+' ? '#34D399' : '#FF6B70', { w: 700 }); tx += d6_uiw(g, p, 22, 700) + 26;
        g.fillStyle = D6.or; g.beginPath(); g.arc(tx - 13, ty + 46, 3, 0, TAU); g.fill(); tx += 14;
      });
      const fg = g.createLinearGradient(W - 180, 0, W, 0); fg.addColorStop(0, 'rgba(6,10,31,0)'); fg.addColorStop(1, 'rgba(6,10,31,1)');
      g.fillStyle = fg; g.fillRect(W - 180, ty + 3, 180, th - 3);
      g.fillStyle = 'rgba(0,0,0,0.22)'; for (let x = 0; x < W; x += 4) g.fillRect(x, ty + 3, 1, th - 3);
    },
  },
  {
    time: '29–34 sn', title: 'Bağla: Vapurlar iskelede',
    desc: 'Binance, Bitget ve MEXC vapurları kripto724 iskelesine yanaşır, rotaları bağlantı çizgisine döner. Binance\'te %10 komisyon indirimi; "Kripto Hakkında Her Şey" videoları.',
    draw(g) {
      const hz = 560;
      d6_panorama(g, hz, {
        seed: 5, farH: 70, moon: [1060, 168, 50],
        bridge: { xa: 560, xb: 1000, top: 425, deck: 510, lit: 1, hangers: 20, nl: 26, ancL: 410, ancR: 1150 },
        left: { h: 110, x0: -20, x1: 470, env: [-999, -998, 250, 470], sc: 0.85 },
        right: { h: 100, x0: 1120, x1: W + 20, env: [1120, 1360, 3000, 3100], sc: 0.85 },
      });
      d6_water(g, hz, { seed: 5, k: 1.0 });
      d6_streak(g, 1060, hz, 480, '#FFF3D6', 110, 0.45, 9);
      d6_streak(g, 1060, hz, 380, D6.or, 46, 0.35, 10);
      const pier = { x: 1210, wy: 800 };
      const ferries = [
        { name: 'Bitget', x: 640, wy: 655, L: 210, dir: 1 },
        { name: 'MEXC', x: 1690, wy: 690, L: 240, dir: -1 },
        { name: 'Binance', x: 520, wy: 945, L: 410, dir: 1 },
      ];
      ferries.forEach((f, i) => {
        const bow = [f.x + f.dir * f.L * 0.5, f.wy - 4], stern = [f.x - f.dir * f.L * 0.47, f.wy - 3];
        const tx = pier.x - f.dir * 150 * (0.5 + i * 0.25), ty = pier.wy + 4;
        g.save(); g.setLineDash([2, 9]); g.lineCap = 'round'; g.strokeStyle = hexA(D6.or, 0.9); g.lineWidth = 3;
        g.beginPath(); g.moveTo(...bow); g.quadraticCurveTo((bow[0] + tx) / 2, Math.max(bow[1], ty) + 30, tx, ty); g.stroke(); g.restore();
        addGlow(g, D6.or, tx, ty, 26, 0.8);
        const len = f.L * 2.1, ex = stern[0] - f.dir * len, bend = (i % 2 ? -1 : 1) * f.L * 0.14;
        const Pw = t => [lerp(stern[0], ex, t), stern[1] + bend * t * t + f.L * 0.02 * t];
        g.save(); g.globalCompositeOperation = 'lighter';
        const wl = [], wr = [];
        for (let k = 0; k <= 30; k++) { const t = k / 30, [px, py] = Pw(t), hw = f.L * (0.015 + 0.05 * t); wl.push([px, py - hw]); wr.push([px, py + hw]); }
        const wg = g.createLinearGradient(stern[0], 0, ex, 0); wg.addColorStop(0, hexA(D6.teal, 0.3)); wg.addColorStop(1, hexA(D6.teal, 0));
        g.fillStyle = wg; g.beginPath(); wl.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); wr.reverse().forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fill();
        g.strokeStyle = hexA(D6.paper, 0.32); g.lineWidth = Math.max(1, f.L * 0.006);
        g.beginPath(); g.moveTo(...stern); g.lineTo(stern[0] - f.dir * f.L * 0.7, stern[1] - f.L * 0.03); g.moveTo(...stern); g.lineTo(stern[0] - f.dir * f.L * 0.7, stern[1] + f.L * 0.07); g.stroke();
        g.restore();
      });
      d6_float(g, pier.wy, c => d6_iskele(c, pier.x, pier.wy, 470, { sign: false }), { a: 0.3, depth: 200 });
      d6_iskeleSign(g, pier.x, pier.wy, 470);
      ferries.forEach((f, i) => {
        const m = d6_ferry(g, f.x, f.wy, f.L, { dir: f.dir, seed: 20 + i });
        const T = d6_tag(g, f.name, f.x - f.dir * f.L * 0.05, m.top - 6, Math.max(18, f.L * 0.055), { check: true });
        if (f.name === 'Binance') {
          const cw = measure(g, '%10 komisyon indirimi', { f: D6_SANS, w: 800, s: 20 }) + 36, ccx = T.x0 + T.w + 14;
          g.save(); g.shadowColor = hexA(D6.or, 0.6); g.shadowBlur = 20; rr(g, ccx, T.y0 + T.h / 2 - 22, cw, 44, 22); g.fillStyle = D6.or; g.fill(); g.restore();
          d6_sans(g, '%10 komisyon indirimi', ccx + 18, T.y0 + T.h / 2 + 7, 20, D6.navy, { w: 800 });
        }
      });
      // headline
      const lg = g.createLinearGradient(0, 0, 900, 0); lg.addColorStop(0, 'rgba(5,8,24,0.55)'); lg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = lg; g.fillRect(0, 0, 900, 420);
      d6_kicker(g, 'Kripto hesabını bağla', 104, 132);
      d6_serif(g, 'Binance, Bitget, MEXC', 100, 228, 80, D6.paper);
      d6_serif(g, 'Kripto724’e bağla.', 98, 322, 88, D6.or, { it: true, glow: 0.6 });
      d6_sans(g, 'Hesaplarını kolayca bağla, hepsini tek yerden izle.', 104, 374, 24, D6.soft, { w: 600 });
      // "Kripto Hakkında Her Şey" card
      const vx = 1306, vy = 64, vw = 552, vh = 312, A = D6_APP;
      d6_sheet(g, vx, vy, vw, vh, { r: 26, sh: 0.55 });
      d6_ui(g, 'Kripto Hakkında Her Şey', vx + 28, vy + 52, 27, A.ink, { w: 700 });
      d6_ui(g, 'Eğitim videoları', vx + 28, vy + 80, 16, A.sec, { w: 600 });
      const tw = (vw - 56 - 28) / 3, thh = tw * 0.62;
      [['#1B2256', D6.or], ['#0F3B45', D6.teal], ['#3A1630', D6.red]].forEach(([bgc, ac], i) => {
        const tx = vx + 28 + i * (tw + 14), ty = vy + 102;
        g.save(); rr(g, tx, ty, tw, thh, 14); g.clip();
        const tg = g.createLinearGradient(tx, ty, tx + tw, ty + thh); tg.addColorStop(0, bgc); tg.addColorStop(1, mixHex(bgc, ac, 0.35)); g.fillStyle = tg; g.fillRect(tx, ty, tw, thh);
        if (i === 0) { g.fillStyle = hexA(ac, 0.9); g.beginPath(); g.arc(tx + tw * 0.25, ty + thh * 0.62, 20, 0, TAU); g.fill(); d6_ui(g, 'B', tx + tw * 0.25, ty + thh * 0.62 + 7, 20, '#FFF', { w: 700, a: 'center' }); }
        if (i === 1) { const pts = []; for (let k = 0; k < 10; k++) pts.push([tx + 12 + k * (tw - 24) / 9, ty + thh * 0.78 - k * 4 - Math.sin(k * 1.3) * 7]); d6_spark(g, pts, ac, 3); }
        if (i === 2) for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? D6.teal : ac; g.fillRect(tx + 16 + k * 22, ty + thh * 0.32 + (k % 3) * 8, 12, 26 + (k % 2) * 10); }
        g.restore();
        g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(tx + tw * 0.66, ty + thh / 2, 20, 0, TAU); g.fill();
        d6_icon(g, 'play', tx + tw * 0.66 + 2, ty + thh / 2, 20, D6.or);
      });
      const bx = vx + 28, by = vy + vh - 28 - 52;
      rr(g, bx, by, 218, 52, 26); g.fillStyle = D6.or; g.fill();
      d6_ui(g, 'Şimdi Keşfet', bx + 26, by + 33, 20, '#FFFFFF', { w: 700 });
      d6_arrowR(g, bx + 184, by + 26, 11, '#FFFFFF', 3);
      d6_gull(g, 1180, 230, 28, { flap: 0.25 }); d6_gull(g, 1236, 262, 18, { flap: 0.7, a: 0.8 });
    },
  },
  {
    time: '34–40 sn', title: 'Kapanış: Şafak',
    desc: 'Boğaz\'a şafak söker, köprü ışıkları birer birer söner. Resmî logo, "Ücretsiz ailemize katılın!", turuncu düğme ve kripto724.com martılarla birlikte belirir.',
    draw(g) {
      const hz = 850;
      d6_sky(g, hz, { seed: 9, stars: 90, starA: 0.5, haze: 0, stops: [[0, '#0E1340'], [0.24, '#232A63'], [0.44, '#4D3F7E'], [0.62, '#9A5D8C'], [0.78, '#E08A86'], [0.9, '#FFB67E'], [1, '#FFD98E']] });
      const sx = 1560, sy = hz - 70;
      addGlow(g, D6.or, sx, sy, 760, 0.45); addGlow(g, '#FFFFFF', sx, sy, 220, 0.55);
      const sg = g.createRadialGradient(sx, sy - 20, 10, sx, sy, 66); sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.7, '#FFF4D2'); sg.addColorStop(1, '#FFD9A0');
      g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, 66, 0, TAU); g.fill();
      const silFar = '#6B4A7E', silMid = '#3B2C5F', silNear = '#211B47';
      d6_hills(g, { base: hz, h: 52, seed: 51, col: silFar, blocks: 6, lights: 120, sc: 0.75, lightA: 0.35, mosque: [1250, 28] });
      d6_bridge(g, { xa: 640, xb: 1160, top: 735, deck: 800, base: hz, sil: silMid, ancL: 500, ancR: 1300, hangers: 22, lights: false });
      d6_bridge(g, { xa: 640, xb: 1160, top: 735, deck: 800, base: hz, lit: 0.35, la: 0.45, ancL: 500, ancR: 1300, hangers: 22, nl: 26, sil: null, col: silMid, beacon: false });
      const RL = d6_hills(g, { base: hz, h: 190, x0: -20, x1: 560, env: [-999, -998, 260, 560], seed: 52, col: silNear, blocks: 12, lights: 80, lightA: 0.5 });
      d6_galata(g, 300, RL(300) + 40, 300, { sil: silNear });
      d6_hills(g, { base: hz, h: 120, x0: 1640, x1: W + 20, env: [1640, 1800, 3000, 3100], seed: 53, col: silNear, blocks: 10, lights: 50, lightA: 0.4 });
      d6_water(g, hz, { seed: 9, top: '#7A5A86', mid: '#2C2A60', bot: '#0B1030', a: 0.6, dark: 0.35, shimmer: 160, k: 0.9 });
      d6_streak(g, sx, hz, 240, '#FFE3A6', 170, 0.7, 3);
      d6_float(g, hz + 34, c => d6_kiz(c, sx - 110, hz + 34, 230, { sil: '#140F33' }), { a: 0.35, depth: 120 });
      [[1640, 430, 32, 0.2], [1720, 470, 22, 0.7], [1580, 500, 18, 0.5]].forEach(([x, y, s, f]) => d6_gull(g, x, y, s, { flap: f, col: '#1A1640' }));
      addGlow(g, '#0A0E2E', CX, 200, 420, 0.5);
      g.save(); g.shadowColor = 'rgba(10,8,40,0.55)'; g.shadowBlur = 36; g.shadowOffsetY = 6; logo(g, CX, 196, 236, { ink: '#FFFFFF' }); g.restore();
      d6_runs(g, [['Ücretsiz ailemize ', false, D6.paper], ['katılın!', true, D6.or, 0.35]], CX, 430, 80, 'center', { sh: 0.55 });
      const bw = 470, bh = 92, by = 548;
      g.save(); g.shadowColor = 'rgba(13,19,51,0.55)'; g.shadowBlur = 40; g.shadowOffsetY = 12;
      rr(g, CX - bw / 2, by - bh / 2, bw, bh, bh / 2); g.fillStyle = D6.or; g.fill(); g.restore();
      d6_sans(g, 'Hemen katıl', CX - 26, by + 13, 38, D6.navy, { w: 800, a: 'center' });
      d6_arrowR(g, CX + bw / 2 - 66, by, 16, D6.navy, 4.5);
      d6_sans(g, 'kripto724.com', CX, 676, 62, D6.navy, { w: 800, a: 'center', ls: -1 });
      d6_sans(g, 'Yatırım tavsiyesi değildir. Fiyatlar örnektir.', CX, 1048, 21, hexA(D6.paper, 0.78), { w: 500, a: 'center' });
    },
  },
];

function d6_boardPaper(g, bw, bh) {
  const r = mulberry32(606);
  for (let i = 0; i < 260; i++) {
    const x = r() * bw, y = r() * bh, a = 0.05 + r() * 0.22;
    g.fillStyle = hexA(D6.paper, a); g.beginPath(); g.arc(x, y, 0.6 + r() * 1.2, 0, TAU); g.fill();
  }
  const gr = g.createRadialGradient(bw * 0.85, 0, 50, bw * 0.85, 0, 1400);
  gr.addColorStop(0, 'rgba(247,147,26,0.08)'); gr.addColorStop(1, 'rgba(247,147,26,0)');
  g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
}

window.DESIGN = {
  id: 6, name: 'İstanbul Gecesi',
  concept: 'Boğaz\'da bir gece, katmanlı düz vektör illüstrasyonla: köprü, Galata, Kız Kulesi, Kapalıçarşı, vapurlar ve martılar. Şehrin turuncu ışıkları kripto724\'ün canlı verisine dönüşür: kripto hiç sönmeyen ışıklar, BIST şehrin kendisi, Nasdaq okyanusu aşan bir yay, altın Kapalıçarşı\'da. Şafakta resmî logo.',
  board: {
    bg: '#0B1030', ink: '#F4F1EA', soft: '#9AA3C4', accent: '#F7931A', line: 'rgba(247,147,26,0.24)',
    display: { f: D6_SERIF, w: 400, ls: -1 }, text: { f: D6_SANS, w: 500 }, badge: '#F7931A', badgeInk: '#0B1030', paper: d6_boardPaper,
  },
  palette: [['#0D1333', 'Lacivert'], ['#1FB5A8', 'Boğaz'], ['#F7931A', 'Turuncu'], ['#E30A17', 'Kırmızı'], ['#F4F1EA', 'Kırık beyaz']],
  fonts: ['DM Serif Display', 'Manrope · Inter (uygulama)'],
  extraFonts: ['Inter', 'Poppins'],
  motion: ['Katmanlı parallax Boğaz silueti', 'Turuncu şehir ışıkları uygulama verisine dönüşür', 'Vapur, martı, fener ve mozaik lamba detayları'],
  music: 'modern elektronik, ney ve kanun esintili synth, 120 BPM; kapanışta uzaktan vapur düdüğü',
  format: '16:9 · 1920×1080 · 40 sn',
  scenes: D6_SCENES,
};
