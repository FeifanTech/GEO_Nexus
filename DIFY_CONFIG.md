# GEO Nexus - Dify 应用配置文档

> 最后更新: 2026-01-25

---

## 📋 概述

GEO Nexus 平台所有 AI 功能通过 **单一 Dify 应用** 处理，通过 `task_type` 参数区分不同任务类型。

### 环境变量

```bash
# .env.local
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx
```

---

## 🔧 Dify 应用配置

### 应用类型

推荐使用 **Chatflow** 类型，支持：
- 多轮对话（诊断场景）
- 单次生成（内容生成场景）
- 条件分支路由

### 输入变量定义

在 Dify 应用的「开始」节点中，定义以下输入变量：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `task_type` | String | ✅ | 任务类型标识符 |
| `product_name` | String | ❌ | 产品名称 |
| `product_json` | String | ❌ | 产品完整 JSON 数据 |
| `extra_prompt` | String | ❌ | 额外提示词/要求 |
| `target_brand` | String | ❌ | 目标品牌（监测用） |
| `models` | String | ❌ | AI模型列表，逗号分隔 |
| `review_index` | String | ❌ | 评论序号 |
| `total_reviews` | String | ❌ | 评论总数 |
| `scenarios` | String | ❌ | 评论场景 |

---

## 📊 task_type 类型详解

### 1. GEO 诊断类 (Chat 模式)

| task_type | 功能 | 使用场景 |
|-----------|------|----------|
| `diagnosis_rank` | 排名检查 | 分析产品在搜索引擎和电商平台的排名表现 |
| `diagnosis_competitor` | 竞品分析 | 与竞争对手进行深度对比分析 |
| `diagnosis_sentiment` | 舆情审计 | 分析用户负面情绪和评价痛点 |

**输入示例：**
```json
{
  "task_type": "diagnosis_rank",
  "product_name": "XX 面霜",
  "product_json": "{\"name\":\"XX面霜\",\"selling_points\":[\"补水\",\"抗老\"],\"target_users\":\"25-35岁女性\",\"competitors\":\"YY品牌\"}",
  "query": "请分析以下产品的排名表现..."
}
```

### 2. 内容生成类 (Completion 模式)

| task_type | 功能 | 使用场景 |
|-----------|------|----------|
| `content_pdp` | PDP 摘要 | 生成产品详情页的 AI 摘要文本 |
| `content_review` | 评论脚本 | 生成用户评论/种草内容 |
| `content_social` | 种草文案 | 生成社交媒体帖子（小红书/知乎/抖音等） |

**输入示例：**
```json
{
  "task_type": "content_pdp",
  "product_json": "{...}",
  "extra_prompt": "请突出补水效果"
}
```

**种草文案额外参数：**
```json
{
  "task_type": "content_social",
  "product_json": "{...}",
  "extra_prompt": "请用小红书种草风格撰写，要求：1. 使用大量Emoji表情；2. 口语化表达..."
}
```

### 3. AI 搜索监测类 (Chat 模式)

| task_type | 功能 | 使用场景 |
|-----------|------|----------|
| `monitor_search` | 搜索监测 | 监测品牌在 AI 搜索引擎中的排名 |

**输入示例：**
```json
{
  "task_type": "monitor_search",
  "query": "什么面霜好用",
  "target_brand": "XX品牌",
  "models": "qwen,kimi,wenxin"
}
```

---

## 🔀 Dify Workflow 设计建议

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         开始节点                              │
│  接收: task_type, product_json, query, extra_prompt 等       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      条件分支节点                             │
│  根据 task_type 前缀判断:                                     │
│  - diagnosis_* → 诊断分支                                    │
│  - content_*   → 内容分支                                    │
│  - monitor_*   → 监测分支                                    │
└─────────────────────────────────────────────────────────────┘
          ↓                    ↓                    ↓
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  诊断分支    │      │  内容分支    │      │  监测分支    │
└─────────────┘      └─────────────┘      └─────────────┘
          ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│                        结束节点                              │
