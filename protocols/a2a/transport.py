"""HTTP-based A2A message transport."""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from data.db import log_agent_action
from protocols.a2a.models import A2AMessage, A2AResponse
from protocols.a2a.registry import get_agent, init_default_registry

logger = logging.getLogger(__name__)


class A2ATransport:
    """Sends A2A messages via HTTP POST between agents."""

    def __init__(self, document_id: str, use_http: bool = False) -> None:
        self.document_id = document_id
        self.use_http = use_http
        if not get_agent("document_processor"):
            init_default_registry()

    async def send(
        self,
        from_agent: str,
        to_agent: str,
        action: str,
        payload: dict[str, Any],
        local_handler: Optional[Any] = None,
    ) -> dict[str, Any]:
        msg = A2AMessage(
            from_agent=from_agent,
            to_agent=to_agent,
            action=action,
            payload=payload,
        )

        log_agent_action(
            document_id=self.document_id,
            agent_name=from_agent,
            action=f"A2A -> {to_agent}: {action}",
            input_summary=str(payload)[:500],
            status="started",
        )

        try:
            if local_handler is not None:
                result = await local_handler(msg)
            elif self.use_http:
                card = get_agent(to_agent)
                if not card:
                    raise ValueError(f"Agent {to_agent} not registered")
                async with httpx.AsyncClient(timeout=300.0) as client:
                    resp = await client.post(
                        card.endpoint,
                        json=msg.model_dump_json_safe(),
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    result = data.get("payload", data)
            else:
                result = payload

            log_agent_action(
                document_id=self.document_id,
                agent_name=to_agent,
                action=f"A2A received: {action}",
                output_summary=str(result)[:500],
                status="completed",
            )
            return result if isinstance(result, dict) else {"result": result}

        except Exception as e:
            logger.exception("A2A transport error: %s", e)
            log_agent_action(
                document_id=self.document_id,
                agent_name=to_agent,
                action=f"A2A failed: {action}",
                status="failed",
                error_message=str(e),
            )
            raise

    @staticmethod
    def format_message(from_agent: str, to_agent: str, action: str, payload: dict) -> A2AMessage:
        return A2AMessage(from_agent=from_agent, to_agent=to_agent, action=action, payload=payload)

    @staticmethod
    def parse_response(data: dict) -> A2AResponse:
        return A2AResponse(**data)
