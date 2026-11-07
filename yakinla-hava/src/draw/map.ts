// Stilize Afşin haritası (gerçek harita karosu değil): kalınlıklı "masa" görünümü, depo → ev rotası,
// minibüs, varışta "KAPINDA" onayı ve gün gün değişen hava katmanları
import {clamp, ease, prog, rnd, spring} from '../lib';
import {at, Bez, bezAt, bezD, bezLen, iconC, n, op, splats, T} from './svg';
import {van} from './van';
import {rain, snow} from './weather';

const RAW = 'M30 96 Q46 70 84 74 Q120 66 146 88 Q162 112 150 150 Q156 182 128 204 Q96 222 64 208 Q30 196 26 160 Q14 128 30 96 Z';
const tf = (d: string, sx: number, sy: number, cx: number, cy: number, tx: number, ty: number) => {
  let k = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (m) => String(n(k++ % 2 === 0 ? tx + (Number(m) - cx) * sx : ty + (Number(m) - cy) * sy)));
};
export const MAP_D = tf(RAW, 0.98, 0.84, 88, 144, 90, 128);

export const DEPOT = {x: 42, y: 170};
export const HOME = {x: 138, y: 160};
export const ROUTE: Bez = [50, 172, 74, 194, 108, 192, 130, 168];
const ROUTE_LEN = bezLen(ROUTE);

export type MapState = {
  rain: number;
  snow: number;
  mud: number;
  van: number; // 0..1 rota ilerlemesi
  vanA: number; // minibüs görünürlüğü
  arrive: number; // varış karesi (yerel f)
  arriveA: number; // onay görünürlüğü
};

/** Minibüsü rota üzerinde çizer (yerel f yalnızca titreşim için) */
const vanOnRoute = (f: number, p: number, st: MapState) => {
  const pt = bezAt(ROUTE, p);
  const s = 0.24;
  const moving = p > 0.001 && p < 0.999;
  const bob = moving ? Math.sin(f * 1.7) * 0.35 : 0;
  const wheel = (p * ROUTE_LEN) / (2 * Math.PI * 8.4 * s) * 360;
  return at(
    pt.x,
    pt.y + bob,
    at(-50 * s, -55 * s, van({lights: st.rain + st.snow, wet: st.rain, snow: st.snow, mud: st.mud, wheel, shadow: 0.35}), s),
    1,
    pt.a * 0.55,
  );
};

