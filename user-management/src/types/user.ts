// 用户状态：受限字符串类型，只能取这两个值
// 对应笔记里的 type UserStatus = 'enabled' | 'disabled'
export type UserStatus = 'enabled' | 'disabled';

// 表单模式：新增 or 编辑
export type FormMode = 'create' | 'edit';

// 用户对象结构契约，类比 Java 的 UserVO
export interface User {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}

// 查询参数：两个字段都可选
export interface FetchUsersParams {
  keyword?: string;
  shouldFail?: boolean;
}

// 新增用户请求体：没有 id（id 由后端生成）
export interface CreateUserRequest {
  name: string;
  role: string;
  status: UserStatus;
}

// 更新用户请求体：结构和新增一致，但语义不同
export interface UpdateUserRequest {
  name: string;
  role: string;
  status: UserStatus;
}
