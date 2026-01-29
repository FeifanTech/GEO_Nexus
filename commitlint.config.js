/**
 * Commitlint 配置
 * 规范提交信息格式，遵循 Conventional Commits 规范
 * 文档: https://commitlint.js.org/
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type 枚举（必须是以下之一）
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能
        'fix',       // 修复 bug
        'docs',      // 文档更新
        'style',     // 代码格式（不影响功能）
        'refactor',  // 重构
        'perf',      // 性能优化
        'test',      // 测试
        'chore',     // 构建/工具链更新
        'revert',    // 回滚
        'build',     // 构建系统
        'ci',        // CI 配置
      ],
    ],
    // Subject 不能为空
    'subject-empty': [2, 'never'],
    // Subject 不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // Subject 不能全大写
    'subject-case': [0],
    // Type 必填
    'type-empty': [2, 'never'],
    // Type 必须小写
    'type-case': [2, 'always', 'lower-case'],
    // Scope 可选，小写
    'scope-case': [2, 'always', 'lower-case'],
    // Header 最大长度 100 字符
    'header-max-length': [2, 'always', 100],
  },
};
