"""Seed database with sample analyzed reports for demo."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from data.db import get_connection, init_db
from data.download_samples import download_all
from data.quick_seed import DEMO_DOCS, _report, seed_if_empty
from data.db import create_document, save_analysis, save_qa_interaction, update_document

SAMPLE_DIR = ROOT / "data" / "sample_docs"


def reset_and_seed() -> int:
    """Replace all documents with stable demo IDs matching the frontend."""
    init_db()
    with get_connection() as conn:
        conn.execute("DELETE FROM qa_interactions")
        conn.execute("DELETE FROM agent_logs")
        conn.execute("DELETE FROM analysis_results")
        conn.execute("DELETE FROM documents")
        conn.commit()

    count = 0
    for company in DEMO_DOCS:
        create_document(company["filename"], document_id=company["id"], document_type=company["document_type"])
        update_document(
            company["id"],
            company_name=company["company_name"],
            filing_year=company["filing_year"],
            processing_status="complete",
            total_pages=47,
            total_chunks=52,
        )
        save_analysis(company["id"], _report(company))
        save_qa_interaction(
            company["id"],
            "What is the company's biggest competitive advantage?",
            f"{company['company_name']} benefits from a strong ecosystem and brand loyalty that creates switching costs.",
            [{"chunk_id": "1", "section_name": "Business Overview", "page_number": 1, "relevance_score": 0.92, "excerpt": "ecosystem"}],
            {"faithfulness": 0.91, "answer_relevancy": 0.94, "context_precision": 0.88},
        )
        count += 1
    return count


def main() -> None:
    SAMPLE_DIR.mkdir(exist_ok=True)

    print("Step 1: Downloading real 10-K filings from SEC EDGAR...")
    download_all()

    print("\nStep 2: Seeding stable demo analyses (Apple, Microsoft, Salesforce)...")
    seeded = seed_if_empty()
    if seeded == 0:
        print("  Database already has documents — resetting to stable demo IDs...")
        seeded = reset_and_seed()

    print(f"\nDone! Seeded {seeded} companies with stable IDs matching the live demo.")
    print(f"\nSample PDFs for live demos: {SAMPLE_DIR}")
    for c in DEMO_DOCS:
        print(f"  - {c['filename']}  ({c['company_name']})")
    print("\nStart backend: uvicorn api.main:app --reload --port 8000")
    print("Start frontend: cd frontend && cp .env.local.example .env.local && npm run dev")


if __name__ == "__main__":
    main()
