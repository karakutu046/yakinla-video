# kripto724 · Video design boards (brief v2)

Six different visual directions for the same ~40-second promo film for **kripto724**. Each direction
is **one board** showing all 9 scenes (`lib/board.js`). The client picks one, and that design is then
animated into the final video with the pipeline in `allinvestview-showreel/` (canvas 2D, pure
functions, motion blur). So draw the way that pipeline draws: canvas code only, no external images
except the official logo masks.

- **Brand:** kripto724 — a Turkish mobile/web app that tracks **crypto, stocks (BIST & Nasdaq) and
  commodities (gold, silver, oil)** with live prices, alarms, analysis, news, a personal "Kasam"
  (vault) and connected exchange accounts. Address: **kripto724.com** (never "/app"). No other brand
  or product name appears anywhere.
- **Audience:** Turkish retail investors. **All on-screen copy is in Turkish**, in the app's own
  friendly "sen" voice (the app writes "Ücretsiz Ailemize Katılın!").
- **Format:** 16:9, 1920×1080, ~40 s, 120 BPM (every cut on a 2-second bar).

## Logo — official, never redraw it

- `logo(g, cx, cy, h, o)` (lib/k724logo.js) draws the **official stacked logo** ("kripto", an
  orange bar, a big "724") from the client's artwork, centred at (cx, cy), h px tall; `logoW(h)` gives
  its width (aspect ≈ 1.135). Letters: `o.ink` — **'#FFFFFF' on dark backgrounds, default black on
  light ones**. The bar always stays brand orange #F7931A (o.bar only if a design truly needs it; it
  should not). Never stretch, skew, outline, recolour the bar, add strokes or rebuild it from text.
  A soft glow or shadow behind it is fine. Keep clear space around it of at least 0.25 × its height.
- `logoH(g, x, y, size, o)` (lib/core.js) is the **horizontal lockup** the app's own banners use:
  "kripto" | "724" in Poppins Bold with a thin orange vertical bar. Use it for small headers, UI
  chrome and banner corners. o.ink colour, o.a 'left' | 'center' | 'right'. Returns the width.
- **App icon** (the centre button of the app's bottom nav): a black rounded square (radius ≈ 0.22 ×
  its size) with the white stacked logo inside (logo height ≈ 0.66 × the square).
- In running text the name is written "Kripto724" (as in the app: "hesaplarını Kripto724'e bağla").

## Brand and app colours (from the app)

- Brand: black #0A0A0A, white #FFFFFF, **orange #F7931A** (the logo bar; the primary accent).
  **Every design must use #F7931A as a principal accent and list it in its 5-colour palette.**
