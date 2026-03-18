from __future__ import annotations

"""统一模型路由：默认本地模型，复杂整合与规划走 API。"""

from langchain_core.messages import ToolMessage


HIGH_SIGNAL_KEYWORDS = {
    "compare": ("比较", "对比", "difference", "compare"),
    "extract": ("提取", "抽取", "extract"),
    "report": ("报告", "report", "总结", "summary"),
    "research": ("研究", "调研", "research"),
}


def _latest_user_query(messages) -> str:
    human_messages = [m for m in messages if getattr(m, "type", "") == "human"]
    return str(human_messages[-1].content) if human_messages else ""


def should_encourage_pae(query: str, plan_mode: str | None, message_count: int) -> bool:
    """是否在 prompt 中显式鼓励模型调用 PAE。"""
    score = 0
    if len(query) >= 120:
        score += 2
    if message_count >= 6:
        score += 1
    if (plan_mode or "auto").lower() in {"compare", "extract", "report", "research", "strict_plan"}:
        score += 2
    if any(keyword in query for words in HIGH_SIGNAL_KEYWORDS.values() for keyword in words):
        score += 1
    if "\n" in query:
        score += 1
    return score >= 2


def should_use_advanced_model_for_react(messages, plan_mode: str | None) -> bool:
    """借鉴级联路由思路，用多特征评分决定是否升级云端模型。"""
    query = _latest_user_query(messages)
    mode = (plan_mode or "auto").lower()
    score = 0

    if len(query) >= 180:
        score += 2
    elif len(query) >= 100:
        score += 1

    if len(messages) >= 8:
        score += 2
    elif len(messages) >= 4:
        score += 1

    if mode in {"compare", "extract", "report", "research", "strict_plan"}:
        score += 2

    if any(keyword in query for words in HIGH_SIGNAL_KEYWORDS.values() for keyword in words):
        score += 1

    tool_messages = [m for m in messages if isinstance(m, ToolMessage)]
    if tool_messages:
        latest_tool_content = str(tool_messages[-1].content)
        if len(latest_tool_content) >= 1200:
            score += 2
        elif len(latest_tool_content) >= 400:
            score += 1

    return score >= 3


def select_workflow_model_stage(stage: str, plan_mode: str | None) -> str:
    """决定 PAE 各阶段默认使用的模型级别。"""
    mode = (plan_mode or "auto").lower()
    if stage == "planner":
        return "advanced"
    if stage == "synthesizer":
        return "advanced" if mode in {"compare", "extract", "report", "research", "strict_plan"} else "advanced"
    if stage == "analysis":
        return "advanced" if mode in {"compare", "extract", "report", "research", "strict_plan"} else "basic"
    return "basic"
