from __future__ import annotations

"""运行时资产读写：persona / markdown memory / skills。"""

from pathlib import Path

from local_agent_api.core.config import settings


def _workspace_root() -> Path:
    return Path(settings.WORKSPACE_ROOT)


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def _safe_skill_name(filename: str) -> str:
    name = Path(filename).name
    if not name.endswith(".md"):
        name = f"{name}.md"
    return name


def load_runtime_assets() -> dict:
    root = _workspace_root()
    persona_dir = root / "persona"
    memory_dir = root / "memory"
    skills_dir = root / "skills"

    skills: list[dict[str, str]] = []
    if skills_dir.exists():
        for file_path in sorted(skills_dir.glob("*.md")):
            skills.append(
                {
                    "filename": file_path.name,
                    "content": _read_text(file_path),
                }
            )

    return {
        "agents_md": _read_text(persona_dir / "AGENTS.md"),
        "soul_md": _read_text(persona_dir / "SOUL.md"),
        "memory_md": _read_text(memory_dir / "MEMORY.md"),
        "skills": skills,
    }


def save_runtime_assets(
    *,
    agents_md: str,
    soul_md: str,
    memory_md: str,
    skills: list[dict[str, str]],
) -> dict:
    root = _workspace_root()
    persona_dir = root / "persona"
    memory_dir = root / "memory"
    skills_dir = root / "skills"

    agents_path = persona_dir / "AGENTS.md"
    soul_path = persona_dir / "SOUL.md"
    memory_path = memory_dir / "MEMORY.md"

    _ensure_parent(agents_path)
    _ensure_parent(soul_path)
    _ensure_parent(memory_path)
    skills_dir.mkdir(parents=True, exist_ok=True)

    agents_path.write_text(agents_md or "", encoding="utf-8")
    soul_path.write_text(soul_md or "", encoding="utf-8")
    memory_path.write_text(memory_md or "", encoding="utf-8")

    for skill in skills:
        filename = _safe_skill_name(skill.get("filename", "untitled.md"))
        content = skill.get("content", "")
        (skills_dir / filename).write_text(content, encoding="utf-8")

    return load_runtime_assets()
