# GEO Nexus - Phase 2 实施计划

> 版本: 1.0  
> 创建日期: 2026-01-26  
> 最后更新: 2026-01-26  
> 参考文档: [PRD_PHASE2.md](./PRD_PHASE2.md)

---

## 📋 计划概述

本文档为 GEO Nexus 平台第二阶段开发的详细实施计划，将 PRD 中的需求分解为可执行的开发任务。

### 开发原则

1. **增量开发** - 每完成一个功能模块立即可用
2. **向后兼容** - 保持现有 LocalStorage 功能，渐进迁移
3. **测试驱动** - 关键功能需有测试覆盖
4. **文档同步** - 代码变更同步更新文档

---

## 🎯 阶段一：基础设施搭建

### 1.1 数据库环境配置

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 无

#### 任务清单

- [ ] 安装 Prisma 依赖
  ```bash
  npm install prisma @prisma/client
  npm install -D prisma
  ```

- [ ] 初始化 Prisma
  ```bash
  npx prisma init
  ```

- [ ] 配置数据库连接
  ```env
  # .env.local
  DATABASE_URL="postgresql://user:password@localhost:5432/geo_nexus?schema=public"
  ```

- [ ] 选择数据库托管方案
  - 方案 A: Vercel Postgres (推荐，与部署平台一体)
  - 方案 B: Supabase (免费额度大)
  - 方案 C: Railway (简单易用)
  - 方案 D: 本地 Docker PostgreSQL (开发用)

#### 输出物
- [x] `prisma/schema.prisma` 配置文件
- [x] `.env.local` 数据库连接配置
- [x] 数据库连接测试通过

---

### 1.2 Prisma Schema 设计

**状态**: ⬜ 待开始  
**预计时间**: 1 天  
**依赖**: 1.1

#### 数据模型设计

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== 用户认证 ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  passwordHash  String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  accounts      Account[]
  sessions      Session[]
  teamMembers   TeamMember[]
  ownedTeams    Team[]        @relation("TeamOwner")
  
  // 业务数据
  products      Product[]
  competitors   Competitor[]
  tasks         Task[]
  queries       SearchQuery[]
  monitorTasks  MonitorTask[]
  diagnosisRecords DiagnosisRecord[]
  contentRecords   ContentRecord[]
  settings      UserSettings?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ==================== 团队 ====================

model Team {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner     User         @relation("TeamOwner", fields: [ownerId], references: [id])
  members   TeamMember[]
}

model TeamMember {
  id       String   @id @default(cuid())
  userId   String
  teamId   String
  role     String   @default("viewer") // admin, editor, viewer
  joinedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([userId, teamId])
}

// ==================== 业务实体 ====================

