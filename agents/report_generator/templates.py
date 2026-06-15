"""Report section templates."""

from __future__ import annotations

EXECUTIVE_SUMMARY_TEMPLATE = """
{company_name} — Due Diligence Executive Summary

{paragraph_1}

{paragraph_2}

{paragraph_3}

{paragraph_4}
"""

RECOMMENDATION_TEMPLATES = [
    {"title": "Monitor Liquidity Metrics", "priority": "high", "category": "financial"},
    {"title": "Assess Supply Chain Diversification", "priority": "critical", "category": "operational"},
    {"title": "Evaluate Services Growth Sustainability", "priority": "medium", "category": "growth"},
    {"title": "Review Regulatory Exposure", "priority": "medium", "category": "regulatory"},
]
