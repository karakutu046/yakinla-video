#!/usr/bin/env python3
"""QR Personel showreel'inin müziği ve ses efektleri: tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav

- 128 BPM, 4/4, 8 ölçü = tam 15 sn. Sahne geçişleri ölçü başlarına oturur.
  Akorlar: Am (saat) → Am (pikseller) → F (tarama, filtreli) → Am (DROP) → F → G
  → Dm/G (kırılma, logo inşası) → C (kapanış, çözülme).
- Ses logosu: logo oturduğunda G5 → C6 → E6 → G6 yükselen çan arpeji.
- Efektler, anim.js'in ürettiği cues.json'dan gelir; her tık, whoosh ve bip ekrandaki
  hareketle aynı karede ve aynı yönde (pan) duyulur.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 15.0
N = int(SR * (DUR + 2.5))
BEAT = 60 / 128
BAR = 4 * BEAT
rng = np.random.default_rng(11)


def at(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def tt(n):
    return np.arange(n) / SR


def ns(sec):
    return int(sec * SR)


def noise(n):
    return rng.standard_normal(n)


def sos(kind, f, order=2):
    return signal.butter(order, f, kind, fs=SR, output='sos')


def lp(x, f, o=2):
    return signal.sosfilt(sos('low', min(f, SR / 2 - 100), o), x)


def hp(x, f, o=2):
    return signal.sosfilt(sos('high', f, o), x)


def bp(x, f0, f1, o=2):
    return signal.sosfilt(sos('band', [f0, min(f1, SR / 2 - 100)], o), x)


def saw(f, n, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    p = (ph + np.cumsum(f) / SR) % 1.0
    return 2 * p - 1


def sine(f, n, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    return np.sin(2 * np.pi * (ph + np.cumsum(f) / SR))


def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, hold=None):
    t = tt(n)
    hold = (n / SR - r) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = np.clip((t - hold) / max(r, 1e-6), 0, 1)
    return e * (1 - rel)


def sweep_bp(x, f0, f1, curve=1.0, q=0.6):
    """Zamanla değişen bant geçiren (whoosh ve riser'lar için)."""
    out = np.zeros_like(x)
    zi = None
    ch = 256
    for i in range(0, len(x), ch):
        p = (i / max(1, len(x) - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        lo, hi = max(40, fc * (1 - q / 2)), min(SR / 2 - 200, fc * (1 + q / 2))
        s = sos('band', [lo, hi], 2)
        if zi is None:
            zi = signal.sosfilt_zi(s) * 0
        out[i:i + ch], zi = signal.sosfilt(s, x[i:i + ch], zi=zi)
    return out


# ───────────────────────── miks altyapısı ─────────────────────────
class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, x, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N:
            return
        if x.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4) * 1.4142, np.sin((pan + 1) * np.pi / 4) * 1.4142
            xl, xr = x * l, x * r
        else:
            xl, xr = x[0], x[1]
        if i < 0:
            xl, xr, i = xl[-i:], xr[-i:], 0
        m = min(len(xl), N - i)
        self.L[i:i + m] += xl[:m] * gain
        self.R[i:i + m] += xr[:m] * gain


drums, muffled, bass_bus, music, sfx, verb = Bus(), Bus(), Bus(), Bus(), Bus(), Bus()


def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0):
    bus.add(x, t, gain, pan)
    if rev > 0:
        verb.add(x, t, gain * rev, pan)


# ───────────────────────── enstrümanlar ─────────────────────────
def kick(f0=160, f1=46, dur=0.42, punch=1.0):
    n = ns(dur); t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t * 34)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = hp(noise(n), 3000) * np.exp(-t * 420) * 0.35 * punch
    return np.tanh(1.7 * (body + click))


def clap():
    n = ns(0.35); t = tt(n)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        env += np.where(t >= d, np.exp(-(t - d) * 190), 0) * (0.8 if k < 2 else 1)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) * 16), 0) * 0.5
    return bp(noise(n), 900, 5200) * env * 1.4


