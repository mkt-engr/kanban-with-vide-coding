import { prisma } from "@/lib/prisma";
import { generateUUID } from "@/src/test/uuid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBoard, createTask } from "./board";

// Mocks are automatically set up in setup.ts
const mockPrisma = prisma as typeof prisma & {
  board: { create: ReturnType<typeof vi.fn> };
  column: { createMany: ReturnType<typeof vi.fn> };
  task: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
  };
};
const mockRedirect = vi.mocked(redirect);
const mockRevalidatePath = vi.mocked(revalidatePath);

describe("createBoard Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ボードとデフォルトカラムが正常に作成されること", async () => {
    const mockBoard = { id: generateUUID(), title: "テストボード" };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append("title", "テストボード");
    formData.append("description", "テストの説明");

    await createBoard(formData);

    // Board creation
    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "テストボード",
        description: "テストの説明",
      },
    });

    // Default columns creation
    expect(mockPrisma.column.createMany).toHaveBeenCalledWith({
      data: [
        {
          title: "To Do",
          position: 0,
          color: "#ef4444",
          boardId: generateUUID(),
        },
        {
          title: "In Progress",
          position: 1,
          color: "#f59e0b",
          boardId: generateUUID(),
        },
        {
          title: "Done",
          position: 2,
          color: "#10b981",
          boardId: generateUUID(),
        },
      ],
    });

    // Redirect
    expect(mockRedirect).toHaveBeenCalledWith("/boards/board-123");
  });

  it("説明が空の場合のボード作成を処理できること", async () => {
    const mockBoard = { id: "board-456", title: "タイトルのみ" };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append("title", "タイトルのみ");
    formData.append("description", "");

    await createBoard(formData);

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "タイトルのみ",
        description: null,
      },
    });
  });

  it("無効なタイトルの場合エラーが発生すること", async () => {
    const formData = new FormData();
    formData.append("title", ""); // Empty title
    formData.append("description", "テストの説明");

    await expect(createBoard(formData)).rejects.toThrow();
  });

  it("ボード作成時のデータベースエラーを処理できること", async () => {
    mockPrisma.board.create.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("title", "テストボード");

    await expect(createBoard(formData)).rejects.toThrow("Database error");
  });

  it("カラム作成時のデータベースエラーを処理できること", async () => {
    const mockBoard = { id: "board-789", title: "テストボード" };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockRejectedValue(
      new Error("Column creation failed")
    );

    const formData = new FormData();
    formData.append("title", "テストボード");

    await expect(createBoard(formData)).rejects.toThrow(
      "Column creation failed"
    );
  });

  it("説明が提供されない場合にnullでボードが作成されること", async () => {
    const mockBoard = { id: "board-null", title: "タイトルのみ" };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append("title", "タイトルのみ");
    // description not appended

    await createBoard(formData);

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "タイトルのみ",
        description: null,
      },
    });
  });
});

describe("createTask Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タスクが正常に作成されること", async () => {
    const mockTask = {
      id: "task-123",
      title: "テストタスク",
      position: 0,
      column: { boardId: "board-123" },
    };
    mockPrisma.task.findFirst.mockResolvedValue(null);
    mockPrisma.task.create.mockResolvedValue(mockTask);

    const formData = new FormData();
    formData.append("title", "テストタスク");
    formData.append("description", "テストの説明");
    formData.append("priority", "HIGH");
    formData.append("dueDate", "2023-12-31");
    formData.append("columnId", "column-123");

    await createTask(formData);

    expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
      where: { columnId: "column-123" },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: {
        title: "テストタスク",
        description: "テストの説明",
        priority: "HIGH",
        dueDate: new Date("2023-12-31"),
        columnId: "column-123",
        position: 0,
      },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/boards/board-123");
  });

  it("既存タスクがある場合、正しいポジションでタスクが作成されること", async () => {
    const existingTask = { position: 2 };
    const mockTask = { column: { boardId: "board-123" } };
    mockPrisma.task.findFirst.mockResolvedValue(existingTask);
    mockPrisma.task.create.mockResolvedValue(mockTask);

    const formData = new FormData();
    formData.append("title", "新しいタスク");
    formData.append("priority", "MEDIUM");
    formData.append("columnId", "column-123");

    await createTask(formData);

    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: {
        title: "新しいタスク",
        description: null,
        priority: "MEDIUM",
        dueDate: null,
        columnId: "column-123",
        position: 3,
      },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });
  });

  it("必須フィールドのみでタスクが作成されること", async () => {
    const mockTask = { column: { boardId: "board-123" } };
    mockPrisma.task.findFirst.mockResolvedValue(null);
    mockPrisma.task.create.mockResolvedValue(mockTask);

    const formData = new FormData();
    formData.append("title", "最小限のタスク");
    formData.append("priority", "MEDIUM");
    formData.append("columnId", "column-123");

    await createTask(formData);

    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: {
        title: "最小限のタスク",
        description: null,
        priority: "MEDIUM",
        dueDate: null,
        columnId: "column-123",
        position: 0,
      },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });
  });

  it("無効なタイトルの場合エラーが発生すること", async () => {
    const formData = new FormData();
    formData.append("title", "");
    formData.append("columnId", "column-123");

    await expect(createTask(formData)).rejects.toThrow();
  });

  it("無効なcolumnIdの場合エラーが発生すること", async () => {
    const formData = new FormData();
    formData.append("title", "テストタスク");
    formData.append("columnId", "");

    await expect(createTask(formData)).rejects.toThrow();
  });

  it("位置取得時のデータベースエラーを処理できること", async () => {
    mockPrisma.task.findFirst.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("title", "テストタスク");
    formData.append("priority", "MEDIUM");
    formData.append("columnId", "column-123");

    await expect(createTask(formData)).rejects.toThrow("Database error");
  });

  it("タスク作成時のデータベースエラーを処理できること", async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null);
    mockPrisma.task.create.mockRejectedValue(new Error("Task creation failed"));

    const formData = new FormData();
    formData.append("title", "テストタスク");
    formData.append("priority", "MEDIUM");
    formData.append("columnId", "column-123");

    await expect(createTask(formData)).rejects.toThrow("Task creation failed");
  });
});
