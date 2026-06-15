# Diligence AI: Autonomous Due Diligence Platform

**Upload a 10-K. Six AI agents analyze it. Get a consulting-grade report in minutes.**

What takes a junior consultant two weeks, Diligence AI does in two minutes.

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

This creates 3 pre-analyzed companies (Apple, Microsoft, Salesforce) so the demo is alive on first visit. It also downloads real 10-K PDFs from SEC EDGAR into `data/sample_docs/`.

## Sample 10-K files (for Deloitte / KPMG / EY demos)

**No need to bring your own files.** The repo ships with real public filings:

| File | Company | Use case |
|------|---------|----------|
| `data/sample_docs/AAPL_10K_FY2024.pdf` | Apple Inc. | Large-cap, clean filing everyone knows |
| `data/sample_docs/MSFT_10K_FY2024.pdf` | Microsoft Corporation | Large-cap cloud / software |
| `data/sample_docs/CRM_10K_FY2024.pdf` | Salesforce, Inc. | Mid-cap SaaS variety |

Full demo guide: [`data/sample_docs/README.md`](data/sample_docs/README.md)

### Download fresh copies from SEC

```bash
python data/download_samples.py
python data/download_samples.py --force   # replace existing
```

### Download via API (when backend is running)

```bash
curl -O http://localhost:8000/api/samples/AAPL_10K_FY2024.pdf
curl http://localhost:8000/api/samples          # list all samples
```

### Recommended demo flow

1. **History** (`/history`) — show pre-analyzed Apple report instantly
2. **Live upload** — drag `MSFT_10K_FY2024.pdf` from `data/sample_docs/` onto the home page
3. **Compare** (`/compare`) — Apple vs Salesforce side-by-side
4. **Q&A** — ask: *"What are the top 3 things I should worry about if I am investing?"*

### 4. Start backend

```bash
uvicorn api.main:app --reload --port 8000
```

### 5. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

## Demo Mode

Set `DEMO_MODE=true` in `.env` (default when no OpenAI key is set). The platform runs with:
- Heuristic financial extraction
- Pre-built risk registers
- Pseudo-embeddings (in-memory vector store)
- Demo strategic insights and reports

Add your `OPENAI_API_KEY` for full GPT-4o-powered analysis.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF, start analysis |
| GET | `/api/analysis/{id}/status` | Processing progress |
| GET | `/api/analysis/{id}` | Full report JSON |
| POST | `/api/analysis/{id}/ask` | Q&A follow-up |
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

Every Q&A response is scored on:
- **Faithfulness** — Is the answer supported by retrieved context?
- **Answer Relevancy** — Does it address the question?
- **Context Precision** — Were the right chunks retrieved?

Scores are stored in `qa_interactions` and displayed in the chat UI.

## Docker

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

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

15+ unit tests covering chunking, financial parsing, risk classification, A2A messages, Pydantic validation, and RAGAS scoring.

## Project Structure

See the full tree in the project root. Key directories:
- `agents/` — Six specialized AI agents
- `protocols/a2a/` — Inter-agent communication
- `protocols/mcp/` — MCP tool servers
- `orchestrator/` — Pipeline orchestration
- `api/` — FastAPI backend
- `frontend/` — Next.js dashboard
- `data/sample_docs/` — **Real SEC 10-K PDFs for demos** (see README inside)

## License

MIT
