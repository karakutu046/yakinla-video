// Ortak sabitler, zaman çizelgesi ve yardımcı fonksiyonlar.
// Her şey karenin (f) saf fonksiyonudur: render paralel ve tekrarlanabilir.

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 450; // 15 sn

// Güvenli alan (Reels/TikTok arayüzü): önemli yazılar y 220–1540 arasında
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 1540;

// Çekimler (kare)
export const SHOT = {
  sill: 0, // 0:00 pencere önü: çay, boş şekerlik, kar küresi
  dive: 112, // 0:03.7 kar küresine dalış
  flash: 160, // camdan geçiş parlaması
  town: 166, // 0:05.5 karlı kasaba: depo → kurye → kapı
  door: 286, // 0:09.5 kapı açılır
  back: 334, // 0:11.1 pencere önüne dönüş: şekerlik dolu, çaya şeker
  end: 376, // 0:12.5 kapanış kartı
  freeze: 436, // bu kareden sonra 3B zaman durur (sabit kapak karesi)
} as const;

export const C = {
  blue: '#1F73F0',
  blueLight: '#3B8BFF',
  blueDeep: '#0E5FE0',
  amber: '#FFB547',
  amberSoft: '#FFD48A',
  ink: '#0B1A33',
  night: '#081430',
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);

export const ease = {
  inOut: (t: number) => {
    t = clamp(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  out: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  in: (t: number) => Math.pow(clamp(t), 3),
  inOutSine: (t: number) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2,
  outQuart: (t: number) => 1 - Math.pow(1 - clamp(t), 4),
  inQuad: (t: number) => clamp(t) ** 2,
};

/** Analitik sönümlü yay (0 → 1), kesirli karelerde sürekli */
export const spr = (f: number, start: number, k = 170, c = 20) => {
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = c / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};

export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export type V3 = [number, number, number];

/** Anahtar kareler arasında yumuşak geçiş (her aralıkta inOut) */
export const keyframes = (f: number, keys: {f: number; v: number[]}[], easing = ease.inOutSine): number[] => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = easing((f - a.f) / (b.f - a.f));
      return a.v.map((x, j) => lerp(x, b.v[j], t));
    }
  }
  return keys[keys.length - 1].v;
};

/** Catmull-Rom eğrisi: kamera yolları için C1 sürekli */
export const catmull = (pts: number[][], t: number): number[] => {
  const n = pts.length - 1;
  const x = clamp(t) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const u = x - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, j) => {
    const a = p0[j];
    const b = p1[j];
    const c = p2[j];
    const d = p3[j];
    return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  });
};

/** 3B zaman: kapanışın son karelerinde durur */
export const sceneTime = (f: number) => Math.min(f, SHOT.freeze);
