# 前端系统学习计划与任务进度

本文档用于跟踪 `frontend-learning-plan.md` 对应的阶段计划、任务进度和关键决策。

## 1. 总体目标

面向具备 Java 后端经验、前端基础较弱的开发者，逐步建立现代前端开发认知，并能独立完成后台管理类页面与 Spring Boot REST API 联调。

阶段性目标：

- 看懂中等复杂度的 React + TypeScript 项目结构。
- 独立开发后台管理类页面。
- 能与 Spring Boot REST API 完成联调。
- 能使用 AI 工具拆解需求、生成代码、审查代码、补充测试。
- 遇到问题时能从浏览器渲染、网络请求、状态管理、构建工具等层面定位问题。

## 2. 技术路线

```text
HTML/CSS/JavaScript
  -> TypeScript
  -> React
  -> Vite
  -> 接口联调
  -> 测试与部署
  -> AI 辅助项目开发
```

## 3. 阶段计划

### 第一阶段：Web 基础

目标：理解浏览器页面的基本组成，并能独立写出后台管理类静态页面。

学习范围：

- HTML：页面结构、语义化标签、表单、表格。
- CSS：选择器、盒模型、Flex、Grid、定位、响应式。
- JavaScript：变量、函数、数组、对象、事件、Promise、async/await、fetch。
- 浏览器：DOM、事件机制、开发者工具、Network 面板。

当前产出：

- `index.html`：后台管理首页练习页面。
- `week-01-web-basics-notes.md`：第一周 Web 基础学习笔记。
- `week-02-typescript-engineering-notes.md`：第二阶段 TypeScript 与工程化学习笔记。

当前完成情况：已完成第一阶段学习内容与正式验收复盘，已进入第二阶段 TypeScript 与工程化。

已完成任务：

- [x] 搭建后台首页基础结构：左侧菜单、顶部导航、数据卡片、查询区域、数据表格。
- [x] 使用 CSS Flex 完成左右布局、卡片横向排列、表单与表格样式。
- [x] 讲解 CSS 盒模型、Grid、定位、响应式基础。
- [x] 使用 JavaScript `querySelector` 获取页面元素。
- [x] 使用 `addEventListener` 绑定按钮点击事件。
- [x] 使用数组数据渲染用户表格。
- [x] 使用 `Promise`、`setTimeout` 模拟接口延迟。
- [x] 使用 `async/await` 和 `try/catch` 处理异步请求。
- [x] 处理 loading、empty、error 三种状态。
- [x] 将模拟请求函数调整为更接近真实 API 层的 `fetchUsers({ keyword, shouldFail })`。
- [x] 创建 `users.json`，将“加载用户”改成真实 `fetch('/users.json')` 请求。
- [x] 讲解 `response.ok`、HTTP 状态码、`response.json()` 和 Network 面板观察点。
- [x] 讲解真实 `fetch` 与 Spring Boot Controller 的基本对应关系。
- [x] 讲解 DevTools Elements、Console、Network 的用途和接口问题排查流程。
- [x] 补充 Spring Boot API 联调中的 GET / POST / PUT / DELETE、JSON body、CORS、本地代理。
- [x] 讲解并实践 XSS 风险与 `innerHTML` 的安全问题。
- [x] 使用 `escapeHtml` 进行 HTML 转义。
- [x] 使用 `document.createElement` + `textContent` 重构表格渲染。
- [x] 增加“新增用户”表单，完成基础校验、追加数据、重新渲染。
- [x] 增加“编辑用户”功能，理解 `editingUserId` 与新增/编辑表单复用。
- [x] 增加“删除用户”功能，完成确认、数组删除、重新渲染。
- [x] 增加“启用/禁用用户”功能，理解状态切换与重新渲染。
- [x] 对当前单文件页面做代码职责分层复盘：数据状态层、DOM 引用层、API 模拟层、表单状态层、渲染层、事件处理层。

待完成任务：

- [x] 对第一阶段进行正式验收复盘，并输出阶段结论。

### 第二阶段：TypeScript 与工程化

目标：建立前端项目工程化意识，理解类型、依赖、构建和项目结构。

计划任务：

- [x] 学习 TypeScript 基础类型：string、number、boolean、数组、对象。
- [x] 学习 interface、type、联合类型。
- [x] 对比 TypeScript interface 与 Java DTO。
- [x] 学习函数参数类型、返回值类型、`Promise<T>`。
- [x] 学习泛型。
- [x] 学习 npm、package.json、依赖版本、脚本命令。
- [x] 整理第二阶段 TypeScript 与工程化学习笔记。
- [x] 创建 Vite + React + TypeScript 项目（`user-management/`）。
- [x] 定义 `User`、`CreateUserRequest`、`UpdateUserRequest` 等接口类型（`src/types/user.ts`）。
- [x] 封装基础 API 请求方法（`src/api/users.ts`）。
- [x] 理解环境变量与不同环境配置（`.env.development` / `.env.production` / `import.meta.env` / `vite-env.d.ts`）。

预期产出：

- 一个 Vite + React + TypeScript 项目骨架。
- 一组用户管理相关 TypeScript 类型定义。
- 一个基础 API 请求封装。

### 第三阶段：React 核心

目标：理解 React 的状态驱动 UI 模型。

关键心智模型：

```text
UI = f(state)
```

计划任务：

