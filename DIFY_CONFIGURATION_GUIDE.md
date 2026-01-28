# 🔧 Dify API 配置指南

> 解决"DIFY_API_KEY is not configured"错误

---

## 🐛 问题现象

点击"开始诊断"按钮时，出现以下错误：
```
DIFY_API_KEY is not configured
```

即使您已经在某处配置了 Dify API Key，仍然出现此错误。

---

## 🔍 问题原因

API 路由 (`src/app/api/dify/route.ts`) 需要从**服务器端环境变量**读取 `DIFY_API_KEY`，而不是客户端环境变量。

**关键区别**:
- ❌ `NEXT_PUBLIC_DIFY_API_KEY` - 客户端可见（不安全，API路由读取不到）
- ✅ `DIFY_API_KEY` - 仅服务器端（安全，API路由可以读取）

---

## ✅ 解决方案

### 步骤 1: 在 Dify 创建 Workflow 应用

1. 登录 [Dify 控制台](https://cloud.dify.ai/)
2. 点击 **"创建应用"**
3. **重要**: 选择 **"Workflow"** 类型（不是 Chat 或 Completion）
4. 配置工作流：
   - 添加 **开始节点**（接收 inputs）
   - 添加 **LLM 节点**（处理诊断任务）
   - 添加 **结束节点**（返回结果）
5. 发布应用

### 步骤 2: 获取 API Key

1. 登录 [Dify 控制台](https://cloud.dify.ai/)
2. 选择你的 **Workflow** 应用
3. 进入 **API Access** 页面
4. 复制 **API Key**（格式类似：`app-xxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 3: 配置环境变量

#### 方法 A: 更新 .env.local 文件（推荐）

在项目根目录的 `.env.local` 文件中添加：

```bash
# Dify API 配置
DIFY_API_KEY="app-xxxxxxxxxxxxxxxxxxxxxx"
DIFY_API_BASE_URL="https://api.dify.ai/v1"
```

**注意事项**:
- 将 `app-xxxxxxxxxxxxxxxxxxxxxx` 替换为你的真实 API Key
- API Key **不要**添加 `NEXT_PUBLIC_` 前缀
- 保持引号，确保没有多余的空格
- `.env.local` 文件已在 `.gitignore` 中，不会被提交到 Git

#### 方法 B: 使用 .env 文件

如果项目没有 `.env.local`，可以创建或使用 `.env` 文件：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，添加你的 Dify API Key。

### 步骤 4: 验证配置

**重要**: Next.js 只在启动时读取环境变量，修改后必须重启服务器。

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### 步骤 4: 验证配置

1. 打开浏览器控制台（F12）
2. 访问 GEO 诊断页面
3. 选择一个产品
4. 点击"开始诊断"

**成功标志**:
- ✅ 开始流式输出诊断结果
- ✅ 控制台没有 "DIFY_API_KEY is not configured" 错误

---

## 🔐 安全最佳实践

### 1. 环境变量命名规则

| 变量类型 | 前缀 | 可见范围 | 适用场景 |
|---------|------|---------|---------|
| 服务器端 | 无 | 仅服务器 | API Key、数据库密码 |
| 客户端 | `NEXT_PUBLIC_` | 客户端+服务器 | 公开配置（如 API URL） |

**Dify API Key 使用场景**:
```typescript
// ❌ 错误 - 客户端暴露 API Key
const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;

// ✅ 正确 - 仅在服务器端使用
// 文件: src/app/api/dify/route.ts
const apiKey = process.env.DIFY_API_KEY;
```

### 2. .env 文件安全

```bash
# .gitignore 应包含
.env
.env*.local

# ✅ 提交到 Git
.env.example         # 配置模板（不含真实密钥）

# ❌ 不要提交
.env                 # 包含真实配置
.env.local           # 本地环境配置
.env.production      # 生产环境配置
```

### 3. API Key 保护

- ✅ 只在服务器端 API 路由中使用
- ✅ 通过 API 路由代理 Dify 请求
- ✅ 使用环境变量存储
- ❌ 不要硬编码在代码中
- ❌ 不要在客户端 JavaScript 中暴露
- ❌ 不要提交到 Git 仓库

---

## 🧪 故障排除

### 问题 1: 重启服务器后仍然报错

**检查清单**:
```bash
# 1. 确认环境变量文件存在
ls -la .env.local

# 2. 检查环境变量内容（确保没有语法错误）
cat .env.local | grep DIFY

# 3. 确认变量名正确（没有 NEXT_PUBLIC_ 前缀）
grep "^DIFY_API_KEY=" .env.local

# 4. 检查是否有多余的空格或引号
# 正确格式：
DIFY_API_KEY="app-xxx"

# 错误格式：
DIFY_API_KEY = "app-xxx"     # ❌ 等号前后有空格
DIFY_API_KEY="app-xxx "      # ❌ 引号内有多余空格
```

### 问题 2: API Key 格式错误

Dify API Key 的正确格式：
```
app-xxxxxxxxxxxxxxxxxxxxxx
```

**特征**:
- 以 `app-` 开头
- 后跟 20-30 位随机字符
- 全小写（可能包含数字）

**获取位置**:
```
Dify 控制台
  → 选择应用
  → 左侧菜单 "API Access"
  → 复制 "API Key"
```

### 问题 3: 环境变量未生效

**原因**: Next.js 在服务器启动时读取环境变量，修改后需要重启。

**解决**:
```bash
# 完全停止服务器
# 按 Ctrl+C 或关闭终端

# 清除 Next.js 缓存（可选）
rm -rf .next

# 重新启动
npm run dev
```

### 问题 4: 生产环境配置

如果在生产环境（Vercel、Docker等）部署，需要在平台配置环境变量：

**Vercel**:
```
Project Settings
  → Environment Variables
  → Add Variable
    Name: DIFY_API_KEY
    Value: app-xxxxxxxxxxxxxxxxxxxxxx
```

**Docker**:
```dockerfile
# docker-compose.yml
environment:
  - DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxx
  - DIFY_API_BASE_URL=https://api.dify.ai/v1
```

---

## 📝 完整配置示例

### .env.local 文件
```bash
# ==================== 数据库配置 ====================
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# ==================== 认证配置 ====================
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# ==================== Dify API 配置 ====================
# 🔑 Dify API Key (从控制台获取)
DIFY_API_KEY="app-xxxxxxxxxxxxxxxxxxxxxx"

# 🌐 Dify API 基础 URL (可选，默认使用官方服务)
DIFY_API_BASE_URL="https://api.dify.ai/v1"

# ==================== 其他配置 ====================
NODE_ENV="development"
```

### 代码中的使用方式

**API 路由 (服务器端)** - ✅ 正确
```typescript
// src/app/api/dify/route.ts
const DIFY_API_KEY = process.env.DIFY_API_KEY;

if (!DIFY_API_KEY) {
  return new Response(
    JSON.stringify({ error: "DIFY_API_KEY is not configured" }),
    { status: 500 }
  );
}

// 使用 API Key 调用 Dify
const response = await fetch(`${DIFY_API_BASE_URL}/chat-messages`, {
  headers: {
    Authorization: `Bearer ${DIFY_API_KEY}`,
  },
});
```

**客户端代码** - ✅ 正确
```typescript
// src/app/geo-diagnosis/page.tsx
// 通过 API 路由间接调用，不直接使用 API Key
const response = await fetch("/api/dify", {
  method: "POST",
  body: JSON.stringify({
    task_type: "diagnosis_rank",
    query: "...",
  }),
});
```

---

## ✅ 验证清单

配置完成后，检查以下项目：

- [ ] `.env.local` 文件包含 `DIFY_API_KEY`
- [ ] API Key 格式正确（`app-xxxxxx`）
- [ ] 没有 `NEXT_PUBLIC_` 前缀
- [ ] 开发服务器已重启（`npm run dev`）
- [ ] 浏览器控制台无错误
- [ ] 诊断功能正常工作

---

## 🎯 快速修复命令

如果遇到问题，尝试以下命令：

```bash
# 1. 创建 .env.local（如果不存在）
touch .env.local

# 2. 添加 Dify API Key（替换为你的真实 Key）
echo 'DIFY_API_KEY="app-xxxxxxxxxxxxxxxxxxxxxx"' >> .env.local
echo 'DIFY_API_BASE_URL="https://api.dify.ai/v1"' >> .env.local

# 3. 检查配置
cat .env.local | grep DIFY

# 4. 清除缓存并重启
rm -rf .next
npm run dev
```

---

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Dify API 文档](https://docs.dify.ai/guides/application-publishing/launch-your-webapp-quickly/conversation-application)
- [环境变量安全最佳实践](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#environment-variable-security)

---

## 🆘 仍然无法解决？

如果按照以上步骤仍然遇到问题，请检查：

1. **Dify 服务状态**: 访问 https://status.dify.ai/ 查看服务是否正常
2. **API Key 权限**: 确认 API Key 有足够的调用权限
3. **网络连接**: 确认可以访问 `api.dify.ai`
4. **浏览器控制台**: 查看详细错误信息
5. **服务器日志**: 查看终端输出的错误日志

**调试技巧**:
```typescript
// 在 src/app/api/dify/route.ts 的第 20 行后添加
console.log("DIFY_API_KEY:", DIFY_API_KEY ? "已配置" : "未配置");
console.log("DIFY_API_BASE_URL:", DIFY_API_BASE_URL);
```

重启服务器后，检查终端输出：
```bash
DIFY_API_KEY: 已配置
DIFY_API_BASE_URL: https://api.dify.ai/v1
```

---

*配置指南 - GEO Nexus Platform*
*最后更新: 2026-01-28*

✅ **配置完成后，即可使用 GEO 诊断、内容生成等 AI 功能！**
