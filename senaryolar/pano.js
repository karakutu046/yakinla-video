// Hikâye panosu: dört senaryo, her biri 6 animasyonlu kare (180×320 birimlik dikey SVG).
// İkonlar sayfanın başındaki <defs> içinde tanımlı premium semboller (#i-*) üzerinden kullanılır.
// Animasyon sınıfları CSS'te; taban durum her zaman sahnenin okunur hâlidir.

let _u = 0;
const uid = (p) => `${p}${++_u}`;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
const T = (x, y, s, txt, o = {}) => `<text x="${x}" y="${y}" font-size="${s}" font-family="${o.f || 'Manrope, sans-serif'}" font-weight="${o.w || 700}" fill="${o.c || '#fff'}" text-anchor="${o.a || 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}>${txt}</text>`;
const BLUE = '#1F73F0', BLUE_D = '#0E5FE0', AMBER = '#FFB547', INK = '#0B1A33';
const DISPLAY = 'Bricolage Grotesque, sans-serif';
const frameSvg = (body, label) => `<svg viewBox="0 0 180 320" role="img" aria-label="${label}">${body}</svg>`;

/** Premium ikon (sembol) — boyut kare; cls ile animasyon */
const icon = (id, x, y, s, cls = '', shadow = true) => `<use href="#${id}" x="${x}" y="${y}" width="${s}" height="${id === 'i-bag' ? s * 1.25 : s}"${cls ? ` class="${cls}"` : ''}${shadow ? ' filter="url(#f-soft)"' : ''}/>`;
const logo = (x, y, s) => `<use href="#ylogo" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
/** Animasyon sarmalayıcısı: transform özniteliği olan öğeye CSS animasyonu verilmez */
const anim = (cls, inner, style = '') => `<g class="${cls}"${style ? ` style="${style}"` : ''}>${inner}</g>`;
const at = (x, y, inner, s = 1) => `<g transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;

// ---------- parçacıklar (kesintisiz döngü: içerik iki kopya, dönem p) ----------
const rainLines = (n, seed, w, h, len, dx, sw) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rnd(seed + i * 3.1) * (w + 20) - 10, y = rnd(seed + i * 7.7) * h, l = len * (0.6 + rnd(seed + i) * 0.7);
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + (dx * l) / len).toFixed(1)}" y2="${(y + l).toFixed(1)}" stroke-width="${(sw * (0.6 + rnd(seed + i * 2) * 0.8)).toFixed(2)}"/>`;
  }
  return s;
};
const rainLoop = (n, seed, x0, y0, w, h, o = {}) => {
  const L = rainLines(n, seed, w, h, o.len || 14, o.dx ?? -3, o.sw || 0.9);
  return at(x0, y0, `<g stroke="${o.col || '#d6e6ff'}" stroke-linecap="round" opacity="${o.op ?? 0.55}">${anim(`fall${o.cls ? ' ' + o.cls : ''}`, `${L}<g transform="translate(0 ${-h})">${L}</g>`, `--p:${h}px`)}</g>`);
};
const flakes = (n, seed, w, h, rmin, rmax) => {
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${(rnd(seed + i * 2.9) * w).toFixed(1)}" cy="${(rnd(seed + i * 6.1) * h).toFixed(1)}" r="${(rmin + rnd(seed + i * 5.3) * (rmax - rmin)).toFixed(2)}" opacity="${(0.45 + rnd(seed + i) * 0.55).toFixed(2)}"/>`;
  return s;
};
const snowLoop = (n, seed, x0, y0, w, h, o = {}) => {
  const F = flakes(n, seed, w, h, o.rmin || 0.7, o.rmax || 2.3);
  return at(x0, y0, `<g fill="#fff" opacity="${o.op ?? 0.95}"${o.glow ? ' filter="url(#f-glow)"' : ''}>${anim('sway', anim(`fall ${o.speed || 'slow'}`, `${F}<g transform="translate(0 ${-h})">${F}</g>`, `--p:${h}px`))}</g>`);
};
const splats = (n, seed, x0, y0, w, h, col = '#6b4a2b', rmax = 3) => {
  let s = '';
  for (let i = 0; i < n; i++) { const r = 0.6 + rnd(seed + i * 4.1) * rmax; s += `<ellipse cx="${(x0 + rnd(seed + i * 1.7) * w).toFixed(1)}" cy="${(y0 + rnd(seed + i * 8.3) * h).toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * (0.6 + rnd(i) * 0.5)).toFixed(1)}"/>`; }
  return `<g fill="${col}">${s}</g>`;
};

/** Uygulamadaki logolu beyaz minibüs (yerel 100×52, sağa bakar) */
const van = (o = {}) => {
  const g = uid('vg'), w = uid('vw'), r = uid('vr');
  return `<defs>${lg(g, [[0, '#ffffff'], [0.7, '#eef2f8'], [1, '#cfd9e8']])}${lg(w, [[0, '#4d6c9e'], [1, '#1d3561']])}${rg(r, [[0, '#d8dee8'], [1, '#6b7486']])}</defs>
    <ellipse cx="50" cy="51.5" rx="49" ry="3.2" fill="#000" opacity="${o.shadow ?? 0.28}"/>
    ${o.lights ? `<path d="M98 28 L170 12 L170 50 Z" fill="#fff3d0" opacity="0.16"/>` : ''}
    <path d="M2 12 Q2 6 8 6 H62 Q66 6 69 9 L82 22 Q97 24 99 30 V44 Q99 47 95 47 H5 Q2 47 2 44 Z" fill="url(#${g})" stroke="#aebad0" stroke-width="0.7"/>
    <path d="M66 10 L79 23 H66 Z" fill="url(#${w})"/><rect x="56" y="10" width="8" height="13" rx="1" fill="url(#${w})"/>
    <path d="M67 12 L71 12 L66 18 Z" fill="#fff" opacity="0.35"/><path d="M57 11 L60 11 L57 15 Z" fill="#fff" opacity="0.35"/>
    <path d="M2 33 H99 V37 H2 Z" fill="${BLUE}"/><path d="M2 37 H99 V44 Q99 47 95 47 H5 Q2 47 2 44 Z" fill="${BLUE_D}"/>
    ${logo(8, 9, 21)}<text x="29" y="23" font-family="Inter, sans-serif" font-weight="800" font-size="8.6" fill="${BLUE}">Yakınla</text>
    <line x1="54" y1="8" x2="54" y2="45" stroke="#aebad0" stroke-width="0.6"/><rect x="47" y="25" width="4" height="1.4" rx="0.7" fill="#8a96aa"/>
    <rect x="94" y="27" width="5" height="4" rx="1" fill="#fff6dc"/>${o.lights ? `<circle cx="97" cy="29" r="5" fill="#fff3d0" opacity="0.35" filter="url(#f-glow)"/>` : ''}
    <rect x="2" y="30" width="3" height="3" rx="0.8" fill="#ff4a3a"/>
    ${o.snow ? `<path d="M4 7 Q6 0.5 14 1.5 H58 Q64 1 64 7 Z" fill="#fff"/><path d="M70 12 Q76 10 80 17 L74 14 Z" fill="#fff"/>` : ''}
    ${o.wet ? `<path d="M6 13 H60" stroke="#fff" stroke-width="1.1" opacity="0.7"/><path d="M8 39 H96" stroke="#fff" stroke-width="0.6" opacity="0.35"/>` : ''}
    ${o.mud ? splats(26, 41, 2, 34, 97, 13, '#5f3f22', 2.6) + splats(10, 77, 4, 25, 92, 8, '#7d5a36', 1.6) : ''}
    ${[22, 80].map((cx) => `<circle cx="${cx}" cy="47" r="8.4" fill="#141924"/><circle cx="${cx}" cy="47" r="4.4" fill="url(#${r})"/><circle cx="${cx}" cy="47" r="1.4" fill="#3a4252"/>${o.mud ? `<circle cx="${cx}" cy="47" r="8.4" fill="none" stroke="#6b4a2b" stroke-width="2.4" stroke-dasharray="5 3"/>` : ''}`).join('')}`;
};
const vanAt = (x, y, s, o = {}, cls = '') => at(x, y, cls ? anim(cls, van(o)) : van(o), s);

const houses = (y, seed, col, lit = 0.55, snowRoof = false, w = 186) => {
  let s = '';
  let x = -6;
  for (let i = 0; x < w; i++) {
    const hw = 26 + rnd(seed + i) * 18, h = 22 + rnd(seed + i * 2.3) * 16;
    s += `<rect x="${x.toFixed(1)}" y="${(y - h).toFixed(1)}" width="${hw.toFixed(1)}" height="${(h + 4).toFixed(1)}" fill="${col}"/>`;
    s += `<polygon points="${(x - 2).toFixed(1)},${(y - h).toFixed(1)} ${(x + hw / 2).toFixed(1)},${(y - h - 10).toFixed(1)} ${(x + hw + 2).toFixed(1)},${(y - h).toFixed(1)}" fill="${snowRoof ? '#f4f7ff' : col}"/>`;
    for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) {
      const on = rnd(seed + i * 9 + k * 3 + j) < lit;
      s += `<rect x="${(x + 5 + j * (hw - 16)).toFixed(1)}" y="${(y - h + 5 + k * 9).toFixed(1)}" width="6" height="5" rx="0.6" fill="${on ? '#ffc26b' : '#26324c'}"${on ? ' filter="url(#f-glow)"' : ''}/>`;
    }
    x += hw + 3;
  }
  return s;
};

