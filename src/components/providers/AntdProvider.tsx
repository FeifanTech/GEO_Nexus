'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { antdTheme } from '@/lib/antd-theme';

/**
 * Ant Design Provider
 * 集成 Ant Design 与 Next.js App Router，应用自定义主题
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
