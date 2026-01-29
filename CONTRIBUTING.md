# 📝 开发贡献指南

欢迎为 GEO Nexus 项目贡献代码！本指南将帮助您快速上手项目开发。

---

## 🚀 快速开始

### 1. 环境准备

**必需工具**:
- Node.js 18+
- pnpm / npm / yarn
- Git
- VS Code（推荐）

**安装依赖**:
```bash
# 克隆仓库
git clone <repository-url>
cd GEO_Nexus

# 安装依赖
npm install

# 初始化 Git hooks
npm run prepare

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填写必要的配置
```

### 2. 启动开发服务器

```bash
# 开发模式
npm run dev

# 访问 http://localhost:3000
```

---

## 🌿 Git 工作流

### 分支策略

```
main (生产分支)
  ├── feat/*     (新功能)
  ├── fix/*      (修复)
  ├── docs/*     (文档)
  ├── refactor/* (重构)
  └── chore/*    (工具/配置)
```

### 开发流程

#### 1. 创建功能分支
```bash
# 从 main 分支创建新分支
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

#### 2. 开发和提交
```bash
# 开发过程中，定期提交代码
git add .
git commit -m "feat(scope): 描述你的改动"

# 提交信息会自动触发检查：
# - 代码格式化（Prettier）
# - 代码检查（ESLint）
# - 提交信息格式检查（Commitlint）
```

#### 3. 合并到 main 分支
```bash
# 切换到 main 分支
git checkout main

# 合并功能分支（使用 --no-ff 保留分支历史）
git merge feat/your-feature-name --no-ff

# 推送到远程
git push origin main
```

#### 4. 删除功能分支（可选）
```bash
git branch -d feat/your-feature-name
```

---

## 📏 代码规范

### TypeScript 规范

**类型定义**:
```typescript
// ✅ 好的实践
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}

// ❌ 避免
function getUser(id: any): any {
  // ...
}
```

**路径别名**:
```typescript
// ✅ 使用路径别名
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/useProductStore";

// ❌ 避免相对路径
import { Button } from "../../../components/ui/button";
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `ProductList`, `DiagnosisPanel` |
| 函数 | camelCase | `fetchProducts`, `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| 接口 | PascalCase | `ProductData`, `ApiResponse` |
| 文件名（组件） | PascalCase | `ProductCard.tsx` |
| 文件名（工具） | camelCase | `utils.ts`, `formatDate.ts` |

---

## 💬 提交信息规范

遵循 **Conventional Commits** 规范。

### 格式
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type 类型
| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(diagnosis): 添加 GEO 排名检查` |
| `fix` | 修复 | `fix(api): 修复证书错误` |
| `docs` | 文档 | `docs(readme): 更新安装说明` |
| `style` | 格式 | `style: 格式化代码` |
| `refactor` | 重构 | `refactor(auth): 简化登录逻辑` |
| `perf` | 性能 | `perf(list): 优化渲染性能` |
| `test` | 测试 | `test(api): 添加单元测试` |
| `chore` | 工具 | `chore: 更新依赖` |

### 完整示例
```bash
git commit -m "feat(diagnosis): 添加 GEO 排名诊断功能

实现了以下功能：
- Dify API 集成
- 流式响应处理
- 错误处理机制

Closes #123"
```

---

## 🎨 代码格式化

项目使用 **Prettier** 进行代码格式化。

### 自动格式化
- **提交时**: Git hooks 会自动格式化代码
- **VS Code**: 保存时自动格式化（需安装 Prettier 扩展）

### 手动格式化
```bash
# 格式化所有文件
npm run format

# 检查格式
npm run format:check
```

---

## 🧪 代码检查