def hat(open_=False):
    n = ns(0.4 if open_ else 0.06); t = tt(n)
    return hp(noise(n), 7500, 4) * np.exp(-t * (9 if open_ else 70)) * (0.7 if open_ else 1)


def snare(v=1.0):
    n = ns(0.2); t = tt(n)
    nz = bp(noise(n), 1200, 9000) * np.exp(-t * 24)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 35)
    return (nz * 0.9 + tone * 0.6) * v


def crash(dur=2.4):
    n = ns(dur); t = tt(n)
    x = hp(noise(n), 3500, 2) * np.exp(-t * 2.2)
    for f in (3150, 4270, 5530, 6890):
        x += 0.05 * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * 3)
    return x * 0.5


def bass_note(f, dur, bright=420):
    n = ns(dur); t = tt(n)
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    x = lp(x, bright, 2)
    x = 0.55 * x + 0.75 * np.sin(2 * np.pi * f * t)
    return np.tanh(1.3 * x) * adsr(n, 0.004, 0.12, 0.65, 0.04)


def pad(freqs, dur, cut=1800, att=0.3, rel=0.6):
    n = ns(dur + rel)
    L, R = np.zeros(n), np.zeros(n)
    for f in freqs:
        for k, det in enumerate((-0.11, -0.05, 0.0, 0.05, 0.11)):
            x = saw(f * 2 ** (det / 12), n, rng.random())
            pan = (k - 2) / 2.2
            L += x * np.cos((pan + 1) * np.pi / 4)
            R += x * np.sin((pan + 1) * np.pi / 4)
    env = adsr(n, att, 0.8, 0.85, rel, hold=dur)
    L, R = lp(L, cut, 2) * env, lp(R, cut, 2) * env
    g = 0.12 / max(1, len(freqs))
    return np.vstack([L * g, R * g])


def pluck(f, dur=0.5, bright=1.0):
    n = ns(dur); t = tt(n)
    x = 0.7 * saw(f, n) + 0.3 * np.sign(np.sin(2 * np.pi * f * 1.003 * t))
    hi, lo = lp(x, 5500 * bright, 2), lp(x, 700, 2)
    e = np.exp(-t * 14)
    return (hi * e + lo * (1 - e)) * np.exp(-t * 5.5) * adsr(n, 0.002, 1, 1, 0.03)


def sq_pluck(f, dur=0.18, cut=3000):
    """Kare dalga 'piksel' arpeji: QR modülleri gibi köşeli bir ses."""
    n = ns(dur); t = tt(n)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + np.sign(np.sin(2 * np.pi * f * 2.005 * t)) * 0.2
    return lp(x, cut, 2) * np.exp(-t * 18) * adsr(n, 0.001, 1, 1, 0.01)


def bell(f, dur=2.0, ratio=3.5, index=2.6, decay=2.2):
    n = ns(dur); t = tt(n)
    I = index * np.exp(-t * 5)
    x = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    x += 0.25 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * decay * 1.6)
    return x * np.exp(-t * decay) * adsr(n, 0.002, 1, 1, 0.05)


# ───────────────────────── efektler ─────────────────────────
def fx_tick(pitch=1.0):
    n = ns(0.03); t = tt(n)
    return (bp(noise(n), 2500 * pitch, 7000 * pitch) * 0.7 + np.sin(2 * np.pi * 3200 * pitch * t) * 0.5) * np.exp(-t * 260)


def fx_pop(pitch=1.0):
    n = ns(0.14); t = tt(n)
    f = 520 * pitch * (1 + 1.6 * np.exp(-t * 55))
    return sine(f, n) * np.exp(-t * 28) * adsr(n, 0.001, 1, 1, 0.01)


def fx_blip(pitch=1.0):
    n = ns(0.06); t = tt(n)
    return sine(1600 * pitch, n) * np.exp(-t * 70)


def fx_coin(pitch=1.0):
    n = ns(0.32); t = tt(n)
    f = np.where(t < 0.06, 988 * pitch, 1319 * pitch)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.35 + sine(f, n) * 0.6
    return lp(x, 6000) * np.exp(-t * 9) * adsr(n, 0.002, 1, 1, 0.02)


