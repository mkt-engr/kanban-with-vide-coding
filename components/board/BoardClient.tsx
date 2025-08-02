"use client";

import { DraggableTask } from "@/components/dnd/DraggableTask";
import { DroppableColumn } from "@/components/dnd/DroppableColumn";
import { useBoardDragDrop } from "@/hooks/useBoardDragDrop";
import { type Board } from "@/models/board";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AddColumnButton } from "./AddColumnButton";

type BoardClientProps = {
  board: Board;
};

export const BoardClient = ({ board }: BoardClientProps) => {
  const {
    optimisticBoard,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeTask,
  } = useBoardDragDrop({ initialBoard: board });

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

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {optimisticBoard.columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <DroppableColumn column={column} />
            </div>
          ))}
          <div className="flex-shrink-0">
            <AddColumnButton boardId={optimisticBoard.id} />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <DraggableTask task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
