from __future__ import annotations

"""统一构造最终送给 LLM 的动态上下文。"""

from dataclasses import dataclass

from local_agent_api.runtime.memory_bridge import (
    format_memory_sections,
    search_long_term_memory_text,
    search_markdown_memory_text,
)
from local_agent_api.runtime.prompt_manager import build_runtime_system_prompt
from local_agent_api.runtime.skill_loader import LoadedSkill, select_skills


@dataclass
class RuntimeContext:
    system_prompt: str
    skills: list[LoadedSkill]
    long_term_memories: list[str]
    markdown_memories: list[str]


def build_runtime_context(
    query: str,
    user_id: str,
    plan_mode: str | None,
    available_tool_names: list[str],
    encourage_pae: bool = True,
) -> RuntimeContext:
    """收集动态上下文并输出最终 system prompt。"""
    skill_items = select_skills(query, plan_mode)
    long_term_memories = search_long_term_memory_text(user_id, query, k=3)
    markdown_memories = search_markdown_memory_text(query, k=2)
    memory_text = format_memory_sections(long_term_memories, markdown_memories)
    system_prompt = build_runtime_system_prompt(
        query=query,
        plan_mode=plan_mode,
        skill_items=skill_items,
        memory_text=memory_text,
        available_tool_names=available_tool_names,
        encourage_pae=encourage_pae,
    )
    return RuntimeContext(
        system_prompt=system_prompt,
        skills=skill_items,
        long_term_memories=long_term_memories,
        markdown_memories=markdown_memories,
    )
