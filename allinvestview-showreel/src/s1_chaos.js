'use strict';
/* 1. HOOK (0–4 s): a scattered financial life. Broker apps, a broken spreadsheet,
 * a crypto exchange, a stale pension portal and a to-do list of money worries pop
 * in on the beat, start to shake, then get sucked into a single point. */

const CHAOS = [
  { kind: 'broker', title: 'Broker app', x: 330, y: 245, w: 430, h: 280, rot: -0.07, t: 0.08 },
  { kind: 'sheet', title: 'portfolio_FINAL_v7.xlsx', x: 1560, y: 270, w: 500, h: 300, rot: 0.06, t: 0.30 },
  { kind: 'crypto', title: 'Crypto exchange', x: 420, y: 820, w: 420, h: 270, rot: 0.06, t: 0.52 },
  { kind: 'mail', title: 'Statements · 14 unread', x: 1500, y: 830, w: 430, h: 260, rot: -0.05, t: 0.74 },
  { kind: 'notes', title: 'Notes', x: 975, y: 165, w: 420, h: 230, rot: 0.025, t: 0.96 },
  { kind: 'pension', title: 'Pension portal', x: 980, y: 930, w: 400, h: 220, rot: -0.03, t: 1.18 },
  { kind: 'broker2', title: 'Broker app #2', x: 110, y: 540, w: 380, h: 300, rot: 0.09, t: 1.40 },
  { kind: 'bank', title: 'Bank · Savings', x: 1820, y: 560, w: 400, h: 250, rot: -0.08, t: 1.62 },
];
CHAOS.forEach((c, i) => { c.badge = [2.05, 2.3, 2.55, 2.8, 2.18, 2.68, 2.42, 2.92][i]; c.n = [3, 7, 2, 14, 5, 1, 9, 4][i]; });

const HOOK = [
  { a: 'Stocks', b: ' here.', col: C.cyan, t0: 0.25, t1: 1.22 },
  { a: 'Crypto', b: ' there.', col: C.amber, t0: 1.25, t1: 2.22 },
  { a: 'Spreadsheets', b: ' everywhere.', col: C.red, t0: 2.25, t1: 3.22 },
];

// stable pseudo-random flicker: changes every `step` seconds
const flick = (t, seed, step = 0.09) => mulberry32((Math.floor(t / step) * 7919 + seed * 104729) | 0)();

