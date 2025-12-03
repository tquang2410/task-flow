'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  CreateProjectSchema, CreateColumnSchema, UpdateColumnSchema, DeleteColumnSchema,
  CreateTaskSchema,
  CreateWorkspaceSchema,
  UpdateProjectSchema,
  UpdateTaskSchema,
  MoveTaskSchema,
  CreateCommentSchema,
  DeleteAttachmentSchema,
  CreateAttachmentRecordSchema,
  GetSignedUrlSchema,
  AddMemberSchema,
  RemoveMemberSchema
} from '@/lib/schemas'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type ActionResponse } from '@/types/actions'
import { Prisma, type Task } from '@prisma/client'
import { slugify } from '@/lib/utils'

// --- Workspace Management ---
export async function createWorkspace(
  input: z.infer<typeof CreateWorkspaceSchema>
): Promise<ActionResponse<Awaited<ReturnType<typeof db.workspace.create>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  // First, get the internal app user ID
  const appUser = await db.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!appUser) {
    return { status: 'error', message: 'Authenticated user not found in database.' }
  }

  const validationResult = CreateWorkspaceSchema.safeParse(input)
  if (!validationResult.success) {
    return {
      status: 'error',
      message: 'Invalid data',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    const newWorkspace = await db.workspace.create({
      data: {
        name: validationResult.data.name,
        memberIds: [appUser.id], // Use the internal MongoDB ObjectId
      },
    })
    // Also update the user's workspace list
    await db.user.update({
        where: { supabaseId: user.id },
        data: { workspaceIds: { push: newWorkspace.id } }
    })

    revalidatePath('/app')
    return { status: 'success', data: newWorkspace }
  } catch(e) {
    console.error(e)
    return { status: 'error', message: 'Failed to create workspace.' }
  }
}

// --- Workspace Member Management ---
export async function addMemberToWorkspace(
  input: z.infer<typeof AddMemberSchema>
): Promise<ActionResponse<string>> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { status: 'error', message: 'Unauthorized' }
  }
  
  const appCurrentUser = await db.user.findUnique({ where: { supabaseId: currentUser.id }, select: { id: true }});
  if (!appCurrentUser) {
      return { status: 'error', message: 'Authenticated user not found in database.' }
  }


  const validationResult = AddMemberSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid email address.' }
  }

  const { workspaceId, email } = validationResult.data

  try {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { memberIds: true },
    })

    if (!workspace || !workspace.memberIds.includes(appCurrentUser.id)) {
      return { status: 'error', message: 'Not authorized to perform this action.' }
    }

    const userToAdd = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!userToAdd) {
      return { status: 'error', message: 'This user is not registered on TaskFlow.' }
    }

    if (workspace.memberIds.includes(userToAdd.id)) {
      return { status: 'error', message: 'This user is already a member of the workspace.' }
    }

    // Using a transaction to ensure data consistency
    await db.$transaction([
      db.workspace.update({
        where: { id: workspaceId },
        data: { memberIds: { push: userToAdd.id } }, // Use internal ObjectId
      }),
      db.user.update({
        where: { id: userToAdd.id },
        data: { workspaceIds: { push: workspaceId } },
      }),
    ])

    revalidatePath(`/app/workspace/${workspaceId}`)
    return { status: 'success', data: 'Member added successfully.' }
  } catch {
    return { status: 'error', message: 'Failed to add member.' }
  }
}

export async function removeMemberFromWorkspace(
  input: z.infer<typeof RemoveMemberSchema>
): Promise<ActionResponse<string>> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const appCurrentUser = await db.user.findUnique({ where: { supabaseId: currentUser.id }, select: { id: true }});
  if (!appCurrentUser) {
      return { status: 'error', message: 'Authenticated user not found in database.' }
  }

  const validationResult = RemoveMemberSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data.' }
  }

  // Note: userToRemoveId is the SupabaseID from the client
  const { workspaceId, userId: userToRemoveSupabaseId } = validationResult.data

  try {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { memberIds: true },
    })

    // Auth check using internal ID
    if (!workspace || !workspace.memberIds.includes(appCurrentUser.id)) {
      return { status: 'error', message: 'Not authorized to perform this action.' }
    }
    
    const userToRemove = await db.user.findUnique({
        where: { supabaseId: userToRemoveSupabaseId },
        select: { id: true, workspaceIds: true }
    });

    if(!userToRemove) {
        return { status: 'error', message: "User to remove not found." };
    }

    const adminId = workspace.memberIds[0] // Internal ObjectId of admin
    const isCurrentUserAdmin = appCurrentUser.id === adminId
    const isRemovingSelf = appCurrentUser.id === userToRemove.id

    if (isCurrentUserAdmin && isRemovingSelf) {
      return { status: 'error', message: "Admin cannot be removed from the workspace." }
    }

    if (!isCurrentUserAdmin && !isRemovingSelf) {
      return { status: 'error', message: "You don't have permission to remove this member." }
    }

    const newMemberIds = workspace.memberIds.filter(id => id !== userToRemove.id);
    const newUserWorkspaceIds = userToRemove.workspaceIds.filter(id => id !== workspaceId);

    // Using a transaction to ensure data consistency
    await db.$transaction([
        db.workspace.update({
            where: { id: workspaceId },
            data: { memberIds: newMemberIds },
        }),
        db.user.update({
            where: { id: userToRemove.id },
            data: { workspaceIds: newUserWorkspaceIds },
        }),
    ]);


    revalidatePath(`/app/workspace/${workspaceId}`)
    return { status: 'success', data: 'Member removed successfully.' }
  } catch(e) {
    console.log(e);
    return { status: 'error', message: 'Failed to remove member.' }
  }
}



