#!/usr/bin/env python3
"""Turns the raw downloads in assets/src/ into the files the video uses (assets/*).

Run by fetch-assets.sh. Screenshots keep their full resolution; the 25 feature cards
are downsized for the feature wall, customer logos are trimmed to a common height.
"""
import json
import re
import shutil
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'assets' / 'src'
OUT = ROOT / 'assets'


def src(path):
    return SRC / path.replace('/', '__')


def copy(path, dest):
    d = OUT / dest
    d.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src(path), d)


I = 'apps/www/public/images'

# Official logo files from Supabase's brand-assets.zip
with zipfile.ZipFile(src('apps/www/public/brand-assets.zip')) as z:
    for name in ('supabase-logo-wordmark--dark.svg',):
        (OUT / 'logo').mkdir(parents=True, exist_ok=True)
        (OUT / 'logo' / name).write_bytes(z.read(f'brand-assets/{name}'))

# Real dashboard screenshots and product artwork from supabase.com
for p, d in {
    'index/dashboard/supabase-table-editor.png': 'shots/table-editor.png',
    'index/dashboard/supabase-sql-editor.png': 'shots/sql-editor.png',
    'product/auth/header--dark.png': 'product/auth.png',
    'product/storage/header--dark.png': 'product/storage.png',
    'product/vector/vector-tools-dark.png': 'product/vector-tools.png',
    'launchweek/15/lw15-globe-dark.png': 'product/globe.png',
    'index/products/realtime-user-cursor.svg': 'realtime/cursor.svg',
}.items():
    copy(f'{I}/{p}', d)
for name in ('in-app-chat', 'live-cursors', 'live-avatars', 'whiteboard', 'multiplayer-game', 'location'):
    copy(f'{I}/realtime/example-apps/dark/{name}.svg', f'realtime/{name}.svg')
for f in sorted(SRC.glob('*__product__auth__*.svg')):
    copy(f'{I}/product/auth/{f.name.split("__")[-1]}', f'providers/{f.name.split("__")[-1].replace("-icon", "").replace("-dark", "")}')

# Feature cards: 1600×900 → 960 px wide JPEGs (they are opaque, green-framed)
(OUT / 'features').mkdir(parents=True, exist_ok=True)
for f in sorted(SRC.glob('*__images__features__*.png')):
    im = Image.open(f).convert('RGB')
    im = im.resize((960, round(960 * im.height / im.width)), Image.LANCZOS)
    im.save(OUT / 'features' / (f.name.split('__')[-1][:-4] + '.jpg'), quality=90)

# Customer logos (white on transparent): trim and normalise to 96 px tall
(OUT / 'customers').mkdir(parents=True, exist_ok=True)
for f in sorted(SRC.glob('*__customers__logos__on-dark__*.png')):
    im = Image.open(f).convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if bbox:
        im = im.crop(bbox)
    h = 96
    im = im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
    im.save(OUT / 'customers' / f.name.split('__')[-1])

# Product icons (24 px stroke paths) from packages/shared-data/products.ts
ts = src('packages/shared-data/products.ts').read_text()
icons = {}
for m in re.finditer(r"\[PRODUCT(?:_MODULES)?_SHORTNAMES\.(\w+)\]:\s*\{\s*name:[^,]+,\s*icon:\s*\{(.*?)\}", ts, re.S):
    p = re.search(r"'24':\s*'([^']*)'", m.group(2))
    if p:
        icons[m.group(1).lower()] = p.group(1)
(OUT / 'icons.json').write_text(json.dumps(icons, indent=1))

(ROOT / 'fonts').mkdir(exist_ok=True)
shutil.copyfile(src('apps/www/public/fonts/source-code-pro/SourceCodePro-Regular.woff2'), ROOT / 'fonts' / 'SourceCodePro-Regular.woff2')
print('assets ready:', sum(1 for p in OUT.rglob('*') if p.is_file() and SRC not in p.parents))
