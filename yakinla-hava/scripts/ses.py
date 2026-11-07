"""Yakınla "Afşin Hava Durumu" — müzik, efektler ve dış ses miksi.

Müzik ve efektlerin tamamı numpy ile sentezlenir; indirilmiş müzik ya da ses dosyası kullanılmaz.
Klasik TV hava durumu müziği: 120 BPM, Cmaj7 → Am7 → Dm7 → G7 (I–vi–ii–V), elektrik piyano
vuruşları, slap bas, hafif davul ve vibrafon. Efekt ipuçlarının hepsi src/timing.json'daki karelerden
gelir; böylece her whoosh, ding ve "vıcık" ekrandaki hareketle aynı karede duyulur.

Dış ses (build/dis-ses.wav) varsa yerleştirilir ve konuşma sırasında müzik kısılır (ducking).

Kullanım: python3 scripts/ses.py build/ses_ham.wav
"""
import json
import pathlib
import sys
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
TM = json.loads((ROOT / 'src' / 'timing.json').read_text(encoding='utf-8'))
FPS = TM['fps']
SR = 48000
DUR = TM['total'] / FPS
N = int(SR * DUR)
rng = np.random.default_rng(11)


def s(frame):
    return frame / FPS


# ------------------------------------------------------------------ temel araçlar
def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def fft_filter(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    H = np.ones_like(fr)
    if hi:
        H *= 1 / np.sqrt(1 + (fr / hi) ** (2 * order))
    if lo:
        H *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def hz(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + (o - 4) * 12) / 12)


MUS_L = np.zeros(N)
MUS_R = np.zeros(N)
FX_L = np.zeros(N)
FX_R = np.zeros(N)


def add(sig, t0, gain=1.0, pan=0.0, bus='fx'):
    i0 = int(round(t0 * SR))
    if i0 >= N or i0 + len(sig) <= 0:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    sig = sig[: N - i0].copy()
    # kesik bitişlerde tık olmasın: son 8 ms'yi sıfıra indir
    k = min(len(sig), int(0.008 * SR))
    sig[len(sig) - k:] *= np.linspace(1, 0, k)
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    L, R = (MUS_L, MUS_R) if bus == 'mus' else (FX_L, FX_R)
    L[i0:i0 + len(sig)] += sig * gain * l
    R[i0:i0 + len(sig)] += sig * gain * r


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


# ------------------------------------------------------------------ enstrümanlar
def kick():
    t = tvec(0.45)
    f = 45 + 85 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(len(t), 0.16) + rng.standard_normal(len(t)) * env_exp(len(t), 0.003) * 0.2


def snare():
    t = tvec(0.3)
    noise = fft_filter(rng.standard_normal(len(t)), 1200, 7000) * env_exp(len(t), 0.07)
    tone = np.sin(2 * np.pi * 185 * t) * env_exp(len(t), 0.05)
    return noise * 0.9 + tone * 0.5


def hat(open_=False):
    t = tvec(0.35 if open_ else 0.08)
    return fft_filter(rng.standard_normal(len(t)), 7000, 15000) * env_exp(len(t), 0.11 if open_ else 0.018)


def bass(f0, dur):
    t = tvec(dur)
    x = sum(np.sin(2 * np.pi * f0 * k * t) / k * np.exp(-t * (2.5 + k * 4)) for k in range(1, 7))
    att = np.minimum(1, t / 0.004)
    rel = np.minimum(1, (dur - t) / 0.02)
    return x * att * rel


def epiano(freqs, dur=0.32, vel=1.0):
    t = tvec(dur + 0.4)
    out = np.zeros(len(t))
    for f0 in freqs:
        out += np.sin(2 * np.pi * f0 * t) * np.exp(-t * 3.2) + 0.25 * np.sin(2 * np.pi * f0 * 2 * t) * np.exp(-t * 6)
        out += 0.06 * np.sin(2 * np.pi * f0 * 7.1 * t) * np.exp(-t * 30)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 5.5 * t)
    rel = np.clip((dur + 0.4 - t) / 0.4, 0, 1)
    return out * trem * rel * vel / max(1, len(freqs))


