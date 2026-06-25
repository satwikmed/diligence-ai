"""Earnings call vs 10-K contradiction detection."""

from __future__ import annotations

from typing import Any


# Demo earnings-call excerpts keyed by ticker prefix from filename
EARNINGS_CALL_SNIPPETS: dict[str, list[dict[str, str]]] = {
    "AAPL": [
        {
            "speaker": "CEO",
            "quote": "We see minimal regulatory headwinds and expect our App Store model to remain largely unchanged globally.",
            "section": "Q4 FY2024 Earnings Call",
        },
        {
            "speaker": "CFO",
            "quote": "Services growth will accelerate as we expand advertising and payment attach across the ecosystem.",
            "section": "Q4 FY2024 Earnings Call",
        },
    ],
    "MSFT": [
        {
            "speaker": "CEO",
            "quote": "Azure AI demand continues to exceed our capacity; we are aggressively expanding data center footprint.",
            "section": "Q4 FY2024 Earnings Call",
        },
    ],
    "CRM": [
        {
            "speaker": "CEO",
            "quote": "We are not seeing enterprise deal elongation; pipeline conversion remains healthy across all segments.",
            "section": "Q4 FY2024 Earnings Call",
        },
    ],
}


CONTRADICTION_RULES: list[dict[str, Any]] = [
    {
        "keywords_call": ["minimal regulatory", "unchanged globally", "no regulatory"],
        "keywords_filing": ["regulatory", "antitrust", "investigation", "compliance"],
        "theme": "Regulatory risk",
        "severity": "high",
    },
    {
        "keywords_call": ["accelerate", "strong growth", "exceed expectations"],
        "keywords_filing": ["decelerating", "slowdown", "headwind", "uncertain"],
        "theme": "Growth outlook",
        "severity": "medium",
    },
    {
        "keywords_call": ["healthy pipeline", "not seeing elongation", "strong demand"],
        "keywords_filing": ["elongated sales cycles", "macro uncertainty", "caution"],
        "theme": "Demand / sales cycle",
        "severity": "medium",
    },
]


def _filing_excerpts(report: dict[str, Any]) -> list[dict[str, str]]:
    excerpts: list[dict[str, str]] = []
    for risk in report.get("risk_assessment") or []:
        excerpts.append(
            {
                "text": f"{risk.get('risk_name', '')}: {risk.get('description', '')}",
                "section": risk.get("source_section", "Risk Factors"),
            }
        )
    for flag in report.get("red_flags") or []:
        excerpts.append(
            {
                "text": flag.get("flag", ""),
                "section": f"Red Flags (p.{flag.get('source_page', '?')})",
            }
        )
    for insight in report.get("strategic_insights") or []:
        if insight.get("severity") in ("negative", "concerning"):
            excerpts.append(
                {
                    "text": insight.get("insight", ""),
                    "section": insight.get("supporting_evidence", "MD&A"),
                }
            )
    return excerpts


def _matches_any(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(k.lower() in lower for k in keywords)


def detect_contradictions(
    report: dict[str, Any],
    ticker: str,
) -> dict[str, Any]:
    """Find potential contradictions between earnings call quotes and 10-K language."""
    call_quotes = EARNINGS_CALL_SNIPPETS.get(ticker.upper(), [])
    filing_texts = _filing_excerpts(report)
    findings: list[dict[str, Any]] = []

    for quote in call_quotes:
        for rule in CONTRADICTION_RULES:
            if not _matches_any(quote["quote"], rule["keywords_call"]):
                continue
            for filing in filing_texts:
                if _matches_any(filing["text"], rule["keywords_filing"]):
                    findings.append(
                        {
                            "theme": rule["theme"],
                            "severity": rule["severity"],
                            "earnings_call": {
                                "speaker": quote["speaker"],
                                "quote": quote["quote"],
                                "source": quote["section"],
                            },
                            "filing": {
                                "quote": filing["text"],
                                "source": filing["section"],
                            },
                            "analysis": (
                                f"Management emphasized '{rule['theme'].lower()}' differently on the earnings call "
                                f"vs the 10-K {filing['section']} disclosure."
                            ),
                        }
                    )
                    break

    if not findings and call_quotes:
        findings.append(
            {
                "theme": "No major contradictions flagged",
                "severity": "low",
                "earnings_call": {
                    "speaker": call_quotes[0]["speaker"],
                    "quote": call_quotes[0]["quote"],
                    "source": call_quotes[0]["section"],
                },
                "filing": {
                    "quote": (report.get("risk_assessment") or [{}])[0].get("description", "See Risk Factors."),
                    "source": "Risk Factors",
                },
                "analysis": "Automated scan found no high-confidence contradictions in demo mode. Upload both sources for full analysis.",
            }
        )

    return {
        "ticker": ticker.upper(),
        "contradictions": findings,
        "call_excerpt_count": len(call_quotes),
    }
