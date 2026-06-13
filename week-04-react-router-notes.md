# 第四阶段（一）：React Router 前端路由学习笔记

本笔记对应 `frontend-learning-plan.md` 第四阶段第一项「React Router 路由管理」，记录把 `user-management/` 从「单页」重构成「带路由的多页面」的全过程。

## 1. 要解决的问题：前端路由和后端路由不是一回事

后端开发者最熟悉的"路由"是这样的：

```text
浏览器请求 GET /users
  -> 服务器匹配 @GetMapping("/users")
  -> Controller 方法返回一整个页面/数据
  -> 浏览器整页加载
```

每个 URL = 一次服务器往返 = 一次整页刷新。

而现代后台管理系统是 SPA（单页应用），路由发生在**浏览器内部**：

```text
点击"用户详情"
  -> URL 从 /users 变成 /users/1
  -> 但浏览器不向服务器要新页面
  -> React Router 在前端把 URL 映射到对应组件，局部重渲染
  -> 页面不刷新，内存状态（登录信息、表单输入）都还在
```

一句话对比：

```text
后端路由：URL -> Controller 方法 -> 整页刷新
前端路由：URL -> 组件          -> 局部重渲染，不刷新
```

为什么要这样？整页刷新会丢掉所有 JS 内存状态、重新下载资源、白屏闪烁。SPA 路由让多页面体验像桌面应用一样流畅。

## 2. 核心心智模型：路由表 = 组件版的 @RequestMapping

引入路由后，`App.tsx` 不再写业务，只写一张"路由表"：

```tsx
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

逐行对照后端：

```text
<Route path="users" element={<UserListPage/>} >       ≈ @GetMapping("/users")  -> UserListPage
<Route path="users/:id" element={<UserDetailPage/>} > ≈ @GetMapping("/users/{id}") -> UserDetailPage
<Route path="*" >                                     ≈ 全局兜底 404
<Route index> + <Navigate to="/users">                ≈ "/" 重定向到默认页
```

区别在于：映射的目标是**组件**，不是返回 HTML 的方法；匹配和渲染都在浏览器里完成。

## 3. 五个新增/改动的文件

```text
main.tsx                      用 <BrowserRouter> 包住 <App/>
App.tsx                       从"业务总控"瘦身成"路由表"
components/Layout.tsx         新增：公共外壳（标题 + 导航 + <Outlet/>）
pages/UserListPage.tsx        新增：原 App.tsx 的用户管理逻辑整体搬过来
pages/UserDetailPage.tsx      新增：详情页，演示 useParams
pages/NotFoundPage.tsx        新增：404 兜底页
```

关键重构动作：**原来 App.tsx 里那一大坨状态 + CRUD 逻辑，原封不动搬进 `UserListPage`**。App 只留路由表。这就是引入路由后的标准分层：

```text
App.tsx     路由表（URL -> 页面）
pages/      一个页面一个文件，承载该页面的状态与逻辑
components/  跨页面复用的纯展示组件（UserForm / UserTable）
```

## 4. 关键 API 逐个讲

### 4.1 BrowserRouter：路由的总开关

```tsx
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

`BrowserRouter` 用 HTML5 History API 接管 URL。它必须包在最外层，里面的所有 `Routes` / `Link` / `useNavigate` 才能工作。

```text
心智模型：BrowserRouter = "前端路由引擎"，先开机，组件里才能用路由能力。
```

### 4.2 Routes / Route：路由表

```tsx
<Routes>
  <Route path="users" element={<UserListPage />} />
</Routes>
```

`Routes` 会从上到下找出**最匹配当前 URL 的那一条** `Route`，渲染它的 `element`。

### 4.3 嵌套路由 + Outlet：公共布局

```tsx
<Route path="/" element={<Layout />}>
  <Route path="users" element={<UserListPage />} />
  <Route path="users/:id" element={<UserDetailPage />} />
</Route>
```

```tsx
// Layout.tsx
<div className="app">
  <h1>用户管理</h1>
  <nav>...</nav>
  <Outlet />   {/* 子路由渲染在这里 */}
</div>
```

含义：

```text
父路由 Layout 提供公共外壳（标题、导航栏）
子路由的内容渲染到 Layout 里 <Outlet/> 的位置
切换子页面时，外壳不重渲染，只换 <Outlet/> 里那块
```

类比：`Outlet` 就是后端模板里的"内容占位符"，母版固定、内容区按页面替换。

### 4.4 index 路由 + Navigate：默认页重定向

```tsx
<Route index element={<Navigate to="/users" replace />} />
```

```text
index 路由 = 父路径"/"被精确命中时的默认子路由
<Navigate to="/users" replace /> = 直接重定向到 /users
replace = 用新地址替换历史记录，而不是新增一条
         （这样用户点"后退"不会卡在 "/" 又被弹回来）
```

### 4.5 兜底路由 *

```tsx
<Route path="*" element={<NotFoundPage />} />
```

`*` 匹配所有前面没命中的 URL，是 404 的标准写法。类比后端的全局异常/404 处理。

### 4.6 两种跳转：声明式 vs 编程式

**声明式 —— Link / NavLink**

用户点击即跳，写在 JSX 里：

