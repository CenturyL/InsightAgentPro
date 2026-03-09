from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from local_agent_api.core.config import settings

# 采用单例模式缓存模型，避免每次调用都重新加载（模型大约百兆大小）
_embedding_instance = None
_reranker_instance = None


def _resolve_device(preferred: str) -> str:
    """将 .env 中的设备配置解析成可用设备，支持 auto / cpu / mps / cuda。"""
    preferred = (preferred or "auto").strip().lower()
    if preferred != "auto":
        return preferred

    try:
        import torch

        if torch.cuda.is_available():
            return "cuda"
        if torch.backends.mps.is_built() and torch.backends.mps.is_available():
            return "mps"
    except Exception:
        pass

    return "cpu"

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    获取全局单一的本地 Embedding 模型实例
    """
    global _embedding_instance
    if _embedding_instance is None:
        device = _resolve_device(settings.EMBEDDING_DEVICE)
        print("⏳ 第一次运行，正在初始化本地中文向量模型 (可能比较慢)...")
        _embedding_instance = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": device},
            encode_kwargs={'normalize_embeddings': True}
        )
        print(f"✅ 本地向量模型加载完成！device={device}")
    return _embedding_instance

def get_reranker_model() -> HuggingFaceCrossEncoder:
    """
    获取全局单一的本地重排模型实例 (Cross-Encoder)
    """
    global _reranker_instance
    if _reranker_instance is None:
        device = _resolve_device(settings.RERANKER_DEVICE)
        print(f"⏳ 正在初始化高精度本地中文重排模型 {settings.RERANKER_MODEL} (首次需下载)...")
        _reranker_instance = HuggingFaceCrossEncoder(
            model_name=settings.RERANKER_MODEL,
            model_kwargs={"device": device}
        )
        print(f"✅ 本地交叉熵重排模型加载完成！device={device}")
    return _reranker_instance
