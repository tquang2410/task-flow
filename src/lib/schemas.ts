// @file: lib/schemas.ts

import { z } from 'zod'; // Import thư viện Zod
import { Priority } from '@prisma/client';

/**
 * Định nghĩa các quy tắc (schema) để xác thực
 * dữ liệu đầu vào (input) cho Server Actions.
 */

// Schema cho việc tạo một Workspace mới
// Dùng trong action `createWorkspace` (Epic 2)
export const CreateWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Tên workspace phải có ít nhất 3 ký tự." })
        .max(100, { message: "Tên workspace không được quá 100 ký tự." }),
});

// Schema cho việc tạo một Project mới
// Dùng trong action `createProject` (Epic 2)
export const CreateProjectSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Tên dự án phải có ít nhất 3 ký tự." })
        .max(100, { message: "Tên dự án không được quá 100 ký tự." }),

    // Chúng ta cần workspaceId để biết tạo project này cho workspace nào
    workspaceId: z.string({
        required_error: "Workspace ID là bắt buộc.",
    }),
});

// Schema cho việc tạo một Task mới
// Dùng trong action `createTask` (Epic 3)
export const CreateTaskSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Tiêu đề không được để trống." }),

    projectId: z.string(),
    columnId: z.string(),
});

// Schema cho việc cập nhật một Task
export const UpdateTaskSchema = z.object({
    id: z.string(),
    title: z.string().min(1, { message: "Title cannot be empty." }).optional(),
    description: z.string().optional().nullable(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.date().optional().nullable(),
});

// (Chúng ta sẽ thêm các schema khác như CreateComment... vào đây sau)