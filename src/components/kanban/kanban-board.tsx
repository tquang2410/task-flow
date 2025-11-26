'use client'

import { useState, useTransition } from 'react'
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
  initialProject: Project & { tasks: TaskWithDetails[] }
  currentUser: User
}

export function KanbanBoard({ initialProject, currentUser }: KanbanBoardProps) {
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
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)

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
      setActiveColumnId(task.columnId);
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
    
    // Handle dropping a task over a column
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

    // Handle dropping a task over another task
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
    setActiveColumnId(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) {
      // Revert if dropped in a non-droppable area or on itself
      if (active.id !== over?.id) setTasks(tasksBeforeDrag);
      return;
    }

    const movedTask = tasks.find(t => t.id === active.id);
    const originalColumnId = activeColumnId;
    
    if (!movedTask || !originalColumnId) return;

    const newColumnId = movedTask.columnId;
    const newIndex = tasks.filter(t => t.columnId === newColumnId).findIndex(t => t.id === active.id);

    // Call server action with the new, robust payload
    toast.promise(
      moveTask({
        taskId: movedTask.id,
        activeColumnId: originalColumnId,
        newColumnId: newColumnId,
        newIndex: newIndex,
        projectId: initialProject.id,
      }),
      {
        loading: 'Moving task...',
        success: 'Task moved successfully!',
        error: (err) => {
          // Revert on error
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
            currentUser={currentUser}
          />
        ))}
        <AddColumn projectId={initialProject.id} />
        {createPortal(
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} currentUser={currentUser} />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}