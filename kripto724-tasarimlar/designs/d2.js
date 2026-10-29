'use strict';
/* TASARIM 02 · 7/24 SAAT
 * "Piyasalar hiç uyumaz." The film turns around one 24-hour dial (noon at the top,
 * midnight at the bottom, clockwise). Scene by scene the hand moves on from 03:00
 * and the sky warms from deep night navy to dawn coral and daylight amber.
 * Calm and premium: Sora + Manrope, frosted glass, hairline ticks, slow star parallax.
 * The app syncs NIGHTLY: nothing here implies live or real-time tracking. */

const D2 = {
  night: '#0B1026', navy: '#24346E', coral: '#FF7A59', amber: '#FFC15E', teal: '#3DD9C1',
  ink: '#F6F2FB', soft: '#ABA8CF', dim: '#6F7099', peri: '#8C9BFF', lilac: '#C9B8FF', deep: '#060A1C',
};
const D2F = 'Sora', D2T = 'Manrope';
const D2_DAWN = [[0, D2.amber], [1, D2.coral]];
const D2_ST = { stars: null, mc: null };

/* ── type ── */
function d2_up(s) { return s.toLocaleUpperCase('tr'); }
// display line (Sora); o.max shrinks it to fit
function d2_h(g, s, x, y, size, col, o = {}) {
  let f = { f: D2F, w: o.w || 700, s: size, ls: o.ls == null ? -size * 0.025 : o.ls };
  if (o.max) f = fit(g, s, f, o.max);
  text(g, s, x, y, { ...f, a: o.a || 'left', b: o.b, c: col });
}
// text line (Manrope: also carries every ₺ amount, Sora has no ₺)
function d2_t(g, s, x, y, size, col, o = {}) {
  let f = { f: D2T, w: o.w || 600, s: size, ls: o.ls || 0 };
  if (o.max) f = fit(g, s, f, o.max);
  text(g, s, x, y, { ...f, a: o.a || 'left', b: o.b, c: col });
}
function d2_tw(g, s, size, o = {}) { return measure(g, s, { f: o.f || D2T, w: o.w || 600, s: size, ls: o.ls || 0 }); }
// display line painted in the dawn gradient
function d2_grad(g, s, x, y, size, o = {}) {
  let f = { f: o.f || D2F, w: o.w || 800, s: size, ls: o.ls == null ? -size * 0.025 : o.ls };
  if (o.max) f = fit(g, s, f, o.max);
  const w = measure(g, s, f), x0 = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  const gr = g.createLinearGradient(x0, y - f.s, x0 + w, y);
  (o.stops || D2_DAWN).forEach(([p, c]) => gr.addColorStop(p, c));
  if (o.shadow) { g.save(); g.shadowColor = o.shadow; g.shadowBlur = 30; }
  text(g, s, x, y, { ...f, a: o.a || 'left', c: gr });
  if (o.shadow) g.restore();
  return w;
}
// small spaced capitals with a glowing dot
function d2_kick(g, s, x, y, col, o = {}) {
  const S = o.s || 21, label = d2_up(s), f = { f: D2T, w: 800, s: S, ls: S * 0.2 };
  const w = measure(g, label, f) + 26 - S * 0.2;
  const x0 = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  addGlow(g, col, x0 + 6, y - S * 0.36, 26, 0.45);
  g.fillStyle = col; g.beginPath(); g.arc(x0 + 6, y - S * 0.36, 5.5, 0, TAU); g.fill();
  text(g, label, x0 + 26, y, { ...f, a: 'left', c: col });
}
function d2_pill(g, x, y, label, o = {}) {
  const s = o.s || 22, h = o.h || s * 2.1, padX = o.padX || s * 0.95;
  const font = { f: D2T, s, w: o.w || 700, a: 'left', b: 'middle', c: o.c || D2.ink, ls: o.ls || 0 };
  const dot = o.dot ? s * 0.9 : 0;
  const tw = measure(g, label, font), w = o.width || padX * 2 + tw + dot;
  const ax = o.a === 'center' ? x - w / 2 : o.a === 'right' ? x - w : x;
  rr(g, ax, y - h / 2, w, h, h / 2); g.fillStyle = o.fill || 'rgba(255,255,255,0.07)'; g.fill();
  if (o.stroke !== false) { g.lineWidth = 1.5; g.strokeStyle = o.stroke || 'rgba(255,255,255,0.2)'; g.stroke(); }
  if (o.dot) { g.fillStyle = o.dot; g.beginPath(); g.arc(ax + padX + s * 0.2, y, s * 0.24, 0, TAU); g.fill(); }
  text(g, label, ax + (o.width ? (w - tw - dot) / 2 : padX) + dot, y + 1, font);
  return w;
}

/* ── icons ── */
function d2_moon(g, x, y, r, glowA = 1) {
  g.save();
  addGlow(g, '#B9C2FF', x, y, r * 4.2, 0.4 * glowA);
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  g.beginPath(); g.rect(x - r * 2, y - r * 2, r * 4, r * 4); g.arc(x + r * 0.52, y - r * 0.34, r * 0.86, 0, TAU);
  const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, '#FFF6E6'); gr.addColorStop(1, '#DCD3FF');
  g.fillStyle = gr; g.fill('evenodd');
  g.restore();
}
function d2_sunIcon(g, x, y, r, col = D2.amber) {
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = r * 0.24; g.lineCap = 'round';
  addGlow(g, col, x, y, r * 3.5, 0.4);
  g.beginPath(); g.arc(x, y, r * 0.52, 0, TAU); g.fill();
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); g.lineTo(x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18); g.stroke();
  }
  g.restore();
}
function d2_arrow(g, x, y, s, col, lw = 4) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x + s * 0.35, y - s * 0.62); g.lineTo(x + s, y); g.lineTo(x + s * 0.35, y + s * 0.62); g.stroke();
  g.restore();
}
function d2_coin(g, x, y, r) {
  addGlow(g, D2.amber, x, y, r * 3.6, 0.4);
  const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, '#FFE6AE'); gr.addColorStop(0.5, D2.amber); gr.addColorStop(1, '#E3913A');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(122,62,10,0.4)'; g.lineWidth = Math.max(1, r * 0.09); g.beginPath(); g.arc(x, y, r * 0.74, 0, TAU); g.stroke();
  text(g, '₺', x, y + r * 0.37, { f: D2T, w: 800, s: r * 1.02, a: 'center', c: '#83460F' });
}

/* ── sky ── */
// keyframes: k → colours from the top of the frame down to the horizon
const D2_SKY = [
  [0.00, ['#03061A', '#070B22', '#0B1026', '#141B44']],
  [0.30, ['#050920', '#0A1130', '#17205A', '#2A3878']],
  [0.55, ['#070C26', '#141D4E', '#3A3A7E', '#A35C7E']],
  [0.75, ['#0B1230', '#22306C', '#7E5088', '#FF7A59']],
  [1.00, ['#18245A', '#3B3F84', '#D06A7E', '#FFC15E']],
];
function d2_skyStops(k) {
  let i = 0; while (i < D2_SKY.length - 2 && k > D2_SKY[i + 1][0]) i++;
  const [k0, c0] = D2_SKY[i], [k1, c1] = D2_SKY[i + 1], t = clamp((k - k0) / (k1 - k0));
  return c0.map((c, j) => mix(hex2rgb(c), hex2rgb(c1[j]), t));
}
function d2_stars(g, a, px = 0, maxY = H) {
  if (a <= 0.01) return;
  g.save();
  for (const s of D2_ST.stars) {
    const x = ((s.x + px * (s.l + 1) * 0.6) % W + W) % W, y = s.y;
    const fade = clamp((maxY - 40 - y) / 260);
    const al = a * s.a * fade;
    if (al < 0.02) continue;
    g.globalAlpha = al;
    if (s.sp) { addGlow(g, '#C9D0FF', x, y, s.r * 9, 0.5); sparkle(g, x, y, s.r * 3.4, '#F4F1FF'); }
    else { g.fillStyle = '#ECEAFF'; g.beginPath(); g.arc(x, y, s.r, 0, TAU); g.fill(); }
  }
  g.restore();
}
// o.hz: horizon y (sky gradient ends there), o.px: star parallax, o.gx: glow centre
function d2_sky(g, k, o = {}) {
  const hz = o.hz || H, cs = d2_skyStops(k);
  const gr = g.createLinearGradient(0, 0, 0, hz);
  [0, 0.42, 0.78, 1].forEach((p, j) => gr.addColorStop(p, rgb(cs[j])));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // horizon glow: lavender at night, coral → amber at dawn
  const warm = clamp((k - 0.3) / 0.7), gx = o.gx == null ? CX : o.gx;
  g.save(); g.translate(gx, hz); g.scale(1, 0.4);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1400);
  rg.addColorStop(0, rgb(mix(hex2rgb('#4A55A8'), hex2rgb(D2.amber), warm), 0.35 + 0.4 * warm));
  rg.addColorStop(0.45, rgb(mix(hex2rgb('#2A3478'), hex2rgb(D2.coral), warm), 0.12 + 0.18 * warm));
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(-1600, -1400, 3200, 2800);
  g.restore();
  d2_stars(g, (1 - clamp((k - 0.45) / 0.5)) * (o.starA == null ? 1 : o.starA), o.px || 0, hz);
  // soft vignette at the top
  const v = g.createLinearGradient(0, 0, 0, 260); v.addColorStop(0, 'rgba(2,4,16,0.35)'); v.addColorStop(1, 'rgba(2,4,16,0)');
  g.fillStyle = v; g.fillRect(0, 0, W, 260);
}
function d2_sea(g, hz, k, sx) {
  const gr = g.createLinearGradient(0, hz, 0, H);
  gr.addColorStop(0, mixHex('#1C2150', '#3A2C55', k)); gr.addColorStop(0.35, '#121638'); gr.addColorStop(1, '#070A1C');
  g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
  const r = mulberry32(77), n = 30;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const u = i / n, y = hz + 5 + Math.pow(u, 1.35) * (H - hz - 8);
    const w = (260 - u * 170) * (0.55 + r() * 0.9);
    g.fillStyle = hexA(i % 3 ? D2.amber : D2.coral, 0.42 * (1 - u) * k);
    rr(g, sx - w / 2 + (r() - 0.5) * 60, y, w, 2.2 + u * 2, 2); g.fill();
  }
  g.restore();
  const hl = g.createLinearGradient(0, 0, W, 0);
  hl.addColorStop(0, hexA(D2.amber, 0)); hl.addColorStop(sx / W, hexA('#FFE2A8', 0.85 * k)); hl.addColorStop(1, hexA(D2.amber, 0));
  g.fillStyle = hl; g.fillRect(0, hz - 1, W, 2);
}
function d2_sun(g, x, y, r, hz) {
  addGlow(g, D2.amber, x, y, r * 7, 0.55);
  addGlow(g, D2.coral, x, y, r * 12, 0.25);
  g.save();
  if (hz != null) { g.beginPath(); g.rect(0, 0, W, hz); g.clip(); }
  const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
  gr.addColorStop(0, '#FFFBEE'); gr.addColorStop(0.55, '#FFE2A0'); gr.addColorStop(1, D2.amber);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.restore();
}

