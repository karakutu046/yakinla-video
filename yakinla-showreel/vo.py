#!/usr/bin/env python3
"""Yakınla showreel'inin Türkçe dış sesi: Piper ile yerelde, ücretsiz sentez.

Kullanım:  python3 vo.py <tr_TR-fahrettin-medium.onnx> vo/dis_ses.wav [--asr <whisper-klasörü>] [--takes 8]

Ses modeli: Piper "tr_TR-fahrettin-medium" (veri seti CC0, NabuCasa/voice-datasets).
  https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-tr_TR-fahrettin-medium.tar.bz2
  (aynı model: huggingface.co/rhasspy/piper-voices). tr_TR-dfki sesi CC BY-NC-SA'dır, reklamda kullanılmaz.
Gerekenler: pip install piper-tts numpy scipy  (--asr için ayrıca: pip install sherpa-onnx)

Piper her okumada tonlamayı biraz farklı üretir (rastgelelik modelin içindedir, dışarıdan sabitlenemez).
--asr verilirse her replik için --takes kadar okuma alınır, hepsi Whisper (sherpa-onnx-whisper-small,
github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models) ile geri yazıya çevrilir ve metne en yakın okuma seçilir.
Seçilen okumalar ve puanları vo/dis_ses.json'a yazılır; üretilen vo/dis_ses.wav repoda durur.

Her replik ekrandaki yazıyla aynı anda başlar ve bir sonraki olaydan önce biter.
Sığmazsa konuşma hızı modelin kendi length_scale'iyle artırılır (ses hızlandırma yok).
Sayılar, TTS doğru okusun diye yazıyla yazılır. Whisper denetiminde "Kuryeni" ("Kur'an'ı" diye duyuluyordu),
"Yakınla'yı aç" ("Yakınlayaç") ve "açığız" ("açız") net çıkmadı; yerlerine daha net okunan ifadeler kondu.
"""
import argparse
import difflib
import json
import re
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 20.0

# (başlangıç sn, metin, en geç bitiş sn, length_scale): zamanlar anim.js'teki sahne ve yazı zamanlarıdır
LINES = [
    (2.45, 'Eksik bir şey mi var?', 3.95, 1.0),             # "Eksik / bir şey / mi var?" çakılır (2.5–3.0)
    (4.35, 'Uygulamayı aç,', 5.35, 1.0),                    # "Yakınla'yı aç." (4.32)
    (5.45, 'sepetini doldur.', 6.6, 1.0),                   # "Sepetini doldur." (5.38)
    (8.7, 'Kurye yolda, canlı takip et.', 10.38, 0.95),     # kurye yola çıkar (8.8), canlı takip kartı (9.0)
    (10.42, 'Afşin ve köylerine,', 11.65, 1.0),             # AFŞİN / VE KÖYLERİ (10.3 / 10.55)
    (12.05, 'ortalama altmış dakikada kapında.', 13.95, 1.0),  # 60 sayacı, "dakikada kapında." (12.0–13.5)
    (13.95, 'Dokuzdan yirmi üçe kadar buradayız.', 15.92, 0.95),  # 09:00 – 23:00 kartı (14.0)
    (16.5, 'Ne lazımsa,', 17.45, 1.15),                     # jingle: Ne La-zım-sa (16.5–17.25), heceler notalara yakın
    (17.48, 'Yakınla!', 18.42, 1.3),                        # jingle: Ya-kın-la! (17.5–18.0), slogan ağır ve vurgulu
    (18.5, 'Hemen indir!', 19.25, 1.0),                     # mağaza hapları (18.2)
]


def synth(voice, text, ls):
    from piper import SynthesisConfig
    cfg = SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.7, normalize_audio=True)
    chunks = list(voice.synthesize(text, syn_config=cfg))
    x = np.concatenate([c.audio_float_array for c in chunks]).astype(np.float64)
    return x, chunks[0].sample_rate


def trim(x, sr, thr_db=-42, pad=0.012):
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / int(sr * 0.01), 'same')
    on = np.where(env > np.max(env) * 10 ** (thr_db / 20))[0]
    a, b = max(0, on[0] - int(pad * sr)), min(len(x), on[-1] + int(pad * sr * 3))
    return x[a:b]


