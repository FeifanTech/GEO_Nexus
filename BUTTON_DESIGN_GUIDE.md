# 按钮设计规范

> 版本: 1.0
> 最后更新: 2026-01-27

---

## 📋 目的

统一 GEO Nexus 平台中所有按钮的设计和使用规范，确保：
- 一致的用户体验
- 符合 WCAG AA 无障碍标准
- 易于维护和扩展

---

## 🎨 设计原则

### 1. 颜色对比度
- **文字与背景对比度必须 ≥ 4.5:1** (WCAG AA 标准)
- hover 状态必须有明显的视觉反馈
- disabled 状态必须清晰可辨

### 2. 样式一致性
- 优先使用 `variant` 定义样式
- 避免在 `className` 中覆盖 variant 已定义的颜色
- 仅使用 `className` 添加间距、尺寸等工具类

### 3. 交互反馈
- 所有可点击元素必须有 hover 状态
- hover 状态的背景色必须比默认状态更深或更浅
- 添加 `cursor-pointer` 类确保鼠标样式正确

---

## 🔧 Variant 使用指南

### Primary Button (默认)

**用途：** 主要操作按钮（如"创建"、"提交"）

```tsx
<Button variant="default" className="gap-2">
  创建任务
</Button>
```

**样式特征：**
- 背景：`bg-blue-600`
- 文字：`text-white`
- Hover：`hover:bg-blue-700`
- 对比度：5.2:1 ✓

---

### Outline Button

**用途：** 次要操作按钮（如"取消"、"查看详情"）

```tsx
<Button variant="outline" className="gap-2">
  取消
</Button>
```

**样式特征：**
- 背景：`bg-transparent`
- 边框：`border border-slate-300`
- 文字：`text-slate-900`
- Hover：`hover:bg-slate-100`

---

### Ghost Button

**用途：** 轻量级操作（如图标按钮、内联链接）

```tsx
<Button variant="ghost" size="sm">
  <Edit className="h-4 w-4" />
</Button>
```

**样式特征：**
- 背景：`bg-transparent`
- 边框：无
- 文字：`text-slate-700`
- Hover：`hover:bg-slate-100`

---

### Destructive Button

**用途：** 危险操作（如"删除"、"移除"）

```tsx
<Button variant="destructive" className="gap-2">
  删除产品
</Button>
```

**样式特征：**
- 背景：`bg-red-600`
- 文字：`text-white`
- Hover：`hover:bg-red-700`

---

## ❌ 常见错误

### 错误 1: hover 状态无变化

```tsx
<!-- ❌ 错误：hover 背景与默认相同 -->
<Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
  标签
</Badge>

<!-- ✅ 正确：hover 背景更深 -->
<Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
  标签
</Badge>
```

---

### 错误 2: className 覆盖 variant

```tsx
<!-- ❌ 错误：自定义 className 覆盖 variant 样式 -->
<Button
  variant="outline"
  className="bg-white border-slate-300 hover:bg-slate-100"
>
  按钮
</Button>

<!-- ✅ 正确：仅添加工具类 -->
<Button variant="outline" className="gap-2">
  按钮
</Button>

<!-- ✅ 正确：完全自定义则不使用 variant -->
<Button className="bg-white border-2 border-slate-300 hover:bg-slate-100 hover:text-slate-900">
  按钮
</Button>
```

---

### 错误 3: 白色文字 + 浅色背景

```tsx
<!-- ❌ 错误：对比度不足 -->
<Button className="bg-slate-50 text-white hover:bg-slate-100">
  按钮
</Button>

<!-- ✅ 正确：深色背景 + 白色文字 -->
<Button className="bg-slate-600 text-white hover:bg-slate-700">
  按钮
</Button>

<!-- ✅ 正确：浅色背景 + 深色文字 -->
<Button className="bg-slate-50 text-slate-900 hover:bg-slate-100">
  按钮
</Button>
```

---

## 📐 尺寸规范

### Size Variants

```tsx
// 小尺寸 (32px)
<Button size="sm">小按钮</Button>

// 默认尺寸 (40px)
<Button>默认按钮</Button>

// 大尺寸 (48px)
<Button size="lg">大按钮</Button>

// Icon 按钮
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

---

## 🎯 使用场景

### 1. 表单提交

```tsx
<DialogFooter className="gap-2">
  <Button variant="outline" onClick={onCancel}>
    取消
  </Button>
  <Button onClick={onSubmit} className="gap-2">
    <Check className="h-4 w-4" />
    确认
  </Button>
</DialogFooter>
```

---

### 2. 批量操作

```tsx
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" onClick={onSelectAll}>
    全选
  </Button>
  <Button variant="outline" size="sm" onClick={onDelete}>
    批量删除
  </Button>
</div>
```

---

### 3. 卡片操作

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>产品名称</CardTitle>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon">
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
</Card>
```

---

### 4. 链接式按钮

```tsx
<Button variant="ghost" asChild>
  <Link href="/products" className="gap-2">
    查看全部
    <ArrowRight className="h-4 w-4" />
  </Link>
</Button>
```

---

## 🔍 颜色对比度检查

### 推荐的颜色组合

| 背景色 | 文字颜色 | 对比度 | 状态 |
|--------|---------|-------|------|
| `blue-600` | `white` | 5.2:1 | ✓ PASS |
| `slate-50` | `slate-900` | 16.1:1 | ✓ PASS |
| `slate-100` | `slate-900` | 14.2:1 | ✓ PASS |
| `emerald-50` | `emerald-700` | 5.1:1 | ✓ PASS |
| `red-600` | `white` | 5.4:1 | ✓ PASS |

### 不推荐的颜色组合

| 背景色 | 文字颜色 | 对比度 | 状态 |
|--------|---------|-------|------|
| `slate-50` | `white` | 1.1:1 | ✗ FAIL |
| `blue-100` | `blue-300` | 1.8:1 | ✗ FAIL |
| `slate-200` | `slate-300` | 1.2:1 | ✗ FAIL |

---

## 🚀 迁移指南

### 步骤 1: 审查现有按钮
```bash
# 搜索所有 Button 组件
grep -r "<Button" src/app/
```

### 步骤 2: 检查 hover 状态
- 确保 `hover:bg-*` 与 `bg-*` 不同
- 确保 hover 状态的对比度 ≥ 4.5:1

### 步骤 3: 规范化样式
- 移除 className 中与 variant 冲突的样式
- 仅保留间距、尺寸等工具类

### 步骤 4: 测试验证
- 视觉检查所有按钮的 hover 状态
- 使用颜色对比度工具验证

---

## 📚 参考工具

### 颜色对比度检查
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

### Tailwind 颜色参考
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

---

## 📝 更新日志

### v1.0 (2026-01-27)
- ✅ 初始版本创建
- ✅ 定义 variant 使用规范
- ✅ 添加颜色对比度标准
- ✅ 提供常见错误示例

---

*文档维护: GEO Nexus 开发团队*
*最后更新: 2026-01-27*
