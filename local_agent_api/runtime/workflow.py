from __future__ import annotations

"""把现有 PAE 流程封装成可被主循环调用的高级子执行器。"""

from typing import Any, Callable

from langchain_core.messages import HumanMessage

from local_agent_api.agents.executor import executor_node
from local_agent_api.agents.orchestrator import build_synthesizer_prompt
from local_agent_api.agents.planner import planner_node
from local_agent_api.agents.reflection import reflection_node
from local_agent_api.agents.state import OrchestratorState
from local_agent_api.core.llm import advanced_model
from local_agent_api.runtime.context_builder import build_runtime_context
from local_agent_api.runtime.tool_registry import get_tool_names


async def run_plan_and_execute_once(
    query: str,
    thread_id: str,
    user_id: str,
    plan_mode: str | None = None,
    metadata_filters: dict[str, Any] | None = None,
    trace_sink: Callable[[str], None] | None = None,
) -> dict[str, Any]:
    """执行一次完整 PAE，并把 trace 和结果一起返回。"""
    runtime_context = build_runtime_context(
        query=query,
        user_id=user_id,
        plan_mode=plan_mode,
        available_tool_names=get_tool_names(),
        encourage_pae=True,
    )
    state: OrchestratorState = {
        "messages": [HumanMessage(content=query)],
        "user_id": user_id,
        "thread_id": thread_id,
        "plan_mode": plan_mode or "auto",
        "metadata_filters": metadata_filters or {},
        "is_complex": True,
        "runtime_system_prompt": runtime_context.system_prompt,
    }

    traces: list[str] = []

    def emit(line: str) -> None:
        traces.append(line)
        if trace_sink:
            trace_sink(line)

    emit("🧭 [计划模式] 已进入 Plan-and-Execute 子流程。")
    state = await planner_node(state)
    plan = state.get("plan", [])
    if plan:
        emit("📝 [任务规划] 已生成执行计划：")
        for step in plan:
            emit(f"- {step['step_id']} | {step['required_capability']} | {step['goal']}")

    state = await executor_node(state)
    for result in state.get("step_results", []):
        emit(f"🛠️ [步骤执行] {result['step_id']} | {result['status']} | {result['goal']}")

    before = state.get("step_results", [])
    state = await reflection_node(state)
    after = state.get("step_results", [])
    if after != before:
        emit("🔁 [反思修正] 已对证据不足或失败步骤进行补救。")
        for result in after:
            emit(f"📎 [反思结果] {result['step_id']} | {result['status']}")

    emit("✍️ [答案生成] 正在生成最终结果。")
    prompt = build_synthesizer_prompt(state)
    response = await advanced_model.ainvoke(prompt)
    final_answer = response.content.strip()
    state["final_answer"] = final_answer
    return {
        "mode": "plan_and_execute",
        "plan": plan,
        "step_results": state.get("step_results", []),
        "citations": state.get("citations", []),
        "trace": traces,
        "final_answer": final_answer,
    }
