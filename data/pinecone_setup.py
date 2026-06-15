"""Pinecone index initialization and helpers."""

from __future__ import annotations

import logging
from typing import Any, Optional

from config import PINECONE_API_KEY, PINECONE_INDEX_NAME, has_openai, has_pinecone
from data.vector_store import InMemoryVectorStore, pseudo_embedding

logger = logging.getLogger(__name__)

_pinecone_index = None


def get_embeddings(texts: list[str]) -> list[list[float]]:
    if has_openai():
        try:
            from langchain_openai import OpenAIEmbeddings

            embedder = OpenAIEmbeddings(model="text-embedding-3-small")
            return embedder.embed_documents(texts)
        except Exception as e:
            logger.warning("OpenAI embeddings failed, using pseudo: %s", e)
    return [pseudo_embedding(t) for t in texts]


def embed_query(text: str) -> list[float]:
    if has_openai():
        try:
            from langchain_openai import OpenAIEmbeddings

            embedder = OpenAIEmbeddings(model="text-embedding-3-small")
            return embedder.embed_query(text)
        except Exception:
            pass
    return pseudo_embedding(text)


def init_pinecone_index() -> None:
    global _pinecone_index
    if not has_pinecone():
        logger.info("Pinecone not configured; using in-memory vector store")
        return
    try:
        from pinecone import Pinecone, ServerlessSpec

        pc = Pinecone(api_key=PINECONE_API_KEY)
        existing = [idx.name for idx in pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing:
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
        _pinecone_index = pc.Index(PINECONE_INDEX_NAME)
        logger.info("Pinecone index '%s' ready", PINECONE_INDEX_NAME)
    except Exception as e:
        logger.warning("Pinecone init failed: %s", e)
        _pinecone_index = None


def upsert_vectors(namespace: str, chunks: list[dict[str, Any]]) -> int:
    texts = [c["text"] for c in chunks]
    embeddings = get_embeddings(texts)

    vectors = []
    for chunk, emb in zip(chunks, embeddings):
        vectors.append({
            "id": chunk["id"],
            "values": emb,
            "metadata": {
                **chunk.get("metadata", {}),
                "text": chunk["text"][:1000],
            },
        })

    if _pinecone_index is not None:
        _pinecone_index.upsert(vectors=vectors, namespace=namespace)
    else:
        InMemoryVectorStore.upsert(namespace, vectors)

    return len(vectors)


def search_chunks(
    namespace: str,
    query: str,
    section_filter: Optional[str] = None,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    query_emb = embed_query(query)

    if _pinecone_index is not None:
        filter_dict = {}
        if section_filter:
            filter_dict["section_name"] = section_filter
        results = _pinecone_index.query(
            vector=query_emb,
            top_k=top_k,
            namespace=namespace,
            include_metadata=True,
            filter=filter_dict if filter_dict else None,
        )
        return [
            {
                "id": m.id,
                "score": m.score,
                "metadata": dict(m.metadata) if m.metadata else {},
                "text": (m.metadata or {}).get("text", ""),
            }
            for m in results.matches
        ]

    results = InMemoryVectorStore.search(namespace, query_emb, top_k, section_filter)
    return [
        {
            "id": r.get("id", ""),
            "score": r.get("score", 0),
            "metadata": r.get("metadata", {}),
            "text": r.get("metadata", {}).get("text", ""),
        }
        for r in results
    ]
