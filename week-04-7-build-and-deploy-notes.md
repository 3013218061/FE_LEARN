# 第四阶段（七）：构建与部署

本笔记承接 `week-04-6-form-abstraction-component-testing-notes.md`，讲前端工程怎么从源码变成线上可访问的网站：`npm run build` 产出什么、为什么前端部署就是"发静态文件"、以及之前埋的伏笔——Nginx 的 SPA history 回退。配套落地了 `Dockerfile` + `deploy/nginx.conf`。

## 1. 先建立认知：前端部署 = 发一堆静态文件

后端部署你很熟：打个 jar/war，丢到服务器上跑一个常驻进程，对外提供服务。

**前端（这种纯客户端 SPA）完全不同**：

```text
构建产物是一堆静态文件（html / js / css / 图片）。
"部署"就是把这堆文件放到任意能发静态文件的地方：
  Nginx / Apache / 对象存储(OSS/S3) + CDN / GitHub Pages / Vercel …
浏览器把这些文件下载下来，在用户的浏览器里跑。
线上不需要 Node 进程常驻（注意：这说的是纯客户端 SPA，SSR/Next.js 那种另说）。
```

一句话对比：

```text
后端：部署一个"运行中的程序"
前端：部署一堆"静态资源"，由浏览器去跑
```

## 2. npm run build 产出了什么

```bash
npm run build   # = tsc --noEmit && vite build
```

两步：

```text
tsc --noEmit   类型检查这道"质量闸门"。类型不过，构建直接失败，坏代码进不了产物。
vite build     真正打包：把 TS/JSX/CSS 编译、压缩、打包成浏览器能直接跑的静态文件，输出到 dist/
```

本项目 `dist/` 结构：

```text
dist
├── index.html                  入口页（很小，主要是挂载点 + 引用下面的 js/css）
├── assets
│   ├── index-PxO5SnbU.js        打包压缩后的全部 JS（190KB / gzip 后 62KB）
│   └── index-fTb_MjfI.css       打包压缩后的 CSS
├── mockServiceWorker.js        public/ 里的文件被原样拷过来（见 §5）
└── users.json                  同上，第一阶段遗留的本地数据
```

### 2.1 文件名里的 hash 是干嘛的

`index-PxO5SnbU.js` 里的 `PxO5SnbU` 是**内容指纹**：

```text
文件内容变了 -> hash 变 -> 文件名变 -> URL 变 -> 浏览器/CDN 缓存自然失效，拉到新版本。
文件内容没变 -> 文件名不变 -> 可以放心长期强缓存。
这叫"缓存失效（cache busting）"，是前端发版能即时生效又能吃满缓存的关键。
```

所以部署时可以对 `/assets/` 下的文件配置"缓存一年"，对 `index.html` 配置"不缓存"（它要每次拿最新的，才能引用到新 hash 的 js）。

## 3. 环境变量在构建时被"焊死"进产物

这是后端开发者最容易误解的一点：

```text
后端：配置在运行时读（application.yml、环境变量），同一个 jar 换台机器读不同配置。
前端：VITE_ 变量在【构建时】就被替换成字面量，焊死进 js 文件里，运行时不能再改。
```

所以**不同环境要分别构建**。本次实测验证（在 dist 的 js 里 grep）：

```text
生产构建（加载 .env.production）：
  ✓ 注入了生产 API 地址 https://api.mycompany.com/api
  ✓ 没有泄漏 dev 地址 localhost:8080
  ✓ setupWorker（MSW）出现 0 次 —— mock 代码完全没进生产包
```

MSW 为什么没进生产包？回顾 `main.tsx`：

```ts
if (import.meta.env.VITE_USE_MOCK !== 'true') return;   // 生产环境这里直接 return
const { worker } = await import('./mocks/browser');     // 动态 import
```

`.env.production` 没定义 `VITE_USE_MOCK`，构建时它被替换为 `undefined`，条件恒为真直接 `return`，后面的动态 `import('./mocks/browser')` 成了**不可达死代码**，被打包器摇掉（tree-shaking）。这正是当初用"动态 import + 开关"而不是顶部静态 import 的回报：**生产包干净，不含一行 mock 代码**。

## 4. 部署的真正难点：SPA history 回退（伏笔回收）

