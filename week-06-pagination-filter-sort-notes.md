# 第四阶段（三）：分页 / 筛选 / 排序与 URL 状态同步

本笔记承接 `week-05-auth-route-guard-notes.md`，记录后台列表页最核心的硬功夫：分页、筛选、排序，并用 `useSearchParams` 把这些查询条件同步到 URL。它把之前的「前端假过滤」彻底升级成「后端真分页」。

## 1. 先纠正一个之前的"教学用简化"

前几节里 `fetchUsers` 是这样过滤的：

```ts
// 旧写法：后端返回全部，前端自己 filter
const users = await request<User[]>('/users');
return users.filter((u) => u.name.includes(keyword));
```

这在数据少时没问题，但**真实后台系统绝不能这么干**：

```text
用户表可能有几十万行。
把全部数据拉到浏览器再过滤，会：
  - 网络传输巨大
  - 浏览器内存吃不消
  - 首屏巨慢
所以"筛选、排序、分页"必须由后端在数据库层面做，前端只传参数、只展示当前页。
```

这一节就是把这条原则落地：前端传 `keyword / page / pageSize / sort / order`，后端返回**当前页的数据 + 总条数**。

## 2. 核心契约：分页结果 PageResult<T>

```ts
export interface PageResult<T> {
  list: T[];
  total: number;   // 满足条件的总条数（不是当前页的条数！）
  page: number;
  pageSize: number;
}
```

```text
list     当前页的数据（比如第 2 页的 5 条）
total    满足筛选条件的总数（用来算"共多少页"）
page     当前页码
pageSize 每页条数
```

Java 类比：这就是 MyBatis-Plus 的 `IPage<T>` 或 Spring Data 的 `Page<T>`。`total` 是最关键的字段——没有它前端算不出总页数。这也是泛型 `<T>` 的经典用途：分页结构对任何实体都通用（`PageResult<User>` / `PageResult<Order>`）。

## 3. 三个变化点

```text
api/users.ts        fetchUsers 把条件拼成 query string，返回 PageResult<User>
mocks/handlers.ts   GET /users 真的做"筛选 -> 排序 -> 分页"三步
pages/UserListPage  用 useSearchParams 把条件存进 URL，监听 URL 变化重新拉数据
components/UserTable 表头可点击排序
```

## 4. API 层：用 URLSearchParams 安全拼接 query

```ts
export async function fetchUsers(params: FetchUsersParams = {}): Promise<PageResult<User>> {
  const { keyword = '', page = 1, pageSize = 5, sort = '', order = 'asc' } = params;

  const query = new URLSearchParams();
  if (keyword.trim()) query.set('keyword', keyword.trim());
  query.set('page', String(page));
  query.set('pageSize', String(pageSize));
  if (sort) {
    query.set('sort', sort);
    query.set('order', order);
  }

  return request<PageResult<User>>(`/users?${query.toString()}`);
}
```

教学点：

```text
不要手动用字符串拼 `?keyword=` + keyword —— 中文、空格、& 等字符会出问题。
URLSearchParams 会自动做 URL 编码（"张三" -> "%E5%BC%A0%E4%B8%89"），安全且省心。
query.toString() 生成 "keyword=张三&page=1&pageSize=5"。
```

注意返回类型从 `Promise<User[]>` 变成了 `Promise<PageResult<User>>`，调用方拿到的不再是数组，而是带 `total` 的分页对象。

## 5. Mock 后端：筛选 → 排序 → 分页 三步走

这三步的**顺序不能乱**，是所有后端分页查询的标准流程：

```ts
// 1) 筛选：先按条件缩小数据集
let result = mockUsers;
if (keyword) {
  result = result.filter((u) => u.name.includes(keyword));
}

// 2) 排序：在筛选结果上排（只允许白名单字段，防乱传）
if (sort === 'id' || sort === 'name') {
  result = [...result].sort((a, b) => {
    const cmp = sort === 'id' ? a.id - b.id : a.name.localeCompare(b.name, 'zh');
    return order === 'desc' ? -cmp : cmp;
  });
}

// 3) 分页：最后才切片，total 取筛选后的总数
const total = result.length;
const start = (page - 1) * pageSize;
const list = result.slice(start, start + pageSize);

return HttpResponse.json({ list, total, page, pageSize });
```

几个要点：

```text
顺序：必须"先筛选，再排序，最后分页"。
      total 要在分页前算（是满足条件的总数，不是当前页数量）。
排序字段白名单：只允许 'id' | 'name'，不能前端传什么就按什么排
      —— 对应后端防 SQL 注入 / 防乱排序，是安全习惯。
中文排序：a.name.localeCompare(b.name, 'zh') 才能按中文/拼音正确排，
      直接 a > b 比的是 Unicode 码点，中文会乱。
切片公式：start = (page - 1) * pageSize，对应 SQL 的 LIMIT pageSize OFFSET start。
```

## 6. 本节主角：useSearchParams 把查询条件放进 URL

这是和上一节路由的衔接点。`useSearchParams` 让你像用 `useState` 一样读写 URL 的查询串。

### 6.1 为什么要把条件放 URL，而不是放 useState？

```text
放 useState：刷新页面条件就没了，也没法把"筛选后的结果"发给同事。
放 URL：    /users?keyword=张&page=2&sort=name&order=desc
  - 刷新页面，条件还在（从 URL 重新读）
  - 复制链接发给别人，他打开看到的是同样的筛选结果
  - 浏览器前进/后退能在不同筛选状态间切换
  - URL 成了"可分享、可收藏、可回溯"的状态容器
```

这是后台系统的体验细节，做与不做差别很大。

### 6.2 用法：URL 是唯一数据源

