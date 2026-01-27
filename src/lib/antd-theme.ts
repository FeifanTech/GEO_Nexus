import type { ThemeConfig } from 'antd';

/**
 * Ant Design 主题配置
 * 与 Tailwind CSS slate 色系和 shadcn/ui 设计系统协调
 */
export const antdTheme: ThemeConfig = {
  token: {
    // 主色调 - 使用 slate 蓝灰色系
    colorPrimary: '#475569', // slate-600
    colorSuccess: '#10b981', // green-500
    colorWarning: '#f59e0b', // amber-500
    colorError: '#ef4444', // red-500
    colorInfo: '#3b82f6', // blue-500

    // 中性色 - 与 Tailwind slate 系列对齐
    colorTextBase: '#0f172a', // slate-900
    colorBgBase: '#ffffff',

    // 圆角 - 与设计系统一致
    borderRadius: 8,

    // 字体
    fontFamily:
      'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
  },
};
