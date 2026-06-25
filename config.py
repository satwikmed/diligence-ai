"""Application configuration from environment variables."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "diligence-ai")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///diligence.db")

_upload = os.getenv("UPLOAD_DIR", "").strip()
UPLOAD_DIR = Path(_upload) if _upload else ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEMO_MODE = not OPENAI_API_KEY or os.getenv("DEMO_MODE", "").lower() in ("1", "true", "yes")


def has_openai() -> bool:
    return bool(OPENAI_API_KEY)


def has_pinecone() -> bool:
    return bool(PINECONE_API_KEY)


def has_apify() -> bool:
    return bool(APIFY_API_TOKEN)
