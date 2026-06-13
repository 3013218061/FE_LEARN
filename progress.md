# 前端学习会话日志与进度记录

本文档用于记录每次学习会话完成的内容、文件变化、验证结果和下一步计划。

## 2026-06-13 会话记录（五）：笔记命名整理 + Vitest 单元测试

### 0. 笔记命名整理

原计划只有四个阶段（四周），但此前把第四阶段的多节误命名成 `week-03/04/05/06`，看着像第五、六周。本次重命名为「第四阶段子节」方案，使文件结构忠实反映四阶段：

```text
week-01-web-basics-notes.md             第一阶段 Web 基础
week-02-typescript-engineering-notes.md 第二阶段 TypeScript 与工程化
（第三阶段 React 核心：成果即 user-management 项目本身，讲解并入 week-02）
week-04-1-env-request-mock-notes.md     第四阶段（一）环境变量 / request 层 / MSW
week-04-2-react-router-notes.md         第四阶段（二）React Router
week-04-3-auth-route-guard-notes.md     第四阶段（三）token 鉴权与路由守卫
week-04-4-pagination-filter-sort-notes.md 第四阶段（四）分页/筛选/排序
week-04-5-vitest-testing-notes.md       第四阶段（五）Vitest 单元测试
```

同步修正了各笔记内部标题编号、交叉引用，以及 `task_plan.md` / `progress.md` / `findings.md` 里的文件名引用。

### 1. 本次目标

引入单元测试框架 Vitest，为前面写的 request 通用层、`fetchUsers` query 拼接、token 存储层补上测试。

### 2. 新增/更新的文件

- 安装 `vitest@4` + `jsdom@29`（devDependencies）。
- `vitest.config.ts`：jsdom 环境 + 测试用 `VITE_API_BASE_URL`。
- `package.json`：加 `test` / `test:watch` 脚本。
- `src/api/request.test.ts`：request 层 7 条断言（200/204/错误/带 token/不带 token/401/网络失败）。
- `src/api/users.test.ts`：fetchUsers query 拼接 4 条断言。
- `src/auth/auth.test.ts`：token 存储 3 条断言。
- 新增 `week-04-5-vitest-testing-notes.md`：完整教学笔记。

### 3. 本次沉淀的教学内容

- 前端单测优先覆盖纯逻辑（request 层、拼参、token），最易藏 bug、最划算。
- Vitest = 前端 JUnit，吃 Vite 配置；jsdom 在 Node 里模拟浏览器（补 localStorage/Response）。
- 配置要点：`environment: 'jsdom'`；`env` 给定 `VITE_API_BASE_URL` 让 URL 可解析。
- 核心套路：`vi.stubGlobal('fetch', vi.fn())` 把外部依赖换成可控替身；`fetchMock.mock.calls[0][1]` 断言请求头。
- 异步断言：成功 `await`；失败 `await expect(...).rejects.toMatchObject(...)`。
- `beforeEach` 复位全局状态（token / 回调 / mock），保证测试互相独立。
- 测试文件就近放、命名 `xxx.test.ts`，参与 `tsc` 检查但不进 bundle。

### 4. 验证结果

```text
npm test       Test Files 3 passed (3)，Tests 14 passed (14)
npm run build  成功（tsc --noEmit 通过 + vite build，285 个模块）
```

### 5. 下一步建议

1. 组件测试：引入 `@testing-library/react`，测 `UserForm` 校验、`UserTable` 渲染与点击。
2. 表单抽象：把 `UserForm` 的字段配置与校验抽成可复用方案，并补测试。
3. 覆盖率：`vitest run --coverage` 看未覆盖分支。
4. 与真实 Spring Boot 联调：`VITE_USE_MOCK=false` 跑通全链路。

---

## 2026-06-13 会话记录（四）：分页 / 筛选 / 排序与 URL 状态同步

### 1. 本次目标

把后台列表页从「前端假过滤」升级成「后端真分页」，并用 `useSearchParams` 把分页/筛选/排序条件同步到 URL，完整记录教学笔记。

### 2. 新增/更新的文件

