'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  title: string
  status: string
  totalInventory: number
  price: string
  loading?: boolean
}

export default function ProductCard({
  title,
  status,
  totalInventory,
  price,
  loading = false
}: ProductCardProps) {
  
  const isLowStock = totalInventory < 10
  
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    if (statusLower === 'draft') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }

  if (loading) {
    return (
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Product Name */}
      <td className="px-6 py-4">
        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
          {title}
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {totalInventory}
          </span>
          {isLowStock && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              Low
            </Badge>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ${price}
        </p>
      </td>
    </tr>
  )
}