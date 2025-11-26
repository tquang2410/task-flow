'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter, usePathname } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Priority } from "@prisma/client";
import { type TaskWithDetails } from "@/types/prisma";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskWithDetails;
}

const priorityStyles: Record<Priority, string> = {
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleCardClick = () => {
    router.push(`${pathname}?taskId=${task.id}`, { scroll: false });
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      suppressHydrationWarning={true}
      className={cn(
        "bg-card border-white/10 shadow-sm cursor-pointer active:cursor-grabbing hover:ring-2 hover:ring-dashboard-primary/50 transition-shadow",
        isDragging && "opacity-50 ring-2 ring-dashboard-primary"
      )}
    >
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium text-white">{task.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
          </span>
          <Badge
            variant="outline"
            className={`text-xs ${priorityStyles[task.priority]}`}
          >
            {task.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
