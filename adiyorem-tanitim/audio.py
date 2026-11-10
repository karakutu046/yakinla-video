#!/usr/bin/env python3
"""Adıyörem şube tanıtım filminin sesi: müzik + efektler (sentez) + ElevenLabs dış sesi + plan sesleri.

Kullanım:  python3 audio.py build/cues.json build/audio.wav [build/vo/dis_ses.wav]

- Müzik 120 BPM, 4/4, La minör / Mi hicaz: Am – G – F – E (Endülüs kadansı). Darbuka (maksum
  ritmi: düm-tek-tek-düm-tek), kick, el çırpma, bas ve Karplus-Strong ile sentezlenen saz.
- Kapanış kartı geldiğinde büyük vuruş, ardından Am'ye çözülen dört notalık ses logosu
  ("A-dı-yö-rem": E5 – G#5 – B5 – A5).
- Efektler anim.js'in ürettiği cues.json'dan gelir: her geçiş, yazı ve kart ögesi karede duyulur.
- Videolardan istenen sahnelerin doğal sesi (yoğurma, cızırtı) "ses" kazancıyla eklenir.
- Dış ses her zaman üstte kalır: konuşurken müzik ~9 dB, efektler ~4 dB kısılır (sidechain).
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)
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


def fx_reverse(dur=0.4):
    c = crash(1.6)[::-1]
    c = c[-ns(dur):]
    return c * np.linspace(0, 1, len(c)) ** 2 * 1.4


# ───────────────────────── darbuka ve saz ─────────────────────────
def dum(v=1.0):
    """Darbukanın derin "düm"ü: zarın ortası, perdesi düşen gövde + yumuşak tokluk."""
    n = ns(0.45); t = tt(n)
    f = 88 + 70 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    skin = lp(noise(n), 900) * np.exp(-t * 45) * 0.45
    return np.tanh(1.4 * (body + skin)) * v


def tek(v=1.0, soft=False):
    """Kenar vuruşu: "tek" (keskin) ya da "ka" (yumuşak, sol el)."""
    n = ns(0.16); t = tt(n)
    ring = np.sin(2 * np.pi * (520 if soft else 640) * t) * np.exp(-t * (60 if soft else 45))
    ring += 0.5 * np.sin(2 * np.pi * (1480 if soft else 1710) * t) * np.exp(-t * 70)
    snap = bp(noise(n), 2500, 9000) * np.exp(-t * (140 if soft else 110))
    return (ring * 0.55 + snap * (0.5 if soft else 0.9)) * v


def saz(f, dur=0.7, bright=0.55, buzz=0.25):
    """Karplus-Strong telli: iki tel (unison + oktav) ve hafif metalik vızıltı."""
    n = ns(dur)
    out = np.zeros(n)
    for ff, g in ((f, 1.0), (f * 2.003, 0.35)):
        P = max(2, int(round(SR / ff)))
        exc = np.zeros(n)
        burst = lp(noise(P), 2500 + 6000 * bright)
        exc[:P] = burst
        a = np.zeros(P + 2); a[0] = 1; a[P] = -0.497; a[P + 1] = -0.497
        y = signal.lfilter([1.0], a, exc)
        out += y * g
    t = tt(n)
    out = out / (np.max(np.abs(out)) + 1e-9)
    out = out + buzz * np.tanh(out * 4) * np.exp(-t * 6)
    pick = hp(noise(n), 3000) * np.exp(-t * 300) * 0.25
    return (out + pick) * adsr(n, 0.001, 1, 1, 0.04) * 0.6


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'thud': lambda c: fx_thud(),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.4)),
}
REV = {'impact': 0.35, 'shimmer': 0.4, 'sparkle': 0.4, 'pop': 0.12, 'whoosh': 0.1, 'thump': 0.15, 'reverse': 0.2}

# ───────────────────────── beste ─────────────────────────
A4 = 440.0
SEMI = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}


def hz(name):
    n, o = name[:-1], int(name[-1])
    return A4 * 2 ** ((SEMI[n] + 12 * (o - 4)) / 12)


CH = {'Am': ['A3', 'C4', 'E4'], 'G': ['G3', 'B3', 'D4'], 'F': ['F3', 'A3', 'C4'], 'E': ['E3', 'G#3', 'B3']}
ROOT = {'Am': 'A1', 'G': 'G1', 'F': 'F1', 'E': 'E1'}
# saz motifi: (sekizlik, nota); her ölçü bir basamak aşağı inen hicaz cümlesi
MOTIF = {
    'Am': [(0, 'E5'), (1, 'C5'), (1.5, 'D5'), (2, 'E5'), (3, 'F5'), (3.5, 'E5'), (4, 'D5'), (5, 'C5'), (6, 'B4'), (7, 'C5')],
    'G': [(0, 'D5'), (1, 'B4'), (1.5, 'C5'), (2, 'D5'), (3, 'E5'), (3.5, 'D5'), (4, 'C5'), (5, 'B4'), (6, 'A4'), (7, 'B4')],
    'F': [(0, 'C5'), (1, 'A4'), (1.5, 'B4'), (2, 'C5'), (3, 'D5'), (3.5, 'C5'), (4, 'B4'), (5, 'A4'), (6, 'G#4'), (7, 'A4')],
    'E': [(0, 'B4'), (0.5, 'C5'), (1, 'B4'), (1.5, 'A4'), (2, 'G#4'), (3, 'F4'), (3.5, 'G#4'), (4, 'E4'), (6, 'G#4'), (7, 'B4')],
}
PROG = ['Am', 'G', 'F', 'E']
BEAT = 0.5
BAR = 2.0


def compose(drums, bass_bus, music, send, dur, kapanis):
    """kapanis: kapanış kartının başladığı an (yoksa None). Müzik 0'dan başlar, ölçüler 2 sn."""
    kicks = []
    end_k = kapanis if kapanis is not None else dur
    nbars = int(np.ceil(end_k / BAR))

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(140, 48, 0.4, 0.8), t, 0.8 * v)

    # açılış: tek vuruş + saz çırpması (tremolo) — ilk karede dikkat çeker
    send(drums, dum(1.1), 0.0, 0.9, 0, rev=0.2)
    for j in range(6):
        send(music, saz(hz('E5') if j % 2 else hz('E4'), 0.25, 0.8), 0.0 + j * 0.045, 0.18 + 0.02 * j, 0.2, rev=0.3)

    for k in range(nbars):
        t0 = k * BAR
        if t0 >= end_k - 0.05:
            break
        ch = PROG[k % 4]
        bar_end = min(t0 + BAR, end_k)
        full = bar_end - t0 >= BAR - 1e-6
        send(music, pad([hz(x) for x in CH[ch]], bar_end - t0, cut=1500, att=0.05, rel=0.3), t0, 0.7)
        # bas: maksumla aynı aksanlarda
        for b, ln in ((0, 0.4), (1.5, 0.2), (2.0, 0.4), (3.0, 0.3)):
            tb = t0 + b * BEAT
            if tb < bar_end - 0.05:
                send(bass_bus, bass_note(hz(ROOT[ch]) * 2, ln, 380), tb, 0.6)
        # darbuka maksum: D T . T D . T . (sekizlikler) + yumuşak "ka" süslemeleri
        for e8, kind in ((0, 'D'), (1, 'T'), (3, 'T'), (4, 'D'), (6, 'T')):
            tb = t0 + e8 * 0.25
            if tb >= bar_end - 0.02:
                continue
            if kind == 'D':
                send(drums, dum(), tb, 0.75, -0.1, rev=0.1)
            else:
                send(drums, tek(), tb, 0.45, 0.25, rev=0.12)
        for e16 in (3, 5, 9, 11, 13, 15):
            tb = t0 + e16 * 0.125
            if tb < bar_end - 0.02 and k > 0:
                send(drums, tek(0.5, soft=True), tb, 0.22, -0.3)
        # modern taban: kick dörtlük, el çırpma 2 ve 4'te, ikinci döngüde shaker
        for b in range(4):
            tb = t0 + b * BEAT
            if tb >= bar_end - 0.02:
                continue
            if k > 0 or b >= 2:
                K(tb, 0.9 if b % 2 else 1.0)
            if b % 2 == 1:
                send(drums, clap(), tb, 0.32, 0, rev=0.2)
        if k >= 4:
            for i in range(8):
                tb = t0 + i * 0.25 + 0.125
                if tb < bar_end:
                    send(drums, shaker(), tb, 0.14, 0.4)
        # saz
        for e8, nm in MOTIF[ch]:
            tb = t0 + e8 * 0.25
            if tb < bar_end - 0.05:
                send(music, saz(hz(nm), 0.55, 0.6), tb, 0.26, -0.25, rev=0.25)
        if not full:
            break
        # dört ölçüde bir kısa davul geçişi
        if k % 4 == 3 and t0 + BAR < end_k - 0.1:
            for j in range(4):
                send(drums, tek(0.4 + 0.15 * j), t0 + 1.5 + j * 0.125, 0.4, 0.1 * j)

    if kapanis is not None:
        T = kapanis
        # kapanış: geri sarılmış zil → büyük vuruş, Am'de durak ve ses logosu
        rv = fx_reverse(0.6)
        send(drums, rv, T - 0.6 + 0.15, 0.4)
        send(drums, crash(2.6), T + 0.15, 0.4)
        K(T + 0.15, 1.2)
        send(drums, dum(1.2), T + 0.15, 0.9, 0, rev=0.3)
        rest = dur - T
        send(music, pad([hz(x) for x in ['A3', 'C4', 'E4', 'A4']], rest - 0.4, cut=2200, att=0.3, rel=1.2), T + 0.15, 0.85)
        send(bass_bus, bass_note(hz('A1') * 2, min(2.0, rest - 0.3), 360), T + 0.15, 0.6)
        # hafif ritim kartın altında devam eder
        for i in range(int((rest - 1.2) / BEAT)):
            tb = T + 0.65 + i * BEAT
            send(drums, tek(0.6, soft=i % 2 == 0), tb, 0.2, 0.3)
            if i % 2 == 1:
                send(drums, dum(0.7), tb + 0.25, 0.35)
        for j, (dt, nm) in enumerate(((1.15, 'E5'), (1.4, 'G#5'), (1.65, 'B5'), (1.9, 'A5'))):
            send(music, saz(hz(nm), 1.4 if j == 3 else 0.6, 0.7), T + dt, 0.34, 0, rev=0.4)
            send(music, bell(hz(nm), 2.4 if j == 3 else 1.2, 3.5, 1.6, 1.6), T + dt, 0.12, 0, rev=0.5)
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


