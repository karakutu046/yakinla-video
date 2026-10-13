import React from 'react';

type P = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};

const Svg: React.FC<P & {children: React.ReactNode; vb?: string}> = ({size = 24, style, children, vb = '0 0 24 24'}) => (
  <svg width={size} height={size} viewBox={vb} style={{display: 'block', overflow: 'visible', ...style}}>
    {children}
  </svg>
);

const line = (color: string, stroke: number) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: stroke,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const SearchIcon: React.FC<P> = ({color = '#5E6E86', stroke = 2.2, ...p}) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" {...line(color, stroke)} />
    <path d="M15.5 15.5 L20.5 20.5" {...line(color, stroke)} />
  </Svg>
);

export const CartIcon: React.FC<P> = ({color = '#1F73F0', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="M2.5 3.5h2.6l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2l1.7-7.3H6.2" {...line(color, stroke)} />
    <circle cx="9.6" cy="20" r="1.4" fill={color} />
    <circle cx="17.4" cy="20" r="1.4" fill={color} />
  </Svg>
);

export const PlusIcon: React.FC<P> = ({color = '#fff', stroke = 2.6, ...p}) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" {...line(color, stroke)} />
  </Svg>
);

/** progress: 0..1 çizim ilerlemesi */
export const CheckIcon: React.FC<P & {progress?: number}> = ({color = '#fff', stroke = 2.6, progress = 1, ...p}) => (
  <Svg {...p}>
    <path
      d="M5 12.5l4.6 4.6L19.2 7.4"
      {...line(color, stroke)}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </Svg>
);

export const ShieldIcon: React.FC<P & {progress?: number; fill?: string}> = ({
  color = '#1F73F0',
  stroke = 1.9,
  progress = 1,
  fill = 'none',
  ...p
}) => (
  <Svg {...p}>
    <path d="M12 2.6l7.6 2.9v5.9c0 4.7-3.2 8.6-7.6 10-4.4-1.4-7.6-5.3-7.6-10V5.5z" {...line(color, stroke)} fill={fill} />
    <path
      d="M8.4 12.1l2.6 2.6 4.8-5"
      {...line(color, stroke + 0.3)}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </Svg>
);

export const CardIcon: React.FC<P> = ({color = '#1F73F0', stroke = 1.9, ...p}) => (
  <Svg {...p}>
    <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6" {...line(color, stroke)} />
    <path d="M2.8 9.6h18.4M6.6 15h3.4" {...line(color, stroke)} />
  </Svg>
);

/** Genel konum işareti (logo değil; arayüz simgesi) */
export const LocationIcon: React.FC<P> = ({color = '#1F73F0', stroke = 1.9, ...p}) => (
  <Svg {...p}>
    <path d="M12 21s-6.6-5.6-6.6-11A6.6 6.6 0 0 1 18.6 10c0 5.4-6.6 11-6.6 11z" {...line(color, stroke)} />
    <circle cx="12" cy="10" r="2.4" {...line(color, stroke)} />
  </Svg>
);

export const ChevronDown: React.FC<P> = ({color = '#5E6E86', stroke = 2.2, ...p}) => (
  <Svg {...p}>
    <path d="M6.5 9.5l5.5 5.5 5.5-5.5" {...line(color, stroke)} />
  </Svg>
);

export const ArrowRight: React.FC<P> = ({color = '#fff', stroke = 2.4, ...p}) => (
  <Svg {...p}>
    <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" {...line(color, stroke)} />
  </Svg>
);

export const WarehouseIcon: React.FC<P> = ({color = '#fff', stroke = 1.9, ...p}) => (
  <Svg {...p}>
    <path d="M3 9.2L12 4l9 5.2V20H3z" {...line(color, stroke)} />
    <path d="M7 20v-7h10v7M7 16.5h10" {...line(color, stroke)} />
  </Svg>
);

export const HouseIcon: React.FC<P> = ({color = '#fff', stroke = 1.9, ...p}) => (
  <Svg {...p}>
    <path d="M3.6 11L12 4l8.4 7" {...line(color, stroke)} />
    <path d="M5.8 9.4V20h12.4V9.4" {...line(color, stroke)} />
    <path d="M10 20v-5.4h4V20" {...line(color, stroke)} />
  </Svg>
);

