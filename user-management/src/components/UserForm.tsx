import { useEffect } from 'react';
import type { User, UserStatus, FormMode, CreateUserRequest } from '../types/user';
import { useForm, type Validator } from '../hooks/useForm';

interface UserFormProps {
  mode: FormMode;
  // 编辑模式下传入当前正在编辑的用户，新增模式下为 null
  editingUser: User | null;
  onSubmit: (payload: CreateUserRequest) => void;
  onCancel: () => void;
}

// 表单内部的值结构（用 type 而非 interface，才满足 useForm 的 Record 约束）
type UserFormValues = {
  name: string;
  role: string;
  status: UserStatus;
};

const EMPTY: UserFormValues = { name: '', role: '', status: 'enabled' };

// 校验规则独立成函数：和渲染解耦，复用 / 单测都方便
const validateUser: Validator<UserFormValues> = (values) => {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};
  if (!values.name.trim()) errors.name = '用户名不能为空';
  if (!values.role.trim()) errors.role = '角色不能为空';
  return errors;
};

export function UserForm({
  mode,
  editingUser,
  onSubmit,
  onCancel,
}: UserFormProps) {
  // 表单状态与校验全部交给 useForm，组件只负责"长什么样、点了怎么办"
  const { values, errors, setField, reset, submit } = useForm(
    EMPTY,
    validateUser,
  );

  // 切换新增/编辑时，把表单重置为对应初始值
  useEffect(() => {
    if (mode === 'edit' && editingUser) {
      reset({
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status,
      });
    } else {
      reset(EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, editingUser]);

  function handleSubmit() {
    submit((v) =>
      onSubmit({ name: v.name.trim(), role: v.role.trim(), status: v.status }),
    );
  }

  return (
    <div className="user-form">
      <h3>{mode === 'edit' ? '编辑用户' : '新增用户'}</h3>
      <div className="form-row">
        <label>用户名</label>
        <input
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="请输入用户名"
        />
      </div>
      {errors.name && <p className="form-error">{errors.name}</p>}

      <div className="form-row">
        <label>角色</label>
        <input
          value={values.role}
          onChange={(event) => setField('role', event.target.value)}
          placeholder="请输入角色"
        />
      </div>
      {errors.role && <p className="form-error">{errors.role}</p>}

      <div className="form-row">
        <label>状态</label>
        <select
          value={values.status}
          onChange={(event) =>
            setField('status', event.target.value as UserStatus)
          }
        >
          <option value="enabled">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit}>
          {mode === 'edit' ? '保存修改' : '新增用户'}
        </button>
        {mode === 'edit' && <button onClick={onCancel}>取消编辑</button>}
      </div>
    </div>
  );
}