/** Kapıdaki kurye: koyu vizörlü kask (yüz yok), poşeti iki eliyle önde tutar (kapı açıklığı koordinatlarında) */
const courierClose = (kind) => {
  const j = uid('cj');
  return `<defs>${lg(j, [[0, '#3d8bff'], [1, '#123f9a']], 0, 0, 1, 1)}</defs>
    <path d="M74 122 Q76 102 94 99 H114 Q132 102 134 122 V264 H74 Z" fill="url(#${j})"/>
    <path d="M104 106 V264" stroke="#0b3a8a" stroke-width="1.4"/><path d="M93 99 Q104 109 115 99" stroke="#0b3a8a" stroke-width="2" fill="none"/>
    <rect x="74" y="210" width="60" height="5" fill="#e9f2ff" opacity="0.85"/><rect x="74" y="218" width="60" height="1.8" fill="#e9f2ff" opacity="0.5"/>
    <circle cx="123" cy="119" r="6.2" fill="#fff"/>${logo(117.5, 113.5, 11)}
    <rect x="98" y="90" width="12" height="11" rx="2" fill="#16203a"/>
    <path d="M88 91 Q86 65 104 64 Q122 65 120 91 Q104 95 88 91 Z" fill="url(#${j})"/>
    <path d="M90 80 Q104 75 118 80 L117 89 Q104 93 91 89 Z" fill="#0b1426"/>
    <path d="M94 81 Q100 78.6 107 78.8" stroke="#fff" stroke-width="1.3" opacity="0.55" fill="none" stroke-linecap="round"/>
    <path d="M95 69 Q101 66.5 110 68" stroke="#fff" stroke-width="1.6" opacity="0.35" fill="none" stroke-linecap="round"/>
    ${kind === 'rain' ? `<path d="M80 108 Q90 100 100 100" stroke="#fff" stroke-width="1.8" opacity="0.4" fill="none" stroke-linecap="round"/><path d="M128 126 V180" stroke="#fff" stroke-width="1.2" opacity="0.25"/><g fill="#d8ecff" opacity="0.8"><circle cx="90" cy="70" r="0.9"/><circle cx="112" cy="68" r="0.8"/><circle cx="80" cy="128" r="0.9"/><circle cx="130" cy="140" r="0.8"/></g>` : ''}
    ${kind === 'snow' ? `<path d="M90 76 Q90 62 104 62 Q118 62 118 76 Q104 70 90 76 Z" fill="#fff"/><path d="M75 116 Q78 100 92 99 L94 104 Q82 106 78 118 Z" fill="#fff"/><path d="M133 116 Q130 100 116 99 L114 104 Q126 106 130 118 Z" fill="#fff"/>` : ''}
    ${kind === 'mud' ? splats(18, 33, 76, 222, 56, 40, '#5f3f22', 2.4) : ''}
    <path d="M80 112 C70 128 72 142 86 147" stroke="url(#${j})" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M128 112 C138 128 136 142 122 147" stroke="url(#${j})" stroke-width="12" stroke-linecap="round" fill="none"/>
    ${icon('i-bag', 80, 136, 48)}
    <ellipse cx="85" cy="147" rx="5.4" ry="5" fill="#16203a"/><ellipse cx="123" cy="147" rx="5.4" ry="5" fill="#16203a"/>
    <path d="M82 145 Q85 143 88 145" stroke="#fff" stroke-width="0.8" opacity="0.3" fill="none"/><path d="M120 145 Q123 143 126 145" stroke="#fff" stroke-width="0.8" opacity="0.3" fill="none"/>`;
};

/** İçeriden bakış: kapı açılır (animasyon), dışarısı açıklığın içinde çizilir */
const doorway = (outside, kind) => {
  const clip = uid('dc'), wall = uid('wl'), warm = uid('wm'), floor = uid('fl'), wood = uid('wd');
  return `<defs>
      ${lg(wall, [[0, '#4a2f1d'], [1, '#1f130b']])}
      ${rg(warm, [[0, '#ffcf8a', 0.5], [1, '#ffcf8a', 0]], 0.5, 0.15, 0.75)}
      ${lg(floor, [[0, '#6b4126'], [1, '#24150b']])}
      ${lg(wood, [[0, '#7a4a2e'], [1, '#4d2c19']], 0, 0, 1, 0)}
      <clipPath id="${clip}"><rect x="42" y="64" width="96" height="200"/></clipPath>
    </defs>
    <rect width="180" height="320" fill="url(#${wall})"/>
    <g clip-path="url(#${clip})">${outside}</g>
    <rect x="38" y="60" width="104" height="6" fill="#efe4d4"/><rect x="38" y="60" width="5" height="206" fill="#efe4d4"/><rect x="137" y="60" width="5" height="206" fill="#efe4d4"/>
    ${anim('door-leaf', `<polygon points="42,66 16,50 16,294 42,264" fill="url(#${wood})"/><polygon points="20,72 38,82 38,248 20,262" fill="#8a5636" opacity="0.6"/><circle cx="35" cy="168" r="2.4" fill="#e0b04d"/>`)}
    <rect x="0" y="264" width="180" height="56" fill="url(#${floor})"/>
    <polygon points="42,264 138,264 170,320 10,320" fill="#ffcf8a" opacity="0.13"/>
    <rect x="52" y="268" width="76" height="14" rx="3" fill="${kind === 'mud' ? '#4b3a2c' : '#3a465a'}"/>
    ${kind === 'mud' ? splats(8, 4, 60, 268, 60, 10, '#6b4a2b', 1.6) : ''}
    <g clip-path="url(#${clip})">${anim('door-close', `<rect x="42" y="64" width="96" height="200" fill="url(#${wood})"/><rect x="52" y="76" width="76" height="80" rx="3" fill="#5a331e"/><rect x="52" y="166" width="76" height="86" rx="3" fill="#5a331e"/><circle cx="128" cy="168" r="2.6" fill="#e0b04d"/>`)}</g>
    <rect width="180" height="320" fill="url(#${warm})"/>`;
};

const outsideRain = () => { const s = uid('sk'), g = uid('gr'), refl = uid('rf'); return `<defs>${lg(s, [[0, '#18202d'], [1, '#3a4659']])}${lg(g, [[0, '#2b3446'], [1, '#0f141c']])}${lg(refl, [[0, '#ffc26b', 0.35], [1, '#ffc26b', 0]])}</defs>
  <rect width="180" height="320" fill="url(#${s})"/>${houses(196, 3, '#1f2836', 0.6)}<rect y="192" width="180" height="128" fill="url(#${g})"/>
  ${[18, 60, 104, 150].map((x) => `<rect x="${x}" y="196" width="5" height="40" fill="url(#${refl})"/>`).join('')}
  ${vanAt(28, 172, 0.5, {lights: true, wet: true})}
  <g transform="translate(66 240)">${anim('ripple', `<ellipse rx="14" ry="2.6" fill="none" stroke="#9cc4ff" stroke-width="0.8"/>`)}</g>
  ${rainLoop(110, 11, 40, 60, 100, 210, {len: 16})}${courierClose('rain')}${rainLoop(26, 91, 40, 60, 100, 210, {len: 24, dx: -4, op: 0.75, sw: 1.1, col: '#eef4ff'})}`; };
const outsideSnow = () => { const s = uid('sk'), lamp = uid('lp'); return `<defs>${lg(s, [[0, '#10203f'], [1, '#2f4677']])}${rg(lamp, [[0, '#ffd08a', 0.55], [1, '#ffd08a', 0]])}</defs>
  <rect width="180" height="320" fill="url(#${s})"/><circle cx="62" cy="112" r="34" fill="url(#${lamp})"/><rect x="61" y="112" width="2" height="84" fill="#1b2640"/><circle cx="62" cy="112" r="3" fill="#ffe2b0"/>
  ${houses(196, 7, '#1b2848', 0.65, true)}<rect y="192" width="180" height="128" fill="#e6ecf8"/><path d="M0 192 Q45 184 90 192 T180 190 V204 H0 Z" fill="#f7f9ff"/>
  ${vanAt(28, 172, 0.5, {lights: true, snow: true})}${snowLoop(60, 21, 40, 60, 100, 210, {rmin: 0.6, rmax: 2.3})}${courierClose('snow')}${snowLoop(14, 61, 40, 60, 100, 210, {rmin: 1.6, rmax: 3.2, speed: 'mid', glow: true})}`; };
const outsideMud = () => { const s = uid('sk'), m = uid('md'); return `<defs>${lg(s, [[0, '#8794a4'], [1, '#c6ccd4']])}${lg(m, [[0, '#7a5a3a'], [1, '#432d19']])}</defs>
  <rect width="180" height="320" fill="url(#${s})"/><path d="M0 166 L40 136 L70 154 L110 124 L150 148 L180 134 V196 H0 Z" fill="#6c7a8a" opacity="0.65"/>${houses(196, 13, '#b5a38a', 0.15)}
  <rect y="192" width="180" height="128" fill="url(#${m})"/><ellipse cx="64" cy="232" rx="26" ry="4.4" fill="#9fb0c4" opacity="0.6"/>
  <g transform="translate(64 232)">${anim('ripple d1', `<ellipse rx="12" ry="2" fill="none" stroke="#e6edf6" stroke-width="0.8"/>`)}</g>
  <path d="M0 212 Q50 204 100 216 T180 208" stroke="#2f1f10" stroke-width="3" fill="none" opacity="0.6"/>
  ${vanAt(26, 172, 0.5, {mud: true})}${courierClose('mud')}`; };

