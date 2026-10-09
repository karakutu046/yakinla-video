'use strict';
/* Zaman çizelgesi, geçişler, son işlem, ses ipuçları ve kare üretimi */

/* ───────────────────────── sarsıntı ve parlama ───────────────────────── */
const IMPACTS = [
  [KNOCKS[0], 6], [KNOCKS[1], 6], [KNOCKS[2], 9], [T.paper, 16], [T.aisle, 24], [T.liquid, 20], [T.physics, 8],
  [T.line, 24], [T.type, 10], [TY.t2, 9], [TY.t3, 12], [TY.inv, 14], [T.logo, 24], [LG.land, 9],
];
function shake(t) {
  let x = 0, y = 0, z = 0;
  IMPACTS.forEach(([ti, a], i) => {
    const dt = t - ti; if (dt < 0 || dt > 0.5) return;
    const k = a * Math.exp(-dt * 13);
    x += k * Math.sin(dt * 95 + i * 1.7); y += k * Math.cos(dt * 78 + i * 2.3); z += a * 0.0015 * Math.exp(-dt * 9);
  });
  return [x, y, z];
}
const FLASHES = [[T.paper, 0.55, '255,236,200'], [T.aisle, 0.35, '255,255,255'], [T.liquid, 0.3, '220,235,255'], [T.line, 0.8, '255,255,255'], [T.logo, 0.6, '255,255,255']];

function sunburst(g, t, t0, dur, drawNew) {
  const p = E.outCubic(prog(t, t0, t0 + dur)); if (p <= 0) return;
  const R = 2600 * p, n = 16, rot = t * 0.6;
  g.save(); g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, r = i % 2 ? R * 0.5 : R; g.lineTo(540 + Math.cos(a) * r, 1010 + Math.sin(a) * r); }
  g.closePath(); g.clip(); drawNew(); g.restore();
}
function draw(g, t) {
  g.save();
  const [sx, sy, sz] = shake(t);
  g.translate(540 + sx, 960 + sy); g.scale(1 + sz, 1 + sz); g.translate(-540, -960);
  g.fillStyle = '#000'; g.fillRect(-200, -200, W + 400, H + 400);
  if (t < T.paper) sceneKnock(g, t);
  else if (t < T.aisle) {
    // kapı açılınca yeni dünya kapıdan dışarı daire olarak taşar
    const p = prog(t, T.paper, T.paper + 0.34), r = 1750 * E.outCubic(p);
    if (p < 1) sceneKnock(g, t);
    g.save(); g.beginPath(); g.arc(540, 1010, Math.max(r, 0.1), 0, TAU); g.clip(); scenePaper(g, t); g.restore();
    if (p < 1) { g.strokeStyle = `rgba(255,236,200,${0.9 * (1 - p)})`; g.lineWidth = 26 * (1 - p) + 2; g.beginPath(); g.arc(540, 1010, r, 0, TAU); g.stroke(); }
  } else if (t < T.liquid) {
    if (t < T.aisle + 0.45) { scenePaper(g, t); blinds(g, t, T.aisle, 0.24, () => sceneAisle(g, t)); }
    else sceneAisle(g, t);
  } else if (t < T.physics) sceneLiquid(g, t);
  else if (t < T.line) {
    // su çekildi: kapıdan ışın ışın yeni dünya taşar
    if (t < T.physics + 0.45) { sceneLiquid(g, t); sunburst(g, t, T.physics, 0.4, () => scenePhysics(g, t)); }
    else scenePhysics(g, t);
  }
  else if (t < T.type) sceneLine(g, t);
  else if (t < T.logo) sceneType(g, t);
  else sceneLogo(g, t);
  g.restore();
  for (const [ti, a, col] of FLASHES) {
    const dt = t - ti; if (dt < 0 || dt > 0.4) continue;
    g.fillStyle = `rgba(${col},${a * Math.exp(-dt * 13)})`; g.fillRect(0, 0, W, H);
  }
  const vig = t < T.paper ? 0.5 : (t >= T.type && t < T.logo) ? 0.35 : 0.16;
  g.save(); g.globalAlpha = vig; g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H); g.restore();
  grain(g, t, 0.05);
}

