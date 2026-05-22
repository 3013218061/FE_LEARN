# 第二阶段 TypeScript 与工程化学习笔记

本笔记对应 `frontend-learning-plan.md` 的第二阶段，目标是在第一阶段原生 HTML / CSS / JavaScript 基础上，建立 TypeScript 类型系统和前端工程化的初步认知。

## 1. 为什么前端需要 TypeScript

先记结论：

```text
TypeScript = 给 JavaScript 加上编译期约束和更清晰的类型信息。
```

对有 Java 后端经验的开发者来说，可以把它理解成：

```text
把原本偏动态的前端代码，重新拉回到“有 DTO、有字段约束、有方法签名”的风格。
```

TypeScript 主要解决的问题：

```text
字段类型写错
字段名拼错
函数参数传错
返回值理解错
接口联调时字段对不上
重构时改漏
```

它不直接解决的问题：

```text
不会自动提升运行性能
不会自动修复业务逻辑 bug
不会替代测试
不会自动防 XSS
```

它的核心价值是：

```text
尽量把错误提前到“写代码时”暴露，而不是运行时才暴露。
```

## 2. TypeScript 基础类型

### 2.1 string

```ts
const userName: string = '张三';
const role: string = '管理员';
```

Java 类比：

```java
String userName = "张三";
String role = "管理员";
```

### 2.2 number

```ts
const id: number = 1;
const amount: number = 88000;
```

Java 粗略类比：

```java
int id = 1;
double amount = 88000;
```

注意：

```text
TypeScript 不区分 int / long / double，统一都是 number。
```

### 2.3 boolean

```ts
const loading: boolean = true;
const shouldFail: boolean = false;
```

Java 类比：

```java
boolean loading = true;
boolean shouldFail = false;
```

### 2.4 数组

```ts
const ids: number[] = [1, 2, 3];
const names: string[] = ['张三', '李四'];
```

也可以写成：

```ts
const ids: Array<number> = [1, 2, 3];
const names: Array<string> = ['张三', '李四'];
```

Java 类比：

```java
List<Integer> ids = List.of(1, 2, 3);
List<String> names = List.of("张三", "李四");
```

### 2.5 对象

直接写对象结构：

```ts
const user: {
  id: number;
  name: string;
  role: string;
  status: string;
} = {
  id: 1,
  name: '张三',
  role: '管理员',
  status: 'enabled'
};
```

更常见的方式是用 `interface` 提取成可复用类型。

## 3. interface、type、联合类型

### 3.1 interface

`interface` 最适合描述对象结构。

```ts
interface User {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}
```

Java 类比：

```java
class UserVO {
    Long id;
    String name;
    String role;
    String status;
}
```

心智模型：

```text
interface = 前端里的对象结构契约
```

适用场景：

```text
用户对象
订单对象
请求参数对象
接口返回对象
表单对象
```

### 3.2 type

`type` 更适合给类型起别名。

```ts
type UserStatus = 'enabled' | 'disabled';
type Id = number;
type MessageType = 'success' | 'error';
```

### 3.3 联合类型

联合类型表示一个值可以是多个固定类型或固定值之一。

```ts
type UserStatus = 'enabled' | 'disabled';
```

含义：

```text
status 只能是 'enabled' 或 'disabled'
```

这比直接写：

```ts
status: string;
```

更准确，因为它能表达真实业务约束。

适合用联合类型的场景：

```text
按钮状态：'idle' | 'loading' | 'success' | 'error'
用户状态：'enabled' | 'disabled'
表单模式：'create' | 'edit'
主题：'light' | 'dark'
```

### 3.4 推荐组合

第二阶段最常用的组合是：

```ts
type UserStatus = 'enabled' | 'disabled';

interface User {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}
```

含义：

```text
User 描述对象结构
UserStatus 描述某个字段的合法取值范围
```

### 3.5 可选属性 ?

```ts
interface FetchUsersParams {
  keyword?: string;
  shouldFail?: boolean;
}
```

含义：

```text
字段可以不传
不是说字段值必须为空，而是整个字段可以省略
```

## 4. 函数参数类型、返回值类型、Promise<T>

函数的基本写法：

```ts
function 函数名(参数名: 参数类型): 返回值类型 {
  // ...
}
```

Java 类比：

```java
返回值类型 函数名(参数类型 参数名) {
    // ...
}
```

### 4.1 参数类型

```ts
function renderUsers(userList: User[]): void {
  // ...
}
```

表示：

```text
参数必须是 User[]
函数本身不返回值
```

### 4.2 返回值类型

有返回值：

```ts
function getTotal(): number {
  return 100;
}
```

无返回值：

```ts
function clearUserForm(): void {
  // ...
}
```

