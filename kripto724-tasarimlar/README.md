# kripto724 · Video tasarım panoları

**Kripto724** (kripto724.com) için hazırlanan ~40 saniyelik tanıtım filmi altı farklı görsel
yönde tasarlandı. Her tasarım tek bir panoda; filmin 9 sahnesinin tamamı süreleri, hareket ve ses
notlarıyla birlikte aynı görselde yer alıyor. Seçilen tasarım, aynı çizim motoruyla
(`../allinvestview-showreel/`) hareketli videoya dönüştürülecek.

| # | Tasarım | Pano |
|---|---|---|
| 01 | **Neon Terminal**: gece hiç kapanmayan bir piyasa terminali; marka turuncusu neon, kayan fiyat bandı, glitch | [`out/tasarim_1.jpg`](out/tasarim_1.jpg) |
| 02 | **7/24 Saat**: tek bir 24 saatlik kadran; kripto 7/24, BIST, Nasdaq ve Kapalıçarşı saatleri, geceden şafağa | [`out/tasarim_2.jpg`](out/tasarim_2.jpg) |
| 03 | **Altın Seri**: siyah-altın lüks dergi estetiği; gravürlü Kapalıçarşı levhası, açılan Kasam kapısı | [`out/tasarim_3.jpg`](out/tasarim_3.jpg) |
| 04 | **Cesur Tipografi**: turuncu-siyah-beyaz renk blokları, dev rakamlar, sert kesmeler | [`out/tasarim_4.jpg`](out/tasarim_4.jpg) |
| 05 | **Cam & Hologram**: derin morda cam kartlar ve telefonlar, parlak turuncu jetonlar | [`out/tasarim_5.jpg`](out/tasarim_5.jpg) |
| 06 | **İstanbul Gecesi**: Boğaz, köprü, Galata, Kız Kulesi ve Kapalıçarşı; şehir ışıkları canlı veriye dönüşür | [`out/tasarim_6.jpg`](out/tasarim_6.jpg) |

Altısı yan yana: [`out/tasarimlar_genel_bakis.jpg`](out/tasarimlar_genel_bakis.jpg)

## Ortak kurgu

Hikâye her tasarımda aynı ve uygulamanın kendi ekranlarına dayanıyor: dağınık piyasalar → "Kripto, borsa
ve emtia tek uygulamada." → canlı kripto tablosu → BIST ve Nasdaq (210 hisse) → Kapalıçarşı canlı altın
fiyatları → Kasam → alarm ve analizler → Binance, Bitget, MEXC hesabını bağla, komisyon indirimi,
"Kripto hakkında her şey" → "Ücretsiz ailemize katılın!" ve kripto724.com. Ekrandaki veriler uygulamanın
ekran görüntülerinden alındı ve örnek amaçlıdır; kapanışta "Yatırım tavsiyesi değildir." notu var.
Onaylı iddialar ve uygulama ekranlarının ayrıntılı tarifi: [`BRIEF.md`](BRIEF.md).

## Logo

Resmî kripto724 logosu [`assets/kripto724-logo.png`](assets/kripto724-logo.png) dosyasından
`tools/make_logo.py` ile iki saydam katmana ayrıldı (`lib/k724logo.js`). Böylece logo koyu zeminlerde beyaz,
açık zeminlerde siyah yazılabiliyor; turuncu çizgi (#F7931A) her zaman aynı kalıyor ve oranlar asla
değişmiyor. Uygulamanın kendi bannerlarındaki yatay "kripto | 724" kullanımı `logoH()` ile çiziliyor
(Poppins Bold).

## Yeniden üretmek

```bash
python3 tools/get_fonts.py                       # yazı tipleri (npm @fontsource, SIL OFL)
python3 tools/make_logo.py                       # resmî logodan lib/k724logo.js
NODE_PATH="$(npm root -g)" node render.cjs       # → out/tasarim_1..6.png/.jpg
D=3 S=1,7 NODE_PATH="$(npm root -g)" node render.cjs   # tek sahneler, 1920×1080 → build/
python3 tools/overview.py                        # → out/tasarimlar_genel_bakis.jpg
```

| Dosya | Görevi |
|---|---|
| `designs/d1.js` … `d6.js` | Her tasarımın 9 anahtar karesi ve pano bilgileri (`window.DESIGN`) |
| `lib/core.js` | Ortak çizim araçları: yazı, sayaç, cam kart, 3B düzlem, yatay logo (`logoH`) |
| `lib/k724logo.js` | Resmî logo (`logo`, `logoW`), `tools/make_logo.py` üretir |
| `lib/board.js` | Pano yerleşimi; `index.html?d=N` pano, `&s=K` tek sahne |
| `render.cjs` | Headless Chromium ile PNG/JPEG üretimi |
| `fonts/` | Poppins, Anton, Space Grotesk, JetBrains Mono, Playfair Display, Sora, Unbounded, DM Serif Display, Manrope, Inter (hepsi SIL OFL) |
