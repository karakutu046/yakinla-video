#!/usr/bin/env python3
"""Karakutu Muhasebe Reels filminin müziği ve ses efektleri: tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav [build/vo.wav]

- Müzik 120 BPM, 4/4. Sahne geçişleri vuruşlara, ana geçişler ölçü başlarına oturur.
  Defter (0–4): La minör, pizzicato ve saat tıkırtısı; kanca kelimeleri akor vuruşlarıyla çakılır.
  Kapanış (4–6): karanlık drone ve yükselen gerilim → 6 sn'de Do majöre açılış.
  WhatsApp ve modüller (6–32): C – G – Am – F döngüsü; sohbet anında (11–14.5) ritim yarıya iner.
  Logo (32–38): kırılma, yükseliş ve Do majör çözülme; ses logosu C5 – E5 – G5 – C6 ("ka-ra-ku-tu").
- Efektler, anim.js'in ürettiği cues.json'dan gelir; böylece her kalem, tık ve bildirim
  ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.
- Dış ses (voiceover.py) verilirse ortaya yerleşir; konuşma sürerken müzik ~8 dB, efektler ~3 dB kısılır.
"""
import json
import sys

import numpy as np
from scipy import signal

SR = 48000
DUR = 38.0
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


def fx_success():
    out = np.zeros(ns(1.6))
    for f, d in ((783.99, 0.0), (1174.66, 0.09)):
        b = bell(f, 1.4, 2.0, 1.4, 3) * 0.45
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out




def fx_scribble(dur=0.4, fast=False, loop=False):
    """Kalemin kâğıtta sürtünmesi: hızlı, düzensiz vuruşlarla açılıp kapanan tiz gürültü."""
    n = ns(dur + 0.05); t = tt(n)
    rate = 26 if fast else (9 if loop else 13)
    ph = np.cumsum(rate * (1 + 0.35 * np.sin(2 * np.pi * 1.7 * t + rng.random() * 6))) / SR
    stroke = np.abs(np.sin(np.pi * ph)) ** 0.6
    x = bp(noise(n), 1800, 7500) * 0.8 + bp(noise(n), 400, 1600) * 0.35
    env = np.clip(t / 0.02, 0, 1) * np.clip((dur + 0.05 - t) / 0.05, 0, 1)
    return x * stroke * env * (1.3 if fast else 1.0)


def fx_slap():
    n = ns(0.3); t = tt(n)
    x = hp(noise(n), 900) * np.exp(-t * 45) * 0.9 + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30) * 0.6
    return x


def fx_bookclose():
    n = ns(1.4); t = tt(n)
    f = 38 + 80 * np.exp(-t * 22)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    slap = lp(noise(n), 3500) * np.exp(-t * 30) * 0.9
    air = bp(noise(n), 200, 1200) * np.exp(-t * 8) * 0.35
    return np.tanh(1.6 * (boom + slap + air))


def fx_swish():
    return fx_whoosh(0.28, 900, 5500)


def fx_ding():
    out = np.zeros(ns(1.6))
    for f, d in ((1567.98, 0.0), (2093.0, 0.11)):
        b = bell(f, 1.3, 2.0, 0.9, 4.5) * 0.45
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_msg():
    """Gelen mesaj: yumuşak, aşağıdan yukarı iki notalı 'blup'."""
    out = np.zeros(ns(0.5))
    for f0, f1, d in ((620, 760, 0.0), (900, 1080, 0.085)):
        n = ns(0.16); t = tt(n)
        x = sine(f0 + (f1 - f0) * np.clip(t / 0.05, 0, 1), n) * np.exp(-t * 22) * adsr(n, 0.003, 1, 1, 0.02)
        out[ns(d):ns(d) + n] += x * 0.8
    return out


def fx_send():
    w = fx_whoosh(0.22, 1200, 7000) * 0.6
    p = fx_pop(1.5)
    w[0][ns(0.12):ns(0.12) + len(p)] += p[:w.shape[1] - ns(0.12)] * 0.8
    w[1][ns(0.12):ns(0.12) + len(p)] += p[:w.shape[1] - ns(0.12)] * 0.8
    return w