```tsx
const [searchParams, setSearchParams] = useSearchParams();

// 读：每次渲染都从 URL 读当前条件
const keyword = searchParams.get('keyword') ?? '';
const page = Number(searchParams.get('page') ?? '1');
const sort = searchParams.get('sort') ?? '';
const order = (searchParams.get('order') as SortOrder) ?? 'asc';
```

```text
心智模型：不再用一堆 useState 存 page/sort/keyword，
而是统一从 URL 读。URL 就是这些条件的"单一事实来源"（single source of truth）。
```

### 6.3 改条件 = 改 URL，然后 useEffect 自动重新请求

```tsx
// 监听 URL 变化：翻页/搜索/排序改了 URL，这里就自动重新拉数据
useEffect(() => {
  loadUsers();
}, [searchParams]);

// 改条件的统一工具
function updateParams(next: Record<string, string>, resetPage = false) {
  const merged = new URLSearchParams(searchParams);
  Object.entries(next).forEach(([k, v]) => (v ? merged.set(k, v) : merged.delete(k)));
  if (resetPage) merged.set('page', '1'); // 改搜索/排序要回第 1 页
  setSearchParams(merged);
}

function handleSearch() { updateParams({ keyword: keywordInput.trim() }, true); }
function handleSort(field) {
  const nextOrder = sort === field && order === 'asc' ? 'desc' : 'asc';
  updateParams({ sort: field, order: nextOrder }, true);
}
function goToPage(p) { updateParams({ page: String(p) }); }
```

数据流形成一个干净的单向闭环：

```text
用户点"下一页" / "查询" / 排序表头
  -> 改 searchParams（即改 URL）
  -> useEffect 监听到 searchParams 变化
  -> 重新 fetchUsers（带新条件）
  -> setUsers / setTotal
  -> 重新渲染
```

注意没有"点下一页 → 直接改 page state → 手动请求"这种命令式写法，而是**所有操作都先改 URL，再由 URL 驱动请求**。这就是声明式、URL 驱动的思路。

### 6.4 一个易错点：搜索框为什么还要本地 state？

```tsx
const [keywordInput, setKeywordInput] = useState(keyword);
useEffect(() => setKeywordInput(keyword), [keyword]); // URL 变了同步回输入框
```

```text
如果把输入框直接绑到 URL 的 keyword，每敲一个字就改 URL + 发一次请求 —— 太猛。
所以：输入框用本地 state（受控），点"查询"或回车才把值提交到 URL。
再加一个 useEffect：当 URL 上的 keyword 被外部改变（如点后退），同步回输入框。
```

这是"即时编辑的草稿态"和"已提交的正式态"分离，真实项目里很常见。

### 6.5 改搜索/排序要回第 1 页

```text
你在第 3 页，改了搜索词，新结果可能只有 1 页 —— 还停在 page=3 就会空白。
所以约定：改 keyword 或 sort 时，page 重置为 1。翻页本身则不重置。
```

## 7. 写操作后为什么改成"重新拉当前页"

引入分页后，新增/删除/改状态不再本地改数组，而是重新 `loadUsers()`：

```tsx
async function handleDelete(id: number) {
  await deleteUserApi(id);
  loadUsers(); // 重新拉当前页
}
```

```text
原因：列表现在是"服务端某一页的快照"。
本地删一条，会让当前页变 4 条、总数对不上、下一页数据错位。
重新拉当前页，让前端和后端状态重新对齐，最简单也最可靠。
代价是多一次请求，但换来数据一致性，后台系统通常这么取舍。
```

## 8. 验证结果

```text
npm run build    成功（tsc --noEmit 通过 + vite build，285 个模块）
```

mock 共 8 条数据、每页 5 条，所以默认有 2 页。浏览器手工验证建议覆盖：

```text
- 翻到第 2 页，看 URL 变成 ?page=2，刷新页面仍停在第 2 页
- 点"ID/用户名"表头排序，URL 出现 sort/order，箭头 ▲▼ 正确
- 搜索"张"，URL 出现 keyword，结果回到第 1 页
- 删除一条后，列表自动刷新、总数变化
```

（MSW 是浏览器内 Service Worker，分页/排序逻辑只在真实浏览器里跑，preview 服务器不执行。）

## 9. 本节小结

```text
后端分页    筛选/排序/分页必须后端做，前端只传参 + 展示当前页（数据量大时是硬约束）
PageResult  { list, total, page, pageSize }，total 是关键，类比后端 Page<T>
拼 query    用 URLSearchParams，自动 URL 编码，别手拼字符串
三步顺序    先筛选 -> 再排序 -> 最后分页；total 在分页前算
排序白名单  只允许指定字段排序（安全），中文用 localeCompare(.., 'zh')
useSearchParams  把查询条件放 URL：可分享/可收藏/刷新不丢/前进后退可回溯
URL 驱动    改条件 = 改 URL，useEffect 监听 searchParams 自动重新请求（单向闭环）
草稿 vs 提交 搜索框用本地 state，回车/点查询才提交到 URL
回第一页    改搜索或排序时 page 重置为 1
写后重拉    分页场景下，增删改后重新拉当前页，保证前后端一致
```

## 10. 下一步学习建议

```text
1. 表单抽象：把 UserForm 的校验、字段配置抽成可复用的表单方案。
2. 引入 Vitest：对 fetchUsers 的 query 拼接、mock 的筛选/排序/分页逻辑写单元测试。
3. 与真实 Spring Boot 联调：把 VITE_USE_MOCK 改 false，对接真实分页接口（Page<T>）。
4. 列表体验增强：防抖搜索（输入停顿才查）、每页条数可选、加载骨架屏。
```
