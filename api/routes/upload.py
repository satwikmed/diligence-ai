"""Document upload endpoint."""

from __future__ import annotations

import asyncio
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, File, HTTPException, UploadFile

from config import UPLOAD_DIR
from data.db import create_document, get_document
from orchestrator.pipeline import run_analysis

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    document_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{document_id}.pdf"

    async with aiofiles.open(save_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    create_document(file.filename, document_id=document_id)

    async def run_pipeline() -> None:
        try:
            await run_analysis(document_id, str(save_path))
        except Exception as e:
            print(f"Pipeline error for {document_id}: {e}")

    asyncio.create_task(run_pipeline())

    return {"document_id": document_id, "status": "processing", "filename": file.filename}
