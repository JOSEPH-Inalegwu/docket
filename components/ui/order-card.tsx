'use client'

import { Badge } from '@/components/ui/badge'

interface OrderCardProps {
  orderNumber: string
  customerName: string
  email: string
  totalPrice: string
  financialStatus: string
  fulfillmentStatus: string
  createdAt: string
  loading?: boolean
}

export default function OrderCard({
  orderNumber,
  customerName,
  email,
  totalPrice,
  financialStatus,
  fulfillmentStatus,
  createdAt,
  loading = false
}: OrderCardProps) {
  
  const getFinancialStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('paid')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (statusLower.includes('refunded')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }

  const getFulfillmentStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('fulfilled')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    if (statusLower.includes('unfulfilled')) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    if (statusLower.includes('partial')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Order Number */}
      <td className="px-6 py-4">
        <p className="font-semibold text-gray-900 dark:text-white">
          {orderNumber}
        </p>
      </td>

      {/* Customer */}
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {customerName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {email}
          </p>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(createdAt)}
        </p>
      </td>

      {/* Payment Status */}
      <td className="px-6 py-4">
        <Badge className={getFinancialStatusColor(financialStatus)}>
          {financialStatus}
        </Badge>
      </td>

      {/* Fulfillment Status */}
      <td className="px-6 py-4">
        <Badge className={getFulfillmentStatusColor(fulfillmentStatus)}>
          {fulfillmentStatus || 'Unfulfilled'}
        </Badge>
      </td>

      {/* Total */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ${totalPrice}
        </p>
      </td>
    </tr>
  )
}