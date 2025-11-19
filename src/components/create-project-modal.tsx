'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateProjectSchema } from '@/lib/schemas'
import { createProject } from '@/app/actions'
import { toast } from 'sonner' // Using sonner for toast notifications

interface CreateProjectModalProps {
  workspaceId: string
  children: React.ReactNode // To use a button as the trigger
}

export function CreateProjectModal({ workspaceId, children }: CreateProjectModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof CreateProjectSchema>>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: '',
      workspaceId: workspaceId,
    },
  })

  async function onSubmit(values: z.infer<typeof CreateProjectSchema>) {
    setIsSubmitting(true)

    const result = await createProject(values)

    setIsSubmitting(false)

    if (result.status === 'success') {
      toast.success('Dự án đã được tạo thành công!')
      setOpen(false) // Đóng modal
      form.reset() // Reset form
      router.refresh() // Làm mới trang để hiển thị project mới
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>
            Đặt tên cho dự án của bạn. Nhấn &quot;Tạo&quot; để hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên dự án</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Redesign Website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* workspaceId is hidden but included in the form data */}
            <FormField
              control={form.control}
              name="workspaceId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo dự án'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
