'use client';

import React from 'react';
import { Button as AntdButton, Card as AntdCard, Space, Table, Tag } from 'antd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Ant Design 和 shadcn/ui 混合使用示例
 * 展示两个 UI 库如何在同一项目中协同工作
 */
export function AntdExample() {
  const dataSource = [
    {
      key: '1',
      name: '产品 A',
      category: 'Electronics',
      status: 'active',
    },
    {
      key: '2',
      name: '产品 B',
      category: 'Clothing',
      status: 'inactive',
    },
  ];

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '激活' : '未激活'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* shadcn/ui Card */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">shadcn/ui 组件</h3>
        <div className="flex gap-2">
          <Button>默认按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
        </div>
      </Card>

      {/* Ant Design Card */}
      <AntdCard title="Ant Design 组件">
        <Space>
          <AntdButton type="primary">主要按钮</AntdButton>
          <AntdButton>默认按钮</AntdButton>
          <AntdButton type="dashed">虚线按钮</AntdButton>
        </Space>
      </AntdCard>

      {/* Ant Design Table */}
      <AntdCard title="Ant Design 表格示例">
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </AntdCard>
    </div>
  );
}
