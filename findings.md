# 前端学习研究发现与课程要点

本文档用于记录学习过程中的发现、解释、类比、风险点和可复用心智模型。

## 1. 学习对象画像

学习者具备 Java 后端经验，适合通过后端类比理解前端：

- HTML 类似页面结构声明或对象结构。
- CSS 类似展示层规则，负责布局和视觉表现。
- JavaScript 类似运行在浏览器中的业务逻辑层。
- 浏览器可以理解为前端运行时环境，类似 JVM 之于 Java 程序。
- 前端接口调用可以类比 Java 后端调用外部服务或 Controller 与 Service 的分层。

## 2. 第一阶段核心心智模型

### 2.1 前端三层结构

```text
HTML        负责内容结构：页面上有什么
CSS         负责视觉表现：内容如何排布、长什么样
JavaScript 负责交互逻辑：用户操作后发生什么
```

### 2.2 浏览器执行流程

```text
请求 HTML
  -> 解析 HTML 生成 DOM 树
  -> 加载 CSS 并计算样式
  -> 执行 JavaScript
  -> 根据 DOM + CSS 渲染页面
  -> 用户操作触发事件
  -> JavaScript 响应事件并更新页面或请求接口
```

### 2.3 传统 DOM 编程模型

```text
数据
  -> 生成 DOM 或 HTML
  -> 放进页面
  -> 浏览器重新显示
```

当前练习已经从 `innerHTML` 字符串拼接，升级到 `document.createElement` + `textContent` 的 DOM API 写法。

### 2.4 异步请求模型

```text
用户操作
  -> 事件函数
  -> 调用 API 函数
  -> 等待 Promise
  -> 成功 / 失败 / 空数据
  -> 渲染页面
```

当前通过 `fetchUsers({ keyword, shouldFail })` 模拟真实接口函数。

### 2.5 后续 React 迁移模型

当前传统 DOM：

```text
修改数据 -> 手动 renderUsers
```

React 中：

```text
setState / setUsers -> React 自动重新渲染
```

即：

```text
UI = f(state)
```

## 3. 当前已讲课程要点

### 3.1 HTML

已覆盖：

- `div`：通用容器。
- `aside`：侧边栏。
- `main`：主内容。
- `header`：头部区域。
- `section`：内容分区。
- `nav`：导航区域。
- `button`：按钮。
- `input`：输入框。
- `select` / `option`：下拉选择。
- `table` / `thead` / `tbody` / `tr` / `th` / `td`：表格结构。

后台页面结构已经实践：

```text
layout
├── sidebar 左侧菜单
└── content 右侧内容
    ├── topbar 顶部栏
    ├── cards 数据卡片
    └── panel 表单、查询、表格区域
```

### 3.2 CSS

已覆盖：

- `display: flex` 实现左右布局与卡片横排。
- `flex: 1` 实现右侧内容占满剩余空间。
- `gap` 设置元素间距。
- `padding`、`margin`、`border-radius`、`box-shadow` 控制常见视觉样式。
- `display: grid` 用于新增用户表单布局。
- 表格、按钮、状态文本的基础样式。

待补充：

- CSS Grid 更系统的二维布局。
- 定位 `position`。
- 响应式布局与媒体查询。
- 盒模型细节。

### 3.3 JavaScript 基础

已覆盖：

- `const` 定义变量。
- 数组对象表示用户列表。
- `querySelector` 获取 DOM 元素。
- `addEventListener` 绑定事件。
- `map`、`filter`、`find`、`findIndex`、`splice` 等数组方法。
- `Promise` 和 `setTimeout` 模拟接口延迟。
- `async/await` 编写异步逻辑。
- `try/catch` 处理失败。
- `trim` 处理表单输入。
- `Math.max(...array)` 生成本地递增 ID。

### 3.4 DOM 与渲染

已覆盖两种方式：

1. `innerHTML` 拼接字符串。
2. `document.createElement` + `textContent` 创建节点。

结论：

- `innerHTML` 适合快速 demo，但动态内容需要转义。
- `textContent` 会将内容当成纯文本，更适合渲染用户输入和接口数据。
- 当前表格渲染已使用 DOM API，减少 XSS 风险。

### 3.5 异步与接口状态

当前已经实践：

- loading：加载中、查询中。
- empty：没有匹配的用户。
- error：加载失败、查询失败。
- success：新增用户成功、删除用户成功。

真实项目应扩展为：

```text
API 层：请求接口、处理 HTTP 状态码、返回 JSON 或抛错
页面层：维护 loading / error / data 状态
渲染层：根据状态显示对应 UI
```

### 3.6 表单与校验

当前新增用户表单已覆盖：

- 读取 `input.value`。
- 读取 `select.value`。
- 使用 `trim()` 清理输入。
- 校验用户名不能为空。
- 校验角色不能为空。
- 校验失败后 `return` 阻止继续执行。
- 新增成功后清空表单。
- 使用 `textContent` 显示表单提示。

后续编辑功能会引入表单复用。

### 3.7 删除功能

当前删除功能已覆盖：

- 操作列。
- 动态创建删除按钮。
- 每行按钮绑定当前用户 ID。
- 删除前 `window.confirm` 确认。
- 使用 `find` 查找用户。
- 使用 `findIndex` 查找下标。
- 使用 `splice` 修改数组。
- 删除后重新渲染。

后续 React 中应更多使用：

```js
users.filter(user => user.id !== userId)
```

来生成新数组。

## 4. 安全发现：XSS

### 4.1 风险来源

如果将不可信数据直接拼入 `innerHTML`：

```js
element.innerHTML = `<td>${user.name}</td>`;
```

当 `user.name` 包含恶意 HTML/JS 时，浏览器可能将其解析执行。

### 4.2 类比 Java 后端

SQL 注入：

```java
String sql = "select * from user where name = '" + name + "'";
```

XSS：

```js
element.innerHTML = `<td>${user.name}</td>`;
```

共同问题：

```text
把不可信输入直接拼进了可执行上下文。
```

### 4.3 当前防护

已实践：

- `escapeHtml`：对 `& < > " '` 做 HTML 转义。
- `textContent`：将动态内容作为纯文本插入。
- `className` 使用白名单逻辑生成，不直接使用后端任意字符串。

当前验证结果：

- 恶意 `<img>` 没有生成真实图片节点。
- 恶意 `<button>` 没有生成真实按钮节点。
- 恶意内容作为文本显示。

## 5. 工程化发现

当前仍是单文件 `index.html`，适合第一阶段学习。

随着功能增加，已经出现拆分需求：

- 数据层：`users`、`fetchUsers`、后续 `createUserApi`、`deleteUserApi`。
- 渲染层：`renderUsers`、`renderMessage`、`appendCell`、`appendActionCell`。
- 表单层：读取输入、校验、清空、显示消息。
- 事件层：新增、查询、加载、删除按钮事件。

这为后续迁移到 TypeScript 和 React 提供了天然边界。

## 6. 后续重点发现问题

需要继续补齐：

- 编辑用户功能需要考虑“当前正在编辑谁”的状态。
- 新增和编辑表单应复用，但提交逻辑不同。
- 启用/禁用功能需要理解状态切换。
- 真实接口需要学习 `fetch`、HTTP 状态码、JSON、错误处理、跨域。
- 浏览器开发者工具需要系统训练，尤其是 Console 与 Network。
- 进入 React 前，应明确传统 DOM 的痛点：手动 DOM 更新、状态分散、事件绑定复杂。
