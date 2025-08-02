"use client";

import { createColumn } from "@/app/actions/board";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Check, X } from "lucide-react";
import { useState, useTransition } from "react";

type AddColumnButtonProps = {
  boardId: string;
};

const COLOR_OPTIONS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#059669", // green
];

export const AddColumnButton = ({ boardId }: AddColumnButtonProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!title.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("color", selectedColor);
      formData.append("boardId", boardId);

      await createColumn(formData);
      setTitle("");
      setSelectedColor(COLOR_OPTIONS[0]);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setTitle("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="min-w-80 p-4 bg-card border border-border rounded-lg shadow-sm">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="カラム名を入力"
          className="mb-3"
          autoFocus
        />
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">カラー選択</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-foreground" : "border-border"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`色を選択: ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            追加
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            キャンセル
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setIsEditing(true)}
      className="min-w-80 h-full min-h-32 border-dashed border-2 hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
    >
      <Plus className="h-5 w-5" />
      新しいカラムを追加
    </Button>
  );
};