### ESLint

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复问题
npm run lint:fix
```

### TypeScript

```bash
# 类型检查
npm run type-check
```

---

## 📁 项目结构

```
src/
├── app/                  # Next.js App Router 页面
│   ├── api/             # API 路由
│   ├── product-manager/ # 产品管理
│   ├── competitors/     # 竞品管理
│   ├── geo-diagnosis/   # GEO 诊断
│   ├── ai-monitor/      # AI 监测
│   ├── query-library/   # 问题库
│   ├── content-factory/ # 内容工厂
│   ├── workflow/        # 作业流
│   ├── report/          # 监测报告
│   └── settings/        # 系统设置
│
├── components/          # React 组件
│   ├── ui/             # shadcn/ui 组件
│   └── ...             # 业务组件
│
├── hooks/               # 自定义 Hooks
│   ├── useProducts.ts
│   └── ...
│
├── lib/                 # 工具函数
│   ├── utils.ts
│   ├── dify-client.ts
│   └── ...
│
├── store/               # Zustand 状态管理
│   ├── useProductStore.ts
│   ├── useSettingsStore.ts
│   └── ...
│
├── types/               # TypeScript 类型定义
│   ├── product.ts
│   └── ...
│
└── generated/           # 自动生成的代码
    └── prisma/         # Prisma Client
```

---

## 🗄️ 数据库

### Prisma 工作流

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库（开发环境）
npm run db:push

# 运行数据库迁移（生产环境）
npm run db:migrate

# 打开 Prisma Studio（数据库 GUI）
npm run db:studio

# 运行数据种子
npm run db:seed
```

### Schema 修改流程

1. 修改 `prisma/schema.prisma`
2. 运行 `npm run db:push`（开发）或 `npm run db:migrate`（生产）
3. 运行 `npm run db:generate` 生成新的 Prisma Client

---

## 🛠️ VS Code 配置

### 推荐扩展

项目已配置推荐扩展（`.vscode/extensions.json`）:
- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **TypeScript** - 类型检查
- **Prisma** - Prisma Schema 支持
- **Tailwind CSS IntelliSense** - Tailwind 智能提示

### 工作区设置

项目已配置工作区设置（`.vscode/settings.json`）:
- 保存时自动格式化
- ESLint 自动修复
- TypeScript 路径别名支持

---

## ✅ 预提交检查清单

在提交代码前，确保：

- [ ] 代码已格式化（Prettier）
- [ ] ESLint 无错误
- [ ] TypeScript 类型检查通过
- [ ] 提交信息遵循 Conventional Commits
- [ ] 使用了功能分支（而非直接提交 main）
- [ ] 合并时使用了 `--no-ff`

**提示**: Git hooks 会自动检查大部分项目！

---

## 🔍 常见问题

### Q: Husky 钩子未生效？
```bash
# 重新初始化 Husky
rm -rf .husky
npm run prepare
```

### Q: Prettier 和 ESLint 冲突？
项目已配置 `eslint-config-prettier` 避免冲突。如果仍有问题：
```bash
npm run lint:fix
npm run format
```

### Q: 类型检查失败？
```bash
# 检查 TypeScript 配置
cat tsconfig.json

# 生成 Prisma Client
npm run db:generate

# 重启 TypeScript 服务器（VS Code）
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Q: 提交信息被拒绝？
确保提交信息格式正确：
```bash
# ✅ 正确
git commit -m "feat(api): add new endpoint"
git commit -m "fix: resolve authentication bug"

# ❌ 错误
git commit -m "updated files"
git commit -m "fix bug"
```

---

## 📚 相关文档

- [README.md](./README.md) - 项目文档
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构文档
- [.ai-development-rules.md](./.ai-development-rules.md) - AI 开发规范
- [DIFY_CONFIGURATION_GUIDE.md](./DIFY_CONFIGURATION_GUIDE.md) - Dify 配置指南

---

## 🆘 需要帮助？

- **文档**: 查看项目文档了解详细信息
- **Issue**: 在 GitHub 上创建 Issue
- **讨论**: 参与 GitHub Discussions

---

## 🎯 开发最佳实践

1. **小步提交**: 频繁提交，每次提交只包含一个逻辑变更
2. **清晰的提交信息**: 让其他人能快速理解你的改动
3. **代码复用**: 提取公共逻辑为可复用的函数/组件
4. **类型安全**: 充分利用 TypeScript 的类型系统
5. **保持简单**: 避免过度设计和过早优化

---

*开发贡献指南 - GEO Nexus Platform*
*最后更新: 2026-01-29*

🎉 **感谢您为项目做出贡献！**
