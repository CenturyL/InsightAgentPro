# InsightAgent Technical Design

## 1. Project Positioning

### 1.1 Project Name

InsightAgent: a multimodal policy and bidding intelligence agent platform based on LangChain 1.2, LangGraph, modern RAG, and pgvector.

### 1.2 Project Goal

Build an agent project suitable for resumes and technical interviews. The system should demonstrate:

- LangChain 1.2 / LangGraph standard agent orchestration
- Multimodal preprocessing for PDF, scanned PDF, images, tables, and web pages
- Modern intelligent RAG with hybrid retrieval, reranking, metadata filtering, and citations
- Plan-and-Execute for complex tasks
- pgvector-based long-term memory
- Offline evaluation for retrieval quality and answer quality
- A local fine-tuning data pipeline for domain adaptation

### 1.3 Why This Theme

The project theme is "industrial policy and bidding intelligence analysis". This theme is chosen because:

- Data is naturally multimodal: policy PDFs, scanned attachments, announcement pages, tables, and images
- Retrieval is core to the product value
- Complex tasks require decomposition, comparison, extraction, and report generation
- Long-term memory is meaningful because users often track specific industries, regions, and policy topics
- The project can be explained clearly in interviews without appearing as a generic chat demo


## 2. Business Scenarios

The system targets the following representative tasks:

1. Parse a policy PDF and summarize support conditions, subsidy amount, deadlines, and target enterprise types
2. Compare policies across cities or districts and output a structured difference report
3. Extract key fields from bidding announcements and attachments, including qualification requirements, deadlines, and scoring rules
4. Answer domain questions with evidence-backed citations
5. Remember a user's focus areas such as region, industry, and reporting preference across sessions


## 3. Technical Objectives

### 3.1 Functional Objectives

- Support file ingestion for PDF, scanned PDF, images, HTML, and plain text
- Support multimodal parsing and standardized document normalization
- Support simple ReAct-style tool use for lightweight tasks
- Support Plan-and-Execute for complex multi-step tasks
- Support knowledge retrieval with citations
- Support long-term memory by user ID
- Support evaluation for precision, recall, and answer faithfulness
- Support local dataset generation for fine-tuning and RAG testing

### 3.2 Engineering Objectives

- Modular architecture with clear boundaries
- Compatible with LangChain 1.2 and LangGraph patterns
- Easy to extend with new parsers, retrieval strategies, and evaluation tasks
- Easy to explain and demonstrate in interviews
- Possible to implement incrementally on top of the current repository


## 4. High-Level Architecture

### 4.1 Architecture Summary

The system is divided into seven layers:

1. API Layer
2. Agent Orchestration Layer
3. Planning and Execution Layer
4. Retrieval Layer
5. Memory Layer
6. Ingestion and Data Processing Layer
7. Evaluation and Dataset Layer

### 4.2 Layer Responsibilities

#### API Layer

Responsible for external access, request validation, streaming output, task submission, and result retrieval.

Main responsibilities:

- FastAPI endpoints
- SSE or plain text streaming responses
- Upload and ingestion task triggering
- Evaluation job triggering

#### Agent Orchestration Layer

Responsible for routing requests into the appropriate execution path.

Main responsibilities:

- Inject short-term and long-term memory
- Decide between simple execution and complex execution
- Control LangGraph state transitions
- Aggregate final outputs and citations

#### Planning and Execution Layer

Responsible for complex-task decomposition and stepwise execution.

Main responsibilities:

- Planner generates a structured plan
- Executor runs each step with retrieval, tools, or reasoning
- Reflection node revises failed or weak steps
- Synthesizer consolidates step results

#### Retrieval Layer

Responsible for intelligent RAG.

Main responsibilities:

- Hybrid retrieval
- Query rewrite and decomposition
- Reranking
- Metadata filtering
- Citation packaging

#### Memory Layer

Responsible for multi-session user awareness.

Main responsibilities:

- Short-term conversational state
- Long-term semantic memory
- User profile memory

#### Ingestion and Data Processing Layer

Responsible for multimodal document preprocessing and normalization.

Main responsibilities:

- OCR and layout parsing
- Table extraction
- Document cleaning
- Chunking and indexing
- Metadata enrichment

#### Evaluation and Dataset Layer

Responsible for measurable quality validation.

Main responsibilities:

- Retrieval evaluation
- Generation evaluation
- Agent task evaluation
- Fine-tuning dataset generation


## 5. Core Technical Decisions

