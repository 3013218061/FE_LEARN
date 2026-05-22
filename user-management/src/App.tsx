import { useState, useEffect } from 'react';
import type { User, FormMode, CreateUserRequest } from './types/user';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUserApi,
} from './api/users';
import { UserTable } from './components/UserTable';
import { UserForm } from './components/UserForm';
import './App.css';

export default function App() {
  // ===== 状态层 =====
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [mode, setMode] = useState<FormMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');

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

  // 页面初次渲染后自动加载一次（useEffect 的典型用法）
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 表单提交：根据 mode 区分新增 / 编辑 =====
  async function handleSubmit(payload: CreateUserRequest) {
    if (mode === 'edit' && editingUser) {
      const updated = await updateUser(editingUser.id, payload);
      // 不可变更新：用 map 生成新数组，而不是直接改原数组
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
    <div className="app">
      <h1>用户管理（React + TypeScript 版）</h1>

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

      {/* loading / error / empty / success 四种状态 */}
      {loading && <p className="status-text">加载中...</p>}
      {!loading && error && <p className="status-text error">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className="status-text">暂无数据</p>
      )}
      {!loading && !error && users.length > 0 && (
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
