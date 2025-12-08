import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { TimelineView } from './timeline-view'

interface ProjectTimelineProps {
    projectId: string;
}

export async function ProjectTimeline({ projectId }: ProjectTimelineProps) {
    // 1. DATA FETCHING
    const supabase = await createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    if (!supabaseUser) {
        return redirect('/auth')
    }

    // Fetch project with tasks included
    // We don't need all the heavy details like comments/attachments for the Timeline initially
    // But reusing the same shape as Kanban might be easier if we want to share types
    // For performance, let's fetch just what we need plus what TaskWithDetails expects
    // To avoid type issues, let's include everything TaskWithDetails needs
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            tasks: {
                orderBy: { order: 'asc' },
                include: {
                    assignee: true,
                    comments: {
                        include: { user: true },
                        orderBy: { createdAt: 'asc' }
                    },
                    attachments: {
                        include: { uploader: true }
                    }
                }
            },
            workspace: {
                select: { memberIds: true }
            }
        },
    })

    const appUser = await db.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })

    // 2. SECURITY & VALIDATION
    if (!project || !appUser || !project.workspace.memberIds.includes(appUser.id)) {
        return <div className="p-4 text-red-500">Access denied or project not found.</div>;
    }

    // 3. RENDER THE CLIENT COMPONENT
    return <TimelineView tasks={project.tasks} onUpdate={async () => {
        'use server'
        // This empty server action is passed to trigger revalidation in the client component
        // However, revalidatePath in the actual updateTask action handles the revalidation.
        // The Client Component calls a prop onUpdate, which we can just leave as a no-op 
        // or pass a server action that revalidates if needed.
        // But better: relying on the revalidatePath in updateTask is enough.
        // We just need to pass a function that satisfies the prop type or make it optional.
        // Actually, KanbanBoard uses onUpdate to just trigger local state refresh if needed, 
        // but with revalidatePath, the Server Component rerenders.
        // FOR NOW: Let's pass a simple server function to satisfy the type.
    }} />
}
