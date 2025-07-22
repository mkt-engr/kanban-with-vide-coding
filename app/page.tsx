import { CreateBoardDialog } from "@/components/board/CreateBoardDialog";
import { BoardList } from "@/components/board/BoardList";
import { getBoards } from "@/app/actions/board";

export default async function Home() {
  const boards = await getBoards();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Kanban Board
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            プロジェクトを効率的に管理しましょう
          </p>
          <CreateBoardDialog />
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              マイボード
            </h2>
            <div className="text-sm text-muted-foreground">
              {boards.length}個のボード
            </div>
          </div>
          <BoardList boards={boards} />
        </div>
      </div>
    </div>
  );
}
