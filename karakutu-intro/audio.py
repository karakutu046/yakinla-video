#!/usr/bin/env python3
"""Karakutu tanıtımının müziği ve ses efektleri: tamamı sentez (numpy + scipy), dış örnek yok.

Kullanım:  python3 audio.py build/cues.json build/audio.wav

Enstrümanlar ve efektler Yakınla showreel'inin sentezleyicisinden gelir
(../yakinla-showreel/audio.py); burada yalnızca 10 saniyelik beste ve miks var.

- 120 BPM, 4/4. Ölçü başları 0, 2, 4, 6, 8 sn.
  Akorlar: Am (giriş, karanlık) → Am F (kodlama) → C G F G (ürün) → C (logo, çözülme).
- Ses logosu: kelime işareti yerine otururken çalan dört nota, G5 – E5 – G5 – C6 ("ka-ra-ku-tu").
- Efektler anim.js'in ürettiği cues.json'dan gelir; her pop, tuş ve whoosh ekrandaki hareketle aynı karede duyulur.
"""
import importlib.util
import json
import sys
import wave
from pathlib import Path

import numpy as np
from scipy import signal

sys.dont_write_bytecode = True   # komşu klasöre __pycache__ bırakma
_spec = importlib.util.spec_from_file_location(
    'yakinla_synth', Path(__file__).resolve().parent.parent / 'yakinla-showreel' / 'audio.py')
b = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(b)

SR = b.SR
DUR = 10.0
N = int(SR * (DUR + 2.5))
tt, ns, noise, lp, hp, bp = b.tt, b.ns, b.noise, b.lp, b.hp, b.bp


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


def fx_key(pitch=1.0):
    """Klavye tuşu: kısa tiz tık + alçak 'tok'."""
    n = ns(0.04); t = tt(n)
    click = bp(noise(n), 1800 * pitch, min(9000 * pitch, 20000)) * np.exp(-t * 260)
    thock = np.sin(2 * np.pi * 260 * pitch * t) * np.exp(-t * 140) * 0.5
    return click * 0.8 + thock


FX = dict(b.FX)
FX['key'] = lambda c: fx_key(c.get('pitch', 1))
REV = dict(b.REV)


