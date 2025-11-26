# 🚀 TaskFlow

Một ứng dụng quản lý công việc và dự án hiện đại, được xây dựng bằng Next.js, Prisma, và MongoDB. Lấy cảm hứng từ các công cụ như Jira và Trello.

TaskFlow là một nền tảng quản lý tác vụ (task management) giúp các đội nhóm tổ chức, phân công và theo dõi tiến độ công việc một cách trực quan thông qua giao diện bảng Kanban.

## 📸 Hình ảnh xem trước (Preview)

![Giao diện mẫu](public/SampleUI.jpeg)

---

## 💻 Công nghệ sử dụng (Tech Stack)

Đây là các công nghệ cốt lõi được sử dụng trong dự án:

* **Frontend:** **Next.js 15** (sử dụng App Router & React 19)
* **Backend & API:** **Next.js Server Actions**
* **Styling:** **Tailwind CSS**
* **UI Components:** **Shadcn/ui**
* **Database:** **MongoDB**
* **ORM:** **Prisma**
* **Authentication:** **Supabase Auth**
* **Form Management:** React Hook Form
* **Schema Validation:** Zod
* **Drag & Drop:** dnd-kit

---

## 🚀 Bắt đầu (Getting Started)

Làm theo các bước sau để thiết lập và chạy dự án trên máy local của bạn.

### 1. Yêu cầu cài đặt

Bạn cần có [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên) và [npm](https://www.npmjs.com/) (hoặc `pnpm`/`yarn`) được cài đặt trên máy.

### 2. Cài đặt

1.  **Clone repository:**
    ```bash
    git clone [https://github.com/your-username/task-flow.git](https://github.com/your-username/task-flow.git)
    cd task-flow
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Thiết lập biến môi trường (.env):**

    Tạo một file mới tên là `.env` ở thư mục gốc của dự án và sao chép nội dung bên dưới.

    ```sh
    # ----------------------------------
    # DATABASE (PRISMA + MONGODB)
    # ----------------------------------
    # Lấy chuỗi kết nối từ tài khoản MongoDB Atlas hoặc local MongoDB của bạn
    # Ví dụ: "mongodb+srv://user:password@cluster.mongodb.net/taskflow?..."
    DATABASE_URL="YOUR_MONGODB_CONNECTION_STRING"

    # ----------------------------------
    # AUTHENTICATION (SUPABASE)
    # ----------------------------------
    # Lấy từ phần Project Settings > API trong dashboard Supabase
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

4.  **Chạy Prisma:**

    Sau khi thiết lập `DATABASE_URL`, hãy chạy các lệnh sau để đồng bộ schema của bạn với CSDL MongoDB và tạo Prisma Client:

    ```bash
    # Tạo Prisma Client (dựa trên file schema.prisma)
    npx prisma generate
    
    # Đẩy (push) schema của bạn lên MongoDB.
    # (Lưu ý: Prisma dùng `db push` cho MongoDB thay vì `migrate`)
    npx prisma db push
    ```

5.  **Chạy ứng dụng (Development):**
    ```bash
    npm run dev
    ```

    Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt của bạn để xem ứng dụng.

---

## ✨ Các tính năng (Features)

Dưới đây là danh sách các tính năng chính đã được triển khai và hoạt động ổn định:

### 1. Xác thực & Phân quyền (Authentication & Authorization)
- **Tài khoản:** Hỗ trợ Đăng ký, Đăng nhập, và Đăng xuất thông qua **Supabase Auth**.
- **Bảo vệ Route:** Các trang trong khu vực `/app` được bảo vệ, tự động điều hướng người dùng chưa đăng nhập về trang login.
- **Đồng bộ User:** Tự động đồng bộ thông tin người dùng từ Supabase sang CSDL MongoDB của ứng dụng để quản lý quan hệ dữ liệu.

### 2. Quản lý Workspace (Workspace Management)
- **Onboarding:** Cung cấp luồng tạo Workspace đầu tiên cho người dùng mới.
- **Dashboard:** Giao diện chính hiển thị danh sách các Workspace mà người dùng là thành viên.
- **Quản lý Thành viên:** Cho phép mời, xem danh sách và xóa thành viên khỏi một Workspace.

### 3. Quản lý Dự án (Project Management)
- **Tạo Dự án:** Cho phép người dùng tạo các dự án mới bên trong một Workspace.
- **Liệt kê Dự án:** Hiển thị danh sách các dự án thuộc về Workspace đó.

### 4. Bảng Kanban & Quản lý Task (Kanban Board & Task Management)
- **Bảng Kanban Tương tác:** Giao diện kéo-thả (Drag & Drop) để di chuyển công việc (task) qua lại giữa các cột.
- **Quản lý Cột động:** Người dùng có thể toàn quyền **Tạo**, **Đổi tên**, và **Xóa** các cột trạng thái để tùy chỉnh quy trình làm việc.
- **Quản lý Task Toàn diện:**
    - Tạo, xem chi tiết, và chỉnh sửa thông tin của một task.
    - Hỗ trợ viết **Bình luận (Comments)** để trao đổi.
    - Hỗ trợ tải lên và xóa **File đính kèm (Attachments)**.