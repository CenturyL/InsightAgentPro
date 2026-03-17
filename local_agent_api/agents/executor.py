from __future__ import annotations

"""执行 planner 生成的步骤，核心动作是调用统一检索链获取证据。"""

from local_agent_api.agents.state import OrchestratorState, StepResult
from local_agent_api.retrieval.pipeline import retrieve_knowledge_bundle


def _build_step_query(user_query: str, step_goal: str) -> str:
    """把宽泛用户目标改写成更聚焦的子任务检索 query。"""
    return f"{user_query}\n\n请优先完成该子任务：{step_goal}"


# 对每个 step 构造更具体的检索 query，然后检索
async def executor_node(state: OrchestratorState) -> OrchestratorState:
    """逐步执行计划，并把步骤级证据写回状态。

    当前项目里的 executor 以检索为中心：每个 step 都会被改写成一个更窄
    的 query，再调用统一 retrieval bundle 拿回文档、上下文和 citations，
    供后续 reflection 与 synthesizer 使用。
    """
    # 先取每个step&原始提问，再定义变量
    plan = state.get("plan", [])
    user_query = str(state["messages"][-1].content) if state.get("messages") else ""
    results: list[StepResult] = []
    collected_docs = []
    citations: list[dict] = []

    for step in plan:
        # 拼 原始query + step query
        step_query = _build_step_query(user_query, step["goal"])
        try:
            # 调用统一检索链
            bundle = retrieve_knowledge_bundle(
                step_query,
                k=3,
                metadata_filters=state.get("metadata_filters"),
            )
            # 取出检索结果&拼到result
            evidence = bundle.context_text if bundle.docs else "未检索到足够证据。"
            status = "completed" if bundle.docs else "partial"
            step["status"] = status
            results.append(
                {
                    "step_id": step["step_id"],
                    "goal": step["goal"],
                    "query": step_query,
                    "evidence": evidence, # Reflection用
                    "status": status,
                }
            )
            collected_docs.extend(bundle.docs)
            citations.extend(bundle.citations)
        except Exception as exc:
            step["status"] = "failed"
            results.append(
                {
                    "step_id": step["step_id"],
                    "goal": step["goal"],
                    "query": step_query,
                    "evidence": f"步骤执行失败：{exc}",
                    "status": "failed",
                }
            )

    return {
        **state,
        "plan": plan,
        "step_results": results,
        "retrieved_docs": collected_docs,
        "citations": citations,
        "current_step": len(plan),
    }
