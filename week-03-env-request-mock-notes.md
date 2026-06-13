# 第二/四阶段衔接：环境变量、通用 request 层与 MSW Mock 学习笔记

本笔记承接 `week-02-typescript-engineering-notes.md`，记录 `user-management/` 工程在「能跑的 React + TypeScript 用户管理页」之上做的三次工程化升级：

```text
1. 环境变量与多环境配置        （第二阶段最后一项，对应 application-{env}.yml）
2. 抽出通用 request 层          （第四阶段：API 分层封装 + 统一错误处理）
3. 引入 MSW Mock 层            （工程化：业务代码与假后端在网络层解耦）
```

这三步的共同主线是一句话：

```text
让业务代码只表达"我要什么数据"，把"怎么发请求、连哪个环境、谁来响应"全部下沉成基础设施。
```

对应到后端经验，就是把散落在 Controller 里的 `RestTemplate.getForObject(...)`、写死的 URL、手工 try/catch，收拢成统一的 `application.yml` + 请求客户端 + 全局异常处理。

---

## 1. 环境变量与多环境配置

### 1.1 要解决的问题

第三阶段写完的页面里，接口地址是写死的（比如直接 `fetch('/users.json')`）。真实项目至少有三套环境：

```text
开发环境   连本地后端    http://localhost:8080/api
测试环境   连测试后端    https://test-api.xxx.com/api
生产环境   连生产后端    https://api.mycompany.com/api
```

地址写死在代码里，意味着每换一个环境都要改源码、重新构建，非常危险。

后端的解法是 Spring profile：

```text
application-dev.yml
application-test.yml
application-prod.yml
启动时用 spring.profiles.active 选一套
```

前端 Vite 的解法几乎一一对应。

### 1.2 .env 文件与生效规则

工程里新增了两个文件：

```text
.env.development    npm run dev 时生效     ≈ application-dev.yml
.env.production     npm run build 时生效    ≈ application-prod.yml
```

`.env.development` 内容：

```bash
# 开发环境配置（npm run dev 时生效）
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=用户管理（开发环境）
# 是否启用 MSW mock。后端真实就绪后改为 false，业务代码无需任何改动。
VITE_USE_MOCK=true
```

`.env.production` 内容：

```bash
# 生产环境配置（npm run build 时生效）
VITE_API_BASE_URL=https://api.mycompany.com/api
VITE_APP_TITLE=用户管理
```

生效规则（先记结论）：

```text
npm run dev    => Vite 自动加载 .env.development
npm run build  => Vite 自动加载 .env.production
```

不需要手动指定，Vite 根据"当前是开发还是构建"自动选文件，这点比 Spring 还省事（不用写 spring.profiles.active）。

### 1.3 VITE_ 前缀：一道安全闸门

关键规则：

```text
只有以 VITE_ 开头的变量，才会被注入到前端浏览器代码里。
没有这个前缀的变量，前端代码读不到。
```

为什么要这道闸门？因为前端代码最终会下载到用户浏览器，**任何被注入的变量都等于公开**。这个前缀强制你思考：

```text
VITE_API_BASE_URL   可以暴露（本来就是要请求的公网地址）
DB_PASSWORD         绝不能加 VITE_ 前缀（一旦加了就泄露到浏览器）
```

心智模型：

```text
VITE_ 前缀 = "我确认这个值可以公开给浏览器"
```

这和后端把密钥放进 `application.yml`、但绝不会把整份配置塞进给前端的响应里，是同一个安全直觉。

### 1.4 import.meta.env：读取环境变量

代码里这样读：

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

`import.meta.env` 就是 Vite 注入的环境变量对象。

注意一个**容易踩的坑**：

```text
所有环境变量的值都是字符串。
VITE_USE_MOCK=true 读出来是字符串 'true'，不是 boolean true。
Vite 不做类型转换。
```

所以判断时必须和字符串比：

