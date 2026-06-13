# 结业复盘：前端系统学习阶段验收

本文对照 `frontend-learning-plan.md` 第 8 节「阶段验收清单」逐条作答，每个答案都落到本项目实际写过的代码上，作为四阶段学习的收束与验收。

## 一、四阶段成果总览

```text
第一阶段 Web 基础         index.html（原生 HTML/CSS/JS 后台页）           week-01
第二阶段 TypeScript 工程化  user-management 工程骨架 + 类型 + API 层        week-02
第三阶段 React 核心        用 React 重写用户管理页（App/UserForm/UserTable）  并入 week-02 + 项目
第四阶段 真实项目能力      路由/鉴权/分页/表单抽象/三层测试/构建部署/联调    week-04-1 ~ week-04-9
```

最终产物 `user-management/`：一个带路由、登录鉴权、后端分页、统一请求层、单元+组件+E2E 测试、可构建部署、有联调方案的 React + TypeScript 后台管理工程。

## 二、阶段验收清单逐条作答

### 1. HTML、CSS、JavaScript 分别解决什么问题？

```text
HTML        内容结构：页面上有什么（标签、表单、表格）
CSS         表现样式：内容怎么排布、长什么样
JavaScript  交互逻辑：用户操作后发生什么、怎么和服务器通信
```

Java 类比：HTML ≈ 数据结构声明，CSS ≈ 展示层规则，JS ≈ 浏览器里的业务逻辑层；浏览器 ≈ 前端运行时（类似 JVM 之于 Java）。

落到代码：第一阶段 `index.html` 里三者还混在一个文件；进入工程化后职责拆开——结构进 JSX、样式进 `App.css`、逻辑进 `.ts/.tsx`。

### 2. Flex 和 Grid 适合哪些布局场景？

```text
Flex  一维布局：一行或一列里的排列与空间分配
Grid  二维布局：同时控制行和列的网格
```

落到代码（`App.css`）：

```text
Flex：.toolbar（搜索框+按钮横排）、.form-row（标签+输入横排）、
      .nav（导航横排，退出按钮 margin-left:auto 推到右边）、.pagination
Grid：.detail-card dl { grid-template-columns: 80px 1fr }（详情页"标签-值"两列对齐，二维）
```

经验：一行/一列的排列优先 Flex；规整的行列对齐用 Grid。

### 3. Promise 和 async/await 的关系是什么？

```text
async/await 是 Promise 的语法糖：让异步代码写得像同步，更好读。
await 一个 Promise = 等它 resolve 拿到结果；reject 则像抛异常，被 try/catch 捕获。
async 函数的返回值一定被包成 Promise。
```

落到代码（`request.ts` / `UserListPage.loadUsers`）：

```ts
async function loadUsers() {
  setLoading(true);
  try {
    const result = await fetchUsers({ ... }); // 等异步结果
    setUsers(result.list);
  } catch (err) {                              // reject 在这里被捕获
    setError(...);
  } finally {
    setLoading(false);                          // 无论成败都关 loading
  }
}
```

Java 类比：`Promise<T>` ≈ `CompletableFuture<T>`，`await` ≈ `.get()`（但不阻塞线程）。

### 4. TypeScript interface 和 Java DTO 有什么相似点和差异？

```text
相似：都声明对象结构契约、字段名与类型；都用于接口出入参建模。
差异：
  - TS 类型只在【编译期】存在，编译后被擦除，运行时没有类型信息；
    Java 的类在运行时真实存在（可反射）。
  - TS 是【结构化类型】（鸭子类型）：形状对上就兼容，不看名字；
    Java 是【名义类型】：类型名/继承关系决定兼容。
  - interface 可被"声明合并"扩展（所以当 Record<string,unknown> 约束用时要改用 type）。
```

落到代码（`types/user.ts`）：`User` / `CreateUserRequest` / `PageResult<T>` 就是前端的 DTO/VO；`PageResult<T>` ≈ 后端 `Page<T>`。

