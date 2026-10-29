#!/usr/bin/env python3
"""Turns the official logo (assets/kripto724-logo.png: black "kripto / 724" with an
orange bar, on white) into two alpha masks so the boards can recolour the letters
(black on light backgrounds, white on dark ones) while the bar keeps its brand
orange #F7931A. Writes lib/k724logo.js with both masks as data URIs.

    python3 tools/make_logo.py
"""
import base64
import io
import pathlib

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
a = np.asarray(Image.open(ROOT / 'assets' / 'kripto724-logo.png').convert('RGB')).astype(float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# bar coverage: how far a pixel is from white toward the orange (247,147,26), via the blue channel drop,
# only where the pixel is warm (red clearly above blue)
warm = (r - b) > 40
bar = np.where(warm, np.clip((255 - b) / (255 - 26), 0, 1), 0)
# letter coverage: darkness, excluding the bar's own pixels
lum = (r + g + b) / 3
ink = np.where(warm, 0, np.clip((255 - lum) / (255 - 10), 0, 1))
ys, xs = np.nonzero((ink > 0.02) | (bar > 0.02))
x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3


def mask_uri(m):
    m = m[y0:y1, x0:x1]
    img = Image.new('LA', (m.shape[1], m.shape[0]))
    img.putdata([(255, int(v * 255 + 0.5)) for v in m.flatten()])
    buf = io.BytesIO()
    img.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


js = f"""'use strict';
/* Official kripto724 logo (assets/kripto724-logo.png) as two alpha masks, made by
 * tools/make_logo.py. logo(g, cx, cy, h, o) draws it centred at (cx, cy), h px tall:
 *   o.ink  letter colour (default #0A0A0A; use white on dark backgrounds)
 *   o.bar  bar colour (default brand orange #F7931A)
 * logoW(h) is the width at height h. Proportions are never changed. */
const K724 = {{ w: {x1 - x0}, h: {y1 - y0}, ink: new Image(), bar: new Image(), tint: {{}} }};
K724.ink.src = '{mask_uri(ink)}';
K724.bar.src = '{mask_uri(bar)}';
K724.ready = Promise.all([K724.ink.decode(), K724.bar.decode()]);
const K724_ORANGE = '#F7931A';
function k724Tinted(which, col) {{
  const key = which + col;
  if (!K724.tint[key]) {{
    const src = K724[which], c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in';
    x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); K724.tint[key] = c;
  }}
  return K724.tint[key];
}}
function logoW(h) {{ return h * K724.w / K724.h; }}
function logo(g, cx, cy, h, o = {{}}) {{
  const w = logoW(h), x = cx - w / 2, y = cy - h / 2;
  g.save(); g.imageSmoothingQuality = 'high';
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.drawImage(k724Tinted('bar', o.bar || K724_ORANGE), x, y, w, h);
  g.drawImage(k724Tinted('ink', o.ink || '#0A0A0A'), x, y, w, h);
  g.restore();
  return w;
}}
"""
(ROOT / 'lib' / 'k724logo.js').write_text(js)
print(f'logo box {x1 - x0}×{y1 - y0} → lib/k724logo.js ({len(js) // 1024} KB)')
