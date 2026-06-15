"""MCP server for reports and benchmark data."""

from __future__ import annotations

import json
import sys
from typing import Any

from agents.financial_analyst.tools import get_industry_benchmarks, search_company_news


def get_industry_benchmarks_tool(industry: str, metrics: str = "") -> str:
    metric_list = [m.strip() for m in metrics.split(",") if m.strip()] if metrics else None
    result = get_industry_benchmarks(industry, metric_list)
    return json.dumps(result, default=str)


def search_news_tool(company_name: str, days_back: int = 30) -> str:
    result = search_company_news(company_name, days_back)
    return json.dumps(result, default=str)


def run_stdio_server() -> None:
    tools = {
        "get_industry_benchmarks": get_industry_benchmarks_tool,
        "search_news": search_news_tool,
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