### 5.1 LangChain 1.2 Standard

The project should follow the LangChain 1.2 style:

- Use `langchain.agents.create_agent` for lightweight tool-calling agents
- Use LangGraph for complex orchestration and stateful workflows
- Use middleware for model routing, memory injection, and error handling
- Use typed state schemas for execution state

### 5.2 ReAct and Plan-and-Execute Coexistence

The system should not use Plan-and-Execute for every request. That adds latency and complexity unnecessarily.

Instead, use two modes:

- Fast ReAct Mode
- Plan-and-Execute Mode

Fast ReAct Mode is used when:

- The question is straightforward
- A single retrieval or single tool call is enough
- No comparison, reporting, or multi-document synthesis is needed

Plan-and-Execute Mode is used when:

- The request contains comparison, analysis, extraction, summary report, or risk review semantics
- The task requires multiple information sources
- The task requires structured output such as tables or reports

This dual-mode design is technically sound and interview-friendly because it shows the system can balance latency and reasoning depth.

Additional positioning note:

- Internal company knowledge lookup, office-rule lookup, and time lookup remain available as auxiliary tools
- They are no longer the primary product identity
- The default assistant persona and primary retrieval workflow are centered on policy and bidding analysis

### 5.3 Unified Storage with PostgreSQL + pgvector

The project should move toward PostgreSQL + pgvector as the primary persistent backend.

Reasons:

- One unified backend for long-term memory and production knowledge storage
- Better story for resumes than a local demo-only vector store
- Easier metadata filtering and SQL-based analysis
- Easier to support both retrieval and evaluation bookkeeping

Chroma can remain temporarily as a compatibility layer during migration, but the target architecture should use PostgreSQL + pgvector as the core vector store.


## 6. Detailed System Design

## 6.1 API Layer Design

### 6.1.1 Main Endpoints

`POST /api/v1/chat/agent`

- Unified agent entry
- Supports `thread_id`, `user_id`, query, response mode, and optional task hints

`POST /api/v1/knowledge/upload`

- Upload files for ingestion
- Returns ingestion task metadata

`POST /api/v1/knowledge/reindex`

- Rebuild or refresh the index for a corpus

`POST /api/v1/eval/retrieval`

- Run offline retrieval metrics

`POST /api/v1/eval/generation`

- Run answer-level quality metrics

`POST /api/v1/datasets/build`

- Generate or refresh local fine-tuning and test datasets

### 6.1.2 Request Modes

The chat endpoint should support:

- `qa`: direct question answering
- `compare`: compare multiple policies or notices
- `extract`: structured field extraction
- `report`: generate a longer analytical report

This can be optional in MVP. If the client does not specify a mode, the router decides automatically.


## 6.2 Agent Orchestration Design

### 6.2.1 Orchestration Strategy

Use LangGraph as the core orchestrator for complex tasks. The graph should be state-driven and explicit.

Recommended nodes:

1. `input_normalization_node`
2. `memory_injection_node`
3. `complexity_router_node`
4. `react_agent_node`
5. `planner_node`
6. `executor_node`
7. `reflection_node`
8. `synthesizer_node`
9. `citation_node`
10. `memory_writeback_node`

### 6.2.2 Routing Logic

The router decides between ReAct and Plan-and-Execute based on:

- query length
- multi-entity or multi-document semantics
- comparison keywords
- report keywords
- extraction keywords
- whether structured output is requested

Example complex-trigger keywords:

- compare
- analyze
- report
- summarize from multiple sources
- extract fields
- find risk points
- list differences
- generate a table

### 6.2.3 State Schema

The LangGraph state should include at least:

- `messages`
- `user_id`
- `thread_id`
- `task_mode`
- `is_complex`
- `plan`
- `current_step`
- `step_results`
- `retrieved_docs`
- `citations`
- `final_answer`


## 6.3 ReAct Mode Design

### 6.3.1 Purpose

ReAct Mode is optimized for fast and simple tasks.

Typical tasks:

- Ask about one policy rule
- Ask for one deadline
- Ask for one concept explanation
- Ask for a short summary of one document

### 6.3.2 Execution Pattern

Flow:

1. receive query
2. inject memory if relevant
3. model decides whether to call retrieval tool
4. retrieve and rerank if needed
5. synthesize answer with citations
6. write back stable memory if appropriate

### 6.3.3 Tool Set

Initial tools should include:

