import { Skeleton } from "@/components/ui/skeleton"

export function TimelineSkeleton() {
    return (
        <div className="flex flex-col h-full w-full bg-dashboard-card rounded-lg border border-white/10 overflow-hidden">
            {/* Toolbar Skeleton */}
            <div className="flex items-center justify-between border-b bg-background/50 p-4 border-white/10">
                <Skeleton className="h-9 w-[180px]" />
            </div>

            {/* Grid Skeleton */}
            <div className="flex-1 p-4 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-[200px]" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                ))}
            </div>
        </div>
    )
}
