"""In-memory vector store fallback when Pinecone is unavailable."""

from __future__ import annotations

import hashlib
import math
from typing import Any, Optional


class InMemoryVectorStore:
    """Simple cosine-similarity vector store keyed by document namespace."""

    _stores: dict[str, list[dict[str, Any]]] = {}

    @classmethod
    def upsert(cls, namespace: str, vectors: list[dict[str, Any]]) -> None:
        if namespace not in cls._stores:
            cls._stores[namespace] = []
        cls._stores[namespace].extend(vectors)

    @classmethod
    def search(
        cls,
        namespace: str,
        query_embedding: list[float],
        top_k: int = 5,
        section_filter: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        items = cls._stores.get(namespace, [])
        if section_filter:
            items = [i for i in items if i.get("metadata", {}).get("section_name") == section_filter]

        scored = []
        for item in items:
            emb = item.get("values", [])
            if not emb:
                continue
            score = _cosine_similarity(query_embedding, emb)
            scored.append({**item, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    @classmethod
    def get_section(cls, namespace: str, section_name: str) -> list[dict[str, Any]]:
        return [
            i for i in cls._stores.get(namespace, [])
            if i.get("metadata", {}).get("section_name") == section_name
        ]

    @classmethod
    def list_sections(cls, namespace: str) -> list[str]:
        sections = set()
        for item in cls._stores.get(namespace, []):
            name = item.get("metadata", {}).get("section_name")
            if name:
                sections.add(name)
        return sorted(sections)

    @classmethod
    def clear_namespace(cls, namespace: str) -> None:
        cls._stores.pop(namespace, None)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b) or not a:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def pseudo_embedding(text: str, dim: int = 1536) -> list[float]:
    """Deterministic pseudo-embedding for demo mode without OpenAI."""
    h = hashlib.sha256(text.encode()).digest()
    vec = []
    for i in range(dim):
        byte_val = h[i % len(h)]
        vec.append((byte_val / 255.0) * 2 - 1)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]
