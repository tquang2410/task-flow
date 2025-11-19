import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import type { Workspace } from '@prisma/client'

interface SecondaryWorkspaceCardProps {
  workspace: Workspace;
}

export function SecondaryWorkspaceCard({ workspace }: SecondaryWorkspaceCardProps) {
  const progress = Math.floor(Math.random() * 100);

  return (
    <Link href={`/app/workspace/${workspace.id}`} className="col-span-1 row-span-1 flex flex-col rounded-xl border border-white/10 bg-[#15171C] p-6 transition-all hover:border-dashboard-primary/50">
      <div className="flex items-start justify-between mb-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10"
          style={{ backgroundImage: `url(https://source.unsplash.com/random/100x100?sig=${workspace.id})` }}
        />
        <div className="flex -space-x-2 overflow-hidden">
          <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-dashboard-background">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
           <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-dashboard-background">
            <AvatarImage src="https://github.com/tquang2410.png" />
            <AvatarFallback>TQ</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div>
        <p className="text-white text-lg font-bold">{workspace.name}</p>
        <p className="text-slate-400 text-sm mb-2">Updated recently</p>
        <Progress value={progress} className="h-1.5 bg-white/10" indicatorClassName="bg-pink-500" />
      </div>
    </Link>
  )
}
