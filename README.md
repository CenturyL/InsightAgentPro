# InsightAgent

一个面向政策通知、招投标公告与本地资料分析的多模式 Agent 平台。项目提供：

- `ReAct + Plan-and-Execute` 混合执行模式
- 本地知识库上传、结构化切块、混合检索与重排
- 长期记忆与短期会话记忆
- 离线评估、baseline 对比与系统 benchmark
- 前端工作台与 ECS + 本地后端混合部署

## 功能概览

- **简单模式**
  - 走 LangChain tool-calling agent
  - 支持知识检索、时间查询、长期记忆注入与动态模型路由
- **复杂模式**
  - 走 `planner -> executor -> reflection -> synthesizer`
  - 适合多文档比较、字段提取、结构化汇总、报告生成
- **RAG 能力**
  - 支持 `TXT / MD / PDF / HTML / CSV / TSV / PNG / JPG / JPEG / WEBP`
  - 图片先 OCR，再进入知识库
  - 当前采用 `dense + lexical + rerank + metadata filter + citation`
  - 已实现 `child 检索 + parent 回填`
- **记忆能力**
  - 短期记忆：`thread_id + checkpointer`
  - 长期记忆：`user_id + PostgreSQL/pgvector`
- **评估能力**
  - Retrieval Eval
  - Baseline Compare
  - Generation Eval
  - System Benchmark
  - 一键重建测试环境

## 仓库结构

```text
langchainPro/
├── local_agent_api/          # FastAPI 后端、Agent、RAG、评估逻辑
│   ├── agents/               # planner / executor / reflection / orchestrator
│   ├── api/                  # HTTP 路由与 schema
│   ├── core/                 # 配置、模型、记忆、中间件
│   ├── retrieval/            # 文档入库、检索、citation
│   ├── evaluation/           # 离线测评与 benchmark
│   ├── services/             # 聊天主流程、tools、评估 service
│   └── data/                 # 测试语料与评估数据集（运行时向量库已忽略）
├── local_agent_frontend/     # Vite 前端工作台
├── test/                     # 测试脚本
└── 文档/                     # 设计与学习笔记
```

## 核心架构

### 聊天主流程

- 前端请求进入 FastAPI `/api/v1/chat/agent`
- 服务层根据 query 和 `task_mode` 判断走简单或复杂路径
- 简单路径：
  - `create_agent + middleware + tools`
- 复杂路径：
  - `planner -> executor -> reflection -> synthesizer`

### RAG 主链

- 上传文件后：
  - 解析原文
  - 结构化 block 切分
  - 生成 parent / child
  - child 存入 Chroma
  - parent 存入本地 `parent_store`
- 查询时：
  - child 检索
  - `parent_id` 回填 parent
  - 返回 parent 优先的 `context_text` 与 citation

### 记忆设计

- `thread_id`：短期会话线程标识
- `user_id`：长期记忆隔离标识
- 配置 `POSTGRES_URL` 时：
  - LangGraph checkpointer 使用 PostgreSQL
  - 长期记忆使用 pgvector
- 未配置时：
  - 自动降级为进程内 MemorySaver

## 主要技术栈

- **后端**：FastAPI, LangChain, LangGraph
- **模型**：Ollama / Qwen, DeepSeek API
- **检索**：Chroma, BGE Reranker, pgvector
- **前端**：Vite, Vanilla JS
- **部署**：ECS + macOS backend + Windows Ollama + EasyTier + Nginx

## 本地开发

### 1. 后端

推荐 Python 3.11，并在 `local_agent_api/.env` 中配置必要环境变量。

示例：

```env
DEEPSEEK_API_KEY=your_key
POSTGRES_URL=postgresql://user:password@host:5432/dbname
EMBEDDING_DEVICE=auto
RERANKER_DEVICE=auto
```

启动：

```bash
cd /Users/century/code/agent/langchainPro
conda run --no-capture-output -n agent uvicorn local_agent_api.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### 2. 前端

```bash
cd /Users/century/code/agent/langchainPro/local_agent_frontend
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

## 部署说明

当前线上采用：

- **ECS**
  - 承载 Nginx 与静态前端
  - 作为公网入口
- **macOS**
  - 承载真实 FastAPI 后端
- **Windows**
  - 承载本地 Ollama / Qwen
- **EasyTier**
  - 打通三台机器内网访问

Nginx 负责：

- 提供前端静态资源
- 将 `/api/*` 请求反向代理到 macOS 后端
- 保持流式响应能力

## 评估体系

- **Retrieval Eval**
  - 测检索质量：`Precision@K / Recall@K / MRR / nDCG`
- **Baseline Compare**
  - 对比 `dense_only / dense_rerank / hybrid_only / hybrid_rerank`
- **Generation Eval**
  - 评估 `answer_relevance / faithfulness / citation_accuracy / keyword_coverage`
- **System Benchmark**
  - 评估 retrieval latency、simple/complex request latency、peak memory

## 注意事项

- `.env`、本地向量库、构建产物与 `node_modules` 不应提交到仓库
- 后端真实运行在本机时，修改后端代码后需要手动重启本地 `uvicorn`
- 如果 `.env` 曾经进入 Git 历史，建议轮换其中真实密钥
