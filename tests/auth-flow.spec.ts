/**
 * @file tests/auth-flow.spec.ts
 * @description Kịch bản E2E test cho luồng xác thực người dùng.
 * Test này kiểm tra "happy path" khi người dùng đăng nhập thành công.
 */
import { test, expect } from '@playwright/test';

// QUAN TRỌNG: Để chạy test này, bạn cần tạo file .env ở gốc dự án
// và thêm vào các biến môi trường sau với tài khoản test của bạn.
// Vd:
// TEST_USER_EMAIL="test@example.com"
// TEST_USER_PASSWORD="password123"
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test-user@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

test.describe('Luồng xác thực (Authentication Flow)', () => {
  test('Cho phép người dùng đăng nhập và chuyển hướng đến trang dashboard', async ({ page }) => {
    // 1. Điều hướng đến trang /login
    await page.goto('/login');

    // 2. Điền thông tin email và mật khẩu
    await page.getByLabel('Email').fill(TEST_USER_EMAIL);
    await page.getByLabel('Mật khẩu').fill(TEST_USER_PASSWORD);

    // 3. Bấm nút "Đăng nhập"
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // 4. Chờ trang chuyển hướng đến /app (tăng timeout)
    await page.waitForURL('/app', { timeout: 30000 });

    // 5. Kiểm tra một element đặc trưng trên trang dashboard đã hiển thị
    // Ví dụ: tìm header "Your Workspaces"
    const dashboardHeader = page.getByRole('heading', { name: 'Your Workspaces' });
    await expect(dashboardHeader).toBeVisible();
  });
});