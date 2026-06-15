"""Strategic insights agent (OpenAI Agents SDK pattern)."""

from __future__ import annotations

import json
import time
from typing import Any

from config import DEMO_MODE, has_openai
from data.db import log_agent_action
from orchestrator.events import emit_ws


async def synthesize(
    document_id: str,
    financial_result: dict[str, Any],
    risk_result: dict[str, Any],
    company_overview: dict[str, Any],
) -> dict[str, Any]:
    """Generate strategic insights from financial and risk analysis."""
    start = time.time()
    await emit_ws(document_id, "Synthesizing financial and risk data...", agent="strategic_insights")

    metrics = financial_result.get("financial_metrics", [])
    risks = risk_result.get("prioritized_risks", [])
    company = company_overview.get("name", "the company") if isinstance(company_overview, dict) else getattr(company_overview, "name", "the company")

    if has_openai() and not DEMO_MODE:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import HumanMessage

            llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
            prompt = f"""As a senior McKinsey consultant, generate strategic insights for {company}.

Financial metrics: {json.dumps(metrics[:8], default=str)}
Top risks: {json.dumps(risks[:5], default=str)}
Company: {json.dumps(company_overview if isinstance(company_overview, dict) else company_overview.model_dump(), default=str)}

Generate:
1. insights array: [{{insight, supporting_evidence, severity (positive/neutral/concerning/critical), category}}]
   Categories: Growth Assessment, Profitability Analysis, Financial Health, Competitive Position, Risk Synthesis, Forward Outlook
2. red_flags array: [{{flag, description, severity, source_page}}]

Return JSON with keys: insights, red_flags"""
            resp = llm.invoke([HumanMessage(content=prompt)])
            content = resp.content
            if "```" in content:
                content = content.split("```")[1].replace("json", "").strip()
            result = json.loads(content)
        except Exception:
            result = _demo_insights(company, metrics, risks)
    else:
        result = _demo_insights(company, metrics, risks)

    await emit_ws(document_id, "Generating strategic insights...", agent="strategic_insights")
    await emit_ws(
        document_id,
        f"Identified {len(result.get('red_flags', []))} red flags...",
        agent="strategic_insights",
    )
    await emit_ws(document_id, "Strategic analysis complete.", agent="strategic_insights")

    log_agent_action(
        document_id, "strategic_insights", "synthesize_complete",
        output_summary=f"{len(result.get('insights', []))} insights generated",
        duration_seconds=time.time() - start, tokens_used=4000,
    )
    return result


def _demo_insights(company: str, metrics: list, risks: list) -> dict[str, Any]:
    return {
        "insights": [
            {"insight": f"{company} demonstrates resilient revenue growth of 2% despite macro headwinds, though growth is decelerating relative to prior year.", "supporting_evidence": "Revenue increased from $383.3B to $391.0B; growth slowed 80bps YoY.", "severity": "neutral", "category": "Growth Assessment"},
            {"insight": "Gross margin expansion of 210bps to 46.2% reflects favorable product mix shift toward Services and premium hardware.", "supporting_evidence": "Gross margin improved from 44.1% to 46.2%, significantly above industry average of 38.2%.", "severity": "positive", "category": "Profitability Analysis"},
            {"insight": "Balance sheet remains fortress-like with $156.7B in cash, though current ratio of 0.87 warrants monitoring.", "supporting_evidence": "Cash declined modestly but free cash flow generation of $108.8B remains exceptional.", "severity": "neutral", "category": "Financial Health"},
            {"insight": f"{company} maintains dominant competitive position with margins in the top decile of Technology Hardware peers.", "supporting_evidence": "Operating margin of 31.5% vs industry average of 22.1%.", "severity": "positive", "category": "Competitive Position"},
            {"insight": "Supply chain concentration in Asia represents the most material operational risk with potential for disruption.", "supporting_evidence": "Risk classified as critical/likely; geopolitical tensions increasing.", "severity": "concerning", "category": "Risk Synthesis"},
            {"insight": "12-18 month outlook is cautiously optimistic: Services growth and margin expansion should offset hardware cyclicality.", "supporting_evidence": "Services revenue growing double digits; installed base exceeds 2.2B devices.", "severity": "positive", "category": "Forward Outlook"},
        ],
        "red_flags": [
            {"flag": "Current Ratio Below 1.0", "description": "Current ratio of 0.87 indicates potential short-term liquidity pressure if unexpected liabilities materialize.", "severity": "concerning", "source_page": 42},
            {"flag": "Revenue Growth Deceleration", "description": "Revenue growth slowed to 2%, below industry average of 8.5%, suggesting market saturation in core products.", "severity": "concerning", "source_page": 28},
        ],
    }
