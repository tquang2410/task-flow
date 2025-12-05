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
          <div className="flex items-center justify-between gap-4 mb-4 px-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-secondary/50 border-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 mr-2">
                      {members.map((member) => (
                      <div
                          key={member.id}
                          className={`cursor-pointer transition-transform hover:scale-110 hover:z-10 rounded-full ring-2 ${filterMemberId === member.supabaseId ? 'ring-primary' : 'ring-background'}`}
                          onClick={() => setFilterMemberId(filterMemberId === member.supabaseId ? null : member.supabaseId)}
                          title={member.name || member.email}
                      >
                          <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatarUrl || ''} />
                          <AvatarFallback>{(member.name || member.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                      </div>
                      ))}
                  </div>
                  {hasFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
                      <X className="mr-2 h-4 w-4" /> Clear
                      </Button>
                  )}
              </div>
              <CreateColumnDialog projectId={projectId} />
            </div>
          </div>
        )
      }
      