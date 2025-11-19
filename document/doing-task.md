# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 19/11/2025

### Task đang thực hiện: Epic 2 - Quản lý Workspace & Dự án

-   **[Hoàn thành]** Bước 2.7: Implement "Ultra-Modern" Dashboard UI.
    -   `src/app/app/layout.tsx`: Tạo layout mới cho khu vực `/app` với theme tối, bao gồm Sidebar cho desktop và Header/Sheet menu cho mobile.
    -   `src/app/app/page.tsx`: Tái cấu trúc và thiết kế lại hoàn toàn trang dashboard chính với giao diện Bento Grid, Dark Mode, và hiển thị danh sách workspace theo phong cách mới.

### Task đã hoàn thành

-   **[Hoàn thành]** Bước 2.6: Refactor Dashboard to Server Component.
    -   `src/components/dashboard-header.tsx`: Tách phần header (vốn là client-side) ra một component riêng để giữ lại logic logout.
    -   `src/app/app/page.tsx`: Chuyển đổi trang dashboard chính thành Server Component, thực hiện lấy dữ liệu workspace và render danh sách ngay trên server.
-   **[Hoàn thành]** Bước 2.5: Build Workspace Dashboard & Create Project UI.
    -   `src/components/create-project-modal.tsx`: Tạo component modal để xử lý việc tạo project mới, sử dụng `Dialog` và `react-hook-form`.
    -   `src/app/app/workspace/[id]/page.tsx`: Tạo trang dashboard cho từng workspace, hiển thị danh sách các project hiện có và tích hợp `CreateProjectModal` để người dùng có thể tạo project mới.
-   **[Hoàn thành]** Bước 2.4: Refactor Server Actions.
    -   `src/app/actions.ts`: Cập nhật lại các server actions đã tạo.
    -   Sửa lại đúng tên biến của Prisma Client từ `prisma` thành `db`.
    -   Sửa lại cách gọi hàm `createClient` của Supabase thành `await createClient()` vì đây là hàm bất đồng bộ.
-   **[Hoàn thành]** Bước 2.3: Implement Server Action `createProject`.
    -   `src/app/actions.ts`: Bổ sung `createProject` action vào file.
    -   Action này bao gồm logic kiểm tra quyền hạn (user phải là thành viên của workspace) và tự động khởi tạo các cột Kanban mặc định (`To Do`, `In Progress`, `Done`) cho project mới.
-   **[Hoàn thành]** Bước 2.2: Tạo trang UI cho "Create Workspace".
    -   `src/app/app/create-workspace/page.tsx`: Tạo trang mới cho phép người dùng nhập tên và tạo một workspace.
    -   Trang này là một Client Component, sử dụng `react-hook-form` và `zodResolver` để quản lý form và tương tác với server action `createWorkspace`. Giao diện được dựng bằng các component của Shadcn/UI.
-   **[Hoàn thành]** Bước 2.1: Implement Server Action `createWorkspace`.
    -   `src/app/actions.ts`: Tạo file mới chứa các Server Actions của ứng dụng.
    -   Viết action `createWorkspace` để xử lý logic tạo Workspace mới, bao gồm: xác thực người dùng qua Supabase, kiểm tra dữ liệu đầu vào bằng Zod, tạo record `Workspace` và liên kết người dùng hiện tại làm thành viên đầu tiên thông qua Prisma.
-   **[Hoàn thành]** Các task thuộc Epic 1 - Nền tảng & Xác thực.

-   **[Tiếp theo]** Chờ task kế tiếp từ Team Leader.