'use strict';
/* Market ürünleri için premium ikonlar (jenerik, etiketsiz ambalaj) + açılış kurdelesi ve makas.
 * Aynı çizim dili: katmanlı gradyan, iç gölge, parlak vurgu (bkz. icons.js).
 */
Object.assign(ICON, {
  /* ─── süt şişesi ─── */
  milk(g) {
    g.translate(0, 2);
    const body = P('M -15 -30 L 15 -30 L 15 -22 Q 30 -14 30 2 L 30 38 Q 30 46 22 46 L -22 46 Q -30 46 -30 38 L -30 2 Q -30 -14 -15 -22 Z');
    fillS(g, body, lg(g, -30, 0, 30, 0, [[0, '#D9E4F3'], [0.25, '#FFFFFF'], [0.6, '#F3F7FC'], [1, '#C3D1E6']]), ['rgba(0,20,60,0.4)', 3.5, 2.4]);
    g.save(); g.clip(body); // mavi etiket bandı (yazısız)
    g.fillStyle = lg(g, -30, 0, 30, 0, [[0, '#0E5FE0'], [0.3, '#3B8BFF'], [1, '#0B4AB8']]); g.fillRect(-32, 6, 64, 24);
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.moveTo(-32, 22); g.bezierCurveTo(-10, 12, 10, 30, 32, 18); g.lineTo(32, 24); g.bezierCurveTo(10, 36, -10, 18, -32, 28); g.closePath(); g.fill();
    g.restore();
    innerShadow(g, body, 'rgba(0,20,60,0.35)', 4, 1, -1);
    streak(g, body, -20, -6, -19, 38, 3, 0.85);
    const cap = rr(-16, -42, 32, 14, 4);
    fillS(g, cap, lg(g, 0, -42, 0, -28, [[0, '#4C97FF'], [1, '#0E5FE0']]), ['rgba(0,20,60,0.35)', 2, 1.4]);
    g.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = -12; x <= 12; x += 4) g.fillRect(x, -40, 1.6, 10);
  },
  /* ─── somun ekmek ─── */
  bread(g) {
    g.translate(0, 6);
    const b = P('M -46 14 C -50 -18 -26 -32 0 -32 C 26 -32 50 -18 46 14 C 45 26 37 31 28 31 L -28 31 C -37 31 -45 26 -46 14 Z');
    fillS(g, b, lg(g, 0, -32, 0, 31, [[0, '#F9C67A'], [0.4, '#E99A43'], [1, '#B4601C']]), ['rgba(70,30,0,0.45)', 4, 2.6]);
    innerShadow(g, b, 'rgba(110,45,0,0.55)', 6, -1, -3);
    gloss(g, b, -14, -20, 22, 8, 0.55, -0.2);
    for (const x of [-24, 0, 24]) { // çentikler
      const c = P(`M ${x - 9} -2 Q ${x} -18 ${x + 10} -20 Q ${x + 4} -6 ${x - 9} -2 Z`);
      fillS(g, c, lg(g, 0, -20, 0, -2, [[0, '#FFE7B8'], [1, '#F6C27A']]));
    }
    g.fillStyle = 'rgba(255,240,210,0.6)'; const r = mulberry32(8);
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(-34 + r() * 68, -10 + r() * 30, 1.2, 0.7, r() * 3, 0, TAU); g.fill(); }
  },
  /* ─── yumurta kolisi ─── */
  eggs(g) {
    g.translate(0, 8);
    for (const [x, y, s] of [[-24, -10, 1], [0, -14, 1.05], [24, -10, 1]]) {
      const e = P(`M ${x} ${y - 20 * s} C ${x + 13 * s} ${y - 20 * s} ${x + 16 * s} ${y + 2 * s} ${x + 16 * s} ${y + 8 * s} C ${x + 16 * s} ${y + 18 * s} ${x + 8 * s} ${y + 22 * s} ${x} ${y + 22 * s} C ${x - 8 * s} ${y + 22 * s} ${x - 16 * s} ${y + 18 * s} ${x - 16 * s} ${y + 8 * s} C ${x - 16 * s} ${y + 2 * s} ${x - 13 * s} ${y - 20 * s} ${x} ${y - 20 * s} Z`);
      fillS(g, e, rg(g, x, y, 24 * s, [[0, '#FFF8EE'], [0.7, '#F4DDC0'], [1, '#D9B48A']], x - 6, y - 10), ['rgba(80,40,0,0.35)', 2.5, 1.6]);
      gloss(g, e, x - 5 * s, y - 8 * s, 4 * s, 7 * s, 0.8, 0.3);
    }
    const box = P('M -44 4 L 44 4 L 40 32 Q 39 36 35 36 L -35 36 Q -39 36 -40 32 Z');
    fillS(g, box, lg(g, 0, 4, 0, 36, [[0, '#D8C3A0'], [1, '#B39570']]), ['rgba(60,30,0,0.4)', 3, 2]);
    g.save(); g.clip(box); g.strokeStyle = 'rgba(90,60,30,0.3)'; g.lineWidth = 1.4;
    for (const x of [-22, 0, 22]) { g.beginPath(); g.arc(x, 4, 11, 0, Math.PI); g.stroke(); }
    g.restore();
    gloss(g, box, -18, 12, 18, 3, 0.4);
  },
  /* ─── cips paketi ─── */
  chips(g) {
    const body = P('M -30 -40 Q -36 0 -30 40 L 30 40 Q 36 0 30 -40 Z');
    fillS(g, body, lg(g, -34, 0, 34, 0, [[0, '#E8681A'], [0.4, '#FFB547'], [0.75, '#FF9B2F'], [1, '#D9560C']]), ['rgba(90,30,0,0.45)', 3.5, 2.4]);
    g.save(); g.clip(body);
    g.fillStyle = '#E2382B'; g.fillRect(-40, -30, 80, 8);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.roundRect(-22, -36, 7, 70, 3.5); g.fill();
    g.restore();
    for (const y of [-40, 40]) { // tırtıklı kapaklar
      g.fillStyle = '#C9500B'; g.beginPath(); g.moveTo(-31, y);
      for (let x = -31; x <= 31; x += 4) g.lineTo(x, y + (y < 0 ? -1 : 1) * ((x / 4) % 2 ? 4 : 1));
      g.lineTo(31, y); g.closePath(); g.fill();
    }
    innerShadow(g, body, 'rgba(110,40,0,0.45)', 4, 1, 0);
    // pencere: cips görünür
    const win = ell(0, 8, 20, 16);
    fillS(g, win, '#FFF6E0');
    for (const [x, y, a] of [[-6, 6, -0.4], [7, 11, 0.5], [0, 14, 0.1]]) {
      fillS(g, ell(x, y, 11, 7, a), lg(g, x, y - 7, x, y + 7, [[0, '#FFE07A'], [1, '#EDB236']]), ['rgba(120,70,0,0.35)', 1.2, 0.8]);
    }
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.4; g.stroke(win);
  },
  /* ─── su şişesi ─── */
  water(g) {
    const body = P('M -12 -34 L 12 -34 L 12 -26 Q 24 -20 24 -6 L 24 40 Q 24 46 18 46 L -18 46 Q -24 46 -24 40 L -24 -6 Q -24 -20 -12 -26 Z');
    fillS(g, body, lg(g, -24, 0, 24, 0, [[0, 'rgba(150,200,255,0.75)'], [0.3, 'rgba(225,242,255,0.85)'], [0.7, 'rgba(190,225,255,0.8)'], [1, 'rgba(120,175,240,0.85)']]), ['rgba(0,40,100,0.3)', 3, 2]);
    g.save(); g.clip(body);
    g.fillStyle = 'rgba(80,160,255,0.35)'; g.fillRect(-26, -2, 52, 50);
    g.fillStyle = lg(g, 0, 8, 0, 26, [[0, '#3B8BFF'], [1, '#0E5FE0']]); g.fillRect(-26, 8, 52, 18);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1.2;
    for (const y of [-8, 32, 38]) { g.beginPath(); g.moveTo(-24, y); g.quadraticCurveTo(0, y + 3, 24, y); g.stroke(); }
    g.restore();
    streak(g, body, -15, -14, -14, 40, 3, 0.9);
    fillS(g, rr(-13, -44, 26, 11, 3), lg(g, 0, -44, 0, -33, [[0, '#7FB6FF'], [1, '#2F7BEA']]), ['rgba(0,30,80,0.3)', 1.6, 1]);
  },
});

