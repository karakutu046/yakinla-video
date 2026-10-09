'use strict';
/* Supabase — 45 s launch film (16:9, 1920×1080, 60 fps)
 *
 * The page is a DOM stage; renderAt(t) puts every element in its state at time t,
 * so a frame is a pure function of time and the renderer can take sub-frame samples
 * for real motion blur. All screenshots, logos, icons, illustrations and copy come
 * from Supabase's public website source (see assets/SOURCES.md).
 *
 * Timeline (120 BPM: 1 beat = 0.5 s, 1 bar = 2 s; every cut lands on a bar line)
 *   0–4    Hook       six product tiles pop on the beat, "Your entire backend, in one place."
 *   4–8    Logo       bolt halves lock together, wordmark, "The Postgres development platform."
 *   8–12   Database   Table Editor rises in 3D, callouts, row highlight
 *   12–16  SQL + AI   prompt types, AI answer streams in, Run, results
 *   16–20  Auth       sign-in screen, 12 login providers burst out on 16th notes
 *   20–28  Montage    Storage · Edge Functions · Realtime · Vector (one bar each)
 *   28–32  Wall       3D wall of 25 real feature screens, "And so much more."
 *   32–36  Proof      44,000,000+ databases, 200,000+ a day, customer logos
 *   36–40  Tagline    "Build in a weekend / Scale to millions"
 *   40–45  End card   logo lock-up, Start your project (click), supabase.com
 */

const W = 1920, H = 1080, FPS = 60, DUR = 45;
const TAU = Math.PI * 2;

// ───────────────────────── math ─────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const P = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  i2: x => x * x, i3: x => x ** 3, i4: x => x ** 4,
  o2: x => 1 - (1 - x) ** 2, o3: x => 1 - (1 - x) ** 3, o4: x => 1 - (1 - x) ** 4, o5: x => 1 - (1 - x) ** 5,
  io2: x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2,
  io3: x => x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2,
  io4: x => x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2,
  oexp: x => x >= 1 ? 1 : 1 - 2 ** (-10 * x),
  back: x => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2,
};
// K(t, [t0, v0], [t1, v1, ease], …): piecewise keyframes, each segment eased by its end key
function K(t, ...keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = E.io3] = keys[i];
    if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, e(P(t, t0, t1))); }
  }
  return keys[keys.length - 1][1];
}
// decaying impulse after t0 (flashes, glows, shakes)
const pulse = (t, t0, k = 6) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let r = Math.imul(seed ^ seed >>> 15, 1 | seed);
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

// ───────────────────────── DOM helpers ─────────────────────────
const NS = 'http://www.w3.org/2000/svg';
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style') el.style.cssText = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) el.append(k);
  return el;
}
// cached style writes: only touch the DOM when a value changes
function S(el, o) {
  const c = el._c || (el._c = {});
  for (const k in o) {
    const v = o[k];
    if (c[k] !== v) { c[k] = v; el.style[k] = v; }
  }
}
function A(el, k, v) {
  const c = el._a || (el._a = {});
  if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); }
}
const f2 = v => (Math.abs(v) < 1e-4 ? 0 : +v.toFixed(2));
const f4 = v => +v.toFixed(4);
function T({ x = 0, y = 0, z = 0, s = 1, rx = 0, ry = 0, rz = 0 } = {}) {
  let r = z || rx || ry ? `translate3d(${f2(x)}px,${f2(y)}px,${f2(z)}px)` : `translate(${f2(x)}px,${f2(y)}px)`;
  if (rx) r += ` rotateX(${f4(rx)}deg)`;
  if (ry) r += ` rotateY(${f4(ry)}deg)`;
  if (rz) r += ` rotate(${f4(rz)}deg)`;
  if (s !== 1) r += ` scale(${f4(s)})`;
  return r;
}
const blur = v => (v > 0.05 ? `blur(${f2(v)}px)` : 'none');
const op = v => String(f4(clamp(v)));

// "Write SQL.\n*Or just ask.*" → one span per word, *…* in brand gradient
function text(cls, str, style = '') {
  const el = h('div', { class: cls, style });
  el.words = [];
  str.split('\n').forEach((line, li) => {
    if (li) el.append(h('br'));
    let hl = false;
    const ws = line.split(' ');
    ws.forEach((w, wi) => {
      let on = hl;
      if (w.startsWith('*')) { on = hl = true; w = w.slice(1); }
      if (w.endsWith('*')) { w = w.slice(0, -1); hl = false; }
      const sp = h('span', { class: 'w' + (on ? ' hl' : '') }, w + (wi < ws.length - 1 ? ' ' : ''));
      sp.line = li;
      el.append(sp);
      el.words.push(sp);
    });
  });
  return el;
}
// soft rise + blur-in, and the matching exit. starts: number (stagger from t0) or array.
function words(t, list, tin, tout = 1e9, { st = 0.055, d = 0.75, dy = 0.45, bl = 14, lineGap = 0, outDy = -0.35 } = {}) {
  list.forEach((w, i) => {
    const s0 = Array.isArray(tin) ? tin[w.line] + i * st : tin + i * st + (w.line || 0) * lineGap;
    const pi = E.o4(P(t, s0, s0 + d));
    const po = E.i2(P(t, tout + i * 0.02, tout + i * 0.02 + 0.32));
    S(w, {
      transform: `translateY(${f4((1 - pi) * dy + po * outDy)}em)`,
      opacity: op(pi * (1 - po)),
      filter: blur((1 - pi) * bl + po * bl),
    });
  });
}

// ───────────────────────── stage & cues ─────────────────────────
const stage = document.getElementById('stage');
const CUES = [];
const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(4), type, ...o });
const scenes = [];
const imgs = [];
const img = (src, attrs = {}) => { const i = h('img', { src, ...attrs }); imgs.push(i); return i; };
let ICONS = {}, WORDMARK = null, CURSOR_PATH = '';

function scene(t0, t1, build) {
  const el = h('div', { class: 'scene' });
  layers.scenes.append(el);
  const update = build(el);
  scenes.push({ t0, t1, el, update, on: null });
}