// küçük yardımcılar
const caption = (y, lines, o = {}) => lines.map((l, i) => T(90, y + i * (o.lh || 13), o.s || 11, l, {w: o.w || 800, c: o.c || '#fff', f: o.f || DISPLAY})).join('');
const capBand = (y = 282) => `<rect x="0" y="${y}" width="180" height="${320 - y}" fill="url(#cap-fade)"/>`;
const touch = (x, y, r = 8) => `<g transform="translate(${x} ${y})">${anim('ripple', `<circle r="${r + 7}" fill="none" stroke="#fff" stroke-width="1.4"/>`)}<circle r="${r}" fill="#fff" opacity="0.75"/><circle r="${r}" fill="none" stroke="${BLUE}" stroke-width="1.2" opacity="0.6"/></g>`;
const badges = (x, y, w) => {
  const h = w * (192 / 575), w2 = h * (648 / 192);
  return `<image href="{{BADGE_APPSTORE}}" x="${x}" y="${y}" width="${w}" height="${h}"/><image href="{{BADGE_GOOGLE}}" x="${x + w + 4}" y="${y}" width="${w2}" height="${h}"/>`;
};
const endCard = (bg, sloganLines, sub, dark = true) => {
  const g = uid('ec');
  const col = dark ? '#fff' : INK;
  return `<defs>${bg(g)}</defs><rect width="180" height="320" fill="url(#${g})"/>
    <g transform="translate(90 112)">${anim('halo', `<circle r="34" fill="none" stroke="#fff" stroke-width="1.4"/>`)}${anim('halo d2', `<circle r="34" fill="none" stroke="#fff" stroke-width="1"/>`)}<circle r="34" fill="#fff" opacity="${dark ? 0.1 : 0.7}"/></g>${logo(66, 88, 48)}
    ${T(90, 166, 25, 'Yakınla', {f: 'Inter, sans-serif', w: 800, c: col, ls: '-0.6'})}
    ${sloganLines.map((l, i) => T(90, 186 + i * 12, 9.6, l, {w: 700, c: dark ? '#ffe2b0' : BLUE_D, f: DISPLAY})).join('')}
    ${T(90, 189 + sloganLines.length * 12 + 4, 6.4, sub, {w: 600, c: col, op: 0.85})}
    ${anim('pop s3', badges(28, 222, 58))}
    ${T(90, 256, 8, 'yakinla.com', {w: 700, c: col})}
    ${T(90, 270, 5.2, 'Şu an aktif bölgemiz: Kahramanmaraş Afşin', {w: 600, c: col, op: 0.75})}`;
};

// ---------- uygulama ekranları (ekran görüntülerindeki düzen, fiyatsız) ----------
const bottle = (x, y, s, big = false) => `<g transform="translate(${x} ${y}) scale(${s})">${big
  ? `<rect x="-9" y="-2" width="18" height="26" rx="4" fill="#d6ecff" stroke="#9cc8f0" stroke-width="0.8"/><rect x="-4" y="-7" width="8" height="5" rx="1" fill="#e04a3a"/><rect x="-9" y="8" width="18" height="7" fill="#fff" opacity="0.8"/>`
  : `<path d="M-4 -12 H4 V-8 Q7 -6 7 -2 V18 Q7 21 4 21 H-4 Q-7 21 -7 18 V-2 Q-7 -6 -4 -8 Z" fill="#d6ecff" stroke="#9cc8f0" stroke-width="0.8"/><rect x="-3" y="-15" width="6" height="3" rx="0.8" fill="${BLUE}"/><rect x="-7" y="3" width="14" height="6" fill="#3b8bff" opacity="0.55"/>`}</g>`;
const uiChrome = (w, h, title, cart = 0, cartCls = '') => `<rect width="${w}" height="${h}" fill="#f4f7fc"/>
  <circle cx="9" cy="11" r="5.5" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/><path d="M10 9 L8 11 L10 13" stroke="${INK}" stroke-width="1" fill="none"/>
  ${T(18, 13.5, 7, title, {a: 'start', w: 800, c: INK, f: 'Inter, sans-serif'})}
  <rect x="${w - 42}" y="5.5" width="22" height="11" rx="4" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/>${T(w - 31, 13, 4.6, 'Geçmiş', {w: 700, c: INK})}
  <rect x="${w - 17}" y="5.5" width="12" height="11" rx="4" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/><path d="M${w - 14} 9 H${w - 8} L${w - 9} 13 H${w - 13} Z" fill="none" stroke="${INK}" stroke-width="0.8"/>
  ${cart ? anim(cartCls || 'none', `<circle cx="${w - 6}" cy="5.5" r="3.8" fill="${BLUE}"/>${T(w - 6, 7.2, 4.2, String(cart), {w: 800})}`) : ''}`;
const uiNav = (w, h) => `<rect x="4" y="${h - 22}" width="${w - 8}" height="18" rx="7" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/>
  ${['Anasayfa', 'Kategoriler', '', 'Fırsatlar', 'Hesabım'].map((l, i) => l ? `<rect x="${8 + (i * (w - 16)) / 5 + (w - 16) / 10 - 3}" y="${h - 19}" width="6" height="5" rx="1.2" fill="none" stroke="${i === 1 ? BLUE : '#4a5568'}" stroke-width="0.7"/>${T(8 + (i * (w - 16)) / 5 + (w - 16) / 10, h - 8.5, 3.4, l, {w: 700, c: i === 1 ? BLUE : '#4a5568'})}` : '').join('')}
  <circle cx="${w / 2}" cy="${h - 17}" r="8" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/>${logo(w / 2 - 6, h - 23, 12)}`;
