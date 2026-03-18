"""
agent_service.py — 智能体服务

V2 设计：
1. 唯一主循环：ReAct
2. PAE 作为高级工具 run_plan_and_execute 被主循环调用
3. runtime 统一提供动态 prompt、模型路由、工具上下文
4. thread_id 仍驱动短期记忆，user_id 驱动长期记忆写回
"""
from __future__ import annotations

import asyncio
from typing import Any, AsyncGenerator, Optional
from typing_extensions import TypedDict

from langchain.agents import create_agent
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from local_agent_api.core.config import settings
from local_agent_api.core.llm import basic_model, advanced_model
from local_agent_api.core.middleware import (
    dynamic_model_selection,
    handle_tool_errors,
    inject_runtime_context,
)
from local_agent_api.runtime.engine import (
    RuntimeRequest,
    build_runtime_prompt,
    choose_react_model_label,
    react_recursion_limit,
)
from local_agent_api.services.tool_context import (
    drain_tool_trace,
    reset_tool_request_context,
    set_tool_request_context,
)
from local_agent_api.services.tools import AGENT_TOOLS


class AgentState(TypedDict):
    messages: list[BaseMessage]
    user_id: str
    plan_mode: str


_agent = None
_checkpointer = None
_connection_pool = None


def _build_agent(checkpointer):
    """构建唯一主循环 Agent。"""
    return create_agent(
        model=basic_model,
        tools=AGENT_TOOLS,
        middleware=[
            inject_runtime_context,
            dynamic_model_selection,
            handle_tool_errors,
        ],
        checkpointer=checkpointer,
        state_schema=AgentState,
        system_prompt=(
            "你是 InsightAgentPro，一个通用智能体平台中的主执行智能体。"
            "默认先直接解决问题；当任务需要多步规划、多工具协作、复杂比较/提取/报告时，"
            "主动调用 run_plan_and_execute。"
        ),
    )


async def initialize() -> None:
    """初始化 Agent 及 checkpointer。"""
    global _agent, _checkpointer, _connection_pool

    if settings.POSTGRES_URL:
        try:
            from psycopg_pool import AsyncConnectionPool
            from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

            _connection_pool = AsyncConnectionPool(
                conninfo=settings.POSTGRES_URL,
                max_size=10,
                open=False,
                kwargs={"autocommit": True, "prepare_threshold": 0},
            )
            await _connection_pool.open()

            _checkpointer = AsyncPostgresSaver(_connection_pool)
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


async def cleanup() -> None:
    """关闭数据库连接池。"""
    global _connection_pool
    if _connection_pool:
        await _connection_pool.close()
        print("🔒 [Agent] 数据库连接池已关闭")


def _get_agent():
    """同步获取 Agent 单例。"""
    global _agent, _checkpointer
    if _agent is None:
        _checkpointer = MemorySaver()
        _agent = _build_agent(_checkpointer)
    return _agent


async def _extract_and_save_memories(thread_id: str, user_id: str) -> None:
    """对话结束后，异步提取长期记忆。"""
    if not user_id or not settings.POSTGRES_URL:
        return
    try:
        agent = _get_agent()
        state = await agent.aget_state({"configurable": {"thread_id": thread_id}})
        messages = state.values.get("messages", [])
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
        facts = [line.strip() for line in response.content.splitlines() if line.strip()]

        from local_agent_api.core.memory import long_term_memory
        for fact in facts:
            long_term_memory.save(user_id, fact)
        if facts:
            print(f"💾 [长期记忆] 为 {user_id} 保存了 {len(facts)} 条记忆")
    except Exception as e:
        print(f"⚠️ [长期记忆] 记忆提取失败（{e}），跳过")


async def get_agent_stream(
    query: str,
    thread_id: str = "default",
    user_id: str = "",
    plan_mode: str | None = None,
    metadata_filters: dict[str, Any] | None = None,
) -> AsyncGenerator[str, None]:
    """
    唯一智能体主入口：始终走 ReAct 主循环，必要时由模型自行调用 run_plan_and_execute。
    """
    agent = _get_agent()
    request = RuntimeRequest(
        query=query,
        thread_id=thread_id,
        user_id=user_id,
        plan_mode=plan_mode or "auto",
        metadata_filters=metadata_filters or {},
    )
    context_tokens = set_tool_request_context(
        thread_id=thread_id,
        user_id=user_id,
        plan_mode=request.plan_mode,
        metadata_filters=request.metadata_filters,
    )
    inputs: AgentState = {
        "messages": [HumanMessage(content=query)],
        "user_id": user_id,
        "plan_mode": request.plan_mode,
    }
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": react_recursion_limit(),
    }

    try:
        model_label = choose_react_model_label(inputs["messages"], request.plan_mode)
        yield f"> 模型来源：自动路由（当前起始倾向：{model_label}）\n\n"
        yield f"🧠 [主循环] 已进入 ReAct 主循环。plan_mode={request.plan_mode}\n\n"

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
                yield f"\n\n🛠️ [工具调用] 决定调用工具：【{tool_name}】...\n"

            elif kind == "on_tool_end":
                tool_name = event["name"]
                if tool_name == "run_plan_and_execute":
                    for line in drain_tool_trace():
                        yield f"{line}\n"
                yield f"\n✅ [工具完成] 工具【{tool_name}】执行完成，正在继续推理...\n\n"

        if stream_had_content and user_id:
            asyncio.ensure_future(_extract_and_save_memories(thread_id, user_id))
    finally:
        reset_tool_request_context(context_tokens)
