import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION, FPS, H, W} from './lib';

export const RemotionRoot: React.FC = () => (
  <Composition id="Yakinla30" component={Video} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