### 4.3 对象参数类型

```ts
interface FetchUsersParams {
  keyword?: string;
  shouldFail?: boolean;
}

async function fetchUsers(
  { keyword = '', shouldFail = false }: FetchUsersParams = {}
): Promise<User[]> {
  // ...
}
```

拆开理解：

```text
参数是对象
对象里解构出 keyword 和 shouldFail
参数对象本身的类型是 FetchUsersParams
如果不传参数，默认是 {}
```

### 4.4 Promise<T>

```ts
async function fetchUsers(): Promise<User[]> {
  // ...
}
```

含义：

```text
这是一个异步函数
最终会拿到 User[]
```

Java 类比：

```java
CompletableFuture<List<UserVO>>
```

心智模型：

```text
User[]            已经拿到结果
Promise<User[]>   未来会拿到结果
```

### 4.5 常见模式

普通参数 + 普通返回值：

```ts
function getUserName(user: User): string {
  return user.name;
}
```

普通参数 + 无返回值：

```ts
function renderUsers(userList: User[]): void {
  // ...
}
```

对象参数 + 异步返回值：

```ts
async function fetchUsers(params: FetchUsersParams): Promise<User[]> {
  // ...
}
```

## 5. 泛型

先记结论：

```text
泛型 = 先不写死具体类型，等使用时再指定类型。
```

你已经见过的泛型：

```ts
Promise<User[]>
Array<User>
```

Java 类比：

```java
List<UserVO>
CompletableFuture<UserVO>
```

### 5.1 Array<T>

```ts
Array<User>
Array<string>
Array<number>
```

也可以写成简写：

```ts
User[]
string[]
number[]
```

### 5.2 Promise<T>

```ts
Promise<User>
Promise<User[]>
Promise<string>
```

含义：

```text
Promise<T> = 一个异步容器，最终会给你一个 T
```

### 5.3 泛型函数

```ts
function getFirst<T>(list: T[]): T {
  return list[0];
}
```

使用方式：

```ts
const name = getFirst<string>(['张三', '李四']);
const id = getFirst<number>([1, 2, 3]);
```

很多时候也可以让 TypeScript 自动推断：

```ts
const name = getFirst(['张三', '李四']);
const id = getFirst([1, 2, 3]);
```

泛型函数的核心意义：

```text
逻辑相同，类型可变
复用逻辑，同时保留类型精度
```

### 5.4 通用分页结果

```ts
interface PageResult<T> {
  list: T[];
  total: number;
}
```

使用时：

```ts
const userPage: PageResult<User> = {
  list: [],
  total: 0
};
```

## 6. 当前阶段的类型设计示例

结合当前用户管理页，第二阶段最自然的一组类型定义是：

```ts
type UserStatus = 'enabled' | 'disabled';

type FormMode = 'create' | 'edit';

interface User {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}

interface FetchUsersParams {
  keyword?: string;
  shouldFail?: boolean;
}

interface CreateUserRequest {
  name: string;
  role: string;
  status: UserStatus;
}

interface UpdateUserRequest {
  name: string;
  role: string;
  status: UserStatus;
}
```

函数签名可以写成：

```ts
function renderUsers(userList: User[]): void
function clearUserForm(): void
function enterEditMode(user: User): void
async function fetchUsers(params?: FetchUsersParams): Promise<User[]>
async function createUser(payload: CreateUserRequest): Promise<User>
```

## 7. 当前阶段总结

当前已经建立的 TypeScript 核心心智模型：

```text
TypeScript 是带类型的 JavaScript
它主要在开发阶段提前暴露问题
对象结构优先想到 interface
固定取值集合优先想到联合类型
函数需要说明“吃什么、吐什么、是不是异步”
泛型用于复用逻辑，同时保持类型准确
```

## 8. npm、package.json 与脚本命令

### 8.1 npm 是什么

先记结论：

```text
npm = Node.js 生态里的包管理工具。
```

它主要负责：

```text
安装依赖
记录依赖版本
执行项目脚本
```

对 Java 后端开发者来说，可以粗略类比成：

```text
npm + package.json ≈ Maven/Gradle + pom.xml/build.gradle
```

### 8.2 package.json 是什么

`package.json` 是前端项目的工程配置入口之一，通常会包含：

```json
{
  "name": "user-management-demo",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  },
  "dependencies": {
    "react": "..."
  },
  "devDependencies": {
    "typescript": "...",
    "vite": "..."
  }
}
```

可以先这样理解：

```text
name             项目名
version          项目版本
scripts          可执行命令
dependencies     运行时依赖
devDependencies  开发时依赖
```

### 8.3 dependencies 和 devDependencies

