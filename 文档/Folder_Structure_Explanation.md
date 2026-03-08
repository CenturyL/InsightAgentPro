# 目录结构解析：企业级 FastAPI + LangChain 项目

在企业级实际开发中，我们不能把所有的逻辑都塞在一个 `main.py` 里。随着项目变大（比如加入向量数据库、多种工具、不同的 Prompt 链、复杂的数据库查询），代码必须解耦，以便于维护、复用和排查问题。

当前 `local_agent_api` 项目采用了业界主流的**洋葱架构（或分层架构）**，将项目从外向内分层：分别是 HTTP 接口层、业务逻辑层（LangChain 操作）、核心配置与基础设施层。

以下是具体的目录结构及其职责解析：

```text
local_agent_api/
├── main.py              # 1. 应用程序的根本入口
├── requirements.txt     # 2. 依赖清单
├── data/                # 3. 存储本地知识库或缓存数据
├── core/                # 4. 基础设施与核心配置层 (与具体业务无关，基础底座)
│   ├── __init__.py
│   ├── config.py        # 全局配置管理
│   ├── llm.py           # 大语言模型实例化工厂
│   └── embedding.py     # 词向量转换模型实例管理
├── services/            # 5. 核心业务逻辑层 (LangChain的链、工具组装)
│   ├── __init__.py
│   ├── rag_service.py   # RAG 检索生成逻辑实现
│   └── agent_service.py # 智能体引擎调度及自定义 Tool 实现
└── api/                 # 6. HTTP 层 (对外提供服务)
    ├── __init__.py
    ├── routes.py        # 接口路由控制
    └── schemas.py       # Pydantic 接口参数校验
```

---

## 详细功能拆解

### 1. `main.py` (应用程序入口)
* **职责**：整个应用的骨架，负责创建 FastAPI 实例。在这里配置全局的 CORS（跨域）、应用的生命周期（启动时干什么、关闭时干什么）、统一的异常处理，以及**将下层 `api/routes.py` 中的路由挂载（include_router）进来**。
* **比喻**：相当于餐厅大门和总览前台。

### 2. `core/` (核心基础设施层)
这一层负责与具体业务（比如回答什么问题）无关的基础建设。它为整个项目提供基础服务。
* **`config.py`**：集中的配置中心。负责读取环境变量（如数据库路径、使用的模型名称、LLM Base URL、端口号）。好处是部署到不同环境（本地、测试、生产）时只要改这里或环境变量，不用去代码里全局搜索修改。
* **`llm.py`**：负责实例化大语言模型（如 `ChatOllama` 或 `ChatOpenAI`）。如果在整个应用中四处创建 LLM 实例会消耗过多资源，通常这里提供获取一个配置好的**全局单例**或**工厂函数**供各处使用。
* **`embedding.py`**：负责初始化并缓存 Embedding 模型（如 HuggingFace BGE 或 OpenAI Nomic）。与 `llm.py` 类似，为了避免每次调用都去加载庞大的模型而建立的封装。

### 3. `services/` (业务逻辑层)
这是项目的核心大脑。它负责将 `core` 提供的基础能力（大模型、向量）组成复杂的任务（如 LangChain 表达式语言构建的链或图）。
* **`rag_service.py`**：专门处理基于知识库的问答。包括接收文档（Document Loading）、切分文档（Text Splitting）、存储到 ChromaDB（Vector Store），以及接收用户问题返回包含了检索结果的 RAG Chain `invoke` 或 `astream` 结果。
* **`agent_service.py`**：负责更复杂的 "智能体" 逻辑。比如定义 `@tool`（网搜工具、计算器），然后编排 `create_tool_calling_agent` 和 `AgentExecutor`。用户询问“明天天气和纳斯达克指数趋势”时，会在这一层经历复杂的思考循环，最后得出结论。

### 4. `api/` (应用接口层)
这一层的职责非常单一：**只负责与外部世界通信的 HTTP 协议**。
* **`routes.py`**：定义所有的 FastAPI 接口路径，比如 `@router.post("/chat/rag")`。它**不应该包含任何复杂的 LangChain 业务逻辑**。它只需要接受请求参数，然后调用 `services` 里的函数处理，获取结果后利用 `StreamingResponse` 等方式包装成 HTTP 报文返回。
* **`schemas.py`**：使用 Pydantic V2 定义输入输出的“长相”。比如定义一个类 `class ChatRequest(BaseModel): query: str`。FastAPI 借由这个文件自动校验用户发来的数据是否符合规范，防止非法请求注入后方业务层，并能自动生成 Swagger UI 文档。

---

## 为什么这样设计？（架构优势）

1. **高内聚低耦合**：假设我们有一天觉得原本基于 LangChain 写在 `rag_service.py` 里的 RAG 效果不好，想换成用 LlamaIndex 实现。我们**只需要改写 `rag_service.py` 内部逻辑即可**。`api/routes.py`（怎么接客）完全不需要动；`core/llm.py`（怎么调大模型）也不需要动。
2. **便于多人协作与并行开发**：前端可以看着 `schemas.py` 里的定义和自动生成的接口文档开始画页面；后端的初级成员可以去写各种 `Tool` 放进 `services/`，高级成员去配置底层的 `core/llm.py` 和向量库。
3. **极具“简历加分项”**：面试官只要在这份代码里扫一眼这样的层级结构：看到有 `schemas` 处理验证、有 `core` 单例管理、有 `services` 做业务剥离，就能立刻判定你具备**能够参与中大型工程协作**的生产级开发思维，而并非只会写玩具级单文件脚本的新手。