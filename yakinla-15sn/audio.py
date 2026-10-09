#!/usr/bin/env python3
"""Yakınla "Tek kapı, sekiz dünya": müzik ve ses efektleri, tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav

- 128 BPM, 4/4, 8 ölçü = tam 15,0 sn. Her dünya bir ölçü, her geçiş ölçü başında.
  Akorlar: Am (kapı, giriş) → F (kâğıt) → G (reyon) → Am (sıvı) → F (fizik) → G (tek çizgi)
  → Am Am F G (tipografi vuruşları) → C (logo, çözülme).
- Her dünyanın kendi enstrüman rengi var: kâğıtta marimba, reyonda parlak arpej, suda damla
  sesleri ve su altı boğukluğu (alçak geçiren filtre), fizikte zıplayan bas, çizgide yalın sinüs.
- Ses logosu: logo inerken E5 – G5 – C6 ("Ya-kın-la").
- Efektler anim'in ürettiği cues.json'dan gelir: her vuruş, kâğıt, damla ve tık ekrandaki
  hareketle aynı karede ve aynı yönde (pan) duyulur. Kalemin sesi ekrandaki ucunu izler.
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
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)


def bt(n):
    return n * BEAT


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
        if zi is None:
            zi = np.zeros((s.shape[0], 2))
        out[i:i + ch], zi = signal.sosfilt(s, x[i:i + ch], zi=zi)
    return out


def tv_lowpass(x, fc_of_t, ch=512):
    """Zamanla değişen alçak geçiren (su altı boğukluğu)."""
    out = np.zeros_like(x)
    zi = np.zeros((1, 2))
    for i in range(0, len(x), ch):
        fc = fc_of_t(i / SR)
        s = sos('low', min(fc, SR / 2 - 200), 2)
        out[i:i + ch], zi = signal.sosfilt(s, x[i:i + ch], zi=zi)
    return out


def pan2(x, pan):
    return np.vstack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)]) * 1.4142


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
            xl, xr = pan2(x, pan)
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


def marimba(f, dur=0.6):
    """Kâğıt dünyası: tahta tınısı (sinüs + 4. kısmi, hızlı sönüm)."""
    n = ns(dur); t = tt(n)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 30)
    x += 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    return x * adsr(n, 0.001, 1, 1, 0.02)


def droplet(f, dur=0.35):
    """Su dünyası: perdesi yukarı kayan damla tınısı."""
    n = ns(dur); t = tt(n)
    fr = f * (1 + 0.6 * np.clip(t / 0.03, 0, 1))
    return sine(fr, n) * np.exp(-t * 11) * adsr(n, 0.002, 1, 1, 0.03)


def ink(f, dur=0.5):
    """Çizgi dünyası: yalın, hafif sinüs (+ oktav)."""
    n = ns(dur); t = tt(n)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 8)) * np.exp(-t * 6) * adsr(n, 0.003, 1, 1, 0.03)


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


def fx_click():
    n = ns(0.08); t = tt(n)
    return bp(noise(n), 2000, 9000) * np.exp(-t * 220) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5


def fx_whoosh(dur=0.35, f0=500, f1=5000):
    n = ns(dur); t = tt(n) / dur
    env = np.sin(np.pi * np.clip(t, 0, 1) ** 0.75) ** 2
    L = sweep_bp(noise(n), f0, f1, 1.0, 0.9) * env
    R = sweep_bp(noise(n), f0 * 1.05, f1 * 1.05, 1.0, 0.9) * env
    return np.vstack([L, R]) * 1.6


def fx_thud(pitch=1.0):
    n = ns(0.3); t = tt(n)
    f = (45 + 90 * np.exp(-t * 25)) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) + lp(noise(n), 900) * np.exp(-t * 40) * 0.5


def fx_crinkle(dur=0.4):
    """Paket hışırtısı: sık, kısa, tiz gürültü patlamaları."""
    n = ns(dur + 0.05)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(max(3, int(dur * 70))):
        t0 = rng.random() * dur
        m = ns(0.004 + rng.random() * 0.01)
        b = bp(noise(m), 2500 + rng.random() * 3000, 9000 + rng.random() * 6000) * np.exp(-tt(m) * (300 + rng.random() * 300))
        b *= (0.3 + rng.random()) * (1 - t0 / dur * 0.6)
        i = ns(t0); pan = rng.uniform(-0.5, 0.5)
        L[i:i + m] += b * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += b * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R]) * 1.2


def fx_slam():
    n = ns(0.7); t = tt(n)
    k = np.zeros(n); kk = kick(170, 46, 0.5, 1.5); k[:len(kk)] += kk
    wood = (np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30) + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t * 45)) * 0.6
    nz = lp(noise(n), 4000) * np.exp(-t * 20) * 0.5
    rattle = bp(noise(n), 1500, 6000) * np.exp(-t * 9) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 34 * t))) * 0.12
    sub = np.sin(2 * np.pi * 48 * t) * np.exp(-t * 5) * 0.6
    return np.tanh(1.2 * (k + wood + nz + rattle + sub))


def fx_zip(dur=0.44, down=False):
    n = ns(dur); t = tt(n) / dur
    shape = np.sin(np.pi * np.clip(t, 0, 1)) ** 1.5
    f = (1700 - 1300 * t) if down else (320 + 1300 * shape)
    return sine(f, n) * 0.5 * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.5


def fx_impact(big=False):
    d = 2.6 if big else 1.6
    n = ns(d); t = tt(n)
    f = 34 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 3.4))
    nz = lp(noise(n), 3500) * np.exp(-t * 9) * 0.6
    x = np.tanh(1.4 * (boom + nz))
    if big:
        c = crash(2.4); x[:len(c)] += c * 0.9
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


def fx_knock():
    """Ahşap kapıya parmak boğumu: iki rezonans + tık + kapının gövde gümbürtüsü."""
    n = ns(0.4); t = tt(n)
    body = np.sin(2 * np.pi * 168 * t) * np.exp(-t * 26) + 0.55 * np.sin(2 * np.pi * 415 * t) * np.exp(-t * 42) + 0.25 * np.sin(2 * np.pi * 790 * t) * np.exp(-t * 70)
    click = bp(noise(n), 900, 4500) * np.exp(-t * 230) * 0.9
    thump = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t * 40)) / SR) * np.exp(-t * 13) * 0.8
    return np.tanh(1.5 * (body + click + thump))


def fx_creak(dur=0.27):
    """Menteşe gıcırtısı: takılıp kayan (stick-slip) testere dalgası."""
    n = ns(dur); t = tt(n)
    f = 85 + 70 * (t / dur) + 18 * np.sin(2 * np.pi * 6 * t) + 25 * lp(noise(n), 25)
    x = saw(f, n) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 17 * t)))
    x = bp(x, 550, 2800, 2) + 0.3 * bp(x, 2800, 5000)
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6 * 1.3


def fx_flap(pitch=1.0):
    """Kâğıt katlanıp açılırken: kısa hava darbesi + kâğıt hışırtısı."""
    n = ns(0.18); t = tt(n)
    whump = lp(noise(n), 900 * pitch) * np.exp(-t * 32) * 1.4
    snap = bp(noise(n), 2500 * pitch, 8000) * np.exp(-t * 90) * 0.5
    return (whump + snap) * adsr(n, 0.004, 1, 1, 0.02)


def fx_drip(pitch=1.0):
    n = ns(0.12); t = tt(n)
    f = 650 * pitch * (1 + 1.6 * np.clip(t / 0.035, 0, 1))
    return sine(f, n) * np.exp(-t * 45) * adsr(n, 0.001, 1, 1, 0.01)


def fx_bloop(pitch=1.0):
    n = ns(0.22); t = tt(n)
    f = 230 * pitch * (1 + 2.2 * np.clip(t / 0.06, 0, 1))
    return sine(f, n) * np.exp(-t * 18) * adsr(n, 0.002, 1, 1, 0.02) * 1.2


def fx_bubbles(dur=1.0, dens=34):
    n = ns(dur + 0.2)
    L, R = np.zeros(n), np.zeros(n)
    for _ in range(int(dens * dur)):
        b = fx_drip(0.6 + rng.random() * 1.4) * (0.15 + rng.random() * 0.35)
        i = ns(rng.random() * dur); pan = rng.uniform(-0.9, 0.9)
        m = min(len(b), n - i)
        L[i:i + m] += b[:m] * np.cos((pan + 1) * np.pi / 4)
        R[i:i + m] += b[:m] * np.sin((pan + 1) * np.pi / 4)
    return np.vstack([L, R])


def fx_splash():
    n = ns(1.4); t = tt(n)
    burst = lp(noise(n), 7000) * np.exp(-t * 6) * (1 - np.exp(-t * 200))
    body = bp(noise(n), 200, 1500) * np.exp(-t * 4) * 0.7
    boom = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 10)) / SR) * np.exp(-t * 4) * 0.8
    x = np.tanh(1.2 * (burst + body + boom))
    b = fx_bubbles(0.8, 40)
    out = np.vstack([x, x]) * 0.9
    out[:, ns(0.1):ns(0.1) + b.shape[1]] += b[:, :n - ns(0.1)] * 0.8
    return out


def fx_roar(dur=0.7):
    """Koridordan gelen dalga: yükselen, kabaran gürültü."""
    n = ns(dur); t = tt(n) / dur
    L = sweep_bp(noise(n), 250, 3500, 1.4, 1.2) * t ** 2
    R = sweep_bp(noise(n), 260, 3600, 1.4, 1.2) * t ** 2
    rum = lp(noise(n), 160) * t ** 1.5 * 2.5
    return np.vstack([L + rum, R + rum]) * 1.3


def fx_wind(dur=1.6):
    """Reyonda hızlanma: sürekli, perdesi yükselen rüzgâr."""
    n = ns(dur); t = tt(n) / dur
    env = np.clip(t * 4, 0, 1) * (0.3 + 0.7 * t ** 1.5)
    L = sweep_bp(noise(n), 300, 2600, 1.2, 0.8) * env
    R = sweep_bp(noise(n), 320, 2700, 1.2, 0.8) * env
    return np.vstack([L, R])


def fx_drain(dur=0.5):
    """Su çekilir: aşağı inen girdap + guruldama."""
    n = ns(dur); t = tt(n) / dur
    x = sweep_bp(noise(n), 1800, 220, 0.8, 0.9) * np.sin(np.pi * np.clip(t, 0, 1)) * 1.4
    g = np.zeros(n)
    for _ in range(14):
        b = fx_bloop(0.4 + rng.random() * 0.8) * 0.4
        i = ns(rng.random() * dur * 0.9); m = min(len(b), n - i); g[i:i + m] += b[:m]
    return x + g


def fx_scribble(dur=0.45):
    n = ns(dur); t = tt(n)
    sp = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t + 3 * np.sin(2 * np.pi * 2 * t)))
    grain = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 70 * t + 5 * lp(noise(n), 20)))
    return bp(noise(n), 1800, 6500) * sp * grain * np.sin(np.pi * t / dur) * 0.8


def fx_pen(track, gain):
    """Kalemin kâğıda sürtünmesi: hız arttıkça güçlenir, ekrandaki uca göre sağ-sol kayar."""
    tr = np.array(track)
    t0, t1 = tr[0, 0], tr[-1, 0]
    n = ns(t1 - t0 + 0.05); t = t0 + tt(n)
    pan = np.interp(t, tr[:, 0], tr[:, 1])
    spd = np.interp(t, tr[:, 0], tr[:, 2])
    grain = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 85 * tt(n) + 6 * lp(noise(n), 18)))
    x = bp(noise(n), 1600, 6200) * grain * np.clip(spd, 0, 1.6) ** 0.7 + bp(noise(n), 500, 1200) * np.clip(spd, 0, 1) * 0.25
    env = np.clip(tt(n) / 0.03, 0, 1) * np.clip((t1 - t) / 0.05, 0, 1)
    x *= env * gain
    return np.vstack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)]) * 1.4142, t0


FX = {
    'tick': lambda c: fx_tick(c.get('pitch', 1)),
    'pop': lambda c: fx_pop(c.get('pitch', 1)),
    'blip': lambda c: fx_blip(c.get('pitch', 1)),
    'click': lambda c: fx_click(),
    'whoosh': lambda c: fx_whoosh(c.get('dur', 0.35), c.get('f0', 500), c.get('f1', 5000)),
    'thud': lambda c: fx_thud(c.get('pitch', 1)),
    'crinkle': lambda c: fx_crinkle(c.get('dur', 0.4)),
    'slam': lambda c: fx_slam(),
    'zip': lambda c: fx_zip(c.get('dur', 0.44), c.get('down', False)),
    'impact': lambda c: fx_impact(c.get('big', False)),
    'thump': lambda c: fx_thump(),
    'shimmer': lambda c: fx_shimmer(c.get('dur', 0.6)),
    'sparkle': lambda c: fx_shimmer(c.get('dur', 1.0), 40, 3000, 9000),
    'sweep': lambda c: fx_sweep(c.get('dur', 0.6)),
    'reverse': lambda c: fx_reverse(c.get('dur', 0.5)),
    'shine': lambda c: fx_shine(c.get('dur', 0.45)),
    'knock': lambda c: fx_knock(),
    'creak': lambda c: fx_creak(c.get('dur', 0.27)),
    'flap': lambda c: fx_flap(c.get('pitch', 1)),
    'drip': lambda c: fx_drip(c.get('pitch', 1)),
    'bloop': lambda c: fx_bloop(c.get('pitch', 1)),
    'bubbles': lambda c: fx_bubbles(c.get('dur', 1.0)),
    'splash': lambda c: fx_splash(),
    'roar': lambda c: fx_roar(c.get('dur', 0.7)),
    'wind': lambda c: fx_wind(c.get('dur', 1.6)),
    'drain': lambda c: fx_drain(c.get('dur', 0.5)),
    'scribble': lambda c: fx_scribble(c.get('dur', 0.45)),
}
REV = {'slam': 0.22, 'impact': 0.3, 'shimmer': 0.4, 'sparkle': 0.4, 'shine': 0.4, 'pop': 0.12, 'crinkle': 0.08,
       'whoosh': 0.1, 'thump': 0.15, 'knock': 0.35, 'flap': 0.12, 'bloop': 0.25, 'drip': 0.3, 'splash': 0.2, 'click': 0.12}


# ───────────────────────── beste ─────────────────────────
NOTE = {
    'A1': 55.0, 'C2': 65.41, 'F2': 87.31, 'G2': 98.0, 'A2': 110.0, 'C3': 130.81, 'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.0, 'B5': 987.77, 'C6': 1046.5, 'E6': 1318.5, 'G6': 1568.0,
}
CH = {'Am': ['A3', 'C4', 'E4', 'G4'], 'F': ['F3', 'A3', 'C4', 'E4'], 'G': ['G3', 'B3', 'D4', 'G4'], 'C': ['C4', 'E4', 'G4', 'B4']}
ROOT = {'Am': 'A2', 'F': 'F2', 'G': 'G2', 'C': 'C3'}
ARP = {'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['F4', 'A4', 'C5', 'E5'], 'G': ['G4', 'B4', 'D5', 'G5'], 'C': ['C5', 'E5', 'G5', 'C6']}
f = lambda *names: [NOTE[x] for x in names]


def compose():
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, kick(), t, 0.95 * v)

    def groove(b0, hats16=False, clapv=0.55, skip_last=False):
        for k in range(4):
            t = bt(b0 + k)
            if skip_last and k == 3:
                continue
            K(t)
            if k % 2 == 1:
                send(drums, clap(), t, clapv, 0, rev=0.22)
        step = 0.25 if hats16 else 0.5
        for i in range(int(4 / step)):
            tb = b0 + i * step
            if skip_last and tb >= b0 + 3:
                break
            if not hats16 and i % 2 == 0:
                continue
            on = (i * step) % 1 == 0.5
            send(drums, hat(), bt(tb), 0.30 if on else 0.12, 0.3 if on else -0.3)

    def bassline(b0, ch, kind='off', beats=4):
        root = NOTE[ROOT[ch]]
        for k in range(beats):
            t = bt(b0 + k)
            if kind == 'off':
                send(bass_bus, bass_note(root, BEAT * 0.45), t + BEAT / 2, 0.75)
                if k == 0:
                    send(bass_bus, bass_note(root, BEAT * 0.4), t, 0.45)
            elif kind == 'roll':
                for s in range(4):
                    send(bass_bus, bass_note(root * (2 if s == 2 else 1), BEAT * 0.22, 600), t + s * BEAT / 4, 0.55 if s % 2 else 0.4)
            elif kind == 'bounce':
                send(bass_bus, bass_note(root, BEAT * 0.4, 500), t, 0.6)
                send(bass_bus, bass_note(root * 2, BEAT * 0.35, 700), t + BEAT / 2, 0.55)
            elif kind == 'long':
                if k % 2 == 0:
                    send(bass_bus, bass_note(root, BEAT * 1.8, 350), t, 0.55)

    # ── 1 · Kapı (0–1.875): davul yok, kapı vuruşları ritmi tutar
    send(music, pad(f(*CH['Am']), BAR, cut=700, att=1.0, rel=0.3), 0.0, 0.7)
    n = ns(BAR); sub = np.sin(2 * np.pi * NOTE['A1'] * tt(n)) * np.clip(tt(n) / 0.8, 0, 1) * 0.25
    send(bass_bus, sub, 0.0, 1.0)
    send(music, pluck(NOTE['E5'], 0.4, 1.1), bt(3), 0.32, 0.1, rev=0.4)       # "Kim"
    send(music, pluck(NOTE['A5'], 0.5, 1.1), bt(3.5), 0.34, 0.1, rev=0.45)    # "o?"
    send(sfx, fx_reverse(0.5), T_PAPER - 0.5, 0.45)
    nr = ns(0.75); tr = tt(nr) / 0.75
    send(sfx, sweep_bp(noise(nr), 400, 7000, 1.5, 0.8) * tr ** 2 * 0.45, T_PAPER - 0.75, 0.7)

    # ── 2 · Kâğıt (F): marimba arpeji
    b = 4
    K(bt(b), 1.1); send(drums, crash(1.8), bt(b), 0.35)
    groove(b)
    send(music, pad(f(*CH['F']), BAR, cut=1600, att=0.03, rel=0.3), bt(b), 0.8)
    bassline(b, 'F')
    for i in range(16):
        nm = ARP['F'][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
        send(music, marimba(NOTE[nm]), bt(b + i / 4), 0.22 if i % 4 else 0.3, -0.35 if i % 2 else 0.35, rev=0.2)

    # ── 3 · Reyon (G): 16'lık hi-hat, yuvarlanan bas, parlak arpej, sonda trampet rulosu
    b = 8
    groove(b, hats16=True)
    send(music, pad(f(*CH['G']), BAR, cut=2400, att=0.03, rel=0.3), bt(b), 0.85)
    bassline(b, 'G', 'roll')
    for i in range(16):
        nm = ARP['G'][[0, 1, 2, 3][i % 4]]
        send(music, pluck(NOTE[nm] * (2 if i >= 8 else 1), 0.25, 1.2), bt(b + i / 4), 0.13, -0.4 if i % 2 else 0.4, rev=0.25)
    roll = [bt(b + 2 + i * 0.25) for i in range(4)] + [bt(b + 3 + i * 0.125) for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.25 + 0.75 * j / len(roll)), t, 0.38, 0, rev=0.2)

    # ── 4 · Sıvı (Am): damla arpeji; su altında bütün müzik boğuklaşır (main'de)
    b = 12
    K(bt(b), 1.1); send(drums, crash(2.0), bt(b), 0.4)
    groove(b, skip_last=True)
    send(music, pad(f(*CH['Am']), BAR, cut=1800, att=0.03, rel=0.4), bt(b), 0.9)
    bassline(b, 'Am')
    for i in range(14):
        nm = ARP['Am'][[0, 2, 1, 3, 2, 0, 3, 1][i % 8]]
        send(music, droplet(NOTE[nm]), bt(b + i / 4), 0.22, -0.5 if i % 2 else 0.5, rev=0.35)

    # ── 5 · Fizik (F): tam enerji, zıplayan bas, offbeat akor vuruşları
    b = 16
    K(bt(b), 1.1); send(drums, crash(1.8), bt(b), 0.35)
    groove(b, hats16=True, clapv=0.6)
    send(music, pad(f(*CH['F']), BAR, cut=2200, att=0.02, rel=0.3), bt(b), 0.8)
    bassline(b, 'F', 'bounce')
    for k in range(4):
        for nm in ARP['F'][:3]:
            send(music, pluck(NOTE[nm], 0.22, 1.3), bt(b + k + 0.5), 0.12, 0, rev=0.2)

    # ── 6 · Tek çizgi (G): hafif, yalın; sonda trampet rulosu
    b = 20
    K(bt(b), 1.0); K(bt(b + 2), 0.8)
    for i in range(16):
        send(drums, hat(), bt(b + i / 4), 0.09 if i % 2 else 0.05, 0.3 if i % 2 else -0.3)
    send(music, pad(f(*CH['G']), BAR, cut=1300, att=0.05, rel=0.3), bt(b), 0.6)
    bassline(b, 'G', 'long')
    for i, nm in enumerate(['G5', 'D5', 'B4', 'D5', 'G5', 'B5', 'A5', 'D5']):
        send(music, ink(NOTE[nm]), bt(b + i / 2), 0.2, -0.3 if i % 2 else 0.3, rev=0.35)
    roll = [bt(b + 3 + i * 0.125) for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, snare(0.2 + 0.8 * j / len(roll)), t, 0.4, 0, rev=0.2)

    # ── 7 · Tipografi: her satır bir vuruş; Am Am F G
    b = 24
    for k, ch in enumerate(['Am', 'Am', 'F', 'G']):
        t = bt(b + k)
        K(t, 1.1)
        if k in (0, 3):
            send(drums, crash(1.6), t, 0.35)
        send(drums, clap(), t, 0.4, 0, rev=0.3)
        for nm in CH[ch]:
            send(music, pluck(NOTE[nm], 0.45, 1.4), t, 0.16, 0, rev=0.3)
            send(music, pluck(NOTE[nm] * 2, 0.3, 1.4), t, 0.07, 0, rev=0.3)
        send(bass_bus, bass_note(NOTE[ROOT[ch]], BEAT * 0.8, 650), t, 0.75)
        for s in (1, 2, 3):
            send(drums, hat(), t + s * BEAT / 4, 0.1, 0.25 if s % 2 else -0.25)
    send(sfx, fx_reverse(0.3), T_LOGO - 0.3, 0.4)

    # ── 8 · Logo (C): çözülme, ses logosu "Ya-kın-la"
    b = 28
    K(bt(b), 1.15); send(drums, crash(2.4), bt(b), 0.4)
    send(music, pad(f('C4', 'E4', 'G4', 'D5'), 1.9, cut=3200, att=0.02, rel=0.6), bt(b), 1.1)
    send(bass_bus, bass_note(NOTE['C3'], 0.8, 500), bt(b), 0.6)
    for t, nm in ((bt(29), 'E5'), (bt(29.5), 'G5'), (bt(30), 'C6')):
        send(music, bell(NOTE[nm], 2.4, 3.5, 2.2, 1.5), t, 0.36, 0, rev=0.5)
        send(music, pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.15, 0, rev=0.3)
    send(music, bell(NOTE['G6'], 1.6, 3.5, 1.4, 2.2), bt(30), 0.1, 0.3, rev=0.6)
    K(bt(30), 0.75)
    send(bass_bus, bass_note(NOTE['C2'] * 2, 0.9, 400), bt(30), 0.5)
    for nm in ('C4', 'E4', 'G4', 'C5'):
        send(music, pluck(NOTE[nm], 1.2, 1.0), bt(30), 0.16, 0, rev=0.5)
    for i in range(8):
        send(drums, hat(), bt(30 + i / 4), 0.07 if i % 2 else 0.04, 0.3 if i % 2 else -0.3)
    return kicks


T_PAPER = BAR
T_LIQUID = 3 * BAR
T_LOGO = 7 * BAR


def underwater_fc(t):
    """Su altı: 5.95 sn'den itibaren kesim 450 Hz'e iner, 7.0'dan sonra açılır."""
    if t < 5.95 or t > 7.4:
        return 19000.0
    if t < 6.2:
        p = (t - 5.95) / 0.25
        return 19000 * (450 / 19000) ** p
    if t < 7.0:
        return 450.0
    p = (t - 7.0) / 0.4
    return 450 * (19000 / 450) ** p


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    info = json.load(open(cues_path, encoding='utf-8'))
    cues = info['cues'] if isinstance(info, dict) else info
    kicks = compose()
    for c in cues:
        typ = c['type']
        if typ == 'pen':
            x, t0 = fx_pen(c['track'], c.get('gain', 0.5))
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
        d = 1 - 0.55 * np.exp(-seg[: ns(0.35)] / 0.08)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.0); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irL[:ns(0.012)] = 0; irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    # müzik (davul + bas + enstrüman) su altında boğuklaşır; efektler net kalır
    mL = drums.L * 0.9 + (bass_bus.L * 0.85 + music.L) * duck
    mR = drums.R * 0.9 + (bass_bus.R * 0.85 + music.R) * duck
    mL, mR = tv_lowpass(mL, underwater_fc), tv_lowpass(mR, underwater_fc)
    L = mL + sfx.L * 0.95 + vL
    R = mR + sfx.R * 0.95 + vR
    L, R = hp(L, 28), hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.45, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
