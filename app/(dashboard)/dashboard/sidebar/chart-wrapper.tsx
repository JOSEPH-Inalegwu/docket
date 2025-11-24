'use client'

import { ReactNode } from 'react'

interface ChartWrapperProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  loading?: boolean
  height?: string // Tailwind height class
}

export default function ChartWrapper({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  height = 'h-64 sm:h-80',
}: ChartWrapperProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
          <div className="space-y-2">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-40 animate-pulse" />
            {subtitle && (
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-44 sm:w-56 animate-pulse" />
            )}
          </div>
        </div>
        <div className={`${height} bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse`} />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className={`${height} w-full overflow-hidden`}>
        {children}
      </div>
    </div>
  )
}