// --- Project Management ---
export async function createProject(
  input: z.infer<typeof CreateProjectSchema>
): Promise<ActionResponse<Awaited<ReturnType<typeof db.project.create>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = CreateProjectSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }

  // TODO: Add check to ensure user is part of the workspace
  try {
    const newProject = await db.project.create({
      data: {
        ...validationResult.data,
        columns: [
          { id: 'todo', title: 'Todo' },
          { id: 'in-progress', title: 'In Progress' },
          { id: 'done', title: 'Done' },
        ],
      },
    })
    revalidatePath(`/app/workspace/${validationResult.data.workspaceId}`)
    return { status: 'success', data: newProject }
  } catch {
    return { status: 'error', message: 'Failed to create project.' }
  }
}

export async function updateProject(
  input: z.infer<typeof UpdateProjectSchema>
): Promise<ActionResponse<Awaited<ReturnType<typeof db.project.update>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = UpdateProjectSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }
  
  const { id, ...updateData } = validationResult.data

  try {
    const project = await db.project.findUnique({
      where: { id },
      select: { workspace: { select: { memberIds: true } } }
    });

    const appUser = await db.user.findUnique({ where: { supabaseId: user.id }, select: { id: true } });

    if (!project || !appUser || !project.workspace.memberIds.includes(appUser.id)) {
      return { status: 'error', message: 'You do not have permission to edit this project.' };
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: updateData,
    })
    revalidatePath(`/app/project/${id}`)
    return { status: 'success', data: updatedProject }
  } catch {
    return { status: 'error', message: 'Failed to update project.' }
  }
}


export async function deleteProject(input: { projectId: string }): Promise<ActionResponse<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  try {
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      select: { workspaceId: true, workspace: { select: { memberIds: true } } }
    });

    const appUser = await db.user.findUnique({ where: { supabaseId: user.id }, select: { id: true } });

    if (!project || !appUser || !project.workspace.memberIds.includes(appUser.id)) {
      return { status: 'error', message: 'You do not have permission to delete this project.' };
    }
    
    await db.project.delete({
      where: { id: input.projectId },
    })

    revalidatePath('/app')
  } catch {
    return { status: 'error', message: 'Failed to delete project.' }
  }
  redirect('/app');
}


// --- Column Management ---
type Column = { id: string; title: string };

export async function createColumn(
    input: z.infer<typeof CreateColumnSchema>
): Promise<ActionResponse<Column>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = CreateColumnSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }

  const { projectId, title } = validationResult.data

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { columns: true },
    })

    if (!project) {
      return { status: 'error', message: 'Project not found.' }
    }

    const columns = (project.columns || []) as Column[]
    const newColumn: Column = {
      id: `${slugify(title)}-${Date.now()}`,
      title,
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        columns: [...columns, newColumn],
      },
    })

    revalidatePath(`/app/project/${projectId}`)
    return { status: 'success', data: newColumn }
  } catch {
    return { status: 'error', message: 'Failed to create column.' }
  }
}

export async function updateColumn(
    input: z.infer<typeof UpdateColumnSchema>
): Promise<ActionResponse<Column>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = UpdateColumnSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }

  const { projectId, columnId, title } = validationResult.data

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { columns: true },
    })

    if (!project) {
      return { status: 'error', message: 'Project not found.' }
    }

    let columns = (project.columns || []) as Column[]
    let updatedColumn: Column | undefined;

    columns = columns.map(col => {
      if (col.id === columnId) {
        updatedColumn = { ...col, title };
        return updatedColumn;
      }
      return col
    })

    if (!updatedColumn) {
        return { status: 'error', message: 'Column not found.' }
    }

    await db.project.update({
      where: { id: projectId },
      data: { columns },
    })

    revalidatePath(`/app/project/${projectId}`)
    return { status: 'success', data: updatedColumn }
  } catch {
    return { status: 'error', message: 'Failed to update column.' }
  }
}

