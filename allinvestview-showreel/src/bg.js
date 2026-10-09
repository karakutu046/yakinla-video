'use strict';
/* Background: deep navy base, three slow aurora blobs whose colours follow the
 * scene palette, a faint dot grid and drifting dust. Plus the vignette. */

const PAL = [
  [0.0, ['#5A2A8C', '#8C2A55', '#1B2A6B']],
  [3.9, ['#6A2A9C', '#A02A50', '#1B2A6B']],
  [4.3, ['#1E4FD8', '#6B3FD8', '#0E7A8A']],
  [8.0, ['#1E4FD8', '#1C8FC8', '#3B2A9A']],
  [14.0, ['#0E7A8A', '#1E5FD8', '#0F6B55']],
  [18.0, ['#2A3FC8', '#6B3FD8', '#1C6FA8']],
  [22.0, ['#0F7A5A', '#A8701A', '#1E4FD8']],
  [26.0, ['#4A2AA8', '#1E3FB8', '#7A2A8A']],
  [32.0, ['#1E4FD8', '#0E8A9A', '#6B3FD8']],
  [36.0, ['#1E6FE8', '#7A4AE8', '#0E9A7A']],
];
function palAt(t) {
  let i = 0;
  while (i < PAL.length - 1 && PAL[i + 1][0] <= t) i++;
  if (i >= PAL.length - 1) return PAL[PAL.length - 1][1].map(hex2rgb);
  const [t0, a] = PAL[i], [t1, b] = PAL[i + 1];
  // colours cross-fade over the 0.8 s before each key
  const k = E.inOutSine(prog(t, Math.max(t0, t1 - 0.8), t1));
  return a.map((c, j) => mix(hex2rgb(c), hex2rgb(b[j]), k));
}

const DUST = (() => {
  const r = mulberry32(42), out = [];
  for (let i = 0; i < 90; i++) out.push({ x: r() * W, y: r() * H, z: 0.3 + r() * 0.7, ph: r() * TAU, sp: 0.5 + r() });
  return out;
})();

function background(g, t, energy = 1) {
  g.fillStyle = SPR.base; g.fillRect(-100, -100, W + 200, H + 200);
  const pal = palAt(t);
  const blobs = [
    [CX - 520 + Math.sin(t * 0.21) * 260, CY - 220 + Math.cos(t * 0.17) * 160, 1050],
    [CX + 560 + Math.cos(t * 0.19 + 1) * 240, CY + 180 + Math.sin(t * 0.23 + 2) * 170, 1150],
    [CX + Math.sin(t * 0.13 + 4) * 420, CY + 420 + Math.cos(t * 0.15) * 120, 900],
  ];
  g.save();
  g.globalCompositeOperation = 'lighter';
  blobs.forEach(([x, y, r], i) => {
    const c3 = pal[i];
    g.globalAlpha = 0.34 * energy;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgb(c3, 0.55)); gr.addColorStop(0.45, rgb(c3, 0.18)); gr.addColorStop(1, rgb(c3, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  });
  g.restore();
  // dot grid
  g.save();
  g.globalAlpha = 0.07;
  g.translate(-((t * 9) % 48), -((t * 5) % 48));
  g.fillStyle = SPR.dots; g.fillRect(-48, -48, W + 96, H + 96);
  g.restore();
  // dust
  g.save();
  for (const d of DUST) {
    const y = ((d.y - t * 14 * d.sp * d.z) % H + H) % H;
    const x = d.x + Math.sin(t * 0.4 + d.ph) * 20 * d.z;
    const a = (0.25 + 0.35 * Math.sin(t * 1.3 * d.sp + d.ph) ** 2) * d.z;
    g.globalAlpha = a;
    g.fillStyle = '#BFD4FF';
    g.beginPath(); g.arc(x, y, 1.1 + d.z * 1.4, 0, TAU); g.fill();
  }
  g.restore();
}

function vignette(g) {
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
}

function initBackground(g) {
  const b = g.createRadialGradient(CX, CY * 0.9, 100, CX, CY, 1250);
  b.addColorStop(0, '#0B1532'); b.addColorStop(0.55, '#070E22'); b.addColorStop(1, '#03060F');
  SPR.base = b;
  const v = g.createRadialGradient(CX, CY, 520, CX, CY, 1180);
  v.addColorStop(0, 'rgba(0,4,16,0)'); v.addColorStop(1, 'rgba(0,4,16,0.55)');
  SPR.vig = v;
  const d = canvas(48, 48), dx = d.getContext('2d'); dx.fillStyle = '#9DB8FF'; dx.beginPath(); dx.arc(24, 24, 1.6, 0, TAU); dx.fill();
  SPR.dots = g.createPattern(d, 'repeat');
}