def fx_msgout(pitch=1.0):
    n = ns(0.22); t = tt(n)
    f = 880 * pitch * (1 + 0.5 * np.clip(t / 0.06, 0, 1))
    x = sine(f, n) * np.exp(-t * 18) * 0.7
    p = fx_pop(1.6 * pitch)
    x[:len(p)] += p[:n] * 0.3
    return x


def fx_kaching():
    out = np.zeros(ns(1.6))
    c = fx_coin(1.2); out[:len(c)] += c * 0.7
    for f, d in ((2637, 0.05), (3520, 0.1), (4186, 0.14)):
        b = bell(f, 1.2, 3.0, 1.2, 3.5) * 0.25
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    n = ns(0.5); t = tt(n)
    out[:n] += hp(noise(n), 6000) * np.exp(-t * 9) * 0.25
    return out


def fx_flutter(dur=0.45):
    """Uçan kâğıt: hızlı titreşen bant geçiren gürültü, yaklaşırken yükselir."""
    n = ns(dur); t = tt(n)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (22 + 14 * t / dur) * t))
    x = sweep_bp(noise(n), 700, 3500, 1.0, 1.0) * am * (t / dur) ** 1.5
    return x * 1.3


def fx_key():
    n = ns(0.035); t = tt(n)
    return bp(noise(n), 2500 + rng.random() * 2500, 9000) * np.exp(-t * 300) + np.sin(2 * np.pi * (1200 + rng.random() * 400) * t) * np.exp(-t * 200) * 0.3


def fx_alert():
    out = np.zeros(ns(1.2))
    for f, d in ((880.0, 0.0), (659.25, 0.12)):
        b = bell(f, 0.9, 2.0, 1.0, 5) * 0.4
        out[ns(d):ns(d) + len(b)] += b[:len(out) - ns(d)]
    return out


def fx_stamp():
    n = ns(0.5); t = tt(n)
    k = np.zeros(n); kk = kick(130, 48, 0.4, 1.2); k[:len(kk)] += kk
    return np.tanh(1.3 * (k + bp(noise(n), 200, 2500) * np.exp(-t * 35) * 0.8))


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
    'success': lambda c: fx_success(),
    'scribble': lambda c: fx_scribble(c.get('dur', 0.4), c.get('fast', False), c.get('loop', False)),
    'slap': lambda c: fx_slap(),
    'bookclose': lambda c: fx_bookclose(),
    'swish': lambda c: fx_swish(),
    'ding': lambda c: fx_ding(),
    'msg': lambda c: fx_msg(),
    'send': lambda c: fx_send(),
    'msgout': lambda c: fx_msgout(c.get('pitch', 1)),
    'kaching': lambda c: fx_kaching(),
    'flutter': lambda c: fx_flutter(c.get('dur', 0.45)),
    'key': lambda c: fx_key(),
    'alert': lambda c: fx_alert(),
    'stamp': lambda c: fx_stamp(),
}
REV = {'slam': 0.25, 'impact': 0.35, 'success': 0.3, 'shimmer': 0.4, 'sparkle': 0.4, 'shine': 0.4, 'coin': 0.15,
       'pop': 0.12, 'crinkle': 0.1, 'whoosh': 0.1, 'thump': 0.15, 'bookclose': 0.3, 'ding': 0.3, 'kaching': 0.3,
       'alert': 0.25, 'stamp': 0.2, 'msg': 0.15, 'msgout': 0.15}


# ───────────────────────── beste ─────────────────────────
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def hz(name):
    """'A4' → 440 Hz, 'G#3' → …"""
    note, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NAMES.index(note) + 12 * (octave + 1) - 69) / 12)


f = lambda *names: [hz(x) for x in names]
CH = {'Am': ['A3', 'C4', 'E4', 'A4'], 'F': ['F3', 'A3', 'C4', 'F4'], 'G': ['G3', 'B3', 'D4', 'G4'],
      'C': ['C4', 'E4', 'G4', 'C5'], 'E': ['E3', 'G#3', 'B3', 'E4'], 'Gsus': ['G3', 'C4', 'D4', 'G4'],
      'Cmaj9': ['C4', 'E4', 'G4', 'B4', 'D5']}
