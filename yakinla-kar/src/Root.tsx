import {Composition} from 'remotion';
import {Film} from './Film';
import {DURATION, FPS, H, W} from './lib';

export const RemotionRoot: React.FC = () => (
  <Composition id="YakinlaKar" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
