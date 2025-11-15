# Phân Tích Luồng Dữ Liệu - `schema.prisma`

Tài liệu này phân tích cấu trúc và luồng dữ liệu của dự án dựa trên file `prisma/schema.prisma`. Mục tiêu là để mọi thành viên trong team có thể hiểu rõ về các models, các trường và mối quan hệ giữa chúng.

## Tổng Quan

-   **Cơ sở dữ liệu**: MongoDB.
-   **ORM**: Prisma.
-   **Xác thực**: Việc xác thực người dùng (đăng ký, đăng nhập) được xử lý bởi dịch vụ bên ngoài (Supabase). Model `User` trong schema này chỉ lưu trữ các thông tin bổ sung và được liên kết với user của Supabase qua trường `supabaseId`.

---

## Phân Tích Các Model

### 1. `User`

Lưu trữ thông tin hồ sơ của người dùng.

| Tên trường    | Kiểu dữ liệu | Chú thích                                                                                             |
| :------------ | :----------- | :---------------------------------------------------------------------------------------------------- |
| `id`          | `String`     | ID tự sinh của MongoDB (`ObjectId`), là khóa chính trong CSDL.                                        |
| `supabaseId`  | `String`     | ID của người dùng từ Supabase Auth. **Đây là khóa logic chính**, dùng để liên kết với các model khác. |
| `email`       | `String`     | Email của người dùng, là duy nhất.                                                                    |
| `name`        | `String?`    | Tên người dùng (tùy chọn).                                                                            |
| `avatarUrl`   | `String?`    | URL ảnh đại diện (tùy chọn).                                                                          |
| `workspaces`  | `Workspace[]`| **Quan hệ (N-N):** Danh sách các Workspace mà user là thành viên.                                      |
| `workspaceIds`| `String[]`   | Mảng ID của các `Workspace` mà user tham gia.                                                          |
| `assignedTasks`| `Task[]`     | **Quan hệ (1-N):** Danh sách các Task được giao cho user này.                                          |
| `reportedTasks`| `Task[]`     | **Quan hệ (1-N):** Danh sách các Task được tạo bởi user này.                                           |
| `comments`    | `Comment[]`  | **Quan hệ (1-N):** Danh sách các bình luận được viết bởi user này.                                     |
| `Attachment`  | `Attachment[]`| **Quan hệ (1-N):** Danh sách các file được đính kèm bởi user này.                                      |
| `createdAt`   | `DateTime`   | Thời gian tạo.                                                                                        |
| `updatedAt`   | `DateTime`   | Thời gian cập nhật lần cuối.                                                                          |

### 2. `Workspace`

Đại diện cho một không gian làm việc của một công ty hoặc tổ chức.

| Tên trường  | Kiểu dữ liệu | Chú thích                                                              |
| :---------- | :----------- | :--------------------------------------------------------------------- |
| `id`        | `String`     | ID tự sinh của MongoDB (`ObjectId`).                                   |
| `name`      | `String`     | Tên của Workspace.                                                     |
| `members`   | `User[]`     | **Quan hệ (N-N):** Danh sách các `User` là thành viên của Workspace này. |
| `memberIds` | `String[]`   | Mảng ID của các `User` trong Workspace.                                |
| `projects`  | `Project[]`  | **Quan hệ (1-N):** Danh sách các dự án thuộc Workspace này.             |
| `createdAt` | `DateTime`   | Thời gian tạo.                                                         |
| `updatedAt` | `DateTime`   | Thời gian cập nhật lần cuối.                                           |

### 3. `Project`

Đại diện cho một dự án cụ thể trong một `Workspace`.

| Tên trường    | Kiểu dữ liệu | Chú thích                                                                                             |
| :------------ | :----------- | :---------------------------------------------------------------------------------------------------- |
| `id`          | `String`     | ID tự sinh của MongoDB (`ObjectId`).                                                                  |
| `name`        | `String`     | Tên dự án.                                                                                            |
| `description` | `String?`    | Mô tả dự án (tùy chọn).                                                                               |
| `workspace`   | `Workspace`  | **Quan hệ (N-1):** Workspace mà dự án này thuộc về.                                                    |
| `workspaceId` | `String`     | ID của `Workspace` chứa dự án này.                                                                    |
| `tasks`       | `Task[]`     | **Quan hệ (1-N):** Danh sách các công việc trong dự án.                                                |
| `columns`     | `Json`       | Cấu hình các cột của bảng Kanban (ví dụ: `[{ "id": "col1", "title": "Todo" }]`).                       |
| `createdAt`   | `DateTime`   | Thời gian tạo.                                                                                        |
| `updatedAt`   | `DateTime`   | Thời gian cập nhật lần cuối.                                                                          |

