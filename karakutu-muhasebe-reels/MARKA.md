# Karakutu — marka notları

Karakutu için yapılan her işte (video, görsel, sayfa) bu notlar geçerlidir.

## Logo

![Karakutu logosu](assets/karakutu-logo-orijinal.webp)

İşaret: iki dikey çubuk ve aralarında, çubuklara tam ortadan değen bir eşkenar dörtgen. Çizgiler eşit kalınlıkta,
uçları ve köşeleri yuvarlak. Kullanıcının verdiği orijinal dosyalar:

| Dosya | Ne zaman |
|---|---|
| [`assets/karakutu-logo.svg`](assets/karakutu-logo.svg) | Açık zemin. Renk `#1A1A1A`. |
| [`assets/karakutu-logo-beyaz.svg`](assets/karakutu-logo-beyaz.svg) | Koyu zemin. Renk `#FFFFFF`. |
| `assets/karakutu-logo-orijinal.webp` | Orijinal, 2000×2000, şeffaf zemin, siyah işaret. |
| `assets/karakutu-logo-beyaz-orijinal.png` | Orijinal, 800×800, şeffaf zemin, beyaz işaret. |

SVG'ler orijinalden ölçülerek çizildi (örtüşme IoU 0.995). 1000 birimlik kutuda geometri:

- Çubuklar: x = 240 ve x = 760, y = 240 → 760
- Eşkenar dörtgen köşeleri: (500, 300) · (760, 500) · (500, 700) · (240, 500)
- Çizgi kalınlığı 44, `stroke-linecap: round`, `stroke-linejoin: round`

Kurallar: işaret tek renk kullanılır (siyah ya da beyaz), oranları bozulmaz, döndürülmez, gölge/çerçeve eklenmez.
Logoyu yeniden çizmek yerine SVG'yi ya da `anim.js` içindeki `mark()` fonksiyonunu kullanın.
Yazı logosu (wordmark) verilmedi; videolarda "karakutu" Inter Display ile yazılıyor, "MUHASEBE" ayrı ve harf aralıklı.

## Ürün

- **Karakutu Muhasebe**: ön muhasebe programı · [www.karakutuveri.com/muhasebe](https://www.karakutuveri.com/muhasebe)
- Özellikler (kullanıcının verdiği liste): stok takibi, cari kayıt, carilere WhatsApp ile otomatik borç hatırlatma,
  program içinden e-Fatura kesme, gelen ve giden faturaları görme, teklif hazırlama.
- Doğrulanmamış iddia kullanılmaz: fiyat, ücretsiz deneme, "GİB onaylı", rakip karşılaştırması yok.
  Ekranlarda kişi/firma adları ve tutarlar örnektir.

## Renk

Logo siyah-beyazdır; resmî bir marka rengi verilmedi. Reels videosunda vurgu rengi olarak turuncu `#FF6A13`
(uçak kara kutusu turuncusu) kullanıldı. Kullanıcı bir marka rengi verirse bu satır güncellenmeli.

## Yapılan işler

- `out/konsept-panosu.jpg`: 6 konseptli Reels panosu (logo henüz yokken, yer tutucu küp ile).
- `out/karakutu_muhasebe_reels_38sn.mp4`: konsept 2 + 3, 38 sn, 9:16, gerçek logo ile.
- Türkçe dış ses: `voiceover.py` (Piper, ücretsiz/yerel) hazır; ses modeli huggingface.co'dan indirilir,
  bulut ortamında bu adrese ağ izni gerekir.
