# 第四阶段（八）：与 Spring Boot 联调（CORS 与开发代理）

本笔记承接 `week-04-7-build-and-deploy-notes.md`，讲前端怎么和真实 Spring Boot 后端对接：跨域（CORS）是什么、为什么直连后端会被浏览器拦、开发代理怎么绕开它、以及怎么把 mock 平滑切到真后端、字段对不齐怎么排查。配套引入了 Vite 开发代理。

## 1. 第一道坎：CORS（跨域）

后端开发者最容易在这里栽跟头：用 Postman 调后端一切正常，一放进浏览器就报错。

```text
前端跑在  http://localhost:5173   （Vite 开发服务器）
后端跑在  http://localhost:8080   （Spring Boot）
```

浏览器一看：协议/域名/端口只要有一个不同，就算「跨域」。出于安全（同源策略），浏览器会拦下跨域响应，控制台报：

```text
Access to fetch at 'http://localhost:8080/api/users' from origin
'http://localhost:5173' has been blocked by CORS policy
```

关键认知：

```text
CORS 是【浏览器】的安全策略，不是 JS 语法错误，也不是后端挂了。
Postman / curl 没有同源策略，所以它们能成功不代表浏览器能成功。
请求其实可能已经发出去、后端也回了，是浏览器把响应拦在了 JS 拿到之前。
```

## 2. 两种解法

### 解法 A：后端开启 CORS（生产常用）

让后端在响应头里声明"我允许这个来源跨域访问"：

```java
// Spring Boot 全局 CORS 配置（示意）
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("https://your-frontend.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
  }
}
```

浏览器收到 `Access-Control-Allow-Origin` 头，就放行。生产环境前后端不同域名时通常这么配。

### 解法 B：开发代理（开发联调首选，本项目用这个）

开发阶段更省事的办法：让前端请求**先打到 Vite 自己**（同源，不跨域），再由 Vite 在服务端把请求转发给后端。服务器之间转发没有同源策略，所以不受 CORS 限制。

```text
浏览器 --(同源, /api/users)--> Vite(5173) --(服务端转发)--> Spring Boot(8080)
        没有跨域问题                       没有同源策略
```

## 3. 本项目的开发代理配置

为了用代理，做了两处改动。

### 3.1 API 地址改成相对路径

`.env.development`：

```bash
# 早期是绝对地址 http://localhost:8080/api（会跨域）
# 改为相对路径，让浏览器请求同源的 /api/*
VITE_API_BASE_URL=/api
VITE_USE_MOCK=true
```

```text
绝对地址 http://localhost:8080/api  ->  浏览器直连 8080，跨域
相对路径 /api                       ->  浏览器请求 http://localhost:5173/api，同源
```

### 3.2 Vite 配置代理

