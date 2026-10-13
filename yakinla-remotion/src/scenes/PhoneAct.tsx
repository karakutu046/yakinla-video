import React from 'react';
import {FONT} from '../fonts';
import {BRAND_GRADIENT, C, clamp, ease, prog, rand, spr, SP, T} from '../lib';
import {BlueBg, LightBg, NightBg} from '../components/Backgrounds';
import {Caption} from '../components/Kinetic';
import {MotionBlur} from '../components/MotionBlur';
import {Phone, SCREEN} from '../components/Phone';
import {AppHome, TouchDot} from '../screens/AppHome';
import {courierProgress, MapScreen} from '../screens/MapScreen';
import {PaymentSheet} from '../screens/Payment';
import {BTN_CENTER_Y, K, phonePose, touchState} from '../screens/timeline';
import {S2Logo} from './S2Logo';

// S3 · 0:06–0:12 Sepet · S4 · 0:12–0:16 Ödeme · S5 · 0:16–0:22 Canlı takip
// Telefon üç sahne boyunca hiç kaybolmaz; zemin arkasında mavi wipe / iris geçişleriyle değişir.

const S0 = 1.97; // açılış ekranının tüm kareyi kapladığı ölçek

/** Ekran içeriği (telefonun içindeki her şey) */
const ScreenContent: React.FC<{f: number}> = ({f}) => {
  const splashO = 1 - prog(f, K.splashOut, 10);
  const touch = touchState(f);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {f >= K.splashOut - 4 && f < K.mapIn + 20 ? <AppHome f={f} /> : null}
      {f < K.mapIn + 20 ? <PaymentSheet f={f} /> : null}
      {f >= K.mapIn - 1 ? <MapScreen f={f} /> : null}
      {f < 470 ? <TouchDot {...touch} /> : null}
      {splashO > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: splashO}}>
          <div style={{position: 'absolute', inset: 0, background: BRAND_GRADIENT}} />
          <div
            style={{
              position: 'absolute',
              left: SCREEN.w / 2 - 540,
              top: SCREEN.h / 2 - 960,
              width: 1080,
              height: 1920,
              transform: `scale(${(1 / S0) * (1 + 0.08 * (1 - splashO))})`,
              transformOrigin: '540px 960px',
            }}
          >
            <S2Logo f={f} embedded feather={prog(f, T.s3, 10)} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** Sağdaki büyük sayaç: "ortalama 60 dk" */
