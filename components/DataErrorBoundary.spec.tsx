import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataErrorBoundary } from "./DataErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("データ取得エラー");
  }
  return <div>データ内容</div>;
};

// window.location のモック
Object.defineProperty(window, "location", {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

describe("DataErrorBoundary", () => {
  // コンソールエラーを抑制
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  it("エラーが発生しない場合は子コンポーネントを表示する", () => {
    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={false} />
      </DataErrorBoundary>
    );

    expect(screen.getByText("データ内容")).toBeInTheDocument();
  });

  it("エラーが発生した場合はデータ用のフォールバックUIを表示する", () => {
    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    expect(
      screen.getByText("データの読み込みに失敗しました")
    ).toBeInTheDocument();
    expect(screen.getByText("データ取得エラー")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "再読み込み" })
    ).toBeInTheDocument();
  });

  it("onRetryが提供された場合再読み込みボタンで実行される", async () => {
    const user = userEvent.setup();
    const mockOnRetry = vi.fn();

    render(
      <DataErrorBoundary onRetry={mockOnRetry}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    const retryButton = screen.getByRole("button", { name: "再読み込み" });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledOnce();
  });

  it("onRetryが提供されない場合はwindow.location.reloadが実行される", async () => {
    const user = userEvent.setup();
    const reloadSpy = vi.spyOn(window.location, "reload");

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    const retryButton = screen.getByRole("button", { name: "再読み込み" });
    await user.click(retryButton);

    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  it("エラーメッセージがない場合はデフォルトメッセージを表示する", () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error("");
    };

    render(
      <DataErrorBoundary>
        <ThrowErrorWithoutMessage />
      </DataErrorBoundary>
    );

    expect(
      screen.getByText("データの取得中にエラーが発生しました")
    ).toBeInTheDocument();
  });

  consoleSpy.mockRestore();
});
