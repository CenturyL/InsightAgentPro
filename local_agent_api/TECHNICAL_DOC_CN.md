# InsightAgent 技术设计文档（中文版）

## 1. 项目定位

### 1.1 项目名称

InsightAgent：基于 LangChain 1.2、LangGraph、现代化 RAG 与 pgvector 的多模态政策与招投标情报分析 Agent 平台。

### 1.2 项目目标

本项目用于打造一个适合写进简历、也适合在面试中展开讲解的 Agent 项目。系统需要体现以下能力：

- 基于 LangChain 1.2 / LangGraph 的标准化 Agent 架构
- 支持 PDF、扫描件、图片、表格、网页等多模态预处理
- 支持现代化智能 RAG，包括混合检索、重排、元数据过滤与引用
- 支持复杂任务的 Plan-and-Execute
- 支持基于 pgvector 的长期记忆
- 支持离线评估，包括检索精度、召回率和答案质量
- 支持本地微调数据构建，用于领域问答和结构化抽取优化

### 1.3 为什么选择这个主题

项目主题定为“产业政策与招投标情报分析 Agent”。

原因如下：

- 数据天然多模态，包含政策 PDF、扫描附件、公告网页、表格、图片等
- 知识更新快，适合体现 RAG 的实际价值
- 复杂任务多，天然适合 Plan-and-Execute
- 用户通常会持续关注某些行业、地区和政策方向，长期记忆有明确价值
- 比“通用聊天助手”更接近真实业务系统，更适合写进简历

补充说明：

- 公司内部制度、办公规则、WIFI 等内部知识查询能力会保留
- 但这些能力在系统中属于辅助 tool，不再作为产品主定位
- 默认人设、默认检索路径和默认展示场景都以政策与招投标分析为主


## 2. 业务场景

系统主要覆盖以下典型场景：

1. 解析一份政策 PDF，提炼申报条件、补贴金额、截止时间和适用企业画像
2. 对比不同城市或区县的政策差异，并生成结构化对比结果
3. 从招标公告和附件中抽取资格要求、截止时间、评分规则等关键字段
4. 基于知识库回答领域问题，并给出证据引用
5. 记住用户长期关注的地区、行业和输出偏好，实现跨会话个性化辅助


## 3. 技术目标

### 3.1 功能目标

- 支持 PDF、扫描 PDF、图片、HTML、TXT 等文档导入
- 支持多模态解析与统一结构化清洗
- 支持简单任务的 ReAct 式工具调用
- 支持复杂任务的 Plan-and-Execute
- 支持带引用的知识检索问答
- 支持按用户隔离的长期记忆
- 支持检索与生成质量评估
- 支持本地微调和 RAG 测试数据集构建

### 3.2 工程目标

- 模块边界清晰，支持渐进式重构
- 对齐 LangChain 1.2 / LangGraph 新范式
- 易于扩展新解析器、检索器和评估任务
- 易于在面试中解释设计思路和工程取舍
- 能够在当前仓库基础上逐步演进，而不是推翻重写


## 4. 总体架构

### 4.1 分层概览

系统分为七层：

1. API 接入层
2. Agent 编排层
3. 规划与执行层
4. 检索层
5. 记忆层
6. 多模态数据处理层
7. 评估与数据集层

### 4.2 各层职责

#### API 接入层

负责对外提供接口、请求校验、流式输出和任务触发。

主要职责：

- FastAPI 路由
- SSE 或纯文本流式响应
- 文档上传与入库触发
- 评估任务触发

#### Agent 编排层

负责将请求路由到不同执行模式，并统一管理上下文与输出。

主要职责：

- 注入短期记忆和长期记忆
- 判断走 ReAct 还是 Plan-and-Execute
- 管理 LangGraph 执行状态
- 汇总最终答案与引用

#### 规划与执行层

负责复杂任务的拆解、分步执行与失败反思。

主要职责：

- Planner 生成结构化执行计划
- Executor 按步骤调用检索或工具
- Reflection 在步骤失败时重试或扩展检索
- Synthesizer 汇总中间结果形成最终答案

