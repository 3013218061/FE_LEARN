# 第四阶段（九）：Playwright 端到端测试

本笔记承接 `week-04-8-spring-boot-integration-notes.md`，给项目补上端到端（E2E）测试：用真实浏览器把「登录→列表→分页→搜索→编辑→登出」整条主流程跑一遍。这是测试金字塔的最顶层，也是对整个工程最有说服力的验证。

## 1. E2E 测试 vs 单元/组件测试

回顾我们已有的三层测试，对应「测试金字塔」：

```text
        ╱ E2E ╲          少量，慢，最真实：真实浏览器跑完整用户旅程（本节）
       ╱──────╲
      ╱ 组件测试 ╲        中量：渲染单个组件、模拟点击（week-04-6 的 UserForm 测试）
     ╱──────────╲
    ╱  单元测试   ╲       大量，快：纯逻辑函数（week-04-5 的 request / fetchUsers / token）
```

各层回答不同问题：

```text
单元测试：这个函数逻辑对不对？（request 解析 401 对不对）
组件测试：这个组件渲染和交互对不对？（UserForm 校验失败不提交）
E2E：    把所有东西拼起来，用户走完整流程能不能成？（登录后能不能改用户再登出）
```

E2E 最像真实用户：它启动真浏览器，访问真 URL，点真按钮，连路由跳转、token 存取、MSW 拦截、状态更新全都真实发生。**它能抓到"每个零件单测都过、但拼起来不工作"的集成问题。**

## 2. 选型：Playwright

```text
Playwright = 微软的端到端测试框架，驱动真实浏览器（Chromium/Firefox/WebKit）。
特点：自动等待（元素出现/可点击才操作，少写 sleep）、选择器贴近用户（按角色/文字找）、
      能自动起本地服务器、失败可录屏录轨迹。
```

## 3. 关键设计：E2E 跑在 mock 模式上，不需要真后端

这是前面铺垫的又一次收获。E2E 配置让 Playwright 自动起 `npm run dev`（`VITE_USE_MOCK=true`）：

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',          // 自动拉起 dev 服务器
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

```text
为什么用 dev 而不是 preview？
  dev 模式 VITE_USE_MOCK=true，MSW 在真实浏览器里提供有状态假后端。
  preview 跑的是生产构建（mock 关闭），需要真后端，E2E 就没数据了。
关键点：E2E 跑在真浏览器里，所以 MSW（Service Worker）真的生效 ——
  这是它和 vitest+jsdom 单测的本质区别。
```

所以整条链路（路由守卫、登录拿 token、带 token 请求、MSW 响应、分页、有状态的增删改）都能在没有 Spring Boot 的情况下端到端跑通。

## 4. 用例覆盖的主流程

`e2e/user-management.spec.ts` 两个用例：

```text
用例 1：未登录访问 / -> 被路由守卫重定向到 /login（验证 RequireAuth）
用例 2：完整主流程
  登录(admin/123456) -> 进 /users 看到张三
  -> 分页：第 1/2 页共 8 条 -> 点下一页 -> URL 带 page=2、显示第 2/2 页
  -> 搜索"张" -> URL 带 keyword、回第 1 页、共 1 条
  -> 编辑张三角色 -> "更新用户成功"、列表显示新角色（验证 mock 有状态）
  -> 登出 -> 回到 /login
```

这一条用例把前面**每一节的成果**都串起来验证了一遍：守卫、鉴权、URL 同步的分页搜索、表单、有状态 mock。

## 5. 写 E2E 的几个要点

**选择器贴近用户**（和组件测试同一哲学）：

```ts
page.getByPlaceholder('admin').fill('admin');           // 按占位符
page.getByRole('button', { name: '登录' }).click();      // 按角色+名字
page.getByRole('cell', { name: '张三' });                // 表格单元格
page.getByText(/第 1 \/ 2 页，共 8 条/);                  // 按文字（正则更稳）
```

**在某一行里精确操作**（列表有多个"编辑"按钮）：

```ts
await page
  .getByRole('row', { name: /张三/ })            // 先定位到张三那一行
  .getByRole('button', { name: '编辑' })          // 再点这一行里的编辑
  .click();
```

**自动等待，少写 sleep**：

```ts
// 不用手动等 300ms 网络延迟或路由跳转
await expect(page).toHaveURL(/\/users$/);        // 自动轮询直到 URL 满足
await expect(page.getByText('更新用户成功')).toBeVisible();  // 自动等元素出现
```

```text
Playwright 的 expect 会自动重试一小段时间，直到条件满足或超时。
所以"点完按钮马上断言"是安全的，框架替你等异步完成。
```

## 6. 和 vitest 的边界：别互相抢用例

vitest 和 Playwright 都认 `*.spec.ts` / `*.test.ts`，必须划清地盘，否则 vitest 会去跑 E2E 用例然后报错（Playwright 的 API 在 jsdom 里不存在）：

```ts
// vitest.config.ts：排除 e2e 目录
import { configDefaults } from 'vitest/config';
test: {
  exclude: [...configDefaults.exclude, 'e2e/**'],
}
```

```text
约定：
  src/**/*.test.ts(x)   -> vitest（单元 + 组件）
  e2e/**/*.spec.ts      -> Playwright（端到端）
  playwright.config.ts 的 testDir 指向 ./e2e，两边互不干扰。
```

## 7. 验证结果（含一个环境限制）

```text
npx playwright test --list   成功列出 2 个用例（配置 + 用例编译通过）
npm test                     18 passed（vitest 正确排除 e2e，仍只跑 src 单测）
npm run build                成功（286 个模块）
```

**环境限制（要诚实说明）**：本环境的网络出口策略屏蔽了 `cdn.playwright.dev`，且系统无任何现成浏览器，所以 **chromium 下载失败、E2E 无法在此真正执行**。用例与配置已落地并通过 `--list` 解析校验；在能联网下载浏览器（或已装 Chrome）的机器上：

```bash
npx playwright install chromium   # 下载浏览器（需访问 cdn.playwright.dev）
npm run test:e2e                  # 自动起 dev 服务器并跑通主流程
```

即可真正执行。

## 8. 本节小结

```text
测试金字塔   单元（多/快）-> 组件 -> E2E（少/慢/最真实）
E2E 价值     抓"零件都过但拼起来不工作"的集成问题
Playwright   驱真实浏览器，自动等待，选择器贴近用户
跑在 mock 上  webServer 起 dev（VITE_USE_MOCK=true），真浏览器里 MSW 生效，无需真后端
主流程用例   登录->列表->分页->搜索->编辑->登出，串起所有前置成果
精确定位     getByRole('row',{name}).getByRole('button',{name}) 在指定行操作
自动等待     expect 自动重试，点完即断言，少写 sleep
划清地盘     vitest 排除 e2e/，Playwright testDir 指 ./e2e
环境限制     本环境浏览器下载被网络策略屏蔽，用例已就绪、待有浏览器的环境执行
```

## 9. 第四阶段收官 & 后续进阶

第四阶段「真实项目开发能力」的全部计划项已覆盖：路由、API 分层、鉴权、统一错误处理、分页/筛选/排序、表单抽象、单元/组件/E2E 测试、构建部署、联调方案。

后续可继续的进阶方向（已超出原四阶段计划）：

```text
1. CI/CD：把 npm ci && npm test && npm run build（+E2E）接进流水线自动化。
2. 统一响应体适配 + 业务错误码处理（request 层再抽一层）。
3. 性能：路由级代码分割（lazy + Suspense）、首屏优化。
4. 权限：基于角色的菜单/按钮级权限（RBAC）。
5. 可访问性（a11y）与国际化（i18n）。
```