function chaosBody(g, c, t, i) {
  const { w, h } = c;
  const T = { f: 'Txt', a: 'left', b: 'alphabetic' };
  switch (c.kind) {
    case 'broker': {
      text(g, 'Portfolio value', 24, 78, { ...T, s: 17, w: 500, c: C.soft });
      const v = 48210 + Math.floor(flick(t, i) * 900);
      text(g, money(v, 2), 24, 126, { ...T, s: 40, w: 700, c: C.ink });
      pill(g, w - 24, 112, '−1.8%', { s: 17, a: 'right', fill: 'rgba(255,90,110,0.16)', stroke: false, c: C.red, w: 700 });
      const pts = walk(11, 40, -0.004, 0.03).map((v2, k) => [24 + k / 39 * (w - 48), 240 - (v2 - 0.8) * 160]);
      g.strokeStyle = C.red; g.lineWidth = 3; g.lineJoin = 'round';
      g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      break;
    }
    case 'sheet': {
      const cols = 5, cw = (w - 28) / cols, ch = 38, y0 = 52;
      for (let r = 0; r < 6; r++) for (let k = 0; k < cols; k++) {
        const x = 14 + k * cw, y = y0 + r * ch;
        g.fillStyle = r === 0 ? 'rgba(80,110,170,0.25)' : 'rgba(255,255,255,0.025)';
        g.fillRect(x, y, cw - 2, ch - 2);
        if (r === 0) text(g, 'ABCDE'[k], x + cw / 2, y + 25, { s: 15, w: 600, f: 'Txt', c: C.soft });
        else if (r === 3 && k === 3) {
          g.fillStyle = 'rgba(255,90,110,0.3)'; g.fillRect(x, y, cw - 2, ch - 2);
          text(g, '#REF!', x + 10, y + 25, { ...T, s: 16, w: 700, c: '#FF8A98' });
        } else if (r === 5 && k === 4) {
          text(g, '#N/A', x + 10, y + 25, { ...T, s: 16, w: 700, c: C.amber });
        } else {
          const v = (flick(t, i * 31 + r * 7 + k, 0.13) * 9000 + 100).toFixed(k === 0 ? 0 : 2);
          text(g, k === 0 ? ['', 'AAPL', 'VOO', 'BTC', 'BND', 'ETH'][r] : v, x + 10, y + 25, { ...T, s: 15, w: 500, c: k === 0 ? C.ink : C.soft });
        }
      }
      break;
    }
    case 'crypto': {
      text(g, 'BTC / USD', 24, 78, { ...T, s: 17, w: 600, c: C.soft });
      const v = 63000 + Math.floor(flick(t, i, 0.07) * 2400);
      text(g, money(v, 0), 24, 124, { ...T, s: 38, w: 700, c: flick(t, i + 3, 0.07) > 0.5 ? C.mint : C.red });
      const r = mulberry32(5);
      let y = 200;
      for (let k = 0; k < 16; k++) {
        const up = r() > 0.5, bh = 10 + r() * 34, x = 26 + k * ((w - 52) / 16);
        y += (up ? -1 : 1) * (4 + r() * 10);
        g.fillStyle = up ? C.mint : C.red;
        g.fillRect(x + 6, y - bh / 2 - 8, 2, bh + 16);
        g.fillRect(x, y - bh / 2, 14, bh);
      }
      break;
    }
    case 'mail': {
      const rows = ['Q3 statement.pdf', 'Trade confirmation #48213', 'Dividend notice', 'Tax document available'];
      rows.forEach((s, k) => {
        const y = 70 + k * 46;
        g.fillStyle = 'rgba(255,255,255,0.04)'; rr(g, 16, y - 18, w - 32, 38, 8); g.fill();
        g.strokeStyle = C.soft; g.lineWidth = 2; g.strokeRect(30, y - 8, 22, 16);
        g.beginPath(); g.moveTo(30, y - 8); g.lineTo(41, y + 1); g.lineTo(52, y - 8); g.stroke();
        text(g, s, 66, y + 6, { ...T, s: 17, w: k === 0 ? 700 : 500, c: k === 0 ? C.ink : C.soft });
        if (k < 2) { g.fillStyle = C.blue; g.beginPath(); g.arc(w - 36, y, 5, 0, TAU); g.fill(); }
      });
      break;
    }
    case 'notes': {
      const rows = ['When do my dividends pay?', 'EUR → USD rate on that trade??', 'Which tax lot did I sell?', 'Update the spreadsheet!!'];
      rows.forEach((s, k) => {
        const y = 82 + k * 40;
        g.strokeStyle = C.dim; g.lineWidth = 2; g.strokeRect(24, y - 15, 18, 18);
        text(g, s, 56, y, { ...T, s: 19, w: 500, c: k === 3 ? C.amber : C.ink });
      });
      break;
    }
    case 'pension': {
      g.lineWidth = 16;
      [[0, 0.5, C.blue], [0.5, 0.8, C.violet], [0.8, 1, C.faint]].forEach(([a, b, col]) => {
        g.strokeStyle = col; g.beginPath(); g.arc(80, 130, 46, -Math.PI / 2 + a * TAU + 0.04, -Math.PI / 2 + b * TAU - 0.04); g.stroke();
      });
      text(g, 'Balance', 152, 106, { ...T, s: 17, w: 500, c: C.soft });
      text(g, '$— — —', 152, 146, { ...T, s: 32, w: 700, c: C.ink });
      text(g, 'Last updated 94 days ago', 152, 182, { ...T, s: 16, w: 600, c: C.amber });
      break;
    }
    case 'broker2': {
      const rows = [['MSFT', '+0.6%', C.mint], ['NVDA', '−2.3%', C.red], ['KO', '+0.1%', C.mint], ['TSLA', '−4.1%', C.red], ['VWCE', '+0.4%', C.mint]];
      rows.forEach(([s, p, col], k) => {
        const y = 82 + k * 44;
        text(g, s, 24, y, { ...T, s: 19, w: 700, c: C.ink });
        text(g, money(1000 + flick(t, i * 13 + k, 0.11) * 9000, 2), 140, y, { ...T, s: 17, w: 500, c: C.soft });
        text(g, p, w - 24, y, { ...T, a: 'right', s: 17, w: 700, c: col });
      });
      break;
    }
    case 'bank': {
      text(g, 'Savings account', 24, 78, { ...T, s: 17, w: 500, c: C.soft });
      text(g, '$12,400.00', 24, 124, { ...T, s: 38, w: 700, c: C.ink });
      [0.8, 0.55, 0.7].forEach((b, k) => { g.fillStyle = 'rgba(120,150,220,0.25)'; rr(g, 24, 150 + k * 22, (w - 48) * b, 12, 6); g.fill(); });
      text(g, 'Pending transfer…', 24, 232, { ...T, s: 16, w: 600, c: C.amber });
      break;
    }
  }
}

function chaosCard(g, c, t, i) {
  g.save();
  shadow(g, 0, 0, c.w, c.h, 18, 0.55, 40);
  rr(g, 0, 0, c.w, c.h, 18);
  g.fillStyle = '#0F1A36'; g.fill();
  g.save(); g.clip();
  g.fillStyle = '#162345'; g.fillRect(0, 0, c.w, 40);
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(160,190,255,0.2)'; g.stroke();
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, k) => { g.fillStyle = col; g.beginPath(); g.arc(22 + k * 18, 20, 5.5, 0, TAU); g.fill(); });
  text(g, c.title, 86, 26, { s: 16, w: 600, f: 'Txt', a: 'left', c: C.soft });
  chaosBody(g, c, t, i);
  // notification badge
  const bp = t - c.badge;
  if (bp > 0) {
    const s = spring(bp, 2.6, 9);
    g.save(); g.translate(c.w - 6, 2); g.scale(s, s);
    g.fillStyle = C.red; g.beginPath(); g.arc(0, 0, 19, 0, TAU); g.fill();
    g.strokeStyle = '#0F1A36'; g.lineWidth = 4; g.stroke();
    text(g, String(c.n), 0, 7, { s: 19, w: 700, f: 'Txt', c: '#fff' });
    g.restore();
  }
  g.restore();
}

