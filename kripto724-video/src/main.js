'use strict';
/* Timeline, transitions, overlays, cue sheet and frame rendering.
 *
 * Nine scenes follow the nine voiceover lines (src/timeline.js). Each scene is a pure function
 * of its local time u (seconds since its cut, negative during the incoming transition) and its
 * length D. A cut is a zoom-through: the outgoing frame pushes in while the incoming one
 * settles from the same push, with a soft white bloom; extra motion-blur samples smooth it. */

const TA = 0.32, TB = 0.26;            // transition window around each cut
const SMP = 4, SMP_FAST = 9, SHUT = 0.55;
const DURV = TL.total, FRAMESV = Math.round(DURV * FPS);

const off = canvas(W, H), g = off.getContext('2d');       // a scene is drawn here (d5_snap reads it)
const bufA = canvas(W, H), ga = bufA.getContext('2d');    // outgoing scene during a cut
const comp = canvas(W, H), cg = comp.getContext('2d');    // composited frame

function drawScene(i, u) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.save(); SCENES[i + 1].draw(g, u * TL.rate[i], TL.scenes[i] * TL.rate[i]); g.restore();
}
function zoomed(x, src, k, a = 1) {
  x.save(); x.globalAlpha = a; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(src, CX - CX * k, CY - CY * k, W * k, H * k); x.restore();
}
// which scene (and cut) is on screen at t
function where(t) {
  let i = 0;
  while (i < 8 && t >= TL.start[i + 1]) i++;
  if (i < 8 && t > TL.start[i + 1] - TA) return { i, cut: (t - (TL.start[i + 1] - TA)) / (TA + TB) };
  if (i > 0 && t < TL.start[i] + TB) return { i: i - 1, cut: (t - (TL.start[i] - TA)) / (TA + TB) };
  return { i, cut: null };
}
function compose(t) {
  const { i, cut } = where(t);
  if (cut == null) {
    drawScene(i, t - TL.start[i]);
    cg.globalAlpha = 1; cg.drawImage(off, 0, 0);
  } else {
    const e = E.inOutCubic(clamp(cut));
    drawScene(i, t - TL.start[i]);
    ga.drawImage(off, 0, 0);
    drawScene(i + 1, t - TL.start[i + 1]);
    cg.fillStyle = '#F4F1FF'; cg.fillRect(0, 0, W, H);
    zoomed(cg, bufA, 1 + 0.16 * E.inCubic(clamp(cut * 1.15)));
    zoomed(cg, off, 1.16 - 0.16 * E.outCubic(clamp(cut * 1.1 - 0.1)), clamp(e * 1.25 - 0.1));
    const b = Math.sin(Math.PI * clamp(cut)) * 0.32;
    if (b > 0) { cg.fillStyle = `rgba(255,255,255,${b})`; cg.fillRect(0, 0, W, H); }
  }
  // sample-data note while the app is on screen (scenes 3–8)
  const na = Math.min(clamp((t - TL.start[2] - 0.3) / 0.5), 1 - clamp((t - TL.start[8] + 0.35) / 0.3));
  if (na > 0) {
    cg.save(); cg.globalAlpha = na * 0.8;
    text(cg, 'Fiyatlar örnektir · Yatırım tavsiyesi değildir.', W - 44, H - 34, { f: D5M, w: 600, s: 18, a: 'right', c: D5.soft });
    cg.restore();
  }
}

/* ───────────── audio cue sheet (read by audio.py) ───────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // scenes write cues in their own (design) time; map them through each scene's rate
  for (let i = 0; i < 9; i++) if (SCENES[i + 1].cues) SCENES[i + 1].cues((t, type, o) => cue(TL.start[i] + t / TL.rate[i], type, o), 0, TL.scenes[i] * TL.rate[i]);
  for (let i = 1; i < 9; i++) cue(TL.start[i] - 0.3, 'swish', { gain: 0.5 });
  return q.filter(c => c.t >= 0 && c.t < DURV).sort((a, b) => a.t - b.t);
}

/* ───────────── frame rendering ───────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
function isFast(t) {
  const { i, cut } = where(t);
  if (cut != null) return true;
  const u = (t - TL.start[i]) * TL.rate[i];
  return (SCENES[i + 1].fast || []).some(([a, b]) => u >= a && u < b);
}
function renderFrame(f) {
  const t = f / FPS, n = isFast(t) ? SMP_FAST : SMP;
  for (let s = 0; s < n; s++) {
    const ts = clamp(t + ((s + 0.5) / n - 0.5) * SHUT / FPS, 0, DURV - 1e-4);
    compose(ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(comp, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) { compose(t); ctx.globalAlpha = 1; ctx.drawImage(comp, 0, 0); }
// key frames of all nine scenes on one 1920×1080 sheet
function renderBoard() {
  ctx.fillStyle = '#ECE9F8'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) {
    drawScene(i, SCENES[i + 1].key / TL.rate[i]);
    const cw = 620, ch = 349, x = 20 + (i % 3) * (cw + 10), y = 6 + Math.floor(i / 3) * (ch + 10);
    ctx.save(); ctx.imageSmoothingQuality = 'high'; rr(ctx, x, y, cw, ch, 10); ctx.clip(); ctx.drawImage(off, x, y, cw, ch); ctx.restore();
    ctx.fillStyle = D5.or; rr(ctx, x + 10, y + 10, 34, 24, 6); ctx.fill();
    text(ctx, String(i + 1), x + 27, y + 28, { f: D5I, w: 800, s: 16, c: '#FFFFFF' });
  }
}

window.READY = (async () => {
  const fams = [[D5U, [600, 700, 800]], [D5M, [500, 600, 700, 800]], [D5I, [500, 600, 700, 800]], ['Poppins', [700, 800]]];
  await Promise.all(fams.flatMap(([f, ws]) => ws.map(w => document.fonts.load(`${w} 40px "${f}"`, 'AaĞğŞşİıÇçÖöÜü₺$%0123').catch(() => null))));
  await document.fonts.ready;
  await K724.ready;
  for (let i = 1; i <= 9; i++) if (SCENES[i].init) SCENES[i].init();
  window.CUES = buildCues();
  Object.assign(window, { FRAMES: FRAMESV, FPS, DUR: DURV, W, H, TL, renderFrame, renderAt, renderBoard });
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  if (qs.has('board')) renderBoard();
  if (qs.has('play')) {
    document.body.classList.add('preview');
    const t0 = performance.now() - (+qs.get('play') || 0) * 1000;
    const loop = () => { renderAt(((performance.now() - t0) / 1000) % DURV); requestAnimationFrame(loop); };
    loop();
  }
  return true;
})();