ROOT = {'Am': 'A1', 'F': 'F1', 'G': 'G1', 'C': 'C2', 'E': 'E1', 'Gsus': 'G1', 'Cmaj9': 'C2'}
ARP = {'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['F4', 'A4', 'C5', 'F5'], 'G': ['G4', 'B4', 'D5', 'G5'], 'C': ['C5', 'E5', 'G5', 'C6']}
PROG = [(6, 'C'), (8, 'G'), (10, 'Am'), (12, 'F'), (14, 'C'), (16, 'G'), (18, 'Am'), (20, 'F'),
        (22, 'C'), (24, 'G'), (26, 'Am'), (28, 'F'), (30, 'G')]
CHAT = (11.0, 14.5)      # sohbet: yarım ritim
MODHITS = [20.0, 22.5, 25.0, 27.5, 30.0]


def chord_at(t):
    c = 'C'
    for b, ch in PROG:
        if t >= b:
            c = ch
    return c


def compose():
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    # ── Defter (0–4): La minör pizzicato, saat tıkırtısı
    pat = {'Am': ['A3', 'E4', 'A4', 'E4', 'C5', 'E4', 'A4', 'E4'], 'F': ['F3', 'C4', 'F4', 'C4', 'A4', 'C4', 'F4', 'C4']}
    for bar, ch in ((0, 'Am'), (1, 'F')):
        for i, nm in enumerate(pat[ch]):
            t = bar * 2 + i * 0.25
            if t >= 2.0:
                break
            send(music, pluck(hz(nm), 0.3, 0.7), t, 0.2, -0.25 if i % 2 else 0.25, rev=0.2)
    for i in range(8):
        send(drums, fx_tick(1.25 if i % 2 == 0 else 0.95), i * 0.25, 0.22, 0.35 if i % 2 else -0.35)
    send(bass_bus, bass_note(hz('A1'), 0.5, 300), 0.0, 0.55)
    send(bass_bus, bass_note(hz('A1'), 0.3, 300), 1.0, 0.4)
    K(0.0, 0.5); K(1.0, 0.4)
    send(music, pad(f(*CH['Am']), 1.8, cut=700, att=0.6, rel=0.3), 0.0, 0.6)
    # kanca: dört kelime, dört akor vuruşu
    for t, ch in ((2.0, 'F'), (2.25, 'F'), (2.5, 'G'), (2.75, 'E')):
        for nm in CH[ch][1:]:
            send(music, pluck(hz(nm), 0.4, 1.3), t, 0.24, 0, rev=0.3)
        send(bass_bus, bass_note(hz(ROOT[ch]) * 2, 0.22, 700), t, 0.75)
    # gerilim: E akoru tremolo
    for i in range(8):
        t = 3.0 + i * 0.0625
        send(music, pluck(hz(['E4', 'G#4', 'B4'][i % 3]), 0.2, 1.0), t, 0.1 + 0.02 * i, 0.3 if i % 2 else -0.3)
    send(bass_bus, bass_note(hz('E1'), 0.9, 300), 3.0, 0.6)
    n = ns(0.5); tr = tt(n) / 0.5
    send(sfx, sweep_bp(noise(n), 300, 6000, 1.5, 0.8) * tr ** 2 * 0.5, 3.5, 0.6)

    # ── Kapanış (4–6): karanlık drone, yükseliş
    send(music, pad(f('A2', 'E3', 'A3'), 2.0, cut=500, att=0.05, rel=0.3), 4.0, 1.1)
    n = ns(2.0); t2 = tt(n)
    send(bass_bus, np.sin(2 * np.pi * 55 * t2) * np.exp(-t2 * 1.2) * 0.7, 4.0, 0.8)
    n = ns(1.0); tr = tt(n)
    riser = sine(220 + 660 * tr ** 2, n) * tr ** 2 * 0.15 + sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.5
    send(sfx, riser, 5.0, 0.8)
    roll = [5.0 + i * 0.125 for i in range(4)] + [5.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.2 + 0.8 * j / len(roll)), t, 0.35, 0, rev=0.2)

    # ── Groove (6–32): C – G – Am – F
    for bar, ch in PROG:
        dur = 2.0
        cut = 1700 if bar < 19.5 else 2600
        if CHAT[0] <= bar < CHAT[1]:
            cut = 1500
        send(music, pad(f(*CH[ch]), dur, cut=cut, att=0.04, rel=0.35), bar, 1.5 if CHAT[0] <= bar < CHAT[1] else 0.9)
        root = hz(ROOT[ch]) * 2
        for k in range(4):
            t = bar + k * 0.5
            if CHAT[0] <= t < CHAT[1]:
                send(bass_bus, bass_note(root, 0.48, 380), t, 0.65 if k in (0, 2) else 0.45)
                continue
            send(bass_bus, bass_note(root, 0.22), t + 0.25, 0.7)
            if k == 0:
                send(bass_bus, bass_note(root, 0.18), t, 0.45)
    t = 6.0
    while t < 32.0 - 1e-6:
        beat = round((t - 6.0) / 0.5)
        chat = CHAT[0] <= t < CHAT[1]
        if chat:  # yarım ritim: 1 ve 3'te kick, 3'te alçak clap
            if beat % 2 == 0:
                K(t, 0.75)
            if beat % 4 == 2:
                send(drums, clap(), t, 0.32, 0, rev=0.35)
        else:
            K(t)
            if beat % 2 == 1:
                send(drums, clap(), t, 0.5 if t < 19.5 else 0.58, 0, rev=0.25)
        t += 0.5
    # hi-hat'ler
    t = 6.0
    while t < 32.0 - 1e-6:
        i = round((t - 6.0) / 0.125)
        chat = CHAT[0] <= t < CHAT[1]
        if t >= 19.5:
            if i % 4 == 2:
                send(drums, hat(True), t, 0.18, 0.25)
            else:
                send(drums, hat(), t, 0.12 if i % 2 else 0.07, -0.25 if i % 2 else 0.25)
        elif i % 4 == 2:
            send(drums, hat(), t, 0.16 if chat else 0.28, 0.3)
        elif chat and i % 2 == 0:
            send(drums, hat(), t, 0.07, -0.3)
        elif i % 2 == 0 and t >= 8.0 and not chat:
            send(drums, hat(), t, 0.1, -0.3)
        t += 0.125
    # arpejler: WhatsApp bölümünde yumuşak, modüllerde parlak
    t = 8.0
    while t < 32.0 - 1e-6:
        i = round((t - 8.0) / 0.25)
        ch = chord_at(t)
        nm = ARP[ch][[0, 1, 2, 3, 2, 1][i % 6]]
        chat = CHAT[0] <= t < CHAT[1]
        if chat:
            if i % 2 == 0:
                send(music, bell(hz(nm), 0.9, 3.5, 0.8, 4), t, 0.12, -0.3 if i % 4 else 0.3, rev=0.4)
        elif t >= 19.5:
            send(music, pluck(hz(nm), 0.25, 1.2), t, 0.1, -0.4 if i % 2 else 0.4, rev=0.3)
        elif t >= 14.5:
            send(music, pluck(hz(nm), 0.3, 0.9), t, 0.08, -0.35 if i % 2 else 0.35, rev=0.3)
        t += 0.25
    # modül vuruşları: kısa akor darbesi + crash
    for h in MODHITS:
        for nm in CH[chord_at(h)][1:]:
            send(music, pluck(hz(nm) * 2, 0.35, 1.4), h, 0.14, 0, rev=0.3)
    send(drums, crash(2.0), 19.5, 0.5)
    send(drums, crash(1.6), 14.5, 0.3)
    # 31–32: trampet rulosu
    roll = [31.0 + i * 0.125 for i in range(4)] + [31.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.25 + 0.75 * j / len(roll)), t, 0.35, 0, rev=0.2)

    # ── Logo (32–38): kırılma → Do majör
    send(music, pad(f(*CH['Gsus']), 2.0, cut=2400, att=0.3, rel=0.2), 32.0, 0.9)
    send(bass_bus, bass_note(hz('G2'), 1.8, 260), 32.0, 0.4)
    n = ns(1.4); tr = tt(n) / 1.4
    send(sfx, sine(300 + 900 * tr ** 2, n) * tr ** 2 * 0.15 + sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.45, 32.6, 0.6)
    roll = [33.0 + i * 0.125 for i in range(4)] + [33.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.25 + 0.75 * j / len(roll)), t, 0.4, 0, rev=0.2)
    K(34.0, 1.15)
    send(music, pad(f(*CH['Cmaj9']), 3.4, cut=3200, att=0.02, rel=1.0), 34.0, 1.15)
    send(bass_bus, bass_note(hz('C2'), 1.2, 450), 34.0, 0.65)
    for t, nm in ((34.25, 'C5'), (34.375, 'E5'), (34.5, 'G5'), (34.75, 'C6')):
        send(music, bell(hz(nm), 2.6, 3.5, 2.0, 1.5), t, 0.34, 0, rev=0.5)
        send(music, pluck(hz(nm) / 2, 0.5, 1.2), t, 0.15, 0, rev=0.3)
    send(music, bell(hz('G6'), 2.0, 3.5, 1.3, 2.0), 34.75, 0.1, 0.3, rev=0.6)
    for t, v in ((35.0, 0.6), (36.0, 0.75), (37.0, 0.5)):
        K(t, v)
        send(bass_bus, bass_note(hz('C2'), 0.6, 450), t, 0.4)
    for i in range(24):
        t = 35.0 + i * 0.125
        send(drums, hat(), t, 0.07 if i % 2 else 0.04, 0.3 if i % 2 else -0.3)
    for nm in ('C4', 'E4', 'G4', 'C5'):
        send(music, pluck(hz(nm), 1.4, 1.0), 36.0, 0.17, 0, rev=0.5)
    send(music, bell(hz('C6'), 2.0, 3.5, 1.4, 1.8), 36.0, 0.12, 0, rev=0.5)
    return kicks