### 5. React props 和 state 分别适合表达什么？

```text
props   父组件传给子组件的入参，子组件只读（"数据往下传，事件往上抛"）
state   组件自己持有、会随时间变化的数据；变了就触发重新渲染（UI = f(state)）
```

落到代码：

```text
state：UserListPage 持有 users / loading / error / message / editingUser…（页面级状态）
props：UserTable 通过 props 收 { users, sort, order, onSort, onEdit, onDelete… }
       —— 数据(users)往下传，操作(onXxx 回调)往上抛，UserTable 本身不持有数据
```

判断口诀：会变且属于"本组件"的 → state；从父组件拿的 → props。

### 6. useEffect 适合处理哪些副作用？

```text
副作用 = 渲染输出之外、和外部世界打交道的事：
  - 请求接口
  - 订阅/注册回调
  - 操作浏览器 API（localStorage、title…）
  - 把组件内部状态与外部数据源同步
依赖数组决定"什么时候重跑"。
```

落到代码（多处典型用法）：

```text
[] 只跑一次：           （早期）首次加载用户列表
[searchParams] 变就重跑：UserListPage —— URL 的分页/搜索/排序一变就重新拉数据
[mode, editingUser]：    UserForm —— 切换新增/编辑时把表单重置/预填充
[navigate]：             App —— 注册"401 跳登录"的 unauthorizedHandler
[id]：                   UserDetailPage —— 路由 :id 变了重新加载该用户
```

要点：依赖数组要诚实反映"用到的外部值"，否则会拿到旧值或漏更新。

### 7. 如何封装一个可维护的 API 请求层？

分两层，把横切关注点收拢：

```text
通用请求层 request.ts：baseUrl 拼接、Content-Type、自动带 token（请求拦截）、
  状态码判断、JSON 解析、204 处理、错误包装成 ApiError、401 统一跳登录（响应拦截）。
业务 API 层 users.ts / auth.ts：只表达"发什么请求"（GET /users、POST /login），
  不重复"怎么发"。
```

落到代码：

```ts
// 业务层只写意图
export const fetchUsers = (p) => request<PageResult<User>>(`/users?${query}`);
export const login = (b) => request<LoginResponse>('/login', { method: 'POST', body: b });
```

收益：组件完全不碰 `fetch`；换鉴权方式、统一错误处理、切 mock/真后端都只动 request 层。`ApiError(status, message)` 让上层既拿得到提示也拿得到状态码（≈ 后端 `BusinessException(code, message)`）。

### 8. 如何处理接口 loading、empty、error 三种状态？

用独立状态 + 条件渲染区分（再加一个隐含的 success/有数据态）：

```tsx
// UserListPage
{loading && <p>加载中...</p>}
{!loading && error && <p className="error">{error}</p>}
{!loading && !error && users.length === 0 && <p>暂无数据</p>}
{!loading && !error && users.length > 0 && <UserTable ... />}
```

```text
loading：请求发出到返回之间（mock 故意 delay(300) 让它可见）
error：  request 层抛 ApiError，页面 catch 后 setError
empty：  请求成功但结果为空（users.length === 0）
success：有数据，正常渲染
四态互斥，靠 loading/error/长度三个条件分支表达。
```

### 9. 如何与 Spring Boot 接口联调？

```text
1. 对齐接口契约：URL、method、状态码、请求/响应 JSON 结构一致
   （fetchUsers→GET /api/users，login→POST /api/login …）。
2. 解决 CORS：开发用 Vite 代理（/api 相对路径 + server.proxy 转发到 8080，同源绕开跨域）；
   生产用 Nginx 反代 /api 或后端开 CORS。
3. 平滑切换：MSW 严格模拟真后端形状，把 VITE_USE_MOCK 改 false 即切真后端，业务代码零改。
4. 排查：DevTools Network 看 URL/状态码/请求头(Authorization)/请求体/响应，再与前端类型契约比对。
5. 适配落差：后端统一响应体 {code,message,data}、分页 {content,totalElements}
   在 API 层适配成前端契约，组件不感知。
```

