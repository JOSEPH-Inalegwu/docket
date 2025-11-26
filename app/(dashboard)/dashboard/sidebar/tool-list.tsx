'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Add this import
import { tools } from '@/lib/tools-config'
import { Tool } from '@/lib/tools-config'
import ToolItem from './tool-item'
import { useConnections } from '@/hooks/use-connection'

interface ToolListProps {
  onToolClick?: (tool: Tool) => void
  onRefetchReady?: (refetch: () => Promise<void>) => void
}

export default function ToolList({ onToolClick, onRefetchReady }: ToolListProps) {
  const { isConnected, isLoading, refetch } = useConnections()
  const pathname = usePathname() // Add this

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch)
    }
  }, [refetch, onRefetchReady])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Split tools into connectable tools and utility items
  const connectableTools = tools.filter(tool => !tool.isUtility)
  const utilityItems = tools.filter(tool => tool.isUtility)

  const toolsWithStatus = connectableTools.map((tool) => ({
    ...tool,
    isConnected: isConnected(tool.id),
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Connectable tools (with setup UI) */}
      <nav className="space-y-1 flex-1">
        {toolsWithStatus.map((tool) => (
          <ToolItem 
            key={tool.id} 
            tool={tool} 
            onToolClick={onToolClick}
          />
        ))}
      </nav>

      {/* Divider */}
      {utilityItems.length > 0 && (
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
      )}

      {/* Utility items at bottom (with active state highlighting) */}
      <nav className="space-y-1">
        {utilityItems.map((tool) => {
          const Icon = tool.icon
          const isActive = pathname === tool.href
          
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-[#6c47ff]/10 dark:bg-[#6c47ff]/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#6c47ff]' : ''
                }`}
                style={!isActive ? { color: tool.color } : undefined}
              />
              <span className={`text-sm font-medium ${
                isActive
                  ? 'text-[#6c47ff] dark:text-[#6c47ff]'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {tool.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
