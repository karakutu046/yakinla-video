import React from 'react';
import {FONT} from '../fonts';
import {clamp, spr, SP} from '../lib';

export type Word = {text: string; at: number; color?: string};

/**
 * Tipografik vuruş: kelime büyükten küçülerek, bulanıktan netleşerek "çakılır".
 */
export const PunchWords: React.FC<{
  f: number;
  words: Word[];
  size: number;
  weight?: number;
  color?: string;
  gap?: number;
  tracking?: string;
  after?: React.ReactNode; // son kelimeye boşluksuz eklenir (ör. ayrı animasyonlu "?")
}> = ({f, words, size, weight = 800, color = '#fff', gap = 0.26, tracking = '-0.035em', after}) => (
  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: `0 ${gap}em`, fontFamily: FONT, fontWeight: weight, fontSize: size, letterSpacing: tracking, lineHeight: 1.08, whiteSpace: 'nowrap'}}>
    {words.map((w, i) => {
      const p = spr(f, w.at, SP.pop);
      const o = clamp((f - w.at) / 3);
      const sc = 1 + (1 - p) * 0.9;
      const blur = Math.max(0, (1 - clamp(p)) * 16);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            color: w.color ?? color,
            opacity: o,
            transform: `scale(${sc}) translateY(${(1 - p) * -0.12}em)`,
            filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
          }}
        >
          {w.text}
        </span>
      );
    })}
    {after ? <span style={{display: 'inline-block', marginLeft: `-${gap}em`}}>{after}</span> : null}
  </div>
);

/**
 * Satır: kelimeler maskenin altından sırayla yükselir.
 */
export const RiseWords: React.FC<{
  f: number;
  text: string;
  at: number;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  highlight?: Record<string, string>;
  align?: 'center' | 'flex-start';
  exit?: number; // 0..1 çıkış ilerlemesi (yukarı kayar)
}> = ({f, text, at, size, weight = 800, color = '#fff', stagger = 3, highlight = {}, align = 'center', exit = 0}) => {
  const words = text.split(' ');
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: align,
        gap: '0 0.25em',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.03em',
        lineHeight: 1.12,
        whiteSpace: 'nowrap',
      }}
    >
      {words.map((w, i) => {
        const p = spr(f, at + i * stagger, SP.snap);
        const e = clamp(exit * 1.4 - i * 0.08);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.02em 0.04em 0.12em', margin: '-0.02em -0.04em -0.12em'}}>
            <span
              style={{
                display: 'inline-block',
                color: highlight[w] ?? color,
                transform: `translateY(${(1 - p) * 110 - e * 110}%)`,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Ekran yazısı bloğu: ortalanmış birkaç satır */
export const Caption: React.FC<{
  f: number;
  lines: string[];
  at: number;
  y: number;
  size: number;
  color?: string;
  highlight?: Record<string, string>;
  exit?: number;
  lineGap?: number;
}> = ({f, lines, at, y, size, color, highlight, exit = 0, lineGap = 1.12}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {lines.map((l, i) => (
      <div key={i} style={{height: size * lineGap}}>
        <RiseWords f={f} text={l} at={at + i * 5} size={size} color={color} highlight={highlight} exit={exit} />
      </div>
    ))}
  </div>
);
