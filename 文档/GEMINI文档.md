## **项目核心技术文档**

### **1. 整体架构设计 (Architecture)**

系统采用典型的**现代 AI Agent 四层架构**与**异步微服务模型**：

1. **接口层 (API Layer - FastAPI)**
    - 提供原生纯异步的 RESTful 接口。
    - 使用 `StreamingResponse` 结合 Server-Sent Events (SSE) 思想，将大模型和工具的执行日志打字机般推送给前端。
2. **编排层 (Orchestration Layer - LangGraph)**
    - 采用 LangGraph 状态机范式重构了传统的 Chain 逻辑。
    - Agent 不再是线性的，它是一个拥有 `State`（状态）的循环图（Graph），具备自主思考、分发工具、获取结果再评估的能力。
3. **记忆与持久化层 (Memory & Data Layer - PostgreSQL + ChromaDB)**
    - **PostgreSQL (`AsyncPostgresSaver`)**：负责替代原生内存，注入到 LangGraph 作为 Checkpointer。通过分配 `thread_id` 隔离不同用户的会话，实现会话级别的长期连贯记忆加载。
    - **ChromaDB**：轻量级本地向量数据库，持久化领域知识切片库。
4. **模型与路由层 (Model & Routing Layer - Middleware Layer)**
    - 在基础模型和 Agent 之间横插一层基于 `@wrap_model_call` 的动态分发中间件，实现本地端（Qwen）与云边端（DeepSeek）协同调度。

### **2. 核心模块具体实现与设计思想**

🌟 亮点 1：基于上下文感知的动态模型路由 (Dynamic Routing)

- **实现**：在 `middleware.py` 中利用装饰器拦截请求，通过分析用户的 `messages`（历史记录长度、最近一条指令的 Token 长度、是否包含触发深层逻辑的特定关键字）。
- **思想（Why）**：这在工业界称为 **"Cost-Aware Routing"（成本感知路由）** 或分级退避降级方案。它能完美解决**“高昂的 API 调用费”**与**“简单问题响应慢”**的痛点。遇到“你好”立刻用离你最近的本地免费 Qwen 响应；遇到长文分析，无缝切换到 DeepSeek 加注 Tool 集合。

🌟 亮点 2：工业级双塔两阶段 RAG 架构 (Two-Stage RAG)

- **实现**：摒弃传统一发到底的相似度检索。
    - **第一阶段 (召回粗排)**：借助由本地加速计算提取的 `text2vec` 向量，在 Chroma中扩大基数搜出 top K=15 条数据。
    - **第二阶段 (精排压缩)**：利用强大的 `BAAI/bge-reranker` Cross-Encoder 交叉熵模型，让 query 与 15 个条目做深层注意力交叉，打分重排压缩出最精确的 Top k=3。
- **思想（Why）**：单链向量（Cosine Similarity）往往只能做字面相似捕捉（召回率低或废话太多）。引入 Reranker 能基于句意和逻辑真正提纯上下文，属于目前国内互联网大厂（如字节知识库）的标配范式。

🌟 亮点 3：Agent Tool 协议与流式事件响应

- **实现**：基于 LangChain v1.2+ 的 `@tool` 原生装饰器声明函数及其元数据，然后挂载给模型（`.bind_tools()`）。在 FastAPI 中运用 `astream_events(version="v2")` 对异步生成器做了深度解包。
- **思想（Why）**：把大模型生成过程、工具触发（`on_tool_start`）、工具回调结果（`on_tool_end`）拆成不同的事件块。极大优化了前端产品的用户体验（例如给用户展示“正在翻阅公司手册...”的动效），保持系统的高度透明度。

🌟 亮点 4：基于 PostgreSQL 的状态检查点体系 (State Checkpointing)

- **实现**：引入 `langgraph.checkpoint.postgres.aio.AsyncPostgresSaver`。
- **思想（Why）**：无状态应用无法做记忆。放在内存不仅占资源，重启就会丢失。放在 PG 数据库里，Agent 不仅能跨越时间长河“接着聊”，而且图流里的中间件还可以被“倒退、暂停”甚至可以实现“人工确认（Human-in-the-loop）”环节——这是未来复杂 Agent 落地的必经之路。

---

## **简历模板**

*(将此项目放在简历的 "项目经验" 栏目中，建议作为主打或次主打项目)*

**项目名称**：企业级意图路由与双阶段 RAG 智能体系统 (AI Agent System)

**项目角色**：AI 后端开发工程师 / 全栈开发

