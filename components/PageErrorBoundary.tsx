'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type Props = {
  children: ReactNode
}

export const PageErrorBoundary = ({ children }: Props) => {
  const fallback = (error: Error) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-semibold text-red-800 mb-4">
        ページの読み込みに失敗しました
      </h2>
      <p className="text-red-600 text-center mb-6 max-w-md">
        {error.message ||
          '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          ページを再読み込み
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}
