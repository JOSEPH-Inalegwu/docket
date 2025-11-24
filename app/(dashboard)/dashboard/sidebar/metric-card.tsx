'use client'

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: LucideIcon
  iconColor?: string
  subtitle?: string
  loading?: boolean
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = '#6c47ff',
  subtitle,
  loading = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null

    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      case 'decrease':
        return <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      case 'neutral':
        return <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    }
  }

  const getTrendColor = () => {
    if (!change) return ''
    switch (change.type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'decrease':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24" />
          {Icon && <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />}
        </div>
        <div className="h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {Icon && (
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: iconColor + '20' }}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
          {value}
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {change && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium ${getTrendColor()}`}
          >
            {getTrendIcon()}
            {change.value > 0 ? '+' : ''}
            {change.value}%
          </span>
        )}
        {(subtitle || change?.period) && (
          <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            {subtitle || change?.period}
          </span>
        )}
      </div>
    </div>
  )
}