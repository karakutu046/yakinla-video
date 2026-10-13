# Yakınla — 30 sn dikey motion graphics (Remotion)

[yakinla.com](https://yakinla.com) için Reels / TikTok / Shorts formatında tanıtım filmi.
1080×1920, 30 fps, tam 900 kare (30 sn), H.264.

**Çıktı:** [`out/yakinla-30sn.mp4`](out/yakinla-30sn.mp4)

Görüntüdeki her şey kodla çizilir; stok görsel, footage ya da yapay zekâ görüntüsü yok.
Logo, `public/yakinla-logo-mark.svg` dosyası olarak kullanılır (yeniden çizilmez); "Yakınla" yazısı Inter ile yazılır.

## Akış

| Zaman | Sahne | Ekran yazısı | Hareket ("vay" anı) |
|---|---|---|---|
| 0:00–0:03 | **Kanca** (gece) | Saat 23:40. · Evde süt bitti. · Market kapandı mı? | Lacivert zemin, amber lamba ışığı, uçuşan toz (parallax). Saat haneleri kilometre sayacı gibi döner, kelimeler tek tek vuruşla çakılır. Satırlar birikir, böylece her cümle en az 1,2 sn okunur. |
| 0:03–0:06 | **Logo** | Yakınla · Açığız · 08:00 – 01:00 | Pin yukarıdan düşer (yerçekimi, uzama/ezilme, hareket bulanıklığı), saat hanelerini saçar, sekip oturur. Çarpma noktasından yayılan halka ekranı mavi gradyanla doldurur. "Yakınla" harf harf açılır. |
| 0:06–0:12 | **Sepet** | Sepetini birkaç dokunuşla doldur. | Morph: logo ekranı telefonun açılış ekranıdır; kamera geri çekilir, telefon 3B eğimle yerine oturur. Çipler kaydırılır, "+" dokunuşlarıyla süt, ekmek ve yumurta sepete uçar; rozet 1 → 2 → 3. |
| 0:12–0:16 | **Ödeme** | Güvenli ödeme. | Arkada köşegen mavi wipe; ödeme sayfası alttan açılır (3D Secure kalkanı çizilir). "Siparişi Onayla" daireye büzülür, onay işaretine döner; telefonun dışına taşan halka patlaması ve konfeti. |
| 0:16–0:22 | **Canlı takip** | Kuryeni canlı takip et. · ortalama 60 dk · Kuryen yolda · Kapında! | Onay noktasından gece irisi. Telefonda kodla izdüşürülen 2.5B ilçe: alçak binalar, geniş cadde, sokak lambaları, arkada dağ silueti. Rota çizilir, kamera kuryeyi izler. Yandaki sayaç 0 → 60, halka dolar. |
| 0:22–0:26 | **Neden Yakınla** | Bölgendeki depodan hazırlanır · Ürünler başka şehirden kargoyla gelmez · Her gün 08:00 – 01:00 | Alttan yükselen eğik mavi panel. Kartlar 3B dönerek, hareket bulanıklığıyla uçar ve üst üste yığılır (~1,2 sn arayla). |
| 0:26–0:30 | **Kapanış** | Yakınla · Market artık yakınında. · App Store / Google Play · yakinla.com · Şu an aktif bölgemiz: Kahramanmaraş Afşin · Yeni şehir ve ilçeler ekleniyor | Merkezden mavi iris, ikon plakası ve pin düşüşü, harf harf logo. Tüm hareket 880. karede durur: son 0,67 sn sabit kapak karesi. |

## Kurallar nasıl karşılanıyor

- **Güvenli alan:** Önemli yazıların tamamı üstten 220 px, alttan 380 px içeride (y 220–1540).
- **Türkçe:** Inter (değişken, Latin + Latin Extended alt kümeleri `public/fonts/`). Büyük harf `toLocaleUpperCase('tr-TR')` ile (`src/lib.ts → upTR`).
- **Teslimat süresi:** Yalnızca "ortalama 60 dk" olarak geçer; "ortalama" sayacın üstünde ayrı, büyük bir etiket.
- **Yok:** fiyat, tutar, indirim, kampanya, stok adedi; karşılaştırmalı/mutlak iddia; markalı ambalaj (ürünler jenerik çizim); yemek siparişi; gerçek harita döşemesi ya da harita sağlayıcı logosu; gökdelen, deniz.
- **Bölge:** Uygulamada teslimat adresi "Afşin"; kapanışta aktif bölge notu.
- **Ses:** `public/muzik.mp3` varsa otomatik olarak alta konur (başta/sonda kısa fade). Yoksa video sessizdir.

## Çalıştırma

```bash
npm install
npm run studio                 # önizleme (Remotion Studio)
npm run render                 # → out/yakinla-30sn.mp4
node scripts/stills.mjs out/kareler 45 135 270 420 570 720 840   # kontrol kareleri
```

`remotion.config.ts`, bu ortamda Chrome indirilemediği için Playwright'ın Chromium Headless Shell'ini kullanır.
Başka bir makinede `REMOTION_BROWSER` ortam değişkeniyle kendi yolunuzu verin ya da o satırı silin
(Remotion kendi tarayıcısını indirir).

## Dosyalar

| Dosya | Görevi |
|---|---|
| `src/Video.tsx` | Sahneleri ve geçişleri üst üste dizer; müzik varsa ekler. |
| `src/lib.ts` | Ölçüler, renkler, sahne başlangıçları, çalışma saatleri (`HOURS`), analitik yay ve yerçekimi fonksiyonları. |
| `src/scenes/` | S1 kanca, S2 logo, `PhoneAct` (S3–S5, telefon hiç kaybolmaz), S6 kartlar, S7 kapanış. |
| `src/screens/` | Telefonun içindeki ekranlar: ana sayfa/sepet, ödeme sayfası, canlı takip haritası ve zaman çizelgesi. |
| `src/components/` | Telefon maketi, hareket bulanıklığı, zeminler, ikonlar, jenerik ürün çizimleri, kinetik tipografi, wipe. |
| `public/` | Logo SVG, mağaza rozetleri, Inter font dosyaları (SIL OFL 1.1). |

Animasyonun tamamı karenin saf fonksiyonudur (kesirli kareler dahil). `MotionBlur` bileşeni hızlı hareket eden
katmanları obtüratör aralığında 5–7 alt-örnekle yeniden çizip toplar; böylece gerçek hareket bulanıklığı oluşur.

## Mağaza rozetleri hakkında

Brief, rozetlerin `https://yakinla.com/badge-appstore.png` ve `badge-googleplay.png` dosyalarından alınmasını istiyor.
Bu render ortamından yakinla.com'a erişim ağ politikası tarafından engellendi. Yerine:

- `public/badge-appstore.png`: Apple'ın resmî "Download on the App Store" rozeti (developer.apple.com SVG'sinden PNG'ye).
- `public/badge-googleplay.png`: "GET IT ON Google Play" rozeti (Google'ın rozet çiziminin SVG kopyası; yalnızca saydam kenar boşluğu kırpıldı).

Rozetler 96 px ölçeğinin 1,25 katı olan 120 px yükseklikte gösterilir (sınır 1,3 kat). yakinla.com'daki dosyaları
aynı adlarla `public/` içine koyup `npm run render` çalıştırmanız yeterli; yerleşim değişmez.
