# Yakınla Yemek — 35 sn tanıtım filmi

"Yakınla Yemek Afşin'de aktif edildi! Uygulamayı kullanan aç kalmıyor!" duyurusu için dikey
(9:16, 1080×1920, 30 fps) sesli tanıtım filmi. Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/yakinla_yemek_35sn.mp4`](out/yakinla_yemek_35sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir. Hazır footage, stok görsel ya da yapay zekâ üretimi görüntü kullanılmaz.
Kapanıştaki logo, verilen logo görselinin ([`assets/yakinla-logo-kart.png`](assets/yakinla-logo-kart.png))
kendisidir: parçalara ayrılır ve sözle birlikte yeniden kurulur. Müzik ve efektler sentezle üretilir.
Dış ses ElevenLabs'te seslendirildi.

## Akış

| Zaman | Sahne | Ekranda | Dış ses |
|---|---|---|---|
| 0–4 sn | **Kanca** | Gün batar, ay doğar. Boş tabak, çatal ve bıçak, çalan bir zil. Tabak guruldar. | "Akşam oldu, karnın zil çalıyor mu?" |
| 4–8 sn | **Müjde** | **MÜJDE!** çakılır. **Yakınla Yemek** belirir, üstünde **YENİ** etiketi. "Afşin'de" anahtarı **AKTİF**'e geçer. | "Müjde! Yakınla Yemek, artık Afşin'de aktif!" |
| 8–15.5 sn | **Lezzetler** | Anahtarın düğmesi tabağa dönüşür. Tabağa her sözcükte bir yemek düşer: pide, lahmacun, kebap, burger, dondurma. Altı lezzet tabağın çevresinde döner, sonra yükselen telefona uçar. | "Pide mi, lahmacun mu, kebap mı, burger mı? Tatlısı da var! Afşin'in lezzetleri, tek uygulamada!" |
| 15.5–18.5 sn | **Sipariş** | Lahmacun seçilir, lahmacun ile ayran sepete uçar, "Siparişi onayla" → ✓ "Siparişin alındı!" | "Seç, sepete ekle, onayla!" |
| 18.5–23 sn | **Teslimat** | Kutu kapanır, üstüne logolu etiket yapışır. Hazırlanıyor → Yolda → Kapında. Kurye gece Afşin sokağından geçer, dağların arkasından AFŞİN yükselir. Kapı zili çalar. | "Siparişin hazırlanır, kapına gelir!" |
| 23–27.5 sn | **Vurgu** | Kapı açılır, sıcak ışık. Açılıştaki tabak bu kez dolu gelir: lahmacun ve ayran. **AÇ KALMIYOR!** | "Kısacası, uygulamayı kullanan aç kalmıyor!" |
| 27.5–35 sn | **Kapanış** | Tabak büyüyüp beyaz zemine dönüşür. Logo kurulur: pin düşer, saat ibreleri dönüp yerine oturur, YAKINLA harfleri yükselir, mağaza rozetleri gelir, "Ne Lazımsa, Yakınla." sözle birlikte belirir, en sonda yakinla.com ve "Afşinli yazılımcılar tarafından geliştirildi." | "Yakınla'yı hemen indir. Ne lazımsa, Yakınla!" |

## Dış ses

- **ElevenLabs**, ses **Dilara** (`D2dHiTSPRx6l2bhKGmyJ`), model `eleven_v4`, tek kayıt (22,8 sn). Doğal ve enerjik bir okuma:

  > [excited] Akşam oldu, karnın zil çalıyor mu? Müjde! Yakınla Yemek, artık Afşin'de aktif! Pide mi, lahmacun mu, kebap mı, burger mı? Tatlısı da var! Afşin'in lezzetleri, tek uygulamada! Seç, sepete ekle, onayla! Siparişin hazırlanır, kapına gelir! Kısacası, uygulamayı kullanan aç kalmıyor! [happy] Yakınla'yı hemen indir. Ne lazımsa, Yakınla!

- Kayıt, cümle aralarındaki sessizliklerden 11 parçaya bölünür. Her parça kendi sahnesine yerleşir
  (`anim.js` → `VO` tablosu). Ekrandaki her sözcük, ElevenLabs Scribe'ın verdiği kelime zamanına bağlıdır (`WORDS`).
  Böylece yemekler tam adları söylenirken tabağa düşer. Slogan da "Ne lazımsa, Yakınla!" denirken belirir.
- Ses dosyası `build/vo/dis_ses.mp3` yolundadır ve depoya girmez. Ses yalnızca montajlanmış MP4'ün içinde yer alır.
  Metin değişip ses yeniden üretilirse `VO` ve `WORDS` tabloları yeni kayda göre güncellenmelidir:
  sessizlikler `ffmpeg -af silencedetect=noise=-38dB:d=0.12`, kelime zamanları Scribe ile çıkarılır.

## Ses

120 BPM, sol majör. Ölçü başları "MÜJDE!" anına (3,95 sn) göre dizilir, böylece yemek bölümü (7,95),
dalış (17,95), kurye yolculuğu (19,95), dolu tabağın düşüşü (23,95) ve logonun düşüşü (27,95) ölçü başına oturur.
Akorlar Em (gece) → G D Em C G D Em C G D → (durak, kapı zili) → Em D → G C G.
Ses logosu, önceki Yakınla filmindekiyle aynı: G5 – B5 – D6 ("Ya-kın-la").

Yaklaşık 100 efekt ipucu `anim.js`'ten üretilir (`build/cues.json`). Bunlar zil, karın guruldaması, anahtar,
yemeklerin tabağa düşüşü, dokunuşlar, kutu, kurye motoru, kapı zili ve kapıdır. Dış ses her zaman üstte kalır.
Konuşma sırasında müzik dış sesin yaklaşık 13 dB altındadır, sidechain onu yaklaşık 9 dB daha kısar.
Efektler de yaklaşık 4 dB kısılır. Son miks iki geçişli loudnorm ile -14 LUFS'tur.

## Marka kuralları

- Ekranda ve dış seste yalnızca verilen duyuru ("Yakınla Yemek Afşin'de aktif edildi", "Uygulamayı kullanan
  aç kalmıyor") ile logodaki ifadeler ("Ne Lazımsa, Yakınla.", App Store / Google Play, yakinla.com,
  "Afşinli yazılımcılar tarafından geliştirildi.") kullanıldı.
- **Fiyat, kampanya, teslimat süresi, çalışma saati ya da restoran sayısı yok.** Marketteki "ortalama 60 dakika"
  vaadi yemek siparişi için doğrulanmadığı için kullanılmadı.
- Gerçek restoran adı ya da marka ambalajı yok. Yemekler jenerik çizimlerdir (pide, lahmacun, şiş kebap, burger,
  dondurma, ayran). Bunların uygulamadaki restoranların menüsüyle örtüştüğünü yayından önce kontrol edin.
- Mekân küçük bir Anadolu ilçesidir: alçak binalar, dağ silueti, AFŞİN. Gökdelen ya da deniz yok.
- Renkler marka paletinden gelir: #1F73F0 ve #3B8BFF → #0E5FE0 gradyanı. Kontrast için amber, "AKTİF" için yeşil kullanıldı.

## Yeniden üretmek

```bash
./build.sh                         # → out/yakinla_yemek_35sn.mp4 (~7 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg ve `build/vo/dis_ses.mp3`.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=25.3`: tek bir kare.

Tek kare render almak için: `ONLY=0,300,759 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı, dış ses zamanlaması ve efekt ipuçları. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 5 alt-örnekle (180° obtüratör) çizilir. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar. Efekt ipuçlarını ve dış ses tablosunu `build/cues.json`'a yazar. |
| `audio.py` | Müzik ve efekt sentezi, dış sesin yerleşimi, sidechain, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `assets/yakinla-logo-kart.png` | Verilen Yakınla logo görseli (şeffaf PNG). |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