const Counter: React.FC<{f: number}> = ({f}) => {
  const cx = 812;
  const cy = 872;
  const R = 172;
  const u = courierProgress(f);
  const v = Math.round(60 * u);
  const inP = spr(f, 494, SP.pop);
  const pillP = spr(f, 490, SP.pop);
  const arrive = f - K.arrive;
  const flash = arrive > 0 ? Math.exp(-arrive * 0.12) : 0;
  const bump = arrive > 0 ? Math.exp(-arrive * 0.2) * Math.sin(arrive * 0.7) : 0;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      {/* ortalama */}
      <div style={{position: 'absolute', left: cx - 200, width: 400, top: 590, display: 'flex', justifyContent: 'center', transform: `scale(${pillP})`, opacity: clamp(pillP * 2)}}>
        <div style={{height: 78, padding: '0 34px', borderRadius: 39, background: C.amber, color: C.ink, fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', boxShadow: '0 14px 34px rgba(255,170,50,0.35)'}}>
          ortalama
        </div>
      </div>
      <div style={{position: 'absolute', left: cx - R - 40, top: cy - R - 40, width: (R + 40) * 2, height: (R + 40) * 2, transform: `scale(${inP * (1 + bump * 0.05)})`}}>
        <svg width={(R + 40) * 2} height={(R + 40) * 2} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFD48A" />
              <stop offset="1" stopColor={C.amberDeep} />
            </linearGradient>
          </defs>
          <circle cx={R + 40} cy={R + 40} r={R + 26} fill={`rgba(255,181,71,${0.08 + flash * 0.25})`} />
          <circle cx={R + 40} cy={R + 40} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={20} />
          {new Array(60).fill(0).map((_, i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const on = i < v;
            const r0 = R - 30;
            const r1 = R - (i % 5 === 0 ? 46 : 38);
            return (
              <line
                key={i}
                x1={R + 40 + Math.cos(a) * r0}
                y1={R + 40 + Math.sin(a) * r0}
                x2={R + 40 + Math.cos(a) * r1}
                y2={R + 40 + Math.sin(a) * r1}
                stroke={on ? C.amber : 'rgba(255,255,255,0.22)'}
                strokeWidth={i % 5 === 0 ? 4 : 2.5}
                strokeLinecap="round"
              />
            );
          })}
          <circle
            cx={R + 40}
            cy={R + 40}
            r={R}
            fill="none"
            stroke="url(#ringg)"
            strokeWidth={20}
            strokeLinecap="round"
            strokeDasharray={`${circ * u} ${circ}`}
            transform={`rotate(-90 ${R + 40} ${R + 40})`}
            style={{filter: `drop-shadow(0 0 ${10 + flash * 20}px rgba(255,181,71,0.8))`}}
          />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: R + 40 - 118, textAlign: 'center', color: '#fff', fontSize: 186, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + bump * 0.1})`}}>
          {v}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: R + 40 + 78, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em'}}>dk</div>
      </div>
    </div>
  );
};

/** Onay anında telefonun dışına taşan halka patlaması + konfeti */
const Burst: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const d = f - K.burst;
  if (d < 0 || d > 44) return null;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {[0, 4, 9, 15].map((o, i) => {
        const p = prog(f, K.burst + o, 26);
        if (p <= 0 || p >= 1) return null;
        const r = 60 + (1500 - i * 200) * ease.outCubic(p);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `${(i === 0 ? 34 : 18) * (1 - p) + 2}px solid ${i % 2 ? 'rgba(255,255,255,0.85)' : '#9CC4FF'}`,
              opacity: 1 - ease.inCubic(p),
            }}
          />
        );
      })}
      {new Array(34).fill(0).map((_, i) => {
        const t = d / 30;
        const a = rand(i * 2.7) * Math.PI * 2;
        const v = 900 + rand(i * 5.1) * 1300;
        const drag = (1 - Math.exp(-3 * t)) / 3;
        const px = x + Math.cos(a) * v * drag;
        const py = y + Math.sin(a) * v * drag + 900 * t * t;
        const w = 12 + rand(i) * 14;
        const col = [C.white, C.amber, '#9CC4FF', C.blueLight][i % 4];
        return (
          <div
            key={`c${i}`}
            style={{
              position: 'absolute',
              left: px - w / 2,
              top: py - w / 4,
              width: w,
              height: i % 3 === 0 ? w : w / 2,
              borderRadius: i % 3 === 0 ? '50%' : 3,
              background: col,
              transform: `rotate(${(rand(i * 9) - 0.5) * 1440 * t}deg)`,
              opacity: 1 - clamp((t - 0.9) / 0.5),
            }}
          />
        );
      })}
    </div>
  );
};

export const PhoneAct: React.FC<{f: number}> = ({f}) => {
  if (f < T.s3 || f > T.s6 + 14) return null;
  const pose = phonePose(f);
  const poseBurst = phonePose(K.burst);
  const bx = poseBurst.x;
  const by = poseBurst.y + (BTN_CENTER_Y - SCREEN.h / 2) * poseBurst.s;

  // S3 → S4: köşegen mavi wipe (sol alttan sağ üste)
  const wc = 3300 * ease.inOutCubic(prog(f, 357, 20));
  const diag = (c: number) => `polygon(-300px ${-300 + 1920 - c}px, 1380px ${1380 + 1920 - c}px, 1380px 3400px, -300px 3400px)`;
  // S4 → S5: onay noktasından yayılan gece irisi
  const ir = 2100 * ease.inOutCubic(prog(f, K.irisNight, 24));

  const zoomActive = f < T.s3 + 22;

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* S3 zemini */}
      {ir < 2000 ? (
        <div style={{position: 'absolute', inset: 0}}>
          {wc < 3250 ? (
            <div style={{position: 'absolute', inset: 0}}>
              <LightBg f={f} floaters={clamp((f - T.s3) / 12)} />
              <Caption f={f} at={192} y={238} size={86} lines={['Sepetini birkaç', 'dokunuşla doldur.']} color={C.ink} highlight={{'dokunuşla': C.blue}} />
            </div>
          ) : null}
          {/* wipe'ın önündeki açık mavi şerit */}
          {wc > 0 ? (
            <div style={{position: 'absolute', inset: 0, clipPath: diag(wc + 220), background: `linear-gradient(135deg, ${C.blueLight}, #6FAEFF)`}} />
          ) : null}
          {/* S4 zemini */}
          {wc > 0 ? (
            <div style={{position: 'absolute', inset: 0, clipPath: wc < 3250 ? diag(wc) : undefined}}>
              <BlueBg f={f} cy={1100} />
              <Caption f={f} at={370} y={236} size={104} lines={['Güvenli ödeme.']} />
            </div>
          ) : null}
        </div>
      ) : null}
      {/* S5 zemini: gece */}
      {ir > 0 ? (
        <div style={{position: 'absolute', inset: 0, clipPath: ir < 2000 ? `circle(${ir}px at ${bx}px ${by}px)` : undefined}}>
          <NightBg f={f} amber={0.9} />
          <Caption f={f} at={488} y={232} size={92} lines={['Kuryeni canlı', 'takip et.']} highlight={{'canlı': C.amber}} />
          <Counter f={f} />
        </div>
      ) : null}
      {ir > 0 && ir < 2000 ? (
        <div
          style={{
            position: 'absolute',
            left: bx - ir,
            top: by - ir,
            width: ir * 2,
            height: ir * 2,
            borderRadius: '50%',
            border: `${16}px solid ${C.blueLight}`,
            boxShadow: '0 0 40px rgba(59,139,255,0.8)',
          }}
        />
      ) : null}
      {/* telefon: açılış zoom'unda hareket bulanıklığı */}
      <MotionBlur
        f={f}
        active={zoomActive && f > T.s3}
        samples={5}
        render={(t) => (
          <Phone pose={zoomActive ? phonePose(t) : pose} shadow={clamp((t - T.s3) / 14)}>
            <ScreenContent f={zoomActive ? Math.max(T.s3, t) : f} />
          </Phone>
        )}
      />
      <Burst f={f} x={bx} y={by} />
    </div>
  );
};
