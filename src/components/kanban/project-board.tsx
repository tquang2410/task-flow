import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { ProjectKanbanView } from '@/components/kanban/project-kanban-view';

interface ProjectBoardProps {
  projectId: string;
}

export async function ProjectBoard({ projectId }: ProjectBoardProps) {
  // 1. DATA FETCHING
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) {
    // This should ideally be handled by middleware, but as a safeguard
    return redirect('/auth')
  }

  // Fetch both the app user (full object) and the project with all its heavy details
  const [appUser, project] = await Promise.all([
    db.user.findUnique({ where: { supabaseId: supabaseUser.id } }),
    db.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
          include: {
            comments: {
              include: {
                user: true // Include the user who made the comment
              },
              orderBy: {
                createdAt: 'asc' // Show oldest comments first
              }
            },
            attachments: {
              include: {
                uploader: true // Include the user who uploaded the file
              }
            }
          }
        },
        workspace: { select: { id: true, name: true, memberIds: true } },
      },
    }),
  ])

  // 2. SECURITY & VALIDATION
  if (!project || !appUser || !project.workspace.memberIds.includes(appUser.id)) {
    // This check is duplicated from the page, but is crucial for security
    // in case this component is ever used elsewhere.
    return <div className="p-4 text-red-500">Access denied or project not found.</div>;
  }

  // 3. RENDER THE CLIENT COMPONENT
  return <ProjectKanbanView project={project} currentUser={appUser} />;
}
