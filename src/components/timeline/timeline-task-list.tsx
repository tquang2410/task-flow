"use client";

import { TaskWithDetails } from "@/types/prisma";
import { format } from "date-fns";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TimelineTaskListProps {
    tasks: TaskWithDetails[];
    headerHeight?: number;
    rowHeight?: number;
    scrollY: number;
    onScroll: (scrollY: number) => void;
    onTaskClick?: (task: TaskWithDetails) => void;
}

// Map task ID to a color (consistent hashing)
const getTaskColor = (str: string) => {
    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-emerald-500",
        "bg-orange-500",
        "bg-pink-500",
        "bg-cyan-500"
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const TimelineTaskList = forwardRef<HTMLDivElement, TimelineTaskListProps>(
    ({ tasks, headerHeight = 56, rowHeight = 64, scrollY, onScroll, onTaskClick }, ref) => {
        return (
            <div
                ref={ref}
                className="flex flex-col h-full border-r border-[#2D303E] bg-[#151723] w-[400px] shrink-0"
            >
                {/* Header */}
                <div
                    className="flex shrink-0 border-b border-[#2D303E] bg-[#1a1d2d]"
                    style={{ height: headerHeight }}
                >
                    <div className="flex-1 px-4 flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500 border-r border-white/5">
                        Name
                    </div>
                    <div className="w-24 px-4 flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500 border-r border-white/5">
                        Start
                    </div>
                    <div className="w-24 px-4 flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        End
                    </div>
                </div>

                {/* Body with Scroll Sync */}
                <div
                    className="flex-1 overflow-hidden relative"
                >
                    <div
                        className="absolute w-full top-0 left-0"
                        style={{
                            transform: `translateY(-${scrollY}px)`,
                            transition: 'transform 0.1s linear' // Thêm transition nhẹ để mượt hơn
                        }}
                    >
                        {tasks.map((task, index) => {
                            const colorClass = getTaskColor(task.id);

                            // Zebra striping: Odd rows get background
                            const isOdd = index % 2 !== 0;

                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex border-b border-[#2D303E] hover:bg-[#1E2130] transition-colors cursor-pointer group",
                                        isOdd ? "bg-[#1a1d2d]/30" : ""
                                    )}
                                    style={{ height: rowHeight }}
                                    onClick={() => onTaskClick?.(task)}
                                >
                                    {/* Name Column */}
                                    <div className="flex-1 px-4 flex items-center text-sm font-medium border-r border-white/5 text-gray-200">
                                        <span className={cn("w-2 h-2 rounded-full mr-3 shrink-0", colorClass)}></span>
                                        <span className="truncate">{task.title}</span>
                                    </div>

                                    {/* Start Date Column */}
                                    <div className="w-24 px-4 flex items-center text-xs text-gray-500 border-r border-white/5">
                                        {task.startDate ? format(new Date(task.startDate), "MMM dd") : "-"}
                                    </div>

                                    {/* End Date Column */}
                                    <div className="w-24 px-4 flex items-center text-xs text-gray-500">
                                        {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : "-"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
);

TimelineTaskList.displayName = "TimelineTaskList";
