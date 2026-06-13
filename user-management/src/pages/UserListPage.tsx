import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type {
  User,
  FormMode,
  CreateUserRequest,
  SortOrder,
} from '../types/user';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUserApi,
} from '../api/users';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';

const PAGE_SIZE = 5;

export default function UserListPage() {
  // ===== 服务端数据状态 =====
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===== 本地 UI 状态 =====
  const [mode, setMode] = useState<FormMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // useSearchParams：把 URL 的查询串（?keyword=..&page=..&sort=..）当成一份"状态"读写。
  // 好处：查询条件可被收藏/分享，刷新页面不丢，前进后退也能复现。
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 是查询条件的唯一数据源，组件每次渲染都从这里读
  const keyword = searchParams.get('keyword') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? '';
  const order = (searchParams.get('order') as SortOrder) ?? 'asc';

  // 搜索框是"本地受控输入"，按"查询"才提交到 URL（避免每敲一个字就改 URL+请求）
  const [keywordInput, setKeywordInput] = useState(keyword);
  // URL 上的 keyword 变了（比如点了后退），同步回输入框
  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function loadUsers(options?: { shouldFail?: boolean }) {
    setLoading(true);
    setError('');
    try {
      const result = await fetchUsers({
        keyword,
        page,
        pageSize: PAGE_SIZE,
        sort,
        order,
        shouldFail: options?.shouldFail,
      });
      setUsers(result.list);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  // 关键：依赖 searchParams。URL 一变（翻页 / 搜索 / 排序）就自动重新拉数据。
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 统一的"改查询条件"工具：在现有 params 上合并改动
  function updateParams(next: Record<string, string>, resetPage = false) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v) merged.set(k, v);
      else merged.delete(k);
    });
    // 改搜索或排序时回到第 1 页（否则可能停在一个不存在的页码）
    if (resetPage) merged.set('page', '1');
    setSearchParams(merged);
  }

  function handleSearch() {
    updateParams({ keyword: keywordInput.trim() }, true);
  }

  function handleSort(field: 'id' | 'name') {
    // 点同一列：切换升/降序；点新列：默认升序
    const nextOrder: SortOrder =
      sort === field && order === 'asc' ? 'desc' : 'asc';
    updateParams({ sort: field, order: nextOrder }, true);
  }

  function goToPage(p: number) {
    updateParams({ page: String(p) });
  }

  // ===== 表单提交：写操作后重新拉当前页（分页场景下比本地改数组更可靠）=====
  async function handleSubmit(payload: CreateUserRequest) {
    if (mode === 'edit' && editingUser) {
      await updateUser(editingUser.id, payload);
      setMessage('更新用户成功');
      setMode('create');
      setEditingUser(null);
    } else {
      await createUser(payload);
      setMessage('新增用户成功');
    }
    loadUsers();
  }

  function handleEdit(user: User) {
    setMode('edit');
    setEditingUser(user);
  }

  function handleCancelEdit() {
    setMode('create');
    setEditingUser(null);
  }

  function handleView(user: User) {
    navigate(`/users/${user.id}`);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('确定要删除该用户吗？')) {
      return;
    }
    await deleteUserApi(id);
    setMessage('删除用户成功');
    loadUsers();
  }

  async function handleToggleStatus(user: User) {
    const nextStatus = user.status === 'enabled' ? 'disabled' : 'enabled';
    await updateUser(user.id, { ...user, status: nextStatus });
    setMessage(`已${nextStatus === 'enabled' ? '启用' : '禁用'}用户`);
    loadUsers();
  }

  return (
    <>
      <div className="toolbar">
        <input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          placeholder="按用户名查询"
        />
        <button onClick={handleSearch}>查询</button>
        <button onClick={() => loadUsers({ shouldFail: true })}>
          模拟失败
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      <UserForm
        mode={mode}
        editingUser={editingUser}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
      />

      {loading && <p className="status-text">加载中...</p>}
      {!loading && error && <p className="status-text error">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className="status-text">暂无数据</p>
      )}
      {!loading && !error && users.length > 0 && (
        <>
          <UserTable
            users={users}
            sort={sort}
            order={order}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              上一页
            </button>
            <span>
              第 {page} / {totalPages} 页，共 {total} 条
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </>
  );
}
