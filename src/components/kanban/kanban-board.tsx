'use client'

import { useState, useEffect, useMemo } from 'react'
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

import type { Project, User } from '@prisma/client'
import { type TaskWithDetails } from '@/types/prisma'
import { BoardColumn } from './board-column'
import { TaskCard } from './task-card'
import { moveTask } from '@/app/actions'
import { BoardToolbar } from './board-toolbar'
import { AddColumnButton } from './add-column-button'

type Column = {
  id: string
  title: string
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: TaskWithDetails[] };
  members: User[];
}

export function KanbanBoard({ initialProject, members }: KanbanBoardProps) {
  // --- 1. Init State ---
  const [columns, setColumns] = useState<Column[]>(() => {
    try { return initialProject.columns as unknown as Column[] } catch { return [] }
  })
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null)

  const addOptimisticTask = (newTask: TaskWithDetails) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const clearFilters = () => {
    setSearchQuery('')
    setFilterMemberId(null)
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchMember = filterMemberId ? task.assigneeId === filterMemberId : true
      return matchSearch && matchMember
    })
  }, [tasks, searchQuery, filterMemberId])

  useEffect(() => { setPortalContainer(document.body) }, [])
  
  // Sync state khi server trả data mới (quan trọng cho việc F5)
  useEffect(() => {
    // console.log('[Sync] Tasks updated from Server:', initialProject.tasks.length)
    setTasks(initialProject.tasks)
  }, [initialProject.tasks]);

  useEffect(() => {
    const cols = (initialProject.columns as unknown as Column[]) || [];
    setColumns(cols);
  }, [initialProject.columns]);

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
    // console.log('--- Drag End ---')
    // console.log('Active:', active.id)
    // console.log('Over:', over?.id)

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
        // console.error('Cannot determine target column')
        return
    }

    // Tính toán New Index trong cột đích
    // Lọc ra danh sách các task đang hiển thị ở cột đó (theo state hiện tại)
    const tasksInDestination = tasks.filter(t => t.columnId === newColumnId)
    const newIndex = tasksInDestination.findIndex(t => t.id === activeId)

    // console.log('Target Column:', newColumnId)
    // console.log('New Index (Calculated):', newIndex)

    if (newIndex === -1) {
        // console.error('Logic Error: Task not found in target column list')
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
            error: () => {
                // console.error('Server Error:', _err)
                return 'Failed to save position'
            }
        }
    )
    
    setActiveTask(null)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <BoardToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterMemberId={filterMemberId}
        setFilterMemberId={setFilterMemberId}
        members={members}
        clearFilters={clearFilters}
      />
      <div className="flex h-full gap-6 overflow-x-auto p-4 items-start">
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
              tasks={filteredTasks.filter(t => t.columnId === col.id)}
              projectId={initialProject.id}
              onAddTask={addOptimisticTask}
            />
          ))}

          {/* 👇 THÊM LẠI NÚT NÀY 👇 */}
          <div className="w-80 shrink-0">
             <AddColumnButton projectId={initialProject.id} />
          </div>
          
          {portalContainer && createPortal(
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} />}
            </DragOverlay>,
            portalContainer
          )}
        </DndContext>
      </div>
    </div>
  )
}