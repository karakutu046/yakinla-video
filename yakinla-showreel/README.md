# Yakınla — 20 sn motion graphics tanıtım filmi

[yakinla.com](https://yakinla.com) için dikey (9:16, 1080×1920, 30 fps) sesli tanıtım filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktılar** (12 MB, H.264 + AAC, -14 LUFS):

- [`out/yakinla_showreel_20sn.mp4`](out/yakinla_showreel_20sn.mp4): Türkçe dış sesli ana versiyon.
- [`out/yakinla_showreel_20sn_muzik.mp4`](out/yakinla_showreel_20sn_muzik.mp4): dış sessiz, yalnız müzik ve efekt.
- Kapak görseli: [`out/kapak.jpg`](out/kapak.jpg).

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü yok.
Logo, marka dosyasındaki SVG yolundan birebir çizilir. Müzik ve ses efektleri de sentezle üretilir,
dışarıdan alınmış bir ses dosyası yok. Dış ses açık kaynak Piper ses motoruyla yerelde üretilir.
Hiçbir ücretli servis kullanılmaz.

## Akış

| Zaman | Sahne | Ekranda | Hareket ve ses |
|---|---|---|---|
| 0–4 sn | **Kanca** | `21:47` · cips paketi · **Atıştırmalıklar mı bitti?** → **Eksik bir şey mi var?** | Saat haneleri slot makinesi gibi dönerek yerine oturur. Cips paketi düşer, ters döner, içinden sadece birkaç kırıntı dökülür. Ekmek, yumurta, çay ve süt "?" rozetleriyle belirir. Mavi daire siler, kelimeler vuruşa çakılır. |
| 4–8 sn | **Sipariş** | **Yakınla'yı aç. → Sepetini doldur. → Onayla, gelsin!** | Soru işaretinin noktası kopar, zıplar ve telefona dönüşür. Atıştırmalık kategorisi açık gelir. Cips, süt, yumurta ve çay sepete uçar, rozet 1-2-3-4 sayar, ✓ belirir ve kamera ✓'nin içine dalar. |
| 8–12 sn | **Teslimat** | **Afşin'deki depomuzdan** · **Kuryeni canlı takip et** · **AFŞİN ve KÖYLERİ** | 3B gece haritası: sokak lambaları, ışıklı pencereler. Rota depodan eve çizilir, kurye ilerledikçe parlar. Kamera yatar, dağların arkasından AFŞİN ve altında VE KÖYLERİ yükselir. Yamaçlardaki köyler tek tek yanar, her birinin üstünde bir teslimat pini belirir. Sonra kapı zili çalar. |
| 12–16 sn | **Vaat** | **ortalama 60 dakikada kapında.** · **Komşun kadar yakın.** + 3 kart | Sayaç 0'dan 60'a çıkar (her artışta tık sesi), dakika halkası dolar. Ekran yana kayar, kartlar gelir: 09:00–23:00 arası açığız · Afşin ve köylerine sanal market hizmeti · 3D Secure ile güvenli ödeme. |
| 16–20 sn | **Kapanış** | Logo · **Ne Lazımsa, Yakınla!** · Afşin ve köylerine sanal market · App Store · Google Play · www.yakinla.com | Kartlar tek noktaya çöker, pin uçtan büyür, halka çizilir, ibreler dönüp yerine oturur. Slogan jingle'la hece hece gelir: "Ne La-zım-sa," zıplar (B4–D5–E5–D5), "Ya-kın-la!" çakılır (G5–B5–D6 ses logosu). Son hecede konfeti patlar, ardından indirme hapları ve site adresi gelir. |

**Ses:** 120 BPM. Akorlar Em → Em C G D → C D → G. Sahne geçişleri ölçü başlarına (4, 8, 12, 16. sn) denk gelir
ve logo G majöre çözülen bir kadansla açılır. Kapanış sloganının her hecesi bir notaya denk gelir (`anim.js` içindeki `SLOGAN` ile
`audio.py` içindeki `jingle` aynı zamanları kullanır), böylece yazı ve melodi birlikte "Ne Lazımsa, Yakınla!" der. 130'dan fazla efekt ipucu doğrudan `anim.js`'ten üretilir
(`build/cues.json`), bu yüzden her pop, tık ve whoosh ekrandaki hareketle aynı karede ve aynı yönde (pan)
duyulur. Kuryenin motor sesi bile ekrandaki konumuna göre sağ-sol kayar. Miks -14 LUFS'tur.

## Dış ses

Dış ses, Piper `tr_TR-fahrettin-medium` modeliyle okunur. Model, CC0 lisanslı bir veri setiyle eğitilmiş derin ve canlı tonlu bir erkek sesidir.
Her replik ekrandaki yazıyla aynı anda başlar. Konuşma sırasında müzik ~6 dB alçalır, dış ses müziğin ~9 dB üstünde durur.

| Zaman | Replik | Ekranda |
|---|---|---|
| 2,45 sn | Eksik bir şey mi var? | Eksik / bir şey / mi var? |
| 4,35 sn | Uygulamayı aç, | Yakınla'yı aç. |
| 5,45 sn | sepetini doldur. | Sepetini doldur. |
| 8,70 sn | Kurye yolda, canlı takip et. | Kuryeni canlı takip et |
| 10,42 sn | Afşin ve köylerine, | AFŞİN · VE KÖYLERİ |
| 12,05 sn | ortalama altmış dakikada kapında. | 60 · dakikada kapında. |
| 13,95 sn | Dokuzdan yirmi üçe kadar buradayız. | 09:00 – 23:00 arası açığız |
| 16,50 sn | Ne lazımsa, | Ne Lazımsa, (jingle ile hece hece) |
| 17,48 sn | Yakınla! | Yakınla! (jingle ile hece hece) |
| 18,50 sn | Hemen indir! | App Store · Google Play |

Piper her okumada tonlamayı biraz farklı üretir. Bu yüzden `vo.py` her replik için 8 okuma alır ve hepsini Whisper ile
yazıya döker. Metne en yakın okuma seçilir. Seçilen 10 okumanın 10'u da Whisper'da metinle birebir eşleşti (`vo/dis_ses.json`).
Bitmiş miks, müzik altındayken de Whisper'da baştan sona doğru okunur.
Denetimde net çıkmayan ifadeler değiştirildi:

- "Kuryeni": Whisper "Kur'an'ı" diye duydu.
- "Yakınla'yı aç": "Yakınlayaç" diye duyuldu.
- "açığız": "açız" diye duyuldu.

## Marka kuralları

- Slogan **"Ne Lazımsa, Yakınla!"**. Hizmet bölgesi **Afşin ve köyleri** ("Afşin ve köylerine sanal market hizmeti").
- Sadece sitedeki güvenli ifadeler kullanıldı: "ortalama 60 dakikada kapında", "Afşin'deki depomuzdan",
  "kuryeni canlı takip et", "3D Secure ile güvenli ödeme", "App Store / Google Play". Çalışma saatleri **09:00 – 23:00**;
  kancadaki saat (21:47) bu yüzden kapanıştan önce, ortalama teslimat da 23:00'ten önce biter.
  "Ortalama" niteleyicisi, sarı bir rozet içinde ayrıca vurgulanır.
- Karşılaştırmalı iddia, fiyat ya da kampanya yok. Elbistan geçmez.
- Renkler marka paletinden: #1F73F0 ve #3B8BFF → #0E5FE0 gradyanı, yanında kontrast için amber.
- Mekân küçük bir Anadolu ilçesidir: alçak binalar, geniş caddeler, dağ silueti. Gökdelen ya da deniz yok.
- Manav ürünü (meyve-sebze) yok. Gösterilen ürünler süt, ekmek, yumurta, çay, cips ve deterjan.
- Ürünlerde gerçek marka ambalajı yok, hepsi jenerik ikon.

## Yeniden üretmek

```bash
./build.sh                         # → out/yakinla_showreel_20sn.mp4 + _muzik.mp4 (~6 dk)
SKIP_RENDER=1 ./build.sh           # sadece ses ve kodlama (kareler build/frames'te hazırsa, ~2 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Dış ses `vo/dis_ses.wav` olarak repoda durur, `build.sh` onu doğrudan kullanır. Repliği değiştirmek için `vo.py`'deki
`LINES` listesini düzenleyip sesi yeniden üretin:

```bash
pip install piper-tts sherpa-onnx
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-tr_TR-fahrettin-medium.tar.bz2
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
tar xjf vits-piper-tr_TR-fahrettin-medium.tar.bz2 && tar xjf sherpa-onnx-whisper-small.tar.bz2
python3 vo.py vits-piper-tr_TR-fahrettin-medium/tr_TR-fahrettin-medium.onnx vo/dis_ses.wav \
    --asr sherpa-onnx-whisper-small --takes 8   # ~2 dk
```

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=12.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 6 alt-örnekle (180° obtüratör) çizilir, böylece gerçek hareket bulanıklığı oluşur. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, yankı ve limit. Dış ses verilirse onu ortaya koyar ve altındaki her şeyi alçaltır. |
| `vo.py` | Türkçe dış ses: Piper ile sentez, Whisper ile en net okumayı seçme, yayın EQ'su ve kompresör, zamanlama. |
| `vo/` | Hazır dış ses (`dis_ses.wav`, 48 kHz mono) ve seçilen okumaların raporu (`dis_ses.json`). |
| `build.sh` | Uçtan uca üretim: kare render, ses (dış sesli ve dış sessiz), iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
| `assets/` | Yakınla logo işareti (SVG). |
