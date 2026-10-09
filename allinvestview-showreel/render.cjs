// Renders every frame with headless Chromium to PNG and writes the audio cue sheet.
//   NODE_PATH="$(npm root -g)" node render.cjs <out-dir>
// Environment:
//   WORKERS=4          parallel pages
//   ONLY=0,120,300     only these frames (for testing)
//   STILLS=1           single sample per frame, no motion blur (fast preview)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'build', 'frames'));
const WORKERS = +(process.env.WORKERS || 4);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const STILLS = !!process.env.STILLS;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const open = async () => {
    const page = await context.newPage();
    page.on('pageerror', e => { console.error('Page error:', e.message); process.exitCode = 1; });
    page.on('console', m => { if (m.type() === 'error') console.error('Console:', m.text()); });
    await page.goto(url);
    await page.evaluate(() => window.READY);
    return page;
  };
  const first = await open();
  const info = await first.evaluate(() => ({ frames: window.FRAMES, fps: window.FPS, dur: window.DUR, w: window.W, h: window.H, cues: window.CUES }));
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'cues.json'), JSON.stringify(info, null, 1));
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
      await page.screenshot({ path: path.join(OUT, `f_${String(f).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: info.w, height: info.h } });
      if (++done % 30 === 0) process.stdout.write(`\r${done}/${frames.length} frames · ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
  }));
  console.log(`\n${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${OUT}`);
  await browser.close();
  server.close();
});
