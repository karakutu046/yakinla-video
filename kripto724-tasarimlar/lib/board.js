'use strict';
/* Design board: one sheet per design with all nine scenes of the film.
 *
 *   index.html?d=3        → board for design 3 (3240×2840)
 *   index.html?d=3&s=5    → scene 5 of design 3 at full size (1920×1080)
 *
 * A design file (designs/dN.js) sets window.DESIGN:
 *   { id, name, concept, board: { bg, ink, soft, accent, line, display: {f, w, it}, text: {f, w} },
 *     palette: [[hex, label], ...], fonts: [display, text], motion: [..], music, format,
 *     init?(), scenes: [{ time, title, desc, draw(g) }, ...9] }
 * Each scene's draw(g) paints one 1920×1080 key frame (a pure function, no state). */

const BW = 3240, BH = 2840;
const CELL = { w: 1000, h: 563, gapX: 60, gapY: 54, cap: 150, x0: 60, y0: 490 };

function wrapLines(g, s, o, maxW) {
  const words = s.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const tryS = cur ? cur + ' ' + w : w;
    if (measure(g, tryS, o) > maxW && cur) { lines.push(cur); cur = w; } else cur = tryS;
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderScene(D, k) {
  const c = canvas(W, H), x = c.getContext('2d');
  x.save();
  D.scenes[k].draw(x);
  x.restore();
  return c;
}

function drawBoard(g, D) {
  const B = D.board;
  const T = { f: B.text.f, w: B.text.w || 500, a: 'left' };
  const Dp = { f: B.display.f, w: B.display.w || 800, it: B.display.it, a: 'left' };
  g.fillStyle = B.bg; g.fillRect(0, 0, BW, BH);
  if (B.paper) B.paper(g, BW, BH);
  // header
  text(g, `KRİPTO724  ·  VİDEO TASARIMI  ${String(D.id).padStart(2, '0')} / 06`, 60, 92, { ...T, s: 30, w: 700, c: B.accent, ls: 4 });
  text(g, D.name, 56, 218, { ...Dp, s: 128, c: B.ink, ls: B.display.ls || -2 });
  // concept: up to three lines, shrinking the type until it fits
  let cs = 36, cl;
  do { cl = wrapLines(g, D.concept, { ...T, s: cs }, 1720); cs -= 2; } while (cl.length > 3 && cs > 24);
  cl.slice(0, 3).forEach((l, i) => text(g, l, 62, 286 + i * (cs + 14), { ...T, s: cs + 2, c: B.soft }));
  // right column: palette, type, motion
  const rx = 1880;
  text(g, 'PALET', rx, 92, { ...T, s: 24, w: 700, c: B.soft, ls: 3 });
  D.palette.forEach(([hex, label], i) => {
    const x = rx + i * 266;
    g.fillStyle = hex; rr(g, x, 116, 72, 72, 18); g.fill();
    g.lineWidth = 2; g.strokeStyle = B.line; g.stroke();
    text(g, hex.toUpperCase(), x + 86, 146, { ...T, s: 22, w: 700, c: B.ink });
    text(g, label, x + 86, 176, { ...T, s: 21, c: B.soft });
  });
  text(g, 'TİPOGRAFİ', rx, 256, { ...T, s: 24, w: 700, c: B.soft, ls: 3 });
  text(g, 'Aa', rx, 340, { ...Dp, s: 80, c: B.ink });
  const aw = measure(g, 'Aa', { ...Dp, s: 80 });
  text(g, D.fonts[0], rx + aw + 24, 302, { ...T, s: 25, w: 700, c: B.ink });
  text(g, D.fonts[1], rx + aw + 24, 336, { ...T, s: 25, c: B.soft });
  const mx = rx + 600;
  text(g, 'HAREKET · SES', mx, 256, { ...T, s: 24, w: 700, c: B.soft, ls: 3 });
  D.motion.slice(0, 3).forEach((m, i) => text(g, '— ' + m, mx, 296 + i * 34, { ...T, s: 23, c: B.ink }));
  wrapLines(g, 'Müzik: ' + D.music, { ...T, s: 23 }, BW - 60 - mx).slice(0, 2).forEach((l, i) => text(g, l, mx, 400 + i * 30, { ...T, s: 23, c: B.accent }));
  g.fillStyle = B.line; g.fillRect(60, 452, BW - 120, 2);

  // scene grid
  D.scenes.forEach((sc, k) => {
    const col = k % 3, row = Math.floor(k / 3);
    const x = CELL.x0 + col * (CELL.w + CELL.gapX), y = CELL.y0 + row * (CELL.h + CELL.cap + CELL.gapY);
    const img = renderScene(D, k);
    g.save();
    if (B.frameShadow !== false) { g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10; }
    rr(g, x, y, CELL.w, CELL.h, 16); g.fillStyle = '#000'; g.fill();
    g.restore();
    g.save(); rr(g, x, y, CELL.w, CELL.h, 16); g.clip();
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, x, y, CELL.w, CELL.h);
    g.restore();
    g.lineWidth = 2; g.strokeStyle = B.line; rr(g, x, y, CELL.w, CELL.h, 16); g.stroke();
    // number badge
    g.fillStyle = B.badge || B.accent; rr(g, x + 18, y + 18, 62, 40, 10); g.fill();
    text(g, String(k + 1).padStart(2, '0'), x + 49, y + 47, { f: B.text.f, s: 24, w: 800, c: B.badgeInk || B.bg });
    // caption
    text(g, sc.time, x, y + CELL.h + 50, { ...T, s: 26, w: 700, c: B.accent });
    const tw = measure(g, sc.time, { ...T, s: 26, w: 700 });
    text(g, sc.title, x + tw + 20, y + CELL.h + 50, { ...Dp, s: 34, c: B.ink, ls: 0 });
    wrapLines(g, sc.desc, { ...T, s: 24 }, CELL.w).slice(0, 3).forEach((l, i) =>
      text(g, l, x, y + CELL.h + 92 + i * 32, { ...T, s: 24, c: B.soft }));
  });
  // footer
  text(g, `${D.format}  ·  Görseller kodla çizildi, video bu karelerden canlandırılır  ·  Ekrandaki tüm rakamlar örnek veridir`,
    60, BH - 44, { ...T, s: 24, c: B.soft });
  text(g, 'www.kripto724.com/app', BW - 60, BH - 44, { ...T, a: 'right', s: 26, w: 700, c: B.accent });
}

