from __future__ import annotations

from dataclasses import dataclass

from local_agent_api.core.config import settings


HARD_PAE_KEYWORDS = (
    "比较",
    "对比",
    "分析",
    "报告",
    "调研",
    "研究",
    "提取",
    "抽取",
    "方案",
    "架构设计",
)


@dataclass
class RuntimeRequest:
    query: str
    thread_id: str
    user_id: str
    plan_mode: str | None
    model_choice: str
    metadata_filters: dict | None


def complexity_score(query: str, plan_mode: str | None) -> int:
    mode = (plan_mode or "auto").lower()
    score = 0
    if mode == "strict_plan":
        score += 6
    elif mode in {"compare", "extract", "report", "research"}:
        score += 4

    qlen = len(query)
    if qlen >= 180:
        score += 3
    elif qlen >= 120:
        score += 2
    elif qlen >= 70:
        score += 1

    if "\n" in query:
        score += 1
    if "、" in query or "和" in query or "以及" in query:
        score += 1
    if any(keyword in query for keyword in HARD_PAE_KEYWORDS):
        score += 3
    if any(keyword in query for keyword in ("步骤", "分步", "路线图", "方案", "先", "再", "最后")):
        score += 2
    return score


def classify_complexity(query: str, plan_mode: str | None) -> str:
    score = complexity_score(query, plan_mode)
    if score >= 6:
        return "high"
    if score >= 3:
        return "medium"
    return "low"


def recommended_action(query: str, plan_mode: str | None) -> str:
    return "run_plan_and_execute" if classify_complexity(query, plan_mode) in {"medium", "high"} else "direct_or_simple_tools"


def react_recursion_limit() -> int:
    return max(4, settings.REACT_MAX_TOOL_CALLS * 2)


def should_force_pae(query: str, plan_mode: str | None) -> bool:
    mode = (plan_mode or "auto").lower()
    if mode == "strict_plan":
        return True
    if mode in {"compare", "extract", "report", "research"}:
        return True
    return complexity_score(query, plan_mode) >= 6


def should_encourage_pae(query: str, plan_mode: str | None) -> bool:
    return classify_complexity(query, plan_mode) in {"medium", "high"}
