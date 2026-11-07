'use strict';
/* Yakınla Yemek (uygulama akışı) — ana çizim, geçişler, ses ipuçları ve kare üretimi. */

const IMPACTS = [[T.q2, 12], [T.s2, 10], [T.done, 8], [T.s5, 10], [T.s4, 5]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 58 + i * 1.7); y += k * Math.cos(dt * 47 + i * 2.3); z += a * 0.0016 * Math.exp(-dt * 9);
  });
  return [x, y, z];
}
function irisTo(g, t, t0, t1, cx, cy, from, to, ringCol) {
  const p = E.inOutCubic(prog(t, t0, t1));
  if (p >= 1) { to(); return; }
  from();
  if (p <= 0) return;
  g.save(); g.beginPath(); g.arc(cx, cy, p * 2300, 0, TAU); g.clip(); to(); g.restore();
  g.strokeStyle = ringCol.replace('A', 0.9 * (1 - p)); g.lineWidth = 22 * (1 - p) + 2;
  g.beginPath(); g.arc(cx, cy, p * 2300, 0, TAU); g.stroke();
}
function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(540 + sx, 960 + sy); g.scale(1 + sz, 1 + sz); g.translate(-540, -960);
  g.fillStyle = '#000'; g.fillRect(-200, -200, W + 400, H + 400);
  if (t < T.s2 + 0.3) irisTo(g, t, T.s2 - 0.2, T.s2 + 0.25, 540, 1235, () => scene1(g, t), () => scene2(g, t), 'rgba(255,255,255,A)');
  else if (t < T.s5 - 0.3) scene2(g, t);
  else if (t < T.s4 - 0.4) irisTo(g, t, T.s5 - 0.3, T.s5 + 0.1, 540, 1235, () => scene2(g, t), () => scene5(g, t), 'rgba(255,214,140,A)');
  else irisTo(g, t, T.s4 - 0.4, T.s4 + 0.04, 700, 1430, () => scene5(g, t), () => scene6(g, t), 'rgba(255,255,255,A)');
  g.restore();
  g.globalAlpha = t < T.s4 ? 1 : 0.2;
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
}

