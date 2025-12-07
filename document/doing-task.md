## ~~[2025-12-07] Implement User Profile Settings~~
- Status: Done
- Changes:
    - Create `UpdateProfileSchema` in `src/lib/schemas.ts`.
    - Implement `updateProfile` server action in `src/app/actions.ts`.
    - Create `ProfileForm` component at `src/components/settings/profile-form.tsx`.
    - Create settings page at `src/app/app/settings/page.tsx`.
    - Add link to settings page in the main sidebar layout.

## ~~[2025-12-07] Restore Sidebar & Fix Layout Scroll~~
- Status: Done
- Changes: Overwrote `src/app/app/layout.tsx` with correct code to restore all sidebar icons and fix scrolling behavior.

## ~~[2025-12-07] Restore Settings Link in Sidebar~~
- Status: Done
- Changes:
    - Added `Settings` import to `lucide-react`.
    - Added new Link to `/app/settings` in the sidebar navigation.

## ~~[2025-12-07] Implement Client-side File Validation for Avatar~~
- Status: Done
- Changes:
    - Added file size validation (1MB limit) to `handleAvatarChange` in `src/components/settings/profile-form.tsx`.
    - Displayed toast error for oversized files, reset file input and preview.
    - Updated `UpdateProfileSchema` in `src/lib/schemas.ts` with file size validation.

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
-   **[completed]** Implement "Expand/Hide" Column Feature:
    *   Đã thêm tính năng mở rộng/thu gọn danh sách task trong mỗi cột Kanban vào `board-column.tsx`.
-   **[completed]** Refactor Kanban Layout (Grid View) & Move Add Column Button:
    *   Đã tạo `create-column-dialog.tsx`.
    *   Đã cập nhật `board-toolbar.tsx` để bao gồm `CreateColumnDialog`.
    *   Đã tái cấu trúc `kanban-board.tsx` để sử dụng bố cục lưới và loại bỏ `AddColumnButton`.
-   **[completed]** Resolve Hydration Mismatch Error:
    *   Đã khắc phục lỗi Hydration Mismatch liên quan đến định dạng ngày tháng trong `task-card.tsx`.
-   **[completed]** Fix Global Background Color & Native Scroll (Final Attempt):
    *   Đã cập nhật `src/app/globals.css` để sử dụng `bg-dashboard-background`.
    *   Đã thay thế `src/app/app/layout.tsx` để triển khai cuộn cửa sổ gốc.
    *   Đã sửa đổi `src/components/kanban/kanban-board.tsx` để thích ứng với mô hình cuộn mới.
    *   Đã tạo `src/components/providers/dynamic-smooth-scroll.tsx`.
    *   Đã sửa lỗi build liên quan đến import `Link` và `LayoutDashboard` trong `src/app/app/layout.tsx`.
-   **[completed]** Removed Playwright:
    *   Đã gỡ cài đặt `@playwright/test`.
    *   Đã xóa `playwright/`, `playwright-report/`, `.github/workflows/playwright.yml`, và `test-results/`.
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