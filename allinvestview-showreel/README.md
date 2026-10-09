# AllInvestView: 42-second motion graphics showreel

A landscape (16:9, 1920×1080, 30 fps) promo film with sound for AllInvestView, the multi-asset
portfolio tracker, pointing viewers to **www.kripto724.com/app**. It fits YouTube, LinkedIn, X, a
website hero and a pitch deck.

**Output:** [`out/allinvestview_showreel_42s.mp4`](out/allinvestview_showreel_42s.mp4) (H.264 + AAC, −14 LUFS) · cover image [`out/cover.jpg`](out/cover.jpg)

Everything on screen is drawn in code: no stock footage, screenshots or AI-generated imagery. The
globe uses real coastlines (a land mask sampled into ~3,800 dots). The 1,000 Monte Carlo paths and
the efficient-frontier cloud are actually simulated, from seeded random numbers. Music and sound
effects are synthesised too, with no samples.

## Storyboard

| Time | Scene | On screen | Motion and sound |
|---|---|---|---|
| 0–4 s | **Hook** | **Stocks here. → Crypto there. → Spreadsheets everywhere.** | Broker apps, a `#REF!` spreadsheet, a crypto exchange, a pension portal "last updated 94 days ago" and a to-do list of money worries pop in on the beat, start shaking, then spiral into a single point of light. |
| 4–8 s | **Reveal** | **All your investments, one clear view.** → mark → **AllInvestView** | The light bursts into a six-colour ring (every asset class). The promise lands word by word. The ring condenses into the mark, the wordmark rises and the camera dives through the ring. |
| 8–14 s | **Dashboard** | Total value, performance vs S&P 500, KPI tiles, holdings, allocation, upcoming dividends | The dashboard flies in tilted in true 3D and lands face-on while building itself. The odometer counts to $284,517.36 and the chart draws against SPY. The camera pushes into the chart (*Your whole portfolio, at a glance.*), then into the allocation ring, which cycles asset class → country → sector → broker. |
| 14–18 s | **Markets** | **Every asset.** 8 asset classes → **Every market.** **60+** markets · **50+** currencies | The allocation ring opens into a rotating dot globe. Exchanges light up and trade routes arc between them, while currency symbols orbit. *Every trade converted at its trade-date FX rate.* |
| 18–22 s | **Brokers** | **Auto-sync with 25+ brokers.** Read-only · nightly · CSV & AI-assisted import | The globe condenses into the hub. Ten broker accounts fly into a 3D orbit and transaction packets stream along their beams into the hub, which pulses. Ends on *All accounts synced ✓*. |
| 22–26 s | **Dividends** | **Never miss a dividend.** Projected annual income, yield on cost | Coins rain onto a tilted 3D income card in sixteenth notes, one per month, and fill the bars: paid Jan–Sep, projected Oct–Dec. A forecast line draws, then *Next payout* pops up. |
| 26–32 s | **Risk lab** | **See 1,000 possible futures.** → **Find your efficient frontier.** | The horizon slider runs from 1 to 10 years as 1,000 paths fan out and the 5th/50th/95th percentiles settle. The paths collapse into 1,600 random portfolios coloured by Sharpe ratio. The frontier, the max-Sharpe star and an arrow from *Your portfolio* follow, then Sharpe, beta, volatility, VaR, max drawdown and crash tests. |
| 32–36 s | **Montage** | **Benchmark anything. · Tax-ready reports. · AI-assisted import. · Replay real crashes.** | One feature per second, each landing on the downbeat with a push-pan: a portfolio vs SPY race, FIFO/LIFO/average-cost toggles, a CSV turning into clean transactions, a crash replay with max drawdown. |
| 36–42 s | **Finale** | Mark · **AllInvestView** · *All your investments, one clear view.* · **Start free — no credit card** · `www.kripto724.com/app` | Light converges and the six segments snap in on the sonic logo. The wordmark rises, the button springs in and shimmers, and the link types itself out. |

**Sound:** 120 BPM, so every cut falls on a bar line. The score is in A minor (Am–F–C–G) and resolves
to C major as the logo lands. The sonic logo is E5–G5–C6: its first two notes are teased under the
wordmark at 6 s and completed at 37 s. Over 300 effect cues come straight from the animation code
(`build/cues.json`), so every pop, tick and whoosh lands on the same frame as its motion and pans with
it. The cues include broker packets panned by their orbit position, coins pitched up month by month, a
tick for each year as the horizon slider moves, and keystrokes as the link types itself.

