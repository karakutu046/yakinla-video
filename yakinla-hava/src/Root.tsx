import {Composition} from 'remotion';
import {FPS, H, TM, W} from './lib';
import {Video} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="AfsinHava" component={Video} durationInFrames={TM.total} fps={FPS} width={W} height={H} />
);
