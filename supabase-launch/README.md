# Supabase: 45 s launch film

A product launch video in the style of the motion-graphics launch videos SaaS companies post on X/Twitter,
made for [Supabase](https://supabase.com) as an unofficial concept piece.
16:9, 1920×1080, 60 fps, with sound.

**Output:** [`out/supabase_launch_45s.mp4`](out/supabase_launch_45s.mp4) (28 MB, H.264 High 1080p60 + AAC 256k, −14 LUFS) · cover [`out/cover.jpg`](out/cover.jpg)

Everything on screen that shows Supabase is Supabase's own material: the logo SVG from their brand kit,
real dashboard screenshots, product artwork, the 25 feature screens, login-provider and customer logos, and
the copy and numbers from their website. All of it was taken from the public source of supabase.com,
pinned to one commit (details in [`assets/SOURCES.md`](assets/SOURCES.md)).
The motion design, typography and transitions are built in code. The soundtrack and every sound effect are
synthesised, so there is no stock footage and no stock music.

## Storyboard

| Time | Scene | On screen | Motion and sound |
|---|---|---|---|
| 0–4 s | **Hook** | Database · Authentication · Storage · Edge Functions · Realtime · Vector → **Your entire backend, in one place.** | Six product tiles pop in on eighth notes. Each icon draws itself and each pop plays one note of an Am9 arpeggio. The tiles are then pulled into the centre. |
| 4–8 s | **Logo** | Supabase bolt → wordmark → **The Postgres development platform.** | The two halves of the bolt fly in and lock together on the downbeat (impact, shockwave rings, sparks). The letters rise one by one, then the camera dives through the green half of the bolt into the next scene. |
| 8–12 s | **Database** | **A full Postgres database.** Table Editor | The real Table Editor rises in 3D through a green iris. Callouts pop: Full CRUD, Easy as a spreadsheet, Foreign tables, Partitioned tables. A selection steps down the rows on the beat, then a whip pan cuts to the next scene. |
| 12–16 s | **SQL + AI** | **Write SQL. Or just ask.** SQL Editor with AI Assistant | The prompt types itself into the real screenshot and the assistant's answer streams in line by line. A cursor clicks Run and the results fill row by row (key clicks, ticks, click). |
| 16–20 s | **Auth** | **User auth, out of the box.** Sign-in screen | 12 real provider logos burst out on sixteenth notes and orbit the sign-in card. Each one plays a pentatonic note. |
| 20–28 s | **Montage** | Storage · Edge Functions · Realtime · Vector | One bar each. Cards slide up over each other. An upload runs to 100%. Arcs fly over the globe while `supabase functions deploy` types. Multiplayer cursors move. The AI integrations diagram follows. |
| 28–32 s | **Wall** | **And so much more.** | A tilted 3D wall of 25 real feature screens scrolls while feature names flip past. The wall speeds up into the drop. |
| 32–36 s | **Proof** | **44,000,000+** databases created · **200,000+** launched daily · customer logos | The counters roll up with ticks, then two rows of logos drift in opposite directions. |
| 36–40 s | **Tagline** | **Build in a weekend / Scale to millions** | Letter-by-letter blur-in on two big chords, with a light sweep across the green line. |
| 40–45 s | **End card** | Logo · Start your project · Documentation · supabase.com | The bolt locks again and the chord resolves to C major with a three-note sound logo. A cursor clicks *Start your project* (ripple), then fade out. |

**Sound:** 120 BPM in A minor. Every cut lands on a bar line (every 2 s). The 176 effect cues (pops, key clicks,
whooshes, impacts, ticks) are exported by `anim.js` from the same timeline that drives the picture, so each one
is frame-accurate and panned to where it happens on screen. The groove uses sidechain ducking and the master is
normalised to −14 LUFS / −1.5 dBTP.

**Motion blur:** every output frame is the average of 4 sub-frames across a 180° shutter, so fast moves
(whip pans, the logo halves, the wall) blur the way a camera would record them.

## Build

```bash
./build.sh                          # → out/supabase_launch_45s.mp4 + out/cover.jpg (~25 min on 4 cores)
SUB=1 PRESET=veryfast ./build.sh    # quick draft, no motion blur
./fetch-assets.sh                   # re-download the Supabase assets from the pinned commit (optional)
```

Requirements: Node + Playwright (Chromium), Python 3 with numpy, scipy and Pillow, and ffmpeg.

To preview, serve the folder (`npx serve .`) and open:

- `index.html?play` to play in real time (no motion blur).
- `index.html?t=12.4` to show a single frame.

To render stills: `STILLS=/tmp/stills AT=4.2,13.9 NODE_PATH="$(npm root -g)" node render.cjs`.

| File | Purpose |
|---|---|
| `anim.js` | The whole film. `renderAt(t)` sets every element for time `t`, which makes each frame a pure function of time. It also exports the sound cues. |
| `style.css` | Look and components (Supabase dark palette, windows, chips, tiles). |
| `render.cjs` | Headless Chromium renderer. It takes sub-frame screenshots in parallel and pipes them into ffmpeg (tmix motion blur, BT.709 x264). |
| `audio.py` | Music and sound-design synthesis, sidechain, reverb and mix. |
| `build.sh` | End-to-end build: master render, sound, two-pass loudnorm, delivery encode (CRF 19) and cover. |
| `fetch-assets.sh`, `prep_assets.py` | Download the real Supabase assets from the pinned commit and resize them. |
| `assets/` | The prepared assets and `SOURCES.md`. |
| `fonts/` | Inter / Inter Display and Source Code Pro (SIL OFL). |

Supabase, the Supabase logo and the customer logos belong to their owners. This is an unofficial concept
film, not affiliated with or endorsed by Supabase. Label it as a concept or spec piece if you post it.