这是 `week-04-2` 路由那节埋的坑，现在正式解决。

问题场景：

```text
用户在 /users/1 这个页面，按了刷新（或直接把链接发给别人打开）。
浏览器向服务器发 GET /users/1。
但服务器磁盘上根本没有 /users/1 这个文件（只有 index.html 和 assets/）。
默认行为：返回 404。
```

根因：

```text
/users/1 是【前端路由】，只存在于浏览器里 React Router 的认知中，
服务器对它一无所知。
```

解决：让服务器对所有"找不到对应文件"的请求，统统返回 `index.html`：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

```text
try_files 依次尝试：真实文件 $uri -> 目录 $uri/ -> 都没有就回退到 /index.html。
于是 /users/1 也返回 index.html，浏览器加载 JS 后，
React Router 读取当前 URL（/users/1）渲染出详情页。
```

这是**所有 BrowserRouter SPA 部署的标准动作**，是后端工程师第一次部署前端最常踩的雷。（本地 `vite preview` 自带这个回退，所以开发时感觉不到；上线到裸 Nginx 必须手动配。）

## 5. 落地的部署文件

### 5.1 deploy/nginx.conf

除了上面的 `try_files` 回退，还配了两件实用的事：

```nginx
# 文本资源开 gzip，减小传输体积
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;

# 带 hash 的资源长期强缓存（内容变了文件名就变，不怕缓存旧版本）
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 5.2 Dockerfile（多阶段构建）

```dockerfile
# 阶段一：用 Node 构建出 dist/
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                # 先装依赖（利用层缓存：清单没变就不重装）
COPY . .
RUN npm run build

# 阶段二：用 Nginx 托管 dist/
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

两个关键设计：

```text
多阶段构建：阶段一编译，阶段二只拷 dist。
  最终镜像 = Nginx + 静态文件，不含 node_modules / 源码。
  体积小、攻击面小、启动快。

层缓存优化：先 COPY package*.json + npm ci，再 COPY 源码。
  只改业务代码时，依赖层命中缓存，不重新装 120+ 个包，构建快很多。
  类比后端 Docker 镜像里先拷 pom.xml 跑 mvn dependency:go-offline 的套路。
```

构建运行（在装了 Docker 的机器上）：

```bash
docker build -t user-management .
docker run -p 8080:80 user-management
# 打开 http://localhost:8080 ，访问 /users/1 刷新不再 404
```

## 6. 验证结果

```text
npm run build   成功（286 个模块），dist/ 产物如 §2
bundle 实测     生产 API 地址已注入、无 dev 地址泄漏、MSW 零残留（§3）
SPA 回退        逻辑已在 week-04-2 用 vite preview 验证（/users/1 返回 200）
部署文件        Dockerfile / .dockerignore / deploy/nginx.conf 已落地
```

说明：本环境 Docker 守护进程无权限，未实际构建镜像；Dockerfile 与 nginx 配置为标准写法，可在有 Docker 的机器上 `docker build` 运行。

## 7. 本节小结

```text
前端部署     发一堆静态文件，浏览器去跑；纯 SPA 线上不需要 Node 进程
npm run build  tsc 类型闸门 + vite 打包 -> dist/（index.html + 带 hash 的 assets）
hash 文件名   内容指纹，做缓存失效：assets 长期强缓存，index.html 不缓存
环境变量焊死  VITE_ 变量构建时替换成字面量，不同环境分别构建
生产包干净    动态 import + 关闭开关 -> MSW 被 tree-shaking，零残留（实测验证）
SPA 回退      try_files $uri $uri/ /index.html，否则深链接刷新 404（必配）
Nginx 配置    回退 + gzip + assets 强缓存
Dockerfile   多阶段构建（Node 编译 / Nginx 托管）+ 依赖层缓存优化
```

## 8. 下一步学习建议

```text
1. 与真实 Spring Boot 联调：VITE_USE_MOCK=false，对接真实接口跑通登录+CRUD+分页全链路（第四阶段最后一块）。
2. CI/CD：把 npm ci && npm run build && npm test 接进流水线，自动构建部署。
3. 端到端测试：引入 Playwright，用真实浏览器跑"登录->查询->翻页->编辑"主流程。
4. 性能优化：路由级代码分割（按页面拆 chunk）、首屏资源优化。
```