def vibes(f0, dur=0.9, vel=1.0):
    t = tvec(dur)
    x = np.sin(2 * np.pi * f0 * t) * np.exp(-t * 2.2) + 0.3 * np.sin(2 * np.pi * f0 * 4 * t) * np.exp(-t * 8)
    trem = 1 + 0.25 * np.sin(2 * np.pi * 6 * t)
    return x * trem * np.minimum(1, t / 0.002) * vel


def brass(freqs, dur=0.35, vel=1.0):
    t = tvec(dur + 0.15)
    out = np.zeros(len(t))
    for f0 in freqs:
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)
        ph = 2 * np.pi * f0 * np.cumsum(vib) / SR
        out += sum(np.sin(k * ph) / k ** 1.2 for k in range(1, 9))
    env = np.minimum(1, t / 0.02) * np.clip((dur + 0.15 - t) / 0.15, 0, 1) * (0.75 + 0.25 * np.exp(-t * 8))
    return fft_filter(out * env, None, 3500) * vel / len(freqs)


def bell(f0, dur=1.6, vel=1.0):
    t = tvec(dur)
    x = (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 2.4) + 0.45 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t * 4.5)
         + 0.22 * np.sin(2 * np.pi * f0 * 5.4 * t) * np.exp(-t * 9))
    return x * np.minimum(1, t / 0.001) * vel


# ------------------------------------------------------------------ müzik
BEAT = 0.5  # 120 BPM
GROOVE0 = s(TM['days'][0]['start'])
END0 = s(TM['end']['start'])
CHORDS = [
    ('C3', ['E4', 'G4', 'B4', 'D5']),  # Cmaj9
    ('A2', ['G4', 'C5', 'E5']),  # Am7
    ('D3', ['F4', 'A4', 'C5', 'E5']),  # Dm9
    ('G2', ['F4', 'B4', 'D5', 'E5']),  # G13
]

# jenerik: fanfar + AFŞİN vuruşu
title_t = s(TM['intro']['title'])
for i, nt in enumerate(['G4', 'C5', 'E5']):
    add(brass([hz(nt)], 0.12, 0.5), 0.12 + i * 0.1, 0.55, -0.2 + i * 0.2, 'mus')
add(brass([hz('C4'), hz('E4'), hz('G4'), hz('C5')], 0.9, 1.0), title_t, 0.8, 0, 'mus')
add(kick(), title_t, 0.9, 0, 'mus')
add(hat(True), title_t, 0.25, 0.3, 'mus')
for k in range(4):
    add(snare(), title_t + 0.6 + k * 0.125, 0.25 + k * 0.08, -0.2, 'mus')
add(vibes(hz('E5')), s(TM['intro']['band']), 0.35, 0.3, 'mus')
add(vibes(hz('G5')), s(TM['intro']['band']) + 0.12, 0.3, 0.3, 'mus')

# groove
t = GROOVE0
bar = 0
while t < END0 - 0.05:
    root, chord = CHORDS[bar % 4]
    for b in range(4):
        tb = t + b * BEAT
        if tb >= END0 - 0.05:
            break
        if b in (0, 2):
            add(kick(), tb, 0.55, 0, 'mus')
        if b in (1, 3):
            add(snare(), tb, 0.32, -0.1, 'mus')
        add(hat(), tb, 0.12, 0.35, 'mus')
        add(hat(b == 3), tb + BEAT / 2, 0.1, 0.35, 'mus')
        # elektrik piyano: vuruş arası (skank)
        add(epiano([hz(x) for x in chord], 0.18), tb + BEAT / 2, 0.38, -0.3, 'mus')
        # bas: kök + oktav sekizlikler
        f0 = hz(root)
        add(bass(f0, 0.22), tb, 0.5, 0, 'mus')
        add(bass(f0 * (2 if b % 2 else 1.5), 0.18), tb + BEAT / 2, 0.32, 0, 'mus')
    # her iki ölçüde bir vibrafon motifi
    if bar % 2 == 0:
        mot = [chord[-1], chord[-2], chord[-1]]
        for k, nt in enumerate(mot):
            f0 = hz(nt[:-1] + str(int(nt[-1]) + 1))
            add(vibes(f0, 0.8, 0.8), t + 2.5 * BEAT + k * BEAT / 2, 0.16, 0.4, 'mus')
    t += 4 * BEAT
    bar += 1

