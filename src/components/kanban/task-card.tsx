import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Task, Priority } from "@prisma/client";

interface TaskCardProps {
  task: Task;
}

const priorityStyles: Record<Priority, string> = {
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="bg-card border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-dashboard-primary/50 transition-shadow">
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
