// Ortak sabitler ve zaman fonksiyonları.
// Animasyonun tamamı karenin (f, kesirli olabilir) saf fonksiyonudur; böylece hareket
// bulanıklığı için aynı sahne alt-karelerde yeniden çizilebilir.

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 900; // tam 30 sn

// Güvenli alan: önemli yazılar üstten 220 px, alttan 380 px içeride.
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = H - 380; // 1540

// Sahne başlangıçları (kare)
export const T = {
  s1: 0, // 0:00 kanca
  s2: 90, // 0:03 logo
  s3: 180, // 0:06 sepet
  s4: 360, // 0:12 ödeme
  s5: 480, // 0:16 canlı takip
  s6: 660, // 0:22 neden Yakınla
  s7: 780, // 0:26 kapanış
  end: 900,
} as const;

export const C = {
  blue: '#1F73F0',
  blueLight: '#3B8BFF',
  blueDeep: '#0E5FE0',
  navy: '#0B1A33',
  night0: '#04091A',
  night1: '#081430',
  night2: '#10244D',
  amber: '#FFB547',
  amberDeep: '#FF9A1F',
  amberSoft: '#FFD48A',
  white: '#FFFFFF',
  gray50: '#F4F7FC',
  gray100: '#EBF0F8',
  gray200: '#DCE4F0',
  gray400: '#9AA8BD',
  gray600: '#5E6E86',
  ink: '#0B1A33',
};

export const BRAND_GRADIENT = `linear-gradient(160deg, ${C.blueLight} 0%, ${C.blue} 52%, ${C.blueDeep} 100%)`;

// Çalışma saatleri (brief'teki ifade). Tek yerden değiştirilir.
export const HOURS = '08:00 – 01:00';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** start karesinden itibaren dur kare boyunca 0→1 */
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);
export const mix = (t: number, a: number, b: number) => a + (b - a) * t;

export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  inCubic: (t: number) => Math.pow(clamp(t), 3),
  inOutCubic: (t: number) => {
    t = clamp(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  outQuart: (t: number) => 1 - Math.pow(1 - clamp(t), 4),
  outExpo: (t: number) => (clamp(t) >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t))),
  inOutQuint: (t: number) => {
    t = clamp(t);
    return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
  },
  inQuad: (t: number) => clamp(t) ** 2,
  outBack: (t: number, s = 1.70158) => {
    t = clamp(t) - 1;
    return t * t * ((s + 1) * t + s) + 1;
  },
};

export type SpringCfg = {k?: number; c?: number; m?: number};

/**
 * Analitik sönümlü yay (0 → 1). Kesirli karelerde de sürekli olduğu için
 * hareket bulanıklığı alt-örneklemesiyle uyumludur.
 */
export const spr = (f: number, start: number, cfg: SpringCfg = {}) => {
  const {k = 170, c = 20, m = 1} = cfg;
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k / m);
  const z = c / (2 * Math.sqrt(k * m));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const s = Math.sqrt(z * z - 1);
  const r1 = -w0 * (z - s);
  const r2 = -w0 * (z + s);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
};

export const SP = {
  snap: {k: 260, c: 20},
  pop: {k: 220, c: 14},
  bouncy: {k: 180, c: 11},
  soft: {k: 110, c: 19},
  smooth: {k: 90, c: 19},
  heavy: {k: 70, c: 15},
};

/** Basit deterministik rastgele sayı üreteci */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const upTR = (s: string) => s.toLocaleUpperCase('tr-TR');

/** Kuadratik Bezier noktası */
export const qbez = (p0: number[], p1: number[], p2: number[], t: number) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

/**
 * Yerçekimli düşüş + sekmeler. y: 0 = yerde, negatif = yukarıda (px).
 * sinceImpact: son yere değmeden beri geçen süre (sn), henüz değmediyse -1.
 */
export const dropBounce = (f: number, start: number, height: number, g = 13000, rest = 0.3) => {
  let t = (f - start) / FPS;
  if (t <= 0) return {y: -height, impacts: 0, sinceImpact: -1, firstImpact: -1};
  const t0 = Math.sqrt((2 * height) / g);
  if (t < t0) return {y: -height + 0.5 * g * t * t, impacts: 0, sinceImpact: -1, firstImpact: -1};
  t -= t0;
  const firstImpact = t;
  let v = g * t0 * rest;
  let impacts = 1;
  let since = t;
  for (let i = 0; i < 4; i++) {
    const dur = (2 * v) / g;
    if (since < dur) {
      return {y: -(v * since - 0.5 * g * since * since), impacts, sinceImpact: since, firstImpact};
    }
    since -= dur;
    impacts++;
    v *= rest;
  }
  return {y: 0, impacts, sinceImpact: since, firstImpact};
};
