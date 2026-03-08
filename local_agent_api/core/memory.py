"""
长期记忆管理器 —— 基于 PostgreSQL + pgvector

存储跨会话、跨重启的用户级语义记忆（姓名、偏好、重要事项等关键事实）。
工作原理：
  写入：每轮对话结束后，用 LLM 从对话历史中提取关键事实，以向量形式存入 pg。
  读取：每次 LLM 调用前，用当前问题做语义搜索，把最相关的记忆注入 system_prompt。

与短期记忆（MemorySaver/PostgresSaver）的区别：
  短期记忆 = 同一 thread_id 内的完整对话历史（有 token 上限）
  长期记忆 = 跨 thread_id 提炼出的精华事实（永久保存、按需检索）
"""

import uuid
from typing import Optional

from langchain_postgres import PGVector
from langchain_core.documents import Document

from local_agent_api.core.config import settings
from local_agent_api.core.embedding import get_embedding_model


class LongTermMemoryManager:
    """
    基于 pgvector 的长期记忆管理器（懒加载单例）。

    初始化时不立即连接数据库，首次 save/search 时才建立连接，
    确保 settings.POSTGRES_URL 未配置时不会在启动阶段崩溃。
    """

    def __init__(self):
        self._store: Optional[PGVector] = None

    @property
    def store(self) -> PGVector:
        if self._store is None:
            if not settings.POSTGRES_URL:
                raise RuntimeError(
                    "POSTGRES_URL 未配置，无法使用长期记忆。"
                    "请在 .env 中添加 POSTGRES_URL=postgresql://... 后重启。"
                )
            # langchain-postgres 要求 psycopg3 连接串格式
            conn = settings.POSTGRES_URL
            if conn.startswith("postgresql://") and "+psycopg" not in conn:
                conn = conn.replace("postgresql://", "postgresql+psycopg://", 1)

            self._store = PGVector(
                connection=conn,
                collection_name="agent_long_term_memory",
                embeddings=get_embedding_model(),
                use_jsonb=True,
                # 首次实例化时自动建表；pgvector extension 需手动执行：
                #   CREATE EXTENSION IF NOT EXISTS vector;
            )
        return self._store

    def save(self, user_id: str, content: str) -> None:
        """持久化一条记忆（幂等，每次生成唯一 UUID 作为 id）"""
        doc = Document(
            page_content=content,
            metadata={"user_id": user_id},
        )
        self.store.add_documents([doc], ids=[str(uuid.uuid4())])

    def search(self, user_id: str, query: str, k: int = 3) -> list[str]:
        """
        语义搜索：返回与 query 最相关的 k 条记忆，按 user_id 隔离。
        pgvector 用余弦相似度排序，确保检索结果与当前问题最相关。
        """
        results = self.store.similarity_search(
            query,
            k=k,
            filter={"user_id": user_id},
        )
        return [r.page_content for r in results]


# 全局单例（懒加载，POSTGRES_URL 未配置时 save/search 会抛 RuntimeError 被上层 try/except 吞掉）
long_term_memory = LongTermMemoryManager()
