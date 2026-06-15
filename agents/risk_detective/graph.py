"""Risk analysis graph (LangGraph-style state machine)."""

from __future__ import annotations

import time
from typing import Any

from agents.risk_detective.nodes import (
    classify_severity,
    cross_reference_news,
    deep_dive_critical,
    extract_risk_sections,
    parse_individual_risks,
    prioritize,
)
from data.db import get_document, log_agent_action
from orchestrator.events import emit_ws


async def investigate(document_id: str) -> dict[str, Any]:
    """Run the risk analysis pipeline."""
    start = time.time()
    doc = get_document(document_id) or {}

    state: dict[str, Any] = {
        "document_id": document_id,
        "company_name": doc.get("company_name", "Unknown"),
        "risk_sections": [],
        "extracted_risks": [],
        "classified_risks": [],
        "news_cross_reference": [],
        "prioritized_risks": [],
        "reasoning_log": [],
        "deep_dive_risks": [],
    }

    await emit_ws(document_id, "Extracting risk factors...", agent="risk_detective")
    state = extract_risk_sections(state)

    state = parse_individual_risks(state)
    count = len(state["extracted_risks"])
    await emit_ws(document_id, f"Identified {count} individual risks...", agent="risk_detective")

    await emit_ws(document_id, "Classifying severity...", agent="risk_detective")
    state = classify_severity(state)

    if any(r.get("severity") == "critical" for r in state["classified_risks"]):
        state = deep_dive_critical(state)

    await emit_ws(document_id, "Cross-referencing with recent news...", agent="risk_detective")
    state = cross_reference_news(state)

    state = prioritize(state)
    critical = state.get("critical_count", 0)
    await emit_ws(document_id, f"Risk analysis complete. {critical} critical risks found.", agent="risk_detective")

    elapsed = time.time() - start
    log_agent_action(
        document_id, "risk_detective", "investigate_complete",
        output_summary=state.get("risk_narrative", "")[:500],
        duration_seconds=elapsed, tokens_used=3200,
    )

    return {
        "prioritized_risks": state["prioritized_risks"],
        "risk_narrative": state.get("risk_narrative", ""),
        "reasoning_log": state["reasoning_log"],
        "news_cross_reference": state["news_cross_reference"],
    }