- `src/types/user.ts`：新增 `SortOrder`、`PageResult<T>`，`FetchUsersParams` 增加 `page/pageSize/sort/order`。
- `src/api/users.ts`：`fetchUsers` 用 `URLSearchParams` 拼 query，返回 `PageResult<User>`。
- `src/mocks/handlers.ts`：`GET /users` 真做「筛选→排序→分页」三步；mock 数据加到 8 条。
- `src/components/UserTable.tsx`：表头可点击排序（`sort/order/onSort` props + ▲▼ 指示）。
- `src/pages/UserListPage.tsx`：用 `useSearchParams` 读写 URL 条件，`useEffect([searchParams])` 驱动重新请求；分页控件；写操作后重拉当前页。
- `src/App.css`：分页与可排序表头样式。
- 新增 `week-04-4-pagination-filter-sort-notes.md`：完整教学笔记。

### 3. 本次沉淀的教学内容

- 真实后台必须后端分页：数据量大时不能把全表拉到前端过滤。
- `PageResult<T>` 契约，`total` 是关键，类比后端 `Page<T>` / `IPage<T>`。
- 用 `URLSearchParams` 安全拼接 query（自动 URL 编码），别手拼字符串。
- 后端三步顺序：先筛选→再排序→最后分页；`total` 在分页前算；排序字段白名单 + 中文 `localeCompare(.., 'zh')`。
- `useSearchParams` 把查询条件放 URL：可分享/可收藏/刷新不丢/前进后退可回溯。
- URL 驱动闭环：改条件=改 URL，`useEffect` 监听 `searchParams` 自动重新请求。
- 搜索框「草稿态本地 state vs 提交态写 URL」分离；改搜索/排序回第 1 页。
- 分页场景下，增删改后重新拉当前页，保证前后端一致。

### 4. 验证结果

```text
npm run build    成功（tsc --noEmit 通过 + vite build，285 个模块）
```

mock 共 8 条、每页 5 条，默认 2 页。分页/排序逻辑在浏览器内 MSW 跑，建议手工验证翻页 URL 同步、刷新保持、排序箭头、搜索回第 1 页、删除后刷新。

### 5. 下一步建议

1. 表单抽象：把 `UserForm` 的校验与字段配置抽成可复用表单方案。
2. 引入 Vitest：测 `fetchUsers` 的 query 拼接、mock 的筛选/排序/分页逻辑。
3. 与真实 Spring Boot 联调真实分页接口。
4. 列表体验增强：防抖搜索、每页条数可选、骨架屏。

---

## 2026-06-13 会话记录（三）：token 鉴权与路由守卫

### 1. 本次目标

在路由骨架上加一套最小可用的登录鉴权，把「request 通用层」和「React Router」真正咬合在一起，并完整记录教学笔记。

### 2. 新增/更新的文件

- 新增 `src/auth/auth.ts`：token 存储层（localStorage 读写 + `isLoggedIn`）。
- 新增 `src/api/auth.ts`：`login()` 登录接口。
- 新增 `src/pages/LoginPage.tsx`：登录页（受控表单 + 登录逻辑）。
- 新增 `src/components/RequireAuth.tsx`：路由守卫。
- `src/api/request.ts`：请求拦截（自动带 `Authorization: Bearer`）+ 响应拦截（401 统一 `clearToken` + 跳登录）+ `setUnauthorizedHandler` 回调注入。
- `src/App.tsx`：加 `/login` 公开路由，`RequireAuth` 包住受保护子树，注册 401 handler。
- `src/components/Layout.tsx`：加「退出登录」按钮。
- `src/mocks/handlers.ts`：加 `POST /login`，数据接口校验 token（无 token 返回 401）。
- `src/App.css`：登录页样式。
- 新增 `week-04-3-auth-route-guard-notes.md`：完整教学笔记。

### 3. 本次沉淀的教学内容

