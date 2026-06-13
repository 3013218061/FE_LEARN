# 第四阶段（六）：表单抽象（自定义 Hook）与组件测试

本笔记承接 `week-04-5-vitest-testing-notes.md`，做两件事：把 `UserForm` 里重复的「表单值 + 校验」逻辑抽成一个可复用的自定义 Hook `useForm`；再引入 `@testing-library/react` 给表单补组件测试。前者教「自定义 Hook」这个 React 核心抽象，后者教「测 UI 行为」。

## 1. 表单抽象要解决什么

重构前的 `UserForm` 把状态和校验全堆在组件里：

```tsx
const [name, setName] = useState('');
const [role, setRole] = useState('');
const [status, setStatus] = useState<UserStatus>('enabled');
const [error, setError] = useState('');
// handleSubmit 里手写 if (!name.trim()) ...
```

问题：

```text
- 每多一个表单（订单表单、角色表单……）就把这套 useState + 校验再抄一遍。
- 校验逻辑和渲染混在一起，想单独测校验都不好测。
- 字段一多，setXxx 满天飞。
```

后端开发者熟悉的解法是「抽公共逻辑」。React 里抽公共**有状态逻辑**的工具，就是**自定义 Hook**。

## 2. 核心概念：自定义 Hook

```text
自定义 Hook = 一个名字以 use 开头、内部能调用别的 Hook（useState/useEffect…）的函数。
作用：把"带状态的逻辑"打包成可复用单元，给多个组件共享。
```

和普通函数的区别：

```text
普通函数：只能封装无状态的纯计算。
自定义 Hook：能封装"有状态的逻辑"（内部有 useState），但只能在组件或别的 Hook 里调用。
```

Java 类比（不精确但够用）：

```text
就像把若干个 Controller 里重复的"参数校验 + 状态维护"逻辑，
抽成一个可复用的工具组件，各处注入使用。
关键差异：Hook 封装的是"会随时间变化的状态"，不只是无状态工具方法。
```

## 3. useForm 的设计

```ts
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type Validator<T> = (values: T) => FormErrors<T>;

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate: Validator<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  function setField<K extends keyof T>(key: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [key]: value })); // 不可变更新
  }

  function reset(next: T) {
    setValues(next);
    setErrors({});
  }

  function submit(onValid: (values: T) => void) {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onValid(values); // 校验通过才执行
    }
  }

  return { values, errors, setField, reset, submit };
}
```

设计要点：

```text
泛型 <T>      对任意表单结构通用：useForm<{name,role,status}> / useForm<{title,amount}>
setField<K>   K extends keyof T，保证 key 是合法字段名、value 类型与该字段匹配（类型安全）
errors map    FormErrors<T> = 字段名 -> 错误信息，比单个 error 字符串更细，能做字段级提示
submit        校验内聚在 Hook 里：通过才回调 onValid，不通过就把错误塞进 errors
返回对象       像 useState 返回 [value, setter] 一样，这里返回一组值和操作
```

`setField<K extends keyof T>(key: K, value: T[K])` 是这里类型最讲究的一处：

```text
setField('name', '小明')   ✓ 'name' 是字段，值是 string
setField('status', 'x')    ✗ 编译报错，'x' 不是 UserStatus
setField('age', 1)         ✗ 编译报错，没有 age 字段
```

## 4. 一个 TypeScript 约束坑：interface vs type

`useForm<T extends Record<string, unknown>>` 的约束，要求 `T` 能赋给 `Record<string, unknown>`。这里踩到一个经典坑：

```text
type UserFormValues = { name: string; role: string; status: UserStatus };  // ✓ 满足约束
interface UserFormValues { ... }                                            // ✗ 报错！
```

原因：`interface` 可能被别处「声明合并」扩展，TS 认为它**不一定**只有这些字段，所以不让它赋给带索引签名的 `Record<string, unknown>`；而 `type` 别名是封闭的，能满足约束。所以表单值结构这里用 `type` 而不是 `interface`。

```text
经验：要把一个对象类型当 Record<string, unknown> 用（常见于泛型工具），优先用 type。
```

## 5. 重构后的 UserForm

校验规则独立成函数，组件只剩「长什么样 + 点了怎么办」：

```tsx
const validateUser: Validator<UserFormValues> = (values) => {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};
  if (!values.name.trim()) errors.name = '用户名不能为空';
  if (!values.role.trim()) errors.role = '角色不能为空';
  return errors;
};

export function UserForm({ mode, editingUser, onSubmit, onCancel }: UserFormProps) {
  const { values, errors, setField, reset, submit } = useForm(EMPTY, validateUser);

  useEffect(() => {
    if (mode === 'edit' && editingUser) {
      reset({ name: editingUser.name, role: editingUser.role, status: editingUser.status });
    } else {
      reset(EMPTY);
    }
  }, [mode, editingUser]);

  function handleSubmit() {
    submit((v) => onSubmit({ name: v.name.trim(), role: v.role.trim(), status: v.status }));
  }
  // 渲染：value={values.name} onChange={e => setField('name', e.target.value)}
  //       {errors.name && <p className="form-error">{errors.name}</p>}
}
```

