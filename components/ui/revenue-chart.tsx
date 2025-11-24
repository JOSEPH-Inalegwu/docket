"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface RevenueChartProps {
  data: { date: string; revenue: number; orderCount: number }[]
  isLoading: boolean
  days: 30 | 90
  onDaysChange: (days: 30 | 90) => void
}

export function RevenueChart({
  data,
  isLoading,
  days,
  onDaysChange,
}: RevenueChartProps) {
  if (isLoading) {
    // loading block unchanged
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  // Simple breakpoint check (optional, can also use a hook)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  const axisFontSize = isMobile ? 9 : 11
  const legendFontSize = isMobile ? 10 : 12

  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-sm sm:text-lg font-semibold">
          Revenue & Orders
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={days === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDaysChange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={days === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDaysChange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      <div className="h-56 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="date"
              tick={{ fill: 'currentColor', fontSize: axisFontSize }}
              // you can also tweak dy/angle here for very small screens
            />

            <YAxis
              yAxisId="left"
              tick={{ fill: 'currentColor', fontSize: axisFontSize }}
              label={{
                value: 'Revenue ($)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: axisFontSize },
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'currentColor', fontSize: axisFontSize }}
              label={{
                value: 'Orders',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: axisFontSize },
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: isMobile ? 10 : 12,
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [`$${value.toFixed(2)}`, 'Revenue']
                }
                return [value, 'Orders']
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: legendFontSize }}
              iconSize={isMobile ? 8 : 12}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#6c47ff"
              strokeWidth={2}
              dot={false}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orderCount"
              stroke="#95BF47"
              strokeWidth={2}
              dot={false}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

