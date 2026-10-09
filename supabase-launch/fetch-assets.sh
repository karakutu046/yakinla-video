#!/usr/bin/env bash
# Downloads every real Supabase asset used in the video from Supabase's public
# website source (github.com/supabase/supabase, pinned commit) into assets/src/,
# then prepares web-sized copies in assets/ with prep_assets.py.
# Only needed to refresh assets; the prepared files are committed.
set -euo pipefail
cd "$(dirname "$0")"
REV=eeae6027d5dc658932c6bd496a8c13e0277b7fdb
RAW="https://raw.githubusercontent.com/supabase/supabase/$REV"
WWW="apps/www/public"
I="$WWW/images"
FILES=(
  "$WWW/brand-assets.zip"
  "$I/index/dashboard/supabase-table-editor.png"
  "$I/index/dashboard/supabase-sql-editor.png"
  "$I/product/auth/header--dark.png"
  "$I/product/storage/header--dark.png"
  "$I/product/vector/vector-tools-dark.png"
  "$I/launchweek/15/lw15-globe-dark.png"
  "$I/index/products/realtime-user-cursor.svg"
  "$I/realtime/example-apps/dark/in-app-chat.svg"
  "$I/realtime/example-apps/dark/live-cursors.svg"
  "$I/realtime/example-apps/dark/live-avatars.svg"
  "$I/realtime/example-apps/dark/whiteboard.svg"
  "$I/realtime/example-apps/dark/multiplayer-game.svg"
  "$I/realtime/example-apps/dark/location.svg"
  "$WWW/fonts/source-code-pro/SourceCodePro-Regular.woff2"
  "packages/shared-data/products.ts"
  "apps/www/data/company-stats.ts"
)
for f in auth-captcha-protection auto-generated-graphql-api auto-generated-rest-api backups branching \
  custom-domains database-webhooks email-login file-storage logs-analytics management-api \
  network-restrictions phone-login policy-templates postgres-database postgres-extensions postgres-roles \
  reports-and-metrics s3-compatibility security-and-performance-advisor social-login sql-editor \
  ssl-enforcement terraform-provider visual-schema-designer; do FILES+=("$I/features/$f.png"); done
for f in google-icon github-icon-dark apple-icon discord-icon spotify-icon twitch-icon slack-icon \
  microsoft-icon gitlab-icon bitbucket-icon twitter-icon facebook-icon; do FILES+=("$I/product/auth/$f.svg"); done
for f in mozilla 1password pwc vercel netlify lovable resend mobbin mdn chatbase humata firecrawl \
  e2b brevo xendit meshy quivr; do FILES+=("$I/customers/logos/on-dark/$f.png"); done

mkdir -p assets/src
for p in "${FILES[@]}"; do
  out="assets/src/${p//\//__}"
  [ -s "$out" ] || curl -fsSL --retry 3 -o "$out" "$RAW/$p"
done
echo "${#FILES[@]} files in assets/src (supabase/supabase@${REV:0:7})"
python3 prep_assets.py
