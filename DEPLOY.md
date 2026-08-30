# Deploy Sightline

## Option A — Vercel (frontend) + Render (backend) — recommended

### 1. Push to GitHub (already done if you ran the setup)

### 2. Deploy backend on Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` automatically
4. Set env var `CORS_ORIGINS` to your Vercel URL (e.g. `https://sightline.vercel.app`)
5. Copy the Render service URL (e.g. `https://sightline-api.onrender.com`)

### 3. Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Import Project** → select repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://sightline-api.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://sightline-api.onrender.com`
4. Deploy

### 4. Update Render CORS

Back in Render, set `CORS_ORIGINS` to your final Vercel URL and redeploy.

---

## Option B — Local demo (for interviews)

```bash
# Terminal 1
cd backend && pip install -r requirements.txt && python3 -m uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm install && npm run dev
```

Open http://localhost:3000 → click **Hotel Bonaventure**

---

## Demo script for Moad

1. Open live URL
2. Click **Hotel Bonaventure**
3. Watch analysis stream (~15s)
4. Compare voice-only (left) vs multimodal (right) simulation
5. Copy share link

**Note:** Render free tier sleeps after 15 min idle — first load may take ~30s to wake.
