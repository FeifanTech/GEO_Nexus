# ⚠️ Supabase 连接字符串配置问题

## 问题诊断

当前错误: `FATAL: Tenant or user not found`

这表明 Supabase 连接信息不正确。

## 正确的连接字符串格式

Supabase 连接字符串应该是这样的格式:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:[port]/postgres
```

### 示例（正确格式）

```bash
# Transaction Pooler (DATABASE_URL)
postgresql://postgres.abcdefghijklmnop:your_password@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session Pooler (DIRECT_URL)
postgresql://postgres.abcdefghijklmnop:your_password@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

### 当前检测到的格式

```
postgresql://postgres.rjffplnzllritevmecjf:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**问题**: `postgres.rjffplnzllritevmecjf` 看起来不像标准的 Supabase project-ref 格式。

## 📝 如何获取正确的连接字符串

### 方法 1: 从 Supabase Dashboard 获取（推荐）

1. 登录 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **Settings** → **Database**
4. 滚动到 **Connection string** 区域
5. 选择 **URI** 标签
6. **Mode 下拉菜单**选择:
   - **Transaction** → 复制完整 URI (用于 DATABASE_URL)
   - **Session** → 复制完整 URI (用于 DIRECT_URL)

### 方法 2: 手动构建连接字符串

你需要以下信息：

1. **Project Reference ID** (在 Project Settings → General 中)
   - 格式: 16 个字符的字母数字组合
   - 例如: `abcdefghijklmnop`

2. **Database Password** (创建项目时设置的)
   - 如果忘记了，可以在 Database Settings 中重置

3. **Region** (项目所在区域)
   - 例如: `us-west-2`, `ap-southeast-1`, `eu-west-1`

4. **构建连接字符串**:

```bash
# 替换以下占位符:
# [PROJECT_REF] = 你的项目引用 ID (16 字符)
# [PASSWORD] = 你的数据库密码
# [REGION] = 你的项目区域

# DATABASE_URL (Transaction Pooler, Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# DIRECT_URL (Session Pooler, Port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## 🔍 验证连接字符串

你可以使用以下命令测试连接:

```bash
# 测试 DIRECT_URL
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -c "SELECT version();"
```

如果连接成功，会显示 PostgreSQL 版本信息。

## ✅ 检查清单

- [ ] 项目引用 ID 是 16 个字符的字母数字组合
- [ ] 用户名是 `postgres.[PROJECT_REF]` 格式
- [ ] 密码正确（创建项目时设置的）
- [ ] 区域正确（与你创建项目时选择的一致）
- [ ] DATABASE_URL 端口是 `6543`
- [ ] DIRECT_URL 端口是 `5432`
- [ ] 两个 URL 使用相同的区域

## 🆘 如果仍然无法连接

1. **重置数据库密码**
   - Supabase Dashboard → Settings → Database
   - 找到 "Reset database password"
   - 生成新密码并保存

2. **验证项目状态**
   - 确保 Supabase 项目状态是 "Active"
   - 检查是否有任何待处理的维护

3. **检查网络**
   - 确保没有防火墙阻止连接
   - 尝试从不同网络连接

## 📞 需要帮助？

如果你能提供以下信息，我可以帮你构建正确的连接字符串：

1. Supabase Project Reference ID (在 Project Settings 中)
2. 项目所在 Region
3. 确认数据库密码是否正确

---

*故障排除指南 - GEO Nexus Platform*
*最后更新: 2026-01-28*
