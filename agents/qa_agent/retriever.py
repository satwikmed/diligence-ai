"""Pinecone retrieval logic for Q&A agent."""

from __future__ import annotations

from typing import Any

from data.pinecone_setup import embed_query, search_chunks


def retrieve_context(document_id: str, question: str, top_k: int = 5) -> list[dict[str, Any]]:
    return search_chunks(document_id, question, top_k=top_k)
