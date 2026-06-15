"""Risk classification models and scoring."""

from __future__ import annotations

SEVERITY_SCORES = {"low": 1, "medium": 2, "high": 3, "critical": 4}
LIKELIHOOD_SCORES = {"unlikely": 1, "possible": 2, "likely": 3, "almost_certain": 4}

CATEGORIES = [
    "regulatory", "financial", "operational", "market", "legal",
    "cybersecurity", "competitive", "environmental", "geopolitical",
]


def combined_score(severity: str, likelihood: str) -> float:
    return SEVERITY_SCORES.get(severity, 2) * LIKELIHOOD_SCORES.get(likelihood, 2)


def sort_risks(risks: list[dict]) -> list[dict]:
    return sorted(risks, key=lambda r: combined_score(r.get("severity", "medium"), r.get("likelihood", "possible")), reverse=True)
