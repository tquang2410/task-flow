import Link from 'next/link'
import { redirect } from 'next/navigation'
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
import { ProjectKanbanView } from '@/components/kanban/project-kanban-view';
import { PlusCircle, Share } from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // 1. DATA FETCHING
  const { id } = await params; // Await params to get the id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth')
  }

  // Fetch both the app user (full object) and the project in parallel
  const [appUser, project] = await Promise.all([
    db.user.findUnique({ where: { supabaseId: user.id } }),
    db.project.findUnique({
      where: { id: id },
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
    return redirect('/app')
  }

  return (
    <div className="flex flex-col h-full p-6">
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
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="board" className="flex flex-col flex-grow">
        <TabsList className="bg-transparent border-b border-white/10 rounded-none justify-start">
          <TabsTrigger value="board" className="data-[state=active]:bg-white/5 data-[state=active]:text-white">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Board Content is now handled by the client component */}
        <TabsContent value="board" className="flex-grow overflow-hidden">
            <ProjectKanbanView project={project} currentUser={appUser} />
        </TabsContent>
        <TabsContent value="list">List view coming soon...</TabsContent>
        <TabsContent value="timeline">Timeline view coming soon...</TabsContent>
        <TabsContent value="settings">Settings coming soon...</TabsContent>
      </Tabs>
    </div>
  )
}