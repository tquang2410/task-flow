'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { CalendarIcon, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Task, Priority } from '@prisma/client'

import { cn } from '@/lib/utils'
import { UpdateTaskSchema } from '@/lib/schemas'
import { updateTask, deleteTask } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { CommentSection } from './comment-section'

// Define a more detailed Task type for props
type TaskWithComments = Task & {
  comments: (Comment & { user: User })[];
};

interface TaskDetailSheetProps {
  task: TaskWithComments
  isOpen: boolean
  onClose: () => void
  currentUser: User | null
}

export function TaskDetailSheet({ task, isOpen, onClose, currentUser }: TaskDetailSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof UpdateTaskSchema>>({
    resolver: zodResolver(UpdateTaskSchema),
    defaultValues: {
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate,
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof UpdateTaskSchema>) {
    const result = await updateTask(values)
    if (result.status === 'success') {
      toast.success('Task updated successfully.')
      onClose()
    } else {
      toast.error(result.message)
    }
  }

  async function onDelete() {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }
    setIsDeleting(true)
    const result = await deleteTask({ taskId: task.id, projectId: task.projectId })
    setIsDeleting(false)
    if (result.status === 'success') {
      toast.success('Task deleted.')
      onClose()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-slate-900 border-slate-800 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>View and edit the details of your task.</SheetDescription>
        </SheetHeader>
        <div className="py-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input {...field} className="bg-slate-800 border-slate-700"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Add a more detailed description..."
                        className="resize-none bg-slate-800 border-slate-700"
                        {...field}
                        value={field.value ?? ''}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 text-white">
                                {(Object.keys(Priority) as Array<keyof typeof Priority>).map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Due date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal bg-slate-800 border-slate-700 hover:bg-slate-700",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <SheetFooter className="mt-8 !space-x-2">
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={onDelete} 
                        disabled={isSubmitting || isDeleting}
                        className="mr-auto"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete Task'}
                    </Button>
                    <SheetClose asChild>
                       <Button type="button" variant="ghost">Cancel</Button>
                    </SheetClose>
                    <Button type="submit" className="bg-dashboard-primary text-white" disabled={isSubmitting || isDeleting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </SheetFooter>
            </form>
            </Form>
            <Separator className="my-6 bg-slate-800" />
            <CommentSection 
                taskId={task.id}
                initialComments={task.comments}
                currentUser={currentUser}
            />
        </div>
      </SheetContent>
    </Sheet>
  )
}
