import { Link } from 'react-router-dom';

// 兜底页：路由表里 path="*" 匹配所有没命中的 URL。
export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h3>404</h3>
      <p>页面不存在</p>
      {/* Link 是声明式跳转，渲染成 <a> 但点击不刷新整页 */}
      <Link to="/users">返回用户列表</Link>
    </div>
  );
}
