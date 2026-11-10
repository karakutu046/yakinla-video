'use strict';
/* Adıyörem Çiğ Köfte — şube tanıtım filmi (9:16, 1080×1920, 30 fps)
 *
 * Görüntüler şubenin kendi fotoğraf ve videolarıdır: hazirla.py onları build/medya'ya
 * kırpar, renklerini düzeltir ve build/plan.json'u yazar. Bu dosya üstlerine kurguyu
 * (geçişler, yavaş yakınlaşma ve kayma), yazıları, köşe logosunu ve şube kapanış kartını çizer.
 *
 * draw(g, t) zamanın saf fonksiyonudur. renderFrame(f) bir kareyi birkaç alt-örnekle
 * (180° obtüratör) çizip ortalar; hızlı geçişlerde alt-örnek sayısı artar.
 *
 * Sahne alanları (sahneler.json):
 *   medya, bas, sure, hiz, yerlesim (kirp | bulanik), odak [x, y], zoom [z0, z1], kay [dx, dy],
 *   gecis (kes | flas | kay | dikey | zoom | solma | daire), yon (1 | -1),
 *   yazi { satirlar [], vurgu [], vurgu2 [], t, zaman [], konum (alt | orta | ust), boyut, bitis }
 *   tip: "kapanis" → şube kartı (arka: isteğe bağlı bulanık arka plan medyası)
 */

const W = 1080, H = 1920, FPS = 30, TAU = Math.PI * 2;
const SHUTTER = 0.5;
const GECIS = { kes: 0, flas: 0.24, kay: 0.34, dikey: 0.34, zoom: 0.4, solma: 0.5, daire: 0.55 };

/* ───────────────────────── yardımcılar ───────────────────────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outQuad: x => 1 - (1 - x) * (1 - x),
  inCubic: x => x * x * x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outQuart: x => 1 - Math.pow(1 - x, 4),
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: x => { const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
};
const spring = (dt, f = 2.0, d = 7.5) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * TAU * dt);
const kick = (dt, d = 8) => dt <= 0 ? 0 : Math.exp(-d * dt);
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgba = (h, a = 1) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function setFont(g, o) { g.font = `${o.w || 900} ${o.s}px ${o.f || 'Disp'}`; g.letterSpacing = (o.ls || 0) + 'px'; }
function measure(g, s, o) { setFont(g, o); const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; }
function fit(g, s, o, maxW) { const w = measure(g, s, o); return w > maxW ? { ...o, s: o.s * maxW / w } : o; }
function text(g, s, x, y, o) {
  setFont(g, o);
  g.textAlign = o.a || 'center'; g.textBaseline = o.b || 'alphabetic';
  g.fillStyle = o.c || '#fff';
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
}
function rrect(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function shadow(g, a = 0.45, blur = 22, oy = 6) { g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = oy; }
function noShadow(g) { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; }

// Material Icons (Apache 2.0): konum ve telefon
const ICON = {
  pin: new Path2D('M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'),
  tel: new Path2D('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'),
};
function icon(g, name, x, y, s, color) {
  g.save(); g.translate(x - s / 2, y - s / 2); g.scale(s / 24, s / 24);
  g.fillStyle = color; g.fill(ICON[name], 'evenodd'); g.restore();
}
function clockIcon(g, x, y, s, color) {
  g.save(); g.strokeStyle = color; g.lineWidth = s * 0.11; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, s * 0.4, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x, y - s * 0.22); g.lineTo(x, y); g.lineTo(x + s * 0.16, y + s * 0.1); g.stroke();
  g.restore();
}

/* ───────────────────────── plan ve zaman çizelgesi ───────────────────────── */
let P = null, C = null, SC = [], DUR = 0, FRAMES = 0, PAD = 0.5, KAPANIS = null;

function setup(plan) {
  P = plan; PAD = P.pad ?? 0.5;
  C = { ana: '#D32F2F', koyu: '#7A1010', krem: '#FFF3E0', yesil: '#3E8E3A', ...(P.renk || {}) };
  let t = 0;
  SC = P.sahneler.map((s, i) => {
    const o = { ...s, i, t0: t, t1: t + s.sure };
    t += s.sure;
    o.gecis = i === 0 ? null : (s.gecis || 'kes');
    o.gd = o.gecis ? (s.gecis_sure ?? GECIS[o.gecis] ?? 0) : 0;
    return o;
  });
  DUR = P.sure || t;
  FRAMES = Math.round(DUR * FPS);
  KAPANIS = SC.find(s => s.tip === 'kapanis') || null;
}

