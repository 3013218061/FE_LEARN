import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/UserListPage';
import UserDetailPage from './pages/UserDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import { setUnauthorizedHandler } from './api/request';
import './App.css';

// App 负责路由表，并把"401 时跳登录页"的能力注入给 request 层。
export default function App() {
  const navigate = useNavigate();

  // request 层不认识 React Router，这里用 useNavigate 把跳转能力"注册"进去，
  // 避免在 request 层里写 window.location（那会整页刷新）。
  useEffect(() => {
    setUnauthorizedHandler(() => navigate('/login', { replace: true }));
  }, [navigate]);

  return (
    <Routes>
      {/* 公开路由：登录页不需要鉴权 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 受保护路由：用 RequireAuth 包住整个 Layout 子树，
          未登录访问任意子页面都会被重定向到 /login */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
