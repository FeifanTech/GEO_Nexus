# Ant Design 集成指南

> 版本: 1.0
> 最后更新: 2026-01-27

---

## 📋 概述

本项目采用 **Next.js + React + Ant Design + shadcn/ui** 的混合架构，同时使用两个 UI 库以发挥各自的优势：

- **Ant Design**: 提供企业级复杂组件（表格、表单、数据展示）
- **shadcn/ui**: 提供现代化基础组件（按钮、卡片、对话框）

---

## 🎯 架构设计

### UI 库分工

| 组件类型 | 推荐使用 | 原因 |
|---------|---------|------|
| **数据表格** | Ant Design Table | 功能强大，排序、筛选、分页开箱即用 |
| **复杂表单** | Ant Design Form | 完善的表单验证和布局系统 |
| **日期选择器** | Ant Design DatePicker | 功能完整，本地化支持好 |
| **树形控件** | Ant Design Tree | 企业级数据展示 |
| **上传组件** | Ant Design Upload | 功能全面，支持多种上传模式 |
| **基础按钮** | shadcn/ui Button | 轻量级，与 Tailwind 集成好 |
| **对话框** | shadcn/ui Dialog | 简洁易用 |
| **卡片** | shadcn/ui Card | 灵活的布局组件 |
| **Toast 通知** | shadcn/ui Toast | 现代化设计 |

---

## 🔧 技术配置

### 安装的依赖

```json
{
  "dependencies": {
    "antd": "^5.x",
    "@ant-design/nextjs-registry": "^1.x"
  }
}
```

### 主题配置

主题配置文件位于 [src/lib/antd-theme.ts](src/lib/antd-theme.ts)

**设计原则：**
- 主色调使用 Slate 灰色系（`#475569`），与项目整体风格一致
- 圆角统一为 8px（按钮、输入框）和 12px（卡片、模态框）
- 字体使用 Geist Sans，与项目统一

**主题配置代码：**

```typescript
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#475569',    // slate-600
    colorSuccess: '#10b981',    // green-500
    colorWarning: '#f59e0b',    // amber-500
    colorError: '#ef4444',      // red-500
    borderRadius: 8,
    fontFamily: 'var(--font-geist-sans), sans-serif',
  },
  components: {
    Button: { controlHeight: 40 },
    Input: { controlHeight: 40 },
    Card: { borderRadiusLG: 12 },
  },
};
```

### Provider 配置

Ant Design 通过自定义 Provider 集成到应用中：

**文件位置：** [src/components/providers/AntdProvider.tsx](src/components/providers/AntdProvider.tsx)

**在 layout.tsx 中的使用：**

```tsx
import { AntdProvider } from "@/components/providers/AntdProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AntdProvider>
          {/* 其他 Providers */}
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
```

---

## 📚 使用示例

### 混合使用两个 UI 库

```tsx
'use client';

import { Button as AntdButton, Table, Card as AntdCard } from 'antd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <div className="space-y-4">
      {/* shadcn/ui 卡片 + Ant Design 表格 */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">数据列表</h3>
        <Table
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 按钮组合 */}
      <div className="flex gap-2">
        <Button>shadcn 按钮</Button>
        <AntdButton type="primary">Ant Design 按钮</AntdButton>
      </div>
    </div>
  );
}
```

### Ant Design 表格示例

```tsx
import { Table, Tag } from 'antd';

const columns = [
  {
    title: '产品名称',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status}
      </Tag>
    ),
    filters: [
      { text: '激活', value: 'active' },
      { text: '未激活', value: 'inactive' },
    ],
    onFilter: (value, record) => record.status === value,
  },
];

export function ProductTable({ data }) {
  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 20 }}
      rowKey="id"
    />
  );
}
```

### Ant Design 表单示例

```tsx
import { Form, Input, Button, Select } from 'antd';

export function ProductForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('提交的值：', values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="产品名称"
        rules={[{ required: true, message: '请输入产品名称' }]}
      >
        <Input placeholder="请输入产品名称" />
      </Form.Item>

      <Form.Item
        name="category"
        label="产品类别"
        rules={[{ required: true, message: '请选择产品类别' }]}
      >
        <Select placeholder="请选择类别">
          <Select.Option value="electronics">电子产品</Select.Option>
          <Select.Option value="clothing">服装</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
}
```

---

## 🎨 样式协调