### 4. `Task`

Model trung tâm, đại diện cho một công việc, một bug, hoặc một tính năng cần phát triển.

| Tên trường    | Kiểu dữ liệu | Chú thích                                                                                             |
| :------------ | :----------- | :---------------------------------------------------------------------------------------------------- |
| `id`          | `String`     | ID tự sinh của MongoDB (`ObjectId`).                                                                  |
| `title`       | `String`     | Tiêu đề công việc.                                                                                    |
| `description` | `String?`    | Mô tả chi tiết (tùy chọn).                                                                            |
| `order`       | `Int`        | Thứ tự của task trong một cột Kanban.                                                                 |
| `priority`    | `Priority`   | Độ ưu tiên của task (xem Enum `Priority`).                                                            |
| `type`        | `TaskType`   | Loại task (xem Enum `TaskType`).                                                                      |
| `dueDate`     | `DateTime?`  | Ngày hết hạn (tùy chọn).                                                                              |
| `columnId`    | `String`     | ID của cột Kanban mà task đang đứng.                                                                   |
| `project`     | `Project`    | **Quan hệ (N-1):** Dự án mà task này thuộc về.                                                         |
| `projectId`   | `String`     | ID của `Project`.                                                                                     |
| `assignee`    | `User?`      | **Quan hệ (N-1):** Người được giao task (tùy chọn). Liên kết qua `supabaseId`.                         |
| `assigneeId`  | `String?`    | `supabaseId` của người được giao.                                                                     |
| `reporter`    | `User`       | **Quan hệ (N-1):** Người tạo/báo cáo task. Liên kết qua `supabaseId`.                                  |
| `reporterId`  | `String`     | `supabaseId` của người tạo.                                                                           |
| `comments`    | `Comment[]`  | **Quan hệ (1-N):** Các bình luận trong task.                                                          |
| `attachments` | `Attachment[]`| **Quan hệ (1-N):** Các file đính kèm trong task.                                                      |
| `createdAt`   | `DateTime`   | Thời gian tạo.                                                                                        |
| `updatedAt`   | `DateTime`   | Thời gian cập nhật lần cuối.                                                                          |

### 5. `Comment`

Lưu một bình luận trong một `Task`.

| Tên trường | Kiểu dữ liệu | Chú thích                                                              |
| :--------- | :----------- | :--------------------------------------------------------------------- |
| `id`       | `String`     | ID tự sinh của MongoDB (`ObjectId`).                                   |
| `text`     | `String`     | Nội dung bình luận.                                                    |
| `task`     | `Task`       | **Quan hệ (N-1):** Task chứa bình luận này.                            |
| `taskId`   | `String`     | ID của `Task`.                                                         |
| `user`     | `User`       | **Quan hệ (N-1):** Người viết bình luận. Liên kết qua `supabaseId`.     |
| `userId`   | `String`     | `supabaseId` của người viết.                                           |
| `createdAt`| `DateTime`   | Thời gian tạo.                                                         |

### 6. `Attachment`

Lưu một file được đính kèm vào `Task`.

| Tên trường   | Kiểu dữ liệu | Chú thích                                                              |
| :----------- | :----------- | :--------------------------------------------------------------------- |
| `id`         | `String`     | ID tự sinh của MongoDB (`ObjectId`).                                   |
| `url`        | `String`     | URL của file (lưu trên S3, Vercel Blob...).                            |
| `name`       | `String`     | Tên gốc của file.                                                      |
| `task`       | `Task`       | **Quan hệ (N-1):** Task chứa file này.                                 |
| `taskId`     | `String`     | ID của `Task`.                                                         |
| `uploader`   | `User`       | **Quan hệ (N-1):** Người upload file. Liên kết qua `supabaseId`.        |
| `uploaderId` | `String`     | `supabaseId` của người upload.                                         |
| `createdAt`  | `DateTime`   | Thời gian tạo.                                                         |

---

## Enums (Các kiểu dữ liệu tùy chọn)

### `Priority`

Định nghĩa độ ưu tiên cho một `Task`.

-   `LOW`
-   `MEDIUM` (mặc định)
-   `HIGH`

### `TaskType`

Định nghĩa loại của một `Task`.

-   `TASK` (mặc định)
-   `BUG`
-   `FEATURE`
