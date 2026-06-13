import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import UserListPage from './pages/UserListPage';
import UserDetailPage from './pages/UserDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// App 现在只负责"路由表"：URL 路径 -> 渲染哪个页面组件。
// 类比后端：这相当于一张 @RequestMapping 路由表，只不过映射的是组件而不是 Controller 方法。
export default function App() {
  return (
    <Routes>
      {/* 父路由用 Layout 提供公共外壳（标题 + 导航 + <Outlet/>），
          子路由渲染到 Layout 内部的 <Outlet/> 位置 —— 嵌套路由 */}
      <Route path="/" element={<Layout />}>
        {/* index 路由：访问 "/" 时重定向到 "/users" */}
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UserListPage />} />
        {/* :id 是动态路径参数，类比后端的 @PathVariable */}
        <Route path="users/:id" element={<UserDetailPage />} />
        {/* "*" 兜底路由：所有未匹配的路径都进 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