const uiCategories = (w, h, o = {}) => {
  const cats = ['Su', 'Çoklu Al', 'İçecek', 'Atıştırmalık', 'Süt Ürünleri', 'Kahvaltılık', 'Fırından', 'Ev Bakım', 'Temel Gıda'];
  const cols = ['#b9dcff', '#ffd27a', '#ffb3a1', '#e9c38a', '#f3f0e6', '#f0d39b', '#e8b27a', '#c5e6f7', '#e7d3b0'];
  let rail = '';
  cats.forEach((c, i) => { const y = 28 + i * 21; rail += `<circle cx="11" cy="${y}" r="5.4" fill="${cols[i]}"/>${T(11, y + 9.5, 3.2, c, {w: 700, c: i === 0 ? BLUE : '#4a5568'})}`; });
  const gx = 26, gw = (w - gx - 6) / 2 - 2;
  let cards = '';
  for (let i = 0; i < 4; i++) {
    const cx = gx + (i % 2) * (gw + 4), cy = 56 + Math.floor(i / 2) * 54;
    const added = o.added && o.added.includes(i);
    cards += `<rect x="${cx}" y="${cy}" width="${gw}" height="50" rx="5" fill="#fff" stroke="#e8edf5" stroke-width="0.6"/>${bottle(cx + gw / 2, cy + 18, 0.85, i === 3)}
      <rect x="${cx + 4}" y="${cy + 36}" width="${gw * 0.6}" height="2.6" rx="1" fill="${INK}"/><rect x="${cx + 4}" y="${cy + 41}" width="${gw * 0.35}" height="2" rx="1" fill="#9aa8bd"/>
      ${anim(added ? `pop s${i + 1}` : 'none', `<rect x="${cx + gw - 10}" y="${cy + 3}" width="7" height="7" rx="2" fill="${added ? BLUE : '#fff'}" stroke="#d5deea" stroke-width="0.5"/>${T(cx + gw - 6.5, cy + 8.6, 6, added ? '1' : '+', {w: 800, c: added ? '#fff' : BLUE})}`)}`;
  }
  return `${uiChrome(w, h, 'Kategoriler', o.cart, o.cart ? 'pop s3' : '')}<line x1="21" y1="20" x2="21" y2="${h}" stroke="#e1e7f0" stroke-width="0.5"/>${rail}<rect x="0" y="22" width="1.6" height="13" fill="${BLUE}"/>
    ${T(gx, 29, 7.4, 'Su', {a: 'start', w: 800, c: INK, f: 'Inter, sans-serif'})}${T(gx + 10, 29, 3.8, '13 ürün', {a: 'start', w: 600, c: '#7a879b'})}
    <rect x="${gx + 28}" y="22" width="${w - gx - 46}" height="9" rx="4.5" fill="#fff" stroke="#e1e7f0" stroke-width="0.5"/>${T(gx + 38, 28.2, 3.8, 'Markette ara', {a: 'start', w: 600, c: '#9aa8bd'})}
    <rect x="${gx}" y="36" width="24" height="9" rx="4.5" fill="${BLUE}"/>${T(gx + 12, 42, 4, 'Pet Şişe', {w: 800})}
    <rect x="${gx + 27}" y="36" width="18" height="9" rx="4.5" fill="#fff" stroke="#e1e7f0" stroke-width="0.5"/>${T(gx + 36, 42, 4, 'Litre', {w: 700, c: INK})}
    <rect x="${gx + 48}" y="36" width="26" height="9" rx="4.5" fill="#fff" stroke="#e1e7f0" stroke-width="0.5"/>${T(gx + 61, 42, 4, 'Bardak Su', {w: 700, c: INK})}
    ${T(gx, 53, 5, 'Pet Şişe', {a: 'start', w: 800, c: INK})}${cards}${uiNav(w, h)}`;
};
const uiCart = (w, h, o = {}) => {
  let rows = '';
  for (let i = 0; i < 4; i++) {
    const y = 34 + i * 30;
    rows += `<rect x="5" y="${y}" width="${w - 10}" height="26" rx="5" fill="#fff" stroke="#e8edf5" stroke-width="0.6"/>${bottle(17, y + 10, 0.62, i % 2 === 0)}
      <rect x="29" y="${y + 6}" width="${28 + (i % 2) * 8}" height="2.8" rx="1" fill="${INK}"/><rect x="29" y="${y + 11.5}" width="14" height="2" rx="1" fill="#9aa8bd"/>
      ${i < 2 ? `<rect x="29" y="${y + 17}" width="30" height="2.2" rx="1" fill="#22c55e" opacity="0.8"/>` : ''}
      <rect x="${w - 34}" y="${y + 8}" width="26" height="9" rx="4" fill="#f4f7fc"/>${T(w - 29, y + 14.6, 6, '−', {w: 800, c: BLUE})}${T(w - 21, y + 14.4, 5, String([10, 4, 2, 1][i]), {w: 800, c: INK})}${T(w - 13, y + 14.8, 6, '+', {w: 800, c: BLUE})}`;
  }
  const sy = h - 74;
  const p = o.progress ?? 0.82;
  return `${uiChrome(w, h, 'Sepetim', 18)}${T(6, 29, 6.2, '18 ürün', {a: 'start', w: 800, c: INK, f: 'Inter, sans-serif'})}${T(w - 6, 29, 4.4, 'Temizle ›', {a: 'end', w: 700, c: BLUE})}${rows}
    <rect x="0" y="${sy}" width="${w}" height="74" rx="9" fill="#fff" stroke="#e1e7f0" stroke-width="0.6"/>
    <line x1="18" y1="${sy + 14}" x2="${w - 18}" y2="${sy + 14}" stroke="#e1e7f0" stroke-width="2" stroke-linecap="round"/>
    ${anim(o.move ? 'grow' : 'none', `<line x1="18" y1="${sy + 14}" x2="${18 + (w - 36) * p}" y2="${sy + 14}" stroke="#2ecc71" stroke-width="2" stroke-linecap="round"/>`)}
    ${anim(o.move ? 'vanmove' : 'none', at(18 + (w - 36) * p - 12, sy + 3, van({shadow: 0}), 0.24))}
    ${T(6, sy + 26, 4.6, 'Teslimat bizden', {a: 'start', w: 800, c: INK})}
    ${anim(o.pressed ? 'press' : 'none', `<rect x="6" y="${sy + 32}" width="${w - 12}" height="15" rx="6" fill="${BLUE}"/>${T(w / 2, sy + 42, 7, 'Öde', {w: 800})}`)}
    ${uiNav(w, h)}`;
};
const phone = (x, y, w, h, screen, o = {}) => {
  const c = uid('pc');
  const bez = o.bez ?? 4;
  const k = (w - bez * 2) / (o.cw || w - bez * 2);
  const isl = Math.min(24, w * 0.2);
  return `<defs><clipPath id="${c}"><rect x="${x + bez}" y="${y + bez}" width="${w - bez * 2}" height="${h - bez * 2}" rx="${o.r ? Math.max(1, o.r - 3) : 12}"/></clipPath></defs>
    <rect x="${x - 0.6}" y="${y - 0.6}" width="${w + 1.2}" height="${h + 1.2}" rx="${(o.r || 15) + 0.6}" fill="#3a4458"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 15}" fill="#0c111b"/>
    <g clip-path="url(#${c})"><g transform="translate(${x + bez} ${y + bez}) scale(${k})">${screen}</g></g>
    <rect x="${x + w / 2 - isl / 2}" y="${y + bez + 3 * k}" width="${isl}" height="${Math.max(2, 6 * k)}" rx="${Math.max(1, 3 * k)}" fill="#0c111b"/>`;
};
const glassDrops = (n, seed, x0, y0, w, h) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(seed + i * 2.2) * w, y = y0 + rnd(seed + i * 5.9) * h, r = 1.6 + rnd(seed + i) * 3.4;
    const moving = rnd(seed + i * 3.3) > 0.55;
    const d = `<path d="M${x.toFixed(1)} ${(y - r * 5).toFixed(1)} Q${(x + 0.6).toFixed(1)} ${(y - r * 2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="#fff" stroke-width="${(r * 0.6).toFixed(1)}" opacity="${moving ? 0.22 : 0}" fill="none"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#d8ecff" opacity="0.32" stroke="#fff" stroke-width="0.5" stroke-opacity="0.8"/><circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.3).toFixed(1)}" fill="#fff" opacity="0.9"/>`;
    s += moving ? `<g class="slide" style="animation-delay:${(-rnd(seed + i * 9) * 5).toFixed(2)}s;animation-duration:${(3.5 + rnd(i) * 3).toFixed(2)}s">${d}</g>` : d;
  }
  return s;
};
const bokeh = (n, seed, col = '#ffc26b') => [...Array(n)].map((_, i) => `<circle class="twinkle" style="animation-delay:${(-rnd(seed + i) * 2).toFixed(2)}s" cx="${(rnd(seed + i) * 180).toFixed(1)}" cy="${(30 + rnd(seed + i * 3) * 260).toFixed(1)}" r="${(10 + rnd(seed + i * 7) * 16).toFixed(1)}" fill="${col}" opacity="0.14" filter="url(#f-blur)"/>`).join('');

