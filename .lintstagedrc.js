/**
 * Lint-staged 配置
 * 在 Git 提交前自动运行代码检查和格式化
 * 文档: https://github.com/okonet/lint-staged
 */

module.exports = {
  // TypeScript 和 JavaScript 文件
  '*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
  ],

  // JSON 文件
  '*.json': [
    'prettier --write',
  ],

  // CSS 和样式文件
  '*.{css,scss,sass,less}': [
    'prettier --write',
  ],

  // Markdown 文件
  '*.md': [
    'prettier --write',
  ],
};
