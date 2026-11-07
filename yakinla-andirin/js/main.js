'use strict';
/* Yakınla Market Andırın — ana çizim, geçişler, ses ipuçları ve kare üretimi. */

const IMPACTS = [[T.pinDrop + 0.42, 16], [T.cut, 18], [T.acildi, 10], [T.s2, 8], [T.count1, 8], [T.cokYakinda, 14], [T.s4, 5]];
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
  if (t < T.s2 + 0.3) irisTo(g, t, T.s2 - 0.25, T.s2 + 0.2, 540, 1150, () => scene1(g, t), () => scene2(g, t), 'rgba(255,255,255,A)');
  else if (t < T.s5 - 0.3) scene2(g, t);
  else if (t < T.teaser - 0.3) irisTo(g, t, T.s5 - 0.3, T.s5 + 0.1, 540, 1235, () => scene2(g, t), () => scene3(g, t), 'rgba(255,214,140,A)');
  else if (t < T.s4 - 0.4) irisTo(g, t, T.teaser - 0.3, T.teaser + 0.1, 700, 1430, () => scene3(g, t), () => scene4(g, t), 'rgba(255,214,140,A)');
  else irisTo(g, t, T.s4 - 0.4, T.s4 + 0.04, 540, 1100, () => scene4(g, t), () => scene6(g, t), 'rgba(255,255,255,A)');
  g.restore();
  g.globalAlpha = t < T.s4 ? 1 : 0.2;
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
}

