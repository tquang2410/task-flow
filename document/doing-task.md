# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 19/11/2025

### Task đang thực hiện: Epic 2 - Quản lý Workspace & Dự án

-   **[Hoàn thành]** Bước 2.1: Implement Server Action `createWorkspace`.
    -   `src/app/actions.ts`: Tạo file mới chứa các Server Actions của ứng dụng.
    -   Viết action `createWorkspace` để xử lý logic tạo Workspace mới, bao gồm: xác thực người dùng qua Supabase, kiểm tra dữ liệu đầu vào bằng Zod, tạo record `Workspace` và liên kết người dùng hiện tại làm thành viên đầu tiên thông qua Prisma.
-   **[Hoàn thành]** Bước 2.2: Tạo trang UI cho "Create Workspace".
    -   `src/app/app/create-workspace/page.tsx`: Tạo trang mới cho phép người dùng nhập tên và tạo một workspace.
    -   Trang này là một Client Component, sử dụng `react-hook-form` và `zodResolver` để quản lý form và tương tác với server action `createWorkspace`. Giao diện được dựng bằng các component của Shadcn/UI.
-   **[Hoàn thành]** Bước 2.3: Implement Server Action `createProject`.
    -   `src/app/actions.ts`: Bổ sung `createProject` action vào file.
    -   Action này bao gồm logic kiểm tra quyền hạn (user phải là thành viên của workspace) và tự động khởi tạo các cột Kanban mặc định (`To Do`, `In Progress`, `Done`) cho project mới.
-   **[Hoàn thành]** Bước 2.4: Refactor Server Actions.
    -   `src/app/actions.ts`: Cập nhật lại các server actions đã tạo.
    -   Sửa lại đúng tên biến của Prisma Client từ `prisma` thành `db`.
    -   Sửa lại cách gọi hàm `createClient` của Supabase thành `await createClient()` vì đây là hàm bất đồng bộ.
-   **[Hoàn thành]** Bước 2.5: Build Workspace Dashboard & Create Project UI.
    -   `src/components/create-project-modal.tsx`: Tạo component modal để xử lý việc tạo project mới, sử dụng `Dialog` và `react-hook-form`.
    -   `src/app/app/workspace/[id]/page.tsx`: Tạo trang dashboard cho từng workspace, hiển thị danh sách các project hiện có và tích hợp `CreateProjectModal` để người dùng có thể tạo project mới.

### Task đã hoàn thành: Epic 1 - Nền tảng & Xác thực

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
-   **[Hoàn thành]** Bước 1.24: Fix lỗi Linting để Build.
    -   `src/app/api/auth/webhook/route.ts`: Sửa lỗi `any` trong khối `catch`.
    -   `src/app/(auth)/login/page.tsx`: Xóa biến `err` không dùng trong khối `catch`.
    -   `src/app/(auth)/register/page.tsx`: Xóa biến `router` và `err` không được sử dụng.
-   **[Tiếp theo]** Chờ task kế tiếp từ Team Leader.