```ts
if (import.meta.env.VITE_USE_MOCK !== 'true') return;
//                                   ^^^^^^ 字符串，不能写 !== true
```

### 1.5 给环境变量加类型：vite-env.d.ts

默认情况下 `import.meta.env.VITE_API_BASE_URL` 是 `any`，拼错了也不报错。工程里用 `src/vite-env.d.ts` 给它补了类型：

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  // 值始终是字符串（'true' / 'false'），不是 boolean —— Vite 不做类型转换
  readonly VITE_USE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

作用：

```text
写 import.meta.env.VITE_API_BASE_URL  有类型提示、能自动补全
写 import.meta.env.VITE_API_BASEURL   立刻报错（拼错了）
```

这就是把"配置项清单"也纳入 TypeScript 的类型保护，类比后端用一个 `@ConfigurationProperties` 类去承接配置，而不是到处 `@Value("${...}")` 裸读字符串。

### 1.6 环境变量小结

```text
.env.development / .env.production   多套环境配置，对应 Spring profile
VITE_ 前缀                           安全闸门，决定哪些值能进浏览器
import.meta.env.VITE_xxx             代码里读取入口
值永远是字符串                        VITE_USE_MOCK 要和 'true' 比较
vite-env.d.ts                        给环境变量补类型，防拼错
```

---

## 2. 通用 request 层

### 2.1 要解决的问题

在抽 request 层之前，每个 API 函数都要自己写一整套样板：

```text
拼 URL
设 header
await fetch
判断 response.ok
处理非 200
response.json()
catch 网络错误
```

四个接口（增删改查）就要重复四遍。这违背了后端早就熟悉的原则：**横切关注点要收拢**。

后端的对照物：

```text
统一的 HTTP 客户端封装
统一的状态码 -> 异常 转换
全局异常处理 @ControllerAdvice
```

### 2.2 文件分层：request.ts vs users.ts

升级后变成两层：

```text
src/api/request.ts   通用请求层：baseUrl、header、状态码判断、JSON 解析、错误包装
src/api/users.ts     业务 API 层：只表达"我要 GET /users、POST /users"
```

一句话区分职责：

```text
request.ts 负责"怎么发请求"
users.ts   负责"发什么请求"
```

### 2.3 自定义错误类型 ApiError

```ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

设计意图：让上层既能拿到人类可读的 `message`，又能拿到 HTTP `status` 做分支判断（比如 401 跳登录、403 提示无权限）。

Java 类比：

```java
class BusinessException extends RuntimeException {
    private final int code;
    // ...
}
```

`public readonly status: number` 是 TypeScript 的构造函数参数简写——在构造参数上写修饰符，等价于"声明字段 + 赋值"，类比 Lombok 或 Java record 帮你省掉样板。

### 2.4 泛型 request<T>：核心封装

```ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  // body 用 unknown 而不是 any：迫使内部主动序列化
  body?: unknown;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const url = `${API_BASE_URL}${path}`;

  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    // fetch 本身抛错 = 网络层失败（断网、DNS、CORS、连接被拒）
    // 这种情况没有 HTTP 状态码，用 0 占位
    const message = err instanceof Error ? err.message : String(err);
    throw new ApiError(0, `网络请求失败: ${message}`);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `请求失败，HTTP 状态码：${response.status}`,
    );
  }

  // 204 No Content（典型场景：DELETE 成功）没有 body，不能 .json()
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
```

几个关键设计点：

**泛型 `<T>` 让调用点指定返回类型**

```ts
request<User[]>('/users')      // 返回 Promise<User[]>
request<User>('/users/1')      // 返回 Promise<User>
```

Java 类比：

```java
<T> T get(String url, Class<T> responseType);
```

**`body?: unknown` 而不是 `any`**

```text
any      放弃类型检查，什么都能塞
unknown  你必须主动处理它（这里是主动 JSON.stringify）
```

用 `unknown` 是"安全的 any"，强制内部显式序列化，而不是把任意值当字符串硬塞。

**两种失败要分清**

```text
fetch 抛异常       网络层挂了（断网、DNS、CORS），没有 HTTP 状态码 -> ApiError(0, ...)
response.ok 为 false  连上了但后端返回 4xx/5xx           -> ApiError(status, ...)
```

这是新手最容易混的地方：`fetch` **只有在网络层失败时才 reject**，后端返回 404/500 时 `fetch` 是正常 resolve 的，必须自己判断 `response.ok`。

**204 单独处理**

```text
DELETE 成功通常返回 204 No Content，响应体是空的。
对空响应体调用 .json() 会抛错，所以提前 return。
```

### 2.5 业务 API 层瘦身后的样子

有了 request 层，`users.ts` 变得极薄，只剩"发什么请求"：

```ts
export async function fetchUsers(
  { keyword = '', shouldFail = false }: FetchUsersParams = {},
): Promise<User[]> {
  const path = shouldFail ? '/users-not-exist' : '/users';
  const users = await request<User[]>(path);
  const trimmed = keyword.trim();
  if (!trimmed) return users;
  return users.filter((user) => user.name.includes(trimmed));
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  return request<User>('/users', { method: 'POST', body: payload });
}

