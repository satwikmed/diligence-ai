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
| `api/`, `agents/` | FastAPI backend → deploy separately on Render/Railway when ready |

## Verify after deploy

Open https://diligence-ai-nine.vercel.app and check:

- Home hero says **"Equity research"** / **"Due Diligence for ER"**
- Apple analysis page has **Export ER Memo**, **Filing Delta**, **Contradictions**
- `/api/analysis/aapl-demo-0001-0000-0000-000000000001/memo` returns a PDF (not 404)

## Local build

```bash
cd frontend
npm install
npm run build
```
