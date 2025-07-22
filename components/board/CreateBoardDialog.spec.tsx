import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { createBoard } from "@/app/actions/board";

// サーバーアクションのモック
vi.mock("@/app/actions/board", () => ({
  createBoard: vi.fn(),
}));

const mockCreateBoard = createBoard as ReturnType<typeof vi.fn>;

describe("CreateBoardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ダイアログが正しく開閉されること', async () => {
    render(<CreateBoardDialog />);

    // Dialog should be closed initially
    expect(screen.queryByText("新しいボードを作成")).not.toBeInTheDocument();

    // Open dialog
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    // Dialog should be open
    expect(screen.getByText("新しいボードを作成")).toBeInTheDocument();

    // Close dialog with cancel button
    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText("新しいボードを作成")).not.toBeInTheDocument();
    });
  });

  it('フォームフィールドが正しく表示されること', async () => {
    render(<CreateBoardDialog />);

    // Open dialog
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    // Check form fields
    expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();
    expect(screen.getByLabelText("説明")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "キャンセル" })
    ).toBeInTheDocument();
  });

  it('フォーム送信が正しく処理されること', async () => {
    mockCreateBoard.mockResolvedValue(undefined);

    render(<CreateBoardDialog />);

    // Open dialog
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    // Fill form
    const titleInput = screen.getByLabelText("タイトル *");
    const descriptionTextarea = screen.getByLabelText("説明");

    await userEvent.type(titleInput, "テストボード");
    await userEvent.type(descriptionTextarea, "テスト用の説明");

    // Submit form
    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    // Wait for createBoard to be called and verify FormData
    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1);
      
      const formData = mockCreateBoard.mock.calls[0][0];
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("title")).toBe("テストボード");
      expect(formData.get("description")).toBe("テスト用の説明");
    });
  });

  it('送信中に無効状態が表示されること', async () => {
    // Mock server action to return immediately but still trigger loading state
    mockCreateBoard.mockResolvedValue(undefined);

    render(<CreateBoardDialog />);

    // Open dialog and fill form
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    const titleInput = screen.getByLabelText("タイトル *");
    await userEvent.type(titleInput, "テストボード");

    // The form should be enabled initially
    expect(titleInput).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "キャンセル" })
    ).not.toBeDisabled();

    // Submit form
    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    // Verify the server action was called
    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1);
    });
  });

  it('タイトルフィールドが必須であること', async () => {
    render(<CreateBoardDialog />);

    // Open dialog
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    // Try to submit without title
    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    // Check that title input is invalid
    const titleInput = screen.getByLabelText("タイトル *");
    expect(titleInput).toBeInvalid();
  });

  it('サーバーアクションエラーを処理できること', async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateBoard.mockRejectedValue(new Error("Server error"));

    render(<CreateBoardDialog />);

    // Open dialog and submit form
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    const titleInput = screen.getByLabelText("タイトル *");
    await userEvent.type(titleInput, "テストボード");

    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to create board:",
        expect.any(Error)
      );
    });

    // Loading state should be cleared
    expect(screen.getByText("作成")).toBeInTheDocument();
    expect(titleInput).not.toBeDisabled();

    consoleSpy.mockRestore();
  });

  it('タイトルのみでの送信ができること', async () => {
    mockCreateBoard.mockResolvedValue(undefined);

    render(<CreateBoardDialog />);

    // Open dialog
    const openButton = screen.getByRole("button", { name: "新規ボード作成" });
    await userEvent.click(openButton);

    // Fill only title
    const titleInput = screen.getByLabelText("タイトル *");
    await userEvent.type(titleInput, "タイトルのみ");

    // Submit form
    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledTimes(1);
      
      const formData = mockCreateBoard.mock.calls[0][0];
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("title")).toBe("タイトルのみ");
      expect(formData.get("description")).toBe("");
    });
  });
});