def fx_click(pitch=1.0):
    n = ns(0.08); t = tt(n)
    return bp(noise(n), 2000 * pitch, 9000) * np.exp(-t * 220) + np.sin(2 * np.pi * 1800 * pitch * t) * np.exp(-t * 90) * 0.5


def fx_type():
    n = ns(0.05); t = tt(n)
    return bp(noise(n), 3000 + rng.random() * 2000, 11000) * np.exp(-t * 320) * (0.7 + 0.3 * rng.random())


def fx_whoosh(dur=0.35, f0=500, f1=5000):
    n = ns(dur); t = tt(n) / dur
    env = np.sin(np.pi * np.clip(t, 0, 1) ** 0.75) ** 2
    L = sweep_bp(noise(n), f0, f1, 1.0, 0.9) * env
    R = sweep_bp(noise(n), f0 * 1.05, f1 * 1.05, 1.0, 0.9) * env
    return np.vstack([L, R]) * 1.6


def fx_thud():
    n = ns(0.35); t = tt(n)
    f = 45 + 90 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) + lp(noise(n), 900) * np.exp(-t * 40) * 0.5


def fx_slam():
    n = ns(0.6); t = tt(n)
    k = np.zeros(n); kk = kick(170, 48, 0.5, 1.4); k[:len(kk)] += kk
    nz = lp(noise(n), 5000) * np.exp(-t * 18) * 0.55
    sub = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 5) * 0.6
    return np.tanh(1.2 * (k + nz + sub))


def fx_zip(dur=0.3):
    n = ns(dur); t = tt(n) / dur
    f = 500 + 2200 * np.clip(t, 0, 1) ** 1.4
    return sine(f, n) * 0.45 * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.5


def fx_impact(big=False):
    d = 2.6 if big else 1.6
    n = ns(d); t = tt(n)
    f = 34 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 3.4))
    nz = lp(noise(n), 3500) * np.exp(-t * 9) * 0.6
    x = np.tanh(1.4 * (boom + nz))
    c = crash(2.4)[:n]
    x[:len(c)] += c * (0.9 if big else 0.35)
    return x


def fx_thump():
    n = ns(0.3); t = tt(n)
    return kick(120, 50, 0.3, 0.6)[:n] * 0.8 + bp(noise(n), 300, 2000) * np.exp(-t * 30) * 0.4


def fx_shimmer(dur=0.6, dens=26, lo=2200, hi=6500):
    n = ns(dur + 1.2)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(int(dens * dur) + 4):
        t0 = rng.random() ** 1.6 * dur
        b = bell(lo * (hi / lo) ** rng.random(), 0.9, 3.01, 1.2, 6) * 0.18
        pan = rng.uniform(-0.9, 0.9)
        i = ns(t0)
        m = min(len(b), n - i)
        L[i:i + m] += b[:m] * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += b[:m] * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R])


def fx_sweep(dur=0.6):
    n = ns(dur); t = tt(n) / dur
    x = saw(220 * (1 + 0.02 * np.sin(2 * np.pi * 30 * tt(n))), n) + saw(331, n) * 0.5
    y = sweep_bp(x, 300, 6000, 0.8, 0.5)
    return y * np.sin(np.pi * np.clip(t, 0, 1)) * 0.8


def fx_reverse(dur=0.5):
    c = crash(1.6)[::-1]
    c = c[-ns(dur):]
    return c * np.linspace(0, 1, len(c)) ** 2 * 1.6


def fx_riser(dur=0.45):
    n = ns(dur); t = tt(n) / dur
    x = sine(400 + 1800 * t ** 2, n) * 0.25 + sweep_bp(noise(n), 500, 9000, 1.4, 0.8) * 0.8
    return x * t ** 1.6


def fx_shine(dur=0.45):
    out = np.zeros(ns(dur + 1.0))
    for k, f in enumerate((2637, 3136, 3951, 5274)):
        b = bell(f, 1.0, 3.0, 0.9, 5) * 0.2
        i = ns(k * dur / 5)
        out[i:i + len(b)] += b[:len(out) - i]
    return out


