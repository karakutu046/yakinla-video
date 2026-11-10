# Adıyörem Çiğ Köfte: şube tanıtım filmi

Tek bir Adıyörem şubesi için dikey (9:16, 1080×1920, 30 fps), sesli ve 20 saniyelik tanıtım filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazırlanır.

**Görüntüler şubenin kendi fotoğraf ve videolarıdır.** Stok görsel ya da yapay zekâyla üretilmiş görüntü kullanılmaz.
Kod bu görüntülerin üstüne kurguyu, yazıları, köşe logosunu ve şube kapanış kartını ekler. Müzik ve efektler
sentezle üretilir. Dış ses ElevenLabs ile seslendirilir (depo kökündeki `CLAUDE.md`).

> **Durum:** Altyapı hazır ve sentetik deneme medyasıyla uçtan uca test edildi (`tools/ornek.sh`).
> Gerçek film için şubenin fotoğraf ve videoları, logosu ve kapanış kartı bilgileri bekleniyor.
> Bunlar gelince `sahneler.json` yazılacak, dış ses üretilip film basılacak.

## Gereken malzeme

`kaynak/` klasörüne konur (ayrıntı için [`kaynak/README.md`](kaynak/README.md)):

- **Logo:** Tercihen saydam PNG ya da SVG'den alınmış PNG. Beyaz zeminli JPG de olur.
- **Fotoğraflar ve videolar:** Yoğurma, malzemeler (isot, bulgur, yeşillik, nar ekşisi), dürüm sarma, porsiyon tabağı,
  tezgâh, tabela ve dükkânın dışı. Dikey çekimler en iyisidir. Yatay çekimler bulanık arka planla ortalanır.
- **Kapanış kartı:** Şube adı, adres, telefon, varsa çalışma saatleri ve online sipariş kanalları.

## Taslak senaryo (20 sn)

| Süre | Ekranda | Dış ses |
|---|---|---|
| 0–4 sn | Yoğrulan köfte, yakın plan · **CANIN / ÇİĞ KÖFTE / Mİ ÇEKTİ?** | *[excited]* Canın çiğ köfte mi çekti? |
| 4–9,5 sn | Usta eli, yeşillik, nar ekşisi · **USTA ELİNDE / YOĞRULUR** → **BOL YEŞİLLİK / NAR EKŞİSİ** | Usta elinde yoğrulan, bol yeşillikli, nar ekşili Adıyörem lezzeti! |
| 9,5–15 sn | Dürüm sarılır, porsiyon tabağı · **DÜRÜM MÜ?** → **PORSİYON MU? / SEN SEÇ!** | Dürüm mü, porsiyon mu? Sen seç, biz taze taze hazırlayalım! |
| 15–20 sn | Kapanış kartı: logo, şube adı, adres, telefon, sipariş kanalları · **Hemen gel, afiyetle ye!** | *[happy]* Adıyörem Çiğ Köfte. Hemen gel, afiyetle ye! |

Planların sırası ve süreleri gelen görüntülere ve dış sesin gerçek zamanlamasına göre ayarlanır.

## Marka kuralları

- "Katkısız", şube sayısı, fiyat, kampanya ya da teslimat süresi gibi iddialar **şube onaylamadan kullanılmaz**.
- Kapanış kartında yalnızca şubenin verdiği adres, telefon ve kanal adları yer alır. Sipariş kanalları
  yalnızca yazıyla gösterilir, üçüncü tarafların logoları kullanılmaz.
- Renkler logodan alınır. `hazirla.py` logonun baskın renklerini yazdırır, `sahneler.json` → `renk` buna göre ayarlanır.

## Akış

1. **`hazirla.py sahneler.json`:** Her planı 9:16'ya hazırlar.
   - `kirp`: Görüntü, odak noktasından kırpılır.
   - `bulanik`: Yatay çekim tam genişlikte ortalanır, arkasına bulanık bir kopyası konur.
   - Videolardan sahne süresince (iki yanda 0,5 sn payla) 30 fps kare çıkarılır. `hiz` ile ağır çekim yapılabilir.
   - Renk düzeltmesi (parlaklık, kontrast, doygunluk, sıcaklık, keskinlik) uygulanır. Yemek için hafif sıcak ve doygun bir ayardır.
   - Telefon fotoğraflarının EXIF yönü düzeltilir. HEIC desteklenir (`pip install pillow-heif`).
   - Değişmeyen planlar yeniden işlenmez.
2. **`render.cjs`:** `anim.js`'i headless Chromium'da kare kare basar ve efekt ipuçlarını `build/cues.json`'a yazar.
   - Yazılar yayla oturur. Vurgulu satırlar kırmızı kutuyla açılır.
   - Fotoğraflarda yavaş yakınlaşma ve kayma, kesmelerde hafif "punch-in" vardır.
   - Geçişler `kes`, `flas`, `kay`, `dikey`, `zoom`, `solma` ve `daire` olabilir. Hızlı geçişlerde 10 alt-örnekli hareket bulanıklığı kullanılır.
3. **`audio.py`:** 120 BPM, Am–G–F–E (Endülüs kadansı) üzerine darbuka (maksum), kick, el çırpma, bas ve sentez saz.
   - Kapanış kartında büyük vuruş ve dört notalık ses logosu ("A-dı-yö-rem") çalar.
   - Planların doğal sesi (yoğurma, cızırtı) `ses` kazancıyla eklenir.
   - Dış ses hep üstte kalır: konuşurken müzik yaklaşık 12 dB altta olur, sidechain ile ayrıca kısılır.
