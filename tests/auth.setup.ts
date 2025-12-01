/**
 * @file tests/auth.setup.ts
 * @description Kịch bản setup để xác thực người dùng.
 * File này sẽ chạy một lần duy nhất trước tất cả các test khác (do cấu hình dependencies trong playwright.config.ts).
 * Nó thực hiện đăng nhập và lưu lại session (cookie, local storage) vào một file,
 * để các test khác có thể tái sử dụng, bắt đầu test ở trạng thái "đã đăng nhập".
 */
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

// Lấy thông tin tài khoản test từ biến môi trường
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test-user@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

setup('authenticate', async ({ page }) => {
  console.log('Logging in with:', process.env.TEST_USER_EMAIL?.replace(/.{1,4}@/, '****@'));

  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_USER_EMAIL);
  await page.getByLabel('Mật khẩu').fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  try {
    // Chờ MỘT TRONG HAI điều xảy ra: vào được dashboard HOẶC thấy thông báo lỗi
    await expect(
      page.getByRole('heading', { name: /Workspaces/i })
          .or(page.locator('.text-destructive'))
    ).toBeVisible({ timeout: 10000 });

    // Nếu một trong hai điều trên xảy ra, kiểm tra xem đó là lỗi hay thành công
    if (await page.locator('.text-destructive').isVisible()) {
      throw new Error(`Login failed with UI error: ${await page.locator('.text-destructive').textContent()}`);
    }

    // Nếu không có lỗi, xác nhận lại URL và lưu trạng thái
    await expect(page).toHaveURL(/.*\/app/);
    await page.context().storageState({ path: authFile });

  } catch (error) {
    // Nếu cả hai điều kiện trên đều không xảy ra sau 10s, báo lỗi tường minh
    throw new Error('Login Timeout: Page did not navigate to /app AND no error message was shown.');
  }
});
