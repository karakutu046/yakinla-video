import React from 'react';
import {BRAND_GRADIENT, C, ease, prog} from '../lib';

/**
 * S5 → S6: alttan yükselen eğik mavi panel. Panelin üst kenarı ekranı örter,
 * alt kenarı yukarı çekilirken yeni sahneyi açar (655–663 arası tam kapalı).
 */
export const PanelWipe: React.FC<{f: number; start: number}> = ({f, start}) => {
  const top = 2120 - 2720 * ease.inOutCubic(prog(f, start, 16));
  const bot = 2120 - 2720 * ease.inOutCubic(prog(f, start + 16, 16));
  if (top >= 2100 || bot <= -560) return null;
  const sk = 120;
  const clip = `polygon(-10px ${top + sk}px, 1090px ${top - sk}px, 1090px ${bot - sk}px, -10px ${bot + sk}px)`;
  const lead = `polygon(-10px ${top + sk - 60}px, 1090px ${top - sk - 60}px, 1090px ${top - sk + 2}px, -10px ${top + sk + 2}px)`;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: lead, background: '#9CC4FF'}} />
      <div style={{position: 'absolute', inset: 0, clipPath: clip, background: BRAND_GRADIENT}}>
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(700px 700px at 540px 960px, rgba(255,255,255,0.18), rgba(255,255,255,0))`}} />
      </div>
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(-10px ${bot + sk - 2}px, 1090px ${bot - sk - 2}px, 1090px ${bot - sk + 26}px, -10px ${bot + sk + 26}px)`, background: C.blueLight, opacity: 0.8}} />
    </div>
  );
};
