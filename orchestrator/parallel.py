"""Parallel execution manager for concurrent agents."""

from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable


async def run_parallel(*tasks: Awaitable[Any]) -> tuple[Any, ...]:
    """Run multiple async agent tasks concurrently."""
    return await asyncio.gather(*tasks, return_exceptions=False)


async def run_parallel_safe(*tasks: Awaitable[Any]) -> list[Any]:
    """Run tasks concurrently, capturing exceptions instead of failing."""
    results = await asyncio.gather(*tasks, return_exceptions=True)
    processed = []
    for r in results:
        if isinstance(r, Exception):
            processed.append({"error": str(r), "success": False})
        else:
            processed.append(r)
    return processed


async def run_with_timeout(coro: Awaitable[Any], timeout: float = 300.0) -> Any:
    return await asyncio.wait_for(coro, timeout=timeout)
