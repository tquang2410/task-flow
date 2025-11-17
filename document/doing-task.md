# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 17/11/2025

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
-   **[Hoàn thành]** Bước 1.9.A: Tạo Layout Xác thực.
    -   `src/app/(auth)/layout.tsx`: Tạo một layout riêng cho các trang xác thực (đăng nhập, đăng ký) để căn giữa nội dung trên màn hình.
-   **[Hoàn thành]** Bước 1.9.B: Tạo Trang Đăng nhập.
    -   `src/app/(auth)/login/page.tsx`: Tạo giao diện và xử lý logic cơ bản cho form đăng nhập phía client.
-   **[Hoàn thành]** Bước 1.10: Tạo Trang Đăng ký.
    -   `src/app/(auth)/register/page.tsx`: Tạo giao diện và xử lý logic cơ bản cho form đăng ký phía client.
-   **[Hoàn thành]** Bước 1.12: Cấu hình Path Aliases.
    -   `tsconfig.json`: Cập nhật cấu hình TypeScript để nhận diện `@/` là `src/`, giúp giải quyết lỗi import.
-   **[Hoàn thành]** Bước 1.14: Tạo file Supabase Client bị thiếu.
    -   `src/lib/supabase/client.ts`: Đã tạo lại file client-side Supabase client.
-   **[Hoàn thành]** Bước 1.16: Sửa lỗi Supabase trong Middleware.
    -   `src/middleware.ts`: Thay thế việc tạo Supabase client thủ công bằng `createMiddlewareClient` để đơn giản hóa và tuân thủ best practice.
-   **[Hoàn thành]** Bước 1.17: Sửa Import Path của Supabase Server.
    -   `src/lib/supabase/server.ts`: Sửa lỗi TypeScript `TS2724` bằng cách thay đổi đường dẫn import cho `createServerClient` và `CookieOptions` từ `'@supabase/auth-helpers-nextjs'` sang `'@supabase/auth-helpers-nextjs/server'`.
-   **[Hoàn thành]** Bước 1.18: Sửa lỗi Import Path trong Supabase Server (Lần 2).
    -   `src/lib/supabase/server.ts`: Sửa lỗi `TS2307` và các lỗi `TS2339` phát sinh do khoảng trắng thừa trong đường dẫn import của `@supabase/auth-helpers-nextjs/server`.
-   **[Hoàn thành]** Bước 1.19-1.22: Di chuyển từ `@supabase/auth-helpers-nextjs` sang `@supabase/ssr` và cập nhật các file liên quan.
    -   `package.json`: Thay thế `@supabase/auth-helpers-nextjs` bằng `@supabase/ssr`.
    -   `src/lib/supabase/client.ts`: Cập nhật để sử dụng `createBrowserClient` từ `@supabase/ssr`.
    -   `src/lib/supabase/server.ts`: Cập nhật để sử dụng `createServerClient` từ `@supabase/ssr`.
    -   `src/middleware.ts`: Cập nhật để sử dụng `createServerClient` từ `@supabase/ssr`.
-   **[Hoàn thành]** Bước 1.21: Tạo Prisma Client Instance.
    -   `src/lib/db.ts`: Tạo một instance Prisma Client theo pattern singleton để tối ưu hóa kết nối CSDL trong môi trường serverless.
-   **[Hoàn thành]** Bước 1.22: Tạo Webhook đồng bộ User.
    -   `src/app/api/auth/webhook/route.ts`: Tạo một API route để nhận dữ liệu từ Supabase Auth webhook, có nhiệm vụ đồng bộ user mới vào CSDL MongoDB.
-   **[Tiếp theo]** Chờ task kế tiếp từ Team Leader.