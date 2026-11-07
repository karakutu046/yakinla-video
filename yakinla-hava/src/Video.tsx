import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {STATIC_DEFS} from './draw/defs';
import {drawFrame} from './draw/scenes';
import {H, W} from './lib';
import {ICON_DEFS} from './parts/iconDefs';

const ASSETS = {as: staticFile('badge-appstore.png'), gp: staticFile('badge-googleplay.png')};

// Her kare tek bir SVG dizgisi olarak çizilir (180×320 birim → 1080×1920 px).
export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: '#030c26'}}>
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
        <defs dangerouslySetInnerHTML={{__html: ICON_DEFS + STATIC_DEFS}} />
      </svg>
      <svg viewBox="0 0 180 320" width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} dangerouslySetInnerHTML={{__html: drawFrame(frame, ASSETS)}} />
      <Audio src={staticFile('ses.wav')} />
    </AbsoluteFill>
  );
};
