#!/usr/bin/env python3
"""Yakınla Yemek filminin sesi: sentez müzik + efektler + ElevenLabs dış sesi.

Kullanım:  python3 audio.py build/cues.json build/vo/dis_ses.mp3 build/audio.wav

- Enstrümanlar ve efektler yakinla-showreel/audio.py ile ortaktır (tamamı sentez, dış örnek yok).
- Müzik 120 BPM, G majör: G D Em C (giriş + groove) → D (gerilim) → G Em C D → G (kapanış).
  "Yakınla!" 10. saniyedeki ölçü başına, ses logosu (G5–B5–D6) 15. saniyeye oturur.
- Dış ses cues.json'daki `vo` listesine göre cümle cümle yerleştirilir. Konuşma sırasında
  müzik ve efektler kısılır (ducking); dış ses her zaman müziğin üstünde kalır.
"""
import importlib.util
import json
import os
import subprocess
import sys
import wave

import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('showreel_audio', os.path.join(HERE, '..', 'yakinla-showreel', 'audio.py'))
A = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(A)

SR, N = A.SR, A.N
DUR = 16.0
ns, tt, send, NOTE = A.ns, A.tt, A.send, dict(A.NOTE)
NOTE.update({'F#2': 92.5, 'A2': 110.0, 'B2': 123.47, 'C6': 1046.5, 'E6': 1318.5})
CH = dict(A.CH)
ROOT = dict(A.ROOT)
ARP = dict(A.ARP)
drums, bass_bus, music, sfx, verb = A.drums, A.bass_bus, A.music, A.sfx, A.verb
f = lambda *names: [NOTE[x] for x in names]


