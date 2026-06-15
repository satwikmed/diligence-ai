"""Benchmark Agent - compares metrics against industry."""

from __future__ import annotations

from typing import Any

from agents.financial_analyst.tools import get_industry_benchmarks


def run_benchmark_analysis(
    metrics: list[dict[str, Any]],
    industry: str,
) -> dict[str, Any]:
    """Compare extracted metrics against industry benchmarks."""
    benchmarks = get_industry_benchmarks(industry)
    bench_map = {b["metric"]: b for b in benchmarks}

    enriched = []
    flagged = []

    for metric in metrics:
        name = metric.get("metric_name", "")
        bench = bench_map.get(name, {})
        entry = {
            **metric,
            "industry_average": bench.get("industry_average"),
            "percentile_rank": _estimate_percentile(metric.get("assessment", "adequate")),
            "percentile_context": bench.get("percentile_context", ""),
        }
        enriched.append(entry)

        if metric.get("assessment") in ("concerning", "critical"):
            flagged.append(f"{name}: {metric.get('yoy_change')} vs industry avg {bench.get('industry_average', 'N/A')}")

    return {
        "financial_metrics": enriched,
        "industry_benchmarks": benchmarks,
        "flagged_concerns": flagged,
    }


def _estimate_percentile(assessment: str) -> int:
    mapping = {"strong": 85, "adequate": 55, "concerning": 30, "critical": 10}
    return mapping.get(assessment, 50)
