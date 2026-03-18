from __future__ import annotations

"""统一 runtime 入口。"""

from dataclasses import dataclass

from local_agent_api.core.config import settings
from local_agent_api.runtime.context_builder import build_runtime_context
from local_agent_api.runtime.model_router import (
    should_encourage_pae,
    should_use_advanced_model_for_react,
)
from local_agent_api.runtime.tool_registry import get_tool_names


@dataclass
class RuntimeRequest:
    query: str
    thread_id: str
    user_id: str
    plan_mode: str | None
    metadata_filters: dict | None


def build_runtime_prompt(request: RuntimeRequest, messages) -> str:
    """为 ReAct 主循环构建最终动态 system prompt。"""
    tool_names = get_tool_names()
    context = build_runtime_context(
        query=request.query,
        user_id=request.user_id,
        plan_mode=request.plan_mode,
        available_tool_names=tool_names,
        encourage_pae=should_encourage_pae(request.query, request.plan_mode, len(messages)),
    )
    return context.system_prompt


def choose_react_model_label(messages, plan_mode: str | None) -> str:
    """供前端 trace 展示当前模型来源。"""
    return "DeepSeek API" if should_use_advanced_model_for_react(messages, plan_mode) else "本地 Qwen（Ollama）"


def react_recursion_limit() -> int:
    """返回主循环的最大递归/工具调用上限。"""
    return max(4, settings.REACT_MAX_TOOL_CALLS * 2)
