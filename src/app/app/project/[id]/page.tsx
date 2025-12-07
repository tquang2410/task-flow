import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ProjectBoard } from '@/components/kanban/project-board'
import { BoardSkeleton } from '@/components/kanban/board-skeleton'
import { AddColumnButton } from '@/components/kanban/add-column-button'
import { ListSkeleton } from '@/components/list-view/list-skeleton'
import { ProjectList } from '@/components/list-view/project-list'
import { ProjectSettings } from '@/components/project/project-settings'
import { PlusCircle, Share } from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // 1. DATA FETCHING (Simplified for fast initial load)
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth')
  }

  // Fetch only the data needed for the shell UI (header, breadcrumbs)
  const [appUser, project] = await Promise.all([
    db.user.findUnique({ where: { supabaseId: user.id }, select: { id: true, name: true, email: true, avatarUrl: true } }),
    db.project.findUnique({
      where: { id: id },
      include: {
        workspace: {
          select: { id: true, name: true, memberIds: true }
        }
      }
    }),
  ])

  // 2. SECURITY & VALIDATION
  if (!project || !appUser || !project.workspace.memberIds.includes(appUser.id)) {
    return redirect('/app')
  }

    return (
      <div className="flex flex-col h-full p-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/app">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/app/workspace/${project.workspace.id}`}>{project.workspace.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
            <p className="text-slate-400">{project.description || 'No description for this project.'}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <Avatar className="h-9 w-9 border-2 border-dashboard-background">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="h-9 w-9 border-2 border-dashboard-background">
                <AvatarImage src="https://github.com/tquang2410.png" />
                <AvatarFallback>TQ</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/10">
              <Share className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button className="bg-dashboard-primary text-white hover:bg-dashboard-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Task
            </Button>
            <AddColumnButton projectId={project.id} />
          </div>
        </header>
  
        {/* Tabs */}
        <Tabs defaultValue="board" className="flex flex-col flex-grow min-h-0">
          <TabsList className="bg-transparent border-b border-white/10 rounded-none justify-start">
            <TabsTrigger value="board" className="data-[state=active]:bg-white/5 data-[state=active]:text-white">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
  
          <TabsContent value="board" className="flex-grow min-h-0">
            <Suspense fallback={<BoardSkeleton />}>
              <ProjectBoard projectId={project.id} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="list" className="flex-grow">
            <Suspense fallback={<ListSkeleton />}>
              <ProjectList projectId={project.id} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="timeline">Timeline view coming soon...</TabsContent>
          
          <TabsContent value="settings" className="flex-grow overflow-y-auto">
            <ProjectSettings project={project} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }
