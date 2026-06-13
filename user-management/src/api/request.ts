// 通用请求层：所有横切关注点（baseUrl、header、鉴权、状态码判断、JSON 解析、错误包装）
// 集中在这里。业务 API 层只表达"我要什么"，不重复"怎么发请求"。

import { getToken, clearToken } from '../auth/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 自定义错误类型，让上层既能拿到 message 也能拿到 HTTP 状态码。
// 类比后端的 BusinessException(code, message)。
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 401 统一处理回调：由 App 注册一个"跳登录页"的动作。
// request 层故意不直接依赖 React Router，靠这个回调解耦，
// 这样既能跳转又不会整页刷新（类比 axios 的响应拦截器里注入 navigate）。
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  // body 用 unknown 而不是 any：迫使内部主动序列化，
  // 不允许把任意类型直接当字符串塞进去。
  body?: unknown;
}

// 泛型 <T> 让调用方在调用点指定返回类型。
// 类比后端：T get(String url, Class<T> responseType)
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const url = `${API_BASE_URL}${path}`;

  // 请求拦截：有 token 就自动带上 Authorization 头，
  // 这样每个业务调用都不用自己操心鉴权头。
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
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

  // 响应拦截：401 = 未认证 / 登录过期。
  // 统一清掉本地 token 并跳登录页，业务代码不用每个接口都判断 401。
  if (response.status === 401) {
    clearToken();
    unauthorizedHandler?.();
    throw new ApiError(401, '登录已过期，请重新登录');
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
