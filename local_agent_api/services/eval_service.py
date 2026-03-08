from __future__ import annotations

from pathlib import Path

from local_agent_api.evaluation.generation_eval import GenerationEvalMetrics, run_generation_eval
from local_agent_api.evaluation.retrieval_compare import RetrievalCompareReport, run_retrieval_compare
from local_agent_api.evaluation.retrieval_eval import RetrievalEvalMetrics, run_retrieval_eval
from local_agent_api.evaluation.system_benchmark import (
    BenchmarkQueryConfig,
    SystemBenchmarkMetrics,
    run_system_benchmark,
)


DEFAULT_RETRIEVAL_EVAL_DATASET = "local_agent_api/data/eval/retrieval_eval_dataset.jsonl"
DEFAULT_RETRIEVAL_COMPARE_DATASET = "local_agent_api/data/eval/retrieval_compare_dataset.jsonl"
DEFAULT_GENERATION_EVAL_DATASET = "local_agent_api/data/eval/generation_eval_dataset.jsonl"


def _resolve_path(path_str: str) -> Path:
    path = Path(path_str)
    if path.is_absolute():
        return path
    project_root = Path(__file__).resolve().parent.parent
    candidate = project_root / path_str.replace("local_agent_api/", "", 1)
    return candidate


def run_retrieval_eval_job(
    dataset_path: str | None = None,
    top_k: int = 3,
    candidate_k: int = 15,
    strategy: str = "hybrid_rerank",
) -> RetrievalEvalMetrics:
    resolved_path = dataset_path or DEFAULT_RETRIEVAL_EVAL_DATASET
    path = _resolve_path(resolved_path)
    return run_retrieval_eval(str(path), top_k=top_k, candidate_k=candidate_k, strategy=strategy)  # type: ignore[arg-type]


def run_retrieval_compare_job(
    dataset_path: str | None = None,
    top_k: int = 3,
    candidate_k: int = 15,
) -> RetrievalCompareReport:
    resolved_path = dataset_path or DEFAULT_RETRIEVAL_COMPARE_DATASET
    path = _resolve_path(resolved_path)
    return run_retrieval_compare(str(path), top_k=top_k, candidate_k=candidate_k)


async def run_generation_eval_job(
    dataset_path: str | None = None,
    candidate_k: int = 15,
) -> GenerationEvalMetrics:
    resolved_path = dataset_path or DEFAULT_GENERATION_EVAL_DATASET
    path = _resolve_path(resolved_path)
    return await run_generation_eval(str(path), candidate_k=candidate_k)


async def run_system_benchmark_job(
    retrieval_dataset_path: str | None = None,
    candidate_k: int = 8,
) -> SystemBenchmarkMetrics:
    resolved_path = retrieval_dataset_path or DEFAULT_RETRIEVAL_COMPARE_DATASET
    path = _resolve_path(resolved_path)
    return await run_system_benchmark(
        retrieval_dataset_path=str(path),
        simple_query=BenchmarkQueryConfig(query="你好"),
        complex_query=BenchmarkQueryConfig(
            query="请比较上海浦东新区两份政策通知在支持对象和支持方向上的差异，并整理成要点。",
            task_mode="compare",
            metadata_filters={"doc_category": "policy", "region": "上海"},
        ),
        candidate_k=candidate_k,
    )
