# 第一周 Web 基础学习笔记

本笔记基于 `frontend-learning-plan.md` 的第一周安排，面向有 Java 后端经验、正在系统学习前端的开发者。

## 1. 前端三层结构

前端页面可以先理解成浏览器里的三层结构：

```text
HTML        负责内容结构：页面上有什么
CSS         负责视觉表现：这些内容怎么摆、长什么样
JavaScript 负责交互逻辑：用户操作后发生什么
```

类比 Java 后端：

```text
HTML        ≈ DTO / VO / 页面结构声明
CSS         ≈ 展示规则 / 布局规则
JavaScript ≈ 运行在浏览器里的业务逻辑
浏览器       ≈ 前端运行时环境，类似 JVM 之于 Java 程序
```

## 2. 浏览器在做什么

当访问一个页面时，浏览器大致做这些事：

```text
1. 向服务器请求 HTML
2. 解析 HTML，生成 DOM 树
3. 加载 CSS，计算每个元素的样式
4. 执行 JavaScript
5. 根据 DOM + CSS 渲染页面
6. 用户点击、输入、滚动时，JavaScript 响应事件
7. 需要数据时，通过 fetch / axios 请求后端 API
```

Java 后端开发者通常熟悉这一段：

```text
浏览器 -> HTTP 请求 -> Spring Boot Controller
```

前端学习要补上的，是浏览器这一侧：

```text
HTML / CSS / JS / DOM / 事件 / 网络请求 / 渲染
```

## 3. HTML：页面结构

HTML 不是编程语言，更像结构描述语言。

一个后台首页可以拆成：

```text
layout
├── sidebar 左侧菜单
└── content 右侧内容
    ├── topbar 顶部栏
    ├── cards 数据卡片
    └── panel 表格区域
```

常见标签：

```text
div      通用容器
aside    侧边栏
main     页面主内容
header   头部区域
section  内容分区
nav      导航区域
button   按钮
a        链接
table    表格
```

HTML 的核心问题是：页面上有哪些东西，以及它们之间是什么层级关系。

类比 Java 对象结构：

```java
class AdminPage {
    Sidebar sidebar;
    Content content;
}

class Content {
    Topbar topbar;
    List<Card> cards;
    UserTable userTable;
}
```

## 4. CSS：布局和样式

CSS 负责让页面结构变成真正的界面。

后台系统最常见布局：

```text
整体布局：左侧菜单 + 右侧内容 -> flex
右侧内容：顶部导航 + 页面主体 -> flex / 普通块布局
数据卡片：一行多个卡片 -> flex
表单区域：标签 + 输入框 -> flex / grid
```

关键 CSS：

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
}

.content {
  flex: 1;
}
```

含义：

```text
display: flex  让子元素按一个方向排列，默认横向排列
width: 220px   左侧菜单固定宽度
flex: 1        右侧内容占满剩余空间
```

数据卡片横向排列：

```css
.cards {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
}
```

含义：

```text
display: flex  让卡片横向排列
gap: 16px      卡片之间间距 16px
flex: 1        每个卡片平分宽度
```

## 5. 表格：后台管理系统常见组件

表格结构：

```html
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>用户名</th>
      <th>角色</th>
      <th>状态</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>张三</td>
      <td>管理员</td>
      <td>启用</td>
    </tr>
  </tbody>
