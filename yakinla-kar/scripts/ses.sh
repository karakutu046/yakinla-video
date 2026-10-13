#!/usr/bin/env bash
# Ses: sentez → iki geçişli loudnorm (-14 LUFS, -1.5 dBTP) → public/ses.wav
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build
python3 scripts/ses.py build/ses_ham.wav
M=$(ffmpeg -hide_banner -i build/ses_ham.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$M" "$1"; }
ffmpeg -y -hide_banner -loglevel error -i build/ses_ham.wav \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a pcm_s16le public/ses.wav
echo "public/ses.wav hazır"
