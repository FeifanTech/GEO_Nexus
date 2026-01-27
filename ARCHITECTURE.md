# GEO Nexus - 系统技术架构文档

> 版本: 1.3.1
> 最后更新: 2026-01-27

---

## 📋 文档概述

本文档详细描述 GEO Nexus 平台的技术架构，包括系统设计、技术选型、数据流、模块依赖和部署方案。

---

## 🎯 系统定位

GEO Nexus 是一个 **AI 搜索优化运营平台 (GEO Ops Platform)**，帮助企业：
- 监测品牌在 AI 搜索引擎中的表现
- 诊断产品的 GEO 优化状态
- 批量生成符合 GEO 最佳实践的内容
- 管理优化任务的执行流程

---

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           客户端 (Client Layer)                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 14 (React 18)                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │
│  │  │   工作台    │ │  产品管理   │ │  竞品管理   │ │  GEO诊断    │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │
│  │  │  AI 监测    │ │  问题库     │ │  内容工厂   │ │  作业流     │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────┐                                  │  │
│  │  │  监测报告   │ │  系统设置   │                                  │  │
│  │  └─────────────┘ └─────────────┘                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                   │                                      │
│                           Zustand (状态管理)                             │
│                                   │                                      │
│                          LocalStorage (持久化) ✅ 当前使用               │
│                          Prisma + PostgreSQL ⏳ 已准备，待集成          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           服务端 (Server Layer)                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js API Routes                              │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    /api/dify (统一入口)                       │  │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │  │
│  │  │  │ 诊断API │  │ 内容API │  │ 监测API │  │ 其他... │        │  │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                   │                                      │
│                           环境变量 (API Keys)                            │
│                          Prisma Client ⏳ 已准备                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           外部服务 (External Services)                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Dify AI Platform                          │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Chatflow / Workflow                       │  │  │
│  │  │                                                               │  │  │
│  │  │  ┌─────────┐     ┌─────────┐     ┌─────────┐               │  │  │
│  │  │  │条件分支 │ ──▶ │ LLM节点 │ ──▶ │  输出   │               │  │  │
│  │  │  └─────────┘     └─────────┘     └─────────┘               │  │  │
│  │  │       │                                                       │  │  │
│  │  │       ▼                                                       │  │  │
│  │  │  task_type 路由: diagnosis / content / monitor               │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                   │                                      │
│                           LLM (通义千问/GPT/Kimi)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 技术栈详解

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.x | 全栈框架，App Router |
| **React** | 18.x | UI 组件库 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 3.x | 原子化 CSS |
| **Ant Design** | 5.x | 企业级 UI 组件库（表格、表单） |
| **shadcn/ui** | latest | 现代化基础 UI 组件 |
| **Lucide React** | latest | 图标库 |
| **Zustand** | 5.x | 状态管理 |
| **Recharts** | 3.x | 数据可视化 |
| **react-markdown** | 10.x | Markdown 渲染 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js API Routes** | 14.x | API 网关/代理 |
| **Server-Sent Events** | - | 流式响应 |
| **Dify API** | - | AI 能力调用 |
| **Prisma** | 7.x | ORM (已准备，待集成) |

### 数据存储

| 存储类型 | 技术 | 用途 | 状态 |
|----------|------|------|------|
| 客户端持久化 | LocalStorage | 产品、竞品、任务等数据 | ✅ 当前使用 |
| 会话状态 | Zustand | 运行时状态管理 | ✅ 当前使用 |
| 环境配置 | .env.local | API Keys、配置项 | ✅ 当前使用 |
| 数据库 (未来) | Prisma + PostgreSQL | 服务端数据存储 | ⏳ 已准备，待集成 |

**说明：**
- 当前所有数据存储在客户端 LocalStorage，通过 Zustand persist 中间件自动同步
- Prisma 和 PostgreSQL 已配置但尚未集成到业务逻辑中
- 计划在 Phase 2 完成数据库迁移（详见 PRD_PHASE2.md）

---

## 📂 项目结构

