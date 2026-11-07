'use strict';
/* Yakınla Yemek — ana çizim, geçişler, ses ipuçları ve kare üretimi. */

/* ───────────── kamera sarsıntısı ───────────── */
const IMPACTS = [[T.burst, 16], [T.l2, 11], [T.s2, 13], [T.toggle + 0.05, 15], [T.afsin, 7], [T.aktif, 11], [T.s4, 5]];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 58 + i * 1.7); y += k * Math.cos(dt * 47 + i * 2.3); z += a * 0.0016 * Math.exp(-dt * 9);
  });
  return [x, y, z];
}
function homeWorld(t) { return phoneToWorld(phoneXf(t), ROUTE[4][0] + 6, ROUTE[4][1] - 48); }
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
  if (t < T.s2) scene1(g, t);
  else if (t < T.wipe3) scene2(g, t);
  else if (t < T.wipe4) {
    const [hx, hy] = homeWorld(Math.min(t, T.s3));
    irisTo(g, t, T.wipe3, T.s3 + 0.04, hx, hy, () => scene2(g, t), () => scene3(g, t), 'rgba(140,255,180,A)');
  } else {
    irisTo(g, t, T.wipe4, T.s4 + 0.04, TG.x1, TG.y, () => scene3(g, t), () => scene4(g, t), 'rgba(255,255,255,A)');
  }
  g.restore();
  g.globalAlpha = t < T.s4 ? 1 : 1 - E.inOutCubic(prog(t, T.wipe4, T.s4 + 0.1)) * 0.8;
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
}

