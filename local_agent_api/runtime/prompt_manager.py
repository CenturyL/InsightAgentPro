from __future__ import annotations

"""统一拼装 system prompt、人格、手动提示词和工具策略。"""

from pathlib import Path

from local_agent_api.core.config import settings
from local_agent_api.runtime.mcp_loader import load_mcp_context
from local_agent_api.runtime.skill_loader import LoadedSkill, format_skills


def _read_optional(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8").strip()
    except Exception:
        return ""


def load_persona_sections() -> str:
    """读取 persona 文件。"""
    root = Path(settings.WORKSPACE_ROOT)
    persona_candidates = [
        root / "persona" / "AGENTS.md",
        root / "persona" / "SOUL.md",
        root / "AGENTS.md",
        root / "SOUL.md",
    ]
    sections: list[str] = []
    for path in persona_candidates:
        content = _read_optional(path)
        if content:
            sections.append(f"[{path.name}]\n{content[:1800]}")
    if not sections:
        return ""
    return "【Persona / 角色约束】\n" + "\n\n".join(sections)


def load_manual_prompt() -> str:
    """读取 workspace 级手动提示词。"""
    root = Path(settings.WORKSPACE_ROOT)
    candidates = [
        root / "prompts" / "MANUAL_PROMPT.md",
        root / "MANUAL_PROMPT.md",
    ]
    for path in candidates:
        content = _read_optional(path)
        if content:
            return f"【手动提示词】\n{content[:1800]}"
    return ""


def build_runtime_system_prompt(
    query: str,
    plan_mode: str | None,
    skill_items: list[LoadedSkill],
    memory_text: str,
    available_tool_names: list[str],
    encourage_pae: bool,
) -> str:
    """构建主循环 ReAct 看到的最终系统提示词。"""
    persona_text = load_persona_sections()
    manual_prompt = load_manual_prompt()
    skills_text = format_skills(skill_items)
    mcp_text = load_mcp_context()
    mode = plan_mode or "auto"
    tool_text = "、".join(available_tool_names)
    pae_hint = (
        "当任务需要多步规划、多工具协作、复杂比较/提取/报告、或单轮工具调用无法稳定完成时，优先调用 run_plan_and_execute。"
        if encourage_pae
        else "当前仍可调用 run_plan_and_execute，但请先尝试直接完成任务。"
    )

    sections = [
        "你是 InsightAgentPro，一个通用智能体平台中的主执行智能体。",
        "你的能力来源于 tools、skills、记忆、workspace 提示词和 MCP 接入的外部能力。",
        f"当前 plan_mode={mode}。plan_mode 只表示规划/输出倾向，不表示强制路径。",
        f"当前可用工具：{tool_text}。",
        pae_hint,
        (
            "停止条件：如果已有足够证据回答问题、最近一次工具返回已提供完整答案候选、"
            "继续调用工具收益很低、或证据不足但已完成必要补救，则应直接收尾输出。"
        ),
        "禁止在证据不足时编造；能用工具和记忆解决的问题，优先用工具和记忆。",
    ]

    if persona_text:
        sections.append(persona_text)
    if manual_prompt:
        sections.append(manual_prompt)
    if skills_text:
        sections.append(skills_text)
    if mcp_text:
        sections.append(mcp_text)
    if memory_text:
        sections.append(memory_text)
    sections.append(f"【当前用户请求】\n{query}")
    return "\n\n".join(section for section in sections if section)
