#!/usr/bin/env python3
"""Yakınla Yemek tanıtım filminin sesi: müzik + efektler (sentez) + ElevenLabs dış sesi.

Kullanım:  python3 audio.py build/cues.json build/vo/dis_ses.wav build/audio.wav

- Müzik 120 BPM, 4/4, sol majör. Ölçü başları "MÜJDE!" anına (3.95 sn) göre dizilir; böylece
  yemeklerin olduğu bölüm (7.95), dalış (17.95), kurye yolculuğu (19.95), tabağın düşüşü (23.95)
  ve logonun düşüşü (27.95) ölçü başına oturur. Akorlar: Em (gece) → G D Em C … → G (logo).
- Ses logosu, son ölçüde G5 – B5 – D6 ("Ya-kın-la"): önceki Yakınla filmiyle aynı imza.
- Efektler anim.js'in ürettiği cues.json'dan gelir: her pop, tık ve whoosh ekrandaki hareketle
  aynı karede duyulur.
- Dış ses tek kayıttır; cues.json'daki VO tablosuna göre 11 parçaya bölünüp sahnelere yerleşir.
  Konuşma boyunca müzik ve efektler kısılır (sidechain), dış ses her zaman üstte kalır.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(11)


def tt(n):
    return np.arange(n) / SR


def ns(sec):
    return int(round(sec * SR))


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
N = 0


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


# ───────────────────────── enstrümanlar ─────────────────────────
def kick(f0=150, f1=46, dur=0.4, punch=1.0):
    n = ns(dur); t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
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


def shaker():
    n = ns(0.09); t = tt(n)
    return bp(noise(n), 5000, 12000) * (np.clip(t / 0.015, 0, 1) * np.exp(-t * 45))


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


def marimba(f, dur=0.6):
    n = ns(dur); t = tt(n)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22)
    x += 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    return x * adsr(n, 0.001, 1, 1, 0.02)


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
    n = ns(0.08); t = tt(n)
    return sine(1400 * pitch * (1 + 0.5 * np.exp(-t * 60)), n) * np.exp(-t * 50)


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


def fx_slam():
    n = ns(0.6); t = tt(n)
    k = np.zeros(n); kk = kick(170, 48, 0.5, 1.4); k[:len(kk)] += kk
    nz = lp(noise(n), 5000) * np.exp(-t * 18) * 0.55
    sub = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 5) * 0.6
    return np.tanh(1.2 * (k + nz + sub))


def fx_impact(big=False):
    d = 2.6 if big else 1.6
    n = ns(d); t = tt(n)
    f = 34 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 3.4))
    nz = lp(noise(n), 3500) * np.exp(-t * 9) * 0.6
    x = np.tanh(1.4 * (boom + nz))
    if big:
        c = crash(2.4)
        x[:len(c)] += c * 0.9
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


def fx_ring(dur=1.3):
    """Zil: tokmağın hızlı vuruşlarıyla çalan küçük bir el zili."""
    n = ns(dur + 0.8)
    out = np.zeros(n)
    k, t0 = 0, 0.0
    while t0 < dur:
        b = bell(1760 * (1 if k % 2 else 1.006), 0.8, 2.76, 1.6, 7) * 0.5 + bell(2637, 0.8, 2.0, 0.8, 9) * 0.15
        i = ns(t0)
        out[i:i + len(b)] += b[:n - i] * (1 - 0.55 * t0 / dur)
        t0 += 0.072; k += 1
    return out


def fx_growl(dur=0.9):
    """Karın guruldaması: titreşimli, perdesi oynayan alçak gürültü."""
    n = ns(dur); t = tt(n)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8
    f = 95 + 35 * np.sin(2 * np.pi * 2.3 * t) + 20 * np.sin(2 * np.pi * 7 * t)
    tone = saw(f, n) * 0.5 + sine(f * 0.5, n) * 0.6
    am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * (13 + 6 * np.sin(2 * np.pi * 1.1 * t)) * t))
    body = lp(tone * am, 420, 2) + lp(noise(n), 260, 2) * 0.6 * am
    return np.tanh(2.0 * body) * env


def fx_toggle():
    n = ns(0.25); t = tt(n)
    c1 = bp(noise(n), 2500, 9000) * np.exp(-t * 400) * 0.9
    c2 = np.zeros(n); i = ns(0.07); c2[i:] = (bp(noise(n - i), 1800, 7000) * np.exp(-tt(n - i) * 300))
    th = np.sin(2 * np.pi * (180 + 140 * np.exp(-t * 40)) * t) * np.exp(-t * 22) * 0.6
    return c1 + c2 * 0.8 + th


def fx_sizzle(dur=0.75):
    n = ns(dur); t = tt(n)
    pops = (rng.random(n) < 0.004) * rng.standard_normal(n) * 4
    x = hp(noise(n) * 0.35 + pops, 3000, 2)
    return x * np.clip(t / 0.08, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)


def fx_slap():
    n = ns(0.2); t = tt(n)
    return bp(noise(n), 600, 6000) * np.exp(-t * 60) * 0.9 + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30) * 0.5


def fx_brake(dur=0.6):
    n = ns(dur); t = tt(n)
    f = 2300 + 120 * np.sin(2 * np.pi * 33 * t) - 400 * t / dur
    x = sine(f, n) * 0.35 + bp(noise(n), 1800, 5000) * 0.3
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5


def fx_door(dur=0.5):
    n = ns(dur); t = tt(n)
    f = 260 + 120 * (t / dur) + 30 * np.sin(2 * np.pi * 18 * t)
    x = (saw(f, n) * 0.4 * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 40 * t)))) + bp(noise(n), 400, 2500) * 0.3
    return lp(x, 2200) * np.sin(np.pi * np.clip(t / dur, 0, 1)) * 0.8


def fx_fall(dur=0.3):
    n = ns(dur); t = tt(n)
    f = 1800 * (0.25 / 1.8) ** (t / dur)
    return sine(f, n) * 0.4 * np.clip(t / 0.05, 0, 1)


def fx_night(dur=3.9):
    """Gece ortamı: uzak cırcır böcekleri ve hafif rüzgâr."""
    n = ns(dur); t = tt(n)
    L, R = np.zeros(n), np.zeros(n)
    for k in range(2):
        f = 4300 + k * 450
        chirp = (np.sin(2 * np.pi * 26 * t + k) > 0.2) * (np.sin(2 * np.pi * (0.9 + 0.3 * k) * t + k * 2) > 0.1)
        x = np.sin(2 * np.pi * f * t) * chirp * 0.12
        pan = -0.6 if k == 0 else 0.6
        L += x * np.cos((pan + 1) * np.pi / 4); R += x * np.sin((pan + 1) * np.pi / 4)
    wind = lp(noise(n), 500) * 0.25
    env = np.clip(t / 0.6, 0, 1) * np.clip((dur - t) / 0.5, 0, 1)
    return np.vstack([(L + wind) * env, (R + wind) * env])


def fx_motor(track, gain):
    tr = np.array(track)
    t0, t1 = tr[0, 0], tr[-1, 0]
    n = ns(t1 - t0); t = t0 + tt(n)
    pan = np.interp(t, tr[:, 0], tr[:, 1])
    spd = np.interp(t, tr[:, 0], tr[:, 2])
    f = 70 + 80 * spd
    x = saw(f, n) * 0.6 + saw(f * 1.5, n) * 0.25 + lp(noise(n), 400) * 0.3
    x = lp(x, 700, 2) * (0.75 + 0.25 * np.sin(2 * np.pi * 27 * tt(n)))
    env = np.clip(tt(n) / 0.25, 0, 1) * np.clip((t1 - t) / 0.3, 0, 1) * (0.25 + 0.75 * np.clip(spd, 0, 1))
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
    'slam': lambda c: fx_slam(),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'doorbell': lambda c: fx_doorbell(),
    'success': lambda c: fx_success(),
    'ring': lambda c: fx_ring(c.get('dur', 1.3)),
    'growl': lambda c: fx_growl(c.get('dur', 0.9)),
    'toggle': lambda c: fx_toggle(),
    'sizzle': lambda c: fx_sizzle(c.get('dur', 0.75)),
    'slap': lambda c: fx_slap(),
    'brake': lambda c: fx_brake(c.get('dur', 0.6)),
    'door': lambda c: fx_door(c.get('dur', 0.5)),
    'fall': lambda c: fx_fall(c.get('dur', 0.3)),
    'night': lambda c: fx_night(c.get('dur', 3.9)),
}
REV = {'slam': 0.25, 'impact': 0.35, 'doorbell': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4,
       'shine': 0.4, 'coin': 0.15, 'pop': 0.12, 'whoosh': 0.1, 'thump': 0.15, 'ring': 0.3, 'toggle': 0.1}


# ───────────────────────── beste ─────────────────────────
NOTE = {'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'G2': 98.0, 'A2': 110.0,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.0, 'B5': 987.77,
        'D6': 1174.66, 'G6': 1567.98}
CH = {'Em': ['E3', 'G3', 'B3', 'E4'], 'C': ['C3', 'E3', 'G3', 'C4'], 'G': ['G3', 'B3', 'D4', 'G4'],
      'D': ['D3', 'F#3', 'A3', 'D4']}
ROOT = {'Em': 'E2', 'C': 'C2', 'G': 'G2', 'D': 'D2'}
ARP = {'Em': ['E4', 'G4', 'B4', 'E5'], 'C': ['C4', 'E4', 'G4', 'C5'], 'G': ['G4', 'B4', 'D5', 'G5'],
       'D': ['D4', 'F#4', 'A4', 'D5']}
fr = lambda *names: [NOTE[x] for x in names]
G0 = 3.95   # "MÜJDE!": ölçü 0'ın başı
BAR = 2.0


def bar(k, beat=0.0):
    return G0 + k * BAR + beat * 0.5


def compose(drums, bass_bus, music, send):
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    # Giriş (0–3.95): gece, Em pad, soru motifi, guruldamadan sonra yükselen gerilim
    send(music, pad(fr(*CH['Em']), 3.6, cut=700, att=1.0, rel=0.4), 0.0, 0.8)
    for t, nm in ((0.7, 'E5'), (0.95, 'G5'), (1.2, 'B5'), (1.95, 'A5'), (2.2, 'G5')):
        send(music, marimba(NOTE[nm], 0.7), t, 0.32, 0.2, rev=0.45)
    send(bass_bus, bass_note(NOTE['E2'], 0.7), 0.7, 0.45)
    roll = [3.45 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.2 + 0.8 * j / len(roll)), t, 0.35, 0, rev=0.2)
    n = ns(0.6); tr = tt(n)
    riser = sine(300 + 1100 * (tr / 0.6) ** 2, n) * (tr / 0.6) ** 2 * 0.16
    send(music, riser, 3.35, 0.6)

    prog_ = ['G', 'D', 'Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D', 'Em', 'D', 'G', 'C', 'G']
    for k, ch in enumerate(prog_):
        t0 = bar(k)
        if k == 9:   # 21.95–23.95: durak, kapı zili, kapı açılır → yalnızca pad ve yükseliş
            send(music, pad(fr(*CH[ch]), 1.9, cut=1400, att=0.05, rel=0.4), t0, 0.8)
            send(bass_bus, bass_note(NOTE[ROOT[ch]], 0.45), t0, 0.55)
            n = ns(0.95); tr = tt(n)
            rz = sine(260 + 900 * (tr / 0.95) ** 2, n) * (tr / 0.95) ** 2 * 0.14 + sweep_bp(noise(n), 400, 8000, 1.6, 0.8) * (tr / 0.95) ** 2 * 0.4
            send(music, rz, t0 + 1.05, 0.55)
            for j in range(8):
                send(drums, snare(0.2 + 0.8 * j / 8), t0 + 1.5 + j * 0.0625, 0.3, 0, rev=0.2)
            continue
        last = k >= 12
        send(music, pad(fr(*CH[ch]) + ([NOTE['D5']] if last else []), 2.0 if k < 14 else 3.0,
                        cut=2400 if not last else 3000, att=0.04, rel=0.4 if k < 14 else 1.4), t0, 0.95)
        root = NOTE[ROOT[ch]]
        # bas: ölçü başında kök + ara vuruşlarda pompa
        if k < 14:
            send(bass_bus, bass_note(root, 0.2), t0, 0.5)
            for b in range(4):
                send(bass_bus, bass_note(root * (2 if b == 3 else 1), 0.2), t0 + b * 0.5 + 0.25, 0.7)
        else:
            send(bass_bus, bass_note(root, 1.6, 380), t0, 0.6)
        # davul
        if k < 14:
            for b in range(4):
                t = t0 + b * 0.5
                if k == 12 and b == 0:
                    continue  # logo düşüşünde boşluk; vuruşu pin yere değince efekt verir
                K(t, 0.85 if k in (3, 7) else 1.0)
                if b % 2 == 1:
                    send(drums, clap(), t, 0.5, 0, rev=0.25)
            for i in range(8):
                t = t0 + i * 0.25
                send(drums, hat(), t, 0.28 if i % 2 else 0.1, 0.3 if i % 2 else -0.3)
                if k in (8, 10, 11):
                    send(drums, shaker(), t + 0.125, 0.18, -0.4)
        else:
            K(t0, 1.1)
        # melodi: yemek bölümünde marimba vuruşları, yolculukta arpej, nakaratta akor stab'ları
        if k in (2, 3, 4, 5, 6, 7):
            for i, b in enumerate((0.5, 1.5, 2.5, 3.0, 3.5)):
                nm = ARP[ch][[2, 1, 3, 2, 0][i]]
                send(music, marimba(NOTE[nm], 0.5), t0 + b * 0.5, 0.16, -0.3 if i % 2 else 0.3, rev=0.3)
        if k == 8:
            for i in range(16):
                nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
                send(music, pluck(NOTE[nm] * 2, 0.25, 1.1), t0 + i * 0.125, 0.1, -0.4 if i % 2 else 0.4, rev=0.3)
        if k in (10, 11):
            for b in range(4):
                for nm in ARP[ch][:3]:
                    send(music, pluck(NOTE[nm], 0.3, 1.2), t0 + b * 0.5 + 0.25, 0.1, 0, rev=0.25)
        if k == 11:
            roll = [t0 + 1.5 + i * 0.0625 for i in range(8)]
            for j, t in enumerate(roll):
                send(drums, snare(0.2 + 0.8 * j / 8), t, 0.35, 0, rev=0.2)
        if k == 12:
            send(drums, crash(2.4), t0 + 0.3, 0.35)
    # "AÇ KALMIYOR!" vuruşu: 10. ölçünün üçüncü vuruşu
    send(drums, crash(2.4), bar(10, 2), 0.5)
    # ses logosu: G5 – B5 – D6, son ölçüde
    for t, nm in ((bar(14, 0.5), 'G5'), (bar(14, 1.0), 'B5'), (bar(14, 1.5), 'D6')):
        send(music, bell(NOTE[nm], 2.8, 3.5, 2.2, 1.4), t, 0.3, 0, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.13, 0, rev=0.3)
    send(music, bell(NOTE['G6'], 2.0, 3.5, 1.4, 2.0), bar(14, 1.5), 0.1, 0.3, rev=0.6)
    for nm in ('G4', 'B4', 'D5', 'G5'):
        send(music, pluck(NOTE[nm], 1.4, 1.0), bar(14, 2.5), 0.13, 0, rev=0.5)
    return kicks


def envelope(x, att=0.015, rel=0.3, blk=0.01, ahead=0.04):
    """Dış ses için sidechain zarfı: 10 ms'lik bloklarda tepe izleyici, biraz önden başlar."""
    b = ns(blk); nb = len(x) // b + 1
    pk = np.array([np.abs(x[i * b:(i + 1) * b]).max() if i * b < len(x) else 0.0 for i in range(nb)])
    ka, kr = np.exp(-blk / att), np.exp(-blk / rel)
    e, v = np.zeros(nb), 0.0
    for i in range(nb):
        v = pk[i] + (v - pk[i]) * (ka if pk[i] > v else kr)
        e[i] = v
    sh = int(round(ahead / blk))
    e = np.concatenate([e[sh:], np.zeros(sh)])
    return np.interp(np.arange(len(x)), np.arange(nb) * b + b / 2, e)


