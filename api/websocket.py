"""FastAPI WebSocket handler."""

from __future__ import annotations

from fastapi import WebSocket, WebSocketDisconnect

from orchestrator.events import get_event_history, get_progress_state, register_connection, unregister_connection


async def websocket_endpoint(websocket: WebSocket, document_id: str) -> None:
    await websocket.accept()
    register_connection(document_id, websocket)

    history = get_event_history(document_id)
    for event in history[-20:]:
        await websocket.send_json(event)

    state = get_progress_state(document_id)
    await websocket.send_json({"type": "state", **state})

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        unregister_connection(document_id, websocket)
