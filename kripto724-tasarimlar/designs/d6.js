'use strict';
/* TASARIM 06 · İSTANBUL GECESİ
 * Boğaz'da bir gece, katmanlı düz vektör illüstrasyon. Her katman ayrı bir fonksiyon:
 * gökyüzü (d6_sky), arka tepeler (d6_hills), köprü (d6_bridge), orta silüet (d6_apts, d6_galata),
 * su + yansıma (d6_water, d6_float), ön plan (d6_ferry, d6_gull). Canlandırmada her katman kendi
 * hızında kayar (parallax). Şehrin ışıkları veriye dönüşür: köprünün kablo ışıkları performans
 * grafiği, pencereler temettü takvimi, vapur rotaları senkron çizgileri olur. */

const D6 = {
  bg: '#0B1030', navy: '#0D1333', deep: '#060A1F', teal: '#1FB5A8', gold: '#FFC861', red: '#E30A17', paper: '#F4F1EA',
  soft: '#A2AACB', dim: '#5E6797', far: '#28306E', mid: '#1B2256', near: '#131A46', fore: '#0A0F2D', lav: '#7D87C9',
};
const D6_SERIF = 'DM Serif Display', D6_SANS = 'Manrope';
const D6_STONE = k => mixHex('#1A2052', '#E2B072', k);
const D6_ORANGE = mixHex('#E30A17', '#FFC861', 0.55);

