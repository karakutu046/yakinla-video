// Sahneler: jenerik, üç gün, haftalık tahmin, vaat ve kapanış kartı
import {clamp, ease, lerp, prog, rnd, spring, TM, up, win} from '../lib';
import {drawMap, vanProgress} from './map';
import {sting, studioBg, scanAndVignette, tempBlock, ticker, topBar, wxLabel} from './studio';
import {at, Bez, bezAt, bezD, iconC, logo, n, op, T, trail} from './svg';
import {van} from './van';
import {frost, glassDrops, mudScreen, rain, snow, wiper} from './weather';

const D = TM.days;
const WK = TM.weekly.start;
const PR = TM.promise;
const END = TM.end.start;
const CAMUR = (D[2] as {camur: number}).camur;

const DAYS = [
  {day: 'PZT', name: 'Pazartesi', word: 'YAĞMURLU', label: 'YAĞMUR', temp: 8, icons: ['i-rain', 'i-rain']},
  {day: 'SAL', name: 'Salı', word: 'KARLI', label: 'KAR', temp: -3, icons: ['i-snow', 'i-flake']},
  {day: 'ÇAR', name: 'Çarşamba', word: 'ÇAMURLU', label: 'ÇAMUR', temp: 6, icons: ['i-mud', 'i-partly']},
];

// ---------------------------------------------------------------- jenerik
export const intro = (f: number) => {
  const out = 1 - prog(f, D[0].start + 7, 7);
  if (out <= 0) return '';
  const cx = 90;
  const cy = 118;
  // radar
  const sweepA = f * 7;
  const radar =
    [62, 46, 30].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5aa6ff" stroke-width="${0.7 + i * 0.2}" opacity="${0.35 + i * 0.15}"/>`).join('') +
    `<g stroke="#5aa6ff" stroke-width="0.5" opacity="0.3"><line x1="${cx - 66}" y1="${cy}" x2="${cx + 66}" y2="${cy}"/><line x1="${cx}" y1="${cy - 66}" x2="${cx}" y2="${cy + 66}"/></g>` +
    `<g transform="rotate(${n(sweepA)} ${cx} ${cy})"><path d="M${cx} ${cy} L${cx} ${cy - 62} A62 62 0 0 1 ${n(cx + 62 * Math.sin(1))} ${n(cy - 62 * Math.cos(1))} Z" fill="url(#g-radar)"/></g>` +
    [...Array(6)]
      .map((_, i) => {
        const a = rnd(i * 4.4) * 360;
        const r = 18 + rnd(i * 2.7) * 40;
        const d = (((sweepA - a) % 360) + 360) % 360;
        const o = d < 160 ? 1 - d / 160 : 0;
        const rad = ((a - 90) * Math.PI) / 180;
        return `<circle cx="${n(cx + Math.cos(rad) * r)}" cy="${n(cy + Math.sin(rad) * r)}" r="1.6" fill="#ffb15e" opacity="${n(o)}"/>`;
      })
      .join('');
  // yörüngede dönen hava ikonları
  const orbit = ['i-rain', 'i-flake', 'i-mud', 'i-sun']
    .map((id, i) => {
      const a = ((i / 4) * 360 + f * 1.1 - 60) * (Math.PI / 180);
      const sc = spring(f, 5 + i * 3, 14, 0.5);
      return iconC(id, cx + Math.cos(a) * 52, cy + Math.sin(a) * 52 + Math.sin(f * 0.12 + i) * 1.2, 22, sc);
    })
    .join('');
  const lg = spring(f, 3, 13, 0.5);
  const halo = (f % 36) / 36;
  const center =
    at(cx, cy, `<circle r="${n(22 + halo * 16)}" fill="none" stroke="#fff" stroke-width="1.2" opacity="${n(0.5 * (1 - halo))}"/><circle r="22" fill="#fff" filter="url(#f-soft2)"/>${logo(-15, -15, 30)}`, lg);
  // AFŞİN çarpması
  const tTitle = TM.intro.title;
  const slam = (ff: number) => {
    const k = prog(ff, tTitle, 6);
    if (ff < tTitle) return '';
    const s = lerp(1.9, 1, ease.in(k));
    return op(Math.min(1, k * 3), at(90, 206, T(0, 0, 40, up('Afşin'), {w: 900, ls: 1.5}), s));
  };
  const shake = f >= tTitle + 6 && f < tTitle + 10 ? (rnd(f) - 0.5) * 2.2 * (1 - (f - tTitle - 6) / 4) : 0;
  const bandK = ease.outExpo(prog(f, TM.intro.band, 9));
  const band =
    `<clipPath id="c-iband"><rect x="18" y="214" width="${n(144 * bandK)}" height="24"/></clipPath>` +
    `<g clip-path="url(#c-iband)"><rect x="18" y="214" width="144" height="24" rx="3" fill="url(#g-orange)" filter="url(#f-soft)"/>${T(90, 231, 14, up('Hava Durumu'), {w: 900, ls: 1})}</g>`;
  const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(f * 0.35));
  const live = op(prog(f, 6, 6), `<rect x="8" y="42" width="30" height="12" rx="3" fill="#e5322d"/><circle cx="14" cy="48" r="2" fill="#fff" opacity="${n(blink)}"/>${T(27, 50.5, 5.8, 'CANLI', {w: 800})}`);
  const presents = op(prog(f, 28, 8), T(90, 250, 7, 'sunar: Yakınla', {w: 700, op: 0.85}));
  return op(
    out,
    at(shake, shake * 0.6, radar + orbit + center + trail(f, slam, 1, 3, 0.3) + band + presents) + live,
  );
};

