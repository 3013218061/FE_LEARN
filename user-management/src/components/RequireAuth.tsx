import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../auth/auth';

// 路由守卫：受保护的路由先过这一关。
// 没登录就重定向到 /login，类比后端的拦截器 / 过滤器（未认证就拦下）。
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
