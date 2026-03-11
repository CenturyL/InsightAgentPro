from __future__ import annotations

"""基于 ContextVar 的请求级工具上下文，避免使用全局共享状态。"""

from contextvars import ContextVar
from typing import Any


_metadata_filters_var: ContextVar[dict[str, Any] | None] = ContextVar(
    "tool_metadata_filters",
    default=None,
)


def set_tool_metadata_filters(metadata_filters: dict[str, Any] | None):
    """保存当前请求的 metadata_filters，供工具函数隐式复用。"""
    return _metadata_filters_var.set(metadata_filters or None)


def reset_tool_metadata_filters(token) -> None:
    """在流式输出结束后恢复上一个请求上下文。"""
    _metadata_filters_var.reset(token)


def get_tool_metadata_filters() -> dict[str, Any] | None:
    """在工具函数内部读取当前请求的 metadata_filters。"""
    return _metadata_filters_var.get()
