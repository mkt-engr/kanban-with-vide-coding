"use client";

import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { type Task } from "@/models/task";
import { isTaskExpired, getExpiredDaysText, formatDueDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type StaticTaskProps = {
  task: Task;
};

export const StaticTask = ({ task }: StaticTaskProps) => {
  const isExpired = task.dueDate ? isTaskExpired(task.dueDate) : false;
  
  return (
    <div className={cn(
      "bg-background border rounded-lg p-3 shadow-sm",
      isExpired && "border-red-500 border-2"
    )}>
      <h3 className="font-medium mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <div className="flex items-center gap-1">
            {isExpired && <span>⚠️</span>}
            <span className={cn(
              "text-muted-foreground",
              isExpired && "text-red-500 font-medium"
            )}>
              {isExpired ? getExpiredDaysText(task.dueDate) : formatDueDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
