import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getBoardWithColumns(boardId: string) {
  try {
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
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return null;
  }
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{task.priority.toLowerCase()}</span>
                    {task.dueDate && (
                      <span>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}