def load_vo(path):
    import wave
    with wave.open(path, 'rb') as w:
        assert w.getframerate() == SR and w.getnchannels() == 1, 'dış ses 48 kHz mono olmalı'
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    out = np.zeros(N)
    out[:min(N, len(x))] = x[:N]
    return out


def follower(x, attack=0.012, release=0.32, look=0.06):
    """Dış sesin zarfı (0..1): hızlı açılır, yavaş kapanır; müzik konuşmadan biraz önce kısılmaya başlar."""
    hop = ns(0.005)
    fr = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same')[::hop])
    a, r = np.exp(-0.005 / attack), np.exp(-0.005 / release)
    env = np.zeros_like(fr); e = 0.0
    for i, v in enumerate(fr):
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        env[i] = e
    env = np.clip(env / (10 ** (-30 / 20)), 0, 1)
    env = np.interp(np.arange(N), np.arange(len(env)) * hop, env)
    k = ns(look)
    return np.concatenate([env[k:], np.zeros(k)])


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    vo = load_vo(sys.argv[3]) if len(sys.argv) > 3 else None
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
        seg = t[: N - i] if i < N else t[:0]
        d = 1 - 0.55 * np.exp(-seg[: ns(0.4)] / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.2); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.55
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.55

    dm = ds = 1.0
    if vo is not None:  # dış ses konuşurken müzik ve efektler geri çekilir
        e = follower(vo)
        dm, ds = 1 - 0.6 * e, 1 - 0.3 * e
        # seviye: konuşma, müziğin ortalamasından 3 dB yukarıda (müzik ayrıca ~8 dB kısılır)
        bed = (drums.L + drums.R) * 0.425 + (bass_bus.L + bass_bus.R + (music.L + music.R) / 0.85) * 0.425 * duck + (sfx.L + sfx.R) / 2
        vo = vo * np.sqrt(np.mean(bed ** 2)) * 10 ** (3 / 20) / (np.sqrt(np.mean(vo[e > 0.5] ** 2)) + 1e-9)
        vL += signal.fftconvolve(vo * 0.06, irL)[:N] * 0.55
        vR += signal.fftconvolve(vo * 0.06, irR)[:N] * 0.55
    L = (drums.L * 0.85 + (bass_bus.L * 0.85 + music.L) * duck) * dm + sfx.L * ds + vL
    R = (drums.R * 0.85 + (bass_bus.R * 0.85 + music.R) * duck) * dm + sfx.R * ds + vR
    if vo is not None:
        L, R = L + vo, R + vo
    # alçak frekans temizliği + yumuşak limit
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)
    # son: 37.2 sn'den itibaren yumuşak kapanış, tam DUR'da kes
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.8, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    import wave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