```tsx
<Link to="/users">返回用户列表</Link>

<NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
  用户列表
</NavLink>
```

```text
Link    渲染成 <a>，但点击不刷新整页（这是和原生 <a href> 的根本区别）
NavLink 比 Link 多一个能力：当前路由匹配时给 active 标记，方便高亮当前菜单
```

**关键纪律：站内跳转绝不能用 `<a href="/users">`**，那会触发整页刷新，丢掉所有内存状态，等于把 SPA 退化回多页应用。

**编程式 —— useNavigate**

在事件处理逻辑里决定跳哪：

```tsx
const navigate = useNavigate();

function handleView(user: User) {
  navigate(`/users/${user.id}`);  // 跳到详情
}

navigate(-1);  // 后退一步，等价于浏览器返回键
```

```text
什么时候用 Link：纯导航，点了就跳（菜单、返回链接）
什么时候用 useNavigate：跳转前要先做事（提交表单成功后跳、校验通过后跳）
```

本项目里：导航栏和 404 用 `Link/NavLink`（声明式），列表页"详情"按钮和详情页"返回"用 `useNavigate`（编程式）。

### 4.7 useParams：读取动态路径参数

路由 `path="users/:id"` 里的 `:id` 是动态段，详情页这样读：

```tsx
const { id } = useParams<{ id: string }>();
const data = await getUser(Number(id));
```

```text
useParams 对应后端的 @PathVariable("id")
注意：拿到的永远是字符串！需要自己 Number(id) 转换，Vite/Router 不会替你转。
```

详情页用 `useEffect([id])` 监听 `id` 变化重新加载——在不同用户详情之间跳转时，URL 变了组件不卸载，靠 `id` 依赖触发重新请求。

## 5. 一次"看详情"的完整数据流

```text
用户列表页点"详情"按钮
  -> UserTable 触发 onView(user)（事件往上抛）
  -> UserListPage 的 handleView 调 navigate(`/users/${id}`)
  -> BrowserRouter 改写 URL 为 /users/1（不刷新）
  -> Routes 重新匹配，命中 <Route path="users/:id">
  -> 渲染 UserDetailPage
  -> useParams 拿到 id="1"
  -> useEffect 触发 getUser(1) -> request 层 -> MSW 拦截 -> 返回该用户
  -> 渲染详情，点"返回" navigate(-1) 回列表
```

注意这条链路把前几次的成果串起来了：跳转用 Router，取数据仍走 `request.ts` 通用请求层，数据来源仍是 MSW Mock。各层职责清晰、互不干扰。

## 6. 一个生产部署的坑：SPA history 回退

`BrowserRouter` 用的是真实 URL（`/users/1`，没有 `#`）。本地 `vite preview` 已验证 `/`、`/users`、`/users/1` 都能返回页面，因为 dev/preview 服务器自带"找不到文件就回退到 index.html"。

但**部署到 Nginx 等静态服务器时必须手动配这条回退规则**，否则用户在 `/users/1` 刷新页面会 404（服务器真的去找 `/users/1` 这个文件，找不到）：

```nginx
location / {
  try_files $uri $uri/ /index.html;   # 找不到文件就交给前端路由
}
```

```text
原理：所有路径都先返回 index.html，再由前端 React Router 根据 URL 决定渲染哪个页面。
这是 SPA 部署的标准动作，后端开发者第一次部署 SPA 最容易栽在这。
```

## 7. 验证结果

```text
npm run build    成功（tsc --noEmit 类型检查通过 + vite build，281 个模块）
npm run preview + curl：
  GET /          200
  GET /users     200（SPA 兜底）
  GET /users/1   200（SPA 兜底）
```

类型检查覆盖了路由 props 接线、`useParams` 泛型、`UserTable` 新增 `onView` 等改动。点击交互（菜单高亮、详情跳转、404）建议在真实浏览器补做手工验证。

## 8. 本节小结

```text
前端路由     URL -> 组件，浏览器内完成，不整页刷新（区别于后端 URL -> Controller）
路由表       App.tsx 用 <Routes>/<Route> 声明，类比组件版 @RequestMapping
嵌套 + Outlet 父路由做公共外壳，子路由渲染进 <Outlet/>
index + Navigate  默认页重定向
path="*"     404 兜底
Link/NavLink 声明式跳转，不刷新；站内绝不用 <a href>
useNavigate  编程式跳转（跳转前要先做事时用），navigate(-1) 后退
useParams    读 :id 动态参数，类比 @PathVariable，值是字符串要自己转
分层         App=路由表，pages/=页面逻辑，components/=复用展示组件
部署坑       静态服务器要配 try_files 回退到 index.html
```

## 9. 下一步学习建议

```text
1. token 鉴权：在 request.ts 请求头自动带 Authorization，401 时 navigate 跳登录页。
2. 路由守卫：用一个 <RequireAuth> 包裹受保护路由，未登录重定向到 /login。
3. 分页/筛选/排序：把 keyword 过滤从前端挪到后端 query 参数，并把查询条件同步到 URL（useSearchParams）。
4. 引入 Vitest，对 request.ts 状态码分支、users.ts 过滤逻辑写单元测试。
```
