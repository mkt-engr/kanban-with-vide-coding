import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBoard } from './board'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Mocks are automatically set up in setup.ts
const mockPrisma = prisma as typeof prisma & {
  board: { create: ReturnType<typeof vi.fn> }
  column: { createMany: ReturnType<typeof vi.fn> }
}
const mockRedirect = redirect as ReturnType<typeof vi.fn>

describe('createBoard Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create board and default columns successfully', async () => {
    const mockBoard = { id: 'board-123', title: 'テストボード' }
    mockPrisma.board.create.mockResolvedValue(mockBoard)
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 })

    const formData = new FormData()
    formData.append('title', 'テストボード')
    formData.append('description', 'テストの説明')

    await createBoard(formData)

    // Board creation
    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'テストボード',
        description: 'テストの説明',
      },
    })

    // Default columns creation
    expect(mockPrisma.column.createMany).toHaveBeenCalledWith({
      data: [
        { title: 'To Do', position: 0, color: '#ef4444', boardId: 'board-123' },
        { title: 'In Progress', position: 1, color: '#f59e0b', boardId: 'board-123' },
        { title: 'Done', position: 2, color: '#10b981', boardId: 'board-123' },
      ],
    })

    // Redirect
    expect(mockRedirect).toHaveBeenCalledWith('/boards/board-123')
  })

  it('should handle board creation with empty description', async () => {
    const mockBoard = { id: 'board-456', title: 'タイトルのみ' }
    mockPrisma.board.create.mockResolvedValue(mockBoard)
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 })

    const formData = new FormData()
    formData.append('title', 'タイトルのみ')
    formData.append('description', '')

    await createBoard(formData)

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'タイトルのみ',
        description: null,
      },
    })
  })

  it('should throw error for invalid title', async () => {
    const formData = new FormData()
    formData.append('title', '') // Empty title
    formData.append('description', 'テストの説明')

    await expect(createBoard(formData)).rejects.toThrow()
  })

  it('should handle database error during board creation', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPrisma.board.create.mockRejectedValue(new Error('Database error'))

    const formData = new FormData()
    formData.append('title', 'テストボード')

    await expect(createBoard(formData)).rejects.toThrow('ボードの作成に失敗しました')
    expect(consoleSpy).toHaveBeenCalledWith('Failed to create board:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should handle database error during column creation', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockBoard = { id: 'board-789', title: 'テストボード' }
    mockPrisma.board.create.mockResolvedValue(mockBoard)
    mockPrisma.column.createMany.mockRejectedValue(new Error('Column creation failed'))

    const formData = new FormData()
    formData.append('title', 'テストボード')

    await expect(createBoard(formData)).rejects.toThrow('ボードの作成に失敗しました')
    expect(consoleSpy).toHaveBeenCalledWith('Failed to create board:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should create board with null description when not provided', async () => {
    const mockBoard = { id: 'board-null', title: 'タイトルのみ' }
    mockPrisma.board.create.mockResolvedValue(mockBoard)
    mockPrisma.column.createMany.mockResolvedValue({ count: 3 })

    const formData = new FormData()
    formData.append('title', 'タイトルのみ')
    // description not appended

    await createBoard(formData)

    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: 'タイトルのみ',
        description: null,
      },
    })
  })
})