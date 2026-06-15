"""Event system for WebSocket progress updates."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

_connections: dict[str, list[Any]] = {}
_event_history: dict[str, list[dict[str, Any]]] = {}


def register_connection(document_id: str, websocket: Any) -> None:
    if document_id not in _connections:
        _connections[document_id] = []
    _connections[document_id].append(websocket)


def unregister_connection(document_id: str, websocket: Any) -> None:
    if document_id in _connections:
        _connections[document_id] = [ws for ws in _connections[document_id] if ws != websocket]
        if not _connections[document_id]:
            del _connections[document_id]


async def emit_ws(document_id: str, message: str, event_type: str = "progress", **extra: Any) -> None:
    """Emit a WebSocket event to all connected clients for a document."""
    event = {
        "type": event_type,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **extra,
    }

    if document_id not in _event_history:
        _event_history[document_id] = []
    _event_history[document_id].append(event)

    if document_id not in _connections:
        return

    dead: list[Any] = []
    for ws in _connections[document_id]:
        try:
            await ws.send_json(event)
        except Exception:
            dead.append(ws)

    for ws in dead:
        unregister_connection(document_id, ws)


def get_event_history(document_id: str) -> list[dict[str, Any]]:
    return _event_history.get(document_id, [])


def get_progress_state(document_id: str) -> dict[str, Any]:
    """Derive progress from event history."""
    history = get_event_history(document_id)
    if not history:
        return {"status": "unknown", "progress_percentage": 0, "current_agent": None}

    agent_order = [
        "document_processor", "financial_analyst", "risk_detective",
        "strategic_insights", "report_generator", "qa_agent",
    ]
    current_agent = None
    progress = 0

    for event in history:
        msg = event.get("message", "").lower()
        agent = event.get("agent")
        if agent:
            current_agent = agent
            if agent in agent_order:
                progress = max(progress, int((agent_order.index(agent) + 1) / len(agent_order) * 100))

        if "complete" in msg:
            progress = min(progress + 10, 100)

    last = history[-1] if history else {}
    return {
        "status": "processing" if progress < 100 else "complete",
        "current_agent": current_agent or last.get("agent"),
        "progress_percentage": min(progress, 100),
        "last_message": last.get("message", ""),
        "events": history[-20:],
    }


def clear_events(document_id: str) -> None:
    _event_history.pop(document_id, None)