export async function updateUser(id: number, payload: UpdateUserRequest): Promise<User> {
  return request<User>(`/users/${id}`, { method: 'PUT', body: payload });
}

export async function deleteUserApi(id: number): Promise<void> {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}
```

和 Spring Boot Controller 的对应关系保持不变：

```text
fetchUsers()          GET    /users        @GetMapping
createUser(payload)   POST   /users        @PostMapping  + @RequestBody
updateUser(id, data)  PUT    /users/{id}   @PutMapping   + @PathVariable + @RequestBody
deleteUserApi(id)     DELETE /users/{id}   @DeleteMapping + @PathVariable
```

### 2.6 request 层小结

```text
request.ts   横切关注点（URL、header、状态码、JSON、错误包装）一处实现
ApiError     带 status 的自定义异常，类比 BusinessException(code, message)
泛型 <T>      调用点决定返回类型
unknown body 强制显式序列化，比 any 安全
两类失败      网络层失败(status=0) vs HTTP 错误(status=4xx/5xx) 要分开
204          空响应体不能 .json()，提前返回
users.ts     只表达业务语义，组件完全不碰 fetch
```

---

## 3. MSW Mock 层

### 3.1 要解决的问题

前面 `users.ts` 已经全部走真实 `request()` 发 HTTP 请求了，但 Spring Boot 后端还没就绪。怎么办？

差的做法：在业务代码里加 `if (开发环境) return 假数据`。问题是假数据逻辑混进了业务代码，后端就绪后还得回去删，容易删漏。

MSW（Mock Service Worker）的做法是**在网络层拦截**：

```text
业务代码照常 fetch('http://localhost:8080/api/users')
        ↓
浏览器 Service Worker 把这个请求拦下来
        ↓
用预设的 handler 返回假数据
```

关键价值：

```text
业务代码以为自己在和真后端通信，完全无感。
后端就绪后，只要关掉 MSW 开关，请求就真的发到后端，业务代码一行都不用改。
```

这就是 commit message 说的"业务代码与假后端在网络层解耦"。对照后端经验，类似用 WireMock / MockServer 起一个假服务，而不是在 Service 里写 if-else 返回假对象。

### 3.2 三个文件的职责

```text
public/mockServiceWorker.js   MSW 安装的 Service Worker 脚本，真正的"拦截能力"来源
src/mocks/handlers.ts         拦下来之后用什么规则响应（假的路由表 + 内存数据库）
src/mocks/browser.ts          把 handlers 装进 worker
src/main.tsx                  按环境变量开关决定要不要启动 worker
```

### 3.3 handlers.ts：有状态的内存假后端

```ts
import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 模拟一个"内存数据库"：mock 是有状态的，
// POST 之后真的多一条，DELETE 之后真的少一条。
let mockUsers: User[] = [
  { id: 1, name: '张三', role: '管理员', status: 'enabled' },
  // ... 含一条 XSS 测试数据
];
let nextId = 5;

