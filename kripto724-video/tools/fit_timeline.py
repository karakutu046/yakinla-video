#!/usr/bin/env python3
"""Split the voiceover into its nine lines and fit the film to them.

    python3 tools/fit_timeline.py <voiceover.mp3|wav>

- Decodes the take, finds the pauses (10 ms RMS below peak − 38 dB, at least 0.18 s) and keeps
  the eight longest as the line breaks (the script has nine paragraphs).
- Writes build/vo/line_1.wav … line_9.wav (48 kHz mono, trimmed, short fades).
- Rewrites src/timeline.js: each scene lasts lead + line + tail, rounded up to whole beats
  (0.5 s at 120 BPM) so every cut lands on the beat; the last scene holds the call to action.
  rate[i] stretches a scene's animation to its line (design length / actual, 0.8–1.25).
"""
import os
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
NOM = [4.5, 4.0, 4.5, 3.5, 3.5, 4.5, 4.0, 5.0, 7.5]          # design scene lengths
NOMVO = [n - 0.7 for n in NOM[:8]] + [5.0]                    # line lengths the animation was timed to
LEAD, TAIL, HOLD, BEAT = 0.3, 0.3, 2.6, 0.5


def main():
    src = sys.argv[1]
    os.makedirs(os.path.join(HERE, 'build', 'vo'), exist_ok=True)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(float)
    b = SR // 100
    m = len(x) // b
    rms = np.sqrt(np.mean(x[:m * b].reshape(m, b) ** 2, axis=1)) + 1e-9
    db = 20 * np.log10(rms)
    voiced = db > db.max() - 38
    # runs of silence
    gaps, i = [], 0
    while i < m:
        if not voiced[i]:
            j = i
            while j < m and not voiced[j]:
                j += 1
            if i > 0 and j < m and (j - i) >= 18:
                gaps.append((i, j))
            i = j
        else:
            i += 1
    first = int(np.argmax(voiced)); last = m - int(np.argmax(voiced[::-1]))
    if len(gaps) < 8:
        sys.exit(f'only {len(gaps)} pauses found; expected at least 8')
    breaks = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[:8])
    edges = [first] + [v for g in breaks for v in g] + [last]
    lines = [(edges[2 * k], edges[2 * k + 1]) for k in range(9)]
    durs = []
    for k, (a, e) in enumerate(lines):
        s0, s1 = max(0, a * b - int(0.03 * SR)), min(len(x), e * b + int(0.06 * SR))
        y = x[s0:s1].copy()
        f = int(0.01 * SR)
        y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
        with wave.open(os.path.join(HERE, 'build', 'vo', f'line_{k + 1}.wav'), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
        durs.append((s1 - s0) / SR)
    q = lambda v: np.ceil(v / BEAT - 1e-6) * BEAT
    scenes = [float(q(LEAD + d + TAIL)) for d in durs[:8]] + [float(q(LEAD + durs[8] + HOLD))]
    scenes[0] = float(q(0.25 + durs[0] + TAIL))
    starts = np.concatenate([[0], np.cumsum(scenes)[:-1]])
    vo = [0.25] + [float(s + LEAD) for s in starts[1:]]
    rate = [float(np.clip(n / d, 0.8, 1.25)) for n, d in zip(NOMVO, durs)]
    for k in range(9):
        print(f'line {k + 1}: {durs[k]:5.2f} s   scene {scenes[k]:4.1f} s   starts {starts[k]:5.1f}   rate {rate[k]:.2f}')
    print(f'pauses kept as breaks: {[round((g[1] - g[0]) / 100, 2) for g in breaks]}')
    print(f'total {sum(scenes):.1f} s')
    js = f"""'use strict';
/* Scene lengths in seconds. They follow the Turkish voiceover: tools/fit_timeline.py
 * rewrites this file from the measured voiceover lines (vo: start of each line, absolute;
 * rate: how much each scene's animation is stretched to its line). */
const TL = {{
  scenes: [{', '.join(f'{v:.1f}' for v in scenes)}],
  vo: [{', '.join(f'{v:.2f}' for v in vo)}],
  rate: [{', '.join(f'{v:.3f}' for v in rate)}],
}};
TL.start = TL.scenes.reduce((a, d, i) => (a.push(i ? a[i - 1] + TL.scenes[i - 1] : 0), a), []);
TL.total = TL.start[8] + TL.scenes[8];
"""
    open(os.path.join(HERE, 'src', 'timeline.js'), 'w').write(js)


if __name__ == '__main__':
    main()
