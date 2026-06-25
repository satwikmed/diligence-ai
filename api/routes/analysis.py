"""Analysis status and results endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel

from agents.contradiction.detector import detect_contradictions
from agents.contradiction.research import detect_contradictions_from_filing_text
from agents.filing_delta.differ import compute_filing_delta
from agents.filing_delta.text_differ import compute_text_filing_delta
from data.filing_sections import extract_sections_from_pdf, extract_ticker_pair, filing_paths_for_ticker
from agents.memo_generator.generator import generate_investment_memo_pdf
from agents.qa_agent.agent import SUGGESTED_QUESTIONS, answer_question
from data.db import get_analysis, get_document
from orchestrator.events import get_progress_state

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class QuestionRequest(BaseModel):
    question: str


def _report_from_analysis(analysis: dict) -> dict:
    return {
        "executive_summary": analysis.get("executive_summary"),
        "company_overview": analysis.get("company_overview"),
        "financial_analysis": analysis.get("financial_metrics"),
        "risk_assessment": analysis.get("risk_assessment"),
        "strategic_insights": analysis.get("strategic_insights"),
        "recommendations": analysis.get("recommendations"),
        "red_flags": analysis.get("red_flags"),
        "industry_benchmarks": analysis.get("industry_benchmarks"),
        "data_quality_score": analysis.get("data_quality_score"),
    }


def _research_filing_delta(ticker: str) -> dict | None:
    pair = extract_ticker_pair(ticker)
    if not pair or not pair.get("prior"):
        return None
    return compute_text_filing_delta(
        pair["prior"],
        pair["current"],
        prior_label=f"Prior 10-K ({pair.get('prior_path', '').split('/')[-1]})",
        current_label=f"Current 10-K ({pair.get('current_path', '').split('/')[-1]})",
    )


def _research_contradictions(ticker: str) -> dict | None:
    current_path, _ = filing_paths_for_ticker(ticker)
    if not current_path:
        return None
    sections = extract_sections_from_pdf(current_path)
    if not sections.get("risk_factors") and not sections.get("mda"):
        return None
    return detect_contradictions_from_filing_text(sections, ticker)


def _ticker_from_doc(doc: dict) -> str:
    filename = doc.get("filename") or ""
    if "_" in filename:
        return filename.split("_")[0]
    doc_id = doc.get("id") or ""
    analysis = get_analysis(doc_id) if doc_id else None
    overview = (analysis or {}).get("company_overview") or {}
    if isinstance(overview, dict):
        return overview.get("ticker") or "UNK"
    return "UNK"


@router.get("/{document_id}/status")
async def analysis_status(document_id: str):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    progress = get_progress_state(document_id)
    processing_status = doc.get("processing_status", progress.get("status"))
    progress_pct = progress.get("progress_percentage", 0)
    if processing_status == "complete":
        progress_pct = 100

    return {
        "document_id": document_id,
        "status": processing_status,
        "current_agent": progress.get("current_agent"),
        "progress_percentage": progress_pct,
        "estimated_time_remaining": max(0, int((100 - progress.get("progress_percentage", 0)) * 1.2)),
        "last_message": progress.get("last_message", ""),
    }


@router.get("/{document_id}")
async def get_full_analysis(document_id: str):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    analysis = get_analysis(document_id)
    if not analysis:
        return {"document_id": document_id, "status": doc.get("processing_status"), "report": None}

    return {
        "document_id": document_id,
        "status": doc.get("processing_status"),
        "report": {
            "executive_summary": analysis.get("executive_summary"),
            "company_overview": analysis.get("company_overview"),
            "financial_analysis": analysis.get("financial_metrics"),
            "risk_assessment": analysis.get("risk_assessment"),
            "strategic_insights": analysis.get("strategic_insights"),
            "recommendations": analysis.get("recommendations"),
            "red_flags": analysis.get("red_flags"),
            "industry_benchmarks": analysis.get("industry_benchmarks"),
            "data_quality_score": analysis.get("data_quality_score"),
        },
        "metadata": {
            "processing_time_seconds": doc.get("processing_time_seconds"),
            "total_chunks": doc.get("total_chunks"),
            "total_pages": doc.get("total_pages"),
        },
    }


@router.get("/{document_id}/financials")
async def get_financials(document_id: str):
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"financial_metrics": analysis.get("financial_metrics", []), "industry_benchmarks": analysis.get("industry_benchmarks", [])}


@router.get("/{document_id}/risks")
async def get_risks(document_id: str):
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"risk_assessment": analysis.get("risk_assessment", [])}


@router.get("/{document_id}/insights")
async def get_insights(document_id: str):
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {
        "strategic_insights": analysis.get("strategic_insights", []),
        "red_flags": analysis.get("red_flags", []),
    }


@router.post("/{document_id}/ask")
async def ask_question(document_id: str, body: QuestionRequest):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.get("processing_status") != "complete":
        raise HTTPException(status_code=400, detail="Analysis not yet complete")

    result = await answer_question(document_id, body.question)
    return result


@router.get("/{document_id}/suggested-questions")
async def suggested_questions(document_id: str):
    return {"questions": SUGGESTED_QUESTIONS}


@router.get("/{document_id}/filing-delta")
async def filing_delta(document_id: str, compare_id: str = Query(...)):
    doc_current = get_document(document_id)
    if not doc_current:
        raise HTTPException(status_code=404, detail="Document not found")

    ticker = _ticker_from_doc(doc_current)
    delta = _research_filing_delta(ticker)
    if delta:
        return {
            "document_id": document_id,
            "compare_id": compare_id,
            **delta,
        }

    doc_prior = get_document(compare_id)
    if not doc_prior:
        raise HTTPException(status_code=404, detail="Prior document not found")

    analysis_current = get_analysis(document_id)
    analysis_prior = get_analysis(compare_id)
    if not analysis_current or not analysis_prior:
        raise HTTPException(status_code=404, detail="Analysis not complete for one or both documents")

    delta = compute_filing_delta(
        _report_from_analysis(analysis_prior),
        _report_from_analysis(analysis_current),
        prior_label=f"{doc_prior.get('company_name', 'Prior')} ({doc_prior.get('filing_year', '')})",
        current_label=f"{doc_current.get('company_name', 'Current')} ({doc_current.get('filing_year', '')})",
    )
    return {
        "document_id": document_id,
        "compare_id": compare_id,
        **delta,
    }


@router.get("/{document_id}/contradictions")
async def contradictions(document_id: str):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    ticker = _ticker_from_doc(doc)
    result = _research_contradictions(ticker)
    if not result or not result.get("contradictions"):
        report = _report_from_analysis(analysis)
        result = detect_contradictions(report, ticker)
    return {"document_id": document_id, **result}


@router.get("/{document_id}/memo")
async def export_memo(document_id: str):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = _report_from_analysis(analysis)
    company = doc.get("company_name") or "Company"
    pdf_bytes = generate_investment_memo_pdf(report, company)
    filename = f"{_ticker_from_doc(doc)}_investment_memo.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
