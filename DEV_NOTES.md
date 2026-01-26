# GEO Nexus - 开发笔记

> 此文件记录项目开发过程中的所有重要信息、配置说明和变更历史

---

## 📋 项目信息

| 项目 | 信息 |
|------|------|
| 项目名称 | GEO Nexus Platform |
| 版本 | 1.0.0 (Phase 1 完成) |
| 技术栈 | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| 状态管理 | Zustand + LocalStorage 持久化 |
| AI 引擎 | Dify (统一 API 调用) |
| 启动命令 | `npm run dev` |
| 默认端口 | http://localhost:3000 |
| GitHub | https://github.com/FeifanTech/GEO_Nexus |

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

| 模块 | 路径 | 功能 | 完成日期 | 状态 |
|------|------|------|----------|------|
| 工作台 | `/` | 数据概览、快捷入口、统计卡片 | 2026-01-25 | ✅ |
| 产品管理 | `/product-manager` | 产品 CRUD、竞品关联 | 2026-01-25 | ✅ |
| 竞品管理 | `/competitors` | 竞品优劣势、销售渠道管理 | 2026-01-25 | ✅ |
| GEO 诊断 | `/geo-diagnosis` | AI 诊断分析、历史记录 | 2026-01-25 | ✅ |
| 内容工厂 | `/content-factory` | AI 内容生成、多平台风格 | 2026-01-25 | ✅ |
| 作业流 | `/workflow` | Kanban 任务管理 | 2026-01-25 | ✅ |
| 问题库 | `/query-library` | 监测问题管理 | 2026-01-25 | ✅ |
| AI 监测 | `/ai-monitor` | AI 搜索排名监测、批量执行 | 2026-01-25 | ✅ |
| 监测报告 | `/report` | GEO 监测报告、打印/PDF | 2026-01-26 | ✅ |
| 系统设置 | `/settings` | API配置、数据管理、导出 | 2026-01-26 | ✅ |

### 待开发模块

| 模块 | 优先级 | 说明 | 预计工期 |
|------|--------|------|----------|
| 定时监测 | P1 | Cron 定时执行 AI 搜索监测 | 3天 |
| 用户系统 | P1 | 多用户/团队/权限支持 | 5天 |
| 数据库存储 | P1 | PostgreSQL 替换 LocalStorage | 3天 |
| 数据分析 | P2 | 高级图表、趋势预测 | 3天 |
| API 开放 | P2 | 第三方集成接口 | 2天 |

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
| `geo-nexus-diagnosis` | 诊断历史 | useDiagnosisStore.ts |
| `geo-nexus-content` | 内容历史 | useContentStore.ts |
| `geo-nexus-settings` | 系统设置 | useSettingsStore.ts |
| `geo-nexus-onboarding-completed` | 引导完成标记 | - |

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
- switch (新增)

### 自定义组件

| 组件 | 路径 | 用途 |
|------|------|------|
| Sidebar | `components/layout/Sidebar.tsx` | 响应式侧边栏 |
| GeoRadar | `components/charts/GeoRadar.tsx` | GEO 雷达图 |
| RankingTrend | `components/charts/RankingTrend.tsx` | 排名趋势图 |
| GeoHealthScore | `components/charts/GeoHealthScore.tsx` | 健康度评分 |
| Skeleton | `components/ui/skeleton.tsx` | 骨架屏加载 |
| EmptyState | `components/ui/empty-state.tsx` | 空状态提示 |
| OnboardingGuide | `components/OnboardingGuide.tsx` | 新手引导 |
| KeyboardShortcutsDialog | `components/KeyboardShortcutsDialog.tsx` | 快捷键帮助 |

### 添加新组件

```bash
npx shadcn@latest add [component-name]
```

---

## 📝 变更记录

### 2026-01-26 - 第四阶段：用户体验优化 ✅

**新增功能**：
- **移动端响应式**：侧边栏支持移动端折叠/展开，添加汉堡菜单
- **骨架屏加载**：多种骨架组件（卡片、表格、列表、图表）
- **空状态组件**：美观的空数据引导页，支持多种场景类型
- **全局键盘快捷键**：`Alt+1~8` 快速导航各模块
- **快捷键帮助弹窗**：按 `?` 显示所有可用快捷键
- **新手引导向导**：首次使用的 6 步引导教程

**新增文件**：
- `src/components/ui/skeleton.tsx` - 骨架屏组件
- `src/components/ui/empty-state.tsx` - 空状态组件
- `src/hooks/useKeyboardShortcuts.ts` - 快捷键 Hook
- `src/components/KeyboardShortcutsDialog.tsx` - 快捷键弹窗
- `src/components/OnboardingGuide.tsx` - 新手引导
- `src/components/providers/KeyboardProvider.tsx` - 快捷键 Provider

**更新文件**：
- `src/components/layout/Sidebar.tsx` - 响应式改造
- `src/app/layout.tsx` - 添加 Provider 和响应式布局

**Bug 修复**：
- 修复 Recharts Tooltip formatter 类型错误
- 修复 Set 迭代器兼容性问题
- 修复 TaskStatus 类型比较错误
- 修复 SearchQuery 类型命名不一致
- 修复多处未使用变量的 ESLint 错误

---

### 2026-01-26 - 第三阶段：系统设置与数据导出 ✅

**新增功能**：
- **系统设置页**：`/settings` 页面，配置 Dify API、默认模型、界面设置等
- **数据导出**：支持导出产品/竞品/监测任务等数据为 CSV 格式
- **数据统计**：设置页展示各模块数据量统计
- **危险操作区**：支持一键清除所有本地数据

