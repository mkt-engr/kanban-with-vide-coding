"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/app/actions/board";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";
import { Button } from "@/components/ui/Button";
import { CancelButton } from "@/components/ui/CancelButton";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  columnId: string;
};

export const AddTaskDialog = ({ columnId }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    formData.append("columnId", columnId);
    await createTask(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
          <Plus className="h-4 w-4" />
          タスクを追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタスクを作成</DialogTitle>
        </DialogHeader>
        <FormErrorBoundary onRetry={() => setOpen(false)}>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                name="title"
                placeholder="タスクのタイトルを入力してください"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="タスクの説明を入力してください（任意）"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">優先度</Label>
              <Select id="priority" name="priority" defaultValue="MEDIUM">
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
                <option value="URGENT">緊急</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">期限</Label>
              <DatePicker
                id="dueDate"
                name="dueDate"
                placeholder="期限を選択してください（任意）"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <CancelButton onClick={() => setOpen(false)}>
                キャンセル
              </CancelButton>
              <SubmitButton loadingText="作成中...">作成</SubmitButton>
            </div>
          </form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};