```
geo-nexus-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 根布局 (Sidebar + Content)
│   │   ├── page.tsx                  # 工作台 Dashboard
│   │   ├── api/
│   │   │   └── dify/
│   │   │       └── route.ts          # 统一 Dify API 代理
│   │   ├── product-manager/          # 产品管理模块
│   │   ├── competitors/              # 竞品管理模块
│   │   ├── geo-diagnosis/            # GEO 诊断模块
│   │   ├── ai-monitor/               # AI 排名监测模块
│   │   ├── query-library/            # 问题库模块
│   │   ├── content-factory/          # 内容工厂模块
│   │   ├── workflow/                 # 作业流模块
│   │   ├── report/                   # 监测报告模块
│   │   └── settings/                 # 系统设置模块
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # 响应式侧边栏
│   │   ├── charts/
│   │   │   ├── GeoRadar.tsx          # GEO 雷达图
│   │   │   ├── RankingTrend.tsx      # 排名趋势图
│   │   │   ├── MentionTrend.tsx      # 提及率趋势图
│   │   │   └── GeoHealthScore.tsx    # 健康度评分
│   │   ├── icons/
│   │   │   └── AIModelIcons.tsx      # AI 模型 SVG 图标
│   │   ├── transitions/
│   │   │   ├── PageTransition.tsx    # 页面过渡动画
│   │   │   └── RouteProgressBar.tsx  # 路由加载进度条
│   │   ├── providers/
│   │   │   ├── KeyboardProvider.tsx  # 全局快捷键
│   │   │   └── AntdProvider.tsx      # Ant Design 主题配置
│   │   ├── examples/
│   │   │   └── AntdExample.tsx       # Ant Design 使用示例
│   │   ├── workflow/
│   │   │   └── KanbanBoard.tsx       # 看板组件
│   │   ├── ui/                       # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx          # 复选框组件 (Radix UI)
│   │   │   ├── skeleton.tsx          # 骨架屏
│   │   │   ├── empty-state.tsx       # 空状态
│   │   │   ├── switch.tsx            # 开关组件
│   │   │   └── ...
│   │   ├── OnboardingGuide.tsx       # 新手引导
│   │   └── KeyboardShortcutsDialog.tsx
│   │
│   ├── hooks/
│   │   ├── use-toast.ts              # Toast 通知
│   │   ├── useMonitorExecution.ts    # 监测任务执行
│   │   └── useKeyboardShortcuts.ts   # 快捷键
│   │
│   ├── lib/
│   │   ├── utils.ts                  # 工具函数
│   │   ├── dify-client.ts            # Dify API 客户端
│   │   ├── export-utils.ts           # 数据导出
│   │   └── antd-theme.ts             # Ant Design 主题配置
│   │
│   ├── store/                        # Zustand Stores
│   │   ├── useProductStore.ts        # 产品数据
│   │   ├── useCompetitorStore.ts     # 竞品数据
│   │   ├── useTaskStore.ts           # 作业流任务
│   │   ├── useQueryStore.ts          # 监测问题
│   │   ├── useMonitorStore.ts        # 监测任务
│   │   ├── useDiagnosisStore.ts      # 诊断记录
│   │   ├── useContentStore.ts        # 内容记录
│   │   └── useSettingsStore.ts       # 系统设置
│   │
│   └── types/                        # TypeScript 类型
│       ├── product.ts
│       ├── competitor.ts
│       ├── task.ts
│       ├── query.ts
│       ├── monitor.ts
│       ├── diagnosis.ts
│       ├── content.ts
│       └── settings.ts
│
├── prisma/                           # Prisma 配置 (已准备，待集成)
│   ├── schema.prisma                 # 数据库模型定义 (基础配置)
│   └── migrations/                   # 数据库迁移文件
├── prisma.config.ts                  # Prisma 配置文件
├── .env                              # 环境变量模板
├── .env.local                        # 环境变量 (gitignored)
├── package.json
├── next.config.mjs                    # Next.js 配置
├── tailwind.config.ts                # Tailwind CSS 配置
├── tsconfig.json                      # TypeScript 配置
├── ARCHITECTURE.md                   # 本文档
├── DEV_NOTES.md                      # 开发笔记
├── DIFY_CONFIG.md                    # Dify 配置
├── PRD_PHASE2.md                     # 下阶段需求
├── IMPLEMENTATION_PLAN.md            # Phase 2 实施计划
├── AGENTS.md                         # AI Agent 配置
└── ANTD_INTEGRATION.md               # Ant Design 集成指南
```

---

## 🔀 数据流设计

