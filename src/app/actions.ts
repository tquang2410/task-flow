'use server'

import { z } from 'zod'
import { createClient } from '@/src/lib/supabase/server'
import { CreateWorkspaceSchema } from '@/lib/schemas'
import { prisma } from '@/src/lib/db'
import { revalidatePath } from 'next/cache'

// Định nghĩa kiểu trả về chung cho Server Action
// Dựa trên tài liệu `document/server-actions.md`
type ActionResponse<T> = {
  status: 'success'
  data: T
} | {
  status: 'error'
  message: string
  fieldErrors?: Record<string, string>
}

// Kiểu dữ liệu đầu vào cho `createWorkspace`
type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>

/**
 * Server Action để tạo một Workspace mới.
 *
 * @param input - Dữ liệu đầu vào, phải khớp với `CreateWorkspaceSchema`.
 * @returns Một đối tượng `ActionResponse` chứa workspace đã tạo hoặc thông tin lỗi.
 */
export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<ActionResponse<Awaited<ReturnType<typeof prisma.workspace.create>>>> {
  // 1. **Authentication**: Lấy thông tin người dùng từ Supabase
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 'error',
      message: 'Xác thực thất bại: Người dùng chưa đăng nhập.',
    }
  }

  // 2. **Validation**: Kiểm tra dữ liệu đầu vào với Zod schema
  const validationResult = CreateWorkspaceSchema.safeParse(input)
  if (!validationResult.success) {
    // Nếu validation thất bại, trích xuất lỗi cho từng trường
    const fieldErrors: Record<string, string> = {}
    validationResult.error.errors.forEach((err) => {
      if (err.path[0]) {
        fieldErrors[err.path[0]] = err.message
      }
    })
    return {
      status: 'error',
      message: 'Dữ liệu không hợp lệ.',
      fieldErrors,
    }
  }

  const { name } = validationResult.data
  const { id: supabaseId } = user

  try {
    // 3. **Database Logic**:
    // Tìm user trong CSDL MongoDB bằng `supabaseId` để lấy `id` nội bộ (ObjectId)
    const appUser = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true }, // Chỉ cần lấy `id` để thực hiện `connect`
    })

    if (!appUser) {
      return {
        status: 'error',
        message: 'Người dùng không tồn tại trong hệ thống.',
      }
    }

    // Tạo Workspace mới và tự động thêm User hiện tại vào danh sách `members`
    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        // Sử dụng `connect` của Prisma để thiết lập quan hệ many-to-many
        members: {
          connect: {
            id: appUser.id,
          },
        },
      },
    })

    // 4. **Revalidation**: Cập nhật lại cache của Next.js cho trang chủ
    revalidatePath('/') // Giả sử trang chủ hiển thị danh sách workspaces

    // 5. **Response**: Trả về kết quả thành công
    return {
      status: 'success',
      data: newWorkspace,
    }
  } catch (error) {
    console.error('Lỗi khi tạo workspace:', error)
    return {
      status: 'error',
      message: 'Đã xảy ra lỗi không mong muốn từ máy chủ.',
    }
  }
}
