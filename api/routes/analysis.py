"""Analysis status and results endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.qa_agent.agent import SUGGESTED_QUESTIONS, answer_question
from data.db import get_analysis, get_document
from orchestrator.events import get_progress_state

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class QuestionRequest(BaseModel):
    question: str


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
