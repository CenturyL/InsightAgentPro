"""
agent_service.py — 智能体服务

设计要点：
1. 懒加载单例：_agent 在第一次请求或 lifespan 初始化时创建
2. Checkpointer 双轨：有 POSTGRES_URL → AsyncPostgresSaver（跨进程持久化）
                       无 POSTGRES_URL → MemorySaver（进程内短期记忆）
3. AgentState 携带 user_id，驱动长期记忆中间件按用户隔离读写 pgvector
4. 流结束后异步后台提取本轮对话要点存入 pgvector，不阻塞响应
"""
from __future__ import annotations

import asyncio
from typing import Any, AsyncGenerator, Optional
from typing_extensions import TypedDict

from langchain.agents import create_agent
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import add_messages
from langgraph.checkpoint.memory import MemorySaver
from local_agent_api.agents.orchestrator import build_synthesizer_prompt, orchestrator_graph
from local_agent_api.agents.router import is_complex_query
from local_agent_api.agents.state import OrchestratorState
from local_agent_api.agents.planner import planner_node
from local_agent_api.agents.executor import executor_node
from local_agent_api.agents.reflection import reflection_node
from local_agent_api.core.llm import basic_model, advanced_model
from local_agent_api.core.config import settings
from local_agent_api.core.middleware import (
    inject_long_term_memory,
    dynamic_model_selection,
    handle_tool_errors,
)
from local_agent_api.services.tools import AGENT_TOOLS


# ── AgentState：含 user_id 字段，中间件通过 request.state 读取 ───────────────
class AgentState(TypedDict):
    messages: list[BaseMessage]
    user_id: str  # 用于隔离每位用户的长期记忆


# ── 内部单例（懒加载） ─────────────────────────────────────────────────────────
_agent = None
_checkpointer = None
_connection_pool = None  # AsyncPostgresSaver 依赖的连接池


def _should_use_advanced_model_for_simple_path(query: str, message_count: int = 1) -> bool:
    """与 simple agent 路径的动态路由保持一致，用于向前端标注本轮回答的模型来源。"""
    if message_count > 2:
        return True
    if len(query) > 50:
        return True
    return any(
        keyword in query
        for keyword in [
            "总结",
            "分析",
            "比较",
            "对比",
            "政策",
            "招标",
            "投标",
            "公告",
            "提取",
            "报告",
            "公司内部",
            "请假",
            "WIFI",
            "时间",
            "几点",
        ]
    )

# 返回create_agent()
def _build_agent(checkpointer):
    """根据已初始化的 checkpointer 构建 Agent 单例。"""
    return create_agent(
        model=basic_model,
        tools=AGENT_TOOLS,
        middleware=[
            inject_long_term_memory,   # 长期记忆注入（pgvector 检索）
            dynamic_model_selection,   # 动态路由：根据 query 复杂度切换模型
            handle_tool_errors,        # P1-6：工具异常兜底，防止崩溃
        ],
        checkpointer=checkpointer,     # P1-7：多轮对话短期记忆
        state_schema=AgentState,       # 注册自定义 state，携带 user_id
        system_prompt=(
            "你是 InsightAgent，一名以政策通知、招投标公告、申报指南和附件分析为主的智能助手。"
            "你的默认职责是帮助用户做政策解读、公告检索、条件提取、差异比较和证据整理。"
            "如果用户询问你的身份，请明确说明你是面向政策与招投标分析的 Agent 平台，同时也兼容公司内部知识查询和时间查询等辅助功能。"
            "当问题需要文档证据、实时信息或公司内部专属信息时，必须优先调用提供给你的工具，禁止编造。"
        ),
    )

# 决定是内存还是数据库
async def initialize() -> None:
    """
    FastAPI lifespan 调用，初始化 Agent 及 Checkpointer。
    有 POSTGRES_URL 时使用 AsyncPostgresSaver，否则降级到 MemorySaver。
    """
    global _agent, _checkpointer, _connection_pool

    if settings.POSTGRES_URL:
        try:
            from psycopg_pool import AsyncConnectionPool
            from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

            _connection_pool = AsyncConnectionPool(
                conninfo=settings.POSTGRES_URL,
                max_size=10,
                open=False,
                # langgraph-checkpoint-postgres 的 setup() 内部执行
                # CREATE INDEX CONCURRENTLY，必须在 autocommit 模式下运行
                kwargs={"autocommit": True, "prepare_threshold": 0},
            )
            await _connection_pool.open()

            _checkpointer = AsyncPostgresSaver(_connection_pool)
            # 自动建表（checkpoints / checkpoint_writes 等 LangGraph 需要的表）
            await _checkpointer.setup()
            print("✅ [Checkpointer] 已连接 PostgreSQL，使用 AsyncPostgresSaver")
        except Exception as e:
            print(f"⚠️ [Checkpointer] PostgreSQL 连接失败（{e}），降级为 MemorySaver")
            _checkpointer = MemorySaver()
    else:
        _checkpointer = MemorySaver()
        print("ℹ️ [Checkpointer] 未配置 POSTGRES_URL，使用 MemorySaver（进程内短期记忆）")

    _agent = _build_agent(_checkpointer)
    print("✅ [Agent] 初始化完成")

