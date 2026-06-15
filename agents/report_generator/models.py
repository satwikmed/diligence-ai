"""Pydantic output models for due diligence report."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CompanyOverview(BaseModel):
    name: str
    industry: str
    headquarters: str
    employees: Optional[str] = None
    founded: Optional[str] = None
    stock_ticker: Optional[str] = None
    description: str = ""


class FinancialMetric(BaseModel):
    metric_name: str
    current_value: str
    prior_year_value: str
    yoy_change: str
    industry_average: Optional[str] = None
    percentile_rank: Optional[int] = None
    assessment: str = "adequate"


class RiskItem(BaseModel):
    risk_name: str
    description: str
    severity: str
    likelihood: str
    category: str
    news_relevant: bool = False
    source_section: str = ""
    source_page: Optional[int] = None


class StrategicInsight(BaseModel):
    insight: str
    supporting_evidence: str
    severity: str
    category: str


class Recommendation(BaseModel):
    title: str
    description: str
    priority: str
    rationale: str


class RedFlag(BaseModel):
    flag: str
    description: str
    severity: str
    source_page: Optional[int] = None


class DueDiligenceReport(BaseModel):
    executive_summary: str
    company_overview: CompanyOverview
    financial_analysis: list[FinancialMetric] = Field(default_factory=list)
    risk_assessment: list[RiskItem] = Field(default_factory=list)
    strategic_insights: list[StrategicInsight] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)
    red_flags: list[RedFlag] = Field(default_factory=list)
    industry_benchmarks: list[dict] = Field(default_factory=list)
    data_quality_score: float = 85.0
    analysis_metadata: dict = Field(default_factory=dict)
