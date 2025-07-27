"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { boardSchema } from "@/models/board";
import { taskSchema } from "@/models/task";
import { prioritySchema } from "@/models/priority";

const createBoardSchema = boardSchema.pick({ title: true, description: true });

const createTaskSchema = taskSchema.pick({ title: true, description: true, priority: true, dueDate: true }).extend({
  columnId: z.string().uuid(),
  dueDate: z.string().nullable().optional(),
  priority: prioritySchema.default("MEDIUM"),
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
  taskId: z.string().uuid(),
  destinationColumnId: z.string().uuid(),
  newPosition: z.number().int(),
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

  try {
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          columnId: true,
          position: true,
          column: { select: { boardId: true } },
        },
      });

      if (!task) {
        throw new Error("タスクが見つかりません");
      }

      const sourceColumnId = task.columnId;

      if (sourceColumnId === destinationColumnId) {
        // 同一カラム内での移動
        // カラム内の全タスクを位置順で取得
        const allTasks = await tx.task.findMany({
          where: { columnId: destinationColumnId },
          orderBy: { position: "asc" },
          select: { id: true },
        });

        // 移動するタスクを元の位置から削除
        const tasksWithoutMovingTask = allTasks.filter((t) => t.id !== taskId);

        // newPositionを配列範囲内に調整
        const safeNewPosition = Math.min(
          newPosition,
          tasksWithoutMovingTask.length
        );

        // 新しい位置に移動するタスクを挿入
        tasksWithoutMovingTask.splice(safeNewPosition, 0, { id: taskId });

        // 全タスクの位置を連番で再採番
        for (let i = 0; i < tasksWithoutMovingTask.length; i++) {
          await tx.task.update({
            where: { id: tasksWithoutMovingTask[i].id },
            data: { position: i },
          });
        }
      } else {
        // 異なるカラム間での移動
        // ステップ1: 移動するタスクを一時的な位置(-1)に移動してユニーク制約を回避
        await tx.task.update({
          where: { id: taskId },
          data: { position: -1 },
        });

        // ステップ2: 元のカラムのタスクを再採番
        const sourceTasks = await tx.task.findMany({
          where: {
            columnId: sourceColumnId,
            id: { not: taskId },
          },
          orderBy: { position: "asc" },
          select: { id: true },
        });

        for (let i = 0; i < sourceTasks.length; i++) {
          await tx.task.update({
            where: { id: sourceTasks[i].id },
            data: { position: i },
          });
        }

        // ステップ3: 移動先カラムのタスクを取得
        const destTasks = await tx.task.findMany({
          where: { columnId: destinationColumnId },
          orderBy: { position: "asc" },
          select: { id: true },
        });

        // newPositionを配列範囲内に調整
        const safeNewPosition = Math.min(newPosition, destTasks.length);

        // ステップ4: 移動先カラムで指定位置以降のタスクの位置を1つずつ後ろにずらす
        for (let i = destTasks.length - 1; i >= safeNewPosition; i--) {
          await tx.task.update({
            where: { id: destTasks[i].id },
            data: { position: i + 1 },
          });
        }

        // ステップ5: 移動するタスクを最終的な位置とカラムに配置
        await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: destinationColumnId,
            position: safeNewPosition,
          },
        });
      }

      revalidatePath(`/boards/${task.column.boardId}`);
    });
  } catch (error: unknown) {
    // Prismaのユニーク制約エラーの詳細をログに出力
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const prismaError = error as {
        code: string;
        meta?: { target?: string[]; modelName?: string };
        message: string;
      };
      const target = prismaError.meta?.target;
      const modelName = prismaError.meta?.modelName;

      console.error("ユニーク制約エラーが発生しました:");
      console.error(`- モデル: ${modelName}`);
      console.error(`- 制約フィールド: ${target?.join(", ")}`);
      console.error(`- エラーの詳細: ${prismaError.message}`);
      console.error("- 現在の実行パラメータ:");
      console.error(`  - taskId: ${taskId}`);
      console.error(`  - destinationColumnId: ${destinationColumnId}`);
      console.error(`  - newPosition: ${newPosition}`);

      // 現在のカラム内のタスク状況もログに出力
      try {
        const existingTasks = await prisma.task.findMany({
          where: { columnId: destinationColumnId },
          orderBy: { position: "asc" },
          select: { id: true, position: true, title: true },
        });
        console.error("- 移動先カラムの現在のタスク状況:");
        existingTasks.forEach((task, index) => {
          console.error(
            `  [${index}] id: ${task.id}, position: ${task.position}, title: ${task.title}`
          );
        });
      } catch (logError) {
        console.error("- タスク状況の取得に失敗:", logError);
      }

      throw new Error(
        `タスクの位置が重複しています。columnId: ${destinationColumnId}, position: ${target?.includes("position") ? newPosition : "不明"}`
      );
    }

    // その他のエラーもログに出力
    console.error("タスク移動中にエラーが発生しました:", error);
    throw error;
  }
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
