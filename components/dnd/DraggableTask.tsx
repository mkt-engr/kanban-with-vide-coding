"use client";

import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { type Task } from "@/models/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isTaskExpired, getExpiredDaysText, formatDueDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type DraggableTaskProps = {
  task: Task;
};

export const DraggableTask = ({ task }: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const isExpired = task.dueDate ? isTaskExpired(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-background border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg border-primary",
        isExpired && "border-red-500 border-2"
      )}
    >
      <h3 className="font-medium mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <div className="flex flex-col items-end gap-1">
            {isExpired && (
              <div className="flex items-center gap-1">
                <span>⚠️</span>
                <span className="text-red-500 font-medium text-xs">
                  {getExpiredDaysText(task.dueDate)}
                </span>
              </div>
            )}
            <span className={cn(
              "text-muted-foreground",
              isExpired && "text-red-500"
            )}>
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
