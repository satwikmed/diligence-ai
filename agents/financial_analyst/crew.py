"""Financial analysis crew (CrewAI-style sequential execution)."""

from __future__ import annotations

import time
from typing import Any, Optional

from agents.financial_analyst.benchmark_agent import run_benchmark_analysis
from agents.financial_analyst.numbers_agent import extract_metrics_from_chunks
from data.db import get_document, log_agent_action
from orchestrator.events import emit_ws


async def analyze(document_id: str, industry: Optional[str] = None) -> dict[str, Any]:
    """Run Numbers Agent then Benchmark Agent sequentially."""
    start = time.time()
    doc = get_document(document_id) or {}
    ind = industry or doc.get("company_name", "Technology")

    await emit_ws(document_id, "Extracting revenue data...", agent="financial_analyst")
    log_agent_action(document_id, "financial_analyst", "numbers_agent_start", status="started")

    numbers_result = extract_metrics_from_chunks(document_id)
    metrics = numbers_result.get("metrics", [])

    await emit_ws(document_id, "Calculating margins...", agent="financial_analyst")
    log_agent_action(
        document_id, "financial_analyst", "numbers_agent_complete",
        output_summary=f"Extracted {len(metrics)} metrics", duration_seconds=time.time() - start,
    )

    await emit_ws(document_id, "Comparing against industry benchmarks...", agent="financial_analyst")
    benchmark_result = run_benchmark_analysis(metrics, ind if isinstance(ind, str) else "Technology")

    elapsed = time.time() - start
    await emit_ws(document_id, "Financial analysis complete.", agent="financial_analyst")
    log_agent_action(
        document_id, "financial_analyst", "benchmark_complete",
        output_summary=f"{len(benchmark_result['financial_metrics'])} metrics benchmarked",
        duration_seconds=elapsed, tokens_used=2500,
    )

    return benchmark_result