/** Açılış: CRT ekran açılması (beyaz çizgi → tam ekran) */
export const crt = (f: number) => {
  if (f >= 10) return '';
  const k = ease.outExpo(prog(f, 1, 7));
  const h = lerp(0.6, 320, k);
  const flash = 1 - prog(f, 3, 7);
  return (
    `<path d="M0 0 H180 V${n(160 - h / 2)} H0 Z M0 ${n(160 + h / 2)} H180 V320 H0 Z" fill="#000"/>` +
    `<rect x="0" y="${n(160 - h / 2)}" width="180" height="${n(h)}" fill="#fff" opacity="${n(flash * 0.85)}"/>` +
    (f < 3 ? `<rect x="${n(90 - 90 * prog(f, 0, 2))}" y="159.6" width="${n(180 * prog(f, 0, 2))}" height="0.8" fill="#fff"/>` : '')
  );
};

// ---------------------------------------------------------------- günler
/** Hangi günün durumunun ekranda olduğu (bant ortasında değişir) */
const dayAt = (f: number) => (f < D[1].start + 10 ? 0 : f < D[2].start + 10 ? 1 : 2);

export const days = (f: number) => {
  const vis = win(f, D[0].start + 7, 7, WK + 7, 7);
  if (vis <= 0) return {back: '', front: ''};
  const i = dayAt(f);
  const d = DAYS[i];
  const S = D[i].start;
  const K = D[i].kapinda;
  const next = i < 2 ? D[i + 1].start : WK;

  const rainA = win(f, D[0].start + 8, 10, D[1].start + 6, 8);
  const snowA = win(f, D[1].start + 8, 10, D[2].start + 6, 8);
  const mudA = win(f, D[2].start + 8, 10, WK + 6, 8);

  const vanA = Math.min(prog(f, S + 12, 6), 1 - prog(f, next + 4, 5));
  const p = vanProgress(f, S + 20, K);
  const map = drawMap(f, {rain: rainA, snow: snowA, mud: mudA, van: p, vanA, arrive: K, arriveA: 1 - prog(f, next + 4, 5)});

  // haritadaki büyük hava ikonları
  const icA = spring(f, S + 12, 13, 0.45) * (1 - ease.in(prog(f, next + 2, 8)));
  const icons =
    iconC(d.icons[0], 64, 104 + Math.sin(f * 0.1) * 1.6, 42, icA) +
    iconC(d.icons[1], 118, 100 + Math.sin(f * 0.1 + 1.6) * 1.4, d.icons[1] === 'i-flake' ? 24 : 30, spring(f, S + 16, 13, 0.45) * (1 - ease.in(prog(f, next + 2, 8))), d.icons[1] === 'i-flake' ? f * 1.2 : 0);

  // sıcaklık ve etiketler
  const prevTemp = i === 0 ? 0 : DAYS[i - 1].temp;
  const temp = op(i === 0 ? prog(f, S + 10, 6) : 1, tempBlock(prevTemp, d.temp, i === 0 ? 1 : prog(f, S + 10, 12), i === 1 ? 1 : 0));
  const lblA = prog(f, S + 12, 8);
  const label = wxLabel(d.word, `${d.name} · Afşin`, lblA, (1 - ease.out(lblA)) * 6);

  // ekran camı efektleri
  const glass =
    op(rainA, rain(f, 77, 0, 0, 180, 320, {count: 40, len: 22, speed: 11, sw: 0.6, op: 0.22, col: '#e6f0ff'}) + glassDrops(f, 31, 26)) +
    op(snowA, snow(f, 41, 0, 0, 180, 320, {count: 34, speed: 1.4, rmin: 0.8, rmax: 2.6, sway: 5, op: 0.95}) + snow(f, 91, 0, 0, 180, 320, {count: 8, speed: 2.6, rmin: 2.6, rmax: 4.2, sway: 8, op: 0.75, glow: true})) +
    frost(snowA * ease.out(prog(f, D[1].start + 14, 50)) * 0.9) +
    mudScreen(f, CAMUR, CAMUR + 26) +
    wiper(f, CAMUR + 26);

  const push = 1 + 0.035 * ease.inOutSine(prog(f, S, next - S));
  const scene = `<g transform="translate(90 140) scale(${n(push)}) translate(-90 -140)">${map + icons}</g>`;
  return {back: op(vis, scene + temp + label), front: op(vis, glass)};
};

