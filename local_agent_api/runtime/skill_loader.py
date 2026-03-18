from __future__ import annotations

"""按请求动态选择并装载 markdown skills。"""

from dataclasses import dataclass
from pathlib import Path

from local_agent_api.core.config import settings


@dataclass
class LoadedSkill:
    name: str
    content: str


def _skills_dir() -> Path:
    return Path(settings.WORKSPACE_ROOT) / "skills"


def _skill_paths() -> dict[str, Path]:
    skill_dir = _skills_dir()
    if not skill_dir.exists():
        return {}
    return {path.stem: path for path in skill_dir.glob("*.md")}


def select_skills(query: str, plan_mode: str | None) -> list[LoadedSkill]:
    """按 query 和 plan_mode 选择激活 skills。"""
    paths = _skill_paths()
    selected: list[str] = []
    if "general" in paths:
        selected.append("general")

    mode = (plan_mode or "auto").lower()
    if mode in {"compare", "strict_plan"} and "comparison" in paths:
        selected.append("comparison")
    if mode == "extract" and "extraction" in paths:
        selected.append("extraction")
    if mode in {"report", "research"} and "research" in paths:
        selected.append("research")

    query_text = query.lower()
    if any(keyword in query_text for keyword in ["比较", "对比", "difference", "compare"]) and "comparison" in paths:
        selected.append("comparison")
    if any(keyword in query_text for keyword in ["提取", "抽取", "extract"]) and "extraction" in paths:
        selected.append("extraction")
    if any(keyword in query_text for keyword in ["报告", "总结", "research", "report", "调研"]) and "research" in paths:
        selected.append("research")

    loaded: list[LoadedSkill] = []
    seen = set()
    for name in selected:
        if name in seen:
            continue
        seen.add(name)
        try:
            content = paths[name].read_text(encoding="utf-8").strip()
        except Exception:
            continue
        if content:
            loaded.append(LoadedSkill(name=name, content=content[:1800]))
    return loaded


def format_skills(skills: list[LoadedSkill]) -> str:
    """把激活的 skills 统一转成 prompt 片段。"""
    if not skills:
        return ""
    sections = []
    for skill in skills:
        sections.append(f"### Skill: {skill.name}\n{skill.content}")
    return "【当前激活的 Skills】\n" + "\n\n".join(sections)
