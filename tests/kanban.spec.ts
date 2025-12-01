/**
 * @file tests/kanban.spec.ts
 * @description Kịch bản E2E test cho các chức năng trên bảng Kanban.
 * Test này giả định người dùng đã đăng nhập (nhờ auth.setup.ts).
 */
import { test, expect } from '@playwright/test';

// QUAN TRỌNG: Thay đổi ID này thành một ID project có thật trong CSDL của bạn.
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'your-project-id-here';

test.describe('Kanban Board Functionality', () => {
  // Tăng thời gian chờ cho toàn bộ test trong file này
  test.setTimeout(60000);

  // Chạy trước mỗi test trong file này
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang project test
    await page.goto(`/app/project/${TEST_PROJECT_ID}`);
    // Chờ cho bảng Kanban load xong, sử dụng test-id của cột 'todo'
    await expect(page.getByTestId('column-todo')).toBeVisible({ timeout: 20000 });
  });

  test('should allow a user to create a new task', async ({ page }) => {
    const taskTitle = `New task - ${Date.now()}`;
    
    // 1. Tìm cột "Todo" bằng test-id
    const todoColumn = page.getByTestId('column-todo');

    // 2. Click vào nút "Create Task" bằng test-id bên trong cột đó
    await todoColumn.getByTestId('create-task-btn').click();

    // 3. Điền tiêu đề task vào dialog
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);

    // 4. Bấm nút "Create Task" trong dialog bằng test-id
    await page.getByTestId('submit-task-btn').click();

    // 5. Verify: Kiểm tra xem task card mới đã xuất hiện trong cột "Todo" hay chưa
    // Việc chờ đợi optimistic UI có thể nhanh, nhưng để chắc chắn, ta nên chờ một chút
    const newTaskCard = todoColumn.getByText(taskTitle);
    await expect(newTaskCard).toBeVisible({ timeout: 5000 });
  });
});