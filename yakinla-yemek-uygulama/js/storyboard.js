'use strict';
/* Senaryo görseli (storyboard): videonun kendi karelerinden 7 sahne + açıklamalar → out/senaryo.png
 * Çalıştırma: NODE_PATH="$(npm root -g)" node storyboard.cjs
 */
const SB = { W: 2480, H: 3420, fw: 540, fh: 960, gx: 50, x0: 85, y0: 330, cap: 470 };
const PANELS = [
  { t: 1.45, no: '1', ad: 'KANCA', zaman: '0–2,5 sn',
    gor: 'Akşam, lacivert zemin. Telefon aşağıdan süzülür, Yakınla açılış ekranı yanar; etrafında burger, pizza, dürüm ve içecek döner.',
    vo: "Acıktın mı Afşin? Yakınla'yı aç,", ekran: 'Acıktın mı, Afşin?' },
  { t: 3.9, no: '2', ad: "YEMEK'E DOKUN", zaman: '2,5–4,7 sn',
    gor: 'Uygulamanın ana ekranı: Konumun Afşin, harita, Market ve Yemek kartları. Parmak Yemek kartına dokunur, kart büyüyerek açılır.',
    vo: "Yemek'e dokun!", ekran: "1 · Yemek'e dokun" },
  { t: 6.0, no: '3', ad: 'RESTORANINI SEÇ', zaman: '4,7–6,8 sn',
    gor: 'Yakınla Yemek ekranı: Restoranlar listesi, Önerilen / En Yakın / Puan / En Hızlı sekmeleri. Liste kayar, parmak bir restorana dokunur.',
    vo: 'Bölgendeki restoranı seç,', ekran: '2 · Restoranını seç' },
  { t: 9.05, no: '4', ad: 'SEPETİNİ OLUŞTUR', zaman: '6,8–10,5 sn',
    gor: 'Restoran menüsü: burger, patates ve içecek "+" ile sepete uçar, mavi sepet çubuğu 1-2-3 sayar. "Sepete Git" → "Siparişin alındı!"',
    vo: 'sepetini oluştur!', ekran: '3 · Sepetini oluştur' },
  { t: 11.4, no: '5', ad: 'KURYE YOLDA', zaman: '10,5–12,8 sn',
    gor: 'Telefondan sokağa geçiş. Mavi montlu, kasklı kurye motoruyla akşam ışığında Afşin sokağından geçer: alçak binalar, çatılarda güneş panelleri, arkada dağlar.',
    vo: 'Kurye siparişini kapına kadar getirsin!', ekran: '4 · Kurye kapına getirsin!' },
  { t: 14.45, no: '6', ad: 'KAPIDA TESLİM', zaman: '12,8–16 sn',
    gor: 'Zil çalar, kapı açılır, içeriden sıcak ışık. Kurye Yakınla poşetini uzatır, içeriden uzanan el alır. Yüz gösterilmez (vizörlü kask).',
    vo: '(müzik + kapı zili)', ekran: '4 · Kurye kapına getirsin!' },
  { t: 19.2, no: '7', ad: 'KAPANIŞ', zaman: '16–20 sn',
    gor: 'Pin kurulur, orijinal Yakınla yazısı açılır, turuncu YEMEK etiketi ve konfeti. App Store · Google Play · yakinla.com',
    vo: 'Yakınla Yemek, afiyet olsun!', ekran: 'Afiyet olsun!' },
];
const VO_TEXT = "[excited] Acıktın mı Afşin? Yakınla'yı aç, Yemek'e dokun! Bölgendeki restoranı seç, sepetini oluştur! Kurye siparişini kapına kadar getirsin! [happy] Yakınla Yemek, afiyet olsun!";
const NOTES = [
  'Ekranlar, gönderdiğiniz ana ekran ve Yemek ekranı birebir örnek alınarak çizildi. Market ve Yemek kart görselleri uygulamanın kendisinden alındı.',
  'Restoran adları jeneriktir (Burgerci, Çiğköfteci, Kebapçı). Gerçek restoranları (ör. Akdo, Adıyörem) göstermek için izinleri varsa adlarını kullanabiliriz.',
  'Ekran görüntüsündeki gerçek adres, fiyatlar, "45 dk", "Ücretsiz Teslimat" ve "Min. 500 ₺" reklamda gösterilmez (kişisel veri ve doğrulanmamış vaat).',
  'Süre 20 sn. İsterseniz 15 sn sürüm de çıkarılabilir. Dış ses, onayınızdan sonra ElevenLabs (Dilara) ile üretilir.',
];

function wrap(g, s, x, y, maxW, lh, o) {
  setFont(g, o); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = o.c;
  const words = s.split(' '); let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test;
  }
  if (line) { g.fillText(line, x, yy); yy += lh; }
  g.letterSpacing = '0px';
  return yy;
}
function label(g, s, x, y, col) {
  text(g, s, x, y, { f: 'Txt', w: 700, s: 19, a: 'left', c: col, ls: 1.5 });
}

