"use client";

import { useState, useMemo } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./gantt-dark.css";
import { TaskWithDetails } from "@/types/prisma";
import { TimelineToolbar } from "./timeline-toolbar";
import { updateTask } from "@/app/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface TimelineViewProps {
    tasks: TaskWithDetails[];
    onUpdate: () => Promise<void>;
}

export function TimelineView({ tasks, onUpdate }: TimelineViewProps) {
    // Default to Week for better overview
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

    // Filter: Only show tasks with at least startDate OR dueDate
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => task.startDate || task.dueDate);
    }, [tasks]);

    const ganttTasks: GanttTask[] = useMemo(() => {
        return filteredTasks.map((task) => {
            // Logic xử lý Null:
            // 1. Nếu thiếu startDate -> dùng dueDate - 1 hour
            // 2. Nếu thiếu dueDate -> dùng startDate + 1 hour
            let startDate: Date;
            let endDate: Date;

            if (task.startDate && task.dueDate) {
                startDate = new Date(task.startDate);
                endDate = new Date(task.dueDate);
            } else if (task.startDate) {
                startDate = new Date(task.startDate);
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
            } else if (task.dueDate) {
                endDate = new Date(task.dueDate);
                startDate = new Date(endDate.getTime() - 60 * 60 * 1000); // -1 hour
            } else {
                // Fallback (should not happen due to filter)
                const now = new Date();
                startDate = now;
                endDate = new Date(now.getTime() + 60 * 60 * 1000);
            }

            // Ensure endDate is after startDate
            if (endDate <= startDate) {
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }

            return {
                start: startDate,
                end: endDate,
                name: task.title,
                id: task.id,
                type: "task" as const,
                progress: 0,
                isDisabled: false,
                styles: {
                    progressColor: "#463df5", // Purple
                    progressSelectedColor: "#5b50f7",
                    backgroundColor: "rgba(70, 61, 245, 0.3)", // 30% opacity purple
                    backgroundSelectedColor: "rgba(70, 61, 245, 0.5)",
                },
                // Store original task for tooltip
                project: task.assignee?.name || "Unassigned",
            };
        });
    }, [filteredTasks]);

    const handleTaskChange = async (task: GanttTask) => {
        try {
            await updateTask({
                id: task.id,
                startDate: task.start,
                dueDate: task.end,
            });
            toast.success("Task updated");
            onUpdate();
        } catch (error) {
            toast.error("Failed to update task");
            console.error(error);
        }
    };

    const handleDateChange = async (task: GanttTask) => {
        // This is called when dragging/resizing ends
        await handleTaskChange(task);
    };

    // Custom Tooltip Component
    const CustomTooltip = ({ task }: { task: GanttTask }) => {
        const originalTask = filteredTasks.find(t => t.id === task.id);

        return (
            <div className="bg-slate-900 border border-white/10 rounded-lg p-3 shadow-xl min-w-[200px]">
                <div className="font-bold text-white mb-2">{task.name}</div>
                <div className="text-sm text-slate-300 space-y-1">
                    <div>
                        <span className="text-slate-400">Start:</span> {format(task.start, "PPP")}
                    </div>
                    <div>
                        <span className="text-slate-400">End:</span> {format(task.end, "PPP")}
                    </div>
                    {originalTask?.assignee && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={originalTask.assignee.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                    {originalTask.assignee.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{originalTask.assignee.name}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Dynamic column width based on view mode
    const getColumnWidth = () => {
        switch (viewMode) {
            case ViewMode.Day:
                return 60;
            case ViewMode.Week:
                return 250;
            case ViewMode.Month:
                return 300;
            default:
                return 200;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-dashboard-card rounded-lg border border-white/10 overflow-hidden">
            <TimelineToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
            <div className="flex-1 overflow-auto gantt-dark-mode">
                {ganttTasks.length > 0 ? (
                    <Gantt
                        tasks={ganttTasks}
                        viewMode={viewMode}
                        onDateChange={handleDateChange}
                        onProgressChange={() => { }}
                        onDoubleClick={() => { }}
                        listCellWidth="200px"
                        columnWidth={getColumnWidth()}
                        barFill={60}
                        TooltipContent={CustomTooltip}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        {tasks.length === 0
                            ? "No tasks found. Create some tasks in Kanban board first."
                            : "No tasks with dates. Add Start Date or Due Date to tasks to see them here."}
                    </div>
                )}
            </div>
            <style jsx global>{`
                .gantt-dark-mode {
                    --gantt-background: #0B0D12;
                    --gantt-text: #ffffff;
                    --gantt-border: rgba(255, 255, 255, 0.1);
                }
                
                .gantt-dark-mode .gantt-container {
                    background: var(--gantt-background);
                    color: var(--gantt-text);
                }
                
                .gantt-dark-mode .gantt-table {
                    background: var(--gantt-background);
                    border-color: var(--gantt-border);
                }
                
                .gantt-dark-mode .gantt-table-header {
                    background: rgba(30, 41, 59, 0.5);
                    color: var(--gantt-text);
                }
                
                .gantt-dark-mode .gantt-table-row {
                    border-color: var(--gantt-border);
                }
                
                .gantt-dark-mode .gantt-calendar {
                    background: var(--gantt-background);
                }
                
                .gantt-dark-mode .gantt-calendar-header {
                    background: rgba(30, 41, 59, 0.5);
                    color: var(--gantt-text);
                    border-color: var(--gantt-border);
                }
                
                .gantt-dark-mode .gantt-calendar-row {
                    border-color: var(--gantt-border);
                }
                
                /* Task list styling */
                .gantt-dark-mode .gantt-task-list-header {
                    background: rgba(30, 41, 59, 0.5);
                    color: var(--gantt-text);
                    font-weight: 600;
                }
                
                .gantt-dark-mode .gantt-task-list-row {
                    color: var(--gantt-text);
                    border-color: var(--gantt-border);
                }
                
                .gantt-dark-mode .gantt-task-list-cell {
                    color: var(--gantt-text);
                }
                
                /* Vertical grid lines */
                .gantt-dark-mode .gantt-vertical-line {
                    stroke: var(--gantt-border);
                }
                
                /* Today marker */
                .gantt-dark-mode .gantt-today-line {
                    stroke: #463df5;
                    stroke-width: 2;
                }
            `}</style>
        </div>
    );
}
