"use client";

import { DroppableColumn } from "@/components/dnd/DroppableColumn";
import { moveTask } from "@/app/actions/board";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition, useEffect } from "react";
import { DraggableTask } from "@/components/dnd/DraggableTask";
import { StaticColumn } from "./StaticColumn";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  isCompleted: boolean;
  position: number;
};

type Column = {
  id: string;
  title: string;
  color: string;
  position: number;
  tasks: Task[];
};

type Board = {
  id: string;
  title: string;
  description: string | null;
  columns: Column[];
};

type BoardClientProps = {
  board: Board;
};

export const BoardClient = ({ board }: BoardClientProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);
  const [optimisticBoard, updateOptimisticBoard] = useOptimistic(
    board,
    (state, action: { type: "moveTask"; taskId: string; destinationColumnId: string; newPosition: number }) => {
      if (action.type === "moveTask") {
        const { taskId, destinationColumnId, newPosition } = action;
        
        let task: Task | null = null;
        let sourceColumnId: string | null = null;
        
        for (const column of state.columns) {
          const taskIndex = column.tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            task = column.tasks[taskIndex];
            sourceColumnId = column.id;
            break;
          }
        }
        
        if (!task || !sourceColumnId) return state;
        
        const newColumns = state.columns.map(column => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter(t => t.id !== taskId)
            };
          }
          
          if (column.id === destinationColumnId) {
            const newTasks = [...column.tasks];
            newTasks.splice(newPosition, 0, { ...task, position: newPosition });
            return {
              ...column,
              tasks: newTasks.map((t, index) => ({ ...t, position: index }))
            };
          }
          
          return column;
        });
        
        return { ...state, columns: newColumns };
      }
      
      return state;
    }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    let sourceColumn: Column | null = null;
    let destinationColumn: Column | null = null;
    let task: Task | null = null;

    for (const column of optimisticBoard.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === activeId);
      if (taskIndex !== -1) {
        task = column.tasks[taskIndex];
        sourceColumn = column;
        break;
      }
    }

    for (const column of optimisticBoard.columns) {
      if (column.id === overId) {
        destinationColumn = column;
        break;
      }
      
      const taskIndex = column.tasks.findIndex(t => t.id === overId);
      if (taskIndex !== -1) {
        destinationColumn = column;
        break;
      }
    }

    if (!task || !sourceColumn || !destinationColumn) {
      setActiveId(null);
      return;
    }

    let newPosition = 0;
    
    if (sourceColumn.id === destinationColumn.id) {
      const oldIndex = sourceColumn.tasks.findIndex(t => t.id === activeId);
      const newIndex = destinationColumn.tasks.findIndex(t => t.id === overId);
      
      if (oldIndex !== newIndex && newIndex !== -1) {
        newPosition = newIndex;
      } else {
        newPosition = destinationColumn.tasks.length;
      }
    } else {
      const overTaskIndex = destinationColumn.tasks.findIndex(t => t.id === overId);
      newPosition = overTaskIndex !== -1 ? overTaskIndex : destinationColumn.tasks.length;
    }

    if (sourceColumn.id !== destinationColumn.id || task.position !== newPosition) {
      startTransition(async () => {
        updateOptimisticBoard({
          type: "moveTask",
          taskId: activeId,
          destinationColumnId: destinationColumn.id,
          newPosition
        });

        const formData = new FormData();
        formData.append("taskId", activeId);
        formData.append("destinationColumnId", destinationColumn.id);
        formData.append("newPosition", newPosition.toString());
        
        try {
          await moveTask(formData);
        } catch (error) {
          console.error("タスクの移動に失敗しました:", error);
        }
      });
    }

    setActiveId(null);
  };

  const activeTask = activeId 
    ? optimisticBoard.columns
        .flatMap(column => column.tasks)
        .find(task => task.id === activeId)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>ボード一覧に戻る</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {optimisticBoard.title}
        </h1>
        {optimisticBoard.description && (
          <p className="text-muted-foreground">{optimisticBoard.description}</p>
        )}
      </div>

      {isClient ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {optimisticBoard.columns.map((column) => (
              <DroppableColumn key={column.id} column={column} />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask ? <DraggableTask task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {board.columns.map((column) => (
            <StaticColumn key={column.id} column={column} />
          ))}
        </div>
      )}
    </div>
  );
};