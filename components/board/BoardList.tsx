import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Board = {
  id: string
  title: string
  description: string | null
  createdAt: Date
}

type Props = {
  boards: Board[]
}

export const BoardList = ({ boards }: Props) => {
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            ボードがありません
          </h3>
          <p className="text-muted-foreground">
            新しいボードを作成して、タスクの管理を始めましょう。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map(board => (
        <Link
          key={board.id}
          href={`/boards/${board.id}`}
          className="group block p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {board.description}
              </p>
            )}
            <div className="text-xs text-muted-foreground">
              作成日: {formatDate(board.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
