#!/usr/bin/env tsx

/**
 * GEO 诊断功能调试工具
 * 用于排查诊断失败的问题
 */

import { useSettingsStore } from "../src/store/useSettingsStore";

console.log("=== GEO 诊断调试工具 ===\n");

// 1. 检查设置 Store
console.log("1. 检查设置配置:");
try {
  const settingsStore = useSettingsStore.getState();
  console.log("   Dify API Key:", settingsStore.settings.difyApiKey ?
    `已配置 (${settingsStore.settings.difyApiKey.substring(0, 10)}...)` :
    "❌ 未配置");
  console.log("   Dify Base URL:", settingsStore.settings.difyBaseUrl || "使用默认");
} catch (error) {
  console.error("   ❌ 无法读取设置:", error);
}

console.log("\n2. 环境变量检查:");
console.log("   DIFY_API_KEY:", process.env.DIFY_API_KEY ?
  `已配置 (${process.env.DIFY_API_KEY.substring(0, 10)}...)` :
  "未配置（可选）");
console.log("   DIFY_API_BASE_URL:", process.env.DIFY_API_BASE_URL || "使用默认");

console.log("\n3. 常见问题检查清单:");
console.log("   [ ] API Key 格式正确 (以 app- 开头)");
console.log("   [ ] API Key 在 Dify 控制台有效");
console.log("   [ ] 网络可以访问 api.dify.ai");
console.log("   [ ] 已保存设置并刷新页面");

console.log("\n4. 测试步骤:");
console.log("   1. 打开浏览器控制台 (F12)");
console.log("   2. 访问 GEO 诊断页面");
console.log("   3. 选择一个产品");
console.log("   4. 点击'开始诊断'");
console.log("   5. 查看控制台的错误信息");

console.log("\n5. 可能的错误类型:");
console.log("   - 'DIFY_API_KEY is not configured': API Key 未传递");
console.log("   - '401 Unauthorized': API Key 无效或过期");
console.log("   - '404 Not Found': Dify 应用不存在");
console.log("   - '500 Internal Server Error': Dify 服务异常");
console.log("   - 网络错误: 无法连接到 Dify 服务");

console.log("\n=== 调试完成 ===\n");
