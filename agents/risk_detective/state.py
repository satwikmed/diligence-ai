"""LangGraph state schema for risk analysis."""

from __future__ import annotations

from typing import TypedDict


class RiskState(TypedDict):
    document_id: str
    company_name: str
    risk_sections: list[str]
    extracted_risks: list[dict]
    classified_risks: list[dict]
    news_cross_reference: list[dict]
    prioritized_risks: list[dict]
    reasoning_log: list[str]
    deep_dive_risks: list[dict]