</table>
```

结构含义：

```text
table  表格
thead  表头
tbody  表格内容
tr     一行
th     表头单元格
td     普通单元格
```

类比后端：

```text
List<UserVO> -> 页面表格
每个 UserVO -> 表格中的一行 tr
每个字段    -> 一列 td
```

## 6. JavaScript：页面交互

JavaScript 让页面能够响应用户操作。

先通过 `querySelector` 找到页面元素：

```js
const keywordInput = document.querySelector('#keywordInput');
const searchButton = document.querySelector('#searchButton');
const loadButton = document.querySelector('#loadButton');
const userTableBody = document.querySelector('#userTableBody');
```

选择器含义：

```text
#loadButton   查 id="loadButton" 的元素
.keyword      查 class="keyword" 的元素
button        查 button 标签
```

绑定点击事件：

```js
loadButton.addEventListener('click', () => {
  renderUsers(users);
});
```

前端事件模型：

```text
用户操作 -> 事件触发 -> JS 函数执行 -> 页面变化
```

类比后端：

```text
后端：HTTP 请求触发 Controller 方法
前端：用户点击触发事件回调函数
```

## 7. DOM：HTML 在浏览器里的对象模型

HTML 是文本，浏览器解析后会变成 DOM 节点。

JavaScript 可以操作 DOM：

```js
const title = document.querySelector('h1');
title.textContent = '订单管理';
```

传统前端开发经常手动操作 DOM。

后面学习 React 时，会切换到另一个模型：

```text
不要手动操作 DOM，而是通过 state 描述 UI。
```

也就是：

```text
传统 JS：你手动改 DOM
React：你改状态，React 帮你改 DOM
```

## 8. 把数据渲染成页面

示例数据：

```js
const users = [
  { id: 1, name: '张三', role: '管理员', status: 'enabled' },
  { id: 2, name: '李四', role: '运营', status: 'disabled' },
  { id: 3, name: '王五', role: '客服', status: 'enabled' }
];
```

渲染函数：

```js
function renderUsers(userList) {
  if (userList.length === 0) {
    userTableBody.innerHTML = '<tr><td colspan="4">没有匹配的用户</td></tr>';
    return;
  }

  userTableBody.innerHTML = userList
    .map(user => {
      const statusText = user.status === 'enabled' ? '启用' : '禁用';
      const statusClass = user.status === 'enabled'
        ? 'status-enabled'
        : 'status-disabled';

      return `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.role}</td>
          <td class="${statusClass}">${statusText}</td>
        </tr>
      `;
    })
    .join('');
}
```

它做了三件事：

```text
1. 如果列表为空，显示“没有匹配的用户”
2. 如果有数据，把每个用户转换成一行 HTML
3. 把生成的 HTML 塞进 tbody
```

核心模式：

```text
一个 user 对象 -> 一段 tr HTML
```

## 9. 查询功能

查询按钮事件：

```js
searchButton.addEventListener('click', () => {
  const keyword = keywordInput.value.trim();

  const filteredUsers = users.filter(user => {
    return user.name.includes(keyword);
  });

  renderUsers(filteredUsers);
});
```

分解：

```js
const keyword = keywordInput.value.trim();
```

拿到输入框的值，并去掉前后空格。

```js
users.filter(user => {
  return user.name.includes(keyword);
});
```

从用户列表中过滤出名字包含关键字的用户。

最后：

```js
renderUsers(filteredUsers);
```

把过滤后的列表重新渲染到表格。

## 10. 第一个前端心智模型

这个小页面的本质是：

```text
数据 -> 生成 HTML -> 塞进页面
```

完整流程：

```text
用户点击按钮
  ↓
JavaScript 执行事件函数
  ↓
拿到数据 users
  ↓
生成表格 HTML
  ↓
更新 tbody.innerHTML
  ↓
浏览器重新显示页面
```

后面学习 React 时，同样的事情会变成：

```text
用户点击按钮
  ↓
setState 更新状态
  ↓
