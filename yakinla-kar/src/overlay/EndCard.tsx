import React from 'react';
import {Img, staticFile} from 'remotion';
import {INTER, SERIF} from '../fonts';
import {ease, prog, SHOT} from '../lib';

// Kapanış: bulanık pencere önünün üstünde logo, slogan, mağaza rozetleri, site, bölge notu.
// Rozetler 96 px ölçeğinin 1,25 katı (120 px). Hareket 436. karede biter; son kareler sabit kapak.

const rise = (f: number, at: number, dur = 20) => {
  const p = ease.out(prog(f, at, dur));
  return {opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined};
};

export const EndCard: React.FC<{f: number}> = ({f: raw}) => {
  if (raw < SHOT.end) return null;
  const f = Math.min(raw, SHOT.freeze);
  const dim = ease.inOut(prog(f, SHOT.end, 24));
  const pin = ease.out(prog(f, SHOT.end + 6, 24));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 60% at 50% 45%, rgba(6,12,30,0.35), rgba(3,7,18,0.82))', opacity: dim}} />
      {/* logo işareti: sıcak hâle üzerinde */}
      <div style={{position: 'absolute', left: 540 - 260, top: 560 - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,214,150,0.28), rgba(255,214,150,0))', opacity: pin}} />
      <div style={{position: 'absolute', left: 540 - 120, top: 560 - 120, width: 240, height: 240, opacity: pin, transform: `translateY(${(1 - pin) * -40}px) scale(${0.85 + 0.15 * pin})`}}>
        <Img src={staticFile('yakinla-logo-mark.svg')} style={{width: 240, height: 240}} />
      </div>
      <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center', fontFamily: INTER, fontWeight: 800, fontSize: 150, letterSpacing: '-0.035em', color: '#fff', ...rise(f, SHOT.end + 12)}}>
        Yakınla
      </div>
      <div style={{position: 'absolute', top: 878, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 420, fontSize: 62, color: '#ffe9c9', ...rise(f, SHOT.end + 20)}}>
        Afşin&apos;de market artık yakınında.
      </div>
      <div style={{position: 'absolute', top: 1040, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28, ...rise(f, SHOT.end + 28)}}>
        <Img src={staticFile('badge-appstore.png')} style={{height: 120, width: 'auto'}} />
        <Img src={staticFile('badge-googleplay.png')} style={{height: 120, width: 'auto'}} />
      </div>
      <div style={{position: 'absolute', top: 1196, left: 0, right: 0, textAlign: 'center', fontFamily: INTER, fontWeight: 650, fontSize: 52, color: '#fff', ...rise(f, SHOT.end + 34)}}>
        yakinla.com
      </div>
      <div style={{position: 'absolute', top: 1392, left: 60, right: 60, textAlign: 'center', fontFamily: INTER, fontWeight: 500, fontSize: 31, lineHeight: 1.45, color: 'rgba(255,255,255,0.82)', ...rise(f, SHOT.end + 40)}}>
        <div style={{width: 110, height: 2, margin: '0 auto 18px', background: 'rgba(255,255,255,0.3)'}} />
        Şu an aktif bölgemiz: <b style={{fontWeight: 700, color: '#fff'}}>Kahramanmaraş Afşin</b>
        <br />
        Yeni şehir ve ilçeler ekleniyor
      </div>
    </div>
  );
};