const snowAccAt = (f: number) => win(f, D[1].start + 8, 10, D[2].start + 6, 8) * ease.out(prog(f, D[1].start + 10, 70));

/** Üst bant ve kayan alt bant: gün kutusu her geçişte dikey çevrilir */
const PILL = [
  {at: D[1].start + 4, from: 'PZT', to: 'SAL'},
  {at: D[2].start + 4, from: 'SAL', to: 'ÇAR'},
  {at: WK + 4, from: 'ÇAR', to: 'HAFTA'},
];
export const chrome = (f: number) => {
  const a = win(f, D[0].start + 7, 7, PR.start + 2, 8);
  if (a <= 0) return '';
  let label = 'PZT';
  let flip = 0;
  for (const t of PILL)
    if (f >= t.at) {
      flip = prog(f, t.at, 12);
      label = flip < 0.5 ? t.from : t.to;
    }
  const i = dayAt(f);
  const K = D[i].kapinda;
  const flash = f >= K && f < WK ? 1 - prog(f, K, 10) : 0;
  const snowAcc = snowAccAt(f);
  const tick = win(f, D[0].start + 7, 7, PR.start, 8);
  return op(a, topBar(f, label, flip, snowAcc) + op(tick, ticker(f, f < WK + 10 ? DAYS[i].label : 'HAFTA', flash, snowAcc)));
};

/** Gün ve bölüm geçiş bantları */
export const stings = (f: number) =>
  D.map((d, i) => sting(f - d.start, up(DAYS[i].name))).join('') + sting(f - WK, 'HAFTALIK');

// ---------------------------------------------------------------- haftalık tahmin
const WEEK = [
  ['PZT', 'i-rain'],
  ['SAL', 'i-snow'],
  ['ÇAR', 'i-mud'],
  ['PER', 'i-partly'],
  ['CUM', 'i-sun'],
  ['CMT', 'i-rain'],
  ['PAZ', 'i-snow'],
];
const cardPos = (i: number) => (i < 4 ? {x: 13 + i * 40, y: 96} : {x: 33 + (i - 4) * 40, y: 162});