- 前后端鉴权分工：后端"真的拦"（安全边界），前端管体验和引导；前端守卫不是安全保障。
- token 存储取舍：localStorage（最直观）vs HttpOnly Cookie（最安全）。
- 请求拦截：request 层自动加 `Authorization`，业务接口零改。
- 响应拦截：401 统一 `clearToken` + 跳登录，业务不用各自判断。
- 回调注入：request 层不依赖路由，靠 `setUnauthorizedHandler` 注入 `navigate`，避免 `window.location` 整页刷新。
- 路由守卫 `RequireAuth` 包受保护子树；`/login` 必须放守卫外。
- 让 mock 后端也校验 token，整条链路才真实可测。
- TS 小坑：`HttpResponse` 作类型需泛型参数，用父类型 `Response` 规避（构建时真实踩到）。

### 4. 验证结果

```text
npm run build    成功（tsc --noEmit 通过 + vite build，285 个模块）
npm run preview + curl：GET /login 、/users 均 200（SPA 兜底）
```

MSW 是浏览器内 Service Worker，preview 服务器不运行它，故 401 鉴权拦截只能在真实浏览器验证。建议浏览器手工点测：admin/123456 登录；登录后删 localStorage 的 `auth_token` 再操作，应被弹回登录页。

### 5. 下一步建议

1. 权限细化（RBAC）：token 带角色，按角色控制菜单/按钮显隐。
2. 分页/筛选/排序：查询条件挪到后端 query 参数，用 `useSearchParams` 同步到 URL。
3. 登录后跳回原页面：守卫重定向时记下来源路径，登录成功跳回去。
4. 引入 Vitest：对 `request.ts` 的 401 分支、`auth.ts` 的 token 读写写单元测试。

---

## 2026-06-13 会话记录（二）：React Router 路由

### 1. 本次目标

进入第四阶段第一项「React Router 路由管理」，把 `user-management/` 从「单页」重构成「带路由的多页面」，并完整记录教学笔记。

### 2. 新增/更新的文件

- 安装依赖 `react-router-dom@7`。
- `src/main.tsx`：用 `<BrowserRouter>` 包住 `<App/>`。
- `src/App.tsx`：从「业务总控」瘦身成「路由表」（`Routes` / `Route` / `Navigate`）。
- 新增 `src/components/Layout.tsx`：公共外壳（标题 + 导航 `NavLink` + `Outlet`）。
- 新增 `src/pages/UserListPage.tsx`：原 `App.tsx` 的用户管理逻辑整体搬过来，新增「详情」跳转（`useNavigate`）。
- 新增 `src/pages/UserDetailPage.tsx`：详情页，`useParams` 读 `:id` + `getUser` 加载。
- 新增 `src/pages/NotFoundPage.tsx`：`path="*"` 404 兜底页。
- `src/components/UserTable.tsx`：新增 `onView` 回调和「详情」按钮。
- `src/api/users.ts`：新增 `getUser(id)`（`GET /users/:id`）。
- `src/mocks/handlers.ts`：新增 `GET /users/:id` mock（找不到返回 404）。
- `src/App.css`：新增导航栏和详情卡片样式。
- 新增 `week-04-2-react-router-notes.md`：完整记录 React Router 教学内容。

### 3. 本次沉淀的教学内容

- 前端路由 vs 后端路由：URL→组件（浏览器内、不刷新） vs URL→Controller（整页刷新）。
- 路由表 = 组件版 `@RequestMapping`；`App.tsx` 瘦身为纯路由表。
- 嵌套路由 + `Outlet` 做公共布局；`index` + `<Navigate>` 做默认页重定向；`path="*"` 做 404。
- 两种跳转：声明式 `Link`/`NavLink`（站内绝不用 `<a href>`） vs 编程式 `useNavigate`（含 `navigate(-1)`）。
- `useParams` 读 `:id`，类比 `@PathVariable`，值是字符串要 `Number()` 转。
- 引入路由后的分层：App=路由表，`pages/`=页面逻辑，`components/`=复用展示组件。
- 部署坑：静态服务器要配 `try_files ... /index.html` 回退，否则深链接刷新 404。

### 4. 验证结果

```text
npm run build    成功（tsc --noEmit 通过 + vite build，281 个模块）
npm run preview + curl：GET / 、/users 、/users/1 均 200（SPA 兜底）
```

### 5. 下一步建议

