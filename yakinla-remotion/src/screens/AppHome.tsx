import React from 'react';
import {FONT} from '../fonts';
import {C, clamp, ease, prog, qbez, spr, SP} from '../lib';
import {PinLogo} from '../components/Brand';
import {ArrowRight, CartIcon, ChevronDown, LocationIcon, PlusIcon, SearchIcon, SignalIcons} from '../components/Icons';
import {PRODUCTS, ProductSvg} from '../components/Products';
import {MotionBlur} from '../components/MotionBlur';
import {SCREEN} from '../components/Phone';
import {artCenter, CART, CART_BAR, cardPos, cartCount, chipScroll, GRID, K, plusCenter} from './timeline';

const CATEGORIES = ['Meyve-Sebze', 'Süt & Kahvaltılık', 'Temel Gıda', 'İçecek', 'Atıştırmalık', 'Temizlik', 'Kişisel Bakım'];
const CHIP_FONT = 22;
// Inter 22 px yarı kalın için yaklaşık karakter genişliği; yalnızca kaydırma mesafesi için
const chipW = (s: string) => Math.round(s.length * CHIP_FONT * 0.56 + 48);
const CHIPS_TOTAL = CATEGORIES.reduce((a, c) => a + chipW(c) + 12, 0) - 12;
const CHIP_MAX_SCROLL = CHIPS_TOTAL - (SCREEN.w - 48);

const enter = (f: number, at: number) => {
  const p = spr(f, at, SP.soft);
  return {opacity: clamp(p * 1.6), transform: `translateY(${(1 - p) * 46}px)`};
};

export const StatusBar: React.FC<{time: string; dark?: boolean}> = ({time, dark = true}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60}}>
    <div style={{position: 'absolute', left: 54, top: 20, fontFamily: FONT, fontWeight: 600, fontSize: 24, color: dark ? C.ink : '#fff', fontVariantNumeric: 'tabular-nums'}}>
      {time}
    </div>
    <div style={{position: 'absolute', right: 40, top: 22}}>
      <SignalIcons color={dark ? C.ink : '#fff'} />
    </div>
  </div>
);

const TouchDot: React.FC<{x: number; y: number; visible: number; press: number; ripple: number}> = ({x, y, visible, press, ripple}) => {
  if (visible <= 0) return null;
  const s = 1 - press * 0.18;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: visible}}>
      {ripple >= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: x - 60,
            top: y - 60,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '4px solid rgba(31,115,240,0.75)',
            transform: `scale(${0.4 + ripple * 1.2})`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - 38,
          top: y - 38,
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.95), rgba(220,232,250,0.75))',
          border: '3px solid rgba(255,255,255,0.95)',
          boxShadow: `0 ${10 - press * 6}px ${26 - press * 12}px rgba(8,30,80,0.35), 0 0 0 ${2 + press * 8}px rgba(31,115,240,${0.25 + press * 0.3})`,
          transform: `scale(${s})`,
        }}
      />
    </div>
  );
};

export {TouchDot};

