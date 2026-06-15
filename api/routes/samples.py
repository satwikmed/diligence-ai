"""Sample document download endpoints for demos."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

SAMPLE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "sample_docs"

router = APIRouter(prefix="/api/samples", tags=["samples"])

SAMPLE_META = [
    {"filename": "AAPL_10K_FY2024.pdf", "company": "Apple Inc.", "ticker": "AAPL", "type": "10-K"},
    {"filename": "MSFT_10K_FY2024.pdf", "company": "Microsoft Corporation", "ticker": "MSFT", "type": "10-K"},
    {"filename": "CRM_10K_FY2024.pdf", "company": "Salesforce, Inc.", "ticker": "CRM", "type": "10-K"},
]


@router.get("")
async def list_samples():
    files = []
    for meta in SAMPLE_META:
        path = SAMPLE_DIR / meta["filename"]
        files.append({
            **meta,
            "available": path.exists(),
            "size_kb": path.stat().st_size // 1024 if path.exists() else 0,
            "download_url": f"/api/samples/{meta['filename']}",
        })
    return {
        "description": "Real SEC EDGAR 10-K filings for live demos",
        "folder": str(SAMPLE_DIR),
        "files": files,
        "readme": "/api/samples/readme",
    }


@router.get("/readme")
async def samples_readme():
    readme = SAMPLE_DIR / "README.md"
    if not readme.exists():
        raise HTTPException(status_code=404, detail="README not found")
    return {"content": readme.read_text()}


@router.get("/{filename}")
async def download_sample(filename: str):
    if filename not in {m["filename"] for m in SAMPLE_META}:
        raise HTTPException(status_code=404, detail="Sample not found")
    path = SAMPLE_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not on disk. Run: python data/download_samples.py")
    return FileResponse(path, media_type="application/pdf", filename=filename)
