'use client'

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import { CreateTaskDialog } from "./create-task-dialog"
import type { User } from "@prisma/client"
import { type TaskWithDetails } from "@/types/prisma"

// Define Column type directly to avoid unused schema variables
type Column = {
  id: string;
  title: string;
}

interface BoardColumnProps {
    column: Column;
    tasks: TaskWithDetails[];
    projectId: string;
    currentUser: User;
}

export function BoardColumn({ column, tasks, projectId, currentUser }: BoardColumnProps) {
    const tasksInColumn = tasks.filter(task => task.columnId === column.id);
    const taskIds = tasksInColumn.map(task => task.id);

    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    return (
        <div ref={setNodeRef} className="w-80 shrink-0 flex flex-col bg-secondary/50 rounded-xl h-full max-h-full">
            {/* Column Header */}
            <div className="p-4 font-semibold text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    <Badge variant="secondary" className="bg-white/10">{tasksInColumn.length}</Badge>
                </div>
                <CreateTaskDialog projectId={projectId} columnId={column.id} />
            </div>
            {/* Task List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 mt-4 px-4 pb-4">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasksInColumn.map(task => (
                        <TaskCard key={task.id} task={task} currentUser={currentUser} />
                    ))}
                </SortableContext>
                {tasksInColumn.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                        <p>No tasks yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
