import React from 'react';
import {BRAND_GRADIENT, C, H, rand, W} from '../lib';
import {BreadArt, EggsArt, MilkArt, ProductSvg, TomatoArt} from './Products';

const abs: React.CSSProperties = {position: 'absolute', inset: 0};

/** Gece zemini: koyu lacivert, sıcak amber lamba ışığı, parallax toz ve bokeh katmanları */
export const NightBg: React.FC<{f: number; amber?: number; drift?: number}> = ({f, amber = 1, drift = 1}) => {
  const t = (f / 30) * drift;
  const flicker = 0.92 + 0.05 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 13.1);
  return (
    <div style={{...abs, overflow: 'hidden', background: `radial-gradient(120% 80% at 50% 42%, ${C.night2} 0%, ${C.night1} 52%, ${C.night0} 100%)`}}>
      {/* amber lamba ışığı (sağ üst) */}
      <div
        style={{
          ...abs,
          opacity: amber * flicker,
          background: 'radial-gradient(640px 640px at 850px 300px, rgba(255,176,72,0.42) 0%, rgba(255,150,40,0.16) 45%, rgba(255,150,40,0) 100%)',
        }}
      />
      <div
        style={{
          ...abs,
          opacity: amber * 0.7,
          background: 'radial-gradient(900px 520px at 120px 1780px, rgba(255,160,60,0.18) 0%, rgba(255,160,60,0) 100%)',
        }}
      />
      {/* uzak katman: bokeh */}
      {new Array(7).fill(0).map((_, i) => {
        const r = 70 + rand(i * 3.1) * 120;
        const x = rand(i * 7.7) * W;
        const y = ((rand(i * 5.3) * (H + 400) - t * (14 + i * 4)) % (H + 400) + H + 400) % (H + 400) - 200;
        const warm = i % 3 !== 0;
        return (
          <div
            key={`b${i}`}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: warm ? 'radial-gradient(closest-side, rgba(255,190,110,0.20), rgba(255,190,110,0))' : 'radial-gradient(closest-side, rgba(59,139,255,0.22), rgba(59,139,255,0))',
              opacity: amber,
            }}
          />
        );
      })}
      {/* yakın katman: ışıkta uçuşan toz */}
      {new Array(46).fill(0).map((_, i) => {
        const z = 0.3 + rand(i * 1.9) * 0.7; // derinlik
        const x = (rand(i * 2.3) * W + Math.sin(t * 0.7 + i) * 18 * z) % W;
        const y = ((rand(i * 4.1) * H - t * 40 * z) % H + H) % H;
        const s = 2 + z * 4;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.5 + z * 2) + i * 2.1));
        return (
          <div
            key={`d${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: i % 4 === 0 ? '#9CC4FF' : C.amberSoft,
              opacity: 0.55 * tw * z,
              boxShadow: `0 0 ${s * 3}px ${i % 4 === 0 ? 'rgba(59,139,255,0.8)' : 'rgba(255,190,110,0.8)'}`,
            }}
          />
        );
      })}
      {/* vinyet */}
      <div style={{...abs, background: 'radial-gradient(130% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,3,12,0.55) 100%)'}} />
    </div>
  );
};

/** Açık zemin: beyaz-açık gri, mavi yumuşak lekeler, nokta ızgara ve yüzen ürünler (parallax) */
export const LightBg: React.FC<{f: number; floaters?: number}> = ({f, floaters = 1}) => {
  const t = f / 30;
  const items = [
    {Art: MilkArt, x: 96, y: 640, s: 150, z: 0.9, r: -12},
    {Art: BreadArt, x: 980, y: 760, s: 170, z: 0.7, r: 10},
    {Art: EggsArt, x: 120, y: 1340, s: 150, z: 0.55, r: 8},
    {Art: TomatoArt, x: 990, y: 1290, s: 140, z: 1, r: -6},
    {Art: TomatoArt, x: 70, y: 980, s: 90, z: 0.35, r: 20},
    {Art: MilkArt, x: 1010, y: 1640, s: 110, z: 0.4, r: 14},
  ];
  return (
    <div style={{...abs, overflow: 'hidden', background: 'linear-gradient(180deg, #F8FBFF 0%, #EDF3FC 60%, #E4EDFA 100%)'}}>
      <div
        style={{
          ...abs,
          backgroundImage: 'radial-gradient(rgba(31,115,240,0.10) 2.2px, transparent 2.6px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `${-t * 6}px ${-t * 14}px`,
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.25))',
        }}
      />
      {[
        {x: 180, y: 520, r: 520, c: 'rgba(59,139,255,0.20)'},
        {x: 980, y: 1180, r: 600, c: 'rgba(31,115,240,0.16)'},
        {x: 420, y: 1750, r: 520, c: 'rgba(59,139,255,0.14)'},
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.r + Math.sin(t * 0.6 + i * 2) * 40,
            top: b.y - b.r + Math.cos(t * 0.5 + i) * 40,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: `radial-gradient(closest-side, ${b.c}, rgba(59,139,255,0))`,
          }}
        />
      ))}
      {items.map((it, i) => {
        const y = it.y - t * 30 * it.z + Math.sin(t * 1.1 + i) * 10;
        const x = it.x + Math.sin(t * 0.8 + i * 1.7) * 8;
        return (
          <div
            key={`p${i}`}
            style={{
              position: 'absolute',
              left: x - it.s / 2,
              top: y - it.s / 2,
              transform: `rotate(${it.r + Math.sin(t * 0.9 + i) * 6}deg)`,
              filter: `blur(${(1 - it.z) * 5}px)`,
              opacity: (0.35 + 0.55 * it.z) * floaters,
            }}
          >
            <ProductSvg Art={it.Art} size={it.s} />
          </div>
        );
      })}
    </div>
  );
};

/** Mavi marka gradyanı + yumuşak ışık küreleri ve ince halkalar */
export const BlueBg: React.FC<{f: number; orbs?: number; rings?: number; cx?: number; cy?: number}> = ({
  f,
  orbs = 1,
  rings = 1,
  cx = 540,
  cy = 760,
}) => {
  const t = f / 30;
  return (
    <div style={{...abs, overflow: 'hidden', background: BRAND_GRADIENT}}>
      <div style={{...abs, background: `radial-gradient(900px 900px at ${cx}px ${cy}px, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 70%)`}} />
      {rings > 0
        ? [360, 560, 780, 1020, 1290].map((r, i) => (
            <div
              key={`r${i}`}
              style={{
                position: 'absolute',
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                border: `2px solid rgba(255,255,255,${0.09 * rings})`,
                transform: `scale(${1 + 0.02 * Math.sin(t * 1.4 - i * 0.6)})`,
              }}
            />
          ))
        : null}
      {orbs > 0
        ? [
            {x: 140, y: 340, r: 200},
            {x: 960, y: 520, r: 150},
            {x: 900, y: 1500, r: 240},
            {x: 160, y: 1660, r: 170},
          ].map((o, i) => (
            <div
              key={`o${i}`}
              style={{
                position: 'absolute',
                left: o.x - o.r + Math.sin(t * 0.7 + i * 1.3) * 30,
                top: o.y - o.r - t * 16 * (0.5 + i * 0.2),
                width: o.r * 2,
                height: o.r * 2,
                borderRadius: '50%',
                background: 'radial-gradient(closest-side, rgba(255,255,255,0.22), rgba(255,255,255,0))',
                opacity: orbs,
              }}
            />
          ))
        : null}
      <div style={{...abs, background: 'linear-gradient(180deg, rgba(14,95,224,0) 60%, rgba(8,50,140,0.35) 100%)'}} />
    </div>
  );
};
