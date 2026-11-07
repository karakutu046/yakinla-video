// Sahnelerin ortak degradeleri ve filtreleri (ikon setine ek olarak)
const lg = (id: string, stops: [number, string, number?][], x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</linearGradient>`;
const rg = (id: string, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</radialGradient>`;

export const STATIC_DEFS = [
  // stüdyo
  lg('g-studio', [[0, '#123f9e'], [0.45, '#0a2766'], [1, '#030c26']]),
  rg('g-glow', [[0, '#3d8bff', 0.55], [0.55, '#1f5fd0', 0.18], [1, '#1f5fd0', 0]]),
  rg('g-vignette', [[0.55, '#000', 0], [1, '#000', 0.55]], 0.5, 0.45, 0.75),
  lg('g-sweep', [[0, '#fff', 0], [0.5, '#fff', 0.09], [1, '#fff', 0]], 0, 0, 1, 0),
  lg('g-radar', [[0, '#ff8a1f', 0], [1, '#ff8a1f', 0.6]], 0, 0, 1, 0),
  // harita
  lg('g-map', [[0, '#5aa6ff'], [0.55, '#2c73e6'], [1, '#1b55c4']]),
  lg('g-map-side', [[0, '#0f3d96'], [1, '#06235f']]),
  lg('g-shine2', [[0, '#fff', 0.42], [0.5, '#fff', 0]], 0, 0, 0.6, 1),
  lg('g-route', [[0, '#9ff5c4'], [1, '#22c55e']], 0, 0, 1, 0),
  // TV grafikleri
  lg('g-orange', [[0, '#ffa743'], [1, '#ff7410']]),
  lg('g-orange-d', [[0, '#e86d12'], [1, '#c24f06']]),
  lg('g-band-blue', [[0, '#3B8BFF'], [0.5, '#1F73F0'], [1, '#0E5FE0']]),
  lg('g-temp', [[0, '#ffffff'], [1, '#bcd6ff']]),
  lg('g-temp-ice', [[0, '#ffffff'], [1, '#8fd0ff']]),
  lg('g-card', [[0, '#ffffff', 0.16], [1, '#ffffff', 0.06]]),
  lg('g-bar', [[0, '#5ff0a0'], [1, '#22c55e']], 0, 0, 1, 0),
  rg('g-frost', [[0.5, '#e8f4ff', 0], [0.82, '#e8f4ff', 0.28], [1, '#ffffff', 0.85]], 0.5, 0.5, 0.72),
  // minibüs
  lg('g-van', [[0, '#ffffff'], [0.7, '#eef2f8'], [1, '#cfd9e8']]),
  lg('g-van-win', [[0, '#4d6c9e'], [1, '#1d3561']]),
  rg('g-van-rim', [[0, '#d8dee8'], [1, '#6b7486']]),
  // çamur
  rg('g-mudblob', [[0, '#8a5d33'], [0.7, '#5c3a1c'], [1, '#3f2712']], 0.4, 0.35, 0.7),
  rg('g-drop2', [[0, '#ffffff', 0.55], [0.6, '#d8ecff', 0.22], [1, '#9cc8ff', 0.4]], 0.4, 0.35, 0.7),
  // kapanış
  lg('g-end', [[0, '#3B8BFF'], [0.52, '#1F73F0'], [1, '#0E5FE0']], 0, 0, 0.4, 1),
  rg('g-endglow', [[0, '#ffffff', 0.32], [1, '#ffffff', 0]]),
  `<filter id="f-soft2" x="-40%" y="-40%" width="180%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2"/><feOffset dy="3.2"/><feComponentTransfer><feFuncA type="linear" slope=".4"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
  `<filter id="f-blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`,
  `<filter id="f-blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>`,
  `<pattern id="pt-scan" width="4" height="1.5" patternUnits="userSpaceOnUse"><rect width="4" height="0.6" fill="#fff" opacity=".045"/></pattern>`,
].join('');
