# user-management 联调后端（Spring Boot）

给前端学习项目 `../user-management` 做真实联调用的最小 Spring Boot 后端。
实现前端 `src/api` 约定的完整契约：登录发 token、Bearer 鉴权、用户的筛选/排序/分页与 CRUD。

## 接口契约

所有接口挂在 `/api` 前缀下（`server.servlet.context-path=/api`），监听 `8080`。

```text
POST   /api/login          {username,password} -> {token}（admin/123456；错误 401）
GET    /api/users          ?keyword&page&pageSize&sort&order -> {list,total,page,pageSize}
GET    /api/users/{id}     -> User（不存在 404）
POST   /api/users          {name,role,status} -> User
PUT    /api/users/{id}     {name,role,status} -> User
DELETE /api/users/{id}     -> 204
```

除 `/api/login` 外，所有请求必须带 `Authorization: Bearer <token>`，否则 `401`
（见 `AuthFilter`，对应前端 request 层"自动带 token + 401 统一跳登录"）。

数据为内存存储，8 条种子用户与前端 mock 完全一致（含一条 XSS 测试数据），重启即复位。

## 运行

需要 JDK 21 + Maven。

```bash
cd backend
mvn -DskipTests package
java -jar target/user-management-backend-0.0.1.jar
# 启动后监听 http://localhost:8080/api
```

## 与前端联调

```bash
# 1. 先按上面启动本后端（8080）
# 2. 切前端到真后端模式
#    user-management/.env.development 里 VITE_USE_MOCK=false
# 3. 启动前端
cd user-management && npm run dev
# 4. 浏览器打开 http://localhost:5173
#    前端请求 /api/* 经 Vite 代理(vite.config.ts server.proxy)转发到 8080，
#    同源通信、绕开 CORS。业务代码无需任何改动。
```

切回 mock：把 `VITE_USE_MOCK` 改回 `true` 即可，前端恢复独立运行（不依赖本后端）。

## 快速自测（不依赖浏览器）

```bash
B=http://localhost:8080/api
TOKEN=$(curl -s -X POST $B/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123456"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')
curl -s "$B/users?page=1&pageSize=5" -H "Authorization: Bearer $TOKEN"
```