// ================= SENARYO 1: KAPI ZİLİ =================
const S1 = {
  key: 'kapi-zili', n: 1, name: 'Kapı Zili',
  logline: 'Kamera evin içinde, kapının karşısında sabit durur. Zil üç kez çalar; kapı her açıldığında dışarıda başka bir hava vardır: yağmur, kar, çamur. Kurye her seferinde poşeti aynı özenle uzatır. Sonda üç havanın izi kapının önünde yan yana durur.',
  chips: ['Sinematik 3B', '20 sn', 'POV', 'Sıcak iç / soğuk dış'],
  frames: [
    {t: '0:00', d: '3 sn', scene: 'Akşam, evde', say: 'Hava ne olursa olsun…', sfx: 'Yağmur camda, düşük piyano', svg: () => { const w = uid('w'), lamp = uid('l'), wood = uid('wd'), win = uid('wn'); return `<defs>${lg(w, [[0, '#4a2f1d'], [1, '#1f130b']])}${rg(lamp, [[0, '#ffcf8a', 0.55], [1, '#ffcf8a', 0]], 0.18, 0.28, 0.6)}${lg(wood, [[0, '#7a4a2e'], [1, '#4d2c19']], 0, 0, 1, 0)}<clipPath id="${win}"><rect x="72" y="86" width="36" height="46" rx="2"/></clipPath></defs>
      <rect width="180" height="320" fill="url(#${w})"/><rect x="42" y="64" width="96" height="200" fill="url(#${wood})"/><rect x="38" y="60" width="104" height="6" fill="#efe4d4"/><rect x="38" y="60" width="5" height="206" fill="#efe4d4"/><rect x="137" y="60" width="5" height="206" fill="#efe4d4"/>
      <rect x="54" y="78" width="72" height="70" rx="3" fill="#5a331e"/><rect x="54" y="156" width="72" height="96" rx="3" fill="#5a331e"/>
      <rect x="72" y="86" width="36" height="46" rx="2" fill="#1d2a44"/><g clip-path="url(#${win})">${rainLoop(26, 4, 72, 86, 36, 46, {len: 8, dx: -1, op: 0.75, cls: ''})}</g><rect x="72" y="86" width="36" height="46" rx="2" fill="url(#g-shine)" opacity="0.6"/>
      <circle cx="124" cy="170" r="2.6" fill="#e0b04d"/>
      <rect x="0" y="264" width="180" height="56" fill="#2a190e"/><ellipse cx="90" cy="292" rx="70" ry="12" fill="#6b2f22" opacity="0.65"/>
      <rect x="144" y="200" width="36" height="5" rx="1.5" fill="#8b5a37"/><rect x="149" y="205" width="3" height="59" fill="#5d3a22"/><rect x="174" y="205" width="3" height="59" fill="#5d3a22"/>
      ${phone(150, 156, 24, 44, uiCart(120, 242, {}), {r: 5, bez: 2, cw: 120})}<rect x="146" y="152" width="32" height="52" rx="8" fill="${BLUE}" opacity="0.12" filter="url(#f-glow)"/>${touch(162, 192, 3.2)}
      <g transform="translate(16 124)"><rect x="-4" y="-2" width="8" height="12" rx="3" fill="#2a1a10"/><circle cx="0" cy="16" r="9" class="twinkle" fill="#ffd9a0" opacity="0.9" filter="url(#f-glow)"/></g>
      <rect width="180" height="320" fill="url(#${lamp})"/>${capBand()}${caption(302, ['Hava ne olursa olsun…'], {s: 11})}`; }},
    {t: '0:03', d: '4 sn', scene: 'Zil: yağmur', say: 'Yağmurda…', sfx: 'Zil "din-don", sağanak, su sıçraması', svg: () => doorway(outsideRain(), 'rain') + capBand() + caption(304, ['Yağmurda…'], {s: 14})},
    {t: '0:07', d: '4 sn', scene: 'Zil: kar', say: 'karda…', sfx: 'Zil, rüzgâr, karda adım', svg: () => doorway(outsideSnow(), 'snow') + capBand() + caption(304, ['karda…'], {s: 14})},
    {t: '0:11', d: '3 sn', scene: 'Zil: çamur', say: 'çamurda…', sfx: 'Zil, çamurda lastik sesi', svg: () => doorway(outsideMud(), 'mud') + capBand() + caption(304, ['çamurda…'], {s: 14})},
    {t: '0:14', d: '3 sn', scene: 'Üç havanın izi', say: 'Yakınla kapında.', sfx: 'Kapı kapanır, sıcak oda tonu', svg: () => { const w = uid('w'), lamp = uid('l'), fl = uid('fl'); return `<defs>${lg(w, [[0, '#3f281a'], [1, '#1c120b']])}${rg(lamp, [[0, '#ffcf8a', 0.45], [1, '#ffcf8a', 0]], 0.5, 0.62, 0.7)}${lg(fl, [[0, '#6b4126'], [1, '#2a180d']])}</defs>
      <rect width="180" height="320" fill="url(#${w})"/><rect x="0" y="206" width="180" height="114" fill="url(#${fl})"/><rect x="0" y="203" width="180" height="4" fill="#2a190e"/>
      ${[['i-rain', 30], ['i-snow', 90], ['i-mud', 150]].map(([id, x], i) => `${anim(`pop s${i * 2 + 1}`, `<ellipse cx="${x}" cy="214" rx="20" ry="3.4" fill="#000" opacity="0.35"/>${icon('i-bag', x - 21, 152, 42)}`)}
        <g>${anim(`bob d${i + 1}`, `<circle cx="${x}" cy="${118}" r="22" fill="#fff" opacity="0.08"/>${icon(id, x - 19, 99, 38)}`)}</g>`).join('')}
      ${T(90, 74, 8, 'Üç hava, üç teslimat', {w: 700, c: '#ffe2b0', f: DISPLAY, op: 0.9})}
      <rect width="180" height="320" fill="url(#${lamp})"/>${capBand()}${caption(302, ['Yakınla kapında.'], {s: 13})}`; }},
    {t: '0:17', d: '3 sn', scene: 'Kapanış', say: "Afşin'deki depomuzdan, ortalama 60 dakikada.", sfx: 'Müzik çözülür, logo tınısı', svg: () => endCard((g) => lg(g, [[0, '#2a1a10'], [0.55, '#0e1a33'], [1, '#081022']]), ['Yağmurda, karda, çamurda'], "Afşin'deki depomuzdan, ortalama 60 dakikada")},
  ],
  notes: {
    'Görsel dil': 'Sinematik 3B. Sıcak iç mekânla kapı aralığından görünen soğuk dış dünya karşı karşıya. Kamera tek noktada sabit duruyor; her açılışta yalnızca hava değişiyor ve bu tekrar mesajın kendisi oluyor. Kurye yakın planda görünüyor, yüzü kadraj dışında.',
    'Ses': 'Zil her seferinde aynı "din-don". Arkasından gelen yağmur, rüzgâr ve çamur sesi her açılışta değişiyor. Sona doğru sıcak bir piyano teması. Dış ses yok, istenirse eklenebilir.',
    'Uygulama': 'Açılışta konsoldaki telefonda Sepetim ekranı açık ve "Öde" düğmesine dokunuluyor. Teslimat aracı uygulamadaki logolu beyaz minibüs; poşet de logolu.',
    'Üretim': 'Önceki kar videosundaki 3B altyapı (kapı, ışık, kar) kullanılıyor; yağmur ve çamur ekleniyor. Render uzun sürüyor (~40 dk) ama ücretsiz.',
  },
};

// ================= SENARYO 2: AFŞİN HAVA DURUMU =================
const tvBg = (g) => lg(g, [[0, '#0c2f7a'], [1, '#05163d']]);
const MAP_PATH = 'M30 96 Q46 70 84 74 Q120 66 146 88 Q162 112 150 150 Q156 182 128 204 Q96 222 64 208 Q30 196 26 160 Q14 128 30 96 Z';
const ticker = (label, text) => { const W = 84; const chunk = [0, 1, 2].map((i) => T(i * W, 0, 7, text, {a: 'start', w: 800}) + `<circle cx="${i * W + W - 9}" cy="-2.4" r="1.5" fill="#fff"/>`).join(''); return `<rect x="0" y="262" width="180" height="22" fill="#ff8a1f"/><g clip-path="url(#tk-clip)"><g transform="translate(60 276)">${anim('ticker', chunk, `--w:${W}px`)}</g></g><rect x="0" y="262" width="56" height="22" fill="#d9600a"/>${T(28, 276, 7, label, {w: 800, f: DISPLAY})}`; };
const tvChrome = (day, temp, label) => { const g = uid('tv'); return `<defs>${tvBg(g)}<pattern id="${g}s" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#fff" opacity="0.035"/></pattern></defs>
  <rect width="180" height="320" fill="url(#${g})"/><rect width="180" height="320" fill="url(#${g}s)"/>
  <rect x="8" y="12" width="72" height="16" rx="4" fill="#ff8a1f"/>${logo(10, 13, 14)}${T(49, 23.5, 7, 'AFŞİN HAVA', {w: 800, f: DISPLAY})}
  <rect x="128" y="12" width="44" height="16" rx="4" fill="#fff"/>${T(150, 23.5, 7.6, day, {w: 800, c: '#0c2f7a', f: DISPLAY})}
  ${T(22, 236, 28, temp, {w: 800, f: DISPLAY, a: 'start'})}${ticker(label, 'Yakınla: kapında')}${icon('i-ok', 160, 264, 18, 'pop s4')}`; };
const tvMap = (weatherIcons, particles) => { const m = uid('mp'), c = uid('mc'); return `<defs>${lg(m, [[0, '#3f8ff0'], [1, '#1e50ad']])}<clipPath id="${c}"><path d="${MAP_PATH}"/></clipPath></defs>
  <path d="${MAP_PATH}" fill="url(#${m})" stroke="#bfe0ff" stroke-width="1.4" filter="url(#f-soft)"/><path d="${MAP_PATH}" fill="url(#g-shine)" opacity="0.5"/>
  <g clip-path="url(#${c})">${particles}<g fill="none" stroke="#e9f3ff" stroke-opacity="0.2" stroke-width="1"><path d="M38 118 Q90 98 142 116"/><path d="M34 132 Q90 112 148 132"/><path d="M44 190 Q90 172 136 192"/><path d="M52 204 Q90 190 124 206"/></g></g>
  ${T(90, 142, 9, 'AFŞİN', {w: 800, ls: '1.5', op: 0.8, f: DISPLAY})}
  ${icon('i-depot', 36, 150, 22)}${icon('i-home', 116, 146, 24)}
  <path d="M58 162 Q90 176 116 160" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="4 2" class="flow"/>
  <g transform="translate(78 160)">${anim('route', at(0, 0, van({shadow: 0}), 0.17))}</g>
  ${icon('i-ok', 132, 140, 14, 'pop s2')}${weatherIcons}`; };

