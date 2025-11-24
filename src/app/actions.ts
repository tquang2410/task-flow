'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema, CreateTaskSchema, CreateWorkspaceSchema, UpdateTaskSchema, CreateCommentSchema, DeleteCommentSchema, UploadAttachmentSchema, DeleteAttachmentSchema } from '@/lib/schemas'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ... (existing actions from createWorkspace to deleteComment)

// --- Epic 3: Attachment Management ---

export async function uploadAttachment(
  taskId: string,
  formData: FormData
): Promise<ActionResponse<Awaited<ReturnType<typeof db.attachment.create>>>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Unauthorized" };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { status: 'error', message: 'No file provided.' };
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { projectId: true }
  });

  if (!task) {
      return { status: 'error', message: 'Task not found.' };
  }

  const filePath = `${user.id}/${taskId}/${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ATTACHMENTS')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage Error:", uploadError);
    return { status: 'error', message: 'Failed to upload file to storage.' };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('ATTACHMENTS')
    .getPublicUrl(filePath);

  try {
    const newAttachment = await db.attachment.create({
      data: {
        name: file.name,
        url: publicUrl,
        path: filePath, // Store the path for easy deletion
        taskId: taskId,
        uploaderId: user.id,
      },
    });

    revalidatePath(`/app/project/${task.projectId}`);
    return { status: 'success', data: newAttachment };
  } catch (error) {
    console.error("DB Error:", error);
    return { status: 'error', message: 'Failed to save attachment to database.' };
  }
}

export async function deleteAttachment(
  input: z.infer<typeof DeleteAttachmentSchema>
): Promise<ActionResponse<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Unauthorized" };
  }

  const validationResult = DeleteAttachmentSchema.safeParse(input);
  if (!validationResult.success) {
      return { status: "error", message: "Invalid data" };
  }

  const { attachmentId, path } = validationResult.data;

  try {
    const attachment = await db.attachment.findUnique({
        where: { id: attachmentId },
        select: { uploaderId: true, task: { select: { projectId: true } } },
    });

    if (!attachment) {
        return { status: 'error', message: 'Attachment not found.' };
    }

    // Optional: Add more robust ownership/permissions check here
    if (attachment.uploaderId !== user.id) {
        return { status: 'error', message: 'You are not authorized to delete this file.' };
    }

    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage.from('attachments').remove([path]);
    if (storageError) {
        console.error("Storage Deletion Error:", storageError);
        return { status: 'error', message: 'Failed to delete file from storage.' };
    }

    // 2. Delete from Database
    await db.attachment.delete({
        where: { id: attachmentId },
    });

    revalidatePath(`/app/project/${attachment.task.projectId}`);

    return { status: 'success', data: "Attachment deleted." };
  } catch (error) {
    console.error("DB Deletion Error:", error);
    return { status: 'error', message: 'Failed to delete attachment.' };
  }
}