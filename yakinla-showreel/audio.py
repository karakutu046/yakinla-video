#!/usr/bin/env python3
"""Yakınla showreel'inin müziği ve ses efektleri: tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav

- Müzik 120 BPM, 4/4. Sahne geçişleri ölçü başlarına (0, 4, 8, 12, 16 sn) oturur.
  Akorlar: Em (giriş) → Em C G D (sipariş + teslimat) → C D (vaat, gerilim) → G (logo, çözülme).
- Ses logosu: logonun ibreleri otururken çalan üç nota, G5 – B5 – D6 ("Ya-kın-la").
- Efektler, anim.js'in ürettiği cues.json'dan gelir; böylece her pop, tık ve whoosh
  ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.
"""
import json
import sys

import numpy as np
from scipy import signal

SR = 48000
DUR = 20.0
N = int(SR * (DUR + 2.5))
BEAT = 0.5
rng = np.random.default_rng(7)


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
    """Zamanla değişen bant geçiren (whoosh'lar için)."""
    out = np.zeros_like(x)
    zi = None
    ch = 256
    for i in range(0, len(x), ch):
        p = (i / max(1, len(x) - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        lo, hi = max(40, fc * (1 - q / 2)), min(SR / 2 - 200, fc * (1 + q / 2))
        s = sos('band', [lo, hi], 2)
        if zi is None or zi.shape != (s.shape[0], 2):
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


drums, bass_bus, music, sfx, verb = Bus(), Bus(), Bus(), Bus(), Bus()


def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0):
    bus.add(x, t, gain, pan)
    if rev > 0:
        verb.add(x, t, gain * rev, pan)


# ───────────────────────── enstrümanlar ─────────────────────────
def kick(f0=150, f1=44, dur=0.42, punch=1.0):
    n = ns(dur); t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = hp(noise(n), 3000) * np.exp(-t * 400) * 0.35 * punch
    return np.tanh(1.6 * (body + click))


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
            ff = f * 2 ** (det / 12)
            x = saw(ff, n, rng.random())
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


def fx_tap():
    n = ns(0.05); t = tt(n)
    return (bp(noise(n), 1500, 6000) * np.exp(-t * 300) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 120) * 0.6)


def fx_click():
    n = ns(0.08); t = tt(n)
    return bp(noise(n), 2000, 9000) * np.exp(-t * 220) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5


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


def fx_crinkle(dur=0.4):
    """Paket hışırtısı: sık, kısa, tiz gürültü patlamaları."""
    n = ns(dur + 0.05)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(int(dur * 70)):
        t0 = rng.random() * dur
        m = ns(0.004 + rng.random() * 0.01)
        b = bp(noise(m), 2500 + rng.random() * 3000, 9000 + rng.random() * 6000) * np.exp(-tt(m) * (300 + rng.random() * 300))
        b *= (0.3 + rng.random()) * (1 - t0 / dur * 0.6)
        i = ns(t0); pan = rng.uniform(-0.5, 0.5)
        L[i:i + m] += b * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += b * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R]) * 1.2


def fx_slam():
    n = ns(0.6); t = tt(n)
    k = np.zeros(n); kk = kick(170, 48, 0.5, 1.4); k[:len(kk)] += kk
    nz = lp(noise(n), 5000) * np.exp(-t * 18) * 0.55
    sub = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 5) * 0.6
    return np.tanh(1.2 * (k + nz + sub))


def fx_zip(dur=0.44):
    n = ns(dur); t = tt(n) / dur
    f = 320 + 1300 * np.sin(np.pi * np.clip(t, 0, 1)) ** 1.5
    return sine(f, n) * 0.5 * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.5


def fx_impact(big=False):
    d = 2.6 if big else 1.6
    n = ns(d); t = tt(n)
    f = 34 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 3.4))
    nz = lp(noise(n), 3500) * np.exp(-t * 9) * 0.6
    x = np.tanh(1.4 * (boom + nz))
    if big:
        x[:len(crash(2.4))] += crash(2.4) * 0.9
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


def fx_shine(dur=0.45):
    out = np.zeros(ns(dur + 1.0))
    for k, f in enumerate((2637, 3136, 3951, 5274)):
        b = bell(f, 1.0, 3.0, 0.9, 5) * 0.2
        i = ns(k * dur / 5)
        out[i:i + len(b)] += b[:len(out) - i]
    return out


def fx_doorbell():
    out = np.zeros(ns(2.4))
    for f, d in ((659.25, 0.0), (523.25, 0.24)):
        b = bell(f, 2.0, 3.0, 1.1, 1.6) * 0.5 + bell(f * 2, 2.0, 3.0, 0.6, 2.2) * 0.12
        i = ns(d)
        out[i:i + len(b)] += b[:len(out) - i]
    return out


