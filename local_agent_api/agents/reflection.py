from __future__ import annotations

"""对第一轮执行中证据不足或失败的步骤做补救重试。"""

from local_agent_api.agents.state import OrchestratorState
from local_agent_api.services.tool_context import set_tool_request_context, reset_tool_request_context


def _needs_reflection(state: OrchestratorState) -> bool:
    """只有至少一个步骤是 partial/failed 时才进入 reflection。"""
    results = state.get("step_results", [])
    if not results:
        return False
    return any(result["status"] in {"failed", "partial"} for result in results)


async def reflection_node(state: OrchestratorState) -> OrchestratorState:
    """扩大召回范围重试弱步骤，并同步更新 plan 与 step_results。"""
    if not _needs_reflection(state):
        return state

    updated_results = []
    updated_plan = list(state.get("plan", []))
    citations = list(state.get("citations", []))
    retrieved_docs = list(state.get("retrieved_docs", []))

    context_tokens = set_tool_request_context(
        thread_id=state.get("thread_id", "default"),
        user_id=state.get("user_id", ""),
        plan_mode=state.get("plan_mode"),
        model_choice=state.get("model_choice", "local_qwen"),
        metadata_filters=state.get("metadata_filters"),
        in_pae=True,
    )
    try:
        from local_agent_api.runtime.tool_registry import INTERNAL_TOOL_HANDLERS
        for result in state.get("step_results", []):
            if result["status"] == "completed":
                updated_results.append(result)
                continue

            capability = result.get("capability", "rag_search")
            retry_query = f"{result['goal']}\n请扩大召回范围，优先补充可直接回答该步骤的证据。"
            try:
                if capability in {"rag_search", "rag_search_uploaded", "web_search", "search_long_term_memory"}:
                    evidence, artifact = INTERNAL_TOOL_HANDLERS[capability](retry_query)
                    if evidence:
                        result = {
                            **result,
                            "query": retry_query,
                            "evidence": evidence,
                            "status": "completed",
                        }
                        if isinstance(artifact, dict):
                            retrieved_docs.extend([item for item in artifact.get("docs", []) if hasattr(item, "metadata")])
                            citations.extend(artifact.get("citations", []))
                        elif isinstance(artifact, list):
                            retrieved_docs.extend([item for item in artifact if hasattr(item, "metadata")])
                    else:
                        result = {
                            **result,
                            "query": retry_query,
                            "status": "partial",
                            "evidence": result["evidence"] + "\n\n[reflection] 扩大召回后仍未找到足够证据。",
                        }
                else:
                    result = {
                        **result,
                        "status": "partial",
                        "evidence": result["evidence"] + "\n\n[reflection] 当前步骤类型不做自动补救。",
                    }
            except Exception as exc:
                result = {
                    **result,
                    "status": "failed",
                    "evidence": result["evidence"] + f"\n\n[reflection] 重试失败：{exc}",
                }

            updated_results.append(result)

            for plan_step in updated_plan:
                if plan_step["step_id"] == result["step_id"]:
                    plan_step["status"] = result["status"]
                    break
    finally:
        reset_tool_request_context(context_tokens)

    return {
        **state,
        "plan": updated_plan,
        "step_results": updated_results,
        "citations": citations,
        "retrieved_docs": retrieved_docs,
    }