#### 检索层

负责现代化 RAG。

主要职责：

- 混合检索
- 查询改写与分解
- 重排
- 元数据过滤
- 引用打包

#### 记忆层

负责多轮对话和跨会话用户上下文。

主要职责：

- 短期记忆
- 长期语义记忆
- 用户偏好与画像记忆

#### 多模态数据处理层

负责文档解析、清洗、标准化和入库。

主要职责：

- OCR 与版面分析
- 表格抽取
- 文档去重与清洗
- 切块与索引构建
- 元数据补全

#### 评估与数据集层

负责量化质量与构建训练测试数据。

主要职责：

- 检索评估
- 生成评估
- Agent 任务评估
- 微调与测试数据集构建


## 5. 核心技术决策

### 5.1 对齐 LangChain 1.2 标准

项目整体遵循 LangChain 1.2 的设计风格：

- 简单任务使用 `langchain.agents.create_agent`
- 复杂任务使用 LangGraph 做状态化编排
- 使用 middleware 做模型路由、记忆注入和异常兜底
- 使用 TypedDict 或结构化状态管理执行过程

### 5.2 ReAct 与 Plan-and-Execute 并存

系统不会对所有请求都强制使用 Plan-and-Execute。

原因：

- 简单问题不需要额外规划，直接走轻量 Agent 更快
- 复杂任务如果只靠单轮工具调用，容易步骤混乱、遗漏信息

因此采用双模式：

- Fast ReAct Mode：处理轻量、单轮、低步骤任务
- Plan-and-Execute Mode：处理分析、比较、抽取、报告等复杂任务

这种设计更符合真实工程场景，也更适合在面试中展示系统设计能力。

### 5.3 PostgreSQL + pgvector 作为目标统一存储

长期目标是将知识库与长期记忆统一收敛到 PostgreSQL + pgvector。

原因：

- 知识库与记忆使用统一持久化底座
- 更适合简历中描述为生产级能力
- 更容易做元数据过滤、统计分析和评估记录
- 更方便后续扩展 Hybrid Retrieval

短期内 Chroma 可以保留作为兼容方案，但目标架构应以 PostgreSQL + pgvector 为主。


## 6. 详细设计

## 6.1 API 设计

### 6.1.1 核心接口

`POST /api/v1/chat/agent`

- 统一 Agent 入口
- 支持 `thread_id`、`user_id`、query、响应模式等参数

`POST /api/v1/knowledge/upload`

- 上传文档并触发入库流程

`POST /api/v1/knowledge/reindex`

- 重建或刷新知识索引

`POST /api/v1/eval/retrieval`

- 触发离线检索评估

`POST /api/v1/eval/generation`

- 触发答案质量评估

`POST /api/v1/datasets/build`

- 构建本地微调数据和测试数据

### 6.1.2 请求模式

接口可支持以下任务模式：

- `qa`：普通问答
- `compare`：对比分析
- `extract`：结构化抽取
- `report`：生成分析报告

MVP 阶段可以不强制前端传 mode，由系统根据 query 自动判断。


## 6.2 Agent 编排设计

### 6.2.1 总体策略

复杂任务统一由 LangGraph 编排，显式表达节点和状态流转。

建议节点如下：

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

### 6.2.2 路由逻辑

系统根据以下信号判断是否进入复杂模式：

- query 长度较长
- 出现比较、分析、报告、抽取、风险审查等意图
- 需要跨多个来源汇总
- 要求生成结构化输出，如表格或分点报告

一旦命中复杂条件，进入 Plan-and-Execute。

### 6.2.3 状态设计

LangGraph 状态至少包括：

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


## 6.3 ReAct 模式设计

### 6.3.1 适用场景

ReAct 模式用于简单任务，例如：

- 查询某条政策规定
- 查询某个时间点或名词解释
- 对单个文档做短摘要
- 只需一次检索即可回答的问题

### 6.3.2 执行流程

流程如下：

1. 接收用户问题
2. 注入记忆和上下文
3. 模型判断是否需要调用工具
4. 检索知识并重排
5. 生成带引用的最终答案
6. 回写稳定长期记忆

