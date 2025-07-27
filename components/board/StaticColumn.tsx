"use client";

import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { StaticTask } from "./StaticTask";
import { type Task } from "@/models/task";
import { type Column } from "@/models/column";

type StaticColumnProps = {
  column: Column;
};

export const StaticColumn = ({ column }: StaticColumnProps) => {
  return (
    <div className="bg-card rounded-lg border p-4 min-h-[400px]">
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
        {column.tasks.map((task) => (
          <StaticTask key={task.id} task={task} />
        ))}
      </div>

      <AddTaskDialog columnId={column.id} />
    </div>
  );
};
