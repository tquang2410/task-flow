import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreateProjectModal } from '@/components/create-project-modal'

interface WorkspacePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id: workspaceId } = await params

  // 1. **Authentication & Data Fetching**
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login') // Should be handled by middleware, but as a fallback
  }

  // Get user's internal ID
  const appUser = await db.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!appUser) {
    // This case should ideally not happen if webhooks are working
    return redirect('/app/create-workspace')
  }

  // Fetch workspace details and its projects
  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      projects: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  // 2. **Security Check & Authorization**
  if (!workspace || !workspace.memberIds.includes(appUser.id)) {
    // User is not a member of this workspace, redirect them.
    return redirect('/app')
  }

  const { projects } = workspace

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
        <CreateProjectModal workspaceId={workspaceId}>
          <Button>Tạo Project</Button>
        </CreateProjectModal>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Link href={`/app/project/${project.id}`} key={project.id}>
              <Card className="h-full transform transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {/* Placeholder for more content, e.g., task count */}
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h2 className="text-xl font-semibold">Chưa có dự án nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bắt đầu bằng cách tạo dự án đầu tiên của bạn.
          </p>
          <div className="mt-6">
            <CreateProjectModal workspaceId={workspaceId}>
              <Button>Tạo Project mới</Button>
            </CreateProjectModal>
          </div>
        </div>
      )}
    </div>
  )
}
