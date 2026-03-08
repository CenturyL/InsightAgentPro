from __future__ import annotations

from local_agent_api.agents.state import OrchestratorState


def react_passthrough_node(state: OrchestratorState) -> OrchestratorState:
    """Simple-mode graph node placeholder.

    ReAct execution still lives in the existing agent service path. This node
    lets the orchestrator make an explicit mode decision without duplicating the
    current create_agent-based implementation.
    """
    return state

