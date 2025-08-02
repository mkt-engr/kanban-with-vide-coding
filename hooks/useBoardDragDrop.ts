import { moveTask } from "@/app/actions/board";
import { type Board } from "@/models/board";
import { type Column } from "@/models/column";
import { type Task } from "@/models/task";
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useOptimistic, useState, useTransition } from "react";

type UseBoardDragDropProps = {
  initialBoard: Board;
};

type UseBoardDragDropReturn = {
  optimisticBoard: Board;
  activeId: string | null;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  activeTask: Task | null;
};

export const useBoardDragDrop = ({
  initialBoard,
}: UseBoardDragDropProps): UseBoardDragDropReturn => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticBoard, updateOptimisticBoard] = useOptimistic(
    initialBoard,
    (
      state,
      action: {
        type: "moveTask";
        taskId: string;
        destinationColumnId: string;
        newPosition: number;
      }
    ) => {
      if (action.type === "moveTask") {
        const { taskId, destinationColumnId, newPosition } = action;

        let task: Task | null = null;
        let sourceColumnId: string | null = null;

        for (const column of state.columns) {
          const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            task = column.tasks[taskIndex];
            sourceColumnId = column.id;
            break;
          }
        }

        if (!task || !sourceColumnId) return state;

        const newColumns = state.columns.map((column) => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((t) => t.id !== taskId),
            };
          }

          if (column.id === destinationColumnId) {
            const newTasks = [...column.tasks];
            newTasks.splice(newPosition, 0, { ...task, position: newPosition });
            return {
              ...column,
              tasks: newTasks.map((t, index) => ({ ...t, position: index })),
            };
          }

          return column;
        });

        return { ...state, columns: newColumns };
      }

      return state;
    }
  );

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

    const activeTaskId = active.id.toString();
    const overId = over.id.toString();

    let sourceColumn: Column | null = null;
    let destinationColumn: Column | null = null;
    let task: Task | null = null;

    // Find source column and task
    for (const column of optimisticBoard.columns) {
      const taskIndex = column.tasks.findIndex((t) => t.id === activeTaskId);
      if (taskIndex !== -1) {
        task = column.tasks[taskIndex];
        sourceColumn = column;
        break;
      }
    }

    // Find destination column
    for (const column of optimisticBoard.columns) {
      if (column.id === overId) {
        destinationColumn = column;
        break;
      }

      const taskIndex = column.tasks.findIndex((t) => t.id === overId);
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
      // 同一カラム内での移動
      const oldIndex = sourceColumn.tasks.findIndex(
        (t) => t.id === activeTaskId
      );

      if (overId === destinationColumn.id) {
        // カラム自体にドロップ（最後に移動）
        newPosition = destinationColumn.tasks.length - 1;
      } else {
        // 他のタスクの上にドロップ
        const overTaskIndex = destinationColumn.tasks.findIndex(
          (t) => t.id === overId
        );
        if (overTaskIndex !== -1) {
          // 移動するタスクを除いた配列での位置を計算
          newPosition =
            overTaskIndex > oldIndex ? overTaskIndex - 1 : overTaskIndex;
        } else {
          newPosition = destinationColumn.tasks.length - 1;
        }
      }
    } else {
      // 異なるカラム間での移動
      if (overId === destinationColumn.id) {
        // カラム自体にドロップ（最後に追加）
        newPosition = destinationColumn.tasks.length;
      } else {
        // 他のタスクの上にドロップ
        const overTaskIndex = destinationColumn.tasks.findIndex(
          (t) => t.id === overId
        );
        newPosition =
          overTaskIndex !== -1 ? overTaskIndex : destinationColumn.tasks.length;
      }
    }

    if (
      sourceColumn.id !== destinationColumn.id ||
      task.position !== newPosition
    ) {
      startTransition(async () => {
        updateOptimisticBoard({
          type: "moveTask",
          taskId: activeTaskId,
          destinationColumnId: destinationColumn.id,
          newPosition,
        });

        const formData = new FormData();
        formData.append("taskId", activeTaskId);
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
    ? (optimisticBoard.columns
        .flatMap((column) => column.tasks)
        .find((task) => task.id === activeId) ?? null)
    : null;

  return {
    optimisticBoard,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeTask,
  };
};
