from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from local_agent_api.core.config import settings

# ============================================================
# 模块级单例：全项目共享同一个模型实例，避免重复创建
# middleware 的 request.override(model=...) 会在运行时动态切换，
# 这里只负责提供"默认底座"和"高级底座"两个对象
# ============================================================

# 默认底座：本地 Ollama 部署的 Qwen
basic_model = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.LLM_MODEL,
    temperature=0.7,
)

# 高级底座：云端 DeepSeek（兼容 OpenAI 规范）
advanced_model = ChatOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL,
    model=settings.DEEPSEEK_MODEL,
    temperature=0.7,
    streaming=True,
)