const S2 = {
  key: 'hava-durumu', n: 2, name: 'Afşin Hava Durumu',
  logline: 'Eğlenceli bir TV hava durumu bülteni parodisi. Haritada günler geçer: Pazartesi yağmur, Salı kar, Çarşamba çamur. Hava ne gösterirse göstersin, kayan alt bantta hep aynı haber yazar: "Yakınla: kapında." Sonunda haftalık tahmin tablosunun her gününde aynı onay işareti durur.',
  chips: ['2B TV grafiği', '20 sn', 'Mizahi', 'Kayan alt bant'],
  frames: [
    {t: '0:00', d: '3 sn', scene: 'Bülten jeneriği', say: 'AFŞİN HAVA DURUMU', sfx: 'Retro TV jeneriği', svg: () => { const g = uid('tb'), sw = uid('sw'); return `<defs>${tvBg(g)}<linearGradient id="${sw}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a1f" stop-opacity="0"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0.55"/></linearGradient></defs><rect width="180" height="320" fill="url(#${g})"/>
      ${[70, 54, 38].map((r, i) => `<circle cx="90" cy="130" r="${r}" fill="none" stroke="#3f8ff0" stroke-width="${1.4 - i * 0.3}" opacity="${0.5 + i * 0.2}"/>`).join('')}
      <g class="spin" style="transform-origin:90px 130px"><path d="M90 130 L90 60 A70 70 0 0 1 150 94 Z" fill="url(#${sw})"/></g>
      ${[['i-rain', 46, 86], ['i-flake', 124, 80], ['i-mud', 128, 150]].map(([id, x, y], i) => icon(id, x - 10, y - 10, 20, `bob d${i + 1}`)).join('')}
      <g transform="translate(90 130)">${anim('halo', `<circle r="26" fill="none" stroke="#fff" stroke-width="1.4"/>`)}<circle r="24" fill="#fff" opacity="0.12"/></g>${logo(66, 106, 48)}
      ${T(90, 218, 34, 'AFŞİN', {w: 800, f: DISPLAY, ls: '1'})}${anim('pop s2', `<rect x="22" y="226" width="136" height="20" rx="3" fill="#ff8a1f"/>${T(90, 240.5, 12, 'HAVA DURUMU', {w: 800, f: DISPLAY, ls: '1'})}`)}
      ${T(90, 264, 7, 'sunar: Yakınla', {w: 700, op: 0.8})}<rect x="8" y="12" width="32" height="12" rx="3" fill="#e5322d"/><circle cx="14" cy="18" r="2" fill="#fff" class="twinkle"/>${T(26, 20.4, 5.8, 'CANLI', {w: 800})}`; }},
    {t: '0:03', d: '4 sn', scene: 'Pazartesi: yağmur', say: 'PZT · YAĞMUR · Yakınla: kapında', sfx: "Yağmur jingle'ı", svg: () => tvChrome('PZT', '8°', 'YAĞMUR') + tvMap(icon('i-rain', 52, 92, 36, 'bob') + icon('i-rain', 102, 100, 28, 'bob d2'), rainLoop(50, 7, 20, 60, 140, 170, {len: 9, dx: -2, op: 0.6, col: '#d6ecff'}))},
    {t: '0:07', d: '4 sn', scene: 'Salı: kar', say: 'SAL · KAR · Yakınla: kapında', sfx: "Kar jingle'ı, çan", svg: () => tvChrome('SAL', '-3°', 'KAR') + tvMap(icon('i-snow', 52, 92, 36, 'bob') + icon('i-flake', 108, 102, 22, 'bob d2'), snowLoop(44, 13, 20, 60, 140, 170, {rmin: 0.6, rmax: 1.9}))},
    {t: '0:11', d: '3 sn', scene: 'Çarşamba: çamur', say: 'ÇAR · ÇAMUR · Yakınla: kapında', sfx: 'Komik "vıcık" efekti', svg: () => tvChrome('ÇAR', '6°', 'ÇAMUR') + tvMap(icon('i-mud', 50, 92, 38, 'bob') + icon('i-partly', 104, 98, 28, 'bob d2'), splats(16, 23, 34, 104, 112, 90, '#7a5532', 2.2))},
    {t: '0:14', d: '3 sn', scene: 'Haftalık tahmin', say: 'Her gün: Yakınla kapında', sfx: 'Tik tik sayan grafik sesi', svg: () => { const g = uid('tw'); const days = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ']; const ic = ['i-rain', 'i-snow', 'i-mud', 'i-partly', 'i-sun', 'i-rain', 'i-snow'];
      return `<defs>${tvBg(g)}</defs><rect width="180" height="320" fill="url(#${g})"/>${T(90, 56, 14, 'HAFTALIK', {w: 800, f: DISPLAY})}${T(90, 72, 14, 'TAHMİN', {w: 800, c: '#ff8a1f', f: DISPLAY})}
      ${days.map((d, i) => { const row = Math.floor(i / 4); const x = 16 + (i % 4) * 40 + (row ? 20 : 0), y = 88 + row * 86; return anim(`pop s${i + 1}`, `<rect x="${x}" y="${y}" width="34" height="78" rx="7" fill="#fff" opacity="0.1"/><rect x="${x}" y="${y}" width="34" height="78" rx="7" fill="none" stroke="#fff" stroke-opacity="0.18"/>${T(x + 17, y + 13, 7, d, {w: 800, f: DISPLAY})}${icon(ic[i], x + 4, y + 18, 26)}${logo(x + 10, y + 48, 14)}${icon('i-ok', x + 20, y + 60, 12, '', false)}`); }).join('')}
      <rect x="0" y="262" width="180" height="22" fill="#ff8a1f"/>${T(90, 276, 7.6, 'Teslimat her gün · ortalama 60 dk', {w: 800})}`; }},
    {t: '0:17', d: '3 sn', scene: 'Kapanış', say: 'Hava ne olursa olsun, Yakınla kapında.', sfx: 'Bülten kapanış müziği', svg: () => endCard(tvBg, ['Hava ne olursa olsun,', 'Yakınla kapında.'], "Afşin'deki depomuzdan, ortalama 60 dakikada")},
  ],
  notes: {
    'Görsel dil': 'Yerel TV hava durumu estetiği: lacivert stüdyo, turuncu kayan alt bant, büyük sıcaklık rakamları. Haritada süzülen premium hava ikonları, harita içinde yağan yağmur ve kar, kesik çizgili rota üzerinde ilerleyen minibüs. Tarama çizgileri ve dönen radar.',
    'Ses': "Retro bülten müziği. Her güne kendi kısa jingle'ı ve efekti (yağmur, çan, \"vıcık\"). Spiker yok; dış ses istenirse bülten tonunda eklenebilir.",
    'Uygulama': 'Haritadaki rota, uygulamanın teslimat çubuğundaki beyaz minibüsle çizilir. Kapanışta mağaza rozetleri büyük.',
    'Üretim': '2B hareketli grafik (Remotion), hızlı render (~5 dk). Mizahi ton paylaşılabilirliği artırır. Gerçek bir hava tahmini olmadığı açıkça bellidir.',
  },
};

