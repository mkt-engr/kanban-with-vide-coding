"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createBoardSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().nullable().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().min(1, "カラムIDは必須です"),
});

export async function createBoard(formData: FormData) {
  const parseResult = createBoardSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parseResult.success) {
    throw new Error(`バリデーションエラー: ${parseResult.error.message}`);
  }
  const validatedData = parseResult.data;

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

export async function createTask(formData: FormData) {
  const parseResult = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    columnId: formData.get("columnId"),
  });
  if (!parseResult.success) {
    throw new Error(`バリデーションエラー: ${parseResult.error.message}`);
  }
  const validatedData = parseResult.data;

  const maxPosition = await prisma.task.findFirst({
    where: { columnId: validatedData.columnId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const newPosition = (maxPosition?.position ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title: validatedData.title,
      description: validatedData.description || null,
      priority: validatedData.priority,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      columnId: validatedData.columnId,
      position: newPosition,
    },
    include: {
      column: {
        select: {
          boardId: true,
        },
      },
    },
  });

  revalidatePath(`/boards/${task.column.boardId}`);
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
