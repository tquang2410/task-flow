'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TaskDetailSheet } from '@/components/kanban/task-detail-sheet'
import type { Project, User } from '@prisma/client'
import { type TaskWithDetails } from '@/types/prisma'

interface ProjectKanbanViewProps {
  project: Project & { tasks: TaskWithDetails[], workspace: { members: User[] } };
  currentUser: User;
}

export function ProjectKanbanView({ project, currentUser }: ProjectKanbanViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient()
  
  const taskId = searchParams.get('taskId');
  const selectedTask = project.tasks.find(task => task.id === taskId);

  // --- Realtime Logic ---
  const onUpdate = async () => {
    console.log('📡 [Realtime] SENDING broadcast signal...')
    const channelName = `project-${project.id}`
    const result = await supabase.channel(channelName).send({
      type: 'broadcast',
      event: 'change',
      payload: { user: 'someone' }
    })
    console.log('📡 [Realtime] Send result:', result)
  }

  useEffect(() => {
    const channelName = `project-${project.id}`
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
  }, [project.id, router, supabase])

  const handleSheetClose = () => {
    router.push(pathname, { scroll: false });
  }

  return (
    <>
      <KanbanBoard 
        initialProject={project} 
        members={project.workspace.members}
        onUpdate={onUpdate}
      />
      
      {selectedTask && (
        <TaskDetailSheet
          isOpen={!!selectedTask}
          onClose={handleSheetClose}
          task={selectedTask}
          currentUser={currentUser}
          members={project.workspace.members}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}