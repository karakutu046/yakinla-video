import React from 'react';

// Jenerik, etiketsiz ürün çizimleri (marka ya da yazı yok). viewBox 0 0 200 200.

const Shadow: React.FC<{cx?: number; cy?: number; rx?: number}> = ({cx = 100, cy = 182, rx = 58}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={8} fill="#0B1A33" opacity={0.1} />
);

export const MilkArt: React.FC = () => (
  <g>
    <Shadow rx={44} />
    {/* üçgen çatılı süt kutusu */}
    <path d="M62 66 L100 40 L138 66 Z" fill="#E7EEF9" />
    <path d="M100 40 L138 66 L150 58 L114 34 Z" fill="#CBD9EE" />
    <rect x="94" y="26" width="18" height="12" rx="2" transform="rotate(-34 103 32)" fill="#DCE6F5" />
    <rect x="62" y="66" width="76" height="114" rx="4" fill="#FFFFFF" />
    <path d="M138 66 L150 58 L150 172 L138 180 Z" fill="#DCE5F2" />
    {/* mavi dalga bandı */}
    <path d="M62 112 C78 102 94 122 110 112 C122 104 132 110 138 108 L138 180 L62 180 Z" fill="#3B8BFF" />
    <path d="M138 108 L150 100 L150 172 L138 180 Z" fill="#1F73F0" />
    <path d="M62 128 C80 120 96 136 112 128 C124 122 132 128 138 126" fill="none" stroke="#fff" strokeWidth="3" opacity="0.5" />
    {/* damla */}
    <path d="M100 76 C100 76 90 88 90 94 a10 10 0 0 0 20 0 C110 88 100 76 100 76z" fill="#3B8BFF" />
    <rect x="66" y="66" width="8" height="110" fill="#fff" opacity="0.6" />
  </g>
);

export const BreadArt: React.FC = () => (
  <g>
    <Shadow rx={74} />
    {/* somun ekmek */}
    <ellipse cx="100" cy="128" rx="78" ry="46" fill="#C9792E" />
    <ellipse cx="100" cy="118" rx="76" ry="44" fill="#E59A45" />
    <ellipse cx="94" cy="106" rx="56" ry="26" fill="#F2B565" opacity="0.8" />
    {[-36, -12, 12, 36].map((dx, i) => (
      <path
        key={i}
        d={`M${100 + dx - 12} ${128} Q${100 + dx} ${98} ${100 + dx + 14} ${90}`}
        fill="none"
        stroke="#B9671F"
        strokeWidth="6"
        strokeLinecap="round"
      />
    ))}
    {[-36, -12, 12, 36].map((dx, i) => (
      <path key={`h${i}`} d={`M${100 + dx - 8} ${124} Q${100 + dx + 2} ${100} ${100 + dx + 12} ${94}`} fill="none" stroke="#FFD9A0" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    ))}
  </g>
);

export const EggsArt: React.FC = () => (
  <g>
    <Shadow rx={80} />
    {/* arka sıra */}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={`b${i}`} cx={42 + i * 29} cy={98} rx={14} ry={18} fill="#F6E3C8" />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={`bh${i}`} cx={38 + i * 29} cy={92} rx={4} ry={6} fill="#fff" opacity="0.7" />
    ))}
    {/* ön sıra */}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={`f${i}`} cx={36 + i * 32} cy={122} rx={16} ry={20} fill="#FBEBD3" />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={`fh${i}`} cx={31 + i * 32} cy={114} rx={4.5} ry={7} fill="#fff" opacity="0.8" />
    ))}
    {/* viyol */}
    <path d="M14 126 L186 126 L176 170 Q100 182 24 170 Z" fill="#B9C6D9" />
    <path d="M14 126 L186 126 L184 136 L16 136 Z" fill="#CFD9E7" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={`c${i}`} d={`M${22 + i * 32} 140 Q${36 + i * 32} 164 ${50 + i * 32} 140`} fill="none" stroke="#A3B2C8" strokeWidth="3" />
    ))}
  </g>
);

export const TomatoArt: React.FC = () => {
  const tomato = (cx: number, cy: number, r: number, k: string) => (
    <g key={k}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.9} fill="#E5392F" />
      <ellipse cx={cx - r * 0.1} cy={cy - r * 0.08} rx={r * 0.86} ry={r * 0.74} fill="#F24B3D" />
      <ellipse cx={cx - r * 0.38} cy={cy - r * 0.32} rx={r * 0.22} ry={r * 0.14} fill="#fff" opacity="0.55" transform={`rotate(-30 ${cx - r * 0.38} ${cy - r * 0.32})`} />
      <path
        d={`M${cx} ${cy - r * 0.86} l${-r * 0.32} ${-r * 0.1} l${r * 0.2} ${r * 0.16} l${-r * 0.16} ${r * 0.2} l${r * 0.28} ${-r * 0.12} l${r * 0.28} ${r * 0.12} l${-r * 0.16} ${-r * 0.2} l${r * 0.2} ${-r * 0.16} z`}
        fill="#2F9E4F"
      />
      <path d={`M${cx} ${cy - r * 0.9} l${r * 0.06} ${-r * 0.22}`} stroke="#2F9E4F" strokeWidth={r * 0.1} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <Shadow rx={78} />
      {tomato(66, 128, 40, 'a')}
      {tomato(136, 130, 38, 'b')}
      {tomato(100, 96, 40, 'c')}
    </g>
  );
};

export const PRODUCTS = [
  {name: 'Süt', unit: '1 L', Art: MilkArt},
  {name: 'Ekmek', unit: '1 adet', Art: BreadArt},
  {name: 'Yumurta', unit: "10'lu", Art: EggsArt},
  {name: 'Domates', unit: '1 kg', Art: TomatoArt},
];

export const ProductSvg: React.FC<{Art: React.FC; size: number; style?: React.CSSProperties}> = ({Art, size, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{display: 'block', overflow: 'visible', ...style}}>
    <Art />
  </svg>
);
