// SVG dizgi yardımcıları
import {rnd} from '../lib';

export const n = (v: number) => Math.round(v * 100) / 100;

type TextOpts = {w?: number; c?: string; a?: 'start' | 'middle' | 'end'; ls?: number; op?: number; extra?: string};
/** Metin. Büyük puntolarda Inter'in "Display" optik boyutu kullanılır. */
export const T = (x: number, y: number, s: number, txt: string, o: TextOpts = {}) =>
  `<text x="${n(x)}" y="${n(y)}" font-size="${n(s)}" font-family="Inter, sans-serif" font-weight="${o.w ?? 800}" fill="${o.c ?? '#fff'}" text-anchor="${o.a ?? 'middle'}"${
    o.ls !== undefined ? ` letter-spacing="${o.ls}"` : ''
  }${o.op !== undefined ? ` opacity="${n(o.op)}"` : ''} style="font-variation-settings:'opsz' ${s >= 12 ? 32 : 18}"${o.extra ?? ''}>${txt}</text>`;

export const at = (x: number, y: number, inner: string, s = 1, r = 0) =>
  `<g transform="translate(${n(x)} ${n(y)})${r ? ` rotate(${n(r)})` : ''}${s !== 1 ? ` scale(${n(s)})` : ''}">${inner}</g>`;

/** Saydamlık sarmalayıcı: görünmezse hiç çizmez */
export const op = (o: number, inner: string) => (o <= 0.002 ? '' : o >= 0.998 ? inner : `<g opacity="${n(o)}">${inner}</g>`);

/** Premium ikon (sembol). x,y sol üst köşe; i-bag 64×80 oranındadır. */
export const icon = (id: string, x: number, y: number, s: number, shadow = true) =>
  `<use href="#${id}" x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(id === 'i-bag' ? s * 1.25 : s)}"${shadow ? ' filter="url(#f-soft)"' : ''}/>`;

/** Merkezden ölçeklenen ikon */
export const iconC = (id: string, cx: number, cy: number, s: number, scale = 1, rot = 0, shadow = true) =>
  scale <= 0.001 ? '' : at(cx, cy, icon(id, -s / 2, -s / 2, s, shadow), scale, rot);

export const logo = (x: number, y: number, s: number) => `<use href="#ylogo" x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}"/>`;

/** Çamur lekeleri */
export const splats = (count: number, seed: number, x0: number, y0: number, w: number, h: number, col = '#6b4a2b', rmax = 3) => {
  let s = '';
  for (let i = 0; i < count; i++) {
    const r = 0.6 + rnd(seed + i * 4.1) * rmax;
    s += `<ellipse cx="${n(x0 + rnd(seed + i * 1.7) * w)}" cy="${n(y0 + rnd(seed + i * 8.3) * h)}" rx="${n(r)}" ry="${n(r * (0.6 + rnd(i) * 0.5))}"/>`;
  }
  return `<g fill="${col}">${s}</g>`;
};

/** Kübik Bezier üzerinde nokta ve yön (derece) */
export type Bez = [number, number, number, number, number, number, number, number];
export const bezAt = (b: Bez, t: number) => {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = b;
  const u = 1 - t;
  const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
  const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
  const dx = 3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2);
  const dy = 3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2);
  return {x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI};
};
export const bezD = (b: Bez) => `M${b[0]} ${b[1]} C${b[2]} ${b[3]} ${b[4]} ${b[5]} ${b[6]} ${b[7]}`;
export const bezLen = (b: Bez) => {
  let L = 0;
  let p = bezAt(b, 0);
  for (let i = 1; i <= 40; i++) {
    const q = bezAt(b, i / 40);
    L += Math.hypot(q.x - p.x, q.y - p.y);
    p = q;
  }
  return L;
};

/** Hareket izi: geçmiş alt-karelerde soluk kopyalar + keskin son kare */
export const trail = (f: number, draw: (f: number) => string, span = 1, copies = 3, strength = 0.32) => {
  let s = '';
  for (let i = copies; i >= 1; i--) s += op(strength * (1 - (i - 1) / copies), draw(f - (span * i) / copies));
  return s + draw(f);
};
