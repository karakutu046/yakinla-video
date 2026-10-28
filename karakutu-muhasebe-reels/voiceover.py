#!/usr/bin/env python3
"""Türkçe dış ses: Piper (açık kaynak, yerel, ücretsiz) ile metni okur, her cümleyi kendi sahnesine yerleştirir.

Kullanım:  python3 voiceover.py build/vo.wav [ses-adı]
           (varsayılan ses: tr_TR-fahrettin-medium; diğerleri: tr_TR-fettah-medium, tr_TR-dfki-medium)

- Ses modeli build/voices/ altına bir kez indirilir (huggingface.co/rhasspy/piper-voices).
- Her cümle, başladığı andan bir sonraki sahneye kadar olan pencereye sığdırılır; sığmazsa
  Piper'ın konuşma hızı (length_scale) artırılarak yeniden okunur.
- Çıktı 48 kHz mono WAV ve yanında cümle zamanlarını tutan build/vo.json'dur; audio.py bu dosyayı
  müziğin üstüne koyar ve dış ses konuşurken müziği kısar (ducking).
"""
import io
import json
import os
import subprocess
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 38.0
VOICE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build', 'voices')

# (başlangıç sn, pencere sonu sn, okunacak metin). Metin, Türkçe okunuşa göre yazılır
# ("WhatsApp" → "Vatsap", "e-Fatura" → "e Fatura"); zamanlar anim.js'teki T sahnelerine oturur.
LINES = [
    (0.35, 3.8, 'Kim ödedi, kim ödemedi? Hâlâ veresiye defteriyle mi?'),
    (4.15, 5.95, 'Defter kapandı.'),
    (6.05, 7.95, 'Karakutu açıldı.'),
    (8.15, 10.5, 'Alacağını sen kovalama.'),
    (10.6, 14.5, 'Vadesi gelen cariye, Vatsap\'tan otomatik hatırlatma gider.'),
    (14.6, 16.35, 'Ödeme gelir, bakiye sıfırlanır.'),
    (16.4, 19.5, 'Tek tek aramana gerek yok. Karakutu hepsine hatırlatır.'),
    (20.05, 22.45, 'Carilerin kayıt altında.'),
    (22.55, 24.95, 'Stoğun her an güncel.'),
    (25.05, 27.45, 'e Faturanı programdan kes.'),
    (27.55, 29.95, 'Gelen, giden tüm faturalar tek ekranda.'),
    (30.05, 32.1, 'Teklifini kolayca hazırla.'),
    (32.2, 34.1, 'Hepsi tek programda.'),
    (34.3, 35.5, 'Karakutu Muhasebe.'),
    (35.6, 37.7, 'Defteri kapat, Karakutuyu aç.'),
]
BASE_SPEED = 0.92   # Piper length_scale: 1 = modelin doğal hızı, küçük = daha hızlı
MIN_SPEED = 0.74    # bundan hızlısı anlaşılmaz olur; sığmayan cümle uyarı verir


def load_voice(name):
    from piper import PiperVoice
    model = os.path.join(VOICE_DIR, name + '.onnx')
    if not os.path.exists(model):
        os.makedirs(VOICE_DIR, exist_ok=True)
        r = subprocess.run([sys.executable, '-m', 'piper.download_voices', name, '--data-dir', VOICE_DIR])
        if r.returncode != 0 or not os.path.exists(model):
            sys.exit(f'Ses modeli indirilemedi: {name}. huggingface.co erişimi gerekiyor.')
    return PiperVoice.load(model)


def say(voice, text, speed):
    from piper import SynthesisConfig
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=speed, noise_scale=0.6, noise_w_scale=0.7))
    buf.seek(0)
    with wave.open(buf, 'rb') as w:
        sr, x = w.getframerate(), np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    g = np.gcd(SR, sr)
    x = signal.resample_poly(x, SR // g, sr // g)
    # baş ve sondaki sessizliği kırp (-45 dB eşik), 15 ms pay bırak
    idx = np.where(np.abs(x) > 10 ** (-45 / 20))[0]
    if len(idx):
        x = x[max(0, idx[0] - int(0.015 * SR)): idx[-1] + int(0.05 * SR)]
    return x


def polish(x):
    """Reklam sesi gibi dursun: alçak frekans temizliği, biraz parlaklık, yumuşak sıkıştırma."""
    x = signal.sosfilt(signal.butter(2, 85, 'high', fs=SR, output='sos'), x)
    pres = signal.sosfilt(signal.butter(2, [2500, 6500], 'band', fs=SR, output='sos'), x)
    x = x + 0.35 * pres
    rms = np.sqrt(np.mean(x ** 2)) + 1e-9
    x = x * (10 ** (-16 / 20) / rms)                      # her cümle aynı ortalama seviyede
    return np.tanh(x * 1.6) / 1.6


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'build/vo.wav'
    name = sys.argv[2] if len(sys.argv) > 2 else 'tr_TR-fahrettin-medium'
    voice = load_voice(name)
    n = int(SR * DUR)
    track = np.zeros(n)
    meta = []
    for t0, t1, text in LINES:
        slot = t1 - t0 - 0.05
        speed = BASE_SPEED
        x = say(voice, text, speed)
        while len(x) / SR > slot and speed > MIN_SPEED:
            speed = max(MIN_SPEED, speed * slot / (len(x) / SR) * 0.98)
            x = say(voice, text, speed)
        d = len(x) / SR
        flag = '' if d <= slot else '  ⚠ pencereye sığmadı'
        print(f'{t0:5.2f}–{t0 + d:5.2f} sn  hız {speed:.2f}  {text}{flag}')
        x = polish(x)
        i = int(t0 * SR)
        m = min(len(x), n - i)
        track[i:i + m] += x[:m]
        meta.append({'t': t0, 'end': round(t0 + d, 3), 'text': text, 'speed': round(speed, 3)})
    pcm = (np.clip(track, -1, 1) * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    json.dump({'voice': name, 'lines': meta}, open(os.path.splitext(out)[0] + '.json', 'w'), ensure_ascii=False, indent=1)
    print(f'{out}: {len(LINES)} cümle, ses {name}')


if __name__ == '__main__':
    main()