model Product {
  id             String   @id @default(cuid())
  userId         String
  name           String
  category       String?
  description    String?  @db.Text
  sellingPoints  Json     @default("[]")
  targetUsers    String?
  priceRange     String?
  competitorIds  Json     @default("[]")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model Competitor {
  id            String   @id @default(cuid())
  userId        String
  name          String
  description   String?  @db.Text
  advantages    Json     @default("[]")
  disadvantages Json     @default("[]")
  channels      Json     @default("[]")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model Task {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?  @db.Text
  productId   String?
  type        String   // pdp_optimize, review_publish, etc.
  status      String   @default("todo") // todo, in_progress, done
  priority    String   @default("medium") // low, medium, high, urgent
  checklist   Json     @default("[]")
  assignee    String?
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}

model SearchQuery {
  id        String   @id @default(cuid())
  userId    String
  text      String
  category  String?
  tags      Json     @default("[]")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model MonitorTask {
  id          String   @id @default(cuid())
  userId      String
  productId   String?
  queryId     String?
  queryText   String
  targetBrand String
  models      Json     @default("[]")
  status      String   @default("pending") // pending, running, completed, failed
  results     Json     @default("[]")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  executedAt  DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}

model DiagnosisRecord {
  id          String   @id @default(cuid())
  userId      String
  productId   String?
  productName String
  type        String   // rank, competitor, sentiment
  query       String   @db.Text
  response    String   @db.Text
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model ContentRecord {
  id          String   @id @default(cuid())
  userId      String
  productId   String?
  productName String
  type        String   // pdp, review, social
  platform    String?
  content     String   @db.Text
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  difyApiKey      String?
  defaultModel    String   @default("qwen")
  language        String   @default("zh-CN")
  theme           String   @default("light")
  notifications   Json     @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==================== 定时任务 ====================

model ScheduledTask {
  id             String   @id @default(cuid())
  userId         String
  taskType       String   // monitor, report
  cronExpression String
  enabled        Boolean  @default(true)
  config         Json     @default("{}")
  lastRunAt      DateTime?
  nextRunAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  executions TaskExecution[]
  
  @@index([enabled])
}

model TaskExecution {
  id              String   @id @default(cuid())
  scheduledTaskId String
  status          String   @default("pending") // pending, running, success, failed
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  result          Json?
  error           String?  @db.Text

  scheduledTask ScheduledTask @relation(fields: [scheduledTaskId], references: [id], onDelete: Cascade)
  
  @@index([scheduledTaskId])
  @@index([status])
}

// ==================== API 密钥 ====================

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  name        String
  key         String   @unique
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  permissions Json     @default("[]")
  createdAt   DateTime @default(now())

  @@index([key])
}
```

#### 任务清单

- [ ] 创建完整的 Prisma Schema
- [ ] 运行数据库迁移
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] 生成 Prisma Client
  ```bash
  npx prisma generate
  ```
- [ ] 创建 `src/lib/prisma.ts` 数据库连接单例

#### 输出物
- [ ] `prisma/schema.prisma` 完整模型
- [ ] `prisma/migrations/` 迁移文件
- [ ] `src/lib/prisma.ts` 连接文件

---

### 1.3 NextAuth.js 集成

**状态**: ⬜ 待开始  
**预计时间**: 1 天  
**依赖**: 1.2

#### 任务清单

- [ ] 安装 NextAuth.js 依赖
  ```bash
  npm install next-auth@beta @auth/prisma-adapter
  ```

- [ ] 创建认证配置 `src/lib/auth.ts`
  ```typescript
  import NextAuth from "next-auth"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import CredentialsProvider from "next-auth/providers/credentials"
  import GoogleProvider from "next-auth/providers/google"
  import GitHubProvider from "next-auth/providers/github"
  import { prisma } from "./prisma"
  import bcrypt from "bcryptjs"
  ```

- [ ] 创建 API 路由 `src/app/api/auth/[...nextauth]/route.ts`

- [ ] 配置环境变量
  ```env
  NEXTAUTH_SECRET=your-secret-key
  NEXTAUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=xxx
  GOOGLE_CLIENT_SECRET=xxx
  GITHUB_ID=xxx
  GITHUB_SECRET=xxx
  ```

- [ ] 创建认证 Provider `src/components/providers/AuthProvider.tsx`

- [ ] 更新 `src/app/layout.tsx` 添加 SessionProvider

#### 输出物
- [ ] `src/lib/auth.ts` 认证配置
- [ ] `src/app/api/auth/[...nextauth]/route.ts` API 路由
- [ ] `src/components/providers/AuthProvider.tsx`
- [ ] `src/hooks/useAuth.ts` 认证 Hook

---

## 🎯 阶段二：用户认证界面

### 2.1 登录页面

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 1.3

#### 任务清单

- [ ] 创建 `src/app/(auth)/layout.tsx` 认证布局
- [ ] 创建 `src/app/(auth)/login/page.tsx` 登录页
- [ ] 实现邮箱密码登录表单
- [ ] 实现第三方登录按钮 (Google, GitHub)
- [ ] 添加表单验证 (Zod)
- [ ] 处理登录错误提示
- [ ] 登录成功后跳转

#### UI 设计要点
- 居中卡片布局
- 品牌 Logo 展示
- 清晰的错误提示
- 加载状态反馈

---

### 2.2 注册页面

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 2.1

#### 任务清单

- [ ] 创建 `src/app/(auth)/register/page.tsx` 注册页
- [ ] 实现注册表单 (邮箱、密码、确认密码、姓名)
- [ ] 密码强度校验
- [ ] 邮箱格式校验
- [ ] 创建用户 API `src/app/api/auth/register/route.ts`
- [ ] 注册成功后自动登录

---

### 2.3 忘记密码流程

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 2.2

#### 任务清单

- [ ] 创建 `src/app/(auth)/forgot-password/page.tsx`
- [ ] 创建 `src/app/(auth)/reset-password/page.tsx`
- [ ] 发送重置邮件 API
- [ ] 验证重置 Token
- [ ] 更新密码 API

---

### 2.4 用户个人设置

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 2.2

#### 任务清单

- [ ] 更新 `src/app/settings/page.tsx` 添加用户信息区
- [ ] 头像上传功能
- [ ] 修改姓名
- [ ] 修改密码
- [ ] 账号注销 (软删除)

---

## 🎯 阶段三：数据层重构

### 3.1 创建 API 端点

**状态**: ⬜ 待开始  
**预计时间**: 1 天  
**依赖**: 1.3

#### API 路由清单

| 端点 | 方法 | 文件路径 | 说明 |
|------|------|----------|------|
| `/api/products` | GET, POST | `api/products/route.ts` | 产品列表/创建 |
| `/api/products/[id]` | GET, PUT, DELETE | `api/products/[id]/route.ts` | 产品详情/更新/删除 |
| `/api/competitors` | GET, POST | `api/competitors/route.ts` | 竞品列表/创建 |
| `/api/competitors/[id]` | GET, PUT, DELETE | `api/competitors/[id]/route.ts` | 竞品详情/更新/删除 |
| `/api/tasks` | GET, POST | `api/tasks/route.ts` | 任务列表/创建 |
| `/api/tasks/[id]` | GET, PUT, DELETE | `api/tasks/[id]/route.ts` | 任务详情/更新/删除 |
| `/api/queries` | GET, POST | `api/queries/route.ts` | 问题列表/创建 |
| `/api/monitor-tasks` | GET, POST | `api/monitor-tasks/route.ts` | 监测任务 |
| `/api/diagnosis` | GET, POST | `api/diagnosis/route.ts` | 诊断记录 |
| `/api/content` | GET, POST | `api/content/route.ts` | 内容记录 |

#### 任务清单

- [ ] 创建 API 路由基础结构
- [ ] 实现 CRUD 操作
- [ ] 添加用户鉴权中间件
- [ ] 添加请求参数校验 (Zod)
- [ ] 统一错误处理
- [ ] 添加分页支持

---

### 3.2 React Query 集成

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 3.1

#### 任务清单

- [ ] 安装 React Query
  ```bash
  npm install @tanstack/react-query
  ```

- [ ] 创建 QueryClient Provider `src/components/providers/QueryProvider.tsx`

- [ ] 创建自定义 Hooks
  - [ ] `src/hooks/api/useProducts.ts`
  - [ ] `src/hooks/api/useCompetitors.ts`
  - [ ] `src/hooks/api/useTasks.ts`
  - [ ] `src/hooks/api/useQueries.ts`
  - [ ] `src/hooks/api/useMonitor.ts`

---

### 3.3 页面数据层迁移

**状态**: ⬜ 待开始  
**预计时间**: 1.5 天  
**依赖**: 3.2

#### 迁移清单

| 页面 | 原 Store | 新 Hook | 优先级 |
|------|----------|---------|--------|
| 产品管理 | useProductStore | useProducts | P1 |
| 竞品管理 | useCompetitorStore | useCompetitors | P1 |
| 作业流 | useTaskStore | useTasks | P1 |
| 问题库 | useQueryStore | useQueries | P1 |
| AI 监测 | useMonitorStore | useMonitor | P2 |
| GEO 诊断 | useDiagnosisStore | useDiagnosis | P2 |
| 内容工厂 | useContentStore | useContent | P2 |
| 系统设置 | useSettingsStore | useSettings | P2 |

#### 迁移策略

```typescript
// 兼容模式：优先使用 API，fallback 到 LocalStorage
const useProducts = () => {
  const { data: session } = useSession();
  
  // 已登录用户使用 API
  if (session?.user) {
    return useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  }
  
  // 未登录用户继续使用 LocalStorage
  return useProductStore();
};
```

---

### 3.4 数据迁移工具

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 3.3

#### 任务清单

- [ ] 创建迁移 API `src/app/api/migrate/route.ts`
- [ ] 读取 LocalStorage 数据
- [ ] 批量写入数据库
- [ ] 迁移进度显示
- [ ] 迁移完成后清理 LocalStorage
- [ ] 在设置页添加"迁移数据"按钮

---

## 🎯 阶段四：团队功能

### 4.1 团队管理

**状态**: ⬜ 待开始  
**预计时间**: 1 天  
**依赖**: 3.3

#### 任务清单

- [ ] 创建团队 API
  - [ ] `POST /api/teams` 创建团队
  - [ ] `GET /api/teams` 获取我的团队
  - [ ] `PUT /api/teams/[id]` 更新团队
  - [ ] `DELETE /api/teams/[id]` 删除团队

- [ ] 团队成员 API
  - [ ] `POST /api/teams/[id]/members` 邀请成员
  - [ ] `DELETE /api/teams/[id]/members/[userId]` 移除成员
  - [ ] `PUT /api/teams/[id]/members/[userId]` 修改角色

- [ ] 邀请链接功能
  - [ ] 生成邀请链接
  - [ ] 邀请链接验证页面
  - [ ] 接受邀请加入团队

---

### 4.2 团队数据隔离

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 4.1

#### 任务清单

- [ ] 在所有业务表添加 `teamId` 字段 (可选)
- [ ] API 查询添加团队过滤
- [ ] 团队切换功能
- [ ] 权限校验中间件

---

## 🎯 阶段五：定时监测

### 5.1 定时任务管理界面

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 3.3

#### 任务清单

- [ ] 在 AI 监测页添加"定时任务"Tab
- [ ] 创建定时任务表单
  - 任务名称
  - 执行频率 (每日/每周/自定义 Cron)
  - 执行时间
  - 监测问题选择
  - 目标品牌
  - 通知设置
- [ ] 定时任务列表
- [ ] 启用/禁用开关
- [ ] 执行历史查看

---

### 5.2 Cron 执行端点

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 5.1

#### 任务清单

- [ ] 创建 `src/app/api/cron/monitor/route.ts`
- [ ] 配置 `vercel.json` Cron 设置
- [ ] 查询待执行任务
- [ ] 调用 Dify API 执行监测
- [ ] 保存执行结果
- [ ] 更新 nextRunAt

---

### 5.3 通知系统

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 5.2

#### 任务清单

- [ ] 邮件通知 (使用 Resend 或 SendGrid)
- [ ] Webhook 通知 (企业微信/钉钉)
- [ ] 站内通知 (可选，Phase 3)

---

## 🎯 阶段六：API 开放平台 (P2)

### 6.1 API Key 管理

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 3.3

#### 任务清单

- [ ] 在设置页添加"API 密钥"Tab
- [ ] 生成 API Key
- [ ] 查看/吊销 API Key
- [ ] 设置 Key 权限范围
- [ ] 设置过期时间

---

### 6.2 开放 API 端点

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 6.1

#### 任务清单

- [ ] 创建 `/api/v1/` 公开 API 路由
- [ ] API Key 认证中间件
- [ ] 请求频率限制 (Upstash Ratelimit)
- [ ] 访问日志记录

---

### 6.3 API 文档

**状态**: ⬜ 待开始  
**预计时间**: 0.5 天  
**依赖**: 6.2

#### 任务清单

- [ ] 生成 OpenAPI 规范文档
- [ ] 集成 Swagger UI 或创建文档页面
- [ ] API 使用示例

---

## 📊 进度跟踪

### 总体进度

| 阶段 | 任务数 | 已完成 | 进度 |
|------|--------|--------|------|
| 阶段一：基础设施 | 3 | 0 | 0% |
| 阶段二：认证界面 | 4 | 0 | 0% |
| 阶段三：数据层重构 | 4 | 0 | 0% |
| 阶段四：团队功能 | 2 | 0 | 0% |
| 阶段五：定时监测 | 3 | 0 | 0% |
| 阶段六：API 开放 | 3 | 0 | 0% |
| **总计** | **19** | **0** | **0%** |

### 当前状态

```
[当前阶段]: 阶段一 - 基础设施搭建
[当前任务]: 1.1 数据库环境配置
[阻塞问题]: 无
[下一步]: 选择数据库托管方案，配置连接
```

---

## 📝 开发日志

### 2026-01-26

- 创建实施计划文档
- 设计完整的 Prisma Schema
- 规划 19 个开发任务

---

## 🔗 相关文档

- [PRD_PHASE2.md](./PRD_PHASE2.md) - 产品需求文档
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 系统架构
- [DEV_NOTES.md](./DEV_NOTES.md) - 开发笔记

---

*最后更新: 2026-01-26*
