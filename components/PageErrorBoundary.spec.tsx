import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageErrorBoundary } from './PageErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('ページエラーメッセージ')
  }
  return <div>ページ内容</div>
}

// window.location のモック
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
    href: '',
  },
  writable: true,
})

describe('PageErrorBoundary', () => {
  // コンソールエラーを抑制
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  it('エラーが発生しない場合は子コンポーネントを表示する', () => {
    render(
      <PageErrorBoundary>
        <ThrowError shouldThrow={false} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('ページ内容')).toBeInTheDocument()
  })

  it('エラーが発生した場合はページ用のフォールバックUIを表示する', () => {
    render(
      <PageErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    )

    expect(
      screen.getByText('ページの読み込みに失敗しました')
    ).toBeInTheDocument()
    expect(screen.getByText('ページエラーメッセージ')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ページを再読み込み' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ホームに戻る' })
    ).toBeInTheDocument()
  })

  it('ページを再読み込みボタンをクリックするとページが再読み込みされる', async () => {
    const user = userEvent.setup()
    const reloadSpy = vi.spyOn(window.location, 'reload')

    render(
      <PageErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', {
      name: 'ページを再読み込み',
    })
    await user.click(reloadButton)

    expect(reloadSpy).toHaveBeenCalledOnce()
  })

  it('ホームに戻るボタンをクリックするとホームページに遷移する', async () => {
    const user = userEvent.setup()

    render(
      <PageErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: 'ホームに戻る' })
    await user.click(homeButton)

    expect(window.location.href).toBe('/')
  })

  it('エラーメッセージがない場合はデフォルトメッセージを表示する', () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error('')
    }

    render(
      <PageErrorBoundary>
        <ThrowErrorWithoutMessage />
      </PageErrorBoundary>
    )

    expect(
      screen.getByText(
        '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。'
      )
    ).toBeInTheDocument()
  })

  consoleSpy.mockRestore()
})
