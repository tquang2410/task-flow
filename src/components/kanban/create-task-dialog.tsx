'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateTaskSchema } from '@/lib/schemas'
import { createTask } from '@/app/actions'


interface CreateTaskDialogProps {
  projectId: string;
  columnId: string;
}

export function CreateTaskDialog({ projectId, columnId }: CreateTaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof CreateTaskSchema>>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: '',
      projectId: projectId,
      columnId: columnId,
    },
  })

  async function onSubmit(values: z.infer<typeof CreateTaskSchema>) {
    setIsSubmitting(true);
    const result = await createTask(values);
    setIsSubmitting(false);

    if (result.status === 'success') {
      toast.success("Task has been created successfully.");
      setOpen(false);
      form.reset();
      // No need to call router.refresh() here as revalidatePath in the action will handle it
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} className="bg-slate-800 border-slate-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-dashboard-primary text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
