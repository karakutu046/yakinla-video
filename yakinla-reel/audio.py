#!/usr/bin/env python3
"""Yakınla 15 sn reel'inin müziği ve ses efektleri: tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav

- 128 BPM, 4/4, La minör. 8 ölçü tam 15 sn; her sahne bir ölçü başına oturur.
  Ölçü 1: boğuk giriş → "DUR."da bant durması (tape stop) → sessizlik → trampet rulosu ve yükseliş.
  Ölçü 2–6: Am F C G | F G (gerilim) — 808 bas, formant ("vokal") akor vuruşları, swing'li hi-hat.
  Ölçü 7–8: Do majöre çözülme, ses imzası G5 – A5 – C6, son vuruş 14.06 sn'de.
- Efektler, anim.js'in ürettiği cues.json'dan gelir; böylece her tık, daktilo sesi ve whoosh
  ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.
"""
import json
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 15.0
N = int(SR * (DUR + 2.5))
BPM = 128
B = 60 / BPM          # vuruş
ST = B / 4            # 16'lık
BAR = 4 * B
rng = np.random.default_rng(11)


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



# ───────────────────────── bu reel'e özel efektler ─────────────────────────
def fx_key(pitch=1.0):
    """Daktilo / klavye tıkı."""
    n = ns(0.05); t = tt(n)
    clk = bp(noise(n), 2200 * pitch, 7500) * np.exp(-t * 320)
    thock = np.sin(2 * np.pi * 210 * pitch * t) * np.exp(-t * 90) * 0.35
    return clk * 0.9 + thock


def fx_stamp():
    """Damga: ağır tok vuruş + kâğıt şaplaması."""
    n = ns(0.5); t = tt(n)
    k = np.zeros(n); kk = kick(130, 42, 0.45, 1.6); k[:len(kk)] += kk
    slap = bp(noise(n), 400, 4000) * np.exp(-t * 35) * 0.9
    hi = hp(noise(n), 3000) * np.exp(-t * 120) * 0.4
    return np.tanh(1.3 * (k * 0.9 + slap + hi))


def fx_sonar():
    out = np.zeros(ns(1.4))
    for d, gn in ((0, 1.0), (0.14, 0.45), (0.28, 0.2), (0.42, 0.09)):
        m = ns(0.5); t = tt(m)
        x = sine(1320 * (1 - 0.04 * t), m) * np.exp(-t * 9) * gn
        i = ns(d); out[i:i + m] += x[:len(out) - i]
    return out * 0.6


def fx_ding():
    return bell(1567.98, 1.2, 3.0, 1.0, 3.5) * 0.5 + bell(2093.0, 1.2, 3.0, 0.6, 4.5) * 0.25


def fx_lock():
    out = np.zeros(ns(0.3))
    for d, f in ((0.0, 2400), (0.045, 3100)):
        m = ns(0.06); t = tt(m)
        x = bp(noise(m), 2500, 9000) * np.exp(-t * 250) + np.sin(2 * np.pi * f * t) * np.exp(-t * 110) * 0.5
        i = ns(d); out[i:i + m] += x
    return out


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'key': lambda c: fx_key(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'coin': lambda c: fx_coin(c.get('pitch', 1)),
    'tap': lambda c: fx_tap(),
    'click': lambda c: fx_click(),
    'lock': lambda c: fx_lock(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'swish': lambda c: fx_whoosh(0.16, 2000, 7000) * 0.8,
    'thud': lambda c: fx_thud(),
    'slam': lambda c: fx_slam(),
    'stamp': lambda c: fx_stamp(),
    'zip': lambda c: fx_zip(c.get('dur', 0.44)),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'sonar': lambda c: fx_sonar(),
    'ding': lambda c: fx_ding(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'success': lambda c: fx_success(),
}
REV = {'slam': 0.3, 'stamp': 0.2, 'impact': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4, 'sonar': 0.35,
       'ding': 0.3, 'shine': 0.4, 'coin': 0.15, 'pop': 0.12, 'whoosh': 0.1, 'thump': 0.15}


# ───────────────────────── enstrümanlar ─────────────────────────
def kick808(f=55.0, dur=0.42, punch=1.0):
    n = ns(dur); t = tt(n)
    fr = f + f * 3.2 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 7)
    click = hp(noise(n), 2500) * np.exp(-t * 500) * 0.45 * punch
    return np.tanh(2.0 * (body + click)) * 0.9


def sub808(f, dur):
    """Doymuş sinüs bas: telefon hoparlöründe de duyulsun diye üst harmonik taşır."""
    n = ns(dur); t = tt(n)
    ph = 2 * np.pi * f * t
    x = np.tanh(2.2 * np.sin(ph)) * 0.75 + 0.18 * np.sin(2 * ph)
    return x * adsr(n, 0.003, 0.2, 0.8, 0.035)


def perc():
    n = ns(0.12); t = tt(n)
    return bp(noise(n), 900, 3500) * np.exp(-t * 60) * 0.6 + np.sin(2 * np.pi * 820 * t) * np.exp(-t * 45) * 0.5


FORMANTS = {'a': ((800, 1.0), (1150, 0.5), (2900, 0.22)), 'o': ((500, 1.0), (900, 0.55), (2600, 0.18))}


def vox(freqs, dur, bright=1.0, att=0.003, sus=0.35, rel=0.05):
    """Akor vuruşu: dedüne testere akoru, hızla kapanan filtre zarfı (pluck), üstünde hafif
    formant ("vokal") rengi. Sol/sağ kanal ayrı faz ve ünlüyle üretilir: geniş stereo."""
    n = ns(dur + rel + 0.02); t = tt(n)
    e = np.exp(-t * 15)
    env = adsr(n, att, 0.1, sus, rel, hold=dur)
    out = []
    for v in ('a', 'o'):
        src = np.zeros(n)
        for f in freqs:
            for det in (-0.1, 0.0, 0.1):
                src += saw(f * 2 ** (det / 12), n, rng.random())
        src /= len(freqs) * 1.7
        y = lp(src, 5200 * bright) * e + lp(src, 1300 * bright) * (1 - e)
        for fc, gn in FORMANTS[v]:
            y = y + bp(src, fc * 0.85, min(fc * 1.15, SR / 2 - 300), 2) * gn * 0.5
        out.append(y * env)
    return np.vstack(out)


def lp_sweep(x, f0, f1, curve=1.0):
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), 256):
        p = (i / max(1, len(x) - 1)) ** curve
        s = sos('low', min(SR / 2 - 300, f0 * (f1 / f0) ** p), 2)
        if zi is None:
            zi = signal.sosfilt_zi(s) * 0
        out[i:i + 256], zi = signal.sosfilt(s, x[i:i + 256], zi=zi)
    return out


