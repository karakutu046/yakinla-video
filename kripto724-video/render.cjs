// Renders the film with headless Chromium and writes the audio cue sheet.
//   NODE_PATH="$(npm root -g)" node render.cjs [out-dir]
// Environment:
//   WORKERS=4        parallel pages
//   ONLY=0,120,300   only these frames
//   STILLS=1         one sample per frame (no motion blur)
//   AT=1.5,12.2      single stills at these times → build/stills/t_<time>.png
//   BOARD=1          key frames of all scenes on one sheet → out/onizleme_sahneler.jpg (via build/board.png)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HERE = __dirname, ROOT = path.resolve(HERE, '..');   // fonts and logo live in ../kripto724-tasarimlar
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'build', 'frames'));
const WORKERS = +(process.env.WORKERS || 4);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const STILLS = !!process.env.STILLS;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${server.address().port}/kripto724-video/index.html`;
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
  const shot = (page, p) => page.screenshot({ path: p, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  fs.mkdirSync(path.join(HERE, 'build'), { recursive: true });
  const info = await first.evaluate(() => ({ frames: window.FRAMES, fps: window.FPS, dur: window.DUR, w: window.W, h: window.H, tl: window.TL, cues: window.CUES }));
  fs.writeFileSync(path.join(HERE, 'build', 'cues.json'), JSON.stringify(info, null, 1));
  if (process.env.BOARD) {
    await first.evaluate(() => window.renderBoard());
    await shot(first, path.join(HERE, 'build', 'board.png'));
    console.log('board → build/board.png');
  } else if (process.env.AT) {
    const dir = path.join(HERE, 'build', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const t of process.env.AT.split(',').map(Number)) {
      const t0 = Date.now();
      await first.evaluate(t => window.renderAt(t), t);
      await shot(first, path.join(dir, `t_${t.toFixed(2)}.png`));
      console.log(`t=${t.toFixed(2)} ${Date.now() - t0} ms`);
    }
  } else {
    fs.mkdirSync(OUT, { recursive: true });
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
        await shot(page, path.join(OUT, `f_${String(f).padStart(4, '0')}.png`));
        if (++done % 30 === 0) process.stdout.write(`\r${done}/${frames.length} frames · ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
      }
    }));
    console.log(`\n${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${OUT}`);
  }
  await browser.close();
  server.close();
});