## Claims and sources

On-screen product claims are limited to what AllInvestView publishes or what independent reviews
confirm. Where sources disagreed, the video uses the conservative figure:

- *All your investments, one clear view.* / *One dashboard for every asset you own*: allinvestview.com headlines.
- Stocks, ETFs, bonds, options, crypto, real estate, mutual funds and cash; allocation by asset class,
  country, sector and broker; daily change, total return, CAGR, unrealised gains; benchmarks such as SPY or VOO.
- **25+ brokers** auto-sync, read-only, nightly. The help centre says 25+ and marketing pages say 30+,
  so the video uses 25+. CSV import and an AI assistant for importing transactions are also covered.
- **60+ markets**. The site also says 73 currencies while a guide says 50+, so the video uses **50+
  currencies**. Trade-date FX conversion and the asset vs currency return split come from the
  multi-currency guide.
- Dividend tracking, calendar, received payouts, projections and yield on cost.
- Monte Carlo with 1,000 simulated paths over 1–10 years and 5th–95th percentiles; Markowitz
  efficient frontier with the highest-Sharpe mix; Sharpe, beta, volatility, VaR, drawdown; four real
  crashes replayed.
- Cost basis FIFO / LIFO / average cost; tax reports on every plan, including Free.
- **Start free — no credit card**: there is a free plan, and the 14-day trial needs no card.

All numbers in the UI (portfolio value, returns, holdings, dividends, risk metrics) are **sample
data**. Small text says so while the product is on screen, and the end card adds *"Sample data shown
for illustration only. Not investment advice."* No performance promise is made.

Before publishing, **check the figures against the live allinvestview.com pages.** kripto724.com
could not be reached from the build environment, so the copy follows AllInvestView's own pages.

## Brand notes

- The six-colour ring with the rising line is a **motion motif drawn for this film**, not
  AllInvestView's official logo. To use the real logo, replace `drawMark()` in `src/core.js`. It is
  used in the reveal, the dashboard top bar, the broker hub and the end card.
- In a sans-serif, "AllInvestView" reads as "A‖‖nvest", so the wordmark draws the capital I with
  serifs (`wordmark()` in `src/core.js`).
- Palette: deep navy base; mint #2EF2A6 for gains and calls to action; cyan #38C8FF → blue #5B8CFF →
  violet #A77BFF for "View"; amber, pink and red only as accents for allocation, dividends and risk.
- Brokers appear as plain-text names, never logos. Real tickers (AAPL, VOO, BTC…) appear only as sample holdings.

## Rebuilding

```bash
./build.sh                         # → out/allinvestview_showreel_42s.mp4 + out/cover.jpg
```

Needs Node + Playwright (Chromium), Python 3 + numpy + scipy, and ffmpeg. To change the globe:
`pip install global-land-mask && python3 tools/make_globe.py`.

To preview, serve the folder over HTTP (`npx serve .`):

- `index.html?play`: real time, no motion blur (`?play=26` starts at 26 s).
- `index.html?t=12.4`: a single frame.

To render only some frames as stills: `ONLY=0,240,600 STILLS=1 NODE_PATH="$(npm root -g)" node render.cjs /tmp/frames`.

| File | Role |
|---|---|
| `src/core.js` | Constants, easing, text (letter animation, slot text, odometer), UI primitives, brand mark and wordmark. Also `plane3d()`, a perspective warp that maps a canvas texture through a triangle mesh for true 3D panels in a 2D canvas. |
| `src/bg.js` | Aurora background following a per-scene palette, dot grid, dust, vignette. |
| `src/s1_chaos.js` … `src/s9_finale.js` | One file per scene. Each exports `sceneN(g, t)` (a pure function of time) and `cuesN(cue)` (its sound cues). |
| `src/main.js` | Sequencing, camera shake, flashes, cue sheet, frame rendering. Each frame averages 6 sub-frames over a 180° shutter, and 14 during whip transitions, for real motion blur. |
| `render.cjs` | Renders frames to PNG in parallel with headless Chromium and writes the cue sheet. |
| `audio.py` | Synthesised score and effects, sidechain, reverb, ping-pong delay, limiter. |
| `build.sh` | End-to-end build: frames, audio, two-pass loudnorm, BT.709 x264, cover image. |
| `assets/globe.js` | Land dots generated by `tools/make_globe.py`. |
| `fonts/` | Inter / Inter Display (SIL OFL 1.1, see `fonts/LICENSE-Inter.txt`). |