- [x] 学习 JSX 与函数组件。
- [x] 学习 props 与 state。
- [x] 学习 useState、useEffect。
- [x] 学习条件渲染、列表渲染。
- [x] 学习表单受控组件。
- [x] 学习父子组件通信。
- [x] 在 React 中重写当前 `index.html` 用户管理页面（`user-management/`）。
- [x] 补齐 loading、empty、error 状态。
- [x] 补齐新增、编辑、删除、启用/禁用功能。

预期产出：

- React 版用户管理页面。
- 能解释组件职责、数据流、状态变化和组件关系。

### 第四阶段：真实项目开发能力

目标：具备完成一个小型后台管理模块的能力。

计划任务：

- [x] 学习 React Router 路由管理（`BrowserRouter` / 路由表 / 嵌套路由 + `Outlet` / `Link`·`NavLink` / `useNavigate` / `useParams` / 404 兜底，详见 `week-04-2-react-router-notes.md`）。
- [x] 学习 API 分层封装（`src/api/request.ts` 通用请求层 + `src/api/users.ts` 业务层）。
- [x] 学习 token 鉴权（localStorage 存 token / 登录页 / 请求自动带 Authorization / 路由守卫 RequireAuth / 退出登录，详见 `week-04-3-auth-route-guard-notes.md`）。
- [x] 学习请求拦截与统一错误处理（`request.ts` 统一状态码判断 + `ApiError` + 请求拦截带 token + 响应拦截 401 统一跳登录）。
- [x] 学习分页、筛选、排序（后端真分页 `PageResult<T>` + `useSearchParams` 把查询条件同步到 URL，详见 `week-04-4-pagination-filter-sort-notes.md`）。
- [x] 学习表单抽象（抽出可复用的 `useForm` 自定义 Hook + 独立校验函数，并补 `UserForm` 组件测试，详见 `week-04-6-form-abstraction-component-testing-notes.md`）。
- [x] 与 Spring Boot REST API 完成联调（已真写 `backend/` 最小 Spring Boot 后端并切 `VITE_USE_MOCK=false`，经 Vite 代理跑通鉴权+分页/排序/搜索+CRUD 全链路；详见 `week-04-8-spring-boot-integration-notes.md` §7 与 `backend/README.md`）。
- [x] 学习构建与部署（`npm run build` 产物 / hash 缓存失效 / 环境变量构建时焊死 / SPA history 回退 / 多阶段 Dockerfile + Nginx，详见 `week-04-7-build-and-deploy-notes.md`）。
- [x] 引入 Vitest 做基础单元测试（request 层 7 条 + fetchUsers query 拼接 4 条 + token 存储 3 条，共 14 条，详见 `week-04-5-vitest-testing-notes.md`）。
- [x] 引入 Playwright 做端到端测试（覆盖登录→列表→分页→搜索→编辑→登出主流程，跑在 mock 模式无需真后端；详见 `week-04-9-playwright-e2e-notes.md`。用例与配置已就绪并通过 `--list` 校验；本环境因网络策略屏蔽浏览器下载未能实跑，待有浏览器的环境执行）。

补充：已引入 MSW Mock 层（`src/mocks/` + `public/mockServiceWorker.js`），通过 `VITE_USE_MOCK` 开关在网络层接管假后端，后端就绪后零改业务代码即可切到真实 API。详见 `week-04-1-env-request-mock-notes.md`。

预期产出：

- 一个小型后台管理模块。
- 包含路由、接口、鉴权、分页、表单、错误处理和基础测试。

## 4. 当前决策记录

- 当前先使用原生 HTML/CSS/JavaScript 打基础，不急于进入 React。
- 当前练习以后台管理页面为主，便于与 Java 后端业务场景连接。
- 当前已从本地数组和模拟 Promise 过渡到 `fetch('/users.json')`，后续再切换到真实 Spring Boot API。
- 对动态文本渲染，优先使用 `textContent`；如必须使用 `innerHTML`，需要转义或清洗。
- 删除等危险操作需要确认。
- 真实 React 阶段会优先采用不可变数据更新方式，如 `filter` 生成新数组。

## 5. 当前进度与下一步

四阶段计划已全部覆盖并收官：

```text
第一阶段 Web 基础         ✓  week-01
第二阶段 TypeScript 工程化  ✓  week-02
第三阶段 React 核心        ✓  并入 week-02 + user-management 项目
第四阶段 真实项目能力      ✓  week-04-1 ~ week-04-9（路由/鉴权/分页/表单抽象/单元+组件+E2E 测试/构建部署/联调）
```

已完成正式结业复盘：对照 `frontend-learning-plan.md` 第 8 节验收清单 10 个问题逐条作答并落到代码，见 `graduation-review.md`。

后续进阶方向（超出原四阶段计划）：

1. CI/CD：`npm ci && npm test && npm run build`（+E2E）接进流水线自动化。
2. 请求层再抽象：统一响应体 `{code,message,data}` 拆包 + 业务错误码集中处理。
3. 权限系统（RBAC）：角色驱动的菜单/按钮级权限、路由按权限动态生成。
4. 性能：路由级代码分割（lazy + Suspense）、请求缓存（TanStack Query）。
5. 工程质量：覆盖率门禁、可访问性（a11y）、国际化（i18n）、错误监控。
6. （已完成）接真实 Spring Boot 跑通联调最后一步：见 `backend/` + `week-04-8` §7。