export async function deleteColumn(
    input: z.infer<typeof DeleteColumnSchema>
): Promise<ActionResponse<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = DeleteColumnSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }
  const { projectId, columnId } = validationResult.data

  try {
    // Safety Check: Prevent deleting a column that contains tasks
    const taskCount = await db.task.count({
      where: { projectId, columnId },
    })

    if (taskCount > 0) {
      return {
        status: 'error',
        message: `Cannot delete column: ${taskCount} task(s) remaining.`,
      }
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { columns: true },
    })

    if (!project) {
      return { status: 'error', message: 'Project not found.' }
    }

    const columns = (project.columns || []) as Column[]
    const newColumns = columns.filter(col => col.id !== columnId)

    if (columns.length === newColumns.length) {
        return { status: 'error', message: 'Column not found.'}
    }

    await db.project.update({
      where: { id: projectId },
      data: { columns: newColumns },
    })

    revalidatePath(`/app/project/${projectId}`)
    return { status: 'success', data: 'Column deleted successfully.' }
  } catch {
    return { status: 'error', message: 'Failed to delete column.' }
  }
}


// --- Task Management ---
export async function createTask(
  input: z.infer<typeof CreateTaskSchema>
): Promise<ActionResponse<Task>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { status: 'error', message: 'Unauthorized' }
    }

    const validationResult = CreateTaskSchema.safeParse(input)
    if (!validationResult.success) {
        return { status: 'error', message: 'Invalid data' }
    }
    
    const { title, projectId, columnId } = validationResult.data

    try {
        // This logic is correct: it finds the highest order and adds 1,
        // ensuring the new task is always at the bottom.
        const highestOrderTask = await db.task.findFirst({
            where: { projectId, columnId },
            orderBy: { order: 'desc' },
        })

        const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0

        const newTask = await db.task.create({
            data: {
                title,
                projectId,
                columnId,
                reporterId: user.id,
                order: newOrder,
                type: 'TASK',
            },
        })
        revalidatePath(`/app/project/${projectId}`)
        return { status: 'success', data: newTask }
    } catch {
        return { status: 'error', message: 'Failed to create task.' }
    }
}

export async function updateTask(
  input: z.infer<typeof UpdateTaskSchema>
): Promise<ActionResponse<Task>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = UpdateTaskSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }
  
  const { id, ...updateData } = validationResult.data

  try {
    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
    })
    revalidatePath(`/app/project/${updatedTask.projectId}`)
    return { status: 'success', data: updatedTask }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { status: 'error', message: 'Task not found.' }
    }
    return { status: 'error', message: 'Failed to update task.' }
  }
}

export async function deleteTask(input: { taskId: string, projectId: string }): Promise<ActionResponse<string>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { status: 'error', message: 'Unauthorized' }
    }

    try {
        await db.task.delete({
            where: { id: input.taskId },
        })
        revalidatePath(`/app/project/${input.projectId}`)
        return { status: 'success', data: 'Task deleted' }
    } catch {
        return { status: 'error', message: 'Failed to delete task.' }
    }
}

export async function moveTask(
  input: z.infer<typeof MoveTaskSchema>
): Promise<ActionResponse<string>> {
  console.log('[moveTask] Server received input:', input); // Log input
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = MoveTaskSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid data' }
  }

  const { taskId, newColumnId, newIndex, projectId } = validationResult.data;

  try {
    // 1. Lấy danh sách TẤT CẢ task trong cột đích (trừ task đang di chuyển)
    const tasksInDestination = await db.task.findMany({
      where: {
        projectId,
        columnId: newColumnId,
        id: { not: taskId } // Loại trừ chính nó ra để tránh duplicate
      },
      orderBy: { order: 'asc' },
      select: { id: true } // Chỉ cần lấy ID để tối ưu
    })

    // 2. Tính toán danh sách ID mới theo đúng thứ tự mong muốn
    const newOrderedIds = tasksInDestination.map(t => t.id)
    
    // Chèn ID của task đang di chuyển vào đúng vị trí index (newIndex)
    newOrderedIds.splice(newIndex, 0, taskId)

    // 3. Tạo Transaction để cập nhật lại toàn bộ cột
    const updates = newOrderedIds.map((id, index) => {
      return db.task.update({
        where: { id },
        data: {
          columnId: newColumnId, // Đảm bảo task đã sang cột mới
          order: index           // Reset order: 0, 1, 2, 3... liên tục
        }
      })
    })

    // 4. Thực thi transaction
    await db.$transaction(updates)

    revalidatePath(`/app/project/${projectId}`)
    return { status: 'success', data: 'Task moved and reordered' }
  } catch (error) {
    console.error('Move Task DB Error:', error) // More specific log
    const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.'
    return { status: 'error', message: `Failed to move task. ${errorMessage}` }
  }
}

