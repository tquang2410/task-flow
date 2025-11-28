'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
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
import { type TaskWithDetails } from '@/types/prisma'


interface CreateTaskDialogProps {
  projectId: string;
  columnId: string;
  onAddTask: (task: TaskWithDetails) => void;
}

export function CreateTaskDialog({ projectId, columnId, onAddTask }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof CreateTaskSchema>>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: '',
      projectId: projectId,
      columnId: columnId,
    },
  })

  async function onSubmit(values: z.infer<typeof CreateTaskSchema>) {
    // Step 1: Create a temporary task object for optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempTask: TaskWithDetails = {
      id: tempId,
      title: values.title,
      columnId: values.columnId,
      projectId: values.projectId,
      order: 9999, // Will be corrected by the server
      priority: 'MEDIUM',
      type: 'TASK',
      status: 'TODO', // Default status
      description: null,
      dueDate: null,
      assigneeId: null,
      reporterId: 'temp-user', // Will be corrected by server
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
    };

    // Step 2: Optimistically update the UI
    onAddTask(tempTask);

    // Step 3: Close the modal and reset the form immediately
    setOpen(false);
    form.reset();

    // Step 4: Call the server action in the background
    toast.promise(
      createTask(values),
      {
        loading: 'Creating task...',
        success: (result) => {
          if (result.status === 'error') {
            toast.error(result.message);
          }
          return "Task created successfully.";
        },
        error: (err) => {
          console.error("Failed to create task:", err);
          return "Could not create task.";
        },
      }
    );
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
            <Button type="submit" className="w-full bg-dashboard-primary text-white">
              Create Task
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}