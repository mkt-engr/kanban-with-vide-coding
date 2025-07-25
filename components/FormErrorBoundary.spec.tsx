import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FormErrorBoundary } from "./FormErrorBoundary"

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("フォームエラーメッセージ")
  }
  return <div>フォーム内容</div>
}

describe("FormErrorBoundary", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // コンソールエラーを抑制
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it("エラーが発生しない場合は子コンポーネントを表示する", () => {
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={false} />
      </FormErrorBoundary>
    )

    expect(screen.getByText("フォーム内容")).toBeInTheDocument()
  })

  it("エラーが発生した場合はフォーム用のフォールバックUIを表示する", () => {
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    )

    expect(screen.getByText("フォームエラー")).toBeInTheDocument()
    expect(screen.getByText("フォームエラーメッセージ")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument()
  })

  it("onRetryが提供された場合再試行ボタンで実行される", async () => {
    const mockOnRetry = vi.fn()

    render(
      <FormErrorBoundary onRetry={mockOnRetry}>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    )

    const retryButton = screen.getByRole("button", { name: "再試行" })
    await userEvent.click(retryButton)

    expect(mockOnRetry).toHaveBeenCalledOnce()
  })

  it("エラーメッセージがない場合はデフォルトメッセージを表示する", () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error("")
    }

    render(
      <FormErrorBoundary>
        <ThrowErrorWithoutMessage />
      </FormErrorBoundary>
    )

    expect(
      screen.getByText("フォームの処理中にエラーが発生しました")
    ).toBeInTheDocument()
  })
})
