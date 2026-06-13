# 第四阶段（二）：token 鉴权与路由守卫学习笔记

本笔记承接 `week-04-react-router-notes.md`，记录在路由骨架上加一套最小可用的登录鉴权：登录页、token 存储、请求自动带 token、401 统一处理、路由守卫、退出登录。它把前几节的「request 通用层」和「React Router」真正咬合在一起。

## 1. 先建立认知：前端鉴权和后端鉴权各管一半

后端开发者对鉴权很熟，但要分清前后端各自负责什么：

```text
后端负责"真的拦"：校验 token、判断权限、没权限就返回 401/403。这是安全边界。
前端负责"体验和引导"：存 token、每次请求带上、未登录就别让你看到受保护页面、过期了自动跳登录。
```

关键纪律：

```text
前端的路由守卫只是"体验层拦截"，绝不是安全保障。
真正的安全永远在后端。前端把 token 藏好、把页面挡住，只是为了体验，
绕过前端守卫（比如直接调接口）必须被后端的 401 挡住。
```

所以这一节我同时做了两件事：**前端守卫**（RequireAuth）+ **让 mock 后端真的校验 token**（无 token 返回 401），两者配合才是完整链路。

## 2. 整体数据流：登录 → 带 token 访问 → 过期跳登录

```text
[登录]
输入账号密码 -> LoginPage 调 login() -> POST /login
  -> 后端校验通过返回 { token } -> setToken 存进 localStorage
  -> navigate('/users') 进主页面

[访问受保护接口]
UserListPage 加载 -> fetchUsers() -> request 层自动加 Authorization: Bearer <token>
  -> 后端校验 token 通过 -> 返回数据

[token 过期/缺失]
某次请求 -> 后端返回 401
  -> request 层统一拦截：clearToken() + 调 unauthorizedHandler()
  -> App 注册的 handler 执行 navigate('/login') -> 回到登录页

[未登录直接访问受保护页面]
访问 /users -> RequireAuth 发现没 token -> <Navigate to="/login">
```

## 3. 新增/改动的文件清单

```text
auth/auth.ts              新增：token 存储层（localStorage 读写 + isLoggedIn）
api/auth.ts               新增：login() 登录接口
pages/LoginPage.tsx       新增：登录页（受控表单 + 登录逻辑）
components/RequireAuth.tsx 新增：路由守卫
request.ts                改：请求拦截（带 token）+ 响应拦截（401 处理）+ setUnauthorizedHandler
App.tsx                   改：加 /login 公开路由，RequireAuth 包受保护路由，注册 401 handler
components/Layout.tsx     改：加"退出登录"按钮
mocks/handlers.ts         改：加 POST /login，数据接口校验 token（无 token 返回 401）
App.css                   改：登录页样式
```

## 4. 逐个知识点

### 4.1 token 存哪：localStorage

```ts
const TOKEN_KEY = 'auth_token';
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }
export function isLoggedIn() { return getToken() !== null; }
```

几种存储方式的取舍：

```text
localStorage    刷新、关浏览器重开都在。最常用，但 JS 能读到 -> 有 XSS 风险
sessionStorage  关掉标签页就没了
内存变量         刷新就丢，体验差
HttpOnly Cookie 最安全（JS 读不到，天然防 XSS 偷 token），但要后端配合、且要防 CSRF
```

教学项目用 localStorage 最直观。真实高安全场景更推荐 HttpOnly Cookie，由后端 set-cookie，前端甚至不用碰 token——这点要心里有数。

### 4.2 请求拦截：自动带 token

在 `request.ts` 里，发请求前统一加头：

```ts
const headers: Record<string, string> = { 'Content-Type': 'application/json' };
const token = getToken();
if (token) {
  headers.Authorization = `Bearer ${token}`;
}
```

```text
"请求拦截器"概念：在请求发出前，统一往上面挂东西（这里是鉴权头）。
好处：所有业务接口（fetchUsers / createUser / ...）一行都不用改，自动就带上了 token。
类比后端：Spring 的拦截器 / 过滤器在请求进来时统一处理，axios 里这叫 request interceptor。
```

`Bearer <token>` 是 OAuth2 / JWT 的标准头格式，后端按这个约定解析。

### 4.3 响应拦截：401 统一处理（本节最难点）

```ts
if (response.status === 401) {
  clearToken();
  unauthorizedHandler?.();
  throw new ApiError(401, '登录已过期，请重新登录');
}
```

```text
"响应拦截器"概念：在拿到响应后，统一判断要不要做全局动作。
401 = 未认证/过期，无论哪个接口返回它，都该清 token + 跳登录，所以收拢到一处。
好处：业务代码不用在每个 .catch 里都写"是不是 401、要不要跳登录"。
```

**难点：request.ts 怎么跳转？它不是 React 组件，没法用 useNavigate。**

解法是「回调注入」——request 层留一个口子，让上层把跳转能力塞进来：

```ts
// request.ts
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}
```

```tsx
// App.tsx（它在 <BrowserRouter> 里面，能用 useNavigate）
const navigate = useNavigate();
useEffect(() => {
  setUnauthorizedHandler(() => navigate('/login', { replace: true }));
}, [navigate]);
```

为什么这么绕？因为有两个约束：

```text
1. request 层要保持"纯"——不依赖 React、不依赖路由，将来才好复用、好测试。
2. 又确实需要在 401 时跳转，而跳转能力只有 React 组件树里才有（useNavigate）。
```

