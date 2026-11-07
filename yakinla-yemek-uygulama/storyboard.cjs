// Senaryo görselini (storyboard.html) out/senaryo.png olarak basar.
//   NODE_PATH="$(npm root -g)" node storyboard.cjs
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.ttf': 'font/ttf', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r);
});
srv.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const pg = await b.newPage({ viewport: { width: 2480, height: 3420 } });
  pg.on('pageerror', e => { console.error('Sayfa hatası:', e.message); process.exitCode = 1; });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/storyboard.html`);
  await pg.waitForFunction(() => window.DONE, null, { timeout: 60000 });
  fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
  await pg.locator('#sb').screenshot({ path: path.join(ROOT, 'out', 'senaryo.png') });
  await b.close(); srv.close();
  console.log('out/senaryo.png yazıldı');
});
