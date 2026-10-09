#!/usr/bin/env python3
"""Music and sound effects for the AllInvestView showreel. Fully synthesised
(numpy + scipy): no samples, no stock audio.

    python3 audio.py build/cues.json build/audio.wav

- 120 BPM, 4/4, every scene cut on a bar line (2 s). Key of A minor, resolving
  to its relative major, C, when the logo lands.
    0–4    hook       tense: pulsing filtered bass, nervous hats, slams on the words
    4–8    reveal     drop: Fmaj7 → G, half-time, sonic-logo tease (E5, G5)
    8–26   groove     Am F C G, four-on-the-floor, arps that brighten scene by scene
    26–32  risk lab   breakdown: half-time kick, 16th pulse bass, darker pads
    32–36  montage    F → G build, a hit on every slide, snare roll, riser
    36–42  finale     C major; sonic logo E5 – G5 – C6 completes ("All-In-View")
- Effects come from cues.json, written by the animation, so every pop, tick and
  whoosh lands on the same frame and pans with the motion on screen.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 42.0
N = int(SR * (DUR + 2.5))
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


def square(f, n):
    return np.sign(sine(f, n))


def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, hold=None):
    t = tt(n)
    hold = (n / SR - r) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = np.clip((t - hold) / max(r, 1e-6), 0, 1)
    return e * (1 - rel)


def sweep_bp(x, f0, f1, curve=1.0, q=0.6):
    """Time-varying band-pass (whooshes, risers)."""
    out = np.zeros_like(x)
    zi = None
    ch = 256
    for i in range(0, len(x), ch):
        p = (i / max(1, len(x) - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        lo, hi = max(40, fc * (1 - q / 2)), min(SR / 2 - 200, fc * (1 + q / 2))
        s = sos('band', [lo, hi], 2)
        if zi is None:
            zi = np.zeros((s.shape[0], 2))
        out[i:i + ch], zi = signal.sosfilt(s, x[i:i + ch], zi=zi)
    return out


NOTES = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def nf(name):
    """'A4' → 440.0"""
    pc, octv = name[:-1], int(name[-1])
    midi = 12 * (octv + 1) + NOTES[pc]
    return 440.0 * 2 ** ((midi - 69) / 12)


# ───────────────────────── mix buses ─────────────────────────
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


drums, bass_bus, music, sfx, verb, delay = Bus(), Bus(), Bus(), Bus(), Bus(), Bus()


def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0, dly=0.0):
    bus.add(x, t, gain, pan)
    if rev > 0:
        verb.add(x, t, gain * rev, pan)
    if dly > 0:
        delay.add(x, t, gain * dly, pan)


# ───────────────────────── instruments ─────────────────────────
def kick(f0=160, f1=45, dur=0.42, punch=1.0):
    n = ns(dur); t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = hp(noise(n), 3000) * np.exp(-t * 400) * 0.35 * punch
    return np.tanh(1.7 * (body + click))


def clap():
    n = ns(0.35); t = tt(n)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        env += np.where(t >= d, np.exp(-(t - d) * 190), 0) * (0.8 if k < 2 else 1)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) * 15), 0) * 0.5
    return bp(noise(n), 900, 5500) * env * 1.4


def hat(open_=False):
    n = ns(0.42 if open_ else 0.06); t = tt(n)
    return hp(noise(n), 7500, 4) * np.exp(-t * (8 if open_ else 70)) * (0.7 if open_ else 1)


def shaker():
    n = ns(0.08); t = tt(n)
    return bp(noise(n), 5000, 12000) * np.sin(np.pi * np.clip(t / 0.08, 0, 1)) ** 2 * 0.6


def snare(v=1.0):
    n = ns(0.22); t = tt(n)
    nz = bp(noise(n), 1200, 9000) * np.exp(-t * 22)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 32)
    return (nz * 0.9 + tone * 0.6) * v


def crash(dur=2.4):
    n = ns(dur); t = tt(n)
    x = hp(noise(n), 3500, 2) * np.exp(-t * 2.0)
    for f in (3150, 4270, 5530, 6890):
        x += 0.05 * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * 3)
    return x * 0.5


def bass_note(f, dur, bright=420, a=0.004):
    n = ns(dur); t = tt(n)
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    x = lp(x, bright, 2)
    x = 0.55 * x + 0.8 * np.sin(2 * np.pi * f * t)
    return np.tanh(1.3 * x) * adsr(n, a, 0.12, 0.65, 0.04)


def pad(freqs, dur, cut=1800, att=0.3, rel=0.6, det=(-0.12, -0.05, 0.0, 0.05, 0.12)):
    n = ns(dur + rel)
    L, R = np.zeros(n), np.zeros(n)
    for f in freqs:
        for k, d in enumerate(det):
            x = saw(f * 2 ** (d / 12), n, rng.random())
            pan = (k - (len(det) - 1) / 2) / 2.2
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


def stab(freqs, dur=0.35, cut=3500):
    out = None
    for f in freqs:
        n = ns(dur); t = tt(n)
        x = saw(f, n) * 0.5 + saw(f * 1.006, n) * 0.5
        x = lp(x, cut, 2) * np.exp(-t * 7) * adsr(n, 0.003, 1, 1, 0.04)
        out = x if out is None else out + x
    return out / len(freqs)


# ───────────────────────── effects ─────────────────────────
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


def fx_click():
    n = ns(0.08); t = tt(n)
    return bp(noise(n), 2000, 9000) * np.exp(-t * 220) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5


def fx_whoosh(dur=0.35, f0=500, f1=5000):
    n = ns(dur); t = tt(n) / dur
    env = np.sin(np.pi * np.clip(t, 0, 1) ** 0.75) ** 2
    L = sweep_bp(noise(n), f0, f1, 1.0, 0.9) * env
    R = sweep_bp(noise(n), f0 * 1.05, f1 * 1.05, 1.0, 0.9) * env
    return np.vstack([L, R]) * 1.6


def fx_swish(dur=0.22):
    n = ns(dur); t = tt(n) / dur
    env = np.sin(np.pi * np.clip(t, 0, 1) ** 0.6) ** 3
    x = sweep_bp(noise(n), 900, 9000, 0.7, 1.0) * env
    pan = np.linspace(0.8, -0.8, n)  # right → left, like the push
    return np.vstack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)]) * 2.4


def fx_zip(dur=0.44):
    n = ns(dur); t = tt(n) / dur
    f = 320 + 1300 * np.sin(np.pi * np.clip(t, 0, 1)) ** 1.5
    return sine(f, n) * 0.5 * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.5


def fx_impact(big=False):
    d = 2.8 if big else 1.6
    n = ns(d); t = tt(n)
    f = 32 + 72 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.0 if big else 3.4))
    nz = lp(noise(n), 3500) * np.exp(-t * 9) * 0.6
    x = np.tanh(1.4 * (boom + nz))
    if big:
        c = crash(2.4)
        x[:len(c)] += c * 0.9
    return x


def fx_hit():
    n = ns(0.5); t = tt(n)
    k = np.zeros(n); kk = kick(185, 50, 0.45, 1.5); k[:len(kk)] += kk
    c = np.zeros(n); cc = clap(); c[:len(cc)] += cc
    nz = hp(noise(n), 2500) * np.exp(-t * 14) * 0.35
    return np.tanh(1.3 * (k + c * 0.7 + nz))


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


def fx_success():
    out = np.zeros(ns(1.6))
    for f, d in ((783.99, 0.0), (1046.5, 0.09)):
        b = bell(f, 1.4, 2.0, 1.4, 3) * 0.45
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_ding(pitch=1.0):
    out = np.zeros(ns(0.9))
    for f, d in ((1318.5 * pitch, 0.0), (1760 * pitch, 0.07)):
        b = bell(f, 0.8, 2.0, 0.8, 7) * 0.4
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_glitch(dur=1.0):
    n = ns(dur + 0.1)
    L, R = np.zeros(n), np.zeros(n)
    k = 0
    t0 = 0.0
    while t0 < dur:
        m = ns(0.012 + rng.random() * 0.03)
        f = rng.choice([220, 330, 440, 880, 1760, 2637]) * (1 + rng.random() * 0.05)
        x = (square(f, m) * 0.5 + bp(noise(m), 2000, 9000) * 0.5) * (0.3 + 0.7 * t0 / dur)
        x = np.round(x * 6) / 6  # bit-crush
        pan = rng.uniform(-0.8, 0.8)
        i = ns(t0)
        L[i:i + m] += x[:n - i] * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += x[:n - i] * np.sin((pan + 1) * np.pi / 4)
        t0 += 0.04 + rng.random() * 0.09 * (1 - t0 / dur)
        k += 1
    return np.vstack([L, R]) * 0.5


def fx_suck(dur=0.8):
    n = ns(dur); t = tt(n) / dur
    x = sweep_bp(noise(n), 6000, 300, 1.4, 0.8) * t ** 2.2 * 1.8
    tone = sine(900 - 760 * t, n) * t ** 3 * 0.35
    rv = fx_reverse(dur) * 0.8
    out = x + tone
    out[-len(rv):] += rv
    return out


def fx_zap(pitch=1.0):
    n = ns(0.14); t = tt(n)
    return sine(3000 * pitch * np.exp(-t * 14), n) * np.exp(-t * 22) * 0.6


def fx_data(pitch=1.0):
    out = np.zeros(ns(0.12))
    for k in range(3):
        m = ns(0.018); t = tt(m)
        x = square(1400 * pitch * (1 + k * 0.25), m) * np.exp(-t * 90) * 0.35
        i = ns(k * 0.026)
        out[i:i + m] += x
    return lp(out, 7000)


def fx_counter(dur=1.2):
    n = ns(dur + 0.1)
    out = np.zeros(n)
    t0 = 0.0
    while t0 < dur:
        x = fx_tick(0.9 + rng.random() * 0.5) * 0.6 * (1 - 0.6 * t0 / dur)
        i = ns(t0)
        out[i:i + len(x)] += x[:n - i]
        u = t0 / dur
        t0 += 0.022 + 0.09 * u ** 2  # fast, then slowing as the number settles
    return out


def fx_scan(dur=1.5, pan0=-0.7, pan1=0.7):
    n = ns(dur); t = tt(n) / dur
    f = 180 * 2 ** (2.2 * t)
    x = saw(f, n) * 0.5 + saw(f * 1.5, n) * 0.3
    x = sweep_bp(x, 400, 5000, 1.0, 0.7) * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.7 * 0.9
    x += sweep_bp(noise(n), 1500, 9000, 1.0, 0.5) * 0.25 * t
    pan = pan0 + (pan1 - pan0) * t
    return np.vstack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)]) * 1.4


def fx_fizz(dur=0.9):
    n = ns(dur + 0.2)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(int(dur * 120)):
        t0 = rng.random() * dur
        x = fx_pop(2.6 + rng.random() * 1.8) * 0.15
        pan = rng.uniform(-0.7, 0.7)
        i = ns(t0)
        m = min(len(x), n - i)
        L[i:i + m] += x[:m] * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += x[:m] * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R])


def fx_down(dur=0.35):
    n = ns(dur + 0.3); t = tt(n)
    f = 700 * np.exp(-t * 7) + 90
    x = lp(saw(f, n), 1800) * np.exp(-t * 4) * 0.5
    th = np.zeros(n); k = fx_thump(); i = ns(dur * 0.8); th[i:i + len(k)] += k[:n - i]
    return x + th * 0.8


def fx_riser(dur=1.0):
    n = ns(dur); t = tt(n) / dur
    x = sine(300 + 1200 * t ** 2, n) * t ** 2 * 0.2 + sweep_bp(noise(n), 400, 10000, 1.6, 0.8) * t ** 2 * 0.6
    return x


def fx_type(pitch=1.0):
    n = ns(0.05); t = tt(n)
    return (bp(noise(n), 1800 * pitch, 7000) * np.exp(-t * 260) * 0.8 + np.sin(2 * np.pi * 2400 * pitch * t) * np.exp(-t * 300) * 0.3)


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'coin': lambda c: fx_coin(c.get('pitch', 1)),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'swish': lambda c: fx_swish(c.get('dur', 0.22)),
    'zip': lambda c: fx_zip(c.get('dur', 0.44)),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'hit': lambda c: fx_hit(),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'success': lambda c: fx_success(),
    'ding': lambda c: fx_ding(c.get('pitch', 1)),
    'glitch': lambda c: fx_glitch(c.get('dur', 1.0)),
    'suck': lambda c: fx_suck(c.get('dur', 0.8)),
    'zap': lambda c: fx_zap(c.get('pitch', 1)),
    'data': lambda c: fx_data(c.get('pitch', 1)),
    'counter': lambda c: fx_counter(c.get('dur', 1.2)),
    'scan': lambda c: fx_scan(c.get('dur', 1.5), c.get('pan0', -0.7), c.get('pan1', 0.7)),
    'fizz': lambda c: fx_fizz(c.get('dur', 0.9)),
    'down': lambda c: fx_down(c.get('dur', 0.35)),
    'riser': lambda c: fx_riser(c.get('dur', 1.0)),
    'type': lambda c: fx_type(c.get('pitch', 1)),
}
REV = {'impact': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4, 'shine': 0.4, 'coin': 0.15, 'pop': 0.12,
       'whoosh': 0.1, 'thump': 0.15, 'hit': 0.2, 'ding': 0.3, 'zap': 0.2, 'data': 0.1, 'down': 0.2}


# ───────────────────────── composition ─────────────────────────
CH = {
    'Am': ['A3', 'C4', 'E4', 'A4'], 'Am9': ['A2', 'E3', 'B3', 'C4'], 'F': ['F3', 'A3', 'C4', 'E4'], 'C': ['C4', 'E4', 'G4', 'B4'],
    'G': ['G3', 'B3', 'D4', 'G4'], 'Cmaj9': ['C3', 'G3', 'E4', 'B4', 'D5'], 'F/C': ['C3', 'A3', 'C4', 'F4', 'A4'],
}
ROOT = {'Am': 'A1', 'F': 'F1', 'C': 'C2', 'G': 'G1'}
ARP = {'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['F4', 'A4', 'C5', 'E5'], 'C': ['C5', 'E5', 'G5', 'B5'], 'G': ['G4', 'B4', 'D5', 'G5']}
LEAD = {'Am': ['E5', 'C5', 'A4'], 'F': ['C5', 'A4', 'F4'], 'C': ['G5', 'E5', 'C5'], 'G': ['D5', 'B4', 'G4']}
F = lambda names: [nf(x) for x in names]


def compose():
    kicks = []

    def K(t, v=1.0, k=None):
        kicks.append((t, v))
        send(drums, k if k is not None else kick(), t, 0.95 * v)

    # 0–4 hook: pulse bass with an opening filter, nervous hats, dark pad
    send(music, pad(F(CH['Am9']), 3.3, cut=700, att=1.4, rel=0.4), 0.0, 1.0)
    for i in range(26):
        t = i * 0.125
        u = t / 3.25
        send(bass_bus, bass_note(nf('A1'), 0.11, 250 + 900 * u ** 1.5), t, 0.35 + 0.35 * u)
    for i in range(26):
        t = i * 0.125
        send(drums, hat(), t, 0.06 + 0.1 * (i % 2) + 0.06 * t / 3.25, 0.3 if i % 2 else -0.3)
    for t in (0.25, 1.25, 2.25):
        send(drums, hat(True), t, 0.22, 0.2)
    for t, nm in ((0.75, 'E5'), (1.75, 'C5'), (2.75, 'B4')):
        send(music, pluck(nf(nm), 0.4, 0.8), t, 0.18, 0, rev=0.35, dly=0.35)

    # 4–8 reveal: Fmaj7 → G, half-time, sonic-logo tease
    send(music, pad(F(CH['F']) + [nf('C5')], 2.0, cut=2600, att=0.03, rel=0.4), 4.0, 1.15)
    send(music, pad(F(CH['G']) + [nf('D5')], 1.5, cut=3000, att=0.05, rel=0.5), 6.0, 1.1)
    send(bass_bus, bass_note(nf('F1'), 1.9, 380, 0.01), 4.0, 0.75)
    send(bass_bus, bass_note(nf('G1'), 1.35, 420, 0.01), 6.0, 0.7)
    for t in (4.0, 6.0, 6.75):
        K(t, 0.9)
    for t in (5.0, 7.0):
        send(drums, clap(), t, 0.6, 0, rev=0.3)
    for i in range(8):
        send(drums, hat(), 4.25 + i * 0.5, 0.12, 0.25)
    for i, nm in enumerate(['A5', 'C6', 'E6', 'F6', 'E6', 'C6', 'A5', 'G5']):
        send(music, bell(nf(nm), 0.9, 3.5, 1.4, 4.0), 4.5 + i * 0.125, 0.07, -0.5 + i * 0.14, rev=0.5)
    for t, nm in ((6.15, 'E5'), (6.3, 'G5')):
        send(music, bell(nf(nm), 2.0, 3.5, 2.0, 1.6), t, 0.22, 0, rev=0.5)
    roll = [7.0 + i * 0.125 for i in range(4)] + [7.5 + i * 0.0625 for i in range(6)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.32, 0, rev=0.2)

    # 8–32: Am F C G ×3; 32–36: F G; 36: C
    prog = [(8 + 2 * k, ['Am', 'F', 'C', 'G'][k % 4]) for k in range(12)] + [(32, 'F'), (34, 'G')]
    for bar, ch in prog:
        risk = 26 <= bar < 32
        mont = bar >= 32
        cut = 1500 if risk else 1900 if bar < 14 else 2400 if bar < 26 else 2800
        send(music, pad(F(CH[ch]), 2.0, cut=cut, att=0.03 if not risk else 0.2, rel=0.3), bar, 0.95 if not risk else 0.8)
        root = nf(ROOT[ch])
        if risk:
            for s in range(16):
                t = bar + s * 0.125
                send(bass_bus, bass_note(root * (2 if s % 8 == 6 else 1), 0.1, 500 + 300 * (s % 4 == 0)), t, 0.5 if s % 4 == 0 else 0.32)
        else:
            for k in range(4):
                t = bar + k * 0.5
                send(bass_bus, bass_note(root * (2 if mont and k % 2 else 1), 0.22, 520), t + 0.25, 0.75)
                if k == 0:
                    send(bass_bus, bass_note(root, 0.2, 400), t, 0.5)
        # drums
        for k in range(4):
            t = bar + k * 0.5
            if risk and k % 2 == 1:
                continue
            if bar == 34 and t >= 35.75:
                continue  # breath before the logo
            K(t, 1.0 if not risk else 0.85)
        for k in (1, 3):
            t = bar + k * 0.5
            if risk and k == 1:
                continue
            send(drums, clap(), t, 0.55, 0, rev=0.25)
        for i in range(8 if not mont else 16):
            step = 0.25 if not mont else 0.125
            t = bar + i * step
            if bar == 34 and t >= 35.75:
                break
            if not mont and i % 2 == 0:
                if not risk:
                    send(drums, shaker(), t, 0.1, -0.35)
                continue
            if risk and bar < 28:
                continue
            send(drums, hat(), t, 0.26 if not mont else (0.2 if i % 2 else 0.1), 0.3 if i % 2 else -0.3)
        # arps: 8ths on the dashboard, 16ths from the globe on, off in the risk lab
        if not risk and bar < 32:
            sixteenth = bar >= 14
            steps = 16 if sixteenth else 8
            notes = ARP[ch]
            for s in range(steps):
                t = bar + s * (2 / steps)
                nm = notes[[0, 1, 2, 3, 2, 1, 2, 3][s % 8]]
                f = nf(nm) * (2 if sixteenth and s % 4 == 3 else 1)
                send(music, pluck(f, 0.28, 1.0 + 0.3 * (bar >= 18)), t, 0.075 if sixteenth else 0.1, -0.45 if s % 2 else 0.45, rev=0.25, dly=0.2)
        # dividends: a warm bell lead
        if 22 <= bar < 26:
            for k, nm in enumerate(LEAD[ch]):
                send(music, bell(nf(nm), 1.2, 2.0, 1.2, 2.5), bar + [0, 0.75, 1.5][k], 0.14, 0.15, rev=0.45, dly=0.3)
        # risk lab: a slow two-note motif over the breakdown
        if risk:
            for k, nm in enumerate(LEAD[ch][:2]):
                send(music, bell(nf(nm), 1.8, 3.5, 1.8, 1.6), bar + k * 1.0, 0.1, -0.2 + 0.4 * k, rev=0.55, dly=0.4)
        # montage: chord stabs on each slide
        if mont:
            for k in (0, 1):
                send(music, stab(F(CH[ch])), bar + k, 0.35, 0, rev=0.25)
    # crashes on section downbeats
    for t in (8.0, 14.0, 18.0, 22.0, 26.0, 32.0):
        send(drums, crash(2.0), t, 0.28, 0.2)
    # fills into 14, 26 and 32
    for t0, n_ in ((13.5, 8), (25.5, 8), (31.5, 8)):
        for j in range(n_):
            send(drums, snare(0.35 + 0.65 * j / n_), t0 + j * 0.0625, 0.3, 0, rev=0.2)
    # build 35–36: snare roll
    roll = [35.0 + i * 0.125 for i in range(4)] + [35.5 + i * 0.0625 for i in range(4)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.35, 0, rev=0.25)

    # 36–42 finale: C major, the sonic logo completes
    K(36.0, 1.15)
    send(music, pad(F(CH['Cmaj9']), 2.0, cut=3400, att=0.02, rel=0.5), 36.0, 1.2)
    send(music, pad(F(CH['F/C']), 2.0, cut=3000, att=0.1, rel=0.5), 38.0, 1.0)
    send(music, pad(F(CH['Cmaj9']), 3.0, cut=2800, att=0.1, rel=1.6), 40.0, 1.0)
    send(bass_bus, bass_note(nf('C2'), 1.9, 450), 36.0, 0.65)
    send(bass_bus, bass_note(nf('C2'), 1.9, 400), 38.0, 0.5)
    send(bass_bus, bass_note(nf('C2'), 2.6, 350), 40.0, 0.45)
    for t, nm in ((36.5, 'E5'), (36.75, 'G5'), (37.0, 'C6')):
        send(music, bell(nf(nm), 3.0, 3.5, 2.2, 1.3), t, 0.36, 0, rev=0.55)
        send(music, pluck(nf(nm) / 2, 0.5, 1.2), t, 0.16, 0, rev=0.3)
    send(music, bell(nf('C6') * 2, 2.4, 3.5, 1.4, 1.8), 37.0, 0.12, 0.3, rev=0.6)
    K(37.0, 0.8)
    for i in range(16):
        t = 38.0 + i * 0.25
        if i % 2 == 0:
            K(t, 0.45)
        send(drums, hat(), t + 0.125, 0.07, 0.3 if i % 2 else -0.3)
    for s in range(24):
        t = 38.0 + s * 0.125
        ch = 'F' if t < 40 else 'C'
        nm = ARP[ch][[0, 1, 2, 3, 2, 1][s % 6]]
        send(music, pluck(nf(nm), 0.3, 0.9), t, 0.05 * (1 - s / 30), -0.4 if s % 2 else 0.4, rev=0.35, dly=0.3)
    send(music, bell(nf('C5'), 3.0, 3.5, 1.4, 1.2), 40.0, 0.14, 0, rev=0.6)
    send(music, bell(nf('G5'), 3.0, 3.5, 1.4, 1.2), 40.06, 0.1, 0.2, rev=0.6)
    return kicks


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues = info['cues'] if isinstance(info, dict) else info
    kicks = compose()
    for c in cues:
        x = FX[c['type']](c)
        send(sfx, x, c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(c['type'], 0.0))

    # sidechain: bass and music duck under every kick
    t = tt(N)
    duck = np.ones(N)
    for k, v in kicks:
        i = ns(k)
        seg = t[:ns(0.4)]
        d = 1 - 0.55 * min(1, v) * np.exp(-seg / 0.09)
        m = min(len(d), N - i)
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])

    # room reverb (synthetic impulse) and a dotted-eighth ping-pong delay
    ir_n = ns(2.4); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 2.8)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 2.8)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5
    dt = ns(0.375)
    dL, dR = np.zeros(N), np.zeros(N)
    srcL, srcR = lp(delay.L, 5000), lp(delay.R, 5000)
    for k in range(1, 5):
        g = 0.5 ** k
        sh = dt * k
        if k % 2:
            dR[sh:] += srcL[:N - sh] * g
        else:
            dL[sh:] += srcR[:N - sh] * g

    L = drums.L * 0.9 + (bass_bus.L * 0.74 + music.L + dL * 0.6) * duck + sfx.L * 0.9 + vL
    R = drums.R * 0.9 + (bass_bus.R * 0.74 + music.R + dR * 0.6) * duck + sfx.R * 0.9 + vR
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.3, R / peak * 1.3
    L, R = np.tanh(L) / np.tanh(1.3), np.tanh(R) / np.tanh(1.3)
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 1.4, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} s, {len(cues)} effect cues')


if __name__ == '__main__':
    main()
