# kripto724 · tanıtım filmi (Tasarım 05 · Cam & Hologram, aydınlık)

Seçilen 05 numaralı tasarımın aydınlık tonlu, Türkçe seslendirmeli hareketli videosu.
1920×1080 · 30 fps · yaklaşık 40 sn · H.264 + AAC, −14 LUFS.

## Hikâye (seslendirme ile birebir)

| # | Sahne | Seslendirme |
|---|-------|-------------|
| 1 | Dağınık camlar | Kripto bir uygulamada, hisse başka yerde, altın bambaşka bir sitede… |
| 2 | Tek uygulama | Artık hepsi tek uygulamada: Kripto yedi yirmi dört! |
| 3 | Canlı kripto | Bitcoin'den Cardano'ya, canlı fiyatlar yedi gün yirmi dört saat. |
| 4 | BIST ve Nasdaq | BIST'ten Nasdaq'a, iki yüz on hisse tek listede. |
| 5 | Kapalıçarşı altını | Kapalıçarşı altın fiyatları, canlı ve cebinde. |
| 6 | Kasam | Altınını, dövizini, tüm varlıklarını Kasam'da güvenle takip et. |
| 7 | Alarm ve analiz | Alarmını kur, analizleri incele, fırsatları yakala! |
| 8 | Bağla ve keşfet | Binance, Bitget ve MEXC hesabını bağla, komisyon indiriminden yararlan. |
| 9 | Kapanış | Kripto yedi yirmi dört… Ücretsiz ailemize katılın! kripto yedi yirmi dört nokta com. |

Ekrandaki tüm uygulama verileri müşterinin ekran görüntülerinden alındı; fiyatlar örnektir.
Sahne 3–8 boyunca köşede ve kapanışta "Yatırım tavsiyesi değildir. Fiyatlar örnektir." yazar.

## Görünüm

Açık lavanta → buz mavisi zemin, pastel ışık lekeleri ve bokeh; süt beyazı buzlu cam kartlar
(gerçek perspektif), yumuşak lavanta gölgeler, koyu çivit yazı (Unbounded / Manrope), marka
turuncusu vurgular, parlak jetonlar ve yükselen turuncu ok. Uygulama ekranları açık temada (Inter).
Resmî logo `../kripto724-tasarimlar/lib/k724logo.js` maskelerinden çizilir.

## Yapı

```
index.html            sayfa: ?t=12.4 tek kare · ?board sahne anahtar kareleri · ?play önizleme
src/timeline.js       sahne süreleri, seslendirme satırlarının başlangıçları (tools/fit_timeline.py yazar)
src/theme.js          aydınlık tema: cam, perspektif, uygulama ekranları, animasyon yardımcıları
src/s1.js … s9.js     sahneler: draw(g, u, D) yerel zamanın saf fonksiyonu + ses efekti işaretleri
src/main.js           geçişler (zoom-through), hareket bulanıklığı, cue sheet
render.cjs            Chromium ile kareleri çizer (WORKERS, ONLY, STILLS, AT, BOARD)
audio.py              müzik (120 BPM, Re majör) + efektler + seslendirme miksi
tools/fit_timeline.py seslendirmeyi 9 satıra böler, sahneleri satırlara ve vuruşlara oturtur
build.sh              hepsi: ./build.sh assets/seslendirme.mp3 out/kripto724_tanitim.mp4
```

Gereksinimler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.
