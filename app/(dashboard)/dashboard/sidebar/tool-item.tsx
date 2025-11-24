'use client'

import { Tool } from '@/lib/tools-config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ToolItemProps {
  tool: Tool
  onToolClick?: (tool: Tool) => void
}

export default function ToolItem({ tool, onToolClick }: ToolItemProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(tool.href)

  const Icon = tool.icon

  const handleMainClick = (e: React.MouseEvent) => {
    // If tool is not connected, prevent navigation and trigger modal
    if (!tool.isConnected) {
      e.preventDefault()
      onToolClick?.(tool)
      return
    }
  }

  const renderMainContent = () => (
    <div
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg
        transition-all duration-200 group cursor-pointer
        ${isActive 
          ? 'bg-[#6c47ff]/10 text-[#6c47ff] dark:bg-[#6c47ff]/20' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
      onClick={handleMainClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <div 
          className={`
            p-2 rounded-lg transition-colors
            ${isActive ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}
          `}
          style={{ 
            backgroundColor: isActive ? tool.color + '20' : undefined 
          }}
        >
          <Icon 
            className="w-4 h-4" 
            style={{ 
              color: isActive ? tool.color : undefined 
            }}
          />
        </div>
        
        <span className="font-medium text-sm">{tool.name}</span>
      </div>

      {/* Connection Status Badge */}
      {!tool.isConnected && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          Setup
        </span>
      )}
    </div>
  )

  return (
    <div>
      {/* Main Tool Item */}
      {tool.isConnected ? (
        <Link href={tool.href}>
          {renderMainContent()}
        </Link>
      ) : (
        renderMainContent()
      )}
    </div>
  )
}