def compose():
    kicks = []

    def K(t, v=1.0):
        kicks.append(t)
        send(drums, A.kick(), t, 0.95 * v)

    def groove(t0, t1, clap=True, hats=2, skip=()):
        """Dört-dörtlük kick, 2 ve 4'te clap, hi-hat (hats: 0 yok, 1 sekizlik, 2 onaltılık + açık hat)."""
        b = 0
        t = t0
        while t < t1 - 1e-6:
            if not any(a <= t < z for a, z in skip):
                K(t)
                if clap and b % 2 == 1:
                    send(drums, A.clap(), t, 0.55, 0, rev=0.25)
                if hats >= 1:
                    send(drums, A.hat(), t + 0.25, 0.3, 0.3)
                if hats >= 2:
                    send(drums, A.hat(), t + 0.125, 0.11, -0.3)
                    send(drums, A.hat(), t + 0.375, 0.13, -0.3)
                    if b % 2 == 1:
                        send(drums, A.hat(True), t + 0.25, 0.16, 0.25)
            t += 0.5
            b += 1

    def bass(t0, ch, dur=2.0, drive=False):
        root = NOTE[ROOT[ch]]
        for k in range(int(dur / 0.5)):
            t = t0 + k * 0.5
            if drive:  # onaltılık, oktav zıplamalı
                for s in range(4):
                    send(bass_bus, A.bass_note(root * (2 if s == 2 else 1), 0.11, 600), t + s * 0.125, 0.55 if s % 2 else 0.4)
            else:      # offbeat (kick'e yer açar)
                send(bass_bus, A.bass_note(root, 0.2), t + 0.25, 0.75)
                if k % 2 == 0:
                    send(bass_bus, A.bass_note(root, 0.16), t, 0.42)
                else:
                    send(bass_bus, A.bass_note(root * 2, 0.1, 700), t + 0.375, 0.4)

    def stabs(t0, ch, dur=2.0, g=0.13):
        for k in range(int(dur / 0.5)):
            for off in ((0.25,) if k % 2 == 0 else (0.25, 0.375)):
                for nm in ARP[ch][:3]:
                    send(music, A.pluck(NOTE[nm], 0.28, 1.2), t0 + k * 0.5 + off, g, 0, rev=0.25)

    def melody(notes, t0, step=0.25, g=0.2):
        for i, nm in enumerate(notes):
            if nm is None:
                continue
            t = t0 + i * step
            send(music, A.pluck(NOTE[nm], 0.34, 1.3), t, g, 0.15, rev=0.35)
            send(music, A.bell(NOTE[nm], 0.7, 3.5, 1.4, 5), t, g * 0.35, -0.15, rev=0.4)

    # ── Duyuru (0–4): hemen ritimle açılır ──
    for bar, ch in ((0, 'G'), (2, 'D')):
        send(music, A.pad(f(*CH[ch]), 2.0, cut=1700, att=0.03, rel=0.35), bar, 0.9)
        stabs(bar, ch, g=0.12)
        bass(bar, ch)
    groove(0, 2, clap=False, hats=1)
    groove(2, 3.5, hats=2)
    melody(['G4', 'B4', 'D5', None, 'B4', 'D5', 'G5', None], 0.0, g=0.16)
    melody(['A4', 'D5', 'F#5', None, 'D5', 'F#5', 'A5', None], 2.0, g=0.16)
    for j, t in enumerate((3.5, 3.625, 3.75, 3.8125, 3.875, 3.9375)):
        send(drums, A.snare(0.4 + 0.1 * j), t, 0.36, 0, rev=0.2)

    # ── Sipariş + teslimat (4–8): tam groove ──
    for bar, ch in ((4, 'Em'), (6, 'C')):
        send(music, A.pad(f(*CH[ch]), 2.0, cut=2100, att=0.03, rel=0.35), bar, 1.0)
        stabs(bar, ch)
        bass(bar, ch)
    groove(4, 8, hats=2, skip=((6.9, 7.0),))
    for i in range(int(2.75 / 0.125)):  # yolculuk arpeji (5.5–8.25)
        t = 5.5 + i * 0.125
        ch = 'Em' if t < 6 else 'C'
        nm = ARP[ch][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]
        send(music, A.pluck(NOTE[nm] * 2, 0.24, 1.1), t, 0.085, -0.4 if i % 2 else 0.4, rev=0.3)

    # ── Slogan (8–10): gerilim, trampet rulosu, riser ──
    send(music, A.pad(f(*CH['D']), 2.0, cut=1300, att=0.05, rel=0.2), 8.0, 0.9)
    send(music, A.pad(f(*CH['D']) + [NOTE['A4']], 1.0, cut=3600, att=0.6, rel=0.05), 9.0, 0.7)
    bass(8.0, 'D', 1.5, drive=True)
    for t in (8.0, 8.5, 9.0, 9.25, 9.5):
        K(t, 0.9)
    for i in range(12):
        send(drums, A.hat(), 8.0 + i * 0.125, 0.12 if i % 2 else 0.07, 0.25 if i % 2 else -0.25)
    roll = [9.0 + i * 0.125 for i in range(4)] + [9.5 + i * 0.0625 for i in range(8)]
    for j, t in enumerate(roll):
        send(drums, A.snare(0.25 + 0.75 * j / len(roll)), t, 0.4, 0, rev=0.2)
    n = ns(1.0)
    tr = tt(n)
    riser = A.sine(300 + 900 * tr ** 2, n) * tr ** 2 * 0.18 + A.sweep_bp(A.noise(n), 400, 9000, 1.6, 0.8) * tr ** 2 * 0.5
    send(sfx, riser, 9.0, 0.55)

    # ── "Yakınla!" + kapanış (10–15): nakarat ──
    for bar, ch, d in ((10, 'G', 2.0), (12, 'Em', 1.0), (13, 'C', 1.0), (14, 'D', 1.0)):
        send(music, A.pad(f(*CH[ch]), d, cut=2900, att=0.02, rel=0.3), bar, 1.05)
        stabs(bar, ch, d, g=0.12)
        bass(bar, ch, d, drive=True)
    groove(10, 14.5, hats=2)
    melody(['B4', 'D5', 'G5', 'D5', 'B4', 'D5', 'A5', 'G5'], 10.0)
    melody(['G5', 'E5', 'B4', 'E5', 'E5', 'G5', 'E5', 'C5'], 12.0)
    melody(['D5', 'F#5', 'A5', None], 14.0)
    for j, t in enumerate([14.5 + i * 0.0625 for i in range(8)]):
        send(drums, A.snare(0.3 + 0.7 * j / 8), t, 0.4, 0, rev=0.2)
    send(sfx, A.fx_reverse(0.5), 14.5, 0.4)

    # ── Son vuruş (15): G majör + ses logosu ──
    K(15.0, 1.1)
    send(drums, A.crash(2.0), 15.0, 0.35, 0, rev=0.3)
    send(music, A.pad(f(*CH['G']) + [NOTE['D5']], 0.7, cut=3200, att=0.02, rel=0.5), 15.0, 1.15)
    send(bass_bus, A.bass_note(NOTE['G2'], 0.8, 500), 15.0, 0.6)
    for t, nm in ((15.0, 'G5'), (15.125, 'B5'), (15.25, 'D6')):
        send(music, A.bell(NOTE[nm], 1.6, 3.5, 2.2, 2.2), t, 0.34, 0, rev=0.5)
        send(music, A.pluck(NOTE[nm] / 2, 0.5, 1.2), t, 0.16, 0, rev=0.3)
    send(music, A.bell(NOTE['G6'], 1.4, 3.5, 1.4, 2.6), 15.25, 0.11, 0.3, rev=0.6)
    return kicks


