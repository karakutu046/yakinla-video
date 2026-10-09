#!/usr/bin/env bash
# Builds the AllInvestView showreel from scratch: frames (Chromium) → audio (synthesis) → MP4 (ffmpeg).
# Needs: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
OUT=${1:-out/allinvestview_showreel_42s.mp4}
mkdir -p build/frames "$(dirname "$OUT")"

[ -n "${SKIP_RENDER:-}" ] || NODE_PATH="${NODE_PATH:-$(npm root -g)}" node render.cjs build/frames
python3 audio.py build/cues.json build/audio.wav

# Audio: two-pass loudnorm → -14 LUFS, -1.5 dBTP (YouTube / Instagram / LinkedIn level)
M=$(ffmpeg -hide_banner -i build/audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$M" "$1"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

# Video: BT.709, x264 tuned for flat graphics with fine detail
ffmpeg -y -hide_banner -loglevel warning \
  -framerate 30 -i build/frames/f_%04d.png -i build/audio.wav \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -af "$LN,aresample=48000" \
  -c:v libx264 -preset slow -crf 17 -tune animation -x264-params aq-mode=3 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t 42 "$OUT"

# Cover image: the final frame
ffmpeg -y -hide_banner -loglevel warning -i build/frames/f_1259.png -frames:v 1 -update 1 -q:v 2 "$(dirname "$OUT")/cover.jpg"

ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
