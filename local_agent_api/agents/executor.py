from __future__ import annotations

"""执行 planner 生成的步骤：按 capability 分发工具，而不是只做 RAG。"""

from local_agent_api.agents.state import OrchestratorState, StepResult
from local_agent_api.core.llm import advanced_model, basic_model
from local_agent_api.runtime.model_router import select_workflow_model_stage
from local_agent_api.runtime.tool_registry import INTERNAL_TOOL_HANDLERS
from local_agent_api.services.tool_context import set_tool_request_context, reset_tool_request_context


def _build_step_query(user_query: str, step_goal: str) -> str:
    return f"{user_query}\n\n请优先完成该子任务：{step_goal}"


async def _run_analysis_step(state: OrchestratorState, step_query: str, step_goal: str) -> str:
    model_level = select_workflow_model_stage("analysis", state.get("plan_mode"))
    model = advanced_model if model_level == "advanced" else basic_model
    prompt = (
        "你正在执行计划中的一个分析步骤。\n"
        f"原始问题：{state['messages'][-1].content if state.get('messages') else ''}\n"
        f"当前子目标：{step_goal}\n"
        f"子任务查询：{step_query}\n"
        "请给出简洁、结构化的中间结论；若证据不足请明确说明。"
    )
    response = await model.ainvoke(prompt)
    return response.content.strip()


async def executor_node(state: OrchestratorState) -> OrchestratorState:
    """逐步执行计划，并把工具结果或分析结果写回状态。"""
    plan = state.get("plan", [])
    user_query = str(state["messages"][-1].content) if state.get("messages") else ""
    results: list[StepResult] = []
    collected_docs = []
    citations: list[dict] = list(state.get("citations", []))

    context_tokens = set_tool_request_context(
        thread_id=state.get("thread_id", "default"),
        user_id=state.get("user_id", ""),
        plan_mode=state.get("plan_mode"),
        metadata_filters=state.get("metadata_filters"),
    )
    try:
        for step in plan:
            capability = step.get("required_capability", "rag_search")
            step_query = _build_step_query(user_query, step["goal"])
            try:
                if capability in INTERNAL_TOOL_HANDLERS:
                    evidence, artifact = INTERNAL_TOOL_HANDLERS[capability](step_query)
                    status = "completed" if evidence else "partial"
                    if isinstance(artifact, dict):
                        collected_docs.extend([item for item in artifact.get("docs", []) if hasattr(item, "metadata")])
                        citations.extend(artifact.get("citations", []))
                    elif isinstance(artifact, list):
                        collected_docs.extend([item for item in artifact if hasattr(item, "metadata")])
                elif capability == "analysis":
                    evidence = await _run_analysis_step(state, step_query, step["goal"])
                    status = "completed" if evidence else "partial"
                elif capability == "synthesis":
                    evidence = "最终综合结论将在 synthesizer 阶段生成。"
                    status = "completed"
                else:
                    evidence, artifact = INTERNAL_TOOL_HANDLERS["rag_search"](step_query)
                    status = "completed" if evidence else "partial"
                    if isinstance(artifact, list):
                        collected_docs.extend([item for item in artifact if hasattr(item, "metadata")])

                step["status"] = status
                results.append(
                    {
                        "step_id": step["step_id"],
                        "goal": step["goal"],
                        "query": step_query,
                        "evidence": evidence or "未获得有效结果。",
                        "capability": capability,
                        "status": status,
                    }
                )
            except Exception as exc:
                step["status"] = "failed"
                results.append(
                    {
                        "step_id": step["step_id"],
                        "goal": step["goal"],
                        "query": step_query,
                        "evidence": f"步骤执行失败：{exc}",
                        "capability": capability,
                        "status": "failed",
                    }
                )
    finally:
        reset_tool_request_context(context_tokens)

    return {
        **state,
        "plan": plan,
        "step_results": results,
        "retrieved_docs": collected_docs,
        "citations": citations,
        "current_step": len(plan),
    }
