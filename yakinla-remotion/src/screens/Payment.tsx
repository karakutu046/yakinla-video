import React from 'react';
import {FONT} from '../fonts';
import {BRAND_GRADIENT, C, clamp, ease, lerp, prog, spr, SP} from '../lib';
import {CardIcon, CheckIcon, LocationIcon, ShieldIcon} from '../components/Icons';
import {SCREEN} from '../components/Phone';
import {BTN, BTN_CENTER_Y, K, SHEET_TOP} from './timeline';

const Row: React.FC<{icon: React.ReactNode; label: string; value: string; y: number}> = ({icon, label, value, y}) => (
  <div style={{position: 'absolute', left: 26, right: 26, top: y, height: 84, display: 'flex', alignItems: 'center', gap: 18}}>
    <div style={{width: 64, height: 64, borderRadius: 20, background: '#EEF4FE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
    <div style={{flex: 1}}>
      <div style={{fontSize: 20, fontWeight: 500, color: C.gray600}}>{label}</div>
      <div style={{fontSize: 26, fontWeight: 700, color: C.ink, marginTop: 2, letterSpacing: '-0.01em'}}>{value}</div>
    </div>
    <svg width="14" height="24" viewBox="0 0 14 24">
      <path d="M3 3l8 9-8 9" fill="none" stroke={C.gray400} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Ödeme sayfası (S4): alttan açılır, "Siparişi Onayla" dokunulunca onay işaretine dönüşür. */
export const PaymentSheet: React.FC<{f: number}> = ({f}) => {
  if (f < K.sheetIn - 2) return null;
  const dim = prog(f, K.sheetIn - 2, 10);
  const sp = spr(f, K.sheetIn, {k: 150, c: 19});
  const top = lerp(SCREEN.h + 20, SHEET_TOP, sp);
  const shieldP = ease.outCubic(prog(f, K.shield, 14));
  const shimmer = prog(f, K.shield + 8, 20);

  // düğme: basılır → daireye büzülür → onay işareti çizilir
  const press = clamp(1 - Math.abs(f - K.tapConfirm - 0.5) / 4);
  const morph = spr(f, K.tapConfirm + 2, {k: 200, c: 20});
  const bw = lerp(SCREEN.w - 52, BTN.h, morph);
  const labelO = 1 - prog(f, K.tapConfirm + 1, 5);
  const checkP = ease.outCubic(prog(f, K.tapConfirm + 10, 10));
  const checkPop = spr(f, K.tapConfirm + 9, SP.pop);

  // başarı dolgusu: düğmeden ekrana yayılan mavi daire
  const fillR = 1400 * ease.inOutCubic(prog(f, K.successFill, 18));
  const bigCheck = spr(f, K.successFill + 10, SP.bouncy);

  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(6,16,40,0.5)', opacity: dim}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top,
          height: SCREEN.h - SHEET_TOP + 40,
          borderRadius: '44px 44px 0 0',
          background: '#fff',
          boxShadow: '0 -20px 50px rgba(6,20,60,0.25)',
        }}
      >
        <div style={{position: 'absolute', left: SCREEN.w / 2 - 32, top: 14, width: 64, height: 8, borderRadius: 4, background: C.gray200}} />
        <div style={{position: 'absolute', left: 28, top: 38, fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink}}>Ödeme</div>
        <Row y={108} icon={<LocationIcon size={34} />} label="Teslimat adresi" value="Ev · Afşin" />
        <Row y={204} icon={<CardIcon size={34} />} label="Ödeme yöntemi" value="Kayıtlı kartım" />
        {/* 3D Secure kutusu */}
        <div
          style={{
            position: 'absolute',
            left: 26,
            right: 26,
            top: 318,
            height: 104,
            borderRadius: 26,
            background: '#EAF2FF',
            border: '2px solid #C9DCFF',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 22px',
            overflow: 'hidden',
          }}
        >
          <div style={{position: 'relative', width: 62, height: 62, flex: 'none'}}>
            <div style={{position: 'absolute', inset: -6, borderRadius: '50%', background: 'rgba(31,115,240,0.16)', transform: `scale(${0.6 + 0.6 * shieldP})`, opacity: 1 - shimmer}} />
            <ShieldIcon size={62} color={C.blue} stroke={2} progress={shieldP} fill="rgba(31,115,240,0.10)" />
          </div>
          <div style={{fontSize: 26, fontWeight: 800, color: '#0E4FB8', letterSpacing: '-0.015em', whiteSpace: 'nowrap'}}>3D Secure ile güvenli ödeme</div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(100deg, rgba(255,255,255,0) ${shimmer * 160 - 40}%, rgba(255,255,255,0.85) ${shimmer * 160 - 25}%, rgba(255,255,255,0) ${shimmer * 160 - 10}%)`,
              opacity: shimmer > 0 && shimmer < 1 ? 1 : 0,
            }}
          />
        </div>
        {/* Siparişi Onayla */}
        <div
          style={{
            position: 'absolute',
            left: SCREEN.w / 2 - bw / 2,
            top: BTN.y,
            width: bw,
            height: BTN.h,
            borderRadius: BTN.h / 2,
            background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDeep})`,
            boxShadow: `0 16px 30px rgba(31,115,240,${0.4 + press * 0.2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            transform: `scale(${1 - press * 0.05})`,
            overflow: 'hidden',
          }}
        >
          <span style={{opacity: labelO}}>Siparişi Onayla</span>
          {checkP > 0 ? (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * checkPop})`}}>
              <CheckIcon size={58} stroke={3.2} progress={checkP} />
            </div>
          ) : null}
        </div>
      </div>
      {/* düğmeden yayılan halkalar (ekran içi) */}
      {[0, 6].map((d, i) => {
        const p = prog(f, K.burst + d, 18);
        if (p <= 0 || p >= 1) return null;
        const r = 50 + 520 * ease.outCubic(p);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: SCREEN.w / 2 - r,
              top: BTN_CENTER_Y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `${10 * (1 - p) + 2}px solid ${C.blueLight}`,
              opacity: 1 - p,
            }}
          />
        );
      })}
      {/* başarı dolgusu */}
      {fillR > 0 ? (
        <div style={{position: 'absolute', inset: 0, clipPath: `circle(${fillR}px at ${SCREEN.w / 2}px ${BTN_CENTER_Y}px)`, background: BRAND_GRADIENT}}>
          <div
            style={{
              position: 'absolute',
              left: SCREEN.w / 2 - 110,
              top: 470,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              border: '4px solid rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${bigCheck})`,
            }}
          >
            <CheckIcon size={130} stroke={2.8} progress={ease.outCubic(prog(f, K.successFill + 12, 10))} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
