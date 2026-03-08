from __future__ import annotations

COMPLEX_KEYWORDS = (
    "比较",
    "对比",
    "分析",
    "报告",
    "梳理",
    "提取",
    "抽取",
    "风险",
    "多份",
    "多个",
    "汇总",
    "表格",
    "步骤",
)


def is_complex_query(query: str) -> tuple[bool, str]:
    query = (query or "").strip()
    if len(query) >= 60:
        return True, "query length exceeds complex-task threshold"
    matched = [kw for kw in COMPLEX_KEYWORDS if kw in query]
    if matched:
        return True, f"matched complex keywords: {', '.join(matched)}"
    return False, "simple qa path"


def complexity_router_node(state: dict) -> dict:
    latest_query = state["messages"][-1].content if state.get("messages") else ""
    is_complex, reason = is_complex_query(str(latest_query))
    return {
        **state,
        "is_complex": is_complex,
        "planning_reason": reason,
    }
