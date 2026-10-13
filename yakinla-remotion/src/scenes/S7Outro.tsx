import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT} from '../fonts';
import {clamp, dropBounce, ease, prog, spr, SP, T} from '../lib';
import {BlueBg} from '../components/Backgrounds';
import {IconPlate, PinLogo, Wordmark} from '../components/Brand';
import {RiseWords} from '../components/Kinetic';
import {LocationIcon} from '../components/Icons';
import {MotionBlur} from '../components/MotionBlur';

// S7 · 0:26–0:30 · Kapanış
// Mavi gradyan zemin, logo + "Yakınla", slogan, mağaza rozetleri, yakinla.com ve bölge notu.
// Tüm hareket 880. karede (29,33 sn) durur; son 0,5 sn'den fazlası sabit kapak karesidir.

export const FREEZE = 880;
const ICON = {x: 540, y: 520, size: 280, pin: 232};
// Rozetler: kaynak dosyalar 96 px yükseklik ölçeğinde; 1,25 kat → 120 px (sınır 1,3 kat)
const BADGE_H = 120;

export const S7Outro: React.FC<{f: number}> = ({f: rawF}) => {
  if (rawF < T.s7 - 6) return null;
  const f = Math.min(rawF, FREEZE);

  // S6'dan iris: merkezden büyüyen mavi daire
  const R = 1200 * ease.inOutCubic(prog(rawF, 774, 18));
  const ringP = prog(rawF, 774, 18);

  const plateP = spr(f, T.s7 + 2, SP.pop);
  const dropAt = T.s7 + 6;
  const impact = dropAt + Math.sqrt((2 * 380) / 11000) * 30;
  const pulse = prog(f, impact, 26);

  const badgeP = [spr(f, T.s7 + 40, SP.pop), spr(f, T.s7 + 45, SP.pop)];
  const urlP = spr(f, T.s7 + 50, SP.soft);
  const noteP = spr(f, T.s7 + 56, SP.soft);

  return (
    <div style={{position: 'absolute', inset: 0, clipPath: R < 1190 ? `circle(${R}px at 540px 900px)` : undefined}}>
      <BlueBg f={f} cy={ICON.y} />
      {/* ikon plakası + düşen pin */}
      <div style={{position: 'absolute', left: ICON.x - ICON.size / 2, top: ICON.y - ICON.size / 2, transform: `scale(${plateP}) rotate(${(1 - plateP) * 20}deg)`}}>
        <IconPlate size={ICON.size} />
      </div>
      {pulse > 0 && pulse < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: ICON.x - 150 - pulse * 420,
            top: ICON.y - 150 - pulse * 420,
            width: 300 + pulse * 840,
            height: 300 + pulse * 840,
            borderRadius: '50%',
            border: `${14 * (1 - pulse) + 2}px solid rgba(255,255,255,${0.8 * (1 - pulse)})`,
          }}
        />
      ) : null}
      <MotionBlur
        f={f}
        active={f > dropAt && f < impact + 6}
        samples={6}
        render={(t) => {
          const d = dropBounce(t, dropAt, 380, 11000, 0.28);
          const sq = d.sinceImpact >= 0 ? 0.2 * Math.pow(0.45, d.impacts - 1) * Math.exp(-d.sinceImpact * 16) * Math.cos(d.sinceImpact * 34) : 0;
          return (
            <div
              style={{
                position: 'absolute',
                left: ICON.x - ICON.pin / 2,
                top: ICON.y - ICON.pin / 2,
                transform: `translateY(${d.y}px) scale(${1 + sq * 0.7}, ${1 - sq})`,
                transformOrigin: '50% 89%',
                opacity: clamp((t - dropAt) / 2),
              }}
            >
              <PinLogo size={ICON.pin} />
            </div>
          );
        }}
      />
      {/* Yakınla */}
      <div style={{position: 'absolute', top: 790 - 92, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Wordmark f={f} start={T.s7 + 14} size={160} stagger={2} shine={prog(f, T.s7 + 66, 20)} />
      </div>
      {/* slogan */}
      <div style={{position: 'absolute', top: 884, left: 0, right: 0}}>
        <RiseWords f={f} text="Market artık yakınında." at={T.s7 + 26} size={66} weight={650} stagger={3} />
      </div>
      {/* mağaza rozetleri */}
      <div style={{position: 'absolute', top: 1100 - BADGE_H / 2, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
        {['badge-appstore.png', 'badge-googleplay.png'].map((b, i) => (
          <Img
            key={b}
            src={staticFile(b)}
            style={{height: BADGE_H, width: 'auto', display: 'block', transform: `translateY(${(1 - badgeP[i]) * 60}px) scale(${0.7 + 0.3 * badgeP[i]})`, opacity: clamp(badgeP[i] * 2)}}
          />
        ))}
      </div>
      {/* yakinla.com */}
      <div
        style={{
          position: 'absolute',
          top: 1238 - 34,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: '-0.01em',
          color: '#fff',
          transform: `translateY(${(1 - urlP) * 30}px)`,
          opacity: clamp(urlP * 1.5),
        }}
      >
        yakinla.com
      </div>
      {/* bölge notu (güvenli alanın içinde, en altta) */}
      <div
        style={{
          position: 'absolute',
          top: 1384,
          left: 60,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.88)',
          opacity: clamp(noteP * 1.5),
          transform: `translateY(${(1 - noteP) * 20}px)`,
        }}
      >
        <div style={{width: 120, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.35)', marginBottom: 14}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <LocationIcon size={30} color="#fff" stroke={2.2} />
          <span>
            Şu an aktif bölgemiz: <b style={{fontWeight: 700, color: '#fff'}}>Kahramanmaraş Afşin</b>
          </span>
        </div>
        <div>Yeni şehir ve ilçeler ekleniyor</div>
      </div>
      {/* iris kenarı */}
      {ringP > 0 && ringP < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 540 - R,
            top: 900 - R,
            width: R * 2,
            height: R * 2,
            borderRadius: '50%',
            border: `${18 * (1 - ringP) + 4}px solid rgba(255,255,255,0.9)`,
          }}
        />
      ) : null}
    </div>
  );
};
