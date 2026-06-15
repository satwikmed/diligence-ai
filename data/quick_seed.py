"""Fast demo seed — inserts pre-built reports without running the full pipeline."""

from __future__ import annotations

from data.db import create_document, get_connection, init_db, save_analysis, save_qa_interaction, update_document

# Stable IDs so frontend demo data can match if needed
DEMO_DOCS = [
    {
        "id": "aapl-demo-0001-0000-0000-000000000001",
        "filename": "AAPL_10K_FY2024.pdf",
        "company_name": "Apple Inc.",
        "document_type": "10-K",
        "filing_year": 2024,
        "data_quality_score": 92.0,
        "revenue": "$391.0B",
        "revenue_growth": "+2.0%",
        "gross_margin": "46.2%",
        "industry": "Technology Hardware",
        "hq": "Cupertino, California",
    },
    {
        "id": "msft-demo-0002-0000-0000-000000000002",
        "filename": "MSFT_10K_FY2024.pdf",
        "company_name": "Microsoft Corporation",
        "document_type": "10-K",
        "filing_year": 2024,
        "data_quality_score": 94.0,
        "revenue": "$245.1B",
        "revenue_growth": "+15.7%",
        "gross_margin": "69.8%",
        "industry": "Software",
        "hq": "Redmond, Washington",
    },
    {
        "id": "crm-demo-0003-0000-0000-000000000003",
        "filename": "CRM_10K_FY2024.pdf",
        "company_name": "Salesforce, Inc.",
        "document_type": "10-K",
        "filing_year": 2024,
        "data_quality_score": 88.0,
        "revenue": "$34.9B",
        "revenue_growth": "+11.2%",
        "gross_margin": "75.4%",
        "industry": "Enterprise Software",
        "hq": "San Francisco, California",
    },
]


def _report(company: dict) -> dict:
    name = company["company_name"]
    return {
        "executive_summary": (
            f"{name} presents a mixed but generally favorable investment profile based on this 10-K analysis. "
            f"Revenue of {company['revenue']} with {company['revenue_growth']} YoY growth reflects solid market positioning. "
            f"Key risks include competitive pressure and regulatory exposure, balanced by strong margins and cash generation."
        ),
        "company_overview": {
            "name": name,
            "industry": company["industry"],
            "headquarters": company["hq"],
            "ticker": company["filename"].split("_")[0],
            "employees": "150,000+",
            "description": f"{name} is a leading company in {company['industry']}.",
        },
        "financial_analysis": [
            {"metric_name": "revenue", "current_value": company["revenue"], "prior_year_value": "—", "yoy_change": company["revenue_growth"], "assessment": "strong", "industry_average": "—"},
            {"metric_name": "gross_margin", "current_value": company["gross_margin"], "prior_year_value": "—", "yoy_change": "—", "assessment": "strong", "industry_average": "45%"},
            {"metric_name": "operating_margin", "current_value": "30.1%", "prior_year_value": "28.5%", "yoy_change": "+1.6%", "assessment": "adequate", "industry_average": "22%"},
            {"metric_name": "free_cash_flow", "current_value": "$108.8B", "prior_year_value": "$99.6B", "yoy_change": "+9.2%", "assessment": "strong", "industry_average": "—"},
        ],
        "risk_assessment": [
            {"risk_name": "Competitive Pressure", "description": "Intensifying competition in core markets.", "severity": "medium", "likelihood": "likely", "category": "market", "source_section": "Risk Factors"},
            {"risk_name": "Regulatory Scrutiny", "description": "Increasing antitrust and privacy regulation globally.", "severity": "high", "likelihood": "possible", "category": "regulatory", "source_section": "Risk Factors"},
            {"risk_name": "Supply Chain", "description": "Concentration risk in key suppliers and geographies.", "severity": "medium", "likelihood": "possible", "category": "operational", "source_section": "Risk Factors"},
        ],
        "strategic_insights": [
            {"insight": f"{name} maintains strong competitive moats through ecosystem lock-in and brand loyalty.", "category": "competitive", "severity": "positive", "supporting_evidence": "Business Overview"},
            {"insight": "Services revenue growth outpaces hardware, improving margin mix.", "category": "operational", "severity": "positive", "supporting_evidence": "MD&A"},
        ],
        "recommendations": [
            {"priority": "high", "action": "Monitor regulatory developments in EU and US markets.", "rationale": "Material impact on business model possible."},
            {"priority": "medium", "action": "Track services attach rate as key growth indicator.", "rationale": "Higher-margin recurring revenue driver."},
        ],
        "red_flags": [
            {"flag": "Revenue growth decelerating vs prior year", "severity": "medium", "source_page": 32},
        ],
        "industry_benchmarks": [],
        "data_quality_score": company["data_quality_score"],
    }


def seed_if_empty() -> int:
    """Seed demo companies if the database has no documents. Returns count seeded."""
    init_db()
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) AS n FROM documents").fetchone()
        if row and row["n"] > 0:
            return 0

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
