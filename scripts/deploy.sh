#!/usr/bin/env bash
set -e

echo "=== Sightline Deploy Setup ==="
echo ""
echo "Repo: https://github.com/Dipxk/sightline"
echo ""
echo "Step 1 — Backend (Render)"
echo "  → https://render.com/deploy?repo=https://github.com/Dipxk/sightline"
echo "  → After deploy, copy your service URL"
echo ""
echo "Step 2 — Frontend (Vercel)"
echo "  Run: cd frontend && npx vercel login && npx vercel --prod"
echo "  Or use: https://vercel.com/new/clone?repository-url=https://github.com/Dipxk/sightline"
echo "  Set root directory to: frontend"
echo ""
echo "Step 3 — Connect them"
echo "  Vercel env: NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL"
echo "  Vercel env: NEXT_PUBLIC_WS_URL=wss://YOUR-RENDER-URL"
echo "  Render env: CORS_ORIGINS=https://YOUR-VERCEL-URL"
echo ""
echo "Step 4 — Demo"
echo "  Open Vercel URL → Hotel Bonaventure → copy share link for Moad"
echo ""

if command -v vercel &>/dev/null || command -v npx &>/dev/null; then
  read -p "Deploy frontend to Vercel now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$(dirname "$0")/../frontend"
    npx vercel login
    npx vercel --prod
  fi
fi
