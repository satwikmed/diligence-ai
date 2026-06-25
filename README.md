# Diligence AI: Autonomous Due Diligence for Equity Research

**Live demo:** https://diligence-ai-nine.vercel.app

> **Important:** `diligence-ai.vercel.app` is a different app (not this project). Use the link above.

**Upload a 10-K. Six AI agents analyze it. Get a research-grade report with citations in minutes.**

Built for finance and equity research workflows: what takes a junior analyst days on a new name, Diligence AI surfaces in one session — with filing delta, earnings-vs-10-K cross-checks, and ER memo export.

## What's New (Finance / ER Extensions)

| Feature | What it does |
|---------|----------------|
| **QoQ Filing Delta** | Diffs Risk Factors and MD&A/strategic sections between two filings with cited adds/removes |
| **Earnings vs 10-K Contradictions** | Side-by-side quotes when call tone diverges from Risk Factors / MD&A |
| **ER Memo Export (PDF)** | One-page investment memo (thesis, metrics, risks, actions) via ReportLab |
| **Case study** | [docs/case-studies/AAPL.md](docs/case-studies/AAPL.md) — walkthrough for interview demos |

## Architecture

```
┌─────────────────┐     A2A      ┌──────────────────┐
│ Document        │─────────────▶│ Financial Analyst │──┐
│ Processor       │              │ (CrewAI)          │  │
│ (LangChain)     │              └──────────────────┘  │
└────────┬────────┘                                     │  A2A
         │                                               ▼
         │ A2A                              ┌──────────────────────┐
         │                                  │ Strategic Insights   │
         ▼                                  │ (OpenAI Agents SDK)  │
┌─────────────────┐                         └──────────┬───────────┘
│ Risk Detective  │────────────────────────────────────┘
│ (LangGraph)     │                                    │
└─────────────────┘                                    ▼
                                            ┌──────────────────────┐
                                            │ Report Generator     │
                                            │ (Pydantic AI)        │
                                            └──────────┬───────────┘
                                                       │
         ┌─────────────────────────────────────────────┘
         ▼
┌─────────────────┐     MCP Tools    ┌──────────────────┐
│ Q&A Agent       │◀────────────────▶│ Pinecone / SQLite │
│ (RAG + RAGAS)   │                  │ Document Store    │
└─────────────────┘                  └──────────────────┘
```

## Tech Stack

| Component | Framework | Role |
|-----------|-----------|------|
| Document Processor | LangChain + Unstructured | PDF parsing, chunking, embedding |
| Financial Analyst | CrewAI | Metric extraction + industry benchmarking |
| Risk Detective | LangGraph | Multi-step risk analysis with news cross-ref |
| Strategic Insights | OpenAI Agents SDK | Consultant-grade synthesis |
| Report Generator | Pydantic AI | Typed consulting report output |
| Q&A Agent | LangChain + RAGAS | Grounded follow-up questions |
| Filing Delta | Python difflib | QoQ risk/MD&A diff with citations |
| Contradiction Scan | Rule + keyword engine | Earnings call vs 10-K mismatch flags |
| Memo Export | ReportLab | ER-format PDF download |
| Inter-agent comms | A2A Protocol | HTTP-based message transport |
| Tool access | MCP Servers | Document, analysis, and benchmark tools |
| Backend | FastAPI + WebSocket | REST API + real-time progress |
| Frontend | Next.js + Tailwind | Dark-themed analysis dashboard |
| Vector DB | Pinecone (or in-memory fallback) | Per-document namespace search |
| Database | SQLite | Documents, analyses, logs, Q&A |

## Quick Start

### 1. Clone and configure

```bash
cd diligence-ai
cp .env.example .env
# Edit .env with your API keys (optional — demo mode works without keys)
```

### 2. Install backend (use slim requirements — fast)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

This installs in **1–2 minutes**. Do **not** run the old full stack blindly — `crewai`, `unstructured[pdf]`, and `pydantic-ai` together can make pip spin for 30+ minutes on an M1 Mac.

Optional heavy frameworks (only if you need them):

```bash
pip install -r requirements-full.txt   # slow, 2GB+ download
```

### 3. Seed demo data

```bash
python data/seed.py
```

This creates 3 pre-analyzed companies (Apple, Microsoft, Salesforce) with **stable IDs** matching the live Vercel demo. It also downloads real 10-K PDFs from SEC EDGAR into `data/sample_docs/`.

## Sample 10-K files (for ER / banking interviews)

**No need to bring your own files.** The repo ships with real public filings:

