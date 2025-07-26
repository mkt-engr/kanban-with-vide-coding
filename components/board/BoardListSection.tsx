import { getBoards } from "@/app/actions/board";
import { DataErrorBoundary } from "@/components/DataErrorBoundary";
import { Suspense } from "react";
import { BoardList } from "./BoardList";
import { BoardListLoading } from "./BoardListLoading";

const BoardListContent = async () => {
  const boards = await getBoards();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">マイボード</h2>
        <div className="text-sm text-muted-foreground">
          {boards.length}個のボード
        </div>
      </div>
      <BoardList boards={boards} />
    </>
  );
};

export const BoardListSection = () => {
  return (
    <DataErrorBoundary>
      <Suspense fallback={<BoardListLoading />}>
        <BoardListContent />
      </Suspense>
    </DataErrorBoundary>
  );
};