def tape_stop(bus, t0, dur):
    """t0'dan itibaren kayıt yavaşlayıp durur: perde iner, sonra sessizlik."""
    i0, m = ns(t0), ns(dur)
    sp = (1 - np.arange(m) / m) ** 1.5
    pos = i0 + np.cumsum(sp)
    fade = (1 - np.arange(m) / m) ** 0.6
    for arr in (bus.L, bus.R):
        seg = np.interp(pos, np.arange(len(arr)), arr) * fade
        arr[i0:i0 + m] = seg
        arr[i0 + m:] = 0


# ───────────────────────── beste ─────────────────────────
NOTE = {'F1': 43.65, 'G1': 49.0, 'A1': 55.0, 'C2': 65.41,
        'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
        'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'A5': 880.0, 'C6': 1046.5}
CH = {'Am': ('A3', 'C4', 'E4', 'A4'), 'F': ('F3', 'A3', 'C4', 'F4'), 'C': ('G3', 'C4', 'E4', 'G4'), 'G': ('G3', 'B3', 'D4', 'G4')}
ROOT = {'Am': 'A1', 'F': 'F1', 'C': 'C2', 'G': 'G1'}
hz = lambda names: [NOTE[x] for x in names]
STAB = (0, 3, 6, 10, 13)            # akor vuruşları (16'lık adım)
BASS = ((0, 2.5, 1), (3, 2, 1), (6, 3, 1), (10, 2.5, 1), (14, 1.6, 2))  # (adım, uzunluk, oktav)
hookbus = Bus()
T_END = 6 * BAR


def compose():
    kicks = []

    def K(t, v=1.0, bus=drums):
        kicks.append(t)
        send(bus, kick808(), t, 0.8 * v)

    def groove(t0, ch, steps=range(16), stab=True, stabs=STAB, bright=1.0, hats=True, bass=True, clapv=0.6):
        for s in steps:
            t = t0 + s * ST
            if s % 4 == 0:
                K(t)
            if s in (4, 12):
                send(drums, clap(), t, clapv, 0, rev=0.2)
                send(drums, snare(0.6), t, 0.25)
            if hats:
                if s % 2 == 1:
                    send(drums, hat(), t + 0.018, 0.26 if s % 4 == 3 else 0.17, 0.3)
                if s % 4 == 2:
                    send(drums, hat(True), t, 0.2, -0.25)
                if s in (3, 11):
                    send(drums, perc(), t + 0.018, 0.22, -0.35)
            if stab and s in stabs:
                send(music, vox(hz(CH[ch]), ST * (1.6 if s != 6 else 2.6), bright), t, 0.75, rev=0.18)
        if bass:
            for s, ln, octv in BASS:
                if s in steps:
                    send(bass_bus, sub808(NOTE[ROOT[ch]] * octv, ST * ln), t0 + s * ST, 0.45)
        send(music, pad(hz(CH[ch]), ST * len(list(steps)) - 0.02, cut=1800, att=0.05, rel=0.3), t0 + min(steps) * ST, 1.4)

    # ölçü 1: kanca — boğuk yatak, "DUR."da bant durması
    for s in range(8):
        t = s * ST
        if s % 4 == 0:
            send(hookbus, kick808(), t, 0.8)
        if s == 4:
            send(hookbus, clap(), t, 0.45)
        send(hookbus, hat(), t + (0.018 if s % 2 else 0), 0.14 if s % 2 else 0.08, 0.25)
        if s in (0, 3, 6):
            send(hookbus, lp(vox(hz(CH['Am']), ST * (1.5 if s < 6 else 5), 0.8), 1400), t, 0.55)
            send(hookbus, sub808(NOTE['A1'], ST * (2.5 if s < 6 else 6)), t, 0.55)
    send(hookbus, pad(hz(CH['Am']), 1.3, cut=900, att=0.1, rel=0.2), 0.0, 0.45)
    tape_stop(hookbus, 2 * B, 0.34)
    music.L += hookbus.L; music.R += hookbus.R
    # yükseliş: 3. vuruştan sonra trampet rulosu, filtre açılan akor, gürültü yükselişi
    roll = [3 * B + k * ST for k in range(2)] + [3.5 * B + k * ST / 2 for k in range(6)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.6, 0, rev=0.2)
    sw = vox(hz(CH['Am']), B - 0.06, 1.0, att=0.2, sus=0.9, rel=0.02)
    send(music, np.vstack([lp_sweep(sw[0], 350, 6000, 1.5), lp_sweep(sw[1], 350, 6000, 1.5)]), 3 * B, 0.65)
    n = ns(B); r = tt(n) / (B)
    riser = sweep_bp(noise(n), 500, 9000, 1.4, 0.8) * r ** 2 * 0.55 + sine(400 + 1400 * r ** 2, n) * r ** 2 * 0.12
    send(sfx, riser, 3 * B, 1.0)

    # ölçü 2–5: Am F C G
    for k, ch in enumerate(('Am', 'F', 'C', 'G')):
        groove(BAR * (k + 1), ch)
    # ölçü 6: F G + gerilim (son vuruşta davul susar, trampet rulosu)
    t6 = 5 * BAR
    groove(t6, 'F', steps=range(8))
    groove(t6, 'G', steps=range(8, 12), bright=1.3)
    roll = [t6 + 2 * B + k * B / 2 for k in range(2)] + [t6 + 3 * B + k * ST for k in range(2)] + [t6 + 3.5 * B + k * ST / 2 for k in range(3)]
    for j, t in enumerate(roll):
        send(drums, snare(0.35 + 0.65 * j / len(roll)), t, 0.45, 0, rev=0.2)
    n = ns(1.3); r = tt(n) / 1.3
    riser = sweep_bp(noise(n), 400, 10000, 1.6, 0.8) * r ** 2 * 0.5 + sine(300 + 1200 * r ** 2, n) * r ** 2 * 0.1
    send(sfx, riser, T_END - 1.3 - 0.11, 0.6)  # 11.14–11.25 arası boşluk: kapanış vuruşu öncesi nefes

    # ölçü 7: Do majör, ses imzası
    t7 = 6 * BAR
    groove(t7, 'C', stabs=(0, 10, 13), clapv=0.5)
    for t, nm in ((t7 + B, 'G5'), (t7 + 1.5 * B, 'A5'), (t7 + 2 * B, 'C6')):
        send(music, bell(NOTE[nm], 2.4, 3.5, 2.0, 1.6), t, 0.45, 0, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.3, 0, rev=0.3)
    # ölçü 8: F G → C (14.06)
    t8 = 7 * BAR
    groove(t8, 'F', steps=range(4), stabs=(0, 3))
    groove(t8, 'G', steps=range(4, 8), stabs=(4, 6))
    tf = t8 + 2 * B
    K(tf, 1.1)
    send(music, vox(hz(CH['C']) + [NOTE['C5']], 0.9, 1.2, sus=0.6, rel=0.5), tf, 0.55, rev=0.35)
    send(music, pad(hz(CH['C']) + [NOTE['E5']], 0.6, cut=3000, att=0.01, rel=0.4), tf, 0.6)
    send(bass_bus, sub808(NOTE['C2'], 0.75), tf, 0.7)
    send(drums, crash(1.6), tf, 0.55, 0.1)
    send(music, bell(NOTE['C6'], 1.6, 3.5, 1.4, 2.0), tf, 0.16, 0, rev=0.5)
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
        send(sfx, FX[typ](c), c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(typ, 0.0))

    # sidechain: bas ve müzik kick'lere yer açar
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        d = 1 - 0.55 * np.exp(-t[:ns(0.3)] / 0.07)
        m = min(len(d), N - i)
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])

    # oda yankısı (sentetik impuls)
    ir_n = ns(1.8); irt = tt(ir_n)
    irL = lp(noise(ir_n), 7000) * np.exp(-irt * 3.4)
    irR = lp(noise(ir_n), 7000) * np.exp(-irt * 3.4)
    irL[:ns(0.011)] = 0; irR[:ns(0.016)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    L = drums.L * 0.9 + (bass_bus.L * 0.9 + music.L) * duck + sfx.L * 0.85 + vL
    R = drums.R * 0.9 + (bass_bus.R * 0.9 + music.R) * duck + sfx.R * 0.85 + vR
    L, R = hp(L, 30), hp(R, 30)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.3, R / peak * 1.3
    L, R = np.tanh(L) / np.tanh(1.3), np.tanh(R) / np.tanh(1.3)
    # son: 14.06'daki vuruşun kuyruğu, 15.0'da yumuşak kesim
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.35, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
