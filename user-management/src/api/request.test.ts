import { describe, it, expect, beforeEach, vi } from 'vitest';
import { request, ApiError, setUnauthorizedHandler } from './request';
import { getToken, setToken, clearToken } from '../auth/auth';

// 小工具：造一个返回指定响应的 fetch 替身
function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// 造一个 JSON 响应
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('request 通用请求层', () => {
  beforeEach(() => {
    clearToken();
    setUnauthorizedHandler(() => {});
    vi.restoreAllMocks();
  });

  it('200 时解析并返回 JSON', async () => {
    stubFetch(jsonResponse({ id: 1, name: '张三' }));
    const data = await request<{ id: number; name: string }>('/users/1');
    expect(data).toEqual({ id: 1, name: '张三' });
  });

  it('204 No Content 返回 undefined（不调用 .json()）', async () => {
    stubFetch(new Response(null, { status: 204 }));
    const data = await request<void>('/users/1', { method: 'DELETE' });
    expect(data).toBeUndefined();
  });

  it('非 2xx 抛出带状态码的 ApiError', async () => {
    stubFetch(new Response(null, { status: 500 }));
    await expect(request('/users')).rejects.toBeInstanceOf(ApiError);
    await expect(request('/users')).rejects.toMatchObject({ status: 500 });
  });

  it('有 token 时自动带上 Authorization 头', async () => {
    setToken('abc123');
    const fetchMock = stubFetch(jsonResponse([]));
    await request('/users');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc123');
  });

  it('没有 token 时不带 Authorization 头', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await request('/users');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('401 时清掉 token 并调用 unauthorizedHandler', async () => {
    setToken('expired');
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    stubFetch(new Response(null, { status: 401 }));

    await expect(request('/users')).rejects.toMatchObject({ status: 401 });
    expect(getToken()).toBeNull(); // token 被清掉
    expect(handler).toHaveBeenCalledOnce(); // 跳登录的回调被触发
  });

  it('网络层失败（fetch 抛错）包装成 status=0 的 ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Failed to fetch')),
    );
    await expect(request('/users')).rejects.toMatchObject({ status: 0 });
  });
});