def fx_success():
    out = np.zeros(ns(1.6))
    for f, d in ((1046.5, 0.0), (1568.0, 0.08)):
        b = bell(f, 1.4, 2.0, 1.2, 3) * 0.45
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_beep():
    """Barkod okuyucu bip'i: iki kısa kare dalga."""
    out = np.zeros(ns(0.3))
    for d, f in ((0.0, 2350), (0.09, 2350)):
        n = ns(0.065); t = tt(n)
        b = lp(np.sign(np.sin(2 * np.pi * f * t)), 7000) * adsr(n, 0.002, 1, 1, 0.01) * 0.5
        out[ns(d):ns(d) + n] += b
    return out


def fx_laser(dur=1.0):
    """Tarama ışını: titreşimli, yükselip alçalan sinüs + parlak gürültü."""
    n = ns(dur); t = tt(n) / dur
    f = 900 + 500 * np.sin(np.pi * t) + 40 * np.sin(2 * np.pi * 42 * tt(n))
    x = sine(f, n) * 0.35 + sine(f * 2.01, n) * 0.12 + hp(noise(n), 6000) * 0.08
    env = np.clip(t / 0.08, 0, 1) * np.clip((1 - t) / 0.12, 0, 1)
    return x * env * (0.7 + 0.3 * np.sin(2 * np.pi * 16 * tt(n)))


