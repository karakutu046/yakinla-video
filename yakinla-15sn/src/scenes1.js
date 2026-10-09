'use strict';
/* Ölçü 1–3: Kapı · Kâğıt kesme · Sonsuz reyon */

/* ───────────────────────── ortak: kapı açısı ve kategori etiketi ───────────────────────── */
const OPEN = 1.62;                       // tam açık (~93°)
const OPEN_AT = [T.paper, T.aisle + BEAT / 2, T.line + BEAT / 2];
const SLAM_AT = [T.aisle, T.line, T.logo];
const SLAM_DUR = 0.19;
function doorTh(t) {
  const rebound = dt => 0.05 * Math.abs(wobble(dt, 4.5, 11));
  const openFrom = (t0, from) => lerp(from, OPEN, spring(t - t0, 1.25, 5.2));
  if (t < T.paper) return 0.13 * E.inOutCubic(prog(t, 1.60, 1.84));
  if (t < SLAM_AT[0] - SLAM_DUR) return openFrom(T.paper, 0.13);
  if (t < SLAM_AT[0]) return openFrom(T.paper, 0.13) * (1 - E.inQuad(prog(t, SLAM_AT[0] - SLAM_DUR, SLAM_AT[0])));
  if (t < OPEN_AT[1]) return rebound(t - SLAM_AT[0]);
  if (t < SLAM_AT[1] - SLAM_DUR) return openFrom(OPEN_AT[1], 0);
  if (t < SLAM_AT[1]) return OPEN * (1 - E.inQuad(prog(t, SLAM_AT[1] - SLAM_DUR, SLAM_AT[1])));
  if (t < OPEN_AT[2]) return rebound(t - SLAM_AT[1]);
  if (t < SLAM_AT[2] - SLAM_DUR) return openFrom(OPEN_AT[2], 0);
  if (t < SLAM_AT[2]) return OPEN * (1 - E.inQuad(prog(t, SLAM_AT[2] - SLAM_DUR, SLAM_AT[2])));
  return rebound(t - SLAM_AT[2]);
}
const KNOCKS = [bt(1), bt(1.5), bt(2)];
function doorZ(t) {
  let z = 0;
  for (const k of KNOCKS) { const d = t - k; if (d >= 0 && d < 0.7) z -= 11 * Math.exp(-d * 13) * Math.cos(d * TAU * 9); }
  return z;
}
const leverAng = t => -0.55 * E.inOutCubic(prog(t, 1.48, 1.62)) * (1 - E.inOutCubic(prog(t, 2.3, 2.6)));

// Üstteki kategori etiketi: küçük sıra numarası + büyük başlık
function drawLabel(g, t, idx, txt, t0, t1, col, sub, yOff = 0) {
  const p = prog(t, t0, t0 + 0.5), q = prog(t, t1 - 0.28, t1);
  if (p <= 0 || q >= 1) return;
  const o = { s: 96, w: 800, c: col, ls: -1 };
  o.s = Math.min(o.s, fitSize(g, txt, o, 940));
  slotText(g, txt, 540, 384 + yOff, o, p, q, 0.035);
  if (idx) {
    const a = E.outCubic(prog(t, t0 + 0.05, t0 + 0.45)) * (1 - E.inCubic(q));
    g.save(); g.globalAlpha *= a;
    text(g, idx, 540, 250 + yOff, { s: 34, w: 700, f: 'Txt', c: sub, ls: 8 });
    g.strokeStyle = sub; g.lineWidth = 3; g.lineCap = 'round';
    const L = 70 * a;
    g.beginPath(); g.moveTo(540 - 62, 238 + yOff); g.lineTo(540 - 62 - L, 238 + yOff); g.moveTo(540 + 62, 238 + yOff); g.lineTo(540 + 62 + L, 238 + yOff); g.stroke();
    g.restore();
  }
}

/* ───────────────────────── Ölçü 1: KAPI ───────────────────────── */
const TIKS = [
  { t: KNOCKS[0], x: 230, y: 640, s: 176, r: -0.16, kind: 0 },
  { t: KNOCKS[1], x: 850, y: 930, s: 196, r: 0.13, kind: 1 },
  { t: KNOCKS[2], x: 270, y: 1300, s: 250, r: -0.07, kind: 2 },
];
const KNOCK_PT = [590, 990];
const MOTES = (() => { const r = mulberry32(5), a = []; for (let i = 0; i < 46; i++) a.push({ x: 120 + r() * 840, y: 900 + r() * 900, r: 1.2 + r() * 2.8, sp: 6 + r() * 16, ph: r() * TAU }); return a; })();

