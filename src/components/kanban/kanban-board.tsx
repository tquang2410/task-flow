'use client'

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"

import type { Project, Task, User } from "@prisma/client"
import { BoardColumn } from "./board-column"
import { TaskCard } from "./task-card"
import { moveTask } from "@/app/actions"
import { toast } from "sonner"

type Column = {
  id: string;
  title: string;
}

interface KanbanBoardProps {
  initialProject: Project & { tasks: Task[] };
  currentUser: User;
}

export function KanbanBoard({ initialProject, currentUser }: KanbanBoardProps) {
  const [columns] = useState<Column[]>(() => {
    // This is a safe way to parse JSON from Prisma
    try {
      return JSON.parse(initialProject.columns as string) as Column[];
    } catch (_e) {
      return [];
    }
  });
  const [tasks, setTasks] = useState(initialProject.tasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px drag needed to start
      },
    })
  )

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"
    const isOverAColumn = over.data.current?.type === "Column"

    // Dropping a Task over another Task (reordering)
    if (isActiveATask && isOverATask) {
      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId)
        const overIndex = currentTasks.findIndex((t) => t.id === overId)

        if (currentTasks[activeIndex].columnId != currentTasks[overIndex].columnId) {
          currentTasks[activeIndex].columnId = currentTasks[overIndex].columnId
          return arrayMove(currentTasks, activeIndex, overIndex - 1)
        }

        return arrayMove(currentTasks, activeIndex, overIndex)
      })
    }

    // Dropping a Task over a column (moving to new column)
    if (isActiveATask && isOverAColumn) {
        setTasks((currentTasks) => {
            const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
            currentTasks[activeIndex].columnId = String(overId);
            return arrayMove(currentTasks, activeIndex, activeIndex);
        });
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId === overId) return;
  
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;
  
    // Find the final column and order
    const overColumn = columns.find(c => c.id === over.id) || 
                       columns.find(c => c.id === over.data.current?.task?.columnId);

    if (!overColumn) return;

    // Call server action
    try {
        await moveTask({
            taskId: activeTask.id,
            newColumnId: activeTask.columnId, // Optimistically updated in onDragOver
            newOrder: tasks.filter(t => t.columnId === activeTask.columnId).findIndex(t => t.id === activeId),
            projectId: initialProject.id,
        });
        toast.success("Task moved successfully.");
    } catch (_error) {
        toast.error("Failed to move task. Reverting.");
        // Revert to initial state on failure
        setTasks(initialProject.tasks);
    }
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