### CSS 优先级

1. **Tailwind CSS**: 用于布局、间距、响应式
2. **Ant Design**: 用于组件内部样式
3. **自定义 CSS**: 覆盖或扩展

### 避免样式冲突

```tsx
// ✅ 推荐：将 Tailwind 用于容器，Ant Design 用于组件
<div className="p-4 bg-slate-50 rounded-lg">
  <Table dataSource={data} columns={columns} />
</div>

// ❌ 避免：不要在 Ant Design 组件上使用会冲突的 Tailwind 类
<Table className="border rounded" /> // 可能造成样式冲突
```

### 响应式设计

```tsx
import { Row, Col } from 'antd';

export function ResponsiveLayout() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} lg={6}>
        {/* 响应式栅格 */}
      </Col>
    </Row>
  );
}
```

---

## 📂 项目结构

```
src/
├── app/
│   └── layout.tsx                    # Ant Design Provider 集成
├── components/
│   ├── providers/
│   │   └── AntdProvider.tsx          # Ant Design 自定义 Provider
│   ├── examples/
│   │   └── AntdExample.tsx           # 混合使用示例
│   └── ui/                           # shadcn/ui 组件
├── lib/
│   └── antd-theme.ts                 # Ant Design 主题配置
```

---

## 🚀 最佳实践

### 1. 组件选择原则

- **数据密集型页面**：优先使用 Ant Design（Table, Form, DatePicker）
- **简单交互页面**：优先使用 shadcn/ui（Button, Card, Dialog）
- **混合场景**：两者结合使用

### 2. 性能优化

```tsx
// ✅ 按需导入
import { Table, Button } from 'antd';

// ❌ 避免全量导入
import * as antd from 'antd';
```

### 3. 类型安全

```tsx
import type { TableProps } from 'antd';

interface DataType {
  key: string;
  name: string;
  age: number;
}

const MyTable: React.FC<TableProps<DataType>> = (props) => {
  return <Table<DataType> {...props} />;
};
```

### 4. 国际化

```tsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider locale={zhCN}>
  {children}
</ConfigProvider>
```

---

## 🔍 常见问题

### Q1: Ant Design 样式没有生效？

**A**: 确保 `AntdProvider` 正确包裹了应用，并且 `@ant-design/nextjs-registry` 已安装。

### Q2: 如何自定义 Ant Design 组件样式？

**A**: 使用 `className` 和 Tailwind 或修改 [antd-theme.ts](src/lib/antd-theme.ts)：

```tsx
// 方式 1: Tailwind
<Button className="!bg-blue-500 !text-white">自定义按钮</Button>

// 方式 2: 主题配置
// 在 antd-theme.ts 中修改 token
```

### Q3: Ant Design 和 shadcn/ui 的组件名冲突怎么办？

**A**: 使用别名导入：

```tsx
import { Button as AntdButton } from 'antd';
import { Button } from '@/components/ui/button';
```

### Q4: 如何在服务端组件中使用 Ant Design？

**A**: 大多数 Ant Design 组件需要客户端渲染，使用 `'use client'` 指令：

```tsx
'use client';

import { Table } from 'antd';

export function MyTable() {
  return <Table />;
}
```

---

## 📊 组件对比

| 功能 | Ant Design | shadcn/ui | 推荐使用 |
|------|-----------|-----------|---------|
| 数据表格 | ✅ Table (强大) | ❌ 无 | Ant Design |
| 表单 | ✅ Form (完善) | ⚠️ 基础 | Ant Design |
| 按钮 | ✅ Button | ✅ Button | shadcn/ui (更轻量) |
| 对话框 | ✅ Modal | ✅ Dialog | shadcn/ui (更现代) |
| 通知 | ✅ Message/Notification | ✅ Toast | shadcn/ui |
| 卡片 | ✅ Card | ✅ Card | shadcn/ui |
| 日期选择 | ✅ DatePicker (强大) | ❌ 无 | Ant Design |
| 树形控件 | ✅ Tree | ❌ 无 | Ant Design |

---

## 🔗 参考资料

- [Ant Design 官方文档](https://ant.design/components/overview-cn/)
- [Ant Design with Next.js](https://ant.design/docs/react/use-with-next)
- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [项目架构文档](./ARCHITECTURE.md)

---

*文档维护: GEO Nexus 开发团队*
*最后更新: 2026-01-27*
