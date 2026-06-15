"""Synthesis tools for strategic insights agent."""

from __future__ import annotations

from typing import Any


def merge_analysis_outputs(*outputs: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for output in outputs:
        merged.update(output)
    return merged
