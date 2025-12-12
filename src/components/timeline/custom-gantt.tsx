"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, differenceInDays, addMonths, subMonths, startOfDay } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskWithDetails } from "@/types/prisma";

interface CustomGanttProps {
    tasks: TaskWithDetails[];
    columns?: any[]; // Using any[] for simplicity with Json type, or define generic
}

export function CustomGantt({ tasks, columns = [] }: CustomGanttProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const sidebarRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);

    // Helper to get task status color based on column
    const getTaskStatusColor = (columnId: string) => {
        const column = columns.find((c: any) => c.id === columnId);
        const title = column?.title?.toLowerCase() || "";

        if (title.includes('done') || title.includes('complete')) return "bg-task-green";
        if (title.includes('progress')) return "bg-task-blue";
        if (title.includes('todo') || title.includes('backlog')) return "bg-gray-500";
        return "bg-task-purple";
    };

    // Sync scrolling
    const handleScroll = (source: 'sidebar' | 'timeline') => (e: React.UIEvent<HTMLDivElement>) => {
        if (isScrolling.current) return;
        isScrolling.current = true;

        const target = source === 'sidebar' ? timelineRef.current : sidebarRef.current;
        const sourceEl = e.currentTarget;

        if (target) {
            target.scrollTop = sourceEl.scrollTop;
        }

        setTimeout(() => {
            isScrolling.current = false;
        }, 50);
    };

    // Date Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter tasks for current view (optional: currently showing all but positioning relative to month)
    // Or just show tasks that overlap with current month? For now, let's keep it simple and show all tasks in list,
    // but only render bars if they are in range.

    // Constants
    const DAY_WIDTH = 50; // pixels per day
    const HEADER_HEIGHT = 64; // h-16
    const ROW_HEIGHT = 56; // h-14

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    return (
        <div className="flex flex-col h-full w-full bg-background-dark text-gray-200 overflow-hidden rounded-lg border border-border-dark">
            {/* Toolbar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-dark bg-surface-dark flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-bold text-white">Project Timeline</h2>
                    <div className="flex items-center space-x-2 bg-background-dark rounded-md p-1 border border-border-dark">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-medium min-w-[100px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Actions placeholder */}
                    <button className="p-2 hover:bg-gray-700 rounded-full"><Search className="w-5 h-5 text-gray-400" /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Task List */}
                <div
                    className="w-80 bg-surface-dark border-r border-border-dark flex flex-col flex-shrink-0 z-10"
                >
                    <div className="h-12 border-b border-border-dark flex items-center px-4 bg-surface-dark">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Name</span>
                    </div>
                    <div
                        ref={sidebarRef}
                        onScroll={handleScroll('sidebar')}
                        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
                    >
                        {tasks.map((task) => (
                            <div key={task.id} className="h-14 flex items-center px-4 border-b border-white/5 hover:bg-gray-800 transition-colors">
                                <div className="flex items-center space-x-3 truncate">
                                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getTaskStatusColor(task.columnId))} />
                                    <span className="text-sm font-medium truncate text-gray-200">{task.title}</span>
                                </div>
                            </div>
                        ))}
                        {/* Empty spacer if needed */}
                        {tasks.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No tasks</div>}
                    </div>
                </div>

                {/* Main Content: Timeline */}
                <div className="flex-1 flex flex-col bg-background-dark min-w-0">

                    {/* Timeline Scroll Container */}
                    <div
                        className="flex-1 overflow-auto timeline-scroll relative"
                        ref={timelineRef}
                        onScroll={handleScroll('timeline')}
                    >
                        <div
                            className="h-full relative"
                            style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }}
                        >
                            {/* Header: Days */}
                            <div className="sticky top-0 z-20 flex bg-surface-dark border-b border-border-dark h-12">
                                {daysInMonth.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className="flex-shrink-0 border-r border-border-dark flex flex-col items-center justify-center text-xs text-gray-400"
                                        style={{ width: `${DAY_WIDTH}px` }}
                                    >
                                        <span className="font-medium">{format(day, 'd')}</span>
                                        <span className="text-[10px] text-gray-500">{format(day, 'EEE')}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Lines Background */}
                            <div className="absolute inset-0 top-12 flex pointer-events-none">
                                {daysInMonth.map((day) => (
                                    <div
                                        key={`grid-${day.toISOString()}`}
                                        className="flex-shrink-0 border-r border-border-dark/50 h-full"
                                        style={{ width: `${DAY_WIDTH}px` }}
                                    />
                                ))}
                            </div>

                            {/* Task Bars Content */}
                            <div className="relative pt-0">
                                {tasks.map((task) => {
                                    // Calculate position
                                    if (!task.startDate || !task.dueDate) return <div key={`bar-${task.id}`} className="h-14 border-b border-white/5" />; // Empty row placeholder

                                    const start = new Date(task.startDate);
                                    const end = new Date(task.dueDate);

                                    // Check overlap with current month
                                    if (end < monthStart || start > monthEnd) {
                                        return <div key={`bar-${task.id}`} className="h-14 border-b border-white/5" />; // Empty row, task out of range
                                    }

                                    // Clamp dates to current month view for display
                                    const displayStart = start < monthStart ? monthStart : start;
                                    const displayEnd = end > monthEnd ? monthEnd : end;

                                    const dayDiff = differenceInDays(displayStart, monthStart);
                                    const duration = differenceInDays(displayEnd, displayStart) + 1; // +1 to include at least one day or partial

                                    const left = dayDiff * DAY_WIDTH;
                                    const width = Math.max(duration * DAY_WIDTH, DAY_WIDTH); // Min 1 slot

                                    return (
                                        <div key={`bar-${task.id}`} className="h-14 relative w-full border-b border-white/5 group">
                                            <div
                                                className={cn(
                                                    "absolute top-2 h-10 rounded-lg flex items-center px-3 border border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-all",
                                                    "bg-task-blue/20 border-task-blue/50 text-task-blue" // Default style, can add logic for different colors
                                                )}
                                                style={{ left: `${left}px`, width: `${width}px` }}
                                            >
                                                <span className="text-xs font-medium truncate sticky left-0 px-1">{task.title}</span>

                                                {/* Assignee Avatar */}
                                                {task.assignee && (
                                                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 translate-x-full">
                                                        <Avatar className="h-6 w-6 border border-background-dark">
                                                            <AvatarImage src={task.assignee.avatarUrl || undefined} />
                                                            <AvatarFallback className="text-[10px] bg-indigo-900 text-white">
                                                                {task.assignee.name?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .timeline-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
                .timeline-scroll::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 4px; }
                .timeline-scroll::-webkit-scrollbar-track { background-color: #111827; }
            `}</style>
        </div>
    );
}
