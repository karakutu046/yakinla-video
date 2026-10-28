// Renders the design boards (and optionally single scenes) with headless Chromium.
//   NODE_PATH="$(npm root -g)" node render.cjs            → out/tasarim_1..6.png + .jpg
//   D=3 node render.cjs                                     → only design 3
//   D=3 S=1,4 node render.cjs                               → scenes 1 and 4 of design 3 at 1920×1080 (build/)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');           // repo root, so ../allinvestview-showreel is reachable
const HERE = path.relative(ROOT, __dirname);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.woff2': 'font/woff2' };
const DS = (process.env.D || '1,2,3,4,5,6').split(',');
const SS = process.env.S ? process.env.S.split(',') : null;

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}/${HERE}/index.html`;
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const ctx = await browser.newContext({ viewport: { width: 3240, height: 2760 }, deviceScaleFactor: 1 });
  const out = path.join(__dirname, SS ? 'build' : 'out');
  fs.mkdirSync(out, { recursive: true });
  let failed = false;
  for (const d of DS) {
    for (const s of SS || [null]) {
      const page = await ctx.newPage();
      page.on('pageerror', e => { console.error(`d${d}${s ? ' s' + s : ''}: ${e.message}`); failed = true; });
      page.on('console', m => { if (m.type() === 'error') console.error(`d${d}: ${m.text()}`); });
      await page.goto(base + `?d=${d}` + (s ? `&s=${s}` : ''));
      await page.evaluate(() => window.READY);
      const [w, h] = await page.evaluate(() => window.SIZE);
      const file = path.join(out, s ? `d${d}_s${s}.png` : `tasarim_${d}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: h } });
      if (!s) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-q:v', '3', file.replace('.png', '.jpg')]);
      console.log('→', path.relative(__dirname, file));
      await page.close();
    }
  }
  await browser.close();
  server.close();
  if (failed) process.exitCode = 1;
});