│  输出: answer (生成的内容)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 条件分支配置

**分支 1: 诊断任务**
```
条件: {{task_type}} 以 "diagnosis_" 开头
```

**分支 2: 内容生成**
```
条件: {{task_type}} 以 "content_" 开头
```

**分支 3: AI 监测**
```
条件: {{task_type}} == "monitor_search"
```

---

## 📝 各分支 LLM 提示词模板

### 诊断分支 - 排名检查 (diagnosis_rank)

```
你是一位专业的 GEO (Generative Engine Optimization) 分析师。

请分析以下产品在 AI 搜索引擎和电商平台的排名表现：

【产品信息】
{{product_json}}

【分析要求】
1. 评估产品在主流 AI 搜索引擎（如 ChatGPT、Kimi、文心一言等）中被推荐的可能性
2. 分析产品关键词的搜索覆盖度
3. 评估产品卖点与用户搜索意图的匹配度
4. 给出具体的优化建议

请以 Markdown 格式输出分析报告。
```

### 诊断分支 - 竞品分析 (diagnosis_competitor)

```
你是一位专业的市场竞争分析师。

请对以下产品进行深度竞品分析：

【产品信息】
{{product_json}}

【分析要求】
1. 与主要竞品进行优劣势对比
2. 分析市场定位差异
3. 识别竞争机会和威胁
4. 给出差异化竞争策略建议

请以 Markdown 格式输出分析报告，包含对比表格。
```

### 诊断分支 - 舆情审计 (diagnosis_sentiment)

```
你是一位专业的用户洞察分析师。

请分析以下产品可能存在的负面评价和用户痛点：

【产品信息】
{{product_json}}

【分析要求】
1. 预判可能的用户抱怨点
2. 分析产品在使用场景中的潜在问题
3. 识别可能影响口碑的风险因素
4. 给出口碑优化和危机预防建议

请以 Markdown 格式输出分析报告。
```

### 内容分支 - PDP 摘要 (content_pdp)

```
你是一位专业的电商文案策划。

请根据以下产品信息，生成适合放在详情页顶部的 AI 摘要文案：

【产品信息】
{{product_json}}

【额外要求】
{{extra_prompt}}

【输出要求】
1. 字数 150-300 字
2. 突出 3-5 个核心卖点
3. 语言简洁有力，适合快速阅读
4. 可以使用小标题或分点
```

### 内容分支 - 评论脚本 (content_review)

```
你是一位真实的产品用户。

请根据以下产品信息，撰写一条真实自然的用户评论：

【产品信息】
{{product_json}}

【评论要求】
{{extra_prompt}}

【输出要求】
1. 像真实用户写的，语气自然
2. 字数 50-150 字
3. 可以提及具体使用场景和感受
4. 适当包含产品卖点但不要太刻意
5. 第 {{review_index}} 条/共 {{total_reviews}} 条
6. 场景类型: {{scenarios}}
```

### 内容分支 - 种草文案 (content_social)

```
你是一位社交媒体内容创作者。

请根据以下产品信息，撰写种草文案：

【产品信息】
{{product_json}}

【风格要求】
{{extra_prompt}}

请直接输出文案内容，不需要额外说明。
```

### 监测分支 - AI 搜索监测 (monitor_search)

```
你是一位 AI 搜索引擎。

用户问：{{query}}

请像真实的 AI 助手一样回答这个问题。在回答中：
1. 如果 "{{target_brand}}" 品牌/产品确实适合推荐，请自然地提及
2. 不要刻意提及，要基于真实的产品特点
3. 给出客观、有价值的回答

注意：这是为了测试品牌在 AI 搜索中的表现，请模拟真实场景。
```

---

## 🔌 API 调用示例

### 前端调用代码