/* ───────────── type ───────────── */
function d6_sans(g, s, x, y, size, col, o = {}) {
  text(g, s, x, y, { f: D6_SANS, w: o.w || 600, s: size, a: o.a || 'left', b: o.b, c: col, ls: o.ls || 0 });
}
function d6_serif(g, s, x, y, size, col, o = {}) {
  const f = { f: D6_SERIF, w: 400, it: !!o.it, s: size, a: o.a || 'left', c: col, ls: o.ls == null ? -0.5 : o.ls };
  if (o.glow) { g.save(); g.shadowColor = hexA(o.gc || D6.gold, o.glow); g.shadowBlur = size * 0.5; text(g, s, x, y, f); g.restore(); }
  text(g, s, x, y, f);
}
// one serif line made of runs: [[string, italic, colour, glow, 'sans'], ...]
// ('sans' sets that run in Manrope; DM Serif's "+" is hairline-thin)
function d6_runs(g, runs, x, y, size, a = 'left') {
  const fo = r => r[4] === 'sans' ? { f: D6_SANS, w: 700, s: size * 0.74 } : { f: D6_SERIF, w: 400, it: !!r[1], s: size, ls: -0.5 };
  const ws = runs.map(r => measure(g, r[0], fo(r)) + (r[4] === 'sans' ? size * 0.04 : 0));
  const tot = ws.reduce((p, q) => p + q, 0);
  let px = a === 'center' ? x - tot / 2 : a === 'right' ? x - tot : x;
  runs.forEach((r, i) => {
    if (r[4] === 'sans') d6_sans(g, r[0], px + size * 0.02, y - size * 0.1, size * 0.74, r[2] || D6.paper, { w: 700 });
    else d6_serif(g, r[0], px, y, size, r[2] || D6.paper, { it: r[1], glow: r[3] });
    px += ws[i];
  });
  return tot;
}
// "60+" style figure: serif digits, sans plus
function d6_plus(g, num, x, y, size, col, glow) {
  return d6_runs(g, [[num, false, col, glow], ['+', false, col, 0, 'sans']], x, y, size);
}
function d6_kicker(g, s, x, y, col = D6.gold, o = {}) {
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
// rounded tag with a pointer (ferry names, callouts); (x, y) = pointer tip
function d6_tag(g, s, x, y, size, o = {}) {
  const tw = measure(g, s, { f: D6_SANS, w: 800, s: size }), pw = tw + size * 1.4, ph = size * 1.9, py = y - ph - size * 0.45;
  g.save();
  g.shadowColor = hexA(o.col || D6.gold, 0.45); g.shadowBlur = 18;
  rr(g, x - pw / 2, py, pw, ph, ph / 2); g.fillStyle = o.fill || 'rgba(10,15,45,0.94)'; g.fill();
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = hexA(o.col || D6.gold, 0.8); rr(g, x - pw / 2, py, pw, ph, ph / 2); g.stroke();
  g.fillStyle = hexA(o.col || D6.gold, 0.8);
  g.beginPath(); g.moveTo(x - size * 0.35, py + ph); g.lineTo(x, y); g.lineTo(x + size * 0.35, py + ph); g.closePath(); g.fill();
  d6_sans(g, s, x, py + ph / 2 + size * 0.36, size, o.c || D6.paper, { w: 800, a: 'center' });
}

/* ───────────── sky, moon ───────────── */
function d6_sky(g, hz, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, hz);
  (o.stops || [[0, '#050818'], [0.5, '#0B1131'], [0.82, '#19215A'], [1, '#2D2B63']]).forEach(([p, c]) => gr.addColorStop(p, c));
  g.fillStyle = gr; g.fillRect(0, 0, W, hz + 4);
  if (o.haze !== 0) {
    const hg = g.createLinearGradient(0, hz - 260, 0, hz);
    hg.addColorStop(0, 'rgba(255,190,110,0)'); hg.addColorStop(1, `rgba(255,170,100,${o.haze || 0.15})`);
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
  addGlow(g, D6.gold, x, y, r * 2.6, 0.3);
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
    // little buildings on the ridge: each its own shade, some with pitched roofs or a gap
    let x = x0;
    const lite = mixHex(o.col, D6.paper, 0.05), dark = mixHex(o.col, '#000000', 0.14);
    while (x < x1) {
      const bw = (9 + r() * 16) * sc, ry = Math.min(R(x), R(Math.min(x + bw, x1))), bh = (3 + r() * o.blocks * 0.8) * sc, k = r(), gap = r() < 0.35 ? 1.2 * sc : 0;
      if (base - ry > 5) {
        g.fillStyle = o.col; g.fillRect(x, ry - bh, bw + 0.6, base - ry + bh + 2);
        // only the top of each block catches a different tone, so the hill never turns into a fence
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
    const k = r(), col = k < 0.7 ? D6.gold : k < 0.9 ? D6.paper : D6.teal;
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
function d6_galata(g, x, by, s, o = {}) {
  const bw = s * 0.25, t1 = by - s * 0.56, t2 = t1 - s * 0.13, t3 = t2 - s * 0.03, apex = by - s * 0.95;
  const sil = o.sil;                       // silhouette mode (dawn)
  const body = () => { g.beginPath(); g.moveTo(x - bw * 0.56, by); g.lineTo(x - bw / 2, t1); g.lineTo(x + bw / 2, t1); g.lineTo(x + bw * 0.56, by); g.closePath(); };
  if (sil) g.fillStyle = sil;
  else {
    const gb = g.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
    gb.addColorStop(0, D6_STONE(0.14)); gb.addColorStop(0.3, D6_STONE(0.58)); gb.addColorStop(0.62, D6_STONE(0.36)); gb.addColorStop(1, D6_STONE(0.07));
    g.fillStyle = gb;
  }
  body(); g.fill();
  if (!sil) {
    const gv = g.createLinearGradient(0, by, 0, t1); gv.addColorStop(0, 'rgba(255,200,97,0.32)'); gv.addColorStop(1, 'rgba(255,200,97,0)');
    g.fillStyle = gv; body(); g.fill();
    g.save(); body(); g.clip();
    g.strokeStyle = 'rgba(10,14,40,0.16)'; g.lineWidth = 1;
    for (let y = by - s * 0.05; y > t1; y -= s * 0.04) { g.beginPath(); g.moveTo(x - bw, y); g.lineTo(x + bw, y); g.stroke(); }
    g.restore();
    [[0.18, -0.1], [0.3, 0.16], [0.42, -0.06], [0.08, 0.2]].forEach(([f, dx]) => {
      const wy = by - (by - t1) * f - s * 0.05, wx = x + dx * bw;
      g.fillStyle = 'rgba(20,16,40,0.7)'; rr(g, wx - s * 0.012, wy, s * 0.024, s * 0.05, s * 0.012); g.fill();
      g.fillStyle = hexA(D6.gold, 0.7); rr(g, wx - s * 0.008, wy + s * 0.006, s * 0.016, s * 0.04, s * 0.008); g.fill();
    });
  }
  // gallery with arched windows
  g.fillStyle = sil || D6_STONE(0.26); g.fillRect(x - bw * 0.54, t2, bw * 1.08, t1 - t2);
  if (!sil) {
    addGlow(g, D6.gold, x, (t1 + t2) / 2, bw * 1.7, 0.55);
    for (let i = 0; i < 4; i++) {
      const wx = x - bw * 0.39 + i * bw * 0.26, ww = bw * 0.13, wh = (t1 - t2) * 0.64, wy = t1 - (t1 - t2) * 0.16;
      g.fillStyle = i === 1 ? '#FFF1C8' : D6.gold;
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
}
// Maiden's Tower on its rock; o.sil = silhouette colour (dawn)
function d6_kiz(g, x, wy, s, o = {}) {
  const sil = o.sil;
  g.fillStyle = sil || '#0A0E28';
  g.beginPath(); g.moveTo(x - s * 0.78, wy + 2); g.quadraticCurveTo(x - s * 0.66, wy - s * 0.07, x - s * 0.34, wy - s * 0.055);
  g.lineTo(x + s * 0.34, wy - s * 0.055); g.quadraticCurveTo(x + s * 0.5, wy - s * 0.05, x + s * 0.6, wy + 2); g.closePath(); g.fill();
  // annex and terrace
  g.fillStyle = sil || D6_STONE(0.28); g.fillRect(x - s * 0.62, wy - s * 0.2, s * 0.5, s * 0.15);
  g.fillStyle = sil || '#1E2456';
  g.beginPath(); g.moveTo(x - s * 0.65, wy - s * 0.2); g.lineTo(x - s * 0.58, wy - s * 0.25); g.lineTo(x - s * 0.15, wy - s * 0.25); g.lineTo(x - s * 0.1, wy - s * 0.2); g.fill();
  g.fillStyle = sil || D6_STONE(0.2); g.fillRect(x + s * 0.08, wy - s * 0.12, s * 0.38, s * 0.07);
  // flag pole with a tiny red pennant
  g.fillStyle = sil || D6.paper; g.fillRect(x - s * 0.5, wy - s * 0.42, Math.max(1, s * 0.006), s * 0.17);
  g.fillStyle = sil ? sil : D6.red; g.fillRect(x - s * 0.5, wy - s * 0.42, s * 0.07, s * 0.045);
  // tower
  const tw = s * 0.2, tb = wy - s * 0.05, tt = wy - s * 0.56;
  if (sil) g.fillStyle = sil;
  else {
    const gb = g.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0);
    gb.addColorStop(0, D6_STONE(0.18)); gb.addColorStop(0.32, D6_STONE(0.62)); gb.addColorStop(1, D6_STONE(0.1)); g.fillStyle = gb;
  }
  g.fillRect(x - tw / 2, tt, tw, tb - tt);
  if (!sil) {
    const gv = g.createLinearGradient(0, tb, 0, tt); gv.addColorStop(0, 'rgba(255,200,97,0.35)'); gv.addColorStop(1, 'rgba(255,200,97,0.02)');
    g.fillStyle = gv; g.fillRect(x - tw / 2, tt, tw, tb - tt);
    // annex windows
    for (let i = 0; i < 4; i++) { g.fillStyle = hexA(D6.gold, i === 2 ? 0.5 : 0.9); rr(g, x - s * 0.57 + i * s * 0.11, wy - s * 0.17, s * 0.045, s * 0.07, s * 0.02); g.fill(); }
    [[0.22, -0.2], [0.22, 0.2], [0.4, 0]].forEach(([f, dx]) => {
      g.fillStyle = hexA(D6.gold, 0.85); rr(g, x + dx * tw - s * 0.016, tb - (tb - tt) * f - s * 0.06, s * 0.032, s * 0.06, s * 0.016); g.fill();
    });
  }
  g.fillStyle = sil || D6_STONE(0.55); g.fillRect(x - tw * 0.62, tt - s * 0.012, tw * 1.24, s * 0.018);
  // octagonal lantern
  const lw = s * 0.13, lt = tt - s * 0.11;
  g.fillStyle = sil || D6_STONE(0.45); g.fillRect(x - lw / 2, lt, lw, tt - lt);
  if (!sil) {
    addGlow(g, D6.gold, x, (lt + tt) / 2, s * 0.32, 0.8);
    for (const dx of [-0.26, 0.26]) { g.fillStyle = '#FFF1C8'; rr(g, x + dx * lw - s * 0.016, lt + s * 0.025, s * 0.032, s * 0.065, s * 0.016); g.fill(); }
  }
  g.fillStyle = sil || D6_STONE(0.55); g.fillRect(x - lw * 0.62, lt - s * 0.01, lw * 1.24, s * 0.014);
  // pointed dome + finial
  g.fillStyle = sil || '#2A3069';
  g.beginPath(); g.moveTo(x - lw * 0.55, lt - s * 0.01);
  g.quadraticCurveTo(x - lw * 0.55, lt - s * 0.09, x, lt - s * 0.13);
  g.quadraticCurveTo(x + lw * 0.55, lt - s * 0.09, x + lw * 0.55, lt - s * 0.01); g.fill();
  g.fillRect(x - 0.8, lt - s * 0.2, 1.6, s * 0.08);
  return [x, (lt + tt) / 2];                       // lantern position
}

/* ───────────── the Bosphorus Bridge ─────────────
 * Two portal towers, a parabolic main cable, side spans and the inclined (zigzag) hangers.
 * o.lit 0..1: cable lights on from left to right (bright wave front). Returns the cable y(x). */
function d6_bridge(g, o) {
  const { xa, xb, top, deck } = o;
  const hgt = deck - top, span = xb - xa, xm = (xa + xb) / 2, sc = hgt / 300;
  const base = o.base == null ? deck + hgt * 0.3 : o.base;
  const ancL = o.ancL == null ? xa - span * 0.3 : o.ancL, ancR = o.ancR == null ? xb + span * 0.3 : o.ancR;
  const lit = o.lit == null ? 1 : o.lit, lc = o.lc || D6.gold, sil = o.sil, la = o.la == null ? 1 : o.la;
  const steel = sil || o.col || '#2E3878';
  const cy = x => {
    if (x >= xa && x <= xb) { const u = (x - xm) / (span / 2); return deck - hgt * 0.05 - hgt * 0.95 * u * u; }
    const u = x < xa ? clamp((xa - x) / (xa - ancL)) : clamp((x - xb) / (ancR - xb));
    return lerp(top, deck - 2, u) + hgt * 0.06 * Math.sin(Math.PI * u);
  };
  const dh = Math.max(3, hgt * 0.045);
  const d0 = o.d0 == null ? ancL - span * 0.2 : o.d0, d1 = o.d1 == null ? ancR + span * 0.2 : o.d1;
  // towers (portal frames)
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
  // deck
  g.fillStyle = steel; g.fillRect(d0, deck, d1 - d0, dh);
  g.fillStyle = sil || 'rgba(0,0,0,0.25)'; g.fillRect(d0, deck + dh * 0.6, d1 - d0, dh * 0.4);
  // hangers (zigzag), drawn first so the cable sits on top
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
  // main + side cables
  const cablePath = () => { g.beginPath(); for (let x = ancL; x <= ancR + 1; x += 4) { const xx = Math.min(x, ancR); x === ancL ? g.moveTo(xx, cy(xx)) : g.lineTo(xx, cy(xx)); } };
  g.lineWidth = Math.max(1.2, 2.4 * sc); g.strokeStyle = sil || hexA(D6.paper, 0.45 * la); cablePath(); g.stroke();
  if (!sil && lit > 0) {
    const xl = lerp(ancL, ancR, lit);
    g.save(); g.beginPath(); g.rect(0, 0, xl, H); g.clip();
    g.shadowColor = lc; g.shadowBlur = 14 * sc + 4; g.strokeStyle = hexA(lc, 0.85 * la); cablePath(); g.stroke();
    g.restore();
  }
  // lights along the cable
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
    // road lights + traffic
    const r = mulberry32(77);
    for (let x = d0; x < d1; x += Math.max(8, 14 * sc)) { g.fillStyle = hexA(D6.gold, 0.7 * la); g.fillRect(x, deck - 1.5, Math.max(1.2, 2 * sc), Math.max(1.2, 2 * sc)); }
    for (let i = 0; i < 26; i++) {
      const x = lerp(d0, d1, r()), red = r() < 0.5, len = (10 + r() * 30) * sc;
      g.fillStyle = hexA(red ? D6.red : D6.paper, (red ? 0.85 : 0.7) * la); g.fillRect(x, deck + dh * 0.15, len, Math.max(1, 1.6 * sc));
    }
  }
  return { cy, ancL, ancR, base, deck, top, xa, xb, lights: litPts, lc };
}
// gold streaks on the water under the bridge's cable lights (call after d6_water)
function d6_bridgeStreaks(g, B, hz, a = 0.3, k = 1) {
  if (!B) return;
  B.lights.forEach(([x, y], i) => { if (i % 3 === 0 && x > -20 && x < W + 20) d6_streak(g, x, hz, Math.min(H - hz, 40 + (hz - y) * k), B.lc, 10, a, 300 + i); });
}

/* ───────────── water, reflections ───────────── */
// mirror whatever `src` holds above the waterline wy into the water below it, in rippled strips
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
  // roof furniture
  const k = r(), rc = o.col || D6.near;
  g.fillStyle = rc; g.strokeStyle = rc; g.lineWidth = 1.5;
  if (k < 0.3) { g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + w * 0.5, top - Math.min(26, w * 0.22)); g.lineTo(x + w + 2, top); g.fill(); }
  else if (k < 0.55) { g.fillRect(x + w * 0.62, top - 12, w * 0.2, 12); g.fillRect(x + w * 0.68, top - 18, 2, 6); }
  else if (k < 0.8) d6_antenna(g, x + w * 0.3, top, 22, rc);
  else { g.beginPath(); g.arc(x + w * 0.7, top - 6, 7, Math.PI * 0.9, Math.PI * 1.9); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x, top, w, 2);
  // windows
  const ws = o.win || 10, wh = ws * 1.35, gx = ws * 1.9, gy = wh * 1.75;
  const cols = Math.max(1, Math.floor((w - ws * 0.8) / gx)), ox = x + (w - (cols - 1) * gx - ws) / 2;
  const wins = [], litP = o.litP == null ? 0.45 : o.litP;
  for (let yy = top + ws * 1.1; yy + wh < ground - ws * 0.6; yy += gy) {
    for (let c = 0; c < cols; c++) {
      const wx = ox + c * gx, on = r() < litP, q = r(), a = 0.55 + r() * 0.45;
      if (on) {
        const col = q < 0.74 ? D6.gold : q < 0.9 ? D6.paper : D6.teal;
        g.fillStyle = hexA(col, a); g.fillRect(wx, yy, ws, wh);
        if (q < 0.74 && r() < 0.25) addGlow(g, D6.gold, wx + ws / 2, yy + wh / 2, ws * 2.2, 0.25);
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
  // window lights trembling on the water
  if (!o.noGlow) for (let k = 0; k < 6; k++) d6_streak(g, x - L * 0.36 + k * L * 0.145, wy + 1, L * 0.32, D6.gold, L * 0.07, 0.32, (o.seed || 5) * 10 + k);
  g.save(); g.translate(x, wy); g.scale(dir, 1);
  // hull with a sheer line rising to the bow
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
  g.fillStyle = hexA(D6.gold, 0.9);
  for (let i = 0; i < 11; i++) { g.beginPath(); g.arc(-L * 0.4 + i * L * 0.075, -h * 0.9, Math.max(1, L * 0.0075), 0, TAU); g.fill(); }
  // main deck saloon with big windows
  const ch = L * 0.085, sx0 = -L * 0.43, sw = L * 0.8;
  g.fillStyle = white; rr(g, sx0, deckY - ch, sw, ch, Math.max(2, L * 0.012)); g.fill();
  const nw = Math.max(6, Math.round(L / 24)), cw = sw * 0.92 / nw;
  for (let i = 0; i < nw; i++) {
    const dim = r() < 0.15;
    g.fillStyle = dim ? 'rgba(13,19,51,0.65)' : hexA(D6.gold, 0.9 + r() * 0.1);
    g.fillRect(sx0 + sw * 0.04 + i * cw, deckY - ch * 0.76, cw * 0.66, ch * 0.46);
  }
  g.fillStyle = 'rgba(13,19,51,0.22)'; g.fillRect(sx0, deckY - ch * 0.2, sw, ch * 0.2);
  // upper (open) deck: posts under a canopy
  const d2 = deckY - ch, uh = L * 0.06, ux0 = -L * 0.34, uw = L * 0.56;
  g.fillStyle = mixHex(white, D6.navy, 0.15); g.fillRect(ux0, d2 - uh * 0.45, uw, uh * 0.45);
  g.fillStyle = white;
  for (let i = 0; i <= 8; i++) g.fillRect(ux0 + i * uw / 8 - Math.max(0.6, L * 0.003), d2 - uh, Math.max(1.2, L * 0.006), uh);
  rr(g, ux0 - L * 0.02, d2 - uh - L * 0.012, uw + L * 0.04, L * 0.014, L * 0.007); g.fill();
  for (let i = 0; i < 6; i++) { g.fillStyle = hexA(D6.gold, r() < 0.3 ? 0.4 : 0.85); g.fillRect(ux0 + L * 0.02 + i * uw / 6, d2 - uh * 0.42, uw / 6 * 0.55, uh * 0.25); }
  // wheelhouse
  g.fillStyle = white; rr(g, L * 0.14, d2 - L * 0.055, L * 0.12, L * 0.055, 2); g.fill();
  g.fillStyle = 'rgba(13,19,51,0.85)'; g.fillRect(L * 0.15, d2 - L * 0.045, L * 0.1, L * 0.018);
  // raked funnel
  const fx = -L * 0.06, fy = d2 - uh - L * 0.012;
  g.beginPath(); g.moveTo(fx - L * 0.038, fy); g.lineTo(fx - L * 0.062, fy - L * 0.13); g.lineTo(fx + L * 0.03, fy - L * 0.13); g.lineTo(fx + L * 0.045, fy); g.closePath();
  g.fillStyle = white; g.fill();
  g.fillStyle = '#0B0F2A'; g.fillRect(fx - L * 0.063, fy - L * 0.13, L * 0.094, L * 0.028);
  g.fillStyle = D6.red; g.fillRect(fx - L * 0.058, fy - L * 0.088, L * 0.09, L * 0.012);
  // masts
  g.strokeStyle = white; g.lineWidth = Math.max(1, L * 0.006);
  g.beginPath(); g.moveTo(L * 0.2, d2 - L * 0.055); g.lineTo(L * 0.2, d2 - L * 0.17); g.moveTo(-L * 0.41, deckY - ch); g.lineTo(-L * 0.41, deckY - ch - L * 0.07); g.stroke();
  g.restore();
  const mx = x + dir * L * 0.2, my = wy + d2 - L * 0.17;
  addGlow(g, D6.paper, mx, my, L * 0.06 + 6, 0.8);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(mx, my, Math.max(1.4, L * 0.007), 0, TAU); g.fill();
  return { mx, my, top: Math.min(my, wy + d2 - uh - L * 0.15) };
}
// classic İstanbul pier (iskele) with a clock tower; the clock face is the Kripto724 mark
function d6_iskele(g, x, wy, s) {
  const deck = wy - s * 0.04, bh = s * 0.25, top = deck - bh;
  g.fillStyle = '#070A20';
  for (let i = 0; i <= 12; i++) g.fillRect(x - s * 0.56 + i * s * 0.093, deck, s * 0.012, wy - deck + 4);
  g.fillStyle = '#20275C'; g.fillRect(x - s * 0.6, deck - s * 0.018, s * 1.2, s * 0.03);
  const bg = g.createLinearGradient(0, top, 0, deck);
  bg.addColorStop(0, mixHex(D6.navy, D6.paper, 0.3)); bg.addColorStop(1, mixHex(D6.navy, D6.paper, 0.16));
  g.fillStyle = bg; g.fillRect(x - s * 0.5, top, s, bh);
  // arched windows and doors, warm
  for (let i = 0; i < 8; i++) {
    const wx = x - s * 0.42 + i * s * 0.12, door = i === 3 || i === 4, ww = s * 0.06, wh = door ? bh * 0.7 : bh * 0.5, wb = door ? deck - s * 0.02 : top + bh * 0.72;
    if (door) addGlow(g, D6.gold, wx + ww / 2, wb - wh / 2, s * 0.14, 0.5);
    g.fillStyle = door ? '#FFE3A1' : hexA(D6.gold, 0.92);
    g.beginPath(); g.moveTo(wx, wb); g.lineTo(wx, wb - wh + ww / 2); g.arc(wx + ww / 2, wb - wh + ww / 2, ww / 2, Math.PI, TAU); g.lineTo(wx + ww, wb); g.fill();
  }
  // roof with eaves, a lit eave line and lamps along the platform
  const rg = g.createLinearGradient(0, top - s * 0.08, 0, top); rg.addColorStop(0, '#1E2558'); rg.addColorStop(1, '#10163F');
  g.fillStyle = rg;
  g.beginPath(); g.moveTo(x - s * 0.58, top + 2); g.lineTo(x - s * 0.47, top - s * 0.08); g.lineTo(x + s * 0.47, top - s * 0.08); g.lineTo(x + s * 0.58, top + 2); g.closePath(); g.fill();
  g.fillStyle = hexA(D6.paper, 0.35); g.fillRect(x - s * 0.47, top - s * 0.08, s * 0.94, 1.5);
  g.fillStyle = hexA(D6.gold, 0.55); g.fillRect(x - s * 0.58, top, s * 1.16, 2);
  for (let i = 0; i <= 10; i++) { const lx = x - s * 0.56 + i * s * 0.112; addGlow(g, D6.gold, lx, deck - s * 0.03, 12, 0.6); g.fillStyle = '#FFF0C8'; g.beginPath(); g.arc(lx, deck - s * 0.03, 1.8, 0, TAU); g.fill(); }
  // sign band with the wordmark
  g.fillStyle = '#0B1030'; g.fillRect(x - s * 0.5, top + 2, s, s * 0.07);
  wordmark(g, x, top + 2 + s * 0.055, s * 0.05, null, { c: D6.paper, accent: D6.gold });
  // clock tower
  const tw = s * 0.15, tTop = top - s * 0.3;
  g.fillStyle = mixHex(D6.navy, D6.paper, 0.26); g.fillRect(x - tw / 2, tTop, tw, top - s * 0.08 - tTop + 2);
  g.fillStyle = '#121845';
  g.beginPath(); g.moveTo(x - tw * 0.66, tTop + 2); g.lineTo(x, tTop - s * 0.12); g.lineTo(x + tw * 0.66, tTop + 2); g.closePath(); g.fill();
  g.fillRect(x - 1, tTop - s * 0.17, 2, s * 0.06);
  g.fillStyle = D6.gold; g.beginPath(); g.arc(x, tTop - s * 0.17, 3, 0, TAU); g.fill();
  const mr = tw * 0.33, my = tTop + tw * 0.62;
  addGlow(g, D6.teal, x, my, mr * 3, 0.5);
  drawMark(g, x, my, mr, { th: 0.24, col: D6.teal, col2: D6.gold, arrow: D6.gold });
  return { x, y: top, tTop, my, deck };
}

/* ───────────── UI on glass ───────────── */
function d6_card(g, x, y, w, h, o = {}) {
  const r = o.r || 26;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 70; g.shadowOffsetY = 28;
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || 'rgba(11,16,46,0.9)'; g.fill(); g.restore();
  g.save(); rr(g, x, y, w, h, r); g.clip();
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hexA(D6.gold, o.warm == null ? 0.12 : o.warm)); gr.addColorStop(0.4, hexA(D6.gold, 0));
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  addGlow(g, D6.gold, x + w * 0.25, y, w * 0.45, 0.1);
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = hexA(D6.gold, 0.34); rr(g, x, y, w, h, r); g.stroke();
  g.save(); rr(g, x, y, w, h, r); g.clip();
  const lg = g.createLinearGradient(x, 0, x + w, 0); lg.addColorStop(0, 'rgba(255,236,200,0)'); lg.addColorStop(0.3, 'rgba(255,236,200,0.55)'); lg.addColorStop(1, 'rgba(255,236,200,0)');
  g.fillStyle = lg; g.fillRect(x, y, w, 1.5); g.restore();
}
function d6_phone(g, x, y, w, h, rot, fn, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  addGlow(g, o.glow || D6.gold, 0, 0, w * 1.5, 0.22);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  rr(g, -w / 2, -h / 2, w, h, o.r == null ? w * 0.13 : o.r); g.fillStyle = '#04061A'; g.fill(); g.restore();
  rr(g, -w / 2, -h / 2, w, h, o.r == null ? w * 0.13 : o.r); g.lineWidth = 2; g.strokeStyle = hexA(D6.paper, 0.28); g.stroke();
  const p = o.pad == null ? 9 : o.pad;
  g.save(); rr(g, -w / 2 + p, -h / 2 + p, w - 2 * p, h - 2 * p, o.r == null ? w * 0.1 : o.r * 0.6); g.clip();
  fn(g, -w / 2 + p, -h / 2 + p, w - 2 * p, h - 2 * p);
  g.restore();
  if (o.notch !== false) { g.fillStyle = '#04061A'; rr(g, -w * 0.15, -h / 2 + p + 6, w * 0.3, 14, 7); g.fill(); }
  g.restore();
}
function d6_spark(g, pts, col, lw = 2.5) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
}

/* ───────────── data ───────────── */
const D6_MC = {};
function d6_init() {
  const r = mulberry32(606), n = 400, steps = 80, out = [];
  for (let i = 0; i < n; i++) { const p = [1]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] * Math.exp(0.0048 + 0.042 * gauss(r))); out.push(p); }
  D6_MC.paths = out;
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const c = out.map(p => p[k]).sort((a, b) => a - b); return c[Math.floor(q * (n - 1))]; });
  D6_MC.p5 = pct(0.05); D6_MC.p50 = pct(0.5); D6_MC.p95 = pct(0.95);
}
const D6_DIV = [42, 24, 91, 45, 26, 95, 47, 28, 100, 51, 30, 106];
const D6_ALLOC = [['Hisse senedi', 44, D6.gold], ['ETF', 22, D6.teal], ['Kripto', 12, D6.paper], ['Tahvil', 10, D6.lav], ['Gayrimenkul', 7, D6_ORANGE], ['Nakit', 5, D6.dim]];

