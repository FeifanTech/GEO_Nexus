# GEO Nexus - 开发笔记

> 此文件记录项目开发过程中的所有重要信息、配置说明和变更历史

---

## 📋 项目信息

| 项目 | 信息 |
|------|------|
| 项目名称 | GEO Nexus Platform |
| 技术栈 | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| 状态管理 | Zustand + LocalStorage 持久化 |
| AI 引擎 | Dify (统一 API 调用) |
| 启动命令 | `npm run dev` |
| 默认端口 | http://localhost:3000 |

---

## 🔧 环境配置

### .env.local 必需变量

```bash
# Dify API Key（统一入口）
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx

# 可选：自定义 Dify API 地址（默认为官方地址）
# DIFY_API_BASE_URL=https://api.dify.ai/v1
```

---

## 📂 模块清单

### 已完成模块

| 模块 | 路径 | 功能 | 完成日期 |
|------|------|------|----------|
| 工作台 | `/` | 数据概览、快捷入口 | 2026-01-25 |
| 产品管理 | `/product-manager` | 产品 CRUD | 2026-01-25 |
| 竞品管理 | `/competitors` | 竞品优劣势管理 | 2026-01-25 |
| GEO 诊断 | `/geo-diagnosis` | AI 诊断分析 | 2026-01-25 |
| 内容工厂 | `/content-factory` | AI 内容生成 | 2026-01-25 |
| 作业流 | `/workflow` | Kanban 任务管理 | 2026-01-25 |
| 问题库 | `/query-library` | 监测问题管理 | 2026-01-25 |
| AI 监测 | `/ai-monitor` | AI 搜索排名监测 | 2026-01-25 |

### 待开发模块

| 模块 | 优先级 | 说明 |
|------|--------|------|
| 定时监测 | P1 | 定时执行 AI 搜索监测 |
| 监测报告 | P1 | 自动生成周期报告 |
| 趋势图表 | P2 | 排名变化趋势可视化 |
| 用户系统 | P2 | 多用户/团队支持 |
| 数据导出 | P3 | Excel/PDF 导出 |

---

## 🔌 API 说明

### 统一 Dify API 入口

**路径**: `/api/dify`

**请求格式**:
```typescript
interface UnifiedRequestBody {
  task_type: string;       // 任务类型
  inputs: Record<string, string>;  // 输入参数
  query?: string;          // Chat 模式需要
  user: string;            // 用户标识
  conversation_id?: string; // 对话 ID（续聊用）
  response_mode?: "streaming" | "blocking";
}
```

**task_type 映射**:

| 类别 | task_type | API 模式 | Dify 端点 |
|------|-----------|----------|-----------|
| 诊断 | `diagnosis_rank` | Chat | /chat-messages |
| 诊断 | `diagnosis_competitor` | Chat | /chat-messages |
| 诊断 | `diagnosis_sentiment` | Chat | /chat-messages |
| 内容 | `content_pdp` | Completion | /completion-messages |
| 内容 | `content_review` | Completion | /completion-messages |
| 内容 | `content_social` | Completion | /completion-messages |
| 监测 | `monitor_search` | Chat | /chat-messages |

---

## 🗄️ 数据存储

### LocalStorage Keys

| Key | 用途 | Store 文件 |
|-----|------|-----------|
| `geo-nexus-products` | 产品数据 | useProductStore.ts |
| `geo-nexus-competitors` | 竞品数据 | useCompetitorStore.ts |
| `geo-nexus-tasks` | 作业流任务 | useTaskStore.ts |
| `geo-nexus-queries` | 监测问题库 | useQueryStore.ts |
| `geo-nexus-monitor` | 监测任务 | useMonitorStore.ts |

### 清除所有数据

在浏览器控制台执行：
```javascript
Object.keys(localStorage).filter(k => k.startsWith('geo-nexus')).forEach(k => localStorage.removeItem(k));
location.reload();
```

---

## 🎨 UI 组件

### shadcn/ui 已安装组件

- button, card, input, textarea
- select, tabs, label
- dialog, toast, badge, separator

### 添加新组件

```bash
npx shadcn@latest add [component-name]
```

---

## 📝 变更记录

### 2026-01-25 - 初始版本

**架构决策**：
- 使用 Next.js 14 App Router
- 状态管理选择 Zustand（轻量 + persist 中间件）
- 所有 AI 功能通过 Dify 统一处理

**API 重构**：
- 原方案：多个 Dify 应用，多个 API 路由
- 新方案：单一 Dify 应用，通过 task_type 区分
- 原因：用户只有一个 Dify 应用权限

**UI 设计**：
- 侧边栏分组：数据管理 / GEO 监测 / 运营工具
- 统一使用 slate 色系
- 响应式布局支持

---

## 🐛 已知问题

1. **流式响应中断**：网络不稳定时可能出现，已添加错误处理
2. **LocalStorage 限制**：大量数据可能超出限制，后续考虑 IndexedDB

---

## 💡 开发提示

### 添加新的 task_type

1. 更新 `src/lib/dify-client.ts` 中的 `TaskType` 类型
2. 在 `src/app/api/dify/route.ts` 的 `getAppType` 函数中配置路由
3. 在 Dify Workflow 中添加对应分支
4. 更新本文档

### 调试 Dify API

```typescript
// 在页面中添加调试代码
const response = await fetch('/api/dify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task_type: 'content_pdp',
    inputs: { product_json: '{"name":"测试"}' },
    user: 'debug-user',
    response_mode: 'blocking'
  })
});
console.log(await response.json());
```

---

## 📚 相关文档

- [DIFY_CONFIG.md](./DIFY_CONFIG.md) - Dify 应用详细配置
- [README.md](./README.md) - 项目说明

---

*最后更新: 2026-01-25*
