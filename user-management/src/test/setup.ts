// 测试环境的全局准备，由 vitest.config.ts 的 setupFiles 在每个测试文件前加载。

// 注入 @testing-library/jest-dom 的自定义断言（如 toBeInTheDocument / toHaveValue）
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 每条测试后卸载渲染的组件，避免上一条的 DOM 残留污染下一条
afterEach(() => {
  cleanup();
});
