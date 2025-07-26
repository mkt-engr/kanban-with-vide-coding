import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AddTaskDialog } from "./AddTaskDialog";

vi.mock("@/app/actions/board", () => ({
  createTask: vi.fn(),
}));

const { createTask } = vi.hoisted(() => ({
  createTask: vi.fn(),
}));

describe("AddTaskDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ダイアログトリガーボタンが表示される", () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    expect(triggerButton).toBeInTheDocument();
  });

  it("ボタンクリックでダイアログが開く", async () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    await userEvent.click(triggerButton);

    expect(screen.getByText("新しいタスクを作成")).toBeInTheDocument();
    expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();
    expect(screen.getByLabelText("説明")).toBeInTheDocument();
    expect(screen.getByLabelText("優先度")).toBeInTheDocument();
    expect(screen.getByLabelText("期限")).toBeInTheDocument();
  });

  it("必須フィールドが入力されていない場合は送信されない", async () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    await userEvent.click(triggerButton);

    const submitButton = screen.getByRole("button", { name: "作成" });
    await userEvent.click(submitButton);

    expect(createTask).not.toHaveBeenCalled();
  });

  it("フォームに入力できること", async () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    await userEvent.click(triggerButton);

    const titleInput = screen.getByLabelText("タイトル *");
    const descriptionInput = screen.getByLabelText("説明");
    const prioritySelect = screen.getByLabelText("優先度");
    const dueDateInput = screen.getByLabelText("期限");

    await userEvent.click(titleInput);
    await userEvent.paste("テストタスク");
    await userEvent.click(descriptionInput);
    await userEvent.paste("テスト説明");
    await userEvent.selectOptions(prioritySelect, "HIGH");
    await userEvent.click(dueDateInput);
    await userEvent.paste("2023-12-31");

    expect(titleInput).toHaveValue("テストタスク");
    expect(descriptionInput).toHaveValue("テスト説明");
    expect(prioritySelect).toHaveValue("HIGH");
    expect(dueDateInput).toHaveValue("2023-12-31");
  });

  it("キャンセルボタンでダイアログが閉じる", async () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    await userEvent.click(triggerButton);

    expect(screen.getByText("新しいタスクを作成")).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);

    expect(screen.queryByText("新しいタスクを作成")).not.toBeInTheDocument();
  });

  it("優先度のデフォルト値が「中」である", async () => {
    render(<AddTaskDialog columnId="test-column-id" />);

    const triggerButton = screen.getByRole("button", { name: "タスクを追加" });
    await userEvent.click(triggerButton);

    const prioritySelect = screen.getByLabelText("優先度") as HTMLSelectElement;
    expect(prioritySelect.value).toBe("MEDIUM");
  });
});