React 根据状态重新渲染 UI
```

这就是 React 核心模型 `UI = f(state)` 的前置基础。

## 11. 第一阶段重点

当前阶段不需要背完所有 HTML/CSS/JS 语法，重点掌握：

```text
1. HTML 如何表达页面结构
2. CSS flex 如何做左右布局和卡片横排
3. JS 如何通过 querySelector 找元素
4. addEventListener 如何绑定点击事件
5. map/filter 如何把数据变成页面内容
6. innerHTML 如何更新页面
```

配套练习文件：`index.html`。

下一步可以继续把假数据改成模拟接口请求，学习 Promise、async/await 和 fetch。

## 12. Promise、async/await 与模拟接口

在真实前端页面中，用户列表通常不是写死在页面里的，而是来自后端接口：

```text
前端页面 -> 请求 /api/users -> Spring Boot 返回 JSON -> 前端渲染表格
```

网络请求需要时间，所以前端要使用异步模型。

### 12.1 Promise 心智模型

Promise 可以理解为“未来才会有结果的对象”。

类比 Java：

```java
CompletableFuture<List<UserVO>>
```

它不是 `List<UserVO>` 本身，而是未来会得到用户列表的对象。

Promise 常见状态：

```text
pending    进行中
fulfilled  成功
rejected   失败
```

### 12.2 async/await 模板

```js
async function loadUsers() {
  try {
    const userList = await fetchUsers();
    renderUsers(userList);
  } catch (error) {
    renderMessage('加载失败，请稍后重试');
  }
}
```

含义：

```text
async       声明这是异步函数
await       等待 Promise 完成
try/catch   处理成功和失败
```

### 12.3 当前练习中的模拟 API

当前 `index.html` 使用 `fetchUsers` 模拟真实接口：

```js
function fetchUsers({ keyword = '', shouldFail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('服务器暂时不可用'));
        return;
      }

      const result = keyword
        ? users.filter(user => user.name.includes(keyword))
        : users;

      resolve(result);
    }, 800);
  });
}
```

它模拟了三种情况：

```text
fetchUsers()                         加载全部用户
fetchUsers({ keyword: '李' })         按关键字查询
fetchUsers({ shouldFail: true })      模拟接口失败
```

### 12.4 loading / empty / error 状态

后台页面至少要考虑三种接口状态：

```text
loading  请求中，例如“加载中...”
empty    请求成功但没有数据，例如“没有匹配的用户”
error    请求失败，例如“加载失败，请稍后重试”
```

当前按钮逻辑已经体现：

```js
loadButton.addEventListener('click', async () => {
  renderMessage('加载中...');

  try {
    const userList = await fetchUsers();
    renderUsers(userList);
  } catch (error) {
    renderMessage('加载失败，请稍后重试');
  }
});
```

## 13. 真实 fetch 请求模板

后续接 Spring Boot 时，模拟函数可以替换成真实 `fetch`：

```js
async function fetchUsers({ keyword = '' } = {}) {
  const params = new URLSearchParams();

  if (keyword) {
    params.set('keyword', keyword);
  }

  const response = await fetch(`/api/users?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return await response.json();
}
```

注意：

```text
fetch 只有网络错误才会自动进入 catch。
HTTP 400 / 500 默认不会自动 throw，需要手动判断 response.ok。
```

`URLSearchParams` 用于安全拼接查询参数，避免中文、空格、特殊字符导致 URL 错误。

## 14. XSS 与 innerHTML 安全风险

`innerHTML` 很方便，但如果把不可信数据直接拼进去，会有 XSS 风险。

危险写法：

```js
element.innerHTML = `<td>${user.name}</td>`;
```

如果 `user.name` 是：

```html
<img src=x onerror=alert("xss")>
```

浏览器可能会把它当成真正的 HTML 执行。

### 14.1 和 SQL 注入的类比

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

### 14.2 escapeHtml

如果必须使用 `innerHTML`，需要对动态文本做转义：

```js
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
```

### 14.3 更推荐 textContent

更安全的方式是：

```js
const cell = document.createElement('td');
cell.textContent = user.name;
```

`textContent` 会把内容当作纯文本，不会解析 HTML。

当前练习中，恶意数据会显示为文本，不会生成真实 `<img>` 或 `<button>` 节点。

## 15. 使用 DOM API 安全渲染表格

当前 `renderUsers` 已从字符串拼接升级为 DOM API：

```js
function appendCell(row, text, className = '') {
  const cell = document.createElement('td');
  cell.textContent = text;

  if (className) {
    cell.className = className;
  }

  row.appendChild(cell);
}
```

渲染用户列表：

```js
function renderUsers(userList) {
  if (userList.length === 0) {
    renderMessage('没有匹配的用户');
    return;
  }

  userTableBody.innerHTML = '';

  userList.forEach(user => {
    const row = document.createElement('tr');
    const statusText = user.status === 'enabled' ? '启用' : '禁用';
    const statusClass = user.status === 'enabled'
      ? 'status-enabled'
      : 'status-disabled';

    appendCell(row, user.id);
    appendCell(row, user.name);
    appendCell(row, user.role);
    appendCell(row, statusText, statusClass);
    appendActionCell(row, user);

    userTableBody.appendChild(row);
  });
}
```

优势：

```text
textContent 默认安全
结构清晰
不容易忘记转义动态文本
```

## 16. 表单输入与基础校验

后台管理页面常见操作包括新增和编辑，核心都离不开表单。

当前表单字段：

```text
用户名 input
角色 input
状态 select
```

读取表单值：

```js
const name = nameInput.value.trim();
const role = roleInput.value.trim();
const status = statusSelect.value;
```

基础校验：

```js
if (!name) {
  renderFormMessage('用户名不能为空');
  return;
}

if (!role) {
  renderFormMessage('角色不能为空');
  return;
}
```

要点：

```text
input / select 读取值使用 .value
trim() 用于去掉前后空格
校验失败后 return，避免继续执行新增或保存逻辑
提示信息用 textContent 更安全
```

## 17. CRUD：新增、查询、编辑、删除、启用禁用

当前练习页面已经形成一个最小用户管理 CRUD。

### 17.1 查询用户

```text
读取 keyword
调用 fetchUsers({ keyword })
渲染返回结果
```

### 17.2 新增用户

流程：

```text
点击新增用户
  -> 读取 name / role / status
  -> 校验非空
  -> 生成 nextId
  -> users.push(newUser)
  -> renderUsers(users)
  -> 清空表单
  -> 显示新增成功
```

### 17.3 编辑用户

新增状态：

```js
let editingUserId = null;
```

含义：

```text
editingUserId === null      新增模式
editingUserId !== null      编辑模式
```

进入编辑模式：

```js
function enterEditMode(user) {
  editingUserId = user.id;
  nameInput.value = user.name;
  roleInput.value = user.role;
  statusSelect.value = user.status;
  addButton.textContent = '保存修改';
  cancelEditButton.hidden = false;
  renderFormMessage(`正在编辑用户：${user.name}`, 'success');
}
```

回到新增模式：

```js
function enterCreateMode() {
  editingUserId = null;
  addButton.textContent = '新增用户';
  cancelEditButton.hidden = true;
  clearUserForm();
}
```

核心心智模型：

```text
新增：没有当前用户 id，创建新记录
编辑：有当前用户 id，修改已有记录
```

### 17.4 删除用户

流程：

```text
点击删除
  -> find 找到用户
  -> window.confirm 确认
  -> findIndex 找到下标
  -> splice 删除数组元素
  -> renderUsers(users)
  -> 显示删除成功
```

关键数组方法：

```text
find       找到符合条件的元素
findIndex  找到符合条件元素的下标
splice     修改原数组，删除指定位置元素
filter     返回新数组，React 中更常用
```

### 17.5 启用 / 禁用用户

状态切换：

```js
user.status = user.status === 'enabled' ? 'disabled' : 'enabled';
renderUsers(users);
```

UI 变化：

```text
状态文本：启用 <-> 禁用
状态颜色：绿色 <-> 红色
按钮文案：禁用 <-> 启用
```

关键心智模型：

```text
状态变化 -> 重新渲染 -> UI 变化
```

## 18. 当前 index.html 的代码分层

虽然当前还是单文件，但已经可以按职责分层理解。

### 18.1 数据状态层

```js
const users = [...];
let editingUserId = null;
```

含义：

```text
users          决定表格显示什么
editingUserId  决定表单是新增模式还是编辑模式
```

### 18.2 DOM 引用层

```js
const nameInput = document.querySelector('#nameInput');
const addButton = document.querySelector('#addButton');
const userTableBody = document.querySelector('#userTableBody');
```

作用：把 HTML 元素变成 JS 可操作的对象。

### 18.3 API 模拟层

```js
fetchUsers({ keyword, shouldFail })
```

作用：模拟真实后端接口。

### 18.4 表单状态层

```js
clearUserForm()
enterCreateMode()
enterEditMode(user)
```

作用：管理新增/编辑表单状态。

### 18.5 渲染层

```js
renderMessage()
renderFormMessage()
appendCell()
appendActionCell()
renderUsers()
```

作用：把数据渲染到页面。

### 18.6 事件处理层

```js
addButton.addEventListener(...)
searchButton.addEventListener(...)
loadButton.addEventListener(...)
```

作用：响应用户操作。

## 19. 当前阶段已掌握能力

对照第一周目标，当前已经覆盖：

```text
HTML：页面结构、表单、表格、按钮、输入框、下拉框
CSS：Flex、Grid、盒模型、定位、响应式、卡片、表格、按钮、状态样式
JavaScript：变量、函数、数组、对象、事件、DOM、Promise、async/await、fetch
浏览器：DOM、事件、渲染、DevTools、Network 预览验证
安全：XSS 风险、escapeHtml、textContent
业务：查询、新增、编辑、删除、启用/禁用
状态：loading、empty、error、success、editingUserId
联调认知：response.ok、HTTP 状态码、users.json、本地静态资源请求、Spring Boot REST API 对应关系
```

当前结论：第一阶段计划内容已覆盖完成，且已完成正式验收复盘，可以进入第二阶段 TypeScript 与工程化。

## 20. 第一阶段阶段性总结

当前这一轮原生 HTML / CSS / JavaScript 练习，已经把一个最小用户管理后台需要的核心知识串起来了：

```text
页面结构 -> CSS 布局 -> DOM 操作 -> 事件处理 -> 异步请求 -> 状态管理 -> 安全渲染
```

这意味着你已经不再只是“会写一个静态页面”，而是已经开始具备：

```text
看懂一个基础管理页
修改一个基础管理页
排查一个基础接口请求问题
理解为什么页面会随着数据变化而更新
```

接下来的重点不再是继续堆原生 JS 功能，而是进入第二阶段，把这些能力迁移到 TypeScript 和工程化项目结构中。

## 21. 第一阶段正式验收结论

第一阶段正式验收后，可以确认当前已经具备以下核心能力：

```text
能区分 HTML / CSS / JavaScript 的职责
能理解 DOM 与 querySelector 的作用
能说清楚点击按钮 -> fetch -> 数据 -> renderUsers -> 页面更新 的基本链路
能理解 loading / empty / error / success 的页面状态意义
能理解 textContent 与 innerHTML 的安全差异，以及 XSS 风险
能按数据状态层、DOM 引用层、渲染层、事件处理层理解当前单文件页面结构
```

当前验收结论：

```text
第一阶段通过，可以进入第二阶段 TypeScript 与工程化。
```

需要继续加强的点：

```text
把“接口请求到页面更新”的完整链路说得更完整
更准确地区分原生 DOM 编程和 React 状态驱动渲染
```

## 22. 真实 fetch 请求与 users.json

此前 `fetchUsers` 是用 `Promise + setTimeout` 模拟接口延迟：

```js
function fetchUsers() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(users);
    }, 800);
  });
}
```

现在改成真正的浏览器网络请求：

```js
async function fetchUsers({ keyword = '', shouldFail = false } = {}) {
  const url = shouldFail ? '/missing-users.json' : '/users.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }

  const remoteUsers = await response.json();

  if (users.length === 0) {
    users = remoteUsers;
  }

  return keyword
    ? users.filter(user => user.name.includes(keyword))
    : users;
}
```

### 21.1 users.json

`users.json` 可以先理解成“假的后端接口返回值”：

```json
[
  {
    "id": 1,
    "name": "张三",
    "role": "管理员",
    "status": "enabled"
  }
]
```

浏览器请求流程：

```text
点击加载用户
  -> 调用 fetchUsers()
  -> fetch('/users.json')
  -> 浏览器发起 HTTP 请求
  -> 本地静态服务器返回 JSON 文件
  -> response.json() 把 JSON 文本转成 JS 数组
  -> renderUsers(userList) 渲染表格
```

### 21.2 response.ok 和状态码

```js
if (!response.ok) {
  throw new Error(`请求失败，状态码：${response.status}`);
}
```

含义：

```text
response.ok === true   状态码在 200-299 范围内
response.ok === false  例如 404、500 等错误状态码
```

常见状态码：

```text
200 OK                  请求成功
404 Not Found           资源不存在
500 Internal Server Error 服务器内部错误
```

当前“模拟失败”按钮会请求：

```js
/missing-users.json
```

因为这个文件不存在，所以 Network 面板里可以看到 404，请求会进入 `catch`，页面显示“加载失败，请稍后重试”。

### 21.3 和 Spring Boot Controller 的对应关系

当前本地 JSON：

```js
fetch('/users.json')
```

后续接 Spring Boot 时会变成：

```js
fetch('/api/users')
```

后端可能是：

```java
@GetMapping("/api/users")
public List<UserVO> listUsers() {
    return userService.listUsers();
}
```

对应关系：

```text
前端 fetch('/api/users')
        ↓
HTTP GET /api/users
        ↓
Spring Boot @GetMapping("/api/users")
        ↓
返回 JSON
        ↓
前端 response.json()
        ↓
渲染页面
```

### 21.4 Network 面板观察点

打开浏览器 DevTools 的 Network 面板后，点击“加载用户”，重点看：

```text
Name：users.json
Status：200
Type：fetch / json
Response：返回的用户 JSON 数组
```

点击“模拟失败”，重点看：

```text
Name：missing-users.json
Status：404
Response：文件不存在相关响应
```

这一步的目标不是写复杂代码，而是建立一个核心认知：

```text
fetch 不是魔法，它就是浏览器帮你发 HTTP 请求。
```

## 23. 浏览器 DevTools 实操

DevTools 可以理解成浏览器里的“调试器 + 日志系统 + 网络抓包工具”。

对 Java 后端开发者来说，可以这样类比：

```text
Elements   ≈ 查看运行时页面结构，类似看对象当前状态
Console    ≈ 浏览器里的日志和 REPL，类似 Java 控制台 + JS 临时执行窗口
Network    ≈ 浏览器抓包工具，类似看 HTTP 请求日志、Postman、网关日志
```

### 22.1 Elements 面板

Elements 用来看页面最终生成出来的 DOM 和 CSS。

当前页面可以重点观察：

```text
<body>
  <div class="layout">
    <aside class="sidebar">...</aside>
    <main class="content">...</main>
  </div>
</body>
```

要看的内容：

```text
DOM 树：浏览器最终解析出来的 HTML 结构
Styles：当前元素命中了哪些 CSS 规则
Computed：最终计算出来的样式
Box Model：margin / border / padding / content
```

盒模型可以记成：

```text
margin   外边距：元素和外部其他元素之间的距离
border   边框
padding  内边距：内容和边框之间的距离
content  内容区域
```

后台页面里最常见的调试问题：

```text
为什么元素没有对齐？      看 display / flex / gap / width
为什么间距不对？          看 margin / padding
为什么样式没生效？        看选择器是否命中、是否被覆盖
为什么按钮位置奇怪？      看父元素布局和盒模型
```

### 22.2 Console 面板

Console 有两个用途：

```text
1. 查看 JS 报错和 console.log 日志
2. 临时执行 JS 表达式
```

例如在当前页面可以执行：

```js
document.querySelector('#userTableBody')
```

含义：查看表格 body 元素。

也可以执行：

```js
document.querySelectorAll('tbody tr').length
```

含义：查看当前表格有几行。

如果点击“加载用户”后表格没有显示，可以用 Console 判断：

```text
是否有红色报错？
fetchUsers 有没有执行？
DOM 元素选择器是否写错？
数据是不是数组？
```

### 22.3 Network 面板

Network 是前后端联调最重要的面板。

当前页面有两个典型请求：

```text
GET /users.json              成功，状态码 200
GET /missing-users.json      失败，状态码 404
```

点击某条请求后，重点看：

```text
Headers：请求 URL、请求方法、状态码、响应头
Preview：浏览器帮你格式化后的响应内容
Response：原始响应内容
Timing：请求耗时
```

对于真实接口，Network 面板可以回答这些问题：

```text
请求到底有没有发出去？
请求 URL 对不对？
HTTP method 对不对？
状态码是多少？
请求参数有没有带上？
请求体 JSON 对不对？
后端返回了什么？
是前端解析错了，还是后端返回错了？
```

### 22.4 一个真实排查流程

如果页面显示“加载失败，请稍后重试”，不要先猜代码，按顺序排查：

```text
1. 打开 Console，看有没有红色 JS 报错。
2. 打开 Network，看请求是否发出。
3. 看请求 URL 是否正确。
4. 看状态码：200 / 404 / 500 / CORS error。
5. 看 Response，确认后端到底返回了什么。
6. 回到代码里检查 fetch、response.ok、response.json 和 catch。
```

这就是前端排查接口问题的基本路径。

## 24. Spring Boot REST API 对接方式

当前我们请求的是本地静态文件：

```js
fetch('/users.json')
```

后续对接 Spring Boot 时，通常会变成请求后端接口：

```js
fetch('/api/users')
```

或者：

```js
fetch('http://localhost:8080/api/users')
```

### 23.1 GET：查询列表

前端：

```js
async function fetchUsers() {
  const response = await fetch('/api/users');

  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }

  return response.json();
}
```

后端：

```java
@GetMapping("/api/users")
public List<UserVO> listUsers() {
    return userService.listUsers();
}
```

对应关系：

```text
fetch('/api/users')
  -> GET /api/users
  -> @GetMapping("/api/users")
  -> 返回 List<UserVO>
  -> 浏览器收到 JSON 数组
```

### 23.2 POST：新增用户

前端：

```js
async function createUser(payload) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }

  return response.json();
}
```

调用时：

```js
createUser({
  name: '赵六',
  role: '运营',
  status: 'enabled'
});
```

后端：

```java
@PostMapping("/api/users")
public UserVO createUser(@RequestBody CreateUserRequest request) {
    return userService.createUser(request);
}
```

关键点：

```text
headers['Content-Type'] = 'application/json'  告诉后端请求体是 JSON
JSON.stringify(payload)                       把 JS 对象转成 JSON 字符串
@RequestBody                                  Spring Boot 从请求体解析 JSON
```

### 23.3 PUT：编辑用户

前端：

```js
async function updateUser(id, payload) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }

  return response.json();
}
```

后端：

```java
@PutMapping("/api/users/{id}")
public UserVO updateUser(
        @PathVariable Long id,
        @RequestBody UpdateUserRequest request) {
    return userService.updateUser(id, request);
}
```

对应关系：

```text
/api/users/1              -> @PathVariable Long id
JSON body                 -> @RequestBody UpdateUserRequest request
```

### 23.4 DELETE：删除用户

前端：

```js
async function deleteUserApi(id) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }
}
```

后端：

```java
@DeleteMapping("/api/users/{id}")
public void deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
}
```

### 23.5 前端 API 函数和后端 Controller 的映射

```text
前端函数              HTTP 请求                 Spring Boot
fetchUsers()          GET /api/users            @GetMapping
createUser(payload)   POST /api/users           @PostMapping + @RequestBody
updateUser(id, data)  PUT /api/users/{id}       @PutMapping + @PathVariable + @RequestBody
deleteUserApi(id)     DELETE /api/users/{id}    @DeleteMapping + @PathVariable
```

### 23.6 CORS 是什么

如果前端页面地址是：

```text
http://localhost:8000
```

后端接口地址是：

```text
http://localhost:8080
```

它们协议、域名或端口不同，就属于跨域：

```text
localhost:8000  ->  localhost:8080
```

浏览器会检查后端是否允许这个来源访问。

如果后端没允许，前端 Console 里会看到 CORS 报错。

注意：

```text
CORS 是浏览器安全策略，不是 JavaScript 语法错误。
Postman 能请求成功，不代表浏览器就一定能请求成功。
```

后端临时允许方式可能是：

```java
@CrossOrigin(origins = "http://localhost:8000")
```

真实项目更常用统一 CORS 配置或前端开发代理。

### 23.7 本地开发代理

真实前端项目中，常见做法是让前端开发服务器代理后端请求。

前端代码仍然写：

```js
fetch('/api/users')
```

Vite 开发服务器把 `/api` 转发到：

```text
http://localhost:8080
```

这样浏览器看到的是同源请求，开发体验更好。

后续进入 Vite 阶段会正式配置：

```js
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

## 25. CSS 补强：盒模型、Grid、定位、响应式

这一节不是追求设计感，而是掌握后台页面开发中最常遇到的布局问题。

核心能力：

```text
盒模型：元素到底占多大、为什么间距不对
Grid：二维布局，适合表单、卡片区、仪表盘布局
定位 position：元素如何固定、覆盖、悬浮
响应式：窗口变窄时页面怎么自适应
```

### 24.1 盒模型

一个元素从内到外由四层组成：

```text
content  内容区域
padding  内边距：内容和边框之间的距离
border   边框
margin   外边距：元素和其他元素之间的距离
```

默认情况下，元素实际占用宽度可能是：

```text
content width
+ padding-left + padding-right
+ border-left + border-right
+ margin-left + margin-right
```

现代页面通常会设置：

```css
* {
  box-sizing: border-box;
}
```

含义：

```text
width 包含 content + padding + border
```

这样更符合直觉。例如：

```css
.card {
  width: 200px;
  padding: 16px;
  border: 1px solid #ddd;
  box-sizing: border-box;
}
```

最终卡片宽度仍然是 `200px`，不会变成 `200 + 16 * 2 + 1 * 2`。

后台页面常见排查：

```text
表单为什么撑破容器？       看 width + padding + box-sizing
卡片之间为什么太挤？       看 gap / margin
按钮文字为什么贴边？       看 padding
表格为什么看起来拥挤？     看 th / td padding
```

### 24.2 Flex 与 Grid 的区别

Flex 更适合一维布局：

```text
横向排列按钮
横向排列卡片
左侧菜单 + 右侧内容
```

Grid 更适合二维布局：

```text
表单字段两列或多列排列
仪表盘卡片区
复杂页面区域划分
```

当前页面的新增用户表单适合 Grid：

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 12px;
}
```

含义：

```text
repeat(3, 1fr)   三列，每列平分剩余空间
auto             最后一列按按钮内容宽度占位
gap              行列之间的间距
```

可以把 Grid 理解成二维表格：

```text
第 1 列：用户名
第 2 列：角色
第 3 列：状态
第 4 列：按钮
```

常见 Grid 写法：

```css
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

表示三列等宽卡片。

### 24.3 position 定位

常见定位值：

```text
static    默认布局，正常文档流
relative  相对自己原来的位置偏移
absolute  相对最近的定位祖先定位
fixed     相对浏览器窗口固定
sticky    滚动到某个位置后吸住
```

后台系统常见用途：

```text
sticky    顶部栏吸顶
fixed     固定右下角帮助按钮 / 返回顶部按钮
absolute  下拉菜单、气泡提示、浮层
```

例如顶部栏吸顶：

```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

含义：

```text
position: sticky  滚动到指定位置后吸住
top: 0            吸在距离视口顶部 0 的位置
z-index: 10       层级更高，避免被普通内容盖住
```

`z-index` 可以理解成图层顺序：

```text
数字越大，越靠上
只有在定位元素等特定情况下才明显生效
```

### 24.4 响应式布局

响应式的目标：窗口变窄时页面不要崩。

核心写法是媒体查询：

```css
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

含义：

```text
当屏幕宽度 <= 768px 时：
- 左右布局改成上下布局
- 表单从多列变成单列
```

后台系统虽然主要面向 PC，但响应式仍然有价值：

```text
开发时浏览器窗口可能不是全屏
用户可能使用小屏笔记本
管理后台可能在平板上查看
```

### 24.5 CSS 这一阶段的核心总结

```text
盒模型：解释元素为什么占这么大
Flex：解决一维排列
Grid：解决二维排列
position：解决脱离普通流的特殊位置
响应式：解决不同屏幕宽度下的布局变化
```

第一阶段不要求记住所有 CSS 属性，但要能做到：

```text
看到布局问题时，知道应该去 DevTools 里看盒模型、display、grid/flex、position 和媒体查询。
```

## 21. 当前学习进度复盘

到目前为止，`index.html` 已经不只是静态页面，而是一个小型原生 JavaScript 用户管理练习。

当前页面已经覆盖：

```text
查：加载全部用户、按用户名查询
增：新增用户并做基础表单校验
改：编辑用户、保存修改、取消编辑
删：删除前确认，删除后重新渲染
状态：启用 / 禁用用户
异步：模拟接口延迟、loading、error
安全：XSS 测试数据、escapeHtml、textContent
```

这意味着第一阶段的 CRUD 主线已经完成。

如果用后端开发的视角看，现在页面里已经有几层职责：

```text
users / editingUserId        类似内存中的数据状态
fetchUsers                   类似 API / Service 层
renderUsers                  类似把 VO 转成页面展示
enterEditMode / enterCreateMode  类似表单状态管理
addEventListener             类似 Controller 入口，只不过入口是用户点击事件
```

最重要的心智模型仍然是：

```text
用户操作 -> 修改数据或状态 -> 重新渲染页面 -> UI 变化
```

这个模型后面进入 React 时会变成：

```text
用户操作 -> setState -> React 根据 state 自动重新渲染
```

所以当前阶段不是在学“过时写法”，而是在理解 React 背后的底层问题：

```text
页面结构从哪里来？
事件怎么触发？
数据如何变成 UI？
状态变化后为什么要重新渲染？
为什么直接拼 innerHTML 有安全风险？
为什么 React 想让我们少手动操作 DOM？
```

## 22. 下一节建议：DevTools 与真实 fetch

下一节建议从浏览器开发者工具开始，而不是立刻进入 React。

重点练习顺序：

```text
1. Elements
   - 查看 HTML 被浏览器解析后的 DOM 树
   - 查看某个按钮、输入框、表格行对应的 CSS
   - 理解盒模型中的 content / padding / border / margin

2. Console
   - 直接执行 document.querySelector(...)
   - 查看 users、editingUserId 等变量
   - 故意制造一个错误，观察报错位置和调用栈

3. Network
   - 创建 users.json
   - 使用 fetch('/users.json') 请求本地 JSON
   - 查看请求 URL、状态码、响应头、响应体
```

对应的下一步代码目标是：

```text
把现在的 setTimeout 模拟接口
  ↓
改成真正从 users.json 读取数据
```

这样就可以把“前端页面”和“后端接口”的边界讲清楚：

```text
前端关心：什么时候发请求、怎么处理 loading/error/data、怎么渲染页面
后端关心：返回什么 URL、什么状态码、什么 JSON 结构
```

这也是后面 Spring Boot REST API 联调的前置基础。