export const handlers = [
  http.get(`${API_BASE_URL}/users`, async () => {
    await delay(300);                       // 模拟网络延迟，让 loading 可观察
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${API_BASE_URL}/users-not-exist`, async () => {
    await delay(300);
    return new HttpResponse(null, { status: 404 });   // 配合"模拟失败"按钮
  }),

  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    await delay(300);
    const payload = (await request.json()) as CreateUserRequest;
    const newUser: User = { id: nextId++, ...payload };
    mockUsers = [...mockUsers, newUser];
    return HttpResponse.json(newUser);
  }),

  http.put(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    await delay(300);
    const id = Number(params.id);
    const payload = (await request.json()) as UpdateUserRequest;
    const updated: User = { id, ...payload };
    mockUsers = mockUsers.map((u) => (u.id === id ? updated : u));
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/users/:id`, async ({ params }) => {
    await delay(300);
    const id = Number(params.id);
    mockUsers = mockUsers.filter((u) => u.id !== id);
    return new HttpResponse(null, { status: 204 });   // DELETE 返回 204
  }),
];
```

值得记住的几点：

**handler 的 URL 必须和真实请求 URL 完全一致**

```text
handler 也用 import.meta.env.VITE_API_BASE_URL 拼 URL，
保证拦截的地址和 request.ts 发出的地址逐字符相同，否则拦不到。
```

**`:id` 路径参数和后端框架写法几乎一样**

```text
http.put(`${BASE}/users/:id`, ({ params }) => { params.id })
≈
@PutMapping("/users/{id}")  method(@PathVariable Long id)
```

**mock 是有状态的**

```text
不是每次返回固定假数据，而是维护一个 mockUsers 数组。
POST 真的往数组里加，DELETE 真的从数组里删，PUT 真的改。
所以页面上增删改查的体验和真后端一致。
```

**`delay(300)` 是教学用心机**

```text
故意加 300ms 延迟，让页面的 loading 状态能被肉眼看到，
否则本地 mock 太快，loading 一闪而过观察不到。
```

**DELETE 返回 204**，正好呼应 request 层里"204 不调用 .json()"的处理——两边是配套设计。

### 3.4 browser.ts：把 handlers 装进 worker

```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 真正"拦截请求"的能力来自 public/mockServiceWorker.js，
// 这里只是配置"拦下来之后用哪些规则响应"。
export const worker = setupWorker(...handlers);
```

`...handlers` 是展开运算符，把数组里的每个 handler 作为独立参数传进去。

### 3.5 main.tsx：按开关启动，且必须在渲染前

```ts
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  // 动态 import：mock 代码只在开启时才进入 bundle，生产环境不会被打包进去
  const { worker } = await import('./mocks/browser');

  // 没匹配到的请求放行，不刷告警
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
```

三个关键设计：

**开关由环境变量控制**

```text
VITE_USE_MOCK=true   启动 mock（后端没就绪时）
VITE_USE_MOCK=false  不启动，请求真的发到后端
切换只改 .env，业务代码零改动 —— 这正是整套设计的目的。
```

**动态 `import('./mocks/browser')` 而不是顶部静态 import**

```text
静态 import：mock 代码一定会被打进最终产物
动态 import：只有 VITE_USE_MOCK==='true' 这条分支执行到时才加载
            生产构建里 mock 代码不会进 bundle，更干净也更安全
```

**必须 `await worker.start()` 之后再渲染**

```text
worker.start() 是异步的（要等 Service Worker 注册激活）。
如果不等它 resolve 就渲染，App 首次 useEffect 里的请求
可能跑在 worker 接管之前，那一发请求会漏过 mock 打到真实网络。
所以用 enableMocking().then(() => createRoot(...).render(...)) 串起来。
```

这是 mock 接入里**最容易出隐藏 bug** 的点：表现为"刷新后偶尔第一次加载失败/数据不对"，根因就是没等 worker 就绪。

### 3.6 一次完整请求的数据流

把三层串起来，点一次"查询"发生了什么：

```text
App 调用 fetchUsers()
  -> users.ts 调 request<User[]>('/users')
  -> request.ts 拼出 http://localhost:8080/api/users 并 fetch
  -> 浏览器 Service Worker（mockServiceWorker.js）拦截
  -> 命中 handlers.ts 里 http.get(`${BASE}/users`)
  -> delay(300) 后返回 mockUsers 的 JSON
  -> request.ts 判断 response.ok、解析 json，返回 User[]
  -> users.ts 按 keyword 过滤
  -> App 拿到数据 setUsers，React 重新渲染
```

后端就绪后只改一处：

```text
VITE_USE_MOCK=false
```

Service Worker 不再启动，同一条链路里"被拦截 -> handler 响应"那两步消失，请求直达真实后端。**其余每一行业务代码都不动**。

### 3.7 MSW 小结

```text
拦截层级      在网络层（Service Worker），不是在业务代码里 if-else
解耦效果      业务代码以为在和真后端通信，无感
有状态 mock   mockUsers 数组，增删改查真的改它，体验接近真后端
URL 一致      handler 和真实请求都用同一个 baseUrl 拼，否则拦不到
:id 路径参数  写法和后端框架 @PathVariable 几乎一样
开关          VITE_USE_MOCK 控制，切环境零改业务代码
动态 import   生产 bundle 不含 mock 代码
渲染前等待     await worker.start() 后再 render，否则首个请求漏拦
204 配套      DELETE 返回 204，呼应 request 层不 .json() 的处理
```

---

## 4. 三层叠加后的工程全貌

到这一步，`user-management/` 的请求侧已经是一个相对完整的小型工程骨架：

```text
配置层    .env.* + import.meta.env + vite-env.d.ts
            按环境提供 baseUrl、标题、mock 开关，且有类型保护

请求层    src/api/request.ts
            统一 URL/header/状态码/JSON/错误包装，泛型返回，ApiError

业务层    src/api/users.ts
            只表达业务语义（GET/POST/PUT/DELETE /users），组件不碰 fetch

Mock 层   src/mocks/* + public/mockServiceWorker.js
            网络层假后端，开关可切，后端就绪零改业务代码

视图层    App.tsx / UserForm.tsx / UserTable.tsx
            状态驱动 UI，四态渲染，不可变更新
```

一句话总结这三次升级解决的核心问题：

```text
环境变量    解决"连哪个环境"——配置与代码分离
request 层  解决"怎么发请求"——横切关注点收拢
MSW Mock    解决"后端没好怎么开发"——业务与假后端在网络层解耦
```

它们共同把项目从"一个能跑的 React 页面"推进到"具备真实项目分层结构的工程"，为第四阶段（React Router、鉴权、分页/筛选/排序、与 Spring Boot 真正联调、Vitest 测试）打好了底座。

## 5. 验证结果

```text
npm run build   成功（tsc --noEmit 类型检查通过 + vite build 产物生成）
```

说明三层改造没有破坏类型契约，工程仍可正常构建。浏览器手工点测（增删改查、loading、模拟失败 404）建议在有真实浏览器的环境补做。

## 6. 下一步学习建议

```text
1. 把 VITE_USE_MOCK 改为 false，启动真实 Spring Boot，验证零改业务代码切到真后端。
2. 在 request 层叠加 token：请求头自动带 Authorization，401 统一跳登录。
3. 引入 React Router，把用户管理做成一个路由页面。
4. 接入分页/筛选/排序：把 keyword 过滤从前端挪到后端 query 参数。
5. 引入 Vitest，对 request.ts 的状态码分支、users.ts 的过滤逻辑写单元测试。
```