def voice_chain(x):
    """Yayın sesi: alçak kesme, gövde, varlık (presence), yumuşak kompresör."""
    x = signal.sosfilt(signal.butter(2, 85, 'high', fs=SR, output='sos'), x)
    body = signal.sosfilt(signal.butter(2, [140, 320], 'band', fs=SR, output='sos'), x)
    pres = signal.sosfilt(signal.butter(2, [2600, 5200], 'band', fs=SR, output='sos'), x)
    x = x + 0.18 * body + 0.45 * pres
    # RMS kompresör (eşik -20 dB, oran 3:1, 5 ms atak, 80 ms bırakma)
    rms = np.sqrt(np.maximum(1e-12, signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], x * x)))
    db = 20 * np.log10(rms / (np.max(rms) + 1e-12))
    gr = np.minimum(0, (db + 20) * (1 / 3 - 1))
    g = 10 ** (gr / 20)
    sm = np.empty_like(g); s = 1.0
    ka, kr = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.08 * SR))
    for i, v in enumerate(g):
        k = ka if v < s else kr
        s = k * s + (1 - k) * v; sm[i] = s
    return x * sm


# Whisper sayıları rakamla yazar; karşılaştırma için hepsi harfe çevrilir
NUMS = [('23', 'yirmiüç'), ('60', 'altmış'), ('11', 'onbir'), ('20', 'yirmi'), ('9', 'dokuz'), ('3', 'üç')]


def norm(s):
    s = s.replace('I', 'ı').replace('İ', 'i').lower()
    for d, w in NUMS:
        s = re.sub(rf'\b{d}\b', w, s)
    return re.sub(r'[^a-zçğıöşü]', '', s)


class Judge:
    """Okumayı Whisper ile yazıya döker, hedef metne benzerliğini (0–1) verir."""
    def __init__(self, d):
        import sherpa_onnx
        self.rec = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=f'{d}/small-encoder.int8.onnx', decoder=f'{d}/small-decoder.int8.onnx',
            tokens=f'{d}/small-tokens.txt', language='tr', task='transcribe', num_threads=4)

    def __call__(self, x, sr, text):
        g = np.gcd(16000, sr)
        y = signal.resample_poly(np.concatenate([np.zeros(sr // 4), x, np.zeros(sr // 4)]), 16000 // g, sr // g)
        st = self.rec.create_stream(); st.accept_waveform(16000, y.astype(np.float32)); self.rec.decode_stream(st)
        hyp = st.result.text.strip()
        return difflib.SequenceMatcher(None, norm(text), norm(hyp)).ratio(), hyp


def take(voice, text, t0, t_end, ls):
    """Pencereye sığana kadar konuşma hızını artırarak bir okuma alır."""
    while True:
        x, sr = synth(voice, text, ls)
        x = trim(x, sr)
        if t0 + len(x) / sr <= t_end or ls <= 0.84:
            return x, sr, ls
        ls = round(ls - 0.03, 2)


def main():
    from piper import PiperVoice
    ap = argparse.ArgumentParser()
    ap.add_argument('model'); ap.add_argument('out')
    ap.add_argument('--asr', help='sherpa-onnx-whisper-small klasörü (en net okumayı seçmek için)')
    ap.add_argument('--takes', type=int, default=8)
    a = ap.parse_args()
    voice = PiperVoice.load(a.model, config_path=a.model + '.json')
    judge = Judge(a.asr) if a.asr else None
    track = np.zeros(int(SR * (DUR + 1)))
    report = []
    for t0, text, t_end, ls in LINES:
        takes = []
        for k in range(a.takes if judge else 1):
            x, sr, ls_k = take(voice, text, t0, t_end, ls)
            sc, hyp = judge(x, sr, text) if judge else (None, '')
            takes.append((sc or 0, -abs(ls_k - ls), k, x, sr, ls_k, hyp))
        sc, _, k, x, sr, ls_k, hyp = max(takes, key=lambda q: (q[0], q[1]))
        d = len(x) / sr
        if t0 + d > t_end:
            print(f'UYARI: "{text}" {t0 + d - t_end:.2f} sn taşıyor; metni kısaltın.')
        g = np.gcd(SR, sr)
        y = signal.resample_poly(x, SR // g, sr // g)
        y = voice_chain(y)
        y /= np.sqrt(np.mean(y[np.abs(y) > 0.02 * np.max(np.abs(y))] ** 2))  # replikler eşit yükseklikte
        i = int(t0 * SR)
        track[i:i + len(y)] += y
        r = {'t0': t0, 't1': round(t0 + len(y) / SR, 3), 'text': text, 'length_scale': ls_k}
        if judge:
            r.update(take=f'{k + 1}/{len(takes)}', score=round(sc, 3), whisper=hyp)
        report.append(r)
        print(f'{t0:5.2f}–{r["t1"]:5.2f} sn  (ls {ls_k:.2f})  {text}' + (f'   ← okuma {k + 1}/{len(takes)}, {sc:.2f}: "{hyp}"' if judge else ''))
    track *= 0.5 / np.max(np.abs(track))
    pcm = (track[:int(SR * DUR)] * 32767).astype(np.int16)
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    with open(a.out.rsplit('.', 1)[0] + '.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f'{a.out}: {len(LINES)} replik')


if __name__ == '__main__':
    main()
