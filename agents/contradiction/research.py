"""Research-grade contradiction detection: earnings transcript vs extracted 10-K text."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
TRANSCRIPT_DIR = ROOT / "data" / "transcripts"

# Call tone (optimistic) vs filing disclosure (cautious/risk) keyword pairs
TONE_RULES: list[dict[str, Any]] = [
    {
        "theme": "Regulatory risk",
        "severity": "high",
        "call_keywords": ["minimal regulatory", "unchanged globally", "no regulatory headwind"],
        "filing_keywords": ["antitrust", "regulation", "digital markets", "investigation", "compliance"],
        "filing_sections": ["risk_factors"],
    },
    {
        "theme": "China / geopolitical exposure",
        "severity": "high",
        "call_keywords": ["optimistic about china", "long run", "minimal impact"],
        "filing_keywords": ["china", "geopolitical", "greater china", "tariff"],
        "filing_sections": ["risk_factors", "mda"],
    },
    {
        "theme": "AI capex / margin pressure",
        "severity": "medium",
        "call_keywords": ["aggressively expanding", "confidence in returns", "exceed our capacity", "exceeds our capacity"],
        "filing_keywords": ["capex", "capital expenditure", "cash flow", "margin pressure", "infrastructure", "datacenter", "data center"],
        "filing_sections": ["risk_factors", "mda"],
    },
    {
        "theme": "Demand / sales cycle",
        "severity": "high",
        "call_keywords": ["not seeing elongation", "healthy pipeline", "strong demand", "pipeline conversion"],
        "filing_keywords": ["elongated", "elongation", "macro uncertainty", "caution", "slowdown", "sales cycle"],
        "filing_sections": ["risk_factors", "mda"],
    },
    {
        "theme": "Growth deceleration",
        "severity": "medium",
        "call_keywords": ["accelerate", "record revenue", "exceed expectations"],
        "filing_keywords": ["decelerat", "slowdown", "headwind", "uncertain demand"],
        "filing_sections": ["mda", "risk_factors"],
    },
]


def _matches(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(k in lower for k in keywords)


def _load_transcript(ticker: str) -> dict[str, Any] | None:
    path = TRANSCRIPT_DIR / f"{ticker.upper()}_Q4_FY2024.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def _filing_corpus(sections: dict[str, Any]) -> dict[str, str]:
    return {
        "risk_factors": sections.get("risk_factors") or "",
        "mda": sections.get("mda") or "",
    }


def detect_contradictions_from_filing_text(
    filing_sections: dict[str, Any],
    ticker: str,
) -> dict[str, Any]:
    """Cross-check transcript turns against extracted Risk Factors / MD&A text."""
    transcript = _load_transcript(ticker)
    corpus = _filing_corpus(filing_sections)
    findings: list[dict[str, Any]] = []
    seen_themes: set[str] = set()

    if not transcript:
        return {
            "ticker": ticker.upper(),
            "contradictions": [],
            "call_excerpt_count": 0,
            "source": "transcript_missing",
        }

    turns = transcript.get("turns") or []
    for turn in turns:
        quote = turn.get("quote", "")
        speaker = turn.get("speaker", "Management")
        for rule in TONE_RULES:
            if rule["theme"] in seen_themes:
                continue
            if not _matches(quote, rule["call_keywords"]):
                continue
            for section_key in rule["filing_sections"]:
                filing_text = corpus.get(section_key, "")
                if not filing_text or not _matches(filing_text, rule["filing_keywords"]):
                    continue
                # Extract a short filing excerpt around first keyword match
                excerpt = _excerpt_around_keyword(filing_text, rule["filing_keywords"][0])
                findings.append(
                    {
                        "theme": rule["theme"],
                        "severity": rule["severity"],
                        "earnings_call": {
                            "speaker": speaker.split(",")[0],
                            "quote": quote,
                            "source": transcript.get("period", "Earnings Call"),
                        },
                        "filing": {
                            "quote": excerpt,
                            "source": "Risk Factors" if section_key == "risk_factors" else "MD&A",
                        },
                        "analysis": (
                            f"Management tone on the call ('{rule['theme'].lower()}') appears more optimistic "
                            f"than language in the 10-K {section_key.replace('_', ' ')} section."
                        ),
                    }
                )
                seen_themes.add(rule["theme"])
                break

    return {
        "ticker": ticker.upper(),
        "contradictions": findings,
        "call_excerpt_count": len(turns),
        "source": "transcript_vs_filing_text",
        "transcript_period": transcript.get("period"),
    }


def _excerpt_around_keyword(text: str, keyword: str, window: int = 220) -> str:
    lower = text.lower()
    idx = lower.find(keyword.lower())
    if idx < 0:
        return text[:window] + "…"
    start = max(0, idx - 80)
    end = min(len(text), idx + window)
    snippet = text[start:end].strip()
    if start > 0:
        snippet = "…" + snippet
    if end < len(text):
        snippet = snippet + "…"
    return snippet
