"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createBoardSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().nullable().optional(),
});

export async function createBoard(formData: FormData) {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | null,
  };

  const validatedData = createBoardSchema.parse(rawData);

  const board = await prisma.board.create({
    data: {
      title: validatedData.title,
      description: validatedData.description || null,
    },
  });

  const defaultColumns = [
    { title: "To Do", position: 0, color: "#ef4444" },
    { title: "In Progress", position: 1, color: "#f59e0b" },
    { title: "Done", position: 2, color: "#10b981" },
  ];

  await prisma.column.createMany({
    data: defaultColumns.map((column) => ({
      ...column,
      boardId: board.id,
    })),
  });

  redirect(`/boards/${board.id}`);
}

export async function getBoards() {
  const boards = await prisma.board.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });

  return boards;
}