- `search_domain_knowledge`
- `get_current_time`
- `extract_document_sections`
- `lookup_user_preference`

Later optional tools:

- `compare_policy_spans`
- `extract_bid_fields`
- `generate_outline`


## 6.4 Plan-and-Execute Design

### 6.4.1 Purpose

Plan-and-Execute handles complex, multi-step, high-value tasks.

This is a required core feature of the new project version.

### 6.4.2 Planner Design

The planner receives the user goal and outputs a structured plan in JSON-like form.

Each step should include:

- `step_id`
- `goal`
- `reason`
- `required_capability`
- `expected_output`
- `status`

Example:

1. identify relevant documents
2. retrieve sections about subsidy conditions
3. retrieve sections about deadlines
4. compare key fields
5. draft final answer with table and citations

The planner should be constrained with a schema to avoid vague or redundant plans.

### 6.4.3 Executor Design

The executor runs steps sequentially.

For each step:

- read current plan step
- decide which retrieval or tool function to use
- capture intermediate output
- validate whether the step succeeded
- store result in `step_results`

The executor should not regenerate the whole plan unless needed. It should focus on step completion.

### 6.4.4 Reflection Design

Reflection is used when:

- a step retrieves insufficient evidence
- retrieved content conflicts
- structured extraction fails
- the output lacks required fields

Reflection can:

- retry retrieval with a rewritten query
- broaden metadata filters
- request another supporting chunk set
- mark the step as partially complete with an explicit confidence note

### 6.4.5 Synthesizer Design

The synthesizer merges all step outputs into one final response.

The output should include:

- final answer
- structure requested by the user
- evidence-backed citations
- unresolved uncertainty if evidence is weak

### 6.4.6 Why This Matters for the Resume

Plan-and-Execute signals stronger engineering depth than a single-turn chat agent because it demonstrates:

- explicit task decomposition
- graph-based orchestration
- intermediate state management
- failure handling
- better support for enterprise-grade analytical tasks


## 6.5 Multimodal Ingestion Design

### 6.5.1 Supported Input Types

- native PDF
- scanned PDF
- images
- HTML pages
- markdown and plain text
- optional DOCX in later phase

### 6.5.2 Parsing Pipeline

Recommended pipeline:

1. file validation
2. fingerprinting and deduplication
3. parser selection
4. OCR if needed
5. layout parsing
6. table extraction
7. image or chart caption generation if needed
8. normalization to markdown and structured JSON
9. metadata enrichment
10. chunking and indexing

### 6.5.3 Parsing Tools

Recommended stack:

- MinerU for Chinese PDF and layout-heavy documents
- Docling as a general-purpose structured document parser
- OCR engine such as PaddleOCR or a similarly stable local OCR option

The implementation should allow parser fallback. A single parser is rarely enough for real-world documents.

### 6.5.4 Canonical Document Schema

Each parsed document should be normalized into a canonical schema:

- `doc_id`
- `source_type`
- `source_path`
- `source_url`
- `title`
- `publish_date`
- `region`
- `industry`
- `page_no`
- `section_path`
- `content`
- `content_type`
- `table_html`
- `image_summary`
- `entities`
- `doc_hash`

This schema is important because later retrieval, filtering, evaluation, and fine-tuning all depend on consistent metadata.


## 6.6 Retrieval and RAG Design

### 6.6.1 Retrieval Objectives

The retrieval layer should support:

- high recall for relevant evidence
- good ranking quality
- controllable metadata filters
- explainable citations

### 6.6.2 Retrieval Pipeline

Recommended pipeline:

1. query normalization
2. optional query rewrite
3. optional multi-query generation
4. metadata inference
5. hybrid retrieval
6. reranking
7. top-k evidence selection
8. citation packaging

### 6.6.3 Hybrid Retrieval

Hybrid retrieval combines:

- dense retrieval using embeddings
- lexical retrieval using BM25 or PostgreSQL full-text search

This is important because policy and bidding domains contain exact terms, code identifiers, deadlines, and location names that are often better handled by lexical retrieval.

### 6.6.4 Reranking

Use a cross-encoder reranker after candidate retrieval.

Current repository already has a reranker concept. The upgraded design should preserve it and standardize it as a mandatory stage for high-value queries.

### 6.6.5 Metadata Filtering

Filters should support:

- region
- date range
- source type
- document category
- industry

This is critical for business questions such as:

- "Shanghai 2025 manufacturing policy"
- "district-level subsidy after January 2025"

### 6.6.6 Citation Design

