"use client";

import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { Task } from "@/models/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-background border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg border-primary" : ""
      }`}
    >
      <h3 className="font-medium mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-muted-foreground">
            {new Date(task.dueDate).toISOString().split("T")[0]}
          </span>
        )}
      </div>
    </div>
  );
};
