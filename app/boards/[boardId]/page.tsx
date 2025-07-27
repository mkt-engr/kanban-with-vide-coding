import { BoardClient } from "@/components/board/BoardClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { z } from "zod";

const getBoardWithColumns = async (boardId: string) => {
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
};

type BoardPageParams = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageParams) {
  const { boardId } = await params;
  
  // boardIdがUUID形式かどうかをバリデーション
  const boardIdValidation = z.string().uuid().safeParse(boardId);
  if (!boardIdValidation.success) {
    notFound();
  }
  
  const board = await getBoardWithColumns(boardId);

  if (!board) {
    notFound();
  }

  return <BoardClient board={board} />;
}
