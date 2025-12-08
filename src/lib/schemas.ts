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

// Schema cho việc cập nhật một Project
export const UpdateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(3, { message: "Tên dự án phải có ít nhất 3 ký tự." }).max(100).optional(),
  description: z.string().max(500, { message: "Mô tả không được quá 500 ký tự." }).optional().nullable(),
});

// Schema cho việc tạo một Task mới
// Dùng trong action `createTask` (Epic 3)
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tiêu đề không được để trống." }),

  projectId: z.string(),
  columnId: z.string(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

// Schema cho việc cập nhật một Task
export const UpdateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Title cannot be empty." }).optional(),
  description: z.string().optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string().nullable().optional(), // New: Allow assigning a user or unassigning
});

// Schema for the refactored moveTask action
export const MoveTaskSchema = z.object({
  taskId: z.string(),
  newColumnId: z.string(),
  newIndex: z.number(),
  projectId: z.string(),
});

// Schema cho việc tạo một Comment
export const CreateCommentSchema = z.object({
  taskId: z.string(),
  text: z.string().min(1, { message: "Comment cannot be empty." }),
});

// Schema cho việc xóa một Comment
export const DeleteCommentSchema = z.object({
  commentId: z.string(),
});

// Schema cho việc upload một Attachment
export const UploadAttachmentSchema = z.object({
  taskId: z.string(),
  formData: z.instanceof(FormData),
});

// Schema cho việc xóa một Attachment
export const DeleteAttachmentSchema = z.object({
  attachmentId: z.string(),
  path: z.string(), // Path in Supabase storage
});

// Schema for creating an attachment record in the DB after direct upload
export const CreateAttachmentRecordSchema = z.object({
  taskId: z.string(),
  name: z.string(),
  path: z.string(),
});

// Schema for getting a signed URL
export const GetSignedUrlSchema = z.object({
  taskId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});


// --- Column Management Schemas (Epic 3) ---

// Schema cho việc tạo một cột (Column) mới
export const CreateColumnSchema = z.object({
  projectId: z.string(),
  title: z
    .string()
    .min(1, { message: "Column title cannot be empty." })
    .max(50, { message: "Column title cannot exceed 50 characters." }),
});

// Schema cho việc cập nhật tên một cột
export const UpdateColumnSchema = z.object({
  projectId: z.string(),
  columnId: z.string(),
  title: z
    .string()
    .min(1, { message: "Column title cannot be empty." })
    .max(50, { message: "Column title cannot exceed 50 characters." }),
});

// Schema cho việc xóa một cột
export const DeleteColumnSchema = z.object({
  projectId: z.string(),
  columnId: z.string(),
});

// --- Workspace Member Management ---
export const AddMemberSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email({ message: 'Invalid email address.' }),
});

export const RemoveMemberSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
});

// Schema for updating user profile
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  avatar: z.any()
    .optional()
    .refine((file) => {
      if (!file) return true; // No file, no validation needed
      if (file instanceof File) {
        return file.size <= 1024 * 1024; // 1MB limit
      }
      return true; // Not a file, or other unexpected value
    }, "Avatar image must be less than 1MB"),
});
