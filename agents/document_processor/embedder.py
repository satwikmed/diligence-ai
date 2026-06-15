"""Embedding pipeline to Pinecone."""

from __future__ import annotations

from agents.document_processor.schemas import DocumentChunk
from data.pinecone_setup import upsert_vectors


def embed_and_index(document_id: str, chunks: list[DocumentChunk]) -> int:
    """Embed chunks and upsert to Pinecone namespace."""
    vector_data = [
        {
            "id": chunk.id,
            "text": chunk.text,
            "metadata": chunk.to_vector_metadata(),
        }
        for chunk in chunks
    ]
    return upsert_vectors(document_id, vector_data)
