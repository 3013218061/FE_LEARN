import { http, HttpResponse, delay } from 'msw';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';

// 与 src/api/request.ts 用同一个 baseUrl，保证 handler URL 和真实请求 URL 完全一致
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 模拟一个"内存数据库"：mock 是有状态的，
// POST 之后真的多一条，DELETE 之后真的少一条，
// 体验和真实后端一致。
let mockUsers: User[] = [
  { id: 1, name: '张三', role: '管理员', status: 'enabled' },
  { id: 2, name: '李四', role: '运营', status: 'disabled' },
  { id: 3, name: '王五', role: '客服', status: 'enabled' },
  {
    id: 4,
    name: '<img src=x onerror=alert("xss")>',
    role: '<button onclick=alert("xss")>恶意角色</button>',
    status: 'enabled',
  },
];
let nextId = 5;

// 模拟后端鉴权：校验请求是否带了合法的 Bearer token。
// 没带或格式不对就返回 401，触发前端 request 层的统一 401 处理。
function requireToken(request: Request): Response | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new HttpResponse(null, { status: 401 });
  }
  return null;
}

export const handlers = [
  // POST /login —— 登录，校验账号密码后发 token
  http.post(`${API_BASE_URL}/login`, async ({ request }) => {
    await delay(300);
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };
    if (username === 'admin' && password === '123456') {
      return HttpResponse.json({ token: `mock-token-${Date.now()}` });
    }
    // 账号密码错误也用 401
    return new HttpResponse(null, { status: 401 });
  }),

  // GET /users —— 列表（受保护，需要 token）
  http.get(`${API_BASE_URL}/users`, async ({ request }) => {
    const denied = requireToken(request);
    if (denied) return denied;
    await delay(300); // 模拟网络延迟，让 loading 状态可观察
    return HttpResponse.json(mockUsers);
  }),

  // GET /users-not-exist —— 模拟失败按钮触发的 404
  http.get(`${API_BASE_URL}/users-not-exist`, async () => {
    await delay(300);
    return new HttpResponse(null, { status: 404 });
  }),

  // GET /users/:id —— 单个用户详情（详情页用，受保护）
  http.get(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    const denied = requireToken(request);
    if (denied) return denied;
    await delay(300);
    const id = Number(params.id);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // POST /users —— 新增（受保护）
  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    const denied = requireToken(request);
    if (denied) return denied;
    await delay(300);
    const payload = (await request.json()) as CreateUserRequest;
    const newUser: User = { id: nextId++, ...payload };
    mockUsers = [...mockUsers, newUser];
    return HttpResponse.json(newUser);
  }),

  // PUT /users/:id —— 更新（受保护，注意 :id 路径参数）
  http.put(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    const denied = requireToken(request);
    if (denied) return denied;
    await delay(300);
    const id = Number(params.id);
    const payload = (await request.json()) as UpdateUserRequest;
    const updated: User = { id, ...payload };
    mockUsers = mockUsers.map((u) => (u.id === id ? updated : u));
    return HttpResponse.json(updated);
  }),

  // DELETE /users/:id —— 删除，返回 204 No Content（受保护）
  http.delete(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    const denied = requireToken(request);
    if (denied) return denied;
    await delay(300);
    const id = Number(params.id);
    mockUsers = mockUsers.filter((u) => u.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