window.READY = (async () => {
  const qs = new URLSearchParams(location.search);
  const d = qs.get('d') || '1';
  await new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = `designs/d${d}.js`; sc.onload = res; sc.onerror = rej;
    document.head.appendChild(sc);
  });
  const D = window.DESIGN;
  const fams = new Set([D.board.display.f, D.board.text.f, ...(D.extraFonts || []), 'Inter', 'Inter Display', 'Manrope']);
  const loads = [];
  for (const f of fams) for (const w of [400, 500, 600, 700, 800, 900]) {
    loads.push(document.fonts.load(`${w} 40px "${f}"`, 'AaĞğŞşİıÇçÖöÜü₺0123'));
    loads.push(document.fonts.load(`italic ${w} 40px "${f}"`, 'Aa'));
  }
  await Promise.all(loads.map(p => p.catch(() => null)));
  await document.fonts.ready;
  const c = document.getElementById('c');
  if (D.init) D.init();
  if (qs.has('s')) {
    c.width = W; c.height = H;
    c.getContext('2d').drawImage(renderScene(D, +qs.get('s') - 1), 0, 0);
  } else {
    c.width = BW; c.height = BH;
    drawBoard(c.getContext('2d'), D);
  }
  window.SIZE = [c.width, c.height];
  return true;
})();
