# Các Task Đang Thực Hiện

Tài liệu này ghi lại các task mà Gemini đang thực hiện theo yêu cầu của Team Leader.

---

## Cập nhật lần cuối: 26/11/2025

### Task đang thực hiện: Epic 2 - Quản lý Thành viên Workspace

-   **[Hoàn thành]** Implement Workspace Member Management (Invite & List).
    -   **Phase 1: Server Actions:**
        -   ✅ Thêm Zod schemas: `AddMemberSchema`, `RemoveMemberSchema`.
        -   ✅ Tạo server action `addMemberToWorkspace` trong `src/app/actions.ts`.
        -   ✅ Tạo server action `removeMemberFromWorkspace` trong `src/app/actions.ts`, xử lý quyền admin.
        -   ✅ Sửa lỗi data consistency trong action `createWorkspace`.
    -   **Phase 2: UI Component:**
        -   ✅ Tạo file component mới `src/components/workspace/member-list-dialog.tsx`.
        -   ✅ Dựng giao diện Dialog với form mời và danh sách thành viên.
    -   **Phase 3: Integration:**
        -   ✅ Tạo component client `workspace-header-actions.tsx` để quản lý state.
        -   ✅ Update trang `workspace/[id]/page.tsx` để lấy dữ liệu members và tích hợp component mới.
        -   ✅ Sửa lỗi authorization check trong `workspace/[id]/page.tsx`.

---

### Task đã hoàn thành
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