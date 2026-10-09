// Kareleri headless Chromium ile PNG olarak basar.
//   NODE_PATH="$(npm root -g)" node render.cjs <çıktı-klasörü>
// Sayfa depo kökünden sunulur, çünkü Inter fontları ../yakinla-showreel/fonts'tan gelir.
// Ortam değişkenleri:
//   WORKERS=4          paralel sayfa sayısı
//   ONLY=0,120,290     sadece bu kareler (test için)
//   STILLS=1           hareket bulanıklığı olmadan tek örnek (hızlı önizleme)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.resolve(HERE, '..');
const PAGE = '/' + path.basename(HERE) + '/index.html';
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'build', 'frames'));
const WORKERS = +(process.env.WORKERS || 4);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const STILLS = !!process.env.STILLS;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${server.address().port}${PAGE}`;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const open = async () => {
    const page = await context.newPage();
    page.on('pageerror', e => { console.error('Sayfa hatası:', e.message); process.exitCode = 1; });
    await page.goto(url);
    await page.evaluate(() => window.READY);
    return page;
  };
  const first = await open();
  const info = await first.evaluate(() => ({ frames: window.FRAMES, fps: window.FPS, dur: window.DUR, cues: window.CUES }));
  fs.mkdirSync(path.join(HERE, 'build'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'build', 'cues.json'), JSON.stringify(info, null, 1));
  const frames = ONLY || [...Array(info.frames).keys()];
  const pages = [first];
  for (let i = 1; i < Math.min(WORKERS, frames.length); i++) pages.push(await open());
  const t0 = Date.now();
  let done = 0;
  await Promise.all(pages.map(async (page, k) => {
    for (let i = k; i < frames.length; i += pages.length) {
      const f = frames[i];
      if (STILLS) await page.evaluate(f => window.renderAt(f / window.FPS), f);
      else await page.evaluate(f => window.renderFrame(f), f);
      await page.screenshot({ path: path.join(OUT, `f_${String(f).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      if (++done % 30 === 0) process.stdout.write(`\r${done}/${frames.length} kare · ${((Date.now() - t0) / done).toFixed(0)} ms/kare`);
    }
  }));
  console.log(`\n${frames.length} kare ${((Date.now() - t0) / 1000).toFixed(1)} sn'de basıldı → ${OUT}`);
  await browser.close();
  server.close();
});