/* ───────────── ses ipuçları (audio.py okur) ───────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  // 1) duyuru
  cue(0.0, 'sweep', { dur: 0.6, gain: 0.15 });
  cue(T.kick, 'pop', { pitch: 1.0, gain: 0.5 }); cue(T.kick + 0.02, 'shine', { gain: 0.25 });
  cue(T.pinDrop, 'whoosh', { dur: 0.42, f0: 6000, f1: 400, gain: 0.5 });
  cue(T.pinDrop + 0.42, 'impact', { gain: 0.85 }); cue(T.pinDrop + 0.45, 'shimmer', { dur: 0.6, gain: 0.3 });
  cue(T.label, 'pop', { pitch: 1.2, gain: 0.4 });
  cue(T.title, 'whoosh', { dur: 0.35, f0: 900, f1: 4500, gain: 0.25 });
  cue(T.ribbonIn, 'whoosh', { dur: 0.45, f0: 300, f1: 3000, gain: 0.3, pan: -0.5 });
  cue(T.snip - 0.3, 'whoosh', { dur: 0.3, f0: 2000, f1: 600, gain: 0.25, pan: 0.5 });
  cue(T.snip, 'clink', { pitch: 1.3, gain: 0.3, pan: 0.2 }); cue(T.cut, 'snip', { gain: 0.8 });
  cue(T.cut, 'impact', { gain: 0.9, big: true }); cue(T.cut + 0.02, 'confetti', { dur: 1.5, gain: 0.4 });
  cue(T.acildi, 'slam', { gain: 0.8 });
  // 2) uygulama
  cue(T.s2 - 0.2, 'whoosh', { dur: 0.4, f0: 400, f1: 7000, gain: 0.45 });
  cue(T.s2 + 0.15, 'pop', { pitch: 1.1, gain: 0.3, pan: -0.3 }); cue(T.s2 + 0.25, 'pop', { pitch: 1.3, gain: 0.3, pan: 0.3 });
  cue(T.tapInstall, 'tap', { gain: 0.75 });
  for (let i = 0; i < 6; i++) cue(T.tapInstall + 0.08 + i * 0.07, 'tick', { pitch: 1.2 + i * 0.08, gain: 0.18 });
  cue(T.installed, 'success', { gain: 0.4 });
  cue(T.home, 'whoosh', { dur: 0.3, f0: 600, f1: 4000, gain: 0.25 });
  cue(T.tapMarket, 'tap', { gain: 0.75 }); cue(T.openMarket, 'whoosh', { dur: 0.36, f0: 500, f1: 5000, gain: 0.4 });
  for (let i = 0; i < 6; i++) cue(T.openMarket + 0.2 + i * 0.05, 'blip', { pitch: 1 + i * 0.08, gain: 0.18, pan: i % 2 ? 0.25 : -0.25 });
  T.adds.forEach((a, k) => { cue(a, 'tap', { gain: 0.65, pan: 0.15 }); cue(a + 0.36, 'coin', { pitch: 1 + k * 0.122, gain: 0.45, pan: -0.2 }); });
  cue(T.order, 'tap', { gain: 0.8 }); cue(T.done + 0.05, 'success', { gain: 0.5 });
  // 3) hız: motor sesi ekrandaki konuma göre kayar, sayaç tıkırdar
  cue(T.s5 - 0.3, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.5 });
  const pans = [];
  for (let t = T.s5; t <= T.doorCut + 0.1; t += 0.05) {
    const ent = E.outCubic(prog(t, T.s5, T.s5 + 0.5)), ex = E.inCubic(prog(t, T.doorCut - 0.3, T.doorCut));
    pans.push([+t.toFixed(3), clamp((lerp(-300, 520, ent) + ex * 900 - 540) / 540, -1, 1), 0.9 + 0.3 * ex]);
  }
  cue(T.s5, 'motor', { gain: 0.28, track: pans });
  let prev = 0;
  for (let f = 0; f <= 120; f++) {
    const t = T.count0 + f * 0.01, n = Math.round(60 * E.outCubic(prog(t, T.count0, T.count1)));
    if (n !== prev && n % 3 === 0) { cue(t, 'tick', { pitch: 0.9 + n / 60 * 1.2, gain: 0.2 }); prev = n; }
  }
  cue(T.ortalama, 'pop', { pitch: 1.1, gain: 0.35 }); cue(T.count1, 'shine', { gain: 0.3 });
  cue(T.doorCut - 0.25, 'whoosh', { dur: 0.45, f0: 5000, f1: 400, gain: 0.4 });
  cue(T.bell, 'doorbell', { gain: 0.6 }); cue(T.open, 'click', { gain: 0.4 });
  cue(T.hand + 0.4, 'crinkle', { dur: 0.35, gain: 0.28 });
  // 4) teaser
  cue(T.teaser - 0.3, 'whoosh', { dur: 0.4, f0: 300, f1: 6000, gain: 0.4 });
  cue(T.haber, 'pop', { pitch: 0.9, gain: 0.35 });
  cue(T.cloche, 'thump', { gain: 0.4 });
  cue(T.yemekTitle, 'whoosh', { dur: 0.35, f0: 900, f1: 4500, gain: 0.25 });
  for (const [a, b] of [[13.25, 13.75], [14.4, 14.9], [15.5, 15.95]]) for (let i = 0; i < 7; i++) cue(a + i * (b - a) / 7, 'clink', { pitch: 1 + (i % 3) * 0.08, gain: 0.25, pan: i % 2 ? 0.2 : -0.2 });
  cue(T.cokYakinda - 0.1, 'whoosh', { dur: 0.12, f0: 3000, f1: 400, gain: 0.3 });
  cue(T.cokYakinda, 'slam', { gain: 0.9 }); cue(T.cokYakinda + 0.05, 'sparkle', { dur: 0.8, gain: 0.3 });
  cue(T.andirinda, 'whoosh', { dur: 0.3, f0: 1200, f1: 4000, gain: 0.2 });
  // 5) kapanış
  cue(T.s4 - 0.4, 'whoosh', { dur: 0.4, f0: 300, f1: 8000, gain: 0.45 });
  cue(T.s4, 'impact', { gain: 0.6 }); cue(T.s4 + 0.1, 'shimmer', { dur: 0.6, gain: 0.3 });
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
  for (const n of ['burger', 'pizza', 'drink', 'fries', 'durum', 'kebap', 'milk', 'bread', 'chips', 'eggs', 'water']) SPR['ic_' + n + 'B'] = iconSprite(n, 2.2, 7);
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
