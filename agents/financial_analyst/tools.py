"""Financial calculation and benchmark tools."""

from __future__ import annotations

import re
from typing import Any, Optional

from config import DEMO_MODE, has_apify

# Industry benchmark defaults for demo
DEFAULT_BENCHMARKS: dict[str, dict[str, Any]] = {
    "Technology Hardware": {
        "revenue_growth": {"average": "8.5%", "percentile_context": "above median"},
        "gross_margin": {"average": "38.2%", "percentile_context": "top quartile"},
        "operating_margin": {"average": "22.1%", "percentile_context": "top decile"},
        "net_margin": {"average": "18.5%", "percentile_context": "top quartile"},
        "debt_to_equity": {"average": "1.2", "percentile_context": "below median"},
        "current_ratio": {"average": "1.4", "percentile_context": "strong"},
        "free_cash_flow": {"average": "N/A", "percentile_context": "varies"},
        "pe_ratio": {"average": "28.5", "percentile_context": "premium valuation"},
    },
    "Technology": {
        "revenue_growth": {"average": "12.0%", "percentile_context": "above median"},
        "gross_margin": {"average": "65.0%", "percentile_context": "above average"},
        "operating_margin": {"average": "25.0%", "percentile_context": "strong"},
        "net_margin": {"average": "20.0%", "percentile_context": "strong"},
        "debt_to_equity": {"average": "0.8", "percentile_context": "conservative"},
        "current_ratio": {"average": "2.0", "percentile_context": "healthy"},
        "pe_ratio": {"average": "32.0", "percentile_context": "growth premium"},
    },
}


def calculate_yoy_change(current: float, prior: float) -> str:
    if prior == 0:
        return "N/A"
    change = ((current - prior) / abs(prior)) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.1f}%"


def calculate_ratio(numerator: float, denominator: float) -> str:
    if denominator == 0:
        return "N/A"
    return f"{numerator / denominator:.2f}"


def parse_financial_number(text: str) -> Optional[float]:
    """Parse financial numbers from text like '$391,035 million'."""
    m = re.search(r"[\$]?([\d,]+(?:\.\d+)?)\s*(?:million|billion|M|B)?", text, re.I)
    if not m:
        return None
    val = float(m.group(1).replace(",", ""))
    if "billion" in text.lower() or " B" in text:
        val *= 1000
    return val


def assess_metric(metric_name: str, yoy_change: str, value: str) -> str:
    """Flag concerning trends."""
    yoy = yoy_change.replace("%", "").replace("+", "")
    try:
        change = float(yoy)
    except ValueError:
        return "adequate"

    if metric_name in ("gross_margin", "operating_margin", "net_margin") and change < -2:
        return "concerning"
    if metric_name == "revenue_growth" and change < 0:
        return "concerning"
    if metric_name == "debt_to_equity" and change > 20:
        return "concerning"
    if metric_name in ("gross_margin", "operating_margin", "net_margin") and change > 1:
        return "strong"
    if metric_name == "revenue_growth" and change > 10:
        return "strong"
    return "adequate"


def get_industry_benchmarks(industry: str, metrics: Optional[list[str]] = None) -> list[dict[str, Any]]:
    """Return industry benchmarks, optionally via Apify."""
    if has_apify() and not DEMO_MODE:
        try:
            from apify_client import ApifyClient
            from config import APIFY_API_TOKEN

            client = ApifyClient(APIFY_API_TOKEN)
            # Placeholder actor - falls back to defaults on failure
            _ = client
        except Exception:
            pass

    bench = DEFAULT_BENCHMARKS.get(industry, DEFAULT_BENCHMARKS["Technology"])
    results = []
    for metric, data in bench.items():
        if metrics and metric not in metrics:
            continue
        results.append({
            "metric": metric,
            "industry_average": data["average"],
            "percentile_context": data["percentile_context"],
        })
    return results


def search_company_news(company_name: str, days_back: int = 30) -> list[dict[str, Any]]:
    """Search recent news via Apify or return demo news."""
    if has_apify() and not DEMO_MODE:
        try:
            from apify_client import ApifyClient
            from config import APIFY_API_TOKEN

            client = ApifyClient(APIFY_API_TOKEN)
            run = client.actor("apify/google-search-scraper").call(
                run_input={"queries": f"{company_name} news", "maxPagesPerQuery": 1},
            )
            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            return [{"title": i.get("title", ""), "url": i.get("url", ""), "snippet": i.get("description", "")} for i in items[:5]]
        except Exception:
            pass

    return [
        {"title": f"{company_name} reports strong quarterly results", "snippet": "Revenue beat analyst expectations.", "news_relevant": False},
        {"title": f"Analysts raise price target on {company_name}", "snippet": "Multiple firms cite services growth.", "news_relevant": False},
    ]
