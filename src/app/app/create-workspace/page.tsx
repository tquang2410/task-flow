'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateWorkspaceSchema } from '@/lib/schemas'
import { createWorkspace } from '@/app/actions'

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Định nghĩa form với react-hook-form và Zod.
  const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: {
      name: '',
    },
  })

  // 2. Hàm xử lý khi submit form.
  async function onSubmit(values: z.infer<typeof CreateWorkspaceSchema>) {
    setIsSubmitting(true)
    setError(null)

    // 3. Gọi Server Action `createWorkspace`.
    const result = await createWorkspace(values)

    setIsSubmitting(false)

    // 4. Xử lý kết quả trả về.
    if (result.status === 'success') {
      // 5. Xử lý thành công: Chuyển hướng.
      // Tạm thời chuyển hướng về trang chủ.
      // Sau này có thể chuyển hướng đến trang của workspace mới: `/app/workspace/${result.data.id}`
      router.push('/app')
    } else {
      // 6. Xử lý lỗi: Hiển thị thông báo.
      setError(result.message)
      if (result.fieldErrors) {
        for (const fieldName in result.fieldErrors) {
          form.setError(fieldName as keyof typeof values, {
            type: 'server',
            message: result.fieldErrors[fieldName],
          })
        }
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Tạo Workspace mới</CardTitle>
          <CardDescription>
            Bắt đầu bằng cách đặt tên cho không gian làm việc của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Workspace</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Công ty Acme"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo Workspace'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
