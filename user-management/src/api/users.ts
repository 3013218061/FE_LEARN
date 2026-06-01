import type {
  User,
  FetchUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';
import { request } from './request';

// 模拟网络延迟（写操作暂时仍走本地模拟，见下方注释）
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 查询用户列表 —— 已通过统一的 request 函数走 GET /users。
// 注意：当前 VITE_API_BASE_URL 指向 http://localhost:8080/api，
// 该后端尚未存在，这个请求会触发 ApiError 进入错误分支。
// 这恰好验证了：错误处理链路在 request → fetchUsers → App → UI 已经打通。
// 下一节我们会加 mock，让页面恢复可用。
export async function fetchUsers(
  { keyword = '', shouldFail = false }: FetchUsersParams = {},
): Promise<User[]> {
  const path = shouldFail ? '/users-not-exist' : '/users';
  const users = await request<User[]>(path);

  const trimmed = keyword.trim();
  if (!trimmed) {
    return users;
  }
  return users.filter((user) => user.name.includes(trimmed));
}

// 以下为写操作。当前无真实后端，仍用 setTimeout 模拟。
// 后端就绪后，照下方注释把模拟体替换成 request 调用即可——
// 组件层一行都不用改，这就是分层的红利。

// 接入后真实写法：
//   return request<User>('/users', { method: 'POST', body: payload });
export async function createUser(payload: CreateUserRequest): Promise<User> {
  await delay(300);
  return { id: Date.now(), ...payload };
}

// 接入后真实写法：
//   return request<User>(`/users/${id}`, { method: 'PUT', body: payload });
export async function updateUser(
  id: number,
  payload: UpdateUserRequest,
): Promise<User> {
  await delay(300);
  return { id, ...payload };
}

// 接入后真实写法：
//   return request<void>(`/users/${id}`, { method: 'DELETE' });
export async function deleteUserApi(id: number): Promise<void> {
  await delay(300);
  void id;
}
