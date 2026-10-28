# QR Personel — Instagram Reels tanıtım videosu (9:16)

[qrpersonel.com](https://www.qrpersonel.com) için dikey (1080×1920) SaaS tanıtım filmi.
Bu klasör şu an **ön prodüksiyon** aşamasında: seçim için dört konsept storyboard'u hazır.

## Storyboard panoları

Her pano, bir konseptin 6 anahtar karesini zaman, ekrandaki yazı ve hareket/ses notlarıyla tek görselde gösterir.
Karelerin hepsi videoyu üretecek aynı kodla çizildi. Yani panodaki görüntü, filmin o anının gerçek bir render'ıdır.

| Konsept | Pano | Kısaca |
|---|---|---|
| A · Vizör | [`storyboard/konsept_A_vizor.jpg`](storyboard/konsept_A_vizor.jpg) | Minimal, monokrom, kinetik tipografi; logonun köşe parantezleri kamera olur |
| B · 08:59 | [`storyboard/konsept_B_sabah_0859.jpg`](storyboard/konsept_B_sabah_0859.jpg) | Hikâye: kâğıt föyden QR'a, sabah girişten akşam çıkışa |
| C · Ürün demosu | [`storyboard/konsept_C_urun_demosu.jpg`](storyboard/konsept_C_urun_demosu.jpg) | Açık tema, gerçek uygulama ekranları, 3 adım: Okut → Takip et → Raporla |
| D · İzometrik ofis | [`storyboard/konsept_D_izometrik_ofis.jpg`](storyboard/konsept_D_izometrik_ofis.jpg) | 3B illüstrasyon; logodaki kişiler minik karakterler olur |

## Logo

Marka logosu (`storyboard/logo_ref_*.png`) piksel ölçümüyle vektöre çevrildi (`lib.js` → `logo()`).
Orijinal PNG ile ortalama piksel farkı 255 üzerinden 1'in altındadır. Koyu uygulama ikonu, açık zemin ve koyu zemin
sürümleri vardır; parantezler ve kişiler ayrı ayrı canlandırılabilir.

## Yeniden üretmek

```bash
NODE_PATH="$(npm root -g)" node storyboard/render_frames.cjs /tmp/kareler   # 24 kare (1080×1920)
python3 storyboard/board.py /tmp/kareler storyboard                         # 4 pano
```
