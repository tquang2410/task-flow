'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema, CreateTaskSchema, CreateWorkspaceSchema, UpdateTaskSchema } from '@/lib/schemas'
import { db } from '@/lib/db'
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
): Promise<ActionResponse<Awaited<ReturnType<typeof db.workspace.create>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 'error',
      message: 'Xác thực thất bại: Người dùng chưa đăng nhập.',
    }
  }

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
    const appUser = await db.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    })

    if (!appUser) {
      return {
        status: 'error',
        message: 'Người dùng không tồn tại trong hệ thống.',
      }
    }

    const newWorkspace = await db.workspace.create({
      data: {
        name,
        members: {
          connect: {
            id: appUser.id,
          },
        },
      },
    })

    revalidatePath('/')

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
): Promise<ActionResponse<Awaited<ReturnType<typeof db.project.create>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Xác thực thất bại: Người dùng chưa đăng nhập.' }
  }

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
    const appUser = await db.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true },
    })

    if (!appUser) {
      return { status: 'error', message: 'Người dùng không tồn tại trong hệ thống.' }
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { memberIds: true },
    })

    if (!workspace || !workspace.memberIds.includes(appUser.id)) {
      return { status: 'error', message: 'Không có quyền: Bạn không phải là thành viên của workspace này.' }
    }

    const defaultColumns = [
      { id: 'column-1', title: 'To Do' },
      { id: 'column-2', title: 'In Progress' },
      { id: 'column-3', title: 'Done' },
    ]

    const newProject = await db.project.create({
      data: {
        name,
        workspaceId,
        columns: defaultColumns,
      },
    })

    revalidatePath(`/app/workspace/${workspaceId}`)

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

// --- Epic 3: Task Management ---

type CreateTaskInput = z.infer<typeof CreateTaskSchema>

export async function createTask(
  input: CreateTaskInput
): Promise<ActionResponse<Awaited<ReturnType<typeof db.task.create>>>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Unauthorized" };
  }
  
  const validationResult = CreateTaskSchema.safeParse(input);
  if (!validationResult.success) {
    return { status: "error", message: "Invalid data" };
  }

  const { title, projectId, columnId } = validationResult.data;

  try {
    const maxOrderTask = await db.task.findFirst({
      where: {
        projectId,
        columnId,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const newOrder = (maxOrderTask?.order ?? -1) + 1;

    const newTask = await db.task.create({
      data: {
        title,
        projectId,
        columnId,
        order: newOrder,
        reporterId: user.id, // Associate the task with the creator
      },
    });

    revalidatePath(`/app/project/${projectId}`);

    return {
      status: 'success',
      data: newTask,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      status: 'error',
      message: 'Failed to create task.',
    };
  }
}

const MoveTaskSchema = z.object({
  taskId: z.string(),
  newColumnId: z.string(),
  newOrder: z.number().min(0),
  projectId: z.string(),
});

type MoveTaskInput = z.infer<typeof MoveTaskSchema>

export async function moveTask(
  input: MoveTaskInput
): Promise<ActionResponse<Awaited<ReturnType<typeof db.task.update>>>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { status: "error", message: "Unauthorized" };
    }

    const validationResult = MoveTaskSchema.safeParse(input);
    if (!validationResult.success) {
        return { status: "error", message: "Invalid data" };
    }

    const { taskId, newColumnId, newOrder, projectId } = validationResult.data;

    try {
        const updatedTask = await db.task.update({
            where: {
                id: taskId,
            },
            data: {
                columnId: newColumnId,
                order: newOrder,
            },
        });

        revalidatePath(`/app/project/${projectId}`);

        return {
            status: 'success',
            data: updatedTask,
        };
    } catch (error) {
        console.error("Error moving task:", error);
        return {
            status: 'error',
            message: 'Failed to move task.',
        };
    }
}

type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>

export async function updateTask(
  input: UpdateTaskInput
): Promise<ActionResponse<Awaited<ReturnType<typeof db.task.update>>>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'error', message: 'Unauthorized' };
  }

  const validationResult = UpdateTaskSchema.safeParse(input);
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' };
  }
  
  const { id, ...dataToUpdate } = validationResult.data;

  try {
    const task = await db.task.findUnique({
      where: { id },
      select: { projectId: true }
    });

    if (!task) {
      return { status: 'error', message: 'Task not found.' };
    }

    const updatedTask = await db.task.update({
      where: { id: id },
      data: dataToUpdate,
    });

    revalidatePath(`/app/project/${task.projectId}`);

    return { status: 'success', data: updatedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    return { status: 'error', message: 'Failed to update task.' };
  }
}

const DeleteTaskSchema = z.object({
    taskId: z.string(),
    projectId: z.string(),
});
type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;

export async function deleteTask(
  input: DeleteTaskInput
): Promise<ActionResponse<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'error', message: 'Unauthorized' };
  }
  
  const validationResult = DeleteTaskSchema.safeParse(input);
  if (!validationResult.success) {
    return { status: "error", message: "Invalid data" };
  }

  const { taskId, projectId } = validationResult.data;

  try {
    await db.task.delete({
      where: { id: taskId },
    });

    revalidatePath(`/app/project/${projectId}`);

    return { status: 'success', data: "Task deleted successfully." };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { status: 'error', message: 'Failed to delete task.' };
  }
}