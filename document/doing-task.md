# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 03/12/2025

### Task đang làm

-   **[in_progress]** Hoàn thiện UI cho phần Members (Invite link).

---

### Task đã hoàn thành

-   **[completed]** Thêm bộ lọc (Filter) cho bảng Kanban.
-   **[completed]** Fix Vertical Scroll & Implement Smooth Scrolling:
    *   Đã xóa `overflow-hidden` khỏi `src/app/app/layout.tsx`.
    *   Đã tạo `src/components/providers/smooth-scroll.tsx` và tích hợp nó.
    *   Đã điều chỉnh styling trong `src/app/app/project/[id]/page.tsx` cho Kanban.
-   **[completed]** Restore "Add Column" Button and Fix Build Errors:
    *   Đã khôi phục `AddColumnButton` trong `src/components/kanban/kanban-board.tsx`.
    *   Đã di chuyển `src/app/(auth)/auth/page.tsx` đến `src/app/auth/page.tsx` để giải quyết lỗi build.
-   **[completed]** Implement Realtime Broadcast for Task Creation and Updates (Debugging Version):
    *   Đã thay thế `src/components/kanban/kanban-board.tsx` bằng phiên bản gỡ lỗi.
    *   Đã sửa lỗi build bằng cách cập nhật `src/components/kanban/board-column.tsx` và `src/components/kanban/task-card.tsx` để chấp nhận `members` prop.
    *   Đã nâng logic Realtime lên `src/components/kanban/project-kanban-view.tsx`.
    *   Đã sửa đổi `src/components/kanban/kanban-board.tsx` để chấp nhận `onUpdate` làm prop.
    *   Đã sửa đổi `src/components/kanban/task-detail-sheet.tsx` để chấp nhận và gọi `onUpdate` sau khi cập nhật tác vụ.
-   **[completed]** Implement Project Settings (Update & Delete):
    *   Đã cập nhật `src/lib/schemas.ts` với `UpdateProjectSchema`.
    *   Đã triển khai `updateProject` và `deleteProject` server actions trong `src/app/actions.ts`.
    *   Đã tạo `src/components/project/project-settings.tsx`.
    *   Đã tích hợp `ProjectSettings` vào `src/app/app/project/[id]/page.tsx`.
-   **[Hoàn thành]** Optimization Phase 1 (Instant Feedback):
    *   Tạo file `loading.tsx` cho các route: `/app`, `/app/workspace/[id]`, `/app/project/[id]`.
    *   Sử dụng **Skeleton** của Shadcn để hiển thị khung giao diện ngay lập tức.
-   **[Hoàn thành]** Optimization Phase 2 (Streaming):
    *   Refactor `ProjectDetailPage`:
        *   Tách phần fetch `tasks` nặng nề ra khỏi `page.tsx`.
        *   Chuyển logic fetch board vào một component riêng (VD: `<BoardContainer />`) và bọc nó trong `<Suspense>`.
    *   Dùng `Promise.all` ở những chỗ fetch `user` và `workspace` song song.
-   **~~[Hoàn thành]~~** ~~Implement Kanban Board Toolbar (Search & Filter).~~ (Bắt đầu lại task này với trọng tâm Filter)
-   **~~[Hoàn thành]~~** ~~Cập nhật file context `GEMINI.md` với các quy tắc làm việc mới.~~
-   **~~[Hoàn thành]~~** ~~Sửa lỗi và hoàn thiện UI cho tính năng "Giao việc" (Assignee).~~
-   **~~[Hoàn thành]~~** ~~Fix một chuỗi các lỗi build (Build Errors).~~
-   **~~[Hoàn thành]~~** ~~Thực hiện lại từ đầu tính năng "Giao việc" (Assignee) theo yêu cầu "FORCE RUN".~~
-   **~~[Hoàn thành]~~** ~~Chạy `brew upgrade` theo yêu cầu hệ thống.~~
-   **~~[Hoàn thành]~~** ~~Nghiên cứu codebase (đọc file `.md`, `package.json`, và các file source code).~~
