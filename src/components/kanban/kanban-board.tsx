'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client' // Import Supabase Client

import { BoardColumn } from './board-column'
import { TaskCard } from './task-card'
import { BoardToolbar } from './board-toolbar'
import { AddColumnButton } from './add-column-button' // Import component Add Column
import { moveTask } from '@/app/actions'

type Column = {
  id: string
  title: string
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: TaskWithDetails[] };
  members: User[];
}

export function KanbanBoard({ initialProject, members }: KanbanBoardProps) {
  const router = useRouter()
  const supabase = createClient()

  // --- 1. Init State ---
  const [columns, setColumns] = useState<Column[]>(() => {
    try { return initialProject.columns as unknown as Column[] } catch { return [] }
  })
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null)

  // --- 2. Realtime Setup (DEBUGGING MODE) ---
  useEffect(() => {
    const channelName = `project-${initialProject.id}`
    console.log('🔌 [Realtime] Connecting to channel:', channelName)

    const channel = supabase.channel(channelName)

    channel
      .on('broadcast', { event: 'change' }, (payload) => {
        console.log('📡 [Realtime] RECEIVED signal from another client:', payload)
        console.log('🔄 [Realtime] Triggering router.refresh()...')
        router.refresh()
      })
      .subscribe((status) => {
        console.log('🔌 [Realtime] Status changed:', status)
        if (status === 'SUBSCRIBED') {
            toast.success('Connected to Realtime updates')
        }
      })

    return () => {
      console.log('🔌 [Realtime] Disconnecting...')
      supabase.removeChannel(channel)
    }
  }, [initialProject.id, router, supabase])

  // Hàm gửi tín hiệu (Broadcaster)
  const onUpdate = async () => {
    console.log('📡 [Realtime] SENDING broadcast signal...')
    const channelName = `project-${initialProject.id}`
    const result = await supabase.channel(channelName).send({
      type: 'broadcast',
      event: 'change',
      payload: { user: 'someone' }
    })
    console.log('📡 [Realtime] Send result:', result)
  }

  // --- 3. Sync State ---
  // Khi router.refresh() xong, props mới sẽ về đây -> Cập nhật state
  useEffect(() => {
    console.log('🔄 [Sync] Props updated from Server. Tasks count:', initialProject.tasks.length)
    setTasks(initialProject.tasks)
  }, [initialProject.tasks])

  useEffect(() => {
    const cols = (initialProject.columns as unknown as Column[]) || [];
    setColumns(cols);
  }, [initialProject.columns]);

  useEffect(() => { setPortalContainer(document.body) }, [])

  // --- 4. Logic & Handlers ---
  const addOptimisticTask = (newTask: TaskWithDetails) => {
    setTasks((prev) => [...prev, newTask]);
    onUpdate(); // Báo cho người khác biết ngay khi tạo xong
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
    if (!over) { setActiveTask(null); return }

    const activeId = active.id
    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    let newColumnId = ''
    if (over.data.current?.type === 'Column') {
        newColumnId = String(over.id)
    } else if (over.data.current?.type === 'Task') {
        newColumnId = over.data.current.task.columnId
    }

    if (!newColumnId) return

    const tasksInColumn = tasks.filter(t => t.columnId === newColumnId)
    const newIndex = tasksInColumn.findIndex(t => t.id === activeId)

    if (newIndex === -1) return

    // Optimistic Update UI trước (đã làm trong onDragOver)
    
    // Gọi Server Action
    toast.promise(
        moveTask({
            taskId: String(activeId),
            newColumnId: newColumnId,
            newIndex: newIndex,
            projectId: initialProject.id
        }).then((res) => {
            if (res.status === 'success') {
                // Thành công -> Gửi tín hiệu Realtime
                onUpdate();
            } else {
                throw new Error(res.message);
            }
            return res;
        }),
        {
            loading: 'Saving...',
            success: 'Saved',
            error: (err) => {
                // Revert logic nếu cần (tạm bỏ qua cho gọn)
                return 'Failed to move';
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
              onUpdate={onUpdate} // Truyền xuống để component con dùng
              members={members}
            />
          ))}
          
          {/* Nút Add Column */}
          <div className="min-w-[300px] shrink-0">
             <AddColumnButton projectId={initialProject.id} />
          </div>

          {portalContainer && createPortal(
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} members={[]} />}
            </DragOverlay>,
            portalContainer
          )}
        </DndContext>
      </div>
    </div>
  )
}