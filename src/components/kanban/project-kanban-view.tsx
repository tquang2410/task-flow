'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TaskDetailSheet } from '@/components/kanban/task-detail-sheet'
import type { Project, User } from '@prisma/client'
import { type TaskWithDetails } from '@/types/prisma'

interface ProjectKanbanViewProps {
  project: Project & { tasks: TaskWithDetails[] };
  currentUser: User;
}

export function ProjectKanbanView({ project, currentUser }: ProjectKanbanViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const taskId = searchParams.get('taskId');
  const selectedTask = project.tasks.find(task => task.id === taskId);

  const handleSheetClose = () => {
    router.push(pathname, { scroll: false });
  }

  return (
    <>
      <KanbanBoard initialProject={project} currentUser={currentUser} />
      
      {selectedTask && (
        <TaskDetailSheet
          isOpen={!!selectedTask}
          onClose={handleSheetClose}
          task={selectedTask}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
