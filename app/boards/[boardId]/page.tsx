import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

async function getBoardWithColumns(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  return board;
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const board = await getBoardWithColumns(boardId);

  if (!board) {
    notFound();
  }

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
          {board.title}
        </h1>
        {board.description && (
          <p className="text-muted-foreground">{board.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="bg-card rounded-lg border p-4 min-h-[400px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h2 className="font-semibold text-card-foreground">
                {column.title}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({column.tasks.length})
              </span>
            </div>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-background border rounded-lg p-3 shadow-sm"
                >
                  <h3 className="font-medium mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span className="text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <AddTaskDialog columnId={column.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
