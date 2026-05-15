# 前端学习会话日志与进度记录

本文档用于记录每次学习会话完成的内容、文件变化、验证结果和下一步计划。

## 2026-05-15 会话记录

### 1. 本次目标

基于 `frontend-learning-plan.md`，开始第一周 Web 基础学习，并将讲解内容落到实际代码与学习笔记中。

### 2. 已创建/更新的文件

- `frontend-learning-plan.md`：原始系统学习计划。
- `index.html`：第一周 Web 基础后台管理页面练习。
- `week-01-web-basics-notes.md`：第一周 Web 基础学习笔记。
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

第一阶段 Web 基础：进行中，CRUD 主线已经完成，正在进入第一阶段收尾。

已具备的页面能力：

- 基础布局。
- 表格展示。
- 查询。
- 新增。
- 编辑。
- 删除。
- 启用 / 禁用状态切换。
- 模拟接口请求。
- loading / empty / error / success 状态。
- 表单校验。
- 新增 / 编辑表单复用。
- XSS 防护。
- 使用 DOM API 安全渲染用户输入和接口数据。

仍需补齐：

- 浏览器 DevTools 系统练习。
- 创建 `users.json` 并改造真实 `fetch` 请求。
- Network 面板观察请求、状态码和 JSON 响应。
- CSS 盒模型、定位、响应式。
- 第一阶段验收复盘。

### 6. 下一步建议

建议下一次继续按以下顺序推进：

1. 开始浏览器开发者工具练习。
   - Elements：查看 DOM 层级、CSS 样式来源、盒模型。
   - Console：执行 JS、查看变量、观察报错。
   - Network：观察请求 URL、状态码、响应头、响应体。

2. 创建 `users.json` 并改造加载逻辑。
   - 将当前 `fetchUsers` 从 `setTimeout` 模拟改成真实 `fetch('/users.json')`。
   - 用 Network 面板观察 JSON 文件请求。
   - 讲清楚 `response.ok`、`response.json()` 和 HTTP 状态码。

3. 补齐 CSS 基础细节。
   - 盒模型：content、padding、border、margin。
   - 定位：static、relative、absolute、fixed、sticky。
   - 响应式：媒体查询、窄屏布局调整。

4. 做第一阶段验收复盘。
   - 能否独立写出后台页面结构。
   - 能否解释数据如何渲染成表格。
   - 能否解释一次点击事件如何改变 UI。
   - 能否说明传统 DOM 写法和后续 React 状态驱动模型的关系。

### 7. 风险与注意事项

- 当前 `index.html` 仍是教学用单文件结构，后续功能继续增加会变得臃肿，应在进入 TypeScript/Vite 阶段拆分文件。
- 当前模拟数据中包含 XSS 测试数据，教学时有价值；如果作为正式 demo 展示，需要说明其用途。
- 当前删除使用 `splice` 直接修改数组，适合原生 JS 练习；进入 React 后应改用不可变更新。
- 当前 `.claude/launch.json` 是本地预览配置，不一定需要进入正式学习成果提交。
