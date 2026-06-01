import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建一个浏览器端的 mock worker，把所有 handlers 装进去。
// 真正"拦截请求"的能力来自 public/mockServiceWorker.js，
// 这里只是配置"拦下来之后用哪些规则响应"。
export const worker = setupWorker(...handlers);