/* ─── açılış kurdelesi: ekranı yatay keser, ortada fiyonk; cut (0→1) ile iki yana savrulur ─── */
function ribbon(g, y, cut, t, cx = 540) {
  const H2 = 64, sag = 18;
  const half = (side) => {
    const c = E.outCubic(cut), dir = side;
    g.save();
    g.translate(cx + dir * c * 160, y + c * c * 900);
    g.rotate(dir * c * 0.9);
    const x0 = 0, x1 = dir * 760;
    const path = new Path2D();
    path.moveTo(x0, -H2 / 2); path.quadraticCurveTo((x0 + x1) / 2, -H2 / 2 + sag, x1, -H2 / 2);
    path.lineTo(x1, H2 / 2); path.quadraticCurveTo((x0 + x1) / 2, H2 / 2 + sag, x0, H2 / 2); path.closePath();
    g.save(); g.shadowColor = 'rgba(80,0,10,0.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
    g.fillStyle = lg(g, 0, -H2 / 2, 0, H2 / 2, [[0, '#FF5A6A'], [0.45, '#E5263C'], [1, '#A3122B']]); g.fill(path); g.restore();
    g.save(); g.clip(path);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(Math.min(x0, x1), -H2 / 2 + 8, 800, 6);
    g.fillStyle = 'rgba(255,220,120,0.9)'; g.fillRect(Math.min(x0, x1), -H2 / 2 + 2, 800, 4); g.fillRect(Math.min(x0, x1), H2 / 2 - 6 + sag * 0.5, 800, 4);
    g.restore();
    g.restore();
  };
  half(-1); half(1);
  if (cut < 0.02) { // fiyonk
    g.save(); g.translate(cx, y);
    for (const s of [-1, 1]) {
      const loop = P(`M 0 0 C ${s * 40} -70 ${s * 130} -60 ${s * 110} -6 C ${s * 100} 30 ${s * 40} 20 0 0 Z`);
      fillS(g, loop, lg(g, 0, -60, 0, 30, [[0, '#FF6B7A'], [1, '#B3152F']]), ['rgba(80,0,10,0.4)', 3, 2]);
      const tail = P(`M ${s * 6} 10 L ${s * 60} 110 L ${s * 38} 104 L ${s * 30} 124 L ${s * -4} 18 Z`);
      fillS(g, tail, lg(g, 0, 0, 0, 120, [[0, '#E5263C'], [1, '#8E0F24']]));
    }
    fillS(g, circ(0, 2, 22), rg(g, 0, 2, 22, [[0, '#FF8A96'], [1, '#C21B35']], -6, -6), ['rgba(80,0,10,0.4)', 2, 1.4]);
    g.restore();
  }
}
/* ─── makas: (x, y) uç noktası, open 0..1 ─── */
function scissors(g, x, y, open, s = 1, rot = -0.35) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (const side of [-1, 1]) {
    g.save(); g.rotate(side * open * 0.35);
    const blade = P('M 0 0 L 150 -6 Q 160 0 150 6 Z');
    fillS(g, blade, lg(g, 0, -6, 0, 6, [[0, '#F4F7FB'], [0.5, '#A9B6CA'], [1, '#6F7F99']]), ['rgba(0,0,0,0.3)', 3, 2]);
    g.lineWidth = 12; g.strokeStyle = side < 0 ? '#1F73F0' : '#0E5FE0';
    g.beginPath(); g.ellipse(-52, side * 22, 30, 18, side * 0.3, 0, TAU); g.stroke();
    g.restore();
  }
  fillS(g, circ(0, 0, 8), '#C9D3E2');
  g.restore();
}
