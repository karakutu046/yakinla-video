import React from 'react';
import {ease, prog, SHOT} from '../lib';

/** Camdan geçiş parlaması ve kasabadan pencere önüne dönüş geçişi */
export const Flashes: React.FC<{f: number}> = ({f}) => {
  const a = ease.inOut(prog(f, 150, 14)) * (1 - ease.out(prog(f, 168, 16)));
  const b = ease.in(prog(f, 320, 13)) * (1 - ease.out(prog(f, SHOT.back, 14)));
  return (
    <>
      {a > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: a,
            background: 'radial-gradient(70% 55% at 50% 45%, #ffffff 0%, #eaf2ff 55%, #b9d1ff 100%)',
          }}
        />
      ) : null}
      {b > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: b,
            background: 'radial-gradient(80% 60% at 50% 40%, #fff7ea 0%, #f2f5ff 60%, #c9d8f5 100%)',
          }}
        />
      ) : null}
    </>
  );
};

/** İnce film greni: deterministik, kapanışta durur */
export const Grain: React.FC<{f: number}> = ({f}) => {
  const seed = Math.min(f, SHOT.freeze) % 97;
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id={`g${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter={`url(#g${seed})`} />
    </svg>
  );
};
