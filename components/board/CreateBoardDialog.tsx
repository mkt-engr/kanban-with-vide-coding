'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createBoard } from '@/app/actions/board';
import { Button } from '@/components/ui/Button';
import { CancelButton } from '@/components/ui/CancelButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Textarea } from '@/components/ui/Textarea';

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      await createBoard(formData);
      setOpen(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          新規ボード作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいボードを作成</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              placeholder="ボードのタイトルを入力してください"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="ボードの説明を入力してください（任意）"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <CancelButton onClick={() => setOpen(false)}>
              キャンセル
            </CancelButton>
            <SubmitButton loadingText="作成中...">作成</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
