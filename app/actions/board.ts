"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

export const createBoard = async (formData: FormData) => {
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
};

export const createTask = async (formData: FormData) => {
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
};

const moveTaskSchema = z.object({
  taskId: z.string().min(1, "タスクIDは必須です"),
  destinationColumnId: z.string().min(1, "移動先カラムIDは必須です"),
  newPosition: z.number().min(0, "位置は0以上である必要があります"),
});

export const moveTask = async (formData: FormData) => {
  const parseResult = moveTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    destinationColumnId: formData.get("destinationColumnId"),
    newPosition: parseInt(formData.get("newPosition") as string, 10),
  });

  if (!parseResult.success) {
    throw new Error(`バリデーションエラー: ${parseResult.error.message}`);
  }

  const { taskId, destinationColumnId, newPosition } = parseResult.data;

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      select: { columnId: true, position: true, column: { select: { boardId: true } } },
    });

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    const sourceColumnId = task.columnId;
    const sourcePosition = task.position;

    if (sourceColumnId === destinationColumnId) {
      if (sourcePosition < newPosition) {
        await tx.task.updateMany({
          where: {
            columnId: destinationColumnId,
            position: {
              gt: sourcePosition,
              lte: newPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      } else if (sourcePosition > newPosition) {
        await tx.task.updateMany({
          where: {
            columnId: destinationColumnId,
            position: {
              gte: newPosition,
              lt: sourcePosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      }
    } else {
      await tx.task.updateMany({
        where: {
          columnId: sourceColumnId,
          position: {
            gt: sourcePosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      await tx.task.updateMany({
        where: {
          columnId: destinationColumnId,
          position: {
            gte: newPosition,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    }

    await tx.task.update({
      where: { id: taskId },
      data: {
        columnId: destinationColumnId,
        position: newPosition,
      },
    });

    revalidatePath(`/boards/${task.column.boardId}`);
  });
};

export const getBoards = async () => {
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
};
