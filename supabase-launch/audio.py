#!/usr/bin/env python3
"""Soundtrack for the Supabase launch film: music and sound design, all synthesised
(numpy + scipy), no samples.

Usage:  python3 audio.py build/cues.json build/audio.wav

- 120 BPM, 4/4, A minor. Every cut in the film sits on a bar line (2 s).
  0–4 intro (tile plucks spell an Am9 arpeggio) · 4 logo hit, F → G build ·
  8 drop: Am F C G house groove · 28 build under the feature wall · 32 second drop ·
  36 breakdown for the tagline (F, then G) · 40 resolve to C major on the end card.
- Sound effects come from cues.json, which anim.js writes from the same timeline that
  moves the pictures, so every pop, key click, whoosh and impact lands on its frame,
  panned to where it happens on screen.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 45.0
N = int(SR * (DUR + 2.0))
rng = np.random.default_rng(23)


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
    return 2 * ((ph + np.cumsum(f) / SR) % 1.0) - 1


def sine(f, n, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    return np.sin(2 * np.pi * (ph + np.cumsum(f) / SR))


def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, hold=None):
    t = tt(n)
    hold = (n / SR - r) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    return e * (1 - np.clip((t - hold) / max(r, 1e-6), 0, 1))


def sweep_bp(x, f0, f1, curve=1.0, q=0.6):
    """Band-pass whose centre glides from f0 to f1 (whooshes, risers)."""
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), 256):
        p = (i / max(1, len(x) - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        s = sos('band', [max(40, fc * (1 - q / 2)), min(SR / 2 - 200, fc * (1 + q / 2))], 2)
        if zi is None:
            zi = np.zeros((s.shape[0], 2))
        out[i:i + 256], zi = signal.sosfilt(s, x[i:i + 256], zi=zi)
    return out


def note(name):
    """'A4' / 'C#5' → Hz"""
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    pc, octv = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pc] + 12 * (octv + 1) - 69) / 12)


# ───────────────────────── mix buses ─────────────────────────
class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, x, t, gain=1.0, pan=0.0):
        i = ns(t)
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


drums, bass, music, sfx, verb = Bus(), Bus(), Bus(), Bus(), Bus()


def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0):
    bus.add(x, t, gain, pan)
    if rev > 0:
        verb.add(x, t, gain * rev, pan)


# ───────────────────────── instruments ─────────────────────────
def kick(f0=160, f1=45, dur=0.42, punch=1.0):
    n = ns(dur); t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = hp(noise(n), 3000) * np.exp(-t * 380) * 0.35 * punch
    return np.tanh(1.7 * (body + click))


def clap():
    n = ns(0.35); t = tt(n)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.010, 0.021]):
        env += np.where(t >= d, np.exp(-(t - d) * 180), 0) * (0.8 if k < 2 else 1)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) * 15), 0) * 0.5
    return bp(noise(n), 900, 5500) * env * 1.4


def hat(open_=False):
    n = ns(0.42 if open_ else 0.06); t = tt(n)
    return hp(noise(n), 7800, 4) * np.exp(-t * (8 if open_ else 75)) * (0.7 if open_ else 1)


def snare(v=1.0):
    n = ns(0.2); t = tt(n)
    return (bp(noise(n), 1200, 9000) * np.exp(-t * 24) * 0.9 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 35) * 0.6) * v


def crash(dur=2.6):
    n = ns(dur); t = tt(n)
    x = hp(noise(n), 3500, 2) * np.exp(-t * 2.0)
    for fr in (3150, 4270, 5530, 6890):
        x += 0.05 * np.sin(2 * np.pi * fr * t + rng.random() * 6) * np.exp(-t * 3)
    return x * 0.5


def bass_note(f, dur, bright=480):
    n = ns(dur); t = tt(n)
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    x = 0.55 * lp(x, bright, 2) + 0.8 * np.sin(2 * np.pi * f * t)
    return np.tanh(1.3 * x) * adsr(n, 0.004, 0.1, 0.7, 0.04)


def sub(f, dur):
    n = ns(dur); t = tt(n)
    return np.sin(2 * np.pi * f * t) * adsr(n, 0.01, 0.3, 0.8, 0.15)


def pad(freqs, dur, cut=2000, att=0.25, rel=0.8):
    n = ns(dur + rel)
    L, R = np.zeros(n), np.zeros(n)
    for fr in freqs:
        for k, det in enumerate((-0.12, -0.05, 0.0, 0.05, 0.12)):
            x = saw(fr * 2 ** (det / 12), n, rng.random())
            pan = (k - 2) / 2.2
            L += x * np.cos((pan + 1) * np.pi / 4)
            R += x * np.sin((pan + 1) * np.pi / 4)
    env = adsr(n, att, 0.8, 0.85, rel, hold=dur)
    g = 0.12 / max(1, len(freqs))
    return np.vstack([lp(L, cut, 2) * env * g, lp(R, cut, 2) * env * g])


def pluck(f, dur=0.5, bright=1.0):
    n = ns(dur); t = tt(n)
    x = 0.7 * saw(f, n) + 0.3 * np.sign(np.sin(2 * np.pi * f * 1.003 * t))
    hi, lo = lp(x, 5200 * bright, 2), lp(x, 700, 2)
    e = np.exp(-t * 14)
    return (hi * e + lo * (1 - e)) * np.exp(-t * 6) * adsr(n, 0.002, 1, 1, 0.03)


def bell(f, dur=2.0, ratio=3.5, index=2.4, decay=2.2):
    n = ns(dur); t = tt(n)
    x = np.sin(2 * np.pi * f * t + index * np.exp(-t * 5) * np.sin(2 * np.pi * f * ratio * t))
    x += 0.25 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * decay * 1.6)
    return x * np.exp(-t * decay) * adsr(n, 0.002, 1, 1, 0.05)


def riser(dur, f0=300, f1=9000, tone=True):
    n = ns(dur); t = tt(n) / dur
    x = sweep_bp(noise(n), f0, f1, 1.6, 0.8) * t ** 2 * 0.55
    if tone:
        x += sine(180 + 900 * t ** 2.2, n) * t ** 2 * 0.12 + sine(270 + 1350 * t ** 2.2, n) * t ** 2 * 0.06
    return x


def rev_crash(dur):
    c = crash(2.0)[::-1][-ns(dur):]
    return c * np.linspace(0, 1, len(c)) ** 2 * 1.7


# ───────────────────────── sound effects ─────────────────────────
def fx_tick(pitch=1.0):
    n = ns(0.03); t = tt(n)
    return (bp(noise(n), 2500 * pitch, 7000 * pitch) * 0.7 + np.sin(2 * np.pi * 3200 * pitch * t) * 0.5) * np.exp(-t * 260)


def fx_pop(pitch=1.0):
    n = ns(0.12); t = tt(n)
    f = 480 * pitch * (1 + 1.5 * np.exp(-t * 60))
    return sine(f, n) * np.exp(-t * 30) * adsr(n, 0.001, 1, 1, 0.01)


def fx_blip(pitch=1.0):
    n = ns(0.09); t = tt(n)
    return (sine(1100 * pitch, n) * 0.8 + sine(2200 * pitch, n) * 0.2) * np.exp(-t * 45) * adsr(n, 0.001, 1, 1, 0.01)


def fx_key(v):
    r = np.random.default_rng(1000 + int(v))
    n = ns(0.05); t = tt(n)
    p = 0.8 + r.random() * 0.5
    x = bp(noise(n), 1800 * p, 7000) * np.exp(-t * 320) * 0.8 + np.sin(2 * np.pi * 420 * p * t) * np.exp(-t * 140) * 0.5
    return x * (0.6 + 0.4 * r.random())


def fx_click():
    n = ns(0.09); t = tt(n)
    return bp(noise(n), 2000, 9000) * np.exp(-t * 220) + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 80) * 0.6 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * 0.5


def fx_whoosh(dur=0.45, f0=400, f1=5000, move=0.0):
    n = ns(dur); t = tt(n) / dur
    env = np.sin(np.pi * np.clip(t, 0, 1) ** 0.7) ** 2
    L = sweep_bp(noise(n), f0, f1, 1.0, 0.9) * env
    R = sweep_bp(noise(n), f0 * 1.05, f1 * 1.05, 1.0, 0.9) * env
    if move:  # pan glides across the stereo field
        p = -move + 2 * move * t
        L, R = L * np.cos((p + 1) * np.pi / 4) * 1.41, R * np.sin((p + 1) * np.pi / 4) * 1.41
    return np.vstack([L, R]) * 1.6


def fx_impact(final=False):
    d = 3.2 if final else 2.4
    n = ns(d); t = tt(n)
    f = 32 + 75 * np.exp(-t * 8)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.6 if final else 2.4))
    nz = lp(noise(n), 3000) * np.exp(-t * 10) * 0.6
    k = np.zeros(n); kk = kick(190, 46, 0.5, 1.6); k[:len(kk)] = kk
    x = np.tanh(1.3 * (boom + nz + 0.8 * k))
    c = crash(min(2.6, d))
    x[:len(c)] += c * 0.8
    return x


def fx_hit():
    n = ns(1.6); t = tt(n)
    k = np.zeros(n); kk = kick(150, 42, 0.6, 1.2); k[:len(kk)] = kk
    boom = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t * 10)) / SR) * np.exp(-t * 3)
    return np.tanh(1.2 * (k + boom * 0.7 + lp(noise(n), 2000) * np.exp(-t * 14) * 0.4))


def fx_shimmer(dur=0.7, dens=26, lo=2200, hi=7000):
    n = ns(dur + 1.2)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(int(dens * dur) + 4):
        t0 = rng.random() ** 1.6 * dur
        b = bell(lo * (hi / lo) ** rng.random(), 0.9, 3.01, 1.2, 6) * 0.17
        pan = rng.uniform(-0.9, 0.9)
        i = ns(t0); m = min(len(b), n - i)
        L[i:i + m] += b[:m] * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += b[:m] * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R])


def fx_ding():
    out = np.zeros(ns(1.6))
    for fr, d in ((note('E6'), 0.0), (note('A6'), 0.08)):
        b = bell(fr, 1.4, 2.0, 1.2, 3.2) * 0.4
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_zap():
    n = ns(0.5); t = tt(n)
    return sine(2400 * np.exp(-t * 6) + 600, n) * np.exp(-t * 9) * 0.35 + hp(noise(n), 6000) * np.exp(-t * 25) * 0.15


def fx_count():
    n = ns(0.025); t = tt(n)
    return (np.sin(2 * np.pi * 4200 * t) * 0.6 + hp(noise(n), 5000) * 0.4) * np.exp(-t * 300)


PENTA = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']
TILE_NOTES = ['A4', 'C5', 'E5', 'G5', 'B5', 'E6']  # Am9, one note per product tile
BLIP_NOTES = ['E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6']

FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(note(TILE_NOTES[c['note']]) / 520),
    'blip': lambda c: fx_blip(note(BLIP_NOTES[c.get('note', 0) % 7]) / 1100),
    'key': lambda c: fx_key(c.get('v', 0)),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(0.5, 300, 4500),
    'swoosh': lambda c: fx_whoosh(0.5, 250, 3500),
    'whip': lambda c: fx_whoosh(0.34, 600, 7000, move=0.8),
    'swish': lambda c: fx_whoosh(0.3, 900, 6000),
    'rise': lambda c: fx_whoosh(0.9, 150, 2500),
    'suck': lambda c: fx_whoosh(0.5, 6000, 400)[:, ::-1] * 0.8,
    'zoom': lambda c: np.vstack([riser(0.58, 400, 10000, False)] * 2) * 1.4,
    'impact': lambda c: fx_impact(bool(c.get('final'))),
    'hit': lambda c: fx_hit(),
    'shimmer': lambda c: fx_shimmer(),
    'ding': lambda c: fx_ding(),
    'zap': lambda c: fx_zap(),
    'count': lambda c: fx_count(),
    'pluck': lambda c: pluck(note(PENTA[c['note']]), 0.5, 1.3),
}
GAIN = {'tick': 0.35, 'pop': 0.5, 'blip': 0.22, 'key': 0.28, 'click': 0.5, 'whoosh': 0.32, 'swoosh': 0.3,
        'whip': 0.4, 'swish': 0.35, 'rise': 0.3, 'suck': 0.35, 'zoom': 0.4, 'impact': 0.95, 'hit': 0.8,
        'shimmer': 0.55, 'ding': 0.35, 'zap': 0.18, 'count': 0.18, 'pluck': 0.3}
REV = {'impact': 0.35, 'hit': 0.3, 'shimmer': 0.45, 'ding': 0.35, 'pop': 0.2, 'pluck': 0.35, 'blip': 0.2,
       'whoosh': 0.1, 'swoosh': 0.1, 'zap': 0.3}


# ───────────────────────── score ─────────────────────────
CH = {  # pad voicings
    'Am': ['A3', 'C4', 'E4', 'G4', 'B4'], 'F': ['F3', 'A3', 'C4', 'E4'], 'C': ['C4', 'E4', 'G4', 'D5'],
    'G': ['G3', 'B3', 'D4', 'A4'], 'Gs': ['G3', 'C4', 'D4', 'A4'],
}
ROOT = {'Am': 'A2', 'F': 'F2', 'C': 'C3', 'G': 'G2', 'Gs': 'G2'}
ARP = {'Am': ['A4', 'C5', 'E5', 'B5'], 'F': ['F4', 'A4', 'C5', 'E5'], 'C': ['C5', 'E5', 'G5', 'D6'],
       'G': ['G4', 'B4', 'D5', 'A5'], 'Gs': ['G4', 'C5', 'D5', 'A5']}
fs = lambda names: [note(x) for x in names]


def compose():
    kicks = []

    def kik(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    def groove(t0, t1, prog, intensity=1.0):
        """Four-on-the-floor house groove; prog = chord per bar."""
        bars = int(round((t1 - t0) / 2))
        for b in range(bars):
            ch = prog[b % len(prog)]
            tb = t0 + 2 * b
            send(music, pad(fs(CH[ch]), 2.0, cut=2400 * intensity, att=0.05, rel=0.4), tb, 0.9)
            for k in range(4):
                tk = tb + 0.5 * k
                kik(tk)
                if k in (1, 3):
                    send(drums, clap(), tk, 0.42, 0, rev=0.15)
                send(drums, hat(True), tk + 0.25, 0.14, 0.25)
                for s in range(4):
                    send(drums, hat(), tk + 0.125 * s, 0.10 if s % 2 else 0.06, -0.3 + 0.2 * s)
                send(bass, bass_note(note(ROOT[ch]), 0.2, 520 * intensity), tk + 0.25, 0.62)
                if k == 3 and b % 2:
                    send(bass, bass_note(note(ROOT[ch]) * 2, 0.11, 700), tk + 0.375, 0.32)
            arp = ARP[ch]
            for s in range(16):  # 3-against-4 pluck pattern
                nm = arp[(s * 3) % 4] if s % 4 != 3 else arp[(s // 4) % 4]
                send(music, pluck(note(nm), 0.32, 0.9 * intensity), tb + 0.125 * s, 0.13 if s % 4 == 0 else 0.08,
                     0.35 if s % 2 else -0.35, rev=0.2)

    def roll(t0, t1, steps=(0.25, 0.125, 0.0625), gain=0.38):
        seg = (t1 - t0) / len(steps)
        hits = []
        for i, st in enumerate(steps):
            t = t0 + i * seg
            while t < t0 + (i + 1) * seg - 1e-6:
                hits.append(t); t += st
        for j, t in enumerate(hits):
            send(drums, snare(0.25 + 0.75 * j / len(hits)), t, gain, 0, rev=0.2)

    # 0–4 intro: filtered Am9, sub pulse, ticking hats (tile plucks come from the cues)
    send(music, pad(fs(CH['Am']), 3.6, cut=900, att=1.2, rel=0.6), 0.0, 1.4)
    for k in range(8):
        send(bass, sub(note('A1'), 0.35), 0.5 * k, 0.18)
        for s in range(2):
            send(drums, hat(), 0.5 * k + 0.25 * s, 0.05 if s else 0.08, 0.2)
    for i, nm in enumerate(TILE_NOTES):
        send(music, pluck(note(nm), 0.7, 1.1), 0.25 + 0.25 * i, 0.38, ((i % 3) - 1) * 0.4, rev=0.4)
    send(sfx, np.vstack([riser(1.6)] * 2), 2.4, 0.55)
    send(sfx, rev_crash(1.0), 3.0, 0.5)

    # 4–8 logo: F then G, sparkling arpeggio, build into the drop
    send(music, pad(fs(CH['F']), 2.0, cut=3000, att=0.02, rel=0.6), 4.0, 1.25)
    send(music, pad(fs(CH['G']), 2.0, cut=3400, att=0.3, rel=0.4), 6.0, 1.15)
    send(bass, sub(note('F1'), 1.9), 4.0, 0.55)
    send(bass, sub(note('G1'), 1.9), 6.0, 0.5)
    for s in range(14):
        ch = 'F' if s < 6 else 'G'
        send(music, bell(note(ARP[ch][s % 4]) * 2, 1.2, 3.5, 1.2, 4), 4.6 + 0.25 * s, 0.07, 0.4 if s % 2 else -0.4, rev=0.5)
    for k in range(8):
        send(drums, hat(), 6.0 + 0.25 * k, 0.07, 0.2)
    kik(6.0, 0.6); kik(6.5, 0.6); kik(7.0, 0.7); kik(7.5, 0.75)
    roll(7.0, 8.0)
    send(sfx, np.vstack([riser(1.6)] * 2), 6.4, 0.7)

    # 8–28 main groove (Am F C G), small fills before each section
    send(drums, crash(), 8.0, 0.55, rev=0.2)
    groove(8.0, 28.0, ['Am', 'F', 'C', 'G'])
    for tf in (11.75, 15.75, 19.75, 23.75):
        for j in range(4):
            send(drums, snare(0.5 + 0.15 * j), tf + 0.0625 * j, 0.3, 0)
    for tc in (16.0, 20.0, 24.0):
        send(drums, crash(1.8), tc, 0.35, rev=0.2)

    # 28–32 feature wall: lift, then a big build
    send(drums, crash(), 28.0, 0.45, rev=0.2)
    for b, ch in enumerate(['C', 'Gs']):
        tb = 28.0 + 2 * b
        send(music, pad(fs(CH[ch]), 2.0, cut=1800 + 2500 * b, att=0.1, rel=0.3), tb, 1.0)
        send(bass, bass_note(note(ROOT[ch]), 1.9, 300), tb, 0.45)
        for s in range(16):
            send(music, pluck(note(ARP[ch][s % 4]), 0.3, 0.6 + 0.5 * b + 0.03 * s), tb + 0.125 * s, 0.07 + 0.003 * s, 0.3 if s % 2 else -0.3, rev=0.25)
    for k in range(6):
        kik(28.0 + 0.5 * k, 0.85)
    roll(30.0, 31.85, steps=(0.25, 0.125, 0.0625, 0.03125), gain=0.4)
    send(sfx, np.vstack([riser(2.0, 250, 11000)] * 2), 30.0, 0.85)

    # 32–36 second drop, then cut for the tagline
    groove(32.0, 35.5, ['Am', 'F'])
    send(drums, crash(), 32.0, 0.55, rev=0.2)
    send(music, pad(fs(CH['F']), 0.5, cut=2400, att=0.02, rel=0.2), 35.5, 0.6)
    send(sfx, rev_crash(0.5), 35.5, 0.45)

    # 36–40 tagline: two big chords, build to the logo
    send(music, pad(fs(CH['F']) + [note('A4')], 1.9, cut=2800, att=0.01, rel=0.5), 36.0, 1.35)
    for nm in ('F3', 'C4', 'A4', 'E5'):
        send(music, pluck(note(nm), 1.6, 0.8), 36.0, 0.16, 0, rev=0.5)
    send(bass, sub(note('F1'), 1.9), 36.0, 0.6)
    send(music, pad(fs(CH['G']) + [note('B4')], 2.0, cut=3400, att=0.01, rel=0.3), 38.0, 1.4)
    for nm in ('G3', 'D4', 'B4', 'A5'):
        send(music, pluck(note(nm), 1.6, 0.9), 38.0, 0.16, 0, rev=0.5)
    send(bass, sub(note('G1'), 1.9), 38.0, 0.6)
    for k in range(4):
        kik(38.0 + 0.5 * k, 0.55 + 0.1 * k)
    roll(39.0, 39.9, steps=(0.125, 0.0625, 0.03125), gain=0.32)
    send(sfx, np.vstack([riser(1.5, 300, 10000)] * 2), 38.5, 0.6)

    # 40–45 end card: resolve to C major, sound logo, gentle pulse, ring out
    send(music, pad(fs(['C3', 'G3', 'C4', 'E4', 'G4', 'D5']), 3.6, cut=3600, att=0.01, rel=1.4), 40.0, 1.3)
    send(bass, sub(note('C2'), 3.5), 40.0, 0.6)
    for t, nm in ((40.15, 'G5'), (40.3, 'C6'), (40.45, 'E6')):
        send(music, bell(note(nm), 2.8, 3.5, 2.0, 1.5), t, 0.3, 0, rev=0.55)
        send(music, pluck(note(nm) / 2, 0.6, 1.1), t, 0.14, 0, rev=0.3)
    send(music, bell(note('C7'), 2.2, 3.5, 1.2, 2.0), 40.45, 0.08, 0.3, rev=0.6)
    for k in range(6):
        tk = 41.0 + 0.5 * k
        kik(tk, 0.5)
        send(drums, hat(True), tk + 0.25, 0.08, 0.25)
        send(bass, bass_note(note('C3'), 0.18, 420), tk + 0.25, 0.35)
    send(music, pad(fs(['C3', 'G3', 'E4', 'G4', 'D5']), 1.2, cut=2400, att=0.3, rel=1.6), 43.0, 0.9)
    return kicks


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues = info['cues']
    kicks = compose()
    for c in cues:
        x = FX[c['type']](c)
        send(sfx, x, c['t'], GAIN[c['type']] * c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(c['type'], 0.0))

    # sidechain: bass and music duck under each kick
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        seg = t[:max(0, min(ns(0.4), N - i))]
        d = 1 - 0.55 * np.exp(-seg / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # room reverb (synthetic impulse)
    ir_n = ns(2.4); irt = tt(ir_n)
    irL = lp(noise(ir_n), 7000) * np.exp(-irt * 2.6)
    irR = lp(noise(ir_n), 7000) * np.exp(-irt * 2.6)
    irL[:ns(0.012)] = 0; irR[:ns(0.019)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    # tilt towards the mids so the track still reads on phone and laptop speakers
    music.L, music.R = music.L + 0.6 * bp(music.L, 500, 4000), music.R + 0.6 * bp(music.R, 500, 4000)
    L = drums.L * 0.62 + (bass.L * 0.42 + music.L * 1.7) * duck + sfx.L * 1.25 + vL * 1.3
    R = drums.R * 0.62 + (bass.R * 0.42 + music.R * 1.7) * duck + sfx.R * 1.25 + vR * 1.3
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = np.tanh(L / peak * 1.3) / np.tanh(1.3), np.tanh(R / peak * 1.3) / np.tanh(1.3)
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.9, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} s, {len(cues)} sound-effect cues')


if __name__ == '__main__':
    main()
