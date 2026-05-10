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