- App UI (light theme): page #EEF0F5, white cards (radius ~22 px, soft shadow), text #14161F,
  secondary #7A7F8C, rows separated by hairlines #EEF0F4. Gain: green text #16A34A on a pale green pill
  #DCF5E6. Loss: red text #E5484D on a pale red pill #FDE2E2. Segmented tabs: a light lavender track
  #ECEBFF / #F1F0FA with the selected tab as a white pill. Count badges in lavender (#E5E3FF bg,
  #6E5BFF text). "CANLI" badge: green dot #10B981 + green text on #E3F7EE. Orange is used in banners
  (titles like "Katılın!"), the "Favoriler" star, and the logo bar. The gold screen uses a warm cream
  (#FFF7E3) card with gold (#D9A520 → #F2C14E) buttons.
- App UI font looks like Inter (use 'Inter' for app-UI mockups); brand lockup in 'Poppins'.

## The app's screens (reference — the client's screenshots, described)

1. **Home ("Anasayfa")** — top: a rounded hero banner with logoH at top-left, headline
   "Nasdaq ve BIST / Hisselerini Görün" (second line in orange), feature chips "Hisse Analizi ·
   Teknik Analiz · Fiyat Tahmini · Sinyal Alarmları" and "ve daha fazlası…", 3D illustration of a
   phone with the app, a city skyline. Below: a white card with tabs **Kripto | Borsa | Emtia** and a
   green "● CANLI" badge; columns **Varlık · Fiyat · Günlük · Haftalık**; rows (coin icon, name,
   pair): Bitcoin BTC/USDT $80.220,05 −1,49% −2,05% · Ethereum ETH/USDT $2.325,10 −1,67% −3,24% ·
   XRP $1,2913 −2,64% −2,80% · BNB $740,00 −2,66% +0,89% · Solana $100,56 −2,17% −3,83% · Dogecoin
   $0,07862 −1,87% −0,87% · Cardano $0,201 −2,85% −7,42%; footer "Güncellendi 14:24". Then three
   picture cards: **Borsa** "Nasdaq ve BIST" · **Kripto** "BTC, ETH, XRP ve fazlası" · **Emtia** "Altın,
   gümüş, petrol ve fazlası".
2. **Borsa** — title "Borsa", subtitle "BIST ve Nasdaq hisseleri", badge "● CANLI · 14:23". Two index
   cards: **BIST 100 11.165,44 +0,13%** and **Nasdaq 100 29.813,16 +0,55%**, each with a sparkline.
   Tabs **Tümü 210 · BIST 108 · Nasdaq 102**; filters ★ Favoriler · **Popüler** (selected, black
   pill) · Yükselenler · Düşenler. Search "Hisse adı ya da kodu ara…", "210 hisse", "Fiyat · Günlük".
   Rows: MU Micron Technology NASDAQ $983,23 +5,87% · META Meta Platforms $612,49 −1,24% · NVDA NVIDIA
   $215,38 −1,17% · GOOGL Alphabet (Google) $324,89 +1,34% · TSLA Tesla $404,22 −0,79% · MSFT
   Microsoft $531,01 −0,06% · AAPL Apple $343,83 −0,94%, each with a small sparkline and a pill.
   Bottom nav: Akış · Haberler · [app icon] · Alarmlarım · Hesabım.
3. **Altın / Kasam** — banner "Kasam — Altın, döviz ve kişisel varlıklarını tek ekranda **güvenle**
   takip et." with a vault and a phone showing "₺1.250.430", button "Kasamı Gör". Gold card "Au Altın ·
   Kapalıçarşı · canlı", toggle **₺ TL | $ USD**. **Gram Altın ₺6.510,83 +0,40%** (Alış 6.422 ·
   Satış 6.511) and **Ons Altın $4.033,60 +0,40%**. "ALTIN FİYATLARI" with Yeni basım / **Eski basım**;
   table Ürün · Alış · Satış · Değişim: Gram Altın (24 ayar · gram) 6.422,05 / 6.510,83 +0,40% · Has
   Altın (995 · gram) 6.454,32 / 6.491,36 · 22 Ayar (bilezik · gram) 5.871,43 / 6.081,88 · Çeyrek Altın
   (1,75 gr · 22 ayar) 10.327 / 10.476 +0,60% · Yarım Altın 20.654 / 20.815 · Tam Altın 41.372 / 41.727
   · Ata Altın 42.566 / 42.993 +0,32% · Gremse 102.946 / 104.301 · Ata Beşli 212.799 / 214.914 +0,25%.
4. **Fırsatlar** — banner "kripto | 724 — Ücretsiz Ailemize **Katılın!**" (orange) "Kripto, borsa ve
   emtia piyasalarını takip edin; alarm kurun, analizleri inceleyin ve fırsatları yakalayın." (3D globe,
   coins, rising arrow). A marquee "kripto | 724 Komisyon İndirimi Seç · BINANCE %10 indirim · Bitget…".
   Banner "**Kripto Hesabını Bağla** — Binance, Bitget ve MEXC hesaplarını Kripto724'e kolayca bağla",
   button "Bağla →". Banner "**Kripto Hakkında Her Şey**" (video thumbnails), button "Şimdi Keşfet".
   Bottom nav: Akış · Grafik · [app icon] · Favorilerim · Hesabım.

Draw mockups of these screens (inside phone frames or as floating cards) with this exact data.
**No real company, exchange or coin logos:** draw coins and stocks as coloured circles with the
ticker's initial(s) (BTC orange #F7931A, ETH indigo, XRP black, BNB yellow, SOL violet→teal,
DOGE gold, ADA blue; stocks as neutral circles with the ticker). Exchange names appear only as plain
text.

## Story (9 scenes; each design tells it its own way)

