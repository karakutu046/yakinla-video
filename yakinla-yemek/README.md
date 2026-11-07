# Yakınla Yemek — 20 sn lansman reklamı

"Yakınla'da artık yemek siparişi de var!" duyurusu için dikey (9:16, 1080×1920, 30 fps), sesli
motion graphics reklam. Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/yakinla_yemek_20sn.mp4`](out/yakinla_yemek_20sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir: stok ikon, hazır footage ya da yapay zekâ görüntüsü yok. Yemek ikonları
(burger, pizza, dürüm, şiş kebap, patates, içecek), servis kapağı, restoran, kurye motoru, ev ve rozetler
hacimli "premium" bir setle çizilir: katmanlı gradyanlar, iç gölgeler, parlak vurgular ve katmanlar arası
yumuşak gölgeler. Kapanıştaki **Yakınla** yazısı, orijinal logo dosyasından birebir alınır
(`assets/yakinla-wordmark.png`). Pin ve saat işareti `assets/yakinla-logo-mark.svg` ile aynı yoldan çizilir.

## Akış

| Zaman | Sahne | Dış ses | Ekranda |
|---|---|---|---|
| 0–4 sn | **Kanca** | "Müjde Afşin! Yakınla'da artık yemek siparişi de var!" | **MÜJDE AFŞİN!** · servis kapağı titrer, kalkar; ışık patlamasıyla burger tabakta belirir, pizza, dürüm, kebap, patates ve içecek yörüngeye fırlar · **Yakınla'da artık / YEMEK / siparişi de var!** |
| 4–6,7 sn | **1 · Restoranını seç** | "Telefondan bölgendeki restoranı seç," | Telefon, yemeklerin birleştiği noktadan doğar. Market → **Yemek** sekmesi (YENİ), "Bölgendeki restoranlar" listesi; "seç" kelimesinde Burgerci kartına dokunulur, kart tam ekrana açılır. |
| 6,7–9,3 sn | **2 · Sepetini oluştur** | "sepetini oluştur," | Menüden burger, patates ve içecek vuruşlarla (7,5 · 8 · 8,5 sn) sepete uçar, sayaç artar, **Sepeti onayla**. |
| 9,3–12 sn | **3 · Kapına gelsin!** | "yemeğin kapına gelsin!" | Takip haritası: restorandan eve rota, kurye motoru ilerler; varışta kapı zili, onay rozeti, **Siparişin kapında!** |
| 12–16 sn | **Lansman** | "Yakınla Yemek, Afşin'de aktif edildi!" | **YENİ HİZMET** · beyaz logo yazısı + **Yemek** · büyük anahtar 13. sn'de **AKTİF** konumuna geçer (müzikte drop, konfeti) · **Afşin'de / aktif edildi!** |
| 16–20 sn | **Kapanış** | "Afiyet olsun!" | Pin ortada kurulur, sola kayar, Yakınla yazısı arkasından açılır; turuncu **YEMEK** etiketi, **Afiyet olsun!**, App Store · Google Play · yakinla.com |

**Dış ses:** ElevenLabs, ses **Dilara** (`eleven_v4`), doğal ve enerjik okuma, tek kayıt:

> [excited] Müjde Afşin! Yakınla'da artık yemek siparişi de var! Telefondan bölgendeki restoranı seç,
> sepetini oluştur, yemeğin kapına gelsin! [happy] Yakınla Yemek, Afşin'de aktif edildi! Afiyet olsun!

Kayıt (11,96 sn) sessizlik noktalarından 8 cümleye bölünür ve her cümle ekrandaki karşılığına yerleştirilir
(`js/scenes.js` → `VO`). Örneğin "yemek" kelimesi YEMEK yazısının çakıldığı vuruşa, "aktif" kelimesi ise
anahtar açıldıktan sonraki ölçü başına (14. sn) denk gelir.

**Müzik ve efektler:** 120 BPM, G majör, sentezle üretilir (dışarıdan ses dosyası yok). Akorlar G → G D Em C → C D → G.
Kapak açılışı, adım vuruşları, anahtarın açılması (drop) ve logo ölçü başlarına oturur. Efekt ipuçları
`js/main.js`'ten üretilir (`build/cues.json`), yani her pop, tık, whoosh ve kurye motoru ekrandaki hareketle
aynı karede ve aynı yönde (pan) duyulur. Konuşma boyunca müzik ~14 dB, efektler ~8 dB kısılır. Son miks -14 LUFS'tur.

## Marka kuralları

- Fiyat, indirim, teslimat süresi ya da karşılaştırmalı iddia yok. Marketin "ortalama 60 dakika" vaadi
  yemek siparişi için doğrulanmadığından kullanılmadı; aynı nedenle "canlı takip" de vaat edilmez.
- Restoran adları jeneriktir (Burgerci, Kebapçı, Pizzacı, Dürümcü). Gerçek bir işletmeyi ya da marka ambalajını temsil etmez.
- Yalnız Afşin geçer. Elbistan geçmez.
- Renkler marka paletinden: #1F73F0, #3B8BFF → #0E5FE0 gradyanı, logo yazısının koyu mavisi, sıcak kontrast için amber/turuncu.
- Logo yalnız lansman (beyaz siluet) ve kapanış sahnelerinde, orijinal dosyadan kullanılır.

## Yeniden üretmek

Dış ses dosyası depoya girmez. Önce ElevenLabs'teki kaydı `build/vo/dis_ses.mp3` olarak indirin
(bkz. depodaki `CLAUDE.md`), sonra:

```bash
./build.sh                         # → out/yakinla_yemek_20sn.mp4 (~5 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=12.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `js/core.js` | Sabitler, easing, yazı ve sprite yardımcıları. |
| `js/icons.js` | Premium ikon seti, arayüz ikonları ve logo işareti. |
| `js/scenes.js` | Zaman çizelgesi (`T`), dış ses yerleşimi (`VO`) ve dört sahne. |
| `js/main.js` | Geçişler, kamera sarsıntısı, ses ipuçları, kare üretimi. Her kare 6 alt-örnekle (180° obtüratör) çizilir, böylece gerçek hareket bulanıklığı oluşur. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar, ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, dış ses yerleşimi, sidechain, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Outfit ve Inter (SIL OFL 1.1, lisanslar `fonts/LICENSE-*.txt`). |
| `assets/` | Logo işareti (SVG) ve orijinal logodan kırpılmış Yakınla yazısı (PNG). |
