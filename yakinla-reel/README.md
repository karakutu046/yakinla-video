# Yakınla — 15 sn "özellikler" reel'i

**@yakinla_com** için dikey (9:16, 1080×1920, 30 fps) sesli sosyal medya videosu.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazırdır.

**Çıktı:** [`out/yakinla_reel_15sn.mp4`](out/yakinla_reel_15sn.mp4) (5 MB, H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

`yakinla-showreel/` klasöründeki 20 saniyelik filmden bilinçli olarak farklı bir görsel dili vardır.
Degrade, parıltı, illüstrasyon ya da 3B harita kullanılmaz. Onun yerine düz renk blokları, ekranı dolduran
dar yazı (Anton), monospace veri etiketleri (JetBrains Mono), her vuruşta bir kesme ve geometrik hareket vardır.
İki filmin ortak tek öğesi resmi logo işaretidir. Görüntüdeki her şey kodla çizilir; müzik ve efektler sentezle
üretilir. Hazır footage, stok görsel ya da yapay zekâ üretimi yoktur.

## Akış

128 BPM'de 1 ölçü 1,875 sn sürer; 8 ölçü tam 15 sn eder. Her sahne bir ölçünün başında başlar.

| Zaman | Sahne | Ekranda | Hareket ve ses |
|---|---|---|---|
| 0–1,9 sn | **Kanca** | **MARKETE Mİ ÇIKIYORSUN?** → **DUR.** → **YAKINLA GETİRSİN.** | Lacivert zemin. "DUR." amber zeminde dikey gerilmiş olarak çakılır ve müzik bant gibi yavaşlayıp durur. Ardından sessizlik, trampet rulosu, yükseliş ve drop. |
| 1,9–3,8 sn | **01 Sipariş** | **DOKUN. → EKLE. → ONAYLA.** | Her vuruşta kelime değişir. Fişe SÜT, EKMEK ve ÇAY satırları "+1" ile eklenir. "ONAYLANDI ✓" damgası basılır. Mavi panjur şeritleri kapanır. |
| 3,8–5,6 sn | **02 Teslimat** | **ORTALAMA 60 DK · DAKİKADA KAPINDA.** | 60 sayısının haneleri gerçekten döner. 0–60 dk cetveli dolar. Ekran yatay savrulur. |
| 5,6–7,5 sn | **03 Yerel depo** | **AFŞİN'DEKİ DEPOMUZDAN.** · Ürünler başka şehirden kargoyla gelmez. | AFŞIN harf harf çakılır. İ'nin noktası amber bir konum noktası olarak düşer, yanında artı işareti ve koordinat (38.2°K 36.9°D) belirir. Nokta açılarak sonraki sahneye geçilir. |
| 7,5–9,4 sn | **04 Canlı takip** | **KURYENİ CANLI TAKİP ET.** · ● CANLI | DEPO → YOLDA → KAPINDA hattında kurye ilerler. Motor sesi ekrandaki konumuna göre sağa sola kayar. |
| 9,4–11,3 sn | **05 + 06** | **3D SECURE** ile güvenli ödeme / **09:00–23:00** arası açığız | Kilit kapanır. 3. vuruşta ekran bölünür ve 24 saatlik çubukta 09–23 arası dolar. |
| 11,3–15 sn | **Kapanış** | Logo · **Yakınla** · AFŞİN'İN MARKETİ, CEBİNDE. · App Store · Google Play · **@yakinla_com** · yakinla.com · **UYGULAMAYI İNDİR** | Paneller ikiye ayrılır ve mavi ekran logonun pinine çöker. Ses imzası G5–A5–C6 çalar, logo köşeye geçer, künye daktiloyla dizilir. Son vuruş 14,06. sn'dedir. |

Üstteki 6 parçalı ilerleme çizgisi hikâye formatına göz kırpar ve hangi özellikte olunduğunu gösterir. Anahtar metinler
Reels ve TikTok arayüzünün kapattığı alt ~300 piksele taşmaz.

**Ses:** 128 BPM, La minör. Akorlar Am F C G → F G (gerilim) → C. Kapanış Do majöre çözülür. Ses ögeleri 808 bas,
filtre zarflı akor vuruşları (hafif formant rengiyle), swing'li hi-hat ve sidechain'dir. 220'den fazla efekt ipucu
doğrudan `anim.js`'ten üretilir (`build/cues.json`). Bu sayede her daktilo tıkı, sayaç tıkırtısı ve whoosh ekrandaki
hareketle aynı karede ve aynı yönde (pan) duyulur. Miks -14 LUFS, gerçek tepe ≤ -1,3 dBTP'dir.

## Marka kuralları

- Sadece sitedeki güvenli ifadeler kullanıldı: "ortalama 60 dakikada kapında", "Afşin'deki depomuzdan",
  "ürünler başka şehirden kargoyla gelmez", "kuryeni canlı takip et", "3D Secure ile güvenli ödeme",
  "App Store / Google Play". Çalışma saatleri **09:00–23:00**'tür. "Ortalama" niteleyicisi ayrı bir etiket olarak vurgulanır.
- Karşılaştırmalı iddia, fiyat ya da kampanya yok. Elbistan geçmez. Manav ürünü (meyve-sebze) yok.
- Renkler marka paletinden gelir: #1F73F0 mavi, kontrast için lacivert, kâğıt beyazı ve amber.
- Logo yalnızca kapanışta yer alır ve marka dosyasındaki SVG yolundan birebir çizilir.

## Yeniden üretmek

```bash
./build.sh                         # → out/yakinla_reel_15sn.mp4 + out/kapak.jpg (~1 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=6.2`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 6 alt-örnekle (180° obtüratör) çizilir, böylece gerçek hareket bulanıklığı oluşur. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi: bant durması, sidechain, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264, kapak. |
| `fonts/` | Anton ve JetBrains Mono (SIL OFL 1.1, lisanslar `fonts/LICENSE-*.txt`). |
| `assets/` | Yakınla logo işareti (SVG). |
