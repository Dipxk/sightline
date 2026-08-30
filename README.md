# Sightline

**Turn any prospect's website into a personalized multimodal agent proof-of-concept — in 60 seconds.**

Built as a GTM engineering experiment for [Eclatira](https://www.eclatira.com).

## The Problem

Eclatira's differentiation is live vision during calls. But prospects compare them to voice-only agents (Vapi, Bland, Retell). Every sales demo requires manual research: *What are their workflows? Where does "email us a photo" break the customer experience?*

## What Sightline Does

1. Paste a prospect URL
2. Scrapes public data (hours, services, contact flows)
3. Identifies vision-critical moments where voice-only agents fail
4. Runs a live side-by-side call simulation (voice-only vs multimodal)
5. Produces a shareable agent spec for sales follow-up

## Quick Start

**Terminal 1 — Backend**
```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### One-liner (from repo root)
```bash
npm run install:all
# then run both terminals above, or:
npm run dev:backend   # terminal 1
npm run dev:frontend  # terminal 2
```

### Docker

```bash
docker compose up --build
```

## Demo

Click **Hotel Bonaventure** or **Clinique Médicale** on the homepage for pre-built demo scenarios. Or paste any public website URL.

## Architecture

```
Frontend (Next.js)  →  REST + WebSocket  →  Backend (FastAPI)
                                                  ├── Playwright scraper
                                                  ├── Analysis pipeline
                                                  ├── Simulation orchestrator
                                                  └── SQLite persistence
```

## What's Real vs Simulated

| Real | Simulated |
|------|-----------|
| Website scraping | Eclatira agent runtime |
| Business fact extraction | CRM/booking API calls |
| Vision moment classification | Telephony |
| Integration inference | Production deployments |

## Tech Stack

- **Backend:** Python, FastAPI, Asyncio, WebSockets, SQLAlchemy, httpx, BeautifulSoup
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Storage:** SQLite (artifacts + share links)

## Built By

Dipak — GTM Engineering experiment for Eclatira Fall 2026.

Not affiliated with Eclatira. Demonstrates the pre-sales infrastructure I'd build on day one.
