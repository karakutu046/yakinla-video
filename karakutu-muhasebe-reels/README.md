# Karakutu Muhasebe — Instagram Reels tanıtım videosu

[karakutuveri.com/muhasebe](https://www.karakutuveri.com/muhasebe) için dikey (9:16, 1080×1920) 30–45 sn'lik
animasyonlu tanıtım videosu.

**1. adım: konsept seçimi.** 6 konseptin ana kareleri tek görselde: [`out/konsept-panosu.jpg`](out/konsept-panosu.jpg).
Sahne akışları: [`KONSEPTLER.md`](KONSEPTLER.md).

Panoyu yeniden üretmek için:

```bash
NODE_PATH="$(npm root -g)" node konsept/render-pano.cjs build/pano.png 1.5
ffmpeg -y -i build/pano.png -q:v 2 out/konsept-panosu.jpg
```

| Dosya | Görevi |
|---|---|
| `konsept/pano.html` | 6 ana kare + açıklamalar (HTML/CSS/SVG, 1080×1920 kareler yarı ölçekte). |
| `konsept/render-pano.cjs` | Panoyu headless Chromium ile PNG'ye basar. |
| `fonts/` | Inter / Inter Display ve Caveat (SIL OFL 1.1, lisanslar klasörde). |
