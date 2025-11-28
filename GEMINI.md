### 📋 TASKFLOW PROJECT - HANDOFF CONTEXT (v2.0 - Performance Focus)

**1. Role & Persona (Vai trò)**
* **Bạn là:** Principal Next.js Engineer (5+ năm kinh nghiệm).
* **Tư duy:** "Performance First" - Code chạy đúng chưa đủ, phải chạy nhanh.
* **Stack:** Next.js 15 (App Router), React 19, Prisma (MongoDB), Supabase (Auth & Storage), Tailwind CSS, Shadcn UI, dnd-kit.

**2. Kiến trúc & Quy tắc "Vàng" (Critical Rules)**
* **Database Access:** Luôn import `db` từ `@/lib/db`. **TUYỆT ĐỐI KHÔNG** dùng `prisma`.
* **Import Paths:** Dùng alias `@/`. **KHÔNG** dùng `@/src/...`.
* **Server Actions:** Validate input bằng **Zod**. Check Auth trước khi query DB.
* **Kanban Logic:**
    * `moveTask` phải dùng **Transaction** để Re-indexing toàn bộ cột (Logic đã fix và hoạt động tốt, không được sửa lại logic cũ).
    * `columns` được lưu dạng JSON trong Project.
* **Performance (NEW):**
    * Ưu tiên **Streaming** (`<Suspense>`) cho các thành phần load chậm (Kanban Board).
    * Sử dụng `Promise.all` để fetch dữ liệu song song.
    * Luôn có `loading.tsx` cho các route chính.

**3. Trạng thái dự án (Current Status)**

**✅ Đã hoàn thành (Done & Stable):**
* **Core:** Auth, Routing, Middleware, Dashboard UI.
* **Workspace:** CRUD Workspace, Mời thành viên (cơ bản).
* **Project:** Tạo Project, chi tiết Project.
* **Kanban Board (Feature Complete):**
    * Drag & Drop mượt mà (đã fix lỗi nhảy vị trí).
    * Task CRUD: Tạo, Sửa, Xóa.
    * Comments: Đã có UI và logic (đã fix lỗi optimistic update).
    * Attachments: Refactored to a direct-to-storage upload pattern, fixing file size limits and adding client-side validation. Now includes image previews in a responsive grid.
    * Column Management: Đã có logic thêm/sửa cột (đã fix lỗi không đồng bộ state và spam click).
    * Layout: Updated Kanban board container to ensure proper horizontal scrolling and column sizing (`flex h-full gap-6 overflow-x-auto p-4 items-start`).
    * Refactored "Add Column": Moved the "Add Column" button to the project header and rebuilt it as a `Popover`-based client component for a cleaner UI and better UX.
* **Performance & UX:**
    * Implemented route-level loading skeletons (`loading.tsx`) for instant UI feedback.
    * Refactored Project Detail Page to use React Suspense and streaming, preventing render-blocking from heavy data fetches.
    * Implemented an optimistic UI for task creation, making new tasks appear instantly on the board.
* **Build & Code Health:** Resolved critical build errors (`no-explicit-any`) and cleaned up all code quality warnings (`no-unused-vars`, `no-img-element`) to ensure a stable and clean build. All temporary debugging logs have also been commented out.
* **Layout:** Implemented an "app-like" layout (`h-screen overflow-hidden`) at the root level (`src/app/app/layout.tsx`) to prevent body scrolling. This fixes a critical bug where the background would break when the Kanban board overflowed horizontally.

**🚨 Vấn đề Nghiêm trọng (Critical Issues):**
* **Performance:** While the project page is optimized, other pages (`/app`, `/app/workspace/[id]`) may still suffer from slower, non-streamed data fetching. A full performance review across the app is still needed.

**📝 Kế hoạch hành động tiếp theo (Next Steps - Priority High):**

1.  **~~Optimization Phase 1 (Instant Feedback):~~ (DONE)**
    *   ~~Tạo file `loading.tsx` cho các route: `/app`, `/app/workspace/[id]`, `/app/project/[id]`.~~
    *   ~~Sử dụng **Skeleton** của Shadcn để hiển thị khung giao diện ngay lập tức.~~

2.  **~~Optimization Phase 2 (Streaming):~~ (DONE)**
    *   ~~Refactor `ProjectDetailPage`:~~
        *   ~~Tách phần fetch `tasks` nặng nề ra khỏi `page.tsx`.~~
        *   ~~Chuyển logic fetch board vào một component riêng (VD: `<BoardContainer />`) và bọc nó trong `<Suspense>`.~~
    *   ~~Dùng `Promise.all` ở những chỗ fetch `user` và `workspace` song song.~~

3.  **Enhancements (Sau khi fix performance):**
    * Hoàn thiện UI cho phần Members (Invite link).
    * Thêm bộ lọc (Filter) cho bảng Kanban.

**Lưu ý đặc biệt cho AI Agent:**
* **KHÔNG** viết thêm tính năng mới cho đến khi giải quyết xong vấn đề Performance.
* Khi refactor `page.tsx` để tối ưu, tuyệt đối **KHÔNG** làm hỏng logic `Drag & Drop` đã fix (giữ nguyên logic `moveTask` transaction).
* Kiểm tra kỹ file `src/app/actions.ts` trước khi sửa đổi bất cứ logic nào liên quan đến database.