1. token 鉴权：`request.ts` 自动带 `Authorization`，401 跳登录页。
2. 路由守卫：`<RequireAuth>` 包裹受保护路由。
3. 分页/筛选/排序：查询条件挪到后端 query 参数，并用 `useSearchParams` 同步到 URL。
4. 引入 Vitest 写单元测试。

---

## 2026-06-13 会话记录（一）：环境变量 / request 层 / MSW

### 1. 本次目标

把 `user-management/` 工程在「能跑的 React + TypeScript 用户管理页」之上做的三次工程化升级，完整记录成教学笔记。这三次升级此前已落到代码（对应 `dev_claude` 分支三次提交），但教学笔记里还没有沉淀。

涉及提交：

```text
664ebb3 feat: 引入环境变量与多环境配置
69fd6f2 refactor: 抽出通用 request 层，统一 API 错误处理
8a79fc7 feat: 引入 MSW mock 层，业务代码与假后端在网络层解耦
```

### 2. 新增/更新的文件

- 新增 `week-04-1-env-request-mock-notes.md`：完整记录环境变量与多环境配置、通用 request 层、MSW Mock 层三块教学内容。
- 更新 `task_plan.md`：勾选「理解环境变量与不同环境配置」「API 分层封装」「请求拦截与统一错误处理」，补充 MSW Mock 说明，刷新「下一步建议」。
- 更新 `findings.md`：新增三块工程化心智模型（环境变量、request 层、MSW Mock）。
- 更新 `progress.md`：本条会话记录。

### 3. 本次沉淀的教学内容

#### 3.1 环境变量与多环境配置

- `.env.development` / `.env.production` 对应 Spring profile（`application-{env}.yml`），`npm run dev` / `npm run build` 自动选文件。
- `VITE_` 前缀是安全闸门：只有带前缀的变量才注入浏览器代码，等于"我确认这个值可以公开"。
- `import.meta.env.VITE_xxx` 是读取入口；值永远是字符串，`VITE_USE_MOCK` 要和 `'true'` 比较。
- `src/vite-env.d.ts` 给环境变量补类型，防止拼错。

#### 3.2 通用 request 层

- `request.ts` 收拢横切关注点（URL、header、状态码判断、JSON 解析、错误包装），`users.ts` 只表达业务语义。
- `ApiError(status, message)` 类比后端 `BusinessException(code, message)`。
- 泛型 `request<T>` 让调用点指定返回类型；`body?: unknown` 强制显式序列化，比 `any` 安全。
- 两类失败要分清：`fetch` 抛错=网络层失败（status=0），`response.ok===false`=HTTP 错误（4xx/5xx）。
- 204 No Content 不能 `.json()`，提前返回。

#### 3.3 MSW Mock 层

- 在网络层（Service Worker）拦截请求，业务代码无感，后端就绪后零改业务代码。
- `handlers.ts` 是有状态的内存假后端，增删改查真的改 `mockUsers` 数组；`:id` 路径参数写法类比 `@PathVariable`。
- handler URL 必须和真实请求 URL 用同一 baseUrl 拼，否则拦不到。
- `main.tsx` 用动态 `import` 让 mock 代码不进生产 bundle；必须 `await worker.start()` 后再渲染，否则首个请求漏拦。
- `VITE_USE_MOCK` 开关控制启停。

### 4. 验证结果

```text
npm run build   成功（tsc --noEmit 类型检查通过 + vite build 产物生成）
```

说明三层改造未破坏类型契约，工程仍可正常构建。浏览器手工点测建议在有真实浏览器的环境补做。

### 5. 下一步建议

1. 把 `VITE_USE_MOCK` 改为 `false`，启动真实 Spring Boot，验证零改业务代码切到真后端。
2. 在 `request.ts` 叠加 token 鉴权：自动带 `Authorization`，401 统一跳登录。
3. 引入 React Router，把用户管理做成路由页面。
4. 接入分页/筛选/排序，把 `keyword` 过滤挪到后端 query 参数。
5. 引入 Vitest，对 `request.ts` 状态码分支和 `users.ts` 过滤逻辑写单元测试。

---

## 2026-05-22 会话记录

### 1. 本次目标

