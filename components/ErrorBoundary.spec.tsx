import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("テストエラーメッセージ");
  }
  return <div>正常なコンテンツ</div>;
};

describe("ErrorBoundary", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // コンソールエラーを抑制
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("エラーが発生しない場合は子コンポーネントを表示する", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("正常なコンテンツ")).toBeInTheDocument();
  });

  it("エラーが発生した場合はフォールバックUIを表示する", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("何か問題が発生しました")).toBeInTheDocument();
    expect(screen.getByText("テストエラーメッセージ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("再試行ボタンをクリックすると状態がリセットされる", async () => {
    const TestComponent = ({
      shouldThrow,
      key,
    }: {
      shouldThrow: boolean;
      key: string;
    }) => (
      <ErrorBoundary key={key}>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    const { rerender } = render(
      <TestComponent shouldThrow={true} key="error" />
    );

    expect(screen.getByText("何か問題が発生しました")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "再試行" });
    await userEvent.click(retryButton);

    rerender(<TestComponent shouldThrow={false} key="success" />);

    expect(screen.getByText("正常なコンテンツ")).toBeInTheDocument();
  });

  it("カスタムフォールバックが提供された場合はそれを使用する", () => {
    const customFallback = (error: Error) => (
      <div>カスタムエラー: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("カスタムエラー: テストエラーメッセージ")
    ).toBeInTheDocument();
  });
});