# kapanış: Cmaj9 akoru + "Ya-kın-la" çanları
add(epiano([hz(x) for x in ['C4', 'E4', 'G4', 'B4', 'D5']], 1.8), END0, 0.7, 0, 'mus')
add(bass(hz('C2'), 1.6), END0, 0.6, 0, 'mus')
add(kick(), END0, 0.6, 0, 'mus')
add(hat(True), END0, 0.2, 0.3, 'mus')
logo_t = s(TM['end']['logo'])
for i, nt in enumerate(['E5', 'G5', 'C6']):
    add(bell(hz(nt), 2.2, 0.8), logo_t + 0.12 + i * 0.16, 0.32, -0.3 + i * 0.3, 'mus')
add(brass([hz('C4'), hz('G4'), hz('E5')], 1.4, 0.7), END0 + 0.05, 0.35, 0, 'mus')


# ------------------------------------------------------------------ efektler
def whoosh(dur=0.55, lo=300, hi=6000, up=True):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    bands = np.geomspace(lo, hi, 7)
    if not up:
        bands = bands[::-1]
    for k, fc in enumerate(bands):
        b = fft_filter(noise, fc * 0.7, fc * 1.4)
        c = (k + 0.5) / len(bands)
        w = np.exp(-((np.linspace(0, 1, n) - c) ** 2) / 0.02)
        out += b * w
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def impact():
    t = tvec(0.9)
    f = 35 + 50 * np.exp(-t / 0.08)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.3)
    x += fft_filter(rng.standard_normal(len(t)), None, 400) * env_exp(len(t), 0.08) * 0.6
    return x


def click(f0=2200, dur=0.05):
    t = tvec(dur)
    return (fft_filter(rng.standard_normal(len(t)), 2500, 7000) * env_exp(len(t), 0.004) * 0.6
            + np.sin(2 * np.pi * f0 * t) * env_exp(len(t), 0.012))


def squelch(seed):
    r = np.random.default_rng(seed)
    t = tvec(0.32)
    wob = 1 + 0.6 * np.sin(2 * np.pi * (22 + r.random() * 12) * t)
    blorp = np.sin(2 * np.pi * np.cumsum(260 * np.exp(-t / 0.09) + 70) / SR) * env_exp(len(t), 0.08)
    mud = fft_filter(r.standard_normal(len(t)), 80, 900) * env_exp(len(t), 0.06) * wob
    return blorp * 0.8 + mud * 0.9


# CRT açılışı
t0 = tvec(0.5)
add(fft_filter(rng.standard_normal(len(t0)), 2000, 12000) * env_exp(len(t0), 0.09), 0.0, 0.35, 0)
add(np.sin(2 * np.pi * 7800 * t0) * env_exp(len(t0), 0.25), 0.02, 0.05, 0)
add(impact()[: int(0.4 * SR)], 0.03, 0.4, 0)
# AFŞİN çarpması + bant
add(impact(), title_t, 0.75, 0)
add(whoosh(0.35, 800, 9000), s(TM['intro']['band']) - 0.12, 0.35, -0.5)

# gün ve bölüm bantları
stings = [d['start'] for d in TM['days']] + [TM['weekly']['start']]
for k, fs in enumerate(stings):
    add(whoosh(0.5, 250, 7000), s(fs) - 0.05, 0.6, 0.6)
    add(whoosh(0.45, 7000, 300, up=False), s(fs) + 0.48, 0.4, -0.6)
    add(brass([hz(x) for x in (['E4', 'G4', 'C5'] if k % 2 == 0 else ['F4', 'A4', 'D5'])], 0.16, 0.7), s(fs) + 0.27, 0.32, 0, 'mus')
    add(click(1600, 0.06), s(fs) + 0.13, 0.3, 0.7)  # gün kutusu çevrilmesi

