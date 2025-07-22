"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

export const DataErrorBoundary = ({ children, onRetry }: Props) => {
  const fallback = (error: Error) => (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        データの読み込みに失敗しました
      </h3>
      <p className="text-red-600 text-sm mb-4 text-center">
        {error.message || "データの取得中にエラーが発生しました"}
      </p>
      <button
        onClick={onRetry || (() => window.location.reload())}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        再読み込み
      </button>
    </div>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};