把第二阶段从"理论笔记"推进到"真正动手"：创建 Vite + React + TypeScript 工程，落地类型、封装 API 层，并用 `App.tsx + UserForm + UserTable` 重写用户管理页面。

### 2. 新建的工程

新增目录 `user-management/`，结构如下：

```text
user-management
├── package.json          依赖与脚本（dev / build / preview / typecheck）
├── tsconfig.json         TypeScript 配置
├── vite.config.ts        Vite + React 插件配置
├── index.html            挂载点 #root + main.tsx 入口
├── .gitignore            忽略 node_modules / dist
├── public
│   └── users.json        本地数据源（沿用第一阶段，含 XSS 测试数据）
└── src
    ├── main.tsx          应用入口，createRoot 挂载
    ├── App.tsx           总控层：状态 + API 调用 + 数据流分发
    ├── App.css           页面样式
    ├── types
    │   └── user.ts       User / UserStatus / FormMode / 各 Request 类型
    ├── api
    │   └── users.ts      fetchUsers / createUser / updateUser / deleteUserApi
    └── components
        ├── UserForm.tsx  受控表单，新增/编辑复用
        └── UserTable.tsx 列表展示 + 操作回调
```

### 3. 本次讲解与落地内容

- 工程化文件职责：`package.json` 类比 `pom.xml`，`scripts` 是命令别名，`devDependencies` 只在开发/构建期使用。
- 类型落地：把笔记里设计的 `User`、`UserStatus`、`CreateUserRequest`、`UpdateUserRequest` 真正写进 `src/types/user.ts`。
- API 分层：所有 `fetch` 收拢到 `src/api/users.ts`，组件不直接碰网络。GET 用真实 `fetch('/users.json')`，写操作先用 `setTimeout` 模拟，接 Spring Boot 后只改 API 层、组件不动。
- props 数据流：`UserTable` / `UserForm` 通过 props 接收数据与 `onXxx` 回调，"数据往下传、事件往上抛"。
- 受控组件：`UserForm` 表单值存在 `useState` 里，`useEffect` 监听 `editingUser` 同步编辑初始值。
- 总控层 `App.tsx`：持有 `users / loading / error / keyword / mode / editingUser / message` 状态，`useEffect` 首次加载，写操作一律用不可变更新（`map` / `filter` / 展开运算符）。
- 四种状态：loading / error / empty / success 用条件渲染区分。
- XSS：React 对 `{user.name}` 默认转义，第一阶段的恶意数据在 React 里天然作为纯文本显示。

### 4. 验证结果

```text
npm install   成功（67 packages）
npm run build 成功（tsc --noEmit 类型检查通过 + vite build 产物生成）
npm run preview + curl:
  GET /                              200，返回挂载点 HTML
  GET /users.json                    200，返回 4 条用户数据
  GET /assets/index-*.js             200
```

说明：本环境无法用真实浏览器点击交互，本次验证覆盖"类型检查 + 生产构建 + 静态服务"，UI 渲染逻辑已通过类型检查。下次可在浏览器里手工点一遍 CRUD。

### 5. 下一步建议

1. 学习环境变量与多环境配置，把 API base URL 抽成 `import.meta.env`。
2. 进入第四阶段：React Router、统一错误处理、分页/筛选/排序、表单抽象。
3. 与真实 Spring Boot API 联调，替换 `src/api/users.ts` 的模拟写操作。
4. 引入 Vitest 写基础单元测试。

---

## 2026-05-15 会话记录

### 1. 本次目标

基于 `frontend-learning-plan.md`，开始第一周 Web 基础学习，并将讲解内容落到实际代码与学习笔记中。

### 2. 已创建/更新的文件

- `frontend-learning-plan.md`：原始系统学习计划。
- `index.html`：第一周 Web 基础后台管理页面练习。
- `week-01-web-basics-notes.md`：第一周 Web 基础学习笔记。
- `week-02-typescript-engineering-notes.md`：第二阶段 TypeScript 与工程化学习笔记。
- `task_plan.md`：阶段计划、任务进度和决策记录。
- `findings.md`：研究发现、课程要点和技术心智模型。
- `progress.md`：会话日志与后续行动。

辅助本地预览配置：

