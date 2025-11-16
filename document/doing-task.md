# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 16/11/2025

### Task đang thực hiện: Epic 1 - Nền tảng & Xác thực

-   **[Hoàn thành]** Bước 1.5: Tạo Supabase Client (cho Client-side).
    -   `src/lib/supabase/client.ts`: Dùng để tạo Supabase client ở phía trình duyệt (trong các component "use client").
-   **[Hoàn thành]** Bước 1.6: Tạo Supabase Client (cho Server-side).
    -   `src/lib/supabase/server.ts`: Dùng để tạo Supabase client ở phía máy chủ (trong Server Components, Server Actions).
-   **[Hoàn thành]** Bước 1.7: Tạo `middleware.ts` để bảo vệ trang.
    -   `src/middleware.ts`: File này hoạt động như một "người gác cổng" cho ứng dụng.
        -   **Chức năng 1:** Chặn người dùng chưa đăng nhập truy cập vào các trang yêu cầu xác thực (bất kỳ trang nào có tiền tố `/app`). Nếu chưa đăng nhập, họ sẽ bị chuyển hướng đến trang `/login`.
        -   **Chức năng 2:** Nếu người dùng đã đăng nhập rồi mà cố tình truy cập lại trang `/login` hoặc `/register`, họ sẽ được tự động chuyển hướng vào trang `/app`.
        -   **Chức năng 3:** Tự động làm mới (refresh) session của người dùng.
-   **[Hoàn thành]** Bước 1.8: Thêm các component Shadcn/UI cho trang Auth.
    -   Đã thêm các component `Card`, `Form`, `Button`, `Input`, `Label` vào thư mục `src/components/ui`. Các component này sẽ được dùng để xây dựng giao diện người dùng cho các trang đăng nhập, đăng ký.
-   **[Tiếp theo]** Chờ task kế tiếp từ Team Leader.