/* ── the 24-hour dial ── */
const d2_ang = h => Math.PI / 2 + h / 24 * TAU;           // 00 at the bottom, 12 at the top
const d2_pt = (x, y, r, h) => [x + Math.cos(d2_ang(h)) * r, y + Math.sin(d2_ang(h)) * r];
// o.p: draw-on progress of ticks (0..1 from 00), o.bw: bezel width, o.nums: true | 'card'
function d2_dial(g, x, y, R, o = {}) {
  const bw = o.bw || Math.max(22, R * 0.075), p = o.p == null ? 1 : o.p, fa = o.faceA == null ? 1 : o.faceA;
  g.save();
  if (o.face !== false) {
    g.save(); g.shadowColor = 'rgba(2,4,16,0.65)'; g.shadowBlur = 90; g.shadowOffsetY = 30;
    const fg = g.createRadialGradient(x - R * 0.25, y - R * 0.5, R * 0.05, x, y, R);
    fg.addColorStop(0, hexA('#2C3C80', 0.5 * fa)); fg.addColorStop(0.6, hexA('#121A46', 0.62 * fa)); fg.addColorStop(1, hexA('#080C24', 0.82 * fa));
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); g.restore();
  }
  if (o.bezel !== false) {
    const rb = R - bw / 2;
    g.lineWidth = bw;
    g.strokeStyle = 'rgba(5,8,26,0.72)'; g.beginPath(); g.arc(x, y, rb, 0, Math.PI); g.stroke();       // night half 18 → 00 → 06
    g.strokeStyle = hexA(D2.amber, 0.1); g.beginPath(); g.arc(x, y, rb, Math.PI, TAU); g.stroke();    // day half 06 → 12 → 18
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.24)'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(x, y, R - bw, 0, TAU); g.stroke();
  }
  g.lineCap = 'round';
  const n = o.minor === false ? 24 : 96;
  for (let i = 0; i < n; i++) {
    const hh = i * 24 / n, f = clamp((p * 24 - hh) / 1.2 + 1);
    if (f <= 0) continue;
    const major = Math.abs(hh - Math.round(hh)) < 1e-6, card = major && Math.round(hh) % 6 === 0;
    const l = card ? 0.74 : major ? 0.52 : 0.24;
    const [ax, ay] = d2_pt(x, y, R - bw * 0.18, hh), [bx, by] = d2_pt(x, y, R - bw * (0.18 + l), hh);
    g.strokeStyle = card ? hexA(D2.amber, 0.95 * f) : `rgba(246,242,251,${(major ? 0.72 : 0.3) * f})`;
    g.lineWidth = (card ? 3.4 : major ? 2.3 : 1.3) * (o.tickW || 1);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  }
  if (o.nums) {
    for (let hh = 0; hh < 24; hh++) {
      const f = clamp((p * 24 - hh) / 1.2 + 1); if (f <= 0) continue;
      const card = hh % 6 === 0;
      if (o.nums === 'card' && !card) continue;
      const [nx, ny] = d2_pt(x, y, R + (o.numR || 30) + (card ? 4 : 0), hh);
      const S = o.numS || 24;
      g.save(); g.globalAlpha *= f;
      text(g, String(hh).padStart(2, '0'), nx, ny + S * 0.36 * (card ? 1 : 0.74), { f: card ? D2F : D2T, w: card ? 700 : 600, s: card ? S : S * 0.74, a: 'center', c: card ? D2.ink : D2.soft });
      g.restore();
    }
  }
  g.restore();
  return bw;
}
// the hour hand: a bezel pointer with a glowing orb and a conic sweep trail from o.from
function d2_hand(g, x, y, R, h, o = {}) {
  const col = o.col || D2.amber, bw = o.bw || Math.max(22, R * 0.075), rb = R - bw / 2, a = d2_ang(h);
  g.save();
  if (o.from != null && o.from < h) {
    const a0 = d2_ang(o.from), f = (h - o.from) / 24, ta = o.trailA || 0.6;
    const cg = g.createConicGradient(a0, x, y);
    cg.addColorStop(0, hexA(col, 0)); cg.addColorStop(f * 0.97, hexA(col, ta)); cg.addColorStop(f, hexA(col, ta)); cg.addColorStop(Math.min(1, f + 0.001), hexA(col, 0));
    g.strokeStyle = cg; g.lineWidth = bw * (o.trailW || 1); g.lineCap = 'butt';
    g.beginPath(); g.arc(x, y, rb, a0, a); g.stroke();
  }
  if (o.hair) {
    const [hx, hy] = d2_pt(x, y, R - bw, h);
    const hg = g.createLinearGradient(x, y, hx, hy); hg.addColorStop(0, hexA(col, 0)); hg.addColorStop(1, hexA(col, o.hair));
    g.strokeStyle = hg; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(hx, hy); g.stroke();
  }
  const [ax, ay] = d2_pt(x, y, R - bw - (o.len == null ? R * 0.1 : o.len), h), [bx, by] = d2_pt(x, y, R + (o.over == null ? 14 : o.over), h);
  g.shadowColor = col; g.shadowBlur = 22; g.strokeStyle = col; g.lineWidth = o.lw || 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  g.shadowBlur = 0;
  const [ox, oy] = d2_pt(x, y, rb, h), orb = o.orb || bw * 0.42;
  addGlow(g, col, ox, oy, orb * 6, 0.6);
  g.fillStyle = '#FFF9EE'; g.beginPath(); g.arc(ox, oy, orb, 0, TAU); g.fill();
  g.lineWidth = Math.max(2, orb * 0.22); g.strokeStyle = col; g.stroke();
  g.restore();
}

/* ── glass ── */
function d2_card(g, x, y, w, h, r = 26, o = {}) {
  g.save();
  g.shadowColor = 'rgba(2,4,18,0.5)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  rr(g, x, y, w, h, r); g.fillStyle = o.fill || 'rgba(13,19,50,0.66)'; g.fill();
  g.shadowColor = 'transparent';
  const gr = g.createLinearGradient(x, y, x, y + h);
  gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.012)'); gr.addColorStop(1, 'rgba(255,255,255,0.03)');
  g.fillStyle = gr; g.fill();
  const sg = g.createLinearGradient(x, y, x + w * 0.7, y + h);
  sg.addColorStop(0, 'rgba(255,255,255,0.34)'); sg.addColorStop(1, 'rgba(255,255,255,0.07)');
  g.lineWidth = 1.5; g.strokeStyle = o.stroke || sg; g.stroke();
  g.restore();
}
function d2_disc(g, x, y, r, o = {}) {
  g.save();
  g.shadowColor = 'rgba(2,4,18,0.6)'; g.shadowBlur = o.blur || 50; g.shadowOffsetY = 18;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = o.fill || 'rgba(11,16,44,0.8)'; g.fill();
  g.shadowColor = 'transparent';
  const gr = g.createLinearGradient(x, y - r, x, y + r);
  gr.addColorStop(0, 'rgba(255,255,255,0.1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.025)');
  g.fillStyle = gr; g.fill();
  const sg = g.createLinearGradient(x - r, y - r, x + r, y + r);
  sg.addColorStop(0, 'rgba(255,255,255,0.4)'); sg.addColorStop(1, 'rgba(255,255,255,0.06)');
  g.lineWidth = o.lw || 1.6; g.strokeStyle = o.stroke || sg; g.stroke();
  g.restore();
}
// the film's clock in the top-right corner
function d2_stamp(g, hhmm, k, label = 'İstanbul') {
  const f = { f: D2F, w: 700, s: 30, ls: 0 }, tw = measure(g, hhmm, f), lw = d2_tw(g, label, 20);
  const w = 26 + 28 + 16 + tw + 16 + lw + 28, h = 60, x = W - 64 - w, y = 46;
  rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(8,12,34,0.5)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; g.stroke();
  const ix = x + 26 + 14, iy = y + h / 2;
  if (k < 0.7) d2_moon(g, ix, iy, 13, 0.5); else d2_sunIcon(g, ix, iy, 13);
  text(g, hhmm, ix + 30, iy + 11, { ...f, a: 'left', c: D2.ink });
  d2_t(g, label, ix + 30 + tw + 16, iy + 7, 20, D2.soft);
}
// bend a random walk so it ends exactly at `target`
function d2_shape(s, target) { const n = s.length, e = s[n - 1]; return s.map((v, i) => v * Math.pow(target / e, i / (n - 1))); }

