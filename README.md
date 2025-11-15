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

*(Dựa trên SRS của chúng ta)*

* ✅ **Xác thực người dùng:** Đăng ký, Đăng nhập (với Supabase).
* ✅ **Quản lý Workspace:** Tạo và mời thành viên vào không gian làm việc.
* ✅ **Quản lý Dự án (Project):** Tạo các dự án riêng biệt trong Workspace.
* ✅ **Bảng Kanban:** Giao diện kéo-thả (Drag & Drop) các công việc qua các cột trạng thái.
* ✅ **Quản lý Task:** Tạo, sửa, xóa Task với đầy đủ thông tin (Mô tả, Người gán, Độ ưu tiên, Ngày hết hạn).
* ✅ **Bình luận & Đính kèm:** Cộng tác trực tiếp trên từng Task.
* ... (và các tính năng khác)