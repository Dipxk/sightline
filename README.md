# Sightline

Map where voice agents fail on a prospect's actual call workflows — then replay the same moment with and without live vision.

**Repo:** https://github.com/Dipxk/sightline

## What it does

1. Paste a prospect URL
2. Pulls public context from their site (hours, vertical, ops signals)
3. Maps workflows that need camera input mid-call
4. Replays each moment: voice-only vs voice + vision
5. Outputs a shareable brief (integrations, moments, replay link)

## Run locally

```bash
# API
cd backend && pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000

# UI
cd frontend && npm install && npm run dev
```

Open http://localhost:3000 — try `hotelbonaventure.com` from the examples line.

## Deploy

See [DEPLOY.md](./DEPLOY.md).

## Stack

FastAPI · WebSockets · Next.js · SQLite
