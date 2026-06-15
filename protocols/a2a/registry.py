"""Agent registry and discovery for A2A protocol."""

from __future__ import annotations

from typing import Callable, Optional

from protocols.a2a.models import AgentCard

agent_registry: dict[str, AgentCard] = {}
message_handlers: dict[str, Callable] = {}


AGENT_PORTS = {
    "document_processor": 8001,
    "financial_analyst": 8002,
    "risk_detective": 8003,
    "strategic_insights": 8004,
    "report_generator": 8005,
    "qa_agent": 8006,
}


def register_agent(card: AgentCard) -> None:
    agent_registry[card.name] = card


def get_agent(name: str) -> Optional[AgentCard]:
    return agent_registry.get(name)


def list_agents() -> list[AgentCard]:
    return list(agent_registry.values())


def register_handler(agent_name: str, handler: Callable) -> None:
    message_handlers[agent_name] = handler


def get_handler(agent_name: str) -> Optional[Callable]:
    return message_handlers.get(agent_name)


def init_default_registry(host: str = "127.0.0.1") -> None:
    """Register all six agents with default local endpoints."""
    defaults = [
        AgentCard(
            name="document_processor",
            description="Parses PDFs, chunks, embeds to Pinecone",
            capabilities=["parse", "chunk", "embed", "extract_overview"],
            endpoint=f"http://{host}:{AGENT_PORTS['document_processor']}/a2a",
        ),
        AgentCard(
            name="financial_analyst",
            description="CrewAI financial metrics extraction and benchmarking",
            capabilities=["extract_metrics", "benchmark", "ratio_analysis"],
            endpoint=f"http://{host}:{AGENT_PORTS['financial_analyst']}/a2a",
        ),
        AgentCard(
            name="risk_detective",
            description="LangGraph multi-step risk analysis",
            capabilities=["extract_risks", "classify", "prioritize", "news_cross_ref"],
            endpoint=f"http://{host}:{AGENT_PORTS['risk_detective']}/a2a",
        ),
        AgentCard(
            name="strategic_insights",
            description="OpenAI Agents SDK strategic synthesis",
            capabilities=["synthesize", "red_flags", "outlook"],
            endpoint=f"http://{host}:{AGENT_PORTS['strategic_insights']}/a2a",
        ),
        AgentCard(
            name="report_generator",
            description="Pydantic AI consulting report generation",
            capabilities=["generate_report", "executive_summary"],
            endpoint=f"http://{host}:{AGENT_PORTS['report_generator']}/a2a",
        ),
        AgentCard(
            name="qa_agent",
            description="LangChain RAG Q&A with RAGAS evaluation",
            capabilities=["answer_question", "retrieve", "evaluate"],
            endpoint=f"http://{host}:{AGENT_PORTS['qa_agent']}/a2a",
        ),
    ]
    for card in defaults:
        register_agent(card)
