from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from local_agent_api.core.config import settings

# 采用单例模式缓存模型，避免每次调用都重新加载（模型大约百兆大小）
_embedding_instance = None
_reranker_instance = None

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    获取全局单一的本地 Embedding 模型实例
    """
    global _embedding_instance
    if _embedding_instance is None:
        print("⏳ 第一次运行，正在初始化本地中文向量模型 (可能需要下载)...")
        _embedding_instance = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={
                # 苹果 M 系列芯片可用 'mps' 硬件加速，Intel 芯片用 'cpu'
                'device': 'cpu' 
            },
            encode_kwargs={'normalize_embeddings': True}
        )
        print("✅ 本地向量模型加载完成！")
    return _embedding_instance

def get_reranker_model() -> HuggingFaceCrossEncoder:
    """
    获取全局单一的本地重排模型实例 (Cross-Encoder)
    """
    global _reranker_instance
    if _reranker_instance is None:
        print(f"⏳ 正在初始化高精度本地中文重排模型 {settings.RERANKER_MODEL} (首次需下载)...")
        _reranker_instance = HuggingFaceCrossEncoder(
            model_name=settings.RERANKER_MODEL,
            model_kwargs={'device': 'cpu'} 
        )
        print("✅ 本地交叉熵重排模型加载完成！")
    return _reranker_instance
