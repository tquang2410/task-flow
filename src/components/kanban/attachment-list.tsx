'use client'

import { useState, useTransition } from 'react'
import type { Attachment, User } from '@prisma/client'
import { toast } from 'sonner'
import { Paperclip, Trash2, UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadAttachment, deleteAttachment } from '@/app/actions'

interface AttachmentListProps {
  taskId: string
  initialAttachments: Attachment[]
  currentUser: User | null
}

export function AttachmentList({ taskId, initialAttachments, currentUser }: AttachmentListProps) {
  const [isUploading, startTransition] = useTransition()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await uploadAttachment(taskId, formData)
      if (result.status === 'success') {
        toast.success('Attachment uploaded successfully.')
      } else {
        toast.error(result.message)
      }
    })
    // Clear the file input
    event.target.value = ''
  }

  const handleDelete = (attachmentId: string, path: string) => {
    startTransition(async () => {
      if (!window.confirm('Are you sure you want to delete this attachment?')) return
      
      const result = await deleteAttachment({ attachmentId, path })
      if (result.status === 'success') {
        toast.success('Attachment deleted.')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Attachments</h3>
        <Button asChild variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/10">
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4" />
            Add Attachment
          </label>
        </Button>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
        </div>
      )}

      <div className="space-y-2">
        {initialAttachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-800/50 p-2">
            <div className="flex items-center gap-3 truncate">
              <Paperclip className="h-5 w-5 flex-shrink-0 text-slate-400" />
              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white truncate hover:underline">
                {attachment.name}
              </a>
            </div>
            {currentUser?.id === attachment.uploaderId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 hover:text-red-500"
                onClick={() => handleDelete(attachment.id, attachment.path)}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {initialAttachments.length === 0 && !isUploading && (
            <p className="text-sm text-slate-500">No attachments yet.</p>
        )}
      </div>
    </div>
  )
}
