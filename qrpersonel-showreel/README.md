# QR Personel — 30 sn motion graphics showreel

[qrpersonel.com](https://www.qrpersonel.com) için yatay (16:9, 1920×1080, **60 fps**) sesli motion graphics filmi.
Bir motion designer'ın özgeçmiş showreel'i gibi kurgulandı: 30 saniyede piksel animasyonu, kinetik tipografi, 3B kamera,
UI animasyonu, zaman atlaması, geçişler ve marka inşası art arda gelir. YouTube, LinkedIn, web sitesi ve sunumlar için uygundur.

**Çıktı:** [`out/qrpersonel_showreel_30sn.mp4`](out/qrpersonel_showreel_30sn.mp4) (H.264 + AAC, 1080p60, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü yok.
Müzik ve 300'den fazla ses efekti de sentezle üretilir, dışarıdan alınmış bir ses dosyası yok.

> **Videodaki QR kod gerçek.** `https://www.qrpersonel.com` adresini kodlar (QR sürüm 2-M, 25×25, [segno](https://pypi.org/project/segno/) ile üretildi).
> Filmin sonundaki kapanış kartında okutulabilir hâlde durur. Tarama sahnesinde de kısa aralıklarla okutulabilir.
> Okunabildiği anlar, sıkıştırılmış MP4'ten çıkarılan karelerin OpenCV ile çözülmesiyle doğrulandı (aşağıdaki "Doğrulama" bölümü).

## Akış

Müzik 128 BPM'dir: 1 ölçü 1,875 sn, 16 ölçü tam 30 sn eder. Her bölüm bir ölçü başında açılır.

| Zaman | Bölüm | Ekranda | Teknik |
|---|---|---|---|
| 0–3,75 sn | **01 Zaman** | `08:59:52` · PAZARTESİ · **Ekip geliyor…** · **Mesai başladı.** | Pikselden yapılmış saat. Saniyeler her vuruşta akar ve her tıkta bir ekip üyesi gelir. İki koltuk boş kalır, 09:00'da mercan rengine dönüp sallanır (geç kalanlar). Son yarım vuruşta 1/32'lik bir **elde zinciri** sağdan sola ilerler (59→00, 59→00, 08→09). Darbede kromatik sapma, nokta ızgarasından geçen şok dalgası ve piksel patlaması gelir. |
| 3,75–7,5 sn | **02 Piksel** | Saatin pikselleri → QR kod | `09:00:00`'ın 79 pikseli bölünerek 223 veri modülüne dönüşür ve yaylar çizerek dönüp yerine iner. Üç konum "gözü" vuruşlara çakılır. Ardından **sıvı bir dairesel maske** beyaz kartı açar ve modülleri koyuya çevirir. |
| 7,5–11,25 sn | **03 Okut** | **QR kodu okutun** → **Doğrulandı** · kimlik paneli | Vizör köşeleri ekran köşelerinden gelip kilitlenir. Lazer yavaşça tarar, geçtiği her satır **3B olarak döner** ve maviye geçer. Sağdaki panelde kimlik, şube ve vardiya rastgele karakterlerden çözülür; solda odak cetveli kamera yakınlaşmasını gösterir. Barkod bip'i duyulur. |
| 11,25–15 sn | **04 Giriş** | **Okut. Mesaine başla.** · telefon ekranı · giriş bildirimleri · **İçeride 45/53** | QR, onay dairesine çöker ve beyaz ekranı doldurur. Ardından **kamera geri çekilir ve bütün sahnenin bir telefon ekranı olduğu anlaşılır** (maske ve içerik eşleşmiş kesme). Bildirimler telefonun arkasından kayar, liste dolunca yukarı kayar; son ikisi geç kalanlardır. Sahne yatay kamçı geçişiyle kapanır. |
| 15–18,75 sn | **05 Çıkış** | **Gün bitti mi?** · `09:00 → 18:04` · **Çıkışta da okut.** · çalışma süresi halkası | Piksel saat bir **zaman atlamasıyla** akşama koşar. Güneş gökyüzünde bir yay çizer, ufuk sabah mavisinden akşam mercanına döner. Saat köşeye çekilir, telefon aşağıdan yükselir: küçük vizörde çıkış QR'ı okutulur, ekran döner ve çalışma süresi halkası dolar. Dikey kamçı geçişiyle kapanır. |
| 18,75–24,4 sn | **06 Veri** | **Kim geldi? Kim çıktı? Kim geç kaldı?** → **Hepsi tek ekranda.** → **Ay sonu mu? Puantaj hazır.** | QR kod tepeden görünür, kamera yatar ve **modüller 3B bir şehre yükselir**. 318 küp uçup bir giriş saati grafiğine dizilir; kamera bir **dolly-zoom** ile önden ortografik görünüme iner. Sonra aynı küpler bir **aylık puantaj takvimine** (Eylül 2026) yeniden dizilir: tam günler mavi, geç girişler mercan, hafta sonları soluk. |
| 24,4–30 sn | **07 Marka** | Logo · **QR Personel** · **QR kodla personel takibi** · www.qrpersonel.com · **Okut, siteye git** | Dönen iki kare ekranı kaplar. Logo büyük ölçekte inşa edilir: üç QR gözü vuruşlara çakılır, dördüncü köşeye "personel" karosu zıplar. Logo küçülerek yerine otururken kelime işareti arkasından kayarak çıkar. Finalde parlama, kare parçacıklar ve harf harf yazılan adres gelir. Son ölçüde logo sola kayar; sağa **gerçek, okutulabilir QR kartı** gelir, köşeler kilitlenir ve kısa bir tarama geçer. |

Showreel havası için bir **HUD katmanı** vardır: köşe işaretleri, canlı zaman kodu (SS:FF), REC noktası, bölüm adları
ve ilerleme çubuğu. Katman, marka sahnesinde temiz bir kapanış için kaybolur.

**Ses:** Akorlar Am Am → Am F → F G (boğuk) → Am F (drop) → C G → Am F G → Dm/G (kırılma) → C → F/C (plagal kapanış).
Tarama ölçülerindeki vuruşlar alçak geçiren filtreyle boğuktur, drop'ta filtre birden açılır. Zaman atlamasında yükselen bir arpej
saatlerin akışını taşır. Ses logosu, logo oturduğunda çalan G5 → C6 → E6 → G6 yükselen çan arpejidir.
336 efekt ipucu doğrudan `anim.js`'ten üretilir (`build/cues.json`). Bu yüzden saat tıkları, ekibin gelişi, modüllerin inişi,
vizör klikleri, lazer, zaman atlamasındaki her saat, sütunların yükselişi, küplerin yerine oturması ve adresin harf harf yazılışı
ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.

## Varsayımlar (lütfen kontrol edin)

Bu ortamdan qrpersonel.com'a erişilemedi (alan adı çözülmedi, ağ politikası da engelliyor). Bu yüzden:

- **Metinler** QR kodlu personel devam kontrol sistemi (PDKS) kategorisinin genel ifadeleridir: okut, giriş/çıkış,
  geç kalanlar, çalışma süresi, tek ekranda takip, puantaj. Fiyat, entegrasyon ya da sertifika iddiası yoktur.
  "Puantaj" ve "çıkışta okutma" özelliklerinin sitedeki ürünle örtüştüğünü kontrol edin.
  Grafik ve takvimdeki sayılar, isimler ve saatler örnek arayüz verisidir.
- **Logo** yer tutucudur: üç QR gözü ve bir kişi karosu. Gerçek logo `drawMark()` fonksiyonunda (anim.js) tek yerde çizilir.
- **Renkler** de yer tutucudur: elektrik mavisi #2F5BFF, nane #19E3A1, mercan #FF5C6C, kehribar #FFB547, gece laciverti #070B16.
  Hepsi `anim.js`'in başındaki `C` nesnesindedir.
- Marka adı "QR Personel" olarak yazıldı.

## Doğrulama

Son MP4 üzerinde yapılan kontroller:

- 1800 kare, tam 30,000 sn, 1920×1080, 60 fps, BT.709, H.264 High + AAC 256k.
- Ses: entegre -14,2 LUFS, gerçek tepe -1,2 dBTP.
- QR: sıkıştırılmış MP4'ten saniyede 20 kare çıkarıldı ve OpenCV ile (`QRCodeDetector` ve `QRCodeDetectorAruco`) çözüldü.
  Kod `https://www.qrpersonel.com` olarak şu aralıklarda okunuyor:
  - **28,8–30 sn, kesintisiz** (kapanış kartı)
  - 7,2–8,75 sn ve 10,0–11,3 sn (tarama sahnesi; aradaki boşlukta lazer satırları 3B çevirmektedir)

QR "gözlerinin" köşeleri bilerek ölçülü yuvarlatıldı. Daha yuvarlak gözler denendiğinde okuyucular kodu kaçırıyordu.

## Yeniden üretmek

```bash
./build.sh                         # → out/qrpersonel_showreel_30sn.mp4 (~20 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=16.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,600,1200 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 180° obtüratörle 6–24 alt-örnekle çizilir, böylece gerçek hareket bulanıklığı oluşur. Hızlı geçişlerde örnek sayısı artar. Kromatik sapma, gren ve HUD kare başına uygulanır. Bütün zamanlama baştaki `T` nesnesindedir ve ölçü/vuruş cinsinden yazılmıştır. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, filtre, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, lisansı `fonts/LICENSE-Inter.txt`). |
