'use strict';
/* 4. MARKETS (14–18 s): out of the allocation ring comes a dot globe (real land
 * outlines, assets/globe.js). Asset classes stack up on the left; then markets
 * light up on the globe, trade routes arc between them, and currency symbols
 * orbit while the counters climb to 60+ markets and 50+ currencies. */

const CITIES = [
  ['New York', 40.71, -74.0], ['Toronto', 43.65, -79.38], ['São Paulo', -23.55, -46.63], ['London', 51.51, -0.13],
  ['Frankfurt', 50.11, 8.68], ['Zurich', 47.37, 8.54], ['Istanbul', 41.01, 28.98], ['Mumbai', 19.08, 72.88],
  ['Singapore', 1.35, 103.82], ['Hong Kong', 22.32, 114.17], ['Tokyo', 35.68, 139.69], ['Sydney', -33.87, 151.21],
];
const LABELLED = new Set([0, 2, 3, 4, 6, 7]);
const ARCS = [[0, 3], [3, 4], [1, 0], [0, 2], [4, 6], [3, 5], [6, 7], [2, 3], [7, 8], [8, 9], [9, 10], [10, 11]];
const ASSETS = [
  ['Stocks', C.blue, 'stock'], ['ETFs', C.cyan, 'etf'], ['Bonds', C.violet, 'bond'], ['Options', C.pink, 'option'],
  ['Crypto', C.amber, 'crypto'], ['Real estate', C.mint, 'house'], ['Mutual funds', '#7AA2FF', 'fund'], ['Cash', '#9BE37A', 'cash'],
];
const CURR = ['$', '€', '£', '¥', '₺', '₹', '₩', 'CHF'];
const GL = { n: 0 };
const S4 = { chips: 14.5, swap: 15.85, stats: 16.05, fx: 16.85, out: 17.55 };

function init4() {
  const n = GLOBE_DOTS.length / 2;
  GL.n = n;
  GL.cl = new Float32Array(n); GL.sl = new Float32Array(n); GL.lon = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const la = GLOBE_DOTS[2 * i] * Math.PI / 180;
    GL.cl[i] = Math.cos(la); GL.sl[i] = Math.sin(la); GL.lon[i] = GLOBE_DOTS[2 * i + 1] * Math.PI / 180;
  }
  // arcs: great-circle points lifted above the surface
  const vec = (la, lo) => { la *= Math.PI / 180; lo *= Math.PI / 180; return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; };
  GL.arcs = ARCS.map(([a, b]) => {
    const A = vec(CITIES[a][1], CITIES[a][2]), B = vec(CITIES[b][1], CITIES[b][2]);
    const om = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
    const pts = [];
    for (let k = 0; k <= 48; k++) {
      const s = k / 48, sa = Math.sin((1 - s) * om) / Math.sin(om), sb = Math.sin(s * om) / Math.sin(om);
      const v = [A[0] * sa + B[0] * sb, A[1] * sa + B[1] * sb, A[2] * sa + B[2] * sb];
      const h = 1 + 0.1 * om * Math.sin(Math.PI * s);
      pts.push([Math.asin(clamp(v[2], -1, 1)), Math.atan2(v[1], v[0]), h]);
    }
    return pts;
  });
}

function globeView(t) {
  return { lc: (-58 + (t - 14) * 17) * Math.PI / 180, pc: 20 * Math.PI / 180 };
}
// orthographic projection of (lat, lon, height) in radians; returns [x, y, z] on the unit disc
function gproj(v, la, lo, h = 1) {
  const cl = Math.cos(la), d = lo - v.lc, cd = Math.cos(d);
  return [h * cl * Math.sin(d), h * (Math.cos(v.pc) * Math.sin(la) - Math.sin(v.pc) * cl * cd), h * (Math.sin(v.pc) * Math.sin(la) + Math.cos(v.pc) * cl * cd)];
}

function globeGeom(t) {
  const enter = E.outExpo(prog(t, 13.98, 14.75));
  let x = lerp(CX, 1295, enter), y = lerp(CY, 560, enter), R = lerp(1500, 365, enter);
  const ex = E.inOutCubic(prog(t, S4.out, 18.0));
  x = lerp(x, CX, ex); y = lerp(y, 640, ex); R = lerp(R, 95, ex);
  return { x, y, R, a: 1 - prog(t, 17.86, 18.02) };
}