/* ── scene 1 props: app windows floating in the dark ── */
function d2_float(g, T, sx, sy, z, rot, o = {}) {
  const k = FOCAL / (FOCAL + z);
  const pose = { x: CX + (sx - CX) / k, y: CY + (sy - CY) / k, z, rx: rot[0], ry: rot[1], rz: rot[2], s: 1 };
  const L = canvas(W, H), lx = L.getContext('2d');
  quadShadow(lx, projector(pose), T.w, T.h, 0.65, 70, 34, 30);
  plane3d(lx, T.c, T.w, T.h, pose, 12, 10);
  g.save(); g.globalAlpha *= o.a == null ? 1 : o.a;
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  g.drawImage(L, 0, 0); g.restore();
}
function d2_texPhone() {
  const w = 330, h = 660, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 52); x.fillStyle = '#20284F'; x.fill();
  rr(x, 7, 7, w - 14, h - 14, 46);
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#131A3E'); gr.addColorStop(1, '#0A0F27'); x.fillStyle = gr; x.fill();
  rr(x, w / 2 - 46, 20, 92, 28, 14); x.fillStyle = '#04060F'; x.fill();
  d2_t(x, '03:00', 38, 42, 16, D2.ink, { w: 700 });
  d2_h(x, 'Aracı kurum', 28, 104, 25, D2.ink);
  d2_t(x, 'Hisse hesabı · USD', 28, 130, 15, D2.soft, { w: 500 });
  x.fillStyle = hexA(D2.teal, 0.18); x.beginPath(); x.arc(w - 46, 96, 18, 0, TAU); x.fill();
  d2_t(x, '₺4.218.640', 28, 182, 34, D2.ink, { w: 800 });
  d2_t(x, '+%0,42 bugün', 28, 208, 15, D2.teal, { w: 700 });
  const s = d2_shape(walk(41, 40, 0.002, 0.016), 1.08), lo = Math.min(...s), hi = Math.max(...s);
  const pts = s.map((v, i) => [26 + i / 39 * (w - 52), 310 - (v - lo) / (hi - lo) * 80]);
  const ag = x.createLinearGradient(0, 230, 0, 312); ag.addColorStop(0, hexA(D2.teal, 0.3)); ag.addColorStop(1, hexA(D2.teal, 0));
  x.beginPath(); smoothPath(x, pts); x.lineTo(w - 26, 312); x.lineTo(26, 312); x.closePath(); x.fillStyle = ag; x.fill();
  x.beginPath(); smoothPath(x, pts); x.strokeStyle = D2.teal; x.lineWidth = 2.5; x.stroke();
  [['AAPL', 'Apple', '₺1.402.180', '+%1,24'], ['MSFT', 'Microsoft', '₺986.410', '−%0,38'], ['VOO', 'Vanguard S&P 500', '₺2.058.904', '+%0,58'], ['KO', 'Coca-Cola', '₺412.300', '+%0,12']].forEach(([t, n, v, c], i) => {
    const y = 360 + i * 62;
    x.fillStyle = 'rgba(255,255,255,0.07)'; x.fillRect(26, y - 30, w - 52, 1);
    d2_h(x, t, 28, y + 2, 18, D2.ink);
    d2_t(x, n, 28, y + 22, 13, D2.soft, { w: 500 });
    d2_t(x, v, w - 28, y + 2, 16, D2.ink, { w: 700, a: 'right' });
    d2_t(x, c, w - 28, y + 22, 13, c[0] === '−' ? D2.coral : D2.teal, { w: 700, a: 'right' });
  });
  rr(x, w / 2 - 60, h - 26, 120, 5, 3); x.fillStyle = 'rgba(255,255,255,0.4)'; x.fill();
  const sh = x.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)');
  rr(x, 0, 0, w, h, 52); x.fillStyle = sh; x.fill();
  return T;
}
function d2_texCrypto() {
  const w = 640, h = 420, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 20); x.fillStyle = '#0F1536'; x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.16)'; x.lineWidth = 1.5; x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(0, 0, w, 44);
  [D2.coral, D2.amber, D2.teal].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(24 + i * 20, 22, 6, 0, TAU); x.fill(); });
  d2_t(x, 'Kripto borsası', w / 2, 28, 16, D2.soft, { w: 700, a: 'center' });
  d2_h(x, 'BTC / USDT', 28, 92, 22, D2.ink);
  d2_t(x, '67.412,50', 28, 142, 40, D2.ink, { w: 800 });
  d2_t(x, '−%3,18 · 24 sa', 30, 168, 16, D2.coral, { w: 700 });
  d2_t(x, 'Bakiye', w - 28, 86, 15, D2.soft, { w: 500, a: 'right' });
  d2_t(x, '0,4821 BTC', w - 28, 112, 20, D2.ink, { w: 700, a: 'right' });
  const r = mulberry32(19); let v = 0.62;
  x.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(28, 200 + k * 60); x.lineTo(w - 28, 200 + k * 60); x.stroke(); }
  const n = 36, bw = (w - 56) / n;
  for (let i = 0; i < n; i++) {
    const o = v; v = clamp(v - 0.006 + (r() - 0.5) * 0.12, 0.1, 0.92);
    const hi = Math.max(o, v) + r() * 0.05, lo = Math.min(o, v) - r() * 0.05, up = v >= o, cx = 28 + i * bw + bw / 2;
    const Y = q => 392 - q * 190;
    x.fillStyle = up ? D2.teal : D2.coral;
    x.fillRect(cx - 1, Y(hi), 2, Y(lo) - Y(hi));
    x.fillRect(cx - bw * 0.32, Y(Math.max(o, v)), bw * 0.64, Math.max(2, Math.abs(Y(o) - Y(v))));
  }
  x.setLineDash([5, 5]); x.strokeStyle = hexA(D2.coral, 0.6); x.beginPath(); x.moveTo(28, 392 - v * 190); x.lineTo(w - 28, 392 - v * 190); x.stroke(); x.setLineDash([]);
  return T;
}
function d2_texSheet() {
  const w = 600, h = 380, T = makeTex(w, h, 2), x = texBegin(T);
  rr(x, 0, 0, w, h, 14); x.fillStyle = '#ECEAF6'; x.fill();
  x.save(); rr(x, 0, 0, w, h, 14); x.clip();
  x.fillStyle = D2.navy; x.fillRect(0, 0, w, 40);
  d2_t(x, 'portföy_SON_v7.xlsx', 20, 26, 16, '#FFFFFF', { w: 700 });
  x.fillStyle = '#DCD9EC'; x.fillRect(0, 40, w, 32);
  d2_t(x, 'fx', 18, 62, 15, '#5A5F8A', { w: 700 });
  d2_t(x, '=DÜŞEYARA(B4;Kurlar!A:C;3;0)', 52, 62, 15, '#3A3F66', { w: 600 });
  const cols = [44, 112, 112, 112, 112, 108], rows = ['', 'Varlık|Adet|Maliyet|Kur|Değer', 'AAPL|40|172,10|32,41|223.115', 'BTC|0,48|#YOK|#YOK|#YOK', 'VOO|25|402,55|34,02|#BAŞV!', 'ETH|3,2|2.410|?|—', 'Altın|?|||', 'TOPLAM||||#BAŞV!'];
  const y0 = 72, rh = 38;
  x.fillStyle = '#E2DFF0'; x.fillRect(0, y0, w, 26); x.fillRect(0, y0, cols[0], h);
  'ABCDE'.split('').forEach((c, i) => d2_t(x, c, cols[0] + i * 112 + 56, y0 + 19, 14, '#6A6E96', { a: 'center', w: 700 }));
  rows.slice(1).forEach((rw, j) => {
    const y = y0 + 26 + j * rh;
    d2_t(x, String(j + 1), cols[0] / 2, y + 25, 14, '#6A6E96', { a: 'center', w: 700 });
    rw.split('|').forEach((c, i) => {
      const cx = cols[0] + i * 112, err = c[0] === '#';
      if (err) { x.fillStyle = hexA(D2.coral, 0.2); x.fillRect(cx, y, 112, rh); }
      if (c) d2_t(x, c, cx + 10, y + 25, 15, err ? '#D2462A' : j === 0 ? '#24346E' : '#2A2F55', { w: j === 0 || err ? 800 : 600 });
    });
  });
  x.strokeStyle = 'rgba(40,46,90,0.14)'; x.lineWidth = 1;
  for (let i = 0; i <= 5; i++) { const cx = cols[0] + i * 112; x.beginPath(); x.moveTo(cx, y0); x.lineTo(cx, h); x.stroke(); }
  for (let j = 0; j <= 8; j++) { const y = y0 + 26 + j * rh; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
  x.strokeStyle = D2.teal; x.lineWidth = 3; x.strokeRect(cols[0] + 4 * 112, y0 + 26 + 3 * rh, 112, rh);
  x.restore();
  return T;
}

/* ── init: stars and the Monte Carlo paths ── */
function d2_init() {
  const r = mulberry32(2724), st = [];
  for (let i = 0; i < 320; i++) {
    const l = r() < 0.62 ? 0 : r() < 0.72 ? 1 : 2;
    st.push({ x: r() * W, y: Math.pow(r(), 1.3) * H, r: [0.9, 1.45, 2.1][l] * (0.75 + r() * 0.5), a: 0.3 + r() * 0.7, l, sp: l === 2 && r() < 0.45 });
  }
  D2_ST.stars = st;
  const m = mulberry32(1724), n = 420, steps = 120, mu = 0.07 / 12, sg = 0.15 / Math.sqrt(12), paths = [];
  for (let i = 0; i < n; i++) { const p = [0]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] + mu - sg * sg / 2 + sg * gauss(m)); paths.push(p); }
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const c = paths.map(p => p[k]).sort((a, b) => a - b); return c[Math.floor(q * (n - 1))]; });
  D2_ST.mc = { paths, steps, p5: pct(0.05), p50: pct(0.5), p95: pct(0.95) };
}

