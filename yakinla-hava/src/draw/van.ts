// Uygulamadaki logolu beyaz Yakınla minibüsü (yerel 100×56 birim, sağa bakar; tekerlek tabanı y≈55)
import {logo, n, op, splats} from './svg';

export type VanOpts = {lights?: number; wet?: number; snow?: number; mud?: number; wheel?: number; shadow?: number};

export const van = (o: VanOpts = {}) => {
  const mud = o.mud ?? 0;
  const wheel = (cx: number) =>
    `<g transform="translate(${cx} 47)"><circle r="8.4" fill="#141924"/><circle r="4.6" fill="url(#g-van-rim)"/>` +
    `<g transform="rotate(${n(o.wheel ?? 0)})" stroke="#4a5262" stroke-width="1.2" stroke-linecap="round"><line x1="0" y1="-3.8" x2="0" y2="3.8"/><line x1="-3.8" y1="0" x2="3.8" y2="0"/></g>` +
    `<circle r="1.5" fill="#2a3140"/>${mud > 0.05 ? op(mud, `<circle r="8" fill="none" stroke="#6b4a2b" stroke-width="2.6" stroke-dasharray="5 3"/>`) : ''}</g>`;
  return (
    `<ellipse cx="50" cy="55.5" rx="49" ry="3.4" fill="#000" opacity="${o.shadow ?? 0.3}"/>` +
    (o.lights ? op(o.lights, `<path d="M97 27 L190 6 L190 52 Z" fill="#fff3d0" opacity="0.22"/>`) : '') +
    `<path d="M2 12 Q2 6 8 6 H62 Q66 6 69 9 L82 22 Q97 24 99 30 V44 Q99 47 95 47 H5 Q2 47 2 44 Z" fill="url(#g-van)" stroke="#aebad0" stroke-width="0.7"/>` +
    `<path d="M66 10 L79 23 H66 Z" fill="url(#g-van-win)"/><rect x="56" y="10" width="8" height="13" rx="1" fill="url(#g-van-win)"/>` +
    `<path d="M67 12 L71 12 L66 18 Z" fill="#fff" opacity="0.35"/><path d="M57 11 L60 11 L57 15 Z" fill="#fff" opacity="0.35"/>` +
    `<path d="M2 33 H99 V37 H2 Z" fill="#1F73F0"/><path d="M2 37 H99 V44 Q99 47 95 47 H5 Q2 47 2 44 Z" fill="#0E5FE0"/>` +
    logo(8, 9, 21) +
    `<text x="29" y="23" font-family="Inter, sans-serif" font-weight="800" font-size="8.6" fill="#1F73F0">Yakınla</text>` +
    `<line x1="54" y1="8" x2="54" y2="45" stroke="#aebad0" stroke-width="0.6"/><rect x="47" y="25" width="4" height="1.4" rx="0.7" fill="#8a96aa"/>` +
    `<rect x="94" y="27" width="5" height="4" rx="1" fill="#fff6dc"/>` +
    (o.lights ? op(o.lights, `<circle cx="97" cy="29" r="6" fill="#fff3d0" opacity="0.5" filter="url(#f-glow)"/>`) : '') +
    `<rect x="2" y="30" width="3" height="3" rx="0.8" fill="#ff4a3a"/>` +
    (o.snow ? op(o.snow, `<path d="M4 7 Q6 0.5 14 1.5 H58 Q64 1 64 7 Z" fill="#fff"/><path d="M70 12 Q76 10 80 17 L74 14 Z" fill="#fff"/>`) : '') +
    (o.wet ? op(o.wet, `<path d="M6 13 H60" stroke="#fff" stroke-width="1.1" opacity="0.7"/><path d="M8 39 H96" stroke="#fff" stroke-width="0.6" opacity="0.35"/>`) : '') +
    (mud > 0.05 ? op(mud, splats(26, 41, 2, 34, 97, 13, '#5f3f22', 2.6) + splats(10, 77, 4, 25, 92, 8, '#7d5a36', 1.6)) : '') +
    wheel(22) +
    wheel(80)
  );
};