// --- Comment Management ---
export async function createComment(
  input: z.infer<typeof CreateCommentSchema>
): Promise<ActionResponse<Awaited<ReturnType<typeof db.comment.create>>>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { status: 'error', message: 'Unauthorized' }
    }

    const validationResult = CreateCommentSchema.safeParse(input)
    if (!validationResult.success) {
        return { status: 'error', message: 'Invalid data' }
    }

    const { taskId, text } = validationResult.data
    try {
        const task = await db.task.findUnique({ where: { id: taskId }, select: { projectId: true }})
        if (!task) return { status: 'error', message: 'Task not found' }

        const newComment = await db.comment.create({
            data: {
                text,
                taskId,
                userId: user.id
            }
        })
        revalidatePath(`/app/project/${task.projectId}`)
        return { status: 'success', data: newComment }
    } catch {
        return { status: 'error', message: 'Failed to create comment.' }
    }
}


// --- Attachment Management (Direct Upload) ---

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function getSignedUploadUrl(
  input: z.infer<typeof GetSignedUrlSchema>
): Promise<ActionResponse<{ signedUrl: string; path: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = GetSignedUrlSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid input.' }
  }
  
  const { taskId, fileName, fileType, fileSize } = validationResult.data;

  // Server-side validation
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    return { status: 'error', message: 'File type not allowed.' };
  }
  if (fileSize > MAX_FILE_SIZE) {
    return { status: 'error', message: 'File size exceeds 5MB limit.' };
  }

  const filePath = `${user.id}/${taskId}/${Date.now()}-${slugify(fileName)}`

  try {
    const { data, error } = await supabase.storage
      .from('ATTACHMENTS')
      .createSignedUploadUrl(filePath)

    if (error) {
      throw error;
    }
    
    return { status: 'success', data: { signedUrl: data.signedUrl, path: data.path } }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create signed URL.';
    return { status: 'error', message }
  }
}

export async function createAttachmentRecord(
  input: z.infer<typeof CreateAttachmentRecordSchema>
): Promise<ActionResponse<Awaited<ReturnType<typeof db.attachment.create>>>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }
  
  const validationResult = CreateAttachmentRecordSchema.safeParse(input)
  if (!validationResult.success) {
    return { status: 'error', message: 'Invalid input.' }
  }

  const { taskId, name, path } = validationResult.data;
  
  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { projectId: true }
    });

    if (!task) {
      return { status: 'error', message: 'Task not found.' }
    }

    // This is not quite right, the PUBLIC URL needs to be constructed.
    // The `url` passed in from the client will be the full signed URL, which is temporary.
    // We need the permanent public URL.
    const { data: { publicUrl } } = supabase.storage.from('ATTACHMENTS').getPublicUrl(path)

    const newAttachment = await db.attachment.create({
      data: {
        name,
        url: publicUrl,
        path,
        taskId,
        uploaderId: user.id,
      },
    })

    revalidatePath(`/app/project/${task.projectId}`)
    return { status: 'success', data: newAttachment }
  } catch(e) {
    const message = e instanceof Error ? e.message : 'An unknown error occurred while saving to the database.';
    console.error(e);
    return { status: 'error', message }
  }
}

export async function deleteAttachment(
  input: z.infer<typeof DeleteAttachmentSchema>
): Promise<ActionResponse<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Unauthorized' }
  }

  const validationResult = DeleteAttachmentSchema.safeParse(input)
  if (!validationResult.success) {
      return { status: 'error', message: 'Invalid data' }
  }

  const { attachmentId, path } = validationResult.data

  try {
    const attachment = await db.attachment.findUnique({
        where: { id: attachmentId },
        select: { uploaderId: true, task: { select: { projectId: true } } },
    })

    if (!attachment) {
        return { status: 'error', message: 'Attachment not found.' }
    }

    if (attachment.uploaderId !== user.id) {
        return { status: 'error', message: 'You are not authorized to delete this file.' }
    }

    const { error: storageError } = await supabase.storage.from('ATTACHMENTS').remove([path])
    if (storageError) {
        console.error('Storage Deletion Error:', storageError)
        return { status: 'error', message: 'Failed to delete file from storage.' }
    }

    await db.attachment.delete({
        where: { id: attachmentId },
    })

    revalidatePath(`/app/project/${attachment.task.projectId}`)

    return { status: 'success', data: 'Attachment deleted.' }
  } catch {
    return { status: 'error', message: 'Failed to delete attachment.' }
  }
}