'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createBoard } from '@/app/actions/board'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { Button } from '@/components/ui/Button'
import { CancelButton } from '@/components/ui/CancelButton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { SubmitButton } from '../ui/SubmitButton'
import { Textarea } from '../ui/Textarea'

export const CreateBoardDialog = () => {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    await createBoard(formData)
    setOpen(false)
  }

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
        <FormErrorBoundary onRetry={() => setOpen(false)}>
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
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
