import type {
  User,
  FetchUsersParams,
  PageResult,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';
import { request } from './request';

// 查询用户列表：分页 / 筛选 / 排序全部作为 query 参数交给后端，
// 前端不再自己过滤分页（这才是真实后台系统的做法）。
export async function fetchUsers(
  params: FetchUsersParams = {},
): Promise<PageResult<User>> {
  const {
    keyword = '',
    page = 1,
    pageSize = 5,
    sort = '',
    order = 'asc',
    shouldFail = false,
  } = params;

  if (shouldFail) {
    // 仍保留"模拟失败"路径，触发一个 404
    return request<PageResult<User>>('/users-not-exist');
  }

  // URLSearchParams 帮我们安全地拼接 query string（自动做 URL 编码）
  const query = new URLSearchParams();
  const trimmed = keyword.trim();
  if (trimmed) {
    query.set('keyword', trimmed);
  }
  query.set('page', String(page));
  query.set('pageSize', String(pageSize));
  if (sort) {
    query.set('sort', sort);
    query.set('order', order);
  }

  return request<PageResult<User>>(`/users?${query.toString()}`);
}

// 查询单个用户（详情页用）
export async function getUser(id: number): Promise<User> {
  return request<User>(`/users/${id}`);
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
