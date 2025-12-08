# TaskFlow - Modern Project Management

TaskFlow là ứng dụng quản lý dự án hiện đại, tối giản, được xây dựng với công nghệ mới nhất để đảm bảo hiệu năng và trải nghiệm người dùng mượt mà.

![TaskFlow Screenshot](./public/SampleUI.jpeg)

## 🚀 Tính năng Nổi bật (Features)

### 1. Quản lý Dự án (Project Management)
* **Workspaces:** Tạo không gian làm việc riêng biệt cho từng tổ chức/team.
* **Projects:** Quản lý nhiều dự án trong một workspace.
* **Views:**
    * **Kanban Board:** Giao diện thẻ kéo thả trực quan (Drag & Drop).
    * **List View:** Giao diện bảng (Table) để quản lý chi tiết.

### 2. Quản lý Task (Task Management)
* **CRUD:** Tạo, Sửa, Xóa task nhanh chóng.
* **Rich Details:**
    * **Assignee:** Giao việc cho thành viên (có Avatar hiển thị).
    * **Priority:** Đặt độ ưu tiên (Low, Medium, High).
    * **Due Date:** Hạn chót.
* **Collaboration:**
    * **Comments:** Bình luận trao đổi trực tiếp trên task.
    * **Attachments:** Đính kèm file (ảnh, tài liệu).

### 3. Trải nghiệm Nâng cao (Advanced UX)
* **Real-time Collaboration:** Đồng bộ dữ liệu tức thì giữa các thành viên (kéo thả, tạo task) mà không cần F5.
* **Optimistic UI:** Phản hồi giao diện ngay lập tức khi thao tác.
* **Search & Filter:** Tìm kiếm task và lọc theo thành viên ngay trên bảng.
* **Dark Mode:** Giao diện tối hiện đại, dịu mắt.
* **Responsive:** Tương thích tốt trên Desktop và Tablet.

## 🛠️ Công nghệ Sử dụng (Tech Stack)

* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database:** [MongoDB](https://www.mongodb.com/) (qua Prisma ORM)
* **Auth & Storage:** [Supabase](https://supabase.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
* **Drag & Drop:** [dnd-kit](https://dndkit.com/)
* **Table:** [TanStack Table](https://tanstack.com/table/v8)

## 📦 Cài đặt & Chạy dự án (Installation)

1.  **Clone repo:**
    ```bash
    git clone [https://github.com/tquang2410/task-flow.git](https://github.com/tquang2410/task-flow.git)
    cd task-flow
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình môi trường (.env):**
    Copy file `.env.example` thành `.env` và điền thông tin Supabase/MongoDB.
    ```bash
    DATABASE_URL="mongodb+srv://..."
    NEXT_PUBLIC_SUPABASE_URL="https://..."
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
    ```

4.  **Chạy Prisma Generate:**
    ```bash
    npx prisma generate
    ```

5.  **Chạy server development:**
    ```bash
    npm run dev
    ```
    Truy cập: `http://localhost:3000`

## 🤝 Đóng góp (Contribution)

Dự án được phát triển bởi **[Tên Bạn]** và Team.
Mọi đóng góp (Pull Request) đều được hoan nghênh!