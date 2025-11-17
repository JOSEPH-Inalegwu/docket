'use client'

import { ReactNode } from 'react'

interface ChartWrapperProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  loading?: boolean
  height?: string
}

export default function ChartWrapper({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  height = 'h-80'
}: ChartWrapperProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            {subtitle && <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56 animate-pulse"></div>}
          </div>
        </div>
        <div className={`${height} bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse`}></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className={height}>
        {children}
      </div>
    </div>
  )
}