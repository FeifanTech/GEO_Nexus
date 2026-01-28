# 🚀 Supabase 数据库配置快速开始

> ✅ Prisma Client 已成功生成！
> 📅 更新时间: 2026-01-28

---

## ✅ 已完成的步骤

1. ✅ 安装 Prisma 依赖
2. ✅ 创建 Prisma Schema (15 个数据表)
3. ✅ 生成 Prisma Client
4. ✅ 创建数据库连接单例
5. ✅ 配置 NPM 脚本（已修复证书问题）

---

## 📝 下一步操作

### 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com 并登录
2. 点击 "New Project"
3. 填写项目信息:
   - **Name**: `geo-nexus-platform`
   - **Database Password**: 生成强密码并保存
   - **Region**: `Southeast Asia (Singapore)`
   - **Plan**: Free
4. 等待项目创建完成（约 2-3 分钟）

### 步骤 2: 获取数据库连接字符串

1. 在 Supabase Dashboard，进入 **Settings** → **Database**
2. 找到 **Connection string** 区域
3. 复制以下两个 URL:

#### Transaction Pooler (用于应用查询)
```
选择 "URI" 标签 → "Transaction mode"
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Session Pooler (用于数据库迁移)
```
选择 "URI" 标签 → "Session mode"
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@...pooler.supabase.com:5432/postgres
```

### 步骤 3: 配置 .env.local

你已经打开了 `.env.local` 文件，现在填写以下信息:

```bash
# ==================== Supabase 数据库配置 ====================
# Transaction Pooler (应用查询使用)
DATABASE_URL="postgresql://postgres.xxxxx:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session Pooler (Prisma migrations 使用)
DIRECT_URL="postgresql://postgres.xxxxx:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ==================== NextAuth.js 配置 ====================
NEXTAUTH_SECRET="运行下面的命令生成"
NEXTAUTH_URL="http://localhost:3000"
```

**生成 NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

将输出结果复制到 `.env.local` 的 `NEXTAUTH_SECRET` 字段。

### 步骤 4: 运行数据库迁移

在 Supabase 中创建所有数据表:

```bash
npm run db:migrate
```

这会:
- 连接到你的 Supabase 数据库
- 创建所有 15 个数据表
- 生成迁移文件到 `prisma/migrations/`

**预期输出:**
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema.
✔ Created migration: 20260128_init
```

### 步骤 5: 验证连接

#### 方法 1: 运行测试脚本
```bash
npx tsx scripts/test-db.ts
```

**预期输出:**
```
✅ 连接成功!
✅ 找到 15 个数据表
✅ 数据统计
🎉 所有测试通过!
```

#### 方法 2: 打开数据库管理界面
```bash
npm run db:studio
```

浏览器会自动打开 `http://localhost:5555`，你可以:
- 查看所有数据表结构
- 手动添加测试数据
- 验证表关系

#### 方法 3: 在 Supabase Dashboard 查看
1. 打开 Supabase Dashboard
2. 点击左侧 **Table Editor**
3. 应该能看到所有创建的表

---

## 🎯 完成后你会看到这些数据表

### 用户认证 (4 个)
- ✅ User - 用户信息
- ✅ Account - OAuth 账号
- ✅ Session - 会话管理
- ✅ VerificationToken - 验证令牌

### 团队协作 (2 个)
- ✅ Team - 团队
- ✅ TeamMember - 团队成员

### 业务数据 (6 个)
- ✅ Product - 产品管理
- ✅ Competitor - 竞品管理
- ✅ Task - 作业流
- ✅ SearchQuery - 问题库
- ✅ MonitorTask - AI 监测
- ✅ DiagnosisRecord - GEO 诊断
- ✅ ContentRecord - 内容工厂

### 系统配置 (3 个)
- ✅ UserSettings - 用户设置
- ✅ ScheduledTask - 定时任务
- ✅ TaskExecution - 任务执行记录
- ✅ ApiKey - API 密钥

---

## 🛠️ 可用的 NPM 脚本

```bash
npm run db:generate    # 生成 Prisma Client
npm run db:push        # 快速同步 schema（开发用）
npm run db:migrate     # 创建迁移文件（生产用）
npm run db:studio      # 打开数据库 GUI
npm run db:seed        # 运行种子数据（未来实现）
```

**注意:** 所有脚本已配置环境变量 `NODE_TLS_REJECT_UNAUTHORIZED=0` 解决证书问题。

---

## 🐛 常见问题

### Q: 迁移时出现 "Connection timeout"
**解决:**
1. 检查 `.env.local` 中的连接字符串是否正确
2. 确保密码中没有特殊字符（如果有，需要 URL 编码）
3. 确认 Supabase 项目已完成初始化

### Q: "Table already exists" 错误
**解决:**
```bash
# 重置数据库（⚠️ 会删除所有数据）
npm run db:push -- --force-reset
```

### Q: Prisma Client 导入错误
**解决:**
```bash
# 重新生成
npm run db:generate
```

---

## 📚 详细文档

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - 完整配置指南
- **[SUPABASE_CONFIG_SUMMARY.md](./SUPABASE_CONFIG_SUMMARY.md)** - 架构说明
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Phase 2 开发计划

---

## 🎉 配置完成后

你就可以开始:

1. **集成 NextAuth.js** - 用户认证系统
2. **创建 API 端点** - RESTful API
3. **数据迁移** - 从 LocalStorage 迁移到数据库
4. **团队功能** - 多用户协作

---

*快速开始指南 - GEO Nexus Platform*
*最后更新: 2026-01-28*