### 1. 状态管理流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   组件 UI   │ ──▶ │   Zustand   │ ──▶ │ LocalStorage│
│  (React)    │ ◀── │   Store     │ ◀── │  (persist)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**特点：**
- 使用 Zustand 的 `persist` 中间件自动同步 LocalStorage
- 组件通过 hooks 订阅 store，自动更新 UI
- 支持 SSR 水合（mounted 状态检查）

### 2. AI API 调用流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  组件   │ ─▶ │  dify-  │ ─▶ │  /api/  │ ─▶ │  Dify   │ ─▶ │   LLM   │
│  页面   │    │ client  │    │  dify   │    │ Platform│    │ (Qwen)  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     ▲                                                            │
     │                      SSE 流式响应                           │
     └────────────────────────────────────────────────────────────┘
```

**请求参数：**
```typescript
interface DifyRequest {
  task_type: string;      // 任务类型路由
  query?: string;         // Chat 模式的用户输入
  inputs: Record<string, string>;  // Workflow 变量
  user: string;           // 用户标识
  response_mode: "streaming" | "blocking";
}
```

### 3. 监测任务执行流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI 监测执行流程                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐                                                       │
│  │ 创建任务 │                                                       │
│  └────┬─────┘                                                       │
│       ▼                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                    │
│  │ 待执行   │ ──▶ │ 执行中   │ ──▶ │ 已完成   │                    │
│  │ pending  │     │ running  │     │ completed│                    │
│  └──────────┘     └────┬─────┘     └──────────┘                    │
│                        │                                             │
│       ┌────────────────┼────────────────┐                          │
│       ▼                ▼                ▼                          │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐                       │
│  │ 模型 1  │     │ 模型 2  │     │ 模型 3  │   (并行调用 Dify)    │
│  │ Qwen    │     │ Kimi    │     │ 文心    │                       │
│  └────┬────┘     └────┬────┘     └────┬────┘                       │
│       ▼                ▼                ▼                          │
│  ┌──────────────────────────────────────────────────┐              │
│  │              解析结果 (parseAIResponse)           │              │
│  │  - mentioned: 是否提及品牌                        │              │
│  │  - position: 排名位置                             │              │
│  │  - sentiment: 情感倾向                            │              │
│  │  - context: 相关上下文                            │              │
│  └──────────────────────────────────────────────────┘              │
│                           │                                         │
│                           ▼                                         │
│                  ┌──────────────┐                                   │
│                  │ 更新 Store   │                                   │
│                  │ 刷新 UI      │                                   │
│                  └──────────────┘                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 数据模型

### 当前数据存储方案

**客户端存储 (LocalStorage)**
- 所有业务数据存储在浏览器 LocalStorage
- 通过 Zustand persist 中间件自动同步
- 优点：简单快速，无需后端
- 限制：5MB 存储上限，无法跨设备同步

**数据库准备状态 (Prisma + PostgreSQL)**
- ✅ Prisma 依赖已安装 (`@prisma/client@7.3.0`, `prisma@7.3.0`)
- ✅ Prisma 配置文件已创建 (`prisma/schema.prisma`, `prisma.config.ts`)
- ✅ 数据库连接字符串已配置 (`.env` 中的 `DATABASE_URL`)
- ⏳ Prisma Schema 模型定义待完善
- ⏳ 数据库迁移待执行
- ⏳ 业务逻辑集成待完成

**迁移计划：**
- Phase 2 将完成从 LocalStorage 到 PostgreSQL 的迁移
- 保持向后兼容，支持数据导入导出
- 详见 [PRD_PHASE2.md](./PRD_PHASE2.md) 和 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

### 核心实体关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                          实体关系图 (ERD)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐         ┌──────────────┐                        │
│   │   Product    │ ◀─────▶ │  Competitor  │                        │
│   │   产品       │  N:M    │   竞品       │                        │
│   └──────┬───────┘         └──────────────┘                        │
│          │                                                           │
│          │ 1:N                                                       │
│          ▼                                                           │
│   ┌──────────────┐         ┌──────────────┐                        │
│   │ SearchQuery  │ ◀─────▶ │ MonitorTask  │                        │
│   │  监测问题    │  N:M    │  监测任务    │                        │
│   └──────────────┘         └──────┬───────┘                        │
│                                   │                                  │
│                                   │ 1:N                              │
│                                   ▼                                  │
│                           ┌──────────────┐                          │
│                           │RankingResult │                          │
│                           │  监测结果    │                          │
│                           └──────────────┘                          │
│                                                                      │
│   ┌──────────────┐         ┌──────────────┐                        │
│   │DiagnosisRecord│        │ContentRecord │                        │
│   │  诊断记录    │          │  内容记录    │                        │
│   └──────────────┘         └──────────────┘                        │
│                                                                      │
│   ┌──────────────┐         ┌──────────────┐                        │
│   │    Task      │          │  Settings   │                        │
│   │  作业流任务  │          │  系统设置    │                        │
│   └──────────────┘         └──────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### LocalStorage Keys

| Key | 数据类型 | 描述 |
|-----|----------|------|
| `geo-nexus-products` | `Product[]` | 产品数据 |
| `geo-nexus-competitors` | `Competitor[]` | 竞品数据 |
| `geo-nexus-tasks` | `Task[]` | 作业流任务 |
| `geo-nexus-queries` | `SearchQuery[]` | 监测问题 |
| `geo-nexus-monitor` | `MonitorTask[]` | 监测任务及结果 |
| `geo-nexus-diagnosis` | `DiagnosisRecord[]` | 诊断历史 |
| `geo-nexus-content` | `ContentRecord[]` | 内容历史 |
| `geo-nexus-settings` | `Settings` | 系统设置 |
| `geo-nexus-onboarding-completed` | `boolean` | 引导完成标记 |

---

## 🔌 API 设计

### 统一入口: `/api/dify`

**请求方法:** `POST`

**请求体:**
```typescript
interface UnifiedRequest {
  task_type: TaskType;
  inputs: Record<string, string>;
  query?: string;
  user: string;
  conversation_id?: string;
  response_mode?: "streaming" | "blocking";
}
```

**task_type 路由表:**

| task_type | API 模式 | Dify 端点 | 用途 |
|-----------|----------|-----------|------|
| `diagnosis_rank` | Chat | /chat-messages | 排名诊断 |
| `diagnosis_competitor` | Chat | /chat-messages | 竞品诊断 |
| `diagnosis_sentiment` | Chat | /chat-messages | 舆情诊断 |
| `content_pdp` | Completion | /completion-messages | PDP 摘要 |
| `content_review` | Completion | /completion-messages | 评论脚本 |
| `content_social` | Completion | /completion-messages | 种草文案 |
| `monitor_search` | Chat | /chat-messages | AI 搜索监测 |

**响应格式 (流式):**
```
data: {"event":"message","answer":"内容..."}
data: {"event":"message","answer":"继续..."}
data: {"event":"message_end","metadata":{...}}
```

---

## 🎨 UI/UX 设计规范

### 设计系统

| 属性 | 规范 |
|------|------|
| **主色调** | Slate 灰色系 |
| **背景色** | `slate-50` (#f8fafc) |
| **侧边栏** | 白色背景，64px 宽度 |
| **圆角** | 8px (默认) / 12px (卡片) |
| **间距** | 4px 基础单位 |
| **字体** | Geist Sans (系统默认) |
| **图标** | Lucide React (SVG)，禁用 Emoji |

### 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| **Mobile** | < 768px | 隐藏侧边栏，显示汉堡菜单 |
| **Tablet** | 768px - 1024px | 侧边栏收缩 |
| **Desktop** | > 1024px | 完整布局 |

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Alt + 1` | 跳转工作台 |
| `Alt + 2` | 跳转产品管理 |
| `Alt + 3` | 跳转竞品管理 |
| `Alt + 4` | 跳转 GEO 诊断 |
| `Alt + 5` | 跳转 AI 监测 |
| `Alt + 6` | 跳转内容工厂 |
| `Alt + 7` | 跳转作业流 |
| `Alt + 8` | 跳转系统设置 |
| `?` | 显示快捷键帮助 |