# Fastapi结束进程时清理
async def cleanup() -> None:
    """FastAPI lifespan 退出时关闭连接池。"""
    global _connection_pool
    if _connection_pool:
        await _connection_pool.close()
        print("🔒 [Agent] 数据库连接池已关闭")

# 兜底用，正常情况下FastAPI await initialize() 已经实例化过了
def _get_agent():
    """同步获取 Agent 单例，若未初始化则使用 MemorySaver 兜底（开发便利）。"""
    global _agent, _checkpointer
    if _agent is None:
        _checkpointer = MemorySaver()
        _agent = _build_agent(_checkpointer)
    return _agent


async def _run_plan_and_execute(
    query: str,
    thread_id: str,
    user_id: str,
    task_mode: str | None = None,
    metadata_filters: dict[str, Any] | None = None,
) -> str:
    state: OrchestratorState = {
        "messages": [HumanMessage(content=query)],
        "user_id": user_id,
        "thread_id": thread_id,
        "task_mode": task_mode or "qa",
        "metadata_filters": metadata_filters or {},
        "is_complex": True,
    }
    result = await orchestrator_graph.ainvoke(state)
    return result.get("final_answer", "复杂任务执行完成，但未生成最终答案。")


def _truncate(text: str, limit: int = 120) -> str:
    clean = " ".join(text.split())
    return clean if len(clean) <= limit else clean[:limit] + "..."


async def _stream_synthesizer(state: OrchestratorState) -> AsyncGenerator[str, None]:
    prompt = build_synthesizer_prompt(state)
    yield "✍️ [答案生成] 正在组织最终答案...\n\n"
    try:
        async for chunk in advanced_model.astream(prompt):
            content = getattr(chunk, "content", "")
            if content:
                yield content
    except Exception as exc:
        fallback = await _run_plan_and_execute(
            query=str(state["messages"][-1].content) if state.get("messages") else "",
            thread_id=state.get("thread_id", "default"),
            user_id=state.get("user_id", ""),
            task_mode=state.get("task_mode"),
            metadata_filters=state.get("metadata_filters"),
        )
        yield f"\n\n⚠️ [答案生成] 流式生成失败，已回退到一次性生成：{exc}\n\n"
        yield fallback


async def _run_plan_and_execute_stream(
    query: str,
    thread_id: str,
    user_id: str,
    task_mode: str | None = None,
    metadata_filters: dict[str, Any] | None = None,
) -> AsyncGenerator[str, None]:
    state: OrchestratorState = {
        "messages": [HumanMessage(content=query)],
        "user_id": user_id,
        "thread_id": thread_id,
        "task_mode": task_mode or "qa",
        "metadata_filters": metadata_filters or {},
        "is_complex": True,
    }

    yield "> 模型来源：DeepSeek API\n\n"
    yield "📝 [任务规划] 正在生成执行计划...\n"
    state = await planner_node(state)
    plan = state.get("plan", [])
    if plan:
        plan_lines = "\n".join(f"- {step['step_id']}: {step['goal']}" for step in plan)
        yield f"✅ [任务规划] 已生成 {len(plan)} 个步骤：\n{plan_lines}\n\n"

    yield "🔎 [步骤执行] 正在逐步检索和执行任务...\n"
    state = await executor_node(state)
    for result in state.get("step_results", []):
        yield (
            f"🛠️ [步骤完成] {result['step_id']} | {result['status']} | "
            f"{_truncate(result['evidence'])}\n"
        )
    yield "\n"

    reflection_before = state.get("step_results", [])
    state = await reflection_node(state)
    reflection_after = state.get("step_results", [])
    if reflection_after != reflection_before:
        yield "🔁 [反思修正] 检测到未完成步骤，已尝试扩大召回或补充证据。\n"
        for result in reflection_after:
            if result["status"] in {"partial", "completed"}:
                yield (
                    f"📎 [反思结果] {result['step_id']} | {result['status']} | "
                    f"{_truncate(result['evidence'])}\n"
                )
        yield "\n"

    async for chunk in _stream_synthesizer(state):
        yield chunk


