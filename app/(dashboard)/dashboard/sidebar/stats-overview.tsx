'use client'

import MetricCard from './metric-card'
import { LucideIcon } from 'lucide-react'

export interface Stat {
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
}

interface StatsOverviewProps {
  stats: Stat[]
  columns?: 1 | 2 | 3 | 4
  loading?: boolean
}

export default function StatsOverview({ 
  stats, 
  columns = 4,
  loading = false 
}: StatsOverviewProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {Array.from({ length: columns }).map((_, i) => (
          <MetricCard
            key={i}
            title=""
            value=""
            loading={true}
          />
        ))}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No stats available</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          iconColor={stat.iconColor}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  )
}