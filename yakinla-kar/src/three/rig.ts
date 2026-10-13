import {catmull, clamp, ease, lerp, prog, SHOT} from '../lib';
import {GLOBE} from './Interior';
import {HOME, scooterAt} from './path';

export type Cam = {
  scene: 'interior' | 'town';
  pos: number[];
  target: number[];
  fov: number;
  near: number;
  far: number;
  focus: number; // odak uzaklığı (dünya birimi)
  range: number; // net alan genişliği
  bokeh: number;
};

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));

// Çekim 1: çay bardağından boş şekerliğin üstünden kar küresine
const S1_POS = [
  [-0.64, 0.17, 0.52],
  [-0.44, 0.23, 0.5],
  [-0.18, 0.34, 0.34],
  [0.08, 0.25, 0.53],
  [0.21, 0.18, 0.47],
];
const S1_TGT = [
  [-0.42, 0.075, 0.035],
  [-0.3, 0.05, 0.0],
  [-0.15, 0.015, -0.03],
  [0.24, 0.11, -0.05],
  [GLOBE.x, GLOBE.y - 0.01, GLOBE.z],
];

const interior = (pos: number[], target: number[], fov: number, focus: number, range: number, bokeh: number): Cam => ({
  scene: 'interior',
  pos,
  target,
  fov,
  near: 0.004,
  far: 40,
  focus,
  range,
  bokeh,
});

const town = (pos: number[], target: number[], fov: number, focus: number, range: number, bokeh: number): Cam => ({
  scene: 'town',
  pos,
  target,
  fov,
  near: 0.1,
  far: 1500,
  focus,
  range,
  bokeh,
});

export const cameraAt = (f: number): Cam => {
  // --- 1. Pencere önü ---
  if (f < SHOT.dive) {
    const u = ease.inOutSine(prog(f, 0, SHOT.dive));
    const p = catmull(S1_POS, u);
    const t = catmull(S1_TGT, u);
    return interior(p, t, 40, dist(p, t), 0.07, 5);
  }
  // --- 2. Kar küresine dalış ---
  if (f < SHOT.town) {
    const k = ease.in(prog(f, SHOT.dive, SHOT.flash + 4 - SHOT.dive));
    const p = mix(S1_POS[4], [GLOBE.x, GLOBE.y - 0.005, GLOBE.z + 0.06], k);
    const t = [GLOBE.x, GLOBE.y - 0.03, GLOBE.z - 0.02];
    return interior(p, t, lerp(40, 48, k), Math.max(0.02, dist(p, [GLOBE.x, GLOBE.y, GLOBE.z + GLOBE.r]) + 0.02), 0.05, 5);
  }
  // --- 3. Kasaba ---
  if (f < SHOT.back) {
    const sc = scooterAt(f);
    const s3 = [sc.x, 0.9, sc.z];
    // 3a: karlı caddeye yukarıdan giriş, depoya iniş
    if (f < 262) {
      const k = ease.out(prog(f, SHOT.town, 44));
      const craneP = catmull([[1.0, 15, 34], [2.6, 7.5, 25], [3.6, 2.2, 16.5]], k);
      const craneT = catmull([[0, 1.5, -45], [-3.5, 1.2, -4], [-6.2, 1.3, 7.2]], k);
      // 3b: scooter'ı arkasından izleme (hafif yan ve yukarıdan)
      const sin = Math.sin(sc.heading);
      const cos = Math.cos(sc.heading);
      const back = 5.4;
      const side = 1.7; // sürücünün solunda
      const follow = [sc.x - sin * back - cos * side, 1.95, sc.z - cos * back + sin * side];
      const look = [sc.x + sin * 3.2, 0.95, sc.z + cos * 3.2];
      const b = ease.inOutSine(prog(f, 204, 22));
      const p = mix(craneP, follow, b);
      const t = mix(craneT, look, b);
      return town(p, t, lerp(42, 38, b), dist(p, s3), lerp(30, 7, b), lerp(1.5, 2.4, b));
    }
    // 3c: evin önünden yaklaşan scooter (kesme)
    if (f < SHOT.door) {
      const k = ease.inOut(prog(f, 262, 22));
      const p = [6.3, 1.0, -63.4];
      const t = [lerp(2.6, 3.9, k), 0.9, lerp(-52, -57.6, k)];
      return town(p, t, 34, dist(p, s3), 5, 2.5);
    }
    // 3d: kapı açılır; sonunda kamera karlı gökyüzüne kalkar
    const k = ease.inOutSine(prog(f, SHOT.door, 40));
    const up = ease.in(prog(f, 316, 18));
    const p = mix([3.0, 1.55, -55.2], [3.9, 1.5, -56.3], k);
    p[1] += up * 0.6;
    const door = [HOME.facadeX, 1.25, HOME.doorZ];
    const t = mix(door, [door[0] - 2, 9, door[2] + 3], up);
    return town(p, t, 36, dist(p, door) - 0.8, 3, 2.6);
  }
  // --- 4–5. Pencere önüne dönüş ve kapanış ---
  const k = ease.inOutSine(prog(f, SHOT.back, SHOT.freeze - SHOT.back));
  const p = mix([-0.16, 0.21, 0.56], [-0.29, 0.15, 0.44], k);
  const t = mix([-0.38, 0.07, 0.0], [-0.41, 0.075, 0.03], k);
  const endBlur = ease.inOut(prog(f, SHOT.end - 4, 30));
  const focus = lerp(dist(p, t), 0.05, endBlur);
  return interior(p, t, 40, focus, lerp(0.07, 0.02, endBlur), lerp(5, 9, endBlur));
};

export const clampF = clamp;