Every answer should be able to reference:

- source title
- page or section
- chunk ID
- source path or URL

The answer generator should include citation markers without exposing raw internal IDs directly to the user unless needed.


## 6.7 Memory Design

### 6.7.1 Short-Term Memory

Short-term memory uses LangGraph checkpointer.

Purpose:

- preserve dialogue continuity within the same thread
- support multi-turn follow-up questions
- support stepwise execution context in complex tasks

### 6.7.2 Long-Term Memory

Long-term memory uses pgvector.

Purpose:

- preserve user-level stable preferences and facts across threads
- improve personalization and task continuity

Suitable memory examples:

- user focuses on Shanghai industrial policy
- user prefers tabular output
- user frequently analyzes subsidy deadlines

Unsuitable memory examples:

- arbitrary transient chat text
- noisy intermediate thought

### 6.7.3 Memory Writeback Policy

Only write stable, high-value facts back into long-term memory.

Writeback sources:

- explicit user preferences
- recurring task focus
- stable profile facts

Writeback should not blindly store:

- temporary requests
- one-off tool outputs
- speculative model conclusions


## 6.8 Model Strategy

### 6.8.1 Model Roles

The project should maintain a multi-model role design:

- lightweight local model for simple interaction
- stronger remote or larger model for planning, reflection, and high-value synthesis
- embedding model for dense retrieval
- reranker model for ranking precision

### 6.8.2 Dynamic Routing

The current middleware-based routing idea is correct and should be retained.

Suggested responsibilities:

- simple QA -> lightweight model
- plan generation -> advanced model
- reflection -> advanced model
- memory extraction -> advanced model
- fast streaming answer -> lightweight model when sufficient

This keeps the system efficient and realistic.


## 7. Evaluation Design

## 7.1 Why Evaluation Is Mandatory

Without evaluation, the project remains a demo.

With evaluation, it becomes an engineering system that can prove quality improvements.

### 7.1.1 Retrieval Evaluation Metrics

Required metrics:

- Precision@k
- Recall@k
- MRR
- nDCG

These should be computed on a labeled query-evidence dataset.

### 7.1.2 Generation Evaluation Metrics

Recommended metrics:

- faithfulness
- answer relevancy
- citation accuracy
- completeness for structured extraction tasks

Ragas can be used as the baseline framework for answer-level metrics.

### 7.1.3 Agent Evaluation Metrics

Additional metrics for the agent layer:

- task completion rate
- plan success rate
- average number of execution steps
- retry frequency
- tool failure recovery rate

This is especially important because Plan-and-Execute is one of the core differentiators of the project.


## 8. Fine-Tuning and Dataset Design

## 8.1 Fine-Tuning Strategy

The project should not start with fine-tuning before the RAG baseline is stable.

Recommended order:

1. build ingestion pipeline
2. build retrieval baseline
3. build evaluation dataset
4. optimize RAG
5. generate fine-tuning data
6. run local fine-tuning

### 8.1.1 Fine-Tuning Use Cases

Suitable local fine-tuning objectives:

- domain term understanding
- extraction instruction following
- comparison-style answer formatting
- better refusal when evidence is insufficient
- more stable planner outputs

### 8.1.2 Training Data Sources

Training data can come from:

- manually curated domain QA pairs
- synthetic instructions generated from parsed documents
- extraction targets derived from tables and notices
- comparison examples across related policy documents

### 8.1.3 Dataset Splits

At minimum:

- training set
- validation set
- retrieval test set
- generation test set

The retrieval test set should not overlap heavily with synthetic fine-tuning data, otherwise evaluation becomes inflated.


## 9. Data Collection Plan

### 9.1 Data Source Categories

Recommended source categories for this project:

- government policy portals
- district or city announcement sites
- procurement and bidding portals
- official white papers
- business service platform guides

### 9.2 Data Types Needed

- PDFs and scanned PDFs for multimodal parsing tests
- policy pages for HTML extraction tests
- tables for structured extraction tests
- long documents for chunking and reranking tests
- multiple documents on similar topics for comparison tasks

### 9.3 Cleaning and Processing Workflow

1. crawl or manually collect source files
2. store raw files
3. deduplicate using file hash and semantic signals
4. parse into structured markdown and JSON
5. normalize metadata
6. segment into chunks
7. filter low-quality chunks
8. build evaluation labels
9. generate fine-tuning samples


## 10. Suggested Project Structure

