"""Q&A chat endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from data.db import list_qa_interactions

router = APIRouter(prefix="/api/qa", tags=["qa"])


@router.get("/{document_id}/history")
async def qa_history(document_id: str):
    interactions = list_qa_interactions(document_id)
    return {"interactions": interactions}
