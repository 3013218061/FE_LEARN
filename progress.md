# 前端学习会话日志与进度记录

本文档用于记录每次学习会话完成的内容、文件变化、验证结果和下一步计划。

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