function drawGlobe(g, t, geo) {
  const v = globeView(t), { x: gx, y: gy, R } = geo;
  g.save(); g.globalAlpha *= geo.a;
  // atmosphere + body
  addGlow(g, C.cyan, gx, gy, R * 1.65, 0.28);
  const body = g.createRadialGradient(gx - R * 0.35, gy - R * 0.45, R * 0.1, gx, gy, R);
  body.addColorStop(0, '#16306A'); body.addColorStop(0.7, '#0B1A40'); body.addColorStop(1, '#081430');
  g.fillStyle = body; g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.fill();
  const rim = g.createRadialGradient(gx, gy, R * 0.82, gx, gy, R * 1.04);
  rim.addColorStop(0, 'rgba(56,200,255,0)'); rim.addColorStop(0.85, 'rgba(56,200,255,0.28)'); rim.addColorStop(1, 'rgba(56,200,255,0)');
  g.fillStyle = rim; g.beginPath(); g.arc(gx, gy, R * 1.04, 0, TAU); g.fill();
  // dots, bucketed by depth so each bucket is one fill
  const ds = Math.max(1.2, R / 150);
  const buckets = [];
  for (let k = 0; k < 7; k++) buckets.push(new Path2D());
  const sp = Math.sin(v.pc), cp = Math.cos(v.pc);
  for (let i = 0; i < GL.n; i++) {
    const cl = GL.cl[i], sl = GL.sl[i], d = GL.lon[i] - v.lc, cd = Math.cos(d);
    const z = sp * sl + cp * cl * cd;
    const px = gx + R * cl * Math.sin(d), py = gy - R * (cp * sl - sp * cl * cd);
    const b = z < 0 ? 0 : 1 + Math.min(5, Math.floor(z * 6));
    if (z < -0.2) continue;
    const s = z < 0 ? ds * 0.7 : ds * (0.75 + 0.35 * z);
    buckets[b].rect(px - s / 2, py - s / 2, s, s);
  }
  buckets.forEach((p, b) => {
    g.fillStyle = b === 0 ? 'rgba(90,140,230,0.10)' : rgb(mix(hex2rgb('#3D7BFF'), hex2rgb('#8FE8FF'), b / 6), 0.25 + b * 0.12);
    g.fill(p);
  });
  // arcs
  GL.arcs.forEach((pts, i) => {
    const t0 = 14.85 + i * 0.16;
    const p = E.inOutCubic(prog(t, t0, t0 + 0.6));
    if (p <= 0) return;
    const n = Math.max(1, Math.round(p * (pts.length - 1)));
    const col = i % 2 ? C.mint : C.cyan;
    g.strokeStyle = hexA(col, 0.85); g.lineWidth = Math.max(1.5, R / 150); g.lineCap = 'round';
    g.beginPath();
    let pen = false, head = null;
    for (let k = 0; k <= n; k++) {
      const [la, lo, h] = pts[k];
      const q = gproj(v, la, lo, h);
      const hidden = q[2] < 0 && q[0] * q[0] + q[1] * q[1] < 1;
      const sx = gx + R * q[0], sy = gy - R * q[1];
      if (hidden) { pen = false; continue; }
      if (!pen) { g.moveTo(sx, sy); pen = true; } else g.lineTo(sx, sy);
      head = k === n ? [sx, sy] : head;
    }
    g.stroke();
    if (head && p < 1) addGlow(g, col, head[0], head[1], R * 0.09, 1);
    // travelling pulse once drawn
    if (p >= 1) {
      const u = ((t - t0 - 0.6) * 0.8) % 1, k = Math.floor(u * (pts.length - 1));
      const q = gproj(v, ...pts[k]);
      if (!(q[2] < 0 && q[0] * q[0] + q[1] * q[1] < 1)) addGlow(g, col, gx + R * q[0], gy - R * q[1], R * 0.06, 0.9);
    }
  });
  // market pins
  CITIES.forEach(([name, la, lo], i) => {
    const t0 = 14.55 + i * 0.07;
    const p = t - t0;
    if (p <= 0) return;
    const q = gproj(v, la * Math.PI / 180, lo * Math.PI / 180);
    if (q[2] < 0.02) return;
    const sx = gx + R * q[0], sy = gy - R * q[1], s = spring(p, 2.4, 8) * Math.max(0.3, R / 365);
    const fa = clamp(q[2] * 4);
    g.save(); g.globalAlpha *= fa;
    addGlow(g, C.mint, sx, sy, 34 * s, 0.9);
    const pr = (t * 0.9 + i * 0.13) % 1;
    g.strokeStyle = hexA(C.mint, 0.6 * (1 - pr)); g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, (6 + pr * 22) * s, 0, TAU); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(sx, sy, 5 * s, 0, TAU); g.fill();
    if (LABELLED.has(i) && q[2] > 0.3 && R > 200) {
      g.globalAlpha *= clamp((q[2] - 0.3) * 4) * clamp(p * 3);
      text(g, name, sx + 14, sy - 12, { s: 18, w: 600, f: 'Txt', a: 'left', c: C.ink });
    }
    g.restore();
  });
  g.restore();
}

