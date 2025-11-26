'use client'

import { useState, useTransition, useEffect } from 'react'
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

import type { Project } from '@prisma/client'
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

function AddColumn({ projectId }: { projectId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleCreateColumn = () => {
    if (title.trim() === '') {
      return toast.error('Column title cannot be empty.')
    }

    startTransition(() => {
      toast.promise(createColumn({ projectId, title }), {
        loading: 'Creating column...',
        success: 'Column created successfully!',
        error: (err) => err.message || 'Failed to create column.',
      })
      setIsAdding(false)
      setTitle('')
    })
  }

  if (isAdding) {
    return (
      <div className="w-80 shrink-0 p-2 space-y-2 bg-secondary/50 rounded-xl">
        <Input
          autoFocus
          placeholder="Enter column title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
          disabled={isPending}
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateColumn} disabled={isPending}>
            {isPending ? 'Creating...' : 'Add Column'}
          </Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 shrink-0">
      <Button
        variant="secondary"
        className="w-full justify-start h-12"
        onClick={() => setIsAdding(true)}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Add new column
      </Button>
    </div>
  )
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: TaskWithDetails[] };
}

export function KanbanBoard({ initialProject }: KanbanBoardProps) {
  const [columns] = useState<Column[]>(() => {
    try {
      return initialProject.columns as unknown as Column[];
    } catch {
      return []
    }
  })
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [tasksBeforeDrag, setTasksBeforeDrag] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Sync local state with server state when props change
  useEffect(() => {
    setTasks(initialProject.tasks);
  }, [initialProject.tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px drag needed to start
      },
    })
  )

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      const task = event.active.data.current.task as TaskWithDetails;
      setActiveTask(task)
      setTasksBeforeDrag(tasks);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverAColumn = over.data.current?.type === 'Column'
    
    if (isActiveATask && isOverAColumn) {
      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
        if (currentTasks[activeIndex].columnId !== overId) {
            currentTasks[activeIndex].columnId = String(overId);
            return arrayMove(currentTasks, activeIndex, activeIndex);
        }
        return currentTasks;
      });
    }

    const isOverATask = over.data.current?.type === 'Task'
    if (isActiveATask && isOverATask) {
        setTasks((currentTasks) => {
            const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
            const overIndex = currentTasks.findIndex((t) => t.id === overId);
            
            if (currentTasks[activeIndex].columnId !== currentTasks[overIndex].columnId) {
                currentTasks[activeIndex].columnId = currentTasks[overIndex].columnId;
                return arrayMove(currentTasks, activeIndex, overIndex);
            }
    
            return arrayMove(currentTasks, activeIndex, overIndex);
        });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) {
      if (active.id !== over?.id) setTasks(tasksBeforeDrag);
      return;
    }

    const movedTask = tasks.find(t => t.id === active.id);
    if (!movedTask) return;

    const newColumnId = movedTask.columnId;
    const newIndex = tasks.filter(t => t.columnId === newColumnId).findIndex(t => t.id === active.id);

    toast.promise(
      moveTask({
        taskId: movedTask.id,
        newColumnId: newColumnId,
        newIndex: newIndex,
        projectId: initialProject.id,
      }),
      {
        loading: 'Moving task...',
        success: 'Task moved successfully!',
        error: (err) => {
          setTasks(tasksBeforeDrag);
          return err.message || 'Failed to move task. Reverting.';
        },
      }
    );
  }


  return (
    <div className="flex gap-6 h-full overflow-x-auto p-1">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasks}
            projectId={initialProject.id}
          />
        ))}
        <AddColumn projectId={initialProject.id} />
        {portalContainer && createPortal(
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} />
            )}
          </DragOverlay>,
          portalContainer
        )}
      </DndContext>
    </div>
  )
}
