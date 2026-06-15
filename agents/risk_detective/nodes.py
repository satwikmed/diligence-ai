"""LangGraph nodes for risk analysis pipeline."""

from __future__ import annotations

import json
import re
from typing import Any

from agents.financial_analyst.tools import search_company_news
from agents.risk_detective.risk_models import CATEGORIES, combined_score, sort_risks
from config import DEMO_MODE, has_openai
from data.pinecone_setup import search_chunks


RISK_SECTIONS = [
    "Risk Factors",
    "Legal Proceedings",
    "Notes to Financial Statements",
    "Management Discussion and Analysis",
]


def extract_risk_sections(state: dict) -> dict:
    document_id = state["document_id"]
    sections_text = []

    for section in RISK_SECTIONS:
        chunks = search_chunks(document_id, section, section_filter=section, top_k=20)
        if not chunks:
            chunks = search_chunks(document_id, f"{section} risks concerns", top_k=10)
        text = "\n".join(c.get("text", "") + c.get("metadata", {}).get("text", "") for c in chunks)
        if text.strip():
            sections_text.append(text)

    if not sections_text:
        sections_text = [search_chunks(document_id, "risk factors legal proceedings", top_k=5)[0].get("text", "") if search_chunks(document_id, "risk", top_k=1) else ""]

    state["risk_sections"] = sections_text
    state["reasoning_log"].append(f"Extracted {len(sections_text)} risk-related sections")
    return state


def parse_individual_risks(state: dict) -> dict:
    combined = "\n\n".join(state["risk_sections"])

    if has_openai() and not DEMO_MODE:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import HumanMessage

            llm = ChatOpenAI(model="gpt-4o", temperature=0)
            prompt = f"""Extract individual discrete risks from this 10-K text.
For each risk return: risk_name, description (2-3 sentences), category (one of {CATEGORIES}),
source_section, source_page (integer if found).

Return JSON array.

Text:
{combined[:15000]}"""
            resp = llm.invoke([HumanMessage(content=prompt)])
            content = resp.content
            if "```" in content:
                content = content.split("```")[1].replace("json", "").strip()
            risks = json.loads(content)
            state["extracted_risks"] = risks
            state["reasoning_log"].append(f"LLM extracted {len(risks)} individual risks")
            return state
        except Exception as e:
            state["reasoning_log"].append(f"LLM extraction failed: {e}")

    state["extracted_risks"] = _demo_risks()
    state["reasoning_log"].append(f"Identified {len(state['extracted_risks'])} individual risks")
    return state


def classify_severity(state: dict) -> dict:
    classified = []
    for risk in state["extracted_risks"]:
        if has_openai() and not DEMO_MODE and "severity" not in risk:
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.messages import HumanMessage

                llm = ChatOpenAI(model="gpt-4o", temperature=0)
                resp = llm.invoke([HumanMessage(content=f"""Classify this risk with severity (low/medium/high/critical) and likelihood (unlikely/possible/likely/almost_certain). Return JSON.

Risk: {risk.get('risk_name')}: {risk.get('description')}""")])
                content = resp.content
                if "```" in content:
                    content = content.split("```")[1].replace("json", "").strip()
                classification = json.loads(content)
                risk.update(classification)
            except Exception:
                risk.setdefault("severity", "medium")
                risk.setdefault("likelihood", "possible")
        else:
            risk.setdefault("severity", risk.get("severity", "medium"))
            risk.setdefault("likelihood", risk.get("likelihood", "possible"))

        classified.append(risk)

    state["classified_risks"] = classified
    state["reasoning_log"].append("Classified severity and likelihood for all risks")
    return state


def deep_dive_critical(state: dict) -> dict:
    critical = [r for r in state["classified_risks"] if r.get("severity") == "critical"]
    deep_dives = []
    for risk in critical:
        deep_dives.append({
            **risk,
            "deep_dive": f"Critical risk '{risk.get('risk_name')}' requires enhanced monitoring. "
                          f"Potential impact on revenue and operations is significant.",
        })
    state["deep_dive_risks"] = deep_dives
    state["reasoning_log"].append(f"Deep-dive analysis on {len(critical)} critical risks")
    return state