```text
dependencies     项目运行时真正要用到的包
devDependencies  只在开发、构建、校验阶段使用的包
```

例如：

```text
react、react-dom                通常放 dependencies
typescript、vite、eslint        通常放 devDependencies
```

### 8.4 scripts 是什么

`scripts` 可以理解为给常用命令起别名。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

运行方式：

```bash
npm run dev
npm run build
npm run preview
```

心智模型：

```text
scripts = 项目常用命令清单
```

## 9. Vite 与工程化项目结构

### 9.1 Vite 是什么

先记结论：

```text
Vite = 前端开发服务器 + 构建工具。
```

它主要解决：

```text
本地开发启动
模块打包构建
热更新
静态资源处理
```

对当前学习路径来说，可以把它理解成：

```text
原来直接双击 index.html
->
现在进入一个真正的前端工程项目
```

### 9.2 为什么要从单文件进入工程化

当前原生练习页已经能完成 CRUD，但问题也开始明显：

```text
HTML、CSS、JS 都堆在一个文件里
类型约束不足
功能继续增加后会越来越难维护
难以组件化拆分
```

所以第二阶段进入工程化，不是为了“更炫”，而是为了：

```text
拆分文件
建立类型
引入组件
让项目更接近真实工作场景
```

### 9.3 一个典型的 Vite + React + TypeScript 结构

```text
src
├── main.tsx         应用入口
├── App.tsx          页面主组件
├── types            类型定义
├── api              接口请求
├── components       组件
└── styles           样式
```

可以先这样理解职责：

```text
main.tsx      把 React 应用挂到页面上
App.tsx       当前页面的总控层
types         放 User、Request、Response 等类型
api           放 fetchUsers、createUser 之类接口函数
components    放 UserForm、UserTable 等组件
styles        放页面样式
```

## 10. 从当前原生页面迁移到 React 的拆分思路

### 10.1 不要一次性重写全部

更稳妥的顺序是：

```text
1. 创建 Vite + React + TypeScript 项目
2. 先定义类型
3. 再封装 API 函数
4. 再写 App.tsx 管理状态
5. 再拆 UserTable、UserForm
6. 最后补齐编辑、删除、启用/禁用等交互
```

这比“一口气全部重写”更容易理解，也更容易排查问题。

### 10.2 当前原生页面里的职责映射

现在的单文件页面里，大致有这些层次：

```text
users、editingUserId                 状态层
fetchUsers                           API 层
renderUsers、renderMessage           渲染层
新增/编辑/删除/查询按钮事件           事件层
表单输入读取与校验                    表单层
```

迁移到 React 后可以变成：

```text
App.tsx                状态层 + 页面协调层
api/users.ts           API 层
UserTable.tsx          表格展示层
UserForm.tsx           表单层
```

## 11. React 核心：组件、props、state

### 11.1 组件是什么

先记结论：

```text
组件 = 可复用的 UI 单元。
```

例如用户管理页可以拆成：

```text
App
├── UserForm
└── UserTable
```

### 11.2 props 是什么

`props` 可以理解成：

```text
父组件传给子组件的数据和回调。
```

例如：

```ts
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (user: User) => void;
}
```

心智模型：

```text
props = 组件的入参
```

它和 Java 方法参数非常像。

### 11.3 state 是什么

`state` 就是组件内部会变化的数据。

例如：

```ts
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [keyword, setKeyword] = useState('');
```

可以理解成：

```text
users     当前用户列表状态
loading   当前是否正在请求
keyword   当前查询条件
```

React 的核心思想是：

```text
UI = f(state)
```

也就是：

```text
只要 state 变了，界面就跟着重新渲染
```

## 12. useState、受控组件、useEffect

### 12.1 useState 的核心含义

```ts
const [users, setUsers] = useState<User[]>([]);
```

拆开理解：

```text
users        当前值
setUsers     修改 users 的函数
User[]       这个状态里存的是用户数组
[]           初始值是空数组
```

与原生 JS 的区别：

```text
原生 JS：改完数据后要手动 renderUsers(users)
React：调用 setUsers(...) 后 React 自动重新渲染
```

### 12.2 受控组件

在 React 里，表单通常写成受控组件：

```ts
const [name, setName] = useState('');

<input value={name} onChange={event => setName(event.target.value)} />
```

含义：

```text
输入框显示什么，取决于 state
输入框变化时，再反过来更新 state
```

心智模型：

```text
表单值不再是“去 DOM 里拿”
而是“直接存在 React state 里”
```

### 12.3 useEffect 是什么

常见写法：

```ts
useEffect(() => {
  loadUsers();
}, []);
```

可以先理解成：

```text
组件初次渲染完成后，执行一段副作用逻辑
```

