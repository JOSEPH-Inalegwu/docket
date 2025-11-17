'use client'

import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error'

interface ConnectionStatusProps {
  status: ConnectionStatus
  lastSync?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ConnectionStatus({ 
  status, 
  lastSync,
  error,
  size = 'md',
  showLabel = true 
}: ConnectionStatusProps) {
  const config = {
    connected: {
      icon: CheckCircle2,
      label: 'Connected',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    disconnected: {
      icon: XCircle,
      label: 'Disconnected',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    pending: {
      icon: Clock,
      label: 'Connecting...',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    error: {
      icon: AlertCircle,
      label: 'Connection Error',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  }

  const sizeConfig = {
    sm: { icon: 'w-3 h-3', text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-3 py-1.5' },
    lg: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-4 py-2' }
  }

  const { icon: Icon, label, color, bgColor, borderColor } = config[status]
  const { icon: iconSize, text: textSize, padding } = sizeConfig[size]

  if (!showLabel) {
    return (
      <div className="relative group">
        <Icon className={`${iconSize} ${color}`} />
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {label}
          {lastSync && status === 'connected' && (
            <div className="text-gray-300 dark:text-gray-400">Last sync: {lastSync}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className={`inline-flex items-center gap-2 ${padding} rounded-full border ${bgColor} ${borderColor} ${textSize}`}>
        <Icon className={`${iconSize} ${color}`} />
        <span className={`font-medium ${color}`}>{label}</span>
      </div>
      
      {status === 'connected' && lastSync && (
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          Last synced: {lastSync}
        </p>
      )}
      
      {status === 'error' && error && (
        <p className="text-xs text-red-600 dark:text-red-400 ml-1">
          {error}
        </p>
      )}
    </div>
  )
}