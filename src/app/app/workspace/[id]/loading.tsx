import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Project Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
      </div>
    </div>
  )
}