/* ───────────────────────── ses ipuçları (audio.py okur) ───────────────────────── */
// Her efekt, ekrandaki olayla aynı anda ve aynı yönde (pan) duyulur.
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => q.push({ t: +t.toFixed(4), type, ...o });
  const panX = x => +clamp((x - 540) / 540 * 0.8, -1, 1).toFixed(3);

  // 1 · Kapı
  cue(0.0, 'shimmer', { dur: 0.45, gain: 0.22 }); cue(0.0, 'sweep', { dur: 0.45, gain: 0.22 }); cue(0.0, 'thump', { gain: 0.35 });
  KNOCKS.forEach((k, i) => { cue(k, 'knock', { gain: [0.95, 0.85, 1.05][i], pan: 0.08 }); cue(k + 0.03, 'pop', { pitch: 0.9 + i * 0.18, gain: 0.32, pan: panX(TIKS[i].x) }); });
  TIKS.forEach((k, i) => cue(1.30 + i * 0.025, 'tick', { pitch: 1.2 - i * 0.1, gain: 0.18, pan: panX(k.x) }));
  cue(1.48, 'click', { gain: 0.55, pan: 0.15 });
  cue(1.60, 'creak', { dur: 0.27, gain: 0.5, pan: 0.1 });
  cue(1.70, 'whoosh', { dur: 0.2, f0: 300, f1: 5000, gain: 0.5 });
  cue(T.paper, 'impact', { gain: 0.85 }); cue(T.paper + 0.02, 'shimmer', { dur: 0.5, gain: 0.3 });

  // 2 · Kâğıt
  ARCHES.forEach((a, i) => cue(T.paper + 0.05 + a.d, 'flap', { gain: 0.42, pan: (i % 2 ? 0.25 : -0.25), pitch: 0.8 + i * 0.1 }));
  cue(T.paper + 0.06, 'zip', { dur: 0.18, gain: 0.25 });
  PLAYOUT.forEach((it, i) => {
    const tin = T.paper + 0.12 + it.d * BEAT / 4;
    cue(tin, 'flap', { gain: 0.36, pan: panX(it.x), pitch: 1 + i * 0.05 });
    cue(tin + 0.04, 'pop', { pitch: [1, 1.122, 1.26, 1.335, 1.498, 1.682, 2][i], gain: 0.3, pan: panX(it.x) });
  });
  PLAYOUT.forEach((it, i) => cue(3.36 + it.d * 0.022, 'flap', { gain: 0.16, pan: panX(it.x), pitch: 1.3 }));
  cue(SLAM_AT[0] - SLAM_DUR, 'whoosh', { dur: SLAM_DUR, f0: 1500, f1: 250, gain: 0.45 });
  cue(SLAM_AT[0], 'slam', { gain: 1.0 });

  // 3 · Reyon
  cue(T.aisle + 0.01, 'sweep', { dur: 0.32, gain: 0.3 });
  for (let i = 0; i < 6; i++) cue(T.aisle + 0.04 + i * 0.03, 'blip', { pitch: 1 + i * 0.12, gain: 0.12, pan: (i % 2 ? 0.4 : -0.4) });
  cue(OPEN_AT[1] - 0.04, 'whoosh', { dur: 0.3, f0: 400, f1: 3000, gain: 0.35, pan: -0.3 });
  cue(OPEN_AT[1] + 0.05, 'wind', { dur: T.liquid - OPEN_AT[1] - 0.05, gain: 0.5 });
  { // raf geçişleri: her raf kameranın yanından geçerken tık
    let last = -1;
    for (let k = 0; k < AISLE.NB; k++) {
      for (let tt = T.aisle; tt < T.liquid - 0.05; tt += 1 / 240) {
        if (k * AISLE.BAY - aisleZ(tt) + 1.0 < 0.6) { if (tt - last > 0.045) { cue(tt, 'tick', { pitch: 0.7 + k * 0.03, gain: 0.12, pan: k % 2 ? 0.6 : -0.6 }); last = tt; } break; }
      }
    }
  }
  cue(4.95, 'roar', { dur: T.liquid - 4.95 + 0.05, gain: 0.7 });

  // 4 · Sıvı
  cue(T.liquid, 'splash', { gain: 1.0 }); cue(T.liquid, 'impact', { gain: 0.6 });
  { const r = mulberry32(4); for (let i = 0; i < 9; i++) cue(T.liquid + 0.12 + r() * 0.45, 'drip', { pitch: 0.8 + r() * 0.9, gain: 0.25, pan: (r() - 0.5) * 1.4 }); }
  cue(T.liquid + 0.25, 'bubbles', { dur: 1.2, gain: 0.35 });
  FLOATERS.forEach((f, i) => cue(T.liquid + 0.5 + f.d * 0.06 + 0.12, 'bloop', { pitch: 1 + i * 0.15, gain: 0.4, pan: panX(f.x) }));
  cue(7.0, 'drain', { dur: 0.5, gain: 0.55 });
  cue(7.12, 'reverse', { dur: 0.38, gain: 0.4 });

  // 5 · Fizik
  cue(T.physics, 'impact', { gain: 0.7 }); cue(T.physics, 'whoosh', { dur: 0.3, f0: 6000, f1: 600, gain: 0.35 });
  { const r = mulberry32(12); PH.items.forEach((p, i) => cue(p.spawn + 0.01, 'pop', { pitch: 0.75 + r() * 0.9, gain: 0.17, pan: panX(p.x) })); }
  { // en sert çarpışmalar (birbirine en az 25 ms uzak)
    const cs = PH.contacts.filter(c => c.t < PH.SUCK).sort((a, b) => b.v - a.v), picked = [];
    for (const c of cs) { if (picked.length >= 26) break; if (picked.every(p => Math.abs(p.t - c.t) > 0.025)) picked.push(c); }
    picked.forEach(c => {
      const v = clamp(c.v / 1800);
      cue(c.t, 'thud', { gain: 0.18 + 0.32 * v, pan: panX(c.x), pitch: c.kind === 'land' ? 1 : 1.25 });
      cue(c.t + 0.004, 'crinkle', { dur: 0.08 + 0.1 * v, gain: 0.12 + 0.2 * v, pan: panX(c.x) });
    });
  }
  cue(PH.SUCK, 'reverse', { dur: 0.3, gain: 0.5 });
  cue(PH.SUCK + 0.05, 'whoosh', { dur: 0.3, f0: 500, f1: 6000, gain: 0.35 });
  cue(SLAM_AT[1], 'slam', { gain: 1.0 });

  // 6 · Tek çizgi
  cue(T.line + 0.02, 'scribble', { dur: 0.45, gain: 0.3 });
  cue(OPEN_AT[2] - 0.03, 'whoosh', { dur: 0.25, f0: 500, f1: 2500, gain: 0.25, pan: -0.3 });
  { const tr = []; let prev = penAt(0);
    for (let tt = LT.a; tt <= LT.b + 0.001; tt += 0.02) {
      const p = penAt(lineDrawn(tt)), sp = Math.hypot(p[0] - prev[0], p[1] - prev[1]) / 0.02 / 4000; prev = p;
      tr.push([+tt.toFixed(3), panX(p[0]), +clamp(sp, 0, 1.6).toFixed(3)]);
    }
    cue(LT.a, 'pen', { gain: 0.5, track: tr }); }
  LOBJ.forEach((o, i) => { const tf = LT.a + (LT.b - LT.a) * o.at; cue(tf + 0.03, 'pop', { pitch: [1.335, 1.498, 1.682, 2, 2.245][i], gain: 0.32, pan: panX(DOOR.x0 + o.end[0]) }); });
  LACC.forEach((a, i) => { const tf = LT.a + (LT.b - LT.a) * LOBJ[a.o].at + 0.08 + (i % 4) * 0.05; cue(tf, a.k === 'o' ? 'blip' : 'shine', { pitch: 1.3 + (i % 4) * 0.15, gain: a.k === 'o' ? 0.12 : 0.1, dur: 0.25, pan: panX(DOOR.x0 + a.x) }); });
  cue(LT.e0, 'zip', { dur: LT.e1 - LT.e0, gain: 0.3, down: true });

  // 7 · Tipografi
  cue(TY.t1, 'impact', { gain: 0.8 }); cue(TY.t1, 'whoosh', { dur: 0.3, f0: 300, f1: 7000, gain: 0.4 });
  cue(TY.t2, 'whoosh', { dur: 0.32, f0: 5000, f1: 700, gain: 0.45, pan: 0.5 });
  for (let i = 0; i < 13; i++) cue(TY.t2 + 0.12 + i * 0.016, 'tick', { pitch: 1 + i * 0.04, gain: 0.14, pan: (i - 6) / 9 });
  for (let i = 0; i < 10; i++) cue(TY.t3 + i * 0.034 + 0.02, 'click', { gain: 0.32, pan: (i - 4.5) / 7 });
  cue(TY.t3, 'thump', { gain: 0.6 });
  cue(TY.inv, 'impact', { gain: 0.8 }); cue(TY.inv + 0.02, 'shimmer', { dur: 0.4, gain: 0.3 });
  cue(TY.suck - 0.04, 'reverse', { dur: 0.22, gain: 0.5 });
  cue(SLAM_AT[2] - SLAM_DUR, 'whoosh', { dur: SLAM_DUR, f0: 1500, f1: 250, gain: 0.4 });
  cue(SLAM_AT[2], 'slam', { gain: 0.95 });

  // 8 · Logo
  cue(LG.m0, 'sweep', { dur: LG.m1 - LG.m0, gain: 0.35 });
  cue(LG.land, 'thump', { gain: 0.7 }); cue(LG.land + 0.01, 'sparkle', { dur: 1.0, gain: 0.4 });
  cue(LG.m1 + 0.32, 'click', { gain: 0.45 });
  cue(14.25, 'shine', { dur: 0.4, gain: 0.25 });
  cue(bt(30), 'pop', { pitch: 1.5, gain: 0.25, pan: -0.3 }); cue(bt(30.25), 'pop', { pitch: 1.68, gain: 0.25, pan: 0.3 });
  return q.sort((a, b) => a.t - b.t);
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
const off = canvas(W, H);
const g = off.getContext('2d');