// t anında hangi sahne(ler) görünür; geçişin ortasında a → b, p ∈ [0, 1]
function state(t) {
  let i = SC.findIndex(s => t < s.t1);
  if (i < 0) i = SC.length - 1;
  const s = SC[i];
  if (i > 0 && s.gd > 0 && t < s.t0 + s.gd / 2) return { a: SC[i - 1], b: s, p: (t - s.t0 + s.gd / 2) / s.gd, typ: s.gecis };
  const n = SC[i + 1];
  if (n && n.gd > 0 && t >= n.t0 - n.gd / 2) return { a: s, b: n, p: (t - n.t0 + n.gd / 2) / n.gd, typ: n.gecis };
  return { a: s, b: null, p: 0, typ: null };
}

/* ───────────────────────── görüntü önbelleği ───────────────────────── */
const PEND = new Map(), IMG = new Map();
function loadImg(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Görsel yüklenemedi: ' + url));
    im.src = url;
  });
}
async function ensure(urls) {
  await Promise.all(urls.map(async u => {
    if (IMG.has(u)) return;
    if (!PEND.has(u)) PEND.set(u, loadImg(u).then(im => im.decode().then(() => im)));
    IMG.set(u, await PEND.get(u));
    PEND.delete(u);
  }));
  if (IMG.size > 160) {
    const keep = new Set(urls);
    for (const k of IMG.keys()) { if (IMG.size <= 100) break; if (!keep.has(k) && k !== P.logo?.url) IMG.delete(k); }
  }
}
const img = u => IMG.get(u);

function mediaUrl(s, t, kind) {
  const m = s.m;
  if (!m) return null;
  if (m.tip === 'foto') return `${m.dir}/${kind}.jpg`;
  const i = clamp(Math.round((t - s.t0 - m.u0) * FPS), 0, m.n - 1);
  return `${m.dir}/${kind}_${String(i).padStart(4, '0')}.jpg`;
}
function sceneUrls(s, t, L) {
  if (!s.m) return;
  if (s.m.bg) L.push(mediaUrl(s, t, 'b'));
  if (!s.m.yalniz_bg) L.push(mediaUrl(s, t, 'f'));
}
function urlsAt(t) {
  const st = state(t), L = [];
  sceneUrls(st.a, t, L);
  if (st.b) sceneUrls(st.b, t, L);
  if (P.logo) L.push(P.logo.url);
  return L;
}

/* ───────────────────────── medya ───────────────────────── */
function drawMedia(g, s, t) {
  const m = s.m, u = t - s.t0;
  const pp = clamp((u + PAD) / (s.sure + 2 * PAD));
  const zz = s.zoom || [1, 1.08];
  // kesme geçişlerinde yeni planın ilk anında hafif "punch-in"
  const punch = (s.gecis === 'kes' || s.gecis === 'flas') ? 1 + 0.045 * kick(u, 7) : 1;
  const z = lerp(zz[0], zz[1], E.inOutSine(pp)) * punch;
  if (m.yerlesim === 'bulanik') {
    const bg = img(mediaUrl(s, t, 'b'));
    const k = 1.08 + 0.04 * pp;
    g.drawImage(bg, W / 2 - W * k / 2, H / 2 - H * k / 2, W * k, H * k);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 0, W, H);
    const fg = img(mediaUrl(s, t, 'f'));
    const fw = W * z, fh = fg.height * fw / fg.width;
    const yc = H * (0.5 + (s.dikey_konum || 0)) + (s.kay ? (pp - 0.5) * s.kay[1] * H : 0);
    const xc = W / 2 + (s.kay ? (pp - 0.5) * s.kay[0] * W : 0);
    g.save(); shadow(g, 0.5, 40, 0); g.fillStyle = '#000';
    g.fillRect(xc - fw / 2 + 4, yc - fh / 2 + 4, fw - 8, fh - 8); g.restore();
    g.drawImage(fg, xc - fw / 2, yc - fh / 2, fw, fh);
    return;
  }
  const im = img(mediaUrl(s, t, 'f'));
  const vw = im.width / z, vh = im.height / z;
  const kay = s.kay || [0, 0];
  const cx = clamp(m.odak[0] + (pp - 0.5) * kay[0] * vw, vw / 2, im.width - vw / 2);
  const cy = clamp(m.odak[1] + (pp - 0.5) * kay[1] * vh, vh / 2, im.height - vh / 2);
  g.drawImage(im, cx - vw / 2, cy - vh / 2, vw, vh, 0, 0, W, H);
}