```typescript
import { sendDiagnosis, generateContent, createStreamHandler } from "@/lib/dify-client";

// GEO 诊断
await sendDiagnosis(
  {
    type: "rank",  // rank | competitor | sentiment
    query: "请分析产品排名...",
    user: "user-123",
    inputs: {
      product_name: "XX产品",
      product_json: JSON.stringify(product),
    },
  },
  createStreamHandler(setContent, onComplete, onError)
);

// 内容生成
await generateContent(
  {
    type: "pdp",  // pdp | review | social
    inputs: {
      product_json: JSON.stringify(product),
      extra_prompt: "请突出补水效果",
    },
    user: "user-123",
  },
  createStreamHandler(setContent, onComplete, onError)
);
```

### API 请求格式

```bash
POST /api/dify
Content-Type: application/json

{
  "task_type": "diagnosis_rank",
  "query": "请分析产品排名表现",
  "inputs": {
    "product_name": "XX产品",
    "product_json": "{...}"
  },
  "user": "user-123",
  "response_mode": "streaming"
}
```

---

## 📁 项目文件结构

```
geo-nexus-platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── dify/
│   │   │       └── route.ts          # 统一 API 入口
│   │   ├── page.tsx                  # 工作台
│   │   ├── product-manager/          # 产品管理
│   │   ├── competitors/              # 竞品管理
│   │   ├── geo-diagnosis/            # GEO 诊断
│   │   ├── ai-monitor/               # AI 排名监测
│   │   ├── query-library/            # 问题库
│   │   ├── content-factory/          # 内容工厂
│   │   └── workflow/                 # 作业流
│   ├── lib/
│   │   └── dify-client.ts            # Dify API 客户端
│   ├── store/                        # Zustand 状态管理
│   │   ├── useProductStore.ts
│   │   ├── useCompetitorStore.ts
│   │   ├── useTaskStore.ts
│   │   ├── useQueryStore.ts
│   │   └── useMonitorStore.ts
│   └── types/                        # 类型定义
│       ├── product.ts
│       ├── competitor.ts
│       ├── task.ts
│       ├── query.ts
│       └── monitor.ts
├── .env.local                        # 环境变量 (git ignored)
└── DIFY_CONFIG.md                    # 本文档
```

---

## 📝 开发日志

### 2026-01-25

**完成的功能模块：**

1. ✅ 项目初始化 (Next.js 14 + TypeScript + Tailwind + shadcn/ui)
2. ✅ 产品管理 - CRUD + LocalStorage 持久化
3. ✅ 竞品管理 - 优劣势分析、销售渠道管理
4. ✅ GEO 诊断 - 排名检查/竞品分析/舆情审计三种模式
5. ✅ 内容工厂 - PDP摘要/批量评论/多平台种草文案
6. ✅ 作业流管理 - Kanban看板 + 检查清单
7. ✅ 问题库 - AI搜索监测问题管理
8. ✅ AI排名监测 - 多模型监测任务管理（UI完成，待Dify工作流配置）

**API 重构：**
- 将多个 Dify API 路由合并为统一入口 `/api/dify`
- 通过 `task_type` 参数区分不同任务
- 支持单一 Dify 应用处理所有 AI 任务

**下一步计划：**
- [ ] 配置 Dify Workflow 条件分支
- [ ] 实现 AI 搜索监测的实际调用
- [ ] 添加监测结果趋势图表
- [ ] 实现定时监测功能

---

## ❓ 常见问题

### Q: 如何测试 Dify 连接是否正常？

在浏览器控制台执行：
```javascript
fetch('/api/dify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task_type: 'content_pdp',
    inputs: { product_json: '{"name":"测试产品"}' },
    user: 'test-user',
    response_mode: 'blocking'
  })
}).then(r => r.json()).then(console.log)
```

### Q: 流式响应没有内容？

检查 Dify 应用是否配置了正确的输出变量，确保 LLM 节点的输出连接到了结束节点。

### Q: 如何添加新的 task_type？

1. 在 `src/lib/dify-client.ts` 中添加新的 TaskType
2. 在 `src/app/api/dify/route.ts` 中的 `getAppType` 函数配置路由
3. 在 Dify Workflow 中添加对应的条件分支和处理逻辑

---

*本文档由 GEO Nexus 开发团队维护*
