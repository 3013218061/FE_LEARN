import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// 按开关启动 MSW。必须在渲染前等 worker.start() resolve，
// 否则首次请求可能跑在 worker 接管之前被漏掉。
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  // 动态 import：mock 代码只在开启时才进入 bundle，生产环境不会被打包进去
  const { worker } = await import('./mocks/browser');

  // onUnhandledRequest: 'bypass'  →  没匹配到的请求放行，不警告
  // 默认值是 'warn'，会在控制台刷一堆"未匹配请求"的告警
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* BrowserRouter 用 HTML5 History API 管理 URL，
          让 URL 变化但页面不整页刷新（SPA 单页应用的核心） */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});
