
Đây là một tài liệu mẫu, bạn nên điều chỉnh lại dựa trên tầm nhìn và quy mô MVP (Minimum Viable Product - Sản phẩm Khả thi Tối thiểu) mà bạn mong muốn.

---

## 📄 Tài liệu Đặc tả Yêu cầu (SRS)
**Dự án:** TaskFlow (Website Quản lý Task cho Doanh nghiệp)
**Phiên bản:** 1.0
**Ngày:** 15/11/2025

---

### 1. Giới thiệu

#### 1.1 Mục đích
Tài liệu này đặc tả các yêu cầu chức năng và phi chức năng của hệ thống **TaskFlow**. Mục tiêu của TaskFlow là cung cấp một nền tảng web (SaaS - Software as a Service) cho phép các doanh nghiệp, đội nhóm tổ chức, phân công, và theo dõi tiến độ công việc một cách trực quan và hiệu quả, tương tự như các công cụ Jira hay Trello.

#### 1.2 Phạm vi dự án
Hệ thống sẽ tập trung vào các chức năng cốt lõi của việc quản lý dự án:

* **Bao gồm (In Scope):**
    * Quản lý xác thực người dùng và phân quyền cơ bản.
    * Quản lý Workspace (Không gian làm việc) cho từng tổ chức.
    * Quản lý Dự án (Project) bên trong Workspace.
    * Quản lý Công việc (Task) với các thuộc tính chi tiết.
    * Giao diện bảng (Kanban Board) để theo dõi trực quan.
    * Hệ thống bình luận và thông báo cơ bản.

* **Không bao gồm (Out of Scope - cho phiên bản 1.0):**
    * Tích hợp bên thứ ba (Github, Slack, Google Calendar).
    * Biểu đồ Gantt, báo cáo nâng cao.
    * Tính năng time-tracking (theo dõi thời gian).
    * Quản lý tài chính, ngân sách dự án.

#### 1.3 Thuật ngữ và Định nghĩa
* **Workspace:** Môi trường làm việc cấp cao nhất, thường đại diện cho một công ty hoặc một tổ chức. Mọi Project đều nằm trong Workspace.
* **Project:** Một tập hợp các công việc (Tasks) để đạt được một mục tiêu cụ thể.
* **Task (Công việc):** Đơn vị công việc nhỏ nhất, có thể gán cho một người.
* **Board (Bảng):** Giao diện Kanban trực quan, hiển thị các Task dưới dạng các cột trạng thái.
* **Column (Cột):** Đại diện cho một trạng thái của công việc (ví dụ: "Cần làm", "Đang làm", "Đã xong").
* **Admin (Quản trị viên):** Người có quyền cao nhất trong Workspace (quản lý thành viên, dự án, thanh toán).
* **Member (Thành viên):** Người dùng thông thường, tham gia vào các dự án và thực hiện Task.

---

### 2. Mô tả Tổng quan

#### 2.1 Bối cảnh sản phẩm
TaskFlow là một ứng dụng web độc lập, được xây dựng mới hoàn toàn. Người dùng sẽ truy cập hệ thống qua trình duyệt web trên máy tính và thiết bị di động.

#### 2.2 Đối tượng người dùng
* **Quản trị viên (Admin):**
    * **Mục tiêu:** Quản lý toàn bộ Workspace, mời/xóa thành viên, tạo dự án, thiết lập các quy trình chung.
    * **Kỹ năng:** Có hiểu biết về quản lý dự án, quen thuộc với các công cụ công nghệ.
* **Quản lý dự án (Project Manager - PM):**
    * **Mục tiêu:** Lập kế hoạch, tạo Task, gán Task cho thành viên, theo dõi tiến độ và báo cáo.
    * **Kỹ năng:** Kỹ năng tổ chức và quản lý.
* **Thành viên (Team Member):**
    * **Mục tiêu:** Nhận Task được giao, cập nhật trạng thái, bình luận và cộng tác với các thành viên khác.
    * **Kỹ năng:** Chuyên môn về công việc của mình.

---

### 3. Yêu cầu Chức năng (Functional Requirements)

Đây là phần mô tả chi tiết hệ thống sẽ *làm gì*.

#### 3.1 Module 1: Quản lý Xác thực (Authentication)
* **REQ-FUN-1.1: Đăng ký**
    * Người dùng có thể đăng ký tài khoản mới bằng Tên, Email và Mật khẩu.
    * Hệ thống phải xác thực email (gửi link kích hoạt).
* **REQ-FUN-1.2: Đăng nhập**
    * Người dùng có thể đăng nhập bằng Email và Mật khẩu.
    * Hệ thống phải có tính năng "Quên mật khẩu" (gửi link reset qua email).
* **REQ-FUN-1.3: Đăng xuất**
    * Người dùng có thể đăng xuất khỏi hệ thống.
* **REQ-FUN-1.4: Đăng nhập bằng Google (Tùy chọn)**
    * Người dùng có thể đăng nhập/đăng ký nhanh bằng tài khoản Google.

#### 3.2 Module 2: Quản lý Workspace
* **REQ-FUN-2.1: Tạo Workspace**
    * Sau khi đăng ký, người dùng sẽ được yêu cầu tạo một Workspace mới (hoặc tham gia Workspace có sẵn nếu được mời).
    * Người tạo Workspace mặc định là **Admin**.
* **REQ-FUN-2.2: Mời thành viên**
    * Admin có thể mời thành viên mới vào Workspace qua địa chỉ email.
    * Email mời phải chứa một đường link duy nhất để tham gia.