def main():
    cues_path, vo_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    info = json.load(open(cues_path, encoding='utf-8'))
    global N
    DUR = float(info['dur'])
    N = ns(DUR + 2.5)
    drums, bass_bus, music, sfx, verb, vob = Bus(), Bus(), Bus(), Bus(), Bus(), Bus()

    def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0):
        bus.add(x, t, gain, pan)
        if rev > 0:
            verb.add(x, t, gain * rev, pan)

    kicks = compose(drums, bass_bus, music, send)
    for c in info['cues']:
        typ = c['type']
        if typ == 'motor':
            x, t0 = fx_motor(c['track'], c.get('gain', 0.3))
            sfx.add(x, t0)
            continue
        send(sfx, FX[typ](c), c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(typ, 0.0))

    # dış ses: tek kayıt → parçalar
    w = wave.open(vo_path)
    assert w.getframerate() == SR and w.getnchannels() == 1, 'dış ses 48 kHz mono WAV olmalı'
    vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768.0
    vo = hp(vo, 75, 2)
    fade = ns(0.012)
    for p in info['vo']:
        a, b = ns(p['a']), min(len(vo), ns(p['b']))
        seg = vo[a:b].copy()
        seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        vob.add(seg, p['a'] + p['off'], 1.0, 0.0)
    vmono = vob.L / 1.4142

    # seviyeler: konuşma anlarında dış sesin RMS'ine göre müzik ve efekt yerleşimi
    env = envelope(vmono)
    speaking = env > 0.02
    vo_rms = np.sqrt(np.mean(vmono[speaking] ** 2))

    # sidechain 1: kick'ler bas ve pad'e yer açar
    t = tt(N)
    duck_k = np.ones(N)
    for k in kicks:
        i = ns(k)
        if i >= N:
            continue
        seg = t[: min(ns(0.4), N - i)]
        d = 1 - 0.55 * np.exp(-seg / 0.09)
        duck_k[i:i + len(d)] = np.minimum(duck_k[i:i + len(d)], d)
    # sidechain 2: dış ses konuşurken müzik ~ -9 dB, efektler ~ -4 dB
    sc = np.clip(env / 0.06, 0, 1)
    duck_m = 1 - (1 - 10 ** (-9 / 20)) * sc
    duck_s = 1 - (1 - 10 ** (-4 / 20)) * sc

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.0); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    mL = drums.L * 0.9 + (bass_bus.L * 0.85 + music.L) * duck_k + vL
    mR = drums.R * 0.9 + (bass_bus.R * 0.85 + music.R) * duck_k + vR
    # müzik yatağını dış sesin 5 dB altına oturt (konuşma anlarında sidechain ile ~13 dB altta)
    m_rms = np.sqrt(np.mean(((mL + mR) / 2)[ns(G0):ns(DUR - 2)] ** 2))
    mg = vo_rms * 10 ** (-5 / 20) / m_rms
    s_peak = max(np.max(np.abs(sfx.L)), np.max(np.abs(sfx.R)))
    sg = vo_rms * 10 ** (8 / 20) / s_peak  # en güçlü efekt (darbe) dış sesin tepesine yakın
    L = (mL * mg) * duck_m + sfx.L * sg * duck_s + vob.L * 1.0
    R = (mR * mg) * duck_m + sfx.R * sg * duck_s + vob.R * 1.0
    # miks raporu: konuşma sırasında dış ses ile müzik/efekt arasındaki fark
    db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    mus = ((mL + mR) / 2 * mg * duck_m)[:ns(DUR)]
    fxm = ((sfx.L + sfx.R) / 2 * sg * duck_s)[:ns(DUR)]
    spk, gap = speaking[:ns(DUR)], ~speaking[:ns(DUR)]
    gap[:ns(G0)] = False
    print(f'miks: dış ses {db(vmono[:ns(DUR)][spk]):.1f} dB · konuşurken müzik {db(mus[spk]):.1f} dB, efekt {db(fxm[spk]):.1f} dB'
          f' · aralarda müzik {db(mus[gap]):.1f} dB (RMS, normalize öncesi)')
    L, R = hp(L, 28), hp(R, 28)
    # yumuşak limit
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.15, R / peak * 1.15
    L, R = np.tanh(L) / np.tanh(1.15), np.tanh(R) / np.tanh(1.15)
    n = ns(DUR)
    L, R = L[:n], R[:n]
    f = np.clip((DUR - tt(n)) / 0.9, 0, 1) ** 1.5
    L, R = L * f * 0.89, R * f * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(info["cues"])} efekt ipucu, {len(info["vo"])} dış ses parçası')


if __name__ == '__main__':
    main()
