// @/components/list-view/task-table.tsx
'use client'
/**
 * File: src/components/list-view/task-table.tsx
 *
 * Chức năng:
 * - Đây là Client Component chịu trách nhiệm hiển thị danh sách các Task dưới dạng bảng.
 * - Sử dụng thư viện `@tanstack/react-table` để quản lý logic của bảng (sắp xếp, lọc, phân trang).
 * - Sử dụng các component từ `shadcn/ui` (`Table`, `DropdownMenu`, `Checkbox`, `Badge`) để xây dựng giao diện.
 * - Định nghĩa các cột cho bảng: Checkbox, Title, Status, Priority, Assignee, Due Date, và Actions.
 * - Xử lý các hành động trên mỗi dòng, chẳng hạn như "Edit" (mở `TaskDetailSheet`) và "Delete" (gọi `deleteTask` action).
 */
import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskDetailSheet } from '@/components/kanban/task-detail-sheet'
import { deleteTask } from '@/app/actions'
import { type TaskWithDetails } from '@/types/prisma'
import { type User } from '@prisma/client'

type Column = {
  id: string
  title: string
}

interface TaskTableProps {
  data: TaskWithDetails[]
  columns: Column[] // Pass columns to map columnId to title
  projectId: string
  currentUser: User
  members: User[]
}

export function TaskTable({ data, columns: projectColumns, projectId, currentUser, members }: TaskTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isPending, startTransition] = React.useTransition()

  // State to manage the currently selected task for the detail sheet
  const [selectedTask, setSelectedTask] = React.useState<TaskWithDetails | null>(null)
  
  const handleDeleteTask = (taskId: string) => {
    startTransition(() => {
        toast.promise(deleteTask({ taskId, projectId }), {
            loading: 'Deleting task...',
            success: 'Task deleted successfully!',
            error: (err) => err.message || 'Failed to delete task.',
        });
    });
  };

  const columns: ColumnDef<TaskWithDetails>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'columnId',
        header: 'Status',
        cell: ({ row }) => {
            const columnId = row.getValue('columnId') as string;
            const column = projectColumns.find(c => c.id === columnId);
            return <Badge variant="outline">{column?.title || 'N/A'}</Badge>;
        },
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
            const priority = row.getValue('priority') as string
            const priorityVariant = {
                LOW: 'secondary',
                MEDIUM: 'default',
                HIGH: 'destructive',
            } as const;
            return <Badge variant={priorityVariant[priority as keyof typeof priorityVariant] || 'default'}>{priority}</Badge>;
        },
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: ({ row }) => {
        const assignee = row.original.assignee
        return assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatarUrl || ''} />
              <AvatarFallback>{assignee.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <span>{assignee.name}</span>
          </div>
        ) : (
          <span className="text-slate-500">Unassigned</span>
        )
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.getValue('dueDate') as Date | null
        return dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : <span className="text-slate-500">No due date</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                View & Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => handleDeleteTask(task.id)}
                disabled={isPending}
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                    No tasks found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* Task Detail Sheet */}
        {selectedTask && (
            <TaskDetailSheet
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                currentUser={currentUser}
                members={members}
            />
        )}
    </div>
  )
}
