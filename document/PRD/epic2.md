
---

# 📄 PRD: Epic 2 - Quản lý Workspace & Dự án (Project)

**Tác giả:** (Principal Next.js Engineer)
**Ngày tạo:** 19/11/2025
**Trạng thái:** Đã chốt (Committed)

---

## 1. Giới thiệu & Mục tiêu (Introduction & Objective)

**Mục tiêu:** Xây dựng các Module cốt lõi (Module 2 và Module 3 trong SRS) cho phép người dùng tổ chức và phân chia công việc trong môi trường đa dự án. Đây là bước đệm cần thiết để triển khai Module Kanban Board ở Epic 3.

**Tại sao (Why):**
* **Cộng tác & Phân quyền:** **Workspace** là ranh giới đầu tiên để tách biệt dữ liệu giữa các tổ chức và cho phép mời/quản lý thành viên.
* **Tổ chức Công việc:** **Project** là đơn vị cơ sở để chứa các Task, cho phép người dùng bắt đầu lập kế hoạch.
* **Cơ sở cho Kanban:** Phải thiết lập cấu trúc Project và Column (`columns: Json` trong `schema.prisma`) trước khi có thể xây dựng giao diện Kanban (Epic 3).

---

## 2. Đối tượng người dùng (Audience)

* **Admin (Người tạo Workspace):** Cần công cụ để thiết lập môi trường làm việc ban đầu và mời/quản lý thành viên.
* **Project Manager:** Cần khả năng tạo và cấu hình các Project mới.
* **Thành viên (Member):** Cần được mời và tham gia vào Workspace và các Project liên quan.

---

## 3. Câu chuyện Người dùng (User Stories)

| Mã | Vai trò | Mong muốn | Kết quả (Mục đích) |
| :--- | :--- | :--- | :--- |
| **US-2.1** | Người dùng mới | Tôi muốn **tạo một Workspace mới** sau khi đăng nhập lần đầu | Để tôi có thể bắt đầu thiết lập môi trường làm việc cho nhóm của mình. |
| **US-2.2** | Admin | Tôi muốn **mời người dùng khác** tham gia Workspace của tôi bằng email | Để nhóm của tôi có thể bắt đầu cộng tác. |
| **US-2.3** | Admin | Tôi muốn **quản lý thành viên** (xem, xóa, thay đổi vai trò) trong Workspace | Để tôi có thể dễ dàng quản lý nhóm và phân quyền. |
| **US-2.4** | Thành viên | Tôi muốn **tạo một Project mới** trong Workspace mà tôi là thành viên | Để tôi có thể bắt đầu tổ chức các Task liên quan. |
| **US-2.5** | PM/Admin | Tôi muốn **quản lý thành viên Dự án** (thêm/bớt) | Để giới hạn những người có thể xem và làm việc trên Project này. |
| **US-2.6** | PM/Admin | Tôi muốn **tạo, sửa tên, và sắp xếp lại các Cột (Column)** cho Project | Để xác định các bước trong quy trình làm việc Kanban của Project đó. |

---

## 4. Yêu cầu Chức năng (Functional Requirements)

Đây là các tính năng "WHAT" chúng ta phải xây dựng.

#### FR-2.1: Luồng Onboarding và Tạo Workspace
* **Logic Onboarding:** Sau khi đăng nhập, hệ thống phải kiểm tra User trong CSDL MongoDB. Nếu User chưa là thành viên của Workspace nào, chuyển hướng đến trang `/app/create-workspace`.
* **Server Action:** Tạo **`createWorkspace`** (trong `src/app/actions.ts`):
    * Sử dụng **Zod Schema** (`CreateWorkspaceSchema`) để validate input.
    * Tạo record `Workspace` mới.
    * Gán `User` hiện tại vào mảng `memberIds` và cập nhật `workspaceIds` của `User` đó.

#### FR-2.2: Quản lý Thành viên Workspace
* **Giao diện:** Trang quản lý thành viên (`/app/workspace/[id]/members`).
* **Server Action:** **`inviteMemberToWorkspace`**: Nhận `workspaceId` và `email`.
    * Yêu cầu kiểm tra quyền **Admin** của người gọi Action (Bảo mật).
    * Logic gửi email mời tham gia Workspace.
* **Server Action:** **`updateMemberRole`** / **`removeMember`**: Cập nhật vai trò hoặc xóa thành viên khỏi Workspace.

#### FR-2.3: Luồng Tạo Dự án (Project Creation)
* **Giao diện:** Form tạo Project (Modal hoặc trang).
* **Server Action:** **`createProject`** (trong `src/app/actions.ts`):
    * Sử dụng **Zod Schema** (`CreateProjectSchema`) để validate input.
    * Tạo record `Project` mới, liên kết với `workspaceId`.
    * Khởi tạo trường `columns: Json` với cấu hình mặc định (ví dụ: To Do, In Progress, Done).

#### FR-2.4: Cấu hình Project Columns (Kanban)
* **Giao diện:** Trang cài đặt Project để chỉnh sửa các cột.
* **Server Action:** **`updateProjectColumns`**:
    * Nhận `projectId` và mảng `columns: Json` mới (sau khi người dùng kéo thả/chỉnh sửa).
    * Cập nhật trường `columns` trong `Project` Model, giữ nguyên định dạng JSON đã thống nhất.

#### FR-2.5: Quản lý thành viên Dự án
* **Server Action:** **`updateProjectMembers`**:
    * Cho phép PM/Admin thêm/xóa thành viên từ danh sách thành viên Workspace vào Project.
    * Dữ liệu thành viên Project sẽ được lưu trữ dưới dạng một mảng ID trong `Project` Model (tuy nhiên, hiện tại `schema.prisma` chưa có mảng này, cần bổ sung nếu muốn giới hạn thành viên ở cấp Project).

---

## 5. Những thứ KHÔNG làm (Out of Scope)

Để đảm bảo Epic 2 hoàn thành đúng tiến độ, chúng ta sẽ **KHÔNG** làm các tính năng sau:

* **Báo cáo/Metrics:** Dashboard thống kê chi tiết về Project/Workspace (sẽ làm ở Epic 4).
* **Quản lý Tài khoản (Billing):** Thanh toán, gói dịch vụ.
* **Tích hợp bên thứ ba:** (Slack, Github, v.v.).
* **Xóa Project/Workspace:** Chỉ tập trung vào tạo và cập nhật.

---

## 6. Tiêu chí Hoàn thành & Thành công (Success Metrics)

Chúng ta coi Epic 2 là thành công khi:

* Người dùng đăng nhập thành công **luôn được chuyển hướng đúng** đến Onboarding (nếu cần) hoặc Dashboard.
* **100%** các Server Action liên quan đến Workspace và Project đều hoạt động ổn định và được bảo vệ bằng kiểm tra xác thực.
* Người dùng có thể **tạo một Project mới** và tùy chỉnh các cột trạng thái của Project đó, với dữ liệu được lưu trữ chính xác trong `columns: Json`.
* Tỷ lệ lỗi trong các Server Action `createWorkspace` và `createProject` < 0.5%.

---