* **REQ-FUN-2.3: Quản lý thành viên**
    * Admin có thể xem danh sách thành viên trong Workspace.
    * Admin có thể thay đổi vai trò (Admin / Member) hoặc xóa thành viên khỏi Workspace.

#### 3.3 Module 3: Quản lý Dự án (Project)
* **REQ-FUN-3.1: Tạo Dự án**
    * Bất kỳ thành viên nào trong Workspace cũng có thể tạo một Dự án mới.
    * Khi tạo, người dùng phải nhập Tên dự án và chọn loại dự án (ví dụ: "Kanban Board đơn giản").
* **REQ-FUN-3.2: Quản lý thành viên Dự án**
    * Người tạo dự án (hoặc Admin) có thể thêm hoặc bớt các thành viên (từ Workspace) vào dự án.
* **REQ-FUN-3.3: Cấu hình Bảng (Board)**
    * Mỗi dự án có một Bảng (Board) Kanban.
    * Quản lý dự án có thể **tạo, sửa tên, xóa, và sắp xếp lại thứ tự** các Cột (Column) trạng thái trên bảng (ví dụ: Todo, In Progress, Review, Done).

#### 3.4 Module 4: Quản lý Công việc (Task)
* **REQ-FUN-4.1: Tạo Task**
    * Người dùng có thể tạo Task mới trong một Cột bất kỳ của Dự án.
* **REQ-FUN-4.2: Thuộc tính Task**
    * Một Task khi tạo phải có ít nhất **Tiêu đề**.
    * Người dùng có thể mở chi tiết Task (Modal hoặc trang riêng) để thêm/sửa các thuộc tính:
        * Mô tả (hỗ trợ Rich Text Editor cơ bản: in đậm, nghiêng, gạch đầu dòng).
        * Người được gán (Assignee - chỉ 1 người).
        * Người báo cáo (Reporter - mặc định là người tạo Task).
        * Độ ưu tiên (Priority - ví dụ: Low, Medium, High).
        * Loại Task (Type - ví dụ: Bug, Feature, Task).
        * Ngày hết hạn (Due Date).
* **REQ-FUN-4.3: Cập nhật Task**
    * Người dùng có thể chỉnh sửa tất cả các thuộc tính của Task.
    * Người dùng có thể xóa Task (cần có xác nhận).
* **REQ-FUN-4.4: Bình luận (Comments)**
    * Người dùng có thể viết bình luận, tag (@mention) thành viên khác trong Task.
* **REQ-FUN-4.5: Đính kèm (Attachments)**
    * Người dùng có thể tải lên và đính kèm file (hình ảnh, tài liệu) vào Task.

#### 3.5 Module 5: Bảng làm việc (Kanban Board)
* **REQ-FUN-5.1: Hiển thị Bảng**
    * Hệ thống phải hiển thị tất cả Task của dự án dưới dạng các thẻ (Card) trên các Cột (Column) tương ứng với trạng thái của Task.
* **REQ-FUN-5.2: Kéo-thả (Drag & Drop)**
    * Người dùng có thể kéo một Task từ Cột này sang Cột khác để cập nhật trạng thái.
    * Hệ thống phải cập nhật trạng thái của Task trong CSDL.
* **REQ-FUN-5.3: Bộ lọc (Filter)**
    * Người dùng có thể lọc Task trên Bảng theo: Người được gán (Assignee), Độ ưu tiên (Priority).

#### 3.6 Module 6: Thông báo (Notifications)
* **REQ-FUN-6.1: Thông báo trong ứng dụng (In-app)**
    * Hệ thống phải hiển thị một biểu tượng chuông thông báo.
    * Gửi thông báo khi người dùng:
        * Được gán một Task mới.
        * Được nhắc đến (@mention) trong một bình luận.
        * Task họ tạo/được gán có bình luận mới.
* **REQ-FUN-6.2: Đánh dấu đã đọc**
    * Người dùng có thể đánh dấu thông báo là đã đọc.

---

### 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

Đây là phần mô tả *cách thức* hệ thống hoạt động (chất lượng, hiệu suất).

* **REQ-NON-1 (Hiệu năng):**
    * Thời gian tải trang lần đầu (Dashboard/Bảng) không quá 3 giây.
    * Thao tác kéo-thả Task phải có phản hồi ngay lập tức (dưới 200ms).
* **REQ-NON-2 (Bảo mật):**
    * Tất cả mật khẩu phải được **hash** (ví dụ: bcrypt) trước khi lưu vào CSDL.
    * Hệ thống phải sử dụng **HTTPS**.
    * Phải có cơ chế phân quyền rõ ràng: Người dùng không thể xem dữ liệu của Workspace/Project mà họ không phải là thành viên.
* **REQ-NON-3 (Khả dụng - Usability):**
    * Giao diện phải thân thiện, dễ sử dụng cho người không rành kỹ thuật.
    * Hệ thống phải **responsive**, hoạt động tốt trên các trình duyệt phổ biến (Chrome, Firefox, Safari) và có thể xem được (readable) trên thiết bị di động.
* **REQ-NON-4 (Độ tin cậy):**
    * Hệ thống phải đảm bảo không làm mất dữ liệu của người dùng (Task, Comment) khi có lỗi xảy ra.

---

### 5. Yêu cầu Giao diện (Interface Requirements)

* **REQ-UI-1:** Hệ thống phải tuân theo một bộ quy tắc thiết kế (Design System) nhất quán về màu sắc, font chữ, và các thành phần (Buttons, Modals, Inputs).
* **REQ-UI-2:** (Tùy chọn) Hỗ trợ chế độ Sáng/Tối (Light/Dark Mode) để tăng trải nghiệm người dùng.

---





---

