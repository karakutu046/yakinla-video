// Storyboard karelerini PNG'ye basar: NODE_PATH="$(npm root -g)" node render_frames.cjs <çıktı> [ID,ID,...]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'frames'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
server.listen(0, '127.0.0.1', async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  page.on('pageerror', e => { console.error('Sayfa hatası:', e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${server.address().port}/storyboard/sb.html`);
  await page.evaluate(() => window.READY);
  const ids = process.argv[3] ? process.argv[3].split(',') : (await page.evaluate(() => window.FRAME_IDS)).filter(i => !i.includes('TEST'));
  for (const id of ids) {
    await page.evaluate(id => window.drawFrame(id), id);
    await page.screenshot({ path: path.join(OUT, `${id}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  console.log(`${ids.length} kare → ${OUT}`);
  await browser.close(); server.close();
});
