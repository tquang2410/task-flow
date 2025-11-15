# 📄 PRD: Epic 1 - Nền tảng & Xác thực

**Tác giả:** (Team Leader)
**Ngày tạo:** 15/11/2025
**Trạng thái:** Đã chốt (Committed)

---

## 1. Giới thiệu & Mục tiêu (Introduction & Objective)

**Mục tiêu:** Đặt nền móng kỹ thuật cho dự án và xây dựng luồng xác thực người dùng cơ bản. Đây là cổng vào của toàn bộ ứng dụng.

**Tại sao (Why):**
* **Bảo mật:** Không có xác thực, chúng ta không thể bảo vệ dữ liệu của người dùng.
* **Cá nhân hóa:** Không có tài khoản, chúng ta không thể cung cấp một trải nghiệm riêng biệt (Workspace, Project, Task) cho từng người dùng.
* **Nền tảng:** Phải thiết lập CSDL và các thư viện UI (Tailwind, Shadcn) trước khi xây dựng bất kỳ tính năng nào.
* **Liên kết dữ liệu:** Phải có cơ chế liên kết tài khoản (Supabase Auth) với CSDL nghiệp vụ (MongoDB/Prisma) để gán Task, viết Comment.

---

## 2. Đối tượng người dùng (Audience)

* **Người dùng mới (New User):** Bất kỳ ai lần đầu tiên truy cập ứng dụng và muốn tạo tài khoản.
* **Người dùng hiện tại (Returning User):** Người dùng đã có tài khoản và muốn truy cập lại hệ thống.

---

## 3. Câu chuyện Người dùng (User Stories)

| Mã | Vai trò | Mong muốn | Kết quả (Mục đích) |
| :--- | :--- | :--- | :--- |
| **US-1.1** | Người dùng mới | Tôi muốn **đăng ký** tài khoản bằng email và mật khẩu | Để tôi có thể bắt đầu sử dụng dịch vụ. |
| **US-1.2** | Người dùng hiện tại | Tôi muốn **đăng nhập** một cách an toàn | Để tôi có thể truy cập vào các workspace và dự án của mình. |
| **US-1.3** | Người dùng hiện tại | Tôi muốn **đăng xuất** khỏi tài khoản | Để bảo vệ thông tin của tôi, đặc biệt là trên thiết bị dùng chung. |
| **US-1.4** | Người dùng hiện tại | Tôi muốn sử dụng tính năng **"Quên mật khẩu"** | Để tôi có thể khôi phục quyền truy cập khi tôi không nhớ mật khẩu. |
| **US-1.5** | (Hệ thống) | Là hệ thống, tôi cần **đồng bộ** thông tin user (từ Supabase) vào CSDL MongoDB | Để tôi có thể sử dụng ID của user đó cho các mối quan hệ nghiệp vụ (gán task, quản lý workspace...). |
| **US-1.6** | (Hệ thống) | Là hệ thống, tôi cần **bảo vệ** các trang "cá nhân" (ví dụ: `/app`) | Để chỉ những người dùng đã đăng nhập mới có thể truy cập. |

---

## 4. Yêu cầu Chức năng (Functional Requirements)

Đây là các tính năng "WHAT" chúng ta phải xây dựng.

#### FR-1.1: Thiết lập Nền tảng (Project Setup)
* Hệ thống phải được cài đặt và cấu hình **Tailwind CSS**.
* Hệ thống phải được khởi tạo (init) **Shadcn/ui** để sử dụng các component.
* Hệ thống phải có thư mục `lib` chứa các file dùng chung (ví dụ: `db.ts` để khởi tạo PrismaClient, `schemas.ts` cho Zod).

#### FR-1.2: Luồng Đăng ký (Sign Up Flow)
* Phải có trang `/register` (public).
* Trang phải có form với các trường:
    * Email
    * Mật khẩu (Password)
    * Xác nhận Mật khẩu (Confirm Password)
* Form phải có validate (bằng Zod):
    * Email phải đúng định dạng.
    * Mật khẩu phải đủ mạnh (ví dụ: ít nhất 8 ký tự).
    * Mật khẩu xác nhận phải trùng khớp.