const icon = (name, sw = 1.5) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="${ICONS[name]}"/></svg>`;
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const POINTER = '<svg viewBox="0 0 28 28"><path d="M7 3.6v19.6l4.7-4.5 3.2 7.2 3.5-1.5-3.2-7h6.7z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';

function chip(label, cls = '') {
  return h('div', { class: 'chip ' + cls, html: `${CHECK}<span>${label}</span>` });
}
function popChip(t, el, t0, base = '', amp = 4, i = 0) {
  const a = E.back(P(t, t0, t0 + 0.5));
  const fl = Math.sin((t - t0) * 2.2 + i * 1.7) * amp * P(t, t0, t0 + 0.6);
  S(el, {
    transform: `${base} translateY(${f2((1 - E.o4(P(t, t0, t0 + 0.5))) * 34 + fl)}px) scale(${f4(0.6 + 0.4 * a)})`,
    opacity: op(P(t, t0, t0 + 0.14)),
  });
}
// browser-framed screenshot
function browser(src, width, url) {
  const w = h('div', { class: 'win', style: `width:${width}px` });
  const shot = h('div', { class: 'shot' });
  w.append(h('div', { class: 'bar', html: `<i></i><i></i><i></i><div class="url">${url}</div>` }), shot);
  shot.append(img(src));
  w.shot = shot;
  return w;
}
// rectangle in screenshot pixel space → % box inside .shot
function box(iw, ih, x0, y0, x1, y1, style = '') {
  return h('div', { class: 'abs', style: `left:${x0 / iw * 100}%;top:${y0 / ih * 100}%;width:${(x1 - x0) / iw * 100}%;height:${(y1 - y0) / ih * 100}%;${style}` });
}

// ───────────────────────── layers ─────────────────────────
const layers = {};
function buildLayers() {
  const L = (id, cls = 'layer') => (layers[id] = stage.appendChild(h('div', { id, class: cls })));
  L('back');
  layers.back.append(layers.glow = h('div', { id: 'glow' }), layers.grid = h('div', { id: 'grid' }));
  L('shake');
  layers.shake.append(layers.scenes = h('div', { class: 'layer' }));
  L('wipe'); L('flash'); L('grain'); L('vignette'); L('fade');
  // film grain: one seeded noise tile, shifted every frame
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d'), id = g.createImageData(256, 256), r = rng(11);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 128 + (r() + r() + r() - 1.5) * 150;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  layers.grain.style.backgroundImage = `url(${c.toDataURL()})`;
}

// ───────────────────────── logo (from the official wordmark SVG) ─────────────────────────
let logoN = 0;
function logo(parent) {
  const n = ++logoN;
  const src = WORDMARK;
  const paths = [...src.querySelectorAll('path')];
  const letters = paths.filter(p => p.getAttribute('fill') === 'white');
  const [b1, b2, a] = paths.filter(p => p.getAttribute('fill') !== 'white');
  const defs = src.querySelector('defs').outerHTML.replace(/paint(\d)_linear/g, `p$1_${n}`);
  const fix = p => p.outerHTML.replace(/paint(\d)_linear/g, `p$1_${n}`);
  const root = h('div', { class: 'layer' });
  const glow = h('div', { class: 'abs', style: 'width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(closest-side,rgba(62,207,142,.35),rgba(62,207,142,.08) 50%,transparent)' });
  const rings = [0, 1].map(() => h('div', { class: 'ring', style: 'width:200px;height:200px;margin:-100px 0 0 -100px' }));
  const r = rng(40 + n);
  const sparks = Array.from({ length: 30 }, () => {
    const s = 3 + r() * 6;
    const el = h('div', { class: 'spark', style: `width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px` });
    el.ang = r() * TAU; el.dist = 180 + r() * 420; el.dl = r() * 0.08;
    return el;
  });
  // icon: base size ×3 so heavy zooms stay sharp
  const B = 3;
  const iconBox = h('div', { class: 'abs', style: `left:0;top:0;width:${109 * B}px;height:${113 * B}px;transform-origin:0 0` });
  iconBox.innerHTML = `<svg viewBox="0 0 109 113" width="${109 * B}" height="${113 * B}" overflow="visible">${defs}<g class="pa">${fix(a)}</g><g class="pb">${fix(b1)}${fix(b2)}</g></svg>`;
  const lettersBox = h('div', { class: 'abs', style: `left:0;top:0;width:${581 * 2}px;height:${113 * 2}px;transform-origin:0 0` });
  lettersBox.innerHTML = `<svg viewBox="0 0 581 113" width="${581 * 2}" height="${113 * 2}" overflow="visible">${letters.map(p => `<g>${p.outerHTML}</g>`).join('')}</svg>`;
  root.append(glow, ...rings, ...sparks, iconBox, lettersBox);
  parent.append(root);
  const pa = iconBox.querySelector('.pa'), pb = iconBox.querySelector('.pb');
  const lg = [...lettersBox.querySelectorAll('g')];
  return {
    root,
    /* icon centre (ix, iy) at scale ik; lock-up anchored by its centre (lx, ly) at scale lk */
    set({ ix, iy, ik, lx, ly, lk, aOff = [0, 0, 0], bOff = [0, 0, 0], partsOp = 1, letterP = [], impact = -1, t = 0, glowK = 0 }) {
      S(iconBox, { transform: `translate(${f2(ix - 54.5 * ik)}px,${f2(iy - 56.5 * ik)}px) scale(${f4(ik / B)})`, opacity: op(partsOp) });
      A(pa, 'transform', `translate(${f2(aOff[0])} ${f2(aOff[1])}) rotate(${f2(aOff[2])} 30 40)`);
      A(pb, 'transform', `translate(${f2(bOff[0])} ${f2(bOff[1])}) rotate(${f2(bOff[2])} 80 75)`);
      const left = lx - 290.5 * lk, top = ly - 56.5 * lk;
      S(lettersBox, { transform: `translate(${f2(left)}px,${f2(top)}px) scale(${f4(lk / 2)})` });
      lg.forEach((g, i) => {
        const p = letterP[i] ?? 0;
        A(g, 'transform', `translate(0 ${f2((1 - p) * 70)})`);
        A(g, 'opacity', f4(clamp(p)));
      });
      S(glow, { transform: `translate(${f2(ix)}px,${f2(iy)}px) scale(${f4(0.6 + 0.5 * glowK)})`, opacity: op(glowK) });
      const dt = t - impact;
      rings.forEach((rg, k) => {
        const p = P(dt, 0.04 * k, 0.9 + 0.2 * k);
        S(rg, { transform: `translate(${f2(ix)}px,${f2(iy)}px) scale(${f4(0.4 + E.o3(p) * (3.6 + k * 1.6))})`, opacity: op(impact < 0 || dt < 0 ? 0 : (1 - p) * (k ? 0.5 : 0.9)), borderWidth: `${f2(3 - 2 * p)}px` });
      });
      sparks.forEach(sp => {
        const p = P(dt, sp.dl, sp.dl + 1.1);
        const d = E.o4(p) * sp.dist;
        S(sp, { transform: `translate(${f2(ix + Math.cos(sp.ang) * d)}px,${f2(iy + Math.sin(sp.ang) * d)}px) scale(${f4(1 - p * 0.6)})`, opacity: op(impact < 0 || dt < 0 ? 0 : (1 - p) ** 1.5) });
      });
    },
  };
}

// ───────────────────────── scenes ─────────────────────────
function buildScenes() {
  const PRODUCTS = [
    ['database', 'Database', 'Fully portable Postgres database'],
    ['authentication', 'Authentication', 'User Management out of the box'],
    ['storage', 'Storage', 'Serverless storage for any media'],
    ['functions', 'Edge Functions', 'Deploy code globally on the edge'],
    ['realtime', 'Realtime', 'Synchronize and broadcast events'],
    ['vector', 'Vector', 'AI toolkit to manage embeddings'],
  ];

  // ── 1. Hook ───────────────────────────────────────────
  scene(0, 4.05, el => {
    const cam = h('div', { class: 'layer', style: 'perspective:1700px;perspective-origin:50% 45%' });
    const GW = 3 * 460 + 2 * 24, GT = 526;
    const grid = h('div', { class: 'abs', style: `left:${(W - GW) / 2}px;top:${GT}px;width:${GW}px;height:280px;transform-style:preserve-3d;transform-origin:50% 50%` });
    const tiles = PRODUCTS.map(([k, name, desc], i) => {
      const el = h('div', { class: 'tile', html: `<div class="ib">${icon(k, 1.6)}</div><div><div class="nm">${name}</div><div class="ds">${desc}</div></div><div class="edge"></div>` });
      el.x = (i % 3) * 484; el.y = Math.floor(i / 3) * 152;
      el.t0 = 0.25 + i * 0.25;
      el.path = el.querySelector('path');
      el.edge = el.querySelector('.edge');
      cue(el.t0, 'pop', { note: i, pan: ((i % 3) - 1) * 0.5 });
      grid.append(el);
      return el;
    });
    const head = text('head center abs', 'Your entire backend,\n*in one place.*', 'font-size:98px;top:262px');
    cam.append(grid);
    el.append(cam, head);
    cue(1.75, 'tick'); cue(2.25, 'tick', { gain: 0.8 });
    cue(3.38, 'suck');
    return t => {
      const shift = K(t, [1.6, -126], [2.35, 0, E.io4]);
      S(grid, { transform: T({ y: shift, rx: K(t, [0, 26], [3.4, 7, E.o2]), s: K(t, [0, 0.9], [3.4, 1, E.o2]) }) });
      tiles.forEach((tl, i) => {
        const p = E.o4(P(t, tl.t0, tl.t0 + 0.7)), a = E.back(P(t, tl.t0, tl.t0 + 0.55));
        const c0 = 3.36 + i * 0.035, q = E.i3(P(t, c0, c0 + 0.44));
        const cx = (W - GW) / 2 + tl.x + 230, cy = GT + shift + tl.y + 64;
        S(tl, {
          transform: T({ x: tl.x + (W / 2 - cx) * q, y: tl.y + (1 - p) * 70 + (540 - cy) * q, z: (1 - p) * -300, rx: (1 - p) * -60, rz: (i % 2 ? 1 : -1) * 38 * q, s: (0.72 + 0.28 * a) * (1 - 0.88 * q) }),
          opacity: op(P(t, tl.t0, tl.t0 + 0.16) * (1 - E.i2(P(t, c0 + 0.2, c0 + 0.44)))),
          filter: blur(q * 10),
        });
        S(tl.edge, { opacity: op(pulse(t, tl.t0, 3.2) * P(t, tl.t0, tl.t0 + 0.06)) });
        S(tl.path, { strokeDasharray: '1', strokeDashoffset: String(f4(1 - E.io2(P(t, tl.t0 + 0.05, tl.t0 + 0.75)))) });
      });
      words(t, head.words, [1.75, 2.25], 3.3, { st: 0.06 });
    };
  });

  // ── 2. Logo ───────────────────────────────────────────
  scene(3.68, 8.02, el => {
    const zoom = h('div', { class: 'layer', style: 'transform-origin:0 0' });
    el.append(zoom);
    const L = logo(zoom);
    const tag = text('sub center abs', 'The Postgres development platform.', 'font-size:44px;top:600px;color:#b4b4b4;letter-spacing:-.01em');
    zoom.append(tag);
    cue(3.7, 'swish', { pan: -0.7 }); cue(3.72, 'swish', { pan: 0.7 });
    cue(4.0, 'impact');
    cue(4.62, 'shimmer');
    cue(5.05, 'tick', { gain: 0.6 });
    cue(7.42, 'zoom');
    const LX = 960, LY = 470, LK = 1.3;
    const Q = [LX - 290.5 * LK + 30 * LK, LY - 56.5 * LK + 50 * LK]; // a point inside the green half
    return t => {
      const fly = E.i3(P(t, 3.7, 4.0));
      const punch = t >= 4 ? 1 + 0.14 * Math.exp(-(t - 4) * 7) * Math.cos((t - 4) * 24) : 1;
      const m = E.io4(P(t, 4.26, 4.76));
      const ik = lerp(2.3, LK, m) * punch;
      const lockIx = LX - 290.5 * LK + 54.5 * LK;
      L.set({
        t, impact: 4.0,
        ix: lerp(960, lockIx, m), iy: LY, ik,
        lx: LX, ly: LY, lk: LK,
        aOff: [(1 - fly) * -260, (1 - fly) * -200, (1 - fly) * -40],
        bOff: [(1 - fly) * 260, (1 - fly) * 200, (1 - fly) * -40],
        partsOp: P(t, 3.7, 3.78),
        letterP: Array.from({ length: 8 }, (_, i) => E.o4(P(t, 4.62 + i * 0.045, 5.22 + i * 0.045)) * (1 - P(t, 7.5, 7.7))),
        glowK: P(t, 3.9, 4.0) * (0.55 + 0.45 * pulse(t, 4.0, 2.5)) * (1 - P(t, 7.7, 7.95)),
      });
      words(t, tag.words, 5.05, 7.42, { st: 0.05 });
      // slow push-in, then zoom through the green half of the bolt
      const push = K(t, [5.0, 1], [7.42, 1.045, E.lin]);
      const z = E.i4(P(t, 7.42, 7.98));
      const s = push * (1 + 32 * z);
      const qx = 960 + (Q[0] - 960) * push, qy = 520 + (Q[1] - 520) * push;
      const tx = lerp(qx, 960, E.io2(z)), ty = lerp(qy, 540, E.io2(z));
      S(zoom, { transform: `translate(${f2(tx)}px,${f2(ty)}px) scale(${f4(s)}) translate(${f2(-Q[0])}px,${f2(-Q[1])}px)` });
    };
  });

  // ── 3. Database ───────────────────────────────────────
  scene(7.99, 12.14, el => {
    const label = h('div', { class: 'label center abs', style: 'top:116px', html: '<span class="dot"></span>Database' });
    const head = text('head center abs', 'A full *Postgres* database.', 'font-size:90px;top:152px');
    const sub = text('sub center abs', 'The world\'s most trusted relational database, in every project.', 'top:264px');
    const cam = h('div', { class: 'layer', style: 'perspective:2300px;perspective-origin:960px 180px' });
    const plane = h('div', { class: 'abs', style: 'left:210px;top:352px;width:1500px;height:885px;transform-style:preserve-3d;transform-origin:50% 0' });
    const win = browser('assets/shots/table-editor.png', 1500, 'supabase.com/dashboard/project/editor');
    win.style.position = 'absolute';
    const row = box(2418, 1362, 466, 186, 2418, 238.6, 'background:rgba(62,207,142,.13);box-shadow:inset 3px 0 0 #3ecf8e, 0 0 30px rgba(62,207,142,.15)');
    win.shot.append(row);
    const chips = [
      ['Full CRUD', 'left:-70px;top:150px', 9.3],
      ['Easy as a spreadsheet', 'right:-90px;top:250px', 9.55],
      ['Foreign tables', 'left:-40px;top:470px', 9.8],
      ['Partitioned tables', 'right:-50px;top:570px', 10.05],
    ].map(([l, pos, t0], i) => {
      const c = chip(l);
      c.style.cssText += pos;
      c.t0 = t0;
      cue(t0, 'blip', { pan: pos.startsWith('left') ? -0.5 : 0.5, note: i });
      return c;
    });
    plane.append(win, ...chips);
    cam.append(plane);
    el.append(cam, label, head, sub);
    cue(8.12, 'rise');
    for (let i = 1; i <= 6; i++) cue(10.0 + i * 0.25, 'tick', { gain: 0.35, pan: 0.2 });
    cue(11.8, 'whip', { pan: -0.3 });
    return t => {
      const e = E.o4(P(t, 8.12, 9.25)), d = E.io2(P(t, 9.25, 12.2));
      S(plane, {
        transform: T({ y: lerp(780, 0, e) - 150 * d, rx: lerp(50, 16, e) - 12 * d, s: lerp(0.9, 1, e) + 0.16 * d }),
        opacity: op(P(t, 8.1, 8.3)),
      });
      let idx = 0;
      for (let i = 1; i <= 6; i++) idx += E.io3(P(t, 10.0 + i * 0.25 - 0.12, 10.0 + i * 0.25));
      S(row, { top: `${(186 + idx * 52.6) / 1362 * 100}%`, opacity: op(P(t, 9.85, 10.0)) });
      chips.forEach((c, i) => popChip(t, c, c.t0, 'translateZ(90px)', 5, i));
      S(label, { opacity: op(P(t, 8.25, 8.5)), transform: `translateY(${f2((1 - E.o4(P(t, 8.25, 8.8))) * 16)}px)` });
      words(t, head.words, 8.3, 1e9, { st: 0.05 });
      words(t, sub.words, 8.6, 1e9, { st: 0.025, bl: 8, dy: 0.6 });
      S(el, { transform: T({ x: -2300 * E.i3(P(t, 11.82, 12.12)) }) });
    };
  });

  // ── 4. SQL Editor + AI Assistant ──────────────────────
  scene(11.84, 16.14, el => {
    const IW = 2418, IH = 1362;
    const cam = h('div', { class: 'layer', style: 'perspective:2400px;perspective-origin:900px 540px' });
    const plane = h('div', { class: 'abs', style: 'left:-1000px;top:-62px;width:2100px;height:1223px;transform-origin:100% 50%' });
    const win = browser('assets/shots/sql-editor.png', 2100, 'supabase.com/dashboard/project/sql');
    win.style.position = 'absolute';
    const BG = 'background:#171717';
    const prompt = box(IW, IH, 1662, 482, 2110, 527, BG);
    const caret = h('div', { class: 'abs', style: 'left:0;top:18%;width:3px;height:64%;background:#3ecf8e;box-shadow:0 0 8px #3ecf8e' });
    prompt.append(caret);
    const reply = box(IW, IH, 1645, 567, 2412, 1045, BG);
    const results = box(IW, IH, 466, 915, 1594, 1362, BG);
    const runRing = box(IW, IH, 1502, 863, 1623, 901, 'border:3px solid #3ecf8e;border-radius:10px;box-shadow:0 0 24px rgba(62,207,142,.6)');
    const cursor = h('div', { class: 'cursor', html: POINTER, style: 'left:0;top:0' });
    win.shot.append(prompt, reply, results, runRing, cursor);
    plane.append(win);
    cam.append(plane);
    const label = h('div', { class: 'label abs', style: 'left:1300px;top:318px', html: '<span class="dot"></span>SQL Editor + AI' });
    const head = text('head abs', 'Write SQL.\n*Or just ask.*', 'left:1300px;top:362px;font-size:86px');
    const sub = text('sub abs', 'Describe what you need in plain\nEnglish. The AI Assistant writes\nthe query.', 'left:1300px;top:560px;font-size:27px');
    el.append(cam, label, head, sub);

    const PROMPT_N = 'select countries that start with the letter S'.length;
    const T_TYPE = [12.62, 13.38];
    for (let i = 0; i < PROMPT_N; i += 2) cue(lerp(T_TYPE[0], T_TYPE[1], i / PROMPT_N), 'key', { pan: 0.15, v: i });
    const STOPS = [567, 610, 662, 700, 778, 805, 832, 860, 887, 914, 960, 1005, 1045];
    const T_REPLY = 13.5, T_STEP = 0.07;
    STOPS.forEach((_, i) => i && cue(T_REPLY + i * T_STEP, 'tick', { gain: 0.3, pan: 0.25 }));
    const ROWS = [966, 1019, 1071, 1124, 1176, 1229, 1282, 1362];
    cue(14.46, 'click', { pan: 0.1 });
    ROWS.forEach((_, i) => i && cue(14.55 + i * 0.06, 'tick', { gain: 0.25, pan: -0.1 }));
    cue(15.8, 'whoosh');
    return t => {
      const e = E.o3(P(t, 11.86, 12.32)), d = E.io2(P(t, 12.3, 16.0));
      S(plane, { transform: T({ x: 2300 * (1 - e) - 30 * d, ry: lerp(-40, -12, e) + 4 * d, rx: 2, s: 1 + 0.08 * d }) });
      // prompt types in (cover slides right, quantised per character)
      const n = Math.floor(P(t, ...T_TYPE) * PROMPT_N);
      S(prompt, { left: `${(1669 + (2070 - 1669) * n / PROMPT_N) / IW * 100}%`, width: `${(2110 - 1669 - (2070 - 1669) * n / PROMPT_N) / IW * 100}%` });
      S(caret, { opacity: op(t > 12.45 && t < 13.55 ? (Math.floor(t * 4) % 2 || (t > T_TYPE[0] && t < T_TYPE[1]) ? 1 : 0) : 0) });
      // AI answer streams in line by line
      let y = STOPS[0];
      for (let i = 1; i < STOPS.length; i++) y = lerp(y, STOPS[i], E.o3(P(t, T_REPLY + (i - 1) * T_STEP, T_REPLY + i * T_STEP)));
      S(reply, { top: `${y / IH * 100}%`, height: `${(1045 - y) / IH * 100}%` });
      // cursor glides to Run, clicks, results appear row by row
      const c = E.io3(P(t, 14.0, 14.42));
      const cx = lerp(1990, 1585, c) + Math.sin(c * Math.PI) * -40, cy = lerp(1180, 892, c);
      S(cursor, { left: `${cx / IW * 100}%`, top: `${cy / IH * 100}%`, opacity: op(P(t, 13.95, 14.05)), transform: `scale(${f4(1 - 0.16 * Math.sin(Math.PI * P(t, 14.42, 14.56)))})` });
      const rp = P(t, 14.46, 15.2);
      S(runRing, { opacity: op(t < 14.46 ? 0 : (1 - rp) * 0.9), transform: `scale(${f4(1 + E.o3(rp) * 0.5)})` });
      let ry = ROWS[0];
      for (let i = 1; i < ROWS.length; i++) ry = lerp(ry, ROWS[i], E.o3(P(t, 14.55 + (i - 1) * 0.06, 14.55 + i * 0.06)));
      S(results, { top: `${ry / IH * 100}%`, height: `${(1362 - ry) / IH * 100}%` });
      S(label, { opacity: op(P(t, 12.2, 12.45)), transform: `translateY(${f2((1 - E.o4(P(t, 12.2, 12.7))) * 16)}px)` });
      words(t, head.words, [12.25, 12.55], 1e9, { st: 0.06 });
      words(t, sub.words, 12.7, 1e9, { st: 0.02, bl: 8, dy: 0.6 });
      const x = E.i2(P(t, 15.82, 16.12));
      S(el, { transform: `scale(${f4(1 + 0.2 * x)})`, filter: blur(x * 18), opacity: op(1 - x) });
    };
  });

  // ── 5. Auth ───────────────────────────────────────────
  scene(15.9, 20.42, el => {
    const CX = 1370, CY = 540;
    const pic = img('assets/product/auth.png', { class: 'abs', style: `left:${CX - 410}px;top:${CY - 321}px;width:820px` });
    const PROV = ['google', 'github', 'apple', 'discord', 'slack', 'spotify', 'microsoft', 'twitch', 'gitlab', 'bitbucket', 'twitter', 'facebook'];
    const provs = PROV.map((p, i) => {
      const c = h('div', { class: 'provider' });
      c.append(img(`assets/providers/${p}.svg`));
      c.t0 = 16.45 + i * 0.125;
      cue(c.t0, 'pluck', { note: i, pan: Math.cos(-Math.PI / 2 + i * TAU / 12) * 0.6 });
      return c;
    });
    const label = h('div', { class: 'label abs', style: 'left:120px;top:286px', html: '<span class="dot"></span>Authentication' });
    const head = text('head abs', 'User auth,\n*out of the box.*', 'left:120px;top:330px;font-size:92px');
    const sub = text('sub abs', 'Add sign ups and logins, and secure\nyour data with Row Level Security.', 'left:120px;top:540px');
    const chips = ['20+ third-party logins', 'Magic links', 'Row Level Security'].map((l, i) => {
      const c = chip(l, 'sm');
      c.style.cssText += ['left:120px;top:668px', 'left:438px;top:668px', 'left:120px;top:728px'][i];
      c.t0 = 17.7 + i * 0.15;
      cue(c.t0, 'blip', { pan: -0.5, note: i + 2 });
      return c;
    });
    el.append(pic, ...provs, label, head, sub, ...chips);
    return t => {
      const e = E.o3(P(t, 15.95, 16.5));
      S(pic, { transform: `scale(${f4(lerp(0.86, 1, e) + 0.03 * E.io2(P(t, 16.5, 20.4)))})`, opacity: op(e), filter: blur((1 - e) * 16) });
      const rot = 14 * E.io2(P(t, 16.4, 20.4));
      provs.forEach((c, i) => {
        const p = E.o4(P(t, c.t0, c.t0 + 0.6)), a = E.back(P(t, c.t0, c.t0 + 0.5));
        const ang = (-90 + i * 30 + rot) * Math.PI / 180;
        const x = CX + Math.cos(ang) * 520 * p, y = CY + Math.sin(ang) * 420 * p + Math.sin(t * 2 + i) * 4 * p;
        S(c, { transform: `translate(${f2(x)}px,${f2(y)}px) scale(${f4(0.3 + 0.7 * a)})`, opacity: op(P(t, c.t0, c.t0 + 0.08)) });
      });
      S(label, { opacity: op(P(t, 16.15, 16.4)), transform: `translateY(${f2((1 - E.o4(P(t, 16.15, 16.6))) * 16)}px)` });
      words(t, head.words, [16.2, 16.5], 1e9, { st: 0.06 });
      words(t, sub.words, 16.75, 1e9, { st: 0.025, bl: 8, dy: 0.6 });
      chips.forEach((c, i) => popChip(t, c, c.t0, '', 0, i));
      under(el, t, 19.88);
    };
  });

  // montage card: slides up over the previous scene, which sinks back
  function cardIn(el, t, T0) {
    const p = E.o4(P(t, T0, T0 + 0.5));
    S(el, { transform: T({ y: (1 - p) * 1120 }), borderRadius: `${f2(40 * (1 - p))}px` });
  }
  function under(el, t, T0) {
    const q = E.io2(P(t, T0, T0 + 0.5));
    if (q > 0) S(el, { transform: `scale(${f4(1 - 0.07 * q)})`, opacity: op(1 - 0.75 * q) });
  }
  function panel(el, gx = 1300, gy = 560) {
    const p = h('div', { class: 'panel' });
    p.append(h('div', { class: 'pglow', style: `left:${gx - 650}px;top:${gy - 450}px` }), h('div', { class: 'pgrid' }));
    el.append(p);
    el.style.boxShadow = '0 -30px 80px rgba(0,0,0,.6)';
    el.style.borderTop = '1px solid rgba(255,255,255,.08)';
    return p;
  }
  function sideText(el, lbl, headStr, subStr, T0, size = 86) {
    const label = h('div', { class: 'label abs', style: 'left:120px;top:330px', html: `<span class="dot"></span>${lbl}` });
    const head = text('head abs', headStr, `left:120px;top:374px;font-size:${size}px`);
    const sub = text('sub abs', subStr, `left:120px;top:${374 + size * 2.04 + 30}px`);
    el.append(label, head, sub);
    return t => {
      S(label, { opacity: op(P(t, T0 + 0.12, T0 + 0.32)), transform: `translateY(${f2((1 - E.o4(P(t, T0 + 0.12, T0 + 0.6))) * 16)}px)` });
      words(t, head.words, [T0 + 0.16, T0 + 0.4], 1e9, { st: 0.05 });
      words(t, sub.words, T0 + 0.5, 1e9, { st: 0.02, bl: 8, dy: 0.6 });
    };
  }

  // ── 6. Storage ────────────────────────────────────────
  scene(19.88, 22.42, el => {
    panel(el);
    const tx = sideText(el, 'Storage', 'Store, organize\n*and serve files.*', 'Large files, from videos to images.', 19.88);
    const pic = img('assets/product/storage.png', { class: 'abs', style: 'left:880px;top:168px;width:960px' });
    const toast = h('div', { class: 'toast', style: 'left:850px;top:830px', html: `<div class="row"><span style="color:#3ecf8e;width:22px;height:22px;display:block">${icon('storage', 1.8)}</span><span>texture.png</span><span class="meta">0%</span></div><div class="track"><div class="fill"></div></div>` });
    const meta = toast.querySelector('.meta'), fill = toast.querySelector('.fill');
    el.append(pic, toast);
    cue(19.88, 'swoosh'); cue(20.35, 'blip', { note: 1, pan: 0.2 }); cue(21.25, 'ding', { pan: 0.2 });
    return t => {
      cardIn(el, t, 19.88);
      tx(t);
      const e = E.o4(P(t, 20.0, 20.7));
      S(pic, { transform: T({ x: (1 - e) * 120 + -20 * P(t, 20.7, 22.4), y: 0 }), opacity: op(e) });
      popChip(t, toast, 20.35, '', 3, 0);
      const pr = E.io2(P(t, 20.45, 21.25));
      S(fill, { width: `${f2(pr * 100)}%` });
      const done = t >= 21.25;
      const txt = done ? 'Uploaded' : `${Math.round(pr * 100)}%`;
      if (meta._t !== txt) { meta._t = txt; meta.textContent = txt; meta.style.color = done ? '#3ecf8e' : ''; }
      under(el, t, 21.88);
    };
  });

  // ── 7. Edge Functions ─────────────────────────────────
  scene(21.88, 24.42, el => {
    panel(el, 1300, 900);
    const tx = sideText(el, 'Edge Functions', 'Deploy code\n*globally.*', 'Write custom code without\ndeploying or scaling servers.', 21.88);
    const GX = 1320, GY = 1050, GR = 640;
    const globe = img('assets/product/globe.png', { class: 'abs', style: `left:${GX - GR}px;top:${GY - GR}px;width:${GR * 2}px` });
    const arcsSvg = document.createElementNS(NS, 'svg');
    arcsSvg.setAttribute('class', 'abs');
    arcsSvg.setAttribute('style', 'left:0;top:0;width:1920px;height:1080px;overflow:visible');
    const PTS = [[930, 760], [1120, 560], [1420, 500], [1660, 610], [1820, 820], [1250, 820], [1530, 760]];
    const ARCS = [[0, 2, 22.3], [5, 3, 22.45], [1, 4, 22.6], [6, 0, 22.75], [2, 4, 22.9], [3, 1, 23.05]];
    const arcs = ARCS.map(([a, b, t0]) => {
      const [x0, y0] = PTS[a], [x1, y1] = PTS[b];
      const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - Math.abs(x1 - x0) * 0.32;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`);
      p.setAttribute('pathLength', '1');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#3ecf8e');
      p.setAttribute('stroke-width', '2.5');
      p.setAttribute('stroke-linecap', 'round');
      p.style.filter = 'drop-shadow(0 0 6px rgba(62,207,142,.8))';
      p.t0 = t0;
      arcsSvg.append(p);
      return p;
    });
    const dots = PTS.map(([x, y]) => {
      const d = h('div', { class: 'abs', style: `left:${x - 7}px;top:${y - 7}px;width:14px;height:14px;border-radius:50%;background:#3ecf8e;box-shadow:0 0 16px #3ecf8e` });
      const r = h('div', { class: 'ring', style: `left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;border-width:2px` });
      el.append(d, r);
      d.ring = r;
      return d;
    });
    el.insertBefore(globe, el.children[1]);
    el.insertBefore(arcsSvg, el.children[2]);
    const term = h('div', { class: 'card', style: 'left:840px;top:250px;width:760px;padding:0' });
    term.innerHTML = '<div style="height:44px;display:flex;align-items:center;gap:8px;padding:0 18px;border-bottom:1px solid #2a2a2a;background:#1a1a1a"><i style="width:12px;height:12px;border-radius:50%;background:#3a3a3a"></i><i style="width:12px;height:12px;border-radius:50%;background:#3a3a3a"></i><i style="width:12px;height:12px;border-radius:50%;background:#3a3a3a"></i><span style="margin-left:14px;font-size:15px;color:#7a7a7a;font-family:Mono">~/acme-app</span></div><div class="term" style="padding:22px 28px 26px"><div><span class="p">$ </span><span class="cmd"></span><span class="cur" style="display:inline-block;width:11px;height:24px;background:#3ecf8e;vertical-align:-4px"></span></div><div class="l2 dim">Bundling Function: hello</div><div class="l3"><span class="ok">'+CHECK+'</span> Deployed Functions on project: <span style="color:#fff">hello</span></div></div>';
    el.append(term);
    const cmd = term.querySelector('.cmd'), cur = term.querySelector('.cur'), l2 = term.querySelector('.l2'), l3 = term.querySelector('.l3');
    const CMD = 'supabase functions deploy hello';
    const TT = [22.25, 22.85];
    for (let i = 0; i < CMD.length; i += 2) cue(lerp(TT[0], TT[1], i / CMD.length), 'key', { pan: 0.1, v: i + 50 });
    cue(21.88, 'swoosh'); cue(22.95, 'blip', { note: 0, pan: 0.1 }); cue(23.2, 'ding', { pan: 0.1 });
    ARCS.forEach(([, , t0], i) => cue(t0, 'zap', { pan: 0.3 + i * 0.05 }));
    return t => {
      cardIn(el, t, 21.88);
      tx(t);
      S(globe, { transform: `translateY(${f2(80 * (1 - E.o4(P(t, 21.95, 22.9))))}px) scale(${f4(1 + 0.04 * P(t, 22, 24.4))}) rotate(${f4(-6 * P(t, 21.9, 24.4))}deg)`, opacity: op(P(t, 21.95, 22.4)) });
      arcs.forEach(a => {
        const p = E.io3(P(t, a.t0, a.t0 + 0.55)), q = E.io3(P(t, a.t0 + 0.9, a.t0 + 1.4));
        A(a, 'stroke-dasharray', `${f4(p - q)} 2`);
        A(a, 'stroke-dashoffset', `${f4(-q)}`);
        A(a, 'opacity', f4(P(t, a.t0, a.t0 + 0.05)));
      });
      dots.forEach((d, i) => {
        const t0 = 22.3 + i * 0.08;
        S(d, { opacity: op(P(t, t0, t0 + 0.1)), transform: `scale(${f4(E.back(P(t, t0, t0 + 0.4)))})` });
        const rp = ((t - t0) % 1.1) / 1.1;
        S(d.ring, { opacity: op(t < t0 ? 0 : (1 - rp) * 0.7), transform: `scale(${f4(0.4 + rp * 1.6)})` });
      });
      const e = E.o4(P(t, 22.05, 22.6));
      S(term, { transform: T({ y: (1 - e) * 60 }), opacity: op(e) });
      const n = Math.floor(P(t, ...TT) * CMD.length);
      if (cmd._n !== n) { cmd._n = n; cmd.textContent = CMD.slice(0, n); }
      S(cur, { opacity: op(t < 22.95 && Math.floor(t * 5) % 2 === 0 || (t > TT[0] && t < TT[1]) ? 1 : 0) });
      S(l2, { opacity: op(P(t, 22.95, 23.0)) });
      S(l3, { opacity: op(P(t, 23.2, 23.25)) });
      under(el, t, 23.88);
    };
  });

  // ── 8. Realtime ───────────────────────────────────────
  scene(23.88, 26.42, el => {
    panel(el);
    const tx = sideText(el, 'Realtime', 'Build multiplayer\n*experiences.*', 'Synchronize and broadcast events\nto every connected client.', 23.88);
    const CARDS = [
      ['in-app-chat', 920, 150, 560], ['live-avatars', 1520, 230, 340],
      ['whiteboard', 990, 560, 470], ['multiplayer-game', 1500, 610, 340],
    ];
    const cards = CARDS.map(([n, x, y, w], i) => {
      const c = h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${w * 210 / 361}px` });
      c.append(img(`assets/realtime/${n}.svg`, { style: 'width:100%;height:100%' }));
      c.t0 = 24.0 + i * 0.1;
      return c;
    });
    const CUR = [['#3ecf8e', 'Zoe', 1180, 470, 0], ['#a78bfa', 'Rebecca', 1650, 520, 2.1], ['#f5a524', 'Jim', 1350, 870, 4.2]];
    const cursors = CUR.map(([col, name, x, y, ph]) => {
      const c = h('div', { class: 'abs', style: 'left:0;top:0', html: `<svg width="34" height="34" viewBox="0 0 22 22" style="display:block;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))"><path fill="${col}" d="${CURSOR_PATH}"/></svg><div style="margin:2px 0 0 24px;padding:5px 12px;border-radius:8px;background:${col};color:#0b0b0b;font-weight:600;font-size:18px;white-space:nowrap">${name}</div>` });
      c.p = [x, y, ph];
      return c;
    });
    el.append(...cards, ...cursors);
    cue(23.88, 'swoosh');
    cards.forEach((c, i) => cue(c.t0, 'blip', { note: i + 3, pan: 0.4, gain: 0.6 }));
    return t => {
      cardIn(el, t, 23.88);
      tx(t);
      cards.forEach((c, i) => {
        const e = E.o4(P(t, c.t0, c.t0 + 0.6));
        S(c, { transform: T({ y: (1 - e) * 80 + Math.sin(t * 1.6 + i * 1.3) * 6 }), opacity: op(e) });
      });
      cursors.forEach((c, i) => {
        const [x, y, ph] = c.p, k = t - 24.1;
        S(c, {
          transform: `translate(${f2(x + Math.sin(k * 1.9 + ph) * 120 + Math.sin(k * 3.1 + ph) * 30)}px,${f2(y + Math.cos(k * 1.5 + ph) * 80)}px)`,
          opacity: op(P(t, 24.3 + i * 0.15, 24.45 + i * 0.15)),
        });
      });
      under(el, t, 25.88);
    };
  });

  // ── 9. Vector ─────────────────────────────────────────
  scene(25.88, 28.3, el => {
    panel(el, 960, 700);
    const label = h('div', { class: 'label center abs', style: 'top:126px', html: '<span class="dot"></span>Vector' });
    const head = text('head center abs', 'Built for *AI.*', 'font-size:96px;top:164px');
    const sub = text('sub center abs', 'Integrate your favorite ML models to store, index and search vector embeddings.', 'top:286px');
    const pic = img('assets/product/vector-tools.png', { class: 'abs', style: 'left:210px;top:390px;width:1500px' });
    const r = rng(9);
    const motes = Array.from({ length: 26 }, () => {
      const s = 2 + r() * 4;
      const m = h('div', { class: 'spark', style: `width:${s}px;height:${s}px;left:${700 + r() * 520}px;top:${520 + r() * 420}px;opacity:0` });
      m.v = 10 + r() * 30; m.ph = r() * TAU;
      return m;
    });
    el.append(label, head, sub, pic, ...motes);
    cue(25.88, 'swoosh'); cue(26.35, 'shimmer', { gain: 0.6 });
    return t => {
      cardIn(el, t, 25.88);
      S(label, { opacity: op(P(t, 26.0, 26.2)), transform: `translateY(${f2((1 - E.o4(P(t, 26.0, 26.5))) * 16)}px)` });
      words(t, head.words, 26.05, 1e9, { st: 0.06 });
      words(t, sub.words, 26.3, 1e9, { st: 0.018, bl: 8, dy: 0.6 });
      const e = E.o4(P(t, 26.1, 26.9));
      S(pic, { transform: `translateY(${f2((1 - e) * 70)}px) scale(${f4(0.96 + 0.04 * e + 0.02 * P(t, 26.9, 28.3))})`, opacity: op(e) });
      motes.forEach((m, i) => S(m, { transform: `translateY(${f2(-(t - 26) * m.v)}px)`, opacity: op(P(t, 26.4, 26.9) * (0.35 + 0.35 * Math.sin(t * 3 + m.ph))) }));
      const x = E.i2(P(t, 27.9, 28.2));
      if (x > 0) S(el, { opacity: op(1 - x), filter: blur(x * 14) });
    };
  });

  // ── 10. Feature wall ──────────────────────────────────
  scene(27.9, 32.06, el => {
    const FEAT = ['postgres-database', 'branching', 'sql-editor', 'auto-generated-rest-api', 'backups', 'logs-analytics', 'social-login',
      'database-webhooks', 'file-storage', 'visual-schema-designer', 'security-and-performance-advisor', 'reports-and-metrics',
      'postgres-extensions', 'policy-templates', 'custom-domains', 'auto-generated-graphql-api', 'email-login', 's3-compatibility',
      'network-restrictions', 'terraform-provider', 'postgres-roles', 'phone-login', 'management-api', 'ssl-enforcement', 'auth-captcha-protection'];
    const cam = h('div', { class: 'layer', style: 'perspective:2600px' });
    const plane = h('div', { class: 'abs', style: 'left:960px;top:540px;width:0;height:0;transform-style:preserve-3d' });
    const COLS = 7, CW = 508, RH = 298;
    const cols = Array.from({ length: COLS }, (_, c) => {
      const col = h('div', { class: 'abs', style: `left:${(c - COLS / 2) * CW}px;top:${-RH * 4}px` });
      for (let r = 0; r < 8; r++) {
        const card = h('div', { class: 'wallcard', style: `left:0;top:${r * RH}px` });
        card.append(img(`assets/features/${FEAT[(c * 4 + (r % 4)) % FEAT.length]}.jpg`));
        col.append(card);
      }
      col.dir = c % 2 ? 1 : -1; col.ph = (c * 137) % (RH * 4);
      plane.append(col);
      return col;
    });
    cam.append(plane);
    const shade = h('div', { class: 'layer', style: 'background:radial-gradient(ellipse 48% 42% at 50% 50%, rgba(8,8,8,.92), rgba(8,8,8,.55) 60%, rgba(8,8,8,.25))' });
    const head = text('head center abs', 'And so much *more.*', 'font-size:124px;top:398px');
    const NAMES = ['Branching', 'Backups', 'Database Webhooks', 'Logs & Analytics', 'Custom Domains', 'Security Advisor', 'Postgres Extensions', 'Terraform Provider', 'S3 Compatibility', 'Visual Schema Designer'];
    const ticker = h('div', { class: 'abs center', style: 'top:556px;height:60px;overflow:hidden' });
    const items = NAMES.map((n, i) => {
      const it = h('div', { class: 'abs center label', style: 'top:0;font-size:34px;letter-spacing:.08em;justify-content:center' }, n);
      it.t0 = 28.95 + i * 0.25;
      cue(it.t0, 'tick', { gain: 0.45, pan: (i % 2 ? 0.2 : -0.2) });
      ticker.append(it);
      return it;
    });
    el.append(cam, shade, head, ticker);
    cue(27.9, 'whoosh');
    return t => {
      const k = t - 27.9;
      S(plane, { transform: `rotateX(34deg) rotate(-16deg) scale(${f4(K(t, [27.9, 1.8], [28.7, 1.0, E.o4], [30.4, 1.03, E.lin], [32.06, 1.55, E.i3]))})` });
      const travel = 110 * k + 1400 * E.i3(P(t, 30.3, 32.06));
      cols.forEach(c => {
        const y = (((c.ph + travel * c.dir) % (RH * 4)) + RH * 4) % (RH * 4);
        S(c, { transform: `translateY(${f2(y - RH * 2)}px)` });
      });
      S(cam, { opacity: op(P(t, 27.9, 28.2)), filter: blur(K(t, [27.9, 18], [28.4, 0, E.o3])) });
      words(t, head.words, 28.25, 31.72, { st: 0.07 });
      items.forEach((it, i) => {
        const pi = E.o3(P(t, it.t0, it.t0 + 0.1)), po = i === items.length - 1 ? E.i2(P(t, 31.72, 31.95)) : E.i2(P(t, it.t0 + 0.18, it.t0 + 0.25));
        S(it, { transform: `translateY(${f2((1 - pi) * 50 - po * 50)}px)`, opacity: op(pi * (1 - po)) });
      });
    };
  });

  // ── 11. Proof ─────────────────────────────────────────
  scene(31.98, 36.12, el => {
    const fmt = n => n.toLocaleString('en-US');
    const g1 = h('div', { class: 'abs center', style: 'top:385px' });
    const n1 = h('div', { class: 'num', style: 'font-size:210px;line-height:1' }, '0');
    const l1 = text('sub center', 'databases created', 'font-size:42px;margin-top:22px');
    g1.append(n1, l1);
    const g2 = h('div', { class: 'abs center', style: 'top:385px' });
    const n2 = h('div', { class: 'num', style: 'font-size:210px;line-height:1' }, '0');
    const l2 = text('sub center', 'databases launched daily', 'font-size:42px;margin-top:22px');
    g2.append(n2, l2);
    const cap = h('div', { class: 'label center abs', style: 'top:585px;color:#8f8f8f;font-size:20px' }, 'Trusted by fast-growing companies');
    const LOGOS = ['mozilla', '1password', 'pwc', 'vercel', 'netlify', 'lovable', 'resend', 'mobbin', 'mdn', 'chatbase', 'humata', 'firecrawl', 'e2b', 'brevo', 'xendit', 'meshy', 'quivr'];
    const mkRow = list => {
      const row = h('div', { class: 'logo-row' });
      for (let k = 0; k < 2; k++) list.forEach(n => row.append(img(`assets/customers/${n}.png`)));
      return row;
    };
    const rowA = mkRow(LOGOS.slice(0, 9)), rowB = mkRow(LOGOS.slice(9));
    rowA.style.top = '652px'; rowB.style.top = '752px';
    const rows = h('div', { class: 'layer', style: '-webkit-mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)' });
    rows.append(rowA, rowB);
    el.append(g1, g2, cap, rows);
    let last = -1;
    for (let i = 0; i < 26; i++) { const tc = 32.05 + 1.4 * (1 - Math.cbrt(1 - i / 26)); if (tc - last > 0.03) { cue(tc, 'count', { gain: 0.5 }); last = tc; } }
    cue(32.0, 'impact', { gain: 0.8 });
    cue(33.9, 'whoosh', { gain: 0.6 });
    for (let i = 0; i < 12; i++) cue(34.3 + 0.75 * (1 - Math.cbrt(1 - i / 12)), 'count', { gain: 0.4, pan: 0.4 });
    return t => {
      const c1 = E.o3(P(t, 32.05, 33.45));
      const v1 = Math.round(44e6 * c1 / 1000) * 1000;
      const s1 = fmt(v1) + (c1 >= 1 ? '+' : '');
      if (n1._t !== s1) { n1._t = s1; n1.textContent = s1; }
      const m = E.io4(P(t, 33.85, 34.35));
      S(g1, { transform: `translate(${f2(-440 * m)}px,${f2(-200 * m)}px) scale(${f4(1 - 0.42 * m + 0.1 * pulse(t, 33.45, 8) * (1 - m))})`, opacity: op(P(t, 32.0, 32.15)), filter: blur((1 - P(t, 32.0, 32.25)) * 12) });
      words(t, l1.words, 32.25, 1e9, { st: 0.06 });
      const c2 = E.o3(P(t, 34.3, 35.05));
      const s2 = fmt(Math.round(2e5 * c2 / 100) * 100) + (c2 >= 1 ? '+' : '');
      if (n2._t !== s2) { n2._t = s2; n2.textContent = s2; }
      const m2 = E.o4(P(t, 34.25, 34.75));
      S(g2, { transform: `translate(${f2(440)}px,${f2(-200 + (1 - m2) * 50)}px) scale(0.58)`, opacity: op(P(t, 34.25, 34.42)), filter: blur((1 - P(t, 34.25, 34.5)) * 10) });
      words(t, l2.words, 34.4, 1e9, { st: 0.06 });
      S(cap, { opacity: op(P(t, 34.35, 34.6)) });
      const pr = E.o4(P(t, 34.4, 35.0));
      S(rowA, { transform: `translateX(${f2(-120 * (t - 34) - 200)}px)`, opacity: op(pr) });
      S(rowB, { transform: `translateX(${f2(120 * (t - 34) - 1600)}px)`, opacity: op(E.o4(P(t, 34.5, 35.1))) });
      const x = E.i2(P(t, 35.8, 36.05));
      S(el, { opacity: op(1 - x), filter: blur(x * 10) });
    };
  });

  // ── 12. Tagline ───────────────────────────────────────
  scene(35.96, 40.0, el => {
    const mk = (str, cls, top) => {
      const line = h('div', { class: 'head center abs', style: `font-size:156px;font-weight:800;top:${top}px;letter-spacing:-.045em` });
      line.chars = [...str].map(ch => {
        const sp = h('span', { class: 'w' + cls }, ch);
        line.append(sp);
        return sp;
      });
      el.append(line);
      return line;
    };
    const a = mk('Build in a weekend', '', 360);
    const b = mk('Scale to millions', ' hl', 540);
    cue(36.0, 'hit'); cue(38.0, 'hit', { gain: 1.1 }); cue(38.55, 'shimmer');
    cue(39.55, 'suck');
    const chars = (t, line, t0, tout) => line.chars.forEach((c, i) => {
      const s = t0 + i * 0.024, p = E.o4(P(t, s, s + 0.7));
      const po = E.i3(P(t, tout, tout + 0.4));
      S(c, { transform: `translateY(${f4((1 - p) * 0.55)}em)`, opacity: op(p * (1 - po)), filter: blur((1 - p) * 18 + po * 20) });
    });
    return t => {
      chars(t, a, 36.0, 39.55);
      chars(t, b, 38.0, 39.55);
      S(a, { transform: `translateY(${f2(90 * (1 - E.io4(P(t, 37.75, 38.2))))}px) scale(${f4(1 + 0.03 * P(t, 36, 39.6))})` });
      S(b, { transform: `scale(${f4(1 + 0.02 * P(t, 38, 39.6))})` });
      // light sweep across "Scale to millions"
      const sw = E.io2(P(t, 38.55, 39.35));
      b.chars.forEach(c => S(c, { backgroundImage: `linear-gradient(100deg,#3ecf8e 0%,#3ecf8e ${f2(sw * 130 - 30)}%,#eafff5 ${f2(sw * 130 - 15)}%,#3ecfb2 ${f2(sw * 130)}%,#3ecfb2 100%)`, backgroundSize: `${b._w}px 100%`, backgroundPosition: `${-c._x}px 0` }));
    };
  });

  // ── 13. End card ──────────────────────────────────────
  scene(39.7, DUR + 1, el => {
    const L = logo(el);
    const btnA = h('div', { class: 'btn primary' }, 'Start your project');
    const btnB = h('div', { class: 'btn ghost' }, 'Documentation');
    const ripple = h('div', { class: 'ring', style: 'width:120px;height:120px;margin:-60px 0 0 -60px;border-color:#eafff5' });
    const url = h('div', { class: 'label center abs', style: 'top:742px;color:#a1a1a1;font-size:30px;letter-spacing:.06em;text-transform:none' }, 'supabase.com');
    const cursor = h('div', { class: 'cursor', html: POINTER, style: 'left:0;top:0;width:52px;height:52px' });
    el.append(btnA, btnB, ripple, url, cursor);
    cue(39.72, 'swish', { pan: -0.8 }); cue(39.74, 'swish', { pan: 0.8 });
    cue(40.0, 'impact', { final: 1 });
    cue(40.15, 'shimmer', { gain: 0.7 });
    cue(40.62, 'blip', { note: 4 }); cue(40.77, 'blip', { note: 5 });
    cue(42.3, 'click');
    const LX = 960, LY = 410, LK = 1.38;
    return t => {
      const fly = E.i3(P(t, 39.72, 40.0));
      const punch = t >= 40 ? 1 + 0.12 * Math.exp(-(t - 40) * 7) * Math.cos((t - 40) * 24) : 1;
      L.set({
        t, impact: 40.0,
        ix: LX - 290.5 * LK + 54.5 * LK, iy: LY, ik: LK * punch,
        lx: LX, ly: LY, lk: LK,
        aOff: [(1 - fly) * -420, (1 - fly) * -40, (1 - fly) * -30],
        bOff: [(1 - fly) * 420, (1 - fly) * 40, (1 - fly) * -30],
        partsOp: P(t, 39.72, 39.8),
        letterP: Array.from({ length: 8 }, (_, i) => E.o4(P(t, 40.12 + i * 0.04, 40.7 + i * 0.04))),
        glowK: P(t, 39.9, 40.0) * (0.5 + 0.5 * pulse(t, 40, 2)) * (1 + 0.15 * Math.sin(t * 2.4)),
      });
      const top = 560, gap = 22, wA = btnA._w, wB = btnB._w, x0 = (W - wA - wB - gap) / 2;
      const pop = (b, t0) => [E.back(P(t, t0, t0 + 0.5)), P(t, t0, t0 + 0.14), (1 - E.o4(P(t, t0, t0 + 0.5))) * 30];
      const [aa, ao, ay] = pop(btnA, 40.62), [ba, bo, by] = pop(btnB, 40.77);
      const press = 1 - 0.06 * Math.sin(Math.PI * P(t, 42.3, 42.48));
      S(btnA, { left: `${x0}px`, top: `${top}px`, transform: `translateY(${f2(ay)}px) scale(${f4((0.8 + 0.2 * aa) * press)})`, opacity: op(ao), filter: `brightness(${f4(1 + 0.25 * pulse(t, 42.3, 5))})` });
      S(btnB, { left: `${x0 + wA + gap}px`, top: `${top}px`, transform: `translateY(${f2(by)}px) scale(${f4(0.8 + 0.2 * ba)})`, opacity: op(bo) });
      const tx = x0 + wA * 0.58, ty = top + 40;
      const c = E.io3(P(t, 41.45, 42.18));
      const cx = lerp(1520, tx, c) + Math.sin(c * Math.PI) * 60, cy = lerp(980, ty, c) + Math.sin(c * Math.PI) * 30;
      const drift = E.io2(P(t, 42.6, 43.6));
      S(cursor, { transform: `translate(${f2(cx + drift * 70)}px,${f2(cy + drift * 90)}px) scale(${f4(1 - 0.15 * Math.sin(Math.PI * P(t, 42.28, 42.46)))})`, opacity: op(P(t, 41.45, 41.6) * (1 - P(t, 43.4, 43.8))) });
      const rp = P(t, 42.3, 42.95);
      S(ripple, { transform: `translate(${f2(tx)}px,${f2(ty)}px) scale(${f4(0.2 + E.o3(rp) * 2.6)})`, opacity: op(t < 42.3 ? 0 : (1 - rp) * 0.8) });
      S(url, { opacity: op(P(t, 41.0, 41.3)), transform: `translateY(${f2((1 - E.o4(P(t, 41.0, 41.6))) * 18)}px)` });
    };
  });
}

// ───────────────────────── global layers per frame ─────────────────────────
const IMPACTS = [[4.0, 0.16, 14, 0.42], [32.0, 0.42, 11, 0.4], [40.0, 0.13, 14, 0.36], [36.0, 0.05, 12, 0], [38.0, 0.06, 12, 0]];
function globals(t) {
  // backdrop glow travels with the story
  const gx = K(t, [0, 960], [4, 960], [8, 960], [12, 1150], [16, 700], [20, 960], [28, 960], [36, 960]);
  const gy = K(t, [0, 980], [3.5, 860], [4.2, 560], [8, 900], [28, 760], [32, 620], [36, 860], [40, 560]);
  const go = K(t, [0, 0.4], [3.6, 0.9], [4.2, 1.2], [7.5, 0.9], [8.2, 0.7], [27.9, 0.7], [32, 1.0], [36, 0.6], [39.8, 1.2], [44, 1.0]);
  S(layers.glow, { transform: `translate(${f2(gx - 960)}px,${f2(gy - 880)}px) scale(${f4(1 + 0.04 * Math.sin(t * 1.3))})`, opacity: op(go) });
  S(layers.grid, { transform: `translate(${f2((t * 9) % 96)}px,${f2((t * 6) % 96)}px)`, opacity: op(K(t, [0, 0.6], [4, 1], [8, 0.5], [36, 0.5], [40, 0.9])) });
  const fr = Math.floor(t * FPS), r = rng(fr + 1);
  S(layers.grain, { backgroundPosition: `${Math.floor(r() * 256)}px ${Math.floor(r() * 256)}px` });
  let fl = 0, sh = 0;
  for (const [ti, a, k, sa] of IMPACTS) { fl += a * pulse(t, ti, k); sh += sa * pulse(t, ti, 7); }
  fl += 0.42 * E.i2(P(t, 31.88, 32.0)) * (t < 32 ? 1 : 0);
  S(layers.flash, { opacity: op(fl) });
  S(layers.shake, { transform: `translate(${f2(Math.sin(t * 83) * 14 * sh)}px,${f2(Math.cos(t * 71) * 10 * sh)}px)` });
  // green wipe out of the logo zoom, opened by a growing iris at 8.0
  const R = 1500 * E.o3(P(t, 8.0, 8.5));
  S(layers.wipe, {
    opacity: op(t < 8 ? E.i2(P(t, 7.76, 7.96)) : 1 - P(t, 8.45, 8.5)),
    webkitMaskImage: t < 8 ? 'none' : `radial-gradient(circle at 50% 50%, transparent ${f2(R)}px, #000 ${f2(R + 2)}px)`,
  });
  S(layers.fade, { opacity: op(Math.max(1 - E.o2(P(t, 0, 0.35)), E.i2(P(t, 44.25, 45)))) });
}

function renderAt(t) {
  for (const s of scenes) {
    const on = t >= s.t0 && t < s.t1;
    if (on !== s.on) { s.el.style.display = on ? '' : 'none'; s.on = on; }
    if (on) s.update(t);
  }
  globals(t);
}

// ───────────────────────── boot ─────────────────────────
window.FPS = FPS; window.DUR = DUR; window.CUES = CUES; window.renderAt = renderAt;
window.READY = (async () => {
  const [icons, wm, cur] = await Promise.all([
    fetch('assets/icons.json').then(r => r.json()),
    fetch('assets/logo/supabase-logo-wordmark--dark.svg').then(r => r.text()),
    fetch('assets/realtime/cursor.svg').then(r => r.text()),
  ]);
  ICONS = icons;
  WORDMARK = new DOMParser().parseFromString(wm, 'image/svg+xml');
  CURSOR_PATH = new DOMParser().parseFromString(cur, 'image/svg+xml').querySelector('path').getAttribute('d');
  buildLayers();
  buildScenes();
  await Promise.all(['700 90px Disp', '800 90px Disp', '900 90px Disp', '500 20px Txt', '600 20px Txt', '700 20px Txt', '400 20px Mono'].map(f => document.fonts.load(f)));
  await Promise.all(imgs.map(i => i.decode().catch(() => console.error('image failed: ' + i.src))));
  // measurements that need real layout: render each scene once, visible
  for (const s of scenes) s.el.style.display = '';
  document.querySelectorAll('.btn').forEach(b => { b._w = b.offsetWidth; });
  document.querySelectorAll('.head').forEach(line => {
    if (!line.chars) return;
    line._w = line.chars.reduce((m, c) => Math.max(m, c.offsetLeft + c.offsetWidth), 0) - line.chars[0].offsetLeft;
    line.chars.forEach(c => { c._x = c.offsetLeft - line.chars[0].offsetLeft; });
  });
  CUES.sort((a, b) => a.t - b.t);
  renderAt(0);
  return true;
})();

// preview: ?t=12.4 renders one frame, ?play plays in real time
(async () => {
  const q = new URLSearchParams(location.search);
  if (!q.has('t') && !q.has('play')) return;
  document.body.classList.add('preview');
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / W, innerHeight / H)})`; };
  fit(); addEventListener('resize', fit);
  await window.READY;
  if (q.has('t')) return renderAt(+q.get('t'));
  const t0 = performance.now() - (+q.get('play') || 0) * 1000;
  const loop = () => { renderAt(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
  loop();
})();