- `.claude/launch.json`：本地静态预览服务配置，用于 Launch preview panel。

### 3. 本次讲解内容

#### 3.1 Web 基础总览

已讲解：

- HTML / CSS / JavaScript 分别解决什么问题。
- 浏览器访问页面时的大致流程。
- Java 后端视角下如何类比前端结构。

关键类比：

```text
HTML        ≈ 页面结构声明 / 数据结构
CSS         ≈ 展示层规则
JavaScript ≈ 浏览器中的业务逻辑层
浏览器       ≈ 前端运行时环境
```

#### 3.2 静态后台首页

已实现：

- 左侧菜单。
- 顶部导航。
- 数据卡片。
- 查询区域。
- 用户表格。

已讲解：

- HTML 层级结构。
- Flex 布局。
- 表格结构。
- CSS 样式组织。

#### 3.3 JavaScript 与 DOM

已讲解并实践：

- `document.querySelector`。
- `addEventListener`。
- `innerHTML`。
- `document.createElement`。
- `textContent`。
- 表格动态渲染。

#### 3.4 异步请求与接口状态

已讲解并实践：

- `Promise`。
- `setTimeout` 模拟接口延迟。
- `async/await`。
- `try/catch`。
- loading、empty、error 状态。
- API 层函数 `fetchUsers({ keyword, shouldFail })`。

当前模拟接口能力：

```text
fetchUsers()                         加载全部用户
fetchUsers({ keyword: '李' })         模拟按关键字查询
fetchUsers({ shouldFail: true })      模拟接口失败
```

#### 3.5 XSS 与安全渲染

已讲解并实践：

- `innerHTML` 风险。
- XSS 与 SQL 注入的类比。
- `escapeHtml` 转义。
- `textContent` 安全渲染。
- 恶意测试数据作为文本显示，而不是作为真实 HTML 执行。

验证结果：

```text
imgCount: 0
buttonCount: 0
```

说明恶意 `<img>` 和 `<button>` 没有成为真实 DOM 节点。

#### 3.6 新增用户

已实现：

- 用户名输入框。
- 角色输入框。
- 状态下拉框。
- 新增用户按钮。
- 表单提示区域。

已讲解：

- `input.value`。
- `select.value`。
- `trim()`。
- 非空校验。
- 新增成功后 `users.push(newUser)`。
- 新增后 `renderUsers(users)`。
- 新增后清空表单。

#### 3.7 删除用户

已实现：

- 表格操作列。
- 每行删除按钮。
- 删除前确认。
- 从数组中移除用户。
- 删除后重新渲染。

已讲解：

- `find`。
- `findIndex`。
- `splice`。
- `window.confirm`。
- `splice` 与 `filter` 的区别。

验证结果：

```text
加载用户后：4 行数据，4 个删除按钮
删除第一行后：3 行数据，3 个删除按钮
提示：删除用户成功
```

### 4. Git 状态记录

本次曾创建提交：

```text
e14a141 add week one web basics exercise
```

该提交包含：

- `index.html`
- `week-01-web-basics-notes.md`

后续又继续修改了 `index.html` 并新增规划文件，当前是否提交需另行检查。

此前已将该提交本地 fast-forward 合并到主目录 `main`。PR 创建因 GitHub CLI 登录问题中止，用户决定不再提交 PR，改为本地合并。

### 5. 当前进度概览

第一阶段 Web 基础：已完成正式验收复盘并通过。
第二阶段 TypeScript 与工程化：已完成 TypeScript 基础类型、`interface` / `type` / 联合类型、函数签名、`Promise<T>`、泛型、npm / `package.json` / `scripts`、Vite 工程化结构，以及 React 过渡阶段的组件、`props`、`state`、`useState`、受控组件、`useEffect`、JSX、条件渲染、列表渲染与数据流基础，并已沉淀到第二阶段笔记。

已具备的页面能力：

