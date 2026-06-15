"""FastAPI application entry point."""

from __future__ import annotations

import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from api.routes import analysis, compare, dashboard, qa, reports, samples, upload
from api.websocket import websocket_endpoint
from data.db import init_db
from data.pinecone_setup import init_pinecone_index
from fastapi import WebSocket
from protocols.a2a.registry import init_default_registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    init_pinecone_index()
    init_default_registry()
    yield


app = FastAPI(
    title="Diligence AI",
    description="Autonomous Due Diligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(samples.router)
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(qa.router)
app.include_router(compare.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "diligence-ai"}


@app.websocket("/ws/{document_id}")
async def ws(document_id: str, websocket: WebSocket):
    await websocket_endpoint(websocket, document_id)
