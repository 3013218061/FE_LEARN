import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 应用入口：把 React 应用挂到 index.html 里的 #root 上
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