/* ── scenes ── */
const D2_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Gece 03:00',
    desc: 'Gece 03:00. Aracı kurum, kripto borsası ve tablo pencereleri farklı derinliklerde süzülür; yıldızlar yavaşça kayar, başlık iki satırda yerleşir.',
    draw(g) {
      d2_sky(g, 0, { px: -30 });
      // far bokeh windows
      g.save(); g.filter = 'blur(10px)';
      [[1560, 92, 150, 96, D2.lilac], [60, 640, 120, 80, D2.coral], [960, 96, 120, 74, D2.teal], [1270, 1010, 160, 90, D2.peri]].forEach(([x, y, w, h, c]) => {
        rr(g, x - w / 2, y - h / 2, w, h, 12); g.fillStyle = hexA(c, 0.18); g.fill();
      });
      g.restore();
      d2_moon(g, 1800, 118, 40, 1);
      // a bank notification, slightly out of focus
      g.save(); g.filter = 'blur(1.2px)'; g.translate(250, 405); g.rotate(-0.07);
      d2_card(g, -150, -46, 300, 92, 22, { fill: 'rgba(16,22,56,0.85)' });
      g.fillStyle = hexA(D2.peri, 0.25); rr(g, -132, -26, 52, 52, 14); g.fill();
      d2_t(g, '₺', -106, 12, 28, D2.peri, { w: 800, a: 'center' });
      d2_t(g, 'Banka · vadeli hesap', -64, -6, 17, D2.soft, { w: 600 });
      d2_t(g, '₺412.000', -64, 24, 24, D2.ink, { w: 800 });
      g.restore();
      addGlow(g, '#B9B4FF', 690, 330, 440, 0.1);
      addGlow(g, D2.coral, 1150, 330, 540, 0.09);
      addGlow(g, D2.teal, 1600, 600, 600, 0.12);
      d2_float(g, d2_texSheet(), 690, 330, 560, [0.1, 0.34, -0.05], { blur: 1.6, a: 0.9 });
      d2_float(g, d2_texCrypto(), 1150, 338, 200, [0.08, -0.26, 0.035], { blur: 0.7 });
      d2_float(g, d2_texPhone(), 1604, 560, -130, [0.05, -0.42, 0.07]);
      d2_pill(g, 470, 548, 'Son güncelleme: 12 gün önce', { s: 20, dot: D2.coral, fill: 'rgba(10,14,38,0.85)' });
      // legibility shade under the headline
      const sh = g.createLinearGradient(0, 600, 0, H); sh.addColorStop(0, 'rgba(3,5,18,0)'); sh.addColorStop(1, 'rgba(3,5,18,0.8)');
      g.fillStyle = sh; g.fillRect(0, 600, W, H - 600);
      // the small clock
      d2_dial(g, 160, 128, 60, { bw: 13, minor: false, tickW: 0.8 });
      d2_hand(g, 160, 128, 60, 3, { bw: 13, len: 18, lw: 3, orb: 5.5, over: 7 });
      text(g, '03:00', 246, 150, { f: D2F, w: 800, s: 66, a: 'left', c: D2.ink, ls: -1 });
      d2_t(g, 'İstanbul · gece', 250, 188, 22, D2.soft);
      // headline
      d2_kick(g, 'Piyasalar hiç uyumaz', 114, 712, D2.amber);
      d2_h(g, 'Kripto 7/24 açık.', 106, 822, 100, D2.ink, { w: 800 });
      d2_grad(g, 'Hesapların dağınık.', 106, 940, 100);
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Kadran kurulur',
    desc: 'Pencereler ışık izlerine dönüşüp merkeze çekilir; 24 saatlik kadran çizgi çizgi tamamlanır, ibre 03:30\'a süpürür. Ortada vaat ve Kripto724.',
    draw(g) {
      d2_sky(g, 0.08, { px: -70 });
      d2_stamp(g, '03:30', 0.08);
      const x = CX, y = 548, R = 400;
      // the scattered windows of scene 1, pulled into the dial as light
      const r = mulberry32(42);
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (let i = 0; i < 54; i++) {
        const a = r() * TAU, d0 = R + 80 + r() * 560, len = 60 + r() * 220, c = [D2.teal, D2.coral, D2.lilac, D2.amber][i % 4];
        const x0 = x + Math.cos(a) * d0, y0 = y + Math.sin(a) * d0, x1 = x + Math.cos(a) * (d0 - len), y1 = y + Math.sin(a) * (d0 - len);
        const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, hexA(c, 0)); gr.addColorStop(1, hexA(c, 0.55));
        g.strokeStyle = gr; g.lineWidth = 1.2 + r() * 2.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
      g.restore();
      [[250, 300, 300, 190, D2.lilac, -0.05], [1700, 640, 170, 330, D2.teal, 0.1], [300, 850, 300, 196, D2.coral, 0.05]].forEach(([gx, gy, w, h, c, rot]) => {
        const dx = x - gx, dy = y - gy, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let k = -3; k <= 3; k++) {
          const ox = gx - uy * k * h * 0.12, oy = gy + ux * k * h * 0.12;
          const sg = g.createLinearGradient(ox, oy, ox + ux * 260, oy + uy * 260); sg.addColorStop(0, hexA(c, 0.28)); sg.addColorStop(1, hexA(c, 0));
          g.strokeStyle = sg; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + ux * 260, oy + uy * 260); g.stroke();
        }
        g.restore();
        g.save(); g.translate(gx, gy); g.rotate(rot);
        rr(g, -w / 2, -h / 2, w, h, 18); g.fillStyle = hexA(c, 0.07); g.fill(); g.strokeStyle = hexA(c, 0.4); g.lineWidth = 1.5; g.stroke();
        g.fillStyle = hexA(c, 0.25); g.fillRect(-w / 2 + 18, -h / 2 + 22, w * 0.4, 6); g.fillRect(-w / 2 + 18, -h / 2 + 40, w * 0.25, 6);
        g.restore();
      });
      d2_dial(g, x, y, R, { nums: true, p: 0.93, numS: 26, numR: 34 });
      d2_hand(g, x, y, R, 3.5, { from: 2.1 });
      const [fx, fy] = d2_pt(x, y, R - 15, 0.93 * 24);
      addGlow(g, D2.amber, fx, fy, 80, 0.7); sparkle(g, fx, fy, 16, '#FFF6E0');
      d2_kick(g, 'Tek görünüm', x, y - 196, D2.teal, { a: 'center' });
      d2_h(g, 'Tüm yatırımların,', x, y - 98, 60, D2.ink, { a: 'center', w: 700 });
      d2_grad(g, 'tek ekranda.', x, y + 10, 94, { a: 'center' });
      g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(x - 110, y + 62, 220, 1.5);
      wordmark(g, x, y + 150, 64, null, { f: D2F, w: 800, grad: D2_DAWN });
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Kadranda portföy',
    desc: 'Kadranın halkası varlık dağılımına dönüşür, ortada toplam değer döner. Cam kartta portföy çizgisi S&P 500\'ü geçerek çizilir, varlıklar sıralanır.',
    draw(g) {
      d2_sky(g, 0.18, { px: -110 });
      d2_stamp(g, '04:00', 0.18);
      d2_h(g, 'Portföyünün tamamı, bir bakışta.', 108, 146, 56, D2.ink, { w: 700 });
      d2_t(g, 'Son senkron: bu gece 03:00  ·  Baz para birimi: TRY', 112, 196, 23, D2.soft, { w: 500 });
      // allocation dial
      const x = 590, y = 588, R = 272, bw = 42;
      d2_dial(g, x, y, R + 32, { bw: 16, bezel: false, face: false, nums: 'card', numR: 26, numS: 22 });
      g.save(); g.shadowColor = 'rgba(2,4,16,0.7)'; g.shadowBlur = 80; g.shadowOffsetY = 30;
      const fg = g.createRadialGradient(x - 70, y - 140, 10, x, y, R);
      fg.addColorStop(0, 'rgba(44,60,128,0.55)'); fg.addColorStop(1, 'rgba(8,12,36,0.85)');
      g.fillStyle = fg; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); g.restore();
      const segs = [['Hisse', 44, D2.teal], ['ETF', 22, D2.peri], ['Kripto', 12, D2.amber], ['Tahvil', 10, D2.coral], ['Gayrimenkul', 7, D2.lilac], ['Nakit', 5, D2.ink]];
      let acc = 0;
      segs.forEach(([l, v, c]) => {
        const a0 = -Math.PI / 2 + acc / 100 * TAU + 0.02, a1 = -Math.PI / 2 + (acc + v) / 100 * TAU - 0.02, am = (a0 + a1) / 2;
        g.save(); g.shadowColor = c; g.shadowBlur = 18;
        g.strokeStyle = c; g.lineWidth = bw; g.beginPath(); g.arc(x, y, R - bw / 2 - 2, a0, a1); g.stroke(); g.restore();
        const rm = R - bw / 2 - 2;
        text(g, '%' + v, x + Math.cos(am) * rm, y + Math.sin(am) * rm + 7, { f: D2T, w: 800, s: 19, a: 'center', c: '#0B1026' });
        acc += v;
      });
      d2_hand(g, x, y, R + 32, 4, { bw: 16, from: 3.1, len: 2, over: 8, lw: 3.5, orb: 8, trailA: 0.7 });
      d2_kick(g, 'Toplam değer', x, y - 70, D2.soft, { a: 'center', s: 19 });
      d2_t(g, '₺9.482.150,36', x, y + 4, 60, D2.ink, { w: 800, a: 'center', max: 420 });
      d2_t(g, '+₺64.218,40  ·  +%0,68', x, y + 52, 25, D2.teal, { w: 700, a: 'center' });
      d2_t(g, 'bugün', x, y + 86, 20, D2.soft, { w: 500, a: 'center' });
      segs.forEach(([l, v, c], i) => {
        const lx = 150 + (i % 3) * 230, ly = 984 + Math.floor(i / 3) * 44;
        g.fillStyle = c; g.beginPath(); g.arc(lx, ly - 7, 7, 0, TAU); g.fill();
        d2_t(g, l, lx + 18, ly, 21, D2.ink, { w: 600 });
        d2_t(g, '%' + v, lx + 18 + d2_tw(g, l, 21) + 10, ly, 21, D2.soft, { w: 700 });
      });
      // performance card
      const X0 = 1010, X1 = 1830;
      d2_card(g, X0, 248, X1 - X0, 418);
      d2_h(g, 'Performans', X0 + 40, 306, 30, D2.ink);
      ['1A', '6A', '1Y', '5Y'].forEach((s, i) => {
        const bx = X1 - 40 - (4 - i) * 66;
        if (s === '1Y') { rr(g, bx, 280, 58, 36, 18); g.fillStyle = hexA(D2.amber, 0.95); g.fill(); }
        d2_t(g, s, bx + 29, 305, 18, s === '1Y' ? D2.night : D2.soft, { w: 800, a: 'center' });
      });
      g.fillStyle = D2.teal; g.beginPath(); g.arc(X0 + 48, 344, 6, 0, TAU); g.fill();
      d2_t(g, 'Portföy  +%18,4', X0 + 64, 351, 21, D2.ink, { w: 700 });
      g.strokeStyle = D2.peri; g.lineWidth = 3; g.setLineDash([7, 6]); g.beginPath(); g.moveTo(X0 + 290, 344); g.lineTo(X0 + 322, 344); g.stroke(); g.setLineDash([]);
      d2_t(g, 'S&P 500 (SPY)  +%12,1', X0 + 334, 351, 21, D2.soft, { w: 700 });
      const cx0 = X0 + 40, cx1 = X1 - 40, cy0 = 392, cy1 = 598;
      const you = d2_shape(walk(902, 90, 0.002, 0.011), 1.184), spy = d2_shape(walk(337, 90, 0.0012, 0.0085), 1.121);
      const all = you.concat(spy), lo = Math.min(...all) - 0.01, hi = Math.max(...all) + 0.01;
      const map = s => s.map((v, i) => [lerp(cx0, cx1, i / (s.length - 1)), cy1 - (v - lo) / (hi - lo) * (cy1 - cy0)]);
      g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
      for (let k = 0; k < 4; k++) { const yy = lerp(cy0, cy1, k / 3); g.beginPath(); g.moveTo(cx0, yy); g.lineTo(cx1, yy); g.stroke(); }
      const P = map(you), S = map(spy);
      const ag = g.createLinearGradient(0, cy0, 0, cy1); ag.addColorStop(0, hexA(D2.teal, 0.3)); ag.addColorStop(1, hexA(D2.teal, 0));
      g.beginPath(); smoothPath(g, P); g.lineTo(cx1, cy1); g.lineTo(cx0, cy1); g.closePath(); g.fillStyle = ag; g.fill();
      g.strokeStyle = D2.peri; g.lineWidth = 2.5; g.setLineDash([8, 7]); g.beginPath(); smoothPath(g, S); g.stroke(); g.setLineDash([]);
      g.save(); g.shadowColor = D2.teal; g.shadowBlur = 16; g.strokeStyle = D2.teal; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); smoothPath(g, P); g.stroke(); g.restore();
      const e = P[P.length - 1]; addGlow(g, D2.teal, e[0], e[1], 50, 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(e[0], e[1], 6, 0, TAU); g.fill();
      ['Kas', 'Oca', 'Mar', 'May', 'Tem', 'Eyl', 'Eki'].forEach((m, i) => d2_t(g, m, lerp(cx0 + 10, cx1 - 10, i / 6), 636, 18, D2.dim, { w: 600, a: 'center' }));
      // holdings card
      d2_card(g, X0, 690, X1 - X0, 318);
      d2_h(g, 'Varlıklar', X0 + 40, 744, 26, D2.ink);
      d2_t(g, '8 varlık sınıfı · 42 varlık', X1 - 40, 742, 19, D2.soft, { w: 500, a: 'right' });
      [['VOO', 'Vanguard S&P 500', 'ETF', '₺2.058.904', '+%0,58', D2.peri], ['AAPL', 'Apple', 'Hisse', '₺1.402.180', '+%1,24', D2.teal], ['BTC', 'Bitcoin', 'Kripto', '₺778.415', '−%2,10', D2.amber]].forEach(([t, n, cl, v, ch, c], i) => {
        const yy = 812 + i * 64;
        g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(X0 + 40, yy - 40, X1 - X0 - 80, 1);
        g.fillStyle = hexA(c, 0.16); g.beginPath(); g.arc(X0 + 62, yy - 8, 20, 0, TAU); g.fill();
        g.fillStyle = c; g.beginPath(); g.arc(X0 + 62, yy - 8, 6, 0, TAU); g.fill();
        d2_h(g, t, X0 + 100, yy, 23, D2.ink);
        d2_t(g, n, X0 + 100 + d2_tw(g, t, 23, { f: D2F, w: 700 }) + 14, yy, 19, D2.soft, { w: 500 });
        d2_pill(g, X0 + 392, yy - 8, cl, { s: 16, h: 30, padX: 14, c, fill: hexA(c, 0.1), stroke: hexA(c, 0.35) });
        d2_t(g, v, X1 - 170, yy, 23, D2.ink, { w: 700, a: 'right' });
        d2_t(g, ch, X1 - 40, yy, 21, ch[0] === '−' ? D2.coral : D2.teal, { w: 700, a: 'right' });
      });
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her saat dilimi',
    desc: 'Kadranın çevresinde borsa saatleri yörüngeye oturur, her biri kendi açılışını gösterir. Varlık çipleri tek tek yanar; dış halkada kripto hiç durmaz.',
    draw(g) {
      d2_sky(g, 0.3, { px: -150 });
      d2_stamp(g, '04:30', 0.3);
      d2_kick(g, '8 varlık sınıfı · 60+ piyasa', 112, 168, D2.teal);
      d2_h(g, 'Her varlık,', 106, 258, 84, D2.ink, { w: 800 });
      d2_grad(g, 'her piyasa.', 106, 350, 84);
      const chips = [['Hisse senedi', D2.teal], ['ETF', D2.peri], ['Tahvil', D2.coral], ['Opsiyon', D2.lilac], ['Kripto', D2.amber], ['Gayrimenkul', D2.teal], ['Yatırım fonu', D2.peri], ['Nakit', D2.ink]];
      chips.forEach(([s, c], i) => {
        const cx = 110 + (i % 2) * 302, cy = 456 + Math.floor(i / 2) * 70;
        rr(g, cx, cy - 27, 284, 54, 27); g.fillStyle = 'rgba(12,18,48,0.9)'; g.fill();
        g.strokeStyle = hexA(c, 0.42); g.lineWidth = 1.5; g.stroke();
        addGlow(g, c, cx + 30, cy, 26, 0.5);
        g.fillStyle = c; g.beginPath(); g.arc(cx + 30, cy, 7, 0, TAU); g.fill();
        d2_t(g, s, cx + 52, cy + 8, 22, D2.ink, { w: 700 });
      });
      d2_card(g, 110, 760, 586, 132, 24);
      ['₺', '$', '€', '£', '¥'].forEach((s, i) => {
        const bx = 160 + i * 34;
        g.fillStyle = ['#1C2A5E', '#21306A', '#263674', '#2B3C7E', '#304288'][i]; g.beginPath(); g.arc(bx, 826, 26, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 1.5; g.stroke();
        d2_t(g, s, bx, 835, 24, i === 0 ? D2.amber : D2.ink, { w: 800, a: 'center' });
      });
      d2_t(g, 'Her işlem, kendi', 344, 816, 23, D2.ink, { w: 700 });
      d2_t(g, 'tarihindeki kurla çevrilir.', 344, 848, 23, D2.ink, { w: 700 });
      d2_t(g, '50+ para birimi', 344, 876, 18, D2.soft, { w: 600 });
      // world clocks orbiting the 24-hour dial (İstanbul time on the dial)
      const x = 1330, y = 578, R = 214, Ro = 398;
      // crypto never stops: the orbit itself
      g.save(); g.strokeStyle = hexA(D2.teal, 0.35); g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, Ro, 0, TAU); g.stroke(); g.restore();
      const ca = 0.6 * Math.PI / 2 + 0.25, cg = g.createConicGradient(ca - 1.4, x, y);
      cg.addColorStop(0, hexA(D2.teal, 0)); cg.addColorStop(1.4 / TAU, hexA(D2.teal, 0.95)); cg.addColorStop(1.4 / TAU + 0.001, hexA(D2.teal, 0));
      g.strokeStyle = cg; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, Ro, ca - 1.4, ca); g.stroke();
      addGlow(g, D2.teal, x + Math.cos(ca) * Ro, y + Math.sin(ca) * Ro, 60, 0.9);
      g.fillStyle = '#E9FFFB'; g.beginPath(); g.arc(x + Math.cos(ca) * Ro, y + Math.sin(ca) * Ro, 6, 0, TAU); g.fill();
      d2_pill(g, x + Math.cos(0.95) * Ro, y + Math.sin(0.95) * Ro + 4, 'Kripto · 7/24 açık', { a: 'center', s: 20, c: D2.teal, dot: D2.teal, fill: 'rgba(8,24,40,0.9)', stroke: hexA(D2.teal, 0.5) });
      d2_dial(g, x, y, R, { nums: 'card', numR: 24, numS: 22, bw: 22 });
      const cities = [['Tokyo', 9, 0, 3, 128], ['Hong Kong', 9, 30, 4.5, 168], ['İstanbul', 10, 0, 10, 218], ['Londra', 8, 0, 11, 258], ['Frankfurt', 9, 0, 11, 298], ['New York', 9, 30, 17.5, 352]];
      cities.forEach(([nm, hh, mm, tr, deg]) => {
        const a = deg * Math.PI / 180, mx = x + Math.cos(a) * Ro, my = y + Math.sin(a) * Ro;
        const [dx, dy] = d2_pt(x, y, R - 11, tr);
        g.save(); g.setLineDash([4, 6]); g.strokeStyle = hexA(D2.lilac, 0.45); g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(mx - Math.cos(a) * 58, my - Math.sin(a) * 58); g.lineTo(dx, dy); g.stroke(); g.restore();
        addGlow(g, D2.amber, dx, dy, 26, 0.6); g.fillStyle = D2.amber; g.beginPath(); g.arc(dx, dy, 5, 0, TAU); g.fill();
        d2_disc(g, mx, my, 54);
        for (let i = 0; i < 12; i++) {
          const ta = i / 12 * TAU, l = i % 3 ? 5 : 10;
          g.strokeStyle = i % 3 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)'; g.lineWidth = i % 3 ? 1.4 : 2.4;
          g.beginPath(); g.moveTo(mx + Math.cos(ta) * 46, my + Math.sin(ta) * 46); g.lineTo(mx + Math.cos(ta) * (46 - l), my + Math.sin(ta) * (46 - l)); g.stroke();
        }
        const ha = ((hh % 12) + mm / 60) / 12 * TAU - Math.PI / 2, ma = mm / 60 * TAU - Math.PI / 2;
        g.lineCap = 'round';
        g.strokeStyle = D2.ink; g.lineWidth = 4.5; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.cos(ha) * 24, my + Math.sin(ha) * 24); g.stroke();
        g.strokeStyle = D2.amber; g.lineWidth = 2.5; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.cos(ma) * 36, my + Math.sin(ma) * 36); g.stroke();
        g.fillStyle = D2.amber; g.beginPath(); g.arc(mx, my, 4.5, 0, TAU); g.fill();
        const up = Math.sin(a) < -0.3, ly = up ? my - 96 : my + 86;
        d2_h(g, nm, mx, ly, 22, D2.ink, { a: 'center', w: 600, ls: 0 });
        d2_t(g, `açılış ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, mx, ly + 27, 19, D2.amber, { w: 700, a: 'center' });
      });
      d2_hand(g, x, y, R, 4.5, { bw: 22, from: 3.6, len: 10, lw: 4, orb: 9 });
      d2_h(g, '60+', x, y + 18, 100, D2.ink, { w: 800, a: 'center' });
      d2_t(g, 'piyasa', x, y + 58, 24, D2.soft, { w: 600, a: 'center' });
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x - 60, y + 80, 120, 1.5);
      d2_t(g, '50+ para birimi', x, y + 118, 24, D2.amber, { w: 800, a: 'center' });
    },
  },
  {
    time: '17–21 sn', title: 'Gece senkronu',
    desc: 'Ay yükselir; aracı kurumlar takımyıldız gibi parlar, ışık hatları kadranda 03:00 noktasında birleşir. İbre sabaha ilerlerken "tüm hesaplar güncel" yanar.',
    draw(g) {
      d2_sky(g, 0.42, { px: -190 });
      d2_stamp(g, '05:00', 0.42);
      d2_moon(g, 1716, 226, 46, 1.2);
      d2_kick(g, 'Gece senkronu', 112, 164, D2.teal);
      d2_h(g, 'Sen uyurken,', 106, 254, 68, D2.ink, { w: 800 });
      d2_h(g, 'hesapların her gece', 106, 334, 68, D2.ink, { w: 800, max: 860 });
      d2_grad(g, 'senkronlanır.', 106, 414, 68);
      const x = 1420, y = 592, R = 282, bw = 24;
      const node = d2_pt(x, y, R - bw / 2, 3);
      const stars = [['Interactive Brokers', 210, 548], ['Charles Schwab', 540, 520], ['Fidelity', 860, 566], ['Robinhood', 330, 668], ['Trading 212', 650, 650], ['DEGIRO', 930, 712],
        ['eToro', 170, 820], ['Coinbase', 450, 792], ['Wealthsimple', 730, 842], ['Public', 980, 912]];
      // constellation lines
      g.save(); g.strokeStyle = hexA(D2.lilac, 0.3); g.lineWidth = 1.3; g.setLineDash([2, 6]);
      [[0, 3], [3, 1], [1, 4], [4, 2], [3, 6], [6, 7], [7, 4], [7, 8], [8, 5], [5, 2], [8, 9]].forEach(([a, b]) => {
        g.beginPath(); g.moveTo(stars[a][1], stars[a][2]); g.lineTo(stars[b][1], stars[b][2]); g.stroke();
      });
      g.restore();
      // beams into 03:00
      g.save(); g.globalCompositeOperation = 'lighter';
      stars.forEach(([nm, sx, sy], i) => {
        const mx = (sx + node[0]) / 2, my = Math.min(sy, node[1]) - 60 - (i % 3) * 30;
        const gr = g.createLinearGradient(sx, sy, node[0], node[1]); gr.addColorStop(0, hexA(D2.teal, 0.05)); gr.addColorStop(1, hexA(D2.teal, 0.55));
        g.strokeStyle = gr; g.lineWidth = 1.8; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, node[0], node[1]); g.stroke();
        const t = 0.45 + (i * 0.137) % 0.45, u = 1 - t;
        const px = u * u * sx + 2 * u * t * mx + t * t * node[0], py = u * u * sy + 2 * u * t * my + t * t * node[1];
        addGlow(g, D2.teal, px, py, 22, 0.8);
      });
      g.restore();
      stars.forEach(([nm, sx, sy], i) => {
        addGlow(g, '#DCE2FF', sx, sy, 40, 0.55);
        sparkle(g, sx, sy, i % 3 === 0 ? 13 : 10, '#FFFFFF');
        g.save(); g.shadowColor = 'rgba(4,6,22,0.95)'; g.shadowBlur = 10;
        d2_t(g, nm, sx, sy + 38, 21, D2.ink, { w: 600, a: 'center' }); d2_t(g, nm, sx, sy + 38, 21, D2.ink, { w: 600, a: 'center' });
        g.restore();
      });
      d2_dial(g, x, y, R, { nums: 'card', numR: 30, numS: 24, bw });
      // the night window 00–06 on the bezel
      g.save(); g.strokeStyle = hexA(D2.lilac, 0.22); g.lineWidth = bw; g.beginPath(); g.arc(x, y, R - bw / 2, d2_ang(0), d2_ang(6)); g.stroke(); g.restore();
      d2_hand(g, x, y, R, 5, { bw, from: 3, len: 12, trailA: 0.75 });
      [46, 30, 18].forEach((r, i) => { g.strokeStyle = hexA(D2.teal, [0.18, 0.35, 0.7][i]); g.lineWidth = 2; g.beginPath(); g.arc(node[0], node[1], r, 0, TAU); g.stroke(); });
      addGlow(g, D2.teal, node[0], node[1], 90, 0.9);
      g.fillStyle = '#E9FFFB'; g.beginPath(); g.arc(node[0], node[1], 8, 0, TAU); g.fill();
      d2_kick(g, 'Son senkron', x, y - 86, D2.soft, { a: 'center', s: 19 });
      d2_h(g, '03:00', x, y + 24, 104, D2.ink, { w: 800, a: 'center', ls: -2 });
      const lab = 'Tüm hesaplar güncel', lw = d2_tw(g, lab, 24, { w: 700 });
      check(g, x - lw / 2 - 10, y + 72, 20, D2.teal, 4);
      d2_t(g, lab, x - lw / 2 + 16, y + 80, 24, D2.teal, { w: 700 });
      const facts = ['25+ aracı kurum', 'salt-okunur', 'her gece senkron'];
      const ws = facts.map(s => d2_tw(g, s, 21, { w: 700 }) + 2 * 20 + 19), tot = ws.reduce((a, b) => a + b, 0) + 24;
      let fx = x - tot / 2;
      facts.forEach((s, i) => { fx += d2_pill(g, fx, 1012, s, { s: 21, dot: [D2.amber, D2.teal, D2.lilac][i], fill: 'rgba(10,14,40,0.7)' }) + 12; });
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takvimi',
    desc: 'Kadran 12 aylık takvime döner: alınan temettüler altın sikkelerle dolar, gelecek aylar kesikli çizilir. İbre bugünü gösterir, yıllık tahmin sayacı yükselir.',
    draw(g) {
      d2_sky(g, 0.58, { px: -230, gx: 650 });
      d2_stamp(g, '05:30', 0.58);
      const x = 650, y = 572, Rf = 246;
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const vals = [42, 24, 91, 45, 26, 95, 47, 28, 100, 51, 30, 106], now = 8;
      d2_dial(g, x, y, Rf, { bezel: false, nums: false, minor: false, bw: 18, tickW: 0.01 });
      // month separators + progress of the year
      for (let i = 0; i < 12; i++) {
        const [ax, ay] = d2_pt(x, y, Rf - 2, 12 + 2 * i), [bx, by] = d2_pt(x, y, Rf - 24, 12 + 2 * i);
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      }
      g.save(); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, Rf - 12, 0, TAU); g.stroke(); g.restore();
      months.forEach((m, i) => {
        const hc = 12 + 2 * i + 1, a = d2_ang(hc), v = vals[i], len = 18 + v * 0.95, paid = i < now;
        const r0 = Rf + 62;
        g.save(); g.translate(x, y); g.rotate(a);
        rr(g, r0, -13, len, 26, 13);
        if (paid) {
          const gr = g.createLinearGradient(r0, 0, r0 + len, 0); gr.addColorStop(0, D2.coral); gr.addColorStop(1, D2.amber);
          g.shadowColor = hexA(D2.coral, 0.6); g.shadowBlur = 18; g.fillStyle = gr; g.fill();
        } else {
          g.fillStyle = hexA(D2.peri, 0.1); g.fill(); g.setLineDash([6, 5]); g.strokeStyle = hexA(D2.peri, 0.9); g.lineWidth = 2; g.stroke();
        }
        g.restore();
        if (paid && v > 40) { const [qx, qy] = d2_pt(x, y, r0 + len + 24, hc); d2_coin(g, qx, qy, 16); }
        else if (paid) { const [qx, qy] = d2_pt(x, y, r0 + len + 16, hc); d2_coin(g, qx, qy, 10); }
        const [lx, ly] = d2_pt(x, y, Rf + 32, hc);
        d2_t(g, m, lx, ly + 7, 20, paid ? D2.ink : D2.peri, { a: 'center', w: 800 });
      });
      d2_hand(g, x, y, Rf, 12 + 2 * now, { bw: 24, from: 12, len: 6, over: 50, trailA: 0.32, lw: 4, orb: 9 });
      d2_kick(g, 'Yıllık tahmin', x, y - 92, D2.soft, { a: 'center', s: 19 });
      d2_t(g, '₺218.400', x, y + 2, 80, D2.ink, { w: 800, a: 'center' });
      d2_t(g, 'Maliyete göre getiri', x, y + 54, 22, D2.soft, { w: 600, a: 'center' });
      d2_h(g, '%4,1', x, y + 112, 48, D2.teal, { w: 700, a: 'center' });
      // right column
      const X = 1160;
      d2_kick(g, 'Temettü takvimi', X + 2, 196, D2.amber);
      d2_h(g, 'Hiçbir temettüyü', X - 4, 290, 76, D2.ink, { w: 800, max: 680 });
      d2_grad(g, 'kaçırma.', X - 4, 378, 76);
      d2_card(g, X, 448, 670, 460, 28);
      d2_t(g, 'Bu yıl alınan', X + 40, 504, 20, D2.soft, { w: 600 });
      d2_t(g, '₺146.820', X + 40, 566, 54, D2.ink, { w: 800 });
      d2_pill(g, X + 630, 548, '8 ayda 23 ödeme', { a: 'right', s: 18, c: D2.amber, fill: hexA(D2.amber, 0.1), stroke: hexA(D2.amber, 0.35) });
      [['VOO', '14 Ağu', '+₺3.124,10'], ['MSFT', '12 Ağu', '+₺1.010,00'], ['KO', '01 Ağu', '+₺1.240,80']].forEach(([t, d, v], i) => {
        const yy = 646 + i * 68;
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(X + 40, yy - 42, 590, 1);
        d2_coin(g, X + 58, yy - 8, 14);
        d2_h(g, t, X + 88, yy, 24, D2.ink);
        d2_t(g, d, X + 200, yy, 20, D2.soft, { w: 500 });
        d2_t(g, v, X + 630, yy, 24, D2.teal, { w: 700, a: 'right' });
      });
      rr(g, X + 40, 858, 34, 14, 7); g.fillStyle = D2.amber; g.fill();
      d2_t(g, 'Alınan', X + 86, 872, 19, D2.ink, { w: 600 });
      rr(g, X + 200, 858, 34, 14, 7); g.setLineDash([5, 4]); g.strokeStyle = D2.peri; g.lineWidth = 2; g.stroke(); g.setLineDash([]);
      d2_t(g, 'Tahmini', X + 246, 872, 19, D2.ink, { w: 600 });
    },
  },
  {
    time: '25–31 sn', title: 'Risk: Gün doğumu',
    desc: 'Güneş ufuktan doğarken 1.000 senaryo ışın gibi yayılır; yarıçap zamanı (1–10 yıl), açı değeri gösterir. %5, medyan ve %95 kilitlenir, ölçüler sırayla gelir.',
    draw(g) {
      const HZ = 905, ox = 800, oy = HZ, r0 = 96, R1 = 610, th0 = -118 * Math.PI / 180, K = 1.0;
      d2_sky(g, 0.75, { hz: HZ, gx: ox, px: -260 });
      d2_stamp(g, '06:00', 0.75);
      // soft god rays
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI + 0.15 + i * (Math.PI - 0.3) / 10, w = 0.035;
        const gr = g.createRadialGradient(ox, oy, r0, ox, oy, 1100); gr.addColorStop(0, hexA(D2.amber, 0.09)); gr.addColorStop(1, hexA(D2.amber, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(ox, oy); g.arc(ox, oy, 1100, a - w, a + w); g.closePath(); g.fill();
      }
      g.restore();
      const { paths, steps, p5, p50, p95 } = D2_ST.mc;
      const P = (k, lv) => { const r = r0 + (R1 - r0) * k / steps, th = th0 + K * lv; return [ox + Math.cos(th) * r, oy + Math.sin(th) * r]; };
      // time rings (the dial again)
      [1, 3, 5, 10].forEach(t => {
        const r = r0 + (R1 - r0) * t / 10;
        g.strokeStyle = 'rgba(255,240,225,0.22)'; g.lineWidth = 1.4; g.setLineDash([3, 8]);
        g.beginPath(); g.arc(ox, oy, r, -Math.PI + 0.04, -0.04); g.stroke(); g.setLineDash([]);
        d2_t(g, `${t} yıl`, ox + r, HZ - 14, 19, 'rgba(255,244,232,0.85)', { w: 700, a: 'center' });
      });
      g.save(); g.beginPath(); g.rect(0, 0, W, HZ); g.clip();
      g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.3;
      paths.forEach(p => {
        g.strokeStyle = rgb(ramp([D2.coral, D2.amber, '#FFE9B8'], (p[steps] + 0.3) / 2.0), 0.085);
        const pts = []; for (let k = 0; k <= steps; k += 4) pts.push(P(k, p[k]));
        g.beginPath(); smoothPath(g, pts); g.stroke();
      });
      g.restore();
      const lines = [[p95, D2.amber, '%95'], [p50, '#FFFFFF', 'Medyan'], [p5, D2.coral, '%5']];
      lines.forEach(([s, c]) => {
        const pts = []; for (let k = 0; k <= steps; k += 4) pts.push(P(k, s[k]));
        g.save(); g.shadowColor = c; g.shadowBlur = 16; g.strokeStyle = c; g.lineWidth = 3.5; g.lineJoin = 'round';
        g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
      });
      d2_sun(g, ox, oy, r0 - 14, HZ);
      d2_sea(g, HZ, 0.75, ox);
      lines.forEach(([s, c, l], i) => {
        const [ex, ey] = P(steps, s[steps]);
        addGlow(g, c, ex, ey, 40, 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, 6.5, 0, TAU); g.fill();
        const right = i < 2, tx = right ? ex + 22 : ex - 22, a = right ? 'left' : 'right';
        d2_h(g, l, tx, ey + 8, 28, c, { w: 700, a });
      });
      d2_t(g, 'BUGÜN', ox, HZ + 62, 21, D2.ink, { w: 800, a: 'center', ls: 2 });
      // headline
      d2_kick(g, 'Risk laboratuvarı · Monte Carlo', 112, 128, D2.amber);
      d2_h(g, '1.000 olası gelecek.', 106, 212, 74, D2.ink, { w: 800 });
      d2_t(g, '1–10 yıl ufuk  ·  %5–%95 aralığı', 110, 260, 23, 'rgba(246,242,251,0.82)', { w: 600 });
      // metrics
      [['Sharpe', '1,24', D2.teal, 0.62], ['Beta', '0,92', D2.ink, 0.46], ['VaR (%95)', '−%2,1', D2.coral, 0.21], ['Maks. düşüş', '−%18,6', D2.coral, 0.37]].forEach(([l, v, c, f], i) => {
        const tx = 1492, ty = 196 + i * 170, tw = 350, th = 150;
        d2_card(g, tx, ty, tw, th, 24, { fill: 'rgba(14,16,46,0.66)' });
        d2_t(g, d2_up(l).replace('VAR', 'VaR'), tx + 28, ty + 46, 17, D2.soft, { w: 800, ls: 2.4 });
        d2_h(g, v, tx + 28, ty + 116, 50, c, { w: 700 });
        const gx = tx + tw - 64, gy = ty + th / 2 + 6, gr = 34, a0 = 0.75 * Math.PI, a1 = 2.25 * Math.PI;
        g.lineCap = 'round'; g.lineWidth = 7;
        g.strokeStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(gx, gy, gr, a0, a1); g.stroke();
        g.strokeStyle = c; g.beginPath(); g.arc(gx, gy, gr, a0, a0 + (a1 - a0) * f); g.stroke();
        const [nx, ny] = [gx + Math.cos(a0 + (a1 - a0) * f) * gr, gy + Math.sin(a0 + (a1 - a0) * f) * gr];
        addGlow(g, c, nx, ny, 22, 0.7);
      });
    },
  },
  {
    time: '31–35 sn', title: 'Dört komplikasyon',
    desc: 'İbre 07:00\'ye süpürür; dört alt kadran saat komplikasyonu gibi sırayla açılır: endeksle kıyasla, vergi yöntemi, YZ ile içe aktar ve kriz testi.',
    draw(g) {
      const HZ = 968;
      d2_sky(g, 0.88, { px: -300, gx: 330, hz: HZ });
      d2_sun(g, 330, HZ, 92, HZ);
      d2_sea(g, HZ, 0.88, 330);
      d2_stamp(g, '07:00', 0.88);
      d2_kick(g, 'Hızlı özellikler', 112, 392, D2.amber);
      d2_h(g, 'Dört araç,', 106, 482, 74, D2.ink, { w: 800 });
      d2_grad(g, 'tek kadran.', 106, 566, 74, { max: 520 });
      d2_t(g, 'Endeksle kıyasla · Vergi raporu', 110, 638, 23, 'rgba(246,242,251,0.85)', { w: 600 });
      d2_t(g, 'YZ ile içe aktar · Kriz testi', 110, 672, 23, 'rgba(246,242,251,0.85)', { w: 600 });
      const mx = 1150, my = 545, R = 480, bw = 34;
      d2_dial(g, mx, my, R, { bw, faceA: 1.15 });
      d2_hand(g, mx, my, R, 7, { bw, from: 5.4, len: 8, trailA: 0.7 });
      const sr = 142, subs = [[mx, my - 262], [mx + 280, my], [mx, my + 262], [mx - 280, my]];
      subs.forEach(([cx, cy], i) => {
        d2_disc(g, cx, cy, sr, { fill: 'rgba(7,10,32,0.86)' });
        for (let t = 0; t < 60; t++) {
          const a = t / 60 * TAU, l = t % 5 ? 4 : 8;
          g.strokeStyle = t % 5 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.4)'; g.lineWidth = 1.3;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * (sr - 6), cy + Math.sin(a) * (sr - 6)); g.lineTo(cx + Math.cos(a) * (sr - 6 - l), cy + Math.sin(a) * (sr - 6 - l)); g.stroke();
        }
      });
      const title = (s, cx, cy, c = D2.amber) => d2_t(g, d2_up(s), cx, cy, 16, c, { w: 800, a: 'center', ls: 2.4, max: 200 });
      // 1 · benchmark
      {
        const [cx, cy] = subs[0];
        title('Kıyasla', cx, cy - 82);
        const you = d2_shape(walk(71, 50, 0.004, 0.016), 1.184), spy = d2_shape(walk(72, 50, 0.0025, 0.011), 1.121);
        const all = you.concat(spy), lo = Math.min(...all), hi = Math.max(...all);
        const mp = s => s.map((v, k) => [cx - 104 + k / 49 * 208, cy + 24 - (v - lo) / (hi - lo) * 76]);
        g.strokeStyle = D2.peri; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); smoothPath(g, mp(spy)); g.stroke(); g.setLineDash([]);
        g.save(); g.shadowColor = D2.teal; g.shadowBlur = 10; g.strokeStyle = D2.teal; g.lineWidth = 3; g.beginPath(); smoothPath(g, mp(you)); g.stroke(); g.restore();
        d2_t(g, 'Portföy +%18,4', cx, cy + 64, 19, D2.teal, { w: 800, a: 'center' });
        d2_t(g, 'SPY +%12,1', cx, cy + 90, 17, D2.peri, { w: 700, a: 'center' });
      }
      // 2 · tax method
      {
        const [cx, cy] = subs[1];
        title('Vergi', cx, cy - 82);
        ['FIFO', 'LIFO', 'Ort. maliyet'].forEach((s, k) => {
          const py = cy - 40 + k * 42, on = k === 0;
          rr(g, cx - 86, py - 17, 172, 34, 17);
          g.fillStyle = on ? D2.amber : 'rgba(255,255,255,0.05)'; g.fill();
          if (!on) { g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.2; g.stroke(); }
          d2_t(g, s, cx, py + 6, 17, on ? D2.night : D2.ink, { w: 800, a: 'center' });
        });
        check(g, cx - 54, cy + 86, 16, D2.teal, 3.5);
        d2_t(g, 'rapor hazır', cx - 36, cy + 92, 17, D2.teal, { w: 700 });
      }
      // 3 · AI import
      {
        const [cx, cy] = subs[2];
        g.lineCap = 'round'; g.lineWidth = 6;
        g.strokeStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(cx, cy, sr - 24, 0, TAU); g.stroke();
        g.save(); g.shadowColor = D2.teal; g.shadowBlur = 12; g.strokeStyle = D2.teal; g.beginPath(); g.arc(cx, cy, sr - 24, -Math.PI / 2, -Math.PI / 2 + TAU * 0.82); g.stroke(); g.restore();
        title('YZ ile içe aktar', cx, cy - 60, D2.amber);
        g.save(); g.strokeStyle = D2.ink; g.lineWidth = 2.5; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(cx - 44, cy - 38); g.lineTo(cx - 20, cy - 38); g.lineTo(cx - 8, cy - 26); g.lineTo(cx - 8, cy + 6); g.lineTo(cx - 44, cy + 6); g.closePath(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(cx - 38, cy - 20, 22, 3); g.fillRect(cx - 38, cy - 11, 24, 3); g.fillRect(cx - 38, cy - 2, 16, 3);
        g.restore();
        sparkle(g, cx + 18, cy - 22, 14, D2.amber); sparkle(g, cx + 38, cy - 2, 8, D2.teal);
        d2_h(g, '128 işlem', cx, cy + 44, 28, D2.ink, { w: 700, a: 'center' });
        d2_t(g, 'CSV · yapay zekâ', cx, cy + 72, 16, D2.soft, { w: 600, a: 'center' });
      }
      // 4 · crisis test
      {
        const [cx, cy] = subs[3];
        title('Kriz testi', cx, cy - 82);
        const pts = [];
        for (let k = 0; k <= 40; k++) { const u = k / 40; pts.push([cx - 106 + u * 212, cy - 30 + 64 * Math.exp(-Math.pow((u - 0.42) / 0.13, 2)) - 18 * u]); }
        g.save(); g.beginPath(); g.arc(cx, cy, sr - 14, 0, TAU); g.clip();
        g.fillStyle = hexA(D2.coral, 0.2); g.beginPath(); g.moveTo(pts[8][0], cy - 30 - 18 * 0.2); for (let k = 8; k <= 30; k++) g.lineTo(pts[k][0], pts[k][1]); g.closePath(); g.fill();
        g.save(); g.shadowColor = D2.coral; g.shadowBlur = 10; g.strokeStyle = D2.coral; g.lineWidth = 3; g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
        g.restore();
        d2_h(g, '−%24,3', cx, cy + 70, 30, D2.coral, { w: 700, a: 'center' });
        d2_t(g, '4 gerçek kriz senaryosu', cx, cy + 96, 15, D2.soft, { w: 600, a: 'center' });
      }
      drawMark(g, mx, my, 42, { col: D2.coral, col2: D2.amber, arrow: D2.teal });
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış: Günaydın',
    desc: 'Güneş doğar, kadranın çizgileri ışınlara dönüşür. Kripto724, "Ücretsiz başla" düğmesi ve adres belirir; denizin üstünde küçük yasal not.',
    draw(g) {
      const HZ = 880, sx = CX;
      d2_sky(g, 1, { hz: HZ, px: -330 });
      d2_stamp(g, '08:00', 1, 'Günaydın');
      // rays: the dial's hour ticks around the sun
      g.save(); g.beginPath(); g.rect(0, 0, W, HZ); g.clip();
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI + 0.2 + i * (Math.PI - 0.4) / 8, w = 0.05;
        const gr = g.createRadialGradient(sx, HZ, 120, sx, HZ, 1000); gr.addColorStop(0, hexA('#FFE7B0', 0.16)); gr.addColorStop(1, hexA('#FFE7B0', 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(sx, HZ); g.arc(sx, HZ, 1000, a - w, a + w); g.closePath(); g.fill();
      }
      g.restore();
      for (let i = 0; i < 48; i++) {
        const a = Math.PI + i / 48 * Math.PI, big = i % 4 === 0;
        if (a <= Math.PI + 0.01 || a >= TAU - 0.01) continue;
        g.strokeStyle = big ? 'rgba(255,248,232,0.85)' : 'rgba(255,248,232,0.4)'; g.lineWidth = big ? 3 : 1.6; g.lineCap = 'round';
        const r0 = 168, r1 = big ? 206 : 190;
        g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, HZ + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, HZ + Math.sin(a) * r1); g.stroke();
      }
      d2_sun(g, sx, HZ, 128, HZ);
      d2_sea(g, HZ, 1, sx);
      drawMark(g, CX, 150, 62, { glow: 0.6, col: D2.coral, col2: D2.amber, arrow: D2.teal });
      g.save(); g.shadowColor = 'rgba(10,12,40,0.45)'; g.shadowBlur = 30; wordmark(g, CX, 318, 120, null, { f: D2F, w: 800, grad: D2_DAWN }); g.restore();
      d2_h(g, 'Tüm yatırımların, tek ekranda.', CX, 384, 38, D2.ink, { w: 600, a: 'center', ls: 0 });
      // button
      const lab = 'Ücretsiz başla — kredi kartı gerekmez', bf = { f: D2T, w: 800, s: 33 };
      const tw = measure(g, lab, bf), bwid = tw + 56 + 30 + 64 + 16, bx = CX - bwid / 2, by = 434, bh = 94;
      addGlow(g, D2.amber, CX, by + bh / 2, 520, 0.35);
      g.save(); g.shadowColor = 'rgba(40,10,40,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
      rr(g, bx, by, bwid, bh, bh / 2); g.fillStyle = '#FFF7EE'; g.fill(); g.restore();
      text(g, lab, bx + 56, by + bh / 2 + 12, { ...bf, a: 'left', c: D2.night });
      g.fillStyle = D2.teal; g.beginPath(); g.arc(bx + bwid - 16 - 32, by + bh / 2, 32, 0, TAU); g.fill();
      d2_arrow(g, bx + bwid - 48, by + bh / 2, 13, D2.night, 4);
      g.save(); g.shadowColor = 'rgba(30,10,40,0.5)'; g.shadowBlur = 24;
      d2_h(g, 'kripto724.com', CX, 628, 60, '#FFFFFF', { w: 700, a: 'center', ls: -1 });
      g.restore();
      g.fillStyle = hexA('#FFFFFF', 0.6); g.fillRect(CX - 60, 652, 120, 3);
      d2_t(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', CX, 1042, 20, 'rgba(246,242,251,0.72)', { w: 500, a: 'center' });
    },
  },
];

function d2_paper(g, bw, bh) {
  const gr = g.createLinearGradient(0, 0, 0, bh); gr.addColorStop(0, '#0A0F24'); gr.addColorStop(1, '#0D1230');
  g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
  const rg = g.createRadialGradient(bw * 0.8, bh + 200, 0, bw * 0.8, bh + 200, 1600);
  rg.addColorStop(0, hexA(D2.coral, 0.1)); rg.addColorStop(1, hexA(D2.coral, 0));
  g.fillStyle = rg; g.fillRect(0, 0, bw, bh);
  const r = mulberry32(99);
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(230,228,255,${0.04 + r() * 0.16})`;
    g.beginPath(); g.arc(r() * bw, r() * bh, 0.6 + r() * 1.3, 0, TAU); g.fill();
  }
}

window.DESIGN = {
  id: 2, name: '7/24 Saat',
  concept: 'Piyasalar hiç uyumaz. Film 24 saatlik dev bir kadranın etrafında akar: ibre her sahnede ilerler, gökyüzü gece lacivertinden şafak mercanına ve gün ışığına döner. Sakin, zarif ve premium.',
  board: { bg: '#0A0F24', ink: '#F6F2FB', soft: '#A9A6CC', accent: '#FFC15E', line: 'rgba(169,166,204,0.22)', display: { f: D2F, w: 800, ls: -3 }, text: { f: D2T, w: 500 }, badgeInk: '#0A0F24', paper: d2_paper },
  palette: [['#0B1026', 'Gece'], ['#24346E', 'Lacivert'], ['#FF7A59', 'Şafak'], ['#FFC15E', 'Gün ışığı'], ['#3DD9C1', 'Turkuaz']],
  fonts: ['Sora 700 / 800', 'Manrope 500–700'],
  motion: ['Saat ibresi geçişleri', 'Gökyüzü renk dönüşü', 'Yumuşak parallax, yıldızlar'],
  music: 'ambient pop, 120 BPM, saat tıkırtısı ritmi',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d2_init,
  scenes: D2_SCENES,
};
