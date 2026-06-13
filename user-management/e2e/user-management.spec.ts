import { test, expect } from '@playwright/test';

// 端到端测试：用真实浏览器跑用户管理的完整主流程。
// 数据来自浏览器内的 MSW（mock 模式），无需真实后端。
// mock 约定：账号 admin / 123456；共 8 条用户、每页 5 条（2 页）。

test('未登录访问受保护页面会被重定向到登录页', async ({ page }) => {
  await page.goto('/');
  // RequireAuth 路由守卫：没 token 就跳 /login
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
});

test('登录 -> 列表 -> 分页 -> 搜索 -> 编辑 -> 登出 完整主流程', async ({ page }) => {
  // ---- 登录 ----
  await page.goto('/login');
  await page.getByPlaceholder('admin').fill('admin');
  await page.getByPlaceholder('123456').fill('123456');
  await page.getByRole('button', { name: '登录' }).click();

  // 登录成功后进入用户列表
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('cell', { name: '张三' })).toBeVisible();

  // ---- 分页：默认第 1 页，共 8 条 ----
  await expect(page.getByText(/第 1 \/ 2 页，共 8 条/)).toBeVisible();
  await page.getByRole('button', { name: '下一页' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/第 2 \/ 2 页/)).toBeVisible();

  // ---- 搜索：输入"张"，结果回到第 1 页且只剩 1 条 ----
  await page.getByPlaceholder('按用户名查询').fill('张');
  await page.getByRole('button', { name: '查询' }).click();
  await expect(page).toHaveURL(/keyword=/);
  await expect(page.getByText(/共 1 条/)).toBeVisible();
  await expect(page.getByRole('cell', { name: '张三' })).toBeVisible();

  // ---- 编辑：改张三的角色并保存 ----
  await page
    .getByRole('row', { name: /张三/ })
    .getByRole('button', { name: '编辑' })
    .click();
  // 表单切到编辑模式并预填充
  await expect(page.getByRole('heading', { name: '编辑用户' })).toBeVisible();
  await expect(page.getByPlaceholder('请输入角色')).toHaveValue('管理员');
  await page.getByPlaceholder('请输入角色').fill('超级管理员');
  await page.getByRole('button', { name: '保存修改' }).click();

  // 提示更新成功，且列表里角色已更新（mock 有状态）
  await expect(page.getByText('更新用户成功')).toBeVisible();
  await expect(page.getByRole('cell', { name: '超级管理员' })).toBeVisible();

  // ---- 登出：清 token，回到登录页 ----
  await page.getByRole('button', { name: '退出登录' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
