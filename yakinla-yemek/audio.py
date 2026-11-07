#!/usr/bin/env python3
"""Yakınla Yemek reklamının sesi: sentez müzik + efektler + ElevenLabs dış sesi.

Kullanım:  python3 audio.py build/cues.json build/vo/dis_ses.wav build/audio.wav

- Müzik 120 BPM, 4/4, G majör; neşeli, yemek reklamına uygun bir groove. Sahne geçişleri
  ölçü başlarına (4, 12, 16 sn) oturur. Akorlar: G (kanca) → G D Em C (adımlar) → C D (lansman) → G (logo).
- Ses logosu: logonun ibreleri otururken çalan üç nota, G5 – B5 – D6 ("Ya-kın-la").
- Efektler ve dış ses cümleleri js/main.js'in ürettiği cues.json'dan gelir: her pop, tık ve whoosh
  ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur; dış ses cümleleri ekrandaki yazılara oturur.
- Dış ses müziğin üstünde kalır: konuşma boyunca müzik ~14 dB, efektler ~8 dB kısılır (sidechain).
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


def fx_clink(pitch=1.0):
    """Servis kapağının tabağa vuran metal tıkırtısı."""
    n = ns(0.25); t = tt(n)
    x = np.zeros(n)
    for f, d in ((2950, 18), (4120, 24), (5630, 30), (7300, 38)):
        x += np.sin(2 * np.pi * f * pitch * t + rng.random() * 6) * np.exp(-t * d)
    return x * 0.25 + hp(noise(n), 4000) * np.exp(-t * 200) * 0.4


def fx_sizzle(dur=1.4):
    """Sıcak yemek cızırtısı: yoğun, kısık, tiz çıtırtılar."""
    n = ns(dur); t = tt(n)
    env = np.minimum(1, t / 0.08) * np.exp(-t * 1.6)
    crackle = np.zeros(n)
    idx = rng.integers(0, n, int(dur * 900))
    crackle[idx] = rng.uniform(-1, 1, len(idx))
    x = bp(crackle, 2500, 11000) * 2.0 + bp(noise(n), 4000, 12000) * 0.25
    L, R = x * env, np.roll(x, 37) * env
    return np.vstack([L, R])


def fx_switch():
    """Anahtarın 'klik-klak' sesi: iki kısa mekanik darbe."""
    out = np.zeros(ns(0.25))
    for d, f, g in ((0.0, 1800, 0.8), (0.055, 2600, 1.0)):
        m = ns(0.06); t = tt(m)
        c = bp(noise(m), f * 0.6, f * 3) * np.exp(-t * 260) + np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t * 140) * 0.5
        out[ns(d):ns(d) + m] += c * g
    return out


def fx_confetti(dur=1.4):
    """Konfeti: dağınık, hafif kağıt hışırtıları + minik çıngırak notaları."""
    x = fx_crinkle(dur * 0.6) * 0.5
    s = fx_shimmer(dur * 0.5, 30, 3500, 9000) * 0.6
    n = max(x.shape[1], s.shape[1])
    out = np.zeros((2, n)); out[:, :x.shape[1]] += x; out[:, :s.shape[1]] += s
    return out


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'coin': lambda c: fx_coin(c.get('pitch', 1)),
    'tap': lambda c: fx_tap(),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
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
    'clink': lambda c: fx_clink(c.get('pitch', 1)),
    'sizzle': lambda c: fx_sizzle(c.get('dur', 1.4)),
    'switch': lambda c: fx_switch(),
    'confetti': lambda c: fx_confetti(c.get('dur', 1.4)),
}
REV = {'slam': 0.25, 'impact': 0.35, 'doorbell': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4,
       'shine': 0.4, 'coin': 0.15, 'pop': 0.12, 'whoosh': 0.1, 'thump': 0.15, 'clink': 0.3, 'switch': 0.15}


# ───────────────────────── beste ─────────────────────────
NOTE = {'G2': 98.0, 'A2': 110.0, 'B2': 123.47, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.0, 'B5': 987.77,
        'D6': 1174.66, 'G6': 1567.98}
CH = {'G': ['G3', 'B3', 'D4', 'G4'], 'D': ['D3', 'F#3', 'A3', 'D4'], 'Em': ['E3', 'G3', 'B3', 'E4'],
      'C': ['C3', 'E3', 'G3', 'C4'], 'Gsus': ['G3', 'C4', 'D4', 'G4']}
ROOT = {'G': 'G2', 'D': 'D2', 'Em': 'E2', 'C': 'C2', 'Gsus': 'G2'}
ARP = {'G': ['G4', 'B4', 'D5', 'G5'], 'D': ['D4', 'F#4', 'A4', 'D5'], 'Em': ['E4', 'G4', 'B4', 'E5'],
       'C': ['C4', 'E4', 'G4', 'C5']}
f = lambda *names: [NOTE[x] for x in names]


def compose(T):
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    def groove_bar(bar, ch, kick_on=True, clap_on=True, hats=True, arp=0.0, stabs=True, skip=()):
        """2 sn'lik bir ölçü: dört vuruş kick, 2 ve 4'te clap, ara sekizliklerde hat, senkoplu bas."""
        send(music, pad(f(*CH[ch]), 2.0, cut=2400, att=0.03, rel=0.35), bar, 0.75)
        root = NOTE[ROOT[ch]]
        for k in range(4):
            t = bar + k * 0.5
            if any(a <= t < b for a, b in skip):
                continue
            if kick_on:
                K(t)
            if clap_on and k % 2 == 1:
                send(drums, clap(), t, 0.5, 0, rev=0.25)
            send(bass_bus, bass_note(root, 0.2), t + 0.25, 0.7)
            if k in (0, 2):
                send(bass_bus, bass_note(root * (2 if k == 2 else 1), 0.16), t, 0.42)
            if hats:
                send(drums, hat(), t + 0.25, 0.3, 0.3)
                send(drums, hat(), t, 0.1, -0.3)
            if stabs and k % 2 == 0:  # ofbit akor vuruşları: yemek reklamına neşeli bir 'skank'
                for nm in ARP[ch][:3]:
                    send(music, pluck(NOTE[nm], 0.22, 1.25), t + 0.25, 0.1, 0, rev=0.2)
        if arp > 0:
            for i in range(16):
                t = bar + i * 0.125
                if any(a <= t < b for a, b in skip):
                    continue
                nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
                send(music, pluck(NOTE[nm] * 2, 0.22, 1.1), t, arp, -0.4 if i % 2 else 0.4, rev=0.3)

    # 0–1.5: giriş — kısık pad, tıkırtılı hat, kapak açılmadan önce yükselen gerilim
    send(music, pad(f(*CH['Gsus']), 1.6, cut=700, att=0.6, rel=0.4), 0.0, 0.85)
    for i in range(6):
        send(drums, hat(), 0.25 + i * 0.25, 0.08 + i * 0.02, 0.25 if i % 2 else -0.25)
    n = ns(0.9); tr = tt(n) / 0.9
    riser = sine(400 + 1100 * tr ** 2, n) * tr ** 2 * 0.12 + sweep_bp(noise(n), 500, 8000, 1.5, 0.8) * tr ** 2 * 0.45
    send(sfx, riser, T['burst'] - 0.9, 0.5)
    # 1.5: kapak açılır → büyük vuruş, groove 2.0'da başlar
    K(T['burst'], 1.1)
    send(drums, crash(2.2), T['burst'], 0.55)
    send(bass_bus, bass_note(NOTE['G2'], 0.45, 600), T['burst'], 0.7)
    for nm in ('G4', 'B4', 'D5'):
        send(music, pluck(NOTE[nm], 0.6, 1.3), T['burst'], 0.16, 0, rev=0.4)
    groove_bar(2.0, 'G', skip=((3.5, 4.0),), arp=0.0)
    # 3.5–4.0: telefon için nefes + ters crash
    send(sfx, fx_reverse(0.45), 3.55, 0.35)
    # 4–12: adımlar (G D Em C)
    for bar, ch in ((4, 'G'), (6, 'D'), (8, 'Em'), (10, 'C')):
        groove_bar(bar, ch, arp=0.06 if bar >= 8 else 0.0, skip=((11.5, 12.0),))
    send(drums, crash(1.8), 4.0, 0.35)
    # 12–13: lansman gerilimi — kicksiz, kısık pad, trampet rulosu
    send(music, pad(f(*CH['C']), 1.0, cut=900, att=0.05, rel=0.2), 12.0, 0.9)
    send(bass_bus, bass_note(NOTE['C2'], 0.4, 500), 12.0, 0.6)
    roll = [12.0 + i * 0.25 for i in range(2)] + [12.5 + i * 0.125 for i in range(2)] + [12.75 + i * 0.0625 for i in range(4)]
    for j, t in enumerate(roll):
        send(drums, snare(0.3 + 0.7 * j / len(roll)), t, 0.3, 0, rev=0.2)
    n = ns(0.75); tr = tt(n) / 0.75
    send(sfx, sine(300 + 1200 * tr ** 2, n) * tr ** 2 * 0.1 + sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.4, 12.25, 0.55)
    # 13.0: anahtar açılır → düşüş (drop)
    K(13.0, 1.1); send(drums, crash(2.4), 13.0, 0.42)
    groove_bar(13.0, 'C', arp=0.07)
    groove_bar(15.0, 'D', arp=0.07, skip=((15.5, 16.0),))
    for i in range(int(2.0 / 0.125)):  # 13–15 arası 16'lık hat enerjisi
        t = 13.0 + i * 0.125
        send(drums, hat(i % 4 == 2), t, 0.12 if i % 2 else 0.07, 0.25 if i % 2 else -0.25)
    for j, t in enumerate([15.5 + i * 0.0625 for i in range(8)]):
        send(drums, snare(0.3 + 0.7 * j / 8), t, 0.35, 0, rev=0.2)
    # 16–20: kapanış, G majör çözülme + ses logosu (G5 B5 D6), dış sesin "Afiyet olsun!"una yer bırakır
    K(16.0, 1.0)
    send(music, pad(f(*CH['G']) + [NOTE['D5']], 3.6, cut=3000, att=0.02, rel=1.2), 16.0, 1.0)
    send(bass_bus, bass_note(NOTE['G2'], 0.9, 500), 16.0, 0.6)
    for t, nm in ((16.35, 'G5'), (16.55, 'B5'), (16.75, 'D6')):
        send(music, bell(NOTE[nm], 2.8, 3.5, 2.2, 1.4), t, 0.34, 0, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.15, 0, rev=0.3)
    send(music, bell(NOTE['G6'], 2.0, 3.5, 1.4, 2.0), 16.75, 0.1, 0.3, rev=0.6)
    for b in range(4):
        t = 17.0 + b * 0.5
        K(t, 0.7)
        if b % 2 == 1:
            send(drums, clap(), t, 0.35, 0, rev=0.25)
        send(drums, hat(), t + 0.25, 0.14, 0.3)
        send(bass_bus, bass_note(NOTE['G2'], 0.2), t + 0.25, 0.45)
    K(19.0, 0.8)
    for nm in ('G4', 'B4', 'D5', 'G5'):
        send(music, pluck(NOTE[nm], 1.2, 1.0), 19.0, 0.18, 0, rev=0.5)
    send(music, bell(NOTE['G5'], 2.4, 3.5, 1.6, 1.6), 19.0, 0.14, 0, rev=0.5)
    send(bass_bus, bass_note(NOTE['G2'], 1.0, 400), 19.0, 0.5)
    return kicks


def read_wav(path):
    import wave
    with wave.open(path, 'rb') as w:
        assert w.getframerate() == SR, f'{path}: {SR} Hz bekleniyor'
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x


def place_vo(cues, vo_path):
    """Dış sesi cümle cümle videodaki yerlerine koyar; konuşma zarfını (ducking için) döndürür."""
    src = read_wav(vo_path)
    src = hp(src, 80, 2)
    # hafif kompresör (3:1, hızlı atak): konuşma tepeleri yumuşar, ortalama seviye yükselir
    a_at, a_rel = np.exp(-1 / (0.004 * SR)), np.exp(-1 / (0.09 * SR))
    lvl = np.abs(src) / (np.max(np.abs(src)) + 1e-9)
    env = np.zeros_like(lvl); v = 0.0
    for i, x in enumerate(lvl):
        v = a_at * v + (1 - a_at) * x if x > v else a_rel * v + (1 - a_rel) * x
        env[i] = v
    thr = 0.18
    gain = np.where(env > thr, (np.maximum(env, thr) / thr) ** (1 / 3 - 1), 1.0)
    src = src * gain
    src = src / (np.max(np.abs(src)) + 1e-9) * 0.75
    out = np.zeros(N)
    for c in cues:
        if c['type'] != 'vo':
            continue
        a, b = ns(c['src0']), ns(c['src1'])
        seg = src[a:b].copy()
        fl = ns(0.012)
        seg[:fl] *= np.linspace(0, 1, fl); seg[-fl:] *= np.linspace(1, 0, fl)
        i = ns(c['t'])
        m = min(len(seg), N - i)
        out[i:i + m] += seg[:m]
    # zarf: hızlı atak, yavaş bırakma
    env = np.abs(out)
    hop = ns(0.01)
    blk = np.array([env[i:i + hop].max() for i in range(0, N, hop)])
    act = (blk > 0.02).astype(float)
    sm = np.zeros_like(act); v = 0.0
    for i, a in enumerate(act):
        v = v + (a - v) * (0.5 if a > v else 0.04)
        sm[i] = v
    duck = np.repeat(sm, hop)[:N]
    return out, duck


def main():
    cues_path, vo_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues, T = info['cues'], info['T']
    kicks = compose(T)
    for c in cues:
        typ = c['type']
        if typ == 'vo':
            continue
        if typ == 'motor':
            x, t0 = fx_motor(c['track'], c.get('gain', 0.3))
            sfx.add(x, t0)
            continue
        x = FX[typ](c)
        send(sfx, x, c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=REV.get(typ, 0.0))
    vo, vduck = place_vo(cues, vo_path)

    # sidechain 1: bas ve müzik kick'lere yer açar
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        seg = t[: N - i] if i < N else t[:0]
        d = 1 - 0.55 * np.exp(-seg[: ns(0.4)] / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)
    # sidechain 2: konuşma sırasında müzik ~9 dB, efektler ~4 dB kısılır
    mus_g = 1 - 0.8 * vduck   # ≈ -14 dB
    sfx_g = 1 - 0.6 * vduck   # ≈ -8 dB

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.0); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    bed_L = (drums.L * 0.85 + (bass_bus.L * 0.8 + music.L) * duck + vL) * mus_g + sfx.L * 0.85 * sfx_g
    bed_R = (drums.R * 0.85 + (bass_bus.R * 0.8 + music.R) * duck + vR) * mus_g + sfx.R * 0.85 * sfx_g
    bed_L, bed_R = hp(bed_L, 28), hp(bed_R, 28)
    # yatak (müzik+efekt) yumuşak limitlenir, dış ses üstüne net biçimde eklenir
    pk = max(np.max(np.abs(bed_L)), np.max(np.abs(bed_R)))
    bed_L, bed_R = np.tanh(bed_L / pk * 1.2) / np.tanh(1.2) * 0.5, np.tanh(bed_R / pk * 1.2) / np.tanh(1.2) * 0.5
    L, R = bed_L + vo * 1.3, bed_R + vo * 1.3
    pk = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / pk * 0.95, R / pk * 0.95
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.6, 0, 1) ** 1.5
    L, R = L * fade, R * fade
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    import wave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    nvo = sum(1 for c in cues if c['type'] == 'vo')
    print(f'{out}: {n / SR:.2f} sn, {len(cues) - nvo} efekt ipucu, {nvo} dış ses cümlesi')


if __name__ == '__main__':
    main()
