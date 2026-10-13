import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT} from '../fonts';
import {C, clamp, spr, SP} from '../lib';

/** Resmî logo işareti (yakinla-logo-mark.svg) — yeniden çizilmez, dosya olarak kullanılır. */
export const PinLogo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img src={staticFile('yakinla-logo-mark.svg')} style={{width: size, height: size, display: 'block', ...style}} />
);

/** Beyaz uygulama ikonu zemini (squircle) */
export const IconPlate: React.FC<{size: number; style?: React.CSSProperties; shadow?: number}> = ({size, style, shadow = 1}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.235,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #EEF4FD 100%)',
      boxShadow: `0 ${size * 0.08}px ${size * 0.2}px rgba(6, 30, 90, ${0.32 * shadow}), inset 0 -${size * 0.02}px 0 rgba(31,115,240,0.10)`,
      ...style,
    }}
  />
);

/**
 * "Yakınla" yazısı, harf harf maskeden yükselir.
 * start: ilk harfin başladığı kare; stagger: harfler arası kare.
 * shine: 0..1 parıltı geçişinin ilerlemesi (yalnızca harfler yerine oturduktan sonra kullanılır).
 */
export const Wordmark: React.FC<{
  f: number;
  start: number;
  size: number;
  color?: string;
  stagger?: number;
  shine?: number;
}> = ({f, start, size, color = C.white, stagger = 2.2, shine = 0}) => {
  const letters = Array.from('Yakınla');
  const font: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 800,
    fontSize: size,
    letterSpacing: '-0.035em',
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
  };
  const row = (animated: boolean) =>
    letters.map((ch, i) => {
      const p = animated ? spr(f, start + i * stagger, SP.snap) : 1;
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0 0.02em 0.08em', margin: '0 -0.02em'}}>
          <span
            style={{
              display: 'inline-block',
              transform: animated ? `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 10}deg)` : undefined,
              opacity: animated ? clamp(p * 3) : 1,
            }}
          >
            {ch}
          </span>
        </span>
      );
    });
  const showShine = shine > 0 && shine < 1;
  return (
    <div style={{position: 'relative', display: 'inline-block', ...font, color}}>
      {row(true)}
      {showShine ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...font,
            color: 'transparent',
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 170 - 45}%, rgba(150,196,255,0.95) ${shine * 170 - 28}%, rgba(255,255,255,0) ${shine * 170 - 10}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            pointerEvents: 'none',
          }}
        >
          {row(false)}
        </div>
      ) : null}
    </div>
  );
};
