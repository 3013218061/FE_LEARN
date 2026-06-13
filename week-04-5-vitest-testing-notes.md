# 第四阶段（五）：Vitest 单元测试学习笔记

本笔记承接 `week-04-4-pagination-filter-sort-notes.md`，记录给 `user-management/` 接入单元测试框架 Vitest，并为前面写的 request 通用层、`fetchUsers` query 拼接、token 存储层补上测试。这是第四阶段「质量保障」的一环。

## 1. 为什么前端也要写单元测试

后端开发者对 JUnit 很熟，前端的逻辑同样需要测：

```text
没有测试时：每改一处 request 层 / 分页拼参，都要手动点浏览器验证一遍，慢且容易漏。
有测试时：  改完跑一条命令，几十个断言瞬间告诉你哪里坏了。
```

前端单元测试最该覆盖的，是**纯逻辑**（不依赖界面）：

```text
request 层：状态码判断、错误包装、401 处理、自动带 token
API 层：    query string 拼接对不对
工具函数：  token 存取、数据转换、校验逻辑
```

这些正是我们前几节写的、最容易出隐藏 bug 的地方，测了最划算。UI 组件的渲染测试（点击、输入）属于更上层，本节先打好"逻辑测试"的底。

## 2. 选型：Vitest = 前端的 JUnit（且和 Vite 同源）

```text
Vitest  测试运行器 + 断言库，API 和 Jest 几乎一样，但原生吃 Vite 配置和 ESM/TS，
        在 Vite 项目里零额外打包配置，启动快。
jsdom   在 Node 里模拟一个浏览器环境（提供 localStorage、Response 等），
        让"贴近浏览器的代码"也能在命令行里测。
```

Java 类比：

```text
Vitest  ≈ JUnit + AssertJ（跑测试 + 断言）
describe / it ≈ @Nested 测试类 / @Test 方法
expect(x).toBe(y) ≈ assertThat(x).isEqualTo(y)
vi.fn() / vi.stubGlobal ≈ Mockito 的 mock() / when().thenReturn()
beforeEach ≈ @BeforeEach
```

## 3. 接入步骤

```bash
npm install -D vitest jsdom
```

`package.json` 加脚本：

```json
"test": "vitest run",        // 跑一遍就退出（CI 用）
"test:watch": "vitest"       // 监听模式，改文件自动重跑（开发用）
```

`vitest.config.ts`（独立于 `vite.config.ts`，故意不进 `tsconfig` 的 include，避免干扰生产构建）：

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',                 // 提供 localStorage、Response 等浏览器 API
    env: { VITE_API_BASE_URL: 'http://localhost/api' }, // 给测试一个确定的 baseUrl
  },
});
```

两个关键配置点：

```text
environment: 'jsdom'
  request.ts 里 getToken() 用了 localStorage，token 存储层也是。
  Node 默认没有 localStorage，必须用 jsdom 环境补上，否则一跑就报错。

env: { VITE_API_BASE_URL }
  测试模式（mode=test）不会加载 .env.development，import.meta.env.VITE_API_BASE_URL 会是 undefined。
  fetchUsers 拼出来就成了 "undefined/users?..."，new URL() 解析会抛错。
  所以在这里显式给一个合法 baseUrl，让断言能用 new URL() 解析。
```

## 4. 测试文件放哪、怎么命名

```text
和被测文件放一起，命名 xxx.test.ts：
  src/api/request.ts   -> src/api/request.test.ts
  src/api/users.ts     -> src/api/users.test.ts
  src/auth/auth.ts     -> src/auth/auth.test.ts
```

就近放置的好处：看一个模块时，它的测试就在旁边，改实现顺手改测试。

注意：测试文件在 `src` 下，`tsc --noEmit`（生产构建第一步）也会对它们做类型检查，但**不会被打进生产产物**（没有被入口 `main.tsx` import，Vite 打包时自然不包含）。所以测试代码"参与类型检查、不进 bundle"，正好。

## 5. 核心套路：mock 掉 fetch，测自己的逻辑

单元测试的精髓是**只测自己这一层的逻辑，把外部依赖换成可控的替身**。这里外部依赖就是浏览器的 `fetch`。

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock); // 把全局 fetch 换成替身
  return fetchMock;
}
```

```text
vi.fn()              造一个"假函数"，能记录被怎么调用、可指定返回值
.mockResolvedValue(x) 让它返回一个 resolve 成 x 的 Promise（模拟 fetch 成功）
.mockRejectedValue(e) 让它 reject（模拟断网）
vi.stubGlobal('fetch', mock)  用替身顶替全局 fetch
fetchMock.mock.calls[0][1]    第 1 次调用的第 2 个参数（即 fetch 的 init），用来断言请求头
```