def read_wav(path):
    w = wave.open(path)
    assert w.getframerate() == SR and w.getsampwidth() == 2, f'{path}: 48 kHz 16 bit WAV olmalı'
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768.0
    ch = w.getnchannels()
    return x.reshape(-1, ch).T if ch > 1 else x[None, :]


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    vo_path = sys.argv[3] if len(sys.argv) > 3 and os.path.exists(sys.argv[3]) else None
    info = json.load(open(cues_path, encoding='utf-8'))
    global N
    DUR = float(info['dur'])
    N = ns(DUR + 3.0)
    drums, bass_bus, music, sfx, verb, vob, nat = Bus(), Bus(), Bus(), Bus(), Bus(), Bus(), Bus()

    def send(bus, x, t, gain=1.0, pan=0.0, rev=0.0):
        bus.add(x, t, gain, pan)
        if rev > 0:
            verb.add(x, t, gain * rev, pan)

    kicks = compose(drums, bass_bus, music, send, DUR, info.get('kapanis'))
    for c in info['cues']:
        send(sfx, FX[c['type']](c), c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(c['type'], 0.0))

    # planların kendi sesi (ör. yoğurma, cızırtı): sahne sınırlarında yumuşak geçiş
    for d in info.get('dogal', []):
        x = read_wav(d['dosya'])
        if x.shape[0] == 1:
            x = np.vstack([x[0], x[0]])
        t_src0 = d['t']
        a, b = max(d['a'], t_src0), min(d['b'], t_src0 + x.shape[1] / SR)
        i0, i1 = ns(a - t_src0), ns(b - t_src0)
        seg = x[:, i0:i1].copy()
        f = min(ns(0.12), seg.shape[1] // 2)
        if f > 0:
            seg[:, :f] *= np.linspace(0, 1, f); seg[:, -f:] *= np.linspace(1, 0, f)
        nat.add(seg, a, d.get('kazanc', 0.5))

    # dış ses
    vo_rms = None
    if vo_path:
        vo = read_wav(vo_path)[0]
        vo = hp(vo, 75, 2)
        ds = info.get('dis_ses') or {}
        parts = ds.get('parcalar') or [{'a': 0, 'b': len(vo) / SR, 't': ds.get('bas', 0.25)}]
        fade = ns(0.012)
        for p in parts:
            a, b = ns(p['a']), min(len(vo), ns(p['b']))
            seg = vo[a:b].copy()
            seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
            vob.add(seg, p['t'], 1.0, 0.0)
        vmono = vob.L / 1.4142
        env = envelope(vmono)
        speaking = env > 0.02
        vo_rms = np.sqrt(np.mean(vmono[speaking] ** 2)) if speaking.any() else None
    if vo_rms is None:
        vmono = np.zeros(N); env = np.zeros(N); speaking = np.zeros(N, bool)
        vo_rms = 0.1

    t = tt(N)
    duck_k = np.ones(N)
    for k in kicks:
        i = ns(k)
        if i >= N:
            continue
        seg = t[: min(ns(0.35), N - i)]
        d = 1 - 0.45 * np.exp(-seg / 0.08)
        duck_k[i:i + len(d)] = np.minimum(duck_k[i:i + len(d)], d)
    sc = np.clip(env / 0.06, 0, 1)
    duck_m = 1 - (1 - 10 ** (-9 / 20)) * sc
    duck_s = 1 - (1 - 10 ** (-4 / 20)) * sc

    ir_n = ns(1.8); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.4)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.4)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    mL = drums.L * 0.85 + (bass_bus.L * 0.8 + music.L) * duck_k + vL
    mR = drums.R * 0.85 + (bass_bus.R * 0.8 + music.R) * duck_k + vR
    # müzik yatağı dış sesin 5 dB altında (konuşurken sidechain ile ~14 dB altta)
    m_rms = np.sqrt(np.mean(((mL + mR) / 2)[:ns(DUR)] ** 2)) + 1e-9
    mg = vo_rms * 10 ** (-5 / 20) / m_rms
    s_peak = max(np.max(np.abs(sfx.L)), np.max(np.abs(sfx.R))) + 1e-9
    sg = vo_rms * 10 ** (7 / 20) / s_peak
    n_rms = np.sqrt(np.mean(((nat.L + nat.R) / 2) ** 2)) + 1e-9
    ng = vo_rms * 10 ** (-8 / 20) / n_rms if np.any(nat.L) else 0.0
    L = mL * mg * duck_m + sfx.L * sg * duck_s + nat.L * ng * duck_s + vob.L
    R = mR * mg * duck_m + sfx.R * sg * duck_s + nat.R * ng * duck_s + vob.R
    db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    n = ns(DUR)
    mus = ((mL + mR) / 2 * mg * duck_m)[:n]
    if speaking.any():
        spk = speaking[:n]
        print(f'miks: dış ses {db(vmono[:n][spk]):.1f} dB · konuşurken müzik {db(mus[spk]):.1f} dB'
              f' · aralarda müzik {db(mus[~spk]):.1f} dB (RMS, normalize öncesi)')
    else:
        print('miks: dış ses yok (yalnızca müzik ve efektler)')
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.15, R / peak * 1.15
    L, R = np.tanh(L) / np.tanh(1.15), np.tanh(R) / np.tanh(1.15)
    L, R = L[:n], R[:n]
    f = np.clip((DUR - tt(n)) / 0.8, 0, 1) ** 1.5
    L, R = L * f * 0.89, R * f * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(info["cues"])} efekt, {len(info.get("dogal", []))} doğal ses'
          + (', dış ses var' if vo_path else ''))


if __name__ == '__main__':
    main()