| File | Company | Use case |
|------|---------|----------|
| `data/sample_docs/AAPL_10K_FY2024.pdf` | Apple Inc. | Large-cap, clean filing everyone knows |
| `data/sample_docs/MSFT_10K_FY2024.pdf` | Microsoft Corporation | Large-cap cloud / software |
| `data/sample_docs/CRM_10K_FY2024.pdf` | Salesforce, Inc. | Mid-cap SaaS variety |

Full demo guide: [`data/sample_docs/README.md`](data/sample_docs/README.md)

### Recommended demo flow (interview-ready)

1. **History** (`/history`) — open pre-analyzed Apple report instantly
2. **Filing Delta** — on the analysis page, compare Apple vs Salesforce QoQ-style diffs
3. **Contradictions** — show earnings call vs 10-K regulatory tone mismatch (Apple demo)
4. **Q&A** — ask: *"What are the top 3 things I should worry about if I am investing?"*
5. **Compare** (`/compare`) — Apple vs Salesforce side-by-side
6. **Live upload** (local/backend) — drag `MSFT_10K_FY2024.pdf` onto Upload
7. **ER Memo** — export PDF when backend is running

Case study write-up: [`docs/case-studies/AAPL.md`](docs/case-studies/AAPL.md)

### 4. Start backend

```bash
uvicorn api.main:app --reload --port 8000
```

### 5. Start frontend

```bash
cd frontend
cp .env.local.example .env.local   # enables local uploads + WebSocket + PDF export
npm install
npm run dev
```

Open **http://localhost:3000**

## Demo Mode vs Live Backend

| Mode | When | Upload | PDF memo | Data source |
|------|------|--------|----------|-------------|
| **Vercel demo** | No `NEXT_PUBLIC_API_URL` | Disabled (by design) | Stub alert | Built-in demo JSON |
| **Local full stack** | `.env.local` → `localhost:8000` | Enabled | ReportLab PDF | SQLite + agent pipeline |
| **Production** | Vercel env → Render/Railway URL | Enabled | ReportLab PDF | Deployed backend |

Set `DEMO_MODE=true` in backend `.env` (default when no OpenAI key). The platform runs with heuristic extraction, pre-built risk registers, pseudo-embeddings, and demo insights. Add `OPENAI_API_KEY` for full GPT-4o-powered analysis.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF, start analysis |
| GET | `/api/analysis/{id}/status` | Processing progress |
| GET | `/api/analysis/{id}` | Full report JSON |
| POST | `/api/analysis/{id}/ask` | Q&A follow-up |
| GET | `/api/analysis/{id}/filing-delta?compare_id=` | QoQ filing diff |
| GET | `/api/analysis/{id}/contradictions` | Earnings vs 10-K scan |
| GET | `/api/analysis/{id}/memo` | ER memo PDF download |
| GET | `/api/history` | All analyses |
| GET | `/api/compare?doc1=&doc2=` | Side-by-side comparison |
| GET | `/api/agent-logs/{id}` | Agent action logs |
| WS | `/ws/{id}` | Real-time progress stream |

## Agent Pipeline Flow

1. **Document Processor** — Parse PDF → chunk by section → embed to Pinecone
2. **Financial Analyst + Risk Detective** — Run **in parallel** via `asyncio.gather`
3. **Strategic Insights** — Synthesize financial + risk data
4. **Report Generator** — Compile consulting-grade report
5. **Q&A Agent** — Available after report completion

## RAGAS Evaluation

Every Q&A response is scored on faithfulness, answer relevancy, and context precision. Scores are stored in `qa_interactions` and displayed in the chat UI.

## Docker

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000 (set `NEXT_PUBLIC_API_URL=http://localhost:8000` — now works for uploads)

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel (`frontend/` directory) |
| Backend | Railway or Render |
| Vector DB | Pinecone free tier |
| Database | SQLite (or migrate to PostgreSQL for production) |

Set environment variables on your hosting platform matching `.env.example`.

## Tests

```bash
pytest tests/ -v
```

19+ unit tests covering chunking, financial parsing, risk classification, filing delta, contradiction detection, memo PDF, A2A messages, Pydantic validation, and RAGAS scoring.

## Project Structure

See the full tree in the project root. Key directories:
- `agents/` — Six specialized AI agents + filing delta, contradiction, memo modules
- `docs/case-studies/` — Interview-ready walkthroughs
- `protocols/a2a/` — Inter-agent communication
- `protocols/mcp/` — MCP tool servers
- `orchestrator/` — Pipeline orchestration
- `api/` — FastAPI backend
- `frontend/` — Next.js dashboard
- `data/sample_docs/` — **Real SEC 10-K PDFs for demos**

## License

MIT