---

## 🚀 部署架构

### 当前方案 (开发/小规模)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Vercel / 自托管                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 应用                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │ 静态页面    │  │ API Routes  │  │ 环境变量    │           │  │
│  │  │ (SSG/ISR)   │  │ (Serverless)│  │ (.env)      │           │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        ┌─────────────┐
                        │ Dify Cloud  │
                        │ (外部 AI)   │
                        └─────────────┘
```

### 未来方案 (企业级)

```
┌─────────────────────────────────────────────────────────────────────┐
│                              云服务                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │    CDN      │     │   负载均衡   │     │   监控告警   │          │
│   └──────┬──────┘     └──────┬──────┘     └─────────────┘          │
│          │                   │                                       │
│          ▼                   ▼                                       │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              Kubernetes / Docker Swarm                   │       │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │       │
│   │  │Next.js 1│  │Next.js 2│  │Next.js 3│  │   ...   │    │       │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │       │
│   └─────────────────────────────────────────────────────────┘       │
│                              │                                       │
│          ┌───────────────────┼───────────────────┐                  │
│          ▼                   ▼                   ▼                  │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │ PostgreSQL  │     │    Redis    │     │  Dify Self  │          │
│   │  (主数据)   │     │   (缓存)    │     │  Hosted     │          │
│   └─────────────┘     └─────────────┘     └─────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 组件文档

