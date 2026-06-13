import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置：开启 React 插件（支持 JSX 与快速刷新）
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 开发联调：把 /api 开头的请求代理到本地 Spring Boot。
      // 浏览器只和 Vite 同源（5173）通信，由 Vite 转发到 8080，天然绕开 CORS。
      // mock 模式下 MSW 在更前面就把请求拦了，根本走不到这里。
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
