# Apple Inc. (AAPL) — Diligence AI Case Study

**Prepared for:** Equity research interview portfolio  
**Filing analyzed:** FY2024 Form 10-K  
**Tool:** [Diligence AI](https://diligence-ai-nine.vercel.app)

## Setup

1. Open **History** → select **Apple Inc.**
2. Scroll to **Filing Delta** — compare vs Microsoft or Salesforce to see QoQ-style risk/MD&A diffs with citations
3. Open **Earnings Call vs 10-K Contradictions** — demo flags regulatory language mismatch
4. Ask in Q&A: *"What are the top 3 risks if I'm investing?"*
5. With backend running locally, click **Export ER Memo (PDF)** for a one-page research memo

## Investment question

*Is Apple's services mix shift enough to offset hardware deceleration and rising regulatory risk?*

## What the 10-K shows (via Diligence AI)

| Signal | Finding | Source |
|--------|---------|--------|
| Revenue | $391.0B (+2.0% YoY) — growth deceleration vs prior cycles | Financial Analysis |
| Margins | Gross margin 46.2% — strong vs ~45% industry proxy | Financial Analysis |
| Cash | FCF $108.8B (+9.2% YoY) — balance sheet flexibility | Financial Analysis |
| Risk | Regulatory scrutiny flagged **high** severity | Risk Factors |
| Red flag | Revenue growth decelerating vs prior year | p.32 |

## Contradiction highlight (demo)

**Earnings call:** CEO characterized regulatory headwinds as "minimal" with App Store model "largely unchanged."

**10-K Risk Factors:** Flags increasing antitrust and privacy regulation globally as a material risk.

**Analyst takeaway:** Tone on the call is more optimistic than the legal disclosure — worth probing in the next callback on EU DMA / DOJ timelines.

## Filing delta (demo)

Comparing Apple vs Salesforce demo filings surfaces net-new risk language and MD&A insight changes — useful for QoQ workflows even when prior-year PDF isn't uploaded (production version diffs consecutive filings for the same issuer).

## Limitations (say this in interviews)

- Demo mode uses heuristic extraction; production uses full agent pipeline with OpenAI
- Earnings call snippets are curated demo text — production would ingest transcript + 10-K
- Not investment advice; public SEC filings only

## Resume bullet

Built **Diligence AI**, a multi-agent 10-K analysis platform with QoQ filing delta, earnings-vs-filing contradiction detection, and ER memo export — turning a two-week analyst workflow into minutes with cited outputs.
