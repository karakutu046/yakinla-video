'use strict';
/* Ölçü 4–5: Sıvı (içecek) · Fizik (atıştırmalık) */

/* ───────────────────────── ürün çizimleri (100 birimlik kutu, merkez 0,0) ───────────────────────── */
function bagPath(g, w = 34, h = 42) { g.beginPath(); g.moveTo(-w, -h); g.quadraticCurveTo(-w - 6, 0, -w, h); g.lineTo(w, h); g.quadraticCurveTo(w + 6, 0, w, -h); g.closePath(); }
function crimp(g, w, y, col) {
  g.fillStyle = col; g.beginPath(); g.moveTo(-w - 1, y - 5 * Math.sign(y));
  for (let x = -w; x <= w; x += 5) g.lineTo(x, y + ((x / 5) & 1 ? 5 : 1) * Math.sign(y));
  g.lineTo(w + 1, y - 5 * Math.sign(y)); g.closePath(); g.fill();
}
const SNACK = {
  chips: (c1, c2, c3) => g => {
    const gr = g.createLinearGradient(-36, 0, 36, 0); gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
    bagPath(g); g.fillStyle = gr; g.fill();
    g.save(); bagPath(g); g.clip();
    g.fillStyle = c3; g.fillRect(-40, -30, 80, 11);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.roundRect(-26, -36, 7, 72, 3.5); g.fill();
    g.restore();
    crimp(g, 35, -43, c2); crimp(g, 35, 43, c2);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 8, 22, 17, 0, 0, TAU); g.fill();
    g.fillStyle = '#FFD45C'; g.beginPath(); g.ellipse(-2, 8, 14, 9.5, -0.35, 0, TAU); g.fill();
    g.fillStyle = '#F2B33A'; g.beginPath(); g.ellipse(8, 11, 9, 6, 0.4, 0, TAU); g.fill();
  },
  choc: (band) => g => {
    g.fillStyle = '#C9D3E0'; g.beginPath(); g.roundRect(-48, -16, 96, 32, 4); g.fill();
    g.fillStyle = '#5A2E1A'; g.fillRect(-38, -18, 76, 36);
    g.fillStyle = band; g.fillRect(-12, -18, 30, 36);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-38, -14, 76, 5);
    g.strokeStyle = '#9AA6B6'; g.lineWidth = 2;
    for (const s of [-1, 1]) for (let y = -12; y <= 12; y += 6) { g.beginPath(); g.moveTo(s * 40, y); g.lineTo(s * 47, y); g.stroke(); }
  },
  roll: (c1, c2) => g => {
    g.fillStyle = c1; g.beginPath(); g.roundRect(-44, -20, 88, 40, 20); g.fill();
    g.fillStyle = c2; g.fillRect(-14, -20, 28, 40);
    g.fillStyle = '#F2C98A'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 40, 0, 8, 18, 0, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.roundRect(-36, -14, 72, 6, 3); g.fill();
  },
  seeds: g => {
    bagPath(g, 32, 40); g.fillStyle = '#FFFFFF'; g.fill();
    g.save(); bagPath(g, 32, 40); g.clip();
    g.fillStyle = C.red; g.fillRect(-40, -40, 80, 22);
    g.fillStyle = '#FFFFFF'; g.font = '900 13px Disp'; g.textAlign = 'center';
    const r = mulberry32(9);
    for (let i = 0; i < 9; i++) {
      const x = -20 + (i % 3) * 20 + (r() - 0.5) * 6, y = 0 + ((i / 3) | 0) * 13 + (r() - 0.5) * 4;
      g.fillStyle = '#222'; g.beginPath(); g.ellipse(x, y, 4.5, 8, r() - 0.5, 0, TAU); g.fill();
      g.strokeStyle = '#EEE'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.stroke();
    }
    g.restore();
    crimp(g, 33, -41, '#E5E5E5'); crimp(g, 33, 41, '#E5E5E5');
  },
  gummy: g => {
    bagPath(g, 33, 40); g.fillStyle = '#FF6FAE'; g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 6, 20, 0, TAU); g.fill();
    const cols = [C.red, C.green, C.amber, C.purple, C.blueL];
    for (let i = 0; i < 6; i++) { g.fillStyle = cols[i % 5]; g.beginPath(); g.arc(-9 + (i % 3) * 9, -1 + ((i / 3) | 0) * 13, 6, 0, TAU); g.fill(); }
    g.fillStyle = C.purple; g.fillRect(-34, -30, 68, 10);
    crimp(g, 34, -41, '#E6559A'); crimp(g, 34, 41, '#E6559A');
  },
  wafer: g => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(-42, -15, 84, 30, 5); g.fill();
    g.save(); g.beginPath(); g.roundRect(-42, -15, 84, 30, 5); g.clip();
    g.fillStyle = C.blue; for (let x = -60; x < 60; x += 16) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 8, 20); g.lineTo(x + 20, -20); g.lineTo(x + 12, -20); g.fill(); }
    g.fillStyle = C.amber; g.fillRect(-12, -15, 24, 30);
    g.restore();
  },
  popcorn: g => {
    g.fillStyle = '#FFF6E0';
    for (const [x, y, r] of [[-18, -34, 12], [0, -40, 13], [18, -34, 12], [-8, -46, 10], [10, -48, 10]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.save(); g.beginPath(); g.moveTo(-30, -30); g.lineTo(30, -30); g.lineTo(22, 44); g.lineTo(-22, 44); g.closePath(); g.clip();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#FFFFFF' : C.red; g.fillRect(-30 + i * 10, -32, 10, 80); }
    g.restore();
  },
  crackers: g => {
    g.fillStyle = C.amber; g.beginPath(); g.roundRect(-32, -40, 64, 80, 6); g.fill();
    g.fillStyle = C.blue; g.fillRect(-32, -28, 64, 14);
    g.fillStyle = '#F2C98A'; g.beginPath(); g.roundRect(-18, -4, 36, 32, 4); g.fill();
    g.fillStyle = '#C98A3E'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-8 + (i % 2) * 16, 4 + ((i / 2) | 0) * 14, 2.5, 0, TAU); g.fill(); }
  },
};
const DRINK = {
  water: g => {
    g.fillStyle = 'rgba(220,236,255,0.92)';
    g.beginPath(); g.moveTo(-13, -40); g.lineTo(13, -40); g.lineTo(13, -32); g.quadraticCurveTo(24, -26, 24, -12); g.lineTo(24, 42); g.quadraticCurveTo(24, 48, 18, 48); g.lineTo(-18, 48); g.quadraticCurveTo(-24, 48, -24, 42); g.lineTo(-24, -12); g.quadraticCurveTo(-24, -26, -13, -32); g.closePath(); g.fill();
    g.fillStyle = C.blue; g.beginPath(); g.roundRect(-14, -50, 28, 12, 3); g.fill();
    g.fillStyle = C.blueL; g.fillRect(-24, 2, 48, 20);
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(-17, -18, 5, 56);
  },
  juice: g => {
    g.fillStyle = C.amberD; g.beginPath(); g.moveTo(-22, -30); g.lineTo(0, -44); g.lineTo(22, -30); g.lineTo(22, 44); g.lineTo(-22, 44); g.closePath(); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(-22, -6, 44, 22);
    g.fillStyle = C.green; g.fillRect(-22, 16, 44, 8);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(8, -40); g.lineTo(14, -58); g.stroke();
  },
  ayran: g => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(-26, -30); g.lineTo(26, -30); g.lineTo(20, 38); g.lineTo(-20, 38); g.closePath(); g.fill();
    g.fillStyle = C.blue; g.beginPath(); g.roundRect(-30, -38, 60, 10, 4); g.fill();
    g.fillStyle = C.blueL; g.fillRect(-24, -6, 47, 14);
  },
  soda: g => {
    g.fillStyle = C.red; g.beginPath(); g.roundRect(-20, -36, 40, 76, 7); g.fill();
    g.fillStyle = '#C9D3E0'; g.fillRect(-17, -40, 34, 6); g.fillRect(-17, 38, 34, 5);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.moveTo(-20, 4); g.bezierCurveTo(-6, -8, 6, 16, 20, 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-14, -30, 5, 64);
  },
  soda2: g => {
    g.fillStyle = '#2FAE6B';
    g.beginPath(); g.moveTo(-8, -48); g.lineTo(8, -48); g.lineTo(8, -26); g.quadraticCurveTo(20, -18, 20, -4); g.lineTo(20, 40); g.quadraticCurveTo(20, 46, 14, 46); g.lineTo(-14, 46); g.quadraticCurveTo(-20, 46, -20, 40); g.lineTo(-20, -4); g.quadraticCurveTo(-20, -18, -8, -26); g.closePath(); g.fill();
    g.fillStyle = '#C9D3E0'; g.fillRect(-9, -54, 18, 8);
    g.fillStyle = '#FFFFFF'; g.fillRect(-20, 6, 40, 18);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-14, -6, 4, 44);
  },
};