| # | Time | Scene | Content |
|---|---|---|---|
| 1 | 0–4 s | Hook | The problem: prices scattered everywhere. Crypto in one app, stocks somewhere else, gold on yet another site. "Piyasa hiç durmuyor." |
| 2 | 4–8 s | Promise | "Kripto, borsa ve emtia tek uygulamada." The official logo arrives (big, stacked). |
| 3 | 8–12 s | Crypto | Live crypto table (Kripto tab, ● CANLI, BTC…ADA, günlük/haftalık). "Canlı fiyatlar, 7/24." |
| 4 | 12–16 s | Stocks | BIST 100 & Nasdaq 100 cards; **210 hisse: BIST 108 · Nasdaq 102**; Popüler / Yükselenler / Düşenler / Favoriler; search. |
| 5 | 16–20 s | Gold & commodities | Kapalıçarşı live gold prices (gram, çeyrek, yarım, tam, ata…), alış/satış, ₺ TL / $ USD; "gümüş, petrol ve fazlası". |
| 6 | 20–24 s | Kasam | "Altın, döviz ve kişisel varlıklarını tek ekranda güvenle takip et." (₺1.250.430 example). |
| 7 | 24–29 s | Alarms & analysis | Set an alarm, a notification arrives; Hisse analizi · Teknik analiz · Fiyat tahmini · Sinyal alarmları; news ("Haberler", "Akış"). |
| 8 | 29–34 s | Connect & perks | "Kripto hesabını bağla": Binance, Bitget, MEXC; commission discount "Binance %10 indirim"; "Kripto hakkında her şey" videos. |
| 9 | 34–40 s | Closing | "Ücretsiz ailemize katılın!" + official logo (or app icon) + **kripto724.com** + small "Yatırım tavsiyesi değildir. Fiyatlar örnektir." |

## Approved claims (only these)

Crypto, stocks (BIST and Nasdaq) and commodities (gold, silver, oil and more) in one app · live prices
("CANLI") with daily and weekly change · 210 stocks (BIST 108, Nasdaq 102), BIST 100 / Nasdaq 100,
popular / gainers / losers / favourites lists, search · Kapalıçarşı live gold prices with buy/sell,
TL/USD, new/old mint · Kasam: track gold, currency and personal assets on one screen, securely · price
alarms and signal alarms · stock analysis, technical analysis, price forecast · news and feed ·
connect Binance, Bitget and MEXC accounts to Kripto724 · commission discount (Binance %10) · "Kripto
Hakkında Her Şey" educational videos · free to join ("Ücretsiz Ailemize Katılın!").

**Do not:** promote futures, leverage or trading volume; promise profit or gains ("kazan", "zengin
ol"); give advice; show app-store badges; add features that are not in the list above; show real
logos. The closing frame carries "Yatırım tavsiyesi değildir. Fiyatlar örnektir."

## Turkish typography and numbers

- Uppercase "i" is "İ" (`toLocaleUpperCase('tr')`), but brand names (Binance, Bitget, MEXC, Nasdaq,
  BIST, kripto724) keep their own spelling.
- Numbers as in the app: $80.220,05 · ₺6.510,83 · 11.165,44 · **"+0,13%" / "−1,49%" (percent sign
  after the number, as the app shows it)** · "210 hisse".
- Missing glyphs: no font has **→** (draw arrows as shapes). **₺** is missing from JetBrains Mono,
  Playfair Display, DM Serif Display and Sora; set ₺ in Inter / Manrope / Poppins / Space Grotesk /
  Unbounded / Anton.
- Fonts (`fonts/fonts.css`, all SIL OFL): 'Poppins' 500/600/700/800 · 'Inter' 500/600/700 · 'Inter
  Display' 700/800/900 · 'Anton' · 'Space Grotesk' 500/700 · 'JetBrains Mono' 400/700/800 · 'Playfair
  Display' 400/700/900 (+italic) · 'Sora' 400–800 · 'Unbounded' 400/600/800 · 'DM Serif Display' (+italic)
  · 'Manrope' 500–800.

## Technical

- Each design lives in `designs/dN.js` and sets `window.DESIGN` (see the top of `lib/board.js`).
  `lib/core.js` provides `text`, `letters`, `slotText`, `odometer`, `glass`, `pill`, `glow`/`addGlow`,
  `smoothPath`, `cutAt`, `walk`, `mulberry32`, `plane3d`, `projector`, `makeTex`, `texBegin`,
  `quadShadow`, `sparkle`, `check`, `logoH`; `lib/k724logo.js` provides `logo`, `logoW`.
  (`drawMark` / `wordmark` no longer exist.) Prefix your own top-level names (`d3_`, `D3`).
- `scene.draw(g)` paints one 1920×1080 key frame — the most expressive moment of the scene, with
  transition traces where they help. Fill the whole background.
- Render: `cd kripto724-tasarimlar && D=N NODE_PATH="$(npm root -g)" node render.cjs` → `out/tasarim_N.png/.jpg`;
  single scenes `D=N S=3 …` → `build/dN_s3.png`. **Look at the output** (Read) and fix overflowing
  text, overlaps, missing glyphs, contrast, and anything that does not look like the real app.
