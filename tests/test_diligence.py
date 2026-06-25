"""Unit tests for Diligence AI."""

from __future__ import annotations

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from agents.document_processor.processor import chunk_section, identify_sections
from agents.document_processor.schemas import SectionType
from agents.financial_analyst.tools import assess_metric, calculate_yoy_change, parse_financial_number
from agents.qa_agent.evaluator import evaluate_ragas
from agents.report_generator.models import CompanyOverview, DueDiligenceReport, FinancialMetric
from agents.risk_detective.risk_models import combined_score, sort_risks
from protocols.a2a.models import A2AMessage, AgentCard
from protocols.a2a.transport import A2ATransport


class TestDocumentChunking:
    def test_chunk_by_section(self):
        doc_id = str(uuid.uuid4())
        text = "Paragraph one about business.\n\nParagraph two about revenue.\n\nParagraph three about growth."
        chunks = chunk_section(doc_id, "Business Overview", text, SectionType.NARRATIVE)
        assert len(chunks) >= 1
        assert chunks[0].section_name == "Business Overview"
        assert chunks[0].document_id == doc_id

    def test_identify_sections(self):
        text = """
        BUSINESS OVERVIEW
        We are a tech company.

        RISK FACTORS
        Competition is intense.

        FINANCIAL STATEMENTS
        Revenue was $100 million.
        """
        sections = identify_sections(text)
        assert len(sections) >= 2
        names = [s[0] for s in sections]
        assert any("Risk" in n or "BUSINESS" in n.upper() for n in names)


class TestFinancialMetrics:
    def test_yoy_change(self):
        assert calculate_yoy_change(110, 100) == "+10.0%"
        assert calculate_yoy_change(90, 100) == "-10.0%"

    def test_parse_financial_number(self):
        assert parse_financial_number("$391,035 million") == 391035.0

    def test_assess_metric_margin_compression(self):
        assert assess_metric("gross_margin", "-3.0%", "40%") == "concerning"
        assert assess_metric("gross_margin", "+2.5%", "45%") == "strong"


class TestRiskClassification:
    def test_combined_score(self):
        assert combined_score("critical", "almost_certain") > combined_score("low", "unlikely")

    def test_sort_risks(self):
        risks = [
            {"risk_name": "A", "severity": "low", "likelihood": "unlikely"},
            {"risk_name": "B", "severity": "critical", "likelihood": "likely"},
        ]
        sorted_risks = sort_risks(risks)
        assert sorted_risks[0]["risk_name"] == "B"


class TestA2AMessages:
    def test_message_format(self):
        msg = A2AMessage(
            from_agent="financial_analyst",
            to_agent="strategic_insights",
            action="send_metrics",
            payload={"revenue": "$391B"},
        )
        assert msg.from_agent == "financial_analyst"
        assert msg.message_id
        data = msg.model_dump_json_safe()
        assert "timestamp" in data

    def test_agent_card(self):
        card = AgentCard(
            name="document_processor",
            description="Parse PDFs",
            capabilities=["parse"],
            endpoint="http://localhost:8001/a2a",
        )
        assert card.name == "document_processor"

    def test_transport_format_message(self):
        msg = A2ATransport.format_message("a", "b", "test", {"key": "val"})
        assert msg.action == "test"


class TestPydanticModels:
    def test_financial_metric_validation(self):
        m = FinancialMetric(
            metric_name="revenue",
            current_value="$391B",
            prior_year_value="$383B",
            yoy_change="+2%",
            assessment="adequate",
        )
        assert m.metric_name == "revenue"

    def test_due_diligence_report(self):
        report = DueDiligenceReport(
            executive_summary="Test summary",
            company_overview=CompanyOverview(
                name="Test Co", industry="Tech", headquarters="SF", description="A test company."
            ),
            data_quality_score=85.0,
        )
        assert report.data_quality_score == 85.0


class TestRAGASScores:
    def test_heuristic_ragas(self):
        scores = evaluate_ragas(
            "What is revenue?",
            "Revenue was $391 billion according to the filing.",
            ["Revenue for fiscal 2024 was $391.0 billion, an increase of 2%."],
        )
        assert "faithfulness" in scores
        assert 0 <= scores["faithfulness"] <= 1
        assert 0 <= scores["answer_relevancy"] <= 1
        assert 0 <= scores["context_precision"] <= 1

    def test_ragas_empty_context(self):
        scores = evaluate_ragas("What is revenue?", "I don't know.", [])
        assert scores["faithfulness"] <= 0.9


class TestDatabase:
    def test_create_and_get_document(self, tmp_path, monkeypatch):
        import data.db as db_mod
        monkeypatch.setattr(db_mod, "DB_PATH", tmp_path / "test.db")
        db_mod.init_db()
        doc_id = db_mod.create_document("test.pdf")
        doc = db_mod.get_document(doc_id)
        assert doc is not None
        assert doc["filename"] == "test.pdf"


class TestBenchmarkAgent:
    def test_benchmark_enrichment(self):
        from agents.financial_analyst.benchmark_agent import run_benchmark_analysis

        metrics = [{"metric_name": "revenue_growth", "current_value": "11%", "prior_year_value": "9%", "yoy_change": "+2%", "assessment": "strong"}]
        result = run_benchmark_analysis(metrics, "Technology")
        assert len(result["financial_metrics"]) == 1
        assert result["financial_metrics"][0].get("industry_average") is not None


