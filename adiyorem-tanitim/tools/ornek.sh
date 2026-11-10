#!/usr/bin/env bash
# Altyapıyı gerçek medya gelmeden denemek için sentetik deneme medyası üretir ve filmi basar.
# Bu dosyalar build/ornek altına yazılır, depoya girmez; çıktı build/ornek_test.mp4'tür.
set -euo pipefail
cd "$(dirname "$0")/.."
D=build/ornek
mkdir -p "$D"
L="ffmpeg -y -hide_banner -loglevel error"
# yatay video (16:9) ve dikey video (9:16), sesli
$L -f lavfi -i testsrc2=size=1920x1080:rate=30 -f lavfi -i "sine=f=220:sample_rate=48000" -t 6 -c:v libx264 -pix_fmt yuv420p -c:a aac "$D/yatay.mp4"
$L -f lavfi -i "cellauto=s=1080x1920:rule=110:rate=30,format=yuv420p,hue=s=0" -f lavfi -i "anoisesrc=c=pink:a=0.2:r=48000" -t 6 -c:v libx264 -pix_fmt yuv420p -c:a aac "$D/dikey.mp4"
# fotoğraflar: dikey 3000×4000 ve yatay 4000×3000
$L -f lavfi -i "gradients=s=3000x4000:c0=0x7a1a10:c1=0xe0a050:c2=0x3e8e3a:x0=0:y0=0:x1=3000:y1=4000:nb_colors=3" -frames:v 1 "$D/foto_dikey.jpg"
$L -f lavfi -i "smptehdbars=s=4000x3000" -frames:v 1 "$D/foto_yatay.jpg"
# deneme logosu (saydam zeminde iki satır yazı)
python3 - "$D/logo.png" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
im = Image.new('RGBA', (1200, 520), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
f1 = ImageFont.truetype('fonts/InterDisplay-Black.otf', 200)
f2 = ImageFont.truetype('fonts/Inter-Bold.otf', 110)
d.text((600, 180), 'DENEME', font=f1, fill=(200, 30, 40, 255), anchor='mm')
d.text((600, 400), 'logo yeri', font=f2, fill=(40, 120, 50, 255), anchor='mm')
im.save(sys.argv[1])
PY
# deneme dış sesi: hece ritminde band geçiren gürültü patlamaları (yalnızca miks/sidechain testi)
python3 - "$D/dis_ses.wav" <<'PY'
import sys, wave, numpy as np
from scipy import signal
SR = 48000; rng = np.random.default_rng(3)
x = np.zeros(int(SR * 15.5))
t = 0.0
for words in (5, 9, 9, 7):
    for w in range(words):
        n = int(SR * rng.uniform(0.18, 0.32)); i = int(t * SR)
        s = signal.sosfilt(signal.butter(2, [300, 3000], 'band', fs=SR, output='sos'), rng.standard_normal(n))
        x[i:i + n] += s * np.hanning(n) * 0.25
        t += n / SR + 0.05
    t += 0.55
pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
PY
./build.sh tools/ornek.json build/ornek_test.mp4