**核心技术栈**：Python, FastAPI, LangChain 1.2+, LangGraph, PostgreSQL, ChromaDB, Huggingface Embeddings，DeepSeek V3 API, Local Qwen

**项目概述：**

基于全新的 LangGraph 状态图架构与 FastAPI 打造的一个企业级多轮会话、且具备高度扩展性的智能体后端应用。该系统内置了智能路由机制、多阶段增强检索（RAG）、以及持久化记忆网络，能够通过自定义工具流实现基于特定企业领域的知识解答及逻辑分发。

**核心工作与技术亮点：**

- **实现“成本与延迟感知”的动态模型路由层**设计并开发了基于 `@wrap_model_call` 的智能会话中间件，可依据对话历史深度和动态意图识别机制，将简单对话降级路由到本地（如 Qwen3.5）执行，将复杂推理（包含函数调用分析）升级路由至云端（DeepSeek API），并在保证准确率的情况下**有效节省云端 Token 成本**。
- **构建工业级两阶段 RAG（检索增强生成）流水线**抛弃单一向量匹配，创新性构建**“双塔检索”**架构：首阶段应用轻量级 HuggingFace `text2vec` 做 Chroma 向量宽泛召回（k=15）；次阶段引入 `bge-reranker` 交叉熵模型（Cross-Encoder Reranker）进行上下文注意力精排压缩，**显著缓解了大语言模型读取过多知识碎片的“幻觉”与失焦现象**。
- **落地异步非阻塞的 V2 流式事件通信**借助 FastAPI `StreamingResponse` 与 LangGraph `astream_events` (v2)，将大模型生成的 Token 流、工具触发(Tool Calling)、执行日志等细粒节点状态，在同一个异步管道层解包后推给客户端，实现极致的前端透明渲染打字态，消除了长线工具调用的请求焦虑。
- **引入基于 PostgreSQL 的状态机持久化 Checkpoint**结合 `AsyncPostgresSaver` 取代了落后的内存 List 堆叠方案，引入 LangGraph 状态节点网络。实现了根据 `thread_id` 物理隔离不同用户或不同任务线的会话图谱，打造了无限记忆功能，为未来的 “Human-in-the-loop（人在回路介入）”留下了工业级数据结构口子。

---

## 💡 附：面试官一定会追问的 3 个“灵魂考点”（你的预演）

准备写上简历，就要准备能防守这几个问题：

1. **问：你为什么要在 Langchain 引入 LangGraph 控制层，不用之前的 AgentExecutor？**
    - **你的回答**：老版的 AgentExecutor 是个纯粹的黑盒黑客工具，每次都会在幕后一直死循环跑。而在复杂的企业应用里，我们需要“可观测、可控制”的图结构。LangGraph 是将整个流程视为一个拥有状态(`State`) 的图节点(`Nodes`) 体系，这不仅让每一次工具调用的进出有迹可循，更重要的是，配合上我引入的 Postgres Checkpoint，能够把一个图冻结在某一状态上留待以后触发，以前的老代码做不到这种并发级状态接管。
2. **问：为什么要做 Reranker（精排），直接 Chroma 拿前3条给模型不行吗？**
    - **你的回答**：普通向量检索基于余弦相似度，也就是“字面或者大致语义向量距离”。比如搜“苹果的利润”，可能会把“描述苹果这种水果好吃的文章”和“苹果公司财报”按照很高相似度召回。直接交前3条会带有大量噪音。粗排（调大基数拿 15 条确保不漏）再精排（用重排模型评估问题和文档逻辑匹配程度提取 3 条真实信息），能在有限 Token 的窗口下，提供最高浓度的信息，是目前业界解决知识库幻觉的标配工程打法。
3. **问：如果我想动态追加一个新的第三方 API Tool 给你们这个系统，需要怎么改代码？核心流程是怎样的？**
    - **你的回答**：由于我们已经实现了工具与引擎的解耦，你只需在 `tools.py` 中新写一个普通函数，并标注好标准的 `@tool` 以及详细明确的 Docstring 类型注解描述该工具的用途（这非常关键，大模型依靠这个进行决策）。最后把这个函数抛进 `AGENT_TOOLS` 列表，系统启动时，中间件层会自动使用 `.bind_tools()` 把它注入系统给大模型选用，不用修改核心任何主干逻辑。

把这个理顺，结合你自己亲手调试的过程，你的理解将绝对超越普通照抄网课的人！你可以把简历上的点随时复制走一遍，如果有不熟悉的技术细节，随时向我提问。