4. **`build.sh`:** Hepsini sırayla çalıştırır. İki geçişli loudnorm ile -14 LUFS / -1,5 dBTP'ye getirir,
   BT.709 H.264 + AAC MP4 ve kapak görseli üretir.

```bash
./build.sh sahneler.json            # → out/… (sahneler.json → cikti)
./tools/ornek.sh                    # altyapı denemesi: sentetik medya → build/ornek_test.mp4
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy + Pillow, ffmpeg.

Önizleme için önce `python3 hazirla.py sahneler.json` çalıştırılır, sonra klasör bir HTTP sunucusuyla açılır (`npx serve .`):

- `index.html?play`: gerçek zamanlı önizleme.
- `index.html?t=12.4`: tek kare.

## Dış ses

Depo kökündeki `CLAUDE.md` geçerlidir: **ElevenLabs**, ses **Dilara** (`D2dHiTSPRx6l2bhKGmyJ`), model `eleven_v4`,
`generations_count: 1`. Okuma doğal ve enerjiktir. Metin `[excited]` ile açılır, kapanış `[happy]` ile okunur.

- Kayıt `build/vo/dis_ses.mp3` yoluna indirilir ve depoya girmez. Ses yalnızca montajlanmış MP4'ün içinde yer alır.
- Kayıt tek parça olarak `dis_ses.bas` anına yerleşir. İstenirse `dis_ses.parcalar` (`[{a, b, t}]`) ile cümlelere bölünür
  ve her parça kendi planına oturtulur.
- Metin kesinleşmeden ses üretilmez.

## `sahneler.json`

```jsonc
{
  "cikti": "out/adiyorem_tanitim_20sn.mp4",
  "renk": { "ana": "#D32F2F", "koyu": "#6E0D0D", "krem": "#FFF3E0" },   // logodan
  "renk_duzelt": { "doygunluk": 1.15, "sicaklik": 6100 },               // tüm planlar için (isteğe bağlı)
  "logo": { "dosya": "kaynak/logo.png", "kose": true },                  // kose: planlarda sol üstte küçük logo
  "dis_ses": { "dosya": "build/vo/dis_ses.mp3", "bas": 0.25 },
  "sube": { "ust": "ADIYÖREM ÇİĞ KÖFTE", "ad": "… ŞUBESİ", "adres": ["…", "…"], "saat": "…",
            "telefon": "…", "siparis": ["…"], "slogan": "Hemen gel, afiyetle ye!" },
  "sahneler": [
    { "medya": "kaynak/yogurma.mp4", "bas": 2.0, "sure": 4.0, "zoom": [1.0, 1.12], "ses": 0.6,
      "yazi": { "satirlar": ["CANIN", "ÇİĞ KÖFTE", "Mİ ÇEKTİ?"], "vurgu": [1], "t": 0.3 } },
    { "medya": "kaynak/durum.jpg", "sure": 2.5, "odak": [0.4, 0.5], "kay": [0.1, 0], "gecis": "kay",
      "yazi": { "satirlar": ["DÜRÜM MÜ?"], "vurgu": [0], "konum": "orta" } },
    { "tip": "kapanis", "sure": 5.0, "gecis": "daire", "arka": "kaynak/dukkan.jpg" }
  ]
}
```

| Alan | Anlamı |
|---|---|
| `medya`, `bas`, `sure`, `hiz` | Kaynak dosya, videoda başlangıç saniyesi, plan süresi, oynatma hızı (0,5 = ağır çekim) |
| `yerlesim` | `kirp` (varsayılan) ya da `bulanik` (yatay çekimler için) |
| `odak`, `zoom`, `kay` | Kırpma odağı (0–1), plan boyunca yakınlaşma `[başta, sonda]`, kayma `[x, y]` |
| `gecis`, `yon` | Bu plana giriş: `kes` `flas` `kay` `dikey` `zoom` `solma` `daire`. `yon: -1` ters yön |
| `ses` | Videonun kendi sesi (0–1). Yoğurma ya da cızırtı sesi için |
| `renk_duzelt` | Plana özel `parlaklik`, `kontrast`, `doygunluk`, `gama`, `sicaklik` (K), `keskinlik` |
| `yazi` | `satirlar`, `vurgu` (kırmızı kutu), `vurgu2` (krem kutu), `konum` (`alt` `orta` `ust`), `t` / `zaman` (sözcüklere eşleme), `boyut`, `bitis` |
| `tip: "kapanis"` | Şube kartı. `arka` verilirse o görüntü bulanık ve marka rengiyle zemin olur |

| Dosya | Görevi |
|---|---|
| `hazirla.py` | Kaynak medyayı kırpar, kare çıkarır, renk düzeltir, logoyu kırpar → `build/plan.json` |
| `anim.js` | Kurgu, geçişler, yazılar, köşe logosu, kapanış kartı ve efekt ipuçları. `draw(g, t)` zamanın saf fonksiyonudur |
| `render.cjs` | Kareleri paralel basar (JPEG), `build/cues.json`'u yazar |
| `audio.py` | Müzik, efekt ve doğal ses sentezi/miksi, dış ses yerleşimi ve sidechain |
| `build.sh` | Uçtan uca üretim |
| `tools/ornek.sh`, `tools/ornek.json` | Sentetik medyayla altyapı denemesi |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, `fonts/LICENSE-Inter.txt`) |

Konum ve telefon simgeleri Material Icons'tan (Apache 2.0) alınmıştır.
