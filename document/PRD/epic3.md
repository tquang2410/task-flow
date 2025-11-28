---

# 📄 PRD: Epic 3 - Quản lý Task & Kanban Board

**Tác giả:** (Principal Next.js Engineer)
**Ngày tạo:** 28/11/2025
**Trạng thái:** Đang thực hiện (In Progress)

---

## 1. Giới thiệu & Mục tiêu (Introduction & Objective)

**Mục tiêu:** Hoàn thiện toàn bộ trải nghiệm quản lý công việc trên giao diện bảng Kanban. Biến TaskFlow từ một "công cụ vẽ bảng" thành một "hệ thống quản lý dự án" thực thụ với khả năng cộng tác sâu (Comments, Attachments) và tìm kiếm (Filter).

**Tại sao (Why):**
* **Core Value:** Đây là tính năng cốt lõi nhất của sản phẩm. Người dùng dành 90% thời gian ở đây.
* **Cộng tác:** Task cần có người chịu trách nhiệm (Assignee) và nơi trao đổi (Comments).
* **Hiệu suất:** Khi dự án lớn lên (> 50 tasks), người dùng cần công cụ Lọc & Tìm kiếm để không bị ngợp.

---

## 2. Câu chuyện Người dùng (User Stories)

| Mã | Vai trò | Mong muốn | Kết quả (Mục đích) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **US-3.1** | Member | Tôi muốn **kéo thả Task** giữa các cột | Để cập nhật tiến độ công việc nhanh chóng. | ✅ Done |
| **US-3.2** | Member | Tôi muốn **tạo và chỉnh sửa Task** (Title, Priority, Deadline) | Để ghi lại thông tin công việc chi tiết. | ✅ Done |
| **US-3.3** | Member | Tôi muốn **bình luận và đính kèm file** vào Task | Để trao đổi và cung cấp tài liệu liên quan. | ✅ Done |
| **US-3.4** | PM/Admin | Tôi muốn **tùy chỉnh các cột** (Thêm, Sửa, Xóa) | Để bảng Kanban phù hợp với quy trình riêng của team. | ✅ Done |
| **US-3.5** | PM | Tôi muốn **giao việc (Assign)** cho một thành viên khác | Để xác định rõ trách nhiệm ai làm việc gì. | ✅ Done |
| **US-3.6** | User | Tôi muốn **tìm kiếm và lọc Task** (theo tên, người làm) | Để nhanh chóng tìm thấy công việc của mình giữa "rừng" task. | ⏳ Pending |

---

## 3. Yêu cầu Chức năng & Phân chia Phase

Để dễ quản lý, Epic 3 được chia thành 3 giai đoạn (Phases).

### 🟢 Phase 1: Core Kanban & Structure (Đã hoàn thành)
Tập trung vào khung sườn và các thao tác cơ bản.
* **FR-3.1: Hiển thị Bảng:** Render cột và task card chuẩn UI/UX.
* **FR-3.2: Drag & Drop:** Kéo thả mượt mà, cập nhật vị trí tức thời (Optimistic UI), đồng bộ DB chuẩn xác (Transaction Re-indexing).
* **FR-3.3: Column Management:** Thêm, Sửa tên, Xóa cột.

### 🟢 Phase 2: Task Details & Collaboration (Đã hoàn thành)
Tập trung vào nội dung sâu bên trong Task.
* **FR-3.4: Task CRUD:** Tạo nhanh, Sửa title/description/priority/dueDate, Xóa task.
* **FR-3.5: System Comments:** Gửi bình luận, hiển thị lịch sử trao đổi.
* **FR-3.6: Attachments:** Upload file qua Supabase Storage, hiển thị danh sách file, xóa file.

### 🟡 Phase 3: Management & Power Tools (Đang thực hiện)
Tập trung vào khả năng quản lý và tìm kiếm khi dữ liệu nhiều lên.
* **FR-3.7: Assignee (Giao việc):**
    * Trong `TaskDetailSheet`: Thêm Select/Combobox chọn thành viên (từ danh sách member của Workspace).
    * Hiển thị Avatar người được giao trên `TaskCard` ngoài bảng.
* **FR-3.8: Board Toolbar (Search & Filter):**
    * Input tìm kiếm theo tên Task.
    * Filter theo Member (Click avatar để lọc task của người đó).
    * Filter theo Priority/Label.
* **FR-3.9: Notifications (Cơ bản):**
    * Hiển thị thông báo khi được assign hoặc có comment mới (Có thể đẩy sang Epic 4 nếu thiếu thời gian).

---

## 4. Kế hoạch Kỹ thuật (Technical Plan cho Phase 3)

#### 4.1. Database Migration (Nếu cần)
* Kiểm tra model `Task`: Đã có `assigneeId` chưa? (Đã có trong schema hiện tại).
* Đảm bảo quan hệ `assignee` (User) được include khi query.

#### 4.2. UI Components
* **`MemberSelect`**: Component chọn người dùng (dùng `Popovver` + `Command` của Shadcn).
* **`BoardToolbar`**: Component chứa thanh search và bộ lọc, đặt trên cùng của bảng Kanban.

#### 4.3. Client-side Logic
* **Filtering:** Thực hiện filter ngay tại Client (trên state `tasks` của `KanbanBoard`) để đảm bảo tốc độ tức thì (Instant Feedback). Không gọi API search trừ khi dữ liệu quá lớn (Phân trang).

---

## 5. Tiêu chí Hoàn thành (Definition of Done)

* [x] User có thể gán Task cho thành viên khác trong Workspace.
* [x] Avatar người được giao hiện lên trên thẻ Task.
* [ ] Nhập từ khóa vào ô tìm kiếm -> Bảng chỉ hiện các task khớp tên.
* [ ] Click vào Avatar trên thanh Toolbar -> Bảng chỉ hiện task của người đó.
* [ ] Không có lỗi Crash/Lag khi filter liên tục.

---

Sau khi bạn tạo file này xong, chúng ta sẽ bắt tay ngay vào **Phase 3: Giao việc (Assignee) & Bộ lọc (Filter)** nhé!