function scene1(g, t) {
  const stress = E.inQuad(prog(t, 2.1, 3.25));
  const sink = t >= 3.15;
  // cards
  CHAOS.forEach((c, i) => {
    const dt = t - c.t;
    if (dt <= 0) return;
    let s = spring(dt, 2.2, 8) * 0.96;
    let x = c.x + Math.sin(t * 0.8 + i * 1.7) * 14, y = c.y + Math.cos(t * 0.9 + i) * 10 + (1 - E.outCubic(prog(dt, 0, 0.4))) * 60;
    let rot = c.rot * (1 + (1 - s) * 2) + Math.sin(t * 0.6 + i) * 0.015;
    if (stress > 0) {
      x += (flick(t, i * 3, 0.034) - 0.5) * 22 * stress;
      y += (flick(t, i * 3 + 1, 0.034) - 0.5) * 22 * stress;
      rot += (flick(t, i * 3 + 2, 0.05) - 0.5) * 0.06 * stress;
    }
    let a = clamp(dt * 7);
    if (sink) {
      const q = E.inCubic(prog(t, 3.15 + i * 0.022, 3.93));
      const ang = q * 1.6 * (i % 2 ? 1 : -1);
      const dx = x - CX, dy = y - CY;
      x = CX + (dx * Math.cos(ang) - dy * Math.sin(ang)) * (1 - q);
      y = CY + (dx * Math.sin(ang) + dy * Math.cos(ang)) * (1 - q);
      s *= 1 - 0.94 * q;
      rot += q * 2.6 * (i % 2 ? 1 : -1);
      a *= 1 - prog(q, 0.82, 1);
    }
    if (a <= 0.01) return;
    g.save();
    g.globalAlpha = a;
    g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.translate(-c.w / 2, -c.h / 2);
    chaosCard(g, c, t, i);
    g.restore();
  });

  // scrim behind the words
  const ta = Math.max(...HOOK.map(l => window01(t, l.t0 - 0.05, l.t1, 0.12, 0.12)));
  if (ta > 0) {
    g.save(); g.globalAlpha = ta * 0.92;
    const gr = g.createRadialGradient(CX, CY, 60, CX, CY, 900);
    gr.addColorStop(0, 'rgba(3,6,16,0.94)'); gr.addColorStop(0.45, 'rgba(3,6,16,0.75)'); gr.addColorStop(1, 'rgba(3,6,16,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.restore();
  }
  // words: slam in on the beat, slide up and out
  for (const l of HOOK) {
    if (t < l.t0 - 0.02 || t > l.t1 + 0.05) continue;
    const full = l.a + l.b;
    const o = fit(g, full, { s: 168, w: 900, ls: -3 }, 1700);
    const out = E.inCubic(prog(t, l.t1 - 0.14, l.t1));
    g.save();
    g.globalAlpha = 1 - out;
    letters(g, full, CX, CY + 56 - out * 90, { ...o, colors: (k) => k < l.a.length ? l.col : C.ink }, (k, n) => {
      const p = prog(t, l.t0 + k * 0.008, l.t0 + k * 0.008 + 0.15);
      return { sc: lerp(1.5, 1, E.outCubic(p)), al: E.outQuad(p), dy: (1 - E.outCubic(p)) * -24 };
    });
    g.restore();
  }
  // singularity glow
  const sg = prog(t, 3.3, 4.0);
  if (sg > 0) {
    addGlow(g, '#FFFFFF', CX, CY, 40 + 520 * E.inQuad(sg), 0.9 * sg);
    addGlow(g, C.cyan, CX, CY, 80 + 900 * E.inCubic(sg), 0.6 * sg);
  }
}

function cues1(cue) {
  CHAOS.forEach((c, i) => {
    cue(c.t, 'pop', { pitch: 0.8 + i * 0.07, pan: (c.x - CX) / CX * 0.8, gain: 0.55 });
    cue(c.badge, 'ding', { pitch: 1 + (i % 4) * 0.12, pan: (c.x - CX) / CX * 0.7, gain: 0.32 });
  });
  HOOK.forEach(l => { cue(l.t0, 'hit', { gain: 0.95 }); cue(l.t1 - 0.12, 'swish', { dur: 0.16, gain: 0.25 }); });
  cue(2.2, 'glitch', { dur: 1.0, gain: 0.35 });
  cue(3.2, 'suck', { dur: 0.8, gain: 0.8 });
}
