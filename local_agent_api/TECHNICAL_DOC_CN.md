# InsightAgent 技术设计文档（中文版）

> 本文档用于说明当前项目的技术设计、模块职责和实现边界。  
> 这份文档强调“当前代码已经做到什么”，不是只讲理想蓝图。

## 目录

- [1. 项目定位](#1-项目定位)
- [2. 业务场景](#2-业务场景)
- [3. 当前整体架构](#3-当前整体架构)
- [4. 执行模式设计](#4-执行模式设计)
- [5. 模型层设计](#5-模型层设计)
- [6. 检索与 RAG 设计](#6-检索与-rag-设计)
- [7. 存储设计](#7-存储设计)
- [8. 记忆系统设计](#8-记忆系统设计)
- [9. 多模态入库设计](#9-多模态入库设计)
- [10. API 与服务设计](#10-api-与服务设计)
- [11. 评估与 Benchmark 设计](#11-评估与-benchmark-设计)
- [12. 测试环境重建设计](#12-测试环境重建设计)
- [13. 当前真实结果](#13-当前真实结果)
- [14. 当前限制与后续演进](#14-当前限制与后续演进)
- [15. 学习路径建议](#15-学习路径建议)

## 1. 项目定位

InsightAgent 当前的主定位是：

**一个面向政策通知、招投标公告和本地知识资料分析的 Agent 平台。**

它不是单纯聊天接口，也不是只做一个最基础的 RAG Demo，而是尝试把以下几类能力放到同一套后端里：

- 简单问答与工具调用
- 复杂任务的规划与执行
- 现代化检索链路
- 长短期记忆
- 可量化评估
- 可复现实验环境

补充说明：

- 公司内部制度、办公规则、WIFI 等查询能力仍然保留
- 但这些能力已经降级为辅助 tool
- 当前系统的主身份和主要使用场景都收敛到政策与招投标分析

## 2. 业务场景

系统当前适合的典型任务包括：

1. 解析政策通知，提炼支持对象、支持方向、申报条件、时间节点
2. 对比两份或多份政策文件差异
3. 从招标公告和附件中提取资格要求、截止时间、评分项等关键字段
4. 基于知识库回答问题，并给出证据引用
5. 记住用户长期偏好、关注地区和历史事实

## 3. 当前整体架构

```text
Browser / Frontend
    │
    ▼
FastAPI API Layer
  - /chat/stream
  - /chat/agent
  - /knowledge/upload
  - /eval/retrieval
  - /eval/retrieval/compare
  - /eval/generation
  - /eval/benchmark
  - /testing/rebuild
    │
    ▼
Service Layer
  - agent_service
  - rag_service
  - eval_service
  - test_env_service
    │
    ▼
Execution Layer
  - simple agent path
  - planner / executor / reflection / synthesizer
  - middleware
    │
    ▼
Retrieval / Memory Layer
  - retrieval.pipeline
  - retrieval.citation
  - short-term memory
  - long-term memory
    │
    ▼
Storage Layer
  - Chroma
  - PostgreSQL + pgvector
  - local files / eval datasets
```

当前项目的架构特点是：

- API 层和服务层比较清晰
- 简单问题和复杂问题分两条执行路径
- 检索、记忆、评估已经独立成模块
- 主知识库存储和长期记忆存储没有完全统一

## 4. 执行模式设计

### 4.1 为什么要双模式

项目没有把所有请求都强制交给 Planner。

原因：

- 简单问题用多步规划会显著增加时延
- 复杂问题只靠单轮 Tool Calling 又不稳定

所以当前代码采用双模式：

- **Simple Path**
  - 基于 `create_agent`
  - 更接近 ReAct / Tool Calling Agent
- **Complex Path**
  - 基于 planner / executor / reflection / synthesizer
  - 属于 Plan-and-Execute

### 4.2 简单路径

适合：

- 身份问答
- 时间问答
- 单轮知识查询
- 简单内部知识查询

特点：

- 使用 middleware 做长期记忆注入、模型路由和工具异常兜底
- 支持短期会话记忆
- 支持工具调用事件流式输出

### 4.3 复杂路径

适合：

- 比较
- 对比分析
- 抽取
- 结构化报告

当前触发条件包括：

- query 长度超过阈值
- 命中关键词：`比较 / 对比 / 分析 / 报告 / 提取 / 表格 / 风险`
- 前端显式传入 `task_mode=compare/extract/report`

复杂路径的执行顺序是：

1. planner 生成结构化计划
2. executor 按步骤检索证据
3. reflection 对失败步骤补召回
4. synthesizer 汇总生成最终答案

## 5. 模型层设计

实现位置：

- [llm.py](/Users/century/code/agent/langchainPro/local_agent_api/core/llm.py)
- [middleware.py](/Users/century/code/agent/langchainPro/local_agent_api/core/middleware.py)

当前有两个核心模型对象：

- `basic_model`
  - 本地 `ChatOllama`
  - 当前通常连接 Windows 上的 Qwen
- `advanced_model`
  - `ChatOpenAI` 兼容接口
  - 当前通常连接 DeepSeek API

### 5.1 简单路径模型路由

在 `dynamic_model_selection` middleware 中：

- 短问题、低复杂度：优先本地 Qwen
- 长问题、复杂关键词、多轮深入上下文：切 DeepSeek

### 5.2 复杂路径模型使用方式

复杂路径里当前没有做特别复杂的模型编排，而是比较直接：

- planner：DeepSeek
- synthesizer：DeepSeek
- executor / reflection：本地检索链 + 证据组织

### 5.3 当前前端如何显示模型来源

当前前端会在答案开头显示：

- `本地 Qwen（Ollama）`
- 或 `DeepSeek API`

方便你调试和演示。

## 6. 检索与 RAG 设计

实现位置：

- [pipeline.py](/Users/century/code/agent/langchainPro/local_agent_api/retrieval/pipeline.py)
- [citation.py](/Users/century/code/agent/langchainPro/local_agent_api/retrieval/citation.py)

### 6.1 当前主检索链

当前不是单一 dense retrieval，而是：

1. `dense_search_knowledge`
2. `lexical_search_knowledge`
3. merge + dedup
4. `CrossEncoderReranker`
5. citation build

支持的策略包括：

- `dense_only`
- `dense_rerank`
- `hybrid_only`
- `hybrid_rerank`

### 6.2 metadata filter

当前支持按照 metadata 做过滤，例如：

- `source`
- `region`
- `year`
- `source_type`

前端也可以通过 `metadata_filters` 直接传入。

### 6.3 citation 输出

检索结果最终会被打包成：

- `docs`
- `context_text`
- `citations`
- `applied_filters`

所以后端能在回答时给证据，前端也能展示引用来源。

### 6.4 chunk 策略

当前已经不是最初的固定字符切块，而是混合策略：

- 标题感知父块
- 文本语义窗口子块
- 表格行窗口切块

核心函数包括：

- `_extract_structured_blocks`
- `_split_text_block`
- `_split_table_block`
- `_build_chunk_documents`

## 7. 存储设计

当前系统采用分层存储。

### 7.1 Chroma

作用：

- 当前主知识库向量存储
- 存放文档 chunk 和 metadata
- 提供相似度检索

### 7.2 PostgreSQL + pgvector

作用：

- 长期记忆
- 可选 LangGraph 持久化 checkpointer

### 7.3 本地文件系统

作用：

- 测试文档
- 评估数据集
- Chroma 持久化目录
- 上传临时文件

### 7.4 当前存储状态要说准确

当前项目并不是“所有东西都在 pgvector”。

更准确的说法是：

- 主知识库：目前主要是 Chroma
- 长期记忆：目前是 PostgreSQL + pgvector
- 会话持久化：可选 PostgresSaver

## 8. 记忆系统设计

实现位置：

- [memory.py](/Users/century/code/agent/langchainPro/local_agent_api/core/memory.py)
- [middleware.py](/Users/century/code/agent/langchainPro/local_agent_api/core/middleware.py)
- [agent_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/agent_service.py)

### 8.1 短期记忆

短期记忆依赖：

- `thread_id`
- `MemorySaver` 或 `AsyncPostgresSaver`

当前行为：

- 同一个 `thread_id` 下保留完整消息历史
- 如果配置了 `POSTGRES_URL`，重启后也可恢复
- 如果没配置，重启进程后短期会话就丢失

### 8.2 长期记忆

长期记忆依赖：

- `user_id`
- `PostgreSQL + pgvector`

当前行为：

- 请求进入时，按 `user_id + 当前 query` 从 pgvector 检索最相关事实
- 检索结果注入 system prompt
- 对话结束后，从最近消息中抽取用户事实并异步写回 pgvector

### 8.3 当前已经实现的长期记忆链路

1. 用户请求进入
2. middleware 判断是否有 `user_id`
3. 判断是否配置了 `POSTGRES_URL`
4. 若满足条件，调用 `long_term_memory.search(...)`
5. 将记忆注入 system prompt
6. 对话结束后后台执行 `_extract_and_save_memories(...)`
7. 将提取到的事实写入 pgvector

### 8.4 当前没有实现的部分

现在**没有实现**以下能力：

- 超过 10 轮自动摘要前 8 轮历史消息
- summary 替换旧消息原文
- 独立的 message pruning / summary node

所以你在面试里要准确说：

- 已实现长期记忆
- 已实现短期记忆
- 未实现会话摘要压缩节点

## 9. 多模态入库设计

当前支持的文件类型：

- `txt`
- `md`
- `pdf`
- `html`
- `csv`
- `tsv`
- `png / jpg / jpeg / webp`

### 9.1 各类型处理方式

- PDF：`PyPDFLoader`
- HTML：清洗标签后转纯文本
- CSV/TSV：按表格行标准化
- 图片：使用 `tesseract` 做 OCR

### 9.2 metadata 补充

当前会为 chunk 增加 metadata，例如：

- `source`
- `source_hash`
- `source_type`
- `modality`
- `year`
- `section_path`
- `block_type`
- `parent_id`
- `chunk_strategy`

### 9.3 去重逻辑

当前通过：

- 文件 hash
- source 路径

避免重复入库。

## 10. API 与服务设计

### 10.1 主要接口

- `/api/v1/chat/stream`
- `/api/v1/chat/agent`
- `/api/v1/knowledge/upload`
- `/api/v1/eval/retrieval`
- `/api/v1/eval/retrieval/compare`
- `/api/v1/eval/generation`
- `/api/v1/eval/benchmark`
- `/api/v1/testing/rebuild`

### 10.2 服务层职责

- `agent_service`
  - 对话入口
  - 路由执行模式
  - 流式返回
- `rag_service`
  - 基础 RAG 生成链
- `eval_service`
  - 统一评估调度
- `test_env_service`
  - 一键重建测试环境

### 10.3 前端控制台当前能力

当前前端支持：

- 流式对话
- 聊天记录展示
- 执行过程展示
- 当前回答展示
- 模型来源标注
- 测试环境重建
- 知识库上传
- 评估与 benchmark 面板

## 11. 评估与 Benchmark 设计

### 11.1 检索评估

实现位置：

- [retrieval_eval.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/retrieval_eval.py)
- [retrieval_compare.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/retrieval_compare.py)

当前指标：

- Precision@k
- Recall@k
- MRR
- nDCG@k
- hit_rate
- 平均检索时延

### 11.2 生成评估

实现位置：

- [generation_eval.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/generation_eval.py)

当前指标：

- answer_relevance
- faithfulness
- citation_accuracy
- keyword_coverage

### 11.3 系统 benchmark

实现位置：

- [system_benchmark.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/system_benchmark.py)

当前覆盖：

- retrieval avg latency
- retrieval p95 latency
- simple request latency
- complex request latency
- peak python memory

## 12. 测试环境重建设计

实现位置：

- [test_env_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/test_env_service.py)
- [scripts/rebuild_test_env.py](/Users/century/code/agent/langchainPro/local_agent_api/scripts/rebuild_test_env.py)

当前可一键完成：

1. 下载公开测试文档
2. 清洗文档
3. 入库到 Chroma
4. 重建 retrieval / generation 数据集
5. 可选自动跑一次 retrieval eval

这块的价值是：

- 环境可重建
- 指标可复现
- 演示成本更低

## 13. 当前真实结果

### 13.1 当前语料规模

- 有效主题文档：10 份
- 主题 chunk：125 个

### 13.2 Smoke 集

- Precision@3 = 1.0
- Recall@3 = 1.0
- MRR = 1.0
- nDCG@3 = 1.0

### 13.3 Compare 集 baseline

`hybrid_rerank` 相比 `dense_only`：

- Recall@3 +3.57pp
- MRR +7.15pp

### 13.4 系统 benchmark

- 平均检索时延：1518.38ms
- 检索 P95：11309.02ms
- 复杂任务端到端时延：40565.33ms
- 峰值 Python 内存：141.53MB

这些数字的意义不是证明“系统非常快”，而是证明：

- 你做了 baseline 对比
- 你做了效果与代价的量化
- 你的优化是有对照的

## 14. 当前限制与后续演进

当前最重要的限制包括：

1. 会话摘要压缩节点尚未实现
2. 主知识库还以 Chroma 为主，尚未统一到 pgvector
3. 多模态仍然属于“文本主导 + OCR/表格支持”，还不是完整 VLM 系统
4. planner / executor 步骤级耗时日志还不够细
5. 复杂任务链路整体时延偏高
6. 部署方式更偏个人项目，不是生产级高可用方案

## 15. 学习路径建议

如果你准备从代码层面详细学习这个项目，建议按下面顺序读：

### 15.1 入口层

- [main.py](/Users/century/code/agent/langchainPro/local_agent_api/main.py)
- [routes.py](/Users/century/code/agent/langchainPro/local_agent_api/api/routes.py)
- [schemas.py](/Users/century/code/agent/langchainPro/local_agent_api/api/schemas.py)

先搞清楚：

- 有哪些接口
- 每个接口收什么参数
- 最后调哪个 service

### 15.2 服务层

- [agent_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/agent_service.py)
- [rag_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/rag_service.py)
- [eval_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/eval_service.py)
- [test_env_service.py](/Users/century/code/agent/langchainPro/local_agent_api/services/test_env_service.py)

重点理解：

- 请求如何分流
- stream 如何返回
- 评估和重建如何触发

### 15.3 Agent 编排层

- [router.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/router.py)
- [state.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/state.py)
- [planner.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/planner.py)
- [executor.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/executor.py)
- [reflection.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/reflection.py)
- [orchestrator.py](/Users/century/code/agent/langchainPro/local_agent_api/agents/orchestrator.py)

重点理解：

- 为什么有双模式
- planner 生成什么
- executor 怎么调检索
- reflection 怎么补救失败步骤

### 15.4 检索层

- [pipeline.py](/Users/century/code/agent/langchainPro/local_agent_api/retrieval/pipeline.py)
- [citation.py](/Users/century/code/agent/langchainPro/local_agent_api/retrieval/citation.py)

重点理解：

- 文档怎么入库
- chunk 怎么切
- dense / hybrid / rerank 如何组合
- metadata 如何影响检索

### 15.5 记忆与 middleware

- [middleware.py](/Users/century/code/agent/langchainPro/local_agent_api/core/middleware.py)
- [memory.py](/Users/century/code/agent/langchainPro/local_agent_api/core/memory.py)
- [config.py](/Users/century/code/agent/langchainPro/local_agent_api/core/config.py)

重点理解：

- 长期记忆如何注入
- `user_id` 和 `thread_id` 分别管理什么
- `POSTGRES_URL` 配与不配分别意味着什么

### 15.6 评估层

- [retrieval_eval.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/retrieval_eval.py)
- [retrieval_compare.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/retrieval_compare.py)
- [generation_eval.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/generation_eval.py)
- [system_benchmark.py](/Users/century/code/agent/langchainPro/local_agent_api/evaluation/system_benchmark.py)

重点理解：

- 指标如何计算
- baseline 为什么重要
- benchmark 的口径是什么

---

这份中文版设计文档现在遵循和完整技术文档相同的原则：

- 已实现的能力，按当前代码写清楚
- 未实现的能力，明确标未完成
- 不把理想规划和当前实现混为一谈