这里的副作用通常是：

```text
请求接口
订阅事件
操作浏览器 API
```

在当前用户管理页场景里，最典型的用法就是：

```text
页面打开后自动加载用户列表
```

## 13. React 里的数据流

在当前教学里，页面主控通常放在 `App.tsx`。

它负责：

```text
维护 users、loading、keyword、editingUser 等状态
调用 API
把数据和回调传给 UserForm、UserTable
```

可以先建立这样的数据流：

```text
App 持有状态
  -> 通过 props 传给子组件
  -> 子组件触发 onEdit / onDelete / onSubmit
  -> App 更新 state
  -> React 重新渲染
```

这是 React 比原生 DOM 更重要的一个变化：

```text
不再自己手动拼 DOM
而是把状态和组件关系先设计清楚
```

## 14. JSX、条件渲染、列表渲染

### 14.1 JSX 是什么

JSX 可以先理解成：

```text
在 JavaScript / TypeScript 里写“像 HTML 一样”的 UI 模板。
```

例如：

```tsx
return (
  <table>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.role}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

它不是字符串拼接，而是：

```text
根据 state 描述 UI 应该长什么样
```

### 14.2 条件渲染

例如：

```tsx
{loading && <p>加载中...</p>}
{!loading && users.length === 0 && <p>暂无数据</p>}
```

含义：

```text
条件成立就显示
条件不成立就不显示
```

这和原生 JS 里手动 `if` + 改 DOM 的方式不同。

### 14.3 列表渲染和 key

React 中渲染列表最常见的方式是：

```tsx
{users.map(user => (
  <tr key={user.id}>
    <td>{user.name}</td>
  </tr>
))}
```

其中 `key` 的作用可以先理解成：

```text
告诉 React：这一行是谁
方便它正确识别新增、删除、更新
```

在当前场景里，最自然的 `key` 就是用户 `id`。

## 15. 从原生 renderUsers 到 React 列表渲染的心智迁移

当前原生写法：

```text
拿到 users
  -> createElement / appendChild
  -> 手动插入 tbody
```

React 写法：

```text
拿到 users
  -> users.map(user => JSX)
  -> React 负责更新真实 DOM
```

所以迁移时最关键的变化不是语法，而是思维：

```text
原生 DOM：命令式操作页面
React：声明式描述页面
```

## 16. 当前阶段总结

到目前为止，第二阶段已经覆盖的内容可以总结为：

```text
TypeScript：基础类型、interface、type、联合类型、函数签名、Promise<T>、泛型
工程化：npm、package.json、scripts、dependencies、devDependencies、Vite、项目结构
React 预备：组件、props、state、useState、受控组件、useEffect、JSX、条件渲染、列表渲染、key、数据流
迁移思路：把当前原生用户管理页拆成 React + TypeScript + Vite 项目结构
```

当前阶段结论：

```text
已经完成从“原生页面练习”到“React 工程化思维准备”的过渡。
下一步可以开始真正落地一个 Vite + React + TypeScript 用户管理项目骨架。
```

## 17. 下一步学习建议

建议按这个顺序继续：

```text
1. 创建 Vite + React + TypeScript 项目
2. 落地 User、CreateUserRequest、UpdateUserRequest 等类型
3. 封装 fetchUsers、createUser、updateUser、deleteUserApi
4. 用 App.tsx + UserForm + UserTable 重写当前用户管理页面
```

## 18. 已落地的工程（user-management/）

上面 1~4 步已在 `user-management/` 目录真正落地，文件与职责对应如下：

```text
src/types/user.ts          类型定义（第 6 节那组类型）
src/api/users.ts           API 层：fetchUsers / createUser / updateUser / deleteUserApi
src/components/UserTable.tsx  列表展示 + onEdit/onDelete/onToggleStatus 回调
src/components/UserForm.tsx   受控表单，新增/编辑复用（useState + useEffect）
src/App.tsx                总控层：状态 + API 调用 + 不可变更新 + 四态渲染
src/main.tsx               入口，createRoot 挂到 #root
```

可运行命令：

```bash
cd user-management
npm install      # 安装依赖
npm run dev      # 本地开发服务器
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
```

关键对照（原生 vs React）：

```text
原生：改完数据手动 renderUsers(users)
React：setUsers(...) 后自动重新渲染

原生：splice 直接改数组
React：map / filter / 展开运算符 生成新数组（不可变更新）

原生：innerHTML 需要手动 escapeHtml 防 XSS
React：{user.name} 默认转义，天然安全
```

下一阶段（第四阶段）方向：环境变量与多环境配置、React Router、统一错误处理、分页/筛选/排序、与 Spring Boot 联调、Vitest 测试。