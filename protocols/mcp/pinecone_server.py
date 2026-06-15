"""MCP server for Pinecone / analysis store operations."""

from __future__ import annotations

import json
import sys

from data.db import get_agent_logs, get_analysis


def get_analysis_tool(document_id: str) -> str:
    result = get_analysis(document_id)
    return json.dumps(result, default=str) if result else json.dumps({"error": "Not found"})


def get_financial_metrics_tool(document_id: str) -> str:
    result = get_analysis(document_id)
    if not result:
        return json.dumps({"error": "Not found"})
    return json.dumps(result.get("financial_metrics", []), default=str)


def get_risks_tool(document_id: str, severity_filter: str = "") -> str:
    result = get_analysis(document_id)
    if not result:
        return json.dumps({"error": "Not found"})
    risks = result.get("risk_assessment", [])
    if severity_filter:
        risks = [r for r in risks if r.get("severity") == severity_filter]
    return json.dumps(risks, default=str)


def get_agent_logs_tool(document_id: str, agent_name: str = "") -> str:
    logs = get_agent_logs(document_id, agent_name or None)
    return json.dumps(logs, default=str)


def run_stdio_server() -> None:
    tools = {
        "get_analysis": get_analysis_tool,
        "get_financial_metrics": get_financial_metrics_tool,
        "get_risks": get_risks_tool,
        "get_agent_logs": get_agent_logs_tool,
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
