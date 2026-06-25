"""Fast demo seed — inserts pre-built reports without running the full pipeline."""

from __future__ import annotations

from data.db import create_document, get_connection, init_db, save_analysis, save_qa_interaction, update_document

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

_TICKER_PROFILES = {
    "AAPL": {
        "summary": "Apple Inc. remains a high-quality compounder with ecosystem economics; EU DMA / App Store regulation and China demand are key swing factors.",
        "risks": [
            {"risk_name": "App Store & DMA Regulation", "description": "EU Digital Markets Act may force alternative distribution and reduce take rates.", "severity": "high", "likelihood": "likely", "category": "regulatory", "source_section": "Risk Factors"},
            {"risk_name": "Greater China Demand", "description": "Revenue concentration in China exposes results to geopolitical tension.", "severity": "high", "likelihood": "possible", "category": "market", "source_section": "Risk Factors"},
        ],
        "fcf": ("$108.8B", "$99.6B", "+9.2%"),
        "op_margin": ("30.1%", "28.5%", "+1.6%"),
    },
    "MSFT": {
        "summary": "Microsoft is a leading enterprise AI beneficiary; AI capex step-up and cloud competition are the main diligence debates.",
        "risks": [
            {"risk_name": "AI Infrastructure Capex", "description": "Datacenter build-out may pressure near-term free cash flow if utilization lags.", "severity": "medium", "likelihood": "likely", "category": "financial", "source_section": "Risk Factors"},
            {"risk_name": "Cloud Competition", "description": "AWS and Google Cloud competing aggressively on AI workloads.", "severity": "high", "likelihood": "likely", "category": "market", "source_section": "Risk Factors"},
        ],
        "fcf": ("$74.1B", "$65.1B", "+13.8%"),
        "op_margin": ("44.6%", "42.0%", "+2.6%"),
    },
    "CRM": {
        "summary": "Salesforce leads enterprise CRM; deal elongation and AI seat economics are key investor focus areas.",
        "risks": [
            {"risk_name": "Enterprise Deal Elongation", "description": "Macro uncertainty may extend sales cycles and increase discounting.", "severity": "high", "likelihood": "likely", "category": "market", "source_section": "Risk Factors"},
            {"risk_name": "Competition from Microsoft", "description": "Dynamics 365 bundling creates pricing pressure.", "severity": "high", "likelihood": "likely", "category": "market", "source_section": "Risk Factors"},
        ],
        "fcf": ("$9.8B", "$7.9B", "+24.1%"),
        "op_margin": ("22.4%", "18.1%", "+4.3%"),
    },
}


def _report(company: dict) -> dict:
    name = company["company_name"]
    ticker = company["filename"].split("_")[0]
    profile = _TICKER_PROFILES.get(ticker, _TICKER_PROFILES["AAPL"])
    fcf = profile["fcf"]
    op = profile["op_margin"]
    return {
        "executive_summary": profile["summary"],
        "company_overview": {
            "name": name,
            "industry": company["industry"],
            "headquarters": company["hq"],
            "ticker": ticker,
            "employees": "150,000+",
            "description": f"{name} is a leading company in {company['industry']}.",
        },
        "financial_analysis": [
            {"metric_name": "revenue", "current_value": company["revenue"], "prior_year_value": "—", "yoy_change": company["revenue_growth"], "assessment": "strong", "industry_average": "—"},
            {"metric_name": "gross_margin", "current_value": company["gross_margin"], "prior_year_value": "—", "yoy_change": "—", "assessment": "strong", "industry_average": "45%"},
            {"metric_name": "operating_margin", "current_value": op[0], "prior_year_value": op[1], "yoy_change": op[2], "assessment": "adequate", "industry_average": "22%"},
            {"metric_name": "free_cash_flow", "current_value": fcf[0], "prior_year_value": fcf[1], "yoy_change": fcf[2], "assessment": "strong", "industry_average": "—"},
        ],
        "risk_assessment": profile["risks"],
        "strategic_insights": [
            {"insight": f"{name} maintains competitive positioning in {company['industry']}.", "category": "competitive", "severity": "positive", "supporting_evidence": "MD&A"},
        ],
        "recommendations": [
            {"priority": "high", "action": "Monitor key risk themes each earnings cycle.", "rationale": "Regulatory and competitive dynamics drive estimate revisions."},
        ],
        "red_flags": [{"flag": "Review MD&A for guidance language vs model assumptions", "severity": "medium", "source_page": 28}],
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
