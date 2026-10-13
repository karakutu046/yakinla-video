# Yakınla — "Dışarıda kar" (15 sn, sinematik 3B)

[yakinla.com](https://yakinla.com) için dikey (1080×1920, 30 fps, 450 kare) tanıtım filmi. Reels, TikTok ve Shorts için hazır.

**Çıktı:** [`out/yakinla-kar-15sn.mp4`](out/yakinla-kar-15sn.mp4) (H.264 + AAC, -14 LUFS)

Önceki Yakınla videolarından (düz renkli 2B motion graphics, telefon arayüzü, gece haritası, kartlar) bilinçli olarak
farklıdır: gerçek zamanlı 3B (Three.js) bir sahne kodla kurulur. Işık, sis, alan derinliği (bokeh), bloom ve film
greni kullanılır. Hikâye bir **kar küresinin** içinden anlatılır. Dış ses yoktur; metni sinematik altyazılar taşır.
Görüntü ve ses tamamen kodla üretilir. Ücretli servis, yapay zekâ üretimi, stok görsel ya da indirilmiş müzik yoktur.

## Akış

| Zaman | Çekim | Altyazı | Görüntü |
|---|---|---|---|
| 0:00–0:03,7 | **Pencere önü** | *Dışarıda kar, / çayın şekeri bitti.* | Ceviz pervazda dantel üstünde ince belli çay bardağı (buharı tütüyor). Kamera kayarak boş şekerliğin üstünden geçer ve kar küresine varır. Pencerenin ardında kar yağar; uzakta kasaba ışıkları ve karlı dağlar görünür. |
| 0:03,7–0:05,5 | **Küreye dalış** | *Sen evden çıkma.* | Kamera küreye yaklaşır. İçinde kar savrulan minyatür kasaba (mavi çatılı depo dahil) görünür. Cama değildiği anda beyaz bir parlama olur. |
| 0:05,5–0:09,5 | **Kasaba** | *Afşin'deki depomuzdan / ortalama 60 dakikada kapında.* | Kamera karlı caddeye iner ve "Yakınla" tabelalı depoya yaklaşır. Kurye, logolu kutusuyla scooter'la depodan çıkar; kamera arkasından izler. Sahnede alçak katlı evler, sıcak ışıklı pencereler, sokak lambaları, karlı çamlar ve dağ silueti var. Gökdelen ve deniz yok. |
| 0:09,5–0:11,1 | **Kapı** | (devam) | Kapı açılır, içerinin sıcak ışığı karın üzerine taşar; kurye logolu poşeti uzatır. Kamera kar yağan gökyüzüne kalkar. |
| 0:11,1–0:12,5 | **Dönüş** | *Çayın tatlı olsun.* | Pencere önü: şekerlik dolmuş, arkada logolu poşet var, çaya bir küp şeker düşer. |
| 0:12,5–0:15 | **Kapanış** | — | Bulanıklaşan sahnenin üstünde logo, "Yakınla", *Afşin'de market artık yakınında.*, App Store / Google Play rozetleri, yakinla.com ve bölge notu yer alır. 3B zaman 436. karede durur; son 0,47 sn sabit kapak karesidir. |

**Ses:** 96 BPM'de müzik kutusu ninnisi (ölçü başları 0 / 2,5 / 5 / 7,5 / 10 / 12,5 sn), içeride boğuk, dışarıda açık
rüzgâr, şekerlikte porselen tınısı, küreye dalış ışıltısı, scooter motoru, karda adımlar, kapı zili, şekerin çaya düşüşü
ve kapanış akoru. Tamamı `scripts/ses.py` ile numpy kullanılarak sentezlenir ve iki geçişli loudnorm ile -14 LUFS'e getirilir.

## Marka kuralları

- Teslimat süresi yalnızca "ortalama 60 dakikada" olarak geçer. Fiyat, kampanya ya da karşılaştırmalı iddia yoktur.
- Mekân Afşin'i andıran küçük bir Anadolu ilçesidir; kapanışta aktif bölge notu yer alır.
- Logo resmî SVG dosyasından alınır (yeniden çizilmez); "Yakınla" Inter ile yazılır. Ürünler jeneriktir.
- Önemli yazılar y 220–1540 aralığında kalır (Reels/TikTok arayüzü).
- Türkçe karakterler için Inter ve Fraunces İtalik'in Latin + Latin Extended alt kümeleri kullanılır.

## Çalıştırma

```bash
npm install
./scripts/ses.sh                  # → public/ses.wav (sentez + -14 LUFS)
npm run render                    # → out/yakinla-kar-15sn.mp4
node scripts/stills.mjs out/kareler 60 140 230 312 350 420   # kontrol kareleri
```

WebGL yazılımsal ANGLE (`swangle`) ile çizilir, bu yüzden GPU gerekmez. `remotion.config.ts` bu ortamda Playwright'ın Chromium
Headless Shell'ini kullanır; başka bir makinede `REMOTION_BROWSER` ile kendi yolunuzu verin ya da o satırı silin.

| Dosya | Görevi |
|---|---|
| `src/Film.tsx` | 3B tuval, kamera, sahne seçimi, efekt zinciri (alan derinliği, bloom, ACES ton eşleme, vinyet) ve katmanlar. |
| `src/three/rig.ts` | Her karenin kamera konumu, hedefi, odak uzaklığı ve bokeh miktarı. |
| `src/three/Interior.tsx` | Pencere önü: torna profilli bardak, tabak, şekerlik, kar küresi ve içindeki minyatür kasaba. |
| `src/three/Town.tsx` | Karlı kasaba: örneklenmiş (instanced) evler ve çamlar, lambalar, depo, kapısı açılan ev, lastik izi. |
| `src/three/Courier.tsx` | Scooter, sürücü ve kapıda duran kurye (yüz yok; koyu vizör). |
| `src/three/path.ts` | Scooter'ın yay uzunluğuna göre hızlanan yolu, kapı ve kurye zamanlaması. |
| `src/three/Snow.tsx` | Deterministik kar parçacıkları (zamanın saf fonksiyonu). |
| `src/overlay/` | Altyazılar, kapanış kartı, geçiş parlamaları, film greni. |
| `scripts/ses.py`, `scripts/ses.sh` | Ses tasarımı ve ses yüksekliği normalizasyonu. |

Mağaza rozetleri: yakinla.com'daki dosyalara bu ortamdan erişilemediği için Apple'ın resmî "Download on the App Store"
rozeti ve "GET IT ON Google Play" rozeti kullanıldı. Asıl dosyaları aynı adlarla `public/` içine koyup yeniden
render etmeniz yeterli.
