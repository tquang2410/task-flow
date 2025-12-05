'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, X } from "lucide-react"
import type { User } from "@prisma/client"
import { CreateColumnDialog } from "./create-column-dialog"

interface BoardToolbarProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filterMemberId: string | null
  setFilterMemberId: (id: string | null) => void
  members: User[]
  clearFilters: () => void
  projectId: string
}

export function BoardToolbar({
  searchQuery,
  setSearchQuery,
  filterMemberId,
  setFilterMemberId,
  members,
  clearFilters,
  projectId
}: BoardToolbarProps) {
  const hasFilters = searchQuery || filterMemberId

  return (
    // Sticky & Glassmorphism Header
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 -mx-6 px-6 py-4 mb-6 bg-dashboard-background/60 backdrop-blur-md border-b border-white/5 transition-all">
      
      {/* Left: Search & Filter */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors"
          />
        </div>
        
        <div className="h-6 w-px bg-white/10 mx-2" /> {/* Separator */}

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={`cursor-pointer transition-transform hover:scale-110 hover:z-10 rounded-full ring-2 ${filterMemberId === member.supabaseId ? 'ring-dashboard-primary z-10 scale-110' : 'ring-dashboard-background/50'}`}
                onClick={() => setFilterMemberId(filterMemberId === member.supabaseId ? null : member.supabaseId)}
                title={member.name || member.email}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatarUrl || ''} />
                  <AvatarFallback className="bg-slate-700 text-xs">{(member.name || member.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-white">
              <X className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
         <CreateColumnDialog projectId={projectId} />
      </div>
    </div>
  )
}