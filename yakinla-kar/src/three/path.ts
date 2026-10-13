import {catmull, clamp, ease, lerp, prog} from '../lib';

// Kasaba sahnesinin ortak geometrisi: depo, hedef ev, scooter yolu.

export const DEPOT = {x0: -17, x1: -7.5, z0: 0, z1: 16, h: 6.2, doorZ: 8, doorW: 5, doorH: 3.6};
export const HOME = {facadeX: 7.5, doorZ: -60, doorW: 1.15, doorH: 2.2};

/** Catmull-Rom yolunu yay uzunluğuna göre örnekler: s metre → (x, z, yön) */
const arcPath = (pts: number[][]) => {
  const N = 400;
  const xs: number[][] = [];
  const acc: number[] = [0];
  for (let i = 0; i <= N; i++) xs.push(catmull(pts, i / N));
  for (let i = 1; i <= N; i++) acc.push(acc[i - 1] + Math.hypot(xs[i][0] - xs[i - 1][0], xs[i][1] - xs[i - 1][1]));
  const L = acc[N];
  const at = (s: number) => {
    const d = clamp(s, 0, L);
    let lo = 0;
    let hi = N;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (acc[m] < d) lo = m;
      else hi = m;
    }
    const u = (d - acc[lo]) / Math.max(1e-6, acc[hi] - acc[lo]);
    const x = lerp(xs[lo][0], xs[hi][0], u);
    const z = lerp(xs[lo][1], xs[hi][1], u);
    const heading = Math.atan2(xs[hi][0] - xs[lo][0], xs[hi][1] - xs[lo][1]);
    return {x, z, heading};
  };
  return {L, at};
};

// Depo kapısından çıkış, sağa dönüş ve cadde boyunca
const RIDE = arcPath([
  [-9.8, 8],
  [-6.2, 7.8],
  [-4.0, 7.2],
  [-1.2, 5.0],
  [1.5, 1.0],
  [1.8, -6],
  [1.8, -20],
  [1.8, -40],
]);
// Hedef eve yanaşma (ayrı çekim)
const ARRIVE = arcPath([
  [1.9, -50],
  [2.3, -54.5],
  [3.5, -57.2],
  [4.4, -58.3],
]);

export type ScooterState = {x: number; z: number; heading: number; dist: number; visible: boolean};

export const RIDE_START = 184; // depo kapısından çıkış
export const RIDE_END = 262; // kesme
export const ARRIVE_END = 286; // kaldırıma yanaşma bitti

export const scooterAt = (f: number): ScooterState => {
  if (f < RIDE_END) {
    // 9 m/s² ile kalkış, 9 m/s'de sabit
    const t = Math.max(0, (f - RIDE_START) / 30);
    const s = t < 1 ? 4.5 * t * t : 4.5 + 9 * (t - 1);
    const p = RIDE.at(s);
    return {...p, dist: s, visible: true};
  }
  // yavaşlayarak durma
  const k = ease.out(prog(f, RIDE_END - 2, ARRIVE_END - RIDE_END + 2));
  const s = k * ARRIVE.L;
  const p = ARRIVE.at(s);
  return {...p, dist: 40 + s, visible: true};
};

export const doorOpen = (f: number) => ease.inOut(prog(f, 294, 16));

/** Kapıdaki kurye: kapı açılınca bir adım yaklaşır ve poşeti uzatır */
export const courierAtDoor = (f: number) => {
  const step = ease.inOut(prog(f, 302, 14));
  return {x: lerp(6.35, 6.6, step), z: HOME.doorZ + 0.25, reach: ease.inOut(prog(f, 306, 12)), visible: f >= 286};
};
