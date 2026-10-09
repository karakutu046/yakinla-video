'use strict';
/* Ölçü 6–8: Tek çizgi · Tipografi · Logo */

/* ───────────────────────── Ölçü 6: TEK ÇİZGİ — temizlik & kişisel bakım ───────────────────────── */
// Kalem hiç kalkmadan: raf çizgileri boyunca sprey, şampuan, sabun, diş fırçası ve sünger.
// Koordinatlar kapı boşluğuna göre (sol üst = 290, 560).
const LINE_D = [
  'M 8 440 L 50 440',
  'L 50 300 C 50 262 70 245 95 236 L 95 205 L 80 205 L 80 160 L 170 160 L 205 178 L 170 190 L 130 190 L 130 236 C 158 245 180 262 180 300 L 180 330 L 70 330 L 70 390 L 180 390 L 180 440',
  'L 262 440',
  'L 262 300 C 262 252 286 236 312 230 L 312 206 L 302 206 L 302 176 C 302 166 307 160 317 160 L 355 160 C 365 160 370 166 370 176 L 370 206 L 360 206 L 360 230 C 386 236 410 252 410 300 L 410 440',
  'L 465 440 C 548 440 548 680 465 680',
  'L 362 680 L 362 612 C 362 594 352 586 336 586 L 176 586 C 160 586 150 594 150 612 L 150 680',
  'L 40 680 C -16 680 -16 900 40 900',
  'L 52 900 L 62 790 L 92 790 L 120 700 L 126 668 C 128 658 142 658 140 670 L 134 704 L 108 790 L 140 790 L 150 900',
  'L 250 900 L 250 842 C 250 830 256 824 268 824 L 382 824 C 394 824 400 830 400 842 L 400 900',
  'L 600 900',
].join(' ');
const LOBJ = [
  { end: [180, 440], fill: 'M 50 440 L 50 300 C 50 262 70 245 95 236 L 95 205 L 80 205 L 80 160 L 170 160 L 205 178 L 170 190 L 130 190 L 130 236 C 158 245 180 262 180 300 L 180 440 Z', col: '#DCEAFF', acc: ['M 70 330 L 180 330 L 180 390 L 70 390 Z', '#9CC2FF'] },
  { end: [410, 440], fill: 'M 262 440 L 262 300 C 262 252 286 236 312 230 L 312 206 L 302 206 L 302 176 C 302 166 307 160 317 160 L 355 160 C 365 160 370 166 370 176 L 370 206 L 360 206 L 360 230 C 386 236 410 252 410 300 L 410 440 Z', col: '#FFE9C2', acc: ['M 302 176 C 302 166 307 160 317 160 L 355 160 C 365 160 370 166 370 176 L 370 206 L 302 206 Z', '#FFB547'] },
  { end: [150, 680], fill: 'M 362 680 L 362 612 C 362 594 352 586 336 586 L 176 586 C 160 586 150 594 150 612 L 150 680 Z', col: '#FFD9CC' },
  { end: [150, 900], fill: 'M 52 900 L 62 790 L 140 790 L 150 900 Z', col: '#DCEAFF', acc: ['M 120 700 L 126 668 C 128 658 142 658 140 670 L 134 704 L 112 790 L 98 790 Z', '#FFB547'] },
  { end: [400, 900], fill: 'M 250 900 L 250 842 C 250 830 256 824 268 824 L 382 824 C 394 824 400 830 400 842 L 400 900 Z', col: '#FFD48A', acc: ['M 250 846 C 250 830 256 824 268 824 L 382 824 C 394 824 400 830 400 846 Z', '#2FAE6B'] },
];
const LACC = [ // kabarcıklar ve parıltılar (çizgiden ayrı, vuruşta patlar)
  { x: 118, y: 548, r: 22, k: 'o', o: 2 }, { x: 80, y: 508, r: 13, k: 'o', o: 2 }, { x: 392, y: 552, r: 16, k: 'o', o: 2 }, { x: 420, y: 515, r: 9, k: 'o', o: 2 },
  { x: 238, y: 150, r: 18, k: '*', o: 0 }, { x: 228, y: 196, r: 9, k: '*', o: 0 }, { x: 448, y: 172, r: 16, k: '*', o: 1 }, { x: 446, y: 790, r: 18, k: '*', o: 4 }, { x: 200, y: 760, r: 12, k: '*', o: 3 },
];
const LT = { a: T.line + 0.29, b: T.line + 1.49, e0: 10.98, e1: 11.235 };
const LINE = {};
function initLine() {
  const s = samplePath(LINE_D, 1500);
  LINE.pts = s.pts.map(([x, y]) => [x + DOOR.x0, y + DOOR.y0]);
  const L = polyLen(LINE.pts, false); LINE.cum = L; LINE.len = L[L.length - 1];
  let from = 0;
  for (const o of LOBJ) {
    let best = from, bd = 1e9;
    for (let i = from; i < s.pts.length; i++) { const d = Math.hypot(s.pts[i][0] - o.end[0], s.pts[i][1] - o.end[1]); if (d < bd) { bd = d; best = i; } if (d < 1) break; }
    o.at = L[best] / LINE.len; from = best + 1;
    o.path = new Path2D(o.fill); if (o.acc) o.accPath = new Path2D(o.acc[0]);
  }
}
function lineDrawn(t) { const p = prog(t, LT.a, LT.b); return lerp(p, E.inOutSine(p), 0.55); }
function penAt(f) {
  const s = f * LINE.len, L = LINE.cum; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
  const p = LINE.pts[i - 1], q = LINE.pts[i], k = clamp((s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]));
  return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
}
function star4(g, r) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); }
function sceneLine(g, t) {
  const S = STY.line, t0 = T.line;
  const dp = E.outCubic(prog(t, t0, t0 + 0.5));
  drawRoomLine(g, S, t, { draw: dp });
  const th = doorTh(t);
  if (th > 0.001) inDoorway(g, () => { g.fillStyle = '#F1F6FE'; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h); });
  drawDoorLine(g, S, th, 0, 0, { draw: dp, fill: '#FFFFFF' });
  const f = lineDrawn(t), er = E.inCubic(prog(t, LT.e0, LT.e1));
  // dolgu: her nesne çizgisi bitince renk dolar, silinirken söner
  g.save(); g.translate(DOOR.x0, DOOR.y0);
  for (const o of LOBJ) {
    const tf = LT.a + (LT.b - LT.a) * o.at;
    const q = E.outBack(prog(t, tf + 0.02, tf + 0.22)) * (1 - E.inCubic(clamp((er - o.at + 0.15) / 0.15)));
    if (q <= 0.01) continue;
    const bb = o.end;
    g.save(); g.globalAlpha = clamp(q);
    g.translate(bb[0] - 60, bb[1]); g.scale(q, q); g.translate(-(bb[0] - 60), -bb[1]);
    g.fillStyle = o.col; g.fill(o.path);
    if (o.accPath) { g.fillStyle = o.acc[1]; g.fill(o.accPath); }
    g.restore();
  }
  g.restore();
  // tek çizgi
  if (f > er) {
    g.save(); g.strokeStyle = C.blue; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
    strokeTrim(g, LINE.pts, er, f, false);
    g.restore();
  }
  // kabarcık ve parıltılar
  g.save(); g.translate(DOOR.x0, DOOR.y0); g.strokeStyle = C.blue; g.fillStyle = C.amber; g.lineWidth = 5; g.lineJoin = 'round';
  LACC.forEach((a, i) => {
    const tf = LT.a + (LT.b - LT.a) * LOBJ[a.o].at + 0.08 + (i % 4) * 0.05;
    const q = spring(t - tf, 2, 8) * (1 - E.inBack(prog(t, 10.92 + i * 0.012, 11.06 + i * 0.012)));
    if (q <= 0.01) return;
    g.save(); g.translate(a.x, a.y + Math.sin(t * 4 + i) * 4); g.scale(q, q);
    if (a.k === 'o') { g.beginPath(); g.arc(0, 0, a.r, 0, TAU); g.stroke(); g.beginPath(); g.arc(-a.r * 0.35, -a.r * 0.35, a.r * 0.18, 0, TAU); g.fillStyle = C.blue; g.fill(); }
    else { g.rotate(t * 1.5); star4(g, a.r); g.fillStyle = C.amber; g.fill(); }
    g.restore();
  });
  g.restore();
  // kalem ucu
  if (t > LT.a - 0.05 && t < LT.e1) {
    const pf = t < LT.e0 ? f : lerp(f, 1, 0);
    let [x, y] = penAt(Math.max(pf, 0.0005));
    const fly = E.inCubic(prog(t, 10.9, 11.2));
    x = lerp(x, 540, fly); y = lerp(y, 260, fly);
    glow(g, SPR.amber, x, y, 60, 0.8);
    g.fillStyle = C.amber; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, y - 3, 4, 0, TAU); g.fill();
  }
  drawLabel(g, t, '05', 'Temizlik & kişisel bakım', t0 + 0.2, T.type, C.ink, C.blue);
}

