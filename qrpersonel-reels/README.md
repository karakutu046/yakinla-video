# QR Personel — Instagram Reels tanıtım videosu (9:16)

[qrpersonel.com](https://www.qrpersonel.com) için dikey (1080×1920) SaaS tanıtım filmi.
İki film var, ikisi de 30 sn, 1080×1920, H.264 + AAC, -14 LUFS:

| Film | Dosya | Kapaklar |
|---|---|---|
| Konsept A · Vizör (60 fps) | [`out/qrpersonel_reels_30sn.mp4`](out/qrpersonel_reels_30sn.mp4) | [`kanca`](out/kapak_kanca.jpg) · [`logo`](out/kapak_logo.jpg) |
| Konsept H · Kâğıt Kesik (24 fps, 12 fps stop-motion) | [`kagit-kesik/out/qrpersonel_reels_kagit_kesik_30sn.mp4`](kagit-kesik/out/qrpersonel_reels_kagit_kesik_30sn.mp4) | [`kanca`](kagit-kesik/out/kapak_kanca.jpg) · [`logo`](kagit-kesik/out/kapak_logo.jpg) |

Görüntüdeki her şey kodla çizilir, müzik ve efektler sentezle üretilir: stok görüntü ya da dış ses dosyası yok.

## Film: Konsept A · Vizör

Logonun köşe parantezleri filmin kamerasıdır: tek bir vizör çerçevesi sahneden sahneye süzülür ve her şeyi o "okur".
Siyah-beyaz, tek vurgu rengi sinyal yeşili. Müzik minimal tech-house, 120 BPM; 15 ölçü tam 30 saniye eder ve
her sahne bir ölçü başında açılır.

| Zaman | Sahne | Ekranda | Hareket |
|---|---|---|---|
| 0–3,75 sn | Kanca | **Kim geldi? → geç kaldı? → çıktı?** | Parantezler ilk karede çakılır, ikinci satır vuruşlarda değişir, yazılar yeşil bir odak noktasına çekilir. |
| 3,75–7 sn | Okut | **Okut.** | Vizör noktadan QR levhasına açılır ve kilitlenir; modüller dalgayla dolar, yeşil tarama, bip, onay rozeti. |
| 7–8 sn | Dönüşüm | | QR'ın 322 modülü beyaza döner ve logodaki kişi siluetine akar. |
| 8–12 sn | Giriş | **Giriş yapıldı. 08:57:12** · AYŞE YILMAZ · MERKEZ OFİS | Yeşil onay, isim harf harf yazılır, saat haneleri çark gibi döner; kişi ızgaranın ilk hücresine küçülür. |
| 12–16 sn | Ekip | **41 / 48 içeride · Ekibin, tek bakışta.** | Tek kişi 48 kişilik ızgaraya çoğalır; gelenler yeşil parlayıp beyaza döner, geç kalanlara kırmızı nokta. |
| 16–20 sn | Çıkış | **Gün bitti mi? · 18:04 · 9 sa 04 dk · Çıkışta da okut.** | 09:00'dan 18:04'e zaman atlaması, ardından çalışma süresi halkası dolar. Müzik yarım zamana iner. |
| 20–24 sn | Özellikler | **GİRİŞ. ÇIKIŞ. PUANTAJ.** → Eylül takvimi | Kelimeler vuruşla çakılır, vizör her birine atlar; PUANTAJ başlığa küçülür ve aylık takvim dolar. |
| 24–30 sn | Marka | **QR Personel · QR kodla personel takibi · qrpersonel.com · Hemen başlayın →** | Ekran beyaza döner, vizör uygulama ikonunun parantezlerine iner, üç kişi sırayla zıplar (üç çan: ses logosu), adres harf harf yazılır. |

**Reels güvenli alanı:** kritik yazılar y 250–1480 ve x 70–940 arasında. Üstteki başlık çubuğu, alttaki açıklama ve
sağdaki beğeni düğmeleri hiçbir yazının üstüne binmez.

**Ses:** Re minör (Dm7 · B♭maj7 · Gm7) gerilimi logo indiğinde Fa majöre (Fmaj7) çözülür. Tarama ölçülerinde vuruşlar
boğuk, 8. saniyede drop. 179 efekt ipucu `anim.js`'ten üretilir (deklanşör, tık, bip, harf sesleri), her biri ekrandaki
hareketle aynı karede duyulur.

**Varsayımlar:** Ekrandaki isimler, saatler ve sayılar örnek arayüz verisidir. "Çıkışta okutma" ve "puantaj"
özelliklerinin üründe olduğunu varsaydık; sitedeki ürünle örtüştüğünü kontrol edin.

## Film: Konsept H · Kâğıt Kesik

Kraft zemin üstünde kâğıt kolaj, 12 fps stop-motion: her çizim iki kare ekranda kalır ve her parça her adımda hafifçe
"kaynar" (elle yeniden konmuş gibi). Hareket bulanıklığı yok; parçalar düşer, yapıştırılır, makasla kesilir, iple sallanır.
Palet: kâğıt beyazı, mürekkep, kiremit, hardal, adaçayı, mavi. Kod `kagit-kesik/` klasöründe; ortak `lib.js`'i kullanır.

| Zaman | Sahne | Ekranda | Hareket |
|---|---|---|---|
| 0–4 sn | Kanca | **KİM GELDİ?** · İMZA FÖYÜ · "Ali? 9:15 ??" · "Kart kayıp!" | Föy masaya düşer, fidye notu harfleri tek tek çakılır, yapışkan notlar ve ataş eklenir. |
| 4–8 sn | Okut | **OKUT.** | Makas föyü kesik çizgi boyunca keser, iki yarı savrulur; kâğıt QR kart düşer, modüller satır satır dizilir, üç göz pop eder. |
| 8–14 sn | Giriş | **Günaydın, Ali! Tam vaktinde.** · GİRİŞ 08:57 · **Okuttun, girdin.** | QR küçülüp kâğıt telefona girer, adaçayı köşeler ve tarama şeridi, onay rozeti; giriş etiketi ipte sallanır. Açılıştaki "9:15 ??" notunun cevabı. |
| 14–18 sn | Ekip | **08 → 21 → 37 → 45 / 53 İÇERİDE** · **Ekip tamam mı? Bir bakışta.** | 15 kâğıt figür sırayla ayağa kalkar, sayaç kartları değişir; çıkışta figürler devrilir. |
| 18–24 sn | Puantaj | **EYLÜL** · **PUANTAJ HAZIR** · **Ay sonu? Hazır.** | Takvime yeşil/kiremit çıkartmalar yapışır, lastik damga iner, vurur, mürekkep izi bırakır. |
| 24–30 sn | Marka | **QR Personel · QR kodla personel takibi · qrpersonel.com · Hemen başlayın →** | Logo kâğıttan yeniden kurulur: siyah kart, dört parantez parçası, üç kişi; adres etiketi ipte sallanır. |

**Ses:** Do majör akustik gitar (Karplus-Strong sentezi, C · G · Am · F), yumuşak kick, el çırpma, shaker; 120 BPM, 15 ölçü.
Logo ölçüsünde ritim durur, glokenşpil arpeji (Mi–Sol–Do–Mi) ses logosu olur. 155 kâğıt efekti (harf şaplağı, makas,
yırtılma, damga, ip, tık) `anim.js`'ten üretilir ve görüntüyle aynı adımda duyulur.

Ekrandaki QR gerçek ve okunur (https://www.qrpersonel.com).

```bash
./kagit-kesik/build.sh   # → kagit-kesik/out/qrpersonel_reels_kagit_kesik_30sn.mp4 (~8 dk)
```

## Yeniden üretmek (Konsept A)

```bash
./build.sh            # → out/qrpersonel_reels_30sn.mp4 (~11 dk)
```

Tek kare: `index.html?t=12.4` (HTTP sunucusuyla açın) ya da
`ONLY=0,600,1200 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `lib.js` | Ortak çizim kütüphanesi: vektör logo, QR, telefon, yazı yardımcıları (storyboard ve film aynı kodu kullanır). |
| `anim.js` | Filmin tamamı. `draw(g, t)` zamanın saf fonksiyonu; her kare 6–10 alt-örnekle hareket bulanıklığıyla çizilir. Zamanlama baştaki `T` nesnesinde, ölçü/vuruş cinsinden. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, yankı, limit. |
| `render.cjs`, `build.sh` | Kare render (headless Chromium) → ses → iki geçişli loudnorm → x264. |

---

Ön prodüksiyon: seçim için hazırlanan sekiz konsept storyboard'u aşağıda.

## Storyboard panoları

Her pano, bir konseptin 6 anahtar karesini zaman, ekrandaki yazı ve hareket/ses notlarıyla tek görselde gösterir.
Karelerin hepsi videoyu üretecek aynı kodla çizildi. Yani panodaki görüntü, filmin o anının gerçek bir render'ıdır.

| Konsept | Pano | Kısaca |
|---|---|---|
| A · Vizör | [`storyboard/konsept_A_vizor.jpg`](storyboard/konsept_A_vizor.jpg) | Minimal, monokrom, kinetik tipografi; logonun köşe parantezleri kamera olur |
| B · 08:59 | [`storyboard/konsept_B_sabah_0859.jpg`](storyboard/konsept_B_sabah_0859.jpg) | Hikâye: kâğıt föyden QR'a, sabah girişten akşam çıkışa |
| C · Ürün demosu | [`storyboard/konsept_C_urun_demosu.jpg`](storyboard/konsept_C_urun_demosu.jpg) | Açık tema, gerçek uygulama ekranları, 3 adım: Okut → Takip et → Raporla |
| D · İzometrik ofis | [`storyboard/konsept_D_izometrik_ofis.jpg`](storyboard/konsept_D_izometrik_ofis.jpg) | 3B illüstrasyon; logodaki kişiler minik karakterler olur |
| E · Kalkış panosu | [`storyboard/konsept_E_kalkis_panosu.jpg`](storyboard/konsept_E_kalkis_panosu.jpg) | Havalimanı split-flap panosu; mekanik pullar, sarı yön tabelası |
| F · Bento | [`storyboard/konsept_F_bento.jpg`](storyboard/konsept_F_bento.jpg) | İsviçre ızgarası; cesur renk blokları vuruşla yer değiştirir |
| G · Mesajlaşma | [`storyboard/konsept_G_mesajlasma.jpg`](storyboard/konsept_G_mesajlasma.jpg) | Sohbet ekranında anlatılan, Reels'e özgü hikâye |
| H · Kâğıt kesik | [`storyboard/konsept_H_kagit_kesik.jpg`](storyboard/konsept_H_kagit_kesik.jpg) | Kâğıt kolaj, stop-motion, sıcak el işi görünümü |

## Logo

Marka logosu (`storyboard/logo_ref_*.png`) piksel ölçümüyle vektöre çevrildi (`lib.js` → `logo()`).
Orijinal PNG ile ortalama piksel farkı 255 üzerinden 1'in altındadır. Koyu uygulama ikonu, açık zemin ve koyu zemin
sürümleri vardır; parantezler ve kişiler ayrı ayrı canlandırılabilir.

## Storyboard'ları yeniden üretmek

```bash
NODE_PATH="$(npm root -g)" node storyboard/render_frames.cjs /tmp/kareler   # 48 kare (1080×1920)
python3 storyboard/board.py /tmp/kareler storyboard                         # 8 pano (A–H)
```
