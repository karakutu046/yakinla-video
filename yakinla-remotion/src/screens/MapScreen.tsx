import React from 'react';
import {FONT} from '../fonts';
import {C, clamp, ease, lerp, prog, rand, spr, SP} from '../lib';
import {CheckIcon, CourierIcon, HouseIcon, WarehouseIcon} from '../components/Icons';
import {SCREEN} from '../components/Phone';
import {StatusBar} from './AppHome';
import {K} from './timeline';

// S5 · Canlı takip: soyut, vektör bir ilçe dokusu. Gerçek harita döşemesi yok.
// Alçak katlı binalar, geniş cadde, arkada dağ silueti; gökdelen ve deniz yok.
// Sahne, basit bir perspektif kamerayla kodda izdüşürülür (2.5B).

const F = 640; // odak uzaklığı (px)
const CX = SCREEN.w / 2;
const CY = 700;
const CAM_Z = 520;
const PITCH = (36 * Math.PI) / 180;
const COS = Math.cos(PITCH);
const SIN = Math.sin(PITCH);
const NEAR = 24;
const HORIZON = CY - F * Math.tan(PITCH);

type V3 = [number, number, number];
type Cam = {x: number; y: number};
type CP = {x: number; d: number; u: number};

const toCam = (p: V3, cam: Cam): CP => {
  const rx = p[0] - cam.x;
  const ry = p[1] - cam.y;
  const rz = p[2] - CAM_Z;
  return {x: rx, d: ry * COS - rz * SIN, u: ry * SIN + rz * COS};
};
const proj = (c: CP) => [CX + (F * c.x) / c.d, CY - (F * c.u) / c.d];

/** Yakın düzleme göre kırpılmış çokgen → SVG points */
const poly = (pts: V3[], cam: Cam): string | null => {
  const cs = pts.map((p) => toCam(p, cam));
  const out: CP[] = [];
  for (let i = 0; i < cs.length; i++) {
    const a = cs[i];
    const b = cs[(i + 1) % cs.length];
    const ain = a.d >= NEAR;
    const bin = b.d >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (NEAR - a.d) / (b.d - a.d);
      out.push({x: a.x + (b.x - a.x) * t, d: NEAR, u: a.u + (b.u - a.u) * t});
    }
  }
  if (out.length < 3) return null;
  return out.map((c) => proj(c).map((v) => v.toFixed(1)).join(',')).join(' ');
};

// ---- Şehir ----
type Building = {x0: number; x1: number; y0: number; y1: number; h: number; seed: number; kind?: 'depot' | 'home'};

const CROSS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((k) => k * 380);
const AVE = 70;
const SIDE_X = 430;

const BUILDINGS: Building[] = (() => {
  const list: Building[] = [];
  let seed = 1;
  const xBands: [number, number][] = [
    [96, 236],
    [254, 398],
    [462, 640],
    [660, 860],
  ];
  for (let k = 0; k < CROSS.length - 1; k++) {
    const by0 = CROSS[k] + 42;
    const by1 = CROSS[k + 1] - 42;
    const lots = [
      [by0, by0 + (by1 - by0) * 0.5 - 8],
      [by0 + (by1 - by0) * 0.5 + 8, by1],
    ];
    for (const side of [-1, 1]) {
      for (const [bx0, bx1] of xBands) {
        for (const [ly0, ly1] of lots) {
          seed++;
          const m = 6 + rand(seed * 1.3) * 10;
          const x0 = side > 0 ? bx0 + m : -bx1 + m;
          const x1 = side > 0 ? bx1 - m : -bx0 - m;
          const y0 = ly0 + rand(seed * 2.1) * 12;
          const y1 = ly1 - rand(seed * 3.7) * 12;
          // depo ve ev parselleri boş kalır
          if (side < 0 && k === 3 && ly0 < 200 && bx0 >= 254 && bx0 < 400) continue;
          if (side > 0 && k === 6 && ly0 < 1340 && bx0 >= 254 && bx0 < 400) continue;
          const h = 34 + Math.floor(rand(seed * 5.9) * 4) * 26 + (bx0 > 400 ? 0 : 8);
          list.push({x0, x1, y0, y1, h, seed});
        }
      }
    }
  }
  list.push({x0: -392, x1: -230, y0: 44, y1: 176, h: 58, seed: 999, kind: 'depot'});
  list.push({x0: 254, x1: 352, y0: 1186, y1: 1300, h: 66, seed: 1001, kind: 'home'});
  return list;
})();

