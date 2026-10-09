# Where every asset comes from

All visual assets are Supabase's own: they are the files that build
[supabase.com](https://supabase.com), taken from the public website source at
[`supabase/supabase@eeae602`](https://github.com/supabase/supabase/tree/eeae6027d5dc658932c6bd496a8c13e0277b7fdb)
(9 Oct 2026). `../fetch-assets.sh` downloads them again from that exact commit and
`../prep_assets.py` makes the copies in this folder (resizing only, no edits).

| Folder / file | Original path (in `apps/www/public/` unless noted) | Used in |
|---|---|---|
| `logo/supabase-logo-wordmark--dark.svg` | `brand-assets.zip` (official brand kit) | Logo build at 4 s and the end card. The bolt halves and the 8 letters are animated straight from the wordmark's own SVG paths. |
| `icons.json` | `packages/shared-data/products.ts` (24 px product icons) | Product tiles in the hook |
| `shots/table-editor.png` | `images/index/dashboard/supabase-table-editor.png` | Database scene |
| `shots/sql-editor.png` | `images/index/dashboard/supabase-sql-editor.png` | SQL Editor + AI Assistant scene |
| `product/auth.png` | `images/product/auth/header--dark.png` | Auth scene |
| `providers/*.svg` | `images/product/auth/*-icon.svg` | The 12 login providers in the auth scene |
| `product/storage.png` | `images/product/storage/header--dark.png` | Storage scene |
| `product/globe.png` | `images/launchweek/15/lw15-globe-dark.png` | Edge Functions scene |
| `realtime/*.svg` | `images/realtime/example-apps/dark/*.svg`, `images/index/products/realtime-user-cursor.svg` | Realtime scene (the cursors use the real cursor path, recoloured) |
| `product/vector-tools.png` | `images/product/vector/vector-tools-dark.png` | Vector scene |
| `features/*.jpg` | `images/features/*.png` (25 feature cards, 1600 px → 960 px) | Feature wall |
| `customers/*.png` | `images/customers/logos/on-dark/*.png` | "Trusted by" logo rows |
| `../fonts/SourceCodePro-Regular.woff2` | `fonts/source-code-pro/` (SIL OFL) | Mono labels, terminal |

Copy on screen is also Supabase's own wording from the same source: the tagline
"Build in a weekend / Scale to millions" and "The Postgres development platform"
(`apps/www/data/home/content.tsx`), the product descriptions (`data/MainProducts.tsx`,
`data/ProductModules.tsx`), the dashboard highlights such as "Full CRUD" and
"20+ Third-party Logins", and the stats "44,000,000+ databases created" and
"200,000+ databases launched daily" (`data/company-stats.ts`).

Headline fonts are Inter / Inter Display (SIL OFL, `../fonts/LICENSE-Inter.txt`).
Supabase, the Supabase logo and the customer logos are trademarks of their owners;
this film is an unofficial concept piece.