# yağmur ambiyansı
d0, d1, d2 = TM['days']
wk = TM['weekly']['start']


def ambience(sig, a, b, fade=0.4, gain=1.0, pan=0.0):
    n = len(sig)
    e = np.ones(n)
    nf = int(fade * SR)
    e[:nf] = np.linspace(0, 1, nf)
    e[-nf:] = np.linspace(1, 0, nf)
    add(sig * e, a, gain, pan)


ra, rb = s(d0['start'] + 8), s(d1['start'] + 10)
rain_n = int((rb - ra) * SR)
rain_sig = fft_filter(rng.standard_normal(rain_n), 500, 7000) * 0.5
for _ in range(int((rb - ra) * 30)):
    i = rng.integers(0, rain_n - 2400)
    tt = np.arange(2400) / SR
    rain_sig[i:i + 2400] += np.sin(2 * np.pi * rng.uniform(1800, 4200) * tt) * env_exp(2400, 0.004) * rng.uniform(0.1, 0.35)
ambience(rain_sig, ra, rb, 0.5, 0.22, 0)

# rüzgâr + kar ışıltısı
wa, wb = s(d1['start'] + 8), s(d2['start'] + 10)
wn = int((wb - wa) * SR)
tt = np.arange(wn) / SR
wind = fft_filter(rng.standard_normal(wn), 250, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * tt + 1) * np.sin(2 * np.pi * 0.13 * tt))
ambience(wind, wa, wb, 0.6, 0.35, -0.2)
for k in range(9):
    add(bell(hz(['C7', 'E7', 'G7', 'D7'][k % 4]), 0.8, 0.5), wa + 0.3 + k * 0.38, 0.06, rng.uniform(-0.8, 0.8))

# çamur: lekeler + silecek
camur = d2['camur']
for k in range(6):
    add(squelch(k), s(camur + k * 1.5), 0.55, [-0.5, 0.6, 0.3, -0.7, 0.8, 0][k])
wip = s(camur + 26)
t1 = tvec(1.1)
motor = sum(np.sin(2 * np.pi * 118 * k * t1) / k for k in range(1, 6)) * np.sin(np.linspace(0, np.pi, len(t1))) ** 0.5
squeak = np.sin(2 * np.pi * np.cumsum(1250 + 180 * np.sin(2 * np.pi * 9 * t1)) / SR) * (np.sin(np.linspace(0, np.pi, len(t1))) ** 2)
add(fft_filter(motor, None, 900) * 0.25 + squeak * 0.05, wip, 0.6, -0.3)
add(whoosh(0.5, 500, 4000), wip + 0.05, 0.25, -0.4)
add(whoosh(0.45, 4000, 500, up=False), wip + 0.6, 0.2, 0.2)

# minibüs: hafif motor sesi (yalnız hareket ederken)
for d in TM['days']:
    a, b = s(d['start'] + 20), s(d['kapinda'])
    n = int((b - a) * SR)
    if n <= 0:
        continue
    tt = np.arange(n) / SR
    f = 70 + 25 * np.sin(np.linspace(0, np.pi, n))
    eng = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in range(1, 5))
    ambience(fft_filter(eng, None, 600), a, b, 0.25, 0.05, 0.3)

# varış: "ding" + parıltı
for d in TM['days']:
    k = s(d['kapinda'])
    add(bell(hz('E6'), 1.4), k, 0.32, 0.5)
    add(bell(hz('B6'), 1.0), k + 0.07, 0.18, 0.6)
    add(whoosh(0.25, 2000, 9000), k - 0.05, 0.15, 0.5)

# haftalık: kart tıkları ve artan "ding"ler
for i in range(7):
    add(click(1800 + i * 90), s(wk + 14 + i * 3), 0.32, -0.6 + i * 0.2)
    add(bell(hz(['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7'][i]), 0.6, 0.6), s(wk + 34 + i * 2.5), 0.12, -0.6 + i * 0.2)

