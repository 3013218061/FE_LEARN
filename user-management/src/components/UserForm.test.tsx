import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from './UserForm';
import type { User } from '../types/user';

describe('UserForm 组件', () => {
  it('新增模式：渲染空表单，标题与按钮为"新增用户"', () => {
    render(
      <UserForm
        mode="create"
        editingUser={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    // 标题和按钮都叫"新增用户"，用 role 区分，避免歧义
    expect(
      screen.getByRole('heading', { name: '新增用户' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名')).toHaveValue('');
  });

  it('提交空表单：显示字段校验错误，且不调用 onSubmit', async () => {
    const onSubmit = vi.fn();
    render(
      <UserForm
        mode="create"
        editingUser={null}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '新增用户' }));

    expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
    expect(screen.getByText('角色不能为空')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('填写后提交：onSubmit 收到去掉首尾空格的值', async () => {
    const onSubmit = vi.fn();
    render(
      <UserForm
        mode="create"
        editingUser={null}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), '  小明  ');
    await userEvent.type(screen.getByPlaceholderText('请输入角色'), '运营');
    await userEvent.click(screen.getByRole('button', { name: '新增用户' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '小明',
      role: '运营',
      status: 'enabled',
    });
  });

  it('编辑模式：预填充当前用户，按钮变为"保存修改"', () => {
    const user: User = {
      id: 1,
      name: '张三',
      role: '管理员',
      status: 'enabled',
    };
    render(
      <UserForm
        mode="edit"
        editingUser={user}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('张三')).toBeInTheDocument();
    expect(screen.getByDisplayValue('管理员')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '保存修改' }),
    ).toBeInTheDocument();
  });
});