/* ───────────────────────── Ölçü 4: SIVI — içecek ───────────────────────── */
const LQ = { top: 474 };
function waterLevel(t) {
  const t0 = T.liquid;
  const rise = E.outCubic(prog(t, t0 + 0.08, t0 + 0.95));
  const drain = E.inCubic(prog(t, 7.0, 7.47));
  return lerp(lerp(1990, LQ.top, rise), 2010, drain);
}
function surfY(x, t) {
  const A = 1 + 1.7 * Math.exp(-(t - T.liquid) * 2.4) + 1.2 * prog(t, 7.0, 7.3);
  return waterLevel(t) + A * (Math.sin(x * 0.011 + t * 5.2) * 15 + Math.sin(x * 0.026 - t * 7.4) * 7 + Math.sin(x * 0.0047 + t * 2.3) * 11);
}
const BLOBS = (() => {
  const r = mulberry32(31), a = [];
  for (let i = 0; i < 22; i++) {
    const x = DOOR.x0 + 40 + r() * (DOOR.w - 80), y = DOOR.y0 + 100 + r() * (DOOR.h - 160);
    const ang = Math.atan2(y - 1040, x - 540) + (r() - 0.5) * 0.6;
    const sp = 1100 + r() * 1700;
    a.push({ x, y, vx: Math.cos(ang) * sp * 1.3, vy: Math.sin(ang) * sp - 900, r: 50 + r() * 85, d: r() * 0.1 });
  }
  for (let i = 0; i < 56; i++) {
    const x = 540 + (r() - 0.5) * 460, y = DOOR.y0 + r() * DOOR.h;
    const ang = -Math.PI / 2 + (r() - 0.5) * 2.8, sp = 1300 + r() * 2000;
    a.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 7 + r() * 13, d: 0.02 + r() * 0.15, drop: true });
  }
  return a;
})();
const GOO = {};
function waterLayer(g, t) {
  const t0 = T.liquid, s = 0.5;
  const gx = GOO.a, gy = GOO.b;
  gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, GOO.w, GOO.h);
  gx.setTransform(s, 0, 0, s, 0, 0);
  gx.fillStyle = '#fff';
  // su gövdesi
  gx.beginPath(); gx.moveTo(-40, H + 60);
  for (let x = -40; x <= W + 40; x += 24) gx.lineTo(x, surfY(x, t));
  gx.lineTo(W + 40, H + 60); gx.closePath(); gx.fill();
  // kapı boşluğundaki su (taşmanın kaynağı)
  if (t < t0 + 1.0) { const b = 14 * E.outBack(clamp((t - t0) / 0.2)); gx.beginPath(); gx.roundRect(DOOR.x0 - b, DOOR.y0 - b, DOOR.w + 2 * b, DOOR.h + 2 * b, 30); gx.fill(); }
  // fışkıran damlalar
  for (const b of BLOBS) {
    const dt = t - t0 - b.d; if (dt < 0) continue;
    const x = b.x + b.vx * dt, y = b.y + b.vy * dt + 0.5 * 3600 * dt * dt;
    if (y - b.r > surfY(x, t) + 40 || dt > 1.1) continue;
    const r = b.r * (b.drop ? 1 : 0.6 + 0.4 * E.outCubic(clamp(dt / 0.18)));
    gx.beginPath(); gx.arc(x, y, r, 0, TAU); gx.fill();
  }
  // yapışkan birleşme (SVG goo filtresi): önce beyaz köpük kenarı, üstüne suyun kendisi
  const pass = (c, filter, fill) => {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, GOO.w, GOO.h);
    c.filter = filter; c.drawImage(GOO.ca, 0, 0); c.filter = 'none';
    c.globalCompositeOperation = 'source-in'; c.fillStyle = fill; c.fillRect(0, 0, GOO.w, GOO.h);
    c.globalCompositeOperation = 'source-over';
  };
  const L = waterLevel(t) * s;
  const gr = gy.createLinearGradient(0, Math.min(L, 900) - 40, 0, GOO.h);
  gr.addColorStop(0, 'rgba(72,148,255,0.9)'); gr.addColorStop(0.3, 'rgba(34,112,236,0.9)'); gr.addColorStop(1, 'rgba(10,63,158,0.95)');
  pass(GOO.c, 'url(#gooRim)', 'rgba(255,255,255,0.95)');
  pass(gy, 'url(#goo)', gr);
  // taşma anında suyun içinde dışa akan parlak çizgiler ve halkalar (yalnızca suyun üstüne)
  const bk = 1 - prog(t, t0, t0 + 0.7);
  if (bk > 0 && t >= t0) {
    const dt = t - t0, cx = 540 * s, cy = 1010 * s, r = mulberry32(19);
    gy.save(); gy.globalCompositeOperation = 'source-atop'; gy.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const a = r() * TAU, sp = 500 + r() * 700, r0 = (40 + dt * sp + r() * 80) * s, len = (60 + r() * 120) * s;
      gy.strokeStyle = `rgba(255,255,255,${0.55 * bk})`; gy.lineWidth = (4 + r() * 6) * s;
      gy.beginPath(); gy.arc(cx, cy, r0, a, a + len / r0); gy.stroke();
    }
    for (let j = 0; j < 3; j++) {
      const p = prog(t, t0 + j * 0.1, t0 + j * 0.1 + 0.6); if (p <= 0 || p >= 1) continue;
      gy.strokeStyle = `rgba(255,255,255,${0.45 * (1 - p)})`; gy.lineWidth = 8 * s * (1 - p) + 1;
      gy.beginPath(); gy.ellipse(cx, cy, (30 + 520 * E.outCubic(p)) * s, (30 + 700 * E.outCubic(p)) * s, 0, 0, TAU); gy.stroke();
    }
    gy.restore();
  }
  g.drawImage(GOO.cc, 0, 0, W, H);
  g.drawImage(GOO.cb, 0, 0, W, H);
}
const BUBBLES = (() => { const r = mulberry32(17), a = []; for (let i = 0; i < 60; i++) a.push({ x: 60 + r() * 960, y0: 1100 + r() * 1000, sp: 260 + r() * 420, r: 4 + r() * 14, ph: r() * TAU, d: r() * 0.6 }); return a; })();
const FLOATERS = [
  { k: 'water', x: 105, d: 0 }, { k: 'juice', x: 265, d: 1 }, { k: 'soda2', x: 815, d: 2 }, { k: 'ayran', x: 975, d: 3 },
];
function sceneLiquid(g, t) {
  const t0 = T.liquid;
  // altta oda (koridor odası). Su çekilince kapının ardında bir sonraki dünyanın ışığı belirir.
  const S = STY.aisle, th = doorTh(t);
  drawRoom(g, S, t, { gridP: 1 });
  inDoorway(g, () => {
    if (t < 6.8) { g.fillStyle = C.blueD; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h); }
    else burstInterior(g, t);
  });
  drawRoomFront(g, S, t, { spill: t > 7.2 ? 0.6 * prog(t, 7.2, 7.45) : 0, spillCol: '#FFF1D2' });
  drawDoor(g, S, th, 0, 0, { noShadow: true });
  // yüzen içecekler (suyun altında kalan kısımları suyla boyanır)
  for (const f of FLOATERS) {
    const tin = t0 + 0.5 + f.d * 0.06;
    const q = spring(t - tin, 1.4, 5); if (q <= 0) continue;
    const y = surfY(f.x, t) + 6 + (1 - q) * 380;
    const slope = (surfY(f.x + 10, t) - surfY(f.x - 10, t)) / 20;
    const spr = SPR['d_' + f.k];
    sprite(g, spr, f.x, y, 1, Math.atan(slope) * 0.9 + 0.12 * Math.sin(t * 3 + f.d), 1);
  }
  waterLayer(g, t);
  // su altı: ışık huzmeleri, kostik, kabarcıklar
  const L = waterLevel(t);
  if (L < H) {
    g.save();
    g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 30) g.lineTo(x, surfY(x, t) + 8); g.lineTo(W, H); g.closePath(); g.clip();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 190 + Math.sin(t * 1.3 + i) * 40;
      const gr = g.createLinearGradient(0, L, 0, L + 1100);
      gr.addColorStop(0, 'rgba(255,255,255,0.13)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; poly(g, [[x - 40, L], [x + 40, L], [x + 220, L + 1200], [x + 60, L + 1200]]); g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.09)'; g.lineWidth = 3;
    for (let j = 0; j < 12; j++) {
      const y0 = L + 70 + j * 120;
      g.beginPath();
      for (let x = 0; x <= W; x += 20) g.lineTo(x, y0 + Math.sin(x * 0.02 + t * 3 + j) * 14 + Math.sin(x * 0.047 - t * 4.4 + j * 2) * 7);
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    for (const b of BUBBLES) {
      const dt = t - t0 - 0.25 - b.d; if (dt < 0) continue;
      const y = b.y0 - b.sp * dt, x = b.x + Math.sin(dt * 6 + b.ph) * 12;
      if (y < surfY(x, t) + b.r) continue;
      g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(x, y, b.r, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x - b.r * 0.35, y - b.r * 0.35, b.r * 0.25, 0, TAU); g.fill();
    }
    g.restore();
    // yüzey çizgisi
    g.save(); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 6; g.lineJoin = 'round';
    g.beginPath(); for (let x = -20; x <= W + 20; x += 16) g.lineTo(x, surfY(x, t)); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3;
    g.beginPath(); for (let x = -20; x <= W + 20; x += 16) g.lineTo(x, surfY(x, t) + 18 + Math.sin(x * 0.05 + t * 6) * 4); g.stroke();
    g.restore();
  }
  // "İçecek" etiketi su yüzeyinde yüzer
  const yb = surfY(540, t) - 62;
  drawLabel(g, t, '03', 'İçecek', t0 + 0.7, 7.02, '#FFFFFF', '#DCEAFF', yb - 384);
}