/* A standard night panorama (sky → far shore → bridge → near shores), reused by several scenes.
 * Returns the bridge geometry and the ridge functions of the near hills. */
function d6_panorama(g, hz, o = {}) {
  d6_sky(g, hz, { seed: o.seed || 2, stars: o.stars });
  if (o.moon) d6_moon(g, ...o.moon);
  d6_hills(g, { base: hz, h: o.farH || 90, seed: (o.seed || 2) + 3, col: D6.far, blocks: 7, lights: 520, sc: 0.75, lightA: 0.75, mosque: o.mosque });
  const B = o.bridge ? d6_bridge(g, { base: hz, ...o.bridge }) : null;
  const L = o.left ? d6_hills(g, { base: hz, col: D6.mid, blocks: 9, lights: 320, seed: (o.seed || 2) + 8, ...o.left }) : null;
  const R = o.right ? d6_hills(g, { base: hz, col: D6.mid, blocks: 9, lights: 320, seed: (o.seed || 2) + 9, ...o.right }) : null;
  return { B, L, R };
}

/* ───────────── scenes ───────────── */
const D6_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık ışıklar',
    desc: 'Gece silüetinde pencereler tek tek yanar; her birinden ayrı bir ekran fırlar: aracı kurum, kripto borsası, hatalı tablo. Başlık suyun üstünde belirir.',
    draw(g) {
      const hz = 770;
      d6_sky(g, hz, { seed: 1 });
      d6_hills(g, { base: hz, h: 80, seed: 4, col: D6.far, blocks: 7, lights: 520, sc: 0.75, lightA: 0.8, mosque: [1730, 32] });
      d6_bridge(g, { xa: 150, xb: 640, top: 590, deck: 690, base: hz, lit: 1, hangers: 22, nl: 26, ancL: 20, ancR: 760 });
      // European hillside (Galata, Cihangir) rising to the right, houses in three rows
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
      // headline on the water
      const fade = g.createLinearGradient(0, 820, 0, H); fade.addColorStop(0, 'rgba(6,10,31,0)'); fade.addColorStop(0.5, 'rgba(6,10,31,0.6)'); fade.addColorStop(1, 'rgba(6,10,31,0.8)');
      g.fillStyle = fade; g.fillRect(0, 820, W, H - 820);
      d6_serif(g, 'Hisse bir uygulamada,', 110, 920, 82, D6.paper);
      d6_serif(g, 'kripto başka bir borsada…', 110, 1012, 82, D6.gold, { it: true, glow: 0.6 });
      d6_sans(g, 'Hesaplar ise ayrı bir tabloda.', 1810, 1004, 30, D6.soft, { a: 'right', w: 600 });
      // the three source windows, each throwing its own screen
      const screens = [
        { x: 380, y: 300, w: 480, h: 320, rot: -0.05, win: srcs[0] },
        { x: 905, y: 290, w: 236, h: 450, rot: 0.04, win: srcs[1] },
        { x: 1600, y: 300, w: 236, h: 450, rot: 0.07, win: srcs[2] },
      ];
      screens.forEach(s => {
        const [wx, wy, ww, wh] = s.win, cx = wx + ww / 2, cyy = wy + wh / 2;
        addGlow(g, D6.paper, cx, cyy, 46, 0.9);
        g.fillStyle = '#FFFFFF'; g.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
        g.save(); g.setLineDash([3, 7]); g.lineCap = 'round'; g.strokeStyle = hexA(D6.gold, 0.75); g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(cx, cyy); g.quadraticCurveTo(cx, (cyy + s.y + s.h / 2) / 2, s.x, s.y + s.h / 2 - 12); g.stroke(); g.restore();
        g.strokeStyle = hexA(D6.gold, 0.8); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cyy, 16, 0, TAU); g.stroke();
      });
      // spreadsheet tablet
      const S0 = screens[0];
      d6_phone(g, S0.x, S0.y, S0.w, S0.h, S0.rot, (x, x0, y0, w, h) => {
        x.fillStyle = '#F4F1EA'; x.fillRect(x0, y0, w, h);
        x.fillStyle = '#1E6E5C'; x.fillRect(x0, y0, w, 34);
        d6_sans(x, 'portföy_SON_v7.xlsx', x0 + 14, y0 + 23, 15, '#FFFFFF', { w: 700 });
        x.fillStyle = '#E4DFD3'; x.fillRect(x0, y0 + 34, w, 28);
        d6_sans(x, 'fx', x0 + 12, y0 + 53, 14, '#6B6B6B', { w: 800 });
        d6_sans(x, '=TOPLA(D2:D9)', x0 + 40, y0 + 53, 14, '#222', { w: 600 });
        const cw = [44, 120, 80, 92, 118], rh = 26, gy0 = y0 + 62;
        const rows = [['', 'Varlık', 'Adet', 'Fiyat', 'Değer'], ['2', 'AAPL', '10', '7.840', '78.400'], ['3', 'BTC', '0,25', '#N/A', '#N/A'], ['4', 'VOO', '42', '19.120', '803.040'],
          ['5', 'Altın', '?', '', ''], ['6', 'ETH', '1,5', '#N/A', '#REF!'], ['7', 'Fon', '1.200', '4,82', '5.784'], ['8', 'TOPLAM', '', '', '#REF!']];
        rows.forEach((row, i) => {
          let cx = x0;
          row.forEach((cell, j) => {
            x.strokeStyle = '#CFC8B8'; x.lineWidth = 1; x.strokeRect(cx, gy0 + i * rh, cw[j], rh);
            if (i === 0 || j === 0) { x.fillStyle = '#E9E4D8'; x.fillRect(cx + 0.5, gy0 + i * rh + 0.5, cw[j] - 1, rh - 1); }
            const err = cell[0] === '#';
            if (err) { x.fillStyle = 'rgba(227,10,23,0.12)'; x.fillRect(cx + 1, gy0 + i * rh + 1, cw[j] - 2, rh - 2); }
            d6_sans(x, cell, j > 1 ? cx + cw[j] - 6 : cx + 6, gy0 + i * rh + 18, 13, err ? D6.red : i === 0 || i === 7 ? '#333' : '#444', { w: err || i === 7 ? 800 : 600, a: j > 1 ? 'right' : 'left' });
            cx += cw[j];
          });
        });
        x.strokeStyle = D6.red; x.lineWidth = 2.5; x.strokeRect(x0 + 336, gy0 + 7 * rh, 118, rh);
      }, { glow: D6.paper, r: 18, pad: 10, notch: false });
      // broker app
      const S1 = screens[1];
      d6_phone(g, S1.x, S1.y, S1.w, S1.h, S1.rot, (x, x0, y0, w, h) => {
        const gr = x.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#13204A'); gr.addColorStop(1, '#0B1230');
        x.fillStyle = gr; x.fillRect(x0, y0, w, h);
        d6_sans(x, '21:47', x0 + 16, y0 + 22, 12, D6.paper, { w: 700 });
        d6_sans(x, 'Aracı Kurum', x0 + 16, y0 + 62, 20, D6.paper, { w: 800 });
        d6_sans(x, 'Hisse hesabı', x0 + 16, y0 + 82, 12, D6.soft, { w: 600 });
        d6_sans(x, '₺3.912.400', x0 + 16, y0 + 122, 27, D6.paper, { w: 800 });
        d6_sans(x, '+%0,42 bugün', x0 + 16, y0 + 144, 13, D6.teal, { w: 700 });
        const pts = walk(41, 30, 0.004, 0.02).map((v, i, a) => [x0 + 16 + i * (w - 32) / 29, y0 + 230 - (v - Math.min(...a)) / (Math.max(...a) - Math.min(...a)) * 60]);
        d6_spark(x, pts, D6.teal, 2.5);
        [['AAPL', '₺1.402.180', '+%1,24'], ['VOO', '₺2.058.904', '+%0,58'], ['KO', '₺296.120', '−%0,31'], ['MSFT', '₺155.196', '+%0,82']].forEach((row, i) => {
          const ry = y0 + 278 + i * 40;
          x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(x0 + 10, ry - 22, w - 20, 34);
          d6_sans(x, row[0], x0 + 18, ry, 14, D6.paper, { w: 800 });
          d6_sans(x, row[1], x0 + w - 18, ry - 4, 12, D6.paper, { w: 700, a: 'right' });
          d6_sans(x, row[2], x0 + w - 18, ry + 9, 11, row[2][0] === '−' ? D6.red : D6.teal, { w: 700, a: 'right' });
        });
      }, { glow: D6.teal });
      // crypto exchange
      const S2 = screens[2];
      d6_phone(g, S2.x, S2.y, S2.w, S2.h, S2.rot, (x, x0, y0, w, h) => {
        const gr = x.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#1D1640'); gr.addColorStop(1, '#0E0B26');
        x.fillStyle = gr; x.fillRect(x0, y0, w, h);
        d6_sans(x, '21:47', x0 + 16, y0 + 22, 12, D6.paper, { w: 700 });
        d6_sans(x, 'Kripto Borsası', x0 + 16, y0 + 62, 20, D6.paper, { w: 800 });
        d6_sans(x, 'BTC / TRY', x0 + 16, y0 + 92, 13, D6.gold, { w: 800 });
        d6_sans(x, '₺3.648.210', x0 + 16, y0 + 126, 26, D6.paper, { w: 800 });
        const r = mulberry32(8); let v = 0.45;
        for (let i = 0; i < 14; i++) {
          const o = v; v = clamp(v + (r() - 0.45) * 0.28, 0.08, 0.95);
          const up = v >= o, cx = x0 + 20 + i * 14.4, col = up ? D6.teal : D6.red, hi = Math.max(o, v), lo = Math.min(o, v);
          x.fillStyle = col; x.fillRect(cx - 1, y0 + 262 - hi * 120 - 8 - r() * 6, 2, (hi - lo) * 120 + 18 + r() * 6);
          x.fillRect(cx - 5, y0 + 262 - hi * 120, 10, Math.max(4, (hi - lo) * 120));
        }
        [['ETH', '+%2,8'], ['SOL', '−%4,1'], ['AVAX', '+%1,2']].forEach((row, i) => {
          const ry = y0 + 300 + i * 40;
          x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(x0 + 10, ry - 22, w - 20, 34);
          d6_sans(x, row[0], x0 + 18, ry, 14, D6.paper, { w: 800 });
          d6_sans(x, row[1], x0 + w - 18, ry, 13, row[1][0] === '−' ? D6.red : D6.teal, { w: 800, a: 'right' });
        });
        x.fillStyle = D6.red; x.beginPath(); x.arc(x0 + w - 24, y0 + 56, 11, 0, TAU); x.fill();
        d6_sans(x, '3', x0 + w - 24, y0 + 61, 13, '#FFFFFF', { w: 800, a: 'center' });
      }, { glow: D6.lav });
      d6_gull(g, 1370, 110, 32, { flap: 0.2, a: 0.9 });
      d6_gull(g, 1445, 150, 21, { flap: 0.7, a: 0.7 });
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Köprü yanar',
    desc: 'Kamera Boğaz\'ın üstüne yükselir; köprünün kablo ışıkları uçtan uca yanar. Kripto724, suda titreyen yansımasıyla belirir.',
    draw(g) {
      const hz = 735;
      const P = d6_panorama(g, hz, {
        seed: 2, mosque: [1790, 30],
        bridge: { xa: 470, xb: 1450, top: 430, deck: 650, lit: 0.86, ancL: 160, ancR: 1760, hangers: 34, nl: 52 },
        left: { h: 230, x0: -20, x1: 470, env: [-999, -998, 200, 470] },
        right: { h: 250, x0: 1520, x1: W + 20, env: [1520, 1840, 3000, 3100] },
      });
      d6_galata(g, 150, P.L(150) + 50, 230);
      d6_water(g, hz, { seed: 2, k: 0.95 });
      d6_bridgeStreaks(g, P.B, hz, 0.3, 0.5);
      d6_ferry(g, 1620, 800, 230, { dir: -1, seed: 3 });
      d6_gull(g, 1530, 470, 30, { flap: 0.3 }); d6_gull(g, 1610, 520, 20, { flap: 0.8, a: 0.8 });
      const vg = g.createRadialGradient(CX, 270, 50, CX, 270, 700); vg.addColorStop(0, 'rgba(5,8,24,0.55)'); vg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = vg; g.fillRect(0, 0, W, 600);
      d6_serif(g, 'Tüm yatırımların,', CX, 205, 116, D6.paper, { a: 'center' });
      d6_serif(g, 'tek ekranda.', CX, 335, 132, D6.gold, { a: 'center', it: true, glow: 0.75 });
      const bg = g.createRadialGradient(CX, 880, 30, CX, 880, 560); bg.addColorStop(0, 'rgba(5,8,24,0.72)'); bg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = bg; g.fillRect(0, 760, W, 320);
      d6_float(g, 908, x => { x.save(); x.shadowColor = hexA(D6.gold, 0.5); x.shadowBlur = 30; wordmark(x, CX, 892, 112, null, { c: D6.paper, accent: D6.gold }); x.restore(); }, { a: 0.3, depth: 160, amp: 9, h1: 5 });
      d6_sans(g, 'TEK NET GÖRÜNÜM', CX, 1052, 22, D6.soft, { a: 'center', w: 800, ls: 6 });
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Boğaz\'ın üstünde',
    desc: 'Buzlu cam panel köprünün önünde suyun üstünde süzülür: sayaç döner, grafik köprü kablosu gibi gerilir, askı ışıkları tek tek yanar, halka kapanır.',
    draw(g) {
      const hz = 690;
      const P = d6_panorama(g, hz, {
        seed: 3, stars: 120,
        bridge: { xa: 170, xb: 1750, top: 200, deck: 560, lit: 1, ancL: -320, ancR: 2240, hangers: 44, nl: 66 },
        left: { h: 120, x0: -20, x1: 260, env: [-999, -998, 60, 260], blocks: 10 },
        right: { h: 140, x0: 1660, x1: W + 20, env: [1660, 1800, 3000, 3100], blocks: 10 },
      });
      d6_water(g, hz, { seed: 3, k: 0.9 });
      d6_bridgeStreaks(g, P.B, hz, 0.28, 0.6);
      const snap = canvas(W, H); snap.getContext('2d').drawImage(g.canvas, 0, 0);
      g.fillStyle = 'rgba(8,12,36,0.3)'; g.fillRect(0, 0, W, H);
      const X = 260, Y = 92, CW = 1400, CH = 640;
      d6_float(g, Y + CH, x => {
        // frosted glass: the city behind, blurred
        x.save(); rr(x, X, Y, CW, CH, 30); x.clip(); x.filter = 'blur(18px)'; x.drawImage(snap, 0, 0); x.restore();
        d6_card(x, X, Y, CW, CH, { r: 30, fill: 'rgba(11,16,46,0.74)' });
        d6_sans(x, 'TOPLAM PORTFÖY DEĞERİ', X + 52, Y + 72, 18, D6.soft, { w: 800, ls: 3 });
        d6_sans(x, '₺9.482.150,36', X + 46, Y + 160, 80, D6.paper, { w: 800, ls: -2 });
        rr(x, X + 52, Y + 186, 334, 42, 21); x.fillStyle = hexA(D6.teal, 0.16); x.fill();
        x.fillStyle = D6.teal; x.beginPath(); x.moveTo(X + 70, Y + 214); x.lineTo(X + 78, Y + 200); x.lineTo(X + 86, Y + 214); x.closePath(); x.fill();
        d6_sans(x, '+₺64.218,40 · +%0,68 bugün', X + 96, Y + 213, 18, D6.teal, { w: 800 });
        [['Toplam getiri', '+%38,4', D6.gold], ['Yıllık (CAGR)', '%11,2', D6.paper], ['Gerçekleşmemiş kâr', '₺1.284.906', D6.paper]].forEach(([l, v, c], i) => {
          const sx = X + 420 + i * 168;
          d6_sans(x, l, sx, Y + 196, 15, D6.soft, { w: 700 });
          d6_sans(x, v, sx, Y + 225, 22, c, { w: 800 });
        });
        // performance: the cable of the bridge
        const cx0 = X + 52, cx1 = X + 890, cy0 = Y + 312, cy1 = Y + 520, N = 44, rnd = mulberry32(83);
        const you = [], spy = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          you.push(1 + 0.384 * u * u - 0.06 * Math.sin(Math.PI * u) + 0.01 * Math.sin(i * 1.9) + (rnd() - 0.5) * 0.014);
          spy.push(1 + 0.241 * (0.55 * u * u + 0.45 * u) - 0.035 * Math.sin(Math.PI * u) + (rnd() - 0.5) * 0.012);
        }
        you[0] = spy[0] = 1; you[N] = 1.384; spy[N] = 1.241;
        const my = v => cy1 - (v - 0.93) / 0.5 * (cy1 - cy0);
        const Pp = s => s.map((v, i) => [lerp(cx0, cx1, i / N), my(v)]);
        const py = Pp(you), ps = Pp(spy);
        d6_sans(x, 'PERFORMANS · 1 YIL', cx0, cy0 - 40, 16, D6.soft, { w: 800, ls: 3 });
        x.fillStyle = D6.gold; x.fillRect(cx1 - 430, cy0 - 47, 24, 4); d6_sans(x, 'Portföy', cx1 - 398, cy0 - 40, 17, D6.paper, { w: 700 });
        x.save(); x.setLineDash([6, 5]); x.strokeStyle = D6.teal; x.lineWidth = 3; x.beginPath(); x.moveTo(cx1 - 296, cy0 - 45); x.lineTo(cx1 - 266, cy0 - 45); x.stroke(); x.restore();
        d6_sans(x, 'S&P 500 (SPY) +%24,1', cx1 - 256, cy0 - 40, 17, D6.paper, { w: 700 });
        x.strokeStyle = 'rgba(244,241,234,0.07)'; x.lineWidth = 1;
        for (let k = 0; k <= 4; k++) { const yy = lerp(cy0, cy1, k / 4); x.beginPath(); x.moveTo(cx0, yy); x.lineTo(cx1, yy); x.stroke(); }
        const ag = x.createLinearGradient(0, cy0, 0, cy1); ag.addColorStop(0, hexA(D6.gold, 0.22)); ag.addColorStop(1, hexA(D6.gold, 0));
        x.beginPath(); smoothPath(x, py); x.lineTo(cx1, cy1); x.lineTo(cx0, cy1); x.closePath(); x.fillStyle = ag; x.fill();
        x.strokeStyle = hexA(D6.gold, 0.3); x.lineWidth = 1.2; x.beginPath();
        for (let i = 0; i < N; i += 2) { const a = py[i], b = py[Math.min(N, i + 2)], mxh = (a[0] + b[0]) / 2; x.moveTo(a[0], a[1]); x.lineTo(mxh, cy1); x.lineTo(b[0], b[1]); }
        x.stroke();
        x.save(); x.setLineDash([7, 6]); d6_spark(x, ps, D6.teal, 3); x.restore();
        x.save(); x.shadowColor = D6.gold; x.shadowBlur = 16; d6_spark(x, py, D6.gold, 4.5); x.restore();
        for (let i = 0; i <= N; i += 2) { addGlow(x, D6.gold, py[i][0], py[i][1], 16, 0.55); x.fillStyle = '#FFF4D6'; x.beginPath(); x.arc(py[i][0], py[i][1], 3, 0, TAU); x.fill(); }
        const e = py[N]; addGlow(x, D6.gold, e[0], e[1], 60, 0.9);
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(e[0], e[1], 7, 0, TAU); x.fill();
        d6_tag(x, '+%38,4', e[0] - 6, e[1] - 12, 19, { c: D6.gold });
        const es = ps[N]; addGlow(x, D6.teal, es[0], es[1], 24, 0.7); x.fillStyle = D6.teal; x.beginPath(); x.arc(es[0], es[1], 5, 0, TAU); x.fill();
        ['Kas', 'Oca', 'Mar', 'May', 'Tem', 'Eyl', 'Eki'].forEach((m, i) => d6_sans(x, m, lerp(cx0, cx1, i / 6), cy1 + 30, 15, D6.dim, { w: 700, a: i === 0 ? 'left' : i === 6 ? 'right' : 'center' }));
        [['AAPL', '₺1.402.180', '+%1,24'], ['BTC', '₺778.415', '−%2,10'], ['VOO', '₺2.058.904', '+%0,58']].forEach((h, i) => {
          const hx = cx0 + i * 286, hy = Y + 596;
          rr(x, hx, hy - 27, 266, 46, 12); x.fillStyle = 'rgba(244,241,234,0.06)'; x.fill(); x.strokeStyle = 'rgba(244,241,234,0.1)'; x.lineWidth = 1; x.stroke();
          d6_sans(x, h[0], hx + 16, hy + 2, 16, D6.paper, { w: 800 });
          d6_sans(x, h[1], hx + 176, hy + 2, 16, D6.paper, { w: 700, a: 'right' });
          d6_sans(x, h[2], hx + 252, hy + 2, 15, h[2][0] === '−' ? D6.red : D6.teal, { w: 800, a: 'right' });
        });
        // allocation ring
        const rx = X + 1155, ry = Y + 236, R = 106;
        x.fillStyle = 'rgba(244,241,234,0.045)'; rr(x, X + 950, Y + 30, 410, 580, 22); x.fill();
        d6_sans(x, 'DAĞILIM · VARLIK SINIFI', X + 980, Y + 72, 16, D6.soft, { w: 800, ls: 3 });
        let a0 = -Math.PI / 2;
        D6_ALLOC.forEach(([, v, c]) => {
          const a1 = a0 + v / 100 * TAU;
          x.strokeStyle = c; x.lineWidth = 30; x.beginPath(); x.arc(rx, ry, R, a0 + 0.03, a1 - 0.03); x.stroke();
          a0 = a1;
        });
        addGlow(x, D6.gold, rx, ry, 100, 0.15);
        d6_serif(x, '8', rx, ry + 22, 72, D6.paper, { a: 'center' });
        d6_sans(x, 'varlık sınıfı', rx, ry + 50, 16, D6.soft, { w: 700, a: 'center' });
        D6_ALLOC.forEach(([l, v, c], i) => {
          const ly = Y + 418 + i * 34;
          x.fillStyle = c; rr(x, X + 985, ly - 13, 14, 14, 4); x.fill();
          d6_sans(x, l, X + 1012, ly, 18, D6.paper, { w: 600 });
          d6_sans(x, '%' + v, X + 1326, ly, 18, D6.paper, { w: 800, a: 'right' });
        });
      }, { a: 0.14, depth: 170 });
      const cap = g.createLinearGradient(0, 880, 0, H); cap.addColorStop(0, 'rgba(6,10,31,0)'); cap.addColorStop(1, 'rgba(6,10,31,0.85)');
      g.fillStyle = cap; g.fillRect(0, 880, W, H - 880);
      d6_runs(g, [['Portföyünün tamamı, ', false, D6.paper], ['bir bakışta.', true, D6.gold, 0.6]], CX, 992, 64, 'center');
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her piyasa',
    desc: 'Köprünün ışığı yukarı uzanıp dünya haritasına dönüşür: İstanbul\'dan New York, Londra, Frankfurt ve Tokyo\'ya ışık yayları çizilir; tabelalar yanar.',
    draw(g) {
      const hz = 965;
      d6_sky(g, hz, { seed: 4, stars: 140 });
      // world map of city lights
      const lon0 = -128, lon1 = 155, lat1 = 70, lat0 = -46, mx0 = 690, mx1 = 1880, kx = (mx1 - mx0) / (lon1 - lon0), my0 = 230;
      const P = (la, lo) => [mx0 + (lo - lon0) * kx, my0 + (lat1 - la) * kx];
      for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
        const la = GLOBE_DOTS[i], lo = GLOBE_DOTS[i + 1];
        if (lo < lon0 || lo > lon1 || la < lat0 || la > lat1) continue;
        const [x, y] = P(la, lo), h = Math.abs(Math.sin(la * 12.9898 + lo * 78.233) * 43758.5453) % 1;
        g.fillStyle = hexA(h > 0.94 ? D6.paper : D6.gold, 0.14 + 0.62 * h * h);
        g.beginPath(); g.arc(x, y, 1.3 + h * 1.1, 0, TAU); g.fill();
      }
      [[40.7, -74], [51.5, -0.1], [50.1, 8.7], [35.7, 139.7], [22.3, 114.2], [1.3, 103.8], [25.2, 55.3], [-23.5, -46.6], [19.1, 72.9], [43.7, -79.4], [41.9, -87.6], [34, -118.2], [48.9, 2.35]].forEach(([la, lo]) => {
        const [x, y] = P(la, lo); addGlow(g, D6.gold, x, y, 26, 0.55);
      });
      const cities = [['New York', 40.7, -74, 14, 32, 'left'], ['Londra', 51.5, -0.1, -12, -16, 'right'], ['Frankfurt', 50.1, 8.7, -2, 36, 'right'], ['Tokyo', 35.7, 139.7, 14, -16, 'left']];
      const ist = P(41.0, 29.0);
      g.save(); g.globalCompositeOperation = 'lighter';
      cities.forEach(([, la, lo]) => {
        const [x, y] = P(la, lo), d = Math.hypot(x - ist[0], y - ist[1]), mxp = (x + ist[0]) / 2, myp = Math.min(y, ist[1]) - d * 0.42;
        g.strokeStyle = hexA(D6.gold, 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(ist[0], ist[1]); g.quadraticCurveTo(mxp, myp, x, y); g.stroke();
        const n = Math.max(6, Math.round(d / 22));
        for (let k = 0; k <= n; k++) {
          const t = k / n, bx = (1 - t) * (1 - t) * ist[0] + 2 * t * (1 - t) * mxp + t * t * x, by = (1 - t) * (1 - t) * ist[1] + 2 * t * (1 - t) * myp + t * t * y;
          addGlow(g, D6.gold, bx, by, 10, 0.5); g.fillStyle = '#FFF2D0'; g.beginPath(); g.arc(bx, by, 1.8, 0, TAU); g.fill();
        }
      });
      g.restore();
      cities.forEach(([name, la, lo, dx, dy, al]) => {
        const [x, y] = P(la, lo);
        g.strokeStyle = D6.gold; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.stroke();
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill();
        g.save(); g.shadowColor = 'rgba(5,8,24,0.9)'; g.shadowBlur = 8;
        d6_sans(g, name, x + dx, y + dy, 20, D6.paper, { w: 700, a: al }); g.restore();
      });
      for (const [rad, a] of [[46, 0.25], [30, 0.45]]) { g.strokeStyle = hexA(D6.red, a); g.lineWidth = 2; g.beginPath(); g.arc(ist[0], ist[1], rad, 0, TAU); g.stroke(); }
      addGlow(g, D6.red, ist[0], ist[1], 60, 0.7);
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(ist[0], ist[1], 6, 0, TAU); g.fill();
      d6_serif(g, 'İstanbul', ist[0] + 26, ist[1] + 50, 34, D6.gold, { it: true, glow: 0.5 });
      // the bridge below, its light rising to the map
      d6_hills(g, { base: hz, h: 60, x0: 560, seed: 21, col: D6.far, blocks: 6, lights: 260, sc: 0.7, lightA: 0.7 });
      const B = d6_bridge(g, { xa: ist[0] - 380, xb: ist[0] + 380, top: 810, deck: 915, base: hz, lit: 1, hangers: 26, nl: 34, ancL: ist[0] - 620, ancR: ist[0] + 620 });
      const bm = B.cy(ist[0]);
      const beam = g.createLinearGradient(0, bm, 0, ist[1]); beam.addColorStop(0, hexA(D6.gold, 0.8)); beam.addColorStop(0.45, hexA(D6.gold, 0.3)); beam.addColorStop(1, hexA(D6.gold, 0.12));
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = beam; g.fillRect(ist[0] - 1.5, ist[1] + 10, 3, bm - ist[1] - 10);
      g.fillStyle = hexA(D6.gold, 0.05); g.beginPath(); g.moveTo(ist[0] - 40, bm); g.lineTo(ist[0] - 2, ist[1] + 10); g.lineTo(ist[0] + 2, ist[1] + 10); g.lineTo(ist[0] + 40, bm); g.fill();
      g.restore();
      d6_hills(g, { base: hz, h: 110, x0: 560, x1: 980, env: [560, 700, 820, 980], seed: 23, col: D6.mid, blocks: 10, lights: 120 });
      d6_hills(g, { base: hz, h: 120, x0: 1680, x1: W + 20, env: [1680, 1800, 3000, 3100], seed: 24, col: D6.mid, blocks: 10, lights: 120 });
      d6_water(g, hz, { seed: 6, shimmer: 120, k: 0.8 });
      d6_bridgeStreaks(g, B, hz, 0.3, 0.5);
      d6_sans(g, 'AVRUPA', ist[0] - 62, 1050, 20, D6.soft, { w: 800, ls: 5, a: 'right' });
      d6_arrow(g, ist[0], 1043, 30, D6.gold, 2.5, true);
      d6_sans(g, 'ASYA', ist[0] + 62, 1050, 20, D6.soft, { w: 800, ls: 5 });
      // left column
      const lg = g.createLinearGradient(0, 0, 760, 0); lg.addColorStop(0, 'rgba(5,8,24,0.65)'); lg.addColorStop(1, 'rgba(5,8,24,0)');
      g.fillStyle = lg; g.fillRect(0, 0, 760, hz);
      d6_kicker(g, 'İki kıtadan bütün dünyaya', 104, 150);
      d6_serif(g, 'Her varlık,', 100, 262, 104, D6.paper);
      d6_serif(g, 'her piyasa.', 100, 368, 104, D6.gold, { it: true, glow: 0.6 });
      ['Hisse senedi', 'ETF', 'Tahvil', 'Opsiyon', 'Kripto', 'Gayrimenkul', 'Yatırım fonu', 'Nakit'].forEach((s, i) => {
        const x = 104 + (i % 2) * 272, y = 430 + Math.floor(i / 2) * 72, on = i !== 7;
        g.save(); g.shadowColor = hexA(D6.gold, on ? 0.5 : 0.2); g.shadowBlur = 20;
        rr(g, x, y, 254, 56, 14); g.fillStyle = 'rgba(15,20,56,0.95)'; g.fill(); g.restore();
        rr(g, x, y, 254, 56, 14); g.lineWidth = 1.5; g.strokeStyle = hexA(D6.gold, on ? 0.65 : 0.3); g.stroke();
        addGlow(g, D6.gold, x + 26, y + 28, 22, on ? 0.9 : 0.3);
        g.fillStyle = on ? '#FFF1C8' : hexA(D6.gold, 0.5); g.beginPath(); g.arc(x + 26, y + 28, 5, 0, TAU); g.fill();
        d6_sans(g, s, x + 46, y + 36, 23, on ? D6.paper : D6.soft, { w: 700 });
      });
      d6_plus(g, '60', 100, 820, 108, D6.gold, 0.5);
      d6_sans(g, 'piyasa', 104, 862, 26, D6.paper, { w: 700 });
      d6_plus(g, '50', 372, 820, 108, D6.teal);
      d6_sans(g, 'para birimi', 376, 862, 26, D6.paper, { w: 700 });
      d6_sans(g, 'Her işlem, kendi tarihindeki kurla çevrilir.', 104, 910, 21, D6.soft, { w: 600 });
    },
  },
  {
    time: '17–21 sn', title: 'Otomatik senkron',
    desc: 'Vapurlar aracı kurum adlarıyla iskeleye yanaşır, dümen suları senkron çizgilerine dönüşür. Dolunay suya yakamoz bırakır; saat kulesinde marka yanar.',
    draw(g) {
      const hz = 560;
      d6_panorama(g, hz, {
        seed: 5, farH: 70, moon: [1590, 175, 64],
        bridge: { xa: 620, xb: 1060, top: 425, deck: 510, lit: 1, hangers: 20, nl: 26, ancL: 470, ancR: 1210 },
        left: { h: 120, x0: -20, x1: 560, env: [-999, -998, 300, 560], sc: 0.85 },
        right: { h: 100, x0: 1180, x1: W + 20, env: [1180, 1400, 3000, 3100], sc: 0.85 },
      });
      d6_water(g, hz, { seed: 5, k: 1.0 });
      d6_streak(g, 1590, hz, 520, '#FFF3D6', 120, 0.5, 9);
      d6_streak(g, 1590, hz, 420, D6.gold, 50, 0.4, 10);
      const pier = { x: 1170, wy: 790 };
      const ferries = [
        { name: 'Interactive Brokers', x: 320, wy: 640, L: 200, dir: 1 },
        { name: 'Coinbase', x: 770, wy: 612, L: 140, dir: 1 },
        { name: 'eToro', x: 820, wy: 760, L: 250, dir: 1 },
        { name: 'Charles Schwab', x: 470, wy: 915, L: 380, dir: 1 },
        { name: 'DEGIRO', x: 1690, wy: 640, L: 180, dir: -1 },
        { name: 'Trading 212', x: 1630, wy: 960, L: 350, dir: -1 },
      ];
      // wakes: the route each ferry has come along, glowing teal (the sync line), and the dotted way ahead
      ferries.forEach((f, i) => {
        const bow = [f.x + f.dir * f.L * 0.5, f.wy - 4], stern = [f.x - f.dir * f.L * 0.47, f.wy - 3];
        const tx = pier.x - f.dir * 250 * (0.4 + (i % 3) * 0.2), ty = pier.wy + 4;
        g.save(); g.setLineDash([2, 9]); g.lineCap = 'round'; g.strokeStyle = hexA(D6.gold, 0.8); g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(...bow); g.quadraticCurveTo((bow[0] + tx) / 2, Math.max(bow[1], ty) + 30, tx, ty); g.stroke(); g.restore();
        const len = f.L * 2.1, ex = stern[0] - f.dir * len, bend = (i % 2 ? -1 : 1) * f.L * 0.14;
        const Pw = t => [lerp(stern[0], ex, t), stern[1] + bend * t * t + f.L * 0.02 * t];
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
        // churned water: a widening, fading band behind the stern
        for (let k = 0; k < 30; k++) {
          const t0 = k / 30, t1 = (k + 1) / 30;
          g.strokeStyle = hexA(D6.teal, 0.2 * Math.pow(1 - t0, 1.2)); g.lineWidth = f.L * (0.03 + 0.09 * t0);
          g.beginPath(); g.moveTo(...Pw(t0)); g.lineTo(...Pw(t1)); g.stroke();
        }
        // the sync line itself
        for (let k = 0; k < 30; k++) {
          const t0 = k / 30, t1 = (k + 1) / 30;
          g.strokeStyle = hexA(D6.teal, 0.9 * Math.pow(1 - t0, 1.5)); g.lineWidth = Math.max(1.5, f.L * 0.01);
          g.beginPath(); g.moveTo(...Pw(t0)); g.lineTo(...Pw(t1)); g.stroke();
        }
        for (const t of [0.18, 0.42]) { const [px, py] = Pw(t); addGlow(g, D6.teal, px, py, f.L * 0.08 + 8, 0.8); g.fillStyle = '#E8FFFC'; g.beginPath(); g.arc(px, py, Math.max(2, f.L * 0.009), 0, TAU); g.fill(); }
        // foam
        g.strokeStyle = hexA(D6.paper, 0.32); g.lineWidth = Math.max(1, f.L * 0.006);
        g.beginPath(); g.moveTo(...stern); g.lineTo(stern[0] - f.dir * f.L * 0.7, stern[1] - f.L * 0.03); g.moveTo(...stern); g.lineTo(stern[0] - f.dir * f.L * 0.7, stern[1] + f.L * 0.07); g.stroke();
        const bowF = [f.x + f.dir * f.L * 0.52, f.wy - 2];
        g.beginPath(); g.moveTo(...bowF); g.lineTo(bowF[0] - f.dir * f.L * 0.12, bowF[1] + f.L * 0.03); g.stroke();
        g.restore();
      });
      d6_float(g, pier.wy, x => d6_iskele(x, pier.x, pier.wy, 440), { a: 0.3, depth: 200 });
      ferries.forEach((f, i) => {
        const m = d6_ferry(g, f.x, f.wy, f.L, { dir: f.dir, seed: 20 + i });
        d6_tag(g, f.name, f.x - f.dir * f.L * 0.05, m.top - 6, Math.max(16, f.L * 0.06));
      });
      // status chip above the clock tower
      const cy = 330;
      rr(g, pier.x - 220, cy - 30, 440, 58, 29); g.fillStyle = 'rgba(10,15,45,0.92)'; g.fill();
      g.strokeStyle = hexA(D6.teal, 0.7); g.lineWidth = 1.5; g.stroke();
      g.fillStyle = D6.teal; g.beginPath(); g.arc(pier.x - 186, cy - 1, 14, 0, TAU); g.fill();
      check(g, pier.x - 186, cy - 1, 14, D6.navy, 3.5);
      d6_sans(g, 'Son senkron 03:00 · tümü güncel', pier.x - 160, cy + 7, 21, D6.paper, { w: 700 });
      g.strokeStyle = hexA(D6.teal, 0.6); g.setLineDash([3, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(pier.x, cy + 30); g.lineTo(pier.x, 418); g.stroke(); g.setLineDash([]);
      d6_kicker(g, 'Her gece, kendiliğinden', 104, 148);
      d6_runs(g, [['25', false, D6.paper], ['+', false, D6.paper, 0, 'sans'], [' aracı kurum,', false, D6.paper]], 100, 240, 88);
      d6_serif(g, 'otomatik senkron.', 100, 328, 88, D6.gold, { it: true, glow: 0.6 });
      d6_sans(g, 'Salt-okunur bağlantı · her gece güncellenir · CSV ile içe aktarma', 104, 376, 23, D6.soft, { w: 600 });
      d6_gull(g, 1440, 260, 30, { flap: 0.25 });
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takvimi',
    desc: 'Kıyıdaki apartmanlarda pencereler ay ay yanar: her bina bir ay, yanan katlar alınan temettü. Son üç ay turkuaz kesik çizgi: tahmin.',
    draw(g) {
      const qy = 905, wy = 962;
      d6_sky(g, qy, { seed: 6, stars: 150, haze: 0.2 });
      d6_hills(g, { base: qy, h: 330, seed: 31, col: D6.far, blocks: 9, lights: 650, sc: 0.8, lightA: 0.6, mosque: [1500, 40] });
      d6_hills(g, { base: qy, h: 150, seed: 34, col: D6.mid, blocks: 10, lights: 260, sc: 0.9, lightA: 0.6 });
      const base = i => 884 - 24 * Math.sin(Math.PI * (i + 0.5) / 12);
      const bw = 118, gap = 24, x0 = 112, fh = 32;
      g.fillStyle = D6.near; g.beginPath(); g.moveTo(0, qy + 2);
      for (let x = 0; x <= W; x += 10) g.lineTo(x, base(clamp((x - x0 - bw / 2) / (bw + gap), -0.5, 11.5)) + 2);
      g.lineTo(W, qy + 2); g.closePath(); g.fill();
      D6_DIV.forEach((v, i) => {
        const x = x0 + i * (bw + gap), by = base(i), floors = 2 + Math.round(v / 10), top = by - floors * fh - 10, paid = i < 9, now = i === 8;
        const bc = paid ? [mixHex(D6.near, D6.paper, 0.08), mixHex(D6.near, D6.gold, 0.1), mixHex(D6.near, D6.lav, 0.15)][i % 3] : mixHex(D6.near, D6.teal, 0.12);
        const edge = mixHex(bc, D6.paper, 0.16), dark = mixHex(bc, '#000000', 0.32);
        if (paid) addGlow(g, D6.gold, x + bw / 2, by - floors * fh / 2, floors * fh * 0.8, now ? 0.35 : 0.13);
        g.fillStyle = bc; g.fillRect(x, top, bw, by - top + 8);
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + bw - 14, top, 14, by - top + 8);
        const rt = i % 3;
        if (rt === 0) {
          g.fillStyle = mixHex(D6.red, D6.navy, 0.66);
          g.beginPath(); g.moveTo(x - 7, top + 2); g.lineTo(x + 18, top - 24); g.lineTo(x + bw - 18, top - 24); g.lineTo(x + bw + 7, top + 2); g.closePath(); g.fill();
          g.fillStyle = dark; g.fillRect(x + bw * 0.68, top - 36, 12, 20);
        } else if (rt === 1) {
          g.fillStyle = edge; g.fillRect(x - 4, top - 4, bw + 8, 6);
          g.fillStyle = dark; g.fillRect(x + 12, top - 20, 30, 16);
          d6_antenna(g, x + bw - 34, top - 4, 30, dark);
        } else {
          g.fillStyle = edge; g.fillRect(x - 4, top - 4, bw + 8, 6);
          g.fillStyle = dark; g.fillRect(x + 20, top - 18, 10, 14); g.fillRect(x + 42, top - 22, 10, 18);
          g.beginPath(); g.arc(x + bw - 28, top - 12, 11, Math.PI * 0.85, Math.PI * 1.85); g.fill();
        }
        if (i % 4 === 1 && floors > 4) {
          const cyT = by - (floors - 1) * fh + 2, cyH = (floors - 2) * fh - 4;
          g.fillStyle = mixHex(bc, D6.paper, 0.07); g.fillRect(x + 38, cyT, 42, cyH);
          g.strokeStyle = edge; g.lineWidth = 1.5; g.strokeRect(x + 38, cyT, 42, cyH);
        }
        for (let f = 0; f < floors; f++) {
          const fy = by - (f + 1) * fh;
          g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x, fy + fh - 2, bw, 2);
          for (let c = 0; c < 3; c++) {
            const wx = x + 17 + c * 31, wy2 = fy + 7, ww = 22, wh = 19;
            if (paid) {
              const a = 0.72 + 0.28 * (((f * 7 + c * 3 + i) % 5) / 4);
              g.fillStyle = hexA(now ? '#FFE7A6' : D6.gold, a); g.fillRect(wx, wy2, ww, wh);
              g.fillStyle = 'rgba(13,19,51,0.35)'; g.fillRect(wx + ww / 2 - 0.75, wy2, 1.5, wh);
              g.fillStyle = edge; g.fillRect(wx - 2, wy2 + wh, ww + 4, 2.5);
            } else {
              g.fillStyle = hexA(D6.teal, 0.12); g.fillRect(wx, wy2, ww, wh);
              g.strokeStyle = hexA(D6.teal, 0.8); g.lineWidth = 1.5; g.setLineDash([4, 3]); g.strokeRect(wx + 0.75, wy2 + 0.75, ww - 1.5, wh - 1.5); g.setLineDash([]);
            }
          }
          if (i % 4 === 3 && f % 2 === 1 && f < floors - 1) {
            g.strokeStyle = edge; g.lineWidth = 1.2; g.strokeRect(x + 8, fy + fh - 10, bw - 16, 8);
            g.beginPath(); for (let b = x + 14; b < x + bw - 10; b += 7) { g.moveTo(b, fy + fh - 10); g.lineTo(b, fy + fh - 2); } g.stroke();
          }
        }
        if (now) { addGlow(g, D6.gold, x + bw / 2, top + 16, 60, 0.6); d6_tag(g, 'Eylül · VOO +₺3.124,10', x + bw / 2, top - 30, 21, { c: D6.gold }); }
      });
      // quay with lamps, then the water
      g.fillStyle = '#0B1033'; g.fillRect(0, qy - 6, W, wy - qy + 6);
      g.fillStyle = hexA(D6.paper, 0.12); g.fillRect(0, qy - 6, W, 2);
      for (let i = 0; i < 14; i++) {
        const lx = x0 - 12 + i * (bw + gap);
        g.fillStyle = '#05071A'; g.fillRect(lx - 1.5, qy - 40, 3, 36);
        addGlow(g, D6.gold, lx, qy - 42, 26, 0.7); g.fillStyle = '#FFF0C8'; g.beginPath(); g.arc(lx, qy - 42, 3, 0, TAU); g.fill();
      }
      d6_water(g, wy, { seed: 6, k: 0.62, shimmer: 70, a: 0.85, dark: 0.25 });
      d6_gull(g, 960, 390, 26, { flap: 0.3, a: 0.85 }); d6_gull(g, 1030, 420, 18, { flap: 0.7, a: 0.7 });
      D6_DIV.forEach((v, i) => d6_sans(g, 'OŞMNMHTAEEKA'[i], x0 + i * (bw + gap) + bw / 2, 945, 28, i < 9 ? D6.paper : D6.teal, { w: 800, a: 'center' }));
      d6_kicker(g, 'Temettü takvimi', 104, 148);
      d6_serif(g, 'Hiçbir temettüyü', 100, 242, 94, D6.paper);
      d6_serif(g, 'kaçırma.', 100, 334, 94, D6.gold, { it: true, glow: 0.6 });
      d6_card(g, 1180, 70, 640, 230, { r: 22 });
      d6_sans(g, 'YILLIK TAHMİNİ GELİR', 1220, 128, 17, D6.soft, { w: 800, ls: 2 });
      d6_sans(g, '₺218.400', 1216, 206, 64, D6.gold, { w: 800, ls: -1 });
      d6_sans(g, 'MALİYETE GÖRE GETİRİ', 1544, 128, 17, D6.soft, { w: 800, ls: 2 });
      d6_sans(g, '%4,1', 1540, 206, 64, D6.teal, { w: 800, ls: -1 });
      g.fillStyle = D6.gold; g.fillRect(1222, 252, 18, 18); d6_sans(g, 'Alınan', 1250, 268, 19, D6.paper, { w: 700 });
      g.strokeStyle = D6.teal; g.lineWidth = 2; g.setLineDash([4, 3]); g.strokeRect(1360, 253, 17, 17); g.setLineDash([]);
      d6_sans(g, 'Tahmini', 1388, 268, 19, D6.paper, { w: 700 });
      d6_sans(g, '9 ayda ₺156.720 alındı', 1780, 268, 19, D6.soft, { w: 600, a: 'right' });
    },
  },
  {
    time: '25–31 sn', title: 'Risk laboratuvarı',
    desc: 'Kız Kulesi\'nin fenerinden 1.000 senaryo ışık hüzmesi gibi açılır ve suya yansır; %5–%95 bandı kilitlenir, risk ölçüleri tek tek yazılır.',
    draw(g) {
      const hz = 740;
      d6_sky(g, hz, { seed: 7, stars: 120, starA: 0.7 });
      d6_hills(g, { base: hz, h: 60, seed: 41, col: D6.far, blocks: 6, lights: 380, sc: 0.7, lightA: 0.6 });
      const kx = 330, kwy = 772, ks = 320, lanY = kwy - ks * 0.56 - ks * 0.055;
      const ox = kx + 2, oy = lanY, x1 = 1320;
      const my = v => oy - Math.log(v) * 250;
      const steps = D6_MC.paths[0].length - 1;
      g.save(); g.beginPath(); g.rect(0, 0, W, hz); g.clip();
      g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.3;
      D6_MC.paths.forEach(p => {
        const end = p[p.length - 1];
        g.strokeStyle = rgb(ramp([D6.red, D6.gold, '#FFE7A6', D6.teal], clamp((Math.log(end) + 0.4) / 1.6)), 0.065);
        g.beginPath(); p.forEach((v, k) => { const x = lerp(ox, x1, k / steps); k ? g.lineTo(x, my(v)) : g.moveTo(x, my(v)); }); g.stroke();
      });
      g.restore();
      const band = [];
      D6_MC.p95.forEach((v, k) => band.push([lerp(ox, x1, k / steps), my(v)]));
      for (let k = steps; k >= 0; k--) band.push([lerp(ox, x1, k / steps), my(D6_MC.p5[k])]);
      g.fillStyle = hexA(D6.gold, 0.07); g.beginPath(); band.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
      const lines = [[D6_MC.p95, D6.teal, '%95'], [D6_MC.p50, D6.paper, 'Medyan'], [D6_MC.p5, D6.red, '%5']];
      lines.forEach(([s, col]) => {
        const pts = s.map((v, k) => [lerp(ox, x1, k / steps), my(v)]);
        g.save(); g.shadowColor = col; g.shadowBlur = 12; d6_spark(g, pts, col, 3.2); g.restore();
      });
      d6_water(g, hz, { seed: 7, k: 0.72, a: 0.75, dark: 0.35 });
      lines.forEach(([s, col, l]) => {
        const e = [x1, my(s[s.length - 1])];
        addGlow(g, col, e[0], e[1], 30, 0.8); g.fillStyle = col; g.beginPath(); g.arc(e[0], e[1], 6, 0, TAU); g.fill();
        d6_sans(g, l, e[0] + 18, e[1] + 8, 22, col, { w: 800 });
      });
      d6_float(g, kwy, x => d6_kiz(x, kx, kwy, ks), { a: 0.35, depth: 200 });
      addGlow(g, '#FFF1C8', ox, oy, 70, 0.9);
      ['Bugün', '2 yıl', '4 yıl', '6 yıl', '8 yıl', '10 yıl'].forEach((s, k) => {
        if (!k) return;
        const x = lerp(ox, x1, k / 5);
        g.fillStyle = hexA(D6.paper, 0.5); g.fillRect(x - 1, hz - 6, 2, 12);
        g.save(); g.shadowColor = 'rgba(5,8,24,0.9)'; g.shadowBlur = 8; d6_sans(g, s, x, hz + 38, 20, D6.soft, { w: 700, a: 'center' }); g.restore();
      });
      d6_kicker(g, 'Risk laboratuvarı', 104, 148);
      d6_runs(g, [['1.000 ', false, D6.paper], ['olası gelecek.', true, D6.gold, 0.6]], 100, 240, 94);
      d6_sans(g, 'Monte Carlo · 1–10 yıl · %5–%95 aralığı', 104, 290, 25, D6.soft, { w: 600 });
      d6_float(g, 742, x => {
        d6_card(x, 1452, 150, 390, 580, { r: 24 });
        d6_sans(x, 'RİSK ÖLÇÜLERİ', 1488, 205, 18, D6.soft, { w: 800, ls: 3 });
        [['Sharpe', '1,24', D6.gold], ['Beta', '0,92', D6.paper], ['Oynaklık', '%14,8', D6.paper], ['VaR (%95)', '−%2,1', D6.red], ['Maks. düşüş', '−%18,6', D6.red], ['Kriz testi', '4 senaryo', D6.teal]].forEach(([l, v, c], i) => {
          const y = 270 + i * 76;
          d6_sans(x, l, 1488, y + 12, 22, D6.soft, { w: 600 });
          d6_sans(x, v, 1806, y + 14, 34, c, { w: 800, a: 'right' });
          if (i < 5) { x.fillStyle = 'rgba(244,241,234,0.08)'; x.fillRect(1488, y + 40, 318, 1.5); }
        });
      }, { a: 0.16, depth: 160 });
    },
  },
  {
    time: '31–35 sn', title: 'Hızlı özellikler',
    desc: 'Ahşap bir konağın dört penceresi vuruşla sırayla yanar: endeksle kıyasla, vergi raporu, yapay zekâ ile içe aktar, kriz testi. Pervazda bir kedi.',
    draw(g) {
      g.fillStyle = '#10163F'; g.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 26) {
        g.fillStyle = (y / 26) % 2 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.12)'; g.fillRect(0, y, W, 26);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, y + 24, W, 2);
      }
      const vg = g.createRadialGradient(CX, CY, 300, CX, CY, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
      d6_runs(g, [['Her pencerede ', false, D6.paper], ['bir araç.', true, D6.gold, 0.6]], CX, 84, 58, 'center');
      const wins = [[150, 160, '01', 'Kıyasla'], [1070, 160, '02', 'Vergi raporu'], [150, 596, '03', 'Yapay zekâ ile içe aktar'], [1070, 596, '04', 'Kriz testi']];
      const ww = 700, wh = 352, shutter = mixHex(D6.teal, D6.navy, 0.5), frame = mixHex(D6.paper, D6.navy, 0.3);
      wins.forEach(([x, y, n, t], i) => {
        const hot = i === 2;
        // cornice with a shallow arch
        g.fillStyle = frame;
        g.beginPath(); g.moveTo(x - 40, y - 16); g.lineTo(x - 40, y - 26); g.quadraticCurveTo(x + ww / 2, y - 50, x + ww + 40, y - 26); g.lineTo(x + ww + 40, y - 16); g.quadraticCurveTo(x + ww / 2, y - 40, x - 40, y - 16); g.fill();
        for (const sx of [x - 74, x + ww + 8]) {
          g.fillStyle = shutter; rr(g, sx, y - 6, 66, wh + 12, 4); g.fill();
          g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
          for (let ly = y + 8; ly < y + wh; ly += 14) { g.beginPath(); g.moveTo(sx + 8, ly); g.lineTo(sx + 58, ly + 4); g.stroke(); }
          g.strokeStyle = hexA(D6.paper, 0.12); g.strokeRect(sx + 4, y - 2, 58, wh + 4);
        }
        addGlow(g, D6.gold, x + ww / 2, y + wh / 2, ww * 0.85, hot ? 0.35 : 0.18);
        g.save(); rr(g, x, y, ww, wh, 10); g.clip();
        const ig = g.createLinearGradient(0, y, 0, y + wh);
        ig.addColorStop(0, hot ? '#5A4636' : '#3A3045'); ig.addColorStop(0.5, hot ? '#2D2440' : '#221C3C'); ig.addColorStop(1, '#141433');
        g.fillStyle = ig; g.fillRect(x, y, ww, wh);
        addGlow(g, D6.gold, x + ww * 0.5, y - 20, ww * 0.7, hot ? 0.55 : 0.32);
        d6_sans(g, n, x + 34, y + 54, 22, D6.gold, { w: 800 });
        d6_serif(g, t, x + 76, y + 58, 40, D6.paper);
        const cx = x + 34, cyy = y + 90, cw = ww - 68, chh = wh - 120;
        if (i === 0) {
          const N = 48, rnd = mulberry32(71), you = [], spy = [];
          for (let k = 0; k <= N; k++) { const u = k / N; you.push(1 + 0.426 * Math.pow(u, 1.5) + 0.02 * Math.sin(k * 0.9) + (rnd() - 0.5) * 0.03); spy.push(1 + 0.319 * u + 0.012 * Math.sin(k * 0.7 + 1) + (rnd() - 0.5) * 0.02); }
          you[0] = spy[0] = 1; you[N] = 1.426; spy[N] = 1.319;
          const m = s => s.map((v, k) => [cx + k / N * (cw - 230), cyy + chh - 56 - (v - 0.96) / 0.5 * (chh - 70)]);
          const py = m(you), ps = m(spy);
          g.save(); g.setLineDash([7, 6]); d6_spark(g, ps, D6.teal, 3); g.restore();
          g.save(); g.shadowColor = D6.gold; g.shadowBlur = 14; d6_spark(g, py, D6.gold, 4.5); g.restore();
          const e = py[N]; addGlow(g, D6.gold, e[0], e[1], 30, 0.8); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(e[0], e[1], 5, 0, TAU); g.fill();
          d6_sans(g, '+%42,6', x + ww - 34, cyy + 64, 46, D6.gold, { w: 800, a: 'right' });
          d6_sans(g, 'Portföy', x + ww - 34, cyy + 92, 19, D6.soft, { w: 700, a: 'right' });
          d6_sans(g, '+%31,9', x + ww - 34, cyy + 154, 36, D6.teal, { w: 800, a: 'right' });
          d6_sans(g, 'S&P 500 · VOO · her endeks', x + ww - 34, cyy + 182, 17, D6.soft, { w: 700, a: 'right' });
        } else if (i === 1) {
          ['FIFO', 'LIFO', 'Ort. maliyet'].forEach((s, k) => {
            const bx = cx + k * 214, on = k === 0;
            rr(g, bx, cyy + 6, 198, 54, 27); g.fillStyle = on ? D6.gold : 'rgba(244,241,234,0.06)'; g.fill();
            g.strokeStyle = hexA(D6.gold, on ? 1 : 0.5); g.lineWidth = 1.5; g.stroke();
            d6_sans(g, s, bx + 99, cyy + 41, 22, on ? D6.navy : D6.paper, { w: 800, a: 'center' });
          });
          d6_sans(g, 'GERÇEKLEŞEN KÂR · 2025', cx, cyy + 112, 18, D6.soft, { w: 800, ls: 2 });
          d6_sans(g, '₺127.340', cx - 4, cyy + 190, 76, D6.paper, { w: 800, ls: -2 });
          rr(g, x + ww - 254, cyy + 134, 220, 66, 14); g.fillStyle = 'rgba(31,181,168,0.14)'; g.fill();
          g.strokeStyle = hexA(D6.teal, 0.6); g.stroke();
          g.fillStyle = D6.paper; rr(g, x + ww - 238, cyy + 146, 32, 42, 4); g.fill();
          g.fillStyle = D6.navy; for (let k = 0; k < 4; k++) g.fillRect(x + ww - 232, cyy + 156 + k * 7, 20, 2.5);
          d6_sans(g, 'Vergi raporu', x + ww - 196, cyy + 164, 18, D6.paper, { w: 800 });
          d6_sans(g, 'her planda', x + ww - 196, cyy + 186, 16, D6.teal, { w: 700 });
        } else if (i === 2) {
          g.fillStyle = D6.paper; g.beginPath(); g.moveTo(cx + 10, cyy + 14); g.lineTo(cx + 110, cyy + 14); g.lineTo(cx + 140, cyy + 44); g.lineTo(cx + 140, cyy + 190); g.lineTo(cx + 10, cyy + 190); g.closePath(); g.fill();
          g.fillStyle = '#D9D3C4'; g.beginPath(); g.moveTo(cx + 110, cyy + 14); g.lineTo(cx + 110, cyy + 44); g.lineTo(cx + 140, cyy + 44); g.fill();
          d6_sans(g, '.CSV', cx + 75, cyy + 122, 30, D6.navy, { w: 800, a: 'center' });
          for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(13,19,51,0.25)'; g.fillRect(cx + 30, cyy + 144 + k * 12, 90, 4); }
          d6_arrow(g, cx + 205, cyy + 102, 36, D6.gold, 4);
          sparkle(g, cx + 200, cyy + 44, 20, D6.gold); sparkle(g, cx + 236, cyy + 154, 12, '#FFF1C8'); sparkle(g, cx + 172, cyy + 164, 8, D6.gold);
          addGlow(g, D6.gold, cx + 200, cyy + 44, 40, 0.6);
          [['AAPL', '10 adet', '12.03'], ['VOO', 'temettü +₺3.124', '28.03'], ['BTC', '0,25 adet', '02.04']].forEach(([s, d, dt], k) => {
            const ry = cyy + 28 + k * 64;
            rr(g, cx + 280, ry - 4, 352, 52, 12); g.fillStyle = 'rgba(244,241,234,0.08)'; g.fill();
            g.strokeStyle = hexA(D6.gold, 0.4); g.lineWidth = 1.2; g.stroke();
            g.fillStyle = D6.teal; g.beginPath(); g.arc(cx + 306, ry + 22, 12, 0, TAU); g.fill();
            check(g, cx + 306, ry + 22, 12, D6.navy, 3);
            d6_sans(g, s, cx + 330, ry + 29, 20, D6.paper, { w: 800 });
            d6_sans(g, d, cx + 400, ry + 29, 18, D6.paper, { w: 600 });
            d6_sans(g, dt, cx + 618, ry + 29, 16, D6.soft, { w: 600, a: 'right' });
          });
        } else {
          const pts = [];
          for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([cx + u * cw, cyy + 30 + 150 * Math.exp(-Math.pow((u - 0.42) / 0.11, 2)) * (u < 0.42 ? 1 : 0.92) - 30 * u]); }
          const lo = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
          g.fillStyle = hexA(D6.red, 0.18); g.beginPath(); g.moveTo(pts[14][0], pts[14][1]); for (let k = 14; k <= 40; k++) g.lineTo(pts[k][0], pts[k][1]); g.lineTo(pts[40][0], pts[14][1]); g.closePath(); g.fill();
          g.save(); g.shadowColor = D6.paper; g.shadowBlur = 8; d6_spark(g, pts, D6.paper, 3.5); g.restore();
          g.save(); g.setLineDash([5, 5]); g.strokeStyle = hexA(D6.paper, 0.4); g.lineWidth = 1.5; g.beginPath(); g.moveTo(pts[14][0], pts[14][1]); g.lineTo(cx + cw, pts[14][1]); g.stroke(); g.restore();
          g.fillStyle = D6.red; g.beginPath(); g.arc(lo[0], lo[1], 7, 0, TAU); g.fill(); addGlow(g, D6.red, lo[0], lo[1], 30, 0.7);
          d6_sans(g, 'Maks. düşüş −%18,6', lo[0] + 24, lo[1] + 8, 24, D6.paper, { w: 800 });
          rr(g, x + ww - 300, y + wh - 70, 266, 44, 22); g.fillStyle = 'rgba(244,241,234,0.08)'; g.fill();
          g.strokeStyle = hexA(D6.paper, 0.2); g.lineWidth = 1; g.stroke();
          d6_sans(g, '4 gerçek kriz senaryosu', x + ww - 167, y + wh - 41, 18, D6.paper, { w: 700, a: 'center' });
        }
        g.restore();
        g.lineWidth = 12; g.strokeStyle = frame; rr(g, x - 6, y - 6, ww + 12, wh + 12, 12); g.stroke();
        g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,0.35)'; rr(g, x, y, ww, wh, 8); g.stroke();
        g.fillStyle = mixHex(D6.paper, D6.navy, 0.28); g.fillRect(x - 30, y + wh + 6, ww + 60, 16);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - 26, y + wh + 22, ww + 52, 6);
      });
      // geraniums on the upper-left sill
      const sill = 160 + wh + 6;
      [[232, sill], [318, sill]].forEach(([px, py], k) => {
        g.fillStyle = '#B4583A'; g.beginPath(); g.moveTo(px - 26, py - 40); g.lineTo(px + 26, py - 40); g.lineTo(px + 20, py); g.lineTo(px - 20, py); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(px - 26, py - 40, 52, 6);
        g.fillStyle = mixHex(D6.teal, D6.navy, 0.35);
        for (let j = 0; j < 6; j++) { g.beginPath(); g.ellipse(px - 24 + j * 10, py - 48 - (j % 2) * 8, 12, 7, (j - 2.5) * 0.3, 0, TAU); g.fill(); }
        for (let j = 0; j < 4; j++) { const fx = px - 15 + j * 10 + k * 3, fy = py - 66 - (j % 2) * 10; g.fillStyle = D6.red; g.beginPath(); g.arc(fx, fy, 7, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(fx - 2, fy - 2, 2.5, 0, TAU); g.fill(); }
      });
      // a street cat on the lower-right sill, silhouetted against the lit window
      const cxp = 1150, cyp = 596 + wh + 6, cat = '#05071A';
      g.fillStyle = cat;
      g.beginPath(); g.ellipse(cxp, cyp - 34, 30, 36, 0, 0, TAU); g.fill();
      g.beginPath(); g.arc(cxp + 4, cyp - 80, 20, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(cxp - 12, cyp - 92); g.lineTo(cxp - 8, cyp - 112); g.lineTo(cxp + 2, cyp - 98); g.fill();
      g.beginPath(); g.moveTo(cxp + 8, cyp - 98); g.lineTo(cxp + 20, cyp - 112); g.lineTo(cxp + 22, cyp - 90); g.fill();
      g.strokeStyle = cat; g.lineWidth = 8; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cxp - 22, cyp - 6); g.quadraticCurveTo(cxp - 64, cyp + 2, cxp - 58, cyp + 44); g.stroke();
      g.fillStyle = D6.gold; g.beginPath(); g.ellipse(cxp - 2, cyp - 82, 3.5, 2.2, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cxp + 12, cyp - 82, 3.5, 2.2, 0, 0, TAU); g.fill();
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış: Şafak',
    desc: 'Boğaz\'a şafak söker, köprü ışıkları birer birer söner. Marka ve "Ücretsiz başla" düğmesi yükselir; adres martılarla birlikte belirir.',
    draw(g) {
      const hz = 850;
      d6_sky(g, hz, { seed: 9, stars: 90, starA: 0.5, haze: 0, stops: [[0, '#0E1340'], [0.24, '#232A63'], [0.44, '#4D3F7E'], [0.62, '#9A5D8C'], [0.78, '#E08A86'], [0.9, '#FFB67E'], [1, '#FFD98E']] });
      const sx = 1560, sy = hz - 70;
      addGlow(g, D6.gold, sx, sy, 760, 0.5); addGlow(g, '#FFFFFF', sx, sy, 220, 0.55);
      const sg = g.createRadialGradient(sx, sy - 20, 10, sx, sy, 66); sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.7, '#FFF4D2'); sg.addColorStop(1, '#FFE29A');
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
      d6_float(g, hz + 34, x => d6_kiz(x, sx - 110, hz + 34, 230, { sil: '#140F33' }), { a: 0.35, depth: 120 });
      [[1640, 430, 32, 0.2], [1720, 470, 22, 0.7], [1580, 500, 18, 0.5]].forEach(([x, y, s, f]) => d6_gull(g, x, y, s, { flap: f, col: '#1A1640' }));
      drawMark(g, CX, 165, 74, { glow: 0.6, col: D6.teal, col2: D6.gold, arrow: D6.gold });
      g.save(); g.shadowColor = 'rgba(10,8,40,0.55)'; g.shadowBlur = 30; wordmark(g, CX, 375, 132, null, { c: D6.paper, accent: D6.gold }); g.restore();
      d6_serif(g, 'Tüm yatırımların, tek ekranda.', CX, 445, 42, D6.paper, { a: 'center', it: true });
      const bw = 820, bh = 96, by = 545;
      g.save(); g.shadowColor = 'rgba(13,19,51,0.55)'; g.shadowBlur = 40; g.shadowOffsetY = 12;
      rr(g, CX - bw / 2, by - bh / 2, bw, bh, bh / 2); g.fillStyle = D6.navy; g.fill(); g.restore();
      rr(g, CX - bw / 2, by - bh / 2, bw, bh, bh / 2); g.lineWidth = 2; g.strokeStyle = hexA(D6.gold, 0.7); g.stroke();
      g.fillStyle = D6.red; g.beginPath(); g.arc(CX - bw / 2 + 50, by, 9, 0, TAU); g.fill(); addGlow(g, D6.red, CX - bw / 2 + 50, by, 26, 0.6);
      d6_sans(g, 'Ücretsiz başla — kredi kartı gerekmez', CX - 6, by + 12, 34, D6.paper, { w: 800, a: 'center' });
      d6_arrow(g, CX + bw / 2 - 58, by, 16, D6.gold, 4);
      d6_sans(g, 'kripto724.com', CX, 668, 60, D6.navy, { w: 800, a: 'center', ls: -1 });
      d6_sans(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', CX, 1048, 21, hexA(D6.paper, 0.75), { w: 500, a: 'center' });
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
  gr.addColorStop(0, 'rgba(255,200,97,0.08)'); gr.addColorStop(1, 'rgba(255,200,97,0)');
  g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
}

window.DESIGN = {
  id: 6, name: 'İstanbul Gecesi',
  concept: 'Boğaz\'da bir gece, katmanlı düz vektör illüstrasyonla: köprü, Galata, Kız Kulesi, vapurlar ve martılar. Şehrin ışıkları veriye dönüşür; köprünün kablo ışıkları performans grafiği, pencereler temettü takvimi, vapur rotaları senkron çizgileri olur. Yerel ve sıcak.',
  board: {
    bg: '#0B1030', ink: '#F4F1EA', soft: '#9AA3C4', accent: '#FFC861', line: 'rgba(255,200,97,0.22)',
    display: { f: D6_SERIF, w: 400, ls: -1 }, text: { f: D6_SANS, w: 500 }, badge: '#FFC861', badgeInk: '#0B1030', paper: d6_boardPaper,
  },
  palette: [['#0D1333', 'Lacivert'], ['#1FB5A8', 'Boğaz'], ['#FFC861', 'Şehir ışığı'], ['#E30A17', 'Kırmızı'], ['#F4F1EA', 'Kırık beyaz']],
  fonts: ['DM Serif Display', 'Manrope 500–800'],
  motion: ['Katmanlı parallax şehir silueti', 'Işıkların veriye dönüşmesi', 'Vapur ve martı detayları'],
  music: 'modern elektronik, ney esintili synth, 120 BPM',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d6_init,
  scenes: D6_SCENES,
};
