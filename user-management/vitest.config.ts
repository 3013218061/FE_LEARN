import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest 配置（独立于 vite.config.ts，不进 tsc 的类型检查范围）。
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom 提供浏览器环境（localStorage、Response 等），让贴近浏览器的代码可测
    environment: 'jsdom',
    // 给测试一个确定的 baseUrl，保证 fetchUsers 拼出的是合法绝对 URL
    env: {
      VITE_API_BASE_URL: 'http://localhost/api',
    },
  },
});
