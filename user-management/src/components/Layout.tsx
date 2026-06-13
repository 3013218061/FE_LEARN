import { NavLink, Outlet } from 'react-router-dom';

// Layout = 所有页面共享的外壳：标题 + 顶部导航。
// 类比后端的"页面母版/公共布局"，每个子页面只关心自己那块内容。
export function Layout() {
  return (
    <div className="app">
      <h1>用户管理（React + TypeScript 版）</h1>

      <nav className="nav">
        {/* NavLink 和 Link 都是"不刷新整页"的跳转，点了只换 URL + 重渲染对应组件。
            NavLink 比 Link 多一个能力：当前路由匹配时给一个 active 标记，方便高亮。
            注意：绝不要用 <a href> 做站内跳转，那会触发整页刷新，丢掉所有内存状态。 */}
        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          用户列表
        </NavLink>
      </nav>

      {/* Outlet = 子路由的"插槽"。当前 URL 匹配到哪个子路由，
          它的 element 就渲染在这里。 */}
      <Outlet />
    </div>
  );
}