// ================= SENARYO 3: UYGULAMADAN KAPIYA =================
const S3 = {
  key: 'uygulamadan-kapiya', n: 3, name: 'Uygulamadan Kapıya',
  logline: 'Kahraman uygulamanın kendisi. Telefon ekranı ön planda: yağmur damlaları camın üstünden süzülür, kar telefonun kenarında birikir, çamur ekrana sıçrar ve bir silecek gibi silinir. Bu sırada Kategoriler\'den ürün eklenir, Sepetim\'de "Öde"ye basılır ve teslimat çubuğundaki minibüs ilerler.',
  chips: ['Uygulama + hava efekti', '20 sn', 'Ürün tanıtımı', 'Gerçek arayüz'],
  frames: [
    {t: '0:00', d: '3 sn', scene: 'Yağmurlu cam', say: 'Yağmur mu var?', sfx: 'Cama vuran yağmur', svg: () => { const b = uid('bb'); return `<defs>${lg(b, [[0, '#55657d'], [1, '#232c3b']])}</defs><rect width="180" height="320" fill="url(#${b})"/>${bokeh(9, 1)}
      ${phone(26, 30, 128, 250, uiCategories(120, 242, {}))}${glassDrops(26, 3, 30, 36, 120, 240)}${icon('i-rain', 140, 2, 36, 'bob')}${capBand()}${caption(304, ['Yağmur mu var?'], {s: 12})}`; }},
    {t: '0:03', d: '4 sn', scene: 'Ürün ekle', say: 'Uygulamadan ekle,', sfx: 'Dokunma "tık"ları, sepet sayacı', svg: () => { const b = uid('bb'); return `<defs>${lg(b, [[0, '#55657d'], [1, '#232c3b']])}</defs><rect width="180" height="320" fill="url(#${b})"/>${bokeh(9, 7)}
      ${phone(26, 30, 128, 250, uiCategories(120, 242, {added: [0, 1], cart: 3}))}${touch(141, 148, 5.5)}${glassDrops(18, 41, 30, 36, 120, 240)}${capBand()}${caption(304, ['Uygulamadan ekle,'], {s: 12})}`; }},
    {t: '0:07', d: '4 sn', scene: 'Sepetim, kar yağıyor', say: 'kar mı yağıyor?', sfx: 'Rüzgâr, kar tıssı', svg: () => { const b = uid('bb'), fr = uid('fr'); return `<defs>${lg(b, [[0, '#14223f'], [1, '#33497a']])}${rg(fr, [[0.55, '#fff', 0], [1, '#eef5ff', 0.8]], 0.5, 0.5, 0.75)}</defs><rect width="180" height="320" fill="url(#${b})"/>${snowLoop(46, 5, 0, 0, 180, 320, {rmin: 0.6, rmax: 2.2})}
      ${phone(26, 30, 128, 250, uiCart(120, 242, {progress: 0.82}))}<rect x="26" y="30" width="128" height="250" rx="15" fill="url(#${fr})"/>
      <path d="M24 34 Q40 18 60 28 Q74 16 92 26 Q110 14 128 26 Q146 18 158 34 Q140 37 90 37 Q40 37 24 34 Z" fill="#fff" filter="url(#f-soft)"/>${icon('i-flake', 6, 14, 26, 'bob')}${capBand()}${caption(304, ['kar mı yağıyor?'], {s: 12})}`; }},
    {t: '0:11', d: '3 sn', scene: '"Öde"', say: 'Öde, gerisi bizde.', sfx: 'Onay tınısı', svg: () => { const b = uid('bb'); return `<defs>${lg(b, [[0, '#14223f'], [1, '#33497a']])}</defs><rect width="180" height="320" fill="url(#${b})"/>${snowLoop(24, 15, 0, 0, 180, 320, {rmin: 0.6, rmax: 2})}
      ${phone(26, 30, 128, 250, uiCart(120, 242, {progress: 0.96, pressed: true, move: true}))}${touch(90, 241, 6)}
      ${anim('pop s3', `<rect x="36" y="114" width="108" height="34" rx="12" fill="#0b1a33" opacity="0.92"/>${icon('i-ok', 42, 119, 24, '', false)}${T(70, 135, 9, 'Siparişin yolda', {a: 'start', w: 800})}`)}${capBand()}${caption(304, ['Öde, gerisi bizde.'], {s: 12})}`; }},
    {t: '0:14', d: '3 sn', scene: 'Çamur ve silecek', say: 'Çamurda bile kapında.', sfx: 'Su sıçraması, silecek "vııın"', svg: () => { const s = uid('sk'), m = uid('md'); return `<defs>${lg(s, [[0, '#8794a4'], [1, '#c6ccd4']])}${lg(m, [[0, '#7a5a3a'], [1, '#432d19']])}</defs>
      <rect width="180" height="320" fill="url(#${s})"/><path d="M0 150 L50 118 L90 140 L140 110 L180 130 V190 H0 Z" fill="#6c7a8a" opacity="0.55"/>${houses(190, 21, '#b5a38a', 0.1)}<rect y="186" width="180" height="134" fill="url(#${m})"/>
      ${vanAt(22, 166, 1.0, {mud: true}, 'drive')}
      ${anim('pop s2', `<g fill="#5f3f22">${[...Array(14)].map((_, i) => `<circle cx="${(126 + rnd(i) * 44).toFixed(1)}" cy="${(168 + rnd(i * 3) * 48).toFixed(1)}" r="${(1.5 + rnd(i * 5) * 4).toFixed(1)}"/>`).join('')}</g>`)}
      ${anim('mudglass', splats(26, 51, 0, 16, 90, 150, '#4f341c', 4))}
      <g class="wiper" style="transform-origin:8px 318px"><path d="M8 318 L150 176" stroke="#11161f" stroke-width="3.4" stroke-linecap="round"/><path d="M60 266 L150 176" stroke="#2b3342" stroke-width="1.6" stroke-linecap="round"/></g>
      ${anim('pop s4', `<rect x="86" y="24" width="86" height="30" rx="12" fill="${AMBER}" filter="url(#f-soft)"/>${icon('i-ok', 90, 28, 22, '', false)}${T(116, 43.5, 10, 'Kapında!', {a: 'start', w: 800, c: INK, f: DISPLAY})}`)}${capBand()}${caption(304, ['Çamurda bile kapında.'], {s: 12})}`; }},
    {t: '0:17', d: '3 sn', scene: 'Kapanış', say: 'Uygulamayı indir', sfx: 'Logo tınısı', svg: () => { const g = uid('lc'); return `<defs>${lg(g, [[0, '#f4f7fc'], [1, '#d9e4f5']])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${anim('bob', phone(52, 18, 76, 148, uiCategories(120, 242, {cart: 18}), {r: 11, bez: 3, cw: 120}))}${icon('i-rain', 14, 40, 30, 'bob d1')}${icon('i-snow', 136, 70, 30, 'bob d2')}${icon('i-mud', 16, 118, 28, 'bob d3')}
      ${logo(43, 172, 22)}${T(71, 189, 16, 'Yakınla', {a: 'start', w: 800, c: INK, f: 'Inter, sans-serif'})}
      ${T(90, 208, 9, 'Yağmurda, karda, çamurda', {w: 800, c: BLUE_D, f: DISPLAY})}${T(90, 220, 6.6, 'ortalama 60 dakikada kapında', {w: 700, c: INK, op: 0.8})}
      ${anim('pop s3', badges(28, 232, 58))}${T(90, 268, 8, 'Uygulamayı indir · yakinla.com', {w: 800, c: INK})}${T(90, 281, 5.2, 'Şu an aktif bölgemiz: Kahramanmaraş Afşin', {w: 600, c: INK, op: 0.7})}`; }},
  ],
  notes: {
    'Görsel dil': 'Uygulama arayüzü ön planda, hava camın üstünde bir katman olarak var: süzülen damlalar, kenarda biriken kar, kırağı, çamur sıçraması ve silecek. Arkada bulanık sokak ışıkları. Durumlar premium ikonlarla (onay, hava) vurgulanıyor.',
    'Ses': 'Dokunma ve sepet sayacı sesleri, yağmur, rüzgâr, "Öde" onay tınısı ve silecek. Ritmik, modern bir müzik. Dış ses yok.',
    'Uygulama': 'Kategoriler (Su, Pet Şişe, ürün kartları, sol menü) ve Sepetim (ürün satırları, adet, teslimat çubuğu, "Öde") ekran görüntülerindeki düzenle çiziliyor. Fiyat, indirim ve teslimat ücreti alanları boş bırakılıyor; ürünler jenerik.',
    'Üretim': '2B arayüz animasyonu ve hava efektleri (Remotion), hızlı render (~5 dk). Uygulamayı en net gösteren seçenek.',
  },
};

// ================= SENARYO 4: TESLİMAT YOLU =================
const gameHud = (lvl, name, p) => `<rect x="6" y="10" width="168" height="22" rx="9" fill="#0b1a33" opacity="0.85"/>
  <rect x="10" y="14" width="36" height="14" rx="6" fill="${AMBER}"/>${T(28, 24, 7, lvl, {w: 800, c: INK, f: DISPLAY})}${T(52, 24.5, 7, name, {a: 'start', w: 800, f: DISPLAY})}
  <rect x="98" y="18" width="52" height="6" rx="3" fill="#fff" opacity="0.18"/>${anim('grow', `<rect x="98" y="18" width="${52 * p}" height="6" rx="3" fill="#2ecc71"/>`)}
  ${icon('i-bag', 154, 12, 15, '', false)}`;
const gameGround = (top, col, edge) => `<rect y="${top}" width="180" height="${320 - top}" fill="${col}"/><rect y="${top}" width="180" height="5" fill="${edge}"/>`;
const parallax = (inner, cls = 'scroll') => anim(cls, `${inner}<g transform="translate(180 0)">${inner}</g>`);
const hills = (y, col, seed) => { let d = `M0 ${y}`; for (let x = 0; x <= 180; x += 30) d += ` Q${x + 15} ${y - 18 - rnd(seed + x) * 22} ${x + 30} ${y}`; return `<path d="${d} V320 H0 Z" fill="${col}"/>`; };
const banner = (txt, col, tcol = INK, rot = -4, w = 112) => `<g transform="rotate(${rot})"><rect x="${-w / 2}" y="-16" width="${w}" height="30" rx="9" fill="${col}" stroke="#1b2338" stroke-width="2" filter="url(#f-soft)"/>${T(0, 5, 12, txt, {w: 800, c: tcol, f: DISPLAY})}</g>`;

