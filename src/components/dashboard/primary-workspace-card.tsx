import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { Workspace } from '@prisma/client' // Import type from prisma

interface PrimaryWorkspaceCardProps {
  workspace: Workspace;
}

export function PrimaryWorkspaceCard({ workspace }: PrimaryWorkspaceCardProps) {
  // Placeholder data, replace with real data from workspace projects later
  const progress = Math.floor(Math.random() * 100);

  return (
    <Link href={`/app/workspace/${workspace.id}`} className="group relative md:col-span-2 md:row-span-2 flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#15171C] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-dashboard-primary/50">
      {/* Glow effect */}
      <div className="absolute -inset-24 z-0 bg-dashboard-primary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(70,61,245,0.15) 0%, rgba(17,16,34,0) 50%)' }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                 <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-12" style={{ backgroundImage: `url(https://source.unsplash.com/random/100x100?sig=${workspace.id})` }} />
                <div>
                    <p className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">{workspace.name}</p>
                    <p className="text-slate-400 text-sm font-normal leading-normal">Main active workspace</p>
                </div>
            </div>
            <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">Active</Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-slate-400 text-sm">{progress}% complete</p>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-dashboard-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-dashboard-background">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-dashboard-background">
            <AvatarImage src="https://github.com/tquang2410.png" />
            <AvatarFallback>TQ</AvatarFallback>
          </Avatar>
          <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-dashboard-background">
            <AvatarFallback>+5</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Mini Sparkline Chart SVG */}
        <div className="w-1/2">
          <svg className="w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M 0 20 L 10 15 L 20 25 L 30 10 L 40 18 L 50 12 L 60 22 L 70 8 L 80 15 L 90 25 L 100 20" fill="none" stroke="#463DF5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M 0 20 L 10 15 L 20 25 L 30 10 L 40 18 L 50 12 L 60 22 L 70 8 L 80 15 L 90 25 L 100 20" fill="url(#sparkline-gradient)" stroke="none"></path>
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#463DF5" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#463DF5" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Link>
  )
}
