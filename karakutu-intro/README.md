# Karakutu Yazılım: 10 sn motion graphics tanıtım

Karakutu Yazılım için dikey (9:16, 1080×1920, 30 fps) sesli tanıtım filmi.
Instagram Reels, TikTok, YouTube Shorts ve WhatsApp durumu için hazır.

**Çıktı:** [`out/karakutu_tanitim_10sn.mp4`](out/karakutu_tanitim_10sn.mp4) (H.264 + AAC, -14 LUFS) · kapak görseli [`out/kapak.jpg`](out/kapak.jpg)

Görüntüdeki her şey kodla çizilir: hazır footage, stok görsel ya da yapay zekâ üretimi görüntü yok.
Müzik ve ses efektleri de sentezle üretilir.

## Fikir

"Kara kutu": girdisini ve çıktısını gördüğün, içini görmediğin kutu. Fikir girer, kod olur, ürün çıkar.
Kutudan çıkan ürün, Karakutu'nun geliştirdiği **Yakınla** (Afşin'in online marketi).

## Akış

| Zaman | Sahne | Ekranda | Hareket ve ses |
|---|---|---|---|
| 0–2 sn | **Fikir girer** | **Fikir girer,** | Ortadan turuncu bir çizgi açılır ve yayla kutuya dönüşür. Çizgi, kutunun ışık sızan ek yeri olur. Bir ampul belirir, kapaktaki yarığa düşer, kutu ezilip toparlanır. |
| 2–4 sn | **Kod olur** | **kod olur,** | Kutu bir tur döner. Yüzlerinde Yakınla'nın sipariş akışını anlatan kod akar (`siparisVer`, `kurye.canliTakip`, `depo = 'Afşin'`). Yarıktan `{ }`, `</>`, `=>` kıvılcımları saçılır, klavye tıkırtısı duyulur. Kutu titrer, ses yükselir. |
| 4–7 sn | **Ürün çıkar** | **ürün çıkar.** · Yakınla · Afşin'in online marketi · iOS · Android · Web | Kapak patlayarak açılır, içeriden turuncu ışık hüzmesi yükselir. Hüzmenin içinden Yakınla açılış ekranlı bir telefon çıkar. Platform rozetleri vuruşlara oturur. |
| 7–10 sn | **Kapanış** | Kutu logosu · **karakutu** · YAZILIM · **Fikir girer, ürün çıkar.** · karakutuyazilim.com · AFŞİN · KAHRAMANMARAŞ | Telefon yukarı fırlar, kapak çarpar, kutu çeyrek tur dönerek izometrik logo pozuna oturur. Ses logosu G5–E5–G5–C6 ("ka-ra-ku-tu") çalar. |

**Ses:** 120 BPM. Akorlar Am → Am F → C G F G → C. Sahne geçişleri vuruşlara oturur ve logo C majöre
çözülür. Efekt ipuçları doğrudan `anim.js`'ten üretilir (`build/cues.json`).

## Kaynak ve varsayımlar

- karakutuyazilim.com bu ortamdan açılamadı (ağ politikası). Bilgiler Yakınla marka notlarından geliyor:
  "Geliştiren: Karakutu Yazılım (Afşin)".
- **Kutu logosu bir taslaktır.** Karakutu'nun gerçek logosu ve renkleri elde olmadığı için siyah kutu +
  turuncu ışık önerisi kullanıldı. Turuncu, uçaklardaki "kara kutu"nun gerçek rengine bir göndermedir.
  Gerçek logo, renkler ya da slogan varsa `anim.js` içinde kolayca değiştirilir.
- Yakınla logosu marka dosyasından birebir kullanılır (`../yakinla-showreel/assets/yakinla-logo-mark.svg`).
  Yakınla için sitedeki ifadeler kullanıldı ("Afşin'in marketi, cebinde.", iOS / Android / Web).

## Yeniden üretmek

```bash
./build.sh                         # → out/karakutu_tanitim_10sn.mp4 (~4 dk)
```

Gerekenler: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg.

Bu proje Yakınla showreel'iyle bazı dosyaları paylaşır, bu yüzden `yakinla-showreel/` klasörü yanında durmalı:
Inter fontları (`fonts/`), Yakınla logosu (`assets/`) ve ses sentezleyicisi (`audio.py`).

Önizleme için depo kökünde bir HTTP sunucusu açın (`npx serve .`):

- `karakutu-intro/index.html?play`: gerçek zamanlı, hareket bulanıklığı olmadan.
- `karakutu-intro/index.html?t=4.6`: tek kare.

Tek kare render almak için: `ONLY=0,120,290 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/kareler`.

| Dosya | Görevi |
|---|---|
| `anim.js` | Animasyonun tamamı. 3B kutu (perspektif, gölgelendirme, menteşeli kapak, yüzlere afin eşlenen kod dokusu) dahil. `draw(g, t)` zamanın saf fonksiyonudur. Her kare 6 alt-örnekle, hızlı anlarda 16 alt-örnekle çizilir (gerçek hareket bulanıklığı). |
| `render.cjs` | Headless Chromium'da kareleri paralel olarak PNG'ye basar ve ses ipuçlarını yazar. Sayfayı depo kökünden sunar. |
| `audio.py` | 10 saniyelik beste ve miks. Enstrümanlar `../yakinla-showreel/audio.py`'den gelir. |
| `build.sh` | Uçtan uca üretim: kare render, ses, iki geçişli loudnorm, BT.709 x264, kapak görseli. |
| `fonts/` | JetBrains Mono (SIL OFL 1.1, lisansı `fonts/LICENSE-JetBrainsMono.txt`). |
