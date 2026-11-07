"""Dış sesteki cümleleri sessizliklerden ayırır (zamanlama için).

Kullanım: python3 scripts/hizala.py build/dis-ses.wav [eşik_dB=-38] [en_kısa_sessizlik_sn=0.16]
Her konuşma parçasının başlangıç/bitişini saniye ve 30 fps kare olarak yazar; ayrıca
build/dalga.png'ye parçaları işaretli dalga biçimi çizer.
"""
import sys
import wave

import numpy as np

path = sys.argv[1]
thr_db = float(sys.argv[2]) if len(sys.argv) > 2 else -38
min_sil = float(sys.argv[3]) if len(sys.argv) > 3 else 0.16

with wave.open(path) as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2:
        x = x.reshape(-1, 2).mean(axis=1)

hop = int(0.01 * sr)
frames = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(frames)])
db = 20 * np.log10(np.maximum(rms, 1e-9))
db -= db.max()
voiced = db > thr_db

segs = []
i = 0
while i < frames:
    if voiced[i]:
        j = i
        while j < frames:
            if not voiced[j]:
                k = j
                while k < frames and not voiced[k]:
                    k += 1
                if (k - j) * 0.01 >= min_sil or k >= frames:
                    break
                j = k
            else:
                j += 1
        segs.append((i * 0.01, j * 0.01))
        i = j
    else:
        i += 1

print(f'süre {len(x) / sr:.2f} sn, {len(segs)} parça (eşik {thr_db} dB, sessizlik ≥ {min_sil} sn)')
for n, (a, b) in enumerate(segs):
    print(f'{n:2d}  {a:6.2f} – {b:6.2f} sn  ({b - a:4.2f})   kare {a * 30:6.1f} – {b * 30:6.1f}')

try:
    from PIL import Image, ImageDraw

    W, H = 1800, 260
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    dur = len(x) / sr
    for n, (a, b) in enumerate(segs):
        d.rectangle([a / dur * W, 0, b / dur * W, H], fill=(220, 236, 255))
        d.text((a / dur * W + 2, 2), str(n), fill='black')
    step = len(x) / W
    for px in range(W):
        seg = x[int(px * step):int((px + 1) * step)]
        if len(seg):
            d.line([px, H / 2 - seg.max() * H / 2, px, H / 2 - seg.min() * H / 2], fill=(20, 60, 160))
    for t in range(int(dur) + 1):
        d.line([t / dur * W, H - 12, t / dur * W, H], fill='black')
        d.text((t / dur * W + 2, H - 12), f'{t}s', fill='black')
    out = path.rsplit('/', 1)[0] + '/dalga.png'
    im.save(out)
    print(out)
except ImportError:
    pass