function initSprites() {
  SPR.white = makeGlow('255,255,255'); SPR.blue = makeGlow('59,139,255'); SPR.amber = makeGlow('255,181,71'); SPR.dark = makeGlow('0,0,0');
  const v = g.createRadialGradient(540, 960, 520, 540, 960, 1300);
  v.addColorStop(0, 'rgba(0,8,30,0)'); v.addColorStop(1, 'rgba(0,8,30,1)');
  SPR.vig = v;
  // film greni
  const n = canvas(256, 256), nx = n.getContext('2d'), id = nx.createImageData(256, 256), r = mulberry32(3);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  nx.putImageData(id, 0, 0);
  SPR.grain = n; SPR.grainPat = g.createPattern(n, 'repeat');
  // kâğıt dokusu: lifler + benekler
  const p = canvas(512, 512), px = p.getContext('2d'), r2 = mulberry32(8);
  px.fillStyle = '#fff'; px.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { px.fillStyle = `rgba(120,90,50,${0.05 + r2() * 0.12})`; px.fillRect(r2() * 512, r2() * 512, 1 + r2() * 2, 1 + r2() * 2); }
  px.strokeStyle = 'rgba(120,90,50,0.10)'; px.lineWidth = 1;
  for (let i = 0; i < 160; i++) { const x = r2() * 512, y = r2() * 512, a = r2() * TAU, l = 6 + r2() * 22; px.beginPath(); px.moveTo(x, y); px.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); px.stroke(); }
  SPR.paperPat = g.createPattern(p, 'repeat');
  // ürün sprite'ları
  const snacks = {
    chipsO: SNACK.chips('#FFB547', '#F2801A', '#E2382B'), chipsR: SNACK.chips('#FF6A5E', '#D93A2F', '#FFD45C'), chipsB: SNACK.chips('#5A9BFF', '#1F73F0', '#FFB547'),
    choc: SNACK.choc(C.amber), choc2: SNACK.choc(C.red), roll: SNACK.roll(C.blue, C.amber), seeds: SNACK.seeds, gummy: SNACK.gummy,
    wafer: SNACK.wafer, popcorn: SNACK.popcorn, crackers: SNACK.crackers,
  };
  for (const k in snacks) SPR['s_' + k] = bake(snacks[k], 170, 24);
  for (const k in DRINK) SPR['d_' + k] = bake(DRINK[k], 215, 24);
  // sıvı katmanı için yarım çözünürlüklü tuvaller
  GOO.w = W / 2; GOO.h = H / 2;
  GOO.ca = canvas(GOO.w, GOO.h); GOO.a = GOO.ca.getContext('2d');
  GOO.cb = canvas(GOO.w, GOO.h); GOO.b = GOO.cb.getContext('2d');
  GOO.cc = canvas(GOO.w, GOO.h); GOO.c = GOO.cc.getContext('2d');
}

function renderFrame(f) {
  const t = f / FPS;
  for (let s = 0; s < SAMPLES; s++) {
    const ts = clamp(t + ((s + 0.5) / SAMPLES - 0.5) * SHUTTER / FPS, 0, DUR - 1e-4);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    draw(g, ts);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalAlpha = 1;
}
function renderAt(t) { g.setTransform(1, 0, 0, 1, 0, 0); draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0); }

window.READY = (async () => {
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt'].map(f => document.fonts.load(f, 'AaŞİığüçö0123')));
  initSprites();
  simulate();
  initLine();
  initType(g);
  initLogo();
  window.CUES = buildCues();
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