这样就能不发真网络请求，纯粹验证"我的 request 层对各种响应处理得对不对"。

## 6. 写了哪些断言（对照前几节的实现）

### 6.1 request 通用层（7 条）

```text
200      解析并返回 JSON
204      返回 undefined（验证"不调用 .json()"那段逻辑）
500      抛出 ApiError，且 status === 500
有 token  init.headers.Authorization === 'Bearer abc123'（请求拦截）
无 token  不带 Authorization 头
401      清掉 token（getToken() 为 null）+ unauthorizedHandler 被调用一次（响应拦截）
fetch 抛错 包装成 status === 0 的 ApiError（网络层失败）
```

这一组直接验证了 `week-04-1` 和 `week-04-3` 讲的所有分支：204 处理、错误包装、网络层失败 vs HTTP 错误、请求/响应拦截器。

401 那条尤其有价值——它把"清 token + 触发跳登录回调"这个跨模块行为，用 `vi.fn()` 当回调断言出来了：

```ts
it('401 时清掉 token 并调用 unauthorizedHandler', async () => {
  setToken('expired');
  const handler = vi.fn();
  setUnauthorizedHandler(handler);
  stubFetch(new Response(null, { status: 401 }));

  await expect(request('/users')).rejects.toMatchObject({ status: 401 });
  expect(getToken()).toBeNull();
  expect(handler).toHaveBeenCalledOnce();
});
```

### 6.2 fetchUsers query 拼接（4 条）

```text
完整参数  keyword/page/pageSize/sort/order 都正确进 URL（用 new URL 解析断言）
无 keyword 不带 keyword 参数
无 sort   不带 sort/order 参数
返回值    原样返回后端的 PageResult
```

这组验证了 `week-04-4` 的"用 URLSearchParams 拼 query、按需省略空参数"。断言用 `new URL(calledUrl).searchParams.get('keyword')` 拿到 `'张'`，同时证明了 URLSearchParams 的编解码是对的。

### 6.3 token 存储层（3 条）

```text
初始无 token；set 后能 get 回来且 isLoggedIn 为 true；clear 后归零
```

## 7. 异步断言的两个常用写法

```ts
// 成功：直接 await
const data = await request('/x');
expect(data).toEqual(...);

// 失败：用 rejects，别用 try/catch（容易漏掉"没抛错"的情况）
await expect(request('/x')).rejects.toBeInstanceOf(ApiError);
await expect(request('/x')).rejects.toMatchObject({ status: 500 });
```

```text
toMatchObject 只比对象的部分字段（这里只关心 status），不用写全。
rejects 断言"这个 Promise 一定会 reject"，比手写 try/catch 更稳。
```

## 8. beforeEach：每条测试都从干净状态开始

```ts
beforeEach(() => {
  clearToken();                  // 清掉上一条可能残留的 token
  setUnauthorizedHandler(() => {}); // 重置回调
  vi.restoreAllMocks();          // 还原被 stub 的全局
});
```

```text
原则：测试之间必须互相独立，不能靠执行顺序。
token 存 localStorage、unauthorizedHandler 是模块级变量、fetch 被 stub 过 ——
这些"全局状态"每条测试前都要复位，否则上一条会污染下一条。
```

## 9. 验证结果

```text
npm test       Test Files 3 passed (3)，Tests 14 passed (14)
npm run build  成功（tsc --noEmit 通过 + vite build，285 个模块）
```

测试文件参与类型检查、通过构建，但不进生产产物。

## 10. 本节小结

```text
为什么测    纯逻辑（request 层、拼参、token）最容易藏 bug，测了最划算
Vitest      前端的 JUnit，吃 Vite 配置，describe/it/expect 对应 @Test/断言
jsdom       Node 里模拟浏览器，补 localStorage/Response
配置要点    environment: jsdom；env 里给定 VITE_API_BASE_URL 让 URL 可解析
命名        xxx.test.ts 就近放；参与 tsc 检查但不进 bundle
核心套路    vi.stubGlobal('fetch', vi.fn()) 把外部依赖换成可控替身
断言请求    fetchMock.mock.calls[0][1] 拿 init，断言 Authorization 头
异步断言    成功 await；失败 await expect(...).rejects.toMatchObject(...)
隔离        beforeEach 复位 token / 回调 / mock，保证测试互相独立
```

## 11. 下一步学习建议

```text
1. 组件测试：引入 @testing-library/react，测 UserForm 的校验、UserTable 的渲染与点击。
2. 表单抽象：把 UserForm 的字段配置与校验抽成可复用方案，再补对应测试。
3. 覆盖率：vitest run --coverage 看哪些分支没测到。
4. 与真实 Spring Boot 联调：VITE_USE_MOCK=false，对接真实接口跑通全链路。
```
