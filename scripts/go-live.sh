#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/.bin"
CF="$BIN/cloudflared"
NODE_BIN="${NODE_BIN:-$HOME/.nvm/versions/node/v24.15.0/bin}"
export PATH="$NODE_BIN:$PATH"

mkdir -p "$BIN"

if [[ ! -x "$CF" ]]; then
  echo "Downloading cloudflared..."
  ARCH="$(uname -m)"
  if [[ "$ARCH" == "arm64" ]]; then
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
  else
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
  fi
  curl -fsSL "$URL" | tar -xz -C "$BIN"
  chmod +x "$CF"
fi

cleanup() {
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "${CF_BACK_PID:-}" ]] && kill "$CF_BACK_PID" 2>/dev/null || true
  [[ -n "${CF_FRONT_PID:-}" ]] && kill "$CF_FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend..."
cd "$ROOT/backend"
CORS_ORIGINS="*" python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
sleep 2

echo "Starting backend tunnel..."
"$CF" tunnel --url http://127.0.0.1:8000 > "$ROOT/.tunnel-backend.log" 2>&1 &
CF_BACK_PID=$!

for i in {1..30}; do
  BACKEND_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$ROOT/.tunnel-backend.log" | head -1 || true)
  [[ -n "$BACKEND_URL" ]] && break
  sleep 1
done

if [[ -z "$BACKEND_URL" ]]; then
  echo "Failed to get backend tunnel URL"
  cat "$ROOT/.tunnel-backend.log"
  exit 1
fi

WS_URL="${BACKEND_URL/https:\/\//wss://}"
echo "Backend: $BACKEND_URL"

echo "Starting frontend..."
cd "$ROOT/frontend"
NEXT_PUBLIC_API_URL="$BACKEND_URL" NEXT_PUBLIC_WS_URL="$WS_URL" npm run dev -- -p 3000 > "$ROOT/.tunnel-frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 4

echo "Starting frontend tunnel..."
"$CF" tunnel --url http://127.0.0.1:3000 > "$ROOT/.tunnel-frontend.log" 2>&1 &
CF_FRONT_PID=$!

for i in {1..30}; do
  FRONTEND_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$ROOT/.tunnel-frontend.log" | head -1 || true)
  [[ -n "$FRONTEND_URL" ]] && break
  sleep 1
done

if [[ -z "$FRONTEND_URL" ]]; then
  echo "Failed to get frontend tunnel URL"
  cat "$ROOT/.tunnel-frontend.log"
  exit 1
fi

echo ""
echo "=========================================="
echo "  LIVE URL: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "=========================================="
echo ""
echo "Demo: open LIVE URL → click hotelbonaventure.com"
echo "Press Ctrl+C to stop."
echo ""

wait