export const ClockIcon: React.FC<P & {hand?: number}> = ({color = '#fff', stroke = 1.9, hand = 0, ...p}) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" {...line(color, stroke)} />
    <path d="M12 7.2V12" {...line(color, stroke)} transform={`rotate(${hand} 12 12)`} />
    <path d="M12 12l3.4 2" {...line(color, stroke)} transform={`rotate(${hand / 12} 12 12)`} />
  </Svg>
);

/** Kargo kamyoneti + üstü çizili: "başka şehirden kargoyla gelmez" */
export const NoTruckIcon: React.FC<P & {slash?: number}> = ({color = '#fff', stroke = 1.9, slash = 1, ...p}) => (
  <Svg {...p}>
    <path d="M2.8 6.5h10.4v9.4H2.8zM13.2 9.6h3.9l3.1 3.3v3H13.2" {...line(color, stroke)} />
    <circle cx="6.6" cy="17.6" r="1.8" {...line(color, stroke)} />
    <circle cx="16.8" cy="17.6" r="1.8" {...line(color, stroke)} />
    <path
      d="M3 3l18 18"
      {...line(color, stroke + 0.4)}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - slash}
    />
  </Svg>
);

export const MoonIcon: React.FC<P> = ({color = '#FFB547', ...p}) => (
  <Svg {...p}>
    <path d="M20 14.6A8.4 8.4 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z" fill={color} />
  </Svg>
);

/** Motosikletli kurye (yandan, jenerik) */
export const CourierIcon: React.FC<{size?: number; flip?: boolean; lean?: number}> = ({size = 64, flip = false, lean = 0}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{display: 'block', overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
    <g transform={`rotate(${lean} 32 44)`}>
      {/* teslimat kutusu */}
      <rect x="6" y="20" width="17" height="15" rx="3" fill="#1F73F0" />
      <rect x="6" y="20" width="17" height="4.5" rx="2" fill="#3B8BFF" />
      {/* gövde */}
      <path d="M14 39h22l7-9h6l3 9" fill="none" stroke="#0B1A33" strokeWidth="4.2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M20 39c0-5 4-8 10-8h7" fill="none" stroke="#1F73F0" strokeWidth="5" strokeLinecap="round" />
      {/* sürücü */}
      <path d="M30 31l3-10 6 1 3 8" fill="none" stroke="#0B1A33" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 21l9 4" stroke="#0B1A33" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="35" cy="13.5" r="6" fill="#1F73F0" />
      <path d="M35.5 10.5h5.5" stroke="#BFD8FF" strokeWidth="2.4" strokeLinecap="round" />
      {/* tekerlekler */}
      <circle cx="16" cy="44" r="6.4" fill="#fff" stroke="#0B1A33" strokeWidth="3.6" />
      <circle cx="49" cy="44" r="6.4" fill="#fff" stroke="#0B1A33" strokeWidth="3.6" />
      {/* far */}
      <circle cx="51.5" cy="31" r="2.2" fill="#FFD48A" />
    </g>
  </svg>
);

export const SignalIcons: React.FC<{color?: string}> = ({color = '#0B1A33'}) => (
  <svg width="92" height="22" viewBox="0 0 92 22" style={{display: 'block'}}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 6.5} y={14 - i * 3.6} width="4.4" height={6 + i * 3.6} rx="1.2" fill={color} />
    ))}
    <path d="M36 9.5a10 10 0 0 1 14 0M39 12.6a5.6 5.6 0 0 1 8 0" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="43" cy="16.4" r="1.9" fill={color} />
    <rect x="58" y="4.5" width="27" height="13.5" rx="4" fill="none" stroke={color} strokeWidth="1.6" opacity="0.5" />
    <rect x="60.4" y="6.9" width="19" height="8.7" rx="2.2" fill={color} />
    <rect x="86.6" y="9" width="2.2" height="4.6" rx="1" fill={color} opacity="0.5" />
  </svg>
);
