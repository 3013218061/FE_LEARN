// token 存储层：用 localStorage 持久化登录态。
// localStorage 特点：刷新页面、关掉浏览器重开都还在（除非手动清除）。
// 类比后端：相当于客户端保存的"会话凭证"，每次请求带上它证明"我是谁"。

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// 是否已登录：这里只判断"有没有 token"。
// 真实项目还可以解析 JWT 看是否过期，这里先保持简单。
export function isLoggedIn(): boolean {
  return getToken() !== null;
}
