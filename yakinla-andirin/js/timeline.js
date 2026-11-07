'use strict';
/* Yakınla Market Andırın — zaman çizelgesi ve dış ses yerleşimi (20 sn, 9:16).
 *   0–3.6    Duyuru    Andırın'ın dağlarına Yakınla pini iner; "açıldı"da kurdele kesilir
 *   3.6–7.9  Uygulama  indir → ana ekran (Yemek: çok yakında) → Market → sepet → sipariş
 *   7.9–12.1 Hız       kurye Andırın sokağında; sayaç "altmış"ta 60'a varır; kapıda teslim
 *   12.1–16.2 Teaser   servis kapağı titrer ama açılmaz: Yakınla Yemek ÇOK YAKINDA
 *   16.2–20  Kapanış   logo + ANDIRIN etiketi, "Andırın'ın marketi, cebinde!"
 */
const T = {
  kick: 0.3, pinDrop: 0.4, label: 0.95, title: 1.45, ribbonIn: 1.6, snip: 2.55, cut: 2.88, acildi: 2.93,
  s2: 3.6, phoneIn: 3.5, h2: 4.95, tapInstall: 4.38, installed: 4.85, home: 4.95, tapMarket: 5.45, openMarket: 5.6,
  adds: [6.0, 6.35, 6.7], order: 7.15, done: 7.35,
  s5: 7.9, count0: 8.65, ortalama: 9.0, count1: 9.72, kapinda: 10.45, doorCut: 10.55, bell: 11.15, open: 11.4, hand: 11.65,
  teaser: 12.1, haber: 12.25, cloche: 12.35, yemekTitle: 13.4, cokYakinda: 14.45, andirinda: 15.15,
  s4: 16.2, word: 16.6, tag: 17.0, slogan: 17.35, stores: 18.3, url: 18.7,
  // (base.js'teki ortak kodun beklediği, bu videoda kullanılmayan anahtarlar)
  st2: 99, st3: 99, scroll: 99,
};
// Dış ses (ElevenLabs, Dilara, 16 sn): kaynak kayıttaki cümle aralıkları [src0, src1] → videodaki başlangıç.
// Sınırlar build/vo/dis_ses.wav'ın enerji eğrisindeki sessizliklerden ölçüldü.
const VO = [
  { at: 0.30, src: [0.06, 0.91] },    // Müjde Andırın!
  { at: 1.40, src: [1.16, 3.09] },    // Yakınla Market, Andırın'da açıldı!   ("açıldı" → kurdele 2,88'de kesilir)
  { at: 3.75, src: [3.41, 5.49] },    // Hemen uygulamayı indir, siparişini ver!  ("indir" → İndir'e dokunuş 4,38)
  { at: 7.95, src: [5.89, 9.05] },    // Market siparişin ortalama altmış dakikada kapına gelsin!  ("altmış" → sayaç 60, 9,72)
  { at: 12.25, src: [9.50, 10.47] },  // Size bir haber daha:
  { at: 13.40, src: [10.80, 13.03] }, // Yakınla Yemek de çok yakında Andırın'da!  ("çok yakında" → 14,45)
  { at: 16.60, src: [13.35, 15.70] }, // Yakınla, Andırın'ın marketi cebinde!
];
