'use strict';
/* Scene sequencing, camera shake, overlays, audio cue sheet, frame rendering.
 *
 * Timeline (120 BPM: 1 beat = 0.5 s, 1 bar = 2 s; every cut lands on a bar line)
 *   0–4    Hook       a scattered financial life implodes
 *   4–8    Reveal     "All your investments, one clear view." → mark → wordmark → dive
 *   8–14   Dashboard  value, performance vs S&P 500, holdings, allocation
 *   14–18  Markets    every asset class, dot globe, 60+ markets, 50+ currencies
 *   18–22  Brokers    auto-sync orbit, read-only, nightly
 *   22–26  Dividends  3D income chart, coins, forecasts
 *   26–32  Risk lab   1,000 Monte Carlo paths, efficient frontier, risk metrics
 *   32–36  Montage    benchmark · tax · AI import · crash stress tests
 *   36–42  Finale     mark, wordmark, tagline, call to action
 */

const IMPACTS = [[0.25, 10], [1.25, 10], [2.25, 12], [4.0, 34], [4.05, 6], [4.3, 6], [4.55, 8], [8.0, 12], [14.0, 14],
  [18.0, 12], [22.0, 12], [26.0, 14], [29.0, 10], [32.0, 10], [33.0, 8], [34.0, 8], [35.0, 8], [36.0, 34], [37.0, 10]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  for (const [t0, a] of IMPACTS) {
    const d = t - t0;
    if (d < 0 || d > 0.6) continue;
    const e = Math.exp(-d * 9) * a;
    x += Math.sin(d * 83 + t0 * 3) * e; y += Math.cos(d * 71 + t0 * 5) * e * 0.8; z += e * 0.0012;
  }
  return [x, y, z];
}
function flash(t) {
  let a = 0;
  for (const [t0, k, d] of [[4.0, 1, 0.35], [14.0, 0.5, 0.25], [36.0, 1, 0.4]]) {
    const u = t - t0;
    if (u >= -0.04 && u < d) a = Math.max(a, k * (u < 0 ? (u + 0.04) / 0.04 : 1 - E.outQuad(u / d)));
  }
  return a;
}

function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(CX + sx, CY + sy); g.scale(1 + sz, 1 + sz); g.translate(-CX, -CY);
  background(g, t, t >= 36 ? 1.25 : 1);
  if (t < 4.0) scene1(g, t);
  if (t >= 4.0 && t < 8.0) scene2(g, t);
  if (t >= 8.0 && t < 14.02) scene3(g, t);
  if (t >= 13.9 && t < 18.05) scene4(g, t);
  if (t >= 17.55 && t < 22.05) scene5(g, t);
  if (t >= 21.8 && t < 26.05) scene6(g, t);
  if (t >= 25.7 && t < 32.16) scene7(g, t);
  if (t >= 31.78 && t < 36.1) scene8(g, t);
  if (t >= 35.9) scene9(g, t);
  // illustrative-data note while the product UI is on screen
  const na = window01(t, 8.4, 35.85, 0.5, 0.3);
  if (na > 0) {
    g.save(); g.globalAlpha = na * 0.75;
    text(g, 'Sample portfolio · illustrative data', W - 40, H - 30, { s: 17, w: 500, f: 'Txt', a: 'right', c: C.dim });
    g.restore();
  }
  g.restore();
  vignette(g);
  const fa = flash(t);
  if (fa > 0) { g.fillStyle = `rgba(235,245,255,${fa})`; g.fillRect(0, 0, W, H); }
}

/* ───────────────────────── audio cue sheet (read by audio.py) ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  [cues1, cues2, cues3, cues4, cues5, cues6, cues7, cues8, cues9].forEach(f => f(cue));
  return q.filter(c => c.t >= 0 && c.t < DUR).sort((a, b) => a.t - b.t);
}

/* ───────────────────────── start-up and frame rendering ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

// whip transitions need more sub-frames for smooth blur
const FAST = [[3.2, 4.05], [7.3, 8.3], [13.6, 14.4], [17.5, 18.3], [21.6, 22.35], [25.6, 26.2], [28.8, 29.2], [31.75, 32.2], [32.75, 33.2], [33.75, 34.2], [34.75, 35.2], [35.6, 36.2]];
function samplesAt(t) { return FAST.some(([a, b]) => t >= a && t < b) ? 14 : SAMPLES; }

function renderFrame(f) {
  const t = f / FPS, n = samplesAt(t);
  for (let s = 0; s < n; s++) {
    const ts = clamp(t + ((s + 0.5) / n - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    draw(g, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0);
}

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt']
    .map(f => document.fonts.load(f, 'AaBb0123$€£¥₺₹₩·—→')));
  initBackground(g);
  [init4, init7].forEach(f => f());
  window.CUES = buildCues();
  Object.assign(window, { FRAMES, FPS, DUR, W, H, renderFrame, renderAt });
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  if (qs.has('play')) {
    document.body.classList.add('preview');
    const t0 = performance.now() - (+qs.get('play') || 0) * 1000;
    const loop = () => { renderAt(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    loop();
  }
  return true;
})();
