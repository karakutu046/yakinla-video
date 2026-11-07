"""Senaryo panosundaki ikon setini (senaryolar/pano.src.html) ve resmî logo sembolünü
src/parts/iconDefs.ts dosyasına aktarır. Kullanım: python3 scripts/ikonlar.py"""
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent.parent
src = (here.parent / 'senaryolar' / 'pano.src.html').read_text(encoding='utf-8')
defs = re.search(r'<defs>(.*?)</defs>', src, re.S).group(1).replace('{{LOGO_SYMBOL}}', '')
defs = re.sub(r'<!--.*?-->', '', defs, flags=re.S)
svg = (here / 'public' / 'yakinla-logo-mark.svg').read_text(encoding='utf-8')
inner = re.sub(r'<!--.*?-->', '', re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1), flags=re.S)
body = f'<symbol id="ylogo" viewBox="0 0 1024 1024">{inner.strip()}</symbol>\n{defs}'
body = '\n'.join(l.strip() for l in body.splitlines() if l.strip())
out = ('// Senaryo panosundaki premium ikon seti (senaryolar/pano.src.html) ve resmî logo sembolü.\n'
       '// Tüm sahneler bu sembollere <use href="#i-…"> ile başvurur. Üretici: scripts/ikonlar.py\n'
       'export const ICON_DEFS = `' + body.replace('`', '\\`').replace('${', '\\${') + '`;\n')
(here / 'src' / 'parts' / 'iconDefs.ts').write_text(out, encoding='utf-8')
print('src/parts/iconDefs.ts yazıldı')
