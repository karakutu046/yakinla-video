# Yakınla Market Andırın — 20 sn tanıtım videosu

Kahramanmaraş Andırın'da açılan Yakınla bayisi için dikey (9:16, 1080×1920, 30 fps), seslendirmeli motion graphics
tanıtım videosu. Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/yakinla_andirin_20sn.mp4`](out/yakinla_andirin_20sn.mp4) (H.264 + AAC, -14 LUFS) · kapak [`out/kapak.jpg`](out/kapak.jpg)

## Akış

| Zaman | Sahne | Dış ses | Ekranda |
|---|---|---|---|
| 0–3,6 sn | **Duyuru.** Andırın'ın çam ormanlı dağları ve kasabası; Yakınla pini gökten iner, zeminde halkalar, ANDIRIN etiketi. Kurdele gerilir, "açıldı" kelimesinde makasla kesilir, konfeti. | "Müjde Andırın! Yakınla Market, Andırın'da açıldı!" | MÜJDE ANDIRIN! · Yakınla Market · Andırın'da · **AÇILDI!** |
| 3,6–7,9 sn | **Uygulama.** Mağaza sayfasında "İndir"e dokunulur, yüklenir; ana ekran (konum Andırın, harita; Yemek kartında "Çok yakında"); Market'e dokunulur; süt, ekmek ve cips sepete; "Siparişi ver" → "Siparişin alındı!" | "Hemen uygulamayı indir, siparişini ver!" | Hemen indir! · App Store · Google Play → Siparişini ver! |
| 7,9–12,1 sn | **Hız.** Kurye motoruyla Andırın sokağından geçer (arkada çamlı dağlar); üstteki sayaç "altmış" kelimesinde 60'a varır; kapıda zil, poşet teslim. | "Market siparişin ortalama altmış dakikada kapına gelsin!" | **ortalama · 60 dk** · dakikada kapında! |
| 12,1–16,2 sn | **Teaser.** Servis kapağı titrer, "çok yakında"da aralanıp içinden ışık sızar ama açılmaz. | "Size bir haber daha: Yakınla Yemek de çok yakında Andırın'da!" | Size bir haber daha… · Yakınla Yemek · **ÇOK YAKINDA** · Andırın'da! |
| 16,2–20 sn | **Kapanış.** Pin kurulur, orijinal Yakınla yazısı açılır, ANDIRIN etiketi; mağazalar. | "Yakınla, Andırın'ın marketi cebinde!" | Andırın'ın marketi, cebinde! · App Store · Google Play · yakinla.com |

**Dış ses:** ElevenLabs, ses **Dilara** (`eleven_v4`), tek kayıt (16 sn):

> [excited] Müjde Andırın! Yakınla Market, Andırın'da açıldı! Hemen uygulamayı indir, siparişini ver! Market siparişin
> ortalama altmış dakikada kapına gelsin! Size bir haber daha: Yakınla Yemek de çok yakında Andırın'da!
> [happy] Yakınla, Andırın'ın marketi cebinde!

Kayıt sessizlik noktalarından 7 cümleye bölünür, her cümle ekrandaki karşılığına yerleşir (`js/timeline.js` → `VO`).

**Müzik ve efektler:** 120 BPM, G majör, sentez. Pin inişi ve kurdele kesimi büyük vuruşlarla, uygulama ve kurye
bölümleri groove ile, teaser kısık ve merak uyandıran bir bekleyişle, kapanış ses logosuyla (G5–B5–D6) eşleşir.
Konuşma boyunca müzik ~14 dB, efektler ~8 dB kısılır; son miks -14 LUFS.

## Marka kuralları

- Hız vaadi sitedeki güvenli ifadeyle verilir: **"ortalama 60 dakikada"**. Niteleyici düşürülmez.
- Yakınla Yemek Andırın'da henüz aktif değil: yalnız "çok yakında" denir; ana ekrandaki Yemek kartı "Çok yakında" rozetlidir.
- Fiyat, kampanya ve karşılaştırmalı iddia yok. Ürünler jenerik, etiketsiz ambalajlıdır.
- Mekân: çam ormanlı dağların eteğinde alçak katlı bir ilçe. Gerçek bir yapı ya da işletme temsil edilmez.
- Kuryenin yüzü gösterilmez (vizörlü kask). Logo, orijinal logo dosyasından gelir.

## Yeniden üretmek

Dış ses depoya girmez. Önce ElevenLabs'teki kaydı `build/vo/dis_ses.mp3` olarak indirin (bkz. depodaki `CLAUDE.md`), sonra:

```bash
./build.sh            # → out/yakinla_andirin_20sn.mp4 (~5 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg. Önizleme: `index.html?play` ya da `index.html?t=12.4`.

| Dosya | Görevi |
|---|---|
| `js/core.js`, `js/icons.js`, `js/common.js` | Yardımcılar, premium ikon seti, telefon çerçevesi ve ışık katmanları (diğer Yakınla projeleriyle aynı). |
| `js/market.js` | Market ürün ikonları (süt, ekmek, yumurta, cips, su), açılış kurdelesi ve makas. |
| `js/timeline.js` | Zaman çizelgesi (`T`) ve dış ses yerleşimi (`VO`). |
| `js/base.js` | `../yakinla-yemek-uygulama`'dan alınan ortak sahneler: uygulama ana ekranı, kurye, kapı, kapanış (Andırın'a uyarlandı). |
| `js/scenes.js` | Bu videoya özel sahneler: Andırın manzarası, mağaza sayfası, market ekranı, sayaç, Yemek teaser'ı. |
| `js/main.js` | Geçişler, kamera sarsıntısı, ses ipuçları, kare üretimi (kare başına 6 alt-örnek hareket bulanıklığı). |
| `render.cjs`, `audio.py`, `build.sh` | Kare render, ses sentezi ve miks, uçtan uca üretim. |
