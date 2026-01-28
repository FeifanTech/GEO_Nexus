# Supabase + Prisma 配置指南

> 版本: 1.0
> 创建日期: 2026-01-28
> 适用项目: GEO Nexus Platform

---

## 📋 目录

1. [Supabase 项目创建](#1-supabase-项目创建)
2. [获取数据库连接信息](#2-获取数据库连接信息)
3. [配置本地环境变量](#3-配置本地环境变量)
4. [运行数据库迁移](#4-运行数据库迁移)
5. [验证连接](#5-验证连接)
6. [常见问题](#6-常见问题)

---

## 1. Supabase 项目创建

### 步骤 1: 注册/登录 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 使用 GitHub 账号登录（推荐）
3. 进入 Dashboard

### 步骤 2: 创建新项目

1. 点击 "New Project"
2. 填写项目信息:
   - **Organization**: 选择或创建组织
   - **Name**: `geo-nexus-platform`
   - **Database Password**: 生成强密码（**务必保存**）
   - **Region**: 选择 `Southeast Asia (Singapore)` (最接近中国)
   - **Pricing Plan**: Free (免费额度足够开发使用)
3. 点击 "Create new project"
4. 等待 2-3 分钟项目初始化完成

---

## 2. 获取数据库连接信息

### 步骤 1: 进入项目设置

1. 在 Supabase Dashboard 中打开你的项目
2. 点击左侧菜单 **Settings** (齿轮图标)
3. 选择 **Database**

### 步骤 2: 获取连接字符串

找到 **Connection string** 区域，你会看到两个连接字符串:

#### **Transaction Pooler** (用于应用查询)
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

- ✅ 用于应用程序查询（推荐）
- ✅ 连接池模式，支持高并发
- ✅ 设置为 `DATABASE_URL`

#### **Session Pooler** (用于迁移)
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

- ✅ 用于 Prisma migrations
- ✅ 直连模式，支持完整 PostgreSQL 特性
- ✅ 设置为 `DIRECT_URL`

### 步骤 3: 复制连接字符串

1. 点击 **URI** 标签
2. 选择 **Transaction mode** 复制第一个连接字符串
3. 选择 **Session mode** 复制第二个连接字符串
4. 将 `[YOUR-PASSWORD]` 替换为你的数据库密码

---

## 3. 配置本地环境变量

### 步骤 1: 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（已在 `.gitignore` 中）:

```bash
cp .env.example .env.local
```

### 步骤 2: 填写数据库连接信息

编辑 `.env.local` 文件:

```env
# ==================== Supabase 数据库配置 ====================
# Transaction Pooler (应用查询使用)
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session Pooler (Prisma migrations 使用)
DIRECT_URL="postgresql://postgres.xxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ==================== NextAuth.js 配置 ====================
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 步骤 3: 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

复制输出结果替换 `your-secret-key-here`

---

## 4. 运行数据库迁移

### 步骤 1: 生成 Prisma Client

```bash
npx prisma generate
```

这会根据 `prisma/schema.prisma` 生成 TypeScript 类型定义到 `src/generated/prisma/`

### 步骤 2: 创建初始迁移

```bash
npx prisma migrate dev --name init
```

这会:
1. 连接到 Supabase 数据库
2. 创建所有表结构
3. 生成迁移文件到 `prisma/migrations/`

### 步骤 3: 查看迁移状态

```bash
npx prisma migrate status
```

应该显示: `Database schema is up to date!`

---

## 5. 验证连接

### 方法 1: Prisma Studio (推荐)

```bash
npx prisma studio
```

会打开浏览器访问 `http://localhost:5555`，你可以:
- 查看所有数据表
- 手动添加测试数据
- 验证表结构

### 方法 2: 测试脚本

创建 `scripts/test-db.ts`:

```typescript
import { prisma } from '@/lib/prisma';

async function main() {
  // 测试连接
  const result = await prisma.$queryRaw`SELECT version()`;
  console.log('✅ 数据库连接成功!');
  console.log('PostgreSQL 版本:', result);

  // 测试查询
  const userCount = await prisma.user.count();
  console.log('用户数量:', userCount);
}

main()
  .catch((e) => {
    console.error('❌ 数据库连接失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

运行测试:

```bash
npx tsx scripts/test-db.ts
```

### 方法 3: Supabase Table Editor

1. 在 Supabase Dashboard 打开 **Table Editor**
2. 应该能看到所有由 Prisma 创建的表:
   - User
   - Account
   - Session
   - Product
   - Competitor
   - Task
   - MonitorTask
   - 等等...

---

## 6. 常见问题

### Q1: `unable to get local issuer certificate` 错误

**问题**: Prisma CLI 无法下载二进制文件

**解决方案**:
```bash
# 方案 1: 设置环境变量
export NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate

# 方案 2: 使用手动下载的 schema.prisma (本项目已配置)
```

### Q2: 迁移失败 "Connection timeout"

**问题**: 无法连接到 Supabase

**检查清单**:
- ✅ 密码是否正确（没有特殊字符需要 URL 编码）
- ✅ 连接字符串是否完整复制
- ✅ 是否使用了正确的 Region URL
- ✅ Supabase 项目是否已完成初始化

### Q3: `schema.prisma` 已存在

**问题**: `prisma init` 报错

**解决方案**: 本项目已手动创建配置，无需运行 `prisma init`

### Q4: Prisma Client 导入错误

**问题**: `Cannot find module '@/generated/prisma'`

**解决方案**:
```bash
# 重新生成 Prisma Client
npx prisma generate

# 检查 TypeScript 配置 (tsconfig.json)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Q5: 数据库连接池耗尽

**问题**: `Too many connections`

**解决方案**:
在 `DATABASE_URL` 添加连接限制:
```
?pgbouncer=true&connection_limit=1
```

---

## 📊 Supabase 免费额度

| 资源 | 免费额度 |
|------|---------|
| 数据库存储 | 500 MB |
| 月度数据传输 | 5 GB |
| 月度 API 请求 | 50,000 |
| 实时订阅 | 200 并发 |
| 认证用户 | 50,000 月活用户 |

对于开发和小型项目完全足够！

---

## 🚀 下一步

配置完成后，可以继续:

1. **集成 NextAuth.js** - [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#13-nextauthjs-集成)
2. **创建 API 端点** - [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#31-创建-api-端点)
3. **数据迁移工具** - 将 LocalStorage 数据迁移到数据库

---

## 📚 参考资料

- [Supabase 官方文档](https://supabase.com/docs)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma + Supabase 集成指南](https://www.prisma.io/docs/guides/database/supabase)

---

*配置指南维护: GEO Nexus 开发团队*
*最后更新: 2026-01-28*
