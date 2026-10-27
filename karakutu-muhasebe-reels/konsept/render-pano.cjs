// Konsept panosunu PNG/JPG olarak basar.
//   NODE_PATH="$(npm root -g)" node konsept/render-pano.cjs [çıktı.png] [ölçek]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'out', 'konsept-panosu.png'));
const DPR = +(process.argv[3] || 1.5);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1860, height: 1000 }, deviceScaleFactor: DPR });
  page.on('pageerror', e => { console.error('Sayfa hatası:', e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${server.address().port}/konsept/pano.html`);
  await page.waitForSelector('body[data-ready="1"]');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, fullPage: true });
  console.log('→', OUT);
  await browser.close();
  server.close();
});
