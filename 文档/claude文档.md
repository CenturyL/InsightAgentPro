# Local Agent API — 完整技术文档

> 基于 LangChain 1.x + LangGraph + FastAPI 构建的企业级智能体后端服务

---

## 目录

- [Local Agent API — 完整技术文档](#local-agent-api--完整技术文档)
  - [目录](#目录)
  - [1. 项目定位](#1-项目定位)
  - [2. 整体架构](#2-整体架构)
  - [3. 目录结构](#3-目录结构)
  - [4. 核心模块详解](#4-核心模块详解)
    - [4.1 LLM 层：双模型管理](#41-llm-层双模型管理)
    - [4.2 配置层：Pydantic Settings](#42-配置层pydantic-settings)
    - [4.3 Middleware 层：三大拦截器](#43-middleware-层三大拦截器)
      - [拦截器 1：`inject_long_term_memory`（`@wrap_model_call`）](#拦截器-1inject_long_term_memorywrap_model_call)
      - [拦截器 2：`dynamic_model_selection`（`@wrap_model_call`）](#拦截器-2dynamic_model_selectionwrap_model_call)
      - [拦截器 3：`handle_tool_errors`（`@wrap_tool_call`）](#拦截器-3handle_tool_errorswrap_tool_call)
    - [4.4 Agent 服务层：生命周期管理](#44-agent-服务层生命周期管理)
      - [自定义 State Schema](#自定义-state-schema)
      - [懒加载 + 生命周期](#懒加载--生命周期)
      - [记忆提取后台任务](#记忆提取后台任务)
    - [4.5 RAG 服务层：两阶段检索](#45-rag-服务层两阶段检索)
      - [两阶段检索架构](#两阶段检索架构)
      - [SHA256 文档去重（P1-9）](#sha256-文档去重p1-9)
    - [4.6 工具层：Agent 能力扩展](#46-工具层agent-能力扩展)
      - [工具 1：企业知识库查询](#工具-1企业知识库查询)
      - [工具 2：实时时间](#工具-2实时时间)
    - [4.7 记忆层：短期 + 长期双轨](#47-记忆层短期--长期双轨)
    - [4.8 API 层：FastAPI 路由](#48-api-层fastapi-路由)
      - [接口列表](#接口列表)
      - [请求体 Schema](#请求体-schema)
      - [lifespan 钩子](#lifespan-钩子)
  - [5. 五大核心设计思想](#5-五大核心设计思想)
    - [5.1 Middleware 模式](#51-middleware-模式)
    - [5.2 RAG-as-Tool 统一入口](#52-rag-as-tool-统一入口)
    - [5.3 双轨记忆架构](#53-双轨记忆架构)
    - [5.4 防御性动态路由](#54-防御性动态路由)
    - [5.5 优雅降级设计](#55-优雅降级设计)
  - [6. 数据流全链路追踪](#6-数据流全链路追踪)
  - [7. 关键 Bug 及修复思路](#7-关键-bug-及修复思路)
    - [Bug 1：`handle_tool_errors` 在异步上下文中报 `NotImplementedError`](#bug-1handle_tool_errors-在异步上下文中报-notimplementederror)
    - [Bug 2：动态模型切换导致 `openai.BadRequestError 400`](#bug-2动态模型切换导致-openaibadrequesterror-400)
    - [Bug 3：`AsyncPostgresSaver.setup()` 报 `cannot run inside a transaction block`](#bug-3asyncpostgressaversetup-报-cannot-run-inside-a-transaction-block)
    - [Bug 4：`.env` 文件路径依赖 CWD](#bug-4env-文件路径依赖-cwd)
  - [8. 技术选型决策表](#8-技术选型决策表)
  - [9. 依赖清单](#9-依赖清单)

---

## 1. 项目定位

本项目是一个**生产可用的企业智能体后端服务**，解决以下核心问题：

- 本地大模型（Qwen）知识有限、无实时数据 → 通过 **RAG + 工具** 注入私有知识和实时信息
- 普通聊天接口无记忆 → 通过 **双轨记忆体系** 实现多轮对话和跨会话记忆
- 单一模型无法平衡成本与效果 → 通过 **动态模型路由** 在本地与云端模型间自动切换
- 工具执行崩溃会导致整个请求失败 → 通过 **Middleware 异常兜底** 保证服务稳定性

---

## 2. 整体架构

```
HTTP 请求
    │
    ▼
┌─────────────────────────────────────────┐
│  FastAPI  (main.py + routes.py)         │
│  - lifespan 钩子：启动/关闭资源         │
│  - StreamingResponse：流式返回          │
└──────────────────┬──────────────────────┘
                   │ ChatRequest { query, thread_id, user_id }
                   ▼
┌─────────────────────────────────────────┐
│  Agent Service  (agent_service.py)      │
│  - create_agent() LangGraph ReAct 图    │
│  - AgentState: messages + user_id       │
│  - astream_events() 流式事件流          │
└──────┬─────────────────────┬────────────┘
       │                     │
       │ Middleware 链         │ Checkpointer
       ▼                     ▼
┌──────────────────┐  ┌─────────────────────────┐
│  middleware.py   │  │  AsyncPostgresSaver      │
│  1. inject_ltm   │  │  (短期对话记忆)          │
│  2. model_route  │  │  thread_id → 消息历史    │
│  3. tool_errors  │  └─────────────────────────┘
└──────┬───────────┘
       │
       ├──── LLM 调用（basic_model / advanced_model）
       │          │
       │          ▼
       │    ┌─────────────┐
       │    │  tools.py   │
       │    │ search_rules│──→ RAG Service → Chroma
       │    │ get_time    │──→ datetime.now()
       │    └─────────────┘
       │
       └──── 流结束后（ensure_future）
                  │
                  ▼
         ┌─────────────────┐
         │  memory.py      │
         │  LongTermMemory │
         │  pgvector 存储  │
         └─────────────────┘
```

**请求生命周期（一句话概括）：** 用户提问 → FastAPI 接收 → Middleware 注入长期记忆 → 动态路由选模型 → LangGraph 决策是否调工具 → 工具查 RAG/时间 → 模型整合输出 → 流式返回客户端 → 后台异步存储长期记忆。

---

## 3. 目录结构

```
local_agent_api/
├── main.py                  # FastAPI 入口，含 lifespan 初始化钩子
├── requirements.txt
├── .env                     # 密钥与 DB 连接串（不入 git）
│
├── api/
│   ├── routes.py            # 路由定义：/chat/stream, /chat/agent, /knowledge/upload
│   └── schemas.py           # Pydantic 请求模型：query + thread_id + user_id
│
├── core/
│   ├── config.py            # Pydantic Settings，从 .env 自动加载所有配置
│   ├── llm.py               # 双模型单例：basic_model(Qwen) + advanced_model(DeepSeek)
│   ├── embedding.py         # Embedding 和 Reranker 模型单例（懒加载缓存）
│   ├── memory.py            # 长期记忆管理器：PGVector 读写，按 user_id 隔离
│   └── middleware.py        # 三大 Agent Middleware：记忆注入、模型路由、工具兜底
│
├── services/
│   ├── agent_service.py     # Agent 单例 + lifespan 初始化 + 流式调用入口
│   ├── rag_service.py       # 文档处理、向量检索（两阶段 RAG）
│   └── tools.py             # Agent 工具：企业知识库查询、实时时间
│
└── data/
    ├── chroma_db/           # Chroma 持久化向量库（本地知识）
    └── temp/                # 文件上传临时目录
```

---

## 4. 核心模块详解

### 4.1 LLM 层：双模型管理

**文件：** `core/llm.py`

```python
basic_model    = ChatOllama(model="qwen2.5:14b", ...)  # 本地，低延迟，免费
advanced_model = ChatOpenAI(base_url="deepseek", ...)  # 云端，高能力，按量计费
```

**设计要点：**
- 两个模型都在模块加载时实例化为**全局单例**，避免每次请求重复建连
- `basic_model` 走 Ollama 本地 HTTP，完全离线可用
- `advanced_model` 使用 DeepSeek 兼容 OpenAI 接口（`base_url` 重定向），无需改代码即可换任意 OpenAI 兼容服务商
- 两个模型实例**不在此处** `.bind_tools()`，工具绑定由 Middleware 在运行时动态完成，保持解耦

---

### 4.2 配置层：Pydantic Settings

**文件：** `core/config.py`

```python
_ENV_FILE = Path(__file__).parent.parent / ".env"   # 绝对路径，不受 CWD 影响

class Settings(BaseSettings):
    DEEPSEEK_API_KEY: str                  # 无默认值，强制必须从 .env 读取
    POSTGRES_URL: Optional[str] = None     # 可选，不填则降级为 MemorySaver
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    ...
    class Config:
        env_file = str(_ENV_FILE)
```

**关键设计：**
- 使用 `Path(__file__).parent.parent` 计算绝对路径，解决从不同目录启动时 `.env` 找不到的问题
- `DEEPSEEK_API_KEY: str`（无默认值）确保忘填密钥时在**启动阶段**就 fail-fast，而不是在运行时报 AuthError

---

### 4.3 Middleware 层：三大拦截器

**文件：** `core/middleware.py`

LangChain 1.x 的 `AgentMiddleware` 是**类 AOP（面向切面编程）**的机制，允许在不修改 Agent 核心逻辑的前提下，在每次 LLM 调用或工具调用前后插入横切逻辑。

#### 拦截器 1：`inject_long_term_memory`（`@wrap_model_call`）

```
每次 LLM 调用前执行：
  1. 从 request.state 取出 user_id
  2. 用当前 Human 消息内容做 pgvector 语义搜索（Top-K=3）
  3. 将返回的记忆片段拼接到 system_prompt 尾部
  4. 通过 request.override(system_prompt=...) 传给下游
  5. 任何异常 pass，不影响主流程
```

#### 拦截器 2：`dynamic_model_selection`（`@wrap_model_call`）

```
每次 LLM 调用前执行：
  1. 检测消息历史是否含 ToolMessage
     → 是：直接透传（保护工具调用续算的模型一致性，防止 400 错误）
     → 否：进行路由判断
  2. 路由规则（可自由配置）：
     - 对话超 2 轮 / 问题超 50 字 / 含特定关键词 → DeepSeek
     - 否则 → 本地 Qwen
  3. 对选中模型执行 .bind_tools(AGENT_TOOLS)
  4. 通过 request.override(model=...) 替换模型
```

**注意：工具调用续算保护** 是一个非显而易见但非常重要的工程细节。当 Agent 第一轮用 DeepSeek 产生了 `tool_calls`，工具执行完毕后 LangGraph 会再次调用模型整合结果。若此时 Middleware 把模型切换成另一个，OpenAI 协议会报 `400: tool role must follow tool_calls`。正确做法是检测到 `ToolMessage` 存在时直接跳过路由逻辑。

#### 拦截器 3：`handle_tool_errors`（`@wrap_tool_call`）

```
每次工具执行前执行：
  try:
    return await handler(request)
  except Exception as e:
    return ToolMessage(content="工具调用失败：xxx", tool_call_id=...)
```

将工具运行时异常转化为 `ToolMessage` 返回，让 Agent 能优雅降级继续推理，而不是硬崩溃。

**Middleware 执行顺序：**

```
inject_long_term_memory → dynamic_model_selection → [LLM 调用]
inject_long_term_memory → dynamic_model_selection → handle_tool_errors → [工具执行]
```

---

### 4.4 Agent 服务层：生命周期管理

**文件：** `services/agent_service.py`

#### 自定义 State Schema

```python
class AgentState(TypedDict):
    messages: list[BaseMessage]
    user_id: str   # 扩展字段，随对话流传递，Middleware 通过 request.state 读取
```

LangGraph 的 `Pregel` 执行引擎会把 `AgentState` 的所有字段放入每一步的上下文。Middleware 里通过 `request.state.get("user_id")` 读取，实现了 **user_id 在整个 Agent 图中的隐式传递**，无需在每个工具、每个节点里显式传参。

#### 懒加载 + 生命周期

```python
_agent = None
_checkpointer = None
_connection_pool = None   # psycopg AsyncConnectionPool

async def initialize():     # FastAPI lifespan 启动时调用
    # 有 POSTGRES_URL → AsyncPostgresSaver
    # 无 POSTGRES_URL → MemorySaver（进程内，重启丢失）
    ...
    _agent = _build_agent(_checkpointer)

async def cleanup():        # FastAPI lifespan 关闭时调用
    await _connection_pool.close()
```

**连接池配置细节：**
```python
kwargs={"autocommit": True, "prepare_threshold": 0}
```
`autocommit=True` 是 `AsyncPostgresSaver.setup()` 的必要条件，因为其内部执行 `CREATE INDEX CONCURRENTLY`，该命令不能在事务块中运行。

#### 记忆提取后台任务

```python
async def _extract_and_save_memories(thread_id, user_id):
    state = await agent.aget_state(...)      # 读取完整对话历史
    conversation = ... # 取最近 6 条消息拼接
    response = await advanced_model.ainvoke(extraction_prompt)
    facts = response.content.splitlines()
    for fact in facts:
        long_term_memory.save(user_id, fact)

# 在 get_agent_stream 末尾：
asyncio.ensure_future(_extract_and_save_memories(thread_id, user_id))
```

`asyncio.ensure_future` 确保记忆提取在**流式响应已结束后**异步执行，用户感知不到延迟。

---

### 4.5 RAG 服务层：两阶段检索

**文件：** `services/rag_service.py`

#### 两阶段检索架构

```
用户提问
  │
  ▼
阶段 1：向量粗排（Chroma + HuggingFace Embedding）
  - 用 text2vec-base-chinese 向量化查询
  - 从 Chroma 检索 Top-15 语义相似文档
  │
  ▼
阶段 2：Cross-Encoder 精排（langchain-classic CrossEncoderReranker）
  - 用 BAAI/bge-reranker-base 对每个 (query, doc) 对打分
  - 返回 Top-3 最相关文档
  │
  ▼
ContextualCompressionRetriever 组合以上两步，对外暴露统一 retriever 接口
```

**为什么要两阶段？**
- Embedding 粗排速度快但召回精度有限（向量空间的近似性不等于语义精确匹配）
- Cross-Encoder 每次对 (query, doc) 重新 encoding，精度高但慢（不适合全库扫描）
- 结合两者：大网粗捞 15 条，精网精选 3 条，兼顾性能与质量

#### SHA256 文档去重（P1-9）

```python
file_hash = hashlib.sha256(file_bytes).hexdigest()
existing = vector_store.get(where={"source_hash": file_hash}, limit=1)
if existing["ids"]:
    return 0  # 跳过重复入库
```

通过对文件内容做 SHA256，拦截重复上传的同一文件，防止向量库里出现大量重复块导致检索结果噪声上升。

---

### 4.6 工具层：Agent 能力扩展

**文件：** `services/tools.py`

#### 工具 1：企业知识库查询

```python
@tool(response_format="content_and_artifact")
def search_company_rules(query: str) -> tuple[str, list]:
    docs = search_knowledge(query, k=3)
    return format_docs(docs), docs  # str 进 LLM，list 作为 artifact 保留出处
```

`response_format="content_and_artifact"` 是 LangChain 1.x 的新特性：
- 返回的 `str` 部分进入 LLM 上下文（模型看到的内容）
- 返回的 `list` 部分作为 artifact 保存进 `ToolMessage.artifact`，可供后续 citation 使用
- 这样实现了**检索内容与来源文档的分离**，为将来加 "来源引用" 功能预留了扩展点

#### 工具 2：实时时间

```python
@tool
def get_current_time(timezone: str = "Asia/Shanghai") -> str:
    return f"当前时间是: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
```

本地模型的训练数据有截止日期，无法知道当前时间。此工具弥补了"实时性"短板，展示了 **Tool Augmented Generation（工具增强生成）** 的典型用法。

---

### 4.7 记忆层：短期 + 长期双轨

**文件：** `core/memory.py`（长期）、`services/agent_service.py`（短期）

| 维度 | 短期记忆 | 长期记忆 |
|------|---------|---------|
| 存储介质 | PostgreSQL（`checkpoints` 表） | PostgreSQL pgvector（`langchain_pg_embedding` 表） |
| 存储内容 | 完整对话历史（所有 message） | 提炼后的关键事实（facts） |
| 隔离维度 | `thread_id`（会话级） | `user_id`（用户级） |
| 检索方式 | 精确匹配 thread_id | 向量语义搜索（余弦相似度） |
| 持久化 | 跨进程（PostgreSQL） | 跨进程跨会话（pgvector） |
| 写入时机 | 每轮对话自动更新 | 每轮对话结束后异步提取 |
| 读取时机 | LangGraph 内部自动注入 | Middleware 在每次 LLM 调用前注入 system_prompt |
| 容量限制 | LLM context window（有上限） | 无上限（按需语义检索 Top-K） |

**长期记忆的 pgvector 查询：**
```python
self.store.similarity_search(
    query,
    k=3,
    filter={"user_id": user_id},   # JSONB 元数据过滤，按用户隔离
)
```

使用 `pgvector` 的余弦相似度在向量空间中找到最相关的记忆，而不是遍历所有记忆，保证了大量记忆积累后仍有 O(log n) 的检索性能。

---

### 4.8 API 层：FastAPI 路由

**文件：** `api/routes.py`、`main.py`

#### 接口列表

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/` | 健康检查 |
| POST | `/api/v1/chat/stream` | 基础流式对话（直连 Qwen，不走 Agent） |
| POST | `/api/v1/chat/agent` | 全功能 Agent（工具 + 记忆 + 动态路由） |
| POST | `/api/v1/knowledge/upload` | 上传文档入知识库 |

#### 请求体 Schema

```python
class ChatRequest(BaseModel):
    query: str                       # 用户提问（必填）
    temperature: float = 0.7         # 生成温度（影响 /chat/stream）
    thread_id: Optional[str] = None  # 会话ID：同 ID 共享多轮历史；不填则独立
    user_id: Optional[str] = None    # 用户ID：用于长期记忆隔离；不填则跳过长期记忆
```

#### lifespan 钩子

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await agent_service.initialize()   # 建 PG 连接池 + 初始化 Agent
    yield
    await agent_service.cleanup()      # 优雅关闭连接池
```

FastAPI 官方推荐的启动/关闭资源管理方式，替代已废弃的 `@app.on_event("startup")`。

---

## 5. 五大核心设计思想

### 5.1 Middleware 模式

**问题：** 如何在不修改 Agent 核心代码的前提下，为 LLM 调用和工具调用统一添加横切逻辑（日志、路由、记忆注入、错误处理）？

**解法：** 使用 LangChain 1.x 的 `AgentMiddleware` 模式。类似 Web 框架的 HTTP Middleware，`@wrap_model_call` 和 `@wrap_tool_call` 装饰器把函数注册为 AOP 切面，在 Agent 执行每一步时透明地调用。

**好处：**
- 业务逻辑（工具、RAG）与横切逻辑（路由、记忆、错误处理）完全解耦
- Middleware 可独立测试、独立开关
- 新增 Middleware 只需在 `create_agent()` 的 `middleware=[]` 列表里追加，零侵入

---

### 5.2 RAG-as-Tool 统一入口

**问题：** 早期项目有 `/chat/rag` 和 `/chat/agent` 两个接口，用户需要自己判断该用哪个，且 RAG 接口不能联动 Agent 的工具链。

**解法：** 把 RAG 检索包装成一个 `@tool`，统一入口为 `/chat/agent`。Agent 根据问题自主决策是否调用 `search_company_rules`。

**好处：**
- 用户接口简化（一个入口统管所有能力）
- Agent 能自主判断"是否需要查知识库"，不需要用户显式选择
- RAG 工具和其他工具可以在同一轮推理中组合调用（如先查规章再查时间）

---

### 5.3 双轨记忆架构

**问题：** 短期记忆（对话历史）会随 context window 增长而达到上限；但如果每次都传全量历史，开销巨大且不相关内容占据大量 token。

**解法：** 双轨独立管理：
- **短期记忆**（PostgresSaver）：保证当前会话的完整连贯性，由 LangGraph 自动管理
- **长期记忆**（pgvector）：跨会话积累用户画像，每轮对话提炼关键事实，按语义相似度按需检索注入

**本质：** 模拟人类记忆机制 —— 工作记忆（当前对话）+ 长期记忆（历史精华），不需要把所有历史都装进一次对话里。

---

### 5.4 防御性动态路由

**问题：** 动态模型切换在工具调用的第二阶段（工具结果 → 模型整合）会导致 400 错误，因为 `tool_calls` 消息和对应的 `tool` 消息必须属于同一模型的上下文。

**解法：** 在路由前检测 `ToolMessage` 的存在性：
```python
if any(isinstance(m, ToolMessage) for m in messages):
    return await handler(request)   # 保持当前模型，跳过路由
```

**工程意义：** 这类 "防御性判断" 在 LLM 应用开发中极为重要。多模型协作时，消息流必须保持协议一致性（OpenAI 的 tool_calls ↔ tool 消息对应关系），而不能被中间层破坏。

---

### 5.5 优雅降级设计

项目在所有外部依赖不可用时都有明确的降级策略：

| 依赖 | 不可用时的降级行为 |
|------|-----------------|
| `POSTGRES_URL` 未配置 | Checkpointer 自动降级为 `MemorySaver`（进程内记忆） |
| `POSTGRES_URL` 配置但连接失败 | 捕获异常，降级为 `MemorySaver`，服务继续运行 |
| pgvector 长期记忆检索失败 | `try/except pass`，静默跳过，不影响当前对话 |
| 工具执行异常 | `handle_tool_errors` 返回友好 `ToolMessage`，Agent 继续推理 |
| Ollama 本地模型不可用 | 此场景暂无降级（本地模型是基础依赖） |

这种 **fail-soft（软失败）** 设计保证了单个组件的故障不会导致整个服务不可用。

---

## 6. 数据流全链路追踪

以 `"现在几点了？"` + `thread_id="t1"` + `user_id="alice"` 为例：

```
1. POST /api/v1/chat/agent
   → ChatRequest { query="现在几点了？", thread_id="t1", user_id="alice" }

2. routes.py
   → get_agent_stream(query, thread_id="t1", user_id="alice")

3. agent_service.py
   → inputs = AgentState { messages=[HumanMessage("现在几点了？")], user_id="alice" }
   → config = { "configurable": { "thread_id": "t1" } }

4. AsyncPostgresSaver（LangGraph 自动执行）
   → 从 PostgreSQL checkpoints 表加载 thread_id="t1" 的历史消息
   → 与新 Human 消息合并，得到完整消息列表

5. LangGraph ReAct 图：第一节点 model
   → 触发 Middleware 链

6. inject_long_term_memory（@wrap_model_call）
   → user_id="alice" 且 POSTGRES_URL 已配置
   → pgvector.similarity_search("现在几点了？", filter={"user_id": "alice"}, k=3)
   → 假设找到记忆：["Alice 喜欢简洁的回答"]
   → request = request.override(system_prompt=原prompt + "\n- Alice 喜欢简洁的回答")

7. dynamic_model_selection（@wrap_model_call）
   → messages 中无 ToolMessage，执行路由
   → "几点" 命中关键词规则 → is_complex=True
   → model = advanced_model.bind_tools(AGENT_TOOLS)  # DeepSeek
   → request = request.override(model=model)

8. 第一次 LLM 调用（DeepSeek）
   → 输入：system_prompt + 对话历史 + "现在几点了？"
   → 输出：tool_calls = [{ name: "get_current_time", args: {} }]

9. LangGraph ReAct 图：工具节点 tools
   → 触发 handle_tool_errors（@wrap_tool_call）
   → 执行 get_current_time()
   → 返回 ToolMessage { content: "当前时间是: 2026-03-06 14:30:00" }

10. LangGraph ReAct 图：第二次进入 model 节点
    → 触发 Middleware 链

11. inject_long_term_memory → 同上（再次注入记忆）

12. dynamic_model_selection
    → 消息历史中含 ToolMessage → 跳过路由，直接透传（保持 DeepSeek）

13. 第二次 LLM 调用（DeepSeek）
    → 整合工具结果，生成流式回答
    → yield chunk: "现在是 2026年3月6日 14:30:00。"

14. get_agent_stream 流式输出给 StreamingResponse
    → 客户端收到每个 chunk 立即渲染

15. AsyncPostgresSaver 自动保存
    → 将本轮所有消息（Human + AI + Tool）写入 PostgreSQL checkpoints 表

16. asyncio.ensure_future(_extract_and_save_memories("t1", "alice"))
    → 后台任务启动（不阻塞响应）
    → 读取对话历史 → 调用 advanced_model 提炼事实
    → 假设提炼出：["Alice 询问过当前时间"]
    → long_term_memory.save("alice", "Alice 询问过当前时间")
    → pgvector 写入
```

---

## 7. 关键 Bug 及修复思路

### Bug 1：`handle_tool_errors` 在异步上下文中报 `NotImplementedError`

**现象：** `@wrap_tool_call` 装饰的是 `def`（同步函数），但 `astream_events` 是异步上下文，找不到 `awrap_tool_call` 实现。

**根因：** LangChain 1.x 的 `@wrap_tool_call` 要求：异步 Agent 调用时，被装饰的函数必须是 `async def`。

**修复：** `def handle_tool_errors` → `async def handle_tool_errors` + `await handler(request)`

---

### Bug 2：动态模型切换导致 `openai.BadRequestError 400`

**现象：** 问包含 "时间"、"几点" 等关键词的问题时，DeepSeek 第一轮产生了 `tool_calls`，工具执行后第二轮 `dynamic_model_selection` 再次路由，但这次把消息发给了另一个模型配置，OpenAI API 报 `tool role must follow tool_calls`。

**根因：** OpenAI 协议要求 `tool` 消息必须紧跟产生 `tool_calls` 的**同一次 API 调用**。若第二次调用的模型参数和第一次不完全相同（即使是同一个模型），OpenAI 会认为不合法。

**修复：** 在 `dynamic_model_selection` 中优先检测 `ToolMessage` 的存在，存在则直接透传，不执行路由逻辑。

---

### Bug 3：`AsyncPostgresSaver.setup()` 报 `cannot run inside a transaction block`

**现象：** `setup()` 内部执行 `CREATE INDEX CONCURRENTLY`，该命令 PostgreSQL 不允许在事务块中运行。

**根因：** `psycopg_pool.AsyncConnectionPool` 默认在事务模式下管理连接。

**修复：** 创建连接池时传入 `kwargs={"autocommit": True, "prepare_threshold": 0}`，所有从该池取出的连接默认处于 autocommit 模式。

---

### Bug 4：`.env` 文件路径依赖 CWD

**现象：** 从 `langchainPro/` 目录启动服务时，`DEEPSEEK_API_KEY missing` 报错（`.env` 实际在 `local_agent_api/` 下）。

**根因：** 原代码使用相对路径 `env_file = ".env"`，路径相对于启动命令的 CWD 而非代码文件。

**修复：** 改为 `_ENV_FILE = Path(__file__).parent.parent / ".env"` 计算**代码文件相对的绝对路径**。

---

## 8. 技术选型决策表

| 技术 | 选型理由 | 替代方案及放弃原因 |
|------|---------|-----------------|
| LangChain 1.x | 提供 `create_agent`、`AgentMiddleware`、`@wrap_model_call` 等 1.x 新 API，是目前最完整的 LLM 编排框架 | LlamaIndex：生态相对独立，与 LangGraph 集成复杂 |
| LangGraph | LangChain 官方的 Agent 状态图引擎，支持自定义 State、Checkpointer、循环推理 | AutoGen：多 Agent 场景更强，但单 Agent 过重 |
| Chroma | 本地持久化向量库，零依赖部署，适合私有知识库 | Pinecone：云端，需付费，有网络延迟 |
| pgvector | PostgreSQL 原生向量扩展，复用已有 PG 基础设施，支持 JSONB metadata 过滤 | Milvus/Weaviate：独立部署，运维成本高 |
| AsyncPostgresSaver | LangGraph 官方推荐的异步 PG Checkpointer，与 LangGraph 状态机深度集成 | RedisSaver：Redis 不支持持久化 WAL，宕机可能丢失 |
| FastAPI | 原生异步，天然支持 StreamingResponse，Pydantic 集成，自动生成 OpenAPI 文档 | Flask/Django：同步阻塞，不适合流式 LLM 场景 |
| psycopg v3 | 全异步，原生支持 asyncio，`psycopg_pool.AsyncConnectionPool` 性能更高 | psycopg2：同步阻塞，无法配合 asyncio |
| CrossEncoderReranker | 精排质量显著优于纯向量检索，`BAAI/bge-reranker-base` 支持中文 | LLM Reranker：效果好但每次调用 LLM 成本高 |

---

## 9. 依赖清单

```
# Web 框架
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.4.0
pydantic-settings>=2.0.0

# LangChain 1.x 核心
langchain>=1.0.0,<2.0.0
langchain-core>=0.3.0
langchain-community>=0.3.0
langchain-openai>=0.3.0
langchain-ollama>=0.3.0
langchain-text-splitters>=0.3.0

# legacy 检索组件（CrossEncoder 等）
langchain-classic>=1.0.0

# RAG 向量库
chromadb>=0.6.0
langchain-chroma>=0.2.0
langchain-huggingface>=0.1.0
sentence-transformers>=3.0.0

# 文档处理
pypdf>=4.0.0
python-multipart>=0.0.9
httpx>=0.27.0

# 长期记忆 / 持久化 Checkpointer
psycopg[binary,pool]>=3.1.0
langgraph-checkpoint-postgres>=2.0.0
langchain-postgres>=0.0.12
```
