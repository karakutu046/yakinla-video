#!/usr/bin/env bash
# Builds the Supabase launch film from scratch: frames (Chromium) → sound (synthesis) → MP4.
# Needs: Node + Playwright (Chromium), Python 3 + numpy + scipy + Pillow, ffmpeg.
#   ./build.sh                      → out/supabase_launch_45s.mp4 (+ out/cover.jpg)
#   SUB=1 PRESET=veryfast ./build.sh  quick draft without motion blur
set -euo pipefail
cd "$(dirname "$0")"
OUT=${1:-out/supabase_launch_45s.mp4}
mkdir -p build "$(dirname "$OUT")"

[ -n "${SKIP_RENDER:-}" ] || NODE_PATH="${NODE_PATH:-$(npm root -g)}" node render.cjs build/video.mp4
python3 audio.py build/cues.json build/audio.wav

# two-pass loudnorm → -14 LUFS, -1.5 dBTP (X/Twitter, YouTube, LinkedIn, Instagram)
M=$(ffmpeg -hide_banner -i build/audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$M" "$1"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

# delivery encode from the master: 1080p60 H.264 High, BT.709, ~6-7 Mbit/s
ffmpeg -y -hide_banner -loglevel warning -i build/video.mp4 -i build/audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf "${DELIVERY_CRF:-19}" -x264-params aq-mode=3 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -af "$LN,aresample=48000" -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$OUT"

# cover image: the end-card lock-up
ffmpeg -y -hide_banner -loglevel error -ss 43.0 -i "$OUT" -frames:v 1 -q:v 2 "$(dirname "$OUT")/cover.jpg"
ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
