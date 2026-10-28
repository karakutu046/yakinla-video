#!/usr/bin/env python3
"""Storyboard panolarını üretir: her konsept için 6 kareyi tek görselde, senaryosuyla birlikte dizer.

Kullanım:  python3 board.py <kare-klasörü> <çıktı-klasörü>
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'fonts')
f = lambda name, size: ImageFont.truetype(os.path.join(FONTS, name), size)
F_TITLE, F_SUB, F_TAG = f('InterDisplay-Black.otf', 76), f('Inter-Medium.otf', 32), f('Inter-SemiBold.otf', 26)
F_NUM, F_TIME, F_SCENE = f('InterDisplay-Black.otf', 30), f('Inter-SemiBold.otf', 24), f('InterDisplay-Bold.otf', 36)
F_ON, F_NOTE, F_LETTER = f('Inter-SemiBold.otf', 26), f('Inter-Medium.otf', 24), f('InterDisplay-Black.otf', 120)

# Her sahne: (zaman, başlık, ekrandaki yazı, hareket ve ses)
CONCEPTS = {
    'A': dict(
        name='VİZÖR', pitch='Minimal, monokrom, kinetik tipografi. Logonun köşe parantezleri bütün filmin kamerası olur.',
        tags=['≈ 20 sn · 9:16 · 1080×1920', 'Siyah-beyaz + sinyal yeşili', 'Müzik: minimal tech-house, 120 BPM'],
        palette=['#0C0C0D', '#F7F7F7', '#8C8C8C', '#3DDC84'], bg='#111214', fg='#F5F5F5', sub='#9A9A9A', acc='#3DDC84',
        scenes=[
            ('0–2 sn', 'Kanca', '“Kim geldi?”', 'Siyah ekrana dört köşe parantezi çakılır, harfler vuruşla düşer. Deklanşör + bas vuruş.'),
            ('2–5 sn', 'Okut', '“Okut.”', 'Parantezler duvardaki QR levhasına kilitlenir, yeşil tarama çizgisi geçer, bip sesi.'),
            ('5–8 sn', 'Giriş', '“Giriş yapıldı. 08:57:12”', 'QR modülleri logodaki kişi siluetine dönüşür; yeşil onay patlar, saat haneleri döner.'),
            ('8–12 sn', 'Ekip', '“41/48 içeride · Ekibin, tek bakışta.”', 'Tek kişi 48 kişilik ızgaraya çoğalır; gelenler beyaza döner, sayaç akar, geç kalana kırmızı nokta.'),
            ('12–16 sn', 'Özellikler', '“GİRİŞ. ÇIKIŞ. PUANTAJ.”', 'Kelimeler vuruşla tek tek çakılır; ÇIKIŞ dış hat olarak gelir, parantezler PUANTAJ’ı yakalar.'),
            ('16–20 sn', 'Marka', '“QR Personel · qrpersonel.com”', 'Ekran beyaza döner; parantezler içe kapanıp uygulama ikonunu kurar, kişiler sırayla zıplar.'),
        ]),
    'B': dict(
        name='08:59', pitch='Hikâye: sabah telaşından akşam çıkışına. Problem → çözüm → sonuç akışı, piksel saat ana karakter.',
        tags=['≈ 20 sn · 9:16 · 1080×1920', 'Gece mavisi + nane / kehribar', 'Müzik: Am–F–C–G, 128 BPM, saat tıkları'],
        palette=['#070B16', '#2F5BFF', '#19E3A1', '#FFB547', '#FF5C6C'], bg='#0A0F1E', fg='#F3F6FF', sub='#8C98BC', acc='#19E3A1',
        scenes=[
            ('0–3 sn', 'Sabah', '“08:59 · Ekip geliyor…”', 'Piksel saat saniye saniye akar, her tıkta bir ekip üyesi gelir; iki koltuk boş kalır.'),
            ('3–6 sn', 'Problem', '“Hâlâ kâğıt föy mü?”', 'İmza föyü sallanarak düşer; okunmayan saatler daireye alınır, mercan çizgi üstünü çizer.'),
            ('6–9 sn', 'Çözüm', '“09:00 · Okut.”', '09:00 darbesiyle föy piksellere dağılır ve gerçek, okutulabilir bir QR koda dönüşür.'),
            ('9–13 sn', 'Giriş', '“Mesaine başla. · İçeride 45/53”', 'Kamera geri çekilir: sahne bir telefon ekranıymış. Bildirimler kayar, son gelen geç kalandır.'),
            ('13–17 sn', 'Çıkış', '“18:04 · Çıkışta da okut.”', 'Zaman atlaması: saat akşama koşar, gökyüzü kızıla döner; çalışma süresi halkası dolar.'),
            ('17–20 sn', 'Marka', '“QR Personel · www.qrpersonel.com”', 'Mavi kare ekranı kaplar; ikon vuruşlarla kurulur, adres harf harf yazılır.'),
        ]),
    'C': dict(
        name='ÜRÜN DEMOSU', pitch='Açık tema, gerçek uygulama ekranları, 3 adımda anlatım: Okut → Takip et → Raporla.',
        tags=['≈ 20 sn · 9:16 · 1080×1920', 'Açık gri + siyah + mavi vurgu', 'Müzik: iyimser pop-elektronik, 110 BPM'],
        palette=['#F3F4F6', '#FFFFFF', '#0F1115', '#2563EB', '#F59E0B'], bg='#EEF0F3', fg='#0F1115', sub='#5F6673', acc='#2563EB',
        scenes=[
            ('0–3 sn', 'Vaat', '“Personel takibi artık cebinde.”', 'Başlık kelime kelime gelir, telefon aşağıdan süzülür; giriş ve sayaç kartları etrafında uçuşur.'),
            ('3–7 sn', '1 · Okut', '“Kapıdaki QR’ı telefonla okut.”', 'Ekran kameraya döner, QR çerçeveye girer, mavi tarama; “Giriş yapıldı” kartı yandan kayar.'),
            ('7–11 sn', '2 · Canlı takip', '“Kim geldi, kim gelmedi: anında.”', 'Liste satır satır dolar, durum etiketleri renklenir, sayaç 45/53’e çıkar.'),
            ('11–15 sn', '3 · Raporla', '“Giriş saatleri ve puantaj hazır.”', 'Çubuklar büyür, 09:00 çizgisi çizilir; takvim günleri sırayla dolar.'),
            ('15–18 sn', 'Özet', '“Hepsi tek uygulamada.”', 'Üç özellik kartı yaylanarak yığılır, ikonlar küçük animasyonlarla canlanır.'),
            ('18–20 sn', 'Çağrı', '“qrpersonel.com · Hemen başlayın”', 'Kartlar logoya toplanır, buton parlar, ikon kısa bir sekmeyle yerine oturur.'),
        ]),
    'D': dict(
        name='İZOMETRİK OFİS', pitch='3B illüstrasyon: logodaki kişiler minik karakterler olur, ofis kurulur, girişler sayılır.',
        tags=['≈ 20 sn · 9:16 · 1080×1920', 'Kömür + beyaz bloklar + limon yeşili', 'Müzik: zıplayan elektronik, 118 BPM'],
        palette=['#1A1D24', '#EEF1F5', '#A9B0BD', '#B6F35C', '#E8826F'], bg='#14161B', fg='#F4F6F8', sub='#8A92A3', acc='#B6F35C',
        scenes=[
            ('0–3 sn', 'Sabah', '“08:45 · Ofis uyanıyor.”', 'Bina gökten düşen küplerle kat kat kurulur, pencereler tek tek yanar.'),
            ('3–6 sn', 'Varış', '“Girişte okut.”', 'Logodaki kişiler minik karakterler olarak kapıya yürür; QR totemi limon rengi parlar.'),
            ('6–9 sn', 'Kayıt', '“Her giriş kayıtta. · 12/53”', 'Kamera yakınlaşır; karakter okutur, ışın çıkar, “+1” balonu zıplar, sayaç artar.'),
            ('9–13 sn', 'Ekipler', '“Her ekip, tek ekranda.”', 'Binanın kesiti açılır; katlar ışıldar, ekip sayaçları yanlardan kayar.'),
            ('13–17 sn', 'Puantaj', '“Ay sonu? Puantaj hazır.”', 'Bina küplerine ayrılır ve 3B çubuk grafiğe dönüşür; puantaj kartı onayla kapanır.'),
            ('17–20 sn', 'Marka', '“QR Personel · qrpersonel.com”', 'Küpler ikonu oluşturur; ikon platformun üstünde katman katman yükselip oturur.'),
        ]),
    'E': dict(
        name='KALKIŞ PANOSU', pitch='Havalimanı kalkış panosu gibi: mekanik pullar döner, her okutma panoya yeni bir satır olarak düşer.',
        tags=['≈ 30 sn · 9:16 · 1080×1920', 'Siyah pano + havalimanı sarısı', 'Müzik: retro synth + pul tıkırtısı, 116 BPM'],
        palette=['#0B0B0C', '#1C1D21', '#F2EFE6', '#FFB000', '#3DDC84', '#FF5A4F'], bg='#0E0E10', fg='#F2EFE6', sub='#8A8E96', acc='#FFB000',
        scenes=[
            ('0–4 sn', 'Kanca', '“08:59 · KİM GELDİ?”', 'Pano ilk karede tıkırdayarak döner; saat 08:59’a, alt satır harf harf “KİM GELDİ?”ye oturur.'),
            ('4–9 sn', 'Girişler', '“Kim geldi, kim geç kaldı: tek panoda.”', 'Satırlar sırayla dolar: isim, saat, durum. GİRDİ yeşil, GEÇ kırmızı, BEKLE yanıp söner.'),
            ('9–14 sn', 'Okut', '“QR OKUT · GİRİŞ · KAPI 1”', 'Sarı yön tabelası kayarak gelir, telefon kapıdaki QR’ı okur, pano yeni satırı ekler.'),
            ('14–19 sn', 'İçeride', '“45/53 · Canlı. Her okutmada döner.”', 'Dev sayaç pulları 44’ten 45’e döner, son gelenler alt satırlarda akar.'),
            ('19–25 sn', 'Çıkış ve puantaj', '“ÇIKIŞLAR · PUANTAJ HAZIR”', 'Akşam panosu: çıkış saatleri ve süreler; “PUANTAJ HAZIR” büyük pullarla tek tek oturur.'),
            ('25–30 sn', 'Marka', '“QR Personel · qrpersonel.com →”', 'Ekran havalimanı sarısına döner; logo tabelaya piktogram gibi oturur, adres ok işaretiyle gelir.'),
        ]),
    'F': dict(
        name='BENTO', pitch='İsviçre ızgarası: cesur renkli kutular vuruşla yer değiştirir, her kutu bir özelliği anlatır.',
        tags=['≈ 30 sn · 9:16 · 1080×1920', 'Krem + kobalt, mandalina, limon, lila', 'Müzik: funky house, 124 BPM'],
        palette=['#EFECE6', '#121212', '#2D4BFF', '#FF6B2C', '#C6F45E', '#C9B8FF'], bg='#E9E6DF', fg='#121212', sub='#6E6A63', acc='#2D4BFF',
        scenes=[
            ('0–4 sn', 'Kanca', '“Ekibin, tek bakışta. · 45/53”', 'Kutular boş ızgaraya vuruşla düşer; sayılar ve saat dönerek dolar.'),
            ('4–9 sn', 'Okut', '“Okut.”', 'Mavi kutu ekranı kaplayacak kadar büyür; QR’a köşeler kilitlenir, Giriş/Çıkış kutuları alttan kayar.'),
            ('9–14 sn', 'Giriş', '“Giriş yapıldı 08:57:12 · Geç: 2”', 'Limon kutuda onay; liste kutusu satır satır dolar, turuncu kutuda geç sayacı.'),
            ('14–19 sn', 'Rapor', '“Giriş saatleri · Puantaj hazır.”', 'Çubuklar büyür, takvim hücreleri dama gibi dolar, siyah kutuda onay.'),
            ('19–25 sn', 'Özellikler', '“Giriş · Çıkış · Geç kalanlar · Puantaj”', 'Dört kutu dönerek yer değiştirir, ikonlar küçük animasyonlarla canlanır.'),
            ('25–30 sn', 'Marka', '“QR Personel · qrpersonel.com →”', 'Bütün kutular tek siyah kutuda birleşir; logo, adres ve renk şeritleri.'),
        ]),
    'G': dict(
        name='MESAJLAŞMA', pitch='Reels’e özgü bir sohbet hikâyesi: “Kim geldi?” mesajları birikir, QR Personel tek mesajla cevap verir.',
        tags=['≈ 30 sn · 9:16 · 1080×1920', 'Sohbet arayüzü + yeşil vurgu', 'Müzik: lo-fi pop, 100 BPM, mesaj sesleri'],
        palette=['#E9EBEE', '#FFFFFF', '#111111', '#2BBE6E', '#FF5A4F'], bg='#E4E6EA', fg='#111111', sub='#5F6670', acc='#2BBE6E',
        scenes=[
            ('0–4 sn', 'Kanca', '“Her sabah aynı soru…”', 'Yönetici yazar: “Günaydın! Bugün kim geldi?” Yazıyor balonu titrer, alt yazı Reels tarzında belirir.'),
            ('4–9 sn', 'Kaos', '“Mesaj trafiği mi?”', 'Cevaplar üst üste yağar: yoldayım, trafik, kart unuttum… Bildirim sesleri sıklaşır.'),
            ('9–14 sn', 'Cevap', '“Sormana gerek yok. · 45/53 içeride”', 'QR Personel kartı tek mesajda gelir: içeride, geç, bekleniyor; avatarlar dizilir.'),
            ('14–19 sn', 'Okut', '“Okut, kayda geçsin.”', 'Bot QR’ı paylaşır, “Okuttum” yanıtı gelir, yeşil sistem satırı: giriş 08:57.'),
            ('19–25 sn', 'Akşam', '“Ay sonu? Hazır.”', 'Çıkış satırı 18:04 · 9 sa 04 dk; Eylül puantajı kartı açılır, günler renklenir.'),
            ('25–30 sn', 'Marka', '“QR Personel · qrpersonel.com · Hemen başlayın”', 'Sohbet kayar, logo profil fotoğrafı gibi büyür, çevrimiçi noktası yanar.'),
        ]),
    'H': dict(
        name='KÂĞIT KESİK', pitch='El yapımı kolaj: kâğıt föyler, yapışkan notlar ve makasla kesilen bir QR. Stop-motion ritim.',
        tags=['≈ 30 sn · 9:16 · 1080×1920', 'Kraft kâğıt + kiremit, hardal, adaçayı', 'Müzik: akustik pop, el çırpma, 110 BPM'],
        palette=['#E6D9C2', '#FBF7EE', '#1C1B19', '#D4643B', '#E7B347', '#8DAA7B'], bg='#E3D6BE', fg='#1C1B19', sub='#6E6250', acc='#D4643B',
        scenes=[
            ('0–4 sn', 'Kanca', '“KİM GELDİ?”', 'Kesik harfler tek tek yapışır; imza föyü, “Ali?” ve “Kart kayıp!” notları masaya düşer (12 fps stop-motion).'),
            ('4–9 sn', 'Kesip at', '“OKUT.”', 'Makas föyü kesik çizgiden keser; parçalar kâğıttan bir QR’a dönüşür, şeritler havaya uçar.'),
            ('9–14 sn', 'Giriş', '“Okuttun, girdin. · GİRİŞ 08:57”', 'Kâğıt telefon QR’ı okur, iple bağlı yeşil etiket sallanarak düşer.'),
            ('14–19 sn', 'Ekip', '“45/53 içeride · Ekip tamam mı? Bir bakışta.”', 'Kâğıttan kişiler katman katman dizilir, sayaç etiketi zıplar.'),
            ('19–25 sn', 'Puantaj', '“Ay sonu? Hazır.”', 'Takvime çıkartmalar yapışır, lastik damga “PUANTAJ HAZIR” diye basılır.'),
            ('25–30 sn', 'Marka', '“QR Personel · qrpersonel.com”', 'Logo kartondan katmanlarla kurulur, adres etiketi iple sallanır.'),
        ]),
}

BW, TW, TH, GAP, MX = 1920, 540, 960, 60, 90
HEAD, CAP = 360, 250


def wrap(d, txt, font, width):
    words, lines, cur = txt.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def board(key, frames_dir, out_dir):
    c = CONCEPTS[key]
    BH = HEAD + 2 * (TH + CAP) + GAP + 70
    im = Image.new('RGB', (BW, BH), c['bg'])
    d = ImageDraw.Draw(im)
    # başlık: konsept harfi, adı, tanımı, etiketler, palet
    d.rounded_rectangle([MX, 70, MX + 200, 270], 36, fill=c['acc'])
    d.text((MX + 100, 170), key, font=F_LETTER, fill=c['bg'] if key != 'C' else '#FFFFFF', anchor='mm')
    d.text((MX + 240, 92), f'KONSEPT {key} · {c["name"]}', font=F_TITLE, fill=c['fg'])
    for i, line in enumerate(wrap(d, c['pitch'], F_SUB, BW - MX * 2 - 240)):
        d.text((MX + 240, 190 + i * 42), line, font=F_SUB, fill=c['sub'])
    x = MX
    for t in c['tags']:
        w = d.textlength(t, font=F_TAG) + 44
        d.rounded_rectangle([x, 296, x + w, 340], 22, outline=c['sub'], width=2)
        d.text((x + 22, 318), t, font=F_TAG, fill=c['fg'], anchor='lm')
        x += w + 16
    for i, col in enumerate(c['palette']):
        cx = BW - MX - 30 - i * 56
        d.ellipse([cx - 22, 296, cx + 22, 340], fill=col, outline=c['sub'], width=2)
    # 6 kare: 3 sütun × 2 satır
    for i, (tm, title, onscr, note) in enumerate(c['scenes']):
        col, row = i % 3, i // 3
        x0 = MX + col * (TW + GAP)
        y0 = HEAD + row * (TH + CAP + GAP)
        fr = Image.open(os.path.join(frames_dir, f'{key}{i + 1}.png')).convert('RGB').resize((TW, TH), Image.LANCZOS)
        mask = Image.new('L', (TW, TH), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, TW - 1, TH - 1], 28, fill=255)
        im.paste(fr, (x0, y0), mask)
        d.rounded_rectangle([x0, y0, x0 + TW - 1, y0 + TH - 1], 28, outline=c['sub'], width=2)
        cy = y0 + TH + 26
        d.ellipse([x0, cy, x0 + 50, cy + 50], fill=c['acc'])
        d.text((x0 + 25, cy + 25), str(i + 1), font=F_NUM, fill=c['bg'] if key != 'C' else '#FFFFFF', anchor='mm')
        d.text((x0 + 66, cy + 4), tm.upper(), font=F_TIME, fill=c['sub'])
        d.text((x0 + 66, cy + 28), title, font=F_SCENE, fill=c['fg'])
        ty = cy + 80
        for line in wrap(d, onscr, F_ON, TW)[:2]:
            d.text((x0, ty), line, font=F_ON, fill=c['acc'] if key != 'C' else c['acc']); ty += 34
        ty += 6
        for line in wrap(d, note, F_NOTE, TW)[:3]:
            d.text((x0, ty), line, font=F_NOTE, fill=c['sub']); ty += 31
    d.text((BW - MX, BH - 40), 'QR Personel · Instagram Reels storyboard · kareler gerçek render', font=F_TAG, fill=c['sub'], anchor='rm')
    slug = {'A': 'vizor', 'B': 'sabah_0859', 'C': 'urun_demosu', 'D': 'izometrik_ofis', 'E': 'kalkis_panosu', 'F': 'bento', 'G': 'mesajlasma', 'H': 'kagit_kesik'}[key]
    path = os.path.join(out_dir, f'konsept_{key}_{slug}.jpg')
    im.save(path, quality=90)
    return path


if __name__ == '__main__':
    frames_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for k in (sys.argv[3] if len(sys.argv) > 3 else ''.join(CONCEPTS)):
        print(board(k, frames_dir, out_dir))
