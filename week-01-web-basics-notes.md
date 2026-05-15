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
CSS：Flex、Grid、卡片、表格、按钮、状态样式
JavaScript：变量、函数、数组、对象、事件、DOM、Promise、async/await
浏览器：DOM、事件、渲染、预览验证
安全：XSS 风险、escapeHtml、textContent
业务：查询、新增、编辑、删除、启用/禁用
状态：loading、empty、error、success、editingUserId
```

待补齐：

```text
CSS 盒模型、定位、响应式
DevTools Elements / Console / Network 系统练习
真实 fetch 请求与 users.json / Spring Boot API 联调
第一阶段验收复盘
```

## 20. 下一步学习建议

建议下一步进入浏览器开发者工具练习：

```text
Elements：查看 DOM 结构和 CSS 样式
Console：执行 JS、查看变量和错误
Network：观察真实 fetch 请求、状态码和响应 JSON
```

为了练习 Network，可以创建 `users.json`，然后将“加载用户”改成真正的：

```js
const response = await fetch('/users.json');
const users = await response.json();
```

这样就能把以下知识串起来：

```text
fetch
HTTP 状态码
JSON 响应
response.json()
Network 面板
Spring Boot API 联调基础
```
