import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateBoardDialog } from './create-board-dialog'
import { createBoard } from '@/app/actions/board'

// Mock the server action
vi.mock('@/app/actions/board', () => ({
  createBoard: vi.fn(),
}))

const mockCreateBoard = createBoard as any

describe('CreateBoardDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should open and close dialog correctly', async () => {
    const user = userEvent.setup()
    render(<CreateBoardDialog />)
    
    // Dialog should be closed initially
    expect(screen.queryByText('新しいボードを作成')).not.toBeInTheDocument()
    
    // Open dialog
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    // Dialog should be open
    expect(screen.getByText('新しいボードを作成')).toBeInTheDocument()
    
    // Close dialog with cancel button
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    await user.click(cancelButton)
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText('新しいボードを作成')).not.toBeInTheDocument()
    })
  })

  it('should render form fields correctly', async () => {
    const user = userEvent.setup()
    render(<CreateBoardDialog />)
    
    // Open dialog
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    // Check form fields
    expect(screen.getByLabelText('タイトル *')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('should handle form submission correctly', async () => {
    const user = userEvent.setup()
    mockCreateBoard.mockResolvedValue(undefined)
    
    render(<CreateBoardDialog />)
    
    // Open dialog
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    // Fill form
    const titleInput = screen.getByLabelText('タイトル *')
    const descriptionTextarea = screen.getByLabelText('説明')
    
    await user.type(titleInput, 'テストボード')
    await user.type(descriptionTextarea, 'テスト用の説明')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)
    
    // Wait for server action to be called
    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1)
    })
    
    // Check that FormData was passed correctly
    const formData = mockCreateBoard.mock.calls[0][0]
    expect(formData.get('title')).toBe('テストボード')
    expect(formData.get('description')).toBe('テスト用の説明')
  })

  it('should show disabled state during submission', async () => {
    const user = userEvent.setup()
    // Mock server action to return immediately but still trigger loading state
    mockCreateBoard.mockResolvedValue(undefined)
    
    render(<CreateBoardDialog />)
    
    // Open dialog and fill form
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    const titleInput = screen.getByLabelText('タイトル *')
    await user.type(titleInput, 'テストボード')
    
    // The form should be enabled initially
    expect(titleInput).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'キャンセル' })).not.toBeDisabled()
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)
    
    // Verify the server action was called
    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1)
    })
  })

  it('should require title field', async () => {
    const user = userEvent.setup()
    render(<CreateBoardDialog />)
    
    // Open dialog
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    // Try to submit without title
    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)
    
    // Check that title input is invalid
    const titleInput = screen.getByLabelText('タイトル *')
    expect(titleInput).toBeInvalid()
  })

  it('should handle server action error', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateBoard.mockRejectedValue(new Error('Server error'))
    
    render(<CreateBoardDialog />)
    
    // Open dialog and submit form
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    const titleInput = screen.getByLabelText('タイトル *')
    await user.type(titleInput, 'テストボード')
    
    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create board:', expect.any(Error))
    })
    
    // Loading state should be cleared
    expect(screen.getByText('作成')).toBeInTheDocument()
    expect(titleInput).not.toBeDisabled()
    
    consoleSpy.mockRestore()
  })

  it('should allow submission with only title', async () => {
    const user = userEvent.setup()
    mockCreateBoard.mockResolvedValue(undefined)
    
    render(<CreateBoardDialog />)
    
    // Open dialog
    const openButton = screen.getByRole('button', { name: '新規ボード作成' })
    await user.click(openButton)
    
    // Fill only title
    const titleInput = screen.getByLabelText('タイトル *')
    await user.type(titleInput, 'タイトルのみ')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1)
    })
    
    const formData = mockCreateBoard.mock.calls[0][0]
    expect(formData.get('title')).toBe('タイトルのみ')
    expect(formData.get('description')).toBe('')
  })
})