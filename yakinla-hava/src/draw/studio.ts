// TV stüdyosu: arka plan, üst bant, sıcaklık bloğu, kayan alt bant ve gün geçiş bandı
import {clamp, ease, rnd, up} from '../lib';
import {at, logo, n, op, T} from './svg';

export const studioBg = (f: number) => {
  // perspektif zemin ızgarası (alt, güvenli alan dışı dekor)
  let grid = '';
  for (let i = -8; i <= 8; i++) grid += `<line x1="${90 + i * 4}" y1="258" x2="${90 + i * 34}" y2="330"/>`;
  for (let k = 0; k < 7; k++) {
    const t = (k + ((f * 0.02) % 1)) / 7;
    const y = 258 + Math.pow(t, 2.2) * 70;
    grid += `<line x1="0" y1="${n(y)}" x2="180" y2="${n(y)}" opacity="${n(t)}"/>`;
  }
  const sweepX = ((f * 1.6) % 420) - 160;
  return (
    `<rect width="180" height="320" fill="url(#g-studio)"/>` +
    `<circle cx="90" cy="132" r="128" fill="url(#g-glow)"/>` +
    `<g stroke="#5aa6ff" stroke-width="0.4" opacity="0.22">${grid}</g>` +
    // yüzen ışık lekeleri
    [...Array(7)]
      .map((_, i) => {
        const x = (rnd(i * 3.3) * 220 + f * (0.1 + rnd(i) * 0.15)) % 220 - 20;
        const y = 40 + rnd(i * 7.1) * 230 + Math.sin(f * 0.03 + i) * 6;
        return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(10 + rnd(i * 5) * 14)}" fill="${i % 3 ? '#3d8bff' : '#ff9a3d'}" opacity="0.12" filter="url(#f-blur2)"/>`;
      })
      .join('') +
    `<rect x="${n(sweepX)}" y="-20" width="70" height="360" fill="url(#g-sweep)" transform="rotate(14 90 160)"/>`
  );
};

export const scanAndVignette = () => `<rect width="180" height="320" fill="url(#pt-scan)"/><rect width="180" height="320" fill="url(#g-vignette)"/>`;

/** Üst bant: "AFŞİN HAVA" + CANLI + gün kutusu (gün değişirken dikey çevrilir) */
export const topBar = (f: number, day: string, flip: number, snowCap = 0) => {
  const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(f * 0.35));
  // flip: 0→1 arası; 0.5'te kutu kenardan görünür ve yazı değişir
  const sy = Math.max(0.04, Math.abs(Math.cos(flip * Math.PI)));
  const cap = (x: number, w: number) =>
    snowCap > 0.02
      ? `<path d="M${x - 1} ${n(41)} Q${x + w * 0.2} ${n(41 - 3.4 * snowCap)} ${x + w * 0.45} ${n(40.5 - 2.4 * snowCap)} Q${x + w * 0.75} ${n(39.5 - 3.8 * snowCap)} ${x + w + 1} ${n(41)} Z" fill="#fff" opacity="${n(clamp(snowCap * 1.4))}"/>`
      : '';
  return (
    `<rect x="8" y="40" width="84" height="16" rx="5" fill="url(#g-orange)" filter="url(#f-soft)"/>` +
    `<circle cx="17" cy="48" r="6" fill="#fff"/>${logo(11.6, 42.6, 10.8)}` +
    T(26, 51.6, 7.6, up('Afşin Hava'), {w: 900, a: 'start', ls: 0.3}) +
    `<rect x="96" y="42.5" width="26" height="11" rx="3" fill="#e5322d"/><circle cx="101.5" cy="48" r="1.9" fill="#fff" opacity="${n(blink)}"/>` +
    T(112.5, 50.3, 5.4, 'CANLI', {w: 800}) +
    `<g transform="translate(150 48) scale(1 ${n(sy)})"><rect x="-22" y="-8" width="44" height="16" rx="5" fill="#fff" filter="url(#f-soft)"/>${T(0, 3.3, 8.4, day, {w: 900, c: '#0c2f7a'})}</g>` +
    cap(8, 84) +
    cap(128, 44)
  );
};

