'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Plus,
    Search,
    Settings,
    Smartphone,
    MonitorSmartphone,
    ArrowLeft,
    ArrowRight,
    Folder,
    Bug,
    Code,
    Layout,
    ClipboardCheck,
    Circle
} from 'lucide-react'
import {
    addDays,
    addMonths,
    differenceInDays,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isWeekend,
    startOfMonth,
    subMonths
} from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TaskWithDetails } from '@/types/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskDetailSheet } from '@/components/kanban/task-detail-sheet'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateTaskSchema } from '@/lib/schemas'
import { createTask, updateTask } from '@/app/actions'

// =================================================================
// 🧠 LOGIC VÀ CÁC HÀM HELPERS
// =================================================================

const DAY_WIDTH_PX = 56; // Mỗi ngày rộng 56px
const ROW_HEIGHT_PX = 56; // Mỗi hàng cao 56px (h-14)

/**
 * Lấy ra màu sắc tương ứng với độ ưu tiên của task
 * @param priority Độ ưu tiên của task (HIGH, MEDIUM, LOW)
 * @returns Object chứa các class của Tailwind
 */
const getTaskColorStyle = (priority: string | null) => {
    switch (priority) {
        case 'HIGH':
            return {
                bg: 'bg-task-orange/20',
                border: 'border-task-orange',
                text: 'text-task-orange',
                iconBg: 'bg-task-orange',
            };
        case 'MEDIUM':
            return {
                bg: 'bg-task-blue/20',
                border: 'border-task-blue',
                text: 'text-task-blue',
                iconBg: 'bg-task-blue',
            };
        case 'LOW':
            return {
                bg: 'bg-task-green/20',
                border: 'border-task-green',
                text: 'text-task-green',
                iconBg: 'bg-task-green',
            };
        default: // Mặc định nếu priority null
            return {
                bg: 'bg-task-purple/20',
                border: 'border-task-purple',
                text: 'text-task-purple',
                iconBg: 'bg-task-purple',
            };
    }
};

/**
 * Lấy ra icon phù hợp dựa trên từ khóa trong title của task
 * @param title Tên của task
 * @returns React component icon
 */
const getTaskIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();

    // Research & Analysis
    if (lowerTitle.includes('research') || lowerTitle.includes('analysis')) {
        return Search;
    }

    // Design & UI/UX
    if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
        return Layout;
    }

    // Mobile & App
    if (lowerTitle.includes('mobile') || lowerTitle.includes('app')) {
        return Smartphone;
    }

    // Bug & Fix
    if (lowerTitle.includes('bug') || lowerTitle.includes('fix') || lowerTitle.includes('error')) {
        return Bug;
    }

    // Development & Backend
    if (lowerTitle.includes('dev') || lowerTitle.includes('api') || lowerTitle.includes('backend')) {
        return Code;
    }

    // Testing & QA
    if (lowerTitle.includes('test') || lowerTitle.includes('qa')) {
        return ClipboardCheck;
    }

    // Default
    return Circle;
};


// =================================================================
// 🎨 COMPONENT CHÍNH
// =================================================================

