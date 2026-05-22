import { useState, useEffect } from 'react';
import type {
  User,
  UserStatus,
  FormMode,
  CreateUserRequest,
} from '../types/user';

interface UserFormProps {
  mode: FormMode;
  // 编辑模式下传入当前正在编辑的用户，新增模式下为 null
  editingUser: User | null;
  onSubmit: (payload: CreateUserRequest) => void;
  onCancel: () => void;
}

export function UserForm({
  mode,
  editingUser,
  onSubmit,
  onCancel,
}: UserFormProps) {
  // 受控组件：表单值存在 state 里，而不是去 DOM 里取
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<UserStatus>('enabled');
  const [error, setError] = useState('');

  // 当切换到编辑模式（editingUser 变化）时，把表单填充为该用户的值
  useEffect(() => {
    if (mode === 'edit' && editingUser) {
      setName(editingUser.name);
      setRole(editingUser.role);
      setStatus(editingUser.status);
    } else {
      setName('');
      setRole('');
      setStatus('enabled');
    }
    setError('');
  }, [mode, editingUser]);

  function handleSubmit() {
    if (!name.trim() || !role.trim()) {
      setError('用户名和角色不能为空');
      return;
    }
    setError('');
    onSubmit({ name: name.trim(), role: role.trim(), status });
  }

  return (
    <div className="user-form">
      <h3>{mode === 'edit' ? '编辑用户' : '新增用户'}</h3>
      <div className="form-row">
        <label>用户名</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="请输入用户名"
        />
      </div>
      <div className="form-row">
        <label>角色</label>
        <input
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="请输入角色"
        />
      </div>
      <div className="form-row">
        <label>状态</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as UserStatus)}
        >
          <option value="enabled">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button onClick={handleSubmit}>
          {mode === 'edit' ? '保存修改' : '新增用户'}
        </button>
        {mode === 'edit' && <button onClick={onCancel}>取消编辑</button>}
      </div>
    </div>
  );
}
