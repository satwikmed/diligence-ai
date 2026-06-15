"""Dashboard and history endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from data.db import delete_document, get_agent_logs, get_analysis, list_documents

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/history")
async def history(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
    docs = list_documents(limit=limit, offset=offset)
    items = []
    for doc in docs:
        summary = (doc.get("executive_summary") or "")[:200]
        items.append({
            "document_id": doc["id"],
            "filename": doc["filename"],
            "company_name": doc.get("company_name"),
            "document_type": doc.get("document_type"),
            "filing_year": doc.get("filing_year"),
            "processing_status": doc.get("processing_status"),
            "data_quality_score": doc.get("data_quality_score"),
            "upload_timestamp": doc.get("upload_timestamp"),
            "summary_preview": summary,
        })
    return {"items": items, "total": len(items)}


@router.delete("/history/{document_id}")
async def delete_analysis(document_id: str):
    if not delete_document(document_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"deleted": True, "document_id": document_id}


@router.get("/agent-logs/{document_id}")
async def agent_logs(document_id: str, agent_name: str = Query(None)):
    logs = get_agent_logs(document_id, agent_name)
    return {"logs": logs}


@router.get("/dashboard/metrics")
async def dashboard_metrics():
    docs = list_documents(limit=100)
    completed = [d for d in docs if d.get("processing_status") == "complete"]
    scores = [d.get("data_quality_score") for d in completed if d.get("data_quality_score")]
    return {
        "total_analyses": len(docs),
        "completed_analyses": len(completed),
        "average_data_quality": round(sum(scores) / len(scores), 1) if scores else 0,
        "companies": [d.get("company_name") for d in completed if d.get("company_name")],
    }
