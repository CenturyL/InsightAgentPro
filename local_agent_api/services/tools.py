"""兼容层：统一从 runtime.tool_registry 暴露工具。"""

from local_agent_api.runtime.tool_registry import (
    get_builtin_tools,
    get_tool_descriptions,
    get_tool_names,
    get_current_time,
    rag_search,
    rag_search_uploaded,
    run_plan_and_execute,
    search_long_term_memory,
    web_search,
)


AGENT_TOOLS = get_builtin_tools()

__all__ = [
    "AGENT_TOOLS",
    "get_current_time",
    "get_tool_descriptions",
    "get_tool_names",
    "rag_search",
    "rag_search_uploaded",
    "run_plan_and_execute",
    "search_long_term_memory",
    "web_search",
]
