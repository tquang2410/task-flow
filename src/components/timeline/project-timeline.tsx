import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { CustomGantt } from './custom-gantt'

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
    return <CustomGantt tasks={project.tasks} columns={project.columns as any[]} />;
}
