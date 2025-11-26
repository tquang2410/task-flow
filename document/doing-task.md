# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 26/11/2025

### Task đang thực hiện: Refactor Core Kanban Logic (Drag & Drop + Ordering)

-   **[Hoàn thành]** Refactor Core Kanban Logic.
    -   **Phase 1: Server Actions (`src/app/actions.ts`):**
        -   ✅ Kiểm tra và xác nhận logic của `createTask` đã chính xác.
        -   ✅ Viết lại hoàn toàn `moveTask` để xử lý việc sắp xếp lại `order` trong một transaction, áp dụng cho cả việc kéo thả trong cùng một cột và khác cột.
        -   ✅ Thêm `MoveTaskSchema` vào `src/lib/schemas.ts` để validate input mới.
    -   **Phase 2: Frontend Component (`src/components/kanban/kanban-board.tsx`):**
        -   ✅ Refactor lại toàn bộ logic D&D: `onDragStart` (lưu state), `onDragOver` (cập nhật UI tạm thời), và `onDragEnd` (gọi action và xử lý rollback).
        -   ✅ Đảm bảo component gửi đúng và đủ payload (`taskId`, `activeColumnId`, `newColumnId`, `newIndex`) cho server action `moveTask` mới.

---

### Task đã hoàn thành
-   **[Hoàn thành]** Cập nhật tài liệu README.md.
-   **[Hoàn thành]** Fix Critical Redirect Bug on Workspace Page.
-   **[Hoàn thành]** FORCE FIX Build Error (TypeScript Union Type Issue).
-   **[Hoàn thành]** FORCE FIX Next.js 15 `params` Type Mismatch.
-   **[Hoàn thành]** Fix Vercel Build Error (Next.js 15 Params Type Mismatch).
-   **[Hoàn thành]** Fix Build Errors (Linting & Missing Imports).
-   **[Hoàn thành]** Fix Vercel Build Error (Syntax Error).
-   **[Hoàn thành]** Epic 2 - Quản lý Thành viên Workspace.
-   **[Hoàn thành]** Epic 3 - Quản lý Cột Kanban (Column Management).
-   **[Hoàn thành]** Bước 3.4: Implement Task Attachments.
-   **[Hoàn thành]** Bước 3.3: Implement Task Detail, Edit & Comments.
-   **[Hoàn thành]** Bước 3.2: Implement Kanban Drag & Drop.
-   **[Hoàn thành]** Bước 3.1: Implement Kanban Task Management.
-   **[Hoàn thành]** Bước 2.8: Implement Project Detail Page Skeleton.
-   **[Hoàn thành]** Bước 2.7: Implement "Ultra-Modern" Dashboard UI.
-   **[Hoàn thành]** Bước 2.6: Refactor Dashboard to Server Component.
-   **[Hoàn thành]** Bước 2.5: Build Workspace Dashboard & Create Project UI.
-   **[Hoàn thành]** Bước 2.4: Refactor Server Actions.
-   **[Hoàn thành]** Bước 2.3: Implement Server Action `createProject`.
-   **[Hoàn thành]** Bước 2.2: Tạo trang UI cho "Create Workspace".
-   **[Hoàn thành]** Bước 2.1: Implement Server Action `createWorkspace`.
-   **[Hoàn thành]** Các task thuộc Epic 1 - Nền tảng & Xác thực.

-   **[Tiếp theo]** Chờ task kế tiếp từ Team Leader.