# Vercel deploy (same project: diligence-ai-nine.vercel.app)

## Required setting (one time)

In [Vercel Dashboard](https://vercel.com) → your **diligence-ai** project → **Settings** → **General** → **Root Directory**:

```
frontend
```

Save, then **Redeploy** the latest `main` commit.

Without this, Vercel builds the repo root (Python backend only) and the live site stays on an old Next.js bundle.

## What deploys

| Path | Role |
|------|------|
| `frontend/` | Next.js app → **diligence-ai-nine.vercel.app** |
| `frontend/public/research/` | Pre-built SEC filing deltas, contradictions, Q&A chunks |
| `api/`, `agents/` | FastAPI backend → deploy on Render (see below) |

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | **Recommended** | Q&A over extracted filing chunks + report JSON |
| `NEXT_PUBLIC_API_URL` | No on Vercel demo | Set after Render backend is live |

Do **not** use `NEXT_PUBLIC_` for the OpenAI key — it must stay server-only.

## Verify after deploy

Open https://diligence-ai-nine.vercel.app and check:

- Home hero says **"Equity research"** / **"Due Diligence for ER"**
- Apple analysis page: **Filing Delta** badge says **SEC filing text · Item 1A / Item 7**
- **Contradictions** show extracted 10-K quotes (not only hand-written demo risks)
- `/api/analysis/aapl-demo-0001-0000-0000-000000000001/memo` returns a PDF (not 404)
- Q&A cites **Filing excerpt** sections when `OPENAI_API_KEY` is set

## Backend deploy (Render) — unlocks upload + full pipeline

1. Push repo to GitHub (already connected).
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect `satwikmed/diligence-ai`.
3. Render reads `render.yaml` and creates **diligence-ai-api** (Docker, free tier).
4. Add env vars on Render:
   - `OPENAI_API_KEY` (optional, for GPT analysis)
   - `DEMO_MODE=true` (default in render.yaml)
5. Copy the Render URL (e.g. `https://diligence-ai-api.onrender.com`).
6. On Vercel, set `NEXT_PUBLIC_API_URL` to that URL (no trailing slash). Redeploy frontend.
7. Verify: `curl https://YOUR-RENDER-URL/health` → `{"status":"ok"}`

Upload and WebSocket pipeline then work from the live site.

## Regenerate research JSON (after PDF updates)

```bash
python data/download_samples.py --prior
python data/seed_research.py
git add frontend/public/research/
git commit -m "Refresh research artifacts"
```

## Local build

```bash
cd frontend
npm install
npm run build
```
