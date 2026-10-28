# kripto724 · Video tasarım panoları

**www.kripto724.com/app** için hazırlanan ~40 saniyelik AllInvestView tanıtım filmi altı farklı görsel
yönde tasarlandı. Her tasarım tek bir panoda; filmin 9 sahnesinin tamamı süreleri, hareket ve ses
notlarıyla birlikte aynı görselde yer alıyor. Seçilen tasarım, aynı çizim motoruyla
(`../allinvestview-showreel/`) hareketli videoya dönüştürülecek.

| # | Tasarım | Pano |
|---|---|---|
| 01 | **Neon Terminal**: gece borsası, neon yeşil, monospace, glitch | [`out/tasarim_1.jpg`](out/tasarim_1.jpg) |
| 02 | **7/24 Saat**: 24 saatlik kadran, geceden şafağa renk geçişi | [`out/tasarim_2.jpg`](out/tasarim_2.jpg) |
| 03 | **Altın Seri**: siyah-altın, serif, lüks dergi estetiği | [`out/tasarim_3.jpg`](out/tasarim_3.jpg) |
| 04 | **Cesur Tipografi**: dev harfler, sarı-siyah renk blokları, sert kesmeler | [`out/tasarim_4.jpg`](out/tasarim_4.jpg) |
| 05 | **Cam & Hologram**: yüzen cam kartlar, yanardöner 3B | [`out/tasarim_5.jpg`](out/tasarim_5.jpg) |
| 06 | **İstanbul Gecesi**: Boğaz silueti, şehir ışıkları veriye dönüşüyor | [`out/tasarim_6.jpg`](out/tasarim_6.jpg) |

Altısı yan yana: [`out/tasarimlar_genel_bakis.jpg`](out/tasarimlar_genel_bakis.jpg)

## Ortak kurgu

Hikâye her tasarımda aynı: dağınık yatırımlar → "Tüm yatırımların, tek ekranda." → panel → her varlık
ve piyasa → otomatik senkron → temettü → risk laboratuvarı → hızlı özellikler → "Ücretsiz başla — kredi
kartı gerekmez" ve www.kripto724.com/app. Ekrandaki iddialar yalnızca AllInvestView'un yayımladığı
özelliklerden alındı ([`BRIEF.md`](BRIEF.md)). Takip gerçek zamanlı değil, senkron her gece yapılıyor;
bu yüzden "canlı" ya da "7/24 takip" denmiyor. Ekrandaki tüm rakamlar örnek veridir.

kripto724.com sitesine bu ortamdan erişilemedi. Bu nedenle panolarda kripto724'e ait bir logo ya da
kurumsal renk yok; adres düz metin olarak geçiyor. Logo ve renkler gelirse seçilen tasarıma eklenir.

## Yeniden üretmek

```bash
python3 tools/get_fonts.py                       # yazı tipleri (npm @fontsource, SIL OFL)
NODE_PATH="$(npm root -g)" node render.cjs       # → out/tasarim_1..6.png/.jpg
D=3 S=1,7 NODE_PATH="$(npm root -g)" node render.cjs   # tek sahneler, 1920×1080 → build/
python3 tools/overview.py                        # → out/tasarimlar_genel_bakis.jpg
```

| Dosya | Görevi |
|---|---|
| `designs/d1.js` … `d6.js` | Her tasarımın 9 anahtar karesi ve pano bilgileri (`window.DESIGN`) |
| `lib/core.js` | Ortak çizim araçları: yazı, sayaç, cam kart, 3B düzlem, AllInvestView wordmark |
| `lib/board.js` | Pano yerleşimi; `index.html?d=N` pano, `&s=K` tek sahne |
| `render.cjs` | Headless Chromium ile PNG/JPEG üretimi |
| `fonts/` | Anton, Space Grotesk, JetBrains Mono, Playfair Display, Sora, Unbounded, DM Serif Display, Manrope, Inter (hepsi SIL OFL) |