# ── 长期记忆后台提取 ─────────────────────────────────────────────────────────
async def _extract_and_save_memories(thread_id: str, user_id: str) -> None:
    """
    对话结束后，异步地从本轮对话中提取用户关键信息并存入 pgvector。
    使用 advanced_model 专门做摘要提取，不影响主流程延迟。
    """
    if not user_id or not settings.POSTGRES_URL:
        return
    try:
        agent = _get_agent()
        state = await agent.aget_state({"configurable": {"thread_id": thread_id}})
        messages = state.values.get("messages", [])

        # 只取最近 6 条消息（避免 token 超限）
        recent = messages[-6:] if len(messages) > 6 else messages
        conversation = "\n".join(
            f"{'用户' if isinstance(m, HumanMessage) else 'AI'}: {m.content}"
            for m in recent
            if hasattr(m, "content") and m.content
        )
        if not conversation.strip():
            return

        extraction_prompt = (
            "从以下对话中提取关于用户的关键信息，如偏好、身份、重要事项等。"
            "每行一条，只输出信息本身，不要编号或多余说明，无有效信息则输出空。\n\n"
            f"{conversation}"
        )
        response = await advanced_model.ainvoke(extraction_prompt)
        facts = [
            line.strip()
            for line in response.content.splitlines()
            if line.strip()
        ]

        from local_agent_api.core.memory import long_term_memory
        for fact in facts:
            long_term_memory.save(user_id, fact)
        if facts:
            print(f"💾 [长期记忆] 为 {user_id} 保存了 {len(facts)} 条记忆")
    except Exception as e:
        print(f"⚠️ [长期记忆] 记忆提取失败（{e}），跳过")


# ── 流式对话入口 ， router执行这里 ───────────────────────────────────────────────────────
async def get_agent_stream(
    query: str,
    thread_id: str = "default",
    user_id: str = "",
    task_mode: str | None = None,
    metadata_filters: dict[str, Any] | None = None,
) -> AsyncGenerator[str, None]:
    """
    运行智能体，流式返回回答 + 工具调用日志。

    thread_id：同一 ID 的请求共享对话历史（短期记忆）
    user_id  ：用户唯一标识，用于隔离长期记忆（pgvector）
    """
    agent = _get_agent()

    # user_id 随 state 输入，inject_long_term_memory 中间件会通过 request.state 读取
    inputs: AgentState = {
        "messages": [HumanMessage(content=query)],
        "user_id": user_id,
    }
    config = {"configurable": {"thread_id": thread_id}}

    should_plan, planning_reason = is_complex_query(query)
    if task_mode in {"compare", "extract", "report"}:
        should_plan = True
        planning_reason = f"task_mode={task_mode}"
    if should_plan:
        yield f"🧭 [任务路由] 检测到复杂任务，进入 Plan-and-Execute 模式。原因：{planning_reason}\n\n"
        async for chunk in _run_plan_and_execute_stream(
            query,
            thread_id,
            user_id,
            task_mode=task_mode,
            metadata_filters=metadata_filters,
        ):
            yield chunk
        if user_id:
            asyncio.ensure_future(_extract_and_save_memories(thread_id, user_id))
        return

    simple_model_label = (
        "DeepSeek API"
        if _should_use_advanced_model_for_simple_path(query, message_count=1)
        else "本地 Qwen（Ollama）"
    )
    yield f"> 模型来源：{simple_model_label}\n\n"

    stream_had_content = False

    async for event in agent.astream_events(inputs, config=config, version="v2"):
        kind = event["event"]

        if kind == "on_chat_model_stream":
            chunk_content = event["data"]["chunk"].content
            if chunk_content:
                stream_had_content = True
                yield chunk_content

        elif kind == "on_tool_start":
            tool_name = event["name"]
            yield f"\n\n🛠️ [Agent思考] 决定调用工具：【{tool_name}】...\n"

        elif kind == "on_tool_end":
            tool_name = event["name"]
            yield f"\n✅ [Agent执行] 工具【{tool_name}】返回了结果，正在整理答案...\n\n"

    # 流结束后，异步后台提取记忆（不阻塞响应）
    if stream_had_content and user_id:
        asyncio.ensure_future(_extract_and_save_memories(thread_id, user_id))
