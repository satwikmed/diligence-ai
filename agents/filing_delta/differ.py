"""QoQ filing delta — diffs risk factors and MD&A sections with citations."""

from __future__ import annotations

import difflib
import re
from typing import Any


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _risk_lines(report: dict[str, Any]) -> list[str]:
    risks = report.get("risk_assessment") or []
    return [
        f"{r.get('risk_name', 'Risk')}: {r.get('description', '')} [{r.get('source_section', 'Risk Factors')}]"
        for r in risks
    ]


def _insight_lines(report: dict[str, Any]) -> list[str]:
    insights = report.get("strategic_insights") or []
    return [
        f"{i.get('insight', '')} [{i.get('supporting_evidence', 'MD&A')}]"
        for i in insights
    ]


def _section_diff(
    section: str,
    prior_lines: list[str],
    current_lines: list[str],
    prior_label: str,
    current_label: str,
) -> dict[str, Any]:
    matcher = difflib.SequenceMatcher(None, prior_lines, current_lines)
    added: list[dict[str, str]] = []
    removed: list[dict[str, str]] = []
    unchanged = 0

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            unchanged += i2 - i1
        elif tag == "delete":
            for line in prior_lines[i1:i2]:
                removed.append({"text": line, "source": prior_label, "section": section})
        elif tag == "insert":
            for line in current_lines[j1:j2]:
                added.append({"text": line, "source": current_label, "section": section})
        elif tag == "replace":
            for line in prior_lines[i1:i2]:
                removed.append({"text": line, "source": prior_label, "section": section})
            for line in current_lines[j1:j2]:
                added.append({"text": line, "source": current_label, "section": section})

    total = max(len(prior_lines), len(current_lines), 1)
    change_pct = round((1 - unchanged / total) * 100, 1)

    return {
        "section": section,
        "added": added,
        "removed": removed,
        "change_percentage": change_pct,
        "summary": _summarize(section, added, removed),
    }


def _summarize(section: str, added: list, removed: list) -> str:
    if not added and not removed:
        return f"No material changes detected in {section}."
    parts = []
    if added:
        parts.append(f"{len(added)} new item(s)")
    if removed:
        parts.append(f"{len(removed)} removed item(s)")
    return f"{section}: " + " and ".join(parts) + " vs prior filing."


def compute_filing_delta(
    prior_report: dict[str, Any],
    current_report: dict[str, Any],
    prior_label: str = "Prior 10-K",
    current_label: str = "Current 10-K",
) -> dict[str, Any]:
    """Compare two analysis reports and return structured QoQ deltas."""
    sections = [
        _section_diff("Risk Factors", _risk_lines(prior_report), _risk_lines(current_report), prior_label, current_label),
        _section_diff("MD&A / Strategic Insights", _insight_lines(prior_report), _insight_lines(current_report), prior_label, current_label),
    ]

    headline_changes = []
    for section in sections:
        for item in section["added"][:2]:
            headline_changes.append(
                {
                    "type": "added",
                    "section": item["section"],
                    "text": item["text"],
                    "citation": item["source"],
                }
            )
        for item in section["removed"][:1]:
            headline_changes.append(
                {
                    "type": "removed",
                    "section": item["section"],
                    "text": item["text"],
                    "citation": item["source"],
                }
            )

    return {
        "prior_label": prior_label,
        "current_label": current_label,
        "sections": sections,
        "headline_changes": headline_changes[:5],
        "overall_change_score": round(
            sum(s["change_percentage"] for s in sections) / max(len(sections), 1),
            1,
        ),
    }