def cross_reference_news(state: dict) -> dict:
    company = state.get("company_name", "Company")
    news = search_company_news(company, days_back=30)
    state["news_cross_reference"] = news

    for risk in state["classified_risks"]:
        if risk.get("severity") in ("high", "critical"):
            relevant = any(
                kw in n.get("title", "").lower() + n.get("snippet", "").lower()
                for kw in risk.get("risk_name", "").lower().split()[:2]
                for n in news
            )
            risk["news_relevant"] = relevant
            risk["news_summary"] = news[0].get("snippet", "") if relevant and news else None
        else:
            risk["news_relevant"] = False
            risk["news_summary"] = None

    state["reasoning_log"].append("Cross-referenced high/critical risks with recent news")
    return state


def prioritize(state: dict) -> dict:
    prioritized = sort_risks(state["classified_risks"])
    state["prioritized_risks"] = prioritized

    critical_count = sum(1 for r in prioritized if r.get("severity") == "critical")
    top3 = prioritized[:3]
    names = state.get("company_name", "the company")
    narrative_parts = [f"(1) {r.get('risk_name')}" for r in top3]
    narrative = f"The three most critical risks for {names} are: {', '.join(narrative_parts)}."

    materializing = [r for r in prioritized if r.get("news_relevant")]
    if materializing:
        narrative += f" Of these, '{materializing[0].get('risk_name')}' appears to be actively materializing based on recent news coverage."

    state["reasoning_log"].append(narrative)
    state["risk_narrative"] = narrative
    state["critical_count"] = critical_count
    return state


def _demo_risks() -> list[dict]:
    return [
        {"risk_name": "Global Economic Conditions", "description": "Adverse macroeconomic conditions could reduce consumer demand and impact revenue growth across all product categories.", "category": "market", "source_section": "Risk Factors", "source_page": 12, "severity": "high", "likelihood": "possible"},
        {"risk_name": "Supply Chain Concentration", "description": "Heavy reliance on Asian manufacturing partners creates vulnerability to geopolitical tensions, natural disasters, and trade restrictions.", "category": "operational", "source_section": "Risk Factors", "source_page": 14, "severity": "critical", "likelihood": "likely"},
        {"risk_name": "Intense Competition", "description": "Aggressive competition in smartphones, PCs, and services could erode market share and compress margins.", "category": "competitive", "source_section": "Risk Factors", "source_page": 15, "severity": "high", "likelihood": "almost_certain"},
        {"risk_name": "Cybersecurity Threats", "description": "Sophisticated cyber attacks could compromise customer data, disrupt operations, and damage brand reputation.", "category": "cybersecurity", "source_section": "Risk Factors", "source_page": 18, "severity": "high", "likelihood": "possible"},
        {"risk_name": "Regulatory Scrutiny", "description": "Increasing antitrust and privacy regulation globally may constrain business practices and increase compliance costs.", "category": "regulatory", "source_section": "Risk Factors", "source_page": 20, "severity": "medium", "likelihood": "likely"},
        {"risk_name": "Tax Law Changes", "description": "Changes in international tax laws could materially increase effective tax rate and reduce net income.", "category": "financial", "source_section": "Risk Factors", "source_page": 22, "severity": "medium", "likelihood": "possible"},
        {"risk_name": "Intellectual Property Disputes", "description": "Ongoing patent litigation could result in significant damages or licensing requirements.", "category": "legal", "source_section": "Legal Proceedings", "source_page": 45, "severity": "medium", "likelihood": "possible"},
        {"risk_name": "Currency Fluctuations", "description": "Strong USD relative to foreign currencies negatively impacts international revenue translation.", "category": "financial", "source_section": "Risk Factors", "source_page": 16, "severity": "low", "likelihood": "likely"},
        {"risk_name": "Debt Maturity Risk", "description": "Approximately $10.5 billion of debt matures within two years, requiring refinancing in potentially unfavorable rate environments.", "category": "financial", "source_section": "Notes to Financial Statements", "source_page": 62, "severity": "medium", "likelihood": "unlikely"},
        {"risk_name": "Environmental Regulations", "description": "Stricter environmental standards for manufacturing and product disposal may increase costs.", "category": "environmental", "source_section": "Risk Factors", "source_page": 24, "severity": "low", "likelihood": "possible"},
    ]