```text
local_agent_api/
  api/
    routes.py
    schemas.py
  core/
    config.py
    llm.py
    middleware.py
  agents/
    orchestrator.py
    react_agent.py
    planner.py
    executor.py
    router.py
    state.py
  retrieval/
    indexer.py
    hybrid_retriever.py
    reranker.py
    citation.py
    query_rewrite.py
  memory/
    short_term.py
    long_term.py
    writeback.py
  ingestion/
    loaders/
    parsers/
    cleaners/
    chunkers/
    pipelines/
    schemas.py
  evaluation/
    datasets/
    retrieval_eval.py
    generation_eval.py
    agent_eval.py
  datasets/
    raw/
    processed/
    eval/
    finetune/
  services/
    agent_service.py
    rag_service.py
    ingest_service.py
    eval_service.py
```


## 11. Migration Plan from Current Repository

### 11.1 What Can Be Reused

The current repository already contains reusable foundations:

- FastAPI app structure
- middleware concept
- dynamic model selection
- long-term memory injection idea
- reranker-based retrieval idea
- streaming agent entry

### 11.2 What Must Be Upgraded

Required upgrades:

- replace single-path agent execution with dual-mode orchestration
- add LangGraph orchestrator for complex tasks
- formalize planner and executor nodes
- migrate from demo-style RAG to structured hybrid RAG
- add multimodal ingestion pipeline
- add evaluation modules and datasets
- add citation-aware answer generation

### 11.3 What Can Stay Temporary in MVP

For MVP, the following can remain simplified:

- keep Chroma as temporary storage while pgvector migration is under development
- support PDF and text first, then add image and HTML
- keep the number of tools small
- implement evaluation on a small local benchmark before scaling up


## 12. MVP Scope

### 12.1 MVP Features

The MVP should include:

- FastAPI unified chat endpoint
- ReAct mode
- Plan-and-Execute mode
- PDF and text ingestion
- pgvector long-term memory
- reranker-based RAG
- citation output
- retrieval evaluation with Precision@k and Recall@k

### 12.2 MVP Out of Scope

Temporarily out of scope:

- frontend UI dashboard
- multi-agent collaboration
- large-scale automated crawling
- production-grade auth and multi-tenant isolation


## 13. Iteration Roadmap

### Phase 1: Architecture Refactor

- define new modules and state schema
- add LangGraph orchestrator
- preserve current API compatibility

### Phase 2: Plan-and-Execute

- implement planner
- implement executor
- implement reflection and synthesis

### Phase 3: Multimodal Ingestion

- add parser abstraction
- add PDF and OCR processing
- standardize canonical schema

### Phase 4: Retrieval Upgrade

- hybrid retrieval
- metadata filtering
- citation packaging

### Phase 5: Evaluation

- build eval dataset
- run retrieval and generation metrics
- benchmark simple mode vs complex mode

### Phase 6: Fine-Tuning Pipeline

- build domain instruction dataset
- add local LoRA training pipeline
- compare pre/post fine-tuning results


## 14. Resume-Oriented Project Highlights

This project should eventually support the following resume claims:

- Designed a multimodal domain agent platform with LangChain 1.2 and LangGraph
- Implemented a dual-mode architecture combining ReAct and Plan-and-Execute
- Built a modern RAG pipeline with hybrid retrieval, reranking, metadata filtering, and citations
- Implemented pgvector-based long-term memory and user preference injection
- Built offline evaluation workflows using precision, recall, and faithfulness metrics
- Constructed local fine-tuning datasets for domain QA, extraction, and comparison tasks


## 15. Risks and Design Constraints

### 15.1 Main Risks

- Multimodal parsing quality may vary by document type
- Plan-and-Execute increases latency and implementation complexity
- Poorly controlled long-term memory can introduce noise
- Evaluation data labeling takes time

### 15.2 Control Strategies

- use parser fallback strategy
- only route complex tasks into planner flow
- enforce memory writeback policy
- start with a small but high-quality evaluation set


## 16. Final Design Conclusion

The target system is not a generic chatbot. It is a domain agent platform focused on evidence-backed analysis of multimodal industrial policy and bidding documents.

Its core differentiators are:

- LangChain 1.2 standard implementation
- explicit Plan-and-Execute support
- modern RAG with reranking and citations
- multimodal preprocessing
- pgvector long-term memory
- measurable evaluation

This design is appropriate for staged implementation on top of the current repository and strong enough to serve as a resume-grade flagship agent project.