function assetIcon(g, kind, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s / 40, s / 40);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (...p) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
  switch (kind) {
    case 'stock': [[-9, 4, 10], [0, -4, 14], [9, -9, 10]].forEach(([cx, cy, h]) => { L(cx, cy - h / 2 - 4, cx, cy + h / 2 + 4); g.fillRect(cx - 3.5, cy - h / 2, 7, h); }); break;
    case 'etf': g.beginPath(); g.arc(0, 0, 12, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 12, -Math.PI / 2, 0); g.closePath(); g.fill(); break;
    case 'bond': g.strokeRect(-10, -13, 20, 26); L(-5, -5, 5, -5); L(-5, 1, 5, 1); L(-5, 7, 2, 7); break;
    case 'option': L(-12, 10, -2, 0, 10, -10); L(-2, 0, 10, 8); L(4, -10, 10, -10, 10, -4); break;
    case 'crypto': g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.stroke(); text(g, 'B', 0, 6.5, { s: 17, w: 900, c: col }); L(-1.5, -10, -1.5, -7); L(2.5, -10, 2.5, -7); L(-1.5, 7, -1.5, 10); L(2.5, 7, 2.5, 10); break;
    case 'house': L(-12, -1, 0, -12, 12, -1); L(-8, -4, -8, 12, 8, 12, 8, -4); L(-2, 12, -2, 5, 3, 5, 3, 12); break;
    case 'fund': [[-6, -4], [0, 2], [6, -4]].forEach(([cx, cy]) => { g.beginPath(); g.arc(cx, cy, 7.5, 0, TAU); g.stroke(); }); break;
    case 'cash': g.strokeRect(-14, -8, 28, 16); g.beginPath(); g.arc(0, 0, 4.5, 0, TAU); g.stroke(); break;
  }
  g.restore();
}