### 6.3.3 初始工具集

建议初始工具包括：

- `search_domain_knowledge`
- `get_current_time`
- `extract_document_sections`
- `lookup_user_preference`

后续可扩展：

- `compare_policy_spans`
- `extract_bid_fields`
- `generate_outline`


## 6.4 Plan-and-Execute 设计

### 6.4.1 设计目标

Plan-and-Execute 是新版本的核心能力之一，必须保留。

它用于处理：

- 多文档对比
- 多字段抽取
- 风险审查
- 长文本综合分析
- 结构化报告生成

### 6.4.2 Planner 设计

Planner 接收用户目标，生成结构化计划。

每个计划步骤包含：

- `step_id`
- `goal`
- `reason`
- `required_capability`
- `expected_output`
- `status`

示例步骤：

1. 找到相关政策文档
2. 抽取申报条件片段
3. 抽取截止时间片段
4. 对比关键字段
5. 生成最终表格和结论

Planner 应尽量输出短小、明确、可执行的步骤，避免空泛计划。

### 6.4.3 Executor 设计

Executor 按顺序执行 Planner 生成的步骤。

每一步都需要：

- 读取当前步骤目标
- 决定调用检索或工具
- 获取中间结果
- 校验步骤是否完成
- 将结果写入 `step_results`

Executor 的重点是稳定执行，而不是每一步都重写计划。

### 6.4.4 Reflection 设计

当出现以下情况时进入 Reflection：

- 证据召回不足
- 片段相互矛盾
- 抽取结果缺失关键字段
- 最终输出格式不满足要求

Reflection 可以做的动作：

- 改写查询后重试
- 放宽过滤条件
- 增加补充检索
- 将步骤标记为部分完成并给出不确定性说明

### 6.4.5 Synthesizer 设计

Synthesizer 汇总所有步骤结果，生成最终输出。

输出内容至少包括：

- 最终答案
- 用户要求的结构
- 引用证据
- 证据不足时的显式说明

### 6.4.6 简历价值

Plan-and-Execute 的价值在于它体现了：

- 明确的任务拆解
- 中间状态管理
- 图式编排能力
- 步骤失败兜底能力
- 更接近真实业务分析系统的执行逻辑


## 6.5 多模态预处理设计

### 6.5.1 支持的输入

- 原生 PDF
- 扫描 PDF
- 图片
- HTML 页面
- Markdown / TXT
- 后续可扩展 DOCX

### 6.5.2 处理流程

推荐流程：

1. 文件校验
2. 文件指纹生成与去重
3. 解析器选择
4. OCR
5. 版面分析
6. 表格抽取
7. 图片或图表摘要
8. 统一转为 Markdown 和结构化 JSON
9. 元数据补全
10. 切块与索引

### 6.5.3 推荐工具栈

- MinerU：适合中文复杂 PDF 和版面恢复
- Docling：通用结构化文档解析
- PaddleOCR 或其他稳定本地 OCR：用于扫描件和图片

设计上应支持多解析器回退，不应绑定单一解析器。

### 6.5.4 标准文档 Schema

所有解析后的文档统一映射到标准结构：

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

统一 Schema 是后续检索、过滤、评估和微调数据构建的基础。


## 6.6 RAG 与检索设计

### 6.6.1 检索目标

检索层需要同时追求：

- 高召回
- 排序准确
- 可控过滤
- 可解释引用

### 6.6.2 检索流程

推荐链路：

1. query 标准化
2. 可选 query rewrite
3. 可选 multi-query
4. 自动推断元数据过滤条件
5. 混合检索
6. rerank 重排
7. top-k 证据选择
8. citation 打包

### 6.6.3 混合检索

混合检索由两部分组成：

- dense retrieval：向量召回
- lexical retrieval：BM25 或 PostgreSQL 全文检索

原因是政策与招投标领域里存在大量关键词、编号、地名和精确术语，仅靠向量检索不够稳。

### 6.6.4 重排

在候选召回之后，必须增加 cross-encoder reranker。

