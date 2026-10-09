# QR Personel — 15 sn motion graphics showreel

[qrpersonel.com](https://www.qrpersonel.com) için yatay (16:9, 1920×1080, **60 fps**) sesli motion graphics filmi.
Bir motion designer'ın özgeçmiş showreel'i gibi kurgulandı: 15 saniyede piksel animasyonu, kinetik tipografi, 3B kamera,
UI animasyonu, geçişler ve marka inşası art arda gelir. YouTube, LinkedIn, web sitesi ve sunumlar için uygundur.

**Çıktı:** [`out/qrpersonel_showreel_15sn.mp4`](out/qrpersonel_showreel_15sn.mp4) (H.264 + AAC, 1080p60, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü yok.
Müzik ve 200'den fazla ses efekti de sentezle üretilir, dışarıdan alınmış bir ses dosyası yok.

> **Videodaki QR kod gerçek.** `https://www.qrpersonel.com` adresini kodlar (QR sürüm 2-M, 25×25, [segno](https://pypi.org/project/segno/) ile üretildi).
> Videoyu 3,7–4,3 sn arasında (beyaz kart üzerinde koyu modüller) ya da 5,05–5,5 sn arasında (tarama sonrası mavi modüller) durdurup
> telefonla okutursanız siteye gidersiniz. Bu aralıklar, sıkıştırılmış MP4'ten çıkarılan karelerin OpenCV ile çözülmesiyle doğrulandı.

## Akış

Müzik 128 BPM'dir: 1 ölçü 1,875 sn, 8 ölçü tam 15 sn eder. Her sahne geçişi bir ölçü başına denk gelir.

| Zaman | Bölüm | Ekranda | Teknik |
|---|---|---|---|
| 0–1,9 sn | **01 Zaman** | `08:59:56` · PAZARTESİ · **Mesai başladı.** | Pikselden yapılmış saat. Saniyeler her vuruşta akar, son yarım vuruşta 1/32'lik bir **elde zinciri** sağdan sola ilerler (59→00, 59→00, 08→09). Darbede kromatik sapma, nokta ızgarasından geçen şok dalgası ve piksel patlaması gelir. |
| 1,9–3,75 sn | **02 Piksel** | Saatin pikselleri → QR kod | `09:00:00`'ın 79 pikseli bölünerek 223 veri modülüne dönüşür ve yaylar çizerek dönüp yerine iner. Üç konum "gözü" vuruşlara çakılır. Ardından **sıvı bir dairesel maske** beyaz kartı açar ve modülleri koyuya çevirir. |
| 3,75–5,6 sn | **03 Okut** | **QR kodu okutun** → **Doğrulandı** · kimlik paneli | Vizör köşeleri ekran köşelerinden gelip kilitlenir. Lazer tarar, geçtiği her satır **3B olarak döner** ve maviye geçer. Sağdaki panelde kimlik rastgele karakterlerden çözülür, solda odak cetveli kamera yakınlaşmasını gösterir. Barkod bip'i duyulur. |
| 5,6–7,5 sn | **04 Giriş** | **Okut. Mesaine başla.** · telefon ekranı · giriş bildirimleri | QR, onay dairesine çöker ve beyaz ekranı doldurur. Ardından **kamera geri çekilir ve bütün sahnenin bir telefon ekranı olduğu anlaşılır** (maske ve içerik eşleşmiş kesme). Bildirimler telefonun arkasından kayar, sonuncusu geç kalan biridir. Sahne kamçı geçişiyle (24 alt-örnek) kapanır. |
| 7,5–11,25 sn | **05 Veri** | **Kim geldi? Kim çıktı? Kim geç kaldı?** → **Hepsi tek ekranda.** | Aynı QR kod tepeden görünür, ardından kamera yatar ve **modüller 3B bir şehre yükselir**. Sonra 318 küp uçup bir giriş saati grafiğine dizilir. Kamera bir **dolly-zoom** ile önden ortografik görünüme iner, 3B şehir düz bir 2B grafiğe dönüşür: 09:00 mesai çizgisi, geç kalanlar mercan rengi. |
| 11,25–15 sn | **06 Marka** | Logo · **QR Personel** · **QR kodla personel takibi** · www.qrpersonel.com | Dönen iki kare (nane, mavi) ekranı kaplar. Logo inşa edilir: üç QR gözü üç köşeden vuruşlara çakılır, dördüncü köşeye "personel" karosu zıplar. Kelime işareti logonun arkasından kayarak çıkar. Finalde parlama süpürmesi, kare parçacıklar ve harf harf yazılan adres gelir. |

Showreel havası için bir **HUD katmanı** vardır: köşe işaretleri, canlı zaman kodu (SS:FF), REC noktası, bölüm adları
ve ilerleme çubuğu. Katman, marka sahnesinde temiz bir kapanış için kaybolur.

**Ses:** Akorlar Am → Am → F → Am (drop) → F → G → Dm/G (kırılma) → C (çözülme). Tarama ölçüsündeki dört vuruş alçak geçiren
filtreyle boğuktur, drop'ta filtre birden açılır. Ses logosu, logo oturduğunda çalan G5 → C6 → E6 → G6 yükselen çan arpejidir.
211 efekt ipucu doğrudan `anim.js`'ten üretilir (`build/cues.json`). Bu yüzden saat tıkları, modüllerin inişi, vizör klikleri,
lazer, sütunların yükselişi, küplerin yerine oturması ve adresin harf harf yazılışı ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.

## Varsayımlar (lütfen kontrol edin)

Bu ortamdan qrpersonel.com'a erişilemedi (alan adı çözülmedi, ağ politikası da engelliyor). Bu yüzden:

- **Metinler** QR kodlu personel devam kontrol sistemi (PDKS) kategorisinin genel ifadeleridir: okut, giriş yap, giriş/çıkış,
  geç kalanlar, tek ekranda takip. Fiyat, rakam, entegrasyon ya da sertifika iddiası yoktur.
  Grafikteki kişi sayıları, isimler ve saatler örnek arayüz verisidir.
- **Logo** yer tutucudur: üç QR gözü ve bir kişi karosu. Gerçek logo `drawMark()` fonksiyonunda (anim.js) tek yerde çizilir.
- **Renkler** de yer tutucudur: elektrik mavisi #2F5BFF, nane #19E3A1, mercan #FF5C6C, gece laciverti #070B16.
  Hepsi `anim.js`'in başındaki `C` nesnesindedir.
- Marka adı "QR Personel" olarak yazıldı.

## Yeniden üretmek

```bash
./build.sh                         # → out/qrpersonel_showreel_15sn.mp4 (~10 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=8.2`: tek bir kare.

Tek kare render almak için: `ONLY=0,240,480 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 180° obtüratörle 6–24 alt-örnekle çizilir, böylece gerçek hareket bulanıklığı oluşur. Hızlı geçişlerde örnek sayısı artar. Kromatik sapma, gren ve HUD kare başına uygulanır. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, filtre, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
