#!/usr/bin/env bash
# Adıyörem şube tanıtım filmini üretir:
#   kaynak medya (hazirla.py) → kareler (Chromium) → ses (sentez + dış ses) → MP4 (ffmpeg).
# Kullanım:  ./build.sh [sahneler.json] [çıktı.mp4]
# Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy + Pillow, ffmpeg.
# Dış ses: sahneler.json → dis_ses.dosya (ElevenLabs, README'deki adım). build/ depoya girmez.
set -euo pipefail
cd "$(dirname "$0")"
CFG=${1:-sahneler.json}
jget() { python3 -c "import json,sys; d=json.load(open(sys.argv[1])); [d:=d.get(k,{}) if isinstance(d,dict) else {} for k in sys.argv[2].split('.')]; print(d if d!={} else '')" "$CFG" "$1"; }
OUT=${2:-$(jget cikti)}
OUT=${OUT:-out/adiyorem_tanitim.mp4}
mkdir -p build/vo "$(dirname "$OUT")"

python3 hazirla.py "$CFG"

VO=$(jget dis_ses.dosya)
VOW=""
if [ -n "$VO" ] && [ -f "$VO" ]; then
  ffmpeg -y -hide_banner -loglevel error -i "$VO" -ac 1 -ar 48000 -sample_fmt s16 build/vo/dis_ses.wav
  VOW=build/vo/dis_ses.wav
else
  echo "Uyarı: dış ses bulunamadı (${VO:-tanımsız}); film dış sessiz üretilecek."
fi

if [ -z "${SKIP_RENDER:-}" ]; then
  rm -rf build/frames
  NODE_PATH="${NODE_PATH:-$(npm root -g)}" node render.cjs build/frames
fi
python3 audio.py build/cues.json build/audio.wav $VOW
DUR=$(python3 -c "import json; print(json.load(open('build/cues.json'))['dur'])")

# Ses: iki geçişli loudnorm → -14 LUFS, -1.5 dBTP (Instagram/TikTok/YouTube seviyesi)
M=$(ffmpeg -hide_banner -i build/audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$M" "$1"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

# Görüntü: JPEG kareler (tam aralık, BT.601) → BT.709 sınırlı aralık, fotoğraf içeriğine ayarlı x264
ffmpeg -y -hide_banner -loglevel warning \
  -framerate 30 -i build/frames/f_%04d.jpg -i build/audio.wav \
  -vf "scale=in_color_matrix=bt601:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -af "$LN,aresample=48000" \
  -c:v libx264 -preset slow -crf 19 -maxrate 7M -bufsize 14M -tune film -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t "$DUR" "$OUT"

# kapak: kapanış kartı tamamlandıktan sonraki kare (yoksa ilk sahnenin ortası)
KF=$(python3 -c "import json; d=json.load(open('build/cues.json')); k=d.get('kapanis'); print(min(d['frames']-1, round(((k+2.6) if k is not None else 1.5)*30)))")
ffmpeg -y -hide_banner -loglevel error -i "build/frames/f_$(printf %04d "$KF").jpg" -q:v 3 "$(dirname "$OUT")/kapak.jpg"

ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -A2 "Integrated loudness" | grep " I:" || true