const SPR = {};
function initSprites(g) {
  const v = g.createRadialGradient(W / 2, H * 0.48, W * 0.45, W / 2, H * 0.5, H * 0.66);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.42)');
  SPR.vig = v;
  const a = g.createLinearGradient(0, H * 0.5, 0, H);
  a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(0.55, 'rgba(0,0,0,0.42)'); a.addColorStop(1, 'rgba(0,0,0,0.62)');
  SPR.alt = a;
  const u = g.createLinearGradient(0, 0, 0, H * 0.42);
  u.addColorStop(0, 'rgba(0,0,0,0.6)'); u.addColorStop(0.6, 'rgba(0,0,0,0.3)'); u.addColorStop(1, 'rgba(0,0,0,0)');
  SPR.ust = u;
  const o = g.createLinearGradient(0, H * 0.25, 0, H * 0.75);
  o.addColorStop(0, 'rgba(0,0,0,0)'); o.addColorStop(0.5, 'rgba(0,0,0,0.38)'); o.addColorStop(1, 'rgba(0,0,0,0)');
  SPR.orta = o;
  const top = g.createLinearGradient(0, 0, 0, 420);
  top.addColorStop(0, 'rgba(0,0,0,0.35)'); top.addColorStop(1, 'rgba(0,0,0,0)');
  SPR.top = top;
}

/* ───────────────────────── yazılar ───────────────────────── */
function lineTimes(s) {
  const y = s.yazi, n = y.satirlar.length;
  return y.satirlar.map((_, j) => s.t0 + (y.zaman ? y.zaman[j] : (y.t ?? 0.2) + j * (y.ara ?? 0.14)));
}
function captionLayout(g, s) {
  if (s._lay) return s._lay;
  const y = s.yazi, base = y.boyut || 112;
  const lines = y.satirlar.map((txt, j) => {
    const vurgu = (y.vurgu || []).includes(j), vurgu2 = (y.vurgu2 || []).includes(j);
    const size = base * (vurgu || vurgu2 ? 1.0 : (y.kucuk || []).includes(j) ? 0.62 : 0.86);
    const o = fit(g, txt, { s: size, w: 900, ls: -1 }, vurgu || vurgu2 ? 860 : 940);
    return { txt, o, vurgu, vurgu2, w: measure(g, txt, o), h: o.s * (vurgu || vurgu2 ? 1.28 : 1.06) };
  });
  const total = lines.reduce((a, l) => a + l.h, 0) + (lines.length - 1) * 10;
  const konum = y.konum || 'alt';
  let top = konum === 'alt' ? 1480 - total : konum === 'ust' ? 330 : H / 2 - total / 2;
  for (const l of lines) { l.y = top; top += l.h + 10; }
  return (s._lay = { lines, konum });
}
function drawCaption(g, s, t) {
  if (!s.yazi) return;
  const lay = captionLayout(g, s), times = lineTimes(s);
  const end = s.t0 + (s.yazi.bitis ?? s.sure - 0.18);
  lay.lines.forEach((l, j) => {
    const tj = times[j];
    if (t < tj - 0.06) return;
    const e = spring(t - tj, 1.7, 8);
    const out = E.inOutCubic(prog(t, end - 0.04 * (lay.lines.length - 1 - j), end + 0.2 - 0.04 * (lay.lines.length - 1 - j)));
    if (out >= 1) return;
    const al = clamp((t - tj + 0.06) / 0.12) * (1 - out);
    const dy = (1 - e) * 70 - out * 40;
    const cx = W / 2, cyTop = l.y + dy;
    g.save();
    g.globalAlpha = al;
    if (l.vurgu || l.vurgu2) {
      const bw = l.w + 64, bh = l.h;
      const wipe = E.outExpo(prog(t, tj - 0.08, tj + 0.3));
      g.save(); shadow(g, 0.35, 26, 8);
      g.fillStyle = l.vurgu ? C.ana : C.krem;
      rrect(g, cx - bw / 2, cyTop, bw * wipe, bh, 22); g.fill(); g.restore();
      g.beginPath(); g.rect(cx - bw / 2, cyTop - 20, bw * wipe, bh + 40); g.clip();
      const sc = lerp(0.82, 1, e);
      g.translate(cx, cyTop + bh * 0.5); g.scale(sc, sc);
      text(g, l.txt, 0, l.o.s * 0.36, { ...l.o, c: l.vurgu ? '#fff' : C.ana });
    } else {
      const sc = lerp(0.88, 1, e);
      g.translate(cx, cyTop + l.h * 0.78); g.scale(sc, sc);
      shadow(g, 0.55, 24, 5);
      text(g, l.txt, 0, 0, { ...l.o, c: '#fff' });
    }
    g.restore();
  });
}

