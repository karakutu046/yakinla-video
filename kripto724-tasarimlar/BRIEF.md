# kripto724 · Video design boards (brief)

Six different visual directions for the same ~40-second film. Each direction is **one board**
showing all 9 scenes. The client picks one, and that design is then animated into the final video
with the pipeline in `allinvestview-showreel/`. The scene drawings therefore need to be
animatable, so draw them the way the showreel does (canvas 2D, pure functions, no external images).

- **Subject:** AllInvestView, the portfolio tracker for every asset (stocks, ETFs, bonds,
  options, crypto, real estate, funds, cash), offered at **www.kripto724.com/app**.
- **Audience:** Turkish investors who also hold crypto. **All on-screen copy is in Turkish.**
- **Format:** 16:9, 1920×1080, ~40 s, 120 BPM (every cut on a 2-second bar).
- The kripto724.com site could not be reached from the build environment, so do not invent a
  kripto724 logo or brand identity. Write "kripto724.com/app" as plain text only. The product name
  "AllInvestView" can use `wordmark()` from `lib/core.js` (capital I with serifs, "View" in gradient)
  or be set in the design's own typeface.

## Story (shared skeleton; each design tells it its own way)

| # | Time | Scene | Content |
|---|---|---|---|
| 1 | 0–4 s | Hook | The problem: investments are scattered (stocks in one app, crypto on another exchange, calculations in a spreadsheet). |
| 2 | 4–8 s | Promise | "Tüm yatırımların, tek ekranda." / "tek net görünüm". AllInvestView appears. |
| 3 | 8–13 s | Dashboard | Total value, performance chart (vs S&P 500), daily change, holdings, allocation. |
| 4 | 13–17 s | Every asset | 8 asset classes; 60+ markets, 50+ currencies. |
| 5 | 17–21 s | Sync | Automatic sync with 25+ brokers; read-only; updated nightly. |
| 6 | 21–25 s | Dividends | Dividend calendar, payments received, forecast. |
| 7 | 25–31 s | Risk lab | 1,000-scenario Monte Carlo and/or efficient frontier, risk metrics. |
| 8 | 31–35 s | Quick features | Benchmark · Tax report (FIFO/LIFO/average cost) · AI import · Crisis test. |
| 9 | 35–40 s | Closing | "Ücretsiz başla — kredi kartı gerekmez" + **www.kripto724.com/app** + disclaimer. |

## Approved claims (do not add anything outside this list)

- Stocks (Hisse senedi), ETFs, bonds (tahvil), options (opsiyon), crypto, real estate (gayrimenkul),
  investment funds (yatırım fonu), cash (nakit) — "8 varlık sınıfı".
- Allocation by asset class, country, sector and broker. Daily change, total return, CAGR, unrealised gains.
- Benchmark against S&P 500 (SPY), VOO or any index you choose.
- **25+ aracı kurumla otomatik senkron**, read-only connection, updated nightly; CSV and AI-assisted
  import. Broker names may appear only as plain text: Interactive Brokers, Charles Schwab, Fidelity,
  Robinhood, Trading 212, DEGIRO, eToro, Coinbase, Wealthsimple, Public. No logos.
- **60+ markets, 50+ currencies**; each trade converted at its own trade-date exchange rate.
- Dividends: calendar, payments received, forecast, yield on cost.
- Risk: 1,000-scenario Monte Carlo (1–10 years, 5th–95th percentile range), Markowitz efficient
  frontier (highest Sharpe), Sharpe, beta, volatility, VaR, maximum drawdown, 4 real crisis scenarios.
- Tax: FIFO, LIFO, average cost; tax reports on every plan.
- Pricing: "Ücretsiz başla — kredi kartı gerekmez".
- **Do not:** promise live / real-time / 24/7 tracking (sync is nightly), promise returns or profit,
  imply buying, selling or trading, offer "advice", or show any real company logo.
- Every number on screen is illustrative. The closing scene carries the small line "Örnek veriler
  gösterilmektedir. Yatırım tavsiyesi değildir."

## Turkish typography rules

- Uppercase "i" is "İ" in Turkish: KRİPTO, VİDEO, PİYASA, RİSK, GİRİŞ… (`toLocaleUpperCase('tr')`).
- Numbers: thousands with a dot, decimals with a comma: ₺2.847.516,36 · 1,24 · "1.000 senaryo".
  Percentages: "%0,69", "+%38,4", "−%18,6".
- Missing glyphs: no font has **→** (draw arrows as shapes), and **₺** is missing from JetBrains Mono,
  Playfair Display, DM Serif Display and Sora. Set ₺ in Manrope / Inter / Space Grotesk / Unbounded / Anton.
- Fonts (`fonts/fonts.css`, all SIL OFL): 'Anton' 400 · 'Space Grotesk' 500/700 · 'JetBrains Mono'
  400/700/800 · 'Playfair Display' 400/700/900 (+italic) · 'Sora' 400/600/700/800 · 'Unbounded'
  400/600/800 · 'DM Serif Display' 400 (+italic) · 'Manrope' 500/600/700/800 · 'Inter' 500/600/700 ·
  'Inter Display' 700/800/900.

## Technical

- Each design lives in `designs/dN.js` and sets `window.DESIGN` (see the top of `lib/board.js`).
  `lib/core.js` provides `text`, `letters`, `slotText`, `odometer`, `glass`, `pill`, `glow`/`addGlow`,
  `smoothPath`, `cutAt`, `walk`, `mulberry32`, `plane3d`, `drawMark`, `wordmark`, `sparkle`, `check`.
  Write your own helpers inside your own file and prefix their names (e.g. `d3_`) to avoid clashes.
- `scene.draw(g)` paints a 1920×1080 key frame: the most expressive moment of that scene, with
  transition traces where they help (motion blur, half-arrived text). Fill the whole background.
- Rendering: `cd kripto724-tasarimlar && D=N NODE_PATH="$(npm root -g)" node render.cjs` → `out/tasarim_N.png`;
  for a single scene, `D=N S=3` → `build/dN_s3.png`. **Look at the output** (Read) and fix overflowing
  text, overlaps, missing glyphs (a box or a fallback font) and contrast problems.
- Quality bar: at least as good as the frames in `allinvestview-showreel/out/`. Each design should
  have its own distinctive look; never just a recolour.
