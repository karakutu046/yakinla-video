import React from 'react';
import {AbsoluteFill, getStaticFiles, Html5Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {NightBg} from './components/Backgrounds';
import {S1Hook} from './scenes/S1Hook';
import {S2Logo} from './scenes/S2Logo';
import {PhoneAct} from './scenes/PhoneAct';
import {S6Why} from './scenes/S6Why';
import {S7Outro} from './scenes/S7Outro';
import {PanelWipe} from './components/Wipes';
import {DURATION, T} from './lib';

// public/muzik.mp3 varsa alta konur; yoksa video sessiz kalır.
const hasMusic = getStaticFiles().some((s) => s.name === 'muzik.mp3');

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#04091A', overflow: 'hidden'}}>
      {f < 126 ? <NightBg f={f} /> : null}
      {f < T.s2 + 30 ? <S1Hook f={f} /> : null}
      {f >= T.s2 && f < T.s3 ? <S2Logo f={f} /> : null}
      {f <= T.s6 ? <PhoneAct f={f} /> : null}
      <S6Why f={f} />
      <PanelWipe f={f} start={644} />
      <S7Outro f={f} />
      {hasMusic ? (
        <Html5Audio
          src={staticFile('muzik.mp3')}
          volume={(fr) => interpolate(fr, [0, 12, DURATION - 45, DURATION - 15], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      ) : null}
    </AbsoluteFill>
  );
};