/* ───────────────────────── sahne ───────────────────────── */
function drawScene(g, s, t) {
  if (s.tip === 'kapanis') return drawKapanis(g, s, t);
  if (s.m) drawMedia(g, s, t);
  else { g.fillStyle = C.koyu; g.fillRect(0, 0, W, H); }
  g.fillStyle = SPR.vig; g.fillRect(0, 0, W, H);
  if (P.logo?.kose) { g.fillStyle = SPR.top; g.fillRect(0, 0, W, 420); }
  if (s.yazi) {
    const k = s.yazi.konum || 'alt';
    const lt = lineTimes(s)[0];
    const end = s.t0 + (s.yazi.bitis ?? s.sure - 0.18);
    const a = clamp((t - lt + 0.3) / 0.35) * (1 - prog(t, end, end + 0.3));
    if (a > 0) {
      g.globalAlpha = a;
      if (k === 'alt') { g.fillStyle = SPR.alt; g.fillRect(0, H * 0.5, W, H * 0.5); }
      else if (k === 'ust') { g.fillStyle = SPR.ust; g.fillRect(0, 0, W, H * 0.42); }
      else { g.fillStyle = SPR.orta; g.fillRect(0, H * 0.25, W, H * 0.5); }
      g.globalAlpha = 1;
    }
    drawCaption(g, s, t);
  }
}

/* ───────────────────────── köşe logosu ───────────────────────── */
function drawBug(g, t) {
  if (!P.logo?.kose) return;
  const k = KAPANIS ? KAPANIS.t0 : DUR;
  const a = E.outCubic(prog(t, 0.5, 0.9)) * (1 - prog(t, k - 0.3, k));
  if (a <= 0) return;
  const lg = img(P.logo.url);
  const lh = 78, lw = Math.min(300, lg.width * lh / lg.height);
  const lh2 = lg.height * lw / lg.width;
  const x = 58, y = 196, pw = lw + 40, ph = lh2 + 28;
  g.save();
  g.globalAlpha = a;
  g.translate(0, (1 - a) * -20);
  shadow(g, 0.3, 18, 4);
  g.fillStyle = 'rgba(255,255,255,0.94)';
  rrect(g, x, y, pw, ph, ph / 2.6); g.fill();
  noShadow(g);
  g.drawImage(lg, x + 20, y + 14, lw, lh2);
  g.restore();
}

