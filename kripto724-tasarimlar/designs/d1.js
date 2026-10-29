'use strict';
/* TASARIM 01 · NEON TERMİNAL
 * A trader's terminal at night: pitch black, neon green / cyan / pink, monospace
 * readouts, scan lines, glitch (RGB-split) headlines, typing cursor, candlesticks
 * and a circuit-board broker network. */

const D1 = { bg: '#04060A', g: '#00FF88', c: '#00E5FF', p: '#FF2E88', a: '#FFB020', ink: '#E6FFF3', dim: '#5E7F74', faint: '#1C2B26' };
const SG = 'Space Grotesk', JB = 'JetBrains Mono';

/* ── helpers ── */
function d1_bg(g, tint = D1.g) {
  g.fillStyle = D1.bg; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(CX, CY, 100, CX, CY, 1200);
  gr.addColorStop(0, hexA(tint, 0.07)); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = hexA(tint, 0.05); g.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
}
function d1_scan(g) {
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1.5);
  const v = g.createRadialGradient(CX, CY, 600, CX, CY, 1150);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function d1_mono(g, s, x, y, size, col, o = {}) { text(g, s, x, y, { f: JB, w: o.w || 400, s: size, a: o.a || 'left', c: col, ls: o.ls || 0 }); }
function d1_neon(g, s, x, y, o, col, blur = 28) {
  g.save(); g.shadowColor = col; g.shadowBlur = blur; text(g, s, x, y, { ...o, c: col }); g.shadowBlur = blur * 0.4; text(g, s, x, y, { ...o, c: col }); g.restore();
}
// RGB-split glitch with a couple of displaced slices
function d1_glitch(g, s, x, y, o, col, amt = 8, seed = 1) {
  g.save(); g.globalCompositeOperation = 'lighter';
  text(g, s, x - amt, y, { ...o, c: hexA(D1.c, 0.85) });
  text(g, s, x + amt, y + 2, { ...o, c: hexA(D1.p, 0.85) });
  g.restore();
  d1_neon(g, s, x, y, o, col, 20);
  const r = mulberry32(seed);
  for (let k = 0; k < 3; k++) {
    const sy = y - o.s * 0.8 + r() * o.s * 0.85, sh = 6 + r() * 14, dx = (r() - 0.5) * amt * 6;
    g.save(); g.beginPath(); g.rect(0, sy, W, sh); g.clip();
    g.fillStyle = D1.bg; g.fillRect(0, sy, W, sh);
    text(g, s, x + dx, y, { ...o, c: k % 2 ? D1.c : col });
    g.restore();
  }
}
function d1_win(g, x, y, w, h, title, col = D1.g, o = {}) {
  g.save();
  g.fillStyle = o.fill || 'rgba(4,10,8,0.92)'; g.fillRect(x, y, w, h);
  g.strokeStyle = hexA(col, o.a || 0.6); g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = hexA(col, 0.14); g.fillRect(x, y, w, 38);
  g.fillStyle = col; g.fillRect(x + 14, y + 13, 12, 12);
  d1_mono(g, title, x + 38, y + 26, 18, col, { w: 700 });
  d1_mono(g, '[ — □ × ]', x + w - 14, y + 26, 16, hexA(col, 0.7), { a: 'right' });
  g.restore();
}
function d1_candles(g, x, y, w, h, n, seed, drift = 0.004) {
  const r = mulberry32(seed); let v = 0.5; const cs = [];
  for (let i = 0; i < n; i++) { const o = v; v = clamp(v + drift + (r() - 0.5) * 0.09, 0.08, 0.92); cs.push([o, v, Math.max(o, v) + r() * 0.04, Math.min(o, v) - r() * 0.04]); }
  const bw = w / n;
  cs.forEach(([o, c, hi, lo], i) => {
    const up = c >= o, col = up ? D1.g : D1.p, cx = x + i * bw + bw / 2;
    g.fillStyle = col; g.fillRect(cx - 1, y + h - hi * h, 2, (hi - lo) * h);
    g.fillRect(cx - bw * 0.3, y + h - Math.max(o, c) * h, bw * 0.6, Math.max(2, Math.abs(c - o) * h));
  });
}
function d1_line(g, pts, col, lw = 4, glowA = 0.9) {
  g.save(); g.shadowColor = col; g.shadowBlur = 18 * glowA; g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round';
  g.beginPath(); smoothPath(g, pts); g.stroke(); g.restore();
}
function d1_arrow(g, x, y, s, col, lw = 4) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x + s * 0.4, y - s * 0.6); g.lineTo(x + s, y); g.lineTo(x + s * 0.4, y + s * 0.6); g.stroke(); g.restore();
}
function d1_caption(g, s, y = 1000) {
  const o = { f: JB, w: 700, s: 40 };
  const w = measure(g, '> ' + s, o) + 60;
  g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(CX - w / 2, y - 52, w, 74);
  g.strokeStyle = hexA(D1.g, 0.6); g.lineWidth = 2; g.strokeRect(CX - w / 2, y - 52, w, 74);
  d1_mono(g, '> ' + s, CX - w / 2 + 30, y - 2, 40, D1.g, { w: 700 });
  g.fillStyle = D1.g; g.fillRect(CX + w / 2 - 26, y - 36, 18, 40);
}

