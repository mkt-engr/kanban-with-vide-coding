import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "./PriorityBadge";

describe("PriorityBadge", () => {
  test("LOW優先度で正しい表示とスタイルが適用される", () => {
    render(<PriorityBadge priority="LOW" />);
    
    const badge = screen.getByText("低");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-gray-100", "text-gray-700");
  });

  test("MEDIUM優先度で正しい表示とスタイルが適用される", () => {
    render(<PriorityBadge priority="MEDIUM" />);
    
    const badge = screen.getByText("中");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-blue-100", "text-blue-700");
  });

  test("HIGH優先度で正しい表示とスタイルが適用される", () => {
    render(<PriorityBadge priority="HIGH" />);
    
    const badge = screen.getByText("高");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-orange-100", "text-orange-700");
  });

  test("URGENT優先度で正しい表示とスタイルが適用される", () => {
    render(<PriorityBadge priority="URGENT" />);
    
    const badge = screen.getByText("緊急");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-100", "text-red-700");
  });

  test("カスタムclassNameが適用される", () => {
    render(<PriorityBadge priority="HIGH" className="custom-class" />);
    
    const badge = screen.getByText("高");
    expect(badge).toHaveClass("custom-class");
  });
});