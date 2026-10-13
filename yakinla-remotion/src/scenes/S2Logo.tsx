import React from 'react';
import {FONT} from '../fonts';
import {C, clamp, dropBounce, ease, HOURS, prog, rand, spr, SP} from '../lib';
import {BlueBg} from '../components/Backgrounds';
import {IconPlate, PinLogo, Wordmark} from '../components/Brand';
import {MotionBlur} from '../components/MotionBlur';

// S2 · 0:03–0:06 · Logo
// Pin yukarıdan düşer, sekip yerine oturur; çarpma noktasından yayılan halka ekranı
// mavi gradyanla doldurur. "Yakınla" harf harf açılır, altında "Açığız · 08:00 – 01:00".
// Aynı bileşen S3'ün başında telefonun açılış ekranı olarak da çizilir (embedded):
// kamera geri çekildiğinde logo ekranı telefonun içinde kalır (morph geçiş).

export const ICON = {x: 540, y: 700, size: 300, pin: 250};
const TIP_Y = ICON.y + (ICON.pin * (912 - 512)) / 1024; // pinin sivri ucu
const DROP_AT = 90;
const DROP_H = 1000;

export const S2Logo: React.FC<{f: number; embedded?: boolean; feather?: number}> = ({f, embedded = false, feather = 0}) => {
  const impact0 = DROP_AT + Math.sqrt((2 * DROP_H) / 13000) * 30; // ≈ 101.8
  const floodR = 1450 * ease.inOutCubic(prog(f, impact0 + 1, 18));

  // çarpmada kamera sarsıntısı
  const si = f - impact0;
  const shake = !embedded && si > 0 ? Math.exp(-si * 0.28) * 14 : 0;
  const shx = shake * Math.sin(si * 2.9);
  const shy = shake * Math.cos(si * 3.7);

  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)`}}>
      {/* mavi taşma */}
      {floodR > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: -40,
            clipPath: floodR < 1440 ? `circle(${floodR}px at ${540 + 40}px ${TIP_Y + 40}px)` : undefined,
            WebkitMaskImage: feather > 0 ? `radial-gradient(ellipse ${100 - feather * 38}% ${100 - feather * 42}% at 50% 46%, #000 62%, transparent 100%)` : undefined,
          }}
        >
          <div style={{position: 'absolute', inset: 40}}>
            <BlueBg f={f} cy={ICON.y} />
          </div>
        </div>
      ) : null}
      {/* şok halkaları */}
      {!embedded
        ? [
            {at: impact0, col: C.blueLight, w: 26, R: 1500},
            {at: impact0 + 6, col: 'rgba(255,255,255,0.9)', w: 16, R: 1300},
            {at: impact0 + 11, col: 'rgba(255,255,255,0.6)', w: 8, R: 1100},
          ].map((r, i) => {
            const p = prog(f, r.at, 24);
            if (p <= 0 || p >= 1) return null;
            const rad = 30 + r.R * ease.outCubic(p);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 540 - rad,
                  top: TIP_Y - rad,
                  width: rad * 2,
                  height: rad * 2,
                  borderRadius: '50%',
                  border: `${r.w * (1 - p) + 2}px solid ${r.col}`,
                  opacity: 1 - ease.inCubic(p),
                }}
              />
            );
          })
        : null}
      {/* kıvılcımlar */}
      {!embedded && f > impact0 && f < impact0 + 26
        ? new Array(16).fill(0).map((_, i) => {
            const t = (f - impact0) / 30;
            const a = -Math.PI * (0.08 + 0.84 * rand(i * 3.3));
            const v = 700 + rand(i * 1.7) * 900;
            const x = 540 + Math.cos(a) * v * t;
            const y = TIP_Y + Math.sin(a) * v * t + 0.5 * 3200 * t * t;
            const s = 6 + rand(i) * 8;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - s / 2,
                  top: y - s / 2,
                  width: s,
                  height: s,
                  borderRadius: '50%',
                  background: i % 3 === 0 ? C.amber : '#fff',
                  opacity: 1 - t / 0.87,
                  boxShadow: `0 0 ${s * 2}px ${i % 3 === 0 ? 'rgba(255,181,71,0.9)' : 'rgba(160,200,255,0.9)'}`,
                }}
              />
            );
          })
        : null}
      {/* iniş gölgesi (beyaz plaka gelmeden önce) */}
      {!embedded ? (
        <div
          style={{
            position: 'absolute',
            left: 540 - 90,
            top: TIP_Y - 14,
            width: 180,
            height: 28,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))',
            opacity: clamp((f - DROP_AT) / 12) * (1 - prog(f, impact0 + 6, 6)),
            transform: `scale(${0.4 + 0.6 * clamp((f - DROP_AT) / 12)})`,
          }}
        />
      ) : null}
      {/* beyaz uygulama ikonu plakası */}
      {(() => {
        const p = spr(f, impact0 + 5, SP.pop);
        if (p <= 0) return null;
        return (
          <div
            style={{
              position: 'absolute',
              left: ICON.x - ICON.size / 2,
              top: ICON.y - ICON.size / 2,
              transform: `scale(${p}) rotate(${(1 - p) * -16}deg)`,
            }}
          >
            <IconPlate size={ICON.size} />
          </div>
        );
      })()}
      {/* düşen pin: düşüşte uzar, çarpmada ezilir; hızlıyken hareket bulanıklığı */}
      <MotionBlur
        f={f}
        active={!embedded && f > DROP_AT && f < impact0 + 10}
        samples={7}
        render={(t) => {
          const d = dropBounce(t, DROP_AT, DROP_H);
          const vel = (dropBounce(t + 0.25, DROP_AT, DROP_H).y - dropBounce(t - 0.25, DROP_AT, DROP_H).y) * 60;
          const stretch = clamp(Math.abs(vel) / 9000) * 0.14;
          const amp = d.sinceImpact >= 0 ? 0.24 * Math.pow(0.45, d.impacts - 1) : 0;
          const sq = d.sinceImpact >= 0 ? amp * Math.exp(-d.sinceImpact * 16) * Math.cos(d.sinceImpact * 34) : 0;
          // son oturuş: küçük yaylanma
          const settle = d.firstImpact >= 0 ? 0.03 * Math.exp(-d.firstImpact * 6) * Math.sin(d.firstImpact * 22) : 0;
          const sy = 1 - sq + stretch + settle;
          const sx = 1 + sq * 0.7 - stretch * 0.6 - settle * 0.5;
          return (
            <div
              style={{
                position: 'absolute',
                left: ICON.x - ICON.pin / 2,
                top: ICON.y - ICON.pin / 2,
                transform: `translateY(${d.y}px) scale(${sx}, ${sy})`,
                transformOrigin: '50% 89%',
              }}
            >
              <PinLogo size={ICON.pin} />
            </div>
          );
        }}
      />
      {/* Yakınla */}
      <div style={{position: 'absolute', top: 1010 - 92, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Wordmark f={f} start={impact0 + 14} size={156} stagger={2.2} shine={prog(f, 150, 18)} />
      </div>
      {/* Açığız · 08:00 – 01:00 */}
      <OpenPill f={f} at={impact0 + 26} y={1150} />
    </div>
  );
};

