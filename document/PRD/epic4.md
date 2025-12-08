# 📄 PRD: Epic 4 - Cá nhân hóa & Tính năng Nâng cao

**Trạng thái:** Đang thực hiện (In Progress)

## 1. Giới thiệu
Nâng cấp trải nghiệm người dùng thông qua việc cá nhân hóa tài khoản và cung cấp các góc nhìn dữ liệu quản trị nâng cao (Timeline, Search).

## 2. User Stories
| Mã | Vai trò | Mong muốn | Mục đích |
| :--- | :--- | :--- | :--- |
| **US-4.1** | User | Tôi muốn **đổi Avatar và Tên hiển thị** | Để đồng nghiệp dễ nhận diện tôi trên bảng Kanban. |
| **US-4.2** | Manager | Tôi muốn xem dự án dưới dạng **Timeline (Gantt)** | Để nắm bắt tiến độ và sự phụ thuộc giữa các task theo thời gian. |
| **US-4.3** | User | Tôi muốn **tìm kiếm toàn cục (Global Search)** | Để tìm task ở bất kỳ dự án nào từ Dashboard. |

## 3. Yêu cầu Chức năng

### 3.1. Module Profile Settings (Đã hoàn thành)
* **Giao diện:** Trang `/app/settings` với form cập nhật thông tin.
* **Chức năng:**
    * Upload ảnh Avatar (Lưu trữ: Supabase Storage bucket `AVATARS`).
    * Cập nhật Tên hiển thị (Display Name).
    * Validation: Giới hạn dung lượng ảnh < 1MB tại Client.

### 3.2. Module Timeline View (Gantt Chart)
* **Giao diện:** Tab "Timeline" trong trang chi tiết Dự án.
* **Chức năng:**
    * Hiển thị Task trên trục thời gian ngang.
    * Kéo thả để thay đổi Start Date / Due Date.
    * Phụ thuộc (Dependencies): Nối các task với nhau (Optional).

### 3.3. Module Global Search
* **Giao diện:** Thanh tìm kiếm trên Header của Dashboard (`/app`).
* **Chức năng:**
    * Tìm kiếm theo từ khóa (Keyword) trên toàn bộ Workspace.
    * Kết quả trả về: Projects và Tasks khớp tên.
    * Click vào kết quả -> Điều hướng đến trang chi tiết.