* Khi submit, hệ thống gọi **Supabase Auth** để tạo user.
* Sau khi đăng ký thành công, tự động chuyển hướng người dùng đến trang "Onboarding" (sẽ làm ở Epic 2) hoặc trang `/app`.

#### FR-1.3: Luồng Đăng nhập (Sign In Flow)
* Phải có trang `/login` (public).
* Form phải có các trường:
    * Email
    * Mật khẩu
* Phải có link "Quên mật khẩu?" trỏ đến trang `/forgot-password`.
* Khi submit, hệ thống gọi **Supabase Auth** để xác thực.
* Nếu thành công, chuyển hướng người dùng đến trang Dashboard (`/app`).
* Nếu thất bại (sai email/mật khẩu), phải hiển thị thông báo lỗi rõ ràng.

#### FR-1.4: Luồng Quên Mật khẩu (Forgot Password Flow)
* Phải có trang `/forgot-password` (public) để người dùng nhập email.
* Hệ thống (Supabase Auth) phải gửi email chứa link reset mật khẩu.
* Phải có trang `/reset-password` (public) để người dùng nhập mật khẩu mới.

#### FR-1.5: Luồng Đăng xuất (Sign Out Flow)
* Phải có nút/link "Đăng xuất" (thường nằm ở Header hoặc User Menu).
* Khi click, hệ thống gọi **Supabase Auth** để xóa session.
* Tự động chuyển hướng người dùng về trang `/login`.

#### FR-1.6: Bảo vệ Trang (Route Protection)
* Tất cả các trang có tiền tố `/app/*` (ví dụ: `/app/dashboard`, `/app/project/abc`) là trang "private".
* Phải sử dụng **Middleware** (`middleware.ts`) của Next.js để kiểm tra session của Supabase.
* Nếu người dùng chưa đăng nhập và cố gắng truy cập trang private, hệ thống phải tự động chuyển hướng họ về `/login`.

#### FR-1.7: Đồng bộ Người dùng (User Sync) - Backend
* Đây là yêu cầu **kỹ thuật bắt buộc** và **quan trọng nhất** của Epic này.
* Phải có một cơ chế (Trigger của Supabase hoặc Server Action `syncUser`) chạy **sau khi** Supabase tạo user thành công.
* **Logic `syncUser`:**
    1.  Nhận đầu vào: `supabaseId` (UUID từ Supabase), `email`.
    2.  Dùng `prisma.user.findUnique` để tìm user trong MongoDB bằng `supabaseId`.
    3.  **Nếu không tìm thấy:** Tạo một `User` mới trong MongoDB, lưu `supabaseId` và `email`.
    4.  **Nếu tìm thấy:** (Trường hợp hiếm) Bỏ qua hoặc cập nhật email nếu cần.
* *Lý do:* `supabaseId` này là "chìa khóa" để liên kết với `Task`, `Comment`, `Workspace` trong `schema.prisma`.

---

## 5. Những thứ KHÔNG làm (Out of Scope)

Để đảm bảo tốc độ cho MVP, chúng ta sẽ **KHÔNG** làm các tính năng sau trong Epic 1:

* Đăng nhập/Đăng ký bằng **Google, Github, Facebook**.
* Xác thực hai yếu tố (2FA).
* Gửi email "Chào mừng" (Welcome Email) sau khi đăng ký.
* Phân quyền (Roles) chi tiết (sẽ làm ở Epic 2).

---

## 6. Tiêu chí Hoàn thành & Thành công (Success Metrics)

Chúng ta coi Epic 1 là thành công khi:

* **100%** người dùng đăng ký qua Supabase được đồng bộ (`syncUser`) vào CSDL MongoDB.
* Người dùng có thể hoàn thành luồng Đăng ký -> Đăng nhập -> Truy cập trang `/app` -> Đăng xuất mà không gặp lỗi.
* Người dùng **không thể** truy cập `/app` khi chưa đăng nhập (bị redirect về `/login`).
* Tỷ lệ người dùng hoàn tất đăng ký (từ trang `/register`) > 90%.