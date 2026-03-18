from __future__ import annotations

"""读取 workspace 中的 MCP 能力说明，供 prompt 注入。"""

from pathlib import Path

from local_agent_api.core.config import settings


def load_mcp_context() -> str:
    """读取 MCP 说明文件。若未配置，返回空。"""
    root = Path(settings.WORKSPACE_ROOT)
    candidates = [
        root / "mcp" / "TOOLS.md",
        root / "mcp" / "tools.md",
    ]
    for path in candidates:
        try:
            content = path.read_text(encoding="utf-8").strip()
        except Exception:
            continue
        if content:
            return f"【MCP 能力说明】\n{content[:1800]}"
    return ""
