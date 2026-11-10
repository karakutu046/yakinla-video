#!/usr/bin/env python3
"""Kaynak fotoğraf ve videoları kurguya hazırlar.

Kullanım:  python3 hazirla.py sahneler.json

- Her sahnenin medyası 9:16 (1080×1920) kadraja odak noktasından kırpılır, ya da yatay
  çekimlerde ("yerlesim": "bulanik") tam genişlikte ortalanıp arkasına bulanık bir kopyası konur.
- Videolardan sahnenin süresi (iki yanda 0,5 sn payla) 30 fps JPEG kare olarak çıkarılır;
  "hiz" < 1 ise ağır çekim olur. Fotoğraflar tek kare olarak hazırlanır, hareketi anim.js verir.
- Renk düzeltmesi (parlaklık, kontrast, doygunluk, sıcaklık, keskinlik) burada uygulanır.
- Logo kenarlarından kırpılır, renk paletinden öneri yazdırılır.
- Sonuç: build/medya/… ve anim.js'in okuduğu build/plan.json. Değişmeyen sahneler yeniden işlenmez.
"""
import hashlib
import json
import math
import os
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image, ImageOps

try:
    import pillow_heif  # iPhone HEIC fotoğrafları için (pip install pillow-heif)
    pillow_heif.register_heif_opener()
except ImportError:
    pass

W, H, FPS = 1080, 1920, 30
PAD = 0.5  # anim.js ile aynı: medya sahnenin iki yanında bu kadar taşar (geçişler için)
ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(ROOT, 'build')
MEDYA = os.path.join(BUILD, 'medya')
FOTO = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.bmp', '.tif', '.tiff'}
VIDEO = {'.mp4', '.mov', '.m4v', '.3gp', '.avi', '.mkv', '.webm', '.mts'}
VARSAYILAN_DUZELT = {'parlaklik': 0.0, 'kontrast': 1.05, 'doygunluk': 1.15, 'gama': 1.0,
                     'sicaklik': 6100, 'keskinlik': 0.35}
uyarilar = []


def uyar(s):
    uyarilar.append(s)
    print('  ! ' + s)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('ffmpeg hatası:\n' + ' '.join(cmd) + '\n' + r.stderr[-2000:])
    return r.stdout


def even(x):
    return int(math.ceil(x / 2) * 2)


