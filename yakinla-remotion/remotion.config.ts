import {Config} from '@remotion/cli/config';

// Kareler PNG olarak üretilir (keskin düz renk alanları), çıktı H.264 / yuv420p.
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Bu ortamda Chrome Headless Shell indirilemiyor; Playwright'ın kurulu kopyası kullanılır.
// Başka bir makinede bu satırı silin ya da REMOTION_BROWSER ile kendi yolunuzu verin.
const browser =
  process.env.REMOTION_BROWSER ??
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
Config.setBrowserExecutable(browser);
