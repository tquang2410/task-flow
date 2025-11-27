import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Primary Workspace Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
      
      {/* Other Workspaces Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}