function scene4(g, t) {
  const geo = globeGeom(t);
  const ox = -E.inCubic(prog(t, S4.out, S4.out + 0.35)) * 900; // left column exits
  // currency orbit (behind the globe)
  const orbit = (front) => CURR.forEach((sym, i) => {
    const p = t - (S4.stats + i * 0.06);
    if (p <= 0) return;
    const th = i / CURR.length * TAU + (t - 16) * 0.55;
    const depth = Math.sin(th);
    if ((depth >= 0) !== front) return;
    const rx = geo.R * 1.42, ry = geo.R * 0.36, tilt = -0.28;
    const ex0 = Math.cos(th) * rx, ey0 = depth * ry;
    const x = geo.x + ex0 * Math.cos(tilt) - ey0 * Math.sin(tilt), y = geo.y + ex0 * Math.sin(tilt) + ey0 * Math.cos(tilt);
    const s = spring(p, 2.2, 7) * (0.78 + 0.22 * depth) * Math.min(1, geo.R / 365);
    g.save(); g.globalAlpha *= (0.55 + 0.45 * depth) * geo.a * clamp(p * 4);
    g.translate(x, y); g.scale(s, s);
    g.fillStyle = 'rgba(14,26,58,0.92)'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill();
    g.strokeStyle = hexA(SEG[i % 6], 0.7); g.lineWidth = 2.5; g.stroke();
    text(g, sym, 0, sym.length > 1 ? 9 : 13, { s: sym.length > 1 ? 22 : 36, w: 800, c: C.ink });
    g.restore();
  });
  orbit(false);
  drawGlobe(g, t, geo);
  orbit(true);

  g.save(); g.translate(ox, 0);
  // headline swaps from "Every asset." to "Every market."
  kicker(g, 'EVERY ASSET', 130, 300, C.mint, prog(t, 14.15, 14.55), prog(t, S4.swap, S4.swap + 0.2));
  kicker(g, 'EVERY MARKET', 130, 300, C.cyan, prog(t, S4.swap + 0.15, S4.swap + 0.55));
  const H1 = { s: 124, w: 900, ls: -3, a: 'left' };
  slotText(g, 'Every asset.', 130, 425, H1, prog(t, 14.2, 14.75), prog(t, S4.swap, S4.swap + 0.25), 0.03);
  slotText(g, 'Every market.', 130, 425, { ...H1, grad: [[0, '#FFFFFF'], [0.55, '#FFFFFF'], [0.75, '#38C8FF'], [1, '#2EF2A6']] }, prog(t, S4.swap + 0.12, S4.swap + 0.7), 0, 0.03);
  // asset chips
  ASSETS.forEach(([label, col, icon], i) => {
    const t0 = S4.chips + i * 0.125;
    const p = t - t0;
    if (p <= 0) return;
    const out = E.inCubic(prog(t, S4.swap - 0.1 + i * 0.025, S4.swap + 0.2 + i * 0.025));
    if (out >= 1) return;
    const cx = 130 + (i % 2) * 330, cy = 530 + Math.floor(i / 2) * 86;
    const s = spring(p, 2.4, 9);
    g.save(); g.globalAlpha *= clamp(p * 6) * (1 - out);
    g.translate(cx - out * 200, cy); g.scale(s, s);
    rr(g, 0, -32, 306, 64, 32); g.fillStyle = 'rgba(16,28,60,0.92)'; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = hexA(col, 0.45); g.stroke();
    g.fillStyle = hexA(col, 0.16); g.beginPath(); g.arc(32, 0, 22, 0, TAU); g.fill();
    assetIcon(g, icon, 32, 0, 30, col);
    text(g, label, 68, 9, { s: 25, w: 600, f: 'Txt', a: 'left', c: C.ink });
    g.restore();
  });
  // counters
  const sp = prog(t, S4.stats, S4.stats + 0.4);
  if (sp > 0) {
    [['60+', 60, 'markets', 130], ['50+', 50, 'currencies', 590]].forEach(([fmt, n, label, x], k) => {
      const p = prog(t, S4.stats + k * 0.12, S4.stats + 0.4 + k * 0.12);
      if (p <= 0) return;
      g.save(); g.globalAlpha *= E.outCubic(p); g.translate(0, (1 - E.outCubic(p)) * 40);
      const v = n * E.outQuart(prog(t, S4.stats + 0.05 + k * 0.12, S4.stats + 0.8 + k * 0.12));
      g.save();
      const gr = g.createLinearGradient(x, 520, x + 300, 680);
      gr.addColorStop(0, k ? '#38C8FF' : '#2EF2A6'); gr.addColorStop(1, k ? '#A77BFF' : '#38C8FF');
      odometer(g, fmt, v, x, 650, { s: 180, w: 900, f: 'Disp', a: 'left', c: gr });
      g.restore();
      text(g, label, x + 6, 712, { s: 34, w: 600, f: 'Txt', a: 'left', c: C.soft });
      g.restore();
    });
  }
  slotText(g, 'Every trade converted at its trade-date FX rate,', 130, 820, { s: 32, w: 500, f: 'Txt', a: 'left', c: C.ink }, prog(t, S4.fx, S4.fx + 0.5), 0, 0.006);
  slotText(g, 'returns split into asset and currency effects.', 130, 866, { s: 32, w: 500, f: 'Txt', a: 'left', c: C.soft }, prog(t, S4.fx + 0.12, S4.fx + 0.62), 0, 0.006);
  g.restore();
}

function cues4(cue) {
  cue(14.0, 'impact', { gain: 0.6 });
  cue(14.02, 'sweep', { dur: 0.7, gain: 0.3 });
  cue(14.2, 'whoosh', { dur: 0.3, f0: 600, f1: 3000, gain: 0.3, pan: -0.5 });
  ASSETS.forEach((_, i) => cue(S4.chips + i * 0.125, 'pop', { pitch: 1 + i * 0.09, gain: 0.42, pan: -0.6 + (i % 2) * 0.2 }));
  CITIES.forEach((_, i) => cue(14.55 + i * 0.07, 'blip', { pitch: 1.3 + (i % 4) * 0.15, gain: 0.14, pan: 0.5 }));
  ARCS.forEach((_, i) => cue(14.85 + i * 0.16, 'zap', { pitch: 1 + (i % 3) * 0.2, gain: 0.12, pan: 0.45 }));
  cue(S4.swap, 'whoosh', { dur: 0.3, f0: 3000, f1: 600, gain: 0.35, pan: -0.5 });
  for (let k = 0; k < 2; k++) for (let j = 0; j < 12; j++) cue(S4.stats + 0.05 + k * 0.12 + j * 0.055, 'tick', { pitch: 1 + j * 0.05 + k * 0.2, gain: 0.2, pan: -0.5 + k * 0.3 });
  CURR.forEach((_, i) => cue(S4.stats + i * 0.06, 'pop', { pitch: 1.4 + i * 0.06, gain: 0.22, pan: 0.5 }));
  cue(S4.out, 'whoosh', { dur: 0.45, f0: 400, f1: 4000, gain: 0.45 });
}
