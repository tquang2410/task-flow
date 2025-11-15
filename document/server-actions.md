# 📄 Đặc tả Server Actions (TaskFlow)

Tài liệu này định nghĩa "hợp đồng" (contract) cho tất cả các Server Actions của dự án. Chúng ta sử dụng **Zod** để xác thực (validate) toàn bộ dữ liệu đầu vào.

## 1.  conventions Quy ước Chung

Để đảm bảo tính nhất quán và dễ dàng xử lý lỗi trên client, tất cả các Server Action **PHẢI** trả về một đối tượng có cấu trúc sau:

```typescript
type ActionResponse<T> = {
  status: 'success',
  data: T
} | {
  status: 'error',
  message: string,
  fieldErrors?: Record<string, string> // Lỗi cụ thể cho từng trường (từ Zod)
}