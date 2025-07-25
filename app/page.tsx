import { CreateBoardDialog } from '@/components/board/CreateBoardDialog'
import { BoardListSection } from '@/components/board/BoardListSection'

export default function Home() {
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
          <BoardListSection />
        </div>
      </div>
    </div>
  )
}
