# Karakutu Muhasebe — 38 sn Instagram Reels tanıtım filmi

[karakutuveri.com/muhasebe](https://www.karakutuveri.com/muhasebe) için dikey (9:16, 1080×1920, 30 fps), sesli tanıtım filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/karakutu_muhasebe_reels_38sn.mp4`](out/karakutu_muhasebe_reels_38sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Konsept: panodaki **02 · Defter Kapandı** ile **03 · Alacağını Kovalama**nın birleşimi
([`out/konsept-panosu.jpg`](out/konsept-panosu.jpg), [`KONSEPTLER.md`](KONSEPTLER.md)).
Görüntüdeki her şey kodla çizilir; hazır footage, stok görsel ya da yapay zekâ görüntüsü yok.
Müzik ve ses efektleri de sentezle üretilir.

## Akış

| Zaman | Sahne | Ekranda | Hareket ve ses |
|---|---|---|---|
| 0–4 sn | **Defter** | *Veresiye — Ekim* · *Ahmet abi 1.250 ₺ → 1.400?* · *Koli 12/9/14???* · *Kim ödedi, kim ödemedi??* → **Hâlâ veresiye defteriyle mi?** | Kalem satırları kendisi yazar, rakamların üstünü çizer, "Mehmet'i ARA"yı daire içine alır. Yapışkan not şaplak diye yapışır. Siyah bant kayar, kelimeler vuruşla çakılır. Kalem hışırtısı, saat tıkırtısı, La minör pizzicato. |
| 4–8 sn | **Kapanış** | **Defter kapandı.** → **Karakutu açıldı.** | Kapak soldaki sırttan dönerek kapanır (gümbürtü). Turuncu çizgi kenarları çizer, kara kutu logosu yüz yüz kurulur. Kapak küçülüp telefona dönüşür, logodan dairesel açılışla uygulama gelir: 6. saniyede ritim başlar. |
| 8–19.5 sn | **WhatsApp** | **Alacağını sen kovalama.** → **Karakutu hatırlatsın.** | Cariler listesi → Ahmet Kaya'nın satırında WhatsApp → *Vadesi gelince otomatik gönder* açılır. Telefon döner: *Ahmet Bey'in telefonu*. Kilit ekranına bildirim düşer, sohbet açılır, otomatik hatırlatma gelir, cevap: *Tamam, bugün havale ediyorum 👍*. Telefon geri döner, bakiye 12.450 → 0 sayar, **Tahsilat alındı** kartı. Son olarak 8 cariye hatırlatma tek tek gider (2/8 … 8/8). Sohbet anında ritim yarıya iner. |
| 19.5–32 sn | **Modüller** | *Defterdeki her not, yerli yerinde* · Cari kayıt · Stok takibi · e-Fatura · Gelen / Giden · Teklif hazırlama | Turuncu çapraz şerit sahneyi siler. Defterden yırtılmış her not telefona uçar, mürekkep sıçratarak ekrana karışır ve ilgili modül açılır: yeni cari formu dolar, stok sayımı güncellenir ve kritik stok uyarısı çıkar, e-Fatura gönderilir ve damgalanır, gelen/giden sekmesi değişir, teklif satır satır oluşup gönderilir. |
| 32–38 sn | **Logo** | **karakutu** MUHASEBE · **Defteri kapat, Karakutu'yu aç.** · `karakutuveri.com/muhasebe` | Telefon merkeze çekilir, altı modül ikonu yörüngede döner ve kutuya girer, kapak kapanır (34. saniye). Ses logosu C5–E5–G5–C6 ("ka-ra-ku-tu"). |

**Ses:** 120 BPM. Defter La minörde, çözüm Do majörde (C – G – Am – F). 150'den fazla efekt ipucu doğrudan `anim.js`'ten
üretilir (`build/cues.json`); her kalem darbesi, tık, bildirim ve "ka-ching" ekrandaki hareketle aynı karede ve aynı yönde (pan) duyulur.

## İçerik notları

- **Logo ve renkler yer tutucudur.** karakutuveri.com bu çalışma ortamından açılamadı. "Kara kutu" fikrinden izometrik bir
  kutu ve siyah / turuncu / beyaz palet kullanıldı. Gerçek logo `anim.js` içindeki `cube()` fonksiyonuyla değiştirilir.
- Sadece belirtilen özellikler gösterilir: stok takibi, cari kayıt, WhatsApp ile otomatik borç hatırlatma, programdan
  e-Fatura kesme, gelen / giden faturalar, teklif hazırlama. Fiyat, ücretsiz deneme ya da karşılaştırma iddiası yok.
- Ekrandaki işletme, kişi adları, VKN ve tutarlar örnektir (Yılmaz Ticaret, Ahmet Kaya…). Fatura ve teklif toplamları
  kendi içinde tutarlıdır (KDV %20).
- WhatsApp adı yalnızca özelliği anlatmak için geçer; WhatsApp logosu ya da birebir arayüzü kullanılmadı.

## Yeniden üretmek

```bash
./build.sh                         # → out/karakutu_muhasebe_reels_38sn.mp4 (~15 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Önizleme için klasörü bir HTTP sunucusuyla açın (`npx serve .`):

- `index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `index.html?t=12.4`: tek bir kare.

Tek kare render almak için: `ONLY=0,120,300 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

Konsept panosunu yeniden üretmek için:

```bash
NODE_PATH="$(npm root -g)" node konsept/render-pano.cjs build/pano.png 1.5
ffmpeg -y -i build/pano.png -q:v 2 out/konsept-panosu.jpg
```

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 6 alt-örnekle (180° obtüratör) çizilir. Sahne zamanları en üstteki `T` nesnesinde. |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. |
| `audio.py` | Müzik ve efekt sentezi, sidechain, yankı ve limit. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264. |
| `konsept/` | 6 konseptli ana kare panosu (`pano.html`) ve onu basan betik. |
| `fonts/` | Inter / Inter Display ve Caveat (SIL OFL 1.1, lisanslar klasörde). |
