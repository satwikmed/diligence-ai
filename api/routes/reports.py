"""Report retrieval endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from data.db import get_analysis, get_document

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{document_id}")
async def get_report(document_id: str):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    analysis = get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"document": doc, "analysis": analysis}
