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

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https://github.com/satwikmed/diligence-ai)

1. Click **Deploy to Render** above and connect GitHub → approve the `render.yaml` blueprint.
2. Wait for first deploy (~5–8 min). Copy the service URL (e.g. `https://diligence-ai-api.onrender.com`).
3. Verify: `curl https://YOUR-SERVICE.onrender.com/health` → `{"status":"healthy","service":"diligence-ai"}`
4. On **Vercel** → Environment Variables → add `NEXT_PUBLIC_API_URL` = Render URL (no trailing slash).
5. **Redeploy** Vercel. Upload and WebSocket pipeline then work on the live site.

Optional GitHub auto-deploy: add repo secrets `RENDER_API_KEY` + `RENDER_SERVICE_ID` (see `.github/workflows/render-deploy.yml`).

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