/* ───────────────────────── Ölçü 5: FİZİK — atıştırmalık ───────────────────────── */
const SNACK_KINDS = [
  { k: 'chipsO', r: 64 }, { k: 'choc', r: 50 }, { k: 'seeds', r: 61 }, { k: 'chipsR', r: 64 }, { k: 'roll', r: 50 },
  { k: 'gummy', r: 61 }, { k: 'popcorn', r: 63 }, { k: 'chipsB', r: 64 }, { k: 'wafer', r: 46 }, { k: 'crackers', r: 61 }, { k: 'choc2', r: 50 },
];
const PH = { hz: 240, frames: [], items: [], contacts: [], FLOOR: H - 10, t0: T.physics, SUCK: 8.93 };
function simulate() {
  const r = mulberry32(77), N = 36, G = 6400, dt = 1 / 960, sub = 960 / PH.hz;
  const it = [];
  for (let i = 0; i < N; i++) {
    const kd = SNACK_KINDS[i % SNACK_KINDS.length];
    const side = i % 2 ? 1 : -1;
    it.push({ k: kd.k, r: kd.r, m: kd.r * kd.r, spawn: PH.t0 + 0.01 + i * 0.026,
      x: 540 + (r() - 0.5) * 300, y: 900 + (r() - 0.5) * 380,
      vx: side * (240 + r() * 1100), vy: -(750 + r() * 1250), a: r() * TAU, w: (r() - 0.5) * 16, on: false, hit: false });
  }
  PH.items = it;
  const T1 = PH.SUCK + 0.05;
  let t = PH.t0, step = 0;
  while (t <= T1) {
    for (const p of it) {
      if (!p.on && t >= p.spawn) p.on = true;
      if (!p.on) continue;
      p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.w * dt;
    }
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 0; i < N; i++) {
        const a = it[i]; if (!a.on) continue;
        for (let j = i + 1; j < N; j++) {
          const b = it[j]; if (!b.on) continue;
          const dx = b.x - a.x, dy = b.y - a.y, mn = a.r + b.r, d2 = dx * dx + dy * dy;
          if (d2 >= mn * mn || d2 < 1e-6) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = mn - d, ma = a.m, mb = b.m;
          a.x -= nx * pen * mb / (ma + mb) * 0.8; a.y -= ny * pen * mb / (ma + mb) * 0.8;
          b.x += nx * pen * ma / (ma + mb) * 0.8; b.y += ny * pen * ma / (ma + mb) * 0.8;
          const vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vr < 0) {
            const J = -(1 + 0.25) * vr / (1 / ma + 1 / mb);
            a.vx -= J * nx / ma; a.vy -= J * ny / ma; b.vx += J * nx / mb; b.vy += J * ny / mb;
            const tx = -ny, ty = nx, vt = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty;
            const Jt = -vt * 0.15 / (1 / ma + 1 / mb);
            a.vx -= Jt * tx / ma; a.vy -= Jt * ty / ma; b.vx += Jt * tx / mb; b.vy += Jt * ty / mb;
            a.w += vt * 0.002; b.w -= vt * 0.002;
            if (iter === 0 && vr < -650) PH.contacts.push({ t, x: (a.x + b.x) / 2, v: -vr, kind: 'hit' });
          }
        }
      }
      for (const p of it) {
        if (!p.on) continue;
        if (p.y + p.r > PH.FLOOR) {
          p.y = PH.FLOOR - p.r;
          if (p.vy > 0) {
            if (iter === 0 && p.vy > 450) PH.contacts.push({ t, x: p.x, v: p.vy, kind: p.hit ? 'bounce' : 'land' });
            p.hit = true;
            p.vy = -p.vy * 0.3; p.vx *= 0.82; p.w = lerp(p.w, p.vx / p.r, 0.6);
          }
        }
        if (p.x < p.r) { p.x = p.r; if (p.vx < 0) p.vx = -p.vx * 0.4; }
        if (p.x > W - p.r) { p.x = W - p.r; if (p.vx > 0) p.vx = -p.vx * 0.4; }
      }
    }
    for (const p of it) if (p.on) { p.w *= 0.9985; if (p.y + p.r >= PH.FLOOR - 1) p.vx *= 0.995; }
    if (step % sub === 0) PH.frames.push(it.map(p => p.on ? [p.x, p.y, p.a] : null));
    t += dt; step++;
  }
}
function simAt(i, t) {
  const f = (t - PH.t0) * PH.hz, k = Math.floor(f), u = f - k;
  const A = PH.frames[clamp(k, 0, PH.frames.length - 1)], B = PH.frames[clamp(k + 1, 0, PH.frames.length - 1)];
  const a = A && A[i], b = B && B[i];
  if (!a) return b;
  if (!b) return a;
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
}
// Kapının ardındaki ışık patlaması (sunburst)
function burstInterior(g, t) {
  g.fillStyle = '#FFF1D2'; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h);
  g.save(); g.translate(540, 1010); g.rotate(t * 0.6);
  g.fillStyle = 'rgba(255,181,71,0.55)';
  for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1100); g.lineTo(90, -1100); g.closePath(); g.fill(); }
  g.restore();
  glow(g, SPR.white, 540, 1010, 420, 1);
}
function scenePhysics(g, t) {
  const S = STY.physics, t0 = T.physics;
  drawRoom(g, S, t);
  const th = doorTh(t);
  if (th > 0.001) inDoorway(g, () => burstInterior(g, t));
  drawRoomFront(g, S, t, { spill: clamp(th / 0.5) * 0.7, spillCol: '#FFF1D2' });
  drawDoor(g, S, th, 0, 0);
  // emme sırası: kapıya yakın olan önce
  const order = PH.items.map((p, i) => [i, simAt(i, PH.SUCK)]).filter(a => a[1]).sort((a, b) => Math.hypot(a[1][0] - 540, a[1][1] - 1010) - Math.hypot(b[1][0] - 540, b[1][1] - 1010));
  const rank = {}; order.forEach(([i], k) => { rank[i] = k; });
  // en arkadakiler önce çizilir (y'si küçük olan)
  const vis = [];
  PH.items.forEach((p, i) => {
    if (t < p.spawn) return;
    let s = simAt(i, Math.min(t, PH.SUCK)); if (!s) return;
    let [x, y, a] = s, sc = lerp(0.5, 1, E.outBack(clamp((t - p.spawn) / 0.16)));
    if (t > PH.SUCK && rank[i] != null) {
      const ts = PH.SUCK + rank[i] * 0.0062, q = E.inCubic(prog(t, ts, ts + 0.2));
      x = lerp(x, 540, q); y = lerp(y, 1010, q); sc *= 1 - 0.9 * q; a += q * 5;
      if (q >= 1) return;
    }
    vis.push([y, p.k, x, y, a, sc]);
  });
  vis.sort((a, b) => a[0] - b[0]);
  for (const [, k, x, y, a, sc] of vis) {
    g.save(); g.globalAlpha = 0.22; g.translate(x, PH.FLOOR - 2); g.scale(1, 0.18); glow(g, SPR.dark, 0, 0, 80 * sc, 1); g.restore();
    sprite(g, SPR['s_' + k], x, y, sc, a, 1);
  }
  drawLabel(g, t, '04', 'Atıştırmalık', t0 + 0.16, SLAM_AT[1] - 0.02, C.ink, S.sub);
}