def fx_success():
    out = np.zeros(ns(1.6))
    for f, d in ((783.99, 0.0), (1174.66, 0.09)):
        b = bell(f, 1.4, 2.0, 1.4, 3) * 0.45
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_motor(track, gain):
    tr = np.array(track)
    t0, t1 = tr[0, 0], tr[-1, 0]
    n = ns(t1 - t0); t = t0 + tt(n)
    pan = np.interp(t, tr[:, 0], tr[:, 1])
    spd = np.interp(t, tr[:, 0], tr[:, 2])
    f = 62 + 70 * spd
    x = saw(f, n) * 0.6 + saw(f * 1.5, n) * 0.25 + lp(noise(n), 400) * 0.3
    x = lp(x, 650, 2) * (0.75 + 0.25 * np.sin(2 * np.pi * 27 * tt(n)))
    env = np.clip(tt(n) / 0.25, 0, 1) * np.clip((t1 - t) / 0.3, 0, 1) * (0.35 + 0.65 * np.clip(spd, 0, 1))
    x *= env * gain
    return np.vstack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)]) * 1.4142, t0


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'coin': lambda c: fx_coin(c.get('pitch', 1)),
    'tap': lambda c: fx_tap(),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'thud': lambda c: fx_thud(),
    'crinkle': lambda c: fx_crinkle(c.get('dur', 0.4)),
    'slam': lambda c: fx_slam(),
    'zip': lambda c: fx_zip(c.get('dur', 0.44)),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'doorbell': lambda c: fx_doorbell(),
    'success': lambda c: fx_success(),
}
REV = {'slam': 0.25, 'impact': 0.35, 'doorbell': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4,
       'shine': 0.4, 'coin': 0.15, 'pop': 0.12, 'crinkle': 0.1, 'whoosh': 0.1, 'thump': 0.15}


# ───────────────────────── beste ─────────────────────────
NOTE = {'E2': 82.41, 'C2': 65.41, 'G2': 98.0, 'D2': 73.42,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.0, 'B5': 987.77,
        'D6': 1174.66, 'G6': 1567.98}
CH = {'Em': ['E3', 'G3', 'B3', 'E4'], 'C': ['C3', 'E3', 'G3', 'C4'], 'G': ['G3', 'B3', 'D4', 'G4'],
      'D': ['D3', 'F#3', 'A3', 'D4']}
ROOT = {'Em': 'E2', 'C': 'C2', 'G': 'G2', 'D': 'D2'}
ARP = {'Em': ['E4', 'G4', 'B4', 'E5'], 'C': ['C4', 'E4', 'G4', 'C5'], 'G': ['G4', 'B4', 'D5', 'G5'],
       'D': ['D4', 'F#4', 'A4', 'D5']}
f = lambda *names: [NOTE[x] for x in names]


