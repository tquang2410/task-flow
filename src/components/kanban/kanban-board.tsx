'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'
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
  // --- 1. Init State & Hooks ---
  const router = useRouter()
  const supabase = createClient()
  const [columns, setColumns] = useState<Column[]>(() => {
    try { return initialProject.columns as unknown as Column[] } catch { return [] }
  })
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null)

  // --- 2. Realtime & Data Sync ---
  const broadcastChange = async () => {
    const channel = supabase.channel(`project-${initialProject.id}`)
    await channel.send({
      type: 'broadcast',
      event: 'change',
      payload: { message: `Project ${initialProject.id} updated` },
    })
  }

  useEffect(() => {
    const channel = supabase.channel(`project-${initialProject.id}`)
    
    channel
      .on('broadcast', { event: 'change' }, (payload) => {
        // console.log('Realtime event received:', payload)
        // Re-fetch server components
        router.refresh()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log(`Subscribed to channel: project-${initialProject.id}`)
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, initialProject.id, router])

  // Sync local state when server provides new data (after router.refresh)
  useEffect(() => {
    // console.log('[Sync] Tasks updated from Server:', initialProject.tasks.length)
    setTasks(initialProject.tasks)
  }, [initialProject.tasks]);

  useEffect(() => {
    const cols = (initialProject.columns as unknown as Column[]) || [];
    setColumns(cols);
  }, [initialProject.columns]);


  // --- 3. Local State Management ---
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
  

  // --- 4. Drag & Drop ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  )

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

    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)
        
        if (prev[activeIndex].columnId !== prev[overIndex].columnId) {
          prev[activeIndex].columnId = prev[overIndex].columnId
        }
        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        if (prev[activeIndex].columnId !== String(overId)) {
            prev[activeIndex].columnId = String(overId)
            return [...prev] 
        }
        return prev
      })
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) {
        setActiveTask(null)
        return
    }

    const activeId = active.id
    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    let newColumnId = ''
    if (over.data.current?.type === 'Column') {
        newColumnId = String(over.id)
    } else if (over.data.current?.type === 'Task') {
        newColumnId = over.data.current.task.columnId
    }

    if (!newColumnId) {
        return
    }

    const tasksInDestination = tasks.filter(t => t.columnId === newColumnId)
    const newIndex = tasksInDestination.findIndex(t => t.id === activeId)

    if (newIndex === -1) {
        return
    }

    toast.promise(
        moveTask({
            taskId: String(activeId),
            newColumnId: newColumnId,
            newIndex: newIndex,
            projectId: initialProject.id
        }).then(() => {
          // Gửi tín hiệu realtime sau khi move thành công
          return broadcastChange();
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

  // --- 5. Render ---
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
              onUpdate={broadcastChange} // Truyền hàm broadcast
            />
          ))}
          
          <div className="min-w-[300px] shrink-0">
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