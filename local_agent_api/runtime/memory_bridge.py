from __future__ import annotations

"""统一桥接短期/长期/Markdown 显式记忆。"""

from pathlib import Path
from typing import Iterable

from local_agent_api.core.config import settings
from local_agent_api.core.memory import long_term_memory


def search_long_term_memory_text(user_id: str, query: str, k: int = 3) -> list[str]:
    """检索用户级长期记忆，失败时静默返回空。"""
    if not user_id or not settings.POSTGRES_URL:
        return []
    try:
        return long_term_memory.search(user_id, query, k=k)
    except Exception:
        return []


def _markdown_memory_files() -> list[Path]:
    root = Path(settings.WORKSPACE_ROOT)
    candidates: list[Path] = []
    memory_file = root / "memory" / "MEMORY.md"
    if memory_file.exists():
        candidates.append(memory_file)
    daily_dir = root / "memory" / "daily"
    if daily_dir.exists():
        candidates.extend(sorted(daily_dir.glob("*.md")))
    return candidates


def _score_markdown(query: str, content: str) -> int:
    tokens = [token for token in query.replace("\n", " ").split() if len(token) >= 2]
    if not tokens:
        return 0
    return sum(1 for token in tokens if token in content)


def search_markdown_memory_text(query: str, k: int = 2) -> list[str]:
    """对 Markdown 记忆做轻量关键词检索，返回片段文本。"""
    hits: list[tuple[int, str]] = []
    for file_path in _markdown_memory_files():
        try:
            content = file_path.read_text(encoding="utf-8").strip()
        except Exception:
            continue
        if not content:
            continue
        score = _score_markdown(query, content)
        if score <= 0:
            continue
        snippet = content[:900]
        hits.append((score, f"[{file_path.name}]\n{snippet}"))
    hits.sort(key=lambda item: item[0], reverse=True)
    return [text for _, text in hits[:k]]


def format_memory_sections(
    long_term_items: Iterable[str],
    markdown_items: Iterable[str],
) -> str:
    """把两类记忆统一格式化成 prompt 片段。"""
    parts: list[str] = []
    long_term_items = list(long_term_items)
    markdown_items = list(markdown_items)
    if long_term_items:
        parts.append("【长期记忆】\n" + "\n".join(f"- {item}" for item in long_term_items))
    if markdown_items:
        parts.append("【显式记忆（Markdown）】\n" + "\n\n".join(markdown_items))
    return "\n\n".join(parts)
