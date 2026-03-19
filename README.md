# InsightAgentPro

InsightAgentPro is a general agent runtime platform built for real task execution rather than single-path document Q&A. It combines a ReAct main loop, a Plan-and-Execute workflow, unified tool registration, editable runtime context, and hybrid retrieval into one full-stack system with a ChatGPT-style web UI.

## What It Does

- Runs a ReAct-based primary agent loop for normal interaction and tool use
- Exposes Plan-and-Execute as an advanced capability for multi-step tasks
- Supports local and cloud model selection from the frontend
- Combines retrieval, web search, memory, and workflow execution in one runtime
- Provides editable persona, markdown memory, and runtime assets from the UI
- Streams tool calls, reasoning traces, and workflow progress to a runtime panel

## Core Capabilities

### 1. Agent Runtime

- ReAct is the default control loop
- Plan-and-Execute can be auto-triggered or manually forced with `plan_mode`
- Runtime context is assembled before model calls and includes:
  - persona
  - markdown memory
  - selected skills
  - long-term memory
  - MCP context
  - tool guidance
  - complexity and recommended action

### 2. Unified Tool System

The system registers multiple capabilities as tools instead of hardcoding them into a single path:

- `rag_search`
- `rag_search_uploaded`
- `web_search`
- `search_long_term_memory`
- `get_current_time`
- `run_plan_and_execute`

This lets the main loop and the workflow share the same capability surface.

### 3. Retrieval and Memory

- Hybrid retrieval with vector recall, keyword补召回, metadata filtering, and reranking
- Citation-oriented output
- Uploaded document priority search
- Chroma-backed document index
- PostgreSQL + pgvector for long-term memory
- Thread-based short-term conversation continuity
- Markdown memory for explicit, editable workspace memory

### 4. Runtime Assets

The frontend can read and update runtime assets:

- `persona/AGENTS.md`
- `persona/SOUL.md`
- `memory/MEMORY.md`
- `skills/*.md`

These assets are not only editable files; they are used in runtime prompt assembly.

### 5. Deployment

The project supports hybrid deployment:

- public entry via ECS
- backend services on Ubuntu
- local Ollama inference on GPU server
- cloud APIs for stronger planning/synthesis stages
- frontend served separately through Vite during development

## Architecture

### Backend

- `local_agent_api/services/agent_service.py`
  - main streaming agent entry
- `local_agent_api/runtime/`
  - runtime context, prompt assembly, workflow orchestration, tool registry
- `local_agent_api/agents/`
  - planner, executor, reflection, synthesizer
- `local_agent_api/retrieval/`
  - ingestion and retrieval pipeline

### Frontend

- React + TypeScript + Vite
- studio-style three-panel UI:
  - left: runtime assets and knowledge controls
  - center: chat area
  - right: agent run / trace panel

## Tech Stack

- FastAPI
- LangChain
- LangGraph
- PostgreSQL
- pgvector
- Chroma
- BGE Reranker
- Ollama
- DeepSeek API
- MiniMax API
- React
- TypeScript
- Vite

## Running Locally

### Backend

1. Create and activate your Python environment
2. Configure `local_agent_api/.env`
3. Start the API:

```bash
cd local_agent_api
uvicorn local_agent_api.main:app --reload
```

### Frontend

```bash
cd local_agent_frontend
npm install
npm run dev
```

Default development URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`

## Runtime Asset APIs

- `GET /api/v2/runtime/assets`
- `PUT /api/v2/runtime/assets`

## Project Status

InsightAgentPro is an active engineering project focused on:

- general agent runtime design
- tool-centric execution
- workflow orchestration
- memory integration
- model-flexible deployment

It is intended as a practical full-stack agent system rather than a demo-only RAG app.
