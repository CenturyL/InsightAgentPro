from __future__ import annotations

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

from local_agent_api.core.config import settings


def _resolve_local_model_config() -> tuple[str, str, str]:
    provider = settings.BASIC_MODEL_PROVIDER.strip().lower()
    if provider not in {"ollama", "openai_compatible"}:
        raise ValueError(f"不支持的 BASIC_MODEL_PROVIDER: {settings.BASIC_MODEL_PROVIDER}")

    if settings.OLLAMA_BASE_URL and provider == "ollama":
        base_url = settings.OLLAMA_BASE_URL
    else:
        base_url = settings.BASIC_MODEL_BASE_URL

    if settings.LLM_MODEL and provider == "ollama":
        model_name = settings.LLM_MODEL
    else:
        model_name = settings.BASIC_MODEL_NAME

    return provider, base_url, model_name


def create_local_model(temperature: float = 0.7):
    provider, base_url, model_name = _resolve_local_model_config()
    if provider == "ollama":
        return ChatOllama(
            base_url=base_url,
            model=model_name,
            temperature=temperature,
        )
    return ChatOpenAI(
        api_key=settings.BASIC_MODEL_API_KEY,
        base_url=base_url,
        model=model_name,
        temperature=temperature,
        streaming=True,
    )


def create_basic_model(temperature: float = 0.7):
    return create_local_model(temperature=temperature)


def create_deepseek_model(temperature: float = 0.7):
    return ChatOpenAI(
        api_key=settings.DEEPSEEK_API_KEY,
        base_url=settings.DEEPSEEK_BASE_URL,
        model=settings.DEEPSEEK_MODEL,
        temperature=temperature,
        streaming=True,
    )


def create_minimax_model(temperature: float = 0.7):
    if not settings.MINIMAX_API_KEY:
        raise ValueError("未配置 MINIMAX_API_KEY")
    return ChatOpenAI(
        api_key=settings.MINIMAX_API_KEY,
        base_url=settings.MINIMAX_BASE_URL,
        model=settings.MINIMAX_MODEL,
        temperature=temperature,
        streaming=True,
    )


local_model = create_local_model()
deepseek_model = create_deepseek_model()
minimax_model = create_minimax_model() if settings.MINIMAX_API_KEY else None


def get_model_by_choice(choice: str):
    normalized = (choice or "local_qwen").strip().lower()
    if normalized == "local_qwen":
        return local_model
    if normalized == "deepseek":
        return deepseek_model
    if normalized == "minimax":
        if minimax_model is None:
            raise ValueError("当前未配置 MiniMax 模型")
        return minimax_model
    raise ValueError(f"未知模型选择: {choice}")


def get_model_label(choice: str) -> str:
    normalized = (choice or "local_qwen").strip().lower()
    if normalized == "local_qwen":
        return "本地 Qwen（Ollama）"
    if normalized == "deepseek":
        return "DeepSeek API"
    if normalized == "minimax":
        return "MiniMax API"
    return normalized