export const OpenPill: React.FC<{f: number; at: number; y: number; size?: number}> = ({f, at, y, size = 46}) => {
  const p = spr(f, at, SP.pop);
  if (p <= 0) return null;
  const pulse = (f - at) / 30;
  const ring = (pulse * 1.1) % 1;
  return (
    <div style={{position: 'absolute', top: y - size, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: size * 0.36,
          height: size * 2,
          padding: `0 ${size * 0.8}px 0 ${size * 0.62}px`,
          borderRadius: size,
          background: 'rgba(255,255,255,0.16)',
          border: '2px solid rgba(255,255,255,0.38)',
          boxShadow: '0 18px 40px rgba(5,30,90,0.25)',
          fontFamily: FONT,
          fontSize: size,
          color: '#fff',
          whiteSpace: 'nowrap',
          transform: `scale(${0.7 + 0.3 * p})`,
          opacity: clamp(p * 2),
        }}
      >
        <span style={{position: 'relative', width: size * 0.42, height: size * 0.42}}>
          <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.amber, boxShadow: '0 0 16px rgba(255,181,71,0.9)'}} />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `3px solid ${C.amber}`,
              transform: `scale(${1 + ring * 1.6})`,
              opacity: 1 - ring,
            }}
          />
        </span>
        <span style={{fontWeight: 800}}>Açığız</span>
        <span style={{opacity: 0.7, fontWeight: 700}}>·</span>
        <span style={{fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>{HOURS}</span>
      </div>
    </div>
  );
};
