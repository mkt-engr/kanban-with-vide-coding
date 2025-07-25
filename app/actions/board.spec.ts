import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createBoard } from './board';

// Mocks are automatically set up in setup.ts
const mockPrisma = prisma as typeof prisma & {
  board: { create: ReturnType<typeof vi.fn> };
  column: { createMany: ReturnType<typeof vi.fn> };
};
const mockRedirect = vi.mocked(redirect);

describe('createBoard Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ボードとデフォルトカラムが正常に作成されること', async () => {
    const mockBoard = { id: 'board-123', title: 'テストボード' };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append('title', 'テストボード');
    formData.append('description', 'テストの説明');

    await createBoard(formData);

    // Board creation
    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'テストボード',
        description: 'テストの説明',
      },
    });

    // Default columns creation
    expect(mockPrisma.column.createMany).toHaveBeenCalledWith({
      data: [
        { title: 'To Do', position: 0, color: '#ef4444', boardId: 'board-123' },
        {
          title: 'In Progress',
          position: 1,
          color: '#f59e0b',
          boardId: 'board-123',
        },
        { title: 'Done', position: 2, color: '#10b981', boardId: 'board-123' },
      ],
    });

    // Redirect
    expect(mockRedirect).toHaveBeenCalledWith('/boards/board-123');
  });

  it('説明が空の場合のボード作成を処理できること', async () => {
    const mockBoard = { id: 'board-456', title: 'タイトルのみ' };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append('title', 'タイトルのみ');
    formData.append('description', '');

    await createBoard(formData);

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'タイトルのみ',
        description: null,
      },
    });
  });

  it('無効なタイトルの場合エラーが発生すること', async () => {
    const formData = new FormData();
    formData.append('title', ''); // Empty title
    formData.append('description', 'テストの説明');

    await expect(createBoard(formData)).rejects.toThrow();
  });

  it('ボード作成時のデータベースエラーを処理できること', async () => {
    mockPrisma.board.create.mockRejectedValue(new Error('Database error'));

    const formData = new FormData();
    formData.append('title', 'テストボード');

    await expect(createBoard(formData)).rejects.toThrow('Database error');
  });

  it('カラム作成時のデータベースエラーを処理できること', async () => {
    const mockBoard = { id: 'board-789', title: 'テストボード' };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockRejectedValue(
      new Error('Column creation failed')
    );

    const formData = new FormData();
    formData.append('title', 'テストボード');

    await expect(createBoard(formData)).rejects.toThrow(
      'Column creation failed'
    );
  });

  it('説明が提供されない場合にnullでボードが作成されること', async () => {
    const mockBoard = { id: 'board-null', title: 'タイトルのみ' };
    mockPrisma.board.create.mockResolvedValue(mockBoard);
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 });

    const formData = new FormData();
    formData.append('title', 'タイトルのみ');
    // description not appended

    await createBoard(formData);

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'タイトルのみ',
        description: null,
      },
    });
  });
});
