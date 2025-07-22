import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BoardPage from './page'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

const mockPrisma = prisma as typeof prisma & {
  board: { findUnique: ReturnType<typeof vi.fn> }
}
const mockNotFound = vi.mocked(notFound)

describe('BoardPage', () => {
  const mockBoard = {
    id: 'board-1',
    title: 'テストボード',
    description: 'テストの説明',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        position: 0,
        color: '#ef4444',
        tasks: [
          {
            id: 'task-1',
            title: 'タスク1',
            description: 'タスク1の説明',
            priority: 'HIGH',
            dueDate: new Date('2024-12-31'),
          },
          {
            id: 'task-2',
            title: 'タスク2',
            description: null,
            priority: 'MEDIUM',
            dueDate: null,
          },
        ],
      },
      {
        id: 'col-2',
        title: 'In Progress',
        position: 1,
        color: '#f59e0b',
        tasks: [],
      },
      {
        id: 'col-3',
        title: 'Done',
        position: 2,
        color: '#10b981',
        tasks: [
          {
            id: 'task-3',
            title: '完了タスク',
            description: '完了したタスク',
            priority: 'LOW',
            dueDate: new Date('2024-01-01'),
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ボード情報が正しく表示されること', async () => {
    mockPrisma.board.findUnique.mockResolvedValue(mockBoard)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    // Board title and description
    expect(screen.getByText('テストボード')).toBeInTheDocument()
    expect(screen.getByText('テストの説明')).toBeInTheDocument()
  })

  it('全てのカラムが正しいタスク数で表示されること', async () => {
    mockPrisma.board.findUnique.mockResolvedValue(mockBoard)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    // Column titles
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()

    // Task counts
    expect(screen.getByText('(2)')).toBeInTheDocument() // To Do column
    expect(screen.getByText('(0)')).toBeInTheDocument() // In Progress column
    expect(screen.getByText('(1)')).toBeInTheDocument() // Done column
  })

  it('タスクが正しい情報で表示されること', async () => {
    mockPrisma.board.findUnique.mockResolvedValue(mockBoard)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    // Tasks in To Do column
    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク1の説明')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText(new Date('2024-12-31').toLocaleDateString())).toBeInTheDocument()

    expect(screen.getByText('タスク2')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()

    // Task in Done column
    expect(screen.getByText('完了タスク')).toBeInTheDocument()
    expect(screen.getByText('完了したタスク')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
    expect(screen.getByText(new Date('2024-01-01').toLocaleDateString())).toBeInTheDocument()
  })

  it('説明のないボードを処理できること', async () => {
    const boardWithoutDescription = {
      ...mockBoard,
      description: null,
    }
    mockPrisma.board.findUnique.mockResolvedValue(boardWithoutDescription)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    expect(screen.getByText('テストボード')).toBeInTheDocument()
    expect(screen.queryByText('テストの説明')).not.toBeInTheDocument()
  })

  it('空のカラムを処理できること', async () => {
    const boardWithEmptyColumns = {
      ...mockBoard,
      columns: [
        {
          id: 'col-1',
          title: 'Empty Column',
          position: 0,
          color: '#ef4444',
          tasks: [],
        },
      ],
    }
    mockPrisma.board.findUnique.mockResolvedValue(boardWithEmptyColumns)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    expect(screen.getByText('Empty Column')).toBeInTheDocument()
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })

  it('ボードが存在しない場合notFoundが呼ばれること', async () => {
    mockPrisma.board.findUnique.mockResolvedValue(null)

    await expect(BoardPage({ params: Promise.resolve({ boardId: 'nonexistent' }) })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('データベースエラーを処理できること', async () => {
    mockPrisma.board.findUnique.mockRejectedValue(new Error('Database error'))

    await expect(BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })).rejects.toThrow('Database error')
  })

  it('説明や期限のないタスクを表示できること', async () => {
    const boardWithMinimalTask = {
      ...mockBoard,
      columns: [
        {
          id: 'col-1',
          title: 'Test Column',
          position: 0,
          color: '#ef4444',
          tasks: [
            {
              id: 'task-minimal',
              title: 'Minimal Task',
              description: null,
              priority: 'URGENT',
              dueDate: null,
            },
          ],
        },
      ],
    }
    mockPrisma.board.findUnique.mockResolvedValue(boardWithMinimalTask)

    const component = await BoardPage({ params: Promise.resolve({ boardId: 'board-1' }) })
    render(component)

    expect(screen.getByText('Minimal Task')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
    // Description and due date should not be rendered
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('正しいパラメータでprismaが呼ばれること', async () => {
    mockPrisma.board.findUnique.mockResolvedValue(mockBoard)

    await BoardPage({ params: Promise.resolve({ boardId: 'test-board-id' }) })

    expect(mockPrisma.board.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-board-id' },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    })
  })
})