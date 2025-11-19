'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema, CreateWorkspaceSchema } from '@/lib/schemas'
import { db } from '@/lib/db' // Đã import đúng là 'db'
import { revalidatePath } from 'next/cache'

// Định nghĩa kiểu trả về chung cho Server Action
type ActionResponse<T> = {
  status: 'success'
  data: T
} | {
  status: 'error'
  message: string
  fieldErrors?: Record<string, string>
}

// --- Epic 2: Workspace Management ---

// Kiểu dữ liệu đầu vào cho `createWorkspace`
type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>

/**
 * Server Action để tạo một Workspace mới.
 */
export async function createWorkspace(
    input: CreateWorkspaceInput,
): Promise<ActionResponse<Awaited<ReturnType<typeof db.workspace.create>>>> { // Sửa prisma -> db
                                                                              // 1. **Authentication**: Lấy thông tin người dùng từ Supabase
  const supabase = await createClient() // createClient là hàm async
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
    const appUser = await db.user.findUnique({ // Sửa prisma -> db
      where: { supabaseId },
      select: { id: true },
    })

    if (!appUser) {
      return {
        status: 'error',
        message: 'Người dùng không tồn tại trong hệ thống.',
      }
    }

    // Tạo Workspace mới và tự động thêm User hiện tại vào danh sách `members`
    const newWorkspace = await db.workspace.create({ // Sửa prisma -> db
      data: {
        name,
        members: {
          connect: {
            id: appUser.id,
          },
        },
      },
    })

    // 4. **Revalidation**: Cập nhật lại cache
    revalidatePath('/')

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

// --- Epic 2: Project Management ---

type CreateProjectInput = z.infer<typeof CreateProjectSchema>

/**
 * Server Action để tạo một Project mới.
 */
export async function createProject(
    input: CreateProjectInput,
): Promise<ActionResponse<Awaited<ReturnType<typeof db.project.create>>>> { // Sửa prisma -> db
                                                                            // 1. **Authentication**
  const supabase = await createClient() // createClient là hàm async
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Xác thực thất bại: Người dùng chưa đăng nhập.' }
  }

  // 2. **Validation**
  const validationResult = CreateProjectSchema.safeParse(input)
  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {}
    validationResult.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[err.path[0]] = err.message
    })
    return { status: 'error', message: 'Dữ liệu không hợp lệ.', fieldErrors }
  }

  const { name, workspaceId } = validationResult.data

  try {
    // 3. **Authorization**: Kiểm tra user có phải là thành viên của workspace không
    const appUser = await db.user.findUnique({ // Sửa prisma -> db
      where: { supabaseId: user.id },
      select: { id: true },
    })

    if (!appUser) {
      return { status: 'error', message: 'Người dùng không tồn tại trong hệ thống.' }
    }

    const workspace = await db.workspace.findUnique({ // Sửa prisma -> db
      where: { id: workspaceId },
      select: { memberIds: true },
    })

    // Kiểm tra quyền thành viên
    if (!workspace || !workspace.memberIds.includes(appUser.id)) {
      return { status: 'error', message: 'Không có quyền: Bạn không phải là thành viên của workspace này.' }
    }

    // 4. **Database Logic**: Tạo project mới với cột mặc định
    const defaultColumns = [
      { id: 'column-1', title: 'To Do' },
      { id: 'column-2', title: 'In Progress' },
      { id: 'column-3', title: 'Done' },
    ]

    const newProject = await db.project.create({ // Sửa prisma -> db
      data: {
        name,
        workspaceId,
        columns: defaultColumns, // Lưu dưới dạng Json
      },
    })

    // 5. **Revalidation**
    revalidatePath(`/app/workspace/${workspaceId}`)

    // 6. **Response**
    return {
      status: 'success',
      data: newProject,
    }
  } catch (error) {
    console.error('Lỗi khi tạo project:', error)
    return {
      status: 'error',
      message: 'Đã xảy ra lỗi không mong muốn từ máy chủ.',
    }
  }
}