当前仓库已经有重排模型的基础。新版本需要把它从“增强项”提升为“高价值查询的标准阶段”。

### 6.6.5 元数据过滤

过滤维度建议包括：

- 地区
- 日期范围
- 文档类型
- 业务类别
- 行业

这对于“2025 年上海制造业政策”这类问题非常重要。

### 6.6.6 引用设计

每条答案应尽量带上：

- 来源标题
- 页码或章节
- chunk ID
- 来源 URL 或文件路径

前端可进一步把这些引用渲染成可点击证据。


## 6.7 记忆设计

### 6.7.1 短期记忆

短期记忆使用 LangGraph checkpointer。

作用：

- 保留同一 `thread_id` 下的多轮对话上下文
- 支持复杂任务中的中间状态传递

### 6.7.2 长期记忆

长期记忆使用 pgvector。

作用：

- 跨线程保存用户偏好和稳定事实
- 提升个性化与上下文连续性

适合保存的内容：

- 用户长期关注上海产业政策
- 用户偏好表格形式输出
- 用户经常关注补贴截止时间

不适合保存的内容：

- 临时问句
- 冗长中间过程
- 模型猜测性结论

### 6.7.3 回写策略

长期记忆的回写必须有门槛：

- 只写用户偏好、画像、长期关注点等稳定信息
- 不盲目把所有对话写回向量库


## 6.8 模型策略

### 6.8.1 模型分工

建议保留多模型角色划分：

- 轻量本地模型：处理简单对话、低延迟响应
- 强模型：负责计划生成、复杂总结、反思和记忆提取
- Embedding 模型：用于向量召回
- Reranker 模型：用于精排

### 6.8.2 动态路由

当前仓库已有基于 middleware 的动态模型路由思路，这一点应保留。

建议分工如下：

- 简单 QA -> 轻量模型
- 计划生成 -> 强模型
- 反思 -> 强模型
- 记忆提取 -> 强模型
- 轻量回答 -> 本地模型优先


## 7. 评估设计

## 7.1 为什么必须做评估

没有评估，项目更像 demo。

有评估，项目才像工程系统，因为可以量化优化是否有效。

### 7.1.1 检索评估指标

必做指标：

- Precision@k
- Recall@k
- MRR
- nDCG

这些指标应基于人工标注的 query-evidence 数据集计算。

### 7.1.2 生成评估指标

推荐指标：

- faithfulness
- answer relevancy
- citation accuracy
- 结构化抽取完整率

可使用 Ragas 作为初始框架。

### 7.1.3 Agent 评估指标

由于项目包含 Plan-and-Execute，需要额外评估：

- 任务完成率
- 计划成功率
- 平均执行步数
- 重试频率
- 工具失败恢复率


## 8. 微调与数据集设计

## 8.1 微调策略

不要在 RAG 基线还不稳定时就急着微调。

推荐顺序：

1. 搭建入库和解析流程
2. 建立检索基线
3. 构建评估集
4. 优化 RAG
5. 构建微调数据
6. 进行本地 LoRA 微调

### 8.1.1 微调适用目标

适合做本地微调的能力包括：

- 领域术语理解
- 抽取任务指令遵循
- 对比类答案格式稳定性
- 证据不足时的拒答一致性
- Planner 输出更稳定的结构化计划

### 8.1.2 数据来源

微调数据可来自：

- 人工整理的领域问答
- 基于解析文档生成的指令样本
- 从表格和公告构造的抽取任务
- 同主题政策文档对比样本

### 8.1.3 数据集划分

至少划分为：

- train
- validation
- retrieval test
- generation test

检索测试集应尽量避免与微调合成数据高度重合。


## 9. 数据收集与清洗计划

### 9.1 数据来源类别

建议重点收集：

- 政府政策官网
- 区县公告网站
- 招投标门户
- 官方白皮书
- 企业服务平台政策解读页

### 9.2 数据类型

- 用于多模态测试的 PDF 和扫描 PDF
- 用于 HTML 解析的政策网页
- 用于抽取测试的表格和附件
- 用于重排测试的长文档
- 用于对比任务的同类多文档

