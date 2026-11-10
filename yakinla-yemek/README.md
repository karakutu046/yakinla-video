# Yakınla Yemek — 16 sn duyuru filmi

"Yakınla Yemek bölgemizde aktif!" duyurusu için dikey (9:16, 1080×1920, 30 fps) sesli motion graphics film.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/yakinla_yemek_16sn.mp4`](out/yakinla_yemek_16sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir (ikonlar dahil); stok görsel ya da yapay zekâ üretimi görüntü yok.
Müzik ve efektler sentezdir. Dış ses ElevenLabs ile üretilmiştir.

## Akış

| Zaman | Sahne | Dış ses | Ekranda |
|---|---|---|---|
| 0–3.5 sn | **Duyuru** | Yakınla Yemek bölgemizde aktif! | Logo ortadan açılır, sekiz yemek ikonu dışarı saçılır. **Yakınla** + amber **Yemek** damgası, konum pini ile **bölgemizde**, yeşil **AKTİF!** rozeti (canlı noktası, konfeti). |
| 3.5–5.5 sn | **Sipariş** | Sen de siparişini ver, | Telefon aşağıdan gelir. Burger ve pizza sepete uçar, sayaç artar, **Siparişi Ver** düğmesi yeşile döner. |
| 5.5–8.5 sn | **Teslimat** | kapına kadar getirelim! | Gün batımında ilçe sokağı: mavi montlu kurye motoruyla gelir, kapı açılır, poşet kapıya konur, **Afiyet olsun!**. |
| 8.5–11.5 sn | **Slogan** | Ne lazımsa, Yakınla! | Yemek ve market ikonları halka olur, tek noktaya çöker ve logoya dönüşür. **Yakınla!** vuruşa çakılır. |
| 11.5–16 sn | **Kapanış** | App Store ve Google Play'den indirin! | Logo · **Yakınla Yemek** · Ne lazımsa, Yakınla! · App Store · Google Play · **Hemen İndir** · yakinla.com |

**Müzik:** 120 BPM, G majör (G D Em C → D → G Em C D → G). "Yakınla!" 10. saniyedeki ölçü başına,
ses logosu (G5–B5–D6) 15. saniyeye oturur. Efekt ipuçları doğrudan `anim.js`'ten üretilir (`build/cues.json`),
bu yüzden her pop, tık ve whoosh ekrandaki hareketle aynı karededir. Konuşma sırasında müzik kısılır.

## Dış ses

Metin (ElevenLabs, ses **Dilara** `D2dHiTSPRx6l2bhKGmyJ`, model `eleven_v4`, tek kayıt):

> [excited] Yakınla Yemek bölgemizde aktif! Sen de siparişini ver, kapına kadar getirelim! [happy] Ne lazımsa, Yakınla! App Store ve Google Play'den indirin!

Kayıt `build/vo/dis_ses.mp3` olarak indirilir (`build/` git'e girmez; ses depoya yalnızca MP4'ün içinde girer).
Kayıt, cümle aralarındaki sessizliklerden dört parçaya bölünüp sahnelere yerleştirilir: `anim.js` içindeki `VO` listesi.
Ses yeniden üretilirse sessizlik yerleri değişir; `ffmpeg -af silencedetect=noise=-34dB:d=0.07` ile ölçülüp
`VO` listesindeki `src` aralıkları güncellenmelidir.

## Yeniden üretmek

```bash
./build.sh                         # → out/yakinla_yemek_16sn.mp4 (~3 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg ve `build/vo/dis_ses.mp3`.

Önizleme için **depo kökünü** bir HTTP sunucusuyla açın (yazı tipleri `../yakinla-showreel/fonts` altından yüklenir):
`yakinla-yemek/index.html?play` (gerçek zamanlı) ya da `?t=10.2` (tek kare).

| Dosya | Görevi |
|---|---|
| `anim.js` | Sahneler, yemek ikonları, dış ses yerleşimi ve ses ipuçları. `draw(g, t)` zamanın saf fonksiyonudur. |
| `engine.js` | Ortak çekirdek (yardımcılar, yazı, logo, market ikonları); `yakinla-showreel/anim.js`'in ilk bölümüyle aynıdır. |
| `render.cjs` | Headless Chromium'da kareleri PNG'ye basar (kare başına 6 alt-örnek: hareket bulanıklığı). |
| `audio.py` | Müzik + efekt sentezi (enstrümanlar `yakinla-showreel/audio.py`'den), dış ses yerleşimi ve ducking. |
| `build.sh` | Uçtan uca üretim: kareler, ses, iki geçişli loudnorm, BT.709 x264, kapak. |

## Notlar

- Metin kullanıcının verdiği duyuru metnidir; fiyat, süre ya da kampanya iddiası eklenmedi.
- Mağaza düğmelerinde Apple / Google logoları yerine jenerik indirme ikonu kullanıldı.
- Menüdeki yemekler (Burger, Pizza, Dürüm) örnektir; gerçek marka ambalajı ya da restoran adı yok.
