import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, FormMode, CreateUserRequest } from '../types/user';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUserApi,
} from '../api/users';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';

// 这就是原来 App.tsx 里那一整套用户管理逻辑，原封不动搬成一个"页面组件"。
// 引入路由后，App 只管路由表，具体页面逻辑下沉到 pages/。
export default function UserListPage() {
  // ===== 状态层 =====
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [mode, setMode] = useState<FormMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');

  // useNavigate 给你一个"编程式跳转"函数：在事件处理里手动决定跳哪。
  // 对应"声明式跳转"的 Link/NavLink（点击即跳）。
  const navigate = useNavigate();

  // ===== 加载用户列表 =====
  async function loadUsers(options?: { shouldFail?: boolean }) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers({
        keyword,
        shouldFail: options?.shouldFail,
      });
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(payload: CreateUserRequest) {
    if (mode === 'edit' && editingUser) {
      const updated = await updateUser(editingUser.id, payload);
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      setMessage('更新用户成功');
      setMode('create');
      setEditingUser(null);
    } else {
      const created = await createUser(payload);
      setUsers((prev) => [...prev, created]);
      setMessage('新增用户成功');
    }
  }

  function handleEdit(user: User) {
    setMode('edit');
    setEditingUser(user);
  }

  function handleCancelEdit() {
    setMode('create');
    setEditingUser(null);
  }

  // 跳到详情页：拼出 /users/:id，URL 变化但不整页刷新
  function handleView(user: User) {
    navigate(`/users/${user.id}`);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('确定要删除该用户吗？')) {
      return;
    }
    await deleteUserApi(id);
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setMessage('删除用户成功');
  }

  async function handleToggleStatus(user: User) {
    const nextStatus = user.status === 'enabled' ? 'disabled' : 'enabled';
    const updated = await updateUser(user.id, { ...user, status: nextStatus });
    setUsers((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setMessage(`已${nextStatus === 'enabled' ? '启用' : '禁用'}用户`);
  }

  return (
    <>
      <div className="toolbar">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="按用户名查询"
        />
        <button onClick={() => loadUsers()}>查询</button>
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
        <UserTable
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </>
  );
}
