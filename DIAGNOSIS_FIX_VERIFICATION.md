# ✅ 诊断功能修复验证指南

> 三个关键问题已修复，请按以下步骤验证功能是否正常工作

---

## 🔧 已修复的问题

### 1. ✅ API Key 配置问题
**问题**: 设置页面配置了 API Key，但诊断时仍提示未配置

**修复**:
- API 路由现在支持从请求体读取 API Key
- 优先级：请求参数 > 环境变量
- 前端页面会自动传递设置中的 API Key

**修改文件**:
- [src/app/api/dify/route.ts:63](src/app/api/dify/route.ts#L63) - 接收请求中的 API Key
- [src/lib/dify-client.ts:86-88](src/lib/dify-client.ts#L86-L88) - 添加 API Key 参数
- [src/app/geo-diagnosis/page.tsx](src/app/geo-diagnosis/page.tsx) - 传递设置中的 API Key

### 2. ✅ SSL 证书错误
**问题**: `unable to get local issuer certificate`

**修复**:
- 开发环境下禁用 SSL 证书验证
- 代码: [route.ts:23-25](src/app/api/dify/route.ts#L23-L25)

```typescript
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
```

### 3. ✅ 应用类型不匹配
**问题**: `not_chat_app - Please check if your app mode matches`

**修复**:
- 切换到 Workflow 模式
- 使用 `/workflows/run` 端点（而不是 `/chat-messages`）
- query 参数放入 inputs 中

**修改位置**:
- [route.ts:37](src/app/api/dify/route.ts#L37) - 默认返回 "workflow"
- [route.ts:41](src/app/api/dify/route.ts#L41) - Workflow 端点
- [route.ts:103-108](src/app/api/dify/route.ts#L103-L108) - Workflow 请求体构建

---

## 🧪 验证步骤

### 前置条件

1. **确认 Dify 应用类型**

   登录 [Dify 控制台](https://cloud.dify.ai/)，检查你的应用：

   - ✅ **应用类型**: 必须是 **Workflow**（工作流）
   - ❌ **不能是**: Chat（对话）或 Completion（文本生成）

   如果不是 Workflow 类型，需要：
   - 创建新的 Workflow 应用
   - 或联系管理员确认应用类型

2. **确认 API Key 有效**

   - API Key 格式: `app-xxxxxxxxxxxxxxxxxxxxxx`
   - 从 Dify 控制台 → 应用 → API Access 页面获取

3. **确认配置已保存**

   - 打开设置页面 (`/settings`)
   - 检查 "Dify API Key" 字段是否已填写
   - 点击"保存设置"按钮

### 测试流程

#### 步骤 1: 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

> **为什么要重启？**
> - SSL 证书设置在服务器启动时生效
> - 环境变量更改需要重启

#### 步骤 2: 打开浏览器控制台

1. 打开浏览器（推荐 Chrome）
2. 按 `F12` 打开开发者工具
3. 切换到 **Console（控制台）** 标签
4. 清空之前的日志（可选）

#### 步骤 3: 访问诊断页面

1. 访问 `http://localhost:3000/geo-diagnosis`
2. 选择一个产品（例如：iPhone 15 Pro）

#### 步骤 4: 开始诊断

1. 点击 **"开始诊断"** 按钮
2. 观察控制台输出

#### 步骤 5: 查看结果

**成功标志** ✅:
```
[Dify API] Task: diagnosis_rank, Type: workflow, Endpoint: /workflows/run
POST /api/dify 200 in xxxms
```

控制台应该看到：
- 流式输出诊断结果
- 没有错误信息
- 状态码 200

**失败标志** ❌:

如果仍然出现错误，记录以下信息：

1. **控制台错误信息**（完整的红色错误）
2. **网络请求详情**:
   - 打开 Network 标签
   - 找到 `/api/dify` 请求
   - 查看 Request Headers 和 Response

---

## 🔍 故障排除

### 问题 A: 仍提示 "DIFY_API_KEY is not configured"

**可能原因**:
1. 设置未保存到 LocalStorage
2. 页面未刷新

**解决方法**:
```bash
# 1. 打开浏览器控制台，运行：
localStorage.getItem('geo-nexus-settings')

# 2. 检查输出中是否包含 difyApiKey
# 3. 如果没有，重新在设置页面配置并保存
# 4. 硬刷新页面（Ctrl+Shift+R / Cmd+Shift+R）
```

### 问题 B: 401 Unauthorized

**可能原因**: API Key 无效或过期

**解决方法**:
1. 登录 Dify 控制台
2. 重新生成 API Key
3. 在设置页面更新
4. 保存并刷新

### 问题 C: 404 Not Found

**可能原因**: Workflow 应用不存在或已删除

**解决方法**:
1. 确认 Dify 控制台中应用存在
2. 确认应用类型为 Workflow
3. 确认应用已发布（Published）

### 问题 D: 网络错误（fetch failed）

**可能原因**: 无法连接到 Dify 服务

**解决方法**:
1. 检查网络连接
2. 访问 https://api.dify.ai/ 确认可访问
3. 检查防火墙/代理设置
4. 查看 Dify 服务状态: https://status.dify.ai/

### 问题 E: 仍然报 "not_chat_app"

**可能原因**: Dify 应用不是 Workflow 类型

**解决方法**:
1. **确认应用类型**:
   ```
   Dify 控制台 → 我的应用 → 查看应用卡片
   应用类型应显示为 "Workflow" 或 "工作流"
   ```

2. **创建 Workflow 应用**:
   - 点击 "创建应用"
   - 选择 "Workflow"（不是 Chat 或 Completion）
   - 配置工作流节点：
     - 开始节点（接收 inputs）
     - LLM 节点（处理任务）
     - 结束节点（返回结果）
   - 发布应用

3. **更新 API Key**:
   - 获取新 Workflow 应用的 API Key
   - 在设置页面更新

---

## 📊 预期行为

### 正常流程

```
用户点击"开始诊断"
  ↓
前端检查设置中的 API Key
  ↓
发送 POST /api/dify 请求
  ↓
API 路由接收请求（优先使用请求中的 API Key）
  ↓
调用 Dify Workflow API
  ↓
流式返回诊断结果
  ↓
前端逐步显示诊断内容
  ↓
完成 ✅
```

### 请求示例

**前端发送**:
```json
{
  "task_type": "diagnosis_rank",
  "query": "请分析产品的 GEO 排名...",
  "user": "user-1737889123456",
  "inputs": {
    "product_name": "iPhone 15 Pro",
    "product_json": "{...}"
  },
  "response_mode": "streaming",
  "dify_api_key": "app-xxxxxxxxxxxx",
  "dify_base_url": "https://api.dify.ai/v1"
}
```

**发送到 Dify**:
```json
{
  "inputs": {
    "task_type": "diagnosis_rank",
    "query": "请分析产品的 GEO 排名...",
    "product_name": "iPhone 15 Pro",
    "product_json": "{...}"
  },
  "user": "user-1737889123456",
  "response_mode": "streaming"
}
```

**Dify 响应** (流式):
```
data: {"event":"workflow_started","task_id":"...","workflow_run_id":"..."}

data: {"event":"node_started","data":{"id":"llm","title":"LLM"}}

data: {"event":"message","answer":"根据提供的产品信息..."}

data: {"event":"message","answer":"分析 GEO 排名..."}

data: {"event":"workflow_finished","data":{"status":"succeeded"}}
```

---

## 🎯 快速诊断命令

运行调试脚本（可选）:

```bash
npx tsx scripts/debug-diagnosis.ts
```

这个脚本会检查：
- ✅ Settings Store 配置
- ✅ 环境变量
- ✅ 常见问题清单

---

## 📝 验证清单

完成测试后，请确认：

- [ ] 开发服务器已重启
- [ ] Dify 应用类型为 Workflow
- [ ] API Key 在设置页面已配置
- [ ] 浏览器控制台已打开
- [ ] 点击"开始诊断"后有流式输出
- [ ] 没有错误信息
- [ ] POST /api/dify 返回 200

---

## ✅ 成功案例

**控制台输出**:
```
[Dify API] Task: diagnosis_rank, Type: workflow, Endpoint: /workflows/run
POST /api/dify 200 in 1234ms
```

**页面显示**:
- 诊断结果逐步流式输出
- 显示 GEO 排名分析、竞品对比、优化建议等内容

---

## 🆘 仍然无法解决？

如果按照以上步骤仍然遇到问题，请提供：

1. **完整错误信息**（控制台红色错误）
2. **网络请求详情**（Network 标签中 `/api/dify` 的详情）
3. **Dify 应用截图**（应用类型、配置）
4. **Settings 配置**（API Key 已脱敏）

---

*验证指南 - GEO Nexus Platform*
*生成时间: 2026-01-28*

**下一步**: 按照验证步骤测试诊断功能，确认所有问题已解决 🚀
