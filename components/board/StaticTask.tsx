"use client";

import { PriorityBadge } from "@/components/ui/PriorityBadge";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  isCompleted: boolean;
};

type StaticTaskProps = {
  task: Task;
};

export const StaticTask = ({ task }: StaticTaskProps) => {
  return (
    <div className="bg-background border rounded-lg p-3 shadow-sm">
      <h3 className="font-medium mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-muted-foreground">
            {new Date(task.dueDate).toISOString().split('T')[0]}
          </span>
        )}
      </div>
    </div>
  );
};