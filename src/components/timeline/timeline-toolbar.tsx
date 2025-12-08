"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ViewMode } from "gantt-task-react";

interface TimelineToolbarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function TimelineToolbar({
    viewMode,
    onViewModeChange,
}: TimelineToolbarProps) {
    return (
        <div className="flex items-center justify-between border-b bg-background/50 p-4 backdrop-blur-lg">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">
                    View Mode:
                </span>
                <Select
                    value={viewMode}
                    onValueChange={(value) => onViewModeChange(value as ViewMode)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select view mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ViewMode.Day}>Day</SelectItem>
                        <SelectItem value={ViewMode.Week}>Week</SelectItem>
                        <SelectItem value={ViewMode.Month}>Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
