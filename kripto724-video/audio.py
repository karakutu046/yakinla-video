#!/usr/bin/env python3
"""Music, sound effects and the voiceover mix for the kripto724 film. Music and effects are
fully synthesised (numpy + scipy); the voice is the Turkish voiceover in build/vo/.

    python3 audio.py build/cues.json build/audio.wav

- 120 BPM, D major (I–V–vi–IV), bright and upbeat. The beat grid starts at the scene-2 cut
  (the drop), and every cut lands on a beat because scene lengths are whole beats.
    scene 1      intro: filtered Bm9 pad, a ticking pulse, a riser into the drop
    scene 2      drop on the logo card; a soft sonic logo when the brand name is spoken
    scenes 3–8   groove: D A Bm G, four-on-the-floor, plucked arps that brighten
    scene 9      finale: Dmaj9, the sonic logo completes, the bed rings out
- The voice sits on top: high-pass, a little presence, gentle compression, almost dry (a normal
  studio booth). Music ducks about 7 dB under the voice, effects about 3 dB.
- Effects come from cues.json, written by the animation, so they land on the frame.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
INFO = json.load(open(sys.argv[1], encoding='utf-8')) if len(sys.argv) > 1 and sys.argv[1].endswith('.json') else {'dur': 42.0, 'tl': None, 'cues': []}
DUR = float(INFO['dur'])
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
    'D': ['D3', 'F#3', 'A3', 'D4', 'F#4'], 'A': ['A2', 'E3', 'A3', 'C#4', 'E4'], 'Bm': ['B2', 'F#3', 'B3', 'D4', 'F#4'],
    'G': ['G2', 'D3', 'G3', 'B3', 'D4'], 'Dmaj9': ['D3', 'A3', 'E4', 'F#4', 'C#5'], 'Bm9': ['B2', 'F#3', 'C#4', 'D4', 'A4'],
    'Gmaj7': ['G2', 'D3', 'F#3', 'B3', 'D4'], 'G6': ['G2', 'D3', 'E4', 'G4', 'B4'],
}
ROOT = {'D': 'D2', 'A': 'A1', 'Bm': 'B1', 'G': 'G1'}
ARP = {'D': ['D5', 'F#5', 'A5', 'D6'], 'A': ['C#5', 'E5', 'A5', 'C#6'], 'Bm': ['B4', 'D5', 'F#5', 'B5'], 'G': ['B4', 'D5', 'G5', 'B5']}
F = lambda names: [nf(x) for x in names]


def compose(S, total):
    """S: scene start times (9); total: film length."""
    kicks = []

    def K(t, v=1.0):
        kicks.append((t, v))
        send(drums, kick(150, 48, 0.38, 0.9), t, 0.8 * v)

    g0, fin = S[1], S[8]
    # scene 1: intro
    send(music, pad(F(CH['Bm9']), g0 + 0.2, cut=1100, att=1.0, rel=0.4), 0.0, 0.9)
    n8 = int(g0 / 0.25)
    for i in range(n8):
        t = i * 0.25
        u = t / g0
        send(bass_bus, bass_note(nf('B1'), 0.16, 260 + 900 * u ** 1.6), t, 0.22 + 0.25 * u)
        send(drums, hat(), t + 0.125, 0.05 + 0.07 * u, 0.3 if i % 2 else -0.3)
    for k, nm in enumerate(['F#5', 'D5', 'B4', 'C#5', 'D5', 'F#5', 'A5', 'B5']):
        t = 0.5 + k * 0.5
        if t < g0 - 0.3:
            send(music, pluck(nf(nm), 0.35, 0.9), t, 0.1, -0.3 + 0.08 * k, rev=0.3, dly=0.3)
    send(sfx, fx_riser(1.6), g0 - 1.6, 0.18)
    send(sfx, fx_reverse(0.6), g0 - 0.6, 0.22)

    # scenes 2–8: groove on D A Bm G, one chord per bar (2 s)
    nbar = int(round((fin - g0) / 2.0))
    prog = ['D', 'A', 'Bm', 'G']
    for b in range(nbar + 1):
        bar = g0 + 2.0 * b
        if bar >= fin - 1e-6:
            break
        ch = prog[b % 4]
        late = bar >= S[5] - 1e-6        # from the Kasam scene on: a little more energy
        blen = min(2.0, fin - bar)
        send(music, pad(F(CH[ch]), blen, cut=2300 if not late else 2900, att=0.02, rel=0.35), bar, 0.75)
        root = nf(ROOT[ch])
        for k in range(4):
            t = bar + k * 0.5
            if t >= fin - 0.01:
                break
            K(t, 0.85 if k % 2 == 0 else 0.7)
            send(bass_bus, bass_note(root, 0.2, 480), t + 0.25, 0.55)
            if k in (1, 3):
                send(drums, clap(), t, 0.36, 0, rev=0.25)
            send(drums, shaker(), t + 0.25, 0.08, -0.35)
            send(drums, hat(), t + 0.25, 0.14 if late else 0.1, 0.3)
        steps = 16 if late else 8
        for s in range(steps):
            t = bar + s * (2.0 / steps)
            if t >= fin - 0.01:
                break
            nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][s % 8]]
            send(music, pluck(nf(nm), 0.26, 1.1), t, 0.055 if late else 0.07, -0.45 if s % 2 else 0.45, rev=0.25, dly=0.22)
    # crashes and fills at the big cuts
    send(drums, crash(2.2), g0, 0.26, 0.2)
    for s in (S[2], S[5]):
        send(drums, crash(1.6), s, 0.14, -0.2)
    roll = [fin - 0.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.22, 0, rev=0.2)
    # the sonic logo, softly, as the brand name is spoken in scene 2
    for k, nm in enumerate(['A5', 'D6', 'F#6']):
        send(music, bell(nf(nm), 2.2, 3.5, 1.8, 1.6), g0 + 2.05 + k * 0.12, 0.09, -0.2 + 0.2 * k, rev=0.5)

    # scene 9: finale
    K(fin, 1.1)
    send(drums, crash(3.0), fin, 0.24, 0.2)
    send(music, pad(F(CH['Dmaj9']), 2.0, cut=3400, att=0.02, rel=0.5), fin, 1.0)
    send(music, pad(F(CH['G6']), 2.0, cut=3000, att=0.1, rel=0.5), fin + 2.0, 0.85)
    send(music, pad(F(CH['Dmaj9']), total - fin - 3.6, cut=2800, att=0.1, rel=1.8), fin + 4.0, 0.85)
    send(bass_bus, bass_note(nf('D2'), 1.9, 450), fin, 0.6)
    send(bass_bus, bass_note(nf('G1'), 1.9, 400), fin + 2.0, 0.45)
    send(bass_bus, bass_note(nf('D2'), total - fin - 4.0, 350), fin + 4.0, 0.4)
    for t, nm in ((fin + 0.0, 'A5'), (fin + 0.25, 'D6'), (fin + 0.5, 'F#6')):
        send(music, bell(nf(nm), 3.0, 3.5, 2.2, 1.3), t, 0.22, 0, rev=0.55)
        send(music, pluck(nf(nm) / 2, 0.5, 1.2), t, 0.1, 0, rev=0.3)
    for i in range(int((total - fin - 1.5) / 0.5)):
        t = fin + 0.5 + i * 0.5
        if i % 2 == 0 and t < total - 2.0:
            K(t, 0.45)
        send(drums, hat(), t + 0.25, 0.06, 0.3 if i % 2 else -0.3)
    for s in range(int((total - fin - 2.0) / 0.25)):
        t = fin + 1.0 + s * 0.25
        ch = 'G' if fin + 2.0 <= t < fin + 4.0 else 'D'
        nm = ARP[ch][[0, 1, 2, 3, 2, 1][s % 6]]
        send(music, pluck(nf(nm), 0.3, 0.9), t, 0.045 * max(0.2, 1 - s / 40), -0.4 if s % 2 else 0.4, rev=0.35, dly=0.3)
    return kicks


# ───────────────────────── voice ─────────────────────────
def read_wav(path):
    with wave.open(path, 'rb') as w:
        sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(float) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    return x


def envelope(x, att=0.01, rel=0.2):
    """Peak follower (seconds)."""
    a, r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    ax = np.abs(x)
    # block-wise smoothing is enough here: RMS in 10 ms, then attack/release on the blocks
    b = ns(0.01)
    m = len(ax) // b
    rms = np.sqrt(np.mean(ax[:m * b].reshape(m, b) ** 2, axis=1))
    env = np.zeros(m)
    ab, rb = a ** b, r ** b
    e = 0.0
    for i, v in enumerate(rms):
        e = v + (e - v) * (ab if v > e else rb)
        env[i] = e
    out = np.repeat(env, b)
    return np.concatenate([out, np.full(len(x) - len(out), env[-1] if m else 0)])


def voice_track(tl):
    """All voiceover lines placed at tl['vo'], processed as a dry studio read."""
    import os
    vo = np.zeros(N)
    have = False
    for i, t in enumerate(tl['vo']):
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build', 'vo', f'line_{i + 1}.wav')
        if not os.path.exists(p):
            continue
        x = read_wav(p)
        j = ns(t)
        m = min(len(x), N - j)
        vo[j:j + m] += x[:m]
        have = True
    if not have:
        return None
    vo = hp(vo, 75, 2)
    vo = vo + 0.22 * bp(vo, 2800, 6500)          # presence
    vo = vo - 0.1 * bp(vo, 220, 420)              # a touch less boxiness
    # gentle compression, 2.5:1 above −20 dB of the peak, 5 ms / 120 ms
    env = envelope(vo, 0.005, 0.12)
    pk = np.max(env) + 1e-9
    th = pk * 10 ** (-20 / 20)
    gain = np.where(env > th, (th * (env / th) ** (1 / 2.5)) / np.maximum(env, 1e-9), 1.0)
    vo = vo * gain
    return vo / (np.max(np.abs(vo)) + 1e-9)


def main():
    out = sys.argv[2]
    tl, cues = INFO['tl'], INFO['cues']
    kicks = compose(tl['start'], DUR)
    for c in cues:
        x = FX[c['type']](c)
        send(sfx, x, c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(c['type'], 0.0))

    t = tt(N)
    duck = np.ones(N)
    for k, v in kicks:
        i = ns(k)
        seg = t[:ns(0.4)]
        d = 1 - 0.4 * min(1, v) * np.exp(-seg / 0.09)
        m = min(len(d), N - i)
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])

    ir_n = ns(2.2); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
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

    mL = drums.L * 0.9 + (bass_bus.L * 0.74 + music.L + dL * 0.5) * duck + vL
    mR = drums.R * 0.9 + (bass_bus.R * 0.74 + music.R + dR * 0.5) * duck + vR
    sL, sR = sfx.L, sfx.R
    vo = voice_track(tl)
    if vo is not None:
        # music ≈ −9 dB under the voice's level in the gaps, ducked a further ~7 dB while it speaks
        env = envelope(vo, 0.02, 0.35)
        on = np.clip(env / (np.max(env) * 0.12), 0, 1)
        vrms = np.sqrt(np.mean(vo[env > np.max(env) * 0.2] ** 2))
        mrms = np.sqrt(np.mean((mL ** 2 + mR ** 2) / 2)) + 1e-9
        k_m = vrms / mrms * 10 ** (-9 / 20)
        srms = np.sqrt(np.mean((sL ** 2 + sR ** 2) / 2)) + 1e-9
        k_s = vrms / srms * 10 ** (-17 / 20)
        dm = 1 - on * (1 - 10 ** (-7 / 20))
        ds = 1 - on * (1 - 10 ** (-3 / 20))
        ver = signal.fftconvolve(vo, irL)[:N] * 0.035         # a small booth, nearly dry
        L = (mL * k_m) * dm + (sL * k_s) * ds + vo + ver
        R = (mR * k_m) * dm + (sR * k_s) * ds + vo + ver
    else:
        L, R = mL + sL * 0.9, mR + sR * 0.9
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 1.2, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} s, {len(cues)} effect cues, voice: {"yes" if vo is not None else "no"}')


if __name__ == '__main__':
    main()