async function makeStoryboard() {
  await window.READY;
  const cv = document.getElementById('sb'), g = cv.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, SB.H, [[0, '#F4F7FD'], [1, '#E8EFFB']]); g.fillRect(0, 0, SB.W, SB.H);
  // başlık
  drawLogo(g, SB.x0 + 70, 150, 170);
  text(g, 'Yakınla Yemek · Reklam Senaryosu', SB.x0 + 165, 140, { w: 800, s: 74, a: 'left', c: C.ink });
  text(g, "Uygulamayı aç → Yemek'e dokun → restoranını seç → sepetini oluştur → kurye kapına getirsin", SB.x0 + 168, 200, { f: 'Txt', w: 500, s: 32, a: 'left', c: C.inkSoft });
  let cx = SB.x0 + 168;
  for (const s of ['20 sn', 'Dikey 9:16 · 1080×1920', 'Dış ses: ElevenLabs · Dilara', 'Müzik + efekt: sentez', 'Onaylandı']) {
    const w = measure(g, s, { f: 'Txt', w: 700, s: 22 }) + 40, last = s === 'Onaylandı';
    g.fillStyle = last ? '#FFF1DE' : '#E3ECFB'; g.beginPath(); g.roundRect(cx, 236, w, 46, 23); g.fill();
    text(g, s, cx + w / 2, 267, { f: 'Txt', w: 700, s: 22, c: last ? '#B86A00' : C.blue });
    cx += w + 14;
  }
  const cell = (i) => [SB.x0 + (i % 4) * (SB.fw + SB.gx), SB.y0 + Math.floor(i / 4) * (SB.fh + SB.cap + 80)];
  for (let i = 0; i < PANELS.length; i++) {
    const P = PANELS[i], [x, y] = cell(i);
    window.renderAt(P.t);
    g.save(); g.shadowColor = 'rgba(11,27,51,0.22)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
    g.fillStyle = '#000'; g.beginPath(); g.roundRect(x, y, SB.fw, SB.fh, 28); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, SB.fw, SB.fh, 28); g.clip();
    g.imageSmoothingQuality = 'high'; g.drawImage(document.getElementById('c'), x, y, SB.fw, SB.fh); g.restore();
    // numara rozeti
    g.save(); g.shadowColor = 'rgba(11,27,51,0.3)'; g.shadowBlur = 16;
    g.fillStyle = lg(g, 0, y - 20, 0, y + 60, [[0, '#FFB24A'], [1, '#FF6A1A']]); g.beginPath(); g.arc(x + 4, y + 4, 38, 0, TAU); g.fill(); g.restore();
    text(g, P.no, x + 4, y + 20, { w: 800, s: 44, c: '#fff' });
    // açıklama kartı
    const cy = y + SB.fh + 26;
    g.save(); g.shadowColor = 'rgba(11,27,51,0.08)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x, cy, SB.fw, SB.cap, 24); g.fill(); g.restore();
    text(g, P.ad, x + 28, cy + 54, { w: 800, s: 34, a: 'left', c: C.ink });
    text(g, P.zaman, x + SB.fw - 28, cy + 52, { f: 'Txt', w: 600, s: 22, a: 'right', c: C.blue });
    label(g, 'GÖRÜNTÜ', x + 28, cy + 100, '#8A93A6');
    let yy = wrap(g, P.gor, x + 28, cy + 132, SB.fw - 56, 31, { f: 'Txt', w: 500, s: 22, c: '#33415C' });
    yy = Math.max(yy + 6, cy + 300);
    label(g, 'DIŞ SES', x + 28, yy, '#8A93A6');
    yy = wrap(g, P.vo.startsWith('(') ? P.vo : `“${P.vo}”`, x + 28, yy + 34, SB.fw - 56, 32, { f: 'Txt', w: 700, s: 24, c: C.blue });
    label(g, 'EKRANDA', x + 28, yy + 8, '#8A93A6');
    wrap(g, P.ekran, x + 28, yy + 42, SB.fw - 56, 32, { w: 800, s: 27, c: C.ink });
  }
  // 8. hücre: dış ses metni + notlar
  const [nx, ny] = cell(7), nh = SB.fh + SB.cap + 26;
  g.save(); g.shadowColor = 'rgba(11,27,51,0.08)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(nx, ny, SB.fw, nh, 28); g.fill(); g.restore();
  g.fillStyle = lg(g, 0, ny, 0, ny + 330, [[0, '#2F80F5'], [1, '#0E5FE0']]); g.beginPath(); g.roundRect(nx, ny, SB.fw, 400, [28, 28, 0, 0]); g.fill();
  label(g, 'DIŞ SES METNİ (ELEVENLABS · DİLARA · 11,5 SN)', nx + 28, ny + 50, 'rgba(255,255,255,0.8)');
  wrap(g, VO_TEXT, nx + 28, ny + 92, SB.fw - 56, 36, { f: 'Txt', w: 600, s: 25, c: '#fff' });
  label(g, 'ONAYINIZA SUNULANLAR', nx + 28, ny + 452, '#8A93A6');
  let yy = ny + 494;
  for (const n of NOTES) {
    g.fillStyle = C.blue; g.beginPath(); g.arc(nx + 36, yy - 8, 6, 0, TAU); g.fill();
    yy = wrap(g, n, nx + 54, yy, SB.fw - 82, 30, { f: 'Txt', w: 500, s: 21, c: '#33415C' }) + 18;
  }
  text(g, 'Kareler videonun kendi animasyon motorundan alınmıştır; onaydan sonra hareket, dış ses ve müzikle 20 sn video olarak üretilir.', SB.W / 2, SB.H - 40, { f: 'Txt', w: 500, s: 22, c: '#8A93A6' });
  window.DONE = true;
}
makeStoryboard();
