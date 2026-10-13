import React from 'react';
import {FONT} from '../fonts';
import {C, clamp, ease, HOURS, prog, spr, SP, T} from '../lib';
import {LightBg} from '../components/Backgrounds';
import {RiseWords} from '../components/Kinetic';
import {ClockIcon, LocationIcon, MoonIcon, NoTruckIcon, WarehouseIcon} from '../components/Icons';
import {MotionBlur} from '../components/MotionBlur';

// S6 · 0:22–0:26 · Neden Yakınla
// Üç kart sırayla uçarak gelir ve üst üste yığılır (her biri ~1,2 sn arayla).

export const CARD_AT = [664, 698, 732];
const CARD = {w: 940, h: 262, x: 70};
const SLOT_Y = [520, 780, 1040];
const TILT = [-1.6, 1.3, -0.9];

const IconTile: React.FC<{children: React.ReactNode; p: number}> = ({children, p}) => (
  <div
    style={{
      width: 156,
      height: 156,
      borderRadius: 42,
      background: `linear-gradient(150deg, ${C.blueLight}, ${C.blueDeep})`,
      boxShadow: '0 14px 30px rgba(31,115,240,0.35), inset 0 2px 0 rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -20}deg)`,
      flex: 'none',
    }}
  >
    {children}
  </div>
);

const CardBody: React.FC<{i: number; f: number}> = ({i, f}) => {
  const at = CARD_AT[i];
  const ip = spr(f, at + 6, SP.bouncy);
  const textStyle: React.CSSProperties = {fontFamily: FONT, fontWeight: 750, fontSize: 50, letterSpacing: '-0.025em', lineHeight: 1.16, color: C.ink};
  let icon: React.ReactNode;
  let text: React.ReactNode;
  if (i === 0) {
    const bounce = Math.abs(Math.sin(Math.max(0, f - at - 10) * 0.25)) * Math.exp(-Math.max(0, f - at - 10) * 0.08) * 14;
    icon = (
      <div style={{position: 'relative'}}>
        <WarehouseIcon size={92} color="#fff" stroke={2} />
        <div style={{position: 'absolute', right: -14, top: -22 - bounce, background: C.amber, borderRadius: 20, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'}}>
          <LocationIcon size={26} color={C.ink} stroke={2.4} />
        </div>
      </div>
    );
    text = (
      <div style={textStyle}>
        <div>Bölgendeki depodan</div>
        <div>hazırlanır</div>
      </div>
    );
  } else if (i === 1) {
    icon = <NoTruckIcon size={96} color="#fff" stroke={1.9} slash={ease.outCubic(prog(f, at + 12, 12))} />;
    text = (
      <div style={{...textStyle, fontSize: 48}}>
        <div>Ürünler başka şehirden</div>
        <div>kargoyla gelmez</div>
      </div>
    );
  } else {
    const hand = 360 * ease.outCubic(prog(f, at + 6, 30)) * 2;
    icon = (
      <div style={{position: 'relative'}}>
        <ClockIcon size={94} color="#fff" stroke={1.9} hand={hand} />
        <div style={{position: 'absolute', right: -18, top: -18, transform: `scale(${spr(f, at + 14, SP.pop)})`}}>
          <MoonIcon size={40} />
        </div>
      </div>
    );
    text = (
      <div style={textStyle}>
        <div>Her gün</div>
        <div style={{fontSize: 64, fontWeight: 800, color: C.blue, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{HOURS}</div>
      </div>
    );
  }
  const shimmer = prog(f, at + 10, 18);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 48,
        background: '#fff',
        boxShadow: '0 30px 60px rgba(14,50,120,0.16), 0 0 0 2px rgba(220,228,240,0.9)',
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        padding: '0 44px',
        overflow: 'hidden',
      }}
    >
      <IconTile p={ip}>{icon}</IconTile>
      {text}
      {shimmer > 0 && shimmer < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(100deg, rgba(255,255,255,0) ${shimmer * 160 - 40}%, rgba(59,139,255,0.10) ${shimmer * 160 - 25}%, rgba(255,255,255,0) ${shimmer * 160 - 10}%)`,
          }}
        />
      ) : null}
    </div>
  );
};

/** Kartın uçuşu: alttan, 3B dönerek gelir; yerine oturduğunda alttakileri hafifçe bastırır */
const cardTransform = (i: number, t: number) => {
  const at = CARD_AT[i];
  const p = spr(t, at, {k: 150, c: 16});
  const x = (1 - p) * 220;
  const y = (1 - p) * 1100;
  const rx = (1 - p) * 55;
  const rz = TILT[i] + (1 - p) * 14;
  const s = 1 + (1 - p) * 0.12;
  // sonraki kartlar indikçe bu kart hafifçe sıkışır
  let squash = 0;
  for (let j = i + 1; j < CARD_AT.length; j++) {
    const d = t - (CARD_AT[j] + 9);
    if (d > 0) squash += Math.exp(-d * 0.18) * Math.sin(d * 0.5) * 7;
  }
  return {x, y: y + squash, rx, rz, s, o: clamp((t - at) / 4)};
};

export const S6Why: React.FC<{f: number}> = ({f}) => {
  if (f < T.s6 - 2 || f > T.s7 + 16) return null;
  // S7'ye geçiş: kartlar merkeze doğru toplanır
  const out = ease.inCubic(prog(f, 772, 12));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <LightBg f={f} floaters={0} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - out * 0.35})`, opacity: 1 - out * 0.6, transformOrigin: '540px 960px'}}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0}}>
          <RiseWords f={f} text="Neden Yakınla?" at={661} size={88} color={C.ink} highlight={{'Yakınla?': C.blue}} />
        </div>
        {CARD_AT.map((at, i) => {
          if (f < at - 1) return null;
          return (
            <MotionBlur
              key={i}
              f={f}
              active={f < at + 12}
              samples={6}
              render={(t) => {
                const c = cardTransform(i, t);
                return (
                  <div style={{position: 'absolute', left: CARD.x, top: SLOT_Y[i], width: CARD.w, height: CARD.h, perspective: 1800}}>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        transform: `translate(${c.x}px, ${c.y}px) rotateX(${c.rx}deg) rotate(${c.rz}deg) scale(${c.s})`,
                        transformOrigin: '50% 0%',
                        opacity: c.o,
                      }}
                    >
                      <CardBody i={i} f={f} />
                    </div>
                  </div>
                );
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
