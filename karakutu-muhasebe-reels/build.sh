#!/usr/bin/env bash
# Karakutu Muhasebe Reels filmini sıfırdan üretir: kareler (Chromium) → ses (sentez) → MP4 (ffmpeg).
# Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
OUT=${1:-out/karakutu_muhasebe_reels_38sn.mp4}
DUR=38
mkdir -p build/frames "$(dirname "$OUT")"

[ -n "${SKIP_RENDER:-}" ] || NODE_PATH="${NODE_PATH:-$(npm root -g)}" node render.cjs build/frames
python3 audio.py build/cues.json build/audio.wav

# Ses: iki geçişli loudnorm → -14 LUFS (Instagram/TikTok/YouTube seviyesi), ardından 4× örneklemeli
# sınırlayıcı: AAC kodlamasının tepe aşımına rağmen gerçek tepe -1.5 dBTP'nin altında kalsın
M=$(ffmpeg -hide_banner -i build/audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$M" "$1"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

# Görüntü: BT.709, düz renk alanları için ayarlı x264
ffmpeg -y -hide_banner -loglevel warning \
  -framerate 30 -i build/frames/f_%04d.png -i build/audio.wav \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -af "$LN,aresample=192000,alimiter=limit=0.66:attack=1:release=60:level=disabled,aresample=48000" \
  -c:v libx264 -preset slow -crf 18 -tune animation -x264-params aq-mode=3 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t $DUR "$OUT"

ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