def compose():
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    # Giriş (0–4): saat tıkırtısı, karanlık pad, "Süt bitti" pluck'ı, çakma vuruşları
    send(music, pad(f(*CH['Em']), 2.5, cut=650, att=1.2, rel=0.5), 0.0, 0.8)
    send(music, pad(f(*CH['Em']), 1.6, cut=2600, att=0.08, rel=0.4), 2.42, 1.0)
    for i in range(5):
        send(drums, fx_tick(1.3 if i % 2 == 0 else 1.0), i * 0.5, 0.35, 0.2 if i % 2 else -0.2)
    for t, nm in ((1.25, 'B4'), (1.5, 'G4'), (1.75, 'E4')):
        send(music, pluck(NOTE[nm], 0.6, 0.8), t, 0.45, 0, rev=0.35)
    send(bass_bus, bass_note(NOTE['E2'], 0.6), 1.0, 0.6)
    for t in (2.5, 2.75, 3.0):
        for nm in ('E4', 'G4', 'B4'):
            send(music, pluck(NOTE[nm], 0.45, 1.3), t, 0.28, 0, rev=0.3)
        send(bass_bus, bass_note(NOTE['E2'], 0.22, 700), t, 0.7)
    rz = fx_whoosh(0.6, 300, 4000)
    send(sfx, rz, 3.42, 0.25)

    # Groove (4–12) ve gerilim (12–16)
    prog_ = [(4, 'Em'), (6, 'C'), (8, 'G'), (10, 'D'), (12, 'C'), (14, 'D')]
    for bar, ch in prog_:
        send(music, pad(f(*CH[ch]), 2.0, cut=2000 if bar < 12 else 2800, att=0.04, rel=0.35), bar, 1.0)
        root = NOTE[ROOT[ch]]
        for k in range(4):
            if bar == 6 and k == 3:
                continue  # 7.5–8: dalış için nefes
            if bar == 10 and k == 3:
                continue  # 11.5–12: kapı zili için boşluk
            t = bar + k * 0.5
            if bar < 12:
                send(bass_bus, bass_note(root, 0.22), t + 0.25, 0.75)
                if k == 0:
                    send(bass_bus, bass_note(root, 0.18), t, 0.45)
            else:
                for s in range(4):
                    if bar == 14 and k >= 2:
                        break
                    send(bass_bus, bass_note(root * (2 if s == 2 else 1), 0.11, 600), t + s * 0.125, 0.55 if s % 2 else 0.4)
    for b in range(16):
        t = 4 + b * 0.5
        if 7.6 <= t < 8.0 or 11.5 <= t < 12.0:
            continue
        K(t)
        if b % 2 == 1:
            send(drums, clap(), t, 0.55, 0, rev=0.25)
    for b in range(16, 23):
        t = 12 + (b - 16) * 0.5
        K(t)
        if b % 2 == 1:
            send(drums, clap(), t, 0.6, 0, rev=0.25)
    # hi-hat'ler
    for i in range(int(8 / 0.25)):
        t = 4 + i * 0.25
        if 7.6 <= t < 8.0 or 11.5 <= t < 12.0:
            continue
        if i % 2 == 1:
            send(drums, hat(), t, 0.32, 0.3)
        elif t >= 8:
            send(drums, hat(), t, 0.12, -0.3)
    for i in range(int(3.5 / 0.125)):
        t = 12 + i * 0.125
        if i % 4 == 2:
            send(drums, hat(True), t, 0.22, 0.25)
        else:
            send(drums, hat(), t, 0.13 if i % 2 else 0.08, -0.25 if i % 2 else 0.25)
    # teslimat arpeji (8–11.5)
    for i in range(int(3.5 / 0.125)):
        t = 8 + i * 0.125
        ch = 'G' if t < 10 else 'D'
        nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
        send(music, pluck(NOTE[nm] * 2, 0.25, 1.1), t, 0.11, -0.4 if i % 2 else 0.4, rev=0.3)
    # 12–15.5: offbeat akor stab'ları
    for k in range(7):
        t = 12.25 + k * 0.5
        ch = 'C' if t < 14 else 'D'
        for nm in ARP[ch][:3]:
            send(music, pluck(NOTE[nm], 0.3, 1.2), t, 0.12, 0, rev=0.25)
    # trampet rulosu + riser (15–16)
    roll = [15 + i * 0.125 for i in range(4)] + [15.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.25 + 0.75 * j / len(roll)), t, 0.4, 0, rev=0.2)
    n = ns(1.0); tr = tt(n)
    riser = sine(300 + 900 * tr ** 2, n) * tr ** 2 * 0.18 + sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.5
    send(sfx, riser, 15.0, 0.6)

    # Kapanış (16–20): G majör, ses logosu, son vuruş
    K(16.0, 1.1)
    send(music, pad(f(*CH['G']) + [NOTE['D5']], 3.6, cut=3200, att=0.02, rel=1.2), 16.0, 1.15)
    send(bass_bus, bass_note(NOTE['G2'], 0.9, 500), 16.0, 0.6)
    for t, nm in ((16.5, 'G5'), (16.75, 'B5'), (17.0, 'D6')):
        send(music, bell(NOTE[nm], 2.8, 3.5, 2.2, 1.4), t, 0.36, 0, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.16, 0, rev=0.3)
    send(music, bell(NOTE['G6'], 2.0, 3.5, 1.4, 2.0), 17.0, 0.12, 0.3, rev=0.6)
    K(17.0, 0.7)
    send(bass_bus, bass_note(NOTE['G2'], 0.6, 500), 17.0, 0.4)
    for i in range(16):
        t = 17.0 + i * 0.125
        send(drums, hat(), t, 0.08 if i % 2 else 0.05, 0.3 if i % 2 else -0.3)
    K(18.0, 0.8)
    for nm in ('G4', 'B4', 'D5', 'G5'):
        send(music, pluck(NOTE[nm], 1.2, 1.0), 18.0, 0.18, 0, rev=0.5)
    send(music, bell(NOTE['G5'], 2.4, 3.5, 1.6, 1.6), 18.0, 0.16, 0, rev=0.5)
    send(bass_bus, bass_note(NOTE['G2'], 1.0, 400), 18.0, 0.5)
    return kicks


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues = info['cues'] if isinstance(info, dict) else info
    kicks = compose()
    for c in cues:
        typ = c['type']
        if typ == 'motor':
            x, t0 = fx_motor(c['track'], c.get('gain', 0.3))
            sfx.add(x, t0)
            continue
        x = FX[typ](c)
        send(sfx, x, c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(typ, 0.0))

    # sidechain: bas ve müzik kick'lere yer açar
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        seg = t[: N - i] if i < N else t[:0]
        d = 1 - 0.6 * np.exp(-seg[: ns(0.4)] / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.2); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.55
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.55

    L = drums.L * 0.9 + (bass_bus.L * 0.85 + music.L) * duck + sfx.L * 0.9 + vL
    R = drums.R * 0.9 + (bass_bus.R * 0.85 + music.R) * duck + sfx.R * 0.9 + vR
    # alçak frekans temizliği + yumuşak limit
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)
    # son: 19.3 sn'den itibaren yumuşak kapanış, tam 20.0 sn'de kes
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.7, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    import wave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