export const drawMap = (f: number, st: MapState, mapA = 1, dy = 0) => {
  if (mapA <= 0.01) return '';
  const flow = -(f * 0.45) % 5;
  const p = st.van;
  // varış efekti
  const ka = f - st.arrive;
  const check = st.arriveA > 0.01 && ka >= 0 ? spring(f, st.arrive, 16, 0.42) : 0;
  const ring = ka >= 0 && ka < 18 ? ka / 18 : -1;

  const inside =
    // dağ sırtları ve eş yükselti çizgileri
    `<path d="M10 90 L34 70 L50 82 L70 62 L88 80 L104 64 L124 82 L140 70 L170 92 V40 H10 Z" fill="#9fd0ff" opacity="0.22"/>` +
    `<path d="M10 96 L30 82 L46 92 L66 76 L84 92 L102 78 L120 92 L138 82 L170 98 V40 H10 Z" fill="#e9f3ff" opacity="0.12"/>` +
    `<g fill="none" stroke="#e9f3ff" stroke-opacity="0.16" stroke-width="0.8"><path d="M28 120 Q90 100 152 118"/><path d="M24 136 Q90 116 158 134"/><path d="M40 198 Q90 182 140 198"/></g>` +
    // ara yollar
    `<g stroke="#e9f3ff" stroke-opacity="0.22" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M20 150 Q60 146 90 156 T170 146"/><path d="M96 92 Q100 130 92 196"/></g>` +
    // hava katmanları
    op(st.rain, `<rect x="0" y="50" width="180" height="160" fill="#0b2a66" opacity="0.28"/>` + rain(f, 5, 14, 58, 156, 150, {count: 70, len: 9, speed: 7, sw: 0.7, op: 0.6, col: '#d6ecff'})) +
    op(st.snow, `<rect x="0" y="50" width="180" height="160" fill="#eaf4ff" opacity="0.22"/><g fill="#fff" opacity="0.3">${[...Array(34)].map((_, i) => `<ellipse cx="${n(18 + rnd(i * 2.1) * 144)}" cy="${n(84 + rnd(i * 4.3) * 108)}" rx="${n(5 + rnd(i) * 9)}" ry="${n(1.6 + rnd(i * 3) * 2.4)}"/>`).join('')}</g>` + snow(f, 13, 14, 58, 156, 150, {count: 46, speed: 0.9, rmin: 0.6, rmax: 1.7})) +
    op(st.mud, `<g opacity="0.85">${splats(30, 23, 24, 100, 132, 96, '#7a5532', 3.2)}</g><ellipse cx="96" cy="186" rx="24" ry="5" fill="#5e3d1f" opacity="0.7"/>`);

  return op(
    mapA,
    at(
      0,
      dy,
      `<ellipse cx="90" cy="200" rx="72" ry="7" fill="#000" opacity="0.4" filter="url(#f-blur2)"/>` +
        `<path d="${MAP_D}" transform="translate(0 4.5)" fill="url(#g-map-side)"/>` +
        `<path d="${MAP_D}" fill="url(#g-map)"/>` +
        `<clipPath id="c-map"><path d="${MAP_D}"/></clipPath><g clip-path="url(#c-map)">${inside}</g>` +
        `<path d="${MAP_D}" fill="url(#g-shine2)"/>` +
        `<path d="${MAP_D}" fill="none" stroke="#cfe6ff" stroke-width="1.3" opacity="0.9"/>` +
        T(90, 146, 9, 'AFŞİN', {w: 900, op: 0.55, ls: 3}) +
        // rota: kesikli yol + ilerleyen parlak iz
        `<path d="${bezD(ROUTE)}" fill="none" stroke="#fff" stroke-width="1.7" stroke-dasharray="3 2" stroke-dashoffset="${n(flow)}" opacity="0.85"/>` +
        (p > 0.002
          ? `<path d="${bezD(ROUTE)}" pathLength="1" fill="none" stroke="url(#g-route)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${n(p)} 2" filter="url(#f-glow)"/>`
          : '') +
        iconC('i-depot', DEPOT.x, DEPOT.y, 24) +
        // ev: varışta zıplar
        iconC('i-home', HOME.x, HOME.y, 26, 1 + 0.12 * Math.sin(clamp(ka / 10) * Math.PI) * (ka >= 0 ? 1 : 0)) +
        (ring >= 0 ? `<circle cx="${HOME.x}" cy="${HOME.y}" r="${n(6 + ring * 20)}" fill="none" stroke="#5ff0a0" stroke-width="${n(2.2 * (1 - ring))}" opacity="${n(1 - ring)}"/>` : '') +
        (ring >= 0
          ? `<g stroke="#ffe08a" stroke-width="1.2" stroke-linecap="round" opacity="${n(1 - ring)}">${[...Array(8)]
              .map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                const r0 = 10 + ring * 10;
                const r1 = r0 + 4 * (1 - ring);
                return `<line x1="${n(HOME.x + Math.cos(a) * r0)}" y1="${n(HOME.y + Math.sin(a) * r0)}" x2="${n(HOME.x + Math.cos(a) * r1)}" y2="${n(HOME.y + Math.sin(a) * r1)}"/>`;
              })
              .join('')}</g>`
          : '') +
        op(st.vanA, vanOnRoute(f, p, st)) +
        op(
          st.arriveA,
          check > 0.001
            ? at(
                HOME.x - 4,
                HOME.y - 26,
                `<rect x="-26" y="-8" width="44" height="15" rx="7.5" fill="#fff" filter="url(#f-soft)"/>` +
                  iconC('i-ok', -18, -0.5, 12, 1, 0, false) +
                  T(-11, 3.1, 7.2, 'KAPINDA', {w: 900, a: 'start', c: '#139a46'}),
                check,
              )
            : '',
        ),
    ),
  );
};

/** Rota ilerlemesi: start'tan arrive'a yumuşak hızlanma/yavaşlama */
export const vanProgress = (f: number, start: number, arrive: number) => ease.inOut(prog(f, start, Math.max(1, arrive - start)));
