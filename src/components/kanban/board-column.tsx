'use client'

import { useState, useTransition } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DotsHorizontalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { TaskCard } from './task-card'
import { CreateTaskDialog } from './create-task-dialog'

import { updateColumn, deleteColumn } from '@/app/actions'
import type { User } from '@prisma/client'
import { type TaskWithDetails } from '@/types/prisma'
import { cn } from '@/lib/utils'

type Column = {
  id: string
  title: string
}

interface ColumnHeaderProps {
  column: Column
  taskCount: number
  projectId: string
}

function ColumnHeader({ column, taskCount, projectId }: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [isPending, startTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleUpdateTitle = () => {
    if (title === column.title || title.trim() === '') {
      setIsEditing(false)
      setTitle(column.title)
      return
    }

    startTransition(() => {
      toast.promise(updateColumn({ projectId, columnId: column.id, title }), {
        loading: 'Renaming column...',
        success: 'Column renamed successfully!',
        error: (err) => err.message || 'Failed to rename column.',
      })
      setIsEditing(false)
    })
  }

  const handleDelete = () => {
    startTransition(() => {
      toast.promise(deleteColumn({ projectId, columnId: column.id }), {
        loading: 'Deleting column...',
        success: 'Column deleted successfully!',
        error: (err) => err.message || 'Failed to delete column.',
      })
    })
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="p-4 font-semibold text-white flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle()
              if (e.key === 'Escape') {
                setIsEditing(false)
                setTitle(column.title)
              }
            }}
            className="h-8 text-base"
            disabled={isPending}
          />
        ) : (
          <>
            <span className="truncate">{column.title}</span>
            <Badge variant="secondary" className="bg-white/10">
              {taskCount}
            </Badge>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <CreateTaskDialog projectId={projectId} columnId={column.id} />
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil1Icon className="mr-2 h-4 w-4" />
                Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                    >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    column. Any tasks in this column will need to be moved first.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

interface BoardColumnProps {
  column: Column
  tasks: TaskWithDetails[]
  projectId: string
  currentUser: User
}

export function BoardColumn({
  column,
  tasks,
  projectId,
  currentUser,
}: BoardColumnProps) {
  const tasksInColumn = tasks.filter((task) => task.columnId === column.id)
  const taskIds = tasksInColumn.map((task) => task.id)

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className="w-80 shrink-0 flex flex-col bg-secondary/50 rounded-xl h-full max-h-full"
    >
      <ColumnHeader
        column={column}
        taskCount={tasksInColumn.length}
        projectId={projectId}
      />
      {/* Task List */}
      <div
        className={cn(
          'flex-1 overflow-y-auto flex flex-col gap-3 mt-4 px-4 pb-4',
          tasksInColumn.length === 0 && 'items-center justify-center'
        )}
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasksInColumn.map((task) => (
            <TaskCard key={task.id} task={task} currentUser={currentUser} />
          ))}
        </SortableContext>
        {tasksInColumn.length === 0 && (
          <div className="text-sm text-slate-500">
            <p>No tasks yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
