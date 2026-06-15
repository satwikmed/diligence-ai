"""Company comparison endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from data.db import get_analysis, get_document

router = APIRouter(prefix="/api", tags=["compare"])


@router.get("/compare")
async def compare_companies(
    doc1: str = Query(...),
    doc2: str = Query(...),
):
    d1 = get_document(doc1)
    d2 = get_document(doc2)
    if not d1 or not d2:
        raise HTTPException(status_code=404, detail="One or both documents not found")

    a1 = get_analysis(doc1)
    a2 = get_analysis(doc2)
    if not a1 or not a2:
        raise HTTPException(status_code=404, detail="Analysis not complete for one or both documents")

    metrics1 = {m.get("metric_name"): m for m in a1.get("financial_metrics", []) if isinstance(m, dict)}
    metrics2 = {m.get("metric_name"): m for m in a2.get("financial_metrics", []) if isinstance(m, dict)}

    comparison = []
    all_metrics = set(metrics1.keys()) | set(metrics2.keys())
    for name in sorted(all_metrics):
        m1 = metrics1.get(name, {})
        m2 = metrics2.get(name, {})
        comparison.append({
            "metric": name,
            "company_1": {"name": d1.get("company_name"), "value": m1.get("current_value"), "assessment": m1.get("assessment")},
            "company_2": {"name": d2.get("company_name"), "value": m2.get("current_value"), "assessment": m2.get("assessment")},
            "stronger": _stronger(m1, m2),
        })

    return {
        "company_1": {"id": doc1, "name": d1.get("company_name"), "data_quality_score": a1.get("data_quality_score")},
        "company_2": {"id": doc2, "name": d2.get("company_name"), "data_quality_score": a2.get("data_quality_score")},
        "financial_comparison": comparison,
        "risk_count": {
            "company_1": len(a1.get("risk_assessment", [])),
            "company_2": len(a2.get("risk_assessment", [])),
        },
        "insights_count": {
            "company_1": len(a1.get("strategic_insights", [])),
            "company_2": len(a2.get("strategic_insights", [])),
        },
        "red_flags_count": {
            "company_1": len(a1.get("red_flags", [])),
            "company_2": len(a2.get("red_flags", [])),
        },
    }


def _stronger(m1: dict, m2: dict) -> str:
    scores = {"strong": 4, "adequate": 3, "concerning": 2, "critical": 1}
    s1 = scores.get(m1.get("assessment", ""), 0)
    s2 = scores.get(m2.get("assessment", ""), 0)
    if s1 > s2:
        return "company_1"
    if s2 > s1:
        return "company_2"
    return "tie"
