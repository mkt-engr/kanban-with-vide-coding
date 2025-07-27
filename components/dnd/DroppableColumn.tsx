"use client";

import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableTask } from "./DraggableTask";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  isCompleted: boolean;
};

type Column = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

type DroppableColumnProps = {
  column: Column;
};

export const DroppableColumn = ({ column }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`bg-card rounded-lg border p-4 min-h-[400px] transition-colors ${
        isOver ? "bg-accent/50 border-primary" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="font-semibold text-card-foreground">{column.title}</h2>
        <span className="text-sm text-muted-foreground">
          ({column.tasks.length})
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <DraggableTask key={task.id} task={task} />
          ))}
        </SortableContext>
        {isOver && column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-primary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">ここにドロップ</p>
          </div>
        )}
      </div>

      <AddTaskDialog columnId={column.id} />
    </div>
  );
};