function lightLeak(g, t, I) {
  if (I <= 0) return;
  const p = E.inOutCubic(prog(t, 0.0, 0.42));
  const half = s => [[540, FLOOR_Y - 2], [s < 0 ? DOOR.x0 + 2 : DOOR.x1 - 2, FLOOR_Y - 2], [s < 0 ? DOOR.x0 + 2 : DOOR.x1 - 2, DOOR.y0 + 2], [540, DOOR.y0 + 2]];
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [lw, col, blur] of [[16, 'rgba(255,170,60,0.35)', 40], [6, 'rgba(255,214,150,0.9)', 18], [2.5, 'rgba(255,250,235,1)', 0]]) {
    g.strokeStyle = col; g.lineWidth = lw; g.shadowColor = 'rgba(255,170,60,0.9)'; g.shadowBlur = blur;
    g.globalAlpha = I;
    strokeTrim(g, half(-1), 0, p); strokeTrim(g, half(1), 0, p);
  }
  g.shadowBlur = 0;
  // kapı altından zemine düşen ışık
  const fp = E.outCubic(prog(t, 0.05, 0.5));
  g.globalAlpha = I * fp;
  g.save(); g.translate(540, FLOOR_Y + 6); g.scale(1, 0.16); glow(g, SPR.amber, 0, 0, 330, 0.9); g.restore();
  g.restore();
}

