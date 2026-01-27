# GEO Nexus Platform

<div align="center">

![GEO Nexus](https://img.shields.io/badge/GEO-Nexus-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

**AI 搜索优化运营平台 (GEO Ops Platform)**

帮助企业在 AI 搜索时代抢占先机，优化品牌在 ChatGPT、Kimi、文心一言等 AI 助手中的表现

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [技术架构](#-技术架构) · [开发指南](#-开发指南)

</div>

---

## 📖 项目简介

GEO Nexus 是一个专为 **Generative Engine Optimization (GEO)** 设计的一站式运营平台。随着 AI 搜索引擎（如 ChatGPT、Perplexity、Kimi 等）的崛起，传统 SEO 策略已不足以应对新的搜索格局。GEO Nexus 帮助品牌：

- 🔍 **监测** - 追踪品牌在各大 AI 模型中的排名表现
- 🩺 **诊断** - 分析产品的 GEO 优化状态和改进空间
- ✍️ **生成** - 批量创建符合 GEO 最佳实践的优化内容
- 📋 **管理** - 统一管理优化任务的执行流程

---

## ✨ 功能特性

### 🏠 工作台 Dashboard
- 数据概览卡片（产品数、竞品数、监测任务数）
- 快捷功能入口
- 最新动态展示

### 📦 产品管理
- 产品信息 CRUD
- 竞品关联
- 核心卖点、目标用户管理

### 🎯 竞品管理
- 竞品资料库
- 优势/劣势分析
- 销售渠道管理

### 🩺 GEO 诊断
- **排名检查** - 分析产品在 AI 搜索中被推荐的可能性
- **竞品分析** - 深度对比竞争对手
- **舆情审计** - 预判用户负面评价

### 📊 AI 排名监测
- 多模型监测（ChatGPT、Kimi、文心一言等）
- 批量执行监测任务
- 排名趋势图表
- 健康度评分

### ❓ 问题库
- 管理 AI 搜索监测问题
- 问题分类标签
- 批量导入/导出

### ✍️ 内容工厂
- **PDP 摘要** - 生成产品详情页 AI 摘要
- **批量评论** - 生成自然真实的用户评论
- **种草文案** - 多平台风格（小红书/知乎/抖音）

### 📋 作业流管理
- Kanban 看板视图
- 任务检查清单
- 状态流转追踪

### 📄 监测报告
- 综合报告生成
- 打印/PDF 导出
- 模型对比分析

### ⚙️ 系统设置
- Dify API 配置
- 数据导出（CSV）
- 数据清除

---

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/FeifanTech/GEO_Nexus.git
cd GEO_Nexus/geo-nexus-platform
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```bash
# Dify API 配置
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx

# 可选：自定义 Dify API 地址
# DIFY_API_BASE_URL=https://api.dify.ai/v1
```

4. **启动开发服务器**

```bash
npm run dev
```

5. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Next.js 14 (App Router) |
| **语言** | TypeScript 5.x |
| **样式** | Tailwind CSS 3.x |
| **UI 组件** | Ant Design 5.x + shadcn/ui |
| **状态管理** | Zustand + LocalStorage |
| **图表** | Recharts |
| **AI 引擎** | Dify |

### 项目结构

```
geo-nexus-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/dify/          # Dify API 代理
│   │   ├── product-manager/   # 产品管理
│   │   ├── competitors/       # 竞品管理
│   │   ├── geo-diagnosis/     # GEO 诊断
│   │   ├── ai-monitor/        # AI 监测
│   │   ├── query-library/     # 问题库
│   │   ├── content-factory/   # 内容工厂
│   │   ├── workflow/          # 作业流
│   │   ├── report/            # 监测报告
│   │   └── settings/          # 系统设置
│   ├── components/            # React 组件
│   │   ├── layout/           # 布局组件
│   │   ├── charts/           # 图表组件
│   │   ├── ui/               # UI 基础组件
│   │   └── providers/        # Context Providers
│   ├── hooks/                 # 自定义 Hooks
│   ├── lib/                   # 工具函数
│   ├── store/                 # Zustand Stores
│   └── types/                 # TypeScript 类型
├── public/                    # 静态资源
├── .env.local                 # 环境变量
└── package.json
```

---

## 💻 开发指南

### 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 添加 shadcn/ui 组件
npx shadcn@latest add [component-name]
```

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

### 添加新功能模块

1. 在 `src/app/` 下创建新的路由目录
2. 在 `src/types/` 中定义类型
3. 在 `src/store/` 中创建 Zustand store
4. 更新 `Sidebar.tsx` 添加导航入口
5. 更新文档

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统技术架构详解 |
| [ANTD_INTEGRATION.md](./ANTD_INTEGRATION.md) | Ant Design 集成指南 |
| [DIFY_CONFIG.md](./DIFY_CONFIG.md) | Dify 应用配置指南 |
| [DEV_NOTES.md](./DEV_NOTES.md) | 开发笔记与变更记录 |
| [PRD_PHASE2.md](./PRD_PHASE2.md) | 第二阶段需求规划 |

---

## 🔧 Dify 配置

GEO Nexus 使用 [Dify](https://dify.ai/) 作为 AI 引擎。你需要：

1. 在 Dify 创建一个 Chatflow 应用
2. 配置条件分支处理不同的 `task_type`
3. 将 API Key 添加到 `.env.local`

详细配置说明请参考 [DIFY_CONFIG.md](./DIFY_CONFIG.md)

---

## 🗺️ 路线图

### Phase 1 ✅ 已完成
- 核心功能模块
- LocalStorage 数据持久化
- Dify AI 集成
- 响应式 UI

### Phase 2 🚧 进行中
- [ ] 用户认证系统
- [ ] PostgreSQL 数据库
- [ ] 定时监测任务
- [ ] 数据分析增强
- [ ] API 开放平台

详见 [PRD_PHASE2.md](./PRD_PHASE2.md)

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系我们

- **GitHub**: [FeifanTech/GEO_Nexus](https://github.com/FeifanTech/GEO_Nexus)
- **Issues**: [提交问题](https://github.com/FeifanTech/GEO_Nexus/issues)

---

<div align="center">

**Made with ❤️ by GEO Nexus Team**

</div>
