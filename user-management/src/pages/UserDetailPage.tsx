import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../types/user';
import { getUser } from '../api/users';

// 详情页：从 URL 里拿到 :id，再去请求这个用户的数据。
export default function UserDetailPage() {
  // useParams 读取路由里的动态段 :id。
  // 类比后端 @PathVariable("id")。注意：拿到的永远是字符串，需要自己转 number。
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // id 变化（在不同详情页之间跳转）时重新加载
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const data = await getUser(Number(id));
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="status-text">加载中...</p>;
  if (error) return <p className="status-text error">{error}</p>;
  if (!user) return <p className="status-text">用户不存在</p>;

  return (
    <div className="detail-card">
      <h3>用户详情</h3>
      <dl>
        <dt>ID</dt>
        <dd>{user.id}</dd>
        <dt>用户名</dt>
        <dd>{user.name}</dd>
        <dt>角色</dt>
        <dd>{user.role}</dd>
        <dt>状态</dt>
        <dd>
          <span className={`status status-${user.status}`}>
            {user.status === 'enabled' ? '启用' : '禁用'}
          </span>
        </dd>
      </dl>
      {/* navigate(-1) = 浏览器后退一步，等价于点了浏览器返回键 */}
      <button onClick={() => navigate(-1)}>返回</button>
    </div>
  );
}
