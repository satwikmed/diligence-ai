"""MCP server for document database operations."""

from __future__ import annotations

import json
import sys
from typing import Any

from data.pinecone_setup import search_chunks
from data.vector_store import InMemoryVectorStore


def search_chunks_tool(document_id: str, query: str, section_filter: str = "", top_k: int = 5) -> str:
    results = search_chunks(
        namespace=document_id,
        query=query,
        section_filter=section_filter or None,
        top_k=top_k,
    )
    return json.dumps(results, default=str)


def get_section_tool(document_id: str, section_name: str) -> str:
    chunks = InMemoryVectorStore.get_section(document_id, section_name)
    if not chunks:
        from data.pinecone_setup import search_chunks as sc
        results = sc(document_id, section_name, section_filter=section_name, top_k=50)
        return json.dumps(results, default=str)
    return json.dumps([
        {"id": c.get("id"), "metadata": c.get("metadata", {}), "text": c.get("metadata", {}).get("text", "")}
        for c in chunks
    ], default=str)


def get_financial_tables_tool(document_id: str) -> str:
    tables = InMemoryVectorStore.get_section(document_id, "Financial Statements")
    financial = [c for c in tables if c.get("metadata", {}).get("section_type") == "financial_table"]
    return json.dumps([
        {"section": c.get("metadata", {}).get("section_name"), "text": c.get("metadata", {}).get("text", "")}
        for c in financial
    ], default=str)


def list_sections_tool(document_id: str) -> str:
    sections = InMemoryVectorStore.list_sections(document_id)
    return json.dumps(sections)


def run_stdio_server() -> None:
    """Minimal MCP-style stdio server for document operations."""
    tools = {
        "search_chunks": search_chunks_tool,
        "get_section": get_section_tool,
        "get_financial_tables": get_financial_tables_tool,
        "list_sections": list_sections_tool,
    }

    for line in sys.stdin:
        try:
            req = json.loads(line.strip())
            tool_name = req.get("tool")
            args = req.get("args", {})
            if tool_name in tools:
                result = tools[tool_name](**args)
                print(json.dumps({"result": result}), flush=True)
            else:
                print(json.dumps({"error": f"Unknown tool: {tool_name}"}), flush=True)
        except Exception as e:
            print(json.dumps({"error": str(e)}), flush=True)


if __name__ == "__main__":
    run_stdio_server()
