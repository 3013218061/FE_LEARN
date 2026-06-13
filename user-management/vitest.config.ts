import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest 配置（独立于 vite.config.ts，不进 tsc 的类型检查范围）。
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom 提供浏览器环境（localStorage、Response 等），让贴近浏览器的代码可测
    environment: 'jsdom',
    // 每个测试文件前先跑 setup（注入 jest-dom 断言 + 组件自动清理）
    setupFiles: ['./src/test/setup.ts'],
    // 排除 e2e/：那是 Playwright 的端到端用例，不归 vitest 跑
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // 给测试一个确定的 baseUrl，保证 fetchUsers 拼出的是合法绝对 URL
    env: {
      VITE_API_BASE_URL: 'http://localhost/api',
    },
  },
});
