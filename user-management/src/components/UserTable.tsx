import type { User, SortOrder } from '../types/user';

// props = 这个组件的"入参"，类比 Java 方法签名
// 数据（users）往下传，事件（onXxx 回调）往上抛
interface UserTableProps {
  users: User[];
  sort: string;
  order: SortOrder;
  onSort: (field: 'id' | 'name') => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (user: User) => void;
}

export function UserTable({
  users,
  sort,
  order,
  onSort,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserTableProps) {
  // 当前列的排序指示箭头：升序 ▲ 降序 ▼，未按此列排则不显示
  function sortIndicator(field: string) {
    if (sort !== field) return '';
    return order === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th className="sortable" onClick={() => onSort('id')}>
            ID{sortIndicator('id')}
          </th>
          <th className="sortable" onClick={() => onSort('name')}>
            用户名{sortIndicator('name')}
          </th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {/* 注意：这里直接写 {user.name}，React 默认转义，
                所以 XSS 测试数据只会作为纯文本显示，不会执行 */}
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>
              <span className={`status status-${user.status}`}>
                {user.status === 'enabled' ? '启用' : '禁用'}
              </span>
            </td>
            <td>
              <button onClick={() => onView(user)}>详情</button>
              <button onClick={() => onEdit(user)}>编辑</button>
              <button onClick={() => onToggleStatus(user)}>
                {user.status === 'enabled' ? '禁用' : '启用'}
              </button>
              <button onClick={() => onDelete(user.id)}>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
