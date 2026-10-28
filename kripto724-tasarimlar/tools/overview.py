#!/usr/bin/env python3
"""Puts all six boards on one comparison sheet: out/tasarimlar_genel_bakis.jpg

    python3 tools/overview.py
"""
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
boards = []
for i in range(1, 7):
    png, jpg = ROOT / 'out' / f'tasarim_{i}.png', ROOT / 'out' / f'tasarim_{i}.jpg'
    if png.exists() or jpg.exists():
        boards.append(png if png.exists() else jpg)
TW = 1620                      # tile width (half a board)
tiles = [Image.open(b).convert('RGB') for b in boards]
TH = round(TW * tiles[0].height / tiles[0].width)
G = 40
sheet = Image.new('RGB', (2 * TW + 3 * G, 3 * TH + 4 * G), (12, 12, 14))
for i, im in enumerate(tiles):
    x, y = G + (i % 2) * (TW + G), G + (i // 2) * (TH + G)
    sheet.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
out = ROOT / 'out' / 'tasarimlar_genel_bakis.jpg'
sheet.save(out, quality=88)
print(out, sheet.size)
