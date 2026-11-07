'use strict';
/* Premium ikon seti: hepsi kodla çizilir (stok ikon yok).
 * Her ikon 100 birimlik bir kutuda, merkez (0,0). Hacim hissi için katmanlı gradyan,
 * iç gölge, parlak vurgu (specular) ve katmanlar arası yumuşak gölge kullanılır.
 * İkonlar açılışta yüksek çözünürlüklü sprite'lara basılır; animasyon sırasında
 * yalnızca drawImage ile çizilir (hızlı ve keskin).
 */
let SK = 1; // çizim sırasında 1 birim = SK cihaz pikseli (gölge/blur cihaz pikseliyle ölçülür)

function innerShadow(g, path, col, blur, dx, dy) {
  g.save(); g.clip(path);
  const p = new Path2D(); p.rect(-1e4, -1e4, 2e4, 2e4); p.addPath(path);
  g.shadowColor = col; g.shadowBlur = blur * SK; g.shadowOffsetX = dx * SK; g.shadowOffsetY = dy * SK;
  g.fillStyle = '#000'; g.fill(p, 'evenodd');
  g.restore();
}
function gloss(g, path, x, y, rx, ry, a = 0.6, rot = 0) {
  g.save(); if (path) g.clip(path);
  g.translate(x, y); g.rotate(rot); g.scale(rx, ry);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.55, `rgba(255,255,255,${a * 0.35})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill();
  g.restore();
}
function shadowed(g, col, blur, dy, fn, dx = 0) {
  g.save(); g.shadowColor = col; g.shadowBlur = blur * SK; g.shadowOffsetY = dy * SK; g.shadowOffsetX = dx * SK;
  fn(); g.restore();
}
function fillS(g, path, style, sh) { // gölgeli dolgu
  if (sh) shadowed(g, sh[0], sh[1], sh[2], () => { g.fillStyle = style; g.fill(path); });
  else { g.fillStyle = style; g.fill(path); }
}
function rim(g, path, col, lw) { g.save(); g.clip(path); g.strokeStyle = col; g.lineWidth = lw * 2; g.stroke(path); g.restore(); }
function streak(g, path, x0, y0, x1, y1, w, a = 0.7) { // ince parlak yansıma çizgisi
  g.save(); if (path) g.clip(path);
  g.filter = `blur(${0.9 * SK}px)`;
  g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 - 2, (y0 + y1) / 2, x1, y1); g.stroke();
  g.restore();
}

// Çatal-bıçak glifi (yaklaşık 26 birim genişlik, 40 birim yükseklik)
function forkKnife(g, col) {
  g.fillStyle = col;
  g.beginPath();
  g.roundRect(-11.5, -19, 2.8, 12, 1.4); g.roundRect(-7.6, -19, 2.8, 12, 1.4); g.roundRect(-3.7, -19, 2.8, 12, 1.4);
  g.fill();
  g.beginPath(); g.moveTo(-11.5, -9); g.lineTo(-0.9, -9); g.quadraticCurveTo(-0.9, -2.5, -4.6, -1.2);
  g.lineTo(-4.6, 17.5); g.quadraticCurveTo(-6.2, 20.5, -7.8, 17.5); g.lineTo(-7.8, -1.2); g.quadraticCurveTo(-11.5, -2.5, -11.5, -9); g.fill();
  g.beginPath(); g.moveTo(5, 17.5); g.quadraticCurveTo(6.6, 20.5, 8.2, 17.5); g.lineTo(8.2, 3); g.quadraticCurveTo(12.6, 0, 12.6, -8);
  g.quadraticCurveTo(12.6, -18.5, 7.2, -19.5); g.quadraticCurveTo(5, -19.6, 5, -16.5); g.closePath(); g.fill();
}

const PATHS = {
  pin: P('M 512 104 C 340 104, 202 242, 202 414 C 202 540, 270 638, 360 712 C 430 770, 480 830, 504 900 C 508 914, 516 914, 520 900 C 544 830, 594 770, 664 712 C 754 638, 822 540, 822 414 C 822 242, 684 104, 512 104 Z'),
};
// Metalik (gümüş) gradyan durakları
const METAL = [[0, '#7F93B3'], [0.14, '#E9EFF8'], [0.3, '#C3CEDF'], [0.52, '#93A6C3'], [0.72, '#EEF3FA'], [0.88, '#B2C0D6'], [1, '#6E83A6']];

const ICON = {
  /* ─── hamburger ─── */
  burger(g) {
    const SH = ['rgba(70,25,0,0.45)', 3.2, 2.2];
    const bb = P('M -41 27 L 41 27 Q 43.5 27 42.5 31 Q 39.5 42.5 27 43.5 L -27 43.5 Q -39.5 42.5 -42.5 31 Q -43.5 27 -41 27 Z');
    fillS(g, bb, lg(g, 0, 27, 0, 44, [[0, '#FBC06E'], [0.45, '#E8913A'], [1, '#B65816']]));
    innerShadow(g, bb, 'rgba(110,40,0,0.55)', 4, 0, -2.5);
    gloss(g, bb, -18, 33, 14, 3.2, 0.35);
    const pt = rr(-44.5, 12.5, 89, 17.5, 8.75);
    fillS(g, pt, lg(g, 0, 12.5, 0, 30, [[0, '#A35C33'], [0.4, '#71381A'], [1, '#40200D']]), SH);
    innerShadow(g, pt, 'rgba(0,0,0,0.55)', 3, 0, -2);
    g.save(); g.clip(pt); g.fillStyle = 'rgba(40,15,5,0.45)';
    const r = mulberry32(3);
    for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(-40 + r() * 80, 15 + r() * 13, 1 + r() * 1.6, 0.7 + r(), r() * 3, 0, TAU); g.fill(); }
    g.restore();
    g.strokeStyle = 'rgba(255,205,160,0.4)'; g.lineWidth = 1.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-37, 15.5); g.quadraticCurveTo(0, 13.8, 37, 15.5); g.stroke();
    // eriyen peynir
    const ch = P('M -46 8 L 46 8 L 46 12.5 Q 46 14.5 44 14.5 L 34 14.5 Q 31.8 14.5 31.4 16.6 L 29.6 25.2 Q 28.4 28.6 26.8 25.2 L 25 16.6 Q 24.6 14.5 22.4 14.5 L 3 14.5 Q 0.8 14.5 0.4 16.4 L -1.2 21.2 Q -2.6 24.2 -4 21.2 L -5.4 16.4 Q -5.8 14.5 -8 14.5 L -29 14.5 Q -31.2 14.5 -31.6 16.6 L -33.2 27.4 Q -34.6 31 -36 27.4 L -37.4 16.6 Q -37.8 14.5 -40 14.5 L -44 14.5 Q -46 14.5 -46 12.5 Z');
    fillS(g, ch, lg(g, 0, 8, 0, 30, [[0, '#FFE680'], [0.45, '#FFC93C'], [1, '#F29D0E']]), ['rgba(120,60,0,0.4)', 2.5, 1.6]);
    gloss(g, ch, -14, 10, 20, 2.2, 0.6);
    // domates
    for (const x of [-21, 19]) {
      const tm = rr(x - 17, 3.5, 34, 7.5, 3.75);
      fillS(g, tm, lg(g, 0, 3.5, 0, 11, [[0, '#FF6B5B'], [1, '#C42A1F']]), ['rgba(90,10,0,0.35)', 2, 1]);
      gloss(g, tm, x - 6, 5.5, 9, 1.4, 0.5);
    }
    // marul (dalgalı)
    const lt = new Path2D(); lt.moveTo(-47, 1.5); lt.lineTo(47, 1.5);
    for (let x = 47; x >= -47; x -= 2) lt.lineTo(x, 7 + 2.8 * Math.sin(x * 0.42) + 1.4 * Math.sin(x * 1.1 + 1));
    lt.closePath();
    fillS(g, lt, lg(g, 0, 1, 0, 11, [[0, '#B4F06A'], [0.6, '#6CC63A'], [1, '#3E9A25']]), ['rgba(20,60,0,0.35)', 2, 1.2]);
    g.save(); g.clip(lt); g.strokeStyle = 'rgba(230,255,190,0.55)'; g.lineWidth = 0.9;
    for (let x = -40; x <= 40; x += 9) { g.beginPath(); g.moveTo(x, 2); g.lineTo(x + 2, 9); g.stroke(); }
    g.restore();
    // üst ekmek
    const tb = P('M -45.5 4 C -47.5 -26.5 -26 -43 0 -43 C 26 -43 47.5 -26.5 45.5 4 Q 45.5 8 41.5 8 L -41.5 8 Q -45.5 8 -45.5 4 Z');
    fillS(g, tb, lg(g, 0, -43, 0, 8, [[0, '#FFD995'], [0.32, '#F8AE52'], [0.78, '#E2832A'], [1, '#B65A14']]), ['rgba(70,25,0,0.5)', 3.5, 2.4]);
    innerShadow(g, tb, 'rgba(120,45,0,0.6)', 7, -2.5, -4);
    gloss(g, tb, -15, -27, 24, 11, 0.72, -0.3);
    rim(g, tb, 'rgba(255,240,210,0.35)', 0.8);
    const seeds = [[-23, -24, -0.6], [-9, -32, -0.2], [7, -31, 0.25], [22, -24, 0.65], [-31, -11, -1], [-2, -21, 0.1], [14, -15, 0.5], [-15, -12, -0.35], [31, -10, 1.05], [-36, -2, -1.2], [36, 0, 1.2]];
    for (const [x, y, a] of seeds) {
      shadowed(g, 'rgba(120,50,0,0.45)', 1.2, 0.7, () => {
        g.fillStyle = lg(g, x, y - 2, x, y + 2, [[0, '#FFFBEE'], [1, '#F1D9A8']]);
        g.beginPath(); g.ellipse(x, y, 3.3, 1.75, a, 0, TAU); g.fill();
      });
    }
  },

  /* ─── pizza dilimi ─── */
  pizza(g) {
    g.save(); g.rotate(-0.16);
    const body = P('M -39 -25 L 39 -25 L 4.2 41 Q 0 47 -4.2 41 Z');
    fillS(g, body, lg(g, 0, -25, 0, 45, [[0, '#FFE58C'], [0.55, '#FFC94A'], [1, '#F0A021']]), ['rgba(110,50,0,0.45)', 3.5, 2.4]);
    innerShadow(g, body, 'rgba(170,80,0,0.5)', 6, 0, -3);
    g.save(); g.clip(body); // erimiş peynir kabarcıkları
    const r = mulberry32(9); g.fillStyle = 'rgba(255,248,200,0.55)';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(-28 + r() * 56, -18 + r() * 40, 1.5 + r() * 2.5, 1 + r() * 1.6, r() * 3, 0, TAU); g.fill(); }
    g.restore();
    for (const [x, y, rad] of [[-15, -10, 8.2], [13, -9, 7.6], [-1, 9, 7], [3, 26, 4.8]]) {
      const pp = circ(x, y, rad);
      fillS(g, pp, rg(g, x, y, rad, [[0, '#F26A50'], [0.75, '#D2382A'], [1, '#9E2018']], x - rad * 0.3, y - rad * 0.3), ['rgba(90,20,0,0.45)', 2, 1.4]);
      g.fillStyle = 'rgba(110,15,10,0.45)';
      for (const [a, d] of [[0.5, 0.45], [2.4, 0.5], [4.1, 0.35]]) { g.beginPath(); g.arc(x + Math.cos(a) * rad * d, y + Math.sin(a) * rad * d, rad * 0.11, 0, TAU); g.fill(); }
      gloss(g, pp, x - rad * 0.35, y - rad * 0.4, rad * 0.45, rad * 0.22, 0.75, -0.5);
    }
    for (const [x, y, a] of [[15, 8, 0.7], [-17, 6, -0.9]]) { // fesleğen
      g.save(); g.translate(x, y); g.rotate(a);
      const lf = P('M 0 -6 Q 5 -1 0 6 Q -5 -1 0 -6 Z');
      fillS(g, lf, lg(g, 0, -6, 0, 6, [[0, '#7EDB52'], [1, '#2C8A1E']]), ['rgba(0,40,0,0.35)', 1.2, 0.8]);
      g.strokeStyle = 'rgba(220,255,200,0.6)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(0, -5); g.lineTo(0, 5); g.stroke();
      g.restore();
    }
    const cr = P('M -45.5 -27 Q 0 -42 45.5 -27 Q 47.5 -19 40.5 -17.5 Q 0 -31 -40.5 -17.5 Q -47.5 -19 -45.5 -27 Z');
    fillS(g, cr, lg(g, 0, -40, 0, -17, [[0, '#F9CE87'], [0.5, '#E59B45'], [1, '#B8661F']]), ['rgba(90,40,0,0.45)', 2.5, 1.8]);
    innerShadow(g, cr, 'rgba(110,40,0,0.5)', 3, 0, -1.6);
    gloss(g, cr, -14, -33, 18, 2.6, 0.6, -0.1);
    g.fillStyle = 'rgba(120,50,10,0.35)';
    for (const x of [-30, -12, 8, 27]) { g.beginPath(); g.ellipse(x, -27.5 - (x * x) / 900, 1.6, 0.8, 0, 0, TAU); g.fill(); }
    g.restore();
  },

  /* ─── dürüm ─── */
  durum(g) {
    g.save(); g.rotate(0.3); g.translate(0, 3);
    const lv = P('M -20 -30 Q 0 -36 20 -30 L 18 40 Q 0 46 -18 40 Z');
    fillS(g, lv, lg(g, -20, 0, 20, 0, [[0, '#B97C3E'], [0.22, '#F4CF96'], [0.55, '#E7B371'], [1, '#A86A2E']]), ['rgba(70,30,0,0.45)', 3.5, 2.4]);
    g.save(); g.clip(lv); g.fillStyle = 'rgba(120,60,20,0.35)';
    const r = mulberry32(5);
    for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(-14 + r() * 28, -26 + r() * 30, 2 + r() * 2.5, 1 + r(), r() * 3, 0, TAU); g.fill(); }
    g.restore();
    // ağız (iç dolgu)
    fillS(g, ell(0, -31, 20, 6.5), lg(g, 0, -37, 0, -25, [[0, '#5A2A10'], [1, '#8B4A22']]));
    // dolgu: marul, domates, et, soğan
    const leaves = [[-14, -38, -0.6, 9], [12, -39, 0.5, 9.5], [-2, -44, 0.05, 8.5], [6, -35, 0.9, 7]];
    for (const [x, y, a, s] of leaves) {
      g.save(); g.translate(x, y); g.rotate(a);
      const lf = new Path2D(); lf.moveTo(-s, 3);
      for (let k = 0; k <= 8; k++) { const u = k / 8, ang = Math.PI * (1 - u); lf.lineTo(Math.cos(ang) * s * (1 + 0.12 * Math.sin(k * 2.6)), -Math.sin(ang) * s * 0.9 + 3); }
      lf.closePath();
      fillS(g, lf, lg(g, 0, -s, 0, 3, [[0, '#B6F070'], [1, '#3F9E26']]), ['rgba(0,40,0,0.4)', 1.5, 1]);
      g.restore();
    }
    for (const [x, y, a] of [[-8, -37, -0.3], [9, -38, 0.4]]) {
      g.save(); g.translate(x, y); g.rotate(a);
      const tp = P('M -6 0 A 6 6 0 0 1 6 0 Z');
      fillS(g, tp, lg(g, 0, -6, 0, 0, [[0, '#FF6D5C'], [1, '#C42A1F']]), ['rgba(80,0,0,0.35)', 1.2, 0.8]);
      g.restore();
    }
    for (const [x, y, a] of [[-4, -33, -0.5], [4, -34, 0.35], [-12, -32, -0.9], [13, -33, 0.8]]) {
      g.save(); g.translate(x, y); g.rotate(a);
      const m = rr(-2.2, -7, 4.4, 10, 2.2);
      fillS(g, m, lg(g, -2, 0, 2, 0, [[0, '#7A3A16'], [0.5, '#B0602C'], [1, '#6A3010']]), ['rgba(30,10,0,0.4)', 1, 0.6]);
      g.restore();
    }
    g.strokeStyle = '#C79BE0'; g.lineWidth = 1.3; // soğan halkası
    g.beginPath(); g.ellipse(-1, -40, 4, 2.4, 0.3, 0, TAU); g.stroke();
    // kağıt sargı
    const pp = P('M -22 2 L 22 -9 L 20.2 41 Q 0 47.5 -20.2 41 Z');
    fillS(g, pp, lg(g, -22, 0, 22, 0, [[0, '#C9D0DC'], [0.2, '#FFFFFF'], [0.6, '#F2F5FA'], [1, '#AAB4C6']]), ['rgba(20,30,60,0.35)', 3, 1.5]);
    g.save(); g.clip(pp);
    g.fillStyle = lg(g, -22, 0, 22, 0, [[0, '#1356C8'], [0.25, '#3B8BFF'], [1, '#0B4AB8']]);
    g.beginPath(); g.moveTo(-24, 22); g.lineTo(24, 11); g.lineTo(24, 19); g.lineTo(-24, 30); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(-24, 33); g.lineTo(24, 22); g.lineTo(24, 23.6); g.lineTo(-24, 34.6); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-21.5, 2.4); g.lineTo(21.5, -8.6); g.stroke();
    streak(g, pp, -13, 6, -12, 38, 2.4, 0.8);
    streak(g, lv, -13, -26, -13, -4, 2, 0.45);
    g.restore();
  },

  /* ─── şiş kebap ─── */
  kebap(g) {
    g.save(); g.rotate(-0.6);
    g.strokeStyle = lg(g, 0, -2, 0, 2, [[0, '#F4F7FB'], [0.5, '#A9B6CA'], [1, '#6F7F99']]);
    g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-46, 0); g.lineTo(53, 0); g.stroke();
    g.lineWidth = 2.6; g.beginPath(); g.arc(-51, 0, 5, 0, TAU); g.stroke();
    const meat = (x, rot) => {
      g.save(); g.translate(x, 0); g.rotate(rot);
      const m = rr(-7.5, -10, 15, 20, 5.5);
      fillS(g, m, lg(g, -7, -10, 7, 10, [[0, '#C0743E'], [0.45, '#8C4520'], [1, '#55260E']]), ['rgba(40,10,0,0.5)', 2.5, 1.8]);
      innerShadow(g, m, 'rgba(0,0,0,0.5)', 2.5, 1, 1.5);
      g.save(); g.clip(m); g.strokeStyle = 'rgba(40,12,2,0.75)'; g.lineWidth = 1.6;
      for (const k of [-5, 1, 7]) { g.beginPath(); g.moveTo(-9, k - 4); g.lineTo(9, k + 2); g.stroke(); }
      g.restore();
      gloss(g, m, -2.5, -5, 4, 2.2, 0.5, -0.4);
      g.restore();
    };
    const pepper = x => {
      const p = rr(x - 5, -11, 10, 22, 5);
      fillS(g, p, lg(g, x - 5, 0, x + 5, 0, [[0, '#2E8F1F'], [0.4, '#7DE04F'], [1, '#257A18']]), ['rgba(0,40,0,0.4)', 2, 1.4]);
      gloss(g, p, x - 1.5, -4, 1.6, 6, 0.55);
    };
    const tomato = x => {
      const p = circ(x, 0, 9);
      fillS(g, p, rg(g, x, 0, 9, [[0, '#FF7B66'], [0.7, '#E2382A'], [1, '#A81E15']], x - 3, -3), ['rgba(80,0,0,0.4)', 2, 1.4]);
      gloss(g, p, x - 3, -3.5, 3.2, 2, 0.7, -0.4);
    };
    const onion = x => {
      const p = rr(x - 4.5, -10, 9, 20, 4.5);
      fillS(g, p, lg(g, x - 4.5, 0, x + 4.5, 0, [[0, '#B677D6'], [0.5, '#F6E4FF'], [1, '#9A5BC0']]), ['rgba(40,0,60,0.35)', 2, 1.4]);
    };
    meat(-35, 0.12); pepper(-22); meat(-9, -0.08); tomato(6); meat(21, 0.1); onion(34); meat(45, -0.1);
    g.restore();
  },

  /* ─── soğuk içecek ─── */
  drink(g) {
    g.translate(0, 4);
    const cup = P('M -22.5 -18 L 22.5 -18 L 17.2 40 Q 16.6 44 12.4 44 L -12.4 44 Q -16.6 44 -17.2 40 Z');
    fillS(g, cup, lg(g, -23, 0, 23, 0, [[0, '#B0122E'], [0.22, '#FF5D70'], [0.5, '#F0364D'], [1, '#9A0F27']]), ['rgba(80,0,20,0.45)', 3.5, 2.4]);
    g.save(); g.clip(cup);
    const wv = new Path2D(); wv.moveTo(-30, 8);
    for (let x = -30; x <= 30; x += 2) wv.lineTo(x, 6 + 3.2 * Math.sin(x * 0.18));
    for (let x = 30; x >= -30; x -= 2) wv.lineTo(x, 16 + 3.2 * Math.sin(x * 0.18 + 0.6));
    wv.closePath();
    g.fillStyle = lg(g, -23, 0, 23, 0, [[0, '#D9DEE8'], [0.3, '#FFFFFF'], [1, '#C8CFDC']]); g.fill(wv);
    g.restore();
    const r = mulberry32(21); // buğu damlaları
    for (let i = 0; i < 9; i++) {
      const x = -14 + r() * 26, y = -10 + r() * 46, s = 0.8 + r() * 1.3;
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(x, y, s, s * 1.35, 0, 0, TAU); g.fill();
    }
    streak(g, cup, -14, -12, -10, 36, 2.6, 0.75);
    // pipet
    g.save(); g.translate(6, -26); g.rotate(0.38);
    const st = rr(-2.8, -26, 5.6, 30, 2.8);
    fillS(g, st, '#FFFFFF', ['rgba(0,0,0,0.25)', 1.5, 1]);
    g.save(); g.clip(st); g.fillStyle = '#FF4D5E';
    for (let y = -30; y < 6; y += 7) { g.beginPath(); g.moveTo(-4, y); g.lineTo(4, y - 3); g.lineTo(4, y + 0.5); g.lineTo(-4, y + 3.5); g.closePath(); g.fill(); }
    g.restore();
    g.restore();
    // kapak
    const lid = P('M -25.5 -18 Q -25.5 -22.5 -21 -23.5 Q 0 -32 21 -23.5 Q 25.5 -22.5 25.5 -18 Q 25.5 -14.5 21.5 -14.5 L -21.5 -14.5 Q -25.5 -14.5 -25.5 -18 Z');
    fillS(g, lid, lg(g, 0, -30, 0, -14, [[0, '#FFFFFF'], [0.6, '#E7ECF4'], [1, '#B9C4D6']]), ['rgba(0,10,40,0.35)', 2.2, 1.6]);
    gloss(g, lid, -8, -24, 10, 2, 0.8);
  },

  /* ─── patates kızartması (marka mavisi kutu) ─── */
  fries(g) {
    g.translate(0, 2);
    const sticks = [[-17, -28, -0.2], [-9, -36, -0.08], [-1, -40, 0.03], [8, -35, 0.12], [16, -27, 0.24], [-13, -18, -0.14], [4, -22, 0.06], [12, -16, 0.18], [-5, -26, -0.03]];
    for (const [x, top, a] of sticks) {
      g.save(); g.translate(x, 8); g.rotate(a);
      const s = rr(-3.4, top - 8, 6.8, 46, 2);
      fillS(g, s, lg(g, -3.4, 0, 3.4, 0, [[0, '#E9A21E'], [0.45, '#FFE27A'], [1, '#D88E12']]), ['rgba(100,50,0,0.4)', 2, 1]);
      g.fillStyle = 'rgba(170,90,10,0.35)'; g.fillRect(-3.4, top - 8, 6.8, 2.4);
      g.restore();
    }
    const box = P('M -27 -4 Q 0 7 27 -4 L 20.5 41 Q 19.8 45 15.5 45 L -15.5 45 Q -19.8 45 -20.5 41 Z');
    fillS(g, box, lg(g, -27, 0, 27, 0, [[0, '#0B4AB8'], [0.25, '#3B8BFF'], [0.55, '#1F73F0'], [1, '#0A3E9C']]), ['rgba(0,20,70,0.45)', 3.5, 2.4]);
    innerShadow(g, box, 'rgba(0,10,50,0.45)', 4, 0, -2);
    g.save(); g.clip(box); // beyaz dalga bandı
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.moveTo(-30, 22); g.bezierCurveTo(-12, 14, 8, 30, 30, 18); g.lineTo(30, 23); g.bezierCurveTo(8, 35, -12, 19, -30, 27); g.closePath(); g.fill();
    g.restore();
    streak(g, box, -15, 4, -12, 38, 2.4, 0.7);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-26, -3.2); g.quadraticCurveTo(0, 7.8, 26, -3.2); g.stroke();
  },

  /* ─── servis kapağı (cloche) ─── */
  lid(g) {
    const d = P('M -46 17 C -46 -20 -25 -37 0 -37 C 25 -37 46 -20 46 17 Z');
    fillS(g, d, lg(g, -46, 0, 46, 0, METAL), ['rgba(0,10,40,0.45)', 4, 2.5]);
    g.save(); g.clip(d);
    g.fillStyle = lg(g, 0, -37, 0, 17, [[0, 'rgba(255,255,255,0.25)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(20,35,70,0.35)']]); g.fill(d);
    glowIn(g, 38, 6, 30, 'rgba(255,190,110,0.55)'); // sıcak kenar ışığı
    glowIn(g, -40, 4, 26, 'rgba(90,150,255,0.45)'); // mavi dolgu ışığı
    g.restore();
    streak(g, d, -24, 10, -14, -26, 4.2, 0.95);
    streak(g, d, -7, -33, 14, -33, 2.4, 0.6);
    const band = rr(-48.5, 13, 97, 8, 4);
    fillS(g, band, lg(g, -48, 0, 48, 0, METAL), ['rgba(0,10,40,0.35)', 2, 1.2]);
    gloss(g, band, -16, 14.5, 18, 1.4, 0.8);
    const stem = rr(-3.2, -45, 6.4, 9, 2); fillS(g, stem, lg(g, -3, 0, 3, 0, METAL));
    const knob = ell(0, -46, 9.5, 5.2);
    fillS(g, knob, lg(g, -9.5, 0, 9.5, 0, METAL), ['rgba(0,10,40,0.35)', 2, 1.2]);
    gloss(g, knob, -3, -48, 4.5, 1.6, 0.9);
  },
  plate(g) {
    const pl = ell(0, 0, 62, 13);
    fillS(g, pl, lg(g, 0, -13, 0, 13, [[0, '#FFFFFF'], [0.6, '#E3E9F3'], [1, '#AEBBD0']]), ['rgba(0,10,40,0.45)', 6, 4]);
    const inner = ell(0, -1.5, 44, 8.5);
    g.fillStyle = lg(g, 0, -10, 0, 7, [[0, '#DCE3EE'], [1, '#FFFFFF']]); g.fill(inner);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -0.5, 60.5, 11.8, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  },

  /* ─── restoran cephesi ─── */
  store(g) {
    g.translate(0, 2);
    const side = P('M 36 -10 L 45 -16 L 45 36 L 36 42 Z');
    fillS(g, side, lg(g, 36, 0, 45, 0, [[0, '#D8BF9C'], [1, '#B79A73']]));
    const wall = rr(-37, -12, 73, 54, 3);
    fillS(g, wall, lg(g, 0, -12, 0, 42, [[0, '#FFF6E6'], [1, '#EBD3B2']]), ['rgba(60,30,0,0.35)', 4, 2.5]);
    // vitrin
    const win = rr(-29, 4, 31, 25, 3.5);
    fillS(g, win, lg(g, 0, 4, 0, 29, [[0, '#FFE9B0'], [0.55, '#FFC25C'], [1, '#FF9B2F']]));
    innerShadow(g, win, 'rgba(120,50,0,0.6)', 3, 0, 2);
    g.save(); g.clip(win); g.fillStyle = 'rgba(255,255,255,0.45)';
    g.beginPath(); g.moveTo(-26, 29); g.lineTo(-14, 4); g.lineTo(-8, 4); g.lineTo(-20, 29); g.closePath(); g.fill(); g.restore();
    g.strokeStyle = '#9C6A3A'; g.lineWidth = 2; g.stroke(win);
    g.beginPath(); g.moveTo(-13.5, 4); g.lineTo(-13.5, 29); g.stroke();
    // kapı
    const door = rr(9, 7, 20, 35, [4, 4, 0, 0]);
    fillS(g, door, lg(g, 9, 0, 29, 0, [[0, '#1F4E9E'], [0.5, '#2F6BD0'], [1, '#183F84']]));
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.roundRect(12.5, 10.5, 13, 12, 2); g.fill();
    g.fillStyle = '#FFD27A'; g.beginPath(); g.arc(25, 26, 1.6, 0, TAU); g.fill();
    // tente
    const aw = new Path2D(); aw.moveTo(-45, -27); aw.lineTo(45, -27); aw.lineTo(45, -12);
    const n = 6, sw = 90 / n;
    for (let i = n - 1; i >= 0; i--) { const cx = -45 + sw * (i + 0.5); aw.arc(cx, -12, sw / 2, 0, Math.PI); }
    aw.closePath();
    shadowed(g, 'rgba(60,20,0,0.45)', 3.5, 2.5, () => { g.fillStyle = '#fff'; g.fill(aw); });
    g.save(); g.clip(aw);
    for (let i = 0; i < n; i += 2) {
      g.fillStyle = lg(g, 0, -27, 0, -4, [[0, '#FF9A4A'], [1, '#E2560F']]);
      g.fillRect(-45 + sw * i, -30, sw, 30);
    }
    g.fillStyle = lg(g, 0, -27, 0, -4, [[0, 'rgba(255,255,255,0.35)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(80,20,0,0.25)']]); g.fill(aw);
    g.restore();
    const bar = rr(-47, -31, 94, 6, 3);
    fillS(g, bar, lg(g, 0, -31, 0, -25, [[0, '#FF8C3A'], [1, '#C8470C']]), ['rgba(60,20,0,0.35)', 2, 1]);
    // tabela
    const sign = rr(-24, -49, 48, 16, 5);
    fillS(g, sign, lg(g, 0, -49, 0, -33, [[0, '#1B3F80'], [1, '#0B2453']]), ['rgba(0,10,40,0.4)', 2.5, 1.5]);
    g.save(); g.translate(0, -41); g.scale(0.36, 0.36); forkKnife(g, '#FFD27A'); g.restore();
    gloss(g, sign, -10, -46, 10, 2, 0.5);
  },

  /* ─── teslimat motosikleti (sağa bakar) ─── */
  scooter(g) {
    g.translate(2, -2);
    const wheel = (x, y) => {
      fillS(g, circ(x, y, 12.5), lg(g, 0, y - 12, 0, y + 12, [[0, '#3A4458'], [1, '#121826']]), ['rgba(0,0,0,0.35)', 2.5, 1.6]);
      fillS(g, circ(x, y, 7), lg(g, x - 7, y - 7, x + 7, y + 7, METAL));
      g.fillStyle = '#36435C'; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 10.5, Math.PI * 1.1, Math.PI * 1.55); g.stroke();
    };
    wheel(-27, 30); wheel(29, 30);
    const blueG = (x0, y0, x1, y1) => lg(g, x0, y0, x1, y1, [[0, '#5AA0FF'], [0.45, '#1F73F0'], [1, '#0B47B5']]);
    const fork = P('M 22 -16 L 31 28 L 27 29 L 18.5 -15 Z'); fillS(g, fork, lg(g, 18, 0, 31, 0, METAL));
    const body = P('M -45 22 Q -47 7 -36 3 L -9 3 Q -1 3 2 11 L 6 22 L 17 22 Q 20 22 21 18 L 24 -12 Q 25 -18 31 -16 L 33 -14 L 28 21 Q 27 28 20 29 L -41 29 Q -45 28.5 -45 22 Z');
    fillS(g, body, blueG(0, -18, 0, 29), ['rgba(0,20,70,0.45)', 3, 2]);
    innerShadow(g, body, 'rgba(0,15,60,0.5)', 4, 0, -2);
    streak(g, body, -38, 9, -12, 8, 2.4, 0.75);
    const fender = P('M 15 24 Q 29 9 43 24 L 40 25.5 Q 29 15 18 25.5 Z'); fillS(g, fender, blueG(15, 10, 43, 26));
    const seat = rr(-37, -3.5, 27, 7.5, 3.75); fillS(g, seat, lg(g, 0, -3.5, 0, 4, [[0, '#3A4458'], [1, '#141A28']]), ['rgba(0,0,0,0.35)', 1.5, 1]);
    g.strokeStyle = '#1B2333'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(26, -16); g.lineTo(19, -22); g.stroke();
    g.strokeStyle = '#4A556B'; g.lineWidth = 4.2; g.beginPath(); g.moveTo(19, -22); g.lineTo(15, -23); g.stroke();
    // far
    fillS(g, ell(32.5, -10, 3.4, 5, -0.2), rg(g, 32.5, -10, 5, [[0, '#FFFFFF'], [0.5, '#FFE7A6'], [1, '#FFB547']]));
    // teslimat kutusu
    const box = rr(-48, -36, 36, 30, 6);
    fillS(g, box, lg(g, -48, -36, -12, -6, [[0, '#FFC768'], [0.5, '#FF9B2F'], [1, '#E2620F']]), ['rgba(80,30,0,0.45)', 3, 2]);
    innerShadow(g, box, 'rgba(110,40,0,0.5)', 3.5, 0, -1.6);
    g.fillStyle = 'rgba(120,45,0,0.35)'; g.fillRect(-48, -27, 36, 1.6);
    g.save(); g.translate(-30, -18); g.scale(0.38, 0.38); forkKnife(g, '#FFFFFF'); g.restore();
    gloss(g, box, -38, -32, 9, 2.2, 0.7);
  },

  /* ─── ev ─── */
  house(g) {
    g.translate(0, 3);
    const chim = rr(17, -36, 9, 18, 1.5); fillS(g, chim, lg(g, 17, 0, 26, 0, [[0, '#C9583A'], [1, '#9B3B22']]));
    const side = P('M 34 -4 L 44 -12 L 44 38 L 34 42 Z'); fillS(g, side, lg(g, 34, 0, 44, 0, [[0, '#E2CFB3'], [1, '#C2A986']]));
    const wall = P('M -34 -4 L 0 -30 L 34 -4 L 34 42 L -34 42 Z');
    fillS(g, wall, lg(g, 0, -30, 0, 42, [[0, '#FFF8EC'], [1, '#EEDCC0']]), ['rgba(60,30,0,0.35)', 4, 2.5]);
    for (const x of [-21, 21]) {
      const w = rr(x - 7.5, 4, 15, 14, 2.5);
      fillS(g, w, lg(g, 0, 4, 0, 18, [[0, '#FFE7A6'], [1, '#FFAA3C']]));
      innerShadow(g, w, 'rgba(120,50,0,0.5)', 2, 0, 1.4);
      g.strokeStyle = '#B88B5A'; g.lineWidth = 1.4; g.stroke(w);
      g.beginPath(); g.moveTo(x, 4); g.lineTo(x, 18); g.moveTo(x - 7.5, 11); g.lineTo(x + 7.5, 11); g.stroke();
    }
    const door = rr(-8.5, 14, 17, 28, [8.5, 8.5, 0, 0]);
    fillS(g, door, lg(g, -8, 0, 8, 0, [[0, '#1B4FAE'], [0.5, '#3B8BFF'], [1, '#163F8C']]));
    g.fillStyle = '#FFD27A'; g.beginPath(); g.arc(4.5, 29, 1.5, 0, TAU); g.fill();
    const roof = P('M -45 -1 L 0 -40 L 45 -1 L 39 4 L 0 -29.5 L -39 4 Z');
    fillS(g, roof, lg(g, 0, -40, 0, 4, [[0, '#FF8A5B'], [0.5, '#F0572E'], [1, '#B83A18']]), ['rgba(60,10,0,0.45)', 3, 2.2]);
    gloss(g, roof, -18, -20, 14, 2.4, 0.6, -0.72);
    g.fillStyle = 'rgba(80,140,40,0.9)'; // çim şeridi
    fillS(g, rr(-40, 41, 86, 5, 2.5), lg(g, 0, 41, 0, 46, [[0, '#7FD855'], [1, '#3E9A25']]));
  },

  /* ─── yemek pini (harita): marka pini + çatal-bıçak ─── */
  foodPin(g) {
    g.save(); g.scale(100 / 1024 * 0.95, 100 / 1024 * 0.95); g.translate(-512, -505);
    const SKo = SK; SK = SK * 1024 / 95;
    fillS(g, PATHS.pin, lg(g, 0, 104, 0, 914, [[0, '#4C97FF'], [0.5, '#1F73F0'], [1, '#0B4CC4']]), ['rgba(0,20,80,0.45)', 4, 3]);
    innerShadow(g, PATHS.pin, 'rgba(0,15,70,0.55)', 6, -2, -4);
    gloss(g, PATHS.pin, 380, 240, 200, 120, 0.5, -0.5);
    fillS(g, circ(512, 414, 205), lg(g, 0, 210, 0, 620, [[0, '#FFFFFF'], [1, '#E3ECFA']]), ['rgba(0,20,80,0.35)', 3, 2]);
    g.translate(512, 420); g.scale(8.4, 8.4); forkKnife(g, '#1F73F0');
    SK = SKo;
    g.restore();
  },

  /* ─── onay rozeti ─── */
  seal(g) {
    const p = new Path2D(), n = 14;
    for (let i = 0; i <= n * 8; i++) {
      const a = i / (n * 8) * TAU, r = 41 + 3.4 * Math.cos(a * n);
      i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    p.closePath();
    fillS(g, p, lg(g, -40, -40, 40, 40, [[0, '#5EEB8E'], [0.5, '#22C55E'], [1, '#0E8F3E']]), ['rgba(0,60,20,0.45)', 4, 3]);
    innerShadow(g, p, 'rgba(0,60,20,0.55)', 5, -1.5, -3);
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.stroke();
    gloss(g, p, -14, -18, 22, 12, 0.5, -0.6);
    shadowed(g, 'rgba(0,60,20,0.45)', 2, 1.6, () => {
      g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(-15, 1); g.lineTo(-4.5, 11.5); g.lineTo(16, -10); g.stroke();
    });
  },

  /* ─── teslimat poşeti (kraft) ─── */
  bag(g) {
    g.translate(0, 4);
    g.strokeStyle = lg(g, 0, -40, 0, -16, [[0, '#B98652'], [1, '#8A5A2B']]); g.lineWidth = 3.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-12, -18); g.bezierCurveTo(-12, -40, 12, -40, 12, -18); g.stroke();
    const b = P('M -30 -20 L 30 -20 L 33 40 Q 33 44 29 44 L -29 44 Q -33 44 -33 40 Z');
    fillS(g, b, lg(g, -33, 0, 33, 0, [[0, '#C9965E'], [0.3, '#EBC48E'], [0.7, '#DDAE72'], [1, '#B88349']]), ['rgba(60,30,0,0.45)', 4, 2.5]);
    g.fillStyle = 'rgba(120,70,20,0.35)'; g.fillRect(-30, -20, 60, 4);
    fillS(g, circ(0, 13, 14.5), lg(g, 0, -2, 0, 28, [[0, '#4C97FF'], [1, '#0E5FE0']]), ['rgba(0,20,70,0.35)', 2, 1.2]);
    g.save(); g.translate(0, 13); g.scale(0.5, 0.5); forkKnife(g, '#fff'); g.restore();
    streak(g, b, -22, -12, -20, 38, 2.6, 0.5);
  },
};

function glowIn(g, x, y, r, col) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// İkonu ppu (birim başına piksel) çözünürlükte sprite'a basar. blur: piksel cinsinden alan derinliği bulanıklığı
function iconSprite(name, ppu, blur = 0) {
  const pad = Math.ceil(12 * ppu + blur * 3);
  const box = Math.ceil(100 * ppu) + pad * 2;
  const c = canvas(box, box), x = c.getContext('2d');
  x.translate(box / 2, box / 2); x.scale(ppu, ppu);
  SK = ppu; ICON[name](x); SK = 1;
  c.u = ppu;
  if (blur > 0) {
    const b = canvas(box, box), bx = b.getContext('2d');
    bx.filter = `blur(${blur}px)`; bx.drawImage(c, 0, 0); b.u = ppu; return b;
  }
  return c;
}
// Çalışma anında ikon çizimi (sprite'tan)
function icon(g, name, x, y, sc, rot = 0, a = 1, variant = '') {
  sprite(g, SPR['ic_' + name + variant], x, y, sc, rot, a);
}
// Zemin gölgesi (yüzen ikonların altına)
function contactShadow(g, x, y, w, a = 0.35) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.scale(w, w * 0.18);
  g.fillStyle = rg(g, 0, 0, 1, [[0, `rgba(0,8,30,${a})`], [1, 'rgba(0,8,30,0)']]);
  g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
}

/* ─── arayüz için ince çizgi ikonlar ─── */
function micon(g, name, col, lw = 7) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  const st = () => g.stroke();
  switch (name) {
    case 'search':
      g.beginPath(); g.arc(-6, -6, 22, 0, TAU); st(); g.beginPath(); g.moveTo(11, 11); g.lineTo(30, 30); st(); break;
    case 'pin':
      g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(-8, 26, -30, 8, -30, -10); g.arc(0, -10, 30, Math.PI, 0); g.bezierCurveTo(30, 8, 8, 26, 0, 40); g.closePath(); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -10, 11, 0, TAU); g.fill(); break;
    case 'bag':
      g.beginPath(); g.roundRect(-30, -14, 60, 50, 9); st();
      g.beginPath(); g.moveTo(-13, -14); g.lineTo(-13, -20); g.quadraticCurveTo(-13, -36, 0, -36); g.quadraticCurveTo(13, -36, 13, -20); g.lineTo(13, -14); st(); break;
    case 'plus':
      g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.moveTo(0, -18); g.lineTo(0, 18); st(); break;
    case 'check':
      g.beginPath(); g.moveTo(-22, 2); g.lineTo(-7, 17); g.lineTo(23, -14); st(); break;
    case 'back':
      g.beginPath(); g.moveTo(10, -20); g.lineTo(-10, 0); g.lineTo(10, 20); st(); break;
    case 'heart':
      g.beginPath(); g.moveTo(0, 28); g.bezierCurveTo(-34, 6, -30, -26, -10, -24); g.quadraticCurveTo(-3, -23, 0, -15);
      g.quadraticCurveTo(3, -23, 10, -24); g.bezierCurveTo(30, -26, 34, 6, 0, 28); g.closePath(); st(); break;
    case 'arrow':
      g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.moveTo(4, -16); g.lineTo(20, 0); g.lineTo(4, 16); st(); break;
    case 'chev':
      g.beginPath(); g.moveTo(-12, -6); g.lineTo(0, 6); g.lineTo(12, -6); st(); break;
    case 'down':
      g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 14); g.moveTo(-14, 2); g.lineTo(0, 16); g.lineTo(14, 2); st();
      g.beginPath(); g.moveTo(-22, 26); g.lineTo(22, 26); st(); break;
    case 'star':
      g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 26; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fill(); break;
  }
}
function miconAt(g, name, x, y, size, col, lw = 7, rot = 0) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(size / 100, size / 100); micon(g, name, col, lw); g.restore();
}

/* ───────────── logo ───────────── */
// Pin + saat işareti (assets/yakinla-logo-mark.svg ile birebir). o: grow, ring, face, hands, am, ah, glint
function drawLogo(g, x, y, size, o = {}) {
  const k = size / 1024;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-512, -512);
  const grow = o.grow == null ? 1 : o.grow;
  if (grow > 0.001) {
    g.save();
    g.translate(512, 905); g.scale(grow, grow); g.translate(-512, -905);
    const pg = g.createLinearGradient(0, 104, 0, 914);
    pg.addColorStop(0, '#3B8BFF'); pg.addColorStop(0.5, '#1F73F0'); pg.addColorStop(1, '#0E5FE0');
    g.shadowColor = 'rgba(0,30,90,0.28)'; g.shadowBlur = 40 * k * grow; g.shadowOffsetY = 18 * k * grow;
    g.fillStyle = pg; g.fill(PATHS.pin);
    g.shadowColor = 'transparent';
    const hl = g.createRadialGradient(358, 256, 0, 358, 256, 614);
    hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(0.6, 'rgba(255,255,255,0.05)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fill(PATHS.pin);
    const ring = o.ring == null ? 1 : o.ring;
    if (ring > 0) {
      g.strokeStyle = '#0E5FE0'; g.lineWidth = 22; g.lineCap = 'round';
      g.beginPath(); g.arc(512, 414, 197, -Math.PI / 2, -Math.PI / 2 + TAU * ring); g.stroke();
    }
    const face = o.face == null ? 1 : o.face;
    if (face > 0) {
      const fg = g.createLinearGradient(0, 228, 0, 600);
      fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(1, '#EFF4FA');
      g.fillStyle = fg; g.beginPath(); g.arc(512, 414, 186 * face, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(14,95,224,0.12)'; g.lineWidth = 6; g.beginPath(); g.arc(512, 418, 180 * face, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    }
    const hands = o.hands == null ? 1 : o.hands;
    if (hands > 0) {
      const hg = g.createLinearGradient(0, 246, 0, 430);
      hg.addColorStop(0, '#2A7CF0'); hg.addColorStop(1, '#0E5FE0');
      g.fillStyle = hg;
      g.save(); g.translate(512, 414); g.rotate(o.am || 0); g.scale(hands, hands);
      g.beginPath(); g.roundRect(-14, -168, 28, 180, 14); g.fill(); g.restore();
      g.save(); g.translate(512, 414); g.rotate(o.ah || 0); g.scale(hands, hands);
      g.beginPath(); g.roundRect(-4, -14, 160, 28, 14); g.fill(); g.restore();
      g.fillStyle = '#0E5FE0'; g.beginPath(); g.arc(512, 414, 20 * hands, 0, TAU); g.fill();
      g.fillStyle = '#3B8BFF'; g.beginPath(); g.arc(512, 414, 10 * hands, 0, TAU); g.fill();
    }
    if (o.glint != null && o.glint > -0.3 && o.glint < 1.3) {
      g.save(); g.clip(PATHS.pin);
      const gx = lerp(100, 924, o.glint);
      const gg = g.createLinearGradient(gx - 140, 0, gx + 140, 0);
      gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gg; g.setTransform(g.getTransform().multiply(new DOMMatrix().translate(gx, 500).skewX(-22).translate(-gx, -500)));
      g.fillRect(gx - 140, 0, 280, 1024);
      g.restore();
    }
    g.restore();
  }
  g.restore();
}