### 布局组件

| 组件 | 路径 | 说明 |
|------|------|------|
| Sidebar | `components/layout/Sidebar.tsx` | 响应式侧边栏，支持移动端折叠 |

### 图表组件

| 组件 | 路径 | 说明 |
|------|------|------|
| GeoRadar | `components/charts/GeoRadar.tsx` | GEO 雷达图，展示多维度评分 |
| RankingTrend | `components/charts/RankingTrend.tsx` | 排名趋势折线图 |
| GeoHealthScore | `components/charts/GeoHealthScore.tsx` | 健康度环形评分图 |

**注意：** MentionTrend 组件在文档中提及但当前代码库中未找到，可能已移除或重命名。

### 业务组件

| 组件 | 路径 | 说明 |
|------|------|------|
| KanbanBoard | `components/workflow/KanbanBoard.tsx` | 作业流看板，支持拖拽 |
| OnboardingGuide | `components/OnboardingGuide.tsx` | 新手引导向导 (6步) |
| KeyboardShortcutsDialog | `components/KeyboardShortcutsDialog.tsx` | 快捷键帮助弹窗 |

### UI 基础组件 (shadcn/ui)

| 组件 | 说明 |
|------|------|
| button | 按钮，多种变体 |
| card | 卡片容器 |
| dialog | 对话框/模态框 |
| input | 输入框 |
| label | 标签组件 |
| select | 下拉选择 |
| tabs | 标签页 |
| textarea | 多行文本输入 |
| toast | 通知提示 |
| toaster | Toast 容器 |
| skeleton | 骨架屏加载 |
| empty-state | 空状态提示 |
| switch | 开关组件 |
| badge | 标签徽章 |
| separator | 分隔线 |
| checkbox | 复选框组件 (Radix UI) |

### Providers

| Provider | 路径 | 说明 |
|----------|------|------|
| KeyboardProvider | `components/providers/KeyboardProvider.tsx` | 全局快捷键监听 |

---

## ⚡ 性能优化

### 已实施

| 优化项 | 实现方式 |
|--------|----------|
| 代码分割 | Next.js 自动 chunk 分割 |
| 静态生成 | 页面预渲染 (SSG) |
| 图片优化 | next/image 自动优化 |
| 流式响应 | SSE 实时展示 AI 输出 |
| 骨架屏 | 加载状态优化 |
| 页面过渡 | CSS-only 动画（移除 Framer Motion） |
| 图标系统 | Lucide React SVG 图标（替代 Emoji） |
| 弹窗滚动 | 固定头部/底部，内容区独立滚动 |

### 待优化

| 优化项 | 计划方案 |
|--------|----------|
| 虚拟列表 | 大数据量列表性能 |
| 请求缓存 | React Query / SWR |
| Service Worker | 离线支持 |
| IndexedDB | 替代 LocalStorage |

---

## 🔒 安全考虑

### 当前措施

| 风险 | 措施 |
|------|------|
| API Key 泄露 | 存储在服务端环境变量 |
| XSS 攻击 | React 自动转义 |
| CSRF | Next.js 内置防护 |

### 待加强

| 风险 | 计划措施 |
|------|----------|
| 用户认证 | 添加 NextAuth.js |
| 数据加密 | LocalStorage 加密 |
| 访问控制 | RBAC 权限系统 |
| 审计日志 | 操作记录追踪 |

