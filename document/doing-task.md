# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 19/11/2025

### Task đang thực hiện: Epic 3 - Quản lý Task & Kanban Board

-   **[Hoàn thành]** Bước 3.4: Implement Task Attachments.
    -   `src/lib/schemas.ts`: Thêm các Zod schema cho việc upload và xóa file.
    -   `src/app/actions.ts`: Thêm hai server action `uploadAttachment` và `deleteAttachment` để xử lý logic với Supabase Storage và CSDL.
    -   `src/app/app/project/[id]/page.tsx`: Cập nhật câu query để lấy kèm danh sách `attachments` của task.
    -   `src/components/kanban/attachment-list.tsx`: Tạo component client để hiển thị danh sách file, xử lý logic upload và xóa.
    -   `src/components/kanban/task-detail-sheet.tsx`: Tích hợp `AttachmentList` vào giao diện chi tiết task.

### Task đã hoàn thành

-   **[Hoàn thành]** Bước 3.3: Implement Task Detail, Edit & Comments.
    -   Cài đặt các component shadcn và thư viện `date-fns` cần thiết.
    -   `src/lib/schemas.ts`: Thêm `UpdateTaskSchema`, `CreateCommentSchema`, `DeleteCommentSchema`.
    -   `src/app/actions.ts`: Thêm các server action `updateTask`, `deleteTask`, `createComment`, `deleteComment`.
    -   `src/components/kanban/comment-section.tsx`: Tạo component client để hiển thị và tạo bình luận mới với `useOptimistic`.
    -   `src/components/kanban/task-detail-sheet.tsx`: Tạo component Sheet chứa form chỉnh sửa chi tiết task và tích hợp `CommentSection`.
    -   Cập nhật luồng dữ liệu từ page xuống các component con để truyền `comments` và `currentUser`.
    -   `src/types/prisma.ts`: Tạo file type chung `TaskWithDetails` để giải quyết lỗi type mismatch và đồng bộ hóa dữ liệu.
-   **[Hoàn thành]** Bước 3.2: Implement Kanban Drag & Drop.
    -   `src/app/actions.ts`: Thêm server action `moveTask` để cập nhật vị trí và cột của task trong CSDL.
    -   `src/components/kanban/task-card.tsx`: Tái cấu trúc để sử dụng hook `useSortable` của dnd-kit.
    -   `src/components/kanban/board-column.tsx`: Tái cấu trúc để sử dụng hook `useDroppable` và `SortableContext`.
    -   `src/components/kanban/kanban-board.tsx`: Tạo component client chính chứa toàn bộ logic kéo-thả, quản lý state và xử lý optimistic UI.
    -   `src/app/app/project/[id]/page.tsx`: Cập nhật để sử dụng component `KanbanBoard` thay cho logic render tĩnh.
-   **[Hoàn thành]** Bước 3.1: Implement Kanban Task Management.
    -   `src/app/actions.ts`: Thêm server action `createTask` với logic tính toán `order`.
    -   `src/components/kanban/task-card.tsx`: Tạo component thẻ Task và áp dụng style chi tiết (hover, cursor, badge).
    -   `src/components/kanban/create-task-dialog.tsx`: Tạo component dialog form để tạo task mới.
    -   `src/components/kanban/board-column.tsx`: Tạo component Cột và áp dụng style chi tiết (kích thước, màu nền, cuộn dọc).
    -   `src/app/app/project/[id]/page.tsx`: Tái cấu trúc trang project để sử dụng các component Kanban mới, render đúng danh sách task trong từng cột.
-   **[Hoàn thành]** Bước 2.8: Implement Project Detail Page Skeleton.
    -   `src/app/app/project/[id]/page.tsx`: Tạo trang chi tiết project động, là một Server Component.
    -   Implement logic lấy dữ liệu project, kiểm tra quyền truy cập của user.
    -   Xây dựng giao diện ban đầu bao gồm Breadcrumb, Header, và hệ thống Tabs (`Board`, `List`, `Settings`).
    -   Dựng sườn cho bảng Kanban trong tab "Board", hiển thị các cột (column) từ dữ liệu JSON của project.
-   **[Hoàn thành]** Bước 2.7: Implement "Ultra-Modern" Dashboard UI.
    -   `src/app/app/layout.tsx`: Tạo layout mới cho khu vực `/app` với theme tối, bao gồm Sidebar cho desktop và Header/Sheet menu cho mobile.
    -   `src/app/app/page.tsx`: Tái cấu trúc và thiết kế lại hoàn toàn trang dashboard chính với giao diện Bento Grid, Dark Mode, và hiển thị danh sách workspace theo phong cách mới.
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