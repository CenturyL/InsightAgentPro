from __future__ import annotations

from typing import Any, Literal

from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from typing_extensions import NotRequired, TypedDict


class PlanStep(TypedDict):
    step_id: str
    goal: str
    reason: str
    required_capability: str
    expected_output: str
    status: Literal["pending", "completed", "failed", "partial"]


class StepResult(TypedDict):
    step_id: str
    goal: str
    query: str
    evidence: str
    status: Literal["completed", "failed", "partial"]


class OrchestratorState(TypedDict):
    messages: list[BaseMessage]
    user_id: str
    thread_id: str
    task_mode: NotRequired[str]
    metadata_filters: NotRequired[dict[str, Any]]
    is_complex: bool
    planning_reason: NotRequired[str]
    plan: NotRequired[list[PlanStep]]
    current_step: NotRequired[int]
    step_results: NotRequired[list[StepResult]]
    retrieved_docs: NotRequired[list[Document]]
    citations: NotRequired[list[dict[str, Any]]]
    final_answer: NotRequired[str]
