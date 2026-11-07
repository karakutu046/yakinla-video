# Yakınla Yemek — uygulama akışı reklamı (senaryo aşaması)

Uygulamanın gerçek akışını anlatan dikey (9:16, 1080×1920) 20 sn'lik reklam:
**uygulamayı aç → Yemek'e dokun → restoranını seç → sepetini oluştur → kurye kapına getirsin.**

**Durum:** senaryo görseli onay bekliyor → [`out/senaryo.png`](out/senaryo.png). Onaydan sonra dış ses
(ElevenLabs, Dilara) üretilir, zamanlama cümlelere oturtulur ve video render edilir.

## Senaryo

| # | Süre | Sahne | Dış ses (taslak) | Ekranda |
|---|---|---|---|---|
| 1 | 0–2,4 sn | Kanca: telefon açılır, Yakınla açılış ekranı, etrafta yemekler | "Acıktın mı Afşin?" | Acıktın mı, Afşin? |
| 2 | 2,4–5,3 sn | Ana ekran (konum, harita, Market/Yemek kartları), Yemek kartına dokunulur | "Yakınla'yı aç, Yemek'e dokun!" | 1 · Yemek'e dokun |
| 3 | 5,3–8,4 sn | Yakınla Yemek: restoran listesi kayar, restorana dokunulur | "Bölgendeki restoranı seç," | 2 · Restoranını seç |
| 4 | 8,4–12,4 sn | Menü: ürünler sepete uçar, mavi sepet çubuğu, "Sepete Git" → "Siparişin alındı!" | "sepetini oluştur!" | 3 · Sepetini oluştur |
| 5 | 12,4–14,3 sn | Kurye motoruyla akşam ışığında Afşin sokağından geçer | "Kurye siparişini kapına kadar getirsin!" | 4 · Kurye kapına getirsin! |
| 6 | 14,3–16,5 sn | Kapıda: zil, kapı açılır, poşet teslim edilir | (müzik + kapı zili) | 4 · Kurye kapına getirsin! |
| 7 | 16,5–20 sn | Logo + YEMEK etiketi, mağazalar | "Yakınla Yemek, afiyet olsun!" | Afiyet olsun! |

## Kurallar

- Ekranlar uygulamanın ana ekranı ve Yemek ekranı örnek alınarak kodla çizilir. Market ve Yemek kart görselleri
  (`assets/kart-*.png`) uygulamanın ekran görüntüsünden kırpıldı.
- Ekran görüntülerindeki gerçek adres, fiyatlar, teslimat süresi, "Ücretsiz Teslimat" ve "Min. 500 ₺" gösterilmez.
  Restoran adları jeneriktir (gerçek restoranlar ancak izinleriyle kullanılır).
- Kuryenin yüzü gösterilmez (vizörlü kask). Logo, orijinal logo dosyasından gelir.

## Üretmek

```bash
NODE_PATH="$(npm root -g)" node storyboard.cjs   # → out/senaryo.png
```

Motor (`js/core.js`, `js/icons.js`, `js/common.js`, `render.cjs`, `audio.py`, `build.sh`) `../yakinla-yemek` projesiyle aynıdır.
Sahneler `js/scenes.js`'te, geçişler ve başlatma `js/main.js`'te, senaryo görseli `js/storyboard.js`'tedir.
