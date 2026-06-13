import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken, isLoggedIn } from './auth';

describe('auth token 存储层', () => {
  beforeEach(() => clearToken());

  it('初始没有 token', () => {
    expect(getToken()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });

  it('set 之后能 get 回来，isLoggedIn 为 true', () => {
    setToken('my-token');
    expect(getToken()).toBe('my-token');
    expect(isLoggedIn()).toBe(true);
  });

  it('clear 之后 token 没了，isLoggedIn 为 false', () => {
    setToken('my-token');
    clearToken();
    expect(getToken()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });
});