`vite.config.ts`：

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 转发目标：本地 Spring Boot
        changeOrigin: true,              // 把转发请求的 Host 头改成目标域
      },
    },
  },
});
```

```text
含义：开发服务器收到 /api 开头的请求，转发到 http://localhost:8080。
例：浏览器请求 /api/users -> Vite 转发到 http://localhost:8080/api/users。
路径默认原样带过去（后端也用 /api 前缀就不用 rewrite）。
changeOrigin: true 让后端看到的 Host 是 8080，避免某些后端按 Host 校验时出问题。
```

注意三层各司其职、互不干扰：

```text
mock 模式（VITE_USE_MOCK=true）：MSW 在浏览器里就把 /api/* 拦了，根本走不到代理。
真后端模式（VITE_USE_MOCK=false）：没有 MSW，/api/* 经 Vite 代理打到 8080。
两种模式切换只改一个环境变量，业务代码、请求地址都不动。
```

## 4. 把 mock 平滑切到真后端

这正是前面所有铺垫（request 层 + MSW + 相对地址 + 代理）的收获时刻：

```text
1. 启动 Spring Boot（确保它在 8080，且接口路径与前端约定一致：/api/login、/api/users…）
2. 把 .env.development 的 VITE_USE_MOCK 改成 false
3. 重启 npm run dev
4. 完成 —— 业务代码一行不改，请求自动从"MSW 假数据"变成"经代理打到真后端"
```

之所以能这么顺，是因为我们一直让 MSW 严格模拟真后端的接口形状（同样的 URL、方法、状态码、JSON 结构）。mock 写得越像真后端，切换越无感。

## 5. 联调时接口对不齐怎么排查

联调最常见的不是"连不上"，而是"连上了但数据不对"。固定排查路径（DevTools）：

```text
1. Network 面板：找到这条请求
   - URL、Method、状态码对不对？（404=路径错，401=没带/带错 token，500=后端报错）
   - 请求是真发出去了，还是被 CORS 拦了？（被拦会有明显的 CORS 报错）
2. 看 Request：Headers 里 Authorization 带了吗？Payload（请求体）字段对吗？
3. 看 Response：后端实际返回的 JSON 长什么样？
4. 和前端类型契约比对：
   - 后端返回 { code, data: { list, total } }，但前端 request 直接当 PageResult 用？
     -> 包了一层 code/data，需要在 request 层或 API 层解包
   - 字段名 camelCase vs snake_case 对不上？（userName vs user_name）
   - 时间/枚举格式不一致？
```

后端对照表（复习 week-04-1 的映射）：

```text
fetchUsers()    GET    /api/users        @GetMapping
login()         POST   /api/login        @PostMapping + @RequestBody
createUser()    POST   /api/users        @PostMapping + @RequestBody
updateUser()    PUT    /api/users/{id}   @PutMapping + @PathVariable + @RequestBody
deleteUserApi() DELETE /api/users/{id}   @DeleteMapping + @PathVariable
```

常见落差与处理点：

```text
真实后端常包统一响应体 { code, message, data }：
  -> 在 request 层统一拆 data、按 code 判业务错误（前端契约就只认 data 部分）
分页结构可能是 Spring Data 的 { content, totalElements, ... }：
  -> 在 fetchUsers 里把它适配成前端的 PageResult { list, total, ... }
这类"适配"集中放在 API 层，组件和页面不用感知后端的具体形状。
```

## 6. 生产环境的跨域

开发用 Vite 代理，生产没有 Vite。两种常见做法：

```text
A. 前后端同域 + 反向代理：Nginx 把 /api 反代到后端，前端用相对 /api，天然同源（推荐）。
   （即在 week-04-7 的 nginx.conf 里加一段 location /api { proxy_pass http://backend; }）
B. 后端开启 CORS：前端用绝对地址直连后端域名，后端允许该来源。
本项目 .env.production 目前用绝对地址（方案 B 的形态），真上线按部署架构二选一即可。
```

## 7. 验证结果

```text
npm run build   成功（286 个模块）
npm test        18 passed
npm run dev     启动正常（5173）；
  GET /          200（页面入口）
  GET /api/users 500（curl 不跑 JS，请求经代理转发到未启动的 8080，连接失败）
                 -> 正好证明代理已生效；浏览器 mock 模式下 MSW 会更早拦截
```

说明：本环境没有真实 Spring Boot，无法跑通"切 false 连真后端"的最后一步；代理与切换方案已就绪，待有后端环境时按 §4 操作即可。

## 8. 本节小结

```text
CORS        浏览器的同源策略，不是后端挂了；Postman 成功 ≠ 浏览器成功
两种解法     后端开 CORS（生产）/ 开发代理（开发首选）
开发代理     地址改相对 /api + vite server.proxy 转发到 8080，浏览器同源、绕开 CORS
三层不打架   mock 模式 MSW 先拦；真后端模式经代理打到后端；切换只改 VITE_USE_MOCK
平滑切换     mock 写得像真后端，切真后端时业务代码零改
联调排查     Network 看 URL/状态码/请求头/请求体/响应，再和前端类型契约比对
后端落差     统一响应体 {code,data}、分页 {content,totalElements} 在 API 层适配
生产跨域     Nginx 反代 /api（同域）或后端开 CORS
```

## 9. 下一步学习建议

```text
1. 端到端测试：引入 Playwright，用真实浏览器跑"登录->查询->翻页->编辑->登出"主流程。
2. 统一响应体适配：在 request 层加一层 { code, message, data } 拆包 + 业务码处理。
3. CI/CD：把 npm ci && npm test && npm run build 接进流水线自动化。
4. 性能优化：路由级代码分割（lazy + Suspense），按页面拆 chunk。
```
