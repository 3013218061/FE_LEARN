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

第一阶段 Web 基础：进行中，完成度较高。

已具备的页面能力：

- 基础布局。
- 表格展示。
- 查询。
- 新增。
- 删除。
- 模拟接口请求。
- loading / empty / error。
- 表单校验。
- XSS 防护。

仍需补齐：

- 编辑用户。
- 启用/禁用用户。
- 浏览器 DevTools 系统练习。
- 真实 `fetch` 请求模板。
- Network 面板观察请求。
- CSS Grid、定位、响应式。
- 第一阶段验收复盘。

### 6. 下一步建议

建议下一次继续按以下顺序推进：

1. 在 `index.html` 中实现“编辑用户”功能。
   - 增加 `editingUserId` 状态。
   - 新增按钮根据状态变成“新增用户 / 保存修改”。
   - 点击编辑时，将当前用户数据回填到表单。
   - 保存后更新数组并重新渲染。

2. 实现“启用/禁用用户”功能。
   - 操作列增加状态切换按钮。
   - 点击后修改 `status`。
   - 重新渲染表格。

3. 对当前页面做一次代码结构复盘。
   - 数据层。
   - API 层。
   - 渲染层。
   - 表单层。
   - 事件层。

4. 开始浏览器开发者工具练习。
   - Elements：看 DOM 与 CSS。
   - Console：看日志与错误。
   - Network：为后续真实 fetch 做准备。

5. 更新 `week-01-web-basics-notes.md`。
   - 补充异步请求、XSS、DOM API、新增/删除功能笔记。

### 7. 风险与注意事项

- 当前 `index.html` 仍是教学用单文件结构，后续功能继续增加会变得臃肿，应在进入 TypeScript/Vite 阶段拆分文件。
- 当前模拟数据中包含 XSS 测试数据，教学时有价值；如果作为正式 demo 展示，需要说明其用途。
- 当前删除使用 `splice` 直接修改数组，适合原生 JS 练习；进入 React 后应改用不可变更新。
- 当前 `.claude/launch.json` 是本地预览配置，不一定需要进入正式学习成果提交。