回调注入完美调和了两者：request 层只认识一个"出事了请执行这个函数"的口子，具体执行什么由 App 决定。

对比一个更糙的写法：

```ts
// 也能跳，但会整页刷新，丢掉所有内存状态，体验差
window.location.href = '/login';
```

用 `navigate` 注入比 `window.location` 好，就在于不刷新整页。真实项目里 axios 拦截器注入 navigate 是同样套路。

### 4.4 路由守卫 RequireAuth

```tsx
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

在 `App.tsx` 里用它包住受保护子树：

```tsx
<Route path="/login" element={<LoginPage />} />   {/* 公开 */}

<Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>  {/* 受保护 */}
  <Route path="users" element={<UserListPage />} />
  <Route path="users/:id" element={<UserDetailPage />} />
</Route>
```

```text
心智模型：守卫是一个"渲染前先问一句"的组件——
  登录了？ -> 渲染 children（Layout 及其子页面）
  没登录？ -> 渲染 <Navigate> 重定向到 /login
把它包在 Layout 外面，等于一次性保护了所有子页面。
类比后端：相当于在 Controller 前面挂了一个认证拦截器。
```

注意分层：`/login` 放在 `RequireAuth` 外面（否则没登录的人连登录页都看不到，死锁）。

### 4.5 退出登录

```tsx
function handleLogout() {
  clearToken();
  navigate('/login', { replace: true });
}
```

退出就是「清 token + 跳登录」。清了 token 后，`isLoggedIn()` 变 false，就算用户手动敲 `/users`，RequireAuth 也会把他弹回登录页。

### 4.6 让 mock 后端真的校验 token

光前端守卫不够，得让"后端"也校验，整条链路才真实：

```ts
function requireToken(request: Request): Response | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new HttpResponse(null, { status: 401 });
  }
  return null;
}
```

每个受保护 handler 开头先过这关：

```ts
http.get(`${API_BASE_URL}/users`, async ({ request }) => {
  const denied = requireToken(request);
  if (denied) return denied;   // 没 token 直接 401
  // ... 正常返回数据
}),
```

登录接口本身不校验 token（你还没登录），它校验账号密码：

```ts
http.post(`${API_BASE_URL}/login`, async ({ request }) => {
  const { username, password } = await request.json();
  if (username === 'admin' && password === '123456') {
    return HttpResponse.json({ token: `mock-token-${Date.now()}` });
  }
  return new HttpResponse(null, { status: 401 });
}),
```

这样能在浏览器里真实地走一遍：登录拿 token → 带 token 访问成功 → DevTools 里手动删掉 localStorage 的 token 再操作 → 后端 401 → 自动跳回登录页。

## 5. 一个 TypeScript 小坑（构建时真实踩到）

把 helper 的返回类型写成 `HttpResponse | null` 时，`tsc` 报错：

```text
error TS2314: Generic type 'HttpResponse<BodyType>' requires 1 type argument(s).
```

原因：MSW 的 `HttpResponse` 作为**类型**用时是泛型，需要写 `HttpResponse<null>` 这样的类型参数。`new HttpResponse(...)` 作为**值**用时没问题。解法是把返回类型写成它的父类型 `Response`（`HttpResponse` 继承自标准 `Response`）：

```ts
function requireToken(request: Request): Response | null { ... }
```

教学点：TypeScript 里「值」和「类型」是两套命名空间，一个名字在两边含义可能不同。报错信息直接告诉你"这个泛型类型缺类型参数"，顺着提示改即可。

## 6. 验证结果

```text
npm run build    成功（tsc --noEmit 通过 + vite build，285 个模块）
npm run preview + curl：GET /login 、/users 均 200（SPA 兜底）
```

说明：MSW 是浏览器内的 Service Worker，`vite preview` 服务器里不运行，所以 401 鉴权拦截这种行为只能在真实浏览器里验证。本次验证覆盖「类型检查 + 构建 + 路由可达」，登录流程、401 自动跳转建议在浏览器手工点测（admin/123456 登录；登录后删 localStorage 的 `auth_token` 再操作，应被弹回登录页）。

## 7. 本节小结

```text
token 存储    localStorage（取舍：HttpOnly Cookie 最安全）
请求拦截      request 层自动加 Authorization: Bearer <token>，业务零改
响应拦截      401 统一 clearToken + 跳登录，业务不用各自判断
回调注入      request 层不依赖路由，靠 setUnauthorizedHandler 注入 navigate（不整页刷新）
路由守卫      RequireAuth 包住受保护子树，没登录就 <Navigate to="/login">
分层纪律      /login 必须在守卫外；前端守卫只管体验，安全靠后端 401
mock 配合     让假后端也校验 token，整条链路才真实可测
值 vs 类型    HttpResponse 作类型需泛型参数，用父类型 Response 规避
```

## 8. 下一步学习建议

```text
1. 权限细化：在 token 里带角色，按角色控制菜单/按钮显隐（RBAC）。
2. 分页/筛选/排序：把 keyword 过滤挪到后端 query 参数，用 useSearchParams 把条件同步到 URL。
3. 登录后跳回原页面：守卫重定向时用 state 记下来源路径，登录成功后跳回去（而不是固定跳 /users）。
4. 引入 Vitest：对 request.ts 的 401 分支、auth.ts 的 token 读写写单元测试。
```
