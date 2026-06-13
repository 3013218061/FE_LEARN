import { defineConfig, devices } from '@playwright/test';

// Playwright 端到端测试配置。
// E2E 跑在 dev 服务器（VITE_USE_MOCK=true）上：MSW 在真实浏览器里提供假后端，
// 所以不需要真实 Spring Boot 也能跑通完整主流程。
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry', // 首次重试时录制轨迹，方便排查失败
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // 自动拉起 dev 服务器再跑测试；本地已开着就复用
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
