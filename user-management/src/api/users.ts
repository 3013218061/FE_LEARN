import type {
  User,
  FetchUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';
import { request } from './request';

// 查询用户列表
export async function fetchUsers(
  { keyword = '', shouldFail = false }: FetchUsersParams = {},
): Promise<User[]> {
  const path = shouldFail ? '/users-not-exist' : '/users';
  const users = await request<User[]>(path);

  // keyword 过滤仍放在前端做（真实项目里应作为 query 参数传给后端）
  const trimmed = keyword.trim();
  if (!trimmed) {
    return users;
  }
  return users.filter((user) => user.name.includes(trimmed));
}

// 新增用户
export async function createUser(payload: CreateUserRequest): Promise<User> {
  return request<User>('/users', { method: 'POST', body: payload });
}

// 更新用户
export async function updateUser(
  id: number,
  payload: UpdateUserRequest,
): Promise<User> {
  return request<User>(`/users/${id}`, { method: 'PUT', body: payload });
}

// 删除用户
export async function deleteUserApi(id: number): Promise<void> {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}
