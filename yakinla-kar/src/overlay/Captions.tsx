import React from 'react';
import {SERIF} from '../fonts';
import {clamp, ease, prog} from '../lib';

// Sinematik altyazılar (dış ses yok): yumuşak, bulanıktan netleşerek gelir.
// Her satır en az 1,2 sn tam okunur kalır.
type Line = {text: string; at: number; out: number};
const GROUPS: {y: number; lines: Line[]}[] = [
  {y: 1250, lines: [{text: 'Dışarıda kar,', at: 8, out: 104}, {text: 'çayın şekeri bitti.', at: 40, out: 104}]},
  {y: 1300, lines: [{text: 'Sen evden çıkma.', at: 112, out: 154}]},
  {y: 1250, lines: [{text: "Afşin'deki depomuzdan", at: 178, out: 318}, {text: 'ortalama 60 dakikada kapında.', at: 236, out: 318}]},
  {y: 1300, lines: [{text: 'Çayın tatlı olsun.', at: 338, out: 378}]},
];

const LineView: React.FC<{f: number; l: Line}> = ({f, l}) => {
  const i = ease.out(prog(f, l.at, 18));
  const o = 1 - ease.in(prog(f, l.out, 10));
  const a = Math.min(i, o);
  if (a <= 0) return null;
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontWeight: 420,
        fontSize: 76,
        lineHeight: 1.2,
        letterSpacing: `${(1 - i) * 0.05 - 0.005}em`,
        color: '#fffaf2',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        opacity: a,
        transform: `translateY(${(1 - i) * 22}px)`,
        filter: `blur(${(1 - a) * 8}px)`,
        textShadow: '0 2px 24px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.35)',
      }}
    >
      {l.text}
    </div>
  );
};

export const Captions: React.FC<{f: number}> = ({f}) => (
  <>
    {/* alt kısımda okunurluk için yumuşak karartma */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1050,
        height: 600,
        background: 'linear-gradient(180deg, rgba(3,8,20,0) 0%, rgba(3,8,20,0.42) 45%, rgba(3,8,20,0.42) 70%, rgba(3,8,20,0) 100%)',
        opacity: clamp(1 - prog(f, 372, 12)),
      }}
    />
    {GROUPS.map((g, gi) => (
      <div key={gi} style={{position: 'absolute', left: 0, right: 0, top: g.y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {g.lines.map((l, li) => (
          <LineView key={li} f={f} l={l} />
        ))}
      </div>
    ))}
  </>
);
