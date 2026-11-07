"""Kontrol karelerini tek bir temas sayfasında birleştirir: python3 scripts/sheet.py <klasör> <çıktı.png> [sütun]"""
import sys
import pathlib
from PIL import Image, ImageDraw

d = pathlib.Path(sys.argv[1])
files = sorted(d.glob('f*.png'))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
tw, th = 270, 480
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 30) + 8), 'white')
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 30)
    sheet.paste(im, (x, y))
    # güvenli alan çizgileri
    dr.line([(x, y + 220 * th / 1920), (x + tw, y + 220 * th / 1920)], fill=(255, 0, 128), width=1)
    dr.line([(x, y + 1540 * th / 1920), (x + tw, y + 1540 * th / 1920)], fill=(255, 0, 128), width=1)
    dr.text((x + 4, y + th + 6), f.stem, fill='black')
sheet.save(sys.argv[2])
print(sys.argv[2], sheet.size)