详见 `week-04-8`。这套设计让"没有后端也能开发、后端就绪零改切换"。

### 10. 如何让 AI 帮你完成前端需求拆解、实现、测试和审查？

本项目本身就是这套工作流的产物，每一节都遵循同一节奏：

```text
1. 先让 AI 解释现有结构 / 给组件拆分与数据流方案（不急着改代码）。
2. 先落类型（types）和 API 层，再实现页面/组件。
3. 要求自查边界态：loading/empty/error、权限、表单校验、不可变更新、XSS。
4. 跑 build（类型闸门）、test（单元/组件）、必要时 E2E。
5. 按代码审查视角回查可维护性（分层、命名、横切关注点收拢）。
6. 每节沉淀笔记 + 提交，保留决策与验证记录。
```

关键心法：让 AI 先讲思路再动手、先类型后实现、每步可验证、产出留痕。

## 三、整体知识地图

```text
浏览器三件套(HTML/CSS/JS)
   └─ TypeScript（给 JS 加类型契约）
        └─ React（UI = f(state)，组件 + props/state + Hooks）
             ├─ 自定义 Hook（useForm）抽复用的有状态逻辑
             ├─ React Router（URL → 组件；守卫 RequireAuth；useSearchParams 把查询同步到 URL）
             └─ 工程化底座
                  ├─ Vite（dev server / build / 环境变量 / 代理）
                  ├─ 请求层 request.ts（拦截器思路：带 token / 401 处理 / 错误包装）
                  ├─ MSW（网络层假后端，可切真后端）
                  └─ 测试金字塔（Vitest 单元/组件 + Playwright E2E）
                       └─ 构建部署（dist / hash 缓存 / SPA 回退 / Docker+Nginx）
                            └─ 与 Spring Boot 联调（CORS / 代理 / 契约适配）
```

## 四、这个项目现在具备的能力

```text
✓ 多页面路由 + 嵌套布局 + 404 兜底 + 路由守卫
✓ 登录鉴权：token 存取、请求自动带 token、401 统一跳登录、退出登录
✓ 用户 CRUD + 启用/禁用
✓ 后端分页 / 关键字筛选 / 字段排序，查询条件同步到 URL（可分享/刷新不丢）
✓ 统一请求层：错误包装、状态码处理、204、网络失败、ApiError
✓ 可复用表单 Hook + 字段级校验
✓ 四态渲染：loading / empty / error / success
✓ MSW 假后端（有状态），一个开关切真后端
✓ 测试：18 条单元/组件测试通过；E2E 主流程用例就绪
✓ 可构建部署：Dockerfile + Nginx（SPA 回退/gzip/缓存）
✓ 联调方案：Vite 代理绕 CORS、契约适配点
✓ 安全：React 默认转义防 XSS（教学数据验证）
```

## 五、后续进阶路线（超出原四阶段计划）

```text
1. CI/CD：npm ci && npm test && npm run build（+E2E）接进流水线自动化。
2. 请求层再抽象：统一响应体 {code,message,data} 拆包 + 业务错误码集中处理。
3. 权限系统：基于角色的菜单/按钮级权限（RBAC）、路由按权限动态生成。
4. 性能：路由级代码分割（lazy + Suspense）、首屏与渲染优化、请求缓存（TanStack Query）。
5. 工程质量：覆盖率门禁、可访问性（a11y）、国际化（i18n）、错误监控。
```

## 结语

从第一阶段一个原生 HTML 后台页，到现在一个具备真实后台管理模块完整能力的 React + TypeScript 工程，四阶段学习闭环已经走通。计划第 8 节验收清单的每个问题，都既能回答、也在项目里实践过。下一步无论是接真实 Spring Boot 跑通联调，还是往上面的进阶方向走，地基都已经打好。