/* ───────────────────────── kapanış kartı ───────────────────────── */
function drawKapanis(g, s, t) {
  const u = t - s.t0, K = P.sube || {};
  // arka plan: markanın kırmızısı; varsa bulanık bir plan, renk filtresiyle
  if (s.m) {
    const bg = img(mediaUrl(s, t, 'b'));
    const k = 1.1 + 0.03 * u;
    g.drawImage(bg, W / 2 - W * k / 2, H / 2 - H * k / 2, W * k, H * k);
    g.fillStyle = rgba(C.ana, 0.84); g.fillRect(0, 0, W, H);
  } else {
    g.fillStyle = C.ana; g.fillRect(0, 0, W, H);
  }
  const rg = g.createRadialGradient(W / 2, H * 0.36, 80, W / 2, H * 0.5, H * 0.75);
  rg.addColorStop(0, 'rgba(255,255,255,0.16)'); rg.addColorStop(0.5, 'rgba(0,0,0,0)'); rg.addColorStop(1, rgba(C.koyu, 0.75));
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // ince nokta deseni, yavaşça kayar
  g.save(); g.globalAlpha = 0.07; g.fillStyle = '#fff';
  const off = (u * 14) % 60;
  for (let y = -60; y < H + 60; y += 60) for (let x = (y / 60) % 2 ? 30 : 0; x < W + 60; x += 60) {
    g.beginPath(); g.arc(x - off, y + off, 3.2, 0, TAU); g.fill();
  }
  g.restore();

  // logo kartı
  let y = 0;
  if (P.logo) {
    const lg = img(P.logo.url);
    const maxW = 700, maxH = 290;
    const sc0 = Math.min(maxW / lg.width, maxH / lg.height);
    const lw = lg.width * sc0, lh = lg.height * sc0;
    const cw = lw + 110, ch = lh + 90, cy = 340 + ch / 2;
    const e = spring(u - 0.15, 1.5, 7);
    const float = Math.sin(Math.max(0, u - 1.5) * 1.6) * 6;
    g.save();
    g.translate(W / 2, cy + float);
    g.scale(lerp(0.55, 1, e), lerp(0.55, 1, e));
    g.rotate((1 - e) * -0.08);
    g.globalAlpha = clamp((u - 0.12) / 0.12);
    shadow(g, 0.35, 50, 18);
    g.fillStyle = '#fff'; rrect(g, -cw / 2, -ch / 2, cw, ch, 44); g.fill();
    noShadow(g);
    g.drawImage(lg, -lw / 2, -lh / 2, lw, lh);
    // parıltı
    const sh = prog(u, 1.9, 2.6);
    if (sh > 0 && sh < 1) {
      g.save(); rrect(g, -cw / 2, -ch / 2, cw, ch, 44); g.clip();
      const x = lerp(-cw, cw, E.inOutSine(sh));
      const lgr = g.createLinearGradient(x - 120, 0, x + 120, 0);
      lgr.addColorStop(0, 'rgba(255,255,255,0)'); lgr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); lgr.addColorStop(1, 'rgba(255,255,255,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = lgr; g.rotate(-0.25); g.fillRect(-cw, -ch * 1.5, cw * 2, ch * 3);
      g.restore();
    }
    g.restore();
    y = 340 + ch + 175;
  } else {
    y = 640;
  }

  // şube adı
  const appear = (t0, dy = 50) => { const e = spring(u - t0, 1.6, 8); return { a: clamp((u - t0) / 0.15), dy: (1 - e) * dy, e }; };
  if (K.ust) {
    const A = appear(0.42);
    g.save(); g.globalAlpha = A.a * 0.92;
    text(g, K.ust, W / 2, y - 96 + A.dy, fit(g, K.ust, { s: 40, w: 700, f: 'Txt', ls: 6 }, 900));
    g.restore();
  }
  if (K.ad) {
    const A = appear(0.55);
    g.save(); g.globalAlpha = A.a; shadow(g, 0.3, 16, 4);
    text(g, K.ad, W / 2, y + A.dy, fit(g, K.ad, { s: 92, w: 900, ls: -1 }, 940));
    g.restore();
    const lw = 560 * E.outExpo(prog(u, 0.75, 1.25));
    g.fillStyle = rgba(C.krem, 0.85); g.fillRect(W / 2 - lw / 2, y + 34, lw, 5);
  }
  y += 120;
  // adres satırları
  const adres = [].concat(K.adres || []);
  adres.forEach((ln, j) => {
    const A = appear(0.85 + j * 0.1, 30);
    g.save(); g.globalAlpha = A.a;
    const o = fit(g, ln, { s: 44, w: 600, f: 'Txt' }, 880);
    const tw = measure(g, ln, o);
    if (j === 0) icon(g, 'pin', W / 2 - tw / 2 - 34, y - 15 + A.dy, 48, C.krem);
    text(g, ln, W / 2 + (j === 0 ? 18 : 0), y + A.dy, { ...o, c: '#fff' });
    g.restore();
    y += 58;
  });
  if (K.saat) {
    const A = appear(0.85 + adres.length * 0.1, 30);
    g.save(); g.globalAlpha = A.a;
    const o = fit(g, K.saat, { s: 42, w: 600, f: 'Txt' }, 860);
    const tw = measure(g, K.saat, o);
    clockIcon(g, W / 2 - tw / 2 - 30, y - 15 + A.dy, 40, C.krem);
    text(g, K.saat, W / 2 + 16, y + A.dy, { ...o, c: '#fff' });
    g.restore();
    y += 58;
  }
  y += 50;
  // telefon: en büyük çağrı
  if (K.telefon) {
    const A = appear(1.15, 40);
    const o = fit(g, K.telefon, { s: 68, w: 800 }, 700);
    const tw = measure(g, K.telefon, o);
    const pw = tw + 190, ph = 124;
    const pulse = 1 + 0.025 * Math.sin(Math.max(0, u - 2) * 5);
    g.save(); g.globalAlpha = A.a;
    g.translate(W / 2, y + A.dy); g.scale(lerp(0.7, 1, A.e) * pulse, lerp(0.7, 1, A.e) * pulse);
    shadow(g, 0.35, 30, 10);
    g.fillStyle = C.krem; rrect(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fill(); noShadow(g);
    g.fillStyle = C.ana; g.beginPath(); g.arc(-pw / 2 + 66, 0, 44, 0, TAU); g.fill();
    icon(g, 'tel', -pw / 2 + 66, 0, 52, '#fff');
    text(g, K.telefon, -pw / 2 + 126, o.s * 0.36, { ...o, a: 'left', c: C.ana });
    g.restore();
    y += ph / 2 + 60;
  }
  // sipariş kanalları (yalnızca yazı; üçüncü taraf logosu yok)
  const kanal = K.siparis || [];
  if (kanal.length) {
    const A0 = appear(1.45, 20);
    g.save(); g.globalAlpha = A0.a * 0.9;
    text(g, K.siparis_baslik || 'ONLİNE SİPARİŞ', W / 2, y + 12 + A0.dy, { s: 32, w: 700, f: 'Txt', ls: 5, c: C.krem });
    g.restore();
    y += 46;
    const co = { s: 36, w: 700, f: 'Txt' };
    const ws = kanal.map(k => measure(g, k, co) + 46);
    const rows = [[]]; let rw = 0;
    ws.forEach((w, j) => { if (rw + w > 990 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(j); rw += w + 16; });
    rows.forEach(r => {
      const tot = r.reduce((a, j) => a + ws[j], 0) + (r.length - 1) * 16;
      let x = W / 2 - tot / 2;
      r.forEach(j => {
        const A = appear(1.55 + j * 0.08, 30);
        g.save(); g.globalAlpha = A.a; g.translate(0, A.dy);
        g.fillStyle = 'rgba(255,255,255,0.14)'; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3;
        rrect(g, x, y, ws[j], 72, 36); g.fill(); g.stroke();
        text(g, kanal[j], x + ws[j] / 2, y + 48, { ...co, c: '#fff' });
        g.restore();
        x += ws[j] + 16;
      });
      y += 88;
    });
  }
  // slogan
  if (K.slogan) {
    const A = appear(1.9, 40);
    const yy = Math.max(y + 80, 1450);
    g.save(); g.globalAlpha = A.a; shadow(g, 0.3, 18, 5);
    g.translate(W / 2, yy + A.dy); g.scale(lerp(0.85, 1, A.e), lerp(0.85, 1, A.e));
    text(g, K.slogan, 0, 0, { ...fit(g, K.slogan, { s: 76, w: 900, ls: -1 }, 960), c: C.krem });
    g.restore();
  }
}

/* ───────────────────────── kompozisyon ───────────────────────── */
let BA, BB, ga, gb;
function draw(g, t) {
  const st = state(t);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (!st.b) {
    drawScene(g, st.a, t);
  } else {
    const p = clamp(st.p);
    const typ = st.typ;
    if (typ === 'kes' || typ === 'flas') {
      drawScene(g, p < 0.5 ? st.a : st.b, t);
      if (typ === 'flas') { g.fillStyle = `rgba(255,250,240,${0.9 * Math.pow(1 - Math.abs(p - 0.5) * 2, 1.6)})`; g.fillRect(0, 0, W, H); }
    } else {
      ga.setTransform(1, 0, 0, 1, 0, 0); gb.setTransform(1, 0, 0, 1, 0, 0);
      drawScene(ga, st.a, t); drawScene(gb, st.b, t);
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const dir = st.b.yon || 1;
      if (typ === 'solma') {
        g.drawImage(BA, 0, 0); g.globalAlpha = E.inOutSine(p); g.drawImage(BB, 0, 0); g.globalAlpha = 1;
      } else if (typ === 'kay' || typ === 'dikey') {
        const e = E.inOutCubic(p), hor = typ === 'kay';
        const dx = hor ? W * dir : 0, dy = hor ? 0 : H * dir;
        g.drawImage(BA, -e * dx, -e * dy);
        g.drawImage(BB, (1 - e) * dx, (1 - e) * dy);
      } else if (typ === 'zoom') {
        const z = p < 0.5 ? 1 + 0.9 * E.inCubic(p * 2) : 1 + 0.45 * (1 - E.outCubic((p - 0.5) * 2));
        const src = p < 0.5 ? BA : BB;
        g.drawImage(src, W / 2 - W * z / 2, H / 2 - H * z / 2, W * z, H * z);
        g.fillStyle = `rgba(255,255,255,${0.35 * Math.pow(1 - Math.abs(p - 0.5) * 2, 2)})`; g.fillRect(0, 0, W, H);
      } else if (typ === 'daire') {
        g.drawImage(BA, 0, 0);
        const e = E.inOutCubic(p), r = e * Math.hypot(W, H) * 0.62;
        g.save(); g.beginPath(); g.arc(W / 2, H * 0.4, r, 0, TAU); g.clip(); g.drawImage(BB, 0, 0); g.restore();
        g.strokeStyle = rgba(C.krem, 0.9 * (1 - e)); g.lineWidth = 26 * (1 - e) + 2;
        g.beginPath(); g.arc(W / 2, H * 0.4, r, 0, TAU); g.stroke();
      }
    }
  }
  drawBug(g, t);
}

/* ───────────────────────── efekt ipuçları ───────────────────────── */
function buildCues() {
  const q = [];
  const cue = (t, type, o = {}) => { if (t >= 0 && t < DUR) q.push({ t: +t.toFixed(3), type, ...o }); };
  SC.forEach((s, i) => {
    if (i > 0) {
      const T = s.t0, d = s.gd;
      if (s.gecis === 'kes') cue(T, 'thump', { gain: 0.35 });
      if (s.gecis === 'flas') { cue(T - 0.3, 'reverse', { dur: 0.3, gain: 0.35 }); cue(T, 'impact', { gain: 0.45 }); }
      if (s.gecis === 'kay' || s.gecis === 'dikey') cue(T - d / 2 - 0.04, 'whoosh', { dur: d + 0.14, gain: 0.5, pan: s.gecis === 'kay' ? 0.3 * (s.yon || 1) : 0 });
      if (s.gecis === 'zoom') { cue(T - d / 2, 'whoosh', { dur: d, f0: 300, f1: 7000, gain: 0.5 }); cue(T, 'thump', { gain: 0.35 }); }
      if (s.gecis === 'daire') cue(T - d / 2, 'whoosh', { dur: d + 0.1, f0: 250, f1: 3500, gain: 0.45 });
    }
    if (s.yazi) lineTimes(s).forEach((tj, j) => {
      const v = (s.yazi.vurgu || []).includes(j) || (s.yazi.vurgu2 || []).includes(j);
      if (v) cue(tj - 0.08, 'whoosh', { dur: 0.22, f0: 1500, f1: 7000, gain: 0.22 });
      cue(tj, 'pop', { pitch: 0.9 + j * 0.15, gain: 0.3 });
    });
    if (s.tip === 'kapanis') {
      const T = s.t0, K = P.sube || {};
      cue(T + 0.15, 'impact', { big: true, gain: 0.6 });
      cue(T + 0.2, 'sparkle', { dur: 1.0, gain: 0.25 });
      if (K.ad) cue(T + 0.55, 'pop', { pitch: 1.0, gain: 0.3 });
      [].concat(K.adres || []).forEach((_, j) => cue(T + 0.85 + j * 0.1, 'tick', { gain: 0.25, pitch: 1 + j * 0.1 }));
      if (K.telefon) cue(T + 1.15, 'pop', { pitch: 1.3, gain: 0.4 });
      (K.siparis || []).forEach((_, j) => cue(T + 1.55 + j * 0.08, 'tick', { pitch: 1.2 + j * 0.12, gain: 0.25 }));
      if (K.slogan) cue(T + 1.9, 'whoosh', { dur: 0.3, f0: 800, f1: 5000, gain: 0.25 });
      cue(T + 1.9, 'shimmer', { dur: 0.7, gain: 0.25 });
    }
  });
  const dogal = SC.filter(s => s.m && s.m.ses).map(s => ({ t: +(s.t0 + s.m.ses.u0).toFixed(3), dosya: s.m.ses.dosya, kazanc: s.m.ses.kazanc, a: s.t0 - Math.min(s.gd, 0.3) / 2, b: s.t1 + 0.15 }));
  return { cues: q.sort((a, b) => a.t - b.t), dogal };
}

/* ───────────────────────── başlatma ve kare üretimi ───────────────────────── */
const main = document.getElementById('c');
const ctx = main.getContext('2d');
let off, g;

function inTransition(t) { const st = state(t); return st.b && st.typ !== 'kes' && st.typ !== 'solma'; }

async function renderFrame(f) {
  const t = f / FPS;
  const fast = inTransition(t) || inTransition(t + 0.5 / FPS) || inTransition(t - 0.5 / FPS);
  const S = fast ? 10 : 3, sh = fast ? 0.9 : SHUTTER;
  const ts = [...Array(S).keys()].map(s => clamp(t + ((s + 0.5) / S - 0.5) * sh / FPS, 0, DUR - 1e-4));
  await ensure([...new Set(ts.flatMap(urlsAt))]);
  ts.forEach((tt, s) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    draw(g, tt);
    ctx.globalAlpha = 1 / (s + 1);
    ctx.drawImage(off, 0, 0);
  });
  ctx.globalAlpha = 1;
}
async function renderAt(t) {
  await ensure(urlsAt(t));
  g.setTransform(1, 0, 0, 1, 0, 0); draw(g, t); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0);
}