def load_vo(path, segs):
    """Dış sesi 48 kHz mono okur, cümle parçalarını videodaki yerlerine koyar."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    src = np.frombuffer(raw, np.float32).astype(np.float64)
    src = A.hp(src, 85)
    out = np.zeros(N)
    fade = ns(0.012)
    for s in segs:
        a, b = ns(s['src'][0]), min(ns(s['src'][1]), len(src))
        x = src[a:b].copy()
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        i = ns(s['at'])
        out[i:i + len(x)] += x[:N - i]
    return out


def rms_active(x, thresh=0.02):
    m = np.abs(x) > thresh * np.max(np.abs(x))
    return float(np.sqrt(np.mean(x[m] ** 2)))


def main():
    cues_path, vo_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    info = json.load(open(cues_path, encoding='utf-8'))
    kicks = compose()
    for c in info['cues']:
        typ = c['type']
        if typ == 'motor':
            x, t0 = A.fx_motor(c['track'], c.get('gain', 0.3))
            sfx.add(x, t0)
            continue
        send(sfx, A.FX[typ](c), c['t'], c.get('gain', 1.0), c.get('pan', 0.0), rev=A.REV.get(typ, 0.0))

    # sidechain: bas ve müzik kick'lere yer açar
    t = tt(N)
    duck = np.ones(N)
    for k in kicks:
        i = ns(k)
        d = 1 - 0.6 * np.exp(-t[:ns(0.4)] / 0.09)
        d = d[:max(0, N - i)]
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d)

    # oda yankısı (sentetik impuls)
    from scipy import signal
    ir_n = ns(2.2)
    irt = tt(ir_n)
    irL = A.lp(A.noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irR = A.lp(A.noise(ir_n), 6500) * np.exp(-irt * 3.0)
    irL[:ns(0.012)] = 0
    irR[:ns(0.017)] = 0
    irL /= np.sqrt(np.sum(irL ** 2))
    irR /= np.sqrt(np.sum(irR ** 2))
    vL = signal.fftconvolve(verb.L, irL)[:N] * 0.5
    vR = signal.fftconvolve(verb.R, irR)[:N] * 0.5

    L = drums.L * 0.9 + (bass_bus.L * 0.85 + music.L) * duck + sfx.L * 0.8 + vL
    R = drums.R * 0.9 + (bass_bus.R * 0.85 + music.R) * duck + sfx.R * 0.8 + vR
    L, R = A.hp(L, 28), A.hp(R, 28)
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = L / peak * 1.25, R / peak * 1.25
    L, R = np.tanh(L) / np.tanh(1.25), np.tanh(R) / np.tanh(1.25)

    # dış ses: konuşurken altyapı ~8 dB kısılır, ses altyapının üstünde kalır
    vo = load_vo(vo_path, info['vo'])
    win = ns(0.03)
    env = np.sqrt(np.maximum(ndimage.uniform_filter1d(vo ** 2, win), 0))
    talk = (env > 0.06 * env.max()).astype(float)
    talk = ndimage.maximum_filter1d(talk, ns(0.36))          # kelime aralarında açılmasın
    talk = ndimage.uniform_filter1d(talk, ns(0.16))          # yumuşak iniş-çıkış
    bed_gain = 1 - (1 - 0.4) * talk
    vo_gain = rms_active((L + R) / 2) / rms_active(vo) * 1.5
    v = np.tanh(vo * vo_gain * 1.1) / 1.1                    # hafif tepe yumuşatma
    L = L * bed_gain + v
    R = R * bed_gain + v
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = np.tanh(L / peak * 1.1) / np.tanh(1.1), np.tanh(R / peak * 1.1) / np.tanh(1.1)

    n = ns(DUR)
    L, R = L[:n], R[:n]
    fade = np.clip((DUR - tt(n)) / 0.6, 0, 1) ** 1.5
    L, R = L * fade * 0.89, R * fade * 0.89
    pcm = (np.vstack([L, R]).T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{out}: {n / SR:.2f} sn, {len(info['cues'])} efekt ipucu, {len(info['vo'])} dış ses parçası")


if __name__ == '__main__':
    main()
