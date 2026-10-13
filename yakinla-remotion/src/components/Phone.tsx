import React from 'react';

export const PHONE = {w: 620, h: 1280, r: 96, bezel: 18};
export const SCREEN = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2, r: 80};

export type Pose = {x: number; y: number; s: number; rx: number; ry: number; rz: number};

/**
 * Hafif 3B eğimli telefon maketi. (x, y) telefonun ekrandaki merkezidir.
 * Arkadaki katman (translateZ) eğim arttıkça gövde kalınlığı gibi görünür.
 */
export const Phone: React.FC<{pose: Pose; children: React.ReactNode; shadow?: number; glare?: number}> = ({
  pose,
  children,
  shadow = 1,
  glare = 1,
}) => {
  const {x, y, s, rx, ry, rz} = pose;
  const sh = shadow;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {/* yer gölgesi */}
      <div
        style={{
          position: 'absolute',
          left: x - PHONE.w * s * 0.42 + ry * 4 * s,
          top: y + PHONE.h * s * 0.36,
          width: PHONE.w * s * 0.84,
          height: PHONE.h * s * 0.2,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(6,18,48,0.38), rgba(6,18,48,0))',
          filter: `blur(${18 * s}px)`,
          opacity: sh,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 0,
          height: 0,
          perspective: 2600,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -PHONE.w / 2,
            top: -PHONE.h / 2,
            width: PHONE.w,
            height: PHONE.h,
            transformStyle: 'preserve-3d',
            transform: `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          }}
        >
          {/* gövde kalınlığı */}
          {[22, 14, 7].map((z, i) => (
            <div
              key={z}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: PHONE.r,
                background: i === 0 ? '#05080F' : '#1A2232',
                transform: `translateZ(${-z}px)`,
                boxShadow: i === 0 ? `0 70px 80px -36px rgba(4,14,40,${0.45 * sh})` : undefined,
              }}
            />
          ))}
          {/* çerçeve */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: PHONE.r,
              background: 'linear-gradient(135deg, #3A4458 0%, #11161F 30%, #0A0E16 60%, #2B3447 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.10), inset 0 0 0 6px #0A0D14',
            }}
          />
          {/* yan tuşlar */}
          <div style={{position: 'absolute', right: -5, top: 300, width: 6, height: 150, borderRadius: 3, background: '#20283A'}} />
          <div style={{position: 'absolute', left: -5, top: 250, width: 6, height: 90, borderRadius: 3, background: '#20283A'}} />
          <div style={{position: 'absolute', left: -5, top: 360, width: 6, height: 90, borderRadius: 3, background: '#20283A'}} />
          {/* ekran */}
          <div
            style={{
              position: 'absolute',
              left: PHONE.bezel,
              top: PHONE.bezel,
              width: SCREEN.w,
              height: SCREEN.h,
              borderRadius: SCREEN.r,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            {children}
            {/* dinamik ada */}
            <div
              style={{
                position: 'absolute',
                left: SCREEN.w / 2 - 62,
                top: 16,
                width: 124,
                height: 36,
                borderRadius: 18,
                background: '#05070C',
              }}
            />
            {/* cam yansıması */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.55 * glare,
                background: `linear-gradient(${115 + ry * 1.5}deg, rgba(255,255,255,0) ${30 + ry}%, rgba(255,255,255,0.16) ${40 + ry}%, rgba(255,255,255,0) ${52 + ry}%)`,
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