window.READY = (async () => {
  const plan = await (await fetch('build/plan.json', { cache: 'no-store' })).json();
  setup(plan);
  await Promise.all(['900 100px Disp', '800 100px Disp', '700 100px Disp', '700 40px Txt', '600 40px Txt', '500 40px Txt']
    .map(f => document.fonts.load(f, 'AaŞİığüçöĞÜ0123')));
  off = canvas(W, H); g = off.getContext('2d');
  BA = canvas(W, H); ga = BA.getContext('2d');
  BB = canvas(W, H); gb = BB.getContext('2d');
  initSprites(g);
  const cues = buildCues();
  window.INFO = { fps: FPS, frames: FRAMES, dur: DUR, kapanis: KAPANIS ? KAPANIS.t0 : null, ...cues,
    dis_ses: P.dis_ses || null, sahneler: SC.map(s => ({ t0: s.t0, t1: s.t1, gecis: s.gecis, yazi: s.yazi?.satirlar })) };
  window.FRAMES = FRAMES; window.FPS = FPS; window.DUR = DUR;
  window.renderFrame = renderFrame; window.renderAt = renderAt;
  const qs = new URLSearchParams(location.search);
  if (qs.has('t')) await renderAt(+qs.get('t'));
  if (qs.has('play')) {
    document.body.classList.add('preview');
    const t0 = performance.now();
    let busy = false;
    const loop = async () => {
      if (!busy) { busy = true; await renderAt(((performance.now() - t0) / 1000) % DUR); busy = false; }
      requestAnimationFrame(loop);
    };
    loop();
  }
  return true;
})();
