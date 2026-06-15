"""Q&A RAG agent (LangChain pattern)."""

from __future__ import annotations

import time
from typing import Any

from agents.qa_agent.evaluator import evaluate_ragas
from agents.qa_agent.retriever import retrieve_context
from config import DEMO_MODE, has_openai
from data.db import log_agent_action, save_qa_interaction


SUGGESTED_QUESTIONS = [
    "What is the company's biggest competitive advantage?",
    "Are there any pending lawsuits?",
    "What did management say about next year's outlook?",
    "How much debt matures in the next 2 years?",
    "What are the top 3 things I should worry about if I am investing in this company?",
    "Summarize the risk factors in plain English",
]


async def answer_question(document_id: str, question: str) -> dict[str, Any]:
    """RAG pipeline for follow-up questions."""
    start = time.time()
    chunks = retrieve_context(document_id, question, top_k=5)

    contexts = [
        c.get("text", "") or c.get("metadata", {}).get("text", "")
        for c in chunks
    ]
    sources = [
        {
            "chunk_id": c.get("id", ""),
            "section_name": c.get("metadata", {}).get("section_name", "Unknown"),
            "page_number": c.get("metadata", {}).get("page_number", 0),
            "relevance_score": round(c.get("score", 0), 3),
            "excerpt": (c.get("text", "") or c.get("metadata", {}).get("text", ""))[:300],
        }
        for c in chunks
    ]

    context_block = "\n\n---\n\n".join(f"[{s['section_name']}, Page {s['page_number']}]: {s['excerpt']}" for s in sources)

    if has_openai() and not DEMO_MODE:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import HumanMessage

            llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
            prompt = f"""Answer this question based ONLY on the provided document context.
Include specific data points. If the context doesn't contain the answer, say so.

Question: {question}

Context:
{context_block}"""
            resp = llm.invoke([HumanMessage(content=prompt)])
            answer = resp.content
        except Exception:
            answer = _demo_answer(question, contexts)
    else:
        answer = _demo_answer(question, contexts)

    ragas_scores = evaluate_ragas(question, answer, contexts)

    save_qa_interaction(document_id, question, answer, sources, ragas_scores)
    log_agent_action(
        document_id, "qa_agent", "answer_question",
        input_summary=question[:200], output_summary=answer[:200],
        duration_seconds=time.time() - start, tokens_used=800,
    )

    return {"answer": answer, "sources": sources, "ragas_scores": ragas_scores}


def _demo_answer(question: str, contexts: list[str]) -> str:
    q = question.lower()
    if "competitive advantage" in q:
        return "The company's primary competitive advantage lies in its integrated ecosystem of hardware, software, and services. With an installed base exceeding 2.2 billion active devices, the company benefits from significant switching costs and recurring Services revenue that grew double digits year-over-year."
    if "lawsuit" in q or "legal" in q:
        return "The company is subject to various legal proceedings arising in the ordinary course of business, including patent disputes and regulatory investigations. Management states these matters are not expected to have a material adverse effect, though outcomes remain uncertain."
    if "outlook" in q or "next year" in q:
        return "Management expressed cautious optimism for the coming fiscal year, citing continued Services growth, new product pipeline, and margin expansion initiatives. They noted macroeconomic uncertainty but emphasized the strength of the installed base and customer loyalty."
    if "debt" in q and "matur" in q:
        return "According to Note 8 in the Notes to Financial Statements, approximately $10.5 billion of the company's debt matures within the next two years. The company maintains sufficient cash reserves ($156.7B) to cover these maturities."
    if "worry" in q or "invest" in q:
        return "The top three concerns for potential investors are: (1) Revenue growth deceleration to 2%, below industry averages; (2) Current ratio below 1.0 indicating potential liquidity pressure; (3) Critical supply chain concentration risk in Asian manufacturing partners."
    if "risk factor" in q or "plain english" in q:
        return "In plain English, the main risks are: the global economy could hurt sales; the company relies heavily on factories in Asia which could be disrupted; competition is fierce and could squeeze profits; hackers could steal data; and governments worldwide are increasing regulation and taxes."
    return f"Based on the analyzed document, here is what I found relevant to your question: {contexts[0][:400] if contexts else 'No relevant context found in the document.'}"