对比重构前后：

```text
重构前：4 个 useState + 散落的校验 + 单个 error
重构后：1 个 useForm + 1 个独立 validateUser + 字段级 errors
组件从"既管状态又管校验又管渲染"，瘦成"只管渲染和接线"。
下一个表单直接 useForm(初始值, 它的校验) 即可复用整套机制。
```

## 6. 组件测试：测"用户能看到/能操作什么"

单元测试（上一节）测的是纯函数。组件测试测的是**渲染出来的 UI 和交互行为**，需要新的工具：

```text
@testing-library/react       把组件渲染进 jsdom，提供 screen 查询 DOM
@testing-library/user-event  模拟真实用户操作（点击、输入），比直接派发事件更真实
@testing-library/jest-dom    补充 DOM 相关断言（toBeInTheDocument / toHaveValue / toDisplayValue）
```

测试哲学（Testing Library 的核心主张）：

```text
"像用户一样找元素、像用户一样操作"，而不是去摸组件内部的 state。
所以查询用"按文字/占位符/角色找"，而不是用 CSS class 或组件实例。
这样测试不依赖实现细节，重构内部不破坏测试。
```

### 6.1 环境准备

`vitest.config.ts` 加一个 setup 文件：

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  env: { VITE_API_BASE_URL: 'http://localhost/api' },
},
```

`src/test/setup.ts`：

```ts
import '@testing-library/jest-dom/vitest';   // 注入 toBeInTheDocument 等断言
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => cleanup());                  // 每条测试后卸载组件，防 DOM 残留
```

```text
cleanup 很重要：不清理的话，上一条测试渲染的 DOM 还在，
下一条 screen.getByText 可能同时找到两个，直接报"找到多个"。
```

### 6.2 四条组件测试（覆盖 UserForm 的关键行为）

```text
新增模式渲染   标题/输入框初始为空（getByRole('heading'..) + toHaveValue('')）
提交空表单     出现"用户名不能为空""角色不能为空"，且 onSubmit 没被调用
填写后提交     onSubmit 收到 { name:'小明', role:'运营', status:'enabled' }（验证 trim）
编辑模式预填充  输入框显示张三/管理员，按钮变"保存修改"（getByDisplayValue）
```

几个写法要点：

**用 role 消除歧义**

```tsx
// 标题和按钮文字都是"新增用户"，直接 getByText 会找到 2 个而报错
screen.getByRole('heading', { name: '新增用户' });  // 只要标题
screen.getByRole('button', { name: '新增用户' });    // 只要按钮
```

**模拟真实输入并断言回调参数**

```tsx
await userEvent.type(screen.getByPlaceholderText('请输入用户名'), '  小明  ');
await userEvent.type(screen.getByPlaceholderText('请输入角色'), '运营');
await userEvent.click(screen.getByRole('button', { name: '新增用户' }));
expect(onSubmit).toHaveBeenCalledWith({ name: '小明', role: '运营', status: 'enabled' });
```

这条同时验证了三件事：受控输入生效、校验通过、`handleSubmit` 里的 `trim()` 起作用（输入带空格，回调拿到的是去空格的值）。

**断言"没发生"**

```tsx
expect(onSubmit).not.toHaveBeenCalled();  // 校验失败时绝不能调用 onSubmit
```

`userEvent` 的操作都是异步的（模拟真实的逐字符输入/事件循环），所以都要 `await`。

## 7. 验证结果

```text
npm test       Test Files 4 passed (4)，Tests 18 passed (18)
               （上一节 14 条 + 本节 UserForm 组件 4 条）
npm run build  成功（tsc --noEmit 通过 + vite build，286 个模块）
```

## 8. 本节小结

```text
自定义 Hook    以 use 开头、内部可调用别的 Hook，用来复用"有状态的逻辑"
useForm        泛型表单 Hook：values/errors/setField/reset/submit，校验内聚
setField<K>    K extends keyof T + value: T[K]，字段名和值类型双重安全
errors map     字段级错误提示，比单个 error 字符串更细
校验解耦        validateUser 独立成函数，可复用、可单测
type vs interface  当 Record<string, unknown> 约束用时，对象结构要用 type
组件测试栈      @testing-library/react + user-event + jest-dom
测试哲学        像用户一样找元素和操作，不碰内部 state；查询优先 role/文字/占位符
环境准备        setupFiles 注入 jest-dom 断言 + afterEach cleanup
异步交互        userEvent.type/click 都要 await
断言负向        not.toHaveBeenCalled 验证"校验失败不提交"
```

## 9. 下一步学习建议

```text
1. 表单进一步抽象：把"字段配置 + 渲染"也数据化（一份 schema 驱动出整张表单）。
2. 与真实 Spring Boot 联调：VITE_USE_MOCK=false，对接真实接口跑通全链路（第四阶段收尾）。
3. 构建与部署：理解 dist 产物、静态托管、Nginx 的 SPA history 回退配置。
4. 覆盖率与 E2E：vitest run --coverage 看缺口；按需引入 Playwright 做端到端测试。
```