/* ───────────── ses ipuçları (audio.py okur) ───────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // 1) kanca
  cue(0.0, 'sweep', { dur: 0.6, gain: 0.18 });
  cue(T.kick, 'pop', { pitch: 1.0, gain: 0.55 }); cue(T.kick + 0.02, 'shine', { gain: 0.25 });
  cue(0.62, 'shine', { dur: 0.4, gain: 0.25 });
  for (let i = 0; i < 9; i++) cue(T.lidShake + i * 0.045, 'clink', { pitch: 1 + (i % 3) * 0.08, gain: 0.32, pan: i % 2 ? 0.2 : -0.2 });
  cue(T.lidUp - 0.25, 'reverse', { dur: 0.3, gain: 0.35 });
  cue(T.lidUp, 'whoosh', { dur: 0.45, f0: 400, f1: 6000, gain: 0.6 });
  cue(T.burst - 0.05, 'impact', { gain: 0.95 }); cue(T.burst, 'sparkle', { dur: 0.9, gain: 0.35 });
  cue(T.burst + 0.05, 'sizzle', { dur: 1.6, gain: 0.22 });
  FOODS.forEach(([, x], i) => cue(T.burst - 0.06 + FOODS[i][5] + 0.18, 'pop', { pitch: 0.9 + i * 0.12, gain: 0.45, pan: (x - 540) / 540 * 0.7 }));
  cue(T.l1, 'whoosh', { dur: 0.3, f0: 1200, f1: 4000, gain: 0.2 });
  cue(T.l2 - 0.1, 'whoosh', { dur: 0.12, f0: 3000, f1: 400, gain: 0.35 });
  cue(T.l2, 'slam', { gain: 1.0 });
  cue(T.l3, 'whoosh', { dur: 0.3, f0: 1200, f1: 4000, gain: 0.2 });
  cue(T.implode - 0.05, 'reverse', { dur: 0.4, gain: 0.5 });
  cue(T.implode, 'whoosh', { dur: 0.36, f0: 6000, f1: 300, gain: 0.55 });
  // 2) adımlar
  cue(T.s2, 'impact', { gain: 0.75 }); cue(T.s2 + 0.03, 'shimmer', { dur: 0.5, gain: 0.35 });
  cue(T.st1, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.25 });
  cue(T.yemekTab, 'switch', { gain: 0.45 }); cue(T.yemekTab + 0.28, 'pop', { pitch: 1.4, gain: 0.35, pan: 0.2 });
  for (let i = 0; i < 4; i++) cue(T.yemekTab + 0.3 + i * 0.08, 'blip', { pitch: 1 + i * 0.1, gain: 0.2, pan: i % 2 ? 0.2 : -0.2 });
  cue(T.tapRest, 'tap', { gain: 0.7 }); cue(T.open, 'whoosh', { dur: 0.36, f0: 500, f1: 5000, gain: 0.4 });
  cue(T.st2, 'whoosh', { dur: 0.3, f0: 900, f1: 3500, gain: 0.25 });
  T.adds.forEach((a, k) => {
    cue(a, 'tap', { gain: 0.65, pan: 0.15 });
    cue(a + 0.03, 'whoosh', { dur: 0.36, f0: 1500, f1: 5000, gain: 0.18, pan: -0.15 });
    cue(a + 0.42, 'coin', { pitch: 1 + k * 0.122, gain: 0.5, pan: -0.2 });
  });
  cue(T.confirm, 'tap', { gain: 0.8 }); cue(T.confirm + 0.05, 'success', { gain: 0.5 });
  cue(T.st3 - 0.15, 'whoosh', { dur: 0.36, f0: 400, f1: 4000, gain: 0.35 });
  const pans = [];
  for (let t = T.ride0 - 0.2; t <= T.ride1 + 0.2; t += 0.05) {
    const [x, y] = routePt(rideS(t)), w = phoneToWorld(phoneXf(t), x, y);
    const sp = (rideS(t + 0.05) - rideS(t)) / 0.05 / 450;
    pans.push([+t.toFixed(3), clamp((w[0] - 540) / 540, -1, 1), +clamp(sp, 0, 1.5).toFixed(3)]);
  }
  cue(T.ride0 - 0.2, 'motor', { gain: 0.22, track: pans });
  cue(T.ride1 + 0.02, 'doorbell', { gain: 0.6 });
  cue(T.ride1 + 0.08, 'success', { gain: 0.35 });
  cue(T.wipe3 - 0.02, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.55 });
  // 3) lansman
  cue(T.s3, 'impact', { gain: 0.8 });
  cue(T.s3 + 0.05, 'pop', { pitch: 1.2, gain: 0.4 });
  cue(T.title3, 'whoosh', { dur: 0.35, f0: 900, f1: 4500, gain: 0.25 });
  cue(T.s3 + 0.15, 'thump', { gain: 0.5 });
  cue(T.toggle - 0.3, 'reverse', { dur: 0.3, gain: 0.35 });
  cue(T.toggle, 'switch', { gain: 0.9 });
  cue(T.toggle + 0.05, 'impact', { gain: 0.8 });
  cue(T.toggle + 0.08, 'sparkle', { dur: 1.0, gain: 0.35 });
  cue(T.toggle + 0.1, 'confetti', { dur: 1.2, gain: 0.25 });
  cue(T.afsin, 'thump', { gain: 0.45 });
  cue(T.aktif, 'slam', { gain: 1.0 }); cue(T.aktif + 0.02, 'shine', { gain: 0.3 });
  cue(T.wipe4 - 0.3, 'reverse', { dur: 0.3, gain: 0.45 });
  cue(T.wipe4, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.5 });
  // 4) kapanış
  cue(T.s4, 'impact', { gain: 0.7 });
  cue(T.s4 + 0.1, 'shimmer', { dur: 0.6, gain: 0.3 });
  cue(T.word, 'whoosh', { dur: 0.4, f0: 600, f1: 4000, gain: 0.3 });
  cue(T.tag, 'pop', { pitch: 1.3, gain: 0.5 }); cue(T.tag, 'sparkle', { dur: 1.0, gain: 0.35 }); cue(T.tag + 0.02, 'shine', { gain: 0.3 });
  cue(T.tag + 0.02, 'confetti', { dur: 1.4, gain: 0.25 });
  cue(T.stores, 'pop', { pitch: 1.3, gain: 0.32, pan: -0.35 }); cue(T.stores + 0.1, 'pop', { pitch: 1.5, gain: 0.32, pan: 0.35 });
  for (const v of VO) cue(v.at, 'vo', { src0: v.src[0], src1: v.src[1] });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────── başlatma ve kare üretimi ───────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const gOff = off.getContext('2d');

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.blue = makeGlow('59,139,255'); SPR.amber = makeGlow('255,181,71');
  SPR.green = makeGlow('74,222,128');
  SPR.softAmber = makeSoft('255,190,110'); SPR.softBlue = makeSoft('120,170,255');
  const v = gOff.createRadialGradient(540, 920, 520, 540, 960, 1300);
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,0.34)');
  SPR.vig = v;
  // orijinal logo yazısı: kapanış için ölçekli kopya, lansman başlığı için beyaz siluet
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
  SPR.wmImg = new Image(); SPR.wmImg.src = 'assets/yakinla-wordmark.png'; await SPR.wmImg.decode();
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
