# Yakınla Yemek — uygulama akışı reklamı (20 sn)

Uygulamanın gerçek akışını anlatan dikey (9:16, 1080×1920, 30 fps), sesli motion graphics reklam:
**uygulamayı aç → Yemek'e dokun → restoranını seç → sepetini oluştur → kurye kapına getirsin.**

**Çıktı:** [`out/yakinla_yemek_uygulama_20sn.mp4`](out/yakinla_yemek_uygulama_20sn.mp4) (H.264 + AAC, -14 LUFS) ·
senaryo görseli [`out/senaryo.png`](out/senaryo.png) · kapak [`out/kapak.jpg`](out/kapak.jpg)

## Akış

| # | Zaman | Sahne | Dış ses | Ekranda |
|---|---|---|---|---|
| 1 | 0–2,5 sn | Telefon aşağıdan süzülür, Yakınla açılış ekranı; etrafında yemekler döner. "aç" denince logo zıplar, halkalar yayılır. | "Acıktın mı Afşin? Yakınla'yı aç," | Acıktın mı, **Afşin?** |
| 2 | 2,5–4,7 sn | Uygulamanın ana ekranı: konum Afşin, harita, Market ve Yemek kartları. "dokun" kelimesinde Yemek kartına dokunulur, kart büyüyerek açılır. | "Yemek'e dokun!" | 1 · Yemek'e dokun |
| 3 | 4,7–6,8 sn | Yakınla Yemek: Restoranlar (Önerilen / En Yakın / Puan / En Hızlı), liste kayar; "seç" kelimesinde restorana dokunulur. | "Bölgendeki restoranı seç," | 2 · Restoranını seç |
| 4 | 6,8–10,5 sn | Menü: burger, patates ve içecek vuruşlarla (7,5 · 8 · 8,5 sn) sepete uçar, mavi sepet çubuğu sayar; "Sepete Git" → "Siparişin alındı!" | "sepetini oluştur!" | 3 · Sepetini oluştur |
| 5 | 10,5–12,8 sn | Mavi montlu, kasklı kurye motoruyla akşam ışığında Afşin sokağından geçer: alçak binalar, çatılarda güneş panelleri, arkada dağlar. | "Kurye siparişini kapına kadar getirsin!" | 4 · Kurye kapına getirsin! |
| 6 | 12,8–16 sn | Kapı: zil çalar, kapı açılır, içeriden sıcak ışık; kurye poşeti uzatır, içeriden uzanan el alır. | (müzik, kapı zili) | 4 · Kurye kapına getirsin! |
| 7 | 16–20 sn | Pin kurulur, orijinal Yakınla yazısı açılır, turuncu YEMEK etiketi; mağazalar, yakinla.com | "Yakınla Yemek, afiyet olsun!" | Afiyet olsun! |

**Dış ses:** ElevenLabs, ses **Dilara** (`eleven_v4`), tek kayıt (11,5 sn):

> [excited] Acıktın mı Afşin? Yakınla'yı aç, Yemek'e dokun! Bölgendeki restoranı seç, sepetini oluştur!
> Kurye siparişini kapına kadar getirsin! [happy] Yakınla Yemek, afiyet olsun!

Kayıt sessizlik noktalarından 8 cümleye bölünür ve her cümle ekrandaki karşılığına yerleşir (`js/scenes.js` → `VO`).

**Müzik ve efektler:** 120 BPM, G majör, sentez. Kanca (gerilim) → adımlar (G D Em C) → kurye (C D, motor sesi
ekrandaki konumuna göre sağ-sol kayar) → kapı (nefes, zil) → logo (G, ses logosu G5–B5–D6). Konuşma boyunca müzik
~14 dB, efektler ~8 dB kısılır; son miks -14 LUFS.

## Kurallar

- Ekranlar uygulamanın ana ekranı ve Yemek ekranı örnek alınarak kodla çizildi. Market ve Yemek kart görselleri
  (`assets/kart-*.png`) uygulamanın ekran görüntüsünden kırpıldı.
- Ekran görüntülerindeki gerçek adres, fiyatlar, teslimat süresi, "Ücretsiz Teslimat" ve "Min. 500 ₺" gösterilmez.
  Restoran adları jeneriktir (Burgerci, Çiğköfteci, Kebapçı); gerçek restoranlar ancak izinleriyle kullanılır.
- Kuryenin yüzü gösterilmez (vizörlü kask). Logo, orijinal logo dosyasından gelir.

## Yeniden üretmek

Dış ses depoya girmez. Önce ElevenLabs'teki kaydı `build/vo/dis_ses.mp3` olarak indirin (bkz. depodaki `CLAUDE.md`), sonra:

```bash
./build.sh                                        # → out/yakinla_yemek_uygulama_20sn.mp4 (~5 dk)
NODE_PATH="$(npm root -g)" node storyboard.cjs   # → out/senaryo.png
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg. Önizleme: `index.html?play` ya da `index.html?t=12.4`.

| Dosya | Görevi |
|---|---|
| `js/core.js`, `js/icons.js` | Yardımcılar ve premium ikon seti (`../yakinla-yemek` ile aynı). |
| `js/common.js` | Telefon çerçevesi, parmak, ışık, konfeti, logo parıltısı. |
| `js/scenes.js` | Zaman çizelgesi (`T`), dış ses yerleşimi (`VO`), uygulama ekranları, kurye ve kapanış sahneleri. |
| `js/main.js` | Geçişler, kamera sarsıntısı, ses ipuçları, kare üretimi (kare başına 6 alt-örnek hareket bulanıklığı). |
| `js/storyboard.js`, `storyboard.cjs` | Senaryo görseli. |
| `render.cjs`, `audio.py`, `build.sh` | Kare render, ses sentezi ve miks, uçtan uca üretim. |