interface CustomGanttProps {
    tasks: TaskWithDetails[];
    projectId: string;
    columns: { id: string; title: string; order: number }[];
    members: Array<{
        id: string;
        supabaseId: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
        workspaceIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    currentUser: {
        id: string;
        supabaseId: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
        workspaceIds: string[];
        createdAt: Date;
        updatedAt: Date;
    };
}

export function CustomGantt({ tasks, projectId, columns, members, currentUser }: CustomGanttProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
    const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Resize state
    const [resizingTask, setResizingTask] = useState<{
        id: string;
        direction: 'left' | 'right';
        initialX: number;
        initialStartDate: Date;
        initialDueDate: Date;
        originalTask: TaskWithDetails;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentMouseX, setCurrentMouseX] = useState<number>(0);
    const [justFinishedResizing, setJustFinishedResizing] = useState(false);

    const ganttContainerRef = useRef<HTMLDivElement>(null);
    const activityListRef = useRef<HTMLDivElement>(null);

    // Form setup for creating new task
    const createForm = useForm<z.infer<typeof CreateTaskSchema>>({
        resolver: zodResolver(CreateTaskSchema),
        defaultValues: {
            title: '',
            projectId: projectId,
            columnId: columns[0]?.id || '',
        },
    });

    // Handler for creating new task
    async function handleCreateTask(values: z.infer<typeof CreateTaskSchema>) {
        const result = await createTask(values);
        if (result.status === 'success') {
            toast.success('Task created successfully');
            setIsCreateDialogOpen(false);
            createForm.reset();
            // Refresh page to show new task
            window.location.reload();
        } else {
            toast.error(result.message);
        }
    }

    // Resize handlers
    function handleResizeStart(
        e: React.MouseEvent,
        task: TaskWithDetails,
        direction: 'left' | 'right'
    ) {
        e.stopPropagation(); // Prevent TaskDetailSheet from opening

        const startDate = task.startDate || task.createdAt;
        const dueDate = task.dueDate || addDays(startDate, 2);

        setResizingTask({
            id: task.id,
            direction,
            initialX: e.clientX,
            initialStartDate: startDate,
            initialDueDate: dueDate,
            originalTask: task,
        });
        setIsDragging(false);
    }

    async function handleResizeEnd(e: MouseEvent) {
        if (!resizingTask) return;

        if (!isDragging) {
            // No drag occurred, just a click
            setResizingTask(null);
            return;
        }

        // Set flag to prevent onClick from triggering
        setJustFinishedResizing(true);
        setTimeout(() => setJustFinishedResizing(false), 300);

        // Calculate final dates
        const deltaX = e.clientX - resizingTask.initialX;
        const deltaDays = Math.round(deltaX / DAY_WIDTH_PX);

        if (deltaDays === 0) {
            setResizingTask(null);
            setIsDragging(false);
            return;
        }

        let newStartDate = resizingTask.initialStartDate;
        let newDueDate = resizingTask.initialDueDate;

        if (resizingTask.direction === 'left') {
            newStartDate = addDays(resizingTask.initialStartDate, deltaDays);
            // Prevent start date from being after due date
            if (newStartDate >= newDueDate) {
                newStartDate = addDays(newDueDate, -1);
            }
        } else {
            newDueDate = addDays(resizingTask.initialDueDate, deltaDays);
            // Prevent due date from being before start date
            if (newDueDate <= newStartDate) {
                newDueDate = addDays(newStartDate, 1);
            }
        }

        // Save to server
        toast.promise(
            updateTask({
                id: resizingTask.id,
                startDate: newStartDate,
                dueDate: newDueDate,
            }),
            {
                loading: 'Updating task dates...',
                success: (result: any) => {
                    if (result.status === 'success') {
                        // Refresh to show updated task
                        window.location.reload();
                        return 'Task dates updated successfully';
                    } else {
                        throw new Error(result.message);
                    }
                },
                error: (err: any) => err.message || 'Failed to update task dates',
            }
        );

        setResizingTask(null);
        setIsDragging(false);
    }

    // Global mouse event listeners for resize
    useEffect(() => {
        if (!resizingTask) return;

        const handleMouseMove = (e: MouseEvent) => {
            setIsDragging(true);
            setCurrentMouseX(e.clientX);
        };

        const handleMouseUp = (e: MouseEvent) => {
            handleResizeEnd(e);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingTask, isDragging]);

    // --- Date Logic ---
    const startOfMonthDate = useMemo(() => startOfMonth(currentDate), [currentDate]);
    const endOfMonthDate = useMemo(() => endOfMonth(currentDate), [currentDate]);
    const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate }), [startOfMonthDate, endOfMonthDate]);
    const totalDaysInMonth = daysInMonth.length;

    // --- Scroll Sync Logic ---
    const handleGanttScroll = () => {
        if (ganttContainerRef.current && activityListRef.current) {
            activityListRef.current.scrollTop = ganttContainerRef.current.scrollTop;
        }
    };

    // Scroll tới ngày hôm nay khi component mount lần đầu
    useEffect(() => {
        if (ganttContainerRef.current) {
            const today = new Date();
            if (today >= startOfMonthDate && today <= endOfMonthDate) {
                const dayDiff = differenceInDays(today, startOfMonthDate);
                // Scroll tới giữa màn hình
                ganttContainerRef.current.scrollLeft = (dayDiff * DAY_WIDTH_PX) - (ganttContainerRef.current.clientWidth / 2) + (DAY_WIDTH_PX / 2);
            }
        }
    }, [startOfMonthDate, endOfMonthDate]);


    // --- Handlers ---
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // --- Task bar calculation ---
    const calculateTaskStyle = (task: TaskWithDetails) => {
        const startDate = task.startDate ?? task.createdAt;
        const dueDate = task.dueDate ?? addDays(startDate, 2);

        // Tính số ngày lệch so với ngày đầu tháng
        const dayDiff = differenceInDays(startDate, startOfMonthDate);
        // Tính độ dài (số ngày) của task
        const duration = differenceInDays(dueDate, startDate) + 1; // +1 để bao gồm cả ngày kết thúc

        const left = dayDiff * DAY_WIDTH_PX;
        const width = duration * DAY_WIDTH_PX;

        return { left: `${left}px`, width: `${width}px` };
    };

    // Calculate preview style when resizing
    const calculateResizePreviewStyle = (task: TaskWithDetails) => {
        if (!resizingTask || resizingTask.id !== task.id || !isDragging) {
            return calculateTaskStyle(task);
        }

        const deltaX = currentMouseX - resizingTask.initialX;
        const deltaDays = Math.round(deltaX / DAY_WIDTH_PX);

        let previewStartDate = resizingTask.initialStartDate;
        let previewDueDate = resizingTask.initialDueDate;

        if (resizingTask.direction === 'left') {
            previewStartDate = addDays(resizingTask.initialStartDate, deltaDays);
            if (previewStartDate >= previewDueDate) {
                previewStartDate = addDays(previewDueDate, -1);
            }
        } else {
            previewDueDate = addDays(resizingTask.initialDueDate, deltaDays);
            if (previewDueDate <= previewStartDate) {
                previewDueDate = addDays(previewStartDate, 1);
            }
        }

        const dayDiff = differenceInDays(previewStartDate, startOfMonthDate);
        const duration = differenceInDays(previewDueDate, previewStartDate) + 1;

        const left = dayDiff * DAY_WIDTH_PX;
        const width = duration * DAY_WIDTH_PX;

        return { left: `${left}px`, width: `${width}px` };
    };

    return (
        <div
            className="flex flex-col h-full w-full bg-gantt-bg-dark text-gray-200 overflow-hidden rounded-lg border border-gantt-border-dark font-sans">

            {/* --- HEADER --- */}
            <header
                className="h-16 bg-gantt-surface-dark border-b border-gantt-border-dark flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div
                        className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 shadow-sm">
                        <Calendar className="text-gray-400 w-4 h-4 mr-2" />
                        <span className="text-sm font-medium text-gray-200">{format(currentDate, 'MMMM yyyy')}</span>
                    </div>
                </div>
                <div className="flex items-center text-sm font-medium text-gray-300">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-700 rounded"><ChevronLeft
                        className="w-4 h-4" /></button>
                    <span className="mx-3">{format(new Date(), 'dd MMMM')}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-700 rounded"><ChevronRight
                        className="w-4 h-4" /></button>
                </div>
            </header>

            {/* --- BODY --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT SIDEBAR: Activity List */}
                <div className="w-64 bg-gantt-surface-dark border-r border-gantt-border-dark flex flex-col flex-shrink-0 z-10">
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-bold text-white">Activity List</h2>
                    </div>

                    {/* Container này sẽ ẩn scrollbar và được điều khiển bởi grid bên phải */}
                    <div ref={activityListRef} className="flex-1 overflow-y-hidden px-4 pb-4 space-y-1 mt-6">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className={`group flex items-center p-3 rounded-lg cursor-pointer h-14 transition-colors ${selectedTask?.id === task.id ? 'bg-gray-800/50 border border-gray-700' : 'hover:bg-gray-800'}`}
                            >
                                <Search className="text-gray-400 mr-3 w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{task.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gantt-border-dark">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="w-full bg-gantt-primary hover:bg-opacity-90 text-white rounded-lg py-3 px-4 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!columns[0]?.id}
                                    title={!columns[0]?.id ? "No columns available" : "Add new task to first column"}
                                >
                                    <Plus className="mr-2 w-4 h-4" />
                                    <span className="text-sm font-medium">Add New Activity</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Create a new task</DialogTitle>
                                </DialogHeader>
                                <Form {...createForm}>
                                    <form onSubmit={createForm.handleSubmit(handleCreateTask)} className="space-y-4">
                                        <FormField
                                            control={createForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter task title..."
                                                            {...field}
                                                            className="bg-slate-800 border-slate-700 text-white"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full bg-gantt-primary hover:bg-opacity-90 text-white"
                                            disabled={createForm.formState.isSubmitting}
                                        >
                                            {createForm.formState.isSubmitting ? 'Creating...' : 'Create Task'}
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* RIGHT CONTENT: Timeline Grid */}
                <div className="flex-1 flex flex-col bg-gantt-bg-dark min-w-0">
                    <div
                        id="gantt-container"
                        ref={ganttContainerRef}
                        onScroll={handleGanttScroll}
                        className="flex-1 overflow-auto relative"
                    >
                        <div style={{ width: `${totalDaysInMonth * DAY_WIDTH_PX}px`, minHeight: '100%' }} className="relative h-full">

                            {/* --- Grid Columns (Days) --- */}
                            <div className="absolute inset-0 flex">
                                {daysInMonth.map(day => (
                                    <div
                                        key={day.toString()}
                                        style={{ minWidth: `${DAY_WIDTH_PX}px` }}
                                        className={`border-r border-gantt-border-dark flex flex-col group ${isWeekend(day) ? 'bg-gray-800/20' : ''}`}
                                    >
                                        <div
                                            className={`h-12 border-b border-gantt-border-dark flex items-center justify-center text-xs group-hover:bg-gray-800 ${isSameDay(day, new Date()) ? 'bg-gantt-primary text-white font-semibold rounded-t-sm relative' : 'text-gray-400 bg-gantt-surface-dark'}`}>
                                            <span className="uppercase">{format(day, 'EEEEEE')}</span>
                                            <span className="ml-1.5">{format(day, 'd')}</span>
                                            {isSameDay(day, new Date()) && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gantt-primary rotate-45"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Đường line chỉ ngày hiện tại */}
                                {new Date() >= startOfMonthDate && new Date() <= endOfMonthDate && (
                                    <div
                                        className="absolute top-0 bottom-0 border-l-2 border-gantt-accent-pink z-20"
                                        style={{ left: `${differenceInDays(new Date(), startOfMonthDate) * DAY_WIDTH_PX + (DAY_WIDTH_PX / 2) - 1}px`, height: '100%' }}
                                    >
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gantt-accent-pink rounded-full"></div>
                                    </div>
                                )}
                            </div>


                            {/* --- Grid Rows (Tasks) --- */}
                            <div className="absolute inset-0 top-12">
                                {tasks.map((_, index) => (
                                    <div
                                        key={`row-${index}`}
                                        className="h-14 w-full border-b border-gantt-border-dark"
                                        style={{ top: `${index * ROW_HEIGHT_PX}px` }}
                                    />
                                ))}
                            </div>


                            {/* --- TASK BARS LAYER --- */}
                            <div className="absolute inset-0 top-12 pt-2">
                                {tasks
                                    .filter(task => {
                                        // Filter out tasks that are outside current month view
                                        const startDate = task.startDate ?? task.createdAt;
                                        const dueDate = task.dueDate ?? addDays(startDate, 2);
                                        return !(dueDate < startOfMonthDate || startDate > endOfMonthDate);
                                    })
                                    .map((task, index) => {
                                        const style = calculateResizePreviewStyle(task);
                                        const colors = getTaskColorStyle(task.priority);
                                        const TaskIcon = getTaskIcon(task.title);
                                        const isBeingResized = resizingTask?.id === task.id && isDragging;

                                        return (
                                            <div
                                                key={task.id}
                                                className="h-14 relative w-full"
                                                style={{ top: `${index * ROW_HEIGHT_PX}px` }}
                                            >
                                                <div
                                                    className={`absolute h-10 top-2 ${colors.bg} rounded-lg flex items-center px-3 border-2 ${colors.border} hover:shadow-lg transition-all cursor-pointer relative ${isBeingResized ? 'opacity-70 blur-[1px]' : ''}`}
                                                    style={style}
                                                    onClick={(e) => {
                                                        if (isDragging || justFinishedResizing) {
                                                            e.stopPropagation();
                                                            return;
                                                        }
                                                        setSelectedTask(task);
                                                        setIsTaskDetailOpen(true);
                                                    }}
                                                >
                                                    {/* Left Resize Handle */}
                                                    <div
                                                        className="cursor-w-resize absolute left-0 top-0 bottom-0 w-2 z-10 hover:bg-white/20 rounded-l-lg"
                                                        onMouseDown={(e) => handleResizeStart(e, task, 'left')}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    <div className={`${colors.iconBg} p-1 rounded mr-2 flex items-center justify-center h-6 w-6`}>
                                                        <ArrowLeft className="w-3 h-3 text-white" />
                                                    </div>
                                                    <TaskIcon className={`${colors.text} mr-2 w-4 h-4 flex-shrink-0`} />
                                                    <span
                                                        className={`text-xs font-medium ${colors.text} truncate`}>{task.title}</span>

                                                    {/* Right Resize Handle */}
                                                    <div
                                                        className="cursor-e-resize absolute right-0 top-0 bottom-0 w-2 z-10 hover:bg-white/20 rounded-r-lg"
                                                        onMouseDown={(e) => handleResizeStart(e, task, 'right')}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>

                                                {/* Avatars - Positioned outside task bar */}
                                                {task.assignee && (
                                                    <div
                                                        className="absolute top-1/2 transform -translate-y-1/2 flex -space-x-2"
                                                        style={{
                                                            left: `calc(${style.left} + ${style.width} + 8px)`
                                                        }}
                                                    >
                                                        <Avatar className="w-7 h-7 border-2 border-gantt-bg-dark">
                                                            <AvatarImage src={task.assignee.avatarUrl || ''} />
                                                            <AvatarFallback className="bg-slate-700 text-xs">
                                                                {task.assignee.name?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 flex space-x-2 z-50">
                <button className="h-12 w-12 bg-task-orange hover:bg-orange-500 text-white rounded-lg shadow-xl flex items-center justify-center transition-all">
                    <ArrowRight className="w-6 h-6" />
                </button>
                <button className="h-12 w-12 bg-task-orange/70 hover:bg-task-orange text-white rounded-lg shadow-xl flex items-center justify-center transition-all">
                    <Folder className="w-6 h-6" />
                </button>
            </div>

            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }

              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }

              #gantt-container::-webkit-scrollbar {
                height: 8px;
                width: 8px;
              }

              #gantt-container::-webkit-scrollbar-thumb {
                background-color: #4B5563;
                border-radius: 4px;
              }

              #gantt-container::-webkit-scrollbar-track {
                background: transparent;
              }
            `}</style>

            {/* Task Detail Sheet */}
            {selectedTask && (
                <TaskDetailSheet
                    task={selectedTask}
                    isOpen={isTaskDetailOpen}
                    onClose={() => setIsTaskDetailOpen(false)}
                    currentUser={currentUser}
                    members={members}
                />
            )}
        </div>
    );
}