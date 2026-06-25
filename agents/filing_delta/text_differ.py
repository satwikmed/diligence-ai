"""Diff extracted 10-K section text (Risk Factors, MD&A) — research-grade QoQ."""

from __future__ import annotations

import difflib
import re
from typing import Any

MATERIALITY_KEYWORDS = [
    "antitrust",
    "regulation",
    "regulatory",
    "tariff",
    "china",
    "geopolitical",
    "macroeconomic",
    "capex",
    "capital expenditure",
    "cash flow",
    "margin",
    "elongat",
    "slowdown",
    "investigation",
    "litigation",
    "cybersecurity",
    "supply chain",
    "artificial intelligence",
    "competition",
    "debt",
    "liquidity",
]

NOISE_PATTERNS = [
    re.compile(r"^item\s+\d", re.I),
    re.compile(r"risk factors\s+the following summarizes factors", re.I),
    re.compile(r"table of contents", re.I),
    re.compile(r"^part\s+(i|ii|iii|iv)\b", re.I),
]


def _is_noise_paragraph(text: str) -> bool:
    t = text.strip()
    if len(t) < 120:
        return True
    lower = t.lower()
    if any(p.search(t) for p in NOISE_PATTERNS):
        return True
    if "form 10-k" in lower and len(t) < 350:
        return True
    if lower.count("item ") >= 3:
        return True
    return False


def _materiality_score(text: str) -> float:
    lower = text.lower()
    score = sum(2.0 for kw in MATERIALITY_KEYWORDS if kw in lower)
    if any(p in lower for p in ("iphone", "ipad", "apple watch", "homepod")):
        score -= 1.5
    return score + min(len(text) / 400, 2.0)


def _rank_paragraphs(items: list[dict[str, str]], limit: int = 8) -> list[dict[str, str]]:
    ranked = sorted(
        items,
        key=lambda x: _materiality_score(x.get("text", "")),
        reverse=True,
    )
    return ranked[:limit]


def _paragraph_diff(
    section: str,
    prior_paragraphs: list[str],
    current_paragraphs: list[str],
    prior_label: str,
    current_label: str,
) -> dict[str, Any]:
    matcher = difflib.SequenceMatcher(None, prior_paragraphs, current_paragraphs)
    added: list[dict[str, str]] = []
    removed: list[dict[str, str]] = []
    unchanged = 0

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            unchanged += i2 - i1
        elif tag == "delete":
            for line in prior_paragraphs[i1:i2]:
                if not _is_noise_paragraph(line):
                    removed.append({"text": line, "source": prior_label, "section": section})
        elif tag == "insert":
            for line in current_paragraphs[j1:j2]:
                if not _is_noise_paragraph(line):
                    added.append({"text": line, "source": current_label, "section": section})
        elif tag == "replace":
            for line in prior_paragraphs[i1:i2]:
                if not _is_noise_paragraph(line):
                    removed.append({"text": line, "source": prior_label, "section": section})
            for line in current_paragraphs[j1:j2]:
                if not _is_noise_paragraph(line):
                    added.append({"text": line, "source": current_label, "section": section})

    added = _rank_paragraphs(added)
    removed = _rank_paragraphs(removed)

    total = max(len(prior_paragraphs), len(current_paragraphs), 1)
    change_pct = round((1 - unchanged / total) * 100, 1)

    summary_parts = []
    if added:
        summary_parts.append(f"{len(added)} new paragraph(s)")
    if removed:
        summary_parts.append(f"{len(removed)} removed paragraph(s)")
    summary = (
        f"{section}: " + " and ".join(summary_parts) + f" vs prior filing (extracted 10-K text)."
        if summary_parts
        else f"No material paragraph changes in {section}."
    )

    return {
        "section": section,
        "added": added,
        "removed": removed,
        "change_percentage": change_pct,
        "summary": summary,
        "extraction_method": "10-K PDF text (Item 1A / Item 7)",
    }


def compute_text_filing_delta(
    prior_sections: dict[str, Any],
    current_sections: dict[str, Any],
    prior_label: str = "Prior 10-K",
    current_label: str = "Current 10-K",
) -> dict[str, Any]:
    """Compare paragraph lists from `extract_sections_from_pdf`."""
    sections = [
        _paragraph_diff(
            "Risk Factors",
            prior_sections.get("risk_paragraphs") or [],
            current_sections.get("risk_paragraphs") or [],
            prior_label,
            current_label,
        ),
        _paragraph_diff(
            "MD&A",
            prior_sections.get("mda_paragraphs") or [],
            current_sections.get("mda_paragraphs") or [],
            prior_label,
            current_label,
        ),
    ]

    headline_changes: list[dict[str, str]] = []
    for section in sections:
        for item in _rank_paragraphs(section["added"], 3):
            headline_changes.append(
                {
                    "type": "added",
                    "section": item["section"],
                    "text": item["text"][:280] + ("…" if len(item["text"]) > 280 else ""),
                    "citation": f"{item['source']} · extracted filing text",
                }
            )
        for item in _rank_paragraphs(section["removed"], 2):
            headline_changes.append(
                {
                    "type": "removed",
                    "section": item["section"],
                    "text": item["text"][:280] + ("…" if len(item["text"]) > 280 else ""),
                    "citation": f"{item['source']} · extracted filing text",
                }
            )

    material_count = sum(len(s["added"]) + len(s["removed"]) for s in sections)
    return {
        "prior_label": prior_label,
        "current_label": current_label,
        "sections": sections,
        "headline_changes": headline_changes[:6],
        "overall_change_score": round(
            sum(s["change_percentage"] for s in sections) / max(len(sections), 1),
            1,
        ),
        "material_change_count": material_count,
        "source": "sec_filing_text",
        "risk_page_prior": prior_sections.get("risk_page"),
        "risk_page_current": current_sections.get("risk_page"),
    }
