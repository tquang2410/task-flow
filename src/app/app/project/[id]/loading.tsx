import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectLoading() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      
      {/* Kanban Board Skeleton */}
      <div className="flex gap-6 flex-1 overflow-x-auto">
        {/* Column 1 */}
        <div className="w-80 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Column 2 */}
        <div className="w-80 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>

        {/* Column 3 */}
        <div className="w-80 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
        
        {/* Add Column Skeleton */}
        <div className="w-80 shrink-0">
           <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
