// Renders the film with headless Chromium and pipes the frames straight into ffmpeg.
//   NODE_PATH="$(npm root -g)" node render.cjs build/video.mp4
// Every output frame is the average of SUB sub-frames spread over a 180° shutter
// (ffmpeg tmix), which gives true motion blur. The result is a high-quality master
// (x264 CRF 12); build.sh encodes the delivery file from it. Also writes build/cues.json.
// Environment:
//   SUB=4          sub-frames per frame (1 = no motion blur, fast preview)
//   WORKERS=4      parallel pages
//   FROM=0 TO=45   time range in seconds
//   STILLS=dir     instead of a video, write single PNG stills for the times in AT=1.2,8.5,…
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'build', 'video.mp4'));
const SUB = +(process.env.SUB || 4);
const WORKERS = +(process.env.WORKERS || 4);
const SHUTTER = 0.5;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.otf': 'font/otf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
};

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch({
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars', '--disable-checker-imaging'],
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const open = async () => {
    const page = await context.newPage();
    page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
    page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
    await page.goto(url);
    await page.evaluate(() => window.READY);
    const cdp = await context.newCDPSession(page);
    const shot = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
    return { page, shot };
  };
  const first = await open();
  const info = await first.page.evaluate(() => ({ fps: window.FPS, dur: window.DUR, cues: window.CUES }));
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'cues.json'), JSON.stringify(info, null, 1));
  const FPS = info.fps;

  if (process.env.STILLS) {
    const dir = path.resolve(process.env.STILLS);
    fs.mkdirSync(dir, { recursive: true });
    const times = (process.env.AT || '0').split(',').map(Number);
    for (const t of times) {
      await first.page.evaluate(t => window.renderAt(t), t);
      fs.writeFileSync(path.join(dir, `t_${t.toFixed(2).padStart(6, '0')}.png`), await first.shot());
    }
    console.log(`${times.length} stills → ${dir}`);
    await browser.close(); server.close();
    return;
  }

  const from = Math.round(+(process.env.FROM || 0) * FPS), to = Math.round(+(process.env.TO || info.dur) * FPS);
  const N = to - from;
  const weights = Array(SUB).fill(1).join(' ');
  const vf = [
    SUB > 1 ? `tmix=frames=${SUB}:weights='${weights}',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)` : null,
    'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  ].filter(Boolean).join(',');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'png', '-i', '-',
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', process.env.PRESET || 'slow', '-crf', process.env.CRF || '12',
    '-x264-params', 'aq-mode=3', '-profile:v', 'high', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-color_range', 'tv', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise(r => ff.on('close', r));

  const pages = [first];
  for (let i = 1; i < Math.min(WORKERS, N); i++) pages.push(await open());
  const ready = new Map();
  let next = 0, wake = null;
  const t0 = Date.now();
  const writer = (async () => {
    while (next < N) {
      if (!ready.has(next)) { await new Promise(r => (wake = r)); continue; }
      for (const buf of ready.get(next)) if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      ready.delete(next++);
      if (next % 60 === 0) process.stdout.write(`\r${next}/${N} frames · ${((Date.now() - t0) / next).toFixed(0)} ms/frame`);
    }
    ff.stdin.end();
  })();
  await Promise.all(pages.map(async ({ page, shot }, k) => {
    for (let i = k; i < N; i += pages.length) {
      while (i - next > pages.length * 6) await new Promise(r => setTimeout(r, 5));
      const f = from + i, bufs = [];
      for (let s = 0; s < SUB; s++) {
        const t = (f + (SUB > 1 ? SHUTTER * (s + 0.5) / SUB : 0)) / FPS;
        await page.evaluate(t => window.renderAt(t), t);
        bufs.push(await shot());
      }
      ready.set(i, bufs);
      if (wake) { const w = wake; wake = null; w(); }
    }
  }));
  await writer;
  await ffDone;
  console.log(`\n${N} frames (${SUB} sub-frames each) in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${OUT}`);
  await browser.close();
  server.close();
});
