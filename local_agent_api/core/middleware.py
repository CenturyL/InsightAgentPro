from typing import Callable

from langchain.agents.middleware import ModelRequest, ModelResponse, wrap_model_call, wrap_tool_call
from langchain_core.messages import ToolMessage

from local_agent_api.core.llm import get_model_by_choice
from local_agent_api.runtime.context_builder import build_runtime_context
from local_agent_api.runtime.engine import should_encourage_pae
from local_agent_api.runtime.tool_registry import get_builtin_tools, get_tool_names


@wrap_tool_call
async def handle_tool_errors(request, handler):
    try:
        return await handler(request)
    except Exception as e:
        return ToolMessage(
            content=f"工具调用失败，请换个方式提问或跳过此步骤。错误详情：{str(e)}",
            tool_call_id=request.tool_call["id"],
        )


@wrap_model_call
async def inject_runtime_context(
    request: ModelRequest,
    handler: Callable,
) -> ModelResponse:
    user_id = request.state.get("user_id", "")
    messages = request.state.get("messages", [])
    human_msgs = [m for m in messages if hasattr(m, "type") and m.type == "human"]
    if human_msgs:
        query = str(human_msgs[-1].content)
        runtime_context = build_runtime_context(
            query=query,
            user_id=user_id,
            plan_mode=request.state.get("plan_mode"),
            available_tool_names=get_tool_names(),
            encourage_pae=should_encourage_pae(query, request.state.get("plan_mode")),
        )
        current_prompt = request.system_prompt or ""
        request = request.override(system_prompt=current_prompt + "\n\n" + runtime_context.system_prompt)
    return await handler(request)


@wrap_model_call
async def bind_selected_model(
    request: ModelRequest,
    handler: Callable,
) -> ModelResponse:
    model_choice = request.state.get("model_choice", "local_qwen")
    model = get_model_by_choice(model_choice).bind_tools(get_builtin_tools())
    return await handler(request.override(model=model))