---

## 📊 技术债务

| 类别 | 问题 | 影响 | 优先级 | 状态 |
|------|------|------|--------|------|
| 存储 | LocalStorage 5MB 限制 | 数据量大时失败 | P1 | ⏳ Prisma 已准备，待集成 |
| 数据库集成 | Prisma Schema 未完成 | 无法使用数据库 | P1 | ⏳ 基础配置完成，待完善模型 |
| 测试 | 缺少单元测试/E2E测试 | 回归风险 | P1 | ⬜ 待开始 |
| 类型 | 部分 any 类型 | 类型安全 | P2 | ⬜ 待优化 |
| 错误处理 | 需统一错误边界 | 用户体验 | P2 | ⬜ 待实现 |
| 用户认证 | 无用户系统 | 无法多用户协作 | P1 | ⏳ Phase 2 计划中 |

---

## 📚 参考资料

### 外部文档
- [Next.js 14 文档](https://nextjs.org/docs)
- [Ant Design 官方文档](https://ant.design/)
- [Dify API 文档](https://docs.dify.ai/)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Zustand 状态管理](https://zustand-demo.pmnd.rs/)
- [Recharts 图表库](https://recharts.org/)

### 项目文档
- [README.md](./README.md) - 项目说明
- [DEV_NOTES.md](./DEV_NOTES.md) - 开发笔记
- [DIFY_CONFIG.md](./DIFY_CONFIG.md) - Dify 配置
- [PRD_PHASE2.md](./PRD_PHASE2.md) - 第二阶段需求
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Phase 2 实施计划
- [AGENTS.md](./AGENTS.md) - AI Agent 配置
- [ANTD_INTEGRATION.md](./ANTD_INTEGRATION.md) - Ant Design 集成指南
- [BUTTON_DESIGN_GUIDE.md](./BUTTON_DESIGN_GUIDE.md) - 按钮设计规范

---

## 📝 更新日志

### v1.3.1 (2026-01-27)
- ✅ 按钮样式全面优化
- ✅ 修复 Badge hover 状态无反馈问题（3 处）
- ✅ 创建按钮设计规范文档（BUTTON_DESIGN_GUIDE.md）
- ✅ 统一按钮 hover 状态的颜色对比度标准
- ✅ 添加按钮优化总结文档（BUTTON_OPTIMIZATION_SUMMARY.md）
- ✅ 全项目按钮审查（60+ 个按钮）
- ✅ 确保所有按钮符合 WCAG AA 无障碍标准

### v1.3 (2026-01-27)
- ✅ UI/UX 优化第三阶段
- ✅ 替换所有 Emoji 图标为 Lucide React SVG 图标
- ✅ 创建 AIModelIcons 组件统一管理 AI 模型图标
- ✅ 添加 shadcn/ui Checkbox 组件（基于 Radix UI）
- ✅ 优化弹窗滚动体验（固定头部和底部，内容区独立滚动）
- ✅ 改善弹窗视觉层次（边框分隔、间距优化、标签优化）
- ✅ 完善页面过渡动画（PageTransition 和 RouteProgressBar）
- ✅ 性能优化：移除 Framer Motion，使用纯 CSS 过渡动画

### v1.2 (2026-01-27)
- ✅ 集成 Ant Design 5.x 作为补充 UI 库
- ✅ 添加 AntdProvider 和自定义主题配置
- ✅ 创建 Ant Design 集成指南文档（ANTD_INTEGRATION.md）
- ✅ 更新技术栈说明，明确 Ant Design 与 shadcn/ui 的分工
- ✅ 添加混合使用示例组件

### v1.1 (2026-01-27)
- ✅ 更新技术栈版本信息（Zustand 5.x, Recharts 3.x, react-markdown 10.x）
- ✅ 添加 Prisma 准备状态说明
- ✅ 更新项目结构，包含 prisma 目录和配置文件
- ✅ 完善 UI 组件列表
- ✅ 更新技术债务追踪，标注 Prisma 集成状态
- ✅ 添加更新日志章节

### v1.0 (2026-01-26)
- ✅ 初始架构文档创建
- ✅ 完成核心功能模块文档
- ✅ 完成数据流和 API 设计文档

---

*文档维护: GEO Nexus 开发团队*  
*最后更新: 2026-01-27*
