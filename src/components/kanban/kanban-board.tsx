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
import { BoardToolbar } from './board-toolbar'
import { AddColumnButton } from './add-column-button' // This import is no longer needed but keeping it doesn't harm
import { moveTask } from '@/app/actions'

type Column = {
  id: string
  title: string
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: TaskWithDetails[] };
  members: User[];
  onUpdate: () => Promise<void>;
}

export function KanbanBoard({ initialProject, members, onUpdate }: KanbanBoardProps) {
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

  // --- 2. Sync State ---
  useEffect(() => {
    console.log('🔄 [Sync] Props updated from Server. Tasks count:', initialProject.tasks.length)
    setTasks(initialProject.tasks)
  }, [initialProject.tasks])

  useEffect(() => {
    const cols = (initialProject.columns as unknown as Column[]) || [];
    setColumns(cols);
  }, [initialProject.columns]);

  useEffect(() => { setPortalContainer(document.body) }, [])

  // --- 3. Logic & Handlers ---
  const addOptimisticTask = (newTask: TaskWithDetails) => {
    setTasks((prev) => [...prev, newTask]);
    onUpdate();
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
    
    toast.promise(
        moveTask({
            taskId: String(activeId),
            newColumnId: newColumnId,
            newIndex: newIndex,
            projectId: initialProject.id
        }).then((res) => {
            if (res.status === 'success') {
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
                return 'Failed to move';
            }
        }
    )
    
    setActiveTask(null)
  }

  return (
    <div className="flex flex-col">
      <BoardToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterMemberId={filterMemberId}
        setFilterMemberId={setFilterMemberId}
        members={members}
        clearFilters={clearFilters}
        projectId={initialProject.id}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start p-4">
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
              onUpdate={onUpdate}
              members={members}
            />
          ))}
          
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