**新增文件**：
- `src/types/settings.ts` - 系统设置类型定义
- `src/store/useSettingsStore.ts` - 设置状态管理
- `src/app/settings/page.tsx` - 系统设置页面
- `src/lib/export-utils.ts` - CSV 导出工具函数

**更新文件**：
- `src/components/layout/Sidebar.tsx` - 添加设置入口

---

### 2026-01-26 - 第二阶段功能完善 ✅

**新增功能**：
- **批量监测执行**：一键执行所有待处理的监测任务
- **监测结果详情**：增强的任务详情弹窗，显示完整 AI 回复
- **报告图表**：添加模型提及率对比柱状图
- **诊断历史记录**：GEO 诊断结果自动保存，可折叠查看历史
- **内容生成历史**：内容工厂结果自动保存，支持复制和删除

**新增文件**：
- `src/types/diagnosis.ts` - 诊断记录类型
- `src/store/useDiagnosisStore.ts` - 诊断历史 Store
- `src/types/content.ts` - 内容记录类型
- `src/store/useContentStore.ts` - 内容历史 Store

**更新文件**：
- `src/hooks/useMonitorExecution.ts` - 支持批量执行
- `src/app/ai-monitor/page.tsx` - 批量执行按钮、增强详情视图
- `src/app/report/page.tsx` - 添加 Recharts 柱状图
- `src/app/geo-diagnosis/page.tsx` - 诊断结果保存和历史展示
- `src/app/content-factory/page.tsx` - 内容保存和历史展示

---

### 2026-01-26 - 监测执行与报告 ✅

**新增功能**：
- **监测任务执行**：实现真正调用 Dify API 执行监测任务
- **实时执行进度**：任务执行时显示当前模型和进度条
- **监测报告页**：新增 `/report` 页面，支持打印/导出 PDF
- **产品-竞品关联**：产品管理中可选择关联已创建的竞品
- **工作台数据整合**：Dashboard 显示真实统计数据

**新增文件**：
- `src/hooks/useMonitorExecution.ts` - 监测执行逻辑
- `src/app/report/page.tsx` - 监测报告页面

**更新文件**：
- `src/app/ai-monitor/page.tsx` - 添加执行按钮和进度显示
- `src/app/product-manager/page.tsx` - 添加竞品关联选择
- `src/app/page.tsx` - 整合真实数据到工作台
- `src/components/layout/Sidebar.tsx` - 添加报告入口
- `src/types/product.ts` - 添加 competitorIds 字段

---

### 2026-01-25 - AI 监测增强 ✅

**新增组件**：
- `RankingTrend` - 排名趋势折线图（使用 Recharts）
- `MentionTrend` - 提及率趋势图
- `GeoHealthScore` - GEO 健康度环形图 + 分项得分

**AI 监测页面更新**：
- 新增「数据概览」Tab：健康度评分 + 监测快报 + 提及率走势
- 新增「趋势分析」Tab：多模型排名对比 + 趋势洞察
- 优化 Tab 布局：概览 / 任务 / 趋势 / 模型

**文件变更**：
- 新增 `src/components/charts/RankingTrend.tsx`
- 新增 `src/components/charts/GeoHealthScore.tsx`
- 更新 `src/app/ai-monitor/page.tsx`

---

### 2026-01-25 - 初始版本 ✅

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

## 📊 开发统计

### 代码行数统计 (估算)

| 模块 | 文件数 | 代码行数 |
|------|--------|----------|
| 页面 (app/) | 11 | ~5,500 |
| 组件 (components/) | 15 | ~2,000 |
| Hooks | 3 | ~500 |
| Store | 8 | ~800 |
| Types | 8 | ~400 |
| Lib | 3 | ~400 |
| **总计** | **48** | **~9,600** |

### 功能完成度

| 模块 | PRD 要求 | 已实现 | 完成度 |
|------|----------|--------|--------|
| 实体知识库 | 产品+竞品管理 | ✅ | 100% |
| AI 诊断探针 | 多模式诊断 | ✅ | 100% |
| 语义内容工厂 | PDP+评论+种草 | ✅ | 100% |
| 作业流监控 | Kanban+检查清单 | ✅ | 100% |
| AI 排名监测 | 多模型监测 | ✅ | 90% |
| 报告导出 | 打印/PDF | ✅ | 100% |
| 系统设置 | 配置管理 | ✅ | 100% |
| 用户体验 | 响应式+引导 | ✅ | 100% |

---

## 🐛 已知问题

| # | 问题 | 影响 | 状态 | 优先级 |
|---|------|------|------|--------|
| 1 | 流式响应中断 | 网络不稳定时 | 已添加错误处理 | P2 |
| 2 | LocalStorage 限制 | 数据量大时失败 | 待迁移数据库 | P1 |
| 3 | 缺少单元测试 | 回归风险 | 待添加 | P1 |
| 4 | 移动端表格显示 | 横向滚动体验 | 待优化 | P2 |

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

### 快速清除开发数据

```javascript
// 清除所有 GEO Nexus 数据
localStorage.clear();
location.reload();
```

### 重置新手引导

```javascript
localStorage.removeItem('geo-nexus-onboarding-completed');
location.reload();
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统技术架构 |
| [DIFY_CONFIG.md](./DIFY_CONFIG.md) | Dify 应用配置 |
| [PRD_PHASE2.md](./PRD_PHASE2.md) | 下阶段需求文档 |
| [README.md](./README.md) | 项目说明 |

---

## 🔜 下一阶段计划

详见 [PRD_PHASE2.md](./PRD_PHASE2.md)

**核心方向：**
1. 用户认证与多租户支持
2. 服务端数据存储
3. 定时监测任务
4. 数据分析增强
5. API 开放平台

---

*最后更新: 2026-01-26*
