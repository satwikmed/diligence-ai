"""A2A message schemas for inter-agent communication."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class AgentCard(BaseModel):
    name: str
    description: str
    capabilities: list[str]
    endpoint: str


class A2AMessage(BaseModel):
    from_agent: str
    to_agent: str
    action: str
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    def model_dump_json_safe(self) -> dict[str, Any]:
        data = self.model_dump()
        data["timestamp"] = self.timestamp.isoformat()
        return data


class A2AResponse(BaseModel):
    success: bool
    message_id: str
    from_agent: str
    payload: dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
