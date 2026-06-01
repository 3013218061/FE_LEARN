// 通用请求层：所有横切关注点（baseUrl、header、状态码判断、JSON 解析、错误包装）
// 集中在这里。业务 API 层只表达"我要什么"，不重复"怎么发请求"。

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

  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
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
