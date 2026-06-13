import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../auth/auth';

// Layout = 所有页面共享的外壳：标题 + 顶部导航 + 退出登录。
export function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken(); // 清掉本地 token
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <h1>用户管理（React + TypeScript 版）</h1>

      <nav className="nav">
        {/* NavLink 和 Link 都是"不刷新整页"的跳转。
            NavLink 比 Link 多一个能力：当前路由匹配时给 active 标记，方便高亮。
            站内跳转绝不要用 <a href>，那会触发整页刷新、丢掉内存状态。 */}
        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          用户列表
        </NavLink>
        <button className="logout-btn" onClick={handleLogout}>
          退出登录
        </button>
      </nav>

      {/* Outlet = 子路由的"插槽"。当前 URL 匹配到哪个子路由，
          它的 element 就渲染在这里。 */}
      <Outlet />
    </div>
  );
}
