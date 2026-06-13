// 用户状态：受限字符串类型，只能取这两个值
// 对应笔记里的 type UserStatus = 'enabled' | 'disabled'
export type UserStatus = 'enabled' | 'disabled';

// 表单模式：新增 or 编辑
export type FormMode = 'create' | 'edit';

// 排序方向
export type SortOrder = 'asc' | 'desc';

// 用户对象结构契约，类比 Java 的 UserVO
export interface User {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}

// 查询参数：分页 / 筛选 / 排序，字段都可选
export interface FetchUsersParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sort?: string; // 排序字段，如 'id' | 'name'
  order?: SortOrder;
  shouldFail?: boolean;
}

// 通用分页结果（泛型），类比后端的 PageResult<T> / Page<T>
export interface PageResult<T> {
  list: T[];
  total: number; // 满足条件的总条数（不是当前页条数）
  page: number;
  pageSize: number;
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
