from typing import Callable

from langchain.agents.middleware import wrap_model_call, wrap_tool_call, ModelRequest, ModelResponse
from langchain_core.messages import ToolMessage

from local_agent_api.core.llm import basic_model, advanced_model
from local_agent_api.runtime.context_builder import build_runtime_context
from local_agent_api.runtime.model_router import should_use_advanced_model_for_react
from local_agent_api.runtime.tool_registry import get_builtin_tools, get_tool_names

"""简单路径的中间件集合：工具兜底、长期记忆注入、动态模型路由。"""


# tool calling 错误处理
# 截胡工具调用，替他执行
# 如果报错就造一个空的返回去，不让agent崩掉
@wrap_tool_call
async def handle_tool_errors(request, handler):
    """捕获工具执行异常，以友好消息返回给 Agent 继续推理。"""
    try:
        return await handler(request)
    except Exception as e:
        return ToolMessage(
            content=f"工具调用失败，请换个方式提问或跳过此步骤。错误详情：{str(e)}",
            tool_call_id=request.tool_call["id"],
        )


# 向prompt注入长期记忆
# 模型调用前，根据user_id + 当前问题检索最相关事实，并注入 system prompt
@wrap_model_call
async def inject_runtime_context(
    request: ModelRequest,
    handler: Callable,
) -> ModelResponse:
    """
    每次 LLM 调用前，统一注入 persona / 手动提示词 / skills / 长期记忆 / Markdown 记忆。
    """
    user_id = request.state.get("user_id", "")
    messages = request.state.get("messages", [])
    human_msgs = [
        m for m in messages
        if hasattr(m, "type") and m.type == "human"
    ]
    if human_msgs:
        query = str(human_msgs[-1].content)
        runtime_context = build_runtime_context(
            query=query,
            user_id=user_id,
            plan_mode=request.state.get("plan_mode"),
            available_tool_names=get_tool_names(),
        )
        current_prompt = request.system_prompt or ""
        new_prompt = current_prompt + "\n\n" + runtime_context.system_prompt
        request = request.override(system_prompt=new_prompt)
    return await handler(request)


# 动态模型路由
@wrap_model_call
async def dynamic_model_selection(
    request: ModelRequest,
    handler: Callable
) -> ModelResponse:
    """
    基于用户问题的复杂度和对话轮次，动态选择使用本地 Qwen 还是 云端 DeepSeek。
    这一步将在中间件层拦截模型请求并进行重定向。

    注意：若消息历史中已包含 ToolMessage（即本轮是工具调用后的续算），
    则不切换模型，保持上一轮的模型继续执行，避免 400 invalid_request_error。
    """
    from langchain_core.messages import ToolMessage
    messages = request.state.get("messages", [])

    # 关键保护：工具调用续算(含ToolMessage)时，禁止切换模型
    in_tool_continuation = any(isinstance(m, ToolMessage) for m in messages)
    if in_tool_continuation:
        return await handler(request)

    use_advanced = should_use_advanced_model_for_react(messages, request.state.get("plan_mode"))

    if use_advanced:
        print("🔀 [路由判定]：复杂整合/高质量需求 -> 切换至 DeepSeek")
        model = advanced_model.bind_tools(get_builtin_tools())
    else:
        print("🔀 [路由判定]：简单对话 -> 降级为本地 Qwen")
        model = basic_model.bind_tools(get_builtin_tools())

    return await handler(request.override(model=model))
