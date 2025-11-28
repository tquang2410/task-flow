'use client'

import { useTransition } from 'react'
import type { Attachment, User } from '@prisma/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { Paperclip, Trash2, UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSignedUploadUrl, createAttachmentRecord, deleteAttachment } from '@/app/actions'

interface AttachmentListProps {
  taskId: string
  initialAttachments: Attachment[]
  currentUser: User | null
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE_MB = 5;

export function AttachmentList({ taskId, initialAttachments, currentUser }: AttachmentListProps) {
  const [isUploading, startTransition] = useTransition()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log('handleFileChange triggered');
    const file = event.target.files?.[0]
    // console.log('File selected:', file);
    if (!file) return

    // 1. Client-side validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`File type not allowed. Please upload one of: JPEG, PNG, GIF, PDF.`);
      event.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    startTransition(async () => {
      try {
        // console.log("Requesting signed URL with:", { taskId, fileName: file.name, fileType: file.type, fileSize: file.size });

        // 2. Get Signed URL from server
        const signedUrlResult = await getSignedUploadUrl({
          taskId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        // console.log("Received from getSignedUploadUrl:", signedUrlResult);

        if (signedUrlResult.status === 'error') {
          throw new Error(signedUrlResult.message);
        }

        const { signedUrl, path } = signedUrlResult.data;

        // console.log("Attempting direct upload to Supabase:", { signedUrl, path });

        // 3. Upload file directly to Supabase
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        // console.log("Supabase Direct Upload Response:", {
        //     ok: uploadResponse.ok,
        //     status: uploadResponse.status,
        //     statusText: uploadResponse.statusText,
        // });

        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.json();
          // console.error("Supabase Direct Upload Error Body:", errorBody);
          throw new Error(errorBody.message || 'Failed to upload file to storage.');
        }

        // 4. Notify server to create DB record
        const createRecordResult = await createAttachmentRecord({
          taskId,
          name: file.name,
          path: path,
        });
        
        if (createRecordResult.status === 'error') {
          throw new Error(createRecordResult.message);
        }

        toast.success('Attachment uploaded successfully.');
      } catch (e) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast.error(message);
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
      
      <p className="text-xs text-slate-500">
        Supports JPEG, PNG, GIF, PDF. Max 5MB.
      </p>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {initialAttachments.map((attachment) => {
          const isImage = attachment.name.match(/\.(jpg|jpeg|png|gif)$/i);

          return (
            <div key={attachment.id} className="relative group aspect-video bg-slate-800/50 rounded-md overflow-hidden">
              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {isImage ? (
                  <Image
                    src={attachment.url}
                    alt={attachment.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <Paperclip className="h-8 w-8 text-slate-400" />
                    <span className="text-xs text-center text-slate-300 mt-2 truncate">{attachment.name}</span>
                  </div>
                )}
              </a>
              {currentUser?.id === attachment.uploaderId && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDelete(attachment.id, attachment.path)}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {initialAttachments.length === 0 && !isUploading && (
            <p className="text-sm text-slate-500">No attachments yet.</p>
      )}
    </div>
  )
}