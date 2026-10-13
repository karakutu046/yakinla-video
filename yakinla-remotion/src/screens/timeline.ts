// Telefon bölümünün (S3–S5) zaman çizelgesi ve ekran koordinatları.
// Ekran koordinatları telefon ekranının içidir (584 × 1244).
import {C, clamp, ease, lerp, prog, spr} from '../lib';
import {Pose} from '../components/Phone';

export const K = {
  zoom: 180,
  splashOut: 202,
  homeIn: 204,
  chipDown: 214,
  chipUp: 240,
  taps: [256, 282, 308],
  flyDur: 14,
  tapCart: 350,
  // S4
  sheetIn: 364,
  shield: 384,
  tapConfirm: 410,
  burst: 422,
  successFill: 448,
  irisNight: 462,
  // S5
  mapIn: 480,
  route: 492,
  courier: 514,
  arrive: 598,
};

export const GRID = {x: 24, y: 410, w: 260, h: 316, gap: 16};
export const cardPos = (i: number) => ({
  x: GRID.x + (i % 2) * (GRID.w + GRID.gap),
  y: GRID.y + Math.floor(i / 2) * (GRID.h + GRID.gap),
});
export const plusCenter = (i: number) => {
  const p = cardPos(i);
  return {x: p.x + GRID.w - 42, y: p.y + GRID.h - 42};
};
export const artCenter = (i: number) => {
  const p = cardPos(i);
  return {x: p.x + 130, y: p.y + 97};
};
export const CART = {x: 528, y: 104};
export const CART_BAR = {y: 1100, h: 96};
export const SHEET_TOP = 540;
export const BTN = {y: 448, h: 100}; // sayfa içi
export const BTN_CENTER_Y = SHEET_TOP + BTN.y + BTN.h / 2; // ekran içi

export const cartCount = (f: number) => K.taps.filter((t) => f >= t + K.flyDur).length;

// ---- Telefon pozları ----
const P0: Pose = {x: 540, y: 960, s: 1.97, rx: 0, ry: 0, rz: 0};
const PA: Pose = {x: 540, y: 1130, s: 0.9, rx: 7, ry: -15, rz: -1.5};
const PB: Pose = {x: 540, y: 1110, s: 0.9, rx: 5, ry: 12, rz: 1};
const PC: Pose = {x: 540, y: 980, s: 0.92, rx: 0, ry: 0, rz: 0};
const PD: Pose = {x: 332, y: 1072, s: 0.8, rx: 4, ry: 13, rz: 0};

const add = (a: Pose, b: Pose, c: Pose, t: number): Pose => ({
  x: a.x + (c.x - b.x) * t,
  y: a.y + (c.y - b.y) * t,
  s: a.s + (c.s - b.s) * t,
  rx: a.rx + (c.rx - b.rx) * t,
  ry: a.ry + (c.ry - b.ry) * t,
  rz: a.rz + (c.rz - b.rz) * t,
});

export const phonePose = (f: number): Pose => {
  let p = {...P0};
  p = add(p, P0, PA, spr(f, K.zoom, {k: 120, c: 21}));
  p = add(p, PA, PB, spr(f, 358, {k: 90, c: 15}));
  p = add(p, PB, PC, spr(f, 394, {k: 130, c: 21}));
  p = add(p, PC, PD, spr(f, 474, {k: 100, c: 18}));
  // canlı kalsın: hafif süzülme (onay anında durulur)
  const fl = clamp((f - 196) / 20) * (1 - 0.85 * clamp((f - 396) / 10) + 0.85 * clamp((f - 470) / 16));
  const t = f / 30;
  p.y += Math.sin(t * 1.3) * 8 * fl;
  p.ry += Math.sin(t * 0.9) * 1.6 * fl;
  p.rx += Math.cos(t * 0.7) * 1.0 * fl;
  // S5 boyunca yavaş dönüş
  p.ry -= 6 * ease.inOutCubic(prog(f, 500, 160));
  return p;
};

// ---- Dokunuş izi ----
type KF = {f: number; x: number; y: number};
const TOUCH: KF[] = [
  {f: 206, x: 520, y: 330},
  {f: 214, x: 470, y: 286},
  {f: 238, x: 140, y: 286},
  {f: 244, x: 150, y: 330},
  {f: 252, x: plusCenter(0).x, y: plusCenter(0).y},
  {f: 270, x: plusCenter(0).x, y: plusCenter(0).y},
  {f: 280, x: plusCenter(1).x, y: plusCenter(1).y},
  {f: 296, x: plusCenter(1).x, y: plusCenter(1).y},
  {f: 306, x: plusCenter(2).x, y: plusCenter(2).y},
  {f: 330, x: plusCenter(2).x, y: plusCenter(2).y},
  {f: 346, x: 440, y: CART_BAR.y + CART_BAR.h / 2},
  {f: 362, x: 440, y: CART_BAR.y + CART_BAR.h / 2},
  {f: 392, x: 420, y: BTN_CENTER_Y + 150},
  {f: 406, x: 292, y: BTN_CENTER_Y},
  {f: 430, x: 292, y: BTN_CENTER_Y},
];

const PRESSES = [...K.taps, K.tapCart, K.tapConfirm];

export const touchState = (f: number) => {
  let x = TOUCH[0].x;
  let y = TOUCH[0].y;
  for (let i = 0; i < TOUCH.length - 1; i++) {
    const a = TOUCH[i];
    const b = TOUCH[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = ease.inOutCubic((f - a.f) / (b.f - a.f));
      x = lerp(a.x, b.x, t);
      y = lerp(a.y, b.y, t);
      break;
    }
    if (f > b.f) {
      x = b.x;
      y = b.y;
    }
  }
  const vis = (a: number, b: number) => clamp((f - a) / 5) * (1 - clamp((f - b) / 6));
  const visible = Math.max(vis(206, 364), vis(390, 413));
  // basma: sürükleme boyunca basılı, dokunuşlarda kısa basış
  let press = f >= K.chipDown && f <= K.chipUp ? 1 : 0;
  let ripple = -1;
  for (const p of PRESSES) {
    const d = f - p;
    if (d > -3 && d < 5) press = Math.max(press, d < 0 ? (d + 3) / 3 : 1 - d / 5);
    if (d >= 0 && d < 16) ripple = d / 16;
  }
  if (f >= K.chipDown && f < K.chipDown + 16) ripple = (f - K.chipDown) / 16;
  return {x, y, visible, press, ripple};
};

export const chipScroll = (f: number, max: number) => -max * ease.outCubic(prog(f, 216, 48));

export const accent = C.blue;