export const weekly = (f: number) => {
  const vis = prog(f, WK + 7, 6) * (1 - prog(f, PR.start + 4, 8));
  if (vis <= 0) return '';
  const collapse = ease.in(prog(f, PR.start, 11));
  const title = op(prog(f, WK + 12, 8) * (1 - collapse), at(0, (1 - ease.out(prog(f, WK + 12, 8))) * 6, T(90, 82, 14, `HAFTALIK <tspan fill="#ffa743">TAHMİN</tspan>`, {w: 900, ls: 0.5})));
  const cards = WEEK.map(([day, ic], i) => {
    const t0 = WK + 14 + i * 3;
    const k = spring(f, t0, 15, 0.5);
    if (k <= 0.001) return '';
    const {x, y} = cardPos(i);
    const cx = x + 17;
    const ck = spring(f, WK + 34 + i * 2.5, 17, 0.42);
    const body =
      `<rect x="${x}" y="${y}" width="34" height="58" rx="7" fill="url(#g-card)" stroke="#fff" stroke-opacity="0.24" stroke-width="0.7" filter="url(#f-soft)"/>` +
      T(cx, y + 11, 7, day, {w: 900}) +
      iconC(ic, cx, y + 27, 22, 1, 0, true) +
      (ck > 0.001 ? iconC('i-ok', cx, y + 47, 13, ck, 0, false) : `<circle cx="${cx}" cy="${y + 47}" r="5.5" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-dasharray="1.5 1.5"/>`);
    // toplanma: kartlar merkeze çekilir
    const tx = lerp(0, 90 - cx, collapse);
    const ty = lerp(0, 150 - (y + 29), collapse);
    return at(cx + tx, y + 29 + ty + (1 - k) * 18, at(-cx, -(y + 29), body), lerp(1, 0.2, collapse) * (0.6 + 0.4 * k), 0);
  }).join('');
  return op(vis, title + cards);
};

// ---------------------------------------------------------------- vaat
const MINI: Bez = [52, 146, 74, 164, 106, 164, 128, 146];

export const promise = (f: number) => {
  const vis = win(f, PR.start + 2, 6, END + 4, 6);
  if (vis <= 0) return '';
  const trio = ['i-rain', 'i-snow', 'i-mud']
    .map((id, i) => iconC(id, 46 + i * 44, 66 + Math.sin(f * 0.1 + i) * 1.4, 30, spring(f, PR.start + 4 + i * 3, 14, 0.45)))
    .join('');
  const words = ['Hava', 'ne', 'olursa', 'olsun,'];
  const lk = prog(f, PR.hava, 7);
  const line1 = op(
    lk,
    T(90, 108 + (1 - ease.out(lk)) * 6, 13, words.map((w, i) => `<tspan fill-opacity="${n(ease.out(prog(f, PR.hava + i * 4, 7)))}">${w}</tspan>`).join(' '), {w: 900}),
  );
  // mini rota
  const vp = ease.inOut(prog(f, PR.depo, Math.max(1, PR.kapinda - PR.depo)));
  const pt = bezAt(MINI, vp);
  const routeA = prog(f, PR.depo - 6, 8);
  const mini = op(
    routeA,
    `<path d="${bezD(MINI)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 2" stroke-dashoffset="${n(-(f * 0.45) % 5)}" opacity="0.7"/>` +
      (vp > 0.002 ? `<path d="${bezD(MINI)}" pathLength="1" fill="none" stroke="url(#g-route)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${n(vp)} 2" filter="url(#f-glow)"/>` : '') +
      iconC('i-depot', 40, 146, 22) +
      iconC('i-home', 140, 144, 24, 1 + (f >= PR.kapinda ? 0.14 * Math.sin(clamp((f - PR.kapinda) / 10) * Math.PI) : 0)) +
      at(pt.x, pt.y + (vp > 0 && vp < 1 ? Math.sin(f * 1.7) * 0.3 : 0), at(-50 * 0.2, -55 * 0.2, van({wheel: vp * 900, shadow: 0.35}), 0.2), 1, pt.a * 0.5) +
      (f >= PR.kapinda ? iconC('i-ok', 152, 132, 14, spring(f, PR.kapinda, 17, 0.42), 0, false) : ''),
  );
  const depo = op(prog(f, PR.depo, 8), T(90, 182 + (1 - ease.out(prog(f, PR.depo, 8))) * 5, 8.4, 'Afşin’deki depomuzdan', {w: 700, c: '#a9d0ff'}));
  // ortalama 60 dakikada
  const cnt = Math.round(60 * ease.out(prog(f, PR.sixty, 22)));
  const sixtyA = prog(f, PR.sixty - 2, 6);
  const sixty =
    op(sixtyA, T(90, 202, 8.4, 'ortalama', {w: 700, op: 0.85}) + T(90, 226, 24, `${cnt} dakikada`, {w: 900, ls: -0.4}) + `<rect x="34" y="231.5" width="112" height="2.4" rx="1.2" fill="#fff" opacity="0.15"/><rect x="34" y="231.5" width="${n(112 * ease.out(prog(f, PR.sixty, 22)))}" height="2.4" rx="1.2" fill="url(#g-bar)"/>`);
  const kap = spring(f, PR.kapinda, 15, 0.45);
  const kapinda = kap > 0.001 ? at(90, 248, T(6, 0, 15, 'kapında.', {w: 900, c: '#7cf5b2'}) + iconC('i-ok', -33, -5, 14, 1, 0, false), kap) : '';
  return op(vis, trio + line1 + mini + depo + sixty + kapinda);
};

