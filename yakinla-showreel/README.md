# Yakınla — 20 sn motion graphics tanıtım filmi

[yakinla.com](https://yakinla.com) için dikey (9:16, 1080×1920, 30 fps) sesli tanıtım filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/yakinla_showreel_20sn.mp4`](out/yakinla_showreel_20sn.mp4) (12 MB, H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü yok.
Logo, marka dosyasındaki SVG yolundan birebir çizilir. Müzik ve ses efektleri de sentezle üretilir,
dışarıdan alınmış bir ses dosyası yok.

## Akış

| Zaman | Sahne | Ekranda | Hareket ve ses |
|---|---|---|---|
| 0–4 sn | **Kanca** | `21:47` · cips paketi · **Atıştırmalıklar mı bitti?** → **Eksik bir şey mi var?** | Saat haneleri slot makinesi gibi dönerek yerine oturur. Cips paketi düşer, ters döner, içinden sadece birkaç kırıntı dökülür. Ekmek, yumurta, çay ve süt "?" rozetleriyle belirir. Mavi daire siler, kelimeler vuruşa çakılır. |
| 4–8 sn | **Sipariş** | **Yakınla'yı aç. → Sepetini doldur. → Onayla, gelsin!** | Soru işaretinin noktası kopar, zıplar ve telefona dönüşür. Atıştırmalık kategorisi açık gelir. Cips, süt, yumurta ve çay sepete uçar, rozet 1-2-3-4 sayar, ✓ belirir ve kamera ✓'nin içine dalar. |
| 8–12 sn | **Teslimat** | **Afşin'deki depomuzdan** · **Kuryeni canlı takip et** · **AFŞİN** | 3B gece haritası: sokak lambaları, ışıklı pencereler. Rota depodan eve çizilir, kurye ilerledikçe parlar. Kamera yatar, dağların arkasından AFŞİN yükselir, kapı zili çalar. |
| 12–16 sn | **Vaat** | **ortalama 60 dakikada kapında.** · **Komşun kadar yakın.** + 3 kart | Sayaç 0'dan 60'a çıkar (her artışta tık sesi), dakika halkası dolar. Ekran yana kayar, kartlar gelir: 09:00–23:00 arası açığız · 3D Secure · atıştırmalıktan temizliğe. |
| 16–20 sn | **Kapanış** | Logo · **Yakınla** · **Afşin'in marketi, cebinde.** · App Store · Google Play · yakinla.com | Kartlar tek noktaya çöker, pin uçtan büyür, halka çizilir, ibreler dönüp yerine oturur. Ses logosu G5–B5–D6 çalar ("Ya-kın-la"), konfeti patlar. |

**Ses:** 120 BPM. Akorlar Em → Em C G D → C D → G. Sahne geçişleri ölçü başlarına (4, 8, 12, 16. sn) denk gelir
ve logo G majöre çözülen bir kadansla açılır. 130'dan fazla efekt ipucu doğrudan `anim.js`'ten üretilir
(`build/cues.json`), bu yüzden her pop, tık ve whoosh ekrandaki hareketle aynı karede ve aynı yönde (pan)
duyulur. Kuryenin motor sesi bile ekrandaki konumuna göre sağ-sol kayar. Miks -14 LUFS'tur.

## Marka kuralları

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
./build.sh                         # → out/yakinla_showreel_20sn.mp4 (~4 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=12.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 6 alt-örnekle (180° obtüratör) çizilir, böylece gerçek hareket bulanıklığı oluşur. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
| `assets/` | Yakınla logo işareti (SVG). |
