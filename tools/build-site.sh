#!/usr/bin/env bash
# Builds the GitHub Pages site into ./site:
#   /glam-with-jeni/            the Expo app (web build, demo data unless Supabase env vars are set)
#   /glam-with-jeni/prototype/  the clickable design prototype and logo directions
# Usage: bash tools/build-site.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/site"

rm -rf "$OUT"
node "$ROOT/tools/build-prototype.mjs"
(cd "$ROOT/app" && npx expo export --platform web --output-dir "$OUT")

# Single-page app: GitHub Pages serves 404.html for unknown paths, so deep links still load the app.
cp "$OUT/index.html" "$OUT/404.html"
# Let GitHub Pages serve the _expo/ folder (Jekyll would hide folders starting with "_").
touch "$OUT/.nojekyll"
cp -R "$ROOT/prototype" "$OUT/prototype"

echo "Site built in $OUT"
