"use client";

import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { type Column } from "@/models/column";
import { useDroppable } from "@dnd-kit/core";
import { countExpiredTasks } from "@/lib/dateUtils";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableTask } from "./DraggableTask";

type DroppableColumnProps = {
  column: Column;
};

export const DroppableColumn = ({ column }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);
  const expiredCount = countExpiredTasks(column.tasks);

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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            ({column.tasks.length})
          </span>
          {expiredCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              期限切れ {expiredCount}
            </span>
          )}
        </div>
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
