import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置：开启 React 插件（支持 JSX 与快速刷新）
export default defineConfig({
  plugins: [react()],
});
