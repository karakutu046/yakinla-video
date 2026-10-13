import React from 'react';
import {FONT} from '../fonts';
import {C, clamp, ease, prog, rand, spr, SP, upTR} from '../lib';
import {PunchWords} from '../components/Kinetic';
import {MotionBlur} from '../components/MotionBlur';

// S1 · 0:00–0:03 · Kanca (gece)
// "Saat 23:40." → "Evde süt bitti." → "Market kapandı mı?"
// Satırlar ekranda birikir, böylece her cümle en az 1,2 sn okunur.
// Çıkış: alttaki satırlar yerçekimiyle düşer, saat haneleri düşen pinin çarpmasıyla saçılır.

const A_AT = 0; // "Saat 23:40."
const B_AT = 24; // "Evde süt bitti."
const C_AT = 40; // "Market kapandı mı?"
const EXIT_C = 86;
const EXIT_B = 89;
const KNOCK = 99; // pin saatin hizasından geçer

const fall = (f: number, at: number, seed: number) => {
  const t = Math.max(0, (f - at) / 30);
  return {
    y: 0.5 * 5200 * t * t + 180 * t,
    r: (rand(seed) - 0.5) * 40 * t,
    o: 1 - clamp((f - at - 6) / 8),
  };
};

/** Kilometre sayacı gibi dönen tek hane */
const Digit: React.FC<{f: number; d: number; at: number; size: number}> = ({f, d, at, size}) => {
  const p = spr(f, at, {k: 120, c: 17});
  const pos = d + 10 * (1 - p); // tam bir tur dönerek yerine oturur
  const lh = size * 1.0;
  const strip = new Array(d + 12).fill(0).map((_, i) => i % 10);
  return (
    <span style={{display: 'inline-block', height: lh, overflow: 'hidden', verticalAlign: 'top'}}>
      <span style={{display: 'block', transform: `translateY(${-pos * lh}px)`}}>
        {strip.map((n, i) => (
          <span key={i} style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
};

const Clock: React.FC<{f: number; size: number}> = ({f, size}) => {
  const digits = [2, 3, 4, 0];
  const blink = Math.floor(f / 15) % 2 === 0 ? 1 : 0.35;
  // pin çarpınca haneler dışa saçılır
  const kt = Math.max(0, (f - KNOCK) / 30);
  const part = (i: number, el: React.ReactNode, key: string) => {
    const dir = i - 2;
    const x = dir * 900 * kt;
    const y = -500 * kt + 0.5 * 6000 * kt * kt;
    const r = dir * 260 * kt;
    return (
      <span key={key} style={{display: 'inline-block', transform: kt > 0 ? `translate(${x}px, ${y}px) rotate(${r}deg)` : undefined}}>
        {el}
      </span>
    );
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.04em',
        color: C.white,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        filter: 'drop-shadow(0 0 40px rgba(255,180,90,0.22))',
      }}
    >
      {part(0, <Digit f={f} d={digits[0]} at={A_AT + 2} size={size} />, 'd0')}
      {part(1, <Digit f={f} d={digits[1]} at={A_AT + 4} size={size} />, 'd1')}
      {part(1.5, <span style={{color: C.amber, opacity: blink, padding: '0 0.02em', display: 'inline-block', transform: 'translateY(-0.06em)'}}>:</span>, 'c')}
      {part(2, <Digit f={f} d={digits[2]} at={A_AT + 6} size={size} />, 'd2')}
      {part(3, <Digit f={f} d={digits[3]} at={A_AT + 8} size={size} />, 'd3')}
      {part(4, <span style={{color: C.amber}}>.</span>, 'p')}
    </div>
  );
};

export const S1Hook: React.FC<{f: number}> = ({f}) => {
  if (f > 116) return null;
  // hafif kamera itişi + her vuruşta küçük "punch"
  const hits = [A_AT, B_AT, B_AT + 4, B_AT + 8, C_AT, C_AT + 5, C_AT + 10];
  const punch = hits.reduce((acc, h) => acc + (f >= h ? 0.014 * Math.exp(-(f - h) * 0.35) : 0), 0);
  const cam = 1 + 0.045 * ease.inOutCubic(prog(f, 0, 100)) + punch;

  const labelP = spr(f, A_AT, SP.pop);
  const fb = fall(f, EXIT_B, 2);
  const fc1 = fall(f, EXIT_C, 3);
  const fc2 = fall(f, EXIT_C - 1, 4);
  const kt = Math.max(0, (f - KNOCK) / 30);

  // soru işareti sallanır
  const qSwing = f > C_AT + 10 ? Math.sin((f - C_AT - 10) * 0.32) * 14 * Math.exp(-(f - C_AT - 10) * 0.06) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 48%'}}>
      {/* "SAAT" etiketi */}
      <div
        style={{
          position: 'absolute',
          top: 396,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: '0.34em',
          color: C.amber,
          opacity: clamp(labelP * 2) * (1 - clamp(kt * 6)),
          transform: `translateY(${(1 - labelP) * 30 + 0.5 * 6000 * kt * kt}px)`,
        }}
      >
        {upTR('Saat')}
      </div>
      {/* 23:40. — dönerken dikey hareket bulanıklığı */}
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, height: 260}}>
        <MotionBlur
          f={f}
          active={f < A_AT + 26 || (f > KNOCK - 1 && f < KNOCK + 12)}
          samples={6}
          render={(t) => (
            <div style={{position: 'absolute', inset: 0}}>
              <Clock f={t} size={250} />
            </div>
          )}
        />
      </div>
      {/* Evde süt bitti. */}
      <div
        style={{
          position: 'absolute',
          top: 800,
          left: 0,
          right: 0,
          transform: `translateY(${fb.y}px) rotate(${fb.r}deg)`,
          opacity: fb.o,
        }}
      >
        <PunchWords
          f={f}
          size={100}
          words={[
            {text: 'Evde', at: B_AT},
            {text: 'süt', at: B_AT + 4, color: C.amber},
            {text: 'bitti.', at: B_AT + 8},
          ]}
        />
      </div>
      {/* Market / kapandı mı? */}
      <div style={{position: 'absolute', top: 966, left: 0, right: 0, transform: `translateY(${fc1.y}px) rotate(${fc1.r}deg)`, opacity: fc1.o}}>
        <PunchWords f={f} size={132} words={[{text: 'Market', at: C_AT}]} />
      </div>
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, transform: `translateY(${fc2.y}px) rotate(${fc2.r}deg)`, opacity: fc2.o}}>
        <PunchWords
          f={f}
          size={132}
          words={[
            {text: 'kapandı', at: C_AT + 5},
            {text: 'mı', at: C_AT + 9},
          ]}
          gap={0.24}
          after={<QuestionMark f={f} at={C_AT + 10} swing={qSwing} />}
        />
      </div>
    </div>
  );
};

/** Amber soru işareti: yukarıdan düşer ve sarkaç gibi sallanır */
const QuestionMark: React.FC<{f: number; at: number; swing: number}> = ({f, at, swing}) => {
  const p = spr(f, at, SP.bouncy);
  return (
    <span
      style={{
        display: 'inline-block',
        color: C.amber,
        opacity: clamp((f - at) / 3),
        transform: `translateY(${(1 - p) * -0.6}em) rotate(${swing}deg) scale(${0.6 + 0.4 * p})`,
        transformOrigin: '50% 90%',
      }}
    >
      ?
    </span>
  );
};
