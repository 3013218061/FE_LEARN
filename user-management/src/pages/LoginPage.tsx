import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { setToken } from '../auth/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { token } = await login({ username: username.trim(), password });
      setToken(token); // 拿到 token 先存起来，后续请求会自动带上
      // replace: true —— 用 /users 替换历史里的 /login，
      // 这样登录成功后点"后退"不会又回到登录页
      navigate('/users', { replace: true });
    } catch {
      setError('用户名或密码错误');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>登录</h2>
        <div className="form-row">
          <label>用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>
        <div className="form-row">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button onClick={handleLogin} disabled={submitting}>
          {submitting ? '登录中...' : '登录'}
        </button>
        <p className="login-hint">演示账号：admin / 123456</p>
      </div>
    </div>
  );
}
