# Sample 10-K Filings for Demo

Ready-to-use PDF files for live demos with Big 4 and consulting teams. No need to hunt for filings before a presentation.

## Included files

| File | Company | Ticker | Source |
|------|---------|--------|--------|
| `AAPL_10K_FY2024.pdf` | Apple Inc. | AAPL | [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?CIK=0000320193&action=getcompany) |
| `MSFT_10K_FY2024.pdf` | Microsoft Corporation | MSFT | [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?CIK=0000789019&action=getcompany) |
| `CRM_10K_FY2024.pdf` | Salesforce, Inc. (mid-cap SaaS) | CRM | [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?CIK=0001108524&action=getcompany) |

These are **real public 10-K filings** downloaded from SEC EDGAR and converted to PDF for upload into Diligence AI.

## How to use in a demo

### Option A — Pre-analyzed (fastest, ~30 seconds)

1. Run `python data/seed.py` from the project root
2. Open **http://localhost:3000/history**
3. Click any company to show a full consulting-grade report immediately

### Option B — Live pipeline (best for wow factor, ~2 minutes)

1. Open **http://localhost:3000**
2. Drag one of the PDFs from this folder onto the upload zone
3. Watch the six-agent pipeline run in real time
4. Walk through the finished report

### Option C — Compare mode

1. Seed the database (Option A)
2. Open **http://localhost:3000/compare**
3. Select Apple vs Microsoft (or any two) for side-by-side due diligence

## Re-download fresh filings from SEC

```bash
cd diligence-ai
source venv/bin/activate
python data/download_samples.py
```

Add `--force` to replace existing files:

```bash
python data/download_samples.py --force
```

## Suggested demo script (for Deloitte / KPMG / EY audiences)

1. **History page** — "Three companies already analyzed. This is what your team gets in minutes, not weeks."
2. **Apple report** — Executive summary, financial metrics, risk matrix, red flags
3. **Q&A** — Ask: *"What are the top 3 things I should worry about if I am investing?"*
4. **Live upload** — Drop `MSFT_10K_FY2024.pdf`, show real-time agent pipeline
5. **Compare** — Apple vs Salesforce on margins and risk count

## File location

```
diligence-ai/data/sample_docs/
├── README.md                 ← you are here
├── AAPL_10K_FY2024.pdf
├── MSFT_10K_FY2024.pdf
└── CRM_10K_FY2024.pdf
```

All filings are public domain U.S. government data via SEC EDGAR.