const ROUTE: [number, number][] = [
  [-311, 0],
  [0, 0],
  [0, 1140],
  [303, 1140],
];
const SEGS = ROUTE.slice(1).map((b, i) => {
  const a = ROUTE[i];
  return {a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1])};
});
const ROUTE_LEN = SEGS.reduce((s, g) => s + g.len, 0);
const routeAt = (s: number): [number, number] => {
  let r = clamp(s, 0, ROUTE_LEN);
  for (const g of SEGS) {
    if (r <= g.len) {
      const t = r / g.len;
      return [lerp(g.a[0], g.b[0], t), lerp(g.a[1], g.b[1], t)];
    }
    r -= g.len;
  }
  return ROUTE[ROUTE.length - 1];
};

const DEPOT: V3 = [-311, 110, 120];
const HOME: V3 = [303, 1243, 128];

/** Rota şeridi: s0..s1 aralığını küçük dörtgenlerle çizer (perspektifte doğru kalınlık) */
const ribbon = (s0: number, s1: number, w: number, cam: Cam) => {
  const out: string[] = [];
  const step = 22;
  for (let s = s0; s < s1; s += step) {
    const a = routeAt(s);
    const b = routeAt(Math.min(s + step + 2, s1));
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const px = (-dy / L) * w;
    const py = (dx / L) * w;
    const p = poly(
      [
        [a[0] + px - (dx / L) * w, a[1] + py - (dy / L) * w, 1],
        [b[0] + px, b[1] + py, 1],
        [b[0] - px, b[1] - py, 1],
        [a[0] - px - (dx / L) * w, a[1] - py - (dy / L) * w, 1],
      ],
      cam,
    );
    if (p) out.push(p);
  }
  return out;
};

const ridge = (x: number, seed: number, amp: number) =>
  amp * (0.55 + 0.25 * Math.sin(x * 0.011 + seed) + 0.15 * Math.sin(x * 0.027 + seed * 2.3) + 0.08 * Math.sin(x * 0.061 + seed * 4.1));

const Mountains: React.FC<{shift: number; amp: number; seed: number; color: string; base: number}> = ({shift, amp, seed, color, base}) => {
  const pts: string[] = [];
  for (let x = -60; x <= SCREEN.w + 60; x += 12) {
    const wx = x - shift;
    pts.push(`${x},${(base - ridge(wx, seed, amp)).toFixed(1)}`);
  }
  return <polygon points={`-60,${base + 4} ${pts.join(' ')} ${SCREEN.w + 60},${base + 4}`} fill={color} />;
};

