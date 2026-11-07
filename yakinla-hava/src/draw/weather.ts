// Hava parçacıkları ve "kamera camı" efektleri. Hepsi karenin saf fonksiyonudur.
import {clamp, ease, prog, rnd} from '../lib';
import {n, op} from './svg';

/** Yağmur çizgileri (tek path) */
export const rain = (
  f: number,
  seed: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  o: {count: number; len: number; speed: number; slant?: number; sw?: number; col?: string; op?: number},
) => {
  let d = '';
  const sl = o.slant ?? 0.22;
  for (let i = 0; i < o.count; i++) {
    const sp = o.speed * (0.8 + 0.4 * rnd(seed + i * 1.3));
    const yr = (rnd(seed + i * 7.7) * h + f * sp) % h;
    const l = o.len * (0.6 + rnd(seed + i) * 0.7);
    const x = x0 - 10 + rnd(seed + i * 3.1) * (w + 20) - sl * yr;
    d += `M${n(x)} ${n(y0 + yr)}l${n(sl * l)} ${n(-l)}`;
  }
  return `<path d="${d}" stroke="${o.col ?? '#d6e6ff'}" stroke-width="${o.sw ?? 0.8}" stroke-linecap="round" opacity="${o.op ?? 0.55}" fill="none"/>`;
};

/** Kar taneleri (tek path, daireler) */
export const snow = (
  f: number,
  seed: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  o: {count: number; speed: number; rmin: number; rmax: number; sway?: number; op?: number; glow?: boolean},
) => {
  let d = '';
  for (let i = 0; i < o.count; i++) {
    const sp = o.speed * (0.7 + 0.6 * rnd(seed + i * 2.3));
    const r = o.rmin + rnd(seed + i * 5.3) * (o.rmax - o.rmin);
    const yr = (rnd(seed + i * 6.1) * h + f * sp) % h;
    const x = x0 + rnd(seed + i * 2.9) * w + Math.sin(f * 0.05 * (0.6 + rnd(seed + i)) + i) * (o.sway ?? 3);
    const y = y0 + yr;
    d += `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;
  }
  return `<path d="${d}" fill="#fff" opacity="${o.op ?? 0.9}"${o.glow ? ' filter="url(#f-glow)"' : ''}/>`;
};

/** Ekran camında süzülen yağmur damlaları */
export const glassDrops = (f: number, seed: number, count: number) => {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = 6 + rnd(seed + i * 2.2) * 168;
    const r = 1.4 + rnd(seed + i) * 2.6;
    const moving = rnd(seed + i * 3.3) > 0.5;
    let y = 30 + rnd(seed + i * 5.9) * 270;
    let trail = '';
    if (moving) {
      const sp = 1.2 + rnd(seed + i * 9.1) * 1.8;
      y = ((rnd(seed + i * 5.9) * 360 + f * sp) % 360) - 20;
      trail = `<path d="M${n(x)} ${n(y - r * 9)} Q${n(x + 0.8)} ${n(y - r * 4)} ${n(x)} ${n(y)}" stroke="#fff" stroke-width="${n(r * 0.7)}" opacity="0.16" fill="none" stroke-linecap="round"/>`;
    }
    s +=
      trail +
      `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#g-drop2)" stroke="#fff" stroke-width="0.35" stroke-opacity="0.7"/>` +
      `<circle cx="${n(x - r * 0.35)}" cy="${n(y - r * 0.38)}" r="${n(r * 0.28)}" fill="#fff" opacity="0.9"/>`;
  }
  return s;
};

/** Köşelerde büyüyen kırağı */
export const frost = (a: number) =>
  a <= 0.01
    ? ''
    : `<rect width="180" height="320" fill="url(#g-frost)" opacity="${n(clamp(a))}"/>` +
      op(a, `<g stroke="#fff" stroke-width="0.6" opacity="0.55" fill="none">${[...Array(10)]
        .map((_, i) => {
          const cx = i % 2 ? 180 : 0;
          const cy = 30 + rnd(i * 3.1) * 280;
          const L = 6 + rnd(i * 1.7) * 10 * a;
          const dir = cx ? -1 : 1;
          return `<path d="M${cx} ${n(cy)} l${n(dir * L)} ${n(-L * 0.4)} m${n(-dir * L * 0.5)} ${n(L * 0.2)} l${n(dir * L * 0.3)} ${n(-L * 0.5)}"/>`;
        })
        .join('')}</g>`);

/** Ekrana çarpan çamur lekeleri; silecek açısı (derece) geçtiğinde silinir */
const PIVOT = {x: -8, y: 334};
const SWEEP = 145;
export const wiperAngle = (f: number, start: number) => {
  // ileri süpürme 16 kare (185°→330°), geri dönüş 14 kare
  const fwd = ease.inOutSine(prog(f, start, 16));
  const back = ease.inOutSine(prog(f, start + 18, 14));
  return 185 + SWEEP * fwd - SWEEP * back;
};

