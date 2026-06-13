# 多阶段构建：
#   阶段一用 Node 把源码编译成静态产物 dist/
#   阶段二用 Nginx 托管 dist/
# 好处：最终镜像只含 Nginx + 静态文件，不含 node_modules / 源码，
#       体积小、攻击面小、启动快。

# ---- 阶段一：构建 ----
FROM node:20-alpine AS build
WORKDIR /app

# 先只拷依赖清单，充分利用 Docker 层缓存：
# 只要 package*.json 没变，这一层就命中缓存，不用重新 npm ci。
COPY package.json package-lock.json ./
RUN npm ci

# 再拷源码并构建（生产构建会加载 .env.production，注入真实 API 地址、关闭 mock）
COPY . .
RUN npm run build

# ---- 阶段二：运行 ----
FROM nginx:1.27-alpine

# 用我们的配置替换默认站点（含 SPA history 回退）
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 只把构建产物拷进镜像，源码和依赖都留在阶段一
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