/* ───────────────────────── Ölçü 7: TİPOGRAFİ — MARKET ALIŞVERİŞİNİZ KAPINIZDA. ───────────────────────── */
const TY = { t1: T.type, t2: T.type + BEAT, t3: T.type + 2 * BEAT, inv: T.type + 3 * BEAT, suck: 12.9, vp: [540, 1010] };
function initType(g) {
  const o = { s: 100, w: 900, ls: -2 };
  const ss = ['MARKET', 'ALIŞVERİŞİNİZ', 'KAPINIZDA.'];
  const sizes = ss.map(s => fitSize(g, s, o, 968));
  const cap = 0.727, gap = 46;
  const tot = cap * (sizes[0] + sizes[1] + sizes[2]) + gap * 2;
  let y = 1010 - tot / 2;
  TY.lines = ss.map((s, i) => { y += cap * sizes[i]; const L = { s, size: sizes[i], y, capH: cap * sizes[i] }; y += gap; return L; });
}
function invR(t) { return 1700 * E.outCubic(prog(t, TY.inv, TY.inv + 0.26)); }
function sceneType(g, t) {
  const r = invR(t);
  const roomOf = (S) => {
    drawRoomLine(g, S, t, { draw: 1 });
    const th = doorTh(t);
    inDoorway(g, () => {
      g.fillStyle = S === STY.type ? '#050C18' : C.blueD; g.fillRect(DOOR.x0, DOOR.y0, DOOR.w, DOOR.h);
      glow(g, S === STY.type ? SPR.blue : SPR.white, 540, 1010, 420, S === STY.type ? 0.9 : 0.5);
    });
    drawDoorLine(g, S, th, 0, 0, { draw: 1, fill: S.wall[0] });
  };
  roomOf(STY.type);
  if (r > 0) { g.save(); g.beginPath(); g.arc(540, 1010, r, 0, TAU); g.clip(); roomOf(STY.type2); g.restore(); }
  const rp = prog(t, TY.inv, TY.inv + 0.3);
  if (rp > 0 && rp < 1) { g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - rp)})`; g.lineWidth = 30 * (1 - rp) + 3; g.beginPath(); g.arc(540, 1010, r, 0, TAU); g.stroke(); }
  // harfler
  let rank = 0;
  TY.lines.forEach((L, li) => {
    const o = { s: L.size, w: 900, ls: -2 };
    const t0 = [TY.t1, TY.t2, TY.t3][li];
    const n = L.s.length;
    const cols0 = ['#FFFFFF', C.blueL, C.amber], cols1 = ['#FFFFFF', C.ink, C.amber];
    letters(g, L.s, 540, L.y, o, (i, n_, cw, cx) => {
      const cy = L.y - L.capH / 2;
      const inside = Math.hypot(cx - 540, cy - 1010) < r;
      const res = { c: inside ? cols1[li] : cols0[li] };
      if (li === 0) {
        const ti = t0 + i * 0.03, p = E.outExpo(prog(t, ti, ti + 0.42));
        if (p <= 0) return { al: 0 };
        res.dx = (TY.vp[0] - cx) * (1 - p); res.dy = (TY.vp[1] - cy) * (1 - p);
        res.sc = lerp(0.06, 1, p); res.rot = (i - (n - 1) / 2) * 0.35 * (1 - p);
      } else if (li === 1) {
        const ti = t0 + i * 0.016, p = E.outExpo(prog(t, ti, ti + 0.4));
        if (p <= 0) return { al: 0 };
        res.dx = (1 - p) * 1150; res.sx = 1 + 2.4 * Math.pow(1 - p, 1.4); res.sy = 1 / Math.sqrt(res.sx);
      } else {
        const ti = t0 + i * 0.034, q = spring(t - ti, 1.6, 6.5);
        if (q <= 0.01) return { al: 0 };
        res.ax = -1; res.sx = Math.max(0.02, q); res.skx = 0.32 * (1 - clamp(q)); res.al = clamp(q * 3);
      }
      // kapıya geri emilme
      const ts = TY.suck + (rank + i) * 0.003, s = E.inCubic(prog(t, ts, ts + 0.13));
      if (s > 0) {
        res.dx = (res.dx || 0) + (TY.vp[0] - cx) * s; res.dy = (res.dy || 0) + (TY.vp[1] - cy) * s;
        res.sc = (res.sc == null ? 1 : res.sc) * (1 - 0.92 * s); res.rot = (res.rot || 0) + s * 3;
        if (s >= 1) res.al = 0;
      }
      return res;
    });
    rank += n;
  });
}

/* ───────────────────────── Ölçü 8: LOGO — kapı pine dönüşür ───────────────────────── */
const LG = { m0: T.logo + 0.06, m1: T.logo + 0.47, land: T.logo + 0.47, size: 600, cx: 540, cy: 770 };
LG.k = LG.size / 1024;
LG.face = [LG.cx, LG.cy + (414 - 512) * LG.k];
const MORPH = {};
function initLogo() {
  const M = 260;
  const pin = samplePath(PIN_D, M).pts.map(([x, y]) => [LG.cx + (x - 512) * LG.k, LG.cy + (y - 512) * LG.k]);
  // kapı dikdörtgeni: üst ortadan başlayıp sola (pin yolu ile aynı yönde)
  const P = [[540, DOOR.y0], [DOOR.x0, DOOR.y0], [DOOR.x0, DOOR.y1], [DOOR.x1, DOOR.y1], [DOOR.x1, DOOR.y0], [540, DOOR.y0]];
  const L = polyLen(P, false), tot = L[L.length - 1], door = [];
  for (let i = 0; i < M; i++) {
    const s = tot * i / M; let j = 1; while (j < L.length - 1 && L[j] < s) j++;
    const k = (s - L[j - 1]) / (L[j] - L[j - 1]); door.push([lerp(P[j - 1][0], P[j][0], k), lerp(P[j - 1][1], P[j][1], k)]);
  }
  MORPH.pin = pin; MORPH.door = door;
}
const CONF = (() => {
  const r = mulberry32(64), a = [], cols = [C.blue, C.amber, C.blueL, C.coral, C.blueXL, C.amberD];
  for (let i = 0; i < 46; i++) {
    const ang = -Math.PI / 2 + (r() - 0.5) * 2.9, sp = 700 + r() * 1300;
    a.push({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 200, rot: r() * TAU, w: (r() - 0.5) * 18, s: 9 + r() * 12, c: cols[i % cols.length], k: i % 3, d: r() * 0.08 });
  }
  return a;
})();
function storeBadge(g, x, y, label, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); const s = lerp(0.85, 1, E.outBack(clamp(a))); g.scale(s, s);
  g.fillStyle = C.ink; g.beginPath(); g.roundRect(-140, -40, 280, 80, 40); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-100, -16); g.lineTo(-100, 10); g.moveTo(-112, -2); g.lineTo(-100, 11); g.lineTo(-88, -2); g.moveTo(-114, 18); g.lineTo(-86, 18); g.stroke();
  const o = { s: 33, w: 700, f: 'Txt', c: '#fff', a: 'left' }; o.s = Math.min(o.s, fitSize(g, label, o, 180));
  text(g, label, -68, 12, o);
  g.restore();
}
function sceneLogo(g, t) {
  const S = STY.logo, t0 = T.logo;
  fillWall(g, S);
  glow(g, SPR.blue, LG.cx, LG.cy + 60, 820, 0.28 * E.outCubic(prog(t, t0, t0 + 0.6)));
  const mp = prog(t, LG.m0, LG.m1);
  // oda: pervaz, zemin, paspas uzaklaşır
  const fade = 1 - E.inOutCubic(prog(t, t0 + 0.04, t0 + 0.3));
  if (fade > 0) {
    g.save(); g.globalAlpha = fade; g.translate(0, (1 - fade) * 60);
    drawRoomFront(g, S, t, {});
    g.restore();
  }
  // yere iniş halkaları
  for (let j = 0; j < 3; j++) {
    const p = prog(t, LG.land + j * 0.09, LG.land + j * 0.09 + 0.8); if (p <= 0 || p >= 1) continue;
    g.strokeStyle = rgba(C.blue, 0.35 * (1 - p)); g.lineWidth = 6 * (1 - p) + 1;
    g.beginPath(); g.ellipse(LG.cx, LG.cy + 236, 60 + 520 * E.outCubic(p), (60 + 520 * E.outCubic(p)) * 0.22, 0, 0, TAU); g.stroke();
  }
  if (t < LG.m1 + 0.05) {
    // dönüşen biçim: kapı dikdörtgeni → pin (alttan üste doğru "erir")
    const pts = MORPH.door.map((d, i) => {
      const pn = MORPH.pin[i], dl = 0.22 * (d[1] - DOOR.y0) / DOOR.h;
      const q = E.inOutCubic(clamp((mp - dl) / 0.78));
      return [lerp(d[0], pn[0], q), lerp(d[1], pn[1], q)];
    });
    const gr = g.createLinearGradient(0, LG.cy - 300, 0, DOOR.y1);
    gr.addColorStop(0, C.blueL); gr.addColorStop(1, C.blueD);
    g.save();
    g.shadowColor = 'rgba(0,30,90,0.25)'; g.shadowBlur = 40; g.shadowOffsetY = 18;
    g.fillStyle = gr; poly(g, pts); g.fill();
    g.restore();
    // kapı ayrıntıları hızla söner
    const da = 1 - E.inCubic(prog(t, LG.m0, LG.m0 + 0.14));
    if (da > 0) { g.save(); g.globalAlpha = da; poly(g, pts); g.clip(); drawDoor(g, S, 0, 0, 0, { noShadow: true, peep: false }); g.restore(); }
    // dürbün → saat kadranı
    const q = E.inOutCubic(mp);
    const px = lerp(DOOR.x0 + PEEP.u, LG.face[0], q), py = lerp(DOOR.y0 + PEEP.v, LG.face[1], q), pr = lerp(PEEP.r, 186 * LG.k, E.inOutCubic(clamp(mp * 1.1)));
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill();
    glow(g, SPR.white, px, py, pr * 2.4, 0.5 * (1 - q));
  }
  if (t >= LG.m1 - 0.03) {
    const a = E.outCubic(prog(t, LG.m1 - 0.03, LG.m1 + 0.04));
    const land = t - LG.land, sy = 1 - 0.07 * wobble(land, 2.6, 7), sx = 1 + 0.05 * wobble(land, 2.6, 7);
    const ring = E.inOutCubic(prog(t, LG.m1, LG.m1 + 0.32));
    const hp = E.outCubic(prog(t, LG.m1 + 0.05, LG.m1 + 0.55));
    g.save(); g.globalAlpha = a;
    g.translate(LG.cx, LG.cy + 236); g.scale(sx, sy); g.translate(-LG.cx, -(LG.cy + 236));
    drawLogo(g, LG.cx, LG.cy, LG.size, { ring, face: 1, hands: E.outBack(clamp(hp * 1.6)), am: -TAU * 1.25 * (1 - hp), ah: -TAU * 0.55 * (1 - hp), glint: lerp(-0.3, 1.3, prog(t, 14.25, 14.65)) });
    g.restore();
  }
  // konfeti
  for (const c of CONF) {
    const dt = t - LG.land - c.d; if (dt <= 0) continue;
    const x = LG.cx + c.vx * dt * 0.9, y = LG.cy - 40 + c.vy * dt + 0.5 * 2600 * dt * dt;
    if (y > H + 40) continue;
    g.save(); g.translate(x, y); g.rotate(c.rot + c.w * dt); g.scale(1, Math.cos(dt * 9 + c.rot));
    g.fillStyle = c.c;
    if (c.k === 0) g.fillRect(-c.s / 2, -c.s / 3, c.s, c.s * 0.66);
    else if (c.k === 1) { g.beginPath(); g.arc(0, 0, c.s * 0.45, 0, TAU); g.fill(); }
    else { g.strokeStyle = c.c; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-c.s * 0.7, 0); g.quadraticCurveTo(0, -c.s * 0.8, c.s * 0.7, 0); g.stroke(); }
    g.restore();
  }
  // yazılar
  slotText(g, 'Yakınla', 540, 1178, { s: 168, w: 900, c: C.ink, ls: -3 }, prog(t, bt(29), bt(29) + 0.55), 0, 0.06);
  slotText(g, 'Market alışverişiniz kapınızda.', 540, 1262, { s: 50, w: 700, f: 'Txt', c: C.blue }, prog(t, bt(29.5), bt(29.5) + 0.5), 0, 0.012);
  const sm = E.outCubic(prog(t, bt(29.75), bt(29.75) + 0.4));
  if (sm > 0) { g.save(); g.globalAlpha = sm; text(g, 'Afşin’de, ortalama 60 dakikada.', 540, 1326 + (1 - sm) * 16, { s: 36, w: 500, f: 'Txt', c: C.inkSoft }); g.restore(); }
  storeBadge(g, 540 - 152, 1430, 'App Store', prog(t, bt(30), bt(30) + 0.3));
  storeBadge(g, 540 + 152, 1430, 'Google Play', prog(t, bt(30.25), bt(30.25) + 0.3));
  const ua = E.outCubic(prog(t, bt(30.5), bt(30.5) + 0.35));
  if (ua > 0) { g.save(); g.globalAlpha = ua; text(g, 'yakinla.com', 540, 1530, { s: 36, w: 600, f: 'Txt', c: C.blue, ls: 1 }); g.restore(); }
}