const S4 = {
  key: 'teslimat-yolu', n: 4, name: 'Teslimat Yolu',
  logline: 'Bir mobil oyun gibi. Yakınla minibüsü yan kaydırmalı bir parkurda üç bölümü geçer: Yağmur (su birikintileri), Kar (karlı tümsekler), Çamur (vıcık vıcık köy yolu). Her bölüm sonunda "Geçildi!" yazar. Son seviyede kapı açılır: "KAPINDA!", üç yıldız.',
  chips: ['Oyun / platform', '20 sn', 'Eğlenceli', 'Genç kitle'],
  frames: [
    {t: '0:00', d: '3 sn', scene: 'Başlık ekranı', say: 'YAKINLA: TESLİMAT YOLU', sfx: '8-bit jingle, "Başla" tıkı', svg: () => { const g = uid('gt'); return `<defs>${lg(g, [[0, '#ff9a5a'], [0.5, '#ff6f91'], [1, '#5b5bd6']])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${parallax(hills(214, '#3e3891', 3), 'scroll')}${gameGround(236, '#2f2a6e', '#5d4fb0')}
      ${T(90, 70, 30, 'YAKINLA', {w: 800, f: DISPLAY, ls: '1'})}${anim('pop s1', `<rect x="26" y="78" width="128" height="20" rx="5" fill="${AMBER}" transform="rotate(-3 90 88)"/>${T(90, 93, 11, 'TESLİMAT YOLU', {w: 800, c: INK, f: DISPLAY})}`)}
      ${at(40, 184, anim('bounce', van({lights: true})), 1)}
      ${at(90, 132, anim('press', `<rect x="-38" y="-14" width="76" height="28" rx="13" fill="#2ecc71" stroke="#1b2338" stroke-width="2" filter="url(#f-soft)"/>${T(0, 6, 13, 'BAŞLA', {w: 800, f: DISPLAY})}`))}${touch(122, 142, 4)}
      ${['i-rain', 'i-snow', 'i-mud'].map((id, i) => `<circle cx="${50 + i * 40}" cy="272" r="16" fill="#1b2338" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>${icon(id, 50 + i * 40 - 13, 259, 26, `bob d${i + 1}`)}`).join('')}`; }},
    {t: '0:03', d: '4 sn', scene: 'Bölüm 1: Yağmur', say: '1-1 YAĞMUR', sfx: 'Sıçrayan su birikintileri', svg: () => { const g = uid('g1'); return `<defs>${lg(g, [[0, '#3b4963'], [1, '#7f90ad']])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${parallax(hills(196, '#33405a', 9), 'scroll')}${parallax(houses(236, 31, '#27324a', 0.45, false, 180), 'scroll fast')}${gameGround(236, '#283042', '#56627b')}
      <ellipse cx="112" cy="248" rx="28" ry="4" fill="#9cc4ff" opacity="0.55"/>${at(56, 194, anim('bounce', van({wet: true, lights: true})), 0.85)}
      ${anim('pop', `<g fill="#bfe0ff">${[...Array(12)].map((_, i) => `<circle cx="${(104 + rnd(i) * 32).toFixed(1)}" cy="${(220 + rnd(i * 2) * 20).toFixed(1)}" r="${(1 + rnd(i * 5) * 2.2).toFixed(1)}"/>`).join('')}</g>`)}
      ${rainLoop(90, 17, 0, 30, 180, 290, {len: 14, op: 0.55})}${gameHud('1-1', 'YAĞMUR', 0.33)}`; }},
    {t: '0:07', d: '4 sn', scene: 'Bölüm 2: Kar', say: '1-2 KAR', sfx: 'Zıplama "boing", kar çıtırtısı', svg: () => { const g = uid('g2'); return `<defs>${lg(g, [[0, '#8fb8f5'], [1, '#e6f0ff']])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${parallax(`<path d="M0 180 L40 130 L70 160 L110 110 L150 150 L180 130 V240 H0 Z" fill="#c4d6f1"/><path d="M40 130 L50 142 L60 136 L70 160 L40 160 Z" fill="#fff" opacity="0.75"/><path d="M110 110 L122 126 L134 120 L150 150 L110 150 Z" fill="#fff" opacity="0.75"/>`)}
      ${gameGround(236, '#f4f8ff', '#d9e5f6')}<path d="M70 236 Q100 204 130 236 Z" fill="#fff" stroke="#d9e5f6"/>
      ${at(96, 186, anim('jump', at(-50, -26, van({snow: true}), 1)), 0.85)}${snowLoop(60, 33, 0, 30, 180, 290, {rmin: 0.8, rmax: 2.6})}
      ${at(124, 118, anim('pop s2', banner('ZIPLA!', '#2ecc71', '#fff', -6, 60)))}${gameHud('1-2', 'KAR', 0.66)}`; }},
    {t: '0:11', d: '3 sn', scene: 'Bölüm 3: Çamur', say: '1-3 ÇAMUR · GEÇİLDİ!', sfx: '"Vıcık" ve motor gazı', svg: () => { const g = uid('g3'); return `<defs>${lg(g, [[0, '#a3b195'], [1, '#d8d2b8']])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${parallax(hills(200, '#7b8d67', 21) + [20, 70, 140].map((x) => `<g transform="translate(${x} 202)"><rect x="-2" y="0" width="4" height="34" fill="#5b4632"/><circle cy="-8" r="14" fill="#6a8551"/><circle cx="-5" cy="-12" r="6" fill="#86a56a"/></g>`).join(''))}
      ${gameGround(236, '#6b4a2b', '#8a6440')}<ellipse cx="96" cy="250" rx="42" ry="6" fill="#4a321c"/>${at(52, 194, anim('bounce', van({mud: true})), 0.85)}
      ${anim('pop s1', `<g fill="#5f3f22">${[...Array(18)].map((_, i) => `<circle cx="${(60 + rnd(i) * 90).toFixed(1)}" cy="${(204 + rnd(i * 3) * 36).toFixed(1)}" r="${(1.2 + rnd(i * 5) * 3.4).toFixed(1)}"/>`).join('')}</g>`)}
      ${at(90, 120, anim('pop s3', banner('ÇAMUR GEÇİLDİ!', AMBER)))}${gameHud('1-3', 'ÇAMUR', 0.95)}`; }},
    {t: '0:14', d: '3 sn', scene: 'Hedef: kapı', say: 'KAPINDA! Üç yıldız', sfx: "Zafer jingle'ı, zil", svg: () => { const g = uid('g4'), warm = uid('wm'); return `<defs>${lg(g, [[0, '#ffb36b'], [1, '#ffe2b5']])}${rg(warm, [[0, '#ffd08a', 0.8], [1, '#ffd08a', 0]])}</defs><rect width="180" height="320" fill="url(#${g})"/>
      ${gameGround(236, '#7d9a5a', '#9fbd77')}<g transform="translate(96 150)"><rect x="0" y="0" width="76" height="86" fill="#f2e4ca"/><polygon points="-6,0 38,-30 82,0" fill="#c4553c"/><rect x="10" y="40" width="22" height="46" fill="#ffd28f"/><circle cx="21" cy="64" r="30" fill="url(#${warm})"/><polygon points="10,40 2,36 2,90 10,86" fill="#6a4029"/><rect x="46" y="18" width="18" height="16" rx="2" fill="#ffc26b"/></g>
      ${at(4, 202, van({mud: true}), 0.6)}${anim('pop s2', icon('i-bag', 82, 202, 30))}
      ${at(90, 92, anim('pop s1', `<rect x="-62" y="-20" width="124" height="36" rx="12" fill="${BLUE}" stroke="#1b2338" stroke-width="2" filter="url(#f-soft)"/>${T(0, 6, 17, 'KAPINDA!', {w: 800, f: DISPLAY})}`))}
      ${[-28, 0, 28].map((dx, i) => icon('i-star', 90 + dx - (i === 1 ? 13 : 11), (i === 1 ? 112 : 118), i === 1 ? 26 : 22, `pop s${i + 3}`)).join('')}
      <rect x="40" y="274" width="100" height="18" rx="9" fill="#0b1a33" opacity="0.88"/>${T(90, 286, 7, 'Süre: ortalama 60 dk', {w: 800})}`; }},
    {t: '0:17', d: '3 sn', scene: 'Kapanış', say: 'Oyun değil, gerçek: Yakınla kapında.', sfx: 'Bölüm sonu müziği', svg: () => endCard((g) => lg(g, [[0, '#ff6f91'], [0.5, '#5b5bd6'], [1, '#1f2a6b']]), ['Oyun değil, gerçek:', 'Yakınla kapında.'], 'Yağmurda, karda, çamurda · ortalama 60 dakikada')},
  ],
  notes: {
    'Görsel dil': 'Renkli, kalın konturlu oyun çizimi. Yan kaydırmalı parallax katmanlar, üstte oyun göstergesi (bölüm, dolan ilerleme çubuğu, poşet), "Geçildi!" ve yıldız animasyonları. Dört senaryo içinde en farklı ve en genç dil bu.',
    'Ses': '8-bit esintili chiptune müzik; zıplama, sıçrama, "vıcık" ve zafer efektleri. Dış ses yok.',
    'Uygulama': 'Oyuncu karakter, uygulamadaki logolu beyaz minibüs. Göstergedeki ilerleme çubuğu, uygulamanın yeşil teslimat çubuğunu andırıyor.',
    'Üretim': "2B parallax çizim (Remotion), hızlı render (~6 dk). Esprili ama hızlı okunuyor; Reels'te dikkat çekici bir kanca.",
  },
};

const SCENARIOS = [S1, S2, S3, S4];

// ---------- sayfa ----------
const tabs = document.getElementById('tabs');
const boards = document.getElementById('boards');
tabs.innerHTML = SCENARIOS.map((s) => `<a href="#${s.key}" data-key="${s.key}"><span class="n">${s.n}</span>${s.name}</a>`).join('');
boards.innerHTML = SCENARIOS.map((s) => `<section class="board" id="b-${s.key}" aria-labelledby="h-${s.key}" hidden>
  <div class="board-head"><div class="board-num">${s.n}</div><div class="board-title"><h2 id="h-${s.key}">${s.name}</h2><p>${s.logline}</p></div>
  <div class="chips">${s.chips.map((c, i) => `<span class="chip${i === 0 ? ' style' : ''}">${c}</span>`).join('')}</div></div>
  <div class="strip-scroll"><div class="strip">${s.frames.map((f, i) => `<figure class="frame">${frameSvg(`<defs><linearGradient id="cap-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient><clipPath id="tk-clip"><rect x="56" y="262" width="124" height="22"/></clipPath></defs>${f.svg()}`, `${s.name}, sahne ${i + 1}: ${f.scene}`)}
    <div class="tc"><b>${f.t}</b><span>${f.d}</span></div>
    <figcaption><span class="scene">${i + 1}. ${f.scene}</span><span class="say">${f.say}</span><span class="sfx">${f.sfx}</span></figcaption></figure>`).join('')}</div></div>
  <div class="notes">${Object.entries(s.notes).map(([k, v]) => `<div><h3>${k}</h3><p>${v}</p></div>`).join('')}</div>
</section>`).join('');

const show = () => {
  const key = (location.hash || '').slice(1);
  const cur = SCENARIOS.find((s) => s.key === key) || SCENARIOS[0];
  SCENARIOS.forEach((s) => { document.getElementById(`b-${s.key}`).hidden = s !== cur; });
  tabs.querySelectorAll('a').forEach((a) => { if (a.dataset.key === cur.key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
};
window.addEventListener('hashchange', show);
show();

const motionBtn = document.getElementById('motion');
motionBtn.addEventListener('click', () => {
  const still = document.body.classList.toggle('still');
  motionBtn.setAttribute('aria-pressed', String(still));
  document.getElementById('motion-label').textContent = still ? 'Animasyonu oynat' : 'Animasyonu durdur';
});
