# Yakınla: "Tek kapı, sekiz dünya" (15 sn motion graphics)

[yakinla.com](https://yakinla.com) için dikey (9:16, 1080×1920, 30 fps), sesli bir motion graphics filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazırdır.

**Çıktı:** [`out/yakinla_15sn.mp4`](out/yakinla_15sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

**Fikir:** Kamera hiç kıpırdamaz; ekranın ortasında tek bir kapı vardır. Kapı her ölçüde açılır ve arkasındaki
market başka bir tasarım diliyle görünür. Böylece sekiz ölçüde sekiz ayrı motion design tekniği tek kadrajda
gösterilir. Son ölçüde kapı Yakınla'nın konum pinine dönüşür: *Market alışverişiniz kapınızda.*

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü kullanılmaz.
Logo, marka dosyasındaki SVG yolundan birebir çizilir. Müzik ve efektler de sentezle üretilir.

## Akış (128 BPM · 8 ölçü = tam 15,0 sn)

| Ölçü · zaman | Dünya | Ekranda | Teknik |
|---|---|---|---|
| 1 · 0–1,9 sn | **Kapı** | Karanlık oda, kapı kenarlarından sızan ışık · **TIK TIK TIK** · **Kim o?** | Işık çizgisi trim'le çizilir; vuruşlarda kapı titrer, ses halkaları yayılır, kinetik yazı yayla çakılır. Kol iner, kapı aralanır, içeri ışık dolar. |
| 2 · 1,9–3,8 sn | **Kâğıt kesme** · Süt & kahvaltılık | Pop-up kitap gibi açılan raflar: süt, peynir, çay, bal, yumurta, ekmek, zeytin; çizgili market tentesi | Yeni dünya kapıdan daire olarak taşar. Kâğıt kemerler katman katman açılır; ürünler tabandan katlanarak kalkar. Kâğıt dokusu ve katman gölgeleri. |
| 3 · 3,8–5,6 sn | **Sonsuz reyon** · Temel gıda | Kapının ardında perspektifte uzayan market koridoru, tavan lambaları, hız çizgileri | Tarak geçişi. Tek noktalı 3B perspektifte ivmelenen kamera, sis ve derinlik. Koridorun sonundan bir dalga yaklaşır. |
| 4 · 5,6–7,5 sn | **Sıvı** · İçecek | Dalga kapıdan taşar, oda suyla dolar; içecekler ve "İçecek" yazısı su yüzünde yüzer | SVG "goo" filtresiyle birbirine yapışan damlalar, beyaz köpük kenarı, ışık huzmeleri, kostik, kabarcıklar. Su çekilir. |
| 5 · 7,5–9,4 sn | **Fizik** · Atıştırmalık | Kapıdan fırlayan 36 paket yere yığılır, sonra kapıya geri emilir | Güneş ışını açılımı. Kare kare önceden hesaplanmış deterministik katı cisim fiziği (çarpışma, sekme, sürtünme, yuvarlanma). |
| 6 · 9,4–11,3 sn | **Tek çizgi** · Temizlik & kişisel bakım | Sprey, şampuan, sabun, diş fırçası ve sünger, kalem hiç kalkmadan çizilir; her nesne bitince rengi dolar | Kapı çarpınca oda çizgiye dönüşür ve yeniden çizilir. Tek SVG yolu boyunca trim animasyonu, kabarcık ve parıltılar. |
| 7 · 11,3–13,1 sn | **Tipografi** | **MARKET / ALIŞVERİŞİNİZ / KAPINIZDA.** | Her satır bir vuruşta ve farklı bir hareketle gelir: kapıdan fırlayan harfler, gerilerek kayan harfler, menteşe gibi açılan harfler. Dördüncü vuruşta renkler kapıdan dışa doğru ters döner. |
| 8 · 13,1–15 sn | **Logo** | Kapı Yakınla pinine dönüşür · **Yakınla** · *Market alışverişiniz kapınızda.* · Afşin'de, ortalama 60 dakikada. · App Store · Google Play · yakinla.com | Kapı dikdörtgeni pin biçimine "erir", kapı dürbünü saat kadranı olur, ibreler dönüp yerine oturur. Konfeti ve iniş halkaları. |

Her karede 8 alt-örnekle (180° obtüratör) gerçek hareket bulanıklığı vardır.

**Ses:** Akorlar Am → F → G → Am → F → G → Am Am F G → C. Her dünyanın kendi tınısı var: kâğıtta marimba,
reyonda parlak arpej ve trampet rulosu, suda damla sesleri, fizikte zıplayan bas, çizgide yalın sinüs.
Su altındayken bütün müzik alçak geçiren filtreyle boğuklaşır, su çekilince açılır. Logo inerken ses logosu
E5–G5–C6 ("Ya-kın-la") çalar. 240'tan fazla efekt ipucu doğrudan animasyondan üretilir (`build/cues.json`).
Kapı vuruşları, kâğıt hışırtısı, damlalar, paketlerin tek tek düşüşü ve kalemin sürtünmesi ekrandaki hareketle
aynı karede ve aynı yönde (pan) duyulur. Miks -14 LUFS'tur.

## Marka kuralları

- Yalnızca sitedeki güvenli ifadeler kullanıldı: "ortalama 60 dakikada" ("ortalama" niteleyicisi korunur),
  "App Store / Google Play". Fiyat, kampanya ya da karşılaştırmalı iddia yok. Elbistan geçmez.
- Kategoriler sitedeki ürün yelpazesinden: süt & kahvaltılık, temel gıda, içecek, atıştırmalık, temizlik & kişisel bakım.
  Manav ürünü (meyve-sebze) gösterilmez.
- Ürünlerde gerçek marka ambalajı yok; hepsi jenerik çizimdir.
- Renkler marka paletinden: #1F73F0 ve #3B8BFF → #0E5FE0 gradyanı, yanında kontrast için amber.
- Hitap, sloganla uyumlu olarak "siz".

## Yeniden üretmek

```bash
./build.sh                         # → out/yakinla_15sn.mp4
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=12.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `src/core.js` | Zaman ızgarası (128 BPM), yardımcılar, yazı, logo, kapının 3B izdüşümü ve oda stilleri. |
| `src/scenes1.js` | Kapı, kâğıt kesme ve sonsuz reyon dünyaları; kapı açısı zaman çizelgesi. |
| `src/scenes2.js` | Sıvı ve fizik dünyaları, ürün çizimleri, fizik simülasyonu. |
| `src/scenes3.js` | Tek çizgi, tipografi ve logo dünyaları. |
| `src/main.js` | Geçişler, sarsıntı, parlama, gren, ses ipuçları ve kare üretimi. `draw(g, t)` zamanın saf fonksiyonudur. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, su altı filtresi, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
| `assets/` | Yakınla logo işareti (SVG). |
