'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

import type { Comment, User } from '@prisma/client'
import { CreateCommentSchema } from '@/lib/schemas'
import { createComment } from '@/app/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

type CommentWithUser = Comment & { user: User }

interface CommentSectionProps {
  taskId: string
  initialComments: CommentWithUser[]
  currentUser: User | null
}

export function CommentSection({ taskId, initialComments, currentUser }: CommentSectionProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition();

  const [optimisticComments, addOptimisticComment] = useOptimistic<CommentWithUser[], string>(
    initialComments,
    (state, newCommentText) => [
      ...state,
      {
        id: crypto.randomUUID(),
        text: newCommentText,
        taskId,
        userId: currentUser?.id || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: currentUser || { id: '', supabaseId: '', email: '...', name: 'Optimistic User', avatarUrl: null, workspaceIds: [], createdAt: new Date(), updatedAt: new Date() },
      },
    ]
  )

  const form = useForm<z.infer<typeof CreateCommentSchema>>({
    resolver: zodResolver(CreateCommentSchema),
    defaultValues: {
      taskId: taskId,
      text: '',
    },
  })

  async function onSubmit(values: z.infer<typeof CreateCommentSchema>) {
    if (!values.text.trim()) {
      return;
    }
    
    startTransition(() => {
      addOptimisticComment(values.text)
    });
    
    form.reset()
    const result = await createComment(values)

    if (result.status === 'error') {
      toast.error(result.message)
      // In a production app, you might want to remove the optimistic comment here
      // or use a more robust state management that handles automatic rollbacks.
    }
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4 pt-4">
      <h3 className="font-semibold text-white">Comments</h3>
      <div className="space-y-4">
        {optimisticComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatarUrl ?? undefined} />
              <AvatarFallback>{getInitials(comment.user.name || comment.user.email)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">{comment.user.name || comment.user.email}</span>
                <span className="text-xs text-slate-500">
                  {comment.createdAt.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-md">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-start gap-2"
        >
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={currentUser?.avatarUrl ?? undefined} />
            <AvatarFallback>{getInitials(currentUser?.name || currentUser?.email)}</AvatarFallback>
          </Avatar>
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    placeholder="Write a comment..."
                    className="bg-slate-800 border-slate-700 focus-visible:ring-dashboard-primary"
                    rows={1}
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" className="bg-dashboard-primary hover:bg-dashboard-primary/90 mt-1" disabled={isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Form>
    </div>
  )
}