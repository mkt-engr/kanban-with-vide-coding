'use client'

import { Component, ReactNode } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

type Props = {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

export const ErrorBoundary = class ErrorBoundary extends Component<
  Props,
  ErrorBoundaryState
> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error)
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            何か問題が発生しました
          </h2>
          <p className="text-red-600 text-sm mb-4">
            {this.state.error?.message || '予期しないエラーが発生しました'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