/* ───────────── ses ipuçları (taslak; dış sesten sonra kesinleşir) ───────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // 1) kanca
  cue(Math.max(0, T.phoneIn - 0.05), 'whoosh', { dur: 0.45, f0: 300, f1: 5000, gain: 0.45 });
  cue(T.splash, 'pop', { pitch: 1.1, gain: 0.35 });
  cue(T.appOpen, 'shine', { dur: 0.45, gain: 0.3 }); cue(T.appOpen, 'blip', { pitch: 1.3, gain: 0.25 });
  cue(T.q1, 'whoosh', { dur: 0.3, f0: 1200, f1: 4000, gain: 0.2 });
  cue(T.q2 - 0.1, 'whoosh', { dur: 0.12, f0: 3000, f1: 400, gain: 0.3 });
  cue(T.q2, 'slam', { gain: 0.85 });
  ORBIT.forEach(([, a0], i) => cue(0.35 + i * 0.06, 'pop', { pitch: 0.9 + i * 0.1, gain: 0.3, pan: Math.cos(a0) * 0.6 }));
  // 2) adımlar
  cue(T.s2 - 0.2, 'whoosh', { dur: 0.4, f0: 400, f1: 7000, gain: 0.45 });
  cue(T.s2, 'impact', { gain: 0.6 }); cue(T.s2 + 0.03, 'shimmer', { dur: 0.5, gain: 0.3 });
  cue(T.tapYemek, 'tap', { gain: 0.75 }); cue(T.openYemek, 'whoosh', { dur: 0.36, f0: 500, f1: 5000, gain: 0.4 });
  for (let i = 0; i < 3; i++) cue(T.openYemek + 0.25 + i * 0.08, 'blip', { pitch: 1 + i * 0.1, gain: 0.2, pan: i % 2 ? 0.2 : -0.2 });
  cue(T.st2, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.22 });
  cue(T.scroll, 'sweep', { dur: 0.6, gain: 0.12 });
  cue(T.tapRest, 'tap', { gain: 0.75 }); cue(T.openRest, 'whoosh', { dur: 0.36, f0: 500, f1: 5000, gain: 0.4 });
  cue(T.st3, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.22 });
  T.adds.forEach((a, k) => {
    cue(a, 'tap', { gain: 0.65, pan: 0.15 });
    cue(a + 0.03, 'whoosh', { dur: 0.36, f0: 1500, f1: 5000, gain: 0.16, pan: -0.15 });
    cue(a + 0.42, 'coin', { pitch: 1 + k * 0.122, gain: 0.45, pan: -0.2 });
  });
  cue(T.goCart, 'tap', { gain: 0.8 }); cue(T.done + 0.05, 'success', { gain: 0.5 }); cue(T.done + 0.08, 'pop', { pitch: 1.2, gain: 0.35 });
  // 3) kurye: motor sesi ekrandaki konumuna göre sağ-sol kayar
  cue(T.s5 - 0.3, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.5 });
  const pans = [];
  for (let t = T.s5; t <= T.doorCut + 0.1; t += 0.05) {
    const ent = E.outCubic(prog(t, T.s5, T.s5 + 0.5)), ex = E.inCubic(prog(t, T.doorCut - 0.3, T.doorCut));
    const cx = lerp(-300, 520, ent) + ex * 900;
    pans.push([+t.toFixed(3), clamp((cx - 540) / 540, -1, 1), 0.9 + 0.3 * ex]);
  }
  cue(T.s5, 'motor', { gain: 0.3, track: pans });
  cue(T.doorCut - 0.25, 'whoosh', { dur: 0.45, f0: 5000, f1: 400, gain: 0.45 });
  cue(T.bell, 'doorbell', { gain: 0.65 });
  cue(T.open, 'click', { gain: 0.45 }); cue(T.open + 0.05, 'shimmer', { dur: 0.6, gain: 0.25 });
  cue(T.hand + 0.4, 'crinkle', { dur: 0.35, gain: 0.3 }); cue(T.hand + 0.45, 'shine', { gain: 0.25 });
  // 4) kapanış
  cue(T.s4 - 0.4, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.45 });
  cue(T.s4, 'impact', { gain: 0.65 }); cue(T.s4 + 0.1, 'shimmer', { dur: 0.6, gain: 0.3 });
  cue(T.word, 'whoosh', { dur: 0.4, f0: 600, f1: 4000, gain: 0.3 });
  cue(T.tag, 'pop', { pitch: 1.3, gain: 0.45 }); cue(T.tag, 'sparkle', { dur: 0.9, gain: 0.3 }); cue(T.tag + 0.02, 'confetti', { dur: 1.2, gain: 0.22 });
  cue(T.stores, 'pop', { pitch: 1.3, gain: 0.32, pan: -0.35 }); cue(T.stores + 0.1, 'pop', { pitch: 1.5, gain: 0.32, pan: 0.35 });
  for (const v of VO) cue(v.at, 'vo', { src0: v.src[0], src1: v.src[1] });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────── başlatma ve kare üretimi ───────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const gOff = off.getContext('2d');
async function loadImg(src) { const i = new Image(); i.src = src; await i.decode(); return i; }

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.blue = makeGlow('59,139,255'); SPR.amber = makeGlow('255,181,71');
  SPR.green = makeGlow('74,222,128');
  SPR.softAmber = makeSoft('255,190,110'); SPR.softBlue = makeSoft('120,170,255');
  const v = gOff.createRadialGradient(540, 920, 520, 540, 960, 1300);
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,0.3)');
  SPR.vig = v;
  const scaled = (img, k, white) => {
    const c = canvas(Math.round(img.width * k), Math.round(img.height * k)), x = c.getContext('2d');
    x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height);
    if (white) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    return c;
  };
  SPR.wmS = scaled(SPR.wmImg, LOGO.k); SPR.wmWhite = scaled(SPR.wmImg, TITLE3.k, true);
  SPR.shineBuf = canvas(SPR.wmS.width, SPR.wmS.height);
  setFont(gOff, { w: 800, s: 100 });
  TITLE3.fs = 100 * (326 * TITLE3.k) / gOff.measureText('Y').actualBoundingBoxAscent;
  for (const n of Object.keys(ICON)) SPR['ic_' + n] = iconSprite(n, n === 'plate' || n === 'lid' ? 6 : 4.2);
  for (const n of ['burger', 'pizza', 'drink', 'fries', 'durum', 'kebap']) SPR['ic_' + n + 'B'] = iconSprite(n, 2.2, 7);
}

function renderFrame(f) {
  const t = f / FPS;
  for (let s = 0; s < SAMPLES; s++) {
    const ts = clamp(t + ((s + 0.5) / SAMPLES - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    gOff.setTransform(1, 0, 0, 1, 0, 0); gOff.globalAlpha = 1; gOff.globalCompositeOperation = 'source-over'; gOff.filter = 'none';
    draw(gOff, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) { gOff.setTransform(1, 0, 0, 1, 0, 0); gOff.globalAlpha = 1; draw(gOff, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  [SPR.wmImg, SPR.cardMarket, SPR.cardYemek] = await Promise.all(['assets/yakinla-wordmark.png', 'assets/kart-market.png', 'assets/kart-yemek.png'].map(loadImg));
  initSprites();
  window.CUES = buildCues();
  window.T = T;
  window.FRAMES = FRAMES; window.FPS = FPS; window.DUR = DUR;
  window.renderFrame = renderFrame; window.renderAt = renderAt;
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) renderAt(+qs.get('t'));
  if (qs.has('play')) {
    document.body.classList.add('preview');
    const t0 = performance.now();
    const loop = () => { renderAt(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    loop();
  }
  return true;
})();
