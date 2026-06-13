import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchUsers } from './users';

function stubFetchCapture(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const emptyPage = { list: [], total: 0, page: 1, pageSize: 5 };

describe('fetchUsers query 拼接', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('把分页 / 筛选 / 排序拼进 query string', async () => {
    const fetchMock = stubFetchCapture(emptyPage);
    await fetchUsers({
      keyword: '张',
      page: 2,
      pageSize: 5,
      sort: 'name',
      order: 'desc',
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('keyword')).toBe('张'); // URLSearchParams 自动编解码
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('pageSize')).toBe('5');
    expect(url.searchParams.get('sort')).toBe('name');
    expect(url.searchParams.get('order')).toBe('desc');
  });

  it('没有 keyword 时不带 keyword 参数', async () => {
    const fetchMock = stubFetchCapture(emptyPage);
    await fetchUsers({ page: 1 });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.has('keyword')).toBe(false);
  });

  it('没有 sort 时不带 sort / order 参数', async () => {
    const fetchMock = stubFetchCapture(emptyPage);
    await fetchUsers({ keyword: '李', page: 1 });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.has('sort')).toBe(false);
    expect(url.searchParams.has('order')).toBe(false);
  });

  it('原样返回后端的分页结果', async () => {
    const page = { list: [{ id: 1, name: '张三', role: 'a', status: 'enabled' }], total: 1, page: 1, pageSize: 5 };
    stubFetchCapture(page);
    const result = await fetchUsers();
    expect(result).toEqual(page);
  });
});