export const AppHome: React.FC<{f: number}> = ({f}) => {
  const count = cartCount(f);
  const scroll = chipScroll(f, CHIP_MAX_SCROLL);
  const lastArrive = K.taps.map((t) => t + K.flyDur).filter((t) => f >= t).pop();
  const badgeBump = lastArrive !== undefined ? Math.exp(-(f - lastArrive) * 0.22) * Math.sin((f - lastArrive) * 0.9) : 0;
  const barP = spr(f, K.taps[0] + K.flyDur - 2, SP.soft);
  const cartPress = clamp(1 - Math.abs(f - K.tapCart - 1) / 5);

  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT, color: C.ink}}>
      <StatusBar time="23:41" />
      {/* başlık */}
      <div style={{position: 'absolute', left: 24, top: 72, display: 'flex', alignItems: 'center', gap: 10, ...enter(f, K.homeIn)}}>
        <PinLogo size={60} style={{margin: '-4px -6px -4px -8px'}} />
        <div>
          <div style={{fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', color: C.blue, lineHeight: 1.05}}>Yakınla</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 19, fontWeight: 600, color: C.gray600, marginTop: 2}}>
            <LocationIcon size={18} color={C.gray600} stroke={2.2} />
            Afşin
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      {/* sepet düğmesi */}
      <div style={{position: 'absolute', left: CART.x - 33, top: CART.y - 33, width: 66, height: 66, ...enter(f, K.homeIn + 2)}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 33,
          background: '#EAF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + badgeBump * 0.12})`,
        }}
      >
        <CartIcon size={34} color={C.blue} stroke={2.1} />
        {count > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: -6,
              top: -6,
              minWidth: 32,
              height: 32,
              borderRadius: 16,
              background: C.amberDeep,
              color: '#fff',
              fontWeight: 800,
              fontSize: 19,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #fff',
              transform: `scale(${1 + badgeBump * 0.45})`,
            }}
          >
            {count}
          </div>
        ) : null}
      </div>
      </div>
      {/* arama */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          top: 168,
          height: 66,
          borderRadius: 33,
          background: '#F1F4F9',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 24px',
          fontSize: 23,
          color: C.gray400,
          fontWeight: 500,
          ...enter(f, K.homeIn + 4),
        }}
      >
        <SearchIcon size={26} color={C.gray600} />
        Ürün ara
      </div>
      {/* kategori çipleri: yatay kayar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 256, height: 60, overflow: 'hidden', ...enter(f, K.homeIn + 6)}}>
        <div style={{position: 'absolute', left: 24, top: 0, display: 'flex', gap: 12, transform: `translateX(${scroll}px)`}}>
          {CATEGORIES.map((c) => (
            <div
              key={c}
              style={{
                height: 56,
                padding: '0 24px',
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                fontSize: CHIP_FONT,
                fontWeight: 600,
                background: '#fff',
                color: '#23324D',
                border: `2px solid ${C.gray200}`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 26, top: 340, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', ...enter(f, K.homeIn + 8)}}>Sık alınanlar</div>
      {/* ürün kartları */}
      {PRODUCTS.map((p, i) => {
        const pos = cardPos(i);
        const tap = K.taps[i];
        const added = tap !== undefined && f >= tap + 1;
        const pressed = tap !== undefined ? clamp(1 - Math.abs(f - tap - 0.5) / 4) : 0;
        const addP = tap !== undefined ? spr(f, tap + 1, SP.pop) : 0;
        const pc = plusCenter(i);
        return (
          <div key={p.name} style={{position: 'absolute', left: pos.x, top: pos.y, width: GRID.w, height: GRID.h, ...enter(f, K.homeIn + 10 + i * 2)}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                background: '#fff',
                boxShadow: '0 10px 28px rgba(16,40,90,0.10), 0 0 0 2px #EEF2F8',
                transform: `scale(${1 - pressed * 0.025})`,
              }}
            />
            <div style={{position: 'absolute', left: 12, top: 12, width: GRID.w - 24, height: 170, borderRadius: 22, background: 'linear-gradient(180deg, #F3F7FD, #E9F0FA)'}} />
            <div style={{position: 'absolute', left: (GRID.w - 156) / 2, top: 19}}>
              <ProductSvg Art={p.Art} size={156} style={{transform: added ? `scale(${1 + 0.06 * Math.exp(-(f - tap - 1) * 0.2)})` : undefined}} />
            </div>
            <div style={{position: 'absolute', left: 20, top: 196, fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em'}}>{p.name}</div>
            <div style={{position: 'absolute', left: 20, top: 232, fontSize: 21, fontWeight: 500, color: C.gray600}}>{p.unit}</div>
            {/* + düğmesi → eklendi */}
            <div
              style={{
                position: 'absolute',
                left: pc.x - pos.x - 30,
                top: pc.y - pos.y - 30,
                width: 60,
                height: 60,
                borderRadius: 30,
                background: added ? C.blueDeep : C.blue,
                boxShadow: `0 8px 18px rgba(31,115,240,${0.35 + pressed * 0.3})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${1 - pressed * 0.16 + (added ? 0.12 * Math.exp(-(f - tap) * 0.25) : 0)})`,
              }}
            >
              {added ? (
                <span style={{color: '#fff', fontWeight: 800, fontSize: 28, transform: `scale(${addP})`}}>1</span>
              ) : (
                <PlusIcon size={30} />
              )}
            </div>
          </div>
        );
      })}
      {/* sepete uçan ürünler (hareket bulanıklığıyla) */}
      {K.taps.map((tap, i) => {
        if (f < tap + 0.5 || f > tap + K.flyDur + 0.5) return null;
        const Art = PRODUCTS[i].Art;
        const a = artCenter(i);
        return (
          <MotionBlur
            key={`fly${i}`}
            f={f}
            samples={6}
            shutter={0.6}
            render={(t) => {
              const p = ease.inOutCubic(prog(t, tap + 1, K.flyDur - 1));
              const ctrl = [(a.x + CART.x) / 2 - 40, Math.min(a.y, CART.y) - 160];
              const [x, y] = qbez([a.x, a.y], ctrl, [CART.x, CART.y], p);
              const s = 1 - 0.78 * p;
              const o = p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
              return (
                <div style={{position: 'absolute', left: x - 78, top: y - 78, transform: `scale(${s}) rotate(${-28 * p}deg)`, opacity: o, filter: 'drop-shadow(0 12px 14px rgba(10,40,100,0.25))'}}>
                  <ProductSvg Art={Art} size={156} />
                </div>
              );
            }}
          />
        );
      })}
      {/* sepet varış kıvılcımları */}
      {K.taps.map((tap, i) => {
        const d = f - (tap + K.flyDur);
        if (d < 0 || d > 12) return null;
        return new Array(8).fill(0).map((_, j) => {
          const ang = (j / 8) * Math.PI * 2 + i;
          const r = 30 + d * 6;
          return (
            <div
              key={`sp${i}-${j}`}
              style={{
                position: 'absolute',
                left: CART.x + Math.cos(ang) * r - 4,
                top: CART.y + Math.sin(ang) * r - 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: j % 2 ? C.amber : C.blueLight,
                opacity: 1 - d / 12,
              }}
            />
          );
        });
      })}
      {/* alt sepet çubuğu */}
      {barP > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            top: CART_BAR.y,
            height: CART_BAR.h,
            borderRadius: 30,
            background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDeep})`,
            boxShadow: '0 16px 30px rgba(31,115,240,0.35)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            gap: 14,
            color: '#fff',
            transform: `translateY(${(1 - barP) * 180}px) scale(${1 - cartPress * 0.04})`,
          }}
        >
          <CartIcon size={34} color="#fff" stroke={2.2} />
          <span style={{fontSize: 26, fontWeight: 800}}>Sepetim</span>
          <span style={{fontSize: 23, fontWeight: 600, opacity: 0.85}}>· {count} ürün</span>
          <span style={{flex: 1}} />
          <span style={{fontSize: 23, fontWeight: 700}}>Sepete git</span>
          <ArrowRight size={26} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: SCREEN.w / 2 - 90, bottom: 14, width: 180, height: 8, borderRadius: 4, background: C.ink, opacity: 0.85}} />
    </div>
  );
};