class TestFilingDelta:
    def test_compute_filing_delta(self):
        from agents.filing_delta.differ import compute_filing_delta

        prior = {
            "risk_assessment": [{"risk_name": "Old Risk", "description": "Prior risk.", "source_section": "Risk Factors"}],
            "strategic_insights": [{"insight": "Old insight", "supporting_evidence": "MD&A"}],
        }
        current = {
            "risk_assessment": [
                {"risk_name": "New Risk", "description": "New risk.", "source_section": "Risk Factors"},
                {"risk_name": "Old Risk", "description": "Prior risk.", "source_section": "Risk Factors"},
            ],
            "strategic_insights": [
                {"insight": "New insight", "supporting_evidence": "MD&A"},
                {"insight": "Old insight", "supporting_evidence": "MD&A"},
            ],
        }
        delta = compute_filing_delta(prior, current)
        assert delta["overall_change_score"] >= 0
        assert len(delta["sections"]) == 2
        assert any(s["section"] == "Risk Factors" for s in delta["sections"])


class TestContradictionDetector:
    def test_detect_aapl_regulatory_contradiction(self):
        from agents.contradiction.detector import detect_contradictions

        report = {
            "risk_assessment": [
                {"risk_name": "Regulatory Scrutiny", "description": "Increasing antitrust regulation.", "source_section": "Risk Factors"},
            ],
            "red_flags": [],
            "strategic_insights": [],
        }
        result = detect_contradictions(report, "AAPL")
        assert result["ticker"] == "AAPL"
        assert len(result["contradictions"]) >= 1


class TestMemoGenerator:
    def test_generate_memo_pdf(self):
        from agents.memo_generator.generator import generate_investment_memo_pdf

        report = {
            "executive_summary": "Test summary for memo export.",
            "company_overview": {"ticker": "TEST", "name": "Test Co"},
            "financial_analysis": [{"metric_name": "revenue", "current_value": "$1B", "yoy_change": "+5%", "assessment": "strong"}],
            "risk_assessment": [{"risk_name": "Test Risk", "description": "Desc", "severity": "medium", "source_section": "Risk Factors"}],
            "recommendations": [{"priority": "high", "action": "Monitor", "rationale": "Because"}],
            "data_quality_score": 90,
        }
        pdf = generate_investment_memo_pdf(report, "Test Co")
        assert pdf[:4] == b"%PDF"


class TestResearchFilingSections:
    def test_paragraph_splitting(self):
        from data.filing_sections import _paragraphs

        text = "First risk paragraph about competition and market share. " * 3
        text += "Second risk paragraph about regulation and antitrust scrutiny. " * 3
        paras = _paragraphs(text, min_len=40)
        assert len(paras) >= 1

    def test_extract_sections_fallback_keywords(self):
        from data.filing_sections import extract_sections_from_pdf
        import tempfile
        from reportlab.pdfgen import canvas

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            path = Path(tmp.name)
        c = canvas.Canvas(str(path))
        c.drawString(50, 750, "RISK FACTORS Competition is intense and antitrust scrutiny is increasing globally.")
        c.drawString(50, 730, "MANAGEMENT DISCUSSION Revenue grew but macro uncertainty may slow demand.")
        c.save()

        result = extract_sections_from_pdf(path)
        path.unlink()
        assert "risk" in result["risk_factors"].lower() or result["risk_paragraphs"]


class TestTextFilingDelta:
    def test_compute_text_filing_delta(self):
        from agents.filing_delta.text_differ import compute_text_filing_delta

        prior = {
            "risk_paragraphs": ["Old regulatory risk paragraph about compliance."],
            "mda_paragraphs": ["Prior year revenue discussion."],
        }
        current = {
            "risk_paragraphs": [
                "Old regulatory risk paragraph about compliance.",
                "New AI infrastructure capex risk paragraph.",
            ],
            "mda_paragraphs": ["Current year revenue discussion with AI investments."],
        }
        delta = compute_text_filing_delta(prior, current)
        assert delta["source"] == "sec_filing_text"
        assert delta["overall_change_score"] >= 0
        assert len(delta["sections"]) == 2

    def test_noise_paragraph_filtered(self):
        from agents.filing_delta.text_differ import _is_noise_paragraph

        assert _is_noise_paragraph("Item 1A. Risk Factors 5 Item 1B.")
        assert not _is_noise_paragraph(
            "Antitrust and regulatory investigations may materially affect our business and operating results "
            "in multiple jurisdictions including the EU, US, and Greater China regions worldwide."
        )


class TestResearchContradictions:
    def test_detect_from_filing_text(self):
        from agents.contradiction.research import detect_contradictions_from_filing_text

        sections = {
            "risk_factors": "Antitrust and regulatory investigations may materially affect our business.",
            "mda": "Macro uncertainty and elongated sales cycles remain a concern.",
        }
        result = detect_contradictions_from_filing_text(sections, "AAPL")
        assert result["source"] == "transcript_vs_filing_text"
        assert len(result["contradictions"]) >= 1