// Durum çubuğundaki saat sayaçla birlikte ilerler: 23:41 + geçen dakika
const clockAt = (min: number) => {
  const m = (23 * 60 + 41 + min) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const courierProgress = (f: number) => ease.inOutCubic(prog(f, K.courier, K.arrive - K.courier));

export const MapScreen: React.FC<{f: number}> = ({f}) => {
  const u = courierProgress(f);
  const cs = u * ROUTE_LEN;
  const courier = routeAt(cs);
  // kamera kuryeyi biraz gecikmeyle izler; girişte yukarıdan süzülür
  const camS = ease.inOutCubic(prog(f, K.courier - 8, K.arrive - K.courier + 14)) * ROUTE_LEN;
  const ct = routeAt(camS);
  const intro = 1 - ease.outCubic(prog(f, K.mapIn - 4, 34));
  const cam: Cam = {x: ct[0] * 0.6 + 40 * intro, y: ct[1] - 820 - 320 * intro};
  const t = f / 30;

  const reveal = ease.inOutCubic(prog(f, K.mapIn, 16));
  const routeDraw = ease.inOutCubic(prog(f, K.route, 26));

  // derinliğe göre sıralı çizim listesi (binalar + sokak lambaları)
  type Item = {d: number; el: React.ReactNode};
  const items: Item[] = [];

  for (const b of BUILDINGS) {
    const cyMid = (b.y0 + b.y1) / 2;
    if (cyMid < cam.y + 60 || cyMid > cam.y + 3600 || Math.abs((b.x0 + b.x1) / 2 - cam.x) > 1500) continue;
    const mid = toCam([(b.x0 + b.x1) / 2, cyMid, b.h / 2], cam);
    if (mid.d < NEAR + 40) continue;
    const els: React.ReactNode[] = [];
    const isDepot = b.kind === 'depot';
    const isHome = b.kind === 'home';
    const top = isDepot ? C.blue : isHome ? '#2C4A86' : `hsl(${218 + rand(b.seed) * 8}, ${38 + rand(b.seed * 2) * 10}%, ${21 + rand(b.seed * 3) * 7}%)`;
    const front = isDepot ? '#1556C7' : isHome ? '#1E3668' : `hsl(${220}, 42%, ${15 + rand(b.seed * 4) * 4}%)`;
    const side = isDepot ? '#0F46A8' : isHome ? '#182C57' : `hsl(${222}, 44%, ${11 + rand(b.seed * 6) * 3}%)`;
    const key = `b${b.seed}`;
    const face = (pts: V3[], fill: string, k: string) => {
      const p = poly(pts, cam);
      if (p) els.push(<polygon key={k} points={p} fill={fill} />);
    };
    if (cam.x < b.x0) face([[b.x0, b.y0, 0], [b.x0, b.y1, 0], [b.x0, b.y1, b.h], [b.x0, b.y0, b.h]], side, `${key}l`);
    if (cam.x > b.x1) face([[b.x1, b.y0, 0], [b.x1, b.y1, 0], [b.x1, b.y1, b.h], [b.x1, b.y0, b.h]], side, `${key}r`);
    if (cam.y < b.y0) {
      face([[b.x0, b.y0, 0], [b.x1, b.y0, 0], [b.x1, b.y0, b.h], [b.x0, b.y0, b.h]], front, `${key}f`);
      // ışıklı pencereler (sıcak amber)
      const floors = Math.floor((b.h - 8) / 26);
      const cols = Math.floor((b.x1 - b.x0 - 12) / 24);
      for (let fl = 0; fl < floors; fl++) {
        for (let c = 0; c < cols; c++) {
          const r = rand(b.seed * 31 + fl * 7 + c * 13);
          const lit = isHome ? true : r < 0.42;
          if (!lit || isDepot) continue;
          const wx = b.x0 + 12 + c * 24;
          const wz = 10 + fl * 26;
          const flick = isHome ? 1 : 0.75 + 0.25 * Math.sin(t * (1 + r * 3) + r * 20);
          const p = poly([[wx, b.y0 - 0.6, wz], [wx + 12, b.y0 - 0.6, wz], [wx + 12, b.y0 - 0.6, wz + 13], [wx, b.y0 - 0.6, wz + 13]], cam);
          if (p) els.push(<polygon key={`${key}w${fl}-${c}`} points={p} fill={r < 0.12 ? '#FFE3A8' : C.amber} opacity={0.9 * flick} />);
        }
      }
      if (isDepot) {
        // depo kepenkleri
        for (let g = 0; g < 2; g++) {
          const gx = b.x0 + 26 + g * 66;
          const p = poly([[gx, b.y0 - 0.6, 0], [gx + 46, b.y0 - 0.6, 0], [gx + 46, b.y0 - 0.6, 34], [gx, b.y0 - 0.6, 34]], cam);
          if (p) els.push(<polygon key={`${key}g${g}`} points={p} fill="#9CC4FF" opacity={0.85} />);
        }
      }
    }
    face([[b.x0, b.y0, b.h], [b.x1, b.y0, b.h], [b.x1, b.y1, b.h], [b.x0, b.y1, b.h]], top, `${key}t`);
    items.push({d: mid.d, el: <g key={key}>{els}</g>});
  }

  // sokak lambaları
  for (let y = -760; y < 2800; y += 150) {
    for (const x of [-92, 92]) {
      const c = toCam([x, y, 44], cam);
      if (c.d < NEAR + 20 || y < cam.y || y > cam.y + 3400) continue;
      const [sx, sy] = proj(c);
      const r = (F * 30) / c.d;
      const g = toCam([x, y, 0], cam);
      const [gx, gy] = proj(g);
      items.push({
        d: c.d - 1,
        el: (
          <g key={`l${x}${y}`}>
            <line x1={gx} y1={gy} x2={sx} y2={sy} stroke="#2A3D66" strokeWidth={Math.max(1, (F * 3) / c.d)} />
            <ellipse cx={gx} cy={gy} rx={r * 2.4} ry={r * 1.1} fill="url(#pool)" />
            <circle cx={sx} cy={sy} r={r * 1.6} fill="url(#lamp)" />
            <circle cx={sx} cy={sy} r={Math.max(1.2, r * 0.22)} fill="#FFE7B8" />
          </g>
        ),
      });
    }
  }
  items.sort((a, b) => b.d - a.d);

  // yollar
  const roads: React.ReactNode[] = [];
  const road = (pts: V3[], fill: string, k: string, op = 1) => {
    const p = poly(pts, cam);
    if (p) roads.push(<polygon key={k} points={p} fill={fill} opacity={op} />);
  };
  const Y0 = cam.y - 400;
  const Y1 = cam.y + 5200;
  for (const cy of CROSS) road([[-2400, cy - 36, 0], [2400, cy - 36, 0], [2400, cy + 36, 0], [-2400, cy + 36, 0]], '#1A2B55', `c${cy}`);
  for (const sx of [-SIDE_X, SIDE_X]) road([[sx - 30, Y0, 0], [sx + 30, Y0, 0], [sx + 30, Y1, 0], [sx - 30, Y1, 0]], '#182850', `s${sx}`);
  road([[-AVE - 22, Y0, 0], [AVE + 22, Y0, 0], [AVE + 22, Y1, 0], [-AVE - 22, Y1, 0]], '#22355F', 'sw');
  road([[-AVE, Y0, 0], [AVE, Y0, 0], [AVE, Y1, 0], [-AVE, Y1, 0]], '#1C2E5A', 'ave');
  for (let y = Math.floor(Y0 / 70) * 70; y < Y1; y += 70) {
    road([[-3, y, 0.5], [3, y, 0.5], [3, y + 34, 0.5], [-3, y + 34, 0.5]], C.amber, `dl${y}`, 0.45);
  }

  // rota
  const drawnLen = routeDraw * ROUTE_LEN;
  const ahead = ribbon(cs, drawnLen, 13, cam);
  const behind = ribbon(0, Math.min(cs, drawnLen), 10, cam);
  const glow = ribbon(cs, drawnLen, 26, cam);

  // işaretler
  const marker = (p: V3, base: number) => {
    const c = toCam(p, cam);
    if (c.d < NEAR + 10) return null;
    const [x, y] = proj(c);
    return {x, y, s: clamp((base * 760) / c.d, base * 0.45, base * 1.05)};
  };
  const depot = marker(DEPOT, 92);
  const home = marker(HOME, 96);
  const courierM = marker([courier[0], courier[1], 0], 104);
  const depotP = spr(f, K.route - 6, SP.pop);
  const homeP = spr(f, K.route + 2, SP.pop);
  const arriveP = spr(f, K.arrive + 2, SP.bouncy);
  const chipP = spr(f, K.mapIn + 10, SP.soft);
  const pulse = (t * 1.2) % 1;

  const stars = new Array(26).fill(0).map((_, i) => ({x: rand(i * 9.1) * SCREEN.w, y: 70 + rand(i * 4.7) * (HORIZON - 150), r: 1 + rand(i * 2.9) * 1.8, tw: 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i))}));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0D1B3A',
        clipPath: reveal < 1 ? `circle(${reveal * 760}px at ${CX}px ${SCREEN.h / 2}px)` : undefined,
        fontFamily: FONT,
      }}
    >
      <svg width={SCREEN.w} height={SCREEN.h} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#060F28" />
            <stop offset="1" stopColor="#1C3874" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14264F" />
            <stop offset="1" stopColor="#0B1834" />
          </linearGradient>
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1C3874" stopOpacity="0.95" />
            <stop offset="1" stopColor="#1C3874" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp">
            <stop offset="0" stopColor="#FFC46B" stopOpacity="0.85" />
            <stop offset="0.35" stopColor="#FFB547" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFB547" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pool">
            <stop offset="0" stopColor="#FFB547" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FFB547" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="townglow" cx="0.5" cy="1" r="0.8">
            <stop offset="0" stopColor="#FFB547" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFB547" stopOpacity="0" />
          </radialGradient>
          <filter id="rglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect x="0" y="0" width={SCREEN.w} height={HORIZON + 2} fill="url(#sky)" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.6 * s.tw} />
        ))}
        <ellipse cx={CX} cy={HORIZON} rx={SCREEN.w * 0.8} ry={90} fill="url(#townglow)" />
        <Mountains shift={-cam.x * 0.03 + 40} amp={150} seed={1.7} color="#1A2F60" base={HORIZON + 2} />
        <Mountains shift={-cam.x * 0.07 - 120} amp={92} seed={4.2} color="#12244C" base={HORIZON + 3} />
        <rect x="0" y={HORIZON} width={SCREEN.w} height={SCREEN.h - HORIZON} fill="url(#ground)" />
        {roads}
        {items.map((it) => it.el)}
        <rect x="0" y={HORIZON} width={SCREEN.w} height={240} fill="url(#fog)" />
        {/* rota: geçilen kısım soluk, kalan kısım parlak */}
        <g opacity={0.55}>
          {behind.map((p, i) => (
            <polygon key={`rb${i}`} points={p} fill="#8DB6FF" />
          ))}
        </g>
        <g filter="url(#rglow)" opacity={0.75}>
          {glow.map((p, i) => (
            <polygon key={`rg${i}`} points={p} fill={C.blueLight} />
          ))}
        </g>
        {ahead.map((p, i) => (
          <polygon key={`ra${i}`} points={p} fill="#5FA0FF" />
        ))}
        {/* varışta evin çevresinde yayılan halkalar */}
        {home && f > K.arrive
          ? [0, 10, 20].map((d) => {
              const p = ((f - K.arrive - d) / 30) % 1;
              if (p < 0) return null;
              return <ellipse key={d} cx={home.x} cy={home.y + home.s * 0.9} rx={home.s * (0.4 + p * 1.6)} ry={home.s * (0.16 + p * 0.6)} fill="none" stroke={C.amber} strokeWidth={3} opacity={(1 - p) * 0.9} />;
            })
          : null}
      </svg>

      {/* depo */}
      {depot ? (
        <div style={{position: 'absolute', left: depot.x - depot.s / 2, top: depot.y - depot.s / 2, width: depot.s, height: depot.s, transform: `scale(${depotP})`}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: depot.s * 0.28, background: `linear-gradient(160deg, ${C.blueLight}, ${C.blueDeep})`, border: `${depot.s * 0.05}px solid #fff`, boxShadow: '0 10px 24px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <WarehouseIcon size={depot.s * 0.58} color="#fff" stroke={2.1} />
          </div>
        </div>
      ) : null}
      {/* ev */}
      {home ? (
        <div style={{position: 'absolute', left: home.x - home.s / 2, top: home.y - home.s / 2, width: home.s, height: home.s, transform: `scale(${homeP * (1 + 0.12 * Math.exp(-Math.max(0, f - K.arrive) * 0.2) * (f > K.arrive ? 1 : 0))})`}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff', boxShadow: `0 0 0 ${home.s * 0.07}px rgba(255,181,71,0.55), 0 10px 26px rgba(0,0,0,0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <HouseIcon size={home.s * 0.58} color={C.blue} stroke={2.2} />
          </div>
        </div>
      ) : null}
      {/* kurye */}
      {courierM && f >= K.route ? (
        <div style={{position: 'absolute', left: courierM.x - courierM.s / 2, top: courierM.y - courierM.s * 0.92, width: courierM.s, height: courierM.s, opacity: 1 - prog(f, K.arrive + 4, 8) * 0.0}}>
          <div style={{position: 'absolute', left: '15%', right: '15%', bottom: -courierM.s * 0.1, height: courierM.s * 0.18, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(4px)'}} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#fff',
              border: `${courierM.s * 0.05}px solid ${C.blue}`,
              boxShadow: `0 0 0 ${courierM.s * (0.08 + pulse * 0.3)}px rgba(59,139,255,${0.45 * (1 - pulse)}), 0 10px 22px rgba(0,0,0,0.45)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateY(${Math.sin(t * 18) * 1.2}px)`,
            }}
          >
            <CourierIcon size={courierM.s * 0.74} lean={u > 0 && u < 1 ? -4 : 0} />
          </div>
        </div>
      ) : null}
      {/* Kapında! rozeti */}
      {home && arriveP > 0 ? (
        <div style={{position: 'absolute', left: home.x - 150, top: home.y - home.s * 0.55 - 104, width: 300, display: 'flex', justifyContent: 'center', transform: `scale(${arriveP})`, transformOrigin: '50% 100%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 80, padding: '0 30px 0 16px', borderRadius: 40, background: C.amber, boxShadow: '0 12px 30px rgba(255,160,40,0.45)', color: C.ink, fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <CheckIcon size={32} stroke={3.2} color={C.amber} progress={ease.outCubic(prog(f, K.arrive + 6, 8))} />
            </div>
            Kapında!
          </div>
          <div style={{position: 'absolute', left: 150 - 12, top: 70, width: 24, height: 24, background: C.amber, transform: 'rotate(45deg)', borderRadius: 4, zIndex: -1}} />
        </div>
      ) : null}

      {/* üst arayüz */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'linear-gradient(180deg, rgba(6,15,40,0.75), rgba(6,15,40,0))'}} />
      <StatusBar time={clockAt(Math.round(60 * u))} dark={false} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 76, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - chipP) * -90}px)`, opacity: clamp(chipP * 2)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 68, padding: '0 30px 0 14px', borderRadius: 34, background: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,0.35)', fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em'}}>
          <div style={{position: 'relative', width: 46, height: 46, borderRadius: 23, background: '#EAF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <CourierIcon size={36} />
          </div>
          Kuryen yolda
          <span style={{position: 'relative', width: 14, height: 14, marginLeft: 4}}>
            <span style={{position: 'absolute', inset: 0, borderRadius: 7, background: C.blue}} />
            <span style={{position: 'absolute', inset: 0, borderRadius: 7, border: `2px solid ${C.blue}`, transform: `scale(${1 + pulse * 1.8})`, opacity: 1 - pulse}} />
          </span>
        </div>
      </div>
    </div>
  );
};