const BLOBS = [
  {x: 40, y: 92, s: 15},
  {x: 132, y: 70, s: 11},
  {x: 112, y: 162, s: 17},
  {x: 30, y: 196, s: 10},
  {x: 150, y: 214, s: 9},
  {x: 78, y: 128, s: 8},
];

const blobShape = (i: number, s: number) => {
  let d = '';
  // ana leke + uydu damlalar + akıntı
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + rnd(i * 7 + k);
    const r = s * (0.45 + rnd(i * 13 + k) * 0.25);
    d += `<ellipse cx="${n(Math.cos(a) * s * 0.35)}" cy="${n(Math.sin(a) * s * 0.35)}" rx="${n(r)}" ry="${n(r * 0.85)}"/>`;
  }
  let sat = '';
  for (let k = 0; k < 7; k++) {
    const a = rnd(i * 31 + k) * Math.PI * 2;
    const dist = s * (0.9 + rnd(i * 17 + k) * 0.9);
    sat += `<circle cx="${n(Math.cos(a) * dist)}" cy="${n(Math.sin(a) * dist)}" r="${n(0.6 + rnd(i * 5 + k) * s * 0.12)}"/>`;
  }
  const drip = `<path d="M${n(-s * 0.15)} ${n(s * 0.4)} q0 ${n(s * 0.9)} ${n(s * 0.12)} ${n(s * 1.1)} q${n(s * 0.12)} ${n(-s * 0.2)} ${n(s * 0.1)} ${n(-s * 1.1)} Z"/>`;
  return `<g fill="url(#g-mudblob)">${d}${drip}</g><g fill="#5c3a1c">${sat}</g><ellipse cx="${n(-s * 0.2)}" cy="${n(-s * 0.25)}" rx="${n(s * 0.22)}" ry="${n(s * 0.1)}" fill="#c99a63" opacity="0.5"/>`;
};

export const mudScreen = (f: number, hit: number, wipe: number) => {
  if (f < hit) return '';
  let s = '';
  BLOBS.forEach((b, i) => {
    const t0 = hit + i * 1.5;
    if (f < t0) return;
    const sc = ease.outBack(prog(f, t0, 5), 2.2);
    const bAng = ((Math.atan2(b.y - PIVOT.y, b.x - PIVOT.x) * 180) / Math.PI + 360) % 360;
    // silecek bu açıyı geçtiği kare
    let cleared = 1;
    if (f >= wipe) {
      const passF = wipe + (16 * Math.acos(1 - 2 * clamp((bAng - 185) / SWEEP))) / Math.PI;
      cleared = 1 - prog(f, passF, 2.5);
    }
    if (cleared <= 0) {
      // ince bulaşık iz
      const smear = 0.18 * (1 - prog(f, wipe + 22, 30));
      if (smear > 0.01) s += `<circle cx="${b.x}" cy="${b.y}" r="${n(b.s * 0.9)}" fill="#7a5532" opacity="${n(smear)}" filter="url(#f-blur1)"/>`;
      return;
    }
    // aşağı sızma
    const sag = ease.out(prog(f, t0 + 5, 40)) * b.s * 0.25;
    s += op(cleared, `<g transform="translate(${b.x} ${n(b.y + sag * 0.3)}) scale(${n(sc)} ${n(sc * (1 + sag / b.s * 0.3))})" filter="url(#f-soft)">${blobShape(i, b.s)}</g>`);
  });
  return s;
};

export const wiper = (f: number, start: number) => {
  if (f < start - 1 || f > start + 34) return '';
  const blade = (ang: number) => {
    const r = (ang * Math.PI) / 180;
    const L = 420;
    const ex = PIVOT.x + Math.cos(r) * L;
    const ey = PIVOT.y + Math.sin(r) * L;
    const mx = PIVOT.x + Math.cos(r) * 150;
    const my = PIVOT.y + Math.sin(r) * 150;
    return (
      `<line x1="${n(mx)}" y1="${n(my)}" x2="${n(ex)}" y2="${n(ey)}" stroke="#07090d" stroke-width="7" stroke-linecap="round"/>` +
      `<line x1="${n(mx)}" y1="${n(my)}" x2="${n(ex)}" y2="${n(ey)}" stroke="#3a4352" stroke-width="1.6" stroke-linecap="round" transform="translate(${n(Math.sin(r) * 1.6)} ${n(-Math.cos(r) * 1.6)})"/>` +
      `<line x1="${PIVOT.x}" y1="${PIVOT.y}" x2="${n(PIVOT.x + Math.cos(r) * 300)}" y2="${n(PIVOT.y + Math.sin(r) * 300)}" stroke="#1d232e" stroke-width="3.4" stroke-linecap="round"/>` +
      `<line x1="${PIVOT.x}" y1="${PIVOT.y}" x2="${n(PIVOT.x + Math.cos(r) * 300)}" y2="${n(PIVOT.y + Math.sin(r) * 300)}" stroke="#8a95a8" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>`
    );
  };
  let s = '';
  for (let k = 3; k >= 1; k--) s += op(0.16 * (1 - (k - 1) / 3), blade(wiperAngle(f - k * 0.33, start)));
  return s + blade(wiperAngle(f, start));
};