const D1_MC = { paths: null };
function d1_init() {
  const r = mulberry32(724), n = 420, steps = 90, out = [];
  for (let i = 0; i < n; i++) { const p = [1]; for (let k = 1; k <= steps; k++) p.push(p[k - 1] * Math.exp(0.0045 + 0.045 * gauss(r))); out.push(p); }
  D1_MC.paths = out;
  const pct = q => Array.from({ length: steps + 1 }, (_, k) => { const col = out.map(p => p[k]).sort((a, b) => a - b); return col[Math.floor(q * (n - 1))]; });
  D1_MC.p5 = pct(0.05); D1_MC.p50 = pct(0.5); D1_MC.p95 = pct(0.95);
}

/* ── scenes ── */
const D1_SCENES = [
  {
    time: '0–4 sn', title: 'Kanca: Dağınık terminal',
    desc: 'Pencereler hızla açılır, kırmızı hata satırları akar. Başlık glitch ile çakılır: "HİSSE BURADA. KRİPTO ORADA."',
    draw(g) {
      d1_bg(g, D1.p);
      const wins = [
        [80, 70, 560, 330, 'broker_app.exe', D1.g], [1300, 60, 540, 300, 'kripto_borsa', D1.a], [60, 640, 600, 360, 'portfoy_SON_v7.xlsx', D1.p],
        [1280, 660, 580, 340, 'emeklilik_portali', D1.c], [700, 40, 520, 230, 'notlar.txt', D1.dim], [720, 820, 520, 220, 'banka', D1.g],
      ];
      wins.forEach(([x, y, w, h, t, col], i) => {
        d1_win(g, x, y, w, h, t, col, { a: 0.45 });
        const r = mulberry32(i + 3);
        for (let k = 0; k < Math.floor((h - 60) / 30); k++) {
          const err = r() < 0.22;
          const s = err ? ['HATA: kur bulunamadı', '#REF!  #REF!  #N/A', 'oturum zaman aşımı', 'veri 94 gün önce'][k % 4]
            : `${['AAPL', 'BTC ', 'VOO ', 'ETH ', 'BND ', 'KO  '][(k + i) % 6]}  ${(r() * 9000 + 100).toFixed(2).replace('.', ',')}  ${r() > 0.5 ? '+' : '−'}%${(r() * 4).toFixed(2).replace('.', ',')}`;
          d1_mono(g, s, x + 20, y + 70 + k * 30, 19, err ? D1.p : hexA(D1.ink, 0.55));
        }
        if (i < 4) d1_candles(g, x + w - 200, y + h - 120, 180, 100, 14, i + 9, i % 2 ? -0.01 : 0.004);
      });
      g.fillStyle = 'rgba(4,6,10,0.72)'; g.fillRect(0, 380, W, 330);
      d1_glitch(g, 'HİSSE BURADA.', CX, 520, { f: SG, w: 700, s: 150, ls: -3 }, D1.ink, 9, 3);
      d1_glitch(g, 'KRİPTO ORADA.', CX, 670, { f: SG, w: 700, s: 150, ls: -3 }, D1.a, 9, 5);
      d1_scan(g);
    },
  },
  {
    time: '4–8 sn', title: 'Vaat: Tek komut',
    desc: 'Ekran temizlenir, komut satırı yazılır. "Tüm yatırımların, tek ekranda." neon parlamayla yanar; Kripto724 belirir.',
    draw(g) {
      d1_bg(g);
      d1_mono(g, 'sen@kripto724:~$', 120, 150, 34, D1.c, { w: 700 });
      const px = 120 + measure(g, 'sen@kripto724:~$', { f: JB, w: 700, s: 34 });
      d1_mono(g, ' portfoy --hepsi --tek-ekran', px, 150, 34, D1.ink);
      g.fillStyle = D1.g; g.fillRect(px + measure(g, ' portfoy --hepsi --tek-ekran', { f: JB, s: 34 }) + 8, 118, 18, 40);
      d1_mono(g, '[OK] 8 varlık sınıfı  ·  60+ piyasa  ·  50+ para birimi  ·  25+ aracı kurum', 120, 205, 24, D1.dim);
      text(g, 'Tüm yatırımların,', CX, 500, { f: SG, w: 700, s: 150, ls: -4, c: D1.ink });
      d1_neon(g, 'tek ekranda.', CX, 660, { f: SG, w: 700, s: 170, ls: -5 }, D1.g, 40);
      g.save(); g.shadowColor = D1.c; g.shadowBlur = 24;
      wordmark(g, CX, 860, 96);
      g.restore();
      g.strokeStyle = hexA(D1.g, 0.4); g.lineWidth = 2; g.setLineDash([10, 10]);
      g.strokeRect(CX - 520, 770, 1040, 130); g.setLineDash([]);
      d1_scan(g);
    },
  },
  {
    time: '8–13 sn', title: 'Panel: Portföy terminali',
    desc: 'Pano satır satır derlenir: değer sayacı döner, neon grafik S&P 500 ile yarışır, dağılım blok çubuklarla dolar.',
    draw(g) {
      d1_bg(g);
      g.fillStyle = hexA(D1.g, 0.12); g.fillRect(0, 0, W, 54);
      d1_mono(g, 'KRİPTO724 // PORTFÖY      BAZ: TRY      SON SENKRON 03:00      DURUM: GÜNCEL', 40, 36, 22, D1.g, { w: 700 });
      d1_win(g, 40, 80, 1180, 600, 'toplam_deger', D1.g);
      d1_mono(g, 'TOPLAM PORTFÖY DEĞERİ', 80, 170, 22, D1.dim, { w: 700, ls: 2 });
      d1_neon(g, '₺9.482.150,36', 76, 290, { f: SG, w: 700, s: 112, a: 'left', ls: -3 }, D1.g, 26);
      text(g, '+₺64.218,40  (+%0,68)  bugün', 82, 345, { f: SG, w: 500, s: 32, a: 'left', c: D1.g });
      const geo = { x0: 80, x1: 1180, y0: 400, y1: 650 };
      const map = (s, f) => s.map((v, i) => [lerp(geo.x0, geo.x1, i / (s.length - 1)), geo.y1 - (v / s[s.length - 1] * f - 0.7) / 0.75 * (geo.y1 - geo.y0)]);
      g.strokeStyle = hexA(D1.g, 0.08); for (let k = 0; k < 5; k++) { const y = lerp(geo.y0, geo.y1, k / 4); g.beginPath(); g.moveTo(geo.x0, y); g.lineTo(geo.x1, y); g.stroke(); }
      const you = map(walk(901, 120, 0.003, 0.012), 1.38), spy = map(walk(333, 120, 0.0022, 0.009), 1.24);
      const gr = g.createLinearGradient(0, geo.y0, 0, geo.y1); gr.addColorStop(0, hexA(D1.g, 0.28)); gr.addColorStop(1, hexA(D1.g, 0));
      g.beginPath(); smoothPath(g, you); g.lineTo(geo.x1, geo.y1); g.lineTo(geo.x0, geo.y1); g.closePath(); g.fillStyle = gr; g.fill();
      g.setLineDash([8, 8]); d1_line(g, spy, hexA(D1.c, 0.8), 2.5, 0.3); g.setLineDash([]);
      d1_line(g, you, D1.g, 4);
      d1_mono(g, '— PORTFÖY', 860, 170, 20, D1.g, { w: 700 }); d1_mono(g, '- - S&P 500 (SPY)', 860, 200, 20, D1.c, { w: 700 });
      // allocation blocks
      d1_win(g, 1250, 80, 630, 600, 'dagilim --varlik', D1.c);
      [['HİSSE', 44, D1.g], ['ETF', 22, D1.c], ['KRİPTO', 12, D1.a], ['TAHVİL', 10, '#8F7CFF'], ['GAYRİMENKUL', 7, D1.p], ['NAKİT', 5, D1.ink]].forEach(([l, v, col], i) => {
        const y = 170 + i * 80;
        d1_mono(g, l, 1290, y, 22, D1.ink, { w: 700 });
        d1_mono(g, '%' + v, 1840, y, 22, col, { w: 700, a: 'right' });
        for (let b = 0; b < 20; b++) { g.fillStyle = b < v / 2.4 ? col : hexA(col, 0.12); g.fillRect(1290 + b * 27, y + 16, 22, 22); }
      });
      // holdings
      d1_win(g, 40, 710, 1840, 210, 'varliklar --sirala deger', D1.g);
      [['AAPL', 'Apple Inc.', 'HİSSE', '₺1.402.180', '+%1,24', D1.g], ['BTC', 'Bitcoin', 'KRİPTO', '₺778.415', '−%2,10', D1.p], ['VOO', 'Vanguard S&P 500', 'ETF', '₺2.058.904', '+%0,58', D1.g]].forEach((r, i) => {
        const y = 790 + i * 40;
        d1_mono(g, r[0], 80, y, 22, D1.ink, { w: 800 }); d1_mono(g, r[1], 240, y, 22, D1.dim); d1_mono(g, `[${r[2]}]`, 700, y, 20, D1.c);
        text(g, r[3], 1300, y, { f: SG, w: 500, s: 24, a: 'right', c: D1.ink }); d1_mono(g, r[4], 1480, y, 22, r[5], { w: 700, a: 'right' });
        d1_candles(g, 1560, y - 26, 280, 30, 18, 40 + i, r[5] === D1.p ? -0.02 : 0.01);
      });
      d1_caption(g, 'portföyünün tamamı, bir bakışta', 1030);
      d1_scan(g);
    },
  },
  {
    time: '13–17 sn', title: 'Her varlık, her piyasa',
    desc: 'Varlık etiketleri köşeli parantezlerle tek tek basılır; neon nokta küre döner, piyasalar yanar, sayaçlar 60+ ve 50+ olur.',
    draw(g) {
      d1_bg(g, D1.c);
      d1_glitch(g, 'Her varlık.', 120, 250, { f: SG, w: 700, s: 120, a: 'left', ls: -3 }, D1.ink, 6, 7);
      d1_glitch(g, 'Her piyasa.', 120, 380, { f: SG, w: 700, s: 120, a: 'left', ls: -3 }, D1.c, 6, 8);
      ['HİSSE', 'ETF', 'TAHVİL', 'OPSİYON', 'KRİPTO', 'GAYRİMENKUL', 'FON', 'NAKİT'].forEach((s, i) => {
        const x = 120 + (i % 2) * 380, y = 470 + Math.floor(i / 2) * 78, col = [D1.g, D1.c, '#8F7CFF', D1.p, D1.a, D1.g, D1.c, D1.ink][i];
        g.strokeStyle = hexA(col, 0.7); g.lineWidth = 2; g.strokeRect(x, y, 350, 58);
        g.fillStyle = hexA(col, 0.1); g.fillRect(x, y, 350, 58);
        d1_mono(g, `[ ${s} ]`, x + 20, y + 39, 26, col, { w: 700 });
      });
      text(g, '60+', 120, 920, { f: SG, w: 700, s: 120, a: 'left', c: D1.g });
      d1_mono(g, 'PİYASA', 124, 968, 24, D1.dim, { w: 700, ls: 3 });
      text(g, '50+', 470, 920, { f: SG, w: 700, s: 120, a: 'left', c: D1.c });
      d1_mono(g, 'PARA BİRİMİ', 474, 968, 24, D1.dim, { w: 700, ls: 3 });
      // neon dot globe
      const gx = 1360, gy = 560, R = 400, lc = -20 * Math.PI / 180, pc = 0.35;
      g.strokeStyle = hexA(D1.c, 0.25); g.lineWidth = 1.5;
      for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(gx, gy + k * R * 0.32 * Math.cos(pc), R * Math.sqrt(1 - (k * 0.32) ** 2), R * 0.12 * Math.sqrt(1 - (k * 0.32) ** 2), 0, 0, TAU); g.stroke(); }
      g.beginPath(); g.arc(gx, gy, R, 0, TAU); g.stroke();
      const sp = Math.sin(pc), cp = Math.cos(pc);
      const front = new Path2D(), back = new Path2D();
      for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
        const la = GLOBE_DOTS[i] * Math.PI / 180, lo = GLOBE_DOTS[i + 1] * Math.PI / 180, d = lo - lc, cl = Math.cos(la);
        const z = sp * Math.sin(la) + cp * cl * Math.cos(d);
        const x = gx + R * cl * Math.sin(d), y = gy - R * (cp * Math.sin(la) - sp * cl * Math.cos(d));
        (z > 0 ? front : back).rect(x - 1.6, y - 1.6, 3.2, 3.2);
      }
      g.fillStyle = hexA(D1.c, 0.12); g.fill(back);
      g.save(); g.shadowColor = D1.g; g.shadowBlur = 6; g.fillStyle = hexA(D1.g, 0.85); g.fill(front); g.restore();
      const proj = (la, lo) => { la *= Math.PI / 180; lo *= Math.PI / 180; const d = lo - lc, cl = Math.cos(la); return [gx + R * cl * Math.sin(d), gy - R * (cp * Math.sin(la) - sp * cl * Math.cos(d))]; };
      const cities = [['NEW YORK', 40.7, -74], ['LONDRA', 51.5, -0.1], ['FRANKFURT', 50.1, 8.7], ['İSTANBUL', 41.0, 29.0], ['DUBAİ', 25.2, 55.3], ['SÃO PAULO', -23.5, -46.6]];
      const P = cities.map(c => proj(c[1], c[2]));
      g.save(); g.shadowColor = D1.p; g.shadowBlur = 14; g.strokeStyle = D1.p; g.lineWidth = 3;
      [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 1]].forEach(([a, b]) => {
        const [x0, y0] = P[a], [x1, y1] = P[b], mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.35;
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
      });
      g.restore();
      P.forEach(([x, y], i) => {
        g.fillStyle = '#fff'; g.fillRect(x - 6, y - 6, 12, 12);
        g.strokeStyle = D1.g; g.lineWidth = 2; g.strokeRect(x - 13, y - 13, 26, 26);
        const [ox, oy, al] = [[18, -14, 'left'], [-18, -16, 'right'], [18, -16, 'left'], [6, 36, 'left'], [18, 6, 'left'], [18, 6, 'left']][i];
        d1_mono(g, cities[i][0], x + ox, y + oy, 20, D1.ink, { w: 700, a: al });
      });
      d1_scan(g);
    },
  },
  {
    time: '17–21 sn', title: 'Otomatik senkron',
    desc: 'Devre kartı gibi bir ağ: aracı kurum kutuları merkeze bağlanır, veri paketleri hatlardan akar, sağda senkron günlüğü yazılır.',
    draw(g) {
      d1_bg(g);
      text(g, '25+ aracı kurum.', 120, 175, { f: SG, w: 700, s: 92, a: 'left', ls: -2, c: D1.ink });
      d1_neon(g, 'Otomatik senkron.', 120, 280, { f: SG, w: 700, s: 92, a: 'left', ls: -2 }, D1.g, 24);
      const hub = [720, 660];
      const brokers = ['Interactive Brokers', 'Charles Schwab', 'Fidelity', 'Coinbase', 'Trading 212', 'DEGIRO', 'eToro', 'Robinhood'];
      const pos = [[160, 420], [160, 560], [160, 700], [160, 840], [1000, 420], [1000, 560], [1000, 700], [1000, 840]];
      brokers.forEach((b, i) => {
        const [x, y] = pos[i], left = i < 4, bx = left ? x : x + 30;
        const ex = left ? bx + 300 : bx;
        g.strokeStyle = hexA(i % 3 ? D1.g : D1.c, 0.55); g.lineWidth = 3;
        g.beginPath(); g.moveTo(ex, y); const mx = left ? 520 : 920; g.lineTo(mx, y); g.lineTo(mx, hub[1] + (y - 630) * 0.12); g.lineTo(left ? hub[0] - 150 : hub[0] + 150, hub[1] + (y - 630) * 0.12); g.stroke();
        // packet
        const px = lerp(ex, mx, 0.6 + (i % 3) * 0.12);
        g.save(); g.shadowColor = D1.g; g.shadowBlur = 16; g.fillStyle = '#fff'; g.fillRect(px - 7, y - 7, 14, 14); g.restore();
        g.fillStyle = 'rgba(4,12,9,0.95)'; g.fillRect(bx, y - 34, 300, 68);
        g.strokeStyle = hexA(D1.g, 0.7); g.lineWidth = 2; g.strokeRect(bx, y - 34, 300, 68);
        d1_mono(g, b, bx + 150, y + 8, 20, D1.ink, { w: 700, a: 'center' });
      });
      g.save(); g.shadowColor = D1.g; g.shadowBlur = 40;
      g.fillStyle = '#031A10'; g.fillRect(hub[0] - 150, hub[1] - 90, 300, 180);
      g.strokeStyle = D1.g; g.lineWidth = 4; g.strokeRect(hub[0] - 150, hub[1] - 90, 300, 180); g.restore();
      drawMark(g, hub[0], hub[1] - 20, 46, { th: 0.22, col: D1.c, col2: D1.g, discFill: '#031A10' });
      d1_mono(g, 'KRİPTO724', hub[0], hub[1] + 62, 22, D1.g, { w: 800, a: 'center', ls: 3 });
      d1_win(g, 1380, 360, 500, 560, 'senkron.log', D1.g);
      ['[03:00:01] başladı · salt-okunur', '[03:00:03] Interactive Brokers  OK', '[03:00:04]   12 işlem eklendi', '[03:00:06] Coinbase           OK', '[03:00:06]   4 işlem eklendi', '[03:00:08] DEGIRO             OK', '[03:00:09] Trading 212        OK', '[03:00:11] eToro              OK', '', '[03:00:12] TÜM HESAPLAR GÜNCEL'].forEach((s, i) =>
        d1_mono(g, s, 1404, 430 + i * 44, 19, i === 9 ? D1.g : s.includes('OK') ? D1.ink : D1.dim, { w: i === 9 ? 800 : 400 }));
      g.fillStyle = D1.g; g.fillRect(1404, 878, 14, 26);
      d1_mono(g, 'salt-okunur bağlantı  ·  her gece güncellenir  ·  CSV ve yapay zekâ ile içe aktarma', 120, 1010, 24, D1.dim);
      d1_scan(g);
    },
  },
  {
    time: '21–25 sn', title: 'Temettü takibi',
    desc: 'Takvim ızgarasında ödeme günleri yeşil yanar, aylık çubuklar yükselir, alt bantta gelen temettüler kayan yazıyla akar.',
    draw(g) {
      d1_bg(g, D1.a);
      text(g, 'Hiçbir temettüyü', 120, 190, { f: SG, w: 700, s: 86, a: 'left', ls: -3, c: D1.ink });
      d1_neon(g, 'kaçırma.', 120, 290, { f: SG, w: 700, s: 86, a: 'left', ls: -3 }, D1.a, 26);
      d1_mono(g, 'TAKVİM · ÖDEMELER · TAHMİN', 124, 360, 22, D1.dim, { w: 700 });
      // calendar
      d1_win(g, 120, 420, 740, 470, 'takvim --2025', D1.a);
      const r = mulberry32(21);
      ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].forEach((d, i) => d1_mono(g, d, 168 + i * 98, 490, 20, D1.dim, { w: 700 }));
      for (let k = 0; k < 31; k++) {
        const x = 150 + (k % 7) * 98, y = 512 + Math.floor(k / 7) * 72, pay = [3, 9, 16, 22, 24, 30].includes(k);
        g.fillStyle = pay ? hexA(D1.a, 0.25) : 'rgba(255,255,255,0.03)'; g.fillRect(x, y, 86, 60);
        if (pay) { g.strokeStyle = D1.a; g.lineWidth = 2; g.strokeRect(x, y, 86, 60); }
        d1_mono(g, String(k + 1), x + 10, y + 26, 18, pay ? D1.a : D1.dim, { w: pay ? 800 : 400 });
        if (pay) d1_mono(g, ['VOO', 'KO', 'O', 'AAPL', 'MSFT', 'JNJ'][[3, 9, 16, 22, 24, 30].indexOf(k)], x + 10, y + 50, 16, D1.ink, { w: 700 });
      }
      // bars
      d1_win(g, 960, 120, 920, 770, 'gelir --aylık --tahmin', D1.g);
      text(g, 'YILLIK TAHMİNİ GELİR', 1000, 210, { f: JB, w: 700, s: 22, a: 'left', c: D1.dim });
      d1_neon(g, '₺218.400', 996, 300, { f: SG, w: 700, s: 92, a: 'left' }, D1.g, 20);
      text(g, 'MALİYETE GÖRE GETİRİ', 1520, 210, { f: JB, w: 700, s: 22, a: 'left', c: D1.dim });
      text(g, '%4,1', 1520, 300, { f: SG, w: 700, s: 92, a: 'left', c: D1.a });
      const vals = [42, 24, 91, 45, 26, 95, 47, 28, 100, 51, 30, 106];
      vals.forEach((v, i) => {
        const x = 1004 + i * 71, h = v * 4.2, paid = i < 9, col = paid ? D1.g : D1.c;
        if (paid) { g.save(); g.shadowColor = col; g.shadowBlur = 14; g.fillStyle = col; g.fillRect(x, 820 - h, 48, h); g.restore(); }
        else { g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([6, 5]); g.strokeRect(x, 820 - h, 48, h); g.setLineDash([]); g.fillStyle = hexA(col, 0.12); g.fillRect(x, 820 - h, 48, h); }
        d1_mono(g, 'OŞMNMHTAEEKA'[i], x + 24, 860, 20, paid ? D1.dim : D1.c, { a: 'center', w: 700 });
      });
      // ticker
      g.fillStyle = hexA(D1.g, 0.12); g.fillRect(0, 940, W, 70);
      text(g, 'TEMETTÜ ALINDI   VOO +₺3.124,10   ·   KO +₺1.240,80   ·   O +₺1.368,25   ·   AAPL +₺598,40   ·   MSFT +₺1.010,00', 40, 986, { f: SG, w: 700, s: 28, a: 'left', c: D1.g });
      d1_scan(g);
    },
  },
  {
    time: '25–31 sn', title: 'Risk laboratuvarı',
    desc: '1.000 Monte Carlo yolu neon bir yelpaze gibi açılır, %5–%95 bandı kilitlenir; sağdaki pencerede risk ölçüleri satır satır yazılır.',
    draw(g) {
      d1_bg(g, D1.c);
      text(g, '1.000 olası gelecek.', 120, 170, { f: SG, w: 700, s: 92, a: 'left', ls: -2, c: D1.ink });
      d1_mono(g, 'monte-carlo --senaryo 1000 --ufuk 10y --aralik %5-%95', 124, 230, 24, D1.c, { w: 700 });
      const x0 = 140, x1 = 1300, yB = 980, yT = 300;
      const my = v => yB - Math.log(v / 0.35) / Math.log(4.2 / 0.35) * (yB - yT);
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.2;
      D1_MC.paths.forEach((p, i) => {
        g.strokeStyle = rgb(ramp([D1.p, D1.c, D1.g], p[p.length - 1] / 3.2), 0.07);
        g.beginPath(); p.forEach((v, k) => { const x = lerp(x0, x1, k / (p.length - 1)); k ? g.lineTo(x, my(v)) : g.moveTo(x, my(v)); }); g.stroke();
      });
      g.restore();
      [[D1_MC.p95, D1.g, '%95'], [D1_MC.p50, '#FFFFFF', 'MEDYAN'], [D1_MC.p5, D1.p, '%5']].forEach(([s, col, l]) => {
        const pts = s.map((v, k) => [lerp(x0, x1, k / (s.length - 1)), my(v)]);
        d1_line(g, pts, col, 3.5);
        const e = pts[pts.length - 1];
        g.fillStyle = col; g.fillRect(e[0] - 7, e[1] - 7, 14, 14);
        d1_mono(g, l, e[0] + 20, e[1] + 8, 22, col, { w: 800 });
      });
      ['BUGÜN', '2Y', '4Y', '6Y', '8Y', '10Y'].forEach((s, k) => d1_mono(g, s, lerp(x0, x1, k / 5), 1030, 20, D1.dim, { a: 'center' }));
      d1_win(g, 1460, 300, 420, 620, 'risk --ozet', D1.c);
      [['SHARPE', '1,24', D1.g], ['BETA', '0,92', D1.ink], ['OYNAKLIK', '%14,8', D1.ink], ['VaR (%95)', '−%2,1', D1.p], ['MAKS. DÜŞÜŞ', '−%18,6', D1.p], ['KRİZ TESTİ', '4 senaryo', D1.a]].forEach(([l, v, col], i) => {
        const y = 390 + i * 86;
        d1_mono(g, l, 1490, y, 20, D1.dim, { w: 700 });
        text(g, v, 1850, y + 32, { f: SG, w: 700, s: 40, a: 'right', c: col });
        g.fillStyle = hexA(D1.c, 0.15); g.fillRect(1490, y + 48, 360, 1.5);
      });
      d1_scan(g);
    },
  },
  {
    time: '31–35 sn', title: 'Hızlı özellikler',
    desc: 'Ekran dört terminale bölünür, her vuruşta biri parlar: endeksle kıyasla, vergi (FIFO/LIFO), yapay zekâ ile içe aktar, kriz testi.',
    draw(g) {
      d1_bg(g);
      const panes = [[30, 30, '01 KIYASLA', D1.g], [975, 30, '02 VERGİ RAPORU', D1.a], [30, 560, '03 YZ İÇE AKTAR', D1.c], [975, 560, '04 KRİZ TESTİ', D1.p]];
      panes.forEach(([x, y, t, col], i) => {
        d1_win(g, x, y, 915, 490, t, col, { a: i === 2 ? 1 : 0.5 });
        if (i === 0) {
          const you = walk(71, 60, 0.006, 0.016).map((v, k, a) => [x + 50 + k / 59 * 600, y + 430 - (v / a[59] * 1.43 - 0.8) / 0.7 * 300]);
          const spy = walk(72, 60, 0.004, 0.012).map((v, k, a) => [x + 50 + k / 59 * 600, y + 430 - (v / a[59] * 1.32 - 0.8) / 0.7 * 300]);
          g.setLineDash([8, 7]); d1_line(g, spy, D1.c, 2.5, 0.3); g.setLineDash([]); d1_line(g, you, D1.g, 4);
          text(g, '+%42,6', x + 860, y + 200, { f: SG, w: 700, s: 56, a: 'right', c: D1.g });
          d1_mono(g, 'PORTFÖY', x + 860, y + 236, 20, D1.dim, { a: 'right', w: 700 });
          text(g, '+%31,9', x + 860, y + 330, { f: SG, w: 700, s: 44, a: 'right', c: D1.c });
          d1_mono(g, 'S&P 500', x + 860, y + 362, 20, D1.dim, { a: 'right', w: 700 });
        } else if (i === 1) {
          ['FIFO', 'LIFO', 'ORT. MALİYET'].forEach((s, k) => {
            const bx = x + 50 + k * 270, on = k === 1;
            g.fillStyle = on ? D1.a : 'transparent'; g.fillRect(bx, y + 90, 250, 60);
            g.strokeStyle = D1.a; g.lineWidth = 2; g.strokeRect(bx, y + 90, 250, 60);
            d1_mono(g, s, bx + 125, y + 130, 24, on ? D1.bg : D1.a, { a: 'center', w: 800 });
          });
          d1_mono(g, 'GERÇEKLEŞEN KÂR', x + 50, y + 220, 22, D1.dim, { w: 700 });
          text(g, '₺127.340', x + 50, y + 320, { f: SG, w: 700, s: 92, a: 'left', c: D1.ink });
          d1_mono(g, '[OK] vergi_raporu_2025.pdf  ·  her planda', x + 50, y + 420, 22, D1.a, { w: 700 });
        } else if (i === 2) {
          g.strokeStyle = D1.c; g.lineWidth = 3; g.strokeRect(x + 60, y + 100, 150, 190);
          d1_mono(g, '.CSV', x + 135, y + 210, 30, D1.c, { a: 'center', w: 800 });
          d1_arrow(g, x + 280, y + 195, 40, D1.c, 5);
          sparkle(g, x + 280, y + 120, 20, D1.c); sparkle(g, x + 320, y + 270, 12, D1.g);
          [['AL', 'AAPL', '10 adet'], ['TMT', 'VOO', '+₺3.124'], ['SAT', 'ETH', '1,5 adet'], ['AL', 'BND', '25 adet']].forEach(([a, s, d], k) => {
            const ry = y + 120 + k * 72, col = a === 'SAT' ? D1.p : a === 'TMT' ? D1.a : D1.g;
            g.strokeStyle = hexA(col, 0.6); g.strokeRect(x + 370, ry - 30, 500, 54);
            d1_mono(g, a, x + 390, ry + 6, 22, col, { w: 800 }); d1_mono(g, s, x + 480, ry + 6, 22, D1.ink, { w: 700 });
            text(g, d, x + 850, ry + 7, { f: SG, w: 500, s: 22, a: 'right', c: D1.ink });
          });
        } else {
          const pts = [];
          for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([x + 50 + u * 820, y + 170 + 230 * Math.exp(-Math.pow((u - 0.38) / 0.1, 2)) * (u < 0.38 ? 1 : 0.9) - 50 * u]); }
          g.fillStyle = hexA(D1.p, 0.18); g.beginPath(); g.moveTo(pts[14][0], pts[14][1]); for (let k = 14; k <= 40; k++) g.lineTo(pts[k][0], pts[k][1]); g.lineTo(pts[40][0], pts[14][1]); g.closePath(); g.fill();
          d1_line(g, pts, D1.ink, 3.5, 0.2);
          g.setLineDash([6, 6]); g.strokeStyle = hexA(D1.ink, 0.4); g.lineWidth = 2; g.beginPath(); g.moveTo(pts[14][0], pts[14][1]); g.lineTo(x + 870, pts[14][1]); g.stroke(); g.setLineDash([]);
          d1_mono(g, 'MAKS. DÜŞÜŞ −%18,6', x + 380, y + 450, 26, D1.p, { w: 800 });
        }
      });
      d1_scan(g);
    },
  },
  {
    time: '35–40 sn', title: 'Kapanış',
    desc: 'Tüm pencereler tek noktaya çöker; Kripto724 neonla yanar, komut satırına "ücretsiz başla" yazılır, adres imleçle tamamlanır.',
    draw(g) {
      d1_bg(g);
      addGlow(g, D1.g, CX, 420, 700, 0.18);
      drawMark(g, CX, 260, 105, { glow: 1, col: D1.c, col2: D1.g, discFill: '#06120E' });
      g.save(); g.shadowColor = D1.c; g.shadowBlur = 30; wordmark(g, CX, 520, 150); g.restore();
      text(g, 'Tüm yatırımların, tek ekranda.', CX, 600, { f: SG, w: 500, s: 46, c: D1.ink });
      g.fillStyle = D1.g; g.fillRect(CX - 420, 660, 840, 104);
      d1_mono(g, '> ücretsiz başla — kredi kartı gerekmez', CX, 725, 34, D1.bg, { a: 'center', w: 800 });
      d1_neon(g, 'kripto724.com', CX - 22, 880, { f: JB, w: 800, s: 64 }, D1.g, 24);
      g.fillStyle = D1.g; g.fillRect(CX + measure(g, 'kripto724.com', { f: JB, w: 800, s: 64 }) / 2 - 10, 832, 26, 60);
      d1_mono(g, 'Örnek veriler gösterilmektedir. Yatırım tavsiyesi değildir.', CX, 1035, 22, D1.dim, { a: 'center' });
      d1_scan(g);
    },
  },
];

window.DESIGN = {
  id: 1, name: 'Neon Terminal',
  concept: 'Gece borsasında bir trader terminali: zifiri siyah, neon yeşil ve camgöbeği, monospace sayılar, tarama çizgileri ve glitch kesmeler. Kripto kitlesinin dilinden konuşur.',
  board: { bg: '#05080B', ink: '#E6FFF3', soft: '#6E8F84', accent: '#00FF88', line: 'rgba(0,255,136,0.22)', display: { f: SG, w: 700, ls: -3 }, text: { f: JB, w: 400 }, badgeInk: '#04060A' },
  palette: [['#04060A', 'Gece'], ['#00FF88', 'Neon yeşil'], ['#00E5FF', 'Camgöbeği'], ['#FF2E88', 'Uyarı'], ['#FFB020', 'Amber']],
  fonts: ['Space Grotesk 700', 'JetBrains Mono'],
  motion: ['Glitch / RGB kayması', 'Daktilo imleci, satır akışı', 'Tarama çizgisi, sert kesmeler'],
  music: 'karanlık synthwave, 124 BPM, 8-bit tikler',
  format: '16:9 · 1920×1080 · 40 sn',
  init: d1_init,
  scenes: D1_SCENES,
};
