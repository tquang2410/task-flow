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

## ⚡️ Phương pháp tối ưu (Performance Optimizations)

Để giải quyết vấn đề tốc độ tải trang chậm, dự án đã áp dụng các kỹ thuật tối ưu hiệu năng hiện đại của Next.js:

### 1. Phản hồi giao diện tức thì (Instant UI Feedback)
- **Route-level Loading Skeletons:** Sử dụng file `loading.tsx` cho các route chính (`/app`, `/app/workspace/[id]`, `/app/project/[id]`). Next.js tự động hiển thị một giao diện khung (skeleton) ngay lập tức trong khi dữ liệu của trang đang được tải ở server. Điều này loại bỏ màn hình trắng và cải thiện trải nghiệm người dùng.

### 2. Streaming với React Suspense
- **Tách biệt Data Fetching:** Trang chi tiết Project (`/app/project/[id]`) đã được refactor. Thay vì đợi toàn bộ dữ liệu (tasks, comments,...) tải xong mới hiển thị, trang giờ đây chỉ fetch dữ liệu nhẹ (tên dự án, mô tả) để render phần "vỏ" giao diện (page shell).
- **Tải bất đồng bộ:** Dữ liệu nặng của bảng Kanban được chuyển vào một Server Component riêng (`<ProjectBoard />`). Component này được bọc trong thẻ `<Suspense>`, cho phép nó tải dữ liệu một cách độc lập.
- **Kết quả:** Người dùng thấy layout chính của trang ngay lập tức, trong khi bảng Kanban (phần tốn thời gian nhất) hiển thị một skeleton và "stream" nội dung vào ngay khi sẵn sàng. Kỹ thuật này giúp tránh việc render bị chặn (render-blocking) bởi các truy vấn CSDL chậm.

### 3. Fetch dữ liệu song song (Parallel Data Fetching)
- **Sử dụng `Promise.all`:** Ở những nơi cần lấy nhiều nguồn dữ liệu độc lập (ví dụ: thông tin user và thông tin project), code đã được tối ưu để sử dụng `Promise.all`. Điều này cho phép các truy vấn được gửi đi song song thay vì tuần tự (waterfall), giúp giảm tổng thời gian chờ dữ liệu.

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