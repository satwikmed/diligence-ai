"""Main orchestration pipeline for Diligence AI."""

from __future__ import annotations

import asyncio
import time
import traceback
from typing import Any

from agents.document_processor import process as document_processor_process
from agents.financial_analyst.crew import analyze as financial_analyst_analyze
from agents.qa_agent.agent import SUGGESTED_QUESTIONS
from agents.report_generator.agent import generate as report_generator_generate
from agents.risk_detective.graph import investigate as risk_detective_investigate
from agents.strategic_insights.agent import synthesize as strategic_insights_synthesize
from data.db import init_db, save_analysis, update_document
from orchestrator.events import emit_ws


async def run_analysis(document_id: str, file_path: str) -> dict[str, Any]:
    """Run the full six-agent due diligence pipeline."""
    init_db()
    start = time.time()

    try:
        await emit_ws(document_id, "Starting document processing...", agent="document_processor", progress=5)

        doc_result = await document_processor_process(file_path, document_id)
        await emit_ws(
            document_id,
            f"Document processed: {doc_result.total_chunks} chunks created",
            agent="document_processor",
            progress=20,
        )

        await emit_ws(document_id, "Starting financial analysis and risk detection in parallel...", progress=25)
        financial_task = asyncio.create_task(financial_analyst_analyze(document_id))
        risk_task = asyncio.create_task(risk_detective_investigate(document_id))

        financial_result, risk_result = await asyncio.gather(financial_task, risk_task)
        await emit_ws(document_id, "Financial analysis and risk detection complete", progress=60)

        overview = doc_result.company_overview.model_dump()
        await emit_ws(document_id, "Generating strategic insights...", agent="strategic_insights", progress=70)
        insights_result = await strategic_insights_synthesize(
            document_id, financial_result, risk_result, overview
        )
        await emit_ws(
            document_id,
            f"Generated {len(insights_result.get('insights', []))} insights and "
            f"{len(insights_result.get('red_flags', []))} red flags",
            agent="strategic_insights",
            progress=80,
        )

        await emit_ws(document_id, "Compiling final report...", agent="report_generator", progress=90)
        report = await report_generator_generate(
            document_id, doc_result, financial_result, risk_result, insights_result
        )

        report["analysis_metadata"]["processing_time"] = time.time() - start
        save_analysis(document_id, report)

        await emit_ws(document_id, "Due diligence report complete", agent="report_generator", progress=100, event_type="complete")
        update_document(document_id, processing_status="complete", processing_time_seconds=time.time() - start)

        return report

    except Exception as e:
        traceback.print_exc()
        update_document(document_id, processing_status="failed")
        await emit_ws(document_id, f"Analysis failed: {str(e)}", event_type="error")
        raise


def get_suggested_questions() -> list[str]:
    return SUGGESTED_QUESTIONS
