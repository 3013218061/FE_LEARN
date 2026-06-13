import { useState } from 'react';

// 校验结果：字段名 -> 错误信息（没错的字段就不出现在里面）
export type FormErrors<T> = Partial<Record<keyof T, string>>;

// 校验函数：吃一组值，吐一份错误清单
export type Validator<T> = (values: T) => FormErrors<T>;

// useForm：可复用的"表单状态 + 校验"自定义 Hook。
// 任何表单都能用：传入初始值和校验规则，拿回值、错误和几个操作函数。
// 泛型 <T> 让它对任意表单结构通用（用户表单、订单表单……）。
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate: Validator<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  // 改单个字段（不可变更新：展开旧值再覆盖一个 key）
  function setField<K extends keyof T>(key: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // 重置整张表单为给定值，并清空错误
  function reset(next: T) {
    setValues(next);
    setErrors({});
  }

  // 提交：先校验，通过才执行 onValid；否则把错误写进 errors 供渲染
  function submit(onValid: (values: T) => void) {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onValid(values);
    }
  }

  return { values, errors, setField, reset, submit };
}