### 9.3 清洗流程

1. 抓取或手动收集
2. 保存原始文件
3. 基于哈希和语义去重
4. 解析为结构化 Markdown / JSON
5. 标准化元数据
6. 切块
7. 过滤低质量片段
8. 构建评估标签
9. 生成微调数据


## 10. 建议目录结构

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


## 11. 当前仓库迁移方案

### 11.1 可复用部分

当前仓库已经具备以下基础，可直接复用：

- FastAPI 入口和路由结构
- middleware 机制
- 动态模型路由
- 长期记忆注入思路
- reranker 基础能力
- 流式 Agent 输出入口

### 11.2 必须升级的部分

需要升级的内容包括：

- 从单一路径 Agent 变为双模式编排
- 新增 LangGraph orchestrator
- 新增 planner / executor / reflection / synthesizer
- 将 RAG 从 demo 风格升级为现代化结构
- 新增多模态 ingestion pipeline
- 新增 citation 体系
- 新增评估模块与数据集

### 11.3 MVP 可临时保留的简化方案

MVP 阶段可接受：

- Chroma 暂时保留，后续再迁移到 pgvector 主知识库
- 先支持 PDF 与 TXT，再逐步加入图片和 HTML
- 工具数量先控制在少量核心工具
- 先做小规模本地 benchmark


## 12. MVP 范围

### 12.1 MVP 必做功能

- FastAPI 统一 Agent 接口
- ReAct 模式
- Plan-and-Execute 模式
- PDF / TXT 导入
- pgvector 长期记忆
- reranker RAG
- 引用输出
- Precision@k / Recall@k 基础评估

### 12.2 MVP 暂不做

- 前端可视化大屏
- 多 Agent 协作
- 大规模自动爬虫
- 完整生产鉴权和多租户


## 13. 迭代路线

### Phase 1：架构重构

- 定义新模块和状态结构
- 增加 LangGraph orchestrator
- 保持现有 API 基本兼容

### Phase 2：Plan-and-Execute

- 实现 Planner
- 实现 Executor
- 实现 Reflection 和 Synthesizer

### Phase 3：多模态预处理

- 增加解析器抽象
- 接入 PDF 和 OCR
- 统一标准 Schema

### Phase 4：检索升级

- 混合检索
- 元数据过滤
- citation 打包

### Phase 5：评估

- 构建评估集
- 跑检索与生成指标
- 对比简单模式与复杂模式效果

### Phase 6：微调链路

- 生成领域指令数据
- 接入本地 LoRA 微调
- 对比微调前后结果


## 14. 简历项目亮点表达

项目完成后，可以在简历中提炼为：

- 基于 LangChain 1.2 与 LangGraph 设计多模态领域 Agent 平台
- 实现 ReAct 与 Plan-and-Execute 双模式执行架构
- 构建现代化 RAG 链路，支持混合检索、重排、元数据过滤与引用
- 基于 pgvector 实现长期记忆与用户偏好注入
- 搭建离线评估流程，量化检索精度、召回率与答案可信度
- 构建本地微调数据管线，增强领域问答、抽取和对比任务表现


## 15. 风险与约束

### 15.1 主要风险

- 多模态解析质量受文档类型影响较大
- Plan-and-Execute 会显著增加延迟和实现复杂度
- 长期记忆如果写入策略不严，会带来噪音
- 高质量评估集构建需要人工投入

### 15.2 控制策略

- 采用解析器回退机制
- 仅对复杂任务启用 Planner 流程
- 严格控制长期记忆回写条件
- 先做小而精的高质量评估集


## 16. 总结

这个项目的目标不是做一个泛化聊天机器人，而是做一个围绕“政策与招投标情报分析”的多模态 Agent 平台。

它的核心差异化能力在于：

- 对齐 LangChain 1.2 标准
- 明确保留 Plan-and-Execute
- 具备现代化 RAG 与引用能力
- 具备多模态预处理能力
- 具备 pgvector 长期记忆
- 具备可量化评估体系

这套设计既适合在当前仓库中分阶段落地，也足够支撑一个高质量的简历项目。
