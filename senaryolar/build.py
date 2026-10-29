"""Hikâye panosunu tek HTML dosyasında birleştirir: logo sembolü ve rozetler gömülür."""
import base64, pathlib, re

here = pathlib.Path(__file__).parent
src = (here / 'pano.src.html').read_text(encoding='utf-8')
svg = (here / 'kaynak' / 'yakinla-logo-mark.svg').read_text(encoding='utf-8')
inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1)
inner = re.sub(r'<!--.*?-->', '', inner, flags=re.S)
symbol = f'<symbol id="ylogo" viewBox="0 0 1024 1024">{inner}</symbol>'
b64 = lambda f: 'data:image/png;base64,' + base64.b64encode((here / 'kaynak' / f).read_bytes()).decode()
out = (src.replace('{{LOGO_SYMBOL}}', symbol)
          .replace('{{BADGE_APPSTORE}}', b64('badge-appstore.png'))
          .replace('{{BADGE_GOOGLE}}', b64('badge-googleplay.png')))
(here / 'yagmurda-karda-camurda.html').write_text(out, encoding='utf-8')
print('yazıldı', len(out) // 1024, 'KB')
