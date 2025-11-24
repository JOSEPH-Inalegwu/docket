"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react'

interface QuickStatsProps {
  analytics: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    conversionRate: number
  } | null
  isLoading: boolean
}

export function QuickStats({ analytics, isLoading }: QuickStatsProps) {
  if (isLoading) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Stats</h3>
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
  }


  if (!analytics) {
    return null
  }

  const avgOrderValue = analytics.totalOrders > 0 
    ? analytics.totalRevenue / analytics.totalOrders 
    : 0

  const stats = [
    {
      label: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Total Orders',
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Stats</h3>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