/** Büyük sıcaklık: eski değer yukarı kayar, yenisi alttan gelir */
export const tempBlock = (from: number, to: number, t: number, ice = 0) => {
  const k = ease.inOut(t);
  const fill = ice > 0.5 ? 'url(#g-temp-ice)' : 'url(#g-temp)';
  const val = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(v)}°`;
  return (
    `<clipPath id="c-temp"><rect x="6" y="198" width="62" height="38"/></clipPath>` +
    `<g clip-path="url(#c-temp)" filter="url(#f-soft)">` +
    (k < 1 ? T(12, n(230 - k * 36), 32, val(from), {w: 900, a: 'start', c: fill, ls: -1}) : '') +
    (k > 0 ? T(12, n(266 - k * 36), 32, val(to), {w: 900, a: 'start', c: fill, ls: -1}) : '') +
    `</g>`
  );
};

/** Hava adı ve gün adı (sıcaklığın sağında) */
export const wxLabel = (word: string, sub: string, a: number, dy = 0) =>
  op(a, at(0, dy, T(70, 216, 10.5, word, {w: 900, a: 'start', ls: 0.4}) + T(70, 228, 6.2, sub, {w: 600, a: 'start', op: 0.8})));

/** Kayan alt bant */
export const ticker = (f: number, label: string, flash = 0, snowCap = 0) => {
  const W = 92;
  const off = (f * 0.9) % W;
  let items = '';
  for (let i = 0; i < 3; i++)
    items += T(54 - off + i * W, 249.4, 7.4, 'Yakınla: kapında', {w: 800, a: 'start'}) + `<circle cx="${n(54 - off + i * W + W - 10)}" cy="246.8" r="1.5" fill="#fff"/>`;
  return (
    `<rect x="0" y="238" width="180" height="16" fill="url(#g-orange)" filter="url(#f-soft)"/>` +
    `<clipPath id="c-tick"><rect x="50" y="238" width="130" height="16"/></clipPath><g clip-path="url(#c-tick)">${items}</g>` +
    `<rect x="0" y="238" width="50" height="16" fill="url(#g-orange-d)"/>` +
    T(25, 249.4, 7.4, label, {w: 900}) +
    (flash > 0.01 ? `<rect x="0" y="238" width="180" height="16" fill="#fff" opacity="${n(flash * 0.55)}"/>` : '') +
    (snowCap > 0.02 ? `<path d="M0 238.5 Q30 ${n(238 - 3 * snowCap)} 60 ${n(237.6 - 2 * snowCap)} T120 ${n(237.4 - 2.6 * snowCap)} T180 238.5 Z" fill="#fff" opacity="${n(clamp(snowCap * 1.4))}"/>` : '')
  );
};

/** Gün geçiş bandı (TV "sting"): hızla girer, ortada durur, hızla çıkar. t: başlangıçtan beri kare */
export const STING = 26;
export const sting = (t: number, label: string, sub = 'TAHMİN') => {
  if (t < 0 || t > STING) return '';
  const xAt = (tt: number) => {
    if (tt < 8) return 220 * (1 - ease.outExpo(tt / 8));
    if (tt < 15) return -2 * ((tt - 8) / 7);
    return -2 - 240 * ease.inExpo((tt - 15) / 9);
  };
  const band = (tt: number) => {
    const x = xAt(tt);
    // mavi alt bant girerken geriden gelir, çıkarken önden gider
    const xb = tt < 15 ? xAt(tt - 2.2) : xAt(tt + 1.2);
    return (
      `<g transform="rotate(-7 90 140)">` +
      `<rect x="${n(-50 + xb)}" y="110" width="280" height="60" fill="url(#g-band-blue)"/>` +
      `<g transform="translate(${n(x)} 0)"><rect x="-50" y="117" width="280" height="46" fill="url(#g-orange)"/>` +
      `<rect x="-50" y="117" width="280" height="3" fill="#fff" opacity="0.35"/>` +
      T(90, 129.6, 6.4, sub, {w: 800, ls: 2.2, op: 0.9}) +
      T(90, 153, label.length > 8 ? 21 : 25, label, {w: 900, ls: 0.4}) +
      `</g></g>`
    );
  };
  // hızlı bölümlerde hareket izi
  const speed = Math.abs(xAt(t) - xAt(t - 0.5));
  let s = '';
  if (speed > 3) for (let k = 3; k >= 1; k--) s += op(0.22 * (1 - (k - 1) / 3), band(t - k * 0.35));
  return s + band(t);
};