def probe(path):
    """Videonun görüntülenen boyutu (döndürme dahil), süresi ve ses kanalı olup olmadığı."""
    out = json.loads(run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', path]))
    v = next(s for s in out['streams'] if s['codec_type'] == 'video')
    w, h = int(v['width']), int(v['height'])
    rot = 0
    for sd in v.get('side_data_list', []) or []:
        if 'rotation' in sd:
            rot = int(float(sd['rotation']))
    rot = int(float(v.get('tags', {}).get('rotate', rot)))
    if abs(rot) % 180 == 90:
        w, h = h, w
    dur = float(out['format'].get('duration') or v.get('duration') or 0)
    has_audio = any(s['codec_type'] == 'audio' for s in out['streams'])
    return w, h, dur, has_audio


def duzelt_filtresi(d):
    f = [f"eq=brightness={d['parlaklik']}:contrast={d['kontrast']}:saturation={d['doygunluk']}:gamma={d['gama']}"]
    if int(d['sicaklik']) != 6500:
        f.append(f"colortemperature=temperature={int(d['sicaklik'])}:mix=1:pl=1")
    if d['keskinlik'] > 0:
        f.append(f"unsharp=5:5:{d['keskinlik']}:5:5:0")
    return ','.join(f)


def kirp_filtresi(iw, ih, ow, oh, odak):
    """Kaynağı (iw×ih) ow×oh'yi kaplayacak şekilde büyütüp odak noktasından kırpar.
    Döner: filtre, odak noktasının kırpılmış görüntüdeki yeri, büyütme oranı."""
    s = max(ow / iw, oh / ih)
    sw, sh = iw * s, ih * s
    fx, fy = odak
    x = min(max(fx * sw - ow / 2, 0), sw - ow)
    y = min(max(fy * sh - oh / 2, 0), sh - oh)
    swi, shi = even(sw), even(sh)
    filt = f'scale={swi}:{shi}:flags=lanczos,crop={ow}:{oh}:{int(x)}:{int(y)}'
    return filt, [fx * sw - x, fy * sh - y], s


def anahtar(*parts):
    return hashlib.sha1(json.dumps(parts, sort_keys=True, default=str).encode()).hexdigest()


def foto_kaynagi(path, dst):
    """EXIF yönünü uygular (telefon fotoğrafları), ffmpeg için PNG'ye yazar."""
    im = Image.open(path)
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.save(dst)
    return im.size


def hazirla_sahne(i, s, cfg):
    sid = f's{i:02d}'
    out = os.path.join(MEDYA, sid)
    kapanis = s.get('tip') == 'kapanis'
    src_rel = s.get('arka') if kapanis else s.get('medya')
    if not src_rel:
        return None
    src = os.path.join(ROOT, src_rel)
    if not os.path.exists(src):
        sys.exit(f'Sahne {i + 1}: dosya bulunamadı: {src_rel}')
    ext = os.path.splitext(src)[1].lower()
    tip = 'foto' if ext in FOTO else 'video' if ext in VIDEO else None
    if not tip:
        sys.exit(f'Sahne {i + 1}: tanınmayan dosya türü: {src_rel}')
    yer = 'arka' if kapanis else s.get('yerlesim', 'kirp')
    zoom = s.get('zoom', [1.0, 1.08])
    punch = 1.05 if s.get('gecis', 'kes') in ('kes', 'flas') else 1.0
    os_ = min(1.6, max(1.0, max(zoom) * punch))
    hiz = float(s.get('hiz', 1.0))
    bas = float(s.get('bas', 0.0))
    sure = float(s['sure'])
    duz = {**VARSAYILAN_DUZELT, **cfg.get('renk_duzelt', {}), **s.get('renk_duzelt', {})}
    odak = s.get('odak', [0.5, 0.5])
    ses = float(s.get('ses', 0.0))
    st = os.stat(src)
    key = anahtar(src_rel, st.st_size, int(st.st_mtime), yer, zoom, punch, hiz, bas, sure, duz, odak, ses, tip, 3)
    m = {'tip': tip, 'yerlesim': yer, 'dir': f'build/medya/{sid}', 'kaynak': src_rel}
    meta_path = os.path.join(out, 'meta.json')
    if os.path.exists(meta_path):
        old = json.load(open(meta_path))
        if old.get('anahtar') == key:
            print(f'  {sid}: değişmedi ({src_rel})')
            return old['m']
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    grade = duzelt_filtresi(duz)

    # kaynağın görüntülenen boyutu
    if tip == 'foto':
        tmp = os.path.join(out, 'kaynak.png')
        iw, ih = foto_kaynagi(src, tmp)
        inp = ['-i', tmp]
        n_src_dur = None
    else:
        iw, ih, vdur, has_audio = probe(src)
        u_start = -PAD
        t_src0 = bas + u_start * hiz
        u0 = u_start if t_src0 >= 0 else -bas / hiz
        t_src0 = max(0.0, t_src0)
        need = (sure + PAD - u0) * hiz
        if t_src0 + need > vdur + 0.05:
            if bas + sure * hiz > vdur + 0.05:
                uyar(f'{sid}: video {vdur:.1f} sn, sahne {bas:.1f}+{sure * hiz:.1f} sn istiyor; son kare dondurulacak')
            need = max(0.1, vdur - t_src0)
        inp = ['-ss', f'{t_src0:.3f}', '-t', f'{need:.3f}', '-i', src]
        m['u0'] = round(u0, 4)
        speed = f'setpts=(PTS-STARTPTS)/{hiz},fps={FPS}'

    def cikti(vf, name):
        if tip == 'foto':
            run(['ffmpeg', '-y', '-v', 'error', *inp, '-vf', vf, '-frames:v', '1', '-q:v', '2', os.path.join(out, name + '.jpg')])
        else:
            run(['ffmpeg', '-y', '-v', 'error', *inp, '-vf', f'{speed},{vf}', '-an', '-q:v', '3', '-start_number', '0',
                 os.path.join(out, name + '_%04d.jpg')])

    if yer == 'kirp':
        ow, oh = even(W * os_), even(H * os_)
        filt, foc, sc = kirp_filtresi(iw, ih, ow, oh, odak)
        if sc > 1.45:
            uyar(f'{sid}: kaynak küçük ({iw}×{ih}), {sc:.1f}× büyütülüyor; görüntü yumuşak olabilir')
        cikti(f'{filt},{grade},setsar=1', 'f')
        m.update(w=ow, h=oh, odak=[round(foc[0], 1), round(foc[1], 1)])
    else:
        # bulanık arka plan (küçük, yumuşak) + kapanışta yalnızca o
        bw, bh = 270, 480
        bfilt, _, _ = kirp_filtresi(iw, ih, bw, bh, odak)
        cikti(f'{bfilt},gblur=sigma=9,{grade},eq=brightness=-0.06:saturation=1.1,setsar=1', 'b')
        m['bg'] = True
        if yer == 'bulanik':
            fw = even(W * os_)
            fh = even(ih * fw / iw)
            if fw / iw > 1.45:
                uyar(f'{sid}: kaynak küçük ({iw}×{ih}), {fw / iw:.1f}× büyütülüyor; görüntü yumuşak olabilir')
            cikti(f'scale={fw}:{fh}:flags=lanczos,{grade},setsar=1', 'f')
            m.update(w=fw, h=fh)
        else:
            m['yalniz_bg'] = True
    if tip == 'video':
        m['n'] = len([f for f in os.listdir(out) if f.startswith('b_' if m.get('yalniz_bg') else 'f_')])
        if ses > 0 and has_audio and not kapanis:
            at = []
            h = hiz
            while h < 0.5:
                at.append('atempo=0.5'); h /= 0.5
            at.append(f'atempo={h}')
            run(['ffmpeg', '-y', '-v', 'error', *inp, '-vn', '-af', ','.join(at), '-ar', '48000', '-ac', '2',
                 os.path.join(out, 'ses.wav')])
            m['ses'] = {'dosya': f'build/medya/{sid}/ses.wav', 'u0': m['u0'], 'kazanc': ses}
    if tip == 'foto':
        os.remove(os.path.join(out, 'kaynak.png'))
    json.dump({'anahtar': key, 'm': m}, open(meta_path, 'w'))
    print(f'  {sid}: {tip} {iw}×{ih} → {yer}{" · " + str(m.get("n")) + " kare" if tip == "video" else ""} ({src_rel})')
    return m


def hazirla_logo(cfg):
    lg = cfg.get('logo') or {}
    if not lg.get('dosya'):
        return None
    src = os.path.join(ROOT, lg['dosya'])
    if not os.path.exists(src):
        sys.exit(f'Logo bulunamadı: {lg["dosya"]}')
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGBA')
    w, h = im.size
    # kenar kırpma: saydam ya da beyaza yakın olmayan pikseller
    a = np.asarray(im)
    dolu = (a[..., 3] > 16) & ~((a[..., 0] > 242) & (a[..., 1] > 242) & (a[..., 2] > 242))
    mask = Image.fromarray((dolu * 255).astype(np.uint8))
    bb = mask.getbbox() or (0, 0, w, h)
    m = max(4, int(0.02 * max(w, h)))
    bb = (max(0, bb[0] - m), max(0, bb[1] - m), min(w, bb[2] + m), min(h, bb[3] + m))
    im = im.crop(bb)
    if max(im.size) > 1400:
        im.thumbnail((1400, 1400), Image.LANCZOS)
    os.makedirs(MEDYA, exist_ok=True)
    im.save(os.path.join(MEDYA, 'logo.png'))
    # palet önerisi: beyaz, siyah ve saydam dışındaki baskın renkler
    q = im.convert('RGB').quantize(8)
    pal = q.getpalette()[:24]
    counts = sorted(q.getcolors(), reverse=True)
    oneri = []
    for c, idx in counts:
        r, g, b = pal[idx * 3: idx * 3 + 3]
        if max(r, g, b) - min(r, g, b) < 40:
            continue
        oneri.append('#%02X%02X%02X' % (r, g, b))
    print(f'  logo: {im.size[0]}×{im.size[1]} · baskın renkler: {", ".join(oneri[:4]) or "—"}')
    return {'url': 'build/medya/logo.png', 'w': im.size[0], 'h': im.size[1], 'kose': lg.get('kose', True),
            'oneri': oneri[:4]}


def main():
    cfg_path = sys.argv[1] if len(sys.argv) > 1 else 'sahneler.json'
    cfg = json.load(open(os.path.join(ROOT, cfg_path) if not os.path.isabs(cfg_path) else cfg_path, encoding='utf-8'))
    os.makedirs(MEDYA, exist_ok=True)
    print(f'Hazırlanıyor: {cfg_path}')
    plan = {k: v for k, v in cfg.items() if k != 'sahneler'}
    plan['sahneler'] = []
    for i, s in enumerate(cfg['sahneler']):
        s = dict(s)
        s['m'] = hazirla_sahne(i, s, cfg)
        plan['sahneler'].append(s)
    plan['logo'] = hazirla_logo(cfg)
    plan['pad'] = PAD
    plan['uyarilar'] = uyarilar
    json.dump(plan, open(os.path.join(BUILD, 'plan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sure = sum(s['sure'] for s in cfg['sahneler'])
    print(f'build/plan.json: {len(cfg["sahneler"])} sahne, {sure:.2f} sn'
          + (f' · {len(uyarilar)} uyarı' if uyarilar else ''))


if __name__ == '__main__':
    main()
