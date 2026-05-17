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

## 8. 下一步学习建议

建议按这个顺序继续第二阶段：

```text
1. npm、package.json、脚本命令
2. Vite 和项目工程化结构
3. 在工程化项目里落地当前这套 User / API 类型定义
```