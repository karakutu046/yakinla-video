import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(17);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Yazılımsal WebGL'de ilk karede shader derleme ve doku üretimi uzun sürer
Config.setDelayRenderTimeoutInMilliseconds(240000);
// WebGL: yazılımsal ANGLE (SwiftShader) — GPU'suz makinede de aynı sonucu verir
Config.setChromiumOpenGlRenderer('swangle');

// Bu ortamda Chrome indirilemiyor; Playwright'ın Chromium Headless Shell'i kullanılır.
const browser =
  process.env.REMOTION_BROWSER ??
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
Config.setBrowserExecutable(browser);
