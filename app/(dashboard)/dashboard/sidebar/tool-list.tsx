'use client'

import { useEffect } from 'react'
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

  const toolsWithStatus = tools.map((tool) => ({
    ...tool,
    isConnected: isConnected(tool.id),
  }))

  return (
    <nav className="space-y-1">
      {toolsWithStatus.map((tool) => (
        <ToolItem 
          key={tool.id} 
          tool={tool} 
          onToolClick={onToolClick}
        />
      ))}
    </nav>
  )
}