# vaat: sayaç tıkları ve kapanış onayı
pr = TM['promise']
for i in range(14):
    tt = 22 * (1 - (1 - (i / 13)) ** (1 / 3))  # ease.out tersine yakın: başta sık, sonda seyrek
    add(click(2600, 0.03), s(pr['sixty'] + tt), 0.16, 0.2)
add(bell(hz('G6'), 1.2), s(pr['kapinda']), 0.3, 0.4)
add(bell(hz('C7'), 1.0), s(pr['kapinda']) + 0.08, 0.16, 0.5)
add(whoosh(0.4, 400, 5000), s(pr['depo']) - 0.1, 0.18, -0.3)

# kapanış: iris whoosh
add(whoosh(0.5, 200, 8000), END0 - 0.1, 0.45, 0)

# ------------------------------------------------------------------ dış ses ve miks
vo_path = ROOT / TM['vo']['file']
VO = np.zeros(N)
if vo_path.exists():
    with wave.open(str(vo_path)) as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2, 'dış ses 48 kHz / 16 bit olmalı'
        raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            raw = raw.reshape(-1, 2).mean(axis=1)
    # parçalar: [kaynak_başı, kaynak_sonu, hedef_zaman] (sn). Yoksa dosya olduğu gibi 'at'e konur.
    segs = TM['vo'].get('segments') or [[0, len(raw) / SR, TM['vo']['at']]]
    pad = int(0.03 * SR)
    for a, b, dst in segs:
        part = raw[max(0, int(a * SR) - pad):int(b * SR) + pad].copy()
        k = min(len(part) // 2, pad)
        part[:k] *= np.linspace(0, 1, k)
        part[len(part) - k:] *= np.linspace(1, 0, k)
        i0 = int(dst * SR) - pad
        part = part[: max(0, N - i0)]
        VO[i0:i0 + len(part)] += part
    # konuşma seviyesi: RMS -18 dBFS
    act = np.abs(VO) > 0.01
    rms = np.sqrt(np.mean(VO[act] ** 2)) if act.any() else 1
    VO *= 10 ** (-18 / 20) / rms
    print(f'dış ses: {vo_path.name}, {len(raw) / SR:.2f} sn')
else:
    print('dış ses yok: yalnız müzik ve efektler')

# ducking zarfı (atak 60 ms, bırakma 350 ms)
lvl = np.abs(VO)
win = int(0.03 * SR)
lvl = np.convolve(lvl, np.ones(win) / win, mode='same')
gate = (lvl > 0.004).astype(float)
env = np.zeros(N)
a_up = 1 - np.exp(-1 / (0.06 * SR))
a_dn = 1 - np.exp(-1 / (0.35 * SR))
# blok blok ileri tarama (hızlı)
blk = 240
g = gate[::blk]
e = np.zeros(len(g))
v = 0.0
for i, x in enumerate(g):
    a = 1 - (1 - (a_up if x > v else a_dn)) ** blk
    v += (x - v) * a
    e[i] = v
env = np.repeat(e, blk)[:N]
duck = 1 - 0.5 * env  # konuşma sırasında müzik ≈ -6 dB

mus_gain = 10 ** (-13 / 20)
fx_gain = 10 ** (-9 / 20)
L = MUS_L * mus_gain * duck + FX_L * fx_gain * (1 - 0.25 * env) + VO * 0.92
R = MUS_R * mus_gain * duck + FX_R * fx_gain * (1 - 0.25 * env) + VO * 0.92
# son: yumuşak bitiş
fade = int(0.6 * SR)
L[-fade:] *= np.linspace(1, 0, fade) ** 2
R[-fade:] *= np.linspace(1, 0, fade) ** 2
peak = max(np.abs(L).max(), np.abs(R).max())
if peak > 0.98:
    L *= 0.98 / peak
    R *= 0.98 / peak

out = pathlib.Path(sys.argv[1])
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), 'w') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.stack([L, R], axis=1) * 32767).astype(np.int16).tobytes())
print(out, f'{DUR:.2f} sn')