def fx_glitch(dur=0.15):
    n = ns(dur)
    x = noise(n)
    hold = np.repeat(x[::60], 60)[:n]  # sample-and-hold: dijital "bit ezme"
    gate = (np.sin(2 * np.pi * 37 * tt(n)) > -0.2).astype(float)
    return np.vstack([bp(hold, 300, 9000) * gate * 0.6, bp(np.roll(hold, 200), 300, 9000) * gate * 0.6]) * np.exp(-tt(n) * 8)


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'coin': lambda c: fx_coin(c.get('pitch', 1)),
    'click': lambda c: fx_click(c.get('pitch', 1)),
    'type': lambda c: fx_type(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'thud': lambda c: fx_thud(),
    'slam': lambda c: fx_slam(),
    'zip': lambda c: fx_zip(c.get('dur', 0.3)),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'riser': lambda c: fx_riser(c.get('dur', 0.45)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'success': lambda c: fx_success(),
    'beep': lambda c: fx_beep(),
    'laser': lambda c: fx_laser(c.get('dur', 1.0)),
    'glitch': lambda c: fx_glitch(c.get('dur', 0.15)),
}
REV = {'slam': 0.25, 'impact': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4, 'shine': 0.4,
       'coin': 0.15, 'pop': 0.12, 'whoosh': 0.1, 'thump': 0.15, 'thud': 0.15, 'beep': 0.2, 'laser': 0.15}


# ───────────────────────── beste ─────────────────────────
NOTE = {'A1': 55.0, 'F1': 43.65, 'G1': 49.0, 'C2': 65.41, 'D2': 73.42, 'A2': 110.0, 'E2': 82.41, 'F2': 87.31, 'G2': 98.0,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.0, 'B5': 987.77,
        'C6': 1046.5, 'E6': 1318.5, 'G6': 1568.0}
CH = {'Am': ['A3', 'C4', 'E4', 'A4'], 'F': ['F3', 'A3', 'C4', 'F4'], 'G': ['G3', 'B3', 'D4', 'G4'],
      'Dm': ['D3', 'F3', 'A3', 'D4'], 'C': ['C4', 'E4', 'G4', 'C5']}
ROOT = {'Am': 'A1', 'F': 'F1', 'G': 'G1', 'Dm': 'D2', 'C': 'C2'}
ARP = {'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['F4', 'A4', 'C5', 'F5'], 'G': ['G4', 'B4', 'D5', 'G5'],
       'Dm': ['D5', 'F5', 'A5', 'D5'], 'C': ['C5', 'E5', 'G5', 'C6']}
f = lambda *names: [NOTE[x] for x in names]


def compose():
    kicks = []

    def K(t, v=1.0, bus=None):
        kicks.append(t)
        send(bus or drums, kick(), t, 0.95 * v)

    # 0. ölçü — saat: karanlık Am pad'i, alt drone, yarım zamanlı nabız
    send(music, pad(f(*CH['Am']), BAR, cut=700, att=0.6, rel=0.3), 0.0, 0.85)
    send(bass_bus, bass_note(NOTE['A1'], BAR, 220) * 0.6, 0.0, 0.5)
    for b in (0, 2):
        send(drums, kick(110, 45, 0.35, 0.3), at(0, b), 0.4)

    # 1. ölçü — pikseller: darbe, parlak Am, kare dalga arpeji (uçan pikseller)
    K(at(1), 1.05)
    send(music, pad(f(*CH['Am']), BAR, cut=2600, att=0.02, rel=0.3), at(1), 0.9)
    send(bass_bus, bass_note(NOTE['A1'], 0.8, 380), at(1), 0.75)
    K(at(1, 2), 0.7)
    for i in range(12):  # 16'lıklar, 2.344'ten 3.75'e
        t = at(1, 1) + i * BEAT / 4
        nm = ARP['Am'][[0, 1, 2, 3, 2, 3, 1, 2, 0, 2, 3, 1][i]]
        send(music, sq_pluck(NOTE[nm], 0.16, 1500 + 400 * i), t, 0.16, -0.35 if i % 2 else 0.35, rev=0.25)
    for i in range(6):
        send(drums, hat(), at(1, 1) + i * BEAT / 2, 0.14, 0.3)

    # 2. ölçü — tarama: F, boğuk dört vuruş (drop'a gerilim), arpej, rulo
    send(music, pad(f(*CH['F']), BAR, cut=1500, att=0.05, rel=0.2), at(2), 0.85)
    for b in range(3):
        K(at(2, b), 0.85, muffled)
        send(bass_bus, bass_note(NOTE['F1'], 0.2, 300), at(2, b + 0.5), 0.55)
    for i in range(12):
        t = at(2) + i * BEAT / 4
        nm = ARP['F'][[0, 1, 2, 3][i % 4]]
        send(music, sq_pluck(NOTE[nm], 0.14, 1200 + 150 * i), t, 0.12, -0.3 if i % 2 else 0.3, rev=0.2)
    for i in range(10):
        send(drums, hat(), at(2) + i * BEAT / 4 + BEAT / 8, 0.07, -0.2)
    roll = [at(2, 3) + i * BEAT / 8 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.25 + 0.75 * j / len(roll)), t, 0.38, 0, rev=0.2)

    # 3–5. ölçüler — DROP ve groove: Am → F → G
    for bar, ch in ((3, 'Am'), (4, 'F'), (5, 'G')):
        send(music, pad(f(*CH[ch]), BAR, cut=3000, att=0.02, rel=0.25), at(bar), 0.85)
        root = NOTE[ROOT[ch]]
        for b in range(4):
            if bar == 5 and b == 3:
                continue  # 10.78–11.25: marka geçişi için nefes
            t = at(bar, b)
            K(t)
            if b % 2 == 1:
                send(drums, clap(), t, 0.55, 0, rev=0.25)
            send(bass_bus, bass_note(root * 2, 0.2, 650), t + BEAT / 2, 0.75)
            send(bass_bus, bass_note(root, 0.16, 400), t + BEAT * 0.75, 0.4)
        # offbeat akor darbeleri
        for b in range(4):
            if bar == 5 and b == 3:
                continue
            for nm in CH[ch][1:]:
                send(music, pluck(NOTE[nm] * 2, 0.22, 1.3), at(bar, b + 0.5), 0.1, 0, rev=0.25)
        for i in range(16):
            if bar == 5 and i >= 12:
                break
            send(drums, hat(i % 4 == 2), at(bar) + i * BEAT / 4, 0.2 if i % 2 else 0.1, 0.3 if i % 2 else -0.3)
    # drop'ta kanca: yükselen piksel motifi
    for i, nm in enumerate(['E5', 'A5', 'C6', 'A5', 'E5', 'C5', 'E5', 'A5']):
        send(music, sq_pluck(NOTE[nm], 0.2, 4000), at(3) + i * BEAT / 2, 0.14, 0, rev=0.3)

    # 6. ölçü — kırılma: Dm → G, gözler oturdukça çanlar, sonra trampet rulosu
    send(music, pad(f(*CH['Dm']), BAR / 2, cut=1900, att=0.03, rel=0.3), at(6), 0.9)
    send(music, pad(f(*CH['G']), BAR / 2, cut=2400, att=0.03, rel=0.3), at(6, 2), 0.9)
    send(bass_bus, bass_note(NOTE['D2'], BAR / 2 - 0.05, 300), at(6), 0.5)
    send(bass_bus, bass_note(NOTE['G1'], BAR / 2, 300), at(6, 2), 0.5)
    for t, nm in ((at(6, 1), 'D5'), (at(6, 1.5), 'F5'), (at(6, 2), 'A5'), (at(6, 2.5), 'B5')):
        send(music, bell(NOTE[nm], 1.4, 3.5, 1.8, 2.4), t, 0.2, 0, rev=0.4)
    roll = [at(6, 3) + i * BEAT / 4 for i in range(2)] + [at(6, 3.5) + i * BEAT / 8 for i in range(4)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.42, 0, rev=0.25)
    n = ns(BEAT * 2); tr = tt(n) / (BEAT * 2)
    riser = sine(300 + 1200 * tr ** 2, n) * tr ** 2 * 0.16 + sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.45
    send(sfx, riser, at(6, 2), 0.55)

    # 7. ölçü — kapanış: C majör, ses logosu G5 → C6 → E6 → G6
    K(at(7), 1.15)
    send(music, pad(f(*CH['C']) + [NOTE['G5']], 1.4, cut=3400, att=0.02, rel=0.9), at(7), 1.15)
    send(bass_bus, bass_note(NOTE['C2'], 1.1, 500), at(7), 0.65)
    send(music, bell(NOTE['G5'], 2.0, 3.5, 2.0, 1.8), at(6, 3.5), 0.22, 0, rev=0.4)
    for k, nm in enumerate(('C6', 'E6', 'G6')):
        send(music, bell(NOTE[nm], 2.8, 3.5, 2.2, 1.5), at(7, k * 0.5), 0.34 - k * 0.05, (k - 1) * 0.25, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), at(7, k * 0.5), 0.14, 0, rev=0.3)
    for nm in ('C4', 'E4', 'G4', 'C5'):
        send(music, pluck(NOTE[nm], 1.2, 1.0), at(7, 2), 0.14, 0, rev=0.5)
    K(at(7, 2), 0.6)
    send(bass_bus, bass_note(NOTE['C2'], 0.8, 400), at(7, 2), 0.45)
    for i in range(12):
        send(drums, hat(), at(7) + i * BEAT / 4, 0.07 if i % 2 else 0.04, 0.3 if i % 2 else -0.3)
    return kicks


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues = info['cues'] if isinstance(info, dict) else info
    kicks = compose()
    for c in cues:
        x = FX[c['type']](c)
        send(sfx, x, c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(c['type'], 0.0))

    # sidechain: bas ve müzik kick'lere yer açar
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        d = 1 - 0.6 * np.exp(-t[: min(ns(0.4), N - i)] / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # tarama ölçüsündeki dört vuruş boğuk: drop'ta filtre birden açılır
    mL, mR = lp(muffled.L, 260, 4) * 1.6, lp(muffled.R, 260, 4) * 1.6

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.0); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.55
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.55

    L = (drums.L + mL) * 0.9 + (bass_bus.L * 0.85 + music.L) * duck + sfx.L * 0.9 + vL
    R = (drums.R + mR) * 0.9 + (bass_bus.R * 0.85 + music.R) * duck + sfx.R * 0.9 + vR
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)
    # son: 14.3 sn'den itibaren yumuşak kapanış, tam 15.0 sn'de kes
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.7, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
