import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, PlusCircle } from 'lucide-react'
import { PrimaryWorkspaceCard } from '@/components/dashboard/primary-workspace-card'
import { SecondaryWorkspaceCard } from '@/components/dashboard/secondary-workspace-card'
import { CreateProjectModal } from '@/components/create-project-modal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth')
  }

  const appUser = await db.user.findUnique({
    where: {
      supabaseId: user.id,
    },
    include: {
      workspaces: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  if (!appUser) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading user data...</p>
      </div>
    )
  }

  const { workspaces } = appUser
  const activeWorkspace = workspaces[0]
  const otherWorkspaces = workspaces.slice(1)

  // Empty State
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-700 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            You have no workspaces
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Get started by creating a new workspace.
          </p>
          <Button asChild className="bg-dashboard-primary text-white hover:bg-dashboard-primary/90">
            <Link href="/app/create-workspace">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Workspace
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header Area */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 py-4 bg-dashboard-background/80 backdrop-blur-md">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-white">
            Welcome back, {appUser.name || user.email?.split('@')[0]}
          </h1>
          <div className="flex items-center gap-4">
              <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                      placeholder="Search tasks, projects..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 text-sm text-gray-300 placeholder:text-gray-500 focus:ring-primary"
                  />
              </div>
              <CreateProjectModal workspaceId={workspaces[0].id}>
                  <Button className="h-11 px-5 text-sm font-bold bg-dashboard-primary text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
                      Create Project
                  </Button>
              </CreateProjectModal>
          </div>
      </header>

      <div>
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Your Workspaces</h2>
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeWorkspace && <PrimaryWorkspaceCard workspace={activeWorkspace} />}
          {otherWorkspaces.map((workspace) => (
            <SecondaryWorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      </div>
    </div>
  )
}
