"""Yakınla 'Dışarıda kar' — ses tasarımı (dış ses yok).

Tümü sentezle üretilir; dışarıdan ses ya da müzik dosyası kullanılmaz.
Müzik kutusu ninnisi (96 BPM, 4/4; ölçü başları 0 / 2,5 / 5 / 7,5 / 10 / 12,5 sn),
pencere arkasından boğuk rüzgâr, küreye dalış ışıltısı, scooter, karda adımlar,
kapı zili, şekerin çaya düşüşü ve kapanış akoru.

Kullanım: python3 scripts/ses.py build/ses_ham.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
FPS = 30


def f2s(frame):
    return frame / FPS


def note_hz(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + (o - 4) * 12) / 12)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lowpass(x, cutoff, order=2):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (fr / cutoff) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    H = (1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4)) * (1 / np.sqrt(1 + (fr / hi) ** 4))
    return np.fft.irfft(X * H, len(x))


L = np.zeros(N)
R = np.zeros(N)


def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0]
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(sig)] += sig * gain * l
    R[i0:i0 + len(sig)] += sig * gain * r


# ---- müzik kutusu ----
def music_box(hz, dur=2.2, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * hz * t) * env_exp(n, 0.9)
         + 0.35 * np.sin(2 * np.pi * hz * 2.0 * t) * env_exp(n, 0.35)
         + 0.12 * np.sin(2 * np.pi * hz * 3.01 * t) * env_exp(n, 0.18)
         + 0.08 * np.sin(2 * np.pi * hz * 5.43 * t) * env_exp(n, 0.06))
    att = np.minimum(1, np.arange(n) / (0.002 * SR))
    click = rng.standard_normal(n) * env_exp(n, 0.004) * 0.05
    return (s * att + click) * vel


BEAT = 60 / 96
melody = [
    # (ölçü, vuruş, nota, süre-vuruş, hız)
    (0, 0, 'A5', 1, .8), (0, 1, 'F#5', 1, .6), (0, 2, 'A5', .5, .7), (0, 2.5, 'D6', 1.5, .8),
    (1, 0, 'B5', 1, .7), (1, 1, 'F#5', 1, .55), (1, 2, 'B5', .5, .7), (1, 2.5, 'D6', .5, .7), (1, 3, 'C#6', 1, .7),
    (2, 0, 'G5', .5, .8), (2, .5, 'B5', .5, .7), (2, 1, 'D6', 1, .8), (2, 2, 'E6', .5, .7), (2, 2.5, 'D6', .5, .65), (2, 3, 'B5', 1, .7),
    (3, 0, 'A5', .5, .75), (3, .5, 'C#6', .5, .7), (3, 1, 'E6', 1, .8), (3, 2, 'A6', 1, .8), (3, 3, 'E6', .5, .6), (3, 3.5, 'C#6', .5, .6),
    (4, 0, 'F#6', 1.5, .85), (4, 1.5, 'E6', .5, .65), (4, 2, 'D6', 1, .75), (4, 3, 'A5', 1, .6),
    (5, 0, 'D6', 1, .8), (5, 1, 'A5', 1, .6), (5, 2, 'F#6', 2, .75),
]
for bar, beat, nm, d, v in melody:
    add(music_box(note_hz(nm), 2.4, v), (bar * 4 + beat) * BEAT, 0.2, pan=0.15)

chords = [['D4', 'A4', 'F#5'], ['B3', 'F#4', 'D5'], ['G3', 'D4', 'B4'], ['A3', 'E4', 'C#5'], ['D4', 'A4', 'F#5'], ['G3', 'D4', 'A4', 'D5']]
for bar, ch in enumerate(chords):
    for k, nm in enumerate(ch):
        add(music_box(note_hz(nm), 3.0, 0.5), bar * 4 * BEAT + k * 0.045, 0.1, pan=-0.2 + 0.15 * k)

# sıcak pad (yumuşak akorlar)
pad = np.zeros(N)
t = np.arange(N) / SR
for bar, ch in enumerate(chords):
    s0, s1 = int(bar * 4 * BEAT * SR), int(min(DUR, (bar + 1) * 4 * BEAT + 0.6) * SR)
    seg = np.zeros(s1 - s0)
    tt = np.arange(s1 - s0) / SR
    for nm in ch:
        hz = note_hz(nm) / 2
        seg += np.sin(2 * np.pi * hz * tt) + 0.3 * np.sin(2 * np.pi * hz * 2 * tt + 0.3)
    e = np.minimum(1, tt / 0.6) * np.minimum(1, (tt[-1] - tt) / 0.6 + 0.0)
    pad[s0:s1] += seg * e
pad = bandpass(pad, 90, 900)
add(pad / np.max(np.abs(pad)), 0, 0.05)

# ---- rüzgâr: içeride boğuk, kasabada açık ----
noise = rng.standard_normal(N)
wind = bandpass(noise, 140, 900)
mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t + 1) * np.sin(2 * np.pi * 0.07 * t)
inside = bandpass(noise, 140, 380)
w_out = np.clip((t - f2s(160)) / 0.4, 0, 1) * np.clip((f2s(334) - t) / 0.3, 0, 1)
w_in = 1 - w_out
windmix = (inside * w_in * 0.5 + wind * w_out * 1.0) * mod
add(windmix / np.max(np.abs(windmix)), 0, 0.06, pan=-0.1)

# ---- porselen tıkırtısı (boş şekerlik) ----
def tink(hz=3100, tau=0.25):
    n = int(0.8 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz * tt) + 0.5 * np.sin(2 * np.pi * hz * 2.76 * tt)) * env_exp(n, tau) * np.minimum(1, tt / 0.001)

add(tink(2950, 0.3), f2s(58), 0.05, pan=0.1)

# ---- küreye dalış: yükselen ışıltı + nefes ----
n = int(1.7 * SR)
tt = np.arange(n) / SR
sweep = bandpass(rng.standard_normal(n), 400, 5000) * (tt / tt[-1]) ** 2
add(sweep / np.max(np.abs(sweep)), f2s(112), 0.12)
for i, nm in enumerate(['D6', 'F#6', 'A6', 'D7', 'F#7', 'A7']):
    add(music_box(note_hz(nm), 1.6, 0.6), f2s(132) + i * 0.09, 0.07, pan=-0.5 + i * 0.2)
# camdan geçiş: parlak çan
n = int(2.5 * SR)
tt = np.arange(n) / SR
bell = sum(np.sin(2 * np.pi * note_hz('D6') * m * tt) * a for m, a in [(1, 1), (2.01, .5), (3.02, .25), (4.17, .15)]) * env_exp(n, 0.8)
add(bell, f2s(162), 0.06)

# ---- scooter ----
def engine(t0, t1, f_from, f_to, pan_from, pan_to, gain):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    fr = np.linspace(f_from, f_to, n)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(np.sin(ph * k) / k for k in range(1, 9)) + 0.4 * np.sin(ph * 0.5)
    s = lowpass(s, 900, 2)
    e = np.minimum(1, tt / 0.15) * np.minimum(1, (tt[-1] - tt) / 0.2)
    s = s * e / np.max(np.abs(s))
    pans = np.linspace(pan_from, pan_to, n)
    l = np.cos((pans + 1) * np.pi / 4)
    r = np.sin((pans + 1) * np.pi / 4)
    i0 = int(t0 * SR)
    L[i0:i0 + n] += s * l * gain
    R[i0:i0 + n] += s * r * gain

engine(f2s(176), f2s(262), 95, 150, -0.6, 0.2, 0.07)
engine(f2s(262), f2s(290), 145, 80, 0.5, 0.2, 0.06)

# ---- karda adımlar ve kapı zili ----
def crunch():
    n = int(0.18 * SR)
    x = bandpass(rng.standard_normal(n), 900, 5000) * env_exp(n, 0.05)
    x *= (rng.random(n) > 0.6)
    return x

for fr in [287, 297, 303]:
    add(crunch(), f2s(fr), 0.12, pan=0.25)

def dingdong(hz):
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * hz * m * tt) * a for m, a in [(1, 1), (2.0, .35), (3.0, .12), (4.07, .06)]) * env_exp(n, 0.6) * np.minimum(1, tt / 0.003)

add(dingdong(note_hz('E5')), f2s(288), 0.07, pan=0.35)
add(dingdong(note_hz('C5')), f2s(288) + 0.42, 0.07, pan=0.35)

# kapı açılınca içerinin sıcak uğultusu
n = int(1.6 * SR)
tt = np.arange(n) / SR
room = lowpass(rng.standard_normal(n), 300) * np.minimum(1, tt / 0.4) * np.minimum(1, (tt[-1] - tt) / 0.5)
add(room / np.max(np.abs(room)), f2s(294), 0.05, pan=0.3)

# ---- şeker çaya düşer ----
n = int(0.25 * SR)
tt = np.arange(n) / SR
fr = 900 * np.exp(-tt * 18) + 280
plop = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n, 0.05)
add(plop, f2s(352), 0.16, pan=-0.1)
splash = bandpass(rng.standard_normal(int(0.2 * SR)), 1500, 7000) * env_exp(int(0.2 * SR), 0.03)
add(splash, f2s(352), 0.05, pan=-0.1)

# ---- kapanış ışıltısı ----
for i, nm in enumerate(['A5', 'D6', 'F#6', 'A6']):
    add(music_box(note_hz(nm), 2.6, 0.7), f2s(380) + i * 0.07, 0.08, pan=-0.3 + i * 0.2)

# ---- yankı (sentetik oda) ----
def reverb(x, seconds=1.8, mix=0.22, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / (0.35 * SR))
    ir = lowpass(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return x * (1 - mix) + y * mix

L2 = bandpass(reverb(L, seed=1), 70, 16000)
R2 = bandpass(reverb(R, seed=2), 70, 16000)
# son 0,6 sn yumuşak kapanış
fade = np.clip((DUR - t) / 0.6, 0, 1)
L2 *= fade
R2 *= fade
st = np.stack([L2, R2], axis=1)
st /= np.max(np.abs(st)) * 1.05
out = sys.argv[1] if len(sys.argv) > 1 else 'build/ses_ham.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('yazıldı', out)
