import { request } from './request';

// 登录请求体与返回体的类型契约
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// 登录：把用户名密码发给后端，换回一个 token。
// 注意：这次请求本身不需要带 token（你还没登录），request 层会自动跳过 Authorization 头。
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/login', { method: 'POST', body: payload });
}
