import type {
  User,
  FetchUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';

// 从环境变量读取后端基础地址。
// 开发环境拿到 http://localhost:8080/api，生产环境拿到线上地址，
// 由当前构建模式决定，代码本身不需要任何 if 判断。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 模拟网络延迟，方便观察 loading 状态
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 查询用户列表
// 真实后端就绪后，请求地址应为 `${API_BASE_URL}/users`，
// 对应 Spring Boot 的 GET /api/users。
// 当前后端尚未存在，暂时仍从本地 public/users.json 取数据，
// 用 API_BASE_URL 拼出"将来的真实地址"仅用于演示与日志。
export async function fetchUsers(
  { keyword = '', shouldFail = false }: FetchUsersParams = {},
): Promise<User[]> {
  const realUrl = `${API_BASE_URL}/users`;
  console.log('[fetchUsers] 将来要请求的真实地址:', realUrl);

  // shouldFail 用来手动触发错误分支，验证 error 状态
  const url = shouldFail ? '/missing-users.json' : '/users.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`请求失败，HTTP 状态码：${response.status}`);
  }

  const users = (await response.json()) as User[];

  const trimmed = keyword.trim();
  if (!trimmed) {
    return users;
  }
  return users.filter((user) => user.name.includes(trimmed));
}

// 以下为写操作。当前没有真实后端，用延迟 + 返回构造好的对象来模拟。
// 接入 Spring Boot 后，把这些替换成 POST / PUT / DELETE 即可，
// 组件层完全不用改——这正是分层封装的价值。

export async function createUser(payload: CreateUserRequest): Promise<User> {
  await delay(300);
  // 真实项目里 id 由后端返回，这里用时间戳模拟
  return { id: Date.now(), ...payload };
}

export async function updateUser(
  id: number,
  payload: UpdateUserRequest,
): Promise<User> {
  await delay(300);
  return { id, ...payload };
}

export async function deleteUserApi(id: number): Promise<void> {
  await delay(300);
  void id;
}
