'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { PlusIcon } from '@radix-ui/react-icons'

import type { Project, User } from '@prisma/client'
import { type TaskWithDetails } from '@/types/prisma'
import { BoardColumn } from './board-column'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { moveTask, createColumn } from '@/app/actions'

type Column = {
  id: string
  title: string
}

// Component AddColumn giữ nguyên
function AddColumn({ projectId }: { projectId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreateColumn = async () => {
    if (title.trim() === '') return toast.error('Title required')
    try {
      await createColumn({ projectId, title })
      toast.success('Column created')
      setIsAdding(false)
      setTitle('')
    } catch (error) {
      toast.error('Failed to create column')
    }
  }

  if (isAdding) {
    return (
      <div className="w-80 shrink-0 p-2 space-y-2 bg-secondary/50 rounded-xl">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateColumn}>Add</Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <div className="w-80 shrink-0">
      <Button variant="secondary" className="w-full justify-start h-12" onClick={() => setIsAdding(true)}>
        <PlusIcon className="mr-2 h-4 w-4" /> Add new column
      </Button>
    </div>
  )
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: TaskWithDetails[] }
  currentUser: User
}

export function KanbanBoard({ initialProject, currentUser }: KanbanBoardProps) {
  // --- 1. Init State ---
  const [columns] = useState<Column[]>(() => {
    try { return initialProject.columns as unknown as Column[] } catch { return [] }
  })
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => { setPortalContainer(document.body) }, [])
  
  // Sync state khi server trả data mới (quan trọng cho việc F5)
  useEffect(() => {
    console.log('[Sync] Tasks updated from Server:', initialProject.tasks.length)
    setTasks(initialProject.tasks)
  }, [initialProject.tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  )

  // --- 2. Drag Handlers ---
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task as TaskWithDetails)
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    // Kéo Task đè lên Task khác
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)
        
        // Nếu khác cột, đổi columnId ngay lập tức
        if (prev[activeIndex].columnId !== prev[overIndex].columnId) {
          prev[activeIndex].columnId = prev[overIndex].columnId
        }
        // Di chuyển vị trí trong mảng local (Optimistic)
        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    // Kéo Task vào vùng trống của Cột
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        // Chỉ đổi columnId, không đổi thứ tự (nó sẽ nằm cuối hoặc chỗ cũ)
        if (prev[activeIndex].columnId !== String(overId)) {
            prev[activeIndex].columnId = String(overId)
             // Hack: Trigger re-render để UI cập nhật
            return [...prev] 
        }
        return prev
      })
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    // --- LOGGING (Debug) ---
    console.log('--- Drag End ---')
    console.log('Active:', active.id)
    console.log('Over:', over?.id)

    if (!over) {
        setActiveTask(null)
        return
    }

    const activeId = active.id
    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Xác định cột đích
    // Nếu over là column -> dùng over.id
    // Nếu over là task -> dùng columnId của task đó
    let newColumnId = ''
    if (over.data.current?.type === 'Column') {
        newColumnId = String(over.id)
    } else if (over.data.current?.type === 'Task') {
        newColumnId = over.data.current.task.columnId
    }

    // Nếu không xác định được cột, revert
    if (!newColumnId) {
        console.error('Cannot determine target column')
        return
    }

    // Tính toán New Index trong cột đích
    // Lọc ra danh sách các task đang hiển thị ở cột đó (theo state hiện tại)
    const tasksInColumn = tasks.filter(t => t.columnId === newColumnId)
    const newIndex = tasksInColumn.findIndex(t => t.id === activeId)

    console.log('Target Column:', newColumnId)
    console.log('New Index (Calculated):', newIndex)

    if (newIndex === -1) {
        console.error('Logic Error: Task not found in target column list')
        return
    }

    // Gọi Server Action
    toast.promise(
        moveTask({
            taskId: String(activeId),
            newColumnId: newColumnId,
            newIndex: newIndex, // Index 0, 1, 2...
            projectId: initialProject.id
        }),
        {
            loading: 'Saving position...',
            success: 'Saved',
            error: (err) => {
                console.error('Server Error:', err)
                return 'Failed to save position'
            }
        }
    )
    
    setActiveTask(null)
  }

  return (
    <div className="flex gap-6 h-full overflow-x-auto p-1">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasks.filter(t => t.columnId === col.id)}
            projectId={initialProject.id}
            currentUser={currentUser}
          />
        ))}
        <AddColumn projectId={initialProject.id} />
        {portalContainer && createPortal(
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} currentUser={currentUser} />}
          </DragOverlay>,
          portalContainer
        )}
      </DndContext>
    </div>
  )
}