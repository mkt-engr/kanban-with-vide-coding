import { CreateBoardDialog } from "@/components/board/create-board-dialog";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Kanban Board
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            プロジェクトを効率的に管理しましょう
          </p>
          <CreateBoardDialog />
        </div>
      </div>
    </div>
  );
}