function sceneKnock(g, t) {
  const S = STY.knock;
  drawRoom(g, S, t);
  // duvarda zayıf ışık süzmesi
  glow(g, SPR.amber, 540, FLOOR_Y, 700, 0.10 + 0.05 * kick(t - KNOCKS[2], 3));
  const th = doorTh(t);
  // aralanan kapıdan taşan ışık
  if (th > 0.001) inDoorway(g, () => {
    g.fillStyle = '#FFF4DC'; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h);
    glow(g, SPR.white, 540, 1000, 600, 1);
  });
  drawRoomFront(g, S, t, { spill: clamp(th / 0.13) * 0.9, spillCol: '#FFD48A' });
  // toz zerreleri (ışıkta parlar)
  g.save(); g.fillStyle = '#FFE3B8';
  for (const m of MOTES) {
    const y = m.y - t * m.sp, x = m.x + Math.sin(t * 1.3 + m.ph) * 10;
    const lit = clamp(1 - Math.abs(y - FLOOR_Y) / 420) * clamp(1 - Math.abs(x - 540) / 460) * E.outCubic(prog(t, 0.1, 0.8));
    if (lit <= 0.01) continue;
    g.globalAlpha = lit * 0.75; g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill();
  }
  g.restore();
  drawDoor(g, S, th, doorZ(t), leverAng(t), { peepGlow: 0.3 + 0.7 * clamp(th / 0.13) });
  // çatlaktan sızan ışık hüzmesi
  if (th > 0.001) {
    const e0 = doorPt(DOOR.w, 0, th, doorZ(t)), e1 = doorPt(DOOR.w, DOOR.h, th, doorZ(t));
    g.save(); g.globalCompositeOperation = 'lighter';
    const k = clamp(th / 0.13);
    const gr = g.createLinearGradient(DOOR.x1, 0, DOOR.x1 + 420, 0);
    gr.addColorStop(0, `rgba(255,196,110,${0.6 * k})`); gr.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gr; poly(g, [e0, [DOOR.x1, DOOR.y0], [DOOR.x1 + 520, DOOR.y0 - 260], [DOOR.x1 + 520, FLOOR_Y + 380], [DOOR.x1, FLOOR_Y], e1]); g.fill();
    g.restore();
  }
  const I = 1 - 0.85 * clamp(th / 0.13);
  lightLeak(g, t, (0.75 + 0.25 * Math.sin(t * 9) * 0.3 + 0.35 * KNOCKS.reduce((a, k) => a + kick(t - k, 6), 0)) * Math.max(I, 0.15));
  // vuruş halkaları
  g.save(); g.lineCap = 'round';
  for (const k of KNOCKS) for (let j = 0; j < 3; j++) {
    const p = prog(t, k + j * 0.05, k + j * 0.05 + 0.55);
    if (p <= 0 || p >= 1) continue;
    g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - p)})`; g.lineWidth = 7 * (1 - p) + 1.5;
    g.beginPath(); g.arc(KNOCK_PT[0], KNOCK_PT[1], 30 + 330 * E.outCubic(p), 0, TAU); g.stroke();
  }
  g.restore();
  // TIK! TIK! TIK!
  for (const k of TIKS) {
    const dt = t - k.t; if (dt < 0) continue;
    const sIn = spring(dt, 2.4, 9), sOut = 1 - E.inBack(prog(t, 1.30 + k.kind * 0.025, 1.44 + k.kind * 0.025));
    const sc = sIn * sOut; if (sc <= 0.01) continue;
    g.save(); g.translate(k.x, k.y); g.rotate(k.r + 0.35 * (1 - sIn)); g.scale(sc, sc);
    const o = { s: k.s, w: 900 };
    setFont(g, o); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (k.kind === 1) { g.lineWidth = 11; g.strokeStyle = C.amber; g.lineJoin = 'round'; g.strokeText('TIK', 0, 0); }
    else {
      g.fillStyle = k.kind === 2 ? C.amber : '#fff';
      g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
      g.fillText('TIK', 0, 0);
    }
    g.restore();
  }
  drawLabel(g, t, '', 'Kim o?', bt(3), T.paper + 0.12, '#fff', S.sub);
}

/* ───────────────────────── Ölçü 2: KÂĞIT — süt & kahvaltılık ───────────────────────── */
const PSHADOW = (g, k = 1) => { g.shadowColor = 'rgba(120,55,0,0.30)'; g.shadowBlur = 14 * k; g.shadowOffsetX = 5 * k; g.shadowOffsetY = 8 * k; };
const PITEMS = {
  milk(g) {
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.moveTo(-44, 0); g.lineTo(-44, -118); g.quadraticCurveTo(-44, -148, -21, -160); g.lineTo(-21, -182); g.lineTo(21, -182); g.lineTo(21, -160); g.quadraticCurveTo(44, -148, 44, -118); g.lineTo(44, 0); g.closePath(); g.fill();
    g.fillStyle = C.blue; g.beginPath(); g.roundRect(-25, -204, 50, 26, 6); g.fill();
    g.fillRect(-44, -104, 88, 52);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -96); g.bezierCurveTo(10, -84, 12, -70, 0, -64); g.bezierCurveTo(-12, -70, -10, -84, 0, -96); g.fill();
  },
  cheese(g) {
    g.fillStyle = '#FFD45C'; g.beginPath(); g.moveTo(-72, 0); g.lineTo(72, 0); g.lineTo(72, -74); g.lineTo(-72, -28); g.closePath(); g.fill();
    g.fillStyle = '#FFE79A'; g.beginPath(); g.moveTo(-72, -28); g.lineTo(72, -74); g.lineTo(52, -90); g.lineTo(-84, -38); g.closePath(); g.fill();
    g.shadowColor = 'transparent'; g.fillStyle = '#F2B33A';
    for (const [x, y, r] of [[-38, -14, 9], [4, -26, 12], [44, -14, 8], [42, -50, 7], [-10, -8, 5]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  },
  tea(g) {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, -8, 64, 13, 0, 0, TAU); g.fill();
    g.fillStyle = '#FBE7D0';
    g.beginPath(); g.moveTo(-31, -132); g.lineTo(31, -132); g.bezierCurveTo(30, -104, 12, -92, 15, -74); g.bezierCurveTo(18, -56, 31, -42, 27, -16); g.lineTo(-27, -16); g.bezierCurveTo(-31, -42, -18, -56, -15, -74); g.bezierCurveTo(-12, -92, -30, -104, -31, -132); g.closePath(); g.fill();
    g.shadowColor = 'transparent';
    g.save(); g.clip();
    g.fillStyle = '#C8461B'; g.fillRect(-40, -116, 80, 110);
    g.fillStyle = '#E8702E'; g.fillRect(-40, -116, 80, 10);
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.65)'; g.beginPath(); g.ellipse(-14, -100, 4, 14, 0.25, 0, TAU); g.fill();
  },
  honey(g) {
    g.fillStyle = C.amberD; g.beginPath(); g.roundRect(-50, -112, 100, 112, 18); g.fill();
    g.fillStyle = C.coral; g.beginPath(); g.roundRect(-55, -134, 110, 28, 7); g.fill();
    g.fillStyle = C.cream; g.beginPath(); g.roundRect(-36, -84, 72, 54, 10); g.fill();
    g.shadowColor = 'transparent'; g.strokeStyle = C.amberD; g.lineWidth = 5;
    g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(Math.cos(a) * 15, -57 + Math.sin(a) * 15); } g.closePath(); g.stroke();
  },
  eggs(g) {
    for (const [x, c] of [[-52, '#FFF5E6'], [0, '#F1CB98'], [52, '#FFF5E6']]) {
      g.fillStyle = c; g.beginPath(); g.ellipse(x, -62, 27, 35, 0, 0, TAU); g.fill();
    }
    g.fillStyle = C.blueL; g.beginPath(); g.moveTo(-84, 0); g.lineTo(-84, -44);
    for (let i = 0; i < 3; i++) { const x = -84 + i * 56; g.quadraticCurveTo(x + 28, -20, x + 56, -44); }
    g.lineTo(84, 0); g.closePath(); g.fill();
  },
  bread(g) {
    g.fillStyle = '#E39A4E';
    g.beginPath(); g.moveTo(-86, 0); g.bezierCurveTo(-94, -64, -46, -96, 0, -96); g.bezierCurveTo(46, -96, 94, -64, 86, 0); g.closePath(); g.fill();
    g.fillStyle = '#F2B66C';
    g.beginPath(); g.moveTo(-70, -30); g.bezierCurveTo(-72, -70, -36, -86, 0, -86); g.bezierCurveTo(36, -86, 72, -70, 70, -30); g.bezierCurveTo(30, -44, -30, -44, -70, -30); g.fill();
    g.shadowColor = 'transparent'; g.strokeStyle = '#FDE3B4'; g.lineWidth = 7; g.lineCap = 'round';
    for (const x of [-38, 0, 38]) { g.beginPath(); g.moveTo(x - 13, -48); g.lineTo(x + 13, -72); g.stroke(); }
  },
  olives(g) {
    const r = mulberry32(3);
    for (let i = 0; i < 9; i++) {
      const x = -48 + (i % 5) * 24 + (i >= 5 ? 12 : 0), y = i >= 5 ? -62 : -44;
      g.fillStyle = i % 3 === 0 ? '#5E7A2A' : '#2C2A2A';
      g.beginPath(); g.ellipse(x, y, 15, 19, r() - 0.5, 0, TAU); g.fill();
    }
    g.shadowColor = 'transparent'; g.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 9; i++) { const x = -48 + (i % 5) * 24 + (i >= 5 ? 12 : 0), y = i >= 5 ? -62 : -44; g.beginPath(); g.arc(x - 5, y - 7, 3.5, 0, TAU); g.fill(); }
    PSHADOW(g);
    g.fillStyle = C.blue; g.beginPath(); g.moveTo(-72, -36); g.lineTo(72, -36); g.bezierCurveTo(68, -6, 40, 0, 0, 0); g.bezierCurveTo(-40, 0, -68, -6, -72, -36); g.fill();
    g.fillStyle = C.blueL; g.fillRect(-72, -40, 144, 8);
  },
};
const PLAYOUT = [
  { k: 'milk', x: 362, y: 990, d: 0 }, { k: 'cheese', x: 478, y: 990, d: 1 }, { k: 'tea', x: 600, y: 990, d: 2 }, { k: 'honey', x: 712, y: 990, d: 3 },
  { k: 'eggs', x: 385, y: 1262, d: 4 }, { k: 'bread', x: 560, y: 1262, d: 5 }, { k: 'olives', x: 700, y: 1262, d: 6 },
];
const PBITS = (() => {
  const r = mulberry32(21), a = [];
  const spots = [[110, 560], [960, 600], [80, 980], [1000, 1060], [150, 1360], [940, 1380], [200, 760], [880, 760], [70, 1200], [1010, 1250], [130, 470], [950, 470]];
  spots.forEach(([x, y], i) => a.push({ x, y, kind: i % 4, col: [C.coral, C.blue, '#FFFFFF', C.amberD][(i * 7) % 4], s: 18 + r() * 16, rot: r() * TAU, sp: 0.5 + r(), ph: r() * TAU, d: r() * 0.4 }));
  return a;
})();
function paperBit(g, b) {
  g.fillStyle = b.col; g.strokeStyle = b.col; g.lineCap = 'round';
  if (b.kind === 0) { g.beginPath(); g.arc(0, 0, b.s * 0.6, 0, TAU); g.fill(); }
  else if (b.kind === 1) { g.beginPath(); g.moveTo(0, -b.s * 0.7); g.lineTo(b.s * 0.65, b.s * 0.5); g.lineTo(-b.s * 0.65, b.s * 0.5); g.closePath(); g.fill(); }
  else if (b.kind === 2) { g.fillRect(-b.s * 0.5, -b.s * 0.5, b.s, b.s); }
  else { g.lineWidth = 8; g.beginPath(); g.moveTo(-b.s, 0); g.bezierCurveTo(-b.s * 0.5, -b.s * 0.7, b.s * 0.5, b.s * 0.7, b.s, 0); g.stroke(); }
}
function paperInterior(g, t) {
  const t0 = T.paper;
  const bg = g.createLinearGradient(0, DOOR.y0, 0, DOOR.y1);
  bg.addColorStop(0, '#FFE2A8'); bg.addColorStop(1, '#FFB547');
  g.fillStyle = bg; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h);
  // kâğıt güneş
  const sq = spring(t - t0 - 0.02, 1.6, 6);
  g.save(); PSHADOW(g, 1.4); g.fillStyle = '#FFF3DD'; g.beginPath(); g.arc(540, 820, 150 * sq, 0, TAU); g.fill(); g.restore();
  // arka tepe katmanları
  for (const [y, col, d] of [[1150, '#FFC97A', 0.04], [1340, '#F7A040', 0.08]]) {
    const q = spring(t - t0 - d, 1.6, 6); if (q <= 0) continue;
    g.save(); g.translate(540, DOOR.y1); g.scale(1, q); g.translate(-540, -DOOR.y1);
    PSHADOW(g, 1.2); g.fillStyle = col;
    g.beginPath(); g.moveTo(DOOR.x0 - 20, DOOR.y1);
    for (let x = DOOR.x0 - 20; x <= DOOR.x1 + 20; x += 10) g.lineTo(x, y + Math.sin(x * 0.018 + d * 40) * 26);
    g.lineTo(DOOR.x1 + 20, DOOR.y1); g.closePath(); g.fill();
    g.restore();
  }
  // raflar
  for (const [y, d] of [[990, 0.05], [1262, 0.09]]) {
    const q = E.outBack(prog(t, t0 + d, t0 + d + 0.3)) * (1 - E.inCubic(prog(t, 3.50, 3.62)));
    if (q <= 0) continue;
    g.save(); PSHADOW(g); g.fillStyle = '#FFFFFF';
    const w = DOOR.w * q; g.fillRect(540 - w / 2, y, w, 20); g.restore();
  }
  // ürünler: pop-up kitap gibi tabandan katlanarak kalkar
  for (const it of PLAYOUT) {
    const tin = t0 + 0.12 + it.d * BEAT / 4;
    const q = spring(t - tin, 1.7, 6.5) * (1 - E.inBack(prog(t, 3.36 + it.d * 0.022, 3.50 + it.d * 0.022)));
    if (q <= 0.005) continue;
    g.save();
    g.translate(it.x, it.y);
    g.rotate(0.035 * Math.sin((t - tin) * 4 + it.d) * clamp(t - tin));
    g.scale(lerp(0.9, 1, clamp(q)), q);
    PSHADOW(g);
    PITEMS[it.k](g);
    g.restore();
  }
  // tente (market saçağı): yukarıdan açılır
  const aw = spring(t - t0 - 0.06, 1.5, 6) * (1 - E.inCubic(prog(t, 3.46, 3.6)));
  if (aw > 0) {
    g.save(); g.translate(0, DOOR.y0); g.scale(1, aw); g.translate(0, -DOOR.y0);
    PSHADOW(g, 1.3);
    const n = 6, sw = DOOR.w / n;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? '#FFFFFF' : C.blue;
      const x = DOOR.x0 + i * sw;
      g.beginPath(); g.moveTo(x, DOOR.y0 - 5); g.lineTo(x + sw, DOOR.y0 - 5); g.lineTo(x + sw, DOOR.y0 + 96);
      g.arc(x + sw / 2, DOOR.y0 + 96, sw / 2, 0, Math.PI); g.closePath(); g.fill();
    }
    g.restore();
  }
}
function scenePaper(g, t) {
  const S = STY.paper, t0 = T.paper;
  drawRoom(g, S, t, { paperP: t - t0 - 0.04 });
  const th = doorTh(t);
  if (th > 0.001) inDoorway(g, () => paperInterior(g, t));
  drawRoomFront(g, S, t, { spill: clamp(th / 0.5) * 0.6, spillCol: '#FFF3DD' });
  // uçuşan kâğıt parçaları
  for (const b of PBITS) {
    const q = spring(t - t0 - 0.2 - b.d, 2, 7); if (q <= 0) continue;
    g.save();
    g.translate(b.x + Math.sin(t * b.sp * 2 + b.ph) * 12, b.y + Math.cos(t * b.sp * 1.6 + b.ph) * 14);
    g.rotate(b.rot + t * b.sp * 0.8); g.scale(q, q);
    PSHADOW(g, 0.8); paperBit(g, b);
    g.restore();
  }
  drawDoor(g, S, th, 0, leverAng(t));
  drawLabel(g, t, '01', 'Süt & kahvaltılık', t0 + 0.12, SLAM_AT[0] - 0.02, C.ink, S.sub);
  // kâğıt dokusu
  if (SPR.paperPat) { g.save(); g.globalAlpha = 0.10; g.globalCompositeOperation = 'multiply'; g.fillStyle = SPR.paperPat; g.fillRect(0, 0, W, H); g.restore(); }
}

/* ───────────────────────── Ölçü 3: SONSUZ REYON — temel gıda ───────────────────────── */
const AISLE = (() => {
  const r = mulberry32(42), bays = [];
  const BAY = 1.4, NB = 46;
  const pal = ['#FFB547', '#F2795A', '#E8473B', '#2FAE6B', '#FFFFFF', '#9CC2FF', '#FFD48A', '#7C5CE6', '#3B8BFF', '#FFFFFF', '#F59A1B'];
  for (let k = 0; k < NB; k++) for (const s of [-1, 1]) for (let lv = 0; lv < 4; lv++) {
    let z = 0.08; const items = [];
    while (z < BAY - 0.12) {
      const w = 0.13 + r() * 0.2; if (z + w > BAY - 0.06) break;
      items.push({ z0: z, z1: z + w, h: 0.30 + r() * 0.30, col: pal[(r() * pal.length) | 0], band: r() < 0.75, bandCol: r() < 0.5 ? '#FFFFFF' : '#0B1B33' });
      z += w + 0.02 + r() * 0.03;
    }
    bays.push({ k, s, lv, items });
  }
  return { BAY, NB, bays, boards: [-0.72, -0.02, 0.68, 1.28], top: -1.42, X: 1.22, floorY: 1.28, ceilY: -1.9 };
})();
const AVP = [540, 1000], AF = 430, ANEAR = 0.22;
function aisleZ(t) { const dt = Math.max(0, t - (T.aisle + 0.05)); return 2.4 * dt + 8.5 * dt * dt; }
const AFOG = '#123E92';
function aq(X, Y, Z) { return [AVP[0] + X * AF / Z, AVP[1] + Y * AF / Z]; }
function fogMix(col, Z) { const k = clamp((Z - 3) / 26); return k <= 0 ? col : mixHex(col, AFOG, k * 0.92); }
function sideQuad(g, X, Ya, Yb, za, zb, col) {
  za = Math.max(za, ANEAR); zb = Math.max(zb, ANEAR); if (zb <= za) return;
  g.fillStyle = col; poly(g, [aq(X, Ya, za), aq(X, Ya, zb), aq(X, Yb, zb), aq(X, Yb, za)]); g.fill();
}
function aisleWaveZ(t) { const p = prog(t, 4.95, 5.6); return 1 / lerp(1 / 26, 1 / 0.3, Math.pow(p, 3)); }
function aisleInterior(g, t) {
  const A = AISLE, zc = aisleZ(t), off = 1.0;
  g.fillStyle = AFOG; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h);
  // tavan ve zemin
  const zFar = 60;
  g.fillStyle = '#0A2E70'; poly(g, [aq(-A.X, A.ceilY, ANEAR), aq(A.X, A.ceilY, ANEAR), aq(A.X, A.ceilY, zFar), aq(-A.X, A.ceilY, zFar)]); g.fill();
  const fl = g.createLinearGradient(0, AVP[1], 0, DOOR.y1);
  fl.addColorStop(0, AFOG); fl.addColorStop(1, '#0B2A66');
  g.fillStyle = fl; poly(g, [aq(-A.X, A.floorY, ANEAR), aq(A.X, A.floorY, ANEAR), aq(A.X, A.floorY, zFar), aq(-A.X, A.floorY, zFar)]); g.fill();
  // sondaki ışık
  glow(g, SPR.white, AVP[0], AVP[1], 230, 0.85);
  const zw = t > 4.95 ? aisleWaveZ(t) : 1e9;
  const drawBay = (k) => {
    const z0 = k * A.BAY - zc + off, z1 = z0 + A.BAY;
    if (z1 < ANEAR || z0 > 44) return;
    // tavan lambası ve zemindeki yansıması
    if (k % 2 === 0) {
      const a = clamp(1 - (z0 - 4) / 34);
      sideQuadH(g, -0.42, 0.42, A.ceilY + 0.01, z0 + 0.2, z0 + 0.9, `rgba(255,255,255,${0.95 * a})`);
      sideQuadH(g, -0.32, 0.32, A.floorY - 0.01, z0 + 0.25, z0 + 0.85, `rgba(190,220,255,${0.22 * a})`);
    }
    // şerit
    sideQuadH(g, -0.025, 0.025, A.floorY - 0.005, z0 + 0.1, z0 + 0.7, fogMix('#FFB547', Math.max(z0, ANEAR)));
    for (const s of [-1, 1]) {
      const X = s * A.X, zm = Math.max(z0, ANEAR);
      sideQuad(g, X, A.top, A.floorY, z0, z1, fogMix(s < 0 ? '#0E3A86' : '#124498', zm));
      // ürünler
      for (let lv = 0; lv < 4; lv++) {
        const bay = A.bays[(k * 2 + (s > 0 ? 1 : 0)) * 4 + lv];
        const by = A.boards[lv];
        for (const it of bay.items) {
          const za = z0 + it.z0, zb = z0 + it.z1;
          if (zb < ANEAR) continue;
          const Xi = X - s * 0.06, top = by - it.h * 0.66;
          sideQuad(g, Xi, top, by, za, zb, fogMix(s < 0 ? mixHex(it.col, '#0B1B33', 0.16) : it.col, Math.max(za, ANEAR)));
          if (it.band) sideQuad(g, Xi - s * 0.001, top + (by - top) * 0.38, top + (by - top) * 0.62, za + 0.015, zb - 0.015, fogMix(it.bandCol, Math.max(za, ANEAR)));
        }
        // raf tahtası
        sideQuad(g, X - s * 0.18, by, by + 0.05, z0, z1, fogMix('#DCEAFF', zm));
      }
      // dikme
      sideQuad(g, X - s * 0.2, A.top, A.floorY, z0, z0 + 0.06, fogMix('#FFFFFF', zm));
    }
  };
  const kFirst = Math.max(0, Math.floor((zc - off) / A.BAY) - 1);
  const kz = k => k * A.BAY - zc + off;
  for (let k = Math.min(A.NB - 1, kFirst + 34); k >= kFirst; k--) if (kz(k) > zw) drawBay(k);
  if (zw < 1e8) aisleWave(g, t, zw);
  for (let k = Math.min(A.NB - 1, kFirst + 34); k >= kFirst; k--) if (kz(k) <= zw) drawBay(k);
  // hız çizgileri
  const sp = clamp((t - 4.5) / 0.9);
  if (sp > 0) {
    const r = mulberry32(7);
    g.save(); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const a = r() * TAU, ph = (r() + t * (1.6 + r() * 1.5)) % 1, r0 = 60 + ph * 520;
      g.globalAlpha = sp * (1 - ph) * 0.8; g.lineWidth = 2 + 4 * ph;
      g.beginPath(); g.moveTo(AVP[0] + Math.cos(a) * r0, AVP[1] + Math.sin(a) * r0); g.lineTo(AVP[0] + Math.cos(a) * (r0 + 60 + 160 * ph), AVP[1] + Math.sin(a) * (r0 + 60 + 160 * ph)); g.stroke();
    }
    g.restore();
  }
  if (t >= 5.6) { g.fillStyle = C.blueL; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h); }
}
// Yatay düzlemde (zemin/tavan) dörtgen
function sideQuadH(g, Xa, Xb, Y, za, zb, col) {
  za = Math.max(za, ANEAR); zb = Math.max(zb, ANEAR); if (zb <= za) return;
  g.fillStyle = col; poly(g, [aq(Xa, Y, za), aq(Xb, Y, za), aq(Xb, Y, zb), aq(Xa, Y, zb)]); g.fill();
}
// Koridorun sonundan gelen dalga
function aisleWave(g, t, zw) {
  const X0 = -1.5, X1 = 1.5, n = 40, top = [];
  for (let i = 0; i <= n; i++) {
    const X = lerp(X0, X1, i / n);
    const Y = -0.75 + 0.2 * Math.sin(X * 3.1 + t * 11) + 0.1 * Math.sin(X * 7.3 - t * 15);
    top.push(aq(X, Y, zw));
  }
  const bot = [aq(X1, 1.6, zw), aq(X0, 1.6, zw)];
  const gr = g.createLinearGradient(0, top[20][1], 0, bot[0][1]);
  gr.addColorStop(0, '#8CC0FF'); gr.addColorStop(0.35, C.blueL); gr.addColorStop(1, C.blue);
  g.fillStyle = gr; poly(g, top.concat(bot)); g.fill();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.min(40, 9 / zw * 2.2); g.lineJoin = 'round';
  g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  // köpük damlaları
  const r = mulberry32(13);
  g.fillStyle = '#FFFFFF';
  for (let i = 0; i < 18; i++) {
    const X = lerp(X0, X1, r()), ph = (r() + t * 2.4) % 1;
    const p = aq(X, -0.8 - ph * 0.5, zw);
    g.beginPath(); g.arc(p[0], p[1], (0.03 + r() * 0.04) * AF / zw * (1 - ph), 0, TAU); g.fill();
  }
}
function sceneAisle(g, t) {
  const S = STY.aisle, t0 = T.aisle;
  drawRoom(g, S, t, { gridP: prog(t, t0, t0 + 0.55) });
  const th = doorTh(t);
  if (th > 0.001) inDoorway(g, () => aisleInterior(g, t));
  drawRoomFront(g, S, t, { spill: clamp(th / 0.5) * 0.5, spillCol: '#FFFFFF' });
  drawDoor(g, S, th, 0, 0);
  drawLabel(g, t, '02', 'Temel gıda', t0 + 0.2, T.liquid - 0.02, '#FFFFFF', S.sub);
}
// Ölçü geçişi: tarak — şeritler sırayla soldan ve sağdan kayar
function blinds(g, t, t0, dur, drawNew) {
  const n = 10, h = H / n;
  let any = false;
  g.save(); g.beginPath();
  for (let i = 0; i < n; i++) {
    const d = i * 0.014, p = E.outExpo(prog(t, t0 + d, t0 + d + dur));
    if (p <= 0) continue;
    const w = (W + 4) * p;
    if (i % 2) g.rect(W - w, i * h - 1, w + 2, h + 2); else g.rect(-2, i * h - 1, w, h + 2);
    any = true;
  }
  if (any) { g.clip(); drawNew(); }
  g.restore();
  // şerit kenarlarında ince parlak çizgi
  g.save(); g.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < n; i++) {
    const d = i * 0.014, p = E.outExpo(prog(t, t0 + d, t0 + d + dur));
    if (p <= 0 || p >= 1) continue;
    const x = i % 2 ? W - W * p : W * p;
    g.fillRect(x - 3, i * h, 6, h);
  }
  g.restore();
}