- 基础布局。
- 表格展示。
- 查询。
- 新增。
- 编辑。
- 删除。
- 启用 / 禁用。
- 真实 `fetch('/users.json')` 请求。
- loading / empty / error / success 状态。
- 表单校验。
- 新增/编辑表单复用。
- `editingUserId` 编辑状态管理。
- XSS 防护。
- 使用 `document.createElement` + `textContent` 安全渲染动态文本。
- `users.json` 作为本地 JSON 数据源。
- `response.ok`、HTTP 状态码、`response.json()` 基础认知。
- CSS 盒模型、Flex / Grid 使用场景、position 定位、响应式布局基础。

已完成的复盘内容：

- 当前页面已经形成最小用户管理 CRUD。
- 已按职责理解当前单文件代码结构：数据状态层、DOM 引用层、API 模拟层、表单状态层、渲染层、事件处理层。
- 已在 `week-01-web-basics-notes.md` 中补充 CRUD、编辑状态、启用/禁用和代码分层笔记。
- 已补充真实 `fetch`、`users.json`、Network 面板观察点和 Spring Boot Controller 对应关系笔记。
- 已补充 DevTools Elements / Console / Network 用途、接口排查流程。
- 已补充 Spring Boot REST API 的 GET / POST / PUT / DELETE、JSON body、CORS、本地代理。
- 已补充 CSS 盒模型、Flex 与 Grid 区别、position 定位、响应式布局。

第二阶段当前已完成：

- TypeScript 为什么存在，以及它主要解决什么问题。
- TypeScript 基础类型：`string`、`number`、`boolean`、数组、对象。
- `interface`、`type`、联合类型的基本使用。
- `UserStatus = 'enabled' | 'disabled'` 这类受限字符串类型的设计思路。
- 函数参数类型、返回值类型、`Promise<T>` 的基本理解。
- 泛型，以及 `Array<T>`、`Promise<T>`、`PageResult<T>` 这类常见写法。
- TypeScript 与 Java DTO / VO / `CompletableFuture` / 泛型集合的初步类比。
- npm、`package.json`、`dependencies` / `devDependencies`、`scripts` 的基础认知。
- Vite 作为开发服务器与构建工具的定位。
- Vite + React + TypeScript 基础项目结构认知。
- 从当前原生 JS 用户管理页迁移到 React 的拆分顺序与职责映射。
- React 组件、`props`、`state`、`useState`、受控组件、`useEffect` 的基本理解。
- JSX、条件渲染、列表渲染、`key` 与 `App -> props -> 子组件 -> 回调 -> state 更新` 数据流模型。
- 已更新 `week-02-typescript-engineering-notes.md` 记录第二阶段已讲内容。

仍需补齐：

- 创建真正的 Vite + React + TypeScript 项目。
- 在工程化项目里落地当前 `User`、请求参数、API 返回类型设计。
- 封装基础 API 请求方法并重写当前用户管理页面。

### 6. 下一步建议

建议下一次继续按以下顺序推进：

1. 创建 Vite + React + TypeScript 项目骨架。
2. 落地 `User`、`CreateUserRequest`、`UpdateUserRequest` 等类型。
3. 封装 `fetchUsers`、`createUser`、`updateUser`、`deleteUserApi`。
4. 用 `App.tsx`、`UserForm`、`UserTable` 重写当前用户管理页面。

### 7. 本次验证结果

本次已通过本地静态服务器预览验证：

```text
GET /users.json              200 OK
GET /missing-users.json      404 File not found
```

页面表现：

- 点击“加载用户”后，表格能正确渲染 `users.json` 中的 4 条用户数据。
- XSS 测试数据仍作为普通文本显示，没有生成真实 `<img>` 或 `<button>` 节点。
- 点击“模拟失败”后，Network 面板出现 404 请求，页面进入错误状态并显示“加载失败，请稍后重试”。

### 8. 风险与注意事项

- 当前 `index.html` 仍是教学用单文件结构，后续功能继续增加会变得臃肿，应在进入 TypeScript/Vite 阶段拆分文件。
- 当前模拟数据中包含 XSS 测试数据，教学时有价值；如果作为正式 demo 展示，需要说明其用途。
- 当前删除使用 `splice` 直接修改数组，适合原生 JS 练习；进入 React 后应改用不可变更新。
- 当前 `.claude/launch.json` 是本地预览配置，不一定需要进入正式学习成果提交。