// ---------------------------------------------------------------- kapanış kartı
export const endCard = (f: number) => {
  if (f < END) return '';
  const r = 340 * ease.inOut(prog(f, END, 14));
  const ef = f - END;
  const bg =
    `<rect width="180" height="320" fill="url(#g-end)"/>` +
    `<circle cx="${n(60 + Math.sin(ef * 0.03) * 20)}" cy="80" r="90" fill="url(#g-endglow)"/>` +
    `<circle cx="${n(140 - Math.sin(ef * 0.025) * 16)}" cy="250" r="80" fill="url(#g-endglow)" opacity="0.6"/>` +
    ['i-rain', 'i-snow', 'i-mud', 'i-flake', 'i-sun']
      .map((id, i) => {
        const x = (rnd(i * 3.7) * 220 + ef * 0.25) % 220 - 20;
        const y = 30 + rnd(i * 9.1) * 260 - ef * 0.12;
        return `<g opacity="0.13">${iconC(id, x, y, 26 + rnd(i) * 10, 1, 0, false)}</g>`;
      })
      .join('');
  const lg = spring(f, TM.end.logo, 13, 0.48);
  const halo = (ef % 40) / 40;
  const logoBlock = at(
    90,
    84,
    `<circle r="${n(24 + halo * 18)}" fill="none" stroke="#fff" stroke-width="1.2" opacity="${n(0.6 * (1 - halo))}"/>` +
      `<circle r="${n(24 + ((halo + 0.5) % 1) * 18)}" fill="none" stroke="#fff" stroke-width="0.8" opacity="${n(0.6 * (1 - ((halo + 0.5) % 1)))}"/>` +
      `<circle r="24" fill="#fff" filter="url(#f-soft2)"/>${logo(-17, -17, 34)}`,
    lg,
  );
  const rise = (t0: number, inner: string, d = 8) => op(prog(f, t0, d), at(0, (1 - ease.out(prog(f, t0, d))) * 7, inner));
  const AS = 17 * (575 / 192);
  const GP = 17 * (648 / 192);
  const bx = 90 - (AS + GP + 4) / 2;
  const body =
    bg +
    logoBlock +
    rise(END + 8, T(90, 136, 29, 'Yakınla', {w: 800, ls: -0.8})) +
    rise(END + 12, T(90, 156, 10.5, 'Hava ne olursa olsun,', {w: 800, c: '#ffe2b0'})) +
    rise(END + 15, T(90, 169, 10.5, 'Yakınla kapında.', {w: 800, c: '#ffe2b0'})) +
    rise(END + 19, T(90, 183, 6.3, 'Afşin’deki depomuzdan, ortalama 60 dakikada', {w: 600, op: 0.92})) +
    rise(
      END + 22,
      `<image href="${'{{AS}}'}" x="${n(bx)}" y="192" width="${n(AS)}" height="17"/><image href="${'{{GP}}'}" x="${n(bx + AS + 4)}" y="192" width="${n(GP)}" height="17"/>`,
    ) +
    rise(END + 25, T(90, 224, 8.4, 'yakinla.com', {w: 800})) +
    rise(END + 27, T(90, 236, 5.8, 'Şu an aktif bölgemiz: Kahramanmaraş Afşin', {w: 600, op: 0.82}));
  return `<clipPath id="c-iris"><circle cx="90" cy="160" r="${n(r)}"/></clipPath><g clip-path="url(#c-iris)">${body}</g>`;
};

// ---------------------------------------------------------------- tüm kare
export const drawFrame = (f: number, assets: {as: string; gp: string}) => {
  const dz = days(f);
  const s =
    studioBg(f) +
    intro(f) +
    dz.back +
    weekly(f) +
    promise(f) +
    chrome(f) +
    dz.front +
    stings(f) +
    scanAndVignette() +
    endCard(f) +
    crt(f);
  return s.replace('{{AS}}', assets.as).replace('{{GP}}', assets.gp);
};