# ───────────────────────── beste ─────────────────────────
NOTE = {'A1': 55.0, 'C2': 65.41, 'F2': 87.31, 'G2': 98.0,
        'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.0, 'C6': 1046.5}
CH = {'Am': ['A3', 'C4', 'E4', 'A4'], 'F': ['F3', 'A3', 'C4', 'F4'], 'C': ['C4', 'E4', 'G4', 'C5'],
      'G': ['G3', 'B3', 'D4', 'G4']}
ROOT = {'Am': 'A1', 'F': 'F2', 'C': 'C2', 'G': 'G2'}
ARP = {'Am': ['A4', 'C5', 'E5', 'A5'], 'F': ['F4', 'A4', 'C5', 'F5'], 'C': ['C5', 'E5', 'G5', 'C6'],
       'G': ['G4', 'B4', 'D5', 'G5']}
f = lambda *names: [NOTE[x] for x in names]


def riser(dur, gain):
    n = ns(dur); r = tt(n) / dur
    return (b.sine(300 + 900 * r ** 2, n) * r ** 2 * 0.18 + b.sweep_bp(noise(n), 400, 9000, 1.6, 0.8) * r ** 2 * 0.5) * gain


def compose():
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, b.kick(), t, 0.95 * v)

    # 0–2 giriş: karanlık Am, saat gibi büyüyen nabız, ampulün düşüşüne bir nota
    send(music, b.pad(f(*CH['Am'][:3]), 1.9, cut=650, att=0.7, rel=0.4), 0.0, 0.9)
    send(bass_bus, b.bass_note(NOTE['A1'], 1.9, 220), 0.3, 0.45)
    for i in range(8):
        t = i * 0.25
        send(drums, b.hat(), t, 0.05 + 0.1 * t / 2, 0.25 if i % 2 else -0.25)
    send(music, b.pluck(NOTE['E5'], 0.7, 0.9), 1.5, 0.3, 0, rev=0.4)
    send(music, b.pluck(NOTE['A4'], 0.7, 0.9), 1.5, 0.22, 0, rev=0.4)
    send(sfx, riser(0.5, 0.35), 1.5)

    # 2–4 kodlama: Am F, 16'lık bas ve arpej
    for bar, ch in ((2.0, 'Am'), (3.0, 'F')):
        send(music, b.pad(f(*CH[ch]), 1.0, cut=1900, att=0.03, rel=0.25), bar, 0.85)
        root = NOTE[ROOT[ch]]
        for s in range(8):
            t = bar + s * 0.125
            if t >= 3.75:
                break
            send(bass_bus, b.bass_note(root * (2 if s % 4 == 2 else 1), 0.11, 650), t, (0.4, 0.22, 0.6, 0.22)[s % 4])
    for t in (2.0, 2.5, 3.0):
        K(t)
    send(drums, b.clap(), 2.5, 0.55, 0, rev=0.25)
    for i in range(12):
        t = 2.0 + i * 0.125
        send(drums, b.hat(), t, 0.14 if i % 2 else 0.08, -0.25 if i % 2 else 0.25)
    for i in range(14):
        t = 2.0 + i * 0.125
        ch = 'Am' if t < 3 else 'F'
        nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
        send(music, b.pluck(NOTE[nm], 0.25, 1.1), t, 0.13, -0.4 if i % 2 else 0.4, rev=0.3)
    roll = [3.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, b.snare(0.25 + 0.75 * j / len(roll)), t, 0.4, 0, rev=0.2)
    send(sfx, riser(1.0, 0.6), 3.0)

    # 4–7 ürün: C G F G, dört vuruşluk kick, offbeat bas ve akor vuruşları
    prog_ = [(4.0, 1.0, 'C'), (5.0, 1.0, 'G'), (6.0, 0.5, 'F'), (6.5, 0.5, 'G')]
    for t0, d, ch in prog_:
        send(music, b.pad(f(*CH[ch]), d, cut=2800, att=0.02, rel=0.3), t0, 1.0)
        root = NOTE[ROOT[ch]]
        for k in range(int(d / 0.5)):
            t = t0 + k * 0.5
            send(bass_bus, b.bass_note(root, 0.18), t, 0.45)
            if t + 0.25 < 6.75:
                send(bass_bus, b.bass_note(root, 0.2), t + 0.25, 0.75)
            if t + 0.25 < 6.5:
                for nm in ARP[ch][:3]:
                    send(music, b.pluck(NOTE[nm], 0.3, 1.2), t + 0.25, 0.11, 0, rev=0.25)
    for t in (4.0, 4.5, 5.0, 5.5, 6.0):
        K(t, 1.1 if t == 4.0 else 1.0)
    for t in (4.5, 5.5):
        send(drums, b.clap(), t, 0.55, 0, rev=0.25)
    for i in range(10):
        t = 4.0 + i * 0.25
        if i % 2:
            send(drums, b.hat(i % 4 == 3), t, 0.2 if i % 4 == 3 else 0.28, 0.3)
        else:
            send(drums, b.hat(), t, 0.1, -0.3)
    for j, t in enumerate(6.5 + i * 0.0625 for i in range(8)):
        send(drums, b.snare(0.2 + 0.5 * j / 8), t, 0.3, 0, rev=0.2)
    send(sfx, riser(0.5, 0.45), 6.5)

    # 7–10 kapanış: C majöre çözülme, ses logosu
    K(7.0, 1.1)
    send(music, b.pad(f(*CH['C']) + [NOTE['E5']], 2.8, cut=3200, att=0.02, rel=1.2), 7.0, 1.1)
    send(bass_bus, b.bass_note(NOTE['C2'], 0.9, 500), 7.0, 0.6)
    for t, nm in ((7.5, 'G5'), (7.625, 'E5'), (7.75, 'G5'), (8.0, 'C6')):
        send(music, b.bell(NOTE[nm], 2.6, 3.5, 2.2, 1.5), t, 0.34, 0, rev=0.5)
        send(music, b.pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.15, 0, rev=0.3)
    K(8.0, 0.75)
    for nm in ('C4', 'E4', 'G4', 'C5'):
        send(music, b.pluck(NOTE[nm], 1.4, 1.0), 8.0, 0.17, 0, rev=0.5)
    send(bass_bus, b.bass_note(NOTE['C2'], 1.4, 400), 8.0, 0.5)
    for i in range(8):
        t = 8.0 + i * 0.125
        send(drums, b.hat(), t, (0.08 if i % 2 else 0.05) * (1 - i / 10), 0.3 if i % 2 else -0.3)
    return kicks


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
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
        d = 1 - 0.6 * np.exp(-t[: min(ns(0.4), N - i)] / 0.09)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # oda yankısı (sentetik impuls)
    ir_n = ns(2.0); irt = tt(ir_n)
    irL = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
    irR = lp(noise(ir_n), 6500) * np.exp(-irt * 3.2)
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
    # son: 9.3 sn'den itibaren yumuşak kapanış, tam 10.0 sn'de kes
    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.7, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out}: {n / SR:.2f} sn, {len(cues)} efekt ipucu')


if __name__ == '__main__':
    main()
