"use client"

import { ReactNode } from "react"
import { ErrorBoundary } from "./ErrorBoundary"

type Props = {
  children: ReactNode
  onRetry?: () => void
}

export const FormErrorBoundary = ({ children, onRetry }: Props) => {
  const fallback = (error: Error) => (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-md font-semibold text-red-800 mb-2">
        フォームエラー
      </h3>
      <p className="text-red-600 text-sm mb-4">
        {error.message || "フォームの処理中にエラーが発生しました"}
      </p>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
      >
        再試行
      </button>
    </div>
  )

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}
