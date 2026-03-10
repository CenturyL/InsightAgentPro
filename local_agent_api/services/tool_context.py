from __future__ import annotations

from contextvars import ContextVar
from typing import Any


_metadata_filters_var: ContextVar[dict[str, Any] | None] = ContextVar(
    "tool_metadata_filters",
    default=None,
)


def set_tool_metadata_filters(metadata_filters: dict[str, Any] | None):
    return _metadata_filters_var.set(metadata_filters or None)


def reset_tool_metadata_filters(token) -> None:
    _metadata_filters_var.reset(token)


def get_tool_metadata_filters() -> dict[str, Any] | None:
    return _metadata_filters_var.get()
