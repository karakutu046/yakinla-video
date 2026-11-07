// Ortak sabitler ve zaman fonksiyonları.
// Her kare tek bir SVG dizgisi olarak çizilir (180×320 birimlik sahne, 1 birim = 6 px).
// Çizim karenin (f, kesirli olabilir) saf fonksiyonudur; hareket izi için alt-karelerde yeniden çizilebilir.
import timing from './timing.json';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TM = timing;

// Güvenli alan (birim): üstten 220 px, alttan 380 px → y 37 … 256
export const SAFE_TOP = 37;
export const SAFE_BOTTOM = 256;

export const C = {
  blue: '#1F73F0',
  blueL: '#3B8BFF',
  blueD: '#0E5FE0',
  navy: '#0B1A33',
  orange: '#FF8A1F',
  orangeD: '#D9600A',
  green: '#22C55E',
  ice: '#CFE9FF',
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** start karesinden itibaren dur kare boyunca 0→1 */
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);
/** start'ta 0→1 yükselir (dur), end'de 1→0 iner (dur2) */
export const win = (f: number, start: number, dur: number, end = Infinity, dur2 = dur) =>
  Math.min(prog(f, start, dur), 1 - prog(f, end, dur2));

export const ease = {
  out: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  in: (t: number) => Math.pow(clamp(t), 3),
  inOut: (t: number) => {
    t = clamp(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  inOutSine: (t: number) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2,
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t))),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * clamp(t) - 10)),
  outBack: (t: number, s = 1.70158) => {
    t = clamp(t) - 1;
    return t * t * ((s + 1) * t + s) + 1;
  },
};

/** Analitik sönümlü yay: start karesinden sonra 0→1 (aşma ile). Kesirli karede de çalışır. */
export const spring = (f: number, start: number, w = 15, zeta = 0.45) => {
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
};

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const up = (s: string) => s.toLocaleUpperCase('tr-TR');
